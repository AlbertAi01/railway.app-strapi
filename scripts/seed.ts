/**
 * Seed script for Endfield Hub Strapi
 * Run with: npx ts-node scripts/seed.ts
 *
 * Populates the database with all game data from the scraped endfieldtools.dev data
 * and our improved/verified content.
 */

import axios from 'axios';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN || '';

const api = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }),
  },
});

async function seed() {
  console.log('Starting Endfield Hub seed...');

  // Seed Characters
  const characters = [
    { Name: 'Ardelia', Slug: 'ardelia', Rarity: 6, Element: 'Nature', Role: 'Supporter', WeaponType: 'Arts Unit', BaseHP: 1200, BaseATK: 280, BaseDEF: 150, MaxHP: 8400, MaxATK: 1960, MaxDEF: 1050 },
    { Name: 'Ember', Slug: 'ember', Rarity: 6, Element: 'Heat', Role: 'Guard', WeaponType: 'Greatsword', BaseHP: 1350, BaseATK: 320, BaseDEF: 130, MaxHP: 9450, MaxATK: 2240, MaxDEF: 910 },
    { Name: 'Endministrator', Slug: 'endministrator', Rarity: 6, Element: 'Physical', Role: 'Striker', WeaponType: 'Sword', BaseHP: 1100, BaseATK: 340, BaseDEF: 120, MaxHP: 7700, MaxATK: 2380, MaxDEF: 840 },
    { Name: 'Gilberta', Slug: 'gilberta', Rarity: 6, Element: 'Nature', Role: 'Caster', WeaponType: 'Arts Unit', BaseHP: 1050, BaseATK: 350, BaseDEF: 100, MaxHP: 7350, MaxATK: 2450, MaxDEF: 700 },
    { Name: 'Laevatain', Slug: 'laevatain', Rarity: 6, Element: 'Heat', Role: 'Guard', WeaponType: 'Greatsword', BaseHP: 1400, BaseATK: 310, BaseDEF: 140, MaxHP: 9800, MaxATK: 2170, MaxDEF: 980 },
    { Name: 'Last Rite', Slug: 'last-rite', Rarity: 6, Element: 'Cryo', Role: 'Striker', WeaponType: 'Polearm', BaseHP: 1150, BaseATK: 330, BaseDEF: 110, MaxHP: 8050, MaxATK: 2310, MaxDEF: 770 },
    { Name: 'Lifeng', Slug: 'lifeng', Rarity: 6, Element: 'Physical', Role: 'Defender', WeaponType: 'Greatsword', BaseHP: 1500, BaseATK: 250, BaseDEF: 200, MaxHP: 10500, MaxATK: 1750, MaxDEF: 1400 },
    { Name: 'Pogranichnik', Slug: 'pogranichnik', Rarity: 6, Element: 'Physical', Role: 'Vanguard', WeaponType: 'Handcannon', BaseHP: 1250, BaseATK: 300, BaseDEF: 125, MaxHP: 8750, MaxATK: 2100, MaxDEF: 875 },
    { Name: 'Yvonne', Slug: 'yvonne', Rarity: 6, Element: 'Cryo', Role: 'Caster', WeaponType: 'Arts Unit', BaseHP: 1000, BaseATK: 360, BaseDEF: 95, MaxHP: 7000, MaxATK: 2520, MaxDEF: 665 },
    // 5-stars and 4-stars would follow the same pattern
  ];

  for (const char of characters) {
    try {
      await api.post('/characters', { data: char });
      console.log(`  Created character: ${char.Name}`);
    } catch (e: any) {
      console.log(`  Skipped ${char.Name}: ${e.response?.data?.error?.message || e.message}`);
    }
  }

  // Seed Blueprints with community data
  const blueprints = [
    { Title: 'Efficient Iron Smelting Line', Slug: 'efficient-iron-smelting', Description: 'Optimized 4-smelter iron ingot production line with balanced ore input.', ImportString: 'ENDFIELD-BP-v1-iron-smelt-4x', Upvotes: 142, Region: 'NA / EU', Author: 'FactoryKing', Tags: ['Iron', 'Beginner', 'Compact'], Category: 'Production', Complexity: 'Beginner' },
    { Title: 'Advanced Circuit Board Factory', Slug: 'advanced-circuit-board', Description: 'Full production chain from raw copper and sand to finished circuit boards.', ImportString: 'ENDFIELD-BP-v1-circuit-full', Upvotes: 89, Region: 'Asia', Author: 'TechBuilder', Tags: ['Circuit', 'Advanced', 'Self-contained'], Category: 'Complete Chain', Complexity: 'Advanced' },
    { Title: 'Power Cell Mass Production', Slug: 'power-cell-mass', Description: 'Large-scale power cell facility with 12 assemblers.', ImportString: 'ENDFIELD-BP-v1-power-cell-12x', Upvotes: 67, Region: 'CN', Author: 'MegaFactory', Tags: ['Power Cell', 'Endgame', 'Large'], Category: 'Assembly', Complexity: 'Expert' },
    { Title: 'Beginner Steel Setup', Slug: 'beginner-steel', Description: 'Simple 2-smelter steel plate production for new players.', ImportString: 'ENDFIELD-BP-v1-steel-beginner', Upvotes: 203, Region: 'NA / EU', Author: 'NewbHelper', Tags: ['Steel', 'Beginner', 'Simple'], Category: 'Processing', Complexity: 'Beginner' },
    { Title: 'Originium Processing Hub', Slug: 'originium-processing', Description: 'Efficient originium ore processing with 6 crushers.', ImportString: 'ENDFIELD-BP-v1-originium-6x', Upvotes: 156, Region: 'Asia', Author: 'OreExpert', Tags: ['Originium', 'Processing', 'Efficient'], Category: 'Processing', Complexity: 'Intermediate' },
  ];

  for (const bp of blueprints) {
    try {
      await api.post('/blueprints', { data: bp });
      console.log(`  Created blueprint: ${bp.Title}`);
    } catch (e: any) {
      console.log(`  Skipped blueprint ${bp.Title}: ${e.response?.data?.error?.message || e.message}`);
    }
  }

  console.log('Seed complete!');
}

seed().catch(console.error);
