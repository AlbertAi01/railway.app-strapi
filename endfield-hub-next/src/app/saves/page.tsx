'use client';

import { useState } from 'react';
import { usePersistStore } from '@/store/persistStore';
import RIOSHeader from '@/components/ui/RIOSHeader';
import {
  Building2,
  Clock,
  Star,
  Bookmark,
  Trash2,
  Copy,
  Edit3,
  Grid3x3,
  Calendar,
  TrendingUp,
  Download,
  ThumbsUp,
} from 'lucide-react';
import Link from 'next/link';

export default function MySavesPage() {
  const {
    factoryLayouts,
    deleteFactoryLayout,
    duplicateFactoryLayout,
    updateFactoryLayout,
    blueprintUpvotes,
    recipeBookmarks,
    recentRecipes,
  } = usePersistStore();

  const [editingLayoutId, setEditingLayoutId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [activeTab, setActiveTab] = useState<'layouts' | 'blueprints' | 'recipes'>('layouts');

  const handleRename = (id: string, currentName: string) => {
    setEditingLayoutId(id);
    setEditingName(currentName);
  };

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      updateFactoryLayout(id, { name: editingName.trim() });
    }
    setEditingLayoutId(null);
    setEditingName('');
  };

  const handleCancelRename = () => {
    setEditingLayoutId(null);
    setEditingName('');
  };

  const handleDuplicate = (id: string) => {
    const newId = duplicateFactoryLayout(id);
    if (newId) {
      // Optional: Show success message
      console.log('Layout duplicated:', newId);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteFactoryLayout(id);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const upvotedBlueprintIds = Object.entries(blueprintUpvotes)
    .filter(([_, upvoted]) => upvoted)
    .map(([id]) => parseInt(id));

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-6">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader
          title="My Saves"
          subtitle="Your saved factory layouts, blueprint upvotes, and bookmarked recipes"
          category="USER DATA"
          classification="PERSONAL"
          icon={<Bookmark className="w-8 h-8" />}
        />

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab('layouts')}
            className={`px-6 py-3 font-tactical text-sm uppercase tracking-wide transition-all ${
              activeTab === 'layouts'
                ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            <Building2 className="inline-block w-4 h-4 mr-2 -mt-0.5" />
            Factory Layouts ({factoryLayouts.length})
          </button>
          <button
            onClick={() => setActiveTab('blueprints')}
            className={`px-6 py-3 font-tactical text-sm uppercase tracking-wide transition-all ${
              activeTab === 'blueprints'
                ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            <ThumbsUp className="inline-block w-4 h-4 mr-2 -mt-0.5" />
            Blueprint Upvotes ({upvotedBlueprintIds.length})
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-6 py-3 font-tactical text-sm uppercase tracking-wide transition-all ${
              activeTab === 'recipes'
                ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            <Star className="inline-block w-4 h-4 mr-2 -mt-0.5" />
            Recipes ({recipeBookmarks.length})
          </button>
        </div>

        {/* Factory Layouts Tab */}
        {activeTab === 'layouts' && (
          <div className="space-y-4">
            {factoryLayouts.length === 0 ? (
              <div className="bg-[var(--color-surface)] p-12 text-center clip-corner-br border border-[var(--color-border)]">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-muted)]" />
                <p className="text-[var(--color-text-secondary)] mb-2">No saved factory layouts yet</p>
                <p className="text-[var(--color-text-muted)] text-sm">
                  Create and save your first layout in the{' '}
                  <Link href="/factory-planner/planner" className="text-[var(--color-accent)] hover:underline">
                    Factory Planner
                  </Link>
                </p>
              </div>
            ) : (
              factoryLayouts
                .sort((a, b) => new Date(b.lastModifiedAt).getTime() - new Date(a.lastModifiedAt).getTime())
                .map((layout) => (
                  <div
                    key={layout.id}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-br overflow-hidden hover:border-[var(--color-accent)] transition-colors"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          {editingLayoutId === layout.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="bg-[var(--color-bg)] border border-[var(--color-border)] px-3 py-2 text-white font-tactical text-lg flex-1"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveRename(layout.id);
                                  if (e.key === 'Escape') handleCancelRename();
                                }}
                              />
                              <button
                                onClick={() => handleSaveRename(layout.id)}
                                className="px-4 py-2 bg-[var(--color-accent)] text-black font-tactical text-sm hover:opacity-80"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelRename}
                                className="px-4 py-2 bg-[var(--color-surface-2)] text-white font-tactical text-sm hover:opacity-80"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-tactical text-white uppercase">{layout.name}</h3>
                              <button
                                onClick={() => handleRename(layout.id, layout.name)}
                                className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
                                title="Rename layout"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                          <Building2 className="w-4 h-4 text-[var(--color-accent)]" />
                          <span className="text-sm">{layout.buildings.length} buildings</span>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                          <Grid3x3 className="w-4 h-4 text-[var(--color-accent)]" />
                          <span className="text-sm">{layout.outpostConfig}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                          <Calendar className="w-4 h-4 text-[var(--color-accent)]" />
                          <span className="text-sm">Created {formatDate(layout.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                          <Clock className="w-4 h-4 text-[var(--color-accent)]" />
                          <span className="text-sm">Modified {formatDate(layout.lastModifiedAt)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/factory-planner/planner?loadLayout=${layout.id}`}
                          className="px-4 py-2 bg-[var(--color-accent)] text-black font-tactical text-sm hover:opacity-80 clip-corner-br inline-flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Load in Planner
                        </Link>
                        <button
                          onClick={() => handleDuplicate(layout.id)}
                          className="px-4 py-2 bg-[var(--color-surface-2)] text-white font-tactical text-sm hover:bg-[var(--color-border)] clip-corner-br inline-flex items-center gap-2"
                          title="Duplicate layout"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleDelete(layout.id, layout.name)}
                          className="px-4 py-2 bg-red-900/30 text-red-400 font-tactical text-sm hover:bg-red-900/50 clip-corner-br inline-flex items-center gap-2 ml-auto"
                          title="Delete layout"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* Blueprint Upvotes Tab */}
        {activeTab === 'blueprints' && (
          <div className="space-y-4">
            {upvotedBlueprintIds.length === 0 ? (
              <div className="bg-[var(--color-surface)] p-12 text-center clip-corner-br border border-[var(--color-border)]">
                <ThumbsUp className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-muted)]" />
                <p className="text-[var(--color-text-secondary)] mb-2">No blueprint upvotes yet</p>
                <p className="text-[var(--color-text-muted)] text-sm">
                  Browse{' '}
                  <Link href="/factory-planner/blueprints" className="text-[var(--color-accent)] hover:underline">
                    Community Blueprints
                  </Link>{' '}
                  to upvote your favorites
                </p>
              </div>
            ) : (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-br p-6">
                <h3 className="text-lg font-tactical text-white uppercase mb-4">
                  Upvoted Blueprints ({upvotedBlueprintIds.length})
                </h3>
                <div className="space-y-2">
                  {upvotedBlueprintIds.map((blueprintId) => (
                    <div
                      key={blueprintId}
                      className="flex items-center justify-between py-3 px-4 bg-[var(--color-bg)] border border-[var(--color-border)] clip-corner-br"
                    >
                      <div className="flex items-center gap-3">
                        <ThumbsUp className="w-4 h-4 text-[var(--color-accent)]" />
                        <span className="text-[var(--color-text-secondary)]">Blueprint ID: {blueprintId}</span>
                      </div>
                      <Link
                        href={`/factory-planner/blueprints`}
                        className="text-[var(--color-accent)] hover:underline text-sm font-tactical"
                      >
                        View Blueprint
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div className="space-y-6">
            {/* Bookmarked Recipes */}
            <div>
              <h3 className="text-lg font-tactical text-white uppercase mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-[var(--color-accent)]" />
                Bookmarked Recipes ({recipeBookmarks.length})
              </h3>
              {recipeBookmarks.length === 0 ? (
                <div className="bg-[var(--color-surface)] p-12 text-center clip-corner-br border border-[var(--color-border)]">
                  <Star className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-muted)]" />
                  <p className="text-[var(--color-text-secondary)] mb-2">No bookmarked recipes yet</p>
                  <p className="text-[var(--color-text-muted)] text-sm">
                    Browse{' '}
                    <Link href="/recipes" className="text-[var(--color-accent)] hover:underline">
                      Recipes
                    </Link>{' '}
                    to bookmark your favorites
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {recipeBookmarks.map((recipeId) => (
                    <div
                      key={recipeId}
                      className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-br p-4 hover:border-[var(--color-accent)] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Star className="w-4 h-4 text-[var(--color-accent)] fill-current" />
                          <span className="text-[var(--color-text-secondary)] font-mono text-sm">{recipeId}</span>
                        </div>
                        <Link
                          href={`/recipes`}
                          className="text-[var(--color-accent)] hover:underline text-sm font-tactical"
                        >
                          View Recipe
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Recipes */}
            <div>
              <h3 className="text-lg font-tactical text-white uppercase mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--color-accent)]" />
                Recently Viewed ({recentRecipes.length})
              </h3>
              {recentRecipes.length === 0 ? (
                <div className="bg-[var(--color-surface)] p-8 text-center clip-corner-br border border-[var(--color-border)]">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-[var(--color-text-muted)]" />
                  <p className="text-[var(--color-text-secondary)] text-sm">No recently viewed recipes</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {recentRecipes.map((recent) => (
                    <div
                      key={recent.recipeId}
                      className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-br p-4 hover:border-[var(--color-accent)] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Clock className="w-4 h-4 text-[var(--color-text-muted)]" />
                          <div className="flex-1">
                            <p className="text-[var(--color-text-secondary)] font-mono text-sm">
                              {recent.recipeName}
                            </p>
                            <p className="text-[var(--color-text-muted)] text-xs mt-1">
                              {formatDate(recent.viewedAt)}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/recipes`}
                          className="text-[var(--color-accent)] hover:underline text-sm font-tactical"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
