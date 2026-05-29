import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./config";
import { getCurrentUser, updateUser } from "./AuthService";
import { resolveHunterClass, resolveRankByLevel, getAvatarTier } from "./SystemService";

const TOKEN_KEY = "@fittracker_token";

// ── Initialize Performance Metrics (from backend) ─────────────────────────
export const initPerformanceMetrics = async () => {
    const user = await getCurrentUser();
    return user || null;
};

// ── Retrieve Performance Metrics (from backend) ───────────────────────────
export const getPerformanceMetrics = async () => {
    try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (!token) return null;

        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        // ── Streak Expiry Check ────────────────────────────────────────────────
        // Note: Ideally this should be backend logic, but we keep it here for now
        // to match previous behavior while syncing with DB.
        if (data.lastCompletionDate) {
            const today = new Date().toISOString().split("T")[0];
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yd = yesterday.toISOString().split("T")[0];

            if (data.lastCompletionDate !== today && data.lastCompletionDate !== yd) {
                if (data.dayStreak !== 0) {
                    return await updateUser({ dayStreak: 0 });
                }
            }
        }

        return data;
    } catch (error) {
        console.error("Error fetching performance metrics:", error);
        return await getCurrentUser();
    }
};

// ── Update Performance Metrics (via backend) ─────────────────────────────
export const updatePerformanceMetrics = async (updates) => {
    try {
        return await updateUser(updates);
    } catch (error) {
        console.error("Error updating performance metrics:", error);
        return await getCurrentUser();
    }
};

// ── Update Stats From Quiz ─────────────────────────────────────────────────
export const updateStatsFromQuiz = async (results, testId = null) => {
    try {
        const user = await getPerformanceMetrics();
        if (!user) return null;

        // Skip if test already done
        if (testId && user.completedTests?.includes(testId)) {
            return user;
        }

        let updatedStats = { ...user.stats };

        if (results && Array.isArray(results)) {
            results.forEach(result => {
                const statName = result.statType || result.stat;
                if (statName && updatedStats[statName] !== undefined) {
                    updatedStats[statName] += result.isCorrect ? 2 : 1;
                }
            });
        }

        let completedTests = user.completedTests || [];
        if (testId && !completedTests.includes(testId)) {
            completedTests.push(testId);
        }

        return await updateUser({ stats: updatedStats, completedTests });
    } catch (error) {
        console.error("Error updating stats from quiz:", error);
        return await getCurrentUser();
    }
};

// ── Check Level Up ─────────────────────────────────────────────────────────
export const checkLevelUp = async () => {
    try {
        const user = await getPerformanceMetrics();
        if (!user) return null;

        const streak = user.dayStreak || 0;
        let newLevel = user.performanceLevel || 1;

        if (streak >= 150) newLevel = Math.max(newLevel, 10);
        else if (streak >= 120) newLevel = Math.max(newLevel, 9);
        else if (streak >= 90) newLevel = Math.max(newLevel, 8);
        else if (streak >= 60) newLevel = Math.max(newLevel, 7);
        else if (streak >= 45) newLevel = Math.max(newLevel, 6);
        else if (streak >= 30) newLevel = Math.max(newLevel, 5);
        else if (streak >= 21) newLevel = Math.max(newLevel, 4);
        else if (streak >= 14) newLevel = Math.max(newLevel, 3);
        else if (streak >= 7) newLevel = Math.max(newLevel, 2);

        if (newLevel > user.performanceLevel) {
            const updated = await updateUser({ performanceLevel: newLevel });
            
            if (newLevel >= 10 && (!updated.classType || updated.classType === 'Novice')) {
                return await assignClass();
            }
            return updated;
        }
        return user;
    } catch (error) {
        return await getCurrentUser();
    }
};

// ── Assign Class ───────────────────────────────────────────────────────────
export const assignClass = async () => {
    try {
        const user = await getPerformanceMetrics();
        if (!user || (user.classType && user.classType !== 'Novice')) return user;

        const joinedCategories = (user.joinedCourses || []).map((c) => c.workoutType).filter(Boolean);
        const completedChallenges = (user.completedChallenges || []).length;
        return await updateUser({
          classType: resolveHunterClass({ level: user.performanceLevel, joinedCategories, completedChallenges }),
          rank: resolveRankByLevel(user.performanceLevel),
          avatarTier: getAvatarTier(user.performanceLevel),
        });
    } catch (error) {
        return await getCurrentUser();
    }
};

// ── Update Daily Streak ──────────────────────────────────────────────────
export const updateDailyStreak = async () => {
    try {
        const user = await getPerformanceMetrics();
        if (!user) return null;

        const today = new Date().toISOString().split("T")[0];
        const lastDate = user.lastCompletionDate;

        if (lastDate === today) return user;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yd = yesterday.toISOString().split("T")[0];

        let newStreak = (user.dayStreak || 0) + (lastDate === yd ? 1 : 1); 
        // Reset to 1 if lastDate wasn't yesterday, else increment. 
        // Wait, the logic above is: if lastDate === yd -> newStreak += 1; else newStreak = 1;
        newStreak = lastDate === yd ? (user.dayStreak || 0) + 1 : 1;

        await updateUser({
            dayStreak: newStreak,
            lastCompletionDate: today
        });

        return await checkLevelUp();
    } catch (error) {
        return await getCurrentUser();
    }
};

// ── Gain XP ───────────────────────────────────────────────────────────────
export const gainXP = async (amount) => {
    try {
        const user = await getPerformanceMetrics();
        if (!user) return null;

        let newXP = (user.xp || 0) + amount;
        let newLevel = user.performanceLevel || 1;

        while (newXP >= 100) {
            newXP -= 100;
            newLevel += 1;
        }

        const updated = await updateUser({
            xp: newXP,
            performanceLevel: newLevel,
            rank: resolveRankByLevel(newLevel),
            avatarTier: getAvatarTier(newLevel),
        });

        if (newLevel >= 10 && (!updated.classType || updated.classType === 'Novice')) {
            return await assignClass();
        }

        return updated;
    } catch (error) {
        return await getCurrentUser();
    }
};

export default {
    initPerformanceMetrics,
    getPerformanceMetrics,
    updatePerformanceMetrics,
    updateStatsFromQuiz,
    checkLevelUp,
    assignClass,
    updateDailyStreak,
    gainXP,
};
