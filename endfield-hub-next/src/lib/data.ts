import type { Character, Weapon, Recipe, Element, Role, WeaponType } from '../types/game';

// Static character data - verified against EndfieldTools.dev game API (attributes at Lv.90)
export const CHARACTERS: Character[] = [
  // 6-star operators
  { id: 1, Name: 'Ardelia', Slug: 'ardelia', Rarity: 6, Element: 'Nature', Role: 'Supporter', WeaponType: 'Arts Unit', Strength: 112, Agility: 94, Intellect: 146, Will: 118, Description: 'A Nature Supporter who excels at healing and buffing allies with potent Nature-based abilities.' },
  { id: 2, Name: 'Ember', Slug: 'ember', Rarity: 6, Element: 'Heat', Role: 'Defender', WeaponType: 'Greatsword', Strength: 176, Agility: 97, Intellect: 87, Will: 120, Description: 'A Heat Defender who shields the team with Vulnerable application and combo-triggered healing.' },
  { id: 3, Name: 'Endministrator', Slug: 'endministrator', Rarity: 6, Element: 'Physical', Role: 'Guard', WeaponType: 'Sword', Strength: 124, Agility: 141, Intellect: 97, Will: 107, Description: 'The protagonist. A versatile Physical Guard with adaptive combat skills and balanced stats.' },
  { id: 4, Name: 'Gilberta', Slug: 'gilberta', Rarity: 6, Element: 'Nature', Role: 'Supporter', WeaponType: 'Arts Unit', Strength: 90, Agility: 93, Intellect: 127, Will: 172, Description: 'A Nature Supporter specializing in sustained team support and Nature elemental buffs.' },
  { id: 5, Name: 'Laevatain', Slug: 'laevatain', Rarity: 6, Element: 'Heat', Role: 'Assault', WeaponType: 'Sword', Strength: 121, Agility: 100, Intellect: 178, Will: 90, Description: 'A Heat Assault operator with explosive burst damage and high Intellect scaling.' },
  { id: 6, Name: 'Last Rite', Slug: 'last-rite', Rarity: 6, Element: 'Cryo', Role: 'Assault', WeaponType: 'Greatsword', Strength: 155, Agility: 104, Intellect: 94, Will: 109, Description: 'A Cryo Assault operator who delivers devastating greatsword strikes with frost effects.' },
  { id: 7, Name: 'Lifeng', Slug: 'lifeng', Rarity: 6, Element: 'Physical', Role: 'Guard', WeaponType: 'Polearm', Strength: 124, Agility: 132, Intellect: 116, Will: 118, Description: 'A Physical Guard with well-rounded stats and disciplined polearm techniques.' },
  { id: 8, Name: 'Pogranichnik', Slug: 'pogranichnik', Rarity: 6, Element: 'Physical', Role: 'Vanguard', WeaponType: 'Sword', Strength: 101, Agility: 110, Intellect: 97, Will: 173, Description: 'A Physical Vanguard with high Will and sword-based field control capabilities.' },
  { id: 9, Name: 'Yvonne', Slug: 'yvonne', Rarity: 6, Element: 'Cryo', Role: 'Assault', WeaponType: 'Handcannon', Strength: 83, Agility: 128, Intellect: 177, Will: 105, Description: 'A Cryo Assault operator with ranged handcannon attacks and high Intellect for devastating cryo damage.' },
  // 5-star operators
  { id: 10, Name: 'Alesh', Slug: 'alesh', Rarity: 5, Element: 'Cryo', Role: 'Vanguard', WeaponType: 'Sword', Strength: 158, Agility: 96, Intellect: 126, Will: 90, Description: 'A Cryo Vanguard with high Strength and sword techniques for aggressive frontline combat.' },
  { id: 11, Name: 'Arclight', Slug: 'arclight', Rarity: 5, Element: 'Electric', Role: 'Vanguard', WeaponType: 'Sword', Strength: 108, Agility: 145, Intellect: 124, Will: 100, Description: 'An Electric Vanguard with lightning-fast sword techniques and high Agility.' },
  { id: 12, Name: 'Avywenna', Slug: 'avywenna', Rarity: 5, Element: 'Electric', Role: 'Assault', WeaponType: 'Polearm', Strength: 107, Agility: 107, Intellect: 111, Will: 149, Description: 'An Electric Assault operator with balanced stats and polearm-based chain attacks.' },
  { id: 13, Name: 'Chen Qianyu', Slug: 'chen-qianyu', Rarity: 5, Element: 'Physical', Role: 'Guard', WeaponType: 'Sword', Strength: 107, Agility: 172, Intellect: 86, Will: 94, Description: 'A Physical Guard with exceptional Agility and precise sword counter abilities.' },
  { id: 14, Name: 'Da Pan', Slug: 'da-pan', Rarity: 5, Element: 'Physical', Role: 'Assault', WeaponType: 'Greatsword', Strength: 175, Agility: 97, Intellect: 95, Will: 102, Description: 'A Physical Assault operator with raw Strength and heavy greatsword strikes.' },
  { id: 15, Name: 'Perlica', Slug: 'perlica', Rarity: 5, Element: 'Electric', Role: 'Caster', WeaponType: 'Arts Unit', Strength: 92, Agility: 94, Intellect: 162, Will: 114, Description: 'An Electric Caster who channels arts-based lightning to deal sustained elemental damage.' },
  { id: 16, Name: 'Snowshine', Slug: 'snowshine', Rarity: 5, Element: 'Cryo', Role: 'Defender', WeaponType: 'Greatsword', Strength: 155, Agility: 105, Intellect: 94, Will: 109, Description: 'A Cryo Defender who creates frozen terrain and shields allies with greatsword techniques.' },
  { id: 17, Name: 'Wulfgard', Slug: 'wulfgard', Rarity: 5, Element: 'Heat', Role: 'Caster', WeaponType: 'Handcannon', Strength: 162, Agility: 95, Intellect: 93, Will: 112, Description: 'A Heat Caster with ranged handcannon arts and burn application.' },
  { id: 18, Name: 'Xaihi', Slug: 'xaihi', Rarity: 5, Element: 'Cryo', Role: 'Supporter', WeaponType: 'Arts Unit', Strength: 90, Agility: 92, Intellect: 127, Will: 150, Description: 'A Cryo Supporter providing shields and frost resistance buffs with high Will.' },
  // 4-star operators
  { id: 19, Name: 'Akekuri', Slug: 'akekuri', Rarity: 4, Element: 'Heat', Role: 'Vanguard', WeaponType: 'Sword', Strength: 110, Agility: 141, Intellect: 107, Will: 108, Description: 'A Heat Vanguard with swift sword attacks and burn application.' },
  { id: 20, Name: 'Antal', Slug: 'antal', Rarity: 4, Element: 'Electric', Role: 'Supporter', WeaponType: 'Arts Unit', Strength: 129, Agility: 87, Intellect: 165, Will: 83, Description: 'An Electric Supporter with powerful arts-based buffs and high Intellect.' },
  { id: 21, Name: 'Catcher', Slug: 'catcher', Rarity: 4, Element: 'Physical', Role: 'Defender', WeaponType: 'Greatsword', Strength: 176, Agility: 97, Intellect: 87, Will: 107, Description: 'A Physical Defender specializing in damage mitigation with greatsword techniques.' },
  { id: 22, Name: 'Estella', Slug: 'estella', Rarity: 4, Element: 'Cryo', Role: 'Guard', WeaponType: 'Polearm', Strength: 105, Agility: 98, Intellect: 111, Will: 152, Description: 'A Cryo Guard with polearm techniques and high Will for sustained combat.' },
  { id: 23, Name: 'Fluorite', Slug: 'fluorite', Rarity: 4, Element: 'Nature', Role: 'Caster', WeaponType: 'Handcannon', Strength: 90, Agility: 168, Intellect: 115, Will: 92, Description: 'A Nature Caster with high Agility and ranged handcannon arts.' },
];

// Real Endfield weapons derived from verified asset data
export const WEAPONS: Weapon[] = [
  // 6-star Greatswords
  { id: 1, Name: 'Exemplar', Slug: 'exemplar', Rarity: 6, WeaponType: 'Greatsword' },
  { id: 2, Name: 'Former Finery', Slug: 'former-finery', Rarity: 6, WeaponType: 'Greatsword' },
  { id: 3, Name: 'Thunderberge', Slug: 'thunderberge', Rarity: 6, WeaponType: 'Greatsword' },
  { id: 4, Name: 'Sundered Prince', Slug: 'sundered-prince', Rarity: 6, WeaponType: 'Greatsword' },
  { id: 5, Name: 'Khravengger', Slug: 'khravengger', Rarity: 6, WeaponType: 'Greatsword' },
  // 6-star Arts Units
  { id: 6, Name: 'Opus: Etch Figure', Slug: 'opus-etch-figure', Rarity: 6, WeaponType: 'Arts Unit' },
  { id: 7, Name: 'Detonation Unit', Slug: 'detonation-unit', Rarity: 6, WeaponType: 'Arts Unit' },
  { id: 8, Name: 'Oblivion', Slug: 'oblivion', Rarity: 6, WeaponType: 'Arts Unit' },
  { id: 9, Name: 'Chivalric Virtues', Slug: 'chivalric-virtues', Rarity: 6, WeaponType: 'Arts Unit' },
  { id: 10, Name: 'Delivery Guaranteed', Slug: 'delivery-guaranteed', Rarity: 6, WeaponType: 'Arts Unit' },
  { id: 11, Name: 'Dreams of the Starry Beach', Slug: 'dreams-of-the-starry-beach', Rarity: 6, WeaponType: 'Arts Unit' },
  // 6-star Polearms
  { id: 12, Name: 'Valiant', Slug: 'valiant', Rarity: 6, WeaponType: 'Polearm' },
  { id: 13, Name: 'JET', Slug: 'jet', Rarity: 6, WeaponType: 'Polearm' },
  { id: 14, Name: 'Mountain Bearer', Slug: 'mountain-bearer', Rarity: 6, WeaponType: 'Polearm' },
  // 6-star Handcannons
  { id: 15, Name: 'Navigator', Slug: 'navigator', Rarity: 6, WeaponType: 'Handcannon' },
  { id: 16, Name: 'Wedge', Slug: 'wedge', Rarity: 6, WeaponType: 'Handcannon' },
  { id: 17, Name: 'Clannibal', Slug: 'clannibal', Rarity: 6, WeaponType: 'Handcannon' },
  { id: 18, Name: 'Artzy Tyrannical', Slug: 'artzy-tyrannical', Rarity: 6, WeaponType: 'Handcannon' },
  // 6-star Swords
  { id: 19, Name: 'Forgeborn Scathe', Slug: 'forgeborn-scathe', Rarity: 6, WeaponType: 'Sword' },
  { id: 20, Name: 'Umbral Torch', Slug: 'umbral-torch', Rarity: 6, WeaponType: 'Sword' },
  { id: 21, Name: 'Rapid Ascent', Slug: 'rapid-ascent', Rarity: 6, WeaponType: 'Sword' },
  { id: 22, Name: 'Thermite Cutter', Slug: 'thermite-cutter', Rarity: 6, WeaponType: 'Sword' },
  { id: 23, Name: 'Eminent Repute', Slug: 'eminent-repute', Rarity: 6, WeaponType: 'Sword' },
  { id: 24, Name: 'White Night Nova', Slug: 'white-night-nova', Rarity: 6, WeaponType: 'Sword' },
  { id: 25, Name: 'Never Rest', Slug: 'never-rest', Rarity: 6, WeaponType: 'Sword' },
  { id: 26, Name: 'Grand Vision', Slug: 'grand-vision', Rarity: 6, WeaponType: 'Sword' },
  // 5-star Greatswords
  { id: 27, Name: 'Seeker of Dark Lung', Slug: 'seeker-of-dark-lung', Rarity: 5, WeaponType: 'Greatsword' },
  { id: 28, Name: 'Finishing Call', Slug: 'finishing-call', Rarity: 5, WeaponType: 'Greatsword' },
  { id: 29, Name: 'Ancient Canal', Slug: 'ancient-canal', Rarity: 5, WeaponType: 'Greatsword' },
  { id: 30, Name: 'OBJ Heavy Burden', Slug: 'obj-heavy-burden', Rarity: 5, WeaponType: 'Greatsword' },
  // 5-star Arts Units
  { id: 31, Name: 'Wild Wanderer', Slug: 'wild-wanderer', Rarity: 5, WeaponType: 'Arts Unit' },
  { id: 32, Name: 'Stanza of Memorials', Slug: 'stanza-of-memorials', Rarity: 5, WeaponType: 'Arts Unit' },
  { id: 33, Name: 'Monaihe', Slug: 'monaihe', Rarity: 5, WeaponType: 'Arts Unit' },
  { id: 34, Name: 'Freedom to Proselytize', Slug: 'freedom-to-proselytize', Rarity: 5, WeaponType: 'Arts Unit' },
  { id: 35, Name: 'OBJ Arts Identifier', Slug: 'obj-arts-identifier', Rarity: 5, WeaponType: 'Arts Unit' },
  // 5-star Polearms
  { id: 36, Name: 'Chimeric Justice', Slug: 'chimeric-justice', Rarity: 5, WeaponType: 'Polearm' },
  { id: 37, Name: 'Cohesive Traction', Slug: 'cohesive-traction', Rarity: 5, WeaponType: 'Polearm' },
  { id: 38, Name: 'OBJ Razorhorn', Slug: 'obj-razorhorn', Rarity: 5, WeaponType: 'Polearm' },
  // 5-star Handcannons
  { id: 39, Name: 'Rational Farewell', Slug: 'rational-farewell', Rarity: 5, WeaponType: 'Handcannon' },
  { id: 40, Name: 'Opus: The Living', Slug: 'opus-the-living', Rarity: 5, WeaponType: 'Handcannon' },
  { id: 41, Name: 'OBJ Velocitous', Slug: 'obj-velocitous', Rarity: 5, WeaponType: 'Handcannon' },
  // 5-star Swords
  { id: 42, Name: 'Sundering Steel', Slug: 'sundering-steel', Rarity: 5, WeaponType: 'Sword' },
  { id: 43, Name: 'Fortmaker', Slug: 'fortmaker', Rarity: 5, WeaponType: 'Sword' },
  { id: 44, Name: 'Aspirant', Slug: 'aspirant', Rarity: 5, WeaponType: 'Sword' },
  { id: 45, Name: 'Twelve Questions', Slug: 'twelve-questions', Rarity: 5, WeaponType: 'Sword' },
  { id: 46, Name: 'OBJ Edge of Lightness', Slug: 'obj-edge-of-lightness', Rarity: 5, WeaponType: 'Sword' },
  { id: 47, Name: 'Finchaser 3.0', Slug: 'finchaser-3-0', Rarity: 5, WeaponType: 'Sword' },
  // 4-star
  { id: 48, Name: 'Industry 0.1', Slug: 'industry-0-1', Rarity: 4, WeaponType: 'Greatsword' },
  { id: 49, Name: 'Quencher', Slug: 'quencher', Rarity: 4, WeaponType: 'Greatsword' },
  { id: 50, Name: 'Hypernova Auto', Slug: 'hypernova-auto', Rarity: 4, WeaponType: 'Arts Unit' },
  { id: 51, Name: 'Fluorescent Roc', Slug: 'fluorescent-roc', Rarity: 4, WeaponType: 'Arts Unit' },
  { id: 52, Name: "Pathfinder's Beacon", Slug: 'pathfinders-beacon', Rarity: 4, WeaponType: 'Polearm' },
  { id: 53, Name: 'Aggeloslayer', Slug: 'aggeloslayer', Rarity: 4, WeaponType: 'Polearm' },
  { id: 54, Name: 'Howling Guard', Slug: 'howling-guard', Rarity: 4, WeaponType: 'Handcannon' },
  { id: 55, Name: 'Long Road', Slug: 'long-road', Rarity: 4, WeaponType: 'Handcannon' },
  { id: 56, Name: 'Contingent Measure', Slug: 'contingent-measure', Rarity: 4, WeaponType: 'Sword' },
  { id: 57, Name: 'Wave Tide', Slug: 'wave-tide', Rarity: 4, WeaponType: 'Sword' },
  // 3-star
  { id: 58, Name: 'Darhoff 7', Slug: 'darhoff-7', Rarity: 3, WeaponType: 'Greatsword' },
  { id: 59, Name: 'Jiminy 12', Slug: 'jiminy-12', Rarity: 3, WeaponType: 'Arts Unit' },
  { id: 60, Name: 'Opero 77', Slug: 'opero-77', Rarity: 3, WeaponType: 'Polearm' },
  { id: 61, Name: 'Peco 5', Slug: 'peco-5', Rarity: 3, WeaponType: 'Handcannon' },
  { id: 62, Name: 'Tarr 11', Slug: 'tarr-11', Rarity: 3, WeaponType: 'Sword' },
];

// Recipes - keeping structure but marking as unverified placeholder data
// Real Endfield crafting uses AIC Factory system
export const RECIPES: Recipe[] = [
  { id: 1, Name: 'Iron Ingot', Slug: 'iron-ingot', Category: 'Processed Material', Inputs: [{ item: 'Iron Ore', quantity: 3 }], Outputs: [{ item: 'Iron Ingot', quantity: 1 }], CraftingTime: 30, FacilityRequired: 'Smelter', FacilityLevel: 1, ThroughputPerMin: 2 },
  { id: 2, Name: 'Steel Plate', Slug: 'steel-plate', Category: 'Processed Material', Inputs: [{ item: 'Iron Ingot', quantity: 2 }, { item: 'Coal', quantity: 1 }], Outputs: [{ item: 'Steel Plate', quantity: 1 }], CraftingTime: 60, FacilityRequired: 'Smelter', FacilityLevel: 2, ThroughputPerMin: 1 },
  { id: 3, Name: 'Circuit Board', Slug: 'circuit-board', Category: 'Component', Inputs: [{ item: 'Copper Wire', quantity: 3 }, { item: 'Silicon Wafer', quantity: 1 }], Outputs: [{ item: 'Circuit Board', quantity: 1 }], CraftingTime: 90, FacilityRequired: 'Assembler', FacilityLevel: 2, ThroughputPerMin: 0.67 },
  { id: 4, Name: 'Copper Wire', Slug: 'copper-wire', Category: 'Processed Material', Inputs: [{ item: 'Copper Ore', quantity: 2 }], Outputs: [{ item: 'Copper Wire', quantity: 3 }], CraftingTime: 20, FacilityRequired: 'Wire Press', FacilityLevel: 1, ThroughputPerMin: 9 },
  { id: 5, Name: 'Advanced Alloy', Slug: 'advanced-alloy', Category: 'Processed Material', Inputs: [{ item: 'Steel Plate', quantity: 2 }, { item: 'Titanium Ore', quantity: 1 }], Outputs: [{ item: 'Advanced Alloy', quantity: 1 }], CraftingTime: 120, FacilityRequired: 'Smelter', FacilityLevel: 3, ThroughputPerMin: 0.5 },
  { id: 6, Name: 'Power Cell', Slug: 'power-cell', Category: 'Component', Inputs: [{ item: 'Circuit Board', quantity: 1 }, { item: 'Lithium Crystal', quantity: 2 }], Outputs: [{ item: 'Power Cell', quantity: 1 }], CraftingTime: 150, FacilityRequired: 'Assembler', FacilityLevel: 3, ThroughputPerMin: 0.4 },
  { id: 7, Name: 'Silicon Wafer', Slug: 'silicon-wafer', Category: 'Processed Material', Inputs: [{ item: 'Sand', quantity: 5 }], Outputs: [{ item: 'Silicon Wafer', quantity: 2 }], CraftingTime: 45, FacilityRequired: 'Chemical Plant', FacilityLevel: 1, ThroughputPerMin: 2.67 },
  { id: 8, Name: 'Polymer Sheet', Slug: 'polymer-sheet', Category: 'Processed Material', Inputs: [{ item: 'Crude Oil', quantity: 3 }], Outputs: [{ item: 'Polymer Sheet', quantity: 2 }], CraftingTime: 60, FacilityRequired: 'Chemical Plant', FacilityLevel: 2, ThroughputPerMin: 2 },
  { id: 9, Name: 'Motor Unit', Slug: 'motor-unit', Category: 'Component', Inputs: [{ item: 'Copper Wire', quantity: 4 }, { item: 'Iron Ingot', quantity: 2 }, { item: 'Magnetic Core', quantity: 1 }], Outputs: [{ item: 'Motor Unit', quantity: 1 }], CraftingTime: 180, FacilityRequired: 'Assembler', FacilityLevel: 3, ThroughputPerMin: 0.33 },
  { id: 10, Name: 'Originium Shard', Slug: 'originium-shard', Category: 'Raw Material', Inputs: [{ item: 'Raw Originium', quantity: 1 }], Outputs: [{ item: 'Originium Shard', quantity: 3 }], CraftingTime: 40, FacilityRequired: 'Crusher', FacilityLevel: 1, ThroughputPerMin: 4.5 },
];

export const ELEMENTS: Element[] = ['Physical', 'Heat', 'Cryo', 'Electric', 'Nature'];
export const ROLES: Role[] = ['Guard', 'Defender', 'Supporter', 'Caster', 'Vanguard', 'Assault'];
export const WEAPON_TYPES: WeaponType[] = ['Greatsword', 'Polearm', 'Handcannon', 'Sword', 'Arts Unit'];
