/**
 * Frontend logging utility
 * Provides consistent logging with sensitive data masking
 */

/**
 * Sanitize sensitive data before logging
 * Removes passwords, tokens, etc.
 *
 * @param data - Data to sanitize
 * @returns Sanitized data
 */
export const sanitizeData = (data: any): any => {
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

/**
 * Log information to the console in development mode
 *
 * @param message - Log message
 * @param data - Optional data to log
 */
export const logInfo = (message: string, data?: any): void => {
  if (process.env.NODE_ENV !== 'production') {
    if (data) {
      console.log(message, sanitizeData(data));
    } else {
      console.log(message);
    }
  }
};

/**
 * Log errors to the console
 * Always logs in production, but sanitizes sensitive data
 *
 * @param message - Error message
 * @param error - Error object or data
 */
export const logError = (message: string, error?: any): void => {
  if (error instanceof Error) {
    // For Error objects, log the message and stack
    console.error(message, {
      message: error.message,
      stack: error.stack,
    });
  } else if (error) {
    // For other data, sanitize before logging
    console.error(message, sanitizeData(error));
  } else {
    console.error(message);
  }
};

/**
 * Log warnings to the console in development mode
 *
 * @param message - Warning message
 * @param data - Optional data to log
 */
export const logWarning = (message: string, data?: any): void => {
  if (process.env.NODE_ENV !== 'production') {
    if (data) {
      console.warn(message, sanitizeData(data));
    } else {
      console.warn(message);
    }
  }
};

export default {
  logInfo,
  logError,
  logWarning,
  sanitizeData
};
