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
export const SAMPLE_BUILDS: Build[] = [];
/* all sample builds removed — community builds are user-generated via Create Build */
