const INTELLIGENCE_KEYS = [
  'linguistic', 'logicalMathematical', 'spatial', 'musical',
  'bodilyKinesthetic', 'naturalistic', 'interpersonal', 'intrapersonal',
];

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const getWeakestIntelligences = (intelligenceStats = {}, count = 3) => {
  return INTELLIGENCE_KEYS
    .map((key) => ({ key, value: intelligenceStats[key] ?? 1 }))
    .sort((a, b) => a.value - b.value)
    .slice(0, count)
    .map((x) => x.key);
};

const getStrongestIntelligences = (intelligenceStats = {}, count = 3) => {
  return INTELLIGENCE_KEYS
    .map((key) => ({ key, value: intelligenceStats[key] ?? 1 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, count)
    .map((x) => x.key);
};

const buildUserQuestProfile = (user) => ({
  fullName: user.fullName,
  level: user.performanceLevel || 1,
  xp: user.xp || 0,
  rank: user.rank,
  classType: user.classType,
  coreStats: user.coreStats || {},
  intelligenceStats: user.intelligenceStats || {},
  fitnessGoal: user.fitnessGoal || '',
  mentalGoal: user.mentalGoal || '',
  selectedDevelopmentFocus: user.selectedDevelopmentFocus || [],
  availableEquipment: user.availableEquipment || [],
  availableDailyTime: user.availableDailyTime || 30,
  preferredQuestTypes: user.preferredQuestTypes || ['mixed'],
  dayStreak: user.dayStreak || 0,
  weakIntelligenceAreas: getWeakestIntelligences(user.intelligenceStats),
  strongestIntelligenceAreas: getStrongestIntelligences(user.intelligenceStats),
  completedChallenges: (user.completedChallenges || []).length,
  joinedCourses: (user.joinedCourses || []).length,
});

const resolveRankByLevel = (level = 1) => {
  if (level >= 20) return 'S-Rank';
  if (level >= 15) return 'A-Rank';
  if (level >= 10) return 'B-Rank';
  if (level >= 6) return 'C-Rank';
  if (level >= 3) return 'D-Rank';
  return 'E-Rank';
};

const applyLevelFromXp = (user, xpGain) => {
  user.xp = (user.xp || 0) + xpGain;
  user.points = (user.points || 0) + Math.floor(xpGain / 2);
  const level = Math.floor(user.xp / 100) + 1;
  const prevLevel = user.performanceLevel || 1;
  user.performanceLevel = level;
  user.rank = resolveRankByLevel(level);
  if (level >= 15) user.avatarTier = 4;
  else if (level >= 10) user.avatarTier = 3;
  else if (level >= 5) user.avatarTier = 2;
  else user.avatarTier = 1;
  return { leveledUp: level > prevLevel, newLevel: level };
};

const bumpStat = (obj, key, amount = 0.1) => {
  if (!key || !obj) return;
  obj[key] = Math.round(((obj[key] || 1) + amount) * 10) / 10;
};

const questFromAiData = (userId, data, date) => {
  const tasks = (data.tasks || []).map((t) => ({
    ...t,
    completed: false,
  }));
  const totalXPReward = tasks.reduce((s, t) => s + (t.xpReward || 10), 0);
  const totalCoinsReward = tasks.reduce((s, t) => s + (t.coinsReward || 2), 0);
  return {
    user: userId,
    title: data.title || 'Daily Awakening Quest',
    description: data.description || '',
    aiGenerated: true,
    date,
    status: 'pending',
    difficulty: data.difficulty || 'Beginner',
    estimatedDuration: data.estimatedDuration || 30,
    totalXPReward,
    totalCoinsReward,
    targetIntelligences: data.targetIntelligences || [],
    targetCoreStats: data.targetCoreStats || [],
    coachMessage: data.coachMessage || '',
    tasks,
  };
};

module.exports = {
  INTELLIGENCE_KEYS,
  getTodayDate,
  getWeakestIntelligences,
  getStrongestIntelligences,
  buildUserQuestProfile,
  applyLevelFromXp,
  bumpStat,
  questFromAiData,
  resolveRankByLevel,
};
