const createError = require('http-errors');

/**
 * Custom error utility functions
 */
const errorUtils = {
  /**
   * Create a not found error
   * @param {string} message - Error message
   * @returns {Error} - Not found error
   */
  notFound: (message = 'Resource not found') => {
    return createError(404, message);
  },

  /**
   * Create a bad request error
   * @param {string} message - Error message
   * @returns {Error} - Bad request error
   */
  badRequest: (message = 'Bad request') => {
    return createError(400, message);
  },

  /**
   * Create an unauthorized error
   * @param {string} message - Error message
   * @returns {Error} - Unauthorized error
   */
  unauthorized: (message = 'Unauthorized') => {
    return createError(401, message);
  },

  /**
   * Create a forbidden error
   * @param {string} message - Error message
   * @returns {Error} - Forbidden error
   */
  forbidden: (message = 'Forbidden') => {
    return createError(403, message);
  },

  /**
   * Create a conflict error
   * @param {string} message - Error message
   * @returns {Error} - Conflict error
   */
  conflict: (message = 'Conflict') => {
    return createError(409, message);
  },

  /**
   * Create a validation error
   * @param {string|object} errors - Error message or validation errors object
   * @returns {Error} - Validation error
   */
  validation: (errors) => {
    const error = createError(422, 'Validation Error');
    error.errors = errors;
    return error;
  },

  /**
   * Create a server error
   * @param {string} message - Error message
   * @returns {Error} - Server error
   */
  server: (message = 'Internal Server Error') => {
    return createError(500, message);
  },

  /**
   * Format mongoose validation errors
   * @param {Error} err - Mongoose validation error
   * @returns {Object} - Formatted validation errors
   */
  formatMongooseErrors: (err) => {
    const errors = {};
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });
      return errors;
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      errors[field] = `${field} already exists`;
      return errors;
    }
    
    return { general: err.message };
  }
};

module.exports = errorUtils;
