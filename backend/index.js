// Ensure environment variables are loaded before any other code
require('dotenv').config();

// Import logger and debug utilities
// Note: We need to import these after dotenv is configured
const logger = require('./utils/logger');
const serverDebug = require('./utils/serverDebug');

// Add additional diagnostics on startup
const env = process.env.NODE_ENV || 'development';
serverDebug.logServerStartup({
  env,
  port: process.env.PORT || 5000,
  isProd: env === 'production',
  isDev: env === 'development',
  isTest: env === 'test'
});

// Log configuration details
serverDebug.logConfig({
  environment: env,
  mongoURI: process.env.MONGODB_URI ? '[URI SET]' : '[USING DEFAULT]',
  corsOrigin: process.env.CORS_ORIGIN || '(using default)'
});

try {
  // Start the server
  serverDebug.logServiceInit('Express Server');
  require('./server');

  serverDebug.logServiceSuccess('Express Server');
  logger.info('Server startup initiated');
} catch (error) {
  // Log fatal error
  serverDebug.logStartupError(error);
  logger.error({
    message: 'Fatal error during server startup',
    error: error.message,
    stack: error.stack
  });

  process.exit(1);
}
