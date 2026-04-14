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
  const report = await reportsRepository.findById(reportId);
  if (!report) throw new NotFoundError('Report not found');

  // Validate status transition
  if (!isValidTransition(report.status, newStatus)) {
    throw new BadRequestError(
      `Invalid status transition from "${report.status}" to "${newStatus}"`
    );
  }

  // Update report status
  const updated = await resolutionRepository.updateReportStatus(reportId, {
    status: newStatus,
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
  const report = await reportsRepository.findById(reportId);
  if (!report) throw new NotFoundError('Report not found');

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
  const report = await reportsRepository.findById(reportId);
  if (!report) throw new NotFoundError('Report not found');

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
