import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

const TOKEN_KEY = '@fittracker_token';

const authHeaders = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const getMarketplaceItems = async () => {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/marketplace/items`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load marketplace');
  return Array.isArray(data) ? { items: data } : data;
};

export const activateMarketplaceItem = async (itemId) => {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/marketplace/activate/${itemId}`, {
    method: 'POST',
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Activation failed');
  return data;
};

export const purchaseItem = async (itemId) => {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/marketplace/purchase/${itemId}`, {
    method: 'POST',
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Purchase failed');
  return data;
};
