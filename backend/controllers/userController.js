const User = require('../models/User');
const controllerUtils = require('../utils/controllerUtils');
const debug = require('../utils/debug').createNamespace('user-controller');

// Controller for user management (super-admin only)
const userController = {
  // Get all users
  getAllUsers: async (req, res, next) => {
    try {
      debug.log('Fetching all users');
      const users = await User.find().select('-passwordHash');
      debug.log(`Found ${users.length} users`);
      res.json({ users });
    } catch (error) {
      debug.error('Error fetching all users', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'getAllUsers',
        useNextFunction: true,
        next
      });
    }
  },

  // Get user by ID
  getUserById: async (req, res, next) => {
    try {
      const { id } = req.params;
      debug.log('Fetching user by ID', { id });

      const user = await User.findById(id).select('-passwordHash');

      if (!user) {
        debug.log('User not found', { id });
        const error = new Error('User not found');
        error.statusCode = 404;
        return controllerUtils.handleControllerError(error, res, {
          context: 'getUserById',
          entityId: id
        });
      }

      debug.log('Found user', { id: user._id, username: user.username });
      res.json({ user });
    } catch (error) {
      debug.error('Error fetching user by ID', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'getUserById',
        entityId: req.params.id,
        useNextFunction: true,
        next
      });
    }
  },

  // Create user
  createUser: async (req, res, next) => {
    try {
      const { username, password, role } = req.body;
      debug.log('Creating new user', { username, role });

      // Check if username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        debug.log('Username already exists', { username });
        const error = new Error('Username already exists');
        error.statusCode = 409;
        error.code = 'DUPLICATE_ERROR';
        return controllerUtils.handleControllerError(error, res, {
          context: 'createUser',
          entityId: username
        });
      }

      // Create user
      const user = new User({
        username,
        passwordHash: password,
        role: role || 'editor'
      });

      await user.save();
      debug.log('User created successfully', { id: user._id, username: user.username });

      // Return user without password
      const userResponse = user.toObject();
      delete userResponse.passwordHash;

      res.status(201).json({ user: userResponse });
    } catch (error) {
      debug.error('Error creating user', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'createUser',
        useNextFunction: true,
        next
      });
    }
  },

  // Update user
  updateUser: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { username, password, role } = req.body;
      debug.log('Updating user', { id, username, role });

      const user = await User.findById(id);

      if (!user) {
        debug.log('User not found', { id });
        const error = new Error('User not found');
        error.statusCode = 404;
        return controllerUtils.handleControllerError(error, res, {
          context: 'updateUser',
          entityId: id
        });
      }

      // Track if any changes were made
      let changes = [];

      // Update fields
      if (username !== undefined && username !== user.username) {
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser && existingUser._id.toString() !== id) {
          debug.log('Username already exists', { username });
          const error = new Error('Username already exists');
          error.statusCode = 409;
          return controllerUtils.handleControllerError(error, res, {
            context: 'updateUser',
            entityId: id
          });
        }

        user.username = username;
        changes.push('username');
      }

      if (password) {
        user.passwordHash = password;
        changes.push('password');
      }

      if (role !== undefined) {
        user.role = role;
        changes.push('role');
      }

      if (changes.length > 0) {
        await user.save();
        debug.log('User updated successfully', { id: user._id, username: user.username, changes });
      } else {
        debug.log('No changes to update', { id });
      }

      // Return user without password
      const userResponse = user.toObject();
      delete userResponse.passwordHash;

      res.json({
        user: userResponse,
        changes: changes.length > 0 ? changes : null
      });
    } catch (error) {
      debug.error('Error updating user', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'updateUser',
        entityId: req.params.id,
        useNextFunction: true,
        next
      });
    }
  },

  // Delete user
  deleteUser: async (req, res, next) => {
    try {
      const { id } = req.params;
      debug.log('Deleting user', { id });

      // Prevent deleting yourself
      if (id === req.user._id.toString()) {
        debug.log('Attempted to delete own account', { userId: req.user._id });
        const error = new Error('Cannot delete your own account');
        error.statusCode = 403;
        return controllerUtils.handleControllerError(error, res, {
          context: 'deleteUser',
          entityId: id
        });
      }

      const user = await User.findById(id);

      if (!user) {
        debug.log('User not found', { id });
        const error = new Error('User not found');
        error.statusCode = 404;
        return controllerUtils.handleControllerError(error, res, {
          context: 'deleteUser',
          entityId: id
        });
      }

      debug.log('Found user to delete', { id: user._id, username: user.username });
      await User.findByIdAndDelete(id);
      debug.log('User deleted successfully', { id });

      res.json({
        message: 'User deleted successfully',
        username: user.username
      });
    } catch (error) {
      debug.error('Error deleting user', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'deleteUser',
        entityId: req.params.id,
        useNextFunction: true,
        next
      });
    }
  }
};

module.exports = userController;
