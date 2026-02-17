'use client';

import { useState } from 'react';
import { Search, BookOpen, X } from 'lucide-react';

const GUIDES = [
  {
    id: 1,
    title: 'Beginner\'s Guide',
    category: 'General',
    author: 'Admin',
    date: '2024-01-15',
    content: `# Beginner's Guide to Endfield

Welcome to Endfield! This comprehensive guide will help you get started on your journey.

## Getting Started

1. **Complete the Tutorial**: The game's tutorial is essential and teaches you the basic mechanics.
2. **Gacha System**: Understand the gacha rates - 0.8% for 6-star, 8% for 5-star operators.
3. **Resource Management**: Don't waste resources early on. Focus on a core team of 3-4 operators.

## Early Game Tips

- Focus on completing the main story to unlock features
- Join a guild early for guild shop access
- Complete daily missions for consistent rewards
- Save your Originium for limited banners

## Team Building

A balanced team typically includes:
- 1-2 Vanguards (DP generation)
- 2-3 Guards/Defenders (frontline)
- 2-3 Snipers/Casters (DPS)
- 1-2 Medics (healing)
- 1 Supporter/Specialist (utility)

## Progression Path

Week 1: Focus on story and leveling your core team to E1 Level 40
Week 2-3: Start farming skill materials and consider first E2
Month 1+: Build diverse roster for different content`
  },
  {
    id: 2,
    title: 'Advanced Combat Tactics',
    category: 'Combat',
    author: 'ProGamer',
    date: '2024-01-20',
    content: `# Advanced Combat Tactics

Master the combat system with these advanced strategies.

## Deployment Order

The order you deploy operators matters significantly:
1. Deploy Vanguards first for DP generation
2. Place blockers before enemies arrive
3. Deploy ranged DPS to cover lanes
4. Save utility operators for crisis moments

## Skill Timing

- **Auto-activation skills**: Great for consistent DPS
- **Manual skills**: Save for boss phases or enemy waves
- **Defensive skills**: Activate just before big attacks

## Map Analysis

Before starting a stage:
1. Identify enemy spawn points and paths
2. Locate high-value deployment tiles
3. Plan for aerial enemies
4. Consider boss mechanics

## Synergies

Combine operators for maximum effect:
- Debuffers + Nukers
- Buffers + Main DPS
- Crowd Control + Area Damage

## Resource Efficiency

- Use 3-star operators early game (cheaper to build)
- E2 your main DPS first
- Don't ignore support operators
- Farm efficiently during events`
  },
  {
    id: 3,
    title: 'Resource Farming Guide',
    category: 'Farming',
    author: 'FarmKing',
    date: '2024-01-25',
    content: `# Resource Farming Guide

Maximize your farming efficiency with this comprehensive guide.

## Sanity Management

Sanity is your stamina resource. Use it wisely:
- 240 max sanity (without items)
- Regenerates 1 per 6 minutes
- Focus on your current goals

## Material Farming Priority

**High Priority:**
- Skill books (farm during half-sanity events)
- Chips for promotions
- Event shop materials

**Medium Priority:**
- Generic materials (rocks, devices, etc.)
- LMD (can farm CE-5)
- EXP cards (can farm LS-5)

**Low Priority:**
- Basic materials (often stage drops)

## Event Efficiency

Events are the most efficient:
1. Clear event shop first
2. Farm event stages for materials
3. Events give better drop rates than standard stages

## Base Production

Optimize your base:
- 2-5-2 setup (2 Trading Posts, 5 Factories, 2 Power Plants)
- Focus factories on EXP or Gold bars based on needs
- Don't neglect dorm ambience

## Weekly Routine

- Monday: Chip farming
- Tuesday-Thursday: Skill books
- Friday-Sunday: Material farming
- Always: Annihilation (weekly orundum)
- Daily: Complete all dailies`
  },
  {
    id: 4,
    title: 'Gacha and Banner Guide',
    category: 'Gacha',
    author: 'LuckyPuller',
    date: '2024-02-01',
    content: `# Gacha and Banner Guide

Understand the gacha system and make informed pulling decisions.

## Gacha Rates

**Standard Rates:**
- 6-star: 0.8% (2% after 50 pulls)
- 5-star: 8%
- 4-star: 40%
- 3-star: 51.2%

## Pity System

- Soft pity starts at 50 pulls
- Rate increases by 2% per pull after 50
- Guaranteed 6-star at 100 pulls (very rare to reach)
- Pity carries between banners of same type

## Banner Types

**Limited Banners:**
- Feature limited operators
- Best value for new operators
- Pity carries between limited banners
- Save for meta-defining units

**Standard Banners:**
- Feature standard pool operators
- Good for beginners building roster
- Use headhunting tickets here

**Recruitment:**
- Free way to get operators
- Tag combinations guarantee rarities
- Senior Operator and Top Operator tags are rare

## Pulling Strategy

**For F2P:**
- Pull on guaranteed 5-star (first 10 pulls)
- Save for limited/meta operators
- Use recruitment extensively

**For Light Spenders:**
- Monthly card is best value
- Pull on must-have operators
- Skip mediocre banners

## Must-Pull Operators

General consensus on meta operators:
- Damage: SilverAsh, Eyjafjalla, Surtr, Chen
- Support: Saria, Ifrit, Angelina
- Utility: Thorns, Mountain, Mudrock

Save your pulls for these when they appear!`
  },
  {
    id: 5,
    title: 'End Game Content Guide',
    category: 'General',
    author: 'EndGamePro',
    date: '2024-02-05',
    content: `# End Game Content Guide

Tackle the hardest content Endfield has to offer.

## Contingency Contract (CC)

The ultimate challenge mode:
- Select risk contracts to increase difficulty
- Higher risks = better rewards
- Risk 18 is standard clear goal
- Risk 26+ requires maxed operators and strategy

**CC Preparation:**
- E2 Level 90 main DPS
- M3 crucial skills
- Build diverse roster
- Study daily map rotations

## Integrated Strategies (IS)

Roguelike mode with random elements:
- Start with basic squad
- Collect items and recruits
- Each run is different
- Unlock permanent upgrades

**IS Tips:**
- Learn enemy patterns
- Collect HP items
- Balance team composition
- Don't over-extend

## High-End Story Stages

Chapter 9+ difficulty spikes:
- Require specific strategies
- May need guide references
- Test your operator roster depth

## Annihilation

Weekly orundum farming:
- Clear for first-time rewards
- Auto-deploy for weekly farming
- 400 kills = max rewards
- Stable auto-deploy is goal

## Preparing for End Game

1. E2 and level core team
2. M3 important skills
3. Build meta operators
4. Join active guild
5. Study mechanics and strategies
6. Don't neglect 4-star operators (often key in CC)

Remember: Endgame is about roster depth, not just individual power!`
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
    <div className="min-h-screen bg-[#0a0a0a] text-gray-400 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#FFE500] mb-8">Guides</h1>

        {!selectedGuide ? (
          <>
            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search guides..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#111] border border-[#222] rounded-lg focus:outline-none focus:border-[#FFE500] text-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[#FFE500] text-black font-bold'
                        : 'bg-[#111] border border-[#222] hover:border-[#FFE500]'
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
                  className="bg-[#111] border border-[#222] rounded-lg p-6 hover:border-[#FFE500] transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-5 h-5 text-[#FFE500]" />
                        <h2 className="text-2xl font-bold text-white">{guide.title}</h2>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="px-3 py-1 bg-[#222] rounded-full text-[#FFE500]">
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
                <div className="text-center py-12 text-gray-500">
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
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-[#111] border border-[#222] rounded-lg hover:border-[#FFE500] transition-colors"
            >
              <X className="w-4 h-4" />
              Back to Guides
            </button>

            <div className="bg-[#111] border border-[#222] rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-[#FFE500]" />
                <h1 className="text-3xl font-bold text-white">{selectedGuide.title}</h1>
              </div>

              <div className="flex items-center gap-4 mb-8 text-sm">
                <span className="px-3 py-1 bg-[#222] rounded-full text-[#FFE500]">
                  {selectedGuide.category}
                </span>
                <span>By {selectedGuide.author}</span>
                <span>{selectedGuide.date}</span>
              </div>

              <div className="prose prose-invert max-w-none">
                {selectedGuide.content.split('\n').map((line, idx) => {
                  if (line.startsWith('# ')) {
                    return (
                      <h1 key={idx} className="text-3xl font-bold text-[#FFE500] mt-8 mb-4">
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
