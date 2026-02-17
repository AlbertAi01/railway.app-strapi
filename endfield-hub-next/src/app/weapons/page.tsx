'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search, Sword } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { WEAPONS } from '@/lib/data';
import { RARITY_COLORS } from '@/types/game';
import type { WeaponType } from '@/types/game';
import { WEAPON_ICONS } from '@/lib/assets';

const WEAPON_TYPES: WeaponType[] = ['Greatsword', 'Polearm', 'Handcannon', 'Sword', 'Arts Unit'];

export default function Weapons() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<WeaponType | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return WEAPONS.filter(w => {
      if (search && !w.Name.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter && w.WeaponType !== typeFilter) return false;
      return true;
    });
  }, [search, typeFilter]);

  return (
    <div>
      <RIOSHeader
        title="Weapons Arsenal"
        category="ARMORY"
        code="RIOS-WPN-001"
        icon={<Sword size={28} />}
      />

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
        <input
          type="text"
          placeholder="Search weapons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {WEAPON_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(typeFilter === t ? null : t)}
            className={`px-3 py-1 text-xs font-medium transition-all border ${
              typeFilter === t ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(weapon => (
          <div
            key={weapon.id}
            className={`bg-[var(--color-surface)] border clip-corner-tl overflow-hidden transition-all cursor-pointer ${
              expanded === weapon.id ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'
            }`}
            onClick={() => setExpanded(expanded === weapon.id ? null : weapon.id)}
          >
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 clip-corner-tl flex items-center justify-center text-lg font-bold" style={{ backgroundColor: `${RARITY_COLORS[weapon.Rarity]}20`, color: RARITY_COLORS[weapon.Rarity] }}>
                {WEAPON_ICONS[weapon.Name] ? (
                  <Image
                    src={WEAPON_ICONS[weapon.Name]}
                    alt={weapon.Name}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain"
                    loading="lazy"
                  />
                ) : (
                  weapon.Name[0]
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold text-sm">{weapon.Name}</h3>
                  <span className="text-[11px]" style={{ color: RARITY_COLORS[weapon.Rarity] }}>
                    {'★'.repeat(weapon.Rarity)}
                  </span>
                </div>
                <div className="flex gap-3 mt-1">
                  <span className="text-[var(--color-text-tertiary)] text-xs">{weapon.WeaponType}</span>
                  <span className="text-[var(--color-text-tertiary)] text-xs">ATK: {weapon.BaseATK} - {weapon.MaxATK}</span>
                  {weapon.SubStat && <span className="text-[var(--color-text-tertiary)] text-xs">{weapon.SubStat}: {weapon.SubStatValue}%</span>}
                </div>
              </div>
            </div>
            {expanded === weapon.id && (
              <div className="px-4 pb-4 border-t border-[var(--color-border)] pt-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[var(--color-text-tertiary)] text-xs mb-1">Base ATK</p>
                    <p className="text-white font-medium">{weapon.BaseATK}</p>
                  </div>
                  <div>
                    <p className="text-[var(--color-text-tertiary)] text-xs mb-1">Max ATK (Lv. 90)</p>
                    <p className="text-white font-medium">{weapon.MaxATK}</p>
                  </div>
                  {weapon.SubStat && (
                    <>
                      <div>
                        <p className="text-[var(--color-text-tertiary)] text-xs mb-1">Sub Stat</p>
                        <p className="text-white font-medium">{weapon.SubStat}</p>
                      </div>
                      <div>
                        <p className="text-[var(--color-text-tertiary)] text-xs mb-1">Sub Stat Value</p>
                        <p className="text-white font-medium">{weapon.SubStatValue}%</p>
                      </div>
                    </>
                  )}
                </div>
                {weapon.PassiveName && (
                  <div className="mt-3 p-3 bg-[var(--color-surface-2)] clip-corner-tl">
                    <p className="text-[var(--color-accent)] text-xs font-semibold mb-1">{weapon.PassiveName}</p>
                    <p className="text-[var(--color-text-secondary)] text-xs leading-relaxed">{weapon.PassiveDescription}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
