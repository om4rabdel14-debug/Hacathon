// Express 5 handles async errors natively, but this wrapper
// provides a consistent pattern and explicit error forwarding.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
