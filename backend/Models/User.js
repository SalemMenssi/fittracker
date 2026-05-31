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
  coins: { type: Number, default: 0 },
  coursesCompleted: { type: Number, default: 0 },
  dayStreak: { type: Number, default: 0 },
  lastCompletionDate: { type: String, default: '' },
  timeSpentHours: { type: Number, default: 0 },
  weeklyGoalPercent: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  performanceLevel: { type: Number, default: 1 },
  rank: { type: String, default: 'E-Rank' },
  classType: { type: String, default: 'Balanced Hunter' },
  avatarTier: { type: Number, default: 1 },
  equippedAura: { type: String, default: '' },
  equippedSkin: { type: String, default: '' },
  pushTokens: [{ type: String }],
  activeBoosters: [{
    itemId: String,
    effectType: { type: String, default: 'xpMultiplier' },
    target: { type: String, default: 'all' },
    multiplier: { type: Number, default: 1 },
    expiresAt: Date,
  }],
  inventory: [{ itemId: String, purchasedAt: { type: Date, default: Date.now } }],
  onboardingComplete: { type: Boolean, default: false },
  hasCompletedOnboarding: { type: Boolean, default: false },
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
  intelligenceStats: {
    linguistic: { type: Number, default: 1 },
    logicalMathematical: { type: Number, default: 1 },
    spatial: { type: Number, default: 1 },
    musical: { type: Number, default: 1 },
    bodilyKinesthetic: { type: Number, default: 1 },
    naturalistic: { type: Number, default: 1 },
    interpersonal: { type: Number, default: 1 },
    intrapersonal: { type: Number, default: 1 },
  },
  coreStats: {
    strength: { type: Number, default: 1 },
    endurance: { type: Number, default: 1 },
    agility: { type: Number, default: 1 },
    flexibility: { type: Number, default: 1 },
    willpower: { type: Number, default: 1 },
    cardioHealth: { type: Number, default: 1 },
    discipline: { type: Number, default: 1 },
  },
  selectedDevelopmentFocus: {
    type: [String],
    default: ['generalGrowth'],
  },
  preferredQuestTypes: {
    type: [String],
    default: ['mixed'],
  },
  availableDailyTime: { type: Number, default: 30 },
  availableEquipment: [{ type: String }],
  fitnessGoal: { type: String, default: '' },
  mentalGoal: { type: String, default: '' },
  reminderTime: { type: String, default: '08:00' },
  notificationSettings: {
    enabled: { type: Boolean, default: true },
    enableAll: { type: Boolean, default: true },
    dailyQuest: { type: Boolean, default: true },
    dailyQuestTime: { type: String, default: '08:00' },
    dailyQuestReminders: { type: Boolean, default: true },
    streakProtection: { type: Boolean, default: true },
    streakReminders: { type: Boolean, default: true },
    intelligenceTraining: { type: Boolean, default: true },
    intelligenceTrainingReminders: { type: Boolean, default: true },
    challengeReminders: { type: Boolean, default: true },
    aiCoach: { type: Boolean, default: true },
    aiCoachReminders: { type: Boolean, default: true },
    badgeUnlocks: { type: Boolean, default: true },
    achievements: { type: Boolean, default: true },
    levelUps: { type: Boolean, default: true },
    avatarEvolution: { type: Boolean, default: true },
    marketplaceRewards: { type: Boolean, default: true },
    marketplaceNotifications: { type: Boolean, default: true },
    workoutReminders: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true },
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
    date: String,
  }],
  joinedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  }],
  completedTests: [{ testId: String, score: Number, date: String }],
}, {
  timestamps: true,
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
