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

// Character splash art (full illustrations from wiki)
export const CHARACTER_SPLASH: Record<string, string> = {
  'Ardelia': `${WIKI_CDN}/Ardelia_Splash_Art.png`,
  'Ember': `${WIKI_CDN}/Ember_Splash_Art.png`,
  'Endministrator': `${WIKI_CDN}/Endministrator_%28Male%29_Splash_Art.png`,
  'Gilberta': `${WIKI_CDN}/Gilberta_Splash_Art.png`,
  'Laevatain': `${WIKI_CDN}/Laevatain_Splash_Art.png`,
  'Last Rite': `${WIKI_CDN}/Last_Rite_Splash_Art.png`,
  'Lifeng': `${WIKI_CDN}/Lifeng_Splash_Art.png`,
  'Pogranichnik': `${WIKI_CDN}/Pogranichnik_Splash_Art.png`,
  'Yvonne': `${WIKI_CDN}/Yvonne_Splash_Art.png`,
  'Alesh': `${WIKI_CDN}/Alesh_Splash_Art.png`,
  'Arclight': `${WIKI_CDN}/Arclight_Splash_Art.png`,
  'Avywenna': `${WIKI_CDN}/Avywenna_Splash_Art.png`,
  'Chen Qianyu': `${WIKI_CDN}/Chen_Qianyu_Splash_Art.png`,
  'Da Pan': `${WIKI_CDN}/Da_Pan_Splash_Art.png`,
  'Perlica': `${WIKI_CDN}/Perlica_Splash_Art.png`,
  'Snowshine': `${WIKI_CDN}/Snowshine_Splash_Art.png`,
  'Wulfgard': `${WIKI_CDN}/Wulfgard_Splash_Art.png`,
  'Xaihi': `${WIKI_CDN}/Xaihi_Splash_Art.png`,
  'Akekuri': `${WIKI_CDN}/Akekuri_Splash_Art.png`,
  'Antal': `${WIKI_CDN}/Antal_Splash_Art.png`,
  'Catcher': `${WIKI_CDN}/Catcher_Splash_Art.png`,
  'Estella': `${WIKI_CDN}/Estella_Splash_Art.png`,
  'Fluorite': `${WIKI_CDN}/Fluorite_Splash_Art.png`,
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
  'Eternal Xiranite': `${TOOLS_CDN}/itemicon/item_equip_t4_suit_usp02_body_01.png`,
  'Mordvolt Insulation': `${TOOLS_CDN}/itemicon/item_equip_t2_suit_wisd01_body_01.png`,
  'Mordvolt Resistant': `${TOOLS_CDN}/itemicon/item_equip_t2_suit_will01_body_01.png`,
  'LYNX': `${TOOLS_CDN}/itemicon/item_equip_t4_suit_heal01_body_01.png`,
  'Type 50 Yinglung': `${TOOLS_CDN}/itemicon/item_equip_t4_suit_atk02_body_01.png`,
  'Armored MSGR': `${TOOLS_CDN}/itemicon/item_equip_t2_suit_str01_body_01.png`,
  'Catastrophe': `${TOOLS_CDN}/itemicon/item_equip_t3_suit_usp01_body_01.png`,
  'AIC Heavy': `${TOOLS_CDN}/itemicon/item_equip_t1_suit_stragi01_body_01.png`,
  'Tide Surge': `${TOOLS_CDN}/itemicon/item_equip_t4_suit_burst01_body_01.png`,
  'Swordmancer': `${TOOLS_CDN}/itemicon/item_equip_t4_suit_phy01_body_02.png`,
  'Hot Work': `${TOOLS_CDN}/itemicon/item_equip_t4_suit_fire_natr01_body_01.png`,
  'Æthertech': `${TOOLS_CDN}/itemicon/item_equip_t4_suit_poise01_body_01.png`,
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

// Material/item icons
export const MATERIAL_ICONS = {
  Gold: `${TOOLS_CDN}/itemicon/item_gold.png`,
  'EXP Card High': `${TOOLS_CDN}/itemicon/item_expcard_2_3.png`,
  'EXP Card Mid': `${TOOLS_CDN}/itemicon/item_expcard_2_2.png`,
  'EXP Card Low': `${TOOLS_CDN}/itemicon/item_expcard_2_1.png`,
};

// Helper to get character icon with fallback
export function getCharacterIcon(name: string): string | null {
  return CHARACTER_ICONS[name] || null;
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
