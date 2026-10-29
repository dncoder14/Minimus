class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Wrap async route handlers so rejected promises reach the error middleware (Express 5 does this
// natively, but keeping the wrapper makes the intent explicit and keeps handlers testable).
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { HttpError, asyncHandler };
