const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/aboutController');
const { validateUpdateAbout, validateGetAbout } = require('../validations/aboutValidationFlex');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const debug = require('../utils/debug').createNamespace('about-routes');

// Public routes
router.get('/', validateGetAbout, aboutController.getAboutContent);

// Admin routes
router.post('/', isAuthenticated, isAdmin, validateUpdateAbout, aboutController.updateAboutContent);

// Log all routes
debug.log('About routes initialized');

module.exports = router;
