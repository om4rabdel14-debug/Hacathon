const notificationsRepository = require('./notifications.repository');
const logger = require('../../config/logger');

/**
 * Get all notifications (status updates) for a report.
 * Used by the citizen tracking page.
 */
async function getNotifications(reportId) {
  return notificationsRepository.getNotificationsForReport(reportId);
}

/**
 * Log a notification event (for future expansion: email, SMS, push).
 */
function notifyStatusChange(reportId, oldStatus, newStatus) {
  logger.info('Notification: status change', { reportId, oldStatus, newStatus });
  // Future: send email/SMS to citizen if citizen_email exists
}

module.exports = { getNotifications, notifyStatusChange };
