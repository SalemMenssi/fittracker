const User = require('../Models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
const registerUser = async (req, res) => {
  const { fullName, email, password, age, weight, height, unit } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const metrics = req.body.bodyMetrics || {};
    const user = await User.create({
      fullName,
      email,
      password,
      age: metrics.age || age,
      weight: metrics.weight || weight,
      height: metrics.height || height,
      unit: unit || 'metric',
    });

    if (user) {
      res.status(201).json({
        ...user._doc,
        password: undefined,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        ...user._doc,
        password: undefined,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('joinedCourses');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
      user.gender = req.body.gender || user.gender;
      user.location = req.body.location || user.location;
      
      // Handle Body Metrics (either top-level or grouped)
      const metrics = req.body.bodyMetrics || {};
      user.age = metrics.age || req.body.age || user.age;
      user.weight = metrics.weight || req.body.weight || user.weight;
      user.height = metrics.height || req.body.height || user.height;
      
      user.unit = req.body.unit || user.unit;
      user.avatar = req.body.avatar || user.avatar;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      if (req.body.notificationSettings) {
          user.notificationSettings = { ...user.notificationSettings, ...req.body.notificationSettings };
      }

      if (req.body.privacySettings) {
          user.privacySettings = { ...user.privacySettings, ...req.body.privacySettings };
      }

      if (req.body.stats) {
        user.stats = { ...user.stats, ...req.body.stats };
      }
      if (req.body.earnedBadges) user.earnedBadges = req.body.earnedBadges;
      if (req.body.performanceLevel !== undefined) user.performanceLevel = req.body.performanceLevel;
      if (req.body.classType) user.classType = req.body.classType;
      if (req.body.rank) user.rank = req.body.rank;
      if (req.body.avatarTier !== undefined) user.avatarTier = req.body.avatarTier;
      if (req.body.xp !== undefined) user.xp = req.body.xp;
      if (req.body.points !== undefined) user.points = req.body.points;
      if (req.body.dayStreak !== undefined) user.dayStreak = req.body.dayStreak;
      if (req.body.lastCompletionDate) user.lastCompletionDate = req.body.lastCompletionDate;
      if (req.body.lastResetDate !== undefined) user.lastResetDate = req.body.lastResetDate;
      if (req.body.completedDailyTasks) user.completedDailyTasks = req.body.completedDailyTasks;
      if (req.body.joinedChallenges) user.joinedChallenges = req.body.joinedChallenges;
      if (req.body.completedChallenges) user.completedChallenges = req.body.completedChallenges;
      if (req.body.intelligenceStats) user.intelligenceStats = { ...user.intelligenceStats?.toObject?.() || user.intelligenceStats || {}, ...req.body.intelligenceStats };
      if (req.body.coreStats) user.coreStats = { ...user.coreStats?.toObject?.() || user.coreStats || {}, ...req.body.coreStats };
      if (req.body.selectedDevelopmentFocus) user.selectedDevelopmentFocus = req.body.selectedDevelopmentFocus;
      if (req.body.preferredQuestTypes) user.preferredQuestTypes = req.body.preferredQuestTypes;
      if (req.body.availableDailyTime !== undefined) user.availableDailyTime = req.body.availableDailyTime;
      if (req.body.availableEquipment) user.availableEquipment = req.body.availableEquipment;
      if (req.body.fitnessGoal) user.fitnessGoal = req.body.fitnessGoal;
      if (req.body.mentalGoal) user.mentalGoal = req.body.mentalGoal;
      if (req.body.reminderTime) user.reminderTime = req.body.reminderTime;
      if (req.body.onboardingComplete !== undefined) {
        user.onboardingComplete = req.body.onboardingComplete;
        user.hasCompletedOnboarding = req.body.onboardingComplete;
      }
      if (req.body.hasCompletedOnboarding !== undefined) {
        user.hasCompletedOnboarding = req.body.hasCompletedOnboarding;
        user.onboardingComplete = req.body.hasCompletedOnboarding;
      }
      if (req.body.coins !== undefined) user.coins = req.body.coins;
      if (req.body.equippedAura) user.equippedAura = req.body.equippedAura;
      if (req.body.equippedSkin) user.equippedSkin = req.body.equippedSkin;
      if (req.body.inventory) user.inventory = req.body.inventory;

      const updatedUser = await user.save();

      res.json({
          _id: updatedUser._id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          token: generateToken(updatedUser._id),
          // Return full user minus password
          ...updatedUser._doc,
          password: undefined
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all users (for leaderboard)
// @route   GET /api/auth/users
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ points: -1 }).select('fullName avatar points');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, authUser, getUserProfile, updateUserProfile, getUsers };
