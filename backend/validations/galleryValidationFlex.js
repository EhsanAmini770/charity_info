const { body, param, query } = require('express-validator');
const { validateRequest } = require('../utils/validationUtils');
const debug = require('../utils/debug').createNamespace('gallery-validation');

/**
 * Validation rules for creating a gallery album
 */
const createAlbumRules = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters')
    .trim(),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim()
];

/**
 * Validation rules for updating a gallery album
 */
const updateAlbumRules = [
  param('id')
    .isMongoId().withMessage('Invalid album ID'),

  body('title')
    .optional()
    .isString().withMessage('Title must be a string')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters')
    .trim(),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim()
];

/**
 * Validation rules for getting a gallery album by ID
 */
const getAlbumByIdRules = [
  param('id')
    .isMongoId().withMessage('Invalid album ID')
];

/**
 * Validation rules for deleting a gallery album
 */
const deleteAlbumRules = [
  param('id')
    .isMongoId().withMessage('Invalid album ID')
];

/**
 * Validation rules for uploading an image to an album
 */
const uploadImageRules = [
  param('id')
    .isMongoId().withMessage('Invalid album ID')
];

/**
 * Validation rules for deleting an image
 */
const deleteImageRules = [
  param('id')
    .isMongoId().withMessage('Invalid image ID')
];

/**
 * Custom validator for gallery albums
 */
const customAlbumValidator = async (req) => {
  const errors = {};

  // Add any custom validation logic here
  // For example, checking if the title is unique

  return errors;
};

/**
 * Middleware for validating album creation
 */
const validateCreateAlbum = validateRequest(createAlbumRules, {
  allowPartialUpdates: false,
  requiredFields: ['title'],
  customValidator: customAlbumValidator
});

/**
 * Middleware for validating album updates
 */
const validateUpdateAlbum = validateRequest(updateAlbumRules, {
  allowPartialUpdates: true,
  customValidator: customAlbumValidator
});

/**
 * Middleware for validating getting an album by ID
 */
const validateGetAlbumById = validateRequest(getAlbumByIdRules);

/**
 * Middleware for validating album deletion
 */
const validateDeleteAlbum = validateRequest(deleteAlbumRules);

/**
 * Middleware for validating image upload
 */
const validateUploadImage = validateRequest(uploadImageRules);

/**
 * Middleware for validating image deletion
 */
const validateDeleteImage = validateRequest(deleteImageRules);

/**
 * Validation rules for getting all albums
 */
const getAllAlbumsRules = [
  query('includeInactive')
    .optional()
    .isIn(['true', 'false']).withMessage('includeInactive must be true or false')
];

/**
 * Validation rules for getting an album by slug
 */
const getAlbumBySlugRules = [
  param('slug')
    .isString().withMessage('Album slug must be a string')
    .trim()
];

/**
 * Validation rules for serving an image
 */
const serveImageRules = [
  param('albumId')
    .isMongoId().withMessage('Invalid album ID'),

  param('filename')
    .isString().withMessage('Filename must be a string')
    .trim()
];

/**
 * Middleware for validating getting all albums
 */
const validateGetAllAlbums = validateRequest(getAllAlbumsRules);

/**
 * Middleware for validating getting an album by slug
 */
const validateGetAlbumBySlug = validateRequest(getAlbumBySlugRules);

/**
 * Middleware for validating serving an image
 */
const validateServeImage = validateRequest(serveImageRules);

module.exports = {
  validateCreateAlbum,
  validateUpdateAlbum,
  validateGetAlbumById,
  validateDeleteAlbum,
  validateUploadImage,
  validateDeleteImage,
  validateGetAllAlbums,
  validateGetAlbumBySlug,
  validateServeImage
};
