const mongoose = require('mongoose');

const challengeTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['pending', 'done'], default: 'pending' },
});

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  expReward: { type: Number, default: 30 },
  levelRequirement: { type: Number, default: 1 },
  startDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  joinedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tasks: [challengeTaskSchema],
  status: { type: String, enum: ['open', 'expired', 'completed'], default: 'open' },
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);
