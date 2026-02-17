'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CHARACTERS } from '@/lib/data';
import { CHARACTER_ICONS } from '@/lib/assets';
import { Award, Save, RotateCcw, LayoutGrid, Download, Share2, Link as LinkIcon } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import html2canvas from 'html2canvas';

const TIERS = ['S', 'A', 'B', 'C', 'D'];
const TIER_COLORS = {
  S: 'bg-[#3a1515] border-l-4 border-red-500 border-y border-r border-[var(--color-border)]',
  A: 'bg-[#3a2a15] border-l-4 border-orange-500 border-y border-r border-[var(--color-border)]',
  B: 'bg-[#3a3515] border-l-4 border-yellow-500 border-y border-r border-[var(--color-border)]',
  C: 'bg-[#153a20] border-l-4 border-green-500 border-y border-r border-[var(--color-border)]',
  D: 'bg-[#152a3a] border-l-4 border-blue-500 border-y border-r border-[var(--color-border)]'
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
  const [isExporting, setIsExporting] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const tierListRef = useRef<HTMLDivElement>(null);

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

  const exportAsImage = async () => {
    if (!tierListRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(tierListRef.current, {
        backgroundColor: '#080c12',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zerosanity-tier-list-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
      }, 'image/png');
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  const copyShareLink = async () => {
    try {
      const data = JSON.stringify(tierList);
      const base64 = btoa(data);
      const url = `${window.location.origin}/tier-list?data=${base64}`;
      await navigator.clipboard.writeText(url);
      alert('Tier list link copied to clipboard!');
    } catch (error) {
      alert('Failed to copy link. Please try again.');
    }
    setShowShareMenu(false);
  };

  const shareToTwitter = () => {
    const text = 'Check out my Arknights Endfield tier list! Made with Zero Sanity';
    const url = window.location.href;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
    setShowShareMenu(false);
  };

  const shareToReddit = () => {
    const title = 'My Arknights Endfield Tier List - Zero Sanity Toolkit';
    const url = window.location.href;
    window.open(
      `https://reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
    setShowShareMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#080c12] text-gray-400 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <RIOSHeader title="Combat Assessment Matrix" category="ANALYSIS" code="RIOS-TIER-001" icon={<LayoutGrid size={28} />} />
          <div className="flex gap-3">
            <button
              onClick={exportAsImage}
              disabled={isExporting}
              className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export Image'}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl shadow-xl z-50 overflow-hidden">
                  <button onClick={copyShareLink} className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--color-surface-2)] flex items-center gap-3 text-gray-300">
                    <LinkIcon className="w-4 h-4" />
                    Copy Link
                  </button>
                  <button onClick={shareToTwitter} className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--color-surface-2)] flex items-center gap-3 text-gray-300">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    Post on X
                  </button>
                  <button onClick={shareToReddit} className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--color-surface-2)] flex items-center gap-3 text-gray-300">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                    Post on Reddit
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={resetTierList}
              className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={saveTierList}
              className="px-6 py-2 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-[var(--color-accent)]/90 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        <div ref={tierListRef} className="space-y-4">
          {TIERS.map(tier => (
            <div
              key={tier}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(tier)}
              className={`p-4 ${TIER_COLORS[tier as keyof typeof TIER_COLORS]}`}
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

                      const iconUrl = CHARACTER_ICONS[character.Name];

                      return (
                        <div
                          key={charName}
                          draggable
                          onDragStart={() => handleDragStart(charName)}
                          className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-3 cursor-move hover:border-[var(--color-accent)] transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            {iconUrl && (
                              <Image
                                src={iconUrl}
                                alt={character.Name}
                                width={48}
                                height={48}
                                className="border border-[var(--color-border)]"
                              />
                            )}
                            <div>
                              <div className="text-sm font-bold text-white">{character.Name}</div>
                              <div className="text-xs text-[var(--color-text-tertiary)]">{character.Role}</div>
                            </div>
                          </div>

                          {/* Quick move buttons */}
                          <div className="mt-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {TIERS.map(t => (
                              t !== tier && (
                                <button
                                  key={t}
                                  onClick={() => moveCharacter(charName, t)}
                                  className="text-xs px-2 py-1 bg-[var(--color-border)] clip-corner-tl hover:bg-[var(--color-accent)] hover:text-black"
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
            className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4"
          >
            <h2 className="text-xl font-bold text-white mb-4">Unranked Characters</h2>
            <div className="flex flex-wrap gap-2">
              {tierList.Unranked.map(charName => {
                const character = CHARACTERS.find(c => c.Name === charName);
                if (!character) return null;

                const iconUrl = CHARACTER_ICONS[character.Name];

                return (
                  <div
                    key={charName}
                    draggable
                    onDragStart={() => handleDragStart(charName)}
                    className="bg-[#080c12] border border-[var(--color-border)] clip-corner-tl p-3 cursor-move hover:border-[var(--color-accent)] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {iconUrl && (
                        <Image
                          src={iconUrl}
                          alt={character.Name}
                          width={48}
                          height={48}
                          className="border border-[var(--color-border)]"
                        />
                      )}
                      <div>
                        <div className="text-sm font-bold text-white">{character.Name}</div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">{character.Role}</div>
                      </div>
                    </div>

                    {/* Quick move buttons */}
                    <div className="mt-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {TIERS.map(tier => (
                        <button
                          key={tier}
                          onClick={() => moveCharacter(charName, tier)}
                          className="text-xs px-2 py-1 bg-[var(--color-border)] clip-corner-tl hover:bg-[var(--color-accent)] hover:text-black"
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

        <div className="mt-6 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 text-sm">
          <h3 className="font-bold text-white mb-2">How to use:</h3>
          <ul className="space-y-1">
            <li>• Drag and drop characters between tiers</li>
            <li>• Or hover over a character and click tier buttons for quick assignment</li>
            <li>• Your tier list is automatically saved to local storage</li>
            <li>• Click Save to manually save your current progress</li>
          </ul>
        </div>
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
      )}
    </div>
  );
}
