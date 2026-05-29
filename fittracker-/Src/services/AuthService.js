import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./config";

const TOKEN_KEY = "@fittracker_token";
const SESSION_KEY = "@fittracker_session";

// Register a new user
export const register = async ({ fullName, email, password, age, weight, height, unit }) => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName, email, password, age, weight, height, unit }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    // Save token and session
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(data));

    return data;
  } catch (error) {
    throw error;
  }
};

// Login
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
     
    }

    // Save token and session
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(data));

    return data;
  } catch (error) {
    throw error;
     console.log(error)
  }
};

// Logout
export const logout = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(SESSION_KEY);
};

// Get current logged-in user session (from storage)
export const getCurrentUser = async () => {
  const data = await AsyncStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

// Get user profile from backend (live data)
export const getProfile = async () => {
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

        // Keep local session aligned with latest authenticated profile
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(data));

        return data;
    } catch (error) {
        console.error("GetProfile Error:", error);
        return null;
    }
};

// Update user profile in backend
export const updateUser = async (updatedFields) => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error("No token found");

    // This would need a PUT route in backend (let's assume it exists or we add it)
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedFields),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    // Update local session
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(data));

    return data;
  } catch (error) {
    throw error;
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  getProfile,
  updateUser,
};
