const VisitCounter = require('../models/VisitCounter');
const debug = require('../utils/debug').createNamespace('visitor-counter');
const logger = require('../utils/logger');

// Middleware to track visits
const visitorCounter = async (req, res, next) => {
  try {
    if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/auth')) {
      return next();
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Increment total visits
    let counter = await VisitCounter.findOne({ date: today });

    if (!counter) {
      counter = new VisitCounter({ date: today });
    }

    counter.totalVisits += 1;

    // Track unique visits using cookies and IP
    const visitorId = req.cookies.visitorId || req.ip;
    const visitorKey = `visitor_${visitorId}_${today}`;

    if (!req.session[visitorKey]) {
      counter.uniqueVisits += 1;
      req.session[visitorKey] = true;
    }

    await counter.save();
    next();
  } catch (error) {
    debug.error('Error tracking visitor', error);
    logger.error({
      message: 'Error tracking visitor',
      error: error.message,
      stack: error.stack
    });
    next(); // Continue even if tracking fails
  }
};

module.exports = visitorCounter;
