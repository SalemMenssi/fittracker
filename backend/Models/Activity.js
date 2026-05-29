const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  type: {
    type: String,
    required: true, // e.g., 'Walking', 'Running', 'Gym', 'Yoga'
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  steps: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
