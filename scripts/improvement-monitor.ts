/**
 * Continuous Improvement Monitor for Endfield Hub
 *
 * Runs on a schedule to:
 * 1. Check for new game content updates
 * 2. Analyze user engagement metrics
 * 3. Identify missing or outdated content
 * 4. Generate improvement recommendations
 * 5. Monitor data quality and completeness
 *
 * Run: npx ts-node scripts/improvement-monitor.ts
 * Schedule: Run as a Railway cron job every 6 hours
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

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
}

const recommendations: Recommendation[] = [];

async function checkContentCompleteness() {
  console.log('\n--- Checking Content Completeness ---');

  const contentTypes = [
    { name: 'Characters', path: '/characters', expectedMin: 23 },
    { name: 'Weapons', path: '/weapons', expectedMin: 10 },
    { name: 'Equipment Sets', path: '/equipment-sets', expectedMin: 8 },
    { name: 'Guides', path: '/guides', expectedMin: 6 },
    { name: 'Blueprints', path: '/blueprints', expectedMin: 5 },
    { name: 'Recipes', path: '/recipes', expectedMin: 10 },
    { name: 'Achievements', path: '/achievements', expectedMin: 20 },
    { name: 'Materials', path: '/materials', expectedMin: 15 },
    { name: 'Map Markers', path: '/map-markers', expectedMin: 20 },
  ];

  for (const ct of contentTypes) {
    try {
      const { data } = await api.get(`${ct.path}?pagination[pageSize]=1&pagination[withCount]=true`);
      const count = data.meta?.pagination?.total || data.data?.length || 0;

      if (count === 0) {
        recommendations.push({
          priority: 'high',
          category: 'Missing Content',
          title: `No ${ct.name} data`,
          description: `The ${ct.name} collection is empty. Expected at least ${ct.expectedMin} entries. This should be seeded immediately.`,
        });
      } else if (count < ct.expectedMin) {
        recommendations.push({
          priority: 'medium',
          category: 'Incomplete Content',
          title: `${ct.name}: ${count}/${ct.expectedMin} entries`,
          description: `Only ${count} ${ct.name.toLowerCase()} exist. Expected at least ${ct.expectedMin}. Consider adding more data.`,
        });
      } else {
        console.log(`  [OK] ${ct.name}: ${count} entries (>= ${ct.expectedMin})`);
      }
    } catch (e: any) {
      console.log(`  [SKIP] ${ct.name}: ${e.message}`);
    }
  }
}

async function checkGuideQuality() {
  console.log('\n--- Checking Guide Quality ---');

  try {
    const { data } = await api.get('/guides?pagination[pageSize]=100');
    const guides = data.data || [];

    const unverified = guides.filter((g: any) => !(g.attributes || g).IsVerified);
    if (unverified.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'Quality',
        title: `${unverified.length} unverified guides`,
        description: `There are ${unverified.length} guides that haven't been verified. Run the fact-checker to validate content accuracy.`,
      });
    }

    // Check for guides with low engagement
    const lowEngagement = guides.filter((g: any) => ((g.attributes || g).Upvotes || 0) < 10 && ((g.attributes || g).ViewCount || 0) < 50);
    if (lowEngagement.length > 0) {
      recommendations.push({
        priority: 'low',
        category: 'Engagement',
        title: `${lowEngagement.length} guides with low engagement`,
        description: `Consider improving or promoting these guides for better visibility.`,
      });
    }

    // Check for missing guide categories
    const categories = new Set(guides.map((g: any) => (g.attributes || g).Category));
    const expectedCategories = ['Beginner', 'Combat', 'Factory', 'Character Build', 'Equipment', 'Exploration', 'Endgame', 'Farming'];
    const missing = expectedCategories.filter(c => !categories.has(c));

    if (missing.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'Content Gap',
        title: `Missing guide categories: ${missing.join(', ')}`,
        description: `No guides exist for these categories. Consider creating comprehensive guides for: ${missing.join(', ')}.`,
      });
    }

    console.log(`  Checked ${guides.length} guides`);
  } catch (e: any) {
    console.log(`  Error: ${e.message}`);
  }
}

async function checkCharacterCoverage() {
  console.log('\n--- Checking Character Build Coverage ---');

  const expectedCharacters = [
    'Ardelia', 'Ember', 'Endministrator', 'Gilberta', 'Laevatain',
    'Last Rite', 'Lifeng', 'Pogranichnik', 'Yvonne', 'Alesh',
    'Arclight', 'Avywenna', 'Chen Qianyu', 'Da Pan', 'Perlica',
    'Snowshine', 'Wulfgard', 'Xaihi', 'Akekuri', 'Antal',
    'Catcher', 'Estella', 'Fluorite',
  ];

  try {
    const { data } = await api.get('/characters?pagination[pageSize]=100');
    const existing = (data.data || []).map((c: any) => (c.attributes || c).Name);
    const missing = expectedCharacters.filter(name => !existing.includes(name));

    if (missing.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Missing Characters',
        title: `${missing.length} characters missing from database`,
        description: `Missing: ${missing.join(', ')}. These characters should be added with full stats and skill data.`,
      });
    }
  } catch (e: any) {
    console.log(`  Error: ${e.message}`);
  }
}

async function checkDataFreshness() {
  console.log('\n--- Checking Data Freshness ---');

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const { data } = await api.get(`/guides?filters[updatedAt][$lt]=${oneWeekAgo}&pagination[pageSize]=100`);
    const staleGuides = data.data || [];

    if (staleGuides.length > 5) {
      recommendations.push({
        priority: 'low',
        category: 'Freshness',
        title: `${staleGuides.length} guides not updated in 7+ days`,
        description: `Consider reviewing older guides for accuracy and relevance after recent game updates.`,
      });
    }
  } catch (e: any) {
    console.log(`  Error: ${e.message}`);
  }
}

async function generateReport() {
  console.log('\n\n========================================');
  console.log('  IMPROVEMENT MONITOR REPORT');
  console.log('========================================\n');
  console.log(`Generated: ${new Date().toISOString()}\n`);

  const high = recommendations.filter(r => r.priority === 'high');
  const medium = recommendations.filter(r => r.priority === 'medium');
  const low = recommendations.filter(r => r.priority === 'low');

  console.log(`Total recommendations: ${recommendations.length}`);
  console.log(`  HIGH:   ${high.length}`);
  console.log(`  MEDIUM: ${medium.length}`);
  console.log(`  LOW:    ${low.length}`);

  if (high.length > 0) {
    console.log('\n--- HIGH PRIORITY ---');
    high.forEach((r, i) => {
      console.log(`\n  ${i + 1}. [${r.category}] ${r.title}`);
      console.log(`     ${r.description}`);
    });
  }

  if (medium.length > 0) {
    console.log('\n--- MEDIUM PRIORITY ---');
    medium.forEach((r, i) => {
      console.log(`\n  ${i + 1}. [${r.category}] ${r.title}`);
      console.log(`     ${r.description}`);
    });
  }

  if (low.length > 0) {
    console.log('\n--- LOW PRIORITY ---');
    low.forEach((r, i) => {
      console.log(`\n  ${i + 1}. [${r.category}] ${r.title}`);
      console.log(`     ${r.description}`);
    });
  }

  console.log('\n========================================');
  console.log('  END REPORT');
  console.log('========================================');
}

async function main() {
  console.log('Endfield Hub Improvement Monitor v1.0');
  console.log(`Target: ${STRAPI_URL}`);

  await checkContentCompleteness();
  await checkGuideQuality();
  await checkCharacterCoverage();
  await checkDataFreshness();
  await generateReport();
}

main().catch(console.error);
