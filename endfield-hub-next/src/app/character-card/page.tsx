'use client';

import { useState, useRef } from 'react';
import { CHARACTERS } from '@/lib/data';
import { Download, Star, Sparkles } from 'lucide-react';

export default function CharacterCardPage() {
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [customText, setCustomText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e');
  const [accentColor, setAccentColor] = useState('#FFE500');
  const cardRef = useRef<HTMLDivElement>(null);

  const character = CHARACTERS.find(c => c.Name === selectedCharacter);

  const downloadCard = () => {
    if (!cardRef.current) return;

    // In a real implementation, you'd use html2canvas or similar
    alert('In a production app, this would download the card as an image using html2canvas or a similar library.');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-400 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#FFE500] mb-8 flex items-center gap-3">
          <Sparkles className="w-10 h-10" />
          Character Card Creator
        </h1>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-[#111] border border-[#222] rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Card Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-white">
                    Select Character
                  </label>
                  <select
                    value={selectedCharacter}
                    onChange={(e) => setSelectedCharacter(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] rounded-lg focus:outline-none focus:border-[#FFE500] text-white"
                  >
                    <option value="">Choose a character...</option>
                    {CHARACTERS.map(char => (
                      <option key={char.Name} value={char.Name}>
                        {char.Name} ({char.Rarity}★)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-white">
                    Custom Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Add custom message..."
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] rounded-lg focus:outline-none focus:border-[#FFE500] text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-white">
                      Background Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[#222] rounded focus:outline-none focus:border-[#FFE500] text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-white">
                      Accent Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[#222] rounded focus:outline-none focus:border-[#FFE500] text-white"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={downloadCard}
                  disabled={!character}
                  className="w-full py-3 bg-[#FFE500] text-black font-bold rounded-lg hover:bg-[#FFE500]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Card
                </button>
              </div>
            </div>

            {character && (
              <div className="bg-[#111] border border-[#222] rounded-lg p-6">
                <h3 className="font-bold text-white mb-3">Character Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Class</span>
                    <span className="text-white font-bold">{character.Role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Faction</span>
                    <span className="text-white font-bold">{character.Element}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Element</span>
                    <span className="text-white font-bold">{character.Element}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weapon</span>
                    <span className="text-white font-bold">{character.WeaponType}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card Preview */}
          <div className="bg-[#111] border border-[#222] rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Card Preview</h2>

            {character ? (
              <div
                ref={cardRef}
                className="rounded-lg overflow-hidden shadow-2xl"
                style={{ backgroundColor }}
              >
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">
                        {character.Name}
                      </h2>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: character.Rarity }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 fill-current text-white"
                            style={{ color: accentColor }}
                          />
                        ))}
                      </div>
                    </div>
                    <div
                      className="px-4 py-2 rounded-lg font-bold text-black"
                      style={{ backgroundColor: accentColor }}
                    >
                      {character.Role}
                    </div>
                  </div>

                  {/* Character Image Placeholder */}
                  <div
                    className="w-full h-64 rounded-lg mb-6 flex items-center justify-center text-white/30"
                    style={{
                      background: `linear-gradient(135deg, ${backgroundColor} 0%, ${accentColor}20 100%)`
                    }}
                  >
                    <Sparkles className="w-24 h-24" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: `${accentColor}20` }}
                    >
                      <div className="text-sm text-white/70 mb-1">Faction</div>
                      <div className="font-bold text-white">{character.Element}</div>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: `${accentColor}20` }}
                    >
                      <div className="text-sm text-white/70 mb-1">Element</div>
                      <div className="font-bold text-white">{character.Element}</div>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: `${accentColor}20` }}
                    >
                      <div className="text-sm text-white/70 mb-1">Weapon</div>
                      <div className="font-bold text-white">{character.WeaponType}</div>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: `${accentColor}20` }}
                    >
                      <div className="text-sm text-white/70 mb-1">Role</div>
                      <div className="font-bold text-white">{character.Role}</div>
                    </div>
                  </div>

                  {/* Custom Text */}
                  {customText && (
                    <div
                      className="p-4 rounded-lg text-center"
                      style={{
                        backgroundColor: `${accentColor}20`,
                        borderLeft: `4px solid ${accentColor}`
                      }}
                    >
                      <p className="text-white font-medium italic">{customText}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                    <span className="text-white/50 text-sm">Endfield Hub</span>
                    <span className="text-white/50 text-sm">{new Date().getFullYear()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-gray-500">
                Select a character to preview the card
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
