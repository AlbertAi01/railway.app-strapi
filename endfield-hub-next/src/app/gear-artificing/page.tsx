'use client';

import { useState, useMemo } from 'react';
import { Wrench, Search, BookOpen, ChevronDown, ChevronRight, Info, Shield, Target, Zap } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import {
  GEAR_ARTIFICING_DATA,
  getGearByPart,
  getFodderRecommendations,
  getMatchTier,
  getStatPriority,
  STAT_PRIORITY_GUIDE,
  GOOD_MATCH_GUIDE,
  REDDIT_TIPS,
  type ArtificingGear,
  type PartType,
  type MatchTier as MatchTierType,
} from '@/data/artificing';

const CDN = 'https://endfieldtools.dev/assets/images/endfield';

// Match tier colors
const MATCH_TIER_COLORS: Record<MatchTierType, { border: string; bg: string; text: string }> = {
  'Best Pick': { border: '#22c55e', bg: '#22c55e15', text: '#22c55e' },
  'Good': { border: '#FFD429', bg: '#FFD42915', text: '#FFD429' },
  'Partial': { border: '#666', bg: '#66666615', text: '#999' },
  'Standard': { border: '#333', bg: '#33333315', text: '#666' },
};

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-colors border-b-2 ${
        active
          ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-surface)]'
          : 'border-transparent text-[var(--color-text-tertiary)] hover:text-white hover:bg-[var(--color-surface-2)]'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function MatchTierBadge({ tier }: { tier: MatchTierType }) {
  const colors = MATCH_TIER_COLORS[tier];
  return (
    <span
      className="text-xs font-bold px-2 py-1 border"
      style={{ borderColor: colors.border, backgroundColor: colors.bg, color: colors.text }}
    >
      {tier}
    </span>
  );
}

// Tab 1: Artificing Solver
function ArtificingSolver() {
  const [selectedGear, setSelectedGear] = useState<ArtificingGear | null>(null);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [showGearPicker, setShowGearPicker] = useState(false);
  const [filterPart, setFilterPart] = useState<PartType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGear = useMemo(() => {
    let gear = GEAR_ARTIFICING_DATA;
    if (filterPart) gear = gear.filter(g => g.partType === filterPart);
    if (searchTerm) gear = gear.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return gear;
  }, [filterPart, searchTerm]);

  const groupedGear = useMemo(() => {
    const grouped: Record<string, ArtificingGear[]> = {};
    filteredGear.forEach(g => {
      const key = g.setName || 'Standalone (Redeemer)';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(g);
    });
    return grouped;
  }, [filteredGear]);

  const fodderRecommendations = useMemo(() => {
    if (!selectedGear || !selectedStat) return [];
    return getFodderRecommendations(selectedGear.id, selectedStat, currentLevel);
  }, [selectedGear, selectedStat, currentLevel]);

  const selectedSubstat = selectedGear?.substats.find(s => s.statKey === selectedStat);

  return (
    <div className="space-y-6">
      {/* Gear Picker */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical">Select Gear Piece</h2>
          {selectedGear && (
            <button onClick={() => { setSelectedGear(null); setSelectedStat(null); }} className="text-xs text-[var(--color-text-tertiary)] hover:text-white">
              Clear
            </button>
          )}
        </div>
        <div className="p-4">
          {selectedGear ? (
            <div className="flex items-center gap-4 p-3 bg-[var(--color-surface-2)] border border-[var(--color-accent)]/30 clip-corner-tl">
              <div className="w-16 h-16 shrink-0 clip-corner-tl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
                <Shield size={24} className="text-[var(--color-accent)]" />
              </div>
              <div>
                <p className="text-white text-base font-bold">{selectedGear.name}</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  {selectedGear.setName || 'Standalone'} • {selectedGear.partType}
                </p>
              </div>
              <button
                onClick={() => setShowGearPicker(!showGearPicker)}
                className="ml-auto text-sm text-[var(--color-accent)] hover:underline"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowGearPicker(!showGearPicker)}
              className="flex items-center gap-2 px-4 py-3 border-l-3 border-l-[var(--color-accent)] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors text-sm text-white w-full justify-between"
            >
              <span>Select a gear piece to begin</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showGearPicker ? 'rotate-180' : ''}`} />
            </button>
          )}

          {showGearPicker && (
            <div className="mt-4 p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl space-y-4">
              <input
                type="text"
                placeholder="Search gear..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterPart(null)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors border ${
                    !filterPart ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  All
                </button>
                {(['Body', 'Hand', 'EDC'] as PartType[]).map(part => (
                  <button
                    key={part}
                    onClick={() => setFilterPart(part === filterPart ? null : part)}
                    className={`px-3 py-1.5 text-xs font-semibold transition-colors border ${
                      filterPart === part ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {part}
                  </button>
                ))}
              </div>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {Object.entries(groupedGear).map(([setName, gearList]) => (
                  <div key={setName}>
                    <p className="text-xs text-[var(--color-accent)] font-bold mb-2 uppercase tracking-wider">{setName}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {gearList.map(gear => (
                        <button
                          key={gear.id}
                          onClick={() => {
                            setSelectedGear(gear);
                            setShowGearPicker(false);
                            setSelectedStat(null);
                          }}
                          className="flex items-center gap-2 p-2 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors text-left"
                        >
                          <div className="w-10 h-10 shrink-0 bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center">
                            <Shield size={16} className="text-[var(--color-text-tertiary)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-bold truncate">{gear.name}</p>
                            <p className="text-[10px] text-[var(--color-text-tertiary)]">{gear.partType}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stat Selection & Level */}
      {selectedGear && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical">Select Stat to Artifice</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid gap-3">
              {selectedGear.substats.map(substat => (
                <button
                  key={substat.statKey}
                  onClick={() => setSelectedStat(substat.statKey)}
                  className={`flex items-center justify-between p-3 border transition-colors text-left ${
                    selectedStat === substat.statKey
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                      : 'border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-text-tertiary)]'
                  }`}
                >
                  <div>
                    <p className="text-white text-sm font-bold">{substat.displayName}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">Base: {substat.value}</p>
                  </div>
                  <div className="text-right">
                    <MatchTierBadge tier={getMatchTier(substat.qualityPct)} />
                    <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">{substat.qualityPct.toFixed(1)}% quality</p>
                  </div>
                </button>
              ))}
            </div>

            {selectedStat && selectedSubstat && (
              <div className="p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl space-y-3">
                <div>
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-2">Current Artificing Level</p>
                  <div className="flex gap-2">
                    {[0, 1, 2].map(level => (
                      <button
                        key={level}
                        onClick={() => setCurrentLevel(level)}
                        className={`flex-1 px-3 py-2 text-sm font-bold border transition-colors ${
                          currentLevel === level
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                            : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]'
                        }`}
                      >
                        Level {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-[var(--color-surface)] border-l-3 border-l-[var(--color-accent)] border border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-1">Stat Growth Preview</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedSubstat.valueByLevel.map((val, idx) => (
                      <span key={idx} className={`text-sm font-mono ${idx === currentLevel ? 'text-[var(--color-accent)] font-bold' : idx > currentLevel ? 'text-[var(--color-text-tertiary)]' : 'text-white'}`}>
                        L{idx}: {val} {idx < selectedSubstat.valueByLevel.length - 1 && <span className="text-[var(--color-text-tertiary)]">→</span>}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
                    Guarantee: {selectedSubstat.guaranteeTimes[currentLevel] || 'Max Level'} attempts for next level
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fodder Recommendations */}
      {selectedGear && selectedStat && fodderRecommendations.length > 0 && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical flex items-center gap-2">
              <Target size={16} className="text-[var(--color-accent)]" />
              Fodder Recommendations
            </h2>
          </div>
          <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
            {fodderRecommendations.map((rec, idx) => (
              <div key={`${rec.gear.id}-${rec.substat.statKey}-${idx}`} className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold truncate">{rec.gear.name}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {rec.gear.setName || 'Standalone'} • {rec.gear.partType}
                    </p>
                  </div>
                  <MatchTierBadge tier={rec.matchTier} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)]">{rec.substat.displayName}: <span className="font-mono text-white">{rec.substat.value}</span></p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)]">Quality: {rec.substat.qualityPct.toFixed(1)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--color-text-secondary)]">Guarantee</p>
                    <p className="text-xs font-mono text-white">
                      {rec.substat.guaranteeTimes[0]}/{rec.substat.guaranteeTimes[1]}/{rec.substat.guaranteeTimes[2]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Tab 2: Good Match Guide
function GoodMatchGuide() {
  const [expandedSection, setExpandedSection] = useState<string | null>('explanation');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-4">
      {/* Explanation */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
        <button
          onClick={() => toggleSection('explanation')}
          className="w-full flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] transition-colors text-left"
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical flex items-center gap-2">
            <Info size={16} className="text-[var(--color-accent)]" />
            What is Good Match?
          </h2>
          <ChevronRight className={`w-4 h-4 transition-transform ${expandedSection === 'explanation' ? 'rotate-90' : ''}`} />
        </button>
        {expandedSection === 'explanation' && (
          <div className="p-4 space-y-3">
            {GOOD_MATCH_GUIDE.explanation.map((text, idx) => (
              <p key={idx} className="text-sm text-[var(--color-text-secondary)]">{text}</p>
            ))}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              {Object.entries(MATCH_TIER_COLORS).map(([tier, colors]) => (
                <div key={tier} className="p-2 border text-center" style={{ borderColor: colors.border, backgroundColor: colors.bg }}>
                  <p className="text-xs font-bold" style={{ color: colors.text }}>{tier}</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">
                    {tier === 'Best Pick' && '100%'}
                    {tier === 'Good' && '70-99%'}
                    {tier === 'Partial' && '45-69%'}
                    {tier === 'Standard' && '<45%'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Examples */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
        <button
          onClick={() => toggleSection('examples')}
          className="w-full flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] transition-colors text-left"
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical">Examples</h2>
          <ChevronRight className={`w-4 h-4 transition-transform ${expandedSection === 'examples' ? 'rotate-90' : ''}`} />
        </button>
        {expandedSection === 'examples' && (
          <div className="p-4 space-y-4">
            {GOOD_MATCH_GUIDE.examples.map((example, idx) => (
              <div key={idx} className="p-3 bg-[var(--color-surface-2)] border-l-3 border-l-[var(--color-accent)] border border-[var(--color-border)]">
                <p className="text-sm text-white font-bold mb-1">{example.scenario}</p>
                <p className="text-xs text-[var(--color-text-secondary)] font-mono mb-1">{example.calculation}</p>
                <p className="text-xs text-[var(--color-accent)]">{example.result}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Reference */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
        <button
          onClick={() => toggleSection('quickref')}
          className="w-full flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] transition-colors text-left"
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical">Quick Reference</h2>
          <ChevronRight className={`w-4 h-4 transition-transform ${expandedSection === 'quickref' ? 'rotate-90' : ''}`} />
        </button>
        {expandedSection === 'quickref' && (
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-2 px-3 text-[var(--color-accent)] font-bold">Slot</th>
                  <th className="text-left py-2 px-3 text-[var(--color-accent)] font-bold">Stat</th>
                  <th className="text-left py-2 px-3 text-[var(--color-accent)] font-bold">Best Fodder</th>
                  <th className="text-left py-2 px-3 text-[var(--color-accent)] font-bold">Good Fodder</th>
                </tr>
              </thead>
              <tbody>
                {GOOD_MATCH_GUIDE.quickReference.map((ref, idx) => (
                  <tr key={idx} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)]">
                    <td className="py-2 px-3 text-white font-bold">{ref.slot}</td>
                    <td className="py-2 px-3 text-[var(--color-text-secondary)]">{ref.stat}</td>
                    <td className="py-2 px-3 text-green-400">{ref.bestFodder}</td>
                    <td className="py-2 px-3 text-yellow-400">{ref.goodFodder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
        <button
          onClick={() => toggleSection('tips')}
          className="w-full flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] transition-colors text-left"
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical flex items-center gap-2">
            <Zap size={16} className="text-[var(--color-accent)]" />
            Pro Tips
          </h2>
          <ChevronRight className={`w-4 h-4 transition-transform ${expandedSection === 'tips' ? 'rotate-90' : ''}`} />
        </button>
        {expandedSection === 'tips' && (
          <div className="p-4 space-y-2">
            {GOOD_MATCH_GUIDE.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 bg-[var(--color-surface-2)]">
                <span className="text-[var(--color-accent)] text-xs mt-0.5">▸</span>
                <p className="text-sm text-[var(--color-text-secondary)]">{tip}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stat Priority Guide */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical">Stat Upgrade Priority</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs text-[var(--color-accent)] font-bold mb-2 uppercase tracking-wider">General Tips</p>
            <ul className="space-y-1">
              {STAT_PRIORITY_GUIDE.general.map((tip, idx) => (
                <li key={idx} className="text-sm text-[var(--color-text-secondary)] flex items-start gap-2">
                  <span className="text-[var(--color-accent)] text-xs mt-0.5">▸</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
          {(['Body', 'Hand', 'EDC'] as PartType[]).map(part => (
            <div key={part}>
              <p className="text-xs text-[var(--color-accent)] font-bold mb-2 uppercase tracking-wider">{part}</p>
              <ul className="space-y-1">
                {getStatPriority(part).map((priority, idx) => (
                  <li key={idx} className="text-sm text-[var(--color-text-secondary)] flex items-start gap-2">
                    <span className="text-[var(--color-accent)] text-xs mt-0.5">▸</span>
                    <span>{priority}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Reddit Tips */}
      <div className="p-4 bg-[var(--color-surface)] border-l-3 border-l-[var(--color-accent)] border border-[var(--color-border)] clip-corner-tl">
        <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
          <Zap size={14} className="text-[var(--color-accent)]" />
          Community Tips from Reddit
        </h3>
        <ul className="space-y-2">
          {REDDIT_TIPS.map((tip, idx) => (
            <li key={idx} className="text-xs text-[var(--color-text-secondary)] flex items-start gap-2">
              <span className="text-[var(--color-accent)] mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Tab 3: Gear Database
function GearDatabase() {
  const [filterPart, setFilterPart] = useState<PartType | null>(null);
  const [filterSet, setFilterSet] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const sets = useMemo(() => {
    const setNames = new Set<string>();
    GEAR_ARTIFICING_DATA.forEach(g => {
      if (g.setName) setNames.add(g.setName);
    });
    return Array.from(setNames).sort();
  }, []);

  const filteredGear = useMemo(() => {
    let gear = GEAR_ARTIFICING_DATA;
    if (filterPart) gear = gear.filter(g => g.partType === filterPart);
    if (filterSet) {
      if (filterSet === 'Standalone') {
        gear = gear.filter(g => !g.setName);
      } else {
        gear = gear.filter(g => g.setName === filterSet);
      }
    }
    if (searchTerm) gear = gear.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return gear;
  }, [filterPart, filterSet, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            placeholder="Search gear..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white text-sm"
          />
        </div>
        <div>
          <p className="text-xs text-[var(--color-text-tertiary)] mb-2 uppercase tracking-wider">Filter by Slot</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterPart(null)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors border ${
                !filterPart ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'
              }`}
            >
              All
            </button>
            {(['Body', 'Hand', 'EDC'] as PartType[]).map(part => (
              <button
                key={part}
                onClick={() => setFilterPart(part === filterPart ? null : part)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors border ${
                  filterPart === part ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'
                }`}
              >
                {part}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-[var(--color-text-tertiary)] mb-2 uppercase tracking-wider">Filter by Set</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterSet(null)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors border ${
                !filterSet ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterSet(filterSet === 'Standalone' ? null : 'Standalone')}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors border ${
                filterSet === 'Standalone' ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'
              }`}
            >
              Standalone
            </button>
            {sets.map(set => (
              <button
                key={set}
                onClick={() => setFilterSet(filterSet === set ? null : set)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors border ${
                  filterSet === set ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'
                }`}
              >
                {set}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-text-tertiary)]">
          Showing <span className="text-[var(--color-accent)] font-bold">{filteredGear.length}</span> gear piece{filteredGear.length !== 1 ? 's' : ''}
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {filteredGear.map(gear => (
            <div key={gear.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 hover:border-[var(--color-accent)]/50 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 shrink-0 clip-corner-tl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center">
                  <Shield size={20} className="text-[var(--color-accent)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold">{gear.name}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    {gear.setName || 'Standalone'} • {gear.partType}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {gear.substats.map(substat => (
                  <div key={substat.statKey} className="p-2 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-white font-bold">{substat.displayName}</p>
                      <MatchTierBadge tier={getMatchTier(substat.qualityPct)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Base: <span className="font-mono text-white">{substat.value}</span>
                      </p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">
                        Quality: {substat.qualityPct.toFixed(1)}%
                      </p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {substat.valueByLevel.map((val, idx) => (
                        <span key={idx} className="text-[10px] font-mono text-[var(--color-text-tertiary)]">
                          L{idx}:{val}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GearArtificingPage() {
  const [activeTab, setActiveTab] = useState<'solver' | 'guide' | 'database'>('solver');

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader
          title="Gear Artificing Solver"
          category="OPTIMIZATION"
          code="RIOS-ART-001"
          icon={<Wrench size={28} />}
        />

        <p className="text-sm text-[var(--color-text-tertiary)] mb-4">
          Find the perfect fodder gear for artificing. Understand Good Match quality, guarantee times, and stat priority.
          No more guessing what to feed into your gear upgrades.
        </p>

        {/* Tab Bar */}
        <div className="flex border-b border-[var(--color-border)] mb-6">
          <TabButton
            active={activeTab === 'solver'}
            onClick={() => setActiveTab('solver')}
            icon={<Target size={14} />}
            label="Artificing Solver"
          />
          <TabButton
            active={activeTab === 'guide'}
            onClick={() => setActiveTab('guide')}
            icon={<BookOpen size={14} />}
            label="Good Match Guide"
          />
          <TabButton
            active={activeTab === 'database'}
            onClick={() => setActiveTab('database')}
            icon={<Search size={14} />}
            label="Gear Database"
          />
        </div>

        {activeTab === 'solver' && <ArtificingSolver />}
        {activeTab === 'guide' && <GoodMatchGuide />}
        {activeTab === 'database' && <GearDatabase />}
      </div>
    </div>
  );
}
