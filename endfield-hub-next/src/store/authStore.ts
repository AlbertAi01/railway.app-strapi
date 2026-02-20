'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  provider?: string;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'discord') => void;
  handleProviderCallback: (provider: string, accessToken: string) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || '';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setToken: (token) => {
        set({ token });
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          delete api.defaults.headers.common['Authorization'];
        }
      },

      login: async (identifier, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/local', { identifier, password });
          set({ user: data.user, token: data.jwt, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.jwt}`;
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Login failed';
          set({ error: msg, isLoading: false });
          throw new Error(msg);
        }
      },

      register: async (username, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/local/register', { username, email, password });
          set({ user: data.user, token: data.jwt, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.jwt}`;
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Registration failed';
          set({ error: msg, isLoading: false });
          throw new Error(msg);
        }
      },

      loginWithProvider: (provider) => {
        const redirectUrl = `${window.location.origin}/auth/callback/${provider}`;
        window.location.href = `${STRAPI_URL}/api/connect/${provider}?redirect_uri=${encodeURIComponent(redirectUrl)}`;
      },

      handleProviderCallback: async (provider, accessToken) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get(`/auth/${provider}/callback?access_token=${accessToken}`);
          set({ user: data.user, token: data.jwt, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.jwt}`;
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'OAuth login failed';
          set({ error: msg, isLoading: false });
          throw new Error(msg);
        }
      },

      sendMagicLink: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/auth/send-email-confirmation', { email });
          set({ isLoading: false });
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to send email';
          set({ error: msg, isLoading: false });
          throw new Error(msg);
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null });
        delete api.defaults.headers.common['Authorization'];
      },

      fetchMe: async () => {
        const { token } = get();
        if (!token) return;
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const { data } = await api.get('/users/me');
          set({ user: data });
        } catch {
          set({ user: null, token: null });
          delete api.defaults.headers.common['Authorization'];
        }
      },
    }),
    {
      name: 'endfield-hub-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        // Re-inject the persisted auth token into the axios instance on page load
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);
