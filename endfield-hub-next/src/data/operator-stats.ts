// Operator stat progression data for the character card stat calculator
// Source: endfield.wiki.gg (cross-referenced by QA agents)
// All operators start at: 500 HP, 30 ATK, 0 DEF, 5% Crit Rate, 1.0 Attack Speed

export interface EliteStats {
  hp: number;
  atk: number;
  str: number;
  agi: number;
  int: number;
  wil: number;
}

export interface OperatorStatData {
  rarity: number;
  mainAttribute: 'str' | 'agi' | 'int' | 'wil';
  secondaryAttribute: 'str' | 'agi' | 'int' | 'wil';
  baseStats: { hp: number; atk: number; str: number; agi: number; int: number; wil: number };
  eliteProgression: {
    elite1_lv20: EliteStats;
    elite2_lv40: EliteStats;
    elite3_lv60: EliteStats;
    elite4_lv80: EliteStats;
  };
  maxStats: { hp: number; atk: number; str: number; agi: number; int: number; wil: number };
}

// Attribute talent bonuses by elite tier (cumulative: +10, +25, +40, +60)
export const TALENT_ATTRIBUTE_BONUSES = [0, 10, 25, 40, 60] as const; // Index = breakthrough level (0-4)

export const OPERATOR_STATS: Record<string, OperatorStatData> = {
  Ember: {
    rarity: 6, mainAttribute: 'str', secondaryAttribute: 'wil',
    baseStats: { hp: 500, atk: 30, str: 21, agi: 9, int: 8, wil: 13 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 93, str: 54, agi: 28, int: 25, wil: 36 },
      elite2_lv40: { hp: 2689, atk: 159, str: 89, agi: 47, int: 42, wil: 60 },
      elite3_lv60: { hp: 3811, atk: 225, str: 124, agi: 67, int: 60, wil: 84 },
      elite4_lv80: { hp: 4934, atk: 291, str: 159, agi: 87, int: 77, wil: 108 },
    },
    maxStats: { hp: 5495, atk: 323, str: 176, agi: 96, int: 86, wil: 120 },
  },
  Endministrator: {
    rarity: 6, mainAttribute: 'agi', secondaryAttribute: 'str',
    baseStats: { hp: 500, atk: 30, str: 14, agi: 14, int: 9, wil: 10 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 92, str: 38, agi: 41, int: 28, wil: 31 },
      elite2_lv40: { hp: 2689, atk: 157, str: 62, agi: 69, int: 47, wil: 53 },
      elite3_lv60: { hp: 3811, atk: 222, str: 86, agi: 98, int: 67, wil: 74 },
      elite4_lv80: { hp: 4934, atk: 287, str: 111, agi: 126, int: 87, wil: 96 },
    },
    maxStats: { hp: 5495, atk: 319, str: 123, agi: 140, int: 96, wil: 107 },
  },
  Ardelia: {
    rarity: 6, mainAttribute: 'int', secondaryAttribute: 'wil',
    baseStats: { hp: 500, atk: 30, str: 9, agi: 9, int: 20, wil: 15 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 93, str: 31, agi: 27, int: 46, wil: 37 },
      elite2_lv40: { hp: 2689, atk: 159, str: 54, agi: 46, int: 75, wil: 60 },
      elite3_lv60: { hp: 3811, atk: 225, str: 77, agi: 65, int: 103, wil: 83 },
      elite4_lv80: { hp: 4934, atk: 291, str: 100, agi: 84, int: 131, wil: 106 },
    },
    maxStats: { hp: 5495, atk: 324, str: 112, agi: 94, int: 145, wil: 118 },
  },
  Gilberta: {
    rarity: 6, mainAttribute: 'wil', secondaryAttribute: 'int',
    baseStats: { hp: 500, atk: 30, str: 9, agi: 9, int: 13, wil: 21 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 88, str: 27, agi: 28, int: 37, wil: 56 },
      elite2_lv40: { hp: 2689, atk: 150, str: 45, agi: 46, int: 62, wil: 90 },
      elite3_lv60: { hp: 3811, atk: 211, str: 63, agi: 65, int: 87, wil: 124 },
      elite4_lv80: { hp: 4934, atk: 273, str: 81, agi: 84, int: 113, wil: 155 },
    },
    maxStats: { hp: 5495, atk: 303, str: 90, agi: 93, int: 127, wil: 172 },
  },
  Laevatain: {
    rarity: 6, mainAttribute: 'int', secondaryAttribute: 'str',
    baseStats: { hp: 500, atk: 30, str: 13, agi: 9, int: 22, wil: 9 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 91, str: 37, agi: 28, int: 57, wil: 27 },
      elite2_lv40: { hp: 2689, atk: 155, str: 61, agi: 47, int: 94, wil: 46 },
      elite3_lv60: { hp: 3811, atk: 220, str: 85, agi: 66, int: 131, wil: 65 },
      elite4_lv80: { hp: 4934, atk: 285, str: 109, agi: 89, int: 160, wil: 80 },
    },
    maxStats: { hp: 5495, atk: 318, str: 121, agi: 99, int: 177, wil: 89 },
  },
  Lifeng: {
    rarity: 6, mainAttribute: 'agi', secondaryAttribute: 'str',
    baseStats: { hp: 500, atk: 30, str: 14, agi: 20, int: 13, wil: 12 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 90, str: 38, agi: 44, int: 35, wil: 35 },
      elite2_lv40: { hp: 2689, atk: 153, str: 62, agi: 69, int: 58, wil: 58 },
      elite3_lv60: { hp: 3811, atk: 217, str: 86, agi: 94, int: 81, wil: 82 },
      elite4_lv80: { hp: 4934, atk: 280, str: 111, agi: 119, int: 104, wil: 105 },
    },
    maxStats: { hp: 5495, atk: 312, str: 123, agi: 132, int: 115, wil: 117 },
  },
  'Last Rite': {
    rarity: 6, mainAttribute: 'str', secondaryAttribute: 'wil',
    baseStats: { hp: 500, atk: 30, str: 21, agi: 8, int: 9, wil: 15 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 95, str: 50, agi: 29, int: 27, wil: 35 },
      elite2_lv40: { hp: 2689, atk: 162, str: 80, agi: 50, int: 46, wil: 56 },
      elite3_lv60: { hp: 3811, atk: 230, str: 110, agi: 72, int: 65, wil: 77 },
      elite4_lv80: { hp: 4934, atk: 298, str: 140, agi: 93, int: 84, wil: 98 },
    },
    maxStats: { hp: 5495, atk: 331, str: 156, agi: 103, int: 93, wil: 109 },
  },
  Pogranichnik: {
    rarity: 6, mainAttribute: 'wil', secondaryAttribute: 'agi',
    baseStats: { hp: 500, atk: 30, str: 12, agi: 13, int: 10, wil: 20 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 92, str: 31, agi: 34, int: 28, wil: 52 },
      elite2_lv40: { hp: 2689, atk: 157, str: 51, agi: 55, int: 48, wil: 87 },
      elite3_lv60: { hp: 3811, atk: 223, str: 71, agi: 77, int: 67, wil: 121 },
      elite4_lv80: { hp: 4934, atk: 288, str: 91, agi: 99, int: 87, wil: 156 },
    },
    maxStats: { hp: 5495, atk: 321, str: 101, agi: 110, int: 97, wil: 173 },
  },
  Yvonne: {
    rarity: 6, mainAttribute: 'int', secondaryAttribute: 'agi',
    baseStats: { hp: 500, atk: 30, str: 8, agi: 14, int: 24, wil: 10 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 92, str: 24, agi: 38, int: 57, wil: 30 },
      elite2_lv40: { hp: 2689, atk: 157, str: 40, agi: 64, int: 91, wil: 52 },
      elite3_lv60: { hp: 3811, atk: 223, str: 57, agi: 89, int: 125, wil: 73 },
      elite4_lv80: { hp: 4934, atk: 288, str: 74, agi: 115, int: 159, wil: 94 },
    },
    maxStats: { hp: 5495, atk: 321, str: 82, agi: 128, int: 176, wil: 105 },
  },
  Alesh: {
    rarity: 5, mainAttribute: 'str', secondaryAttribute: 'int',
    baseStats: { hp: 500, atk: 30, str: 20, agi: 9, int: 13, wil: 10 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 90, str: 49, agi: 28, int: 37, wil: 27 },
      elite2_lv40: { hp: 2689, atk: 152, str: 80, agi: 47, int: 62, wil: 46 },
      elite3_lv60: { hp: 3811, atk: 215, str: 111, agi: 67, int: 87, wil: 65 },
      elite4_lv80: { hp: 4934, atk: 277, str: 142, agi: 86, int: 113, wil: 84 },
    },
    maxStats: { hp: 5495, atk: 309, str: 158, agi: 95, int: 125, wil: 89 },
  },
  Arclight: {
    rarity: 5, mainAttribute: 'agi', secondaryAttribute: 'int',
    baseStats: { hp: 500, atk: 30, str: 14, agi: 14, int: 12, wil: 10 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 89, str: 33, agi: 42, int: 36, wil: 29 },
      elite2_lv40: { hp: 2689, atk: 151, str: 54, agi: 71, int: 61, wil: 49 },
      elite3_lv60: { hp: 3811, atk: 213, str: 75, agi: 101, int: 86, wil: 69 },
      elite4_lv80: { hp: 4934, atk: 275, str: 96, agi: 130, int: 111, wil: 89 },
    },
    maxStats: { hp: 5495, atk: 306, str: 107, agi: 145, int: 123, wil: 100 },
  },
  Avywenna: {
    rarity: 5, mainAttribute: 'wil', secondaryAttribute: 'agi',
    baseStats: { hp: 500, atk: 30, str: 12, agi: 10, int: 14, wil: 15 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 90, str: 33, agi: 31, int: 34, wil: 43 },
      elite2_lv40: { hp: 2689, atk: 153, str: 54, agi: 52, int: 56, wil: 73 },
      elite3_lv60: { hp: 3811, atk: 217, str: 75, agi: 74, int: 78, wil: 103 },
      elite4_lv80: { hp: 4934, atk: 280, str: 96, agi: 95, int: 99, wil: 133 },
    },
    maxStats: { hp: 5495, atk: 312, str: 107, agi: 106, int: 110, wil: 148 },
  },
  'Chen Qianyu': {
    rarity: 5, mainAttribute: 'agi', secondaryAttribute: 'str',
    baseStats: { hp: 500, atk: 30, str: 12, agi: 22, int: 8, wil: 9 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 91, str: 33, agi: 54, int: 24, wil: 27 },
      elite2_lv40: { hp: 2689, atk: 156, str: 54, agi: 89, int: 40, wil: 46 },
      elite3_lv60: { hp: 3811, atk: 220, str: 75, agi: 123, int: 57, wil: 65 },
      elite4_lv80: { hp: 4934, atk: 285, str: 96, agi: 155, int: 77, wil: 84 },
    },
    maxStats: { hp: 5495, atk: 318, str: 107, agi: 172, int: 86, wil: 94 },
  },
  'Da Pan': {
    rarity: 5, mainAttribute: 'str', secondaryAttribute: 'wil',
    baseStats: { hp: 500, atk: 30, str: 24, agi: 9, int: 10, wil: 10 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 88, str: 56, agi: 28, int: 28, wil: 30 },
      elite2_lv40: { hp: 2689, atk: 150, str: 90, agi: 47, int: 47, wil: 50 },
      elite3_lv60: { hp: 3811, atk: 211, str: 124, agi: 67, int: 66, wil: 71 },
      elite4_lv80: { hp: 4934, atk: 272, str: 158, agi: 87, int: 85, wil: 91 },
    },
    maxStats: { hp: 5495, atk: 303, str: 175, agi: 96, int: 94, wil: 102 },
  },
  Perlica: {
    rarity: 5, mainAttribute: 'int', secondaryAttribute: 'wil',
    baseStats: { hp: 500, atk: 30, str: 9, agi: 9, int: 21, wil: 13 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 88, str: 26, agi: 27, int: 51, wil: 34 },
      elite2_lv40: { hp: 2689, atk: 150, str: 45, agi: 46, int: 83, wil: 57 },
      elite3_lv60: { hp: 3811, atk: 211, str: 64, agi: 65, int: 114, wil: 79 },
      elite4_lv80: { hp: 4934, atk: 272, str: 82, agi: 84, int: 145, wil: 102 },
    },
    maxStats: { hp: 5495, atk: 303, str: 91, agi: 93, int: 161, wil: 113 },
  },
  Snowshine: {
    rarity: 5, mainAttribute: 'str', secondaryAttribute: 'wil',
    baseStats: { hp: 500, atk: 30, str: 18, agi: 12, int: 9, wil: 11 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 87, str: 47, agi: 32, int: 27, wil: 31 },
      elite2_lv40: { hp: 2689, atk: 147, str: 78, agi: 52, int: 46, wil: 53 },
      elite3_lv60: { hp: 3811, atk: 207, str: 108, agi: 73, int: 65, wil: 75 },
      elite4_lv80: { hp: 4934, atk: 267, str: 139, agi: 94, int: 84, wil: 97 },
    },
    maxStats: { hp: 5495, atk: 297, str: 154, agi: 104, int: 93, wil: 108 },
  },
  Wulfgard: {
    rarity: 5, mainAttribute: 'str', secondaryAttribute: 'wil',
    baseStats: { hp: 500, atk: 30, str: 20, agi: 9, int: 9, wil: 12 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 91, str: 50, agi: 28, int: 28, wil: 33 },
      elite2_lv40: { hp: 2689, atk: 155, str: 82, agi: 47, int: 47, wil: 55 },
      elite3_lv60: { hp: 3811, atk: 220, str: 113, agi: 67, int: 66, wil: 77 },
      elite4_lv80: { hp: 4934, atk: 284, str: 145, agi: 86, int: 84, wil: 100 },
    },
    maxStats: { hp: 5495, atk: 316, str: 162, agi: 95, int: 93, wil: 112 },
  },
  Xaihi: {
    rarity: 5, mainAttribute: 'wil', secondaryAttribute: 'int',
    baseStats: { hp: 500, atk: 30, str: 9, agi: 9, int: 15, wil: 15 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 85, str: 26, agi: 27, int: 37, wil: 43 },
      elite2_lv40: { hp: 2689, atk: 144, str: 44, agi: 45, int: 62, wil: 73 },
      elite3_lv60: { hp: 3811, atk: 203, str: 62, agi: 64, int: 87, wil: 103 },
      elite4_lv80: { hp: 4934, atk: 262, str: 80, agi: 82, int: 114, wil: 134 },
    },
    maxStats: { hp: 5495, atk: 293, str: 89, agi: 91, int: 127, wil: 150 },
  },
  Akekuri: {
    rarity: 4, mainAttribute: 'agi', secondaryAttribute: 'wil',
    baseStats: { hp: 500, atk: 30, str: 13, agi: 15, int: 12, wil: 9 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 92, str: 34, agi: 42, int: 32, wil: 30 },
      elite2_lv40: { hp: 2689, atk: 157, str: 55, agi: 70, int: 53, wil: 52 },
      elite3_lv60: { hp: 3811, atk: 222, str: 77, agi: 98, int: 75, wil: 74 },
      elite4_lv80: { hp: 4934, atk: 287, str: 99, agi: 126, int: 96, wil: 96 },
    },
    maxStats: { hp: 5495, atk: 319, str: 110, agi: 140, int: 107, wil: 108 },
  },
  Antal: {
    rarity: 4, mainAttribute: 'int', secondaryAttribute: 'str',
    baseStats: { hp: 500, atk: 30, str: 15, agi: 9, int: 15, wil: 9 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 87, str: 40, agi: 27, int: 44, wil: 25 },
      elite2_lv40: { hp: 2689, atk: 147, str: 65, agi: 45, int: 74, wil: 42 },
      elite3_lv60: { hp: 3811, atk: 207, str: 91, agi: 64, int: 104, wil: 59 },
      elite4_lv80: { hp: 4934, atk: 267, str: 116, agi: 83, int: 135, wil: 76 },
    },
    maxStats: { hp: 5495, atk: 297, str: 129, agi: 86, int: 165, wil: 82 },
  },
  Catcher: {
    rarity: 4, mainAttribute: 'str', secondaryAttribute: 'wil',
    baseStats: { hp: 500, atk: 30, str: 21, agi: 9, int: 8, wil: 11 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 88, str: 54, agi: 28, int: 25, wil: 31 },
      elite2_lv40: { hp: 2689, atk: 148, str: 89, agi: 47, int: 42, wil: 53 },
      elite3_lv60: { hp: 3811, atk: 209, str: 124, agi: 67, int: 60, wil: 74 },
      elite4_lv80: { hp: 4934, atk: 270, str: 159, agi: 87, int: 77, wil: 96 },
    },
    maxStats: { hp: 5495, atk: 300, str: 176, agi: 96, int: 86, wil: 106 },
  },
  Estella: {
    rarity: 4, mainAttribute: 'wil', secondaryAttribute: 'str',
    baseStats: { hp: 500, atk: 30, str: 13, agi: 8, int: 14, wil: 15 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 90, str: 32, agi: 27, int: 34, wil: 44 },
      elite2_lv40: { hp: 2689, atk: 153, str: 53, agi: 47, int: 56, wil: 74 },
      elite3_lv60: { hp: 3811, atk: 217, str: 73, agi: 67, int: 78, wil: 105 },
      elite4_lv80: { hp: 4934, atk: 280, str: 94, agi: 87, int: 99, wil: 136 },
    },
    maxStats: { hp: 5495, atk: 312, str: 104, agi: 97, int: 110, wil: 151 },
  },
  Fluorite: {
    rarity: 4, mainAttribute: 'agi', secondaryAttribute: 'int',
    baseStats: { hp: 500, atk: 30, str: 14, agi: 14, int: 12, wil: 10 },
    eliteProgression: {
      elite1_lv20: { hp: 1566, atk: 88, str: 30, agi: 47, int: 34, wil: 27 },
      elite2_lv40: { hp: 2689, atk: 150, str: 47, agi: 81, int: 57, wil: 45 },
      elite3_lv60: { hp: 3811, atk: 211, str: 64, agi: 116, int: 80, wil: 64 },
      elite4_lv80: { hp: 4934, atk: 272, str: 81, agi: 150, int: 103, wil: 82 },
    },
    maxStats: { hp: 5495, atk: 303, str: 90, agi: 168, int: 115, wil: 91 },
  },
};

/**
 * Interpolate operator stats at any level within an elite tier.
 *
 * The game uses linear interpolation between elite tier checkpoints:
 * - Elite 0: Lv 1-20 (base -> elite1_lv20)
 * - Elite 1: Lv 20-40 (elite1_lv20 -> elite2_lv40)
 * - Elite 2: Lv 40-60 (elite2_lv40 -> elite3_lv60)
 * - Elite 3: Lv 60-80 (elite3_lv60 -> elite4_lv80)
 * - Elite 4: Lv 80-90 (elite4_lv80 -> maxStats) — only accessible after Elite 4 promotion
 *
 * @param charName - Operator name matching OPERATOR_STATS key
 * @param level - Current level (1-90)
 * @param breakthrough - Current breakthrough/elite tier (0-4)
 * @returns Interpolated stats object { hp, atk, str, agi, int, wil }
 */
export function getOperatorStatsAtLevel(
  charName: string,
  level: number,
  breakthrough: number
): { hp: number; atk: number; str: number; agi: number; int: number; wil: number } | null {
  const data = OPERATOR_STATS[charName];
  if (!data) return null;

  // Determine level cap based on breakthrough
  const caps = [20, 40, 60, 80, 90];
  const maxLevel = caps[Math.min(breakthrough, 4)];
  const clampedLevel = Math.min(level, maxLevel);

  // Define interpolation ranges
  const ranges = [
    { minLv: 1, maxLv: 20, from: data.baseStats, to: data.eliteProgression.elite1_lv20 },
    { minLv: 20, maxLv: 40, from: data.eliteProgression.elite1_lv20, to: data.eliteProgression.elite2_lv40 },
    { minLv: 40, maxLv: 60, from: data.eliteProgression.elite2_lv40, to: data.eliteProgression.elite3_lv60 },
    { minLv: 60, maxLv: 80, from: data.eliteProgression.elite3_lv60, to: data.eliteProgression.elite4_lv80 },
    { minLv: 80, maxLv: 90, from: data.eliteProgression.elite4_lv80, to: data.maxStats },
  ];

  // Find the correct range for the current level
  let range = ranges[0];
  for (const r of ranges) {
    if (clampedLevel >= r.minLv) range = r;
    else break;
  }

  // Linear interpolation within the range
  const t = range.maxLv > range.minLv
    ? Math.max(0, Math.min(1, (clampedLevel - range.minLv) / (range.maxLv - range.minLv)))
    : 0;

  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);

  return {
    hp: lerp(range.from.hp, range.to.hp),
    atk: lerp(range.from.atk, range.to.atk),
    str: lerp(range.from.str, range.to.str),
    agi: lerp(range.from.agi, range.to.agi),
    int: lerp(range.from.int, range.to.int),
    wil: lerp(range.from.wil, range.to.wil),
  };
}

/**
 * Get the flat attribute bonus from the operator's passive talent (Forged/Skirmisher/Keen Mind/Stalwart).
 * These are cumulative: +10 at E1, +25 at E2, +40 at E3, +60 at E4.
 *
 * @returns Object with the attribute key and bonus value
 */
export function getTalentAttributeBonus(
  charName: string,
  breakthrough: number
): { attribute: 'str' | 'agi' | 'int' | 'wil'; bonus: number } | null {
  const data = OPERATOR_STATS[charName];
  if (!data || breakthrough < 1) return null;

  const bonus = TALENT_ATTRIBUTE_BONUSES[Math.min(breakthrough, 4)];
  return { attribute: data.mainAttribute, bonus };
}
