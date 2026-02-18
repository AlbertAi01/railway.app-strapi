'use client';

import api from './api';

const SYNC_KEYS = ['headhuntTracker', 'achievements', 'tierList', 'characterBuilds', 'ascensionPlanner', 'essenceSolver', 'mapValleyIV', 'mapWuling'] as const;
type SyncKey = typeof SYNC_KEYS[number];

export async function syncToCloud(key: SyncKey, data: unknown, token: string): Promise<void> {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const existing = await api.get(`/user-data?filters[Key][$eq]=${key}`);
    const items = existing.data?.data;
    if (items && items.length > 0) {
      const id = items[0].id;
      await api.put(`/user-data/${id}`, { data: { Data: data } });
    } else {
      await api.post('/user-data', { data: { Key: key, Data: data } });
    }
  } catch {
    console.warn(`Cloud sync failed for ${key}`);
  }
}

export async function loadFromCloud(key: SyncKey, token: string): Promise<unknown | null> {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const { data } = await api.get(`/user-data?filters[Key][$eq]=${key}`);
    const items = data?.data;
    if (items && items.length > 0) {
      const attrs = items[0].attributes || items[0];
      return attrs.Data;
    }
  } catch {
    console.warn(`Cloud load failed for ${key}`);
  }
  return null;
}

export function saveLocal(key: string, data: unknown): void {
  try {
    localStorage.setItem(`zerosanity-${key}`, JSON.stringify(data));
  } catch { /* silent */ }
}

export function loadLocal(key: string): unknown | null {
  try {
    const raw = localStorage.getItem(`zerosanity-${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
