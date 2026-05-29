const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, default: 'pending' }, // pending, done
  time: String,
  streak: { type: Number, default: 0 },
  notificationId: String,
  lastCompletedDate: String,
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  creator: { type: String, default: 'FitTracker' },
  workoutType: { type: String, enum: ['Study', 'Fitness', 'Discipline', 'Productivity', 'Mental Focus', 'Health', 'Skill Building', 'Daily Life'], default: 'Discipline' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  levelRequirement: { type: Number, default: 1 },
  expiryDate: Date,
  status: { type: String, enum: ['open', 'expired', 'completed'], default: 'open' },
  duration: { type: String, default: '30 Minutes' },
  image: String,
  rules: [String],
  tasks: [taskSchema],
  isStandard: { type: Boolean, default: false } // To differentiate between official courses and user-created ones
}, {
  timestamps: true,
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
