'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Target, Plus, Trash2, TrendingUp, Download, Share2, Upload, Clock, BarChart3, Trophy, ChevronDown, Cloud, CloudOff, Loader2, X } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import html2canvas from 'html2canvas';
import { CHARACTERS, WEAPONS } from '@/lib/data';
import { CHARACTER_ICONS, WEAPON_ICONS } from '@/lib/assets';
import { useAuthStore } from '@/store/authStore';
import { syncToCloud, loadFromCloud, saveLocal, loadLocal } from '@/lib/userSync';

interface Pull {
  id: string;
  timestamp: number;
  rarity: number;
  item: string;
  banner: string;
  icon?: string;
  type?: 'character' | 'weapon' | 'material';
}

interface HeadhuntData {
  pulls: Pull[];
  pityCounters: Record<string, number>;
}

const BANNERS = [
  { id: 'basic', name: 'Basic Headhunting', color: '#888' },
  { id: 'limited-1', name: 'Scars of the Forge', color: '#ff6b35', featured: 'Laevatain' },
  { id: 'limited-2', name: 'Hues of Passion', color: '#e74c9e', featured: 'Ardelia' },
  { id: 'limited-3', name: 'Rime of the Depths', color: '#4fc3f7', featured: 'Last Rite' },
  { id: 'weapon', name: 'Weapon Banner', color: '#a855f7' },
];

const RARITIES = [3, 4, 5, 6];

type Tab = 'record' | 'history' | 'stats';

const LOCAL_KEY = 'zerosanity-headhunt';

export default function HeadhuntTrackerPage() {
  const [activeTab, setActiveTab] = useState<Tab>('record');
  const [pulls, setPulls] = useState<Pull[]>([]);
  const [selectedBanner, setSelectedBanner] = useState('basic');
  const [pityCounters, setPityCounters] = useState<Record<string, number>>({});
  const [isExporting, setIsExporting] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [selectedRarity, setSelectedRarity] = useState<number>(6);
  const [selectedType, setSelectedType] = useState<'character' | 'weapon'>('character');
  const [customItemName, setCustomItemName] = useState('');
  const [historyBannerFilter, setHistoryBannerFilter] = useState<string>('all');
  const [historyRarityFilter, setHistoryRarityFilter] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkCount, setBulkCount] = useState(10);

  // Cloud sync
  const { user, token } = useAuthStore();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadDone = useRef(false);

  // Load data on mount
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const loadData = async () => {
      let data: HeadhuntData | null = null;

      if (token) {
        setSyncStatus('syncing');
        const cloud = await loadFromCloud('headhuntTracker', token) as HeadhuntData | null;
        if (cloud && cloud.pulls) {
          data = cloud;
          setSyncStatus('synced');
        } else {
          setSyncStatus('idle');
        }
      }

      if (!data) {
        // Migrate from old localStorage keys
        const oldPulls = localStorage.getItem('endfield-pulls');
        const oldPity = localStorage.getItem('endfield-pity');
        if (oldPulls) {
          try {
            const p = JSON.parse(oldPulls);
            const c = oldPity ? JSON.parse(oldPity) : {};
            // Map old banner names to new IDs
            const mappedPulls = (p as Pull[]).map(pull => ({
              ...pull,
              banner: mapOldBannerName(pull.banner),
            }));
            data = { pulls: mappedPulls, pityCounters: c };
          } catch { /* ignore */ }
        }

        if (!data) {
          const local = loadLocal('headhunt') as HeadhuntData | null;
          if (local) data = local;
        }
      }

      if (data) {
        setPulls(data.pulls || []);
        setPityCounters(data.pityCounters || {});
      }
    };

    loadData();
  }, [token]);

  const saveData = useCallback((newPulls: Pull[], newPity: Record<string, number>) => {
    const data: HeadhuntData = { pulls: newPulls, pityCounters: newPity };
    saveLocal('headhunt', data);
    // Also save to old keys for backwards compat
    localStorage.setItem('endfield-pulls', JSON.stringify(newPulls));
    localStorage.setItem('endfield-pity', JSON.stringify(newPity));

    if (token) {
      if (syncTimeout.current) clearTimeout(syncTimeout.current);
      setSyncStatus('syncing');
      syncTimeout.current = setTimeout(async () => {
        try {
          await syncToCloud('headhuntTracker', data, token);
          setSyncStatus('synced');
        } catch {
          setSyncStatus('error');
        }
      }, 2000);
    }
  }, [token]);

  function mapOldBannerName(name: string): string {
    const map: Record<string, string> = {
      'Standard': 'basic',
      'Limited': 'limited-1',
      'Weapon': 'weapon',
    };
    return map[name] || name;
  }

  const getBannerName = (id: string) => BANNERS.find(b => b.id === id)?.name || id;
  const getBannerColor = (id: string) => BANNERS.find(b => b.id === id)?.color || '#888';

  const addPull = (rarity: number, item: string, icon?: string, type?: 'character' | 'weapon' | 'material') => {
    const newPull: Pull = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      rarity,
      item,
      banner: selectedBanner,
      icon,
      type,
    };

    const newPulls = [newPull, ...pulls];
    const newPity = { ...pityCounters };
    if (rarity === 6) {
      newPity[selectedBanner] = 0;
    } else {
      newPity[selectedBanner] = (newPity[selectedBanner] || 0) + 1;
    }

    setPulls(newPulls);
    setPityCounters(newPity);
    saveData(newPulls, newPity);
  };

  const addCustomPull = () => {
    if (!customItemName.trim()) return;

    let icon: string | undefined;
    let type: 'character' | 'weapon' | 'material' = 'material';

    if (selectedType === 'character') {
      const char = CHARACTERS.find(c => c.Name.toLowerCase() === customItemName.toLowerCase());
      if (char) {
        icon = CHARACTER_ICONS[char.Name];
        type = 'character';
      }
    } else {
      const weapon = WEAPONS.find(w => w.Name.toLowerCase() === customItemName.toLowerCase());
      if (weapon) {
        icon = WEAPON_ICONS[weapon.Name];
        type = 'weapon';
      }
    }

    addPull(selectedRarity, customItemName, icon, type);
    setCustomItemName('');
  };

  const addBulkPulls = () => {
    const newPulls = [...pulls];
    const newPity = { ...pityCounters };

    for (let i = 0; i < bulkCount; i++) {
      // Simulate gacha rates
      const rand = Math.random() * 100;
      let rarity: number;
      let item: string;
      let icon: string | undefined;
      let type: 'character' | 'weapon' | 'material' = 'material';

      const currentPity = newPity[selectedBanner] || 0;
      const softPityBonus = currentPity >= 50 ? (currentPity - 49) * 2 : 0;

      if (rand < 1.76 + softPityBonus) {
        rarity = 6;
        const chars6 = CHARACTERS.filter(c => c.Rarity === 6);
        const picked = chars6[Math.floor(Math.random() * chars6.length)];
        item = picked.Name;
        icon = CHARACTER_ICONS[picked.Name];
        type = 'character';
        newPity[selectedBanner] = 0;
      } else if (rand < 1.76 + softPityBonus + 13.15) {
        rarity = 5;
        const isChar = Math.random() > 0.5;
        if (isChar) {
          const chars5 = CHARACTERS.filter(c => c.Rarity === 5);
          const picked = chars5[Math.floor(Math.random() * chars5.length)];
          item = picked.Name;
          icon = CHARACTER_ICONS[picked.Name];
          type = 'character';
        } else {
          const wpns5 = WEAPONS.filter(w => w.Rarity === 5);
          const picked = wpns5[Math.floor(Math.random() * wpns5.length)];
          item = picked.Name;
          icon = WEAPON_ICONS[picked.Name];
          type = 'weapon';
        }
        newPity[selectedBanner] = (newPity[selectedBanner] || 0) + 1;
      } else if (rand < 60) {
        rarity = 4;
        const chars4 = CHARACTERS.filter(c => c.Rarity === 4);
        if (chars4.length > 0) {
          const picked = chars4[Math.floor(Math.random() * chars4.length)];
          item = picked.Name;
          icon = CHARACTER_ICONS[picked.Name];
          type = 'character';
        } else {
          item = '4-Star Item';
        }
        newPity[selectedBanner] = (newPity[selectedBanner] || 0) + 1;
      } else {
        rarity = 3;
        item = '3-Star Material';
        newPity[selectedBanner] = (newPity[selectedBanner] || 0) + 1;
      }

      newPulls.unshift({
        id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
        timestamp: Date.now() - (bulkCount - i) * 1000,
        rarity,
        item,
        banner: selectedBanner,
        icon,
        type,
      });
    }

    setPulls(newPulls);
    setPityCounters(newPity);
    saveData(newPulls, newPity);
    setShowBulkAdd(false);
  };

  const getAvailableItems = () => {
    if (selectedType === 'character') {
      return CHARACTERS.filter(c => c.Rarity === selectedRarity);
    }
    return WEAPONS.filter(w => w.Rarity === selectedRarity);
  };

  const deletePull = (id: string) => {
    const newPulls = pulls.filter(p => p.id !== id);
    // Recalculate pity
    const newPity: Record<string, number> = {};
    BANNERS.forEach(banner => {
      const bannerPulls = newPulls.filter(p => p.banner === banner.id).sort((a, b) => b.timestamp - a.timestamp);
      let counter = 0;
      for (const pull of bannerPulls) {
        if (pull.rarity === 6) break;
        counter++;
      }
      newPity[banner.id] = counter;
    });

    setPulls(newPulls);
    setPityCounters(newPity);
    saveData(newPulls, newPity);
    setShowDeleteConfirm(null);
  };

  const clearAllPulls = () => {
    if (!confirm('Are you sure you want to clear ALL pull history? This cannot be undone.')) return;
    setPulls([]);
    const newPity: Record<string, number> = {};
    BANNERS.forEach(b => { newPity[b.id] = 0; });
    setPityCounters(newPity);
    saveData([], newPity);
  };

  // Stats calculations
  const getStatsForBanner = useCallback((bannerId: string | 'all') => {
    const filtered = bannerId === 'all' ? pulls : pulls.filter(p => p.banner === bannerId);
    const total = filtered.length;
    const sixStar = filtered.filter(p => p.rarity === 6);
    const fiveStar = filtered.filter(p => p.rarity === 5);
    const fourStar = filtered.filter(p => p.rarity === 4);

    // Calculate avg pulls between 6-stars
    let avgPity = 0;
    if (sixStar.length > 0) {
      const sorted = [...filtered].sort((a, b) => a.timestamp - b.timestamp);
      let totalGaps = 0;
      let gapCount = 0;
      let sinceLastSix = 0;
      for (const p of sorted) {
        sinceLastSix++;
        if (p.rarity === 6) {
          totalGaps += sinceLastSix;
          gapCount++;
          sinceLastSix = 0;
        }
      }
      avgPity = gapCount > 0 ? Math.round(totalGaps / gapCount) : 0;
    }

    // Count unique 6-stars
    const unique6 = new Set(sixStar.map(p => p.item)).size;

    return {
      total,
      sixStar: sixStar.length,
      fiveStar: fiveStar.length,
      fourStar: fourStar.length,
      threeStar: filtered.filter(p => p.rarity === 3).length,
      sixStarRate: total > 0 ? ((sixStar.length / total) * 100).toFixed(2) : '0.00',
      fiveStarRate: total > 0 ? ((fiveStar.length / total) * 100).toFixed(2) : '0.00',
      fourStarRate: total > 0 ? ((fourStar.length / total) * 100).toFixed(2) : '0.00',
      avgPity,
      unique6,
    };
  }, [pulls]);

  // Most pulled 6-stars
  const mostPulled6Stars = useMemo(() => {
    const counts: Record<string, { count: number; icon?: string }> = {};
    pulls.filter(p => p.rarity === 6).forEach(p => {
      if (!counts[p.item]) counts[p.item] = { count: 0, icon: p.icon };
      counts[p.item].count++;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);
  }, [pulls]);

  // History filtered pulls
  const historyPulls = useMemo(() => {
    let filtered = pulls;
    if (historyBannerFilter !== 'all') {
      filtered = filtered.filter(p => p.banner === historyBannerFilter);
    }
    if (historyRarityFilter !== null) {
      filtered = filtered.filter(p => p.rarity === historyRarityFilter);
    }
    return filtered;
  }, [pulls, historyBannerFilter, historyRarityFilter]);

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

  const importHistoryJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.pulls && Array.isArray(data.pulls)) {
            const merged = [...data.pulls, ...pulls];
            // Deduplicate by id
            const seen = new Set<string>();
            const deduped = merged.filter(p => {
              if (seen.has(p.id)) return false;
              seen.add(p.id);
              return true;
            }).sort((a, b) => b.timestamp - a.timestamp);

            const newPity = data.pityCounters || pityCounters;
            setPulls(deduped);
            setPityCounters(newPity);
            saveData(deduped, newPity);
            alert(`Imported ${data.pulls.length} pulls successfully!`);
          }
        } catch {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const exportSummaryAsImage = async () => {
    if (!statsRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(statsRef.current, {
        backgroundColor: '#0d1b2a',
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
    } catch {
      setIsExporting(false);
    }
  };

  const shareStats = async () => {
    const stats = getStatsForBanner('all');
    const text = `My Endfield Headhunt Stats: ${stats.total} pulls, ${stats.sixStar} 6-star (${stats.sixStarRate}%), ${stats.fiveStar} 5-star (${stats.fiveStarRate}%) - Track yours at zerosanity.app/headhunt-tracker`;
    try {
      await navigator.clipboard.writeText(text);
      alert('Stats copied to clipboard!');
    } catch {
      alert('Failed to copy stats.');
    }
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'record', label: 'Record Pull', icon: <Plus size={16} /> },
    { id: 'history', label: 'My History', icon: <Clock size={16} /> },
    { id: 'stats', label: 'Statistics', icon: <BarChart3 size={16} /> },
  ];

  const allStats = getStatsForBanner('all');

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <RIOSHeader
            title="Headhunt Operations Log"
            category="RECRUITMENT"
            code="RIOS-HH-001"
            icon={<Target size={32} />}
          />
          {/* Sync status */}
          {user && (
            <div className="flex items-center gap-2 text-xs">
              {syncStatus === 'syncing' && <><Loader2 size={16} className="animate-spin text-[var(--color-accent)]" /><span className="text-[var(--color-text-muted)]">Syncing...</span></>}
              {syncStatus === 'synced' && <><Cloud size={16} className="text-green-400" /><span className="text-green-400">Synced</span></>}
              {syncStatus === 'error' && <><CloudOff size={16} className="text-red-400" /><span className="text-red-400">Sync failed</span></>}
              {syncStatus === 'idle' && <><Cloud size={16} className="text-[var(--color-text-muted)]" /><span className="text-[var(--color-text-muted)]">Cloud ready</span></>}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-[var(--color-border)]">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-[15px] font-bold transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-[var(--color-accent)] border-[var(--color-accent)]'
                  : 'text-[var(--color-text-muted)] border-transparent hover:text-white hover:border-[var(--color-border)]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          <div className="flex-1" />
          {/* Action buttons */}
          <div className="flex gap-2 pb-1">
            <button onClick={importHistoryJSON} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors" title="Import JSON">
              <Upload size={18} />
            </button>
            <button onClick={exportHistoryJSON} disabled={pulls.length === 0} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors disabled:opacity-30" title="Export JSON">
              <Download size={18} />
            </button>
            <button onClick={shareStats} disabled={pulls.length === 0} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors disabled:opacity-30" title="Share Stats">
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* ===== RECORD TAB ===== */}
        {activeTab === 'record' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              {/* Record Pull Form */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Record Pull</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-[var(--color-text-muted)] uppercase tracking-wider">Banner</label>
                    <div className="space-y-1">
                      {BANNERS.map(banner => (
                        <button
                          key={banner.id}
                          onClick={() => setSelectedBanner(banner.id)}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                            selectedBanner === banner.id
                              ? 'bg-[var(--color-accent)]/10 border-l-2 text-white'
                              : 'hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'
                          }`}
                          style={selectedBanner === banner.id ? { borderLeftColor: banner.color } : {}}
                        >
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: banner.color }} />
                          <span className="truncate">{banner.name}</span>
                          {banner.featured && <span className="text-[12px] text-[var(--color-text-muted)] ml-auto">{banner.featured}</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-[var(--color-text-muted)] uppercase tracking-wider">Rarity</label>
                    <div className="grid grid-cols-4 gap-2">
                      {RARITIES.map(rarity => (
                        <button
                          key={rarity}
                          onClick={() => setSelectedRarity(rarity)}
                          className={`py-2 clip-corner-tl font-bold transition-colors text-sm ${
                            selectedRarity === rarity
                              ? rarity === 6 ? 'bg-orange-500 text-white'
                              : rarity === 5 ? 'bg-purple-500 text-white'
                              : rarity === 4 ? 'bg-blue-500 text-white'
                              : 'bg-[var(--color-accent)] text-black'
                              : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-text-secondary)]'
                          }`}
                        >
                          {rarity}★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-[var(--color-text-muted)] uppercase tracking-wider">Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['character', 'weapon'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setSelectedType(t)}
                          className={`py-2 clip-corner-tl font-medium text-sm transition-colors capitalize ${
                            selectedType === t
                              ? 'bg-[var(--color-accent)] text-black'
                              : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-text-secondary)]'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-[var(--color-text-muted)] uppercase tracking-wider">Item Name</label>
                    <input
                      type="text"
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomPull()}
                      placeholder="Enter or select item..."
                      className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl focus:outline-none focus:border-[var(--color-accent)] text-white text-sm mb-2"
                      list="items-datalist"
                    />
                    <datalist id="items-datalist">
                      {getAvailableItems().map(item => (
                        <option key={item.id} value={item.Name} />
                      ))}
                    </datalist>
                    <button
                      onClick={addCustomPull}
                      disabled={!customItemName.trim()}
                      className="w-full py-3 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-[var(--color-accent)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Add Pull
                    </button>
                  </div>

                  {/* Quick add & Bulk add */}
                  <div className="border-t border-[var(--color-border)] pt-4">
                    <button
                      onClick={() => setShowBulkAdd(!showBulkAdd)}
                      className="w-full py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-accent)] transition-colors flex items-center justify-center gap-2"
                    >
                      <ChevronDown size={14} className={`transition-transform ${showBulkAdd ? 'rotate-180' : ''}`} />
                      Simulate Multi-Pull
                    </button>

                    {showBulkAdd && (
                      <div className="mt-3 p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                        <p className="text-xs text-[var(--color-text-tertiary)] mb-2">Simulate pulls with gacha rates (1.76% 6★, 13.15% 5★)</p>
                        <div className="flex gap-2">
                          {[1, 10, 50].map(n => (
                            <button
                              key={n}
                              onClick={() => setBulkCount(n)}
                              className={`flex-1 py-1.5 text-sm font-bold transition-colors ${
                                bulkCount === n ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)]'
                              }`}
                            >
                              {n}x
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={addBulkPulls}
                          className="w-full mt-2 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors"
                        >
                          Simulate {bulkCount} Pull{bulkCount > 1 ? 's' : ''}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pity Counter & Quick Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pity Counters */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6 shadow-[var(--shadow-card)]">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[var(--color-accent)]" />
                  Pity Counter
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {BANNERS.map(banner => {
                    const pity = pityCounters[banner.id] || 0;
                    const isSoftPity = pity >= 50;
                    return (
                      <div key={banner.id} className="bg-[var(--color-surface-2)] p-4 clip-corner-tl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: banner.color }} />
                            <span className="font-medium text-white text-sm">{banner.name}</span>
                          </div>
                          <span className={`text-2xl font-bold ${isSoftPity ? 'text-red-400' : 'text-[var(--color-accent)]'}`}>
                            {pity}
                          </span>
                        </div>
                        <div className="w-full bg-[var(--color-surface-2)] h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all ${isSoftPity ? 'bg-red-500' : ''}`}
                            style={{
                              width: `${Math.min((pity / 100) * 100, 100)}%`,
                              backgroundColor: isSoftPity ? undefined : banner.color,
                            }}
                          />
                        </div>
                        <p className="text-[12px] mt-1 text-[var(--color-text-muted)]">
                          {isSoftPity ? 'Soft pity active!' : `${100 - pity} to guarantee`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick stats */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6 shadow-[var(--shadow-card)]">
                <h2 className="text-lg font-bold text-white mb-4">Quick Stats (All Banners)</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[var(--color-surface-2)] p-3 clip-corner-tl text-center">
                    <p className="text-2xl font-bold text-white">{allStats.total}</p>
                    <p className="text-[12px] text-[var(--color-text-muted)] uppercase">Total Pulls</p>
                  </div>
                  <div className="bg-[var(--color-surface-2)] p-3 clip-corner-tl text-center">
                    <p className="text-2xl font-bold text-orange-400">{allStats.sixStar}</p>
                    <p className="text-[12px] text-[var(--color-text-muted)] uppercase">6★ Pulls</p>
                  </div>
                  <div className="bg-[var(--color-surface-2)] p-3 clip-corner-tl text-center">
                    <p className="text-2xl font-bold text-[var(--color-accent)]">{allStats.sixStarRate}%</p>
                    <p className="text-[12px] text-[var(--color-text-muted)] uppercase">6★ Rate</p>
                  </div>
                  <div className="bg-[var(--color-surface-2)] p-3 clip-corner-tl text-center">
                    <p className="text-2xl font-bold text-purple-400">{allStats.fiveStarRate}%</p>
                    <p className="text-[12px] text-[var(--color-text-muted)] uppercase">5★ Rate</p>
                  </div>
                </div>
              </div>

              {/* Recent 6-stars */}
              {pulls.filter(p => p.rarity === 6).length > 0 && (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6 shadow-[var(--shadow-card)]">
                  <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Trophy size={18} className="text-orange-400" />
                    Recent 6★ Pulls
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {pulls.filter(p => p.rarity === 6).slice(0, 8).map(pull => (
                      <div key={pull.id} className="flex items-center gap-2 bg-orange-900/20 border border-orange-500/30 px-3 py-1.5 clip-corner-tl">
                        {pull.icon && (
                          <Image src={pull.icon} alt={pull.item} width={24} height={24} className="w-6 h-6 object-contain" unoptimized />
                        )}
                        <span className="text-sm text-orange-300 font-medium">{pull.item}</span>
                        <span className="text-[12px] text-[var(--color-text-muted)]">{getBannerName(pull.banner)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== HISTORY TAB ===== */}
        {activeTab === 'history' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button
                onClick={() => setHistoryBannerFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold clip-corner-tl transition-colors ${
                  historyBannerFilter === 'all' ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-white'
                }`}
              >
                All Banners
              </button>
              {BANNERS.map(banner => (
                <button
                  key={banner.id}
                  onClick={() => setHistoryBannerFilter(banner.id)}
                  className={`px-3 py-1.5 text-xs font-bold clip-corner-tl transition-colors flex items-center gap-1.5 ${
                    historyBannerFilter === banner.id ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: banner.color }} />
                  {banner.name}
                </button>
              ))}

              <div className="w-px h-6 bg-[var(--color-border)]" />

              <button
                onClick={() => setHistoryRarityFilter(historyRarityFilter === 6 ? null : 6)}
                className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                  historyRarityFilter === 6 ? 'bg-orange-500 text-white' : 'bg-[var(--color-surface)] text-orange-400 hover:bg-orange-500/10'
                }`}
              >
                6★ Only
              </button>
              <button
                onClick={() => setHistoryRarityFilter(historyRarityFilter === 5 ? null : 5)}
                className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                  historyRarityFilter === 5 ? 'bg-purple-500 text-white' : 'bg-[var(--color-surface)] text-purple-400 hover:bg-purple-500/10'
                }`}
              >
                5★ Only
              </button>

              <div className="flex-1" />
              <span className="text-sm text-[var(--color-text-muted)]">{historyPulls.length} pulls</span>
              {pulls.length > 0 && (
                <button onClick={clearAllPulls} className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                  Clear All
                </button>
              )}
            </div>

            {/* Pull list */}
            {historyPulls.length > 0 ? (
              <div className="space-y-1 max-h-[800px] overflow-y-auto">
                {historyPulls.map((pull, index) => (
                  <div
                    key={pull.id}
                    className={`flex items-center justify-between p-3 clip-corner-tl transition-colors ${
                      pull.rarity === 6
                        ? 'bg-orange-900/15 border border-orange-500/30 hover:border-orange-500/50'
                        : pull.rarity === 5
                        ? 'bg-purple-900/15 border border-purple-500/30 hover:border-purple-500/50'
                        : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-[var(--color-text-muted)] w-8 text-right">#{historyPulls.length - index}</div>
                      {pull.icon ? (
                        <div className="w-10 h-10 flex items-center justify-center clip-corner-tl overflow-hidden flex-shrink-0" style={{
                          backgroundColor: pull.rarity === 6 ? 'rgba(249, 115, 22, 0.1)' :
                            pull.rarity === 5 ? 'rgba(168, 85, 247, 0.1)' :
                            'rgba(59, 130, 246, 0.1)'
                        }}>
                          <Image src={pull.icon} alt={pull.item} width={40} height={40} className="w-full h-full object-contain" unoptimized />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-[var(--color-surface-2)] flex items-center justify-center text-sm text-[var(--color-text-muted)]">
                          {pull.rarity}★
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${
                            pull.rarity === 6 ? 'text-orange-400' :
                            pull.rarity === 5 ? 'text-purple-400' :
                            pull.rarity === 4 ? 'text-blue-400' : 'text-[var(--color-text-secondary)]'
                          }`}>
                            {pull.item}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-[var(--color-border)] clip-corner-tl">{pull.rarity}★</span>
                          {pull.type && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-[var(--color-surface-2)] clip-corner-tl capitalize">{pull.type}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-muted)] mt-0.5">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getBannerColor(pull.banner) }} />
                            {getBannerName(pull.banner)}
                          </span>
                          <span>{new Date(pull.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {showDeleteConfirm === pull.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => deletePull(pull.id)} className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold">Delete</button>
                        <button onClick={() => setShowDeleteConfirm(null)} className="p-1 text-[var(--color-text-tertiary)]"><X size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => setShowDeleteConfirm(pull.id)} className="text-[var(--color-text-tertiary)] hover:text-red-400 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-[var(--color-text-muted)]">
                <Target size={48} className="mx-auto mb-4 opacity-30" />
                <p>No pull history yet</p>
                <p className="text-sm mt-1">Record your pulls in the Record tab to see them here</p>
              </div>
            )}
          </div>
        )}

        {/* ===== STATS TAB ===== */}
        {activeTab === 'stats' && (
          <div ref={statsRef} className="space-y-6">
            {/* Banner selector for stats */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setHistoryBannerFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold clip-corner-tl transition-colors ${
                  historyBannerFilter === 'all' ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-white'
                }`}
              >
                All Banners
              </button>
              {BANNERS.map(banner => (
                <button
                  key={banner.id}
                  onClick={() => setHistoryBannerFilter(banner.id)}
                  className={`px-3 py-1.5 text-xs font-bold clip-corner-tl transition-colors flex items-center gap-1.5 ${
                    historyBannerFilter === banner.id ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: banner.color }} />
                  {banner.name}
                </button>
              ))}

              <div className="flex-1" />
              <button
                onClick={exportSummaryAsImage}
                disabled={isExporting || pulls.length === 0}
                className="px-3 py-1.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] transition-colors flex items-center gap-1.5 disabled:opacity-30"
              >
                <Download size={12} />
                {isExporting ? 'Exporting...' : 'Export Image'}
              </button>
            </div>

            {(() => {
              const stats = getStatsForBanner(historyBannerFilter);
              return (
                <>
                  {/* Main stats cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5 text-center shadow-[var(--shadow-card)]">
                      <p className="text-3xl font-bold text-white">{stats.total}</p>
                      <p className="text-sm text-[var(--color-text-muted)] uppercase mt-1">Total Pulls</p>
                    </div>
                    <div className="bg-[var(--color-surface)] border border-orange-500/30 clip-corner-tl p-5 text-center shadow-[var(--shadow-card)]">
                      <p className="text-3xl font-bold text-orange-400">{stats.sixStarRate}%</p>
                      <p className="text-sm text-[var(--color-text-muted)] uppercase mt-1">6★ Rate ({stats.sixStar})</p>
                    </div>
                    <div className="bg-[var(--color-surface)] border border-purple-500/30 clip-corner-tl p-5 text-center shadow-[var(--shadow-card)]">
                      <p className="text-3xl font-bold text-purple-400">{stats.fiveStarRate}%</p>
                      <p className="text-sm text-[var(--color-text-muted)] uppercase mt-1">5★ Rate ({stats.fiveStar})</p>
                    </div>
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5 text-center shadow-[var(--shadow-card)]">
                      <p className="text-3xl font-bold text-[var(--color-accent)]">{stats.avgPity || '--'}</p>
                      <p className="text-sm text-[var(--color-text-muted)] uppercase mt-1">Avg Pulls/6★</p>
                    </div>
                  </div>

                  {/* Rarity distribution bar */}
                  {stats.total > 0 && (
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
                      <h3 className="text-sm font-bold text-white mb-4">Rarity Distribution</h3>
                      <div className="flex h-8 w-full overflow-hidden clip-corner-tl">
                        {stats.sixStar > 0 && (
                          <div className="bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${(stats.sixStar / stats.total) * 100}%`, minWidth: stats.sixStar > 0 ? '30px' : 0 }}>
                            {stats.sixStar > 0 && `${stats.sixStarRate}%`}
                          </div>
                        )}
                        {stats.fiveStar > 0 && (
                          <div className="bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${(stats.fiveStar / stats.total) * 100}%`, minWidth: stats.fiveStar > 0 ? '30px' : 0 }}>
                            {stats.fiveStar > 0 && `${stats.fiveStarRate}%`}
                          </div>
                        )}
                        {stats.fourStar > 0 && (
                          <div className="bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${(stats.fourStar / stats.total) * 100}%`, minWidth: stats.fourStar > 0 ? '30px' : 0 }}>
                            {stats.fourStar > 0 && `${stats.fourStarRate}%`}
                          </div>
                        )}
                        {stats.threeStar > 0 && (
                          <div className="bg-gray-600 flex items-center justify-center text-[10px] font-bold text-white flex-1">
                            {((stats.threeStar / stats.total) * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-[10px] text-[var(--color-text-tertiary)]">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-500" /> 6★ ({stats.sixStar})</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-purple-500" /> 5★ ({stats.fiveStar})</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500" /> 4★ ({stats.fourStar})</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-600" /> 3★ ({stats.threeStar})</span>
                      </div>
                    </div>
                  )}

                  {/* Most Pulled 6-Stars */}
                  {mostPulled6Stars.length > 0 && (
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
                      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <Trophy size={16} className="text-orange-400" />
                        Most Pulled 6★
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {mostPulled6Stars.map(([name, data]) => (
                          <div key={name} className="bg-[var(--color-surface-2)] border border-orange-500/20 p-3 clip-corner-tl text-center">
                            {data.icon ? (
                              <div className="w-14 h-14 mx-auto mb-2 overflow-hidden">
                                <Image src={data.icon} alt={name} width={56} height={56} className="w-full h-full object-contain" unoptimized />
                              </div>
                            ) : (
                              <div className="w-14 h-14 mx-auto mb-2 bg-orange-500/10 flex items-center justify-center text-xs text-orange-400">{name[0]}</div>
                            )}
                            <p className="text-xs text-orange-300 font-bold truncate">{name}</p>
                            <p className="text-lg font-bold text-white">x{data.count}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Per-banner breakdown */}
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
                    <h3 className="text-sm font-bold text-white mb-4">Per-Banner Breakdown</h3>
                    <div className="space-y-2">
                      {BANNERS.map(banner => {
                        const bStats = getStatsForBanner(banner.id);
                        if (bStats.total === 0) return null;
                        return (
                          <div key={banner.id} className="flex items-center gap-3 bg-[var(--color-surface-2)] p-3 clip-corner-tl">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: banner.color }} />
                            <span className="text-sm text-white font-medium flex-1 min-w-0 truncate">{banner.name}</span>
                            <span className="text-xs text-[var(--color-text-tertiary)]">{bStats.total} pulls</span>
                            <span className="text-xs text-orange-400 font-bold">{bStats.sixStar} 6★</span>
                            <span className="text-xs text-purple-400">{bStats.fiveStar} 5★</span>
                            <span className="text-xs text-[var(--color-accent)]">{bStats.sixStarRate}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {stats.total === 0 && (
                    <div className="text-center py-16 text-[var(--color-text-muted)]">
                      <BarChart3 size={48} className="mx-auto mb-4 opacity-30" />
                      <p>No data to display</p>
                      <p className="text-sm mt-1">Record some pulls first to see your statistics</p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
