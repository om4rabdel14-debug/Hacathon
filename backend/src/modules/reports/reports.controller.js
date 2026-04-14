const reportsService = require('./reports.service');
const { success } = require('../../core/utils/buildApiResponse');

async function submitReport(req, res) {
  const report = await reportsService.createReport(req.file, req.body);
  res.status(201).json(success(report, 'Report submitted and analyzed successfully'));
}

async function getReport(req, res) {
  const report = await reportsService.getReport(req.params.id);
  res.json(success(report));
}

async function trackReport(req, res) {
  const report = await reportsService.trackReport(req.params.id);
  res.json(success(report));
}

async function getReportTimeline(req, res) {
  const timeline = await reportsService.getReportTimeline(req.params.id);
  res.json(success(timeline));
}

async function getDuplicateReports(req, res) {
  const duplicates = await reportsService.getDuplicateReports(req.params.id);
  res.json(success(duplicates));
}

async function submitFeedback(req, res) {
  const feedback = await reportsService.submitFeedback(req.params.id, req.body);
  res.status(201).json(success(feedback, 'Citizen feedback submitted successfully'));
}

async function getFeedbackSummary(req, res) {
  const summary = await reportsService.getFeedbackSummary(req.params.id);
  res.json(success(summary));
}

async function getEscalation(req, res) {
  const escalation = await reportsService.getEscalation(req.params.id);
  res.json(success(escalation));
}

module.exports = {
  submitReport,
  getReport,
  trackReport,
  getReportTimeline,
  getDuplicateReports,
  submitFeedback,
  getFeedbackSummary,
  getEscalation,
};
