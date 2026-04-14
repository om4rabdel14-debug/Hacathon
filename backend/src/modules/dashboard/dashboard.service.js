const dashboardRepository = require('./dashboard.repository');

async function getStats() {
  return dashboardRepository.getStats();
}

async function getReports(filters) {
  return dashboardRepository.getReports(filters);
}

module.exports = { getStats, getReports };
