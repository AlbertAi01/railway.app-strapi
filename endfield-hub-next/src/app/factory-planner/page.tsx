'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Factory, Search, Plus, Trash2, ChevronDown, ChevronRight, Download, Copy,
  AlertCircle, Zap, Clock, ArrowRight, X, Filter, Settings, Package,
  RefreshCw, Info, ChevronUp, Minus, RotateCcw,
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

interface ProductionNode {
  recipe: Recipe;
  machineCount: number;
  itemId: string;            // which output item this node satisfies
  ratePerMin: number;        // items/min actually produced
  depth: number;
  isCycleBreak?: boolean;    // true if this node's input was cut due to cycle
}

interface ProductionTarget {
  itemId: string;
  itemName: string;
  perMinute: number;
  recipeId?: string;         // user-chosen recipe (if multiple exist)
}

interface SolverResult {
  nodes: ProductionNode[];
  rawMaterials: Record<string, number>;  // itemId -> rate/min
  totalPower: number;
  totalMachines: number;
  cycleWarnings: string[];
}

// ─── Building Colors ─────────────────────────────────────────────────
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

// ─── Solver ──────────────────────────────────────────────────────────
function solveProductionChain(
  data: FactoryData,
  targets: ProductionTarget[],
  recipeOverrides: Record<string, string>,
): SolverResult {
  if (targets.length === 0) {
    return { nodes: [], rawMaterials: {}, totalPower: 0, totalMachines: 0, cycleWarnings: [] };
  }

  // Build recipe lookup: itemId -> array of recipes that produce it
  const recipesForItem: Record<string, Recipe[]> = {};
  for (const r of data.recipes) {
    for (const o of r.outputs) {
      if (!recipesForItem[o.id]) recipesForItem[o.id] = [];
      recipesForItem[o.id].push(r);
    }
  }

  // Choose best recipe for an item
  const chooseRecipe = (itemId: string): Recipe | null => {
    const recipes = recipesForItem[itemId];
    if (!recipes || recipes.length === 0) return null;

    // Check user override
    const override = recipeOverrides[itemId];
    if (override) {
      const found = recipes.find(r => r.id === override);
      if (found) return found;
    }

    // Prefer recipes whose inputs are raw materials (no recipe to produce them)
    // This avoids circular paths when possible
    const rawPreferred = recipes.filter(r =>
      r.inputs.every(inp => !recipesForItem[inp.id] || recipesForItem[inp.id].length === 0)
    );
    if (rawPreferred.length > 0) return rawPreferred[0];

    // Otherwise pick the first non-cyclic looking one (simplest inputs)
    return recipes[0];
  };

  // Accumulate node requirements: recipeId+itemId -> rate/min needed
  const nodeAccum: Record<string, { recipe: Recipe; itemId: string; ratePerMin: number; depth: number; isCycleBreak?: boolean }> = {};
  const rawMaterials: Record<string, number> = {};
  const cycleWarnings: string[] = [];

  const solve = (itemId: string, rateNeeded: number, depth: number, ancestors: Set<string>) => {
    const recipe = chooseRecipe(itemId);
    if (!recipe) {
      // Raw material
      rawMaterials[itemId] = (rawMaterials[itemId] || 0) + rateNeeded;
      return;
    }

    // Cycle detection: if this item is already being solved in our ancestor chain
    if (ancestors.has(itemId)) {
      // Break the cycle - treat as raw material
      rawMaterials[itemId] = (rawMaterials[itemId] || 0) + rateNeeded;
      const itemName = data.items[itemId] || itemId;
      const warning = `Self-sustaining loop detected: ${itemName} feeds back into its own production chain`;
      if (!cycleWarnings.includes(warning)) cycleWarnings.push(warning);
      return;
    }

    const output = recipe.outputs.find(o => o.id === itemId);
    if (!output) {
      rawMaterials[itemId] = (rawMaterials[itemId] || 0) + rateNeeded;
      return;
    }

    // Calculate machines: items/min needed / (items per cycle * cycles per min)
    const cyclesPerMin = 60 / recipe.craftTime;
    const outputPerMin = output.count * cyclesPerMin;  // per machine
    const machinesExact = rateNeeded / outputPerMin;

    // Accumulate into existing node or create new
    const key = `${recipe.id}::${itemId}`;
    if (nodeAccum[key]) {
      nodeAccum[key].ratePerMin += rateNeeded;
      nodeAccum[key].depth = Math.max(nodeAccum[key].depth, depth);
    } else {
      nodeAccum[key] = {
        recipe,
        itemId,
        ratePerMin: rateNeeded,
        depth,
      };
    }

    // Recurse into inputs
    const newAncestors = new Set(ancestors);
    newAncestors.add(itemId);

    for (const inp of recipe.inputs) {
      const inputRatePerMachine = inp.count * cyclesPerMin;
      const totalInputRate = inputRatePerMachine * machinesExact;
      solve(inp.id, totalInputRate, depth + 1, newAncestors);
    }
  };

  // Solve each target
  for (const target of targets) {
    solve(target.itemId, target.perMinute, 0, new Set<string>());
  }

  // Convert accumulated nodes to array
  const nodes: ProductionNode[] = Object.values(nodeAccum).map(n => {
    const output = n.recipe.outputs.find(o => o.id === n.itemId);
    const cyclesPerMin = 60 / n.recipe.craftTime;
    const outputPerMin = (output?.count || 1) * cyclesPerMin;
    const machinesExact = n.ratePerMin / outputPerMin;
    return {
      recipe: n.recipe,
      machineCount: Math.ceil(machinesExact * 100) / 100,
      itemId: n.itemId,
      ratePerMin: n.ratePerMin,
      depth: n.depth,
      isCycleBreak: n.isCycleBreak,
    };
  });

  // Sort by depth descending (deepest = raw materials side first)
  nodes.sort((a, b) => b.depth - a.depth || a.recipe.machineName.localeCompare(b.recipe.machineName));

  const totalMachines = nodes.reduce((s, n) => s + Math.ceil(n.machineCount), 0);
  const totalPower = nodes.reduce((s, n) => s + n.recipe.power * Math.ceil(n.machineCount), 0);

  return { nodes, rawMaterials, totalPower, totalMachines, cycleWarnings };
}

// ─── Component ──────────────────────────────────────────────────────
export default function FactoryPlannerPage() {
  const [factoryData, setFactoryData] = useState<FactoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [targets, setTargets] = useState<ProductionTarget[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'planner' | 'recipes'>('planner');
  const [recipeSearch, setRecipeSearch] = useState('');
  const [recipeBuildingFilter, setRecipeBuildingFilter] = useState<string>('all');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [recipeOverrides, setRecipeOverrides] = useState<Record<string, string>>({});
  const [showRecipeSelector, setShowRecipeSelector] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load factory data
  useEffect(() => {
    fetch('/data/factory-recipes.json')
      .then(r => r.json())
      .then((data: FactoryData) => {
        setFactoryData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Load saved state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('zerosanity-factory-v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Migrate old format
          setTargets(parsed.map((t: ProductionTarget) => ({
            itemId: t.itemId,
            itemName: t.itemName,
            perMinute: t.perMinute || (t as unknown as Record<string, number>).countPerMinute || 1,
            recipeId: t.recipeId,
          })));
        }
      }
    } catch { /* ignore */ }

    try {
      const overrides = localStorage.getItem('zerosanity-factory-overrides');
      if (overrides) setRecipeOverrides(JSON.parse(overrides));
    } catch { /* ignore */ }
  }, []);

  // Save state
  const saveState = useCallback((newTargets: ProductionTarget[], newOverrides?: Record<string, string>) => {
    setTargets(newTargets);
    localStorage.setItem('zerosanity-factory-v2', JSON.stringify(newTargets));
    if (newOverrides !== undefined) {
      setRecipeOverrides(newOverrides);
      localStorage.setItem('zerosanity-factory-overrides', JSON.stringify(newOverrides));
    }
  }, []);

  // Solve production chain
  const result = useMemo(() => {
    if (!factoryData) return { nodes: [], rawMaterials: {}, totalPower: 0, totalMachines: 0, cycleWarnings: [] };
    return solveProductionChain(factoryData, targets, recipeOverrides);
  }, [factoryData, targets, recipeOverrides]);

  // Build recipe lookup for alternate recipe selection
  const recipesForItem = useMemo(() => {
    if (!factoryData) return {};
    const map: Record<string, Recipe[]> = {};
    for (const r of factoryData.recipes) {
      for (const o of r.outputs) {
        if (!map[o.id]) map[o.id] = [];
        map[o.id].push(r);
      }
    }
    return map;
  }, [factoryData]);

  // Produceable items for picker
  const produceableItems = useMemo(() => {
    if (!factoryData) return [];
    const items: { id: string; name: string; machine: string; recipeCount: number }[] = [];
    const seen = new Set<string>();
    for (const recipe of factoryData.recipes) {
      for (const output of recipe.outputs) {
        if (!seen.has(output.id)) {
          seen.add(output.id);
          const allRecipes = factoryData.recipes.filter(r => r.outputs.some(o => o.id === output.id));
          items.push({ id: output.id, name: output.name, machine: recipe.machineName, recipeCount: allRecipes.length });
        }
      }
    }
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [factoryData]);

  const filteredItems = useMemo(() => {
    let items = produceableItems;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q));
    }
    if (buildingFilter !== 'all') {
      items = items.filter(i => i.machine === buildingFilter);
    }
    return items;
  }, [produceableItems, searchQuery, buildingFilter]);

  // Recipe browser filtering
  const filteredRecipes = useMemo(() => {
    if (!factoryData) return [];
    let recipes = factoryData.recipes;
    if (recipeSearch) {
      const q = recipeSearch.toLowerCase();
      recipes = recipes.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.machineName.toLowerCase().includes(q) ||
        r.inputs.some(i => i.name.toLowerCase().includes(q)) ||
        r.outputs.some(o => o.name.toLowerCase().includes(q))
      );
    }
    if (recipeBuildingFilter !== 'all') {
      recipes = recipes.filter(r => r.machineName === recipeBuildingFilter);
    }
    return recipes;
  }, [factoryData, recipeSearch, recipeBuildingFilter]);

  const buildings = useMemo(() => {
    if (!factoryData) return [];
    return Object.values(factoryData.buildings).sort((a, b) => a.name.localeCompare(b.name));
  }, [factoryData]);

  // ─── Handlers ─────────────────────────────────────────────────────
  const addTarget = useCallback((itemId: string, itemName: string) => {
    if (targets.some(t => t.itemId === itemId)) return;
    saveState([...targets, { itemId, itemName, perMinute: 1 }]);
    setShowItemPicker(false);
    setSearchQuery('');
  }, [targets, saveState]);

  const removeTarget = useCallback((itemId: string) => {
    saveState(targets.filter(t => t.itemId !== itemId));
  }, [targets, saveState]);

  const updateTargetRate = useCallback((itemId: string, rate: number) => {
    saveState(targets.map(t => t.itemId === itemId ? { ...t, perMinute: Math.max(0.1, rate) } : t));
  }, [targets, saveState]);

  const clearAll = useCallback(() => {
    if (confirm('Clear all production targets?')) {
      saveState([], {});
    }
  }, [saveState]);

  const setRecipeOverride = useCallback((itemId: string, recipeId: string) => {
    const newOverrides = { ...recipeOverrides, [itemId]: recipeId };
    setRecipeOverrides(newOverrides);
    localStorage.setItem('zerosanity-factory-overrides', JSON.stringify(newOverrides));
    setShowRecipeSelector(null);
  }, [recipeOverrides]);

  const exportPlan = useCallback(() => {
    if (!factoryData) return;
    const lines = ['AIC Factory Production Plan', '═'.repeat(40), ''];
    lines.push('Production Targets:');
    targets.forEach(t => lines.push(`  • ${t.itemName}: ${t.perMinute}/min`));
    lines.push('');
    lines.push(`Required Production Lines (${result.nodes.length} recipes, ${result.totalMachines} machines):`);
    result.nodes.forEach(n => {
      const machines = Math.ceil(n.machineCount);
      const inp = n.recipe.inputs.map(i => `${i.name} ×${i.count}`).join(' + ');
      const out = n.recipe.outputs.map(o => `${o.name} ×${o.count}`).join(' + ');
      lines.push(`  [${n.recipe.machineName}] ×${machines} — ${inp} → ${out}`);
    });
    if (Object.keys(result.rawMaterials).length > 0) {
      lines.push('');
      lines.push('Raw Materials Required:');
      Object.entries(result.rawMaterials)
        .sort(([, a], [, b]) => b - a)
        .forEach(([id, rate]) => {
          lines.push(`  • ${factoryData.items[id] || id}: ${rate.toFixed(2)}/min`);
        });
    }
    if (result.cycleWarnings.length > 0) {
      lines.push('');
      lines.push('Cycle Notes:');
      result.cycleWarnings.forEach(w => lines.push(`  ⚠ ${w}`));
    }
    lines.push('');
    lines.push(`Total Power: ${result.totalPower}W`);
    lines.push(`Generated by Zero Sanity — zerosanity.app`);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factory-plan-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [factoryData, targets, result]);

  const copyPlan = useCallback(async () => {
    const lines: string[] = ['AIC Factory Plan'];
    targets.forEach(t => lines.push(`${t.itemName}: ${t.perMinute}/min`));
    lines.push('');
    result.nodes.forEach(n => {
      lines.push(`${n.recipe.machineName} ×${Math.ceil(n.machineCount)}: ${n.recipe.name}`);
    });
    lines.push(`Power: ${result.totalPower}W | Machines: ${result.totalMachines} | zerosanity.app`);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  }, [targets, result]);

  // Focus search on picker open
  useEffect(() => {
    if (showItemPicker && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showItemPicker]);

  // ─── Loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen text-[var(--color-text-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="diamond-spinner mx-auto mb-4" />
          <p className="terminal-text">Loading factory data...</p>
        </div>
      </div>
    );
  }

  if (!factoryData) {
    return (
      <div className="min-h-screen text-[var(--color-text-secondary)] flex items-center justify-center">
        <p className="text-red-400">Failed to load factory data.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader title="AIC Production Planner" category="LOGISTICS" code="RIOS-FAC-001" icon={<Factory size={28} />} />

        <p className="text-sm text-[var(--color-text-tertiary)] mb-4">
          Plan your Automated Industry Complex production chains. Add output targets and the solver calculates required machines, raw materials, and power.
          {factoryData.recipes.length} recipes across {buildings.length} buildings.
        </p>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-4 border-b border-[var(--color-border)]">
          {([
            { id: 'planner' as const, label: 'Production Planner', icon: <Settings size={14} /> },
            { id: 'recipes' as const, label: `Recipe Database (${factoryData.recipes.length})`, icon: <Package size={14} /> },
          ]).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'border-transparent text-[var(--color-text-tertiary)] hover:text-white'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Production Planner Tab ── */}
        {activeTab === 'planner' && (
          <div className="space-y-4">
            {/* Top row: Targets + Summary */}
            <div className="grid lg:grid-cols-[1fr_320px] gap-4">
              {/* Left: Targets */}
              <div className="space-y-4">
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Factory size={14} className="text-[var(--color-accent)]" />
                      Production Targets
                    </h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setShowItemPicker(true); setSearchQuery(''); setBuildingFilter('all'); }}
                        className="px-3 py-1.5 text-xs bg-[var(--color-accent)] text-black font-bold flex items-center gap-1.5 hover:bg-[var(--color-accent-hover)] transition-colors">
                        <Plus size={12} /> Add Target
                      </button>
                      {targets.length > 0 && (
                        <button onClick={clearAll} className="px-2 py-1.5 text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {targets.length === 0 ? (
                    <div className="p-8 text-center">
                      <Factory size={36} className="mx-auto mb-3 text-[var(--color-border)]" />
                      <p className="text-sm text-[var(--color-text-tertiary)]">No production targets set</p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Click &quot;Add Target&quot; to select what you want to produce</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--color-border)]">
                      {targets.map(target => {
                        const altRecipes = recipesForItem[target.itemId] || [];
                        const showingSelector = showRecipeSelector === target.itemId;
                        return (
                          <div key={target.itemId} className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white font-bold truncate">{target.itemName}</p>
                                {altRecipes.length > 1 && (
                                  <button
                                    onClick={() => setShowRecipeSelector(showingSelector ? null : target.itemId)}
                                    className="text-[10px] text-[var(--color-accent)] hover:underline flex items-center gap-0.5 mt-0.5">
                                    <RefreshCw size={8} />
                                    {altRecipes.length} recipes available
                                    {showingSelector ? <ChevronUp size={8} /> : <ChevronDown size={8} />}
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => updateTargetRate(target.itemId, target.perMinute - 0.5)}
                                  className="w-6 h-6 flex items-center justify-center bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-white hover:border-[var(--color-accent)] transition-colors">
                                  <Minus size={10} />
                                </button>
                                <input
                                  type="number"
                                  min="0.1"
                                  step="0.5"
                                  value={target.perMinute}
                                  onChange={e => updateTargetRate(target.itemId, parseFloat(e.target.value) || 0.1)}
                                  className="w-16 px-2 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm text-center font-mono focus:border-[var(--color-accent)] outline-none"
                                />
                                <button onClick={() => updateTargetRate(target.itemId, target.perMinute + 0.5)}
                                  className="w-6 h-6 flex items-center justify-center bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-white hover:border-[var(--color-accent)] transition-colors">
                                  <Plus size={10} />
                                </button>
                                <span className="text-[10px] text-[var(--color-text-tertiary)] w-6">/min</span>
                                <button onClick={() => removeTarget(target.itemId)}
                                  className="w-6 h-6 flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors">
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                            {/* Alternate recipe selector */}
                            {showingSelector && altRecipes.length > 1 && (
                              <div className="mt-2 p-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-1">
                                <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Select Recipe</p>
                                {altRecipes.map(r => {
                                  const isSelected = recipeOverrides[target.itemId] === r.id ||
                                    (!recipeOverrides[target.itemId] && r === altRecipes[0]);
                                  const color = BUILDING_COLORS[r.machine] || 'var(--color-accent)';
                                  return (
                                    <button key={r.id} onClick={() => setRecipeOverride(target.itemId, r.id)}
                                      className={`w-full text-left p-2 text-xs flex items-center gap-2 border transition-colors ${
                                        isSelected
                                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                                          : 'border-transparent hover:border-[var(--color-border)]'
                                      }`}>
                                      <span className="w-2 h-2 shrink-0" style={{ backgroundColor: color }} />
                                      <span className="text-white font-bold">{r.machineName}</span>
                                      <span className="text-[var(--color-text-tertiary)]">
                                        {r.inputs.map(i => i.name).join(' + ')}
                                      </span>
                                      <ArrowRight size={10} className="text-[var(--color-accent)] shrink-0" />
                                      <span className="text-[var(--color-accent)]">
                                        {r.outputs.map(o => `${o.name} ×${o.count}`).join(', ')}
                                      </span>
                                      {isSelected && <span className="ml-auto text-[var(--color-accent)] text-[10px]">ACTIVE</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Item Picker */}
                {showItemPicker && (
                  <div className="bg-[var(--color-surface)] border border-[var(--color-accent)]/50 clip-corner-tl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                      <h3 className="text-sm font-bold text-white">Select Item to Produce</h3>
                      <button onClick={() => { setShowItemPicker(false); setSearchQuery(''); }}
                        className="text-[var(--color-text-tertiary)] hover:text-white transition-colors"><X size={16} /></button>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Search items..."
                          className="w-full pl-8 pr-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm focus:border-[var(--color-accent)] outline-none"
                        />
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        <button onClick={() => setBuildingFilter('all')}
                          className={`px-2 py-0.5 text-[10px] border transition-colors ${buildingFilter === 'all'
                            ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                            : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-white'}`}>
                          All
                        </button>
                        {buildings.map(b => (
                          <button key={b.id} onClick={() => setBuildingFilter(b.name)}
                            className={`px-2 py-0.5 text-[10px] border transition-colors ${buildingFilter === b.name
                              ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                              : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-white'}`}
                            style={{ borderLeftColor: BUILDING_COLORS[b.id] || 'var(--color-border)', borderLeftWidth: '3px' }}>
                            {b.name}
                          </button>
                        ))}
                      </div>
                      <div className="max-h-[300px] overflow-y-auto space-y-0.5">
                        {filteredItems.length === 0 ? (
                          <p className="text-xs text-[var(--color-text-tertiary)] text-center py-4">No items match your search</p>
                        ) : (
                          filteredItems.map(item => {
                            const alreadyAdded = targets.some(t => t.itemId === item.id);
                            return (
                              <button key={item.id} onClick={() => !alreadyAdded && addTarget(item.id, item.name)}
                                disabled={alreadyAdded}
                                className={`w-full text-left px-3 py-2 flex items-center justify-between text-sm transition-colors ${
                                  alreadyAdded
                                    ? 'text-[var(--color-text-tertiary)] opacity-40 cursor-not-allowed'
                                    : 'hover:bg-[var(--color-accent)]/10 text-white'
                                }`}>
                                <span className="truncate">{item.name}</span>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                  {item.recipeCount > 1 && (
                                    <span className="text-[9px] px-1 py-0.5 bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-mono">
                                      {item.recipeCount} recipes
                                    </span>
                                  )}
                                  <span className="text-[10px] text-[var(--color-text-tertiary)]">{item.machine}</span>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Summary */}
              <div className="space-y-4">
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4">
                  <h3 className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">Production Summary</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center bg-[var(--color-surface-2)] p-3">
                      <p className="text-2xl font-bold text-white font-mono">{result.nodes.length}</p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">Recipes</p>
                    </div>
                    <div className="text-center bg-[var(--color-surface-2)] p-3">
                      <p className="text-2xl font-bold text-[var(--color-originium)] font-mono">{result.totalMachines}</p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">Machines</p>
                    </div>
                    <div className="text-center bg-[var(--color-surface-2)] p-3">
                      <p className="text-2xl font-bold text-yellow-400 font-mono">{result.totalPower}</p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">Power (W)</p>
                    </div>
                    <div className="text-center bg-[var(--color-surface-2)] p-3">
                      <p className="text-2xl font-bold text-white font-mono">{targets.length}</p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">Targets</p>
                    </div>
                  </div>
                </div>

                {/* Cycle Warnings */}
                {result.cycleWarnings.length > 0 && (
                  <div className="bg-orange-500/5 border border-orange-500/30 p-3">
                    <h3 className="text-xs font-bold text-orange-400 flex items-center gap-1.5 mb-2">
                      <RotateCcw size={12} /> Production Loops
                    </h3>
                    <div className="space-y-1">
                      {result.cycleWarnings.map((w, i) => (
                        <p key={i} className="text-[10px] text-orange-300/80">{w}</p>
                      ))}
                    </div>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] mt-2">
                      Loop items shown as raw materials. In-game, these are self-sustaining cycles.
                    </p>
                  </div>
                )}

                {/* Raw Materials */}
                {Object.keys(result.rawMaterials).length > 0 && (
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
                    <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <AlertCircle size={14} className="text-orange-400" />
                        Raw Materials / Inputs
                      </h3>
                    </div>
                    <div className="p-3 space-y-1">
                      {Object.entries(result.rawMaterials)
                        .sort(([, a], [, b]) => b - a)
                        .map(([id, rate]) => {
                          const isCycleItem = result.cycleWarnings.some(w =>
                            w.includes(factoryData.items[id] || id)
                          );
                          return (
                            <div key={id} className={`flex items-center justify-between text-xs p-2 ${
                              isCycleItem ? 'bg-orange-500/5 border-l-2 border-l-orange-500/30' : 'bg-[var(--color-surface-2)]'
                            }`}>
                              <span className="text-[var(--color-text-secondary)] truncate flex items-center gap-1.5">
                                {isCycleItem && <RotateCcw size={9} className="text-orange-400 shrink-0" />}
                                {factoryData.items[id] || id}
                              </span>
                              <span className={`font-bold font-mono shrink-0 ml-2 ${
                                isCycleItem ? 'text-orange-400' : 'text-[var(--color-accent)]'
                              }`}>
                                {rate.toFixed(2)}/min
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Building Breakdown */}
                {result.nodes.length > 0 && (() => {
                  const byBuilding: Record<string, { name: string; count: number; power: number }> = {};
                  result.nodes.forEach(n => {
                    const key = n.recipe.machine;
                    if (!byBuilding[key]) byBuilding[key] = { name: n.recipe.machineName, count: 0, power: 0 };
                    byBuilding[key].count += Math.ceil(n.machineCount);
                    byBuilding[key].power += n.recipe.power * Math.ceil(n.machineCount);
                  });
                  return (
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
                      <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                        <h3 className="text-sm font-bold text-white">Building Breakdown</h3>
                      </div>
                      <div className="p-3 space-y-1">
                        {Object.entries(byBuilding)
                          .sort(([, a], [, b]) => b.count - a.count)
                          .map(([id, info]) => {
                            const color = BUILDING_COLORS[id] || 'var(--color-border)';
                            const maxCount = Math.max(...Object.values(byBuilding).map(b => b.count));
                            const barWidth = maxCount > 0 ? (info.count / maxCount) * 100 : 0;
                            return (
                              <div key={id} className="relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10" style={{ backgroundColor: color, width: `${barWidth}%` }} />
                                <div className="relative flex items-center justify-between text-xs p-2"
                                  style={{ borderLeft: `3px solid ${color}` }}>
                                  <span className="text-white font-bold truncate">{info.name}</span>
                                  <div className="flex items-center gap-3 shrink-0 ml-2">
                                    <span className="text-[var(--color-accent)] font-mono font-bold">×{info.count}</span>
                                    <span className="text-[var(--color-text-tertiary)] font-mono text-[10px]">{info.power}W</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })()}

                {/* Export */}
                {result.nodes.length > 0 && (
                  <div className="flex gap-2">
                    <button onClick={exportPlan}
                      className="flex-1 px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-white flex items-center justify-center gap-1.5 transition-colors">
                      <Download size={12} /> Export
                    </button>
                    <button onClick={copyPlan}
                      className="flex-1 px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-white flex items-center justify-center gap-1.5 transition-colors">
                      <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Production Chain Visualization */}
            {result.nodes.length > 0 && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Settings size={14} className="text-[var(--color-accent)]" />
                    Production Chain — {result.nodes.length} recipes, {result.totalMachines} machines
                  </h3>
                </div>
                <div className="p-3 space-y-1.5">
                  {result.nodes.map((node, i) => {
                    const color = BUILDING_COLORS[node.recipe.machine] || 'var(--color-accent)';
                    const machines = Math.ceil(node.machineCount);
                    const indent = Math.min(node.depth * 16, 64);
                    return (
                      <div key={`${node.recipe.id}-${node.itemId}-${i}`}
                        className="group bg-[var(--color-surface-2)] border-l-4 p-3 hover:bg-[var(--color-surface-2)]/80 transition-colors"
                        style={{ borderLeftColor: color, marginLeft: `${indent}px` }}>
                        {/* Header row */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-bold px-2 py-0.5 text-black shrink-0"
                              style={{ backgroundColor: color }}>
                              ×{machines}
                            </span>
                            <span className="text-xs text-white font-bold truncate">{node.recipe.machineName}</span>
                            <span className="text-[10px] text-[var(--color-text-tertiary)] truncate">({node.recipe.name})</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 text-[10px] text-[var(--color-text-tertiary)]">
                            <span className="flex items-center gap-0.5"><Zap size={9} /> {node.recipe.power * machines}W</span>
                            <span className="flex items-center gap-0.5"><Clock size={9} /> {node.recipe.craftTime}s</span>
                            <span className="text-[var(--color-accent)] font-mono">{node.ratePerMin.toFixed(2)}/min</span>
                          </div>
                        </div>
                        {/* Recipe flow */}
                        <div className="flex items-center gap-2 text-[11px]">
                          <div className="flex items-center gap-1 flex-wrap">
                            {node.recipe.inputs.map((inp, j) => (
                              <span key={j} className="text-[var(--color-text-secondary)]">
                                {j > 0 && <span className="text-[var(--color-border)]"> + </span>}
                                {inp.name} <span className="text-white font-mono">×{inp.count * machines}</span>
                              </span>
                            ))}
                          </div>
                          <ArrowRight size={12} className="text-[var(--color-accent)] shrink-0" />
                          <div className="flex items-center gap-1 flex-wrap">
                            {node.recipe.outputs.map((out, j) => (
                              <span key={j} className="text-[var(--color-accent)] font-bold">
                                {j > 0 && <span className="text-[var(--color-border)]"> + </span>}
                                {out.name} <span className="font-mono">×{out.count * machines}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Recipe Database Tab ── */}
        {activeTab === 'recipes' && (
          <div className="space-y-4">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                <input
                  type="text"
                  value={recipeSearch}
                  onChange={e => setRecipeSearch(e.target.value)}
                  placeholder="Search recipes, items, buildings..."
                  className="w-full pl-8 pr-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-sm focus:border-[var(--color-accent)] outline-none"
                />
              </div>
            </div>
            <div className="flex gap-1 flex-wrap">
              <button onClick={() => setRecipeBuildingFilter('all')}
                className={`px-3 py-1.5 text-[10px] border flex items-center gap-1 transition-colors ${
                  recipeBuildingFilter === 'all'
                    ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                    : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-white'
                }`}>
                <Filter size={10} /> All ({factoryData.recipes.length})
              </button>
              {buildings.map(b => {
                const count = factoryData.recipes.filter(r => r.machineName === b.name).length;
                const color = BUILDING_COLORS[b.id] || 'var(--color-border)';
                return (
                  <button key={b.id} onClick={() => setRecipeBuildingFilter(b.name)}
                    className={`px-2 py-1.5 text-[10px] border transition-colors ${
                      recipeBuildingFilter === b.name
                        ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                        : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-white'
                    }`}
                    style={{ borderLeftColor: color, borderLeftWidth: '3px' }}>
                    {b.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Recipe List */}
            <div className="space-y-1">
              <p className="text-xs text-[var(--color-text-tertiary)] mb-2">{filteredRecipes.length} recipes</p>
              {filteredRecipes.map(recipe => {
                const color = BUILDING_COLORS[recipe.machine] || 'var(--color-accent)';
                const isExpanded = expandedRecipe === recipe.id;
                const cyclesPerMin = 60 / recipe.craftTime;
                return (
                  <div key={recipe.id}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden transition-colors hover:border-[var(--color-accent)]/30"
                    style={{ borderLeftColor: color, borderLeftWidth: '4px' }}>
                    <button
                      onClick={() => setExpandedRecipe(isExpanded ? null : recipe.id)}
                      className="w-full text-left p-3 flex items-center gap-3">
                      {isExpanded
                        ? <ChevronDown size={14} className="text-[var(--color-accent)] shrink-0" />
                        : <ChevronRight size={14} className="text-[var(--color-text-tertiary)] shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-bold">{recipe.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 text-black font-bold shrink-0"
                            style={{ backgroundColor: color }}>{recipe.machineName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
                          {recipe.inputs.map(i => `${i.name} ×${i.count}`).join(' + ')}
                          <ArrowRight size={10} className="text-[var(--color-accent)]" />
                          <span className="text-[var(--color-accent)]">{recipe.outputs.map(o => `${o.name} ×${o.count}`).join(' + ')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-[10px] text-[var(--color-text-tertiary)]">
                        <span><Clock size={9} className="inline" /> {recipe.craftTime}s</span>
                        <span><Zap size={9} className="inline" /> {recipe.power}W</span>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0 border-t border-[var(--color-border)]">
                        <div className="grid grid-cols-2 gap-4 p-3 bg-[var(--color-surface-2)]">
                          <div>
                            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1.5">Inputs (per cycle)</p>
                            {recipe.inputs.map((inp, i) => (
                              <div key={i} className="flex items-center justify-between text-xs mb-1">
                                <span className="text-white">{inp.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[var(--color-text-tertiary)] font-mono">×{inp.count}</span>
                                  <span className="text-[10px] text-[var(--color-text-tertiary)]">({(inp.count * cyclesPerMin).toFixed(1)}/min)</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1.5">Outputs (per cycle)</p>
                            {recipe.outputs.map((out, i) => (
                              <div key={i} className="flex items-center justify-between text-xs mb-1">
                                <span className="text-[var(--color-accent)]">{out.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[var(--color-accent)] font-mono font-bold">×{out.count}</span>
                                  <span className="text-[10px] text-[var(--color-accent)]/70">({(out.count * cyclesPerMin).toFixed(1)}/min)</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-[10px] text-[var(--color-text-tertiary)]">
                          <span>Craft Time: {recipe.craftTime}s — {cyclesPerMin.toFixed(1)} cycles/min</span>
                          <span>Power: {recipe.power}W</span>
                        </div>
                        <button
                          onClick={() => {
                            addTarget(recipe.outputs[0].id, recipe.outputs[0].name);
                            setActiveTab('planner');
                          }}
                          disabled={targets.some(t => t.itemId === recipe.outputs[0].id)}
                          className="mt-2 w-full py-2 text-xs bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-colors">
                          <Plus size={12} /> Add to Production Targets
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
