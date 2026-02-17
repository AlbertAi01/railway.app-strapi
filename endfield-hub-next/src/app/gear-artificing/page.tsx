'use client';

import { useState } from 'react';
import { Shield, TrendingUp, Wrench } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';

const EQUIPMENT_TIERS = ['T1', 'T2', 'T3', 'T4', 'T5'];

const SUBSTAT_TYPES = [
  'ATK%',
  'DEF%',
  'HP%',
  'ATK Flat',
  'DEF Flat',
  'HP Flat',
  'CRIT Rate',
  'CRIT DMG',
  'Effect RES',
  'Effect HIT'
];

const PROBABILITY_TABLE = {
  T1: { 1: 100, 2: 0, 3: 0, 4: 0 },
  T2: { 1: 80, 2: 20, 3: 0, 4: 0 },
  T3: { 1: 60, 2: 30, 3: 10, 4: 0 },
  T4: { 1: 40, 2: 35, 3: 20, 4: 5 },
  T5: { 1: 20, 2: 35, 3: 30, 4: 15 }
};

const UPGRADE_LEVELS = [0, 3, 6, 9, 12, 15];

export default function GearArtificingPage() {
  const [selectedTier, setSelectedTier] = useState('T5');
  const [numSubstats, setNumSubstats] = useState(2);
  const [upgradeLevel, setUpgradeLevel] = useState(15);

  const getUpgradeProbabilities = () => {
    const probabilities: { [key: number]: number } = {};
    const tierProbs = PROBABILITY_TABLE[selectedTier as keyof typeof PROBABILITY_TABLE];

    Object.entries(tierProbs).forEach(([substats, prob]) => {
      probabilities[Number(substats)] = prob;
    });

    return probabilities;
  };

  const calculateExpectedValue = () => {
    const probs = getUpgradeProbabilities();
    let expected = 0;

    Object.entries(probs).forEach(([substats, prob]) => {
      expected += Number(substats) * (prob / 100);
    });

    return expected.toFixed(2);
  };

  const probabilities = getUpgradeProbabilities();
  const numUpgrades = UPGRADE_LEVELS.filter(l => l <= upgradeLevel && l > 0).length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[var(--color-text-secondary)] p-6">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader
          title="Gear Analysis"
          category="EQUIPMENT"
          code="RIOS-ART-001"
          icon={<Wrench size={28} />}
        />

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <div className="space-y-6">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-[var(--color-accent)]" />
                Equipment Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-white">
                    Equipment Tier
                  </label>
                  <div className="flex gap-2">
                    {EQUIPMENT_TIERS.map(tier => (
                      <button
                        key={tier}
                        onClick={() => setSelectedTier(tier)}
                        className={`flex-1 py-3 clip-corner-tl font-bold transition-colors ${
                          selectedTier === tier
                            ? 'bg-[var(--color-accent)] text-black'
                            : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-white">
                    Starting Substats: {numSubstats}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={numSubstats}
                    onChange={(e) => setNumSubstats(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-white">
                    Target Upgrade Level: +{upgradeLevel}
                  </label>
                  <div className="flex gap-2">
                    {UPGRADE_LEVELS.filter(l => l > 0).map(level => (
                      <button
                        key={level}
                        onClick={() => setUpgradeLevel(level)}
                        className={`flex-1 py-2 clip-corner-tl transition-colors ${
                          upgradeLevel === level
                            ? 'bg-[var(--color-accent)] text-black font-bold'
                            : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]'
                        }`}
                      >
                        +{level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mechanics Info */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h3 className="font-bold text-white mb-3">Equipment Upgrade Mechanics</h3>
              <ul className="text-sm space-y-2">
                <li>• Equipment gains substats when upgraded at +3, +6, +9, +12, +15</li>
                <li>• Higher tier equipment has better substat probability</li>
                <li>• Each upgrade adds or enhances one random substat</li>
                <li>• T5 equipment has the highest chance for 4 starting substats</li>
                <li>• Starting with 4 substats means all upgrades enhance existing ones</li>
              </ul>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-[var(--color-accent)]" />
                Probability Analysis
              </h2>

              <div className="space-y-4">
                <div className="bg-[var(--color-surface-2)] p-4 clip-corner-tl">
                  <h3 className="font-bold text-white mb-3">Starting Substat Probabilities</h3>
                  <div className="space-y-2">
                    {Object.entries(probabilities).map(([substats, prob]) => (
                      <div key={substats} className="flex items-center justify-between">
                        <span>{substats} Substats</span>
                        <div className="flex items-center gap-3 flex-1 ml-4">
                          <div className="flex-1 bg-[var(--color-border)] h-6 overflow-hidden">
                            <div
                              className="bg-[var(--color-accent)] h-full transition-all duration-300"
                              style={{ width: `${prob}%` }}
                            />
                          </div>
                          <span className="text-[var(--color-accent)] font-bold w-12 text-right">
                            {prob}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--color-surface-2)] p-4 clip-corner-tl">
                    <span className="text-sm text-[var(--color-text-tertiary)]">Number of Upgrades</span>
                    <p className="text-2xl text-white font-bold">{numUpgrades}</p>
                  </div>
                  <div className="bg-[var(--color-surface-2)] p-4 clip-corner-tl">
                    <span className="text-sm text-[var(--color-text-tertiary)]">Expected Substats</span>
                    <p className="text-2xl text-[var(--color-accent)] font-bold">{calculateExpectedValue()}</p>
                  </div>
                </div>

                <div className="bg-[var(--color-surface-2)] p-4 clip-corner-tl border-l-4 border-[var(--color-accent)]">
                  <h3 className="font-bold text-white mb-2">Final Substat Count</h3>
                  <p className="text-sm mb-2">
                    Starting with {numSubstats} substats and {numUpgrades} upgrades:
                  </p>
                  <div className="space-y-1 text-sm">
                    {numSubstats < 4 && (
                      <p className="text-[var(--color-accent)]">
                        • New substats added until reaching 4 total
                      </p>
                    )}
                    {numSubstats === 4 && (
                      <p className="text-green-400">
                        • All upgrades enhance existing substats (optimal!)
                      </p>
                    )}
                    <p>
                      • Minimum final substats: {Math.min(4, numSubstats + numUpgrades)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Substat Types */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h3 className="font-bold text-white mb-3">Available Substats</h3>
              <div className="grid grid-cols-2 gap-2">
                {SUBSTAT_TYPES.map(stat => (
                  <div key={stat} className="bg-[var(--color-surface-2)] px-3 py-2 clip-corner-tl text-sm">
                    {stat}
                  </div>
                ))}
              </div>
              <p className="text-xs mt-3 text-[var(--color-text-tertiary)]">
                Each substat has equal probability when rolled
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
