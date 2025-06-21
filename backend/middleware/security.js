const helmet = require('helmet');
const config = require('../config/config');

/**
 * Security middleware
 * Applies various security headers and protections
 */
const securityMiddleware = {
  // Apply helmet security headers
  helmet: helmet(config.security.helmet),
  
  // Add security headers middleware
  headers: (req, res, next) => {
    // Strict Transport Security
    if (config.isProd) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Disable caching for API responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    next();
  }
};

module.exports = securityMiddleware;
