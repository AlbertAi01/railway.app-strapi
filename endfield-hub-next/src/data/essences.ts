// Weapon essence stat data from EndfieldTools.dev game database
// Probability engine reverse-engineered from endfieldtools.dev v1.9.3 source
// Each weapon has 3 essence stat slots: Primary Attribute, Secondary Stat, Skill Stat
// A "perfect" essence matches all 3 stats for a given weapon.
//
// Essence Level Scaling data verified against endfield.wiki.gg
// Cross-referenced: Grand Vision, Thunderberge, Wave Tide, Aggeloslayer
// Pattern: Linear 1-8 with ~1.5x increment jump at rank 9

export type PrimaryAttr = 'Strength Boost' | 'Agility Boost' | 'Will Boost' | 'Intellect Boost' | 'Main Attribute Boost';
export type SecondaryStat =
  | 'Attack Boost' | 'HP Boost' | 'Physical DMG Boost' | 'Heat DMG Boost'
  | 'Electric DMG Boost' | 'Cryo DMG Boost' | 'Nature DMG Boost'
  | 'Critical Rate Boost' | 'Arts Intensity Boost' | 'Ultimate Gain Boost'
  | 'Arts DMG Boost' | 'Treatment Efficiency Boost';
export type SkillStat =
  | 'Assault' | 'Suppression' | 'Pursuit' | 'Crusher' | 'Inspiring'
  | 'Combative' | 'Brutality' | 'Infliction' | 'Medicant' | 'Fracture'
  | 'Detonate' | 'Twilight' | 'Flow' | 'Efficacy';

// ──────────── Essence Level Scaling (Lv.1–9) ────────────
// Tier suffixes: [L] = 6-star, [M] = 5-star, [S] = 4-star, [XS] = 3-star
// Values verified from wiki individual weapon pages; [M] tier interpolated from [L] and [S]

export type EssenceTier = 'L' | 'M' | 'S' | 'XS';

export function getEssenceTier(rarity: number): EssenceTier {
  if (rarity >= 6) return 'L';
  if (rarity === 5) return 'M';
  if (rarity === 4) return 'S';
  return 'XS';
}

export function getEssenceTierLabel(rarity: number): string {
  const tier = getEssenceTier(rarity);
  return { L: 'L', M: 'M', S: 'S', XS: 'XS' }[tier];
}

// Primary Attribute scaling (flat values): STR/AGI/INT/WIL/Main Attr
// Source: [L] from Grand Vision/Thunderberge, [S] from Wave Tide/Aggeloslayer
export const PRIMARY_ATTR_SCALING: Record<EssenceTier, number[]> = {
  L:  [20, 36, 52, 68, 84, 100, 116, 132, 156],  // +16/lv, +24 at rank 9
  M:  [16, 29, 42, 54, 67, 80, 93, 106, 124],     // interpolated ~0.8x of L
  S:  [12, 21, 31, 40, 50, 60, 69, 79, 93],        // +~9.5/lv, +14 at rank 9
  XS: [10, 17, 25, 33, 41, 49, 57, 65, 79],        // 3-star: ~0.85x of S
};

// Secondary stat scaling — percentage-based stats
// Attack Boost: [L] from Grand Vision, [S] from Wave Tide
export const SECONDARY_SCALING_ATK: Record<EssenceTier, number[]> = {
  L:  [5.0, 9.0, 13.0, 17.0, 21.0, 25.0, 29.0, 33.0, 39.0],
  M:  [4.0, 7.2, 10.4, 13.6, 16.8, 20.0, 23.2, 26.4, 31.2],
  S:  [3.0, 5.4, 7.8, 10.2, 12.6, 15.0, 17.4, 19.8, 23.4],
  XS: [2.5, 4.5, 6.5, 8.5, 10.5, 12.5, 14.5, 16.5, 19.5],
};

// HP Boost: [L] from Thunderberge
export const SECONDARY_SCALING_HP: Record<EssenceTier, number[]> = {
  L:  [10.0, 18.0, 26.0, 34.0, 42.0, 50.0, 58.0, 66.0, 78.0],
  M:  [8.0, 14.4, 20.8, 27.2, 33.6, 40.0, 46.4, 52.8, 62.4],
  S:  [6.0, 10.8, 15.6, 20.4, 25.2, 30.0, 34.8, 39.6, 46.8],
  XS: [5.0, 9.0, 13.0, 17.0, 21.0, 25.0, 29.0, 33.0, 39.0],
};

// Elemental/Physical/Arts DMG Boost (all element types share the same scaling)
export const SECONDARY_SCALING_DMG: Record<EssenceTier, number[]> = {
  L:  [5.56, 10.0, 14.44, 18.89, 23.33, 27.78, 32.22, 36.67, 43.3],
  M:  [4.44, 8.0, 11.56, 15.11, 18.67, 22.22, 25.78, 29.33, 34.7],
  S:  [3.33, 6.0, 8.67, 11.33, 14.0, 16.67, 19.33, 22.0, 26.0],
  XS: [2.78, 5.0, 7.22, 9.44, 11.67, 13.89, 16.11, 18.33, 21.7],
};

// Critical Rate Boost
export const SECONDARY_SCALING_CRIT: Record<EssenceTier, number[]> = {
  L:  [2.5, 4.5, 6.5, 8.5, 10.5, 12.5, 14.5, 16.5, 19.5],
  M:  [2.0, 3.6, 5.2, 6.8, 8.4, 10.0, 11.6, 13.2, 15.6],
  S:  [1.5, 2.7, 3.9, 5.1, 6.3, 7.5, 8.7, 9.9, 11.7],
  XS: [1.25, 2.25, 3.25, 4.25, 5.25, 6.25, 7.25, 8.25, 9.75],
};

// Arts Intensity (flat, not percentage)
export const SECONDARY_SCALING_ARTS_INT: Record<EssenceTier, number[]> = {
  L:  [30, 36, 42, 48, 54, 60, 66, 72, 84],
  M:  [24, 29, 34, 38, 43, 48, 53, 58, 67],
  S:  [18, 22, 25, 29, 32, 36, 40, 43, 50],
  XS: [15, 18, 21, 24, 27, 30, 33, 36, 42],
};

// Ultimate Gain Boost (percentage)
export const SECONDARY_SCALING_ULT_GAIN: Record<EssenceTier, number[]> = {
  L:  [5.95, 10.71, 15.47, 20.24, 25.0, 29.76, 34.52, 39.29, 46.4],
  M:  [4.76, 8.57, 12.38, 16.19, 20.0, 23.81, 27.62, 31.43, 37.1],
  S:  [3.57, 6.43, 9.29, 12.14, 15.0, 17.86, 20.71, 23.57, 27.8],
  XS: [2.98, 5.36, 7.74, 10.12, 12.5, 14.88, 17.26, 19.64, 23.2],
};

// Treatment Efficiency Boost (percentage)
export const SECONDARY_SCALING_HEAL: Record<EssenceTier, number[]> = {
  L:  [5.95, 10.71, 15.47, 20.24, 25.0, 29.76, 34.52, 39.29, 46.4],
  M:  [4.76, 8.57, 12.38, 16.19, 20.0, 23.81, 27.62, 31.43, 37.1],
  S:  [3.57, 6.43, 9.29, 12.14, 15.0, 17.86, 20.71, 23.57, 27.8],
  XS: [2.98, 5.36, 7.74, 10.12, 12.5, 14.88, 17.26, 19.64, 23.2],
};

/** Get the scaling array for a secondary stat at a given weapon rarity */
export function getSecondaryScaling(stat: SecondaryStat, rarity: number): number[] {
  const tier = getEssenceTier(rarity);
  switch (stat) {
    case 'Attack Boost': return SECONDARY_SCALING_ATK[tier];
    case 'HP Boost': return SECONDARY_SCALING_HP[tier];
    case 'Physical DMG Boost':
    case 'Heat DMG Boost':
    case 'Electric DMG Boost':
    case 'Cryo DMG Boost':
    case 'Nature DMG Boost':
    case 'Arts DMG Boost':
      return SECONDARY_SCALING_DMG[tier];
    case 'Critical Rate Boost': return SECONDARY_SCALING_CRIT[tier];
    case 'Arts Intensity Boost': return SECONDARY_SCALING_ARTS_INT[tier];
    case 'Ultimate Gain Boost': return SECONDARY_SCALING_ULT_GAIN[tier];
    case 'Treatment Efficiency Boost': return SECONDARY_SCALING_HEAL[tier];
  }
}

/** Get stat value at a specific essence level (1-9) */
export function getEssenceStatValue(stat: PrimaryAttr | SecondaryStat, rarity: number, level: number): number {
  const idx = Math.max(0, Math.min(8, level - 1));
  const tier = getEssenceTier(rarity);
  // Primary attributes all use the same flat scaling
  if (stat === 'Strength Boost' || stat === 'Agility Boost' || stat === 'Will Boost'
    || stat === 'Intellect Boost' || stat === 'Main Attribute Boost') {
    return PRIMARY_ATTR_SCALING[tier][idx];
  }
  return getSecondaryScaling(stat as SecondaryStat, rarity)[idx];
}

/** Check if a secondary stat is percentage-based (vs flat) */
export function isPercentageStat(stat: SecondaryStat): boolean {
  return stat !== 'Arts Intensity Boost';
}

/** Format stat value for display (e.g., "+39%" or "+156") */
export function formatEssenceValue(stat: PrimaryAttr | SecondaryStat, rarity: number, level: number): string {
  const value = getEssenceStatValue(stat, rarity, level);
  if (stat === 'Strength Boost' || stat === 'Agility Boost' || stat === 'Will Boost'
    || stat === 'Intellect Boost' || stat === 'Main Attribute Boost' || stat === 'Arts Intensity Boost') {
    return `+${Math.round(value)}`;
  }
  // Round to 1 decimal for percentages
  return `+${Math.round(value * 10) / 10}%`;
}

/** Get the display name for an essence slot, including the weapon-specific skill name */
export function getEssenceSlotDisplayName(
  slotIndex: number,
  weaponName: string,
  essence: WeaponEssence | undefined,
  rarity: number
): string {
  if (!essence) return `Slot ${slotIndex + 1}`;
  const tierLabel = getEssenceTierLabel(rarity);
  if (slotIndex === 0) {
    return `${essence.primaryAttr} [${tierLabel}]`;
  } else if (slotIndex === 1 && essence.secondaryStat) {
    return `${essence.secondaryStat} [${tierLabel}]`;
  } else if (slotIndex === 2 || (slotIndex === 1 && !essence.secondaryStat)) {
    // Weapon skill slot — use the weapon's SkillName from WEAPON_DATA
    // Import would be circular, so we pass it through or use the essence skillStat prefix
    return `${essence.skillStat}: ${weaponName}`;
  }
  return `Slot ${slotIndex + 1}`;
}

export interface WeaponEssence {
  name: string;
  rarity: number;
  type: string;
  primaryAttr: PrimaryAttr;
  secondaryStat: SecondaryStat | null;
  skillStat: SkillStat;
}

export const PRIMARY_ATTRS: PrimaryAttr[] = ['Agility Boost', 'Strength Boost', 'Will Boost', 'Intellect Boost', 'Main Attribute Boost'];

export const SECONDARY_STATS: SecondaryStat[] = [
  'Attack Boost', 'HP Boost', 'Physical DMG Boost', 'Heat DMG Boost',
  'Electric DMG Boost', 'Cryo DMG Boost', 'Nature DMG Boost',
  'Critical Rate Boost', 'Arts Intensity Boost', 'Ultimate Gain Boost',
  'Arts DMG Boost', 'Treatment Efficiency Boost',
];

export const SKILL_STATS: SkillStat[] = [
  'Assault', 'Suppression', 'Pursuit', 'Crusher', 'Inspiring',
  'Combative', 'Brutality', 'Infliction', 'Medicant', 'Fracture',
  'Detonate', 'Twilight', 'Flow', 'Efficacy',
];

// All weapons with their 3 essence stat slots (from EndfieldTools.dev localdb)
export const WEAPON_ESSENCES: WeaponEssence[] = [
  // 6-star Greatswords
  { name: 'Exemplar', rarity: 6, type: 'Greatsword', primaryAttr: 'Main Attribute Boost', secondaryStat: 'Attack Boost', skillStat: 'Suppression' },
  { name: 'Former Finery', rarity: 6, type: 'Greatsword', primaryAttr: 'Will Boost', secondaryStat: 'HP Boost', skillStat: 'Combative' },
  { name: 'Thunderberge', rarity: 6, type: 'Greatsword', primaryAttr: 'Strength Boost', secondaryStat: 'HP Boost', skillStat: 'Medicant' },
  { name: 'Sundered Prince', rarity: 6, type: 'Greatsword', primaryAttr: 'Strength Boost', secondaryStat: 'Critical Rate Boost', skillStat: 'Crusher' },
  { name: 'Khravengger', rarity: 6, type: 'Greatsword', primaryAttr: 'Strength Boost', secondaryStat: 'Attack Boost', skillStat: 'Brutality' },
  // 6-star Arts Units
  { name: 'Opus: Etch Figure', rarity: 6, type: 'Arts Unit', primaryAttr: 'Will Boost', secondaryStat: 'Nature DMG Boost', skillStat: 'Suppression' },
  { name: 'Detonation Unit', rarity: 6, type: 'Arts Unit', primaryAttr: 'Main Attribute Boost', secondaryStat: 'Arts Intensity Boost', skillStat: 'Brutality' },
  { name: 'Oblivion', rarity: 6, type: 'Arts Unit', primaryAttr: 'Intellect Boost', secondaryStat: 'Arts DMG Boost', skillStat: 'Twilight' },
  { name: 'Chivalric Virtues', rarity: 6, type: 'Arts Unit', primaryAttr: 'Will Boost', secondaryStat: 'HP Boost', skillStat: 'Medicant' },
  { name: 'Delivery Guaranteed', rarity: 6, type: 'Arts Unit', primaryAttr: 'Will Boost', secondaryStat: 'Ultimate Gain Boost', skillStat: 'Pursuit' },
  { name: 'Dreams of the Starry Beach', rarity: 6, type: 'Arts Unit', primaryAttr: 'Intellect Boost', secondaryStat: 'Treatment Efficiency Boost', skillStat: 'Infliction' },
  // 6-star Polearms
  { name: 'Valiant', rarity: 6, type: 'Polearm', primaryAttr: 'Agility Boost', secondaryStat: 'Physical DMG Boost', skillStat: 'Detonate' },
  { name: 'JET', rarity: 6, type: 'Polearm', primaryAttr: 'Main Attribute Boost', secondaryStat: 'Attack Boost', skillStat: 'Suppression' },
  { name: 'Mountain Bearer', rarity: 6, type: 'Polearm', primaryAttr: 'Agility Boost', secondaryStat: 'Physical DMG Boost', skillStat: 'Combative' },
  // 6-star Handcannons
  { name: 'Navigator', rarity: 6, type: 'Handcannon', primaryAttr: 'Intellect Boost', secondaryStat: 'Cryo DMG Boost', skillStat: 'Infliction' },
  { name: 'Wedge', rarity: 6, type: 'Handcannon', primaryAttr: 'Main Attribute Boost', secondaryStat: 'Critical Rate Boost', skillStat: 'Infliction' },
  { name: 'Clannibal', rarity: 6, type: 'Handcannon', primaryAttr: 'Main Attribute Boost', secondaryStat: 'Arts DMG Boost', skillStat: 'Infliction' },
  { name: 'Artzy Tyrannical', rarity: 6, type: 'Handcannon', primaryAttr: 'Intellect Boost', secondaryStat: 'Critical Rate Boost', skillStat: 'Fracture' },
  // 6-star Swords
  { name: 'Forgeborn Scathe', rarity: 6, type: 'Sword', primaryAttr: 'Intellect Boost', secondaryStat: 'Attack Boost', skillStat: 'Twilight' },
  { name: 'Umbral Torch', rarity: 6, type: 'Sword', primaryAttr: 'Intellect Boost', secondaryStat: 'Heat DMG Boost', skillStat: 'Infliction' },
  { name: 'Rapid Ascent', rarity: 6, type: 'Sword', primaryAttr: 'Main Attribute Boost', secondaryStat: 'Critical Rate Boost', skillStat: 'Twilight' },
  { name: 'Thermite Cutter', rarity: 6, type: 'Sword', primaryAttr: 'Will Boost', secondaryStat: 'Attack Boost', skillStat: 'Flow' },
  { name: 'Eminent Repute', rarity: 6, type: 'Sword', primaryAttr: 'Main Attribute Boost', secondaryStat: 'Physical DMG Boost', skillStat: 'Efficacy' },
  { name: 'White Night Nova', rarity: 6, type: 'Sword', primaryAttr: 'Main Attribute Boost', secondaryStat: 'Arts Intensity Boost', skillStat: 'Infliction' },
  { name: 'Never Rest', rarity: 6, type: 'Sword', primaryAttr: 'Will Boost', secondaryStat: 'Attack Boost', skillStat: 'Flow' },
  { name: 'Grand Vision', rarity: 6, type: 'Sword', primaryAttr: 'Agility Boost', secondaryStat: 'Attack Boost', skillStat: 'Infliction' },
  // 5-star
  { name: 'Seeker of Dark Lung', rarity: 5, type: 'Greatsword', primaryAttr: 'Strength Boost', secondaryStat: 'Ultimate Gain Boost', skillStat: 'Brutality' },
  { name: 'Finishing Call', rarity: 5, type: 'Greatsword', primaryAttr: 'Strength Boost', secondaryStat: 'HP Boost', skillStat: 'Medicant' },
  { name: 'Ancient Canal', rarity: 5, type: 'Greatsword', primaryAttr: 'Strength Boost', secondaryStat: 'Arts Intensity Boost', skillStat: 'Efficacy' },
  { name: 'OBJ Heavy Burden', rarity: 5, type: 'Greatsword', primaryAttr: 'Strength Boost', secondaryStat: 'HP Boost', skillStat: 'Combative' },
  { name: 'Wild Wanderer', rarity: 5, type: 'Arts Unit', primaryAttr: 'Intellect Boost', secondaryStat: 'Electric DMG Boost', skillStat: 'Infliction' },
  { name: 'Stanza of Memorials', rarity: 5, type: 'Arts Unit', primaryAttr: 'Intellect Boost', secondaryStat: 'Attack Boost', skillStat: 'Twilight' },
  { name: 'Monaihe', rarity: 5, type: 'Arts Unit', primaryAttr: 'Will Boost', secondaryStat: 'Ultimate Gain Boost', skillStat: 'Inspiring' },
  { name: 'Freedom to Proselytize', rarity: 5, type: 'Arts Unit', primaryAttr: 'Will Boost', secondaryStat: 'Treatment Efficiency Boost', skillStat: 'Medicant' },
  { name: 'OBJ Arts Identifier', rarity: 5, type: 'Arts Unit', primaryAttr: 'Intellect Boost', secondaryStat: 'Arts Intensity Boost', skillStat: 'Pursuit' },
  { name: 'Chimeric Justice', rarity: 5, type: 'Polearm', primaryAttr: 'Strength Boost', secondaryStat: 'Ultimate Gain Boost', skillStat: 'Efficacy' },
  { name: 'Cohesive Traction', rarity: 5, type: 'Polearm', primaryAttr: 'Will Boost', secondaryStat: 'Electric DMG Boost', skillStat: 'Suppression' },
  { name: 'OBJ Razorhorn', rarity: 5, type: 'Polearm', primaryAttr: 'Will Boost', secondaryStat: 'Physical DMG Boost', skillStat: 'Infliction' },
  { name: 'Rational Farewell', rarity: 5, type: 'Handcannon', primaryAttr: 'Strength Boost', secondaryStat: 'Heat DMG Boost', skillStat: 'Pursuit' },
  { name: 'Opus: The Living', rarity: 5, type: 'Handcannon', primaryAttr: 'Agility Boost', secondaryStat: 'Arts DMG Boost', skillStat: 'Infliction' },
  { name: 'OBJ Velocitous', rarity: 5, type: 'Handcannon', primaryAttr: 'Agility Boost', secondaryStat: 'Ultimate Gain Boost', skillStat: 'Brutality' },
  { name: 'Sundering Steel', rarity: 5, type: 'Sword', primaryAttr: 'Agility Boost', secondaryStat: 'Physical DMG Boost', skillStat: 'Detonate' },
  { name: 'Fortmaker', rarity: 5, type: 'Sword', primaryAttr: 'Intellect Boost', secondaryStat: 'Ultimate Gain Boost', skillStat: 'Inspiring' },
  { name: 'Aspirant', rarity: 5, type: 'Sword', primaryAttr: 'Agility Boost', secondaryStat: 'Physical DMG Boost', skillStat: 'Twilight' },
  { name: 'Twelve Questions', rarity: 5, type: 'Sword', primaryAttr: 'Agility Boost', secondaryStat: 'Attack Boost', skillStat: 'Infliction' },
  { name: 'OBJ Edge of Lightness', rarity: 5, type: 'Sword', primaryAttr: 'Agility Boost', secondaryStat: 'Attack Boost', skillStat: 'Flow' },
  { name: 'Finchaser 3.0', rarity: 5, type: 'Sword', primaryAttr: 'Strength Boost', secondaryStat: 'Cryo DMG Boost', skillStat: 'Suppression' },
  // 4-star
  { name: 'Industry 0.1', rarity: 4, type: 'Greatsword', primaryAttr: 'Strength Boost', secondaryStat: 'Attack Boost', skillStat: 'Suppression' },
  { name: 'Quencher', rarity: 4, type: 'Greatsword', primaryAttr: 'Will Boost', secondaryStat: 'HP Boost', skillStat: 'Crusher' },
  { name: 'Hypernova Auto', rarity: 4, type: 'Arts Unit', primaryAttr: 'Intellect Boost', secondaryStat: 'Arts DMG Boost', skillStat: 'Inspiring' },
  { name: 'Fluorescent Roc', rarity: 4, type: 'Arts Unit', primaryAttr: 'Will Boost', secondaryStat: 'Attack Boost', skillStat: 'Suppression' },
  { name: "Pathfinder's Beacon", rarity: 4, type: 'Polearm', primaryAttr: 'Agility Boost', secondaryStat: 'Attack Boost', skillStat: 'Inspiring' },
  { name: 'Aggeloslayer', rarity: 4, type: 'Polearm', primaryAttr: 'Will Boost', secondaryStat: 'Arts DMG Boost', skillStat: 'Suppression' },
  { name: 'Howling Guard', rarity: 4, type: 'Handcannon', primaryAttr: 'Intellect Boost', secondaryStat: 'Attack Boost', skillStat: 'Suppression' },
  { name: 'Long Road', rarity: 4, type: 'Handcannon', primaryAttr: 'Strength Boost', secondaryStat: 'Arts DMG Boost', skillStat: 'Pursuit' },
  { name: 'Contingent Measure', rarity: 4, type: 'Sword', primaryAttr: 'Agility Boost', secondaryStat: 'Physical DMG Boost', skillStat: 'Suppression' },
  { name: 'Wave Tide', rarity: 4, type: 'Sword', primaryAttr: 'Intellect Boost', secondaryStat: 'Attack Boost', skillStat: 'Pursuit' },
  // 3-star (no secondary stat)
  { name: 'Darhoff 7', rarity: 3, type: 'Greatsword', primaryAttr: 'Main Attribute Boost', secondaryStat: null, skillStat: 'Assault' },
  { name: 'Jiminy 12', rarity: 3, type: 'Arts Unit', primaryAttr: 'Main Attribute Boost', secondaryStat: null, skillStat: 'Assault' },
  { name: 'Opero 77', rarity: 3, type: 'Polearm', primaryAttr: 'Main Attribute Boost', secondaryStat: null, skillStat: 'Assault' },
  { name: 'Peco 5', rarity: 3, type: 'Handcannon', primaryAttr: 'Main Attribute Boost', secondaryStat: null, skillStat: 'Assault' },
  { name: 'Tarr 11', rarity: 3, type: 'Sword', primaryAttr: 'Main Attribute Boost', secondaryStat: null, skillStat: 'Assault' },
];

// Farming zones (Severe Energy Alluvium) - verified against EndfieldTools.dev v1.9.3
export interface FarmingZone {
  id: string;
  name: string;
  region: string;
  enemy: string;
  secondaryStats: SecondaryStat[];
  skillStats: SkillStat[];
}

export const FARMING_ZONES: FarmingZone[] = [
  {
    id: 'hub',
    name: 'The Hub',
    region: 'Valley IV',
    enemy: 'Bonekrusher Arsonist',
    secondaryStats: ['Attack Boost', 'Heat DMG Boost', 'Electric DMG Boost', 'Cryo DMG Boost', 'Arts Intensity Boost', 'Ultimate Gain Boost', 'Arts DMG Boost'],
    skillStats: ['Suppression', 'Pursuit', 'Crusher', 'Combative', 'Brutality', 'Detonate', 'Flow', 'Assault'],
  },
  {
    id: 'science-park',
    name: 'Originium Science Park',
    region: 'Valley IV',
    enemy: 'Spinojaw',
    secondaryStats: ['Attack Boost', 'Physical DMG Boost', 'Electric DMG Boost', 'Cryo DMG Boost', 'Critical Rate Boost', 'Ultimate Gain Boost', 'Arts DMG Boost'],
    skillStats: ['Suppression', 'Pursuit', 'Inspiring', 'Combative', 'Infliction', 'Medicant', 'Fracture', 'Detonate'],
  },
  {
    id: 'lodespring',
    name: 'Origin Lodespring',
    region: 'Valley IV',
    enemy: 'Heavy Sting \u03b1',
    secondaryStats: ['HP Boost', 'Physical DMG Boost', 'Heat DMG Boost', 'Cryo DMG Boost', 'Nature DMG Boost', 'Critical Rate Boost', 'Arts Intensity Boost', 'Treatment Efficiency Boost'],
    skillStats: ['Assault', 'Suppression', 'Combative', 'Brutality', 'Infliction', 'Detonate', 'Twilight', 'Efficacy'],
  },
  {
    id: 'power-plateau',
    name: 'Power Plateau',
    region: 'Valley IV',
    enemy: 'Bonekrusher Ballista',
    secondaryStats: ['Attack Boost', 'HP Boost', 'Physical DMG Boost', 'Heat DMG Boost', 'Nature DMG Boost', 'Critical Rate Boost', 'Arts Intensity Boost', 'Treatment Efficiency Boost'],
    skillStats: ['Pursuit', 'Crusher', 'Inspiring', 'Brutality', 'Infliction', 'Medicant', 'Fracture', 'Flow', 'Efficacy'],
  },
  {
    id: 'wuling',
    name: 'Wuling Outskirts',
    region: 'Jinlong',
    enemy: 'Cryoshell',
    secondaryStats: ['Attack Boost', 'HP Boost', 'Cryo DMG Boost', 'Critical Rate Boost', 'Ultimate Gain Boost', 'Arts DMG Boost'],
    skillStats: ['Crusher', 'Brutality', 'Medicant', 'Fracture', 'Twilight', 'Flow', 'Efficacy', 'Assault'],
  },
];

// =============================================
// PROBABILITY ENGINE (matches endfieldtools.dev)
// =============================================

// Match scoring for a single weapon against a zone
export type MatchLevel = 'perfect' | 'good' | 'partial' | 'none';

export interface WeaponZoneMatch {
  weapon: WeaponEssence;
  zone: FarmingZone;
  primaryMatch: boolean;
  secondaryMatch: boolean;
  skillMatch: boolean;
  matchCount: number;
  total: number;
  level: MatchLevel;
  details: { stat: string; matched: boolean; type: 'primary' | 'secondary' | 'skill' }[];
}

export function getWeaponZoneMatch(weapon: WeaponEssence, zone: FarmingZone): WeaponZoneMatch {
  const details: { stat: string; matched: boolean; type: 'primary' | 'secondary' | 'skill' }[] = [];

  // Primary attributes available in ALL zones (always 1/3 chance)
  details.push({ stat: weapon.primaryAttr, matched: true, type: 'primary' });

  const secondaryMatch = weapon.secondaryStat ? zone.secondaryStats.includes(weapon.secondaryStat) : true;
  if (weapon.secondaryStat) {
    details.push({ stat: weapon.secondaryStat, matched: secondaryMatch, type: 'secondary' });
  }

  const skillMatch = zone.skillStats.includes(weapon.skillStat);
  details.push({ stat: weapon.skillStat, matched: skillMatch, type: 'skill' });

  const total = details.length;
  const matchCount = details.filter(d => d.matched).length;

  let level: MatchLevel = 'none';
  if (matchCount === total) level = 'perfect';
  else if (matchCount >= 2) level = 'good';
  else if (matchCount >= 1) level = 'partial';

  return { weapon, zone, primaryMatch: true, secondaryMatch, skillMatch, matchCount, total, level, details };
}

// Pre-engrave configuration
export type FixedStatType = 'secondary' | 'skill';

export interface PreEngraveConfig {
  fixedStat: string;
  fixedStatType: FixedStatType;
  primaryAttrs: PrimaryAttr[];
}

// Probability breakdown for a single weapon at a zone
export interface DropChanceBreakdown {
  chance: number; // percentage (0-100)
  primaryChance: number;
  secondaryChance: number;
  skillChance: number;
}

// Calculate exact drop probability for a weapon at a zone with optional pre-engrave
// Formula: chance = primaryChance * secondaryChance * skillChance * 100
// Matches endfieldtools.dev's calculation exactly
export function calculateDropChance(
  weapon: WeaponEssence,
  zone: FarmingZone,
  preEngrave?: PreEngraveConfig | null
): DropChanceBreakdown {
  // Primary: always 1/3 (3 primary attribute slots, need the right one)
  const primaryChance = 1 / 3;

  let secondaryChance: number;
  let skillChance: number;

  if (preEngrave) {
    if (preEngrave.fixedStatType === 'skill') {
      // Skill stat is pre-engraved (fixed)
      // Skill chance: 1 if it matches the weapon's skill, 0 otherwise
      skillChance = weapon.skillStat === preEngrave.fixedStat ? 1 : 0;
      // Secondary must come from zone pool
      if (!weapon.secondaryStat) {
        secondaryChance = 1; // No secondary needed
      } else if (zone.secondaryStats.includes(weapon.secondaryStat)) {
        secondaryChance = 1 / zone.secondaryStats.length;
      } else {
        secondaryChance = 0; // Secondary not in zone
      }
    } else {
      // Secondary stat is pre-engraved (fixed)
      // Secondary chance: 1 if it matches, 0 otherwise
      secondaryChance = weapon.secondaryStat === preEngrave.fixedStat ? 1 : 0;
      // For weapons with no secondary: if fixed stat type is secondary but weapon has no secondary
      if (!weapon.secondaryStat) {
        secondaryChance = 0; // The pre-engrave doesn't help - weapon doesn't use secondary
      }
      // Skill must come from zone pool
      if (zone.skillStats.includes(weapon.skillStat)) {
        skillChance = 1 / zone.skillStats.length;
      } else {
        skillChance = 0; // Skill not in zone
      }
    }
  } else {
    // No pre-engrave - both random from zone pools
    if (!weapon.secondaryStat) {
      secondaryChance = 1; // No secondary needed
    } else if (zone.secondaryStats.includes(weapon.secondaryStat)) {
      secondaryChance = 1 / zone.secondaryStats.length;
    } else {
      secondaryChance = 0;
    }

    if (zone.skillStats.includes(weapon.skillStat)) {
      skillChance = 1 / zone.skillStats.length;
    } else {
      skillChance = 0;
    }
  }

  const chance = Math.round(primaryChance * secondaryChance * skillChance * 100 * 100) / 100;

  return { chance, primaryChance, secondaryChance, skillChance };
}

// Determine the optimal fixed stat for pre-engrave.
// Counts how many selected weapons share each potential fixed stat,
// picks the one that maximizes compatibility across all selected weapons.
export function computeOptimalPreEngrave(
  priorityWeapon: WeaponEssence,
  allWeapons: WeaponEssence[]
): PreEngraveConfig {
  const candidates: { stat: string; type: FixedStatType }[] = [];
  if (priorityWeapon.secondaryStat) {
    candidates.push({ stat: priorityWeapon.secondaryStat, type: 'secondary' });
  }
  candidates.push({ stat: priorityWeapon.skillStat, type: 'skill' });

  let bestCandidate = candidates[0];
  let bestScore = -1;

  for (const candidate of candidates) {
    let score = 0;
    for (const w of allWeapons) {
      if (candidate.type === 'secondary') {
        if (w.secondaryStat === candidate.stat) score += 10;
      } else {
        if (w.skillStat === candidate.stat) score += 10;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCandidate = candidate;
    }
  }

  const primarySet = new Set<PrimaryAttr>();
  for (const w of allWeapons) {
    primarySet.add(w.primaryAttr);
  }

  return {
    fixedStat: bestCandidate.stat,
    fixedStatType: bestCandidate.type,
    primaryAttrs: Array.from(primarySet),
  };
}

// Compute weapon compatibility label relative to a pre-engrave config
export function getWeaponLabel(
  weapon: WeaponEssence,
  config: PreEngraveConfig,
  isPriority: boolean
): 'Priority' | 'Perfect' | 'Average' {
  if (isPriority) return 'Priority';

  const hasFixedStat = config.fixedStatType === 'secondary'
    ? weapon.secondaryStat === config.fixedStat
    : weapon.skillStat === config.fixedStat;

  return hasFixedStat ? 'Perfect' : 'Average';
}

// Zone ranking with full probability data
export interface ZoneRanking {
  zone: FarmingZone;
  score: number;
  perfectCount: number;
  goodCount: number;
  partialCount: number;
  weaponMatches: WeaponZoneMatch[];
  priorityMatch: WeaponZoneMatch;
  weaponChances: Map<string, DropChanceBreakdown>;
}

// Rank zones using weighted scoring + actual probability calculations
export function rankZones(
  priorityWeapon: WeaponEssence,
  allWeapons: WeaponEssence[],
  config: PreEngraveConfig
): ZoneRanking[] {
  const rankings: ZoneRanking[] = [];

  for (const zone of FARMING_ZONES) {
    const priorityMatch = getWeaponZoneMatch(priorityWeapon, zone);

    // Check if the fixed stat is available in this zone
    const fixedStatAvailable = config.fixedStatType === 'secondary'
      ? zone.secondaryStats.includes(config.fixedStat as SecondaryStat)
      : zone.skillStats.includes(config.fixedStat as SkillStat);

    if (!fixedStatAvailable) continue;

    // For priority weapon, check if all non-fixed stats are also available
    let priorityCanBePerfect = true;
    if (config.fixedStatType === 'skill') {
      if (priorityWeapon.secondaryStat && !zone.secondaryStats.includes(priorityWeapon.secondaryStat)) {
        priorityCanBePerfect = false;
      }
    } else {
      if (!zone.skillStats.includes(priorityWeapon.skillStat)) {
        priorityCanBePerfect = false;
      }
    }

    if (!priorityCanBePerfect) continue;

    const weaponMatches = allWeapons.map(w => getWeaponZoneMatch(w, zone));
    const weaponChances = new Map<string, DropChanceBreakdown>();

    let score = 0;
    let perfectCount = 0;
    let goodCount = 0;
    let partialCount = 0;

    for (let i = 0; i < weaponMatches.length; i++) {
      const m = weaponMatches[i];
      const isPriority = m.weapon.name === priorityWeapon.name;
      const weight = isPriority ? 10 : 1;

      // Calculate actual probability for each weapon
      weaponChances.set(m.weapon.name, calculateDropChance(m.weapon, zone, config));

      if (m.level === 'perfect') {
        score += 3 * weight;
        perfectCount++;
      } else if (m.level === 'good') {
        score += 2 * weight;
        goodCount++;
      } else if (m.level === 'partial') {
        score += 0.5 * weight;
        partialCount++;
      }
    }

    rankings.push({
      zone,
      score,
      perfectCount,
      goodCount,
      partialCount,
      weaponMatches,
      priorityMatch,
      weaponChances,
    });
  }

  rankings.sort((a, b) => b.score - a.score);
  return rankings;
}

// Legacy helpers (kept for checker tab compatibility)
export function getZoneMatchScore(weapon: WeaponEssence, zone: FarmingZone): { total: number; matched: number; details: { stat: string; matched: boolean }[] } {
  const match = getWeaponZoneMatch(weapon, zone);
  return {
    total: match.total,
    matched: match.matchCount,
    details: match.details.map(d => ({ stat: d.stat, matched: d.matched })),
  };
}

export function getBestZones(weapon: WeaponEssence): { zone: FarmingZone; score: ReturnType<typeof getZoneMatchScore> }[] {
  const results = FARMING_ZONES.map(zone => ({
    zone,
    score: getZoneMatchScore(weapon, zone),
  }));
  results.sort((a, b) => b.score.matched - a.score.matched);
  return results;
}

export function findCompatibleWeapons(
  primary: PrimaryAttr | null,
  secondary: SecondaryStat | null,
  skill: SkillStat | null
): { weapon: WeaponEssence; matchCount: number; total: number }[] {
  return WEAPON_ESSENCES
    .filter(w => w.rarity >= 4)
    .map(w => {
      let matchCount = 0;
      const total = w.secondaryStat ? 3 : 2;
      if (primary && w.primaryAttr === primary) matchCount++;
      if (secondary && w.secondaryStat === secondary) matchCount++;
      if (skill && w.skillStat === skill) matchCount++;
      return { weapon: w, matchCount, total };
    })
    .filter(r => r.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount || b.weapon.rarity - a.weapon.rarity || a.weapon.name.localeCompare(b.weapon.name));
}
