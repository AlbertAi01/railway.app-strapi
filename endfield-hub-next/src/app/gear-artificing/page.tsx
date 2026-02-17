'use client';

import { useState, useMemo } from 'react';
import { Wrench, Search, ChevronDown, ChevronRight } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import {
  GEAR_SETS,
  STANDALONE_GEAR,
  TIER_COLORS,
  TIER_BORDER_COLORS,
  type GearSet,
  type GearPiece,
  type GamePhase,
  type GearTier
} from '@/data/gear';

type PhaseFilter = GamePhase | 'Standalone';

export default function GearArtificingPage() {
  const [selectedPhase, setSelectedPhase] = useState<PhaseFilter>('Late Game (Lv70)');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSets, setExpandedSets] = useState<Set<string>>(new Set());

  const phases: PhaseFilter[] = [
    'Late Game (Lv70)',
    'Mid Game (Lv36-50)',
    'Early Game (Lv10-28)',
    'Standalone'
  ];

  // Filter gear sets by phase and search query
  const filteredSets = useMemo(() => {
    if (selectedPhase === 'Standalone') return [];

    return GEAR_SETS.filter(set => {
      if (set.phase !== selectedPhase) return false;
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      const matchesSetName = set.name.toLowerCase().includes(query);
      const matchesPieceName = set.pieces.some(piece =>
        piece.name.toLowerCase().includes(query)
      );

      return matchesSetName || matchesPieceName;
    });
  }, [selectedPhase, searchQuery]);

  // Filter standalone gear by search query
  const filteredStandalone = useMemo(() => {
    if (selectedPhase !== 'Standalone') return [];

    if (!searchQuery) return STANDALONE_GEAR;

    const query = searchQuery.toLowerCase();
    return STANDALONE_GEAR.filter(piece =>
      piece.name.toLowerCase().includes(query)
    );
  }, [selectedPhase, searchQuery]);

  // Group standalone gear by tier
  const standaloneByTier = useMemo(() => {
    const grouped = new Map<GearTier, GearPiece[]>();
    filteredStandalone.forEach(piece => {
      if (!grouped.has(piece.tier)) {
        grouped.set(piece.tier, []);
      }
      grouped.get(piece.tier)!.push(piece);
    });
    return grouped;
  }, [filteredStandalone]);

  const toggleSetExpanded = (setName: string) => {
    setExpandedSets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(setName)) {
        newSet.delete(setName);
      } else {
        newSet.add(setName);
      }
      return newSet;
    });
  };

  const renderGearPiece = (piece: GearPiece) => (
    <div
      key={piece.id}
      className="bg-[var(--color-surface-2)] border-l-4 clip-corner-tl p-4"
      style={{ borderLeftColor: TIER_BORDER_COLORS[piece.tier] }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h5 className="text-white font-bold">{piece.name}</h5>
          <div className="flex gap-3 text-sm text-[var(--color-text-tertiary)] mt-1">
            <span>Lv.{piece.level}</span>
            <span>DEF: {piece.def}</span>
            <span
              className="font-bold"
              style={{ color: TIER_COLORS[piece.tier] }}
            >
              {piece.tier}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {piece.stats.map((stat, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-[var(--color-text-secondary)]">{stat.name}</span>
            <span className="text-[var(--color-accent)] font-mono">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGearSet = (set: GearSet) => {
    const isExpanded = expandedSets.has(set.name);

    return (
      <div
        key={set.name}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden"
      >
        {/* Set Header */}
        <button
          onClick={() => toggleSetExpanded(set.name)}
          className="w-full p-6 text-left hover:bg-[var(--color-surface-2)] transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-white">{set.name}</h3>
                <span
                  className="px-3 py-1 text-xs font-bold clip-corner-tl"
                  style={{
                    backgroundColor: TIER_COLORS[set.pieces[0]?.tier] + '20',
                    color: TIER_COLORS[set.pieces[0]?.tier],
                    border: `1px solid ${TIER_BORDER_COLORS[set.pieces[0]?.tier]}`
                  }}
                >
                  {set.pieces[0]?.tier}
                </span>
              </div>

              <div className="text-sm text-[var(--color-text-secondary)]">
                <span className="text-[var(--color-accent)] font-bold">3-Piece Set Bonus:</span> {set.setBonus}
              </div>

              <div className="text-xs text-[var(--color-text-tertiary)] mt-2">
                {set.pieces.length} {set.pieces.length === 1 ? 'piece' : 'pieces'}
              </div>
            </div>

            <div className="ml-4 text-[var(--color-accent)]">
              {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
            </div>
          </div>
        </button>

        {/* Expanded Set Pieces */}
        {isExpanded && (
          <div className="border-t border-[var(--color-border)] p-6 bg-[var(--color-surface-2)]">
            <div className="grid gap-4 md:grid-cols-2">
              {set.pieces.map(piece => renderGearPiece(piece))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[var(--color-text-secondary)] p-6">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader
          title="Gear Analysis"
          category="EQUIPMENT"
          code="RIOS-ART-001"
          icon={<Wrench size={28} />}
        />

        {/* Phase Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {phases.map(phase => (
            <button
              key={phase}
              onClick={() => setSelectedPhase(phase)}
              className={`px-6 py-3 clip-corner-tl font-bold transition-colors ${
                selectedPhase === phase
                  ? 'bg-[var(--color-accent)] text-black'
                  : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-white'
              }`}
            >
              {phase}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-text-tertiary)]"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by set or piece name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl pl-12 pr-4 py-4 text-white placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Gear Sets */}
        {selectedPhase !== 'Standalone' && (
          <div className="space-y-4">
            {filteredSets.length === 0 ? (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-12 text-center">
                <p className="text-[var(--color-text-tertiary)]">
                  No gear sets found matching your search.
                </p>
              </div>
            ) : (
              filteredSets.map(set => renderGearSet(set))
            )}
          </div>
        )}

        {/* Standalone Gear */}
        {selectedPhase === 'Standalone' && (
          <div className="space-y-6">
            {Array.from(standaloneByTier.keys())
              .sort((a, b) => {
                const tierOrder = { T4: 0, T3: 1, T2: 2, T1: 3, T0: 4 };
                return tierOrder[a] - tierOrder[b];
              })
              .map(tier => {
                const pieces = standaloneByTier.get(tier)!;

                return (
                  <div key={tier} className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-white">Tier {tier}</h3>
                      <span
                        className="px-3 py-1 text-xs font-bold clip-corner-tl"
                        style={{
                          backgroundColor: TIER_COLORS[tier] + '20',
                          color: TIER_COLORS[tier],
                          border: `1px solid ${TIER_BORDER_COLORS[tier]}`
                        }}
                      >
                        {pieces.length} {pieces.length === 1 ? 'piece' : 'pieces'}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {pieces.map(piece => renderGearPiece(piece))}
                    </div>
                  </div>
                );
              })}

            {standaloneByTier.size === 0 && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-12 text-center">
                <p className="text-[var(--color-text-tertiary)]">
                  No standalone gear found matching your search.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
