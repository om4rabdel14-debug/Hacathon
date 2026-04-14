const reportsRepository = require('./reports.repository');
const { uploadReportImage } = require('../../integrations/storage/storage.service');
const { analyzeReport } = require('../../integrations/ai/aiAnalysis.service');
const { REPORT_STATUSES } = require('../../core/constants/reportStatus');
const {
  ESCALATION_STEPS,
  calculateSlaDueAt,
  getEscalationSnapshot,
} = require('../../core/constants/escalation');
const NotFoundError = require('../../core/errors/NotFoundError');
const BadRequestError = require('../../core/errors/BadRequestError');
const logger = require('../../config/logger');
const { resolveAddressFromCoordinates } = require('../../integrations/maps/googleMaps.client');

function normalizeOptionalString(value) {
  if (typeof value !== 'string') return value ?? null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

async function ensureReportExists(reportId) {
  const report = await reportsRepository.findByIdOptional(reportId);
  if (!report) throw new NotFoundError('Report not found');
  return report;
}

async function getCanonicalReport(report) {
  if (!report?.duplicate_of_report_id) {
    return report;
  }

  const primaryReport = await reportsRepository.findByIdOptional(report.duplicate_of_report_id);
  if (!primaryReport) {
    throw new NotFoundError('Primary report not found');
  }

  return primaryReport;
}

async function ensureSlaFields(report) {
  if (!report?.priority_level || report.sla_due_at) {
    return report;
  }

  const slaDueAt = calculateSlaDueAt(report.priority_level, report.created_at);
  return reportsRepository.update(report.id, {
    sla_due_at: slaDueAt,
    next_escalation_at: slaDueAt,
  });
}

async function syncEscalationState(reportOrId) {
  let report = typeof reportOrId === 'string'
    ? await ensureReportExists(reportOrId)
    : reportOrId;

  report = await ensureSlaFields(report);

  const escalation = getEscalationSnapshot(report);
  const currentLevel = report.escalation_level || 0;
  const updates = {};

  if (currentLevel !== escalation.level) {
    updates.escalation_level = escalation.level;
  }

  if ((report.escalation_stage || 'none') !== escalation.stage) {
    updates.escalation_stage = escalation.stage;
  }

  if ((report.next_escalation_at || null) !== (escalation.next_escalation_at || null)) {
    updates.next_escalation_at = escalation.next_escalation_at;
  }

  if (escalation.level > currentLevel) {
    const now = new Date().toISOString();
    updates.last_escalated_at = now;

    for (let level = currentLevel + 1; level <= escalation.level; level += 1) {
      const step = ESCALATION_STEPS.find((item) => item.level === level);
      if (!step) continue;

      await reportsRepository.insertEscalation({
        report_id: report.id,
        level,
        stage: step.key,
        note: `Automatically escalated to ${step.label}`,
      });

      await reportsRepository.insertTimelineEntry({
        report_id: report.id,
        old_status: report.status,
        new_status: report.status,
        note: `Escalation advanced to ${step.label}`,
        changed_by: 'system',
      });
    }
  }

  if (!Object.keys(updates).length) {
    return { report, escalation };
  }

  const updatedReport = await reportsRepository.update(report.id, updates);
  return { report: updatedReport, escalation };
}

async function buildReportDetails(reportId) {
  const requestedReport = await ensureReportExists(reportId);
  const primaryReport = await getCanonicalReport(requestedReport);
  const { report: syncedPrimaryReport, escalation } = await syncEscalationState(primaryReport);

  const [mergedReports, feedbackSummary, escalationHistory] = await Promise.all([
    reportsRepository.getDuplicates(syncedPrimaryReport.id),
    reportsRepository.getFeedbackSummary(syncedPrimaryReport.id),
    reportsRepository.getEscalationHistory(syncedPrimaryReport.id),
  ]);

  return {
    ...(requestedReport.duplicate_of_report_id ? requestedReport : syncedPrimaryReport),
    primary_report: requestedReport.duplicate_of_report_id ? syncedPrimaryReport : undefined,
    merged_reports: syncedPrimaryReport.id === requestedReport.id ? mergedReports : undefined,
    feedback_summary: feedbackSummary,
    escalation,
    escalation_history: escalationHistory,
  };
}

function buildSubmissionResponse(report, escalation, metadata = {}) {
  return {
    ...report,
    escalation,
    duplicate_detected: Boolean(metadata.duplicate_detected),
    primary_report_id: metadata.primary_report_id || report.id,
    submission_id: metadata.submission_id || report.id,
  };
}

async function mergeDuplicateReport({ report, analysis, duplicateCandidate }) {
  const primaryReport = await ensureSlaFields(duplicateCandidate);
  const now = new Date().toISOString();

  await reportsRepository.incrementSubmissionCount(primaryReport.id);

  const mergedSubmission = await reportsRepository.update(report.id, {
    issue_type: analysis.issue_type,
    severity: analysis.severity,
    confidence: analysis.confidence,
    ai_summary: analysis.summary,
    severity_explanation: analysis.severity_explanation,
    recommended_department: analysis.recommended_department,
    priority_score: analysis.priority_score,
    priority_level: analysis.priority_level,
    assigned_department: primaryReport.assigned_department || analysis.recommended_department,
    status: REPORT_STATUSES.MERGED,
    duplicate_of_report_id: primaryReport.id,
    merged_at: now,
    sla_due_at: primaryReport.sla_due_at,
    next_escalation_at: null,
    escalation_level: 0,
    escalation_stage: 'merged',
  });

  await reportsRepository.insertTimelineEntry({
    report_id: report.id,
    old_status: REPORT_STATUSES.ANALYZING,
    new_status: REPORT_STATUSES.MERGED,
    note: `Merged into existing report ${primaryReport.id} after duplicate detection.`,
    changed_by: 'system',
  });

  const refreshedPrimary = await reportsRepository.findByIdWithDetails(primaryReport.id);
  await reportsRepository.insertTimelineEntry({
    report_id: primaryReport.id,
    old_status: refreshedPrimary.status,
    new_status: refreshedPrimary.status,
    note: `A new citizen report was merged into this case. Total submissions: ${refreshedPrimary.submission_count}.`,
    changed_by: 'system',
  });

  const { report: syncedPrimary, escalation } = await syncEscalationState(refreshedPrimary);

  logger.info('Duplicate report merged', {
    submissionId: mergedSubmission.id,
    primaryReportId: syncedPrimary.id,
  });

  return buildSubmissionResponse(syncedPrimary, escalation, {
    duplicate_detected: true,
    primary_report_id: syncedPrimary.id,
    submission_id: mergedSubmission.id,
  });
}

/**
 * Create a new waste report with AI analysis and duplicate detection.
 */
async function createReport(file, reportData) {
  if (!file) {
    throw new BadRequestError('Image file is required');
  }

  logger.info('Creating new report...', { citizen: reportData.citizen_name });

  const resolvedAddress = reportData.address
    || await resolveAddressFromCoordinates(reportData.lat, reportData.lng);

  const imageUrl = await uploadReportImage(file.buffer, file.mimetype);
  logger.debug('Image uploaded', { imageUrl });

  const report = await reportsRepository.insert({
    image_url: imageUrl,
    description: reportData.description,
    lat: reportData.lat,
    lng: reportData.lng,
    address: resolvedAddress,
    citizen_name: reportData.citizen_name || 'Anonymous',
    citizen_email: normalizeOptionalString(reportData.citizen_email),
    status: REPORT_STATUSES.SUBMITTED,
    submission_count: 1,
  });

  await reportsRepository.insertTimelineEntry({
    report_id: report.id,
    old_status: null,
    new_status: REPORT_STATUSES.SUBMITTED,
    note: 'Report submitted by citizen',
    changed_by: 'citizen',
  });

  await reportsRepository.update(report.id, { status: REPORT_STATUSES.ANALYZING });
  await reportsRepository.insertTimelineEntry({
    report_id: report.id,
    old_status: REPORT_STATUSES.SUBMITTED,
    new_status: REPORT_STATUSES.ANALYZING,
    note: 'AI analysis started',
    changed_by: 'system',
  });

  try {
    const analysis = await analyzeReport(file.buffer, file.mimetype, reportData.description);

    if (!analysis.is_valid_waste_report) {
      const rejectedReport = await reportsRepository.update(report.id, {
        issue_type: analysis.issue_type,
        severity: analysis.severity,
        confidence: analysis.confidence,
        ai_summary: analysis.summary,
        severity_explanation: analysis.severity_explanation,
        recommended_department: analysis.recommended_department,
        priority_score: analysis.priority_score,
        priority_level: analysis.priority_level,
        assigned_department: analysis.recommended_department,
        status: REPORT_STATUSES.REJECTED,
        escalation_stage: 'rejected',
        next_escalation_at: null,
      });

      await reportsRepository.insertTimelineEntry({
        report_id: report.id,
        old_status: REPORT_STATUSES.ANALYZING,
        new_status: REPORT_STATUSES.REJECTED,
        note: 'Report rejected: Not a valid waste report based on AI analysis.',
        changed_by: 'ai',
      });

      return buildSubmissionResponse(rejectedReport, getEscalationSnapshot(rejectedReport));
    }

    const duplicateCandidate = await reportsRepository.findDuplicateCandidate({
      lat: reportData.lat,
      lng: reportData.lng,
      issueType: analysis.issue_type,
      excludeReportId: report.id,
    });

    if (duplicateCandidate) {
      return mergeDuplicateReport({ report, analysis, duplicateCandidate });
    }

    const slaDueAt = calculateSlaDueAt(analysis.priority_level, report.created_at);
    const updatedReport = await reportsRepository.update(report.id, {
      issue_type: analysis.issue_type,
      severity: analysis.severity,
      confidence: analysis.confidence,
      ai_summary: analysis.summary,
      severity_explanation: analysis.severity_explanation,
      recommended_department: analysis.recommended_department,
      priority_score: analysis.priority_score,
      priority_level: analysis.priority_level,
      assigned_department: analysis.recommended_department,
      status: REPORT_STATUSES.ASSIGNED,
      sla_due_at: slaDueAt,
      next_escalation_at: slaDueAt,
      escalation_level: 0,
      escalation_stage: 'on_time',
    });

    await reportsRepository.insertTimelineEntry({
      report_id: report.id,
      old_status: REPORT_STATUSES.ANALYZING,
      new_status: REPORT_STATUSES.ASSIGNED,
      note: `AI analysis complete. Classified as ${analysis.issue_type} with ${analysis.severity} severity. Assigned to ${analysis.recommended_department}.`,
      changed_by: 'ai',
    });

    const { report: syncedReport, escalation } = await syncEscalationState(updatedReport);

    logger.info('Report created and analyzed successfully', { id: report.id });
    return buildSubmissionResponse(syncedReport, escalation);
  } catch (aiError) {
    logger.error('AI analysis failed, report saved without analysis', { error: aiError.message });

    await reportsRepository.update(report.id, {
      status: REPORT_STATUSES.SUBMITTED,
      escalation_stage: 'analysis_failed',
      next_escalation_at: null,
    });

    await reportsRepository.insertTimelineEntry({
      report_id: report.id,
      old_status: REPORT_STATUSES.ANALYZING,
      new_status: REPORT_STATUSES.SUBMITTED,
      note: 'AI analysis failed. Report requires manual review.',
      changed_by: 'system',
    });

    const savedReport = await reportsRepository.findByIdWithDetails(report.id);
    return buildSubmissionResponse(savedReport, getEscalationSnapshot(savedReport));
  }
}

async function getReport(id) {
  return buildReportDetails(id);
}

async function trackReport(id) {
  const requestedReport = await ensureReportExists(id);
  const primaryReport = await getCanonicalReport(requestedReport);
  const { report: syncedPrimary, escalation } = await syncEscalationState(primaryReport);
  const tracking = await reportsRepository.findForTracking(syncedPrimary.id);
  const [mergedReports, feedbackSummary, escalationHistory] = await Promise.all([
    reportsRepository.getDuplicates(syncedPrimary.id),
    reportsRepository.getFeedbackSummary(syncedPrimary.id),
    reportsRepository.getEscalationHistory(syncedPrimary.id),
  ]);

  return {
    ...tracking,
    requested_report: requestedReport.id === syncedPrimary.id ? undefined : requestedReport,
    is_duplicate_submission: requestedReport.id !== syncedPrimary.id,
    merged_reports: mergedReports,
    feedback_summary: feedbackSummary,
    escalation,
    escalation_history: escalationHistory,
  };
}

async function getReportTimeline(id) {
  const report = await ensureReportExists(id);
  const primaryReport = await getCanonicalReport(report);
  return reportsRepository.getTimeline(primaryReport.id);
}

async function getDuplicateReports(id) {
  const report = await ensureReportExists(id);
  const primaryReport = await getCanonicalReport(report);
  return reportsRepository.getDuplicates(primaryReport.id);
}

async function submitFeedback(id, feedbackData) {
  const requestedReport = await ensureReportExists(id);
  const primaryReport = await getCanonicalReport(requestedReport);

  if (primaryReport.status !== REPORT_STATUSES.RESOLVED) {
    throw new BadRequestError('Feedback can only be submitted after the issue is resolved');
  }

  const feedback = await reportsRepository.insertFeedback({
    report_id: primaryReport.id,
    submission_report_id: requestedReport.id,
    citizen_name: normalizeOptionalString(feedbackData.citizen_name)
      || requestedReport.citizen_name,
    citizen_email: normalizeOptionalString(feedbackData.citizen_email)
      || normalizeOptionalString(requestedReport.citizen_email),
    rating: feedbackData.rating,
    resolved_confirmed: feedbackData.resolved_confirmed,
    comment: normalizeOptionalString(feedbackData.comment),
  });

  await reportsRepository.insertTimelineEntry({
    report_id: primaryReport.id,
    old_status: primaryReport.status,
    new_status: primaryReport.status,
    note: feedback.resolved_confirmed
      ? `Citizen feedback received: resolution confirmed with rating ${feedback.rating}/5.`
      : `Citizen feedback received: issue still unresolved, rating ${feedback.rating}/5.`,
    changed_by: feedback.citizen_email || feedback.citizen_name || 'citizen',
  });

  return feedback;
}

async function getFeedbackSummary(id) {
  const report = await ensureReportExists(id);
  const primaryReport = await getCanonicalReport(report);
  return reportsRepository.getFeedbackSummary(primaryReport.id);
}

async function getEscalation(id) {
  const report = await ensureReportExists(id);
  const primaryReport = await getCanonicalReport(report);
  const { report: syncedReport, escalation } = await syncEscalationState(primaryReport);
  const history = await reportsRepository.getEscalationHistory(syncedReport.id);

  return {
    report_id: syncedReport.id,
    current: escalation,
    history,
    sla_due_at: syncedReport.sla_due_at,
    last_escalated_at: syncedReport.last_escalated_at,
  };
}

module.exports = {
  createReport,
  getReport,
  trackReport,
  getReportTimeline,
  getDuplicateReports,
  submitFeedback,
  getFeedbackSummary,
  getEscalation,
  syncEscalationState,
};
