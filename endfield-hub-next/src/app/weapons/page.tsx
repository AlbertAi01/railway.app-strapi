'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search, Sword, ChevronDown, ChevronUp, Zap, Shield, Crosshair, TrendingUp } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { WEAPON_DATA, getAtkAtLevel, ATK_CURVES } from '@/data/weapons';
import type { WeaponData } from '@/data/weapons';
import { RARITY_COLORS } from '@/types/game';
import type { WeaponType } from '@/types/game';
import { WEAPON_ICONS } from '@/lib/assets';

const WEAPON_TYPES: WeaponType[] = ['Greatsword', 'Polearm', 'Handcannon', 'Sword', 'Arts Unit'];
const RARITY_FILTERS = [6, 5, 4, 3] as const;

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[var(--color-text-muted)] text-sm w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[var(--color-surface-2)]">
        <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-white text-sm font-mono w-10 text-right">{value}</span>
    </div>
  );
}

function AtkCurveChart({ baseAtk, maxAtk, rarity }: { baseAtk: number; maxAtk: number; rarity: number }) {
  const levels = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90];
  const values = levels.map(lv => getAtkAtLevel(baseAtk, maxAtk, lv));
  const maxVal = maxAtk;
  const minVal = baseAtk;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[var(--color-text-muted)] text-sm uppercase tracking-wider">ATK Growth Curve</span>
        <span className="text-[var(--color-text-muted)] text-[11px]">Lv.1 → Lv.90</span>
      </div>
      <div className="flex items-end gap-[2px] h-12">
        {values.map((val, i) => {
          const height = maxVal > minVal ? ((val - minVal) / (maxVal - minVal)) * 100 : 100;
          return (
            <div key={levels[i]} className="flex-1 flex flex-col items-center gap-1" title={`Lv.${levels[i]}: ${val} ATK`}>
              <div className="w-full bg-[var(--color-accent)]/20 relative" style={{ height: '48px' }}>
                <div
                  className="absolute bottom-0 w-full bg-[var(--color-accent)]"
                  style={{ height: `${Math.max(height, 5)}%`, opacity: 0.4 + (i / levels.length) * 0.6 }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[11px] text-[var(--color-text-muted)]">1</span>
        <span className="text-[11px] text-[var(--color-text-muted)]">90</span>
      </div>
    </div>
  );
}

function WeaponCard({ weapon, isExpanded, onToggle }: { weapon: WeaponData; isExpanded: boolean; onToggle: () => void }) {
  const rarityColor = RARITY_COLORS[weapon.Rarity] || '#999';
  const icon = WEAPON_ICONS[weapon.Name];

  const formatStatValue = (value: number, isPct: boolean) => {
    if (isPct) {
      return value < 1 ? `${(value * 100).toFixed(1)}%` : `${value.toFixed(1)}%`;
    }
    return `+${value}`;
  };

  return (
    <div
      className={`bg-[var(--color-surface)] border clip-corner-tl overflow-hidden transition-all shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 ${
        isExpanded ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
      }`}
    >
      <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={onToggle}>
        <div
          className="w-14 h-14 clip-corner-tl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${rarityColor}15`, border: `1px solid ${rarityColor}30` }}
        >
          {icon ? (
            <Image src={icon} alt={weapon.Name} width={56} height={56} className="w-14 h-14 object-contain" loading="lazy" />
          ) : (
            <Sword size={24} style={{ color: rarityColor }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold text-base truncate">{weapon.Name}</h3>
            <span className="text-[12px] shrink-0" style={{ color: rarityColor }}>
              {'★'.repeat(weapon.Rarity)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[var(--color-text-muted)] text-sm">{weapon.WeaponType}</span>
            <span className="text-[var(--color-accent)] text-sm font-mono">ATK {weapon.MaxAtk}</span>
            {weapon.PassiveAttribute && (
              <span className="text-[var(--color-text-secondary)] text-sm">
                {weapon.PassiveAttribute.label} +{weapon.PassiveAttribute.value}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-[var(--color-text-muted)]">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-[var(--color-border)] pt-4 space-y-5">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* ATK Stats */}
            <div className="p-4 bg-[var(--color-surface-2)] clip-corner-tl">
              <div className="flex items-center gap-2 mb-3">
                <Crosshair size={18} className="text-[var(--color-accent)]" />
                <span className="text-white text-sm font-semibold uppercase tracking-wider">Attack</span>
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[var(--color-text-muted)] text-sm">Base (Lv.1)</span>
                <span className="text-white font-mono text-base">{weapon.BaseAtk}</span>
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[var(--color-text-muted)] text-sm">Max (Lv.90)</span>
                <span className="text-[var(--color-accent)] font-mono text-base font-bold">{weapon.MaxAtk}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[var(--color-text-muted)] text-sm">Growth</span>
                <span className="text-green-400 font-mono text-sm">+{weapon.MaxAtk - weapon.BaseAtk}</span>
              </div>
              <AtkCurveChart baseAtk={weapon.BaseAtk} maxAtk={weapon.MaxAtk} rarity={weapon.Rarity} />
            </div>

            {/* Attributes */}
            <div className="p-4 bg-[var(--color-surface-2)] clip-corner-tl">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={18} className="text-[var(--color-accent)]" />
                <span className="text-white text-sm font-semibold uppercase tracking-wider">Attributes</span>
              </div>

              {weapon.PassiveAttribute && (
                <div className="mb-3">
                  <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Passive</div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-text-secondary)] text-base">{weapon.PassiveAttribute.label}</span>
                    <span className="text-[var(--color-accent)] font-mono text-base">
                      {formatStatValue(weapon.PassiveAttribute.value, weapon.PassiveAttribute.isPercentage)}
                    </span>
                  </div>
                </div>
              )}

              {weapon.SpecialAttribute && (
                <div>
                  <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Special</div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-text-secondary)] text-base">{weapon.SpecialAttribute.label}</span>
                    <span className="text-[var(--color-accent)] font-mono text-base">
                      {weapon.SpecialAttribute.isPercentage
                        ? `+${weapon.SpecialAttribute.value.toFixed(1)}%`
                        : `+${weapon.SpecialAttribute.value}`}
                    </span>
                  </div>
                </div>
              )}

              {!weapon.SpecialAttribute && (
                <div className="text-[var(--color-text-muted)] text-sm italic">No special attribute</div>
              )}
            </div>
          </div>

          {/* Potential Skill */}
          {weapon.SkillName && (
            <div className="p-4 bg-[var(--color-surface-2)] clip-corner-tl">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={18} className="text-[var(--color-accent)]" />
                <span className="text-white text-sm font-semibold uppercase tracking-wider">Potential Skill</span>
              </div>
              <h4 className="text-[var(--color-accent)] text-base font-semibold mb-1">{weapon.SkillName}</h4>
              {weapon.SkillDescription && (
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{weapon.SkillDescription}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Weapons() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<WeaponType | null>(null);
  const [rarityFilter, setRarityFilter] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return WEAPON_DATA.filter(w => {
      if (search && !w.Name.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter && w.WeaponType !== typeFilter) return false;
      if (rarityFilter && w.Rarity !== rarityFilter) return false;
      return true;
    });
  }, [search, typeFilter, rarityFilter]);

  const stats = useMemo(() => ({
    total: WEAPON_DATA.length,
    shown: filtered.length,
    byStar: RARITY_FILTERS.map(r => ({ r, count: WEAPON_DATA.filter(w => w.Rarity === r).length })),
  }), [filtered]);

  return (
    <div>
      <RIOSHeader
        title="Weapons Arsenal"
        category="ARMORY"
        code="RIOS-WPN-001"
        icon={<Sword size={32} />}
      />

      {/* Summary bar */}
      <div className="flex items-center gap-4 mb-6 text-sm text-[var(--color-text-muted)]">
        <span>{stats.shown} / {stats.total} weapons</span>
        <span className="text-[var(--color-border)]">|</span>
        {stats.byStar.map(s => (
          <span key={s.r}>{s.r}★ ×{s.count}</span>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Search weapons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {WEAPON_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(typeFilter === t ? null : t)}
            className={`px-4 py-2 text-sm font-medium transition-all border ${
              typeFilter === t
                ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {RARITY_FILTERS.map(r => (
          <button
            key={r}
            onClick={() => setRarityFilter(rarityFilter === r ? null : r)}
            className={`px-4 py-2 text-sm font-medium transition-all border ${
              rarityFilter === r
                ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
            }`}
          >
            <span style={{ color: rarityFilter === r ? 'var(--color-accent)' : RARITY_COLORS[r] }}>
              {'★'.repeat(r)}
            </span>
          </button>
        ))}
      </div>

      {/* Weapon list */}
      <div className="space-y-3">
        {filtered.map(weapon => (
          <WeaponCard
            key={weapon.id}
            weapon={weapon}
            isExpanded={expanded === weapon.id}
            onToggle={() => setExpanded(expanded === weapon.id ? null : weapon.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <Sword size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-base">No weapons match your filters</p>
        </div>
      )}
    </div>
  );
}
