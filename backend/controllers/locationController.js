const Location = require('../models/Location');
const controllerUtils = require('../utils/controllerUtils');
const debug = require('../utils/debug').createNamespace('location-controller');

// Get all locations
exports.getAllLocations = async (req, res, next) => {
  try {
    debug.log('Fetching all locations', { query: req.query });

    // Filter by active status for public requests
    const filter = req.query.includeInactive === 'true' ? {} : { active: true };
    debug.log('Using filter', { filter, includeInactive: req.query.includeInactive });

    // Sort by displayOrder and then by name
    const locations = await Location.find(filter).sort({ displayOrder: 1, name: 1 });
    debug.log(`Found ${locations.length} locations`);

    res.status(200).json(locations);
  } catch (error) {
    debug.error('Error fetching all locations', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'getAllLocations',
      useNextFunction: true,
      next
    });
  }
};

// Get location by ID
exports.getLocationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    debug.log('Fetching location by ID', { id });

    const location = await Location.findById(id);

    if (!location) {
      debug.log('Location not found', { id });
      return res.status(404).json({ message: 'Location not found' });
    }

    debug.log('Found location', { id: location._id, name: location.name });
    res.status(200).json(location);
  } catch (error) {
    debug.error('Error fetching location by ID', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'getLocationById',
      entityId: req.params.id,
      useNextFunction: true,
      next
    });
  }
};

// Create new location
exports.createLocation = async (req, res, next) => {
  try {
    debug.log('Creating new location', { body: req.body });

    const {
      name,
      description,
      latitude,
      longitude,
      address,
      phone,
      email,
      isMainOffice,
      displayOrder,
      active
    } = req.body;

    // Convert string values to appropriate types
    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);
    const parsedIsMainOffice = isMainOffice === 'true' || isMainOffice === true;
    const parsedDisplayOrder = displayOrder ? parseInt(displayOrder) : 0;
    const parsedActive = active !== 'false' && active !== false;

    // If this is set as main office, unset any existing main office
    if (parsedIsMainOffice) {
      debug.log('Setting as main office, unsetting any existing main office');
      await Location.updateMany(
        { isMainOffice: true },
        { $set: { isMainOffice: false } }
      );
    }

    const newLocation = new Location({
      name,
      description,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      address,
      phone,
      email,
      isMainOffice: parsedIsMainOffice,
      displayOrder: parsedDisplayOrder,
      active: parsedActive
    });

    await newLocation.save();
    debug.log('Location created successfully', { id: newLocation._id, name: newLocation.name });

    res.status(201).json({
      message: 'Location created successfully',
      location: newLocation
    });
  } catch (error) {
    debug.error('Error creating location', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'createLocation',
      useNextFunction: true,
      next
    });
  }
};

// Update location
exports.updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    debug.log('Updating location', { id, body: req.body });

    const {
      name,
      description,
      latitude,
      longitude,
      address,
      phone,
      email,
      isMainOffice,
      displayOrder,
      active
    } = req.body;

    const location = await Location.findById(id);

    if (!location) {
      debug.log('Location not found', { id });
      return res.status(404).json({ message: 'Location not found' });
    }

    debug.log('Found location to update', { id: location._id, name: location.name });

    // Track changes
    const changes = [];

    // Check if this is being set as main office
    const parsedIsMainOffice = isMainOffice === 'true' || isMainOffice === true;
    if (isMainOffice !== undefined && parsedIsMainOffice && !location.isMainOffice) {
      debug.log('Setting as main office, unsetting any existing main office');
      await Location.updateMany(
        { _id: { $ne: location._id }, isMainOffice: true },
        { $set: { isMainOffice: false } }
      );
      changes.push('isMainOffice');
    }

    // Update fields
    if (name !== undefined && name !== location.name) {
      location.name = name;
      changes.push('name');
    }

    if (description !== undefined && description !== location.description) {
      location.description = description;
      changes.push('description');
    }

    if (latitude !== undefined) {
      const parsedLatitude = parseFloat(latitude);
      if (parsedLatitude !== location.latitude) {
        location.latitude = parsedLatitude;
        changes.push('latitude');
      }
    }

    if (longitude !== undefined) {
      const parsedLongitude = parseFloat(longitude);
      if (parsedLongitude !== location.longitude) {
        location.longitude = parsedLongitude;
        changes.push('longitude');
      }
    }

    if (address !== undefined && address !== location.address) {
      location.address = address;
      changes.push('address');
    }

    if (phone !== undefined && phone !== location.phone) {
      location.phone = phone;
      changes.push('phone');
    }

    if (email !== undefined && email !== location.email) {
      location.email = email;
      changes.push('email');
    }

    if (isMainOffice !== undefined && parsedIsMainOffice !== location.isMainOffice) {
      location.isMainOffice = parsedIsMainOffice;
      changes.push('isMainOffice');
    }

    if (displayOrder !== undefined) {
      const parsedDisplayOrder = parseInt(displayOrder);
      if (parsedDisplayOrder !== location.displayOrder) {
        location.displayOrder = parsedDisplayOrder;
        changes.push('displayOrder');
      }
    }

    if (active !== undefined) {
      const parsedActive = active !== 'false' && active !== false;
      if (parsedActive !== location.active) {
        location.active = parsedActive;
        changes.push('active');
      }
    }

    if (changes.length > 0) {
      await location.save();
      debug.log('Location updated successfully', { id: location._id, changes });
    } else {
      debug.log('No changes to update', { id });
    }

    res.status(200).json({
      message: 'Location updated successfully',
      location,
      changes: changes.length > 0 ? changes : null
    });
  } catch (error) {
    debug.error('Error updating location', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'updateLocation',
      entityId: req.params.id,
      useNextFunction: true,
      next
    });
  }
};

// Delete location
exports.deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    debug.log('Deleting location', { id });

    const location = await Location.findById(id);

    if (!location) {
      debug.log('Location not found', { id });
      return res.status(404).json({ message: 'Location not found' });
    }

    debug.log('Found location to delete', { id: location._id, name: location.name });

    // Check if this is a main office
    const isMainOffice = location.isMainOffice;

    await Location.deleteOne({ _id: id });
    debug.log('Location deleted successfully', { id });

    res.status(200).json({
      message: 'Location deleted successfully',
      name: location.name,
      wasMainOffice: isMainOffice
    });
  } catch (error) {
    debug.error('Error deleting location', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'deleteLocation',
      entityId: req.params.id,
      useNextFunction: true,
      next
    });
  }
};
