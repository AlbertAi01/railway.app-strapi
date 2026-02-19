import type { WeaponType } from '@/types/game';

// ========== Guide Types ==========

export type TierRating = 'SS' | 'S' | 'A' | 'B' | 'C' | 'D';

export interface SkillData {
  name: string;
  type: 'Normal Attack' | 'Battle Skill' | 'Combo Skill' | 'Ultimate' | 'Talent';
  multiplier?: string; // e.g. "420% ATK"
  spCost?: number;
  cooldown?: number;
  description: string;
  notes?: string;
}

export interface GearSetDetail {
  name: string;
  pieces: number; // 2, 3, or 4 piece
  bonusDescription: string;
  statBoosts?: string[]; // e.g. ["ATK +15%", "Crit Rate +8%"]
  notes?: string;
}

export interface DamageCalc {
  scenario: string; // e.g. "Optimal rotation DPS", "Solo target burst"
  value: string; // e.g. "~45,000 DPS", "~180,000 burst"
  conditions?: string; // e.g. "With 4 Melting Flame stacks"
}

export interface StatPriority {
  stat: string;
  priority: 'High' | 'Medium' | 'Low';
  notes?: string;
}

export interface OperatorGuide {
  slug: string;
  ratings: {
    overall: TierRating;
    pve: TierRating;
    boss: TierRating;
    support: TierRating;
  };
  pros: string[];
  cons: string[];
  review: string;
  bestWeapons: WeaponRecommendation[];
  bestGearSets: string[];
  skillPriority: string;
  synergies: string[];
  teamComps: TeamComp[];
  // Expanded longform fields (optional for backwards compat)
  introduction?: string;
  gameplayTips?: string[];
  gearNotes?: string;
  lastUpdated?: string;
  // Enhanced Prydwen-style subsection data
  skillData?: SkillData[];
  gearSetDetails?: GearSetDetail[];
  damageCalcs?: DamageCalc[];
  statPriorities?: StatPriority[];
  elementalNotes?: string;
  rotationGuide?: string;
  comparisonNotes?: string; // vs similar operators
}

export interface WeaponRecommendation {
  name: string;
  rating: number; // 1-5
  notes: string;
}

export interface TeamComp {
  name: string;
  members: string[];
  notes: string;
}

export interface TierListEntry {
  slug: string;
  name: string;
  tier: TierRating;
  element: string;
  role: string;
}

// ========== Tier List Data ==========

export const DEFAULT_TIER_LIST: Record<TierRating, TierListEntry[]> = {
  SS: [
    { slug: 'laevatain', name: 'Laevatain', tier: 'SS', element: 'Heat', role: 'Assault' },
    { slug: 'yvonne', name: 'Yvonne', tier: 'SS', element: 'Cryo', role: 'Assault' },
  ],
  S: [
    { slug: 'ardelia', name: 'Ardelia', tier: 'S', element: 'Nature', role: 'Supporter' },
    { slug: 'gilberta', name: 'Gilberta', tier: 'S', element: 'Nature', role: 'Supporter' },
    { slug: 'pogranichnik', name: 'Pogranichnik', tier: 'S', element: 'Physical', role: 'Vanguard' },
    { slug: 'last-rite', name: 'Last Rite', tier: 'S', element: 'Cryo', role: 'Assault' },
    { slug: 'antal', name: 'Antal', tier: 'S', element: 'Electric', role: 'Supporter' },
    { slug: 'avywenna', name: 'Avywenna', tier: 'S', element: 'Electric', role: 'Assault' },
    { slug: 'xaihi', name: 'Xaihi', tier: 'S', element: 'Cryo', role: 'Supporter' },
  ],
  A: [
    { slug: 'endministrator', name: 'Endministrator', tier: 'A', element: 'Physical', role: 'Guard' },
    { slug: 'perlica', name: 'Perlica', tier: 'A', element: 'Electric', role: 'Caster' },
    { slug: 'akekuri', name: 'Akekuri', tier: 'A', element: 'Heat', role: 'Vanguard' },
    { slug: 'chen-qianyu', name: 'Chen Qianyu', tier: 'A', element: 'Physical', role: 'Guard' },
    { slug: 'lifeng', name: 'Lifeng', tier: 'A', element: 'Physical', role: 'Guard' },
  ],
  B: [
    { slug: 'ember', name: 'Ember', tier: 'B', element: 'Heat', role: 'Defender' },
    { slug: 'arclight', name: 'Arclight', tier: 'B', element: 'Electric', role: 'Vanguard' },
    { slug: 'da-pan', name: 'Da Pan', tier: 'B', element: 'Physical', role: 'Assault' },
    { slug: 'snowshine', name: 'Snowshine', tier: 'B', element: 'Cryo', role: 'Defender' },
    { slug: 'wulfgard', name: 'Wulfgard', tier: 'B', element: 'Heat', role: 'Caster' },
    { slug: 'alesh', name: 'Alesh', tier: 'B', element: 'Cryo', role: 'Vanguard' },
    { slug: 'estella', name: 'Estella', tier: 'B', element: 'Cryo', role: 'Guard' },
  ],
  C: [
    { slug: 'fluorite', name: 'Fluorite', tier: 'C', element: 'Nature', role: 'Caster' },
    { slug: 'catcher', name: 'Catcher', tier: 'C', element: 'Physical', role: 'Defender' },
  ],
  D: [],
};

// ========== Operator Guides ==========

export const OPERATOR_GUIDES: Record<string, OperatorGuide> = {
  // ===== 6-STAR OPERATORS =====

  'ardelia': {
    slug: 'ardelia',
    ratings: { overall: 'S', pve: 'S', boss: 'A', support: 'S' },
    pros: [
      'Best healer in the game with potent Nature-based restoration',
      'Applies Corrosion that converts into susceptibility debuffs, amplifying team damage',
      'Combo Skill provides AoE healing with wide coverage',
      'Flexible enough to fit into any team composition as a universal support',
      'Ultimate provides massive burst healing and damage amplification window',
    ],
    cons: [
      'Damage output is minimal when built for support',
      'Relies on teammates for elemental reactions',
      'Healing is less effective against burst damage compared to sustained',
      'As a Nature unit, limited synergy with mono-element teams outside Nature',
    ],
    review: 'Ardelia is universally regarded as the best support operator at launch. Her kit revolves around applying Corrosion through her skills, which then converts into Physical and Arts susceptibility debuffs on enemies, significantly amplifying team damage. Her Combo Skill provides wide AoE healing that keeps the team healthy during extended fights, while her Ultimate creates a massive healing and damage amplification window. She fits into virtually any team composition as a universal support, though she truly shines in teams that can capitalize on the susceptibility debuffs she applies. For players looking to invest in one support operator, Ardelia is the clear first choice.',
    bestWeapons: [
      { name: 'Dreams of the Starry Beach', rating: 5, notes: 'Best in slot (free via daily login) - +28% Arts DMG Taken debuff on enemies after consuming Corrosion' },
      { name: 'Stanza of Memorials', rating: 4, notes: 'Strong for Physical teams with +22.4% ATK team buff' },
      { name: 'Delivery Guaranteed', rating: 3, notes: 'Alternative with Ultimate Gain and Nature DMG' },
      { name: 'OBJ Arts Identifier', rating: 3, notes: 'Budget 5-star option with solid stats' },
    ],
    bestGearSets: ['Eternal Xiranite', 'Catastrophe'],
    skillPriority: 'Combo Skill > Ultimate > Battle Skill > Basic Attack',
    synergies: ['Gilberta', 'Laevatain', 'Endministrator', 'Last Rite'],
    teamComps: [
      { name: 'Universal Support', members: ['Ardelia', 'Laevatain', 'Gilberta', 'Endministrator'], notes: 'Ardelia provides healing and debuffs while the team deals damage' },
      { name: 'Nature Core', members: ['Ardelia', 'Gilberta', 'Fluorite', 'Endministrator'], notes: 'Double Nature support with Gilberta for maximum buff uptime' },
    ],
    introduction: 'Ardelia stands as the premier support operator in Arknights: Endfield, functioning as both the game\'s most reliable healer and a powerful force multiplier. Available for free through the permanent beginner login event, she occupies a unique position providing healing, Corrosion debuffs that convert into Physical and Arts susceptibility, and consistent damage amplification. Her versatility allows integration into virtually any team composition, and community consensus unanimously places her at the top of support tier lists. No other operator currently matches her combination of sustain, debuff application, and accessibility.',
    gameplayTips: ['Time Corrosion application before major DPS windows to maximize damage amplification from susceptibility debuffs', 'Coordinate ultimate usage with team burst phases to combine healing and damage amplification simultaneously', 'Position Ardelia safely behind frontline units to prevent interruption of healing channels during critical moments', 'Pair with multiple damage types to fully utilize both Physical and Arts susceptibility debuff effects', 'Monitor Corrosion stacks on priority targets and consume them strategically rather than on cooldown'],
    gearNotes: 'Eternal Xiranite is the endgame set providing 16% damage boost to all teammates after applying amplification buffs. Individual pieces grant Will, Intellect, Ultimate Gain Efficiency, and Arts Intensity. Catastrophe serves as a strong alternative emphasizing debuff duration. For early game, Mordvolt Resistant provides Will increases and Treatment Efficiency. Prioritize healing effectiveness and debuff duration stats.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'Team damage amplification', value: '+16-28% team DPS', conditions: 'Through Corrosion → Susceptibility conversion' },
      { scenario: 'Healing per second (Combo Skill)', value: '~8,500 HP/s', conditions: 'With Dreams of the Starry Beach and Will-focused build' },
      { scenario: 'Ultimate healing burst', value: '~45,000 HP', conditions: 'AoE team heal during amplification window' },
      { scenario: 'Physical Susceptibility debuff', value: '-15% Physical RES', conditions: 'After consuming Corrosion stacks on target' },
      { scenario: 'Arts Susceptibility debuff', value: '-20% Arts RES', conditions: 'With Dreams of the Starry Beach passive' },
    ],
    skillData: [
      { name: 'Nature Binding', type: 'Normal Attack', multiplier: '110-140% ATK', description: 'Arts Unit projectile chain applying minor Corrosion on hit. Low personal damage but consistent debuff application.', notes: 'Use between skill cooldowns to maintain Corrosion uptime' },
      { name: 'Restorative Bloom', type: 'Battle Skill', multiplier: 'Heal: 250% Will', spCost: 20, description: 'Targeted heal on lowest-HP ally. Applies 2 stacks of Corrosion to nearby enemies on activation.', notes: 'Primary healing ability - also serves as Corrosion applicator' },
      { name: 'Verdant Wave', type: 'Combo Skill', multiplier: 'Heal: 180% Will (AoE)', description: 'Wide AoE heal triggered by ally Final Strike. Converts all Corrosion on enemies within range into Physical and Arts Susceptibility debuffs.', notes: 'The key combo - time with team DPS windows for maximum amplification' },
      { name: 'Garden of Renewal', type: 'Ultimate', multiplier: 'Heal: 400% Will + 15s field', spCost: 100, description: 'Creates healing field lasting 15s. All allies inside gain continuous healing and 16% damage amplification. Enemies inside take increased Corrosion application.', notes: 'Best used before team burst phases for combined heal + damage amp' },
    ],
    gearSetDetails: [
      { name: 'Eternal Xiranite', pieces: 4, bonusDescription: 'After applying amplification buff to ally, all teammates deal +16% damage for 12s. Refreshable.', statBoosts: ['Team DMG +16%', '12s duration', 'Refreshable on buff application'], notes: 'Best endgame set - near-permanent team damage boost' },
      { name: 'Catastrophe', pieces: 4, bonusDescription: 'Debuff duration +25%. Nature DMG +20% when debuffs are active on target.', statBoosts: ['Debuff Duration +25%', 'Nature DMG +20%'], notes: 'Alternative for longer debuff windows in sustained fights' },
    ],
    statPriorities: [
      { stat: 'Will', priority: 'High', notes: 'Healing scales directly with Will' },
      { stat: 'Intellect', priority: 'High', notes: 'Improves Corrosion application and debuff potency' },
      { stat: 'Treatment Efficiency', priority: 'High', notes: 'Direct healing multiplier' },
      { stat: 'Ultimate Gain Efficiency', priority: 'Medium', notes: 'More frequent Garden of Renewal uptime' },
      { stat: 'Arts Intensity', priority: 'Medium', notes: 'Improves debuff strength' },
    ],
    rotationGuide: 'START: Battle Skill on lowest-HP ally (applies Corrosion)\n→ Teammates attack Corrosion-affected enemies\n→ Ally Final Strike triggers Combo Skill (AoE heal + Susceptibility conversion)\n→ DPS team executes burst during Susceptibility window\n→ Ultimate before major damage phase (heal field + 16% damage amp)\n→ Maintain Corrosion uptime with basic attacks between cooldowns\n→ Repeat from Battle Skill\n\nKEY: Corrosion must be present BEFORE Combo Skill triggers to convert into Susceptibility. Time consumption windows with team DPS.',
    comparisonNotes: 'vs Xaihi: Ardelia provides universal support (any team), while Xaihi is Cryo-specific. Ardelia heals more and debuffs broader. Use Xaihi only in dedicated Cryo teams.\n\nvs Gilberta: Both are S-tier supports but serve different roles. Ardelia heals and debuffs; Gilberta CCs and amplifies. Ideal team runs both when possible.',
  },

  'ember': {
    slug: 'ember',
    ratings: { overall: 'B', pve: 'B', boss: 'B', support: 'B' },
    pros: [
      'Applies Vulnerable without needing to spend SP via Combo Skill',
      'Team-wide shielding based on own HP',
      'Easy-to-trigger Combo Skill healing for the controlled operator',
      'Gains Protection when using Battle or Combo Skill, activating support set effects',
      'Combo Skill trigger requirement is generic and works in any team',
    ],
    cons: [
      'Despite easy-to-trigger Combo Skill, activation can sometimes be inconvenient',
      'Combo Skill does not heal when it misses enemies',
      'No damage boosting potential outside of sets and weapons',
      'Currently lacks strong meta relevance compared to top defenders',
    ],
    review: 'Ember is a solid Heat Defender whose primary role is applying Vulnerable debuffs and providing team shielding. Her Combo Skill is noteworthy for being completely generic in its trigger requirements, meaning she fits into any team composition without elemental restrictions. However, her damage contribution is limited, and she lacks the damage amplification tools that make top-tier supports so valuable. She performs adequately as a frontline tank but currently sits below premier defenders in the meta. Ember may gain more relevance as future characters are released that synergize with Heat defenders.',
    bestWeapons: [
      { name: 'Thunderberge', rating: 5, notes: 'Best in slot - +67.2% Shield increase, additional shield based on Max HP' },
      { name: 'Finishing Call', rating: 4, notes: 'Strong F2P option with +56% Combo Skill healing' },
      { name: 'Former Finery', rating: 3, notes: 'Alternative for healing focus' },
      { name: 'Industry 0.1', rating: 2, notes: 'Accessible 4-star option' },
    ],
    bestGearSets: ['LYNX', 'Eternal Xiranite'],
    skillPriority: 'Combo Skill > Ultimate > Battle Skill > Basic Attack',
    synergies: ['Laevatain', 'Akekuri', 'Wulfgard', 'Antal'],
    teamComps: [
      { name: 'Heat Defense', members: ['Ember', 'Laevatain', 'Akekuri', 'Ardelia'], notes: 'Ember tanks while Laevatain deals damage' },
    ],
    introduction: 'Ember functions as a versatile Heat Defender operating as a hybrid tank and support unit. Her kit centers on applying Vulnerable debuffs through a generic Combo Skill trigger that works in any team composition, alongside team-wide shielding based on her own HP. While she provides decent frontline presence and Physical Status application for Swordmancer synergy, her lack of damage amplification tools keeps her below premier supports. She particularly excels in Physical teams where Swordmancer gear enables consistent stagger through her skill rotations, and she scales well as a Will-focused operator.',
    gameplayTips: ['Position Ember aggressively to take damage, triggering her ATK increase passive while using Battle and Combo Skills to mitigate incoming damage', 'Time Battle Skill usage when being hit to apply bonus stagger damage and maximize Vulnerability uptime for Physical damage dealers', 'Prioritize Will stat through gear selection as healing scales directly with this attribute', 'Use Ultimate strategically before burst damage phases to provide team-wide shields and protection', 'In Swordmancer builds, maintain consistent skill rotations to permanently lock down bosses through stagger application'],
    gearNotes: 'LYNX set is optimal for healing-focused builds, granting +20% Treatment Efficiency and 15% damage reduction for allies for 10 seconds. Eternal Xiranite provides team-wide damage boost after applying Protection buffs. For early game, Mordvolt Resistant offers Will increases. The choice between LYNX and Eternal Xiranite depends on whether your team needs more survivability (LYNX) or damage amplification (Xiranite).',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'Team shielding (max HP build)', value: '~12,000 shield', conditions: 'Shield based on 25% Max HP with Thunderberge' },
      { scenario: 'Combo Skill healing', value: '~6,800 HP', conditions: 'With Finishing Call +56% healing passive' },
      { scenario: 'Vulnerable debuff amplification', value: '+12% DMG taken', conditions: 'Applied via Combo Skill on hit enemies' },
      { scenario: 'Stagger output (Swordmancer)', value: '~3,200 stagger/rotation', conditions: 'Full skill rotation with Swordmancer 4-piece' },
    ],
    skillData: [
      { name: 'Greatsword Strike', type: 'Normal Attack', multiplier: '120-160% ATK', description: 'Slow but powerful greatsword swings. Each hit generates Protection stacks and builds aggro. Final hit applies minor Vulnerable.', notes: 'Use between skill cooldowns to maintain aggro and Protection' },
      { name: 'Iron Bastion', type: 'Battle Skill', multiplier: 'Shield: 25% Max HP', spCost: 25, description: 'Creates team-wide shields based on Ember\'s Max HP. Gains Protection status, activating support set bonuses. Applies Physical Status to nearby enemies.', notes: 'Use proactively before incoming damage spikes for maximum value' },
      { name: 'Vulnerable Smash', type: 'Combo Skill', multiplier: '220% ATK + Heal: 180% Will', description: 'Generic trigger — activates after any ally\'s Final Strike. Deals greatsword slam applying Vulnerable debuff. Heals controlled operator based on Will.', notes: 'Core ability — provides both debuff and sustain in one action' },
      { name: 'Fortress Flame', type: 'Ultimate', multiplier: 'Shield: 40% Max HP + 350% ATK', spCost: 100, description: 'Massive greatsword slam dealing Heat AoE damage. All allies receive reinforced shields and damage reduction for 10s. Applies Combustion to all hit enemies.', notes: 'Emergency button — use before major boss mechanics or team burst phases' },
    ],
    gearSetDetails: [
      { name: 'LYNX', pieces: 3, bonusDescription: '+20% Treatment Efficiency. After applying heal, allies gain 15% damage reduction for 10s.', statBoosts: ['Treatment Efficiency +20%', 'Ally DMG Reduction 15%', '10s duration'], notes: 'Best defensive set — multiplicative damage reduction stacks with shields' },
      { name: 'Eternal Xiranite', pieces: 3, bonusDescription: 'After applying Protection buff, all teammates deal +16% damage for 12s.', statBoosts: ['Team DMG +16%', '12s duration', 'Refreshable'], notes: 'Offensive alternative — Protection from Battle Skill triggers set bonus easily' },
    ],
    statPriorities: [
      { stat: 'Strength', priority: 'High', notes: 'Highest base at 176 — HP and shield scaling' },
      { stat: 'Will', priority: 'High', notes: 'Healing scales directly with Will stat' },
      { stat: 'HP%', priority: 'High', notes: 'Shield strength scales with Max HP' },
      { stat: 'DEF%', priority: 'Medium', notes: 'Reduces incoming damage while tanking' },
      { stat: 'Treatment Efficiency', priority: 'Medium', notes: 'Improves Combo Skill healing output' },
    ],
    rotationGuide: 'START: Battle Skill (shields team + gains Protection status)\n→ Tank enemy attacks while building SP\n→ Ally executes Final Strike → triggers Combo Skill (Vulnerable + heal)\n→ Continue basic attacks to maintain aggro and Protection\n→ Battle Skill again on cooldown (refresh shields)\n→ Ultimate before major damage phases (massive shield + AoE)\n→ Repeat from Battle Skill\n\nKEY: Always maintain Protection status for set bonus uptime. Combo Skill triggers automatically — focus on positioning to hit priority targets with Vulnerable.',
    comparisonNotes: 'vs Snowshine: Both are Defender tanks but serve different elements. Ember provides Vulnerable debuffs and generic Combo Skill triggers that work in any team, while Snowshine specializes in Cryo terrain and freeze support. Ember is more versatile; Snowshine is better in dedicated Cryo teams.\n\nvs Catcher: Catcher is a pure Physical tank with higher raw mitigation but zero support utility. Ember trades some tankiness for team shields, healing, and Vulnerable application. For teams that need both a tank and support utility, Ember is the superior choice.',
  },

  'endministrator': {
    slug: 'endministrator',
    ratings: { overall: 'A', pve: 'A', boss: 'A', support: 'B' },
    pros: [
      'Free 6-star protagonist available to all players',
      'Strong solo-carry potential with balanced offensive stats',
      'Applies Physical vulnerability for team damage amplification',
      'Versatile kit that functions well in multiple team compositions',
      'Good crowd control capabilities through crystallization',
    ],
    cons: [
      'Damage output lower than dedicated Assault operators',
      'Physical element lacks reaction multipliers of other elements',
      'Guard role means competing with other strong Guards for team slots',
      'Requires investment to reach full potential',
    ],
    review: 'As the free protagonist, Endministrator provides exceptional value for all players. A Physical Guard with balanced stats emphasizing Agility, they excel at applying Physical vulnerability debuffs that amplify the entire team\'s damage. Their kit provides good crowd control through crystallization mechanics and solid sustained DPS. While not matching dedicated Assault operators in raw damage, their versatility and free availability make them a staple in most team compositions early on. Physical teams built around Endministrator, Pogranichnik, and Chen Qianyu form one of the strongest free-to-play compositions available.',
    bestWeapons: [
      { name: 'Grand Vision', rating: 5, notes: 'Signature best in slot - Damage boost on next Battle Skill/Ultimate after Combo Skill, perfect rotation synergy' },
      { name: 'Eminent Repute', rating: 4, notes: 'Team utility option consuming Vulnerable Stacks for team ATK increase' },
      { name: 'Sundering Steel', rating: 3, notes: '5-star F2P option with ATK, Physical DMG, and Agility boosts' },
      { name: 'Contingent Measure', rating: 2, notes: '4-star fallback with solid base stats' },
    ],
    bestGearSets: ['Swordmancer', 'Bonekrusha'],
    skillPriority: 'Battle Skill > Combo Skill = Ultimate > Basic Attack',
    synergies: ['Pogranichnik', 'Chen Qianyu', 'Lifeng', 'Ardelia'],
    teamComps: [
      { name: 'Physical Core', members: ['Endministrator', 'Pogranichnik', 'Chen Qianyu', 'Ardelia'], notes: 'Strong F2P Physical team with vulnerability stacking' },
      { name: 'Balanced F2P', members: ['Endministrator', 'Last Rite', 'Ardelia', 'Antal'], notes: 'Mixed element team using free operators' },
    ],
    introduction: 'As the protagonist of Arknights: Endfield, Endministrator serves as a premier Physical damage dealer with unique Originium Crystal mechanics that no other operator currently possesses. This free 6-star functions as the main DPS anchor for Physical compositions, offering both consistent damage output and valuable team utility through Realspace Stasis buffs. The character\'s accessibility through main story progression makes them viable for all players regardless of gacha luck. Physical teams built around Endministrator, Pogranichnik, and Chen Qianyu form one of the strongest compositions in the game.',
    gameplayTips: ['Trigger teammate Combo Skills via their Final Strikes to generate Originium Crystals through Sealing Sequence', 'Apply Vulnerable stacks from Chen Qianyu or Lifeng before using Battle Skill to maximize Crush damage consumption', 'Execute Basic Attacks before breaking Crystals to accumulate Combat Talent bonus stacks', 'Time Ultimates when enemies are Staggered for maximum damage output across all team compositions', 'Manage team slot ordering carefully as Combo Skill priority triggers based on position'],
    gearNotes: 'Swordmancer (4-piece) grants +20% Stagger Efficiency Bonus and triggers additional Physical damage after applying Physical Status effects. Bonekrusha delivers massive Battle Skill damage increases when consuming Combo Skill stacks. For early game, Roving MSGR provides Agility +50 and conditional Physical DMG +20%. The Swordmancer set synergizes perfectly with Crystal-consuming mechanics.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'Battle Skill (Crystal consume)', value: '~380% ATK + Crystal bonus', conditions: 'With Originium Crystal mechanics active' },
      { scenario: 'Physical team sustained DPS', value: '~28,000/s', conditions: 'In Physical Core team with Pogranichnik + Chen Qianyu' },
      { scenario: 'Realspace Stasis buff', value: '+15% team Physical DMG', conditions: 'After triggering Crystal abilities' },
    ],
    skillData: [
      { name: 'Tactical Strike', type: 'Normal Attack', multiplier: '140-170% ATK', description: 'Fast 4-hit sword combo. Final Strike triggers Originium Crystal formation via Sealing Sequence talent.', notes: 'Generate Crystals through basic attack chains for team combo triggers' },
      { name: 'Crystal Shatter', type: 'Battle Skill', multiplier: '380% ATK', spCost: 25, description: 'Consumes Originium Crystals for enhanced Physical damage. Applies Physical Vulnerability and Realspace Stasis buff to team.', notes: 'Core damage ability - consume crystals for both damage and team buffs' },
      { name: 'Sealing Sequence', type: 'Combo Skill', multiplier: '300% ATK', description: 'Triggered by teammate Final Strike. Creates Originium Crystals and deals AoE Physical damage. Crystals can be consumed by Battle Skill for enhanced hits.', notes: 'Main Crystal generation method - coordinate with teammates' },
      { name: 'Originium Overcharge', type: 'Ultimate', multiplier: '600% ATK', spCost: 100, description: 'Massive Physical burst damage. Consumes all active Crystals for bonus damage per Crystal. Applies Stagger to all hit enemies.', notes: 'Huge burst - use against Staggered enemies for maximum output' },
    ],
    gearSetDetails: [
      { name: 'Swordmancer', pieces: 4, bonusDescription: '+20% Stagger Efficiency. After applying Physical Status, trigger additional Physical damage equal to 30% ATK.', statBoosts: ['Stagger Efficiency +20%', 'Physical DMG proc 30% ATK', 'Agility +50 (2-piece)'], notes: 'Best set synergizing with Crystal-consume mechanics' },
      { name: 'Bonekrusha', pieces: 4, bonusDescription: 'Battle Skill DMG +30% after using Combo Skill. ATK +15% for 12s.', statBoosts: ['Battle Skill DMG +30%', 'ATK +15%', '12s duration'], notes: 'Burst-focused alternative for maximum Battle Skill damage' },
    ],
    statPriorities: [
      { stat: 'Agility', priority: 'High', notes: 'Highest base at 141 - primary scaling' },
      { stat: 'Strength', priority: 'High', notes: 'Balanced at 124 - important for Physical damage' },
      { stat: 'Physical DMG', priority: 'High', notes: 'Direct multiplier for all abilities' },
      { stat: 'Crit Rate', priority: 'Medium', notes: 'Valuable after main stat investment' },
    ],
    rotationGuide: 'START: Basic attack chain to generate Crystals via Final Strike\n→ Teammates trigger Combo Skill (Crystal generation)\n→ Accumulate 3-4 Crystals\n→ Battle Skill (Crystal consume for enhanced damage + team buff)\n→ Chen Qianyu or Lifeng apply additional Vulnerability\n→ Ultimate when enemies are Staggered (600% + Crystal bonus)\n→ Repeat from basic attacks\n\nKEY: Coordinate Crystal generation with teammate rotations. Free protagonist, so build them early.',
    comparisonNotes: 'vs Chen Qianyu: Endministrator has better base stats and Crystal mechanics for sustained DPS. Chen Qianyu has higher skill ceiling with counter mechanics. Both work together in Physical teams.\n\nvs Lifeng: Similar role but different execution. Endministrator has unique Crystal system while Lifeng offers broader Vulnerability application. Physical teams benefit from both.',
  },

  'gilberta': {
    slug: 'gilberta',
    ratings: { overall: 'S', pve: 'S', boss: 'A', support: 'S' },
    pros: [
      'Exceptional crowd control with Nature-based abilities',
      'Defense reduction debuffs that amplify team damage significantly',
      'Enables Arts reactions across multiple elemental combinations',
      'Extremely flexible - fits into nearly any team composition',
      'Long-term meta staple with high future-proof potential',
    ],
    cons: [
      'Requires some skill to maximize crowd control uptime',
      'Personal damage is secondary to support utility',
      'Nature element means less direct synergy with mono-element DPS teams',
      'High Will stat means defensive rather than offensive stat distribution',
    ],
    review: 'Gilberta is often compared to Genshin Impact\'s Kazuha for her universal support capabilities. As a Nature Supporter with exceptional crowd control and defense reduction debuffs, she amplifies team damage regardless of the elemental composition. Her ability to enable Arts reactions makes her valuable in mixed-element teams, and her defense reduction is one of the strongest damage multipliers available. Community consensus places her as a long-term meta staple whose value only increases as more characters are released. Her high Will stat makes her surprisingly durable for a support unit.',
    bestWeapons: [
      { name: 'Delivery Guaranteed', rating: 5, notes: 'Best in slot - +33.6% Arts DMG to team when applying Lifted, +46.4% Ultimate Gain' },
      { name: 'Opus: Etch Figure', rating: 4, notes: 'Strong alternative for support builds' },
      { name: 'Stanza of Memorials', rating: 3, notes: 'Good for mono-element teams with ATK buff' },
      { name: 'Wild Wanderer', rating: 3, notes: '5-star option with solid passive' },
    ],
    bestGearSets: ['Eternal Xiranite', 'Catastrophe'],
    skillPriority: 'Combo Skill > Battle Skill > Ultimate > Basic Attack',
    synergies: ['Ardelia', 'Laevatain', 'Yvonne', 'Avywenna'],
    teamComps: [
      { name: 'Universal Amplifier', members: ['Gilberta', 'Laevatain', 'Ardelia', 'Akekuri'], notes: 'Gilberta debuffs while Laevatain deals massive AoE damage' },
      { name: 'Cryo Amplified', members: ['Gilberta', 'Yvonne', 'Last Rite', 'Xaihi'], notes: 'Gilberta\'s defense reduction amplifies Cryo burst damage' },
    ],
    introduction: 'Gilberta is often compared to Genshin Impact\'s Kazuha for her universal support capabilities. As a Nature Supporter specializing in gravity-based crowd control and defense reduction, she amplifies team damage regardless of elemental composition. Her ability to create gravity zones that slow enemies while reducing their defenses makes her valuable in mixed-element teams, and her Arts Susceptibility application is one of the strongest damage multipliers available. Community consensus places her as a long-term meta staple whose value only increases as more characters are released.',
    gameplayTips: ['Position gravity fields to cover high-traffic enemy paths, maximizing the number of affected targets', 'Coordinate gravity field placement with ally area-of-effect abilities for devastating combinations', 'Use Arts Susceptibility application before allied arts damage bursts to amplify total team output', 'Leverage crowd control to protect vulnerable backline units like healers and ranged DPS', 'Against bosses with CC immunity, focus on maintaining Arts Susceptibility debuff uptime instead'],
    gearNotes: 'Eternal Xiranite is optimal providing 16% damage boost to all teammates after applying amplification buffs. Catastrophe serves as an alternative emphasizing debuff duration and Nature damage. Both sets synergize well with her support-focused playstyle. Prioritize Will, Intellect, and Arts Intensity substats.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'Defense reduction (Arts Susceptibility)', value: '-20% Arts RES', conditions: 'Applied via Lifted + gravity field' },
      { scenario: 'Team DPS amplification', value: '+20-35% effective team DPS', conditions: 'Through DEF reduction + Arts Susceptibility combo' },
      { scenario: 'Gravity field crowd control', value: '4s pull + slow', conditions: 'Combo Skill gravity zone' },
    ],
    statPriorities: [
      { stat: 'Will', priority: 'High', notes: 'Highest base stat at 172 - provides durability' },
      { stat: 'Intellect', priority: 'High', notes: 'Scales debuff potency and personal damage' },
      { stat: 'Arts Intensity', priority: 'Medium', notes: 'Amplifies gravity field damage and debuffs' },
      { stat: 'Ultimate Gain Efficiency', priority: 'Medium', notes: 'More frequent defense reduction windows' },
    ],
    comparisonNotes: 'vs Ardelia: Both are S-tier supports, but Gilberta focuses on CC + DEF reduction while Ardelia focuses on healing + Susceptibility debuffs. Running both provides the strongest support core in the game.\n\nvs Antal: Gilberta provides broader utility (any team) while Antal specializes in Heat/Electric. Gilberta is the more universal pick.',
    skillData: [
      { name: 'Nature Pulse', type: 'Normal Attack', multiplier: '100-130% ATK', description: 'Arts Unit projectile with Nature damage. Applies minor Lifted buildup on hit. Low damage but consistent Nature application.', notes: 'Use between cooldowns to maintain Lifted buildup on targets' },
      { name: 'Gravity Well', type: 'Battle Skill', multiplier: '260% ATK', spCost: 22, description: 'Creates a gravity zone that pulls enemies inward and applies Arts Susceptibility. Enemies in the zone take increased Arts damage and have reduced movement speed.', notes: 'Core debuff ability — place on clusters for maximum value' },
      { name: 'Verdant Collapse', type: 'Combo Skill', multiplier: '320% ATK (AoE)', description: 'Triggered by ally Final Strike. Generates massive gravity field applying Lifted status and converting into Arts Susceptibility debuffs on all affected enemies.', notes: 'The key team amplification tool — coordinate with DPS burst windows' },
      { name: 'World Unraveled', type: 'Ultimate', multiplier: '480% ATK + 12s field', spCost: 100, description: 'Creates enormous gravity vortex lasting 12s. All enemies within take sustained Nature damage, gain Lifted + Arts Susceptibility, and are pulled toward center. Allies inside gain 20% Arts DMG bonus.', notes: 'Massive CC + damage amp window — use before full team burst' },
    ],
    gearSetDetails: [
      { name: 'Eternal Xiranite', pieces: 3, bonusDescription: 'After applying amplification buff, all teammates deal +16% damage for 12s. Refreshable.', statBoosts: ['Team DMG +16%', '12s duration', 'Refreshable'], notes: 'Best set — gravity fields constantly trigger amplification' },
      { name: 'Catastrophe', pieces: 3, bonusDescription: 'Debuff duration +25%. Nature DMG +20% when debuffs active.', statBoosts: ['Debuff Duration +25%', 'Nature DMG +20%'], notes: 'Alternative for longer CC and Susceptibility windows' },
    ],
    rotationGuide: 'START: Battle Skill on enemy cluster (Gravity Well for Arts Susceptibility)\n→ DPS teammates attack debuffed enemies\n→ Ally Final Strike triggers Combo Skill (AoE Lifted + Arts Susceptibility)\n→ Team burst during Susceptibility window\n→ Ultimate before major DPS phase (12s gravity vortex + 20% Arts amp)\n→ Basic attacks to maintain Lifted buildup between cooldowns\n→ Repeat from Battle Skill\n\nKEY: Arts Susceptibility window is where team damage multiplies. Coordinate debuff timing with ally burst rotations for maximum amplification.',
  },

  'laevatain': {
    slug: 'laevatain',
    ratings: { overall: 'SS', pve: 'S', boss: 'S', support: 'C' },
    pros: [
      'Highest AoE DPS in the game with Melting Flame mechanics',
      'Self-healing below 40% HP provides excellent sustain',
      'Attack resistance during skill rotations reduces damage taken',
      'Accessible team composition with free/low-rarity supports',
      'Scales exceptionally well with investment',
    ],
    cons: [
      'Requires skillful Melting Flame stack management for peak damage',
      'Performance drops significantly without proper support setup',
      'Sword weapon type limits available weapon options for a DPS',
      'Heat element teams have fewer support options currently',
    ],
    review: 'Laevatain is described by the community as simply the strongest operator in the game. Her Melting Flame mechanic provides best-in-class AoE DPS when properly managed, and her self-healing below 40% HP gives her surprising survivability for an Assault operator. Her kit also grants attack resistance during skill rotations, making her more durable than typical glass cannon DPS. Perhaps most importantly, her team composition is accessible - she works well with free operators like Akekuri and Antal. The main skill ceiling comes from managing Melting Flame stacks optimally, but even with suboptimal play, she outdamages most alternatives.',
    bestWeapons: [
      { name: 'Forgeborn Scathe', rating: 5, notes: 'Signature weapon - +44.8% Heat DMG, +210% Basic Attack DMG for 20s after Ultimate' },
      { name: 'Umbral Torch', rating: 4, notes: 'Strong for Heat DMG + ATK boost with Combustion/Corrosion' },
      { name: 'Thermite Cutter', rating: 4, notes: 'Strong Heat-synergy alternative with team ATK buff' },
      { name: 'Fortmaker', rating: 3, notes: '5-star option with Ultimate Gain Efficiency' },
    ],
    bestGearSets: ['Hot Work', 'Tide Surge'],
    skillPriority: 'Battle Skill > Combo Skill > Ultimate > Basic Attack',
    synergies: ['Akekuri', 'Antal', 'Ember', 'Ardelia'],
    teamComps: [
      { name: 'Heat Meta', members: ['Laevatain', 'Akekuri', 'Antal', 'Ardelia'], notes: 'The strongest team composition in the game. Akekuri and Antal enable Laevatain\'s damage ceiling.' },
      { name: 'Heat Budget', members: ['Laevatain', 'Ember', 'Wulfgard', 'Ardelia'], notes: 'Alternative with Ember tanking and Wulfgard providing off-field Heat damage' },
    ],
    introduction: 'Laevatain operates as the premier Heat-element hypercarry striker, dominating AoE damage when properly supported by Heat Infliction applicators. Her role centers on absorbing Heat stacks from teammates to power devastating area-of-effect damage through enhanced Battle Skills and a transformative Ultimate that significantly amplifies basic attack damage and range for 15 seconds. Community sources consistently position her as the strongest operator when team conditions are met, though her performance drops substantially without proper Heat support. The strongest team in the game revolves around enabling her damage ceiling.',
    gameplayTips: ['Build to four Melting Flame stacks before using Battle Skill to trigger the additional enhanced hit with maximum damage and Ultimate charge', 'During 15-second Ultimate transformation, focus on basic attack chains as they become your primary damage source with significantly amplified multipliers', 'Coordinate with Heat-inflicting teammates like Wulfgard and Akekuri to ensure consistent stack generation before consumption windows', 'Leverage Ardelia\'s Corrosion application to trigger Final Strike for Combo Skill activation and additional Melting Flame stacks', 'Prioritize consuming Heat Infliction stacks from teammates immediately through Final Strike during Battle Skill'],
    gearNotes: 'Hot Work (3-piece) grants Heat DMG +50% for 10 seconds after triggering Combustion, synergizing perfectly with enhanced Battle Skill mechanics. Combine with Tide Fall Light Armor for Ultimate Gain Efficiency. Tide Surge is an alternative for burst-focused builds. For early game, Mordvolt Insulation grants Intellect and Arts DMG when above 80% HP.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'Enhanced Battle Skill (4 stacks)', value: '~420% ATK x5 hits', conditions: 'With Forgeborn Scathe passive active' },
      { scenario: 'Ultimate transformation DPS', value: '~180% ATK per hit', conditions: 'Basic attacks during 15s Ultimate window with +210% DMG bonus' },
      { scenario: 'Optimal rotation total', value: '~850,000 burst', conditions: 'Full Melting Flame cycle with Combustion triggers' },
      { scenario: 'Sustained AoE DPS', value: '~45,000/s', conditions: 'In Heat Meta team (Akekuri + Antal + Ardelia)' },
    ],
    skillData: [
      { name: 'Blazing Edge', type: 'Normal Attack', multiplier: '130-180% ATK', description: '4-hit sword combo with increasing Heat damage per hit. Final hit applies Heat Infliction.', notes: 'During Ultimate, basic attacks gain +210% DMG and extended range' },
      { name: 'Melting Flame Slash', type: 'Battle Skill', multiplier: '350% ATK (base) / 420% ATK x5 (enhanced)', spCost: 30, description: 'Consumes Melting Flame stacks. At 4 stacks, triggers enhanced version with 5 AoE hits and massive damage. Generates Ultimate charge based on stacks consumed.', notes: 'Core DPS ability - always aim for 4 stacks before using' },
      { name: 'Inferno Absorption', type: 'Combo Skill', multiplier: '280% ATK', description: 'Absorbs Heat Infliction from nearby allies, converting each stack to Melting Flame. Deals AoE Heat damage on activation.', notes: 'Triggered by ally Final Strike - main source of Melting Flame generation' },
      { name: 'Flame Incarnate', type: 'Ultimate', multiplier: '650% ATK initial + 15s transform', spCost: 100, description: 'Initial burst hit followed by 15-second transformation. Basic attacks gain +210% DMG, extended range, and apply Combustion. Self-healing below 40% HP.', notes: 'Save for burst windows; basic attacks become primary damage during transform' },
    ],
    gearSetDetails: [
      { name: 'Hot Work', pieces: 3, bonusDescription: 'Heat DMG +50% for 10 seconds after triggering Combustion reaction. Near-permanent uptime during optimal play.', statBoosts: ['Heat DMG +50%', '10s duration', 'Refreshable'], notes: 'Best endgame set - almost permanent uptime with proper Combustion triggers' },
      { name: 'Tide Surge', pieces: 4, bonusDescription: 'Arts Intensity +30 baseline. After applying 3+ Inflictions, gain additional Arts Intensity +50 for 12s.', statBoosts: ['Arts Intensity +30', 'Arts Intensity +50 conditional', '12s duration'], notes: 'Alternative for burst-focused builds emphasizing skill damage' },
    ],
    statPriorities: [
      { stat: 'Intellect', priority: 'High', notes: 'Primary scaling stat for all abilities' },
      { stat: 'Arts Intensity', priority: 'High', notes: 'Directly multiplies Heat damage output' },
      { stat: 'Crit Rate', priority: 'Medium', notes: 'Valuable after reaching Intellect soft cap' },
      { stat: 'Crit DMG', priority: 'Medium', notes: 'Multiplicative with high Crit Rate builds' },
      { stat: 'ATK', priority: 'Medium', notes: 'Base scaling for all abilities' },
      { stat: 'Strength', priority: 'Low', notes: 'Less impactful than Intellect for Heat scaling' },
    ],
    rotationGuide: 'START: Akekuri/Antal apply Heat Infliction to enemies\n→ Laevatain Combo Skill to absorb stacks (gain Melting Flame)\n→ Build to 4 Melting Flame stacks\n→ Enhanced Battle Skill (5-hit AoE burst)\n→ Ultimate when full charge (650% burst + 15s transform)\n→ Basic attack chain during transform (each hit = ~180% ATK + Combustion)\n→ Repeat from Combo Skill absorption after transform ends\n\nKEY: Never use Battle Skill below 4 Melting Flame stacks. During Ultimate, focus basic attacks on clustered enemies for maximum AoE value.',
    comparisonNotes: 'vs Yvonne: Laevatain dominates AoE content while Yvonne excels single-target. In mixed content, Laevatain provides more overall value due to broader damage coverage.\n\nvs Last Rite: Different elements (Heat vs Cryo). Laevatain requires less team-specific support to function. Last Rite has higher single-target potential in Cryo teams but narrower team options.\n\nvs Avywenna: Laevatain significantly outdamages Avywenna in both AoE and single-target. Avywenna is the Electric DPS solution for players who lack Laevatain.',
  },

  'last-rite': {
    slug: 'last-rite',
    ratings: { overall: 'S', pve: 'S', boss: 'S', support: 'C' },
    pros: [
      'Strongest free-to-play DPS option available',
      'Excels in mono-Cryo setups through Cryo affliction stacking',
      'SP-efficient rotations allow frequent skill usage',
      'High Strength stat provides strong base damage',
      'Greatsword provides good stagger value on hits',
    ],
    cons: [
      'Limited compositional flexibility due to Cryo-specific focus',
      'Performance drops significantly outside of Cryo teams',
      'Greatsword attack speed is slower than swords',
      'Requires Cryo supports to reach full potential',
    ],
    review: 'Last Rite is the strongest free-to-play DPS option and dominates mono-Cryo team compositions. Her kit revolves around stacking Cryo affliction triggers for massive damage multipliers, with SP-efficient rotations that allow frequent skill usage. She excels alongside Cryo supports like Xaihi and Snowshine who help maintain Cryo affliction uptime. While her compositional flexibility is limited compared to more universal DPS operators, within Cryo teams she matches or exceeds even premium options. For F2P players, building a Cryo team around Last Rite is one of the most effective strategies available.',
    bestWeapons: [
      { name: 'Khravengger', rating: 5, notes: 'Best greatsword for Cryo DPS builds' },
      { name: 'Sundered Prince', rating: 4, notes: 'Strong alternative with good passive' },
      { name: 'Seeker of Dark Lung', rating: 3, notes: '5-star option with solid damage' },
    ],
    bestGearSets: ['Tide Surge', 'Type 50 Yinglung'],
    skillPriority: 'Combo Skill > Battle Skill > Ultimate > Basic Attack',
    synergies: ['Xaihi', 'Snowshine', 'Yvonne', 'Estella'],
    teamComps: [
      { name: 'Cryo Core', members: ['Last Rite', 'Yvonne', 'Xaihi', 'Snowshine'], notes: 'Full Cryo team maximizing affliction stacking and freeze uptime' },
      { name: 'Cryo F2P', members: ['Last Rite', 'Xaihi', 'Estella', 'Ardelia'], notes: 'Accessible Cryo team with healing support' },
    ],
    introduction: 'Last Rite functions as an elite Cryo hypercarry striker specializing in single-target damage amplification through Cryo Susceptibility mechanics. Her role centers on applying debuffs that benefit herself and other Cryo damage dealers like Yvonne and Xaihi. She possesses one of the highest damage Ultimates in the game and distinguishes herself through exceptional burst windows when consuming exactly four Cryo Infliction stacks. Her restrictive team requirements demand specific Cryo Infliction applicators but reward proper composition with devastating damage. Community consensus positions her as a premier single-target specialist.',
    gameplayTips: ['Execute the optimal rotation: Apply Cryo Infliction with Battle Skill, consume exactly 4 Cryo Inflictions in Combo Skill, then cast Ultimate immediately after for synergistic burst', 'Target four Infliction stacks rather than minimum three to maximize Cryo Susceptibility uptime', 'Time Ultimates during Staggered states for maximum damage output', 'Coordinate with Xaihi and Fluorite to ensure consistent four-stack generation before consuming', 'Leverage Ardelia\'s Arts Susceptibility application alongside Cryo Susceptibility for multiplicative debuff stacking'],
    gearNotes: 'Tide Surge is the only viable endgame option, providing Arts Intensity boost after applying multiple Inflictions. Components: Bonekrusha Poncho, Tide Surge Gauntlets, Hanging River O2 Tube for both kit slots. The Type 50 Yinglung Light Armor can substitute the armor slot. For early game, Aburrey\'s Legacy provides Skill damage scaling before farming Tide Surge.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'Ultimate burst (4 Cryo stacks)', value: '~950,000', conditions: 'With Khravengger and Tide Surge 4-piece active' },
      { scenario: 'Combo Skill (4 Cryo consumed)', value: '~520% ATK', conditions: 'Consuming exactly 4 Cryo Infliction stacks' },
      { scenario: 'Sustained mono-Cryo DPS', value: '~42,000/s', conditions: 'In Cryo Core team with Yvonne + Xaihi' },
      { scenario: 'Cryo Susceptibility debuff', value: '-18% Cryo RES', conditions: 'Applied through Combo Skill consumption' },
    ],
    skillData: [
      { name: 'Frost Cleave', type: 'Normal Attack', multiplier: '160-200% ATK', description: 'Heavy 3-hit greatsword combo. Final hit applies Cryo Infliction to all targets hit.', notes: 'Use to generate Cryo stacks between skill cooldowns' },
      { name: 'Glacial Onslaught', type: 'Battle Skill', multiplier: '400% ATK', spCost: 25, description: 'Powerful Cryo slash applying 2 stacks of Cryo Infliction. Generates bonus Ultimate charge when hitting Cryo-affected enemies.', notes: 'Primary Cryo stack applicator - use on cooldown' },
      { name: 'Permafrost Shatter', type: 'Combo Skill', multiplier: '520% ATK (4 stacks)', description: 'Consumes Cryo Infliction stacks on target. At 4 stacks: massive damage + Cryo Susceptibility (-18% Cryo RES) for 12s.', notes: 'ALWAYS wait for 4 stacks before consuming' },
      { name: 'Absolute Judgment', type: 'Ultimate', multiplier: '850% ATK', spCost: 100, description: 'Devastating single-target Cryo burst. Damage scales with number of Cryo debuffs on target. Applies Solidification (freeze).', notes: 'Use immediately after Combo Skill for stacked debuffs' },
    ],
    statPriorities: [
      { stat: 'Strength', priority: 'High', notes: 'Highest base at 155 - primary physical scaling' },
      { stat: 'Arts Intensity', priority: 'High', notes: 'Directly multiplies Cryo damage' },
      { stat: 'Crit Rate', priority: 'High', notes: 'Essential for burst damage consistency' },
      { stat: 'Crit DMG', priority: 'Medium', notes: 'Multiplicative with Crit Rate investment' },
      { stat: 'ATK', priority: 'Medium', notes: 'Base scaling for abilities' },
    ],
    rotationGuide: 'START: Battle Skill on target (applies 2 Cryo Infliction)\n→ Xaihi applies additional Cryo Infliction (1-2 stacks)\n→ Basic attack final hit (1 more stack)\n→ Confirm 4 Cryo Infliction stacks on target\n→ Combo Skill (consumes 4 stacks → 520% ATK + Cryo Susceptibility)\n→ Ultimate IMMEDIATELY (850% ATK, boosted by Cryo debuffs)\n→ Yvonne follows up during Susceptibility window\n→ Repeat from Battle Skill\n\nKEY: The 3→4 stack threshold is critical. Never consume at 3 stacks.',
    comparisonNotes: 'vs Yvonne: Both Cryo DPS but different strengths. Last Rite has higher F2P accessibility and stronger Cryo stack consumption. Yvonne has higher single-target ceiling with signature weapon. Both excel together in Cryo Core team.\n\nvs Laevatain: Different elements (Cryo vs Heat). Last Rite requires specific Cryo support; Laevatain is more self-sufficient.',
  },

  'lifeng': {
    slug: 'lifeng',
    ratings: { overall: 'A', pve: 'A', boss: 'A', support: 'B' },
    pros: [
      'Well-rounded stats make him effective in multiple roles',
      'Applies Physical Susceptibility for team damage amplification',
      'Polearm provides good range and crowd control',
      'Knockdown mechanics useful for interrupting enemy attacks',
      'Solid sustained damage output for a Guard',
    ],
    cons: [
      'Does not excel in any single area compared to specialists',
      'Physical element lacks elemental reaction multipliers',
      'Competes with Endministrator and Chen Qianyu for Guard slots',
      'Lower burst damage compared to Assault operators',
    ],
    review: 'Lifeng is a well-rounded Physical Guard whose balanced stat distribution makes him effective across multiple scenarios. His polearm provides good range and his kit focuses on applying Physical Susceptibility debuffs that amplify team damage. Knockdown mechanics give him utility for interrupting dangerous enemy attacks. While he doesn\'t dominate any single category, his consistency and reliability make him a solid choice for Physical teams. He competes directly with Endministrator and Chen Qianyu for Guard slots, with his advantage being more balanced stats and better crowd control.',
    bestWeapons: [
      { name: 'Mountain Bearer', rating: 5, notes: 'Best polearm for Physical Guards' },
      { name: 'Valiant', rating: 4, notes: 'Good alternative with strong passive' },
      { name: 'Chimeric Justice', rating: 3, notes: '5-star polearm with decent stats' },
    ],
    bestGearSets: ['Eternal Xiranite', 'Bonekrusha'],
    skillPriority: 'Battle Skill > Ultimate = Combo Skill > Basic Attack',
    synergies: ['Endministrator', 'Pogranichnik', 'Chen Qianyu', 'Ardelia'],
    teamComps: [
      { name: 'Physical Guard Stack', members: ['Lifeng', 'Endministrator', 'Pogranichnik', 'Ardelia'], notes: 'Double Guard composition with Pogranichnik enabling Physical damage' },
    ],
    introduction: 'Lifeng serves as a Physical damage sub-DPS and support hybrid, distinguished by his unique ability to apply Physical Susceptibility independently through Battle Skill without requiring pre-existing Vulnerable stacks. His role centers on amplifying team damage through debuff application and Link stack generation that enhance subsequent teammate abilities. Multi-hit attack patterns enable consistent stagger application and exceptional synergy with Physical compositions. Community consensus positions him as a critical enabler for top-tier Physical teams, forming the core alongside Pogranichnik and Endministrator.',
    gameplayTips: ['Initiate combat with Battle Skill to apply Physical Susceptibility without requiring Vulnerable stacks, enabling teammates to capitalize immediately', 'Trigger Combo Skill via controlled operator\'s Final Strike to generate Link stacks for additional Ultimate hits', 'Execute Ultimate after Link generation to apply Knockdown twice, generating two Vulnerable stacks', 'Prioritize Intellect and Will stat optimization as Illumination talent grants 0.15% ATK per point', 'Activate Battle Skill before teammates apply Vulnerability to ensure Physical Susceptibility applies first'],
    gearNotes: 'Eternal Xiranite provides versatile team-wide benefits synergizing with Illumination talent. Combine with Swordmancer Flint kit pieces. Bonekrusha is an alternative for burst-focused builds with Wearer ATK +15% and Battle Skill DMG +30% after Combo Skill cast. For early game, Roving MSGR emphasizes Physical damage and Agility.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'Battle Skill (Physical Susceptibility)', value: '-15% Physical RES', conditions: 'Applied independently without requiring Vulnerable stacks' },
      { scenario: 'Ultimate (with Link stacks)', value: '~520% ATK x2 hits', conditions: 'After generating Link stacks via Combo Skill' },
      { scenario: 'Sustained Physical DPS', value: '~22,000/s', conditions: 'In Physical Guard Stack team with Endministrator' },
      { scenario: 'Knockdown application', value: '2 Vulnerable stacks generated', conditions: 'Ultimate Knockdown triggers on Staggered enemies' },
    ],
    skillData: [
      { name: 'Polearm Thrust', type: 'Normal Attack', multiplier: '130-165% ATK', description: 'Multi-hit polearm combo with good range. Final Strike triggers teammate Combo Skills. Generates Link stacks through consistent hits.', notes: 'Maintain attack chains for steady Link stack generation' },
      { name: 'Illuminating Strike', type: 'Battle Skill', multiplier: '300% ATK', spCost: 22, description: 'Thrust applying Physical Susceptibility directly without requiring Vulnerable stacks. Grants Illumination buff (+0.15% ATK per Intellect + Will).', notes: 'Open with this — enables team damage amplification immediately' },
      { name: 'Link Surge', type: 'Combo Skill', multiplier: '240% ATK', description: 'Triggered by controlled operator Final Strike. Generates Link stacks that enhance next Ultimate. Applies Physical damage to targets in line.', notes: 'Build Link stacks before Ultimate for additional hits' },
      { name: 'Crescent Arc', type: 'Ultimate', multiplier: '520% ATK x(1+Links)', spCost: 100, description: 'Sweeping polearm strike dealing massive Physical AoE. Additional hits based on accumulated Link stacks. Applies Knockdown generating Vulnerable stacks on Staggered enemies.', notes: 'Maximum value with Link stacks — coordinate timing carefully' },
    ],
    gearSetDetails: [
      { name: 'Eternal Xiranite', pieces: 3, bonusDescription: 'After applying amplification buff, all teammates deal +16% damage for 12s.', statBoosts: ['Team DMG +16%', '12s duration', 'Refreshable'], notes: 'Synergizes with Illumination buff from Battle Skill' },
      { name: 'Bonekrusha', pieces: 3, bonusDescription: 'Battle Skill DMG +30% after using Combo Skill. ATK +15% for 12s.', statBoosts: ['Battle Skill DMG +30%', 'ATK +15%'], notes: 'Burst-focused alternative for maximum Battle Skill damage' },
    ],
    statPriorities: [
      { stat: 'Agility', priority: 'High', notes: 'Second-highest base at 132 — primary scaling for Physical DPS' },
      { stat: 'Strength', priority: 'High', notes: 'Balanced at 124 — direct Physical damage scaling' },
      { stat: 'Intellect', priority: 'Medium', notes: 'Illumination talent grants ATK per Intellect point' },
      { stat: 'Will', priority: 'Medium', notes: 'Illumination talent also scales with Will' },
      { stat: 'Physical DMG', priority: 'High', notes: 'Universal multiplier for all abilities' },
    ],
    rotationGuide: 'START: Battle Skill (Physical Susceptibility + Illumination buff)\n→ Basic attack chain for Link stack generation\n→ Controlled operator Final Strike triggers Combo Skill (more Link stacks)\n→ Accumulate 2-3 Link stacks\n→ Ultimate (multi-hit with Link bonus + Knockdown)\n→ Teammates exploit Vulnerable stacks from Knockdown\n→ Basic attacks during cooldowns to maintain stagger\n→ Repeat from Battle Skill\n\nKEY: Physical Susceptibility from Battle Skill works independently — no setup required. Build Links before Ultimate for maximum hit count.',
    comparisonNotes: 'vs Endministrator: Both are Physical Guards competing for team slots. Endministrator has unique Crystal mechanics for sustained DPS and higher raw damage. Lifeng provides independent Physical Susceptibility (no Vulnerable stacks needed) and better team amplification. Both work in the same team for maximum Physical damage.\n\nvs Chen Qianyu: Lifeng is more reliable with straightforward Susceptibility application. Chen Qianyu has higher skill ceiling with counter mechanics but requires precise timing. Lifeng is the safer investment for consistent team damage amplification.',
  },

  'pogranichnik': {
    slug: 'pogranichnik',
    ratings: { overall: 'S', pve: 'S', boss: 'A', support: 'S' },
    pros: [
      'Essential Physical team enabler with SP generation',
      'Provides attack buffs, debuffs, and sub-DPS simultaneously',
      'High Will stat gives exceptional durability for a Vanguard',
      'Sword provides fast attack speed for combo generation',
      'Versatile kit that contributes damage while supporting',
    ],
    cons: [
      'Effectiveness drops significantly outside Physical teams',
      'Lower personal DPS compared to dedicated Assault operators',
      'Requires Physical teammates to maximize utility',
      'SP generation tied to specific skill rotations',
    ],
    review: 'Pogranichnik is the cornerstone of Physical team compositions, providing an unmatched combination of sub-DPS, debuffs, attack buffs, and SP generation. His high Will stat gives him surprising durability, and his sword\'s fast attack speed makes him excellent at generating combos. He is considered essential for any Physical team and is highly valued for his ability to contribute damage while simultaneously enabling his teammates. Community consensus places him alongside the best supports in the game, specifically for Physical compositions.',
    bestWeapons: [
      { name: 'Never Rest', rating: 5, notes: 'Signature weapon - +44.8% Physical DMG, team-wide Physical DMG boost on SP recovery (stacks 5x)' },
      { name: 'Thermite Cutter', rating: 4, notes: 'Strong universal support with +14% ATK team buff' },
      { name: 'Eminent Repute', rating: 4, notes: 'Good for personal + team damage boost' },
      { name: 'Sundering Steel', rating: 3, notes: '5-star budget option' },
    ],
    bestGearSets: ['Frontiers', 'Type 50 Yinglung'],
    skillPriority: 'Battle Skill > Combo Skill > Ultimate > Basic Attack',
    synergies: ['Endministrator', 'Chen Qianyu', 'Lifeng', 'Da Pan'],
    teamComps: [
      { name: 'Physical Meta', members: ['Pogranichnik', 'Endministrator', 'Chen Qianyu', 'Ardelia'], notes: 'The premier Physical team with Pogranichnik enabling all damage' },
    ],
    introduction: 'Pogranichnik is the cornerstone of Physical team compositions, providing an unmatched combination of SP generation, attack buffs, debuffs, and sub-DPS output. His unique value proposition centers on exceptional SP generation for the entire team while maintaining respectable Physical damage. This dual functionality makes him a non-negotiable member of the best Physical team in the game. His high Will stat gives him surprising durability for a Vanguard, and his sword\'s fast attack speed makes him excellent at generating combos and maintaining consistent pressure.',
    gameplayTips: ['Prioritize ultimate usage during extended encounters to maximize cumulative SP generation value', 'Pair with operators having powerful but expensive ultimates to fully capitalize on SP acceleration', 'Position aggressively to maintain Physical damage pressure while generating skill points', 'Coordinate team burst windows around damage buff ultimate activation', 'Use Cryo application to freeze priority targets, enabling allies to focus damage safely'],
    gearNotes: 'Frontiers reduces Combo Skill cooldown by 15% and grants team 16% damage boost for 12 seconds after SP recovery. Type 50 Yinglung provides ATK increase with Combo Skill damage scaling. The choice depends on whether your team needs SP acceleration (Frontiers) or personal damage contribution (Type 50).',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'SP generation per rotation', value: '+25-30 SP (team)', conditions: 'Full Battle Skill → Combo Skill rotation cycle' },
      { scenario: 'Physical team DPS contribution', value: '~20,000/s personal', conditions: 'While maintaining full support uptime' },
      { scenario: 'Team DPS amplification (Physical)', value: '+40-50% effective DPS', conditions: 'Through Physical DMG buff + SP acceleration combined' },
      { scenario: 'Physical DMG buff (Never Rest)', value: '+44.8% Physical DMG', conditions: 'Stacks 5x on SP recovery events' },
    ],
    skillData: [
      { name: 'Swift Strike', type: 'Normal Attack', multiplier: '120-150% ATK', description: 'Fast 5-hit sword combo applying Physical Infliction. Final hit generates bonus SP for team.', notes: 'Fast attack speed is key for combo generation - spam between skill cooldowns' },
      { name: 'Vanguard Assault', type: 'Battle Skill', multiplier: '350% ATK', spCost: 20, description: 'Dashes forward dealing Physical damage and applying Physical Vulnerability (-12% Physical RES). Generates 8 SP for all teammates on hit.', notes: 'Low SP cost enables frequent use - core rotation piece' },
      { name: 'Coordination Strike', type: 'Combo Skill', multiplier: '280% ATK + buff', description: 'Triggered by ally Final Strike. Deals Physical damage and grants team ATK +15% for 10s. Generates 6 SP for all teammates.', notes: 'Double benefit - damage + ATK buff + SP generation' },
      { name: 'Command Authority', type: 'Ultimate', multiplier: '500% ATK + 15s field', spCost: 80, description: 'Creates Physical enhancement field for 15s. All allies inside gain +20% Physical DMG and accelerated SP recovery. Pogranichnik gains increased attack speed.', notes: 'Primary buff window - align with team DPS rotation' },
    ],
    gearSetDetails: [
      { name: 'Frontiers', pieces: 4, bonusDescription: 'Combo Skill CD -15%. After SP recovery, team gains +16% DMG for 12s. Refreshable.', statBoosts: ['Combo Skill CD -15%', 'Team DMG +16%', '12s refreshable'], notes: 'Best set for SP-focused build - near-permanent team damage boost' },
      { name: 'Type 50 Yinglung', pieces: 4, bonusDescription: 'ATK +20%. Combo Skill DMG +25%. After Combo Skill, ATK +10% for 10s.', statBoosts: ['ATK +20%', 'Combo Skill DMG +25%', 'ATK +10% conditional'], notes: 'Better personal damage but less team utility than Frontiers' },
    ],
    statPriorities: [
      { stat: 'Will', priority: 'High', notes: 'Highest base at 173 - provides survivability for aggressive positioning' },
      { stat: 'ATK', priority: 'High', notes: 'Scales both damage and buff potency' },
      { stat: 'Physical DMG', priority: 'High', notes: 'Direct multiplier for all abilities' },
      { stat: 'SP Recovery', priority: 'Medium', notes: 'Amplifies team acceleration role' },
      { stat: 'Agility', priority: 'Medium', notes: 'Improves attack speed for more combo generation' },
    ],
    rotationGuide: 'START: Battle Skill dash into enemies (Physical Vulnerability + 8 SP)\n→ Basic attack chain (5 hits for combo generation)\n→ Teammate triggers Combo Skill (ATK buff + 6 SP)\n→ Repeat Battle Skill when off cooldown\n→ Ultimate when team is ready for burst phase\n→ During Ultimate: spam basic attacks (increased speed) + Battle Skill\n→ After Ultimate: continue Battle Skill → Combo Skill rotation\n\nKEY: Never hold Battle Skill - its low SP cost and team SP generation means it should be used on cooldown. Position in melee range to maximize hit count.',
    comparisonNotes: 'vs Akekuri: Pogranichnik is the clear upgrade for Physical teams. Akekuri serves Heat teams instead. Both are Vanguards but serve completely different team compositions.\n\nvs Arclight: Both are 5★+ Vanguards. Pogranichnik specializes Physical, Arclight specializes Electric. Choose based on your DPS element.',
  },

  'yvonne': {
    slug: 'yvonne',
    ratings: { overall: 'SS', pve: 'S', boss: 'S', support: 'B' },
    pros: [
      'Peak single-target DPS - optimal for boss encounters',
      'Strong crowd control through freeze mechanics',
      'Handcannon provides safe ranged damage dealing',
      'High Intellect scaling gives massive skill damage',
      'Exceptional synergy with Cryo teammates like Last Rite',
    ],
    cons: [
      'AoE coverage is limited compared to Laevatain',
      'Relies heavily on Cryo support for maximum damage',
      'Handcannon playstyle requires positioning awareness',
      'Freeze mechanics less effective against freeze-immune bosses',
    ],
    review: 'Yvonne is the undisputed queen of boss encounters, delivering peak single-target DPS that no other operator can match. Her Cryo Assault kit with handcannon provides safe ranged damage while her freeze mechanics offer excellent crowd control. High Intellect scaling means her skills hit exceptionally hard, and she synergizes perfectly with Last Rite in Cryo teams for devastating freeze-shatter combos. While her AoE coverage falls short of Laevatain\'s, for boss-focused content there is no better choice. She is a priority pull for players who want to excel in high-difficulty boss encounters.',
    bestWeapons: [
      { name: 'Artzy Tyrannical', rating: 5, notes: 'Signature weapon - +44.8% Cryo DMG, +19.5% Crit Rate, stacking Cryo DMG on crit' },
      { name: 'Navigator', rating: 4, notes: 'Strong alternative with +9.8% Cryo/Nature DMG on Solidification' },
      { name: 'Wedge', rating: 3, notes: '+22.4% Arts DMG on battle skill' },
      { name: 'Opus: The Living', rating: 3, notes: '5-star budget option' },
    ],
    bestGearSets: ['MI Security', 'Tide Surge'],
    skillPriority: 'Ultimate > Combo Skill > Battle Skill > Basic Attack',
    synergies: ['Last Rite', 'Xaihi', 'Snowshine', 'Gilberta'],
    teamComps: [
      { name: 'Cryo Boss Killer', members: ['Yvonne', 'Last Rite', 'Xaihi', 'Gilberta'], notes: 'Maximum single-target damage with freeze control' },
      { name: 'Cryo Freeze', members: ['Yvonne', 'Snowshine', 'Xaihi', 'Ardelia'], notes: 'Freeze-focused composition with sustained healing' },
    ],
    introduction: 'Yvonne operates as the premier single-target damage dealer in Arknights: Endfield, specializing in boss elimination through Cryo burst damage. Her kit revolves around applying Solidification effects to freeze enemies while buffing her own damage through summoned companion Tink-a-Bella. She delivers the highest concentrated single-target damage in the game, particularly after Ultimate activation. Her synergy with Last Rite creates devastating Cryo compositions, and she is a priority target for players who want to excel in high-difficulty boss encounters.',
    gameplayTips: ['Conserve ultimate for boss phases or priority target elimination rather than general enemy waves', 'Apply Solidification freeze effects to dangerous enemies before they execute high-damage abilities', 'Position Tink-a-Bella strategically to maximize buff uptime and damage amplification', 'Pair with debuff supports like Ardelia to amplify already exceptional burst damage further', 'Focus fire frozen targets with full team to maximize damage during crowd control windows'],
    gearNotes: 'MI Security provides 5% Crit Rate with ATK increase stacking on crits (up to 5 stacks). Tide Surge provides Arts Intensity boost synergizing with Cryo damage. MI Security is preferred for consistent crit scaling, while Tide Surge excels in burst-heavy encounters. Prioritize Crit Rate, Crit DMG, and Cryo DMG substats.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'Ultimate burst (single target)', value: '~1,200,000', conditions: 'With Artzy Tyrannical and 5 Crit stacks active' },
      { scenario: 'Sustained boss DPS', value: '~55,000/s', conditions: 'Cryo Boss Killer team with Last Rite + Xaihi' },
      { scenario: 'Tink-a-Bella enhanced shots', value: '~320% ATK per hit', conditions: 'With Solidification debuff on target' },
      { scenario: 'Freeze-shatter combo', value: '~480% ATK', conditions: 'Solidification break damage' },
    ],
    skillData: [
      { name: 'Frost Barrage', type: 'Normal Attack', multiplier: '150-200% ATK', description: '3-hit handcannon combo with Cryo application on final hit. Safe ranged engagement.', notes: 'Lower DPS than melee options but much safer positioning' },
      { name: 'Frozen Mark', type: 'Battle Skill', multiplier: '380% ATK', spCost: 25, description: 'Marks a target with Solidification. Subsequent Cryo hits deal bonus damage to marked targets. Tink-a-Bella attacks marked target for additional DPS.', notes: 'Apply before burst phases for damage amplification' },
      { name: 'Glacial Pursuit', type: 'Combo Skill', multiplier: '450% ATK', description: 'Tink-a-Bella rushes target and detonates Solidification for massive damage. Applies Cryo Susceptibility for 10s.', notes: 'Triggered by ally Final Strike - coordinate with team rotation' },
      { name: 'Absolute Zero', type: 'Ultimate', multiplier: '850% ATK + buff', spCost: 100, description: 'Massive single-target burst followed by 12s Cryo DMG buff. Tink-a-Bella enters enhanced mode dealing continuous Cryo damage to nearby enemies.', notes: 'Peak single-target damage in the game - save for boss health thresholds' },
    ],
    gearSetDetails: [
      { name: 'MI Security', pieces: 4, bonusDescription: '+5% Crit Rate baseline. ATK increases by 4% on crit, stacking up to 5 times (20% ATK). Stacks reset after 10s without critting.', statBoosts: ['Crit Rate +5%', 'ATK +4% per crit', 'Max 20% ATK at 5 stacks'], notes: 'Preferred for consistent damage output with crit scaling' },
      { name: 'Tide Surge', pieces: 4, bonusDescription: 'Arts Intensity +30 baseline. After applying 3+ Inflictions, gain additional Arts Intensity +50 for 12s.', statBoosts: ['Arts Intensity +30', 'Arts Intensity +50 conditional'], notes: 'Better for burst windows but less consistent than MI Security' },
    ],
    statPriorities: [
      { stat: 'Crit Rate', priority: 'High', notes: 'Core stat - synergizes with Artzy Tyrannical and MI Security' },
      { stat: 'Crit DMG', priority: 'High', notes: 'Multiplicative with high crit rate build' },
      { stat: 'Intellect', priority: 'High', notes: 'Primary scaling for all Cryo abilities' },
      { stat: 'Arts Intensity', priority: 'Medium', notes: 'Cryo DMG amplification' },
      { stat: 'ATK', priority: 'Medium', notes: 'Base damage scaling' },
    ],
    rotationGuide: 'START: Apply Battle Skill mark on priority target\n→ Last Rite applies Cryo Infliction (4 stacks)\n→ Xaihi heals + applies Cryo amplification\n→ Yvonne Combo Skill (triggered by ally Final Strike)\n→ Solidification detonation for burst damage\n→ Ultimate when boss reaches DPS check threshold\n→ Basic attack chain during Tink-a-Bella enhanced mode\n→ Repeat from Battle Skill\n\nKEY: Coordinate Solidification application with team burst. Ultimate is your insurance for DPS checks.',
    comparisonNotes: 'vs Laevatain: Yvonne wins single-target boss DPS by ~30%. Laevatain wins AoE by a wide margin. Build both if possible for content-specific teams.\n\nvs Last Rite: Both are Cryo DPS but serve different roles. Last Rite is the F2P option with comparable single-target through Cryo stacking. Yvonne has higher ceiling with signature weapon.',
  },

  // ===== 5-STAR OPERATORS =====

  'alesh': {
    slug: 'alesh',
    ratings: { overall: 'B', pve: 'B', boss: 'C', support: 'C' },
    pros: [
      'High Strength stat for a Vanguard provides good base damage',
      'Cryo element enables freeze reactions in Cryo teams',
      'Sword provides fast attack speed for combo generation',
    ],
    cons: [
      'Limited meta relevance in current game state',
      'Outperformed by higher-rarity Cryo operators',
      'Vanguard role overlaps with stronger options like Arclight',
      'Lacks standout utility compared to other 5-stars',
    ],
    review: 'Alesh functions as an SP battery and Cryo enabler in Shatter-focused compositions. She recovers SP via Originium Crystals from Endministrator and forces Solidification for teammates to exploit. In Shatter teams alongside Endministrator, Chen Qianyu, and Estella, she provides consistent Cryo application and SP generation. While she lacks standalone carry potential, her utility in specific compositions makes her a solid investment for players building Shatter or hybrid Physical/Cryo teams.',
    bestWeapons: [
      { name: 'Finchaser 3.0', rating: 5, notes: 'Best in slot - +19.6% Cryo DMG Taken on enemies when applying Solidification' },
      { name: 'Thermite Cutter', rating: 4, notes: 'Universal support option for team utility' },
      { name: 'Fortmaker', rating: 3, notes: 'Good for Ultimate Gain' },
      { name: 'Wave Tide', rating: 2, notes: '4-star budget option' },
    ],
    bestGearSets: ['Frontiers', 'Catastrophe'],
    skillPriority: 'Battle Skill > Combo Skill > Ultimate > Basic Attack',
    synergies: ['Last Rite', 'Xaihi', 'Snowshine'],
    teamComps: [
      { name: 'Cryo Support', members: ['Alesh', 'Last Rite', 'Xaihi', 'Ardelia'], notes: 'Budget Cryo team filler role' },
    ],
    introduction: 'Alesh functions as an SP battery and Cryo enabler in Shatter-focused team compositions. She recovers SP via Originium Crystals from Endministrator and forces Solidification for teammates to exploit. In Shatter teams alongside Endministrator, Chen Qianyu, and Estella, she provides consistent Cryo application and SP generation that improves overall rotation fluidity. While she lacks standalone carry potential, her utility in specific compositions makes her a solid investment for players building Shatter or hybrid Physical/Cryo teams.',
    gameplayTips: ['Focus on applying Cryo Infliction consistently to enable Solidification triggers for teammates', 'Coordinate SP generation with team rotation timing for maximum skill uptime', 'Use Finchaser 3.0 to apply Cryo DMG Taken debuff on Solidification for team damage amplification', 'Position safely to maintain SP generation uptime without interruption'],
    gearNotes: 'Frontiers reduces cooldowns and provides team damage boost on SP recovery, synergizing with her SP battery role. Catastrophe is an alternative for debuff duration extension. Prioritize support stats over personal damage.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'SP generation per rotation', value: '+20-25 SP (team)', conditions: 'Full skill rotation with Originium Crystal recovery' },
      { scenario: 'Cryo DMG Taken debuff', value: '-19.6% Cryo RES', conditions: 'Via Finchaser 3.0 on Solidification application' },
      { scenario: 'Solidification application rate', value: '~2 procs/rotation', conditions: 'Consistent Cryo Infliction through skill chain' },
      { scenario: 'Personal DPS contribution', value: '~12,000/s', conditions: 'In Cryo Support team with Last Rite' },
    ],
    skillData: [
      { name: 'Frost Slash', type: 'Normal Attack', multiplier: '120-150% ATK', description: 'Fast sword combo applying Cryo Infliction on each hit. Final Strike generates SP for team through Originium Crystal talent.', notes: 'Consistent Cryo application and SP generation through attack chains' },
      { name: 'Glacial Edge', type: 'Battle Skill', multiplier: '280% ATK', spCost: 20, description: 'AoE sword strike applying heavy Cryo Infliction. Triggers Solidification on targets with existing Cryo stacks. Recovers SP on Solidification.', notes: 'Primary Solidification enabler — use on pre-inflicted targets' },
      { name: 'Crystal Recovery', type: 'Combo Skill', multiplier: '200% ATK', description: 'Triggered by ally Final Strike. Recovers SP for team through Originium Crystal generation. Applies Cryo Infliction in AoE.', notes: 'Key SP battery mechanic — ensures team can maintain skill rotations' },
      { name: 'Shatter Storm', type: 'Ultimate', multiplier: '450% ATK', spCost: 100, description: 'Unleashes Cryo burst consuming all Solidification on targets for bonus damage. Applies Cryo DMG Taken debuff to all affected enemies.', notes: 'Burst window — use after accumulating Solidification on multiple targets' },
    ],
    gearSetDetails: [
      { name: 'Frontiers', pieces: 3, bonusDescription: 'Skill cooldown -15%. After recovering SP, team deals +12% damage for 8s.', statBoosts: ['Cooldown -15%', 'Team DMG +12%', '8s on SP recovery'], notes: 'Perfect synergy with SP battery role — constant team damage boost' },
      { name: 'Catastrophe', pieces: 3, bonusDescription: 'Debuff duration +25%. Nature DMG +20% when debuffs active.', statBoosts: ['Debuff Duration +25%', 'Nature DMG +20%'], notes: 'Extends Solidification and Cryo Infliction windows for team exploitation' },
    ],
    statPriorities: [
      { stat: 'Strength', priority: 'High', notes: 'Highest base at 158 — primary damage scaling' },
      { stat: 'Intellect', priority: 'Medium', notes: 'Cryo Infliction potency scaling' },
      { stat: 'Agility', priority: 'Medium', notes: 'Attack speed for faster Cryo application' },
      { stat: 'SP Recovery', priority: 'High', notes: 'Amplifies SP battery function for team' },
    ],
    rotationGuide: 'START: Basic attacks to apply Cryo Infliction on targets\n→ Battle Skill on Cryo-inflicted targets (triggers Solidification + SP recovery)\n→ Ally Final Strike triggers Combo Skill (SP generation + more Cryo)\n→ Continue basic attacks during cooldowns\n→ Battle Skill again when available (maintain Solidification uptime)\n→ Ultimate when multiple targets have Solidification (burst + Cryo debuff)\n→ Repeat from basic attacks\n\nKEY: Prioritize SP generation over personal damage. Your role is enabling teammates through consistent Cryo application and SP recovery.',
    comparisonNotes: 'vs Xaihi: Both support Cryo teams but fill different roles. Alesh provides SP generation and Solidification enabling, while Xaihi provides healing and amplification buffs. Many Cryo teams run both. Alesh is more offensive-oriented; Xaihi is more defensive.\n\nvs Estella: Both are Cryo 4-5★ options. Alesh specializes in SP battery and Solidification, while Estella focuses on Guard survivability. Alesh provides more team utility in Cryo compositions.',
  },

  'arclight': {
    slug: 'arclight',
    ratings: { overall: 'B', pve: 'B', boss: 'B', support: 'B' },
    pros: [
      'High Agility stat enables fast attack rotations',
      'Electric element provides Electrification chain damage',
      'Sword Vanguard with good combo generation',
      'Decent utility in Electric-focused team compositions',
    ],
    cons: [
      'Outshined by premium Vanguard options',
      'Electric teams have limited support options currently',
      'Not the primary damage dealer in any meta team',
      'Performance ceiling is lower than 6-star alternatives',
    ],
    review: 'Arclight is a solid Electric Vanguard who provides utility in Electric-focused teams through fast attack rotations and Electrification application. His high Agility stat makes him the fastest attacker among Vanguards, which pairs well with combo-focused playstyles. However, he lacks the standout mechanics or power spikes that define top-tier operators. He serves best as a team complement in Electric compositions alongside Avywenna and Perlica.',
    bestWeapons: [
      { name: 'Finchaser 3.0', rating: 4, notes: 'Best 5-star sword for Electric builds' },
      { name: 'Aspirant', rating: 3, notes: 'General-purpose alternative' },
      { name: 'Wave Tide', rating: 2, notes: '4-star budget option' },
    ],
    bestGearSets: ['Swordmancer', 'Mordvolt Insulation'],
    skillPriority: 'Combo Skill > Battle Skill > Ultimate > Basic Attack',
    synergies: ['Avywenna', 'Perlica', 'Antal'],
    teamComps: [
      { name: 'Electric Team', members: ['Arclight', 'Avywenna', 'Perlica', 'Antal'], notes: 'Full Electric composition with chain damage' },
    ],
    introduction: 'Arclight operates as a hybrid sub-DPS and SP battery for Electric team compositions. Her kit delivers consistent Electric damage while generating SP that accelerates team rotations. She provides Electric DMG buffs through her talent and applies Electrification through multiple abilities. While not the primary damage dealer, her combination of SP generation and Electric enabling makes her a valuable complement to Avywenna and Perlica in Electric-focused teams. Her performance improves significantly in sustained encounters where SP generation compounds over time.',
    gameplayTips: ['Use lock-on before Battle Skill to ensure Electric Infliction lands on priority targets', 'Time Ultimate for sustained buff uptime rather than casting on cooldown', 'Trigger Combo Skill reactively when allies apply Electric Inflictions for incremental damage', 'Avoid chaining three consecutive ability casts unless burst is needed - space them for positive SP generation', 'During Ultimate activation, position to hit multiple enemies for additional Combo Skill trigger opportunities'],
    gearNotes: 'Swordmancer provides Physical damage and Stagger synergy for consistent crowd control contribution. Mordvolt Insulation grants Intellect and Arts DMG when above 80% HP for damage-focused builds. The choice depends on whether you prioritize physical utility or Arts damage output.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'SP generation per rotation', value: '+15-20 SP (team)', conditions: 'Through talent and basic attack chains' },
      { scenario: 'Electric DMG buff (talent)', value: '+15% Electric DMG', conditions: 'Team buff while Arclight is on field' },
      { scenario: 'Electrification chain damage', value: '~180% ATK per proc', conditions: 'When Electrification triggers on marked enemies' },
      { scenario: 'Personal DPS contribution', value: '~18,000/s', conditions: 'In Electric Team with full Electrification uptime' },
    ],
    skillData: [
      { name: 'Lightning Slash', type: 'Normal Attack', multiplier: '125-160% ATK', description: 'Fast 5-hit sword combo applying Electric Infliction. Highest attack speed among Vanguards thanks to 145 Agility. Generates SP through talent.', notes: 'Speed is Arclight\'s advantage — maintain combos for SP generation' },
      { name: 'Voltaic Rush', type: 'Battle Skill', multiplier: '310% ATK', spCost: 20, description: 'Dash attack applying heavy Electric Infliction and Electrification on impact. Grants Electric DMG buff to team for 8s.', notes: 'Core damage and buff ability — timing matters for team synchronization' },
      { name: 'Chain Lightning', type: 'Combo Skill', multiplier: '250% ATK (chain)', description: 'Triggered by ally applying Electric Infliction. Chains lightning between Electrified enemies dealing Electric damage. Additional SP generated per enemy hit.', notes: 'Reactive ability — coordinates with Perlica for maximum chain potential' },
      { name: 'Storm Surge', type: 'Ultimate', multiplier: '480% ATK + 10s buff', spCost: 100, description: 'Electric AoE burst applying Electrification to all enemies. Team gains +20% Electric DMG for 10s. Arclight gains attack speed bonus.', notes: 'Team-wide damage amp window — coordinate with Avywenna burst phase' },
    ],
    gearSetDetails: [
      { name: 'Swordmancer', pieces: 3, bonusDescription: '+20% Stagger Efficiency. After Physical Status, trigger additional Physical damage.', statBoosts: ['Stagger Efficiency +20%', 'Physical DMG proc', 'Agility +50 (2-piece)'], notes: 'Utility-focused for crowd control contribution alongside Electric damage' },
      { name: 'Mordvolt Insulation', pieces: 3, bonusDescription: 'Intellect +50. Arts DMG +20% when above 80% HP.', statBoosts: ['Intellect +50', 'Arts DMG +20%', 'HP threshold 80%'], notes: 'Damage-focused option — requires safe positioning to maintain HP' },
    ],
    statPriorities: [
      { stat: 'Agility', priority: 'High', notes: 'Highest base at 145 — attack speed and Physical scaling' },
      { stat: 'Intellect', priority: 'High', notes: 'Arts damage and Electric Infliction potency' },
      { stat: 'Electric DMG', priority: 'Medium', notes: 'Direct multiplier for all Electric abilities' },
      { stat: 'SP Recovery', priority: 'Medium', notes: 'Amplifies battery function for team' },
    ],
    rotationGuide: 'START: Battle Skill (Electric Infliction + team Electric DMG buff)\n→ Fast basic attack chain (SP generation through talent)\n→ Perlica applies Electric Infliction → triggers Chain Lightning Combo Skill\n→ Continue basic attacks during cooldowns\n→ Battle Skill on cooldown (maintain team buff + Electrification)\n→ Ultimate before Avywenna burst window (team +20% Electric DMG)\n→ Repeat from Battle Skill\n\nKEY: Arclight is the enabler, not the carry. Focus on maintaining Electric DMG buffs and SP generation for Avywenna and Perlica to capitalize on.',
    comparisonNotes: 'vs Pogranichnik: Both are Vanguards but serve completely different elements. Pogranichnik is the Physical specialist with SP acceleration; Arclight is the Electric specialist with Electric DMG buffs. Choose based on your DPS carry element.\n\nvs Alesh: Both are 5★ Vanguards with battery functions. Alesh supports Cryo teams; Arclight supports Electric teams. Neither competes for the same team slot. Arclight has higher personal DPS due to Agility stat advantage.',
  },

  'avywenna': {
    slug: 'avywenna',
    ratings: { overall: 'S', pve: 'S', boss: 'S', support: 'B' },
    pros: [
      'Electric DPS meta driver with strong polearm attacks',
      'Balanced stats provide consistent performance',
      'High Will gives good durability for an Assault operator',
      'Excellent synergy with Electric support operators',
      'Polearm range provides safe engagement distance',
    ],
    cons: [
      'Requires Electric team setup to reach full potential',
      'Lower peak damage than 6-star Assault operators',
      'Electric teams have fewer support options than other elements',
      'Balanced stats mean no single exceptional strength',
    ],
    review: 'Avywenna is the Electric team\'s primary DPS driver, excelling in compositions built around Electrification stacking. Her polearm provides good range and her balanced stat distribution with high Will gives her better durability than typical Assault operators. She synergizes exceptionally well with Perlica and Antal, forming the backbone of Electric team compositions. While her peak damage doesn\'t match 6-star Assault operators, within her element she is the clear best choice and provides excellent value for 5-star investment.',
    bestWeapons: [
      { name: 'JET', rating: 5, notes: 'Best in slot - Increased Arts damage after Battle/Combo Skills, obtainable via level 45 weapon selector' },
      { name: 'Cohesive Traction', rating: 4, notes: 'Signature weapon - Accessible via Stock Bills or 400 Arsenal tickets, consistent performance' },
      { name: 'Chimeric Justice', rating: 2, notes: '5-star alternative with decent base stats' },
    ],
    bestGearSets: ['Bonekrusha', 'Aburrey\'s Legacy'],
    skillPriority: 'Battle Skill > Combo Skill = Ultimate > Basic Attack',
    synergies: ['Perlica', 'Antal', 'Arclight', 'Gilberta'],
    teamComps: [
      { name: 'Electric Meta', members: ['Avywenna', 'Perlica', 'Antal', 'Gilberta'], notes: 'Strongest Electric team with Gilberta amplifying damage' },
      { name: 'Electric Core', members: ['Avywenna', 'Arclight', 'Antal', 'Ardelia'], notes: 'Budget Electric team with healing support' },
    ],
    introduction: 'Avywenna stands as the premier Electric DPS and cornerstone of Electric team compositions. Her unique Thunderlance mechanic creates a positioning-based gameplay loop where players stack and retrieve lances for devastating burst damage. She cannot function independently, requiring dedicated support from Perlica to apply Electric Infliction triggering her Combo Skill. However, when properly supported, Avywenna delivers exceptional AoE and single-target damage that justifies building entire team compositions around her. She defines the Electric archetype, making her presence in such teams non-negotiable.',
    gameplayTips: ['Accumulate 6 or more Thunderlances on the battlefield before activating Battle Skill to pull them back for maximum damage per cast', 'Follow Ultimate immediately with Perlica\'s abilities to trigger Electric Burst reactions and enable Combo Skill', 'Position deliberately to create optimal lance spread patterns, ensuring Battle Skill collects all deployed lances', 'Ensure Perlica\'s abilities are available before committing major skills - running out of Infliction sources severely hampers output', 'Thunderlance returns generate energy, creating self-sustaining loops when managed properly'],
    gearNotes: 'Bonekrusha (4-piece) with Type 50 Yinglung Gloves provides Will scaling, Combo Skill damage bonuses, and Battle Skill amplification. This maximizes burst potential since damage concentrates in these two ability types. Aburrey\'s Legacy is the early game alternative with 24% universal Skill damage increase. Prioritize Will and Combo Skill damage substats.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'Battle Skill (6+ lances recalled)', value: '~380% ATK x6 hits', conditions: 'With 6 Thunderlances deployed before activation' },
      { scenario: 'Combo Skill burst', value: '~450% ATK', conditions: 'Triggered by Perlica Electric Infliction application' },
      { scenario: 'Ultimate + Electric Burst', value: '~700% ATK AoE', conditions: 'With Electric Burst reaction from Perlica follow-up' },
      { scenario: 'Sustained DPS (Electric Meta)', value: '~38,000/s', conditions: 'In full Electric team with Perlica + Antal + Gilberta' },
      { scenario: 'Solo DPS without support', value: '~15,000/s', conditions: 'Without Perlica — significantly reduced output' },
    ],
    skillData: [
      { name: 'Thunderlance Toss', type: 'Normal Attack', multiplier: '110-140% ATK', description: 'Throws Thunderlances that embed in the ground at target locations. Each lance applies Electric Infliction on hit. Lances persist on the battlefield for Battle Skill retrieval.', notes: 'Deploy lances strategically — their positions determine Battle Skill damage coverage' },
      { name: 'Lance Recall', type: 'Battle Skill', multiplier: '380% ATK x(lance count)', spCost: 25, description: 'Recalls all deployed Thunderlances, dealing Electric damage per lance as they return. More lances = more damage. Generates energy on recall for self-sustaining loops.', notes: 'Core damage ability — wait for 6+ lances before activating' },
      { name: 'Voltaic Surge', type: 'Combo Skill', multiplier: '450% ATK', description: 'Triggered when Perlica or ally applies Electric Infliction. Avywenna performs devastating polearm thrust dealing massive Electric AoE damage. Deploys additional Thunderlances.', notes: 'REQUIRES external Electric Infliction — Perlica is mandatory' },
      { name: 'Storm of Lances', type: 'Ultimate', multiplier: '700% ATK', spCost: 100, description: 'Summons storm of Thunderlances raining down on enemies. Massive AoE Electric damage. All hit enemies gain Electrification. Deploys lances everywhere for follow-up Battle Skill.', notes: 'Biggest burst window — follow with Perlica for Electric Burst reaction' },
    ],
    gearSetDetails: [
      { name: 'Bonekrusha', pieces: 3, bonusDescription: 'Battle Skill DMG +30% after Combo Skill. ATK +15% for 12s.', statBoosts: ['Battle Skill DMG +30%', 'ATK +15%', '12s duration'], notes: 'Perfect synergy — Combo Skill into Battle Skill recall is core rotation' },
      { name: "Aburrey's Legacy", pieces: 3, bonusDescription: 'Skill DMG +24%. Strength +30.', statBoosts: ['Skill DMG +24%', 'Strength +30'], notes: 'Early game option — universal damage increase before Bonekrusha farming' },
    ],
    statPriorities: [
      { stat: 'Will', priority: 'High', notes: 'Highest base at 149 — damage scaling through gear synergy' },
      { stat: 'Intellect', priority: 'High', notes: 'Electric damage and Arts scaling' },
      { stat: 'Combo Skill DMG', priority: 'High', notes: 'Direct multiplier for primary damage source' },
      { stat: 'Battle Skill DMG', priority: 'High', notes: 'Amplifies lance recall damage' },
      { stat: 'Electric DMG', priority: 'Medium', notes: 'Universal multiplier for all abilities' },
    ],
    rotationGuide: 'START: Deploy 3-4 Thunderlances via basic attacks\n→ Perlica applies Electric Infliction → triggers Combo Skill (massive burst + more lances)\n→ Now 6+ lances on field\n→ Battle Skill (recall all lances for 6x hit damage)\n→ Continue basic attacks to re-deploy lances\n→ Ultimate when ready (lance storm + AoE Electrification)\n→ Perlica follows up → Combo Skill triggers again\n→ Battle Skill recall after Ultimate lances settle\n→ Repeat from basic attacks\n\nKEY: Avywenna CANNOT function without Perlica. Her Combo Skill requires external Electric Infliction. Always bring Perlica. Lance count before Battle Skill determines damage.',
    comparisonNotes: 'vs Laevatain: Different elements but similar hypercarry role. Laevatain is more self-sufficient with Melting Flame self-healing and stack management. Avywenna has higher peak damage but is entirely dependent on Perlica. Laevatain wins in flexibility; Avywenna wins in Electric-specific ceiling.\n\nvs Da Pan: Both are Assault operators but serve different roles entirely. Da Pan is Physical with straightforward burst. Avywenna is Electric with complex lance mechanics. Avywenna has much higher team DPS ceiling but requires dedicated team composition.',
  },

  'chen-qianyu': {
    slug: 'chen-qianyu',
    ratings: { overall: 'A', pve: 'A', boss: 'A', support: 'C' },
    pros: [
      'Exceptional Agility stat - highest among all Guards',
      'Precise sword counter abilities reward skillful play',
      'Strong Physical vulnerability application',
      'Fast attack speed enables rapid combo building',
      'High skill ceiling with rewarding counter mechanic',
    ],
    cons: [
      'Counter-focused playstyle requires practice and timing',
      'Low Intellect and Will make her fragile to arts damage',
      'Physical element limits elemental reaction potential',
      'Dependent on Physical team composition for maximum value',
    ],
    review: 'Chen Qianyu is a skill-expression Physical Guard with the highest Agility in her class. Her counter-focused kit rewards players who master the timing of her abilities, providing significant Physical vulnerability application and rapid combo generation. In Physical teams alongside Pogranichnik and Endministrator, she forms a devastating trio of Physical damage amplification. Her low Intellect and Will make her vulnerable to elemental damage, so positioning and dodge timing are crucial. For skilled players willing to invest in mastering her counter mechanics, she offers some of the highest sustained Physical DPS among Guards.',
    bestWeapons: [
      { name: 'Rapid Ascent', rating: 5, notes: 'Best in slot - +42% Physical DMG for skills, +98% DMG vs Staggered enemies' },
      { name: 'Sundering Steel', rating: 4, notes: 'Best 5-star option with +34.7% Physical DMG' },
      { name: 'Fortmaker', rating: 3, notes: 'Alternative with defensive passive' },
      { name: 'Contingent Measure', rating: 2, notes: '4-star option with solid stats' },
    ],
    bestGearSets: ['Swordmancer', 'Bonekrusha'],
    skillPriority: 'Battle Skill > Combo Skill > Ultimate > Basic Attack',
    synergies: ['Pogranichnik', 'Endministrator', 'Lifeng', 'Ardelia'],
    teamComps: [
      { name: 'Physical Trio', members: ['Chen Qianyu', 'Pogranichnik', 'Endministrator', 'Ardelia'], notes: 'Triple Physical with maximum vulnerability stacking' },
    ],
    introduction: 'Chen Qianyu serves as the cornerstone support for Physical damage teams, functioning as both a vulnerability applicator and substantial sub-DPS. Her kit revolves around applying Lift effects that generate Vulnerability stacks for allies to consume, amplifying team damage dramatically. Free from the "Break the Siege" quest, she is simultaneously beginner-friendly and endgame-viable. Physical teams essentially require her presence, making investment virtually mandatory for players pursuing Physical damage strategies. She contributes both meaningful personal damage through her Ultimate and irreplaceable team utility.',
    gameplayTips: ['Cast Battle Skill at engagement start to initiate Lift effects and create Vulnerability stacks immediately', 'Space Battle Skill and Combo Skill activations rather than using consecutively to preserve Combat Talent ATK stacks', 'Deploy Ultimate specifically when enemies are Staggered for dramatically increased damage through the seven-sequence chain', 'Coordinate Vulnerability stack consumption timing with teammates to prevent premature waste', 'Complete basic attack chains against Staggered enemies for finisher bonus damage rather than canceling into skills'],
    gearNotes: 'Swordmancer (4-piece) provides Agility and Strength scaling with set bonuses triggering additional Physical damage and Stagger after applying status conditions. She continuously procs these bonuses through Lift and Vulnerability application. Bonekrusha is an alternative for Ultimate-focused burst builds. Roving MSGR serves as an accessible early-game option.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'Counter hit (Battle Skill)', value: '~350% ATK', conditions: 'Successfully timed counter during enemy attack window' },
      { scenario: 'Vulnerability application', value: '2-3 stacks per rotation', conditions: 'Through Lift effects and counter procs' },
      { scenario: 'Ultimate (7-sequence, Staggered)', value: '~680% ATK total', conditions: 'Against Staggered enemies with Rapid Ascent equipped' },
      { scenario: 'Sustained DPS (Physical Trio)', value: '~26,000/s', conditions: 'In team with Pogranichnik + Endministrator' },
    ],
    skillData: [
      { name: 'Swift Blade', type: 'Normal Attack', multiplier: '140-180% ATK', description: 'Fastest sword combo among Guards thanks to 172 Agility. Final Strike triggers ally Combo Skills. Generates Combat Talent ATK stacks on consecutive hits.', notes: 'Highest attack speed in class — maintain chains for ATK buff stacking' },
      { name: 'Counter Stance', type: 'Battle Skill', multiplier: '350% ATK (counter)', spCost: 18, description: 'Enters counter stance. If hit during stance, performs devastating counter applying Lift and generating Vulnerability stacks. Grants ATK buff on successful counter.', notes: 'Core mechanic — timing is everything. Practice against boss patterns' },
      { name: 'Vulnerability Chain', type: 'Combo Skill', multiplier: '280% ATK', description: 'Triggered by ally Final Strike. Performs rapid slash chain applying additional Vulnerability stacks. Damage increases based on existing Vulnerability count.', notes: 'Amplifies Vulnerability stacking — coordinate with Physical team rotation' },
      { name: 'Seven-Star Sequence', type: 'Ultimate', multiplier: '680% ATK (7 hits)', spCost: 100, description: 'Seven rapid sequential sword strikes. Deals dramatically increased damage against Staggered enemies. Each hit can trigger counter-related buffs.', notes: 'Use ONLY against Staggered enemies — damage difference is massive' },
    ],
    gearSetDetails: [
      { name: 'Swordmancer', pieces: 3, bonusDescription: '+20% Stagger Efficiency. After Physical Status, trigger additional Physical damage.', statBoosts: ['Stagger Efficiency +20%', 'Physical DMG proc 30% ATK', 'Agility +50 (2-piece)'], notes: 'Perfect match — Lift and Vulnerability continuously trigger set bonus' },
      { name: 'Bonekrusha', pieces: 3, bonusDescription: 'Battle Skill DMG +30% after Combo Skill. ATK +15% for 12s.', statBoosts: ['Battle Skill DMG +30%', 'ATK +15%'], notes: 'Alternative for maximizing counter damage output' },
    ],
    statPriorities: [
      { stat: 'Agility', priority: 'High', notes: 'Highest base at 172 — primary scaling, fastest Guard' },
      { stat: 'Physical DMG', priority: 'High', notes: 'Universal multiplier for all Physical abilities' },
      { stat: 'Crit Rate', priority: 'High', notes: 'Counter hits benefit enormously from crits' },
      { stat: 'Strength', priority: 'Medium', notes: 'Balanced at 107 — secondary scaling stat' },
    ],
    rotationGuide: 'START: Battle Skill (enter counter stance)\n→ Enemy attacks → successful counter (Lift + Vulnerability + ATK buff)\n→ Basic attack chain during cooldown (maintain ATK stacks)\n→ Ally Final Strike triggers Combo Skill (more Vulnerability)\n→ Battle Skill again on cooldown (another counter opportunity)\n→ Accumulate Vulnerability stacks on target\n→ When enemy Staggered → Ultimate (Seven-Star Sequence for massive burst)\n→ Repeat from Battle Skill\n\nKEY: Counter timing is the skill expression. Practice boss attack patterns. Never use Ultimate on non-Staggered enemies — the damage difference is enormous.',
    comparisonNotes: 'vs Endministrator: Both are Physical Guards but with different identities. Endministrator has Crystal mechanics for sustained DPS and better base stats. Chen Qianyu has counter mechanics with higher skill ceiling and burst potential. Both work together in Physical teams — no need to choose.\n\nvs Lifeng: Lifeng is the safer, more reliable option with straightforward Susceptibility application. Chen Qianyu has higher peak damage through counter mechanics but requires precise timing. For consistent team amplification, Lifeng wins. For skilled players seeking maximum output, Chen Qianyu excels.',
  },

  'da-pan': {
    slug: 'da-pan',
    ratings: { overall: 'B', pve: 'B', boss: 'B', support: 'C' },
    pros: [
      'Highest Strength stat among 5-stars at 175',
      'Heavy greatsword hits deal massive per-hit damage',
      'Physical Assault with straightforward damage-focused kit',
      'Good stagger contribution on hits',
    ],
    cons: [
      'Slow greatsword attack speed limits DPS output',
      'Lacks utility or support capabilities',
      'Outperformed by 6-star Assault operators significantly',
      'Physical element provides no reaction multipliers',
    ],
    review: 'Da Pan is a straightforward Physical Assault operator built around raw Strength. His greatsword hits land hard with significant stagger, but the weapon type\'s slower attack speed limits his overall DPS compared to faster alternatives. He functions adequately as a Physical team\'s secondary damage dealer but lacks the utility or unique mechanics to stand out. For players lacking 6-star Assault operators, Da Pan fills the role competently, though he should be replaced when better options become available.',
    bestWeapons: [
      { name: 'Exemplar', rating: 5, notes: 'Best in slot - Physical damage boost after Battle Skill, high uptime with rotation' },
      { name: 'Sundered Prince', rating: 4, notes: 'F2P friendly with Crit Rate, ATK buffs and Stagger enhancement' },
      { name: 'Ancient Canal', rating: 3, notes: 'Signature weapon - Brutality and Strength scaling, reliable through progression' },
    ],
    bestGearSets: ['Æthertech', 'Aburrey\'s Legacy'],
    skillPriority: 'Combo Skill > Battle Skill = Ultimate > Basic Attack',
    synergies: ['Pogranichnik', 'Endministrator', 'Chen Qianyu'],
    teamComps: [
      { name: 'Physical Assault', members: ['Da Pan', 'Pogranichnik', 'Lifeng', 'Ardelia'], notes: 'Physical team with Da Pan as primary DPS' },
    ],
    introduction: 'Da Pan functions as a Physical DPS Striker specializing in Vulnerability stack consumption through burst windows. His core gameplay revolves around building exactly 4 Vulnerability stacks, then detonating them via Combo Skill for massive damage amplified by his Crush effect. His Ultimate hits multiple enemies while generating Prep Ingredients stacks that reduce Combo Skill cooldown. While solid in multi-target scenarios, he faces competition from Endministrator in single-target fights. Community consensus places him as a strong but non-essential addition to Physical teams.',
    gameplayTips: ['Monitor Vulnerability stack accumulation carefully - reach exactly 4 stacks before activating Combo Skill for maximum burst', 'Start engagements with Battle Skill to apply Lift and generate initial Vulnerability stacks', 'Deploy Ultimate specifically against multiple enemies for Prep Ingredients that reduce Combo Skill cooldown', 'Coordinate with teammates to ensure Crush debuff window is exploited by the entire team', 'Use Salty or Mild talent by chaining Ultimate into Combo Skill for explosive burst rotations'],
    gearNotes: 'Æthertech (4-piece) provides ATK increases and Physical damage amplification against Vulnerable enemies, activating constantly during optimal gameplay. Pair with Swordmancer TAC Gauntlets off-piece for Physical output. Aburrey\'s Legacy grants Skill DMG +24% for early game, providing consistent performance before farming endgame sets.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'Combo Skill burst (4 stacks)', value: '~450% ATK + Crush bonus', conditions: 'With exactly 4 Vulnerability stacks consumed' },
      { scenario: 'Ultimate (multi-target)', value: '~380% ATK AoE', conditions: 'Against 3+ enemies for Prep Ingredients generation' },
      { scenario: 'Sustained DPS', value: '~20,000/s', conditions: 'In Physical Assault team with Pogranichnik support' },
      { scenario: 'Crush debuff amplification', value: '+18% Physical DMG taken', conditions: 'Applied via Combo Skill consumption on Vulnerable targets' },
    ],
    skillData: [
      { name: 'Heavy Slam', type: 'Normal Attack', multiplier: '150-200% ATK', description: 'Slow but devastating greatsword swings. Each hit deals massive per-hit damage with high stagger. Low attack speed offset by raw Strength 175.', notes: 'High damage per hit compensates for slow speed — every swing counts' },
      { name: 'Crushing Lift', type: 'Battle Skill', multiplier: '320% ATK', spCost: 22, description: 'Greatsword slam applying Lift and generating Vulnerability stacks. Stagger value increased by 50% during this ability.', notes: 'Opener ability — establishes Vulnerability for Combo Skill consumption' },
      { name: 'Stack Detonate', type: 'Combo Skill', multiplier: '450% ATK + stacks', description: 'Triggered by ally Final Strike. Consumes all Vulnerability stacks on target for massive burst damage. Applies Crush debuff increasing Physical DMG taken.', notes: 'Wait for 4 stacks before triggering — damage scales with count' },
      { name: 'Earthshatter', type: 'Ultimate', multiplier: '380% ATK (AoE)', spCost: 100, description: 'Massive greatsword cleave hitting all enemies in wide arc. Generates Prep Ingredients stacks reducing Combo Skill cooldown. High stagger on all targets.', notes: 'Use on groups for Prep Ingredients — enables faster Combo Skill cycling' },
    ],
    gearSetDetails: [
      { name: 'Æthertech', pieces: 3, bonusDescription: 'ATK +18%. Physical DMG +25% against Vulnerable enemies.', statBoosts: ['ATK +18%', 'Physical DMG +25% vs Vulnerable'], notes: 'Best set — Vulnerability application is core to his kit' },
      { name: "Aburrey's Legacy", pieces: 3, bonusDescription: 'Skill DMG +24%. Strength +30.', statBoosts: ['Skill DMG +24%', 'Strength +30'], notes: 'Early game universal option before Æthertech farming' },
    ],
    statPriorities: [
      { stat: 'Strength', priority: 'High', notes: 'Highest at 175 — primary damage scaling stat' },
      { stat: 'Physical DMG', priority: 'High', notes: 'Direct multiplier for all greatsword abilities' },
      { stat: 'Crit Rate', priority: 'Medium', notes: 'High per-hit damage benefits greatly from crits' },
      { stat: 'Crit DMG', priority: 'Medium', notes: 'Amplifies already-large individual hits' },
    ],
    rotationGuide: 'START: Battle Skill (Crushing Lift — applies Lift + Vulnerability stacks)\n→ Basic attacks to build more Vulnerability stacks (slow but strong hits)\n→ Teammates contribute Vulnerability through their abilities\n→ Reach 4 Vulnerability stacks on target\n→ Ally Final Strike triggers Combo Skill (consumes 4 stacks for massive burst + Crush debuff)\n→ Team exploits Crush window (+18% Physical DMG taken)\n→ Ultimate against groups (AoE + Prep Ingredients for faster Combo Skill)\n→ Repeat from Battle Skill\n\nKEY: Stack management is everything. Never trigger Combo Skill below 4 Vulnerability stacks. Coordinate with team to reach threshold before consuming.',
    comparisonNotes: 'vs Endministrator: Endministrator is strictly better as a Physical DPS with Crystal mechanics, better stats, and free acquisition. Da Pan serves as a secondary Physical DPS or replacement if you lack investment in Endministrator. In endgame Physical teams, both can coexist.\n\nvs Last Rite: Different elements entirely (Physical vs Cryo). Last Rite has much higher burst ceiling with Cryo stack mechanics. Da Pan is simpler but lower ceiling. Last Rite is the better investment for DPS-focused players.',
  },

  'perlica': {
    slug: 'perlica',
    ratings: { overall: 'A', pve: 'A', boss: 'A', support: 'B' },
    pros: [
      'Highest Intellect among 5-stars enables strong Arts damage',
      'Electric Caster with sustained elemental damage output',
      'Arts Unit provides safe ranged attacks',
      'Strong team complement in Electric compositions',
      'Good SP generation through Arts-based attacks',
    ],
    cons: [
      'Requires Electric team support to maximize potential',
      'Lower durability with relatively low Strength and Agility',
      'Caster role means lower personal survivability',
      'Electric teams have limited meta presence currently',
    ],
    review: 'Perlica is the Electric Caster backbone of Electric team compositions. Her high Intellect stat provides strong Arts damage scaling, and her Arts Unit weapon allows safe ranged engagement. She works best as a team complement alongside Avywenna for DPS and Antal for support, forming the core Electric trio. While not a standalone powerhouse, her sustained Electric damage and SP generation make her invaluable within her niche. Community consensus rates her as the best Caster option for Electric-focused content.',
    bestWeapons: [
      { name: 'Detonation Unit', rating: 5, notes: 'Best in slot - +25.2% Arts DMG Taken on enemies after Arts Burst' },
      { name: 'Wild Wanderer', rating: 4, notes: 'Strong for +22.4% Physical/Electric DMG team buff' },
      { name: 'Stanza of Memorials', rating: 3, notes: 'Good for non-Electric team comps' },
      { name: 'Hypernova Auto', rating: 2, notes: '4-star budget option' },
    ],
    bestGearSets: ['Pulser Labs', 'Mordvolt Insulation'],
    skillPriority: 'Battle Skill > Combo Skill > Ultimate > Basic Attack',
    synergies: ['Avywenna', 'Antal', 'Arclight', 'Gilberta'],
    teamComps: [
      { name: 'Electric Core', members: ['Perlica', 'Avywenna', 'Antal', 'Gilberta'], notes: 'Premier Electric team with Gilberta amplification' },
    ],
    introduction: 'Perlica is the indispensable Electric Infliction enabler and backbone of all Electric team compositions. Her Battle Skill establishes Electric Infliction on priority targets, and her Combo Skill applies Electrification for additional debuff damage. She functions as a hybrid support/sub-DPS, providing consistent Electric application that enables operators like Avywenna to function. Without Perlica, Electric teams simply cannot operate effectively. Her A-tier placement reflects excellence within her niche while acknowledging limited utility outside specialized Electric compositions.',
    gameplayTips: ['Always use Battle Skill as your rotation opener to establish Electric Infliction before teammates execute damage rotations', 'Trigger Combo Skill immediately after Final Strike to apply Electrification during natural attack chains', 'Time Ultimate during established Vulnerability windows rather than on cooldown for peak burst', 'Position carefully to maintain high HP when using Mordvolt Insulation set for the damage bonus threshold', 'Coordinate with Avywenna to ensure damage rotations occur during Electrification uptime'],
    gearNotes: 'Pulser Labs provides consistent Electric damage amplification for sustained encounters. Mordvolt Insulation grants Intellect +50 and Arts DMG +20% when above 80% HP, offering early game performance. Position to avoid damage when using Mordvolt set to maintain the HP threshold. Prioritize Intellect and Arts Intensity substats.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'Electric Infliction rate', value: '~3 applications/rotation', conditions: 'Through Battle Skill, basic attacks, and Combo Skill combined' },
      { scenario: 'Arts DMG Taken debuff', value: '-25.2% Arts RES', conditions: 'Via Detonation Unit after Arts Burst triggers' },
      { scenario: 'Personal DPS', value: '~16,000/s', conditions: 'In Electric Core team with Intellect-focused build' },
      { scenario: 'Electrification proc damage', value: '~150% ATK per proc', conditions: 'Combo Skill Electrification on inflicted targets' },
    ],
    skillData: [
      { name: 'Arts Bolt', type: 'Normal Attack', multiplier: '100-130% ATK', description: 'Ranged Arts Unit projectiles dealing Electric damage. Safe engagement from distance. Applies minor Electric Infliction on hit.', notes: 'Maintain distance for safety — low personal damage but consistent Infliction' },
      { name: 'Electric Field', type: 'Battle Skill', multiplier: '240% ATK', spCost: 20, description: 'Creates Electric field applying sustained Electric Infliction to all enemies within. Enables Avywenna Combo Skill triggers. Boosts team Electric DMG within zone.', notes: 'Essential enabler — without this, Avywenna cannot trigger Combo Skill' },
      { name: 'Electrification Pulse', type: 'Combo Skill', multiplier: '200% ATK', description: 'Triggered by ally Final Strike. Applies Electrification to all Electric-Inflicted enemies in range. Electrification deals damage over time and enables Electric Burst reactions.', notes: 'Converts Infliction into Electrification — timing with ally attacks is key' },
      { name: 'Overcharge Burst', type: 'Ultimate', multiplier: '520% ATK (AoE)', spCost: 100, description: 'Massive Electric Arts burst hitting all enemies. Triggers Arts Burst reaction and Detonation Unit debuff. Applies heavy Electrification to all targets.', notes: 'Burst window — use with Detonation Unit for team-wide Arts RES debuff' },
    ],
    gearSetDetails: [
      { name: 'Pulser Labs', pieces: 3, bonusDescription: 'Electric DMG +22%. After applying Electric Infliction, gain +15% Arts Intensity for 10s.', statBoosts: ['Electric DMG +22%', 'Arts Intensity +15%', '10s on Infliction'], notes: 'Core Electric set — constant uptime through frequent Infliction application' },
      { name: 'Mordvolt Insulation', pieces: 3, bonusDescription: 'Intellect +50. Arts DMG +20% when above 80% HP.', statBoosts: ['Intellect +50', 'Arts DMG +20%'], notes: 'High damage but requires safe positioning to maintain HP threshold' },
    ],
    statPriorities: [
      { stat: 'Intellect', priority: 'High', notes: 'Highest base at 162 — primary Arts and Infliction scaling' },
      { stat: 'Will', priority: 'Medium', notes: 'Balanced at 114 — provides durability' },
      { stat: 'Arts Intensity', priority: 'High', notes: 'Amplifies Electric damage and Infliction potency' },
      { stat: 'Electric DMG', priority: 'High', notes: 'Universal multiplier for all abilities' },
    ],
    rotationGuide: 'START: Battle Skill (Electric Field — establishes Infliction on enemies)\n→ Avywenna deploys Thunderlances in field\n→ Basic attacks for additional Infliction maintenance\n→ Ally Final Strike triggers Combo Skill (Electrification application)\n→ Continue ranged attacks from safe distance\n→ Battle Skill on cooldown (maintain Electric Field uptime)\n→ Ultimate during team burst window (massive Electric burst + Arts RES debuff)\n→ Repeat from Battle Skill\n\nKEY: Perlica exists to enable Avywenna. Your Electric Infliction triggers Avywenna\'s Combo Skill. Without consistent Infliction uptime, the entire Electric team collapses. Prioritize Infliction over personal damage.',
    comparisonNotes: 'vs Antal: Both support Electric teams but fill different roles. Perlica provides Electric Infliction enabling (mandatory for Avywenna), while Antal provides team buffs and SP acceleration. Both are essential for optimal Electric teams — they complement rather than compete.\n\nvs Ardelia: Perlica is element-specific while Ardelia is universal. In Electric teams, Perlica is irreplaceable due to Infliction enabling. Outside Electric teams, Ardelia is always the better support choice. They serve fundamentally different purposes.',
  },

  'snowshine': {
    slug: 'snowshine',
    ratings: { overall: 'B', pve: 'B', boss: 'B', support: 'A' },
    pros: [
      'High Strength for a Defender at 155',
      'Creates frozen terrain that controls enemy movement',
      'Greatsword provides good stagger value',
      'Solid shielding and defensive utility for Cryo teams',
    ],
    cons: [
      'Limited meta relevance outside Cryo compositions',
      'Damage output secondary to defensive role',
      'Frozen terrain requires specific positioning to maximize',
      'Outperformed by 6-star Defenders in raw tank power',
    ],
    review: 'Snowshine is a Cryo Defender who provides unique utility through frozen terrain creation and solid shielding. Her high Strength gives her decent damage for a defensive operator, and her greatsword stagger helps with crowd control. She serves as the primary tank option for Cryo teams alongside Last Rite and Xaihi. While not a meta-defining operator, she fills her role competently and becomes more valuable in Cryo-specific content where her terrain control shines.',
    bestWeapons: [
      { name: 'Finishing Call', rating: 5, notes: 'Best in slot (free via pre-registration) - +56% Combo Skill HP treatment effect' },
      { name: 'Former Finery', rating: 4, notes: 'Premium healing option' },
      { name: 'Thunderberge', rating: 3, notes: 'For shield-focused builds' },
      { name: 'Quencher', rating: 2, notes: '4-star budget option' },
    ],
    bestGearSets: ['LYNX', 'Mordvolt Resistant'],
    skillPriority: 'Combo Skill > Battle Skill > Ultimate > Basic Attack',
    synergies: ['Last Rite', 'Yvonne', 'Xaihi', 'Estella'],
    teamComps: [
      { name: 'Cryo Defense', members: ['Snowshine', 'Last Rite', 'Xaihi', 'Ardelia'], notes: 'Cryo team with Snowshine tanking and creating frozen zones' },
    ],
    introduction: 'Snowshine operates as a sustain-oriented Cryo Defender specializing in defensive support rather than traditional tanking. She brings a unique combination of healing, crowd control, and Cryo application to Shatter-focused team compositions. Her Combo Skill provides instant and continuous healing to nearby allies when the controlled operator drops below 60% HP, while her Ultimate delivers forced Solidification for enabling Shatter combos. Her niche lies in compositions that want both survivability and Cryo reactions without dedicating separate slots.',
    gameplayTips: ['Activate Battle Skill preemptively before damage spikes to establish shields on allies before significant damage', 'Position allies near each other to maximize shield and healing coverage from area-based abilities', 'Time Ultimate to force Solidification windows when team burst damage abilities are available', 'Monitor ally HP to trigger Combo Skill healing at optimal moments rather than panic situations', 'Use Snow Zones strategically to control enemy positioning while enabling Solidification setups'],
    gearNotes: 'LYNX set is optimal providing +20% Treatment Efficiency baseline with 15% damage reduction for allies for 10 seconds. This transforms Snowshine into an exceptional defensive support stacking multiplicative damage reduction with shields and healing. Generic defensive sets work for early/mid game before accessing LYNX gear. Prioritize HP, DEF, and Treatment Efficiency.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'Shield strength', value: '~10,000 shield', conditions: 'Based on Strength scaling with LYNX set bonus' },
      { scenario: 'Combo Skill healing', value: '~5,500 HP/tick', conditions: 'Triggers when controlled operator drops below 60% HP' },
      { scenario: 'Solidification application', value: '~2 forced procs', conditions: 'Ultimate forces Solidification on all enemies in range' },
      { scenario: 'Snow Zone slow', value: '-40% movement speed', conditions: 'Enemies within frozen terrain areas' },
    ],
    skillData: [
      { name: 'Frost Cleave', type: 'Normal Attack', multiplier: '130-170% ATK', description: 'Greatsword swings creating Snow Zones on impact. Enemies in Snow Zones are slowed and take Cryo Infliction. High stagger value per hit.', notes: 'Creates terrain with every attack — position to maximize zone coverage' },
      { name: 'Glacial Shield', type: 'Battle Skill', multiplier: 'Shield: 22% Max HP', spCost: 22, description: 'Creates Cryo shields on all nearby allies absorbing damage. Generates Snow Zone in area. Applies Cryo Infliction to nearby enemies.', notes: 'Proactive use — shield before damage arrives, not after' },
      { name: 'Emergency Restoration', type: 'Combo Skill', multiplier: 'Heal: 200% Will', description: 'Triggers automatically when controlled operator drops below 60% HP. Provides instant burst heal plus continuous healing for 8s. Creates large Snow Zone.', notes: 'Automatic trigger — positioning near allies ensures healing coverage' },
      { name: 'Permafrost Domain', type: 'Ultimate', multiplier: '400% ATK + Solidification', spCost: 100, description: 'Creates massive frozen terrain. Forces Solidification on all enemies within range. Allies gain damage reduction and Cryo DMG buff for 12s.', notes: 'Enables Shatter combos — coordinate with DPS burst windows' },
    ],
    gearSetDetails: [
      { name: 'LYNX', pieces: 3, bonusDescription: '+20% Treatment Efficiency. After healing, allies gain 15% damage reduction for 10s.', statBoosts: ['Treatment Efficiency +20%', 'Ally DMG Reduction 15%', '10s duration'], notes: 'Best set — stacks damage reduction with shields for maximum survivability' },
      { name: 'Mordvolt Resistant', pieces: 3, bonusDescription: 'Will +50. Treatment Efficiency +15%.', statBoosts: ['Will +50', 'Treatment Efficiency +15%'], notes: 'Early/mid game option before LYNX farming' },
    ],
    statPriorities: [
      { stat: 'Strength', priority: 'High', notes: 'Highest at 155 — HP and shield scaling' },
      { stat: 'Will', priority: 'High', notes: 'Healing effectiveness scaling' },
      { stat: 'HP%', priority: 'High', notes: 'Shield strength and overall tankiness' },
      { stat: 'Treatment Efficiency', priority: 'Medium', notes: 'Amplifies Combo Skill healing' },
      { stat: 'DEF%', priority: 'Medium', notes: 'Reduces incoming damage while tanking' },
    ],
    rotationGuide: 'START: Battle Skill (shields team + Snow Zone + Cryo Infliction)\n→ Tank enemy attacks with greatsword (build aggro)\n→ Basic attacks create Snow Zones for terrain control\n→ Combo Skill triggers automatically at 60% HP (emergency heal)\n→ Continue tanking and maintaining Snow Zone coverage\n→ Battle Skill on cooldown (refresh shields)\n→ Ultimate when team is ready for burst (Solidification + Cryo buff)\n→ DPS exploits Solidification window for Shatter damage\n→ Repeat from Battle Skill\n\nKEY: Snow Zones are your unique utility. Position greatsword swings to create terrain that funnels enemies into your team\'s damage zones.',
    comparisonNotes: 'vs Ember: Both are Defenders but serve different elements. Snowshine specializes in Cryo terrain control and Solidification enabling; Ember provides Vulnerable debuffs and generic team shielding. Snowshine is better in dedicated Cryo teams; Ember is more versatile for any composition.\n\nvs Catcher: Catcher is a budget Physical tank with pure mitigation. Snowshine provides Cryo utility, terrain control, and healing on top of tanking. For Cryo teams, Snowshine is strictly better. For pure Physical tanking, Catcher may suffice.',
  },

  'wulfgard': {
    slug: 'wulfgard',
    ratings: { overall: 'A', pve: 'A', boss: 'A', support: 'B' },
    pros: [
      'Highest Strength stat among Casters at 162',
      'Handcannon provides safe ranged engagement',
      'Heat element enables Combustion damage over time',
      'Good off-field damage contribution in Heat teams',
    ],
    cons: [
      'Caster role with high Strength creates awkward stat distribution',
      'Heat teams have better DPS options in Laevatain',
      'Low Agility and Intellect limit overall effectiveness',
      'Situational value - rarely the optimal team choice',
    ],
    review: 'Wulfgard is an unusual Heat Caster whose highest stat is Strength rather than Intellect, creating an unconventional damage profile. His handcannon provides safe ranged attacks with Heat damage application, making him useful for applying Combustion in Heat teams. However, with Laevatain dominating the Heat DPS role, Wulfgard struggles to justify his team slot. He works best as an off-field damage contributor when a second Heat element is needed, but should not be a priority investment.',
    bestWeapons: [
      { name: 'Clannibal', rating: 5, notes: 'Best in slot - Infliction priority ensures consistent Heat stack application for personal and team damage' },
      { name: 'Opus: The Living', rating: 3, notes: 'Arts Intensity scaling for Combustion and Heat ability multipliers' },
      { name: 'Rational Farewell', rating: 2, notes: 'Budget handcannon with balanced stat increases' },
    ],
    bestGearSets: ['Hot Work', 'Armored MSGR'],
    skillPriority: 'Battle Skill > Ultimate > Basic Attack > Combo Skill',
    synergies: ['Laevatain', 'Ember', 'Akekuri'],
    teamComps: [
      { name: 'Heat Support DPS', members: ['Wulfgard', 'Laevatain', 'Ember', 'Ardelia'], notes: 'Wulfgard provides off-field Heat damage' },
    ],
    introduction: 'Wulfgard functions as a hybrid damage dealer and enabler specializing in Heat reactions, particularly Combustion mechanics. He uniquely balances applying infliction stacks for teammates while consuming those same reactions for personal damage through enhanced Battle Skill versions. His signature mechanic involves triggering enhanced abilities by consuming active Combustion or Electrification. Wulfgard applies the most Heat Infliction stacks among all operators, making him invaluable as either a main DPS in F2P compositions or a reaction enabler supporting hypercarries like Laevatain.',
    gameplayTips: ['Prioritize applying Combustion through Combo Skill before using enhanced Battle Skill to ensure reactions are available', 'Activate Talent by applying Combustion then immediately consume with Battle Skill for Heat damage boost during damage window', 'Use Ultimate to force Combustion application when Battle Skill is available but no reactions exist on targets', 'In hypercarry compositions with Laevatain, resist consuming reactions and focus on applying Heat stacks', 'Position carefully when using Battle Skill to ensure both base and enhanced shots connect with priority targets'],
    gearNotes: 'Hot Work (full set) provides +30 Arts Intensity baseline with +50% Heat damage for 10 seconds after applying Combustion. This synergizes perfectly with his rotation as he applies Combustion regularly. The damage bonus window aligns with enhanced Battle Skill usage for devastating burst. Mixed Arts Intensity gear works for early game before accessing Hot Work.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'Enhanced Battle Skill (Combustion)', value: '~340% ATK + 50% Heat', conditions: 'With Hot Work set bonus active after Combustion application' },
      { scenario: 'Heat Infliction rate', value: '4-5 stacks/rotation', conditions: 'Highest Heat Infliction application among all operators' },
      { scenario: 'Combustion DoT damage', value: '~120% ATK/tick', conditions: 'Sustained damage over time from Combustion procs' },
      { scenario: 'Personal DPS (main DPS)', value: '~22,000/s', conditions: 'F2P main DPS build with Hot Work set' },
      { scenario: 'Enabler DPS (with Laevatain)', value: '~14,000/s', conditions: 'Focusing on Infliction application over personal damage' },
    ],
    skillData: [
      { name: 'Inferno Shot', type: 'Normal Attack', multiplier: '120-150% ATK', description: 'Ranged handcannon shots applying Heat Infliction on each hit. Safe engagement distance. Moderate per-hit damage with consistent Infliction.', notes: 'Consistent Heat application from range — maintain fire between skills' },
      { name: 'Blazing Volley', type: 'Battle Skill', multiplier: '340% ATK', spCost: 22, description: 'Fires enhanced handcannon volley. If Combustion exists on target, consumes it for +50% Heat damage and self-ATK buff. Without Combustion, applies heavy Heat Infliction instead.', notes: 'Decision point — consume Combustion for burst or preserve for Laevatain' },
      { name: 'Ignition Wave', type: 'Combo Skill', multiplier: '220% ATK', description: 'Triggered by ally Final Strike. Applies Combustion to all Heat-Inflicted enemies in range. Creates burn zones dealing sustained Heat damage.', notes: 'Primary Combustion applicator — enables both personal and team Heat reactions' },
      { name: 'Firestorm Barrage', type: 'Ultimate', multiplier: '500% ATK (AoE)', spCost: 100, description: 'Massive handcannon barrage covering wide area. Forces Combustion on all targets regardless of existing Infliction. Grants team Heat DMG buff for 10s.', notes: 'Guaranteed Combustion application — use when targets lack Heat stacks' },
    ],
    gearSetDetails: [
      { name: 'Hot Work', pieces: 3, bonusDescription: 'Arts Intensity +30. After applying Combustion, Heat DMG +50% for 10s.', statBoosts: ['Arts Intensity +30', 'Heat DMG +50%', '10s on Combustion'], notes: 'Core set — Combustion application is guaranteed, making +50% Heat near-permanent' },
      { name: 'Armored MSGR', pieces: 3, bonusDescription: 'Strength +50. Physical DMG +20% when hit.', statBoosts: ['Strength +50', 'Physical DMG +20%'], notes: 'Utilizes his unusually high Strength stat for hybrid Physical/Heat builds' },
    ],
    statPriorities: [
      { stat: 'Strength', priority: 'High', notes: 'Highest at 162 — unusual for Caster but his primary scaling' },
      { stat: 'Arts Intensity', priority: 'High', notes: 'Amplifies Heat damage and Combustion potency' },
      { stat: 'Heat DMG', priority: 'High', notes: 'Direct multiplier for primary damage type' },
      { stat: 'Will', priority: 'Medium', notes: 'Balanced at 112 — provides durability' },
    ],
    rotationGuide: 'START: Basic attacks to apply Heat Infliction on targets\n→ Ally Final Strike triggers Combo Skill (applies Combustion)\n→ IF main DPS: Battle Skill (consumes Combustion for +50% Heat burst)\n→ IF enabler for Laevatain: Skip Battle Skill consumption, let Laevatain exploit Combustion\n→ Continue basic attacks for Heat Infliction maintenance\n→ Combo Skill when ally triggers (reapply Combustion)\n→ Ultimate when targets lack Heat stacks (forced Combustion + team Heat buff)\n→ Repeat from basic attacks\n\nKEY: Role depends on team composition. As main DPS, consume Combustion aggressively. As Laevatain enabler, preserve Combustion stacks for her to exploit.',
    comparisonNotes: 'vs Laevatain: Not a direct competitor — Wulfgard enables Laevatain through Heat Infliction application. Laevatain is the superior DPS but benefits enormously from Wulfgard\'s consistent Combustion application. In mono-Heat teams, both serve different roles.\n\nvs Perlica: Both are 5★ Casters enabling their element\'s DPS. Perlica enables Avywenna (Electric); Wulfgard enables Laevatain (Heat). Similar roles in different elemental archetypes. Wulfgard has higher personal damage due to Strength stat advantage.',
  },

  'xaihi': {
    slug: 'xaihi',
    ratings: { overall: 'S', pve: 'S', boss: 'S', support: 'S' },
    pros: [
      'Versatile healer with strong Cryo affliction application',
      'High Will stat provides excellent durability',
      'Arts Unit weapon enables safe ranged healing',
      'Enables Cryo damage amplification through status application',
      'Core support for Cryo team compositions',
    ],
    cons: [
      'Healing output lower than Ardelia\'s peak',
      'Effectiveness drops outside Cryo teams',
      'Low Strength and Agility limit personal damage contribution',
      'Competes with Ardelia for healer slot in non-Cryo teams',
    ],
    review: 'Xaihi is the premier Cryo support operator, providing sustained healing while constantly applying Cryo affliction to enemies. Her high Will stat makes her surprisingly durable, and her Arts Unit enables safe ranged healing that doesn\'t require risky positioning. She is essential for Cryo team compositions, enabling damage amplification through consistent Cryo status application. While Ardelia outperforms her in raw healing and universal support, within Cryo teams Xaihi\'s element-specific utility makes her the superior choice. She is a must-build for anyone running Last Rite or Yvonne.',
    bestWeapons: [
      { name: 'Chivalric Virtues', rating: 5, notes: 'Best in slot - Team-wide ATK buff when healing allies, synergizes with Battle Skill healing' },
      { name: 'Detonation Unit', rating: 4, notes: 'Vulnerability debuffs on enemies, multiplicative scaling with amplifications' },
      { name: 'Monaihe', rating: 3, notes: 'Improves Ultimate uptime for more frequent Cryo/Nature amplification' },
      { name: 'Freedom to Proselytize', rating: 3, notes: 'Focused healing enhancement for maximum Treatment Efficiency' },
    ],
    bestGearSets: ['Eternal Xiranite', 'Mordvolt Resistant'],
    skillPriority: 'Ultimate > Battle Skill > Combo Skill > Basic Attack',
    synergies: ['Last Rite', 'Yvonne', 'Snowshine', 'Alesh'],
    teamComps: [
      { name: 'Cryo Healer Core', members: ['Xaihi', 'Last Rite', 'Yvonne', 'Snowshine'], notes: 'Full Cryo team with Xaihi as dedicated healer' },
    ],
    introduction: 'Xaihi stands as a premier support operator who simultaneously functions as buffer, debuffer, and healer, making her invaluable in Cryo and Nature-focused teams. Her kit provides amplification effects boosting Arts, Cryo, and Nature damage while maintaining team health through healing mechanics. Unlike specialized supports, Xaihi delivers comprehensive support capabilities that reduce the need for multiple dedicated support slots. Her S-tier status within Cryo/Nature compositions reflects her irreplaceable value, where she enables damage ceilings unattainable with alternative supports.',
    gameplayTips: ['Play Xaihi as a teammate rather than controlled operator to maximize support capabilities', 'Use Battle Skill to heal allies to full HP before damage phases to convert subsequent healing into Arts amplification', 'Activate Ultimate before team burst windows to ensure all teammates benefit from 12-second Cryo and Nature amplifications', 'Time Combo Skill to apply Cryo Infliction on priority targets before teammates execute elemental reactions', 'Leverage Execute Process talent by ensuring targets have Cryo or Solidification before allies execute burst damage'],
    gearNotes: 'Eternal Xiranite is optimal providing 16% damage boost to all teammates after applying amplification buffs. Individual pieces grant Will, Intellect, Ultimate Gain Efficiency, and Arts Intensity. Mordvolt Resistant is the early/mid game alternative emphasizing Will and Treatment Efficiency. Prioritize Will Boost, HP Boost, and healing-related substats.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'Healing per Battle Skill', value: '~7,200 HP', conditions: 'Will-focused build with Chivalric Virtues' },
      { scenario: 'Cryo/Nature amplification', value: '+18% Cryo DMG, +15% Nature DMG', conditions: 'Ultimate buff active for 12s' },
      { scenario: 'Arts amplification (overheal)', value: '+12% Arts DMG', conditions: 'When healing allies already at full HP' },
      { scenario: 'Team DPS increase (overall)', value: '+20-30% effective team DPS', conditions: 'Combined healing + amplification + debuff value in Cryo teams' },
    ],
    skillData: [
      { name: 'Frost Pulse', type: 'Normal Attack', multiplier: '90-120% ATK', description: 'Arts Unit ranged attacks applying minor Cryo Infliction. Low personal damage but consistent Cryo application from safe distance.', notes: 'Maintain Cryo uptime between skill cooldowns — stay at range' },
      { name: 'Restorative Frost', type: 'Battle Skill', multiplier: 'Heal: 280% Will', spCost: 20, description: 'Targeted heal on lowest-HP ally. If ally is at full HP, converts excess healing into Arts amplification buff. Applies Cryo Infliction to nearby enemies.', notes: 'Core heal — also provides Arts amplification through overheal mechanic' },
      { name: 'Cryo Affliction', type: 'Combo Skill', multiplier: '180% ATK', description: 'Triggered by ally Final Strike. Applies Cryo Infliction to priority target and nearby enemies. Triggers Execute Process talent for additional damage on Cryo-afflicted targets.', notes: 'Enables team elemental reactions — coordinate with DPS burst timing' },
      { name: 'Rime Blessing', type: 'Ultimate', multiplier: 'Heal: 350% Will + 12s buffs', spCost: 100, description: 'Team-wide healing burst followed by 12s of Cryo DMG +18% and Nature DMG +15% amplification for all allies. Applies Solidification to enemies in range.', notes: 'Biggest team buff window — use before coordinated burst damage' },
    ],
    gearSetDetails: [
      { name: 'Eternal Xiranite', pieces: 3, bonusDescription: 'After applying amplification buff, all teammates deal +16% damage for 12s.', statBoosts: ['Team DMG +16%', '12s duration', 'Refreshable'], notes: 'Best set — amplification buffs from Battle Skill and Ultimate constantly trigger this' },
      { name: 'Mordvolt Resistant', pieces: 3, bonusDescription: 'Will +50. Treatment Efficiency +15%.', statBoosts: ['Will +50', 'Treatment Efficiency +15%'], notes: 'Early/mid game option maximizing healing output' },
    ],
    statPriorities: [
      { stat: 'Will', priority: 'High', notes: 'Highest base at 150 — primary healing scaling' },
      { stat: 'Intellect', priority: 'High', notes: 'Cryo Infliction potency and Arts damage' },
      { stat: 'Treatment Efficiency', priority: 'High', notes: 'Direct healing multiplier' },
      { stat: 'Ultimate Gain Efficiency', priority: 'Medium', notes: 'More frequent Rime Blessing uptime' },
    ],
    rotationGuide: 'START: Battle Skill (heal lowest-HP ally + Cryo Infliction)\n→ If ally full HP: Arts amplification buff applied instead\n→ Basic attacks for Cryo Infliction maintenance\n→ Ally Final Strike triggers Combo Skill (Cryo application + Execute Process)\n→ DPS attacks Cryo-afflicted targets during Execute Process window\n→ Battle Skill on cooldown (maintain healing + overheal buffs)\n→ Ultimate before major team burst phase (12s Cryo + Nature amplification)\n→ Team burst during amplification window\n→ Repeat from Battle Skill\n\nKEY: Xaihi is best played as a teammate (AI-controlled). Her automatic healing and buff application is more consistent than manual control. Focus on timing Ultimate for burst windows.',
    comparisonNotes: 'vs Ardelia: The two premier supports in Endfield. Ardelia provides universal support (any team), higher raw healing, and Corrosion → Susceptibility conversion. Xaihi provides Cryo/Nature-specific amplification buffs and Execute Process damage amplification. In Cryo teams, Xaihi is superior. In mixed/non-Cryo teams, Ardelia wins. Some endgame teams run both for maximum support coverage.\n\nvs Gilberta: Different support archetypes. Gilberta provides CC and Defense reduction; Xaihi provides healing and damage amplification. They complement each other rather than compete. In Cryo teams, Xaihi is essential; Gilberta is a flexible addition.',
  },

  // ===== 4-STAR OPERATORS =====

  'akekuri': {
    slug: 'akekuri',
    ratings: { overall: 'A', pve: 'A', boss: 'B', support: 'A' },
    pros: [
      'Exceptional 4-star value - fits multiple team compositions',
      'Flexible Heat support with good Agility',
      'Sword Vanguard with fast attack speed',
      'Essential enabler for Laevatain\'s peak damage',
      'Easy to max out potentials as a 4-star',
    ],
    cons: [
      'Lower raw stats compared to 5/6-star operators',
      '4-star rarity limits stat ceiling with investment',
      'Support role means low personal damage',
      'Heat-specific utility narrows team options',
    ],
    review: 'Akekuri is one of the most remarkable 4-star operators in the game, providing exceptional support value that punches well above her rarity class. As a Heat Vanguard, she is an essential enabler for Laevatain\'s maximum damage output, making her a core member of the strongest team composition in the game. Her flexible support kit, fast sword attacks, and good Agility make her useful even outside Heat teams. Being a 4-star, she is easy to obtain and max out potentials, giving her excellent F2P value. She should be a priority investment for anyone running Heat teams.',
    bestWeapons: [
      { name: 'Contingent Measure', rating: 4, notes: 'Best 4-star sword for support builds' },
      { name: 'Wave Tide', rating: 3, notes: 'Alternative with decent passive' },
    ],
    bestGearSets: ['Æthertech', 'Hot Work'],
    skillPriority: 'Combo Skill > Battle Skill > Ultimate > Basic Attack',
    synergies: ['Laevatain', 'Ember', 'Antal', 'Wulfgard'],
    teamComps: [
      { name: 'Heat Enabler', members: ['Akekuri', 'Laevatain', 'Antal', 'Ardelia'], notes: 'Akekuri enables Laevatain\'s maximum DPS ceiling' },
    ],
    introduction: 'Akekuri is one of the most remarkable 4-star operators in the game, providing exceptional support value that punches far above her rarity. As a Heat Vanguard, she is an essential enabler for Laevatain\'s maximum damage output and a core member of the strongest team composition in the game. Her fast sword attacks and SP generation through stagger mechanics make her useful even outside Heat teams. Being a 4-star makes her extremely accessible, and her easy potential maxing gives excellent F2P value.',
    gameplayTips: ['Focus on generating SP through stagger mechanics to enable faster team rotations', 'Apply Heat Infliction consistently to enable Laevatain\'s Melting Flame stack consumption', 'Time Combo Skill triggers to coincide with Laevatain\'s damage windows for maximum team output', 'Position aggressively to maintain attack pressure while generating SP through combat', 'In non-Heat teams, focus on SP generation utility over Heat application'],
    gearNotes: 'Æthertech provides team-wide support benefits with ATK scaling. Hot Work is an alternative for Heat-focused builds emphasizing Combustion synergy. Both sets work well, with the choice depending on whether you prioritize team support (Æthertech) or personal Heat damage (Hot Work).',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'SP generation per rotation', value: '+18-22 SP (team)', conditions: 'Through stagger-based SP talent on fast sword attacks' },
      { scenario: 'Heat Infliction application', value: '~3 stacks/rotation', conditions: 'Fast sword attacks applying Heat consistently' },
      { scenario: 'Personal DPS', value: '~14,000/s', conditions: 'As Heat enabler in Laevatain team' },
      { scenario: 'Team DPS amplification', value: '+15-20% effective team DPS', conditions: 'Through SP acceleration and Heat Infliction enabling' },
    ],
    skillData: [
      { name: 'Flame Slash', type: 'Normal Attack', multiplier: '110-140% ATK', description: 'Fast 4-hit sword combo applying Heat Infliction. High Agility (141) provides fastest attack speed among Heat operators. Each hit generates SP through stagger.', notes: 'Speed is Akekuri\'s key asset — maintain attack chains for maximum SP' },
      { name: 'Blazing Rush', type: 'Battle Skill', multiplier: '280% ATK', spCost: 18, description: 'Dash strike applying heavy Heat Infliction and granting team SP generation buff for 8s. Fast cooldown enables frequent usage.', notes: 'Low SP cost and fast cooldown — use frequently for SP generation uptime' },
      { name: 'Ember Chain', type: 'Combo Skill', multiplier: '220% ATK', description: 'Triggered by ally Final Strike. Creates Heat chain connecting to nearby Heat-Inflicted enemies. Each chain link deals additional Heat damage and generates SP.', notes: 'More enemies = more chains = more SP. Group enemies for maximum value' },
      { name: 'Vanguard Blaze', type: 'Ultimate', multiplier: '420% ATK (AoE)', spCost: 100, description: 'AoE Heat burst applying Combustion to all enemies. Grants team +15% ATK buff for 10s. Generates massive SP burst for entire team.', notes: 'Team buff window — coordinate with Laevatain\'s burst rotation' },
    ],
    gearSetDetails: [
      { name: 'Æthertech', pieces: 3, bonusDescription: 'ATK +18%. Physical DMG +25% against Vulnerable.', statBoosts: ['ATK +18%', 'Physical DMG +25% vs Vulnerable'], notes: 'Team-wide ATK support synergizing with Vanguard ATK buff' },
      { name: 'Hot Work', pieces: 3, bonusDescription: 'Arts Intensity +30. Heat DMG +50% for 10s after Combustion.', statBoosts: ['Arts Intensity +30', 'Heat DMG +50%'], notes: 'Personal Heat damage focus for aggressive builds' },
    ],
    statPriorities: [
      { stat: 'Agility', priority: 'High', notes: 'Highest at 141 — attack speed for faster SP generation' },
      { stat: 'Strength', priority: 'Medium', notes: 'Balanced at 110 — decent personal damage' },
      { stat: 'Heat DMG', priority: 'Medium', notes: 'Amplifies Heat Infliction and abilities' },
      { stat: 'SP Recovery', priority: 'High', notes: 'Core function — accelerates team rotations' },
    ],
    rotationGuide: 'START: Battle Skill (Heat Infliction + team SP generation buff)\n→ Fast basic attack chain (SP generation through stagger + Heat Infliction)\n→ Ally Final Strike triggers Combo Skill (Heat chains + SP generation)\n→ Continue basic attacks during cooldowns\n→ Battle Skill on cooldown (maintain SP buff uptime)\n→ Laevatain consumes Heat stacks for Melting Flame\n→ Ultimate during team burst window (Combustion + ATK buff + SP burst)\n→ Repeat from Battle Skill\n\nKEY: Akekuri exists to fuel Laevatain. SP generation and Heat Infliction enable Laevatain\'s peak damage. As a 4-star with easy maxing, she provides exceptional value for investment.',
    comparisonNotes: 'vs Pogranichnik: Both are Vanguards with SP generation but serve different elements. Pogranichnik enables Physical teams; Akekuri enables Heat teams. Neither competes for the same slot. Akekuri is more accessible as a 4-star.\n\nvs Arclight: Both are Vanguards. Akekuri serves Heat teams; Arclight serves Electric teams. Similar SP generation roles in different elemental archetypes. Akekuri is generally considered higher value due to Laevatain\'s dominance in meta.',
  },

  'antal': {
    slug: 'antal',
    ratings: { overall: 'S', pve: 'S', boss: 'A', support: 'S' },
    pros: [
      'Outstanding 4-star support punching far above weight class',
      'Essential enabler for both Heat and Electric compositions',
      'Highest Intellect among 4-stars at 165',
      'Arts Unit provides safe ranged support',
      'One of the best support options regardless of rarity',
    ],
    cons: [
      'Low Will stat makes her fragile to sustained damage',
      '4-star stat ceiling limits scaling with investment',
      'Support role means minimal personal damage contribution',
      'Effectiveness tied to specific team elemental compositions',
    ],
    review: 'Antal is widely considered one of the best support operators in the game, regardless of rarity. As an Electric Supporter with Arts Unit, she provides crucial enabling capabilities for both Heat and Electric team compositions. Her Intellect of 165 is the highest among all 4-stars, and her support kit is so effective that she is a core member of the strongest team in the game (Laevatain/Akekuri/Antal/Ardelia). Being a 4-star makes her extremely accessible and easy to max potentials, which is a significant advantage. She should be every player\'s first 4-star investment.',
    bestWeapons: [
      { name: 'Hypernova Auto', rating: 4, notes: 'Best 4-star Arts Unit for support builds' },
      { name: 'Fluorescent Roc', rating: 3, notes: 'Alternative with decent passive' },
    ],
    bestGearSets: ['LYNX', 'Mordvolt Insulation'],
    skillPriority: 'Combo Skill > Battle Skill > Ultimate > Basic Attack',
    synergies: ['Laevatain', 'Avywenna', 'Perlica', 'Akekuri'],
    teamComps: [
      { name: 'Universal Support', members: ['Antal', 'Laevatain', 'Akekuri', 'Ardelia'], notes: 'The strongest team in the game - Antal enables Laevatain\'s peak damage' },
      { name: 'Electric Support', members: ['Antal', 'Avywenna', 'Perlica', 'Gilberta'], notes: 'Electric team with Antal as primary support' },
    ],
    introduction: 'Antal is widely considered one of the best support operators in the game regardless of rarity. Her specialized amplification provides unmatched value within Electric and Heat team compositions, applying Focus debuffs and team-wide elemental damage buffs through her Ultimate. She is a core member of the strongest team in the game alongside Laevatain, Akekuri, and Ardelia. Her Intellect of 165 is the highest among all 4-stars, and her support kit is so effective that she enables damage ceilings no other support can match in elemental compositions.',
    gameplayTips: ['Use lock-on functionality before Battle Skill to ensure Focus debuff lands on priority targets accurately', 'Cast Ultimate either at rotation start for sustained uptime or immediately before hypercarry executes peak damage', 'Trigger Combo Skill reactively when allies apply Arts Inflictions for incremental value', 'Focus entirely on enabling teammates rather than attempting personal damage rotations', 'In Heat teams, coordinate Ultimate timing with Laevatain\'s enhanced Battle Skill windows'],
    gearNotes: 'LYNX set provides healing enhancement and team damage reduction. Mordvolt Insulation grants Intellect +50 and Arts DMG +20% when above 80% HP for damage-focused support. The choice depends on whether your team needs additional survivability (LYNX) or Antal to contribute some personal damage (Mordvolt). Prioritize Intellect substats.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'Focus debuff amplification', value: '+20% DMG taken (target)', conditions: 'Applied via Battle Skill on locked-on target' },
      { scenario: 'Ultimate buff (Heat teams)', value: '+22% Heat DMG (team)', conditions: 'Ultimate active for 12s in Heat composition' },
      { scenario: 'Ultimate buff (Electric teams)', value: '+22% Electric DMG (team)', conditions: 'Ultimate active for 12s in Electric composition' },
      { scenario: 'Team DPS amplification', value: '+25-40% effective team DPS', conditions: 'Through Focus debuff + elemental DMG buff combined' },
    ],
    skillData: [
      { name: 'Arts Volley', type: 'Normal Attack', multiplier: '90-120% ATK', description: 'Ranged Arts Unit attacks with modest damage. Applies minor Arts Infliction. Safe engagement from distance with consistent output.', notes: 'Low personal damage — focus on buff/debuff timing over attack chains' },
      { name: 'Focus Lock', type: 'Battle Skill', multiplier: '200% ATK', spCost: 18, description: 'Applies Focus debuff on locked-on target, increasing damage taken by 20%. Also applies team-wide minor ATK buff for 6s. Fast cooldown for high uptime.', notes: 'Core debuff — lock onto boss before casting for guaranteed application' },
      { name: 'Resonance Pulse', type: 'Combo Skill', multiplier: '180% ATK', description: 'Triggered by ally applying Arts Infliction. Creates resonance field that amplifies next Arts reaction damage by 30%. Brief AoE Arts damage.', notes: 'Reactive amplification — coordinate with Perlica or elemental reactions' },
      { name: 'Amplification Field', type: 'Ultimate', multiplier: 'Team buff: +22% elemental DMG', spCost: 100, description: 'Creates field lasting 12s granting all allies +22% elemental DMG matching team\'s primary element. Also provides minor healing and Arts RES reduction on enemies.', notes: 'Biggest team buff — use before hypercarry burst window for maximum value' },
    ],
    gearSetDetails: [
      { name: 'LYNX', pieces: 3, bonusDescription: '+20% Treatment Efficiency. After healing, allies gain 15% damage reduction for 10s.', statBoosts: ['Treatment Efficiency +20%', 'Ally DMG Reduction 15%'], notes: 'Defensive support option for teams needing additional survivability' },
      { name: 'Mordvolt Insulation', pieces: 3, bonusDescription: 'Intellect +50. Arts DMG +20% when above 80% HP.', statBoosts: ['Intellect +50', 'Arts DMG +20%'], notes: 'Offensive support for maximizing personal damage contribution' },
    ],
    statPriorities: [
      { stat: 'Intellect', priority: 'High', notes: 'Highest among 4★ at 165 — scales all support effects' },
      { stat: 'Arts Intensity', priority: 'High', notes: 'Amplifies debuff and buff potency' },
      { stat: 'Ultimate Gain Efficiency', priority: 'High', notes: 'More frequent Amplification Field uptime' },
      { stat: 'Strength', priority: 'Low', notes: 'High base at 129 but not priority for support role' },
    ],
    rotationGuide: 'START: Lock-on priority target (boss)\n→ Battle Skill (Focus debuff — +20% DMG taken)\n→ Teammates attack Focus-debuffed target\n→ Ally applies Arts Infliction → Combo Skill triggers (Resonance amplification)\n→ Basic attacks during cooldowns for minor Infliction\n→ Battle Skill on cooldown (maintain Focus uptime)\n→ Ultimate before team burst window (12s elemental DMG buff)\n→ Hypercarry (Laevatain/Avywenna) executes burst during buff window\n→ Repeat from Battle Skill\n\nKEY: Antal is a force multiplier. Her value comes from making teammates deal 25-40% more damage through debuff + buff stacking. Personal damage is irrelevant — focus entirely on buff timing.',
    comparisonNotes: 'vs Gilberta: Both are top-tier supports but Antal specializes in Heat/Electric teams while Gilberta is universal. Antal provides stronger elemental amplification within her element; Gilberta provides broader CC and DEF reduction. In Heat Meta team (Laevatain), Antal is preferred. In mixed teams, Gilberta wins.\n\nvs Ardelia: Different support archetypes. Ardelia heals and applies Susceptibility debuffs. Antal amplifies damage through Focus debuff and elemental buffs. Many top teams run both for maximum support coverage. No direct competition.',
  },

  'catcher': {
    slug: 'catcher',
    ratings: { overall: 'C', pve: 'C', boss: 'C', support: 'C' },
    pros: [
      'High Strength stat tied with Ember at 176',
      'Greatsword provides good stagger for a Defender',
      'Physical Defender available early as 4-star',
    ],
    cons: [
      'Lowest-ranked Defender with minimal competitive value',
      'Outperformed by every other Defender option',
      'Lacks unique mechanics or utility',
      'No niche where he excels over alternatives',
    ],
    review: 'Catcher is the weakest Defender in the current roster, offering little beyond basic tanking capabilities. While his Strength stat matches Ember\'s at 176, he lacks any unique mechanics or utility that would justify his team slot over alternatives. He serves primarily as an early-game placeholder for players who haven\'t yet obtained better Defenders. Once Ember, Snowshine, or any 6-star Defender is available, Catcher should be replaced. Investment in Catcher is not recommended unless no other Defender options exist.',
    bestWeapons: [
      { name: 'Former Finery', rating: 4, notes: 'Best in slot - Heals Protected allies, HP and Will stats for defensive support' },
      { name: 'OBJ Heavy Burden', rating: 3, notes: 'Signature with DEF scaling that increases shield values' },
      { name: 'Seeker of Dark Lung', rating: 2, notes: 'For players wanting some offensive value from Catcher' },
    ],
    bestGearSets: ['Frontiers', 'Armored MSGR'],
    skillPriority: 'Combo Skill > Battle Skill > Ultimate > Basic Attack',
    synergies: ['Endministrator', 'Da Pan'],
    teamComps: [
      { name: 'Physical Budget', members: ['Catcher', 'Endministrator', 'Da Pan', 'Ardelia'], notes: 'Budget Physical team with Catcher as early-game tank' },
    ],
    introduction: 'Catcher serves as a defensive support specialist for Physical team compositions, providing damage mitigation through shields while applying Vulnerable and Weaken debuffs. Rated C-Tier overall, he struggles to find meaningful meta positioning due to superior alternatives in both tank and support categories. His Combo Skill shields only half the team with uncontrollable trigger conditions, and his sustain requires dropping below specific HP thresholds. Players should consider him primarily as a budget option for Physical teams lacking better alternatives, transitioning away once superior defenders become available.',
    gameplayTips: ['Activate Battle Skill immediately before taking damage to trigger counterattack mechanics and Vulnerable application', 'Position near vulnerable teammates during dangerous enemy mechanics to ensure Combo Skill shield coverage', 'Use Ultimate for Weaken application and Knockdown crowd control during dangerous enemy attacks', 'Focus on maintaining defensive uptime rather than attempting complex mechanical execution', 'Since Combo Skill only shields half the team, position near your most valuable operators'],
    gearNotes: 'Frontiers reduces Combo Skill cooldown by 15% and grants team 16% damage boost for 12 seconds after skill SP recovery. This transforms Catcher from pure defense into a hybrid support. Armored MSGR grants 50 Strength and 30% damage reduction when HP drops below 50% for early game defensive value.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'Shield strength', value: '~6,500 shield', conditions: 'Combo Skill shields on nearest 2 allies' },
      { scenario: 'Vulnerable application', value: '1-2 stacks/rotation', conditions: 'Through Battle Skill counterattack mechanic' },
      { scenario: 'Weaken debuff', value: '-15% ATK (enemies)', conditions: 'Ultimate applies Weaken to all hit enemies' },
      { scenario: 'Personal DPS', value: '~8,000/s', conditions: 'Minimal — focus is on defense' },
    ],
    skillData: [
      { name: 'Guardian Strike', type: 'Normal Attack', multiplier: '130-170% ATK', description: 'Greatsword swings with high stagger. Slow attack speed but high per-hit damage. Generates aggro and builds Protection stacks.', notes: 'Slow but powerful — each hit staggers and draws enemy attention' },
      { name: 'Counter Guard', type: 'Battle Skill', multiplier: '250% ATK (counter)', spCost: 20, description: 'Enters defensive stance. When hit, counterattacks applying Vulnerable and gaining Protection. Also grants brief damage reduction.', notes: 'Defensive counterattack — time with enemy attack patterns' },
      { name: 'Protective Shield', type: 'Combo Skill', multiplier: 'Shield: 18% Max HP', description: 'Triggered by taking significant damage. Creates shields on nearest 2 allies based on Catcher\'s HP. Uncontrollable trigger timing.', notes: 'Automatic — cannot control which allies receive shields' },
      { name: 'Fortress Slam', type: 'Ultimate', multiplier: '350% ATK (AoE)', spCost: 100, description: 'Heavy greatsword slam applying Weaken debuff (-15% ATK) and Knockdown to all enemies. Team gains damage reduction for 8s.', notes: 'Crowd control + damage reduction — use during dangerous enemy phases' },
    ],
    gearSetDetails: [
      { name: 'Frontiers', pieces: 3, bonusDescription: 'Skill cooldown -15%. After SP recovery, team deals +16% damage for 12s.', statBoosts: ['Cooldown -15%', 'Team DMG +16%', '12s on SP recovery'], notes: 'Transforms Catcher into hybrid support — team damage boost on SP events' },
      { name: 'Armored MSGR', pieces: 3, bonusDescription: 'Strength +50. DMG reduction +30% when below 50% HP.', statBoosts: ['Strength +50', 'DMG Reduction +30%'], notes: 'Pure defensive option for early game tanking' },
    ],
    statPriorities: [
      { stat: 'Strength', priority: 'High', notes: 'Highest at 176 — HP and shield scaling' },
      { stat: 'HP%', priority: 'High', notes: 'Shield strength based on Max HP' },
      { stat: 'DEF%', priority: 'High', notes: 'Core tank stat for damage mitigation' },
      { stat: 'Will', priority: 'Medium', notes: 'Balanced at 107 — minor healing contribution' },
    ],
    rotationGuide: 'START: Battle Skill (enter counter stance)\n→ Tank enemy attacks → counter triggers (Vulnerable + Protection)\n→ Basic attacks during cooldown (maintain aggro)\n→ Combo Skill triggers automatically when taking damage (shields 2 allies)\n→ Battle Skill on cooldown (maintain counter uptime)\n→ Ultimate during dangerous enemy mechanics (Weaken + Knockdown + team DR)\n→ Continue tanking while team deals damage\n→ Repeat from Battle Skill\n\nKEY: Catcher is a budget tank. He works for early game Physical teams but should be replaced by Ember or Snowshine when available. His uncontrollable Combo Skill is his biggest limitation.',
    comparisonNotes: 'vs Ember: Ember is strictly better as a defender. She provides Vulnerable debuffs, controllable team shields, healing, and generic Combo Skill triggers. Catcher\'s uncontrollable shield targeting and lower utility make him a clear downgrade. Replace Catcher with Ember as soon as possible.\n\nvs Snowshine: Snowshine provides Cryo terrain control, healing, and Solidification enabling on top of tanking. Catcher offers only basic Physical tanking. For any team needing a defender, Snowshine or Ember are preferred.',
  },

  'estella': {
    slug: 'estella',
    ratings: { overall: 'B', pve: 'B', boss: 'C', support: 'C' },
    pros: [
      'High Will stat at 152 gives good durability for a Guard',
      'Cryo element enables freeze reactions',
      'Polearm provides decent range for a Guard',
      'Can fill Cryo team Guard slot when needed',
    ],
    cons: [
      'Low Agility limits attack speed and combo generation',
      'Guard role in Cryo teams competes with better options',
      'No standout mechanics to differentiate from alternatives',
      '4-star stat limitations become apparent at high investment',
    ],
    review: 'Estella is a Cryo Guard with high Will that makes her durable despite her 4-star rarity. Her polearm provides decent range and her Cryo element enables freeze reactions in Cryo team compositions. However, she lacks standout mechanics and is generally outperformed by 5-star and above options. She serves as a capable early-game Cryo team filler and can contribute to Cryo teams when better Guards aren\'t available. Her high Will makes her surprisingly tanky, which can be useful in content where sustain matters.',
    bestWeapons: [
      { name: 'OBJ Razorhorn', rating: 5, notes: 'Signature best in slot - Scaling against Cryo Inflicted/Solidified enemies with Physical damage bonus' },
      { name: 'Valiant', rating: 4, notes: 'Strong alternative leveraging Physical Susceptibility for amplified damage' },
      { name: 'Aggeloslayer', rating: 3, notes: 'Budget 4-star with Will stat and post-Battle Skill ATK buff' },
    ],
    bestGearSets: ['Type 50 Yinglung', 'Eternal Xiranite'],
    skillPriority: 'Combo Skill > Ultimate > Battle Skill > Basic Attack',
    synergies: ['Last Rite', 'Xaihi', 'Snowshine'],
    teamComps: [
      { name: 'Cryo Budget', members: ['Estella', 'Last Rite', 'Xaihi', 'Ardelia'], notes: 'Budget Cryo team with Estella as Guard filler' },
    ],
    introduction: 'Estella operates as a Physical Support hybrid specializing in Shatter team compositions. Her primary function involves applying Physical Susceptibility to enemies affected by Solidification, enabling team-wide damage amplification through coordinated Arts Reactions. She possesses strong mechanical synergies with high Combo Skill multipliers, though Solidification teams are currently overshadowed by pure Physical compositions. Her accessible 4-star rarity makes investment more feasible, creating a niche as a budget Shatter enabler for players building around Cryo/Physical hybrid strategies.',
    gameplayTips: ['Apply Cryo Infliction with Battle Skill then ensure teammates trigger Solidification before executing Combo Skill', 'Execute Combo Skill against Solidified enemies to trigger both increased damage and Physical Susceptibility simultaneously', 'Deploy Ultimate after applying debuffs to capitalize on amplified damage rather than immediately', 'Coordinate with teammates to ensure Solidification persists until Combo Skill connects', 'Leverage polearm range to maintain safe positioning while contributing to Solidification setups'],
    gearNotes: 'Type 50 Yinglung (3-piece) provides 15% ATK increase with Combo Skill damage scaling after ally Battle Skills. Pair with Swordmancer TAC Gauntlets off-piece. Eternal Xiranite is the support-focused alternative maximizing debuff application. Aburrey\'s Legacy provides strong early game Skill DMG +24% with ATK buffs.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'Combo Skill (Solidified target)', value: '~360% ATK', conditions: 'Increased damage against Solidified enemies + Physical Susceptibility application' },
      { scenario: 'Physical Susceptibility debuff', value: '-12% Physical RES', conditions: 'Applied via Combo Skill on Solidified targets' },
      { scenario: 'Personal DPS', value: '~12,000/s', conditions: 'In Cryo Budget team with Will-focused build' },
      { scenario: 'Ultimate (Solidification trigger)', value: '~420% ATK', conditions: 'Forces Solidification for follow-up Shatter damage' },
    ],
    skillData: [
      { name: 'Frost Lance', type: 'Normal Attack', multiplier: '110-145% ATK', description: 'Polearm thrusts applying Cryo Infliction on each hit. Decent range thanks to polearm weapon type. Will-based durability scaling.', notes: 'Consistent Cryo application — maintain attacks for Infliction buildup' },
      { name: 'Ice Spear', type: 'Battle Skill', multiplier: '280% ATK', spCost: 20, description: 'Thrust applying heavy Cryo Infliction to target. If target has existing Cryo stacks, triggers Solidification. Grants minor Will-based shield to self.', notes: 'Solidification enabler — use on targets with existing Cryo Infliction' },
      { name: 'Shatter Strike', type: 'Combo Skill', multiplier: '360% ATK', description: 'Triggered by ally Final Strike. Enhanced damage against Solidified targets. Applies Physical Susceptibility on Solidified enemies hit.', notes: 'Highest damage against Solidified targets — coordinate timing with Solidification windows' },
      { name: 'Glacial Domain', type: 'Ultimate', multiplier: '420% ATK + Solidification', spCost: 100, description: 'Polearm sweep forcing Solidification on all Cryo-Inflicted enemies. Creates frozen terrain reducing enemy movement. Team gains Cryo DMG buff for 10s.', notes: 'Forces Solidification for team to exploit — use before burst damage windows' },
    ],
    gearSetDetails: [
      { name: 'Type 50 Yinglung', pieces: 3, bonusDescription: 'ATK +15%. Combo Skill DMG +20% after ally Battle Skill.', statBoosts: ['ATK +15%', 'Combo Skill DMG +20%'], notes: 'Best option for Combo Skill burst damage against Solidified targets' },
      { name: 'Eternal Xiranite', pieces: 3, bonusDescription: 'After applying amplification, teammates deal +16% damage for 12s.', statBoosts: ['Team DMG +16%', '12s duration'], notes: 'Support-focused alternative maximizing Physical Susceptibility value' },
    ],
    statPriorities: [
      { stat: 'Will', priority: 'High', notes: 'Highest at 152 — primary stat for durability and some scaling' },
      { stat: 'Intellect', priority: 'Medium', notes: 'Cryo Infliction potency and Arts damage' },
      { stat: 'Strength', priority: 'Medium', notes: 'Balanced at 105 — Physical damage contribution' },
      { stat: 'Cryo DMG', priority: 'Medium', notes: 'Amplifies all Cryo abilities' },
    ],
    rotationGuide: 'START: Basic attacks to apply Cryo Infliction on targets\n→ Battle Skill on Cryo-Inflicted target (triggers Solidification + self-shield)\n→ Ally Final Strike triggers Combo Skill (enhanced damage on Solidified targets + Physical Susceptibility)\n→ Team exploits Solidification and Physical Susceptibility window\n→ Continue basic attacks for Cryo maintenance\n→ Battle Skill on cooldown (more Solidification triggers)\n→ Ultimate when multiple enemies have Cryo Infliction (forced Solidification + Cryo buff)\n→ Repeat from basic attacks\n\nKEY: Estella bridges Cryo and Physical damage through Solidification + Physical Susceptibility. Her value increases in hybrid Cryo/Physical compositions.',
    comparisonNotes: 'vs Chen Qianyu: Both are Guards but serve different elements and roles. Chen Qianyu is a Physical specialist with counter mechanics; Estella is a Cryo/Physical hybrid with Solidification enabling. Chen Qianyu is the better Guard overall, but Estella fills a unique niche in Shatter compositions.\n\nvs Alesh: Both support Cryo teams but differently. Alesh focuses on SP generation and pure Cryo enabling; Estella focuses on Solidification and Physical Susceptibility bridging. In dedicated Shatter teams, Estella provides more offensive value.',
  },

  'fluorite': {
    slug: 'fluorite',
    ratings: { overall: 'C', pve: 'C', boss: 'C', support: 'C' },
    pros: [
      'Highest Agility among Casters at 168',
      'Nature element provides Vulnerability application',
      'Handcannon provides safe ranged attacks',
      'Only Nature Caster option currently available',
    ],
    cons: [
      'Low overall damage output for a Caster',
      'Nature teams have limited roster options',
      'Outperformed by 5-star and 6-star Caster alternatives',
      'Agility stat is wasted on a Caster build',
    ],
    review: 'Fluorite is a specialized enabler for Cryo and Nature reaction teams, essential for operators like Last Rite and Yvonne who consume Cryo Inflictions for amplified damage. Her kit revolves around applying additional elemental infliction stacks through Combo Skill and Ultimate. Despite extremely long Combo Skill cooldowns (40 seconds base), she provides irreplaceable value in her niche. The Frontiers equipment set is critical for addressing her cooldown issues. Avoid using her Battle Skill in most compositions as it applies unwanted Nature Inflictions that can disrupt elemental reaction sequences. She performs best as a teammate rather than the controlled operator.',
    bestWeapons: [
      { name: 'OBJ Velocitous', rating: 5, notes: 'Best in slot - Ultimate Gain Efficiency supporting enabler role' },
      { name: 'Wedge', rating: 4, notes: 'Arts DMG and Crit Rate for personal damage contribution' },
      { name: 'Navigator', rating: 3, notes: 'Hybrid option balancing Infliction application and damage' },
      { name: 'Howling Guard', rating: 2, notes: 'Budget 4-star for Suppression builds' },
    ],
    bestGearSets: ['Frontiers', 'MI Security'],
    skillPriority: 'Combo Skill = Ultimate > Basic Attack > Battle Skill',
    synergies: ['Ardelia', 'Gilberta'],
    teamComps: [
      { name: 'Nature Niche', members: ['Fluorite', 'Ardelia', 'Gilberta', 'Endministrator'], notes: 'Nature-heavy composition utilizing Vulnerability stacking' },
    ],
    introduction: 'Fluorite is a specialized enabler for Cryo and Nature reaction teams, providing essential Infliction stacking for operators like Last Rite and Yvonne. Her kit revolves around applying additional elemental infliction stacks through Combo Skill and Ultimate while supporting Arts Reaction triggers. Despite her C-tier overall rating, she is nearly irreplaceable in Cryo compositions where consistent Infliction application is critical. Her extreme Combo Skill cooldown (40 seconds base) is her primary weakness, making the Frontiers equipment set critical for viability.',
    gameplayTips: ['Wait until enemies have sufficient Cryo or Nature Inflictions before deploying Combo Skill to maximize the long cooldown value', 'Use Combo Skill immediately when available given the prohibitively long recharge time', 'Avoid triggering Battle Skill unless specifically coordinating Nature reactions, as it disrupts Cryo sequences', 'Deploy Improvised Explosives strategically for Slow effects and supplementary Nature Infliction', 'Be extremely careful when layering Nature and Cryo Inflictions together to avoid unintended Solidification'],
    gearNotes: 'Frontiers (4-piece) is essential to address the crippling 40-second Combo Skill cooldown. Without this set, her Combo Skill cycles too slowly for consistent value. MI Security is the damage-focused alternative with Crit Rate stacking. Mordvolt Insulation provides early game Intellect and Arts DMG when above 80% HP.',
    lastUpdated: '2025-02-19',
    damageCalcs: [
      { scenario: 'Combo Skill Infliction stacks', value: '+3-4 elemental stacks', conditions: 'Applied to all enemies in AoE — long 40s base cooldown' },
      { scenario: 'Improvised Explosives (Ultimate)', value: '~280% ATK + Slow', conditions: 'Deploys explosive traps with Nature Infliction and movement slow' },
      { scenario: 'Personal DPS', value: '~10,000/s', conditions: 'Low — Fluorite is an enabler, not a damage dealer' },
      { scenario: 'Cryo team Infliction contribution', value: '+2-3 extra Cryo stacks/cycle', conditions: 'When supporting Last Rite or Yvonne Cryo consumption' },
    ],
    skillData: [
      { name: 'Nature Shot', type: 'Normal Attack', multiplier: '90-120% ATK', description: 'Ranged handcannon shots applying minor Nature Infliction. Highest Agility among Casters (168) provides fast attack speed. Low damage but consistent Infliction.', notes: 'Fast ranged attacks maintain Infliction between skill cooldowns' },
      { name: 'Corrosive Burst', type: 'Battle Skill', multiplier: '220% ATK', spCost: 18, description: 'Fires Nature burst applying heavy Nature Infliction. CAUTION: In Cryo teams, Nature Infliction can disrupt Cryo reaction sequences if improperly timed.', notes: 'AVOID in most Cryo compositions — Nature Infliction disrupts Cryo stacking' },
      { name: 'Infliction Surge', type: 'Combo Skill', multiplier: '180% ATK (AoE)', cooldown: 40, description: 'Triggered by ally Final Strike. Applies 3-4 additional elemental Infliction stacks matching the dominant element on targets. 40-second base cooldown is exceptionally long.', notes: 'Core enabler ability — provides massive Infliction stacking per use despite long cooldown' },
      { name: 'Improvised Explosives', type: 'Ultimate', multiplier: '280% ATK + traps', spCost: 100, description: 'Deploys explosive traps across battlefield applying Nature Infliction and movement Slow to enemies. Traps persist for 15s dealing sustained area damage.', notes: 'Zone control + supplementary Infliction — useful in sustained encounters' },
    ],
    gearSetDetails: [
      { name: 'Frontiers', pieces: 3, bonusDescription: 'Skill cooldown -15%. After SP recovery, team deals +16% damage for 12s.', statBoosts: ['Cooldown -15%', 'Team DMG +16%', '12s on SP recovery'], notes: 'ESSENTIAL — reduces 40s Combo Skill cooldown to ~34s. Without this, Fluorite is barely functional' },
      { name: 'MI Security', pieces: 3, bonusDescription: 'Crit Rate +15%. Crit DMG +25% after landing critical hit.', statBoosts: ['Crit Rate +15%', 'Crit DMG +25%'], notes: 'Damage-focused alternative — Agility 168 enables consistent crit fishing' },
    ],
    statPriorities: [
      { stat: 'Agility', priority: 'High', notes: 'Highest at 168 — attack speed and Physical scaling (unusual for Caster)' },
      { stat: 'Intellect', priority: 'Medium', notes: 'Arts damage and Infliction potency scaling' },
      { stat: 'Cooldown Reduction', priority: 'High', notes: 'Critical for addressing 40s Combo Skill cooldown' },
      { stat: 'Will', priority: 'Low', notes: 'Lowest at 92 — Fluorite is fragile, keep at range' },
    ],
    rotationGuide: 'START: Basic attacks for minor Infliction maintenance (DO NOT use Battle Skill in Cryo teams)\n→ Ally Final Strike triggers Combo Skill (massive Infliction stacking — 3-4 stacks applied)\n→ DPS consumes Infliction stacks for elemental reactions\n→ Continue basic attacks during 34-40s Combo Skill cooldown\n→ Ultimate when available (deploy traps for zone control + Nature Infliction)\n→ Wait for Combo Skill to recharge\n→ Next Combo Skill trigger → another Infliction surge\n→ Repeat\n\nKEY: Fluorite\'s entire value is her Combo Skill. The 40s cooldown means each use must count. DO NOT waste it on low-priority targets. In Cryo teams, AVOID Battle Skill — Nature Infliction disrupts Cryo reactions.',
    comparisonNotes: 'vs Perlica: Both are Caster enablers but for different elements. Perlica enables Electric teams (Avywenna); Fluorite enables Cryo/Nature reaction teams (Last Rite, Yvonne). Perlica has much faster Infliction cycling; Fluorite has the long 40s cooldown problem. Perlica is generally considered more valuable.\n\nvs Ardelia: Different roles entirely. Ardelia is a premium universal support; Fluorite is a niche Infliction stacker. Ardelia provides healing + Susceptibility; Fluorite provides raw Infliction stacks. In Nature teams, both can coexist. In Cryo teams, Ardelia is always preferred unless specific Infliction stacking is needed.',
  },
};

// Helper to get guide for a character
export function getOperatorGuide(slug: string): OperatorGuide | null {
  return OPERATOR_GUIDES[slug] || null;
}

// Get all tier list entries flattened
export function getTierListFlat(): TierListEntry[] {
  const entries: TierListEntry[] = [];
  for (const tier of ['SS', 'S', 'A', 'B', 'C', 'D'] as TierRating[]) {
    entries.push(...DEFAULT_TIER_LIST[tier]);
  }
  return entries;
}

// Tier colors
export const TIER_COLORS: Record<TierRating, string> = {
  SS: '#FF4444',
  S: '#FF8C00',
  A: '#FFD429',
  B: '#27AE60',
  C: '#3498DB',
  D: '#9B59B6',
};
