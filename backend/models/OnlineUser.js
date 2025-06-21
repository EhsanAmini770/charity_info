const mongoose = require('mongoose');

const OnlineUserSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
});

// Create index to expire documents after timeout (5 minutes)
OnlineUserSchema.index({ lastActiveAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model('OnlineUser', OnlineUserSchema);
