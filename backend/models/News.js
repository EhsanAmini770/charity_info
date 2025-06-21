const mongoose = require('mongoose');
const slugify = require('slugify');
const config = require('../config/config');
const debug = require('../utils/debug').createNamespace('news-model');

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  body: {
    type: String,
    required: [true, 'Body content is required']
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachment'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create text index for search
NewsSchema.index({ title: 'text', body: 'text' });

// Generate slug before saving
NewsSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, config.slugifyOptions);
  }

  if (this.isModified()) {
    this.updatedAt = Date.now();
  }

  next();
});

// Import sitemapService at the top level to avoid circular dependencies
let sitemapService;
// Delay the require to avoid circular dependencies
setTimeout(() => {
  sitemapService = require('../services/sitemapService');
}, 1000);

// Middleware to regenerate sitemap after save
NewsSchema.post('save', async function() {
  try {
    if (sitemapService) {
      await sitemapService.regenerateSitemap();
    }
  } catch (error) {
    debug.error('Error regenerating sitemap:', error);
  }
});

// Middleware to regenerate sitemap after remove
NewsSchema.post('remove', async function() {
  try {
    if (sitemapService) {
      await sitemapService.regenerateSitemap();
    }
  } catch (error) {
    debug.error('Error regenerating sitemap:', error);
  }
});

module.exports = mongoose.model('News', NewsSchema);
