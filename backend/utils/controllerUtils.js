const logger = require('./logger');
const mongoose = require('mongoose');

/**
 * Utility functions for controllers
 */
const controllerUtils = {
  /**
   * Enhanced error handler for controllers
   * Logs detailed error information and sends appropriate response
   *
   * @param {Error} error - The error object
   * @param {Object} res - Express response object
   * @param {Object} options - Additional options
   * @param {string} options.context - Context where the error occurred (e.g., 'deleteNews')
   * @param {string} options.entityId - ID of the entity being processed
   * @param {Function} options.next - Express next function (if using global error handler)
   * @param {boolean} options.useNextFunction - Whether to use next() instead of res.status()
   */
  handleControllerError: (error, res, options = {}) => {
    const {
      context = 'controller',
      entityId = null,
      next = null,
      useNextFunction = false
    } = options;

    // Create detailed error log
    const errorDetails = {
      message: `Error in ${context}${entityId ? ` (ID: ${entityId})` : ''}`,
      error: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    };

    // Add mongoose validation errors if present
    if (error.errors) {
      errorDetails.validationErrors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});
    }

    // Log the error with all details
    logger.error(errorDetails);

    // If using global error handler, pass to next()
    if (useNextFunction && next) {
      return next(error);
    }

    // Otherwise, send appropriate response
    const statusCode = error.statusCode ||
                      (error.name === 'ValidationError' ? 422 :
                       error.code === 11000 ? 409 : 500);

    // Create user-friendly error message
    let userMessage = 'An unexpected error occurred';

    if (error.name === 'ValidationError') {
      userMessage = 'Validation failed';
    } else if (error.code === 11000) {
      userMessage = 'Duplicate entry';
    } else if (error.message) {
      userMessage = error.message;
    }

    // Prepare response object in the standardized format
    const errorResponse = {
      success: false,
      error: {
        code: error.code || (error.name === 'ValidationError' ? 'VALIDATION_ERROR' :
               error.code === 11000 ? 'DUPLICATE_ERROR' : 'SERVER_ERROR'),
        message: userMessage
      }
    };

    // Add validation errors if available
    if (error.errors) {
      errorResponse.error.errors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});
    }

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error.stack = error.stack;
    }

    // Send response
    return res.status(statusCode).json(errorResponse);
  },

  /**
   * Track orphaned files for later cleanup
   *
   * @param {string} fileId - ID of the orphaned file
   * @param {string} storageType - Type of storage ('gridfs' or 'filesystem')
   * @param {string} entityType - Type of entity (e.g., 'news', 'gallery')
   * @param {string} reason - Reason for tracking
   */
  trackOrphanedFile: async (fileId, storageType, entityType, reason) => {
    try {
      // Check if we have the OrphanedFile model
      const OrphanedFile = mongoose.models.OrphanedFile ||
        mongoose.model('OrphanedFile', new mongoose.Schema({
          fileId: String,
          storageType: String,
          entityType: String,
          reason: String,
          createdAt: { type: Date, default: Date.now },
          resolved: { type: Boolean, default: false },
          resolvedAt: Date
        }, { timestamps: true }));

      // Create record of orphaned file
      await new OrphanedFile({
        fileId,
        storageType,
        entityType,
        reason
      }).save();

      logger.info(`Tracked orphaned file: ${fileId} (${storageType}, ${entityType})`);
    } catch (error) {
      logger.error({
        message: 'Failed to track orphaned file',
        fileId,
        storageType,
        entityType,
        error: error.message
      });
    }
  },

  /**
   * Safe file deletion with orphaned file tracking
   *
   * @param {Object} options - Options for file deletion
   * @param {string} options.fileId - ID of the file to delete
   * @param {string} options.storageType - Type of storage ('gridfs' or 'filesystem')
   * @param {string} options.filePath - Path to file (for filesystem)
   * @param {Object} options.gridFSBucket - GridFS bucket instance
   * @param {string} options.entityType - Type of entity (e.g., 'news', 'gallery')
   * @param {string} options.entityId - ID of the entity
   * @returns {boolean} - Whether deletion was successful
   */
  safeDeleteFile: async (options) => {
    const {
      fileId,
      storageType,
      filePath,
      gridFSBucket,
      entityType,
      entityId
    } = options;

    try {
      if (storageType === 'filesystem') {
        const fs = require('fs');
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info(`Deleted file from filesystem: ${filePath}`);
          return true;
        } else {
          logger.warn(`File not found in filesystem: ${filePath}`);
          return false;
        }
      } else if (storageType === 'gridfs') {
        if (!gridFSBucket) {
          logger.error('GridFS bucket not initialized for file deletion');
          await controllerUtils.trackOrphanedFile(
            fileId,
            'gridfs',
            entityType,
            'GridFS bucket not initialized'
          );
          return false;
        }

        try {
          await gridFSBucket.delete(new mongoose.Types.ObjectId(fileId));
          logger.info(`Deleted file from GridFS: ${fileId}`);
          return true;
        } catch (gridFsError) {
          logger.error({
            message: 'Error deleting file from GridFS',
            fileId,
            error: gridFsError.message,
            stack: gridFsError.stack
          });

          await controllerUtils.trackOrphanedFile(
            fileId,
            'gridfs',
            entityType,
            `Delete failed: ${gridFsError.message}`
          );
          return false;
        }
      }

      return false;
    } catch (error) {
      logger.error({
        message: 'Error in safeDeleteFile',
        fileId,
        storageType,
        entityType,
        entityId,
        error: error.message,
        stack: error.stack
      });

      await controllerUtils.trackOrphanedFile(
        fileId,
        storageType,
        entityType,
        `Exception: ${error.message}`
      );
      return false;
    }
  }
};

module.exports = controllerUtils;
