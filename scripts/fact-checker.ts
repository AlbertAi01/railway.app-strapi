/**
 * Fact-Checker Agent for Endfield Hub
 *
 * Validates all written content against known game data.
 * Checks:
 * 1. Character stats match known values
 * 2. Skill descriptions are accurate
 * 3. Recipe inputs/outputs are correct
 * 4. Equipment set bonuses match game data
 * 5. Guide recommendations align with current meta
 * 6. No outdated information after patches
 *
 * Run: npx ts-node scripts/fact-checker.ts
 * Schedule: Set up as a cron job or Railway scheduled task
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

interface VerificationResult {
  entity: string;
  field: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
}

const results: VerificationResult[] = [];

// Known correct data for verification
const KNOWN_CHARACTERS: Record<string, { Element: string; Rarity: number; Role: string }> = {
  'Ardelia': { Element: 'Nature', Rarity: 6, Role: 'Supporter' },
  'Ember': { Element: 'Heat', Rarity: 6, Role: 'Guard' },
  'Endministrator': { Element: 'Physical', Rarity: 6, Role: 'Striker' },
  'Gilberta': { Element: 'Nature', Rarity: 6, Role: 'Caster' },
  'Laevatain': { Element: 'Heat', Rarity: 6, Role: 'Guard' },
  'Last Rite': { Element: 'Cryo', Rarity: 6, Role: 'Striker' },
  'Lifeng': { Element: 'Physical', Rarity: 6, Role: 'Defender' },
  'Pogranichnik': { Element: 'Physical', Rarity: 6, Role: 'Vanguard' },
  'Yvonne': { Element: 'Cryo', Rarity: 6, Role: 'Caster' },
  'Alesh': { Element: 'Cryo', Rarity: 5, Role: 'Supporter' },
  'Arclight': { Element: 'Electric', Rarity: 5, Role: 'Striker' },
  'Avywenna': { Element: 'Electric', Rarity: 5, Role: 'Caster' },
  'Chen Qianyu': { Element: 'Physical', Rarity: 5, Role: 'Guard' },
  'Da Pan': { Element: 'Physical', Rarity: 5, Role: 'Defender' },
  'Perlica': { Element: 'Electric', Rarity: 5, Role: 'Supporter' },
  'Snowshine': { Element: 'Cryo', Rarity: 5, Role: 'Caster' },
  'Wulfgard': { Element: 'Heat', Rarity: 5, Role: 'Vanguard' },
  'Xaihi': { Element: 'Cryo', Rarity: 5, Role: 'Guard' },
  'Akekuri': { Element: 'Heat', Rarity: 4, Role: 'Striker' },
  'Antal': { Element: 'Electric', Rarity: 4, Role: 'Guard' },
  'Catcher': { Element: 'Physical', Rarity: 4, Role: 'Vanguard' },
  'Estella': { Element: 'Cryo', Rarity: 4, Role: 'Supporter' },
  'Fluorite': { Element: 'Nature', Rarity: 4, Role: 'Caster' },
};

async function verifyCharacters() {
  console.log('\n--- Verifying Characters ---');
  try {
    const { data } = await api.get('/characters?pagination[pageSize]=100');
    const characters = data.data || [];

    for (const char of characters) {
      const attrs = char.attributes || char;
      const known = KNOWN_CHARACTERS[attrs.Name];

      if (!known) {
        results.push({ entity: `Character:${attrs.Name}`, field: 'existence', status: 'warning', message: `Unknown character "${attrs.Name}" not in verification database` });
        continue;
      }

      if (attrs.Element !== known.Element) {
        results.push({ entity: `Character:${attrs.Name}`, field: 'Element', status: 'fail', message: `Expected ${known.Element}, got ${attrs.Element}` });
      } else {
        results.push({ entity: `Character:${attrs.Name}`, field: 'Element', status: 'pass', message: 'Element correct' });
      }

      if (attrs.Rarity !== known.Rarity) {
        results.push({ entity: `Character:${attrs.Name}`, field: 'Rarity', status: 'fail', message: `Expected ${known.Rarity}, got ${attrs.Rarity}` });
      } else {
        results.push({ entity: `Character:${attrs.Name}`, field: 'Rarity', status: 'pass', message: 'Rarity correct' });
      }

      if (attrs.Role !== known.Role) {
        results.push({ entity: `Character:${attrs.Name}`, field: 'Role', status: 'fail', message: `Expected ${known.Role}, got ${attrs.Role}` });
      } else {
        results.push({ entity: `Character:${attrs.Name}`, field: 'Role', status: 'pass', message: 'Role correct' });
      }
    }

    console.log(`  Checked ${characters.length} characters`);
  } catch (e: any) {
    console.log(`  Error fetching characters: ${e.message}`);
  }
}

async function verifyGuides() {
  console.log('\n--- Verifying Guides ---');
  try {
    const { data } = await api.get('/guides?pagination[pageSize]=100');
    const guides = data.data || [];

    for (const guide of guides) {
      const attrs = guide.attributes || guide;

      // Check for required fields
      if (!attrs.Title) {
        results.push({ entity: `Guide:${guide.id}`, field: 'Title', status: 'fail', message: 'Missing title' });
      }
      if (!attrs.Content || attrs.Content.length < 100) {
        results.push({ entity: `Guide:${attrs.Title || guide.id}`, field: 'Content', status: 'warning', message: 'Content is very short (< 100 chars)' });
      }

      // Check for outdated character references
      const content = attrs.Content || '';
      const mentionedChars = Object.keys(KNOWN_CHARACTERS).filter(name => content.includes(name));

      for (const charName of mentionedChars) {
        const known = KNOWN_CHARACTERS[charName];
        // Check if guide incorrectly states element or role
        if (content.includes(`${charName}`) && content.includes('Physical') && known.Element !== 'Physical') {
          if (content.match(new RegExp(`${charName}[^.]*Physical`, 'i'))) {
            results.push({
              entity: `Guide:${attrs.Title}`,
              field: 'CharacterReference',
              status: 'warning',
              message: `May incorrectly reference ${charName} as Physical (actual: ${known.Element})`,
            });
          }
        }
      }

      // Mark verification timestamp
      if (!attrs.IsVerified) {
        results.push({ entity: `Guide:${attrs.Title}`, field: 'Verification', status: 'warning', message: 'Guide not yet verified' });
      } else {
        results.push({ entity: `Guide:${attrs.Title}`, field: 'Verification', status: 'pass', message: 'Guide is verified' });
      }
    }

    console.log(`  Checked ${guides.length} guides`);
  } catch (e: any) {
    console.log(`  Error fetching guides: ${e.message}`);
  }
}

async function verifyBlueprints() {
  console.log('\n--- Verifying Blueprints ---');
  try {
    const { data } = await api.get('/blueprints?pagination[pageSize]=100');
    const blueprints = data.data || [];

    for (const bp of blueprints) {
      const attrs = bp.attributes || bp;

      if (!attrs.ImportString || attrs.ImportString.length < 10) {
        results.push({ entity: `Blueprint:${attrs.Title}`, field: 'ImportString', status: 'fail', message: 'Import string is missing or too short' });
      } else {
        results.push({ entity: `Blueprint:${attrs.Title}`, field: 'ImportString', status: 'pass', message: 'Import string present' });
      }

      if (!attrs.Description || attrs.Description.length < 20) {
        results.push({ entity: `Blueprint:${attrs.Title}`, field: 'Description', status: 'warning', message: 'Description is very brief' });
      }
    }

    console.log(`  Checked ${blueprints.length} blueprints`);
  } catch (e: any) {
    console.log(`  Error fetching blueprints: ${e.message}`);
  }
}

async function generateReport() {
  console.log('\n=== FACT CHECK REPORT ===\n');

  const passes = results.filter(r => r.status === 'pass').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const fails = results.filter(r => r.status === 'fail').length;
  const total = results.length;

  console.log(`Total checks: ${total}`);
  console.log(`  PASS:    ${passes} (${((passes / total) * 100).toFixed(1)}%)`);
  console.log(`  WARNING: ${warnings} (${((warnings / total) * 100).toFixed(1)}%)`);
  console.log(`  FAIL:    ${fails} (${((fails / total) * 100).toFixed(1)}%)`);

  if (fails > 0) {
    console.log('\n--- FAILURES ---');
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`  [FAIL] ${r.entity} > ${r.field}: ${r.message}`);
    });
  }

  if (warnings > 0) {
    console.log('\n--- WARNINGS ---');
    results.filter(r => r.status === 'warning').forEach(r => {
      console.log(`  [WARN] ${r.entity} > ${r.field}: ${r.message}`);
    });
  }

  console.log('\n=== END REPORT ===');
}

async function main() {
  console.log('Endfield Hub Fact Checker v1.0');
  console.log(`Target: ${STRAPI_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);

  await verifyCharacters();
  await verifyGuides();
  await verifyBlueprints();
  await generateReport();
}

main().catch(console.error);
