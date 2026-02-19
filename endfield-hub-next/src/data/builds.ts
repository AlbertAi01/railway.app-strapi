// ===== COMMUNITY BUILDS DATA LAYER =====
// Feature-complete implementation matching endfieldtools.dev

import { GEAR_SETS, STANDALONE_GEAR, type GearPiece, type GearSet } from '@/data/gear';

export interface BuildEquipmentSlot {
  pieceName: string;    // individual piece name e.g. "Swordmancer Heavy Armor"
  setName?: string;     // parent set name e.g. "Swordmancer" (null for standalone)
  artificeLevel?: number; // 0-3
}

export interface BuildCharacter {
  name: string;
  weapon?: string;
  equipmentPieces?: BuildEquipmentSlot[]; // up to 3 individual gear pieces (body, hand, edc)
  equipment?: string; // DEPRECATED: legacy set name field, kept for backward compat
  notes?: string;
  skillLevels?: number[];
  role?: string; // "Main DPS", "Sub-DPS", "Healer", "Tank", "Buffer"
  statPriority?: string; // e.g. "INT > AGI > WILL > STR"
  altWeapons?: string[]; // alternative weapon names
  altEquipment?: string[]; // alternative gear set names
}

export interface RecommendedPartner {
  name: string;
  reason?: string;
}

export interface BuildGuide {
  overview?: string;
  rotation?: string[];
  tips?: string[];
  matchups?: { good: string[]; bad: string[] };
  investment?: 'Low' | 'Medium' | 'High';
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  changelog?: string[];
}

export interface Build {
  id: string;
  name: string;
  type: 'single' | 'team';
  characters: BuildCharacter[];
  tags: string[];
  notes: string;
  shortDescription: string; // 0/200 char limit, shown in cards
  isPublic: boolean;
  likes: number;
  views: number;
  createdAt: number;
  updatedAt: number;
  author?: string;
  authorId?: number; // links to user.id for "My Builds" + profile
  guide?: BuildGuide;
  youtubeUrl?: string; // optional YouTube video embed
  recommendedPartners?: RecommendedPartner[]; // 0-10 partners
  partnerReason?: string; // "Why these partners?" text
  favorites?: string[]; // array of user IDs who favorited (for localStorage sim)
}

// Re-export gear data for convenience
export { GEAR_SETS, STANDALONE_GEAR };
export type { GearPiece, GearSet };

// Helper: Get all gear pieces for picker UI, grouped by set
export function getGearPiecesGroupedBySet(): { setName: string; setBonus: string; tier: string; pieces: GearPiece[] }[] {
  return GEAR_SETS.map(set => ({
    setName: set.name,
    setBonus: set.setBonus,
    tier: set.pieces[0]?.tier || 'T4',
    pieces: set.pieces,
  }));
}

// Helper: Get all individual gear pieces (set + standalone) as flat list
export function getAllGearPiecesFlat(): GearPiece[] {
  return [...GEAR_SETS.flatMap(s => s.pieces), ...STANDALONE_GEAR];
}

// Helper: Find a gear piece by name
export function findGearPiece(pieceName: string): GearPiece | undefined {
  return getAllGearPiecesFlat().find(p => p.name === pieceName);
}

// Helper: Get the set a piece belongs to
export function getSetForPiece(pieceName: string): GearSet | undefined {
  return GEAR_SETS.find(s => s.pieces.some(p => p.name === pieceName));
}

// Helper: legacy set name list for backward compat
export const EQUIPMENT_SET_NAMES = GEAR_SETS.map(s => s.name);

// Tags matching endfieldtools.dev exactly
export const BUILD_TAGS = [
  'Early Game',
  'Mid Game',
  'Late Game',
  'F2P-Friendly',
  'Not F2P Friendly',
  'Farming',
  'Boss',
] as const;

// Additional role/strategy tags for browse filtering
export const STRATEGY_TAGS = [
  'Meta',
  'Speedrun',
  'DPS',
  'Support',
  'Tank',
  'Healer',
  'Off-Meta',
  'Fun',
] as const;

export const ALL_TAGS = [...BUILD_TAGS, ...STRATEGY_TAGS];
export type BuildTag = (typeof ALL_TAGS)[number];

export type BrowseFilter = 'popular' | 'latest' | 'teams' | 'single' | 'has-video';
export const MAX_TEAM_SIZE = 4;
export const MAX_TAGS = 4;
export const MAX_PARTNERS = 10;
export const MAX_SHORT_DESC = 200;

// Helper: get YouTube embed URL from various YouTube URL formats
export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube-nocookie.com/embed/${match[1]}`;
  }
  return null;
}

// Helper: get YouTube thumbnail
export function getYouTubeThumbnail(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  }
  return null;
}

// ===== FAVORITES STORE (localStorage) =====
const FAVORITES_KEY = 'endfield-build-favorites';

export function getFavoriteBuildIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteBuild(buildId: string): boolean {
  const favs = getFavoriteBuildIds();
  const idx = favs.indexOf(buildId);
  if (idx >= 0) {
    favs.splice(idx, 1);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    return false; // unfavorited
  } else {
    favs.push(buildId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    return true; // favorited
  }
}

export function isBuildFavorited(buildId: string): boolean {
  return getFavoriteBuildIds().includes(buildId);
}

// ===== MY BUILDS STORE (localStorage) =====
const MY_BUILDS_KEY = 'endfield-my-builds';

export function getMyBuilds(): Build[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(MY_BUILDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveMyBuilds(builds: Build[]): void {
  localStorage.setItem(MY_BUILDS_KEY, JSON.stringify(builds));
}

// ===== SAMPLE BUILDS =====
export const SAMPLE_BUILDS: Build[] = [
  {
    id: 'laevatain-hypercarry',
    name: 'Laevatain Hypercarry',
    type: 'single',
    characters: [
      {
        name: 'Laevatain',
        weapon: 'Umbral Torch',
        equipment: 'Type 50 Yinglung',
        equipmentPieces: [
          { pieceName: 'Type 50 Yinglung Heavy Armor', setName: 'Type 50 Yinglung', artificeLevel: 3 },
          { pieceName: 'Type 50 Yinglung Gloves', setName: 'Type 50 Yinglung', artificeLevel: 2 },
          { pieceName: 'Type 50 Yinglung Knife', setName: 'Type 50 Yinglung', artificeLevel: 1 },
        ],
        notes: 'Primary Heat DPS with massive single-target burst potential',
        skillLevels: [10, 10, 10],
        role: 'Main DPS',
        statPriority: 'INT > AGI > STR > WILL',
        altWeapons: ['Thermite Cutter', 'Grand Vision'],
        altEquipment: ['Hot Work', 'Eternal Xiranite'],
      },
    ],
    tags: ['Late Game', 'Not F2P Friendly', 'Boss', 'Meta', 'DPS'],
    notes: 'The premiere Heat DPS build for endgame boss encounters and single-target content.',
    shortDescription: 'Maximize Laevatain burst damage with Umbral Torch and Yinglung set. Best-in-class Heat DPS for boss content and Challenger Gauntlet.',
    isPublic: true,
    likes: 2847,
    views: 18293,
    createdAt: Date.now() - 86400000 * 45,
    updatedAt: Date.now() - 86400000 * 7,
    author: 'Operator-IX',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    recommendedPartners: [
      { name: 'Gilberta', reason: 'INT buff amplifies all Heat damage multiplicatively' },
      { name: 'Ardelia', reason: 'Best healer for sustained boss fights' },
      { name: 'Akekuri', reason: 'Fast Combustion applicator for reaction setup' },
      { name: 'Wulfgard', reason: 'AoE Combustion for multi-target phases' },
    ],
    partnerReason: 'Laevatain needs INT buffing from Gilberta to reach peak burst damage, Ardelia for sustain through boss enrage phases, and a fast Heat applicator like Akekuri to maintain Combustion stacks during her cooldown windows.',
    guide: {
      overview: `Laevatain stands as the undisputed queen of Heat-based damage in Arknights: Endfield, offering a combination of sustained DPS and explosive burst windows that few operators can match. Her signature weapon Umbral Torch synergizes perfectly with her kit, amplifying Heat Infliction while providing significant Arts Intensity scaling. The weapon's passive ability, Inferno's Edge, stacks up to 5 times during combat, increasing elemental skill damage by 8% per stack.

The Type 50 Yinglung equipment set is the optimal choice for maximizing her damage output, providing both raw ATK and critical rate that benefit every aspect of her kit. The set bonus grants 18% ATK and 12% Crit Rate, which translates to consistent damage across her entire rotation.

What sets this build apart from other Heat DPS options is Laevatain's unique ability to maintain sustained pressure while building toward massive burst windows. Her Battle Skill applies Heat Infliction every 3 seconds, slowly stacking Combustion on targets even during downtime. Her Ultimate, Phoenix Rebirth, not only deals catastrophic Heat damage but also refreshes all her cooldowns and extends the Combustion duration by 5 seconds.

The main challenge with this build is the significant investment required to unlock its full potential. Laevatain needs her weapon at refinement rank 3 minimum to achieve competitive damage numbers, and her skill levels should all be at 9 or 10 for optimal cooldown management.`,
      rotation: [
        'Start with Battle Skill to apply initial Heat Infliction and begin building Combustion stacks',
        'Execute Normal Attack combo (3-hit chain) while watching for Umbral Torch passive stacks to reach 3+',
        'Use Elemental Skill immediately after the 3rd normal attack to cancel recovery frames and apply Heavy Heat Infliction',
        'Dash cancel into another Normal Attack chain to maintain pressure while Elemental Skill is on cooldown',
        'When combo gauge reaches 70%+ and Combustion has 3+ stacks, activate Combo Skill for massive amplified damage',
        'Immediately follow with charged Normal Attack during the Combo Skill damage window for additional multipliers',
        'Once Ultimate is ready and all buffs are active, use Phoenix Rebirth at peak Combustion stacks (5+) for maximum burst',
        'After Ultimate, repeat rotation from step 2, using the cooldown refresh to maintain continuous pressure',
      ],
      tips: [
        'Laevatain has i-frames during her Elemental Skill animation from frame 8 to frame 24. Use this to dodge boss attacks while maintaining DPS uptime.',
        'The 3rd hit of her Normal Attack chain has a slightly longer recovery animation. Always dash cancel or skill cancel it to optimize damage output.',
        'Combustion stacks snapshot at the moment of skill activation. Wait for max stacks before using Ultimate for the highest possible damage.',
        'Against bosses with long vulnerability windows, hold your Ultimate until the window opens. Phoenix Rebirth deals 40% more damage to Combusted targets.',
        'Your combo gauge builds 15% faster when hitting Combusted enemies. Prioritize applying Combustion early to accelerate your burst rotation.',
        'If you have refinement rank 5 Umbral Torch, you gain 20% damage reduction while at max passive stacks. Use this defensively during difficult phases.',
        'Pair with operators who provide INT buffs or Heat damage amplification for multiplicative scaling. Gilberta\'s Ultimate is particularly synergistic.',
        'Save your dash charges for repositioning during Ultimate cast. You can move freely during Phoenix Rebirth without interrupting the damage.',
      ],
      matchups: {
        good: [
          'Corrupted Sentinel (Heat weakness, stationary)',
          'Titanium Colossus (long vulnerability windows, high HP pool)',
          'Challenger Gauntlet Floor 45-50 (single-target DPS checks)',
          'Frontline Bastion Defense (boss waves with predictable patterns)',
          'Anomaly Investigation Zone 7-8 (Heat-vulnerable elite spawns)',
        ],
        bad: [
          'Cryo Elemental Variants (50% Heat resistance)',
          'Swarm Encounters (multiple small enemies, wasted single-target damage)',
          'Speed Trial Challenges (favors AoE clear over boss damage)',
          'Mobile Assassination Targets (hard to maintain Combustion stacks)',
          'Counter-reactive Bosses (punish skill usage, limit rotation flexibility)',
        ],
      },
      investment: 'High',
      difficulty: 'Medium',
      changelog: [
        '2026-02-10: Added notes about refinement rank 5 defensive benefits',
        '2026-01-28: Updated rotation to reflect combo gauge changes in patch 1.4',
        '2026-01-15: Added alternative equipment options for budget builds',
        '2025-12-20: Initial guide publication',
      ],
    },
  },
  {
    id: 'wulfgard-artillery',
    name: 'Wulfgard Ranged Artillery',
    type: 'single',
    characters: [
      {
        name: 'Wulfgard',
        weapon: 'Rational Farewell',
        equipment: 'Hot Work',
        equipmentPieces: [
          { pieceName: 'Hot Work Exoskeleton', setName: 'Hot Work', artificeLevel: 2 },
          { pieceName: 'Hot Work Gauntlets', setName: 'Hot Work', artificeLevel: 2 },
          { pieceName: 'Hot Work Pyrometer', setName: 'Hot Work', artificeLevel: 1 },
        ],
        notes: 'Ranged handcannon specialist excelling in AoE scenarios and mid-range combat.',
        skillLevels: [10, 10, 9],
        role: 'Main DPS',
        statPriority: 'STR > AGI > INT > WILL',
        altWeapons: ['Howling Guard', 'Long Road'],
        altEquipment: ['Frontiers', 'Type 50 Yinglung'],
      },
    ],
    tags: ['Mid Game', 'F2P-Friendly', 'DPS', 'Off-Meta'],
    notes: 'An unconventional but powerful ranged DPS build utilizing Wulfgard\'s handcannon for explosive AoE damage.',
    shortDescription: 'Wulfgard ranged artillery build focusing on handcannon AoE explosions. Unconventional but devastatingly effective in multi-target scenarios.',
    isPublic: true,
    likes: 1523,
    views: 9847,
    createdAt: Date.now() - 86400000 * 32,
    updatedAt: Date.now() - 86400000 * 12,
    author: 'DocHolst',
    recommendedPartners: [
      { name: 'Gilberta', reason: 'Healing and buffs for safe ranged play' },
      { name: 'Endministrator', reason: 'Shield provides protection while kiting' },
    ],
    partnerReason: 'Wulfgard needs teammates who can protect him while he maintains range advantage. Gilberta provides healing and Endministrator shields.',
    guide: {
      overview: `Wulfgard is often pigeonholed as a standard melee bruiser, but his handcannon loadout represents one of the most underrated playstyles in Endfield. With Rational Farewell equipped, Wulfgard transforms into a mid-range artillery platform capable of delivering devastating AoE explosions while maintaining safe distance from threats.

The challenge with Wulfgard Artillery lies in its mechanical difficulty and positioning requirements. Unlike melee builds where you can face-tank through Poise, this playstyle demands constant awareness of spacing, enemy movement patterns, and terrain elevation.

However, for players who master the mechanics, Wulfgard Artillery offers unique advantages in content where melee range is punishing or dangerous.`,
      rotation: [
        'Position at 12-15 meter range from primary target, ensuring clear sightlines and escape routes',
        'Open with Battle Skill to apply initial Combustion and knock back approaching enemies for spacing',
        'Fire 2-3 charged handcannon shots at enemy cluster centers to apply area Combustion stacks',
        'Activate Elemental Skill (Suppression Barrage) when enemies are grouped',
        'Follow up with Combo Skill once Combustion stacks reach 4+ on multiple targets for massive AoE burst',
        'Reposition using dash if enemies breach optimal range, maintaining 10-15 meter spacing at all times',
        'Use Ultimate (Earthshaker Protocol) defensively when overwhelmed, or offensively during vulnerability windows',
      ],
      tips: [
        'Handcannon shots have a 0.4-second travel time at max range. Lead moving targets by approximately 2 meters.',
        'Explosion radius increases by 0.5 meters per 100 STR. Prioritize STR main stat gear to maximize AoE coverage.',
        'Each explosion can apply Combustion to up to 8 targets. Aim for enemy cluster centers rather than individual targets.',
        'Terrain elevation affects trajectory. Shooting downhill extends range by ~20%, while uphill reduces it proportionally.',
      ],
      matchups: {
        good: [
          'Frontier Defense Wave Encounters (consistent enemy grouping)',
          'Anomaly Zone Elite Packs (multiple high-value targets)',
          'Bosses with Lethal Melee Counters (maintain safe distance)',
        ],
        bad: [
          'Highly Mobile Single Targets (hard to land consistent shots)',
          'Close-Quarters Combat Zones (cannot maintain optimal range)',
          'Fast-Moving Assassination Targets (travel time becomes liability)',
        ],
      },
      investment: 'Medium',
      difficulty: 'Hard',
      changelog: [
        '2026-02-05: Added elevation mechanics tip',
        '2026-01-22: Updated rotation to emphasize repositioning',
        '2025-12-28: Initial guide publication',
      ],
    },
  },
  {
    id: 'akekuri-budget-burner',
    name: 'Akekuri Budget Burner',
    type: 'single',
    characters: [
      {
        name: 'Akekuri',
        weapon: 'Aspirant',
        equipment: 'Frontiers',
        equipmentPieces: [
          { pieceName: 'Frontiers Armor T2', setName: 'Frontiers', artificeLevel: 1 },
          { pieceName: 'Frontiers Blight RES Gloves', setName: 'Frontiers', artificeLevel: 1 },
          { pieceName: 'Frontiers Comm', setName: 'Frontiers', artificeLevel: 0 },
        ],
        notes: 'A highly accessible 4-star Heat DPS that delivers exceptional value for F2P players.',
        skillLevels: [9, 9, 8],
        role: 'Sub-DPS',
        statPriority: 'AGI > INT > STR > WILL',
        altWeapons: ['Contingent Measure', 'Wave Tide'],
        altEquipment: ['Hot Work', 'Swordmancer'],
      },
    ],
    tags: ['Early Game', 'F2P-Friendly', 'Farming', 'DPS'],
    notes: 'Budget-friendly Heat DPS build that performs well above its rarity, perfect for new players.',
    shortDescription: 'F2P-friendly 4-star Heat DPS that punches way above its weight. Perfect for new players building their first team.',
    isPublic: true,
    likes: 3621,
    views: 24183,
    createdAt: Date.now() - 86400000 * 28,
    updatedAt: Date.now() - 86400000 * 5,
    author: 'SanityZero',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    recommendedPartners: [
      { name: 'Endministrator', reason: 'Free unit, provides shield and Cryo reactions' },
      { name: 'Gilberta', reason: 'Accessible healer with INT buffs' },
      { name: 'Pogranichnik', reason: 'Tank to draw aggro while Akekuri deals damage' },
    ],
    partnerReason: 'All recommended partners are easily obtainable. Endministrator is free from story, making this a fully F2P-accessible team core.',
    guide: {
      overview: `Akekuri represents everything right about Endfield's design philosophy: a 4-star operator who genuinely competes with 6-stars in the right hands. His fast sword combat style focuses on rapid Combustion application through sheer attack speed rather than raw damage per hit.

What truly elevates Akekuri from decent budget option to genuinely powerful DPS is his Combo Skill's unique mechanic. Swift Inferno grants him 40% increased attack speed and 30% Heat damage for 8 seconds, during which his normal attack chain becomes a perpetual Combustion machine.

The main limitation of this build is the inevitable stat disadvantage against true endgame content. However, for approximately 80% of the game's content, Akekuri Budget Burner performs admirably.`,
      rotation: [
        'Open with Elemental Skill (Blazing Waltz) to immediately apply Combustion',
        'Dash cancel after the 5th hit of Blazing Waltz to skip the long recovery animation',
        'Execute full Normal Attack combo chain (5-hit) to trigger Aspirant passive',
        'Weave in Battle Skill between combo chains to maintain Heat Infliction',
        'Once combo gauge reaches 60%+, activate Combo Skill (Swift Inferno)',
        'During Swift Inferno, spam Normal Attack chains continuously',
        'Use Ultimate (Dancing Flames) for AoE clear or to reset Elemental Skill cooldown',
      ],
      tips: [
        'Focus on maintaining 100% Combustion uptime rather than timing perfect damage windows.',
        'The 5th hit of his Normal Attack chain triggers Aspirant bonus damage. Never cancel before completing all 5 hits.',
        'Swift Inferno attack speed buff stacks multiplicatively with AGI stat.',
        'Pair with operators who provide AGI buffs or attack speed bonuses.',
      ],
      matchups: {
        good: [
          'General Story Content (appropriately scaled difficulty)',
          'Frontier Defense Waves 1-25 (excellent mob clear)',
          'Resource Farming Expeditions (fast clear times)',
        ],
        bad: [
          'Challenger Gauntlet Floor 40+ (stat check too severe)',
          'Endgame Boss Solo Attempts (insufficient burst damage)',
          'Time Trial Speedrun Records (6-stars dominate leaderboards)',
        ],
      },
      investment: 'Low',
      difficulty: 'Easy',
      changelog: [
        '2026-02-12: Added note about AGI stacking with Swift Inferno buff',
        '2026-01-30: Updated rotation to emphasize Combustion uptime priority',
        '2026-01-05: Initial guide publication',
      ],
    },
  },
  {
    id: 'ardelia-supreme-healer',
    name: 'Ardelia Supreme Healer',
    type: 'single',
    characters: [
      {
        name: 'Ardelia',
        weapon: 'Chivalric Virtues',
        equipment: 'LYNX',
        equipmentPieces: [
          { pieceName: 'LYNX Cuirass', setName: 'LYNX', artificeLevel: 3 },
          { pieceName: 'LYNX Gauntlets', setName: 'LYNX', artificeLevel: 2 },
          { pieceName: 'LYNX Aegis Injector', setName: 'LYNX', artificeLevel: 2 },
        ],
        notes: 'The definitive endgame healer with unmatched sustain and team-wide buff capabilities.',
        skillLevels: [10, 10, 10],
        role: 'Healer',
        statPriority: 'WILL > INT > AGI > STR',
        altWeapons: ['Delivery Guaranteed', 'Opus: Etch Figure'],
        altEquipment: ['Eternal Xiranite', 'Mordvolt Insulation'],
      },
    ],
    tags: ['Late Game', 'Boss', 'Support', 'Healer', 'Meta'],
    notes: 'The gold standard for healing, capable of keeping any team alive through the hardest content.',
    shortDescription: 'The undisputed best healer in Endfield. Chivalric Virtues + LYNX for maximum sustain and team buffs. Essential for endgame.',
    isPublic: true,
    likes: 2194,
    views: 15637,
    createdAt: Date.now() - 86400000 * 38,
    updatedAt: Date.now() - 86400000 * 9,
    author: 'Nightingale-2049',
    recommendedPartners: [
      { name: 'Laevatain', reason: 'Heals enable aggressive play during burst windows' },
      { name: 'Wulfgard', reason: 'Ranged DPS benefits from sustained healing at distance' },
      { name: 'Chen Qianyu', reason: 'Tank + healer core for maximum team survivability' },
    ],
    partnerReason: 'Ardelia pairs best with operators who benefit from sustained healing and can capitalize on her damage buffs during healing windows.',
    guide: {
      overview: `Ardelia has solidified her position as the premier healing operator in Arknights: Endfield. Her kit combines powerful sustained healing with offensive buff capabilities that actively increase team DPS rather than merely keeping allies alive.

The LYNX equipment set is the optimal choice, providing 25% healing effectiveness that stacks multiplicatively with Chivalric Virtues and her own WILL scaling.

What elevates Ardelia from merely excellent to absolutely essential is her Ultimate ability, Sanctuary's Blessing. This creates a 20-meter radius zone that provides continuous healing, damage reduction, and debuff immunity for 12 seconds.`,
      rotation: [
        'Maintain Battle Skill passive healing by staying within 15 meters of all team members',
        'Use Elemental Skill reactively when any ally drops below 60% HP',
        'Time heals to land just after major DPS abilities for the 15% damage buff',
        'Build Ultimate charge through consistent Elemental Skill usage',
        'Hold Ultimate for predictable high-damage phases (boss enrages)',
        'During Sanctuary\'s Blessing, focus on buffing DPS with Elemental Skill',
      ],
      tips: [
        'WILL stat increases both healing output and SP generation rate.',
        'Chivalric Virtues damage buff stacks multiplicatively with most other buffs.',
        'Sanctuary\'s Blessing debuff immunity prevents CC but does not cleanse existing debuffs.',
        'The healing zone from your Ultimate persists even if you die during its duration.',
      ],
      matchups: {
        good: [
          'All Endgame Boss Encounters (sustain requirement)',
          'Challenger Gauntlet Floor 35+ (damage intensity demands healing)',
          'Corruption Zone High-Level Runs (debuff immunity essential)',
        ],
        bad: [
          'Speed-focused Time Trials (opportunity cost of support slot)',
          'Low-Damage Farming Content (healing unnecessary)',
        ],
      },
      investment: 'Medium',
      difficulty: 'Easy',
      changelog: [
        '2026-02-08: Added clarification on Sanctuary debuff immunity mechanics',
        '2026-01-25: Updated WILL scaling numbers',
        '2025-12-30: Initial guide publication',
      ],
    },
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
        equipmentPieces: [
          { pieceName: 'Type 50 Yinglung Heavy Armor', setName: 'Type 50 Yinglung', artificeLevel: 3 },
          { pieceName: 'Type 50 Yinglung Gloves T1', setName: 'Type 50 Yinglung', artificeLevel: 2 },
          { pieceName: 'Type 50 Yinglung Knife T1', setName: 'Type 50 Yinglung', artificeLevel: 1 },
        ],
        notes: 'Primary carry focusing on maximum burst damage during Combustion windows.',
        skillLevels: [10, 10, 10],
        role: 'Main DPS',
        statPriority: 'INT > AGI > STR > WILL',
        altWeapons: ['Thermite Cutter', 'Grand Vision'],
        altEquipment: ['Hot Work', 'Eternal Xiranite'],
      },
      {
        name: 'Wulfgard',
        weapon: 'Rational Farewell',
        equipment: 'Hot Work',
        equipmentPieces: [
          { pieceName: 'Hot Work Exoskeleton', setName: 'Hot Work', artificeLevel: 2 },
          { pieceName: 'Hot Work Gauntlets T1', setName: 'Hot Work', artificeLevel: 1 },
          { pieceName: 'Hot Work Power Bank', setName: 'Hot Work', artificeLevel: 1 },
        ],
        notes: 'AoE applicator and secondary DPS for maintaining Combustion on multiple targets.',
        skillLevels: [10, 10, 9],
        role: 'Sub-DPS',
        statPriority: 'STR > AGI > INT > WILL',
        altWeapons: ['Howling Guard', 'Long Road'],
        altEquipment: ['Frontiers', 'Type 50 Yinglung'],
      },
      {
        name: 'Akekuri',
        weapon: 'Thermite Cutter',
        equipment: 'Frontiers',
        equipmentPieces: [
          { pieceName: 'Frontiers Armor', setName: 'Frontiers', artificeLevel: 1 },
          { pieceName: 'Frontiers Blight RES Gloves', setName: 'Frontiers', artificeLevel: 1 },
          { pieceName: 'Frontiers Comm T1', setName: 'Frontiers', artificeLevel: 0 },
        ],
        notes: 'Fast Heat applicator ensuring consistent Combustion uptime between burst windows.',
        skillLevels: [9, 9, 8],
        role: 'Sub-DPS',
        statPriority: 'AGI > INT > STR > WILL',
        altWeapons: ['Contingent Measure', 'Wave Tide'],
        altEquipment: ['Hot Work', 'Swordmancer'],
      },
      {
        name: 'Gilberta',
        weapon: 'Delivery Guaranteed',
        equipment: 'LYNX',
        equipmentPieces: [
          { pieceName: 'LYNX Heavy Armor', setName: 'LYNX', artificeLevel: 2 },
          { pieceName: 'LYNX Gloves', setName: 'LYNX', artificeLevel: 1 },
          { pieceName: 'LYNX Slab', setName: 'LYNX', artificeLevel: 1 },
        ],
        notes: 'Buffer and healer providing INT amplification and sustain for extended encounters.',
        skillLevels: [10, 9, 10],
        role: 'Buffer',
        statPriority: 'WILL > INT > AGI > STR',
        altWeapons: ['Chivalric Virtues', 'Opus: Etch Figure'],
        altEquipment: ['Eternal Xiranite', 'Mordvolt Insulation'],
      },
    ],
    tags: ['Late Game', 'Not F2P Friendly', 'Boss', 'DPS', 'Speedrun', 'Meta'],
    notes: 'Coordinated Heat team comp designed for maximum Combustion burst damage and speedrun potential.',
    shortDescription: 'The ultimate Heat team. Laevatain carry with Wulfgard/Akekuri Combustion setup and Gilberta buffs. Sub-90s Colossus clears.',
    isPublic: true,
    likes: 1876,
    views: 12394,
    createdAt: Date.now() - 86400000 * 21,
    updatedAt: Date.now() - 86400000 * 3,
    author: 'Operator-IX',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    recommendedPartners: [],
    partnerReason: '',
    guide: {
      overview: `Heat Combustion Burst represents the pinnacle of elemental reaction team building in Arknights: Endfield, leveraging the multiplicative damage scaling of Combustion stacks with coordinated burst windows across four specialized operators.

The synergy within this composition operates on multiple layers. Combustion damage increases by 25% per stack, meaning maximum stacks provide 125% additional damage on all Heat sources. When combined with Laevatain's Ultimate bonus, Gilberta's INT buff, and equipment set bonuses, the team can achieve damage multipliers exceeding 400% compared to baseline.

The composition's primary weakness lies in its specialization creating vulnerability outside ideal scenarios. Against Cryo-resistant or Heat-immune enemies, the entire team's effectiveness plummets.`,
      rotation: [
        'Phase 1 - Application: Akekuri opens with Blazing Waltz while Wulfgard uses Battle Skill to establish initial Heat Infliction',
        'Phase 2 - Stack Building: Akekuri maintains normal attack chains while Wulfgard fires charged handcannon shots, building Combustion to 3+ stacks',
        'Phase 3 - Buff Setup: Gilberta activates Ultimate (Tactical Protocol) for team-wide INT buff',
        'Phase 4 - Secondary Burst: Wulfgard activates Suppression Barrage and Akekuri uses Swift Inferno simultaneously',
        'Phase 5 - Primary Burst: Laevatain activates Combo Skill followed immediately by Phoenix Rebirth Ultimate',
        'Phase 6 - Extension: Akekuri refreshes Combustion while Laevatain continues with refreshed cooldowns',
        'Phase 7 - Sustain: Gilberta heals team and maintains buff uptime',
        'Phase 8 - Loop: Return to Phase 2, cycling burst windows every 20-25 seconds',
      ],
      tips: [
        'Combustion stacks decay at 1 stack per 8 seconds if no Heat Infliction occurs. Maintain application constantly.',
        'Gilberta\'s INT buff lasts 10 seconds. Time Laevatain\'s Ultimate around second 4-5 of the buff.',
        'Against bosses with phase transitions, hold all Ultimates until the vulnerable phase begins.',
        'Practice the rotation in low-stakes content before attempting speedruns.',
      ],
      matchups: {
        good: [
          'Titanium Colossus Boss Rush (massive HP pool, Heat neutral)',
          'Challenger Gauntlet Floor 45-50 (DPS check optimization)',
          'Timed Trial Challenges (speedrun-focused content)',
        ],
        bad: [
          'Cryo Elemental Content (severe damage reduction)',
          'Heat-Immune Encounters (composition becomes unviable)',
          'Survival-focused Challenges (no dedicated tank)',
        ],
      },
      investment: 'High',
      difficulty: 'Medium',
      changelog: [
        '2026-02-15: Updated rotation timing for combo gauge changes',
        '2026-02-01: Added Gilberta positioning tip',
        '2026-01-10: Initial team guide publication',
      ],
    },
  },
  {
    id: 'endministrator-f2p-shield',
    name: 'Endministrator F2P Shield Wall',
    type: 'single',
    characters: [
      {
        name: 'Endministrator',
        weapon: 'Opus: Etch Figure',
        equipment: 'Æthertech',
        equipmentPieces: [
          { pieceName: 'Æthertech Plating', setName: 'Æthertech', artificeLevel: 2 },
          { pieceName: 'Æthertech Gloves', setName: 'Æthertech', artificeLevel: 1 },
          { pieceName: 'Æthertech Analysis Band', setName: 'Æthertech', artificeLevel: 1 },
        ],
        notes: 'Free story operator turned into an unkillable tank with massive shield generation.',
        skillLevels: [9, 9, 8],
        role: 'Tank',
        statPriority: 'WILL > STR > AGI > INT',
        altWeapons: ['Chivalric Virtues', 'Long Road'],
        altEquipment: ['MI Security', 'AIC Heavy'],
      },
    ],
    tags: ['Early Game', 'F2P-Friendly', 'Tank'],
    notes: 'Turn the free story operator into a nearly unkillable frontline tank for any team composition.',
    shortDescription: 'Free story operator built as an unkillable shield tank. Zero gacha investment required. Perfect starter tank for all content.',
    isPublic: true,
    likes: 4102,
    views: 31204,
    createdAt: Date.now() - 86400000 * 50,
    updatedAt: Date.now() - 86400000 * 2,
    author: 'F2P-Enjoyer',
    recommendedPartners: [
      { name: 'Laevatain', reason: 'Shield lets Laevatain play aggressively' },
      { name: 'Ardelia', reason: 'Double sustain for the hardest content' },
      { name: 'Akekuri', reason: 'Melee DPS benefits most from tank aggro draw' },
    ],
    partnerReason: 'Endministrator draws aggro so your DPS can focus on damage without worrying about dodging.',
    guide: {
      overview: `Endministrator is the first operator every player receives, and many immediately bench them for flashier 6-stars. This is a mistake. With proper investment, Endministrator becomes one of the most reliable tanks in the game, providing team-wide shields and consistent aggro generation that enables your DPS to play at maximum efficiency.`,
      rotation: [
        'Open with Battle Skill to generate initial aggro and apply shield to self',
        'Use Elemental Skill to extend shield to nearby allies',
        'Maintain normal attack chains to keep aggro and build combo gauge',
        'Use Combo Skill when shield breaks for emergency re-application',
        'Ultimate for team-wide damage reduction in emergency situations',
      ],
      tips: [
        'WILL directly increases shield strength. Prioritize WILL above all other stats.',
        'Æthertech set provides both Poise and DEF, making Endministrator extremely tanky.',
        'Shield from Elemental Skill snapshots your current stats. Use after all buffs are active.',
      ],
      matchups: {
        good: [
          'All story content (reliable progression tank)',
          'Boss encounters (consistent aggro management)',
          'Content where team needs protection',
        ],
        bad: [
          'Speed trials (slot better used for DPS)',
          'Content with shield-piercing mechanics',
        ],
      },
      investment: 'Low',
      difficulty: 'Easy',
      changelog: [
        '2026-02-18: Added alternative equipment options',
        '2026-01-05: Initial guide publication',
      ],
    },
  },
];
