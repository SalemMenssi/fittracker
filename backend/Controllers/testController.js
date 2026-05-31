const User = require('../Models/User');
const { checkAndUnlockAchievements } = require('../Services/achievementService');
const { sendPushNotificationToUser } = require('../Services/pushNotificationService');
const { applyLevelFromXp, bumpStat } = require('../utils/questHelpers');
const { recordStatChange } = require('../utils/statHistoryHelper');

const STAT_TO_INTELLIGENCE = {
  iq: 'logicalMathematical',
  strength: 'bodilyKinesthetic',
  discipline: 'intrapersonal',
  social: 'interpersonal',
  socialKnowledge: 'linguistic',
};

const completeTest = async (req, res) => {
  try {
    const { testId, testType, results = [], score: clientScore } = req.body;
    if (!testId) return res.status(400).json({ message: 'testId is required' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const already = (user.completedTests || []).some((t) => t.testId === testId);
    if (already) {
      return res.json({ message: 'Test already completed', unlockedBadges: [], xpReward: 0 });
    }

    let correct = 0;
    const statDeltas = {};
    results.forEach((r) => {
      const stat = r.statType || r.stat;
      if (r.isCorrect) correct += 1;
      if (stat) statDeltas[stat] = (statDeltas[stat] || 0) + (r.isCorrect ? 2 : 1);
    });

    const score = clientScore ?? Math.round((correct / Math.max(results.length, 1)) * 100);
    const primaryStat = testType || results[0]?.statType || 'discipline';
    const relatedIntelligence = STAT_TO_INTELLIGENCE[primaryStat] || 'intrapersonal';

    user.stats = user.stats || {};
    Object.entries(statDeltas).forEach(([k, v]) => {
      user.stats[k] = (user.stats[k] || 0) + v;
    });

    if (user.intelligenceStats?.[relatedIntelligence] != null) {
      const oldV = user.intelligenceStats[relatedIntelligence];
      bumpStat(user.intelligenceStats, relatedIntelligence, score >= 80 ? 0.3 : 0.15);
      await recordStatChange({
        userId: user._id,
        statType: relatedIntelligence,
        statGroup: 'intelligence',
        oldValue: oldV,
        newValue: user.intelligenceStats[relatedIntelligence],
        source: 'test_completed',
      });
    }

    const xpReward = Math.max(10, Math.round(score / 4));
    applyLevelFromXp(user, xpReward);
    user.completedTests = user.completedTests || [];
    user.completedTests.push({
      testId,
      score,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });

    await user.save();

    const unlockedBadges = await checkAndUnlockAchievements(user._id, {
      event: 'test_completed',
      testId,
      testType: primaryStat,
      score,
      relatedIntelligence,
      xpReward,
    });

    for (const badge of unlockedBadges) {
      sendPushNotificationToUser(user._id, {
        title: 'Badge Unlocked',
        body: `New badge unlocked: ${badge.label}`,
        category: 'badge',
      }).catch(() => {});
    }

    res.json({
      message: 'Test completed',
      score,
      xpReward,
      statGain: statDeltas,
      relatedIntelligence,
      unlockedBadges,
      user: {
        stats: user.stats,
        intelligenceStats: user.intelligenceStats,
        xp: user.xp,
        performanceLevel: user.performanceLevel,
        completedTests: user.completedTests,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { completeTest };
