import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';
import { INTELLIGENCE_KEYS } from '../data/intelligenceConstants';

const TOKEN_KEY = '@fittracker_token';

const authHeaders = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const getIntelligenceProfile = async () => {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/intelligence/profile`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load profile');
  return data;
};

export const updateIntelligenceProfile = async (payload) => {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/intelligence/profile`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update profile');
  return data;
};

export const getWeakestIntelligence = (stats = {}) => {
  return INTELLIGENCE_KEYS
    .map((key) => ({ key, value: stats[key] ?? 1 }))
    .sort((a, b) => a.value - b.value)[0]?.key;
};

export const getStrongestIntelligence = (stats = {}) => {
  return INTELLIGENCE_KEYS
    .map((key) => ({ key, value: stats[key] ?? 1 }))
    .sort((a, b) => b.value - a.value)[0]?.key;
};

export const buildUserQuestProfile = (user) => ({
  fullName: user?.fullName,
  level: user?.performanceLevel || 1,
  xp: user?.xp || 0,
  rank: user?.rank,
  classType: user?.classType,
  coreStats: user?.coreStats || {},
  intelligenceStats: user?.intelligenceStats || {},
  fitnessGoal: user?.fitnessGoal || '',
  mentalGoal: user?.mentalGoal || '',
  selectedDevelopmentFocus: user?.selectedDevelopmentFocus || [],
  availableEquipment: user?.availableEquipment || [],
  availableDailyTime: user?.availableDailyTime || 30,
  preferredQuestTypes: user?.preferredQuestTypes || ['mixed'],
  dayStreak: user?.dayStreak || 0,
  weakIntelligenceAreas: INTELLIGENCE_KEYS
    .map((k) => ({ k, v: user?.intelligenceStats?.[k] ?? 1 }))
    .sort((a, b) => a.v - b.v)
    .slice(0, 3)
    .map((x) => x.k),
  strongestIntelligenceAreas: INTELLIGENCE_KEYS
    .map((k) => ({ k, v: user?.intelligenceStats?.[k] ?? 1 }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 3)
    .map((x) => x.k),
});
