const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const {
  validateCreateLocation,
  validateUpdateLocation,
  validateGetLocations,
  validateGetLocationById,
  validateDeleteLocation
} = require('../validations/locationValidationFlex');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const debug = require('../utils/debug').createNamespace('location-routes');

// Public routes
router.get('/', validateGetLocations, locationController.getAllLocations);
router.get('/:id', validateGetLocationById, locationController.getLocationById);

// Admin routes
router.post(
  '/',
  isAuthenticated,
  isAdmin,
  validateCreateLocation,
  locationController.createLocation
);

router.put(
  '/:id',
  isAuthenticated,
  isAdmin,
  validateUpdateLocation,
  locationController.updateLocation
);

router.delete(
  '/:id',
  isAuthenticated,
  isAdmin,
  validateDeleteLocation,
  locationController.deleteLocation
);

// Log all routes
debug.log('Location routes initialized');

module.exports = router;
