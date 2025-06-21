const mongoose = require('mongoose');

/**
 * Schema for tracking orphaned files
 * Used to identify and clean up files that failed to be deleted
 */
const OrphanedFileSchema = new mongoose.Schema({
  // ID of the file (GridFS ID or filename)
  fileId: {
    type: String,
    required: true
  },
  
  // Type of storage ('gridfs' or 'filesystem')
  storageType: {
    type: String,
    enum: ['gridfs', 'filesystem'],
    required: true
  },
  
  // Type of entity the file was associated with
  entityType: {
    type: String,
    required: true
  },
  
  // Reason for tracking
  reason: {
    type: String,
    required: true
  },
  
  // Whether the issue has been resolved
  resolved: {
    type: Boolean,
    default: false
  },
  
  // When the issue was resolved
  resolvedAt: {
    type: Date
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, { 
  timestamps: true 
});

// Create index for faster queries
OrphanedFileSchema.index({ resolved: 1, storageType: 1 });
OrphanedFileSchema.index({ entityType: 1 });

module.exports = mongoose.model('OrphanedFile', OrphanedFileSchema);
