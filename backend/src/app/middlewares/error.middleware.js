const logger = require('../../config/logger');
const AppError = require('../../core/errors/AppError');
const { error: errorResponse } = require('../../core/utils/buildApiResponse');

function errorMiddleware(err, req, res, next) {
  logger.error(err.message, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(errorResponse(err.message));
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json(errorResponse('File size exceeds the 10MB limit'));
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json(errorResponse('Unexpected file field'));
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return res.status(400).json(errorResponse('Validation error', messages));
  }

  // Default server error
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(500).json(errorResponse(message));
}

module.exports = errorMiddleware;
