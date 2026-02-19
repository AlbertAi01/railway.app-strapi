'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Star, FlaskConical, Search, MapPin, Sword, CheckCircle, Cloud, CloudOff, Loader2 } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { WEAPON_ICONS } from '@/lib/assets';
import { useAuthStore } from '@/store/authStore';
import { syncToCloud, loadFromCloud } from '@/lib/userSync';
import {
  WEAPON_ESSENCES, FARMING_ZONES, PRIMARY_ATTRS, SECONDARY_STATS, SKILL_STATS,
  findCompatibleWeapons, getBestZones, calculateDropChance,
  computeOptimalPreEngrave, getWeaponLabel, rankZones, getWeaponZoneMatch,
  type PrimaryAttr, type SecondaryStat, type SkillStat, type WeaponEssence, type FarmingZone,
  type PreEngraveConfig, type DropChanceBreakdown,
} from '@/data/essences';

const RARITY_COLORS: Record<number, string> = { 6: '#FF8C00', 5: '#C0A000', 4: '#9B59B6', 3: '#3498DB' };

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-mono font-bold transition-all border-b-2 whitespace-nowrap ${
        active
          ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-surface)]'
          : 'border-transparent text-[var(--color-text-tertiary)] hover:text-white hover:bg-[var(--color-surface-2)]'
      }`}
    >
      {icon} <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function StatPill({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold transition-colors border ${
        active
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]'
      }`}
      style={active && color ? { borderColor: color, color, backgroundColor: `${color}15` } : {}}
    >
      {label}
    </button>
  );
}

// Probability breakdown bar component
function ProbabilityBar({ breakdown, compact }: { breakdown: DropChanceBreakdown; compact?: boolean }) {
  const pPct = (breakdown.primaryChance * 100).toFixed(1);
  const sPct = (breakdown.secondaryChance * 100).toFixed(1);
  const kPct = (breakdown.skillChance * 100).toFixed(1);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-[9px] font-mono">
        <span className="text-[var(--color-accent)]" title="Primary">{pPct}%</span>
        <span className="text-[var(--color-text-muted)]">x</span>
        <span className={breakdown.secondaryChance > 0 ? 'text-green-400' : 'text-red-400/70'} title="Secondary">{sPct}%</span>
        <span className="text-[var(--color-text-muted)]">x</span>
        <span className={breakdown.skillChance > 0 ? 'text-purple-400' : 'text-red-400/70'} title="Skill">{kPct}%</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-[8px] font-mono text-[var(--color-text-tertiary)] w-10 shrink-0">PRI</span>
        <div className="flex-1 h-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
          <div className="h-full bg-[var(--color-accent)]" style={{ width: `${breakdown.primaryChance * 100}%` }} />
        </div>
        <span className="text-[9px] font-mono text-[var(--color-accent)] w-10 text-right">{pPct}%</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[8px] font-mono text-[var(--color-text-tertiary)] w-10 shrink-0">SEC</span>
        <div className="flex-1 h-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
          <div className={`h-full ${breakdown.secondaryChance > 0 ? 'bg-green-500' : 'bg-red-500/30'}`} style={{ width: `${Math.min(breakdown.secondaryChance * 100, 100)}%` }} />
        </div>
        <span className={`text-[9px] font-mono w-10 text-right ${breakdown.secondaryChance > 0 ? 'text-green-400' : 'text-red-400/70'}`}>{sPct}%</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[8px] font-mono text-[var(--color-text-tertiary)] w-10 shrink-0">SKL</span>
        <div className="flex-1 h-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
          <div className={`h-full ${breakdown.skillChance > 0 ? 'bg-purple-500' : 'bg-red-500/30'}`} style={{ width: `${Math.min(breakdown.skillChance * 100, 100)}%` }} />
        </div>
        <span className={`text-[9px] font-mono w-10 text-right ${breakdown.skillChance > 0 ? 'text-purple-400' : 'text-red-400/70'}`}>{kPct}%</span>
      </div>
    </div>
  );
}

function WeaponCard({ weapon, matchInfo }: { weapon: WeaponEssence; matchInfo?: { matchCount: number; total: number; selectedPrimary?: PrimaryAttr | null; selectedSecondary?: SecondaryStat | null; selectedSkill?: SkillStat | null } }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const icon = WEAPON_ICONS[weapon.name];
  const rarityColor = RARITY_COLORS[weapon.rarity] || '#999';

  const isPrimaryMatch = matchInfo?.selectedPrimary && weapon.primaryAttr === matchInfo.selectedPrimary;
  const isSecondaryMatch = matchInfo?.selectedSecondary && weapon.secondaryStat === matchInfo.selectedSecondary;
  const isSkillMatch = matchInfo?.selectedSkill && weapon.skillStat === matchInfo.selectedSkill;

  return (
    <div
      className="group bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl overflow-hidden hover:border-[var(--color-accent)] transition-all relative"
      style={{ borderBottomColor: rarityColor, borderBottomWidth: '3px' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-start gap-4 p-4">
        <div className="relative w-20 h-20 shrink-0">
          <div className="w-full h-full bg-[var(--color-surface)] flex items-center justify-center overflow-hidden group-hover:bg-[var(--color-surface-2)] transition-colors">
            {icon ? (
              <Image src={icon} alt={weapon.name} width={80} height={80} className="w-20 h-20 object-contain group-hover:scale-110 transition-transform" unoptimized />
            ) : (
              <Sword size={24} className="text-[var(--color-text-tertiary)]" />
            )}
          </div>
          <div className="absolute -top-1 -right-1 bg-[var(--color-accent)] text-black px-1.5 py-0.5 clip-corner-tl">
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider">{weapon.type.substring(0, 3)}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-white text-sm font-bold group-hover:text-[var(--color-accent)] transition-colors">{weapon.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-mono font-bold" style={{ color: rarityColor }}>{weapon.rarity}★</span>
                <span className="text-[9px] font-mono text-[var(--color-text-tertiary)] uppercase tracking-wider">{weapon.type}</span>
              </div>
            </div>
            {matchInfo && (
              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 shrink-0 clip-corner-tl ${
                matchInfo.matchCount === matchInfo.total ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {matchInfo.matchCount}/{matchInfo.total}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className={`text-[10px] font-mono px-2 py-1 border clip-corner-tl ${isPrimaryMatch ? 'border-green-500 bg-green-500/15 text-green-400' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)]'}`}>
              {isPrimaryMatch && <span className="mr-0.5">✓</span>}P:{weapon.primaryAttr.replace(' Boost', '')}
            </span>
            {weapon.secondaryStat && (
              <span className={`text-[10px] font-mono px-2 py-1 border clip-corner-tl ${isSecondaryMatch ? 'border-green-500 bg-green-500/15 text-green-400' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)]'}`}>
                {isSecondaryMatch && <span className="mr-0.5">✓</span>}S:{weapon.secondaryStat.replace(' Boost', '')}
              </span>
            )}
            <span className={`text-[10px] font-mono px-2 py-1 border clip-corner-tl ${isSkillMatch ? 'border-green-500 bg-green-500/15 text-green-400' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)]'}`}>
              {isSkillMatch && <span className="mr-0.5">✓</span>}K:{weapon.skillStat}
            </span>
          </div>
        </div>
      </div>
      {showTooltip && (
        <div className="absolute left-0 right-0 bottom-full mb-2 bg-[var(--color-surface)] border-2 border-[var(--color-accent)] clip-corner-tl p-3 z-50 shadow-lg shadow-[var(--color-accent)]/20">
          <div className="text-[10px] font-mono space-y-1">
            <div className="text-[var(--color-accent)] font-bold mb-2 flex items-center gap-2">
              <span className="border-l-2 border-[var(--color-accent)] pl-1">ESSENCE REQUIREMENTS</span>
            </div>
            <div className="grid gap-1">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-tertiary)]">PRIMARY:</span>
                <span className="text-white">{weapon.primaryAttr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-tertiary)]">SECONDARY:</span>
                <span className="text-white">{weapon.secondaryStat || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-tertiary)]">SKILL:</span>
                <span className="text-white">{weapon.skillStat}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ZoneCard({ zone, weapons, expanded, onToggle }: { zone: FarmingZone; weapons: WeaponEssence[]; expanded: boolean; onToggle: () => void }) {
  const perfectWeapons = weapons.filter(w => {
    const score = getBestZones(w).find(z => z.zone.id === zone.id);
    return score && score.score.matched === score.score.total;
  });

  const partialWeapons = weapons.filter(w => {
    const score = getBestZones(w).find(z => z.zone.id === zone.id);
    return score && score.score.matched < score.score.total && score.score.matched > 0;
  });

  const totalCompatibility = perfectWeapons.length + partialWeapons.length;
  const compatibilityPercent = totalCompatibility > 0 ? Math.round((perfectWeapons.length / totalCompatibility) * 100) : 0;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden hover:border-[var(--color-accent)] transition-all group">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] transition-colors text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={14} className="text-[var(--color-accent)]" />
            <span className="text-white text-sm font-bold font-mono">{zone.name}</span>
            <span className="text-[9px] font-mono px-2 py-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] clip-corner-tl">{zone.region}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-[var(--color-text-tertiary)]">TARGET: {zone.enemy}</span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[9px] font-mono">
              <span className="text-[var(--color-text-tertiary)]">PERFECT MATCH RATE</span>
              <span className="text-[var(--color-accent)] font-bold">{perfectWeapons.length}/{totalCompatibility} ({compatibilityPercent}%)</span>
            </div>
            <div className="h-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-[var(--color-accent)] transition-all duration-300"
                style={{ width: `${compatibilityPercent}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <div className="text-right space-y-0.5">
            <div className="text-[10px] font-mono font-bold text-green-400">{perfectWeapons.length} PERFECT</div>
            {partialWeapons.length > 0 && (
              <div className="text-[10px] font-mono text-yellow-400">{partialWeapons.length} PARTIAL</div>
            )}
          </div>
          <svg className={`w-4 h-4 text-[var(--color-text-tertiary)] transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {expanded && (
        <div className="p-4 space-y-4 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-2)]">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[var(--color-surface-2)] border-l-3 border-l-[var(--color-accent)] border border-[var(--color-border)] p-3 clip-corner-tl">
              <p className="text-[9px] font-mono text-[var(--color-accent)] uppercase tracking-wider mb-2 font-bold">SECONDARY STATS [{zone.secondaryStats.length}]</p>
              <div className="flex flex-wrap gap-1.5">
                {zone.secondaryStats.map(s => (
                  <span key={s} className="text-[10px] font-mono px-2 py-0.5 border border-[var(--color-border)] text-[var(--color-text-secondary)] bg-[var(--color-surface)] clip-corner-tl">{s.replace(' Boost', '')}</span>
                ))}
              </div>
            </div>
            <div className="bg-[var(--color-surface-2)] border-l-3 border-l-[var(--color-accent)] border border-[var(--color-border)] p-3 clip-corner-tl">
              <p className="text-[9px] font-mono text-[var(--color-accent)] uppercase tracking-wider mb-2 font-bold">SKILL STATS [{zone.skillStats.length}]</p>
              <div className="flex flex-wrap gap-1.5">
                {zone.skillStats.map(s => (
                  <span key={s} className="text-[10px] font-mono px-2 py-0.5 border border-[var(--color-border)] text-[var(--color-text-secondary)] bg-[var(--color-surface)] clip-corner-tl">{s}</span>
                ))}
              </div>
            </div>
          </div>
          {perfectWeapons.length > 0 && (
            <div className="bg-[var(--color-surface-2)] border border-green-500/30 p-3 clip-corner-tl">
              <p className="text-[9px] font-mono text-green-400 uppercase tracking-wider mb-2 font-bold flex items-center gap-2">
                <CheckCircle size={12} />
                PERFECT COMPATIBILITY (3/3) [{perfectWeapons.length}]
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {perfectWeapons.map(w => {
                  const wpnIcon = WEAPON_ICONS[w.name];
                  return (
                    <div key={w.name} className="flex items-center gap-1.5 px-2 py-2 bg-[var(--color-surface)] border border-green-500/30 hover:border-green-500 transition-colors clip-corner-tl group/weapon">
                      <div className="w-8 h-8 flex items-center justify-center bg-[var(--color-surface-2)]">
                        {wpnIcon ? (
                          <Image src={wpnIcon} alt={w.name} width={32} height={32} className="w-8 h-8 object-contain group-hover/weapon:scale-110 transition-transform" />
                        ) : (
                          <Sword size={14} className="text-[var(--color-text-tertiary)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-mono text-white truncate font-bold">{w.name}</p>
                        <span className="text-[8px] font-mono" style={{ color: RARITY_COLORS[w.rarity] }}>{w.rarity}★ {w.type}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Tab: Farming Optimizer
function FarmingOptimizer({ selectedWeapons, setSelectedWeapons }: { selectedWeapons: string[]; setSelectedWeapons: (v: string[] | ((prev: string[]) => string[])) => void }) {
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [rarityFilter, setRarityFilter] = useState<number[]>([]);

  const weapons4plus = WEAPON_ESSENCES.filter(w => w.rarity >= 4);

  const filteredWeapons = weapons4plus.filter(w => {
    if (selectedWeapons.includes(w.name)) return false;
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter.length > 0 && !typeFilter.includes(w.type)) return false;
    if (rarityFilter.length > 0 && !rarityFilter.includes(w.rarity)) return false;
    return true;
  });

  const selected = selectedWeapons.map(n => WEAPON_ESSENCES.find(w => w.name === n)!).filter(Boolean);
  const priorityWeapon = selected[0] || null;

  const preEngrave = useMemo<PreEngraveConfig | null>(() => {
    if (!priorityWeapon || selected.length === 0) return null;
    return computeOptimalPreEngrave(priorityWeapon, selected);
  }, [priorityWeapon, selected]);

  const weaponLabels = useMemo(() => {
    if (!preEngrave || !priorityWeapon) return new Map<string, string>();
    const labels = new Map<string, string>();
    for (const w of selected) {
      labels.set(w.name, getWeaponLabel(w, preEngrave, w.name === priorityWeapon.name));
    }
    return labels;
  }, [selected, preEngrave, priorityWeapon]);

  const perfectCount = Array.from(weaponLabels.values()).filter(l => l === 'Perfect' || l === 'Priority').length;
  const averageCount = Array.from(weaponLabels.values()).filter(l => l === 'Average').length;

  const zoneRankings = useMemo(() => {
    if (!priorityWeapon || selected.length === 0 || !preEngrave) return [];
    return rankZones(priorityWeapon, selected, preEngrave);
  }, [priorityWeapon, selected, preEngrave]);

  // Use the new calculateDropChance which returns full breakdowns
  const dropChances = useMemo(() => {
    if (!preEngrave || zoneRankings.length === 0) return new Map<string, DropChanceBreakdown>();
    const bestZone = zoneRankings[0].zone;
    const chances = new Map<string, DropChanceBreakdown>();
    for (const w of selected) {
      chances.set(w.name, calculateDropChance(w, bestZone, preEngrave));
    }
    return chances;
  }, [selected, preEngrave, zoneRankings]);

  const LABEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Priority': { bg: 'bg-[#FF8C00]/15', text: 'text-[#FF8C00]', border: 'border-[#FF8C00]' },
    'Perfect': { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/50' },
    'Average': { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  };

  return (
    <div className="space-y-6">
      {/* Weapon Selection */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <div className="flex items-center gap-2">
            <Sword size={16} className="text-[var(--color-accent)]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical">Select Your Weapons</h2>
          </div>
          {selected.length > 0 && (
            <button onClick={() => setSelectedWeapons([])} className="text-xs text-[var(--color-text-tertiary)] hover:text-white">Clear ({selected.length})</button>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-[var(--color-text-tertiary)] mb-3">Select the weapons you want to farm essences for. The first weapon is your priority -- we optimize pre-engrave and zone selection around it.</p>

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {selected.map((w, idx) => {
                const wpnIcon = WEAPON_ICONS[w.name];
                const rarityColor = RARITY_COLORS[w.rarity] || '#999';
                const isPriority = idx === 0;
                const label = weaponLabels.get(w.name) || 'Average';
                const lc = LABEL_COLORS[label] || LABEL_COLORS['Average'];
                return (
                  <div
                    key={w.name}
                    className={`relative flex items-center gap-3 px-4 py-3 border-2 transition-all clip-corner-tl group w-full sm:w-auto sm:flex-1 sm:min-w-[260px] ${lc.bg}`}
                    style={{ borderColor: isPriority ? '#FF8C00' : label === 'Perfect' ? 'rgba(34,197,94,0.5)' : 'var(--color-border)' }}
                  >
                    <button
                      onClick={() => {
                        const newSelected = [w.name, ...selectedWeapons.filter(n => n !== w.name)];
                        setSelectedWeapons(newSelected);
                      }}
                      className={`p-1.5 transition-all shrink-0 ${isPriority ? 'text-[#FF8C00]' : 'text-[var(--color-text-tertiary)] hover:text-[#FF8C00]'}`}
                      title="Set as priority weapon"
                    >
                      <Star size={18} fill={isPriority ? '#FF8C00' : 'none'} />
                    </button>
                    <div className="relative w-16 h-16 shrink-0">
                      <div
                        className="w-full h-full bg-[var(--color-surface)] flex items-center justify-center overflow-hidden group-hover:bg-[var(--color-surface-2)] transition-colors"
                        style={{ borderBottom: `3px solid ${rarityColor}` }}
                      >
                        {wpnIcon ? (
                          <Image src={wpnIcon} alt={w.name} width={64} height={64} className="w-16 h-16 object-contain group-hover:scale-110 transition-transform" unoptimized />
                        ) : (
                          <Sword size={20} className="text-[var(--color-text-tertiary)]" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold font-mono truncate">{w.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono font-bold" style={{ color: rarityColor }}>{w.rarity}★</span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 ${lc.bg} ${lc.text} border ${lc.border}`}>{label}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedWeapons(prev => prev.filter(n => n !== w.name))}
                      className="text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors p-1 shrink-0"
                      title="Remove weapon"
                    >
                      <span className="text-lg leading-none font-bold">&times;</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-2 px-4 py-2 border-l-3 border-l-[var(--color-accent)] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors text-sm text-white"
          >
            + Add Weapons
            <svg className={`w-3 h-3 transition-transform ${showPicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showPicker && (
            <div className="mt-3 p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl space-y-3">
              <input
                type="text" placeholder="Search weapons..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white text-xs font-mono"
              />
              <div className="flex flex-wrap gap-1.5">
                <StatPill label="All" active={rarityFilter.length === 0} onClick={() => setRarityFilter([])} />
                {[6, 5, 4].map(r => (
                  <StatPill key={r} label={`${r}★`} active={rarityFilter.includes(r)} onClick={() => setRarityFilter(prev => prev.includes(r) ? prev.filter(v => v !== r) : [...prev, r])} color={RARITY_COLORS[r]} />
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <StatPill label="All Types" active={typeFilter.length === 0} onClick={() => setTypeFilter([])} />
                {['Greatsword', 'Polearm', 'Handcannon', 'Sword', 'Arts Unit'].map(t => (
                  <StatPill key={t} label={t} active={typeFilter.includes(t)} onClick={() => setTypeFilter(prev => prev.includes(t) ? prev.filter(v => v !== t) : [...prev, t])} />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredWeapons.map(w => {
                  const wpnIcon = WEAPON_ICONS[w.name];
                  const rarityColor = RARITY_COLORS[w.rarity] || '#999';
                  return (
                    <button
                      key={w.name}
                      onClick={() => { setSelectedWeapons(prev => [...prev, w.name]); }}
                      className="group relative flex flex-col items-center bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all overflow-hidden clip-corner-tl"
                      style={{ borderBottomColor: rarityColor, borderBottomWidth: '3px' }}
                    >
                      <div className="absolute top-1 right-1 z-10 bg-[var(--color-accent)]/90 text-black px-1.5 py-0.5 clip-corner-tl opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[7px] font-mono font-bold uppercase tracking-wider">{w.type}</span>
                      </div>
                      <div className="w-full aspect-square bg-gradient-to-b from-[var(--color-surface-2)] to-[var(--color-surface)] flex items-center justify-center p-3 overflow-hidden relative">
                        {wpnIcon ? (
                          <Image src={wpnIcon} alt={w.name} width={120} height={120} className="w-full h-full object-contain group-hover:scale-125 transition-transform duration-300" unoptimized />
                        ) : (
                          <Sword size={32} className="text-[var(--color-text-tertiary)] group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                      <div className="w-full px-2 py-2 text-center bg-[var(--color-surface-2)]/80">
                        <p className="text-[10px] text-white font-bold font-mono truncate leading-tight mb-0.5">{w.name}</p>
                        <div className="flex items-center justify-center gap-1.5">
                          <p className="text-[9px] font-mono font-bold" style={{ color: rarityColor }}>{w.rarity}★</p>
                          <span className="text-[8px] font-mono text-[var(--color-text-tertiary)]">{w.type.substring(0, 3).toUpperCase()}</span>
                        </div>
                      </div>
                      {selectedWeapons.includes(w.name) && (
                        <div className="absolute inset-0 bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)] flex items-center justify-center backdrop-blur-sm">
                          <CheckCircle size={28} className="text-[var(--color-accent)] drop-shadow-lg" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {filteredWeapons.length === 0 && (
                <div className="text-center py-12">
                  <Search size={32} className="mx-auto mb-2 text-[var(--color-text-tertiary)] opacity-30" />
                  <p className="text-[11px] font-mono text-[var(--color-text-tertiary)]">No weapons match your filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Optimization Results */}
      {selected.length > 0 && preEngrave && (
        <div className="space-y-4">
          {/* Optimized Header */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-[#FF8C00]" fill="#FF8C00" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-tactical">Optimized for {selected[0].name}</h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                {perfectCount > 0 && <span className="text-green-400 font-bold">{perfectCount} Perfect</span>}
                {averageCount > 0 && <span className="text-yellow-400">{averageCount} Average</span>}
              </div>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Pre-engrave is optimized to guarantee a perfect essence for {selected[0].name}. Other weapons show their compatibility with this setup.
              </p>

              {/* Primary Attribute + Fixed Stat */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-[var(--color-accent)] text-xs font-bold font-mono">Primary Attribute ({preEngrave.primaryAttrs.length})</h4>
                    <span className="text-[9px] px-1.5 py-0.5 bg-[var(--color-accent)] text-black font-bold font-mono">Pick this</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {preEngrave.primaryAttrs.map(a => (
                      <span key={a} className="text-xs px-3 py-1.5 border border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-mono">
                        {a}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] italic font-mono">Primary attributes are available in all zones (1/3 chance each)</p>
                </div>
                <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-4">
                  <h4 className="text-[var(--color-accent)] text-xs font-bold mb-3 font-mono">Fixed Stat (Pre-Engrave)</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1.5 border font-mono ${preEngrave.fixedStatType === 'skill' ? 'border-purple-500/50 bg-purple-500/10 text-purple-400' : 'border-green-500/50 bg-green-500/10 text-green-400'}`}>
                      {preEngrave.fixedStat}
                    </span>
                    <span className="text-[9px] font-mono text-[var(--color-text-tertiary)] px-1.5 py-0.5 border border-[var(--color-border)] uppercase">
                      {preEngrave.fixedStatType}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] italic mt-2 font-mono">This stat is guaranteed on every essence you farm (100% chance)</p>
                </div>
              </div>

              {/* Weapon Match Breakdown with Drop Chances + Probability Bars */}
              <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
                  <span className="border-l-3 border-l-[var(--color-accent)] pl-2 text-xs font-mono font-bold text-white uppercase tracking-wider">Probability Breakdown</span>
                  {zoneRankings.length > 0 && (
                    <span className="ml-auto text-[9px] font-mono text-[var(--color-text-tertiary)]">
                      Perfect Drop at {zoneRankings[0].zone.name}
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  {/* Legend */}
                  <div className="flex items-center gap-4 text-[9px] font-mono text-[var(--color-text-tertiary)] pb-2 border-b border-[var(--color-border)]">
                    <span>Formula: <span className="text-[var(--color-accent)]">Primary</span> <span className="text-[var(--color-text-muted)]">&times;</span> <span className="text-green-400">Secondary</span> <span className="text-[var(--color-text-muted)]">&times;</span> <span className="text-purple-400">Skill</span> = <span className="text-white">Perfect %</span></span>
                  </div>
                  {selected.map((w) => {
                    const label = weaponLabels.get(w.name) || 'Average';
                    const lc = LABEL_COLORS[label] || LABEL_COLORS['Average'];
                    const breakdown = dropChances.get(w.name);
                    const chancePercent = breakdown ? breakdown.chance.toFixed(2) : '0.00';
                    return (
                      <div key={w.name} className={`p-3 border clip-corner-tl transition-all hover:border-[var(--color-accent)] ${lc.bg} ${lc.border}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-[var(--color-surface)] relative">
                            {WEAPON_ICONS[w.name] ? (
                              <Image src={WEAPON_ICONS[w.name]} alt={w.name} width={48} height={48} className="w-12 h-12 object-contain" unoptimized />
                            ) : <Sword size={20} className="text-[var(--color-text-tertiary)]" />}
                            {label === 'Priority' && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF8C00] rounded-full flex items-center justify-center">
                                <Star size={10} fill="#000" className="text-black" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-white text-xs sm:text-sm font-bold font-mono">{w.name}</p>
                              <span className={`text-[8px] font-mono px-1.5 py-0.5 font-bold ${lc.bg} ${lc.text} border ${lc.border}`}>{label.toUpperCase()}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <span className="text-[9px] font-mono px-1.5 py-0.5 border border-[var(--color-accent)]/30 text-[var(--color-accent)] bg-[var(--color-accent)]/5 clip-corner-tl">
                                {w.primaryAttr}
                              </span>
                              {w.secondaryStat && (
                                <span className={`text-[9px] font-mono px-1.5 py-0.5 border clip-corner-tl ${w.secondaryStat === preEngrave.fixedStat ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)]'}`}>
                                  {w.secondaryStat}{w.secondaryStat === preEngrave.fixedStat ? ' (FIXED)' : ''}
                                </span>
                              )}
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 border clip-corner-tl ${w.skillStat === preEngrave.fixedStat ? 'border-purple-500/50 text-purple-400 bg-purple-500/10' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)]'}`}>
                                {w.skillStat}{w.skillStat === preEngrave.fixedStat ? ' (FIXED)' : ''}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-lg font-mono font-bold block ${breakdown && breakdown.chance > 0 ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)]'}`}>
                              {chancePercent}%
                            </span>
                            <span className="text-[8px] font-mono text-[var(--color-text-tertiary)]">perfect drop</span>
                          </div>
                        </div>
                        {/* Probability breakdown bars */}
                        {breakdown && (
                          <div className="ml-15 pl-15">
                            <ProbabilityBar breakdown={breakdown} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-3 pt-2 border-t border-[var(--color-border)] text-[9px] font-mono text-[var(--color-text-tertiary)]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[var(--color-accent)] inline-block"></span> Primary (33.3%)</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 inline-block"></span> Secondary (zone pool)</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-purple-500 inline-block"></span> Skill (zone pool)</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[var(--color-accent)] inline-block rotate-45"></span> Fixed = 100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Farming Zone */}
          <div className="bg-[var(--color-surface)] border-l-3 border-l-[var(--color-accent)] border border-[var(--color-border)] clip-corner-tl p-3">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin size={16} className="text-[var(--color-accent)]" />
              Farming Zone Rankings
            </h3>
            <p className="text-[10px] font-mono text-[var(--color-text-tertiary)] mt-1">Only showing zones where your priority weapon can achieve a perfect 3/3 essence. Priority weapon is weighted 10x in scoring.</p>
          </div>

          {zoneRankings.length === 0 && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-8 text-center">
              <MapPin size={32} className="mx-auto mb-2 text-[var(--color-text-tertiary)] opacity-30" />
              <p className="text-sm font-mono text-white mb-1">No compatible zones found</p>
              <p className="text-[10px] font-mono text-[var(--color-text-tertiary)]">No farming zone can produce a perfect essence for the priority weapon with this pre-engrave configuration.</p>
            </div>
          )}

          {zoneRankings.map((ranking, idx) => {
            const { zone, score, perfectCount: zPerfect, goodCount: zGood, weaponMatches, weaponChances } = ranking;
            const isTopChoice = idx === 0;

            const perfectWeapons = weaponMatches.filter(m => m.level === 'perfect');
            const goodWeapons = weaponMatches.filter(m => m.level === 'good');
            const partialWeapons = weaponMatches.filter(m => m.level === 'partial');

            return (
              <div key={zone.id} className={`bg-[var(--color-surface)] border clip-corner-tl overflow-hidden ${isTopChoice ? 'border-[var(--color-accent)] shadow-lg shadow-[var(--color-accent)]/20' : 'border-[var(--color-border)]'}`}>
                {/* Zone Header */}
                <div className={`px-4 py-3 border-b border-[var(--color-border)] ${isTopChoice ? 'bg-[var(--color-accent)]/10' : 'bg-[var(--color-surface-2)]'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isTopChoice && <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-[var(--color-accent)] text-black clip-corner-tl">RECOMMENDED</span>}
                      {!isTopChoice && <span className="text-[9px] font-mono font-bold text-[var(--color-text-tertiary)]">#{idx + 1}</span>}
                      <span className="text-white text-sm font-bold font-mono">Severe Energy Alluvium: {zone.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 border border-[var(--color-border)] text-[var(--color-text-tertiary)] clip-corner-tl">{zone.region}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-bold font-mono text-[var(--color-accent)]">{Math.round(score)} pts</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span className="text-[var(--color-text-tertiary)]">vs. {zone.enemy}</span>
                    <div className="flex items-center gap-2 ml-auto">
                      {zPerfect > 0 && <span className="text-green-400 font-bold">{zPerfect} perfect</span>}
                      {zGood > 0 && <span className="text-yellow-400">{zGood} good</span>}
                    </div>
                  </div>
                </div>

                {/* Weapon Breakdown grouped by match level with probability */}
                <div className="p-4 space-y-3">
                  {perfectWeapons.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-[9px] font-mono font-bold text-green-400 uppercase">
                        <CheckCircle size={12} /> Perfect (3/3) — All Stats in Zone
                      </div>
                      <div className="space-y-1.5">
                        {perfectWeapons.map(m => {
                          const chance = weaponChances.get(m.weapon.name);
                          return (
                            <div key={m.weapon.name} className="flex items-center gap-3 p-2.5 bg-green-500/5 border border-green-500/20 clip-corner-tl">
                              <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-[var(--color-surface)]">
                                {WEAPON_ICONS[m.weapon.name] ? (
                                  <Image src={WEAPON_ICONS[m.weapon.name]} alt={m.weapon.name} width={40} height={40} className="w-10 h-10 object-contain" unoptimized />
                                ) : <Sword size={16} className="text-[var(--color-text-tertiary)]" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-white text-xs font-bold font-mono">{m.weapon.name}</p>
                                  <span className="text-[8px] font-mono" style={{ color: RARITY_COLORS[m.weapon.rarity] }}>{m.weapon.rarity}★</span>
                                </div>
                                {chance && <ProbabilityBar breakdown={chance} compact />}
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-green-400 font-mono font-bold text-sm">{chance ? chance.chance.toFixed(2) : '0'}%</span>
                                <span className="block text-[8px] font-mono text-[var(--color-text-tertiary)]">perfect</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {goodWeapons.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-[9px] font-mono font-bold text-yellow-400 uppercase">
                        Good (2/3) — Partial Match
                      </div>
                      <div className="space-y-1.5">
                        {goodWeapons.map(m => {
                          const chance = weaponChances.get(m.weapon.name);
                          return (
                            <div key={m.weapon.name} className="flex items-center gap-3 p-2.5 bg-yellow-500/5 border border-yellow-500/20 clip-corner-tl">
                              <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-[var(--color-surface)]">
                                {WEAPON_ICONS[m.weapon.name] ? (
                                  <Image src={WEAPON_ICONS[m.weapon.name]} alt={m.weapon.name} width={40} height={40} className="w-10 h-10 object-contain" unoptimized />
                                ) : <Sword size={16} className="text-[var(--color-text-tertiary)]" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-white text-xs font-bold font-mono">{m.weapon.name}</p>
                                  <span className="text-[8px] font-mono" style={{ color: RARITY_COLORS[m.weapon.rarity] }}>{m.weapon.rarity}★</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {m.details.map((d, i) => (
                                    <span key={i} className={`text-[9px] font-mono px-1.5 py-0.5 ${d.matched ? 'text-green-400' : 'text-red-400/70'}`}>
                                      {d.matched ? '✓' : '✗'} {d.stat.replace(' Boost', '')}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <span className="text-yellow-400 font-mono font-bold text-xs shrink-0">{m.matchCount}/{m.total}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {partialWeapons.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-[9px] font-mono font-bold text-[var(--color-text-tertiary)] uppercase">
                        Partial (1/3) — Single Affix
                      </div>
                      <div className="space-y-1.5">
                        {partialWeapons.map(m => (
                          <div key={m.weapon.name} className="flex items-center gap-3 p-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl">
                            <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-[var(--color-surface)]">
                              {WEAPON_ICONS[m.weapon.name] ? (
                                <Image src={WEAPON_ICONS[m.weapon.name]} alt={m.weapon.name} width={40} height={40} className="w-10 h-10 object-contain" unoptimized />
                              ) : <Sword size={16} className="text-[var(--color-text-tertiary)]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-white text-xs font-bold font-mono">{m.weapon.name}</p>
                                <span className="text-[8px] font-mono" style={{ color: RARITY_COLORS[m.weapon.rarity] }}>{m.weapon.rarity}★</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {m.details.map((d, i) => (
                                  <span key={i} className={`text-[9px] font-mono px-1.5 py-0.5 ${d.matched ? 'text-green-400' : 'text-red-400/70'}`}>
                                    {d.matched ? '✓' : '✗'} {d.stat.replace(' Boost', '')}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <span className="text-[var(--color-text-tertiary)] font-mono font-bold text-xs shrink-0">{m.matchCount}/{m.total}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Pre-Engrave */}
                  {isTopChoice && (
                    <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                      <p className="text-[9px] font-mono text-[var(--color-accent)] font-bold uppercase mb-2">Recommended Pre-Engrave</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {preEngrave.primaryAttrs.map(a => (
                          <span key={a} className="text-[10px] font-mono px-2 py-1 border border-[var(--color-accent)]/30 text-[var(--color-accent)] bg-[var(--color-accent)]/5 clip-corner-tl">{a}</span>
                        ))}
                        <span className="text-[var(--color-text-tertiary)] font-mono">+</span>
                        <span className={`text-[10px] font-mono px-2 py-1 border clip-corner-tl ${preEngrave.fixedStatType === 'skill' ? 'border-purple-500/30 text-purple-400 bg-purple-500/5' : 'border-green-500/30 text-green-400 bg-green-500/5'}`}>
                          {preEngrave.fixedStat}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Zone Stat Pool */}
                  <details className="mt-2">
                    <summary className="text-[9px] font-mono text-[var(--color-text-tertiary)] cursor-pointer hover:text-white transition-colors">
                      View zone stat pool ({zone.secondaryStats.length} secondary, {zone.skillStats.length} skill)
                    </summary>
                    <div className="grid md:grid-cols-3 gap-3 mt-2">
                      <div>
                        <p className="text-[8px] font-mono text-[var(--color-accent)] uppercase mb-1 font-bold">Primary Attribute</p>
                        <div className="flex flex-wrap gap-1">
                          {PRIMARY_ATTRS.map(a => (
                            <span key={a} className="text-[8px] font-mono px-1 py-0.5 border border-[var(--color-border)] text-[var(--color-text-tertiary)]">{a.replace(' Boost', '')}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[8px] font-mono text-green-400 uppercase mb-1 font-bold">Secondary Stat (1/{zone.secondaryStats.length} = {(100/zone.secondaryStats.length).toFixed(1)}%)</p>
                        <div className="flex flex-wrap gap-1">
                          {zone.secondaryStats.map(s => (
                            <span key={s} className="text-[8px] font-mono px-1 py-0.5 border border-[var(--color-border)] text-[var(--color-text-tertiary)]">{s.replace(' Boost', '')}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[8px] font-mono text-purple-400 uppercase mb-1 font-bold">Skill Stat (1/{zone.skillStats.length} = {(100/zone.skillStats.length).toFixed(1)}%)</p>
                        <div className="flex flex-wrap gap-1">
                          {zone.skillStats.map(s => (
                            <span key={s} className="text-[8px] font-mono px-1 py-0.5 border border-[var(--color-border)] text-[var(--color-text-tertiary)]">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {selected.length === 0 && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-12 text-center">
          <Sword size={48} className="mx-auto mb-3 text-[var(--color-text-tertiary)] opacity-30" />
          <p className="text-sm font-mono text-white mb-2">Select at least one weapon to see farming zone recommendations</p>
          <p className="text-[10px] font-mono text-[var(--color-text-tertiary)]">Click &quot;Add Weapons&quot; above to get started</p>
        </div>
      )}
    </div>
  );
}

// Tab: Essence Checker
function EssenceChecker() {
  const [primary, setPrimary] = useState<PrimaryAttr | null>(null);
  const [secondary, setSecondary] = useState<SecondaryStat | null>(null);
  const [skill, setSkill] = useState<SkillStat | null>(null);

  const results = useMemo(() => {
    if (!primary && !secondary && !skill) return [];
    return findCompatibleWeapons(primary, secondary, skill);
  }, [primary, secondary, skill]);

  const hasSelection = primary || secondary || skill;
  const selectionCount = [primary, secondary, skill].filter(Boolean).length;
  const perfectMatches = results.filter(r => r.matchCount === r.total);
  const partialMatches = results.filter(r => r.matchCount < r.total);

  return (
    <div className="space-y-6">
      {/* Step-by-step flow */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Step 1 */}
        <div className={`bg-[var(--color-surface)] border-2 clip-corner-tl p-4 transition-all ${primary ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[var(--color-accent)] text-lg font-mono font-bold">01</span>
            <h3 className="text-xs font-mono font-bold text-white uppercase">Primary Attribute</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <StatPill label="None" active={!primary} onClick={() => setPrimary(null)} />
            {PRIMARY_ATTRS.map(a => (
              <StatPill key={a} label={a.replace(' Boost', '')} active={primary === a} onClick={() => setPrimary(primary === a ? null : a)} />
            ))}
          </div>
          {primary && (
            <div className="mt-2 text-[9px] font-mono text-green-400 flex items-center gap-1">
              <CheckCircle size={10} /> Selected: {primary}
            </div>
          )}
        </div>

        {/* Step 2 */}
        <div className={`bg-[var(--color-surface)] border-2 clip-corner-tl p-4 transition-all ${secondary ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[var(--color-accent)] text-lg font-mono font-bold">02</span>
            <h3 className="text-xs font-mono font-bold text-white uppercase">Secondary Stat</h3>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
            <StatPill label="None" active={!secondary} onClick={() => setSecondary(null)} />
            {SECONDARY_STATS.map(s => (
              <StatPill key={s} label={s.replace(' Boost', '')} active={secondary === s} onClick={() => setSecondary(secondary === s ? null : s)} />
            ))}
          </div>
          {secondary && (
            <div className="mt-2 text-[9px] font-mono text-green-400 flex items-center gap-1">
              <CheckCircle size={10} /> Selected: {secondary}
            </div>
          )}
        </div>

        {/* Step 3 */}
        <div className={`bg-[var(--color-surface)] border-2 clip-corner-tl p-4 transition-all ${skill ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[var(--color-accent)] text-lg font-mono font-bold">03</span>
            <h3 className="text-xs font-mono font-bold text-white uppercase">Skill Stat</h3>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
            <StatPill label="None" active={!skill} onClick={() => setSkill(null)} />
            {SKILL_STATS.map(s => (
              <StatPill key={s} label={s} active={skill === s} onClick={() => setSkill(skill === s ? null : s)} />
            ))}
          </div>
          {skill && (
            <div className="mt-2 text-[9px] font-mono text-green-400 flex items-center gap-1">
              <CheckCircle size={10} /> Selected: {skill}
            </div>
          )}
        </div>
      </div>

      {/* Current Selection Summary */}
      {hasSelection && (
        <div className="bg-[var(--color-surface)] border-l-3 border-l-[var(--color-accent)] border border-[var(--color-border)] clip-corner-tl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-mono font-bold text-white uppercase">Current Essence Configuration</h3>
            <button
              onClick={() => { setPrimary(null); setSecondary(null); setSkill(null); }}
              className="text-[9px] font-mono text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors"
            >
              CLEAR ALL
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {primary && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-accent)]/15 border border-[var(--color-accent)] clip-corner-tl">
                <span className="text-[9px] font-mono text-[var(--color-accent)] font-bold">P:</span>
                <span className="text-[10px] font-mono text-white">{primary}</span>
              </div>
            )}
            {secondary && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-accent)]/15 border border-[var(--color-accent)] clip-corner-tl">
                <span className="text-[9px] font-mono text-[var(--color-accent)] font-bold">S:</span>
                <span className="text-[10px] font-mono text-white">{secondary}</span>
              </div>
            )}
            {skill && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-accent)]/15 border border-[var(--color-accent)] clip-corner-tl">
                <span className="text-[9px] font-mono text-[var(--color-accent)] font-bold">K:</span>
                <span className="text-[10px] font-mono text-white">{skill}</span>
              </div>
            )}
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
              <span className="text-[9px] font-mono text-[var(--color-text-tertiary)]">STATS:</span>
              <span className="text-[10px] font-mono font-bold text-[var(--color-accent)]">{selectionCount}/3</span>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Search size={16} className="text-[var(--color-accent)]" />
            Compatible Weapons
          </h2>
          {hasSelection && results.length > 0 && (
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="text-green-400 font-bold">{perfectMatches.length} PERFECT</span>
              <span className="text-yellow-400">{partialMatches.length} PARTIAL</span>
              <span className="text-[var(--color-text-tertiary)]">TOTAL: {results.length}</span>
            </div>
          )}
        </div>
        <div className="p-4">
          {!hasSelection ? (
            <div className="text-center py-16 space-y-4">
              <FlaskConical size={48} className="mx-auto text-[var(--color-text-tertiary)] opacity-30" />
              <div>
                <p className="text-sm font-mono text-white mb-2">Select Essence Stats</p>
                <p className="text-[11px] font-mono text-[var(--color-text-tertiary)]">Choose at least one stat to find compatible weapons</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="text-[9px] font-mono px-2 py-1 border border-[var(--color-border)] text-[var(--color-text-tertiary)] clip-corner-tl">PRIMARY</div>
                <span className="text-[var(--color-text-tertiary)]">+</span>
                <div className="text-[9px] font-mono px-2 py-1 border border-[var(--color-border)] text-[var(--color-text-tertiary)] clip-corner-tl">SECONDARY</div>
                <span className="text-[var(--color-text-tertiary)]">+</span>
                <div className="text-[9px] font-mono px-2 py-1 border border-[var(--color-border)] text-[var(--color-text-tertiary)] clip-corner-tl">SKILL</div>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16">
              <Search size={48} className="mx-auto mb-3 text-red-400 opacity-30" />
              <p className="text-sm font-mono text-white mb-2">No Compatible Weapons</p>
              <p className="text-[11px] font-mono text-[var(--color-text-tertiary)]">Try adjusting your stat selection</p>
            </div>
          ) : (
            <>
              {perfectMatches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-green-500/10 border-l-3 border-l-green-500">
                    <CheckCircle size={14} className="text-green-400" />
                    <span className="text-[10px] font-mono font-bold text-green-400 uppercase">Perfect Matches ({perfectMatches.length})</span>
                    <span className="text-[9px] font-mono text-[var(--color-text-tertiary)]">All selected stats match</span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {perfectMatches.map(r => (
                      <WeaponCard
                        key={r.weapon.name}
                        weapon={r.weapon}
                        matchInfo={{
                          matchCount: r.matchCount,
                          total: r.total,
                          selectedPrimary: primary,
                          selectedSecondary: secondary,
                          selectedSkill: skill,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {partialMatches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-yellow-500/10 border-l-3 border-l-yellow-500">
                    <span className="text-yellow-400 text-lg leading-none">&#9888;</span>
                    <span className="text-[10px] font-mono font-bold text-yellow-400 uppercase">Partial Matches ({partialMatches.length})</span>
                    <span className="text-[9px] font-mono text-[var(--color-text-tertiary)]">Some stats match</span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {partialMatches.map(r => (
                      <WeaponCard
                        key={r.weapon.name}
                        weapon={r.weapon}
                        matchInfo={{
                          matchCount: r.matchCount,
                          total: r.total,
                          selectedPrimary: primary,
                          selectedSecondary: secondary,
                          selectedSkill: skill,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Tab: Farming Guide
function FarmingGuide() {
  const [expandedZone, setExpandedZone] = useState<string | null>(FARMING_ZONES[0]?.id || null);
  const weapons4plus = WEAPON_ESSENCES.filter(w => w.rarity >= 4);

  return (
    <div className="space-y-4">
      {/* Quick Reference Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[var(--color-surface)] border-l-3 border-l-[var(--color-accent)] border border-[var(--color-border)] clip-corner-tl p-4">
          <h3 className="text-white text-xs font-mono font-bold mb-3 flex items-center gap-2 uppercase tracking-wider">
            <MapPin size={14} className="text-[var(--color-accent)]" />
            Zone Selection Guide
          </h3>
          <div className="space-y-2 text-[10px] font-mono text-[var(--color-text-tertiary)]">
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] shrink-0">&#9656;</span>
              <span>Each zone drops unique secondary + skill stat combinations</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] shrink-0">&#9656;</span>
              <span>Primary attributes available in ALL zones (1/3 chance)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] shrink-0">&#9656;</span>
              <span>Match 3/3 stats for perfect essence compatibility</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] shrink-0">&#9656;</span>
              <span>Use pre-engrave to guarantee one stat per run</span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border-l-3 border-l-green-500 border border-[var(--color-border)] clip-corner-tl p-4">
          <h3 className="text-white text-xs font-mono font-bold mb-3 flex items-center gap-2 uppercase tracking-wider">
            <FlaskConical size={14} className="text-green-400" />
            Probability Math
          </h3>
          <div className="space-y-2 text-[10px] font-mono text-[var(--color-text-tertiary)]">
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span>Perfect drop = Primary (33.3%) x Secondary (1/pool) x Skill (1/pool)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span>Pre-engrave sets one stat to 100%, improving odds significantly</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span>Smaller stat pools = higher individual probability per stat</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span>Flawless (T5) essences only from Severe Energy Alluvium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zone Comparison Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <h3 className="text-white text-sm font-mono font-bold uppercase tracking-wider">Zone Comparison</h3>
          <p className="text-[10px] font-mono text-[var(--color-text-tertiary)] mt-1">Quick reference for all farming locations and their stat pool sizes</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] font-mono">
            <thead className="bg-[var(--color-surface-2)]">
              <tr className="border-b border-[var(--color-border)]">
                <th className="px-4 py-2 text-left text-[var(--color-accent)] font-bold uppercase">Zone</th>
                <th className="px-4 py-2 text-left text-[var(--color-accent)] font-bold uppercase">Region</th>
                <th className="px-4 py-2 text-left text-[var(--color-accent)] font-bold uppercase">Enemy</th>
                <th className="px-4 py-2 text-center text-green-400 font-bold uppercase">Secondary</th>
                <th className="px-4 py-2 text-center text-purple-400 font-bold uppercase">Skill</th>
                <th className="px-4 py-2 text-center text-[var(--color-accent)] font-bold uppercase">Perfect Wpns</th>
              </tr>
            </thead>
            <tbody>
              {FARMING_ZONES.map((zone, idx) => {
                const perfectCount = weapons4plus.filter(w => {
                  const score = getBestZones(w).find(z => z.zone.id === zone.id);
                  return score && score.score.matched === score.score.total;
                }).length;
                return (
                  <tr key={zone.id} className={`border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors ${idx % 2 === 0 ? 'bg-[var(--color-surface)]' : 'bg-[var(--color-surface-2)]/50'}`}>
                    <td className="px-4 py-3 text-white font-bold">{zone.name}</td>
                    <td className="px-4 py-3 text-[var(--color-text-tertiary)]">{zone.region}</td>
                    <td className="px-4 py-3 text-[var(--color-text-tertiary)]">{zone.enemy}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 clip-corner-tl">
                        {zone.secondaryStats.length} <span className="text-[8px] text-[var(--color-text-tertiary)]">({(100/zone.secondaryStats.length).toFixed(1)}%)</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 clip-corner-tl">
                        {zone.skillStats.length} <span className="text-[8px] text-[var(--color-text-tertiary)]">({(100/zone.skillStats.length).toFixed(1)}%)</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)] font-bold clip-corner-tl">
                        {perfectCount}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Zone Cards */}
      <div className="bg-[var(--color-surface)] border-l-3 border-l-[var(--color-accent)] border border-[var(--color-border)] clip-corner-tl p-3">
        <h3 className="text-white text-sm font-mono font-bold uppercase tracking-wider">Detailed Zone Information</h3>
        <p className="text-[10px] font-mono text-[var(--color-text-tertiary)] mt-1">Expand zones to see available stats and compatible weapons</p>
      </div>
      {FARMING_ZONES.map(zone => (
        <ZoneCard
          key={zone.id}
          zone={zone}
          weapons={weapons4plus}
          expanded={expandedZone === zone.id}
          onToggle={() => setExpandedZone(expandedZone === zone.id ? null : zone.id)}
        />
      ))}

      {/* Pro Tips */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-[var(--color-surface)] border-l-3 border-l-yellow-500 border border-[var(--color-border)] clip-corner-tl">
          <h3 className="font-bold font-mono text-white text-xs mb-3 uppercase flex items-center gap-2">
            <span className="text-yellow-400">&#9889;</span> Pre-Engrave Strategy
          </h3>
          <ul className="text-[10px] font-mono text-[var(--color-text-tertiary)] space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 shrink-0">1.</span>
              <span>Choose the stat shared by most of your target weapons</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 shrink-0">2.</span>
              <span>Fix it via pre-engrave (100% guarantee), leaving 2 random slots</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 shrink-0">3.</span>
              <span>Farm a zone where both remaining stats are in the pool</span>
            </li>
          </ul>
        </div>

        <div className="p-4 bg-[var(--color-surface)] border-l-3 border-l-[var(--color-accent)] border border-[var(--color-border)] clip-corner-tl">
          <h3 className="font-bold font-mono text-white text-xs mb-3 uppercase flex items-center gap-2">
            <span className="text-[var(--color-accent)]">&#10022;</span> Efficiency Tips
          </h3>
          <ul className="text-[10px] font-mono text-[var(--color-text-tertiary)] space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] shrink-0">&#9656;</span>
              <span>Prioritize zones matching multiple weapons</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] shrink-0">&#9656;</span>
              <span>Keep 2/3 essences as etching fodder</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] shrink-0">&#9656;</span>
              <span>Focus Flawless T5 for endgame builds (only from Severe Energy Alluvium)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const LOCAL_KEY = 'zerosanity-essence-solver';

export default function EssenceSolverPage() {
  const [activeTab, setActiveTab] = useState<'optimizer' | 'checker' | 'guide'>('optimizer');
  const [selectedWeapons, setSelectedWeapons] = useState<string[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { token } = useAuthStore();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    const load = async () => {
      if (token) {
        const cloud = await loadFromCloud('essenceSolver', token);
        if (cloud && typeof cloud === 'object' && Array.isArray((cloud as { selectedWeapons?: unknown }).selectedWeapons)) {
          const data = cloud as { selectedWeapons: string[] };
          setSelectedWeapons(data.selectedWeapons);
          localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
          setSyncStatus('synced');
          return;
        }
      }
      try {
        const raw = localStorage.getItem(LOCAL_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          if (Array.isArray(data.selectedWeapons)) setSelectedWeapons(data.selectedWeapons);
        }
      } catch { /* silent */ }
    };
    load();
  }, [token]);

  const saveState = useCallback((weapons: string[]) => {
    const data = { selectedWeapons: weapons };
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));

    if (token) {
      if (syncTimeout.current) clearTimeout(syncTimeout.current);
      setSyncStatus('syncing');
      syncTimeout.current = setTimeout(async () => {
        try {
          await syncToCloud('essenceSolver', data, token);
          setSyncStatus('synced');
        } catch {
          setSyncStatus('error');
        }
      }, 2000);
    }
  }, [token]);

  const handleSetSelectedWeapons = useCallback((v: string[] | ((prev: string[]) => string[])) => {
    setSelectedWeapons(prev => {
      const next = typeof v === 'function' ? v(prev) : v;
      saveState(next);
      return next;
    });
  }, [saveState]);

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-accent);
          clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 100% 100%, 0 100%);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-accent);
          opacity: 0.8;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media (max-width: 640px) {
          .clip-corner-tl {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%) !important;
          }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <RIOSHeader title="Essence Optimization" category="ANALYSIS" code="RIOS-ESS-001" icon={<FlaskConical size={28} />} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <p className="text-xs sm:text-sm text-[var(--color-text-tertiary)]">
            Calculate exact drop probabilities for weapon essences. Optimize pre-engrave setup, find your best farming zone, and understand the math behind perfect 3/3 drops.
          </p>
          {token && (
            <div className="flex items-center gap-1.5 shrink-0">
              {syncStatus === 'syncing' && <Loader2 size={14} className="text-[var(--color-accent)] animate-spin" />}
              {syncStatus === 'synced' && <Cloud size={14} className="text-green-400" />}
              {syncStatus === 'error' && <CloudOff size={14} className="text-red-400" />}
              <span className="text-[10px] font-mono text-[var(--color-text-tertiary)]">
                {syncStatus === 'syncing' ? 'Saving...' : syncStatus === 'synced' ? 'Synced' : syncStatus === 'error' ? 'Sync failed' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Tab Bar */}
        <div className="flex overflow-x-auto border-b border-[var(--color-border)] mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
          <TabButton active={activeTab === 'optimizer'} onClick={() => setActiveTab('optimizer')} icon={<Star size={14} />} label="Optimizer" />
          <TabButton active={activeTab === 'checker'} onClick={() => setActiveTab('checker')} icon={<Search size={14} />} label="Checker" />
          <TabButton active={activeTab === 'guide'} onClick={() => setActiveTab('guide')} icon={<MapPin size={14} />} label="Guide" />
        </div>

        {activeTab === 'optimizer' && <FarmingOptimizer selectedWeapons={selectedWeapons} setSelectedWeapons={handleSetSelectedWeapons} />}
        {activeTab === 'checker' && <EssenceChecker />}
        {activeTab === 'guide' && <FarmingGuide />}
      </div>
    </div>
  );
}
