const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @returns {Function} - Rate limiter middleware
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again later',
    handler: (req, res, next, options) => {
      logger.warn({
        message: 'Rate limit exceeded',
        ip: req.ip,
        path: req.path,
        method: req.method,
        requestId: req.id
      });

      res.status(options.statusCode).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: options.message
        }
      });
    }
  };

  return rateLimit({
    ...defaultOptions,
    ...options
  });
};

// General API rate limiter
const apiLimiter = createRateLimiter({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.max
});

// More strict rate limiter for auth endpoints
const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: 'Too many login attempts, please try again later'
});

// Rate limiter for user creation
const createUserLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: 'Too many user creation attempts, please try again later'
});

module.exports = {
  apiLimiter,
  authLimiter,
  createUserLimiter
};
