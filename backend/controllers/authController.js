const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const controllerUtils = require('../utils/controllerUtils');
const debug = require('../utils/debug').createNamespace('auth-controller');

// Controller for authentication
const authController = {
  // Login user
  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;
      debug.log('Login attempt', { username });

      // Find user
      const user = await User.findOne({ username });
      if (!user) {
        debug.log('Login failed: user not found', { username });
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        error.code = 'INVALID_CREDENTIALS';
        return controllerUtils.handleControllerError(error, res, {
          context: 'login'
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        debug.log('Login failed: invalid password', { username });
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        error.code = 'INVALID_CREDENTIALS';
        return controllerUtils.handleControllerError(error, res, {
          context: 'login'
        });
      }

      debug.log('Login successful', { userId: user._id, username: user.username, role: user.role });

      // Create session
      req.session.userId = user._id;

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        config.jwtSecret,
        { expiresIn: '1d' }
      );

      // Return user info and token
      res.json({
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        },
        token
      });
    } catch (error) {
      debug.error('Error during login', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'login',
        useNextFunction: true,
        next
      });
    }
  },

  // Logout user
  logout: (req, res) => {
    const userId = req.session?.userId;
    debug.log('Logout attempt', { userId });

    req.session.destroy(err => {
      if (err) {
        debug.error('Error destroying session', err);
        const error = new Error('Error logging out');
        error.statusCode = 500;
        error.code = 'SESSION_ERROR';
        return controllerUtils.handleControllerError(error, res, {
          context: 'logout'
        });
      }

      res.clearCookie('connect.sid');
      debug.log('Logout successful', { userId });
      res.json({ message: 'Logged out successfully' });
    });
  },

  // Get current user info
  getCurrentUser: async (req, res, next) => {
    try {
      debug.log('Get current user request');

      if (!req.session.userId) {
        debug.log('Not authenticated: no user ID in session');
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        error.code = 'NOT_AUTHENTICATED';
        return controllerUtils.handleControllerError(error, res, {
          context: 'getCurrentUser'
        });
      }

      const user = await User.findById(req.session.userId).select('-passwordHash');
      if (!user) {
        debug.log('User not found in database', { userId: req.session.userId });
        const error = new Error('User not found');
        error.statusCode = 401;
        error.code = 'USER_NOT_FOUND';
        return controllerUtils.handleControllerError(error, res, {
          context: 'getCurrentUser',
          entityId: req.session.userId
        });
      }

      debug.log('Current user found', { userId: user._id, username: user.username, role: user.role });
      res.json({
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      debug.error('Error getting current user', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'getCurrentUser',
        entityId: req.session.userId,
        useNextFunction: true,
        next
      });
    }
  },

  // Get CSRF token
  getCsrfToken: (req, res) => {
    debug.log('CSRF token requested');
    const token = req.csrfToken();
    debug.log('CSRF token generated');
    res.json({ csrfToken: token });
  }
};

module.exports = authController;
