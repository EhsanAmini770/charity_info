const { body, param, query } = require('express-validator');
const { validateRequest } = require('../utils/validationUtils');
const debug = require('../utils/debug').createNamespace('news-validation');

/**
 * Validation rules for creating news
 */
const createNewsRules = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters')
    .trim(),

  body('body')
    .notEmpty().withMessage('Body content is required')
    .isString().withMessage('Body must be a string')
    .trim(),

  body('publishDate')
    .optional()
    .isISO8601().withMessage('Publish date must be a valid date')
    .toDate()
    .default(() => new Date()),

  body('expiryDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Expiry date must be a valid date')
    .toDate()
    .custom((value, { req }) => {
      if (value && req.body.publishDate && new Date(value) <= new Date(req.body.publishDate)) {
        throw new Error('Expiry date must be after publish date');
      }
      return true;
    })
];

/**
 * Validation rules for updating news
 */
const updateNewsRules = [
  param('id')
    .isMongoId().withMessage('Invalid news ID'),

  body('title')
    .optional()
    .isString().withMessage('Title must be a string')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters')
    .trim(),

  body('body')
    .optional()
    .isString().withMessage('Body must be a string')
    .trim(),

  body('publishDate')
    .optional()
    .isISO8601().withMessage('Publish date must be a valid date')
    .toDate(),

  body('expiryDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Expiry date must be a valid date')
    .toDate()
    .custom((value, { req }) => {
      if (value && req.body.publishDate && new Date(value) <= new Date(req.body.publishDate)) {
        throw new Error('Expiry date must be after publish date');
      }
      return true;
    })
];

/**
 * Validation rules for news query parameters
 */
const getNewsRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('q')
    .optional()
    .isString().withMessage('Search query must be a string')
    .trim()
];

/**
 * Validation rules for deleting news
 */
const deleteNewsRules = [
  param('id')
    .isMongoId().withMessage('Invalid news ID')
];

/**
 * Validation rules for getting news by slug
 */
const getNewsBySlugRules = [
  param('slug')
    .isString().withMessage('Slug must be a string')
    .trim()
];

/**
 * Validation rules for viewing attachment content
 */
const viewAttachmentContentRules = [
  param('id')
    .isMongoId().withMessage('Invalid attachment ID')
];

/**
 * Custom validator for news
 */
const customNewsValidator = async (req) => {
  const errors = {};

  // Add any custom validation logic here
  // For example, checking if the title is unique

  return errors;
};

/**
 * Middleware for validating news creation
 */
const validateCreateNews = validateRequest(createNewsRules, {
  allowPartialUpdates: false,
  requiredFields: ['title', 'body'],
  customValidator: customNewsValidator
});

/**
 * Middleware for validating news updates
 */
const validateUpdateNews = validateRequest(updateNewsRules, {
  allowPartialUpdates: true,
  customValidator: customNewsValidator
});

/**
 * Middleware for validating news query parameters
 */
const validateGetNews = validateRequest(getNewsRules);

/**
 * Middleware for validating news deletion
 */
const validateDeleteNews = validateRequest(deleteNewsRules);

/**
 * Middleware for validating getting news by slug
 */
const validateGetNewsBySlug = validateRequest(getNewsBySlugRules);

/**
 * Middleware for validating viewing attachment content
 */
const validateViewAttachmentContent = validateRequest(viewAttachmentContentRules);

module.exports = {
  validateCreateNews,
  validateUpdateNews,
  validateGetNews,
  validateDeleteNews,
  validateGetNewsBySlug,
  validateViewAttachmentContent
};
