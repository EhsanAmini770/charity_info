const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const {
  validateContactSubmission,
  validateGetContacts,
  validateGetContactById,
  validateUpdateContactStatus,
  validateDeleteContact
} = require('../validations/contactValidationFlex');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const debug = require('../utils/debug').createNamespace('contact-routes');

// Public routes
router.post('/', validateContactSubmission, contactController.submitContactForm);

// Admin routes
router.get('/', isAuthenticated, isAdmin, validateGetContacts, contactController.getAllContacts);
router.get('/:id', isAuthenticated, isAdmin, validateGetContactById, contactController.getContactById);
// Support both PATCH and PUT for status updates
router.patch('/:id/status', isAuthenticated, isAdmin, validateUpdateContactStatus, contactController.updateContactStatus);
router.put('/:id/status', isAuthenticated, isAdmin, validateUpdateContactStatus, contactController.updateContactStatus);
router.delete('/:id', isAuthenticated, isAdmin, validateDeleteContact, contactController.deleteContact);

// Log all routes
debug.log('Contact routes initialized');

module.exports = router;
