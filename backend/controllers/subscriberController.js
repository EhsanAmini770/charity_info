const Subscriber = require('../models/subscriber');
const controllerUtils = require('../utils/controllerUtils');
const debug = require('../utils/debug').createNamespace('subscriber-controller');

// Subscribe a new email
exports.subscribe = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    // Mask part of the email for privacy in logs
    const maskedEmail = email.replace(/^(.{3})(.*)(@.*)$/, '$1***$3');
    debug.log('Processing subscription request', { email: maskedEmail, hasName: !!name });

    // Check if email already exists
    const existingSubscriber = await Subscriber.findOne({ email });

    if (existingSubscriber) {
      debug.log('Found existing subscriber', { id: existingSubscriber._id, subscribed: existingSubscriber.subscribed });

      // If already subscribed, return success
      if (existingSubscriber.subscribed) {
        debug.log('Subscriber is already active', { email });
        return res.status(200).json({
          message: 'You are already subscribed to our newsletter',
          subscriber: existingSubscriber
        });
      }

      // If previously unsubscribed, resubscribe them
      debug.log('Resubscribing previously unsubscribed user', { email: maskedEmail });
      existingSubscriber.subscribed = true;
      existingSubscriber.subscribedAt = Date.now();
      existingSubscriber.unsubscribedAt = null;
      if (name) existingSubscriber.name = name;

      await existingSubscriber.save();
      debug.log('Subscriber resubscribed successfully', { id: existingSubscriber._id });

      return res.status(200).json({
        message: 'Welcome back! You have been resubscribed to our newsletter',
        subscriber: existingSubscriber
      });
    }

    // Create new subscriber
    debug.log('Creating new subscriber', { email: maskedEmail });
    const newSubscriber = new Subscriber({
      email,
      name: name || '',
    });

    await newSubscriber.save();
    debug.log('New subscriber created successfully', { id: newSubscriber._id });

    res.status(201).json({
      message: 'Thank you for subscribing to our newsletter!',
      subscriber: newSubscriber
    });
  } catch (error) {
    debug.error('Error processing subscription', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'subscribe',
      useNextFunction: true,
      next
    });
  }
};

// Unsubscribe an email
exports.unsubscribe = async (req, res, next) => {
  try {
    const { email } = req.params;
    // Mask part of the email for privacy in logs
    const maskedEmail = email.replace(/^(.{3})(.*)(@.*)$/, '$1***$3');
    debug.log('Processing unsubscribe request', { email: maskedEmail });

    const subscriber = await Subscriber.findOne({ email });

    if (!subscriber) {
      debug.log('Subscriber not found', { email: maskedEmail });
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    // Mask part of the email for privacy in logs
    const subscriberMaskedEmail = subscriber.email.replace(/^(.{3})(.*)(@.*)$/, '$1***$3');
    debug.log('Found subscriber to unsubscribe', { id: subscriber._id, email: subscriberMaskedEmail });

    // If already unsubscribed, return success
    if (!subscriber.subscribed) {
      debug.log('Subscriber is already unsubscribed', { email: subscriberMaskedEmail });
      // Create a sanitized subscriber object with masked email
      const sanitizedSubscriber = {
        ...subscriber.toObject(),
        email: subscriberMaskedEmail
      };

      return res.status(200).json({
        message: 'You are already unsubscribed from our newsletter',
        subscriber: sanitizedSubscriber
      });
    }

    subscriber.subscribed = false;
    subscriber.unsubscribedAt = Date.now();

    await subscriber.save();
    debug.log('Subscriber unsubscribed successfully', { id: subscriber._id });

    // Create a sanitized subscriber object with masked email
    const sanitizedSubscriber = {
      ...subscriber.toObject(),
      email: subscriberMaskedEmail
    };

    res.status(200).json({
      message: 'You have been unsubscribed from our newsletter',
      subscriber: sanitizedSubscriber
    });
  } catch (error) {
    debug.error('Error processing unsubscription', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'unsubscribe',
      useNextFunction: true,
      next
    });
  }
};

// Get all subscribers (admin only)
exports.getAllSubscribers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    debug.log('Fetching subscribers with pagination', { page, limit, skip, query: req.query });

    // Build query based on filters
    const query = {};
    if (req.query.subscribed === 'true') {
      query.subscribed = true;
    } else if (req.query.subscribed === 'false') {
      query.subscribed = false;
    }

    // Handle search functionality
    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      if (searchTerm) {
        debug.log('Searching subscribers', { searchTerm });

        // Check if the search term is a valid email
        const isEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(searchTerm);

        if (isEmail) {
          // If it's an email, do an exact match
          query.email = { $regex: new RegExp('^' + searchTerm + '$', 'i') };
          debug.log('Searching by exact email match', { email: searchTerm });
        } else {
          // Otherwise, use text search or partial match
          query.$or = [
            { email: { $regex: searchTerm, $options: 'i' } },
            { name: { $regex: searchTerm, $options: 'i' } }
          ];
          debug.log('Searching by partial match', { searchTerm });
        }
      }
    }

    debug.log('Final query for subscribers', { query });

    const total = await Subscriber.countDocuments(query);
    const subscribers = await Subscriber.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);
    debug.log(`Found ${subscribers.length} subscribers (${total} total)`);

    res.status(200).json({
      subscribers,
      pagination: {
        total,
        page,
        limit,
        pages: totalPages
      }
    });
  } catch (error) {
    debug.error('Error fetching subscribers', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'getAllSubscribers',
      useNextFunction: true,
      next
    });
  }
};

// Delete a subscriber (admin only)
exports.deleteSubscriber = async (req, res, next) => {
  try {
    const { id } = req.params;
    debug.log('Deleting subscriber', { id });

    const subscriber = await Subscriber.findById(id);

    if (!subscriber) {
      debug.log('Subscriber not found', { id });
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    // Mask part of the email for privacy in logs
    const maskedEmail = subscriber.email.replace(/^(.{3})(.*)(@.*)$/, '$1***$3');
    debug.log('Found subscriber to delete', { id: subscriber._id, email: maskedEmail });

    // Delete the subscriber
    await Subscriber.deleteOne({ _id: id });
    debug.log('Subscriber deleted successfully', { id });

    // Create a sanitized subscriber object with masked email
    const sanitizedSubscriber = {
      ...subscriber.toObject(),
      email: maskedEmail
    };

    res.status(200).json({
      message: 'Subscriber deleted successfully',
      subscriber: sanitizedSubscriber
    });
  } catch (error) {
    debug.error('Error deleting subscriber', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'deleteSubscriber',
      entityId: req.params.id,
      useNextFunction: true,
      next
    });
  }
};
