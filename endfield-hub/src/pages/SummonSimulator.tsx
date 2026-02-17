import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, TrendingUp } from 'lucide-react';

interface PullResult {
  rarity: number;
  timestamp: number;
}

interface SimulatorStats {
  totalPulls: number;
  sixStarCount: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  currentPity: number;
}

const RARITY_COLORS = {
  6: '#FF4444',
  5: '#FF8844',
  4: '#9B59B6',
  3: '#4488FF',
};

const RARITY_LABELS = {
  6: 'SSR',
  5: 'SR',
  4: 'R',
  3: 'N',
};

export default function SummonSimulator() {
  const [results, setResults] = useState<PullResult[]>([]);
  const [currentPity, setCurrentPity] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [lastPull, setLastPull] = useState<PullResult[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('summonSimulator');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setResults(data.results || []);
        setCurrentPity(data.currentPity || 0);
      } catch (e) {
        console.error('Failed to load simulator data:', e);
      }
    }
  }, []);

  useEffect(() => {
    const data = { results, currentPity };
    localStorage.setItem('summonSimulator', JSON.stringify(data));
  }, [results, currentPity]);

  const simulatePull = (): number => {
    let pity = currentPity + 1;

    // Hard pity at 80
    if (pity >= 80) {
      return 6;
    }

    // Calculate rates with soft pity
    let sixStarRate = 0.02;
    if (pity > 60) {
      sixStarRate += (pity - 60) * 0.03; // Increases 3% per pull after 60
    }

    const roll = Math.random();
    if (roll < sixStarRate) {
      return 6;
    } else if (roll < sixStarRate + 0.08) {
      return 5;
    } else if (roll < sixStarRate + 0.08 + 0.5) {
      return 4;
    } else {
      return 3;
    }
  };

  const performSinglePull = () => {
    if (animating) return;

    setAnimating(true);
    setShowResults(false);

    const rarity = simulatePull();
    const pull: PullResult = {
      rarity,
      timestamp: Date.now(),
    };

    const newPity = rarity === 6 ? 0 : currentPity + 1;
    setCurrentPity(newPity);
    setResults((prev) => [pull, ...prev]);
    setLastPull([pull]);

    setTimeout(() => {
      setShowResults(true);
      setAnimating(false);
    }, 1500);
  };

  const performTenPull = () => {
    if (animating) return;

    setAnimating(true);
    setShowResults(false);

    const pulls: PullResult[] = [];
    let pity = currentPity;
    let guaranteed4Star = false;

    for (let i = 0; i < 10; i++) {
      pity++;
      let rarity: number;

      // Hard pity at 80
      if (pity >= 80) {
        rarity = 6;
      } else {
        // Calculate rates with soft pity
        let sixStarRate = 0.02;
        if (pity > 60) {
          sixStarRate += (pity - 60) * 0.03;
        }

        const roll = Math.random();
        if (roll < sixStarRate) {
          rarity = 6;
        } else if (roll < sixStarRate + 0.08) {
          rarity = 5;
        } else if (roll < sixStarRate + 0.08 + 0.5) {
          rarity = 4;
        } else {
          rarity = 3;
        }
      }

      // Guarantee at least one 4-star in 10-pull
      if (i === 9 && !guaranteed4Star && rarity === 3) {
        const existingHighRarity = pulls.some((p) => p.rarity >= 4);
        if (!existingHighRarity) {
          rarity = 4;
        }
      }

      if (rarity >= 4) {
        guaranteed4Star = true;
      }

      pulls.push({
        rarity,
        timestamp: Date.now() + i,
      });

      if (rarity === 6) {
        pity = 0;
      }
    }

    setCurrentPity(pity);
    setResults((prev) => [...pulls, ...prev]);
    setLastPull(pulls);

    setTimeout(() => {
      setShowResults(true);
      setAnimating(false);
    }, 2000);
  };

  const resetSimulator = () => {
    if (confirm('Reset all simulation data?')) {
      setResults([]);
      setCurrentPity(0);
      setLastPull([]);
      setShowResults(false);
      localStorage.removeItem('summonSimulator');
    }
  };

  const getStats = (): SimulatorStats => {
    return {
      totalPulls: results.length,
      sixStarCount: results.filter((r) => r.rarity === 6).length,
      fiveStarCount: results.filter((r) => r.rarity === 5).length,
      fourStarCount: results.filter((r) => r.rarity === 4).length,
      threeStarCount: results.filter((r) => r.rarity === 3).length,
      currentPity,
    };
  };

  const stats = getStats();
  const sixStarRate = stats.totalPulls > 0 ? (stats.sixStarCount / stats.totalPulls) * 100 : 0;
  const fiveStarRate = stats.totalPulls > 0 ? (stats.fiveStarCount / stats.totalPulls) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2 flex items-center gap-3">
            <Sparkles size={40} />
            Summon Simulator
          </h1>
          <p className="text-gray-400">Test your gacha luck with realistic rates</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Total Pulls</div>
            <div className="text-2xl font-bold text-white">{stats.totalPulls}</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Current Pity</div>
            <div className="text-2xl font-bold text-yellow-400">{currentPity} / 80</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">6-Star Rate</div>
            <div className="text-2xl font-bold" style={{ color: RARITY_COLORS[6] }}>
              {sixStarRate.toFixed(2)}%
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">5-Star Rate</div>
            <div className="text-2xl font-bold" style={{ color: RARITY_COLORS[5] }}>
              {fiveStarRate.toFixed(2)}%
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">6-Stars</div>
            <div className="text-2xl font-bold" style={{ color: RARITY_COLORS[6] }}>
              {stats.sixStarCount}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">5-Stars</div>
            <div className="text-2xl font-bold" style={{ color: RARITY_COLORS[5] }}>
              {stats.fiveStarCount}
            </div>
          </div>
        </div>

        {/* Pity Progress Bar */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-400">Pity Progress</span>
            <span className="text-sm font-semibold text-yellow-400">{currentPity} / 80</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 relative overflow-hidden">
            <div
              className="h-4 rounded-full transition-all duration-300"
              style={{
                width: `${(currentPity / 80) * 100}%`,
                background:
                  currentPity > 60
                    ? 'linear-gradient(90deg, #FFE500, #FF4444)'
                    : '#FFE500',
              }}
            />
            {currentPity > 60 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-900">SOFT PITY</span>
              </div>
            )}
          </div>
        </div>

        {/* Pull Animation Area */}
        <div className="bg-gray-800 rounded-lg p-8 mb-6 min-h-[400px] flex items-center justify-center">
          {animating ? (
            <div className="text-center">
              <div className="animate-spin mb-4">
                <Sparkles size={80} className="text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-yellow-400 animate-pulse">
                Summoning...
              </div>
            </div>
          ) : showResults && lastPull.length > 0 ? (
            <div className="w-full">
              <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
                Pull Results
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
                {lastPull.map((pull, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg flex flex-col items-center justify-center animate-pulse"
                    style={{
                      backgroundColor: RARITY_COLORS[pull.rarity as keyof typeof RARITY_COLORS],
                      animationDelay: `${index * 0.1}s`,
                      animationDuration: '0.5s',
                      animationIterationCount: '1',
                    }}
                  >
                    <div className="text-4xl font-bold text-white mb-2">
                      {pull.rarity}★
                    </div>
                    <div className="text-sm font-bold text-white">
                      {RARITY_LABELS[pull.rarity as keyof typeof RARITY_LABELS]}
                    </div>
                  </div>
                ))}
              </div>
              {lastPull.some((p) => p.rarity === 6) && (
                <div className="mt-6 text-center">
                  <div className="text-3xl font-bold text-yellow-400 animate-bounce">
                    6-STAR OBTAINED!
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <Sparkles size={80} className="mx-auto mb-4 opacity-30" />
              <p className="text-xl">Click a button below to start summoning</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={performSinglePull}
            disabled={animating}
            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-yellow-500 text-gray-900 px-6 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={24} />
            Single Pull
          </button>
          <button
            onClick={performTenPull}
            disabled={animating}
            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 px-6 py-4 rounded-lg font-bold text-lg hover:from-yellow-400 hover:to-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingUp size={24} />
            10-Pull
          </button>
          <button
            onClick={resetSimulator}
            className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-red-500 transition-colors"
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>

        {/* Pull History */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">Recent Pulls</h2>
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No pulls yet</div>
          ) : (
            <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-20 gap-2 max-h-[300px] overflow-y-auto">
              {results.slice(0, 100).map((result, index) => (
                <div
                  key={index}
                  className="aspect-square rounded flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    backgroundColor: RARITY_COLORS[result.rarity as keyof typeof RARITY_COLORS],
                  }}
                  title={`${result.rarity}★ - ${new Date(result.timestamp).toLocaleString()}`}
                >
                  {result.rarity}★
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rates Info */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h3 className="font-bold text-yellow-400 mb-2">Gacha Rates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <h4 className="font-semibold text-white mb-2">Base Rates</h4>
              <ul className="space-y-1">
                <li style={{ color: RARITY_COLORS[6] }}>• 6-Star: 2%</li>
                <li style={{ color: RARITY_COLORS[5] }}>• 5-Star: 8%</li>
                <li style={{ color: RARITY_COLORS[4] }}>• 4-Star: 50%</li>
                <li style={{ color: RARITY_COLORS[3] }}>• 3-Star: 40%</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Pity System</h4>
              <ul className="space-y-1">
                <li>• Soft pity starts at 60 pulls</li>
                <li>• Rate increases by 3% per pull after 60</li>
                <li>• Hard pity at 80 pulls (guaranteed 6-star)</li>
                <li>• At least one 4-star guaranteed in 10-pull</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
