'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Factory, Search, Plus, Trash2, ChevronDown, ChevronRight, Download, Copy,
  AlertCircle, Zap, Clock, ArrowRight, X, Filter, Settings, Package,
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
  multiplier: number;         // how many machines running this recipe
  targetOutput: string;       // which output item this node satisfies
  targetCount: number;        // items/cycle needed
  depth: number;
}

interface ProductionTarget {
  itemId: string;
  itemName: string;
  countPerMinute: number;
}

// ─── Constants ──────────────────────────────────────────────────────
const BUILDING_COLORS: Record<string, string> = {
  'furnance_1': '#FF6B35',       // Refining Unit
  'grinder_1': '#E74C3C',        // Grinding Unit
  'shaper_1': '#9B59B6',         // Shredding Unit
  'thickener_1': '#3498DB',      // (enrichment)
  'winder_1': '#2ECC71',         // Moulding Unit
  'filling_powder_mc_1': '#F39C12', // Filling Unit
  'component_mc_1': '#1ABC9C',   // Fitting Unit
  'tools_assebling_mc_1': '#E67E22', // Packaging Unit
  'seedcollector_1': '#27AE60',  // Seed-Picking Unit
  'planter_1': '#2ECC71',        // Planting Unit
  'mix_pool_1': '#00BCD4',       // Reactor Crucible
  'dismantler_1': '#95A5A6',     // Separating Unit
  'gearing_mc_1': '#FFD700',     // Gearing Unit (actually component_mc_1 handles this too)
  'xiranite_oven_1': '#FF5722',  // Forge of the Sky
  'squirter_1': '#4FC3F7',       // Fluid spray
};

// ─── Component ──────────────────────────────────────────────────────
export default function FactoryPlannerPage() {
  const [factoryData, setFactoryData] = useState<FactoryData | null>(null);
  const [loading, setLoading] = useState(true);

  // Production targets
  const [targets, setTargets] = useState<ProductionTarget[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [buildingFilter, setBuildingFilter] = useState<string>('all');

  // Tabs
  const [activeTab, setActiveTab] = useState<'planner' | 'recipes'>('planner');

  // Recipe browser
  const [recipeSearch, setRecipeSearch] = useState('');
  const [recipeBuildingFilter, setRecipeBuildingFilter] = useState<string>('all');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

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

  // Load saved targets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('zerosanity-factory-v2');
    if (saved) {
      try {
        setTargets(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  }, []);

  // Save targets
  const saveTargets = useCallback((newTargets: ProductionTarget[]) => {
    setTargets(newTargets);
    localStorage.setItem('zerosanity-factory-v2', JSON.stringify(newTargets));
  }, []);

  // ─── Production Chain Solver ──────────────────────────────────────
  const productionChain = useMemo(() => {
    if (!factoryData || targets.length === 0) return { nodes: [], rawInputs: {}, totalPower: 0 };

    const nodes: ProductionNode[] = [];
    const rawInputs: Record<string, number> = {}; // items with no recipe to produce them
    const visited = new Set<string>();

    // Find recipe that produces a given item
    const findRecipe = (itemId: string): Recipe | null => {
      return factoryData.recipes.find(r =>
        r.outputs.some(o => o.id === itemId)
      ) || null;
    };

    // Recursively solve production chain
    const solve = (itemId: string, neededPerCycle: number, depth: number) => {
      const recipe = findRecipe(itemId);
      if (!recipe) {
        // Raw material - no recipe produces this
        rawInputs[itemId] = (rawInputs[itemId] || 0) + neededPerCycle;
        return;
      }

      const output = recipe.outputs.find(o => o.id === itemId);
      if (!output) return;

      // Calculate how many machines needed
      const outputPerCycle = output.count;
      const cyclesNeeded = neededPerCycle / outputPerCycle;
      const multiplier = Math.ceil(cyclesNeeded * 100) / 100; // round up to 2 decimals

      // Check if we already have a node for this recipe
      const existingIdx = nodes.findIndex(n => n.recipe.id === recipe.id && n.targetOutput === itemId);
      if (existingIdx >= 0) {
        nodes[existingIdx].multiplier += multiplier;
        nodes[existingIdx].targetCount += neededPerCycle;
      } else {
        nodes.push({
          recipe,
          multiplier,
          targetOutput: itemId,
          targetCount: neededPerCycle,
          depth,
        });
      }

      // Recurse into inputs (avoid infinite loops)
      const key = `${recipe.id}:${depth}`;
      if (!visited.has(key)) {
        visited.add(key);
        for (const input of recipe.inputs) {
          const inputNeeded = input.count * multiplier;
          solve(input.id, inputNeeded, depth + 1);
        }
      }
    };

    // Solve for each target
    for (const target of targets) {
      // Convert count/min to count/cycle
      // Each cycle is craftTime seconds, but we normalize to "per minute"
      const recipe = findRecipe(target.itemId);
      if (recipe) {
        const cyclesPerMinute = 60 / recipe.craftTime;
        const output = recipe.outputs.find(o => o.id === target.itemId);
        if (output) {
          const machinesNeeded = target.countPerMinute / (output.count * cyclesPerMinute);
          solve(target.itemId, target.countPerMinute / cyclesPerMinute, 0);
        }
      } else {
        rawInputs[target.itemId] = (rawInputs[target.itemId] || 0) + target.countPerMinute;
      }
    }

    // Sort nodes by depth (deepest first = raw materials first)
    nodes.sort((a, b) => b.depth - a.depth);

    // Calculate total power
    const totalPower = nodes.reduce((sum, n) => {
      return sum + (n.recipe.power * Math.ceil(n.multiplier));
    }, 0);

    return { nodes, rawInputs, totalPower };
  }, [factoryData, targets]);

  // ─── Filterable items for picker ──────────────────────────────────
  const produceableItems = useMemo(() => {
    if (!factoryData) return [];
    const items: { id: string; name: string; machine: string }[] = [];
    const seen = new Set<string>();
    for (const recipe of factoryData.recipes) {
      for (const output of recipe.outputs) {
        if (!seen.has(output.id)) {
          seen.add(output.id);
          items.push({ id: output.id, name: output.name, machine: recipe.machineName });
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

  // ─── Recipe browser filtering ────────────────────────────────────
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
    const existing = targets.find(t => t.itemId === itemId);
    if (existing) return; // already added
    saveTargets([...targets, { itemId, itemName, countPerMinute: 1 }]);
    setShowItemPicker(false);
    setSearchQuery('');
  }, [targets, saveTargets]);

  const removeTarget = useCallback((itemId: string) => {
    saveTargets(targets.filter(t => t.itemId !== itemId));
  }, [targets, saveTargets]);

  const updateTargetCount = useCallback((itemId: string, count: number) => {
    saveTargets(targets.map(t => t.itemId === itemId ? { ...t, countPerMinute: Math.max(0.1, count) } : t));
  }, [targets, saveTargets]);

  const clearAll = useCallback(() => {
    if (confirm('Clear all production targets?')) {
      saveTargets([]);
    }
  }, [saveTargets]);

  const exportPlan = useCallback(() => {
    const lines = ['AIC Factory Production Plan', '═'.repeat(40), ''];
    lines.push('Production Targets:');
    targets.forEach(t => {
      lines.push(`  • ${t.itemName}: ${t.countPerMinute}/min`);
    });
    lines.push('');
    lines.push('Required Production Lines:');
    productionChain.nodes.forEach(n => {
      const inp = n.recipe.inputs.map(i => `${i.name} x${i.count}`).join(' + ');
      const out = n.recipe.outputs.map(o => `${o.name} x${o.count}`).join(' + ');
      lines.push(`  [${n.recipe.machineName}] x${Math.ceil(n.multiplier)} — ${inp} → ${out}`);
    });
    if (Object.keys(productionChain.rawInputs).length > 0) {
      lines.push('');
      lines.push('Raw Materials Required:');
      const itemNames = factoryData?.items || {};
      Object.entries(productionChain.rawInputs).forEach(([id, qty]) => {
        lines.push(`  • ${itemNames[id] || id}: ${qty.toFixed(1)}/cycle`);
      });
    }
    lines.push('');
    lines.push(`Total Power: ${productionChain.totalPower}W`);
    lines.push(`Generated by Zero Sanity Toolkit — zerosanity.app`);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factory-plan-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [targets, productionChain, factoryData]);

  const copyPlan = useCallback(async () => {
    const lines: string[] = [];
    targets.forEach(t => lines.push(`${t.itemName}: ${t.countPerMinute}/min`));
    lines.push('');
    productionChain.nodes.forEach(n => {
      lines.push(`${n.recipe.machineName} x${Math.ceil(n.multiplier)}: ${n.recipe.name}`);
    });
    lines.push(`Power: ${productionChain.totalPower}W | zerosanity.app`);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
    } catch { /* silently fail */ }
  }, [targets, productionChain]);

  // ─── Loading State ────────────────────────────────────────────────
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

  const itemNames = factoryData.items;

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader title="AIC Production Planner" category="LOGISTICS" code="RIOS-FAC-001" icon={<Factory size={28} />} />

        <p className="text-sm text-[var(--color-text-tertiary)] mb-4">
          Plan and optimize your Automated Industry Complex production chains. Select output targets and the solver automatically calculates the full chain.
        </p>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-4">
          {([
            { id: 'planner' as const, label: 'Production Planner', icon: <Settings size={14} /> },
            { id: 'recipes' as const, label: `Recipe Browser (${factoryData.recipes.length})`, icon: <Package size={14} /> },
          ]).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-surface)]'
                  : 'border-transparent text-[var(--color-text-tertiary)] hover:text-white'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Production Planner ── */}
        {activeTab === 'planner' && (
          <div className="grid lg:grid-cols-[1fr_340px] gap-4">
            {/* Left: Production Chain */}
            <div className="space-y-4">
              {/* Targets */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Factory size={14} className="text-[var(--color-accent)]" />
                    Production Targets
                  </h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowItemPicker(true)}
                      className="px-2 py-1 text-[10px] bg-[var(--color-accent)] text-black font-bold flex items-center gap-1 hover:bg-[var(--color-accent-hover)] transition-colors">
                      <Plus size={10} /> Add Target
                    </button>
                    {targets.length > 0 && (
                      <button onClick={clearAll} className="px-2 py-1 text-[10px] border border-red-500/30 text-red-400 hover:bg-red-500/10">
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {targets.length === 0 ? (
                  <div className="p-8 text-center">
                    <Factory size={32} className="mx-auto mb-2 text-[var(--color-border)]" />
                    <p className="text-sm text-[var(--color-text-tertiary)]">No production targets set.</p>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Click &quot;Add Target&quot; to select what you want to produce.</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {targets.map(target => (
                      <div key={target.itemId} className="flex items-center gap-3 p-2 bg-[var(--color-surface-2)] border-l-4 border-l-[var(--color-accent)]">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-bold truncate">{target.itemName}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="number"
                            min="0.1"
                            step="0.5"
                            value={target.countPerMinute}
                            onChange={e => updateTargetCount(target.itemId, parseFloat(e.target.value) || 0.1)}
                            className="w-16 px-2 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-sm text-center font-mono"
                          />
                          <span className="text-[10px] text-[var(--color-text-tertiary)] whitespace-nowrap">/min</span>
                          <button onClick={() => removeTarget(target.itemId)}
                            className="p-1 text-[var(--color-text-tertiary)] hover:text-red-400">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Item Picker Modal */}
              {showItemPicker && (
                <div className="bg-[var(--color-surface)] border border-[var(--color-accent)] clip-corner-tl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                    <h3 className="text-sm font-bold text-white">Select Item to Produce</h3>
                    <button onClick={() => { setShowItemPicker(false); setSearchQuery(''); }}
                      className="text-[var(--color-text-tertiary)] hover:text-white"><X size={16} /></button>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search items..."
                        className="w-full pl-8 pr-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm focus:border-[var(--color-accent)] outline-none"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => setBuildingFilter('all')}
                        className={`px-2 py-0.5 text-[10px] border ${buildingFilter === 'all' ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)]'}`}>
                        All
                      </button>
                      {buildings.map(b => (
                        <button key={b.id} onClick={() => setBuildingFilter(b.name)}
                          className={`px-2 py-0.5 text-[10px] border ${buildingFilter === b.name ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)]'}`}>
                          {b.name}
                        </button>
                      ))}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto space-y-1">
                      {filteredItems.map(item => {
                        const alreadyAdded = targets.some(t => t.itemId === item.id);
                        return (
                          <button key={item.id} onClick={() => !alreadyAdded && addTarget(item.id, item.name)}
                            disabled={alreadyAdded}
                            className={`w-full text-left p-2 flex items-center justify-between text-sm transition-colors ${
                              alreadyAdded
                                ? 'bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] opacity-50 cursor-not-allowed'
                                : 'bg-[var(--color-surface-2)] hover:bg-[var(--color-accent)]/10 hover:border-[var(--color-accent)] text-white border border-transparent'
                            }`}>
                            <span className="truncate">{item.name}</span>
                            <span className="text-[10px] text-[var(--color-text-tertiary)] shrink-0 ml-2">{item.machine}</span>
                          </button>
                        );
                      })}
                      {filteredItems.length === 0 && (
                        <p className="text-xs text-[var(--color-text-tertiary)] text-center py-4">No items match your search.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Production Chain Visualization */}
              {productionChain.nodes.length > 0 && (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Settings size={14} className="text-[var(--color-accent)]" />
                      Production Chain ({productionChain.nodes.length} recipes)
                    </h3>
                  </div>
                  <div className="p-3 space-y-2">
                    {productionChain.nodes.map((node, i) => {
                      const color = BUILDING_COLORS[node.recipe.machine] || 'var(--color-accent)';
                      const machines = Math.ceil(node.multiplier);
                      return (
                        <div key={`${node.recipe.id}-${i}`}
                          className="p-3 bg-[var(--color-surface-2)] border-l-4 transition-colors"
                          style={{ borderLeftColor: color, marginLeft: `${Math.min(node.depth * 12, 48)}px` }}>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-bold px-1.5 py-0.5 text-black shrink-0"
                                style={{ backgroundColor: color }}>
                                x{machines}
                              </span>
                              <span className="text-xs text-white font-bold truncate">{node.recipe.machineName}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 text-[10px] text-[var(--color-text-tertiary)]">
                              <span className="flex items-center gap-0.5"><Zap size={9} /> {node.recipe.power * machines}W</span>
                              <span className="flex items-center gap-0.5"><Clock size={9} /> {node.recipe.craftTime}s</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <div className="flex items-center gap-1 flex-wrap">
                              {node.recipe.inputs.map((inp, j) => (
                                <span key={j} className="text-[var(--color-text-secondary)]">
                                  {j > 0 && <span className="text-[var(--color-border)]"> + </span>}
                                  {inp.name} <span className="text-white font-mono">x{(inp.count * machines)}</span>
                                </span>
                              ))}
                            </div>
                            <ArrowRight size={12} className="text-[var(--color-accent)] shrink-0" />
                            <div className="flex items-center gap-1 flex-wrap">
                              {node.recipe.outputs.map((out, j) => (
                                <span key={j} className="text-[var(--color-accent)] font-bold">
                                  {j > 0 && <span className="text-[var(--color-border)]"> + </span>}
                                  {out.name} <span className="font-mono">x{(out.count * machines)}</span>
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

            {/* Right: Summary Panel */}
            <div className="space-y-4">
              {/* Power & Stats */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4">
                <h3 className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">Production Summary</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center bg-[var(--color-surface-2)] p-2">
                    <p className="text-xl font-bold text-white font-mono">{productionChain.nodes.length}</p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)]">Recipes</p>
                  </div>
                  <div className="text-center bg-[var(--color-surface-2)] p-2">
                    <p className="text-xl font-bold text-[var(--color-originium)] font-mono">
                      {productionChain.nodes.reduce((s, n) => s + Math.ceil(n.multiplier), 0)}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)]">Machines</p>
                  </div>
                  <div className="text-center bg-[var(--color-surface-2)] p-2">
                    <p className="text-xl font-bold text-yellow-400 font-mono">{productionChain.totalPower}</p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)]">Power (W)</p>
                  </div>
                  <div className="text-center bg-[var(--color-surface-2)] p-2">
                    <p className="text-xl font-bold text-white font-mono">{targets.length}</p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)]">Targets</p>
                  </div>
                </div>
              </div>

              {/* Raw Materials Needed */}
              {Object.keys(productionChain.rawInputs).length > 0 && (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <AlertCircle size={14} className="text-orange-400" />
                      Raw Materials
                    </h3>
                  </div>
                  <div className="p-3 space-y-1">
                    {Object.entries(productionChain.rawInputs)
                      .sort(([, a], [, b]) => b - a)
                      .map(([id, qty]) => (
                        <div key={id} className="flex items-center justify-between text-xs p-1 bg-[var(--color-surface-2)]">
                          <span className="text-[var(--color-text-secondary)] truncate">{itemNames[id] || id}</span>
                          <span className="text-orange-400 font-bold font-mono shrink-0 ml-2">
                            {qty.toFixed(1)}/cycle
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Building Breakdown */}
              {productionChain.nodes.length > 0 && (() => {
                const byBuilding: Record<string, { name: string; count: number; power: number }> = {};
                productionChain.nodes.forEach(n => {
                  const key = n.recipe.machine;
                  if (!byBuilding[key]) {
                    byBuilding[key] = { name: n.recipe.machineName, count: 0, power: 0 };
                  }
                  byBuilding[key].count += Math.ceil(n.multiplier);
                  byBuilding[key].power += n.recipe.power * Math.ceil(n.multiplier);
                });
                return (
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
                    <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                      <h3 className="text-sm font-bold text-white">Building Breakdown</h3>
                    </div>
                    <div className="p-3 space-y-1">
                      {Object.entries(byBuilding)
                        .sort(([, a], [, b]) => b.count - a.count)
                        .map(([id, info]) => (
                          <div key={id} className="flex items-center justify-between text-xs p-1.5"
                            style={{ borderLeft: `3px solid ${BUILDING_COLORS[id] || 'var(--color-border)'}` }}>
                            <span className="text-white font-bold truncate">{info.name}</span>
                            <div className="flex items-center gap-3 shrink-0 ml-2">
                              <span className="text-[var(--color-accent)] font-mono">x{info.count}</span>
                              <span className="text-[var(--color-text-tertiary)] font-mono text-[10px]">{info.power}W</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })()}

              {/* Export Actions */}
              {productionChain.nodes.length > 0 && (
                <div className="flex gap-2">
                  <button onClick={exportPlan}
                    className="flex-1 px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-white flex items-center justify-center gap-1">
                    <Download size={12} /> Export Plan
                  </button>
                  <button onClick={copyPlan}
                    className="flex-1 px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-white flex items-center justify-center gap-1">
                    <Copy size={12} /> Copy
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Recipe Browser ── */}
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
              <div className="flex gap-1 flex-wrap">
                <button onClick={() => setRecipeBuildingFilter('all')}
                  className={`px-3 py-1.5 text-[10px] border flex items-center gap-1 ${
                    recipeBuildingFilter === 'all'
                      ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                      : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-white'
                  }`}>
                  <Filter size={10} /> All ({factoryData.recipes.length})
                </button>
                {buildings.map(b => {
                  const count = factoryData.recipes.filter(r => r.machineName === b.name).length;
                  return (
                    <button key={b.id} onClick={() => setRecipeBuildingFilter(b.name)}
                      className={`px-2 py-1.5 text-[10px] border ${
                        recipeBuildingFilter === b.name
                          ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                          : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-white'
                      }`}
                      style={{ borderLeftColor: BUILDING_COLORS[b.id] || 'var(--color-border)', borderLeftWidth: '3px' }}>
                      {b.name} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recipe List */}
            <div className="space-y-1">
              <p className="text-xs text-[var(--color-text-tertiary)] mb-2">{filteredRecipes.length} recipes</p>
              {filteredRecipes.map(recipe => {
                const color = BUILDING_COLORS[recipe.machine] || 'var(--color-accent)';
                const isExpanded = expandedRecipe === recipe.id;
                return (
                  <div key={recipe.id}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden transition-colors hover:border-[var(--color-accent)]/30"
                    style={{ borderLeftColor: color, borderLeftWidth: '4px' }}>
                    <button
                      onClick={() => setExpandedRecipe(isExpanded ? null : recipe.id)}
                      className="w-full text-left p-3 flex items-center gap-3">
                      {isExpanded ? <ChevronDown size={14} className="text-[var(--color-accent)] shrink-0" /> : <ChevronRight size={14} className="text-[var(--color-text-tertiary)] shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-bold">{recipe.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 text-black font-bold shrink-0"
                            style={{ backgroundColor: color }}>{recipe.machineName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
                          {recipe.inputs.map(i => i.name).join(' + ')}
                          <ArrowRight size={10} className="text-[var(--color-accent)]" />
                          <span className="text-[var(--color-accent)]">{recipe.outputs.map(o => o.name).join(' + ')}</span>
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
                            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1.5">Inputs</p>
                            {recipe.inputs.map((inp, i) => (
                              <div key={i} className="flex items-center justify-between text-xs mb-1">
                                <span className="text-white">{inp.name}</span>
                                <span className="text-[var(--color-text-tertiary)] font-mono">x{inp.count}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1.5">Outputs</p>
                            {recipe.outputs.map((out, i) => (
                              <div key={i} className="flex items-center justify-between text-xs mb-1">
                                <span className="text-[var(--color-accent)]">{out.name}</span>
                                <span className="text-[var(--color-accent)] font-mono font-bold">x{out.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-[10px] text-[var(--color-text-tertiary)]">
                          <span>Craft Time: {recipe.craftTime}s ({(60 / recipe.craftTime).toFixed(1)} cycles/min)</span>
                          <span>Power: {recipe.power}W</span>
                        </div>
                        <button
                          onClick={() => addTarget(recipe.outputs[0].id, recipe.outputs[0].name)}
                          disabled={targets.some(t => t.itemId === recipe.outputs[0].id)}
                          className="mt-2 w-full py-1.5 text-xs bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1">
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
