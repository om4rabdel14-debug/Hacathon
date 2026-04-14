const { Router } = require('express');
const { success } = require('../core/utils/buildApiResponse');

const reportsRoutes = require('../modules/reports/reports.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');
const authRoutes = require('../modules/auth/auth.routes');
const resolutionRoutes = require('../modules/resolution/resolution.routes');

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json(success({ status: 'ok', timestamp: new Date().toISOString() }, 'Server is running'));
});

// Module routes
router.use('/reports', reportsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/auth', authRoutes);
router.use('/resolution', resolutionRoutes);

module.exports = router;
