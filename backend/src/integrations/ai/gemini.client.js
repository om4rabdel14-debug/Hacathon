const { getModel } = require('../../config/gemini');
const logger = require('../../config/logger');
const parseGeminiJson = require('../../core/utils/parseGeminiJson');
const { buildAnalysisPrompt } = require('./prompts/analyzeWaste.prompt');

/**
 * Analyze a waste image using Gemini Vision.
 *
 * @param {Buffer} imageBuffer - The image file buffer
 * @param {string} mimeType - Image MIME type (e.g., 'image/jpeg')
 * @param {string} description - Citizen's text description
 * @returns {Object} Parsed analysis result
 */
async function analyzeWasteImage(imageBuffer, mimeType, description) {
  const model = getModel();
  const prompt = buildAnalysisPrompt(description);

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType,
    },
  };

  try {
    logger.debug('Sending image to Gemini for analysis...');

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    logger.debug('Gemini raw response received', { length: responseText.length });

    const parsed = parseGeminiJson(responseText);
    return parsed;
  } catch (error) {
    logger.error('Gemini analysis failed, attempting retry...', { error: error.message });

    // Retry with a simpler prompt
    try {
      const simplePrompt = `Analyze this waste image. The citizen described it as: "${description}".
Return JSON with: is_valid_waste_report (boolean), issue_type (string), severity (string: low/medium/high/critical), confidence (number 0-1), summary (string), severity_explanation (string), recommended_department (string). Only respond with JSON.`;

      const result = await model.generateContent([simplePrompt, imagePart]);
      const responseText = result.response.text();
      return parseGeminiJson(responseText);
    } catch (retryError) {
      logger.error('Gemini retry also failed', { error: retryError.message });
      throw new Error(`AI analysis failed: ${retryError.message}`);
    }
  }
}

module.exports = { analyzeWasteImage };
