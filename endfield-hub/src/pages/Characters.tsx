import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { CHARACTERS } from '../lib/data';
import { ELEMENT_COLORS, RARITY_COLORS } from '../types/game';
import type { Element, Role, WeaponType } from '../types/game';
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
        active ? 'border-[#FFE500] text-[#FFE500] bg-[#FFE500]/10' : 'border-[#333] text-gray-400 hover:border-[#555]'
      }`}
      style={active && color ? { borderColor: color, color: color, backgroundColor: `${color}15` } : {}}
    >
      {label}
    </button>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">CHARACTERS</h1>
      <p className="text-gray-500 text-sm mb-6">{filtered.length} characters found</p>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search characters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FFE500]"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Filter size={14} className="text-gray-500 self-center" />
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
            to={`/characters/${char.Slug}`}
            className="group bg-[#111] border border-[#222] rounded-xl overflow-hidden hover:border-[#444] transition-all no-underline"
          >
            <div
              className="aspect-[3/4] relative flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${ELEMENT_COLORS[char.Element]}20, #111)` }}
            >
              {CHARACTER_ICONS[char.Name] ? (
                <img
                  src={CHARACTER_ICONS[char.Name]}
                  alt={char.Name}
                  loading="lazy"
                  className="w-32 h-32 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
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
              <p className="text-white text-sm font-semibold group-hover:text-[#FFE500] transition-colors truncate">{char.Name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px]" style={{ color: ELEMENT_COLORS[char.Element] }}>{char.Element}</span>
                <span className="text-gray-600 text-[11px]">{char.Role}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
