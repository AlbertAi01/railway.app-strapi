'use client';

import { useState, useEffect } from 'react';
import { Target, Plus, Trash2, TrendingUp } from 'lucide-react';

interface Pull {
  id: string;
  timestamp: number;
  rarity: number;
  item: string;
  banner: string;
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

  const addPull = (rarity: number, item: string) => {
    const newPull: Pull = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      rarity,
      item,
      banner: selectedBanner
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

  const stats = getStats();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-400 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#FFE500] mb-8 flex items-center gap-3">
          <Target className="w-10 h-10" />
          Headhunt Tracker
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add Pull & Stats */}
          <div className="space-y-6">
            <div className="bg-[#111] border border-[#222] rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Record Pull</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-white">Banner</label>
                  <select
                    value={selectedBanner}
                    onChange={(e) => setSelectedBanner(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] rounded-lg focus:outline-none focus:border-[#FFE500] text-white"
                  >
                    {BANNERS.map(banner => (
                      <option key={banner} value={banner}>{banner}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-white">Quick Add</label>
                  <div className="grid grid-cols-2 gap-2">
                    {RARITIES.map(rarity => (
                      <button
                        key={rarity}
                        onClick={() => addPull(rarity, `${rarity}★ Item`)}
                        className={`py-3 rounded-lg font-bold transition-colors ${
                          rarity === 6
                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                            : rarity === 5
                            ? 'bg-purple-500 hover:bg-purple-600 text-white'
                            : 'bg-[#0a0a0a] border border-[#222] hover:border-[#FFE500]'
                        }`}
                      >
                        {rarity}★
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#111] border border-[#222] rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#FFE500]" />
                Pity Counter
              </h2>

              <div className="space-y-3">
                {BANNERS.map(banner => (
                  <div key={banner} className="bg-[#0a0a0a] p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{banner}</span>
                      <span className={`text-2xl font-bold ${
                        pityCounters[banner] >= 50 ? 'text-red-400' : 'text-[#FFE500]'
                      }`}>
                        {pityCounters[banner]}
                      </span>
                    </div>
                    <div className="w-full bg-[#222] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          pityCounters[banner] >= 50 ? 'bg-red-500' : 'bg-[#FFE500]'
                        }`}
                        style={{ width: `${Math.min((pityCounters[banner] / 100) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs mt-1 text-gray-500">
                      {pityCounters[banner] >= 50 ? 'Soft pity active!' : `${100 - pityCounters[banner]} pulls to guarantee`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111] border border-[#222] rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Statistics ({selectedBanner})</h2>

              <div className="space-y-3">
                <div className="bg-[#0a0a0a] p-3 rounded-lg flex items-center justify-between">
                  <span>Total Pulls</span>
                  <span className="text-white font-bold">{stats.total}</span>
                </div>
                <div className="bg-[#0a0a0a] p-3 rounded-lg flex items-center justify-between">
                  <span>6★ Pulls</span>
                  <span className="text-orange-400 font-bold">{stats.sixStar}</span>
                </div>
                <div className="bg-[#0a0a0a] p-3 rounded-lg flex items-center justify-between">
                  <span>6★ Rate</span>
                  <span className="text-[#FFE500] font-bold">{stats.sixStarRate}%</span>
                </div>
                <div className="bg-[#0a0a0a] p-3 rounded-lg flex items-center justify-between">
                  <span>5★ Rate</span>
                  <span className="text-purple-400 font-bold">{stats.fiveStarRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pull History */}
          <div className="lg:col-span-2">
            <div className="bg-[#111] border border-[#222] rounded-lg p-6">
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
                          : 'bg-[#0a0a0a] border border-[#222]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">#{pulls.filter(p => p.banner === selectedBanner).length - index}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${
                              pull.rarity === 6 ? 'text-orange-400' :
                              pull.rarity === 5 ? 'text-purple-400' : 'text-white'
                            }`}>
                              {pull.item}
                            </span>
                            <span className="text-xs px-2 py-1 bg-[#222] rounded">
                              {pull.rarity}★
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
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
                <div className="text-center py-12 text-gray-500">
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
