'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Dice6, RotateCcw, BarChart3, Info, ChevronDown, History, Sparkles, Star, X, Zap } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { CHARACTERS, WEAPONS } from '@/lib/data';
import { CHARACTER_ICONS, WEAPON_ICONS, CHARACTER_BANNERS, CHARACTER_GACHA } from '@/lib/assets';

// ─── Constants ───────────────────────────────────────────────────────
const RATES = { 6: 0.008, 5: 0.08, 4: 0.40, 3: 0.512 };
const PITY_SOFT = 50;
const PITY_HARD = 100;
const PITY_INCREASE = 0.02;
const PULL_COST_SINGLE = 600;
const PULL_COST_MULTI = 6000;
const STARTING_CURRENCY = 28800; // Enough for 48 pulls to start

const RARITY_COLORS: Record<number, string> = {
  6: '#FF8C00', 5: '#9B59B6', 4: '#3498DB', 3: '#555',
};
const RARITY_GLOW: Record<number, string> = {
  6: '0 0 20px rgba(255,140,0,0.6), 0 0 40px rgba(255,140,0,0.3)',
  5: '0 0 15px rgba(155,89,182,0.5), 0 0 30px rgba(155,89,182,0.2)',
  4: '0 0 10px rgba(52,152,219,0.4)',
  3: 'none',
};
const RARITY_BG: Record<number, string> = {
  6: 'linear-gradient(135deg, #FF8C00 0%, #B8860B 40%, #4A2800 100%)',
  5: 'linear-gradient(135deg, #9B59B6 0%, #6B3FA0 40%, #2D1B4E 100%)',
  4: 'linear-gradient(135deg, #3498DB 0%, #2471A3 40%, #1B3A5C 100%)',
  3: 'linear-gradient(135deg, #444 0%, #222 100%)',
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

// ─── Banner Definitions ──────────────────────────────────────────────
interface Banner {
  id: string;
  name: string;
  type: 'character' | 'weapon' | 'standard';
  featured6Star: string[];
  featured5Star: string[];
  rateUp6: number; // chance featured 6-star is the rate-up (50/50)
  description: string;
  color: string;
}

const BANNERS: Banner[] = [
  {
    id: 'ardelia', name: 'Blazing Conviction', type: 'character',
    featured6Star: ['Ardelia'], featured5Star: ['Alesh', 'Chen Qianyu', 'Perlica'],
    rateUp6: 0.5, description: 'Featured: Ardelia (6-Star Caster)',
    color: '#FF6B35',
  },
  {
    id: 'laevatain', name: 'Flame of Defiance', type: 'character',
    featured6Star: ['Laevatain'], featured5Star: ['Avywenna', 'Da Pan', 'Snowshine'],
    rateUp6: 0.5, description: 'Featured: Laevatain (6-Star Assault)',
    color: '#E74C3C',
  },
  {
    id: 'weapon', name: 'Armory Acquisition', type: 'weapon',
    featured6Star: ['Exemplar', 'Forgeborn Scathe'], featured5Star: ['Sundering Steel', 'Wild Wanderer', 'Chimeric Justice'],
    rateUp6: 0.75, description: 'Featured weapons with boosted rates',
    color: '#3498DB',
  },
  {
    id: 'standard', name: 'Standard Headhunt', type: 'standard',
    featured6Star: [], featured5Star: [],
    rateUp6: 0, description: 'All operators and weapons in the permanent pool',
    color: '#95A5A6',
  },
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
  bannerId: string;
  pullNumber: number;
}

interface HistoryEntry {
  pulls: Pull[];
  timestamp: number;
  bannerId: string;
}

interface BannerState {
  pityCounter: number;
  guaranteedRateUp: boolean; // lost 50/50 last time
  totalPulls: number;
  stats: Record<number, number>;
  sixStarHistory: { item: string; pullNumber: number }[];
}

interface Collection {
  [key: string]: { count: number; rarity: number; type: string; icon?: string; firstPull: number };
}

interface SimState {
  currency: number;
  bannerStates: Record<string, BannerState>;
  collection: Collection;
  history: HistoryEntry[];
  totalPullsAllBanners: number;
}

const DEFAULT_BANNER_STATE: BannerState = {
  pityCounter: 0, guaranteedRateUp: false, totalPulls: 0,
  stats: { 6: 0, 5: 0, 4: 0, 3: 0 }, sixStarHistory: [],
};

const DEFAULT_STATE: SimState = {
  currency: STARTING_CURRENCY,
  bannerStates: {},
  collection: {},
  history: [],
  totalPullsAllBanners: 0,
};

// ─── Component ───────────────────────────────────────────────────────
export default function SummonSimulatorPage() {
  const [state, setState] = useState<SimState>(DEFAULT_STATE);
  const [activeBanner, setActiveBanner] = useState<string>('ardelia');
  const [currentPulls, setCurrentPulls] = useState<Pull[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [activeTab, setActiveTab] = useState<'banner' | 'stats' | 'history' | 'collection'>('banner');
  const [showRates, setShowRates] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const revealTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('zerosanity-summon-v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
      } catch { /* ignore corrupt data */ }
    }
  }, []);

  // Save to localStorage
  const saveState = useCallback((newState: SimState) => {
    localStorage.setItem('zerosanity-summon-v2', JSON.stringify(newState));
  }, []);

  const banner = BANNERS.find(b => b.id === activeBanner) || BANNERS[0];
  const bannerState = state.bannerStates[activeBanner] || DEFAULT_BANNER_STATE;

  // ─── Pull Logic ──────────────────────────────────────────────────
  const calculateRarity = useCallback((counter: number): number => {
    if (counter >= PITY_HARD - 1) return 6; // hard pity at 100
    let rate6 = RATES[6];
    if (counter >= PITY_SOFT) rate6 += (counter - PITY_SOFT + 1) * PITY_INCREASE;
    const roll = Math.random();
    if (roll < rate6) return 6;
    if (roll < rate6 + RATES[5]) return 5;
    if (roll < rate6 + RATES[5] + RATES[4]) return 4;
    return 3;
  }, []);

  const getItemForRarity = useCallback((rarity: number, bannerDef: Banner, guaranteed: boolean): {
    name: string; icon?: string; type: 'character' | 'weapon'; isRateUp: boolean;
  } => {
    // Featured rate-up for 6-star
    if (rarity === 6 && bannerDef.featured6Star.length > 0) {
      const isRateUp = guaranteed || Math.random() < bannerDef.rateUp6;
      if (isRateUp) {
        const featured = bannerDef.featured6Star[Math.floor(Math.random() * bannerDef.featured6Star.length)];
        const isChar = CHARACTERS.some(c => c.Name === featured);
        return {
          name: featured,
          icon: isChar ? CHARACTER_ICONS[featured] : WEAPON_ICONS[featured],
          type: isChar ? 'character' : 'weapon',
          isRateUp: true,
        };
      }
    }

    // Featured rate-up for 5-star
    if (rarity === 5 && bannerDef.featured5Star.length > 0 && Math.random() < 0.5) {
      const featured = bannerDef.featured5Star[Math.floor(Math.random() * bannerDef.featured5Star.length)];
      const isChar = CHARACTERS.some(c => c.Name === featured);
      return {
        name: featured,
        icon: isChar ? CHARACTER_ICONS[featured] : WEAPON_ICONS[featured],
        type: isChar ? 'character' : 'weapon',
        isRateUp: true,
      };
    }

    // All pulls return either operators or weapons (no materials)
    const isWeaponBanner = bannerDef.type === 'weapon';
    // Character banners favor operators; weapon banners favor weapons; 3-star always weapons
    const charChance = rarity <= 3 ? 0 :
      isWeaponBanner ? 0.25 :
      (rarity === 6 ? 0.5 : rarity === 5 ? 0.6 : 0.7);
    const isCharacter = Math.random() < charChance;

    if (isCharacter) {
      const chars = CHARACTERS.filter(c => c.Rarity === rarity);
      if (chars.length > 0) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        return { name: char.Name, icon: CHARACTER_ICONS[char.Name], type: 'character', isRateUp: false };
      }
    }

    // Weapons (all rarities have weapons available)
    const weapons = WEAPONS.filter(w => w.Rarity === rarity);
    if (weapons.length > 0) {
      const weapon = weapons[Math.floor(Math.random() * weapons.length)];
      return { name: weapon.Name, icon: WEAPON_ICONS[weapon.Name], type: 'weapon', isRateUp: false };
    }

    // Fallback: pick any weapon
    const allWeapons = WEAPONS.filter(w => w.Rarity <= rarity);
    const fallback = allWeapons[Math.floor(Math.random() * allWeapons.length)] || WEAPONS[0];
    return { name: fallback.Name, icon: WEAPON_ICONS[fallback.Name], type: 'weapon', isRateUp: false };
  }, []);

  const performPull = useCallback((count: 1 | 10) => {
    const cost = count === 1 ? PULL_COST_SINGLE : PULL_COST_MULTI;
    if (state.currency < cost) return;

    setIsPulling(true);
    const newPulls: Pull[] = [];
    const bs = { ...(state.bannerStates[activeBanner] || { ...DEFAULT_BANNER_STATE }) };
    const newStats = { ...bs.stats };
    let counter = bs.pityCounter;
    let guaranteed = bs.guaranteedRateUp;
    const newCollection = { ...state.collection };
    const currentTotal = state.totalPullsAllBanners;

    for (let i = 0; i < count; i++) {
      const rarity = calculateRarity(counter);
      const isPity = counter >= PITY_SOFT && rarity === 6;
      const itemData = getItemForRarity(rarity, banner, guaranteed);
      const pullNumber = currentTotal + i + 1;

      const isNew = !newCollection[itemData.name];

      newPulls.push({
        rarity, item: itemData.name, isPity, icon: itemData.icon,
        type: itemData.type, isNew, isRateUp: itemData.isRateUp,
        bannerId: activeBanner, pullNumber,
      });
      newStats[rarity as keyof typeof newStats] = (newStats[rarity as keyof typeof newStats] || 0) + 1;

      if (!newCollection[itemData.name]) {
        newCollection[itemData.name] = { count: 0, rarity, type: itemData.type, icon: itemData.icon, firstPull: pullNumber };
      }
      newCollection[itemData.name].count++;

      if (rarity === 6) {
        bs.sixStarHistory.push({ item: itemData.name, pullNumber: counter + 1 });
        // 50/50 logic
        if (banner.featured6Star.length > 0) {
          guaranteed = !itemData.isRateUp; // lost 50/50 -> next is guaranteed
        }
        counter = 0;
      } else {
        counter++;
      }
    }

    bs.pityCounter = counter;
    bs.guaranteedRateUp = guaranteed;
    bs.totalPulls += count;
    bs.stats = newStats;

    const newEntry: HistoryEntry = { pulls: newPulls, timestamp: Date.now(), bannerId: activeBanner };
    const newHistory = [newEntry, ...state.history].slice(0, 100); // keep last 100 sessions

    const newState: SimState = {
      currency: state.currency - cost,
      bannerStates: { ...state.bannerStates, [activeBanner]: bs },
      collection: newCollection,
      history: newHistory,
      totalPullsAllBanners: currentTotal + count,
    };

    setState(newState);
    saveState(newState);

    // Start reveal animation
    setCurrentPulls(newPulls);
    setRevealedCount(0);
    setIsRevealing(true);

    if (skipAnimation || count === 1) {
      setRevealedCount(count);
      setIsRevealing(false);
      setIsPulling(false);
    } else {
      // Sort by rarity for dramatic reveal (low to high)
      let revealIndex = 0;
      const sorted = [...newPulls].sort((a, b) => a.rarity - b.rarity);
      const revealOrder = sorted.map(p => newPulls.indexOf(p));

      const revealNext = () => {
        revealIndex++;
        setRevealedCount(revealIndex);
        if (revealIndex < count) {
          const nextRarity = newPulls[revealOrder[revealIndex]]?.rarity || 3;
          const delay = nextRarity >= 6 ? 400 : nextRarity >= 5 ? 300 : 150;
          revealTimerRef.current = setTimeout(revealNext, delay);
        } else {
          setIsRevealing(false);
          setIsPulling(false);
        }
      };
      revealTimerRef.current = setTimeout(revealNext, 200);
    }
  }, [state, activeBanner, banner, calculateRarity, getItemForRarity, saveState, skipAnimation]);

  // Skip reveal on click
  const skipReveal = useCallback(() => {
    if (isRevealing) {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      setRevealedCount(currentPulls.length);
      setIsRevealing(false);
      setIsPulling(false);
    }
  }, [isRevealing, currentPulls.length]);

  const addCurrency = useCallback((amount: number) => {
    const newState = { ...state, currency: state.currency + amount };
    setState(newState);
    saveState(newState);
  }, [state, saveState]);

  const reset = useCallback(() => {
    if (confirm('Reset ALL summon data, collection, and currency?')) {
      setCurrentPulls([]);
      setRevealedCount(0);
      setState(DEFAULT_STATE);
      localStorage.removeItem('zerosanity-summon-v2');
    }
  }, []);

  // ─── Derived Data ────────────────────────────────────────────────
  const rank = useMemo(() =>
    RANK_TITLES.find(r => state.totalPullsAllBanners >= r.min && state.totalPullsAllBanners <= r.max) || RANK_TITLES[0],
    [state.totalPullsAllBanners]
  );

  const collectionEntries = useMemo(() =>
    Object.entries(state.collection).sort((a, b) => b[1].rarity - a[1].rarity || a[0].localeCompare(b[0])),
    [state.collection]
  );

  const collectionStats = useMemo(() => {
    const chars = collectionEntries.filter(([, v]) => v.type === 'character');
    const weapons = collectionEntries.filter(([, v]) => v.type === 'weapon');
    const totalChars = CHARACTERS.length;
    const totalWeapons = WEAPONS.filter(w => w.Rarity >= 4).length;
    return {
      uniqueChars: chars.length, totalChars,
      uniqueWeapons: weapons.length, totalWeapons,
      chars6: chars.filter(([, v]) => v.rarity === 6).length,
      chars5: chars.filter(([, v]) => v.rarity === 5).length,
      weapons6: weapons.filter(([, v]) => v.rarity === 6).length,
      weapons5: weapons.filter(([, v]) => v.rarity === 5).length,
    };
  }, [collectionEntries]);

  const allBannerStats = useMemo(() => {
    const totals = { pulls: 0, six: 0, five: 0, four: 0, three: 0 };
    Object.values(state.bannerStates).forEach(bs => {
      totals.pulls += bs.totalPulls;
      totals.six += bs.stats[6] || 0;
      totals.five += bs.stats[5] || 0;
      totals.four += bs.stats[4] || 0;
      totals.three += bs.stats[3] || 0;
    });
    return totals;
  }, [state.bannerStates]);

  const currentBannerRate = useMemo(() => {
    let rate = RATES[6];
    if (bannerState.pityCounter >= PITY_SOFT) {
      rate += (bannerState.pityCounter - PITY_SOFT + 1) * PITY_INCREASE;
    }
    return Math.min(rate * 100, 100);
  }, [bannerState.pityCounter]);

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-6xl mx-auto">
        <RIOSHeader title="Headhunt Simulator" category="SIMULATION" code="RIOS-SIM-001" icon={<Dice6 size={28} />} />

        <p className="text-sm text-[var(--color-text-tertiary)] mb-4">
          Simulate Arknights: Endfield headhunt pulls with accurate pity, 50/50, and rate-up mechanics.
          No real currency spent. Track your luck across multiple banners.
        </p>

        {/* ── Tab Navigation ── */}
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {([
            { id: 'banner', label: 'Banners', icon: <Sparkles size={14} /> },
            { id: 'stats', label: 'Statistics', icon: <BarChart3 size={14} /> },
            { id: 'history', label: 'History', icon: <History size={14} /> },
            { id: 'collection', label: `Collection (${collectionEntries.length})`, icon: <Star size={14} /> },
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-surface)]'
                  : 'border-transparent text-[var(--color-text-tertiary)] hover:text-white'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Banner Tab ── */}
        {activeTab === 'banner' && (
          <div className="space-y-4">
            {/* Currency Bar */}
            <div className="flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="diamond-sm diamond-accent" />
                  <span className="text-white font-bold text-lg font-mono">{state.currency.toLocaleString()}</span>
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">Originium</span>
                </div>
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  ({Math.floor(state.currency / PULL_COST_SINGLE)} pulls)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[6000, 12800, 28800, 60000].map(amt => (
                  <button key={amt} onClick={() => addCurrency(amt)}
                    className="px-2 py-1 text-[10px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors">
                    +{(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            {/* Banner Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BANNERS.map(b => (
                <button key={b.id} onClick={() => setActiveBanner(b.id)}
                  className={`p-3 text-left border transition-colors ${
                    activeBanner === b.id
                      ? 'border-[var(--color-accent)] bg-[var(--color-surface)]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]/50'
                  }`}
                  style={{ borderLeftColor: b.color, borderLeftWidth: '4px' }}>
                  <p className="text-xs text-white font-bold truncate">{b.name}</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">{b.description}</p>
                  {state.bannerStates[b.id] && (
                    <p className="text-[9px] mt-1" style={{ color: b.color }}>
                      Pity: {state.bannerStates[b.id].pityCounter}/{PITY_HARD}
                    </p>
                  )}
                </button>
              ))}
            </div>

            {/* Banner Info */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
              <div className="p-4 border-b border-[var(--color-border)]"
                style={{ borderLeftColor: banner.color, borderLeftWidth: '4px' }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white font-tactical">{banner.name}</h3>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{banner.description}</p>
                    {banner.featured6Star.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">Featured:</span>
                        {banner.featured6Star.map(name => (
                          <span key={name} className="flex items-center gap-1">
                            {CHARACTER_ICONS[name] ? (
                              <Image src={CHARACTER_ICONS[name]} alt={name} width={24} height={24} className="w-6 h-6 object-contain" unoptimized />
                            ) : WEAPON_ICONS[name] ? (
                              <Image src={WEAPON_ICONS[name]} alt={name} width={24} height={24} className="w-6 h-6 object-contain" unoptimized />
                            ) : null}
                            <span className="text-xs font-bold" style={{ color: RARITY_COLORS[6] }}>{name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold font-mono" style={{ color: RARITY_COLORS[6] }}>
                      {currentBannerRate.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)]">Current 6-Star Rate</p>
                  </div>
                </div>
              </div>

              {/* Pity Info */}
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center">
                  <p className="text-xl font-bold text-white font-mono">{bannerState.pityCounter}</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">Pity Counter</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold font-mono" style={{ color: bannerState.pityCounter >= PITY_SOFT ? '#E74C3C' : '#27AE60' }}>
                    {PITY_HARD - bannerState.pityCounter}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">Until Hard Pity</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold font-mono" style={{ color: bannerState.guaranteedRateUp ? '#27AE60' : '#E67E22' }}>
                    {bannerState.guaranteedRateUp ? 'YES' : '50/50'}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">
                    {bannerState.guaranteedRateUp ? 'Guaranteed Rate-Up' : 'Next 6-Star'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white font-mono">{bannerState.totalPulls}</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">Banner Pulls</p>
                </div>
              </div>

              {/* Pity Progress Bar */}
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-[var(--color-text-tertiary)]">Pity Progress</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--color-text-tertiary)]">Soft: {PITY_SOFT}</span>
                    <span className={`font-bold ${bannerState.pityCounter >= PITY_SOFT ? 'text-red-400' : 'text-[var(--color-accent)]'}`}>
                      {bannerState.pityCounter}/{PITY_HARD}
                    </span>
                  </div>
                </div>
                <div className="relative w-full bg-[var(--color-border)] h-3">
                  <div className={`h-full transition-all duration-300 ${bannerState.pityCounter >= PITY_SOFT ? 'bg-red-500' : 'bg-[var(--color-accent)]'}`}
                    style={{ width: `${(bannerState.pityCounter / PITY_HARD) * 100}%` }} />
                  {/* Soft pity marker */}
                  <div className="absolute top-0 bottom-0 w-px bg-orange-400"
                    style={{ left: `${(PITY_SOFT / PITY_HARD) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Pull Buttons */}
            <div className="flex items-center gap-3 justify-center">
              <button onClick={() => performPull(1)}
                disabled={isPulling || state.currency < PULL_COST_SINGLE}
                className="px-6 py-3 bg-[var(--color-surface)] border border-[var(--color-accent)] text-[var(--color-accent)] font-bold transition-colors hover:bg-[var(--color-accent)]/10 disabled:opacity-30 disabled:cursor-not-allowed">
                <span className="text-sm">Pull x1</span>
                <span className="block text-[10px] text-[var(--color-text-tertiary)]">{PULL_COST_SINGLE} Originium</span>
              </button>
              <button onClick={() => performPull(10)}
                disabled={isPulling || state.currency < PULL_COST_MULTI}
                className="px-8 py-3 bg-[var(--color-accent)] text-black font-bold text-lg transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed border-l-4 border-l-[var(--color-originium)]">
                <span>Pull x10</span>
                <span className="block text-[10px] text-black/60">{PULL_COST_MULTI.toLocaleString()} Originium</span>
              </button>
              <div className="flex flex-col gap-1 ml-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={skipAnimation} onChange={e => setSkipAnimation(e.target.checked)}
                    className="w-3 h-3 accent-[var(--color-accent)]" />
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">Skip Animation</span>
                </label>
                <button onClick={() => setShowRates(!showRates)}
                  className="text-[10px] text-[var(--color-accent)] hover:underline flex items-center gap-1">
                  <Info size={10} /> Drop Rates
                </button>
              </div>
            </div>

            {/* Drop Rates */}
            {showRates && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4">
                <h3 className="text-sm font-bold text-white mb-3">Drop Rate Details</h3>
                <div className="space-y-2">
                  {[
                    { rarity: 6, rate: '0.8%', desc: '6-Star Operator/Weapon', note: `Soft pity from pull ${PITY_SOFT} (+2%/pull). Hard pity at ${PITY_HARD}. 50/50 rate-up on character banners.` },
                    { rarity: 5, rate: '8.0%', desc: '5-Star Operator/Weapon', note: '50% chance of featured 5-Star on rate-up banners.' },
                    { rarity: 4, rate: '40.0%', desc: '4-Star Operator/Weapon', note: '' },
                    { rarity: 3, rate: '51.2%', desc: '3-Star Weapon', note: '' },
                  ].map(r => (
                    <div key={r.rarity} className="flex items-center gap-3 p-2 bg-[var(--color-surface-2)]">
                      <div className="w-2 h-6" style={{ backgroundColor: RARITY_COLORS[r.rarity] }} />
                      <div className="flex-1">
                        <p className="text-xs text-white font-bold">{r.desc}</p>
                        {r.note && <p className="text-[10px] text-[var(--color-text-tertiary)]">{r.note}</p>}
                      </div>
                      <span className="text-sm font-bold font-mono" style={{ color: RARITY_COLORS[r.rarity] }}>{r.rate}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[var(--color-text-tertiary)] mt-2 italic">
                  Rates are based on publicly available data and may differ from live game rates.
                </p>
              </div>
            )}

            {/* Pull Result Display — Gacha Cards */}
            {currentPulls.length > 0 && (
              <div className="bg-black/80 border border-[var(--color-border)] overflow-hidden"
                onClick={skipReveal} style={{ cursor: isRevealing ? 'pointer' : 'default' }}>
                {isRevealing && (
                  <div className="text-center py-1 bg-[var(--color-accent)]/10 text-[10px] text-[var(--color-accent)] tracking-widest uppercase font-mono">
                    Tap to skip
                  </div>
                )}
                <div className={`flex justify-center items-end gap-1 sm:gap-2 p-3 sm:p-4 ${currentPulls.length === 1 ? 'max-w-[160px] mx-auto' : ''}`}>
                  {currentPulls.map((pull, i) => {
                    const isVisible = i < revealedCount;
                    const gachaArt = pull.type === 'character' ? CHARACTER_GACHA[pull.item] : null;
                    return (
                      <GachaCard key={i} pull={pull} isVisible={isVisible} gachaArt={gachaArt} index={i} />
                    );
                  })}
                </div>

                {/* Results Summary List */}
                {revealedCount >= currentPulls.length && (
                  <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      {currentPulls.map((pull, i) => (
                        <div key={i} className="flex items-center gap-2 p-1.5 bg-[var(--color-surface-2)]"
                          style={{ borderLeft: `3px solid ${RARITY_COLORS[pull.rarity]}` }}>
                          {pull.icon ? (
                            <Image src={pull.icon} alt={pull.item} width={28} height={28} className="w-7 h-7 object-contain shrink-0" unoptimized />
                          ) : (
                            <div className="w-7 h-7 shrink-0 bg-[var(--color-border)] flex items-center justify-center text-[7px]">?</div>
                          )}
                          <div className="min-w-0">
                            <p className="text-[9px] text-white font-bold truncate">{pull.item}</p>
                            <div className="flex items-center gap-1">
                              <span className="text-[8px]" style={{ color: RARITY_COLORS[pull.rarity] }}>{pull.rarity}&#9733;</span>
                              {pull.isNew && <span className="text-[7px] text-green-400">NEW</span>}
                              {pull.isRateUp && <span className="text-[7px] text-[var(--color-accent)]">UP</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rank */}
            {state.totalPullsAllBanners > 0 && (
              <div className="text-center py-2">
                <span className="text-[var(--color-accent)] font-bold text-sm">{rank.title}</span>
                <span className="text-[var(--color-text-tertiary)] text-sm"> - {rank.desc}</span>
                <span className="text-[var(--color-text-tertiary)] text-xs ml-2">({state.totalPullsAllBanners} total pulls)</span>
              </div>
            )}
          </div>
        )}

        {/* ── Statistics Tab ── */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            {/* Global Stats */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Overall Statistics</h3>
                <button onClick={reset} className="text-xs text-[var(--color-text-tertiary)] hover:text-red-400 flex items-center gap-1">
                  <RotateCcw size={12} /> Reset All
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                <div className="bg-[var(--color-surface-2)] p-3 text-center">
                  <p className="text-2xl font-bold text-white font-mono">{allBannerStats.pulls}</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">Total Pulls</p>
                </div>
                <div className="bg-[var(--color-surface-2)] p-3 text-center">
                  <p className="text-2xl font-bold font-mono" style={{ color: RARITY_COLORS[6] }}>{allBannerStats.six}</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">
                    6-Star ({allBannerStats.pulls > 0 ? ((allBannerStats.six / allBannerStats.pulls) * 100).toFixed(1) : '0.0'}%)
                  </p>
                </div>
                <div className="bg-[var(--color-surface-2)] p-3 text-center">
                  <p className="text-2xl font-bold font-mono" style={{ color: RARITY_COLORS[5] }}>{allBannerStats.five}</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">
                    5-Star ({allBannerStats.pulls > 0 ? ((allBannerStats.five / allBannerStats.pulls) * 100).toFixed(1) : '0.0'}%)
                  </p>
                </div>
                <div className="bg-[var(--color-surface-2)] p-3 text-center">
                  <p className="text-2xl font-bold font-mono" style={{ color: RARITY_COLORS[4] }}>{allBannerStats.four}</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">4-Star</p>
                </div>
                <div className="bg-[var(--color-surface-2)] p-3 text-center">
                  <p className="text-2xl font-bold text-white font-mono">
                    {allBannerStats.six > 0 ? Math.round(allBannerStats.pulls / allBannerStats.six) : '-'}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">Avg Pulls per 6-Star</p>
                </div>
              </div>

              {/* Rarity Distribution Bar */}
              {allBannerStats.pulls > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-white mb-2">Pull Distribution</h4>
                  <div className="flex h-6 overflow-hidden">
                    {[6, 5, 4, 3].map(r => {
                      const count = r === 6 ? allBannerStats.six : r === 5 ? allBannerStats.five : r === 4 ? allBannerStats.four : allBannerStats.three;
                      const pct = (count / allBannerStats.pulls) * 100;
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
            </div>

            {/* Per-Banner Stats */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h3 className="text-sm font-bold text-white mb-4">Per-Banner Statistics</h3>
              <div className="space-y-3">
                {BANNERS.map(b => {
                  const bs = state.bannerStates[b.id];
                  if (!bs || bs.totalPulls === 0) return null;
                  return (
                    <div key={b.id} className="p-3 bg-[var(--color-surface-2)] border-l-4"
                      style={{ borderLeftColor: b.color }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-white">{b.name}</p>
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">{bs.totalPulls} pulls</span>
                      </div>
                      <div className="flex gap-3 text-[10px]">
                        <span style={{ color: RARITY_COLORS[6] }}>6★: {bs.stats[6] || 0}</span>
                        <span style={{ color: RARITY_COLORS[5] }}>5★: {bs.stats[5] || 0}</span>
                        <span style={{ color: RARITY_COLORS[4] }}>4★: {bs.stats[4] || 0}</span>
                        <span className="text-[var(--color-text-tertiary)]">
                          Pity: {bs.pityCounter} | {bs.guaranteedRateUp ? 'Guaranteed' : '50/50'}
                        </span>
                      </div>
                      {bs.sixStarHistory.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {bs.sixStarHistory.map((h, i) => (
                            <span key={i} className="px-1.5 py-0.5 text-[9px] bg-[var(--color-surface)] border border-[var(--color-border)]">
                              <span style={{ color: RARITY_COLORS[6] }}>{h.item}</span>
                              <span className="text-[var(--color-text-tertiary)]"> @{h.pullNumber}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Luck Analysis */}
            {allBannerStats.pulls >= 10 && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
                <h3 className="text-sm font-bold text-white mb-3">Luck Analysis</h3>
                {(() => {
                  const expected6 = allBannerStats.pulls * 0.016; // ~1.6% with soft pity average
                  const actual6 = allBannerStats.six;
                  const luckFactor = actual6 / Math.max(expected6, 0.01);
                  const luckLabel = luckFactor >= 1.5 ? 'Incredibly Lucky' :
                    luckFactor >= 1.1 ? 'Above Average' :
                    luckFactor >= 0.9 ? 'Average' :
                    luckFactor >= 0.6 ? 'Below Average' : 'Unlucky';
                  const luckColor = luckFactor >= 1.1 ? '#27AE60' :
                    luckFactor >= 0.9 ? '#F5A623' : '#E74C3C';
                  return (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-xl font-bold font-mono" style={{ color: luckColor }}>{luckLabel}</p>
                        <p className="text-[10px] text-[var(--color-text-tertiary)]">Luck Rating</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold font-mono text-white">{expected6.toFixed(1)}</p>
                        <p className="text-[10px] text-[var(--color-text-tertiary)]">Expected 6-Stars</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold font-mono" style={{ color: RARITY_COLORS[6] }}>{actual6}</p>
                        <p className="text-[10px] text-[var(--color-text-tertiary)]">Actual 6-Stars</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ── History Tab ── */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Pull History</h3>
              {state.history.length === 0 ? (
                <p className="text-sm text-[var(--color-text-tertiary)]">No pulls yet. Head to the Banners tab to start!</p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {state.history.map((entry, ei) => {
                    const bannerDef = BANNERS.find(b => b.id === entry.bannerId);
                    const highest = Math.max(...entry.pulls.map(p => p.rarity));
                    return (
                      <div key={ei} className="p-3 bg-[var(--color-surface-2)] border-l-4"
                        style={{ borderLeftColor: highest >= 6 ? RARITY_COLORS[6] : highest >= 5 ? RARITY_COLORS[5] : 'var(--color-border)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{bannerDef?.name || entry.bannerId}</span>
                            <span className="text-[10px] text-[var(--color-text-tertiary)]">x{entry.pulls.length}</span>
                          </div>
                          <span className="text-[10px] text-[var(--color-text-tertiary)]">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {entry.pulls.map((pull, pi) => (
                            <span key={pi} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] bg-[var(--color-surface)]"
                              style={{ borderLeft: `2px solid ${RARITY_COLORS[pull.rarity]}` }}>
                              {pull.icon && (
                                <Image src={pull.icon} alt={pull.item} width={14} height={14} className="w-3.5 h-3.5 object-contain" unoptimized />
                              )}
                              <span style={{ color: pull.rarity >= 5 ? RARITY_COLORS[pull.rarity] : 'white' }}>
                                {pull.item}
                              </span>
                              {pull.isNew && <span className="text-green-400">NEW</span>}
                              {pull.isPity && <span className="text-red-400">PITY</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Collection Tab ── */}
        {activeTab === 'collection' && (
          <div className="space-y-4">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Your Collection</h3>

              {/* Collection Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-[var(--color-surface-2)] p-3 text-center">
                  <p className="text-2xl font-bold text-white font-mono">{collectionStats.uniqueChars}</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">Characters ({collectionStats.chars6} 6★, {collectionStats.chars5} 5★)</p>
                </div>
                <div className="bg-[var(--color-surface-2)] p-3 text-center">
                  <p className="text-2xl font-bold text-white font-mono">{collectionStats.uniqueWeapons}</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">Weapons ({collectionStats.weapons6} 6★, {collectionStats.weapons5} 5★)</p>
                </div>
                <div className="bg-[var(--color-surface-2)] p-3 text-center">
                  <div className="w-full bg-[var(--color-border)] h-2 mb-1 mt-2">
                    <div className="h-full bg-[var(--color-accent)]" style={{ width: `${(collectionStats.uniqueChars / collectionStats.totalChars) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">Char Completion {((collectionStats.uniqueChars / collectionStats.totalChars) * 100).toFixed(0)}%</p>
                </div>
                <div className="bg-[var(--color-surface-2)] p-3 text-center">
                  <div className="w-full bg-[var(--color-border)] h-2 mb-1 mt-2">
                    <div className="h-full bg-[var(--color-accent)]" style={{ width: `${(collectionStats.uniqueWeapons / Math.max(collectionStats.totalWeapons, 1)) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">Weapon Completion {((collectionStats.uniqueWeapons / Math.max(collectionStats.totalWeapons, 1)) * 100).toFixed(0)}%</p>
                </div>
              </div>

              {collectionEntries.length === 0 ? (
                <p className="text-sm text-[var(--color-text-tertiary)]">No items collected yet. Pull on a banner to start building your collection!</p>
              ) : (
                <>
                  {/* 6-star section */}
                  {collectionEntries.filter(([, v]) => v.rarity === 6).length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold mb-3" style={{ color: RARITY_COLORS[6] }}>6-Star</h4>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {collectionEntries.filter(([, v]) => v.rarity === 6).map(([name, data]) => (
                          <CollectionCard key={name} name={name} data={data} />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* 5-star section */}
                  {collectionEntries.filter(([, v]) => v.rarity === 5).length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold mb-3" style={{ color: RARITY_COLORS[5] }}>5-Star</h4>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {collectionEntries.filter(([, v]) => v.rarity === 5).map(([name, data]) => (
                          <CollectionCard key={name} name={name} data={data} />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* 4-star section */}
                  {collectionEntries.filter(([, v]) => v.rarity === 4).length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold mb-3" style={{ color: RARITY_COLORS[4] }}>4-Star</h4>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {collectionEntries.filter(([, v]) => v.rarity === 4).map(([name, data]) => (
                          <CollectionCard key={name} name={name} data={data} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Gacha Card Sub-Component ────────────────────────────────────────
function GachaCard({ pull, isVisible, gachaArt, index }: {
  pull: Pull; isVisible: boolean; gachaArt: string | null; index: number;
}) {
  const cardClass = `gacha-card-${pull.rarity}`;
  const isHighRarity = pull.rarity >= 5;

  if (!isVisible) {
    return (
      <div className="relative overflow-hidden rounded-sm flex-1"
        style={{
          aspectRatio: '1/2.3',
          maxWidth: '72px',
          background: 'linear-gradient(180deg, #12121f 0%, #0a0a14 100%)',
          opacity: 0.5,
          transform: 'scale(0.92)',
          transition: 'all 0.3s ease',
        }}>
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-6 h-6 border border-white/20" style={{ transform: 'rotate(45deg)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-sm flex-1"
      style={{
        aspectRatio: '1/2.3',
        maxWidth: '72px',
        animation: `gacha-reveal 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.06}s both`,
      }}>
      {/* Animated rarity background */}
      <div className={`absolute inset-0 ${cardClass}`} />

      {/* Character gacha portrait art */}
      {gachaArt ? (
        <div className="absolute inset-0" style={{
          backgroundImage: `url(${gachaArt})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          marginTop: '-4%',
        }} />
      ) : pull.icon ? (
        <div className="absolute inset-0 flex items-center justify-center p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pull.icon} alt={pull.item} className="w-full h-auto object-contain drop-shadow-lg" />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[8px] text-white/80 text-center px-1 font-bold">{pull.item}</span>
        </div>
      )}

      {/* Gradient overlay at bottom for text readability */}
      <div className="absolute inset-x-0 bottom-0 h-2/5"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }} />

      {/* Particle sparkle layer for 5+ star */}
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

      {/* Shine sweep overlay for 5+ star */}
      {isHighRarity && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(30deg, transparent 30%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.15) 55%, transparent 70%)',
            animation: 'gacha-shine 2.5s linear infinite',
          }} />
        </div>
      )}

      {/* 6-star pulsing border glow */}
      {pull.rarity >= 6 && (
        <div className="absolute inset-0 pointer-events-none rounded-sm"
          style={{ animation: 'gacha-6star-border 3s ease-in-out infinite' }} />
      )}

      {/* Star indicators at bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-px pb-1">
        {Array.from({ length: Math.min(pull.rarity, 6) }).map((_, si) => (
          <span key={si} className="text-[7px] drop-shadow-md" style={{
            color: pull.rarity >= 6 ? '#FFD700' : pull.rarity >= 5 ? '#C488FF' : '#6CB4EE',
            textShadow: pull.rarity >= 6 ? '0 0 4px rgba(255,215,0,0.8)' : 'none',
          }}>&#9733;</span>
        ))}
      </div>

      {/* Badges */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-start">
        {pull.isNew ? (
          <span className="text-[6px] font-bold px-1 py-px bg-green-500/90 text-white tracking-wider">NEW</span>
        ) : <span />}
        {pull.isPity ? (
          <span className="text-[6px] font-bold px-1 py-px bg-red-500/90 text-white tracking-wider">PITY</span>
        ) : <span />}
      </div>

      {/* Rate Up badge */}
      {pull.isRateUp && pull.rarity >= 5 && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <span className="bg-[var(--color-accent)]/90 text-black text-[5px] font-bold px-1 py-px tracking-widest uppercase">Rate Up</span>
        </div>
      )}
    </div>
  );
}

// ─── Collection Card Sub-Component ───────────────────────────────────
function CollectionCard({ name, data }: { name: string; data: { count: number; rarity: number; type: string; icon?: string } }) {
  const gachaArt = data.type === 'character' ? CHARACTER_GACHA[name] : null;
  return (
    <div className="relative bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-hidden group cursor-pointer"
      style={{ borderBottomColor: RARITY_COLORS[data.rarity], borderBottomWidth: '2px' }}>
      <div className="aspect-square overflow-hidden">
        {gachaArt ? (
          <div className="w-full h-full" style={{
            backgroundImage: `url(${gachaArt})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 15%',
          }} />
        ) : data.icon ? (
          <div className="w-full h-full flex items-center justify-center p-1">
            <Image src={data.icon} alt={name} width={60} height={60} className="w-full h-full object-contain" unoptimized />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[8px] text-center text-[var(--color-text-tertiary)]">{name}</span>
          </div>
        )}
      </div>
      <p className="text-[8px] text-white text-center truncate px-0.5 pb-0.5 bg-black/60">{name}</p>
      {data.count > 1 && (
        <span className="absolute top-0 right-0 bg-[var(--color-accent)] text-black text-[8px] font-bold px-1">x{data.count}</span>
      )}
      <span className="absolute top-0 left-0 text-[7px] px-0.5 text-white/50 bg-black/30">
        {data.type === 'character' ? 'OP' : 'WP'}
      </span>
    </div>
  );
}
