const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  mission: {
    type: String,
    required: true,
    trim: true
  },
  vision: {
    type: String,
    required: true,
    trim: true
  },
  foundedYear: {
    type: String,
    required: true,
    trim: true
  },
  volunteersCount: {
    type: String,
    required: true,
    trim: true
  },
  peopleHelpedCount: {
    type: String,
    required: true,
    trim: true
  },
  communitiesCount: {
    type: String,
    required: true,
    trim: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Update the updatedAt field before saving
aboutSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update the updatedAt field before updating
aboutSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const About = mongoose.model('About', aboutSchema);

module.exports = About;
