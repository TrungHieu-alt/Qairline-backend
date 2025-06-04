// backend/middlewares/errorHandler.js

/**
 * General error handling middleware for Express.
 * @param {Error} err - The error object.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Unhandled Error:', err); // Log the error for server-side debugging

  // Determine status code and message
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Send JSON response
  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = errorHandler;