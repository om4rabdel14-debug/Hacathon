const { analyzeWasteImage } = require('./gemini.client');
const { transformGeminiResponse } = require('./transformers/geminiResponse.transformer');
const calculatePriority = require('../../core/utils/calculatePriority');
const logger = require('../../config/logger');

/**
 * Full analysis pipeline: Gemini analysis -> transform -> priority calculation.
 *
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} mimeType - Image MIME type
 * @param {string} description - Citizen description
 * @param {Object} [contextFactors] - Optional business context for priority
 * @returns {Object} Complete analysis with priority
 */
async function analyzeReport(imageBuffer, mimeType, description, contextFactors = {}) {
  logger.info('Starting AI analysis pipeline...');

  // Step 1: Get raw analysis from Gemini
  const rawAnalysis = await analyzeWasteImage(imageBuffer, mimeType, description);

  // Step 2: Validate and normalize the response
  const analysis = transformGeminiResponse(rawAnalysis);

  // Step 3: Calculate priority score
  const priority = calculatePriority(analysis, contextFactors);

  logger.info('AI analysis complete', {
    issue_type: analysis.issue_type,
    severity: analysis.severity,
    priority_score: priority.score,
    priority_level: priority.level,
    is_valid: analysis.is_valid_waste_report,
  });

  return {
    ...analysis,
    priority_score: priority.score,
    priority_level: priority.level,
  };
}

module.exports = { analyzeReport };
