const { ISSUE_TYPE_LIST, ISSUE_TYPES } = require('../../../core/constants/issueTypes');
const { SEVERITY_LIST, SEVERITY_LEVELS } = require('../../../core/constants/severityLevels');
const { DEPARTMENT_ROUTING } = require('../../../core/constants/departments');

/**
 * Validate and normalize the raw Gemini response to ensure all fields
 * are present and have valid values.
 */
function transformGeminiResponse(raw) {
  const result = {
    is_valid_waste_report: Boolean(raw.is_valid_waste_report),
    issue_type: ISSUE_TYPE_LIST.includes(raw.issue_type)
      ? raw.issue_type
      : ISSUE_TYPES.INVALID,
    severity: SEVERITY_LIST.includes(raw.severity)
      ? raw.severity
      : SEVERITY_LEVELS.LOW,
    confidence: typeof raw.confidence === 'number'
      ? Math.max(0, Math.min(1, raw.confidence))
      : 0.5,
    summary: typeof raw.summary === 'string' && raw.summary.length > 0
      ? raw.summary
      : 'Unable to generate summary for this report.',
    severity_explanation: typeof raw.severity_explanation === 'string'
      ? raw.severity_explanation
      : 'Severity determined based on image and description analysis.',
    recommended_department: raw.recommended_department || null,
  };

  // If invalid report, force low severity and invalid type
  if (!result.is_valid_waste_report) {
    result.issue_type = ISSUE_TYPES.INVALID;
    result.severity = SEVERITY_LEVELS.LOW;
    result.recommended_department = null;
  }

  // If no department set, derive from issue type
  if (!result.recommended_department && result.issue_type !== ISSUE_TYPES.INVALID) {
    result.recommended_department = DEPARTMENT_ROUTING[result.issue_type] || null;
  }

  return result;
}

module.exports = { transformGeminiResponse };
