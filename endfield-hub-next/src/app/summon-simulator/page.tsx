'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Dice6, RotateCcw, BarChart3, Info, History, Star, X } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { CHARACTERS, WEAPONS } from '@/lib/data';
import { CHARACTER_ICONS, WEAPON_ICONS, CHARACTER_GACHA } from '@/lib/assets';

// ─── Constants ───────────────────────────────────────────────────────
// Operator and weapon banners have SEPARATE rate tables in Endfield
// Operator banner: 1.76% 6-star (0.8% featured + 0.96% off-banner)
// Weapon banner: higher rates since weapons are less impactful
const OPERATOR_RATES = { 6: 0.0176, 5: 0.1315, 4: 0.40, 3: 0.4509 };
const WEAPON_RATES = { 6: 0.028, 5: 0.18, 4: 0.40, 3: 0.392 };
const PITY_SOFT_OPERATOR = 50;
const PITY_HARD_OPERATOR = 120;
const PITY_SOFT_WEAPON = 40;
const PITY_HARD_WEAPON = 80;
const PITY_INCREASE = 0.02;

const RARITY_COLORS: Record<number, string> = {
  6: '#FF8C00', 5: '#9B59B6', 4: '#3498DB', 3: '#555',
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

// ─── Types ───────────────────────────────────────────────────────────
interface Pull {
  rarity: number;
  item: string;
  icon?: string;
  type: 'character' | 'weapon';
  isPity: boolean;
  isNew: boolean;
  isRateUp: boolean;
  pullNumber: number;
}

interface HistoryEntry {
  pulls: Pull[];
  timestamp: number;
  banner: BannerType;
}

type BannerType = 'operator' | 'weapon';

interface BannerState {
  pityCounter: number;
  guaranteedRateUp: boolean;
  totalPulls: number;
  stats: Record<number, number>;
  sixStarHistory: { item: string; pullNumber: number }[];
}

interface SimState {
  operator: BannerState;
  weapon: BannerState;
  collection: Record<string, { count: number; rarity: number; type: string; icon?: string }>;
  history: HistoryEntry[];
}

const DEFAULT_BANNER_STATE: BannerState = {
  pityCounter: 0,
  guaranteedRateUp: false,
  totalPulls: 0,
  stats: { 6: 0, 5: 0, 4: 0, 3: 0 },
  sixStarHistory: [],
};

const DEFAULT_STATE: SimState = {
  operator: { ...DEFAULT_BANNER_STATE },
  weapon: { ...DEFAULT_BANNER_STATE },
  collection: {},
  history: [],
};

// ─── Component ───────────────────────────────────────────────────────
export default function SummonSimulatorPage() {
  const [state, setState] = useState<SimState>(DEFAULT_STATE);
  const [bannerType, setBannerType] = useState<BannerType>('operator');
  const [currentPulls, setCurrentPulls] = useState<Pull[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showRates, setShowRates] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const revealTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('zerosanity-summon-v4');
    if (saved) {
      try { setState(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const saveState = useCallback((s: SimState) => {
    localStorage.setItem('zerosanity-summon-v4', JSON.stringify(s));
  }, []);

  // ─── Pull Logic ──────────────────────────────────────────────────
  const calculateRarity = useCallback((counter: number, banner: BannerType): number => {
    const rates = banner === 'operator' ? OPERATOR_RATES : WEAPON_RATES;
    const softPity = banner === 'operator' ? PITY_SOFT_OPERATOR : PITY_SOFT_WEAPON;
    const hardPity = banner === 'operator' ? PITY_HARD_OPERATOR : PITY_HARD_WEAPON;
    if (counter >= hardPity - 1) return 6;
    let rate6 = rates[6];
    if (counter >= softPity) rate6 += (counter - softPity + 1) * PITY_INCREASE;
    const roll = Math.random();
    if (roll < rate6) return 6;
    if (roll < rate6 + rates[5]) return 5;
    if (roll < rate6 + rates[5] + rates[4]) return 4;
    return 3;
  }, []);

  const getItemForRarity = useCallback((rarity: number, guaranteed: boolean, banner: BannerType): {
    name: string; icon?: string; type: 'character' | 'weapon'; isRateUp: boolean;
  } => {
    if (banner === 'operator') {
      // OPERATOR BANNER - only characters/operators

      // 6-star featured rate-up (50/50)
      if (rarity === 6) {
        const featured6 = ['Ardelia', 'Laevatain'];
        const isRateUp = guaranteed || Math.random() < 0.5;
        if (isRateUp) {
          const name = featured6[Math.floor(Math.random() * featured6.length)];
          return { name, icon: CHARACTER_ICONS[name], type: 'character', isRateUp: true };
        }
      }

      // 5-star featured rate-up
      if (rarity === 5 && Math.random() < 0.5) {
        const featured5 = ['Alesh', 'Chen Qianyu', 'Perlica', 'Avywenna', 'Da Pan', 'Snowshine'];
        const name = featured5[Math.floor(Math.random() * featured5.length)];
        return { name, icon: CHARACTER_ICONS[name], type: 'character', isRateUp: true };
      }

      // Non-featured operators
      const chars = CHARACTERS.filter(c => c.Rarity === rarity);
      if (chars.length > 0) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        return { name: char.Name, icon: CHARACTER_ICONS[char.Name], type: 'character', isRateUp: false };
      }

      // Fallback to any character
      const fallbackChar = CHARACTERS[0];
      return { name: fallbackChar.Name, icon: CHARACTER_ICONS[fallbackChar.Name], type: 'character', isRateUp: false };

    } else {
      // WEAPON BANNER - only weapons

      // 6-star featured weapons (50/50)
      if (rarity === 6) {
        const featured6Weapons = WEAPONS.filter(w => w.Rarity === 6).slice(0, 2); // Use first 2 as featured
        const isRateUp = guaranteed || Math.random() < 0.5;
        if (isRateUp && featured6Weapons.length > 0) {
          const weapon = featured6Weapons[Math.floor(Math.random() * featured6Weapons.length)];
          return { name: weapon.Name, icon: WEAPON_ICONS[weapon.Name], type: 'weapon', isRateUp: true };
        }
      }

      // 5-star featured weapons
      if (rarity === 5 && Math.random() < 0.5) {
        const featured5Weapons = WEAPONS.filter(w => w.Rarity === 5).slice(0, 6); // Use first 6 as featured
        if (featured5Weapons.length > 0) {
          const weapon = featured5Weapons[Math.floor(Math.random() * featured5Weapons.length)];
          return { name: weapon.Name, icon: WEAPON_ICONS[weapon.Name], type: 'weapon', isRateUp: true };
        }
      }

      // Non-featured weapons
      const weapons = WEAPONS.filter(w => w.Rarity === rarity);
      if (weapons.length > 0) {
        const weapon = weapons[Math.floor(Math.random() * weapons.length)];
        return { name: weapon.Name, icon: WEAPON_ICONS[weapon.Name], type: 'weapon', isRateUp: false };
      }

      // Fallback to any weapon
      const fallback = WEAPONS[0];
      return { name: fallback.Name, icon: WEAPON_ICONS[fallback.Name], type: 'weapon', isRateUp: false };
    }
  }, []);

  const performPull = useCallback((count: 10 | 1) => {
    setIsPulling(true);
    const pulls: Pull[] = [];
    const currentBanner = state[bannerType];
    let counter = currentBanner.pityCounter;
    let guaranteed = currentBanner.guaranteedRateUp;
    const newStats = { ...currentBanner.stats };
    const newCollection = { ...state.collection };
    const newSixHistory = [...currentBanner.sixStarHistory];
    const total = currentBanner.totalPulls;

    const softPity = bannerType === 'operator' ? PITY_SOFT_OPERATOR : PITY_SOFT_WEAPON;

    for (let i = 0; i < count; i++) {
      const rarity = calculateRarity(counter, bannerType);
      const isPity = counter >= softPity && rarity === 6;
      const item = getItemForRarity(rarity, guaranteed, bannerType);
      const pullNumber = total + i + 1;
      const isNew = !newCollection[item.name];

      pulls.push({
        rarity, item: item.name, isPity, icon: item.icon,
        type: item.type, isNew, isRateUp: item.isRateUp, pullNumber,
      });

      newStats[rarity] = (newStats[rarity] || 0) + 1;
      if (!newCollection[item.name]) {
        newCollection[item.name] = { count: 0, rarity, type: item.type, icon: item.icon };
      }
      newCollection[item.name].count++;

      if (rarity === 6) {
        newSixHistory.push({ item: item.name, pullNumber: counter + 1 });
        guaranteed = !item.isRateUp;
        counter = 0;
      } else {
        counter++;
      }
    }

    const newEntry: HistoryEntry = { pulls, timestamp: Date.now(), banner: bannerType };
    const newState: SimState = {
      ...state,
      [bannerType]: {
        pityCounter: counter,
        guaranteedRateUp: guaranteed,
        totalPulls: total + count,
        stats: newStats,
        sixStarHistory: newSixHistory,
      },
      collection: newCollection,
      history: [newEntry, ...state.history].slice(0, 50),
    };

    setState(newState);
    saveState(newState);

    // Reveal animation
    setCurrentPulls(pulls);
    setRevealedCount(0);
    setIsRevealing(true);

    if (count === 1) {
      setRevealedCount(1);
      setIsRevealing(false);
      setIsPulling(false);
    } else {
      let idx = 0;
      const revealNext = () => {
        idx++;
        setRevealedCount(idx);
        if (idx < count) {
          const delay = pulls[idx]?.rarity >= 6 ? 350 : pulls[idx]?.rarity >= 5 ? 250 : 120;
          revealTimerRef.current = setTimeout(revealNext, delay);
        } else {
          setIsRevealing(false);
          setIsPulling(false);
        }
      };
      revealTimerRef.current = setTimeout(revealNext, 150);
    }
  }, [state, bannerType, calculateRarity, getItemForRarity, saveState]);

  const skipReveal = useCallback(() => {
    if (isRevealing) {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      setRevealedCount(currentPulls.length);
      setIsRevealing(false);
      setIsPulling(false);
    }
  }, [isRevealing, currentPulls.length]);

  const reset = useCallback(() => {
    if (confirm('Reset ALL summon data and collection?')) {
      setCurrentPulls([]);
      setRevealedCount(0);
      setState(DEFAULT_STATE);
      localStorage.removeItem('zerosanity-summon-v4');
    }
  }, []);

  // ─── Derived ──────────────────────────────────────────────────────
  const currentBanner = state[bannerType];
  const totalPulls = state.operator.totalPulls + state.weapon.totalPulls;

  const rank = useMemo(() =>
    RANK_TITLES.find(r => totalPulls >= r.min && totalPulls <= r.max) || RANK_TITLES[0],
    [totalPulls]
  );

  const currentRate = useMemo(() => {
    const rates = bannerType === 'operator' ? OPERATOR_RATES : WEAPON_RATES;
    const soft = bannerType === 'operator' ? PITY_SOFT_OPERATOR : PITY_SOFT_WEAPON;
    let rate = rates[6];
    if (currentBanner.pityCounter >= soft) rate += (currentBanner.pityCounter - soft + 1) * PITY_INCREASE;
    return Math.min(rate * 100, 100);
  }, [currentBanner.pityCounter, bannerType]);

  const poolByRarity = useMemo(() => {
    const pool: Record<number, { name: string; icon?: string; type: string }[]> = { 6: [], 5: [], 4: [], 3: [] };
    if (bannerType === 'operator') {
      CHARACTERS.forEach(c => {
        if (pool[c.Rarity]) pool[c.Rarity].push({ name: c.Name, icon: CHARACTER_ICONS[c.Name], type: 'character' });
      });
    } else {
      WEAPONS.forEach(w => {
        if (pool[w.Rarity]) pool[w.Rarity].push({ name: w.Name, icon: WEAPON_ICONS[w.Name], type: 'weapon' });
      });
    }
    return pool;
  }, [bannerType]);

  // ─── Render ──────────────────────────────────────────────────────
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Summon Simulator - Zero Sanity',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    url: 'https://www.zerosanity.app/summon-simulator',
    description: 'Simulate headhunt operations with verified rates for Arknights: Endfield',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <div className="max-w-5xl mx-auto">
        <RIOSHeader title="Summon/Headhunt Simulator" category="SIMULATION" code="RIOS-SIM-001" icon={<Dice6 size={28} />} />

        {/* Header row with description and action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
          <p className="text-sm text-[var(--color-text-tertiary)] max-w-xl">
            Feed your gacha addiction! Roll the dice and chase those elusive 6-star characters
            with realistic drop rates. &ldquo;Just one more 10-pull, I swear!&rdquo;
          </p>
          <div className="flex flex-col gap-2 shrink-0">
            <button onClick={() => setShowRates(true)}
              className="px-4 py-2 text-sm bg-[var(--color-surface)] border-l-4 border-l-[var(--color-accent)] border border-[var(--color-border)] text-white hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2">
              <Info size={14} /> Summon Drop Rates
            </button>
            <button onClick={() => setShowStats(true)}
              className="px-4 py-2 text-sm bg-[var(--color-surface)] border-l-4 border-l-[var(--color-accent)] border border-[var(--color-border)] text-white hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2">
              <BarChart3 size={14} /> Your Stats
            </button>
          </div>
        </div>

        {/* ════ BANNER SELECTOR ════ */}
        <div className="mb-6 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl">
          <div className="p-4 border-b border-[var(--color-border)]">
            <h3 className="text-sm font-bold text-white mb-2">Banner Type</h3>
            <p className="text-[10px] text-[var(--color-text-tertiary)] mb-3">
              Select which banner to pull from. Each banner has its own separate pity counter.
            </p>
          </div>
          <div className="flex">
            <button
              onClick={() => setBannerType('operator')}
              disabled={isPulling}
              className={`flex-1 px-6 py-4 text-sm font-bold border-r border-[var(--color-border)] transition-all disabled:opacity-50 ${
                bannerType === 'operator'
                  ? 'bg-[var(--color-accent)] text-black border-b-4 border-b-[var(--color-originium)]'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-white'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span>Operator Banner</span>
                <span className="text-[9px] opacity-70">Characters Only</span>
              </div>
            </button>
            <button
              onClick={() => setBannerType('weapon')}
              disabled={isPulling}
              className={`flex-1 px-6 py-4 text-sm font-bold transition-all disabled:opacity-50 ${
                bannerType === 'weapon'
                  ? 'bg-[var(--color-accent)] text-black border-b-4 border-b-[var(--color-originium)]'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-white'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span>Weapon Banner</span>
                <span className="text-[9px] opacity-70">Weapons Only</span>
              </div>
            </button>
          </div>
        </div>

        {/* ════ PULL BUTTON ════ */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => performPull(10)}
            disabled={isPulling}
            className="px-8 py-3 text-lg font-bold bg-[var(--color-accent)] text-black border-l-4 border-l-[var(--color-originium)] hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2">
            <Dice6 size={20} /> Pull 10x ({bannerType === 'operator' ? 'Operator' : 'Weapon'} Banner)
          </button>
          <button onClick={() => performPull(1)}
            disabled={isPulling}
            className="px-4 py-3 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-white transition-colors disabled:opacity-30">
            1x Pull
          </button>
        </div>

        {/* ════ SUMMON COLUMNS — Tall Silhouette Display ════ */}
        <div className="relative mb-4 overflow-hidden bg-black/60 border border-[var(--color-border)]"
          onClick={skipReveal}
          style={{ cursor: isRevealing ? 'pointer' : 'default', minHeight: currentPulls.length > 0 ? undefined : 260 }}>
          {/* Scrolling Japanese text overlay (like endfieldtools.dev) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-10">
            <div className="whitespace-nowrap text-[10px] text-white/30 font-mono" style={{ animation: 'scroll-left 30s linear infinite' }}>
              {Array(8).fill('それが何を意味するのか分かりません').join(' ')}
            </div>
          </div>

          {isRevealing && (
            <div className="absolute top-2 left-0 right-0 text-center z-20">
              <span className="text-[10px] text-[var(--color-accent)] tracking-widest uppercase font-mono bg-black/60 px-3 py-1">
                Tap to skip
              </span>
            </div>
          )}

          {currentPulls.length > 0 ? (
            <div className={`flex justify-center items-end gap-0.5 sm:gap-1 px-4 sm:px-6 py-4 ${currentPulls.length === 1 ? 'max-w-[120px] mx-auto' : ''}`}
              style={{ minHeight: 260 }}>
              {currentPulls.map((pull, i) => (
                <SummonColumn key={i} pull={pull} isVisible={i < revealedCount} index={i} total={currentPulls.length} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-end gap-0.5 sm:gap-1 px-4 sm:px-6 py-4" style={{ minHeight: 260 }}>
              {/* Empty silhouette placeholders */}
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex-1 relative overflow-hidden rounded-sm"
                  style={{ maxWidth: 72, height: 220, background: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)', opacity: 0.4 }}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-15">
                    <div className="w-5 h-5 border border-white/20" style={{ transform: 'rotate(45deg)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rank display */}
        <div className="text-center mb-6">
          <span className="text-[var(--color-accent)] font-bold text-sm">{rank.title}</span>
          <span className="text-[var(--color-text-tertiary)] text-sm"> - {rank.desc}</span>
          {totalPulls > 0 && (
            <span className="text-[var(--color-text-muted)] text-xs ml-2">({totalPulls} total pulls)</span>
          )}
        </div>

        {/* Pity info bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 text-center">
            <p className="text-xl font-bold text-white font-mono">{currentBanner.pityCounter}</p>
            <p className="text-[10px] text-[var(--color-text-tertiary)]">Pity Counter</p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 text-center">
            <p className="text-xl font-bold font-mono" style={{ color: currentBanner.pityCounter >= (bannerType === 'operator' ? PITY_SOFT_OPERATOR : PITY_SOFT_WEAPON) ? '#E74C3C' : '#27AE60' }}>
              {(bannerType === 'operator' ? PITY_HARD_OPERATOR : PITY_HARD_WEAPON) - currentBanner.pityCounter}
            </p>
            <p className="text-[10px] text-[var(--color-text-tertiary)]">Until Hard Pity ({bannerType === 'operator' ? PITY_HARD_OPERATOR : PITY_HARD_WEAPON})</p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 text-center">
            <p className="text-xl font-bold font-mono" style={{ color: currentBanner.guaranteedRateUp ? '#27AE60' : '#E67E22' }}>
              {currentBanner.guaranteedRateUp ? 'YES' : '50/50'}
            </p>
            <p className="text-[10px] text-[var(--color-text-tertiary)]">
              {currentBanner.guaranteedRateUp ? 'Guaranteed Rate-Up' : 'Next 6-Star'}
            </p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 text-center">
            <p className="text-xl font-bold font-mono" style={{ color: RARITY_COLORS[6] }}>
              {currentRate.toFixed(1)}%
            </p>
            <p className="text-[10px] text-[var(--color-text-tertiary)]">Current 6-Star Rate</p>
          </div>
        </div>

        {/* Pity progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-[var(--color-text-tertiary)]">Pity Progress ({bannerType === 'operator' ? 'Operator' : 'Weapon'} Banner)</span>
            {(() => {
              const soft = bannerType === 'operator' ? PITY_SOFT_OPERATOR : PITY_SOFT_WEAPON;
              const hard = bannerType === 'operator' ? PITY_HARD_OPERATOR : PITY_HARD_WEAPON;
              return (
                <div className="flex items-center gap-3">
                  <span className="text-[var(--color-text-tertiary)]">Soft: {soft}</span>
                  <span className={`font-bold ${currentBanner.pityCounter >= soft ? 'text-red-400' : 'text-[var(--color-accent)]'}`}>
                    {currentBanner.pityCounter}/{hard}
                  </span>
                </div>
              );
            })()}
          </div>
          {(() => {
            const soft = bannerType === 'operator' ? PITY_SOFT_OPERATOR : PITY_SOFT_WEAPON;
            const hard = bannerType === 'operator' ? PITY_HARD_OPERATOR : PITY_HARD_WEAPON;
            return (
              <div className="relative w-full bg-[var(--color-border)] h-3">
                <div className={`h-full transition-all duration-300 ${currentBanner.pityCounter >= soft ? 'bg-red-500' : 'bg-[var(--color-accent)]'}`}
                  style={{ width: `${(currentBanner.pityCounter / hard) * 100}%` }} />
                <div className="absolute top-0 bottom-0 w-px bg-orange-400"
                  style={{ left: `${(soft / hard) * 100}%` }} />
              </div>
            );
          })()}
        </div>

        {/* ════ RECENT SUMMONS ════ */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl mb-6">
          <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History size={16} className="text-[var(--color-accent)]" />
              <h3 className="text-sm font-bold text-white">Recent Summons</h3>
              <span className="text-[10px] text-[var(--color-text-tertiary)]">
                Showing {bannerType === 'operator' ? 'Operator' : 'Weapon'} banner pulls
              </span>
            </div>
            {state.history.length > 0 && (
              <button onClick={reset}
                className="text-[10px] text-[var(--color-text-tertiary)] hover:text-red-400 flex items-center gap-1">
                <RotateCcw size={10} /> Reset
              </button>
            )}
          </div>
          <div className="p-4">
            {(() => {
              const bannerHistory = state.history.filter(e => !e.banner || e.banner === bannerType);
              return bannerHistory.length === 0 ? (
                <p className="text-sm text-[var(--color-text-tertiary)]">
                  No {bannerType === 'operator' ? 'operator' : 'weapon'} banner summons yet. Pull from this banner to see results here!
                </p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {bannerHistory.slice(0, 10).map((entry, ei) => {
                    const highest = Math.max(...entry.pulls.map(p => p.rarity));
                    return (
                      <div key={ei} className="flex items-center gap-2 p-2 bg-[var(--color-surface-2)] border-l-3"
                        style={{ borderLeftColor: RARITY_COLORS[highest], borderLeftWidth: 3 }}>
                        <div className="shrink-0 w-16 flex flex-col items-start gap-0.5">
                          <span className="text-[9px] text-[var(--color-text-muted)]">
                            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className={`text-[7px] font-bold px-1 py-px ${
                            (entry.banner || 'operator') === 'operator'
                              ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
                              : 'bg-[var(--color-originium)]/20 text-[var(--color-originium)]'
                          }`}>
                            {(entry.banner || 'operator') === 'operator' ? 'OPS' : 'WPN'}
                          </span>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {entry.pulls.map((pull, pi) => (
                            <MiniPullCard key={pi} pull={pull} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* ════ SUMMON POOL ════ */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl mb-6">
          <div className="p-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-[var(--color-accent)]" />
              <h3 className="text-sm font-bold text-white">
                {bannerType === 'operator' ? 'Operator' : 'Weapon'} Pool
              </h3>
              <span className="text-[10px] text-[var(--color-text-tertiary)]">
                Browse all available {bannerType === 'operator' ? 'operators' : 'weapons'} in this banner, organized by rarity
              </span>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {(bannerType === 'operator' ? [6, 5, 4] : [6, 5, 4, 3]).map(rarity => (
              <div key={rarity}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold" style={{ color: RARITY_COLORS[rarity] }}>{rarity}-Star</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{poolByRarity[rarity]?.length || 0} {bannerType === 'operator' ? 'operators' : 'weapons'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(poolByRarity[rarity] || []).map(item => {
                    const owned = state.collection[item.name];
                    return (
                      <div key={item.name}
                        className={`relative w-14 h-14 sm:w-16 sm:h-16 overflow-hidden border-b-2 ${owned ? 'opacity-100' : 'opacity-40 grayscale'}`}
                        style={{ borderBottomColor: RARITY_COLORS[rarity], background: 'var(--color-surface-2)' }}
                        title={`${item.name}${owned ? ` (x${owned.count})` : ' (not owned)'}`}>
                        {item.icon ? (
                          <Image src={item.icon} alt={item.name} width={64} height={64}
                            className="w-full h-full object-contain p-0.5" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[7px] text-[var(--color-text-tertiary)]">
                            {item.name}
                          </div>
                        )}
                        {owned && owned.count > 1 && (
                          <span className="absolute top-0 right-0 bg-[var(--color-accent)] text-black text-[7px] font-bold px-0.5">
                            x{owned.count}
                          </span>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-center">
                          <span className="text-[6px] text-white leading-none">{rarity}-Star</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════ DROP RATES DIALOG ════ */}
      {showRates && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowRates(false)}>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Summon Drop Rates</h3>
              <button onClick={() => setShowRates(false)} className="text-[var(--color-text-tertiary)] hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="p-3 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30">
                <h4 className="text-xs font-bold text-[var(--color-accent)] mb-2">Banner Types</h4>
                <ul className="text-[10px] text-[var(--color-text-tertiary)] space-y-1">
                  <li><strong className="text-white">Operator Banner:</strong> Only pulls operators/characters</li>
                  <li><strong className="text-white">Weapon Banner:</strong> Only pulls weapons</li>
                  <li>Each banner has its own separate pity counter</li>
                </ul>
              </div>
              {(bannerType === 'operator' ? [
                { rarity: 6, rate: '1.76%', desc: '6-Star Operator', note: `0.8% featured + 0.96% off-banner. Soft pity from pull ${PITY_SOFT_OPERATOR} (+2%/pull). Hard pity at pull ${PITY_HARD_OPERATOR}. 50/50 featured rate-up.` },
                { rarity: 5, rate: '13.15%', desc: '5-Star Operator', note: '50% chance of being a featured 5-Star operator.' },
                { rarity: 4, rate: '40.0%', desc: '4-Star Operator', note: '' },
                { rarity: 3, rate: '45.09%', desc: '3-Star', note: 'Operators only — no weapons on this banner.' },
              ] : [
                { rarity: 6, rate: '2.80%', desc: '6-Star Weapon', note: `Higher base rate than operator banner. Soft pity from pull ${PITY_SOFT_WEAPON} (+2%/pull). Hard pity at pull ${PITY_HARD_WEAPON}. 50/50 featured rate-up.` },
                { rarity: 5, rate: '18.0%', desc: '5-Star Weapon', note: '50% chance of being a featured 5-Star weapon.' },
                { rarity: 4, rate: '40.0%', desc: '4-Star Weapon', note: '' },
                { rarity: 3, rate: '39.2%', desc: '3-Star Weapon', note: 'Weapons only — no operators on this banner.' },
              ]).map(r => (
                <div key={r.rarity} className="flex items-center gap-3 p-3 bg-[var(--color-surface-2)]">
                  <div className="w-2 h-8" style={{ backgroundColor: RARITY_COLORS[r.rarity] }} />
                  <div className="flex-1">
                    <p className="text-xs text-white font-bold">{r.desc}</p>
                    {r.note && <p className="text-[10px] text-[var(--color-text-tertiary)]">{r.note}</p>}
                  </div>
                  <span className="text-lg font-bold font-mono" style={{ color: RARITY_COLORS[r.rarity] }}>{r.rate}</span>
                </div>
              ))}
              <div className="mt-4 p-3 bg-[var(--color-surface-2)]">
                <h4 className="text-xs font-bold text-white mb-2">Pity System</h4>
                <ul className="text-[10px] text-[var(--color-text-tertiary)] space-y-1">
                  <li><strong className="text-white">Operator Banner:</strong> 1.76% base 6-Star rate, soft pity at pull {PITY_SOFT_OPERATOR}, hard pity at pull {PITY_HARD_OPERATOR}</li>
                  <li><strong className="text-white">Weapon Banner:</strong> 2.80% base 6-Star rate, soft pity at pull {PITY_SOFT_WEAPON}, hard pity at pull {PITY_HARD_WEAPON}</li>
                  <li>After soft pity, the rate increases by 2% per additional pull</li>
                  <li>If you lose the 50/50, your next 6-Star is guaranteed to be featured</li>
                  <li>Pity counter resets when you pull a 6-Star</li>
                  <li><strong className="text-white">Each banner has its own independent pity counter — you pull from one banner at a time</strong></li>
                  <li><strong className="text-[var(--color-originium)]">Operator and weapon banners are SEPARATE — you cannot mix them</strong></li>
                </ul>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)] italic">
                Rates are based on publicly available data and may differ from live game rates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ════ STATS DIALOG ════ */}
      {showStats && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowStats(false)}>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Your Statistics</h3>
              <button onClick={() => setShowStats(false)} className="text-[var(--color-text-tertiary)] hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Banner selector tabs */}
              <div className="flex gap-2 mb-4">
                <button onClick={() => setBannerType('operator')}
                  className={`flex-1 px-4 py-2 text-xs font-bold transition-colors ${
                    bannerType === 'operator'
                      ? 'bg-[var(--color-accent)] text-black'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
                  }`}>
                  Operator Banner
                </button>
                <button onClick={() => setBannerType('weapon')}
                  className={`flex-1 px-4 py-2 text-xs font-bold transition-colors ${
                    bannerType === 'weapon'
                      ? 'bg-[var(--color-accent)] text-black'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
                  }`}>
                  Weapon Banner
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[var(--color-surface-2)] p-3 text-center">
                  <p className="text-2xl font-bold text-white font-mono">{currentBanner.totalPulls}</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">Banner Pulls</p>
                </div>
                <div className="bg-[var(--color-surface-2)] p-3 text-center">
                  <p className="text-2xl font-bold font-mono" style={{ color: RARITY_COLORS[6] }}>{currentBanner.stats[6] || 0}</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">
                    6-Star ({currentBanner.totalPulls > 0 ? (((currentBanner.stats[6] || 0) / currentBanner.totalPulls) * 100).toFixed(1) : '0.0'}%)
                  </p>
                </div>
                <div className="bg-[var(--color-surface-2)] p-3 text-center">
                  <p className="text-2xl font-bold font-mono" style={{ color: RARITY_COLORS[5] }}>{currentBanner.stats[5] || 0}</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">
                    5-Star ({currentBanner.totalPulls > 0 ? (((currentBanner.stats[5] || 0) / currentBanner.totalPulls) * 100).toFixed(1) : '0.0'}%)
                  </p>
                </div>
                <div className="bg-[var(--color-surface-2)] p-3 text-center">
                  <p className="text-2xl font-bold text-white font-mono">
                    {(currentBanner.stats[6] || 0) > 0 ? Math.round(currentBanner.totalPulls / (currentBanner.stats[6] || 1)) : '-'}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">Avg Pulls per 6-Star</p>
                </div>
              </div>

              {/* Overall stats */}
              <div className="bg-[var(--color-surface-2)] p-3">
                <h4 className="text-xs font-bold text-white mb-2">Overall Statistics</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-white font-mono">{totalPulls}</p>
                    <p className="text-[9px] text-[var(--color-text-tertiary)]">Total Pulls</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold font-mono" style={{ color: RARITY_COLORS[6] }}>
                      {(state.operator.stats[6] || 0) + (state.weapon.stats[6] || 0)}
                    </p>
                    <p className="text-[9px] text-[var(--color-text-tertiary)]">Total 6-Stars</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold font-mono" style={{ color: RARITY_COLORS[5] }}>
                      {(state.operator.stats[5] || 0) + (state.weapon.stats[5] || 0)}
                    </p>
                    <p className="text-[9px] text-[var(--color-text-tertiary)]">Total 5-Stars</p>
                  </div>
                </div>
              </div>

              {/* Distribution bar */}
              {currentBanner.totalPulls > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-white mb-2">Pull Distribution ({bannerType === 'operator' ? 'Operator' : 'Weapon'})</h4>
                  <div className="flex h-6 overflow-hidden">
                    {[6, 5, 4, 3].map(r => {
                      const count = currentBanner.stats[r] || 0;
                      const pct = (count / currentBanner.totalPulls) * 100;
                      if (pct === 0) return null;
                      return (
                        <div key={r} style={{ width: `${pct}%`, backgroundColor: RARITY_COLORS[r] }}
                          className="flex items-center justify-center text-[8px] text-white font-bold min-w-[2px]">
                          {pct >= 5 ? `${r}★ ${pct.toFixed(0)}%` : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 6-star pull history */}
              {currentBanner.sixStarHistory.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-white mb-2">6-Star Pull History ({bannerType === 'operator' ? 'Operator' : 'Weapon'})</h4>
                  <div className="flex flex-wrap gap-1">
                    {currentBanner.sixStarHistory.map((h, i) => (
                      <span key={i} className="px-2 py-1 text-[9px] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                        <span style={{ color: RARITY_COLORS[6] }}>{h.item}</span>
                        <span className="text-[var(--color-text-tertiary)]"> @{h.pullNumber}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Luck analysis */}
              {currentBanner.totalPulls >= 10 && (
                <div>
                  <h4 className="text-xs font-bold text-white mb-2">Luck Analysis ({bannerType === 'operator' ? 'Operator' : 'Weapon'})</h4>
                  {(() => {
                    const expected6 = currentBanner.totalPulls * (bannerType === 'operator' ? 0.0176 : 0.028);
                    const actual6 = currentBanner.stats[6] || 0;
                    const luckFactor = actual6 / Math.max(expected6, 0.01);
                    const luckLabel = luckFactor >= 1.5 ? 'Incredibly Lucky' :
                      luckFactor >= 1.1 ? 'Above Average' :
                      luckFactor >= 0.9 ? 'Average' :
                      luckFactor >= 0.6 ? 'Below Average' : 'Unlucky';
                    const luckColor = luckFactor >= 1.1 ? '#27AE60' :
                      luckFactor >= 0.9 ? '#F5A623' : '#E74C3C';
                    return (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[var(--color-surface-2)] p-3 text-center">
                          <p className="text-sm font-bold" style={{ color: luckColor }}>{luckLabel}</p>
                          <p className="text-[10px] text-[var(--color-text-tertiary)]">Luck Rating</p>
                        </div>
                        <div className="bg-[var(--color-surface-2)] p-3 text-center">
                          <p className="text-lg font-bold font-mono text-white">{expected6.toFixed(1)}</p>
                          <p className="text-[10px] text-[var(--color-text-tertiary)]">Expected 6★</p>
                        </div>
                        <div className="bg-[var(--color-surface-2)] p-3 text-center">
                          <p className="text-lg font-bold font-mono" style={{ color: RARITY_COLORS[6] }}>{actual6}</p>
                          <p className="text-[10px] text-[var(--color-text-tertiary)]">Actual 6★</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Collection stats - separated by type */}
              <div>
                <h4 className="text-xs font-bold text-white mb-2">Collection</h4>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div className="bg-[var(--color-surface-2)] p-2 border-l-2 border-l-[var(--color-accent)]">
                    <p className="text-[9px] text-[var(--color-accent)] font-bold mb-1">OPERATORS</p>
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <div>
                        <p className="text-sm font-bold text-white font-mono">
                          {Object.values(state.collection).filter(c => c.type === 'character').length}
                        </p>
                        <p className="text-[8px] text-[var(--color-text-tertiary)]">Unique</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold font-mono" style={{ color: RARITY_COLORS[6] }}>
                          {Object.values(state.collection).filter(c => c.type === 'character' && c.rarity === 6).length}
                        </p>
                        <p className="text-[8px] text-[var(--color-text-tertiary)]">6-Star</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold font-mono" style={{ color: RARITY_COLORS[5] }}>
                          {Object.values(state.collection).filter(c => c.type === 'character' && c.rarity === 5).length}
                        </p>
                        <p className="text-[8px] text-[var(--color-text-tertiary)]">5-Star</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[var(--color-surface-2)] p-2 border-l-2 border-l-[var(--color-originium)]">
                    <p className="text-[9px] text-[var(--color-originium)] font-bold mb-1">WEAPONS</p>
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <div>
                        <p className="text-sm font-bold text-white font-mono">
                          {Object.values(state.collection).filter(c => c.type === 'weapon').length}
                        </p>
                        <p className="text-[8px] text-[var(--color-text-tertiary)]">Unique</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold font-mono" style={{ color: RARITY_COLORS[6] }}>
                          {Object.values(state.collection).filter(c => c.type === 'weapon' && c.rarity === 6).length}
                        </p>
                        <p className="text-[8px] text-[var(--color-text-tertiary)]">6-Star</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold font-mono" style={{ color: RARITY_COLORS[5] }}>
                          {Object.values(state.collection).filter(c => c.type === 'weapon' && c.rarity === 5).length}
                        </p>
                        <p className="text-[8px] text-[var(--color-text-tertiary)]">5-Star</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Summon Column — Tall vertical card (matches endfieldtools.dev) ───
function SummonColumn({ pull, isVisible, index, total }: {
  pull: Pull; isVisible: boolean; index: number; total: number;
}) {
  const gachaArt = pull.type === 'character' ? CHARACTER_GACHA[pull.item] : null;

  if (!isVisible) {
    return (
      <div className="flex-1 relative overflow-hidden rounded-sm"
        style={{
          maxWidth: total === 1 ? 120 : 72,
          height: total === 1 ? 280 : 220,
          background: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)',
          opacity: 0.5,
          transform: 'scale(0.95)',
          transition: 'all 0.3s ease',
        }}>
        <div className="absolute inset-0 flex items-center justify-center opacity-15">
          <div className="w-5 h-5 border border-white/20" style={{ transform: 'rotate(45deg)' }} />
        </div>
      </div>
    );
  }

  const cardClass = `gacha-card-${pull.rarity}`;
  const isHighRarity = pull.rarity >= 5;

  return (
    <div className="flex-1 relative overflow-hidden rounded-sm"
      style={{
        maxWidth: total === 1 ? 120 : 72,
        height: total === 1 ? 280 : 220,
        animation: `gacha-reveal 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s both`,
      }}>
      {/* Animated rarity gradient background */}
      <div className={`absolute inset-0 ${cardClass}`} />

      {/* Character gacha art (tall portrait) */}
      {gachaArt ? (
        <div className="absolute inset-0" style={{
          backgroundImage: `url(${gachaArt})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          marginTop: '-2%',
        }} />
      ) : pull.icon ? (
        <div className="absolute inset-0 flex items-center justify-center p-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pull.icon} alt={pull.item} className="w-full h-auto object-contain drop-shadow-lg" />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[7px] text-white/80 text-center px-1 font-bold">{pull.item}</span>
        </div>
      )}

      {/* Bottom gradient for text readability */}
      <div className="absolute inset-x-0 bottom-0 h-2/5"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }} />

      {/* Sparkle particles for 5+ star */}
      {isHighRarity && (
        <div className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 20% 30%, rgba(255,255,200,0.9), transparent),
              radial-gradient(0.8px 0.8px at 60% 20%, rgba(255,255,255,0.8), transparent),
              radial-gradient(1.2px 1.2px at 40% 70%, rgba(255,230,80,0.7), transparent)
            `,
            backgroundSize: '40px 60px, 60px 40px, 80px 80px',
            animation: 'gacha-sparkle 2.5s linear infinite',
          }} />
      )}

      {/* Shine sweep for 5+ star */}
      {isHighRarity && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(30deg, transparent 30%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.15) 55%, transparent 70%)',
            animation: 'gacha-shine 2.5s linear infinite',
          }} />
        </div>
      )}

      {/* 6-star pulsing glow border */}
      {pull.rarity >= 6 && (
        <div className="absolute inset-0 pointer-events-none rounded-sm"
          style={{ animation: 'gacha-6star-border 3s ease-in-out infinite' }} />
      )}

      {/* Star indicators at bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-px pb-0.5">
        {Array.from({ length: Math.min(pull.rarity, 6) }).map((_, si) => (
          <span key={si} className="text-[6px] drop-shadow-md" style={{
            color: pull.rarity >= 6 ? '#FFD700' : pull.rarity >= 5 ? '#C488FF' : '#6CB4EE',
            textShadow: pull.rarity >= 6 ? '0 0 4px rgba(255,215,0,0.8)' : 'none',
          }}>&#9733;</span>
        ))}
      </div>

      {/* Badges */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-start">
        {pull.isNew ? (
          <span className="text-[5px] font-bold px-0.5 py-px bg-green-500/90 text-white tracking-wider">NEW</span>
        ) : <span />}
        {pull.isPity ? (
          <span className="text-[5px] font-bold px-0.5 py-px bg-red-500/90 text-white tracking-wider">PITY</span>
        ) : <span />}
      </div>

      {/* Rate Up badge */}
      {pull.isRateUp && pull.rarity >= 5 && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <span className="bg-[var(--color-accent)]/90 text-black text-[4px] font-bold px-1 py-px tracking-widest uppercase">Rate Up</span>
        </div>
      )}
    </div>
  );
}

// ─── Mini Pull Card for history ─────────────────────────────────────
function MiniPullCard({ pull }: { pull: Pull }) {
  const gachaArt = pull.type === 'character' ? CHARACTER_GACHA[pull.item] : null;
  return (
    <div className="relative w-10 h-10 sm:w-12 sm:h-12 overflow-hidden rounded-sm border-b-2 shrink-0"
      style={{ borderBottomColor: RARITY_COLORS[pull.rarity] }}
      title={`${pull.item} (${pull.rarity}★)${pull.isNew ? ' NEW' : ''}${pull.isPity ? ' PITY' : ''}`}>
      {/* Rarity bg */}
      <div className={`absolute inset-0 gacha-card-${pull.rarity}`} style={{ opacity: 0.6 }} />
      {gachaArt ? (
        <div className="absolute inset-0" style={{
          backgroundImage: `url(${gachaArt})`,
          backgroundSize: '150%',
          backgroundPosition: 'center 20%',
        }} />
      ) : pull.icon ? (
        <div className="absolute inset-0 flex items-center justify-center p-0.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pull.icon} alt={pull.item} className="w-full h-full object-contain" />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[5px] text-white/80 text-center">{pull.item}</span>
        </div>
      )}
      {/* Rarity stars */}
      <div className="absolute bottom-0 left-0 right-0 text-center bg-black/50">
        <span className="text-[6px]" style={{ color: RARITY_COLORS[pull.rarity] }}>{pull.rarity}&#9733;</span>
      </div>
    </div>
  );
}
