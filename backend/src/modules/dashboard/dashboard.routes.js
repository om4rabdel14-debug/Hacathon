const { Router } = require('express');
const dashboardController = require('./dashboard.controller');
const { requireAuth } = require('../../app/middlewares/auth.middleware');

const router = Router();

// All dashboard routes require authentication
router.use(requireAuth);

// GET /api/dashboard/stats
router.get('/stats', dashboardController.getStats);

// GET /api/dashboard/reports
router.get('/reports', dashboardController.getReports);

module.exports = router;
