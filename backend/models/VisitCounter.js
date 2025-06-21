const mongoose = require('mongoose');

const VisitCounterSchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD format
    required: true,
    unique: true
  },
  totalVisits: {
    type: Number,
    default: 0
  },
  uniqueVisits: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('VisitCounter', VisitCounterSchema);
