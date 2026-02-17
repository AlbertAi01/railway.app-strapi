import React, { useState, useEffect } from 'react';
import { Download, Save, Upload, Copy, Cloud, CloudOff } from 'lucide-react';
import { CHARACTER_ICONS } from '@/lib/assets';
import { useAuthStore } from '@/store/authStore';
import { saveUserData, loadUserData } from '@/lib/userSync';

interface Character {
  name: string;
  rarity: number;
  element: 'Physical' | 'Heat' | 'Cryo' | 'Electric' | 'Nature';
}

interface CharacterBuild {
  character: string;
  level: number;
  weapon: string;
  equipmentSet: string;
  stats: {
    hp: number;
    atk: number;
    def: number;
    critRate: number;
    critDmg: number;
    elementalMastery: number;
  };
}

const ELEMENT_COLORS = {
  Physical: '#CCCCCC',
  Heat: '#FF6B35',
  Cryo: '#00BFFF',
  Electric: '#9B59B6',
  Nature: '#27AE60',
};

const CHARACTERS: Character[] = [
  { name: 'Ardelia', rarity: 6, element: 'Nature' },
  { name: 'Ember', rarity: 6, element: 'Heat' },
  { name: 'Endministrator', rarity: 6, element: 'Electric' },
  { name: 'Gilberta', rarity: 6, element: 'Physical' },
  { name: 'Laevatain', rarity: 6, element: 'Heat' },
  { name: 'Last Rite', rarity: 6, element: 'Cryo' },
  { name: 'Lifeng', rarity: 6, element: 'Physical' },
  { name: 'Pogranichnik', rarity: 6, element: 'Cryo' },
  { name: 'Yvonne', rarity: 6, element: 'Electric' },
  { name: 'Alesh', rarity: 5, element: 'Physical' },
  { name: 'Arclight', rarity: 5, element: 'Electric' },
  { name: 'Avywenna', rarity: 5, element: 'Nature' },
  { name: 'Chen Qianyu', rarity: 5, element: 'Heat' },
  { name: 'Da Pan', rarity: 5, element: 'Physical' },
  { name: 'Perlica', rarity: 5, element: 'Cryo' },
  { name: 'Snowshine', rarity: 5, element: 'Cryo' },
  { name: 'Wulfgard', rarity: 5, element: 'Physical' },
  { name: 'Xaihi', rarity: 5, element: 'Nature' },
  { name: 'Akekuri', rarity: 4, element: 'Heat' },
  { name: 'Antal', rarity: 4, element: 'Electric' },
  { name: 'Catcher', rarity: 4, element: 'Physical' },
  { name: 'Estella', rarity: 4, element: 'Nature' },
  { name: 'Fluorite', rarity: 4, element: 'Cryo' },
];

const WEAPONS = [
  'Skybound Blade',
  'Crimson Edge',
  'Frost Reaver',
  'Thunder Strike',
  'Nature\'s Wrath',
  'Obsidian Cleaver',
  'Radiant Saber',
  'Void Cutter',
  'Solar Flare',
  'Lunar Eclipse',
];

const EQUIPMENT_SETS = [
  'Berserker\'s Rage',
  'Guardian\'s Shield',
  'Assassin\'s Mark',
  'Elemental Master',
  'Critical Focus',
  'Tank\'s Fortitude',
  'Swift Striker',
  'Healing Touch',
];

export default function CharacterCardCreator() {
  const [build, setBuild] = useState<CharacterBuild>({
    character: 'Ardelia',
    level: 80,
    weapon: 'Skybound Blade',
    equipmentSet: 'Berserker\'s Rage',
    stats: {
      hp: 15000,
      atk: 2500,
      def: 800,
      critRate: 55,
      critDmg: 150,
      elementalMastery: 200,
    },
  });

  const [savedBuilds, setSavedBuilds] = useState<CharacterBuild[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  useEffect(() => {
    (async () => {
      const saved = await loadUserData<CharacterBuild[]>('characterBuilds', isAuthenticated);
      if (saved && Array.isArray(saved)) {
        setSavedBuilds(saved);
      }
    })();
  }, [isAuthenticated]);

  const getSelectedCharacter = () => {
    return CHARACTERS.find((c) => c.name === build.character) || CHARACTERS[0];
  };

  const updateBuild = (field: keyof CharacterBuild, value: any) => {
    setBuild((prev) => ({ ...prev, [field]: value }));
  };

  const updateStat = (stat: keyof CharacterBuild['stats'], value: number) => {
    setBuild((prev) => ({
      ...prev,
      stats: { ...prev.stats, [stat]: value },
    }));
  };

  const saveBuild = async () => {
    const newSavedBuilds = [...savedBuilds, build];
    setSavedBuilds(newSavedBuilds);
    if (isAuthenticated) setSyncStatus('syncing');
    try {
      await saveUserData('characterBuilds', newSavedBuilds, isAuthenticated);
      setSyncStatus(isAuthenticated ? 'synced' : 'idle');
    } catch {
      setSyncStatus('error');
    }
    alert('Build saved!');
  };

  const loadBuild = (index: number) => {
    setBuild(savedBuilds[index]);
  };

  const deleteBuild = async (index: number) => {
    if (confirm('Delete this build?')) {
      const newSavedBuilds = savedBuilds.filter((_, i) => i !== index);
      setSavedBuilds(newSavedBuilds);
      await saveUserData('characterBuilds', newSavedBuilds, isAuthenticated);
    }
  };

  const exportAsHTML = () => {
    const character = getSelectedCharacter();
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 20px; background: #111827; font-family: system-ui, -apple-system, sans-serif; }
    .card {
      max-width: 400px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      border: 2px solid ${ELEMENT_COLORS[character.element]};
    }
    .header {
      background: linear-gradient(135deg, ${ELEMENT_COLORS[character.element]} 0%, ${ELEMENT_COLORS[character.element]}99 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .name { font-size: 32px; font-weight: bold; color: white; margin: 0 0 10px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
    .stars { color: #FFE500; font-size: 24px; margin: 5px 0; }
    .level {
      display: inline-block;
      background: rgba(0,0,0,0.3);
      padding: 5px 15px;
      border-radius: 20px;
      color: white;
      font-weight: bold;
      margin-top: 10px;
    }
    .content { padding: 20px; }
    .section { margin-bottom: 20px; }
    .section-title {
      color: #FFE500;
      font-size: 14px;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 10px;
      letter-spacing: 1px;
    }
    .item {
      background: #374151;
      padding: 12px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      border-left: 3px solid ${ELEMENT_COLORS[character.element]};
    }
    .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .stat {
      background: #374151;
      padding: 12px;
      border-radius: 8px;
      border-left: 3px solid ${ELEMENT_COLORS[character.element]};
    }
    .stat-label { color: #9CA3AF; font-size: 12px; margin-bottom: 4px; }
    .stat-value { color: white; font-size: 20px; font-weight: bold; }
    .footer {
      text-align: center;
      padding: 15px;
      background: #1f2937;
      color: #6B7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="name">${character.name}</div>
      <div class="stars">${'★'.repeat(character.rarity)}</div>
      <div style="color: white; font-size: 14px; margin: 5px 0;">${character.element}</div>
      <div class="level">Level ${build.level}</div>
    </div>
    <div class="content">
      <div class="section">
        <div class="section-title">Weapon</div>
        <div class="item">${build.weapon}</div>
      </div>
      <div class="section">
        <div class="section-title">Equipment Set</div>
        <div class="item">${build.equipmentSet}</div>
      </div>
      <div class="section">
        <div class="section-title">Stats</div>
        <div class="stats">
          <div class="stat">
            <div class="stat-label">HP</div>
            <div class="stat-value">${build.stats.hp.toLocaleString()}</div>
          </div>
          <div class="stat">
            <div class="stat-label">ATK</div>
            <div class="stat-value">${build.stats.atk.toLocaleString()}</div>
          </div>
          <div class="stat">
            <div class="stat-label">DEF</div>
            <div class="stat-value">${build.stats.def.toLocaleString()}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Crit Rate</div>
            <div class="stat-value">${build.stats.critRate}%</div>
          </div>
          <div class="stat">
            <div class="stat-label">Crit DMG</div>
            <div class="stat-value">${build.stats.critDmg}%</div>
          </div>
          <div class="stat">
            <div class="stat-label">Elemental Mastery</div>
            <div class="stat-value">${build.stats.elementalMastery}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">Created with Zero Sanity</div>
  </div>
</body>
</html>
    `.trim();

    navigator.clipboard.writeText(html);
    alert('Card HTML copied to clipboard! Paste it into an HTML file to view.');
  };

  const exportAsJSON = () => {
    const json = JSON.stringify(build, null, 2);
    navigator.clipboard.writeText(json);
    alert('Build JSON copied to clipboard!');
  };

  const importFromJSON = () => {
    const json = prompt('Paste build JSON:');
    if (json) {
      try {
        const imported = JSON.parse(json);
        setBuild(imported);
        alert('Build imported!');
      } catch (e) {
        alert('Invalid JSON format');
      }
    }
  };

  const character = getSelectedCharacter();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-yellow-400 mb-2">Character Card Creator</h1>
            {isAuthenticated && (
              <div className="flex items-center gap-2 text-sm">
                {syncStatus === 'syncing' && <><Cloud size={16} className="text-blue-400 animate-pulse" /> <span className="text-blue-400">Syncing...</span></>}
                {syncStatus === 'synced' && <><Cloud size={16} className="text-green-400" /> <span className="text-green-400">Cloud synced</span></>}
                {syncStatus === 'error' && <><CloudOff size={16} className="text-red-400" /> <span className="text-red-400">Sync failed</span></>}
              </div>
            )}
          </div>
          <p className="text-gray-400">Create and share beautiful character build cards</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-4">
            {/* Character Selection */}
            <div className="bg-gray-800 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Character
              </label>
              <select
                value={build.character}
                onChange={(e) => updateBuild('character', e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-yellow-400 focus:outline-none"
              >
                {CHARACTERS.map((char) => (
                  <option key={char.name} value={char.name}>
                    {char.name} ({char.rarity}★ {char.element})
                  </option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div className="bg-gray-800 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Level: {build.level}
              </label>
              <input
                type="range"
                min="1"
                max="90"
                value={build.level}
                onChange={(e) => updateBuild('level', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Weapon */}
            <div className="bg-gray-800 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Weapon
              </label>
              <select
                value={build.weapon}
                onChange={(e) => updateBuild('weapon', e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-yellow-400 focus:outline-none"
              >
                {WEAPONS.map((weapon) => (
                  <option key={weapon} value={weapon}>
                    {weapon}
                  </option>
                ))}
              </select>
            </div>

            {/* Equipment Set */}
            <div className="bg-gray-800 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Equipment Set
              </label>
              <select
                value={build.equipmentSet}
                onChange={(e) => updateBuild('equipmentSet', e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-yellow-400 focus:outline-none"
              >
                {EQUIPMENT_SETS.map((set) => (
                  <option key={set} value={set}>
                    {set}
                  </option>
                ))}
              </select>
            </div>

            {/* Stats */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-bold text-yellow-400 mb-4">Stats</h3>
              <div className="space-y-3">
                {Object.entries(build.stats).map(([stat, value]) => (
                  <div key={stat}>
                    <label className="block text-sm font-semibold text-gray-400 mb-1 capitalize">
                      {stat.replace(/([A-Z])/g, ' $1').trim()}: {value}
                      {stat.includes('Rate') || stat.includes('Dmg') ? '%' : ''}
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) =>
                        updateStat(stat as keyof CharacterBuild['stats'], parseInt(e.target.value) || 0)
                      }
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-yellow-400 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={saveBuild}
                className="flex items-center gap-2 bg-yellow-500 text-gray-900 px-4 py-2 rounded font-semibold hover:bg-yellow-400 transition-colors"
              >
                <Save size={18} />
                Save Build
              </button>
              <button
                onClick={exportAsHTML}
                className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded font-semibold hover:bg-blue-500 transition-colors"
              >
                <Download size={18} />
                Export HTML
              </button>
              <button
                onClick={exportAsJSON}
                className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded font-semibold hover:bg-gray-600 transition-colors"
              >
                <Copy size={18} />
                Copy JSON
              </button>
              <button
                onClick={importFromJSON}
                className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded font-semibold hover:bg-gray-600 transition-colors"
              >
                <Upload size={18} />
                Import JSON
              </button>
            </div>
          </div>

          {/* Preview Card */}
          <div>
            <div className="sticky top-4">
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Preview</h3>
              <div
                className="rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  border: `3px solid ${ELEMENT_COLORS[character.element]}`,
                }}
              >
                {/* Card Header */}
                <div
                  className="p-8 text-center relative"
                  style={{
                    background: `linear-gradient(135deg, ${ELEMENT_COLORS[character.element]} 0%, ${ELEMENT_COLORS[character.element]}99 100%)`,
                  }}
                >
                  {CHARACTER_ICONS[character.name] && (
                    <div className="flex justify-center mb-3">
                      <img
                        src={CHARACTER_ICONS[character.name]}
                        alt={character.name}
                        loading="lazy"
                        className="w-20 h-20 rounded-lg object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                  )}
                  <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    {character.name}
                  </h2>
                  <div className="text-2xl text-yellow-400 mb-2">{'★'.repeat(character.rarity)}</div>
                  <div className="text-white font-semibold mb-3">{character.element}</div>
                  <div className="inline-block bg-black/30 px-4 py-2 rounded-full text-white font-bold">
                    Level {build.level}
                  </div>
                </div>

                {/* Card Content */}
                <div className="bg-gray-800 p-6 space-y-4">
                  {/* Weapon */}
                  <div>
                    <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2">
                      Weapon
                    </div>
                    <div
                      className="bg-gray-700 p-3 rounded-lg font-semibold border-l-4"
                      style={{ borderLeftColor: ELEMENT_COLORS[character.element] }}
                    >
                      {build.weapon}
                    </div>
                  </div>

                  {/* Equipment Set */}
                  <div>
                    <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2">
                      Equipment Set
                    </div>
                    <div
                      className="bg-gray-700 p-3 rounded-lg font-semibold border-l-4"
                      style={{ borderLeftColor: ELEMENT_COLORS[character.element] }}
                    >
                      {build.equipmentSet}
                    </div>
                  </div>

                  {/* Stats */}
                  <div>
                    <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2">
                      Stats
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        className="bg-gray-700 p-3 rounded-lg border-l-4"
                        style={{ borderLeftColor: ELEMENT_COLORS[character.element] }}
                      >
                        <div className="text-xs text-gray-400">HP</div>
                        <div className="text-xl font-bold">{build.stats.hp.toLocaleString()}</div>
                      </div>
                      <div
                        className="bg-gray-700 p-3 rounded-lg border-l-4"
                        style={{ borderLeftColor: ELEMENT_COLORS[character.element] }}
                      >
                        <div className="text-xs text-gray-400">ATK</div>
                        <div className="text-xl font-bold">{build.stats.atk.toLocaleString()}</div>
                      </div>
                      <div
                        className="bg-gray-700 p-3 rounded-lg border-l-4"
                        style={{ borderLeftColor: ELEMENT_COLORS[character.element] }}
                      >
                        <div className="text-xs text-gray-400">DEF</div>
                        <div className="text-xl font-bold">{build.stats.def.toLocaleString()}</div>
                      </div>
                      <div
                        className="bg-gray-700 p-3 rounded-lg border-l-4"
                        style={{ borderLeftColor: ELEMENT_COLORS[character.element] }}
                      >
                        <div className="text-xs text-gray-400">Crit Rate</div>
                        <div className="text-xl font-bold">{build.stats.critRate}%</div>
                      </div>
                      <div
                        className="bg-gray-700 p-3 rounded-lg border-l-4"
                        style={{ borderLeftColor: ELEMENT_COLORS[character.element] }}
                      >
                        <div className="text-xs text-gray-400">Crit DMG</div>
                        <div className="text-xl font-bold">{build.stats.critDmg}%</div>
                      </div>
                      <div
                        className="bg-gray-700 p-3 rounded-lg border-l-4"
                        style={{ borderLeftColor: ELEMENT_COLORS[character.element] }}
                      >
                        <div className="text-xs text-gray-400">Elem. Mastery</div>
                        <div className="text-xl font-bold">{build.stats.elementalMastery}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-900 p-3 text-center text-xs text-gray-500">
                  Created with Zero Sanity
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Builds */}
        {savedBuilds.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Saved Builds</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedBuilds.map((savedBuild, index) => {
                const savedChar = CHARACTERS.find((c) => c.name === savedBuild.character);
                if (!savedChar) return null;

                return (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-lg p-4 border-l-4 hover:bg-gray-700 transition-colors cursor-pointer"
                    style={{ borderLeftColor: ELEMENT_COLORS[savedChar.element] }}
                  >
                    <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                        {CHARACTER_ICONS[savedChar.name] && (
                          <img
                            src={CHARACTER_ICONS[savedChar.name]}
                            alt={savedChar.name}
                            loading="lazy"
                            className="w-10 h-10 rounded object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        )}
                        <div>
                          <h3 className="font-bold text-lg">{savedChar.name}</h3>
                          <p className="text-sm text-gray-400">
                            Level {savedBuild.level} • {savedChar.element}
                          </p>
                        </div>
                      </div>
                      <div className="text-yellow-400">{'★'.repeat(savedChar.rarity)}</div>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{savedBuild.weapon}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadBuild(index)}
                        className="flex-1 bg-yellow-500 text-gray-900 px-3 py-1 rounded text-sm font-semibold hover:bg-yellow-400 transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteBuild(index)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h3 className="font-bold text-yellow-400 mb-2">How to Use</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Select a character and customize their build details</li>
            <li>• Adjust stats using the input fields</li>
            <li>• Preview the card in real-time on the right</li>
            <li>• Save builds to localStorage for later use</li>
            <li>• Export as HTML to share beautiful cards</li>
            <li>• Export/import as JSON for backup or sharing build data</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
