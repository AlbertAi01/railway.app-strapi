'use client';

import { useState, useMemo } from 'react';
import { Search, BookOpen, ChevronLeft, Sword, Shield, Zap, FlaskConical, MapPin, Factory, Users, Crosshair, Star, Gem, ArrowRight } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';

interface Guide {
  id: number;
  title: string;
  category: string;
  icon: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  updated: string;
  summary: string;
  sections: { heading: string; content: string }[];
  tags: string[];
}

const GUIDES: Guide[] = [
  {
    id: 1, title: 'Getting Started', category: 'General', icon: 'star', difficulty: 'Beginner', updated: '2026-02-15',
    summary: 'Everything new operators need to know about Arknights: Endfield. Covers combat basics, team building, and early progression.',
    tags: ['beginner', 'combat', 'progression', 'team'],
    sections: [
      { heading: 'Combat Fundamentals', content: 'Endfield features real-time action RPG combat. Your team of 4 operators fights together in open-world and instanced encounters.\n\n**Core Mechanics:**\n- **Dodge**: Time dodges for i-frames to avoid damage entirely\n- **Battle Skills**: Active abilities on cooldowns — each character has 2-3 skills\n- **Combo Skills**: Chain attacks between team members for bonus damage multipliers\n- **Ultimates**: Charged by dealing/taking damage. Provide invulnerability during animation\n- **Character Swap**: Instantly switch active operator mid-combat for combos' },
      { heading: 'Character Attributes', content: 'Each operator has four base attributes that scale with level and gear:\n\n- **Strength**: Physical damage output, HP scaling, and melee potency\n- **Agility**: Attack speed, dodge recovery, and critical hit chance\n- **Intellect**: Skill damage multipliers and Arts potency\n- **Will**: Ultimate charge rate, resistance, and support effectiveness\n\nWeapon essence etching further enhances these attributes. Use the Essence Solver to optimize your farming.' },
      { heading: 'Elements and Status Effects', content: 'Five elements drive combat interactions:\n\n- **Physical**: Raw damage with no status effect — universally effective\n- **Heat**: Stacks Combustion for damage-over-time burns\n- **Cryo**: Applies Solidification to slow movement and attack speed\n- **Electric**: Triggers Electrification for chain damage to nearby enemies\n- **Nature**: Inflicts Vulnerability for increased damage taken from all sources\n\nExploit elemental weaknesses for significantly higher damage. Mixed-element teams provide the most flexibility.' },
      { heading: 'Progression Path', content: '**Week 1:** Complete story chapters, unlock all game systems, build your main 4-operator team\n\n**Week 2-3:** Farm gear and upgrade materials, begin essence optimization, clear all available dungeons\n\n**Month 1+:** Challenge high-difficulty content, build alternate teams, optimize factory production, complete map collectibles' },
      { heading: 'Operator Roles', content: 'Build balanced teams using these roles:\n\n- **Guard**: Melee DPS with sustained damage and survivability\n- **Defender**: Frontline tanks that draw aggro and protect the team\n- **Supporter**: Healers and buffers that enable team survival\n- **Caster**: Ranged Arts damage dealers with area control\n- **Vanguard**: Balanced hybrid operators with good offense and defense\n- **Assault**: High-burst glass cannons for damage windows' },
    ],
  },
  {
    id: 2, title: 'Combat Mastery', category: 'Combat', icon: 'sword', difficulty: 'Advanced', updated: '2026-02-12',
    summary: 'Master dodge timing, combo chains, stagger mechanics, and SP management for end-game combat encounters.',
    tags: ['combat', 'dodge', 'combo', 'stagger', 'advanced'],
    sections: [
      { heading: 'Perfect Dodge Timing', content: 'Perfect dodging grants full i-frames and triggers a slow-motion window:\n\n1. Watch for enemy telegraph animations (red flash indicators)\n2. Dodge just before impact — the window is roughly 0.3 seconds\n3. Successful perfect dodge triggers 0.5s slow-motion for counter attacks\n4. Dodge canceling: Use dodge to cancel skill animations for faster recovery\n5. Some boss attacks require dodge chains (2-3 consecutive dodges)\n\n**Tip:** Practice against the Bonekrusher boss in Valley IV — its attacks have clear telegraphs.' },
      { heading: 'Combo Skill Chains', content: 'Maximize damage with proper skill chaining:\n\n- Swap to a new operator immediately after using a skill for combo bonus (+15-30% damage)\n- Watch for the combo indicator (golden flash) above enemies\n- Time skills during enemy stagger for bonus damage multiplier\n- Ultimate skills extend combo windows by 3 seconds\n- Some operators have synergy passives that boost combo damage further\n\n**Optimal rotation:** Skill > Swap > Skill > Swap > Ultimate > Burst phase' },
      { heading: 'Stagger and Break Mechanics', content: 'Every enemy has a stagger gauge (visible below HP):\n\n- Heavy attacks build stagger 2x faster than normals\n- Greatsword and Polearm operators stagger most efficiently\n- Once staggered, enemies enter Break State for 5-10 seconds\n- Break State: +50% damage taken, cannot attack or move\n- Plan your burst damage rotation during break windows\n- Some bosses require stagger to expose weak points\n\n**Priority:** Stagger > Break > Ultimate/Burst > Combo chain' },
      { heading: 'SP and Ultimate Management', content: 'SP charges your ultimate ability:\n\n- Dealing damage generates SP (roughly 1% per hit)\n- Taking damage generates SP at 2x rate\n- Some operators have SP generation passives\n- Ultimates provide full invulnerability during animation\n- Save ultimates for boss phase transitions or emergency survival\n\nOptimal SP rotation: Use ultimates when SP is full, never hold for too long as you lose potential SP generation while capped.' },
    ],
  },
  {
    id: 3, title: 'Essence Etching Guide', category: 'Gear', icon: 'flask', difficulty: 'Intermediate', updated: '2026-02-18',
    summary: 'Complete guide to the essence etching system — understand stats, farming zones, pre-engrave optimization, and perfect 3/3 essences.',
    tags: ['essence', 'gear', 'farming', 'pre-engrave', 'optimization'],
    sections: [
      { heading: 'How Essence Etching Works', content: 'Each weapon has 3 essence stat slots:\n\n1. **Primary Attribute**: Strength, Agility, Intellect, Will, or Main Attribute Boost\n2. **Secondary Stat**: Attack Boost, HP Boost, DMG type boosts, Critical Rate, etc.\n3. **Skill Stat**: Combat ability modifiers like Pursuit, Infliction, Flow, etc.\n\nA "perfect" 3/3 essence matches ALL three stats for your weapon. This is the goal.\n\nYou need 3 primary attributes AND either 1 secondary stat or 1 skill stat at each essence node to etch.' },
      { heading: 'Farming Zones', content: 'Essences drop from Severe Energy Alluvium encounters in specific zones:\n\n**Valley IV Zones:**\n- **The Hub** (vs. Bonekrusher Arsonist) — 7 secondary, 8 skill stats\n- **Originium Science Park** (vs. Spinojaw) — 7 secondary, 8 skill stats\n- **Origin Lodespring** (vs. Heavy Sting α) — 8 secondary, 8 skill stats\n- **Power Plateau** (vs. Bonekrusher Ballista) — 8 secondary, 9 skill stats\n\n**Jinlong Zones:**\n- **Wuling Outskirts** (vs. Cryoshell) — 6 secondary, 8 skill stats\n\nPrimary attributes are available in ALL zones at 1/3 probability each.' },
      { heading: 'Pre-Engrave Optimization', content: 'Pre-engrave lets you GUARANTEE one stat on every essence you farm. This is the key to efficient farming.\n\n**Strategy:**\n1. Choose your priority weapon (the one you need a perfect essence for first)\n2. Lock the stat (secondary or skill) that is shared by the most weapons you want to farm for\n3. Farm in the zone where the remaining stats are available\n4. Use the Essence Solver tool to automatically compute the optimal pre-engrave configuration\n\n**Example:** If farming for Dreams of the Starry Beach + Umbral Torch, lock Infliction (shared skill stat) and farm Power Plateau.' },
      { heading: 'Using the Essence Solver', content: 'Our Essence Solver tool automates the optimization process:\n\n1. Select your weapons (up to 8)\n2. Set the priority weapon (star icon) — the one you need a perfect essence for most urgently\n3. The solver automatically computes the best fixed stat and farming zone\n4. Zone rankings show which locations maximize matches across ALL your weapons\n5. Drop chance percentages show the probability of getting a perfect 3/3 per run\n\nThe priority weapon is weighted 10x higher in zone scoring to ensure your most important weapon gets the best possible zone.' },
    ],
  },
  {
    id: 4, title: 'Factory Production Guide', category: 'Factory', icon: 'factory', difficulty: 'Intermediate', updated: '2026-02-10',
    summary: 'Optimize your AIC Factory with efficient blueprints, production chains, and resource management strategies.',
    tags: ['factory', 'blueprint', 'production', 'automation', 'resources'],
    sections: [
      { heading: 'Factory Basics', content: 'The AIC Factory is your base for passive resource production:\n\n- Unlocked through story progression in Chapter 3\n- Place buildings on a grid to create production chains\n- Buildings connect via conveyor belts and logistics\n- Higher complexity blueprints produce rarer materials\n- Power grid must sustain all active buildings\n\nStart with simple single-product blueprints, then progress to multi-stage chains.' },
      { heading: 'Blueprint System', content: 'Blueprints define your factory layouts:\n\n- **Community Blueprints**: Share and import layouts from other players\n- **Complexity Rating**: Simple (1-3), Medium (4-6), Advanced (7+)\n- **Import Strings**: Copy/paste base64 encoded layouts\n- **Production Rate**: Items produced per hour\n- **Net Power**: Total power consumption of the blueprint\n\nUse the Blueprint Browser to find optimized community layouts for each recipe.' },
      { heading: 'Production Optimization', content: '**Key Principles:**\n\n1. Minimize belt length — shorter paths = faster throughput\n2. Balance input/output ratios precisely\n3. Use splitters for parallel processing lines\n4. Buffer storage prevents production stalls\n5. Place power generators centrally to reduce transmission loss\n\n**Priority Recipes:**\n- Carbon Fiber Composite (high value, moderate complexity)\n- Refined Originium (universal upgrade material)\n- Credits (always needed for gear enhancement)' },
    ],
  },
  {
    id: 5, title: 'Headhunt Strategy', category: 'Gacha', icon: 'gem', difficulty: 'Beginner', updated: '2026-02-08',
    summary: 'Smart pulling strategies, pity system mechanics, and banner analysis for building an optimal roster.',
    tags: ['gacha', 'headhunt', 'banner', 'pity', 'strategy'],
    sections: [
      { heading: 'Headhunt Rates', content: '**Standard Pull Rates:**\n- 6-star: 0.8% base (increases after soft pity)\n- 5-star: 8%\n- 4-star: 40%\n- 3-star: 51.2%\n\n**Pity System:**\n- Soft pity begins at pull 50 — rate increases ~2% per additional pull\n- Hard pity at pull 100 — guaranteed 6-star\n- Pity carries between banners of the same type\n- Featured character: 50% chance on first 6-star, 100% on second' },
      { heading: 'Banner Priority', content: '**Must-Pull Characters (Meta-Defining):**\n- Endministrator — Monophysical DPS, universally strong\n- Laevatain — Top-tier Heat DPS with combo synergy\n- Yvonne — Best Supporter with team-wide buffs\n- Last Rite — Cryo Assault specialist with highest burst\n\n**Good Value:**\n- Chen Qianyu — Solid Defender for all content\n- Gilberta — Reliable Guard with self-sustain\n- Lifeng — Strong Polearm user for stagger comps\n\n**Skip Unless Favorite:**\n- Standard pool characters (obtainable from off-banner)' },
      { heading: 'Resource Management', content: '**For F2P Operators:**\n- Save 180 pulls minimum before pulling (guarantees featured 6-star)\n- Use free daily pulls on standard banner\n- Skip banners without must-have operators\n- Monthly login provides steady premium currency\n\n**Monthly Pass Value:**\n- Best real-money value in the game\n- Provides ~30 extra pulls per month\n- Prioritize over other spending options\n\n**Anniversary/Limited Events:**\n- Save premium currency for limited operators\n- Limited banners often have improved rates\n- Event shops provide additional pull currency' },
    ],
  },
  {
    id: 6, title: 'Team Building Guide', category: 'Teams', icon: 'users', difficulty: 'Intermediate', updated: '2026-02-14',
    summary: 'Build optimal teams for different content types. Covers meta compositions, elemental synergies, and role distribution.',
    tags: ['team', 'composition', 'synergy', 'meta', 'elemental'],
    sections: [
      { heading: 'Team Composition Rules', content: 'Every team needs 4 operators. The standard framework:\n\n- **1 DPS** (Guard, Assault, or Caster)\n- **1 Tank** (Defender or Vanguard)\n- **1 Support** (Supporter)\n- **1 Flex** (second DPS, sub-DPS, or additional utility)\n\nFor harder content, consider bringing 2 DPS + 1 Defender + 1 Supporter for faster clears while maintaining survivability.' },
      { heading: 'Meta Team Compositions', content: '**Endministrator Monophysical:**\nEndministrator + Chen Qianyu + Yvonne + Gilberta\nAll Physical damage, universally effective, no elemental weakness.\n\n**Laevatain Heat Comp:**\nLaevatain + Ember + Yvonne + Last Rite\nHeat-focused with Combustion stacking. Devastating against Cryo-weak enemies.\n\n**Yvonne Support Core:**\nYvonne + Any DPS + Any DPS + Defender\nYvonne\'s buffs enable any damage dealers. Most flexible team core.\n\n**Last Rite Burst:**\nLast Rite + Pogranichnik + Yvonne + Chen Qianyu\nMaximize burst windows during break state. Highest single-target DPS.' },
      { heading: 'Elemental Synergies', content: '**Same-Element Teams:**\n- Stack status effects faster (e.g., double Heat for quick Combustion)\n- Elemental resonance bonuses if 3+ same element\n- Weakness: ineffective against resistant enemies\n\n**Mixed-Element Teams:**\n- Cover all enemy weaknesses\n- More flexible across content types\n- Less specialized burst damage\n\n**Recommended:** Build one mono-element team for farming AND one mixed team for general content.' },
    ],
  },
  {
    id: 7, title: 'Map Exploration Guide', category: 'Exploration', icon: 'map', difficulty: 'Beginner', updated: '2026-02-11',
    summary: 'Complete exploration guide for Valley IV and Wuling regions. Find all treasure chests, collectibles, and hidden areas.',
    tags: ['map', 'exploration', 'treasure', 'collectibles', 'valley', 'wuling'],
    sections: [
      { heading: 'Valley IV Overview', content: 'Valley IV contains 6 zones with 2,200+ points of interest:\n\n- **Power Plateau**: Central hub, essence farming, 4 dungeons\n- **Origin Lodespring**: Mining resources, 3 dungeons\n- **The Hub**: Main city area, vendors, quest NPCs\n- **Originium Science Park**: Research facilities, unique collectibles\n- **Valley Pass**: Mountain traversal, hidden chests\n- **Aburru Quarry**: Southern mining area, rare materials\n\nUse the Interactive Map tool to track your exploration progress and mark completed POIs.' },
      { heading: 'Wuling Region', content: 'Wuling is the second major region with 1,600+ POIs across 2 zones:\n\n- **Wuling City**: Urban environment, dense POI clusters\n- **Jingyu Valley**: Natural landscape, spread-out collectibles\n\nWuling introduces new gathering materials and unique Hongshan collectibles.' },
      { heading: 'Treasure Chest Types', content: '**Gorgeous Chest**: Rare, contains premium currency and high-tier materials\n**Locked Chest**: Requires keys dropped from nearby enemies\n**High-Tier Chest**: Good materials and gear\n**Normal Chest**: Standard resources\n**Basic Chest**: Common materials\n**Supply Box** (Wuling only): Random material drops\n**Equipment Chest** (Wuling only): Gear drops\n\nPrioritize Gorgeous and Locked chests for the best rewards.' },
      { heading: 'Exploration Tips', content: '1. Use campfires as fast travel points — unlock all of them early\n2. Climb to high points and look for glowing collectibles\n3. Some chests are hidden behind destructible walls\n4. Ether Shards often appear in hard-to-reach elevated locations\n5. Mining nodes respawn daily — establish a farming route\n6. Story Items are missable — collect during story progression\n7. Terminals provide lore and sometimes unlock hidden areas' },
    ],
  },
  {
    id: 8, title: 'Gear Artificing Guide', category: 'Gear', icon: 'crosshair', difficulty: 'Advanced', updated: '2026-02-16',
    summary: 'End-game gear optimization. Understand gear sets, stat priorities, enhancement, and the artificing system.',
    tags: ['gear', 'artificing', 'stats', 'enhancement', 'endgame'],
    sections: [
      { heading: 'Gear System Overview', content: 'Each operator equips gear in 4 slots, each providing stats and set bonuses:\n\n- **Gear Rarity**: T1 through T5 (Flawless), higher = better stats\n- **Set Bonuses**: 2-piece and 4-piece bonuses from matching sets\n- **Main Stat**: Fixed stat type determined by slot\n- **Sub Stats**: Random rolls, up to 4 substats on high-rarity gear\n- **Enhancement**: Level up gear to improve main stat value\n\nFocus on T4+ gear for serious optimization. T5 Flawless is the endgame target.' },
      { heading: 'Stat Priority by Role', content: '**DPS (Guard/Assault):**\nCrit Rate > Crit DMG > ATK% > Elemental DMG > Flat ATK\n\n**Caster:**\nArts Intensity > Elemental DMG > Crit Rate > Intellect > ATK%\n\n**Defender:**\nHP% > DEF% > Resistance > Healing Received > Flat HP\n\n**Supporter:**\nTreatment Efficiency > HP% > Ultimate Charge > Resistance > ATK%\n\nAlways prioritize percentage-based stats over flat stats at endgame.' },
      { heading: 'Artificing System', content: 'The Gear Artificing system lets you reroll and optimize gear:\n\n- **Reroll Substats**: Spend materials to reroll one substat\n- **Lock Stats**: Lock valuable substats before rerolling\n- **Upgrade Quality**: Chance to upgrade substat tier on enhancement milestones\n- **Transfer**: Move set bonuses between compatible gear pieces\n\nUse the Gear Artificing Solver tool to calculate optimal reroll targets.' },
    ],
  },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'General': <Star size={14} />,
  'Combat': <Sword size={14} />,
  'Gear': <FlaskConical size={14} />,
  'Factory': <Factory size={14} />,
  'Gacha': <Gem size={14} />,
  'Teams': <Users size={14} />,
  'Exploration': <MapPin size={14} />,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  'Beginner': 'text-green-400 border-green-500/30 bg-green-500/10',
  'Intermediate': 'text-[var(--color-accent)] border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10',
  'Advanced': 'text-red-400 border-red-500/30 bg-red-500/10',
};

export default function GuidesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const categories = useMemo(() => ['All', ...Array.from(new Set(GUIDES.map(g => g.category)))], []);

  const filteredGuides = useMemo(() => GUIDES.filter(guide => {
    const matchesSearch = !searchTerm || guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.tags.some(t => t.includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }), [searchTerm, selectedCategory]);

  // Render inline markdown (bold, links)
  const renderLine = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      if (line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 my-1 flex items-start gap-2">
            <span className="text-[var(--color-accent)] shrink-0 mt-0.5">▸</span>
            <span>{renderLine(line.substring(2))}</span>
          </li>
        );
      }
      if (line.match(/^\d+\./)) {
        return (
          <li key={idx} className="ml-4 my-1 flex items-start gap-2">
            <span className="text-[var(--color-accent)] shrink-0 font-bold">{line.match(/^\d+/)![0]}.</span>
            <span>{renderLine(line.substring(line.indexOf('.') + 2))}</span>
          </li>
        );
      }
      if (line.trim() === '') return <div key={idx} className="h-3" />;
      return <p key={idx} className="my-1.5 leading-relaxed">{renderLine(line)}</p>;
    });
  };

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <RIOSHeader title="Intelligence Briefings" category="INTEL" code="RIOS-GDE-001" icon={<BookOpen size={28} />} />

        {!selectedGuide ? (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] w-4 h-4" />
              <input
                type="text"
                placeholder="Search guides, tags..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white text-sm font-mono"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold transition-colors clip-corner-tl ${
                    selectedCategory === cat
                      ? 'bg-[var(--color-accent)] text-black'
                      : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)] hover:text-white'
                  }`}
                >
                  {cat !== 'All' && CATEGORY_ICONS[cat]}
                  {cat}
                </button>
              ))}
            </div>

            {/* Guide Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {filteredGuides.map(guide => (
                <button
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide)}
                  className="group bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5 hover:border-[var(--color-accent)] transition-all text-left hover:shadow-lg hover:shadow-[var(--color-accent)]/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--color-accent)]">{CATEGORY_ICONS[guide.category] || <BookOpen size={14} />}</span>
                      <h2 className="text-white font-bold group-hover:text-[var(--color-accent)] transition-colors">{guide.title}</h2>
                    </div>
                    <ArrowRight size={16} className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] transition-colors shrink-0 mt-1" />
                  </div>
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-3 line-clamp-2">{guide.summary}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 border ${DIFFICULTY_COLORS[guide.difficulty]}`}>
                      {guide.difficulty.toUpperCase()}
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 border border-[var(--color-border)] text-[var(--color-text-tertiary)]">
                      {guide.category}
                    </span>
                    <span className="text-[9px] font-mono text-[var(--color-text-tertiary)] ml-auto">
                      {guide.sections.length} sections
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {filteredGuides.length === 0 && (
              <div className="text-center py-16">
                <Search size={32} className="mx-auto mb-2 text-[var(--color-text-tertiary)] opacity-30" />
                <p className="text-sm font-mono text-white mb-1">No guides found</p>
                <p className="text-[10px] font-mono text-[var(--color-text-tertiary)]">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => setSelectedGuide(null)}
              className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors text-sm font-mono text-[var(--color-text-tertiary)] hover:text-white"
            >
              <ChevronLeft size={14} /> Back to Guides
            </button>

            {/* Guide Header */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[var(--color-accent)]">{CATEGORY_ICONS[selectedGuide.category]}</span>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{selectedGuide.title}</h1>
              </div>
              <p className="text-sm text-[var(--color-text-tertiary)] mb-3">{selectedGuide.summary}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 border ${DIFFICULTY_COLORS[selectedGuide.difficulty]}`}>
                  {selectedGuide.difficulty.toUpperCase()}
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 border border-[var(--color-border)] text-[var(--color-text-tertiary)]">
                  {selectedGuide.category}
                </span>
                <span className="text-[9px] font-mono text-[var(--color-text-tertiary)]">Updated {selectedGuide.updated}</span>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="bg-[var(--color-surface)] border-l-3 border-l-[var(--color-accent)] border border-[var(--color-border)] clip-corner-tl p-4">
              <h3 className="text-xs font-mono font-bold text-[var(--color-accent)] uppercase mb-2">Contents</h3>
              <div className="space-y-1">
                {selectedGuide.sections.map((sec, idx) => (
                  <a key={idx} href={`#section-${idx}`} className="flex items-center gap-2 text-xs font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors">
                    <span className="text-[var(--color-accent)]">{String(idx + 1).padStart(2, '0')}</span>
                    {sec.heading}
                  </a>
                ))}
              </div>
            </div>

            {/* Guide Sections */}
            {selectedGuide.sections.map((section, idx) => (
              <div key={idx} id={`section-${idx}`} className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
                <div className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--color-accent)] font-mono font-bold text-sm">{String(idx + 1).padStart(2, '0')}</span>
                    <h2 className="text-white font-bold text-sm uppercase tracking-wider">{section.heading}</h2>
                  </div>
                </div>
                <div className="px-5 py-4 text-sm leading-relaxed">
                  {renderContent(section.content)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
