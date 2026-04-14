/**
 * Report data transfer object shapes.
 * Documents the API response structure.
 */

/**
 * @typedef {Object} ReportDTO
 * @property {string} id
 * @property {string} image_url
 * @property {string} description
 * @property {number} lat
 * @property {number} lng
 * @property {string} address
 * @property {string} citizen_name
 * @property {string} issue_type
 * @property {string} severity
 * @property {number} confidence
 * @property {string} ai_summary
 * @property {string} severity_explanation
 * @property {string} recommended_department
 * @property {number} priority_score
 * @property {string} priority_level
 * @property {string} status
 * @property {string} assigned_department
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} TrackingDTO
 * @property {ReportDTO} report
 * @property {Array<TimelineEntryDTO>} timeline
 * @property {Array<ResolutionImageDTO>} resolution_images
 */

/**
 * @typedef {Object} TimelineEntryDTO
 * @property {string} id
 * @property {string} report_id
 * @property {string} old_status
 * @property {string} new_status
 * @property {string} note
 * @property {string} changed_by
 * @property {string} changed_at
 */

/**
 * @typedef {Object} ResolutionImageDTO
 * @property {string} id
 * @property {string} report_id
 * @property {string} image_url
 * @property {string} caption
 * @property {string} uploaded_at
 */

module.exports = {};
