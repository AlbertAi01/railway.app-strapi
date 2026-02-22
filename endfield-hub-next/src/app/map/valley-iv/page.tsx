'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronDown, ChevronRight, Filter, ZoomIn, ZoomOut, Maximize2, Eye, EyeOff, Check, Search, Layers, X, Cloud, CloudOff, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { syncToCloud, loadFromCloud } from '@/lib/userSync';
import MapDetailPanel from '@/components/ui/MapDetailPanel';

const TOOLS_CDN = 'https://endfieldtools.dev/assets/images/endfield';
const TILE_BASE = `${TOOLS_CDN}/levelmap/levelmapgrids`;
const ICON_BASE = `${TOOLS_CDN}/itemicon`;
const MARK_ICON_BASE = `${TOOLS_CDN}/markiconsmall`;
const TIPS_ICON_BASE = `${TOOLS_CDN}/itemtips`;
const FRAGMENT_ICON = 'https://endfieldtools.dev/assets/images/icons/fragment.png';
const TILE_SIZE = 600;

interface POI {
  id: string; type: string; cat: string; sub: string;
  px: number; py: number; zone: string; layer: number; name: string;
}
interface ZoneLabel { id: string; name: string; x: number; y: number; }
interface MapData {
  mapId: string; width: number; height: number;
  zones: Record<string, string>; zoneLabels: ZoneLabel[];
  pois: POI[];
}

// Exact tile definition with correct coordinates
interface TileDef { src: string; x: number; y: number; key: string; }

// ──── Sub-type configuration ────
interface SubType { label: string; icon: string; types: string[]; }
interface CategoryDef {
  label: string; color: string; icon: string; defaultOn: boolean;
  subTypes?: SubType[];
}

const CATEGORY_CONFIG: Record<string, CategoryDef> = {
  chest: {
    label: 'Treasure Chests', color: '#FFA500', icon: 'item_materialchest_01', defaultOn: true,
    subTypes: [
      { label: 'Gorgeous Chest', icon: 'item_materialchest_01', types: ['int_trchest_common_gorgeous'] },
      { label: 'Locked Chest', icon: 'item_materialchest_01', types: ['int_trchest_lock'] },
      { label: 'High-Tier Chest', icon: 'item_materialchest_03', types: ['int_trchest_common_high'] },
      { label: 'Normal Chest', icon: 'item_materialchest_02', types: ['int_trchest_common_normal'] },
      { label: 'Basic Chest', icon: 'item_materialchest_01', types: ['int_trchest_common'] },
    ],
  },
  mineral: {
    label: 'Mining Points', color: '#8B4513', icon: 'item_iron_ore', defaultOn: false,
    subTypes: [
      { label: 'Iron', icon: 'item_iron_ore', types: ['int_doodad_core_mine_iron'] },
      { label: 'Originium', icon: 'item_originium_ore', types: ['int_doodad_core_mine_originium'] },
      { label: 'Quartz', icon: 'item_quartz_sand', types: ['int_doodad_core_mine_quartz'] },
    ],
  },
  spcstone: {
    label: 'Rare Minerals', color: '#FF1493', icon: 'item_plant_spcstone_1_1', defaultOn: false,
    subTypes: [
      { label: 'Auronyx', icon: 'item_plant_spcstone_1_1', types: ['int_doodad_spcstone_1_1'] },
      { label: 'Igneosite', icon: 'item_plant_spcstone_1_2', types: ['int_doodad_spcstone_1_2'] },
    ],
  },
  plant: {
    label: 'Plant Materials', color: '#32CD32', icon: 'item_plant_moss_1', defaultOn: false,
    subTypes: [
      { label: 'Bloodcap', icon: 'item_plant_mushroom_1_1', types: ['int_doodad_mushroom_1_1'] },
      { label: 'Cosmagaric', icon: 'item_plant_mushroom_1_2', types: ['int_doodad_mushroom_1_2'] },
      { label: 'Ruby Bolete', icon: 'item_plant_mushroom_2_1', types: ['int_doodad_mushroom_spc_2_1'] },
      { label: 'Aketine', icon: 'item_plant_moss_1', types: ['int_doodad_flower_1', 'int_doodad_flower_once_1', 'int_doodad_flower_spc_1', 'int_doodad_flower_spc_once_1', 'int_doodad_flower_story_1'] },
      { label: 'Buckflower', icon: 'item_plant_moss_2', types: ['int_doodad_flower_2', 'int_doodad_flower_once_2', 'int_doodad_flower_spc_2', 'int_doodad_flower_spc_once_2'] },
      { label: 'Sandleaf', icon: 'item_plant_moss_3', types: ['int_doodad_flower_3'] },
      { label: 'Blazebloom', icon: 'item_plant_bbflower_1', types: ['int_doodad_bbflower_1'] },
      { label: 'Glowbug', icon: 'item_plant_tundra_insect_1', types: ['int_doodad_insect_1'] },
      { label: 'Scorchbug', icon: 'item_plant_tundra_insect_2', types: ['int_doodad_insect_2'] },
      { label: 'Vitrodendra', icon: 'item_plant_crylplant_1_1', types: ['int_doodad_crylplant_1_1'] },
      { label: 'Blighted Jadeleaf', icon: 'item_plant_crylplant_1_2', types: ['int_doodad_crylplant_1_2'] },
      { label: 'Redjade Ginseng', icon: 'item_plant_sp_1', types: ['int_doodad_corp_1'] },
      { label: 'Amber Rice', icon: 'item_plant_sp_2', types: ['int_doodad_corp_2'] },
    ],
  },
  travel: { label: 'Fast Travel Points', color: '#00CED1', icon: `${MARK_ICON_BASE}/icon_map_campfire.png`, defaultOn: true },
  collectible: {
    label: 'Events & Collectibles', color: '#FFA500', icon: FRAGMENT_ICON, defaultOn: false,
    subTypes: [
      { label: 'White Fragment', icon: FRAGMENT_ICON, types: ['int_collection_common', 'int_collection_piece_in_door'] },
      { label: 'Aurylene', icon: 'item_collection_ether', types: ['int_collection_coin', 'int_collection_coin_puzzle'] },
      { label: 'Delta Bot', icon: `${MARK_ICON_BASE}/icon_map_fixablerobot.png`, types: ['mark_p_fixablerobot'] },
      { label: 'Collectible', icon: 'item_read_note', types: ['int_narrative_scene_empty', 'int_narrative_common', 'int_narrative_common_pad', 'int_narrative_common_audiotape', 'int_narrative_common_book', 'int_narrative_scene', 'int_narrative_common_empty', 'int_narrative_scene_pad', 'int_narrative_scene_notebook', 'int_narrative_empty', 'int_narrative_common_empty_withoutVfx', 'int_narrative_scene_expensiveBook', 'int_narrative_scene_chip', 'int_narrative_scene_document', 'int_narrative_scene_letter', 'int_narrative_scene_book'] },
      { label: 'Buyable File', icon: 'item_read_note', types: ['int_trigger_dnarrative_notebook', 'int_trigger_dnarrative_document', 'int_trigger_dnarrative_letter'] },
      { label: 'Protocol Datalogger', icon: `${TIPS_ICON_BASE}/icon_tips_blackbox.png`, types: ['mark_dg_blackbox'] },
      { label: 'Repair Logic', icon: `${MARK_ICON_BASE}/icon_map_pazzle.png`, types: ['mark_p_pazzle'] },
    ],
  },
  buildings: {
    label: 'Buildings', color: '#00CED1', icon: `${MARK_ICON_BASE}/icon_map_campfire.png`, defaultOn: false,
    subTypes: [
      { label: 'TP Point', icon: `${MARK_ICON_BASE}/icon_map_campfire.png`, types: ['int_campfire_v2'] },
      { label: 'Shop', icon: `${MARK_ICON_BASE}/icon_map_general_shop.png`, types: ['shop_common'] },
      { label: 'Stock Redistribution', icon: `${MARK_ICON_BASE}/icon_map_depot_pick_up.png`, types: ['mark_p_domain_shop'] },
      { label: 'Depot Node', icon: `${MARK_ICON_BASE}/icon_map_depot_receiving.png`, types: ['mark_p_domain_depot'] },
      { label: 'Early Warning Terminal', icon: `${TIPS_ICON_BASE}/icon_tips_tower.png`, types: ['int_warning_terminal'] },
      { label: 'Settlement Defense', icon: `${MARK_ICON_BASE}/icon_map_campfire.png`, types: ['mark_settlement_defense_terminal'] },
      { label: 'Recycling Station', icon: `${MARK_ICON_BASE}/icon_map_recycle.png`, types: ['mark_p_recycler', 'int_doodad_core_recycle'] },
    ],
  },
  narrative: {
    label: 'Story Fragments', color: '#9370DB', icon: 'item_read_note', defaultOn: false,
    subTypes: [
      { label: 'Recordings', icon: 'item_read_note', types: ['int_narrative_common_audiotape'] },
      { label: 'Nexus Files', icon: 'item_read_notebook', types: ['int_narrative_common_pad', 'int_narrative_scene_pad', 'int_narrative_scene_notebook', 'int_narrative_scene_document', 'int_narrative_scene_expensiveBook', 'int_narrative_scene_chip', 'int_narrative_common_book'] },
      { label: 'Findings', icon: 'item_read_note', types: ['int_narrative_common', 'int_narrative_scene_empty', 'int_narrative_common_empty', 'int_narrative_common_empty_withoutVfx', 'int_narrative_common_FisrtAid', 'int_narrative_empty', 'int_narrative_scene', 'int_narrative_scene_newspapaer', 'int_narrative_common_news', 'int_trigger_button', 'int_trigger_volume_monster'] },
      { label: 'Buyable Files', icon: 'prts_read_expensivebook', types: ['int_trigger_dnarrative_notebook', 'int_trigger_dnarrative_document', 'int_trigger_dnarrative_letter', 'int_trigger_dnarrative_expensivebook', 'int_trigger_dnarrative_appliance', 'int_narrative_shop_buyable_nar_paper_map01_112_1__item_read_note', 'int_narrative_shop_buyable_nar_paper_map01_112_2__item_read_note', 'int_narrative_shop_buyable_nar_paper_map01_115_1__item_read_news', 'int_narrative_shop_buyable_nar_paper_map01_116_1__prts_read_expensivebook', 'int_narrative_shop_buyable_nar_paper_map01_113_1__item_read_news', 'int_narrative_shop_buyable_nar_paper_map01_114_1__prts_read_expensivebook'] },
    ],
  },
  system: { label: 'Daily Instances', color: '#FFD700', icon: 'item_adventureexp', defaultOn: false },
  terminal: {
    label: 'Terminals', color: '#4169E1', icon: `${TIPS_ICON_BASE}/icon_tips_tower.png`, defaultOn: false,
    subTypes: [
      { label: 'Reading Terminal', icon: `${TIPS_ICON_BASE}/icon_tips_tower.png`, types: ['int_terminal_reading'] },
      { label: 'Switch Terminal', icon: `${TIPS_ICON_BASE}/icon_tips_tower.png`, types: ['int_switch_terminal_v2'] },
      { label: 'Gantry Terminal', icon: `${TIPS_ICON_BASE}/icon_tips_tower.png`, types: ['gantry_terminal1', 'gantry_terminal2', 'gantry_terminal3', 'int_gantry_terminal', 'int_gantry_terminal3', 'int_gantry_terminal4'] },
      { label: 'Communication Terminal', icon: `${TIPS_ICON_BASE}/icon_tips_tower.png`, types: ['int_001_comm_terminal'] },
    ],
  },
  dungeon: {
    label: 'Dungeons', color: '#8B008B', icon: 'item_adventureexp', defaultOn: false,
    subTypes: [
      { label: 'Boss Rush', icon: 'item_adventureexp', types: ['dung01_group_bossrush01', 'dung01_group_bossrush02', 'dung01_group_bossrush03'] },
      { label: 'Resource Farm', icon: 'item_gold', types: ['dung01_group_exp01', 'dung01_group_gold01', 'dung01_group_skill01', 'dung01_group_wpexp01'] },
      { label: 'Breakthrough', icon: 'item_char_break_stage_1_2', types: ['dung01_group_charbreak01', 'dung01_group_wpbreak01'] },
      { label: 'Protocol Space', icon: 'item_char_break_stage_3_4', types: ['dung_group_ss01', 'dung_group_ss02'] },
      { label: 'Exploration Level', icon: 'item_adventureexp', types: ['indie_group_levelcheck01', 'indie_group_levelcheck02'] },
      { label: 'High Difficulty', icon: 'item_adventureexp', types: ['mark_high_difficulty_enter'] },
    ],
  },
  battle: {
    label: 'Battle Encounters', color: '#DC143C', icon: `${MARK_ICON_BASE}/icon_map_boss.png`, defaultOn: false,
    subTypes: [
      { label: 'Liverbeast', icon: 'item_diamond', types: ['eny_0029_lbmob', 'eny_0065_lbmob2', 'eny_0060_lbmad'] },
      { label: 'Liverbeast Hunter', icon: 'item_diamond', types: ['eny_0033_lbhunt', 'eny_0066_lbhunt2'] },
      { label: 'Liverbeast Tough', icon: 'item_diamond', types: ['eny_0018_lbtough', 'eny_0068_lbtough2'] },
      { label: 'Hound', icon: 'item_diamond', types: ['eny_0050_hound', 'eny_0067_hound2', 'eny_0057_dog', 'eny_0059_erhound'] },
      { label: 'Aggregate', icon: 'item_diamond', types: ['eny_0021_agmelee', 'eny_0063_agmelee2', 'eny_0063_agmelee2_001', 'eny_0025_agrange', 'eny_0064_agrange2', 'eny_0064_agrange2_001', 'eny_0023_aghornb', 'eny_0023_aghornb_001', 'eny_0069_aghornb2', 'eny_0027_agscorp', 'eny_0070_agscorp2', 'eny_0058_agdisk', 'eny_0076_agfly'] },
      { label: 'Originium Slug', icon: 'item_diamond', types: ['eny_0072_slimeml', 'eny_0099_slimeml2', 'eny_0073_slimerg', 'eny_0100_slimerg2'] },
      { label: 'Sandworm', icon: 'item_diamond', types: ['eny_0071_sandb', 'eny_0098_sandb2'] },
      { label: 'Boss', icon: `${MARK_ICON_BASE}/icon_map_boss.png`, types: ['eny_0051_rodin', 'eny_0045_agtrinit', 'eny_0052_palesent', 'eny_0061_palecore'] },
      { label: 'Other Enemies', icon: 'item_diamond', types: ['eny_0007_mimicw', 'eny_0049_rogue', 'eny_0046_lbshamman', 'eny_0047_firebat', 'eny_0074_lbshield', 'eny_0075_lbroshan', 'int_system_world_energy_point', 'mark_p_enemyspawner'] },
    ],
  },
};

// Icon resolution — returns full icon URL matching endfieldtools.dev exactly
function getEntityIconUrl(type: string): string {
  const t = type.toLowerCase();

  // Fast Travel / TP Point
  if (t.includes('campfire')) return `${MARK_ICON_BASE}/icon_map_campfire.png`;

  // Chests — order matters: check specific patterns before generic
  if (t === 'int_trchest_equip') return `${MARK_ICON_BASE}/icon_map_equipment_blueprints.png`;
  if (t.includes('trchest_common_high')) return `${ICON_BASE}/item_materialchest_03.png`;
  if (t.includes('trchest_common_normal')) return `${ICON_BASE}/item_materialchest_02.png`;
  if (t.includes('trchest')) return `${ICON_BASE}/item_materialchest_01.png`;

  // Buildings
  if (t.includes('domain_shop')) return `${MARK_ICON_BASE}/icon_map_depot_pick_up.png`;
  if (t.includes('domain_depot')) return `${MARK_ICON_BASE}/icon_map_depot_receiving.png`;
  if (t.includes('shop_common') || t.includes('credit_shop')) return `${MARK_ICON_BASE}/icon_map_general_shop.png`;
  if (t === 'int_doodad_core_recycle') return `${MARK_ICON_BASE}/icon_map_recycle.png`;
  if (t.includes('warning_terminal')) return `${TIPS_ICON_BASE}/icon_tips_tower.png`;
  if (t.includes('settlement_defense')) return `${MARK_ICON_BASE}/icon_map_campfire.png`;
  if (t.includes('recycler')) return `${MARK_ICON_BASE}/icon_map_recycle.png`;

  // Terminals
  if (t.includes('terminal') || t.includes('gantry_terminal')) return `${ICON_BASE}/item_diamond.png`;

  // Delta Bot
  if (t.includes('fixablerobot')) return `${MARK_ICON_BASE}/icon_map_fixablerobot.png`;

  // Collectibles
  if (t.includes('collection_common') || t.includes('collection_piece')) return FRAGMENT_ICON;
  if (t.includes('collection_coin')) return `${ICON_BASE}/item_collection_ether.png`;
  if (t.includes('pazzle')) return `${MARK_ICON_BASE}/icon_map_pazzle.png`;
  if (t.includes('dg_blackbox')) return `${TIPS_ICON_BASE}/icon_tips_blackbox.png`;

  // Narrative / Buyable files — match specific reading material types
  if (t.includes('expensivebook') || t.includes('prts_read')) return `${ICON_BASE}/prts_read_expensivebook.png`;
  if (t.includes('notebook')) return `${ICON_BASE}/item_read_notebook.png`;
  if (t.includes('chip')) return `${ICON_BASE}/item_read_chip.png`;
  if (t.includes('news') || t.includes('newspapaer')) return `${ICON_BASE}/item_read_news.png`;
  if (t.includes('narrative') || t.includes('dnarrative') || t.includes('trigger_button') || t.includes('trigger_volume')) return `${ICON_BASE}/item_read_note.png`;

  // System
  if (t.includes('challenge_start_point')) return `${ICON_BASE}/item_adventureexp.png`;
  if (t.includes('system_world_energy')) return `${ICON_BASE}/item_diamond.png`;
  if (t.includes('high_difficulty_enter')) return `${ICON_BASE}/item_adventureexp.png`;

  // Enemies
  if (t.startsWith('eny_') || t.includes('enemyspawner')) return `${ICON_BASE}/item_diamond.png`;

  // Dungeons
  if (t.includes('bossrush') || t.includes('boss')) return `${MARK_ICON_BASE}/icon_map_boss.png`;
  const dungeonIcons: Record<string, string> = {
    'dung01_group_exp01': 'item_expcard_2_3',
    'dung01_group_gold01': 'item_gold',
    'dung01_group_skill01': 'item_char_skill_level_7_12',
    'dung01_group_wpexp01': 'item_weapon_expcard_low',
    'dung01_group_charbreak01': 'item_char_break_stage_1_2',
    'dung01_group_wpbreak01': 'item_weapon_breakthrough_a2',
    'dung_group_ss01': 'item_char_break_stage_3_4',
    'dung_group_ss02': 'item_char_break_stage_3_4',
    'indie_group_levelcheck01': 'item_adventureexp',
    'indie_group_levelcheck02': 'item_adventureexp',
  };
  if (dungeonIcons[type]) return `${ICON_BASE}/${dungeonIcons[type]}.png`;

  // Minerals
  if (t.includes('core_mine_iron')) return `${ICON_BASE}/item_iron_ore.png`;
  if (t.includes('core_mine_originium')) return `${ICON_BASE}/item_originium_ore.png`;
  if (t.includes('core_mine_quartz')) return `${ICON_BASE}/item_quartz_sand.png`;
  if (t.includes('spcstone')) {
    const m = t.match(/spcstone_(\d+_\d+)/);
    return `${ICON_BASE}/item_plant_spcstone_${m ? m[1] : '1_1'}.png`;
  }

  // Plants
  if (t.includes('mushroom')) {
    const m = t.match(/mushroom_(\d+_\d+)/);
    return `${ICON_BASE}/item_plant_mushroom_${m ? m[1] : '1_1'}.png`;
  }
  if (t.includes('crylplant')) {
    const m = t.match(/crylplant_(\d+_\d+)/);
    return `${ICON_BASE}/item_plant_crylplant_${m ? m[1] : '1_1'}.png`;
  }
  if (t.includes('bbflower')) return `${ICON_BASE}/item_plant_bbflower_1.png`;
  if (t.includes('flower_spc')) {
    const m = t.match(/flower_spc(?:_once)?_(\d+)/);
    return `${ICON_BASE}/item_plant_moss_spc_${m ? m[1] : '1'}.png`;
  }
  if (t.includes('flower_')) {
    const m = t.match(/flower_(?:once_|story_)?(\d+)/);
    return `${ICON_BASE}/item_plant_moss_${m ? m[1] : '1'}.png`;
  }
  if (t.includes('insect_')) {
    const m = t.match(/insect_(\d+)/);
    return `${ICON_BASE}/item_plant_tundra_insect_${m ? m[1] : '1'}.png`;
  }
  if (t.includes('corp_')) {
    const m = t.match(/corp_(\d+)/);
    return `${ICON_BASE}/item_plant_sp_${m ? m[1] : '1'}.png`;
  }

  return `${ICON_BASE}/item_diamond.png`;
}

// Tile positions extracted from endfieldtools.dev DOM — row 1 = top, Y increases per row
// Generate tiles aligned to POI coordinate space
// Row 1 has the LARGEST y value (startY), subsequent rows decrease
// This matches the 3D→2D projection where Y is inverted
function generateAllTiles(): TileDef[] {
  const tiles: TileDef[] = [];

  const addTiles = (id: string, folder: string, startX: number, startY: number, tileList: Array<[number, number]>) => {
    for (const [col, row] of tileList) {
      const x = startX + (col - 1) * 600;
      const y = startY - (row - 1) * 600;
      tiles.push({
        src: `${TILE_BASE}/${folder}/${id}_${col}_${row}.png`,
        x, y, key: `${id}_${col}_${row}`
      });
    }
  };

  // map01_lv001 (The Hub) — 10×8 grid, full grid (some tiles are blank/transparent)
  const lv001Tiles: Array<[number, number]> = [
    [1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],
    [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],
    [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3],[10,3],
    [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],
    [1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],
    [1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],
    [1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7],[8,7],[9,7],[10,7],
    [1,8],[2,8],[3,8],[4,8],[5,8],[6,8],[7,8],[8,8],[9,8],[10,8],
  ];
  addTiles('map01_lv001', 'map01lv001', 1200, 6600, lv001Tiles);

  // map01_lv002 (Valley Pass) — 5×5 grid, 17 tiles
  const lv002Tiles: Array<[number, number]> = [
    [1,1],[2,1],[3,1],[4,1],[5,1],
    [1,2],[2,2],[3,2],
    [1,3],[2,3],[3,3],
    [1,4],[2,4],[3,4],
    [1,5],[2,5],[3,5],
  ];
  addTiles('map01_lv002', 'map01lv002', 0, 4200, lv002Tiles);

  // map01_lv003 (Aburrey Quarry) — 5×5 grid, 17 tiles
  const lv003Tiles: Array<[number, number]> = [
    [1,1],[2,1],[3,1],[4,1],[5,1],
    [1,2],[2,2],[3,2],[4,2],[5,2],
    [1,3],[2,3],[3,3],[4,3],[5,3],
    [1,4],
    [1,5],
  ];
  addTiles('map01_lv003', 'map01lv003', 5400, 7800, lv003Tiles);

  // map01_lv005 (Originium Science Park) — 7×6 grid, 30 tiles
  const lv005Tiles: Array<[number, number]> = [
    [1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],
    [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],
    [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],
    [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],
    [7,5],
    [7,6],
  ];
  addTiles('map01_lv005', 'map01lv005', 6000, 6000, lv005Tiles);

  // map01_lv006 (Origin Lodespring) — 8×8 grid, 37 tiles (starts at col 4)
  const lv006Tiles: Array<[number, number]> = [
    [4,1],[5,1],[6,1],[7,1],
    [4,2],[5,2],[6,2],[7,2],
    [4,3],[5,3],[6,3],[7,3],
    [4,4],[5,4],[6,4],[7,4],[8,4],
    [4,5],[5,5],[6,5],[7,5],[8,5],
    [4,6],[5,6],[6,6],[7,6],[8,6],
    [4,7],[5,7],[6,7],[7,7],[8,7],
    [4,8],[5,8],[6,8],[7,8],[8,8],
  ];
  addTiles('map01_lv006', 'map01lv006', 5400, 3600, lv006Tiles);

  // map01_lv007 (Power Plateau) — 8×8 grid, 64 tiles (full)
  const lv007Tiles: Array<[number, number]> = [
    [1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],
    [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],
    [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],
    [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],
    [1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],
    [1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],
    [1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7],[8,7],
    [1,8],[2,8],[3,8],[4,8],[5,8],[6,8],[7,8],[8,8],
  ];
  addTiles('map01_lv007', 'map01lv007', 2400, 3600, lv007Tiles);

  return tiles;
}

const STORAGE_KEY = 'zerosanity-map-valley-iv';

export default function ValleyIVMapPage() {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(() => {
    const defaults = new Set<string>();
    for (const [cat, cfg] of Object.entries(CATEGORY_CONFIG)) {
      if (cfg.defaultOn) defaults.add(cat);
    }
    return defaults;
  });
  const [disabledSubTypes, setDisabledSubTypes] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['chest']));
  const [completed, setCompleted] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [hideCompleted, setHideCompleted] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [showZoneLabels, setShowZoneLabels] = useState(true);
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { token } = useAuthStore();
  const cloudLoaded = useRef(false);

  // Pan/zoom state
  const [zoom, setZoom] = useState(0.08);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastOffset = useRef({ x: 0, y: 0 });

  // Touch state for pinch-to-zoom
  const lastTouchDist = useRef(0);
  const lastTouchCenter = useRef({ x: 0, y: 0 });

  // Tile loading state
  const [loadedTiles, setLoadedTiles] = useState<Set<string>>(new Set());
  const [tilesLoaded, setTilesLoaded] = useState(0);

  // Generate all tiles once
  const allTiles = useMemo(() => generateAllTiles(), []);
  const tilesTotal = allTiles.length;

  // Load map data
  useEffect(() => {
    fetch('/data/map01-pois.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: MapData) => {
        setMapData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load map data:', err);
        setLoading(false);
      });
  }, []);

  // Calculate initial viewport
  const viewportInitialized = useRef(false);
  useEffect(() => {
    if (!mapData || !containerRef.current || viewportInitialized.current) return;
    viewportInitialized.current = true;
    const vw = containerRef.current.clientWidth;
    const vh = containerRef.current.clientHeight;
    const initZoom = Math.min(vw / mapData.width, vh / mapData.height) * 0.9;
    setZoom(initZoom);
    setOffset({
      x: (vw - mapData.width * initZoom) / 2,
      y: (vh - mapData.height * initZoom) / 2,
    });
  }, [mapData]);

  // Load cloud data
  useEffect(() => {
    if (cloudLoaded.current || !token) return;
    cloudLoaded.current = true;
    (async () => {
      const cloud = await loadFromCloud('mapValleyIV', token);
      if (cloud && Array.isArray(cloud)) {
        setCompleted(new Set(cloud));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloud));
        setSyncStatus('synced');
      }
    })();
  }, [token]);

  // Save completed
  const saveCompleted = useCallback((next: Set<string>) => {
    const arr = [...next];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    if (token) {
      if (syncTimeout.current) clearTimeout(syncTimeout.current);
      setSyncStatus('syncing');
      syncTimeout.current = setTimeout(async () => {
        try {
          await syncToCloud('mapValleyIV', arr, token);
          setSyncStatus('synced');
        } catch {
          setSyncStatus('error');
        }
      }, 2000);
    }
  }, [token]);

  const toggleCategory = useCallback((cat: string) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const toggleExpanded = useCallback((cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const toggleSubType = useCallback((types: string[]) => {
    setDisabledSubTypes(prev => {
      const next = new Set(prev);
      const allDisabled = types.every(t => next.has(t));
      if (allDisabled) {
        types.forEach(t => next.delete(t));
      } else {
        types.forEach(t => next.add(t));
      }
      return next;
    });
  }, []);

  const toggleComplete = useCallback((poiId: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(poiId)) next.delete(poiId);
      else next.add(poiId);
      saveCompleted(next);
      return next;
    });
  }, [saveCompleted]);

  // Visible POIs
  const visiblePois = useMemo(() => {
    if (!mapData) return [];
    return mapData.pois.filter(p => {
      if (!activeCategories.has(p.cat)) return false;
      if (disabledSubTypes.has(p.type)) return false;
      if (hideCompleted && completed.has(p.id)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q);
      }
      return true;
    });
  }, [mapData, activeCategories, disabledSubTypes, hideCompleted, completed, searchQuery]);

  // Cluster POIs — sort by ID first so the anchor POI (smallest ID) is stable
  // across filter changes, preventing markers from teleporting when toggling sub-types
  const clusters = useMemo(() => {
    const clusterRadius = 30 / zoom;
    const sorted = [...visiblePois].sort((a, b) => a.id.localeCompare(b.id));
    const result: { x: number; y: number; pois: POI[]; key: string }[] = [];
    const used = new Set<number>();

    for (let i = 0; i < sorted.length; i++) {
      if (used.has(i)) continue;
      const p = sorted[i];
      const cluster: POI[] = [p];
      used.add(i);

      for (let j = i + 1; j < sorted.length; j++) {
        if (used.has(j)) continue;
        const q = sorted[j];
        const dx = p.px - q.px;
        const dy = p.py - q.py;
        if (dx * dx + dy * dy < clusterRadius * clusterRadius) {
          cluster.push(q);
          used.add(j);
        }
      }

      result.push({ x: p.px, y: p.py, pois: cluster, key: p.id });
    }
    return result;
  }, [visiblePois, zoom]);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    lastOffset.current = { ...offset };
    e.preventDefault();
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setOffset({
      x: lastOffset.current.x + (e.clientX - dragStart.current.x),
      y: lastOffset.current.y + (e.clientY - dragStart.current.y),
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Zoom handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    const newZoom = Math.max(0.02, Math.min(2, zoom * factor));
    setOffset(prev => ({
      x: mx - (mx - prev.x) * (newZoom / zoom),
      y: my - (my - prev.y) * (newZoom / zoom),
    }));
    setZoom(newZoom);
  }, [zoom]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastOffset.current = { ...offset };
    } else if (e.touches.length === 2) {
      isDragging.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.sqrt(dx * dx + dy * dy);
      lastTouchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    }
  }, [offset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging.current) {
      setOffset({
        x: lastOffset.current.x + (e.touches[0].clientX - dragStart.current.x),
        y: lastOffset.current.y + (e.touches[0].clientY - dragStart.current.y),
      });
    } else if (e.touches.length === 2 && lastTouchDist.current > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = dist / lastTouchDist.current;
      const newZoom = Math.max(0.02, Math.min(2, zoom * factor));
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const cx = lastTouchCenter.current.x - rect.left;
        const cy = lastTouchCenter.current.y - rect.top;
        setOffset(prev => ({
          x: cx - (cx - prev.x) * (newZoom / zoom),
          y: cy - (cy - prev.y) * (newZoom / zoom),
        }));
      }
      setZoom(newZoom);
      lastTouchDist.current = dist;
    }
  }, [zoom]);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    lastTouchDist.current = 0;
  }, []);

  const zoomTo = useCallback((level: number) => {
    if (!containerRef.current) return;
    const vw = containerRef.current.clientWidth;
    const vh = containerRef.current.clientHeight;
    const cx = (vw / 2 - offset.x) / zoom;
    const cy = (vh / 2 - offset.y) / zoom;
    setOffset({
      x: vw / 2 - cx * level,
      y: vh / 2 - cy * level,
    });
    setZoom(level);
  }, [zoom, offset]);

  const fitMap = useCallback(() => {
    if (!mapData || !containerRef.current) return;
    const vw = containerRef.current.clientWidth;
    const vh = containerRef.current.clientHeight;
    const fitZoom = Math.min(vw / mapData.width, vh / mapData.height) * 0.9;
    setZoom(fitZoom);
    setOffset({
      x: (vw - mapData.width * fitZoom) / 2,
      y: (vh - mapData.height * fitZoom) / 2,
    });
  }, [mapData]);

  const panToPoi = useCallback((poi: POI) => {
    if (!containerRef.current) return;
    const vw = containerRef.current.clientWidth;
    const vh = containerRef.current.clientHeight;
    const targetZoom = Math.max(zoom, 0.15);
    setZoom(targetZoom);
    setOffset({
      x: vw / 2 - poi.px * targetZoom,
      y: vh / 2 - poi.py * targetZoom,
    });
    setSelectedPoi(poi);
  }, [zoom]);

  // Track tile loading
  const handleTileLoad = useCallback((key: string) => {
    setLoadedTiles(prev => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      setTilesLoaded(next.size);
      return next;
    });
  }, []);

  // Completion stats
  const stats = useMemo(() => {
    if (!mapData) return {};
    const s: Record<string, { total: number; done: number }> = {};
    for (const p of mapData.pois) {
      if (!s[p.cat]) s[p.cat] = { total: 0, done: 0 };
      s[p.cat].total++;
      if (completed.has(p.id)) s[p.cat].done++;
    }
    return s;
  }, [mapData, completed]);

  const subTypeStats = useMemo(() => {
    if (!mapData) return {};
    const s: Record<string, { total: number; done: number }> = {};
    for (const p of mapData.pois) {
      if (!s[p.type]) s[p.type] = { total: 0, done: 0 };
      s[p.type].total++;
      if (completed.has(p.id)) s[p.type].done++;
    }
    return s;
  }, [mapData, completed]);

  const getSubTypeGroupStats = useCallback((types: string[]) => {
    let total = 0, done = 0;
    for (const t of types) {
      const s = subTypeStats[t];
      if (s) { total += s.total; done += s.done; }
    }
    return { total, done };
  }, [subTypeStats]);

  const resetProgress = useCallback(() => {
    if (confirm('Reset all completion progress for Valley IV? This cannot be undone.')) {
      setCompleted(new Set());
      localStorage.removeItem(STORAGE_KEY);
      if (token) {
        syncToCloud('mapValleyIV', [], token).catch(() => {});
      }
    }
  }, [token]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="diamond-spinner mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)] font-mono text-sm uppercase tracking-wider">Loading Valley IV Map Data...</p>
        </div>
      </div>
    );
  }

  if (!mapData) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <p className="text-red-400">Failed to load map data.</p>
      </div>
    );
  }

  const totalDone = [...completed].length;
  const totalPois = mapData.pois.length;

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden">
      {/* Header */}
      <div className="h-10 flex items-center gap-3 px-3 bg-[var(--color-surface)] border-b border-[var(--color-border)] shrink-0 z-50">
        <Link href="/map" className="text-[var(--color-text-secondary)] hover:text-white transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="diamond-sm bg-[var(--color-accent)]" />
          <span className="font-mono text-xs text-[var(--color-accent)] uppercase tracking-wider font-bold">Valley IV</span>
        </div>
        <span className="text-[var(--color-text-muted)] text-xs font-mono hidden sm:inline">|</span>
        <span className="text-[var(--color-text-secondary)] text-xs font-mono hidden sm:inline">{totalDone} / {totalPois} completed</span>
        <div className="ml-auto flex items-center gap-2">
          {token && syncStatus !== 'idle' && (
            <div className="flex items-center gap-1">
              {syncStatus === 'syncing' && <Loader2 size={16} className="text-[var(--color-accent)] animate-spin" />}
              {syncStatus === 'synced' && <Cloud size={16} className="text-green-400" />}
              {syncStatus === 'error' && <CloudOff size={16} className="text-red-400" />}
            </div>
          )}
          <span className="text-[var(--color-text-muted)] text-xs font-mono">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:text-[var(--color-accent)] text-[var(--color-text-secondary)] transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex relative overflow-hidden">
        {/* ─── Sidebar: Filters ─── */}
        {sidebarOpen && (
          <div className="w-80 max-w-[85vw] bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col z-40 shrink-0 shadow-[var(--shadow-card)]">
            {/* Sidebar Header */}
            <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-[var(--color-accent)]" />
                <span className="text-base font-bold text-white">Filters</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={resetProgress} className="p-1 text-[var(--color-text-muted)] hover:text-red-400 transition-colors" title="Reset progress">
                  <RotateCcw size={16} />
                </button>
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-[var(--color-text-muted)] hover:text-white transition-colors">
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-[var(--color-border)]">
              <div className="text-[11px] text-[var(--color-text-muted)] mb-1.5 font-mono uppercase">Search points of interest...</div>
              <div className="relative">
                <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="text" placeholder="Search POIs..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-white px-8 py-1.5 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* All / Clear */}
            <div className="p-3 flex gap-2 border-b border-[var(--color-border)]">
              <button
                onClick={() => { setActiveCategories(new Set(Object.keys(CATEGORY_CONFIG))); setDisabledSubTypes(new Set()); }}
                className="flex-1 text-xs py-1.5 bg-[var(--color-accent)] text-black font-bold uppercase tracking-wider"
              >All</button>
              <button
                onClick={() => setActiveCategories(new Set())}
                className="flex-1 text-xs py-1.5 border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] uppercase tracking-wider transition-colors"
              >Clear</button>
            </div>

            {/* Category list */}
            <div className="flex-1 overflow-y-auto">
              {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => {
                const s = stats[cat] || { total: 0, done: 0 };
                const isActive = activeCategories.has(cat);
                const isExpanded = expandedCategories.has(cat);
                const hasSubTypes = cfg.subTypes && cfg.subTypes.length > 0;

                return (
                  <div key={cat} className="border-b border-[var(--color-border)]/30">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleCategory(cat)}
                        className={`w-10 h-10 flex items-center justify-center shrink-0 transition-colors ${
                          isActive ? '' : 'opacity-40'
                        }`}
                      >
                        <div className={`w-4 h-4 border-2 flex items-center justify-center transition-colors ${
                          isActive ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-[var(--color-border)]'
                        }`}>
                          {isActive && <Check size={10} className="text-black" />}
                        </div>
                      </button>

                      <button
                        onClick={() => hasSubTypes ? toggleExpanded(cat) : toggleCategory(cat)}
                        className={`flex-1 flex items-center gap-2 py-2.5 pr-3 text-left transition-colors ${
                          isActive ? '' : 'opacity-40'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cfg.icon.startsWith('http') ? cfg.icon : `${ICON_BASE}/${cfg.icon}.png`} alt="" className="w-5 h-5 shrink-0" />
                        <span className="flex-1 text-white text-sm font-semibold">{cfg.label}</span>
                        <span className="text-[11px] font-mono" style={{ color: cfg.color }}>
                          {s.done}/{s.total}
                        </span>
                        {hasSubTypes && (
                          isExpanded
                            ? <ChevronDown size={16} className="text-[var(--color-text-muted)] shrink-0" />
                            : <ChevronRight size={16} className="text-[var(--color-text-muted)] shrink-0" />
                        )}
                      </button>
                    </div>

                    {hasSubTypes && isExpanded && isActive && (
                      <div className="pb-2 px-2">
                        <div className="flex items-center gap-2 px-2 py-1 mb-1" style={{ borderLeft: `2px solid ${cfg.color}` }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={cfg.icon.startsWith('http') ? cfg.icon : `${ICON_BASE}/${cfg.icon}.png`} alt="" className="w-4 h-4" />
                          <span className="text-[11px] font-bold uppercase" style={{ color: cfg.color }}>Total: {s.done} / {s.total}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1">
                          {cfg.subTypes!.map((st) => {
                            const stStats = getSubTypeGroupStats(st.types);
                            const isSubEnabled = !st.types.every(t => disabledSubTypes.has(t));
                            return (
                              <button
                                key={st.label}
                                onClick={() => toggleSubType(st.types)}
                                className={`flex items-center gap-1.5 p-1.5 border text-left transition-all ${
                                  isSubEnabled
                                    ? 'border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-accent)]'
                                    : 'border-transparent bg-transparent opacity-30'
                                }`}
                              >
                                <div className={`w-3 h-3 border flex items-center justify-center shrink-0 ${
                                  isSubEnabled ? 'border-green-500 bg-green-500/20' : 'border-[var(--color-border)]'
                                }`}>
                                  {isSubEnabled && <Check size={8} className="text-green-400" />}
                                </div>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={st.icon.startsWith('http') ? st.icon : `${ICON_BASE}/${st.icon}.png`} alt="" className="w-4 h-4 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-[11px] text-white font-medium truncate">{st.label}</div>
                                  <div className="text-[11px] font-mono" style={{ color: cfg.color }}>{stStats.done}/{stStats.total}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom controls */}
            <div className="p-3 border-t border-[var(--color-border)] space-y-1">
              <button
                onClick={() => setHideCompleted(!hideCompleted)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors"
              >
                {hideCompleted ? <EyeOff size={16} /> : <Eye size={16} />}
                <span>{hideCompleted ? 'Show Completed' : 'Hide Completed'}</span>
              </button>
              <button
                onClick={() => setShowZoneLabels(!showZoneLabels)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors"
              >
                <Layers size={16} />
                <span>{showZoneLabels ? 'Hide Zone Labels' : 'Show Zone Labels'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ─── Map SVG ─── */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden bg-black cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        >
          {/* SVG tile layer */}
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: 'none' }}
          >
            <g
              transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}
              style={{ willChange: 'transform' }}
            >
              {allTiles.map(tile => (
                <image
                  key={tile.key}
                  href={tile.src}
                  x={tile.x}
                  y={tile.y}
                  width={TILE_SIZE + 1}
                  height={TILE_SIZE + 1}
                  preserveAspectRatio="none"
                  style={{ pointerEvents: 'none', userSelect: 'none', imageRendering: 'auto' }}
                  onLoad={() => handleTileLoad(tile.key)}
                  onError={() => handleTileLoad(tile.key)}
                />
              ))}

              {/* Zone labels */}
              {showZoneLabels && mapData.zoneLabels && mapData.zoneLabels.map(z => (
                <text
                  key={z.id}
                  x={z.x}
                  y={z.y}
                  fontSize={14 / zoom}
                  fontWeight="bold"
                  fill="white"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    textShadow: '0 0 8px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.8)',
                    letterSpacing: '0.05em',
                    fontFamily: 'system-ui',
                    paintOrder: 'stroke fill',
                    stroke: 'rgba(0,0,0,0.95)',
                    strokeWidth: 3 / zoom,
                  }}
                >
                  {z.name.toUpperCase()}
                </text>
              ))}
            </g>
          </svg>

          {/* Tile loading progress */}
          {tilesLoaded < tilesTotal && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-[var(--color-surface)]/95 border border-[var(--color-border)] px-4 py-2 backdrop-blur-sm shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3">
                <Loader2 size={16} className="text-[var(--color-accent)] animate-spin" />
                <span className="text-sm font-mono text-[var(--color-accent)]">
                  LOADING TILES {tilesLoaded}/{tilesTotal}
                </span>
              </div>
              <div className="mt-1.5 h-1 bg-[var(--color-border)] overflow-hidden">
                <div
                  className="h-full bg-[var(--color-accent)] transition-all duration-300"
                  style={{ width: `${(tilesLoaded / tilesTotal) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* POI Markers Overlay */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: 0, top: 0,
              width: mapData.width, height: mapData.height,
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {clusters.map(cluster => {
              const p = cluster.pois[0];
              const cat = CATEGORY_CONFIG[p.cat];
              const isMulti = cluster.pois.length > 1;
              const allDone = cluster.pois.every(poi => completed.has(poi.id));
              const iconUrl = getEntityIconUrl(p.type);

              return (
                <div
                  key={cluster.key}
                  className="absolute pointer-events-auto"
                  style={{
                    left: cluster.x,
                    top: cluster.y,
                    transform: `translate(-50%, -50%) scale(${1 / zoom})`,
                  }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); isMulti ? panToPoi(p) : setSelectedPoi(p); }}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 border-black/50 transition-all hover:scale-125 hover:z-10 ${allDone ? 'opacity-40 grayscale' : ''}`}
                    style={{ backgroundColor: cat?.color || '#888' }}
                    title={isMulti ? `${cluster.pois.length} POIs` : p.name || p.type}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={iconUrl} alt="" className="w-full h-full object-contain p-0.5" draggable={false} />
                    {isMulti && (
                      <div className="absolute -top-1.5 -right-1.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5 bg-black border-2 border-white text-[10px] font-bold text-white">
                        {cluster.pois.length}
                      </div>
                    )}
                    {allDone && !isMulti && (
                      <div className="absolute inset-0 rounded-full bg-green-500/50 flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* POI Count Badge */}
          <div className="absolute top-3 right-3 z-30 bg-[var(--color-surface)]/90 border border-[var(--color-border)] px-3 py-1.5 backdrop-blur-sm shadow-[var(--shadow-card)]">
            <span className="text-sm font-mono text-[var(--color-accent)]">{visiblePois.length}</span>
            <span className="text-sm font-mono text-[var(--color-text-muted)]"> POIs visible</span>
          </div>

          {/* Right Side Controls */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5 shadow-[var(--shadow-card)]">
            <button
              onClick={() => setShowZoneLabels(!showZoneLabels)}
              className={`w-9 h-9 border flex items-center justify-center transition-colors ${
                showZoneLabels
                  ? 'bg-[var(--color-surface)] border-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
              }`}
              title="Toggle zone labels"
            >
              <Layers size={18} />
            </button>
            <button
              onClick={() => setHideCompleted(!hideCompleted)}
              className={`w-9 h-9 border flex items-center justify-center transition-colors ${
                hideCompleted
                  ? 'bg-[var(--color-surface)] border-green-500 text-green-400'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
              }`}
              title={hideCompleted ? 'Show completed POIs' : 'Hide completed POIs'}
            >
              <CheckCircle2 size={18} />
            </button>

            <div className="h-1" />

            <button
              onClick={() => zoomTo(zoom * 1.3)}
              className="w-9 h-9 bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-white hover:border-[var(--color-accent)] transition-colors"
              title="Zoom in"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={() => zoomTo(zoom / 1.3)}
              className="w-9 h-9 bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-white hover:border-[var(--color-accent)] transition-colors"
              title="Zoom out"
            >
              <ZoomOut size={18} />
            </button>
            <button
              onClick={fitMap}
              className="w-9 h-9 bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-white hover:border-[var(--color-accent)] transition-colors"
              title="Fit map to view"
            >
              <Maximize2 size={18} />
            </button>

            <div className="w-9 h-6 bg-[var(--color-surface)]/80 border border-[var(--color-border)] flex items-center justify-center">
              <span className="text-[11px] font-mono text-[var(--color-text-muted)]">{Math.round(zoom * 100)}%</span>
            </div>
          </div>

          {/* Sidebar toggle */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute top-3 left-3 z-30 w-9 h-9 bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors shadow-[var(--shadow-card)]"
              title="Open filters"
            >
              <Filter size={18} />
            </button>
          )}
        </div>

        {/* POI Detail Panel */}
        {selectedPoi && (
          <MapDetailPanel
            poi={selectedPoi}
            isCompleted={completed.has(selectedPoi.id)}
            onToggleComplete={toggleComplete}
            onClose={() => setSelectedPoi(null)}
            categoryConfig={CATEGORY_CONFIG}
            zoneNames={mapData.zones}
            iconBase={ICON_BASE}
            getEntityIcon={(type) => type}
            getEntityIconUrl={getEntityIconUrl}
            mapRegion="valley-iv"
          />
        )}
      </div>
    </div>
  );
}
