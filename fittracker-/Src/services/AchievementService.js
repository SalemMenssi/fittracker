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
