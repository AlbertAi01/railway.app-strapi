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
  findCompatibleWeapons, getBestZones,
  type PrimaryAttr, type SecondaryStat, type SkillStat, type WeaponEssence, type FarmingZone,
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
        {/* Weapon Type Badge */}
        <div className="relative w-20 h-20 shrink-0">
          <div className="w-full h-full bg-[var(--color-surface)] flex items-center justify-center overflow-hidden group-hover:bg-[var(--color-surface-2)] transition-colors">
            {icon ? (
              <Image src={icon} alt={weapon.name} width={80} height={80} className="w-20 h-20 object-contain group-hover:scale-110 transition-transform" unoptimized />
            ) : (
              <Sword size={24} className="text-[var(--color-text-tertiary)]" />
            )}
          </div>
          {/* Weapon Type Icon Badge */}
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
      {/* Hover Tooltip */}
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
          {/* Compatibility Progress Bar */}
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

  // Calculate best zones for selected weapons
  const zoneScores = useMemo(() => {
    if (selected.length === 0) return [];
    return FARMING_ZONES.map(zone => {
      let totalMatched = 0;
      let totalPossible = 0;
      const weaponScores = selected.map(w => {
        const score = getBestZones(w).find(z => z.zone.id === zone.id);
        if (score) {
          totalMatched += score.score.matched;
          totalPossible += score.score.total;
        }
        return { weapon: w, score: score?.score };
      });
      return { zone, totalMatched, totalPossible, weaponScores };
    }).sort((a, b) => b.totalMatched - a.totalMatched);
  }, [selected]);

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
          <p className="text-xs text-[var(--color-text-tertiary)] mb-3">Select the weapons you want to farm essences for. We will calculate which zone gives you the best chance of getting useful essences.</p>

          {selected.length > 0 && (
            <div className="space-y-3 mb-4">
              {selected.map((w, idx) => {
                const wpnIcon = WEAPON_ICONS[w.name];
                const rarityColor = RARITY_COLORS[w.rarity] || '#999';
                const isPriority = idx === 0;
                return (
                  <div
                    key={w.name}
                    className={`flex items-center gap-3 px-4 py-3 border-2 transition-all clip-corner-tl group ${isPriority ? 'bg-gradient-to-r from-[var(--color-accent)]/10 to-transparent' : 'bg-[var(--color-surface-2)]'}`}
                    style={{ borderColor: isPriority ? '#FF8C00' : 'var(--color-border)' }}
                  >
                    {isPriority && (
                      <div className="absolute top-0 left-0 bg-[#FF8C00] text-black px-2 py-0.5 text-[8px] font-mono font-bold clip-corner-tl">
                        PRIORITY
                      </div>
                    )}
                    <button
                      onClick={() => {
                        const newSelected = [w.name, ...selectedWeapons.filter(n => n !== w.name)];
                        setSelectedWeapons(newSelected);
                      }}
                      className={`p-1.5 transition-all ${isPriority ? 'text-[#FF8C00]' : 'text-[var(--color-text-tertiary)] hover:text-[#FF8C00]'}`}
                      title="Set as priority weapon"
                    >
                      <Star size={18} fill={isPriority ? '#FF8C00' : 'none'} />
                    </button>
                    <div className="relative w-20 h-20 shrink-0">
                      <div
                        className="w-full h-full bg-[var(--color-surface)] flex items-center justify-center overflow-hidden group-hover:bg-[var(--color-surface-2)] transition-colors"
                        style={{ borderBottom: `3px solid ${rarityColor}` }}
                      >
                        {wpnIcon ? (
                          <Image src={wpnIcon} alt={w.name} width={80} height={80} className="w-20 h-20 object-contain group-hover:scale-110 transition-transform" unoptimized />
                        ) : (
                          <Sword size={24} className="text-[var(--color-text-tertiary)]" />
                        )}
                      </div>
                      {/* Weapon Type Badge */}
                      <div className="absolute -top-1 -right-1 bg-[var(--color-accent)] text-black px-1.5 py-0.5 clip-corner-tl">
                        <span className="text-[8px] font-mono font-bold uppercase">{w.type.substring(0, 3)}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold font-mono">{w.name}</p>
                      <div className="flex items-center gap-2 mt-1 mb-2">
                        <span className="text-xs font-mono font-bold" style={{ color: rarityColor }}>{w.rarity}★</span>
                        <span className="text-[9px] font-mono text-[var(--color-text-tertiary)] uppercase">{w.type}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 border border-[var(--color-border)] text-[var(--color-text-tertiary)] clip-corner-tl">
                          {w.primaryAttr.replace(' Boost', '')}
                        </span>
                        {w.secondaryStat && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 border border-[var(--color-border)] text-[var(--color-text-tertiary)] clip-corner-tl">
                            {w.secondaryStat.replace(' Boost', '')}
                          </span>
                        )}
                        <span className="text-[9px] font-mono px-1.5 py-0.5 border border-[var(--color-border)] text-[var(--color-text-tertiary)] clip-corner-tl">
                          {w.skillStat}
                        </span>
                      </div>
                      {isPriority && (
                        <div className="mt-2 text-[9px] font-mono text-[#FF8C00] flex items-center gap-1">
                          <CheckCircle size={10} /> Pre-engrave optimized for this weapon
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedWeapons(prev => prev.filter(n => n !== w.name))}
                      className="text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors p-2 ml-auto"
                      title="Remove weapon"
                    >
                      <span className="text-xl leading-none font-bold">×</span>
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
                type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white text-xs"
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
                      {/* Weapon Type Badge */}
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
      {selected.length > 0 && (
        <div className="space-y-4">
          {/* Optimized Header */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-[#FF8C00]" fill="#FF8C00" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-tactical">Optimized for {selected[0].name}</h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-green-400 font-bold">{selected.filter((w, i) => {
                  const best = getBestZones(w);
                  return best.some(z => z.score.matched === z.score.total);
                }).length} Perfect</span>
                <span className="text-yellow-400">{selected.filter((w) => {
                  const best = getBestZones(w);
                  return !best.some(z => z.score.matched === z.score.total);
                }).length} Not optimal</span>
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
                    <h4 className="text-[var(--color-accent)] text-xs font-bold">Primary Attribute (3)</h4>
                    <span className="text-[9px] px-1.5 py-0.5 bg-[var(--color-accent)] text-black font-bold">Pick this</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {PRIMARY_ATTRS.filter(a => a === selected[0].primaryAttr || a === 'Main Attribute Boost' || a === 'Intellect Boost').slice(0, 3).map(a => (
                      <span key={a} className={`text-xs px-3 py-1.5 border ${a === selected[0].primaryAttr ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
                        {a}
                      </span>
                    ))}
                    <span className="text-xs px-3 py-1.5 border border-[var(--color-border)] text-[var(--color-text-tertiary)]">[Any]</span>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] italic">Primary attributes are available in all zones (1/3 chance each)</p>
                </div>
                <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-4">
                  <h4 className="text-[var(--color-accent)] text-xs font-bold mb-3">Fixed Stat</h4>
                  <span className="text-xs px-3 py-1.5 border border-green-500/50 bg-green-500/10 text-green-400">
                    {selected[0].secondaryStat || 'None'}
                  </span>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] italic mt-2">This stat is guaranteed on every essence you farm</p>
                </div>
              </div>

              {/* Weapon Match Breakdown */}
              <details className="group bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
                <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-[var(--color-surface)] transition-colors list-none">
                  <span className="border-l-3 border-l-[var(--color-accent)] pl-2 text-xs sm:text-sm font-mono font-bold text-white uppercase tracking-wider">Weapon Compatibility Matrix</span>
                  <svg className="w-4 h-4 text-[var(--color-text-tertiary)] ml-auto transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="border-t border-[var(--color-border)] p-4 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-2)] space-y-2">
                  {selected.map((w, idx) => {
                    const best = getBestZones(w);
                    const topZone = best[0];
                    const isPerfect = topZone && topZone.score.matched === topZone.score.total;
                    const isPriority = idx === 0;
                    return (
                      <div key={w.name} className={`flex items-center gap-3 p-3 border clip-corner-tl transition-all hover:border-[var(--color-accent)] ${isPerfect ? 'bg-green-500/5 border-green-500/30' : 'bg-yellow-500/5 border-yellow-500/30'}`}>
                        <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-[var(--color-surface)] relative">
                          {WEAPON_ICONS[w.name] ? (
                            <Image src={WEAPON_ICONS[w.name]} alt={w.name} width={48} height={48} className="w-12 h-12 object-contain" unoptimized />
                          ) : <Sword size={20} className="text-[var(--color-text-tertiary)]" />}
                          {isPriority && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF8C00] rounded-full flex items-center justify-center">
                              <Star size={10} fill="#000" className="text-black" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white text-xs sm:text-sm font-bold font-mono">{w.name}</p>
                            {isPriority && <span className="text-[8px] font-mono px-1.5 py-0.5 bg-[#FF8C00] text-black font-bold">PRIORITY</span>}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {topZone.score.details.map((d, i) => (
                              <span key={i} className={`text-[9px] font-mono px-1.5 py-0.5 border clip-corner-tl ${d.matched ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400/70 bg-red-500/5'}`}>
                                {d.matched ? '✓' : '✗'} {d.stat.replace(' Boost', '')}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-xs sm:text-sm font-mono font-bold block ${isPerfect ? 'text-green-400' : 'text-yellow-400'}`}>
                            {topZone.score.matched}/{topZone.score.total}
                          </span>
                          <span className="text-[9px] font-mono text-[var(--color-text-tertiary)]">{isPerfect ? 'PERFECT' : 'PARTIAL'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </details>
            </div>
          </div>

          {/* Best Farming Zones */}
          <div className="bg-[var(--color-surface)] border-l-3 border-l-[var(--color-accent)] border border-[var(--color-border)] clip-corner-tl p-3">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              Best Farming Zones
            </h3>
            <p className="text-[10px] font-mono text-[var(--color-text-tertiary)] mt-1">Ranked by total stat matches across all selected weapons</p>
          </div>
          {zoneScores.slice(0, 5).map(({ zone, totalMatched, totalPossible, weaponScores }, idx) => {
            const efficiency = Math.round((totalMatched / totalPossible) * 100);
            const isTopChoice = idx === 0;
            return (
              <div key={zone.id} className={`bg-[var(--color-surface)] border clip-corner-tl overflow-hidden ${isTopChoice ? 'border-[var(--color-accent)] shadow-lg shadow-[var(--color-accent)]/20' : 'border-[var(--color-border)]'}`}>
                {/* Zone Header */}
                <div className={`px-4 py-3 border-b border-[var(--color-border)] ${isTopChoice ? 'bg-[var(--color-accent)]/10' : 'bg-[var(--color-surface-2)]'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isTopChoice && <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-[var(--color-accent)] text-black clip-corner-tl">RECOMMENDED</span>}
                      <MapPin size={14} className="text-[var(--color-accent)]" />
                      <span className="text-white text-sm font-bold font-mono">{zone.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 border border-[var(--color-border)] text-[var(--color-text-tertiary)] clip-corner-tl">{zone.region}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-[var(--color-text-tertiary)]">TARGET: {zone.enemy}</span>
                      <span className="text-lg font-bold font-mono text-[var(--color-accent)]">{totalMatched}/{totalPossible}</span>
                    </div>
                  </div>
                  {/* Efficiency Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-[var(--color-text-tertiary)]">FARMING EFFICIENCY</span>
                      <span className={`font-bold ${efficiency >= 90 ? 'text-green-400' : efficiency >= 70 ? 'text-[var(--color-accent)]' : 'text-yellow-400'}`}>{efficiency}%</span>
                    </div>
                    <div className="h-2 bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${efficiency >= 90 ? 'bg-gradient-to-r from-green-500 to-green-400' : efficiency >= 70 ? 'bg-gradient-to-r from-[var(--color-accent)] to-cyan-400' : 'bg-gradient-to-r from-yellow-500 to-yellow-400'}`}
                        style={{ width: `${efficiency}%` }}
                      />
                    </div>
                  </div>
                </div>
                {/* Weapon Breakdown */}
                <div className="p-4 space-y-2">
                  {weaponScores.map(({ weapon, score }) => {
                    if (!score) return null;
                    const isPerfect = score.matched === score.total;
                    const weaponEfficiency = Math.round((score.matched / score.total) * 100);
                    return (
                      <div key={weapon.name} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl overflow-hidden hover:border-[var(--color-accent)] transition-all group/weapon">
                        <div className="flex items-center gap-3 p-3">
                          <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-[var(--color-surface)] group-hover/weapon:bg-[var(--color-surface-2)] transition-colors">
                            {WEAPON_ICONS[weapon.name] ? (
                              <Image src={WEAPON_ICONS[weapon.name]} alt={weapon.name} width={48} height={48} className="w-12 h-12 object-contain group-hover/weapon:scale-110 transition-transform" unoptimized />
                            ) : <Sword size={20} className="text-[var(--color-text-tertiary)]" />}
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-white text-xs font-bold font-mono">{weapon.name}</p>
                                <span className="text-[9px] font-mono text-[var(--color-text-tertiary)]">{weapon.type} • {weapon.rarity}★</span>
                              </div>
                              <div className="text-right">
                                <span className={`text-xs font-mono font-bold ${isPerfect ? 'text-green-400' : 'text-yellow-400'}`}>
                                  {score.matched}/{score.total}
                                </span>
                                <div className="text-[9px] font-mono text-[var(--color-text-tertiary)]">{weaponEfficiency}%</div>
                              </div>
                            </div>
                            {/* Stat Match Indicators */}
                            <div className="flex flex-wrap gap-1">
                              {score.details.map((d, i) => (
                                <span key={i} className={`text-[9px] font-mono px-2 py-0.5 border clip-corner-tl ${d.matched ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400/70 bg-red-500/5'}`}>
                                  {d.matched ? '✓' : '✗'} {d.stat.replace(' Boost', '')}
                                </span>
                              ))}
                            </div>
                            {/* Mini progress bar */}
                            <div className="h-1 bg-[var(--color-surface)] overflow-hidden">
                              <div
                                className={`h-full transition-all ${isPerfect ? 'bg-green-500' : 'bg-yellow-500'}`}
                                style={{ width: `${weaponEfficiency}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
                    <span className="text-yellow-400 text-lg leading-none">⚠</span>
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
              <span className="text-[var(--color-accent)] shrink-0">▸</span>
              <span>Each zone drops unique secondary + skill stat combinations</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] shrink-0">▸</span>
              <span>Primary attributes available in ALL zones (1/3 chance)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] shrink-0">▸</span>
              <span>Match 3/3 stats for perfect essence compatibility</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] shrink-0">▸</span>
              <span>Use pre-engrave to guarantee one stat per run</span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border-l-3 border-l-green-500 border border-[var(--color-border)] clip-corner-tl p-4">
          <h3 className="text-white text-xs font-mono font-bold mb-3 flex items-center gap-2 uppercase tracking-wider">
            <FlaskConical size={14} className="text-green-400" />
            Essence System
          </h3>
          <div className="space-y-2 text-[10px] font-mono text-[var(--color-text-tertiary)]">
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">✓</span>
              <span>Flawless (T5): +6 primary/secondary, +3 skill</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">✓</span>
              <span>Farm Lv.80 dungeons for best drop rates</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">✓</span>
              <span>Dismantle extras for Essence Dust</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">✓</span>
              <span>Perfect 3/3 essences unlock max potential</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zone Comparison Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <h3 className="text-white text-sm font-mono font-bold uppercase tracking-wider">Zone Comparison</h3>
          <p className="text-[10px] font-mono text-[var(--color-text-tertiary)] mt-1">Quick reference for all farming locations</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] font-mono">
            <thead className="bg-[var(--color-surface-2)]">
              <tr className="border-b border-[var(--color-border)]">
                <th className="px-4 py-2 text-left text-[var(--color-accent)] font-bold uppercase">Zone</th>
                <th className="px-4 py-2 text-left text-[var(--color-accent)] font-bold uppercase">Region</th>
                <th className="px-4 py-2 text-left text-[var(--color-accent)] font-bold uppercase">Enemy</th>
                <th className="px-4 py-2 text-center text-[var(--color-accent)] font-bold uppercase">Secondary</th>
                <th className="px-4 py-2 text-center text-[var(--color-accent)] font-bold uppercase">Skill</th>
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
                      <span className="px-2 py-0.5 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)] clip-corner-tl">
                        {zone.secondaryStats.length}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)] clip-corner-tl">
                        {zone.skillStats.length}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 font-bold clip-corner-tl">
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
            <span className="text-yellow-400">⚡</span> Pre-Engrave Strategy
          </h3>
          <ul className="text-[10px] font-mono text-[var(--color-text-tertiary)] space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 shrink-0">1.</span>
              <span>Select your weapon&apos;s primary attribute</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 shrink-0">2.</span>
              <span>Farm zone with both secondary + skill stats</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 shrink-0">3.</span>
              <span>Guaranteed 1/3 match, roll for remaining 2/3</span>
            </li>
          </ul>
        </div>

        <div className="p-4 bg-[var(--color-surface)] border-l-3 border-l-[var(--color-accent)] border border-[var(--color-border)] clip-corner-tl">
          <h3 className="font-bold font-mono text-white text-xs mb-3 uppercase flex items-center gap-2">
            <span className="text-[var(--color-accent)]">✦</span> Efficiency Tips
          </h3>
          <ul className="text-[10px] font-mono text-[var(--color-text-tertiary)] space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] shrink-0">▸</span>
              <span>Prioritize zones matching multiple weapons</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] shrink-0">▸</span>
              <span>Keep 2/3 essences as upgrade fodder</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] shrink-0">▸</span>
              <span>Focus Flawless T5 for endgame builds</span>
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

  // Load saved state on mount
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

  // Save + debounced cloud sync whenever selectedWeapons changes
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
            Stop guessing in Severe Energy Alluvium. Get the optimal pre-engrave setup, find your best farming zone, and land more 3/3 essence matches.
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
