export const RANKS = ["E-Rank", "D-Rank", "C-Rank", "B-Rank", "A-Rank", "S-Rank"];

export const resolveRankByLevel = (level = 1) => {
  if (level >= 20) return "S-Rank";
  if (level >= 15) return "A-Rank";
  if (level >= 10) return "B-Rank";
  if (level >= 6) return "C-Rank";
  if (level >= 3) return "D-Rank";
  return "E-Rank";
};

export const getAvatarTier = (level = 1) => {
  if (level >= 15) return 4;
  if (level >= 10) return 3;
  if (level >= 5) return 2;
  return 1;
};

export const resolveHunterClass = ({ level = 1, joinedCategories = [], completedChallenges = 0 }) => {
  if (level < 3) return "Shadow Trainee";
  if (joinedCategories.includes("Fitness")) return "Strength Fighter";
  if (joinedCategories.includes("Mental Focus") || joinedCategories.includes("Study")) return "Focus Mage";
  if (joinedCategories.includes("Health")) return "Health Guardian";
  if (joinedCategories.includes("Productivity")) return "Productivity Assassin";
  if (completedChallenges >= 3) return "Discipline Hunter";
  return "Discipline Hunter";
};

export const getExpToLevel = (xp = 0) => ({ current: xp, max: 100 });
