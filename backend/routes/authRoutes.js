const express = require('express');
const authController = require('../controllers/authController');
const csrfProtection = require('../middleware/csrf');
const { validateLogin } = require('../validations/userValidationFlex');
const debug = require('../utils/debug').createNamespace('auth-routes');

const router = express.Router();

// CSRF token route
router.get('/csrf-token', csrfProtection, authController.getCsrfToken);

// Auth routes
router.post('/auth/login', validateLogin, authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', authController.getCurrentUser);

module.exports = router;
