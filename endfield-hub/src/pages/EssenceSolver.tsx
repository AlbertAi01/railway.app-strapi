import { useState, useEffect } from 'react';
import { ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';

interface Weapon {
  name: string;
  type: string;
  rarity: number;
}

interface EssenceMaterial {
  name: string;
  expValue: number;
  creditCost: number;
}

interface OptimalSolution {
  materials: { [key: string]: number };
  totalExp: number;
  totalCost: number;
  wastedExp: number;
  efficiency: number;
}

const weapons: Weapon[] = [
  { name: 'Starfall Blade', type: 'Sword', rarity: 5 },
  { name: 'Thunder Strike', type: 'Sword', rarity: 5 },
  { name: 'Frost Edge', type: 'Sword', rarity: 4 },
  { name: 'Crimson Dawn', type: 'Greatsword', rarity: 5 },
  { name: 'Mountain Breaker', type: 'Greatsword', rarity: 4 },
  { name: 'Storm Caller', type: 'Staff', rarity: 5 },
  { name: 'Sage\'s Wisdom', type: 'Staff', rarity: 4 },
  { name: 'Void Piercer', type: 'Bow', rarity: 5 },
  { name: 'Wind Runner', type: 'Bow', rarity: 4 },
  { name: 'Shadow Fang', type: 'Dagger', rarity: 5 },
  { name: 'Quick Silver', type: 'Dagger', rarity: 4 },
  { name: 'Iron Wall', type: 'Shield', rarity: 4 },
  { name: 'Guardian\'s Oath', type: 'Shield', rarity: 5 },
];

const essenceMaterials: EssenceMaterial[] = [
  { name: 'Minor Essence', expValue: 200, creditCost: 100 },
  { name: 'Standard Essence', expValue: 1000, creditCost: 400 },
  { name: 'Advanced Essence', expValue: 5000, creditCost: 1500 },
  { name: 'Expert Essence', expValue: 20000, creditCost: 5000 },
  { name: 'Master Essence', expValue: 100000, creditCost: 20000 },
];

const calculateExpRequired = (currentLevel: number, targetLevel: number, rarity: number): number => {
  let totalExp = 0;
  const baseExp = rarity === 5 ? 1000 : 800;
  const multiplier = rarity === 5 ? 1.15 : 1.12;

  for (let level = currentLevel; level < targetLevel; level++) {
    totalExp += Math.floor(baseExp * Math.pow(multiplier, level - 1));
  }

  return totalExp;
};

const findOptimalCombination = (requiredExp: number): OptimalSolution[] => {
  const solutions: OptimalSolution[] = [];

  const generateCombination = (
    materials: { [key: string]: number },
    index: number,
    currentExp: number,
    currentCost: number
  ) => {
    if (currentExp >= requiredExp) {
      const wastedExp = currentExp - requiredExp;
      const efficiency = ((requiredExp / currentExp) * 100);

      solutions.push({
        materials: { ...materials },
        totalExp: currentExp,
        totalCost: currentCost,
        wastedExp,
        efficiency,
      });
      return;
    }

    if (index >= essenceMaterials.length) return;

    const material = essenceMaterials[index];
    const maxNeeded = Math.ceil((requiredExp - currentExp) / material.expValue) + 2;

    for (let count = 0; count <= maxNeeded && count <= 50; count++) {
      const newMaterials = { ...materials };
      if (count > 0) {
        newMaterials[material.name] = count;
      }

      generateCombination(
        newMaterials,
        index + 1,
        currentExp + (count * material.expValue),
        currentCost + (count * material.creditCost)
      );
    }
  };

  generateCombination({}, 0, 0, 0);

  return solutions
    .filter(s => s.totalExp >= requiredExp)
    .sort((a, b) => {
      const effDiff = b.efficiency - a.efficiency;
      if (Math.abs(effDiff) > 0.1) return effDiff;
      return a.totalCost - b.totalCost;
    })
    .slice(0, 5);
};

export default function EssenceSolver() {
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [targetLevel, setTargetLevel] = useState<number>(20);
  const [showWeaponSelect, setShowWeaponSelect] = useState(false);
  const [solutions, setSolutions] = useState<OptimalSolution[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('essenceSolver');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.weapon) {
          const weapon = weapons.find(w => w.name === data.weapon);
          if (weapon) setSelectedWeapon(weapon);
        }
        if (data.currentLevel) setCurrentLevel(data.currentLevel);
        if (data.targetLevel) setTargetLevel(data.targetLevel);
      } catch (e) {
        console.error('Failed to load saved data', e);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedWeapon) {
      localStorage.setItem('essenceSolver', JSON.stringify({
        weapon: selectedWeapon.name,
        currentLevel,
        targetLevel,
      }));

      const requiredExp = calculateExpRequired(currentLevel, targetLevel, selectedWeapon.rarity);
      const optimalSolutions = findOptimalCombination(requiredExp);
      setSolutions(optimalSolutions);
      setSelectedSolution(0);
    }
  }, [selectedWeapon, currentLevel, targetLevel]);

  const requiredExp = selectedWeapon
    ? calculateExpRequired(currentLevel, targetLevel, selectedWeapon.rarity)
    : 0;

  const maxLevel = 80;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#FFE500' }}>
            Essence Solver
          </h1>
          <p className="text-gray-400">
            Calculate optimal essence material combinations for weapon enhancement
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Weapon
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowWeaponSelect(!showWeaponSelect)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-left flex items-center justify-between hover:bg-gray-650 transition-colors"
                >
                  {selectedWeapon ? (
                    <span>
                      {selectedWeapon.name}{' '}
                      <span className="text-sm text-gray-400">
                        ({selectedWeapon.type})
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-400">Select a weapon</span>
                  )}
                  <ChevronDown className="w-5 h-5" />
                </button>

                {showWeaponSelect && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {weapons.map(weapon => (
                      <button
                        key={weapon.name}
                        onClick={() => {
                          setSelectedWeapon(weapon);
                          setShowWeaponSelect(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-600 transition-colors flex items-center justify-between"
                      >
                        <span>{weapon.name}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">{weapon.type}</span>
                          <span className="text-xs" style={{ color: '#FFE500' }}>
                            {'★'.repeat(weapon.rarity)}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Current Level
              </label>
              <input
                type="number"
                min={1}
                max={maxLevel - 1}
                value={currentLevel}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(maxLevel - 1, Number(e.target.value)));
                  setCurrentLevel(val);
                  if (val >= targetLevel) {
                    setTargetLevel(Math.min(maxLevel, val + 1));
                  }
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 hover:bg-gray-650 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Target Level
              </label>
              <input
                type="number"
                min={currentLevel + 1}
                max={maxLevel}
                value={targetLevel}
                onChange={(e) => {
                  const val = Math.max(currentLevel + 1, Math.min(maxLevel, Number(e.target.value)));
                  setTargetLevel(val);
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 hover:bg-gray-650 transition-colors"
              />
            </div>
          </div>
        </div>

        {selectedWeapon && solutions.length > 0 && (
          <>
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5" style={{ color: '#FFE500' }} />
                <h2 className="text-xl font-semibold">Requirements</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded p-4">
                  <div className="text-sm text-gray-400 mb-1">Total EXP Required</div>
                  <div className="text-2xl font-bold" style={{ color: '#FFE500' }}>
                    {requiredExp.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-700 rounded p-4">
                  <div className="text-sm text-gray-400 mb-1">Level Range</div>
                  <div className="text-2xl font-bold">
                    {currentLevel} → {targetLevel}
                  </div>
                </div>
                <div className="bg-gray-700 rounded p-4">
                  <div className="text-sm text-gray-400 mb-1">Weapon Rarity</div>
                  <div className="text-2xl font-bold" style={{ color: '#FFE500' }}>
                    {'★'.repeat(selectedWeapon.rarity)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h2 className="text-xl font-semibold">Optimal Solutions</h2>
              </div>

              <div className="space-y-4">
                {solutions.map((solution, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedSolution === index
                        ? 'border-yellow-500 bg-gray-750'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedSolution(index)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold">
                          Solution {index + 1}
                          {index === 0 && (
                            <span
                              className="ml-2 text-xs px-2 py-1 rounded"
                              style={{ backgroundColor: '#FFE500', color: '#000' }}
                            >
                              RECOMMENDED
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Efficiency:</span>{' '}
                          <span
                            className="font-semibold"
                            style={{
                              color: solution.efficiency > 99 ? '#4ade80' : '#FFE500',
                            }}
                          >
                            {solution.efficiency.toFixed(2)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Waste:</span>{' '}
                          <span className="font-semibold text-red-400">
                            {solution.wastedExp.toLocaleString()} EXP
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                      {essenceMaterials.map(material => {
                        const count = solution.materials[material.name] || 0;
                        return (
                          <div
                            key={material.name}
                            className={`bg-gray-700 rounded p-3 ${
                              count === 0 ? 'opacity-40' : ''
                            }`}
                          >
                            <div className="text-xs text-gray-400 mb-1">
                              {material.name}
                            </div>
                            <div className="text-lg font-bold">{count}</div>
                            <div className="text-xs text-gray-500">
                              {(count * material.expValue).toLocaleString()} EXP
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                      <div>
                        <span className="text-gray-400 text-sm">Total EXP:</span>{' '}
                        <span className="font-semibold" style={{ color: '#FFE500' }}>
                          {solution.totalExp.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Total Cost:</span>{' '}
                        <span className="font-semibold text-green-400">
                          {solution.totalCost.toLocaleString()} Credits
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!selectedWeapon && (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg">
              Select a weapon to calculate optimal essence combinations
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
