const morgan = require('morgan');
const logger = require('../utils/logger');

// Create a custom Morgan token for request ID
morgan.token('id', (req) => req.id);

// Create a custom Morgan format
const morganFormat = ':id :remote-addr :method :url :status :response-time ms - :res[content-length]';

// Create Morgan middleware with Winston logger
const httpLogger = morgan(morganFormat, {
  stream: logger.stream
});

module.exports = httpLogger;
