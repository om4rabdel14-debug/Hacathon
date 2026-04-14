/**
 * Map a report DB row to the public API response shape.
 */
function toReportResponse(report) {
  return {
    id: report.id,
    image_url: report.image_url,
    description: report.description,
    location: {
      lat: report.lat,
      lng: report.lng,
      address: report.address,
    },
    citizen_name: report.citizen_name,
    analysis: {
      issue_type: report.issue_type,
      severity: report.severity,
      confidence: report.confidence,
      ai_summary: report.ai_summary,
      severity_explanation: report.severity_explanation,
      recommended_department: report.recommended_department,
    },
    priority: {
      score: report.priority_score,
      level: report.priority_level,
    },
    status: report.status,
    assigned_department: report.assigned_department,
    created_at: report.created_at,
    updated_at: report.updated_at,
    // Optional fields from joins
    timeline: report.timeline || undefined,
    resolution_images: report.resolution_images || undefined,
  };
}

/**
 * Map a list of reports to summary format for tables.
 */
function toReportSummary(report) {
  return {
    id: report.id,
    image_url: report.image_url,
    issue_type: report.issue_type,
    severity: report.severity,
    priority_score: report.priority_score,
    priority_level: report.priority_level,
    status: report.status,
    assigned_department: report.assigned_department,
    address: report.address,
    created_at: report.created_at,
  };
}

module.exports = { toReportResponse, toReportSummary };
