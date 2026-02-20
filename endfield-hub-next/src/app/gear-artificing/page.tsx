'use client';

import { useState, useMemo, startTransition } from 'react';
import Image from 'next/image';
import { Wrench, Search, X } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { GEAR_SETS, STANDALONE_GEAR, TIER_COLORS, type GearPiece, type GearSet } from '@/data/gear';

// ──────────── Artificing Solver Logic ────────────

// Slot type: Body (Armor/Poncho/Suit/Overalls/Plating), Hand (Gloves/Gauntlets/Fists/Wrists), EDC (other smaller accessories)
type SlotType = 'Body' | 'Hand' | 'EDC';

const HAND_KEYWORDS = ['gloves', 'gauntlets', 'fists', 'wrists', 'hands'];
const BODY_KEYWORDS = ['armor', 'poncho', 'overalls', 'plating', 'suit', 'plate', 'vest', 'cleansuit', 'heavy ar'];

function getSlotType(piece: GearPiece): SlotType {
  const name = piece.name.toLowerCase();
  if (HAND_KEYWORDS.some(k => name.includes(k))) return 'Hand';
  if (BODY_KEYWORDS.some(k => name.includes(k))) return 'Body';
  // Fallback to DEF-based heuristic for items that don't match name patterns
  if (piece.def >= 50) return 'Body';
  if (piece.def >= 30) return 'Hand';
  return 'EDC';
}

// Primary attributes (Strength, Agility, Intellect, Will)
const PRIMARY_ATTRS = ['Strength', 'Agility', 'Intellect', 'Will'];

function isPrimaryAttr(statName: string): boolean {
  return PRIMARY_ATTRS.includes(statName);
}

// Parse stat value from "+87" or "+20.7%" or "-17.1%"
function parseStatValue(val: string): number {
  return Math.abs(parseFloat(val.replace(/[+%]/g, '')));
}

// For each stat name, compute the max value among all gear in that slot
function buildMaxStatMap(allGear: GearPiece[]): Record<string, Record<SlotType, number>> {
  const map: Record<string, Record<SlotType, number>> = {};
  allGear.forEach(piece => {
    const slot = getSlotType(piece);
    piece.stats.forEach(s => {
      if (!map[s.name]) map[s.name] = { Body: 0, Hand: 0, EDC: 0 };
      const v = parseStatValue(s.value);
      if (v > map[s.name][slot]) map[s.name][slot] = v;
    });
  });
  return map;
}

// Match tier from quality %
type MatchTier = 'Best Pick' | 'Good' | 'Partial';

function getMatchTier(qualityPct: number): MatchTier {
  if (qualityPct >= 99.5) return 'Best Pick';
  if (qualityPct >= 65) return 'Good';
  return 'Partial';
}

// For a given target stat, compute which gear pieces are good fodder
// and what tier they are at each artificing level transition
interface FodderResult {
  piece: GearPiece;
  setName: string | null;
  stat: { name: string; value: string };
  qualityPct: number;
  tiers: [MatchTier, MatchTier, MatchTier]; // L0→1, L1→2, L2→3
  overallTier: MatchTier;
}

function computeFodderResults(
  targetPiece: GearPiece,
  targetStatName: string,
  currentLevel: number,
  allGear: GearPiece[],
  maxStatMap: Record<string, Record<SlotType, number>>,
): FodderResult[] {
  const targetSlot = getSlotType(targetPiece);
  const maxVal = maxStatMap[targetStatName]?.[targetSlot] || 1;

  // Find all same-slot gear that has this stat (excluding the target itself)
  const results: FodderResult[] = [];

  allGear.forEach(piece => {
    if (piece.name === targetPiece.name && piece.setName === targetPiece.setName) return;
    if (getSlotType(piece) !== targetSlot) return;

    const matchingStat = piece.stats.find(s => s.name === targetStatName);
    if (!matchingStat) return;

    const val = parseStatValue(matchingStat.value);
    const qualityPct = (val / maxVal) * 100;

    // Compute tier at each level transition
    // Higher levels have more guarantee attempts needed, so quality threshold shifts
    const tierAtLevel = (level: number): MatchTier => {
      // Level adjustments: at higher levels, the quality "feel" changes
      // L0→1: base quality, L1→2: slightly harder, L2→3: hardest
      const adjustedPct = level === 0 ? qualityPct : level === 1 ? qualityPct * 0.85 : qualityPct * 0.7;
      return getMatchTier(adjustedPct);
    };

    const tiers: [MatchTier, MatchTier, MatchTier] = [tierAtLevel(0), tierAtLevel(1), tierAtLevel(2)];

    results.push({
      piece,
      setName: piece.setName,
      stat: matchingStat,
      qualityPct,
      tiers,
      overallTier: tiers[currentLevel],
    });
  });

  // Sort: Best Pick first, then Good, then Partial. Within tier, sort by quality%
  const tierOrder: Record<MatchTier, number> = { 'Best Pick': 0, 'Good': 1, 'Partial': 2 };
  results.sort((a, b) => {
    const tierDiff = tierOrder[a.overallTier] - tierOrder[b.overallTier];
    if (tierDiff !== 0) return tierDiff;
    return b.qualityPct - a.qualityPct;
  });

  return results;
}

// ──────────── Collect gear ────────────

function getAllGear(): { allPieces: GearPiece[]; t4Sets: GearSet[]; allSets: GearSet[] } {
  const t4Sets = GEAR_SETS.filter(s => s.phase === 'Late Game (Lv70)');
  // Collect ALL gear for fodder matching (all tiers can be used as fodder)
  const allPieces: GearPiece[] = [];
  GEAR_SETS.forEach(s => allPieces.push(...s.pieces));
  allPieces.push(...STANDALONE_GEAR);
  return { allPieces, t4Sets, allSets: GEAR_SETS };
}

// ──────────── Tier Badge Colors ────────────

const TIER_STYLES: Record<MatchTier, { border: string; bg: string; text: string }> = {
  'Best Pick': { border: 'border-[#22c55e]', bg: 'bg-[#22c55e]/15', text: 'text-[#22c55e]' },
  'Good': { border: 'border-[var(--color-accent)]', bg: 'bg-[var(--color-accent)]/15', text: 'text-[var(--color-accent)]' },
  'Partial': { border: 'border-[#666]', bg: 'bg-[#666]/15', text: 'text-[#999]' },
};

// ──────────── Components ────────────

function TierBadge({ tier, className = '' }: { tier: MatchTier; className?: string }) {
  const s = TIER_STYLES[tier];
  return (
    <span className={`text-xs font-bold px-2.5 py-1 border ${s.border} ${s.bg} ${s.text} ${className}`}>
      {tier}
    </span>
  );
}

function GearIcon({ src, name, tier, className = 'w-12 h-12' }: { src?: string; name: string; tier: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const tierColor = TIER_COLORS[tier as keyof typeof TIER_COLORS] || TIER_COLORS.T0;

  if (!src || failed) {
    return (
      <div
        className={`${className} shrink-0 flex items-center justify-center border border-[var(--color-border)]`}
        style={{ backgroundColor: `${tierColor}20` }}
      >
        <span className="text-lg font-bold" style={{ color: tierColor }}>
          {name[0]}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={48}
      height={48}
      className={`${className} shrink-0 object-contain`}
      loading="lazy"
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}

function LevelTierTag({ level, tier }: { level: string; tier: MatchTier }) {
  const isBest = tier === 'Best Pick';
  return (
    <span className={`text-[11px] px-2 py-0.5 border ${isBest ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-bold' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)]'}`}>
      {level}: {tier}
    </span>
  );
}

// ──────────── Gear Picker Modal ────────────

function GearPickerModal({
  sets,
  allPieces,
  onSelect,
  onClose,
}: {
  sets: GearSet[];
  allPieces: GearPiece[];
  onSelect: (piece: GearPiece) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');

  const filteredSets = useMemo(() => {
    if (!search) return sets;
    const q = search.toLowerCase();
    return sets
      .map(s => ({
        ...s,
        pieces: s.pieces.filter(p => p.name.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)),
      }))
      .filter(s => s.pieces.length > 0);
  }, [sets, search]);

  // Standalone gear
  const standalone = useMemo(() => {
    const q = search.toLowerCase();
    return allPieces.filter(p => !p.setName && (!search || p.name.toLowerCase().includes(q)));
  }, [allPieces, search]);

  return (
    <div className="rios-modal-backdrop" onClick={onClose}>
      <div className="rios-modal-panel rios-modal-xl" style={{ borderColor: 'var(--color-accent)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="rios-modal-header">
          <h2 className="text-lg font-bold text-white font-tactical">Pick a Gear</h2>
          <button onClick={onClose} className="text-[var(--color-text-tertiary)] hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-[var(--color-border)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={e => startTransition(() => setSearch(e.target.value))}
              autoFocus
              className="w-full pl-10 pr-3 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-accent)] focus:outline-none text-white text-sm"
            />
          </div>
        </div>

        {/* Gear List */}
        <div className="rios-modal-body px-5 py-4 space-y-6">
          <div className="text-center text-sm text-[var(--color-text-tertiary)] border-b border-[var(--color-border)] pb-2">
            Late Game (Lv70)
          </div>

          {filteredSets.map(gearSet => (
            <div key={gearSet.name}>
              <h3 className="text-[var(--color-accent)] font-bold text-sm mb-1">{gearSet.name}</h3>
              <p className="text-xs text-[var(--color-text-tertiary)] mb-3 leading-relaxed">
                <span className="text-[var(--color-accent)] font-bold">3pc:</span> {gearSet.setBonus}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {gearSet.pieces.map(piece => (
                  <button
                    key={`${piece.name}-${piece.id}`}
                    onClick={() => { onSelect(piece); onClose(); }}
                    className="flex items-center gap-2.5 p-2 border-2 border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-accent)] transition-colors text-left rounded-sm"
                  >
                    <GearIcon src={piece.icon} name={piece.name} tier={piece.tier} />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold bg-[var(--color-accent)] text-black px-1 py-0.5 leading-none">{piece.tier}</span>
                        <span className="text-xs font-semibold text-white truncate">{piece.name}</span>
                      </div>
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">DEF +{piece.def}</p>
                      {piece.stats.map((s, i) => (
                        <p key={i} className={`text-[11px] ${isPrimaryAttr(s.name) ? 'text-[var(--color-accent)]' : 'text-[#22c55e]'}`}>
                          {s.name} {s.value}
                        </p>
                      ))}
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">Lv.{piece.level}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {standalone.length > 0 && (
            <div>
              <h3 className="text-[var(--color-accent)] font-bold text-sm mb-3">Standalone (Redeemer)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {standalone.map(piece => (
                  <button
                    key={`${piece.name}-${piece.id}`}
                    onClick={() => { onSelect(piece); onClose(); }}
                    className="flex items-center gap-2.5 p-2 border-2 border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-accent)] transition-colors text-left rounded-sm"
                  >
                    <GearIcon src={piece.icon} name={piece.name} tier={piece.tier} />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold bg-[var(--color-accent)] text-black px-1 py-0.5 leading-none">{piece.tier}</span>
                        <span className="text-xs font-semibold text-white truncate">{piece.name}</span>
                      </div>
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">DEF +{piece.def}</p>
                      {piece.stats.map((s, i) => (
                        <p key={i} className={`text-[11px] ${isPrimaryAttr(s.name) ? 'text-[var(--color-accent)]' : 'text-[#22c55e]'}`}>
                          {s.name} {s.value}
                        </p>
                      ))}
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">Lv.{piece.level}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────── Main Page ────────────

export default function GearArtificingPage() {
  const { allPieces, t4Sets } = useMemo(() => getAllGear(), []);
  const maxStatMap = useMemo(() => buildMaxStatMap(allPieces), [allPieces]);

  const [selectedPiece, setSelectedPiece] = useState<GearPiece | null>(null);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  const fodderResults = useMemo(() => {
    if (!selectedPiece || !selectedStat) return [];
    return computeFodderResults(selectedPiece, selectedStat, currentLevel, allPieces, maxStatMap);
  }, [selectedPiece, selectedStat, currentLevel, allPieces, maxStatMap]);

  const handleSelectGear = (piece: GearPiece) => {
    setSelectedPiece(piece);
    setSelectedStat(null);
    setCurrentLevel(0);
  };

  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Gear Artificing Solver - Zero Sanity',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    url: 'https://www.zerosanity.app/gear-artificing',
    description: 'Calculate optimal equipment substats and probabilities for Arknights: Endfield',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <div className="max-w-4xl mx-auto">
        <RIOSHeader
          title="Gear Artificing Solver"
          subtitle="Pick your gear, then use the best matching fodder pieces by chance tier."
          category="OPTIMIZATION"
          code="RIOS-ART-001"
          icon={<Wrench size={28} />}
        />

        {/* ─── Selection Card ─── */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-accent)]/30 p-5 space-y-5 mb-6">
          {/* Pick Equipment */}
          <div>
            <h2 className="text-sm font-bold text-white mb-3">Pick your equipment</h2>
            {!selectedPiece && (
              <p className="text-xs text-[var(--color-text-tertiary)] mb-3">Start by selecting your current equipment.</p>
            )}
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-[var(--color-accent)] bg-[var(--color-surface-2)] hover:bg-[var(--color-accent)]/10 transition-colors text-sm text-[var(--color-accent)] font-bold"
            >
              <Search size={16} />
              Open Equipment Picker
            </button>
            {selectedPiece && (
              <p className="text-sm text-white mt-3">
                Selected: <span className="font-bold">{selectedPiece.name}</span>
              </p>
            )}
          </div>

          {/* Level & Stat Selection */}
          {selectedPiece && (
            <>
              <div>
                <h2 className="text-sm font-bold text-white mb-3">Current Artificing Level</h2>
                <div className="flex gap-2">
                  {[0, 1, 2].map(level => (
                    <button
                      key={level}
                      onClick={() => setCurrentLevel(level)}
                      className={`px-5 py-2 text-sm font-bold border transition-colors ${
                        currentLevel === level
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]'
                      }`}
                    >
                      Level {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-bold text-white mb-3">Stat to enhance</h2>
                <div className="flex flex-wrap gap-2">
                  {selectedPiece.stats.map(s => (
                    <button
                      key={s.name}
                      onClick={() => setSelectedStat(s.name)}
                      className={`px-4 py-2 text-sm font-bold border transition-colors ${
                        selectedStat === s.name
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ─── Results ─── */}
        {selectedPiece && selectedStat ? (
          fodderResults.length > 0 ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-accent)]/30 overflow-hidden mb-6">
              <div className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-[var(--color-accent)]">&#9675;</span>
                  Best gears to artifice into
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {fodderResults.map((result, idx) => {
                  const isBestOverall = idx === 0 && result.overallTier === 'Best Pick';
                  return (
                    <div
                      key={`${result.piece.name}-${result.piece.id}-${idx}`}
                      className={`relative p-3.5 border-2 transition-colors ${
                        isBestOverall
                          ? 'border-[#22c55e] bg-[#22c55e]/5'
                          : result.overallTier === 'Best Pick'
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                          : result.overallTier === 'Good'
                          ? 'border-[var(--color-accent)]/50 bg-[var(--color-surface-2)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface-2)]'
                      }`}
                    >
                      {/* Best Pick ribbon */}
                      {isBestOverall && (
                        <div className="absolute -top-0 left-3">
                          <span className="text-[10px] font-bold bg-[#22c55e] text-black px-2 py-0.5">
                            Best Pick
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        {/* Icon */}
                        <GearIcon src={result.piece.icon} name={result.piece.name} tier={result.piece.tier} />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm">{result.piece.name}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <LevelTierTag level="Level 0→1" tier={result.tiers[0]} />
                            <LevelTierTag level="Level 1→2" tier={result.tiers[1]} />
                            <LevelTierTag level="Level 2→3" tier={result.tiers[2]} />
                          </div>
                        </div>

                        {/* Overall badge */}
                        <TierBadge tier={result.overallTier} className="shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 mb-6">
              <p className="text-sm text-[var(--color-text-tertiary)]">
                No matching fodder gear found for <span className="text-[var(--color-accent)] font-bold">{selectedStat}</span> in the same equipment slot. Try selecting a different stat.
              </p>
            </div>
          )
        ) : selectedPiece && !selectedStat ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 mb-6">
            <p className="text-sm text-[var(--color-text-tertiary)]">
              Select your current artificing level and stat to see the best gear list.
            </p>
          </div>
        ) : null}

        {/* Gear Picker Modal */}
        {showPicker && (
          <GearPickerModal
            sets={t4Sets}
            allPieces={allPieces}
            onSelect={handleSelectGear}
            onClose={() => setShowPicker(false)}
          />
        )}
      </div>
    </div>
  );
}
