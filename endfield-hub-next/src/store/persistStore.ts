'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { syncToCloud, loadFromCloud } from '@/lib/userSync';

// ──── Types ────

export interface FactoryLayout {
  id: string;
  name: string;
  buildings: Array<{
    buildingId: string;
    x: number;
    y: number;
    rotation: number;
  }>;
  outpostConfig: string;
  createdAt: string;
  lastModifiedAt: string;
  gridWidth?: number;
  gridHeight?: number;
}

export interface RecentRecipe {
  recipeId: string;
  recipeName: string;
  viewedAt: string;
}

// ──── Store State ────

interface PersistState {
  // Factory layouts (multiple saved layouts)
  factoryLayouts: FactoryLayout[];

  // Blueprint upvotes (per blueprint ID)
  blueprintUpvotes: Record<number, boolean>;

  // Blueprint comments (per blueprint slug)
  blueprintComments: Record<string, string[]>;

  // Recipe bookmarks (favorite recipes list)
  recipeBookmarks: string[];

  // Recently viewed recipes (last 10)
  recentRecipes: RecentRecipe[];

  // Actions for factory layouts
  saveFactoryLayout: (layout: Omit<FactoryLayout, 'id' | 'createdAt' | 'lastModifiedAt'>) => string;
  updateFactoryLayout: (id: string, updates: Partial<Omit<FactoryLayout, 'id' | 'createdAt'>>) => void;
  deleteFactoryLayout: (id: string) => void;
  duplicateFactoryLayout: (id: string) => string | null;
  getFactoryLayout: (id: string) => FactoryLayout | null;

  // Actions for blueprint upvotes
  toggleBlueprintUpvote: (blueprintId: number) => boolean;
  isBlueprintUpvoted: (blueprintId: number) => boolean;

  // Actions for blueprint comments
  addBlueprintComment: (slug: string, comment: string) => void;
  getBlueprintComments: (slug: string) => string[];

  // Actions for recipe bookmarks
  toggleRecipeBookmark: (recipeId: string) => boolean;
  isRecipeBookmarked: (recipeId: string) => boolean;

  // Actions for recent recipes
  addRecentRecipe: (recipeId: string, recipeName: string) => void;

  // Cloud sync
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
}

// ──── Store Implementation ────

export const usePersistStore = create<PersistState>()(
  persist(
    (set, get) => ({
      // Initial state
      factoryLayouts: [],
      blueprintUpvotes: {},
      blueprintComments: {},
      recipeBookmarks: [],
      recentRecipes: [],

      // Factory layout actions
      saveFactoryLayout: (layout) => {
        const id = `layout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        const newLayout: FactoryLayout = {
          ...layout,
          id,
          createdAt: now,
          lastModifiedAt: now,
        };

        set((state) => ({
          factoryLayouts: [...state.factoryLayouts, newLayout],
        }));

        // Auto-sync to cloud if authenticated
        get().syncToCloud();

        return id;
      },

      updateFactoryLayout: (id, updates) => {
        set((state) => ({
          factoryLayouts: state.factoryLayouts.map((layout) =>
            layout.id === id
              ? { ...layout, ...updates, lastModifiedAt: new Date().toISOString() }
              : layout
          ),
        }));

        // Auto-sync to cloud if authenticated
        get().syncToCloud();
      },

      deleteFactoryLayout: (id) => {
        set((state) => ({
          factoryLayouts: state.factoryLayouts.filter((layout) => layout.id !== id),
        }));

        // Auto-sync to cloud if authenticated
        get().syncToCloud();
      },

      duplicateFactoryLayout: (id) => {
        const state = get();
        const original = state.factoryLayouts.find((l) => l.id === id);
        if (!original) return null;

        const newId = `layout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        const duplicate: FactoryLayout = {
          ...original,
          id: newId,
          name: `${original.name} (Copy)`,
          createdAt: now,
          lastModifiedAt: now,
        };

        set((state) => ({
          factoryLayouts: [...state.factoryLayouts, duplicate],
        }));

        // Auto-sync to cloud if authenticated
        get().syncToCloud();

        return newId;
      },

      getFactoryLayout: (id) => {
        return get().factoryLayouts.find((l) => l.id === id) || null;
      },

      // Blueprint upvote actions
      toggleBlueprintUpvote: (blueprintId) => {
        const state = get();
        const isUpvoted = state.blueprintUpvotes[blueprintId] || false;
        const newUpvotes = { ...state.blueprintUpvotes };

        if (isUpvoted) {
          delete newUpvotes[blueprintId];
        } else {
          newUpvotes[blueprintId] = true;
        }

        set({ blueprintUpvotes: newUpvotes });

        // Auto-sync to cloud if authenticated
        get().syncToCloud();

        return !isUpvoted;
      },

      isBlueprintUpvoted: (blueprintId) => {
        return get().blueprintUpvotes[blueprintId] || false;
      },

      // Blueprint comment actions
      addBlueprintComment: (slug, comment) => {
        set((state) => {
          const existing = state.blueprintComments[slug] || [];
          return {
            blueprintComments: {
              ...state.blueprintComments,
              [slug]: [...existing, comment],
            },
          };
        });

        // Auto-sync to cloud if authenticated
        get().syncToCloud();
      },

      getBlueprintComments: (slug) => {
        return get().blueprintComments[slug] || [];
      },

      // Recipe bookmark actions
      toggleRecipeBookmark: (recipeId) => {
        const state = get();
        const isBookmarked = state.recipeBookmarks.includes(recipeId);

        if (isBookmarked) {
          set({
            recipeBookmarks: state.recipeBookmarks.filter((id) => id !== recipeId),
          });
        } else {
          set({
            recipeBookmarks: [...state.recipeBookmarks, recipeId],
          });
        }

        // Auto-sync to cloud if authenticated
        get().syncToCloud();

        return !isBookmarked;
      },

      isRecipeBookmarked: (recipeId) => {
        return get().recipeBookmarks.includes(recipeId);
      },

      // Recent recipe actions
      addRecentRecipe: (recipeId, recipeName) => {
        set((state) => {
          // Remove if already exists to avoid duplicates
          const filtered = state.recentRecipes.filter((r) => r.recipeId !== recipeId);

          // Add to front, keep only last 10
          const updated = [
            { recipeId, recipeName, viewedAt: new Date().toISOString() },
            ...filtered,
          ].slice(0, 10);

          return { recentRecipes: updated };
        });
      },

      // Cloud sync actions
      syncToCloud: async () => {
        const authState = useAuthStore.getState();
        if (!authState.token) return;

        try {
          const state = get();
          const data = {
            factoryLayouts: state.factoryLayouts,
            blueprintUpvotes: state.blueprintUpvotes,
            blueprintComments: state.blueprintComments,
            recipeBookmarks: state.recipeBookmarks,
            recentRecipes: state.recentRecipes,
          };

          await syncToCloud('factoryPlanner', data, authState.token);
        } catch (error) {
          console.warn('Failed to sync data to cloud:', error);
        }
      },

      loadFromCloud: async () => {
        const authState = useAuthStore.getState();
        if (!authState.token) return;

        try {
          const data = await loadFromCloud('factoryPlanner', authState.token);
          if (data && typeof data === 'object') {
            const cloudData = data as {
              factoryLayouts?: FactoryLayout[];
              blueprintUpvotes?: Record<number, boolean>;
              blueprintComments?: Record<string, string[]>;
              recipeBookmarks?: string[];
              recentRecipes?: RecentRecipe[];
            };

            set({
              factoryLayouts: cloudData.factoryLayouts || [],
              blueprintUpvotes: cloudData.blueprintUpvotes || {},
              blueprintComments: cloudData.blueprintComments || {},
              recipeBookmarks: cloudData.recipeBookmarks || [],
              recentRecipes: cloudData.recentRecipes || [],
            });
          }
        } catch (error) {
          console.warn('Failed to load data from cloud:', error);
        }
      },
    }),
    {
      name: 'endfield-hub-persist',
      partialize: (state) => ({
        factoryLayouts: state.factoryLayouts,
        blueprintUpvotes: state.blueprintUpvotes,
        blueprintComments: state.blueprintComments,
        recipeBookmarks: state.recipeBookmarks,
        recentRecipes: state.recentRecipes,
      }),
    }
  )
);
