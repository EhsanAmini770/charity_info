/**
 * Validation utilities for handling flexible validation rules
 */
const { validationResult } = require('express-validator');
const errorUtils = require('./errorUtils');
const debug = require('./debug').createNamespace('validation');

/**
 * Enhanced validation middleware that supports partial updates
 *
 * @param {Array} validationRules - Array of validation rules
 * @param {Object} options - Options for validation
 * @param {boolean} options.allowPartialUpdates - Whether to allow partial updates (default: true for PUT/PATCH)
 * @param {Array} options.requiredFields - Fields that are always required, even for partial updates
 * @param {Function} options.customValidator - Custom validation function
 * @returns {Function} - Express middleware
 */
const validateRequest = (validationRules, options = {}) => {
  // Default options
  const {
    allowPartialUpdates = true,
    requiredFields = [],
    customValidator = null
  } = options;

  return async (req, res, next) => {
    try {
      // Determine if this is a partial update based on method
      const isPartialUpdate = (req.method === 'PUT' || req.method === 'PATCH') && allowPartialUpdates;

      debug.log(`Processing ${req.method} request`, {
        path: req.path,
        isPartialUpdate,
        bodyFields: req.body ? Object.keys(req.body) : []
      });

      // For partial updates, only validate fields that are present in the request
      const applicableRules = isPartialUpdate
        ? validationRules.filter(rule => {
            // Always include rules for required fields
            if (requiredFields.includes(rule.fields?.[0])) {
              return true;
            }

            // Include rules for fields present in the request body
            const fieldName = rule.fields?.[0];
            return fieldName && (fieldName in req.body);
          })
        : validationRules;

      debug.log(`Applying ${applicableRules.length} of ${validationRules.length} validation rules`);

      // Apply validation rules
      for (const rule of applicableRules) {
        await rule.run(req);
      }

      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Format errors
        const formattedErrors = {};
        errors.array().forEach(error => {
          formattedErrors[error.path] = error.msg;
        });

        debug.log('Validation failed', formattedErrors);

        // Throw validation error
        return next(errorUtils.validation(formattedErrors));
      }

      // Run custom validator if provided
      if (customValidator) {
        const customErrors = await customValidator(req);
        if (customErrors && Object.keys(customErrors).length > 0) {
          debug.log('Custom validation failed', customErrors);
          return next(errorUtils.validation(customErrors));
        }
      }

      debug.log('Validation passed');
      next();
    } catch (error) {
      debug.error('Error in validation middleware', error);
      next(error);
    }
  };
};

/**
 * Create validation rules for partial updates
 * Marks all fields as optional but applies validation if present
 *
 * @param {Array} rules - Original validation rules
 * @returns {Array} - Modified validation rules for partial updates
 */
const createPartialValidationRules = (rules) => {
  return rules.map(rule => {
    // Make the field optional
    if (rule.builder && rule.builder.optional) {
      return rule.builder.optional();
    }
    return rule;
  });
};

module.exports = {
  validateRequest,
  createPartialValidationRules
};
