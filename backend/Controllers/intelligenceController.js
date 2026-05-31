const User = require('../Models/User');
const DailyQuest = require('../Models/DailyQuest');
const { getWeakestIntelligences, getStrongestIntelligences, INTELLIGENCE_KEYS } = require('../utils/questHelpers');

const INTELLIGENCE_META = {
  linguistic: { label: 'Linguistic', short: 'Word', color: '#4ecdc4' },
  logicalMathematical: { label: 'Logical-Mathematical', short: 'Logic', color: '#45b7d1' },
  spatial: { label: 'Spatial', short: 'Spatial', color: '#96ceb4' },
  musical: { label: 'Musical', short: 'Rhythm', color: '#ffeaa7' },
  bodilyKinesthetic: { label: 'Bodily-Kinesthetic', short: 'Body', color: '#ff6b6b' },
  naturalistic: { label: 'Naturalistic', short: 'Nature', color: '#55efc4' },
  interpersonal: { label: 'Interpersonal', short: 'Social', color: '#a29bfe' },
  intrapersonal: { label: 'Intrapersonal', short: 'Self', color: '#fd79a8' },
};

const getIntelligenceProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const stats = user.intelligenceStats || {};
    const weakest = getWeakestIntelligences(stats, 1)[0];
    const strongest = getStrongestIntelligences(stats, 1)[0];

    const recentQuests = await DailyQuest.find({ user: user._id, status: 'completed' })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      intelligenceStats: stats,
      coreStats: user.coreStats || {},
      classType: user.classType,
      meta: INTELLIGENCE_META,
      weakestIntelligence: weakest,
      strongestIntelligence: strongest,
      recommendation: weakest
        ? `Your weakest intelligence is ${INTELLIGENCE_META[weakest]?.label || weakest}. Today, try a 5-minute task targeting this area.`
        : 'Keep balancing all eight intelligences for holistic growth.',
      recentCompletedQuests: recentQuests.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateIntelligenceProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.intelligenceStats) {
      user.intelligenceStats = { ...user.intelligenceStats?.toObject?.() || user.intelligenceStats || {}, ...req.body.intelligenceStats };
    }
    if (req.body.coreStats) {
      user.coreStats = { ...user.coreStats?.toObject?.() || user.coreStats || {}, ...req.body.coreStats };
    }
    if (req.body.selectedDevelopmentFocus) user.selectedDevelopmentFocus = req.body.selectedDevelopmentFocus;
    if (req.body.preferredQuestTypes) user.preferredQuestTypes = req.body.preferredQuestTypes;
    if (req.body.availableDailyTime) user.availableDailyTime = req.body.availableDailyTime;
    if (req.body.availableEquipment) user.availableEquipment = req.body.availableEquipment;
    if (req.body.classType) user.classType = req.body.classType;
    if (req.body.fitnessGoal) user.fitnessGoal = req.body.fitnessGoal;
    if (req.body.mentalGoal) user.mentalGoal = req.body.mentalGoal;
    if (req.body.onboardingComplete !== undefined) {
      user.onboardingComplete = req.body.onboardingComplete;
      user.hasCompletedOnboarding = req.body.onboardingComplete;
    }
    if (req.body.hasCompletedOnboarding !== undefined) {
      user.hasCompletedOnboarding = req.body.hasCompletedOnboarding;
      user.onboardingComplete = req.body.hasCompletedOnboarding;
    }

    await user.save();
    const updated = await User.findById(user._id).select('-password');
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getIntelligenceProfile, updateIntelligenceProfile, INTELLIGENCE_META, INTELLIGENCE_KEYS };
