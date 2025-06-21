const os = require('os');
const logger = require('./logger');

/**
 * Monitoring utility functions
 */
const monitoringUtils = {
  /**
   * Get system information
   * @returns {Object} - System information
   */
  getSystemInfo: () => {
    return {
      uptime: os.uptime(),
      type: os.type(),
      release: os.release(),
      hostname: os.hostname(),
      arch: os.arch(),
      platform: os.platform(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length,
      loadAvg: os.loadavg()
    };
  },
  
  /**
   * Get process information
   * @returns {Object} - Process information
   */
  getProcessInfo: () => {
    const memoryUsage = process.memoryUsage();
    
    return {
      pid: process.pid,
      uptime: process.uptime(),
      memoryUsage: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
        arrayBuffers: memoryUsage.arrayBuffers
      },
      cpuUsage: process.cpuUsage(),
      resourceUsage: process.resourceUsage()
    };
  },
  
  /**
   * Log system health
   */
  logSystemHealth: () => {
    const systemInfo = monitoringUtils.getSystemInfo();
    const processInfo = monitoringUtils.getProcessInfo();
    
    logger.info({
      message: 'System health check',
      systemInfo,
      processInfo
    });
  },
  
  /**
   * Start periodic health logging
   * @param {number} interval - Interval in milliseconds
   * @returns {Object} - Timer object
   */
  startHealthLogging: (interval = 15 * 60 * 1000) => { // Default: 15 minutes
    // Log initial health
    monitoringUtils.logSystemHealth();
    
    // Set up interval
    const timer = setInterval(() => {
      monitoringUtils.logSystemHealth();
    }, interval);
    
    return timer;
  }
};

module.exports = monitoringUtils;
