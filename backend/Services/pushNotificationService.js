const User = require('../Models/User');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const CATEGORY_SETTING_MAP = {
  daily_quest: 'dailyQuest',
  streak: 'streakProtection',
  intelligence: 'intelligenceTraining',
  challenge: 'challengeReminders',
  ai_coach: 'aiCoach',
  badge: 'badgeUnlocks',
  level_up: 'levelUps',
  avatar: 'avatarEvolution',
  marketplace: 'marketplaceRewards',
  quest_progress: 'dailyQuest',
};

const isCategoryEnabled = (settings, category) => {
  if (!settings) return true;
  if (settings.enabled === false) return false;
  const key = CATEGORY_SETTING_MAP[category] || category;
  if (settings[key] === false) return false;
  return true;
};

const sendExpoPush = async (tokens, { title, body, data = {} }) => {
  if (!tokens?.length || typeof fetch !== 'function') return { ok: false, reason: 'no_tokens' };

  const messages = tokens.map((to) => ({
    to,
    sound: 'default',
    title,
    body,
    data,
  }));

  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  const result = await response.json();
  return { ok: response.ok, result };
};

const pruneInvalidTokens = async (user, pushResult) => {
  const tickets = pushResult?.result?.data;
  if (!Array.isArray(tickets) || !user.pushTokens?.length) return;

  const invalid = [];
  tickets.forEach((ticket, i) => {
    if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
      invalid.push(user.pushTokens[i]);
    }
  });

  if (invalid.length) {
    user.pushTokens = user.pushTokens.filter((t) => !invalid.includes(t));
    await user.save();
  }
};

const sendPushNotificationToUser = async (userId, { title, body, data = {}, category = 'daily_quest' }) => {
  try {
    const user = await User.findById(userId);
    if (!user) return { sent: false, reason: 'user_not_found' };

    const settings = user.notificationSettings || {};
    if (!isCategoryEnabled(settings, category)) {
      return { sent: false, reason: 'disabled' };
    }

    const tokens = [...new Set((user.pushTokens || []).filter(Boolean))];
    if (!tokens.length) return { sent: false, reason: 'no_tokens' };

    const pushResult = await sendExpoPush(tokens, { title, body, data: { ...data, category } });
    await pruneInvalidTokens(user, pushResult);
    return { sent: pushResult.ok, pushResult };
  } catch (error) {
    console.error('Push notification error:', error.message);
    return { sent: false, error: error.message };
  }
};

module.exports = {
  sendPushNotificationToUser,
  sendExpoPush,
  isCategoryEnabled,
  CATEGORY_SETTING_MAP,
};
