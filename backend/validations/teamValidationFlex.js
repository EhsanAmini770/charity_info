const { body, param, query } = require('express-validator');
const { validateRequest } = require('../utils/validationUtils');
const debug = require('../utils/debug').createNamespace('team-validation');

/**
 * Validation rules for creating a team member
 */
const createTeamMemberRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('position')
    .trim()
    .notEmpty().withMessage('Position is required')
    .isString().withMessage('Position must be a string')
    .isLength({ min: 2, max: 100 }).withMessage('Position must be between 2 and 100 characters'),
  
  body('bio')
    .trim()
    .notEmpty().withMessage('Bio is required')
    .isString().withMessage('Bio must be a string')
    .isLength({ min: 10, max: 1000 }).withMessage('Bio must be between 10 and 1000 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .isString().withMessage('Phone must be a string'),
  
  body('socialLinks')
    .optional()
    .custom((value, { req }) => {
      // If socialLinks is a string (from form data), try to parse it
      if (typeof value === 'string') {
        try {
          req.body.socialLinks = JSON.parse(value);
          return true;
        } catch (error) {
          throw new Error('Social links must be valid JSON');
        }
      }
      return true;
    }),
  
  body('socialLinks.linkedin')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid LinkedIn URL'),
  
  body('socialLinks.twitter')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid Twitter URL'),
  
  body('socialLinks.facebook')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid Facebook URL'),
  
  body('displayOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a non-negative integer')
    .toInt()
    .default(0),
  
  body('active')
    .optional()
    .customSanitizer(value => {
      if (typeof value === 'string') {
        return value === 'true' || value === '1';
      }
      return !!value;
    })
    .isBoolean().withMessage('Active must be a boolean value')
    .default(true)
];

/**
 * Validation rules for updating a team member
 */
const updateTeamMemberRules = [
  param('id')
    .isMongoId().withMessage('Invalid team member ID'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('position')
    .optional()
    .trim()
    .notEmpty().withMessage('Position cannot be empty')
    .isString().withMessage('Position must be a string')
    .isLength({ min: 2, max: 100 }).withMessage('Position must be between 2 and 100 characters'),
  
  body('bio')
    .optional()
    .trim()
    .notEmpty().withMessage('Bio cannot be empty')
    .isString().withMessage('Bio must be a string')
    .isLength({ min: 10, max: 1000 }).withMessage('Bio must be between 10 and 1000 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .isString().withMessage('Phone must be a string'),
  
  body('socialLinks')
    .optional()
    .custom((value, { req }) => {
      // If socialLinks is a string (from form data), try to parse it
      if (typeof value === 'string') {
        try {
          req.body.socialLinks = JSON.parse(value);
          return true;
        } catch (error) {
          throw new Error('Social links must be valid JSON');
        }
      }
      return true;
    }),
  
  body('socialLinks.linkedin')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid LinkedIn URL'),
  
  body('socialLinks.twitter')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid Twitter URL'),
  
  body('socialLinks.facebook')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid Facebook URL'),
  
  body('displayOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a non-negative integer')
    .toInt(),
  
  body('active')
    .optional()
    .customSanitizer(value => {
      if (typeof value === 'string') {
        return value === 'true' || value === '1';
      }
      return !!value;
    })
    .isBoolean().withMessage('Active must be a boolean value')
];

/**
 * Validation rules for getting team members with filtering
 */
const getTeamMembersRules = [
  query('includeInactive')
    .optional()
    .isIn(['true', 'false']).withMessage('includeInactive must be true or false')
];

/**
 * Validation rules for getting a team member by ID
 */
const getTeamMemberByIdRules = [
  param('id')
    .isMongoId().withMessage('Invalid team member ID')
];

/**
 * Validation rules for deleting a team member
 */
const deleteTeamMemberRules = [
  param('id')
    .isMongoId().withMessage('Invalid team member ID')
];

/**
 * Custom validator for team members
 */
const customTeamMemberValidator = async (req) => {
  const errors = {};
  
  // Add any custom validation logic here
  // For example, checking if the email is unique
  
  return errors;
};

/**
 * Middleware for validating team member creation
 */
const validateCreateTeamMember = validateRequest(createTeamMemberRules, {
  allowPartialUpdates: false,
  requiredFields: ['name', 'position', 'bio'],
  customValidator: customTeamMemberValidator
});

/**
 * Middleware for validating team member updates
 */
const validateUpdateTeamMember = validateRequest(updateTeamMemberRules, {
  allowPartialUpdates: true,
  customValidator: customTeamMemberValidator
});

/**
 * Middleware for validating getting team members
 */
const validateGetTeamMembers = validateRequest(getTeamMembersRules);

/**
 * Middleware for validating getting a team member by ID
 */
const validateGetTeamMemberById = validateRequest(getTeamMemberByIdRules);

/**
 * Middleware for validating team member deletion
 */
const validateDeleteTeamMember = validateRequest(deleteTeamMemberRules);

module.exports = {
  validateCreateTeamMember,
  validateUpdateTeamMember,
  validateGetTeamMembers,
  validateGetTeamMemberById,
  validateDeleteTeamMember
};
