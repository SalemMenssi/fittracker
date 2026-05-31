import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

const TOKEN_KEY = '@fittracker_token';

/** Strip debug prefixes from chat replies (not used for raw JSON mode). */
export const formatSystemReply = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/^\[(Fallback|Gemini:[^\]]+)\]\s*/gi, '')
    .replace(/^System:\s*/i, '')
    .trim();
};

export const askSystem = async (prompt, options = {}) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error('Session expired. Please login again.');

  const response = await fetch(`${API_URL}/system/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt, raw: !!options.raw }),
  });

  let data = {};
  try {
    data = await response.json();
  } catch (_) {
    data = {};
  }
  if (!response.ok) {
    throw new Error(data.message || `System request failed (${response.status})`);
  }
  const text = data.text ?? '';
  return options.raw ? text : formatSystemReply(text);
};
