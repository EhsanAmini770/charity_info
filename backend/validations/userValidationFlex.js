const { body, param, query } = require('express-validator');
const { validateRequest } = require('../utils/validationUtils');
const debug = require('../utils/debug').createNamespace('user-validation');

/**
 * Validation rules for creating a user
 */
const createUserRules = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isString().withMessage('Username must be a string')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscores and hyphens')
    .trim(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isString().withMessage('Password must be a string')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  body('role')
    .optional()
    .isIn(['super-admin', 'editor']).withMessage('Role must be either super-admin or editor')
    .default('editor')
];

/**
 * Validation rules for updating a user
 */
const updateUserRules = [
  param('id')
    .isMongoId().withMessage('Invalid user ID'),

  body('username')
    .optional()
    .isString().withMessage('Username must be a string')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscores and hyphens')
    .trim(),

  body('password')
    .optional()
    .isString().withMessage('Password must be a string')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  body('role')
    .optional()
    .isIn(['super-admin', 'editor']).withMessage('Role must be either super-admin or editor')
];

/**
 * Validation rules for getting a user by ID
 */
const getUserByIdRules = [
  param('id')
    .isMongoId().withMessage('Invalid user ID')
];

/**
 * Validation rules for deleting a user
 */
const deleteUserRules = [
  param('id')
    .isMongoId().withMessage('Invalid user ID')
];

/**
 * Validation rules for getting all users
 */
const getUsersRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('role')
    .optional()
    .isIn(['super-admin', 'editor', 'all']).withMessage('Role must be super-admin, editor, or all')
];

/**
 * Validation rules for login
 */
const loginRules = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isString().withMessage('Username must be a string')
    .trim(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isString().withMessage('Password must be a string')
];

/**
 * Custom validator for users
 */
const customUserValidator = async (req) => {
  const errors = {};

  // Add any custom validation logic here
  // For example, checking if the username is unique

  return errors;
};

/**
 * Middleware for validating user creation
 */
const validateCreateUser = validateRequest(createUserRules, {
  allowPartialUpdates: false,
  requiredFields: ['username', 'password'],
  customValidator: customUserValidator
});

/**
 * Middleware for validating user updates
 */
const validateUpdateUser = validateRequest(updateUserRules, {
  allowPartialUpdates: true,
  customValidator: customUserValidator
});

/**
 * Middleware for validating getting a user by ID
 */
const validateGetUserById = validateRequest(getUserByIdRules);

/**
 * Middleware for validating user deletion
 */
const validateDeleteUser = validateRequest(deleteUserRules);

/**
 * Middleware for validating getting all users
 */
const validateGetUsers = validateRequest(getUsersRules);

/**
 * Middleware for validating login
 */
const validateLogin = validateRequest(loginRules, {
  allowPartialUpdates: false,
  requiredFields: ['username', 'password']
});

module.exports = {
  validateCreateUser,
  validateUpdateUser,
  validateGetUserById,
  validateDeleteUser,
  validateGetUsers,
  validateLogin
};
