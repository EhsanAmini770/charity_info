
const fs = require('fs');
const path = require('path');
const GalleryAlbum = require('../models/GalleryAlbum');
const GalleryImage = require('../models/GalleryImage');
const { uploadGalleryImage } = require('../services/uploadService');
const controllerUtils = require('../utils/controllerUtils');
const debug = require('../utils/debug').createNamespace('gallery-controller');

// Controller for gallery
const galleryController = {
  // Public: Get all albums
  getAllAlbums: async (req, res, next) => {
    try {
      debug.log('Fetching all gallery albums');

      // Get all albums
      const albums = await GalleryAlbum.find()
        .sort({ createdAt: -1 });

      debug.log(`Found ${albums.length} albums`);

      // Get image counts for each album
      const albumsWithCounts = await Promise.all(albums.map(async (album) => {
        const imageCount = await GalleryImage.countDocuments({ albumId: album._id });
        return {
          ...album.toObject(),
          imageCount
        };
      }));

      debug.log('Added image counts to albums');

      res.json({ albums: albumsWithCounts });
    } catch (error) {
      debug.error('Error getting albums with counts', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'getAllAlbums',
        useNextFunction: true,
        next
      });
    }
  },

  // Public: Get album by slug with images
  getAlbumBySlug: async (req, res, next) => {
    try {
      const { slug } = req.params;
      debug.log('Fetching album by slug', { slug });

      const album = await GalleryAlbum.findOne({ slug });

      if (!album) {
        debug.log('Album not found', { slug });
        return res.status(404).json({ message: 'Album not found' });
      }

      debug.log('Found album', { id: album._id, title: album.title });

      const images = await GalleryImage.find({ albumId: album._id });
      debug.log(`Found ${images.length} images for album`);

      // Add image count to album object
      const albumWithCount = {
        ...album.toObject(),
        imageCount: images.length
      };

      res.json({ album: albumWithCount, images });
    } catch (error) {
      debug.error('Error getting album by slug', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'getAlbumBySlug',
        entityId: req.params.slug,
        useNextFunction: true,
        next
      });
    }
  },

  // Admin: Get album by ID with images
  getAlbumById: async (req, res, next) => {
    try {
      const { id } = req.params;
      debug.log('Fetching album by ID', { id });

      const album = await GalleryAlbum.findById(id);

      if (!album) {
        debug.log('Album not found', { id });
        return res.status(404).json({ message: 'Album not found' });
      }

      debug.log('Found album', { id: album._id, title: album.title });

      const images = await GalleryImage.find({ albumId: album._id });
      debug.log(`Found ${images.length} images for album`);

      // Add image count to album object
      const albumWithCount = {
        ...album.toObject(),
        imageCount: images.length
      };

      res.json({ album: albumWithCount, images });
    } catch (error) {
      debug.error('Error getting album by ID', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'getAlbumById',
        entityId: req.params.id,
        useNextFunction: true,
        next
      });
    }
  },

  // Admin: Create album
  createAlbum: async (req, res, next) => {
    try {
      debug.log('Creating gallery album', { body: req.body });
      const { title, description } = req.body;

      const album = new GalleryAlbum({
        title,
        description: description || ''
      });

      await album.save();
      debug.log('Gallery album created successfully', { id: album._id, title: album.title });

      res.status(201).json({ album });
    } catch (error) {
      debug.error('Error creating gallery album', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'createAlbum',
        useNextFunction: true,
        next
      });
    }
  },

  // Admin: Update album
  updateAlbum: async (req, res, next) => {
    try {
      const { id } = req.params;
      debug.log('Updating gallery album', { id, body: req.body });
      const { title, description } = req.body;

      const album = await GalleryAlbum.findById(id);

      if (!album) {
        debug.log('Album not found', { id });
        return res.status(404).json({ message: 'Album not found' });
      }

      // Update fields
      if (title !== undefined) album.title = title;
      if (description !== undefined) album.description = description;

      await album.save();
      debug.log('Gallery album updated successfully', { id: album._id, title: album.title });

      res.json({ album });
    } catch (error) {
      debug.error('Error updating gallery album', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'updateAlbum',
        entityId: req.params.id,
        useNextFunction: true,
        next
      });
    }
  },

  // Admin: Delete album
  deleteAlbum: async (req, res, next) => {
    try {
      const { id } = req.params;
      debug.log('Deleting gallery album', { id });

      const album = await GalleryAlbum.findById(id);

      if (!album) {
        debug.log('Album not found', { id });
        return res.status(404).json({ message: 'Album not found' });
      }

      debug.log('Found album to delete', { id: album._id, title: album.title });

      // Delete all images in the album
      const images = await GalleryImage.find({ albumId: id });
      debug.log(`Found ${images.length} images to delete`);

      // Track results of image deletions
      const results = {
        total: images.length,
        deleted: 0,
        failed: 0
      };

      for (const image of images) {
        try {
          // Delete image file
          const imagePath = path.join(__dirname, `../uploads/gallery/${id}/${image.filename}`);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            debug.log('Deleted image file', { filename: image.filename });
            results.deleted++;
          } else {
            debug.log('Image file not found', { filename: image.filename });
            results.failed++;
          }

          // Delete image record
          await GalleryImage.findByIdAndDelete(image._id);
          debug.log('Deleted image record', { id: image._id });
        } catch (imageError) {
          debug.error('Error deleting image', imageError);
          results.failed++;
        }
      }

      // Delete album directory
      try {
        const albumDir = path.join(__dirname, `../uploads/gallery/${id}`);
        if (fs.existsSync(albumDir)) {
          fs.rmdirSync(albumDir, { recursive: true });
          debug.log('Deleted album directory', { path: albumDir });
        }
      } catch (dirError) {
        debug.error('Error deleting album directory', dirError);
      }

      // Delete album
      await GalleryAlbum.findByIdAndDelete(id);
      debug.log('Deleted album record', { id });

      res.json({
        message: 'Album deleted successfully',
        results
      });
    } catch (error) {
      debug.error('Error deleting gallery album', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'deleteAlbum',
        entityId: req.params.id,
        useNextFunction: true,
        next
      });
    }
  },

  // Admin: Upload image to album
  uploadImage: [
    uploadGalleryImage.single('image'),
    async (req, res, next) => {
      try {
        const { id } = req.params;
        debug.log('Image upload request received', {
          albumId: id,
          fileInfo: req.file ? {
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
          } : 'No file'
        });

        if (!req.file) {
          debug.log('No file in request');
          return res.status(400).json({ message: 'No image uploaded' });
        }

        const album = await GalleryAlbum.findById(id);

        if (!album) {
          debug.log('Album not found', { id });
          return res.status(404).json({ message: 'Album not found' });
        }

        debug.log('Found album for image upload', { id: album._id, title: album.title });

        // Create image record
        const image = new GalleryImage({
          albumId: id,
          filename: req.file.filename,
          mimeType: req.file.mimetype,
          size: req.file.size
        });

        await image.save();
        debug.log('Image uploaded successfully', {
          imageId: image._id,
          filename: req.file.filename,
          size: req.file.size
        });

        res.status(201).json({ image });
      } catch (error) {
        debug.error('Error uploading image', error);
        controllerUtils.handleControllerError(error, res, {
          context: 'uploadImage',
          entityId: req.params.id,
          useNextFunction: true,
          next
        });
      }
    }
  ],

  // Admin: Delete image
  deleteImage: async (req, res, next) => {
    try {
      const { id } = req.params;
      debug.log('Deleting gallery image', { id });

      const image = await GalleryImage.findById(id);

      if (!image) {
        debug.log('Image not found', { id });
        return res.status(404).json({ message: 'Image not found' });
      }

      debug.log('Found image to delete', { id: image._id, albumId: image.albumId });

      // Delete image file
      let fileDeleted = false;
      const imagePath = path.join(__dirname, `../uploads/gallery/${image.albumId}/${image.filename}`);

      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          debug.log('Deleted image file', { path: imagePath });
          fileDeleted = true;
        } else {
          debug.log('Image file not found', { path: imagePath });
        }
      } catch (fileError) {
        debug.error('Error deleting image file', fileError);
      }

      // Delete image record
      await GalleryImage.findByIdAndDelete(id);
      debug.log('Deleted image record', { id });

      res.json({
        message: 'Image deleted successfully',
        fileDeleted
      });
    } catch (error) {
      debug.error('Error deleting gallery image', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'deleteImage',
        entityId: req.params.id,
        useNextFunction: true,
        next
      });
    }
  },

  // Public: Serve image file
  serveImage: async (req, res, next) => {
    try {
      const { albumId, filename } = req.params;
      debug.log('Serving image request', { albumId, filename });

      const imagePath = path.join(__dirname, `../uploads/gallery/${albumId}/${filename}`);

      if (!fs.existsSync(imagePath)) {
        debug.log('Image not found', { path: imagePath });
        return res.status(404).json({ message: 'Image not found' });
      }

      // Set appropriate content type based on file extension
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream'; // default

      if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === '.png') {
        contentType = 'image/png';
      } else if (ext === '.gif') {
        contentType = 'image/gif';
      } else if (ext === '.webp') {
        contentType = 'image/webp';
      } else if (ext === '.svg') {
        contentType = 'image/svg+xml';
      }

      // Set headers for better caching and performance
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.set('Cross-Origin-Resource-Policy', 'cross-origin'); // Allow cross-origin resource sharing

      debug.log('Sending file', { path: imagePath, contentType });
      res.sendFile(imagePath);
    } catch (error) {
      debug.error('Error serving image', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'serveImage',
        entityId: `${req.params.albumId}/${req.params.filename}`,
        useNextFunction: true,
        next
      });
    }
  }
};

module.exports = galleryController;
