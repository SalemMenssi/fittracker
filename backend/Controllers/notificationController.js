const User = require('../Models/User');
const { sendPushNotificationToUser } = require('../Services/pushNotificationService');

const mergeNotificationSettings = (existing = {}, incoming = {}) => ({
  ...existing,
  ...incoming,
  enabled: incoming.enabled ?? existing.enabled ?? true,
  dailyQuest: incoming.dailyQuest ?? incoming.dailyQuestReminders ?? existing.dailyQuest ?? true,
  dailyQuestTime: incoming.dailyQuestTime ?? existing.dailyQuestTime ?? existing.reminderTime ?? '08:00',
  streakProtection: incoming.streakProtection ?? incoming.streakReminders ?? existing.streakProtection ?? true,
  intelligenceTraining: incoming.intelligenceTraining ?? incoming.intelligenceTrainingReminders ?? existing.intelligenceTraining ?? true,
  challengeReminders: incoming.challengeReminders ?? existing.challengeReminders ?? true,
  aiCoach: incoming.aiCoach ?? incoming.aiCoachReminders ?? existing.aiCoach ?? true,
  badgeUnlocks: incoming.badgeUnlocks ?? incoming.achievements ?? existing.badgeUnlocks ?? true,
  levelUps: incoming.levelUps ?? existing.levelUps ?? true,
  avatarEvolution: incoming.avatarEvolution ?? existing.avatarEvolution ?? true,
  marketplaceRewards: incoming.marketplaceRewards ?? incoming.marketplaceNotifications ?? existing.marketplaceRewards ?? true,
});

const registerToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.pushTokens = user.pushTokens || [];
    if (!user.pushTokens.includes(token)) {
      user.pushTokens.push(token);
      await user.save();
    }
    res.json({ message: 'Token registered', pushTokens: user.pushTokens.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeToken = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.pushTokens = (user.pushTokens || []).filter((t) => t !== token);
    await user.save();
    res.json({ message: 'Token removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notificationSettings reminderTime pushTokens');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const settings = mergeNotificationSettings(user.notificationSettings || {}, {
      dailyQuestTime: user.notificationSettings?.dailyQuestTime || user.reminderTime || '08:00',
    });
    res.json({ notificationSettings: settings, pushTokenCount: (user.pushTokens || []).length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.notificationSettings = mergeNotificationSettings(user.notificationSettings || {}, req.body.notificationSettings || req.body);
    if (req.body.notificationSettings?.dailyQuestTime) {
      user.reminderTime = req.body.notificationSettings.dailyQuestTime;
    }
    await user.save();
    res.json({ notificationSettings: user.notificationSettings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendTest = async (req, res) => {
  try {
    const result = await sendPushNotificationToUser(req.user._id, {
      title: 'System Test',
      body: 'The System has generated a new recommendation.',
      category: 'ai_coach',
      data: { type: 'test' },
    });
    res.json({
      message: result.sent ? 'Test notification sent' : 'Notification skipped or no push token',
      ...result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerToken, removeToken, getSettings, updateSettings, sendTest, mergeNotificationSettings };
