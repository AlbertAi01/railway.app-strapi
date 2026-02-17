import { useState, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { CHARACTER_ICONS } from '@/lib/assets';

interface Character {
  name: string;
  element: string;
  rarity: number;
}

interface Material {
  name: string;
  quantity: number;
  owned: boolean;
}

interface AscensionCost {
  level: number;
  materials: { [key: string]: number };
  credits: number;
}

const characters: Character[] = [
  { name: 'Ardelia', element: 'Nature', rarity: 5 },
  { name: 'Ember', element: 'Heat', rarity: 5 },
  { name: 'Endministrator', element: 'Electric', rarity: 6 },
  { name: 'Gilberta', element: 'Physical', rarity: 5 },
  { name: 'Laevatain', element: 'Heat', rarity: 6 },
  { name: 'Last Rite', element: 'Cryo', rarity: 6 },
  { name: 'Lifeng', element: 'Nature', rarity: 5 },
  { name: 'Pogranichnik', element: 'Physical', rarity: 5 },
  { name: 'Yvonne', element: 'Cryo', rarity: 5 },
  { name: 'Alesh', element: 'Electric', rarity: 4 },
  { name: 'Arclight', element: 'Electric', rarity: 4 },
  { name: 'Avywenna', element: 'Nature', rarity: 4 },
  { name: 'Chen Qianyu', element: 'Physical', rarity: 4 },
  { name: 'Da Pan', element: 'Heat', rarity: 4 },
  { name: 'Perlica', element: 'Cryo', rarity: 4 },
  { name: 'Snowshine', element: 'Cryo', rarity: 4 },
  { name: 'Wulfgard', element: 'Physical', rarity: 4 },
  { name: 'Xaihi', element: 'Nature', rarity: 4 },
  { name: 'Akekuri', element: 'Heat', rarity: 3 },
  { name: 'Antal', element: 'Electric', rarity: 3 },
  { name: 'Catcher', element: 'Physical', rarity: 3 },
  { name: 'Estella', element: 'Nature', rarity: 3 },
  { name: 'Fluorite', element: 'Cryo', rarity: 3 },
];

const elementColors: { [key: string]: string } = {
  Physical: 'text-gray-300',
  Heat: 'text-red-400',
  Cryo: 'text-cyan-400',
  Electric: 'text-purple-400',
  Nature: 'text-green-400',
};

const generateAscensionCosts = (character: Character): AscensionCost[] => {
  const element = character.element.toLowerCase();
  const rarity = character.rarity;

  const baseMaterials = [
    `${element}_essence_tier1`,
    `${element}_essence_tier2`,
    `${element}_essence_tier3`,
    'skill_chip_basic',
    'skill_chip_advanced',
    'skill_chip_expert',
  ];

  return [
    {
      level: 20,
      materials: {
        [`${element}_essence_tier1`]: rarity * 2,
        'skill_chip_basic': rarity,
      },
      credits: 5000 * rarity,
    },
    {
      level: 30,
      materials: {
        [`${element}_essence_tier1`]: rarity * 3,
        'skill_chip_basic': rarity * 2,
      },
      credits: 10000 * rarity,
    },
    {
      level: 40,
      materials: {
        [`${element}_essence_tier1`]: rarity * 4,
        [`${element}_essence_tier2`]: rarity * 2,
        'skill_chip_basic': rarity * 3,
        'skill_chip_advanced': rarity,
      },
      credits: 20000 * rarity,
    },
    {
      level: 50,
      materials: {
        [`${element}_essence_tier2`]: rarity * 3,
        'skill_chip_advanced': rarity * 2,
      },
      credits: 40000 * rarity,
    },
    {
      level: 60,
      materials: {
        [`${element}_essence_tier2`]: rarity * 4,
        [`${element}_essence_tier3`]: rarity,
        'skill_chip_advanced': rarity * 3,
        'skill_chip_expert': rarity,
      },
      credits: 80000 * rarity,
    },
    {
      level: 70,
      materials: {
        [`${element}_essence_tier2`]: rarity * 5,
        [`${element}_essence_tier3`]: rarity * 2,
        'skill_chip_advanced': rarity * 4,
        'skill_chip_expert': rarity * 2,
      },
      credits: 150000 * rarity,
    },
    {
      level: 80,
      materials: {
        [`${element}_essence_tier3`]: rarity * 3,
        'skill_chip_expert': rarity * 3,
      },
      credits: 300000 * rarity,
    },
  ];
};

const formatMaterialName = (key: string): string => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function AscensionPlanner() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [targetLevel, setTargetLevel] = useState<number>(20);
  const [materialOwnership, setMaterialOwnership] = useState<{ [key: string]: boolean }>({});
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ascensionPlanner');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.character) {
          const char = characters.find(c => c.name === data.character);
          if (char) setSelectedCharacter(char);
        }
        if (data.currentLevel) setCurrentLevel(data.currentLevel);
        if (data.targetLevel) setTargetLevel(data.targetLevel);
        if (data.materialOwnership) setMaterialOwnership(data.materialOwnership);
      } catch (e) {
        console.error('Failed to load saved data', e);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedCharacter) {
      localStorage.setItem('ascensionPlanner', JSON.stringify({
        character: selectedCharacter.name,
        currentLevel,
        targetLevel,
        materialOwnership,
      }));
    }
  }, [selectedCharacter, currentLevel, targetLevel, materialOwnership]);

  const calculateTotalMaterials = (): Material[] => {
    if (!selectedCharacter) return [];

    const allCosts = generateAscensionCosts(selectedCharacter);
    const relevantCosts = allCosts.filter(
      cost => cost.level > currentLevel && cost.level <= targetLevel
    );

    const totalMaterials: { [key: string]: number } = {};
    let totalCredits = 0;

    relevantCosts.forEach(cost => {
      Object.entries(cost.materials).forEach(([material, quantity]) => {
        totalMaterials[material] = (totalMaterials[material] || 0) + quantity;
      });
      totalCredits += cost.credits;
    });

    if (totalCredits > 0) {
      totalMaterials['credits'] = totalCredits;
    }

    return Object.entries(totalMaterials).map(([name, quantity]) => ({
      name,
      quantity,
      owned: materialOwnership[name] || false,
    }));
  };

  const toggleMaterialOwnership = (materialName: string) => {
    setMaterialOwnership(prev => ({
      ...prev,
      [materialName]: !prev[materialName],
    }));
  };

  const materials = calculateTotalMaterials();
  const completedMaterials = materials.filter(m => m.owned).length;
  const progress = materials.length > 0 ? (completedMaterials / materials.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#FFE500' }}>
            Ascension Planner
          </h1>
          <p className="text-gray-400">
            Plan and track materials needed for character ascension
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Character
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowCharacterSelect(!showCharacterSelect)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-left flex items-center justify-between hover:bg-gray-650 transition-colors"
                >
                  {selectedCharacter ? (
                    <span className="flex items-center gap-2">
                      {CHARACTER_ICONS[selectedCharacter.name] && (
                        <img
                          src={CHARACTER_ICONS[selectedCharacter.name]}
                          alt={selectedCharacter.name}
                          loading="lazy"
                          className="w-8 h-8 rounded object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      )}
                      <span>
                        {selectedCharacter.name}{' '}
                        <span className={`text-sm ${elementColors[selectedCharacter.element]}`}>
                          ({selectedCharacter.element})
                        </span>
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-400">Select a character</span>
                  )}
                  <ChevronDown className="w-5 h-5" />
                </button>

                {showCharacterSelect && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {characters.map(char => (
                      <button
                        key={char.name}
                        onClick={() => {
                          setSelectedCharacter(char);
                          setShowCharacterSelect(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-600 transition-colors flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          {CHARACTER_ICONS[char.name] && (
                            <img
                              src={CHARACTER_ICONS[char.name]}
                              alt={char.name}
                              loading="lazy"
                              className="w-6 h-6 rounded object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                          )}
                          <span>{char.name}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span className={`text-sm ${elementColors[char.element]}`}>
                            {char.element}
                          </span>
                          <span className="text-xs text-gray-400">
                            {'★'.repeat(char.rarity)}
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
              <select
                value={currentLevel}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentLevel(val);
                  if (val >= targetLevel) {
                    setTargetLevel(val === 80 ? 80 : val + 10);
                  }
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 hover:bg-gray-650 transition-colors"
              >
                <option value={1}>1</option>
                {[20, 30, 40, 50, 60, 70, 80].map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Target Level
              </label>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(Number(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 hover:bg-gray-650 transition-colors"
              >
                {[20, 30, 40, 50, 60, 70, 80]
                  .filter(level => level > currentLevel)
                  .map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {selectedCharacter && materials.length > 0 && (
          <>
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Progress</h2>
                <span className="text-sm text-gray-400">
                  {completedMaterials} / {materials.length} materials obtained
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: '#FFE500',
                  }}
                />
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Required Materials</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Material</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-300">Quantity</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-300">Obtained</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map(material => (
                      <tr
                        key={material.name}
                        className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                material.owned ? 'bg-green-500' : 'bg-gray-600'
                              }`}
                            />
                            {formatMaterialName(material.name)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {material.quantity.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleMaterialOwnership(material.name)}
                            className={`p-2 rounded transition-colors ${
                              material.owned
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                            title={material.owned ? 'Mark as not obtained' : 'Mark as obtained'}
                          >
                            {material.owned ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <X className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!selectedCharacter && (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg">
              Select a character to begin planning their ascension
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
