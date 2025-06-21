require('dotenv').config();
const path = require('path');

/**
 * Load environment-specific configuration
 */
const env = process.env.NODE_ENV || 'development';
const envConfig = require(`./environments/${env}`);

/**
 * Export configuration with environment-specific overrides
 */
module.exports = {
  // Environment
  env,
  isDev: env === 'development',
  isProd: env === 'production',
  isTest: env === 'test',
  
  // Server
  port: envConfig.server.port,
  server: {
    cors: {
      origin: envConfig.server.cors.origin,
      credentials: envConfig.server.cors.credentials
    }
  },
  
  // Database
  mongoURI: envConfig.database.uri,
  mongoOptions: envConfig.database.options,
  
  // Authentication
  jwtSecret: envConfig.auth.jwtSecret,
  jwtExpiresIn: envConfig.auth.jwtExpiresIn,
  sessionSecret: envConfig.auth.sessionSecret,
  sessionMaxAge: envConfig.auth.sessionMaxAge,
  
  // Logging
  logging: envConfig.logging,
  
  // Security
  security: envConfig.security,
  
  // File uploads
  uploads: envConfig.uploads,
  
  // Slugify options
  slugifyOptions: envConfig.slugify,
  
  // Online user timeout
  onlineUserTimeout: envConfig.onlineUserTimeout,
  
  // Site URL
  siteUrl: envConfig.siteUrl,
  
  // Paths
  paths: {
    root: path.resolve(__dirname, '..'),
    public: path.resolve(__dirname, '../public'),
    uploads: path.resolve(__dirname, '../uploads'),
    logs: path.resolve(__dirname, '../logs')
  }
};
