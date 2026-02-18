'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Star, FlaskConical, Search, MapPin, Sword, CheckCircle } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { WEAPON_ICONS } from '@/lib/assets';
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
      className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-colors border-b-2 ${
        active
          ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-surface)]'
          : 'border-transparent text-[var(--color-text-tertiary)] hover:text-white hover:bg-[var(--color-surface-2)]'
      }`}
    >
      {icon} {label}
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
  const icon = WEAPON_ICONS[weapon.name];
  const rarityColor = RARITY_COLORS[weapon.rarity] || '#999';

  const isPrimaryMatch = matchInfo?.selectedPrimary && weapon.primaryAttr === matchInfo.selectedPrimary;
  const isSecondaryMatch = matchInfo?.selectedSecondary && weapon.secondaryStat === matchInfo.selectedSecondary;
  const isSkillMatch = matchInfo?.selectedSkill && weapon.skillStat === matchInfo.selectedSkill;

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl overflow-hidden" style={{ borderBottomColor: rarityColor, borderBottomWidth: '3px' }}>
      <div className="flex items-start gap-4 p-4">
        <div className="w-20 h-20 shrink-0 bg-[var(--color-surface)] flex items-center justify-center overflow-hidden">
          {icon ? (
            <Image src={icon} alt={weapon.name} width={80} height={80} className="w-20 h-20 object-contain" unoptimized />
          ) : (
            <Sword size={24} className="text-[var(--color-text-tertiary)]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-white text-sm font-bold">{weapon.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono" style={{ color: rarityColor }}>{weapon.rarity}★</span>
                <span className="text-[11px] text-[var(--color-text-tertiary)]">{weapon.type}</span>
              </div>
            </div>
            {matchInfo && (
              <span className={`text-xs font-bold px-2.5 py-1 shrink-0 ${
                matchInfo.matchCount === matchInfo.total ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {matchInfo.matchCount}/{matchInfo.total} {matchInfo.matchCount === matchInfo.total ? 'Perfect' : 'Partial'}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className={`text-[10px] px-2 py-1 border ${isPrimaryMatch ? 'border-green-500 bg-green-500/15 text-green-400' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)]'}`}>
              {isPrimaryMatch && <span className="mr-0.5">&#10003;</span>}{weapon.primaryAttr}
            </span>
            {weapon.secondaryStat && (
              <span className={`text-[10px] px-2 py-1 border ${isSecondaryMatch ? 'border-green-500 bg-green-500/15 text-green-400' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)]'}`}>
                {isSecondaryMatch && <span className="mr-0.5">&#10003;</span>}{weapon.secondaryStat}
              </span>
            )}
            <span className={`text-[10px] px-2 py-1 border ${isSkillMatch ? 'border-green-500 bg-green-500/15 text-green-400' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)]'}`}>
              {isSkillMatch && <span className="mr-0.5">&#10003;</span>}{weapon.skillStat}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ZoneCard({ zone, weapons, expanded, onToggle }: { zone: FarmingZone; weapons: WeaponEssence[]; expanded: boolean; onToggle: () => void }) {
  const perfectWeapons = weapons.filter(w => {
    const score = getBestZones(w).find(z => z.zone.id === zone.id);
    return score && score.score.matched === score.score.total;
  });

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] transition-colors text-left"
      >
        <div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-[var(--color-accent)]" />
            <span className="text-white text-sm font-bold">Severe Energy Alluvium: {zone.name}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-[var(--color-text-tertiary)]">vs. {zone.enemy}</span>
            <span className="text-[10px] text-green-400 font-bold">{perfectWeapons.length} Perfect (3/3)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-tertiary)]">{zone.region}</span>
          <svg className={`w-4 h-4 text-[var(--color-text-tertiary)] transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {expanded && (
        <div className="p-4 space-y-4">
          <div>
            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Secondary Stats</p>
            <div className="flex flex-wrap gap-1.5">
              {zone.secondaryStats.map(s => (
                <span key={s} className="text-[10px] px-2 py-0.5 border border-[var(--color-border)] text-[var(--color-text-secondary)]">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Skill Stats</p>
            <div className="flex flex-wrap gap-1.5">
              {zone.skillStats.map(s => (
                <span key={s} className="text-[10px] px-2 py-0.5 border border-[var(--color-border)] text-[var(--color-text-secondary)]">{s}</span>
              ))}
            </div>
          </div>
          {perfectWeapons.length > 0 && (
            <div>
              <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Compatible Weapons (3/3)</p>
              <div className="flex flex-wrap gap-2">
                {perfectWeapons.map(w => {
                  const wpnIcon = WEAPON_ICONS[w.name];
                  return (
                    <div key={w.name} className="flex items-center gap-1.5 px-2 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                      {wpnIcon ? (
                        <Image src={wpnIcon} alt={w.name} width={20} height={20} className="w-5 h-5 object-contain" />
                      ) : (
                        <Sword size={12} className="text-[var(--color-text-tertiary)]" />
                      )}
                      <span className="text-[10px] text-white">{w.name}</span>
                      <span className="text-[9px] font-mono" style={{ color: RARITY_COLORS[w.rarity] }}>{w.rarity}★</span>
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
function FarmingOptimizer() {
  const [selectedWeapons, setSelectedWeapons] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [rarityFilter, setRarityFilter] = useState<number | null>(null);

  const weapons4plus = WEAPON_ESSENCES.filter(w => w.rarity >= 4);

  const filteredWeapons = weapons4plus.filter(w => {
    if (selectedWeapons.includes(w.name)) return false;
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && w.type !== typeFilter) return false;
    if (rarityFilter && w.rarity !== rarityFilter) return false;
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
            <div className="flex flex-wrap gap-3 mb-4">
              {selected.map((w, idx) => {
                const wpnIcon = WEAPON_ICONS[w.name];
                const rarityColor = RARITY_COLORS[w.rarity] || '#999';
                const isPriority = idx === 0;
                return (
                  <div key={w.name} className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface-2)] border-2 transition-colors"
                    style={{ borderColor: isPriority ? '#FF8C00' : 'var(--color-border)' }}>
                    <button
                      onClick={() => {
                        const newSelected = [w.name, ...selectedWeapons.filter(n => n !== w.name)];
                        setSelectedWeapons(newSelected);
                      }}
                      className={`p-1 ${isPriority ? 'text-[#FF8C00]' : 'text-[var(--color-text-tertiary)] hover:text-[#FF8C00]'}`}
                      title="Set as priority weapon"
                    >
                      <Star size={18} fill={isPriority ? '#FF8C00' : 'none'} />
                    </button>
                    <div className="w-16 h-16 shrink-0 bg-[var(--color-surface)] flex items-center justify-center overflow-hidden"
                      style={{ borderBottom: `3px solid ${rarityColor}` }}>
                      {wpnIcon ? (
                        <Image src={wpnIcon} alt={w.name} width={64} height={64} className="w-16 h-16 object-contain" unoptimized />
                      ) : (
                        <Sword size={24} className="text-[var(--color-text-tertiary)]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-bold">{w.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono" style={{ color: rarityColor }}>{w.rarity}★</span>
                        <span className={`text-[10px] font-bold ${isPriority ? 'text-green-400' : 'text-yellow-500'}`}>
                          {isPriority ? 'Priority' : 'Not optimal'}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedWeapons(prev => prev.filter(n => n !== w.name))}
                      className="text-[var(--color-text-tertiary)] hover:text-red-400 ml-2 p-1">
                      <span className="text-lg leading-none">×</span>
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
                <StatPill label="All" active={!rarityFilter} onClick={() => setRarityFilter(null)} />
                {[6, 5, 4].map(r => (
                  <StatPill key={r} label={`${r}★`} active={rarityFilter === r} onClick={() => setRarityFilter(rarityFilter === r ? null : r)} color={RARITY_COLORS[r]} />
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <StatPill label="All Types" active={!typeFilter} onClick={() => setTypeFilter(null)} />
                {['Greatsword', 'Polearm', 'Handcannon', 'Sword', 'Arts Unit'].map(t => (
                  <StatPill key={t} label={t} active={typeFilter === t} onClick={() => setTypeFilter(typeFilter === t ? null : t)} />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {filteredWeapons.map(w => {
                  const wpnIcon = WEAPON_ICONS[w.name];
                  const rarityColor = RARITY_COLORS[w.rarity] || '#999';
                  return (
                    <button
                      key={w.name}
                      onClick={() => { setSelectedWeapons(prev => [...prev, w.name]); }}
                      className="group relative flex flex-col items-center bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all overflow-hidden"
                      style={{ borderBottomColor: rarityColor, borderBottomWidth: '3px' }}
                    >
                      <div className="w-full aspect-square bg-gradient-to-b from-[var(--color-surface-2)] to-[var(--color-surface)] flex items-center justify-center p-3 overflow-hidden">
                        {wpnIcon ? (
                          <Image src={wpnIcon} alt={w.name} width={120} height={120} className="w-full h-full object-contain group-hover:scale-110 transition-transform" unoptimized />
                        ) : (
                          <Sword size={32} className="text-[var(--color-text-tertiary)]" />
                        )}
                      </div>
                      <div className="w-full px-2 py-2 text-center bg-[var(--color-surface-2)]/80">
                        <p className="text-[11px] text-white font-bold truncate leading-tight">{w.name}</p>
                        <p className="text-[10px] font-mono" style={{ color: rarityColor }}>{w.rarity}★</p>
                      </div>
                      {selectedWeapons.includes(w.name) && (
                        <div className="absolute inset-0 bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)] flex items-center justify-center">
                          <CheckCircle size={24} className="text-[var(--color-accent)]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
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
              <details className="group">
                <summary className="flex items-center gap-2 px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-accent)] transition-colors">
                  <span className="border-l-3 border-l-[var(--color-accent)] pl-2 text-sm font-bold text-white">Weapon Match Breakdown</span>
                  <svg className="w-4 h-4 text-[var(--color-text-tertiary)] ml-auto transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="border border-t-0 border-[var(--color-border)] p-4 space-y-2">
                  {selected.map(w => {
                    const best = getBestZones(w);
                    const topZone = best[0];
                    const isPerfect = topZone && topZone.score.matched === topZone.score.total;
                    return (
                      <div key={w.name} className="flex items-center gap-3 p-3 bg-[var(--color-surface-2)]">
                        <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                          {WEAPON_ICONS[w.name] ? (
                            <Image src={WEAPON_ICONS[w.name]} alt={w.name} width={40} height={40} className="w-10 h-10 object-contain" unoptimized />
                          ) : <Sword size={16} className="text-[var(--color-text-tertiary)]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-bold">{w.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-[10px] px-2 py-0.5 border border-[var(--color-border)] text-[var(--color-text-tertiary)]">{w.primaryAttr}</span>
                            {w.secondaryStat && <span className="text-[10px] px-2 py-0.5 border border-[var(--color-border)] text-[var(--color-text-tertiary)]">{w.secondaryStat}</span>}
                            <span className="text-[10px] px-2 py-0.5 border border-[var(--color-border)] text-[var(--color-text-tertiary)]">{w.skillStat}</span>
                          </div>
                        </div>
                        <span className={`text-sm font-bold shrink-0 ${isPerfect ? 'text-green-400' : 'text-yellow-400'}`}>
                          {isPerfect ? 'Perfect' : 'Partial'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </details>
            </div>
          </div>

          {/* Best Farming Zones */}
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-tactical flex items-center gap-2">
            <CheckCircle size={16} className="text-green-400" />
            Best Farming Zones
          </h3>
          {zoneScores.slice(0, 5).map(({ zone, totalMatched, totalPossible, weaponScores }) => (
            <div key={zone.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[var(--color-accent)]" />
                    <span className="text-white text-sm font-bold">{zone.name}</span>
                    <span className="text-[10px] text-[var(--color-text-tertiary)]">{zone.region}</span>
                  </div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">vs. {zone.enemy}</span>
                </div>
                <span className="text-lg font-bold font-mono text-[var(--color-accent)]">{totalMatched}/{totalPossible}</span>
              </div>
              <div className="space-y-2">
                {weaponScores.map(({ weapon, score }) => {
                  if (!score) return null;
                  const isPerfect = score.matched === score.total;
                  return (
                    <div key={weapon.name} className="flex items-center gap-3 p-3 bg-[var(--color-surface-2)]">
                      <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                        {WEAPON_ICONS[weapon.name] ? (
                          <Image src={WEAPON_ICONS[weapon.name]} alt={weapon.name} width={40} height={40} className="w-10 h-10 object-contain" unoptimized />
                        ) : <Sword size={14} className="text-[var(--color-text-tertiary)]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-bold truncate">{weapon.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {score.details.map((d, i) => (
                            <span key={i} className={`text-[9px] px-1.5 py-0.5 border ${d.matched ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)]'}`}>
                              {d.matched && '✓ '}{d.stat}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className={`text-xs font-bold shrink-0 ${isPerfect ? 'text-green-400' : 'text-yellow-400'}`}>
                        {score.matched}/{score.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
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

  return (
    <div className="space-y-6">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical">Select Your Essence Stats</h2>
          {hasSelection && (
            <button onClick={() => { setPrimary(null); setSecondary(null); setSkill(null); }} className="text-xs text-[var(--color-text-tertiary)] hover:text-white">Clear</button>
          )}
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-[var(--color-accent)] text-xs font-bold mb-2">Primary Attribute</p>
            <div className="flex flex-wrap gap-1.5">
              <StatPill label="None" active={!primary} onClick={() => setPrimary(null)} />
              {PRIMARY_ATTRS.map(a => (
                <StatPill key={a} label={a} active={primary === a} onClick={() => setPrimary(primary === a ? null : a)} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[var(--color-accent)] text-xs font-bold mb-2">Secondary Stat</p>
            <div className="flex flex-wrap gap-1.5">
              <StatPill label="None" active={!secondary} onClick={() => setSecondary(null)} />
              {SECONDARY_STATS.map(s => (
                <StatPill key={s} label={s} active={secondary === s} onClick={() => setSecondary(secondary === s ? null : s)} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[var(--color-accent)] text-xs font-bold mb-2">Skill Stat</p>
            <div className="flex flex-wrap gap-1.5">
              <StatPill label="None" active={!skill} onClick={() => setSkill(null)} />
              {SKILL_STATS.map(s => (
                <StatPill key={s} label={s} active={skill === s} onClick={() => setSkill(skill === s ? null : s)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical flex items-center gap-2">
            <Search size={16} className="text-[var(--color-accent)]" />
            Compatible Weapons {hasSelection && `(${results.length} found)`}
          </h2>
        </div>
        <div className="p-4">
          {!hasSelection ? (
            <div className="text-center py-12">
              <Search size={28} className="mx-auto mb-3 text-[var(--color-text-tertiary)] opacity-50" />
              <p className="text-[var(--color-text-tertiary)] text-sm">Select essence stats above to find compatible weapons</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--color-text-tertiary)] text-sm">No weapons match the selected stats</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {results.map(r => (
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
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4">
        <h3 className="text-white text-sm font-bold mb-2 flex items-center gap-2">
          <MapPin size={16} className="text-[var(--color-accent)]" />
          Farming Zone Guide
        </h3>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Each dungeon drops different stat combinations. Farm the zone that drops all the stats you need for your target weapons.
          Primary attributes are available in all zones. Use the pre-engrave system to guarantee one stat per run.
        </p>
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

      <div className="p-4 bg-[var(--color-surface)] border-l-3 border-l-[var(--color-accent)] border border-[var(--color-border)] clip-corner-tl">
        <h3 className="font-bold text-white text-sm mb-2">Farming Tips</h3>
        <ul className="text-xs text-[var(--color-text-tertiary)] space-y-1">
          <li>Use Engraving Permits to pre-select one stat per run for guaranteed rolls</li>
          <li>A perfect (3/3) essence matches all 3 of a weapon&apos;s stats: primary, secondary, and skill</li>
          <li>Flawless (Tier 5) essences can be upgraded to +6 attribute/secondary and +3 skill</li>
          <li>Dismantle unwanted essences for Essence Dust used in etching upgrades</li>
          <li>Farm at Lv.80 Severe Energy Alluvium for highest Flawless drop rates</li>
        </ul>
      </div>
    </div>
  );
}

export default function EssenceSolverPage() {
  const [activeTab, setActiveTab] = useState<'optimizer' | 'checker' | 'guide'>('optimizer');

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader title="Essence Optimization" category="ANALYSIS" code="RIOS-ESS-001" icon={<FlaskConical size={28} />} />

        <p className="text-sm text-[var(--color-text-tertiary)] mb-4">
          Stop guessing in Severe Energy Alluvium. Get the optimal pre-engrave setup, find your best farming zone, and land more 3/3 essence matches.
        </p>

        {/* Tab Bar */}
        <div className="flex border-b border-[var(--color-border)] mb-6">
          <TabButton active={activeTab === 'optimizer'} onClick={() => setActiveTab('optimizer')} icon={<Star size={14} />} label="Farming Optimizer" />
          <TabButton active={activeTab === 'checker'} onClick={() => setActiveTab('checker')} icon={<Search size={14} />} label="Essence Checker" />
          <TabButton active={activeTab === 'guide'} onClick={() => setActiveTab('guide')} icon={<MapPin size={14} />} label="Farming Guide" />
        </div>

        {activeTab === 'optimizer' && <FarmingOptimizer />}
        {activeTab === 'checker' && <EssenceChecker />}
        {activeTab === 'guide' && <FarmingGuide />}
      </div>
    </div>
  );
}
