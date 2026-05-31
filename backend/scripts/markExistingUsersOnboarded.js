const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../Config/db');
const User = require('../Models/User');

dotenv.config();

const DEFAULT_INTELLIGENCE = {
  linguistic: 2,
  logicalMathematical: 2,
  spatial: 2,
  musical: 2,
  bodilyKinesthetic: 2,
  naturalistic: 2,
  interpersonal: 2,
  intrapersonal: 2,
};

const DEFAULT_CORE = {
  strength: 2,
  endurance: 2,
  agility: 2,
  flexibility: 2,
  willpower: 2,
  cardioHealth: 2,
  discipline: 2,
};

const run = async () => {
  await connectDB();

  const users = await User.find({});
  let updated = 0;

  for (const user of users) {
    let changed = false;

    if (user.hasCompletedOnboarding === undefined || user.hasCompletedOnboarding === null) {
      const shouldSkip = user.onboardingComplete === true || user.performanceLevel > 1 || (user.xp || 0) > 50;
      user.hasCompletedOnboarding = shouldSkip;
      if (shouldSkip && !user.onboardingComplete) user.onboardingComplete = true;
      changed = true;
    }

    if (!user.intelligenceStats || !Object.keys(user.intelligenceStats).length) {
      user.intelligenceStats = DEFAULT_INTELLIGENCE;
      changed = true;
    }

    if (!user.coreStats || !Object.keys(user.coreStats).length) {
      user.coreStats = DEFAULT_CORE;
      changed = true;
    }

    if (user.coins === undefined || user.coins === null) {
      user.coins = 50;
      changed = true;
    }

    if (!user.notificationSettings?.enabled && user.notificationSettings?.enableAll !== false) {
      user.notificationSettings = {
        ...(user.notificationSettings || {}),
        enabled: true,
        dailyQuest: user.notificationSettings?.dailyQuestReminders !== false,
        dailyQuestTime: user.reminderTime || '08:00',
        streakProtection: user.notificationSettings?.streakReminders !== false,
        intelligenceTraining: true,
        challengeReminders: true,
        aiCoach: true,
        badgeUnlocks: true,
        levelUps: true,
        avatarEvolution: true,
        marketplaceRewards: true,
      };
      changed = true;
    }

    if (!user.pushTokens) {
      user.pushTokens = [];
      changed = true;
    }

    if (changed) {
      await user.save();
      updated += 1;
    }
  }

  console.log(`Migration complete. Updated ${updated} of ${users.length} users.`);
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
