const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ['physical', 'logical', 'linguistic', 'creative', 'musical', 'social', 'nature', 'reflection', 'discipline'],
    default: 'physical',
  },
  intelligenceType: String,
  coreStatType: String,
  durationMinutes: { type: Number, default: 5 },
  xpReward: { type: Number, default: 10 },
  coinsReward: { type: Number, default: 2 },
  difficulty: { type: String, default: 'Beginner' },
  completed: { type: Boolean, default: false },
  completedAt: Date,
  instructions: String,
  proofType: {
    type: String,
    enum: ['manual', 'timer', 'text', 'photo', 'checklist'],
    default: 'manual',
  },
  proofText: String,
  proof: {
    type: { type: String },
    text: String,
    photoUrl: String,
    timerCompleted: { type: Boolean, default: false },
    submittedAt: Date,
  },
});

const dailyQuestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  description: String,
  aiGenerated: { type: Boolean, default: true },
  date: { type: String, required: true, index: true },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'expired'],
    default: 'pending',
  },
  difficulty: String,
  estimatedDuration: { type: Number, default: 30 },
  totalXPReward: { type: Number, default: 0 },
  totalCoinsReward: { type: Number, default: 0 },
  targetIntelligences: [String],
  targetCoreStats: [String],
  coachMessage: String,
  tasks: [taskSchema],
}, { timestamps: true });

dailyQuestSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyQuest', dailyQuestSchema);
