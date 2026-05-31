const mongoose = require('mongoose');

const statHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  statType: { type: String, required: true, index: true },
  statGroup: { type: String, enum: ['intelligence', 'core'], required: true },
  oldValue: { type: Number, default: 0 },
  newValue: { type: Number, default: 0 },
  delta: { type: Number, default: 0 },
  source: { type: String, default: 'daily_quest_task' },
  questId: { type: mongoose.Schema.Types.ObjectId, ref: 'DailyQuest' },
  taskTitle: String,
}, { timestamps: true });

statHistorySchema.index({ user: 1, statGroup: 1, statType: 1, createdAt: -1 });

module.exports = mongoose.model('StatHistory', statHistorySchema);
