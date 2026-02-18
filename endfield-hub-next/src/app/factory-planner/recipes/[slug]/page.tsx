'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, ChevronDown, ChevronRight, Clock, Zap, ArrowRight,
  Package, Factory, Settings,
} from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';

// ─── Types ──────────────────────────────────────────────────────────
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

// Production chain tree node
interface ChainNode {
  recipe: Recipe;
  outputItem: RecipeItem;
  children: ChainNode[];
  depth: number;
}

const ITEM_ICON_URL = 'https://endfieldtools.dev/assets/images/endfield/itemicon';

const BUILDING_COLORS: Record<string, string> = {
  furnance_1: '#FF6B35',
  grinder_1: '#E74C3C',
  shaper_1: '#9B59B6',
  thickener_1: '#3498DB',
  winder_1: '#2ECC71',
  filling_powder_mc_1: '#F39C12',
  component_mc_1: '#1ABC9C',
  tools_assebling_mc_1: '#E67E22',
  seedcollector_1: '#27AE60',
  planter_1: '#66BB6A',
  mix_pool_1: '#00BCD4',
  dismantler_1: '#95A5A6',
  xiranite_oven_1: '#FF5722',
};

function slugToItemId(slug: string): string {
  return `item_${slug}`;
}

// Build a recipe lookup: for each item, pick the simplest recipe
// (prefer recipes whose inputs are raw materials)
function pickBestRecipe(itemId: string, recipes: Recipe[], recipesForItem: Map<string, Recipe[]>): Recipe | null {
  const candidates = recipesForItem.get(itemId);
  if (!candidates || candidates.length === 0) return null;

  // Prefer recipes whose inputs are raw materials (no recipe to produce them)
  const rawPreferred = candidates.filter(r =>
    r.inputs.every(inp => !recipesForItem.has(inp.id) || recipesForItem.get(inp.id)!.length === 0)
  );
  if (rawPreferred.length > 0) return rawPreferred[0];

  return candidates[0];
}

// Build a tree of production steps required to make an item
// For intermediate items, picks only the best recipe (not all alternatives)
function buildProductionTree(
  itemId: string,
  recipes: Recipe[],
  recipesForItem: Map<string, Recipe[]>,
  depth: number,
  visited: Set<string>,
): ChainNode | null {
  if (depth > 10 || visited.has(itemId)) return null;

  const recipe = pickBestRecipe(itemId, recipes, recipesForItem);
  if (!recipe) return null;

  const outputItem = recipe.outputs.find(o => o.id === itemId);
  if (!outputItem) return null;

  const newVisited = new Set(visited);
  newVisited.add(itemId);

  const children: ChainNode[] = [];
  for (const input of recipe.inputs) {
    const child = buildProductionTree(input.id, recipes, recipesForItem, depth + 1, newVisited);
    if (child) children.push(child);
  }

  return { recipe, outputItem, children, depth };
}

// Count total steps in tree
function countSteps(nodes: ChainNode[]): number {
  let count = nodes.length;
  for (const node of nodes) {
    count += countSteps(node.children);
  }
  return count;
}

// ─── Production Chain Node Component ─────────────────────────────────
function ChainNodeView({ node, isLast }: { node: ChainNode; isLast: boolean }) {
  const [expanded, setExpanded] = useState(true);
  const color = BUILDING_COLORS[node.recipe.machine] || 'var(--color-accent)';
  const cyclesPerMin = 60 / node.recipe.craftTime;
  const maxOutputPerMin = node.outputItem.count * cyclesPerMin;
  const hasChildren = node.children.length > 0;

  return (
    <div className="relative">
      {/* Connector line from parent */}
      {node.depth > 0 && (
        <div className="absolute -left-6 top-0 h-5 w-6">
          <div className="absolute left-0 top-0 h-full w-px bg-[var(--color-border)]" />
          <div className="absolute left-0 top-5 w-6 h-px bg-[var(--color-border)]" />
        </div>
      )}

      {/* Continuation line for siblings below */}
      {node.depth > 0 && !isLast && (
        <div className="absolute -left-6 top-5 bottom-0 w-px bg-[var(--color-border)]" />
      )}

      {/* Recipe card */}
      <div
        className="bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden mb-2 hover:border-[var(--color-accent)]/40 transition-colors"
        style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left p-3 flex items-center gap-2"
        >
          {/* Expand/collapse toggle */}
          {hasChildren ? (
            expanded
              ? <ChevronDown size={14} className="text-[var(--color-accent)] shrink-0" />
              : <ChevronRight size={14} className="text-[var(--color-text-tertiary)] shrink-0" />
          ) : (
            <div className="w-3.5 shrink-0" />
          )}

          {/* Machine badge */}
          <span
            className="text-[10px] font-bold px-2 py-0.5 text-black shrink-0"
            style={{ backgroundColor: color }}
          >
            {node.recipe.machineName}
          </span>

          {/* Inputs -> Output */}
          <div className="flex items-center gap-1.5 text-[11px] flex-wrap min-w-0 flex-1">
            <div className="flex items-center gap-1 flex-wrap">
              {node.recipe.inputs.map((inp, i) => (
                <span key={i} className="flex items-center gap-0.5">
                  {i > 0 && <span className="text-[var(--color-border)]">+</span>}
                  <Image
                    src={`${ITEM_ICON_URL}/${inp.id}.png`}
                    alt={inp.name}
                    width={16}
                    height={16}
                    className="inline-block"
                    unoptimized
                  />
                  <span className="text-[var(--color-text-secondary)]">{inp.name}</span>
                  <span className="text-white font-mono">x{inp.count}</span>
                </span>
              ))}
            </div>
            <ArrowRight size={12} className="text-[var(--color-accent)] shrink-0" />
            <div className="flex items-center gap-1">
              {node.recipe.outputs.map((out, i) => (
                <span key={i} className="flex items-center gap-0.5">
                  {i > 0 && <span className="text-[var(--color-border)]">+</span>}
                  <Image
                    src={`${ITEM_ICON_URL}/${out.id}.png`}
                    alt={out.name}
                    width={16}
                    height={16}
                    className="inline-block"
                    unoptimized
                  />
                  <span className="text-[var(--color-accent)] font-bold">{out.name}</span>
                  <span className="text-[var(--color-accent)] font-mono">x{out.count}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 shrink-0 text-[10px] text-[var(--color-text-tertiary)]">
            <span className="flex items-center gap-0.5"><Clock size={9} /> {node.recipe.craftTime}s</span>
            <span className="flex items-center gap-0.5"><Zap size={9} /> {node.recipe.power}W</span>
            <span className="text-[var(--color-accent)] font-mono">{maxOutputPerMin.toFixed(1)}/min</span>
          </div>
        </button>
      </div>

      {/* Children (sub-recipes for inputs) */}
      {expanded && hasChildren && (
        <div className="ml-6 relative">
          {node.children.map((child, i) => (
            <ChainNodeView
              key={`${child.recipe.id}-${child.outputItem.id}-${i}`}
              node={child}
              isLast={i === node.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function RecipeDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const itemId = slugToItemId(slug);

  const [factoryData, setFactoryData] = useState<FactoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedRecipeIdx, setExpandedRecipeIdx] = useState<number | null>(0);

  useEffect(() => {
    fetch('/data/factory-recipes.json')
      .then(r => r.json())
      .then((data: FactoryData) => {
        setFactoryData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Find recipes that produce this item
  const itemRecipes = useMemo(() => {
    if (!factoryData) return [];
    return factoryData.recipes.filter(r =>
      r.outputs.some(o => o.id === itemId)
    );
  }, [factoryData, itemId]);

  const itemName = useMemo(() => {
    if (!factoryData) return slug;
    return factoryData.items[itemId] || slug;
  }, [factoryData, itemId, slug]);

  // Build recipe lookup map: itemId -> Recipe[]
  const recipesForItem = useMemo(() => {
    if (!factoryData) return new Map<string, Recipe[]>();
    const map = new Map<string, Recipe[]>();
    for (const r of factoryData.recipes) {
      for (const o of r.outputs) {
        const existing = map.get(o.id);
        if (existing) existing.push(r);
        else map.set(o.id, [r]);
      }
    }
    return map;
  }, [factoryData]);

  // Build production chains for each recipe
  const productionChains = useMemo(() => {
    if (!factoryData || itemRecipes.length === 0) return [];

    return itemRecipes.map(recipe => {
      const outputItem = recipe.outputs.find(o => o.id === itemId)!;
      const visited = new Set<string>([itemId]);

      const children: ChainNode[] = [];
      for (const input of recipe.inputs) {
        const child = buildProductionTree(input.id, factoryData.recipes, recipesForItem, 1, visited);
        if (child) children.push(child);
      }

      const rootNode: ChainNode = { recipe, outputItem, children, depth: 0 };
      const steps = countSteps([rootNode]);
      const cyclesPerMin = 60 / recipe.craftTime;
      const maxPerMin = outputItem.count * cyclesPerMin;

      return { rootNode, steps, maxPerMin, recipe };
    });
  }, [factoryData, itemRecipes, itemId, recipesForItem]);

  // Raw materials for each chain (items with no recipe to produce them)
  const getRawMaterials = useMemo(() => {
    if (!factoryData) return () => [];
    return (node: ChainNode): { id: string; name: string }[] => {
      const raw: Map<string, string> = new Map();
      const collect = (n: ChainNode) => {
        for (const inp of n.recipe.inputs) {
          if (!recipesForItem.has(inp.id)) {
            raw.set(inp.id, inp.name);
          }
        }
        for (const child of n.children) {
          collect(child);
        }
      };
      collect(node);
      return Array.from(raw.entries()).map(([id, name]) => ({ id, name }));
    };
  }, [factoryData, recipesForItem]);

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

  if (!factoryData || itemRecipes.length === 0) {
    return (
      <div className="min-h-screen text-[var(--color-text-secondary)]">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline mb-6"
          >
            <ArrowLeft size={14} /> Back to Recipes
          </Link>
          <div className="text-center py-12">
            <Package size={48} className="mx-auto mb-4 text-[var(--color-border)]" />
            <p className="text-[var(--color-text-tertiary)]">
              {factoryData ? `No recipes found for "${slug}"` : 'Failed to load recipe data.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        {/* Back link */}
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline mb-4"
        >
          <ArrowLeft size={14} /> Back to Recipes
        </Link>

        <RIOSHeader title="Crafting Protocols" category="LOGISTICS" code="RIOS-REC-001" icon={<Package size={28} />} />
        <div className="mb-6" />

        {/* Item Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 relative bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
            <Image
              src={`${ITEM_ICON_URL}/${itemId}.png`}
              alt={itemName}
              width={80}
              height={80}
              className="object-contain"
              unoptimized
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{itemName}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)]">
                <Settings size={14} className="text-[var(--color-accent)]" />
                {itemRecipes.length} recipe{itemRecipes.length > 1 ? 's' : ''}
              </span>
              {productionChains.length > 0 && (
                <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)]">
                  <Zap size={14} className="text-[var(--color-accent)]" />
                  Max: {productionChains[0].maxPerMin.toFixed(1)}/min
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Popular Community Blueprints - placeholder for community builds */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Factory size={18} className="text-[var(--color-accent)]" />
              Popular Community Blueprints
            </h2>
            <Link
              href="/builds"
              className="text-xs text-[var(--color-accent)] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6 text-center">
            <p className="text-sm text-[var(--color-text-tertiary)]">
              No community blueprints tagged with {itemName} yet.
            </p>
            <Link
              href="/builds"
              className="inline-block mt-2 text-xs text-[var(--color-accent)] hover:underline"
            >
              Browse all community builds
            </Link>
          </div>
        </div>

        {/* Production Chain */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Settings size={18} className="text-[var(--color-accent)]" />
            Production Chain
          </h2>

          <div className="space-y-3">
            {productionChains.map((chain, idx) => {
              const isExpanded = expandedRecipeIdx === idx;
              const color = BUILDING_COLORS[chain.recipe.machine] || 'var(--color-accent)';
              const rawMats = getRawMaterials(chain.rootNode);

              return (
                <div key={chain.recipe.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
                  {/* Recipe header */}
                  <button
                    onClick={() => setExpandedRecipeIdx(isExpanded ? null : idx)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    {isExpanded
                      ? <ChevronDown size={16} className="text-[var(--color-accent)] shrink-0" />
                      : <ChevronRight size={16} className="text-[var(--color-text-tertiary)] shrink-0" />}

                    <span className="text-sm font-bold text-[var(--color-accent)]">
                      Recipe {idx + 1}
                    </span>
                    <span className="text-sm text-white">
                      — {chain.recipe.name}
                    </span>

                    <div className="flex items-center gap-3 ml-auto shrink-0 text-xs text-[var(--color-text-tertiary)]">
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold text-black"
                        style={{ backgroundColor: color }}
                      >
                        {chain.recipe.machineName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap size={10} /> {chain.maxPerMin.toFixed(1)}/min
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {chain.recipe.craftTime}s
                      </span>
                      <span className="text-[var(--color-text-tertiary)]">
                        {chain.steps} step{chain.steps > 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>

                  {/* Expanded tree */}
                  {isExpanded && (
                    <div className="border-t border-[var(--color-border)] p-4">
                      {/* Raw materials info */}
                      {rawMats.length > 0 && (
                        <div className="mb-4 p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                          <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
                            Raw Materials Required
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {rawMats.map(mat => (
                              <span
                                key={mat.id}
                                className="flex items-center gap-1.5 px-2 py-1 bg-[#0a0a0a] border border-[var(--color-border)] text-xs"
                              >
                                <Image
                                  src={`${ITEM_ICON_URL}/${mat.id}.png`}
                                  alt={mat.name}
                                  width={16}
                                  height={16}
                                  className="inline-block"
                                  unoptimized
                                />
                                <span className="text-white">{mat.name}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Production tree */}
                      <ChainNodeView node={chain.rootNode} isLast={true} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick recipe summary */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Package size={18} className="text-[var(--color-accent)]" />
            Recipe Details
          </h2>

          <div className="grid gap-3 md:grid-cols-2">
            {itemRecipes.map(recipe => {
              const color = BUILDING_COLORS[recipe.machine] || 'var(--color-accent)';
              const cyclesPerMin = 60 / recipe.craftTime;

              return (
                <div
                  key={recipe.id}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden"
                  style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 text-black"
                        style={{ backgroundColor: color }}
                      >
                        {recipe.machineName}
                      </span>
                      <span className="text-sm text-white font-bold">{recipe.name}</span>
                    </div>

                    {/* Inputs */}
                    <div className="mb-3">
                      <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1.5">
                        Inputs
                      </p>
                      <div className="space-y-1.5">
                        {recipe.inputs.map((inp, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <Image
                              src={`${ITEM_ICON_URL}/${inp.id}.png`}
                              alt={inp.name}
                              width={20}
                              height={20}
                              className="inline-block"
                              unoptimized
                            />
                            <span className="text-white flex-1">{inp.name}</span>
                            <span className="text-[var(--color-text-tertiary)] font-mono">
                              x{inp.count}
                            </span>
                            <span className="text-[10px] text-[var(--color-text-tertiary)]">
                              ({(inp.count * cyclesPerMin).toFixed(1)}/min)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Outputs */}
                    <div className="mb-3">
                      <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1.5">
                        Outputs
                      </p>
                      <div className="space-y-1.5">
                        {recipe.outputs.map((out, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <Image
                              src={`${ITEM_ICON_URL}/${out.id}.png`}
                              alt={out.name}
                              width={20}
                              height={20}
                              className="inline-block"
                              unoptimized
                            />
                            <span className="text-[var(--color-accent)] flex-1 font-bold">{out.name}</span>
                            <span className="text-[var(--color-accent)] font-mono font-bold">
                              x{out.count}
                            </span>
                            <span className="text-[10px] text-[var(--color-accent)]/70">
                              ({(out.count * cyclesPerMin).toFixed(1)}/min)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-[10px] text-[var(--color-text-tertiary)] pt-2 border-t border-[var(--color-border)]">
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {recipe.craftTime}s / cycle
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap size={10} /> {recipe.power}W
                      </span>
                      <span>
                        {cyclesPerMin.toFixed(1)} cycles/min
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
