const { body, param, query } = require('express-validator');
const { validateRequest } = require('../utils/validationUtils');
const debug = require('../utils/debug').createNamespace('location-validation');

/**
 * Validation rules for creating a location
 */
const createLocationRules = [
  body('name')
    .notEmpty().withMessage('Location name is required')
    .isString().withMessage('Location name must be a string')
    .trim(),
  
  body('description')
    .notEmpty().withMessage('Description is required')
    .isString().withMessage('Description must be a string')
    .trim(),
  
  body('latitude')
    .notEmpty().withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a valid number between -90 and 90')
    .toFloat(),
  
  body('longitude')
    .notEmpty().withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a valid number between -180 and 180')
    .toFloat(),
  
  body('address')
    .optional()
    .isString().withMessage('Address must be a string')
    .trim(),
  
  body('phone')
    .optional()
    .isString().withMessage('Phone must be a string')
    .trim(),
  
  body('email')
    .optional()
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail()
    .trim(),
  
  body('isMainOffice')
    .optional()
    .customSanitizer(value => {
      if (typeof value === 'string') {
        return value === 'true' || value === '1';
      }
      return !!value;
    })
    .isBoolean().withMessage('isMainOffice must be a boolean value')
    .default(false),
  
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
 * Validation rules for updating a location
 */
const updateLocationRules = [
  param('id')
    .isMongoId().withMessage('Invalid location ID'),
  
  body('name')
    .optional()
    .notEmpty().withMessage('Location name cannot be empty')
    .isString().withMessage('Location name must be a string')
    .trim(),
  
  body('description')
    .optional()
    .notEmpty().withMessage('Description cannot be empty')
    .isString().withMessage('Description must be a string')
    .trim(),
  
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a valid number between -90 and 90')
    .toFloat(),
  
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a valid number between -180 and 180')
    .toFloat(),
  
  body('address')
    .optional()
    .isString().withMessage('Address must be a string')
    .trim(),
  
  body('phone')
    .optional()
    .isString().withMessage('Phone must be a string')
    .trim(),
  
  body('email')
    .optional()
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail()
    .trim(),
  
  body('isMainOffice')
    .optional()
    .customSanitizer(value => {
      if (typeof value === 'string') {
        return value === 'true' || value === '1';
      }
      return !!value;
    })
    .isBoolean().withMessage('isMainOffice must be a boolean value'),
  
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
 * Validation rules for getting locations with filtering
 */
const getLocationsRules = [
  query('includeInactive')
    .optional()
    .isIn(['true', 'false']).withMessage('includeInactive must be true or false')
];

/**
 * Validation rules for getting a location by ID
 */
const getLocationByIdRules = [
  param('id')
    .isMongoId().withMessage('Invalid location ID')
];

/**
 * Validation rules for deleting a location
 */
const deleteLocationRules = [
  param('id')
    .isMongoId().withMessage('Invalid location ID')
];

/**
 * Custom validator for locations
 */
const customLocationValidator = async (req) => {
  const errors = {};
  
  // Add any custom validation logic here
  // For example, checking if the location name is unique
  
  return errors;
};

/**
 * Middleware for validating location creation
 */
const validateCreateLocation = validateRequest(createLocationRules, {
  allowPartialUpdates: false,
  requiredFields: ['name', 'description', 'latitude', 'longitude'],
  customValidator: customLocationValidator
});

/**
 * Middleware for validating location updates
 */
const validateUpdateLocation = validateRequest(updateLocationRules, {
  allowPartialUpdates: true,
  customValidator: customLocationValidator
});

/**
 * Middleware for validating getting locations
 */
const validateGetLocations = validateRequest(getLocationsRules);

/**
 * Middleware for validating getting a location by ID
 */
const validateGetLocationById = validateRequest(getLocationByIdRules);

/**
 * Middleware for validating location deletion
 */
const validateDeleteLocation = validateRequest(deleteLocationRules);

module.exports = {
  validateCreateLocation,
  validateUpdateLocation,
  validateGetLocations,
  validateGetLocationById,
  validateDeleteLocation
};
