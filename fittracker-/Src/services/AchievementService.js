import { getCurrentUser, updateUser } from "./AuthService";

// ─── Badge definitions (rules evaluated at runtime) ─────────────────────────
export const BADGE_DEFINITIONS = [
  {
    id: "first_quest_complete",
    icon: "footsteps-outline",
    label: "First Quest Complete",
    desc: "Finished your first daily quest",
    color: "#00c2c2",
    bg: "#e8f9f9",
    check: (_user, courses) => courses.some((c) => c.Tasks?.some((t) => t.status === "done")),
  },
  {
    id: "challenge_accepted",
    icon: "barbell-outline",
    label: "Challenge Accepted",
    desc: "Joined your first challenge",
    color: "#00c2c2",
    bg: "#e8f9f9",
    check: (user) => (user?.joinedChallenges || []).length >= 1,
  },
  {
    id: "streak_7",
    icon: "flame-outline",
    label: "7-Day Streak",
    desc: "Maintained daily quest streak for 7 days",
    color: "#ff8c42",
    bg: "#fff3e8",
    check: (user) => (user?.dayStreak || 0) >= 7,
  },
  {
    id: "level_5_hunter",
    icon: "flash-outline",
    label: "Level 5 Hunter",
    desc: "Reached hunter level 5",
    color: "#f4c542",
    bg: "#fff8e8",
    check: (user) => (user?.performanceLevel || 1) >= 5,
  },
  {
    id: "discipline_rank_up",
    icon: "sunny-outline",
    label: "Discipline Rank Up",
    desc: "Advanced to C-Rank or higher",
    color: "#42c5f4",
    bg: "#e8f4ff",
    check: (user) => ["C-Rank", "B-Rank", "A-Rank", "S-Rank"].includes(user?.rank),
  },
  {
    id: "challenge_conqueror",
    icon: "trophy-outline",
    label: "Challenge Conqueror",
    desc: "Completed your first challenge",
    color: "#f4c542",
    bg: "#fff8e8",
    check: (user) => (user?.completedChallenges || []).length >= 1,
  },
  {
    id: "task_master",
    icon: "checkmark-done-outline",
    label: "Task Master",
    desc: "Completed 10 tasks across all courses",
    color: "#2ecc71",
    bg: "#eafaf1",
    check: (user, courses) => {
      const total = courses.reduce(
        (sum, c) => sum + c.Tasks.filter((t) => t.status === "done").length,
        0
      );
      return total >= 10;
    },
  },
  {
    id: "century",
    icon: "star-outline",
    label: "Century",
    desc: "Earned 100 points",
    color: "#9b59b6",
    bg: "#f5eafb",
    check: (user) => (user?.points || 0) >= 100,
  },
  // Intelligence badges
  { id: "first_journal", icon: "create-outline", label: "First Journal Entry", desc: "Completed a reflection task", color: "#4ecdc4", bg: "#e8f9f9", check: (u) => (u?.intelligenceStats?.intrapersonal || 1) >= 2 },
  { id: "word_hunter", icon: "book-outline", label: "Word Hunter", desc: "Linguistic level 3+", color: "#4ecdc4", bg: "#e8f9f9", check: (u) => (u?.intelligenceStats?.linguistic || 1) >= 3 },
  { id: "story_builder", icon: "library-outline", label: "Story Builder", desc: "Linguistic level 5+", color: "#4ecdc4", bg: "#e8f9f9", check: (u) => (u?.intelligenceStats?.linguistic || 1) >= 5 },
  { id: "puzzle_solver", icon: "extension-puzzle-outline", label: "Puzzle Solver", desc: "Logical level 3+", color: "#45b7d1", bg: "#e8f4ff", check: (u) => (u?.intelligenceStats?.logicalMathematical || 1) >= 3 },
  { id: "strategy_mind", icon: "grid-outline", label: "Strategy Mind", desc: "Logical level 4+", color: "#45b7d1", bg: "#e8f4ff", check: (u) => (u?.intelligenceStats?.logicalMathematical || 1) >= 4 },
  { id: "logic_awakening", icon: "flash-outline", label: "Logic Awakening", desc: "Logical level 5+", color: "#45b7d1", bg: "#e8f4ff", check: (u) => (u?.intelligenceStats?.logicalMathematical || 1) >= 5 },
  { id: "vision_maker", icon: "eye-outline", label: "Vision Maker", desc: "Spatial level 3+", color: "#96ceb4", bg: "#eefaf4", check: (u) => (u?.intelligenceStats?.spatial || 1) >= 3 },
  { id: "mental_architect", icon: "construct-outline", label: "Mental Architect", desc: "Spatial level 4+", color: "#96ceb4", bg: "#eefaf4", check: (u) => (u?.intelligenceStats?.spatial || 1) >= 4 },
  { id: "spatial_hunter", icon: "cube-outline", label: "Spatial Hunter", desc: "Spatial level 5+", color: "#96ceb4", bg: "#eefaf4", check: (u) => (u?.intelligenceStats?.spatial || 1) >= 5 },
  { id: "rhythm_starter", icon: "musical-note-outline", label: "Rhythm Starter", desc: "Musical level 3+", color: "#f4c542", bg: "#fff8e8", check: (u) => (u?.intelligenceStats?.musical || 1) >= 3 },
  { id: "focus_listener", icon: "headset-outline", label: "Focus Listener", desc: "Musical level 4+", color: "#f4c542", bg: "#fff8e8", check: (u) => (u?.intelligenceStats?.musical || 1) >= 4 },
  { id: "beat_monk", icon: "pulse-outline", label: "Beat Monk", desc: "Musical level 5+", color: "#f4c542", bg: "#fff8e8", check: (u) => (u?.intelligenceStats?.musical || 1) >= 5 },
  { id: "first_movement", icon: "walk-outline", label: "First Movement", desc: "Bodily level 2+", color: "#ff6b6b", bg: "#ffe8e8", check: (u) => (u?.intelligenceStats?.bodilyKinesthetic || 1) >= 2 },
  { id: "body_awakening", icon: "fitness-outline", label: "Body Awakening", desc: "Bodily level 4+", color: "#ff6b6b", bg: "#ffe8e8", check: (u) => (u?.intelligenceStats?.bodilyKinesthetic || 1) >= 4 },
  { id: "strength_path", icon: "barbell-outline", label: "Strength Path", desc: "Bodily level 5+", color: "#ff6b6b", bg: "#ffe8e8", check: (u) => (u?.intelligenceStats?.bodilyKinesthetic || 1) >= 5 },
  { id: "nature_observer", icon: "leaf-outline", label: "Nature Observer", desc: "Naturalistic level 3+", color: "#55efc4", bg: "#e8faf4", check: (u) => (u?.intelligenceStats?.naturalistic || 1) >= 3 },
  { id: "hydration_keeper", icon: "water-outline", label: "Hydration Keeper", desc: "Naturalistic level 4+", color: "#55efc4", bg: "#e8faf4", check: (u) => (u?.intelligenceStats?.naturalistic || 1) >= 4 },
  { id: "green_hunter", icon: "flower-outline", label: "Green Hunter", desc: "Naturalistic level 5+", color: "#55efc4", bg: "#e8faf4", check: (u) => (u?.intelligenceStats?.naturalistic || 1) >= 5 },
  { id: "social_spark", icon: "chatbubbles-outline", label: "Social Spark", desc: "Interpersonal level 3+", color: "#a29bfe", bg: "#f0eeff", check: (u) => (u?.intelligenceStats?.interpersonal || 1) >= 3 },
  { id: "empathy_builder", icon: "heart-outline", label: "Empathy Builder", desc: "Interpersonal level 4+", color: "#a29bfe", bg: "#f0eeff", check: (u) => (u?.intelligenceStats?.interpersonal || 1) >= 4 },
  { id: "team_hunter", icon: "people-outline", label: "Team Hunter", desc: "Interpersonal level 5+", color: "#a29bfe", bg: "#f0eeff", check: (u) => (u?.intelligenceStats?.interpersonal || 1) >= 5 },
  { id: "self_reflection", icon: "moon-outline", label: "Self Reflection", desc: "Intrapersonal level 3+", color: "#fd79a8", bg: "#ffe8f2", check: (u) => (u?.intelligenceStats?.intrapersonal || 1) >= 3 },
  { id: "inner_discipline", icon: "shield-outline", label: "Inner Discipline", desc: "Intrapersonal level 4+", color: "#fd79a8", bg: "#ffe8f2", check: (u) => (u?.intelligenceStats?.intrapersonal || 1) >= 4 },
  { id: "shadow_control", icon: "contrast-outline", label: "Shadow Control", desc: "Intrapersonal level 5+", color: "#fd79a8", bg: "#ffe8f2", check: (u) => (u?.intelligenceStats?.intrapersonal || 1) >= 5 },
];

// ─── Compute which badges the user has earned ─────────────────────────────────
export const computeEarnedBadges = (user, courses) => {
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return BADGE_DEFINITIONS.filter((b) => b.check(user, courses)).map((b) => ({
    ...b,
    date: today,
    earned: true,
  }));
};

// ─── Store/retrieve unlock dates (via backend) ──────────────────────
export const getAchievementDates = async () => {
    const user = await getCurrentUser();
    const dates = {};
    (user?.earnedBadges || []).forEach(b => {
      dates[b.badgeId] = b.date;
    });
    return dates;
};

export const markAchievementEarned = async (badgeId) => {
  const user = await getCurrentUser();
  const earnedBadges = user?.earnedBadges || [];
  
  if (!earnedBadges.some(b => b.badgeId === badgeId)) {
    const newBadge = {
        badgeId,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
    };
    earnedBadges.push(newBadge);
    const updated = await updateUser({ earnedBadges });
    return updated.earnedBadges;
  }
  return earnedBadges;
};

export default { computeEarnedBadges, getAchievementDates, markAchievementEarned, BADGE_DEFINITIONS };
