const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const {
  validateCreatePartner,
  validateUpdatePartner,
  validateGetPartners,
  validateGetPartnerById,
  validateDeletePartner
} = require('../validations/partnerValidationFlex');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const debug = require('../utils/debug').createNamespace('partner-routes');

// Public routes
router.get('/', validateGetPartners, partnerController.getAllPartners);
router.get('/:id', validateGetPartnerById, partnerController.getPartnerById);

// Admin routes
router.post(
  '/',
  isAuthenticated,
  isAdmin,
  partnerController.upload.single('logo'),
  partnerController.handleMulterError,
  validateCreatePartner,
  partnerController.createPartner
);

router.put(
  '/:id',
  isAuthenticated,
  isAdmin,
  partnerController.upload.single('logo'),
  partnerController.handleMulterError,
  validateUpdatePartner,
  partnerController.updatePartner
);

router.delete(
  '/:id',
  isAuthenticated,
  isAdmin,
  validateDeletePartner,
  partnerController.deletePartner
);

// Log all routes
debug.log('Partner routes initialized');

module.exports = router;
