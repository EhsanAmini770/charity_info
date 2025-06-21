const { body, param, query } = require('express-validator');
const { validateRequest } = require('../utils/validationUtils');
const debug = require('../utils/debug').createNamespace('contact-validation');

/**
 * Validation rules for submitting a contact form
 */
const contactSubmissionRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isString().withMessage('Subject must be a string')
    .isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
  
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isString().withMessage('Message must be a string')
    .isLength({ min: 10, max: 5000 }).withMessage('Message must be between 10 and 5000 characters')
];

/**
 * Validation rules for getting contacts with pagination and filtering
 */
const getContactsRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('status')
    .optional()
    .isIn(['new', 'read', 'replied', 'archived']).withMessage('Status must be one of: new, read, replied, archived')
];

/**
 * Validation rules for getting a contact by ID
 */
const getContactByIdRules = [
  param('id')
    .isMongoId().withMessage('Invalid contact ID')
];

/**
 * Validation rules for updating a contact status
 */
const updateContactStatusRules = [
  param('id')
    .isMongoId().withMessage('Invalid contact ID'),
  
  body('status')
    .trim()
    .notEmpty().withMessage('Status is required')
    .isIn(['new', 'read', 'replied', 'archived']).withMessage('Status must be one of: new, read, replied, archived')
];

/**
 * Validation rules for deleting a contact
 */
const deleteContactRules = [
  param('id')
    .isMongoId().withMessage('Invalid contact ID')
];

/**
 * Custom validator for contacts
 */
const customContactValidator = async (req) => {
  const errors = {};
  
  // Add any custom validation logic here
  // For example, rate limiting based on IP address
  
  return errors;
};

/**
 * Middleware for validating contact submission
 */
const validateContactSubmission = validateRequest(contactSubmissionRules, {
  allowPartialUpdates: false,
  requiredFields: ['name', 'email', 'subject', 'message'],
  customValidator: customContactValidator
});

/**
 * Middleware for validating getting contacts
 */
const validateGetContacts = validateRequest(getContactsRules);

/**
 * Middleware for validating getting a contact by ID
 */
const validateGetContactById = validateRequest(getContactByIdRules);

/**
 * Middleware for validating updating a contact status
 */
const validateUpdateContactStatus = validateRequest(updateContactStatusRules, {
  allowPartialUpdates: false,
  requiredFields: ['status']
});

/**
 * Middleware for validating deleting a contact
 */
const validateDeleteContact = validateRequest(deleteContactRules);

module.exports = {
  validateContactSubmission,
  validateGetContacts,
  validateGetContactById,
  validateUpdateContactStatus,
  validateDeleteContact
};
