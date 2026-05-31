import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

const TOKEN_KEY = '@fittracker_token';

const formatPostTime = (date) => {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const asString = (value, fallback = '') => {
  if (value == null) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object' && typeof value.text === 'string') return value.text;
  return fallback;
};

const asUserName = (item) => {
  const fromUserName = asString(item.userName, '');
  if (fromUserName) return fromUserName;
  if (item.user && typeof item.user === 'object') {
    return asString(item.user.fullName, 'User');
  }
  return 'User';
};

const asAvatar = (item) =>
  asString(item.userAvatar, '') ||
  (item.user && typeof item.user === 'object' ? asString(item.user.avatar, '') : '') ||
  'https://randomuser.me/api/portraits/men/32.jpg';

const normalizeLikeIds = (likes = []) =>
  likes.map((like) => {
    if (like == null) return '';
    if (typeof like === 'string') return like;
    if (typeof like === 'object' && like._id) return String(like._id);
    return String(like);
  }).filter(Boolean);

/** Comment subdocs have user + userName + text but no likes/image — skip as feed items */
const looksLikeCommentOnly = (item) =>
  item &&
  typeof item === 'object' &&
  item.text != null &&
  item.user != null &&
  item.userName != null &&
  !Array.isArray(item.likes) &&
  item.image == null &&
  item.comments == null &&
  item.userAvatar == null;

export const normalizePost = (item) => {
  if (!item || typeof item !== 'object') return null;
  if (looksLikeCommentOnly(item)) return null;

  const id = item._id || item.id;
  if (!id) return null;

  const text = asString(item.text, '');
  if (!text) return null;

  return {
    id: String(id),
    name: asUserName(item),
    avatar: asAvatar(item),
    text,
    image: item.image ? asString(item.image, '') : null,
    likes: normalizeLikeIds(item.likes),
    commentCount: Array.isArray(item.comments) ? item.comments.length : Number(item.commentCount) || 0,
    time: formatPostTime(item.date || item.createdAt),
  };
};

export const normalizePosts = (data) => {
  const list = Array.isArray(data) ? data : Array.isArray(data?.posts) ? data.posts : [];
  return list.map(normalizePost).filter(Boolean);
};

export const initPosts = async () => getAllPosts();

export const getAllPosts = async () => {
  try {
    const response = await fetch(`${API_URL}/posts`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return normalizePosts(data);
  } catch (error) {
    console.error('SocialService Error:', error);
    return [];
  }
};

export const addPost = async ({ text, image }) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text, image }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return normalizePost(data) || data;
};

export const toggleLike = async (postId) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_URL}/posts/${postId}/like`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return normalizePost(data) || data;
};

export const addComment = async (postId, text) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_URL}/posts/${postId}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return normalizePost(data) || data;
};

export default { getAllPosts, addPost, toggleLike, addComment, initPosts, normalizePost, normalizePosts };
