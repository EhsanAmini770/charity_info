const mongoose = require('mongoose');
const News = require('../models/News');
const Attachment = require('../models/Attachment');
const { uploadNewsAttachment } = require('../services/uploadService');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const controllerUtils = require('../utils/controllerUtils');
const debug = require('../utils/debug').createNamespace('news-controller');

// GridFS setup for attachments
let gfs;

// Initialize GridFS bucket
const initGridFS = () => {
  if (!gfs && mongoose.connection.readyState === 1) {
    try {
      gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'attachments'
      });
      debug.log('GridFS bucket initialized successfully');
    } catch (error) {
      debug.error('Error initializing GridFS bucket', error);
    }
  }
  return gfs;
};

// Initialize on connection
mongoose.connection.once('open', () => {
  initGridFS();
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/attachments');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Controller for news
const newsController = {
  // Admin: Get all news for admin panel
  getAllNewsAdmin: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      debug.log('Fetching all news articles for admin', { page, limit });

      // Execute query with pagination (no date filtering for admin)
      const news = await News.find({})
        .sort({ publishDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'username')
        .select('-attachments');

      // Get total count for pagination
      const total = await News.countDocuments({});

      debug.log('Found news articles for admin', { count: news.length, total });

      res.json({
        news,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      debug.error('Error fetching all news articles for admin', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'getAllNewsAdmin',
        useNextFunction: true,
        next
      });
    }
  },

  // Public: Get all news with pagination and search
  getAllNews: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const searchQuery = req.query.q || '';

      debug.log('Fetching all news articles', { page, limit, searchQuery });

      // Build query
      let query = {};

      // Add search if provided
      if (searchQuery) {
        query.$text = { $search: searchQuery };
        debug.log('Added text search to query', { searchQuery });
      }

      // Add date filters
      const now = new Date();
      query.publishDate = { $lte: now };
      query.$or = [
        { expiryDate: { $gt: now } },
        { expiryDate: null }
      ];
      debug.log('Added date filters to query', { now });

      // Execute query with pagination
      const news = await News.find(query)
        .sort({ publishDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'username')
        .select('-attachments');

      // Get total count for pagination
      const total = await News.countDocuments(query);

      debug.log('Found news articles', { count: news.length, total });

      res.json({
        news,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      debug.error('Error fetching all news articles', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'getAllNews',
        useNextFunction: true,
        next
      });
    }
  },

  // Admin: Get single news by ID
  getNewsById: async (req, res, next) => {
    try {
      const { id } = req.params;
      debug.log('Fetching news article by ID', { id });

      const news = await News.findById(id)
        .populate('author', 'username')
        .populate('attachments');

      if (!news) {
        debug.log('News article not found', { id });
        return res.status(404).json({ message: 'News not found' });
      }

      debug.log('News article found', { id: news._id, title: news.title });
      res.json({ news });
    } catch (error) {
      debug.error('Error fetching news article by ID', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'getNewsById',
        entityId: req.params.id,
        useNextFunction: true,
        next
      });
    }
  },

  // Public: Get single news by slug
  getNewsBySlug: async (req, res, next) => {
    try {
      const { slug } = req.params;
      debug.log('Fetching news article by slug', { slug });

      const news = await News.findOne({ slug })
        .populate('author', 'username')
        .populate('attachments');

      if (!news) {
        debug.log('News article not found', { slug });
        return res.status(404).json({ message: 'News not found' });
      }

      debug.log('News article found', { id: news._id, title: news.title, slug });
      res.json({ news });
    } catch (error) {
      debug.error('Error fetching news article by slug', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'getNewsBySlug',
        entityId: req.params.slug,
        useNextFunction: true,
        next
      });
    }
  },

  // Admin: Create news
  createNews: async (req, res, next) => {
    try {
      debug.log('Creating news article', { body: req.body });
      const { title, body, publishDate, expiryDate } = req.body;

      const news = new News({
        title,
        body,
        publishDate: publishDate || Date.now(),
        expiryDate: expiryDate || null,
        author: req.user._id
      });

      await news.save();
      debug.log('News article created successfully', { id: news._id, title: news.title });

      res.status(201).json({ news });
    } catch (error) {
      debug.error('Error creating news article', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'createNews',
        useNextFunction: true,
        next
      });
    }
  },

  // Admin: Update news
  updateNews: async (req, res, next) => {
    try {
      const { id } = req.params;
      debug.log('Updating news article', { id, body: req.body });
      const { title, body, publishDate, expiryDate } = req.body;

      const news = await News.findById(id);

      if (!news) {
        debug.log('News article not found', { id });
        return res.status(404).json({ message: 'News not found' });
      }

      // Update fields
      if (title !== undefined) news.title = title;
      if (body !== undefined) news.body = body;
      if (publishDate !== undefined) news.publishDate = publishDate;
      // expiryDate can be null, so we need to check if it's undefined
      news.expiryDate = expiryDate;

      await news.save();
      debug.log('News article updated successfully', { id: news._id, title: news.title });

      res.json({ news });
    } catch (error) {
      debug.error('Error updating news article', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'updateNews',
        entityId: req.params.id,
        useNextFunction: true,
        next
      });
    }
  },

  // Admin: Delete news
  deleteNews: async (req, res, next) => {
    try {
      const { id } = req.params;
      logger.info(`Attempting to delete news with ID: ${id}`);

      const news = await News.findById(id);

      if (!news) {
        logger.warn(`News with ID ${id} not found`);
        return res.status(404).json({ message: 'News not found' });
      }

      logger.info(`Found news with title: ${news.title}, attachments count: ${news.attachments.length}`);

      // Track results of attachment deletions
      const results = {
        total: news.attachments.length,
        deleted: 0,
        failed: 0,
        notFound: 0
      };

      // Delete all attachments
      for (const attachmentId of news.attachments) {
        try {
          logger.info(`Processing attachment with ID: ${attachmentId}`);
          const attachment = await Attachment.findById(attachmentId);

          if (attachment) {
            logger.info(`Found attachment: ${attachment.filename}`);

            // Delete the file using the safe delete utility
            let deleteSuccess = false;
            const uploadsDir = path.join(__dirname, '../uploads');

            if (attachment.storedInFileSystem) {
              // For filesystem storage
              const filePath = path.join(uploadsDir, attachment.filename);
              deleteSuccess = await controllerUtils.safeDeleteFile({
                fileId: attachment.filename,
                storageType: 'filesystem',
                filePath,
                entityType: 'news',
                entityId: id
              });
            } else {
              // For GridFS storage
              const gridFSBucket = initGridFS();
              deleteSuccess = await controllerUtils.safeDeleteFile({
                fileId: attachment.filename,
                storageType: 'gridfs',
                gridFSBucket,
                entityType: 'news',
                entityId: id
              });
            }

            if (deleteSuccess) {
              results.deleted++;
            } else {
              results.failed++;
              logger.warn(`File deletion failed but continuing with record deletion: ${attachment.filename}`);
            }

            // Delete attachment record
            await Attachment.findByIdAndDelete(attachmentId);
            logger.info(`Attachment record deleted: ${attachmentId}`);
          } else {
            logger.warn(`Attachment with ID ${attachmentId} not found`);
            results.notFound++;
          }
        } catch (attachmentError) {
          results.failed++;
          controllerUtils.handleControllerError(attachmentError, res, {
            context: `deleteNews.attachment.${attachmentId}`,
            entityId: id,
            useNextFunction: false
          });
          // Continue with other attachments even if one fails
        }
      }

      // Delete news
      await News.findByIdAndDelete(id);
      logger.info(`News deleted successfully: ${id}`);

      res.json({
        message: 'News deleted successfully',
        attachments: results
      });
    } catch (error) {
      controllerUtils.handleControllerError(error, res, {
        context: 'deleteNews',
        entityId: req.params.id,
        useNextFunction: true,
        next
      });
    }
  },

  // Admin: Get attachments for a news
  getAttachments: async (req, res, next) => {
    try {
      const { id } = req.params;

      const news = await News.findById(id).populate('attachments');

      if (!news) {
        return res.status(404).json({ message: 'News not found' });
      }

      res.json({ attachments: news.attachments });
    } catch (error) {
      next(error);
    }
  },

  // Admin: Upload attachment
  uploadAttachment: [
    uploadNewsAttachment.single('file'),
    async (req, res, next) => {
      try {
        const { id } = req.params;

        debug.log('Attachment upload request received', {
          newsId: id,
          body: req.body,
          file: req.file ? {
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
          } : 'No file'
        });

        if (!req.file) {
          debug.error('No file in request');
          const error = new Error('No file uploaded');
          error.statusCode = 400;
          return controllerUtils.handleControllerError(error, res, {
            context: 'uploadAttachment'
          });
        }

        const news = await News.findById(id);

        if (!news) {
          debug.error(`News with ID ${id} not found`);
          const error = new Error('News not found');
          error.statusCode = 404;
          return controllerUtils.handleControllerError(error, res, {
            context: 'uploadAttachment',
            entityId: id
          });
        }

        // Initialize GridFS if not already initialized
        const gridFSBucket = initGridFS();

        // Check if GridFS is available
        if (gridFSBucket) {
          // Use GridFS for file storage
          try {
            // Create a stream to upload to GridFS
            const uploadStream = gridFSBucket.openUploadStream(req.file.originalname);

            // Create attachment record
            const attachment = new Attachment({
              filename: uploadStream.id.toString(),
              mimeType: req.file.mimetype,
              size: req.file.size,
              newsId: id
            });

            // Upload file to GridFS
            uploadStream.end(req.file.buffer);

            // Save attachment record
            await attachment.save();

            // Add attachment to news
            news.attachments.push(attachment._id);
            await news.save();

            res.status(201).json({ attachment });
          } catch (gridFSError) {
            debug.error('GridFS upload failed, falling back to file system', gridFSError);
            // Fall back to file system storage
            useFileSystemStorage();
          }
        } else {
          // Fall back to file system storage if GridFS is not available
          useFileSystemStorage();
        }

        // Function to use file system storage as fallback
        async function useFileSystemStorage() {
          debug.log('Using file system storage as fallback');

          // Ensure uploads directory exists
          if (!fs.existsSync(uploadsDir)) {
            debug.log('Creating uploads directory:', uploadsDir);
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          // Generate a unique filename
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const filename = `${timestamp}-${randomString}${path.extname(req.file.originalname)}`;
          const filePath = path.join(uploadsDir, filename);

          debug.log('Writing file to:', filePath);

          try {
            // Write the file to disk
            fs.writeFileSync(filePath, req.file.buffer);
            debug.log('File written successfully');
          } catch (fsError) {
            debug.error('Error writing file to disk', fsError);
            throw fsError;
          }

          // Create attachment record
          const attachment = new Attachment({
            filename: filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            newsId: id,
            storedInFileSystem: true // Flag to indicate this is stored in the file system
          });

          // Save attachment record
          await attachment.save();

          // Add attachment to news
          news.attachments.push(attachment._id);
          await news.save();

          res.status(201).json({ attachment });
        }
      } catch (error) {
        debug.error('Error in uploadAttachment', error);
        controllerUtils.handleControllerError(error, res, {
          context: 'uploadAttachment',
          entityId: req.params.id,
          useNextFunction: true,
          next
        });
      }
    }
  ],

  // Admin: Delete attachment
  deleteAttachment: async (req, res, next) => {
    try {
      const { id, attachmentId } = req.params;
      logger.info(`Deleting attachment: newsId=${id}, attachmentId=${attachmentId}`);

      const news = await News.findById(id);
      if (!news) {
        debug.log('News not found', { id });
        const error = new Error('News not found');
        error.statusCode = 404;
        return controllerUtils.handleControllerError(error, res, {
          context: 'deleteAttachment',
          entityId: id
        });
      }

      const attachment = await Attachment.findById(attachmentId);
      if (!attachment) {
        logger.warn(`Attachment with ID ${attachmentId} not found`);
        const error = new Error('Attachment not found');
        error.statusCode = 404;
        return controllerUtils.handleControllerError(error, res, {
          context: 'deleteAttachment',
          entityId: attachmentId
        });
      }

      // Remove attachment from news
      news.attachments = news.attachments.filter(a => a.toString() !== attachmentId);
      await news.save();

      // Delete the file using the safe delete utility
      let deleteSuccess = false;

      if (attachment.storedInFileSystem) {
        // For filesystem storage
        const filePath = path.join(uploadsDir, attachment.filename);
        deleteSuccess = await controllerUtils.safeDeleteFile({
          fileId: attachment.filename,
          storageType: 'filesystem',
          filePath,
          entityType: 'news',
          entityId: id
        });
      } else {
        // For GridFS storage
        const gridFSBucket = initGridFS();
        deleteSuccess = await controllerUtils.safeDeleteFile({
          fileId: attachment.filename,
          storageType: 'gridfs',
          gridFSBucket,
          entityType: 'news',
          entityId: id
        });
      }

      if (!deleteSuccess) {
        logger.warn(`File deletion failed but continuing with record deletion: ${attachment.filename}`);
      }

      // Delete attachment record
      await Attachment.findByIdAndDelete(attachmentId);
      logger.info(`Attachment ${attachmentId} deleted successfully`);

      res.json({
        message: 'Attachment deleted successfully',
        fileDeleted: deleteSuccess
      });
    } catch (error) {
      controllerUtils.handleControllerError(error, res, {
        context: 'deleteAttachment',
        entityId: req.params.attachmentId,
        useNextFunction: true,
        next
      });
    }
  },

  // Public: Download attachment
  downloadAttachment: async (req, res, next) => {
    try {
      const { id } = req.params;

      const attachment = await Attachment.findById(id);

      if (!attachment) {
        debug.log('Attachment not found', { id });
        const error = new Error('Attachment not found');
        error.statusCode = 404;
        return controllerUtils.handleControllerError(error, res, {
          context: 'downloadAttachment',
          entityId: id
        });
      }

      // Set content type
      res.set('Content-Type', attachment.mimeType);
      res.set('Content-Disposition', `attachment; filename="${attachment.filename}"`);

      // Check if the attachment is stored in the file system
      if (attachment.storedInFileSystem) {
        // Serve file from the file system
        const filePath = path.join(uploadsDir, attachment.filename);
        if (fs.existsSync(filePath)) {
          return res.sendFile(filePath);
        } else {
          debug.error(`File not found at path: ${filePath}`);
          const error = new Error('Attachment file not found');
          error.statusCode = 404;
          return controllerUtils.handleControllerError(error, res, {
            context: 'downloadAttachment',
            entityId: id
          });
        }
      } else {
        // Initialize GridFS if not already initialized
        const gridFSBucket = initGridFS();

        if (!gridFSBucket) {
          debug.error('GridFS not available');
          const error = new Error('GridFS not available');
          error.statusCode = 500;
          return controllerUtils.handleControllerError(error, res, {
            context: 'downloadAttachment'
          });
        }

        try {
          // Stream file from GridFS to response
          const downloadStream = gridFSBucket.openDownloadStream(new mongoose.Types.ObjectId(attachment.filename));
          downloadStream.pipe(res);
        } catch (error) {
          debug.error('Error streaming file from GridFS', error);
          const err = new Error('Error streaming file');
          err.statusCode = 500;
          return controllerUtils.handleControllerError(err, res, {
            context: 'downloadAttachment',
            entityId: id
          });
        }
      }
    } catch (error) {
      debug.error('Error in downloadAttachment', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'downloadAttachment',
        entityId: req.params.id,
        useNextFunction: true,
        next
      });
    }
  },

  // Public: View attachment content (for text files and images)
  viewAttachmentContent: async (req, res, next) => {
    try {
      const { id } = req.params;

      const attachment = await Attachment.findById(id);

      if (!attachment) {
        debug.log('Attachment not found', { id });
        const error = new Error('Attachment not found');
        error.statusCode = 404;
        return controllerUtils.handleControllerError(error, res, {
          context: 'viewAttachmentContent',
          entityId: id
        });
      }

      // Check if it's a text file or image
      const isTextFile = attachment.mimeType === 'text/plain' ||
                        attachment.filename.toLowerCase().endsWith('.txt');
      const isImage = attachment.mimeType.startsWith('image/');

      // For images, serve the file directly
      if (isImage) {
        if (attachment.storedInFileSystem) {
          // Serve file from the file system
          const filePath = path.join(uploadsDir, attachment.filename);
          if (fs.existsSync(filePath)) {
            // Set appropriate headers
            res.setHeader('Content-Type', attachment.mimeType);
            res.setHeader('Content-Disposition', `inline; filename="${attachment.originalname || attachment.filename}"`);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

            // Stream the file
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
            return;
          } else {
            debug.error(`File not found at path: ${filePath}`);
            const error = new Error('Attachment file not found');
            error.statusCode = 404;
            return controllerUtils.handleControllerError(error, res, {
              context: 'viewAttachmentContent',
              entityId: id
            });
          }
        } else {
          // Initialize GridFS if not already initialized
          const gridFSBucket = initGridFS();

          if (!gridFSBucket) {
            debug.error('GridFS not available');
            const error = new Error('GridFS not available');
            error.statusCode = 500;
            return controllerUtils.handleControllerError(error, res, {
              context: 'viewAttachmentContent'
            });
          }

          try {
            // Set appropriate headers
            res.setHeader('Content-Type', attachment.mimeType);
            res.setHeader('Content-Disposition', `inline; filename="${attachment.originalname || attachment.filename}"`);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

            // Create a download stream from GridFS and pipe it to the response
            const downloadStream = gridFSBucket.openDownloadStream(new mongoose.Types.ObjectId(attachment.filename));
            downloadStream.pipe(res);
            return;
          } catch (error) {
            debug.error('Error streaming file from GridFS', error);
            const err = new Error('Error streaming file');
            err.statusCode = 500;
            return controllerUtils.handleControllerError(err, res, {
              context: 'viewAttachmentContent',
              entityId: id
            });
          }
        }
      }

      // For text files
      if (isTextFile) {
        let fileContent = '';

        // Get content based on storage method
        if (attachment.storedInFileSystem) {
          // Read file from the file system
          const filePath = path.join(uploadsDir, attachment.filename);
          if (fs.existsSync(filePath)) {
            fileContent = fs.readFileSync(filePath, 'utf8');
          } else {
            debug.error(`File not found at path: ${filePath}`);
            const error = new Error('Attachment file not found');
            error.statusCode = 404;
            return controllerUtils.handleControllerError(error, res, {
              context: 'viewAttachmentContent',
              entityId: id
            });
          }
        } else {
          // Initialize GridFS if not already initialized
          const gridFSBucket = initGridFS();

          if (!gridFSBucket) {
            debug.error('GridFS not available');
            const error = new Error('GridFS not available');
            error.statusCode = 500;
            return controllerUtils.handleControllerError(error, res, {
              context: 'viewAttachmentContent'
            });
          }

          try {
            // Get file from GridFS
            const downloadStream = gridFSBucket.openDownloadStream(new mongoose.Types.ObjectId(attachment.filename));

            // Collect data chunks
            const chunks = [];

            // Handle data events
            downloadStream.on('data', (chunk) => {
              chunks.push(chunk);
            });

            // Handle end event
            downloadStream.on('end', () => {
              // Combine chunks and convert to string
              fileContent = Buffer.concat(chunks).toString('utf8');
              res.json({ content: fileContent, filename: attachment.filename });
            });

            // Handle error event
            downloadStream.on('error', (error) => {
              debug.error('Error reading from GridFS', error);
              const err = new Error('Error reading file content');
              err.statusCode = 500;
              controllerUtils.handleControllerError(err, res, {
                context: 'viewAttachmentContent',
                entityId: id
              });
            });

            // Return early as we're handling the response in the event handlers
            return;
          } catch (error) {
            debug.error('Error accessing GridFS', error);
            const err = new Error('Error accessing file storage');
            err.statusCode = 500;
            return controllerUtils.handleControllerError(err, res, {
              context: 'viewAttachmentContent',
              entityId: id
            });
          }
        }

        // Return the file content for file system storage
        res.json({ content: fileContent, filename: attachment.filename });
        return;
      }

      // If neither text nor image
      const error = new Error('This endpoint only supports text files and images');
      error.statusCode = 400;
      error.details = {
        mimeType: attachment.mimeType,
        filename: attachment.filename
      };
      return controllerUtils.handleControllerError(error, res, {
        context: 'viewAttachmentContent',
        entityId: id
      });
    } catch (error) {
      debug.error('Error in viewAttachmentContent', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'viewAttachmentContent',
        entityId: req.params.id,
        useNextFunction: true,
        next
      });
    }
  }
};

module.exports = newsController;
