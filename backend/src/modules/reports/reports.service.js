const reportsRepository = require('./reports.repository');
const { uploadReportImage } = require('../../integrations/storage/storage.service');
const { analyzeReport } = require('../../integrations/ai/aiAnalysis.service');
const { REPORT_STATUSES } = require('../../core/constants/reportStatus');
const NotFoundError = require('../../core/errors/NotFoundError');
const BadRequestError = require('../../core/errors/BadRequestError');
const logger = require('../../config/logger');

/**
 * Create a new waste report with AI analysis (synchronous flow).
 */
async function createReport(file, reportData) {
  if (!file) {
    throw new BadRequestError('Image file is required');
  }

  logger.info('Creating new report...', { citizen: reportData.citizen_name });

  // Step 1: Upload image to Supabase Storage
  const imageUrl = await uploadReportImage(file.buffer, file.mimetype);
  logger.debug('Image uploaded', { imageUrl });

  // Step 2: Insert initial report with status 'submitted'
  const report = await reportsRepository.insert({
    image_url: imageUrl,
    description: reportData.description,
    lat: reportData.lat,
    lng: reportData.lng,
    address: reportData.address || null,
    citizen_name: reportData.citizen_name || 'Anonymous',
    citizen_email: reportData.citizen_email || null,
    status: REPORT_STATUSES.SUBMITTED,
  });

  // Insert initial timeline entry
  await reportsRepository.insertTimelineEntry({
    report_id: report.id,
    old_status: null,
    new_status: REPORT_STATUSES.SUBMITTED,
    note: 'Report submitted by citizen',
    changed_by: 'citizen',
  });

  // Step 3: Update status to analyzing
  await reportsRepository.update(report.id, { status: REPORT_STATUSES.ANALYZING });
  await reportsRepository.insertTimelineEntry({
    report_id: report.id,
    old_status: REPORT_STATUSES.SUBMITTED,
    new_status: REPORT_STATUSES.ANALYZING,
    note: 'AI analysis started',
    changed_by: 'system',
  });

  // Step 4: Run AI analysis (synchronous ~3s)
  try {
    const analysis = await analyzeReport(file.buffer, file.mimetype, reportData.description);

    // Step 5: Update report with AI results
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
      status: analysis.is_valid_waste_report
        ? REPORT_STATUSES.ASSIGNED
        : REPORT_STATUSES.REJECTED,
    });

    // Step 6: Add timeline entry for analysis completion
    const newStatus = analysis.is_valid_waste_report
      ? REPORT_STATUSES.ASSIGNED
      : REPORT_STATUSES.REJECTED;

    await reportsRepository.insertTimelineEntry({
      report_id: report.id,
      old_status: REPORT_STATUSES.ANALYZING,
      new_status: newStatus,
      note: analysis.is_valid_waste_report
        ? `AI analysis complete. Classified as ${analysis.issue_type} with ${analysis.severity} severity. Assigned to ${analysis.recommended_department}.`
        : 'Report rejected: Not a valid waste report based on AI analysis.',
      changed_by: 'ai',
    });

    logger.info('Report created and analyzed successfully', { id: report.id });
    return updatedReport;
  } catch (aiError) {
    // If AI fails, keep report in submitted state so it can be manually reviewed
    logger.error('AI analysis failed, report saved without analysis', { error: aiError.message });

    await reportsRepository.update(report.id, { status: REPORT_STATUSES.SUBMITTED });
    await reportsRepository.insertTimelineEntry({
      report_id: report.id,
      old_status: REPORT_STATUSES.ANALYZING,
      new_status: REPORT_STATUSES.SUBMITTED,
      note: 'AI analysis failed. Report requires manual review.',
      changed_by: 'system',
    });

    return reportsRepository.findByIdWithDetails(report.id);
  }
}

/**
 * Get a report by ID.
 */
async function getReport(id) {
  const report = await reportsRepository.findByIdWithDetails(id);
  if (!report) throw new NotFoundError('Report not found');
  return report;
}

/**
 * Get report with full tracking info (timeline + resolution images).
 */
async function trackReport(id) {
  const report = await reportsRepository.findForTracking(id);
  if (!report) throw new NotFoundError('Report not found');
  return report;
}

/**
 * Get timeline for a report.
 */
async function getReportTimeline(id) {
  const report = await reportsRepository.findByIdWithDetails(id);
  if (!report) throw new NotFoundError('Report not found');
  return reportsRepository.getTimeline(id);
}

module.exports = { createReport, getReport, trackReport, getReportTimeline };
