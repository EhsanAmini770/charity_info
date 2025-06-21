const { body, param, query } = require('express-validator');
const { validateRequest } = require('../utils/validationUtils');
const debug = require('../utils/debug').createNamespace('subscriber-validation');

/**
 * Validation rules for subscribing to the newsletter
 */
const subscribeRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('name')
    .optional()
    .trim()
    .isString().withMessage('Name must be a string')
    .isLength({ min: 1 }).withMessage('Name cannot be empty if provided')
];

/**
 * Validation rules for unsubscribing from the newsletter
 */
const unsubscribeRules = [
  param('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail()
];

/**
 * Validation rules for getting subscribers with pagination and filtering
 */
const getSubscribersRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('subscribed')
    .optional()
    .isIn(['true', 'false']).withMessage('Subscribed must be true or false'),
  
  query('search')
    .optional()
    .trim()
    .isString().withMessage('Search must be a string')
];

/**
 * Validation rules for deleting a subscriber
 */
const deleteSubscriberRules = [
  param('id')
    .isMongoId().withMessage('Invalid subscriber ID')
];

/**
 * Custom validator for subscribers
 */
const customSubscriberValidator = async (req) => {
  const errors = {};
  
  // Add any custom validation logic here
  // For example, checking if the email is already subscribed
  
  return errors;
};

/**
 * Middleware for validating subscription
 */
const validateSubscribe = validateRequest(subscribeRules, {
  allowPartialUpdates: false,
  requiredFields: ['email'],
  customValidator: customSubscriberValidator
});

/**
 * Middleware for validating unsubscription
 */
const validateUnsubscribe = validateRequest(unsubscribeRules);

/**
 * Middleware for validating getting subscribers
 */
const validateGetSubscribers = validateRequest(getSubscribersRules);

/**
 * Middleware for validating subscriber deletion
 */
const validateDeleteSubscriber = validateRequest(deleteSubscriberRules);

module.exports = {
  validateSubscribe,
  validateUnsubscribe,
  validateGetSubscribers,
  validateDeleteSubscriber
};
