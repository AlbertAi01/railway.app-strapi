'use client';

import { useState } from 'react';
import { CHARACTERS } from '@/lib/data';
import { TrendingUp, Star, Download, Copy } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';

const ASCENSION_MATERIALS = {
  'Promotion 1': [
    { item: 'Credits', amount: 30000 },
    { item: 'Promotion Material T1', amount: 5 },
    { item: 'Generic Material T2', amount: 4 }
  ],
  'Promotion 2': [
    { item: 'Credits', amount: 80000 },
    { item: 'Promotion Material T2', amount: 4 },
    { item: 'Generic Material T3', amount: 5 },
    { item: 'Rare Material T2', amount: 8 }
  ],
  'Promotion 3': [
    { item: 'Credits', amount: 150000 },
    { item: 'Promotion Material T3', amount: 6 },
    { item: 'Generic Material T4', amount: 5 },
    { item: 'Rare Material T3', amount: 10 }
  ],
  'Promotion 4': [
    { item: 'Credits', amount: 300000 },
    { item: 'Promotion Material T4', amount: 8 },
    { item: 'Generic Material T4', amount: 8 },
    { item: 'Rare Material T4', amount: 15 }
  ],
  'Skill Lv5': [
    { item: 'Skill Material T2', amount: 6 },
    { item: 'Generic Material T2', amount: 4 }
  ],
  'Skill Lv7': [
    { item: 'Skill Material T3', amount: 8 },
    { item: 'Generic Material T3', amount: 6 }
  ],
  'Skill Lv9': [
    { item: 'Skill Material T3', amount: 12 },
    { item: 'Generic Material T4', amount: 4 },
    { item: 'Rare Material T3', amount: 7 }
  ],
  'Skill Lv10': [
    { item: 'Skill Material T4', amount: 15 },
    { item: 'Generic Material T4', amount: 6 },
    { item: 'Rare Material T4', amount: 6 }
  ]
};

export default function AscensionPlannerPage() {
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [currentLevel, setCurrentLevel] = useState('Lv 1');
  const [targetLevel, setTargetLevel] = useState('Lv 70 (Max)');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const character = CHARACTERS.find(c => c.Name === selectedCharacter);

  const calculateMaterials = () => {
    const materials: { [key: string]: number } = {};

    // Add promotion materials based on target level
    const targetLevelNum = parseInt(targetLevel.match(/\d+/)?.[0] || '1');

    if (targetLevelNum >= 20) {
      ASCENSION_MATERIALS['Promotion 1'].forEach(mat => {
        materials[mat.item] = (materials[mat.item] || 0) + mat.amount;
      });
    }
    if (targetLevelNum >= 40) {
      ASCENSION_MATERIALS['Promotion 2'].forEach(mat => {
        materials[mat.item] = (materials[mat.item] || 0) + mat.amount;
      });
    }
    if (targetLevelNum >= 60) {
      ASCENSION_MATERIALS['Promotion 3'].forEach(mat => {
        materials[mat.item] = (materials[mat.item] || 0) + mat.amount;
      });
    }
    if (targetLevelNum >= 70) {
      ASCENSION_MATERIALS['Promotion 4'].forEach(mat => {
        materials[mat.item] = (materials[mat.item] || 0) + mat.amount;
      });
    }

    // Add skill materials
    selectedSkills.forEach(skill => {
      if (ASCENSION_MATERIALS[skill as keyof typeof ASCENSION_MATERIALS]) {
        ASCENSION_MATERIALS[skill as keyof typeof ASCENSION_MATERIALS].forEach(mat => {
          materials[mat.item] = (materials[mat.item] || 0) + mat.amount;
        });
      }
    });

    return materials;
  };

  const materials = calculateMaterials();

  const exportPlanJSON = () => {
    const planData = {
      character: selectedCharacter,
      currentLevel,
      targetLevel,
      selectedSkills,
      materials
    };
    const data = JSON.stringify(planData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zerosanity-ascension-plan-${selectedCharacter.replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyPlanSummary = async () => {
    if (!selectedCharacter) return;

    let summary = `Ascension Plan for ${selectedCharacter}\n`;
    summary += `Current: ${currentLevel} → Target: ${targetLevel}\n\n`;

    if (selectedSkills.length > 0) {
      summary += `Skills: ${selectedSkills.join(', ')}\n\n`;
    }

    summary += `Materials Needed:\n`;
    Object.entries(materials).forEach(([item, amount]) => {
      summary += `• ${item}: ×${amount}\n`;
    });

    summary += `\nCreated with Zero Sanity Toolkit - zerosanity.app`;

    try {
      await navigator.clipboard.writeText(summary);
      alert('Plan summary copied to clipboard!');
    } catch (error) {
      alert('Failed to copy. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[var(--color-text-secondary)] p-6">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader title="Character Development" category="DEVELOPMENT" code="RIOS-ASC-001" icon={<Star size={28} />} />

        {/* Export/Share Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={exportPlanJSON}
            disabled={!selectedCharacter || Object.keys(materials).length === 0}
            className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export Plan (JSON)
          </button>
          <button
            onClick={copyPlanSummary}
            disabled={!selectedCharacter || Object.keys(materials).length === 0}
            className="px-4 py-2 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-[var(--color-accent)]/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Copy className="w-4 h-4" />
            Copy Plan Summary
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Character Selection */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[var(--color-accent)]" />
              Character Selection
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-white">Select Character</label>
                <select
                  value={selectedCharacter}
                  onChange={(e) => setSelectedCharacter(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white"
                >
                  <option value="">Choose a character...</option>
                  {CHARACTERS.map(char => (
                    <option key={char.Name} value={char.Name}>
                      {char.Name} ({char.Rarity}★ {char.Role})
                    </option>
                  ))}
                </select>
              </div>

              {character && (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 clip-corner-tl">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{character.Name}</h3>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: character.Rarity }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#FFE500] text-[#FFE500]" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm">{character.Role} • {character.Element}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-white">Current Level</label>
                  <select
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white"
                  >
                    <option value="Lv 1">Lv 1</option>
                    <option value="Lv 20">Lv 20 (Promotion 1)</option>
                    <option value="Lv 40">Lv 40 (Promotion 2)</option>
                    <option value="Lv 60">Lv 60 (Promotion 3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-white">Target Level</label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white"
                  >
                    <option value="Lv 20">Lv 20 (Promotion 1)</option>
                    <option value="Lv 40">Lv 40 (Promotion 2)</option>
                    <option value="Lv 60">Lv 60 (Promotion 3)</option>
                    <option value="Lv 70 (Max)">Lv 70 (Max Promotion)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-white">Skill Level Goals</label>
                <div className="space-y-2">
                  {['Skill Lv5', 'Skill Lv7', 'Skill Lv9', 'Skill Lv10'].map(skill => (
                    <label key={skill} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSkills([...selectedSkills, skill]);
                          } else {
                            setSelectedSkills(selectedSkills.filter(s => s !== skill));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Materials Required */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Required Materials</h2>

            {selectedCharacter ? (
              <div className="space-y-3">
                {Object.keys(materials).length > 0 ? (
                  Object.entries(materials).map(([item, amount]) => (
                    <div key={item} className="flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-border)] p-4 clip-corner-tl">
                      <span className="font-medium text-white">{item}</span>
                      <span className="text-[var(--color-accent)] font-bold text-lg">×{amount}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-[var(--color-text-tertiary)]">
                    Select target levels and skills to see required materials
                  </p>
                )}

                {Object.keys(materials).length > 0 && (
                  <div className="mt-6 p-4 bg-[var(--color-surface)] border-l-4 border-l-[var(--color-accent)] border border-[var(--color-border)] clip-corner-tl">
                    <h3 className="font-bold text-white mb-2">Farming Tips:</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Farm materials from Talos-II regions</li>
                      <li>• Use AIC Factory for passive material production</li>
                      <li>• Event shops offer best material value</li>
                      <li>• Complete daily missions for Credits and materials</li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-[var(--color-text-tertiary)]">
                Select a character to begin planning
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
