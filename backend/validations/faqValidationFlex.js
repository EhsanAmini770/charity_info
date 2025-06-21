const { body, param } = require('express-validator');
const { validateRequest } = require('../utils/validationUtils');
const debug = require('../utils/debug').createNamespace('faq-validation');

/**
 * Validation rules for creating a FAQ
 */
const createFaqRules = [
  body('question')
    .notEmpty().withMessage('Question is required')
    .isString().withMessage('Question must be a string')
    .trim(),
  
  body('answer')
    .notEmpty().withMessage('Answer is required')
    .isString().withMessage('Answer must be a string')
    .trim(),
  
  body('category')
    .optional()
    .isString().withMessage('Category must be a string')
    .trim()
    .default('General'),
  
  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage('Order must be a non-negative integer')
    .toInt()
    .default(0),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean value')
    .toBoolean()
    .default(true)
];

/**
 * Validation rules for updating a FAQ
 */
const updateFaqRules = [
  param('id')
    .isMongoId().withMessage('Invalid FAQ ID'),
  
  body('question')
    .optional()
    .isString().withMessage('Question must be a string')
    .trim(),
  
  body('answer')
    .optional()
    .isString().withMessage('Answer must be a string')
    .trim(),
  
  body('category')
    .optional()
    .isString().withMessage('Category must be a string')
    .trim(),
  
  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage('Order must be a non-negative integer')
    .toInt(),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean value')
    .toBoolean()
];

/**
 * Validation rules for partial updates (e.g., toggling isActive)
 */
const partialUpdateFaqRules = [
  param('id')
    .isMongoId().withMessage('Invalid FAQ ID'),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean value')
    .toBoolean()
];

/**
 * Validation rules for deleting a FAQ
 */
const deleteFaqRules = [
  param('id')
    .isMongoId().withMessage('Invalid FAQ ID')
];

/**
 * Custom validator for FAQ updates
 */
const customFaqValidator = async (req) => {
  const errors = {};
  
  // Add any custom validation logic here
  // For example, checking if the order is unique
  
  return errors;
};

/**
 * Middleware for validating FAQ creation
 */
const validateCreateFaq = validateRequest(createFaqRules, {
  allowPartialUpdates: false,
  requiredFields: ['question', 'answer'],
  customValidator: customFaqValidator
});

/**
 * Middleware for validating FAQ updates
 */
const validateUpdateFaq = validateRequest(updateFaqRules, {
  allowPartialUpdates: true,
  customValidator: customFaqValidator
});

/**
 * Middleware for validating partial FAQ updates (e.g., toggling isActive)
 */
const validatePartialUpdateFaq = validateRequest(partialUpdateFaqRules, {
  allowPartialUpdates: true
});

/**
 * Middleware for validating FAQ deletion
 */
const validateDeleteFaq = validateRequest(deleteFaqRules);

module.exports = {
  validateCreateFaq,
  validateUpdateFaq,
  validatePartialUpdateFaq,
  validateDeleteFaq
};
