
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');

// Import configuration
const config = require('./config/config');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const serverDebug = require('./utils/serverDebug');

// Create Express app
const app = express();

// Connect to MongoDB
connectDB()
  .then(() => {
    // Import middleware
    const requestIdMiddleware = require('./middleware/requestId');
    const httpLogger = require('./middleware/logger');
    const securityMiddleware = require('./middleware/security');
    const { apiLimiter } = require('./middleware/rateLimiter');
    const errorHandler = require('./middleware/errorHandler');
    const visitorCounter = require('./middleware/visitorCounter');

    // Import services
    const socketService = require('./services/socketService');
    const sitemapService = require('./services/sitemapService');
    const cleanupService = require('./services/cleanupService');
    const monitoringUtils = require('./utils/monitoringUtils');
    const logger = require('./utils/logger');

    // Import routes
    const authRoutes = require('./routes/authRoutes');
    const publicRoutes = require('./routes/publicRoutes');
    const adminRoutes = require('./routes/adminRoutes');
    const adminCleanupRoutes = require('./routes/adminCleanupRoutes');
    const monitoringRoutes = require('./routes/monitoringRoutes');
    const faqRoutes = require('./routes/faqRoutes');
    const analyticsRoutes = require('./routes/analyticsRoutes');
    const subscriberRoutes = require('./routes/subscriberRoutes');
    const partnerRoutes = require('./routes/partnerRoutes');
    const locationRoutes = require('./routes/locationRoutes');
    const contactRoutes = require('./routes/contactRoutes');
    const aboutRoutes = require('./routes/aboutRoutes');
    const teamRoutes = require('./routes/teamRoutes');

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.io if not in test mode
    const io = config.isTest ? null : socketService.init(server);

    // CORS configuration - Use config values
    app.use(cors({
      origin: config.server.cors.origin,
      credentials: config.server.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'CSRF-Token']
    }));

    // Basic middleware
    app.use(requestIdMiddleware);
    app.use(httpLogger);
    app.use(securityMiddleware.helmet);
    app.use(securityMiddleware.headers);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    // Session middleware
    app.use(session({
      genid: () => uuidv4(),
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: config.isProd,
        httpOnly: true,
        maxAge: config.sessionMaxAge,
        sameSite: 'lax'
      }
    }));

    // Make io accessible to routes
    app.use((req, res, next) => {
      req.io = io;
      next();
    });

    // Apply rate limiting if enabled
    if (config.security.rateLimit.enabled) {
      app.use(apiLimiter);
    }

    // Apply visitor counter middleware (except in test mode)
    if (!config.isTest) {
      app.use(visitorCounter);
    }

    // Serve static files directly with permissive headers
    app.use('/uploads', (req, res, next) => {
      // Disable security policies for image files
      res.removeHeader('Content-Security-Policy');
      res.removeHeader('X-Content-Security-Policy');
      res.removeHeader('X-WebKit-CSP');

      // Set permissive CORS headers
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.header('Cross-Origin-Resource-Policy', 'cross-origin');
      res.header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

      next();
    }, express.static(path.join(__dirname, 'uploads')));

    // Serve public files
    app.use(express.static(path.join(__dirname, 'public')));

    // Routes
    app.use('/api', authRoutes);
    app.use('/api', publicRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/admin/cleanup', adminCleanupRoutes);
    app.use('/api/monitoring', monitoringRoutes);
    app.use('/api/subscribers', subscriberRoutes);
    app.use('/api/partners', partnerRoutes);
    app.use('/api/locations', locationRoutes);
    app.use('/api/contact', contactRoutes);
    app.use('/api/about', aboutRoutes);
    app.use('/api/team', teamRoutes);
    app.use('/', faqRoutes);
    app.use('/', analyticsRoutes);

    // 404 handler for API routes
    app.use('/api', (req, res, next) => {
      // If we get here, no API route has matched
      const debug = require('./utils/debug').createNamespace('404-handler');
      debug.log(`API route not found: ${req.originalUrl}`);

      // Only handle /api routes that haven't been matched
      if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'API endpoint not found'
          }
        });
      }

      // For non-API routes, continue to the next middleware
      next();
    });

    // Error handler
    app.use(errorHandler);

    // Start server
    const PORT = config.port;
    server.listen(PORT, async () => {
      logger.info(`Server running in ${config.env} mode on port ${PORT}`);

      // Start health logging in production
      if (config.isProd) {
        monitoringUtils.startHealthLogging();
      }

      // Generate sitemap files
      try {
        serverDebug.logServiceInit('Sitemap Generator');
        logger.info('Generating sitemap files...');

        await sitemapService.regenerateSitemap();

        serverDebug.logServiceSuccess('Sitemap Generator');
        logger.info('Sitemap files generated successfully');
      } catch (error) {
        serverDebug.logServiceError('Sitemap Generator', error);
        logger.error({
          message: 'Error generating sitemap files',
          error: error.message,
          stack: error.stack
        });
      }

      // Initialize orphaned file cleanup service
      try {
        serverDebug.logServiceInit('Orphaned File Cleanup', { interval: 60 });
        logger.info('Initializing orphaned file cleanup service...');

        // Schedule cleanup every 60 minutes
        cleanupService.scheduleCleanup(60);

        serverDebug.logServiceSuccess('Orphaned File Cleanup');
        logger.info('Orphaned file cleanup service initialized successfully');
      } catch (error) {
        serverDebug.logServiceError('Orphaned File Cleanup', error);
        logger.error({
          message: 'Error initializing orphaned file cleanup service',
          error: error.message,
          stack: error.stack
        });
      }
    });
  })
  .catch(error => {
    const serverDebug = require('./utils/serverDebug');
    const logger = require('./utils/logger');

    serverDebug.logStartupError(error);
    logger.error({
      message: 'Failed to start server',
      error: error.message,
      stack: error.stack
    });

    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error({
    message: 'Unhandled Rejection',
    error: err.message,
    stack: err.stack
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error({
    message: 'Uncaught Exception',
    error: err.message,
    stack: err.stack
  });

  // Exit with error
  process.exit(1);
});

module.exports = app;
