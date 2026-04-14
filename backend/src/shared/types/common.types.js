/**
 * Common type definitions (JSDoc).
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} message
 * @property {*} data
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {boolean} success
 * @property {Array} data
 * @property {Object} pagination
 * @property {number} pagination.total
 * @property {number} pagination.page
 * @property {number} pagination.limit
 * @property {number} pagination.totalPages
 */

module.exports = {};
