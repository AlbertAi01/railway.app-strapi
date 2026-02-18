'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Dice6, RotateCcw, BarChart3, Search } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { CHARACTERS, WEAPONS } from '@/lib/data';
import { CHARACTER_ICONS, WEAPON_ICONS } from '@/lib/assets';

const RATES = { 6: 0.008, 5: 0.08, 4: 0.40, 3: 0.512 };
const PITY_SOFT = 50;
const PITY_INCREASE = 0.02;
const RARITY_COLORS: Record<number, string> = { 6: '#FF8C00', 5: '#9B59B6', 4: '#3498DB', 3: '#666' };
const RARITY_BG: Record<number, string> = {
  6: 'linear-gradient(180deg, #FF8C00 0%, #B8860B 50%, #4A2800 100%)',
  5: 'linear-gradient(180deg, #9B59B6 0%, #6B3FA0 50%, #2D1B4E 100%)',
  4: 'linear-gradient(180deg, #3498DB 0%, #2471A3 50%, #1B3A5C 100%)',
  3: 'linear-gradient(180deg, #555 0%, #333 50%, #111 100%)',
};

const RANK_TITLES = [
  { min: 0, max: 0, title: 'Novice Summoner', desc: 'Just getting started!' },
  { min: 1, max: 10, title: 'Curious Recruiter', desc: 'Dipping your toes...' },
  { min: 11, max: 50, title: 'Regular Recruiter', desc: 'Building your roster.' },
  { min: 51, max: 100, title: 'Dedicated Recruiter', desc: 'Commitment is key.' },
  { min: 101, max: 300, title: 'Veteran Summoner', desc: 'Seen some things.' },
  { min: 301, max: 500, title: 'Gacha Addict', desc: '"Just one more..."' },
  { min: 501, max: 999, title: 'Whale in Training', desc: 'The gacha calls...' },
  { min: 1000, max: Infinity, title: 'Certified Whale', desc: 'Swimming in summons.' },
];

interface Pull {
  rarity: number;
  item: string;
  icon?: string;
  type: 'character' | 'weapon' | 'material';
  isPity: boolean;
}

interface Collection {
  [key: string]: { count: number; rarity: number; type: string; icon?: string };
}

export default function SummonSimulatorPage() {
  const [currentPulls, setCurrentPulls] = useState<Pull[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [pityCounter, setPityCounter] = useState(0);
  const [totalPulls, setTotalPulls] = useState(0);
  const [stats, setStats] = useState({ 6: 0, 5: 0, 4: 0, 3: 0 });
  const [collection, setCollection] = useState<Collection>({});
  const [showStats, setShowStats] = useState(false);
  const [showRates, setShowRates] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('endfield-summon-state');
    if (saved) {
      const state = JSON.parse(saved);
      setPityCounter(state.pityCounter || 0);
      setTotalPulls(state.totalPulls || 0);
      setStats(state.stats || { 6: 0, 5: 0, 4: 0, 3: 0 });
      setCollection(state.collection || {});
    }
  }, []);

  const saveState = useCallback((newPity: number, newTotal: number, newStats: typeof stats, newCollection: Collection) => {
    localStorage.setItem('endfield-summon-state', JSON.stringify({
      pityCounter: newPity, totalPulls: newTotal, stats: newStats, collection: newCollection,
    }));
  }, []);

  const getRandomItem = (rarity: number): { name: string; icon?: string; type: 'character' | 'weapon' | 'material' } => {
    if (rarity >= 4) {
      const charChance = rarity === 6 ? 0.5 : rarity === 5 ? 0.6 : 0.7;
      const isCharacter = Math.random() < charChance;
      if (isCharacter) {
        const chars = CHARACTERS.filter(c => c.Rarity === rarity);
        if (chars.length > 0) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          return { name: char.Name, icon: CHARACTER_ICONS[char.Name], type: 'character' };
        }
      }
      const weapons = WEAPONS.filter(w => w.Rarity === rarity);
      if (weapons.length > 0) {
        const weapon = weapons[Math.floor(Math.random() * weapons.length)];
        return { name: weapon.Name, icon: WEAPON_ICONS[weapon.Name], type: 'weapon' };
      }
    }
    return { name: 'Material', icon: undefined, type: 'material' };
  };

  const calculateRarity = (counter: number): number => {
    let rate6 = RATES[6];
    if (counter >= PITY_SOFT) rate6 += (counter - PITY_SOFT + 1) * PITY_INCREASE;
    const roll = Math.random();
    if (roll < rate6) return 6;
    if (roll < rate6 + RATES[5]) return 5;
    if (roll < rate6 + RATES[5] + RATES[4]) return 4;
    return 3;
  };

  const performMultiPull = () => {
    const newPulls: Pull[] = [];
    const newStats = { ...stats };
    let counter = pityCounter;
    const newCollection = { ...collection };

    for (let i = 0; i < 10; i++) {
      const rarity = calculateRarity(counter);
      const isPity = counter >= PITY_SOFT && rarity === 6;
      const itemData = getRandomItem(rarity);

      newPulls.push({ rarity, item: itemData.name, isPity, icon: itemData.icon, type: itemData.type });
      newStats[rarity as keyof typeof newStats]++;

      if (itemData.type !== 'material') {
        if (!newCollection[itemData.name]) {
          newCollection[itemData.name] = { count: 0, rarity, type: itemData.type, icon: itemData.icon };
        }
        newCollection[itemData.name].count++;
      }

      counter = rarity === 6 ? 0 : counter + 1;
    }

    setCurrentPulls(newPulls);
    setRevealed(false);
    setTotalPulls(totalPulls + 10);
    setStats(newStats);
    setPityCounter(counter);
    setCollection(newCollection);
    saveState(counter, totalPulls + 10, newStats, newCollection);

    setTimeout(() => setRevealed(true), 300);
  };

  const reset = () => {
    if (confirm('Reset all summon data including collection?')) {
      setCurrentPulls([]);
      setRevealed(false);
      setPityCounter(0);
      setTotalPulls(0);
      setStats({ 6: 0, 5: 0, 4: 0, 3: 0 });
      setCollection({});
      localStorage.removeItem('endfield-summon-state');
    }
  };

  const getRank = () => RANK_TITLES.find(r => totalPulls >= r.min && totalPulls <= r.max) || RANK_TITLES[0];
  const rank = getRank();

  const collectionEntries = Object.entries(collection).sort((a, b) => b[1].rarity - a[1].rarity || a[0].localeCompare(b[0]));
  const uniqueChars = collectionEntries.filter(([, v]) => v.type === 'character').length;
  const uniqueWeapons = collectionEntries.filter(([, v]) => v.type === 'weapon').length;

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <RIOSHeader title="Summon/Headhunt Simulator" category="SIMULATION" code="RIOS-SIM-001" icon={<Dice6 size={28} />} />
          <div className="flex gap-2">
            <button onClick={() => setShowRates(!showRates)}
              className="px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-accent)] text-[var(--color-accent)] text-sm flex items-center gap-2 hover:bg-[var(--color-accent)]/10">
              <Search size={14} /> Summon Drop Rates
            </button>
            <button onClick={() => setShowStats(!showStats)}
              className="px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-accent)] text-[var(--color-accent)] text-sm flex items-center gap-2 hover:bg-[var(--color-accent)]/10">
              <BarChart3 size={14} /> Your Stats ({totalPulls})
            </button>
          </div>
        </div>

        <p className="text-sm text-[var(--color-text-tertiary)] mb-6">
          Feed your gacha addiction! Roll the dice and chase those elusive 6-star characters with realistic drop rates. &quot;Just one more 10-pull, I swear!&quot;
        </p>

        {/* Main Summon Button */}
        <div className="text-center mb-6">
          <button onClick={performMultiPull}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg transition-colors border-l-4 border-l-[var(--color-accent)]">
            Perform 10x Summon/Headhunt
          </button>
        </div>

        {/* 10-Pull Visual Display */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden mb-6">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-0.5 p-2 min-h-[180px]">
            {currentPulls.length > 0 ? currentPulls.map((pull, i) => (
              <div key={i} className="relative aspect-[3/4] overflow-hidden transition-all duration-500"
                style={{ background: revealed ? RARITY_BG[pull.rarity] : 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)' }}>
                {revealed && pull.icon ? (
                  <Image src={pull.icon} alt={pull.item} fill className="object-cover opacity-90" unoptimized sizes="100px" />
                ) : revealed ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-white/60 text-center px-1">{pull.item}</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-3/4 bg-black/40" style={{
                      clipPath: 'polygon(50% 5%, 65% 25%, 85% 30%, 70% 50%, 75% 75%, 50% 65%, 25% 75%, 30% 50%, 15% 30%, 35% 25%)',
                    }} />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: revealed ? RARITY_COLORS[pull.rarity] : '#333' }} />
                {pull.isPity && revealed && (
                  <div className="absolute top-0 right-0 bg-red-500 text-[7px] text-white px-1 font-bold">PITY</div>
                )}
              </div>
            )) : (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="relative aspect-[3/4] bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a]">
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <div className="w-3/4 h-3/4 bg-white/10" style={{
                      clipPath: 'polygon(50% 5%, 65% 25%, 85% 30%, 70% 50%, 75% 75%, 50% 65%, 25% 75%, 30% 50%, 15% 30%, 35% 25%)',
                    }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rank Title */}
        <div className="text-center mb-6">
          <p className="text-sm">
            <span className="text-[var(--color-accent)] font-bold">{rank.title}</span>
            <span className="text-[var(--color-text-tertiary)]"> - {rank.desc}</span>
          </p>
        </div>

        {/* Stats Panel */}
        {showStats && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Your Summon Stats</h3>
              <button onClick={reset} className="text-xs text-[var(--color-text-tertiary)] hover:text-red-400 flex items-center gap-1">
                <RotateCcw size={12} /> Reset All
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-[var(--color-surface-2)] p-3 text-center">
                <p className="text-2xl font-bold text-white">{totalPulls}</p>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">Total Pulls</p>
              </div>
              <div className="bg-[var(--color-surface-2)] p-3 text-center">
                <p className="text-2xl font-bold" style={{ color: RARITY_COLORS[6] }}>{stats[6]}</p>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">6-Star ({totalPulls > 0 ? ((stats[6] / totalPulls) * 100).toFixed(1) : 0}%)</p>
              </div>
              <div className="bg-[var(--color-surface-2)] p-3 text-center">
                <p className="text-2xl font-bold" style={{ color: RARITY_COLORS[5] }}>{stats[5]}</p>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">5-Star ({totalPulls > 0 ? ((stats[5] / totalPulls) * 100).toFixed(1) : 0}%)</p>
              </div>
              <div className="bg-[var(--color-surface-2)] p-3 text-center">
                <p className="text-2xl font-bold text-white">{pityCounter}</p>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">Current Pity ({pityCounter >= PITY_SOFT ? 'SOFT PITY!' : `${PITY_SOFT - pityCounter} to soft`})</p>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[var(--color-text-tertiary)]">Pity Progress</span>
                <span className={`font-bold ${pityCounter >= PITY_SOFT ? 'text-red-400' : 'text-[var(--color-accent)]'}`}>{pityCounter}/100</span>
              </div>
              <div className="w-full bg-[var(--color-border)] h-2">
                <div className={`h-full transition-all ${pityCounter >= PITY_SOFT ? 'bg-red-500' : 'bg-[var(--color-accent)]'}`}
                  style={{ width: `${Math.min(pityCounter, 100)}%` }} />
              </div>
            </div>
            {collectionEntries.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-white mb-3">Collection ({uniqueChars} Characters, {uniqueWeapons} Weapons)</h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[300px] overflow-y-auto">
                  {collectionEntries.map(([name, data]) => (
                    <div key={name} className="relative bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-hidden"
                      style={{ borderBottomColor: RARITY_COLORS[data.rarity], borderBottomWidth: '2px' }}>
                      <div className="aspect-square flex items-center justify-center p-1">
                        {data.icon ? (
                          <Image src={data.icon} alt={name} width={60} height={60} className="w-full h-full object-contain" unoptimized />
                        ) : (
                          <span className="text-[8px] text-center text-[var(--color-text-tertiary)]">{name}</span>
                        )}
                      </div>
                      <p className="text-[8px] text-white text-center truncate px-0.5">{name}</p>
                      {data.count > 1 && (
                        <span className="absolute top-0 right-0 bg-[var(--color-accent)] text-black text-[8px] font-bold px-1">x{data.count}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Drop Rates Panel */}
        {showRates && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Summon Drop Rates</h3>
            <div className="space-y-2">
              {[
                { rarity: 6, rate: '0.8%', desc: '6-Star Character/Weapon', note: 'Soft pity at 50 pulls (+2%/pull), guaranteed at 100' },
                { rarity: 5, rate: '8.0%', desc: '5-Star Character/Weapon', note: '' },
                { rarity: 4, rate: '40.0%', desc: '4-Star Character/Weapon', note: '' },
                { rarity: 3, rate: '51.2%', desc: '3-Star Material', note: '' },
              ].map(r => (
                <div key={r.rarity} className="flex items-center gap-4 p-3 bg-[var(--color-surface-2)]">
                  <div className="w-3 h-8" style={{ backgroundColor: RARITY_COLORS[r.rarity] }} />
                  <div className="flex-1">
                    <p className="text-sm text-white font-bold">{r.desc}</p>
                    {r.note && <p className="text-[10px] text-[var(--color-text-tertiary)]">{r.note}</p>}
                  </div>
                  <span className="text-lg font-bold font-mono" style={{ color: RARITY_COLORS[r.rarity] }}>{r.rate}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[var(--color-text-tertiary)] mt-3 italic">
              Rates are based on publicly available data and may not be 100% accurate to the live game.
            </p>
          </div>
        )}

        {/* Recent Pull Results */}
        {currentPulls.length > 0 && revealed && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4">
            <h3 className="text-sm font-bold text-white mb-3">Last 10-Pull Results</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {currentPulls.map((pull, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-[var(--color-surface-2)]"
                  style={{ borderLeft: `3px solid ${RARITY_COLORS[pull.rarity]}` }}>
                  {pull.icon ? (
                    <Image src={pull.icon} alt={pull.item} width={32} height={32} className="w-8 h-8 object-contain shrink-0" unoptimized />
                  ) : (
                    <div className="w-8 h-8 shrink-0 bg-[var(--color-border)] flex items-center justify-center text-[8px]">?</div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[10px] text-white font-bold truncate">{pull.item}</p>
                    <p className="text-[9px]" style={{ color: RARITY_COLORS[pull.rarity] }}>{pull.rarity}&#9733; {pull.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
