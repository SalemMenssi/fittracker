const DailyQuest = require('../Models/DailyQuest');
const User = require('../Models/User');
const { generateDailyQuestData } = require('../utils/aiHelper');
const {
  getTodayDate,
  buildUserQuestProfile,
  applyLevelFromXp,
  bumpStat,
  questFromAiData,
} = require('../utils/questHelpers');
const { applyXpBoosters } = require('../utils/boosterHelper');
const { recordStatChange } = require('../utils/statHistoryHelper');
const { checkAndUnlockAchievements } = require('../Services/achievementService');
const { sendPushNotificationToUser } = require('../Services/pushNotificationService');

const getAvatarTier = (level) => {
  if (level >= 15) return 4;
  if (level >= 10) return 3;
  if (level >= 5) return 2;
  return 1;
};

const processTaskCompletion = async (user, task, quest, body = {}) => {
  const { proofText, proofPhotoUrl, timerCompleted } = body;

  if (task.proofType === 'timer' && !timerCompleted) {
    throw new Error('Timer must be completed before finishing this task');
  }
  if (task.proofType === 'text' && !proofText?.trim() && !task.proof?.text) {
    throw new Error('Reflection text is required');
  }
  if (task.proofType === 'photo' && !proofPhotoUrl) {
    throw new Error('Proof photo is required');
  }

  task.completed = true;
  task.completedAt = new Date();
  task.proof = {
    type: task.proofType,
    text: proofText || task.proofText || '',
    photoUrl: proofPhotoUrl || '',
    timerCompleted: !!timerCompleted,
    submittedAt: new Date(),
  };
  if (proofText) task.proofText = proofText;

  if (quest.status === 'pending') quest.status = 'active';

  const baseXP = task.xpReward || 10;
  const { baseXP: bXP, bonusXP, finalXP, appliedBoosters } = applyXpBoosters(user, task, baseXP);
  const coinsGain = task.coinsReward || 2;
  const prevLevel = user.performanceLevel || 1;
  const prevTier = user.avatarTier || 1;

  const levelResult = applyLevelFromXp(user, finalXP);
  user.coins = (user.coins || 0) + coinsGain;

  const statRecords = [];
  if (task.intelligenceType && user.intelligenceStats) {
    const oldV = user.intelligenceStats[task.intelligenceType] || 1;
    bumpStat(user.intelligenceStats, task.intelligenceType, 0.2);
    const newV = user.intelligenceStats[task.intelligenceType];
    statRecords.push(recordStatChange({
      userId: user._id,
      statType: task.intelligenceType,
      statGroup: 'intelligence',
      oldValue: oldV,
      newValue: newV,
      questId: quest._id,
      taskTitle: task.title,
    }));
  }
  if (task.coreStatType && user.coreStats) {
    const oldV = user.coreStats[task.coreStatType] || 1;
    bumpStat(user.coreStats, task.coreStatType, 0.15);
    const newV = user.coreStats[task.coreStatType];
    statRecords.push(recordStatChange({
      userId: user._id,
      statType: task.coreStatType,
      statGroup: 'core',
      oldValue: oldV,
      newValue: newV,
      questId: quest._id,
      taskTitle: task.title,
    }));
  }

  const allDone = quest.tasks.every((t) => t.completed);
  let questCompleted = false;
  let questBonus = null;
  if (allDone) {
    quest.status = 'completed';
    questCompleted = true;
    const bonusXp = 25;
    const bonusCoins = 10;
    applyLevelFromXp(user, bonusXp);
    user.coins = (user.coins || 0) + bonusCoins;
    questBonus = { xp: bonusXp, coins: bonusCoins };
    const today = getTodayDate();
    if (user.lastCompletionDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      user.dayStreak = user.lastCompletionDate === yStr ? (user.dayStreak || 0) + 1 : 1;
      user.lastCompletionDate = today;
    }
  }

  const newTier = getAvatarTier(user.performanceLevel || 1);
  const avatarEvolved = newTier > prevTier;
  if (avatarEvolved) user.avatarTier = newTier;

  await Promise.all(statRecords);

  const unlockedBadges = await checkAndUnlockAchievements(user._id, {
    event: 'task_completed',
    intelligenceType: task.intelligenceType,
    category: task.category,
    coreStatType: task.coreStatType,
    questCompleted,
    streak: user.dayStreak,
    level: user.performanceLevel,
  });

  await user.save();

  // Push notifications (non-blocking)
  sendPushNotificationToUser(user._id, {
    title: 'Quest Progress',
    body: `Quest progress: +${finalXP} XP gained.`,
    category: 'quest_progress',
  }).catch(() => {});

  if (questCompleted) {
    sendPushNotificationToUser(user._id, {
      title: 'Daily Quest Completed',
      body: 'Daily Quest Completed. The System acknowledges your growth.',
      category: 'daily_quest',
    }).catch(() => {});
  }

  if (levelResult.leveledUp) {
    sendPushNotificationToUser(user._id, {
      title: 'Level Up',
      body: `You reached Level ${levelResult.newLevel}. Your rank has increased.`,
      category: 'level_up',
    }).catch(() => {});
  }

  if (avatarEvolved) {
    sendPushNotificationToUser(user._id, {
      title: 'Avatar Evolution',
      body: `Your avatar has evolved to tier ${newTier}.`,
      category: 'avatar',
    }).catch(() => {});
  }

  for (const badge of unlockedBadges) {
    sendPushNotificationToUser(user._id, {
      title: 'Badge Unlocked',
      body: `New badge unlocked: ${badge.label}`,
      category: 'badge',
      data: { badgeId: badge.badgeId },
    }).catch(() => {});
  }

  return {
    reward: {
      baseXP: bXP,
      bonusXP,
      finalXP,
      xp: finalXP,
      coins: coinsGain,
      appliedBoosters,
    },
    levelResult: { ...levelResult, avatarEvolved, newTier },
    questCompleted,
    questBonus,
    unlockedBadges,
  };
};

const getTodayQuest = async (req, res) => {
  try {
    const date = getTodayDate();
    const quest = await DailyQuest.findOne({ user: req.user._id, date });
    res.json(quest || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateQuest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const date = getTodayDate();
    let existing = await DailyQuest.findOne({ user: user._id, date });

    if (existing && !req.body?.force && existing.status !== 'expired') {
      return res.json(existing);
    }

    if (existing && req.body?.force) {
      await DailyQuest.deleteOne({ _id: existing._id });
      existing = null;
    }

    const profile = buildUserQuestProfile(user);
    let questDoc;
    if (req.body?.questData) {
      questDoc = questFromAiData(user._id, req.body.questData, date);
    } else {
      const aiData = await generateDailyQuestData(profile);
      questDoc = questFromAiData(user._id, aiData, date);
    }

    const quest = await DailyQuest.create(questDoc);

    sendPushNotificationToUser(user._id, {
      title: 'Daily Quest Ready',
      body: 'Your Daily Awakening Quest is ready.',
      category: 'daily_quest',
    }).catch(() => {});

    res.status(201).json(quest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const completeTask = async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const quest = await DailyQuest.findOne({ _id: id, user: req.user._id });
    if (!quest) return res.status(404).json({ message: 'Quest not found' });

    const task = quest.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.completed) {
      return res.json({ quest, reward: null, message: 'Already completed', unlockedBadges: [] });
    }

    const user = await User.findById(req.user._id);
    const result = await processTaskCompletion(user, task, quest, req.body);

    await quest.save();

    res.json({
      quest,
      ...result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const completeQuest = async (req, res) => {
  try {
    const quest = await DailyQuest.findOne({ _id: req.params.id, user: req.user._id });
    if (!quest) return res.status(404).json({ message: 'Quest not found' });

    const user = await User.findById(req.user._id);
    for (const task of quest.tasks) {
      if (!task.completed) {
        await processTaskCompletion(user, task, quest, {
          proofText: task.proofText,
          proofPhotoUrl: task.proof?.photoUrl,
          timerCompleted: task.proofType !== 'timer' || task.proof?.timerCompleted,
        });
      }
    }
    await quest.save();

    res.json({
      quest,
      user: { xp: user.xp, dayStreak: user.dayStreak, coins: user.coins, performanceLevel: user.performanceLevel },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const regenerateQuest = async (req, res) => {
  try {
    const { id } = req.params;
    if (id && id !== 'today') {
      await DailyQuest.deleteOne({ _id: id, user: req.user._id });
    }
    req.body = { ...(req.body || {}), force: true };
    return generateQuest(req, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const regenerateTodayQuest = async (req, res) => {
  try {
    req.body = { ...(req.body || {}), force: true };
    return generateQuest(req, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuestHistory = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const quests = await DailyQuest.find({ user: req.user._id }).sort({ date: -1 }).limit(limit);
    res.json(quests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const activateQuest = async (req, res) => {
  try {
    const quest = await DailyQuest.findOne({ _id: req.params.id, user: req.user._id });
    if (!quest) return res.status(404).json({ message: 'Quest not found' });
    quest.status = 'active';
    await quest.save();
    res.json(quest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTodayQuest,
  generateQuest,
  completeTask,
  completeQuest,
  regenerateQuest,
  regenerateTodayQuest,
  getQuestHistory,
  activateQuest,
};
