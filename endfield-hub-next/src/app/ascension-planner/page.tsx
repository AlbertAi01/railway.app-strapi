'use client';

import { useState } from 'react';
import { CHARACTERS } from '@/lib/data';
import { TrendingUp, Star, Download, Copy } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';

const ASCENSION_MATERIALS = {
  E1: [
    { item: 'LMD', amount: 30000 },
    { item: 'Chip (Class)', amount: 5 },
    { item: 'Generic Material T3', amount: 4 }
  ],
  E2: [
    { item: 'LMD', amount: 180000 },
    { item: 'Chip Pack (Class)', amount: 4 },
    { item: 'Generic Material T4', amount: 5 },
    { item: 'Rare Material T4', amount: 8 }
  ],
  E3: [
    { item: 'LMD', amount: 300000 },
    { item: 'Chip Pack (Class)', amount: 6 },
    { item: 'Generic Material T5', amount: 5 },
    { item: 'Rare Material T5', amount: 10 }
  ],
  E4: [
    { item: 'LMD', amount: 500000 },
    { item: 'Chip Pack (Class)', amount: 8 },
    { item: 'Generic Material T6', amount: 8 },
    { item: 'Rare Material T6', amount: 15 }
  ],
  'Skill 7': [
    { item: 'Skill Summary 3', amount: 8 },
    { item: 'Generic Material T3', amount: 6 }
  ],
  'M1': [
    { item: 'Skill Summary 3', amount: 8 },
    { item: 'Generic Material T4', amount: 4 },
    { item: 'Rare Material T3', amount: 7 }
  ],
  'M2': [
    { item: 'Skill Summary 3', amount: 12 },
    { item: 'Generic Material T4', amount: 4 },
    { item: 'Rare Material T4', amount: 4 }
  ],
  'M3': [
    { item: 'Skill Summary 3', amount: 15 },
    { item: 'Generic Material T5', amount: 6 },
    { item: 'Rare Material T4', amount: 6 }
  ]
};

export default function AscensionPlannerPage() {
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [currentLevel, setCurrentLevel] = useState('E0 1');
  const [targetLevel, setTargetLevel] = useState('E4 90');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const character = CHARACTERS.find(c => c.Name === selectedCharacter);

  const calculateMaterials = () => {
    const materials: { [key: string]: number } = {};

    // Add promotion materials based on target level
    if (targetLevel.includes('E1') || targetLevel.includes('E2') || targetLevel.includes('E3') || targetLevel.includes('E4')) {
      ASCENSION_MATERIALS.E1.forEach(mat => {
        materials[mat.item] = (materials[mat.item] || 0) + mat.amount;
      });
    }
    if (targetLevel.includes('E2') || targetLevel.includes('E3') || targetLevel.includes('E4')) {
      ASCENSION_MATERIALS.E2.forEach(mat => {
        materials[mat.item] = (materials[mat.item] || 0) + mat.amount;
      });
    }
    if (targetLevel.includes('E3') || targetLevel.includes('E4')) {
      ASCENSION_MATERIALS.E3.forEach(mat => {
        materials[mat.item] = (materials[mat.item] || 0) + mat.amount;
      });
    }
    if (targetLevel.includes('E4')) {
      ASCENSION_MATERIALS.E4.forEach(mat => {
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
    <div className="min-h-screen bg-[#080c12] text-[var(--color-text-secondary)] p-6">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader title="Operator Development" category="DEVELOPMENT" code="RIOS-ASC-001" icon={<Star size={28} />} />

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
                    <option value="E0 1">E0 1</option>
                    <option value="E1 1">E1 1</option>
                    <option value="E1 40">E1 40 (Max)</option>
                    <option value="E2 1">E2 1</option>
                    <option value="E2 60">E2 60 (Max)</option>
                    <option value="E3 1">E3 1</option>
                    <option value="E3 80">E3 80 (Max)</option>
                    <option value="E4 1">E4 1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-white">Target Level</label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white"
                  >
                    <option value="E1 40">E1 40 (Max)</option>
                    <option value="E2 60">E2 60 (Max)</option>
                    <option value="E3 80">E3 80 (Max)</option>
                    <option value="E4 90">E4 90 (Max)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-white">Skill Mastery Goals</label>
                <div className="space-y-2">
                  {['Skill 7', 'M1', 'M2', 'M3'].map(skill => (
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
                      <li>• Farm LMD from CE-5 or event stages</li>
                      <li>• Get chips from chip stages (Mon-Fri rotation)</li>
                      <li>• Event shops have the best material value</li>
                      <li>• Use your base to produce EXP and Gold</li>
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
