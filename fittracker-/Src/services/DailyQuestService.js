import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';
import { askSystem } from './SystemAIService';
import { buildQuestGenerationPrompt } from './questPromptBuilder';

const TOKEN_KEY = '@fittracker_token';

const authHeaders = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

/** Mongo quests may expose _id or id depending on serialization */
export const resolveQuestId = (quest) => {
  if (!quest) return null;
  const raw = quest._id ?? quest.id;
  if (!raw) return null;
  return typeof raw === 'string' ? raw : String(raw);
};

const fetchClientQuestData = async (userProfile) => {
  if (!userProfile) return null;
  try {
    const prompt = `${buildQuestGenerationPrompt(userProfile)}\n\nGenerate a NEW quest different from previous ones. Variation seed: ${Date.now()}.`;
    const raw = await askSystem(prompt, { raw: true });
    const cleaned = String(raw).replace(/```json|```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (e) {
    console.warn('Client AI quest generation failed, server will generate', e.message);
    return null;
  }
};

export const getTodayQuest = async () => {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/daily-quests/today`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load quest');
  return data;
};

export const generateTodayQuest = async (userProfile) => {
  const headers = await authHeaders();
  const questData = await fetchClientQuestData(userProfile);

  const res = await fetch(`${API_URL}/daily-quests/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(questData ? { questData } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to generate quest');
  return data;
};

export const completeQuestTask = async (questId, taskId, payload = {}) => {
  const headers = await authHeaders();
  const body = typeof payload === 'string' ? { proofText: payload } : payload;
  const id = resolveQuestId({ _id: questId }) || questId;
  const res = await fetch(`${API_URL}/daily-quests/${id}/complete-task/${taskId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to complete task');
  return data;
};

export const completeQuest = async (questId) => {
  const headers = await authHeaders();
  const id = resolveQuestId({ _id: questId }) || questId;
  const res = await fetch(`${API_URL}/daily-quests/${id}/complete`, {
    method: 'POST',
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to complete quest');
  return data;
};

export const regenerateQuest = async (questOrId, userProfile) => {
  const headers = await authHeaders();
  const questData = await fetchClientQuestData(userProfile);
  const body = { force: true, ...(questData ? { questData } : {}) };

  const res = await fetch(`${API_URL}/daily-quests/regenerate-today`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Regenerate failed');
  return data;
};

export const activateQuest = async (questId) => {
  const headers = await authHeaders();
  const id = resolveQuestId(typeof questId === 'object' ? questId : { _id: questId }) || questId;
  const res = await fetch(`${API_URL}/daily-quests/${id}/activate`, {
    method: 'POST',
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to activate');
  return data;
};

export const getQuestHistory = async (limit = 30) => {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/daily-quests/history?limit=${limit}`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load history');
  return data;
};

export const getQuestProgress = (quest) => {
  if (!quest?.tasks?.length) return 0;
  const done = quest.tasks.filter((t) => t.completed).length;
  return Math.round((done / quest.tasks.length) * 100);
};
