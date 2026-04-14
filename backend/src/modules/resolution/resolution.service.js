const resolutionRepository = require('./resolution.repository');
const reportsRepository = require('../reports/reports.repository');
const { uploadResolutionImage } = require('../../integrations/storage/storage.service');
const { isValidTransition } = require('../../core/constants/reportStatus');
const NotFoundError = require('../../core/errors/NotFoundError');
const BadRequestError = require('../../core/errors/BadRequestError');
const logger = require('../../config/logger');

/**
 * Update the status of a report.
 */
async function updateStatus(reportId, newStatus, note, changedBy) {
  // Get current report
  const report = await reportsRepository.findByIdOptional(reportId);
  if (!report) throw new NotFoundError('Report not found');
  if (report.duplicate_of_report_id) {
    throw new BadRequestError('Merged duplicate submissions cannot be updated directly. Update the primary report instead.');
  }

  // Validate status transition
  if (!isValidTransition(report.status, newStatus)) {
    throw new BadRequestError(
      `Invalid status transition from "${report.status}" to "${newStatus}"`
    );
  }

  // Update report status
  const updated = await resolutionRepository.updateReportStatus(reportId, {
    status: newStatus,
    resolved_at: newStatus === 'resolved' ? new Date().toISOString() : report.resolved_at,
    next_escalation_at: ['resolved', 'rejected'].includes(newStatus) ? null : report.next_escalation_at,
    escalation_stage: newStatus === 'resolved'
      ? 'closed_resolved'
      : newStatus === 'rejected'
        ? 'rejected'
        : report.escalation_stage,
  });

  // Insert timeline entry
  await resolutionRepository.insertTimelineEntry({
    report_id: reportId,
    old_status: report.status,
    new_status: newStatus,
    note: note || `Status changed to ${newStatus}`,
    changed_by: changedBy || 'admin',
  });

  logger.info('Report status updated', { reportId, from: report.status, to: newStatus });
  return updated;
}

/**
 * Add a note to the report timeline without changing status.
 */
async function addNote(reportId, note, changedBy) {
  const report = await reportsRepository.findByIdOptional(reportId);
  if (!report) throw new NotFoundError('Report not found');
  if (report.duplicate_of_report_id) {
    throw new BadRequestError('Add notes to the primary report, not the merged duplicate submission.');
  }

  const entry = await resolutionRepository.insertTimelineEntry({
    report_id: reportId,
    old_status: report.status,
    new_status: report.status,
    note,
    changed_by: changedBy || 'admin',
  });

  logger.info('Note added to report', { reportId });
  return entry;
}

/**
 * Upload a resolution (proof of fix) image.
 */
async function uploadResolutionPhoto(reportId, file, caption) {
  const report = await reportsRepository.findByIdOptional(reportId);
  if (!report) throw new NotFoundError('Report not found');
  if (report.duplicate_of_report_id) {
    throw new BadRequestError('Upload resolution images to the primary report, not the merged duplicate submission.');
  }

  if (!file) throw new BadRequestError('Image file is required');

  // Upload to storage
  const imageUrl = await uploadResolutionImage(reportId, file.buffer, file.mimetype);

  // Insert record
  const record = await resolutionRepository.insertResolutionImage({
    report_id: reportId,
    image_url: imageUrl,
    caption: caption || null,
  });

  // Add timeline entry
  await resolutionRepository.insertTimelineEntry({
    report_id: reportId,
    old_status: report.status,
    new_status: report.status,
    note: 'Resolution image uploaded' + (caption ? `: ${caption}` : ''),
    changed_by: 'admin',
  });

  logger.info('Resolution image uploaded', { reportId, imageUrl });
  return record;
}

module.exports = { updateStatus, addNote, uploadResolutionPhoto };
