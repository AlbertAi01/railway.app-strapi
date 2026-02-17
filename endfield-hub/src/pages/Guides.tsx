import { useState } from 'react';
import { Search, BookOpen, CheckCircle, Clock, ChevronRight } from 'lucide-react';

interface GuideEntry {
  id: number;
  Title: string;
  Category: string;
  Summary: string;
  Content: string;
  Difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  IsVerified: boolean;
  Author: string;
  Upvotes: number;
}

const DIFFICULTY_COLORS = {
  Beginner: '#27AE60',
  Intermediate: '#FFE500',
  Advanced: '#FF6B35',
};

const GUIDES: GuideEntry[] = [
  {
    id: 1, Title: 'Complete Beginner\'s Guide to Arknights: Endfield', Category: 'Beginner',
    Summary: 'Everything you need to know when starting Arknights: Endfield, from basic combat to factory setup.',
    Content: `## Getting Started\n\nArknights: Endfield is an open-world RPG with real-time combat and factory-building mechanics. This guide covers everything you need to know as a new player.\n\n### Combat Basics\n\nThe combat system uses a team of 4 characters with real-time action combat. Each character has:\n- **Normal Attacks** - Basic combo chains with light and heavy attacks\n- **Elemental Skill** - Active ability with cooldown\n- **Endfield Skill** - Ultimate ability requiring energy\n- **Passives/Talents** - Always-active bonuses\n\n### Elements\n\nThere are 5 elements in the game:\n- **Physical** - Raw damage, no elemental reactions\n- **Heat** - Fire damage, can apply Burn\n- **Cryo** - Ice damage, can Freeze enemies\n- **Electric** - Lightning damage, chains between targets\n- **Nature** - Healing and support focused\n\n### Team Building\n\nA balanced team should include:\n1. A main DPS (Guard or Striker)\n2. A sub-DPS (Caster or Vanguard)\n3. A support/healer (Supporter)\n4. A tank/shielder (Defender)\n\n### Factory System\n\nThe AIC (Automated Industry Complex) is unlocked early in the story. Start with:\n1. Mining basic ores (Iron, Copper)\n2. Processing them in Smelters\n3. Building up to more complex chains\n\n### Early Game Tips\n- Focus on your main DPS first for ascension\n- Don't spread resources too thin\n- Complete daily missions for currency\n- Explore thoroughly for chests and resources`,
    Difficulty: 'Beginner', IsVerified: true, Author: 'Zero Sanity Staff', Upvotes: 342
  },
  {
    id: 2, Title: 'Elemental Reactions and Damage Guide', Category: 'Combat',
    Summary: 'Deep dive into elemental reactions, damage calculations, and how to maximize your team\'s output.',
    Content: `## Elemental Reactions\n\n### Reaction Types\n\n**Meltdown** (Heat + Cryo): Deals 2x damage of the triggering element. One of the highest damage reactions.\n\n**Overcharge** (Heat + Electric): AoE Electric explosion dealing fixed damage based on character level and Elemental Mastery.\n\n**Superconduct** (Cryo + Electric): Reduces enemy Physical DEF by 40% for 12s. Essential for Physical DPS teams.\n\n**Overgrowth** (Nature + Electric): Creates homing projectiles dealing Nature damage.\n\n**Frostbloom** (Nature + Cryo): Creates an AoE field that deals continuous Cryo damage and slows.\n\n### Damage Formula\n\nBase Damage = ATK * Skill Multiplier * (1 + DMG Bonus) * CRIT Multiplier\n\nWhere:\n- CRIT Multiplier = 1 + (CRIT Rate * CRIT DMG)\n- DMG Bonus includes elemental, normal attack, skill DMG bonuses\n\n### Optimal Stat Priority\n\nFor DPS characters:\n1. CRIT Rate (aim for 60-70%)\n2. CRIT DMG (aim for 140%+)\n3. ATK%\n4. Elemental DMG Bonus\n\nFor Supports:\n1. Energy Recharge (enough to burst off cooldown)\n2. HP% or DEF% (for scaling)\n3. Healing Bonus (for healers)`,
    Difficulty: 'Intermediate', IsVerified: true, Author: 'Zero Sanity Staff', Upvotes: 256
  },
  {
    id: 3, Title: 'Factory Optimization: From Beginner to Megafactory', Category: 'Factory',
    Summary: 'Master the AIC factory system with production chain optimization, throughput calculations, and layout tips.',
    Content: `## Factory Mastery\n\n### Understanding Throughput\n\nEvery recipe has a base crafting time. Throughput = 60 / CraftingTime * OutputQuantity.\n\nTo meet production targets, calculate backwards:\n1. Determine how much output you need per minute\n2. Divide by single-machine throughput\n3. That's how many machines you need\n\n### Key Ratios\n\n**Iron Ingots:** 3 ore per ingot, 30s craft time = 2/min per smelter\n**Steel Plates:** 2 ingots + 1 coal, 60s = 1/min per smelter (needs 1 iron line feeding it)\n**Circuit Boards:** 3 wire + 1 wafer, 90s = 0.67/min per assembler\n\n### Layout Principles\n1. Keep inputs close to processors\n2. Use belts efficiently - merge when possible\n3. Build in modular sections\n4. Leave room for expansion\n5. Minimize belt length to reduce latency\n\n### Advanced: Balancers\nWhen splitting resources between multiple machines, use splitters to ensure equal distribution.`,
    Difficulty: 'Intermediate', IsVerified: true, Author: 'FactoryKing', Upvotes: 198
  },
  {
    id: 4, Title: 'Best Characters to Build First', Category: 'Character Build',
    Summary: 'Priority guide for which characters to invest in first based on their value across all content.',
    Content: `## Character Investment Priority\n\n### Tier 1 - Build First\n\n**Endministrator** (Physical/Striker) - Your free protagonist. Solid DPS that works everywhere. Invest without worry.\n\n**Ember** (Heat/Guard) - Incredible AoE damage. Best general-purpose DPS in early-mid game.\n\n**Ardelia** (Nature/Supporter) - The premier healer. Keeps your team alive through everything.\n\n### Tier 2 - Build Next\n\n**Last Rite** (Cryo/Striker) - Top single-target DPS. Essential for bosses.\n\n**Lifeng** (Physical/Defender) - The best tank. Makes hard content much easier.\n\n**Yvonne** (Cryo/Caster) - Excellent Cryo applicator and sub-DPS.\n\n### Tier 3 - Build When Needed\n\n**Laevatain** (Heat/Guard) - Alternative to Ember with different strengths.\n\n**Pogranichnik** (Physical/Vanguard) - Ranged option with good utility.\n\n**Gilberta** (Nature/Caster) - Strong sustained damage option.`,
    Difficulty: 'Beginner', IsVerified: true, Author: 'Zero Sanity Staff', Upvotes: 287
  },
  {
    id: 5, Title: 'Equipment Set Guide: Best Sets for Every Role', Category: 'Equipment',
    Summary: 'Comprehensive equipment set recommendations for every character archetype.',
    Content: `## Equipment Sets by Role\n\n### DPS Characters\n\n**Best in Slot:** Element-specific sets (Inferno's Will, Permafrost Crown, Voltaic Surge)\n- 4-piece bonus provides massive damage increase\n- Always pair with matching element characters\n\n**Alternative:** Gladiator's Resolve\n- ATK +18% 2-piece is universally good\n- 4-piece Normal Attack bonus great for Sword/Polearm users\n\n### Supports/Healers\n\n**Best for Healers:** Medic's Oath\n- 15% Healing Bonus + shield from overhealing\n- Keeps team topped off\n\n**Best for Buffers:** Living Verdure (Nature supports)\n- Healing effectiveness + party ATK buff\n\n### Tanks\n\n**Best in Slot:** Iron Bastion\n- DEF +30% 2-piece for raw survivability\n- Shield generation + damage bonus while shielded\n\n### Sub-DPS\n\n**Precision Circuit** - CRIT Rate + execute bonus\n**Rapid Assault** - Attack speed for combo finishers`,
    Difficulty: 'Intermediate', IsVerified: true, Author: 'Zero Sanity Staff', Upvotes: 176
  },
  {
    id: 6, Title: 'Endgame Content: What to Do at Max Level', Category: 'Endgame',
    Summary: 'Guide to all endgame activities, weekly bosses, and progression paths after reaching max level.',
    Content: `## Endgame Activities\n\n### Weekly Bosses\n- Clear all 3 weekly bosses for ascension materials\n- Difficulty scales with world level\n- Co-op recommended for highest difficulty\n\n### Abyss Tower\n- 12-floor challenge dungeon\n- Resets bi-weekly\n- Requires 2 full teams (8 characters)\n- Rewards: premium currency, materials\n\n### Factory Endgame\n- Optimize production chains for efficiency\n- Complete factory challenges for blueprints\n- Reach production milestones for rewards\n\n### Exploration\n- 100% all map regions\n- Find hidden achievements\n- Complete puzzle challenges\n\n### Daily/Weekly Routine\n1. Daily commissions (4x)\n2. Spend stamina on material domains\n3. Weekly boss clears\n4. Factory maintenance\n5. Event participation`,
    Difficulty: 'Advanced', IsVerified: true, Author: 'Zero Sanity Staff', Upvotes: 145
  },
];

export default function GuidesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<GuideEntry | null>(null);

  const categories = [...new Set(GUIDES.map(g => g.Category))];

  const filtered = GUIDES.filter(g => {
    if (search && !g.Title.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && g.Category !== categoryFilter) return false;
    return true;
  });

  if (selectedGuide) {
    return (
      <div>
        <button onClick={() => setSelectedGuide(null)} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1">
          &larr; Back to Guides
        </button>
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            {selectedGuide.IsVerified && (
              <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                <CheckCircle size={10} /> Verified
              </span>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ color: DIFFICULTY_COLORS[selectedGuide.Difficulty], borderColor: DIFFICULTY_COLORS[selectedGuide.Difficulty] }}>
              {selectedGuide.Difficulty}
            </span>
            <span className="text-[10px] text-gray-500">{selectedGuide.Category}</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{selectedGuide.Title}</h1>
          <p className="text-gray-500 text-sm mb-6">By {selectedGuide.Author}</p>
          <div className="prose prose-invert max-w-none">
            {selectedGuide.Content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-white mt-6 mb-3">{line.replace('## ', '')}</h2>;
              if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold text-[#FFE500] mt-4 mb-2">{line.replace('### ', '')}</h3>;
              if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="text-white font-semibold mt-2">{line.replace(/\*\*/g, '')}</p>;
              if (line.startsWith('- ')) return <li key={i} className="text-gray-300 text-sm ml-4 list-disc">{line.replace('- ', '')}</li>;
              if (line.match(/^\d+\. /)) return <li key={i} className="text-gray-300 text-sm ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
              if (line.trim() === '') return <br key={i} />;
              return <p key={i} className="text-gray-300 text-sm leading-relaxed">{line}</p>;
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">GUIDES</h1>
      <p className="text-gray-500 text-sm mb-6">In-depth, verified guides for Arknights: Endfield</p>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search guides..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FFE500]"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              categoryFilter === cat ? 'border-[#FFE500] text-[#FFE500] bg-[#FFE500]/10' : 'border-[#333] text-gray-400 hover:border-[#555]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(guide => (
          <div
            key={guide.id}
            onClick={() => setSelectedGuide(guide)}
            className="bg-[#111] border border-[#222] rounded-xl p-5 hover:border-[#444] transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {guide.IsVerified && (
                    <CheckCircle size={14} className="text-green-400" />
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ color: DIFFICULTY_COLORS[guide.Difficulty], borderColor: DIFFICULTY_COLORS[guide.Difficulty] }}>
                    {guide.Difficulty}
                  </span>
                  <span className="text-gray-600 text-[10px]">{guide.Category}</span>
                </div>
                <h3 className="text-white font-semibold group-hover:text-[#FFE500] transition-colors">{guide.Title}</h3>
                <p className="text-gray-400 text-sm mt-1">{guide.Summary}</p>
                <div className="flex items-center gap-3 mt-2 text-gray-600 text-xs">
                  <span>By {guide.Author}</span>
                  <span>{guide.Upvotes} upvotes</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-600 group-hover:text-[#FFE500] transition-colors mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
