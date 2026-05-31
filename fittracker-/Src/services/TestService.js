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

export const completeTest = async ({ testId, testType, results, score }) => {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/tests/complete`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ testId, testType, results, score }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to save test');
  return data;
};
