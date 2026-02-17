import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { WEAPONS } from '../lib/data';
import { RARITY_COLORS } from '../types/game';
import type { WeaponType } from '../types/game';
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
      <h1 className="text-3xl font-bold text-white mb-2">WEAPONS</h1>
      <p className="text-gray-500 text-sm mb-6">{filtered.length} weapons found</p>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search weapons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FFE500]"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {WEAPON_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(typeFilter === t ? null : t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
              typeFilter === t ? 'border-[#FFE500] text-[#FFE500] bg-[#FFE500]/10' : 'border-[#333] text-gray-400 hover:border-[#555]'
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
            className={`bg-[#111] border rounded-xl overflow-hidden transition-all cursor-pointer ${
              expanded === weapon.id ? 'border-[#FFE500]' : 'border-[#222] hover:border-[#444]'
            }`}
            onClick={() => setExpanded(expanded === weapon.id ? null : weapon.id)}
          >
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold" style={{ backgroundColor: `${RARITY_COLORS[weapon.Rarity]}20`, color: RARITY_COLORS[weapon.Rarity] }}>
                {WEAPON_ICONS[weapon.Name] ? (
                  <img
                    src={WEAPON_ICONS[weapon.Name]}
                    alt={weapon.Name}
                    loading="lazy"
                    className="w-12 h-12 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
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
                  <span className="text-gray-500 text-xs">{weapon.WeaponType}</span>
                  <span className="text-gray-500 text-xs">ATK: {weapon.BaseATK} - {weapon.MaxATK}</span>
                  {weapon.SubStat && <span className="text-gray-500 text-xs">{weapon.SubStat}: {weapon.SubStatValue}%</span>}
                </div>
              </div>
            </div>
            {expanded === weapon.id && (
              <div className="px-4 pb-4 border-t border-[#222] pt-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Base ATK</p>
                    <p className="text-white font-medium">{weapon.BaseATK}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Max ATK (Lv. 90)</p>
                    <p className="text-white font-medium">{weapon.MaxATK}</p>
                  </div>
                  {weapon.SubStat && (
                    <>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Sub Stat</p>
                        <p className="text-white font-medium">{weapon.SubStat}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Sub Stat Value</p>
                        <p className="text-white font-medium">{weapon.SubStatValue}%</p>
                      </div>
                    </>
                  )}
                </div>
                {weapon.PassiveName && (
                  <div className="mt-3 p-3 bg-[#0a0a0a] rounded-lg">
                    <p className="text-[#FFE500] text-xs font-semibold mb-1">{weapon.PassiveName}</p>
                    <p className="text-gray-400 text-xs leading-relaxed">{weapon.PassiveDescription}</p>
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
