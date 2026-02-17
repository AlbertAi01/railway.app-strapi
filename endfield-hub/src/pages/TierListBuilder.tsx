import React, { useState, useEffect, type DragEvent } from 'react';
import { Save, Download, Upload, RotateCcw, Palette, Cloud, CloudOff } from 'lucide-react';
import { CHARACTER_ICONS } from '@/lib/assets';
import { useAuthStore } from '@/store/authStore';
import { saveUserData, loadUserData } from '@/lib/userSync';

interface Character {
  id: string;
  name: string;
  rarity: number;
  element: 'Physical' | 'Heat' | 'Cryo' | 'Electric' | 'Nature';
}

interface Tier {
  id: string;
  label: string;
  color: string;
  characters: Character[];
}

const ELEMENT_COLORS = {
  Physical: '#CCCCCC',
  Heat: '#FF6B35',
  Cryo: '#00BFFF',
  Electric: '#9B59B6',
  Nature: '#27AE60',
};

const ALL_CHARACTERS: Character[] = [
  { id: '1', name: 'Ardelia', rarity: 6, element: 'Nature' },
  { id: '2', name: 'Ember', rarity: 6, element: 'Heat' },
  { id: '3', name: 'Endministrator', rarity: 6, element: 'Electric' },
  { id: '4', name: 'Gilberta', rarity: 6, element: 'Physical' },
  { id: '5', name: 'Laevatain', rarity: 6, element: 'Heat' },
  { id: '6', name: 'Last Rite', rarity: 6, element: 'Cryo' },
  { id: '7', name: 'Lifeng', rarity: 6, element: 'Physical' },
  { id: '8', name: 'Pogranichnik', rarity: 6, element: 'Cryo' },
  { id: '9', name: 'Yvonne', rarity: 6, element: 'Electric' },
  { id: '10', name: 'Alesh', rarity: 5, element: 'Physical' },
  { id: '11', name: 'Arclight', rarity: 5, element: 'Electric' },
  { id: '12', name: 'Avywenna', rarity: 5, element: 'Nature' },
  { id: '13', name: 'Chen Qianyu', rarity: 5, element: 'Heat' },
  { id: '14', name: 'Da Pan', rarity: 5, element: 'Physical' },
  { id: '15', name: 'Perlica', rarity: 5, element: 'Cryo' },
  { id: '16', name: 'Snowshine', rarity: 5, element: 'Cryo' },
  { id: '17', name: 'Wulfgard', rarity: 5, element: 'Physical' },
  { id: '18', name: 'Xaihi', rarity: 5, element: 'Nature' },
  { id: '19', name: 'Akekuri', rarity: 4, element: 'Heat' },
  { id: '20', name: 'Antal', rarity: 4, element: 'Electric' },
  { id: '21', name: 'Catcher', rarity: 4, element: 'Physical' },
  { id: '22', name: 'Estella', rarity: 4, element: 'Nature' },
  { id: '23', name: 'Fluorite', rarity: 4, element: 'Cryo' },
];

const DEFAULT_TIERS: Tier[] = [
  { id: 'S', label: 'S', color: '#FF4444', characters: [] },
  { id: 'A', label: 'A', color: '#FF8844', characters: [] },
  { id: 'B', label: 'B', color: '#FFE500', characters: [] },
  { id: 'C', label: 'C', color: '#88FF44', characters: [] },
  { id: 'D', label: 'D', color: '#4488FF', characters: [] },
];

export default function TierListBuilder() {
  const [tiers, setTiers] = useState<Tier[]>(DEFAULT_TIERS);
  const [unplacedCharacters, setUnplacedCharacters] = useState<Character[]>(ALL_CHARACTERS);
  const [draggedCharacter, setDraggedCharacter] = useState<Character | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<string | null>(null);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  useEffect(() => {
    (async () => {
      const saved = await loadUserData<{ tiers: Tier[]; unplacedCharacters: Character[] }>('tierList', isAuthenticated);
      if (saved) {
        setTiers(saved.tiers);
        setUnplacedCharacters(saved.unplacedCharacters);
      }
    })();
  }, [isAuthenticated]);

  const saveTierList = async () => {
    const data = { tiers, unplacedCharacters };
    if (isAuthenticated) setSyncStatus('syncing');
    try {
      await saveUserData('tierList', data, isAuthenticated);
      setSyncStatus(isAuthenticated ? 'synced' : 'idle');
    } catch {
      setSyncStatus('error');
    }
    alert('Tier list saved!');
  };

  const resetTierList = () => {
    if (confirm('Reset tier list to default?')) {
      setTiers(DEFAULT_TIERS);
      setUnplacedCharacters(ALL_CHARACTERS);
      localStorage.removeItem('tierList');
    }
  };

  const exportAsText = () => {
    let text = '=== TIER LIST ===\n\n';
    tiers.forEach((tier) => {
      text += `${tier.label} Tier:\n`;
      if (tier.characters.length === 0) {
        text += '  (empty)\n';
      } else {
        tier.characters.forEach((char) => {
          text += `  - ${char.name} (${char.rarity}★ ${char.element})\n`;
        });
      }
      text += '\n';
    });

    navigator.clipboard.writeText(text);
    alert('Tier list copied to clipboard!');
  };

  const exportAsJSON = () => {
    const data = { tiers, unplacedCharacters };
    const json = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(json);
    alert('Tier list JSON copied to clipboard!');
  };

  const importFromJSON = () => {
    const json = prompt('Paste tier list JSON:');
    if (json) {
      try {
        const data = JSON.parse(json);
        setTiers(data.tiers);
        setUnplacedCharacters(data.unplacedCharacters);
        alert('Tier list imported!');
      } catch (e) {
        alert('Invalid JSON format');
      }
    }
  };

  const handleDragStart = (char: Character, from: string) => {
    setDraggedCharacter(char);
    setDraggedFrom(from);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetTierId: string) => {
    if (!draggedCharacter || !draggedFrom) return;

    // Remove from source
    if (draggedFrom === 'unplaced') {
      setUnplacedCharacters((prev) => prev.filter((c) => c.id !== draggedCharacter.id));
    } else {
      setTiers((prev) =>
        prev.map((tier) =>
          tier.id === draggedFrom
            ? { ...tier, characters: tier.characters.filter((c) => c.id !== draggedCharacter.id) }
            : tier
        )
      );
    }

    // Add to target
    if (targetTierId === 'unplaced') {
      setUnplacedCharacters((prev) => [...prev, draggedCharacter]);
    } else {
      setTiers((prev) =>
        prev.map((tier) =>
          tier.id === targetTierId
            ? { ...tier, characters: [...tier.characters, draggedCharacter] }
            : tier
        )
      );
    }

    setDraggedCharacter(null);
    setDraggedFrom(null);
  };

  const updateTierLabel = (tierId: string, label: string) => {
    setTiers((prev) =>
      prev.map((tier) => (tier.id === tierId ? { ...tier, label } : tier))
    );
  };

  const updateTierColor = (tierId: string, color: string) => {
    setTiers((prev) =>
      prev.map((tier) => (tier.id === tierId ? { ...tier, color } : tier))
    );
  };

  const CharacterCard = ({ character, from }: { character: Character; from: string }) => (
    <div
      draggable
      onDragStart={() => handleDragStart(character, from)}
      className="bg-gray-800 rounded p-2 cursor-move hover:bg-gray-700 transition-colors border-2 border-transparent hover:border-yellow-400 min-w-[100px]"
      style={{ borderLeftColor: ELEMENT_COLORS[character.element], borderLeftWidth: '4px' }}
    >
      <div className="flex items-center gap-2 mb-1">
        {CHARACTER_ICONS[character.name] && (
          <img
            src={CHARACTER_ICONS[character.name]}
            alt={character.name}
            loading="lazy"
            className="w-8 h-8 rounded object-cover flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        )}
        <div className="text-xs font-semibold text-white truncate" title={character.name}>
          {character.name}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-yellow-400 text-xs">{'★'.repeat(character.rarity)}</div>
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: ELEMENT_COLORS[character.element] }}
          title={character.element}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-yellow-400 mb-2">Tier List Builder</h1>
            {isAuthenticated && (
              <div className="flex items-center gap-2 text-sm">
                {syncStatus === 'syncing' && <><Cloud size={16} className="text-blue-400 animate-pulse" /> <span className="text-blue-400">Syncing...</span></>}
                {syncStatus === 'synced' && <><Cloud size={16} className="text-green-400" /> <span className="text-green-400">Cloud synced</span></>}
                {syncStatus === 'error' && <><CloudOff size={16} className="text-red-400" /> <span className="text-red-400">Sync failed</span></>}
              </div>
            )}
          </div>
          <p className="text-gray-400">Drag and drop characters to create your tier list</p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={saveTierList}
            className="flex items-center gap-2 bg-yellow-500 text-gray-900 px-4 py-2 rounded font-semibold hover:bg-yellow-400 transition-colors"
          >
            <Save size={18} />
            Save
          </button>
          <button
            onClick={exportAsText}
            className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded font-semibold hover:bg-gray-600 transition-colors"
          >
            <Download size={18} />
            Export Text
          </button>
          <button
            onClick={exportAsJSON}
            className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded font-semibold hover:bg-gray-600 transition-colors"
          >
            <Download size={18} />
            Export JSON
          </button>
          <button
            onClick={importFromJSON}
            className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded font-semibold hover:bg-gray-600 transition-colors"
          >
            <Upload size={18} />
            Import JSON
          </button>
          <button
            onClick={resetTierList}
            className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded font-semibold hover:bg-red-500 transition-colors"
          >
            <RotateCcw size={18} />
            Reset
          </button>
        </div>

        {/* Tiers */}
        <div className="space-y-3 mb-8">
          {tiers.map((tier) => (
            <div key={tier.id} className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="flex">
                {/* Tier Label */}
                <div
                  className="w-24 flex-shrink-0 flex flex-col items-center justify-center p-4 relative group"
                  style={{ backgroundColor: tier.color }}
                >
                  {editingTier === tier.id ? (
                    <input
                      type="text"
                      value={tier.label}
                      onChange={(e) => updateTierLabel(tier.id, e.target.value)}
                      onBlur={() => setEditingTier(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingTier(null)}
                      className="w-16 text-center text-2xl font-bold bg-black/30 text-white rounded px-1 outline-none"
                      autoFocus
                    />
                  ) : (
                    <div
                      onClick={() => setEditingTier(tier.id)}
                      className="text-3xl font-bold text-white cursor-pointer"
                    >
                      {tier.label}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      const color = prompt('Enter hex color:', tier.color);
                      if (color) updateTierColor(tier.id, color);
                    }}
                    className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Change color"
                  >
                    <Palette size={16} className="text-white" />
                  </button>
                </div>

                {/* Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(tier.id)}
                  className="flex-1 p-4 min-h-[100px] flex flex-wrap gap-2 content-start"
                >
                  {tier.characters.length === 0 ? (
                    <div className="text-gray-500 italic w-full text-center py-6">
                      Drop characters here
                    </div>
                  ) : (
                    tier.characters.map((char) => (
                      <CharacterCard key={char.id} character={char} from={tier.id} />
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Character Pool */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">Character Pool</h2>
          <div
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('unplaced')}
            className="flex flex-wrap gap-2 min-h-[120px] p-4 bg-gray-900 rounded"
          >
            {unplacedCharacters.length === 0 ? (
              <div className="text-gray-500 italic w-full text-center py-6">
                All characters placed
              </div>
            ) : (
              unplacedCharacters.map((char) => (
                <CharacterCard key={char.id} character={char} from="unplaced" />
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h3 className="font-bold text-yellow-400 mb-2">Instructions</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Drag characters from the pool into tier rows</li>
            <li>• Click tier labels to edit them</li>
            <li>• Click the palette icon to change tier colors</li>
            <li>• Save your tier list to localStorage or export to share</li>
            <li>• Character borders show their element type</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
