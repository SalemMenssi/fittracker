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

export const savePushTokenToBackend = async (token) => {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/notifications/register-token`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ token }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to register token');
  return data;
};

export const removePushTokenFromBackend = async (token) => {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/notifications/remove-token`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ token }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to remove token');
  return data;
};

export const getNotificationSettingsFromApi = async () => {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/notifications/settings`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load settings');
  return data.notificationSettings;
};

export const updateNotificationSettingsApi = async (notificationSettings) => {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/notifications/settings`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ notificationSettings }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to save settings');
  return data.notificationSettings;
};

export const sendTestNotificationApi = async () => {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/notifications/test`, {
    method: 'POST',
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Test failed');
  return data;
};
