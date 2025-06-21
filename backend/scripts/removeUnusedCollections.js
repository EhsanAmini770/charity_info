const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../utils/logger');
const debug = require('../utils/debug').createNamespace('remove-collections');

async function removeUnusedCollections() {
  try {
    // Connect to MongoDB
    debug.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongoURI || config.database.uri);
    debug.log(`MongoDB Connected: ${mongoose.connection.host}`);

    // Get list of all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    debug.log('Existing collections:', collectionNames);

    // Check if donationcampaigns collection exists
    if (collectionNames.includes('donationcampaigns')) {
      debug.log('Found donationcampaigns collection. Removing...');
      await mongoose.connection.db.dropCollection('donationcampaigns');
      debug.log('donationcampaigns collection removed successfully.');
    } else {
      debug.log('donationcampaigns collection does not exist.');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    debug.log('Disconnected from MongoDB');

    debug.log('Script completed successfully.');
  } catch (error) {
    debug.error('Error removing unused collections', error);
    logger.error({
      message: 'Error removing unused collections',
      error: error.message,
      stack: error.stack
    });
  }
}

// Run the function
removeUnusedCollections();
