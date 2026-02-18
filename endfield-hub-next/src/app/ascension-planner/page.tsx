'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { CHARACTERS } from '@/lib/data';
import { Star, Download, Copy, TrendingUp, Crosshair, BookOpen } from 'lucide-react';
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

function MaterialRow({ id, count }: { id: string; count: number }) {
  const name = MATERIAL_ID_TO_NAME[id] || id;
  const iconUrl = MATERIAL_ICONS[name];
  const isGold = id === 'item_gold';

  return (
    <div className="flex items-center gap-3 p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl">
      <div className="w-10 h-10 shrink-0 clip-corner-tl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
        {iconUrl ? (
          <Image src={iconUrl} alt={name} width={40} height={40} className="w-10 h-10 object-contain" />
        ) : (
          <span className="text-xs text-[var(--color-text-tertiary)]">?</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{name}</p>
      </div>
      <span className={`font-bold text-lg font-mono shrink-0 ${isGold ? 'text-[#FFD700]' : 'text-[var(--color-accent)]'}`}>
        {isGold ? count.toLocaleString() : `×${count.toLocaleString()}`}
      </span>
    </div>
  );
}

function mergeMaterials(lists: MaterialCost[][]): MaterialCost[] {
  const totals: Record<string, number> = {};
  for (const list of lists) {
    for (const { id, count } of list) {
      totals[id] = (totals[id] || 0) + count;
    }
  }
  // Sort: gold first, then alphabetically by display name
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

export default function AscensionPlannerPage() {
  const [selectedSlug, setSelectedSlug] = useState('');
  const [currentBreak, setCurrentBreak] = useState(0);
  const [targetBreak, setTargetBreak] = useState(70);
  const [skillLevels, setSkillLevels] = useState<{ from: number; to: number }[]>([
    { from: 1, to: 1 },
    { from: 1, to: 1 },
    { from: 1, to: 1 },
    { from: 1, to: 1 },
  ]);

  const character = CHARACTERS.find(c => c.Slug === selectedSlug);
  const hasCharMats = !!CHAR_MATERIALS[selectedSlug];

  const materials = useMemo(() => {
    if (!selectedSlug || !hasCharMats) return [];

    const lists: MaterialCost[][] = [];

    // Break materials
    if (targetBreak > currentBreak) {
      lists.push(getBreakMaterials(selectedSlug, currentBreak, targetBreak));
    }

    // Skill materials for each group
    for (let g = 0; g < 4; g++) {
      const { from, to } = skillLevels[g];
      if (to > from) {
        lists.push(getSkillMaterials(selectedSlug, g, from, to));
      }
    }

    return mergeMaterials(lists);
  }, [selectedSlug, currentBreak, targetBreak, skillLevels, hasCharMats]);

  const setSkillLevel = (group: number, field: 'from' | 'to', value: number) => {
    setSkillLevels(prev => {
      const next = [...prev];
      next[group] = { ...next[group], [field]: value };
      // Ensure from <= to
      if (field === 'from' && value > next[group].to) {
        next[group].to = value;
      }
      if (field === 'to' && value < next[group].from) {
        next[group].from = value;
      }
      return next;
    });
  };

  const setAllSkillsTo = (to: number) => {
    setSkillLevels(prev => prev.map(s => ({ from: s.from, to: Math.max(s.from, to) })));
  };

  const exportPlanJSON = () => {
    const planData = {
      character: character?.Name,
      slug: selectedSlug,
      currentBreak,
      targetBreak,
      skillLevels: SKILL_GROUPS.map((g, i) => ({
        skill: g.label,
        from: skillLevels[i].from,
        to: skillLevels[i].to,
      })),
      materials: materials.map(m => ({
        id: m.id,
        name: MATERIAL_ID_TO_NAME[m.id] || m.id,
        count: m.count,
      })),
    };
    const data = JSON.stringify(planData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zerosanity-plan-${selectedSlug}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyPlanSummary = async () => {
    if (!character) return;
    let summary = `Ascension Plan: ${character.Name}\n`;
    summary += `Break: ${currentBreak} → ${targetBreak}\n`;
    for (let g = 0; g < 4; g++) {
      const { from, to } = skillLevels[g];
      if (to > from) {
        summary += `${SKILL_GROUPS[g].label}: Lv${from} → Lv${to}\n`;
      }
    }
    summary += `\nMaterials Needed:\n`;
    for (const m of materials) {
      const name = MATERIAL_ID_TO_NAME[m.id] || m.id;
      summary += `  ${name}: ${m.id === 'item_gold' ? m.count.toLocaleString() : '×' + m.count.toLocaleString()}\n`;
    }
    summary += `\nCreated with Zero Sanity - zerosanity.app`;
    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      // Silently fail in sandboxed environments
    }
  };

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader title="Operator Development" category="DEVELOPMENT" code="RIOS-ASC-001" icon={<Star size={28} />} />

        {/* Export/Share Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={exportPlanJSON}
            disabled={!selectedSlug || materials.length === 0}
            className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button
            onClick={copyPlanSummary}
            disabled={!selectedSlug || materials.length === 0}
            className="px-4 py-2 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-[var(--color-accent)]/90 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            <Copy className="w-4 h-4" />
            Copy Summary
          </button>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Column - Character + Inputs */}
          <div className="lg:col-span-2 space-y-4">
            {/* Character Selection */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <TrendingUp size={16} className="text-[var(--color-accent)]" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical">Operator Selection</h2>
              </div>
              <div className="p-4 space-y-3">
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white text-sm"
                >
                  <option value="">Choose an operator...</option>
                  {CHARACTERS.filter(c => CHAR_MATERIALS[c.Slug]).map(char => (
                    <option key={char.Slug} value={char.Slug}>
                      {char.Name} ({char.Rarity}★ {char.Role})
                    </option>
                  ))}
                </select>

                {character && (
                  <div className="flex items-center gap-3 p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl">
                    {CHARACTER_ICONS[character.Name] ? (
                      <Image src={CHARACTER_ICONS[character.Name]} alt={character.Name} width={48} height={48} className="w-12 h-12 object-contain" />
                    ) : (
                      <div className="w-12 h-12 bg-[var(--color-surface)] flex items-center justify-center">
                        <span className="text-lg font-bold text-white/20">{character.Name[0]}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-white font-bold">{character.Name}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: character.Rarity }, (_, i) => (
                            <Star key={i} size={12} fill="#FFE500" color="#FFE500" />
                          ))}
                        </div>
                        <span className="text-xs text-[var(--color-text-tertiary)]">{character.Role} / {character.Element}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Break Level Selection */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <Crosshair size={16} className="text-[var(--color-accent)]" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical">Break Level</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[var(--color-text-tertiary)] uppercase tracking-wider">Current</label>
                  <select
                    value={currentBreak}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCurrentBreak(val);
                      if (val >= targetBreak) setTargetBreak(BREAK_LEVELS[BREAK_LEVELS.indexOf(val) + 1] || val);
                    }}
                    className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white text-sm"
                  >
                    {BREAK_LEVELS.slice(0, -1).map(lv => (
                      <option key={lv} value={lv}>{lv === 0 ? 'None (Lv 1)' : `Break ${lv}`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[var(--color-text-tertiary)] uppercase tracking-wider">Target</label>
                  <select
                    value={targetBreak}
                    onChange={(e) => setTargetBreak(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white text-sm"
                  >
                    {BREAK_LEVELS.filter(lv => lv > currentBreak).map(lv => (
                      <option key={lv} value={lv}>Break {lv}{lv === 70 ? ' (Max)' : ''}</option>
                    ))}
                    {BREAK_LEVELS.filter(lv => lv > currentBreak).length === 0 && (
                      <option value={currentBreak}>Already maxed</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Skill Level Selection */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-[var(--color-accent)]" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical">Skill Levels</h2>
                </div>
                <div className="flex gap-1">
                  {[6, 9, 12].map(lv => (
                    <button
                      key={lv}
                      onClick={() => setAllSkillsTo(lv)}
                      className="px-2 py-0.5 text-[10px] bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-text-tertiary)] hover:text-white transition-colors"
                    >
                      All→{lv}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 space-y-3">
                {SKILL_GROUPS.map((group, g) => (
                  <div key={g} className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-text-tertiary)] w-24 shrink-0 truncate">{group.label}</span>
                    <select
                      value={skillLevels[g].from}
                      onChange={(e) => setSkillLevel(g, 'from', Number(e.target.value))}
                      className="flex-1 px-2 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white text-xs"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(lv => (
                        <option key={lv} value={lv}>Lv {lv}</option>
                      ))}
                    </select>
                    <span className="text-[var(--color-text-tertiary)] text-xs">→</span>
                    <select
                      value={skillLevels[g].to}
                      onChange={(e) => setSkillLevel(g, 'to', Number(e.target.value))}
                      className="flex-1 px-2 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white text-xs"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).filter(lv => lv >= skillLevels[g].from).map(lv => (
                        <option key={lv} value={lv}>Lv {lv}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Materials Required */}
          <div className="lg:col-span-3">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical">Required Materials</h2>
                {materials.length > 0 && (
                  <span className="text-[10px] font-mono text-[var(--color-text-tertiary)]">{materials.length} ITEMS</span>
                )}
              </div>
              <div className="p-4">
                {!selectedSlug ? (
                  <div className="text-center py-16">
                    <TrendingUp size={32} className="mx-auto mb-3 text-[var(--color-text-tertiary)] opacity-50" />
                    <p className="text-[var(--color-text-tertiary)] text-sm">Select an operator to begin planning</p>
                  </div>
                ) : materials.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-[var(--color-text-tertiary)] text-sm">Set target break or skill levels to calculate materials</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {materials.map(m => (
                      <MaterialRow key={m.id} id={m.id} count={m.count} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Farming Tips */}
            {materials.length > 0 && (
              <div className="mt-4 p-4 bg-[var(--color-surface)] border-l-3 border-l-[var(--color-accent)] border border-[var(--color-border)] clip-corner-tl">
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
        </div>
      </div>
    </div>
  );
}
