const { body, param, query } = require('express-validator');
const { validateRequest } = require('../utils/validationUtils');
const debug = require('../utils/debug').createNamespace('partner-validation');

/**
 * Validation rules for creating a partner
 */
const createPartnerRules = [
  body('name')
    .notEmpty().withMessage('Partner name is required')
    .isString().withMessage('Partner name must be a string')
    .trim(),
  
  body('website')
    .optional()
    .isURL().withMessage('Website must be a valid URL')
    .trim(),
  
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim(),
  
  body('partnerType')
    .optional()
    .isIn(['sponsor', 'partner', 'supporter']).withMessage('Partner type must be one of: sponsor, partner, supporter')
    .default('partner'),
  
  body('featured')
    .optional()
    .customSanitizer(value => {
      if (typeof value === 'string') {
        return value === 'true' || value === '1';
      }
      return !!value;
    })
    .isBoolean().withMessage('Featured must be a boolean value'),
  
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
 * Validation rules for updating a partner
 */
const updatePartnerRules = [
  param('id')
    .isMongoId().withMessage('Invalid partner ID'),
  
  body('name')
    .optional()
    .notEmpty().withMessage('Partner name cannot be empty')
    .isString().withMessage('Partner name must be a string')
    .trim(),
  
  body('website')
    .optional()
    .isURL().withMessage('Website must be a valid URL')
    .trim(),
  
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim(),
  
  body('partnerType')
    .optional()
    .isIn(['sponsor', 'partner', 'supporter']).withMessage('Partner type must be one of: sponsor, partner, supporter'),
  
  body('featured')
    .optional()
    .customSanitizer(value => {
      if (typeof value === 'string') {
        return value === 'true' || value === '1';
      }
      return !!value;
    })
    .isBoolean().withMessage('Featured must be a boolean value'),
  
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
 * Validation rules for getting partners with filtering
 */
const getPartnersRules = [
  query('active')
    .optional()
    .isIn(['true', 'false']).withMessage('Active must be true or false'),
  
  query('type')
    .optional()
    .isIn(['sponsor', 'partner', 'supporter']).withMessage('Type must be one of: sponsor, partner, supporter'),
  
  query('featured')
    .optional()
    .isIn(['true']).withMessage('Featured must be true')
];

/**
 * Validation rules for getting a partner by ID
 */
const getPartnerByIdRules = [
  param('id')
    .isMongoId().withMessage('Invalid partner ID')
];

/**
 * Validation rules for deleting a partner
 */
const deletePartnerRules = [
  param('id')
    .isMongoId().withMessage('Invalid partner ID')
];

/**
 * Custom validator for partners
 */
const customPartnerValidator = async (req) => {
  const errors = {};
  
  // Add any custom validation logic here
  // For example, checking if the partner name is unique
  
  return errors;
};

/**
 * Middleware for validating partner creation
 */
const validateCreatePartner = validateRequest(createPartnerRules, {
  allowPartialUpdates: false,
  requiredFields: ['name'],
  customValidator: customPartnerValidator
});

/**
 * Middleware for validating partner updates
 */
const validateUpdatePartner = validateRequest(updatePartnerRules, {
  allowPartialUpdates: true,
  customValidator: customPartnerValidator
});

/**
 * Middleware for validating getting partners
 */
const validateGetPartners = validateRequest(getPartnersRules);

/**
 * Middleware for validating getting a partner by ID
 */
const validateGetPartnerById = validateRequest(getPartnerByIdRules);

/**
 * Middleware for validating partner deletion
 */
const validateDeletePartner = validateRequest(deletePartnerRules);

module.exports = {
  validateCreatePartner,
  validateUpdatePartner,
  validateGetPartners,
  validateGetPartnerById,
  validateDeletePartner
};
