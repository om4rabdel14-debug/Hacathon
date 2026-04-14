const { Router } = require('express');
const multer = require('multer');
const reportsController = require('./reports.controller');
const validate = require('../../app/middlewares/validate.middleware');
const {
  createReportSchema,
  createFeedbackSchema,
} = require('../../core/validators/report.validator');

const router = Router();

// Multer config - memory storage, 10MB limit, images only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// POST /api/reports - Submit a new report
router.post('/',
  upload.single('image'),
  validate(createReportSchema),
  reportsController.submitReport
);

// GET /api/reports/track/:id - Citizen tracking (report + timeline + resolution images)
router.get('/track/:id', reportsController.trackReport);

// GET /api/reports/:id/duplicates - Get merged duplicate submissions
router.get('/:id/duplicates', reportsController.getDuplicateReports);

// POST /api/reports/:id/feedback - Citizen confirms whether the fix worked
router.post('/:id/feedback',
  validate(createFeedbackSchema),
  reportsController.submitFeedback
);

// GET /api/reports/:id/feedback-summary - Get aggregate citizen feedback
router.get('/:id/feedback-summary', reportsController.getFeedbackSummary);

// GET /api/reports/:id/escalation - Get current escalation state and history
router.get('/:id/escalation', reportsController.getEscalation);

// GET /api/reports/:id - Get report by ID
router.get('/:id', reportsController.getReport);

// GET /api/reports/:id/updates - Get report timeline
router.get('/:id/updates', reportsController.getReportTimeline);

module.exports = router;
