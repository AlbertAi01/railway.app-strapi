'use client';

import { useState } from 'react';
import { Search, BookOpen, X } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';

const GUIDES = [
  {
    id: 1,
    title: 'Beginner\'s Guide',
    category: 'General',
    author: 'Admin',
    date: '2024-01-15',
    content: `# Beginner's Guide to Endfield

Welcome to Arknights: Endfield! This action RPG will take you on an adventure across Talos-II.

## Getting Started

1. **Complete the Tutorial**: Learn the real-time combat mechanics, dodging, and skill combos.
2. **Team Composition**: Build a team of 4 characters for missions.
3. **Resource Management**: Focus on developing your main team first.

## Combat Basics

Endfield features real-time action RPG combat:
- **Dodge**: Time your dodges to avoid enemy attacks
- **Battle Skills**: Active abilities with cooldowns
- **Combo Skills**: Chain attacks between team members
- **Ultimates**: Powerful abilities charged by SP generation

## Character Attributes

Each character has four base attributes:
- **Strength**: Physical damage and defense
- **Agility**: Attack speed and evasion
- **Intellect**: Skill damage and effect
- **Will**: Ultimate charge rate and resistance

## Elements and Status Effects

Five elemental types affect combat:
- **Physical**: Raw damage, no special effects
- **Heat**: Causes Combustion (damage over time)
- **Cryo**: Inflicts Solidification (slow movement)
- **Electric**: Triggers Electrification (chain damage)
- **Nature**: Applies Vulnerability (increased damage taken)

## Character Roles

Build a balanced team with:
- **Guard**: Melee DPS characters
- **Defender**: Tanky frontline protectors
- **Supporter**: Buffs and healing
- **Caster**: Ranged magical damage
- **Vanguard**: Balanced offense and defense
- **Striker**: High-burst damage dealers

## Progression Path

Week 1: Complete story chapters, build your main 4-character team
Week 2-3: Farm gear and materials, optimize character builds
Month 1+: Challenge high-difficulty content, collect diverse roster`
  },
  {
    id: 2,
    title: 'Advanced Combat Tactics',
    category: 'Combat',
    author: 'ProGamer',
    date: '2024-01-20',
    content: `# Advanced Combat Tactics

Master Endfield's action RPG combat system with these strategies.

## Dodge Timing

Perfect dodging is essential:
1. Watch enemy telegraph animations
2. Dodge just before impact for i-frames
3. Practice dodge canceling for faster recovery
4. Some attacks require multiple dodges

## Combo Skill Chains

Maximize damage with skill combos:
- Chain skills between characters for bonus damage
- Watch for combo indicators above enemies
- Time skills during enemy stagger for extra damage
- Ultimate skills can extend combo windows

## Ultimate SP Management

Manage SP generation wisely:
- Dealing damage generates SP over time
- Taking damage also generates SP
- Some characters have SP generation buffs
- Save ultimates for boss phases or crisis moments
- Ultimate animations provide invulnerability

## Element Status Effects

Exploit elemental weaknesses:
- **Combustion**: Stack Heat damage for burning DOT
- **Solidification**: Freeze enemies to stop movement
- **Electrification**: Chain lightning to grouped enemies
- **Vulnerability**: Apply before burst damage windows
- Combine elements for devastating effects

## Stagger Mechanics

Break enemy guard for massive damage:
- Heavy attacks build stagger faster
- Staggered enemies take bonus damage
- Break state lasts 5-10 seconds
- Plan burst damage during break windows
- Some bosses require stagger to expose weakpoints

## Team Synergies

Coordinate your team:
- Defenders draw aggro while DPS attacks
- Supporters buff before damage windows
- Casters apply debuffs for the team
- Strikers execute during break state
- Practice character swapping for combos`
  },
  {
    id: 3,
    title: 'Resource Farming Guide',
    category: 'Farming',
    author: 'FarmKing',
    date: '2024-01-25',
    content: `# Resource Farming Guide

Maximize your resource efficiency in Endfield.

## AIC Factory Production

Your base for passive income:
- Unlock AIC Factory through story progression
- Assign characters to production stations
- Higher rarity characters boost production speed
- Balance between material production and Credits
- Check factory every 8-12 hours for optimal efficiency

## Material Farming Priority

**High Priority:**
- Character promotion materials (T3-T4)
- Weapon enhancement materials
- Gear upgrade components
- Event-exclusive materials

**Medium Priority:**
- Skill level-up materials
- Credits for gear crafting
- Common crafting materials

**Low Priority:**
- Basic materials (farmable anywhere)
- Excess character EXP items

## Gear Farming Strategy

Gear sets provide powerful bonuses:
- Farm specific regions for gear types
- Target T4 gear sets for endgame
- Focus on 3-piece set bonuses first
- Save stamina for double-drop events
- Recycle unwanted gear for materials

## Talos-II Region Farming

Different regions drop different materials:
- Northern zones: Cryo-related materials
- Desert regions: Heat-based resources
- Forest areas: Nature element items
- Industrial sectors: Electric components
- Complete region exploration for bonus rewards

## Daily and Weekly Priorities

**Daily:**
- Complete all daily missions
- Spend natural stamina efficiently
- Collect AIC Factory production
- Farm priority materials

**Weekly:**
- Clear high-difficulty weekly challenges
- Complete all weekly mission objectives
- Participate in limited-time events
- Stock up on materials during bonus periods`
  },
  {
    id: 4,
    title: 'Gacha and Banner Guide',
    category: 'Gacha',
    author: 'LuckyPuller',
    date: '2024-02-01',
    content: `# Gacha and Banner Guide

Understand Endfield's gacha system and make smart pulling decisions.

## Gacha Rates

**Standard Rates:**
- 6-star: 0.8% (increases after 50 pulls)
- 5-star: 8%
- 4-star: 40%
- 3-star: 51.2%

## Pity System

- Soft pity starts at 50 pulls
- Rate increases by 2% per pull after 50
- Guaranteed 6-star within 100 pulls
- Pity carries between banners of same type
- Track your pity count carefully

## Banner Types

**Featured Character Banners:**
- Rate-up for specific 6-star characters
- Best chance to get desired characters
- Pity carries between character banners
- 50/50 chance on first 6-star, guaranteed on second

**Standard Banner:**
- All standard pool characters
- Use free tickets here
- Good for beginners building roster
- No rate-ups, equal chance for all

**Weapon Banners:**
- Focus on signature weapons
- Lower priority than characters
- Consider only after building character roster

## Pulling Strategy

**For F2P Players:**
- Pull guaranteed 5-star on new banners (first 10 pulls)
- Save premium currency for limited characters
- Use free daily pulls on standard banner
- Skip banners without characters you need

**For Light Spenders:**
- Monthly pass provides best value
- Pull for meta-defining characters
- Consider weapon banners for favorites
- Save for anniversary/limited events

## Building Your Roster

Focus on collecting:
- At least one character of each role
- Characters covering all element types
- Balanced team for different content
- Meta characters for difficult challenges
- Favorites for enjoyment`
  },
  {
    id: 5,
    title: 'End Game Content Guide',
    category: 'General',
    author: 'EndGamePro',
    date: '2024-02-05',
    content: `# End Game Content Guide

Conquer Endfield's most challenging content.

## High-Difficulty Combat Missions

The ultimate test of skill:
- Require fully built characters
- Enemies have massive HP and damage
- Perfect dodge timing is essential
- Elemental weaknesses matter significantly
- Rewards include exclusive materials

**Preparation Tips:**
- Max level your main team
- Optimize gear sets for maximum stats
- Practice boss patterns in normal mode
- Bring balanced team composition
- Stock up on consumable items

## Gear Optimization

Endgame is all about perfect gear:
- **T4 Gear Sets**: Highest tier equipment
- **3-Piece Bonuses**: Complete sets for powerful effects
- **Stat Priority**: Focus on main stat and substats
- **Set Combinations**: Mix sets for optimal builds
- **Enhancement**: Max level your equipped gear

## Recommended Gear Sets

**For DPS Characters:**
- Berserker Set: +Crit Rate and Crit DMG
- Elemental Mastery Set: +Elemental Damage
- Combo Set: +Damage during combo chains

**For Defenders:**
- Guardian Set: +DEF and damage reduction
- Counter Set: Reflect damage when hit
- Endurance Set: +Max HP and healing received

**For Supporters:**
- Support Set: Buff effectiveness increased
- Recovery Set: +Healing output
- Energy Set: +Ultimate charge rate

## Challenge Modes

Test your limits:
- Time Attack: Complete missions quickly
- No Damage: Perfect clear requirements
- Limited Characters: Restricted roster
- Boss Rush: Multiple bosses back-to-back
- Survival: Endless waves with increasing difficulty

## Endgame Checklist

1. Max level and promote all main team characters
2. Equip full T4 gear sets with 3-piece bonuses
3. Level all combat skills to maximum
4. Farm and craft optimal gear combinations
5. Complete all high-difficulty story missions
6. Challenge limited-time extreme difficulty events
7. Build multiple teams for different content types

Remember: Endgame is about perfecting your builds and mastering combat mechanics!`
  }
];

export default function GuidesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGuide, setSelectedGuide] = useState<typeof GUIDES[0] | null>(null);

  const categories = ['All', ...Array.from(new Set(GUIDES.map(g => g.category)))];

  const filteredGuides = GUIDES.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader
          title="Intelligence Briefings"
          category="INTEL"
          code="RIOS-GDE-001"
          icon={<BookOpen size={28} />}
        />

        {!selectedGuide ? (
          <>
            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-tertiary)] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search guides..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 clip-corner-tl transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[var(--color-accent)] text-black font-bold'
                        : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Guide List */}
            <div className="grid gap-4">
              {filteredGuides.map(guide => (
                <div
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide)}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6 hover:border-[var(--color-accent)] transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-5 h-5 text-[var(--color-accent)]" />
                        <h2 className="text-2xl font-bold text-white">{guide.title}</h2>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="px-3 py-1 bg-[var(--color-border)] text-[var(--color-accent)]">
                          {guide.category}
                        </span>
                        <span>By {guide.author}</span>
                        <span>{guide.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredGuides.length === 0 && (
                <div className="text-center py-12 text-[var(--color-text-tertiary)]">
                  No guides found matching your search.
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Guide Reader */}
            <button
              onClick={() => setSelectedGuide(null)}
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors"
            >
              <X className="w-4 h-4" />
              Back to Guides
            </button>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-8">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-[var(--color-accent)]" />
                <h1 className="text-3xl font-bold text-white">{selectedGuide.title}</h1>
              </div>

              <div className="flex items-center gap-4 mb-8 text-sm">
                <span className="px-3 py-1 bg-[var(--color-border)] text-[var(--color-accent)]">
                  {selectedGuide.category}
                </span>
                <span>By {selectedGuide.author}</span>
                <span>{selectedGuide.date}</span>
              </div>

              <div className="prose prose-invert max-w-none">
                {selectedGuide.content.split('\n').map((line, idx) => {
                  if (line.startsWith('# ')) {
                    return (
                      <h1 key={idx} className="text-3xl font-bold text-[var(--color-accent)] mt-8 mb-4">
                        {line.substring(2)}
                      </h1>
                    );
                  } else if (line.startsWith('## ')) {
                    return (
                      <h2 key={idx} className="text-2xl font-bold text-white mt-6 mb-3">
                        {line.substring(3)}
                      </h2>
                    );
                  } else if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <p key={idx} className="font-bold text-white my-2">
                        {line.substring(2, line.length - 2)}
                      </p>
                    );
                  } else if (line.startsWith('- ')) {
                    return (
                      <li key={idx} className="ml-4 my-1">
                        {line.substring(2)}
                      </li>
                    );
                  } else if (line.match(/^\d+\./)) {
                    return (
                      <li key={idx} className="ml-4 my-1 list-decimal">
                        {line.substring(line.indexOf('.') + 2)}
                      </li>
                    );
                  } else if (line.trim() === '') {
                    return <div key={idx} className="h-4" />;
                  } else {
                    return (
                      <p key={idx} className="my-2">
                        {line}
                      </p>
                    );
                  }
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
