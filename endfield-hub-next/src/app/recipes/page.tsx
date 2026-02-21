'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, Filter, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { usePersistStore } from '@/store/persistStore';

interface RecipeItem {
  id: string;
  name: string;
  count: number;
}

interface Recipe {
  id: string;
  name: string;
  machine: string;
  machineName: string;
  inputs: RecipeItem[];
  outputs: RecipeItem[];
  craftTime: number;
  power: number;
}

interface Building {
  id: string;
  name: string;
  power: number;
}

interface FactoryData {
  buildings: Record<string, Building>;
  items: Record<string, string>;
  recipes: Recipe[];
}

interface UniqueItem {
  id: string;
  name: string;
  recipeCount: number;
  machines: string[];
  slug: string;
}

const ITEM_ICON_URL = 'https://endfieldtools.dev/assets/images/endfield/itemicon';

function itemIdToSlug(id: string): string {
  return id.replace(/^item_/, '');
}

export default function RecipesPage() {
  const [factoryData, setFactoryData] = useState<FactoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');

  // Recent recipes and bookmarks from persist store
  const { recentRecipes, recipeBookmarks } = usePersistStore();

  useEffect(() => {
    fetch('/data/factory-recipes.json')
      .then(r => r.json())
      .then((data: FactoryData) => {
        setFactoryData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Build unique items list (items that can be produced)
  const uniqueItems = useMemo(() => {
    if (!factoryData) return [];
    const itemMap = new Map<string, UniqueItem>();

    for (const recipe of factoryData.recipes) {
      for (const output of recipe.outputs) {
        const existing = itemMap.get(output.id);
        if (existing) {
          existing.recipeCount++;
          if (!existing.machines.includes(recipe.machineName)) {
            existing.machines.push(recipe.machineName);
          }
        } else {
          itemMap.set(output.id, {
            id: output.id,
            name: output.name,
            recipeCount: 1,
            machines: [recipe.machineName],
            slug: itemIdToSlug(output.id),
          });
        }
      }
    }

    return Array.from(itemMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [factoryData]);

  const buildings = useMemo(() => {
    if (!factoryData) return [];
    return Object.values(factoryData.buildings).sort((a, b) => a.name.localeCompare(b.name));
  }, [factoryData]);

  const filteredItems = useMemo(() => {
    let items = uniqueItems;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q));
    }
    if (buildingFilter !== 'all') {
      items = items.filter(i => i.machines.includes(buildingFilter));
    }
    return items;
  }, [uniqueItems, searchTerm, buildingFilter]);

  if (loading) {
    return (
      <div className="min-h-screen text-[var(--color-text-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="diamond-spinner mx-auto mb-4" />
          <p className="terminal-text">Loading recipe data...</p>
        </div>
      </div>
    );
  }

  if (!factoryData) {
    return (
      <div className="min-h-screen text-[var(--color-text-secondary)] flex items-center justify-center">
        <p className="text-red-400">Failed to load recipe data.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader title="Crafting Protocols" category="LOGISTICS" code="RIOS-REC-001" icon={<BookOpen size={32} />} />
        <div className="mb-8" />

        {/* Search */}
        <div className="mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] w-5 h-5" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl focus:outline-none focus:border-[var(--color-accent)] text-white"
            />
          </div>
        </div>

        {/* Building Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setBuildingFilter('all')}
            className={`px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
              buildingFilter === 'all'
                ? 'bg-[var(--color-accent)] text-black font-bold'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-text-muted)]'
            }`}
          >
            <Filter size={14} /> All
          </button>
          {buildings.map(b => (
            <button
              key={b.id}
              onClick={() => setBuildingFilter(b.name)}
              className={`px-4 py-2 text-sm transition-colors ${
                buildingFilter === b.name
                  ? 'bg-[var(--color-accent)] text-black font-bold'
                  : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-text-muted)]'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>

        {/* Recent Recipes Section */}
        {recentRecipes.length > 0 && (
          <div className="mb-8 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-br p-5">
            <h2 className="text-sm font-tactical uppercase text-[var(--color-accent)] mb-4 flex items-center gap-2">
              <Clock size={16} />
              Recently Viewed
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentRecipes.slice(0, 6).map((recent) => (
                <Link
                  key={recent.recipeId}
                  href={`/factory-planner/recipes/${itemIdToSlug(recent.recipeId)}`}
                  className="flex-shrink-0 bg-[var(--color-bg)] border border-[var(--color-border)] clip-corner-tl p-3 hover:border-[var(--color-accent)] transition-colors min-w-[140px]"
                  title={recent.recipeName}
                >
                  <div className="w-12 h-12 mx-auto mb-2 relative bg-[#0a0a0a] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
                    <Image
                      src={`${ITEM_ICON_URL}/${recent.recipeId}.png`}
                      alt={recent.recipeName}
                      width={48}
                      height={48}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <p className="text-xs text-white font-bold truncate text-center">
                    {recent.recipeName}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bookmarked Recipes Section */}
        {recipeBookmarks.length > 0 && (
          <div className="mb-8 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-br p-5">
            <h2 className="text-sm font-tactical uppercase text-[var(--color-accent)] mb-4 flex items-center gap-2">
              <Star size={16} className="fill-current" />
              Bookmarked Recipes
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recipeBookmarks.slice(0, 6).map((recipeId) => (
                <Link
                  key={recipeId}
                  href={`/factory-planner/recipes/${itemIdToSlug(recipeId)}`}
                  className="flex-shrink-0 bg-[var(--color-bg)] border border-[var(--color-border)] clip-corner-tl p-3 hover:border-[var(--color-accent)] transition-colors min-w-[140px]"
                >
                  <div className="w-12 h-12 mx-auto mb-2 relative bg-[#0a0a0a] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
                    <Image
                      src={`${ITEM_ICON_URL}/${recipeId}.png`}
                      alt={factoryData?.items[recipeId] || recipeId}
                      width={48}
                      height={48}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <p className="text-xs text-white font-bold truncate text-center">
                    {factoryData?.items[recipeId] || recipeId}
                  </p>
                </Link>
              ))}
            </div>
            {recipeBookmarks.length > 6 && (
              <Link href="/saves" className="text-xs text-[var(--color-accent)] hover:underline mt-3 inline-block">
                View all {recipeBookmarks.length} bookmarks →
              </Link>
            )}
          </div>
        )}

        {/* Item Count */}
        <p className="text-base text-[var(--color-text-muted)] mb-6">{filteredItems.length} Items</p>

        {/* Item Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredItems.map(item => (
            <Link
              key={item.id}
              href={`/factory-planner/recipes/${item.slug}`}
              className="group bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 flex items-center gap-3 hover:border-[var(--color-accent)] transition-colors shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 shrink-0 relative bg-[#0a0a0a] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
                <Image
                  src={`${ITEM_ICON_URL}/${item.id}.png`}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white font-bold truncate group-hover:text-[var(--color-accent)] transition-colors">
                  {item.name}
                </p>
                {item.recipeCount > 1 && (
                  <p className="text-[11px] text-[var(--color-accent)] mt-0.5">
                    {item.recipeCount} recipes
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-muted)]">
            <p className="text-base">No items found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
