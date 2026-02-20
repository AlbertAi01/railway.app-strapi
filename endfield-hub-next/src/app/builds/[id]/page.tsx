'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, Heart, Eye, Copy, Share2, Star, Users, ChevronRight, Zap,
  Target, AlertTriangle, TrendingUp, Wrench, BookOpen, RotateCcw, Lightbulb,
  Shield, Sword as SwordIcon, Play, Bookmark, BookmarkCheck, UserPlus,
  MessageCircle, Clock, Globe
} from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { CHARACTERS, WEAPONS } from '@/lib/data';
import { CHARACTER_BANNERS, CHARACTER_ICONS, WEAPON_ICONS, EQUIPMENT_ICONS, PROFESSION_ICONS } from '@/lib/assets';
import { WEAPON_DATA } from '@/data/weapons';
import { WEAPON_ESSENCES, getEssenceTierLabel } from '@/data/essences';
import { GEAR_SETS } from '@/data/gear';
import {
  SAMPLE_BUILDS, getYouTubeEmbedUrl, getYouTubeThumbnail,
  isBuildFavorited, toggleFavoriteBuild, getMyBuilds,
  isBuildLiked, toggleLikeBuild, getBuildLikeCount,
  recordBuildView, getBuildViewCount,
} from '@/data/builds';
import type { Build } from '@/data/builds';
import { ELEMENT_COLORS, RARITY_COLORS } from '@/types/game';
import type { Element } from '@/types/game';

export default function BuildDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [build, setBuild] = useState<Build | null>(null);
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'loadout' | 'guide'>('overview');
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    let foundBuild = SAMPLE_BUILDS.find(b => b.id === id);

    if (!foundBuild) {
      const myBuilds = getMyBuilds();
      foundBuild = myBuilds.find(b => b.id === id);
    }

    if (foundBuild) {
      setBuild(foundBuild);
      setFavorited(isBuildFavorited(id));
      setLiked(isBuildLiked(id));
      setLikeCount(getBuildLikeCount(id));
      // Record view (deduplicated per session)
      const newViewCount = recordBuildView(id);
      setViewCount(newViewCount);
    } else {
      router.push('/builds');
    }
  }, [params.id, router]);

  const copyToMyBuilds = () => {
    if (!build) return;
    const saved = localStorage.getItem('endfield-my-builds');
    const myBuilds: Build[] = saved ? JSON.parse(saved) : [];
    const newBuild: Build = {
      ...build,
      id: `build-${Date.now()}`,
      name: `${build.name} (Copy)`,
      likes: 0,
      views: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPublic: false,
    };
    myBuilds.push(newBuild);
    localStorage.setItem('endfield-my-builds', JSON.stringify(myBuilds));
    alert('Build copied to My Builds!');
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleFavorite = () => {
    if (!build) return;
    const isFav = toggleFavoriteBuild(build.id);
    setFavorited(isFav);
  };

  const handleToggleLike = () => {
    if (!build) return;
    const result = toggleLikeBuild(build.id);
    setLiked(result.liked);
    setLikeCount(result.count);
  };

  if (!build) {
    return (
      <div className="min-h-screen text-[var(--color-text-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="diamond diamond-md diamond-spinner mx-auto mb-4" />
          <p className="terminal-text">LOADING BUILD DATA...</p>
        </div>
      </div>
    );
  }

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

  const elementCounts: Record<string, number> = {};
  const roleCounts: Record<string, number> = {};
  build.characters.forEach(bc => {
    const charData = CHARACTERS.find(c => c.Name === bc.name);
    if (charData) {
      elementCounts[charData.Element] = (elementCounts[charData.Element] || 0) + 1;
      roleCounts[charData.Role] = (roleCounts[charData.Role] || 0) + 1;
    }
  });

  const guide = build.guide;
  const hasGuide = guide && (guide.overview || guide.rotation || guide.tips);
  const embedUrl = build.youtubeUrl ? getYouTubeEmbedUrl(build.youtubeUrl) : null;
  const ytThumb = build.youtubeUrl ? getYouTubeThumbnail(build.youtubeUrl) : null;
  const hasPartners = build.recommendedPartners && build.recommendedPartners.length > 0;

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader
          title={build.name}
          category="BUILD GUIDE"
          code={`BLD-${build.id.toUpperCase().slice(0, 8)}`}
          icon={build.type === 'team' ? <Users size={28} /> : <Star size={28} />}
          subtitle={`${build.type === 'team' ? 'Team Composition' : 'Solo Build'} by ${build.author || 'Community'}`}
        />

        <Link
          href="/builds"
          className="inline-flex items-center gap-2 mb-6 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Builds
        </Link>

        {/* Hero header with character portraits */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden mb-6">
          {/* Character portraits banner */}
          <div className="relative h-28 sm:h-36 bg-gradient-to-r from-[var(--color-surface-2)] to-[var(--color-surface)]">
            <div className="absolute inset-0 flex">
              {build.characters.map((bc, i) => {
                const banner = CHARACTER_BANNERS[bc.name];
                const elem = CHARACTERS.find(c => c.Name === bc.name)?.Element;
                const elemColor = elem ? ELEMENT_COLORS[elem] : '#666';
                return (
                  <div key={i} className="relative flex-1 overflow-hidden" style={{ borderRight: i < build.characters.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    {banner && (
                      <Image src={banner} alt={bc.name} fill className="object-cover object-top opacity-40" unoptimized sizes="25vw" />
                    )}
                    <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${elemColor}10 0%, ${elemColor}30 100%)` }} />
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: elemColor }} />
                  </div>
                );
              })}
            </div>
            {/* Overlay character icons */}
            <div className="relative h-full flex items-end justify-center gap-3 pb-3 px-4">
              {build.characters.map((bc, i) => {
                const icon = CHARACTER_ICONS[bc.name];
                const charData = CHARACTERS.find(c => c.Name === bc.name);
                const rarityColor = charData ? RARITY_COLORS[charData.Rarity] : '#666';
                return (
                  <div key={i} className="text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 relative border-2 clip-corner-tl overflow-hidden bg-black/50 backdrop-blur-sm" style={{ borderColor: rarityColor }}>
                      {icon ? <Image src={icon} alt={bc.name} fill className="object-cover" unoptimized sizes="64px" /> : <div className="w-full h-full flex items-center justify-center text-[10px]">{bc.name}</div>}
                    </div>
                    <p className="text-[10px] text-white mt-1 font-bold truncate max-w-16 sm:max-w-20">{bc.name}</p>
                    {bc.role && <p className="text-[8px] text-[var(--color-accent)]">{bc.role}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Build meta info */}
          <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                {/* Short description */}
                {build.shortDescription && (
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-3">{build.shortDescription}</p>
                )}

                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`text-xs px-2 py-1 font-bold ${build.type === 'team' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                    {build.type === 'team' ? 'TEAM' : 'SINGLE'}
                  </span>
                  {guide?.investment && (
                    <span className={`text-xs px-2 py-1 font-bold ${guide.investment === 'High' ? 'bg-red-500/20 text-red-400' : guide.investment === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                      {guide.investment} Investment
                    </span>
                  )}
                  {guide?.difficulty && (
                    <span className={`text-xs px-2 py-1 font-bold ${guide.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' : guide.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                      {guide.difficulty} Difficulty
                    </span>
                  )}
                  {build.youtubeUrl && (
                    <span className="text-xs px-2 py-1 font-bold bg-red-500/20 text-red-400 flex items-center gap-1">
                      <Play size={10} fill="currentColor" /> VIDEO
                    </span>
                  )}
                  {build.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)]">{tag}</span>
                  ))}
                </div>
                {build.notes && (
                  <p className="text-sm text-[var(--color-text-tertiary)] leading-relaxed">{build.notes}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 text-sm shrink-0">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleToggleLike}
                    className={`flex items-center gap-1 transition-colors ${liked ? 'text-red-400' : 'text-[var(--color-text-tertiary)] hover:text-red-400'}`}
                    title={liked ? 'Remove like' : 'Like this build'}
                  >
                    <Heart size={14} className={liked ? 'fill-current' : ''} /> {likeCount.toLocaleString()}
                  </button>
                  <span className="flex items-center gap-1 text-[var(--color-text-tertiary)]"><Eye size={14} /> {viewCount.toLocaleString()}</span>
                </div>
                <div className="text-xs text-[var(--color-text-tertiary)]">by {build.author || 'Community'}</div>
                <div className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-1">
                  <Clock size={10} /> {formatTimeAgo(build.updatedAt)}
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button onClick={handleToggleFavorite}
                className={`px-4 py-2 text-sm font-bold clip-corner-tl transition-colors flex items-center gap-2 border ${
                  favorited
                    ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]'
                }`}>
                {favorited ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                {favorited ? 'Bookmarked' : 'Bookmark'}
              </button>
              <button onClick={copyToMyBuilds} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold clip-corner-tl transition-colors flex items-center gap-2">
                <Copy size={14} /> Copy to My Builds
              </button>
              <button onClick={copyShareLink} className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-white text-sm font-bold clip-corner-tl transition-colors flex items-center gap-2 border border-[var(--color-border)]">
                <Share2 size={14} /> {copied ? 'Copied!' : 'Share Link'}
              </button>
            </div>
          </div>
        </div>

        {/* YouTube Video Embed */}
        {embedUrl && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden mb-6">
            <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-2">
              <Play size={16} className="text-red-400" />
              <h3 className="text-white font-bold text-sm">Build Video</h3>
            </div>
            {showVideo ? (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Build video"
                />
              </div>
            ) : (
              <button onClick={() => setShowVideo(true)} className="relative w-full group">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  {ytThumb && (
                    <Image src={ytThumb} alt="Video thumbnail" fill className="object-cover" unoptimized sizes="100vw" />
                  )}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Play size={28} className="text-white ml-1" fill="white" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white text-sm font-bold bg-black/60 px-3 py-1.5 backdrop-blur-sm">
                    Click to play video
                  </div>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Recommended Partners */}
        {hasPartners && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5 mb-6">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2 uppercase tracking-wide">
              <UserPlus size={16} className="text-[var(--color-accent)]" />
              Recommended Partners
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-3">
              {build.recommendedPartners!.map((partner, i) => {
                const icon = CHARACTER_ICONS[partner.name];
                const charData = CHARACTERS.find(c => c.Name === partner.name);
                const elemColor = charData ? ELEMENT_COLORS[charData.Element] : '#666';
                const rarityColor = charData ? RARITY_COLORS[charData.Rarity] : '#666';
                return (
                  <div key={i} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-hidden hover:border-[var(--color-accent)]/50 transition-colors">
                    <div className="flex items-center gap-2 p-2">
                      <div className="w-10 h-10 relative flex-shrink-0 bg-black/30 clip-corner-tl overflow-hidden" style={{ borderBottom: `2px solid ${rarityColor}` }}>
                        {icon ? (
                          <Image src={icon} alt={partner.name} fill className="object-cover" unoptimized sizes="40px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-[var(--color-text-tertiary)]">{partner.name}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-bold truncate">{partner.name}</p>
                        {charData && (
                          <p className="text-[9px] font-bold" style={{ color: elemColor }}>{charData.Element}</p>
                        )}
                      </div>
                    </div>
                    {partner.reason && (
                      <div className="px-2 pb-2">
                        <p className="text-[10px] text-[var(--color-text-tertiary)] leading-relaxed line-clamp-2">{partner.reason}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {build.partnerReason && (
              <div className="p-3 border-l-2 border-[var(--color-accent)] bg-[var(--color-surface-2)]">
                <p className="text-xs text-[var(--color-text-tertiary)] mb-1 uppercase font-bold flex items-center gap-1.5">
                  <MessageCircle size={10} className="text-[var(--color-accent)]" />
                  Why these partners?
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{build.partnerReason}</p>
              </div>
            )}
          </div>
        )}

        {/* Tab navigation */}
        {hasGuide && (
          <div className="flex gap-1 mb-6 border-b border-[var(--color-border)] pb-0">
            {[
              { key: 'overview' as const, label: 'Guide', icon: <BookOpen size={14} /> },
              { key: 'loadout' as const, label: 'Loadout', icon: <SwordIcon size={14} /> },
              { key: 'guide' as const, label: 'Strategy', icon: <Target size={14} /> },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 -mb-[1px] ${
                  activeTab === tab.key
                    ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'border-transparent text-[var(--color-text-tertiary)] hover:text-white'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* ===== OVERVIEW TAB (Guide) ===== */}
        {(!hasGuide || activeTab === 'overview') && (
          <div className="space-y-6">
            {/* Guide overview */}
            {guide?.overview && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <BookOpen size={18} className="text-[var(--color-accent)]" />
                  Build Overview
                </h3>
                <div className="space-y-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {guide.overview.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Quick info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Team composition */}
              {build.type === 'team' && (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5">
                  <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    <Users size={14} className="text-[var(--color-accent)]" />
                    Team Composition
                  </h3>
                  <div className="space-y-2">
                    {build.characters.map((bc, i) => {
                      const charData = CHARACTERS.find(c => c.Name === bc.name);
                      const elemColor = charData ? ELEMENT_COLORS[charData.Element] : '#666';
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: elemColor }} />
                          <span className="text-sm text-white font-bold">{bc.name}</span>
                          {bc.role && <span className="text-[10px] px-1.5 py-0.5 bg-[var(--color-surface-2)] text-[var(--color-accent)]">{bc.role}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Element composition */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5">
                <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                  <Zap size={14} className="text-[var(--color-accent)]" />
                  Elements
                </h3>
                <div className="space-y-2">
                  {Object.entries(elementCounts).map(([element, count]) => (
                    <div key={element} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ELEMENT_COLORS[element as Element] }} />
                      <span className="text-sm text-[var(--color-text-secondary)] flex-1">{element}</span>
                      <span className="text-sm font-bold text-white">{count}x</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role composition */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5">
                <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                  <Shield size={14} className="text-[var(--color-accent)]" />
                  Roles
                </h3>
                <div className="space-y-2">
                  {Object.entries(roleCounts).map(([role, count]) => {
                    const profIcon = PROFESSION_ICONS[role];
                    return (
                      <div key={role} className="flex items-center gap-3">
                        {profIcon ? (
                          <div className="w-5 h-5 relative"><Image src={profIcon} alt={role} fill className="object-contain" unoptimized sizes="20px" /></div>
                        ) : <div className="w-5 h-5" />}
                        <span className="text-sm text-[var(--color-text-secondary)] flex-1">{role}</span>
                        <span className="text-sm font-bold text-white">{count}x</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Rotation (shown in overview) */}
            {guide?.rotation && guide.rotation.length > 0 && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <RotateCcw size={18} className="text-[var(--color-accent)]" />
                  Combat Rotation
                </h3>
                <div className="space-y-3">
                  {guide.rotation.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-7 h-7 shrink-0 bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-bold text-xs flex items-center justify-center clip-corner-tl">
                        {i + 1}
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Changelog */}
            {guide?.changelog && guide.changelog.length > 0 && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5">
                <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                  <Wrench size={14} className="text-[var(--color-accent)]" />
                  Changelog
                </h3>
                <div className="space-y-1.5">
                  {guide.changelog.map((entry, i) => (
                    <p key={i} className="text-xs text-[var(--color-text-tertiary)]">{entry}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== LOADOUT TAB ===== */}
        {activeTab === 'loadout' && (
          <div className="space-y-6">
            {build.characters.map((bc, idx) => {
              const charData = CHARACTERS.find(c => c.Name === bc.name);
              const weaponData = bc.weapon ? WEAPON_DATA.find(w => w.Name === bc.weapon) : null;
              const gearSet = bc.equipment ? GEAR_SETS.find(g => g.name === bc.equipment) : null;
              const banner = CHARACTER_BANNERS[bc.name];
              const charIcon = CHARACTER_ICONS[bc.name];
              const weaponIcon = bc.weapon ? WEAPON_ICONS[bc.weapon] : null;
              const equipIcon = bc.equipment ? EQUIPMENT_ICONS[bc.equipment] : null;
              const profIcon = charData ? PROFESSION_ICONS[charData.Role] : null;

              if (!charData) return null;

              const elementColor = ELEMENT_COLORS[charData.Element];
              const rarityColor = RARITY_COLORS[charData.Rarity];

              return (
                <div key={idx} className="bg-[var(--color-surface)] border-2 clip-corner-tl overflow-hidden" style={{ borderColor: elementColor }}>
                  {/* Character banner header */}
                  <div className="relative h-28 sm:h-36 overflow-hidden bg-gradient-to-br from-[var(--color-surface-2)] to-[var(--color-surface)]">
                    {banner && (
                      <div className="absolute inset-0 opacity-30">
                        <Image src={banner} alt={bc.name} fill className="object-cover object-center" unoptimized sizes="100vw" />
                      </div>
                    )}
                    <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${elementColor}15 0%, transparent 60%)` }} />
                    <div className="relative h-full flex items-end p-5">
                      <div className="flex items-center gap-4 flex-1">
                        {charIcon && (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 relative border-2 clip-corner-tl overflow-hidden bg-black/40" style={{ borderColor: rarityColor }}>
                            <Image src={charIcon} alt={bc.name} fill className="object-cover" unoptimized sizes="80px" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-white font-bold text-xl sm:text-2xl">{bc.name}</h2>
                            {bc.role && <span className="text-xs px-2 py-0.5 bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-bold">{bc.role}</span>}
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span style={{ color: elementColor }} className="font-bold">{charData.Element}</span>
                            <span className="text-[var(--color-text-tertiary)]">{charData.Role}</span>
                            <span className="text-[var(--color-text-tertiary)]">{charData.WeaponType}</span>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: charData.Rarity }).map((_, i) => (
                                <Star key={i} size={10} className="fill-current" style={{ color: rarityColor }} />
                              ))}
                            </div>
                          </div>
                          {bc.statPriority && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="text-[10px] text-[var(--color-text-tertiary)]">Stat Priority:</span>
                              <span className="text-[10px] font-bold text-[var(--color-accent)]">{bc.statPriority}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {profIcon && (
                        <div className="w-10 h-10 relative opacity-60">
                          <Image src={profIcon} alt={charData.Role} fill className="object-contain" unoptimized sizes="40px" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Stats */}
                    <div>
                      <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide flex items-center gap-2">
                        <ChevronRight size={14} className="text-[var(--color-accent)]" />
                        Base Stats (Lv.90)
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'STR', value: charData.Strength, color: '#FF6B6B' },
                          { label: 'AGI', value: charData.Agility, color: '#4ECDC4' },
                          { label: 'INT', value: charData.Intellect, color: '#95E1D3' },
                          { label: 'WILL', value: charData.Will, color: '#FFE66D' },
                        ].map(stat => (
                          <div key={stat.label} className="bg-[var(--color-surface-2)] p-3 clip-corner-tl">
                            <div className="text-xs text-[var(--color-text-tertiary)] mb-1">{stat.label}</div>
                            <div className="text-xl font-bold text-white">{stat.value}</div>
                            <div className="h-1 bg-black/40 mt-2 relative overflow-hidden">
                              <div className="absolute inset-y-0 left-0" style={{ width: `${(stat.value / 180) * 100}%`, backgroundColor: stat.color }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weapon */}
                    {bc.weapon && weaponData && (
                      <div>
                        <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide flex items-center gap-2">
                          <ChevronRight size={14} className="text-[var(--color-accent)]" />
                          Weapon
                        </h3>
                        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-4 clip-corner-tl">
                          <div className="flex items-start gap-4">
                            {weaponIcon && (
                              <div className="w-16 h-16 sm:w-20 sm:h-20 relative bg-black/30 p-2 border-2" style={{ borderColor: RARITY_COLORS[weaponData.Rarity] }}>
                                <Image src={weaponIcon} alt={bc.weapon} fill className="object-contain p-1" unoptimized sizes="80px" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-white font-bold">{bc.weapon}</h4>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: weaponData.Rarity }).map((_, i) => (
                                    <Star key={i} size={10} className="fill-current" style={{ color: RARITY_COLORS[weaponData.Rarity] }} />
                                  ))}
                                </div>
                              </div>
                              <div className="text-xs text-[var(--color-text-tertiary)] mb-2">
                                {weaponData.WeaponType} | ATK {weaponData.MaxAtk} (Lv.90)
                              </div>
                              {weaponData.SkillName && (
                                <div className="mb-2">
                                  <div className="text-xs font-bold text-[var(--color-accent)] mb-1">{weaponData.SkillName}</div>
                                  <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{weaponData.SkillDescription}</div>
                                </div>
                              )}
                              <div className="flex flex-wrap gap-2 text-xs">
                                <div className="px-2 py-1 bg-[var(--color-surface)] text-[var(--color-accent)]">
                                  {weaponData.PassiveAttribute.label} +{weaponData.PassiveAttribute.value}{weaponData.PassiveAttribute.isPercentage ? '%' : ''}
                                </div>
                                {weaponData.SpecialAttribute && (
                                  <div className="px-2 py-1 bg-[var(--color-surface)] text-[var(--color-accent)]">
                                    {weaponData.SpecialAttribute.label} +{weaponData.SpecialAttribute.value}{weaponData.SpecialAttribute.isPercentage ? '%' : ''}
                                  </div>
                                )}
                              </div>
                              {(() => {
                                const essence = WEAPON_ESSENCES.find(e => e.name === bc.weapon);
                                if (essence) {
                                  const tierLabel = getEssenceTierLabel(essence.rarity);
                                  return (
                                    <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                                      <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase mb-1.5">Essence Slots:</div>
                                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                                        <div className="px-2 py-1 bg-[var(--color-surface)]/50 text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                                          {essence.primaryAttr} [{tierLabel}]
                                        </div>
                                        {essence.secondaryStat && (
                                          <div className="px-2 py-1 bg-[var(--color-surface)]/50 text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                                            {essence.secondaryStat} [{tierLabel}]
                                          </div>
                                        )}
                                        <div className="px-2 py-1 bg-[var(--color-surface)]/50 text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                                          {essence.skillStat}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                        </div>
                        {/* Alternative weapons */}
                        {bc.altWeapons && bc.altWeapons.length > 0 && (
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase">Alternatives:</span>
                            {bc.altWeapons.map(alt => {
                              const altWpn = WEAPONS.find(w => w.Name === alt);
                              const altIcon = WEAPON_ICONS[alt];
                              return (
                                <div key={alt} className="flex items-center gap-1.5 px-2 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                                  {altIcon && <Image src={altIcon} alt={alt} width={16} height={16} className="object-contain" unoptimized />}
                                  <span className="text-[10px] text-[var(--color-text-secondary)]">{alt}</span>
                                  {altWpn && <span className="text-[8px] text-[var(--color-text-tertiary)]">{altWpn.Rarity}*</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Equipment */}
                    {(bc.equipmentPieces?.length || (bc.equipment && gearSet)) && (
                      <div>
                        <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide flex items-center gap-2">
                          <ChevronRight size={14} className="text-[var(--color-accent)]" />
                          Equipment
                        </h3>
                        {/* Set bonus info */}
                        {gearSet && (
                          <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-4 clip-corner-tl mb-2">
                            <div className="flex items-start gap-4">
                              {equipIcon && (
                                <div className="w-12 h-12 relative bg-black/30 p-1.5 flex-shrink-0">
                                  <Image src={equipIcon} alt={bc.equipment || ''} fill className="object-contain" unoptimized sizes="48px" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-white font-bold text-sm">{bc.equipment} Set</h4>
                                  <span className="text-[10px] px-1.5 py-0.5 bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-bold">
                                    {gearSet.phase.split(' ')[0]}
                                  </span>
                                </div>
                                <div className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
                                  <span className="text-[var(--color-accent)] font-bold">3-piece: </span>{gearSet.setBonus}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Individual gear pieces */}
                        {bc.equipmentPieces && bc.equipmentPieces.length > 0 && (
                          <div className="space-y-1.5 mb-2">
                            {bc.equipmentPieces.map((ep, epi) => {
                              const piece = GEAR_SETS.flatMap(s => s.pieces).find(p => p.name === ep.pieceName);
                              return (
                                <div key={epi} className="flex items-center gap-3 px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                                  {piece?.icon && (
                                    <div className="w-10 h-10 relative bg-black/30 flex-shrink-0">
                                      <Image src={piece.icon} alt={ep.pieceName} fill className="object-contain p-0.5" unoptimized sizes="40px" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-white font-semibold truncate">{ep.pieceName}</p>
                                    {piece && (
                                      <div className="text-[9px] text-[var(--color-text-tertiary)] flex flex-wrap gap-x-2">
                                        <span>DEF {piece.def}</span>
                                        {piece.stats.map((s, si) => (
                                          <span key={si}>{s.name} <span className="text-[var(--color-accent)]">{s.value}</span></span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  {ep.artificeLevel !== undefined && ep.artificeLevel > 0 && (
                                    <span className="text-[10px] text-[var(--color-accent)] font-bold">+{ep.artificeLevel}</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {/* Alternative equipment */}
                        {bc.altEquipment && bc.altEquipment.length > 0 && (
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase">Alternatives:</span>
                            {bc.altEquipment.map(alt => {
                              const altIcon = EQUIPMENT_ICONS[alt];
                              return (
                                <div key={alt} className="flex items-center gap-1.5 px-2 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                                  {altIcon && <Image src={altIcon} alt={alt} width={16} height={16} className="object-contain" unoptimized />}
                                  <span className="text-[10px] text-[var(--color-text-secondary)]">{alt}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Skill levels */}
                    {bc.skillLevels && (
                      <div>
                        <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide flex items-center gap-2">
                          <ChevronRight size={14} className="text-[var(--color-accent)]" />
                          Skill Levels
                        </h3>
                        <div className="flex gap-2">
                          {bc.skillLevels.map((level, i) => (
                            <div key={i} className="flex-1 bg-[var(--color-surface-2)] p-2 text-center clip-corner-tl">
                              <div className="text-xs text-[var(--color-text-tertiary)] mb-1">
                                {['Basic', 'Skill', 'Combo', 'Ultimate'][i] || `Skill ${i + 1}`}
                              </div>
                              <div className="text-lg font-bold text-[var(--color-accent)]">{level}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Character notes */}
                    {bc.notes && (
                      <div className="p-4 border-l-4 bg-[var(--color-surface-2)] text-sm text-[var(--color-text-secondary)] leading-relaxed" style={{ borderLeftColor: elementColor }}>
                        {bc.notes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== STRATEGY TAB ===== */}
        {activeTab === 'guide' && guide && (
          <div className="space-y-6">
            {/* Tips */}
            {guide.tips && guide.tips.length > 0 && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Lightbulb size={18} className="text-[var(--color-accent)]" />
                  Pro Tips
                </h3>
                <div className="space-y-3">
                  {guide.tips.map((tip, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-[var(--color-surface-2)] border-l-2 border-[var(--color-accent)]">
                      <TrendingUp size={14} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matchups */}
            {guide.matchups && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guide.matchups.good.length > 0 && (
                  <div className="bg-[var(--color-surface)] border border-green-500/30 clip-corner-tl p-5">
                    <h3 className="text-green-400 font-bold text-sm mb-3 flex items-center gap-2">
                      <Target size={14} />
                      Strong Against
                    </h3>
                    <div className="space-y-2">
                      {guide.matchups.good.map((m, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                          <p className="text-xs text-[var(--color-text-secondary)]">{m}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {guide.matchups.bad.length > 0 && (
                  <div className="bg-[var(--color-surface)] border border-red-500/30 clip-corner-tl p-5">
                    <h3 className="text-red-400 font-bold text-sm mb-3 flex items-center gap-2">
                      <AlertTriangle size={14} />
                      Weak Against
                    </h3>
                    <div className="space-y-2">
                      {guide.matchups.bad.map((m, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                          <p className="text-xs text-[var(--color-text-secondary)]">{m}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rotation (also shown in strategy) */}
            {guide.rotation && guide.rotation.length > 0 && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <RotateCcw size={18} className="text-[var(--color-accent)]" />
                  Full Rotation Breakdown
                </h3>
                <div className="space-y-3">
                  {guide.rotation.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-7 h-7 shrink-0 bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-bold text-xs flex items-center justify-center clip-corner-tl">
                        {i + 1}
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fallback for builds without guide - show loadout directly */}
        {!hasGuide && (
          <div className="space-y-6 mt-6">
            {build.characters.map((bc, idx) => {
              const charData = CHARACTERS.find(c => c.Name === bc.name);
              const weaponData = bc.weapon ? WEAPON_DATA.find(w => w.Name === bc.weapon) : null;
              const gearSet = bc.equipment ? GEAR_SETS.find(g => g.name === bc.equipment) : null;
              const charIcon = CHARACTER_ICONS[bc.name];
              const weaponIcon = bc.weapon ? WEAPON_ICONS[bc.weapon] : null;
              const equipIcon = bc.equipment ? EQUIPMENT_ICONS[bc.equipment] : null;

              if (!charData) return null;

              const elementColor = ELEMENT_COLORS[charData.Element];
              const rarityColor = RARITY_COLORS[charData.Rarity];

              return (
                <div key={idx} className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden" style={{ borderLeftColor: elementColor, borderLeftWidth: '4px' }}>
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      {charIcon && (
                        <div className="w-12 h-12 relative border-2 clip-corner-tl overflow-hidden" style={{ borderColor: rarityColor }}>
                          <Image src={charIcon} alt={bc.name} fill className="object-cover" unoptimized sizes="48px" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-white font-bold">{bc.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                          <span style={{ color: elementColor }}>{charData.Element}</span>
                          <span>{charData.Role}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {bc.weapon && (
                        <div className="flex-col gap-2">
                          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface-2)]">
                            {weaponIcon && <Image src={weaponIcon} alt={bc.weapon} width={20} height={20} className="object-contain" unoptimized />}
                            <span className="text-xs text-white">{bc.weapon}</span>
                          </div>
                          {(() => {
                            const essence = WEAPON_ESSENCES.find(e => e.name === bc.weapon);
                            if (essence) {
                              const tierLabel = getEssenceTierLabel(essence.rarity);
                              return (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <div className="px-1.5 py-0.5 bg-[var(--color-surface)] text-[9px] text-[var(--color-text-tertiary)] border border-[var(--color-border)]">
                                    {essence.primaryAttr} [{tierLabel}]
                                  </div>
                                  {essence.secondaryStat && (
                                    <div className="px-1.5 py-0.5 bg-[var(--color-surface)] text-[9px] text-[var(--color-text-tertiary)] border border-[var(--color-border)]">
                                      {essence.secondaryStat} [{tierLabel}]
                                    </div>
                                  )}
                                  <div className="px-1.5 py-0.5 bg-[var(--color-surface)] text-[9px] text-[var(--color-text-tertiary)] border border-[var(--color-border)]">
                                    {essence.skillStat}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                      {bc.equipmentPieces && bc.equipmentPieces.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {bc.equipmentPieces.map((ep, epi) => (
                            <div key={epi} className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface-2)]">
                              <Shield size={12} className="text-[var(--color-accent)]" />
                              <span className="text-[10px] text-white truncate">{ep.pieceName}</span>
                            </div>
                          ))}
                        </div>
                      ) : bc.equipment && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface-2)]">
                          {equipIcon && <Image src={equipIcon} alt={bc.equipment} width={20} height={20} className="object-contain" unoptimized />}
                          <span className="text-xs text-white">{bc.equipment} Set</span>
                        </div>
                      )}
                    </div>
                    {bc.notes && <p className="text-xs text-[var(--color-text-secondary)]">{bc.notes}</p>}
                    {bc.skillLevels && (
                      <div className="flex gap-2">
                        {bc.skillLevels.map((level, i) => (
                          <div key={i} className="px-2 py-1 bg-[var(--color-surface-2)] text-center">
                            <div className="text-[9px] text-[var(--color-text-tertiary)]">S{i + 1}</div>
                            <div className="text-sm font-bold text-[var(--color-accent)]">{level}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
