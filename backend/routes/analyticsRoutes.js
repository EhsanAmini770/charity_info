const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { isAuthenticated, isSuperAdmin } = require('../middleware/auth');
const { validateVisitStats, validateOnlineCount } = require('../validations/analyticsValidationFlex');
const debug = require('../utils/debug').createNamespace('analytics-routes');

// Analytics routes (super-admin only)
router.get('/api/admin/analytics/visits', isAuthenticated, isSuperAdmin, validateVisitStats, analyticsController.getVisitStats);
router.get('/api/admin/analytics/online', isAuthenticated, isSuperAdmin, validateOnlineCount, analyticsController.getOnlineCount);

// Log all routes
debug.log('Analytics routes initialized');

module.exports = router;
