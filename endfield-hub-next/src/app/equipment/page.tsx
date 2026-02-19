'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, Shield } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { GEAR_SETS, TIER_COLORS } from '@/data/gear';
import { EQUIPMENT_ICONS } from '@/lib/assets';

function SetIcon({ src, name, tierColor }: { src: string; name: string; tierColor: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="text-lg font-bold" style={{ color: tierColor }}>{name[0]}</span>;
  return <Image src={src} alt={name} width={56} height={56} className="object-contain" loading="lazy" unoptimized onError={() => setFailed(true)} />;
}

export default function Equipment() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = GEAR_SETS.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <RIOSHeader
        title="Equipment Systems"
        category="EQUIPMENT"
        code="RIOS-EQ-001"
        icon={<Shield size={32} />}
      />

      <div className="relative mb-8">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Search equipment sets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      <div className="space-y-4">
        {filtered.map(set => {
          const tierColor = TIER_COLORS[set.pieces[0]?.tier] || TIER_COLORS.T0;
          return (
            <div
              key={set.name}
              className={`bg-[var(--color-surface)] border clip-corner-tl overflow-hidden transition-all cursor-pointer shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 ${
                expanded === set.name ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'
              }`}
              onClick={() => setExpanded(expanded === set.name ? null : set.name)}
            >
              <div className="flex items-center gap-4 p-5">
                <div className="w-14 h-14 clip-corner-tl flex items-center justify-center" style={{ backgroundColor: `${tierColor}20` }}>
                  {set.icon || EQUIPMENT_ICONS[set.name] ? (
                    <SetIcon src={(set.icon || EQUIPMENT_ICONS[set.name])!} name={set.name} tierColor={tierColor} />
                  ) : (
                    <span className="text-lg font-bold" style={{ color: tierColor }}>{set.name[0]}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold text-base">{set.name}</h3>
                    <span className="text-[12px] px-2 py-0.5 clip-corner-tl" style={{ backgroundColor: `${tierColor}30`, color: tierColor }}>
                      {set.pieces[0]?.tier}
                    </span>
                    <span className="text-[12px] text-[var(--color-text-muted)]">{set.phase}</span>
                  </div>
                  <p className="text-[var(--color-text-muted)] text-sm mt-1 line-clamp-1">3-Piece: {set.setBonus}</p>
                </div>
              </div>
              {expanded === set.name && (
                <div className="px-5 pb-5 border-t border-[var(--color-border)] pt-4 space-y-4">
                  <div className="p-4 bg-[var(--color-surface-2)] clip-corner-tl">
                    <p className="text-[var(--color-accent)] text-sm font-semibold mb-1">3-Piece Set Bonus</p>
                    <p className="text-[var(--color-text-secondary)] text-base">{set.setBonus}</p>
                  </div>
                  <div>
                    <p className="text-[var(--color-text-muted)] text-sm font-semibold mb-3">Set Pieces ({set.pieces.length})</p>
                    <div className="grid grid-cols-1 gap-3">
                      {set.pieces.map(piece => (
                        <div key={piece.id} className="p-3 bg-[var(--color-surface-2)] clip-corner-tl text-sm flex items-center gap-3">
                          {piece.icon && (
                            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${tierColor}15` }}>
                              <Image src={piece.icon} alt={piece.name} width={48} height={48} className="object-contain" loading="lazy" unoptimized />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white font-medium">{piece.name}</span>
                              <span className="text-[var(--color-text-muted)]">DEF {piece.def}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {piece.stats.map((stat, idx) => (
                                <span key={idx} className="text-[var(--color-accent)]">
                                  {stat.name} {stat.value}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
