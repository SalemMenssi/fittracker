const User = require('../Models/User');
const Challenge = require('../Models/Challenge');
const { checkAndUnlockAchievements } = require('../Services/achievementService');
const { sendPushNotificationToUser } = require('../Services/pushNotificationService');
const { applyLevelFromXp } = require('../utils/questHelpers');

const hydrateStatus = (challenge) => {
  const now = new Date();
  if (challenge.status !== 'completed' && challenge.expiryDate < now) {
    challenge.status = 'expired';
  }
  return challenge;
};

const getChallenges = async (_req, res) => {
  try {
    const challenges = await Challenge.find({});
    res.json(challenges.map(hydrateStatus));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.create(req.body);
    res.status(201).json(challenge);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    Object.assign(challenge, req.body);
    await challenge.save();
    res.json(challenge);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteChallenge = async (req, res) => {
  try {
    await Challenge.deleteOne({ _id: req.params.id });
    res.json({ message: 'Challenge removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const joinChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    const user = await User.findById(req.user._id);
    if (!challenge || !user) return res.status(404).json({ message: 'Challenge or user not found' });
    if (new Date(challenge.expiryDate) < new Date()) return res.status(400).json({ message: 'Challenge has expired' });

    const joined = challenge.joinedUsers.some((id) => id.toString() === user._id.toString());
    if (!joined) challenge.joinedUsers.push(user._id);
    if (!user.joinedChallenges.some((id) => id.toString() === challenge._id.toString())) {
      user.joinedChallenges.push(challenge._id);
    }
    await Promise.all([challenge.save(), user.save()]);

    const unlockedBadges = await checkAndUnlockAchievements(user._id, {
      event: 'challenge_joined',
      challengeId: challenge._id,
      challengeCategory: challenge.category,
    });

    for (const badge of unlockedBadges) {
      sendPushNotificationToUser(user._id, {
        title: 'Badge Unlocked',
        body: `New badge unlocked: ${badge.label}`,
        category: 'badge',
      }).catch(() => {});
    }

    res.json({ message: 'Challenge accepted', unlockedBadges });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const completeChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    const user = await User.findById(req.user._id);
    if (!challenge || !user) return res.status(404).json({ message: 'Challenge or user not found' });

    const hasJoined = user.joinedChallenges.some((id) => id.toString() === challenge._id.toString());
    if (!hasJoined) return res.status(400).json({ message: 'Join this challenge first' });

    const alreadyDone = user.completedChallenges.some((id) => id.toString() === challenge._id.toString());
    if (alreadyDone) {
      return res.json({ message: 'Already completed', unlockedBadges: [], xpReward: 0 });
    }

    challenge.tasks.forEach((t) => { t.status = 'done'; });
    user.completedChallenges.push(challenge._id);
    const xpReward = challenge.expReward || 30;
    applyLevelFromXp(user, xpReward);
    user.points = (user.points || 0) + Math.floor(xpReward / 2);

    await Promise.all([challenge.save(), user.save()]);

    const unlockedBadges = await checkAndUnlockAchievements(user._id, {
      event: 'challenge_completed',
      challengeId: challenge._id,
      challengeCategory: challenge.category,
      difficulty: challenge.difficulty,
      xpReward,
      userLevel: user.performanceLevel,
      streak: user.dayStreak,
    });

    for (const badge of unlockedBadges) {
      sendPushNotificationToUser(user._id, {
        title: 'Badge Unlocked',
        body: `New badge unlocked: ${badge.label}`,
        category: 'badge',
      }).catch(() => {});
    }

    sendPushNotificationToUser(user._id, {
      title: 'Challenge Completed',
      body: `You completed "${challenge.title}". +${xpReward} XP`,
      category: 'challenge',
    }).catch(() => {});

    res.json({
      message: 'Challenge completed',
      xpReward,
      unlockedBadges,
      user: { xp: user.xp, performanceLevel: user.performanceLevel, points: user.points },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  joinChallenge,
  completeChallenge,
};
