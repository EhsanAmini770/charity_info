const errorUtils = require('../utils/errorUtils');
const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * Handles all errors thrown in the application
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    requestId: req.id
  });

  // Handle CSRF token errors
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Invalid CSRF token. Please refresh the page and try again.'
      }
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const formattedErrors = errorUtils.formatMongooseErrors(err);
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: formattedErrors
      }
    });
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ERROR',
        message: `${field} already exists`,
        field
      }
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token expired'
      }
    });
  }

  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'File too large'
      }
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FIELD',
        message: 'Invalid field name for file upload'
      }
    });
  }

  // Handle HTTP errors (from http-errors package)
  const statusCode = err.statusCode || err.status || 500;
  const errorMessage = err.message || 'Internal Server Error';
  const errorCode = err.code || (statusCode === 500 ? 'SERVER_ERROR' : 'UNKNOWN_ERROR');

  // Prepare response
  const errorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: errorMessage
    }
  };

  // Add validation errors if available
  if (err.errors) {
    errorResponse.error.errors = err.errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
