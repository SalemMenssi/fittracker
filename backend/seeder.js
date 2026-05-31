const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./Config/db');

const User = require('./Models/User');
const Course = require('./Models/Course');
const Post = require('./Models/Post');
const Challenge = require('./Models/Challenge');
const DailyQuest = require('./Models/DailyQuest');
const MarketplaceItem = require('./Models/MarketplaceItem');
const Activity = require('./Models/Activity');
const StatHistory = require('./Models/StatHistory');

const { today, daysAgo } = require('./seed/helpers');
const {
  getUsers,
  getCourses,
  getChallenges,
  getMarketplaceItems,
  buildDailyQuestTasks,
} = require('./seed/data');

dotenv.config();

const destroyData = async () => {
  await Promise.all([
    User.deleteMany(),
    Course.deleteMany(),
    Post.deleteMany(),
    Challenge.deleteMany(),
    DailyQuest.deleteMany(),
    MarketplaceItem.deleteMany(),
    Activity.deleteMany(),
    StatHistory.deleteMany(),
  ]);
  console.log('🗑️  All collections cleared');
};

const seedUsers = async () => {
  const definitions = getUsers();
  const created = {};
  for (const def of definitions) {
    const { key, ...userData } = def;
    const user = await User.create(userData);
    created[key] = user;
    console.log(`   👤 ${user.fullName} (${user.email})`);
  }
  return created;
};

const seedCourses = async (users) => {
  const courses = await Course.insertMany(getCourses());
  const hunter = users.hunter;
  hunter.joinedCourses = [courses[0]._id, courses[1]._id, courses[2]._id, courses[7]._id];
  await hunter.save();
  console.log(`   📚 ${courses.length} routines (courses)`);
  return courses;
};

const seedChallenges = async (users) => {
  const challengeDefs = getChallenges();
  const challenges = [];
  for (const def of challengeDefs) {
    const doc = await Challenge.create(def);
    challenges.push(doc);
  }
  const hunter = users.hunter;
  const kai = users.kai;
  const nova = users.nova;
  hunter.joinedChallenges = [challenges[0]._id, challenges[1]._id];
  kai.joinedChallenges = [challenges[2]._id];
  nova.joinedChallenges = [challenges[4]._id];
  hunter.completedChallenges = [];
  await hunter.save();
  await kai.save();
  await nova.save();
  console.log(`   ⚔️  ${challenges.length} challenges`);
  return challenges;
};

const seedDailyQuests = async (users) => {
  const hunterId = users.hunter._id;
  const todayStr = today();
  const yesterdayStr = daysAgo(1);
  const twoDaysAgo = daysAgo(2);

  const todayTasks = buildDailyQuestTasks([0, 1]);
  const todayQuest = await DailyQuest.create({
    user: hunterId,
    title: 'Daily Awakening Quest',
    description: 'A balanced daily quest to improve body, mind, and discipline.',
    aiGenerated: true,
    date: todayStr,
    status: 'active',
    difficulty: 'Beginner',
    estimatedDuration: 30,
    totalXPReward: todayTasks.reduce((s, t) => s + t.xpReward, 0),
    totalCoinsReward: todayTasks.reduce((s, t) => s + t.coinsReward, 0),
    targetIntelligences: ['bodilyKinesthetic', 'logicalMathematical', 'linguistic', 'intrapersonal', 'musical'],
    targetCoreStats: ['strength', 'discipline', 'willpower'],
    coachMessage: 'Today you will train your body, sharpen your mind, and reflect on your progress. Two tasks already complete — finish strong.',
    tasks: todayTasks,
  });

  const yesterdayTasks = buildDailyQuestTasks([0, 1, 2, 3, 4]);
  await DailyQuest.create({
    user: hunterId,
    title: 'Shadow Discipline Protocol',
    description: 'Completed quest from yesterday.',
    aiGenerated: true,
    date: yesterdayStr,
    status: 'completed',
    difficulty: 'Medium',
    estimatedDuration: 28,
    totalXPReward: 53,
    totalCoinsReward: 14,
    targetIntelligences: ['intrapersonal', 'logicalMathematical', 'bodilyKinesthetic'],
    targetCoreStats: ['discipline', 'willpower'],
    coachMessage: 'The System acknowledges your consistency.',
    tasks: yesterdayTasks,
  });

  const oldTasks = buildDailyQuestTasks([0, 1, 2, 3]);
  await DailyQuest.create({
    user: hunterId,
    title: 'Word Hunter Sprint',
    description: 'Linguistic-focused quest.',
    aiGenerated: true,
    date: twoDaysAgo,
    status: 'completed',
    difficulty: 'Easy',
    estimatedDuration: 25,
    totalXPReward: 40,
    totalCoinsReward: 10,
    targetIntelligences: ['linguistic', 'intrapersonal'],
    targetCoreStats: ['willpower'],
    coachMessage: 'Language is power. You completed this quest.',
    tasks: oldTasks,
  });

  const miraTasks = buildDailyQuestTasks([]);
  await DailyQuest.create({
    user: users.mira._id,
    title: 'Scholar\'s Dawn',
    description: 'Reading and reflection for Word Scholars.',
    aiGenerated: true,
    date: todayStr,
    status: 'pending',
    difficulty: 'Easy',
    estimatedDuration: 30,
    totalXPReward: miraTasks.reduce((s, t) => s + t.xpReward, 0),
    totalCoinsReward: miraTasks.reduce((s, t) => s + t.coinsReward, 0),
    targetIntelligences: ['linguistic', 'logicalMathematical', 'intrapersonal'],
    targetCoreStats: ['discipline', 'willpower'],
    coachMessage: 'Expand your mind before the world wakes.',
    tasks: miraTasks,
  });

  console.log(`   🎯 4 daily quests (today active for hunter: ${todayQuest._id})`);
};

const seedMarketplace = async () => {
  const items = getMarketplaceItems();
  await MarketplaceItem.insertMany(items);
  console.log(`   🛒 ${items.length} marketplace items`);
};

const seedPosts = async (users) => {
  const hunter = users.hunter;
  const nova = users.nova;
  const kai = users.kai;

  const posts = await Post.insertMany([
    {
      user: hunter._id,
      userName: hunter.fullName,
      userAvatar: hunter.avatar,
      text: 'System update: Daily Awakening Quest 40% complete. +25 XP from Logic Focus and Body Activation. Spatial training next.',
      image: 'https://images.unsplash.com/photo-1599058917765-a3b875d67c6d?w=400',
      likes: [nova._id, kai._id],
      comments: [
        { user: nova._id, userName: nova.fullName, text: 'Let\'s go Hunter! Your streak is inspiring 🔥' },
        { user: kai._id, userName: kai.fullName, text: 'Join the Strength Path challenge this week.' },
      ],
    },
    {
      user: hunter._id,
      userName: hunter.fullName,
      userAvatar: hunter.avatar,
      text: 'Awakening log: intrapersonal stat hit 3.1. Inner Shadow missions are paying off.',
    },
    {
      user: nova._id,
      userName: nova.fullName,
      userAvatar: nova.avatar,
      text: 'Team Hunter Social Week — who\'s in for daily empathy tasks?',
      likes: [hunter._id],
      comments: [
        { user: hunter._id, userName: hunter.fullName, text: 'Count me in after my daily quest!' },
      ],
    },
    {
      user: kai._id,
      userName: kai.fullName,
      userAvatar: kai.avatar,
      text: '21-day streak. Strength Fighter path is no joke. 💪',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50e?w=400',
      likes: [hunter._id, nova._id],
    },
    {
      user: users.mira._id,
      userName: users.mira.fullName,
      userAvatar: users.mira.avatar,
      text: 'Just unlocked Word Hunter badge. Linguistic intelligence grind continues.',
      likes: [hunter._id],
    },
  ]);
  console.log(`   📱 ${posts.length} social posts`);
};

const seedActivities = async (users) => {
  const hunter = users.hunter;
  const kai = users.kai;
  const now = new Date();

  const activities = await Activity.insertMany([
    { user: hunter._id, type: 'Walking', duration: 35, calories: 180, steps: 4200, date: new Date(now.getTime() - 86400000) },
    { user: hunter._id, type: 'Gym', duration: 45, calories: 320, steps: 2100, date: new Date(now.getTime() - 172800000) },
    { user: hunter._id, type: 'Yoga', duration: 20, calories: 90, steps: 0, date: new Date(now.getTime() - 259200000) },
    { user: kai._id, type: 'Running', duration: 40, calories: 410, steps: 6500, date: now },
    { user: kai._id, type: 'Gym', duration: 60, calories: 480, steps: 3000, date: new Date(now.getTime() - 86400000) },
    { user: users.nova._id, type: 'Walking', duration: 25, calories: 120, steps: 3100, date: now },
  ]);
  console.log(`   🏃 ${activities.length} activity logs`);
};

const printSummary = (users) => {
  console.log('\n══════════════════════════════════════════════════');
  console.log('  FitTrack AI — Seed complete');
  console.log('══════════════════════════════════════════════════');
  console.log('\n📋 Demo accounts (password: password123 unless noted)\n');
  console.log('  Main hunter     hunter@example.com');
  console.log('  Admin           admin@system.app  / admin123');
  console.log('  Social leader   nova@example.com');
  console.log('  Strength        kai@example.com');
  console.log('  Word scholar    mira@example.com');
  console.log('  Fresh onboard   newbie@example.com  (onboarding not done)');
  console.log('\n🎮 Hunter profile highlights:');
  console.log(`  Level ${users.hunter.performanceLevel} · ${users.hunter.rank} · ${users.hunter.classType}`);
  console.log(`  XP ${users.hunter.xp} · Coins ${users.hunter.coins} · Streak ${users.hunter.dayStreak} days`);
  console.log(`  Today\'s quest date: ${today()}`);
  console.log('\n');
};

const seedData = async () => {
  try {
    await connectDB();
    await destroyData();

    console.log('\n🌱 Seeding FitTrack AI database...\n');

    console.log('Users:');
    const users = await seedUsers();

    console.log('\nContent:');
    await seedCourses(users);
    await seedChallenges(users);
    await seedMarketplace();
    await seedDailyQuests(users);
    await seedPosts(users);
    await seedActivities(users);

    printSummary(users);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
};

const destroyOnly = async () => {
  try {
    await connectDB();
    await destroyData();
    console.log('Database destroyed.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d' || process.argv[2] === '--destroy') {
  destroyOnly();
} else {
  seedData();
}
