/**
 * Comprehensive Endfield gear data scraped from EndfieldTools.dev
 * Gear system: 3-piece set bonuses, tiers T0-T4, individual pieces with stats
 */

const CDN = 'https://endfieldtools.dev/assets/images/endfield';

// Tier colors for UI
export const TIER_COLORS: Record<string, string> = {
  T0: '#888888',
  T1: '#CCCCCC',
  T2: '#3498DB',
  T3: '#9B59B6',
  T4: '#FFD429',
};

export const TIER_BORDER_COLORS: Record<string, string> = {
  T0: '#555555',
  T1: '#888888',
  T2: '#2980B9',
  T3: '#8E44AD',
  T4: '#FFD429',
};

export type GearTier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4';
export type GamePhase = 'Late Game (Lv70)' | 'Mid Game (Lv36-50)' | 'Early Game (Lv10-28)';

export interface GearStat {
  name: string;
  value: string; // e.g. "+42", "+65", "+23.0%", "-17.1%"
}

export interface GearPiece {
  id: number;
  name: string;
  setName: string | null; // null for standalone
  tier: GearTier;
  level: number;
  def: number;
  stats: GearStat[];
  icon?: string;
}

export interface GearSet {
  name: string;
  phase: GamePhase;
  setBonus: string; // 3-piece set effect
  pieces: GearPiece[];
  icon?: string;
}

export interface StandaloneGearGroup {
  phase: GamePhase;
  pieces: GearPiece[];
}

let _id = 0;
const nextId = () => ++_id;

// ============================================================
// LATE GAME (Lv70) — Tier 4 Sets
// ============================================================

export const GEAR_SETS: GearSet[] = [
  {
    name: 'Æthertech',
    phase: 'Late Game (Lv70)',
    setBonus: "3-piece set effect: Wearer's ATK +8%. After the wearer applies Vulnerability, the wearer gains Physical DMG +8% for 15s. This effect can reach 4 stacks. If the target already has 4 stack(s) of Vulnerability, the wearer gains an additional Physical DMG +16% for 10s. This effect cannot stack.",
    icon: `${CDN}/itemicon/item_equip_t4_suit_poise01_body_01.png`,
    pieces: [
      { id: nextId(), name: 'Æthertech Gloves', setName: 'Æthertech', tier: 'T4', level: 70, def: 42, stats: [{ name: 'Agility', value: '+65' }, { name: 'Strength', value: '+43' }, { name: 'Arts Intensity', value: '+35' }], icon: `${CDN}/itemicon/item_equip_t4_suit_poise01_hand_01.png` },
      { id: nextId(), name: 'Æthertech Stabilizer', setName: 'Æthertech', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Agility', value: '+32' }, { name: 'Strength', value: '+21' }, { name: 'Arts Intensity', value: '+41' }], icon: `${CDN}/itemicon/item_equip_t4_suit_poise01_edc_02.png` },
      { id: nextId(), name: 'Æthertech Analysis Band', setName: 'Æthertech', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Strength', value: '+32' }, { name: 'Will', value: '+21' }, { name: 'Physical DMG', value: '+23.0%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_poise01_edc_01.png` },
      { id: nextId(), name: 'Æthertech Plating', setName: 'Æthertech', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Strength', value: '+87' }, { name: 'Will', value: '+58' }, { name: 'DMG to Broken', value: '+20.7%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_poise01_body_01.png` },
    ],
  },
  {
    name: 'Bonekrusha',
    phase: 'Late Game (Lv70)',
    setBonus: "3-piece set effect: Wearer's ATK +15%. When the wearer casts a combo skill, the wearer gains 1 stack of Bonekrushing Smash that grants the wearer's next battle skill DMG Dealt +30%. Bonekrushing Smash can stack 2 time(s).",
    icon: `${CDN}/itemicon/item_equip_t4_suit_attri01_body_03.png`,
    pieces: [
      { id: nextId(), name: 'Bonekrusha Poncho', setName: 'Bonekrusha', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Will', value: '+87' }, { name: 'Strength', value: '+58' }, { name: 'Combo Skill DMG', value: '+20.7%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_attri01_body_01.png` },
      { id: nextId(), name: 'Bonekrusha Heavy Armor', setName: 'Bonekrusha', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Agility', value: '+87' }, { name: 'Intellect', value: '+58' }, { name: 'Ultimate SP Gain', value: '+12.3%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_attri01_body_02.png` },
      { id: nextId(), name: 'Bonekrusha Poncho T1', setName: 'Bonekrusha', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Will', value: '+87' }, { name: 'Agility', value: '+58' }, { name: 'Ultimate SP Gain', value: '+12.3%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_attri01_body_03.png` },
      { id: nextId(), name: 'Bonekrusha Figurine', setName: 'Bonekrusha', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Will', value: '+32' }, { name: 'Agility', value: '+21' }, { name: 'Normal Skill DMG', value: '+41.4%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_attri01_edc_01.png` },
      { id: nextId(), name: 'Bonekrusha Figurine T1', setName: 'Bonekrusha', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Will', value: '+32' }, { name: 'Intellect', value: '+21' }, { name: 'Combo Skill DMG', value: '+41.4%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_attri01_edc_02.png` },
      { id: nextId(), name: 'Bonekrusha Mask', setName: 'Bonekrusha', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Agility', value: '+32' }, { name: 'Strength', value: '+21' }, { name: 'DMG to Broken', value: '+41.4%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_attri01_edc_03.png` },
      { id: nextId(), name: 'Bonekrusha Mask T1', setName: 'Bonekrusha', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Agility', value: '+32' }, { name: 'Strength', value: '+21' }, { name: 'Crit Rate', value: '+10.3%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_attri01_edc_04.png` },
      { id: nextId(), name: 'Bonekrusha Heavy Armor T1', setName: 'Bonekrusha', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Agility', value: '+87' }, { name: 'Strength', value: '+58' }, { name: 'Combo Skill DMG', value: '+20.7%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_attri01_body_04.png` },
    ],
  },
  {
    name: 'Eternal Xiranite',
    phase: 'Late Game (Lv70)',
    setBonus: "3-piece set effect: Wearer's HP +1000. After the wearer applies Amp, Protected, Susceptibility, or Weakened, other teammates gain DMG Dealt +16% for 15s. This effect cannot stack.",
    icon: `${CDN}/itemicon/item_equip_t4_suit_usp02_body_01.png`,
    pieces: [
      { id: nextId(), name: 'Eternal Xiranite Auxiliary Arm', setName: 'Eternal Xiranite', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Will', value: '+32' }, { name: 'Intellect', value: '+21' }, { name: 'Ultimate SP Gain', value: '+24.6%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_usp02_edc_01.png` },
      { id: nextId(), name: 'Eternal Xiranite Power Core T1', setName: 'Eternal Xiranite', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Intellect', value: '+32' }, { name: 'Will', value: '+21' }, { name: 'Heal Output', value: '+20.7%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_usp02_edc_02.png` },
      { id: nextId(), name: 'Eternal Xiranite Power Core', setName: 'Eternal Xiranite', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Intellect', value: '+32' }, { name: 'Strength', value: '+21' }, { name: 'Ultimate SP Gain', value: '+24.6%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_usp02_edc_03.png` },
      { id: nextId(), name: 'Eternal Xiranite Gloves', setName: 'Eternal Xiranite', tier: 'T4', level: 70, def: 42, stats: [{ name: 'Intellect', value: '+65' }, { name: 'Strength', value: '+43' }, { name: 'Ultimate SP Gain', value: '+20.5%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_usp02_hand_01.png` },
      { id: nextId(), name: 'Eternal Xiranite Gloves T1', setName: 'Eternal Xiranite', tier: 'T4', level: 70, def: 42, stats: [{ name: 'Intellect', value: '+65' }, { name: 'Will', value: '+43' }, { name: 'Ultimate SP Gain', value: '+20.5%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_usp02_hand_02.png` },
      { id: nextId(), name: 'Eternal Xiranite Armor', setName: 'Eternal Xiranite', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Will', value: '+87' }, { name: 'Intellect', value: '+58' }, { name: 'Arts Intensity', value: '+21' }], icon: `${CDN}/itemicon/item_equip_t4_suit_usp02_body_01.png` },
    ],
  },
  {
    name: 'Frontiers',
    phase: 'Late Game (Lv70)',
    setBonus: "3-piece set effect: Wearer's Combo Skill Cooldown Reduction +15%. After the wearer's skill recovers SP, the team gains DMG +16% for 15s. This effect cannot stack.",
    pieces: [
      { id: nextId(), name: 'Frontiers Armor T2', setName: 'Frontiers', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Agility', value: '+87' }, { name: 'Intellect', value: '+58' }, { name: 'Normal Skill DMG', value: '+20.7%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_frontier01_body_01.png` },
      { id: nextId(), name: 'Frontiers Comm', setName: 'Frontiers', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Strength', value: '+32' }, { name: 'Agility', value: '+21' }, { name: 'Combo Skill DMG', value: '+41.4%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_frontier01_edc_01.png` },
      { id: nextId(), name: 'Frontiers Comm T1', setName: 'Frontiers', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Strength', value: '+32' }, { name: 'Intellect', value: '+21' }, { name: 'Cryo & Electric DMG', value: '+23.0%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_frontier01_edc_02.png` },
      { id: nextId(), name: 'Frontiers Extra O2 Tube', setName: 'Frontiers', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Agility', value: '+32' }, { name: 'Intellect', value: '+21' }, { name: 'Sub-Attr', value: '+20.7%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_frontier01_edc_03.png` },
      { id: nextId(), name: 'Frontiers Armor T3', setName: 'Frontiers', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Agility', value: '+87' }, { name: 'Intellect', value: '+58' }, { name: 'Sub-Attr', value: '+10.4%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_frontier01_body_02.png` },
      { id: nextId(), name: 'Frontiers Armor T1', setName: 'Frontiers', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Strength', value: '+87' }, { name: 'Agility', value: '+58' }, { name: 'Normal Skill DMG', value: '+20.7%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_frontier01_body_03.png` },
      { id: nextId(), name: 'Frontiers Armor', setName: 'Frontiers', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Strength', value: '+87' }, { name: 'Intellect', value: '+58' }, { name: 'Ultimate DMG', value: '+25.9%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_frontier01_body_04.png` },
      { id: nextId(), name: 'Frontiers Blight RES Gloves', setName: 'Frontiers', tier: 'T4', level: 70, def: 42, stats: [{ name: 'Agility', value: '+65' }, { name: 'Intellect', value: '+43' }, { name: 'Normal Skill DMG', value: '+34.5%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_frontier01_hand_01.png` },
    ],
  },
  {
    name: 'Hot Work',
    phase: 'Late Game (Lv70)',
    setBonus: "3-piece set effect: Wearer's Arts Intensity +30. After the wearer applies Combustion, the wearer gains Heat DMG +50% for 10s. After the wearer applies Corrosion, the wearer gains Nature DMG +50% for 10s. The aforementioned effects cannot stack.",
    icon: `${CDN}/itemicon/item_equip_t4_suit_fire_natr01_body_01.png`,
    pieces: [
      { id: nextId(), name: 'Hot Work Gauntlets', setName: 'Hot Work', tier: 'T4', level: 70, def: 42, stats: [{ name: 'Intellect', value: '+65' }, { name: 'Strength', value: '+43' }, { name: 'Heat & Nature DMG', value: '+19.2%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_fire_natr01_hand_01.png` },
      { id: nextId(), name: 'Hot Work Exoskeleton', setName: 'Hot Work', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Strength', value: '+87' }, { name: 'Agility', value: '+58' }, { name: 'Heat & Nature DMG', value: '+11.5%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_fire_natr01_body_01.png` },
      { id: nextId(), name: 'Hot Work Gauntlets T1', setName: 'Hot Work', tier: 'T4', level: 70, def: 42, stats: [{ name: 'Will', value: '+65' }, { name: 'Intellect', value: '+43' }, { name: 'Heat & Nature DMG', value: '+19.2%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_fire_natr01_hand_02.png` },
      { id: nextId(), name: 'Hot Work Pyrometer', setName: 'Hot Work', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Intellect', value: '+41' }, { name: 'Normal Skill DMG', value: '+41.4%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_fire_natr01_edc_01.png` },
      { id: nextId(), name: 'Hot Work Power Cartridge', setName: 'Hot Work', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Will', value: '+32' }, { name: 'Intellect', value: '+21' }, { name: 'Arts Intensity', value: '+41' }], icon: `${CDN}/itemicon/item_equip_t4_suit_fire_natr01_edc_02.png` },
      { id: nextId(), name: 'Hot Work Power Bank', setName: 'Hot Work', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Strength', value: '+32' }, { name: 'Agility', value: '+21' }, { name: 'Arts Intensity', value: '+41' }], icon: `${CDN}/itemicon/item_equip_t4_suit_fire_natr01_edc_03.png` },
    ],
  },
  {
    name: 'LYNX',
    phase: 'Late Game (Lv70)',
    setBonus: "3-piece set effect: Wearer's HP Treatment Efficiency +20%. After the wearer gives HP treatment to an allied target, that target also gains 15% DMG Reduction against all types of DMG for 10s. If the said treatment exceeds the target's Max HP, the target gains 30% DMG Reduction against all types of DMG. The aforementioned effects cannot stack.",
    icon: `${CDN}/itemicon/item_equip_t4_suit_heal01_body_01.png`,
    pieces: [
      { id: nextId(), name: 'LYNX Cuirass', setName: 'LYNX', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Will', value: '+87' }, { name: 'Intellect', value: '+58' }, { name: 'Heal Output', value: '+10.3%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_heal01_body_01.png` },
      { id: nextId(), name: 'LYNX Gauntlets', setName: 'LYNX', tier: 'T4', level: 70, def: 42, stats: [{ name: 'Will', value: '+65' }, { name: 'Strength', value: '+43' }, { name: 'Heal Output', value: '+17.3%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_heal01_hand_01.png` },
      { id: nextId(), name: 'LYNX Gloves', setName: 'LYNX', tier: 'T4', level: 70, def: 42, stats: [{ name: 'Strength', value: '+65' }, { name: 'Will', value: '+43' }, { name: 'Ultimate SP Gain', value: '+20.5%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_heal01_hand_02.png` },
      { id: nextId(), name: 'LYNX Slab', setName: 'LYNX', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Will', value: '+32' }, { name: 'Intellect', value: '+21' }, { name: 'Main Attribute', value: '+20.7%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_heal01_edc_01.png` },
      { id: nextId(), name: 'LYNX Connector', setName: 'LYNX', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Strength', value: '+32' }, { name: 'Will', value: '+21' }, { name: 'All DMG Taken Reduction', value: '-17.1%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_heal01_edc_02.png` },
      { id: nextId(), name: 'LYNX Aegis Injector', setName: 'LYNX', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Will', value: '+41' }, { name: 'Heal Output', value: '+20.7%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_heal01_edc_03.png` },
      { id: nextId(), name: 'LYNX Heavy Armor', setName: 'LYNX', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Strength', value: '+87' }, { name: 'Will', value: '+58' }, { name: 'Heal Output', value: '+10.3%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_heal01_body_02.png` },
      { id: nextId(), name: 'LYNX Connector T1', setName: 'LYNX', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Strength', value: '+32' }, { name: 'Will', value: '+21' }, { name: 'HP', value: '+41.4%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_heal01_edc_04.png` },
    ],
  },
  {
    name: 'MI Security',
    phase: 'Late Game (Lv70)',
    setBonus: "3-piece set effect: Wearer's Critical Rate +5%. After the wearer scores a critical hit, the wearer gains ATK +??? for 5s. This effect can reach 5 stacks. At max stacks, grant an additional Critical Rate +5%. This effect cannot stack.",
    pieces: [
      { id: nextId(), name: 'MI Security Overalls', setName: 'MI Security', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Intellect', value: '+87' }, { name: 'Agility', value: '+58' }, { name: 'Normal ATK DMG', value: '+13.8%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_misec01_body_01.png` },
      { id: nextId(), name: 'MI Security Armor', setName: 'MI Security', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Agility', value: '+87' }, { name: 'Strength', value: '+58' }, { name: 'Arts Intensity', value: '+21' }], icon: `${CDN}/itemicon/item_equip_t4_suit_misec01_body_02.png` },
      { id: nextId(), name: 'MI Security Scope', setName: 'MI Security', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Agility', value: '+32' }, { name: 'Strength', value: '+21' }, { name: 'Normal Skill DMG', value: '+41.4%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_misec01_edc_01.png` },
      { id: nextId(), name: 'MI Security Toolkit', setName: 'MI Security', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Intellect', value: '+32' }, { name: 'Agility', value: '+21' }, { name: 'Crit Rate', value: '+10.3%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_misec01_edc_02.png` },
      { id: nextId(), name: 'MI Security Armband', setName: 'MI Security', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Strength', value: '+32' }, { name: 'Will', value: '+21' }, { name: 'Cryo & Electric DMG', value: '+23.0%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_misec01_edc_03.png` },
      { id: nextId(), name: 'MI Security Push Knife', setName: 'MI Security', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Will', value: '+32' }, { name: 'Intellect', value: '+21' }, { name: 'Heat & Nature DMG', value: '+23.0%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_misec01_edc_04.png` },
      { id: nextId(), name: 'MI Security Push Knife T1', setName: 'MI Security', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Will', value: '+32' }, { name: 'Agility', value: '+21' }, { name: 'Normal Skill DMG', value: '+41.4%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_misec01_edc_05.png` },
      { id: nextId(), name: 'MI Security Hands PPE', setName: 'MI Security', tier: 'T4', level: 70, def: 42, stats: [{ name: 'Intellect', value: '+65' }, { name: 'Agility', value: '+43' }, { name: 'Normal ATK DMG', value: '+23.0%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_misec01_hand_01.png` },
      { id: nextId(), name: 'MI Security Overalls T2', setName: 'MI Security', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Will', value: '+87' }, { name: 'Agility', value: '+58' }, { name: 'Normal Skill DMG', value: '+20.7%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_misec01_body_03.png` },
      { id: nextId(), name: 'MI Security Hands PPE T1', setName: 'MI Security', tier: 'T4', level: 70, def: 42, stats: [{ name: 'Intellect', value: '+65' }, { name: 'Will', value: '+43' }, { name: 'Crit Rate', value: '+8.6%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_misec01_hand_02.png` },
      { id: nextId(), name: 'MI Security Gloves', setName: 'MI Security', tier: 'T4', level: 70, def: 42, stats: [{ name: 'Agility', value: '+65' }, { name: 'Strength', value: '+43' }, { name: 'Normal Skill DMG', value: '+34.5%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_misec01_hand_03.png` },
      { id: nextId(), name: 'MI Security Overalls T1', setName: 'MI Security', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Intellect', value: '+87' }, { name: 'Will', value: '+58' }, { name: 'Crit Rate', value: '+5.2%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_misec01_body_04.png` },
    ],
  },
  {
    name: 'Pulser Labs',
    phase: 'Late Game (Lv70)',
    setBonus: "3-piece set effect: Wearer's Arts Intensity +30. After the wearer applies Electrification, the wearer gains Electric DMG +50% for 10s. After the wearer applies Solidification, the wearer gains Cryo DMG +50% for 10s. The aforementioned effects cannot stack.",
    pieces: [
      { id: nextId(), name: 'Pulser Labs Disruptor Suit', setName: 'Pulser Labs', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Intellect', value: '+87' }, { name: 'Will', value: '+58' }, { name: 'Arts Intensity', value: '+21' }], icon: `${CDN}/itemicon/item_equip_t4_suit_pulser01_body_01.png` },
      { id: nextId(), name: 'Pulser Labs Calibrator', setName: 'Pulser Labs', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Intellect', value: '+41' }, { name: 'Arts Intensity', value: '+41' }], icon: `${CDN}/itemicon/item_equip_t4_suit_pulser01_edc_01.png` },
      { id: nextId(), name: 'Pulser Labs Gloves', setName: 'Pulser Labs', tier: 'T4', level: 70, def: 42, stats: [{ name: 'Will', value: '+65' }, { name: 'Intellect', value: '+43' }, { name: 'Cryo & Electric DMG', value: '+19.2%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_pulser01_hand_01.png` },
    ],
  },
  {
    name: 'Swordmancer',
    phase: 'Late Game (Lv70)',
    setBonus: "3-piece set effect: Wearer's Stagger Efficiency Bonus +20%. After the wearer applies a Physical Status, the wearer also performs 1 hit that deals 250% ATK of Physical DMG and [10 Stagger]. Effect trigger cooldown: 15s.",
    icon: `${CDN}/itemicon/item_equip_t4_suit_phy01_body_02.png`,
    pieces: [
      { id: nextId(), name: 'Swordmancer Heavy Armor', setName: 'Swordmancer', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Agility', value: '+87' }, { name: 'Strength', value: '+58' }, { name: 'Arts Intensity', value: '+21' }], icon: `${CDN}/itemicon/item_equip_t4_suit_phy01_body_01.png` },
      { id: nextId(), name: 'Swordmancer TAC Fists', setName: 'Swordmancer', tier: 'T4', level: 70, def: 42, stats: [{ name: 'Agility', value: '+65' }, { name: 'Strength', value: '+43' }, { name: 'Ultimate DMG', value: '+43.1%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_phy01_hand_01.png` },
      { id: nextId(), name: 'Swordmancer Flint', setName: 'Swordmancer', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Agility', value: '+32' }, { name: 'Strength', value: '+21' }, { name: 'Physical DMG', value: '+23.0%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_phy01_edc_01.png` },
      { id: nextId(), name: 'Swordmancer TAC Gauntlets', setName: 'Swordmancer', tier: 'T4', level: 70, def: 42, stats: [{ name: 'Strength', value: '+65' }, { name: 'Will', value: '+43' }, { name: 'Physical DMG', value: '+19.2%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_phy01_hand_02.png` },
    ],
  },
  {
    name: 'Tide Surge',
    phase: 'Late Game (Lv70)',
    setBonus: "3-piece set effect: Wearer's Skill DMG Dealt +20%. After the wearer applies 2 or more stacks of Arts Infliction on the enemy, the wearer gains Arts DMG Dealt +35% for 15s. This effect cannot stack.",
    icon: `${CDN}/itemicon/item_equip_t4_suit_burst01_body_01.png`,
    pieces: [
      { id: nextId(), name: 'Turbid Cutting Torch', setName: 'Tide Surge', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Intellect', value: '+32' }, { name: 'Strength', value: '+21' }, { name: 'Normal ATK DMG', value: '+27.6%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_burst01_edc_01.png` },
      { id: nextId(), name: 'Hanging River O2 Tube', setName: 'Tide Surge', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Strength', value: '+32' }, { name: 'Will', value: '+21' }, { name: 'Cryo & Electric DMG', value: '+23.0%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_burst01_edc_02.png` },
      { id: nextId(), name: 'Tide Fall Light Armor', setName: 'Tide Surge', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Intellect', value: '+87' }, { name: 'Strength', value: '+58' }, { name: 'Ultimate SP Gain', value: '+12.3%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_burst01_body_01.png` },
      { id: nextId(), name: 'Tide Surge Gauntlets', setName: 'Tide Surge', tier: 'T4', level: 70, def: 42, stats: [{ name: 'Strength', value: '+65' }, { name: 'Will', value: '+43' }, { name: 'Cryo & Electric DMG', value: '+19.2%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_burst01_hand_01.png` },
    ],
  },
  {
    name: 'Type 50 Yinglung',
    phase: 'Late Game (Lv70)',
    setBonus: "3-piece set effect: Wearer's ATK +15%. When any operator in the team casts a battle skill, the wearer gains 1 stack of Yinglung's Edge that gives DMG +20% to the wearer's next combo skill. Yinglung's Edge can stack 3 time(s).",
    icon: `${CDN}/itemicon/item_equip_t4_suit_atk02_body_01.png`,
    pieces: [
      { id: nextId(), name: 'Type 50 Yinglung Heavy Armor', setName: 'Type 50 Yinglung', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Strength', value: '+87' }, { name: 'Will', value: '+58' }, { name: 'Physical DMG', value: '+11.5%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_atk02_body_01.png` },
      { id: nextId(), name: 'Type 50 Yinglung Knife T1', setName: 'Type 50 Yinglung', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Intellect', value: '+32' }, { name: 'Strength', value: '+21' }, { name: 'All Skill DMG', value: '+27.6%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_atk02_edc_01.png` },
      { id: nextId(), name: 'Type 50 Yinglung Knife', setName: 'Type 50 Yinglung', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Will', value: '+32' }, { name: 'Agility', value: '+21' }, { name: 'Combo Skill DMG', value: '+41.4%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_atk02_edc_02.png` },
      { id: nextId(), name: 'Type 50 Yinglung Radar', setName: 'Type 50 Yinglung', tier: 'T4', level: 70, def: 21, stats: [{ name: 'Strength', value: '+32' }, { name: 'Will', value: '+21' }, { name: 'Physical DMG', value: '+23.0%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_atk02_edc_03.png` },
      { id: nextId(), name: 'Type 50 Yinglung Light Armor', setName: 'Type 50 Yinglung', tier: 'T4', level: 70, def: 56, stats: [{ name: 'Will', value: '+87' }, { name: 'Strength', value: '+58' }, { name: 'All Skill DMG', value: '+13.8%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_atk02_body_02.png` },
      { id: nextId(), name: 'Type 50 Yinglung Gloves', setName: 'Type 50 Yinglung', tier: 'T4', level: 70, def: 42, stats: [{ name: 'Agility', value: '+65' }, { name: 'Intellect', value: '+43' }, { name: 'Combo Skill DMG', value: '+34.5%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_atk02_hand_01.png` },
      { id: nextId(), name: 'Type 50 Yinglung Gloves T1', setName: 'Type 50 Yinglung', tier: 'T4', level: 70, def: 42, stats: [{ name: 'Will', value: '+65' }, { name: 'Agility', value: '+43' }, { name: 'Combo Skill DMG', value: '+34.5%' }], icon: `${CDN}/itemicon/item_equip_t4_suit_atk02_hand_02.png` },
    ],
  },

  // ============================================================
  // MID GAME (Lv36-50) — Tier 2-3 Sets
  // ============================================================
  {
    name: "Aburrey's Legacy",
    phase: 'Mid Game (Lv36-50)',
    setBonus: "3-piece set effect: Wearer's Skill DMG +24%. When the wearer casts a battle skill, combo skill, or ultimate, the wearer gains ATK +??? for 15s. The buff from each of the three skill types is unique and does not stack with itself.",
    icon: `${CDN}/itemicon/item_equip_t3_suit_str01_body_01.png`,
    pieces: [
      { id: nextId(), name: 'Aburrey Auditory Chip T1', setName: "Aburrey's Legacy", tier: 'T3', level: 50, def: 15, stats: [{ name: 'Agility', value: '+23' }, { name: 'Strength', value: '+15' }, { name: 'Combo Skill DMG', value: '+29.4%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_str01_edc_01.png` },
      { id: nextId(), name: 'Aburrey Flashlight', setName: "Aburrey's Legacy", tier: 'T3', level: 50, def: 15, stats: [{ name: 'Intellect', value: '+23' }, { name: 'Strength', value: '+15' }, { name: 'Ultimate SP Gain', value: '+17.5%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_str01_edc_02.png` },
      { id: nextId(), name: 'Aburrey Light Armor T1', setName: "Aburrey's Legacy", tier: 'T3', level: 50, def: 40, stats: [{ name: 'Will', value: '+61' }, { name: 'Agility', value: '+41' }, { name: 'Normal Skill DMG', value: '+14.7%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_str01_body_01.png` },
      { id: nextId(), name: 'Aburrey Sensor Chip', setName: "Aburrey's Legacy", tier: 'T3', level: 50, def: 15, stats: [{ name: 'Will', value: '+23' }, { name: 'Agility', value: '+15' }, { name: 'Normal Skill DMG', value: '+29.4%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_str01_edc_03.png` },
      { id: nextId(), name: 'Aburrey Sensor Chip T1', setName: "Aburrey's Legacy", tier: 'T3', level: 50, def: 15, stats: [{ name: 'Will', value: '+23' }, { name: 'Intellect', value: '+15' }, { name: 'Normal Skill DMG', value: '+29.4%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_str01_edc_04.png` },
      { id: nextId(), name: 'Aburrey Gauntlets', setName: "Aburrey's Legacy", tier: 'T3', level: 50, def: 30, stats: [{ name: 'Strength', value: '+46' }, { name: 'Will', value: '+30' }, { name: 'DMG to Broken', value: '+24.5%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_str01_hand_01.png` },
      { id: nextId(), name: 'Aburrey Light Armor', setName: "Aburrey's Legacy", tier: 'T3', level: 50, def: 40, stats: [{ name: 'Intellect', value: '+61' }, { name: 'Strength', value: '+41' }, { name: 'Ultimate SP Gain', value: '+8.8%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_str01_body_02.png` },
      { id: nextId(), name: 'Aburrey Heavy Armor', setName: "Aburrey's Legacy", tier: 'T3', level: 50, def: 40, stats: [{ name: 'Strength', value: '+61' }, { name: 'Agility', value: '+41' }, { name: 'All Skill DMG', value: '+9.8%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_str01_body_03.png` },
      { id: nextId(), name: 'Aburrey Heavy Armor T1', setName: "Aburrey's Legacy", tier: 'T3', level: 50, def: 40, stats: [{ name: 'Agility', value: '+61' }, { name: 'Strength', value: '+41' }, { name: 'Combo Skill DMG', value: '+14.7%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_str01_body_04.png` },
      { id: nextId(), name: 'Aburrey UV Lamp', setName: "Aburrey's Legacy", tier: 'T3', level: 50, def: 15, stats: [{ name: 'Strength', value: '+23' }, { name: 'Agility', value: '+15' }, { name: 'All Skill DMG', value: '+19.6%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_str01_edc_05.png` },
      { id: nextId(), name: 'Aburrey Auditory Chip', setName: "Aburrey's Legacy", tier: 'T3', level: 50, def: 15, stats: [{ name: 'Strength', value: '+23' }, { name: 'Will', value: '+15' }, { name: 'DMG to Broken', value: '+29.4%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_str01_edc_06.png` },
    ],
  },
  {
    name: 'Armored MSGR',
    phase: 'Mid Game (Lv36-50)',
    setBonus: "3-piece set effect: Wearer's Strength +50. When the wearer's HP is below 50%, the wearer gains 30% DMG Reduction against all types of DMG.",
    icon: `${CDN}/itemicon/item_equip_t2_suit_str01_body_01.png`,
    pieces: [
      { id: nextId(), name: 'Armored MSGR Gloves T2', setName: 'Armored MSGR', tier: 'T3', level: 50, def: 30, stats: [{ name: 'Strength', value: '+46' }, { name: 'Agility', value: '+30' }, { name: 'Combo Skill DMG', value: '+24.5%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_str01_hand_01.png` },
      { id: nextId(), name: 'Armored MSGR Gyro T1', setName: 'Armored MSGR', tier: 'T3', level: 50, def: 15, stats: [{ name: 'Strength', value: '+23' }, { name: 'Will', value: '+15' }, { name: 'ATK', value: '+14.7%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_str01_edc_01.png` },
      { id: nextId(), name: 'Armored MSGR Flashlight T1', setName: 'Armored MSGR', tier: 'T3', level: 50, def: 15, stats: [{ name: 'Strength', value: '+23' }, { name: 'Agility', value: '+15' }, { name: 'Crit Rate', value: '+7.3%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_str01_edc_02.png` },
      { id: nextId(), name: 'Armored MSGR Jacket T1', setName: 'Armored MSGR', tier: 'T3', level: 50, def: 40, stats: [{ name: 'Strength', value: '+61' }, { name: 'Will', value: '+41' }, { name: 'HP', value: '+14.7%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_str01_body_01.png` },
      { id: nextId(), name: 'Armored MSGR Gloves T1', setName: 'Armored MSGR', tier: 'T3', level: 50, def: 30, stats: [{ name: 'Strength', value: '+46' }, { name: 'Agility', value: '+30' }, { name: 'ATK', value: '+12.3%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_str01_hand_02.png` },
      { id: nextId(), name: 'Armored MSGR Jacket', setName: 'Armored MSGR', tier: 'T2', level: 36, def: 29, stats: [{ name: 'Strength', value: '+44' }, { name: 'Agility', value: '+29' }, { name: 'HP', value: '+10.5%' }], icon: `${CDN}/itemicon/item_equip_t2_suit_str01_body_01.png` },
      { id: nextId(), name: 'Armored MSGR Gloves', setName: 'Armored MSGR', tier: 'T2', level: 36, def: 22, stats: [{ name: 'Strength', value: '+33' }, { name: 'Will', value: '+22' }, { name: 'All DMG Taken Reduction', value: '-8.0%' }], icon: `${CDN}/itemicon/item_equip_t2_suit_str01_hand_01.png` },
      { id: nextId(), name: 'Armored MSGR Gyro', setName: 'Armored MSGR', tier: 'T2', level: 36, def: 11, stats: [{ name: 'Strength', value: '+21' }, { name: 'ATK', value: '+10.5%' }], icon: `${CDN}/itemicon/item_equip_t2_suit_str01_edc_01.png` },
      { id: nextId(), name: 'Armored MSGR Flashlight', setName: 'Armored MSGR', tier: 'T2', level: 36, def: 11, stats: [{ name: 'Strength', value: '+21' }, { name: 'HP', value: '+21.0%' }], icon: `${CDN}/itemicon/item_equip_t2_suit_str01_edc_02.png` },
    ],
  },
  {
    name: 'Catastrophe',
    phase: 'Mid Game (Lv36-50)',
    setBonus: "3-piece set effect: Wearer's Ultimate Gain Efficiency +20%. The wearer casts a battle skill, the action returns 50 SP. This effect only triggers 1 time per battle.",
    icon: `${CDN}/itemicon/item_equip_t3_suit_usp01_body_01.png`,
    pieces: [
      { id: nextId(), name: 'Catastrophe Heavy Armor T1', setName: 'Catastrophe', tier: 'T3', level: 50, def: 40, stats: [{ name: 'Strength', value: '+61' }, { name: 'Will', value: '+41' }, { name: 'Ultimate SP Gain', value: '+8.8%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_usp01_body_01.png` },
      { id: nextId(), name: 'Catastrophe Gloves', setName: 'Catastrophe', tier: 'T3', level: 50, def: 30, stats: [{ name: 'Will', value: '+46' }, { name: 'Intellect', value: '+30' }, { name: 'Arts Intensity', value: '+25' }], icon: `${CDN}/itemicon/item_equip_t3_suit_usp01_hand_01.png` },
      { id: nextId(), name: 'Catastrophe Filter', setName: 'Catastrophe', tier: 'T3', level: 50, def: 15, stats: [{ name: 'Will', value: '+23' }, { name: 'Intellect', value: '+15' }, { name: 'Arts Intensity', value: '+29' }], icon: `${CDN}/itemicon/item_equip_t3_suit_usp01_edc_01.png` },
      { id: nextId(), name: 'Catastrophe Gauze Cartridge T1', setName: 'Catastrophe', tier: 'T3', level: 50, def: 15, stats: [{ name: 'Strength', value: '+23' }, { name: 'Will', value: '+15' }, { name: 'Sub-Attr', value: '+14.7%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_usp01_edc_02.png` },
      { id: nextId(), name: 'Catastrophe Gauze Cartridge', setName: 'Catastrophe', tier: 'T3', level: 50, def: 15, stats: [{ name: 'Strength', value: '+23' }, { name: 'Intellect', value: '+15' }, { name: 'Ultimate DMG', value: '+36.8%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_usp01_edc_03.png` },
      { id: nextId(), name: 'Catastrophe Heavy Armor', setName: 'Catastrophe', tier: 'T3', level: 50, def: 40, stats: [{ name: 'Strength', value: '+61' }, { name: 'Intellect', value: '+41' }, { name: 'Ultimate DMG', value: '+18.4%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_usp01_body_02.png` },
    ],
  },
  {
    name: 'Mordvolt Insulation',
    phase: 'Mid Game (Lv36-50)',
    setBonus: "3-piece set effect: Wearer's Intellect +50. When the wearer's HP is above 80%, Arts DMG +20%.",
    icon: `${CDN}/itemicon/item_equip_t2_suit_wisd01_body_01.png`,
    pieces: [
      { id: nextId(), name: 'Mordvolt Insulation Wrench T2', setName: 'Mordvolt Insulation', tier: 'T3', level: 50, def: 15, stats: [{ name: 'Intellect', value: '+23' }, { name: 'Agility', value: '+15' }, { name: 'ATK', value: '+14.7%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_wisd01_edc_01.png` },
      { id: nextId(), name: 'Mordvolt Insulation Vest T1', setName: 'Mordvolt Insulation', tier: 'T3', level: 50, def: 40, stats: [{ name: 'Intellect', value: '+61' }, { name: 'Agility', value: '+41' }, { name: 'Normal ATK DMG', value: '+9.8%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_wisd01_body_01.png` },
      { id: nextId(), name: 'Mordvolt Insulation Vest T2', setName: 'Mordvolt Insulation', tier: 'T3', level: 50, def: 40, stats: [{ name: 'Intellect', value: '+61' }, { name: 'Will', value: '+41' }, { name: 'HP', value: '+14.7%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_wisd01_body_02.png` },
      { id: nextId(), name: 'Mordvolt Insulation Battery T1', setName: 'Mordvolt Insulation', tier: 'T3', level: 50, def: 15, stats: [{ name: 'Intellect', value: '+29' }, { name: 'Ultimate SP Gain', value: '+17.5%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_wisd01_edc_02.png` },
      { id: nextId(), name: 'Mordvolt Insulation Gloves T1', setName: 'Mordvolt Insulation', tier: 'T3', level: 50, def: 30, stats: [{ name: 'Intellect', value: '+46' }, { name: 'Strength', value: '+30' }, { name: 'ATK', value: '+12.3%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_wisd01_hand_01.png` },
      { id: nextId(), name: 'Mordvolt Insulation Gloves', setName: 'Mordvolt Insulation', tier: 'T2', level: 36, def: 22, stats: [{ name: 'Intellect', value: '+33' }, { name: 'Will', value: '+22' }, { name: 'Arts DMG', value: '+9.2%' }], icon: `${CDN}/itemicon/item_equip_t2_suit_wisd01_hand_01.png` },
      { id: nextId(), name: 'Mordvolt Insulation Battery', setName: 'Mordvolt Insulation', tier: 'T2', level: 36, def: 11, stats: [{ name: 'Intellect', value: '+21' }, { name: 'Crit Rate', value: '+5.3%' }], icon: `${CDN}/itemicon/item_equip_t2_suit_wisd01_edc_01.png` },
      { id: nextId(), name: 'Mordvolt Insulation Wrench', setName: 'Mordvolt Insulation', tier: 'T2', level: 36, def: 11, stats: [{ name: 'Intellect', value: '+21' }, { name: 'ATK', value: '+10.5%' }], icon: `${CDN}/itemicon/item_equip_t2_suit_wisd01_edc_02.png` },
      { id: nextId(), name: 'Mordvolt Insulation Vest', setName: 'Mordvolt Insulation', tier: 'T2', level: 36, def: 29, stats: [{ name: 'Intellect', value: '+44' }, { name: 'Strength', value: '+29' }, { name: 'ATK', value: '+16.2%' }], icon: `${CDN}/itemicon/item_equip_t2_suit_wisd01_body_01.png` },
      { id: nextId(), name: 'Mordvolt Insulation Wrench T1', setName: 'Mordvolt Insulation', tier: 'T2', level: 36, def: 11, stats: [{ name: 'Intellect', value: '+21' }, { name: 'Cryo & Electric DMG', value: '+11.7%' }], icon: `${CDN}/itemicon/item_equip_t2_suit_wisd01_edc_03.png` },
    ],
  },
  {
    name: 'Mordvolt Resistant',
    phase: 'Mid Game (Lv36-50)',
    setBonus: "3-piece set effect: Wearer's Will +50. When the wearer's HP is below 50%, Treatment Effect +30%.",
    icon: `${CDN}/itemicon/item_equip_t2_suit_will01_body_01.png`,
    pieces: [
      { id: nextId(), name: 'Mordvolt Resistant Gloves T1', setName: 'Mordvolt Resistant', tier: 'T3', level: 50, def: 30, stats: [{ name: 'Will', value: '+46' }, { name: 'Agility', value: '+30' }, { name: 'ATK', value: '+12.3%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_will01_hand_01.png` },
      { id: nextId(), name: 'Mordvolt Resistant Battery T1', setName: 'Mordvolt Resistant', tier: 'T3', level: 50, def: 15, stats: [{ name: 'Will', value: '+23' }, { name: 'Agility', value: '+15' }, { name: 'Heal Output', value: '+14.7%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_will01_edc_01.png` },
      { id: nextId(), name: 'Mordvolt Resistant Vest T1', setName: 'Mordvolt Resistant', tier: 'T3', level: 50, def: 40, stats: [{ name: 'Will', value: '+61' }, { name: 'Intellect', value: '+41' }, { name: 'HP', value: '+14.7%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_will01_body_01.png` },
      { id: nextId(), name: 'Mordvolt Resistant Wrench T1', setName: 'Mordvolt Resistant', tier: 'T3', level: 50, def: 15, stats: [{ name: 'Will', value: '+23' }, { name: 'Intellect', value: '+15' }, { name: 'ATK', value: '+14.7%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_will01_edc_02.png` },
      { id: nextId(), name: 'Mordvolt Resistant Wrench', setName: 'Mordvolt Resistant', tier: 'T2', level: 36, def: 11, stats: [{ name: 'Will', value: '+21' }, { name: 'ATK', value: '+10.5%' }], icon: `${CDN}/itemicon/item_equip_t2_suit_will01_edc_01.png` },
      { id: nextId(), name: 'Mordvolt Resistant Battery', setName: 'Mordvolt Resistant', tier: 'T2', level: 36, def: 11, stats: [{ name: 'Will', value: '+21' }, { name: 'Heal Output', value: '+10.5%' }], icon: `${CDN}/itemicon/item_equip_t2_suit_will01_edc_02.png` },
      { id: nextId(), name: 'Mordvolt Resistant Gloves', setName: 'Mordvolt Resistant', tier: 'T2', level: 36, def: 22, stats: [{ name: 'Will', value: '+33' }, { name: 'Intellect', value: '+22' }, { name: 'Heal Output', value: '+8.8%' }], icon: `${CDN}/itemicon/item_equip_t2_suit_will01_hand_01.png` },
      { id: nextId(), name: 'Mordvolt Resistant Vest', setName: 'Mordvolt Resistant', tier: 'T2', level: 36, def: 29, stats: [{ name: 'Will', value: '+44' }, { name: 'Agility', value: '+29' }, { name: 'HP', value: '+10.5%' }], icon: `${CDN}/itemicon/item_equip_t2_suit_will01_body_01.png` },
    ],
  },
  {
    name: 'Roving MSGR',
    phase: 'Mid Game (Lv36-50)',
    setBonus: "3-piece set effect: Wearer's Agility +50. When the wearer's HP is above 80%, Physical DMG +20%.",
    icon: `${CDN}/itemicon/item_equip_t3_suit_agi01_body_01.png`,
    pieces: [
      { id: nextId(), name: 'Roving MSGR Flashlight T1', setName: 'Roving MSGR', tier: 'T3', level: 50, def: 15, stats: [{ name: 'Agility', value: '+23' }, { name: 'Strength', value: '+15' }, { name: 'Combo Skill DMG', value: '+29.4%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_agi01_edc_01.png` },
      { id: nextId(), name: 'Roving MSGR Flashlight T2', setName: 'Roving MSGR', tier: 'T3', level: 50, def: 15, stats: [{ name: 'Agility', value: '+23' }, { name: 'Strength', value: '+15' }, { name: 'Ultimate DMG', value: '+36.8%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_agi01_edc_02.png` },
      { id: nextId(), name: 'Roving MSGR Gyro T1', setName: 'Roving MSGR', tier: 'T3', level: 50, def: 15, stats: [{ name: 'Agility', value: '+23' }, { name: 'Intellect', value: '+15' }, { name: 'ATK', value: '+14.7%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_agi01_edc_03.png` },
      { id: nextId(), name: 'Roving MSGR Jacket T1', setName: 'Roving MSGR', tier: 'T3', level: 50, def: 40, stats: [{ name: 'Agility', value: '+61' }, { name: 'Intellect', value: '+41' }, { name: 'HP', value: '+14.7%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_agi01_body_01.png` },
      { id: nextId(), name: 'Roving MSGR Fists T1', setName: 'Roving MSGR', tier: 'T3', level: 50, def: 30, stats: [{ name: 'Agility', value: '+46' }, { name: 'Strength', value: '+30' }, { name: 'ATK', value: '+12.3%' }], icon: `${CDN}/itemicon/item_equip_t3_suit_agi01_hand_01.png` },
      { id: nextId(), name: 'Roving MSGR Gyro', setName: 'Roving MSGR', tier: 'T2', level: 36, def: 11, stats: [{ name: 'Agility', value: '+21' }, { name: 'ATK', value: '+10.5%' }], icon: `${CDN}/itemicon/item_equip_t2_suit_agi01_edc_01.png` },
      { id: nextId(), name: 'Roving MSGR Flashlight', setName: 'Roving MSGR', tier: 'T2', level: 36, def: 11, stats: [{ name: 'Agility', value: '+21' }, { name: 'Combo Skill DMG', value: '+21.0%' }], icon: `${CDN}/itemicon/item_equip_t2_suit_agi01_edc_02.png` },
      { id: nextId(), name: 'Roving MSGR Fists', setName: 'Roving MSGR', tier: 'T2', level: 36, def: 22, stats: [{ name: 'Agility', value: '+33' }, { name: 'Strength', value: '+22' }, { name: 'Physical DMG', value: '+9.7%' }], icon: `${CDN}/itemicon/item_equip_t2_suit_agi01_hand_01.png` },
      { id: nextId(), name: 'Roving MSGR Jacket', setName: 'Roving MSGR', tier: 'T2', level: 36, def: 29, stats: [{ name: 'Agility', value: '+44' }, { name: 'Intellect', value: '+29' }, { name: 'ATK', value: '+16.2%' }], icon: `${CDN}/itemicon/item_equip_t2_suit_agi01_body_01.png` },
    ],
  },

  // ============================================================
  // EARLY GAME (Lv10-28) — Tier 1 Sets
  // ============================================================
  {
    name: 'AIC Heavy',
    phase: 'Early Game (Lv10-28)',
    setBonus: "3-piece set effect: Wearer's HP +500. After the wearer defeats an enemy, the wearer restores 100 HP. Effect trigger cooldown: 5s.",
    icon: `${CDN}/itemicon/item_equip_t1_suit_stragi01_body_01.png`,
    pieces: [
      { id: nextId(), name: 'AIC Heavy Plate', setName: 'AIC Heavy', tier: 'T1', level: 28, def: 8, stats: [{ name: 'Strength', value: '+16' }, { name: 'All DMG Taken Reduction', value: '-7.5%' }], icon: `${CDN}/itemicon/item_equip_t1_suit_stragi01_edc_01.png` },
      { id: nextId(), name: 'AIC Gauntlets', setName: 'AIC Heavy', tier: 'T1', level: 28, def: 17, stats: [{ name: 'Strength', value: '+23' }, { name: 'Will', value: '+23' }, { name: 'All DMG Taken Reduction', value: '-6.3%' }], icon: `${CDN}/itemicon/item_equip_t1_suit_stragi01_hand_01.png` },
      { id: nextId(), name: 'AIC Heavy Armor', setName: 'AIC Heavy', tier: 'T1', level: 28, def: 22, stats: [{ name: 'Strength', value: '+30' }, { name: 'Agility', value: '+30' }, { name: 'All DMG Taken Reduction', value: '-3.9%' }], icon: `${CDN}/itemicon/item_equip_t1_suit_stragi01_body_01.png` },
      { id: nextId(), name: 'AIC Alloy Plate', setName: 'AIC Heavy', tier: 'T1', level: 28, def: 8, stats: [{ name: 'Agility', value: '+16' }, { name: 'All DMG Taken Reduction', value: '-7.5%' }], icon: `${CDN}/itemicon/item_equip_t1_suit_stragi01_edc_02.png` },
    ],
  },
  {
    name: 'AIC Light',
    phase: 'Early Game (Lv10-28)',
    setBonus: "3-piece set effect: Wearer's HP +500. After the wearer defeats an enemy, the wearer gains ATK +??? for 5s.",
    pieces: [
      { id: nextId(), name: 'AIC Ceramic Plate', setName: 'AIC Light', tier: 'T1', level: 28, def: 8, stats: [{ name: 'Will', value: '+16' }, { name: 'Normal Skill DMG', value: '+16.2%' }], icon: `${CDN}/itemicon/item_equip_t1_suit_intagi01_edc_01.png` },
      { id: nextId(), name: 'AIC Light Plate', setName: 'AIC Light', tier: 'T1', level: 28, def: 8, stats: [{ name: 'Intellect', value: '+16' }, { name: 'Combo Skill DMG', value: '+16.2%' }], icon: `${CDN}/itemicon/item_equip_t1_suit_intagi01_edc_02.png` },
      { id: nextId(), name: 'AIC Light Armor', setName: 'AIC Light', tier: 'T1', level: 28, def: 22, stats: [{ name: 'Intellect', value: '+30' }, { name: 'Will', value: '+30' }, { name: 'Normal Skill DMG', value: '+8.1%' }], icon: `${CDN}/itemicon/item_equip_t1_suit_intagi01_body_01.png` },
      { id: nextId(), name: 'AIC Tactical Gloves', setName: 'AIC Light', tier: 'T1', level: 28, def: 17, stats: [{ name: 'Intellect', value: '+23' }, { name: 'Agility', value: '+23' }, { name: 'Combo Skill DMG', value: '+13.5%' }], icon: `${CDN}/itemicon/item_equip_t1_suit_intagi01_hand_01.png` },
    ],
  },
];

// ============================================================
// STANDALONE EQUIPMENT (not part of sets)
// ============================================================

export const STANDALONE_GEAR: GearPiece[] = [
  // T4 Standalone (Lv70)
  { id: nextId(), name: 'Redeemer Tag', setName: null, tier: 'T4', level: 70, def: 21, stats: [{ name: 'Strength', value: '+43' }, { name: 'All DMG Taken Reduction', value: '-17.8%' }] },
  { id: nextId(), name: 'Redeemer Tag T1', setName: null, tier: 'T4', level: 70, def: 21, stats: [{ name: 'Agility', value: '+43' }, { name: 'Combo Skill DMG', value: '+43.2%' }] },
  { id: nextId(), name: 'Redeemer Seal', setName: null, tier: 'T4', level: 70, def: 21, stats: [{ name: 'Intellect', value: '+43' }, { name: 'Ultimate SP Gain', value: '+25.7%' }] },
  { id: nextId(), name: 'Redeemer Seal T1', setName: null, tier: 'T4', level: 70, def: 21, stats: [{ name: 'Will', value: '+43' }, { name: 'Crit Rate', value: '+10.8%' }] },

  // T3 Standalone (Lv50)
  { id: nextId(), name: 'Miner Armor T1', setName: null, tier: 'T3', level: 50, def: 40, stats: [{ name: 'Strength', value: '+65' }, { name: 'Will', value: '+43' }, { name: 'Crit Rate', value: '+3.9%' }] },
  { id: nextId(), name: 'Miner Overalls T1', setName: null, tier: 'T3', level: 50, def: 40, stats: [{ name: 'Intellect', value: '+65' }, { name: 'Agility', value: '+43' }, { name: 'ATK', value: '+7.8%' }] },
  { id: nextId(), name: 'Miner Turbine T1', setName: null, tier: 'T3', level: 50, def: 15, stats: [{ name: 'Strength', value: '+31' }, { name: 'All DMG Taken Reduction', value: '-13.5%' }] },
  { id: nextId(), name: 'Miner Compression Core T1', setName: null, tier: 'T3', level: 50, def: 15, stats: [{ name: 'Agility', value: '+31' }, { name: 'Combo Skill DMG', value: '+31.2%' }] },
  { id: nextId(), name: 'Miner Drive Wheel T1', setName: null, tier: 'T3', level: 50, def: 15, stats: [{ name: 'Intellect', value: '+31' }, { name: 'Ultimate SP Gain', value: '+18.6%' }] },
  { id: nextId(), name: 'Miner Comm T1', setName: null, tier: 'T3', level: 50, def: 15, stats: [{ name: 'Will', value: '+31' }, { name: 'Heal Output', value: '+15.6%' }] },
  { id: nextId(), name: 'Miner Gloves T2', setName: null, tier: 'T3', level: 50, def: 30, stats: [{ name: 'Intellect', value: '+49' }, { name: 'Agility', value: '+32' }, { name: 'ATK', value: '+13.0%' }] },
  { id: nextId(), name: 'Miner Fists T1', setName: null, tier: 'T3', level: 50, def: 30, stats: [{ name: 'Will', value: '+49' }, { name: 'Intellect', value: '+32' }, { name: 'Ultimate SP Gain', value: '+15.5%' }] },

  // T2 Standalone (Lv36)
  { id: nextId(), name: 'Miner Turbine', setName: null, tier: 'T2', level: 36, def: 11, stats: [{ name: 'Strength', value: '+22' }, { name: 'Combo Skill DMG', value: '+22.8%' }] },
  { id: nextId(), name: 'Miner Drive Wheel', setName: null, tier: 'T2', level: 36, def: 11, stats: [{ name: 'Agility', value: '+22' }, { name: 'Crit Rate', value: '+5.7%' }] },
  { id: nextId(), name: 'Miner Compression Core', setName: null, tier: 'T2', level: 36, def: 11, stats: [{ name: 'Intellect', value: '+22' }, { name: 'Crit Rate', value: '+5.7%' }] },
  { id: nextId(), name: 'Miner Comm', setName: null, tier: 'T2', level: 36, def: 11, stats: [{ name: 'Will', value: '+22' }, { name: 'HP', value: '+22.8%' }] },
  { id: nextId(), name: 'Miner Gauntlets T1', setName: null, tier: 'T2', level: 36, def: 22, stats: [{ name: 'Strength', value: '+36' }, { name: 'Intellect', value: '+24' }, { name: 'ATK', value: '+9.5%' }] },
  { id: nextId(), name: 'Miner Gloves T1', setName: null, tier: 'T2', level: 36, def: 22, stats: [{ name: 'Intellect', value: '+36' }, { name: 'Agility', value: '+24' }, { name: 'HP', value: '+19.0%' }] },

  // T1 Standalone (Lv10-28)
  { id: nextId(), name: 'Miner Armor', setName: null, tier: 'T1', level: 20, def: 16, stats: [{ name: 'Strength', value: '+27' }, { name: 'Agility', value: '+18' }, { name: 'HP', value: '+125.4%' }] },
  { id: nextId(), name: 'Miner Overalls', setName: null, tier: 'T1', level: 20, def: 16, stats: [{ name: 'Intellect', value: '+27' }, { name: 'Will', value: '+18' }, { name: 'HP', value: '+125.4%' }] },
  { id: nextId(), name: 'Prototype Heavy Armor', setName: null, tier: 'T1', level: 28, def: 22, stats: [{ name: 'Strength', value: '+37' }, { name: 'Intellect', value: '+25' }, { name: 'ATK', value: '+11.7%' }] },
  { id: nextId(), name: 'Prototype Heavy Armor T1', setName: null, tier: 'T1', level: 28, def: 22, stats: [{ name: 'Agility', value: '+37' }, { name: 'Will', value: '+25' }, { name: 'ATK', value: '+11.7%' }] },
  { id: nextId(), name: 'Miner Vest', setName: null, tier: 'T1', level: 28, def: 22, stats: [{ name: 'Agility', value: '+37' }, { name: 'Intellect', value: '+25' }, { name: 'HP', value: '+9.0%' }] },
  { id: nextId(), name: 'Miner Cleansuit', setName: null, tier: 'T1', level: 28, def: 22, stats: [{ name: 'Will', value: '+37' }, { name: 'Agility', value: '+25' }, { name: 'HP', value: '+9.0%' }] },
  { id: nextId(), name: 'Emergency Comm', setName: null, tier: 'T1', level: 20, def: 6, stats: [{ name: 'Crit Rate', value: '+6.6%' }] },
  { id: nextId(), name: 'Emergency Compression Core', setName: null, tier: 'T1', level: 20, def: 6, stats: [{ name: 'ATK', value: '+13.2%' }] },
  { id: nextId(), name: 'Miner Gauntlets', setName: null, tier: 'T1', level: 20, def: 12, stats: [{ name: 'Strength', value: '+20' }, { name: 'Agility', value: '+13' }, { name: 'HP', value: '+11.0%' }] },
  { id: nextId(), name: 'Miner Wrists', setName: null, tier: 'T1', level: 28, def: 17, stats: [{ name: 'Agility', value: '+28' }, { name: 'Strength', value: '+18' }, { name: 'HP', value: '+15.0%' }] },
  { id: nextId(), name: 'Miner Gloves', setName: null, tier: 'T1', level: 20, def: 12, stats: [{ name: 'Intellect', value: '+20' }, { name: 'Will', value: '+13' }, { name: 'HP', value: '+11.0%' }] },
  { id: nextId(), name: 'Miner Fists', setName: null, tier: 'T1', level: 28, def: 17, stats: [{ name: 'Will', value: '+28' }, { name: 'Intellect', value: '+18' }, { name: 'HP', value: '+15.0%' }] },

  // T0 Starter
  { id: nextId(), name: 'Basic Armor', setName: null, tier: 'T0', level: 10, def: 8, stats: [{ name: 'Strength', value: '+15' }, { name: 'Agility', value: '+10' }, { name: 'HP', value: '+46.3%' }] },
  { id: nextId(), name: 'Basic PPE', setName: null, tier: 'T0', level: 10, def: 8, stats: [{ name: 'Intellect', value: '+15' }, { name: 'Will', value: '+10' }, { name: 'HP', value: '+46.3%' }] },
  { id: nextId(), name: 'Basic Gauntlets', setName: null, tier: 'T0', level: 10, def: 6, stats: [{ name: 'Strength', value: '+11' }, { name: 'Agility', value: '+7' }, { name: 'HP', value: '+77.2%' }] },
  { id: nextId(), name: 'Basic Gloves', setName: null, tier: 'T0', level: 10, def: 6, stats: [{ name: 'Intellect', value: '+11' }, { name: 'Will', value: '+7' }, { name: 'HP', value: '+77.2%' }] },
];

// CDN file patterns known to be missing (CDN returns HTML 200 instead of image)
// These will be stripped so components fall back to placeholder icons
// Updated based on actual CDN testing - many T4 set icons are missing
const BROKEN_CDN_PATTERNS = [
  // Complete sets with missing icons
  'frontier01',      // Frontiers set - all pieces missing
  'misec01',         // MI Security set - all pieces missing
  'pulser01',        // Pulser Labs set - all pieces missing
  'intagi01',        // AIC Light set - all pieces missing
  // Specific broken pieces from otherwise working sets
  'attri01_edc_01',  // Bonekrusha Figurine
  'attri01_edc_02',  // Bonekrusha Figurine T1
  'usp02_hand_02',   // Eternal Xiranite Gloves T1
];

function isIconBroken(icon?: string): boolean {
  if (!icon) return false;
  const filename = icon.split('/').pop() || '';
  return BROKEN_CDN_PATTERNS.some(pattern => filename.includes(pattern));
}

// Strip broken icons so consumers get clean data
GEAR_SETS.forEach(set => {
  if (set.icon && isIconBroken(set.icon)) set.icon = undefined;
  set.pieces.forEach(p => { if (isIconBroken(p.icon)) p.icon = undefined; });
});

// Helper: Get all gear pieces (from sets + standalone)
export function getAllGearPieces(): GearPiece[] {
  const setPieces = GEAR_SETS.flatMap(s => s.pieces);
  return [...setPieces, ...STANDALONE_GEAR];
}

// Helper: Get sets by phase
export function getSetsByPhase(phase: GamePhase): GearSet[] {
  return GEAR_SETS.filter(s => s.phase === phase);
}

// Helper: Get all unique stat names
export function getAllStatNames(): string[] {
  const names = new Set<string>();
  getAllGearPieces().forEach(p => {
    p.stats.forEach(s => names.add(s.name));
  });
  return Array.from(names).sort();
}
