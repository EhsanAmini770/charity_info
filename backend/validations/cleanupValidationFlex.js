const { query, param, body } = require('express-validator');
const { validateRequest } = require('../utils/validationUtils');
const debug = require('../utils/debug').createNamespace('cleanup-validation');

/**
 * Validation rules for getting orphaned files
 */
const getOrphanedFilesRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('resolved')
    .optional()
    .isIn(['true', 'false', 'all']).withMessage('Resolved must be true, false, or all')
];

/**
 * Validation rules for processing orphaned files
 */
const processOrphanedFilesRules = [
  body('limit')
    .optional()
    .isInt({ min: 1, max: 500 }).withMessage('Limit must be between 1 and 500')
    .toInt()
];

/**
 * Validation rules for updating an orphaned file
 */
const updateOrphanedFileRules = [
  param('id')
    .isMongoId().withMessage('Invalid orphaned file ID'),
  
  body('resolved')
    .isBoolean().withMessage('Resolved must be a boolean value'),
  
  body('resolution')
    .optional()
    .isString().withMessage('Resolution must be a string')
    .trim()
];

/**
 * Validation rules for deleting an orphaned file
 */
const deleteOrphanedFileRules = [
  param('id')
    .isMongoId().withMessage('Invalid orphaned file ID')
];

/**
 * Middleware for validating getting orphaned files
 */
const validateGetOrphanedFiles = validateRequest(getOrphanedFilesRules);

/**
 * Middleware for validating processing orphaned files
 */
const validateProcessOrphanedFiles = validateRequest(processOrphanedFilesRules);

/**
 * Middleware for validating updating an orphaned file
 */
const validateUpdateOrphanedFile = validateRequest(updateOrphanedFileRules);

/**
 * Middleware for validating deleting an orphaned file
 */
const validateDeleteOrphanedFile = validateRequest(deleteOrphanedFileRules);

module.exports = {
  validateGetOrphanedFiles,
  validateProcessOrphanedFiles,
  validateUpdateOrphanedFile,
  validateDeleteOrphanedFile
};
