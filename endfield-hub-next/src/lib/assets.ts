/**
 * Official Arknights: Endfield game asset URLs
 * Sources: endfield.wiki.gg (official community wiki), endfieldtools.dev (datamined assets)
 * All assets are official game art from GRYPHLINE.
 */

const TOOLS_CDN = 'https://endfieldtools.dev/assets/images/endfield';
const WIKI_CDN = 'https://endfield.wiki.gg/images';

// Character icon mapping (152x152 square icons)
export const CHARACTER_ICONS: Record<string, string> = {
  'Ardelia': `${TOOLS_CDN}/charicon/icon_chr_0025_ardelia.png`,
  'Ember': `${TOOLS_CDN}/charicon/icon_chr_0009_azrila.png`,
  'Endministrator': `${TOOLS_CDN}/charicon/icon_chr_0002_endminm.png`,
  'Gilberta': `${TOOLS_CDN}/charicon/icon_chr_0013_aglina.png`,
  'Laevatain': `${TOOLS_CDN}/charicon/icon_chr_0016_laevat.png`,
  'Last Rite': `${TOOLS_CDN}/charicon/icon_chr_0026_lastrite.png`,
  'Lifeng': `${TOOLS_CDN}/charicon/icon_chr_0015_lifeng.png`,
  'Pogranichnik': `${TOOLS_CDN}/charicon/icon_chr_0029_pograni.png`,
  'Yvonne': `${TOOLS_CDN}/charicon/icon_chr_0017_yvonne.png`,
  'Alesh': `${TOOLS_CDN}/charicon/icon_chr_0024_deepfin.png`,
  'Arclight': `${TOOLS_CDN}/charicon/icon_chr_0007_ikut.png`,
  'Avywenna': `${TOOLS_CDN}/charicon/icon_chr_0012_avywen.png`,
  'Chen Qianyu': `${TOOLS_CDN}/charicon/icon_chr_0005_chen.png`,
  'Da Pan': `${TOOLS_CDN}/charicon/icon_chr_0018_dapan.png`,
  'Perlica': `${TOOLS_CDN}/charicon/icon_chr_0004_pelica.png`,
  'Snowshine': `${TOOLS_CDN}/charicon/icon_chr_0014_aurora.png`,
  'Wulfgard': `${TOOLS_CDN}/charicon/icon_chr_0006_wolfgd.png`,
  'Xaihi': `${TOOLS_CDN}/charicon/icon_chr_0011_seraph.png`,
  'Akekuri': `${TOOLS_CDN}/charicon/icon_chr_0019_karin.png`,
  'Antal': `${TOOLS_CDN}/charicon/icon_chr_0023_antal.png`,
  'Catcher': `${TOOLS_CDN}/charicon/icon_chr_0020_meurs.png`,
  'Estella': `${TOOLS_CDN}/charicon/icon_chr_0021_whiten.png`,
  'Fluorite': `${TOOLS_CDN}/charicon/icon_chr_0022_bounda.png`,
};

// Character banner images (900px wide horizontal headers)
export const CHARACTER_BANNERS: Record<string, string> = {
  'Ardelia': `${TOOLS_CDN}/charhorheadicon/chr_0025_ardelia.png`,
  'Ember': `${TOOLS_CDN}/charhorheadicon/chr_0009_azrila.png`,
  'Endministrator': `${TOOLS_CDN}/charhorheadicon/chr_0002_endminm.png`,
  'Gilberta': `${TOOLS_CDN}/charhorheadicon/chr_0013_aglina.png`,
  'Laevatain': `${TOOLS_CDN}/charhorheadicon/chr_0016_laevat.png`,
  'Last Rite': `${TOOLS_CDN}/charhorheadicon/chr_0026_lastrite.png`,
  'Lifeng': `${TOOLS_CDN}/charhorheadicon/chr_0015_lifeng.png`,
  'Pogranichnik': `${TOOLS_CDN}/charhorheadicon/chr_0029_pograni.png`,
  'Yvonne': `${TOOLS_CDN}/charhorheadicon/chr_0017_yvonne.png`,
  'Alesh': `${TOOLS_CDN}/charhorheadicon/chr_0024_deepfin.png`,
  'Arclight': `${TOOLS_CDN}/charhorheadicon/chr_0007_ikut.png`,
  'Avywenna': `${TOOLS_CDN}/charhorheadicon/chr_0012_avywen.png`,
  'Chen Qianyu': `${TOOLS_CDN}/charhorheadicon/chr_0005_chen.png`,
  'Da Pan': `${TOOLS_CDN}/charhorheadicon/chr_0018_dapan.png`,
  'Perlica': `${TOOLS_CDN}/charhorheadicon/chr_0004_pelica.png`,
  'Snowshine': `${TOOLS_CDN}/charhorheadicon/chr_0014_aurora.png`,
  'Wulfgard': `${TOOLS_CDN}/charhorheadicon/chr_0006_wolfgd.png`,
  'Xaihi': `${TOOLS_CDN}/charhorheadicon/chr_0011_seraph.png`,
  'Akekuri': `${TOOLS_CDN}/charhorheadicon/chr_0019_karin.png`,
  'Antal': `${TOOLS_CDN}/charhorheadicon/chr_0023_antal.png`,
  'Catcher': `${TOOLS_CDN}/charhorheadicon/chr_0020_meurs.png`,
  'Estella': `${TOOLS_CDN}/charhorheadicon/chr_0021_whiten.png`,
  'Fluorite': `${TOOLS_CDN}/charhorheadicon/chr_0022_bounda.png`,
};

// Character gacha summon art (tall vertical portrait strips 236x1352)
export const CHARACTER_GACHA: Record<string, string> = {
  'Ardelia': `${TOOLS_CDN}/chargacha/chr_0025_ardelia.png`,
  'Ember': `${TOOLS_CDN}/chargacha/chr_0009_azrila.png`,
  'Gilberta': `${TOOLS_CDN}/chargacha/chr_0013_aglina.png`,
  'Laevatain': `${TOOLS_CDN}/chargacha/chr_0016_laevat.png`,
  'Last Rite': `${TOOLS_CDN}/chargacha/chr_0026_lastrite.png`,
  'Lifeng': `${TOOLS_CDN}/chargacha/chr_0015_lifeng.png`,
  'Pogranichnik': `${TOOLS_CDN}/chargacha/chr_0029_pograni.png`,
  'Yvonne': `${TOOLS_CDN}/chargacha/chr_0017_yvonne.png`,
  'Alesh': `${TOOLS_CDN}/chargacha/chr_0024_deepfin.png`,
  'Arclight': `${TOOLS_CDN}/chargacha/chr_0007_ikut.png`,
  'Avywenna': `${TOOLS_CDN}/chargacha/chr_0012_avywen.png`,
  'Chen Qianyu': `${TOOLS_CDN}/chargacha/chr_0005_chen.png`,
  'Da Pan': `${TOOLS_CDN}/chargacha/chr_0018_dapan.png`,
  'Perlica': `${TOOLS_CDN}/chargacha/chr_0004_pelica.png`,
  'Snowshine': `${TOOLS_CDN}/chargacha/chr_0014_aurora.png`,
  'Wulfgard': `${TOOLS_CDN}/chargacha/chr_0006_wolfgd.png`,
  'Xaihi': `${TOOLS_CDN}/chargacha/chr_0011_seraph.png`,
  'Akekuri': `${TOOLS_CDN}/chargacha/chr_0019_karin.png`,
  'Antal': `${TOOLS_CDN}/chargacha/chr_0023_antal.png`,
  'Catcher': `${TOOLS_CDN}/chargacha/chr_0020_meurs.png`,
  'Estella': `${TOOLS_CDN}/chargacha/chr_0021_whiten.png`,
  'Fluorite': `${TOOLS_CDN}/chargacha/chr_0022_bounda.png`,
};

// Character splash art (full illustrations from wiki, proxied to avoid CORS)
const splashProxy = (wikiPath: string) =>
  `/api/proxy-image?url=${encodeURIComponent(`${WIKI_CDN}/${wikiPath}`)}`;

export const CHARACTER_SPLASH: Record<string, string> = {
  'Ardelia': splashProxy('Ardelia_Splash_Art.png'),
  'Ember': splashProxy('Ember_Splash_Art.png'),
  'Endministrator': splashProxy('Endministrator_%28Male%29_Splash_Art.png'),
  'Gilberta': splashProxy('Gilberta_Splash_Art.png'),
  'Laevatain': splashProxy('Laevatain_Splash_Art.png'),
  'Last Rite': splashProxy('Last_Rite_Splash_Art.png'),
  'Lifeng': splashProxy('Lifeng_Splash_Art.png'),
  'Pogranichnik': splashProxy('Pogranichnik_Splash_Art.png'),
  'Yvonne': splashProxy('Yvonne_Splash_Art.png'),
  'Alesh': splashProxy('Alesh_Splash_Art.png'),
  'Arclight': splashProxy('Arclight_Splash_Art.png'),
  'Avywenna': splashProxy('Avywenna_Splash_Art.png'),
  'Chen Qianyu': splashProxy('Chen_Qianyu_Splash_Art.png'),
  'Da Pan': splashProxy('Da_Pan_Splash_Art.png'),
  'Perlica': splashProxy('Perlica_Splash_Art.png'),
  'Snowshine': splashProxy('Snowshine_Splash_Art.png'),
  'Wulfgard': splashProxy('Wulfgard_Splash_Art.png'),
  'Xaihi': splashProxy('Xaihi_Splash_Art.png'),
  'Akekuri': splashProxy('Akekuri_Splash_Art.png'),
  'Antal': splashProxy('Antal_Splash_Art.png'),
  'Catcher': splashProxy('Catcher_Splash_Art.png'),
  'Estella': splashProxy('Estella_Splash_Art.png'),
  'Fluorite': splashProxy('Fluorite_Splash_Art.png'),
};

// Role / Profession icons
export const PROFESSION_ICONS: Record<string, string> = {
  'Supporter': `${TOOLS_CDN}/charprofessionicon/icon_profession_0.png`,
  'Guard': `${TOOLS_CDN}/charprofessionicon/icon_profession_1.png`,
  'Caster': `${TOOLS_CDN}/charprofessionicon/icon_profession_2.png`,
  'Assault': `${TOOLS_CDN}/charprofessionicon/icon_profession_3.png`,
  'Defender': `${TOOLS_CDN}/charprofessionicon/icon_profession_4.png`,
  'Vanguard': `${TOOLS_CDN}/charprofessionicon/icon_profession_5.png`,
};

// Equipment set icons
export const EQUIPMENT_ICONS: Record<string, string> = {
  // T4 Late Game (Lv70)
  'Æthertech': `${TOOLS_CDN}/itemicon/item_equip_t4_suit_poise01_body_01.png`,
  'Bonekrusha': `${TOOLS_CDN}/itemicon/item_equip_t4_suit_attri01_body_03.png`,
  'Eternal Xiranite': `${TOOLS_CDN}/itemicon/item_equip_t4_suit_usp02_body_01.png`,
  'Frontiers': `${TOOLS_CDN}/itemicon/item_equip_t4_suit_frontier01_body_01.png`,
  'Hot Work': `${TOOLS_CDN}/itemicon/item_equip_t4_suit_fire_natr01_body_01.png`,
  'LYNX': `${TOOLS_CDN}/itemicon/item_equip_t4_suit_heal01_body_01.png`,
  'MI Security': `${TOOLS_CDN}/itemicon/item_equip_t4_suit_misec01_body_01.png`,
  'Pulser Labs': `${TOOLS_CDN}/itemicon/item_equip_t4_suit_pulser01_body_01.png`,
  'Swordmancer': `${TOOLS_CDN}/itemicon/item_equip_t4_suit_phy01_body_02.png`,
  'Tide Surge': `${TOOLS_CDN}/itemicon/item_equip_t4_suit_burst01_body_01.png`,
  'Type 50 Yinglung': `${TOOLS_CDN}/itemicon/item_equip_t4_suit_atk02_body_01.png`,
  // T3 Mid Game (Lv36-50)
  "Aburrey's Legacy": `${TOOLS_CDN}/itemicon/item_equip_t3_suit_str01_body_01.png`,
  'Armored MSGR': `${TOOLS_CDN}/itemicon/item_equip_t2_suit_str01_body_01.png`,
  'Catastrophe': `${TOOLS_CDN}/itemicon/item_equip_t3_suit_usp01_body_01.png`,
  'Mordvolt Insulation': `${TOOLS_CDN}/itemicon/item_equip_t2_suit_wisd01_body_01.png`,
  'Mordvolt Resistant': `${TOOLS_CDN}/itemicon/item_equip_t2_suit_will01_body_01.png`,
  'Roving MSGR': `${TOOLS_CDN}/itemicon/item_equip_t3_suit_agi01_body_01.png`,
  // T1 Early Game (Lv10-28)
  'AIC Heavy': `${TOOLS_CDN}/itemicon/item_equip_t1_suit_stragi01_body_01.png`,
  'AIC Light': `${TOOLS_CDN}/itemicon/item_equip_t1_suit_intagi01_body_01.png`,
};

// Weapon icons (mapped by weapon name)
export const WEAPON_ICONS: Record<string, string> = {
  // 6-star Greatswords
  'Exemplar': `${TOOLS_CDN}/itemicon/wpn_claym_0004.png`,
  'Former Finery': `${TOOLS_CDN}/itemicon/wpn_claym_0006.png`,
  'Thunderberge': `${TOOLS_CDN}/itemicon/wpn_claym_0007.png`,
  'Sundered Prince': `${TOOLS_CDN}/itemicon/wpn_claym_0008.png`,
  'Khravengger': `${TOOLS_CDN}/itemicon/wpn_claym_0013.png`,
  // 6-star Arts Units
  'Opus: Etch Figure': `${TOOLS_CDN}/itemicon/wpn_funnel_0006.png`,
  'Detonation Unit': `${TOOLS_CDN}/itemicon/wpn_funnel_0010.png`,
  'Oblivion': `${TOOLS_CDN}/itemicon/wpn_funnel_0009.png`,
  'Chivalric Virtues': `${TOOLS_CDN}/itemicon/wpn_funnel_0008.png`,
  'Delivery Guaranteed': `${TOOLS_CDN}/itemicon/wpn_funnel_0011.png`,
  'Dreams of the Starry Beach': `${TOOLS_CDN}/itemicon/wpn_funnel_0013.png`,
  // 6-star Polearms
  'Valiant': `${TOOLS_CDN}/itemicon/wpn_lance_0010.png`,
  'JET': `${TOOLS_CDN}/itemicon/wpn_lance_0011.png`,
  'Mountain Bearer': `${TOOLS_CDN}/itemicon/wpn_lance_0012.png`,
  // 6-star Handcannons
  'Navigator': `${TOOLS_CDN}/itemicon/wpn_pistol_0005.png`,
  'Wedge': `${TOOLS_CDN}/itemicon/wpn_pistol_0008.png`,
  'Clannibal': `${TOOLS_CDN}/itemicon/wpn_pistol_0009.png`,
  'Artzy Tyrannical': `${TOOLS_CDN}/itemicon/wpn_pistol_0010.png`,
  // 6-star Swords
  'Forgeborn Scathe': `${TOOLS_CDN}/itemicon/wpn_sword_0006.png`,
  'Umbral Torch': `${TOOLS_CDN}/itemicon/wpn_sword_0010.png`,
  'Rapid Ascent': `${TOOLS_CDN}/itemicon/wpn_sword_0011.png`,
  'Thermite Cutter': `${TOOLS_CDN}/itemicon/wpn_sword_0012.png`,
  'Eminent Repute': `${TOOLS_CDN}/itemicon/wpn_sword_0013.png`,
  'White Night Nova': `${TOOLS_CDN}/itemicon/wpn_sword_0014.png`,
  'Never Rest': `${TOOLS_CDN}/itemicon/wpn_sword_0016.png`,
  'Grand Vision': `${TOOLS_CDN}/itemicon/wpn_sword_0021.png`,
  // 5-star
  'Seeker of Dark Lung': `${TOOLS_CDN}/itemicon/wpn_claym_0011.png`,
  'Finishing Call': `${TOOLS_CDN}/itemicon/wpn_claym_0012.png`,
  'Ancient Canal': `${TOOLS_CDN}/itemicon/wpn_claym_0014.png`,
  'OBJ Heavy Burden': `${TOOLS_CDN}/itemicon/wpn_claym_0015.png`,
  'Wild Wanderer': `${TOOLS_CDN}/itemicon/wpn_funnel_0004.png`,
  'Stanza of Memorials': `${TOOLS_CDN}/itemicon/wpn_funnel_0005.png`,
  'Monaihe': `${TOOLS_CDN}/itemicon/wpn_funnel_0007.png`,
  'Freedom to Proselytize': `${TOOLS_CDN}/itemicon/wpn_funnel_0012.png`,
  'OBJ Arts Identifier': `${TOOLS_CDN}/itemicon/wpn_funnel_0014.png`,
  'Chimeric Justice': `${TOOLS_CDN}/itemicon/wpn_lance_0004.png`,
  'Cohesive Traction': `${TOOLS_CDN}/itemicon/wpn_lance_0006.png`,
  'OBJ Razorhorn': `${TOOLS_CDN}/itemicon/wpn_lance_0013.png`,
  'Rational Farewell': `${TOOLS_CDN}/itemicon/wpn_pistol_0004.png`,
  'Opus: The Living': `${TOOLS_CDN}/itemicon/wpn_pistol_0006.png`,
  'OBJ Velocitous': `${TOOLS_CDN}/itemicon/wpn_pistol_0012.png`,
  'Sundering Steel': `${TOOLS_CDN}/itemicon/wpn_sword_0005.png`,
  'Fortmaker': `${TOOLS_CDN}/itemicon/wpn_sword_0007.png`,
  'Aspirant': `${TOOLS_CDN}/itemicon/wpn_sword_0015.png`,
  'Twelve Questions': `${TOOLS_CDN}/itemicon/wpn_sword_0018.png`,
  'OBJ Edge of Lightness': `${TOOLS_CDN}/itemicon/wpn_sword_0019.png`,
  'Finchaser 3.0': `${TOOLS_CDN}/itemicon/wpn_sword_0020.png`,
  // 4-star
  'Industry 0.1': `${TOOLS_CDN}/itemicon/wpn_claym_0003.png`,
  'Quencher': `${TOOLS_CDN}/itemicon/wpn_claym_0009.png`,
  'Hypernova Auto': `${TOOLS_CDN}/itemicon/wpn_funnel_0001.png`,
  'Fluorescent Roc': `${TOOLS_CDN}/itemicon/wpn_funnel_0003.png`,
  "Pathfinder's Beacon": `${TOOLS_CDN}/itemicon/wpn_lance_0003.png`,
  'Aggeloslayer': `${TOOLS_CDN}/itemicon/wpn_lance_0008.png`,
  'Howling Guard': `${TOOLS_CDN}/itemicon/wpn_pistol_0002.png`,
  'Long Road': `${TOOLS_CDN}/itemicon/wpn_pistol_0003.png`,
  'Contingent Measure': `${TOOLS_CDN}/itemicon/wpn_sword_0008.png`,
  'Wave Tide': `${TOOLS_CDN}/itemicon/wpn_sword_0009.png`,
  // 3-star
  'Darhoff 7': `${TOOLS_CDN}/itemicon/wpn_claym_0010.png`,
  'Jiminy 12': `${TOOLS_CDN}/itemicon/wpn_funnel_0002.png`,
  'Opero 77': `${TOOLS_CDN}/itemicon/wpn_lance_0009.png`,
  'Peco 5': `${TOOLS_CDN}/itemicon/wpn_pistol_0001.png`,
  'Tarr 11': `${TOOLS_CDN}/itemicon/wpn_sword_0003.png`,
};

// Stat attribute icons
export const STAT_ICONS = {
  Strength: `${TOOLS_CDN}/charinfo/icon_power_big.png`,
  Agility: `${TOOLS_CDN}/charinfo/icon_agile_big.png`,
  Intellect: `${TOOLS_CDN}/charinfo/icon_knowledge_big.png`,
  Will: `${TOOLS_CDN}/charinfo/icon_will_big.png`,
};

// Material/item icons — verified against EndfieldTools.dev CDN and endfield.wiki.gg names
export const MATERIAL_ICONS: Record<string, string> = {
  // Currency
  'Gold': `${TOOLS_CDN}/itemicon/item_gold.png`,
  // EXP items
  'Elementary Combat Record': `${TOOLS_CDN}/itemicon/item_expcard_2_1.png`,
  'Intermediate Combat Record': `${TOOLS_CDN}/itemicon/item_expcard_2_2.png`,
  'Advanced Combat Record': `${TOOLS_CDN}/itemicon/item_expcard_2_3.png`,
  'Elementary Cognitive Carrier': `${TOOLS_CDN}/itemicon/item_expcard_stage2_low.png`,
  'Advanced Cognitive Carrier': `${TOOLS_CDN}/itemicon/item_expcard_stage2_high.png`,
  // Promotion materials
  'Protodisk': `${TOOLS_CDN}/itemicon/item_char_break_stage_1_2.png`,
  'Protoset': `${TOOLS_CDN}/itemicon/item_char_break_stage_3_4.png`,
  // Skill level materials
  'Protoprism': `${TOOLS_CDN}/itemicon/item_char_skill_level_1_6.png`,
  'Protohedron': `${TOOLS_CDN}/itemicon/item_char_skill_level_7_12.png`,
  'Mark of Perseverance': `${TOOLS_CDN}/itemicon/item_char_skill_crown.png`,
  // Skill specialization materials
  'Metadiastima Photoemission Tube': `${TOOLS_CDN}/itemicon/item_char_skill_specialize_1.png`,
  'D96 Steel Sample 4': `${TOOLS_CDN}/itemicon/item_char_skill_specialize_2.png`,
  'Tachyon Screening Lattice': `${TOOLS_CDN}/itemicon/item_char_skill_specialize_3.png`,
  'Quadrant Fitting Fluid': `${TOOLS_CDN}/itemicon/item_char_skill_specialize_4.png`,
  'Triphasic Nanoflake': `${TOOLS_CDN}/itemicon/item_char_skill_specialize_5.png`,
  // Fungi (operator promotion plants)
  'Pink Bolete': `${TOOLS_CDN}/itemicon/item_plant_mushroom_1_1.png`,
  'Red Bolete': `${TOOLS_CDN}/itemicon/item_plant_mushroom_1_2.png`,
  'Ruby Bolete': `${TOOLS_CDN}/itemicon/item_plant_mushroom_1_3.png`,
  'Bloodcap': `${TOOLS_CDN}/itemicon/item_plant_mushroom_2_1.png`,
  'Cosmagaric': `${TOOLS_CDN}/itemicon/item_plant_mushroom_2_2.png`,
  // Crystal plants (skill upgrade plants)
  'Kalkodendra': `${TOOLS_CDN}/itemicon/item_plant_crylplant_1_1.png`,
  'Chrysodendra': `${TOOLS_CDN}/itemicon/item_plant_crylplant_1_2.png`,
  'Vitrodendra': `${TOOLS_CDN}/itemicon/item_plant_crylplant_1_3.png`,
  'Blighted Jadeleaf': `${TOOLS_CDN}/itemicon/item_plant_crylplant_2_1.png`,
  'False Aggela': `${TOOLS_CDN}/itemicon/item_plant_crylplant_2_2.png`,
};

// Item ID to display name mapping (for game API data)
export const MATERIAL_ID_TO_NAME: Record<string, string> = {
  'item_gold': 'Gold',
  'item_expcard_2_1': 'Elementary Combat Record',
  'item_expcard_2_2': 'Intermediate Combat Record',
  'item_expcard_2_3': 'Advanced Combat Record',
  'item_expcard_stage2_low': 'Elementary Cognitive Carrier',
  'item_expcard_stage2_high': 'Advanced Cognitive Carrier',
  'item_char_break_stage_1_2': 'Protodisk',
  'item_char_break_stage_3_4': 'Protoset',
  'item_char_skill_level_1_6': 'Protoprism',
  'item_char_skill_level_7_12': 'Protohedron',
  'item_char_skill_crown': 'Mark of Perseverance',
  'item_char_skill_specialize_1': 'Metadiastima Photoemission Tube',
  'item_char_skill_specialize_2': 'D96 Steel Sample 4',
  'item_char_skill_specialize_3': 'Tachyon Screening Lattice',
  'item_char_skill_specialize_4': 'Quadrant Fitting Fluid',
  'item_char_skill_specialize_5': 'Triphasic Nanoflake',
  'item_plant_mushroom_1_1': 'Pink Bolete',
  'item_plant_mushroom_1_2': 'Red Bolete',
  'item_plant_mushroom_1_3': 'Ruby Bolete',
  'item_plant_mushroom_2_1': 'Bloodcap',
  'item_plant_mushroom_2_2': 'Cosmagaric',
  'item_plant_crylplant_1_1': 'Kalkodendra',
  'item_plant_crylplant_1_2': 'Chrysodendra',
  'item_plant_crylplant_1_3': 'Vitrodendra',
  'item_plant_crylplant_2_1': 'Blighted Jadeleaf',
  'item_plant_crylplant_2_2': 'False Aggela',
};

// Helper to get character icon with fallback
export function getCharacterIcon(name: string): string | null {
  return CHARACTER_ICONS[name] || null;
}

export function getCharacterGacha(name: string): string | null {
  return CHARACTER_GACHA[name] || null;
}

export function getCharacterBanner(name: string): string | null {
  return CHARACTER_BANNERS[name] || null;
}

export function getCharacterSplash(name: string): string | null {
  return CHARACTER_SPLASH[name] || null;
}

export function getWeaponIcon(name: string): string | null {
  return WEAPON_ICONS[name] || null;
}

export function getEquipmentIcon(name: string): string | null {
  return EQUIPMENT_ICONS[name] || null;
}

export function getMaterialIcon(name: string): string | null {
  return MATERIAL_ICONS[name] || null;
}

export function getMaterialName(itemId: string): string {
  return MATERIAL_ID_TO_NAME[itemId] || itemId;
}
