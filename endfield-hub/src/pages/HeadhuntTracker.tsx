import React, { useState, useEffect, useRef } from 'react';
import { Plus, TrendingUp, DollarSign, RotateCcw, Trash2, Cloud, CloudOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { saveUserData, loadUserData } from '@/lib/userSync';

interface Pull {
  id: string;
  timestamp: number;
  rarity: number;
  banner: string;
  pityCount: number;
}

interface BannerStats {
  totalPulls: number;
  sixStarCount: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  currentPity: number;
  currencySpent: number;
}

const BANNERS = [
  'Standard',
  'Limited Character',
  'Limited Weapon',
  'Special',
];

const PULL_COST = 600; // Currency per pull
const RARITY_COLORS = {
  6: '#FF4444',
  5: '#FF8844',
  4: '#9B59B6',
  3: '#4488FF',
};

export default function HeadhuntTracker() {
  const [pulls, setPulls] = useState<Pull[]>([]);
  const [selectedBanner, setSelectedBanner] = useState('Standard');
  const [currentPity, setCurrentPity] = useState(0);
  const [showAddPull, setShowAddPull] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const { user } = useAuthStore();
  const isAuthenticated = !!user;
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    (async () => {
      const saved = await loadUserData<{ pulls: Pull[]; currentPity: number }>('headhuntTracker', isAuthenticated);
      if (saved) {
        setPulls(saved.pulls || []);
        setCurrentPity(saved.currentPity || 0);
      }
    })();
  }, [isAuthenticated]);

  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      const data = { pulls, currentPity };
      if (isAuthenticated) setSyncStatus('syncing');
      try {
        await saveUserData('headhuntTracker', data, isAuthenticated);
        setSyncStatus(isAuthenticated ? 'synced' : 'idle');
      } catch {
        setSyncStatus('error');
      }
    }, 500);

    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [pulls, currentPity, isAuthenticated]);

  const addPull = (rarity: number, count: number = 1) => {
    const newPulls: Pull[] = [];
    let pity = currentPity;

    for (let i = 0; i < count; i++) {
      pity++;
      const actualRarity = rarity === 6 ? 6 : rarity; // For manual adds

      newPulls.push({
        id: `${Date.now()}-${i}`,
        timestamp: Date.now() + i,
        rarity: actualRarity,
        banner: selectedBanner,
        pityCount: pity,
      });

      if (actualRarity === 6) {
        pity = 0;
      }
    }

    setPulls((prev) => [...newPulls, ...prev]);
    setCurrentPity(pity);
    setShowAddPull(false);
  };

  const simulate10Pull = () => {
    const newPulls: Pull[] = [];
    let pity = currentPity;
    let guaranteed4Star = false;

    for (let i = 0; i < 10; i++) {
      pity++;
      let rarity: number;

      // Hard pity at 80
      if (pity >= 80) {
        rarity = 6;
      } else {
        // Calculate rates with soft pity
        let sixStarRate = 0.02;
        if (pity > 60) {
          sixStarRate += (pity - 60) * 0.03; // Increases 3% per pull after 60
        }

        const roll = Math.random();
        if (roll < sixStarRate) {
          rarity = 6;
        } else if (roll < sixStarRate + 0.08) {
          rarity = 5;
        } else if (roll < sixStarRate + 0.08 + 0.5) {
          rarity = 4;
        } else {
          rarity = 3;
        }
      }

      // Guarantee at least one 4-star in 10-pull
      if (i === 9 && !guaranteed4Star && rarity === 3) {
        const existingHighRarity = newPulls.some((p) => p.rarity >= 4);
        if (!existingHighRarity) {
          rarity = 4;
        }
      }

      if (rarity >= 4) {
        guaranteed4Star = true;
      }

      newPulls.push({
        id: `${Date.now()}-${i}`,
        timestamp: Date.now() + i,
        rarity,
        banner: selectedBanner,
        pityCount: pity,
      });

      if (rarity === 6) {
        pity = 0;
      }
    }

    setPulls((prev) => [...newPulls, ...prev]);
    setCurrentPity(pity);
  };

  const deletePull = (id: string) => {
    if (confirm('Delete this pull?')) {
      setPulls((prev) => prev.filter((p) => p.id !== id));
      recalculatePity();
    }
  };

  const recalculatePity = () => {
    let pity = 0;
    const sortedPulls = [...pulls].sort((a, b) => a.timestamp - b.timestamp);

    for (const pull of sortedPulls) {
      if (pull.rarity === 6) {
        pity = 0;
      } else {
        pity++;
      }
    }

    setCurrentPity(pity);
  };

  const resetTracker = async () => {
    if (confirm('Reset all pull data? This cannot be undone.')) {
      setPulls([]);
      setCurrentPity(0);
    }
  };

  const getStats = (): BannerStats => {
    const bannerPulls = pulls.filter((p) => p.banner === selectedBanner);
    return {
      totalPulls: bannerPulls.length,
      sixStarCount: bannerPulls.filter((p) => p.rarity === 6).length,
      fiveStarCount: bannerPulls.filter((p) => p.rarity === 5).length,
      fourStarCount: bannerPulls.filter((p) => p.rarity === 4).length,
      threeStarCount: bannerPulls.filter((p) => p.rarity === 3).length,
      currentPity: currentPity,
      currencySpent: bannerPulls.length * PULL_COST,
    };
  };

  const stats = getStats();
  const sixStarRate = stats.totalPulls > 0 ? (stats.sixStarCount / stats.totalPulls) * 100 : 0;
  const fiveStarRate = stats.totalPulls > 0 ? (stats.fiveStarCount / stats.totalPulls) * 100 : 0;

  const bannerPulls = pulls.filter((p) => p.banner === selectedBanner);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-yellow-400 mb-2">Headhunt Tracker</h1>
            {isAuthenticated && (
              <div className="flex items-center gap-2 text-sm">
                {syncStatus === 'syncing' && <><Cloud size={16} className="text-blue-400 animate-pulse" /> <span className="text-blue-400">Syncing...</span></>}
                {syncStatus === 'synced' && <><Cloud size={16} className="text-green-400" /> <span className="text-green-400">Cloud synced</span></>}
                {syncStatus === 'error' && <><CloudOff size={16} className="text-red-400" /> <span className="text-red-400">Sync failed</span></>}
              </div>
            )}
          </div>
          <p className="text-gray-400">Track your gacha pulls and pity count{isAuthenticated ? ' (synced to cloud)' : ''}</p>
        </div>

        {/* Banner Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-400 mb-2">Select Banner</label>
          <div className="flex flex-wrap gap-2">
            {BANNERS.map((banner) => (
              <button
                key={banner}
                onClick={() => setSelectedBanner(banner)}
                className={`px-4 py-2 rounded font-semibold transition-colors ${
                  selectedBanner === banner
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {banner}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Total Pulls</div>
            <div className="text-3xl font-bold text-white">{stats.totalPulls}</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Current Pity</div>
            <div className="text-3xl font-bold text-yellow-400">{currentPity} / 80</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all"
                style={{ width: `${(currentPity / 80) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">6-Star Rate</div>
            <div className="text-3xl font-bold" style={{ color: RARITY_COLORS[6] }}>
              {sixStarRate.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.sixStarCount} / {stats.totalPulls} pulls
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">5-Star Rate</div>
            <div className="text-3xl font-bold" style={{ color: RARITY_COLORS[5] }}>
              {fiveStarRate.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.fiveStarCount} / {stats.totalPulls} pulls
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <DollarSign size={16} />
              Currency Spent
            </div>
            <div className="text-3xl font-bold text-white">{stats.currencySpent.toLocaleString()}</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">4-Star</div>
            <div className="text-3xl font-bold" style={{ color: RARITY_COLORS[4] }}>
              {stats.fourStarCount}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">3-Star</div>
            <div className="text-3xl font-bold" style={{ color: RARITY_COLORS[3] }}>
              {stats.threeStarCount}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setShowAddPull(!showAddPull)}
            className="flex items-center gap-2 bg-yellow-500 text-gray-900 px-4 py-2 rounded font-semibold hover:bg-yellow-400 transition-colors"
          >
            <Plus size={18} />
            Add Pull
          </button>
          <button
            onClick={simulate10Pull}
            className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded font-semibold hover:bg-blue-500 transition-colors"
          >
            <TrendingUp size={18} />
            Simulate 10-Pull
          </button>
          <button
            onClick={resetTracker}
            className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded font-semibold hover:bg-red-500 transition-colors ml-auto"
          >
            <RotateCcw size={18} />
            Reset
          </button>
        </div>

        {/* Add Pull Form */}
        {showAddPull && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-yellow-400 mb-4">Add Pull</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => addPull(6)}
                className="py-3 rounded font-semibold bg-gray-700 hover:bg-gray-600 transition-colors"
                style={{ borderLeft: `4px solid ${RARITY_COLORS[6]}` }}
              >
                6-Star
              </button>
              <button
                onClick={() => addPull(5)}
                className="py-3 rounded font-semibold bg-gray-700 hover:bg-gray-600 transition-colors"
                style={{ borderLeft: `4px solid ${RARITY_COLORS[5]}` }}
              >
                5-Star
              </button>
              <button
                onClick={() => addPull(4)}
                className="py-3 rounded font-semibold bg-gray-700 hover:bg-gray-600 transition-colors"
                style={{ borderLeft: `4px solid ${RARITY_COLORS[4]}` }}
              >
                4-Star
              </button>
              <button
                onClick={() => addPull(3)}
                className="py-3 rounded font-semibold bg-gray-700 hover:bg-gray-600 transition-colors"
                style={{ borderLeft: `4px solid ${RARITY_COLORS[3]}` }}
              >
                3-Star
              </button>
            </div>
          </div>
        )}

        {/* Pull Timeline */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">Pull History</h2>

          {bannerPulls.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No pulls recorded for this banner yet
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {bannerPulls.map((pull) => (
                <div
                  key={pull.id}
                  className="flex items-center justify-between bg-gray-700 rounded p-3 hover:bg-gray-600 transition-colors"
                  style={{ borderLeft: `4px solid ${RARITY_COLORS[pull.rarity as keyof typeof RARITY_COLORS]}` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="text-2xl font-bold"
                      style={{ color: RARITY_COLORS[pull.rarity as keyof typeof RARITY_COLORS] }}
                    >
                      {pull.rarity}★
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{pull.banner}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(pull.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-400">
                      Pity: <span className="text-yellow-400 font-semibold">{pull.pityCount}</span>
                    </div>
                    <button
                      onClick={() => deletePull(pull.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete pull"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h3 className="font-bold text-yellow-400 mb-2">Pity System</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Base 6-star rate: 2%</li>
            <li>• Soft pity starts at 60 pulls (rate increases by 3% per pull)</li>
            <li>• Hard pity at 80 pulls (guaranteed 6-star)</li>
            <li>• Pull cost: {PULL_COST} currency per pull</li>
            <li>• Use "Simulate 10-Pull" to test gacha rates</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
