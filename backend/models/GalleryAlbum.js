const mongoose = require('mongoose');
const slugify = require('slugify');
const config = require('../config/config');
const debug = require('../utils/debug').createNamespace('gallery-album-model');

const GalleryAlbumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
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
GalleryAlbumSchema.index({ title: 'text', description: 'text' });

// Generate slug before saving
GalleryAlbumSchema.pre('save', function(next) {
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
GalleryAlbumSchema.post('save', async function() {
  try {
    if (sitemapService) {
      await sitemapService.regenerateSitemap();
    }
  } catch (error) {
    debug.error('Error regenerating sitemap:', error);
  }
});

// Middleware to regenerate sitemap after remove
GalleryAlbumSchema.post('remove', async function() {
  try {
    if (sitemapService) {
      await sitemapService.regenerateSitemap();
    }
  } catch (error) {
    debug.error('Error regenerating sitemap:', error);
  }
});

module.exports = mongoose.model('GalleryAlbum', GalleryAlbumSchema);
