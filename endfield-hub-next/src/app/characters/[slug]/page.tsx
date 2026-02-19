'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Zap, Wind, Brain, Heart, Star, Sword, Shield, ChevronDown, ChevronUp, Trophy, Target, Users, Crosshair, ThumbsUp, ThumbsDown, BookOpen, Lightbulb, Wrench, Calendar, Package, Copy, Check, ExternalLink } from 'lucide-react';
import { CHARACTERS } from '@/lib/data';
import { ELEMENT_COLORS, RARITY_COLORS } from '@/types/game';
import { CHARACTER_BANNERS, CHARACTER_ICONS, CHARACTER_SPLASH, PROFESSION_ICONS, WEAPON_ICONS, EQUIPMENT_ICONS } from '@/lib/assets';
import { getOperatorGuide, TIER_COLORS } from '@/data/guides';
import type { TierRating, OperatorGuide } from '@/data/guides';
import { fetchOperatorGuide, fetchBlueprints } from '@/lib/api';
import { SCRAPED_BLUEPRINTS, getBlueprintsForOperator, type BlueprintEntry } from '@/data/blueprints';

function TierBadge({ tier, label }: { tier: TierRating; label: string }) {
  return (
    <div className="flex items-center justify-between p-2 bg-[var(--color-surface-2)]">
      <span className="text-[var(--color-text-tertiary)] text-xs uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold font-mono px-2 py-0.5" style={{ color: TIER_COLORS[tier], borderBottom: `2px solid ${TIER_COLORS[tier]}` }}>
        {tier}
      </span>
    </div>
  );
}

function StatBar({ label, value, max, color, icon }: { label: string; value: number; max: number; color: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 w-24 shrink-0">
        {icon}
        <span className="text-[var(--color-text-secondary)] text-xs">{label}</span>
      </div>
      <div className="flex-1 h-2 bg-[var(--color-surface-2)] overflow-hidden">
        <div className="h-full transition-all" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
      </div>
      <span className="text-white text-xs font-mono w-10 text-right">{value}</span>
    </div>
  );
}

function Section({ title, icon, children, accent }: { title: string; icon: React.ReactNode; children: React.ReactNode; accent?: string }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]" style={accent ? { borderLeftWidth: '3px', borderLeftColor: accent } : {}}>
        <span style={{ color: accent || 'var(--color-accent)' }}>{icon}</span>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-tactical">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function CharacterDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const char = CHARACTERS.find(c => c.Slug === slug);
  const [guide, setGuide] = useState<OperatorGuide | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [communityBuilds, setCommunityBuilds] = useState<BlueprintEntry[]>([]);
  const [copiedBpId, setCopiedBpId] = useState<number | null>(null);

  useEffect(() => {
    // Load static guide immediately
    const staticGuide = getOperatorGuide(slug);
    if (staticGuide) setGuide(staticGuide);

    // Then try to overlay Strapi CMS data
    fetchOperatorGuide(slug).then((strapiData) => {
      if (strapiData) {
        const attrs = strapiData.attributes || strapiData;
        setGuide(prev => ({
          ...(prev || {} as OperatorGuide),
          slug,
          ...(attrs.review && { review: attrs.review }),
          ...(attrs.introduction && { introduction: attrs.introduction }),
          ...(attrs.gameplayTips && { gameplayTips: attrs.gameplayTips }),
          ...(attrs.gearNotes && { gearNotes: attrs.gearNotes }),
          ...(attrs.lastUpdated && { lastUpdated: attrs.lastUpdated }),
        }));
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [slug]);

  // Load community builds tagged with this operator
  useEffect(() => {
    if (!char) return;
    // Check static blueprints first
    const staticBuilds = getBlueprintsForOperator(char.Name);
    setCommunityBuilds(staticBuilds);

    // Also check Strapi blueprints for operator tags
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
      // Merge static + strapi, deduplicate by title
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
        <p className="text-[var(--color-text-secondary)]">Character not found</p>
        <Link href="/characters" className="text-[var(--color-accent)] text-sm mt-2 inline-block">Back to Characters</Link>
      </div>
    );
  }

  const rarityColor = RARITY_COLORS[char.Rarity] || '#999';
  const elementColor = ELEMENT_COLORS[char.Element];
  const maxStat = 200;
  const profIcon = PROFESSION_ICONS[char.Role];
  const splashUrl = CHARACTER_SPLASH[char.Name];

  return (
    <div>
      <Link href="/characters" className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-white text-sm mb-4 no-underline">
        <ArrowLeft size={16} /> Back to Operators
      </Link>

      {/* Hero Banner */}
      {CHARACTER_BANNERS[char.Name] && (
        <div className="mb-6 clip-corner-tl overflow-hidden border border-[var(--color-border)] relative">
          <Image
            src={CHARACTER_BANNERS[char.Name]}
            alt={`${char.Name} banner`}
            width={900}
            height={192}
            className="w-full h-48 object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-[var(--color-text-tertiary)]">RIOS-OPS // {char.Slug.toUpperCase()}</span>
            </div>
            <h1 className="text-3xl font-bold text-white font-tactical uppercase tracking-wide">{char.Name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {Array.from({ length: char.Rarity }, (_, i) => (
                <Star key={i} size={14} fill={rarityColor} color={rarityColor} />
              ))}
            </div>
          </div>
          {guide && (
            <div className="absolute top-4 right-4 px-3 py-1 clip-corner-tl" style={{ backgroundColor: `${TIER_COLORS[guide.ratings.overall]}20`, border: `1px solid ${TIER_COLORS[guide.ratings.overall]}` }}>
              <span className="text-xs text-[var(--color-text-tertiary)] mr-2">TIER</span>
              <span className="text-lg font-bold font-mono" style={{ color: TIER_COLORS[guide.ratings.overall] }}>{guide.ratings.overall}</span>
            </div>
          )}
        </div>
      )}

      {/* Profile Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-3 flex items-center gap-3">
          {profIcon && <Image src={profIcon} alt={char.Role} width={28} height={28} className="w-7 h-7 opacity-80" />}
          <div>
            <p className="text-[var(--color-text-tertiary)] text-[10px] uppercase tracking-wider">Role</p>
            <p className="text-white text-sm font-semibold">{char.Role}</p>
          </div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-3 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: elementColor }} />
          <div>
            <p className="text-[var(--color-text-tertiary)] text-[10px] uppercase tracking-wider">Element</p>
            <p className="text-sm font-semibold" style={{ color: elementColor }}>{char.Element}</p>
          </div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-3 flex items-center gap-3">
          <Sword size={18} className="text-[var(--color-text-tertiary)]" />
          <div>
            <p className="text-[var(--color-text-tertiary)] text-[10px] uppercase tracking-wider">Weapon</p>
            <p className="text-white text-sm font-semibold">{char.WeaponType}</p>
          </div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-3 flex items-center gap-3">
          <Star size={18} style={{ color: rarityColor }} />
          <div>
            <p className="text-[var(--color-text-tertiary)] text-[10px] uppercase tracking-wider">Rarity</p>
            <p className="text-sm font-semibold" style={{ color: rarityColor }}>{'★'.repeat(char.Rarity)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Portrait & Stats */}
        <div className="space-y-6">
          {/* Portrait */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
            <div
              className="aspect-square flex items-center justify-center relative"
              style={{ background: `linear-gradient(135deg, ${elementColor}20, var(--color-surface))` }}
            >
              {CHARACTER_ICONS[char.Name] ? (
                <Image src={CHARACTER_ICONS[char.Name]} alt={char.Name} width={192} height={192} className="w-48 h-48 object-contain" />
              ) : (
                <span className="text-8xl font-bold text-white/10">{char.Name[0]}</span>
              )}
            </div>
          </div>

          {/* Ratings */}
          {guide && (
            <Section title="Ratings" icon={<Trophy size={16} />} accent={TIER_COLORS[guide.ratings.overall]}>
              <div className="space-y-2">
                <TierBadge tier={guide.ratings.overall} label="Overall" />
                <TierBadge tier={guide.ratings.pve} label="PvE" />
                <TierBadge tier={guide.ratings.boss} label="Boss" />
                <TierBadge tier={guide.ratings.support} label="Support" />
              </div>
            </Section>
          )}

          {/* Attributes */}
          <Section title={`Attributes (Lv.90)`} icon={<Target size={16} />}>
            <div className="space-y-3">
              <StatBar label="Strength" value={char.Strength} max={maxStat} color="#FF6B35" icon={<Zap size={14} className="text-orange-400" />} />
              <StatBar label="Agility" value={char.Agility} max={maxStat} color="#00BFFF" icon={<Wind size={14} className="text-blue-400" />} />
              <StatBar label="Intellect" value={char.Intellect} max={maxStat} color="#9B59B6" icon={<Brain size={14} className="text-purple-400" />} />
              <StatBar label="Will" value={char.Will} max={maxStat} color="#27AE60" icon={<Heart size={14} className="text-green-400" />} />
            </div>
          </Section>
        </div>

        {/* Right Column - Guide Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <Section title="Overview" icon={<BookOpen size={16} />}>
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{char.Description}</p>
          </Section>

          {guide && (
            <>
              {/* Introduction (longform GEO content) */}
              {guide.introduction && (
                <Section title="Introduction" icon={<BookOpen size={16} />} accent={elementColor}>
                  <div className="text-[var(--color-text-secondary)] text-sm leading-relaxed whitespace-pre-line">
                    {guide.introduction}
                  </div>
                </Section>
              )}

              {/* Last Updated Badge */}
              {guide.lastUpdated && (
                <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
                  <Calendar size={12} />
                  <span>Guide last updated: {guide.lastUpdated}</span>
                </div>
              )}

              {/* Review */}
              <Section title="Review" icon={<BookOpen size={16} />} accent={TIER_COLORS[guide.ratings.overall]}>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{guide.review}</p>
              </Section>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Section title="Pros" icon={<ThumbsUp size={16} />} accent="#27AE60">
                  <ul className="space-y-2">
                    {guide.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-green-400 mt-0.5 shrink-0">+</span>
                        <span className="text-[var(--color-text-secondary)]">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
                <Section title="Cons" icon={<ThumbsDown size={16} />} accent="#FF4444">
                  <ul className="space-y-2">
                    {guide.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-red-400 mt-0.5 shrink-0">-</span>
                        <span className="text-[var(--color-text-secondary)]">{con}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              </div>

              {/* Best Weapons */}
              <Section title="Best Weapons" icon={<Sword size={16} />}>
                <div className="space-y-3">
                  {guide.bestWeapons.map((w, i) => {
                    const weaponIcon = WEAPON_ICONS[w.name];
                    return (
                      <div key={i} className="flex items-center gap-3 p-2 bg-[var(--color-surface-2)] clip-corner-tl">
                        <div className="w-10 h-10 clip-corner-tl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                          {weaponIcon ? (
                            <Image src={weaponIcon} alt={w.name} width={40} height={40} className="w-10 h-10 object-contain" />
                          ) : (
                            <Sword size={16} className="text-[var(--color-text-tertiary)]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-semibold truncate">{w.name}</span>
                            <span className="text-[var(--color-accent)] text-xs font-mono">{w.rating}/5</span>
                          </div>
                          <p className="text-[var(--color-text-tertiary)] text-xs mt-0.5">{w.notes}</p>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          {Array.from({ length: 5 }, (_, j) => (
                            <div key={j} className="w-1.5 h-4" style={{ backgroundColor: j < w.rating ? 'var(--color-accent)' : 'var(--color-surface)' }} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>

              {/* Best Gear Sets */}
              <Section title="Best Gear Sets" icon={<Shield size={16} />}>
                <div className="flex flex-wrap gap-2">
                  {guide.bestGearSets.map((set, i) => {
                    const eqIcon = EQUIPMENT_ICONS[set];
                    return (
                      <span key={i} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white">
                        {eqIcon && <Image src={eqIcon} alt={set} width={24} height={24} className="w-6 h-6 object-contain" unoptimized />}
                        {set}
                      </span>
                    );
                  })}
                </div>
              </Section>

              {/* Skill Priority */}
              <Section title="Skill Priority" icon={<Crosshair size={16} />}>
                <p className="text-[var(--color-accent)] text-sm font-mono">{guide.skillPriority}</p>
              </Section>

              {/* Synergies */}
              <Section title="Best Synergies" icon={<Users size={16} />}>
                <div className="flex flex-wrap gap-2">
                  {guide.synergies.map((name, i) => {
                    const synChar = CHARACTERS.find(c => c.Name === name);
                    const synIcon = CHARACTER_ICONS[name];
                    return (
                      <Link
                        key={i}
                        href={synChar ? `/characters/${synChar.Slug}` : '#'}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors no-underline"
                      >
                        {synIcon && <Image src={synIcon} alt={name} width={20} height={20} className="w-5 h-5 object-contain" />}
                        <span className="text-white text-sm">{name}</span>
                      </Link>
                    );
                  })}
                </div>
              </Section>

              {/* Team Compositions */}
              <Section title="Best Teams" icon={<Users size={16} />} accent={elementColor}>
                <div className="space-y-4">
                  {guide.teamComps.map((team, i) => (
                    <div key={i} className="p-3 bg-[var(--color-surface-2)] clip-corner-tl">
                      <h4 className="text-white text-sm font-semibold mb-2">{team.name}</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {team.members.map((member, j) => {
                          const memberChar = CHARACTERS.find(c => c.Name === member);
                          const memberIcon = CHARACTER_ICONS[member];
                          const isCurrentChar = memberChar?.Slug === slug;
                          return (
                            <Link
                              key={j}
                              href={memberChar ? `/characters/${memberChar.Slug}` : '#'}
                              className={`flex items-center gap-2 px-2 py-1 border no-underline transition-colors ${
                                isCurrentChar
                                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                                  : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'
                              }`}
                            >
                              {memberIcon && <Image src={memberIcon} alt={member} width={20} height={20} className="w-5 h-5 object-contain" />}
                              <span className={`text-xs ${isCurrentChar ? 'text-[var(--color-accent)]' : 'text-white'}`}>{member}</span>
                            </Link>
                          );
                        })}
                      </div>
                      <p className="text-[var(--color-text-tertiary)] text-xs">{team.notes}</p>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Gameplay Tips */}
              {guide.gameplayTips && guide.gameplayTips.length > 0 && (
                <Section title="Gameplay Tips" icon={<Lightbulb size={16} />} accent="#FFD429">
                  <ul className="space-y-3">
                    {guide.gameplayTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="text-[var(--color-accent)] font-mono text-xs mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                        <span className="text-[var(--color-text-secondary)] leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Gear Notes (detailed equipment explanation) */}
              {guide.gearNotes && (
                <Section title="Gear & Equipment Deep Dive" icon={<Wrench size={16} />}>
                  <div className="text-[var(--color-text-secondary)] text-sm leading-relaxed whitespace-pre-line">
                    {guide.gearNotes}
                  </div>
                </Section>
              )}

              {/* Community Builds */}
              <Section title={`Community Builds for ${char.Name}`} icon={<Package size={16} />} accent={elementColor}>
                {communityBuilds.length > 0 ? (
                  <div className="space-y-3">
                    {communityBuilds.map(bp => (
                      <div key={bp.id} className="flex items-start gap-3 p-3 bg-[var(--color-surface-2)] clip-corner-tl border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors group">
                        {bp.previewImage && (
                          <div className="w-20 h-16 flex-shrink-0 relative overflow-hidden border border-[var(--color-border)]">
                            <Image src={bp.previewImage} alt={bp.Title} fill className="object-cover" sizes="80px" unoptimized />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/blueprints/${bp.slug}`}
                              className="text-white text-sm font-semibold truncate hover:text-[var(--color-accent)] transition-colors no-underline"
                            >
                              {bp.Title}
                            </Link>
                            {bp.complexity && (
                              <span className={`text-[9px] px-1.5 py-0.5 font-mono border shrink-0 ${
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
                          {bp.outputsPerMin?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {bp.outputsPerMin.slice(0, 2).map((o, i) => (
                                <span key={i} className="text-[10px] text-[var(--color-accent)] font-mono">
                                  {o.rate}/min {o.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <Link
                            href={`/blueprints/${bp.slug}`}
                            className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors no-underline"
                            title="View blueprint"
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
                              className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
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
                  <div className="text-center py-6">
                    <p className="text-[var(--color-text-muted)] text-sm mb-2">No community builds tagged for {char.Name} yet.</p>
                    <Link
                      href="/blueprints"
                      className="text-[var(--color-accent)] text-xs hover:underline no-underline"
                    >
                      Submit a blueprint and tag {char.Name} to feature it here
                    </Link>
                  </div>
                )}
              </Section>
            </>
          )}

          {!guide && (
            <Section title="Guide Coming Soon" icon={<BookOpen size={16} />}>
              <p className="text-[var(--color-text-tertiary)] text-sm">A comprehensive guide for {char.Name} is currently being prepared.</p>
            </Section>
          )}
        </div>
      </div>

      {/* Structured Data for GEO (Google Generative Engine Optimization) */}
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
