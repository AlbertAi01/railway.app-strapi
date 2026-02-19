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
      { heading: 'Banner Priority', content: '**Must-Pull Characters (Meta-Defining):**\n- Endministrator — Monophysical DPS, universally strong\n- Laevatain — Top-tier Heat DPS with combo synergy\n- Yvonne — Top-tier Cryo Assault with devastating ranged handcannon burst\n- Last Rite — Cryo Assault specialist with highest burst\n\n**Good Value:**\n- Chen Qianyu — Physical Guard with exceptional counter abilities\n- Gilberta — Nature Supporter with team buffs and crowd control\n- Lifeng — Strong Polearm user for stagger comps\n\n**Skip Unless Favorite:**\n- Standard pool characters (obtainable from off-banner)' },
      { heading: 'Resource Management', content: '**For F2P Operators:**\n- Save 180 pulls minimum before pulling (guarantees featured 6-star)\n- Use free daily pulls on standard banner\n- Skip banners without must-have operators\n- Monthly login provides steady premium currency\n\n**Monthly Pass Value:**\n- Best real-money value in the game\n- Provides ~30 extra pulls per month\n- Prioritize over other spending options\n\n**Anniversary/Limited Events:**\n- Save premium currency for limited operators\n- Limited banners often have improved rates\n- Event shops provide additional pull currency' },
    ],
  },
  {
    id: 6, title: 'Team Building Guide', category: 'Teams', icon: 'users', difficulty: 'Intermediate', updated: '2026-02-14',
    summary: 'Build optimal teams for different content types. Covers meta compositions, elemental synergies, and role distribution.',
    tags: ['team', 'composition', 'synergy', 'meta', 'elemental'],
    sections: [
      { heading: 'Team Composition Rules', content: 'Every team needs 4 operators. The standard framework:\n\n- **1 DPS** (Guard, Assault, or Caster)\n- **1 Tank** (Defender or Vanguard)\n- **1 Support** (Supporter)\n- **1 Flex** (second DPS, sub-DPS, or additional utility)\n\nFor harder content, consider bringing 2 DPS + 1 Defender + 1 Supporter for faster clears while maintaining survivability.' },
      { heading: 'Meta Team Compositions', content: '**Endministrator Physical Core:**\nEndministrator + Chen Qianyu + Lifeng + Ardelia\nAll Physical damage dealers with Ardelia\'s universal support. Strong F2P composition.\n\n**Laevatain Heat Comp:**\nLaevatain + Ember + Akekuri + Gilberta\nHeat-focused with Combustion stacking. Devastating against Cryo-weak enemies.\n\n**Cryo Burst Team:**\nLast Rite + Yvonne + Snowshine + Xaihi\nCryo Assault duo with Snowshine tanking and Xaihi healing. Freeze lockdown comp.\n\n**Last Rite + Yvonne Burst:**\nLast Rite + Yvonne + Ardelia + Chen Qianyu\nDual Cryo Assault burst with Ardelia debuffs. Highest single-target DPS.' },
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
      { heading: 'Gear System Overview', content: 'Each operator equips gear in 3 slots (Armor, Gloves, Kit), each providing stats and set bonuses:\n\n- **Gear Rarity**: T1 through T4, higher = better stats\n- **Set Bonuses**: Activate 3-piece bonuses from matching equipment sets\n- **Main Stat**: Fixed stat type determined by slot\n- **Sub Stats**: Random rolls with multiple substats on high-rarity gear\n- **Enhancement**: Level up gear to improve main stat value\n\nFocus on T3+ gear for mid-game and T4 gear sets for endgame optimization.' },
      { heading: 'Stat Priority by Role', content: '**DPS (Guard/Assault):**\nCrit Rate > Crit DMG > ATK% > Elemental DMG > Flat ATK\n\n**Caster:**\nArts Intensity > Elemental DMG > Crit Rate > Intellect > ATK%\n\n**Defender:**\nHP% > DEF% > Resistance > Healing Received > Flat HP\n\n**Supporter:**\nTreatment Efficiency > HP% > Ultimate Charge > Resistance > ATK%\n\nAlways prioritize percentage-based stats over flat stats at endgame.' },
      { heading: 'Artificing System', content: 'The Gear Artificing system lets you reroll and optimize gear:\n\n- **Reroll Substats**: Spend materials to reroll one substat\n- **Lock Stats**: Lock valuable substats before rerolling\n- **Upgrade Quality**: Chance to upgrade substat tier on enhancement milestones\n- **Transfer**: Move set bonuses between compatible gear pieces\n\nUse the Gear Artificing Solver tool to calculate optimal reroll targets.' },
    ],
  },
  {
    id: 9, title: 'Cryo Freeze Team Guide', category: 'Teams', icon: 'users', difficulty: 'Advanced', updated: '2026-02-19',
    summary: 'Full breakdown of the Cryo Freeze team comp: Last Rite, Yvonne, Xaihi, Snowshine. Chain freeze reactions for permanent enemy lockdown.',
    tags: ['team', 'cryo', 'freeze', 'last rite', 'yvonne', 'xaihi', 'snowshine', 'meta'],
    sections: [
      { heading: 'Team Overview', content: 'The Cryo Freeze team chains Solidification stacks to permanently lock down enemies, allowing Last Rite to deliver devastating greatsword combos without interruption.\n\n**Roster:**\n- **Last Rite** (Main DPS) — Greatsword Assault, Cryo element\n- **Yvonne** (Sub-DPS) — Navigator ranged support, Cryo burst\n- **Xaihi** (Healer) — Supporter with consistent healing and shields\n- **Snowshine** (Tank) — Defender that absorbs damage and applies Cryo Infliction\n\n**Strengths:** Permanent freeze uptime, high single-target burst, excellent survivability\n**Weaknesses:** Struggles against Cryo-resistant enemies, slower AoE clear' },
      { heading: 'Gear and Weapons', content: '**Last Rite:**\n- Weapon: Exemplar (BiS greatsword for Physical/Cryo hybrid scaling)\n- Equipment: Tide Surge (Elemental Burst DMG +30%)\n- Essence Priority: Strength Boost, Physical DMG Boost, Pursuit\n\n**Yvonne:**\n- Weapon: Navigator (Ranged support with Cryo amplification)\n- Equipment: Type 50 Yinglung (ATK +18%, Crit Rate +12%)\n- Essence Priority: Intellect Boost, Cryo DMG Boost, Infliction\n\n**Xaihi:**\n- Weapon: Wild Wanderer (Healing effectiveness boost)\n- Equipment: LYNX (Healing effectiveness +25%)\n- Essence Priority: Will Boost, Treatment Efficiency Boost, Medicant\n\n**Snowshine:**\n- Weapon: Seeker of Dark Lung (Tank sustain and aggro generation)\n- Equipment: Aethertech (Poise +15%, DEF +20%)\n- Essence Priority: Strength Boost, HP Boost, Combative' },
      { heading: 'Combat Rotation', content: '**Opening:**\n1. Snowshine enters first — use skill to draw aggro and apply initial Cryo Infliction\n2. Swap to Yvonne — burst skill for Cryo application + damage\n3. Swap to Last Rite — begin greatsword combo chains on frozen target\n\n**Sustained Rotation:**\n1. Last Rite combo chains (3-4 full strings) until Cryo wears off\n2. Swap to Snowshine for Cryo reapplication + tanking\n3. Swap to Yvonne for burst window if available\n4. Return to Last Rite for continued DPS\n5. Xaihi swap only when healing is needed\n\n**Ultimate Priority:**\nLast Rite > Yvonne > Snowshine > Xaihi\nSave Last Rite ultimate for break state windows for maximum burst.' },
      { heading: 'Matchup Notes', content: '**Strong Against:**\n- Physical-resistant enemies (Cryo bypasses physical resistance)\n- Single-target bosses (freeze lockdown enables full combo strings)\n- Enemies with dangerous attack patterns (freeze neutralizes them)\n\n**Weak Against:**\n- Cryo-resistant enemies (switch to Balanced Rainbow team)\n- Large mob packs (freeze is single-target focused)\n- Bosses with freeze immunity phases\n\n**Substitutions:**\n- Replace Snowshine with Chen Qianyu for more tankiness at the cost of Cryo synergy\n- Replace Xaihi with Gilberta if you need Nature buffs instead of pure healing' },
    ],
  },
  {
    id: 10, title: 'Physical Quickswap Team Guide', category: 'Teams', icon: 'users', difficulty: 'Advanced', updated: '2026-02-19',
    summary: 'Master the Physical Quickswap team: Endministrator, Lifeng, Chen Qianyu, Gilberta. Rapid character swapping for continuous combo chains.',
    tags: ['team', 'physical', 'quickswap', 'endministrator', 'lifeng', 'chen qianyu', 'gilberta', 'meta', 'speedrun'],
    sections: [
      { heading: 'Team Overview', content: 'The Physical Quickswap comp maximizes damage by rapidly cycling between operators, building and consuming combo gauge stacks for each character. Every swap generates bonus damage through the combo system.\n\n**Roster:**\n- **Endministrator** (Primary Swap) — Sword Guard, Physical element\n- **Lifeng** (Burst DPS) — Polearm specialist with high burst after combo gauge fill\n- **Chen Qianyu** (Counter DPS) — Guard with exceptional Agility for precise dodges and counters\n- **Gilberta** (Healer/Support) — Nature buffs and sustained team healing\n\n**Strengths:** No elemental weakness, high sustained DPS, forgiving rotation\n**Weaknesses:** Requires constant swapping, damage ceiling lower than specialized teams' },
      { heading: 'Gear and Weapons', content: '**Endministrator:**\n- Weapon: Forgeborn Scathe (Combo gauge generation boost)\n- Equipment: Swordmancer (Normal/Charged ATK +20%)\n- Essence Priority: Strength Boost, Physical DMG Boost, Pursuit\n\n**Lifeng:**\n- Weapon: Valiant (Polearm scaling for burst damage)\n- Equipment: Type 50 Yinglung (ATK +18%, Crit Rate +12%)\n- Essence Priority: Agility Boost, Physical DMG Boost, Assault\n\n**Chen Qianyu:**\n- Weapon: Sundering Steel (Counter-attack damage amplification)\n- Equipment: Hot Work (Elemental Skill DMG +25%)\n- Essence Priority: Agility Boost, Critical Rate Boost, Combative\n\n**Gilberta:**\n- Weapon: Opus: Etch Figure (Nature healing and buff potency)\n- Equipment: LYNX (Healing effectiveness +25%)\n- Essence Priority: Will Boost, Treatment Efficiency Boost, Medicant' },
      { heading: 'Combat Rotation', content: '**Core Loop (repeat):**\n1. Endministrator — 2-3 normal attack strings, use skill, swap immediately\n2. Lifeng — Polearm combo skill (consumes gauge), 1-2 attacks, swap\n3. Chen Qianyu — Counter enemy attack (or skill), swap\n4. Gilberta — Quick heal/buff if needed, swap back to Endministrator\n\n**Key Principles:**\n- Never stay on one character for more than 3 seconds\n- Watch for the golden combo flash — always swap during that window\n- Endministrator builds gauge fastest — always start rotations with them\n- Save ultimates for break state windows, stack them for maximum burst\n- Gilberta only enters the rotation when healing is needed\n\n**Burst Window:**\nWhen enemy enters break state: Endministrator ult > Lifeng ult > Chen Qianyu ult in rapid succession' },
      { heading: 'Matchup Notes', content: '**Strong Against:**\n- All general content (no elemental weakness)\n- Speedrun content (high sustained DPS with constant swapping)\n- Multi-phase bosses (consistent damage across long fights)\n\n**Weak Against:**\n- Enemies with Physical resistance (consider mono-element team)\n- Content that rewards elemental reactions (no status effect stacking)\n\n**Substitutions:**\n- Replace Gilberta with Ardelia for stronger healing in hard content\n- Replace Chen Qianyu with Pogranichnik for Vanguard synergy\n- Replace Lifeng with Last Rite for Cryo hybrid variant' },
    ],
  },
  {
    id: 11, title: 'Electric Overload Team Guide', category: 'Teams', icon: 'users', difficulty: 'Intermediate', updated: '2026-02-19',
    summary: 'All-electric team: Arclight, Perlica, Avywenna, Antal. Chain Electrification across the battlefield for screen-wide AoE damage.',
    tags: ['team', 'electric', 'overload', 'arclight', 'perlica', 'avywenna', 'antal', 'aoe'],
    sections: [
      { heading: 'Team Overview', content: 'The Electric Overload team stacks Electrification on all enemies simultaneously, then detonates with Perlica for massive AoE chains. One of the most satisfying teams to play with screen-clearing potential.\n\n**Roster:**\n- **Arclight** (Primary DPS) — Sword Vanguard, fast attacks for rapid Electrification\n- **Perlica** (Burst Caster) — Detonates Electric Infliction for massive AoE\n- **Avywenna** (Chain DPS) — Polearm attacks extend Electric chains with combo skills\n- **Antal** (Electric Support) — Buffs team Arts DMG and provides sustained Electric application\n\n**Strengths:** Best AoE damage in the game, satisfying chain reactions, strong mob clear\n**Weaknesses:** Not ideal for single-target, requires enemies to be grouped, Electric-resistant enemies' },
      { heading: 'Gear and Weapons', content: '**Arclight:**\n- Weapon: Rapid Ascent (Fast attack speed for stacking Electrification)\n- Equipment: Hot Work (Elemental Skill DMG +25%)\n- Essence Priority: Agility Boost, Arts Intensity Boost, Infliction\n\n**Perlica:**\n- Weapon: Detonation Unit (Amplifies detonation damage)\n- Equipment: Eternal Xiranite (Ultimate damage +25%)\n- Essence Priority: Intellect Boost, Arts Intensity Boost, Detonate\n\n**Avywenna:**\n- Weapon: Chimeric Justice (Polearm combo extension)\n- Equipment: Type 50 Yinglung (ATK +18%, Crit Rate +12%)\n- Essence Priority: Agility Boost, Arts Intensity Boost, Assault\n\n**Antal:**\n- Weapon: Hypernova Auto (Electric application over time)\n- Equipment: Mordvolt Insulation (INT +15%)\n- Essence Priority: Intellect Boost, Arts Intensity Boost, Inspiring' },
      { heading: 'Combat Rotation', content: '**AoE Rotation (mob packs):**\n1. Antal — Use buff skill to boost team Arts DMG, apply initial Electric\n2. Arclight — Dash into enemy pack, rapid sword attacks to stack Electrification on all targets\n3. Avywenna — Polearm sweep for chain extension to nearby enemies\n4. Perlica — Detonate all stacked Electrification for screen-wide AoE burst\n\n**Boss Rotation:**\n1. Antal — Buff and sustain Electric application\n2. Arclight — Primary DPS with fast attacks, building Electrification\n3. Perlica — Detonate when stacks are maxed (watch for the purple spark indicator)\n4. Avywenna — Fill DPS between detonation windows\n\n**Key Tips:**\n- Always detonate with Perlica AFTER Arclight has applied 3+ stacks\n- Antal buffs last 12 seconds — time your burst window within the buff duration\n- In large packs, position Arclight centrally for maximum chain spread' },
      { heading: 'Matchup Notes', content: '**Strong Against:**\n- Large mob encounters (chain Electrification hits everything)\n- Grouped enemies (AoE detonation deals maximum damage)\n- Enemies weak to Electric/Arts damage\n\n**Weak Against:**\n- Electric-resistant enemies (switch to Physical or Heat team)\n- Single bosses with no adds (chain reactions have less value)\n- Spread-out enemies (Electrification chains require proximity)\n\n**Substitutions:**\n- Replace Antal with Gilberta for healer safety (lose Arts buff)\n- Replace Avywenna with Lifeng for more stagger potential\n- For harder content, swap Avywenna for a Defender' },
    ],
  },
  {
    id: 12, title: 'Heat Combustion Burst Guide', category: 'Teams', icon: 'users', difficulty: 'Advanced', updated: '2026-02-19',
    summary: 'Triple Heat DPS team: Laevatain, Wulfgard, Akekuri, Gilberta. Stack Combustion and detonate for the highest burst damage in the game.',
    tags: ['team', 'heat', 'combustion', 'laevatain', 'wulfgard', 'akekuri', 'gilberta', 'speedrun', 'burst'],
    sections: [
      { heading: 'Team Overview', content: 'The Heat Combustion Burst team is built around one goal: stack Combustion as fast as possible, then nuke everything with Laevatain\'s ultimate. This team has the highest single-rotation burst damage in the game but requires precise resource management.\n\n**Roster:**\n- **Laevatain** (Main DPS) — Heat Assault operator with devastating burst damage\n- **Wulfgard** (Heat Caster) — Applies Combustion and provides ranged DPS\n- **Akekuri** (Heat Vanguard) — Fast sword attacks maintain Combustion uptime\n- **Gilberta** (Healer) — Off-element support for survivability\n\n**Strengths:** Highest burst damage possible, fast kills, speedrun meta\n**Weaknesses:** Glass cannon without proper healing, Heat-resistant enemies, requires tight rotation' },
      { heading: 'Gear and Weapons', content: '**Laevatain:**\n- Weapon: Umbral Torch (BiS — highest damage ceiling for Heat builds)\n- Equipment: Type 50 Yinglung (ATK +18%, Crit Rate +12%)\n- Essence Priority: Intellect Boost, Heat DMG Boost, Infliction\n\n**Wulfgard:**\n- Weapon: Rational Farewell (Combustion application + ranged DPS)\n- Equipment: Hot Work (Elemental Skill DMG +25%)\n- Essence Priority: Intellect Boost, Heat DMG Boost, Infliction\n\n**Akekuri:**\n- Weapon: Thermite Cutter (Fast Heat application with sword attacks)\n- Equipment: Frontiers (General DPS boost)\n- Essence Priority: Agility Boost, Heat DMG Boost, Assault\n\n**Gilberta:**\n- Weapon: Delivery Guaranteed (Quick healing bursts)\n- Equipment: LYNX (Healing effectiveness +25%)\n- Essence Priority: Will Boost, Treatment Efficiency Boost, Medicant' },
      { heading: 'Combat Rotation', content: '**Burst Setup (first 10 seconds):**\n1. Wulfgard — Skill to apply initial Combustion stacks from range\n2. Akekuri — Dash in, rapid sword strikes to push Combustion to max stacks\n3. Wulfgard — Second skill for additional Combustion layering\n4. Laevatain — Ultimate (detonates ALL Combustion for massive damage)\n\n**Sustained Phase:**\n1. Akekuri — Maintain Combustion with continuous attacks\n2. Wulfgard — Reapply Combustion on cooldown\n3. Gilberta — Heal when HP drops below 50%\n4. Laevatain — Normal attacks and skills between ultimate cooldowns\n\n**Key Tips:**\n- Laevatain ultimate does 3x damage when Combustion is at max stacks\n- Time Laevatain ult during break state for multiplicative bonus\n- Akekuri is the fastest Combustion applier — always use them for refreshing stacks\n- Gilberta is a safety net only, minimize time on her to maximize DPS' },
      { heading: 'Matchup Notes', content: '**Strong Against:**\n- Cryo-weak enemies (Heat is super effective)\n- Bosses with short vulnerability windows (massive burst fits perfectly)\n- Time-attack challenges (highest DPS ceiling)\n\n**Weak Against:**\n- Heat-resistant enemies (switch to Cryo Freeze or Physical team)\n- Long sustained fights without break states (Combustion management is taxing)\n- Content requiring survivability (only 1 healer, no defender)\n\n**Substitutions:**\n- Replace Gilberta with Ember for tank hybrid (less healing, more stagger)\n- Replace Akekuri with Arclight for Electric/Heat dual element coverage\n- For safety, replace Akekuri with Chen Qianyu (lose Heat synergy, gain tanking)' },
    ],
  },
  {
    id: 13, title: 'Nature Corruption Core Guide', category: 'Teams', icon: 'users', difficulty: 'Intermediate', updated: '2026-02-19',
    summary: 'Double healer Nature team: Ardelia, Gilberta, Fluorite, Ember. The safest team composition for clearing difficult content through attrition.',
    tags: ['team', 'nature', 'healing', 'ardelia', 'gilberta', 'fluorite', 'ember', 'safe', 'survival'],
    sections: [
      { heading: 'Team Overview', content: 'The Nature Corruption Core trades raw DPS for near-unkillable survivability. Double healers with overlapping heals and Nature buffs let you outlast any encounter through pure attrition.\n\n**Roster:**\n- **Ardelia** (Main Healer) — Supporter with high Will for massive healing output\n- **Gilberta** (Sub-Healer/Buffer) — Nature buffs and Lifted application\n- **Fluorite** (Nature Caster DPS) — Handcannon ranged attacks with high Agility\n- **Ember** (Tank) — Frontline protection while healers sustain the team\n\n**Strengths:** Nearly unkillable, great for first-time difficult content clears, forgiving playstyle\n**Weaknesses:** Low DPS means slow kills, Nature-resistant enemies, can time out on DPS checks' },
      { heading: 'Gear and Weapons', content: '**Ardelia:**\n- Weapon: Chivalric Virtues (Healing potency scaling with Will)\n- Equipment: LYNX (Healing effectiveness +25%)\n- Essence Priority: Will Boost, Treatment Efficiency Boost, Medicant\n\n**Gilberta:**\n- Weapon: Opus: Etch Figure (Nature buff amplification)\n- Equipment: Eternal Xiranite (Ultimate damage +25%)\n- Essence Priority: Will Boost, Nature DMG Boost, Inspiring\n\n**Fluorite:**\n- Weapon: Howling Guard (Handcannon with defensive utility) or Long Road (Handcannon DPS)\n- Equipment: Hot Work (Elemental Skill DMG +25%)\n- Essence Priority: Agility Boost, Nature DMG Boost, Infliction\n\n**Ember:**\n- Weapon: Former Finery (Self-sustain with tanking)\n- Equipment: Aethertech (Poise +15%, DEF +20%)\n- Essence Priority: Strength Boost, HP Boost, Combative' },
      { heading: 'Combat Rotation', content: '**Standard Rotation:**\n1. Ember — Enter combat, draw aggro with taunt skill, tank incoming damage\n2. Fluorite — Stay at range, use handcannon skills for Nature DPS\n3. Ardelia — Swap in when team HP drops below 70% for burst healing\n4. Gilberta — Use buff skill for Nature amplification, heal if Ardelia is on cooldown\n\n**Key Principles:**\n- Ember should be the active character whenever tanking is needed\n- Fluorite is your only real damage dealer — maximize her field time\n- Alternate between Ardelia and Gilberta for healing to maintain uptime\n- Use ultimates defensively (Ardelia ult = full team heal, Ember ult = massive shield)\n\n**Difficult Content Strategy:**\nFor bosses with enrage timers, swap Gilberta to aggressive mode and focus both Nature operators on DPS during safe windows.' },
      { heading: 'Matchup Notes', content: '**Strong Against:**\n- All difficult content on first attempt (survivability ensures completion)\n- Bosses with heavy damage output (double healer handles it)\n- Marathon encounters with no DPS checks\n\n**Weak Against:**\n- DPS check encounters (this team does not have enough damage)\n- Nature-resistant enemies (both DPS and buffs are Nature-based)\n- Time-limited challenges (slow clear speed)\n\n**Substitutions:**\n- Replace Gilberta with Yvonne for stronger buffs and sub-DPS\n- Replace Fluorite with Laevatain for much higher damage (lose Nature synergy)\n- Replace Ember with Chen Qianyu for a more offensive tank' },
    ],
  },
  {
    id: 14, title: 'Balanced Rainbow Team Guide', category: 'Teams', icon: 'users', difficulty: 'Intermediate', updated: '2026-02-19',
    summary: 'Four-element coverage team: Endministrator, Laevatain, Last Rite, Arclight. Adapt to any enemy weakness with maximum elemental flexibility.',
    tags: ['team', 'rainbow', 'multi-element', 'endministrator', 'laevatain', 'last rite', 'arclight', 'versatile'],
    sections: [
      { heading: 'Team Overview', content: 'The Balanced Rainbow team brings Physical, Heat, Cryo, and Electric damage for complete elemental coverage. Every enemy has at least one weakness you can exploit. High risk, high reward with no dedicated healer.\n\n**Roster:**\n- **Endministrator** (Physical DPS) — Sword Guard, well-rounded stats\n- **Laevatain** (Heat DPS) — Burst damage with Combustion\n- **Last Rite** (Cryo DPS) — Greatsword chains with freeze application\n- **Arclight** (Electric Vanguard) — High Agility for rapid elemental application\n\n**Strengths:** Covers all elemental weaknesses, quad-DPS for fast kills, versatile\n**Weaknesses:** No healer means death on mistakes, no dedicated tank, requires good dodge skills' },
      { heading: 'Gear and Weapons', content: '**Endministrator:**\n- Weapon: Forgeborn Scathe (General Physical scaling)\n- Equipment: Swordmancer (Normal/Charged ATK +20%)\n- Essence Priority: Strength Boost, Physical DMG Boost, Pursuit\n\n**Laevatain:**\n- Weapon: Umbral Torch (Maximum Heat damage ceiling)\n- Equipment: Hot Work (Elemental Skill DMG +25%)\n- Essence Priority: Intellect Boost, Heat DMG Boost, Infliction\n\n**Last Rite:**\n- Weapon: Khravengger (Cryo greatsword for freeze chains)\n- Equipment: Tide Surge (Elemental Burst DMG +30%)\n- Essence Priority: Strength Boost, Physical DMG Boost, Pursuit\n\n**Arclight:**\n- Weapon: Rapid Ascent (Fast Electric application)\n- Equipment: Frontiers (Balanced DPS boost)\n- Essence Priority: Agility Boost, Arts Intensity Boost, Infliction' },
      { heading: 'Combat Rotation', content: '**Adaptive Strategy:**\nUnlike fixed-rotation teams, Rainbow adapts to the enemy:\n\n1. Identify enemy elemental weakness\n2. Lead with the operator whose element is super effective\n3. Use other operators for combo chains and break state DPS\n4. Swap to counter new enemy types as they appear\n\n**General Rotation When Weakness Unknown:**\n1. Arclight — Fast attacks to test reactions and apply Electrification\n2. Endministrator — Physical attacks work on everything\n3. Laevatain — Skills for Heat burst if weakness confirmed\n4. Last Rite — Greatsword for stagger contribution\n\n**Survival Without Healer:**\n- Perfect dodge timing is mandatory\n- Use ultimate i-frames as emergency survival\n- Kill enemies before they kill you — aggression is your defense\n- Carry healing consumables for emergencies' },
      { heading: 'Matchup Notes', content: '**Strong Against:**\n- Mixed enemy encounters (always have the right element)\n- Exploration content (never stuck on any enemy type)\n- Players who enjoy high-skill aggressive gameplay\n\n**Weak Against:**\n- Bosses with extended fight phases (no sustain)\n- Content with unavoidable damage (no healer)\n- Players uncomfortable with dodge-heavy gameplay\n\n**Substitutions:**\n- Replace Arclight with Gilberta for a healer (lose Electric, gain survival)\n- Replace Endministrator with Chen Qianyu for tank (lose Physical DPS)\n- This team is best played as-is — any healer substitution defeats the purpose' },
    ],
  },
  {
    id: 15, title: 'Vanguard Rush Team Guide', category: 'Teams', icon: 'users', difficulty: 'Advanced', updated: '2026-02-19',
    summary: 'All-Vanguard team: Pogranichnik, Arclight, Akekuri, Alesh. Maximum aggression with rapid skill rotations and constant field pressure.',
    tags: ['team', 'vanguard', 'rush', 'pogranichnik', 'arclight', 'akekuri', 'alesh', 'speedrun', 'aggressive'],
    sections: [
      { heading: 'Team Overview', content: 'The Vanguard Rush team plays like nothing else — four Vanguards with fast cooldowns, high mobility, and relentless pressure. Every operator has balanced offense and defense, allowing continuous aggression.\n\n**Roster:**\n- **Pogranichnik** (Physical Vanguard) — High Will provides sustain through SP recovery\n- **Arclight** (Electric Vanguard) — Lightning-fast attacks with high mobility\n- **Akekuri** (Heat Vanguard) — Swift burn application and combo chains\n- **Alesh** (Cryo Vanguard) — High Strength for frontline pressure\n\n**Strengths:** Fastest rotation in the game, quad-element coverage, excellent mobility\n**Weaknesses:** No healer, no true tank, requires excellent mechanical execution' },
      { heading: 'Gear and Weapons', content: '**Pogranichnik:**\n- Weapon: Never Rest (SP recovery for constant skill usage)\n- Equipment: Swordmancer (Normal/Charged ATK +20%)\n- Essence Priority: Will Boost, Physical DMG Boost, Combative\n\n**Arclight:**\n- Weapon: Rapid Ascent (Maximum attack speed)\n- Equipment: MI Security (Balanced offense/defense)\n- Essence Priority: Agility Boost, Arts Intensity Boost, Infliction\n\n**Akekuri:**\n- Weapon: Aspirant (Vanguard-focused sword with combo bonus)\n- Equipment: Frontiers (General DPS boost)\n- Essence Priority: Agility Boost, Heat DMG Boost, Assault\n\n**Alesh:**\n- Weapon: Finchaser 3.0 (Cryo application with Strength scaling)\n- Equipment: Tide Surge (Elemental Burst DMG +30%)\n- Essence Priority: Strength Boost, Physical DMG Boost, Pursuit' },
      { heading: 'Combat Rotation', content: '**Blitz Rotation (2-second swaps):**\n1. Pogranichnik — Skill > 2 attacks > Swap (generates SP for team)\n2. Arclight — Skill > dash attack > Swap (applies Electrification)\n3. Akekuri — Skill > rapid slashes > Swap (applies Combustion)\n4. Alesh — Skill > heavy strike > Swap (applies Solidification)\n5. Repeat from step 1\n\n**Key Principles:**\n- NEVER stay on one character for more than 3 seconds\n- Every swap should coincide with a skill activation\n- The combo bonus stacks with each swap — 4th operator gets +45% damage\n- All Vanguards have short cooldowns — skills should always be available\n- SP generation is shared — Pogranichnik generates SP fastest\n\n**Emergency Protocol:**\nIf HP gets low, use Pogranichnik (highest sustain through Will) as anchor and activate ultimate for i-frames. All four ultimates can chain for 8+ seconds of invulnerability.' },
      { heading: 'Matchup Notes', content: '**Strong Against:**\n- Speedrun content (fastest clear times with skilled play)\n- Mobile enemies (Vanguards have the best gap-closing)\n- Multi-element encounters (quad-element coverage)\n\n**Weak Against:**\n- Heavy damage content (no healer, no tank)\n- Bosses requiring sustained DPS on one character\n- Players who prefer slower, methodical gameplay\n\n**This team is for advanced players who enjoy fast-paced, high-APM gameplay.** If you find yourself dying frequently, consider replacing Alesh with Gilberta for healing support, though this significantly reduces the team\'s identity.\n\n**Substitutions:**\n- Replace Alesh with any Defender for survival (lose Cryo + speed)\n- Replace one Vanguard with Yvonne for buff support (lose aggression)\n- Not recommended to change more than one slot — the team loses its identity' },
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
