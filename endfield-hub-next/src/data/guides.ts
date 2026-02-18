import type { WeaponType } from '@/types/game';

// ========== Guide Types ==========

export type TierRating = 'SS' | 'S' | 'A' | 'B' | 'C' | 'D';

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
  ],
  A: [
    { slug: 'endministrator', name: 'Endministrator', tier: 'A', element: 'Physical', role: 'Guard' },
    { slug: 'avywenna', name: 'Avywenna', tier: 'A', element: 'Electric', role: 'Assault' },
    { slug: 'xaihi', name: 'Xaihi', tier: 'A', element: 'Cryo', role: 'Supporter' },
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
      { name: 'Rapid Ascent', rating: 5, notes: 'Best in slot - +42% Physical DMG for skills, +98% DMG vs Staggered enemies' },
      { name: 'Eminent Repute', rating: 4, notes: 'Strong support-oriented alternative with team damage buff' },
      { name: 'Sundering Steel', rating: 3, notes: '5-star option with +34.7% Physical DMG' },
      { name: 'Contingent Measure', rating: 2, notes: 'Solid 4-star fallback option' },
    ],
    bestGearSets: ['Swordmancer', 'Type 50 Yinglung'],
    skillPriority: 'Battle Skill > Combo Skill > Ultimate > Basic Attack',
    synergies: ['Pogranichnik', 'Chen Qianyu', 'Lifeng', 'Ardelia'],
    teamComps: [
      { name: 'Physical Core', members: ['Endministrator', 'Pogranichnik', 'Chen Qianyu', 'Ardelia'], notes: 'Strong F2P Physical team with vulnerability stacking' },
      { name: 'Balanced F2P', members: ['Endministrator', 'Last Rite', 'Ardelia', 'Antal'], notes: 'Mixed element team using free operators' },
    ],
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
    bestGearSets: ['Swordmancer', 'AIC Heavy'],
    skillPriority: 'Battle Skill > Combo Skill > Ultimate > Basic Attack',
    synergies: ['Endministrator', 'Pogranichnik', 'Chen Qianyu', 'Ardelia'],
    teamComps: [
      { name: 'Physical Guard Stack', members: ['Lifeng', 'Endministrator', 'Pogranichnik', 'Ardelia'], notes: 'Double Guard composition with Pogranichnik enabling Physical damage' },
    ],
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
    review: 'Alesh is a situational Cryo Vanguard with high Strength but limited current meta relevance. While she can contribute to Cryo teams with freeze reactions, she is generally outperformed by higher-rarity options. Her high Strength stat gives her decent base damage, but without standout utility or unique mechanics, she struggles to justify a team slot over alternatives. She may become more relevant as future content introduces Cryo-favoring mechanics.',
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
  },

  'avywenna': {
    slug: 'avywenna',
    ratings: { overall: 'A', pve: 'A', boss: 'A', support: 'B' },
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
      { name: 'Cohesive Traction', rating: 4, notes: 'Best 5-star polearm for Electric DPS' },
      { name: 'Chimeric Justice', rating: 3, notes: 'Alternative with good base stats' },
      { name: 'Aggeloslayer', rating: 2, notes: '4-star polearm option' },
    ],
    bestGearSets: ['Mordvolt Insulation', 'Tide Surge'],
    skillPriority: 'Battle Skill > Combo Skill > Ultimate > Basic Attack',
    synergies: ['Perlica', 'Antal', 'Arclight', 'Gilberta'],
    teamComps: [
      { name: 'Electric Meta', members: ['Avywenna', 'Perlica', 'Antal', 'Gilberta'], notes: 'Strongest Electric team with Gilberta amplifying damage' },
      { name: 'Electric Core', members: ['Avywenna', 'Arclight', 'Antal', 'Ardelia'], notes: 'Budget Electric team with healing support' },
    ],
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
      { name: 'Finishing Call', rating: 4, notes: 'Best 5-star greatsword for Physical damage' },
      { name: 'Ancient Canal', rating: 3, notes: 'Alternative with good passive' },
      { name: 'Industry 0.1', rating: 2, notes: '4-star budget option' },
    ],
    bestGearSets: ['Type 50 Yinglung', 'Armored MSGR'],
    skillPriority: 'Battle Skill > Ultimate > Combo Skill > Basic Attack',
    synergies: ['Pogranichnik', 'Endministrator', 'Chen Qianyu'],
    teamComps: [
      { name: 'Physical Assault', members: ['Da Pan', 'Pogranichnik', 'Lifeng', 'Ardelia'], notes: 'Physical team with Da Pan as primary DPS' },
    ],
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
  },

  'wulfgard': {
    slug: 'wulfgard',
    ratings: { overall: 'B', pve: 'B', boss: 'B', support: 'C' },
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
      { name: 'Opus: The Living', rating: 4, notes: 'Best 5-star handcannon for Heat builds' },
      { name: 'Rational Farewell', rating: 3, notes: 'Alternative with good base stats' },
      { name: 'Long Road', rating: 2, notes: '4-star budget handcannon' },
    ],
    bestGearSets: ['Hot Work', 'Armored MSGR'],
    skillPriority: 'Battle Skill > Combo Skill > Ultimate > Basic Attack',
    synergies: ['Laevatain', 'Ember', 'Akekuri'],
    teamComps: [
      { name: 'Heat Support DPS', members: ['Wulfgard', 'Laevatain', 'Ember', 'Ardelia'], notes: 'Wulfgard provides off-field Heat damage' },
    ],
  },

  'xaihi': {
    slug: 'xaihi',
    ratings: { overall: 'A', pve: 'A', boss: 'A', support: 'A' },
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
      { name: 'Wild Wanderer', rating: 4, notes: 'Best 5-star Arts Unit for Cryo Supporters' },
      { name: 'Freedom to Proselytize', rating: 3, notes: 'Good healing-focused alternative' },
      { name: 'Fluorescent Roc', rating: 2, notes: '4-star budget option' },
    ],
    bestGearSets: ['LYNX', 'Mordvolt Resistant'],
    skillPriority: 'Combo Skill > Ultimate > Battle Skill > Basic Attack',
    synergies: ['Last Rite', 'Yvonne', 'Snowshine', 'Alesh'],
    teamComps: [
      { name: 'Cryo Healer Core', members: ['Xaihi', 'Last Rite', 'Yvonne', 'Snowshine'], notes: 'Full Cryo team with Xaihi as dedicated healer' },
    ],
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
      { name: 'Industry 0.1', rating: 3, notes: 'Best available 4-star greatsword' },
      { name: 'Quencher', rating: 2, notes: 'Alternative budget option' },
    ],
    bestGearSets: ['AIC Heavy', 'Armored MSGR'],
    skillPriority: 'Combo Skill > Battle Skill > Ultimate > Basic Attack',
    synergies: ['Endministrator', 'Da Pan'],
    teamComps: [
      { name: 'Physical Budget', members: ['Catcher', 'Endministrator', 'Da Pan', 'Ardelia'], notes: 'Budget Physical team with Catcher as early-game tank' },
    ],
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
      { name: "Pathfinder's Beacon", rating: 3, notes: 'Best 4-star polearm option' },
      { name: 'Aggeloslayer', rating: 2, notes: 'Alternative with different passive' },
    ],
    bestGearSets: ['Mordvolt Resistant', 'AIC Heavy'],
    skillPriority: 'Combo Skill > Battle Skill > Ultimate > Basic Attack',
    synergies: ['Last Rite', 'Xaihi', 'Snowshine'],
    teamComps: [
      { name: 'Cryo Budget', members: ['Estella', 'Last Rite', 'Xaihi', 'Ardelia'], notes: 'Budget Cryo team with Estella as Guard filler' },
    ],
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
    review: 'Fluorite is the only dedicated Nature Caster, which gives her a unique niche but also highlights the current limitations of Nature team compositions. Her unusually high Agility (168) is wasted on a Caster whose damage scales with Intellect, creating an awkward stat distribution. She can apply Nature Vulnerability through her handcannon attacks, but her overall damage output is low. She currently has limited competitive value but may become more relevant as more Nature operators are released and Nature team compositions develop.',
    bestWeapons: [
      { name: 'Long Road', rating: 3, notes: 'Best available 4-star handcannon' },
      { name: 'Howling Guard', rating: 2, notes: 'Alternative budget option' },
    ],
    bestGearSets: ['Mordvolt Insulation', 'Catastrophe'],
    skillPriority: 'Battle Skill > Combo Skill > Ultimate > Basic Attack',
    synergies: ['Ardelia', 'Gilberta'],
    teamComps: [
      { name: 'Nature Niche', members: ['Fluorite', 'Ardelia', 'Gilberta', 'Endministrator'], notes: 'Nature-heavy composition utilizing Vulnerability stacking' },
    ],
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
