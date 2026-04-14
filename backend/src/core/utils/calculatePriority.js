const { ISSUE_TYPES } = require('../constants/issueTypes');

const SEVERITY_BASE_SCORES = {
  low: 1,
  medium: 3,
  high: 5,
  critical: 7,
};

const DANGEROUS_TYPES = {
  [ISSUE_TYPES.BURNING_WASTE]: 3,
  [ISSUE_TYPES.ILLEGAL_DUMPING]: 1,
  [ISSUE_TYPES.CONSTRUCTION_DEBRIS]: 1,
};

/**
 * Calculate hybrid priority score combining AI analysis with business rules.
 *
 * @param {Object} aiAnalysis - AI analysis result
 * @param {string} aiAnalysis.severity - low/medium/high/critical
 * @param {number} aiAnalysis.confidence - 0.0 to 1.0
 * @param {string} aiAnalysis.issue_type - waste type classification
 * @param {Object} [contextFactors] - Additional business context
 * @param {boolean} [contextFactors.nearSensitiveArea] - Near school/hospital
 * @param {boolean} [contextFactors.repeatedArea] - Multiple reports in area
 * @param {boolean} [contextFactors.delayed] - Report has been pending long
 * @returns {{ score: number, level: string }}
 */
function calculatePriority(aiAnalysis, contextFactors = {}) {
  let score = SEVERITY_BASE_SCORES[aiAnalysis.severity] || 1;

  // Confidence bonus
  if (aiAnalysis.confidence > 0.9) score += 1;

  // Dangerous waste type bonus
  if (DANGEROUS_TYPES[aiAnalysis.issue_type]) {
    score += DANGEROUS_TYPES[aiAnalysis.issue_type];
  }

  // Context-based bonuses (can be expanded)
  if (contextFactors.nearSensitiveArea) score += 2;
  if (contextFactors.repeatedArea) score += 2;
  if (contextFactors.delayed) score += 1;

  // Clamp to 1-10
  score = Math.max(1, Math.min(10, score));

  // Determine level
  let level;
  if (score <= 3) level = 'low';
  else if (score <= 6) level = 'medium';
  else if (score <= 8) level = 'high';
  else level = 'urgent';

  return { score, level };
}

module.exports = calculatePriority;
