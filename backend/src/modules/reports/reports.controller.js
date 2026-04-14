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

module.exports = { submitReport, getReport, trackReport, getReportTimeline };
