'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { EQUIPMENT_SETS } from '@/lib/data';
import { RARITY_COLORS } from '@/types/game';
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
      <p className="text-gray-500 text-sm mb-6">{filtered.length} sets found</p>

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

      <div className="space-y-3">
        {filtered.map(set => (
          <div
            key={set.id}
            className={`bg-[#111] border rounded-xl overflow-hidden transition-all cursor-pointer ${
              expanded === set.id ? 'border-[#FFE500]' : 'border-[#222] hover:border-[#444]'
            }`}
            onClick={() => setExpanded(expanded === set.id ? null : set.id)}
          >
            <div className="flex items-center gap-4 p-4">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${RARITY_COLORS[set.Rarity]}20` }}>
                {EQUIPMENT_ICONS[set.Name] ? (
                  <Image src={EQUIPMENT_ICONS[set.Name]} alt={set.Name} width={56} height={56} className="object-contain" loading="lazy" />
                ) : (
                  <span className="text-lg font-bold" style={{ color: RARITY_COLORS[set.Rarity] }}>{set.Name[0]}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold">{set.Name}</h3>
                  <span className="text-[11px]" style={{ color: RARITY_COLORS[set.Rarity] }}>{'★'.repeat(set.Rarity)}</span>
                </div>
                <p className="text-gray-500 text-xs mt-1">2-Piece: {set.TwoPieceBonus}</p>
              </div>
            </div>
            {expanded === set.id && (
              <div className="px-4 pb-4 border-t border-[#222] pt-3 space-y-3">
                <div className="p-3 bg-[#0a0a0a] rounded-lg">
                  <p className="text-[#FFE500] text-xs font-semibold mb-1">2-Piece Bonus</p>
                  <p className="text-gray-300 text-sm">{set.TwoPieceBonus}</p>
                </div>
                {set.FourPieceBonus && (
                  <div className="p-3 bg-[#0a0a0a] rounded-lg">
                    <p className="text-[#FFE500] text-xs font-semibold mb-1">4-Piece Bonus</p>
                    <p className="text-gray-300 text-sm">{set.FourPieceBonus}</p>
                  </div>
                )}
                {set.RecommendedFor && set.RecommendedFor.length > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs mb-2">Recommended For</p>
                    <div className="flex flex-wrap gap-2">
                      {set.RecommendedFor.map(name => (
                        <span key={name} className="text-xs bg-[#1a1a1a] text-gray-300 px-2 py-1 rounded-full border border-[#333]">{name}</span>
                      ))}
                    </div>
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
