/**
 * Parse JSON from Gemini response text.
 * Gemini sometimes wraps JSON in markdown code fences.
 */
function parseGeminiJson(text) {
  let cleaned = text.trim();

  // Remove markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Try to extract JSON object from the text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error(`Failed to parse Gemini response as JSON: ${err.message}`);
  }
}

module.exports = parseGeminiJson;
