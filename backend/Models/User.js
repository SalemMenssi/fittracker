const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  dateOfBirth: Date,
  gender: String,
  location: String,
  age: { type: Number, default: 25 },
  weight: { type: Number, default: 70 },
  height: { type: Number, default: 175 },
  unit: { type: String, default: 'metric' },
  avatar: { type: String, default: 'https://randomuser.me/api/portraits/men/32.jpg' },
  level: { type: String, default: 'Beginner' },
  joinDate: { type: Date, default: Date.now },
  isPro: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  points: { type: Number, default: 0 },
  coursesCompleted: { type: Number, default: 0 },
  dayStreak: { type: Number, default: 0 },
  lastCompletionDate: { type: String, default: '' },
  timeSpentHours: { type: Number, default: 0 },
  weeklyGoalPercent: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  performanceLevel: { type: Number, default: 1 }, // Numeric level for gamification
  rank: { type: String, default: 'E-Rank' },
  classType: { type: String, default: 'Novice' },
  avatarTier: { type: Number, default: 1 },
  completedDailyTasks: [{ type: String }],
  lastResetDate: { type: String, default: '' },
  joinedChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
  completedChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
  stats: {
    discipline: { type: Number, default: 0 },
    iq: { type: Number, default: 0 },
    strength: { type: Number, default: 0 },
    social: { type: Number, default: 0 },
    socialKnowledge: { type: Number, default: 0 },
  },
  notificationSettings: {
    workoutReminders: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true },
    achievements: { type: Boolean, default: true },
    newCourses: { type: Boolean, default: false },
    socialActivity: { type: Boolean, default: false },
  },
  privacySettings: {
    twoFactor: { type: Boolean, default: false },
    publicProfile: { type: Boolean, default: true },
    dataSharing: { type: Boolean, default: false },
  },
  earnedBadges: [{ 
    badgeId: String,
    date: String
  }],
  joinedCourses: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course' 
  }]
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
