'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Heart, Eye, Copy, Share2, Star, Users, ChevronRight } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { CHARACTERS, WEAPONS } from '@/lib/data';
import { CHARACTER_BANNERS, CHARACTER_ICONS, WEAPON_ICONS, EQUIPMENT_ICONS, PROFESSION_ICONS } from '@/lib/assets';
import { WEAPON_DATA } from '@/data/weapons';
import { GEAR_SETS } from '@/data/gear';
import { ELEMENT_COLORS, RARITY_COLORS } from '@/types/game';
import type { Element } from '@/types/game';

interface BuildCharacter {
  name: string;
  weapon?: string;
  equipment?: string;
  notes?: string;
  skillLevels?: number[];
}

interface Build {
  id: string;
  name: string;
  type: 'single' | 'team';
  characters: BuildCharacter[];
  tags: string[];
  notes: string;
  isPublic: boolean;
  likes: number;
  views: number;
  createdAt: number;
  updatedAt: number;
  author?: string;
}

// Sample builds (same as main page)
const SAMPLE_BUILDS: Build[] = [
  {
    id: 'laevatain-hypercarry',
    name: 'Laevatain Hypercarry',
    type: 'single',
    characters: [{
      name: 'Laevatain',
      weapon: 'Umbral Torch',
      equipment: 'Type 50 Yinglung',
      skillLevels: [10, 10, 10, 10],
      notes: 'Main DPS - prioritize Heat DMG and Arts Intensity. Umbral Torch stacks perfectly with her kit.'
    }],
    tags: ['Meta', 'DPS'],
    notes: 'Best-in-slot setup for Laevatain. Umbral Torch provides the highest damage ceiling with Type 50 Yinglung for crit stacking. Focus on building Intellect and Heat DMG. Use combo skills to maintain Yinglung\'s Edge stacks, then unleash ultimate for massive burst.',
    isPublic: true,
    likes: 47,
    views: 312,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    author: 'ZeroSanity Staff',
  },
  {
    id: 'cryo-freeze-team',
    name: 'Cryo Freeze Team',
    type: 'team',
    characters: [
      {
        name: 'Last Rite',
        weapon: 'Exemplar',
        equipment: 'Tide Surge',
        skillLevels: [10, 10, 8, 10],
        notes: 'Main DPS - stack Physical DMG and maximize greatsword combo chains.'
      },
      {
        name: 'Yvonne',
        weapon: 'Navigator',
        equipment: 'Type 50 Yinglung',
        skillLevels: [8, 10, 10, 8],
        notes: 'Sub-DPS - provides Cryo burst damage and ranged support.'
      },
      {
        name: 'Xaihi',
        weapon: 'Wild Wanderer',
        equipment: 'LYNX',
        skillLevels: [6, 8, 10, 6],
        notes: 'Healer - keeps team alive with consistent healing and shields.'
      },
      {
        name: 'Snowshine',
        weapon: 'Seeker of Dark Lung',
        equipment: 'Æthertech',
        skillLevels: [8, 8, 8, 10],
        notes: 'Tank - absorbs damage and applies Cryo Infliction for team synergy.'
      },
    ],
    tags: ['Meta', 'Boss Kill'],
    notes: 'Full cryo team that chains freeze reactions. Last Rite as main DPS, Yvonne for sub-DPS burst, Xaihi healing, Snowshine tanking. Rotation: Snowshine applies Cryo Infliction → Yvonne burst → Last Rite combo chains. Keep enemies frozen for maximum damage uptime.',
    isPublic: true,
    likes: 83,
    views: 621,
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 5,
    author: 'ZeroSanity Staff',
  },
  {
    id: 'f2p-endministrator',
    name: 'F2P Endministrator',
    type: 'single',
    characters: [{
      name: 'Endministrator',
      weapon: 'Fortmaker',
      equipment: 'Swordmancer',
      skillLevels: [10, 10, 8, 10],
      notes: 'Versatile protagonist build - balanced stats make it work in any content.'
    }],
    tags: ['F2P', 'DPS'],
    notes: 'Budget-friendly build using the free protagonist. Fortmaker is a solid 5-star option that scales well. Swordmancer set provides Physical Status synergy. Great for new players - all materials are farmable. Stack Agility and Physical DMG for best results.',
    isPublic: true,
    likes: 124,
    views: 891,
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now() - 86400000 * 10,
    author: 'ZeroSanity Staff',
  },
  {
    id: 'physical-quickswap',
    name: 'Physical Quickswap',
    type: 'team',
    characters: [
      {
        name: 'Endministrator',
        weapon: 'Forgeborn Scathe',
        equipment: 'Swordmancer',
        skillLevels: [10, 10, 8, 10],
        notes: 'Primary swap target - builds combo gauge quickly with sword attacks.'
      },
      {
        name: 'Lifeng',
        weapon: 'Valiant',
        equipment: 'Type 50 Yinglung',
        skillLevels: [8, 10, 10, 8],
        notes: 'Polearm specialist - high burst after combo gauge is filled.'
      },
      {
        name: 'Chen Qianyu',
        weapon: 'Sundering Steel',
        equipment: 'Hot Work',
        skillLevels: [10, 10, 8, 8],
        notes: 'Counter-focused Guard - exceptional Agility enables precise dodges and counters.'
      },
      {
        name: 'Gilberta',
        weapon: 'Opus: Etch Figure',
        equipment: 'LYNX',
        skillLevels: [6, 8, 10, 6],
        notes: 'Healer/Support - Nature buffs and sustained team healing.'
      },
    ],
    tags: ['Meta', 'Speedrun'],
    notes: 'Rapid character swapping for continuous combo chains. Each character builds combo gauge for the next. Focus on maintaining combo stacks across all operators. Swap when combo skill is ready to maximize Yinglung\'s Edge stacks. Gilberta provides safety net healing.',
    isPublic: true,
    likes: 56,
    views: 445,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 2,
    author: 'ZeroSanity Staff',
  },
  {
    id: 'ember-solo-tank',
    name: 'Ember Solo Tank',
    type: 'single',
    characters: [{
      name: 'Ember',
      weapon: 'Thunderberge',
      equipment: 'Æthertech',
      skillLevels: [8, 8, 10, 10],
      notes: 'Unkillable tank - combo skill provides massive shields and self-healing.'
    }],
    tags: ['Tank', 'Off-Meta'],
    notes: 'Ember can solo-tank most content with Æthertech poise stacking. Thunderberge adds self-healing on hit. Build Strength and HP for maximum survivability. Use combo skill on cooldown for shield uptime. Great for solo challenges and exploration.',
    isPublic: true,
    likes: 31,
    views: 198,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000,
    author: 'ZeroSanity Staff',
  },
  {
    id: 'electric-overload',
    name: 'Electric Overload',
    type: 'team',
    characters: [
      {
        name: 'Arclight',
        weapon: 'Rapid Ascent',
        equipment: 'Hot Work',
        skillLevels: [10, 10, 8, 10],
        notes: 'Primary Electric DPS - fast sword attacks apply Electrification rapidly.'
      },
      {
        name: 'Perlica',
        weapon: 'Detonation Unit',
        equipment: 'Eternal Xiranite',
        skillLevels: [8, 10, 10, 8],
        notes: 'Arts Caster - detonates Electric Infliction for massive AoE damage.'
      },
      {
        name: 'Avywenna',
        weapon: 'Chimeric Justice',
        equipment: 'Type 50 Yinglung',
        skillLevels: [8, 8, 10, 8],
        notes: 'Polearm DPS - extends Electric chains with combo skills.'
      },
      {
        name: 'Antal',
        weapon: 'Hypernova Auto',
        equipment: 'Mordvolt Insulation',
        skillLevels: [6, 8, 10, 6],
        notes: 'Electric Support - buffs team\'s Arts DMG and provides sustained Electric application.'
      },
    ],
    tags: ['Fun', 'DPS'],
    notes: 'All-electric team for maximum elemental reaction chains. Very satisfying to play even if not perfectly meta. Chain Electrification across all enemies for screen-wide damage. Perlica detonates for huge burst. Antal provides consistent buffs. Great for AoE encounters.',
    isPublic: true,
    likes: 42,
    views: 267,
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 86400000 * 4,
    author: 'ZeroSanity Staff',
  },
  {
    id: 'nature-corruption-core',
    name: 'Nature Corruption Core',
    type: 'team',
    characters: [
      {
        name: 'Ardelia',
        weapon: 'Chivalric Virtues',
        equipment: 'LYNX',
        skillLevels: [6, 8, 10, 8],
        notes: 'Main healer - high Will provides massive healing output.'
      },
      {
        name: 'Gilberta',
        weapon: 'Opus: Etch Figure',
        equipment: 'Eternal Xiranite',
        skillLevels: [6, 8, 10, 6],
        notes: 'Sub-healer/Support - Nature buffs and Lifted application.'
      },
      {
        name: 'Fluorite',
        weapon: 'Fluorescent Roc',
        equipment: 'Hot Work',
        skillLevels: [8, 10, 8, 8],
        notes: 'Nature Caster DPS - handcannon ranged attacks with high Agility.'
      },
      {
        name: 'Ember',
        weapon: 'Former Finery',
        equipment: 'Æthertech',
        skillLevels: [8, 8, 10, 10],
        notes: 'Off-role tank - provides frontline protection while healers work.'
      },
    ],
    tags: ['Support', 'Healer', 'Off-Meta'],
    notes: 'Double healer comp focused on Nature element synergy and Corrosion application. Incredibly safe for difficult content. Ardelia and Gilberta provide overlapping heals and buffs. Fluorite adds Nature DPS from backline. Ember tanks. Can outlast nearly any encounter.',
    isPublic: true,
    likes: 29,
    views: 183,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 2,
    author: 'ZeroSanity Staff',
  },
  {
    id: 'heat-combustion-burst',
    name: 'Heat Combustion Burst',
    type: 'team',
    characters: [
      {
        name: 'Laevatain',
        weapon: 'Umbral Torch',
        equipment: 'Type 50 Yinglung',
        skillLevels: [10, 10, 10, 10],
        notes: 'Main DPS - ultimate nuke with Heat DMG stacking.'
      },
      {
        name: 'Wulfgard',
        weapon: 'Rational Farewell',
        equipment: 'Hot Work',
        skillLevels: [8, 10, 8, 8],
        notes: 'Heat Caster - applies Combustion and provides ranged DPS.'
      },
      {
        name: 'Akekuri',
        weapon: 'Thermite Cutter',
        equipment: 'Frontiers',
        skillLevels: [8, 8, 10, 8],
        notes: 'Heat Vanguard - fast sword attacks maintain Combustion uptime.'
      },
      {
        name: 'Gilberta',
        weapon: 'Delivery Guaranteed',
        equipment: 'LYNX',
        skillLevels: [6, 8, 10, 6],
        notes: 'Healer - off-element support for survivability.'
      },
    ],
    tags: ['DPS', 'Speedrun'],
    notes: 'Triple Heat DPS focused on Combustion stacking and burst windows. Apply Combustion with Wulfgard → stack with Akekuri → detonate with Laevatain ultimate. Gilberta heals when needed. Extremely high damage but requires careful resource management. Best for short fights.',
    isPublic: true,
    likes: 38,
    views: 241,
    createdAt: Date.now() - 86400000 * 8,
    updatedAt: Date.now() - 86400000 * 6,
    author: 'ZeroSanity Staff',
  },
  {
    id: 'balanced-rainbow',
    name: 'Balanced Rainbow',
    type: 'team',
    characters: [
      {
        name: 'Endministrator',
        weapon: 'Forgeborn Scathe',
        equipment: 'Swordmancer',
        skillLevels: [10, 10, 8, 10],
        notes: 'Physical DPS - well-rounded stats fit any situation.'
      },
      {
        name: 'Laevatain',
        weapon: 'Umbral Torch',
        equipment: 'Hot Work',
        skillLevels: [10, 10, 10, 10],
        notes: 'Heat DPS - burst damage dealer.'
      },
      {
        name: 'Last Rite',
        weapon: 'Khravengger',
        equipment: 'Tide Surge',
        skillLevels: [10, 10, 8, 10],
        notes: 'Cryo DPS - greatsword chains with freeze application.'
      },
      {
        name: 'Arclight',
        weapon: 'Rapid Ascent',
        equipment: 'Frontiers',
        skillLevels: [10, 10, 8, 10],
        notes: 'Electric DPS - high Agility enables rapid elemental application.'
      },
    ],
    tags: ['DPS', 'Fun'],
    notes: 'Rainbow team with 4 different elements for maximum elemental coverage. Can adapt to any enemy weakness. No healer means high risk/high reward gameplay. Relies on dodging and killing enemies before they kill you. Great for players who know enemy patterns well.',
    isPublic: true,
    likes: 51,
    views: 329,
    createdAt: Date.now() - 86400000 * 9,
    updatedAt: Date.now() - 86400000 * 7,
    author: 'ZeroSanity Staff',
  },
  {
    id: 'vanguard-rush',
    name: 'Vanguard Rush',
    type: 'team',
    characters: [
      {
        name: 'Pogranichnik',
        weapon: 'Never Rest',
        equipment: 'Swordmancer',
        skillLevels: [10, 10, 8, 10],
        notes: 'Physical Vanguard - high Will provides sustain through SP recovery.'
      },
      {
        name: 'Arclight',
        weapon: 'Rapid Ascent',
        equipment: 'MI Security',
        skillLevels: [10, 10, 8, 10],
        notes: 'Electric Vanguard - lightning-fast attacks and high mobility.'
      },
      {
        name: 'Akekuri',
        weapon: 'Aspirant',
        equipment: 'Frontiers',
        skillLevels: [8, 8, 10, 8],
        notes: 'Heat Vanguard - swift burn application and combo chains.'
      },
      {
        name: 'Alesh',
        weapon: 'Finchaser 3.0',
        equipment: 'Tide Surge',
        skillLevels: [10, 8, 8, 10],
        notes: 'Cryo Vanguard - high Strength provides frontline pressure.'
      },
    ],
    tags: ['Speedrun', 'Fun'],
    notes: 'All-Vanguard team focused on aggressive field control and rapid skill rotations. High mobility and constant pressure. Each operator has fast cooldowns - keep swapping to maintain buffs. Requires good mechanical skill. No dedicated healer means you must dodge well.',
    isPublic: true,
    likes: 27,
    views: 156,
    createdAt: Date.now() - 86400000 * 11,
    updatedAt: Date.now() - 86400000 * 9,
    author: 'ZeroSanity Staff',
  },
];

export default function BuildDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [build, setBuild] = useState<Build | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    // Try to find in sample builds first
    let foundBuild = SAMPLE_BUILDS.find(b => b.id === id);

    // If not found, try localStorage
    if (!foundBuild) {
      const saved = localStorage.getItem('endfield-my-builds');
      if (saved) {
        try {
          const myBuilds: Build[] = JSON.parse(saved);
          foundBuild = myBuilds.find(b => b.id === id);
        } catch { /* ignore */ }
      }
    }

    if (foundBuild) {
      setBuild(foundBuild);
      // Increment view count (only for localStorage builds)
      if (!SAMPLE_BUILDS.find(b => b.id === id)) {
        const saved = localStorage.getItem('endfield-my-builds');
        if (saved) {
          try {
            const myBuilds: Build[] = JSON.parse(saved);
            const updated = myBuilds.map(b => b.id === id ? { ...b, views: b.views + 1 } : b);
            localStorage.setItem('endfield-my-builds', JSON.stringify(updated));
          } catch { /* ignore */ }
        }
      }
    } else {
      // Build not found - redirect
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

  if (!build) {
    return (
      <div className="min-h-screen text-[var(--color-text-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--color-accent)] border-r-transparent mb-4" />
          <p>Loading build...</p>
        </div>
      </div>
    );
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate element composition
  const elementCounts: Record<string, number> = {};
  const roleCounts: Record<string, number> = {};
  build.characters.forEach(bc => {
    const charData = CHARACTERS.find(c => c.Name === bc.name);
    if (charData) {
      elementCounts[charData.Element] = (elementCounts[charData.Element] || 0) + 1;
      roleCounts[charData.Role] = (roleCounts[charData.Role] || 0) + 1;
    }
  });

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader
          title={build.name}
          category="BUILD DETAIL"
          code={`BLD-${build.id.toUpperCase().slice(0, 8)}`}
          icon={build.type === 'team' ? <Users size={28} /> : <Star size={28} />}
          subtitle={`${build.type === 'team' ? 'Team Composition' : 'Solo Build'} by ${build.author || 'Community'}`}
        />

        {/* Back button */}
        <Link
          href="/builds"
          className="inline-flex items-center gap-2 mb-6 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Browse
        </Link>

        {/* Build info header */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`text-xs px-2 py-1 font-bold ${
                    build.type === 'team' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {build.type === 'team' ? 'TEAM' : 'SINGLE'}
                </span>
                {build.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)]">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{build.notes}</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Heart size={14} className="text-red-400" /> {build.likes}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={14} /> {build.views}
                </span>
              </div>
              <div className="text-xs text-[var(--color-text-tertiary)]">
                Created {formatDate(build.createdAt)}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyToMyBuilds}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold clip-corner-tl transition-colors flex items-center gap-2"
            >
              <Copy size={14} /> Copy to My Builds
            </button>
            <button
              onClick={copyShareLink}
              className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-white text-sm font-bold clip-corner-tl transition-colors flex items-center gap-2 border border-[var(--color-border)]"
            >
              <Share2 size={14} /> {copied ? 'Copied!' : 'Share Link'}
            </button>
          </div>
        </div>

        {/* Team synergy for team builds */}
        {build.type === 'team' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Element composition */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5">
              <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">Element Composition</h3>
              <div className="space-y-2">
                {Object.entries(elementCounts).map(([element, count]) => (
                  <div key={element} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: ELEMENT_COLORS[element as Element] }}
                    />
                    <span className="text-sm text-[var(--color-text-secondary)] flex-1">{element}</span>
                    <span className="text-sm font-bold text-white">×{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Role composition */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5">
              <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">Role Composition</h3>
              <div className="space-y-2">
                {Object.entries(roleCounts).map(([role, count]) => {
                  const profIcon = PROFESSION_ICONS[role];
                  return (
                    <div key={role} className="flex items-center gap-3">
                      {profIcon && (
                        <div className="w-5 h-5 relative">
                          <Image src={profIcon} alt={role} fill className="object-contain" unoptimized sizes="20px" />
                        </div>
                      )}
                      <span className="text-sm text-[var(--color-text-secondary)] flex-1">{role}</span>
                      <span className="text-sm font-bold text-white">×{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Character showcases */}
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
              <div
                key={idx}
                className="bg-[var(--color-surface)] border-2 clip-corner-tl overflow-hidden"
                style={{ borderColor: elementColor }}
              >
                {/* Character banner header */}
                <div className="relative h-32 sm:h-40 overflow-hidden bg-gradient-to-br from-[var(--color-surface-2)] to-[var(--color-surface)]">
                  {banner && (
                    <div className="absolute inset-0 opacity-30">
                      <Image
                        src={banner}
                        alt={bc.name}
                        fill
                        className="object-cover object-center"
                        unoptimized
                        sizes="100vw"
                      />
                    </div>
                  )}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${elementColor}15 0%, transparent 60%)`,
                    }}
                  />

                  {/* Character info overlay */}
                  <div className="relative h-full flex items-end p-5">
                    <div className="flex items-center gap-4 flex-1">
                      {charIcon && (
                        <div
                          className="w-16 h-16 sm:w-20 sm:h-20 relative border-2 clip-corner-tl overflow-hidden bg-black/40"
                          style={{ borderColor: rarityColor }}
                        >
                          <Image src={charIcon} alt={bc.name} fill className="object-cover" unoptimized sizes="80px" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h2 className="text-white font-bold text-xl sm:text-2xl mb-1">{bc.name}</h2>
                        <div className="flex items-center gap-3 text-xs">
                          <span style={{ color: elementColor }} className="font-bold">
                            {charData.Element}
                          </span>
                          <span className="text-[var(--color-text-tertiary)]">{charData.Role}</span>
                          <span className="text-[var(--color-text-tertiary)]">{charData.WeaponType}</span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: charData.Rarity }).map((_, i) => (
                              <Star key={i} size={10} className="fill-current" style={{ color: rarityColor }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    {profIcon && (
                      <div className="w-10 h-10 relative opacity-60">
                        <Image src={profIcon} alt={charData.Role} fill className="object-contain" unoptimized sizes="40px" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Character details */}
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
                            <div
                              className="absolute inset-y-0 left-0"
                              style={{
                                width: `${(stat.value / 180) * 100}%`,
                                backgroundColor: stat.color,
                              }}
                            />
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
                            <div
                              className="w-16 h-16 sm:w-20 sm:h-20 relative bg-black/30 p-2 border-2"
                              style={{ borderColor: RARITY_COLORS[weaponData.Rarity] }}
                            >
                              <Image
                                src={weaponIcon}
                                alt={bc.weapon}
                                fill
                                className="object-contain p-1"
                                unoptimized
                                sizes="80px"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-bold">{bc.weapon}</h4>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: weaponData.Rarity }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={10}
                                    className="fill-current"
                                    style={{ color: RARITY_COLORS[weaponData.Rarity] }}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="text-xs text-[var(--color-text-tertiary)] mb-2">
                              {weaponData.WeaponType} • ATK {weaponData.MaxAtk} (Lv.90)
                            </div>
                            {weaponData.SkillName && (
                              <div className="mb-2">
                                <div className="text-xs font-bold text-[var(--color-accent)] mb-1">
                                  {weaponData.SkillName}
                                </div>
                                <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                  {weaponData.SkillDescription}
                                </div>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2 text-xs">
                              <div className="px-2 py-1 bg-[var(--color-surface)] text-[var(--color-accent)]">
                                {weaponData.PassiveAttribute.label} +{weaponData.PassiveAttribute.value}
                                {weaponData.PassiveAttribute.isPercentage ? '%' : ''}
                              </div>
                              {weaponData.SpecialAttribute && (
                                <div className="px-2 py-1 bg-[var(--color-surface)] text-[var(--color-accent)]">
                                  {weaponData.SpecialAttribute.label} +{weaponData.SpecialAttribute.value}
                                  {weaponData.SpecialAttribute.isPercentage ? '%' : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Equipment */}
                  {bc.equipment && gearSet && (
                    <div>
                      <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide flex items-center gap-2">
                        <ChevronRight size={14} className="text-[var(--color-accent)]" />
                        Equipment Set
                      </h3>
                      <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-4 clip-corner-tl">
                        <div className="flex items-start gap-4">
                          {equipIcon && (
                            <div className="w-16 h-16 relative bg-black/30 p-2">
                              <Image
                                src={equipIcon}
                                alt={bc.equipment}
                                fill
                                className="object-contain"
                                unoptimized
                                sizes="64px"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-bold">{bc.equipment}</h4>
                              <span className="text-xs px-1.5 py-0.5 bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-bold">
                                {gearSet.phase.split(' ')[0]}
                              </span>
                            </div>
                            <div className="text-xs text-[var(--color-text-secondary)] mb-2 leading-relaxed">
                              <span className="text-[var(--color-accent)] font-bold">3-piece: </span>
                              {gearSet.setBonus}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Character notes */}
                  {bc.notes && (
                    <div>
                      <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide flex items-center gap-2">
                        <ChevronRight size={14} className="text-[var(--color-accent)]" />
                        Role Notes
                      </h3>
                      <div
                        className="p-4 border-l-3 bg-[var(--color-surface-2)] text-sm text-[var(--color-text-secondary)] leading-relaxed"
                        style={{ borderLeftColor: elementColor }}
                      >
                        {bc.notes}
                      </div>
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
                            <div className="text-xs text-[var(--color-text-tertiary)] mb-1">Skill {i + 1}</div>
                            <div className="text-lg font-bold text-[var(--color-accent)]">{level}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
