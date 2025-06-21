const Partner = require('../models/partner');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const controllerUtils = require('../utils/controllerUtils');
const debug = require('../utils/debug').createNamespace('partner-controller');

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/partners');
    debug.log('Setting upload directory for partner logo', { uploadDir });

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      debug.log('Creating upload directory', { uploadDir });
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName = `partner-${uuidv4()}${fileExt}`;
    debug.log('Generated filename for partner logo', { fileName, originalName: file.originalname });
    cb(null, fileName);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  debug.log('Checking file type for partner logo', { mimetype: file.mimetype, originalName: file.originalname });

  if (file.mimetype.startsWith('image/')) {
    debug.log('File type accepted', { mimetype: file.mimetype });
    cb(null, true);
  } else {
    debug.log('File type rejected', { mimetype: file.mimetype });
    cb(new Error('Only image files are allowed'), false);
  }
};

// Create multer upload instance
exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Log multer errors
exports.handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    debug.error('Multer error', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      const error = new Error('File is too large. Maximum size is 5MB.');
      error.statusCode = 400;
      return controllerUtils.handleControllerError(error, res, {
        context: 'handleMulterError'
      });
    }
    const error = new Error(`Upload error: ${err.message}`);
    error.statusCode = 400;
    return controllerUtils.handleControllerError(error, res, {
      context: 'handleMulterError'
    });
  } else if (err) {
    debug.error('Upload error', err);
    const error = new Error(err.message);
    error.statusCode = 400;
    return controllerUtils.handleControllerError(error, res, {
      context: 'handleMulterError'
    });
  }
  next();
};

// Get all partners
exports.getAllPartners = async (req, res, next) => {
  try {
    debug.log('Fetching all partners', { query: req.query });
    const query = {};

    // Filter by active status if specified
    if (req.query.active === 'true') {
      query.active = true;
      debug.log('Filtering by active status', { active: true });
    } else if (req.query.active === 'false') {
      query.active = false;
      debug.log('Filtering by active status', { active: false });
    }

    // Filter by partner type if specified
    if (req.query.type) {
      query.partnerType = req.query.type;
      debug.log('Filtering by partner type', { type: req.query.type });
    }

    // Filter by featured status if specified
    if (req.query.featured === 'true') {
      query.featured = true;
      debug.log('Filtering by featured status', { featured: true });
    }

    const partners = await Partner.find(query)
      .sort({ displayOrder: 1, name: 1 });

    debug.log(`Found ${partners.length} partners`);
    res.status(200).json({ partners });
  } catch (error) {
    debug.error('Error fetching all partners', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'getAllPartners',
      useNextFunction: true,
      next
    });
  }
};

// Get partner by ID
exports.getPartnerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    debug.log('Fetching partner by ID', { id });

    const partner = await Partner.findById(id);

    if (!partner) {
      debug.log('Partner not found', { id });
      const error = new Error('Partner not found');
      error.statusCode = 404;
      return controllerUtils.handleControllerError(error, res, {
        context: 'getPartnerById',
        entityId: id
      });
    }

    debug.log('Found partner', { id: partner._id, name: partner.name });
    res.status(200).json({ partner });
  } catch (error) {
    debug.error('Error fetching partner by ID', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'getPartnerById',
      entityId: req.params.id,
      useNextFunction: true,
      next
    });
  }
};

// Create new partner
exports.createPartner = async (req, res, next) => {
  try {
    debug.log('Creating new partner', { body: req.body, file: req.file ? req.file.filename : 'none' });

    // Check if file was uploaded
    if (!req.file) {
      debug.log('No logo file uploaded');
      const error = new Error('Partner logo is required');
      error.statusCode = 400;
      return controllerUtils.handleControllerError(error, res, {
        context: 'createPartner'
      });
    }

    const { name, website, description, partnerType, featured, displayOrder, active } = req.body;

    // Create relative path to the uploaded file
    const logoPath = `/uploads/partners/${req.file.filename}`;
    debug.log('Logo path created', { logoPath });

    // Convert string values to appropriate types
    const parsedFeatured = featured === 'true' || featured === true;
    const parsedDisplayOrder = displayOrder ? parseInt(displayOrder) : 0;
    const parsedActive = active !== 'false' && active !== false;

    const newPartner = new Partner({
      name,
      logo: logoPath,
      website,
      description,
      partnerType: partnerType || 'partner',
      featured: parsedFeatured,
      displayOrder: parsedDisplayOrder,
      active: parsedActive
    });

    await newPartner.save();
    debug.log('Partner created successfully', { id: newPartner._id, name: newPartner.name });

    res.status(201).json({
      message: 'Partner created successfully',
      partner: newPartner
    });
  } catch (error) {
    debug.error('Error creating partner', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'createPartner',
      useNextFunction: true,
      next
    });
  }
};

// Update partner
exports.updatePartner = async (req, res, next) => {
  try {
    const { id } = req.params;
    debug.log('Updating partner', { id, body: req.body, file: req.file ? req.file.filename : 'none' });

    const { name, website, description, partnerType, featured, displayOrder, active } = req.body;

    const partner = await Partner.findById(id);

    if (!partner) {
      debug.log('Partner not found', { id });
      const error = new Error('Partner not found');
      error.statusCode = 404;
      return controllerUtils.handleControllerError(error, res, {
        context: 'updatePartner',
        entityId: id
      });
    }

    debug.log('Found partner to update', { id: partner._id, name: partner.name });

    // Track changes
    const changes = [];

    // Update fields
    if (name !== undefined && name !== partner.name) {
      partner.name = name;
      changes.push('name');
    }

    if (website !== undefined && website !== partner.website) {
      partner.website = website;
      changes.push('website');
    }

    if (description !== undefined && description !== partner.description) {
      partner.description = description;
      changes.push('description');
    }

    if (partnerType !== undefined && partnerType !== partner.partnerType) {
      partner.partnerType = partnerType;
      changes.push('partnerType');
    }

    if (featured !== undefined) {
      const parsedFeatured = featured === 'true' || featured === true;
      if (parsedFeatured !== partner.featured) {
        partner.featured = parsedFeatured;
        changes.push('featured');
      }
    }

    if (displayOrder !== undefined) {
      const parsedDisplayOrder = parseInt(displayOrder);
      if (parsedDisplayOrder !== partner.displayOrder) {
        partner.displayOrder = parsedDisplayOrder;
        changes.push('displayOrder');
      }
    }

    if (active !== undefined) {
      const parsedActive = active !== 'false' && active !== false;
      if (parsedActive !== partner.active) {
        partner.active = parsedActive;
        changes.push('active');
      }
    }

    // Update logo if a new file was uploaded
    if (req.file) {
      // Delete old logo file if it exists
      if (partner.logo) {
        const oldLogoPath = path.join(__dirname, '..', partner.logo);
        debug.log('Attempting to delete old logo file', { path: oldLogoPath });

        try {
          if (fs.existsSync(oldLogoPath)) {
            fs.unlinkSync(oldLogoPath);
            debug.log('Deleted old logo file', { path: oldLogoPath });
          } else {
            debug.log('Old logo file not found', { path: oldLogoPath });
          }
        } catch (fileError) {
          debug.error('Error deleting old logo file', fileError);
        }
      }

      // Set new logo path
      partner.logo = `/uploads/partners/${req.file.filename}`;
      changes.push('logo');
      debug.log('Updated logo path', { newLogo: partner.logo });
    }

    if (changes.length > 0) {
      await partner.save();
      debug.log('Partner updated successfully', { id: partner._id, changes });
    } else {
      debug.log('No changes to update', { id });
    }

    res.status(200).json({
      message: 'Partner updated successfully',
      partner,
      changes: changes.length > 0 ? changes : null
    });
  } catch (error) {
    debug.error('Error updating partner', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'updatePartner',
      entityId: req.params.id,
      useNextFunction: true,
      next
    });
  }
};

// Delete partner
exports.deletePartner = async (req, res, next) => {
  try {
    const { id } = req.params;
    debug.log('Deleting partner', { id });

    const partner = await Partner.findById(id);

    if (!partner) {
      debug.log('Partner not found', { id });
      const error = new Error('Partner not found');
      error.statusCode = 404;
      return controllerUtils.handleControllerError(error, res, {
        context: 'deletePartner',
        entityId: id
      });
    }

    debug.log('Found partner to delete', { id: partner._id, name: partner.name });

    // Delete logo file if it exists
    let fileDeleted = false;
    if (partner.logo) {
      const logoPath = path.join(__dirname, '..', partner.logo);
      debug.log('Attempting to delete logo file', { path: logoPath });

      try {
        if (fs.existsSync(logoPath)) {
          fs.unlinkSync(logoPath);
          debug.log('Deleted logo file', { path: logoPath });
          fileDeleted = true;
        } else {
          debug.log('Logo file not found', { path: logoPath });
        }
      } catch (fileError) {
        debug.error('Error deleting logo file', fileError);
      }
    }

    await Partner.findByIdAndDelete(id);
    debug.log('Partner record deleted', { id });

    res.status(200).json({
      message: 'Partner deleted successfully',
      partner,
      fileDeleted
    });
  } catch (error) {
    debug.error('Error deleting partner', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'deletePartner',
      entityId: req.params.id,
      useNextFunction: true,
      next
    });
  }
};
