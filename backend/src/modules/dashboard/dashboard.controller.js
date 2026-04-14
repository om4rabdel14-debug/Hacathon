const dashboardService = require('./dashboard.service');
const { success, paginated } = require('../../core/utils/buildApiResponse');

async function getStats(req, res) {
  const stats = await dashboardService.getStats();
  res.json(success(stats, 'Dashboard statistics retrieved'));
}

async function getReports(req, res) {
  const filters = {
    status: req.query.status,
    severity: req.query.severity,
    department: req.query.department,
    priority_level: req.query.priority_level,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    sort_by: req.query.sort_by || 'created_at',
    sort_order: req.query.sort_order || 'desc',
  };

  const result = await dashboardService.getReports(filters);
  res.json(paginated(result.data, result.total, result.page, result.limit));
}

module.exports = { getStats, getReports };
