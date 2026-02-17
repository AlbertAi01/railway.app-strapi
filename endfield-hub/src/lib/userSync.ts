/**
 * User data synchronization utilities
 * Handles saving/loading user-specific data to Strapi when authenticated,
 * falling back to localStorage when not authenticated.
 */

import api from './api';

export type SyncKey =
  | 'headhuntTracker'
  | 'achievements'
  | 'tierList'
  | 'characterBuilds'
  | 'ascensionPlanner';

interface UserDataPayload {
  Key: SyncKey;
  Data: unknown;
}

/**
 * Save user data. If authenticated, syncs to Strapi; always saves to localStorage.
 */
export async function saveUserData(key: SyncKey, data: unknown, isAuthenticated: boolean): Promise<void> {
  // Always save to localStorage as a cache
  localStorage.setItem(key, JSON.stringify(data));

  if (!isAuthenticated) return;

  try {
    // Try to find existing record for this key
    const { data: response } = await api.get(`/user-data?filters[Key][$eq]=${key}`);
    const existing = response?.data?.[0];

    const payload: UserDataPayload = { Key: key, Data: data };

    if (existing) {
      const id = existing.id || existing.documentId;
      await api.put(`/user-data/${id}`, { data: payload });
    } else {
      await api.post('/user-data', { data: payload });
    }
  } catch (err) {
    // Silently fail cloud sync - data is still in localStorage
    console.warn(`Cloud sync failed for ${key}:`, err);
  }
}

/**
 * Load user data. If authenticated, tries Strapi first, then falls back to localStorage.
 */
export async function loadUserData<T>(key: SyncKey, isAuthenticated: boolean): Promise<T | null> {
  if (isAuthenticated) {
    try {
      const { data: response } = await api.get(`/user-data?filters[Key][$eq]=${key}`);
      const existing = response?.data?.[0];

      if (existing) {
        const cloudData = (existing.attributes || existing).Data;
        // Update localStorage with cloud data
        localStorage.setItem(key, JSON.stringify(cloudData));
        return cloudData as T;
      }
    } catch (err) {
      console.warn(`Cloud load failed for ${key}, using localStorage:`, err);
    }
  }

  // Fall back to localStorage
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved) as T;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Delete user data from cloud and localStorage
 */
export async function deleteUserData(key: SyncKey, isAuthenticated: boolean): Promise<void> {
  localStorage.removeItem(key);

  if (!isAuthenticated) return;

  try {
    const { data: response } = await api.get(`/user-data?filters[Key][$eq]=${key}`);
    const existing = response?.data?.[0];
    if (existing) {
      const id = existing.id || existing.documentId;
      await api.delete(`/user-data/${id}`);
    }
  } catch (err) {
    console.warn(`Cloud delete failed for ${key}:`, err);
  }
}
