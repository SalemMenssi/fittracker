import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

const TOKEN_KEY = '@fittracker_token';

export const uploadProofImage = async (uri) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error('Not authenticated');

  const formData = new FormData();
  const filename = uri.split('/').pop() || 'proof.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('image', {
    uri,
    name: filename,
    type,
  });

  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data.url || data.path;
};
