const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const debug = require('../utils/debug').createNamespace('auth-middleware');
const errorUtils = require('../utils/errorUtils');

// Middleware to check if user is authenticated
exports.isAuthenticated = async (req, res, next) => {
  try {
    // Check if user is authenticated via session
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.user = user;
        return next();
      }
    }

    // Check if user is authenticated via JWT
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      debug.log('Authentication required - no token provided');
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required'
        }
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId);

    if (!user) {
      debug.log('Authentication failed - user not found');
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    debug.error('Authentication error', error);
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token'
      }
    });
  }
};

// Middleware to check if user is an editor or super-admin
exports.isEditor = (req, res, next) => {
  if (!req.user || !['editor', 'super-admin'].includes(req.user.role)) {
    debug.log('Access denied - editor role required', { userRole: req.user?.role });
    return res.status(403).json({
      success: false,
      error: {
        code: 'EDITOR_ACCESS_REQUIRED',
        message: 'Editor access required'
      }
    });
  }
  next();
};

// Middleware to check if user is a super-admin
// Note: This middleware is used for routes that should only be accessible to super-admin users
exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super-admin') {
    debug.log('Access denied - admin role required', { userRole: req.user?.role });
    return res.status(403).json({
      success: false,
      error: {
        code: 'ADMIN_ACCESS_REQUIRED',
        message: 'Admin access required'
      }
    });
  }
  next();
};

// Middleware to check if user is a super-admin
exports.isSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super-admin') {
    debug.log('Access denied - super-admin role required', { userRole: req.user?.role });
    return res.status(403).json({
      success: false,
      error: {
        code: 'SUPER_ADMIN_ACCESS_REQUIRED',
        message: 'Super-admin access required'
      }
    });
  }
  next();
};
