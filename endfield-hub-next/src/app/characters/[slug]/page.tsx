'use client';

import { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Zap, Wind, Brain, Heart, Star, Sword, Shield,
  Trophy, Target, Users, Crosshair, ThumbsUp, ThumbsDown,
  BookOpen, Lightbulb, Wrench, Calendar, Package, Copy, Check,
  ExternalLink, ChevronRight, FileText, Swords, UserCheck,
  BarChart3, Info, Sparkles, TrendingUp, Hash,
} from 'lucide-react';
import { CHARACTERS } from '@/lib/data';
import { ELEMENT_COLORS, RARITY_COLORS } from '@/types/game';
import {
  CHARACTER_BANNERS, CHARACTER_ICONS, CHARACTER_SPLASH,
  PROFESSION_ICONS, WEAPON_ICONS, EQUIPMENT_ICONS,
} from '@/lib/assets';
import { getOperatorGuide, TIER_COLORS } from '@/data/guides';
import type { TierRating, OperatorGuide } from '@/data/guides';
import { fetchOperatorGuide, fetchBlueprints } from '@/lib/api';
import { SCRAPED_BLUEPRINTS, getBlueprintsForOperator, type BlueprintEntry } from '@/data/blueprints';

// =============================================
// Tab definitions
// =============================================
type TabId = 'profile' | 'review' | 'build' | 'teams';

const TABS: { id: TabId; label: string; icon: React.ReactNode; code: string }[] = [
  { id: 'profile', label: 'Profile', icon: <FileText size={16} />, code: 'PERSONNEL' },
  { id: 'review', label: 'Review', icon: <BarChart3 size={16} />, code: 'ANALYSIS' },
  { id: 'build', label: 'Build', icon: <Swords size={16} />, code: 'LOADOUT' },
  { id: 'teams', label: 'Teams & Synergies', icon: <Users size={16} />, code: 'TACTICAL' },
];

// =============================================
// Sub-components
// =============================================

function TierBadge({ tier, label, size = 'md' }: { tier: TierRating; label: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { text: 'text-sm', badge: 'text-xs px-1.5 py-0.5', label: 'text-xs' },
    md: { text: 'text-base', badge: 'text-sm px-2 py-0.5', label: 'text-sm' },
    lg: { text: 'text-lg', badge: 'text-base px-2.5 py-1', label: 'text-sm' },
  };
  const s = sizes[size];
  return (
    <div className="flex items-center justify-between p-3 bg-[var(--color-surface-2)] border-l-2" style={{ borderLeftColor: TIER_COLORS[tier] }}>
      <span className={`text-[var(--color-text-secondary)] ${s.label} uppercase tracking-wider font-tactical`}>{label}</span>
      <span className={`font-bold font-mono ${s.badge}`} style={{ color: TIER_COLORS[tier], borderBottom: `2px solid ${TIER_COLORS[tier]}` }}>
        {tier}
      </span>
    </div>
  );
}

function StatBar({ label, value, max, color, icon }: { label: string; value: number; max: number; color: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 w-28 shrink-0">
        {icon}
        <span className="text-[var(--color-text-secondary)] text-sm">{label}</span>
      </div>
      <div className="flex-1 h-2.5 bg-[var(--color-surface-2)] overflow-hidden clip-corner-tl">
        <div className="h-full transition-all duration-500" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
      </div>
      <span className="text-white text-sm font-mono w-12 text-right">{value}</span>
    </div>
  );
}

function DossierSection({ title, icon, children, accent, id }: { title: string; icon: React.ReactNode; children: React.ReactNode; accent?: string; id?: string }) {
  return (
    <div id={id} className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
      <div
        className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]"
        style={accent ? { borderLeftWidth: '3px', borderLeftColor: accent } : {}}
      >
        <span style={{ color: accent || 'var(--color-accent)' }}>{icon}</span>
        <h2 className="text-base font-bold text-white uppercase tracking-wider font-tactical">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function WeaponRatingBar({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 shrink-0" title={`${rating}/5`}>
      {Array.from({ length: 5 }, (_, j) => (
        <div
          key={j}
          className="w-2 h-5 transition-colors"
          style={{ backgroundColor: j < rating ? 'var(--color-accent)' : 'var(--color-surface)' }}
        />
      ))}
    </div>
  );
}

function OperatorLink({ name, isActive }: { name: string; isActive?: boolean }) {
  const synChar = CHARACTERS.find(c => c.Name === name);
  const synIcon = CHARACTER_ICONS[name];
  return (
    <Link
      href={synChar ? `/characters/${synChar.Slug}` : '#'}
      className={`flex items-center gap-2.5 px-3 py-2 border no-underline transition-all duration-200 ${
        isActive
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
          : 'border-[var(--color-border)] hover:border-[var(--color-accent)] bg-[var(--color-surface-2)]'
      }`}
    >
      {synIcon && <Image src={synIcon} alt={name} width={24} height={24} className="w-6 h-6 object-contain" />}
      <span className={`text-sm font-medium ${isActive ? 'text-[var(--color-accent)]' : 'text-white'}`}>{name}</span>
      {synChar && <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{synChar.Rarity}★ {synChar.Role}</span>}
    </Link>
  );
}

// =============================================
// Main Page Component
// =============================================
export default function CharacterDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const char = CHARACTERS.find(c => c.Slug === slug);
  const [guide, setGuide] = useState<OperatorGuide | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [communityBuilds, setCommunityBuilds] = useState<BlueprintEntry[]>([]);
  const [copiedBpId, setCopiedBpId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const tabContentRef = useRef<HTMLDivElement>(null);

  // Load static guide + Strapi overlay
  useEffect(() => {
    const staticGuide = getOperatorGuide(slug);
    if (staticGuide) setGuide(staticGuide);

    fetchOperatorGuide(slug).then((strapiData) => {
      if (strapiData) {
        const attrs = strapiData.attributes || strapiData;
        setGuide(prev => ({
          ...(prev || {} as OperatorGuide),
          slug,
          ...(attrs.review && { review: attrs.review }),
          ...(attrs.introduction && { introduction: attrs.introduction }),
          ...(attrs.pros && { pros: attrs.pros }),
          ...(attrs.cons && { cons: attrs.cons }),
          ...(attrs.bestWeapons && { bestWeapons: attrs.bestWeapons }),
          ...(attrs.bestGearSets && { bestGearSets: attrs.bestGearSets }),
          ...(attrs.skillPriority && { skillPriority: attrs.skillPriority }),
          ...(attrs.synergies && { synergies: attrs.synergies }),
          ...(attrs.teamComps && { teamComps: attrs.teamComps }),
          ...(attrs.gameplayTips && { gameplayTips: attrs.gameplayTips }),
          ...(attrs.gearNotes && { gearNotes: attrs.gearNotes }),
          ...(attrs.ratings && { ratings: attrs.ratings }),
          ...(attrs.lastUpdated && { lastUpdated: attrs.lastUpdated }),
          // Enhanced Prydwen-style fields
          ...(attrs.skillData && { skillData: attrs.skillData }),
          ...(attrs.gearSetDetails && { gearSetDetails: attrs.gearSetDetails }),
          ...(attrs.damageCalcs && { damageCalcs: attrs.damageCalcs }),
          ...(attrs.statPriorities && { statPriorities: attrs.statPriorities }),
          ...(attrs.elementalNotes && { elementalNotes: attrs.elementalNotes }),
          ...(attrs.rotationGuide && { rotationGuide: attrs.rotationGuide }),
          ...(attrs.comparisonNotes && { comparisonNotes: attrs.comparisonNotes }),
        }));
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [slug]);

  // Load community builds
  useEffect(() => {
    if (!char) return;
    const staticBuilds = getBlueprintsForOperator(char.Name);
    setCommunityBuilds(staticBuilds);

    fetchBlueprints().then((data) => {
      if (!data || !Array.isArray(data)) return;
      const strapiBuilds = data
        .map((item: Record<string, unknown>) => {
          const attrs = (item as Record<string, unknown>).attributes || item;
          return { attrs, id: (item as Record<string, unknown>).id as number };
        })
        .filter(({ attrs }) => {
          const ops = (attrs as Record<string, unknown>).Operators;
          const tags = (attrs as Record<string, unknown>).Tags;
          const nameLower = char.Name.toLowerCase();
          if (Array.isArray(ops) && ops.some((o: string) => o.toLowerCase() === nameLower)) return true;
          if (Array.isArray(tags) && tags.some((t: string) => t.toLowerCase() === nameLower)) return true;
          return false;
        })
        .map(({ attrs, id }) => {
          const a = attrs as Record<string, unknown>;
          const title = (a.Title as string) || '';
          return {
            id,
            Title: title,
            Description: (a.Description as string) || '',
            ImportString: (a.ImportString as string) || '',
            Upvotes: (a.Upvotes as number) || 0,
            Region: (a.Region as string) || 'NA / EU',
            Author: (a.Author as string) || 'guest',
            Tags: Array.isArray(a.Tags) ? a.Tags as string[] : [],
            operators: Array.isArray(a.Operators) ? a.Operators as string[] : [],
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            detailDescription: (a.Description as string) || '',
            outputsPerMin: [],
            importCodes: [],
            complexity: 'Intermediate' as const,
            category: 'Production' as const,
          } satisfies BlueprintEntry;
        });
      const allBuilds = [...staticBuilds];
      const existingTitles = new Set(allBuilds.map(b => b.Title.toLowerCase()));
      for (const b of strapiBuilds) {
        if (!existingTitles.has(b.Title.toLowerCase())) {
          allBuilds.push(b);
        }
      }
      setCommunityBuilds(allBuilds);
    }).catch(() => {});
  }, [char]);

  if (!char) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--color-text-secondary)] text-base">Operator not found</p>
        <Link href="/characters" className="text-[var(--color-accent)] text-sm mt-2 inline-block">Back to Operator Database</Link>
      </div>
    );
  }

  const rarityColor = RARITY_COLORS[char.Rarity] || '#999';
  const elementColor = ELEMENT_COLORS[char.Element];
  const maxStat = 200;
  const profIcon = PROFESSION_ICONS[char.Role];
  const splashUrl = CHARACTER_SPLASH[char.Name];

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    tabContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Navigation */}
      <Link href="/characters" className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] text-sm mb-4 no-underline transition-colors">
        <ArrowLeft size={16} /> <span className="font-tactical uppercase tracking-wider">Back to Operator Database</span>
      </Link>

      {/* ==========================================
          DOSSIER HEADER — Hero Banner
          ========================================== */}
      <div className="mb-6 clip-corner-tl overflow-hidden border border-[var(--color-border)] relative">
        {/* Banner Background */}
        {CHARACTER_BANNERS[char.Name] ? (
          <Image
            src={CHARACTER_BANNERS[char.Name]}
            alt={`${char.Name} banner`}
            width={1200}
            height={280}
            className="w-full h-56 sm:h-64 object-cover"
            priority
          />
        ) : (
          <div className="w-full h-56 sm:h-64" style={{ background: `linear-gradient(135deg, ${elementColor}30, var(--color-surface))` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Dossier Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          {/* Terminal classification bar */}
          <div className="flex items-center gap-2 mb-2">
            <span className="diamond-sm diamond-accent" />
            <span className="terminal-text-sm opacity-60">RIOS-OPS // DOSSIER // {char.Slug.toUpperCase()}</span>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white font-tactical uppercase tracking-wide leading-tight">{char.Name}</h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {/* Rarity Stars */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: char.Rarity }, (_, i) => (
                    <Star key={i} size={16} fill={rarityColor} color={rarityColor} />
                  ))}
                </div>
                {/* Role badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 border border-white/10">
                  {profIcon && <Image src={profIcon} alt={char.Role} width={18} height={18} className="w-[18px] h-[18px] opacity-90" />}
                  <span className="text-white text-sm font-medium">{char.Role}</span>
                </div>
                {/* Element badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 border border-white/10">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: elementColor }} />
                  <span className="text-sm font-medium" style={{ color: elementColor }}>{char.Element}</span>
                </div>
                {/* Weapon badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 border border-white/10">
                  <Sword size={14} className="text-[var(--color-text-tertiary)]" />
                  <span className="text-white text-sm">{char.WeaponType}</span>
                </div>
              </div>
            </div>

            {/* Tier Badge - top right */}
            {guide && (
              <div className="hidden sm:flex flex-col items-center px-4 py-2 clip-corner-tl" style={{ backgroundColor: `${TIER_COLORS[guide.ratings.overall]}15`, border: `1px solid ${TIER_COLORS[guide.ratings.overall]}40` }}>
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-tertiary)] font-tactical">Overall Tier</span>
                <span className="text-2xl font-bold font-mono mt-0.5" style={{ color: TIER_COLORS[guide.ratings.overall] }}>{guide.ratings.overall}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================
          TAB NAVIGATION BAR — Prydwen-style
          ========================================== */}
      <div className="mb-6 border border-[var(--color-border)] bg-[var(--color-surface)] clip-corner-tl overflow-hidden">
        <div className="flex">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-tactical uppercase tracking-wider transition-all duration-200 border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]'
                  : 'text-[var(--color-text-tertiary)] border-transparent hover:text-white hover:bg-[var(--color-surface-2)]'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
        {/* Terminal sub-bar */}
        <div className="px-4 py-1.5 bg-[var(--color-surface-2)] border-t border-[var(--color-border)] flex items-center gap-2">
          <span className="diamond-sm" />
          <span className="terminal-text-sm opacity-50">
            SECTION: {TABS.find(t => t.id === activeTab)?.code} // OPERATOR: {char.Name.toUpperCase()} // CLEARANCE: LEVEL-3
          </span>
        </div>
      </div>

      {/* ==========================================
          TAB CONTENT
          ========================================== */}
      <div ref={tabContentRef}>
        {/* ========== PROFILE TAB ========== */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Portrait + Stats */}
              <div className="space-y-6">
                {/* Portrait */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
                  <div
                    className="aspect-square flex items-center justify-center relative"
                    style={{ background: `linear-gradient(135deg, ${elementColor}15, var(--color-surface))` }}
                  >
                    {CHARACTER_ICONS[char.Name] ? (
                      <Image src={CHARACTER_ICONS[char.Name]} alt={char.Name} width={220} height={220} className="w-56 h-56 object-contain" />
                    ) : (
                      <span className="text-8xl font-bold text-white/10">{char.Name[0]}</span>
                    )}
                    {/* Element corner accent */}
                    <div className="absolute top-3 right-3 w-3 h-3 rotate-45" style={{ backgroundColor: elementColor }} />
                  </div>
                  {/* Quick Info Bar */}
                  <div className="px-4 py-3 bg-[var(--color-surface-2)] border-t border-[var(--color-border)]">
                    <div className="flex items-center justify-between">
                      <span className="terminal-text-sm opacity-60">CLASSIFICATION</span>
                      <span className="text-white text-sm font-medium font-tactical">{char.Rarity}★ {char.Element} {char.Role}</span>
                    </div>
                  </div>
                </div>

                {/* Ratings */}
                {guide && (
                  <DossierSection title="Combat Ratings" icon={<Trophy size={18} />} accent={TIER_COLORS[guide.ratings.overall]}>
                    <div className="space-y-2">
                      <TierBadge tier={guide.ratings.overall} label="Overall" size="lg" />
                      <TierBadge tier={guide.ratings.pve} label="PvE Content" />
                      <TierBadge tier={guide.ratings.boss} label="Boss Fights" />
                      <TierBadge tier={guide.ratings.support} label="Support Value" />
                    </div>
                  </DossierSection>
                )}

                {/* Attributes */}
                <DossierSection title="Attributes (Lv.90)" icon={<Target size={18} />}>
                  <div className="space-y-3">
                    <StatBar label="Strength" value={char.Strength} max={maxStat} color="#FF6B35" icon={<Zap size={16} className="text-orange-400" />} />
                    <StatBar label="Agility" value={char.Agility} max={maxStat} color="#00BFFF" icon={<Wind size={16} className="text-blue-400" />} />
                    <StatBar label="Intellect" value={char.Intellect} max={maxStat} color="#9B59B6" icon={<Brain size={16} className="text-purple-400" />} />
                    <StatBar label="Will" value={char.Will} max={maxStat} color="#27AE60" icon={<Heart size={16} className="text-green-400" />} />
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">Total</span>
                      <span className="text-white font-mono font-bold">{char.Strength + char.Agility + char.Intellect + char.Will}</span>
                    </div>
                  </div>
                </DossierSection>
              </div>

              {/* Right: Overview + Introduction */}
              <div className="lg:col-span-2 space-y-6">
                {/* Overview */}
                <DossierSection title="Operator Overview" icon={<BookOpen size={18} />}>
                  <p className="text-[var(--color-text-secondary)] text-base leading-relaxed">{char.Description}</p>
                  {char.Lore && (
                    <p className="text-[var(--color-text-tertiary)] text-sm leading-relaxed mt-3 pt-3 border-t border-[var(--color-border)]">{char.Lore}</p>
                  )}
                </DossierSection>

                {guide && (
                  <>
                    {/* Introduction */}
                    {guide.introduction && (
                      <DossierSection title="Intelligence Briefing" icon={<Info size={18} />} accent={elementColor}>
                        <div className="text-[var(--color-text-secondary)] text-base leading-relaxed whitespace-pre-line">
                          {guide.introduction}
                        </div>
                      </DossierSection>
                    )}

                    {/* Last Updated */}
                    {guide.lastUpdated && (
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
                        <Calendar size={14} />
                        <span>Dossier last updated: {guide.lastUpdated}</span>
                      </div>
                    )}

                    {/* Skills list (if available) */}
                    {char.Skills && char.Skills.length > 0 && (
                      <DossierSection title="Skill Manifest" icon={<Sparkles size={18} />} accent={elementColor}>
                        <div className="space-y-3">
                          {char.Skills.sort((a, b) => a.Order - b.Order).map(skill => (
                            <div key={skill.id} className="p-3 bg-[var(--color-surface-2)] border-l-2 border-[var(--color-border)]">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-mono text-[var(--color-accent)] px-1.5 py-0.5 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
                                  {skill.SkillType}
                                </span>
                                <span className="text-white text-sm font-semibold">{skill.Name}</span>
                                {skill.Cooldown && <span className="text-[var(--color-text-muted)] text-xs ml-auto">{skill.Cooldown}s CD</span>}
                                {skill.SPCost && <span className="text-[var(--color-text-muted)] text-xs">{skill.SPCost} SP</span>}
                              </div>
                              <p className="text-[var(--color-text-tertiary)] text-sm leading-relaxed">{skill.Description}</p>
                            </div>
                          ))}
                        </div>
                      </DossierSection>
                    )}
                  </>
                )}

                {!guide && (
                  <DossierSection title="Dossier Pending" icon={<BookOpen size={18} />}>
                    <p className="text-[var(--color-text-tertiary)] text-base">A comprehensive operator dossier for {char.Name} is currently being compiled by RIOS Intelligence.</p>
                  </DossierSection>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========== REVIEW TAB ========== */}
        {activeTab === 'review' && guide && (
          <div className="space-y-6 animate-fade-in">
            {/* Review Text */}
            <DossierSection title="Tactical Assessment" icon={<BarChart3 size={18} />} accent={TIER_COLORS[guide.ratings.overall]}>
              <p className="text-[var(--color-text-secondary)] text-base leading-relaxed">{guide.review}</p>
            </DossierSection>

            {/* Pros & Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DossierSection title="Strengths" icon={<ThumbsUp size={18} />} accent="#27AE60">
                <ul className="space-y-3">
                  {guide.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-green-400 mt-1 shrink-0 text-lg leading-none">+</span>
                      <span className="text-[var(--color-text-secondary)] leading-relaxed">{pro}</span>
                    </li>
                  ))}
                </ul>
              </DossierSection>
              <DossierSection title="Weaknesses" icon={<ThumbsDown size={18} />} accent="#FF4444">
                <ul className="space-y-3">
                  {guide.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-red-400 mt-1 shrink-0 text-lg leading-none">&minus;</span>
                      <span className="text-[var(--color-text-secondary)] leading-relaxed">{con}</span>
                    </li>
                  ))}
                </ul>
              </DossierSection>
            </div>

            {/* Gameplay Tips */}
            {guide.gameplayTips && guide.gameplayTips.length > 0 && (
              <DossierSection title="Operational Tips" icon={<Lightbulb size={18} />} accent="#FFD429">
                <div className="space-y-3">
                  {guide.gameplayTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-4 p-3 bg-[var(--color-surface-2)]">
                      <span className="text-[var(--color-accent)] font-mono text-sm mt-0.5 shrink-0 w-6 text-center">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </DossierSection>
            )}

            {/* Damage Calculations (enhanced) */}
            {guide.damageCalcs && guide.damageCalcs.length > 0 && (
              <DossierSection title="Damage Calculations" icon={<Target size={18} />} accent={elementColor}>
                <div className="space-y-2">
                  {guide.damageCalcs.map((calc, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-[var(--color-surface-2)] border-l-2 border-[var(--color-border)]">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-sm font-semibold">{calc.scenario}</span>
                          <span className="text-[var(--color-accent)] text-sm font-mono font-bold ml-auto">{calc.value}</span>
                        </div>
                        {calc.conditions && (
                          <p className="text-[var(--color-text-muted)] text-xs">{calc.conditions}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </DossierSection>
            )}

            {/* Comparison Notes (enhanced) */}
            {guide.comparisonNotes && (
              <DossierSection title="Operator Comparison" icon={<BarChart3 size={18} />}>
                <div className="text-[var(--color-text-secondary)] text-sm leading-relaxed whitespace-pre-line">
                  {guide.comparisonNotes}
                </div>
              </DossierSection>
            )}

            {/* Ratings Comparison */}
            <DossierSection title="Rating Breakdown" icon={<TrendingUp size={18} />}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Overall', tier: guide.ratings.overall },
                  { label: 'PvE', tier: guide.ratings.pve },
                  { label: 'Boss', tier: guide.ratings.boss },
                  { label: 'Support', tier: guide.ratings.support },
                ].map(r => (
                  <div key={r.label} className="flex flex-col items-center p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl">
                    <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-tactical mb-2">{r.label}</span>
                    <span className="text-3xl font-bold font-mono" style={{ color: TIER_COLORS[r.tier] }}>{r.tier}</span>
                  </div>
                ))}
              </div>
            </DossierSection>
          </div>
        )}

        {/* ========== BUILD TAB ========== */}
        {activeTab === 'build' && guide && (
          <div className="space-y-6 animate-fade-in">
            {/* Skill Priority */}
            <DossierSection title="Skill Priority" icon={<Crosshair size={18} />} accent={elementColor}>
              <div className="flex items-center gap-2 flex-wrap">
                {guide.skillPriority.split('>').map((skill, i, arr) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 text-sm font-medium border clip-corner-tl ${
                      i === 0 ? 'bg-[var(--color-accent)]/15 border-[var(--color-accent)] text-[var(--color-accent)]'
                      : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                    }`}>
                      {skill.trim()}
                    </span>
                    {i < arr.length - 1 && <ChevronRight size={14} className="text-[var(--color-text-muted)]" />}
                  </div>
                ))}
              </div>
            </DossierSection>

            {/* Best Weapons */}
            <DossierSection title="Recommended Weapons" icon={<Sword size={18} />}>
              <div className="space-y-3">
                {guide.bestWeapons.map((w, i) => {
                  const weaponIcon = WEAPON_ICONS[w.name];
                  return (
                    <div key={i} className="flex items-center gap-4 p-3 bg-[var(--color-surface-2)] clip-corner-tl border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 transition-colors">
                      <div className="w-14 h-14 clip-corner-tl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                        {weaponIcon ? (
                          <Image src={weaponIcon} alt={w.name} width={56} height={56} className="w-14 h-14 object-contain" />
                        ) : (
                          <Sword size={20} className="text-[var(--color-text-tertiary)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {i === 0 && (
                            <span className="text-[10px] font-mono text-[var(--color-accent)] px-1.5 py-0.5 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">BIS</span>
                          )}
                          <span className="text-white text-sm font-semibold">{w.name}</span>
                          <span className="text-[var(--color-accent)] text-xs font-mono ml-auto shrink-0">{w.rating}/5</span>
                        </div>
                        <p className="text-[var(--color-text-tertiary)] text-sm">{w.notes}</p>
                      </div>
                      <WeaponRatingBar rating={w.rating} />
                    </div>
                  );
                })}
              </div>
            </DossierSection>

            {/* Best Gear Sets */}
            <DossierSection title="Recommended Gear Sets" icon={<Shield size={18} />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {guide.bestGearSets.map((set, i) => {
                  const eqIcon = EQUIPMENT_ICONS[set];
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 transition-colors">
                      {eqIcon && <Image src={eqIcon} alt={set} width={40} height={40} className="w-10 h-10 object-contain" unoptimized />}
                      <div>
                        <span className="text-white text-sm font-semibold block">{set}</span>
                        {i === 0 && <span className="text-[var(--color-accent)] text-xs font-mono">PRIMARY SET</span>}
                        {i === 1 && <span className="text-[var(--color-text-muted)] text-xs font-mono">ALTERNATIVE</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </DossierSection>

            {/* Skill Data Details (enhanced) */}
            {guide.skillData && guide.skillData.length > 0 && (
              <DossierSection title="Skill Multipliers & Data" icon={<Sparkles size={18} />} accent={elementColor}>
                <div className="space-y-3">
                  {guide.skillData.map((skill, i) => (
                    <div key={i} className="p-3 bg-[var(--color-surface-2)] border-l-2 border-[var(--color-border)]">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-mono text-[var(--color-accent)] px-1.5 py-0.5 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
                          {skill.type}
                        </span>
                        <span className="text-white text-sm font-semibold">{skill.name}</span>
                        {skill.multiplier && (
                          <span className="text-[var(--color-accent)] text-xs font-mono ml-auto">{skill.multiplier}</span>
                        )}
                      </div>
                      <p className="text-[var(--color-text-tertiary)] text-sm leading-relaxed">{skill.description}</p>
                      <div className="flex gap-4 mt-2">
                        {skill.spCost !== undefined && (
                          <span className="text-[var(--color-text-muted)] text-xs">SP: {skill.spCost}</span>
                        )}
                        {skill.cooldown !== undefined && (
                          <span className="text-[var(--color-text-muted)] text-xs">CD: {skill.cooldown}s</span>
                        )}
                      </div>
                      {skill.notes && (
                        <p className="text-[var(--color-text-muted)] text-xs mt-1 italic">{skill.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </DossierSection>
            )}

            {/* Gear Set Details (enhanced) */}
            {guide.gearSetDetails && guide.gearSetDetails.length > 0 && (
              <DossierSection title="Gear Set Analysis" icon={<Shield size={18} />} accent={elementColor}>
                <div className="space-y-3">
                  {guide.gearSetDetails.map((set, i) => {
                    const eqIcon = EQUIPMENT_ICONS[set.name];
                    return (
                      <div key={i} className="p-4 bg-[var(--color-surface-2)] clip-corner-tl border border-[var(--color-border)]">
                        <div className="flex items-center gap-3 mb-2">
                          {eqIcon && <Image src={eqIcon} alt={set.name} width={36} height={36} className="w-9 h-9 object-contain" unoptimized />}
                          <div>
                            <span className="text-white text-sm font-semibold block">{set.name}</span>
                            <span className="text-[var(--color-accent)] text-xs font-mono">{set.pieces}-PIECE SET</span>
                          </div>
                        </div>
                        <p className="text-[var(--color-text-secondary)] text-sm mb-2">{set.bonusDescription}</p>
                        {set.statBoosts && set.statBoosts.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {set.statBoosts.map((boost, j) => (
                              <span key={j} className="text-xs px-2 py-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-mono">
                                {boost}
                              </span>
                            ))}
                          </div>
                        )}
                        {set.notes && (
                          <p className="text-[var(--color-text-muted)] text-xs italic">{set.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </DossierSection>
            )}

            {/* Stat Priorities (enhanced) */}
            {guide.statPriorities && guide.statPriorities.length > 0 && (
              <DossierSection title="Stat Priority" icon={<TrendingUp size={18} />}>
                <div className="space-y-2">
                  {guide.statPriorities.map((sp, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 bg-[var(--color-surface-2)]">
                      <span className={`text-xs font-mono px-2 py-0.5 border shrink-0 ${
                        sp.priority === 'High' ? 'text-[var(--color-accent)] border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10' :
                        sp.priority === 'Medium' ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' :
                        'text-[var(--color-text-muted)] border-[var(--color-border)]'
                      }`}>
                        {sp.priority}
                      </span>
                      <span className="text-white text-sm font-medium">{sp.stat}</span>
                      {sp.notes && <span className="text-[var(--color-text-muted)] text-xs ml-auto">{sp.notes}</span>}
                    </div>
                  ))}
                </div>
              </DossierSection>
            )}

            {/* Rotation Guide (enhanced) */}
            {guide.rotationGuide && (
              <DossierSection title="Optimal Rotation" icon={<Crosshair size={18} />} accent={elementColor}>
                <div className="text-[var(--color-text-secondary)] text-sm leading-relaxed whitespace-pre-line p-3 bg-[var(--color-surface-2)] border-l-2" style={{ borderLeftColor: elementColor }}>
                  {guide.rotationGuide}
                </div>
              </DossierSection>
            )}

            {/* Gear Deep Dive */}
            {guide.gearNotes && (
              <DossierSection title="Equipment Analysis" icon={<Wrench size={18} />}>
                <div className="text-[var(--color-text-secondary)] text-sm leading-relaxed whitespace-pre-line">
                  {guide.gearNotes}
                </div>
              </DossierSection>
            )}

            {/* Community Builds */}
            <DossierSection title={`Community Builds`} icon={<Package size={18} />} accent={elementColor}>
              {communityBuilds.length > 0 ? (
                <div className="space-y-3">
                  {communityBuilds.map(bp => (
                    <div key={bp.id} className="flex items-start gap-3 p-3 bg-[var(--color-surface-2)] clip-corner-tl border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 transition-colors">
                      {bp.previewImage && (
                        <div className="w-20 h-16 flex-shrink-0 relative overflow-hidden border border-[var(--color-border)]">
                          <Image src={bp.previewImage} alt={bp.Title} fill className="object-cover" sizes="80px" unoptimized />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/builds/${bp.id || bp.slug}`}
                            className="text-white text-sm font-semibold truncate hover:text-[var(--color-accent)] transition-colors no-underline"
                          >
                            {bp.Title}
                          </Link>
                          {bp.complexity && (
                            <span className={`text-[10px] px-1.5 py-0.5 font-mono border shrink-0 ${
                              bp.complexity === 'Beginner' ? 'text-green-400 border-green-400/30' :
                              bp.complexity === 'Intermediate' ? 'text-blue-400 border-blue-400/30' :
                              bp.complexity === 'Advanced' ? 'text-purple-400 border-purple-400/30' :
                              'text-red-400 border-red-400/30'
                            }`}>
                              {bp.complexity}
                            </span>
                          )}
                        </div>
                        <p className="text-[var(--color-text-muted)] text-xs">
                          by {bp.Author} &middot; {bp.Region}
                          {bp.Upvotes > 0 && <> &middot; <ThumbsUp size={10} className="inline" /> {bp.Upvotes}</>}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <Link
                          href={`/builds/${bp.id || bp.slug}`}
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors no-underline"
                          title="View build"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        {bp.ImportString?.startsWith('EFO') && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(bp.ImportString);
                              setCopiedBpId(bp.id);
                              setTimeout(() => setCopiedBpId(null), 2000);
                            }}
                            className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
                            title="Copy import code"
                          >
                            {copiedBpId === bp.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--color-text-muted)] text-sm mb-2">No community builds tagged for {char.Name} yet.</p>
                  <Link href={`/builds?char=${encodeURIComponent(char.Name)}`} className="text-[var(--color-accent)] text-sm hover:underline no-underline">
                    Create a build featuring {char.Name} in Community Builds
                  </Link>
                </div>
              )}
            </DossierSection>
          </div>
        )}

        {/* ========== TEAMS & SYNERGIES TAB ========== */}
        {activeTab === 'teams' && guide && (
          <div className="space-y-6 animate-fade-in">
            {/* Best Synergies */}
            <DossierSection title="Synergy Operators" icon={<UserCheck size={18} />}>
              <p className="text-[var(--color-text-tertiary)] text-sm mb-4">
                Operators that pair well with {char.Name} due to elemental reactions, buff stacking, or role complementarity.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {guide.synergies.map((name, i) => (
                  <OperatorLink key={i} name={name} />
                ))}
              </div>
            </DossierSection>

            {/* Team Compositions */}
            <DossierSection title="Recommended Teams" icon={<Users size={18} />} accent={elementColor}>
              <div className="space-y-5">
                {guide.teamComps.map((team, i) => (
                  <div key={i} className="p-4 bg-[var(--color-surface-2)] clip-corner-tl border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 mb-3">
                      <Hash size={14} className="text-[var(--color-accent)]" />
                      <h4 className="text-white text-base font-semibold font-tactical uppercase tracking-wider">{team.name}</h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      {team.members.map((member, j) => {
                        const memberChar = CHARACTERS.find(c => c.Name === member);
                        const memberIcon = CHARACTER_ICONS[member];
                        const isCurrentChar = memberChar?.Slug === slug;
                        return (
                          <Link
                            key={j}
                            href={memberChar ? `/characters/${memberChar.Slug}` : '#'}
                            className={`flex flex-col items-center gap-2 p-3 border no-underline transition-all duration-200 ${
                              isCurrentChar
                                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                                : 'border-[var(--color-border)] hover:border-[var(--color-accent)] bg-[var(--color-surface)]'
                            }`}
                          >
                            {memberIcon ? (
                              <Image src={memberIcon} alt={member} width={40} height={40} className="w-10 h-10 object-contain" />
                            ) : (
                              <div className="w-10 h-10 bg-[var(--color-surface-2)] flex items-center justify-center">
                                <span className="text-lg font-bold text-white/20">{member[0]}</span>
                              </div>
                            )}
                            <span className={`text-xs text-center font-medium ${isCurrentChar ? 'text-[var(--color-accent)]' : 'text-white'}`}>{member}</span>
                            {memberChar && (
                              <span className="text-[10px] text-[var(--color-text-muted)]">{memberChar.Role}</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                    <div className="pt-3 border-t border-[var(--color-border)]">
                      <p className="text-[var(--color-text-tertiary)] text-sm leading-relaxed">{team.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DossierSection>

            {/* Elemental Reaction Context */}
            <DossierSection title="Elemental Synergy Notes" icon={<Sparkles size={18} />}>
              <div className="p-4 bg-[var(--color-surface-2)] border-l-2" style={{ borderLeftColor: elementColor }}>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  As a <span className="font-semibold" style={{ color: elementColor }}>{char.Element}</span> operator, {char.Name} benefits from
                  {char.Element === 'Physical' && ' Vulnerable and Crush reactions that amplify Physical damage. Physical compositions excel at stagger-locking enemies and applying multiplicative Physical Susceptibility debuffs.'}
                  {char.Element === 'Heat' && ' Combustion reactions that deal sustained damage over time. Heat teams focus on Melting Flame stack management and Combustion triggering for massive AoE damage.'}
                  {char.Element === 'Cryo' && ' Solidification (freeze) reactions that lock enemies in place. Cryo teams specialize in Shatter combos and Cryo Susceptibility stacking for burst damage windows.'}
                  {char.Element === 'Electric' && ' Electrification reactions that chain damage between enemies. Electric teams focus on Infliction stacking and Arts Burst reactions for sustained elemental damage.'}
                  {char.Element === 'Nature' && ' Corrosion reactions that reduce enemy defenses. Nature teams amplify team damage through susceptibility debuffs and Arts reaction triggers.'}
                </p>
              </div>
            </DossierSection>
          </div>
        )}

        {/* Fallback for tabs when no guide */}
        {activeTab !== 'profile' && !guide && (
          <div className="animate-fade-in">
            <DossierSection title="Data Pending" icon={<BookOpen size={18} />}>
              <div className="text-center py-12">
                <div className="diamond-spinner mx-auto mb-4" />
                <p className="text-[var(--color-text-tertiary)] text-base">Operator guide data for {char.Name} is being compiled.</p>
                <p className="text-[var(--color-text-muted)] text-sm mt-1">Check back after the next RIOS data sync.</p>
              </div>
            </DossierSection>
          </div>
        )}
      </div>

      {/* ==========================================
          STRUCTURED DATA (SEO / GEO)
          ========================================== */}
      {guide && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: `${char.Name} Guide - Arknights: Endfield Build & Teams`,
              description: guide.review,
              author: { '@type': 'Organization', name: 'Zero Sanity', url: 'https://zerosanity.app' },
              publisher: { '@type': 'Organization', name: 'Zero Sanity', url: 'https://zerosanity.app' },
              ...(guide.lastUpdated && { dateModified: guide.lastUpdated }),
              mainEntity: {
                '@type': 'FAQPage',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: `What is the best build for ${char.Name} in Arknights: Endfield?`,
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: `Best weapons: ${guide.bestWeapons.map(w => w.name).join(', ')}. Best gear sets: ${guide.bestGearSets.join(', ')}. Skill priority: ${guide.skillPriority}.`,
                    },
                  },
                  {
                    '@type': 'Question',
                    name: `What are the best teams for ${char.Name}?`,
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: guide.teamComps.map(t => `${t.name}: ${t.members.join(', ')} - ${t.notes}`).join(' | '),
                    },
                  },
                  {
                    '@type': 'Question',
                    name: `Is ${char.Name} good in Arknights: Endfield?`,
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: `${char.Name} is rated ${guide.ratings.overall} tier overall (PvE: ${guide.ratings.pve}, Boss: ${guide.ratings.boss}). ${guide.review}`,
                    },
                  },
                ],
              },
            }),
          }}
        />
      )}
    </div>
  );
}
