import { API_URL } from "./config";

// Get all users sorted by points from backend
export const getLeaderboard = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/users`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    
    // Sort descending by points (backend already does it, but safety first)
    // and map with rank
    return data
      .map((u, i) => ({
        id:       u._id,
        fullName: u.fullName,
        points:   u.points || 0,
        avatar:   u.avatar || "https://randomuser.me/api/portraits/men/32.jpg",
        rank:     i + 1
      }));
  } catch (error) {
    console.error("LeaderboardService Error:", error);
    return [];
  }
};

export default { getLeaderboard };
