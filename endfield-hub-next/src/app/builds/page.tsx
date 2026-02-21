'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Users, Plus, Search, X, Heart, Eye, Trash2, Edit3, Copy,
  Shield, Sword as SwordIcon, Star, BookOpen, ChevronRight,
  Bookmark, BookmarkCheck, Play, Filter, ArrowUpDown, Clock,
  Flame, Video, UserPlus, AlertCircle, Globe, Lock
} from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { CHARACTERS, WEAPONS, ELEMENTS, ROLES, WEAPON_TYPES } from '@/lib/data';
import { CHARACTER_ICONS, WEAPON_ICONS, EQUIPMENT_ICONS, PROFESSION_ICONS } from '@/lib/assets';
import { ELEMENT_COLORS, RARITY_COLORS } from '@/types/game';
import type { Character, Element, Role, WeaponType } from '@/types/game';
import {
  GEAR_SETS, STANDALONE_GEAR, EQUIPMENT_SET_NAMES,
  BUILD_TAGS, STRATEGY_TAGS, ALL_TAGS, MAX_TEAM_SIZE, MAX_TAGS,
  MAX_PARTNERS, MAX_SHORT_DESC, SAMPLE_BUILDS, getYouTubeThumbnail,
  getFavoriteBuildIds, toggleFavoriteBuild, isBuildFavorited,
  getMyBuilds, saveMyBuilds,
  isBuildLiked, toggleLikeBuild, getBuildLikeCount, getBuildViewCount,
} from '@/data/builds';
import { TIER_COLORS } from '@/data/gear';
import type { Build, BuildCharacter, BuildGuide, RecommendedPartner, BrowseFilter, BuildEquipmentSlot } from '@/data/builds';
import type { GearPiece } from '@/data/gear';
import { useAuthStore } from '@/store/authStore';
import RelatedTools from '@/components/seo/RelatedTools';

type ViewMode = 'browse' | 'create' | 'my-builds';

function BuildsPageContent() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Derive viewMode from URL — searchParams is the single source of truth
  const urlView = searchParams.get('view');
  const resolvedView: ViewMode = (urlView === 'create' || urlView === 'my-builds') ? urlView : 'browse';
  const [viewMode, setViewMode] = useState<ViewMode>(resolvedView);

  // Sync viewMode whenever URL query params change (sidebar navigation, back/forward)
  const searchString = searchParams.toString();
  useEffect(() => {
    const v = new URLSearchParams(searchString).get('view');
    const target: ViewMode = (v === 'create' || v === 'my-builds') ? v : 'browse';
    setViewMode(target);
  }, [searchString]);

  // Navigate to a view and update the URL to keep sidebar highlighting in sync
  const navigateView = useCallback((view: ViewMode) => {
    setViewMode(view);
    router.replace(view === 'browse' ? '/builds' : `/builds?view=${view}`, { scroll: false });
  }, [router]);

  const [browseFilter, setBrowseFilter] = useState<BrowseFilter>('popular');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('char') || '');
  const [filterTag, setFilterTag] = useState('');
  const [myBuilds, setMyBuilds] = useState<Build[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [myBuildsTab, setMyBuildsTab] = useState<'created' | 'favorited'>('created');
  const [myBuildsSort, setMyBuildsSort] = useState<'newest' | 'oldest' | 'most-liked' | 'alphabetical'>('newest');

  // Create form state
  const [createTab, setCreateTab] = useState<'single' | 'team'>('single');
  const [buildName, setBuildName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [buildNotes, setBuildNotes] = useState('');
  const [buildTags, setBuildTags] = useState<string[]>([]);
  const [buildCharacters, setBuildCharacters] = useState<BuildCharacter[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [editingBuildId, setEditingBuildId] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [recommendedPartners, setRecommendedPartners] = useState<RecommendedPartner[]>([]);
  const [partnerReason, setPartnerReason] = useState('');

  // Guide form state
  const [guideOverview, setGuideOverview] = useState('');
  const [guideRotation, setGuideRotation] = useState<string[]>([]);
  const [guideTips, setGuideTips] = useState<string[]>([]);
  const [guideInvestment, setGuideInvestment] = useState<'Low' | 'Medium' | 'High' | ''>('');
  const [guideDifficulty, setGuideDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | ''>('');

  // Pickers
  const [showCharPicker, setShowCharPicker] = useState(false);
  const [charPickerSlot, setCharPickerSlot] = useState(0);
  const [charSearch, setCharSearch] = useState('');
  const [charFilterElement, setCharFilterElement] = useState<Element | ''>('');
  const [charFilterRole, setCharFilterRole] = useState<Role | ''>('');
  const [charFilterRarity, setCharFilterRarity] = useState<number | ''>('');

  const [showWeaponPicker, setShowWeaponPicker] = useState(false);
  const [weaponPickerSlot, setWeaponPickerSlot] = useState(0);
  const [weaponSearch, setWeaponSearch] = useState('');
  const [weaponFilterType, setWeaponFilterType] = useState<WeaponType | ''>('');

  const [showEquipPicker, setShowEquipPicker] = useState(false);
  const [equipPickerSlot, setEquipPickerSlot] = useState(0);

  const [showPartnerPicker, setShowPartnerPicker] = useState(false);
  const [partnerSearch, setPartnerSearch] = useState('');

  // Create form section toggle
  const [showGuideSection, setShowGuideSection] = useState(false);

  // Load saved data
  useEffect(() => {
    setMyBuilds(getMyBuilds());
    setFavoriteIds(getFavoriteBuildIds());
  }, []);

  const saveBuildsAndUpdate = useCallback((builds: Build[]) => {
    setMyBuilds(builds);
    saveMyBuilds(builds);
  }, []);

  // All builds = sample + my public builds
  const allBuilds = useMemo(() => {
    const pub = myBuilds.filter(b => b.isPublic);
    return [...SAMPLE_BUILDS, ...pub];
  }, [myBuilds]);

  // Filtered browse builds
  const filteredBuilds = useMemo(() => {
    let builds = allBuilds;
    if (browseFilter === 'teams') builds = builds.filter(b => b.type === 'team');
    if (browseFilter === 'single') builds = builds.filter(b => b.type === 'single');
    if (browseFilter === 'has-video') builds = builds.filter(b => !!b.youtubeUrl);
    if (filterTag) {
      builds = builds.filter(b => b.tags.includes(filterTag));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      builds = builds.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.characters.some(c => c.name.toLowerCase().includes(q)) ||
        b.tags.some(t => t.toLowerCase().includes(q)) ||
        b.author?.toLowerCase().includes(q) ||
        b.shortDescription?.toLowerCase().includes(q)
      );
    }
    if (browseFilter === 'popular') builds = [...builds].sort((a, b) => getBuildLikeCount(b.id) - getBuildLikeCount(a.id));
    if (browseFilter === 'latest') builds = [...builds].sort((a, b) => b.createdAt - a.createdAt);
    return builds;
  }, [allBuilds, browseFilter, searchQuery, filterTag]);

  // Favorited builds for My Builds tab
  const favoritedBuilds = useMemo(() => {
    return allBuilds.filter(b => favoriteIds.includes(b.id));
  }, [allBuilds, favoriteIds]);

  // Sorted My Builds (Created tab) - excludes most-liked since these are user's own builds
  const sortedMyBuilds = useMemo(() => {
    const builds = [...myBuilds];
    if (myBuildsSort === 'newest') {
      return builds.sort((a, b) => b.createdAt - a.createdAt);
    }
    if (myBuildsSort === 'oldest') {
      return builds.sort((a, b) => a.createdAt - b.createdAt);
    }
    if (myBuildsSort === 'alphabetical') {
      return builds.sort((a, b) => a.name.localeCompare(b.name));
    }
    return builds;
  }, [myBuilds, myBuildsSort]);

  // Sorted Favorited Builds - includes most-liked option
  const sortedFavoritedBuilds = useMemo(() => {
    const builds = [...favoritedBuilds];
    if (myBuildsSort === 'newest') {
      return builds.sort((a, b) => b.createdAt - a.createdAt);
    }
    if (myBuildsSort === 'oldest') {
      return builds.sort((a, b) => a.createdAt - b.createdAt);
    }
    if (myBuildsSort === 'most-liked') {
      return builds.sort((a, b) => getBuildLikeCount(b.id) - getBuildLikeCount(a.id));
    }
    if (myBuildsSort === 'alphabetical') {
      return builds.sort((a, b) => a.name.localeCompare(b.name));
    }
    return builds;
  }, [favoritedBuilds, myBuildsSort]);

  // Character picker
  const filteredChars = useMemo(() => {
    return CHARACTERS.filter(c => {
      if (charSearch && !c.Name.toLowerCase().includes(charSearch.toLowerCase())) return false;
      if (charFilterElement && c.Element !== charFilterElement) return false;
      if (charFilterRole && c.Role !== charFilterRole) return false;
      if (charFilterRarity && c.Rarity !== charFilterRarity) return false;
      const alreadySelected = buildCharacters.filter((_, i) => i !== charPickerSlot).map(bc => bc.name);
      if (alreadySelected.includes(c.Name)) return false;
      return true;
    }).sort((a, b) => b.Rarity - a.Rarity || a.Name.localeCompare(b.Name));
  }, [charSearch, charFilterElement, charFilterRole, charFilterRarity, buildCharacters, charPickerSlot]);

  // Weapon picker
  const filteredWeapons = useMemo(() => {
    const selectedChar = buildCharacters[weaponPickerSlot];
    const charData = selectedChar ? CHARACTERS.find(c => c.Name === selectedChar.name) : null;
    return WEAPONS.filter(w => {
      if (weaponSearch && !w.Name.toLowerCase().includes(weaponSearch.toLowerCase())) return false;
      if (weaponFilterType && w.WeaponType !== weaponFilterType) return false;
      if (charData && w.WeaponType !== charData.WeaponType) return false;
      return true;
    }).sort((a, b) => b.Rarity - a.Rarity || a.Name.localeCompare(b.Name));
  }, [weaponSearch, weaponFilterType, buildCharacters, weaponPickerSlot]);

  // Partner picker
  const filteredPartnerChars = useMemo(() => {
    const alreadyInBuild = buildCharacters.map(bc => bc.name);
    const alreadyPartner = recommendedPartners.map(p => p.name);
    return CHARACTERS.filter(c => {
      if (partnerSearch && !c.Name.toLowerCase().includes(partnerSearch.toLowerCase())) return false;
      if (alreadyInBuild.includes(c.Name)) return false;
      if (alreadyPartner.includes(c.Name)) return false;
      return true;
    }).sort((a, b) => b.Rarity - a.Rarity || a.Name.localeCompare(b.Name));
  }, [partnerSearch, buildCharacters, recommendedPartners]);

  const maxSlots = createTab === 'team' ? MAX_TEAM_SIZE : 1;

  const openCharPicker = (slot: number) => {
    setCharPickerSlot(slot);
    setCharSearch('');
    setCharFilterElement('');
    setCharFilterRole('');
    setCharFilterRarity('');
    setShowCharPicker(true);
  };

  const selectCharacter = (charName: string) => {
    const newChars = [...buildCharacters];
    const charData = CHARACTERS.find(c => c.Name === charName);
    if (charPickerSlot < newChars.length) {
      const oldChar = CHARACTERS.find(c => c.Name === newChars[charPickerSlot].name);
      if (oldChar && charData && oldChar.WeaponType !== charData.WeaponType) {
        newChars[charPickerSlot] = { name: charName, equipment: newChars[charPickerSlot].equipment };
      } else {
        newChars[charPickerSlot] = { ...newChars[charPickerSlot], name: charName };
      }
    } else {
      newChars.push({ name: charName });
    }
    setBuildCharacters(newChars);
    setShowCharPicker(false);
  };

  const openWeaponPicker = (slot: number) => {
    setWeaponPickerSlot(slot);
    setWeaponSearch('');
    setWeaponFilterType('');
    setShowWeaponPicker(true);
  };

  const selectWeapon = (weaponName: string) => {
    const newChars = [...buildCharacters];
    if (newChars[weaponPickerSlot]) {
      newChars[weaponPickerSlot] = { ...newChars[weaponPickerSlot], weapon: weaponName };
      setBuildCharacters(newChars);
    }
    setShowWeaponPicker(false);
  };

  const openEquipPicker = (slot: number) => {
    setEquipPickerSlot(slot);
    setShowEquipPicker(true);
  };

  const selectEquipment = (piece: GearPiece, setName: string) => {
    const newChars = [...buildCharacters];
    if (newChars[equipPickerSlot]) {
      const char = { ...newChars[equipPickerSlot] };
      // Add piece to equipmentPieces array (max 3)
      const pieces = [...(char.equipmentPieces || [])];
      if (pieces.length < 3) {
        pieces.push({ pieceName: piece.name, setName: setName || undefined, artificeLevel: 0 });
      }
      char.equipmentPieces = pieces;
      // Also set legacy field to the primary set name for backward compat
      const primarySet = pieces.find(p => p.setName)?.setName;
      if (primarySet) char.equipment = primarySet;
      newChars[equipPickerSlot] = char;
      setBuildCharacters(newChars);
    }
    setShowEquipPicker(false);
  };

  const removeEquipmentPiece = (charIdx: number, pieceIdx: number) => {
    const newChars = [...buildCharacters];
    if (newChars[charIdx]) {
      const char = { ...newChars[charIdx] };
      const pieces = [...(char.equipmentPieces || [])];
      pieces.splice(pieceIdx, 1);
      char.equipmentPieces = pieces;
      const primarySet = pieces.find(p => p.setName)?.setName;
      char.equipment = primarySet || '';
      newChars[charIdx] = char;
      setBuildCharacters(newChars);
    }
  };

  const addPartner = (name: string) => {
    if (recommendedPartners.length >= MAX_PARTNERS) return;
    setRecommendedPartners([...recommendedPartners, { name, reason: '' }]);
    setShowPartnerPicker(false);
    setPartnerSearch('');
  };

  const updatePartnerReason = (idx: number, reason: string) => {
    const updated = [...recommendedPartners];
    updated[idx] = { ...updated[idx], reason };
    setRecommendedPartners(updated);
  };

  const removePartner = (idx: number) => {
    setRecommendedPartners(recommendedPartners.filter((_, i) => i !== idx));
  };

  const removeCharacter = (slot: number) => {
    setBuildCharacters(buildCharacters.filter((_, i) => i !== slot));
  };

  const toggleTag = (tag: string) => {
    if (buildTags.includes(tag)) {
      setBuildTags(buildTags.filter(t => t !== tag));
    } else if (buildTags.length < MAX_TAGS) {
      setBuildTags([...buildTags, tag]);
    }
  };

  const addRotationStep = () => setGuideRotation([...guideRotation, '']);
  const updateRotationStep = (idx: number, val: string) => {
    const updated = [...guideRotation];
    updated[idx] = val;
    setGuideRotation(updated);
  };
  const removeRotationStep = (idx: number) => setGuideRotation(guideRotation.filter((_, i) => i !== idx));

  const addTip = () => setGuideTips([...guideTips, '']);
  const updateTip = (idx: number, val: string) => {
    const updated = [...guideTips];
    updated[idx] = val;
    setGuideTips(updated);
  };
  const removeTip = (idx: number) => setGuideTips(guideTips.filter((_, i) => i !== idx));

  const resetForm = () => {
    setBuildName('');
    setShortDescription('');
    setBuildNotes('');
    setBuildTags([]);
    setBuildCharacters([]);
    setIsPublic(true);
    setEditingBuildId(null);
    setYoutubeUrl('');
    setRecommendedPartners([]);
    setPartnerReason('');
    setGuideOverview('');
    setGuideRotation([]);
    setGuideTips([]);
    setGuideInvestment('');
    setGuideDifficulty('');
    setShowGuideSection(false);
  };

  const saveBuild = () => {
    if (!buildName.trim() || buildCharacters.length === 0) return;
    const now = Date.now();
    const guide: BuildGuide | undefined = (guideOverview || guideRotation.length > 0 || guideTips.length > 0)
      ? {
          overview: guideOverview || undefined,
          rotation: guideRotation.filter(s => s.trim()) || undefined,
          tips: guideTips.filter(s => s.trim()) || undefined,
          investment: guideInvestment || undefined,
          difficulty: guideDifficulty || undefined,
        }
      : undefined;

    if (editingBuildId) {
      const updated = myBuilds.map(b => b.id === editingBuildId ? {
        ...b,
        name: buildName,
        type: createTab,
        characters: buildCharacters,
        tags: buildTags,
        notes: buildNotes,
        shortDescription,
        isPublic,
        updatedAt: now,
        youtubeUrl: youtubeUrl || undefined,
        recommendedPartners: recommendedPartners.length > 0 ? recommendedPartners : undefined,
        partnerReason: partnerReason || undefined,
        guide,
      } : b);
      saveBuildsAndUpdate(updated);
    } else {
      const newBuild: Build = {
        id: `build-${now}`,
        name: buildName,
        type: createTab,
        characters: buildCharacters,
        tags: buildTags,
        notes: buildNotes,
        shortDescription,
        isPublic,
        likes: 0,
        views: 0,
        createdAt: now,
        updatedAt: now,
        author: user?.username || 'Anonymous',
        authorId: user?.id,
        youtubeUrl: youtubeUrl || undefined,
        recommendedPartners: recommendedPartners.length > 0 ? recommendedPartners : undefined,
        partnerReason: partnerReason || undefined,
        guide,
      };
      saveBuildsAndUpdate([...myBuilds, newBuild]);
    }
    resetForm();
    navigateView('my-builds');
  };

  const editBuild = (build: Build) => {
    setEditingBuildId(build.id);
    setBuildName(build.name);
    setCreateTab(build.type);
    setBuildCharacters(build.characters);
    setBuildTags(build.tags);
    setBuildNotes(build.notes);
    setShortDescription(build.shortDescription || '');
    setIsPublic(build.isPublic);
    setYoutubeUrl(build.youtubeUrl || '');
    setRecommendedPartners(build.recommendedPartners || []);
    setPartnerReason(build.partnerReason || '');
    if (build.guide) {
      setGuideOverview(build.guide.overview || '');
      setGuideRotation(build.guide.rotation || []);
      setGuideTips(build.guide.tips || []);
      setGuideInvestment(build.guide.investment || '');
      setGuideDifficulty(build.guide.difficulty || '');
      setShowGuideSection(true);
    }
    navigateView('create');
  };

  const deleteBuild = (id: string) => {
    if (confirm('Delete this build?')) {
      saveBuildsAndUpdate(myBuilds.filter(b => b.id !== id));
    }
  };

  const duplicateBuild = (build: Build) => {
    const dup: Build = {
      ...build,
      id: `build-${Date.now()}`,
      name: `${build.name} (Copy)`,
      likes: 0,
      views: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      author: user?.username || 'Anonymous',
      authorId: user?.id,
      isPublic: false,
    };
    saveBuildsAndUpdate([...myBuilds, dup]);
  };

  const handleToggleFavorite = (buildId: string) => {
    const isFav = toggleFavoriteBuild(buildId);
    setFavoriteIds(getFavoriteBuildIds());
    return isFav;
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const days = Math.floor(diff / 86400000);
    if (days > 30) return formatDate(ts);
    if (days > 0) return `${days}d ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const getCharElement = (name: string) => CHARACTERS.find(c => c.Name === name)?.Element;
  const getCharRarity = (name: string) => CHARACTERS.find(c => c.Name === name)?.Rarity || 4;

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': 'Community Builds - Zero Sanity',
    'description': 'Create, share, and discover operator builds and team compositions for Arknights: Endfield. Browse community-created builds with detailed equipment, weapons, and strategy guides.',
    'url': 'https://www.zerosanity.app/builds',
  };

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <div className="max-w-6xl mx-auto">
        <RIOSHeader title="Community Builds" category="COMMUNITY" code="RIOS-BLD-001" icon={<Users size={28} />}
          subtitle="Create, share, and discover operator builds and team compositions" />

        {/* Navigation tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-[var(--color-border)] pb-0">
          {[
            { key: 'browse' as ViewMode, label: 'Browse Builds', icon: <Search size={14} />, count: allBuilds.length },
            { key: 'my-builds' as ViewMode, label: 'My Builds', icon: <Bookmark size={14} />, count: myBuilds.length + favoritedBuilds.length },
            { key: 'create' as ViewMode, label: editingBuildId ? 'Edit Build' : 'Create Build', icon: <Plus size={14} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.key === 'create') resetForm();
                navigateView(tab.key);
              }}
              className={`px-4 py-2.5 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 -mb-[1px] ${
                viewMode === tab.key
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'border-transparent text-[var(--color-text-tertiary)] hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
              {tab.count !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 bg-[var(--color-surface-2)] font-mono">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ===== BROWSE VIEW ===== */}
        {viewMode === 'browse' && (
          <div>
            {/* Filter bar */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 mb-4">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {(['popular', 'latest', 'teams', 'single', 'has-video'] as BrowseFilter[]).map(f => (
                  <button key={f} onClick={() => setBrowseFilter(f)}
                    className={`px-3 py-1.5 text-xs font-bold clip-corner-tl transition-colors flex items-center gap-1.5 ${
                      browseFilter === f ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-white'
                    }`}>
                    {f === 'popular' && <Flame size={12} />}
                    {f === 'latest' && <Clock size={12} />}
                    {f === 'teams' && <Users size={12} />}
                    {f === 'single' && <Star size={12} />}
                    {f === 'has-video' && <Video size={12} />}
                    {f === 'has-video' ? 'Has Video' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search builds, operators, authors..."
                      className="w-full pl-9 pr-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-white placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] outline-none" />
                  </div>
                </div>
                <select value={filterTag} onChange={e => setFilterTag(e.target.value)}
                  className="px-2 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white outline-none cursor-pointer">
                  <option value="">All Tags</option>
                  <optgroup label="Game Stage">
                    {BUILD_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                  </optgroup>
                  <optgroup label="Strategy">
                    {STRATEGY_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="text-xs text-[var(--color-text-tertiary)] mb-3">
              {filteredBuilds.length} build{filteredBuilds.length !== 1 ? 's' : ''} found
            </div>

            {/* Build cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredBuilds.map(build => (
                <BuildCard
                  key={build.id}
                  build={build}
                  isFavorited={favoriteIds.includes(build.id)}
                  onToggleFavorite={() => handleToggleFavorite(build.id)}
                  onDuplicate={() => duplicateBuild(build)}
                  formatTimeAgo={formatTimeAgo}
                />
              ))}
            </div>
            {filteredBuilds.length === 0 && (
              <div className="text-center py-16 text-[var(--color-text-tertiary)]">
                <Users size={48} className="mx-auto mb-4 opacity-30" />
                <p className="mb-2">No builds found matching your search.</p>
                <button onClick={() => { setSearchQuery(''); setFilterTag(''); setBrowseFilter('popular'); }}
                  className="text-xs text-[var(--color-accent)] hover:underline">Clear filters</button>
              </div>
            )}
          </div>
        )}

        {/* ===== MY BUILDS VIEW ===== */}
        {viewMode === 'my-builds' && !user && (
          <div className="rios-card clip-corner-tl p-8 text-center space-y-4">
            <span className="diamond diamond-md diamond-accent mx-auto block" />
            <h3 className="text-xl font-bold text-white font-tactical uppercase">Access Restricted</h3>
            <p className="text-[var(--color-text-secondary)]">Create an account to save and manage your builds.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/signup?returnTo=%2Fbuilds%3Fview%3Dmy-builds" className="px-6 py-2 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-yellow-300 transition-colors">Sign Up</Link>
              <Link href="/login?returnTo=%2Fbuilds%3Fview%3Dmy-builds" className="px-6 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors">Log In</Link>
            </div>
          </div>
        )}
        {viewMode === 'my-builds' && !!user && (
          <div>
            {/* CTA Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {/* Create Build Card */}
              <button
                onClick={() => { navigateView('create'); resetForm(); }}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5 hover:border-[var(--color-accent)] transition-all text-left group"
              >
                <Plus className="mb-3 text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors" size={32} />
                <div className="font-bold text-white text-base mb-1">Create Build</div>
                <div className="text-xs text-[var(--color-text-tertiary)] mb-3">Share your strategies with the community</div>
                <span className="inline-block px-3 py-1 bg-[var(--color-accent)] text-black text-xs font-bold clip-corner-tl">QUICK</span>
              </button>

              {/* Browse Builds Card */}
              <button
                onClick={() => navigateView('browse')}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5 hover:border-[var(--color-accent)] transition-all text-left group"
              >
                <Users className="mb-3 text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors" size={32} />
                <div className="font-bold text-white text-base mb-1">Browse Builds</div>
                <div className="text-xs text-[var(--color-text-tertiary)]">Discover builds from the community</div>
              </button>
            </div>

            {/* Header with tabs and sort */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-bold text-[var(--color-text-secondary)]">MY BUILDS</h2>
                <div className="flex gap-3 text-xs">
                  <button
                    onClick={() => setMyBuildsTab('created')}
                    className={`font-bold transition-colors ${
                      myBuildsTab === 'created' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)] hover:text-white'
                    }`}
                  >
                    Created ({sortedMyBuilds.length})
                  </button>
                  <span className="text-[var(--color-border)]">|</span>
                  <button
                    onClick={() => setMyBuildsTab('favorited')}
                    className={`font-bold transition-colors ${
                      myBuildsTab === 'favorited' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)] hover:text-white'
                    }`}
                  >
                    Favorited ({sortedFavoritedBuilds.length})
                  </button>
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={myBuildsSort}
                  onChange={(e) => setMyBuildsSort(e.target.value as any)}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-xs px-3 py-1.5 pr-8 clip-corner-tl appearance-none cursor-pointer hover:border-[var(--color-accent)] transition-colors"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  {myBuildsTab === 'favorited' && <option value="most-liked">Most Liked</option>}
                  <option value="alphabetical">A-Z</option>
                </select>
                <ArrowUpDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-tertiary)]" />
              </div>
            </div>

            {/* Created Tab */}
            {myBuildsTab === 'created' && (
              <>
                {sortedMyBuilds.length === 0 ? (
                  <div className="text-center py-20 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl">
                    <Plus size={64} className="mx-auto mb-4 text-[var(--color-text-tertiary)] opacity-20" />
                    <p className="text-white font-bold mb-2">No builds yet</p>
                    <p className="text-sm text-[var(--color-text-tertiary)] mb-6 max-w-md mx-auto">
                      Share your strategies with the community and help others master Endfield
                    </p>
                    <button
                      onClick={() => { navigateView('create'); resetForm(); }}
                      className="px-6 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-black font-bold clip-corner-tl transition-colors"
                    >
                      Create Your First Build
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sortedMyBuilds.map(build => {
                      const likeCount = getBuildLikeCount(build.id);
                      return (
                        <div key={build.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden hover:border-[var(--color-accent)]/50 transition-colors">
                          {/* Character portraits row - TALLER (96px) */}
                          <div className="flex bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
                            {build.characters.map((bc, i) => {
                              const icon = CHARACTER_ICONS[bc.name];
                              const rarity = getCharRarity(bc.name);
                              return (
                                <div key={i} className="w-24 h-24 relative flex-shrink-0"
                                  style={{ borderBottom: `3px solid ${RARITY_COLORS[rarity] || '#666'}` }}>
                                  {icon ? (
                                    <Image src={icon} alt={bc.name} fill className="object-cover" unoptimized sizes="96px" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">{bc.name}</div>
                                  )}
                                </div>
                              );
                            })}
                            <div className="flex-1" />
                          </div>

                          <div className="p-3">
                            {/* Badge pills row at TOP */}
                            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                              {build.isPublic ? (
                                <span className="text-[10px] px-1.5 py-0.5 bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-bold flex items-center gap-0.5">
                                  <Globe size={8} /> PUBLIC
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] font-bold flex items-center gap-0.5">
                                  <Lock size={8} /> PRIVATE
                                </span>
                              )}
                              <span className={`text-[10px] px-1.5 py-0.5 font-bold ${build.type === 'team' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                {build.type === 'team' ? 'TEAM' : 'SINGLE'}
                              </span>
                              {build.youtubeUrl && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 font-bold flex items-center gap-0.5">
                                  <Play size={8} /> VIDEO
                                </span>
                              )}
                            </div>

                            {/* Title + timestamp */}
                            <div className="mb-2">
                              <h3 className="text-white font-bold text-sm mb-1">{build.name}</h3>
                              <span className="text-[10px] text-[var(--color-text-tertiary)]">
                                {formatTimeAgo(build.updatedAt)}
                              </span>
                            </div>

                            {/* Description */}
                            {build.shortDescription && (
                              <p className="text-[11px] text-[var(--color-text-tertiary)] mb-3 line-clamp-2">
                                {build.shortDescription}
                              </p>
                            )}

                            {/* Stats row - ONLY likes, no views for user builds */}
                            <div className="flex items-center gap-3 mb-3 text-[10px]">
                              <span className="flex items-center gap-1 text-[var(--color-text-tertiary)]">
                                <Heart size={10} className={likeCount > 0 ? 'text-red-400' : ''} /> {likeCount}
                              </span>
                            </div>

                            {/* User-defined content tags at bottom */}
                            {build.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {build.tags.map(t => (
                                  <span key={t} className="text-[9px] px-1.5 py-0.5 bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)]">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Action buttons row */}
                            <div className="flex gap-1 justify-end pt-2 border-t border-[var(--color-border)]">
                              <Link
                                href={`/builds/${build.id}`}
                                className="p-1.5 hover:bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors"
                                title="View"
                              >
                                <Eye size={14} />
                              </Link>
                              <button
                                onClick={() => editBuild(build)}
                                className="p-1.5 hover:bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors"
                                title="Edit"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => duplicateBuild(build)}
                                className="p-1.5 hover:bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] hover:text-blue-400 transition-colors"
                                title="Duplicate"
                              >
                                <Copy size={14} />
                              </button>
                              <button
                                onClick={() => deleteBuild(build.id)}
                                className="p-1.5 hover:bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Favorited Tab */}
            {myBuildsTab === 'favorited' && (
              <>
                {sortedFavoritedBuilds.length === 0 ? (
                  <div className="text-center py-20 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl">
                    <Bookmark size={64} className="mx-auto mb-4 text-[var(--color-text-tertiary)] opacity-20" />
                    <p className="text-white font-bold mb-2">No saved builds</p>
                    <p className="text-sm text-[var(--color-text-tertiary)] mb-6 max-w-md mx-auto">
                      Discover and save builds from the community to access them quickly
                    </p>
                    <button
                      onClick={() => navigateView('browse')}
                      className="px-6 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-black font-bold clip-corner-tl transition-colors"
                    >
                      Browse Builds
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sortedFavoritedBuilds.map(build => (
                      <BuildCard
                        key={build.id}
                        build={build}
                        isFavorited={true}
                        onToggleFavorite={() => handleToggleFavorite(build.id)}
                        onDuplicate={() => duplicateBuild(build)}
                        formatTimeAgo={formatTimeAgo}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== CREATE/EDIT VIEW ===== */}
        {viewMode === 'create' && (
          <div className="space-y-4">
            {/* Single / Team toggle */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">
                  {editingBuildId ? 'Edit Build' : 'Create New Build'}
                </h2>
                <div className="flex gap-1">
                  <button onClick={() => { setCreateTab('single'); setBuildCharacters(buildCharacters.slice(0, 1)); }}
                    className={`px-4 py-2 text-sm font-bold clip-corner-tl ${createTab === 'single' ? 'bg-green-600 text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'}`}>
                    Single Character
                  </button>
                  <button onClick={() => setCreateTab('team')}
                    className={`px-4 py-2 text-sm font-bold clip-corner-tl ${createTab === 'team' ? 'bg-blue-600 text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'}`}>
                    Team (up to {MAX_TEAM_SIZE})
                  </button>
                </div>
              </div>

              {/* Build name */}
              <div className="mb-4">
                <label className="block text-xs text-[var(--color-text-tertiary)] mb-1 uppercase tracking-wide">Build Name *</label>
                <input type="text" value={buildName} onChange={e => setBuildName(e.target.value)} maxLength={60}
                  placeholder="e.g., Laevatain Hypercarry, Cryo Freeze Team"
                  className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] outline-none" />
              </div>

              {/* Public toggle */}
              <div className="flex items-center gap-3">
                <button onClick={() => setIsPublic(!isPublic)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${isPublic ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}>
                  <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all"
                    style={{ left: isPublic ? '22px' : '2px' }} />
                </button>
                <span className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  {isPublic ? <><Globe size={14} /> Make Public</> : <><Lock size={14} /> Private</>}
                </span>
              </div>
            </div>

            {/* Character slots */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5">
              <label className="block text-xs text-[var(--color-text-tertiary)] mb-3 uppercase tracking-wide">
                {createTab === 'team' ? `Team Characters (${buildCharacters.length}/${maxSlots})` : 'Character *'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {buildCharacters.map((bc, i) => {
                  const charData = CHARACTERS.find(c => c.Name === bc.name);
                  const icon = CHARACTER_ICONS[bc.name];
                  const weaponIcon = bc.weapon ? WEAPON_ICONS[bc.weapon] : null;
                  const equipIcon = bc.equipment ? EQUIPMENT_ICONS[bc.equipment] : null;
                  const elem = charData?.Element;
                  const rarity = charData?.Rarity || 4;

                  return (
                    <div key={i} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-hidden"
                      style={{ borderLeft: `4px solid ${elem ? ELEMENT_COLORS[elem] : '#666'}` }}>
                      <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[var(--color-surface)]" onClick={() => openCharPicker(i)}>
                        <div className="w-14 h-14 relative flex-shrink-0 bg-black/30"
                          style={{ borderBottom: `3px solid ${RARITY_COLORS[rarity] || '#666'}` }}>
                          {icon ? (
                            <Image src={icon} alt={bc.name} fill className="object-cover" unoptimized sizes="56px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">?</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm truncate">{bc.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-tertiary)]">
                            {charData && (
                              <>
                                <span style={{ color: ELEMENT_COLORS[charData.Element] }}>{charData.Element}</span>
                                <span>{charData.Role}</span>
                                <span>{charData.WeaponType}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); removeCharacter(i); }}
                          className="p-1 text-[var(--color-text-tertiary)] hover:text-red-400">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex border-t border-[var(--color-border)]">
                        <button onClick={() => openWeaponPicker(i)}
                          className="flex-1 flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-surface)] border-r border-[var(--color-border)] text-left">
                          {weaponIcon ? (
                            <Image src={weaponIcon} alt={bc.weapon || ''} width={24} height={24} className="w-6 h-6 object-contain" unoptimized />
                          ) : (
                            <SwordIcon size={14} className="text-[var(--color-text-tertiary)]" />
                          )}
                          <span className="text-[10px] text-[var(--color-text-tertiary)] truncate">{bc.weapon || 'Select Weapon'}</span>
                        </button>
                        <button onClick={() => openEquipPicker(i)}
                          className="flex-1 flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-surface)] text-left">
                          <Shield size={14} className="text-[var(--color-text-tertiary)]" />
                          <span className="text-[10px] text-[var(--color-text-tertiary)] truncate">
                            {(bc.equipmentPieces?.length || 0) > 0 ? `${bc.equipmentPieces!.length}/3 gear` : 'Add Gear'}
                          </span>
                        </button>
                      </div>
                      {/* Individual gear pieces display */}
                      {bc.equipmentPieces && bc.equipmentPieces.length > 0 && (
                        <div className="border-t border-[var(--color-border)] px-2 py-1.5 flex flex-wrap gap-1">
                          {bc.equipmentPieces.map((ep, pi) => (
                            <div key={pi} className="flex items-center gap-1 px-1.5 py-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[9px]">
                              <span className="text-white truncate max-w-[100px]">{ep.pieceName}</span>
                              <button onClick={e => { e.stopPropagation(); removeEquipmentPiece(i, pi); }}
                                className="text-[var(--color-text-tertiary)] hover:text-red-400 ml-0.5"><X size={10} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {buildCharacters.length < maxSlots && (
                  <button onClick={() => openCharPicker(buildCharacters.length)}
                    className="h-[106px] border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] flex flex-col items-center justify-center gap-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors">
                    <Plus size={24} />
                    <span className="text-xs">Add Operator</span>
                  </button>
                )}
              </div>
            </div>

            {/* Recommended Partners */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5">
              <label className="block text-xs text-[var(--color-text-tertiary)] mb-3 uppercase tracking-wide flex items-center gap-2">
                <UserPlus size={14} /> Other Recommended Partners ({recommendedPartners.length}/{MAX_PARTNERS})
              </label>
              <div className="space-y-2 mb-3">
                {recommendedPartners.map((partner, i) => {
                  const icon = CHARACTER_ICONS[partner.name];
                  const charData = CHARACTERS.find(c => c.Name === partner.name);
                  return (
                    <div key={i} className="flex items-center gap-2 bg-[var(--color-surface-2)] p-2 border border-[var(--color-border)]">
                      <div className="w-8 h-8 relative flex-shrink-0 bg-black/30">
                        {icon ? (
                          <Image src={icon} alt={partner.name} fill className="object-cover" unoptimized sizes="32px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-[var(--color-text-tertiary)]">{partner.name}</div>
                        )}
                      </div>
                      <span className="text-xs text-white font-bold min-w-[80px]">{partner.name}</span>
                      {charData && <span className="text-[10px] px-1 py-0.5 bg-black/30" style={{ color: ELEMENT_COLORS[charData.Element] }}>{charData.Element}</span>}
                      <input
                        type="text"
                        value={partner.reason || ''}
                        onChange={e => updatePartnerReason(i, e.target.value)}
                        placeholder="Why this partner?"
                        className="flex-1 px-2 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] text-[11px] text-white placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] outline-none"
                      />
                      <button onClick={() => removePartner(i)} className="p-1 text-[var(--color-text-tertiary)] hover:text-red-400">
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
              {recommendedPartners.length < MAX_PARTNERS && (
                <button onClick={() => { setPartnerSearch(''); setShowPartnerPicker(true); }}
                  className="w-full py-2 border border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] flex items-center justify-center gap-1.5 transition-colors">
                  <Plus size={12} /> Add Recommended Partner
                </button>
              )}
              {recommendedPartners.length > 0 && (
                <div className="mt-3">
                  <label className="block text-[10px] text-[var(--color-text-tertiary)] mb-1 uppercase">Why these partners?</label>
                  <textarea value={partnerReason} onChange={e => setPartnerReason(e.target.value)} rows={2}
                    placeholder="Explain why these partners work well with this build..."
                    className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-[11px] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] outline-none resize-none" />
                </div>
              )}
            </div>

            {/* Short Description + Tags + YouTube */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5">
              <div className="mb-4">
                <label className="block text-xs text-[var(--color-text-tertiary)] mb-1 uppercase tracking-wide">Short Description ({shortDescription.length}/{MAX_SHORT_DESC})</label>
                <textarea value={shortDescription} onChange={e => setShortDescription(e.target.value.slice(0, MAX_SHORT_DESC))} rows={2}
                  placeholder="Brief description shown on build cards in browse view..."
                  className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] outline-none resize-none" />
              </div>

              {/* Tags */}
              <div className="mb-4">
                <label className="block text-xs text-[var(--color-text-tertiary)] mb-2 uppercase tracking-wide">Tags (max {MAX_TAGS})</label>
                <div className="mb-2">
                  <p className="text-[10px] text-[var(--color-text-tertiary)] mb-1.5">Game Stage</p>
                  <div className="flex flex-wrap gap-1.5">
                    {BUILD_TAGS.map(tag => (
                      <button key={tag} onClick={() => toggleTag(tag)}
                        className={`px-2 py-1 text-xs font-bold transition-colors ${
                          buildTags.includes(tag) ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] hover:text-white'
                        } ${buildTags.length >= MAX_TAGS && !buildTags.includes(tag) ? 'opacity-40 cursor-not-allowed' : ''}`}
                        disabled={buildTags.length >= MAX_TAGS && !buildTags.includes(tag)}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] mb-1.5">Strategy</p>
                  <div className="flex flex-wrap gap-1.5">
                    {STRATEGY_TAGS.map(tag => (
                      <button key={tag} onClick={() => toggleTag(tag)}
                        className={`px-2 py-1 text-xs font-bold transition-colors ${
                          buildTags.includes(tag) ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] hover:text-white'
                        } ${buildTags.length >= MAX_TAGS && !buildTags.includes(tag) ? 'opacity-40 cursor-not-allowed' : ''}`}
                        disabled={buildTags.length >= MAX_TAGS && !buildTags.includes(tag)}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* YouTube */}
              <div>
                <label className="block text-xs text-[var(--color-text-tertiary)] mb-1 uppercase tracking-wide flex items-center gap-1.5">
                  <Play size={12} /> YouTube Video (optional)
                </label>
                <input type="text" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] outline-none" />
                {youtubeUrl && getYouTubeThumbnail(youtubeUrl) && (
                  <div className="mt-2 relative w-40 h-24 bg-black/30 border border-[var(--color-border)]">
                    <Image src={getYouTubeThumbnail(youtubeUrl)!} alt="Video thumbnail" fill className="object-cover" unoptimized sizes="160px" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <Play size={14} className="text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Build Guide (collapsible) */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl">
              <button onClick={() => setShowGuideSection(!showGuideSection)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-[var(--color-surface-2)] transition-colors">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen size={16} className="text-[var(--color-accent)]" />
                  Build Guide (optional)
                </span>
                <ChevronRight size={16} className={`text-[var(--color-text-tertiary)] transition-transform ${showGuideSection ? 'rotate-90' : ''}`} />
              </button>

              {showGuideSection && (
                <div className="p-5 pt-0 space-y-4 border-t border-[var(--color-border)]">
                  {/* Overview */}
                  <div>
                    <label className="block text-xs text-[var(--color-text-tertiary)] mb-1 uppercase tracking-wide">Overview / Build Guide</label>
                    <textarea value={guideOverview} onChange={e => setGuideOverview(e.target.value)} rows={6}
                      placeholder="Write a detailed guide for this build. Explain the strategy, why this equipment works, and how to play it..."
                      className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] outline-none resize-y" />
                  </div>

                  {/* Investment / Difficulty */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[var(--color-text-tertiary)] mb-1 uppercase">Investment Level</label>
                      <select value={guideInvestment} onChange={e => setGuideInvestment(e.target.value as typeof guideInvestment)}
                        className="w-full px-2 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white outline-none">
                        <option value="">Not specified</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--color-text-tertiary)] mb-1 uppercase">Difficulty</label>
                      <select value={guideDifficulty} onChange={e => setGuideDifficulty(e.target.value as typeof guideDifficulty)}
                        className="w-full px-2 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white outline-none">
                        <option value="">Not specified</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Rotation steps */}
                  <div>
                    <label className="block text-xs text-[var(--color-text-tertiary)] mb-2 uppercase tracking-wide">Combat Rotation</label>
                    <div className="space-y-2">
                      {guideRotation.map((step, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-[10px] text-[var(--color-accent)] font-bold mt-2 w-5 text-center">{i + 1}</span>
                          <input type="text" value={step} onChange={e => updateRotationStep(i, e.target.value)}
                            placeholder={`Step ${i + 1}...`}
                            className="flex-1 px-2 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] outline-none" />
                          <button onClick={() => removeRotationStep(i)} className="p-1 text-[var(--color-text-tertiary)] hover:text-red-400 mt-0.5">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={addRotationStep}
                      className="mt-2 text-[10px] text-[var(--color-accent)] hover:underline flex items-center gap-1">
                      <Plus size={10} /> Add rotation step
                    </button>
                  </div>

                  {/* Tips */}
                  <div>
                    <label className="block text-xs text-[var(--color-text-tertiary)] mb-2 uppercase tracking-wide">Tips</label>
                    <div className="space-y-2">
                      {guideTips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-[10px] text-[var(--color-text-tertiary)] mt-2">&#8226;</span>
                          <input type="text" value={tip} onChange={e => updateTip(i, e.target.value)}
                            placeholder="Add a tip..."
                            className="flex-1 px-2 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] outline-none" />
                          <button onClick={() => removeTip(i)} className="p-1 text-[var(--color-text-tertiary)] hover:text-red-400 mt-0.5">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={addTip}
                      className="mt-2 text-[10px] text-[var(--color-accent)] hover:underline flex items-center gap-1">
                      <Plus size={10} /> Add tip
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5">
              <label className="block text-xs text-[var(--color-text-tertiary)] mb-1 uppercase tracking-wide">Additional Notes</label>
              <textarea value={buildNotes} onChange={e => setBuildNotes(e.target.value)} rows={3} maxLength={500}
                placeholder="Any additional context, disclaimers, or notes..."
                className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] outline-none resize-none" />
            </div>

            {/* Save / Cancel */}
            <div className="flex gap-3">
              <button onClick={saveBuild}
                disabled={!buildName.trim() || buildCharacters.length === 0}
                className="px-8 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-600/30 disabled:cursor-not-allowed text-white font-bold text-sm clip-corner-tl transition-colors flex items-center gap-2">
                {editingBuildId ? <><Edit3 size={14} /> Save Changes</> : <><Plus size={14} /> Create Build</>}
              </button>
              <button onClick={() => { resetForm(); navigateView('browse'); }}
                className="px-6 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white text-sm clip-corner-tl transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== CHARACTER PICKER MODAL ===== */}
      {showCharPicker && (
        <PickerModal title="Select Operator" onClose={() => setShowCharPicker(false)}>
          <div className="p-4 border-b border-[var(--color-border)] space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              <input type="text" value={charSearch} onChange={e => setCharSearch(e.target.value)}
                placeholder="Search operators..."
                className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] outline-none" />
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={charFilterRarity} onChange={e => setCharFilterRarity(e.target.value ? Number(e.target.value) : '')}
                className="px-2 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white outline-none">
                <option value="">All Rarities</option>
                <option value="6">6-Star</option><option value="5">5-Star</option><option value="4">4-Star</option>
              </select>
              <select value={charFilterElement} onChange={e => setCharFilterElement(e.target.value as Element | '')}
                className="px-2 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white outline-none">
                <option value="">All Elements</option>
                {ELEMENTS.map(el => <option key={el} value={el}>{el}</option>)}
              </select>
              <select value={charFilterRole} onChange={e => setCharFilterRole(e.target.value as Role | '')}
                className="px-2 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white outline-none">
                <option value="">All Roles</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {filteredChars.map(char => {
                const icon = CHARACTER_ICONS[char.Name];
                const profIcon = PROFESSION_ICONS[char.Role];
                return (
                  <button key={char.Name} onClick={() => selectCharacter(char.Name)}
                    className="bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] overflow-hidden transition-colors group">
                    <div className="aspect-square relative">
                      {icon ? (
                        <Image src={icon} alt={char.Name} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized sizes="120px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">{char.Name}</div>
                      )}
                      {profIcon && (
                        <div className="absolute top-1 left-1 w-5 h-5 bg-black/60">
                          <Image src={profIcon} alt={char.Role} fill className="object-contain p-0.5" unoptimized sizes="20px" />
                        </div>
                      )}
                      <div className="absolute top-1 right-1 w-3 h-3 rounded-full" style={{ backgroundColor: ELEMENT_COLORS[char.Element] }} />
                    </div>
                    <div className="px-1 py-1" style={{ borderTop: `2px solid ${RARITY_COLORS[char.Rarity] || '#666'}` }}>
                      <p className="text-[10px] text-white text-center truncate">{char.Name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {filteredChars.length === 0 && (
              <p className="text-center text-sm text-[var(--color-text-tertiary)] py-8">No operators match your filters.</p>
            )}
          </div>
        </PickerModal>
      )}

      {/* ===== WEAPON PICKER MODAL ===== */}
      {showWeaponPicker && (
        <PickerModal title="Select Weapon" onClose={() => setShowWeaponPicker(false)}>
          <div className="p-4 border-b border-[var(--color-border)] space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              <input type="text" value={weaponSearch} onChange={e => setWeaponSearch(e.target.value)}
                placeholder="Search weapons..."
                className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] outline-none" />
            </div>
            {!buildCharacters[weaponPickerSlot] || !CHARACTERS.find(c => c.Name === buildCharacters[weaponPickerSlot]?.name) ? (
              <div className="flex flex-wrap gap-1">
                {WEAPON_TYPES.map(wt => (
                  <button key={wt} onClick={() => setWeaponFilterType(weaponFilterType === wt ? '' : wt)}
                    className={`px-2 py-1 text-xs ${weaponFilterType === wt ? 'bg-[var(--color-accent)] text-black font-bold' : 'bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)]'}`}>
                    {wt}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-[var(--color-text-tertiary)]">
                Showing {CHARACTERS.find(c => c.Name === buildCharacters[weaponPickerSlot]?.name)?.WeaponType} weapons (matches operator)
              </p>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {filteredWeapons.map(wpn => {
                const icon = WEAPON_ICONS[wpn.Name];
                return (
                  <button key={wpn.Name} onClick={() => selectWeapon(wpn.Name)}
                    className="bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] overflow-hidden transition-colors group">
                    <div className="aspect-square relative bg-black/20">
                      {icon ? (
                        <Image src={icon} alt={wpn.Name} fill className="object-contain p-2 group-hover:scale-105 transition-transform" unoptimized sizes="120px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">{wpn.Name}</div>
                      )}
                    </div>
                    <div className="px-1 py-1" style={{ borderTop: `2px solid ${RARITY_COLORS[wpn.Rarity] || '#666'}` }}>
                      <p className="text-[10px] text-white text-center truncate">{wpn.Name}</p>
                      <p className="text-[8px] text-center text-[var(--color-text-tertiary)]">{wpn.WeaponType}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {filteredWeapons.length === 0 && (
              <p className="text-center text-sm text-[var(--color-text-tertiary)] py-8">No weapons match your filters.</p>
            )}
          </div>
        </PickerModal>
      )}

      {/* ===== EQUIPMENT PICKER MODAL (Individual Pieces) ===== */}
      {showEquipPicker && (
        <PickerModal title="Select Equipment Piece" onClose={() => setShowEquipPicker(false)} maxWidth="max-w-2xl">
          <div className="p-3 border-b border-[var(--color-border)]">
            <p className="text-[10px] text-[var(--color-text-tertiary)]">
              Select individual gear pieces. Each set has multiple armor, glove, and accessory options with different stats.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {GEAR_SETS.map(set => (
              <div key={set.name} className="border border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
                {/* Set header */}
                <div className="flex items-center gap-3 p-3 border-b border-[var(--color-border)]/50">
                  <div className="w-10 h-10 relative flex-shrink-0">
                    {set.icon ? (
                      <Image src={set.icon} alt={set.name} fill className="object-contain" unoptimized sizes="40px" />
                    ) : (
                      <Shield size={20} className="text-[var(--color-text-tertiary)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white font-bold">{set.name}</p>
                      <span className="text-[9px] px-1 font-bold" style={{ backgroundColor: TIER_COLORS[set.pieces[0]?.tier || 'T4'] + '20', color: TIER_COLORS[set.pieces[0]?.tier || 'T4'] }}>{set.pieces[0]?.tier}</span>
                      <span className="text-[9px] text-[var(--color-text-tertiary)]">{set.pieces.length} pieces</span>
                    </div>
                    <p className="text-[9px] text-[var(--color-text-tertiary)] line-clamp-1">{set.setBonus.slice(0, 100)}...</p>
                  </div>
                </div>
                {/* Individual pieces */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-2">
                  {set.pieces.map(piece => {
                    const existingPieces = buildCharacters[equipPickerSlot]?.equipmentPieces || [];
                    const alreadySelected = existingPieces.some(ep => ep.pieceName === piece.name);
                    return (
                      <button key={piece.id} onClick={() => !alreadySelected && selectEquipment(piece, set.name)}
                        disabled={alreadySelected}
                        className={`flex items-center gap-2 p-2 border transition-colors text-left ${alreadySelected ? 'border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 opacity-60 cursor-not-allowed' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'}`}
                      >
                        <div className="w-8 h-8 relative flex-shrink-0 bg-[var(--color-surface)]" style={{ borderLeft: `2px solid ${TIER_COLORS[piece.tier]}` }}>
                          {piece.icon && <Image src={piece.icon} alt={piece.name} fill className="object-contain p-0.5" unoptimized sizes="32px" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-white truncate">{piece.name}</p>
                          <div className="text-[9px] text-[var(--color-text-tertiary)] flex flex-wrap gap-x-1.5">
                            <span>DEF {piece.def}</span>
                            {piece.stats.map((s, i) => (
                              <span key={i}>{s.name} <span className="text-[var(--color-accent)]">{s.value}</span></span>
                            ))}
                          </div>
                        </div>
                        {alreadySelected && <span className="text-[8px] text-[var(--color-accent)] font-bold">EQUIPPED</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {/* Standalone pieces */}
            {STANDALONE_GEAR.length > 0 && (
              <div className="border border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
                <div className="flex items-center gap-3 p-3 border-b border-[var(--color-border)]/50">
                  <Star size={20} className="text-[var(--color-text-tertiary)]" />
                  <div>
                    <p className="text-sm text-white font-bold">Standalone Pieces</p>
                    <p className="text-[9px] text-[var(--color-text-tertiary)]">{STANDALONE_GEAR.length} pieces (no set bonus)</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-2">
                  {STANDALONE_GEAR.filter(p => p.tier === 'T4' || p.tier === 'T3').map(piece => {
                    const existingPieces = buildCharacters[equipPickerSlot]?.equipmentPieces || [];
                    const alreadySelected = existingPieces.some(ep => ep.pieceName === piece.name);
                    return (
                      <button key={piece.id} onClick={() => !alreadySelected && selectEquipment(piece, '')}
                        disabled={alreadySelected}
                        className={`flex items-center gap-2 p-2 border transition-colors text-left ${alreadySelected ? 'border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 opacity-60 cursor-not-allowed' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'}`}
                      >
                        <div className="w-8 h-8 relative flex-shrink-0 bg-[var(--color-surface)]" style={{ borderLeft: `2px solid ${TIER_COLORS[piece.tier]}` }}>
                          {piece.icon && <Image src={piece.icon} alt={piece.name} fill className="object-contain p-0.5" unoptimized sizes="32px" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-white truncate">{piece.name}</p>
                          <div className="text-[9px] text-[var(--color-text-tertiary)] flex flex-wrap gap-x-1.5">
                            <span style={{ color: TIER_COLORS[piece.tier] }}>{piece.tier}</span>
                            <span>DEF {piece.def}</span>
                            {piece.stats.map((s, i) => (
                              <span key={i}>{s.name} <span className="text-[var(--color-accent)]">{s.value}</span></span>
                            ))}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </PickerModal>
      )}

      {/* ===== PARTNER PICKER MODAL ===== */}
      {showPartnerPicker && (
        <PickerModal title="Add Recommended Partner" onClose={() => setShowPartnerPicker(false)}>
          <div className="p-4 border-b border-[var(--color-border)]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              <input type="text" value={partnerSearch} onChange={e => setPartnerSearch(e.target.value)}
                placeholder="Search operators..."
                className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {filteredPartnerChars.map(char => {
                const icon = CHARACTER_ICONS[char.Name];
                return (
                  <button key={char.Name} onClick={() => addPartner(char.Name)}
                    className="bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] overflow-hidden transition-colors group">
                    <div className="aspect-square relative">
                      {icon ? (
                        <Image src={icon} alt={char.Name} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized sizes="120px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">{char.Name}</div>
                      )}
                      <div className="absolute top-1 right-1 w-3 h-3 rounded-full" style={{ backgroundColor: ELEMENT_COLORS[char.Element] }} />
                    </div>
                    <div className="px-1 py-1" style={{ borderTop: `2px solid ${RARITY_COLORS[char.Rarity] || '#666'}` }}>
                      <p className="text-[10px] text-white text-center truncate">{char.Name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </PickerModal>
      )}

      {/* Related Tools - shown on all views */}
      <RelatedTools
        tools={[
          { name: 'Tier List', path: '/tier-list', desc: 'See meta rankings for all operators' },
          { name: 'Team Builder', path: '/team-builder', desc: 'Interactive team composition tool' },
          { name: 'Characters', path: '/characters', desc: 'Browse all operators and their stats' },
          { name: 'Gear Artificing', path: '/gear-artificing', desc: 'Optimize equipment for your builds' },
        ]}
      />
    </div>
  );
}

export default function BuildsPage() {
  return (
    <Suspense>
      <BuildsPageContent />
    </Suspense>
  );
}

// ===== Reusable Picker Modal =====
function PickerModal({ title, onClose, maxWidth, children }: {
  title: string;
  onClose: () => void;
  maxWidth?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rios-modal-backdrop" onClick={onClose}>
      <div className={`rios-modal-panel ${maxWidth === 'max-w-lg' ? 'rios-modal-md' : maxWidth === 'max-w-xl' ? 'rios-modal-lg' : 'rios-modal-lg'}`}
        onClick={e => e.stopPropagation()}>
        <div className="rios-modal-header">
          <h3 className="text-white font-bold">{title}</h3>
          <button onClick={onClose} className="text-[var(--color-text-tertiary)] hover:text-white"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ===== Build Card Component =====
function BuildCard({ build, isFavorited, onToggleFavorite, onDuplicate, formatTimeAgo }: {
  build: Build;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onDuplicate: () => void;
  formatTimeAgo: (ts: number) => string;
}) {
  const ytThumb = build.youtubeUrl ? getYouTubeThumbnail(build.youtubeUrl) : null;
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    setLiked(isBuildLiked(build.id));
    const storedLikes = getBuildLikeCount(build.id);
    setLikeCount(storedLikes || build.likes || 0);
    const storedViews = getBuildViewCount(build.id);
    setViewCount(storedViews || build.views || 0);
  }, [build.id, build.likes, build.views]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleLikeBuild(build.id);
    setLiked(result.liked);
    setLikeCount(result.count);
  };

  return (
    <div className={`bg-[var(--color-surface)] border clip-corner-tl overflow-hidden transition-all border-[var(--color-border)] hover:border-[var(--color-accent)]/50`}>
      {/* Character portraits row */}
      <div className="flex bg-[var(--color-surface-2)] relative">
        {build.characters.map((bc, i) => {
          const icon = CHARACTER_ICONS[bc.name];
          const rarity = CHARACTERS.find(c => c.Name === bc.name)?.Rarity || 4;
          const elem = CHARACTERS.find(c => c.Name === bc.name)?.Element;
          return (
            <div key={i} className="relative" style={{ width: `${100 / Math.max(build.characters.length, 1)}%`, maxWidth: '25%' }}>
              <div className="aspect-square relative">
                {icon ? (
                  <Image src={icon} alt={bc.name} fill className="object-cover" unoptimized sizes="150px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-text-tertiary)] bg-[var(--color-surface)]">{bc.name}</div>
                )}
                {elem && <div className="absolute top-1 right-1 w-3 h-3 rounded-full border border-black/30" style={{ backgroundColor: ELEMENT_COLORS[elem] }} />}
              </div>
              <div className="h-0.5" style={{ backgroundColor: RARITY_COLORS[rarity] || '#666' }} />
            </div>
          );
        })}
        {build.characters.length < 4 && build.type === 'team' && (
          <div className="flex-1 bg-[var(--color-surface)] opacity-30" />
        )}

        {/* Video indicator */}
        {ytThumb && (
          <div className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 flex items-center gap-0.5">
            <Play size={8} fill="white" /> VIDEO
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(); }}
          className={`absolute top-1 right-1 p-1.5 transition-colors ${
            isFavorited ? 'text-[var(--color-accent)]' : 'text-white/50 hover:text-[var(--color-accent)]'
          }`}
        >
          {isFavorited ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>

      {/* Build info */}
      <Link href={`/builds/${build.id}`} className="block p-3 hover:bg-[var(--color-surface-2)] transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm truncate">{build.name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-[10px] px-1.5 py-0.5 font-bold ${build.type === 'team' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                {build.type === 'team' ? 'TEAM' : 'SINGLE'}
              </span>
              {build.tags.slice(0, 3).map(t => (
                <span key={t} className="text-[9px] px-1.5 py-0.5 bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)]">{t}</span>
              ))}
              {build.tags.length > 3 && (
                <span className="text-[9px] text-[var(--color-text-tertiary)]">+{build.tags.length - 3}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-0.5 text-[10px] shrink-0">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 transition-colors ${liked ? 'text-red-400' : 'text-[var(--color-text-tertiary)] hover:text-red-400'}`}
              title={liked ? 'Remove like' : 'Like this build'}
            >
              <Heart size={10} className={liked ? 'fill-current' : ''} /> {likeCount.toLocaleString()}
            </button>
            <span className="flex items-center gap-1 text-[var(--color-text-tertiary)]"><Eye size={10} /> {viewCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Short description */}
        {build.shortDescription && (
          <p className="text-[11px] text-[var(--color-text-tertiary)] mt-2 line-clamp-2 leading-relaxed">{build.shortDescription}</p>
        )}

        {/* Footer meta */}
        <div className="flex items-center justify-between mt-2 text-[10px] text-[var(--color-text-tertiary)]">
          <span>by {build.author || 'Community'}</span>
          <span>{formatTimeAgo(build.updatedAt)}</span>
        </div>
      </Link>
    </div>
  );
}
