/**
 * Dashboard data transfer object shapes.
 */

/**
 * @typedef {Object} DashboardStatsDTO
 * @property {number} total
 * @property {Object} by_status
 * @property {Object} by_priority
 * @property {number} today
 * @property {number} pending
 * @property {number} active
 * @property {number} resolved
 * @property {number} urgent
 */

/**
 * @typedef {Object} PaginatedReportsDTO
 * @property {Array<ReportDTO>} data
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 * @property {number} totalPages
 */

module.exports = {};
