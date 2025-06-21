const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');
const debug = require('../utils/debug').createNamespace('upload-service');

// Create uploads directory if it doesn't exist
const createUploadDirs = () => {
  // Create gallery uploads directory
  const galleryDir = path.join(__dirname, '../uploads/gallery');
  if (!fs.existsSync(galleryDir)) {
    debug.log('Creating gallery uploads directory:', galleryDir);
    fs.mkdirSync(galleryDir, { recursive: true });
  }

  // Create news uploads directory (for file system fallback)
  const newsDir = path.join(__dirname, '../uploads/news');
  if (!fs.existsSync(newsDir)) {
    debug.log('Creating news uploads directory:', newsDir);
    fs.mkdirSync(newsDir, { recursive: true });
  }

  debug.log('Upload directories initialized');
};

// Initialize directories
createUploadDirs();

// Configure storage for news attachments (using GridFS in the controller)
const newsAttachmentStorage = multer.memoryStorage();

// Configure storage for gallery images
const galleryImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const albumId = req.params.id;
    const albumDir = path.join(__dirname, `../uploads/gallery/${albumId}`);

    // Create album directory if it doesn't exist
    if (!fs.existsSync(albumDir)) {
      fs.mkdirSync(albumDir, { recursive: true });
    }

    cb(null, albumDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter for news attachments
const newsAttachmentFilter = (req, file, cb) => {
  const allowedTypes = config.uploads.news.allowedTypes;
  const fileExt = path.extname(file.originalname).toLowerCase();

  debug.log('File upload attempt:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    extension: fileExt
  });

  if (allowedTypes.includes(file.mimetype) ||
      allowedTypes.includes(fileExt) ||
      (fileExt === '.txt' && file.mimetype === 'text/plain')) {
    debug.log('File type allowed');
    cb(null, true);
  } else {
    debug.log('File type rejected');
    cb(new Error(`Invalid file type: ${file.mimetype}. Only text files and images are allowed.`), false);
  }
};

// File filter for gallery images
const galleryImageFilter = (req, file, cb) => {
  const allowedTypes = config.uploads.gallery.allowedTypes;

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and GIF images are allowed.'), false);
  }
};

// Configure multer for news attachments
const uploadNewsAttachment = multer({
  storage: newsAttachmentStorage,
  fileFilter: newsAttachmentFilter,
  limits: {
    fileSize: config.uploads.news.maxSize
  }
});

// Configure multer for gallery images
const uploadGalleryImage = multer({
  storage: galleryImageStorage,
  fileFilter: galleryImageFilter,
  limits: {
    fileSize: config.uploads.gallery.maxSize
  }
});

module.exports = {
  uploadNewsAttachment,
  uploadGalleryImage
};
