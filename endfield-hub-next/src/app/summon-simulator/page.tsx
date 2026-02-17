'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Sparkles, RotateCcw, Dice6 } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { CHARACTERS, WEAPONS } from '@/lib/data';
import { CHARACTER_ICONS, WEAPON_ICONS } from '@/lib/assets';

const RATES = {
  6: 0.008,  // 0.8%
  5: 0.08,   // 8%
  4: 0.40,   // 40%
  3: 0.512   // 51.2%
};

const PITY_SOFT = 50;
const PITY_INCREASE = 0.02; // 2% per pull after 50

interface Pull {
  rarity: number;
  item: string;
  isPity: boolean;
  icon?: string;
  type: 'character' | 'weapon' | 'material';
}

export default function SummonSimulatorPage() {
  const [pulls, setPulls] = useState<Pull[]>([]);
  const [pityCounter, setPityCounter] = useState(0);
  const [totalPulls, setTotalPulls] = useState(0);
  const [stats, setStats] = useState({ 6: 0, 5: 0, 4: 0, 3: 0 });

  const getRandomItem = (rarity: number): { name: string; icon?: string; type: 'character' | 'weapon' | 'material' } => {
    if (rarity === 6) {
      // 50% character, 50% weapon for 6-star
      const isCharacter = Math.random() < 0.5;
      if (isCharacter) {
        const sixStarChars = CHARACTERS.filter(c => c.Rarity === 6);
        const char = sixStarChars[Math.floor(Math.random() * sixStarChars.length)];
        return { name: char.Name, icon: CHARACTER_ICONS[char.Name], type: 'character' };
      } else {
        const sixStarWeapons = WEAPONS.filter(w => w.Rarity === 6);
        const weapon = sixStarWeapons[Math.floor(Math.random() * sixStarWeapons.length)];
        return { name: weapon.Name, icon: WEAPON_ICONS[weapon.Name], type: 'weapon' };
      }
    } else if (rarity === 5) {
      // 60% character, 40% weapon for 5-star
      const isCharacter = Math.random() < 0.6;
      if (isCharacter) {
        const fiveStarChars = CHARACTERS.filter(c => c.Rarity === 5);
        const char = fiveStarChars[Math.floor(Math.random() * fiveStarChars.length)];
        return { name: char.Name, icon: CHARACTER_ICONS[char.Name], type: 'character' };
      } else {
        const fiveStarWeapons = WEAPONS.filter(w => w.Rarity === 5);
        const weapon = fiveStarWeapons[Math.floor(Math.random() * fiveStarWeapons.length)];
        return { name: weapon.Name, icon: WEAPON_ICONS[weapon.Name], type: 'weapon' };
      }
    } else if (rarity === 4) {
      // 70% character, 30% weapon for 4-star
      const isCharacter = Math.random() < 0.7;
      if (isCharacter) {
        const fourStarChars = CHARACTERS.filter(c => c.Rarity === 4);
        const char = fourStarChars[Math.floor(Math.random() * fourStarChars.length)];
        return { name: char.Name, icon: CHARACTER_ICONS[char.Name], type: 'character' };
      } else {
        const fourStarWeapons = WEAPONS.filter(w => w.Rarity === 4);
        const weapon = fourStarWeapons[Math.floor(Math.random() * fourStarWeapons.length)];
        return { name: weapon.Name, icon: WEAPON_ICONS[weapon.Name], type: 'weapon' };
      }
    }
    // 3-star is just materials
    return { name: 'Material', icon: undefined, type: 'material' };
  };

  const calculateRarity = (counter: number): number => {
    let rate6 = RATES[6];

    // Apply soft pity
    if (counter >= PITY_SOFT) {
      rate6 += (counter - PITY_SOFT + 1) * PITY_INCREASE;
    }

    const roll = Math.random();

    if (roll < rate6) return 6;
    if (roll < rate6 + RATES[5]) return 5;
    if (roll < rate6 + RATES[5] + RATES[4]) return 4;
    return 3;
  };

  const performPull = () => {
    const rarity = calculateRarity(pityCounter);
    const isPity = pityCounter >= PITY_SOFT && rarity === 6;
    const itemData = getRandomItem(rarity);

    const newPull: Pull = {
      rarity,
      item: itemData.name,
      isPity,
      icon: itemData.icon,
      type: itemData.type
    };

    setPulls([newPull, ...pulls]);
    setTotalPulls(totalPulls + 1);
    setStats({ ...stats, [rarity]: stats[rarity as keyof typeof stats] + 1 });

    if (rarity === 6) {
      setPityCounter(0);
    } else {
      setPityCounter(pityCounter + 1);
    }
  };

  const performMultiPull = (count: number) => {
    const newPulls: Pull[] = [];
    let newStats = { ...stats };
    let counter = pityCounter;

    for (let i = 0; i < count; i++) {
      const rarity = calculateRarity(counter);
      const isPity = counter >= PITY_SOFT && rarity === 6;
      const itemData = getRandomItem(rarity);

      newPulls.push({
        rarity,
        item: itemData.name,
        isPity,
        icon: itemData.icon,
        type: itemData.type
      });

      newStats[rarity as keyof typeof newStats]++;

      if (rarity === 6) {
        counter = 0;
      } else {
        counter++;
      }
    }

    setPulls([...newPulls, ...pulls]);
    setTotalPulls(totalPulls + count);
    setStats(newStats);
    setPityCounter(counter);
  };

  const reset = () => {
    if (confirm('Reset all pulls?')) {
      setPulls([]);
      setPityCounter(0);
      setTotalPulls(0);
      setStats({ 6: 0, 5: 0, 4: 0, 3: 0 });
    }
  };

  const currentRate = pityCounter >= PITY_SOFT
    ? (RATES[6] + (pityCounter - PITY_SOFT + 1) * PITY_INCREASE) * 100
    : RATES[6] * 100;

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <RIOSHeader
            title="Recruitment Simulator"
            category="SIMULATION"
            code="RIOS-SIM-001"
            icon={<Dice6 size={28} />}
          />
          <button
            onClick={reset}
            className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Pull Controls</h2>

              <div className="space-y-3">
                <button
                  onClick={() => performPull()}
                  className="w-full py-4 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-[var(--color-accent)]/90 transition-colors"
                >
                  Single Pull
                </button>
                <button
                  onClick={() => performMultiPull(10)}
                  className="w-full py-4 bg-purple-600 text-white font-bold clip-corner-tl hover:bg-purple-700 transition-colors"
                >
                  10-Pull
                </button>
                <button
                  onClick={() => performMultiPull(100)}
                  className="w-full py-4 bg-orange-600 text-white font-bold clip-corner-tl hover:bg-orange-700 transition-colors"
                >
                  100-Pull (Whale Mode)
                </button>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Pity Counter</h2>

              <div className="bg-[var(--color-surface-2)] p-4 clip-corner-tl mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span>Pulls Since Last 6★</span>
                  <span className={`text-2xl font-bold ${pityCounter >= PITY_SOFT ? 'text-red-400' : 'text-[var(--color-accent)]'}`}>
                    {pityCounter}
                  </span>
                </div>
                <div className="w-full bg-[var(--color-border)] h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all ${pityCounter >= PITY_SOFT ? 'bg-red-500' : 'bg-[var(--color-accent)]'}`}
                    style={{ width: `${Math.min((pityCounter / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Current 6★ Rate</span>
                  <span className="text-[var(--color-accent)] font-bold">{currentRate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Soft Pity At</span>
                  <span className="text-white font-bold">{PITY_SOFT}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guaranteed At</span>
                  <span className="text-white font-bold">100</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Statistics</h2>

              <div className="space-y-3">
                <div className="bg-[var(--color-surface-2)] p-3 clip-corner-tl flex justify-between">
                  <span>Total Pulls</span>
                  <span className="text-white font-bold">{totalPulls}</span>
                </div>
                <div className="bg-[var(--color-surface-2)] p-3 clip-corner-tl flex justify-between">
                  <span>6★ Pulled</span>
                  <span className="text-orange-400 font-bold">{stats[6]}</span>
                </div>
                <div className="bg-[var(--color-surface-2)] p-3 clip-corner-tl flex justify-between">
                  <span>6★ Rate</span>
                  <span className="text-[var(--color-accent)] font-bold">
                    {totalPulls > 0 ? ((stats[6] / totalPulls) * 100).toFixed(2) : '0.00'}%
                  </span>
                </div>
                <div className="bg-[var(--color-surface-2)] p-3 clip-corner-tl flex justify-between">
                  <span>5★ Pulled</span>
                  <span className="text-purple-400 font-bold">{stats[5]}</span>
                </div>
                <div className="bg-[var(--color-surface-2)] p-3 clip-corner-tl flex justify-between">
                  <span>5★ Rate</span>
                  <span className="text-purple-300 font-bold">
                    {totalPulls > 0 ? ((stats[5] / totalPulls) * 100).toFixed(2) : '0.00'}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pull Results */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Pull Results</h2>

              {pulls.length > 0 ? (
                <div className="space-y-2 max-h-[800px] overflow-y-auto">
                  {pulls.map((pull, index) => (
                    <div
                      key={index}
                      className={`p-4 clip-corner-tl flex items-center justify-between ${
                        pull.rarity === 6
                          ? 'bg-orange-900/30 border-2 border-orange-500'
                          : pull.rarity === 5
                          ? 'bg-purple-900/20 border border-purple-500/50'
                          : pull.rarity === 4
                          ? 'bg-blue-900/20 border border-blue-500/30'
                          : 'bg-[var(--color-surface-2)] border border-[var(--color-border)]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-[var(--color-text-tertiary)]">#{pulls.length - index}</div>
                        <div className="flex items-center gap-3">
                          {pull.icon ? (
                            <div className="w-12 h-12 flex items-center justify-center clip-corner-tl overflow-hidden" style={{
                              backgroundColor: pull.rarity === 6 ? 'rgba(249, 115, 22, 0.1)' :
                                pull.rarity === 5 ? 'rgba(168, 85, 247, 0.1)' :
                                'rgba(59, 130, 246, 0.1)'
                            }}>
                              <Image
                                src={pull.icon}
                                alt={pull.item}
                                width={48}
                                height={48}
                                className="w-full h-full object-contain"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <Sparkles className={`w-5 h-5 ${
                              pull.rarity === 6 ? 'text-orange-400' :
                              pull.rarity === 5 ? 'text-purple-400' :
                              pull.rarity === 4 ? 'text-blue-400' : 'text-gray-400'
                            }`} />
                          )}
                          <div>
                            <span className={`font-bold block ${
                              pull.rarity === 6 ? 'text-orange-400' :
                              pull.rarity === 5 ? 'text-purple-400' :
                              pull.rarity === 4 ? 'text-blue-400' : 'text-gray-400'
                            }`}>
                              {pull.item}
                            </span>
                            <span className="text-xs text-[var(--color-text-tertiary)] capitalize">
                              {pull.rarity}★ {pull.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      {pull.isPity && (
                        <span className="text-xs px-3 py-1 bg-red-500 text-white font-bold">
                          PITY
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[var(--color-text-tertiary)]">
                  Start pulling to see results!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
