'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Target, Plus, Trash2, TrendingUp, Download, Share2, Link as LinkIcon } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import html2canvas from 'html2canvas';
import { CHARACTERS, WEAPONS } from '@/lib/data';
import { CHARACTER_ICONS, WEAPON_ICONS } from '@/lib/assets';

interface Pull {
  id: string;
  timestamp: number;
  rarity: number;
  item: string;
  banner: string;
  icon?: string;
  type?: 'character' | 'weapon' | 'material';
}

const BANNERS = ['Standard', 'Limited', 'Weapon'];
const RARITIES = [3, 4, 5, 6];

export default function HeadhuntTrackerPage() {
  const [pulls, setPulls] = useState<Pull[]>([]);
  const [selectedBanner, setSelectedBanner] = useState('Standard');
  const [pityCounters, setPityCounters] = useState<{ [key: string]: number }>({
    Standard: 0,
    Limited: 0,
    Weapon: 0
  });
  const [isExporting, setIsExporting] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [selectedRarity, setSelectedRarity] = useState<number>(6);
  const [selectedType, setSelectedType] = useState<'character' | 'weapon'>('character');
  const [customItemName, setCustomItemName] = useState('');

  useEffect(() => {
    const savedPulls = localStorage.getItem('endfield-pulls');
    const savedPity = localStorage.getItem('endfield-pity');

    if (savedPulls) {
      setPulls(JSON.parse(savedPulls));
    }
    if (savedPity) {
      setPityCounters(JSON.parse(savedPity));
    }
  }, []);

  const savePulls = (newPulls: Pull[]) => {
    setPulls(newPulls);
    localStorage.setItem('endfield-pulls', JSON.stringify(newPulls));
  };

  const savePity = (newPity: { [key: string]: number }) => {
    setPityCounters(newPity);
    localStorage.setItem('endfield-pity', JSON.stringify(newPity));
  };

  const addPull = (rarity: number, item: string, icon?: string, type?: 'character' | 'weapon' | 'material') => {
    const newPull: Pull = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      rarity,
      item,
      banner: selectedBanner,
      icon,
      type
    };

    const newPulls = [newPull, ...pulls];
    savePulls(newPulls);

    // Update pity
    if (rarity === 6) {
      savePity({ ...pityCounters, [selectedBanner]: 0 });
    } else {
      savePity({
        ...pityCounters,
        [selectedBanner]: pityCounters[selectedBanner] + 1
      });
    }
  };

  const addCustomPull = () => {
    if (!customItemName.trim()) {
      alert('Please enter an item name');
      return;
    }

    let icon: string | undefined;
    let type: 'character' | 'weapon' | 'material' = 'material';

    if (selectedType === 'character') {
      const char = CHARACTERS.find(c => c.Name === customItemName || c.Name.toLowerCase() === customItemName.toLowerCase());
      if (char) {
        icon = CHARACTER_ICONS[char.Name];
        type = 'character';
      }
    } else if (selectedType === 'weapon') {
      const weapon = WEAPONS.find(w => w.Name === customItemName || w.Name.toLowerCase() === customItemName.toLowerCase());
      if (weapon) {
        icon = WEAPON_ICONS[weapon.Name];
        type = 'weapon';
      }
    }

    addPull(selectedRarity, customItemName, icon, type);
    setCustomItemName('');
  };

  const getAvailableItems = () => {
    if (selectedType === 'character') {
      return CHARACTERS.filter(c => c.Rarity === selectedRarity);
    } else {
      return WEAPONS.filter(w => w.Rarity === selectedRarity);
    }
  };

  const deletePull = (id: string) => {
    if (confirm('Delete this pull record?')) {
      const newPulls = pulls.filter(p => p.id !== id);
      savePulls(newPulls);

      // Recalculate pity
      const newPity: { [key: string]: number } = { Standard: 0, Limited: 0, Weapon: 0 };
      BANNERS.forEach(banner => {
        const bannerPulls = newPulls.filter(p => p.banner === banner);
        let counter = 0;
        for (const pull of bannerPulls) {
          if (pull.rarity === 6) {
            counter = 0;
            break;
          }
          counter++;
        }
        newPity[banner] = counter;
      });
      savePity(newPity);
    }
  };

  const getStats = () => {
    const bannerPulls = pulls.filter(p => p.banner === selectedBanner);
    const total = bannerPulls.length;
    const sixStar = bannerPulls.filter(p => p.rarity === 6).length;
    const fiveStar = bannerPulls.filter(p => p.rarity === 5).length;

    return {
      total,
      sixStar,
      fiveStar,
      sixStarRate: total > 0 ? ((sixStar / total) * 100).toFixed(2) : '0.00',
      fiveStarRate: total > 0 ? ((fiveStar / total) * 100).toFixed(2) : '0.00'
    };
  };

  const exportHistoryJSON = () => {
    const data = JSON.stringify({ pulls, pityCounters }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zerosanity-headhunt-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSummaryAsImage = async () => {
    if (!statsRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(statsRef.current, {
        backgroundColor: '#0a0a0a',
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
        a.download = `zerosanity-headhunt-stats-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
      }, 'image/png');
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  const shareStatsLink = async () => {
    try {
      const stats = getStats();
      const text = `My Endfield Headhunt Stats: ${stats.total} pulls, ${stats.sixStar} 6★ (${stats.sixStarRate}%), ${stats.fiveStar} 5★ (${stats.fiveStarRate}%) - Track yours at ${window.location.origin}/headhunt-tracker`;
      await navigator.clipboard.writeText(text);
      alert('Stats copied to clipboard!');
    } catch (error) {
      alert('Failed to copy stats. Please try again.');
    }
  };

  const stats = getStats();

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader
          title="Headhunt Operations Log"
          category="RECRUITMENT"
          code="RIOS-HH-001"
          icon={<Target size={28} />}
        />

        {/* Export/Share Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={exportHistoryJSON}
            disabled={pulls.length === 0}
            className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export History (JSON)
          </button>
          <button
            onClick={exportSummaryAsImage}
            disabled={isExporting || pulls.length === 0}
            className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export Summary Image'}
          </button>
          <button
            onClick={shareStatsLink}
            disabled={pulls.length === 0}
            className="px-4 py-2 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-[var(--color-accent)]/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            Share Stats
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add Pull & Stats */}
          <div ref={statsRef} className="space-y-6">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Record Pull</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-white">Banner</label>
                  <select
                    value={selectedBanner}
                    onChange={(e) => setSelectedBanner(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent)] text-white"
                  >
                    {BANNERS.map(banner => (
                      <option key={banner} value={banner}>{banner}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-white">Rarity</label>
                  <div className="grid grid-cols-4 gap-2">
                    {RARITIES.map(rarity => (
                      <button
                        key={rarity}
                        onClick={() => setSelectedRarity(rarity)}
                        className={`py-2 rounded-lg font-bold transition-colors ${
                          selectedRarity === rarity
                            ? rarity === 6
                              ? 'bg-orange-500 text-white'
                              : rarity === 5
                              ? 'bg-purple-500 text-white'
                              : 'bg-[var(--color-accent)] text-black'
                            : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)]'
                        }`}
                      >
                        {rarity}★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-white">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedType('character')}
                      className={`py-2 rounded-lg font-medium transition-colors ${
                        selectedType === 'character'
                          ? 'bg-[var(--color-accent)] text-black'
                          : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)]'
                      }`}
                    >
                      Character
                    </button>
                    <button
                      onClick={() => setSelectedType('weapon')}
                      className={`py-2 rounded-lg font-medium transition-colors ${
                        selectedType === 'weapon'
                          ? 'bg-[var(--color-accent)] text-black'
                          : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)]'
                      }`}
                    >
                      Weapon
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-white">Item Name</label>
                  <input
                    type="text"
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    placeholder="Enter or select item..."
                    className="w-full px-4 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent)] text-white text-sm mb-2"
                    list="items-datalist"
                  />
                  <datalist id="items-datalist">
                    {getAvailableItems().map(item => (
                      <option key={item.id} value={item.Name} />
                    ))}
                  </datalist>
                  <button
                    onClick={addCustomPull}
                    className="w-full py-3 bg-[var(--color-accent)] text-black font-bold rounded-lg hover:bg-[var(--color-accent)]/90 transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Pull
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--color-accent)]" />
                Pity Counter
              </h2>

              <div className="space-y-3">
                {BANNERS.map(banner => (
                  <div key={banner} className="bg-[var(--color-surface-2)] p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{banner}</span>
                      <span className={`text-2xl font-bold ${
                        pityCounters[banner] >= 50 ? 'text-red-400' : 'text-[var(--color-accent)]'
                      }`}>
                        {pityCounters[banner]}
                      </span>
                    </div>
                    <div className="w-full bg-[var(--color-border)] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          pityCounters[banner] >= 50 ? 'bg-red-500' : 'bg-[var(--color-accent)]'
                        }`}
                        style={{ width: `${Math.min((pityCounters[banner] / 100) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs mt-1 text-[var(--color-text-tertiary)]">
                      {pityCounters[banner] >= 50 ? 'Soft pity active!' : `${100 - pityCounters[banner]} pulls to guarantee`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Statistics ({selectedBanner})</h2>

              <div className="space-y-3">
                <div className="bg-[var(--color-surface-2)] p-3 rounded-lg flex items-center justify-between">
                  <span>Total Pulls</span>
                  <span className="text-white font-bold">{stats.total}</span>
                </div>
                <div className="bg-[var(--color-surface-2)] p-3 rounded-lg flex items-center justify-between">
                  <span>6★ Pulls</span>
                  <span className="text-orange-400 font-bold">{stats.sixStar}</span>
                </div>
                <div className="bg-[var(--color-surface-2)] p-3 rounded-lg flex items-center justify-between">
                  <span>6★ Rate</span>
                  <span className="text-[var(--color-accent)] font-bold">{stats.sixStarRate}%</span>
                </div>
                <div className="bg-[var(--color-surface-2)] p-3 rounded-lg flex items-center justify-between">
                  <span>5★ Rate</span>
                  <span className="text-purple-400 font-bold">{stats.fiveStarRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pull History */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Pull History</h2>

              {pulls.filter(p => p.banner === selectedBanner).length > 0 ? (
                <div className="space-y-2 max-h-[800px] overflow-y-auto">
                  {pulls.filter(p => p.banner === selectedBanner).map((pull, index) => (
                    <div
                      key={pull.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        pull.rarity === 6
                          ? 'bg-orange-900/20 border border-orange-500/50'
                          : pull.rarity === 5
                          ? 'bg-purple-900/20 border border-purple-500/50'
                          : 'bg-[var(--color-surface-2)] border border-[var(--color-border)]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-[var(--color-text-tertiary)]">#{pulls.filter(p => p.banner === selectedBanner).length - index}</div>
                        {pull.icon ? (
                          <div className="w-12 h-12 flex items-center justify-center rounded-lg overflow-hidden" style={{
                            backgroundColor: pull.rarity === 6 ? 'rgba(249, 115, 22, 0.1)' :
                              pull.rarity === 5 ? 'rgba(168, 85, 247, 0.1)' :
                              'rgba(59, 130, 246, 0.1)'
                          }}>
                            <Image
                              src={pull.icon}
                              alt={pull.item}
                              width={48}
                              height={48}
                              className="w-full h-full object-contain"
                              unoptimized
                            />
                          </div>
                        ) : null}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${
                              pull.rarity === 6 ? 'text-orange-400' :
                              pull.rarity === 5 ? 'text-purple-400' : 'text-white'
                            }`}>
                              {pull.item}
                            </span>
                            <span className="text-xs px-2 py-1 bg-[var(--color-border)] rounded">
                              {pull.rarity}★
                            </span>
                            {pull.type && (
                              <span className="text-xs px-2 py-1 bg-[var(--color-surface-2)] rounded capitalize">
                                {pull.type}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[var(--color-text-tertiary)] mt-1">
                            {new Date(pull.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deletePull(pull.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[var(--color-text-tertiary)]">
                  No pulls recorded for this banner yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
