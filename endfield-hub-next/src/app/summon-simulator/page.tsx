'use client';

import { useState } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';

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
}

export default function SummonSimulatorPage() {
  const [pulls, setPulls] = useState<Pull[]>([]);
  const [pityCounter, setPityCounter] = useState(0);
  const [totalPulls, setTotalPulls] = useState(0);
  const [stats, setStats] = useState({ 6: 0, 5: 0, 4: 0, 3: 0 });

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

    const newPull: Pull = {
      rarity,
      item: `${rarity}★ ${rarity === 6 ? 'Operator' : rarity === 5 ? 'Item' : 'Material'}`,
      isPity
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

      newPulls.push({
        rarity,
        item: `${rarity}★ ${rarity === 6 ? 'Operator' : rarity === 5 ? 'Item' : 'Material'}`,
        isPity
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
    <div className="min-h-screen bg-[#0a0a0a] text-gray-400 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-[#FFE500] flex items-center gap-3">
            <Sparkles className="w-10 h-10" />
            Summon Simulator
          </h1>
          <button
            onClick={reset}
            className="px-4 py-2 bg-[#111] border border-[#222] rounded-lg hover:border-[#FFE500] transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-[#111] border border-[#222] rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Pull Controls</h2>

              <div className="space-y-3">
                <button
                  onClick={() => performPull()}
                  className="w-full py-4 bg-[#FFE500] text-black font-bold rounded-lg hover:bg-[#FFE500]/90 transition-colors"
                >
                  Single Pull
                </button>
                <button
                  onClick={() => performMultiPull(10)}
                  className="w-full py-4 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
                >
                  10-Pull
                </button>
                <button
                  onClick={() => performMultiPull(100)}
                  className="w-full py-4 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors"
                >
                  100-Pull (Whale Mode)
                </button>
              </div>
            </div>

            <div className="bg-[#111] border border-[#222] rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Pity Counter</h2>

              <div className="bg-[#0a0a0a] p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span>Pulls Since Last 6★</span>
                  <span className={`text-2xl font-bold ${pityCounter >= PITY_SOFT ? 'text-red-400' : 'text-[#FFE500]'}`}>
                    {pityCounter}
                  </span>
                </div>
                <div className="w-full bg-[#222] h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${pityCounter >= PITY_SOFT ? 'bg-red-500' : 'bg-[#FFE500]'}`}
                    style={{ width: `${Math.min((pityCounter / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Current 6★ Rate</span>
                  <span className="text-[#FFE500] font-bold">{currentRate.toFixed(2)}%</span>
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

            <div className="bg-[#111] border border-[#222] rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Statistics</h2>

              <div className="space-y-3">
                <div className="bg-[#0a0a0a] p-3 rounded-lg flex justify-between">
                  <span>Total Pulls</span>
                  <span className="text-white font-bold">{totalPulls}</span>
                </div>
                <div className="bg-[#0a0a0a] p-3 rounded-lg flex justify-between">
                  <span>6★ Pulled</span>
                  <span className="text-orange-400 font-bold">{stats[6]}</span>
                </div>
                <div className="bg-[#0a0a0a] p-3 rounded-lg flex justify-between">
                  <span>6★ Rate</span>
                  <span className="text-[#FFE500] font-bold">
                    {totalPulls > 0 ? ((stats[6] / totalPulls) * 100).toFixed(2) : '0.00'}%
                  </span>
                </div>
                <div className="bg-[#0a0a0a] p-3 rounded-lg flex justify-between">
                  <span>5★ Pulled</span>
                  <span className="text-purple-400 font-bold">{stats[5]}</span>
                </div>
                <div className="bg-[#0a0a0a] p-3 rounded-lg flex justify-between">
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
            <div className="bg-[#111] border border-[#222] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Pull Results</h2>

              {pulls.length > 0 ? (
                <div className="space-y-2 max-h-[800px] overflow-y-auto">
                  {pulls.map((pull, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg flex items-center justify-between ${
                        pull.rarity === 6
                          ? 'bg-orange-900/30 border-2 border-orange-500'
                          : pull.rarity === 5
                          ? 'bg-purple-900/20 border border-purple-500/50'
                          : pull.rarity === 4
                          ? 'bg-blue-900/20 border border-blue-500/30'
                          : 'bg-[#0a0a0a] border border-[#222]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">#{pulls.length - index}</div>
                        <div className="flex items-center gap-3">
                          <Sparkles className={`w-5 h-5 ${
                            pull.rarity === 6 ? 'text-orange-400' :
                            pull.rarity === 5 ? 'text-purple-400' :
                            pull.rarity === 4 ? 'text-blue-400' : 'text-gray-400'
                          }`} />
                          <span className={`font-bold ${
                            pull.rarity === 6 ? 'text-orange-400' :
                            pull.rarity === 5 ? 'text-purple-400' :
                            pull.rarity === 4 ? 'text-blue-400' : 'text-gray-400'
                          }`}>
                            {pull.item}
                          </span>
                        </div>
                      </div>
                      {pull.isPity && (
                        <span className="text-xs px-3 py-1 bg-red-500 text-white rounded-full font-bold">
                          PITY
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
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
