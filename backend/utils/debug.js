/**
 * Debug utility for controlled logging
 * Replaces direct console.log calls with a controlled debug function
 * that can be enabled/disabled based on environment
 */

const logger = require('./logger');

// Check if debug mode is enabled
const isDebugMode = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';

/**
 * Debug log function
 * Only logs in development or when DEBUG=true
 *
 * @param {string} namespace - Debug namespace/category
 * @param {string} message - Debug message
 * @param {any} data - Optional data to log
 */
const debug = (namespace, message, data) => {
  if (!isDebugMode) return;

  if (data !== undefined) {
    if (typeof data === 'object' && data !== null) {
      // For objects, use logger.debug with structured data
      logger.debug({
        namespace,
        message,
        data: sanitizeData(data)
      });
    } else {
      // For simple values
      logger.debug(`[${namespace}] ${message}: ${data}`);
    }
  } else {
    logger.debug(`[${namespace}] ${message}`);
  }
};

/**
 * Sanitize sensitive data before logging
 * Removes passwords, tokens, etc.
 *
 * @param {object} data - Data to sanitize
 * @returns {object} - Sanitized data
 */
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data;

  // Create a shallow copy to avoid modifying the original
  const sanitized = { ...data };

  // List of sensitive fields to mask
  const sensitiveFields = [
    'password', 'passwordHash', 'token', 'secret', 'apiKey',
    'authorization', 'accessToken', 'refreshToken', 'csrf',
    'cookie', 'session', 'key', 'credential', 'auth'
  ];

  // Mask sensitive fields
  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  });

  return sanitized;
};

// Create namespace-specific debug functions
const createNamespace = (namespace) => ({
  log: (message, data) => debug(namespace, message, data),
  error: (message, error) => {
    if (!isDebugMode) return;

    if (error instanceof Error) {
      logger.error({
        namespace,
        message,
        error: error.message,
        stack: error.stack
      });
    } else {
      logger.error({
        namespace,
        message,
        data: error
      });
    }
  }
});

// Export the debug utility
module.exports = {
  debug,
  createNamespace,
  isDebugMode
};
