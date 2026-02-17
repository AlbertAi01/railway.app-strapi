'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, Shield } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
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
      <RIOSHeader
        title="Equipment Systems"
        category="EQUIPMENT"
        code="RIOS-EQ-001"
        icon={<Shield size={28} />}
      />

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
        <input
          type="text"
          placeholder="Search equipment sets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      <div className="space-y-3">
        {filtered.map(set => (
          <div
            key={set.id}
            className={`bg-[var(--color-surface)] border clip-corner-tl overflow-hidden transition-all cursor-pointer ${
              expanded === set.id ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'
            }`}
            onClick={() => setExpanded(expanded === set.id ? null : set.id)}
          >
            <div className="flex items-center gap-4 p-4">
              <div className="w-14 h-14 clip-corner-tl flex items-center justify-center" style={{ backgroundColor: `${RARITY_COLORS[set.Rarity]}20` }}>
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
                <p className="text-[var(--color-text-tertiary)] text-xs mt-1">2-Piece: {set.TwoPieceBonus}</p>
              </div>
            </div>
            {expanded === set.id && (
              <div className="px-4 pb-4 border-t border-[var(--color-border)] pt-3 space-y-3">
                <div className="p-3 bg-[var(--color-surface-2)] clip-corner-tl">
                  <p className="text-[var(--color-accent)] text-xs font-semibold mb-1">2-Piece Bonus</p>
                  <p className="text-gray-300 text-sm">{set.TwoPieceBonus}</p>
                </div>
                {set.FourPieceBonus && (
                  <div className="p-3 bg-[var(--color-surface-2)] clip-corner-tl">
                    <p className="text-[var(--color-accent)] text-xs font-semibold mb-1">4-Piece Bonus</p>
                    <p className="text-gray-300 text-sm">{set.FourPieceBonus}</p>
                  </div>
                )}
                {set.RecommendedFor && set.RecommendedFor.length > 0 && (
                  <div>
                    <p className="text-[var(--color-text-tertiary)] text-xs mb-2">Recommended For</p>
                    <div className="flex flex-wrap gap-2">
                      {set.RecommendedFor.map(name => (
                        <span key={name} className="text-xs bg-[var(--color-surface-2)] text-gray-300 px-2 py-1 border border-[var(--color-border)]">{name}</span>
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
