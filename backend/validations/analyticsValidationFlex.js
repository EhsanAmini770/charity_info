const { query } = require('express-validator');
const { validateRequest } = require('../utils/validationUtils');
const debug = require('../utils/debug').createNamespace('analytics-validation');

/**
 * Validation rules for getting visit stats
 */
const visitStatsRules = [
  query('period')
    .optional()
    .isIn(['day', 'week', 'month', 'year']).withMessage('Period must be day, week, month, or year')
    .default('week'),
  
  query('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid ISO 8601 date')
];

/**
 * Validation rules for getting online count
 */
const onlineCountRules = [];

/**
 * Middleware for validating visit stats
 */
const validateVisitStats = validateRequest(visitStatsRules);

/**
 * Middleware for validating online count
 */
const validateOnlineCount = validateRequest(onlineCountRules);

module.exports = {
  validateVisitStats,
  validateOnlineCount
};
