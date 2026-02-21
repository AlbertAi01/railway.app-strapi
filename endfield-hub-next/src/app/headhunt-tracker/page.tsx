'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Target, TrendingUp, Download, Share2, Upload, Clock, BarChart3, Trophy, Cloud, CloudOff, Loader2, X, Users, FileText, AlertCircle, ChevronDown, Trash2, Copy, Check, Link } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import html2canvas from 'html2canvas';
import { CHARACTERS, WEAPONS } from '@/lib/data';
import { CHARACTER_ICONS, WEAPON_ICONS } from '@/lib/assets';
import { useAuthStore } from '@/store/authStore';
import { syncToCloud, loadFromCloud, saveLocal, loadLocal } from '@/lib/userSync';
import api from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────
interface Pull {
  id: string;
  timestamp: number;
  rarity: number;
  name: string;
  item: string;
  banner: string;
  icon?: string;
  type?: 'character' | 'weapon' | 'material';
  date?: string;
}

interface HeadhuntData {
  version: 2;
  pulls: Pull[];
  pityCounters: Record<string, number>;
}

// Legacy v1 format (old "Record Pull" system)
interface LegacyHeadhuntData {
  pulls: Array<{
    id: string;
    timestamp: number;
    rarity: number;
    item: string;
    banner: string;
    icon?: string;
    type?: 'character' | 'weapon' | 'material';
  }>;
  pityCounters: Record<string, number>;
}

interface GlobalStatsData {
  totalPulls: number;
  contributors: number;
  sixStarRate: number;
  fiveStarRate: number;
  fourStarRate: number;
  totalSixStar: number;
  totalFiveStar: number;
  mostPulledSixStar: Array<{ name: string; count: number }>;
  mostPulledFiveStar: Array<{ name: string; count: number }>;
  bannerBreakdown: Array<{
    banner: string;
    totalPulls: number;
    sixStarRate: number;
    fiveStarRate: number;
    userCount: number;
  }>;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  totalPulls: number;
  sixStarCount: number;
  fiveStarCount: number;
  sixStarRate: number;
  bannerCount: number;
}

interface LeaderboardData {
  sort: string;
  totalPlayers: number;
  totalPulls: number;
  overallSixStarRate: number;
  entries: LeaderboardEntry[];
}

// ─── Constants ───────────────────────────────────────────────
const BANNERS = [
  { id: 'basic', name: 'Basic Headhunting', color: '#888', type: 'standard' as const },
  { id: 'scars-of-the-forge', name: 'Scars of the Forge', color: '#ff6b35', featured: 'Laevatain', type: 'operator' as const },
  { id: 'hues-of-passion', name: 'Hues of Passion', color: '#e74c9e', featured: 'Ardelia', type: 'operator' as const },
  { id: 'rime-of-the-depths', name: 'Rime of the Depths', color: '#4fc3f7', featured: 'Last Rite', type: 'operator' as const },
  { id: 'the-floaty-messenger', name: 'The Floaty Messenger', color: '#7c3aed', featured: 'Gilberta', type: 'operator' as const },
  { id: 'arsenal-issue', name: 'Arsenal Issue', color: '#a855f7', type: 'weapon' as const },
];

const RARITY_COLORS: Record<number, string> = {
  6: 'text-orange-400',
  5: 'text-purple-400',
  4: 'text-blue-400',
  3: 'text-gray-400',
};

const RARITY_BG: Record<number, string> = {
  6: 'bg-orange-900/15 border-orange-500/30',
  5: 'bg-purple-900/15 border-purple-500/30',
  4: 'bg-blue-900/10 border-blue-500/20',
  3: 'bg-[var(--color-surface)] border-[var(--color-border)]',
};

type Tab = 'import' | 'history' | 'global' | 'leaderboard';

const LOCAL_KEY = 'zerosanity-headhunt';

const POWERSHELL_ONE_CLICK = `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; $scriptUrl='https://raw.githubusercontent.com/holstonline/endfield-gacha-url/refs/heads/main/extract-headhunt-api-url.ps1'; $scriptText=(Invoke-WebRequest -UseBasicParsing -Uri $scriptUrl).Content; Invoke-Expression $scriptText`;

const POWERSHELL_FALLBACK = `$logPath="$env:USERPROFILE\\AppData\\LocalLow\\Gryphline\\Endfield\\sdklogs\\HGWebview.log"; if(-not (Test-Path $logPath)){Write-Host "Log file not found" -ForegroundColor Red; exit}; $raw=Get-Content -Path $logPath -Raw; $matches=[regex]::Matches($raw,'https://ef-webview\\.gryphline\\.com[^\\s]+u8_token=[^\\s]+'); if($matches.Count -eq 0){Write-Host "No URL found. Open gacha history in-game first." -ForegroundColor Yellow; exit}; $url=$matches[$matches.Count-1].Value; Set-Clipboard -Value $url; Write-Host "URL copied to clipboard!" -ForegroundColor Green; Write-Host $url`;

const VALID_GACHA_DOMAINS = new Set([
  'ef-webview.gryphline.com',
  'ef-webview.hypergryph.com',
  'ef-webview.biligame.com',
]);

const SERVERS = [
  { id: '1', name: 'China (Bilibili)', region: 'cn' },
  { id: '2', name: 'Asia', region: 'asia' },
  { id: '3', name: 'Europe / America', region: 'global' },
];

const LOG_PATHS: Record<string, string> = {
  cn: '%USERPROFILE%\\AppData\\LocalLow\\Hypergryph\\Endfield\\sdklogs\\HGWebview.log',
  asia: '%USERPROFILE%\\AppData\\LocalLow\\Gryphline\\Endfield\\sdklogs\\HGWebview.log',
  global: '%USERPROFILE%\\AppData\\LocalLow\\Gryphline\\Endfield\\sdklogs\\HGWebview.log',
};

// ─── Helper: Parse gacha URL ────────────────────────────────
function parseGachaUrl(input: string): { token: string | null; serverId: string | null } {
  const trimmed = input.trim().replace(/^['"`]+|['"`]+$/g, '');
  if (!trimmed) return { token: null, serverId: null };

  if (trimmed.startsWith('http')) {
    try {
      const url = new URL(trimmed);
      if (!VALID_GACHA_DOMAINS.has(url.hostname)) return { token: null, serverId: null };
      const token = url.searchParams.get('u8_token') || url.searchParams.get('token');
      const serverId = url.searchParams.get('server_id') || url.searchParams.get('server');
      return { token: token?.trim() || null, serverId: serverId || '3' };
    } catch { return { token: null, serverId: null }; }
  }

  // Bare token (no URL)
  if (trimmed.length > 20 && !trimmed.includes(' ')) {
    return { token: trimmed, serverId: null };
  }

  return { token: null, serverId: null };
}

// ─── Helper: Map banner name ────────────────────────────────
function mapBannerName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('basic') || lower.includes('standard')) return 'basic';
  if (lower.includes('scars') || lower.includes('laevatain') || lower.includes('forge')) return 'scars-of-the-forge';
  if (lower.includes('hues') || lower.includes('ardelia') || lower.includes('passion')) return 'hues-of-passion';
  if (lower.includes('rime') || lower.includes('last rite') || lower.includes('depths')) return 'rime-of-the-depths';
  if (lower.includes('floaty') || lower.includes('gilberta') || lower.includes('messenger')) return 'the-floaty-messenger';
  if (lower.includes('arsenal') || lower.includes('weapon')) return 'arsenal-issue';
  return 'basic';
}

// ─── Helper: Migrate legacy data ────────────────────────────
function migrateLegacyData(legacy: LegacyHeadhuntData): HeadhuntData {
  const bannerIdMap: Record<string, string> = {
    'Standard': 'basic',
    'basic': 'basic',
    'Limited': 'scars-of-the-forge',
    'limited-1': 'scars-of-the-forge',
    'limited-2': 'hues-of-passion',
    'limited-3': 'rime-of-the-depths',
    'Weapon': 'arsenal-issue',
    'weapon': 'arsenal-issue',
  };

  return {
    version: 2,
    pulls: (legacy.pulls || []).map(p => ({
      ...p,
      name: p.item,
      banner: bannerIdMap[p.banner] || p.banner,
    })),
    pityCounters: Object.fromEntries(
      Object.entries(legacy.pityCounters || {}).map(([k, v]) => [bannerIdMap[k] || k, v])
    ),
  };
}

// ─── Component ───────────────────────────────────────────────
export default function HeadhuntTrackerPage() {
  const [activeTab, setActiveTab] = useState<Tab>('import');
  const [pulls, setPulls] = useState<Pull[]>([]);
  const [pityCounters, setPityCounters] = useState<Record<string, number>>({});

  // Import tab state
  const [importUrl, setImportUrl] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [showPowerShell, setShowPowerShell] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedOneClick, setCopiedOneClick] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [importPlatform, setImportPlatform] = useState<'pc' | 'android'>('pc');
  const [importServer, setImportServer] = useState('3');
  const [parsedToken, setParsedToken] = useState<string | null>(null);
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [showManualScript, setShowManualScript] = useState(false);
  const [manualBanner, setManualBanner] = useState('basic');
  const [manualRarity, setManualRarity] = useState(6);
  const [manualType, setManualType] = useState<'character' | 'weapon'>('character');
  const [manualItemName, setManualItemName] = useState('');

  // History tab state
  const [historyBannerFilter, setHistoryBannerFilter] = useState<string>('all');
  const [historyRarityFilter, setHistoryRarityFilter] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Global stats tab state
  const [globalStats, setGlobalStats] = useState<GlobalStatsData | null>(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalBannerFilter, setGlobalBannerFilter] = useState('all');

  // Leaderboard tab state
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardSort, setLeaderboardSort] = useState<'pulls' | 'lucky'>('pulls');
  const [leaderboardBannerFilter, setLeaderboardBannerFilter] = useState('all');

  // Misc
  const [isExporting, setIsExporting] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Cloud sync
  const { user, token } = useAuthStore();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadDone = useRef(false);

  // ─── Load data on mount ──────────────────────────────────
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const loadData = async () => {
      let data: HeadhuntData | null = null;

      if (token) {
        setSyncStatus('syncing');
        const cloud = await loadFromCloud('headhuntTracker', token) as (HeadhuntData | LegacyHeadhuntData | null);
        if (cloud) {
          if ('version' in cloud && cloud.version === 2) {
            data = cloud as HeadhuntData;
          } else if (cloud && 'pulls' in cloud) {
            data = migrateLegacyData(cloud as LegacyHeadhuntData);
          }
          setSyncStatus('synced');
        } else {
          setSyncStatus('idle');
        }
      }

      if (!data) {
        // Try new local key
        const local = loadLocal('headhunt') as (HeadhuntData | LegacyHeadhuntData | null);
        if (local) {
          if ('version' in local && (local as HeadhuntData).version === 2) {
            data = local as HeadhuntData;
          } else if (local && 'pulls' in local) {
            data = migrateLegacyData(local as LegacyHeadhuntData);
          }
        }

        // Try old localStorage keys
        if (!data) {
          const oldPulls = localStorage.getItem('endfield-pulls');
          const oldPity = localStorage.getItem('endfield-pity');
          if (oldPulls) {
            try {
              const legacy: LegacyHeadhuntData = {
                pulls: JSON.parse(oldPulls),
                pityCounters: oldPity ? JSON.parse(oldPity) : {},
              };
              data = migrateLegacyData(legacy);
            } catch { /* ignore */ }
          }
        }
      }

      if (data) {
        setPulls(data.pulls || []);
        setPityCounters(data.pityCounters || {});
      }
    };

    loadData();
  }, [token]);

  // ─── Save data ───────────────────────────────────────────
  const saveData = useCallback((newPulls: Pull[], newPity: Record<string, number>) => {
    const data: HeadhuntData = { version: 2, pulls: newPulls, pityCounters: newPity };
    saveLocal('headhunt', data);

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

  // ─── Submit pulls to backend ─────────────────────────────
  const submitToBackend = useCallback(async (pullsToSubmit: Pull[]) => {
    if (!token) return;

    // Group pulls by banner
    const bannerGroups: Record<string, Pull[]> = {};
    for (const pull of pullsToSubmit) {
      if (!bannerGroups[pull.banner]) bannerGroups[pull.banner] = [];
      bannerGroups[pull.banner].push(pull);
    }

    for (const [bannerId, bannerPulls] of Object.entries(bannerGroups)) {
      const bannerDef = BANNERS.find(b => b.id === bannerId);
      if (!bannerDef) continue;

      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await api.post('/headhunt-records/submit', {
          banner: bannerDef.name,
          bannerType: bannerDef.type,
          pulls: bannerPulls.map(p => ({
            name: p.name || p.item,
            rarity: p.rarity,
            date: p.date || new Date(p.timestamp).toISOString(),
            itemType: p.type,
          })),
          importSource: 'manual',
        });
      } catch {
        console.warn(`Failed to submit pulls for banner ${bannerId}`);
      }
    }
  }, [token]);

  // ─── Add a single pull ───────────────────────────────────
  const addPull = useCallback((rarity: number, itemName: string, banner: string, icon?: string, type?: 'character' | 'weapon' | 'material') => {
    const newPull: Pull = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      rarity,
      name: itemName,
      item: itemName,
      banner,
      icon,
      type,
      date: new Date().toISOString(),
    };

    const newPulls = [newPull, ...pulls];
    const newPity = { ...pityCounters };
    if (rarity === 6) {
      newPity[banner] = 0;
    } else {
      newPity[banner] = (newPity[banner] || 0) + 1;
    }

    setPulls(newPulls);
    setPityCounters(newPity);
    saveData(newPulls, newPity);
    if (token) submitToBackend([newPull]);
  }, [pulls, pityCounters, saveData, submitToBackend, token]);

  const addManualPull = () => {
    if (!manualItemName.trim()) return;

    let icon: string | undefined;
    let type: 'character' | 'weapon' | 'material' = manualType === 'character' ? 'character' : 'weapon';

    if (manualType === 'character') {
      const char = CHARACTERS.find(c => c.Name.toLowerCase() === manualItemName.toLowerCase());
      if (char) icon = CHARACTER_ICONS[char.Name];
    } else {
      const weapon = WEAPONS.find(w => w.Name.toLowerCase() === manualItemName.toLowerCase());
      if (weapon) icon = WEAPON_ICONS[weapon.Name];
    }

    addPull(manualRarity, manualItemName, manualBanner, icon, type);
    setManualItemName('');
  };

  // ─── Delete a pull ───────────────────────────────────────
  const deletePull = (id: string) => {
    const newPulls = pulls.filter(p => p.id !== id);
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

  // ─── Fetch global stats ──────────────────────────────────
  const fetchGlobalStats = useCallback(async () => {
    setGlobalLoading(true);
    try {
      const { data } = await api.get(`/headhunt-records/global-stats${globalBannerFilter !== 'all' ? `?banner=${encodeURIComponent(BANNERS.find(b => b.id === globalBannerFilter)?.name || '')}` : ''}`);
      setGlobalStats(data.data);
    } catch {
      // Fall back to personal stats
      const personal = getStatsForBanner('all');
      setGlobalStats({
        totalPulls: personal.total,
        contributors: pulls.length > 0 ? 1 : 0,
        sixStarRate: parseFloat(personal.sixStarRate),
        fiveStarRate: parseFloat(personal.fiveStarRate),
        fourStarRate: parseFloat(personal.fourStarRate),
        totalSixStar: personal.sixStar,
        totalFiveStar: personal.fiveStar,
        mostPulledSixStar: getMostPulled(6),
        mostPulledFiveStar: getMostPulled(5),
        bannerBreakdown: BANNERS.map(b => {
          const s = getStatsForBanner(b.id);
          return {
            banner: b.name,
            totalPulls: s.total,
            sixStarRate: parseFloat(s.sixStarRate),
            fiveStarRate: parseFloat(s.fiveStarRate),
            userCount: s.total > 0 ? 1 : 0,
          };
        }).filter(b => b.totalPulls > 0),
      });
    }
    setGlobalLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalBannerFilter, pulls]);

  // ─── Fetch leaderboard ───────────────────────────────────
  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const params = new URLSearchParams({ sort: leaderboardSort });
      if (leaderboardBannerFilter !== 'all') {
        params.set('banner', BANNERS.find(b => b.id === leaderboardBannerFilter)?.name || '');
      }
      const { data } = await api.get(`/headhunt-records/leaderboard?${params.toString()}`);
      setLeaderboardData(data.data);
    } catch {
      setLeaderboardData(null);
    }
    setLeaderboardLoading(false);
  }, [leaderboardSort, leaderboardBannerFilter]);

  // Fetch data when tabs change
  useEffect(() => {
    if (activeTab === 'global') fetchGlobalStats();
  }, [activeTab, fetchGlobalStats]);

  useEffect(() => {
    if (activeTab === 'leaderboard') fetchLeaderboard();
  }, [activeTab, fetchLeaderboard]);

  // ─── Stats calculations (local) ─────────────────────────
  const getStatsForBanner = useCallback((bannerId: string | 'all') => {
    const filtered = bannerId === 'all' ? pulls : pulls.filter(p => p.banner === bannerId);
    const total = filtered.length;
    const sixStar = filtered.filter(p => p.rarity === 6);
    const fiveStar = filtered.filter(p => p.rarity === 5);
    const fourStar = filtered.filter(p => p.rarity === 4);
    const threeStar = filtered.filter(p => p.rarity === 3);

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

    return {
      total,
      sixStar: sixStar.length,
      fiveStar: fiveStar.length,
      fourStar: fourStar.length,
      threeStar: threeStar.length,
      sixStarRate: total > 0 ? ((sixStar.length / total) * 100).toFixed(2) : '0.00',
      fiveStarRate: total > 0 ? ((fiveStar.length / total) * 100).toFixed(2) : '0.00',
      fourStarRate: total > 0 ? ((fourStar.length / total) * 100).toFixed(2) : '0.00',
      avgPity,
    };
  }, [pulls]);

  const getMostPulled = useCallback((rarity: number) => {
    const counts: Record<string, number> = {};
    pulls.filter(p => p.rarity === rarity).forEach(p => {
      const n = p.name || p.item;
      counts[n] = (counts[n] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }, [pulls]);

  // ─── History filtered ────────────────────────────────────
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

  // ─── Import / Export ─────────────────────────────────────
  const handleUrlImport = async () => {
    if (!importUrl.trim()) return;
    setImportStatus('loading');
    setImportMessage('Parsing URL and extracting token...');

    const { token, serverId } = parseGachaUrl(importUrl);

    if (!token) {
      setImportStatus('error');
      setImportMessage('Invalid URL. Make sure you paste the full URL from the PowerShell script that contains a u8_token parameter.');
      return;
    }

    if (serverId) setImportServer(serverId);
    setParsedToken(token);
    setImportMessage('Token extracted successfully! Submitting to import queue...');

    try {
      if (!token) throw new Error('No token');

      // Submit to our Strapi backend for server-side fetching
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await api.post('/headhunt-records/import', {
        token: token,
        serverId: serverId || importServer,
        platform: importPlatform,
      });

      if (response.data?.data?.pulls) {
        const importedPulls: Pull[] = response.data.data.pulls.map((p: any, i: number) => ({
          id: `import-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
          timestamp: new Date(p.date || p.timestamp).getTime(),
          rarity: p.rarity || p.star || 3,
          name: p.name || p.item || 'Unknown',
          item: p.name || p.item || 'Unknown',
          banner: mapBannerName(p.banner || p.pool || 'basic'),
          icon: p.icon || CHARACTER_ICONS[p.name] || WEAPON_ICONS[p.name],
          type: p.type || (CHARACTER_ICONS[p.name] ? 'character' : WEAPON_ICONS[p.name] ? 'weapon' : undefined),
          date: p.date || new Date(p.timestamp).toISOString(),
        }));

        // Merge with existing, deduplicate
        const merged = [...importedPulls, ...pulls];
        const seen = new Set<string>();
        const deduped = merged.filter(p => {
          const key = `${p.name}-${p.banner}-${p.timestamp}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).sort((a, b) => b.timestamp - a.timestamp);

        // Recalculate pity
        const newPity: Record<string, number> = {};
        BANNERS.forEach(banner => {
          const bannerPulls = deduped.filter(p => p.banner === banner.id).sort((a, b) => b.timestamp - a.timestamp);
          let counter = 0;
          for (const pull of bannerPulls) {
            if (pull.rarity === 6) break;
            counter++;
          }
          newPity[banner.id] = counter;
        });

        setPulls(deduped);
        setPityCounters(newPity);
        saveData(deduped, newPity);
        if (token) submitToBackend(importedPulls);

        setImportStatus('success');
        setImportMessage(`Imported ${importedPulls.length} pulls successfully! (${deduped.length} total after dedup)`);
      } else {
        throw new Error('No pull data returned');
      }
    } catch (err: any) {
      // If backend import not available, fall back to client-side instruction
      setImportStatus('error');
      setImportMessage(
        'Server-side import is not yet available. Your token was validated successfully. ' +
        'For now, please use JSON file import to transfer your data, or use manual entry. ' +
        'We are working on adding direct API import support.'
      );
    }
  };

  const exportHistoryJSON = () => {
    const data: HeadhuntData = { version: 2, pulls, pityCounters };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zerosanity-headhunt-${Date.now()}.json`;
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
          const raw = JSON.parse(ev.target?.result as string);

          let incoming: HeadhuntData;
          if (raw.version === 2) {
            incoming = raw;
          } else if (raw.pulls && Array.isArray(raw.pulls)) {
            incoming = migrateLegacyData(raw);
          } else {
            throw new Error('Unrecognized format');
          }

          // Merge with existing (deduplicate by id)
          const merged = [...incoming.pulls, ...pulls];
          const seen = new Set<string>();
          const deduped = merged.filter(p => {
            if (seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
          }).sort((a, b) => b.timestamp - a.timestamp);

          // Recalculate pity
          const newPity: Record<string, number> = {};
          BANNERS.forEach(banner => {
            const bannerPulls = deduped.filter(p => p.banner === banner.id).sort((a, b) => b.timestamp - a.timestamp);
            let counter = 0;
            for (const pull of bannerPulls) {
              if (pull.rarity === 6) break;
              counter++;
            }
            newPity[banner.id] = counter;
          });

          setPulls(deduped);
          setPityCounters(newPity);
          saveData(deduped, newPity);

          if (token) submitToBackend(incoming.pulls);

          setImportStatus('success');
          setImportMessage(`Imported ${incoming.pulls.length} pulls successfully! (${deduped.length} total after dedup)`);
        } catch {
          setImportStatus('error');
          setImportMessage('Invalid JSON file. Expected Zero Sanity or endfieldtools format.');
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

  const getBannerName = (id: string) => BANNERS.find(b => b.id === id)?.name || id;
  const getBannerColor = (id: string) => BANNERS.find(b => b.id === id)?.color || '#888';

  const getAvailableItems = (rarity: number, type: 'character' | 'weapon') => {
    if (type === 'character') return CHARACTERS.filter(c => c.Rarity === rarity);
    return WEAPONS.filter(w => w.Rarity === rarity);
  };

  // ─── Tabs ────────────────────────────────────────────────
  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'import', label: 'Import', icon: <Upload size={16} /> },
    { id: 'history', label: 'My History', icon: <Clock size={16} /> },
    { id: 'global', label: 'Global Stats', icon: <BarChart3 size={16} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
  ];

  const allStats = getStatsForBanner('all');

  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Headhunt Tracker - Zero Sanity',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    url: 'https://www.zerosanity.app/headhunt-tracker',
    description: 'Track recruitment attempts and pity counter for Arknights: Endfield',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <RIOSHeader
            title="Headhunt Operations Log"
            category="RECRUITMENT"
            code="RIOS-HH-001"
            icon={<Target size={32} />}
          />
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

        {/* ===== IMPORT TAB ===== */}
        {activeTab === 'import' && (
          <div className="space-y-6 max-w-5xl">
            {/* Import Center */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Upload size={24} className="text-[var(--color-accent)]" />
                Import Center
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">
                Import your gacha history directly from the game using the PowerShell script method.
              </p>

              {/* Step 1: Platform Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Step 1: Choose Platform</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setImportPlatform('pc')}
                    className={`py-4 px-6 clip-corner-tl font-bold text-base transition-colors ${
                      importPlatform === 'pc'
                        ? 'bg-[var(--color-accent)] text-black'
                        : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
                    }`}
                  >
                    PC (Windows)
                  </button>
                  <button
                    onClick={() => setImportPlatform('android')}
                    className={`py-4 px-6 clip-corner-tl font-bold text-base transition-colors ${
                      importPlatform === 'android'
                        ? 'bg-[var(--color-accent)] text-black'
                        : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
                    }`}
                  >
                    Android
                  </button>
                </div>
              </div>

              {/* Step 2: Server Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Step 2: Select Your Server</h3>
                <div className="grid grid-cols-3 gap-3">
                  {SERVERS.map(server => (
                    <button
                      key={server.id}
                      onClick={() => setImportServer(server.id)}
                      className={`py-3 px-4 clip-corner-tl font-bold text-sm transition-colors ${
                        importServer === server.id
                          ? 'bg-[var(--color-accent)] text-black'
                          : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
                      }`}
                    >
                      {server.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Get URL (Platform-specific) */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Step 3: Get Your Gacha URL</h3>

                {importPlatform === 'pc' ? (
                  <div className="space-y-4">
                    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl p-4">
                      <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                        <strong className="text-white">Before you begin:</strong> Open Endfield and navigate to the Headhunt history page (Headhunt → History). Then follow the instructions below.
                      </p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-bold text-white mb-2">Option 1: One-Click Command (Recommended)</p>
                          <p className="text-xs text-[var(--color-text-muted)] mb-2">
                            Copy this command, paste it into PowerShell, and press Enter. The URL will be automatically copied to your clipboard.
                          </p>
                          <div className="relative">
                            <pre className="bg-[#0a0e14] border border-[var(--color-border)] p-3 text-[11px] text-green-400 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                              {POWERSHELL_ONE_CLICK}
                            </pre>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(POWERSHELL_ONE_CLICK);
                                setCopiedOneClick(true);
                                setTimeout(() => setCopiedOneClick(false), 2000);
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white transition-colors clip-corner-tl"
                            >
                              {copiedOneClick ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => setShowManualScript(!showManualScript)}
                          className="flex items-center gap-2 text-sm text-[var(--color-accent)] hover:text-white transition-colors"
                        >
                          <ChevronDown size={14} className={`transition-transform ${showManualScript ? 'rotate-180' : ''}`} />
                          Option 2: Manual Method (Alternative)
                        </button>

                        {showManualScript && (
                          <div>
                            <p className="text-xs text-[var(--color-text-muted)] mb-2">
                              If the one-click command doesn&apos;t work, you can use this manual script:
                            </p>
                            <div className="relative">
                              <pre className="bg-[#0a0e14] border border-[var(--color-border)] p-3 text-[11px] text-green-400 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                                {POWERSHELL_FALLBACK}
                              </pre>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(POWERSHELL_FALLBACK);
                                  setCopiedScript(true);
                                  setTimeout(() => setCopiedScript(false), 2000);
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white transition-colors clip-corner-tl"
                              >
                                {copiedScript ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] p-2 clip-corner-tl">
                        <strong className="text-white">Note:</strong> The log file is located at: {LOG_PATHS[SERVERS.find(s => s.id === importServer)?.region || 'global']}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-900/15 border border-amber-500/30 clip-corner-tl p-4">
                    <p className="text-sm text-amber-300 font-bold mb-2">Android Import (Coming Soon)</p>
                    <p className="text-xs text-amber-400/80">
                      Android import requires WiFi proxy or packet capture tools to extract the gacha URL. This feature is currently under development.
                      For now, please use the PC method or manually enter your pulls below.
                    </p>
                  </div>
                )}
              </div>

              {/* Step 4: Paste URL */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Step 4: Paste Your URL</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder="Paste the gacha URL here (starts with https://ef-webview...)..."
                    className="flex-1 px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl focus:outline-none focus:border-[var(--color-accent)] text-white text-sm"
                  />
                  <button
                    onClick={handleUrlImport}
                    disabled={!importUrl.trim() || importStatus === 'loading' || importPlatform === 'android'}
                    className="px-6 py-3 bg-[var(--color-accent)] text-black font-bold text-sm clip-corner-tl hover:bg-[var(--color-accent)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Import'}
                  </button>
                </div>
              </div>

              {/* Status Message */}
              {importMessage && (
                <div className={`text-sm p-4 clip-corner-tl ${
                  importStatus === 'success' ? 'bg-green-900/20 border border-green-500/30 text-green-400' :
                  importStatus === 'error' ? 'bg-red-900/20 border border-red-500/30 text-red-400' :
                  'bg-blue-900/20 border border-blue-500/30 text-blue-400'
                }`}>
                  {importStatus === 'error' && <AlertCircle size={14} className="inline mr-1.5 -mt-0.5" />}
                  {importStatus === 'success' && <Check size={14} className="inline mr-1.5 -mt-0.5" />}
                  {importStatus === 'loading' && <Loader2 size={14} className="inline mr-1.5 -mt-0.5 animate-spin" />}
                  {importMessage}
                </div>
              )}
            </div>

            {/* JSON Import Section */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <FileText size={18} className="text-[var(--color-accent)]" />
                Import / Export JSON
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Import your pull history from a JSON file, or export your current data for backup.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={importHistoryJSON}
                  className="flex-1 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors text-white font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Upload size={16} />
                  Import JSON File
                </button>
                <button
                  onClick={exportHistoryJSON}
                  disabled={pulls.length === 0}
                  className="flex-1 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-30"
                >
                  <Download size={16} />
                  Export JSON File
                </button>
              </div>
            </div>

            {/* Manual Entry Fallback */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <button
                onClick={() => setShowManualEntry(!showManualEntry)}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp size={18} className="text-[var(--color-accent)]" />
                    Manual Entry
                  </h2>
                  <p className="text-sm text-[var(--color-text-muted)]">Manually record individual pulls</p>
                </div>
                <ChevronDown size={18} className={`text-[var(--color-text-muted)] transition-transform ${showManualEntry ? 'rotate-180' : ''}`} />
              </button>

              {showManualEntry && (
                <div className="mt-4 space-y-4 border-t border-[var(--color-border)] pt-4">
                  {/* Banner Selection */}
                  <div>
                    <label className="block text-sm font-bold mb-2 text-[var(--color-text-muted)] uppercase tracking-wider">Banner</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      {BANNERS.map(banner => (
                        <button
                          key={banner.id}
                          onClick={() => setManualBanner(banner.id)}
                          className={`text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                            manualBanner === banner.id
                              ? 'bg-[var(--color-accent)]/10 border-l-2 text-white'
                              : 'hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'
                          }`}
                          style={manualBanner === banner.id ? { borderLeftColor: banner.color } : {}}
                        >
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: banner.color }} />
                          <span className="truncate text-xs">{banner.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Rarity */}
                    <div>
                      <label className="block text-sm font-bold mb-2 text-[var(--color-text-muted)] uppercase tracking-wider">Rarity</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[6, 5, 4, 3].map(rarity => (
                          <button
                            key={rarity}
                            onClick={() => setManualRarity(rarity)}
                            className={`py-2 clip-corner-tl font-bold transition-colors text-sm ${
                              manualRarity === rarity
                                ? rarity === 6 ? 'bg-orange-500 text-white'
                                : rarity === 5 ? 'bg-purple-500 text-white'
                                : rarity === 4 ? 'bg-blue-500 text-white'
                                : 'bg-gray-500 text-white'
                                : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)]'
                            }`}
                          >
                            {rarity}★
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-sm font-bold mb-2 text-[var(--color-text-muted)] uppercase tracking-wider">Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['character', 'weapon'] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => setManualType(t)}
                            className={`py-2 clip-corner-tl font-medium text-sm transition-colors capitalize ${
                              manualType === t
                                ? 'bg-[var(--color-accent)] text-black'
                                : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)]'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Item Name */}
                  <div>
                    <label className="block text-sm font-bold mb-2 text-[var(--color-text-muted)] uppercase tracking-wider">Item Name</label>
                    <input
                      type="text"
                      value={manualItemName}
                      onChange={(e) => setManualItemName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addManualPull()}
                      placeholder="Enter or select item..."
                      className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl focus:outline-none focus:border-[var(--color-accent)] text-white text-sm mb-2"
                      list="manual-items-datalist"
                    />
                    <datalist id="manual-items-datalist">
                      {getAvailableItems(manualRarity, manualType).map(item => (
                        <option key={item.id} value={item.Name} />
                      ))}
                    </datalist>
                    <button
                      onClick={addManualPull}
                      disabled={!manualItemName.trim()}
                      className="w-full py-3 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-[var(--color-accent)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Add Pull
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Login prompt if not logged in */}
            {!user && (
              <div className="bg-amber-900/15 border border-amber-500/30 clip-corner-tl p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-300 font-bold">Login required for cloud sync</p>
                  <p className="text-xs text-amber-400/80 mt-1">
                    Your data is saved locally. Log in to sync across devices and contribute to global stats.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== MY HISTORY TAB ===== */}
        {activeTab === 'history' && (
          <div>
            {/* Pity Counters */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6 mb-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--color-accent)]" />
                Pity Counter
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {BANNERS.map(banner => {
                  const pity = pityCounters[banner.id] || 0;
                  const isSoftPity = pity >= 50;
                  return (
                    <div key={banner.id} className="bg-[var(--color-surface-2)] p-3 clip-corner-tl">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: banner.color }} />
                        <span className="font-medium text-white text-xs truncate">{banner.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-2xl font-bold ${isSoftPity ? 'text-red-400' : 'text-[var(--color-accent)]'}`}>
                          {pity}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">/120</span>
                      </div>
                      <div className="w-full bg-[var(--color-surface)] h-1 mt-1 overflow-hidden">
                        <div
                          className={`h-full transition-all ${isSoftPity ? 'bg-red-500' : ''}`}
                          style={{
                            width: `${Math.min((pity / 120) * 100, 100)}%`,
                            backgroundColor: isSoftPity ? undefined : banner.color,
                          }}
                        />
                      </div>
                      <p className="text-[10px] mt-1 text-[var(--color-text-muted)]">
                        {isSoftPity ? 'Soft pity!' : `${120 - pity} to guarantee`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-3 text-center">
                <p className="text-2xl font-bold text-white">{allStats.total}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Total Pulls</p>
              </div>
              <div className="bg-[var(--color-surface)] border border-orange-500/20 clip-corner-tl p-3 text-center">
                <p className="text-2xl font-bold text-orange-400">{allStats.sixStar}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase">6★ Pulls</p>
              </div>
              <div className="bg-[var(--color-surface)] border border-purple-500/20 clip-corner-tl p-3 text-center">
                <p className="text-2xl font-bold text-purple-400">{allStats.fiveStar}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase">5★ Pulls</p>
              </div>
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-3 text-center">
                <p className="text-2xl font-bold text-[var(--color-accent)]">{allStats.sixStarRate}%</p>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase">6★ Rate</p>
              </div>
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-3 text-center">
                <p className="text-2xl font-bold text-purple-400">{allStats.fiveStarRate}%</p>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase">5★ Rate</p>
              </div>
            </div>

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
                  <span className="hidden sm:inline">{banner.name}</span>
                  <span className="sm:hidden">{banner.name.split(' ').slice(0, 2).join(' ')}</span>
                </button>
              ))}

              <div className="w-px h-6 bg-[var(--color-border)]" />

              {[6, 5, 4].map(r => (
                <button
                  key={r}
                  onClick={() => setHistoryRarityFilter(historyRarityFilter === r ? null : r)}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                    historyRarityFilter === r
                      ? r === 6 ? 'bg-orange-500 text-white' : r === 5 ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'
                      : `bg-[var(--color-surface)] ${r === 6 ? 'text-orange-400' : r === 5 ? 'text-purple-400' : 'text-blue-400'}`
                  }`}
                >
                  {r}★ Only
                </button>
              ))}

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
                    className={`flex items-center justify-between p-3 clip-corner-tl transition-colors border ${RARITY_BG[pull.rarity] || RARITY_BG[3]} hover:brightness-110`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-[var(--color-text-muted)] w-8 text-right">#{historyPulls.length - index}</div>
                      {pull.icon ? (
                        <div className="w-10 h-10 flex items-center justify-center clip-corner-tl overflow-hidden flex-shrink-0" style={{
                          backgroundColor: pull.rarity === 6 ? 'rgba(249, 115, 22, 0.1)' :
                            pull.rarity === 5 ? 'rgba(168, 85, 247, 0.1)' :
                            'rgba(59, 130, 246, 0.1)'
                        }}>
                          <Image src={pull.icon} alt={pull.name || pull.item} width={40} height={40} className="w-full h-full object-contain" unoptimized />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-[var(--color-surface-2)] flex items-center justify-center text-sm text-[var(--color-text-muted)]">
                          {pull.rarity}★
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${RARITY_COLORS[pull.rarity] || 'text-gray-400'}`}>
                            {pull.name || pull.item}
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
                <p className="text-sm mt-1">Import your pulls in the Import tab to see them here</p>
              </div>
            )}
          </div>
        )}

        {/* ===== GLOBAL STATS TAB ===== */}
        {activeTab === 'global' && (
          <div ref={statsRef} className="space-y-6">
            {/* Banner filter */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setGlobalBannerFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold clip-corner-tl transition-colors ${
                  globalBannerFilter === 'all' ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-white'
                }`}
              >
                All Banners
              </button>
              {BANNERS.map(banner => (
                <button
                  key={banner.id}
                  onClick={() => setGlobalBannerFilter(banner.id)}
                  className={`px-3 py-1.5 text-xs font-bold clip-corner-tl transition-colors flex items-center gap-1.5 ${
                    globalBannerFilter === banner.id ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: banner.color }} />
                  <span className="hidden sm:inline">{banner.name}</span>
                </button>
              ))}
              <div className="flex-1" />
              <button
                onClick={exportSummaryAsImage}
                disabled={isExporting}
                className="px-3 py-1.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] transition-colors flex items-center gap-1.5 disabled:opacity-30"
              >
                <Download size={12} />
                {isExporting ? 'Exporting...' : 'Export Image'}
              </button>
            </div>

            {globalLoading ? (
              <div className="text-center py-16">
                <Loader2 size={32} className="mx-auto mb-4 animate-spin text-[var(--color-accent)]" />
                <p className="text-[var(--color-text-muted)]">Loading global statistics...</p>
              </div>
            ) : globalStats ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5 text-center">
                    <p className="text-3xl font-bold text-white">{globalStats.totalPulls.toLocaleString()}</p>
                    <p className="text-sm text-[var(--color-text-muted)] uppercase mt-1">Total Pulls</p>
                  </div>
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5 text-center">
                    <p className="text-3xl font-bold text-[var(--color-accent)]">{globalStats.contributors}</p>
                    <p className="text-sm text-[var(--color-text-muted)] uppercase mt-1 flex items-center justify-center gap-1">
                      <Users size={12} /> Contributors
                    </p>
                  </div>
                  <div className="bg-[var(--color-surface)] border border-orange-500/30 clip-corner-tl p-5 text-center">
                    <p className="text-3xl font-bold text-orange-400">{globalStats.sixStarRate}%</p>
                    <p className="text-sm text-[var(--color-text-muted)] uppercase mt-1">6★ Rate</p>
                  </div>
                  <div className="bg-[var(--color-surface)] border border-purple-500/30 clip-corner-tl p-5 text-center">
                    <p className="text-3xl font-bold text-purple-400">{globalStats.fiveStarRate}%</p>
                    <p className="text-sm text-[var(--color-text-muted)] uppercase mt-1">5★ Rate</p>
                  </div>
                </div>

                {/* Most Pulled 6-Stars */}
                {globalStats.mostPulledSixStar.length > 0 && (
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Trophy size={16} className="text-orange-400" />
                      Most Pulled 6★
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {globalStats.mostPulledSixStar.map((item) => {
                        const icon = CHARACTER_ICONS[item.name] || WEAPON_ICONS[item.name];
                        return (
                          <div key={item.name} className="bg-[var(--color-surface-2)] border border-orange-500/20 p-3 clip-corner-tl text-center">
                            {icon ? (
                              <div className="w-14 h-14 mx-auto mb-2 overflow-hidden">
                                <Image src={icon} alt={item.name} width={56} height={56} className="w-full h-full object-contain" unoptimized />
                              </div>
                            ) : (
                              <div className="w-14 h-14 mx-auto mb-2 bg-orange-500/10 flex items-center justify-center text-xs text-orange-400">{item.name[0]}</div>
                            )}
                            <p className="text-xs text-orange-300 font-bold truncate">{item.name}</p>
                            <p className="text-lg font-bold text-white">x{item.count}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Most Pulled 5-Stars */}
                {globalStats.mostPulledFiveStar.length > 0 && (
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Trophy size={16} className="text-purple-400" />
                      Most Pulled 5★
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {globalStats.mostPulledFiveStar.slice(0, 10).map((item) => {
                        const icon = CHARACTER_ICONS[item.name] || WEAPON_ICONS[item.name];
                        return (
                          <div key={item.name} className="bg-[var(--color-surface-2)] border border-purple-500/20 p-3 clip-corner-tl text-center">
                            {icon ? (
                              <div className="w-14 h-14 mx-auto mb-2 overflow-hidden">
                                <Image src={icon} alt={item.name} width={56} height={56} className="w-full h-full object-contain" unoptimized />
                              </div>
                            ) : (
                              <div className="w-14 h-14 mx-auto mb-2 bg-purple-500/10 flex items-center justify-center text-xs text-purple-400">{item.name[0]}</div>
                            )}
                            <p className="text-xs text-purple-300 font-bold truncate">{item.name}</p>
                            <p className="text-lg font-bold text-white">x{item.count}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Statistics by Banner */}
                {globalStats.bannerBreakdown.length > 0 && (
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
                    <h3 className="text-sm font-bold text-white mb-4">Statistics by Banner</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {globalStats.bannerBreakdown.map((b) => {
                        const bannerDef = BANNERS.find(bn => bn.name === b.banner);
                        return (
                          <div key={b.banner} className="bg-[var(--color-surface-2)] p-4 clip-corner-tl border-l-2" style={{ borderLeftColor: bannerDef?.color || '#888' }}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bannerDef?.color || '#888' }} />
                              <span className="text-sm font-bold text-white truncate">{b.banner}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-[var(--color-text-muted)]">Pulls:</span>
                                <span className="ml-1 text-white font-bold">{b.totalPulls.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-[var(--color-text-muted)]">Users:</span>
                                <span className="ml-1 text-white font-bold">{b.userCount}</span>
                              </div>
                              <div>
                                <span className="text-[var(--color-text-muted)]">6★ Rate:</span>
                                <span className="ml-1 text-orange-400 font-bold">{b.sixStarRate}%</span>
                              </div>
                              <div>
                                <span className="text-[var(--color-text-muted)]">5★ Rate:</span>
                                <span className="ml-1 text-purple-400 font-bold">{b.fiveStarRate}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {globalStats.totalPulls === 0 && (
                  <div className="text-center py-16 text-[var(--color-text-muted)]">
                    <BarChart3 size={48} className="mx-auto mb-4 opacity-30" />
                    <p>No global data yet</p>
                    <p className="text-sm mt-1">Be the first to contribute by importing your pulls!</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-[var(--color-text-muted)]">
                <BarChart3 size={48} className="mx-auto mb-4 opacity-30" />
                <p>Could not load global statistics</p>
                <p className="text-sm mt-1">
                  <button onClick={fetchGlobalStats} className="text-[var(--color-accent)] hover:underline">Try again</button>
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===== LEADERBOARD TAB ===== */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            {/* Sort tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setLeaderboardSort('pulls')}
                className={`px-4 py-2 text-sm font-bold clip-corner-tl transition-colors ${
                  leaderboardSort === 'pulls' ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-white'
                }`}
              >
                Most Pulls
              </button>
              <button
                onClick={() => setLeaderboardSort('lucky')}
                className={`px-4 py-2 text-sm font-bold clip-corner-tl transition-colors ${
                  leaderboardSort === 'lucky' ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-white'
                }`}
              >
                Luckiest Players
              </button>

              <div className="w-px h-6 bg-[var(--color-border)]" />

              <button
                onClick={() => setLeaderboardBannerFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                  leaderboardBannerFilter === 'all' ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-white'
                }`}
              >
                All
              </button>
              {BANNERS.map(banner => (
                <button
                  key={banner.id}
                  onClick={() => setLeaderboardBannerFilter(banner.id)}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors flex items-center gap-1 ${
                    leaderboardBannerFilter === banner.id ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: banner.color }} />
                  <span className="hidden sm:inline">{banner.name}</span>
                </button>
              ))}
            </div>

            {leaderboardLoading ? (
              <div className="text-center py-16">
                <Loader2 size={32} className="mx-auto mb-4 animate-spin text-[var(--color-accent)]" />
                <p className="text-[var(--color-text-muted)]">Loading leaderboard...</p>
              </div>
            ) : leaderboardData ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 text-center">
                    <p className="text-2xl font-bold text-[var(--color-accent)]">{leaderboardData.totalPlayers}</p>
                    <p className="text-xs text-[var(--color-text-muted)] uppercase flex items-center justify-center gap-1">
                      <Users size={12} /> Players
                    </p>
                  </div>
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 text-center">
                    <p className="text-2xl font-bold text-white">{leaderboardData.totalPulls.toLocaleString()}</p>
                    <p className="text-xs text-[var(--color-text-muted)] uppercase">Total Pulls</p>
                  </div>
                  <div className="bg-[var(--color-surface)] border border-orange-500/20 clip-corner-tl p-4 text-center">
                    <p className="text-2xl font-bold text-orange-400">{leaderboardData.overallSixStarRate}%</p>
                    <p className="text-xs text-[var(--color-text-muted)] uppercase">6★ Rate</p>
                  </div>
                </div>

                {/* Leaderboard Table */}
                {leaderboardData.entries.length > 0 ? (
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
                    <div className="grid grid-cols-[3rem_1fr_5rem_4rem_4rem_4rem] sm:grid-cols-[3rem_1fr_6rem_5rem_5rem_5rem] gap-2 px-4 py-2 bg-[var(--color-surface-2)] text-[10px] uppercase text-[var(--color-text-muted)] font-bold">
                      <span>#</span>
                      <span>Player</span>
                      <span className="text-right">Pulls</span>
                      <span className="text-right">6★</span>
                      <span className="text-right">5★</span>
                      <span className="text-right">Rate</span>
                    </div>
                    {leaderboardData.entries.map((entry) => (
                      <div
                        key={entry.rank}
                        className={`grid grid-cols-[3rem_1fr_5rem_4rem_4rem_4rem] sm:grid-cols-[3rem_1fr_6rem_5rem_5rem_5rem] gap-2 px-4 py-3 border-t border-[var(--color-border)] items-center ${
                          entry.rank <= 3 ? 'bg-amber-900/5' : ''
                        }`}
                      >
                        <span className={`font-bold ${entry.rank === 1 ? 'text-yellow-400' : entry.rank === 2 ? 'text-gray-300' : entry.rank === 3 ? 'text-amber-600' : 'text-[var(--color-text-muted)]'}`}>
                          {entry.rank}
                        </span>
                        <span className="text-sm text-white font-medium truncate">{entry.username}</span>
                        <span className="text-sm text-right text-white font-bold">{entry.totalPulls.toLocaleString()}</span>
                        <span className="text-sm text-right text-orange-400 font-bold">{entry.sixStarCount}</span>
                        <span className="text-sm text-right text-purple-400">{entry.fiveStarCount}</span>
                        <span className="text-sm text-right text-[var(--color-accent)]">{entry.sixStarRate}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-[var(--color-text-muted)]">
                    <Trophy size={48} className="mx-auto mb-4 opacity-30" />
                    <p>No leaderboard data yet</p>
                    <p className="text-sm mt-1">Be the first on the board by importing your pulls!</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-[var(--color-text-muted)]">
                <Trophy size={48} className="mx-auto mb-4 opacity-30" />
                <p>Could not load leaderboard</p>
                <p className="text-sm mt-1">
                  <button onClick={fetchLeaderboard} className="text-[var(--color-accent)] hover:underline">Try again</button>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
