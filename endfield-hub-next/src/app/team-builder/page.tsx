'use client';

import { useState, useCallback, useMemo, useEffect, startTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Users, X, Search, Copy, Check, RotateCcw, Share2,
  Zap, Shield, Heart, Flame, Snowflake, Wind, Sword,
  Star, ChevronDown, Filter, Sparkles, ArrowRight,
} from 'lucide-react';
import { CHARACTERS } from '@/lib/data';
import { CHARACTER_ICONS, PROFESSION_ICONS } from '@/lib/assets';
import { ELEMENT_COLORS, RARITY_COLORS } from '@/types/game';
import type { Character, Element, Role, WeaponType } from '@/types/game';

// =============================================
// Elemental Reaction & Tag System
// =============================================

interface TeamTag {
  id: string;
  label: string;
  category: 'nature' | 'heat' | 'cryo' | 'electric' | 'arts' | 'physical' | 'utility' | 'buff';
  color: string;
  description: string;
  check: (chars: Character[]) => boolean;
}

const TEAM_TAGS: TeamTag[] = [
  // Nature
  { id: 'nature-suscept', label: 'Nature Susceptibility', category: 'nature', color: '#69F0AE', description: 'Reduces enemy Nature RES', check: cs => cs.some(c => c.Element === 'Nature' && ['Supporter', 'Caster'].includes(c.Role)) },
  { id: 'nature-amp', label: 'Nature Amp', category: 'nature', color: '#69F0AE', description: 'Amplifies Nature damage', check: cs => cs.filter(c => c.Element === 'Nature').length >= 2 },
  { id: 'nature-inflict', label: 'Nature Infliction', category: 'nature', color: '#69F0AE', description: 'Applies Nature status', check: cs => cs.some(c => c.Element === 'Nature') },
  { id: 'corrosion', label: 'Corrosion', category: 'nature', color: '#69F0AE', description: 'Nature reaction reducing DEF', check: cs => cs.some(c => c.Element === 'Nature' && c.Role === 'Supporter') },

  // Heat
  { id: 'heat-suscept', label: 'Heat Susceptibility', category: 'heat', color: '#FF6B35', description: 'Reduces enemy Heat RES', check: cs => cs.some(c => c.Element === 'Heat' && ['Supporter', 'Caster'].includes(c.Role)) },
  { id: 'heat-amp', label: 'Heat Amp', category: 'heat', color: '#FF6B35', description: 'Amplifies Heat damage', check: cs => cs.filter(c => c.Element === 'Heat').length >= 2 },
  { id: 'heat-inflict', label: 'Heat Infliction', category: 'heat', color: '#FF6B35', description: 'Applies Heat status', check: cs => cs.some(c => c.Element === 'Heat') },
  { id: 'combustion', label: 'Combustion', category: 'heat', color: '#FF6B35', description: 'Heat reaction dealing sustained damage', check: cs => cs.filter(c => c.Element === 'Heat').length >= 2 },

  // Cryo
  { id: 'cryo-suscept', label: 'Cryo Susceptibility', category: 'cryo', color: '#00BFFF', description: 'Reduces enemy Cryo RES', check: cs => cs.some(c => c.Element === 'Cryo' && ['Supporter', 'Assault'].includes(c.Role)) },
  { id: 'cryo-amp', label: 'Cryo Amp', category: 'cryo', color: '#00BFFF', description: 'Amplifies Cryo damage', check: cs => cs.filter(c => c.Element === 'Cryo').length >= 2 },
  { id: 'cryo-inflict', label: 'Cryo Infliction', category: 'cryo', color: '#00BFFF', description: 'Applies Cryo status', check: cs => cs.some(c => c.Element === 'Cryo') },
  { id: 'solidification', label: 'Solidification', category: 'cryo', color: '#00BFFF', description: 'Cryo reaction freezing enemies', check: cs => cs.filter(c => c.Element === 'Cryo').length >= 2 },
  { id: 'shatter', label: 'Shatter', category: 'cryo', color: '#00BFFF', description: 'Break frozen state for burst DMG', check: cs => cs.filter(c => c.Element === 'Cryo').length >= 2 && cs.some(c => ['Guard', 'Assault'].includes(c.Role)) },

  // Electric
  { id: 'electric-suscept', label: 'Electric Susceptibility', category: 'electric', color: '#B388FF', description: 'Reduces enemy Electric RES', check: cs => cs.some(c => c.Element === 'Electric' && ['Supporter', 'Caster'].includes(c.Role)) },
  { id: 'electric-amp', label: 'Electric Amp', category: 'electric', color: '#B388FF', description: 'Amplifies Electric damage', check: cs => cs.filter(c => c.Element === 'Electric').length >= 2 },
  { id: 'electric-inflict', label: 'Electric Infliction', category: 'electric', color: '#B388FF', description: 'Applies Electric status', check: cs => cs.some(c => c.Element === 'Electric') },
  { id: 'electrification', label: 'Electrification', category: 'electric', color: '#B388FF', description: 'Electric chain reaction', check: cs => cs.filter(c => c.Element === 'Electric').length >= 2 },

  // Arts / Physical
  { id: 'arts-suscept', label: 'Arts Susceptibility', category: 'arts', color: '#FFD429', description: 'Reduces enemy Arts RES', check: cs => cs.some(c => c.Role === 'Supporter' && c.Element === 'Nature') },
  { id: 'arts-amp', label: 'Arts Amp', category: 'arts', color: '#FFD429', description: 'Amplifies Arts damage', check: cs => cs.some(c => ['Caster', 'Supporter'].includes(c.Role)) && cs.filter(c => c.Element !== 'Physical').length >= 3 },
  { id: 'phys-suscept', label: 'Physical Susceptibility', category: 'physical', color: '#CFD8DC', description: 'Reduces enemy Physical RES', check: cs => cs.some(c => c.Element === 'Physical' && ['Guard', 'Vanguard'].includes(c.Role)) },

  // Utility
  { id: 'lift', label: 'Lift', category: 'utility', color: '#69F0AE', description: 'Lifts enemies (crowd control)', check: cs => cs.some(c => c.Name === 'Gilberta') },
  { id: 'knock-down', label: 'Knock Down', category: 'utility', color: '#CFD8DC', description: 'Knocks enemies down', check: cs => cs.some(c => c.WeaponType === 'Greatsword' || c.WeaponType === 'Polearm') },
  { id: 'crush', label: 'Crush', category: 'physical', color: '#CFD8DC', description: 'Physical stagger reaction', check: cs => cs.some(c => c.WeaponType === 'Greatsword') && cs.some(c => c.Element === 'Physical') },
  { id: 'breach', label: 'Breach', category: 'physical', color: '#CFD8DC', description: 'Armor breaking mechanic', check: cs => cs.some(c => c.WeaponType === 'Greatsword' && c.Role === 'Assault') },
  { id: 'link', label: 'Link', category: 'utility', color: '#90CAF9', description: 'Link stack generation', check: cs => cs.some(c => c.Name === 'Lifeng' || c.Name === 'Endministrator') },
  { id: 'protection', label: 'Protection', category: 'buff', color: '#81C784', description: 'Team damage reduction', check: cs => cs.some(c => c.Role === 'Defender') },

  // Buffs
  { id: 'sp-return', label: 'SP Return', category: 'buff', color: '#64B5F6', description: 'Returns SP to teammates', check: cs => cs.some(c => c.Name === 'Pogranichnik' || c.Role === 'Vanguard') },
  { id: 'sp-recovery', label: 'SP Recovery', category: 'buff', color: '#64B5F6', description: 'Accelerates SP recovery', check: cs => cs.some(c => c.Name === 'Pogranichnik') },
  { id: 'weaken', label: 'Weaken', category: 'utility', color: '#EF9A9A', description: 'Reduces enemy damage', check: cs => cs.some(c => c.Role === 'Supporter') },
  { id: 'slow', label: 'Slow', category: 'utility', color: '#80DEEA', description: 'Slows enemy movement', check: cs => cs.some(c => c.Element === 'Cryo' || c.Name === 'Gilberta') },
  { id: 'hp-treatment', label: 'HP Treatment', category: 'buff', color: '#81C784', description: 'Team healing', check: cs => cs.some(c => c.Role === 'Supporter' || c.Name === 'Ember') },
  { id: 'shield', label: 'Shield', category: 'buff', color: '#90CAF9', description: 'Provides shields to team', check: cs => cs.some(c => c.Role === 'Defender') },
  { id: 'atk-buff', label: 'ATK Buff (Team)', category: 'buff', color: '#FFD429', description: 'Increases team ATK', check: cs => cs.some(c => c.Name === 'Pogranichnik' || (c.Role === 'Supporter' && c.Rarity >= 5)) },
  { id: 'fervent-morale', label: 'Fervent Morale', category: 'buff', color: '#FF8A65', description: 'Combat morale buff', check: cs => cs.filter(c => c.Rarity >= 6).length >= 3 },
];

const ELEMENT_FILTERS: Element[] = ['Physical', 'Heat', 'Cryo', 'Electric', 'Nature'];
const ROLE_FILTERS: Role[] = ['Guard', 'Defender', 'Supporter', 'Caster', 'Vanguard', 'Assault'];
const WEAPON_FILTERS: WeaponType[] = ['Greatsword', 'Polearm', 'Handcannon', 'Sword', 'Arts Unit'];
const RARITY_FILTERS = [6, 5, 4];

const CATEGORY_COLORS: Record<string, string> = {
  nature: '#69F0AE',
  heat: '#FF6B35',
  cryo: '#00BFFF',
  electric: '#B388FF',
  arts: '#FFD429',
  physical: '#CFD8DC',
  utility: '#90CAF9',
  buff: '#81C784',
};

// =============================================
// Main Component
// =============================================

export default function TeamBuilderPage() {
  const [team, setTeam] = useState<(Character | null)[]>([null, null, null, null]);
  const [search, setSearch] = useState('');
  const [elementFilter, setElementFilter] = useState<Element | null>(null);
  const [roleFilter, setRoleFilter] = useState<Role | null>(null);
  const [weaponFilter, setWeaponFilter] = useState<WeaponType | null>(null);
  const [rarityFilter, setRarityFilter] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragChar, setDragChar] = useState<Character | null>(null);

  // Load team from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const teamParam = params.get('team');
    if (teamParam) {
      const ids = teamParam.split(',').map(Number);
      const loaded = ids.map(id => CHARACTERS.find(c => c.id === id) || null);
      while (loaded.length < 4) loaded.push(null);
      setTeam(loaded.slice(0, 4));
    }
  }, []);

  const activeChars = useMemo(() => team.filter((c): c is Character => c !== null), [team]);

  const activeTags = useMemo(() => {
    if (activeChars.length === 0) return [];
    return TEAM_TAGS.filter(tag => tag.check(activeChars));
  }, [activeChars]);

  const filteredCharacters = useMemo(() => {
    return CHARACTERS.filter(c => {
      if (search && !c.Name.toLowerCase().includes(search.toLowerCase())) return false;
      if (elementFilter && c.Element !== elementFilter) return false;
      if (roleFilter && c.Role !== roleFilter) return false;
      if (weaponFilter && c.WeaponType !== weaponFilter) return false;
      if (rarityFilter && c.Rarity !== rarityFilter) return false;
      return true;
    }).sort((a, b) => b.Rarity - a.Rarity || a.Name.localeCompare(b.Name));
  }, [search, elementFilter, roleFilter, weaponFilter, rarityFilter]);

  const addToTeam = useCallback((char: Character) => {
    startTransition(() => {
      setTeam(prev => {
        if (prev.some(c => c?.id === char.id)) return prev;
        const idx = prev.findIndex(c => c === null);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = char;
        return next;
      });
    });
  }, []);

  const removeFromTeam = useCallback((index: number) => {
    setTeam(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }, []);

  const resetTeam = useCallback(() => {
    setTeam([null, null, null, null]);
  }, []);

  const copyTeamUrl = useCallback(() => {
    const ids = team.map(c => c?.id ?? 0).join(',');
    const url = `${window.location.origin}/team-builder?team=${ids}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [team]);

  const resetFilters = useCallback(() => {
    setSearch('');
    setElementFilter(null);
    setRoleFilter(null);
    setWeaponFilter(null);
    setRarityFilter(null);
  }, []);

  const isInTeam = useCallback((char: Character) => team.some(c => c?.id === char.id), [team]);

  // Stat summary
  const statSummary = useMemo(() => {
    if (activeChars.length === 0) return null;
    const totals = { Strength: 0, Agility: 0, Intellect: 0, Will: 0 };
    activeChars.forEach(c => {
      totals.Strength += c.Strength;
      totals.Agility += c.Agility;
      totals.Intellect += c.Intellect;
      totals.Will += c.Will;
    });
    return totals;
  }, [activeChars]);

  const elementBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    activeChars.forEach(c => { counts[c.Element] = (counts[c.Element] || 0) + 1; });
    return counts;
  }, [activeChars]);

  const roleBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    activeChars.forEach(c => { counts[c.Role] = (counts[c.Role] || 0) + 1; });
    return counts;
  }, [activeChars]);

  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Team Builder - Zero Sanity',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    url: 'https://www.zerosanity.app/team-builder',
    description: 'Plan and optimize squad compositions for Arknights: Endfield',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <div className="max-w-6xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      {/* RIOS Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="diamond-sm diamond-accent" />
          <span className="terminal-text-sm opacity-60">RIOS-TB-001 // TACTICAL TEAM BUILDER // CLEARANCE: LEVEL-3</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-tactical uppercase tracking-wider">Team Builder</h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
          Build and optimize your Arknights: Endfield teams. Check available effects and reactions based on the characters you choose.
        </p>
      </div>

      {/* ==========================================
          YOUR TEAM — Sticky section
          ========================================== */}
      <div className="sticky top-8 z-30 mb-6">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
          {/* Team Header */}
          <div className="flex items-center justify-between px-5 py-3 bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-tactical flex items-center gap-2">
              <Users size={18} className="text-[var(--color-accent)]" />
              Your Team
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={copyTeamUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-tactical uppercase tracking-wider border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-black transition-colors cursor-pointer"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy URL'}
              </button>
              <button
                onClick={resetTeam}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-tactical uppercase tracking-wider text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-red-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Reset team"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          </div>

          {/* Team Slots */}
          <div className="grid grid-cols-4 gap-3 p-4">
            {team.map((char, i) => (
              <div
                key={i}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragChar && !team.some(c => c?.id === dragChar.id)) {
                    const next = [...team];
                    next[i] = dragChar;
                    setTeam(next);
                    setDragChar(null);
                  }
                }}
                className={`relative aspect-square border-2 border-dashed flex flex-col items-center justify-center transition-all duration-200 ${
                  char
                    ? 'border-[var(--color-accent)]/50 bg-[var(--color-surface-2)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]/30'
                }`}
              >
                {char ? (
                  <>
                    <button
                      onClick={() => removeFromTeam(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 border border-[var(--color-border)] flex items-center justify-center z-10 hover:bg-red-500/60 hover:border-red-400 transition-colors cursor-pointer"
                    >
                      <X size={10} className="text-white" />
                    </button>
                    {CHARACTER_ICONS[char.Name] && (
                      <Image src={CHARACTER_ICONS[char.Name]} alt={char.Name} width={64} height={64} className="w-16 h-16 object-contain" />
                    )}
                    <span className="text-xs text-white font-medium mt-1 text-center leading-tight">{char.Name}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ELEMENT_COLORS[char.Element] }} />
                      <span className="text-[10px] text-[var(--color-text-muted)]">{char.Role}</span>
                    </div>
                    {/* Rarity bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: RARITY_COLORS[char.Rarity] || '#666' }} />
                  </>
                ) : (
                  <span className="text-[var(--color-text-muted)] text-xs text-center">
                    Drag<br />character
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==========================================
          TEAM TAGS & REACTIONS
          ========================================== */}
      <div className="mb-6 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3 bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
          <Sparkles size={18} className="text-[var(--color-accent)]" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-tactical">Team Tags & Reactions</h2>
          {activeTags.length > 0 && (
            <span className="text-[var(--color-accent)] text-xs font-mono ml-auto">{activeTags.length} ACTIVE</span>
          )}
        </div>
        <div className="p-4">
          {activeChars.length === 0 ? (
            <p className="text-[var(--color-text-muted)] text-sm text-center py-4">Add characters to your team to see available tags and reactions</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {TEAM_TAGS.map(tag => {
                const isActive = activeTags.some(t => t.id === tag.id);
                return (
                  <div
                    key={tag.id}
                    className={`px-2.5 py-1.5 text-xs border flex items-center gap-1.5 transition-all duration-200 ${
                      isActive
                        ? 'border-current bg-current/10'
                        : 'border-[var(--color-border)]/40 opacity-30'
                    }`}
                    style={{ color: isActive ? tag.color : 'var(--color-text-muted)' }}
                    title={tag.description}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: isActive ? tag.color : 'var(--color-border)' }} />
                    <span className="font-medium">{tag.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          TEAM ANALYSIS (shown when team has members)
          ========================================== */}
      {activeChars.length > 0 && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Element Distribution */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 clip-corner-tl">
            <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-tactical">Element Distribution</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(elementBreakdown).map(([el, count]) => (
                <div key={el} className="flex items-center gap-1.5 px-2 py-1 bg-[var(--color-surface-2)]">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ELEMENT_COLORS[el as Element] }} />
                  <span className="text-sm text-white font-medium">{el}</span>
                  <span className="text-xs text-[var(--color-accent)] font-mono">x{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Role Distribution */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 clip-corner-tl">
            <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-tactical">Role Distribution</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(roleBreakdown).map(([role, count]) => (
                <div key={role} className="flex items-center gap-1.5 px-2 py-1 bg-[var(--color-surface-2)]">
                  {PROFESSION_ICONS[role] && <Image src={PROFESSION_ICONS[role]} alt={role} width={16} height={16} className="w-4 h-4" />}
                  <span className="text-sm text-white font-medium">{role}</span>
                  <span className="text-xs text-[var(--color-accent)] font-mono">x{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stat Totals */}
          {statSummary && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 clip-corner-tl">
              <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-tactical">Team Stat Totals</span>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {[
                  { label: 'STR', value: statSummary.Strength, color: '#FF6B35' },
                  { label: 'AGI', value: statSummary.Agility, color: '#00BFFF' },
                  { label: 'INT', value: statSummary.Intellect, color: '#B388FF' },
                  { label: 'WIL', value: statSummary.Will, color: '#69F0AE' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between px-2 py-1 bg-[var(--color-surface-2)]">
                    <span className="text-xs font-mono" style={{ color: s.color }}>{s.label}</span>
                    <span className="text-sm text-white font-mono font-bold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          CHARACTER ROSTER
          ========================================== */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3 bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
          <Users size={18} className="text-[var(--color-accent)]" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-tactical">Characters</h2>
          <span className="text-[var(--color-text-muted)] text-xs font-mono ml-2">Showing {filteredCharacters.length} characters</span>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={e => startTransition(() => setSearch(e.target.value))}
              placeholder="Search characters..."
              className="w-full pl-9 pr-8 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-sm font-body focus:border-[var(--color-accent)] focus:outline-none transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white cursor-pointer">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Rarity filters */}
            {RARITY_FILTERS.map(r => (
              <button
                key={r}
                onClick={() => setRarityFilter(rarityFilter === r ? null : r)}
                className={`px-2 py-1 text-xs font-mono border transition-colors cursor-pointer ${
                  rarityFilter === r
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]/50'
                }`}
              >
                {r}★
              </button>
            ))}

            <div className="w-px h-5 bg-[var(--color-border)]" />

            {/* Element filters */}
            {ELEMENT_FILTERS.map(el => (
              <button
                key={el}
                onClick={() => setElementFilter(elementFilter === el ? null : el)}
                className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                  elementFilter === el ? 'scale-110 shadow-lg' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: `${ELEMENT_COLORS[el]}${elementFilter === el ? 'FF' : '40'}`,
                  borderColor: elementFilter === el ? ELEMENT_COLORS[el] : 'transparent',
                }}
                title={el}
              />
            ))}

            <div className="w-px h-5 bg-[var(--color-border)]" />

            {/* Role filters */}
            {ROLE_FILTERS.map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(roleFilter === role ? null : role)}
                className={`px-2 py-1 text-xs border transition-colors cursor-pointer ${
                  roleFilter === role
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]/50'
                }`}
              >
                {role}
              </button>
            ))}

            {(elementFilter || roleFilter || weaponFilter || rarityFilter) && (
              <>
                <div className="w-px h-5 bg-[var(--color-border)]" />
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors cursor-pointer"
                >
                  <RotateCcw size={10} />
                  Reset
                </button>
              </>
            )}
          </div>
        </div>

        {/* Character Grid */}
        <div className="p-4">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {filteredCharacters.map(char => {
              const inTeam = isInTeam(char);
              const icon = CHARACTER_ICONS[char.Name];
              return (
                <div
                  key={char.id}
                  draggable
                  onDragStart={() => setDragChar(char)}
                  onDragEnd={() => setDragChar(null)}
                  onClick={() => !inTeam && addToTeam(char)}
                  className={`relative flex flex-col items-center cursor-pointer transition-all duration-200 p-1.5 border group ${
                    inTeam
                      ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 opacity-50 cursor-not-allowed'
                      : 'border-[var(--color-border)] hover:border-[var(--color-accent)] bg-[var(--color-surface-2)]'
                  }`}
                >
                  {/* Rarity indicator */}
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: RARITY_COLORS[char.Rarity] || '#666' }} />
                  {icon ? (
                    <Image src={icon} alt={char.Name} width={48} height={48} className="w-12 h-12 object-contain" />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center">
                      <span className="text-lg font-bold text-white/20">{char.Name[0]}</span>
                    </div>
                  )}
                  <span className="text-[10px] text-white text-center leading-tight mt-1 font-medium">{char.Name}</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ELEMENT_COLORS[char.Element] }} />
                    <span className="text-[8px] text-[var(--color-text-muted)]">{char.Rarity}★</span>
                  </div>
                  {inTeam && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Check size={16} className="text-[var(--color-accent)]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==========================================
          SEO Structured Data
          ========================================== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Arknights: Endfield Team Builder',
            description: 'Build and optimize your Arknights: Endfield teams. Check available effects, elemental reactions, and team synergies.',
            url: 'https://zerosanity.app/team-builder',
            applicationCategory: 'GameApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
    </div>
  );
}
