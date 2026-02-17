import { useState } from 'react';
import { Search } from 'lucide-react';
import { EQUIPMENT_SETS } from '../lib/data';
import { RARITY_COLORS } from '../types/game';
import { EQUIPMENT_ICONS } from '@/lib/assets';

export default function Equipment() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = EQUIPMENT_SETS.filter(s =>
    !search || s.Name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">EQUIPMENT SETS</h1>
      <p className="text-gray-500 text-sm mb-6">{filtered.length} equipment sets</p>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search equipment sets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FFE500]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(set => (
          <div
            key={set.id}
            className={`bg-[#111] border rounded-xl p-5 transition-all cursor-pointer ${
              expanded === set.id ? 'border-[#FFE500]' : 'border-[#222] hover:border-[#444]'
            }`}
            onClick={() => setExpanded(expanded === set.id ? null : set.id)}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${RARITY_COLORS[set.Rarity]}20`, color: RARITY_COLORS[set.Rarity] }}>
                {EQUIPMENT_ICONS[set.Name] ? (
                  <img
                    src={EQUIPMENT_ICONS[set.Name]}
                    alt={set.Name}
                    loading="lazy"
                    className="w-12 h-12 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  set.Name[0]
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">{set.Name}</h3>
                <span className="text-[11px]" style={{ color: RARITY_COLORS[set.Rarity] }}>
                  {'★'.repeat(set.Rarity)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 bg-[#0a0a0a] rounded-lg">
                <p className="text-[#FFE500] text-[10px] font-semibold mb-0.5">2-PIECE BONUS</p>
                <p className="text-gray-300 text-xs">{set.TwoPieceBonus}</p>
              </div>
              {set.FourPieceBonus && (
                <div className="p-2.5 bg-[#0a0a0a] rounded-lg">
                  <p className="text-[#FFE500] text-[10px] font-semibold mb-0.5">4-PIECE BONUS</p>
                  <p className="text-gray-300 text-xs">{set.FourPieceBonus}</p>
                </div>
              )}
            </div>

            {expanded === set.id && set.RecommendedFor && (
              <div className="mt-3 pt-3 border-t border-[#222]">
                <p className="text-gray-500 text-[10px] font-semibold mb-2">RECOMMENDED FOR</p>
                <div className="flex flex-wrap gap-1">
                  {set.RecommendedFor.map(name => (
                    <span key={name} className="text-xs bg-[#1a1a1a] text-gray-300 px-2 py-0.5 rounded-full border border-[#333]">{name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
