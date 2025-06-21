const express = require('express');
const router = express.Router();
const subscriberController = require('../controllers/subscriberController');
const {
  validateSubscribe,
  validateUnsubscribe,
  validateGetSubscribers,
  validateDeleteSubscriber
} = require('../validations/subscriberValidationFlex');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const debug = require('../utils/debug').createNamespace('subscriber-routes');

// Public routes
router.post('/subscribe', validateSubscribe, subscriberController.subscribe);
router.get('/unsubscribe/:email', validateUnsubscribe, subscriberController.unsubscribe);

// Admin routes
router.get('/', isAuthenticated, isAdmin, validateGetSubscribers, subscriberController.getAllSubscribers);
router.delete('/:id', isAuthenticated, isAdmin, validateDeleteSubscriber, subscriberController.deleteSubscriber);

// Log all routes
debug.log('Subscriber routes initialized');

module.exports = router;
