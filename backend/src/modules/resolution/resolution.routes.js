const { Router } = require('express');
const multer = require('multer');
const resolutionController = require('./resolution.controller');
const { requireAuth } = require('../../app/middlewares/auth.middleware');
const validate = require('../../app/middlewares/validate.middleware');
const { updateStatusSchema, addNoteSchema } = require('../../core/validators/report.validator');

const router = Router();

// Multer config for resolution images
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// All resolution routes require authentication
router.use(requireAuth);

// PATCH /api/resolution/reports/:id/status
router.patch('/reports/:id/status',
  validate(updateStatusSchema),
  resolutionController.updateStatus
);

// POST /api/resolution/reports/:id/notes
router.post('/reports/:id/notes',
  validate(addNoteSchema),
  resolutionController.addNote
);

// POST /api/resolution/reports/:id/resolution-images
router.post('/reports/:id/resolution-images',
  upload.single('image'),
  resolutionController.uploadResolutionImage
);

module.exports = router;
