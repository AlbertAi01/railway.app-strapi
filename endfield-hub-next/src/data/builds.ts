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

// ===== LIKES STORE (localStorage, deduplicated) =====
const LIKES_KEY = 'endfield-build-likes'; // { [buildId]: number } - like counts
const LIKED_KEY = 'endfield-build-liked'; // string[] - IDs user has liked

export function getBuildLikes(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(LIKES_KEY);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}

function saveBuildLikes(likes: Record<string, number>): void {
  localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
}

export function getLikedBuildIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LIKED_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function isBuildLiked(buildId: string): boolean {
  return getLikedBuildIds().includes(buildId);
}

export function toggleLikeBuild(buildId: string): { liked: boolean; count: number } {
  const likedIds = getLikedBuildIds();
  const likes = getBuildLikes();
  const currentCount = likes[buildId] || 0;
  const idx = likedIds.indexOf(buildId);

  if (idx >= 0) {
    // Unlike
    likedIds.splice(idx, 1);
    likes[buildId] = Math.max(0, currentCount - 1);
    localStorage.setItem(LIKED_KEY, JSON.stringify(likedIds));
    saveBuildLikes(likes);
    return { liked: false, count: likes[buildId] };
  } else {
    // Like
    likedIds.push(buildId);
    likes[buildId] = currentCount + 1;
    localStorage.setItem(LIKED_KEY, JSON.stringify(likedIds));
    saveBuildLikes(likes);
    return { liked: true, count: likes[buildId] };
  }
}

export function getBuildLikeCount(buildId: string): number {
  return getBuildLikes()[buildId] || 0;
}

// ===== VIEWS STORE (sessionStorage for dedup, localStorage for counts) =====
const VIEWS_KEY = 'endfield-build-views'; // { [buildId]: number } - view counts
const VIEWED_SESSION_KEY = 'endfield-build-viewed'; // sessionStorage: string[] - IDs viewed this session

export function getBuildViews(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(VIEWS_KEY);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}

function saveBuildViews(views: Record<string, number>): void {
  localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
}

/** Record a view for a build. Returns the new count. Only increments once per session. */
export function recordBuildView(buildId: string): number {
  if (typeof window === 'undefined') return 0;

  // Check if already viewed this session
  let viewedThisSession: string[] = [];
  try {
    const data = sessionStorage.getItem(VIEWED_SESSION_KEY);
    viewedThisSession = data ? JSON.parse(data) : [];
  } catch { /* ignore */ }

  const views = getBuildViews();

  if (!viewedThisSession.includes(buildId)) {
    viewedThisSession.push(buildId);
    sessionStorage.setItem(VIEWED_SESSION_KEY, JSON.stringify(viewedThisSession));
    views[buildId] = (views[buildId] || 0) + 1;
    saveBuildViews(views);
  }

  return views[buildId] || 0;
}

export function getBuildViewCount(buildId: string): number {
  return getBuildViews()[buildId] || 0;
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
  // --- Single Character Builds ---
  {
    id: 'sample-laevatain-hypercarry',
    name: 'Laevatain Hypercarry',
    type: 'single',
    characters: [{
      name: 'Laevatain',
      weapon: 'Forgeborn Scathe',
      equipmentPieces: [
        { pieceName: 'Hot Work Exoskeleton', setName: 'Hot Work', artificeLevel: 2 },
        { pieceName: 'Hot Work Gauntlets', setName: 'Hot Work', artificeLevel: 1 },
        { pieceName: 'Hot Work Pyrometer', setName: 'Hot Work', artificeLevel: 0 },
      ],
      equipment: 'Hot Work',
      role: 'Main DPS',
      statPriority: 'INT > AGI > STR > WILL',
      altWeapons: ['Umbral Torch', 'Thermite Cutter'],
      altEquipment: ['Bonekrusha', 'MI Security'],
      notes: 'Laevatain\'s Heat Assault kit scales incredibly well with Intellect. Forgeborn Scathe amplifies her Heat DMG and ultimate burst. Hot Work 3-piece grants +50% Heat DMG after applying Combustion.',
    }],
    tags: ['Late Game', 'Meta', 'DPS'],
    notes: 'Top-tier Heat DPS build. Excellent for boss content where you can maintain Combustion uptime.',
    shortDescription: 'Maximum Heat burst damage with Forgeborn Scathe and full Hot Work set. Best-in-slot for late game boss fights.',
    isPublic: true,
    likes: 247,
    views: 1893,
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now() - 86400000 * 3,
    author: 'TalosHunter',
    youtubeUrl: 'https://www.youtube.com/watch?v=xm3YgoEiEDc',
    guide: {
      overview: 'Laevatain is the premier Heat DPS in Arknights: Endfield. Her Assault kit combined with high base Intellect (178) makes her the go-to operator for any Heat-weak content.\n\nForgeborn Scathe is her signature weapon, providing Heat DMG +44.8% and a massive Basic Attack DMG buff after casting her ultimate. The Hot Work 3-piece set gives Arts Intensity +30 and a conditional Heat DMG +50% after applying Combustion.\n\nThis build focuses on maximizing her burst damage window during ultimate, where she becomes the highest single-target damage dealer in the game.',
      rotation: [
        'Open with Battle Skill to apply Combustion (activates Hot Work 3-piece)',
        'Use Combo Skill to build SP and maintain Combustion stacks',
        'Cast Ultimate during Combustion window for maximum Heat DMG multiplier',
        'Follow up with Basic Attacks (Forgeborn Scathe gives +210% Basic ATK DMG after ult)',
        'Repeat rotation — keep Combustion uptime above 80%',
      ],
      tips: [
        'Always apply Combustion before casting Ultimate to snapshot the Hot Work buff',
        'Forgeborn Scathe\'s Basic ATK DMG buff after ult lasts a limited time — don\'t waste it',
        'Pair with Ardelia or Gilberta for Nature support to enable Corrosion reactions',
        'INT substats are significantly more valuable than STR for Laevatain',
      ],
      matchups: { good: ['Cryo-weak bosses', 'Single-target DPS checks', 'Stagger-phase burn windows'], bad: ['Multi-target content', 'Bosses with Heat resistance', 'Content requiring sustained healing'] },
      investment: 'High',
      difficulty: 'Medium',
    },
    recommendedPartners: [
      { name: 'Ember', reason: 'Heat Defender with Vulnerable application synergizes with Laevatain\'s Heat DMG' },
      { name: 'Ardelia', reason: 'Nature Supporter for healing and buff uptime' },
      { name: 'Perlica', reason: 'Electric Caster for elemental reaction damage' },
    ],
    partnerReason: 'Ember provides Vulnerability stacking which amplifies Laevatain\'s already high damage. Ardelia keeps the team alive with Nature healing while buffing ATK. Perlica adds sub-DPS and enables cross-element reactions.',
  },
  {
    id: 'sample-chen-qianyu-counter',
    name: 'Chen Qianyu Counter Build',
    type: 'single',
    characters: [{
      name: 'Chen Qianyu',
      weapon: 'Rapid Ascent',
      equipmentPieces: [
        { pieceName: 'Swordmancer Heavy Armor', setName: 'Swordmancer', artificeLevel: 1 },
        { pieceName: 'Swordmancer TAC Fists', setName: 'Swordmancer', artificeLevel: 0 },
        { pieceName: 'Swordmancer Flint', setName: 'Swordmancer', artificeLevel: 0 },
      ],
      equipment: 'Swordmancer',
      role: 'Main DPS',
      statPriority: 'AGI > STR > INT > WILL',
      altWeapons: ['Sundering Steel', 'Contingent Measure'],
      altEquipment: ['Roving MSGR', 'MI Security'],
      notes: 'Chen Qianyu\'s exceptional Agility (172) makes her the fastest Physical Guard. Rapid Ascent gives Physical DMG +42% on battle skills/ultimates, with +98% against Staggered enemies.',
    }],
    tags: ['Late Game', 'Meta', 'DPS'],
    notes: 'Physical counter-attack specialist. Excels in content with frequent Stagger opportunities.',
    shortDescription: 'Agility-focused Physical Guard with devastating counter-attacks and Stagger exploitation via Rapid Ascent.',
    isPublic: true,
    likes: 183,
    views: 1241,
    createdAt: Date.now() - 86400000 * 21,
    updatedAt: Date.now() - 86400000 * 7,
    author: 'BladeWeaver',
    guide: {
      overview: 'Chen Qianyu is the fastest sword user in Endfield with 172 base Agility. Her Guard kit revolves around precise counter-timing and exploiting Stagger windows for massive Physical damage.\n\nRapid Ascent is her best weapon: battle skills and ultimates gain Physical DMG +42%, and against Staggered enemies they gain an additional DMG +98%. Combined with Swordmancer 3-piece (Stagger Efficiency +20%), she becomes the undisputed queen of Stagger-phase damage.',
      rotation: [
        'Use Battle Skill to apply Physical Status and build Stagger gauge',
        'Time Combo Skill counters against enemy attacks for bonus damage',
        'When enemy is Staggered, immediately cast Ultimate for huge burst',
        'Swordmancer 3-piece triggers extra Physical DMG hit on Physical Status application',
      ],
      tips: [
        'Rapid Ascent\'s +98% DMG against Staggered is additive — it\'s enormous',
        'Learn enemy attack patterns to maximize counter windows',
        'AGI substats directly increase her counter damage scaling',
      ],
      investment: 'Medium',
      difficulty: 'Hard',
    },
  },
  {
    id: 'sample-perlica-arts-dps',
    name: 'Perlica Electric Caster',
    type: 'single',
    characters: [{
      name: 'Perlica',
      weapon: 'Wild Wanderer',
      equipmentPieces: [
        { pieceName: 'Pulser Labs Disruptor Suit', setName: 'Pulser Labs', artificeLevel: 1 },
        { pieceName: 'Pulser Labs Gloves', setName: 'Pulser Labs', artificeLevel: 0 },
        { pieceName: 'Pulser Labs Calibrator', setName: 'Pulser Labs', artificeLevel: 0 },
      ],
      equipment: 'Pulser Labs',
      role: 'Main DPS',
      statPriority: 'INT > WILL > AGI > STR',
      altWeapons: ['Oblivion', 'Hypernova Auto'],
      altEquipment: ['Mordvolt Insulation', 'Tide Surge'],
      notes: 'Perlica channels sustained Electric damage through her Arts Unit. Pulser Labs 3-piece grants Electric DMG +50% after Electrification. Wild Wanderer adds team-wide Physical/Electric DMG buff.',
    }],
    tags: ['Late Game', 'DPS', 'F2P-Friendly'],
    notes: 'Strong 5-star Electric Caster build. Wild Wanderer is obtainable and Perlica is a common 5-star.',
    shortDescription: 'Sustained Electric Arts damage with Pulser Labs set. Great F2P option with Wild Wanderer weapon.',
    isPublic: true,
    likes: 156,
    views: 2104,
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 2,
    author: 'ElectricDreamer',
    guide: {
      overview: 'Perlica is one of the most accessible high-damage Casters in Endfield. With 162 base Intellect and an Electric Arts kit, she delivers consistent elemental damage that scales well into late game.\n\nWild Wanderer provides Electric DMG +34.7% and a team-wide Physical/Electric DMG buff when Electrification is applied. Pulser Labs 3-piece grants Arts Intensity +30 and Electric DMG +50% after Electrification — a massive conditional buff that Perlica triggers naturally.',
      tips: [
        'Wild Wanderer is a 5-star weapon — easier to obtain than 6-star alternatives',
        'Keep Electrification applied to maintain the Pulser Labs 50% Electric DMG buff',
        'Perlica benefits the whole team via Wild Wanderer\'s team-wide buff on Electrification',
        'If you have Oblivion, it\'s a strict upgrade for solo DPS but loses the team buff',
      ],
      investment: 'Low',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sample-ember-tank',
    name: 'Ember Immortal Tank',
    type: 'single',
    characters: [{
      name: 'Ember',
      weapon: 'Former Finery',
      equipmentPieces: [
        { pieceName: 'Æthertech Plating', setName: 'Æthertech', artificeLevel: 2 },
        { pieceName: 'Æthertech Gloves', setName: 'Æthertech', artificeLevel: 1 },
        { pieceName: 'Æthertech Stabilizer', setName: 'Æthertech', artificeLevel: 0 },
      ],
      equipment: 'Æthertech',
      role: 'Tank',
      statPriority: 'STR > WILL > AGI > INT',
      altWeapons: ['Thunderberge', 'Industry 0.1'],
      altEquipment: ['LYNX', 'Armored MSGR'],
      notes: 'Ember has the highest base Strength (176) among all operators. Former Finery provides Treatment Efficiency +28% and emergency healing on Protected allies. Æthertech amplifies Physical DMG through Vulnerability stacking.',
    }],
    tags: ['Late Game', 'Tank', 'Boss'],
    notes: 'Unkillable tank build with self-sustain. Keeps the team alive through Vulnerability application and combo healing.',
    shortDescription: 'Indestructible Heat Defender with self-healing through Former Finery and Æthertech Vulnerability stacking.',
    isPublic: true,
    likes: 198,
    views: 1567,
    createdAt: Date.now() - 86400000 * 18,
    updatedAt: Date.now() - 86400000 * 5,
    author: 'ShieldMaster',
    guide: {
      overview: 'Ember is the definitive tank in Endfield. With 176 Strength and the Defender class, she takes hits that would flatten anyone else.\n\nFormer Finery provides Treatment Efficiency +28% and automatically heals Protected allies when they take damage (once per 15s). Æthertech 3-piece gives ATK +8% and stacking Physical DMG bonuses through Vulnerability application — meaning Ember contributes meaningful damage while tanking.',
      investment: 'Medium',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sample-yvonne-cryo-sniper',
    name: 'Yvonne Cryo Sniper',
    type: 'single',
    characters: [{
      name: 'Yvonne',
      weapon: 'Artzy Tyrannical',
      equipmentPieces: [
        { pieceName: 'MI Security Overalls', setName: 'MI Security', artificeLevel: 1 },
        { pieceName: 'MI Security Hands PPE', setName: 'MI Security', artificeLevel: 0 },
        { pieceName: 'MI Security Toolkit', setName: 'MI Security', artificeLevel: 0 },
      ],
      equipment: 'MI Security',
      role: 'Main DPS',
      statPriority: 'INT > AGI > WILL > STR',
      altWeapons: ['Navigator', 'Wedge'],
      notes: 'Yvonne has the highest Intellect in the game (177). Artzy Tyrannical gives Cryo DMG +44.8% and stacking Cryo DMG on crits. MI Security adds Crit Rate +5% and ATK stacking on crits for a devastating crit-focused build.',
    }],
    tags: ['Late Game', 'Meta', 'DPS', 'Speedrun'],
    notes: 'Highest single-hit damage potential in the game. Crit-focused build that melts bosses with Cryo burst.',
    shortDescription: 'Crit-stacking Cryo Assault build with Artzy Tyrannical. Highest burst damage ceiling in the game.',
    isPublic: true,
    likes: 312,
    views: 2876,
    createdAt: Date.now() - 86400000 * 25,
    updatedAt: Date.now() - 86400000 * 1,
    author: 'FrostByte',
  },

  // --- Team Builds ---
  {
    id: 'sample-cryo-freeze-team',
    name: 'Cryo Freeze Team',
    type: 'team',
    characters: [
      {
        name: 'Yvonne',
        weapon: 'Navigator',
        equipmentPieces: [
          { pieceName: 'Tide Fall Light Armor', setName: 'Tide Surge', artificeLevel: 1 },
          { pieceName: 'Tide Surge Gauntlets', setName: 'Tide Surge', artificeLevel: 0 },
          { pieceName: 'Hanging River O2 Tube', setName: 'Tide Surge', artificeLevel: 0 },
        ],
        equipment: 'Tide Surge',
        role: 'Main DPS',
      },
      {
        name: 'Last Rite',
        weapon: 'Khravengger',
        equipmentPieces: [
          { pieceName: 'Bonekrusha Heavy Armor', setName: 'Bonekrusha', artificeLevel: 0 },
          { pieceName: 'Bonekrusha Figurine', setName: 'Bonekrusha', artificeLevel: 0 },
          { pieceName: 'Bonekrusha Mask', setName: 'Bonekrusha', artificeLevel: 0 },
        ],
        equipment: 'Bonekrusha',
        role: 'Sub-DPS',
      },
      {
        name: 'Xaihi',
        weapon: 'Monaihe',
        equipmentPieces: [
          { pieceName: 'Eternal Xiranite Armor', setName: 'Eternal Xiranite', artificeLevel: 0 },
          { pieceName: 'Eternal Xiranite Gloves', setName: 'Eternal Xiranite', artificeLevel: 0 },
          { pieceName: 'Eternal Xiranite Auxiliary Arm', setName: 'Eternal Xiranite', artificeLevel: 0 },
        ],
        equipment: 'Eternal Xiranite',
        role: 'Buffer',
      },
      {
        name: 'Snowshine',
        weapon: 'Finishing Call',
        equipmentPieces: [
          { pieceName: 'LYNX Cuirass', setName: 'LYNX', artificeLevel: 1 },
          { pieceName: 'LYNX Gauntlets', setName: 'LYNX', artificeLevel: 0 },
          { pieceName: 'LYNX Aegis Injector', setName: 'LYNX', artificeLevel: 0 },
        ],
        equipment: 'LYNX',
        role: 'Healer',
      },
    ],
    tags: ['Late Game', 'Meta', 'Boss'],
    notes: 'The strongest Cryo team composition. Yvonne and Last Rite provide overwhelming Cryo damage while Xaihi buffs and Snowshine heals.',
    shortDescription: 'Full Cryo team with Yvonne + Last Rite dual carry, Xaihi buffing, and Snowshine healing. Top-tier boss team.',
    isPublic: true,
    likes: 421,
    views: 3842,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 4,
    author: 'GlacialTide',
    youtubeUrl: 'https://www.youtube.com/watch?v=xm3YgoEiEDc',
    guide: {
      overview: 'This is the definitive Cryo team for late-game boss content. The core revolves around dual Cryo carries (Yvonne and Last Rite) who apply Solidification, which Xaihi amplifies through Eternal Xiranite\'s team DMG buff.\n\nYvonne uses Navigator for stacking Cryo/Nature DMG on Solidification application. Last Rite uses Khravengger for massive Cryo DMG after applying Cryo Infliction. Xaihi uses Monaihe for Arts Intensity and Ultimate Gain, enabling more frequent team buffs. Snowshine uses Finishing Call and LYNX set for reliable healing with DMG Reduction.',
      rotation: [
        'Xaihi: Cast Battle Skill to apply Amp/Protected (triggers Eternal Xiranite team DMG +16%)',
        'Yvonne: Battle Skill for Solidification application (triggers Navigator Cryo DMG)',
        'Last Rite: Battle Skill for Cryo Infliction (triggers Khravengger Cryo DMG +28%)',
        'Last Rite: Combo Skill on enemy with Cryo Infliction (Khravengger +56% Cryo DMG)',
        'Yvonne: Ultimate for burst Cryo damage during Solidification window',
        'Snowshine: Combo Skill for team healing (LYNX gives 15-30% DMG Reduction)',
      ],
      tips: [
        'Solidification and Cryo Infliction are separate statuses — both can be active',
        'Xaihi should cast skills before the DPS to ensure the Eternal Xiranite buff is up',
        'Snowshine\'s LYNX 3-piece gives 30% DMG Reduction if the heal overheals — keep team healthy',
        'This team struggles against Cryo-resistant content — swap to Heat team if needed',
      ],
      matchups: { good: ['Heat-element bosses', 'Single-target DPS checks', 'Bosses with long Stagger phases'], bad: ['Cryo-resistant enemies', 'Multi-wave content', 'Speed-clear farming'] },
      investment: 'High',
      difficulty: 'Medium',
    },
    recommendedPartners: [
      { name: 'Alesh', reason: 'Alternative Cryo Vanguard if you need more frontline pressure' },
      { name: 'Estella', reason: 'Cryo Guard for additional Solidification uptime' },
    ],
    partnerReason: 'Both Alesh and Estella can substitute into the team if you need different roles covered while maintaining Cryo synergy.',
  },
  {
    id: 'sample-physical-rush',
    name: 'Physical Rush Comp',
    type: 'team',
    characters: [
      {
        name: 'Chen Qianyu',
        weapon: 'Rapid Ascent',
        equipment: 'Swordmancer',
        role: 'Main DPS',
      },
      {
        name: 'Lifeng',
        weapon: 'Valiant',
        equipment: 'Type 50 Yinglung',
        role: 'Sub-DPS',
      },
      {
        name: 'Endministrator',
        weapon: 'Never Rest',
        equipment: 'Frontiers',
        role: 'Buffer',
      },
      {
        name: 'Pogranichnik',
        weapon: 'Eminent Repute',
        equipment: 'Æthertech',
        role: 'Tank',
      },
    ],
    tags: ['Late Game', 'DPS', 'Speedrun'],
    notes: 'All-Physical team focused on Stagger exploitation and Vulnerability stacking. Very fast clear times on Physical-weak content.',
    shortDescription: 'All-Physical speedrun team. Stack Vulnerability, break Stagger gauge, then burst with Chen Qianyu and Lifeng.',
    isPublic: true,
    likes: 189,
    views: 1534,
    createdAt: Date.now() - 86400000 * 12,
    updatedAt: Date.now() - 86400000 * 6,
    author: 'PhysBrute',
    guide: {
      overview: 'A hyper-aggressive all-Physical team that aims to break the enemy\'s Stagger gauge as fast as possible, then annihilate them during the Stagger window.\n\nChen Qianyu is the main carry with Rapid Ascent giving +98% DMG against Staggered enemies. Lifeng provides sustained Physical damage with Valiant\'s bonus Physical DMG hit on Physical Status application. Endministrator uses Never Rest for team-wide Physical DMG buffs on SP recovery. Pogranichnik tanks and applies Vulnerability through Eminent Repute.',
      investment: 'Medium',
      difficulty: 'Medium',
    },
  },
  {
    id: 'sample-f2p-starter',
    name: 'F2P Starter Team',
    type: 'team',
    characters: [
      {
        name: 'Endministrator',
        weapon: 'Contingent Measure',
        equipment: 'Roving MSGR',
        role: 'Main DPS',
      },
      {
        name: 'Catcher',
        weapon: 'Industry 0.1',
        equipment: 'Armored MSGR',
        role: 'Tank',
      },
      {
        name: 'Antal',
        weapon: 'Hypernova Auto',
        equipment: 'Mordvolt Insulation',
        role: 'Buffer',
      },
      {
        name: 'Estella',
        weapon: "Pathfinder's Beacon",
        equipment: 'AIC Heavy',
        role: 'Sub-DPS',
      },
    ],
    tags: ['Early Game', 'F2P-Friendly', 'Fun'],
    notes: 'A solid team using guaranteed/free operators and 4-star weapons. Clears all early and mid-game content comfortably.',
    shortDescription: 'Budget-friendly team using free operators and 4-star weapons. Perfect for new players clearing story content.',
    isPublic: true,
    likes: 534,
    views: 5231,
    createdAt: Date.now() - 86400000 * 45,
    updatedAt: Date.now() - 86400000 * 8,
    author: 'NewPlayerGuide',
    guide: {
      overview: 'This team is designed for new players who haven\'t pulled many 5-star or 6-star operators/weapons yet. All characters listed are guaranteed through gameplay or are common 4-star pulls.\n\nEndministrator is free and a solid Physical Guard. Catcher is a common 4-star Defender. Antal provides Electric Support buffs. Estella adds Cryo sub-DPS with her polearm.\n\nAll weapons are 4-star or lower, which are much easier to obtain and level. The gear sets are mid-game obtainable (Roving MSGR, Armored MSGR, Mordvolt Insulation, AIC Heavy).',
      tips: [
        'Focus on leveling Endministrator first — they\'re your main damage dealer',
        'Catcher should always be the controlled operator to absorb hits',
        'Antal\'s buffs are very strong even at low investment',
        'Replace with higher-rarity operators as you pull them — this is a starting point',
      ],
      investment: 'Low',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sample-elemental-reaction',
    name: 'Elemental Reaction Team',
    type: 'team',
    characters: [
      {
        name: 'Laevatain',
        weapon: 'Umbral Torch',
        equipment: 'Hot Work',
        role: 'Main DPS',
      },
      {
        name: 'Avywenna',
        weapon: 'Cohesive Traction',
        equipment: 'Frontiers',
        role: 'Sub-DPS',
      },
      {
        name: 'Gilberta',
        weapon: 'Opus: Etch Figure',
        equipment: 'Eternal Xiranite',
        role: 'Buffer',
      },
      {
        name: 'Arclight',
        weapon: 'White Night Nova',
        equipment: 'MI Security',
        role: 'Sub-DPS',
      },
    ],
    tags: ['Late Game', 'Off-Meta', 'Fun'],
    notes: 'Multi-element team that chains Combustion, Electrification, and Nature reactions for massive combo damage. Not meta but incredibly satisfying when it works.',
    shortDescription: 'Chain Heat/Electric/Nature reactions for explosive combo damage. High skill ceiling, high reward gameplay.',
    isPublic: true,
    likes: 167,
    views: 1298,
    createdAt: Date.now() - 86400000 * 8,
    updatedAt: Date.now() - 86400000 * 2,
    author: 'ReactionKing',
    guide: {
      overview: 'This team focuses on chaining elemental reactions rather than raw single-element damage. Laevatain applies Combustion, Avywenna applies Electrification, Gilberta applies Nature effects, and Arclight bridges Heat/Electric with White Night Nova.\n\nThe key is that Umbral Torch gains stacking Heat/Nature DMG whenever Combustion or Corrosion is applied to enemies, and Cohesive Traction gives stacking Electric DMG on combo skill usage. Opus: Etch Figure gives team-wide Arts DMG on Nature Infliction.',
      rotation: [
        'Gilberta: Battle Skill for Nature Infliction (Opus: Etch Figure team Arts DMG buff)',
        'Laevatain: Battle Skill for Combustion (Umbral Torch Heat/Nature DMG stacks)',
        'Avywenna: Combo Skill for Electrification (Cohesive Traction Electric DMG stacks)',
        'Arclight: Battle Skill for additional Electrification/Combustion (White Night Nova Arts DMG + Arts Intensity)',
        'Chain ultimates during overlapping reaction windows for maximum burst',
      ],
      investment: 'High',
      difficulty: 'Hard',
    },
    recommendedPartners: [
      { name: 'Wulfgard', reason: 'Alternative Heat Caster if you want more burn application' },
      { name: 'Ardelia', reason: 'Can replace Gilberta for more healing-focused Nature support' },
    ],
  },
  {
    id: 'sample-xaihi-support',
    name: 'Xaihi Cryo Support',
    type: 'single',
    characters: [{
      name: 'Xaihi',
      weapon: 'Freedom to Proselytize',
      equipmentPieces: [
        { pieceName: 'LYNX Cuirass', setName: 'LYNX', artificeLevel: 1 },
        { pieceName: 'LYNX Gauntlets', setName: 'LYNX', artificeLevel: 0 },
        { pieceName: 'LYNX Slab', setName: 'LYNX', artificeLevel: 0 },
      ],
      equipment: 'LYNX',
      role: 'Healer',
      statPriority: 'WILL > INT > STR > AGI',
      altWeapons: ['Monaihe', 'OBJ Arts Identifier'],
      altEquipment: ['Eternal Xiranite', 'Mordvolt Resistant'],
      notes: 'Xaihi has the highest Will (150) among all 5-star operators. Freedom to Proselytize gives Treatment Efficiency +37.1% and bonus healing to the controlled operator. LYNX 3-piece adds Treatment Efficiency +20% and DMG Reduction on healed allies.',
    }],
    tags: ['Mid Game', 'Healer', 'Support'],
    notes: 'Best-in-slot support build for keeping your team alive. Works in every team composition.',
    shortDescription: 'Maximum healing output Cryo Supporter. LYNX set with Freedom to Proselytize for unmatched team sustain.',
    isPublic: true,
    likes: 276,
    views: 2187,
    createdAt: Date.now() - 86400000 * 16,
    updatedAt: Date.now() - 86400000 * 3,
    author: 'HealBot9000',
    guide: {
      overview: 'Xaihi is the premier dedicated healer in Endfield. With 150 base Will and a Cryo Supporter kit focused on shields and healing, she keeps any team alive through the hardest content.\n\nFreedom to Proselytize is her best weapon for pure healing: Treatment Efficiency +37.1% plus bonus healing to the controlled operator every 15s. LYNX 3-piece adds another +20% Treatment Efficiency and grants 15-30% DMG Reduction to healed allies.',
      tips: [
        'WILL substats are your priority — they directly scale healing output',
        'The LYNX 30% DMG Reduction triggers when healing overheals — keep allies topped off',
        'Freedom to Proselytize\'s bonus heal targets the controlled operator specifically',
        'Swap to Eternal Xiranite if the team needs more DMG rather than pure survival',
      ],
      investment: 'Low',
      difficulty: 'Easy',
    },
  },
];
