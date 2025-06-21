const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const OrphanedFile = require('../models/OrphanedFile');
const logger = require('../utils/logger');

/**
 * Service for cleaning up orphaned files
 */
const cleanupService = {
  /**
   * Initialize GridFS bucket
   * @returns {Object|null} - GridFS bucket or null if not available
   */
  initGridFS: () => {
    if (mongoose.connection.readyState !== 1) {
      logger.error('Cannot initialize GridFS: MongoDB not connected');
      return null;
    }

    try {
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'attachments'
      });
      return bucket;
    } catch (error) {
      logger.error({
        message: 'Error initializing GridFS bucket',
        error: error.message,
        stack: error.stack
      });
      return null;
    }
  },

  /**
   * Check if a GridFS file exists
   * @param {string} fileId - ID of the file
   * @param {Object} gridFSBucket - GridFS bucket
   * @returns {Promise<boolean>} - Whether the file exists
   */
  checkGridFSFileExists: async (fileId, gridFSBucket) => {
    try {
      const files = await gridFSBucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
      return files.length > 0;
    } catch (error) {
      logger.error({
        message: 'Error checking GridFS file existence',
        fileId,
        error: error.message
      });
      return false;
    }
  },

  /**
   * Process orphaned files
   * @param {number} limit - Maximum number of files to process
   * @returns {Promise<Object>} - Results of the cleanup
   */
  processOrphanedFiles: async (limit = 50) => {
    const results = {
      processed: 0,
      resolved: 0,
      failed: 0,
      notFound: 0,
      errors: []
    };

    try {
      // Get unresolved orphaned files
      const orphanedFiles = await OrphanedFile.find({ resolved: false })
        .sort({ createdAt: 1 })
        .limit(limit);

      if (orphanedFiles.length === 0) {
        return results;
      }

      logger.info(`Processing ${orphanedFiles.length} orphaned files`);

      // Initialize GridFS bucket
      const gridFSBucket = cleanupService.initGridFS();

      // Process each file
      for (const file of orphanedFiles) {
        results.processed++;

        try {
          if (file.storageType === 'gridfs') {
            if (!gridFSBucket) {
              results.errors.push({
                fileId: file._id,
                error: 'GridFS bucket not initialized'
              });
              results.failed++;
              continue;
            }

            // Check if file exists in GridFS
            const exists = await cleanupService.checkGridFSFileExists(file.fileId, gridFSBucket);
            
            if (!exists) {
              // File doesn't exist, mark as resolved
              file.resolved = true;
              file.resolvedAt = new Date();
              file.metadata = { ...file.metadata, resolution: 'File not found in GridFS' };
              await file.save();
              results.notFound++;
              continue;
            }

            // Try to delete the file
            try {
              await gridFSBucket.delete(new mongoose.Types.ObjectId(file.fileId));
              
              // Mark as resolved
              file.resolved = true;
              file.resolvedAt = new Date();
              file.metadata = { ...file.metadata, resolution: 'Successfully deleted from GridFS' };
              await file.save();
              results.resolved++;
            } catch (deleteError) {
              logger.error({
                message: 'Failed to delete orphaned GridFS file',
                fileId: file.fileId,
                error: deleteError.message
              });
              results.failed++;
              results.errors.push({
                fileId: file._id,
                error: deleteError.message
              });
            }
          } else if (file.storageType === 'filesystem') {
            // For filesystem files, we need the path
            if (!file.metadata || !file.metadata.path) {
              // No path information, can't delete
              file.metadata = { ...file.metadata, resolution: 'No path information available' };
              results.failed++;
              results.errors.push({
                fileId: file._id,
                error: 'No path information available for filesystem file'
              });
              continue;
            }

            const filePath = file.metadata.path;
            
            // Check if file exists
            if (!fs.existsSync(filePath)) {
              // File doesn't exist, mark as resolved
              file.resolved = true;
              file.resolvedAt = new Date();
              file.metadata = { ...file.metadata, resolution: 'File not found in filesystem' };
              await file.save();
              results.notFound++;
              continue;
            }

            // Try to delete the file
            try {
              fs.unlinkSync(filePath);
              
              // Mark as resolved
              file.resolved = true;
              file.resolvedAt = new Date();
              file.metadata = { ...file.metadata, resolution: 'Successfully deleted from filesystem' };
              await file.save();
              results.resolved++;
            } catch (deleteError) {
              logger.error({
                message: 'Failed to delete orphaned filesystem file',
                filePath,
                error: deleteError.message
              });
              results.failed++;
              results.errors.push({
                fileId: file._id,
                error: deleteError.message
              });
            }
          }
        } catch (processError) {
          logger.error({
            message: 'Error processing orphaned file',
            fileId: file._id,
            error: processError.message,
            stack: processError.stack
          });
          results.failed++;
          results.errors.push({
            fileId: file._id,
            error: processError.message
          });
        }
      }

      return results;
    } catch (error) {
      logger.error({
        message: 'Error in processOrphanedFiles',
        error: error.message,
        stack: error.stack
      });
      results.errors.push({
        error: error.message
      });
      return results;
    }
  },

  /**
   * Schedule regular cleanup of orphaned files
   * @param {number} intervalMinutes - Interval in minutes
   * @returns {Object} - Timer object
   */
  scheduleCleanup: (intervalMinutes = 60) => {
    logger.info(`Scheduling orphaned file cleanup every ${intervalMinutes} minutes`);
    
    // Run initial cleanup
    cleanupService.processOrphanedFiles()
      .then(results => {
        logger.info({
          message: 'Initial orphaned file cleanup completed',
          results
        });
      })
      .catch(error => {
        logger.error({
          message: 'Error in initial orphaned file cleanup',
          error: error.message,
          stack: error.stack
        });
      });
    
    // Schedule regular cleanup
    const intervalMs = intervalMinutes * 60 * 1000;
    const timer = setInterval(async () => {
      try {
        const results = await cleanupService.processOrphanedFiles();
        logger.info({
          message: 'Scheduled orphaned file cleanup completed',
          results
        });
      } catch (error) {
        logger.error({
          message: 'Error in scheduled orphaned file cleanup',
          error: error.message,
          stack: error.stack
        });
      }
    }, intervalMs);
    
    return timer;
  }
};

module.exports = cleanupService;
