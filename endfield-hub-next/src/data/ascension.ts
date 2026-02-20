// Real per-character ascension costs from EndfieldTools.dev game API
// All 23 characters share the same cost amounts — only the specific plant/specialize item IDs differ.
// Item IDs resolve to display names and icon URLs via MATERIAL_ID_TO_NAME and MATERIAL_ICONS in assets.ts.

export interface MaterialCost { id: string; count: number; }

// Shared break cost templates (amounts are identical for all characters)
// Character-specific items (mushroom_2 and specialize) are injected from CHAR_MATERIALS.
export const BREAK_COSTS: Record<string, { gold: number; template: { id: string; count: number }[]; mushroomTier: string; }> = {
  charBreak20: {
    gold: 1600,
    template: [
      { id: 'item_char_break_stage_1_2', count: 8 },
    ],
    mushroomTier: 'item_plant_mushroom_1_1',
  },
  charBreak40: {
    gold: 6500,
    template: [
      { id: 'item_char_break_stage_1_2', count: 25 },
    ],
    mushroomTier: 'item_plant_mushroom_1_2',
  },
  charBreak60: {
    gold: 18000,
    template: [
      { id: 'item_char_break_stage_3_4', count: 24 },
    ],
    mushroomTier: 'item_plant_mushroom_1_3',
  },
  charBreak80: {
    gold: 100000,
    template: [
      { id: 'item_char_break_stage_3_4', count: 36 },
    ],
    mushroomTier: '', // Uses character-specific mushroom_2 from CHAR_MATERIALS
  },
};

// Mushroom counts per break level
export const BREAK_MUSHROOM_COUNTS: Record<string, number> = {
  charBreak20: 3,
  charBreak40: 5,
  charBreak60: 5,
  charBreak80: 8,
};

// charBreak80 (E4) also adds a specialize material (count: 20)
export const BREAK80_SPECIALIZE_COUNT = 20;

// Shared skill level cost templates
// All characters share the same amounts. Plant and specialize items are substituted per character.
export const SKILL_COSTS: Record<number, { gold: number; items: { type: 'skillBook' | 'plant' | 'crown' | 'specialize'; count: number }[] }> = {
  2:  { gold: 1000,  items: [{ type: 'skillBook', count: 6 },  { type: 'plant', count: 1 }] },
  3:  { gold: 2700,  items: [{ type: 'skillBook', count: 12 }, { type: 'plant', count: 2 }] },
  4:  { gold: 3200,  items: [{ type: 'skillBook', count: 16 }, { type: 'plant', count: 1 }] },
  5:  { gold: 4200,  items: [{ type: 'skillBook', count: 21 }, { type: 'plant', count: 1 }] },
  6:  { gold: 5400,  items: [{ type: 'skillBook', count: 27 }, { type: 'plant', count: 2 }] },
  7:  { gold: 8200,  items: [{ type: 'skillBook', count: 6 },  { type: 'plant', count: 1 }] },
  8:  { gold: 10500, items: [{ type: 'skillBook', count: 8 },  { type: 'plant', count: 1 }] },
  9:  { gold: 18000, items: [{ type: 'skillBook', count: 15 }, { type: 'plant', count: 2 }] },
  10: { gold: 24000, items: [{ type: 'crown', count: 1 }, { type: 'skillBook', count: 15 }, { type: 'specialize', count: 6 },  { type: 'plant', count: 3 }] },
  11: { gold: 30000, items: [{ type: 'crown', count: 2 }, { type: 'skillBook', count: 24 }, { type: 'specialize', count: 16 }, { type: 'plant', count: 6 }] },
  12: { gold: 65000, items: [{ type: 'crown', count: 3 }, { type: 'skillBook', count: 50 }, { type: 'specialize', count: 36 }, { type: 'plant', count: 12 }] },
};

// Per-character material assignments (only the items that vary between characters)
export const CHAR_MATERIALS: Record<string, {
  breakSpec: string;    // specialize material for charBreak80 (E4)
  breakMush2: string;   // tier-2 mushroom for charBreak80 (E4)
  skillPlant2: string;  // tier-2 crystal plant for skill levels 10+
  skillSpecA: string;   // specialize for NormalSkill + UltimateSkill levels 10+
  skillSpecB: string;   // specialize for ComboSkill + NormalAttack levels 10+
}> = {
  'akekuri': { breakSpec: 'item_char_skill_specialize_2', breakMush2: 'item_plant_mushroom_2_2', skillPlant2: 'item_plant_crylplant_2_1', skillSpecA: 'item_char_skill_specialize_1', skillSpecB: 'item_char_skill_specialize_5' },
  'alesh': { breakSpec: 'item_char_skill_specialize_1', breakMush2: 'item_plant_mushroom_2_1', skillPlant2: 'item_plant_crylplant_2_2', skillSpecA: 'item_char_skill_specialize_5', skillSpecB: 'item_char_skill_specialize_4' },
  'antal': { breakSpec: 'item_char_skill_specialize_1', breakMush2: 'item_plant_mushroom_2_2', skillPlant2: 'item_plant_crylplant_2_1', skillSpecA: 'item_char_skill_specialize_3', skillSpecB: 'item_char_skill_specialize_2' },
  'arclight': { breakSpec: 'item_char_skill_specialize_1', breakMush2: 'item_plant_mushroom_2_2', skillPlant2: 'item_plant_crylplant_2_2', skillSpecA: 'item_char_skill_specialize_3', skillSpecB: 'item_char_skill_specialize_2' },
  'ardelia': { breakSpec: 'item_char_skill_specialize_4', breakMush2: 'item_plant_mushroom_2_2', skillPlant2: 'item_plant_crylplant_2_2', skillSpecA: 'item_char_skill_specialize_3', skillSpecB: 'item_char_skill_specialize_2' },
  'avywenna': { breakSpec: 'item_char_skill_specialize_3', breakMush2: 'item_plant_mushroom_2_1', skillPlant2: 'item_plant_crylplant_2_2', skillSpecA: 'item_char_skill_specialize_5', skillSpecB: 'item_char_skill_specialize_4' },
  'catcher': { breakSpec: 'item_char_skill_specialize_3', breakMush2: 'item_plant_mushroom_2_1', skillPlant2: 'item_plant_crylplant_2_2', skillSpecA: 'item_char_skill_specialize_2', skillSpecB: 'item_char_skill_specialize_1' },
  'chen-qianyu': { breakSpec: 'item_char_skill_specialize_4', breakMush2: 'item_plant_mushroom_2_2', skillPlant2: 'item_plant_crylplant_2_1', skillSpecA: 'item_char_skill_specialize_3', skillSpecB: 'item_char_skill_specialize_2' },
  'da-pan': { breakSpec: 'item_char_skill_specialize_5', breakMush2: 'item_plant_mushroom_2_1', skillPlant2: 'item_plant_crylplant_2_2', skillSpecA: 'item_char_skill_specialize_2', skillSpecB: 'item_char_skill_specialize_1' },
  'ember': { breakSpec: 'item_char_skill_specialize_2', breakMush2: 'item_plant_mushroom_2_2', skillPlant2: 'item_plant_crylplant_2_1', skillSpecA: 'item_char_skill_specialize_4', skillSpecB: 'item_char_skill_specialize_3' },
  'endministrator': { breakSpec: 'item_char_skill_specialize_1', breakMush2: 'item_plant_mushroom_2_1', skillPlant2: 'item_plant_crylplant_2_2', skillSpecA: 'item_char_skill_specialize_3', skillSpecB: 'item_char_skill_specialize_2' },
  'estella': { breakSpec: 'item_char_skill_specialize_4', breakMush2: 'item_plant_mushroom_2_2', skillPlant2: 'item_plant_crylplant_2_2', skillSpecA: 'item_char_skill_specialize_3', skillSpecB: 'item_char_skill_specialize_2' },
  'fluorite': { breakSpec: 'item_char_skill_specialize_5', breakMush2: 'item_plant_mushroom_2_2', skillPlant2: 'item_plant_crylplant_2_1', skillSpecA: 'item_char_skill_specialize_4', skillSpecB: 'item_char_skill_specialize_3' },
  'gilberta': { breakSpec: 'item_char_skill_specialize_3', breakMush2: 'item_plant_mushroom_2_1', skillPlant2: 'item_plant_crylplant_2_2', skillSpecA: 'item_char_skill_specialize_5', skillSpecB: 'item_char_skill_specialize_4' },
  'laevatain': { breakSpec: 'item_char_skill_specialize_2', breakMush2: 'item_plant_mushroom_2_2', skillPlant2: 'item_plant_crylplant_2_1', skillSpecA: 'item_char_skill_specialize_1', skillSpecB: 'item_char_skill_specialize_5' },
  'last-rite': { breakSpec: 'item_char_skill_specialize_5', breakMush2: 'item_plant_mushroom_2_1', skillPlant2: 'item_plant_crylplant_2_1', skillSpecA: 'item_char_skill_specialize_4', skillSpecB: 'item_char_skill_specialize_3' },
  'lifeng': { breakSpec: 'item_char_skill_specialize_1', breakMush2: 'item_plant_mushroom_2_1', skillPlant2: 'item_plant_crylplant_2_1', skillSpecA: 'item_char_skill_specialize_5', skillSpecB: 'item_char_skill_specialize_4' },
  'perlica': { breakSpec: 'item_char_skill_specialize_3', breakMush2: 'item_plant_mushroom_2_1', skillPlant2: 'item_plant_crylplant_2_1', skillSpecA: 'item_char_skill_specialize_2', skillSpecB: 'item_char_skill_specialize_1' },
  'pogranichnik': { breakSpec: 'item_char_skill_specialize_1', breakMush2: 'item_plant_mushroom_2_2', skillPlant2: 'item_plant_crylplant_2_1', skillSpecA: 'item_char_skill_specialize_5', skillSpecB: 'item_char_skill_specialize_4' },
  'snowshine': { breakSpec: 'item_char_skill_specialize_4', breakMush2: 'item_plant_mushroom_2_1', skillPlant2: 'item_plant_crylplant_2_1', skillSpecA: 'item_char_skill_specialize_1', skillSpecB: 'item_char_skill_specialize_5' },
  'wulfgard': { breakSpec: 'item_char_skill_specialize_5', breakMush2: 'item_plant_mushroom_2_2', skillPlant2: 'item_plant_crylplant_2_2', skillSpecA: 'item_char_skill_specialize_4', skillSpecB: 'item_char_skill_specialize_3' },
  'xaihi': { breakSpec: 'item_char_skill_specialize_2', breakMush2: 'item_plant_mushroom_2_1', skillPlant2: 'item_plant_crylplant_2_1', skillSpecA: 'item_char_skill_specialize_4', skillSpecB: 'item_char_skill_specialize_3' },
  'yvonne': { breakSpec: 'item_char_skill_specialize_3', breakMush2: 'item_plant_mushroom_2_1', skillPlant2: 'item_plant_crylplant_2_2', skillSpecA: 'item_char_skill_specialize_2', skillSpecB: 'item_char_skill_specialize_1' },
};

// Helper: compute total materials for a character from currentBreak to targetBreak
export function getBreakMaterials(slug: string, fromBreak: number, toBreak: number): MaterialCost[] {
  const charMats = CHAR_MATERIALS[slug];
  if (!charMats) return [];

  const totals: Record<string, number> = {};
  const breakLevels = [20, 40, 60, 80];

  for (const level of breakLevels) {
    if (level <= fromBreak || level > toBreak) continue;
    const key = `charBreak${level}` as keyof typeof BREAK_COSTS;
    const cost = BREAK_COSTS[key];
    if (!cost) continue;

    // Gold
    totals['item_gold'] = (totals['item_gold'] || 0) + cost.gold;

    // Template items (break stage materials)
    for (const item of cost.template) {
      totals[item.id] = (totals[item.id] || 0) + item.count;
    }

    // Mushroom
    const mushCount = BREAK_MUSHROOM_COUNTS[key];
    if (level < 80) {
      totals[cost.mushroomTier] = (totals[cost.mushroomTier] || 0) + mushCount;
    } else {
      // charBreak80 uses per-character mushroom_2 and specialize
      totals[charMats.breakMush2] = (totals[charMats.breakMush2] || 0) + mushCount;
      totals[charMats.breakSpec] = (totals[charMats.breakSpec] || 0) + BREAK80_SPECIALIZE_COUNT;
    }
  }

  return Object.entries(totals).map(([id, count]) => ({ id, count }));
}

// Helper: compute total materials for one skill from fromLevel to toLevel
// skillGroup: 0=NormalSkill, 1=UltimateSkill, 2=ComboSkill, 3=NormalAttack
export function getSkillMaterials(slug: string, skillGroup: number, fromLevel: number, toLevel: number): MaterialCost[] {
  const charMats = CHAR_MATERIALS[slug];
  if (!charMats) return [];

  const totals: Record<string, number> = {};
  const isGroupA = skillGroup <= 1; // NormalSkill or UltimateSkill

  for (let level = fromLevel + 1; level <= toLevel; level++) {
    const cost = SKILL_COSTS[level];
    if (!cost) continue;

    totals['item_gold'] = (totals['item_gold'] || 0) + cost.gold;

    for (const item of cost.items) {
      let itemId: string;
      if (item.type === 'skillBook') {
        itemId = level <= 6 ? 'item_char_skill_level_1_6' : 'item_char_skill_level_7_12';
      } else if (item.type === 'plant') {
        if (level <= 3) itemId = 'item_plant_crylplant_1_1';
        else if (level <= 6) itemId = 'item_plant_crylplant_1_2';
        else if (level <= 9) itemId = 'item_plant_crylplant_1_3';
        else itemId = charMats.skillPlant2;
      } else if (item.type === 'crown') {
        itemId = 'item_char_skill_crown';
      } else if (item.type === 'specialize') {
        itemId = isGroupA ? charMats.skillSpecA : charMats.skillSpecB;
      } else {
        continue;
      }
      totals[itemId] = (totals[itemId] || 0) + item.count;
    }
  }

  return Object.entries(totals).map(([id, count]) => ({ id, count }));
}

// ─── Weapon Breakthrough Costs ──────────────────────────────────────────────
// Weapons break at levels 20, 40, 60, 80 (same as characters: E1/E2/E3/E4)
// Weapon breakthrough costs are simpler than character costs - only gold + materials

export const WEAPON_BREAK_COSTS: Record<string, { gold: number; materials: { id: string; count: number }[] }> = {
  weaponBreak20: {
    gold: 2200,
    materials: [
      { id: 'item_weapon_break_stage_1_2', count: 5 },  // Cast Die
    ],
  },
  weaponBreak40: {
    gold: 8500,
    materials: [
      { id: 'item_weapon_break_stage_1_2', count: 18 }, // Cast Die
    ],
  },
  weaponBreak60: {
    gold: 25000,
    materials: [
      { id: 'item_weapon_break_stage_3_4', count: 20 }, // Heavy Cast Die
    ],
  },
  weaponBreak80: {
    gold: 90000,
    materials: [
      { id: 'item_weapon_break_stage_3_4', count: 30 }, // Heavy Cast Die
    ],
  },
};

// Per-weapon material assignments
// T1-T2 use weapon-type ore materials (Kalkonyx/Auronyx shared across weapons)
// T3-T4 use weapon-specific rare materials + minerals
export const WEAPON_MATERIALS: Record<string, {
  breakMat20: string;  // tier-1 weapon material for break 20 (weapon type specific)
  breakMat40: string;  // tier-2 weapon material for break 40 (weapon type specific)
  breakMat60: string;  // tier-3 rare weapon material for break 60 (weapon specific)
  breakMat80: string;  // tier-4 rare weapon material for break 80 (weapon specific)
  mineral60?: string;  // tier-3 mineral for break 60 (weapon specific)
  mineral80?: string;  // tier-4 mineral for break 80 (weapon specific)
}> = {
  // 6-star Greatswords
  'exemplar': { breakMat20: 'item_weapon_greatsword_1', breakMat40: 'item_weapon_greatsword_2', breakMat60: 'item_weapon_greatsword_3', breakMat80: 'item_weapon_greatsword_4' },
  'former-finery': { breakMat20: 'item_weapon_greatsword_1', breakMat40: 'item_weapon_greatsword_2', breakMat60: 'item_weapon_greatsword_3', breakMat80: 'item_weapon_greatsword_4' },
  'thunderberge': { breakMat20: 'item_weapon_greatsword_1', breakMat40: 'item_weapon_greatsword_2', breakMat60: 'item_weapon_greatsword_3', breakMat80: 'item_weapon_greatsword_4' },
  'sundered-prince': { breakMat20: 'item_weapon_greatsword_1', breakMat40: 'item_weapon_greatsword_2', breakMat60: 'item_weapon_greatsword_3', breakMat80: 'item_weapon_greatsword_4' },
  'khravengger': { breakMat20: 'item_weapon_greatsword_1', breakMat40: 'item_weapon_greatsword_2', breakMat60: 'item_weapon_greatsword_3', breakMat80: 'item_weapon_greatsword_4' },
  // 6-star Arts Units
  'opus-etch-figure': { breakMat20: 'item_weapon_arts_1', breakMat40: 'item_weapon_arts_2', breakMat60: 'item_weapon_arts_3', breakMat80: 'item_weapon_arts_4' },
  'detonation-unit': { breakMat20: 'item_weapon_arts_1', breakMat40: 'item_weapon_arts_2', breakMat60: 'item_weapon_arts_3', breakMat80: 'item_weapon_arts_4' },
  'oblivion': { breakMat20: 'item_weapon_arts_1', breakMat40: 'item_weapon_arts_2', breakMat60: 'item_weapon_arts_3', breakMat80: 'item_weapon_arts_4' },
  'chivalric-virtues': { breakMat20: 'item_weapon_arts_1', breakMat40: 'item_weapon_arts_2', breakMat60: 'item_weapon_arts_3', breakMat80: 'item_weapon_arts_4' },
  'delivery-guaranteed': { breakMat20: 'item_weapon_arts_1', breakMat40: 'item_weapon_arts_2', breakMat60: 'item_weapon_arts_3', breakMat80: 'item_weapon_arts_4' },
  'dreams-of-the-starry-beach': { breakMat20: 'item_weapon_arts_1', breakMat40: 'item_weapon_arts_2', breakMat60: 'item_weapon_arts_3', breakMat80: 'item_weapon_arts_4' },
  // 6-star Polearms
  'valiant': { breakMat20: 'item_weapon_polearm_1', breakMat40: 'item_weapon_polearm_2', breakMat60: 'item_weapon_polearm_3', breakMat80: 'item_weapon_polearm_4' },
  'jet': { breakMat20: 'item_weapon_polearm_1', breakMat40: 'item_weapon_polearm_2', breakMat60: 'item_weapon_polearm_3', breakMat80: 'item_weapon_polearm_4' },
  'mountain-bearer': { breakMat20: 'item_weapon_polearm_1', breakMat40: 'item_weapon_polearm_2', breakMat60: 'item_weapon_polearm_3', breakMat80: 'item_weapon_polearm_4' },
  // 6-star Handcannons
  'navigator': { breakMat20: 'item_weapon_handcannon_1', breakMat40: 'item_weapon_handcannon_2', breakMat60: 'item_weapon_handcannon_3', breakMat80: 'item_weapon_handcannon_4' },
  'wedge': { breakMat20: 'item_weapon_handcannon_1', breakMat40: 'item_weapon_handcannon_2', breakMat60: 'item_weapon_handcannon_3', breakMat80: 'item_weapon_handcannon_4' },
  'clannibal': { breakMat20: 'item_weapon_handcannon_1', breakMat40: 'item_weapon_handcannon_2', breakMat60: 'item_weapon_handcannon_3', breakMat80: 'item_weapon_handcannon_4' },
  'artzy-tyrannical': { breakMat20: 'item_weapon_handcannon_1', breakMat40: 'item_weapon_handcannon_2', breakMat60: 'item_weapon_handcannon_3', breakMat80: 'item_weapon_handcannon_4' },
  // 6-star Swords
  'forgeborn-scathe': { breakMat20: 'item_weapon_sword_1', breakMat40: 'item_weapon_sword_2', breakMat60: 'item_weapon_sword_3', breakMat80: 'item_weapon_sword_4' },
  'umbral-torch': { breakMat20: 'item_weapon_sword_1', breakMat40: 'item_weapon_sword_2', breakMat60: 'item_weapon_sword_3', breakMat80: 'item_weapon_sword_4' },
  'rapid-ascent': { breakMat20: 'item_weapon_sword_1', breakMat40: 'item_weapon_sword_2', breakMat60: 'item_weapon_sword_3', breakMat80: 'item_weapon_sword_4' },
  'thermite-cutter': { breakMat20: 'item_weapon_sword_1', breakMat40: 'item_weapon_sword_2', breakMat60: 'item_weapon_sword_3', breakMat80: 'item_weapon_sword_4' },
  'eminent-repute': { breakMat20: 'item_weapon_sword_1', breakMat40: 'item_weapon_sword_2', breakMat60: 'item_weapon_sword_3', breakMat80: 'item_weapon_sword_4' },
  'white-night-nova': { breakMat20: 'item_weapon_sword_1', breakMat40: 'item_weapon_sword_2', breakMat60: 'item_weapon_sword_3', breakMat80: 'item_weapon_sword_4' },
  'never-rest': { breakMat20: 'item_weapon_sword_1', breakMat40: 'item_weapon_sword_2', breakMat60: 'item_weapon_sword_3', breakMat80: 'item_weapon_sword_4' },
  'grand-vision': { breakMat20: 'item_weapon_sword_1', breakMat40: 'item_weapon_sword_2', breakMat60: 'item_weapon_sword_3', breakMat80: 'item_weapon_sword_4' },
  // 5-star Greatswords
  'seeker-of-dark-lung': { breakMat20: 'item_weapon_greatsword_1', breakMat40: 'item_weapon_greatsword_2', breakMat60: 'item_weapon_greatsword_3', breakMat80: 'item_weapon_greatsword_4' },
  'finishing-call': { breakMat20: 'item_weapon_greatsword_1', breakMat40: 'item_weapon_greatsword_2', breakMat60: 'item_weapon_greatsword_3', breakMat80: 'item_weapon_greatsword_4' },
  'ancient-canal': { breakMat20: 'item_weapon_greatsword_1', breakMat40: 'item_weapon_greatsword_2', breakMat60: 'item_weapon_greatsword_3', breakMat80: 'item_weapon_greatsword_4' },
  'obj-heavy-burden': { breakMat20: 'item_weapon_greatsword_1', breakMat40: 'item_weapon_greatsword_2', breakMat60: 'item_weapon_greatsword_3', breakMat80: 'item_weapon_greatsword_4' },
  // 5-star Arts Units
  'wild-wanderer': { breakMat20: 'item_weapon_arts_1', breakMat40: 'item_weapon_arts_2', breakMat60: 'item_weapon_arts_3', breakMat80: 'item_weapon_arts_4' },
  'stanza-of-memorials': { breakMat20: 'item_weapon_arts_1', breakMat40: 'item_weapon_arts_2', breakMat60: 'item_weapon_arts_3', breakMat80: 'item_weapon_arts_4' },
  'monaihe': { breakMat20: 'item_weapon_arts_1', breakMat40: 'item_weapon_arts_2', breakMat60: 'item_weapon_arts_3', breakMat80: 'item_weapon_arts_4' },
  'freedom-to-proselytize': { breakMat20: 'item_weapon_arts_1', breakMat40: 'item_weapon_arts_2', breakMat60: 'item_weapon_arts_3', breakMat80: 'item_weapon_arts_4' },
  'obj-arts-identifier': { breakMat20: 'item_weapon_arts_1', breakMat40: 'item_weapon_arts_2', breakMat60: 'item_weapon_arts_3', breakMat80: 'item_weapon_arts_4' },
  // 5-star Polearms
  'chimeric-justice': { breakMat20: 'item_weapon_polearm_1', breakMat40: 'item_weapon_polearm_2', breakMat60: 'item_weapon_polearm_3', breakMat80: 'item_weapon_polearm_4' },
  'cohesive-traction': { breakMat20: 'item_weapon_polearm_1', breakMat40: 'item_weapon_polearm_2', breakMat60: 'item_weapon_polearm_3', breakMat80: 'item_weapon_polearm_4' },
  'obj-razorhorn': { breakMat20: 'item_weapon_polearm_1', breakMat40: 'item_weapon_polearm_2', breakMat60: 'item_weapon_polearm_3', breakMat80: 'item_weapon_polearm_4' },
  // 5-star Handcannons
  'rational-farewell': { breakMat20: 'item_weapon_handcannon_1', breakMat40: 'item_weapon_handcannon_2', breakMat60: 'item_weapon_handcannon_3', breakMat80: 'item_weapon_handcannon_4' },
  'opus-the-living': { breakMat20: 'item_weapon_handcannon_1', breakMat40: 'item_weapon_handcannon_2', breakMat60: 'item_weapon_handcannon_3', breakMat80: 'item_weapon_handcannon_4' },
  'obj-velocitous': { breakMat20: 'item_weapon_handcannon_1', breakMat40: 'item_weapon_handcannon_2', breakMat60: 'item_weapon_handcannon_3', breakMat80: 'item_weapon_handcannon_4' },
  // 5-star Swords
  'sundering-steel': { breakMat20: 'item_weapon_sword_1', breakMat40: 'item_weapon_sword_2', breakMat60: 'item_weapon_sword_3', breakMat80: 'item_weapon_sword_4' },
  'fortmaker': { breakMat20: 'item_weapon_sword_1', breakMat40: 'item_weapon_sword_2', breakMat60: 'item_weapon_sword_3', breakMat80: 'item_weapon_sword_4' },
  'aspirant': { breakMat20: 'item_weapon_sword_1', breakMat40: 'item_weapon_sword_2', breakMat60: 'item_weapon_sword_3', breakMat80: 'item_weapon_sword_4' },
  'twelve-questions': { breakMat20: 'item_weapon_sword_1', breakMat40: 'item_weapon_sword_2', breakMat60: 'item_weapon_sword_3', breakMat80: 'item_weapon_sword_4' },
  'obj-edge-of-lightness': { breakMat20: 'item_weapon_sword_1', breakMat40: 'item_weapon_sword_2', breakMat60: 'item_weapon_sword_3', breakMat80: 'item_weapon_sword_4' },
  'finchaser-3-0': { breakMat20: 'item_weapon_sword_1', breakMat40: 'item_weapon_sword_2', breakMat60: 'item_weapon_sword_3', breakMat80: 'item_weapon_sword_4' },
};

// Ore material costs per break level (shared across all weapons)
export const WEAPON_ORE_COSTS: Record<string, { id: string; count: number } | null> = {
  weaponBreak20: { id: 'item_weapon_ore_1', count: 3 },  // Kalkonyx
  weaponBreak40: { id: 'item_weapon_ore_2', count: 5 },  // Auronyx
  weaponBreak60: { id: 'item_weapon_ore_3', count: 5 },  // Umbronyx
  weaponBreak80: null,                                     // No ore at T4
};

// Weapon-specific breakthrough material counts per break level
// T1-T2: only weapon-type-specific materials (3, 5)
// T3-T4: weapon-specific rare materials (16) + weapon-specific minerals (8)
export const WEAPON_BREAK_MAT_COUNTS: Record<string, number> = {
  weaponBreak20: 3,
  weaponBreak40: 5,
  weaponBreak60: 16,
  weaponBreak80: 16,
};

// Additional mineral material counts for T3 and T4
export const WEAPON_BREAK_MINERAL_COUNTS: Record<string, number> = {
  weaponBreak60: 8,
  weaponBreak80: 8,
};

// Helper: compute total materials for a weapon from currentBreak to targetBreak
export function getWeaponBreakMaterials(slug: string, fromBreak: number, toBreak: number): MaterialCost[] {
  const weaponMats = WEAPON_MATERIALS[slug];
  if (!weaponMats) return [];

  const totals: Record<string, number> = {};
  const breakLevels = [20, 40, 60, 80];

  for (const level of breakLevels) {
    if (level <= fromBreak || level > toBreak) continue;
    const key = `weaponBreak${level}` as keyof typeof WEAPON_BREAK_COSTS;
    const cost = WEAPON_BREAK_COSTS[key];
    if (!cost) continue;

    // Gold
    totals['item_gold'] = (totals['item_gold'] || 0) + cost.gold;

    // Generic break materials (Cast Die / Heavy Cast Die)
    for (const item of cost.materials) {
      totals[item.id] = (totals[item.id] || 0) + item.count;
    }

    // Shared ore materials (Kalkonyx, Auronyx, Umbronyx)
    const ore = WEAPON_ORE_COSTS[key];
    if (ore) {
      totals[ore.id] = (totals[ore.id] || 0) + ore.count;
    }

    // Weapon-specific breakthrough materials
    const matCount = WEAPON_BREAK_MAT_COUNTS[key];
    let matId: string;
    if (level === 20) matId = weaponMats.breakMat20;
    else if (level === 40) matId = weaponMats.breakMat40;
    else if (level === 60) matId = weaponMats.breakMat60;
    else matId = weaponMats.breakMat80;

    totals[matId] = (totals[matId] || 0) + matCount;

    // Weapon-specific minerals for T3 and T4
    const mineralCount = WEAPON_BREAK_MINERAL_COUNTS[key];
    if (mineralCount) {
      const mineralId = level === 60 ? weaponMats.mineral60 : weaponMats.mineral80;
      if (mineralId) {
        totals[mineralId] = (totals[mineralId] || 0) + mineralCount;
      }
    }
  }

  return Object.entries(totals).map(([id, count]) => ({ id, count }));
}
