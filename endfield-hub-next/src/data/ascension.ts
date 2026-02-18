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
  charBreak70: {
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
  charBreak70: 8,
};

// charBreak70 also adds a specialize material (count: 20)
export const BREAK70_SPECIALIZE_COUNT = 20;

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
  breakSpec: string;    // specialize material for charBreak70
  breakMush2: string;   // tier-2 mushroom for charBreak70
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
  const breakLevels = [20, 40, 60, 70];

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
    if (level < 70) {
      totals[cost.mushroomTier] = (totals[cost.mushroomTier] || 0) + mushCount;
    } else {
      // charBreak70 uses per-character mushroom_2 and specialize
      totals[charMats.breakMush2] = (totals[charMats.breakMush2] || 0) + mushCount;
      totals[charMats.breakSpec] = (totals[charMats.breakSpec] || 0) + BREAK70_SPECIALIZE_COUNT;
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
