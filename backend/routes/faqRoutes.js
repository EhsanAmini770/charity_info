const express = require('express');
const router = express.Router();
const Faq = require('../models/Faq');
const { isAuthenticated, isAdmin, isEditor, isSuperAdmin } = require('../middleware/auth');
// Import the new validation middleware
const {
  validateCreateFaq,
  validateUpdateFaq,
  validatePartialUpdateFaq,
  validateDeleteFaq
} = require('../validations/faqValidationFlex');
const debug = require('../utils/debug').createNamespace('faq-routes');
const controllerUtils = require('../utils/controllerUtils');

// Get all FAQs (public)
router.get('/api/faqs', async (req, res) => {
  try {
    debug.log('Fetching public FAQs');
    const faqs = await Faq.find({ isActive: true })
      .sort({ category: 1, order: 1 })
      .select('-__v');

    debug.log(`Found ${faqs.length} active FAQs`);
    res.json({ faqs });
  } catch (error) {
    debug.error('Error fetching public FAQs', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'getPublicFaqs'
    });
  }
});

// Get all FAQs (admin and editor)
router.get('/api/admin/faqs', isAuthenticated, isEditor, async (req, res) => {
  try {
    debug.log('Fetching all FAQs for admin');
    const faqs = await Faq.find()
      .sort({ category: 1, order: 1 })
      .select('-__v');

    debug.log(`Found ${faqs.length} FAQs for admin`);
    res.json({ faqs });
  } catch (error) {
    debug.error('Error fetching admin FAQs', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'getAdminFaqs'
    });
  }
});

// Get a single FAQ by ID
router.get('/api/admin/faqs/:id', isAuthenticated, isEditor, async (req, res) => {
  try {
    debug.log('Fetching FAQ by ID', req.params.id);
    const faq = await Faq.findById(req.params.id).select('-__v');

    if (!faq) {
      debug.log('FAQ not found', req.params.id);
      const error = new Error('FAQ not found');
      error.statusCode = 404;
      return controllerUtils.handleControllerError(error, res, {
        context: 'getFaqById',
        entityId: req.params.id
      });
    }

    debug.log('Found FAQ', { id: faq._id, question: faq.question });
    res.json({ faq });
  } catch (error) {
    debug.error('Error fetching FAQ by ID', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'getFaqById',
      entityId: req.params.id
    });
  }
});

// Create a new FAQ
router.post('/api/admin/faqs', isAuthenticated, isEditor, validateCreateFaq, async (req, res) => {
  try {
    debug.log('Creating new FAQ', { body: req.body });
    const { question, answer, category, order, isActive } = req.body;

    const newFaq = new Faq({
      question,
      answer,
      category: category || 'General',
      order: typeof order === 'number' ? order : 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await newFaq.save();
    debug.log('FAQ created successfully', { id: newFaq._id, question: newFaq.question });

    res.status(201).json({
      message: 'FAQ created successfully',
      faq: newFaq
    });
  } catch (error) {
    debug.error('Error creating FAQ', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'createFaq'
    });
  }
});

// Update an existing FAQ - full update
router.put('/api/admin/faqs/:id', isAuthenticated, isEditor, validateUpdateFaq, async (req, res) => {
  try {
    debug.log('Update FAQ request', { id: req.params.id, body: req.body });

    // Check if this is a partial update (only updating isActive)
    const isPartialUpdate = Object.keys(req.body).length === 1 && 'isActive' in req.body;

    // If it's a partial update, use the partial update endpoint
    if (isPartialUpdate) {
      debug.log('Redirecting to partial update handler');
      return partialUpdateHandler(req, res);
    }

    const faq = await Faq.findById(req.params.id);
    if (!faq) {
      debug.log('FAQ not found', req.params.id);
      const error = new Error('FAQ not found');
      error.statusCode = 404;
      return controllerUtils.handleControllerError(error, res, {
        context: 'updateFaq',
        entityId: req.params.id
      });
    }

    // For full updates, update all fields
    const updateData = {
      ...req.body,
      // Ensure proper types
      category: req.body.category || 'General',
      order: typeof req.body.order === 'number' ? req.body.order : 0,
      isActive: req.body.isActive !== undefined ? req.body.isActive : faq.isActive
    };

    debug.log('Updating FAQ with data', updateData);

    const updatedFaq = await Faq.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    debug.log('FAQ updated successfully', { id: updatedFaq._id, question: updatedFaq.question });

    res.json({
      message: 'FAQ updated successfully',
      faq: updatedFaq
    });
  } catch (error) {
    debug.error('Error updating FAQ', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'updateFaq',
      entityId: req.params.id
    });
  }
});

// Partial update handler (for isActive toggle)
const partialUpdateHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    debug.log('Partial update for FAQ', { id, isActive });

    const faq = await Faq.findById(id);
    if (!faq) {
      debug.log('FAQ not found for partial update', id);
      const error = new Error('FAQ not found');
      error.statusCode = 404;
      return controllerUtils.handleControllerError(error, res, {
        context: 'partialUpdateFaq',
        entityId: id
      });
    }

    // Update only the isActive field
    const updatedFaq = await Faq.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    debug.log('FAQ partially updated', { id: updatedFaq._id, isActive: updatedFaq.isActive });

    res.json({
      message: 'FAQ updated successfully',
      faq: updatedFaq
    });
  } catch (error) {
    debug.error('Error in partial update', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'partialUpdateFaq',
      entityId: id
    });
  }
};

// Dedicated endpoint for partial updates (isActive toggle)
router.patch('/api/admin/faqs/:id/toggle-active', isAuthenticated, isEditor, validatePartialUpdateFaq, async (req, res) => {
  return partialUpdateHandler(req, res);
});

// Delete a FAQ
router.delete('/api/admin/faqs/:id', isAuthenticated, isEditor, validateDeleteFaq, async (req, res) => {
  try {
    debug.log('Deleting FAQ', req.params.id);
    const faq = await Faq.findById(req.params.id);

    if (!faq) {
      debug.log('FAQ not found for deletion', req.params.id);
      const error = new Error('FAQ not found');
      error.statusCode = 404;
      return controllerUtils.handleControllerError(error, res, {
        context: 'deleteFaq',
        entityId: req.params.id
      });
    }

    await Faq.findByIdAndDelete(req.params.id);
    debug.log('FAQ deleted successfully', req.params.id);

    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    debug.error('Error deleting FAQ', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'deleteFaq',
      entityId: req.params.id
    });
  }
});

module.exports = router;
