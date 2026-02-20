'use client';

import { useState, useEffect, useRef, useMemo, startTransition, useCallback } from 'react';
import Image from 'next/image';
import { CHARACTERS, ELEMENTS, ROLES, WEAPON_TYPES } from '@/lib/data';
import { CHARACTER_ICONS } from '@/lib/assets';
import { Save, RotateCcw, LayoutGrid, Download, Share2, Link as LinkIcon, Search, X, Globe, ThumbsUp, Upload, ChevronDown } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { DEFAULT_TIER_LIST } from '@/data/guides';
import { useAuthStore } from '@/store/authStore';
import html2canvas from 'html2canvas';
import type { Element, Role, WeaponType } from '@/types/game';

const TIERS = ['SS', 'S', 'A', 'B', 'C', 'D'];
const TIER_COLORS: Record<string, string> = {
  SS: 'bg-[#3a0f1f] border-l-4 border-[#FF4444] border-y border-r border-[var(--color-border)]',
  S: 'bg-[#3a1515] border-l-4 border-[#FF8C00] border-y border-r border-[var(--color-border)]',
  A: 'bg-[#3a2a15] border-l-4 border-[#FFD429] border-y border-r border-[var(--color-border)]',
  B: 'bg-[#153a20] border-l-4 border-[#27AE60] border-y border-r border-[var(--color-border)]',
  C: 'bg-[#152a3a] border-l-4 border-[#3498DB] border-y border-r border-[var(--color-border)]',
  D: 'bg-[#2a1a3a] border-l-4 border-[#9B59B6] border-y border-r border-[var(--color-border)]',
};

const TIER_LABEL_COLORS: Record<string, string> = {
  SS: '#FF4444',
  S: '#FF8C00',
  A: '#FFD429',
  B: '#27AE60',
  C: '#3498DB',
  D: '#9B59B6',
};
const RARITIES = [6, 5, 4];

const ELEMENT_COLORS: Record<Element, string> = {
  Physical: '#CCCCCC',
  Heat: '#FF6B35',
  Cryo: '#5BC0EB',
  Electric: '#C084FC',
  Nature: '#34D399',
};

const TIER_LIST_CATEGORIES = ['All', 'Overall', 'DPS', 'Support', 'Tank', 'PvE', 'Boss', 'Factory'] as const;

interface CommunityTierList {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  category: string;
  rankings: { [key: string]: string[] };
  author: string;
  description?: string;
  upvotes: number;
  isOfficial: boolean;
  createdAt: string;
}

// ──────────── Filter Pill Component ────────────

function FilterPill({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-bold border transition-colors ${
        active
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-text-tertiary)]'
      }`}
      style={active && color ? { borderColor: color, color, backgroundColor: `${color}15` } : undefined}
    >
      {label}
    </button>
  );
}

// ──────────── Main Page ────────────

function getDefaultTierList(): { [key: string]: string[] } {
  const tiers: { [key: string]: string[] } = {
    SS: [],
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    Bench: [],
    Unranked: [],
  };

  const rankedNames = new Set<string>();
  for (const tier of TIERS) {
    const entries = DEFAULT_TIER_LIST[tier as keyof typeof DEFAULT_TIER_LIST];
    if (entries) {
      tiers[tier] = entries.map(e => e.name);
      entries.forEach(e => rankedNames.add(e.name));
    }
  }

  tiers.Unranked = CHARACTERS.filter(c => !rankedNames.has(c.Name)).map(c => c.Name);
  return tiers;
}

export default function TierListPage() {
  const [tierList, setTierList] = useState<{ [key: string]: string[] }>(getDefaultTierList);
  const [draggedCharacter, setDraggedCharacter] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isLoadingDefault, setIsLoadingDefault] = useState(false);
  const tierListRef = useRef<HTMLDivElement>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'builder' | 'community'>('builder');

  // Community tier lists
  const [communityLists, setCommunityLists] = useState<CommunityTierList[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityCategory, setCommunityCategory] = useState<string>('All');
  const [communitySort, setCommunitySort] = useState<string>('Upvotes:desc');
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  // Submit modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitTitle, setSubmitTitle] = useState('');
  const [submitCategory, setSubmitCategory] = useState<string>('Overall');
  const [submitDescription, setSubmitDescription] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const { user, token } = useAuthStore();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState<number | null>(null);
  const [filterElement, setFilterElement] = useState<Element | null>(null);
  const [filterRole, setFilterRole] = useState<Role | null>(null);
  const [filterWeapon, setFilterWeapon] = useState<WeaponType | null>(null);

  const hasActiveFilters = searchTerm || filterRarity || filterElement || filterRole || filterWeapon;

  const resetFilters = () => {
    setSearchTerm('');
    setFilterRarity(null);
    setFilterElement(null);
    setFilterRole(null);
    setFilterWeapon(null);
  };

  // Build a set of character names that pass the current filters
  const visibleCharacters = useMemo(() => {
    const visible = new Set<string>();
    CHARACTERS.forEach(c => {
      if (searchTerm && !c.Name.toLowerCase().includes(searchTerm.toLowerCase())) return;
      if (filterRarity && c.Rarity !== filterRarity) return;
      if (filterElement && c.Element !== filterElement) return;
      if (filterRole && c.Role !== filterRole) return;
      if (filterWeapon && c.WeaponType !== filterWeapon) return;
      visible.add(c.Name);
    });
    return visible;
  }, [searchTerm, filterRarity, filterElement, filterRole, filterWeapon]);

  // Load tier list on mount - check localStorage first, then fetch from API if no custom list
  useEffect(() => {
    const saved = localStorage.getItem('endfield-tier-list-v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && 'SS' in parsed) {
          setTierList(parsed);
          return; // User has custom list, don't fetch default
        }
      } catch {
        // Ignore invalid saved data and continue to fetch default
      }
    }

    // No custom list found, fetch default from API
    fetchDefaultTierList();
  }, []);

  const fetchDefaultTierList = async () => {
    setIsLoadingDefault(true);
    try {
      const res = await fetch('/api/default-tier-list');
      if (!res.ok) throw new Error('Failed to fetch default tier list');

      const data = await res.json();

      // Transform API response to tier list format
      const tiers: { [key: string]: string[] } = {
        SS: [],
        S: [],
        A: [],
        B: [],
        C: [],
        D: [],
        Bench: [],
        Unranked: [],
      };

      const rankedNames = new Set<string>();

      // Populate tiers from API data
      for (const tier of TIERS) {
        const entries = data[tier] || [];
        tiers[tier] = entries.map((e: { name: string }) => e.name);
        entries.forEach((e: { name: string }) => rankedNames.add(e.name));
      }

      // Add unranked characters
      tiers.Unranked = CHARACTERS.filter(c => !rankedNames.has(c.Name)).map(c => c.Name);

      setTierList(tiers);
    } catch (error) {
      console.error('Failed to load default tier list from API, using fallback:', error);
      // Fallback to hardcoded default if API fails
      setTierList(getDefaultTierList());
    } finally {
      setIsLoadingDefault(false);
    }
  };

  // ── Community Tier Lists ──
  const fetchCommunityLists = useCallback(async () => {
    setCommunityLoading(true);
    try {
      const params = new URLSearchParams({
        sort: communitySort,
        pageSize: '50',
      });
      if (communityCategory !== 'All') params.set('category', communityCategory);

      const res = await fetch(`/api/tier-lists?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setCommunityLists(json.data || []);
    } catch (error) {
      console.error('Failed to load community tier lists:', error);
      setCommunityLists([]);
    } finally {
      setCommunityLoading(false);
    }
  }, [communityCategory, communitySort]);

  useEffect(() => {
    if (activeTab === 'community') {
      fetchCommunityLists();
    }
  }, [activeTab, fetchCommunityLists]);

  // Load voted IDs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('endfield-tier-list-votes');
    if (saved) {
      try { setVotedIds(new Set(JSON.parse(saved))); } catch { /* ignore */ }
    }
  }, []);

  const handleUpvote = async (list: CommunityTierList) => {
    if (votedIds.has(list.documentId)) return;

    try {
      const res = await fetch('/api/tier-lists/upvote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: list.documentId, currentUpvotes: list.upvotes }),
      });

      if (!res.ok) throw new Error('Vote failed');

      const newVoted = new Set(votedIds);
      newVoted.add(list.documentId);
      setVotedIds(newVoted);
      localStorage.setItem('endfield-tier-list-votes', JSON.stringify([...newVoted]));

      setCommunityLists(prev =>
        prev.map(l => l.documentId === list.documentId ? { ...l, upvotes: l.upvotes + 1 } : l)
      );
    } catch (error) {
      console.error('Upvote failed:', error);
    }
  };

  const loadCommunityList = (list: CommunityTierList) => {
    if (!confirm(`Load "${list.title}" by ${list.author}? This will replace your current tier list.`)) return;

    const newTierList: { [key: string]: string[] } = {
      SS: [], S: [], A: [], B: [], C: [], D: [], Bench: [], Unranked: [],
    };

    const rankedNames = new Set<string>();
    for (const tier of TIERS) {
      const entries = list.rankings[tier] || [];
      newTierList[tier] = entries;
      entries.forEach(n => rankedNames.add(n));
    }
    newTierList.Unranked = CHARACTERS.filter(c => !rankedNames.has(c.Name)).map(c => c.Name);

    setTierList(newTierList);
    setActiveTab('builder');
  };

  const handleSubmitTierList = async () => {
    if (!token || !user) {
      alert('Please log in to submit a tier list.');
      return;
    }
    if (!submitTitle.trim()) {
      alert('Please enter a title for your tier list.');
      return;
    }

    setSubmitStatus('submitting');
    try {
      const rankings: { [key: string]: string[] } = {};
      for (const tier of TIERS) {
        rankings[tier] = tierList[tier] || [];
      }

      const res = await fetch('/api/tier-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: submitTitle.trim(),
          category: submitCategory,
          rankings,
          description: submitDescription.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Submission failed');
      }

      setSubmitStatus('success');
      setSubmitTitle('');
      setSubmitDescription('');
      // Refresh community lists
      fetchCommunityLists();
      setTimeout(() => {
        setShowSubmitModal(false);
        setSubmitStatus('idle');
      }, 1500);
    } catch (error) {
      console.error('Submit failed:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const saveTierList = () => {
    localStorage.setItem('endfield-tier-list-v2', JSON.stringify(tierList));
    alert('Tier list saved!');
  };

  const resetTierList = async () => {
    if (!confirm('Reset tier list to community default rankings? This will discard your custom changes.')) {
      return;
    }

    localStorage.removeItem('endfield-tier-list-v2');

    // Fetch fresh default from API
    setIsLoadingDefault(true);
    try {
      const res = await fetch('/api/default-tier-list');
      if (!res.ok) throw new Error('Failed to fetch default tier list');

      const data = await res.json();

      // Transform API response to tier list format
      const tiers: { [key: string]: string[] } = {
        SS: [],
        S: [],
        A: [],
        B: [],
        C: [],
        D: [],
        Bench: [],
        Unranked: [],
      };

      const rankedNames = new Set<string>();

      for (const tier of TIERS) {
        const entries = data[tier] || [];
        tiers[tier] = entries.map((e: { name: string }) => e.name);
        entries.forEach((e: { name: string }) => rankedNames.add(e.name));
      }

      tiers.Unranked = CHARACTERS.filter(c => !rankedNames.has(c.Name)).map(c => c.Name);

      setTierList(tiers);
      alert('Tier list reset to default!');
    } catch (error) {
      console.error('Failed to reset tier list from API, using fallback:', error);
      // Fallback to hardcoded default if API fails
      const reset = getDefaultTierList();
      setTierList(reset);
      alert('Tier list reset to default (using fallback)!');
    } finally {
      setIsLoadingDefault(false);
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

    startTransition(() => {
      const newTierList = { ...tierList };
      Object.keys(newTierList).forEach(key => {
        newTierList[key] = newTierList[key].filter(c => c !== draggedCharacter);
      });
      newTierList[tier] = newTierList[tier] || [];
      newTierList[tier].push(draggedCharacter);
      setTierList(newTierList);
      setDraggedCharacter(null);
    });
  };

  const moveCharacter = (character: string, tier: string) => {
    startTransition(() => {
      const newTierList = { ...tierList };
      Object.keys(newTierList).forEach(key => {
        newTierList[key] = newTierList[key].filter(c => c !== character);
      });
      newTierList[tier] = newTierList[tier] || [];
      newTierList[tier].push(character);
      setTierList(newTierList);
    });
  };

  // Click-to-pick, click-to-place
  const handleCharacterClick = (charName: string) => {
    if (selectedCharacter === charName) {
      setSelectedCharacter(null); // deselect
    } else {
      setSelectedCharacter(charName);
    }
  };

  const handleTierClick = (tier: string) => {
    if (!selectedCharacter) return;
    moveCharacter(selectedCharacter, tier);
    setSelectedCharacter(null);
  };

  const exportAsImage = async () => {
    if (!tierListRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(tierListRef.current, {
        backgroundColor: '#0A0A0A',
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
    } catch {
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

  const CharacterCard = ({ charName, currentTier }: { charName: string; currentTier: string }) => {
    const character = CHARACTERS.find(c => c.Name === charName);
    if (!character) return null;

    const isFiltered = hasActiveFilters && !visibleCharacters.has(charName);
    const isSelected = selectedCharacter === charName;

    const iconUrl = CHARACTER_ICONS[character.Name];
    const elemColor = ELEMENT_COLORS[character.Element as Element] || '#888';

    return (
      <div
        draggable
        onDragStart={() => handleDragStart(charName)}
        onClick={(e) => { e.stopPropagation(); handleCharacterClick(charName); }}
        className={`bg-[var(--color-surface)] border clip-corner-tl p-4 cursor-pointer hover:border-[var(--color-accent)] transition-all group shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] select-none ${
          isFiltered ? 'opacity-20' : ''
        } ${isSelected ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/40 bg-[var(--color-accent)]/5' : 'border-[var(--color-border)]'}`}
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
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold text-white truncate">{character.Name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-bold px-1 py-0.5" style={{ color: elemColor, borderColor: elemColor, border: '1px solid' }}>
                {character.Element}
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)]">{character.Role}</span>
            </div>
          </div>
          <div className="text-[11px] text-[var(--color-text-muted)] font-mono">
            {character.Rarity}★
          </div>
        </div>

        {/* Quick move buttons */}
        <div className={`mt-1 flex gap-1 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {TIERS.map(t => (
            t !== currentTier && (
              <button
                key={t}
                onClick={(e) => { e.stopPropagation(); moveCharacter(charName, t); setSelectedCharacter(null); }}
                className="text-xs px-2 py-1 bg-[var(--color-border)] clip-corner-tl hover:text-black"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = TIER_LABEL_COLORS[t])}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
              >
                {t}
              </button>
            )
          ))}
          {currentTier !== 'Unranked' && currentTier !== 'Bench' && (
            <button
              onClick={(e) => { e.stopPropagation(); moveCharacter(charName, 'Bench'); setSelectedCharacter(null); }}
              className="text-xs px-2 py-1 bg-[var(--color-border)] clip-corner-tl hover:bg-[var(--color-accent)] hover:text-black"
              title="Move to Bench"
            >
              BN
            </button>
          )}
          {currentTier !== 'Unranked' && (
            <button
              onClick={(e) => { e.stopPropagation(); moveCharacter(charName, 'Unranked'); setSelectedCharacter(null); }}
              className="text-xs px-2 py-1 bg-[var(--color-border)] clip-corner-tl hover:bg-[var(--color-text-tertiary)] hover:text-black"
            >
              -
            </button>
          )}
        </div>
      </div>
    );
  };

  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Tier List Builder - Zero Sanity',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    url: 'https://www.zerosanity.app/tier-list',
    description: 'Create and share operator tier rankings for Arknights: Endfield',
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <RIOSHeader title="Combat Assessment Matrix" category="ANALYSIS" code="RIOS-TIER-001" icon={<LayoutGrid size={32} />} />
          {activeTab === 'builder' && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={exportAsImage}
                disabled={isExporting}
                className="px-5 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-2 disabled:opacity-50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]"
              >
                <Download className="w-5 h-5" />
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
                    <button onClick={copyShareLink} className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--color-surface-2)] flex items-center gap-3 text-[var(--color-text-secondary)]">
                      <LinkIcon className="w-4 h-4" />
                      Copy Link
                    </button>
                    <button onClick={shareToTwitter} className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--color-surface-2)] flex items-center gap-3 text-[var(--color-text-secondary)]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      Post on X
                    </button>
                    <button onClick={shareToReddit} className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--color-surface-2)] flex items-center gap-3 text-[var(--color-text-secondary)]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                      Post on Reddit
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={resetTierList}
                disabled={isLoadingDefault}
                className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className={`w-4 h-4 ${isLoadingDefault ? 'animate-spin' : ''}`} />
                {isLoadingDefault ? 'Resetting...' : 'Reset'}
              </button>
              <button
                onClick={saveTierList}
                className="px-6 py-2 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-[var(--color-accent)]/90 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          )}
        </div>

        {/* ─── Tab Bar ─── */}
        <div className="flex gap-1 mb-6 border-b border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
              activeTab === 'builder'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4 inline mr-2 -mt-0.5" />
            Builder
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
              activeTab === 'community'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2 -mt-0.5" />
            Community Lists
          </button>
          {activeTab === 'builder' && user && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="ml-auto px-4 py-2 text-sm bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 transition-colors flex items-center gap-2 my-1"
            >
              <Upload className="w-4 h-4" />
              Publish to Community
            </button>
          )}
        </div>

        {/* ─── Community Tier Lists Tab ─── */}
        {activeTab === 'community' && (
          <div className="space-y-4">
            {/* Category Filter & Sort */}
            <div className="flex flex-wrap items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4">
              <span className="text-sm text-[var(--color-text-muted)] uppercase tracking-wider">Category</span>
              {TIER_LIST_CATEGORIES.map(cat => (
                <FilterPill
                  key={cat}
                  label={cat}
                  active={communityCategory === cat}
                  onClick={() => setCommunityCategory(cat)}
                />
              ))}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-muted)]">Sort:</span>
                <select
                  value={communitySort}
                  onChange={e => setCommunitySort(e.target.value)}
                  className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-xs px-3 py-1.5 focus:outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="Upvotes:desc">Most Upvoted</option>
                  <option value="createdAt:desc">Newest</option>
                  <option value="Title:asc">Alphabetical</option>
                </select>
              </div>
            </div>

            {/* Community List Grid */}
            {communityLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="diamond diamond-md diamond-spinner" />
                <span className="ml-4 terminal-text text-[var(--color-text-muted)]">LOADING COMMUNITY LISTS...</span>
              </div>
            ) : communityLists.length === 0 ? (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-12 text-center">
                <Globe className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
                <p className="text-[var(--color-text-secondary)] text-lg mb-2">No community tier lists yet</p>
                <p className="text-[var(--color-text-muted)] text-sm mb-4">Be the first to share your rankings with the community!</p>
                {user ? (
                  <button
                    onClick={() => { setActiveTab('builder'); setShowSubmitModal(true); }}
                    className="px-6 py-2 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-[var(--color-accent)]/90 transition-colors inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Publish Your Tier List
                  </button>
                ) : (
                  <a
                    href="/login?returnTo=/tier-list"
                    className="px-6 py-2 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-[var(--color-accent)]/90 transition-colors inline-flex items-center gap-2"
                  >
                    Log in to Publish
                  </a>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communityLists.map(list => (
                  <div
                    key={list.documentId}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5 hover:border-[var(--color-accent)]/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-base truncate">{list.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)]">
                            {list.category}
                          </span>
                          <span className="text-xs text-[var(--color-text-muted)]">by {list.author}</span>
                          {list.isOfficial && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-[#FFE500]/15 text-[#FFE500] border border-[#FFE500]/30 font-bold">OFFICIAL</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpvote(list)}
                        disabled={votedIds.has(list.documentId)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border transition-colors shrink-0 ${
                          votedIds.has(list.documentId)
                            ? 'border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                            : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {list.upvotes}
                      </button>
                    </div>

                    {list.description && (
                      <p className="text-sm text-[var(--color-text-secondary)] mb-3 line-clamp-2">{list.description}</p>
                    )}

                    {/* Preview of top tiers */}
                    <div className="space-y-1 mb-3">
                      {['SS', 'S', 'A'].map(tier => {
                        const names = list.rankings[tier] || [];
                        if (names.length === 0) return null;
                        return (
                          <div key={tier} className="flex items-center gap-2">
                            <span className="text-xs font-bold w-6" style={{ color: TIER_LABEL_COLORS[tier] }}>{tier}</span>
                            <div className="flex gap-1 flex-wrap">
                              {names.slice(0, 5).map(name => {
                                const icon = CHARACTER_ICONS[name];
                                return icon ? (
                                  <Image key={name} src={icon} alt={name} width={24} height={24} className="border border-[var(--color-border)]" />
                                ) : (
                                  <span key={name} className="text-[10px] text-[var(--color-text-muted)] px-1 bg-[var(--color-surface-2)] border border-[var(--color-border)]">{name}</span>
                                );
                              })}
                              {names.length > 5 && (
                                <span className="text-[10px] text-[var(--color-text-muted)] px-1 self-center">+{names.length - 5}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        {new Date(list.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => loadCommunityList(list)}
                        className="text-xs px-3 py-1.5 border border-[var(--color-accent)]/30 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-3 h-3" />
                        Load This List
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'builder' && (<>
        {/* ─── Filters ─── */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5 mb-6 space-y-4 shadow-[var(--shadow-card)]">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search characters..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Rarity */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[var(--color-text-muted)] w-16 shrink-0 uppercase tracking-wider">Rarity</span>
            <FilterPill label="All" active={!filterRarity} onClick={() => setFilterRarity(null)} />
            {RARITIES.map(r => (
              <FilterPill
                key={r}
                label={`${r}★`}
                active={filterRarity === r}
                onClick={() => setFilterRarity(filterRarity === r ? null : r)}
                color={r === 6 ? '#FFD429' : r === 5 ? '#C084FC' : '#3498DB'}
              />
            ))}
          </div>

          {/* Element */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[var(--color-text-muted)] w-16 shrink-0 uppercase tracking-wider">Element</span>
            <FilterPill label="All" active={!filterElement} onClick={() => setFilterElement(null)} />
            {ELEMENTS.map(e => (
              <FilterPill
                key={e}
                label={e}
                active={filterElement === e}
                onClick={() => setFilterElement(filterElement === e ? null : e)}
                color={ELEMENT_COLORS[e]}
              />
            ))}
          </div>

          {/* Role */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[var(--color-text-muted)] w-16 shrink-0 uppercase tracking-wider">Role</span>
            <FilterPill label="All" active={!filterRole} onClick={() => setFilterRole(null)} />
            {ROLES.map(r => (
              <FilterPill
                key={r}
                label={r}
                active={filterRole === r}
                onClick={() => setFilterRole(filterRole === r ? null : r)}
              />
            ))}
          </div>

          {/* Weapon */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[var(--color-text-muted)] w-16 shrink-0 uppercase tracking-wider">Weapon</span>
            <FilterPill label="All" active={!filterWeapon} onClick={() => setFilterWeapon(null)} />
            {WEAPON_TYPES.map(w => (
              <FilterPill
                key={w}
                label={w}
                active={filterWeapon === w}
                onClick={() => setFilterWeapon(filterWeapon === w ? null : w)}
              />
            ))}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 text-xs font-bold border border-[#FF4444]/50 bg-[#FF4444]/10 text-[#FF4444] hover:bg-[#FF4444]/20 transition-colors flex items-center gap-1.5 ml-auto"
              >
                <X size={12} />
                Reset
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <p className="text-sm text-[var(--color-text-muted)]">
              Showing <span className="text-[var(--color-accent)] font-bold">{visibleCharacters.size}</span> of {CHARACTERS.length} characters
              {' '}-- non-matching characters are dimmed
            </p>
          )}
        </div>

        {/* Selected character indicator */}
        {selectedCharacter && (
          <div className="sticky top-0 z-30 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/40 clip-corner-tl px-4 py-2 mb-3 flex items-center justify-between backdrop-blur-sm">
            <span className="text-sm text-[var(--color-accent)] font-bold">
              {selectedCharacter} selected -- click a tier to place
            </span>
            <button
              onClick={() => setSelectedCharacter(null)}
              className="text-xs px-3 py-1 border border-[var(--color-accent)]/40 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ─── Tier List + Bench Sidebar Layout ─── */}
        <div className="flex gap-4">
          {/* Main Tier List */}
          <div className="flex-1 min-w-0">
            <div ref={tierListRef} className="space-y-1">
              {TIERS.map(tier => (
                <div
                  key={tier}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(tier)}
                  onClick={() => handleTierClick(tier)}
                  className={`p-4 ${TIER_COLORS[tier]} transition-all ${selectedCharacter ? 'cursor-pointer hover:brightness-125 hover:ring-1 hover:ring-[var(--color-accent)]/40' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 flex-shrink-0 flex flex-col items-center">
                      <div className="text-4xl font-bold" style={{ color: TIER_LABEL_COLORS[tier] }}>{tier}</div>
                      <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
                        {tierList[tier]?.length || 0}
                      </div>
                    </div>
                    <div className="flex-1 min-h-[80px]">
                      <div className="flex flex-wrap gap-2">
                        {tierList[tier]?.map(charName => (
                          <CharacterCard key={charName} charName={charName} currentTier={tier} />
                        ))}
                        {(!tierList[tier] || tierList[tier].length === 0) && (
                          <div className={`flex items-center justify-center w-full min-h-[80px] text-[var(--color-text-muted)] text-sm border border-dashed clip-corner-tl ${selectedCharacter ? 'border-[var(--color-accent)]/40 text-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}>
                            {selectedCharacter ? `Click to place ${selectedCharacter} here` : 'Drop operators here'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Unranked Characters */}
            {tierList.Unranked && tierList.Unranked.length > 0 && (
              <div
                onDragOver={handleDragOver}
                onDrop={() => handleDrop('Unranked')}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 mt-6"
              >
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-[var(--color-text-muted)]">UNRANKED</span>
                  <span className="text-xs text-[var(--color-text-muted)] font-normal">({tierList.Unranked.length})</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tierList.Unranked.map(charName => (
                    <CharacterCard key={charName} charName={charName} currentTier="Unranked" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── Bench (Sticky Scrolling Sidebar) ─── */}
          <div className="hidden xl:block w-64 shrink-0">
            <div
              className="sticky top-4 max-h-[calc(100vh-2rem)] flex flex-col"
            >
              <div
                onDragOver={handleDragOver}
                onDrop={() => handleDrop('Bench')}
                onClick={() => handleTierClick('Bench')}
                className={`flex flex-col bg-[var(--color-surface)] border border-dashed border-[var(--color-accent)]/30 clip-corner-tl transition-all overflow-hidden ${selectedCharacter ? 'cursor-pointer hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5' : ''}`}
              >
                <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] shrink-0">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="text-[var(--color-accent)]">BENCH</span>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-normal">
                      {tierList.Bench?.length ? `(${tierList.Bench.length})` : ''}
                    </span>
                  </h2>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Park operators while rearranging</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[200px]">
                  {tierList.Bench && tierList.Bench.length > 0 ? (
                    tierList.Bench.map(charName => (
                      <CharacterCard key={charName} charName={charName} currentTier="Bench" />
                    ))
                  ) : (
                    <div className={`flex items-center justify-center min-h-[120px] text-xs border border-dashed clip-corner-tl p-3 text-center ${selectedCharacter ? 'border-[var(--color-accent)]/40 text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
                      {selectedCharacter ? `Click to bench ${selectedCharacter}` : 'Drop or click operators here to hold them temporarily'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bench (Mobile/Tablet fallback - shown below on smaller screens) ─── */}
        <div className="xl:hidden mt-4">
          <div
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('Bench')}
            onClick={() => handleTierClick('Bench')}
            className={`bg-[var(--color-surface)] border border-dashed border-[var(--color-accent)]/30 clip-corner-tl p-4 transition-all ${selectedCharacter ? 'cursor-pointer hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5' : ''}`}
          >
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[var(--color-accent)]">BENCH</span>
              <span className="text-xs text-[var(--color-text-muted)] font-normal">
                Temporary holding area
                {tierList.Bench?.length ? ` (${tierList.Bench.length})` : ''}
              </span>
            </h2>
            {tierList.Bench && tierList.Bench.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tierList.Bench.map(charName => (
                  <CharacterCard key={charName} charName={charName} currentTier="Bench" />
                ))}
              </div>
            ) : (
              <div className={`flex items-center justify-center min-h-[60px] text-sm border border-dashed clip-corner-tl ${selectedCharacter ? 'border-[var(--color-accent)]/40 text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
                {selectedCharacter ? `Click to bench ${selectedCharacter}` : 'Park operators here while rearranging'}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 text-sm">
          <h3 className="font-bold text-white mb-2">How to use:</h3>
          <ul className="space-y-1 text-[var(--color-text-secondary)]">
            <li>-- Click an operator to pick them up, then click a tier row to place them</li>
            <li>-- Drag and drop operators between tiers to customize rankings</li>
            <li>-- Hover over an operator and click tier buttons for quick assignment</li>
            <li>-- Use the Bench to temporarily hold operators while rearranging</li>
            <li>-- Use filters above to highlight specific characters by element, role, rarity, or weapon</li>
            <li>-- Click Save to store your customized tier list in local storage</li>
            <li>-- Click Reset to restore community consensus default rankings</li>
            <li>-- Export as image or share your tier list via link</li>
            <li>-- Switch to Community Lists tab to browse and load rankings shared by others</li>
          </ul>
          <p className="mt-3 text-[var(--color-text-muted)] text-xs">
            Default rankings based on community consensus from Mobalytics, Prydwen, Game8, and community discussion. The default tier list is managed by site admins and updated regularly as the meta evolves.
          </p>
        </div>
        </>)}
      </div>

      {/* ─── Submit Modal ─── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowSubmitModal(false)}>
          <div
            className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Publish Tier List</h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-[var(--color-text-muted)] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider block mb-1.5">Title *</label>
                <input
                  type="text"
                  value={submitTitle}
                  onChange={e => setSubmitTitle(e.target.value)}
                  placeholder="My Endfield Tier List"
                  maxLength={100}
                  className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider block mb-1.5">Category *</label>
                <div className="relative">
                  <select
                    value={submitCategory}
                    onChange={e => setSubmitCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:border-[var(--color-accent)] appearance-none"
                  >
                    {['Overall', 'DPS', 'Support', 'Tank', 'PvE', 'Boss', 'Factory'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider block mb-1.5">Description (optional)</label>
                <textarea
                  value={submitDescription}
                  onChange={e => setSubmitDescription(e.target.value)}
                  placeholder="Brief explanation of your ranking rationale..."
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:border-[var(--color-accent)] resize-none"
                />
              </div>

              <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-3">
                <p className="text-xs text-[var(--color-text-muted)]">
                  This will publish your current tier list rankings (SS through D) to the community. Your username ({user?.username}) will be shown as the author.
                </p>
              </div>

              {submitStatus === 'success' && (
                <div className="bg-green-500/10 border border-green-500/30 p-3 text-sm text-green-400">
                  Tier list published successfully!
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                  Failed to publish. Please try again.
                </div>
              )}

              <button
                onClick={handleSubmitTierList}
                disabled={submitStatus === 'submitting' || !submitTitle.trim()}
                className="w-full px-6 py-2.5 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-[var(--color-accent)]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                {submitStatus === 'submitting' ? 'Publishing...' : 'Publish to Community'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
      )}
    </div>
  );
}
