import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

const TOKEN_KEY = '@fittracker_token';

const headers = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return { Authorization: `Bearer ${token}` };
};

export const getStatHistory = async (statGroup, statType, limit = 30) => {
  const h = await headers();
  const params = new URLSearchParams({ limit: String(limit) });
  if (statGroup) params.set('statGroup', statGroup);
  if (statType) params.set('statType', statType);
  const res = await fetch(`${API_URL}/stats/history?${params}`, { headers: h });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load history');
  return data;
};

export const getStatHistorySummary = async (statGroup = 'intelligence', statType) => {
  const h = await headers();
  const params = new URLSearchParams({ statGroup });
  if (statType) params.set('statType', statType);
  const res = await fetch(`${API_URL}/stats/history/summary?${params}`, { headers: h });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load summary');
  return data;
};
