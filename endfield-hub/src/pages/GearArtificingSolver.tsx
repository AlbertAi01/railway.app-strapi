import { useState, useEffect } from 'react';
import { ChevronDown, Dice3, TrendingUp, AlertTriangle } from 'lucide-react';

interface GearSet {
  name: string;
  slots: number;
  mainStats: string[];
}

interface SubStat {
  name: string;
  minRoll: number;
  maxRoll: number;
  weight: number;
}

interface StatSelection {
  main: string;
  subs: string[];
}

interface RollResult {
  stat: string;
  value: number;
  quality: 'low' | 'medium' | 'high';
}

interface SimulationResult {
  rolls: RollResult[];
  totalValue: number;
  quality: number;
  score: number;
}

const gearSets: GearSet[] = [
  {
    name: 'Frontline Commander',
    slots: 4,
    mainStats: ['HP', 'ATK', 'DEF', 'CRIT Rate'],
  },
  {
    name: 'Tactical Superiority',
    slots: 4,
    mainStats: ['ATK', 'CRIT Rate', 'CRIT DMG', 'Effect Hit'],
  },
  {
    name: 'Elemental Mastery',
    slots: 4,
    mainStats: ['ATK', 'Elemental DMG', 'Effect Hit', 'Energy Regen'],
  },
  {
    name: 'Guardian\'s Resolve',
    slots: 4,
    mainStats: ['HP', 'DEF', 'Effect RES', 'Healing Bonus'],
  },
  {
    name: 'Swift Strike',
    slots: 2,
    mainStats: ['ATK Speed', 'CRIT Rate'],
  },
  {
    name: 'Berserker\'s Fury',
    slots: 4,
    mainStats: ['ATK', 'CRIT DMG', 'ATK%', 'CRIT Rate'],
  },
];

const subStats: SubStat[] = [
  { name: 'ATK%', minRoll: 3, maxRoll: 8, weight: 100 },
  { name: 'HP%', minRoll: 3, maxRoll: 8, weight: 100 },
  { name: 'DEF%', minRoll: 3, maxRoll: 8, weight: 100 },
  { name: 'CRIT Rate', minRoll: 2, maxRoll: 6, weight: 70 },
  { name: 'CRIT DMG', minRoll: 4, maxRoll: 12, weight: 70 },
  { name: 'Effect Hit', minRoll: 3, maxRoll: 8, weight: 80 },
  { name: 'Effect RES', minRoll: 3, maxRoll: 8, weight: 80 },
  { name: 'ATK Speed', minRoll: 2, maxRoll: 5, weight: 85 },
  { name: 'Energy Regen', minRoll: 3, maxRoll: 7, weight: 75 },
];

const statPriorities: { [key: string]: number } = {
  'CRIT Rate': 10,
  'CRIT DMG': 10,
  'ATK%': 9,
  'ATK Speed': 8,
  'Energy Regen': 7,
  'Effect Hit': 6,
  'HP%': 5,
  'DEF%': 5,
  'Effect RES': 4,
};

const rollSubStat = (subStat: SubStat): RollResult => {
  const range = subStat.maxRoll - subStat.minRoll;
  const roll = Math.random();
  const value = subStat.minRoll + (roll * range);

  let quality: 'low' | 'medium' | 'high';
  if (roll < 0.33) quality = 'low';
  else if (roll < 0.75) quality = 'medium';
  else quality = 'high';

  return {
    stat: subStat.name,
    value: Math.round(value * 10) / 10,
    quality,
  };
};

const simulateArtificing = (
  selectedStats: string[],
  numRolls: number
): SimulationResult => {
  const rolls: RollResult[] = [];
  let totalValue = 0;
  let qualitySum = 0;

  for (let i = 0; i < numRolls; i++) {
    const statIndex = Math.floor(Math.random() * selectedStats.length);
    const statName = selectedStats[statIndex];
    const subStat = subStats.find(s => s.name === statName);

    if (subStat) {
      const roll = rollSubStat(subStat);
      rolls.push(roll);

      const normalizedValue = (roll.value - subStat.minRoll) / (subStat.maxRoll - subStat.minRoll);
      totalValue += roll.value;
      qualitySum += normalizedValue;
    }
  }

  const quality = (qualitySum / numRolls) * 100;
  const score = rolls.reduce((sum, roll) => {
    const priority = statPriorities[roll.stat] || 1;
    const subStat = subStats.find(s => s.name === roll.stat);
    if (!subStat) return sum;

    const normalizedValue = (roll.value - subStat.minRoll) / (subStat.maxRoll - subStat.minRoll);
    return sum + (normalizedValue * priority * 10);
  }, 0);

  return { rolls, totalValue, quality, score };
};

export default function GearArtificingSolver() {
  const [selectedSet, setSelectedSet] = useState<GearSet | null>(null);
  const [selectedMainStat, setSelectedMainStat] = useState<string>('');
  const [selectedSubStats, setSelectedSubStats] = useState<string[]>([]);
  const [numRolls, setNumRolls] = useState<number>(4);
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [showSetSelect, setShowSetSelect] = useState(false);
  const [autoSimulate, setAutoSimulate] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('gearArtificingSolver');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.set) {
          const set = gearSets.find(s => s.name === data.set);
          if (set) setSelectedSet(set);
        }
        if (data.mainStat) setSelectedMainStat(data.mainStat);
        if (data.subStats) setSelectedSubStats(data.subStats);
        if (data.numRolls) setNumRolls(data.numRolls);
      } catch (e) {
        console.error('Failed to load saved data', e);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedSet) {
      localStorage.setItem('gearArtificingSolver', JSON.stringify({
        set: selectedSet.name,
        mainStat: selectedMainStat,
        subStats: selectedSubStats,
        numRolls,
      }));

      if (autoSimulate && selectedSubStats.length > 0) {
        runSimulations();
      }
    }
  }, [selectedSet, selectedMainStat, selectedSubStats, numRolls]);

  const toggleSubStat = (stat: string) => {
    setSelectedSubStats(prev => {
      if (prev.includes(stat)) {
        return prev.filter(s => s !== stat);
      } else if (prev.length < 4) {
        return [...prev, stat];
      }
      return prev;
    });
  };

  const runSimulations = () => {
    if (selectedSubStats.length === 0) return;

    const results: SimulationResult[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(simulateArtificing(selectedSubStats, numRolls));
    }

    results.sort((a, b) => b.score - a.score);
    setSimulations(results);
  };

  const averageQuality = simulations.length > 0
    ? simulations.reduce((sum, s) => sum + s.quality, 0) / simulations.length
    : 0;

  const averageScore = simulations.length > 0
    ? simulations.reduce((sum, s) => sum + s.score, 0) / simulations.length
    : 0;

  const getQualityColor = (quality: number): string => {
    if (quality >= 75) return '#4ade80';
    if (quality >= 50) return '#FFE500';
    return '#f87171';
  };

  const probabilityOfDesiredOutcome = simulations.length > 0
    ? (simulations.filter(s => s.quality >= 75).length / simulations.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#FFE500' }}>
            Gear Artificing Solver
          </h1>
          <p className="text-gray-400">
            Optimize equipment crafting and analyze substat roll probabilities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Configuration</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Gear Set
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowSetSelect(!showSetSelect)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-left flex items-center justify-between hover:bg-gray-650 transition-colors"
                    >
                      {selectedSet ? (
                        <span>{selectedSet.name}</span>
                      ) : (
                        <span className="text-gray-400">Select a set</span>
                      )}
                      <ChevronDown className="w-5 h-5" />
                    </button>

                    {showSetSelect && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
                        {gearSets.map(set => (
                          <button
                            key={set.name}
                            onClick={() => {
                              setSelectedSet(set);
                              setSelectedMainStat('');
                              setShowSetSelect(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-600 transition-colors"
                          >
                            <div>{set.name}</div>
                            <div className="text-xs text-gray-400">
                              {set.slots} slots
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {selectedSet && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Main Stat
                    </label>
                    <select
                      value={selectedMainStat}
                      onChange={(e) => setSelectedMainStat(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 hover:bg-gray-650 transition-colors"
                    >
                      <option value="">Select main stat</option>
                      {selectedSet.mainStats.map(stat => (
                        <option key={stat} value={stat}>{stat}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Number of Rolls
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={numRolls}
                    onChange={(e) => setNumRolls(Math.max(1, Math.min(8, Number(e.target.value))))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 hover:bg-gray-650 transition-colors"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Typical: 4 initial + upgrade rolls
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Desired Substats</h2>
              <p className="text-sm text-gray-400 mb-4">
                Select up to 4 substats you want
              </p>

              <div className="space-y-2">
                {subStats.map(stat => (
                  <button
                    key={stat.name}
                    onClick={() => toggleSubStat(stat.name)}
                    disabled={!selectedSubStats.includes(stat.name) && selectedSubStats.length >= 4}
                    className={`w-full px-4 py-3 rounded text-left transition-colors ${
                      selectedSubStats.includes(stat.name)
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{stat.name}</span>
                      <span className="text-sm text-gray-300">
                        {stat.minRoll}% - {stat.maxRoll}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-300 mt-1">
                      Priority: {statPriorities[stat.name] || 1}/10
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={runSimulations}
                disabled={selectedSubStats.length === 0}
                className="w-full mt-4 px-4 py-3 rounded font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: selectedSubStats.length > 0 ? '#FFE500' : '#374151',
                  color: selectedSubStats.length > 0 ? '#000' : '#9ca3af',
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Dice3 className="w-5 h-5" />
                  Run 100 Simulations
                </div>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {simulations.length > 0 && (
              <>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Statistics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 rounded p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <span className="text-sm text-gray-400">Average Quality</span>
                      </div>
                      <div
                        className="text-3xl font-bold"
                        style={{ color: getQualityColor(averageQuality) }}
                      >
                        {averageQuality.toFixed(1)}%
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5" style={{ color: '#FFE500' }} />
                        <span className="text-sm text-gray-400">Average Score</span>
                      </div>
                      <div className="text-3xl font-bold" style={{ color: '#FFE500' }}>
                        {averageScore.toFixed(1)}
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Dice3 className="w-5 h-5 text-purple-400" />
                        <span className="text-sm text-gray-400">High Quality Rate</span>
                      </div>
                      <div className="text-3xl font-bold text-purple-400">
                        {probabilityOfDesiredOutcome.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Quality &gt;= 75%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Top 10 Simulation Results
                  </h2>

                  <div className="space-y-3">
                    {simulations.slice(0, 10).map((sim, index) => (
                      <div
                        key={index}
                        className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold">
                            #{index + 1}
                            {index === 0 && (
                              <span
                                className="ml-2 text-xs px-2 py-1 rounded"
                                style={{ backgroundColor: '#FFE500', color: '#000' }}
                              >
                                BEST
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Quality:</span>{' '}
                              <span
                                className="font-semibold"
                                style={{ color: getQualityColor(sim.quality) }}
                              >
                                {sim.quality.toFixed(1)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Score:</span>{' '}
                              <span className="font-semibold" style={{ color: '#FFE500' }}>
                                {sim.score.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {sim.rolls.map((roll, rollIndex) => (
                            <div
                              key={rollIndex}
                              className={`bg-gray-800 rounded p-2 border ${
                                roll.quality === 'high'
                                  ? 'border-green-500'
                                  : roll.quality === 'medium'
                                  ? 'border-yellow-500'
                                  : 'border-gray-600'
                              }`}
                            >
                              <div className="text-xs text-gray-400">{roll.stat}</div>
                              <div className="text-lg font-bold">
                                +{roll.value}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {simulations.length === 0 && (
              <div className="bg-gray-800 rounded-lg p-12 text-center">
                <Dice3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-lg mb-2">
                  Configure your desired substats and run simulations
                </p>
                <p className="text-gray-500 text-sm">
                  Select up to 4 substats to analyze roll probabilities
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
