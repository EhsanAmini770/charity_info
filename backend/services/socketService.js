const socketIo = require('socket.io');
const config = require('../config/config');
const OnlineUser = require('../models/OnlineUser');
const debug = require('../utils/debug').createNamespace('socket-service');

// Socket.io service for real-time features
const socketService = {
  // Initialize socket.io
  init: (server) => {
    const io = socketIo(server, {
      cors: {
        // Provide fallback values if config.server.cors is undefined
        origin: config.server?.cors?.origin || 'http://localhost:8080',
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Handle connections
    io.on('connection', (socket) => {
      debug.log('New client connected:', socket.id);

      // Track online user
      socketService.trackOnlineUser(socket);

      // Handle disconnection
      socket.on('disconnect', () => {
        debug.log('Client disconnected:', socket.id);
        socketService.removeOnlineUser(socket);
      });
    });

    // Set up interval to broadcast online count
    setInterval(() => {
      socketService.broadcastOnlineCount(io);
    }, 10000); // Every 10 seconds

    return io;
  },

  // Track online user
  trackOnlineUser: async (socket) => {
    try {
      const sessionId = socket.id;

      // Upsert online user
      await OnlineUser.findOneAndUpdate(
        { sessionId },
        { lastActiveAt: new Date() },
        { upsert: true, new: true }
      );
    } catch (error) {
      debug.error('Error tracking online user:', error);
    }
  },

  // Remove online user
  removeOnlineUser: async (socket) => {
    try {
      const sessionId = socket.id;

      // Remove online user
      await OnlineUser.findOneAndDelete({ sessionId });
    } catch (error) {
      debug.error('Error removing online user:', error);
    }
  },

  // Broadcast online count
  broadcastOnlineCount: async (io) => {
    try {
      // Count online users
      const count = await OnlineUser.countDocuments();

      // Broadcast count to all clients
      io.emit('onlineCount', { count });
    } catch (error) {
      debug.error('Error broadcasting online count:', error);
    }
  }
};

module.exports = socketService;
