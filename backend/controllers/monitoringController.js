const monitoringUtils = require('../utils/monitoringUtils');
const VisitCounter = require('../models/VisitCounter');
const OnlineUser = require('../models/OnlineUser');
const News = require('../models/News');
const GalleryAlbum = require('../models/GalleryAlbum');
const User = require('../models/User');
const controllerUtils = require('../utils/controllerUtils');
const debug = require('../utils/debug').createNamespace('monitoring-controller');
const logger = require('../utils/logger');

/**
 * Controller for monitoring and health checks
 */
const monitoringController = {
  /**
   * Get system health
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  getHealth: (req, res, next) => {
    try {
      debug.log('Getting system health');

      const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      };

      res.status(200).json(health);
    } catch (error) {
      debug.error('Error getting system health', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'getHealth',
        useNextFunction: true,
        next
      });
    }
  },

  /**
   * Get detailed system information (admin only)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  getSystemInfo: (req, res, next) => {
    try {
      debug.log('Getting detailed system information');

      const systemInfo = monitoringUtils.getSystemInfo();
      const processInfo = monitoringUtils.getProcessInfo();

      res.status(200).json({
        system: systemInfo,
        process: processInfo
      });
    } catch (error) {
      debug.error('Error getting system information', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'getSystemInfo',
        useNextFunction: true,
        next
      });
    }
  },

  /**
   * Get database statistics (admin only)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  getDatabaseStats: async (req, res, next) => {
    try {
      debug.log('Getting database statistics');

      // Count documents in collections
      const [
        newsCount,
        albumCount,
        userCount,
        onlineUserCount
      ] = await Promise.all([
        News.countDocuments(),
        GalleryAlbum.countDocuments(),
        User.countDocuments(),
        OnlineUser.countDocuments()
      ]);

      // Get visit statistics
      const today = new Date().toISOString().split('T')[0];
      const todayVisits = await VisitCounter.findOne({ date: today });

      // Get total visits for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      const visitStats = await VisitCounter.aggregate([
        {
          $match: {
            date: { $gte: thirtyDaysAgoStr }
          }
        },
        {
          $group: {
            _id: null,
            totalVisits: { $sum: '$totalVisits' },
            uniqueVisits: { $sum: '$uniqueVisits' }
          }
        }
      ]);

      const stats = {
        collections: {
          news: newsCount,
          albums: albumCount,
          users: userCount,
          onlineUsers: onlineUserCount
        },
        visits: {
          today: todayVisits ? {
            total: todayVisits.totalVisits,
            unique: todayVisits.uniqueVisits
          } : { total: 0, unique: 0 },
          last30Days: visitStats.length > 0 ? {
            total: visitStats[0].totalVisits,
            unique: visitStats[0].uniqueVisits
          } : { total: 0, unique: 0 }
        }
      };

      debug.log('Database statistics retrieved successfully', { collections: Object.keys(stats.collections) });
      res.status(200).json(stats);
    } catch (error) {
      debug.error('Error getting database statistics', error);
      controllerUtils.handleControllerError(error, res, {
        context: 'getDatabaseStats',
        useNextFunction: true,
        next
      });
    }
  }
};

module.exports = monitoringController;
