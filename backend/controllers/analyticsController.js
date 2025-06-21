const VisitCounter = require('../models/VisitCounter');
const mongoose = require('mongoose');
const OnlineUser = require('../models/OnlineUser');
const controllerUtils = require('../utils/controllerUtils');
const debug = require('../utils/debug').createNamespace('analytics-controller');
const logger = require('../utils/logger');

// Controller for analytics
const analyticsController = {
  // Get visit statistics
  getVisitStats: async (req, res, next) => {
    try {
      // Get date range from query params or default to last 7 days
      const days = parseInt(req.query.days) || 7;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Format dates for query
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      debug.log(`Fetching visit data from ${startDateStr} to ${endDateStr}`);

      // Get visit data - use the visitcounters collection directly if needed
      let visitData;
      try {
        visitData = await VisitCounter.find({
          date: { $gte: startDateStr, $lte: endDateStr }
        }).sort({ date: 1 });

        // If no data in VisitCounter model, try the raw collection
        if (visitData.length === 0) {
          debug.log('No data found in VisitCounter model, trying visitcounters collection directly');
          const db = mongoose.connection.db;
          const visitCountersCollection = db.collection('visitcounters');
          const rawVisitData = await visitCountersCollection.find({
            date: { $gte: startDateStr, $lte: endDateStr }
          }).sort({ date: 1 }).toArray();

          if (rawVisitData.length > 0) {
            debug.log(`Found ${rawVisitData.length} records in visitcounters collection`);
            visitData = rawVisitData;
          }
        }
      } catch (err) {
        debug.error('Error querying visit data:', err);
        // Try the raw collection as a fallback
        const db = mongoose.connection.db;
        const visitCountersCollection = db.collection('visitcounters');
        visitData = await visitCountersCollection.find({
          date: { $gte: startDateStr, $lte: endDateStr }
        }).sort({ date: 1 }).toArray();
        debug.log(`Fallback: Found ${visitData.length} records in visitcounters collection`);
      }

      // If still no data, return empty structure
      if (!visitData || visitData.length === 0) {
        debug.log('No visitor data found in any collection');
        return res.json({
          totalVisits: 0,
          uniqueVisits: 0,
          visitsByDay: [],
          dates: [],
          counts: []
        });
      }

      debug.log(`Processing ${visitData.length} visit records`);

      // Calculate total visits
      const totalVisits = visitData.reduce((sum, day) => sum + (day.totalVisits || 0), 0);
      const uniqueVisits = visitData.reduce((sum, day) => sum + (day.uniqueVisits || 0), 0);

      // Format data for response
      const visitsByDay = visitData.map(day => ({
        date: day.date,
        totalVisits: day.totalVisits || 0,
        uniqueVisits: day.uniqueVisits || 0
      }));

      // Add dates array for backward compatibility
      const dates = visitsByDay.map(day => day.date);
      // Add counts array for backward compatibility
      const counts = visitsByDay.map(day => day.totalVisits);

      res.json({
        totalVisits,
        uniqueVisits,
        visitsByDay,
        dates,
        counts
      });
    } catch (error) {
      debug.error('Error fetching visit statistics:', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'getVisitStats',
        useNextFunction: true,
        next
      });
    }
  },

  // Get online user count
  getOnlineCount: async (req, res, next) => {
    try {
      // Count online users
      let count = 0;

      try {
        count = await OnlineUser.countDocuments();
        debug.log(`Found ${count} online users in OnlineUser model`);
      } catch (err) {
        debug.error('Error counting online users:', err);
        // Fallback to direct collection access
        try {
          const db = mongoose.connection.db;
          const onlineUsersCollection = db.collection('onlineusers');
          count = await onlineUsersCollection.countDocuments();
          debug.log(`Fallback: Found ${count} online users in onlineusers collection`);
        } catch (collErr) {
          debug.error('Error accessing onlineusers collection:', collErr);
        }
      }

      // If no online users found, return at least 1 (the current admin user)
      if (count === 0) {
        count = 1; // At least the current admin is online
        debug.log('No online users found, defaulting to 1 (current admin)');
      }

      res.json({ count });
    } catch (error) {
      debug.error('Error in getOnlineCount:', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'getOnlineCount',
        useNextFunction: true,
        next
      });
    }
  }
};

module.exports = analyticsController;
