// Weapon essence stat data from EndfieldTools.dev game database
// Each weapon has 3 essence stat slots: Primary Attribute, Secondary Stat, Skill Stat
// A "perfect" essence matches all 3 stats for a given weapon.

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

// Farming zones (Severe Energy Alluvium)
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
    enemy: 'Earthcrawler',
    secondaryStats: ['HP Boost', 'Physical DMG Boost', 'Heat DMG Boost', 'Cryo DMG Boost', 'Nature DMG Boost', 'Critical Rate Boost', 'Arts Intensity Boost'],
    skillStats: ['Suppression', 'Combative', 'Brutality', 'Infliction', 'Detonate', 'Twilight', 'Efficacy', 'Assault'],
  },
  {
    id: 'power-plateau',
    name: 'Power Plateau',
    region: 'Valley IV',
    enemy: 'Dustback',
    secondaryStats: ['Attack Boost', 'Physical DMG Boost', 'Heat DMG Boost', 'Nature DMG Boost', 'Critical Rate Boost', 'HP Boost', 'Arts Intensity Boost'],
    skillStats: ['Pursuit', 'Crusher', 'Inspiring', 'Infliction', 'Medicant', 'Fracture', 'Flow', 'Efficacy'],
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

// Helper: count how many of a weapon's stats a zone can drop
export function getZoneMatchScore(weapon: WeaponEssence, zone: FarmingZone): { total: number; matched: number; details: { stat: string; matched: boolean }[] } {
  const details: { stat: string; matched: boolean }[] = [];
  // Primary attributes are available in ALL zones
  details.push({ stat: weapon.primaryAttr, matched: true });

  if (weapon.secondaryStat) {
    const secMatch = zone.secondaryStats.includes(weapon.secondaryStat);
    details.push({ stat: weapon.secondaryStat, matched: secMatch });
  }

  const skillMatch = zone.skillStats.includes(weapon.skillStat);
  details.push({ stat: weapon.skillStat, matched: skillMatch });

  const total = details.length;
  const matched = details.filter(d => d.matched).length;
  return { total, matched, details };
}

// Helper: find best zone(s) for a weapon
export function getBestZones(weapon: WeaponEssence): { zone: FarmingZone; score: ReturnType<typeof getZoneMatchScore> }[] {
  const results = FARMING_ZONES.map(zone => ({
    zone,
    score: getZoneMatchScore(weapon, zone),
  }));
  results.sort((a, b) => b.score.matched - a.score.matched);
  return results;
}

// Helper: find all weapons that match a given essence (selected stats)
export function findCompatibleWeapons(
  primary: PrimaryAttr | null,
  secondary: SecondaryStat | null,
  skill: SkillStat | null
): { weapon: WeaponEssence; matchCount: number; total: number }[] {
  return WEAPON_ESSENCES
    .filter(w => w.rarity >= 4) // Skip 3-star for checker
    .map(w => {
      let matchCount = 0;
      let total = w.secondaryStat ? 3 : 2;
      if (primary && w.primaryAttr === primary) matchCount++;
      if (secondary && w.secondaryStat === secondary) matchCount++;
      if (skill && w.skillStat === skill) matchCount++;
      return { weapon: w, matchCount, total };
    })
    .filter(r => r.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount || b.weapon.rarity - a.weapon.rarity || a.weapon.name.localeCompare(b.weapon.name));
}
