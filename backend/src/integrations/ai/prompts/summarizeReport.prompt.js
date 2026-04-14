function buildSummaryPrompt(reportData) {
  return `Summarize this waste report for a municipality worker in 1-2 clear sentences:

Issue Type: ${reportData.issue_type}
Severity: ${reportData.severity}
Location: ${reportData.address || `Coordinates: ${reportData.lat}, ${reportData.lng}`}
Citizen Description: "${reportData.description}"

Provide a concise, actionable summary focusing on what the worker needs to know. Respond with only the summary text, no JSON.`;
}

module.exports = { buildSummaryPrompt };
