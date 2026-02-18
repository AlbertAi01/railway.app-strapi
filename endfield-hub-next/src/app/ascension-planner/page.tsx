'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { CHARACTERS } from '@/lib/data';
import {
  Star, Download, Copy, TrendingUp, Crosshair, BookOpen, Plus, Trash2, ChevronDown, ChevronUp,
  Package, Check, RotateCcw, Users, Layers, Save,
} from 'lucide-react';
import { CHARACTER_ICONS, MATERIAL_ICONS, MATERIAL_ID_TO_NAME } from '@/lib/assets';
import { CHAR_MATERIALS, getBreakMaterials, getSkillMaterials } from '@/data/ascension';
import type { MaterialCost } from '@/data/ascension';
import RIOSHeader from '@/components/ui/RIOSHeader';

const BREAK_LEVELS = [0, 20, 40, 60, 70];
const SKILL_GROUPS = [
  { id: 0, label: 'Normal Skill' },
  { id: 1, label: 'Ultimate Skill' },
  { id: 2, label: 'Combo Skill' },
  { id: 3, label: 'Normal Attack' },
];

const STORAGE_KEY = 'zerosanity-ascension-plans';
const INVENTORY_KEY = 'zerosanity-ascension-inventory';

interface CharacterPlan {
  id: string; // unique key
  slug: string;
  currentBreak: number;
  targetBreak: number;
  skillLevels: { from: number; to: number }[];
  collapsed: boolean;
}

function defaultSkillLevels() {
  return [
    { from: 1, to: 1 },
    { from: 1, to: 1 },
    { from: 1, to: 1 },
    { from: 1, to: 1 },
  ];
}

function mergeMaterials(lists: MaterialCost[][]): MaterialCost[] {
  const totals: Record<string, number> = {};
  for (const list of lists) {
    for (const { id, count } of list) {
      totals[id] = (totals[id] || 0) + count;
    }
  }
  return Object.entries(totals)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => {
      if (a.id === 'item_gold') return -1;
      if (b.id === 'item_gold') return 1;
      const nameA = MATERIAL_ID_TO_NAME[a.id] || a.id;
      const nameB = MATERIAL_ID_TO_NAME[b.id] || b.id;
      return nameA.localeCompare(nameB);
    });
}

function getMaterialsForPlan(plan: CharacterPlan): MaterialCost[] {
  if (!plan.slug || !CHAR_MATERIALS[plan.slug]) return [];
  const lists: MaterialCost[][] = [];
  if (plan.targetBreak > plan.currentBreak) {
    lists.push(getBreakMaterials(plan.slug, plan.currentBreak, plan.targetBreak));
  }
  for (let g = 0; g < 4; g++) {
    const { from, to } = plan.skillLevels[g];
    if (to > from) {
      lists.push(getSkillMaterials(plan.slug, g, from, to));
    }
  }
  return mergeMaterials(lists);
}

// ─── Material Row with owned/needed display ─────────────────────────────
function MaterialRow({ id, count, owned, onOwnedChange, compact }: {
  id: string; count: number; owned: number; onOwnedChange?: (val: number) => void; compact?: boolean;
}) {
  const name = MATERIAL_ID_TO_NAME[id] || id;
  const iconUrl = MATERIAL_ICONS[name];
  const isGold = id === 'item_gold';
  const deficit = Math.max(0, count - owned);
  const sufficient = deficit === 0;

  return (
    <div className={`flex items-center gap-3 ${compact ? 'p-2' : 'p-3'} bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl ${sufficient ? 'border-l-2 border-l-emerald-500/60' : 'border-l-2 border-l-red-500/60'}`}>
      <div className="w-10 h-10 shrink-0 clip-corner-tl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
        {iconUrl ? (
          <Image src={iconUrl} alt={name} width={40} height={40} className="w-10 h-10 object-contain" />
        ) : (
          <span className="text-xs text-[var(--color-text-tertiary)]">?</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs font-mono ${sufficient ? 'text-emerald-400' : 'text-red-400'}`}>
            {sufficient ? 'Complete' : `Need ${isGold ? deficit.toLocaleString() : deficit.toLocaleString()} more`}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onOwnedChange && (
          <input
            type="number"
            min={0}
            value={owned || ''}
            onChange={(e) => onOwnedChange(Math.max(0, parseInt(e.target.value) || 0))}
            placeholder="0"
            className="w-16 px-2 py-1 text-xs font-mono text-right bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white"
          />
        )}
        <span className={`font-bold text-base font-mono shrink-0 ${isGold ? 'text-[#FFD700]' : 'text-[var(--color-accent)]'}`}>
          {isGold ? count.toLocaleString() : `×${count.toLocaleString()}`}
        </span>
      </div>
    </div>
  );
}

// ─── Character Plan Card ─────────────────────────────────────────────────
function PlanCard({ plan, onUpdate, onRemove }: {
  plan: CharacterPlan;
  onUpdate: (p: CharacterPlan) => void;
  onRemove: () => void;
}) {
  const character = CHARACTERS.find(c => c.Slug === plan.slug);
  const materials = useMemo(() => getMaterialsForPlan(plan), [plan]);

  const setSkillLevel = (group: number, field: 'from' | 'to', value: number) => {
    const next = [...plan.skillLevels];
    next[group] = { ...next[group], [field]: value };
    if (field === 'from' && value > next[group].to) next[group].to = value;
    if (field === 'to' && value < next[group].from) next[group].from = value;
    onUpdate({ ...plan, skillLevels: next });
  };

  const setAllSkillsTo = (to: number) => {
    onUpdate({
      ...plan,
      skillLevels: plan.skillLevels.map(s => ({ from: s.from, to: Math.max(s.from, to) })),
    });
  };

  const totalItems = materials.filter(m => m.id !== 'item_gold').reduce((s, m) => s + m.count, 0);
  const goldCost = materials.find(m => m.id === 'item_gold')?.count || 0;

  if (!character) return null;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] cursor-pointer select-none"
        onClick={() => onUpdate({ ...plan, collapsed: !plan.collapsed })}
      >
        <div className="w-10 h-10 shrink-0 clip-corner-tl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
          {CHARACTER_ICONS[character.Name] ? (
            <Image src={CHARACTER_ICONS[character.Name]} alt={character.Name} width={40} height={40} className="w-10 h-10 object-contain" />
          ) : (
            <span className="text-sm font-bold text-white/20">{character.Name[0]}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold text-sm truncate">{character.Name}</h3>
            <div className="flex">
              {Array.from({ length: character.Rarity }, (_, i) => (
                <Star key={i} size={10} fill="#FFE500" color="#FFE500" />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-tertiary)] font-mono mt-0.5">
            <span>BRK {plan.currentBreak}→{plan.targetBreak}</span>
            <span>SKILLS {plan.skillLevels.map(s => s.to).join('/')}</span>
            {goldCost > 0 && <span className="text-[#FFD700]">{goldCost.toLocaleString()}G</span>}
            {totalItems > 0 && <span className="text-[var(--color-accent)]">{totalItems} items</span>}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1.5 text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors"
          title="Remove"
        >
          <Trash2 size={14} />
        </button>
        {plan.collapsed ? <ChevronDown size={16} className="text-[var(--color-text-tertiary)]" /> : <ChevronUp size={16} className="text-[var(--color-text-tertiary)]" />}
      </div>

      {/* Body */}
      {!plan.collapsed && (
        <div className="p-4 space-y-4">
          {/* Break Level */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crosshair size={14} className="text-[var(--color-accent)]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-tactical">Break Level</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold mb-1 text-[var(--color-text-tertiary)] uppercase">Current</label>
                <select
                  value={plan.currentBreak}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const newTarget = val >= plan.targetBreak ? (BREAK_LEVELS[BREAK_LEVELS.indexOf(val) + 1] || val) : plan.targetBreak;
                    onUpdate({ ...plan, currentBreak: val, targetBreak: newTarget });
                  }}
                  className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white text-sm"
                >
                  {BREAK_LEVELS.slice(0, -1).map(lv => (
                    <option key={lv} value={lv}>{lv === 0 ? 'None (Lv 1)' : `Break ${lv}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1 text-[var(--color-text-tertiary)] uppercase">Target</label>
                <select
                  value={plan.targetBreak}
                  onChange={(e) => onUpdate({ ...plan, targetBreak: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white text-sm"
                >
                  {BREAK_LEVELS.filter(lv => lv > plan.currentBreak).map(lv => (
                    <option key={lv} value={lv}>Break {lv}{lv === 70 ? ' (Max)' : ''}</option>
                  ))}
                  {BREAK_LEVELS.filter(lv => lv > plan.currentBreak).length === 0 && (
                    <option value={plan.currentBreak}>Already maxed</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Skill Levels */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-[var(--color-accent)]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-tactical">Skill Levels</span>
              </div>
              <div className="flex gap-1">
                {[6, 9, 12].map(lv => (
                  <button
                    key={lv}
                    onClick={() => setAllSkillsTo(lv)}
                    className="px-2 py-0.5 text-[10px] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-text-tertiary)] hover:text-white transition-colors"
                  >
                    All→{lv}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {SKILL_GROUPS.map((group, g) => (
                <div key={g} className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-text-tertiary)] w-24 shrink-0 truncate">{group.label}</span>
                  <select
                    value={plan.skillLevels[g].from}
                    onChange={(e) => setSkillLevel(g, 'from', Number(e.target.value))}
                    className="flex-1 px-2 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white text-xs"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(lv => (
                      <option key={lv} value={lv}>Lv {lv}</option>
                    ))}
                  </select>
                  <span className="text-[var(--color-text-tertiary)] text-xs">→</span>
                  <select
                    value={plan.skillLevels[g].to}
                    onChange={(e) => setSkillLevel(g, 'to', Number(e.target.value))}
                    className="flex-1 px-2 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white text-xs"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).filter(lv => lv >= plan.skillLevels[g].from).map(lv => (
                      <option key={lv} value={lv}>Lv {lv}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Per-Character Materials */}
          {materials.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package size={14} className="text-[var(--color-accent)]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-tactical">Materials ({materials.length})</span>
              </div>
              <div className="space-y-1">
                {materials.map(m => (
                  <MaterialRow key={m.id} id={m.id} count={m.count} owned={0} compact />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Character Picker Modal ──────────────────────────────────────────────
function CharacterPicker({ onSelect, existingSlugs, onClose }: {
  onSelect: (slug: string) => void;
  existingSlugs: string[];
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [filterRarity, setFilterRarity] = useState<number | null>(null);

  const filtered = CHARACTERS.filter(c => {
    if (!CHAR_MATERIALS[c.Slug]) return false;
    if (existingSlugs.includes(c.Slug)) return false;
    if (filterRarity && c.Rarity !== filterRarity) return false;
    if (search && !c.Name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical">Add Operator to Plan</h2>
        </div>
        <div className="p-4 space-y-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search operators..."
            autoFocus
            className="w-full px-4 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white text-sm"
          />
          <div className="flex gap-2">
            {[null, 6, 5, 4].map(r => (
              <button
                key={r ?? 'all'}
                onClick={() => setFilterRarity(r)}
                className={`px-3 py-1 text-xs border transition-colors ${filterRarity === r ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]'}`}
              >
                {r ? `${r}★` : 'All'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-1">
          {filtered.length === 0 ? (
            <p className="text-center text-[var(--color-text-tertiary)] text-sm py-8">No operators available</p>
          ) : filtered.map(char => (
            <button
              key={char.Slug}
              onClick={() => { onSelect(char.Slug); onClose(); }}
              className="w-full flex items-center gap-3 p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors text-left"
            >
              <div className="w-10 h-10 shrink-0 clip-corner-tl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
                {CHARACTER_ICONS[char.Name] ? (
                  <Image src={CHARACTER_ICONS[char.Name]} alt={char.Name} width={40} height={40} className="w-10 h-10 object-contain" />
                ) : (
                  <span className="text-sm font-bold text-white/20">{char.Name[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{char.Name}</p>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: char.Rarity }, (_, i) => (
                      <Star key={i} size={10} fill="#FFE500" color="#FFE500" />
                    ))}
                  </div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">{char.Role} / {char.Element}</span>
                </div>
              </div>
              <Plus size={16} className="text-[var(--color-accent)]" />
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-[var(--color-border)]">
          <button onClick={onClose} className="w-full py-2 text-sm text-[var(--color-text-tertiary)] hover:text-white transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────
export default function AscensionPlannerPage() {
  const [plans, setPlans] = useState<CharacterPlan[]>([]);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [showPicker, setShowPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'summary' | 'inventory'>('plans');
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const savedPlans = localStorage.getItem(STORAGE_KEY);
      if (savedPlans) setPlans(JSON.parse(savedPlans));
      const savedInv = localStorage.getItem(INVENTORY_KEY);
      if (savedInv) setInventory(JSON.parse(savedInv));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  }, [plans, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  }, [inventory, loaded]);

  const addCharacter = useCallback((slug: string) => {
    setPlans(prev => [...prev, {
      id: `${slug}-${Date.now()}`,
      slug,
      currentBreak: 0,
      targetBreak: 70,
      skillLevels: defaultSkillLevels(),
      collapsed: false,
    }]);
  }, []);

  const updatePlan = useCallback((id: string, updated: CharacterPlan) => {
    setPlans(prev => prev.map(p => p.id === id ? updated : p));
  }, []);

  const removePlan = useCallback((id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
  }, []);

  // Aggregated materials across all plans
  const aggregated = useMemo(() => {
    const allLists = plans.map(getMaterialsForPlan);
    return mergeMaterials(allLists);
  }, [plans]);

  // All unique material IDs needed
  const allMaterialIds = useMemo(() => aggregated.map(m => m.id), [aggregated]);

  const totalGold = aggregated.find(m => m.id === 'item_gold')?.count || 0;
  const totalItems = aggregated.filter(m => m.id !== 'item_gold').reduce((s, m) => s + m.count, 0);
  const completedItems = aggregated.filter(m => {
    const owned = inventory[m.id] || 0;
    return owned >= m.count;
  }).length;

  const exportAllJSON = () => {
    const data = JSON.stringify({
      plans: plans.map(p => {
        const char = CHARACTERS.find(c => c.Slug === p.slug);
        return {
          character: char?.Name,
          slug: p.slug,
          currentBreak: p.currentBreak,
          targetBreak: p.targetBreak,
          skillLevels: SKILL_GROUPS.map((g, i) => ({
            skill: g.label,
            from: p.skillLevels[i].from,
            to: p.skillLevels[i].to,
          })),
        };
      }),
      aggregatedMaterials: aggregated.map(m => ({
        id: m.id,
        name: MATERIAL_ID_TO_NAME[m.id] || m.id,
        needed: m.count,
        owned: inventory[m.id] || 0,
        deficit: Math.max(0, m.count - (inventory[m.id] || 0)),
      })),
      inventory,
      exportedAt: new Date().toISOString(),
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zerosanity-ascension-plan-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySummary = async () => {
    let summary = `Zero Sanity — Ascension Plan Summary\n`;
    summary += `═══════════════════════════════════\n\n`;
    for (const plan of plans) {
      const char = CHARACTERS.find(c => c.Slug === plan.slug);
      if (!char) continue;
      summary += `▸ ${char.Name} (${char.Rarity}★ ${char.Role})\n`;
      summary += `  Break: ${plan.currentBreak} → ${plan.targetBreak}\n`;
      for (let g = 0; g < 4; g++) {
        const { from, to } = plan.skillLevels[g];
        if (to > from) summary += `  ${SKILL_GROUPS[g].label}: Lv${from} → Lv${to}\n`;
      }
      summary += `\n`;
    }
    summary += `Total Materials Needed:\n`;
    for (const m of aggregated) {
      const name = MATERIAL_ID_TO_NAME[m.id] || m.id;
      const owned = inventory[m.id] || 0;
      const deficit = Math.max(0, m.count - owned);
      summary += `  ${name}: ${m.id === 'item_gold' ? m.count.toLocaleString() : '×' + m.count.toLocaleString()}`;
      if (owned > 0) summary += ` (owned: ${owned}, need: ${deficit})`;
      summary += `\n`;
    }
    summary += `\nCreated with Zero Sanity — zerosanity.app`;
    try { await navigator.clipboard.writeText(summary); } catch { /* */ }
  };

  const resetInventory = () => {
    if (confirm('Reset all owned material counts to 0?')) {
      setInventory({});
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="diamond-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader title="Operator Development" category="DEVELOPMENT" code="RIOS-ASC-001" icon={<Star size={28} />} />

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-[var(--color-accent)]" />
              <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] uppercase">Operators</span>
            </div>
            <p className="text-white text-xl font-bold font-mono">{plans.length}</p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Layers size={14} className="text-[var(--color-accent)]" />
              <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] uppercase">Materials</span>
            </div>
            <p className="text-white text-xl font-bold font-mono">{aggregated.length}</p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Check size={14} className="text-emerald-400" />
              <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] uppercase">Complete</span>
            </div>
            <p className="text-emerald-400 text-xl font-bold font-mono">{aggregated.length > 0 ? `${completedItems}/${aggregated.length}` : '—'}</p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-[#FFD700]">G</span>
              <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] uppercase">Gold Cost</span>
            </div>
            <p className="text-[#FFD700] text-xl font-bold font-mono">{totalGold > 0 ? totalGold.toLocaleString() : '—'}</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => setShowPicker(true)}
            className="px-4 py-2 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-[var(--color-accent)]/90 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> Add Operator
          </button>
          <button
            onClick={exportAllJSON}
            disabled={plans.length === 0}
            className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={copySummary}
            disabled={plans.length === 0}
            className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            <Copy size={14} /> Copy
          </button>
          <div className="flex-1" />
          {/* Tabs */}
          <div className="flex border border-[var(--color-border)] overflow-hidden">
            {(['plans', 'summary', 'inventory'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs uppercase tracking-wider font-bold transition-colors ${activeTab === tab ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface)] text-[var(--color-text-tertiary)] hover:text-white'}`}
              >
                {tab === 'plans' ? 'Plans' : tab === 'summary' ? 'Summary' : 'Inventory'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'plans' && (
          <div className="space-y-4">
            {plans.length === 0 ? (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-12 text-center">
                <TrendingUp size={48} className="mx-auto mb-4 text-[var(--color-text-tertiary)] opacity-30" />
                <h3 className="text-white font-bold mb-2">No Operators Added</h3>
                <p className="text-[var(--color-text-tertiary)] text-sm mb-4">
                  Add operators to plan their ascension materials, skill upgrades, and break levels.
                </p>
                <button
                  onClick={() => setShowPicker(true)}
                  className="px-6 py-2.5 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-[var(--color-accent)]/90 transition-colors inline-flex items-center gap-2 text-sm"
                >
                  <Plus size={16} /> Add Your First Operator
                </button>
              </div>
            ) : (
              <>
                {/* Quick Presets Bar */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] uppercase">Quick Set All:</span>
                    {[
                      { label: 'Break 70 + Skills 6', brk: 70, skills: 6 },
                      { label: 'Break 70 + Skills 9', brk: 70, skills: 9 },
                      { label: 'Break 70 + Skills 12', brk: 70, skills: 12 },
                    ].map(preset => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          setPlans(prev => prev.map(p => ({
                            ...p,
                            targetBreak: preset.brk,
                            skillLevels: p.skillLevels.map(s => ({
                              from: s.from,
                              to: Math.max(s.from, preset.skills),
                            })),
                          })));
                        }}
                        className="px-3 py-1 text-[10px] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-text-tertiary)] hover:text-white transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                    <button
                      onClick={() => setPlans(prev => prev.map(p => ({ ...p, collapsed: true })))}
                      className="px-3 py-1 text-[10px] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-text-tertiary)] hover:text-white transition-colors ml-auto"
                    >
                      Collapse All
                    </button>
                    <button
                      onClick={() => setPlans(prev => prev.map(p => ({ ...p, collapsed: false })))}
                      className="px-3 py-1 text-[10px] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-text-tertiary)] hover:text-white transition-colors"
                    >
                      Expand All
                    </button>
                  </div>
                </div>

                {/* Plan Cards */}
                <div className="grid lg:grid-cols-2 gap-4">
                  {plans.map(plan => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      onUpdate={(updated) => updatePlan(plan.id, updated)}
                      onRemove={() => removePlan(plan.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-4">
            {/* Per-Character Breakdown */}
            {plans.length > 1 && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical">Per-Operator Cost</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {plans.map(plan => {
                      const char = CHARACTERS.find(c => c.Slug === plan.slug);
                      const mats = getMaterialsForPlan(plan);
                      const gold = mats.find(m => m.id === 'item_gold')?.count || 0;
                      const items = mats.filter(m => m.id !== 'item_gold').reduce((s, m) => s + m.count, 0);
                      if (!char) return null;
                      return (
                        <div key={plan.id} className="flex items-center gap-3 p-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl">
                          <div className="w-8 h-8 shrink-0 clip-corner-tl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
                            {CHARACTER_ICONS[char.Name] ? (
                              <Image src={CHARACTER_ICONS[char.Name]} alt={char.Name} width={32} height={32} className="w-8 h-8 object-contain" />
                            ) : (
                              <span className="text-xs font-bold text-white/20">{char.Name[0]}</span>
                            )}
                          </div>
                          <span className="text-white text-sm font-semibold flex-1 truncate">{char.Name}</span>
                          <span className="text-[#FFD700] text-xs font-mono">{gold.toLocaleString()}G</span>
                          <span className="text-[var(--color-accent)] text-xs font-mono">{items} items</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Aggregated Materials */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical">
                  {plans.length > 1 ? 'Aggregated Materials' : 'Required Materials'}
                </h2>
                {aggregated.length > 0 && (
                  <span className="text-[10px] font-mono text-[var(--color-text-tertiary)]">{completedItems}/{aggregated.length} COMPLETE</span>
                )}
              </div>
              <div className="p-4">
                {aggregated.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp size={32} className="mx-auto mb-3 text-[var(--color-text-tertiary)] opacity-50" />
                    <p className="text-[var(--color-text-tertiary)] text-sm">Add operators and set targets to see materials</p>
                  </div>
                ) : (
                  <>
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] uppercase">Collection Progress</span>
                        <span className="text-[10px] font-mono text-[var(--color-accent)]">
                          {aggregated.length > 0 ? Math.round((completedItems / aggregated.length) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-hidden">
                        <div
                          className="h-full bg-[var(--color-accent)] transition-all duration-500"
                          style={{ width: `${aggregated.length > 0 ? (completedItems / aggregated.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {aggregated.map(m => (
                        <MaterialRow
                          key={m.id}
                          id={m.id}
                          count={m.count}
                          owned={inventory[m.id] || 0}
                          onOwnedChange={(val) => setInventory(prev => ({ ...prev, [m.id]: val }))}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Farming Tips */}
            {aggregated.length > 0 && (
              <div className="p-4 bg-[var(--color-surface)] border-l-3 border-l-[var(--color-accent)] border border-[var(--color-border)] clip-corner-tl">
                <h3 className="font-bold text-white text-sm mb-2">Farming Tips</h3>
                <ul className="text-xs text-[var(--color-text-tertiary)] space-y-1">
                  <li>Fungi (Boletes, Bloodcap, Cosmagaric) are farmed from exploration zones in Talos-II</li>
                  <li>Crystal plants (Kalkodendra, Chrysodendra, Vitrodendra) drop from specific skill-material stages</li>
                  <li>Specialize materials drop from high-difficulty challenge stages</li>
                  <li>Mark of Perseverance (Crown) is a rare endgame material for skill level 10+</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical">Material Inventory</h2>
                <div className="flex gap-2">
                  <button
                    onClick={resetInventory}
                    className="px-3 py-1 text-[10px] bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-red-400 text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw size={10} /> Reset
                  </button>
                </div>
              </div>
              <div className="p-4">
                {allMaterialIds.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={32} className="mx-auto mb-3 text-[var(--color-text-tertiary)] opacity-50" />
                    <p className="text-[var(--color-text-tertiary)] text-sm">Add operators to your plan first, then track your material inventory here</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-[var(--color-text-tertiary)] mb-4">
                      Enter the amount of each material you currently own. The planner will calculate what you still need to farm.
                    </p>
                    <div className="space-y-2">
                      {aggregated.map(m => (
                        <MaterialRow
                          key={m.id}
                          id={m.id}
                          count={m.count}
                          owned={inventory[m.id] || 0}
                          onOwnedChange={(val) => setInventory(prev => ({ ...prev, [m.id]: val }))}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Auto-save indicator */}
        <div className="mt-6 mb-8 flex items-center justify-center gap-2 text-[10px] text-[var(--color-text-tertiary)] font-mono">
          <Save size={10} /> Auto-saved to browser storage
        </div>
      </div>

      {/* Character Picker Modal */}
      {showPicker && (
        <CharacterPicker
          onSelect={addCharacter}
          existingSlugs={plans.map(p => p.slug)}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
