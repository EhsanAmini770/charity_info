const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  name: {
    type: String,
    trim: true
  },
  subscribed: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  }
}, { timestamps: true });

// Create a text index for search functionality
subscriberSchema.index({ email: 'text', name: 'text' });

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

module.exports = Subscriber;
