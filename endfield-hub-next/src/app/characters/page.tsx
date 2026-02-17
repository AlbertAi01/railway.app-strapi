'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, Users } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { CHARACTERS } from '@/lib/data';
import { ELEMENT_COLORS, RARITY_COLORS } from '@/types/game';
import type { Element, Role, WeaponType } from '@/types/game';
import { CHARACTER_ICONS } from '@/lib/assets';

const ELEMENTS: Element[] = ['Physical', 'Heat', 'Cryo', 'Electric', 'Nature'];
const ROLES: Role[] = ['Guard', 'Defender', 'Supporter', 'Caster', 'Vanguard', 'Striker'];
const WEAPON_TYPES: WeaponType[] = ['Greatsword', 'Polearm', 'Handcannon', 'Sword', 'Arts Unit'];

export default function Characters() {
  const [search, setSearch] = useState('');
  const [elementFilter, setElementFilter] = useState<Element | null>(null);
  const [roleFilter, setRoleFilter] = useState<Role | null>(null);
  const [rarityFilter, setRarityFilter] = useState<number | null>(null);
  const [weaponFilter, setWeaponFilter] = useState<WeaponType | null>(null);

  const filtered = useMemo(() => {
    return CHARACTERS.filter(c => {
      if (search && !c.Name.toLowerCase().includes(search.toLowerCase())) return false;
      if (elementFilter && c.Element !== elementFilter) return false;
      if (roleFilter && c.Role !== roleFilter) return false;
      if (rarityFilter && c.Rarity !== rarityFilter) return false;
      if (weaponFilter && c.WeaponType !== weaponFilter) return false;
      return true;
    });
  }, [search, elementFilter, roleFilter, rarityFilter, weaponFilter]);

  const FilterChip = ({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
        active ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
      }`}
      style={active && color ? { borderColor: color, color: color, backgroundColor: `${color}15` } : {}}
    >
      {label}
    </button>
  );

  return (
    <div>
      <RIOSHeader
        title="Operator Database"
        category="PERSONNEL"
        code="RIOS-OPS-DB"
        icon={<Users size={28} />}
        subtitle={`${filtered.length} operators indexed`}
      />

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
        <input
          type="text"
          placeholder="Search characters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Filter size={14} className="text-[var(--color-text-tertiary)] self-center" />
        {[6, 5, 4].map(r => (
          <FilterChip key={r} label={`${r}★`} active={rarityFilter === r} onClick={() => setRarityFilter(rarityFilter === r ? null : r)} color={RARITY_COLORS[r]} />
        ))}
        {ELEMENTS.map(e => (
          <FilterChip key={e} label={e} active={elementFilter === e} onClick={() => setElementFilter(elementFilter === e ? null : e)} color={ELEMENT_COLORS[e]} />
        ))}
        {ROLES.map(r => (
          <FilterChip key={r} label={r} active={roleFilter === r} onClick={() => setRoleFilter(roleFilter === r ? null : r)} />
        ))}
        {WEAPON_TYPES.map(w => (
          <FilterChip key={w} label={w} active={weaponFilter === w} onClick={() => setWeaponFilter(weaponFilter === w ? null : w)} />
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map(char => (
          <Link
            key={char.Slug}
            href={`/characters/${char.Slug}`}
            className="group bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden hover:border-[var(--color-accent)] transition-all no-underline"
          >
            <div
              className="aspect-[3/4] relative flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${ELEMENT_COLORS[char.Element]}20, #111)` }}
            >
              {CHARACTER_ICONS[char.Name] ? (
                <Image
                  src={CHARACTER_ICONS[char.Name]}
                  alt={char.Name}
                  width={128}
                  height={128}
                  className="w-32 h-32 object-contain"
                  loading="lazy"
                />
              ) : (
                <span className="text-4xl font-bold text-white/10">{char.Name[0]}</span>
              )}
              <div className="absolute top-2 left-2 flex gap-1">
                {Array.from({ length: char.Rarity }, (_, i) => (
                  <span key={i} className="text-[10px]" style={{ color: RARITY_COLORS[char.Rarity] }}>★</span>
                ))}
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{ backgroundColor: ELEMENT_COLORS[char.Element] }}
              />
            </div>
            <div className="p-2.5">
              <p className="text-white text-sm font-semibold group-hover:text-[var(--color-accent)] transition-colors truncate">{char.Name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px]" style={{ color: ELEMENT_COLORS[char.Element] }}>{char.Element}</span>
                <span className="text-[var(--color-text-tertiary)] text-[11px]">{char.Role}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
