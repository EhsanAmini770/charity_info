const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    required: true
  },
  website: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  partnerType: {
    type: String,
    enum: ['sponsor', 'partner', 'supporter'],
    default: 'partner'
  },
  featured: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Create a text index for search functionality
partnerSchema.index({ name: 'text', description: 'text' });

const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner;
