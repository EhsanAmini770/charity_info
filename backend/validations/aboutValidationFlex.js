const { body, query } = require('express-validator');
const { validateRequest } = require('../utils/validationUtils');
const debug = require('../utils/debug').createNamespace('about-validation');

/**
 * Validation rules for updating about page content
 */
const updateAboutRules = [
  body('mission')
    .notEmpty().withMessage('Mission is required')
    .isString().withMessage('Mission must be a string')
    .isLength({ min: 10, max: 1000 }).withMessage('Mission must be between 10 and 1000 characters')
    .trim(),

  body('vision')
    .notEmpty().withMessage('Vision is required')
    .isString().withMessage('Vision must be a string')
    .isLength({ min: 10, max: 1000 }).withMessage('Vision must be between 10 and 1000 characters')
    .trim(),

  body('foundedYear')
    .notEmpty().withMessage('Founded year is required')
    .isString().withMessage('Founded year must be a string')
    .isLength({ min: 4, max: 20 }).withMessage('Founded year must be between 4 and 20 characters')
    .trim(),

  body('volunteersCount')
    .notEmpty().withMessage('Volunteers count is required')
    .isString().withMessage('Volunteers count must be a string')
    .isLength({ min: 1, max: 20 }).withMessage('Volunteers count must be between 1 and 20 characters')
    .trim(),

  body('peopleHelpedCount')
    .notEmpty().withMessage('People helped count is required')
    .isString().withMessage('People helped count must be a string')
    .isLength({ min: 1, max: 20 }).withMessage('People helped count must be between 1 and 20 characters')
    .trim(),

  body('communitiesCount')
    .notEmpty().withMessage('Communities count is required')
    .isString().withMessage('Communities count must be a string')
    .isLength({ min: 1, max: 20 }).withMessage('Communities count must be between 1 and 20 characters')
    .trim()
];

/**
 * Custom validator for about content
 */
const customAboutValidator = async (req) => {
  const errors = {};

  // Add any custom validation logic here

  return errors;
};

/**
 * Validation rules for getting about content
 */
const getAboutRules = [];

/**
 * Middleware for validating about content updates
 */
const validateUpdateAbout = validateRequest(updateAboutRules, {
  allowPartialUpdates: true,
  requiredFields: [],
  customValidator: customAboutValidator
});

/**
 * Middleware for validating getting about content
 */
const validateGetAbout = validateRequest(getAboutRules);

module.exports = {
  validateUpdateAbout,
  validateGetAbout
};
