const mongoose = require('mongoose');
const config = require('./config');
const serverDebug = require('../utils/serverDebug');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Determine which URI to use
    const uri = config.mongoURI || config.database.uri;
    serverDebug.logServiceInit('MongoDB', { uriLength: uri ? uri.length : 0 });

    // Connect to MongoDB
    const conn = await mongoose.connect(uri);

    // Log successful connection
    serverDebug.logDatabaseConnection(conn.connection);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    // Log connection error
    serverDebug.logDatabaseError(error);
    logger.error({
      message: 'Error connecting to MongoDB',
      error: error.message,
      stack: error.stack
    });

    process.exit(1);
  }
};

module.exports = connectDB;
