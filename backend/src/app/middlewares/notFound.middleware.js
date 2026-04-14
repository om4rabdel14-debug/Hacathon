const NotFoundError = require('../../core/errors/NotFoundError');

function notFoundMiddleware(req, res, next) {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = notFoundMiddleware;
