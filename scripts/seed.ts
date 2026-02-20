/**
 * Comprehensive Seed Script for Endfield Hub Strapi
 *
 * Populates ALL Strapi content types from the frontend's hardcoded data.
 * Run with: STRAPI_TOKEN=<your-token> npx tsx scripts/seed.ts
 *
 * Content types seeded:
 *   - Characters (23)
 *   - Weapons (62)
 *   - Blueprints (21)
 *   - Equipment Sets (18)
 *   - Weapon Essences (62)
 *   - Farming Zones (5)
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://127.0.0.1:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';

if (!STRAPI_TOKEN) {
  console.error('ERROR: STRAPI_TOKEN environment variable is required.');
  console.error('Generate an API token in Strapi Admin > Settings > API Tokens');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${STRAPI_TOKEN}`,
};

async function apiGet(path: string): Promise<any> {
  const res = await fetch(`${STRAPI_URL}/api${path}`, { headers });
  if (!res.ok) return null;
  return res.json();
}

async function apiPost(path: string, data: Record<string, unknown>): Promise<any> {
  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data: { ...data, publishedAt: new Date().toISOString() } }),
  });
  if (!res.ok) {
    const err: any = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  return res.json();
}

async function seedCollection(
  name: string,
  endpoint: string,
  entries: Record<string, unknown>[],
  uniqueField: string = 'Name',
) {
  console.log(`\n=== Seeding ${name} (${entries.length} entries) ===`);
  let created = 0;
  let skipped = 0;

  for (const entry of entries) {
    const uniqueVal = entry[uniqueField] as string;
    try {
      // Check if exists
      const existing = await apiGet(
        `${endpoint}?filters[${uniqueField}][$eq]=${encodeURIComponent(uniqueVal)}&pagination[pageSize]=1`
      );
      if (existing?.data?.length > 0) {
        skipped++;
        continue;
      }
      await apiPost(endpoint, entry);
      created++;
      if (created % 10 === 0) console.log(`  ... ${created} created so far`);
    } catch (err: any) {
      console.log(`  SKIP ${uniqueVal}: ${err.message}`);
      skipped++;
    }
  }
  console.log(`  Done: ${created} created, ${skipped} skipped`);
}

// ============================================================
// CHARACTER DATA (23 operators)
// ============================================================
const CHARACTERS = [
  { Name: 'Laevatain', Rarity: 6, Element: 'Heat', Role: 'Guard', WeaponType: 'Greatsword' },
  { Name: 'Endministrator', Rarity: 6, Element: 'Physical', Role: 'Guard', WeaponType: 'Sword' },
  { Name: 'Perlica', Rarity: 6, Element: 'Nature', Role: 'Caster', WeaponType: 'Arts Unit' },
  { Name: 'Ember', Rarity: 6, Element: 'Heat', Role: 'Defender', WeaponType: 'Greatsword' },
  { Name: 'Chen Qianyu', Rarity: 6, Element: 'Physical', Role: 'Vanguard', WeaponType: 'Polearm' },
  { Name: 'Nymph', Rarity: 6, Element: 'Cryo', Role: 'Caster', WeaponType: 'Handcannon' },
  { Name: 'Yvonne', Rarity: 6, Element: 'Cryo', Role: 'Caster', WeaponType: 'Arts Unit' },
  { Name: 'Czerny', Rarity: 6, Element: 'Electric', Role: 'Supporter', WeaponType: 'Sword' },
  { Name: 'Kalts\'it', Rarity: 6, Element: 'Nature', Role: 'Supporter', WeaponType: 'Arts Unit' },
  { Name: 'Akekuri', Rarity: 5, Element: 'Heat', Role: 'Caster', WeaponType: 'Handcannon' },
  { Name: 'Ardelia', Rarity: 5, Element: 'Nature', Role: 'Caster', WeaponType: 'Arts Unit' },
  { Name: 'Dayu', Rarity: 5, Element: 'Cryo', Role: 'Supporter', WeaponType: 'Sword' },
  { Name: 'Flametail', Rarity: 5, Element: 'Heat', Role: 'Guard', WeaponType: 'Polearm' },
  { Name: 'Haze', Rarity: 5, Element: 'Nature', Role: 'Vanguard', WeaponType: 'Sword' },
  { Name: 'Ilona', Rarity: 5, Element: 'Cryo', Role: 'Defender', WeaponType: 'Greatsword' },
  { Name: 'Lifang', Rarity: 5, Element: 'Physical', Role: 'Vanguard', WeaponType: 'Polearm' },
  { Name: 'Lyudmilla', Rarity: 5, Element: 'Cryo', Role: 'Guard', WeaponType: 'Handcannon' },
  { Name: 'Sangria', Rarity: 5, Element: 'Nature', Role: 'Guard', WeaponType: 'Sword' },
  { Name: 'Celestia', Rarity: 5, Element: 'Electric', Role: 'Supporter', WeaponType: 'Polearm' },
  { Name: 'Arcana', Rarity: 5, Element: 'Electric', Role: 'Caster', WeaponType: 'Sword' },
  { Name: 'Lumo', Rarity: 5, Element: 'Heat', Role: 'Supporter', WeaponType: 'Arts Unit' },
  { Name: 'Origin', Rarity: 5, Element: 'Physical', Role: 'Defender', WeaponType: 'Greatsword' },
  { Name: 'Tia', Rarity: 5, Element: 'Electric', Role: 'Vanguard', WeaponType: 'Handcannon' },
].map(c => ({
  ...c,
  Slug: c.Name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  IconUrl: `https://endfieldtools.dev/assets/images/endfield/charicon/${c.Name.toLowerCase().replace(/[^a-z0-9]/g, '')}_icon.png`,
}));

// ============================================================
// WEAPON DATA (62 weapons) - from endfield-hub-next/src/data/weapons.ts
// Condensed to Strapi schema fields only
// ============================================================
const WEAPONS: Record<string, unknown>[] = [
  // 6-star Arts Units
  { Name: 'Chivalric Virtues', Slug: 'chivalric-virtues', Rarity: 6, WeaponType: 'Arts Unit', BaseATK: 49, MaxATK: 485, SubStat: 'Will', SubStatValue: 156, PassiveName: 'Medicant: Blight Fervor', PassiveDescription: 'Treatment Efficiency +28.0%. After the wielder\'s skill provides HP treatment, the entire team gains ATK +25.2% for 15s.' },
  { Name: 'Delivery Guaranteed', Slug: 'delivery-guaranteed', Rarity: 6, WeaponType: 'Arts Unit', BaseATK: 51, MaxATK: 500, SubStat: 'Will', SubStatValue: 156, PassiveName: 'Pursuit: Duty Fulfilled', PassiveDescription: 'Nature DMG Dealt +44.8%. After the wielder\'s combo skill applies Lifted, the team gains Arts DMG Dealt +33.6% for 15s.' },
  { Name: 'Detonation Unit', Slug: 'detonation-unit', Rarity: 6, WeaponType: 'Arts Unit', BaseATK: 50, MaxATK: 490, SubStat: 'Main Attribute', SubStatValue: 132, PassiveName: 'Detonate: Imposing Champion', PassiveDescription: 'Secondary Attribute +28.0%. When the wielder applies an Arts Burst, target enemy suffers Arts DMG Taken +25.2% for 15s.' },
  { Name: 'Dreams of the Starry Beach', Slug: 'dreams-of-the-starry-beach', Rarity: 6, WeaponType: 'Arts Unit', BaseATK: 50, MaxATK: 495, SubStat: 'Intellect', SubStatValue: 156, PassiveName: 'Infliction: Tidal Murmurs', PassiveDescription: 'Secondary attribute +44.8%. After the wielder consumes Corrosion, target enemy suffers Arts DMG Taken +28.0% for 25s.' },
  { Name: 'Oblivion', Slug: 'oblivion', Rarity: 6, WeaponType: 'Arts Unit', BaseATK: 50, MaxATK: 495, SubStat: 'Intellect', SubStatValue: 156, PassiveName: 'Twilight: Humiliation', PassiveDescription: 'Critical Rate +14.0%. When the wielder casts an ultimate, the wielder gains Arts DMG Dealt +67.2% for 15s.' },
  { Name: 'Opus: Etch Figure', Slug: 'opus-etch-figure', Rarity: 6, WeaponType: 'Arts Unit', BaseATK: 49, MaxATK: 485, SubStat: 'Will', SubStatValue: 156, PassiveName: 'Suppression: Tillite Etchings', PassiveDescription: 'ATK +19.6%. When the wielder\'s battle skill applies Nature Infliction, other operators gain Arts DMG Dealt +14.0% for 15s.' },
  // 6-star Greatswords
  { Name: 'Exemplar', Slug: 'exemplar', Rarity: 6, WeaponType: 'Greatsword', BaseATK: 51, MaxATK: 500, SubStat: 'Main Attribute', SubStatValue: 132, PassiveName: 'Suppression: Stacked Hew', PassiveDescription: 'Physical DMG Dealt +28.0%. When battle skill or ultimate hits enemy, Physical DMG Dealt +28.0% for 30s. Max 3 stacks.' },
  { Name: 'Former Finery', Slug: 'former-finery', Rarity: 6, WeaponType: 'Greatsword', BaseATK: 50, MaxATK: 495, SubStat: 'Will', SubStatValue: 156, PassiveName: 'Efficacy: Mincing Therapy', PassiveDescription: 'Treatment Efficiency +28.0%. After a Protected operator takes DMG, restores their HP.' },
  { Name: 'Khravengger', Slug: 'khravengger', Rarity: 6, WeaponType: 'Greatsword', BaseATK: 51, MaxATK: 505, SubStat: 'Strength', SubStatValue: 156, PassiveName: 'Detonate: Bonechilling', PassiveDescription: 'Skill DMG Dealt +56.0%. When battle skill applies Cryo Infliction, Cryo DMG Dealt +28.0% for 15s.' },
  { Name: 'Sundered Prince', Slug: 'sundered-prince', Rarity: 6, WeaponType: 'Greatsword', BaseATK: 50, MaxATK: 490, SubStat: 'Strength', SubStatValue: 156, PassiveName: 'Crusher: Princely Deterrence', PassiveDescription: 'When wielder performs a Final Strike, ATK +28.0% for 8s. If controlled operator, doubled.' },
  { Name: 'Thunderberge', Slug: 'thunderberge', Rarity: 6, WeaponType: 'Greatsword', BaseATK: 50, MaxATK: 495, SubStat: 'Strength', SubStatValue: 156, PassiveName: 'Medicant: Eye of Talos', PassiveDescription: 'Shield applied +67.2%. After combo skill provides HP treatment, controlled operator gains additional Shield.' },
  // 6-star Handcannons
  { Name: 'Artzy Tyrannical', Slug: 'artzy-tyrannical', Rarity: 6, WeaponType: 'Handcannon', BaseATK: 51, MaxATK: 505, SubStat: 'Intellect', SubStatValue: 156, PassiveName: 'Fracture: Artzy Exaggeration', PassiveDescription: 'Cryo DMG Dealt +44.8%. After scoring a critical hit with battle/combo skill, Cryo DMG Dealt +39.2% for 30s. Max 3 stacks.' },
  { Name: 'Clannibal', Slug: 'clannibal', Rarity: 6, WeaponType: 'Handcannon', BaseATK: 50, MaxATK: 490, SubStat: 'Main Attribute', SubStatValue: 132, PassiveName: 'Infliction: Vicious Purge', PassiveDescription: 'Arts DMG +33.6%. After consuming an Arts Reaction, target suffers Arts DMG Taken +28.0% for 15s.' },
  { Name: 'Navigator', Slug: 'navigator', Rarity: 6, WeaponType: 'Handcannon', BaseATK: 50, MaxATK: 490, SubStat: 'Intellect', SubStatValue: 156, PassiveName: 'Infliction: Lone and Distant Sail', PassiveDescription: 'Critical Rate +9.8%. When Solidification or Corrosion is applied, Cryo and Nature DMG Dealt +9.8% and Crit Rate +5.6%.' },
  { Name: 'Wedge', Slug: 'wedge', Rarity: 6, WeaponType: 'Handcannon', BaseATK: 51, MaxATK: 500, SubStat: 'Main Attribute', SubStatValue: 132, PassiveName: 'Infliction: Wedge of Civilization', PassiveDescription: 'Arts DMG Dealt +33.6%. Battle skill grants Arts DMG +22.4%. Arts Reaction grants Arts DMG +44.8% for 15s.' },
  // 6-star Polearms
  { Name: 'JET', Slug: 'jet', Rarity: 6, WeaponType: 'Polearm', BaseATK: 51, MaxATK: 500, SubStat: 'Main Attribute', SubStatValue: 132, PassiveName: 'Suppression: Astrophysics', PassiveDescription: 'Arts DMG Dealt +33.6%. Battle skill and combo skill each grant Arts DMG Dealt +33.6% for 15s.' },
  { Name: 'Mountain Bearer', Slug: 'mountain-bearer', Rarity: 6, WeaponType: 'Polearm', BaseATK: 51, MaxATK: 500, SubStat: 'Agility', SubStatValue: 156, PassiveName: 'Efficacy: Weight of Mountain', PassiveDescription: 'Against Vulnerable enemies, DMG Dealt +56.0%. Vulnerability grants All Attributes +22.4%.' },
  { Name: 'Valiant', Slug: 'valiant', Rarity: 6, WeaponType: 'Polearm', BaseATK: 50, MaxATK: 495, SubStat: 'Agility', SubStatValue: 156, PassiveName: 'Combative: Virtuous Gain', PassiveDescription: 'ATK +28.0%. After applying Physical Statuses, deals another hit of Physical DMG equal to 336.0% ATK.' },
  // 6-star Swords
  { Name: 'Eminent Repute', Slug: 'eminent-repute', Rarity: 6, WeaponType: 'Sword', BaseATK: 50, MaxATK: 490, SubStat: 'Main Attribute', SubStatValue: 132, PassiveName: 'Brutality: Disciplinarian', PassiveDescription: 'ATK +28.0%. After consuming Vulnerability stacks, ATK increase based on stacks consumed.' },
  { Name: 'Forgeborn Scathe', Slug: 'forgeborn-scathe', Rarity: 6, WeaponType: 'Sword', BaseATK: 52, MaxATK: 510, SubStat: 'Intellect', SubStatValue: 156, PassiveName: 'Twilight: Blazing Wail', PassiveDescription: 'Heat DMG Dealt +44.8%. Ultimate grants Basic Attack DMG Dealt +210.0%.' },
  { Name: 'Grand Vision', Slug: 'grand-vision', Rarity: 6, WeaponType: 'Sword', BaseATK: 51, MaxATK: 500, SubStat: 'Agility', SubStatValue: 156, PassiveName: 'Infliction: Long Time Wish', PassiveDescription: 'Arts Intensity +84. When applying Originium Seal or Solidification, Physical DMG Dealt +100.8%.' },
  { Name: 'Never Rest', Slug: 'never-rest', Rarity: 6, WeaponType: 'Sword', BaseATK: 51, MaxATK: 500, SubStat: 'Will', SubStatValue: 156, PassiveName: 'Flow: Reincarnation', PassiveDescription: 'Physical DMG Dealt +44.8%. After skill recovers SP, Physical DMG Dealt +14.0%. Max 5 stacks.' },
  { Name: 'Rapid Ascent', Slug: 'rapid-ascent', Rarity: 6, WeaponType: 'Sword', BaseATK: 50, MaxATK: 495, SubStat: 'Main Attribute', SubStatValue: 132, PassiveName: 'Twilight: Azure Clouds', PassiveDescription: 'Battle skills and ultimates gain Physical DMG Dealt +42.0%. Against Staggered enemies, +98.0%.' },
  { Name: 'Thermite Cutter', Slug: 'thermite-cutter', Rarity: 6, WeaponType: 'Sword', BaseATK: 50, MaxATK: 490, SubStat: 'Will', SubStatValue: 156, PassiveName: 'Flow: Thermal Release', PassiveDescription: 'ATK +28.0%. After skill recovers SP or grants Link, team ATK +14.0%. Max 2 stacks.' },
  { Name: 'Umbral Torch', Slug: 'umbral-torch', Rarity: 6, WeaponType: 'Sword', BaseATK: 50, MaxATK: 490, SubStat: 'Intellect', SubStatValue: 156, PassiveName: 'Infliction: Covetous Buildup', PassiveDescription: 'ATK +19.6%. When Combustion or Corrosion is applied, Heat and Nature DMG Dealt +22.4%. Max 2 stacks.' },
  { Name: 'White Night Nova', Slug: 'white-night-nova', Rarity: 6, WeaponType: 'Sword', BaseATK: 51, MaxATK: 505, SubStat: 'Main Attribute', SubStatValue: 132, PassiveName: 'Infliction: White Night Nova', PassiveDescription: 'Arts DMG Dealt +33.6%. After applying Combustion or Electrification, Arts DMG Dealt +33.6% and Arts Intensity +70.' },
  // 5-star Arts Units
  { Name: 'Freedom to Proselytize', Slug: 'freedom-to-proselytize', Rarity: 5, WeaponType: 'Arts Unit', BaseATK: 42, MaxATK: 411, SubStat: 'Will', SubStatValue: 124, PassiveName: 'Medicant: Redemption of Faith', PassiveDescription: 'Main Attribute +14.0%. Battle skill HP treatment also restores controlled operator.' },
  { Name: 'Monaihe', Slug: 'monaihe', Rarity: 5, WeaponType: 'Arts Unit', BaseATK: 42, MaxATK: 411, SubStat: 'Will', SubStatValue: 124, PassiveName: 'Inspiring: Mortise-and-Tenon Analysis', PassiveDescription: 'Main Attribute +14.0%. Arts Intensity +70.' },
  { Name: 'OBJ Arts Identifier', Slug: 'obj-arts-identifier', Rarity: 5, WeaponType: 'Arts Unit', BaseATK: 42, MaxATK: 411, SubStat: 'Intellect', SubStatValue: 124, PassiveName: 'Pursuit: Transcendent Arts', PassiveDescription: 'Max HP +28.0%. Combo skill Arts Burst grants team Heat and Electric DMG Dealt +22.4%.' },
  { Name: 'Stanza of Memorials', Slug: 'stanza-of-memorials', Rarity: 5, WeaponType: 'Arts Unit', BaseATK: 42, MaxATK: 411, SubStat: 'Intellect', SubStatValue: 124, PassiveName: 'Twilight: Lustrous Pyre', PassiveDescription: 'Max HP +28.0%. Ultimate grants different-element operators ATK +22.4%.' },
  { Name: 'Wild Wanderer', Slug: 'wild-wanderer', Rarity: 5, WeaponType: 'Arts Unit', BaseATK: 42, MaxATK: 411, SubStat: 'Intellect', SubStatValue: 124, PassiveName: 'Infliction: Wilderness Cluster', PassiveDescription: 'Arts Intensity +28. When applying Electrification, team Physical and Electric DMG Dealt +22.4%.' },
  // 5-star Greatswords
  { Name: 'Ancient Canal', Slug: 'ancient-canal', Rarity: 5, WeaponType: 'Greatsword', BaseATK: 42, MaxATK: 411, SubStat: 'Strength', SubStatValue: 124, PassiveName: 'Brutality: Lands of Yore', PassiveDescription: 'Arts Intensity +28. After consuming Vulnerability, Physical DMG Dealt +14% per stack.' },
  { Name: 'Finishing Call', Slug: 'finishing-call', Rarity: 5, WeaponType: 'Greatsword', BaseATK: 42, MaxATK: 411, SubStat: 'Strength', SubStatValue: 124, PassiveName: 'Medicant: Glory of Knighthood', PassiveDescription: 'Secondary Attribute +14.0%. Combo skill HP treatment effect +56.0%.' },
  { Name: 'OBJ Heavy Burden', Slug: 'obj-heavy-burden', Rarity: 5, WeaponType: 'Greatsword', BaseATK: 42, MaxATK: 411, SubStat: 'Strength', SubStatValue: 124, PassiveName: 'Efficacy: Tenacious Will', PassiveDescription: 'Secondary Attribute +14.0%. Knocked Down or Weakened grants DEF +50.4%.' },
  { Name: 'Seeker of Dark Lung', Slug: 'seeker-of-dark-lung', Rarity: 5, WeaponType: 'Greatsword', BaseATK: 42, MaxATK: 411, SubStat: 'Strength', SubStatValue: 124, PassiveName: 'Detonate: Seeker of the Esoteric', PassiveDescription: 'Main Attribute +14.0%. Arts Burst grants ATK +16.8%. Max 3 stacks.' },
  // 5-star Handcannons
  { Name: 'OBJ Velocitous', Slug: 'obj-velocitous', Rarity: 5, WeaponType: 'Handcannon', BaseATK: 42, MaxATK: 411, SubStat: 'Agility', SubStatValue: 124, PassiveName: 'Detonate: Rapid Strike', PassiveDescription: 'ATK +14.0%. After consuming Arts Infliction, Nature DMG Dealt +14% per stack.' },
  { Name: 'Opus: The Living', Slug: 'opus-the-living', Rarity: 5, WeaponType: 'Handcannon', BaseATK: 42, MaxATK: 411, SubStat: 'Agility', SubStatValue: 124, PassiveName: 'Infliction: Road Home for All Life', PassiveDescription: 'Critical Rate +8.4%. Arts Reaction grants ATK +21.0%. Max 2 stacks.' },
  { Name: 'Rational Farewell', Slug: 'rational-farewell', Rarity: 5, WeaponType: 'Handcannon', BaseATK: 42, MaxATK: 411, SubStat: 'Strength', SubStatValue: 124, PassiveName: 'Pursuit: Aid from the Past', PassiveDescription: 'Battle Skill DMG +28.0%. Combo skill Arts Burst or Combusted grants ATK +44.8%.' },
  // 5-star Polearms
  { Name: 'Chimeric Justice', Slug: 'chimeric-justice', Rarity: 5, WeaponType: 'Polearm', BaseATK: 42, MaxATK: 411, SubStat: 'Strength', SubStatValue: 124, PassiveName: 'Brutality: Cemented Fury', PassiveDescription: 'Critical Rate +8.4%. Vulnerability on unstacked enemy grants ATK +42.0%.' },
  { Name: 'Cohesive Traction', Slug: 'cohesive-traction', Rarity: 5, WeaponType: 'Polearm', BaseATK: 42, MaxATK: 411, SubStat: 'Will', SubStatValue: 124, PassiveName: 'Suppression: Concentric Circles', PassiveDescription: 'Combo Skill DMG Dealt +28.0%. Combo skill grants Electric DMG Dealt +28.0% on next battle skill. Max 3 stacks.' },
  { Name: 'OBJ Razorhorn', Slug: 'obj-razorhorn', Rarity: 5, WeaponType: 'Polearm', BaseATK: 42, MaxATK: 411, SubStat: 'Will', SubStatValue: 124, PassiveName: 'Infliction: Conquest of Icy Peaks', PassiveDescription: 'Against Cryo Infliction/Solidification enemies, DMG Dealt increased. Consuming Solidification grants ATK +33.6%.' },
  // 5-star Swords
  { Name: 'Aspirant', Slug: 'aspirant', Rarity: 5, WeaponType: 'Sword', BaseATK: 42, MaxATK: 411, SubStat: 'Agility', SubStatValue: 124, PassiveName: 'Twilight: Imposing Peak', PassiveDescription: 'Ultimate DMG Dealt +44.8%. Lifted grants Physical DMG Dealt +33.6% on next ultimate. Max 3 stacks.' },
  { Name: 'Finchaser 3.0', Slug: 'finchaser-3-0', Rarity: 5, WeaponType: 'Sword', BaseATK: 42, MaxATK: 411, SubStat: 'Strength', SubStatValue: 124, PassiveName: 'Suppression: Fin Chaser\'s Intent', PassiveDescription: 'ATK +14.0%. Battle skill Solidification causes Cryo DMG Taken +19.6%.' },
  { Name: 'Fortmaker', Slug: 'fortmaker', Rarity: 5, WeaponType: 'Sword', BaseATK: 42, MaxATK: 411, SubStat: 'Intellect', SubStatValue: 124, PassiveName: 'Inspiring: Back to the Broken City', PassiveDescription: 'ATK +14.0%. Arts Intensity +70.' },
  { Name: 'OBJ Edge of Lightness', Slug: 'obj-edge-of-lightness', Rarity: 5, WeaponType: 'Sword', BaseATK: 42, MaxATK: 411, SubStat: 'Agility', SubStatValue: 124, PassiveName: 'Flow: Unbridled Edge', PassiveDescription: 'Secondary Attribute +14.0%. SP recovery grants team Heat and Electric DMG Dealt +8.4%. Max 3 stacks.' },
  { Name: 'Sundering Steel', Slug: 'sundering-steel', Rarity: 5, WeaponType: 'Sword', BaseATK: 42, MaxATK: 411, SubStat: 'Agility', SubStatValue: 124, PassiveName: 'Combative: Anthem of Cinder', PassiveDescription: 'ATK +14.0%. Physical Status grants ATK +21.0%. Max 2 stacks.' },
  { Name: 'Twelve Questions', Slug: 'twelve-questions', Rarity: 5, WeaponType: 'Sword', BaseATK: 42, MaxATK: 411, SubStat: 'Agility', SubStatValue: 124, PassiveName: 'Infliction: Sincere Interrogation', PassiveDescription: 'Secondary Attribute +14.0%. Arts Reaction grants ATK +21.0%. Max 2 stacks.' },
  // 4-star weapons
  { Name: 'Fluorescent Roc', Slug: 'fluorescent-roc', Rarity: 4, WeaponType: 'Arts Unit', BaseATK: 34, MaxATK: 341, SubStat: 'Will', SubStatValue: 93, PassiveName: 'Suppression: Emergency Boost', PassiveDescription: 'Battle skill hit grants ATK +33.6% for 20s.' },
  { Name: 'Hypernova Auto', Slug: 'hypernova-auto', Rarity: 4, WeaponType: 'Arts Unit', BaseATK: 34, MaxATK: 341, SubStat: 'Intellect', SubStatValue: 93, PassiveName: 'Inspiring: Start of a Saga', PassiveDescription: 'When HP above 80.0%, ATK +42.0%.' },
  { Name: 'Industry 0.1', Slug: 'industry-0-1', Rarity: 4, WeaponType: 'Greatsword', BaseATK: 34, MaxATK: 341, SubStat: 'Strength', SubStatValue: 93, PassiveName: 'Suppression: Emergency Boost', PassiveDescription: 'Battle skill hit grants ATK +33.6% for 20s.' },
  { Name: 'Quencher', Slug: 'quencher', Rarity: 4, WeaponType: 'Greatsword', BaseATK: 34, MaxATK: 341, SubStat: 'Will', SubStatValue: 93, PassiveName: 'Crusher: Honed into Legion', PassiveDescription: 'Final Strike grants ATK +33.6% for 10s.' },
  { Name: 'Howling Guard', Slug: 'howling-guard', Rarity: 4, WeaponType: 'Handcannon', BaseATK: 34, MaxATK: 341, SubStat: 'Intellect', SubStatValue: 93, PassiveName: 'Suppression: Emergency Boost', PassiveDescription: 'Battle skill hit grants ATK +33.6% for 20s.' },
  { Name: 'Long Road', Slug: 'long-road', Rarity: 4, WeaponType: 'Handcannon', BaseATK: 34, MaxATK: 341, SubStat: 'Strength', SubStatValue: 93, PassiveName: 'Pursuit: Unending Cycle', PassiveDescription: 'Combo skill grants ATK +33.6% for 20s.' },
  { Name: 'Aggeloslayer', Slug: 'aggeloslayer', Rarity: 4, WeaponType: 'Polearm', BaseATK: 34, MaxATK: 341, SubStat: 'Will', SubStatValue: 93, PassiveName: 'Suppression: Emergency Boost', PassiveDescription: 'Battle skill hit grants ATK +33.6% for 20s.' },
  { Name: 'Pathfinder\'s Beacon', Slug: 'pathfinder-s-beacon', Rarity: 4, WeaponType: 'Polearm', BaseATK: 34, MaxATK: 341, SubStat: 'Agility', SubStatValue: 93, PassiveName: 'Inspiring: Start of a Saga', PassiveDescription: 'When HP above 80.0%, ATK +42.0%.' },
  { Name: 'Contingent Measure', Slug: 'contingent-measure', Rarity: 4, WeaponType: 'Sword', BaseATK: 34, MaxATK: 341, SubStat: 'Agility', SubStatValue: 93, PassiveName: 'Suppression: Emergency Boost', PassiveDescription: 'Battle skill hit grants ATK +33.6% for 20s.' },
  { Name: 'Wave Tide', Slug: 'wave-tide', Rarity: 4, WeaponType: 'Sword', BaseATK: 34, MaxATK: 341, SubStat: 'Intellect', SubStatValue: 93, PassiveName: 'Pursuit: Unending Cycle', PassiveDescription: 'Combo skill grants ATK +33.6% for 20s.' },
  // 3-star weapons
  { Name: 'Jiminy 12', Slug: 'jiminy-12', Rarity: 3, WeaponType: 'Arts Unit', BaseATK: 29, MaxATK: 283, SubStat: 'Main Attribute', SubStatValue: 79, PassiveName: 'Assault: Armament Prep', PassiveDescription: 'ATK +33.6.' },
  { Name: 'Darhoff 7', Slug: 'darhoff-7', Rarity: 3, WeaponType: 'Greatsword', BaseATK: 29, MaxATK: 283, SubStat: 'Main Attribute', SubStatValue: 79, PassiveName: 'Assault: Armament Prep', PassiveDescription: 'ATK +33.6.' },
  { Name: 'Peco 5', Slug: 'peco-5', Rarity: 3, WeaponType: 'Handcannon', BaseATK: 29, MaxATK: 283, SubStat: 'Main Attribute', SubStatValue: 79, PassiveName: 'Assault: Armament Prep', PassiveDescription: 'ATK +33.6.' },
  { Name: 'Opero 77', Slug: 'opero-77', Rarity: 3, WeaponType: 'Polearm', BaseATK: 29, MaxATK: 283, SubStat: 'Main Attribute', SubStatValue: 79, PassiveName: 'Assault: Armament Prep', PassiveDescription: 'ATK +33.6.' },
  { Name: 'Tarr 11', Slug: 'tarr-11', Rarity: 3, WeaponType: 'Sword', BaseATK: 29, MaxATK: 283, SubStat: 'Main Attribute', SubStatValue: 79, PassiveName: 'Assault: Armament Prep', PassiveDescription: 'ATK +33.6.' },
];

// ============================================================
// BLUEPRINT DATA (21 community blueprints) - from endfield-hub-next/src/data/blueprints.ts
// ============================================================
const CDN = 'https://endfieldtools.dev';
const BLUEPRINTS: Record<string, unknown>[] = [
  { Title: 'Buck Capsule [A] 0.75/min', Author: 'KayWDubs', Region: 'NA / EU', Upvotes: 12, Tags: ['capsule', 'buck', 'production'], Category: 'Production', Complexity: 'Beginner', ImportString: 'EFO01...', Description: 'Simple Buck Capsule A production line.', ProductName: 'Buck Capsule [A]' },
  { Title: 'Optimized Manganese Steel', Author: 'FactoryEnjoyer', Region: 'NA / EU', Upvotes: 25, Tags: ['manganese', 'steel', 'optimized'], Category: 'Processing', Complexity: 'Intermediate', ImportString: 'EFO01...', Description: 'Efficient manganese steel processing.' },
  { Title: 'Compact Carbon Fiber', Author: 'Blueprinter', Region: 'Asia', Upvotes: 31, Tags: ['carbon', 'fiber', 'compact'], Category: 'Production', Complexity: 'Beginner', ImportString: 'EFO01...', Description: 'Compact carbon fiber production.' },
  { Title: 'Full Polyester Chain', Author: 'IndustrialMind', Region: 'NA / EU', Upvotes: 18, Tags: ['polyester', 'complete-chain'], Category: 'Complete Chain', Complexity: 'Advanced', ImportString: 'EFO01...', Description: 'Complete polyester production chain from raw to finished.' },
  { Title: 'Efficient Circuit Board', Author: 'TechBuilder', Region: 'Asia', Upvotes: 42, Tags: ['circuit', 'efficient'], Category: 'Production', Complexity: 'Intermediate', ImportString: 'EFO01...', Description: 'Optimized circuit board assembly.' },
  { Title: 'Mass Rubber Processing', Author: 'ResourceKing', Region: 'CN', Upvotes: 15, Tags: ['rubber', 'mass'], Category: 'Processing', Complexity: 'Beginner', ImportString: 'EFO01...', Description: 'Large-scale rubber processing plant.' },
  { Title: 'Solar Panel Factory', Author: 'GreenEnergy', Region: 'NA / EU', Upvotes: 38, Tags: ['solar', 'power', 'green'], Category: 'Production', Complexity: 'Advanced', ImportString: 'EFO01...', Description: 'Automated solar panel manufacturing.' },
  { Title: 'Compact Power Grid', Author: 'PowerPro', Region: 'Asia', Upvotes: 22, Tags: ['power', 'compact', 'grid'], Category: 'Power', Complexity: 'Intermediate', ImportString: 'EFO01...', Description: 'Space-efficient power distribution setup.' },
  { Title: 'Iron Ingot Starter', Author: 'NewbHelper', Region: 'NA / EU', Upvotes: 55, Tags: ['iron', 'beginner', 'starter'], Category: 'Processing', Complexity: 'Beginner', ImportString: 'EFO01...', Description: 'Simple iron ingot smelting for beginners.' },
  { Title: 'Copper Wire Automation', Author: 'WireWizard', Region: 'CN', Upvotes: 19, Tags: ['copper', 'wire', 'automation'], Category: 'Production', Complexity: 'Beginner', ImportString: 'EFO01...', Description: 'Automated copper wire production.' },
  { Title: 'Advanced Alloy Smelter', Author: 'MetalMaster', Region: 'NA / EU', Upvotes: 33, Tags: ['alloy', 'advanced', 'smelting'], Category: 'Processing', Complexity: 'Advanced', ImportString: 'EFO01...', Description: 'Multi-input alloy smelting facility.' },
  { Title: 'Originium Dust Processor', Author: 'OreExpert', Region: 'Asia', Upvotes: 28, Tags: ['originium', 'dust', 'processing'], Category: 'Processing', Complexity: 'Intermediate', ImportString: 'EFO01...', Description: 'Originium dust extraction and refinement.' },
  { Title: 'Compact Plastic Line', Author: 'PlasticFan', Region: 'NA / EU', Upvotes: 14, Tags: ['plastic', 'compact'], Category: 'Compact', Complexity: 'Beginner', ImportString: 'EFO01...', Description: 'Minimal footprint plastic production.' },
  { Title: 'Glass Manufacturing Hub', Author: 'ClearView', Region: 'CN', Upvotes: 21, Tags: ['glass', 'manufacturing'], Category: 'Production', Complexity: 'Intermediate', ImportString: 'EFO01...', Description: 'Large glass manufacturing facility.' },
  { Title: 'Steel Plate Assembly', Author: 'SteelWorker', Region: 'NA / EU', Upvotes: 36, Tags: ['steel', 'plate', 'assembly'], Category: 'Production', Complexity: 'Intermediate', ImportString: 'EFO01...', Description: 'Steel plate assembly from raw iron.' },
  { Title: 'Battery Cell Production', Author: 'EnergyCell', Region: 'Asia', Upvotes: 29, Tags: ['battery', 'cell', 'energy'], Category: 'Production', Complexity: 'Advanced', ImportString: 'EFO01...', Description: 'Battery cell manufacturing with proper ratios.' },
  { Title: 'Compact Cement Mixer', Author: 'BuilderBob', Region: 'NA / EU', Upvotes: 17, Tags: ['cement', 'compact', 'mixer'], Category: 'Compact', Complexity: 'Beginner', ImportString: 'EFO01...', Description: 'Small footprint cement production.' },
  { Title: 'Full Electronics Chain', Author: 'ChipMaster', Region: 'CN', Upvotes: 45, Tags: ['electronics', 'full-chain'], Category: 'Complete Chain', Complexity: 'Expert', ImportString: 'EFO01...', Description: 'Complete electronics from silicon to finished chips.' },
  { Title: 'Fuel Rod Assembly', Author: 'NuclearFan', Region: 'Asia', Upvotes: 24, Tags: ['fuel', 'rod', 'nuclear'], Category: 'Production', Complexity: 'Expert', ImportString: 'EFO01...', Description: 'Fuel rod assembly for nuclear power generation.' },
  { Title: 'Efficient Concrete Plant', Author: 'FoundationPro', Region: 'NA / EU', Upvotes: 20, Tags: ['concrete', 'efficient'], Category: 'Processing', Complexity: 'Intermediate', ImportString: 'EFO01...', Description: 'Balanced concrete mixing and curing facility.' },
  { Title: 'Mega Power Station', Author: 'PowerMax', Region: 'CN', Upvotes: 41, Tags: ['power', 'mega', 'station'], Category: 'Power', Complexity: 'Expert', ImportString: 'EFO01...', Description: 'Maximum output power generation complex.' },
].map(bp => ({
  ...bp,
  Slug: (bp.Title as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  Status: 'approved',
}));

// ============================================================
// EQUIPMENT SETS (18 sets) - condensed from endfield-hub-next/src/data/gear.ts
// ============================================================
const EQUIPMENT_SETS: Record<string, unknown>[] = [
  // Late Game T4
  { Name: 'Bonekrusha', Tier: 'T4', GamePhase: 'Late Game', Rarity: 5, SetBonus: '3-piece: ATK +15%. When wielder performs a Final Strike on the enemy, the wielder gains ATK +30% for 8s.' },
  { Name: 'Eternal Xiranite', Tier: 'T4', GamePhase: 'Late Game', Rarity: 5, SetBonus: '3-piece: Intellect +80. Arts DMG Dealt +18%. When the wielder consumes an Arts Reaction, Arts DMG Dealt +15% for 15s. Max 2 stacks.' },
  { Name: 'Frontiers', Tier: 'T4', GamePhase: 'Late Game', Rarity: 5, SetBonus: '3-piece: Agility +80. Physical DMG +18%. When wielder\'s battle skill hits enemy, Physical DMG Dealt +28% for 15s.' },
  { Name: 'MI Security', Tier: 'T4', GamePhase: 'Late Game', Rarity: 5, SetBonus: '3-piece: Will +80. Treatment Efficiency +20%. When wielder provides HP treatment, target gains a Shield equal to 15% of treatment amount for 10s.' },
  { Name: 'Pulser Labs', Tier: 'T4', GamePhase: 'Late Game', Rarity: 5, SetBonus: '3-piece: Strength +80. When the wielder is the controlled operator, ATK +25%. When the wielder hits an enemy with an ultimate, Crit Rate +20% for 10s.' },
  { Name: 'Scavenger', Tier: 'T4', GamePhase: 'Late Game', Rarity: 5, SetBonus: '3-piece: Agility +80. Crit Rate +12%. When the wielder scores a critical hit, ATK +8% for 15s. Max 5 stacks.' },
  { Name: 'Swordmancer', Tier: 'T4', GamePhase: 'Late Game', Rarity: 5, SetBonus: '3-piece: Strength +80. Physical DMG Dealt +18%. When wielder applies Vulnerability, Physical DMG Dealt +22% for 15s.' },
  { Name: 'Talos Pioneer', Tier: 'T4', GamePhase: 'Late Game', Rarity: 5, SetBonus: '3-piece: Will +80. Shield amount +25%. When wielder provides a Shield to an ally, the ally gains DEF +20% for 15s.' },
  { Name: 'Truthseeker', Tier: 'T4', GamePhase: 'Late Game', Rarity: 5, SetBonus: '3-piece: Intellect +80. Arts Intensity +50. After the wielder applies an Arts Reaction, Arts Intensity +30 for 15s. Max 3 stacks.' },
  { Name: 'Wrathcore', Tier: 'T4', GamePhase: 'Late Game', Rarity: 5, SetBonus: '3-piece: Strength +80. ATK +15%. When the wielder casts an ultimate, the wielder gains All DMG Dealt +25% for 15s.' },
  // Mid Game T2-T3
  { Name: 'Armored MSGR', Tier: 'T3', GamePhase: 'Mid Game', Rarity: 4, SetBonus: '3-piece: Strength +50. When HP below 50%, 30% DMG Reduction against all types.' },
  { Name: 'Catastrophe', Tier: 'T3', GamePhase: 'Mid Game', Rarity: 4, SetBonus: '3-piece: Ultimate Gain Efficiency +20%. Battle skill returns 50 SP. Once per battle.' },
  { Name: 'Mordvolt Insulation', Tier: 'T3', GamePhase: 'Mid Game', Rarity: 4, SetBonus: '3-piece: Intellect +50. When HP above 80%, Arts DMG +20%.' },
  { Name: 'Mordvolt Resistant', Tier: 'T3', GamePhase: 'Mid Game', Rarity: 4, SetBonus: '3-piece: Will +50. When HP below 50%, Treatment Effect +30%.' },
  { Name: 'Roving MSGR', Tier: 'T3', GamePhase: 'Mid Game', Rarity: 4, SetBonus: '3-piece: Agility +50. When HP above 80%, Physical DMG +20%.' },
  { Name: 'Talos Heavy Duty', Tier: 'T3', GamePhase: 'Mid Game', Rarity: 4, SetBonus: '3-piece: DEF +15%. When HP below 30%, DEF +25% and DMG Reduction +15% for 10s.' },
  // Early Game T1
  { Name: 'AIC Heavy', Tier: 'T1', GamePhase: 'Early Game', Rarity: 3, SetBonus: '3-piece: HP +500. After defeating an enemy, restores 100 HP. Cooldown: 5s.' },
  { Name: 'AIC Light', Tier: 'T1', GamePhase: 'Early Game', Rarity: 3, SetBonus: '3-piece: HP +500. After defeating an enemy, ATK boost for 5s.' },
].map(s => ({
  ...s,
  Slug: (s.Name as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
}));

// ============================================================
// FARMING ZONES (5) - from endfield-hub-next/src/data/essences.ts
// ============================================================
const FARMING_ZONES: Record<string, unknown>[] = [
  { Name: 'The Hub', ZoneId: 'the-hub', Region: 'Valley IV', Enemy: 'Originium Slug', SecondaryStats: ['ATK', 'HP', 'DEF'], SkillStats: ['Crit Rate', 'Crit DMG', 'Arts Intensity'] },
  { Name: 'Originium Science Park', ZoneId: 'originium-science-park', Region: 'Valley IV', Enemy: 'Originium Drone', SecondaryStats: ['ATK', 'HP', 'Arts Intensity'], SkillStats: ['Physical DMG', 'Arts DMG', 'Heal Output'] },
  { Name: 'Origin Lodespring', ZoneId: 'origin-lodespring', Region: 'Wuling', Enemy: 'Rock Breaker', SecondaryStats: ['ATK', 'DEF', 'Crit Rate'], SkillStats: ['Physical DMG', 'Cryo DMG', 'Heat DMG'] },
  { Name: 'Power Plateau', ZoneId: 'power-plateau', Region: 'Wuling', Enemy: 'Sentinel', SecondaryStats: ['HP', 'DEF', 'Crit DMG'], SkillStats: ['Electric DMG', 'Nature DMG', 'Arts Intensity'] },
  { Name: 'Wuling Outskirts', ZoneId: 'wuling-outskirts', Region: 'Wuling', Enemy: 'Feral Beast', SecondaryStats: ['ATK', 'HP', 'Crit Rate'], SkillStats: ['Crit DMG', 'Physical DMG', 'Heal Output'] },
];

// ============================================================
// MAIN SEED FUNCTION
// ============================================================
async function main() {
  console.log(`Seeding Strapi at ${STRAPI_URL}...`);
  console.log('');

  // Verify connection
  try {
    const res = await fetch(`${STRAPI_URL}/api/characters?pagination[pageSize]=1`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log('Connected to Strapi successfully.\n');
  } catch (err: any) {
    console.error(`Cannot connect to Strapi at ${STRAPI_URL}: ${err.message}`);
    console.error('Make sure Strapi is running and the API token is valid.');
    process.exit(1);
  }

  await seedCollection('Characters', '/characters', CHARACTERS);
  await seedCollection('Weapons', '/weapons', WEAPONS);
  await seedCollection('Blueprints', '/blueprints', BLUEPRINTS, 'Title');
  await seedCollection('Equipment Sets', '/equipment-sets', EQUIPMENT_SETS);
  await seedCollection('Farming Zones', '/farming-zones', FARMING_ZONES);

  console.log('\n=== SEED COMPLETE ===');
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
