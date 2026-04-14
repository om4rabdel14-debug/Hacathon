const { Router } = require('express');
const authController = require('./auth.controller');
const validate = require('../../app/middlewares/validate.middleware');
const { loginSchema } = require('../../core/validators/auth.validator');

const router = Router();

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;
