const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { isAuthenticated, isSuperAdmin } = require('../middleware/auth');
const OrphanedFile = require('../models/OrphanedFile');
const cleanupService = require('../services/cleanupService');
const logger = require('../utils/logger');
const controllerUtils = require('../utils/controllerUtils');
const debug = require('../utils/debug').createNamespace('admin-cleanup-routes');
const {
  validateGetOrphanedFiles,
  validateProcessOrphanedFiles,
  validateUpdateOrphanedFile,
  validateDeleteOrphanedFile
} = require('../validations/cleanupValidationFlex');

/**
 * @route   GET /api/admin/cleanup/orphaned-files
 * @desc    Get list of orphaned files
 * @access  Super Admin
 */
router.get('/orphaned-files', isAuthenticated, isSuperAdmin, validateGetOrphanedFiles, async (req, res) => {
  try {
    const { page = 1, limit = 20, resolved = 'false' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {};
    if (resolved === 'true') {
      query.resolved = true;
    } else if (resolved === 'false') {
      query.resolved = false;
    }

    // Get orphaned files
    const orphanedFiles = await OrphanedFile.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await OrphanedFile.countDocuments(query);

    res.json({
      orphanedFiles,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    debug.error('Error getting orphaned files', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'getOrphanedFiles'
    });
  }
});

/**
 * @route   POST /api/admin/cleanup/process-orphaned
 * @desc    Process orphaned files
 * @access  Super Admin
 */
router.post('/process-orphaned', isAuthenticated, isSuperAdmin, validateProcessOrphanedFiles, async (req, res) => {
  try {
    const { limit = 50 } = req.body;

    // Process orphaned files
    const results = await cleanupService.processOrphanedFiles(parseInt(limit));

    res.json({
      message: 'Orphaned files processed',
      results
    });
  } catch (error) {
    debug.error('Error processing orphaned files', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'processOrphanedFiles'
    });
  }
});

/**
 * @route   PUT /api/admin/cleanup/orphaned-files/:id
 * @desc    Mark orphaned file as resolved
 * @access  Super Admin
 */
router.put('/orphaned-files/:id', isAuthenticated, isSuperAdmin, validateUpdateOrphanedFile, async (req, res) => {
  try {
    const { id } = req.params;
    const { resolved, resolution } = req.body;

    // Find orphaned file
    const orphanedFile = await OrphanedFile.findById(id);

    if (!orphanedFile) {
      return res.status(404).json({ message: 'Orphaned file not found' });
    }

    // Update orphaned file
    orphanedFile.resolved = resolved === true;
    if (orphanedFile.resolved) {
      orphanedFile.resolvedAt = new Date();
    } else {
      orphanedFile.resolvedAt = null;
    }

    // Update metadata
    orphanedFile.metadata = {
      ...orphanedFile.metadata,
      resolution: resolution || 'Manually resolved',
      resolvedBy: req.user._id
    };

    await orphanedFile.save();

    res.json({
      message: 'Orphaned file updated',
      orphanedFile
    });
  } catch (error) {
    debug.error('Error updating orphaned file', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'updateOrphanedFile',
      entityId: req.params.id
    });
  }
});

/**
 * @route   DELETE /api/admin/cleanup/orphaned-files/:id
 * @desc    Delete orphaned file record (not the actual file)
 * @access  Super Admin
 */
router.delete('/orphaned-files/:id', isAuthenticated, isSuperAdmin, validateDeleteOrphanedFile, async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete orphaned file record
    const orphanedFile = await OrphanedFile.findByIdAndDelete(id);

    if (!orphanedFile) {
      return res.status(404).json({ message: 'Orphaned file not found' });
    }

    res.json({
      message: 'Orphaned file record deleted',
      fileId: orphanedFile.fileId
    });
  } catch (error) {
    debug.error('Error deleting orphaned file record', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'deleteOrphanedFile',
      entityId: req.params.id
    });
  }
});

module.exports = router;
