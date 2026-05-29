import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./config";

const TOKEN_KEY = "@fittracker_token";

const withAuth = async () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${await AsyncStorage.getItem(TOKEN_KEY)}`,
});

export const getAllChallenges = async () => {
  const response = await fetch(`${API_URL}/challenges`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load challenges");
  return data.map((c) => {
    const expired = new Date(c.expiryDate) < new Date();
    return { ...c, id: c._id, status: c.status === "completed" ? "completed" : (expired ? "expired" : "open") };
  });
};

export const joinChallenge = async (id) => {
  const response = await fetch(`${API_URL}/challenges/${id}/join`, { method: "POST", headers: await withAuth() });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to join challenge");
  return data;
};

export const createChallenge = async (payload) => {
  const response = await fetch(`${API_URL}/challenges`, { method: "POST", headers: await withAuth(), body: JSON.stringify(payload) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create challenge");
  return { ...data, id: data._id };
};

export const updateChallenge = async (id, payload) => {
  const response = await fetch(`${API_URL}/challenges/${id}`, { method: "PUT", headers: await withAuth(), body: JSON.stringify(payload) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update challenge");
  return { ...data, id: data._id };
};

export const deleteChallenge = async (id) => {
  const response = await fetch(`${API_URL}/challenges/${id}`, { method: "DELETE", headers: await withAuth() });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to delete challenge");
  return data;
};
