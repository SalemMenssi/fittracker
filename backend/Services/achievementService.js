const User = require('../Models/User');

const BADGE_RULES = [
  // General
  { id: 'first_daily_quest', label: 'First Daily Quest', check: (u, ctx) => ctx.questCompleted },
  { id: 'streak_3', label: '3-Day Streak', check: (u) => (u.dayStreak || 0) >= 3 },
  { id: 'streak_7', label: '7-Day Streak', check: (u) => (u.dayStreak || 0) >= 7 },
  { id: 'level_5_hunter', label: 'Level 5 Hunter', check: (u) => (u.performanceLevel || 1) >= 5 },
  { id: 'level_10_hunter', label: 'Level 10 Hunter', check: (u) => (u.performanceLevel || 1) >= 10 },
  { id: 'balanced_mind', label: 'Balanced Mind', check: (u) => {
    const s = u.intelligenceStats || {};
    const vals = Object.values(s);
    return vals.length >= 8 && vals.every((v) => (v || 0) >= 2.5);
  }},
  { id: 'all_round_awakening', label: 'All-Round Awakening', check: (u) => {
    const s = u.intelligenceStats || {};
    return Object.values(s).every((v) => (v || 0) >= 3);
  }},
  // Linguistic
  { id: 'first_journal', label: 'First Journal Entry', check: (u, ctx) => ctx.intelligenceType === 'linguistic' || ctx.category === 'linguistic' || ctx.category === 'reflection' },
  { id: 'word_hunter', label: 'Word Hunter', check: (u) => (u.intelligenceStats?.linguistic || 0) >= 3 },
  { id: 'story_builder', label: 'Story Builder', check: (u) => (u.intelligenceStats?.linguistic || 0) >= 5 },
  // Logical
  { id: 'puzzle_solver', label: 'Puzzle Solver', check: (u, ctx) => ctx.intelligenceType === 'logicalMathematical' || ctx.category === 'logical' },
  { id: 'strategy_mind', label: 'Strategy Mind', check: (u) => (u.intelligenceStats?.logicalMathematical || 0) >= 4 },
  { id: 'logic_awakening', label: 'Logic Awakening', check: (u) => (u.intelligenceStats?.logicalMathematical || 0) >= 5 },
  // Spatial
  { id: 'vision_maker', label: 'Vision Maker', check: (u, ctx) => ctx.intelligenceType === 'spatial' || ctx.category === 'creative' },
  { id: 'mental_architect', label: 'Mental Architect', check: (u) => (u.intelligenceStats?.spatial || 0) >= 4 },
  { id: 'spatial_hunter', label: 'Spatial Hunter', check: (u) => (u.intelligenceStats?.spatial || 0) >= 5 },
  // Musical
  { id: 'rhythm_starter', label: 'Rhythm Starter', check: (u, ctx) => ctx.intelligenceType === 'musical' || ctx.category === 'musical' },
  { id: 'focus_listener', label: 'Focus Listener', check: (u) => (u.intelligenceStats?.musical || 0) >= 4 },
  { id: 'beat_monk', label: 'Beat Monk', check: (u) => (u.intelligenceStats?.musical || 0) >= 5 },
  // Bodily
  { id: 'first_movement', label: 'First Movement', check: (u, ctx) => ctx.intelligenceType === 'bodilyKinesthetic' || ctx.category === 'physical' },
  { id: 'body_awakening', label: 'Body Awakening', check: (u) => (u.intelligenceStats?.bodilyKinesthetic || 0) >= 4 },
  { id: 'strength_path', label: 'Strength Path', check: (u) => (u.intelligenceStats?.bodilyKinesthetic || 0) >= 5 },
  // Naturalistic
  { id: 'nature_observer', label: 'Nature Observer', check: (u, ctx) => ctx.intelligenceType === 'naturalistic' || ctx.category === 'nature' },
  { id: 'hydration_keeper', label: 'Hydration Keeper', check: (u) => (u.intelligenceStats?.naturalistic || 0) >= 4 },
  { id: 'green_hunter', label: 'Green Hunter', check: (u) => (u.intelligenceStats?.naturalistic || 0) >= 5 },
  // Interpersonal
  { id: 'social_spark', label: 'Social Spark', check: (u, ctx) => ctx.intelligenceType === 'interpersonal' || ctx.category === 'social' },
  { id: 'empathy_builder', label: 'Empathy Builder', check: (u) => (u.intelligenceStats?.interpersonal || 0) >= 4 },
  { id: 'team_hunter', label: 'Team Hunter', check: (u) => (u.intelligenceStats?.interpersonal || 0) >= 5 },
  // Intrapersonal
  { id: 'self_reflection', label: 'Self Reflection', check: (u, ctx) => ctx.intelligenceType === 'intrapersonal' || ctx.category === 'reflection' },
  { id: 'inner_discipline', label: 'Inner Discipline', check: (u) => (u.intelligenceStats?.intrapersonal || 0) >= 4 },
  { id: 'shadow_control', label: 'Shadow Control', check: (u) => (u.intelligenceStats?.intrapersonal || 0) >= 5 },
  // Legacy compat
  { id: 'first_quest_complete', label: 'First Quest Complete', check: (u, ctx) => ctx.event === 'task_completed' },
  { id: 'discipline_rank_up', label: 'Discipline Rank Up', check: (u) => ['C-Rank', 'B-Rank', 'A-Rank', 'S-Rank'].includes(u.rank) },
  // Challenges
  { id: 'challenge_accepted', label: 'Challenge Accepted', check: (u, ctx) => ctx.event === 'challenge_joined' || (u.joinedChallenges || []).length >= 1 },
  { id: 'first_challenge_completed', label: 'First Challenge Completed', check: (u, ctx) => ctx.event === 'challenge_completed' },
  { id: 'challenge_conqueror', label: 'Challenge Conqueror', check: (u) => (u.completedChallenges || []).length >= 1 },
  { id: 'social_challenger', label: 'Social Challenger', check: (u, ctx) => ctx.event === 'challenge_completed' && ['Daily Life', 'Mental Focus'].includes(ctx.challengeCategory) },
  { id: 'discipline_challenger', label: 'Discipline Challenger', check: (u, ctx) => ctx.event === 'challenge_completed' && ctx.challengeCategory === 'Discipline' },
  { id: 'challenges_3', label: '3 Challenges Completed', check: (u) => (u.completedChallenges || []).length >= 3 },
  { id: 'challenges_10', label: '10 Challenges Completed', check: (u) => (u.completedChallenges || []).length >= 10 },
  // Tests
  { id: 'first_test_completed', label: 'First Test Completed', check: (u, ctx) => ctx.event === 'test_completed' },
  { id: 'pushup_starter', label: 'Push-Up Starter', check: (u, ctx) => ctx.event === 'test_completed' && ctx.testType === 'strength' },
  { id: 'plank_survivor', label: 'Plank Survivor', check: (u, ctx) => ctx.event === 'test_completed' && ctx.testId === 'test_4' },
  { id: 'logic_test_starter', label: 'Logic Test Starter', check: (u, ctx) => ctx.event === 'test_completed' && (ctx.testType === 'iq' || ctx.relatedIntelligence === 'logicalMathematical') },
  { id: 'reflection_starter', label: 'Reflection Starter', check: (u, ctx) => ctx.event === 'test_completed' && ctx.testType === 'discipline' },
  { id: 'intelligence_awakening', label: 'Intelligence Awakening', check: (u, ctx) => ctx.event === 'test_completed' && (ctx.score || 0) >= 80 },
  { id: 'body_assessment_complete', label: 'Body Assessment Complete', check: (u, ctx) => ctx.event === 'test_completed' && ctx.testType === 'strength' && (ctx.score || 0) >= 60 },
  { id: 'tests_5', label: '5 Tests Completed', check: (u) => (u.completedTests || []).length >= 5 },
  { id: 'tests_10', label: '10 Tests Completed', check: (u) => (u.completedTests || []).length >= 10 },
];

const hasBadge = (user, badgeId) => (user.earnedBadges || []).some((b) => b.badgeId === badgeId);

const checkAndUnlockAchievements = async (userId, context = {}) => {
  const user = await User.findById(userId);
  if (!user) return [];

  const newlyUnlocked = [];
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  for (const rule of BADGE_RULES) {
    if (hasBadge(user, rule.id)) continue;
    try {
      if (rule.check(user, context)) {
        user.earnedBadges = user.earnedBadges || [];
        user.earnedBadges.push({ badgeId: rule.id, date: today });
        newlyUnlocked.push({ badgeId: rule.id, label: rule.label, date: today });
      }
    } catch (_) {}
  }

  if (newlyUnlocked.length) {
    await user.save();
  }

  return newlyUnlocked;
};

module.exports = { checkAndUnlockAchievements, BADGE_RULES, hasBadge };
