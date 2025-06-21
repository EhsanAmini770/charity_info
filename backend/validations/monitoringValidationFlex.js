const { validateRequest } = require('../utils/validationUtils');
const debug = require('../utils/debug').createNamespace('monitoring-validation');

/**
 * Validation rules for health check
 */
const healthCheckRules = [];

/**
 * Validation rules for system info
 */
const systemInfoRules = [];

/**
 * Validation rules for database stats
 */
const databaseStatsRules = [];

/**
 * Middleware for validating health check
 */
const validateHealthCheck = validateRequest(healthCheckRules);

/**
 * Middleware for validating system info
 */
const validateSystemInfo = validateRequest(systemInfoRules);

/**
 * Middleware for validating database stats
 */
const validateDatabaseStats = validateRequest(databaseStatsRules);

module.exports = {
  validateHealthCheck,
  validateSystemInfo,
  validateDatabaseStats
};
