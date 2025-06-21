/**
 * Server debug utility
 * Provides debug functions for server startup and configuration
 */

const debug = require('./debug');
const logger = require('./logger');

// Create namespaces for different server components
const server = debug.createNamespace('server');
const config = debug.createNamespace('config');
const database = debug.createNamespace('database');
const startup = debug.createNamespace('startup');

/**
 * Log server startup information
 * @param {object} options - Server options
 */
const logServerStartup = (options) => {
  const { env, port, isProd, isDev, isTest } = options;
  
  startup.log(`Server starting in ${env} mode on port ${port}`);
  startup.log('Environment details', { isProd, isDev, isTest });
  
  // Log to main logger as well
  logger.info(`Server running in ${env} mode on port ${port}`);
};

/**
 * Log configuration information
 * @param {object} config - Configuration object
 */
const logConfig = (configObj) => {
  // Sanitize configuration before logging
  const sanitizedConfig = { ...configObj };
  
  // Remove sensitive information
  if (sanitizedConfig.jwtSecret) sanitizedConfig.jwtSecret = '[REDACTED]';
  if (sanitizedConfig.sessionSecret) sanitizedConfig.sessionSecret = '[REDACTED]';
  if (sanitizedConfig.mongoURI) sanitizedConfig.mongoURI = '[REDACTED]';
  
  config.log('Loaded configuration', sanitizedConfig);
};

/**
 * Log database connection information
 * @param {object} connection - Mongoose connection object
 */
const logDatabaseConnection = (connection) => {
  database.log(`MongoDB Connected: ${connection.host}`);
  database.log('Database details', {
    name: connection.name,
    host: connection.host,
    port: connection.port,
    models: Object.keys(connection.models)
  });
};

/**
 * Log database connection error
 * @param {Error} error - Connection error
 */
const logDatabaseError = (error) => {
  database.error('MongoDB Connection Error', error);
};

/**
 * Log server startup error
 * @param {Error} error - Startup error
 */
const logStartupError = (error) => {
  startup.error('Server startup failed', error);
};

/**
 * Log service initialization
 * @param {string} serviceName - Name of the service
 * @param {object} details - Service details
 */
const logServiceInit = (serviceName, details = {}) => {
  server.log(`Initializing ${serviceName} service`, details);
};

/**
 * Log service initialization success
 * @param {string} serviceName - Name of the service
 * @param {object} details - Service details
 */
const logServiceSuccess = (serviceName, details = {}) => {
  server.log(`${serviceName} service initialized successfully`, details);
};

/**
 * Log service initialization error
 * @param {string} serviceName - Name of the service
 * @param {Error} error - Initialization error
 */
const logServiceError = (serviceName, error) => {
  server.error(`Error initializing ${serviceName} service`, error);
};

module.exports = {
  logServerStartup,
  logConfig,
  logDatabaseConnection,
  logDatabaseError,
  logStartupError,
  logServiceInit,
  logServiceSuccess,
  logServiceError
};
