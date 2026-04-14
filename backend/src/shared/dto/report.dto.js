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
 * @property {string} duplicate_of_report_id
 * @property {number} submission_count
 * @property {string} sla_due_at
 * @property {number} escalation_level
 * @property {string} escalation_stage
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} TrackingDTO
 * @property {ReportDTO} report
 * @property {Array<TimelineEntryDTO>} timeline
 * @property {Array<ResolutionImageDTO>} resolution_images
 * @property {Array<ReportDTO>} merged_reports
 * @property {FeedbackSummaryDTO} feedback_summary
 * @property {EscalationDTO} escalation
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

/**
 * @typedef {Object} FeedbackSummaryDTO
 * @property {number} total_reviews
 * @property {number|null} average_rating
 * @property {number} resolved_confirmed_count
 * @property {number} unresolved_count
 * @property {number|null} satisfaction_rate
 * @property {string|null} latest_review_at
 */

/**
 * @typedef {Object} EscalationDTO
 * @property {number} level
 * @property {string} stage
 * @property {string} label
 * @property {number} overdue_days
 * @property {string|null} due_at
 * @property {string|null} next_escalation_at
 * @property {boolean} is_overdue
 * @property {boolean} is_closed
 */

module.exports = {};
