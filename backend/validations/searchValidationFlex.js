const { query } = require('express-validator');
const { validateRequest } = require('../utils/validationUtils');
const debug = require('../utils/debug').createNamespace('search-validation');

/**
 * Validation rules for search
 */
const searchRules = [
  query('q')
    .notEmpty().withMessage('Search query is required')
    .isString().withMessage('Search query must be a string')
    .trim(),
  
  query('type')
    .optional()
    .isIn(['all', 'news', 'faqs', 'gallery']).withMessage('Invalid search type')
    .default('all'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt()
    .default(1),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
    .toInt()
    .default(10)
];

/**
 * Middleware for validating search
 */
const validateSearch = validateRequest(searchRules, {
  allowPartialUpdates: true,
  requiredFields: ['q']
});

module.exports = {
  validateSearch
};
