'use client';

import { useState, useEffect } from 'react';
import { CHARACTERS } from '@/lib/data';
import { Award, Save, RotateCcw } from 'lucide-react';

const TIERS = ['S', 'A', 'B', 'C', 'D'];
const TIER_COLORS = {
  S: 'bg-red-900/30 border-red-500',
  A: 'bg-orange-900/30 border-orange-500',
  B: 'bg-yellow-900/30 border-yellow-500',
  C: 'bg-green-900/30 border-green-500',
  D: 'bg-blue-900/30 border-blue-500'
};

export default function TierListPage() {
  const [tierList, setTierList] = useState<{ [key: string]: string[] }>({
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    Unranked: CHARACTERS.map(c => c.Name)
  });
  const [draggedCharacter, setDraggedCharacter] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('endfield-tier-list');
    if (saved) {
      setTierList(JSON.parse(saved));
    }
  }, []);

  const saveTierList = () => {
    localStorage.setItem('endfield-tier-list', JSON.stringify(tierList));
    alert('Tier list saved!');
  };

  const resetTierList = () => {
    if (confirm('Reset tier list to default?')) {
      const reset = {
        S: [],
        A: [],
        B: [],
        C: [],
        D: [],
        Unranked: CHARACTERS.map(c => c.Name)
      };
      setTierList(reset);
      localStorage.setItem('endfield-tier-list', JSON.stringify(reset));
    }
  };

  const handleDragStart = (character: string) => {
    setDraggedCharacter(character);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (tier: string) => {
    if (!draggedCharacter) return;

    const newTierList = { ...tierList };

    // Remove from old tier
    Object.keys(newTierList).forEach(key => {
      newTierList[key] = newTierList[key].filter(c => c !== draggedCharacter);
    });

    // Add to new tier
    newTierList[tier].push(draggedCharacter);

    setTierList(newTierList);
    setDraggedCharacter(null);
  };

  const moveCharacter = (character: string, tier: string) => {
    const newTierList = { ...tierList };

    // Remove from old tier
    Object.keys(newTierList).forEach(key => {
      newTierList[key] = newTierList[key].filter(c => c !== character);
    });

    // Add to new tier
    newTierList[tier].push(character);

    setTierList(newTierList);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-400 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-[#FFE500] flex items-center gap-3">
            <Award className="w-10 h-10" />
            Tier List Builder
          </h1>
          <div className="flex gap-3">
            <button
              onClick={resetTierList}
              className="px-4 py-2 bg-[#111] border border-[#222] rounded-lg hover:border-[#FFE500] transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={saveTierList}
              className="px-6 py-2 bg-[#FFE500] text-black font-bold rounded-lg hover:bg-[#FFE500]/90 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {TIERS.map(tier => (
            <div
              key={tier}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(tier)}
              className={`border rounded-lg p-4 ${TIER_COLORS[tier as keyof typeof TIER_COLORS]}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 flex-shrink-0">
                  <div className="text-4xl font-bold text-white">{tier}</div>
                </div>
                <div className="flex-1 min-h-[80px]">
                  <div className="flex flex-wrap gap-2">
                    {tierList[tier].map(charName => {
                      const character = CHARACTERS.find(c => c.Name === charName);
                      if (!character) return null;

                      return (
                        <div
                          key={charName}
                          draggable
                          onDragStart={() => handleDragStart(charName)}
                          className="bg-[#111] border border-[#222] rounded-lg p-3 cursor-move hover:border-[#FFE500] transition-colors group"
                        >
                          <div className="text-sm font-bold text-white">{character.Name}</div>
                          <div className="text-xs text-gray-500">{character.Role}</div>

                          {/* Quick move buttons */}
                          <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {TIERS.map(t => (
                              t !== tier && (
                                <button
                                  key={t}
                                  onClick={() => moveCharacter(charName, t)}
                                  className="text-xs px-2 py-1 bg-[#222] rounded hover:bg-[#FFE500] hover:text-black"
                                >
                                  {t}
                                </button>
                              )
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Unranked Characters */}
          <div
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('Unranked')}
            className="bg-[#111] border border-[#222] rounded-lg p-4"
          >
            <h2 className="text-xl font-bold text-white mb-4">Unranked Characters</h2>
            <div className="flex flex-wrap gap-2">
              {tierList.Unranked.map(charName => {
                const character = CHARACTERS.find(c => c.Name === charName);
                if (!character) return null;

                return (
                  <div
                    key={charName}
                    draggable
                    onDragStart={() => handleDragStart(charName)}
                    className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 cursor-move hover:border-[#FFE500] transition-colors group"
                  >
                    <div className="text-sm font-bold text-white">{character.Name}</div>
                    <div className="text-xs text-gray-500">{character.Role}</div>

                    {/* Quick move buttons */}
                    <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {TIERS.map(tier => (
                        <button
                          key={tier}
                          onClick={() => moveCharacter(charName, tier)}
                          className="text-xs px-2 py-1 bg-[#222] rounded hover:bg-[#FFE500] hover:text-black"
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-[#111] border border-[#222] rounded-lg p-4 text-sm">
          <h3 className="font-bold text-white mb-2">How to use:</h3>
          <ul className="space-y-1">
            <li>• Drag and drop characters between tiers</li>
            <li>• Or hover over a character and click tier buttons for quick assignment</li>
            <li>• Your tier list is automatically saved to local storage</li>
            <li>• Click Save to manually save your current progress</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
