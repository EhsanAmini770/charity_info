const Contact = require('../models/Contact');
const controllerUtils = require('../utils/controllerUtils');
const debug = require('../utils/debug').createNamespace('contact-controller');
const logger = require('../utils/logger');

// Controller for contact form submissions
const contactController = {
  // Submit a new contact form
  submitContactForm: async (req, res, next) => {
    try {
      const { name, email, subject, message } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;

      // Mask part of the email for privacy in logs
      const maskedEmail = email.replace(/^(.{3})(.*)(@.*)$/, '$1***$3');
      debug.log('New contact form submission', { email: maskedEmail, subject, ipAddress });

      // Create new contact submission
      const newContact = new Contact({
        name,
        email,
        subject,
        message,
        ipAddress
      });

      await newContact.save();
      debug.log('Contact form saved successfully', { id: newContact._id });

      // Log the submission to the application log as well
      // We already have maskedEmail from above
      logger.info(`New contact form submission from ${maskedEmail}`);

      res.status(201).json({
        message: 'Your message has been sent successfully. We will get back to you soon.',
        success: true,
        contactId: newContact._id
      });
    } catch (error) {
      debug.error('Error submitting contact form', error);
      logger.error({
        message: 'Error in submitContactForm controller',
        error: error.message,
        stack: error.stack
      });
      controllerUtils.handleControllerError(error, res, {
        context: 'submitContactForm',
        useNextFunction: true,
        next
      });
    }
  },

  // Get all contact submissions (admin only)
  getAllContacts: async (req, res, next) => {
    try {
      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      debug.log('Fetching all contacts', { page, limit });

      // Filtering
      const filter = {};
      if (req.query.status) {
        filter.status = req.query.status;
        debug.log('Filtering contacts by status', { status: req.query.status });
      }

      // Sorting
      const sort = { createdAt: -1 }; // Default: newest first

      // Get contacts with pagination
      const contacts = await Contact.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      // Get total count for pagination
      const total = await Contact.countDocuments(filter);

      debug.log(`Found ${contacts.length} contacts`, { total, page });

      res.status(200).json({
        contacts,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      debug.error('Error fetching all contacts', error);
      logger.error({
        message: 'Error in getAllContacts controller',
        error: error.message,
        stack: error.stack
      });
      controllerUtils.handleControllerError(error, res, {
        context: 'getAllContacts',
        useNextFunction: true,
        next
      });
    }
  },

  // Get a single contact by ID (admin only)
  getContactById: async (req, res, next) => {
    try {
      const { id } = req.params;
      debug.log('Fetching contact by ID', { id });

      const contact = await Contact.findById(id);

      if (!contact) {
        debug.log('Contact not found', { id });
        const error = new Error('Contact not found');
        error.statusCode = 404;
        return controllerUtils.handleControllerError(error, res, {
          context: 'getContactById',
          entityId: id
        });
      }

      debug.log('Found contact', { id: contact._id, email: contact.email });
      res.status(200).json({ contact });
    } catch (error) {
      debug.error('Error fetching contact by ID', error);
      logger.error({
        message: 'Error in getContactById controller',
        error: error.message,
        stack: error.stack
      });
      controllerUtils.handleControllerError(error, res, {
        context: 'getContactById',
        entityId: req.params.id,
        useNextFunction: true,
        next
      });
    }
  },

  // Update contact status (admin only)
  updateContactStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      debug.log('Updating contact status', { id, status });

      const contact = await Contact.findById(id);

      if (!contact) {
        debug.log('Contact not found', { id });
        const error = new Error('Contact not found');
        error.statusCode = 404;
        return controllerUtils.handleControllerError(error, res, {
          context: 'updateContactStatus',
          entityId: id
        });
      }

      // Check if status is actually changing
      const oldStatus = contact.status;
      if (oldStatus === status) {
        debug.log('Status unchanged', { id, status });
        // This is not an error, just return a success response with changed: false
        return res.status(200).json({
          message: 'Status already set to ' + status,
          contact,
          changed: false
        });
      }

      // Update status
      contact.status = status;
      await contact.save();

      debug.log('Contact status updated successfully', { id, oldStatus, newStatus: status });

      res.status(200).json({
        message: 'Contact status updated successfully',
        contact,
        changed: true,
        previousStatus: oldStatus
      });
    } catch (error) {
      debug.error('Error updating contact status', error);
      logger.error({
        message: 'Error in updateContactStatus controller',
        error: error.message,
        stack: error.stack
      });
      controllerUtils.handleControllerError(error, res, {
        context: 'updateContactStatus',
        entityId: req.params.id,
        useNextFunction: true,
        next
      });
    }
  },

  // Delete a contact (admin only)
  deleteContact: async (req, res, next) => {
    try {
      const { id } = req.params;
      debug.log('Deleting contact', { id });

      const contact = await Contact.findById(id);

      if (!contact) {
        debug.log('Contact not found', { id });
        const error = new Error('Contact not found');
        error.statusCode = 404;
        return controllerUtils.handleControllerError(error, res, {
          context: 'deleteContact',
          entityId: id
        });
      }

      // Mask part of the email for privacy in logs
      const maskedEmail = contact.email.replace(/^(.{3})(.*)(@.*)$/, '$1***$3');
      debug.log('Found contact to delete', { id: contact._id, email: maskedEmail });
      await Contact.findByIdAndDelete(id);
      debug.log('Contact deleted successfully', { id });

      res.status(200).json({
        message: 'Contact deleted successfully',
        contactEmail: maskedEmail
      });
    } catch (error) {
      debug.error('Error deleting contact', error);
      logger.error({
        message: 'Error in deleteContact controller',
        error: error.message,
        stack: error.stack
      });
      controllerUtils.handleControllerError(error, res, {
        context: 'deleteContact',
        entityId: req.params.id,
        useNextFunction: true,
        next
      });
    }
  }
};

module.exports = contactController;
