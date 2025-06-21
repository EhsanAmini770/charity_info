const express = require('express');
const monitoringController = require('../controllers/monitoringController');
const { isAuthenticated, isSuperAdmin } = require('../middleware/auth');
const {
  validateHealthCheck,
  validateSystemInfo,
  validateDatabaseStats
} = require('../validations/monitoringValidationFlex');
const debug = require('../utils/debug').createNamespace('monitoring-routes');

const router = express.Router();

// Public health check
router.get('/health', validateHealthCheck, monitoringController.getHealth);

// Admin-only detailed monitoring
router.get('/system', isAuthenticated, isSuperAdmin, validateSystemInfo, monitoringController.getSystemInfo);
router.get('/database', isAuthenticated, isSuperAdmin, validateDatabaseStats, monitoringController.getDatabaseStats);

// Log all routes
debug.log('Monitoring routes initialized');

module.exports = router;
