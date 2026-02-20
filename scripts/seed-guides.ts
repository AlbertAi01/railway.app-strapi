/**
 * Seed guides and tier lists into Strapi.
 * Run with: STRAPI_URL=... STRAPI_TOKEN=... npx tsx scripts/seed-guides.ts
 */

const STRAPI_URL = process.env.STRAPI_URL || 'https://magical-canvas-ba9361cc3f.strapiapp.com';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';

if (!STRAPI_TOKEN) {
  console.error('ERROR: STRAPI_TOKEN required');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${STRAPI_TOKEN}`,
};

async function apiGet(path: string) {
  const res = await fetch(`${STRAPI_URL}/api${path}`, { headers });
  if (!res.ok) return null;
  return res.json();
}

async function apiPost(path: string, data: Record<string, unknown>) {
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

// Map frontend category to Strapi enum values
function mapCategory(cat: string): string {
  const map: Record<string, string> = {
    'General': 'Beginner',
    'Combat': 'Combat',
    'Gear': 'Equipment',
    'Factory': 'Factory',
    'Gacha': 'Tips & Tricks',
    'Teams': 'Character Build',
    'Exploration': 'Exploration',
  };
  return map[cat] || 'Beginner';
}

const GUIDES = [
  { id: 1, title: 'Getting Started', category: 'General', difficulty: 'Beginner', updated: '2026-02-15',
    summary: 'Everything new operators need to know about Arknights: Endfield. Covers combat basics, team building, and early progression.',
    tags: ['beginner', 'combat', 'progression', 'team'],
    sections: [
      { heading: 'Combat Fundamentals', content: 'Endfield features real-time action RPG combat. Your team of 4 operators fights together.\n\n**Core Mechanics:**\n- **Dodge**: Time dodges for i-frames\n- **Battle Skills**: Active abilities on cooldowns\n- **Combo Skills**: Chain attacks between team members\n- **Ultimates**: Charged by dealing/taking damage\n- **Character Swap**: Instantly switch active operator' },
      { heading: 'Character Attributes', content: 'Four base attributes:\n- **Strength**: Physical damage, HP\n- **Agility**: Attack speed, crit chance\n- **Intellect**: Skill damage, Arts potency\n- **Will**: Ultimate charge, resistance, support' },
      { heading: 'Elements and Status Effects', content: 'Five elements:\n- Physical: Raw damage\n- Heat: Combustion DoT\n- Cryo: Solidification slow\n- Electric: Electrification chain\n- Nature: Vulnerability debuff' },
      { heading: 'Progression Path', content: 'Week 1: Complete story, unlock systems, build main team\nWeek 2-3: Farm gear, begin essence optimization\nMonth 1+: Challenge high-difficulty content, build alternate teams' },
    ],
  },
  { id: 2, title: 'Combat Mastery', category: 'Combat', difficulty: 'Advanced', updated: '2026-02-12',
    summary: 'Master dodge timing, combo chains, stagger mechanics, and SP management for end-game combat.',
    tags: ['combat', 'dodge', 'combo', 'stagger', 'advanced'],
    sections: [
      { heading: 'Perfect Dodge Timing', content: 'Perfect dodging grants full i-frames and triggers slow-motion for counter attacks. Practice against Bonekrusher boss.' },
      { heading: 'Combo Skill Chains', content: 'Swap immediately after using a skill for combo bonus (+15-30% damage). Optimal: Skill > Swap > Skill > Swap > Ultimate.' },
      { heading: 'Stagger and Break', content: 'Heavy attacks build stagger 2x faster. Break State = +50% damage taken for 5-10 seconds.' },
    ],
  },
  { id: 3, title: 'Essence Etching Guide', category: 'Gear', difficulty: 'Intermediate', updated: '2026-02-18',
    summary: 'Complete guide to essence etching — stats, farming zones, pre-engrave optimization, and perfect 3/3 essences.',
    tags: ['essence', 'gear', 'farming', 'optimization'],
    sections: [
      { heading: 'How Essence Etching Works', content: 'Each weapon has 3 essence stat slots. A perfect 3/3 essence matches all three stats for your weapon.' },
      { heading: 'Farming Zones', content: 'Essences drop from Severe Energy Alluvium encounters in Valley IV and Wuling zones.' },
      { heading: 'Pre-Engrave Optimization', content: 'Pre-engrave guarantees one stat on every essence you farm. Use the Essence Solver tool.' },
    ],
  },
  { id: 4, title: 'Factory Production Guide', category: 'Factory', difficulty: 'Intermediate', updated: '2026-02-10',
    summary: 'Optimize your AIC Factory with efficient blueprints, production chains, and resource management.',
    tags: ['factory', 'blueprint', 'production', 'automation'],
    sections: [
      { heading: 'Factory Basics', content: 'The AIC Factory is your base for passive resource production. Unlocked in Chapter 3.' },
      { heading: 'Blueprint System', content: 'Share and import layouts from other players. Use the Blueprint Browser for optimized community layouts.' },
      { heading: 'Production Optimization', content: 'Minimize belt length, balance input/output ratios, use splitters for parallel processing.' },
    ],
  },
  { id: 5, title: 'Headhunt Strategy', category: 'Gacha', difficulty: 'Beginner', updated: '2026-02-08',
    summary: 'Smart pulling strategies, pity system mechanics, and banner analysis.',
    tags: ['gacha', 'headhunt', 'banner', 'pity', 'strategy'],
    sections: [
      { heading: 'Headhunt Rates', content: '6-star: 0.8% base. Soft pity at 50, hard pity at 100. Featured: 50/50 then guaranteed.' },
      { heading: 'Banner Priority', content: 'Must-Pull: Endministrator, Laevatain, Yvonne, Last Rite. Save 180 pulls for guaranteed.' },
    ],
  },
  { id: 6, title: 'Team Building Guide', category: 'Teams', difficulty: 'Intermediate', updated: '2026-02-14',
    summary: 'Build optimal teams. Covers meta compositions, elemental synergies, and role distribution.',
    tags: ['team', 'composition', 'synergy', 'meta'],
    sections: [
      { heading: 'Team Composition', content: 'Standard: 1 DPS + 1 Tank + 1 Support + 1 Flex.' },
      { heading: 'Meta Compositions', content: 'Endministrator Physical Core, Laevatain Heat Comp, Cryo Burst Team.' },
    ],
  },
  { id: 7, title: 'Map Exploration Guide', category: 'Exploration', difficulty: 'Beginner', updated: '2026-02-11',
    summary: 'Complete exploration guide for Valley IV and Wuling. Find all treasure chests and collectibles.',
    tags: ['map', 'exploration', 'treasure', 'collectibles'],
    sections: [
      { heading: 'Valley IV', content: '6 zones with 2,200+ points of interest. Use the Interactive Map tool.' },
      { heading: 'Wuling Region', content: '1,600+ POIs across 2 zones with unique Hongshan collectibles.' },
    ],
  },
  { id: 8, title: 'Gear Artificing Guide', category: 'Gear', difficulty: 'Advanced', updated: '2026-02-16',
    summary: 'End-game gear optimization. Understand gear sets, stat priorities, and the artificing system.',
    tags: ['gear', 'artificing', 'stats', 'endgame'],
    sections: [
      { heading: 'Gear System', content: '3 slots (Armor, Gloves, Kit). T1-T4 rarity. 3-piece set bonuses.' },
      { heading: 'Stat Priority', content: 'DPS: Crit > ATK%. Caster: Arts Intensity. Defender: HP% > DEF%. Support: Treatment Efficiency.' },
    ],
  },
  { id: 9, title: 'Cryo Freeze Team Guide', category: 'Teams', difficulty: 'Advanced', updated: '2026-02-19',
    summary: 'Full breakdown: Last Rite, Yvonne, Xaihi, Snowshine. Chain freeze for permanent enemy lockdown.',
    tags: ['team', 'cryo', 'freeze', 'meta'],
    sections: [
      { heading: 'Team Overview', content: 'Chain Solidification stacks to permanently lock down enemies for Last Rite combos.' },
      { heading: 'Combat Rotation', content: 'Snowshine aggro > Yvonne burst > Last Rite combo chains. Ultimate priority: Last Rite > Yvonne.' },
    ],
  },
  { id: 10, title: 'Physical Quickswap Team Guide', category: 'Teams', difficulty: 'Advanced', updated: '2026-02-19',
    summary: 'Endministrator, Lifeng, Chen Qianyu, Gilberta. Rapid character swapping for continuous combos.',
    tags: ['team', 'physical', 'quickswap', 'meta'],
    sections: [
      { heading: 'Team Overview', content: 'Maximize damage by rapidly cycling operators. No elemental weakness.' },
      { heading: 'Core Loop', content: 'Endministrator attacks > Lifeng burst > Chen Qianyu counter > Gilberta heal. Never stay 3+ seconds.' },
    ],
  },
  { id: 11, title: 'Electric Overload Team Guide', category: 'Teams', difficulty: 'Intermediate', updated: '2026-02-19',
    summary: 'All-electric team for screen-wide AoE damage through Electrification chains.',
    tags: ['team', 'electric', 'aoe'],
    sections: [
      { heading: 'Team Overview', content: 'Arclight, Perlica, Avywenna, Antal. Stack Electrification then detonate with Perlica.' },
      { heading: 'Rotation', content: 'Antal buff > Arclight stack > Avywenna chain > Perlica detonate.' },
    ],
  },
  { id: 12, title: 'Heat Combustion Burst Guide', category: 'Teams', difficulty: 'Advanced', updated: '2026-02-19',
    summary: 'Triple Heat DPS: Laevatain, Wulfgard, Akekuri, Gilberta. Highest burst damage in the game.',
    tags: ['team', 'heat', 'combustion', 'speedrun'],
    sections: [
      { heading: 'Team Overview', content: 'Stack Combustion fast, nuke with Laevatain ultimate. Highest single-rotation burst.' },
      { heading: 'Burst Setup', content: 'Wulfgard skill > Akekuri rapid strikes > Wulfgard second skill > Laevatain ultimate (3x damage at max stacks).' },
    ],
  },
  { id: 13, title: 'Nature Corruption Core Guide', category: 'Teams', difficulty: 'Intermediate', updated: '2026-02-19',
    summary: 'Double healer Nature team: Ardelia, Gilberta, Fluorite, Ember. Safest composition for difficult content.',
    tags: ['team', 'nature', 'healing', 'safe'],
    sections: [
      { heading: 'Team Overview', content: 'Nearly unkillable with double healers. Outlast any encounter through attrition.' },
      { heading: 'Rotation', content: 'Ember tank > Fluorite ranged DPS > Ardelia burst heal > Gilberta buff + heal.' },
    ],
  },
  { id: 14, title: 'Balanced Rainbow Team Guide', category: 'Teams', difficulty: 'Intermediate', updated: '2026-02-19',
    summary: 'Four-element coverage: Endministrator, Laevatain, Last Rite, Arclight. Maximum elemental flexibility.',
    tags: ['team', 'rainbow', 'versatile'],
    sections: [
      { heading: 'Team Overview', content: 'Physical + Heat + Cryo + Electric. Every enemy has a weakness you can exploit.' },
      { heading: 'Strategy', content: 'Identify weakness, lead with super-effective operator. Perfect dodge is mandatory — no healer.' },
    ],
  },
  { id: 15, title: 'Vanguard Rush Team Guide', category: 'Teams', difficulty: 'Advanced', updated: '2026-02-19',
    summary: 'All-Vanguard team: Pogranichnik, Arclight, Akekuri, Alesh. Maximum aggression with rapid rotations.',
    tags: ['team', 'vanguard', 'rush', 'speedrun'],
    sections: [
      { heading: 'Team Overview', content: 'Four Vanguards with fast cooldowns and relentless pressure. Fastest rotation in the game.' },
      { heading: 'Blitz Rotation', content: '2-second swaps: Pogranichnik > Arclight > Akekuri > Alesh > repeat. 4th operator gets +45% combo bonus.' },
    ],
  },
];

async function main() {
  console.log(`Seeding guides into ${STRAPI_URL}...\n`);

  // Verify connection
  const check = await fetch(`${STRAPI_URL}/api/guides?pagination[pageSize]=1`, { headers });
  if (!check.ok) {
    console.error('Cannot connect to Strapi');
    process.exit(1);
  }
  console.log('Connected.\n');

  let created = 0;
  let skipped = 0;

  for (const guide of GUIDES) {
    const title = guide.title;
    try {
      const existing = await apiGet(`/guides?filters[Title][$eq]=${encodeURIComponent(title)}&pagination[pageSize]=1`);
      if (existing?.data?.length > 0) {
        skipped++;
        continue;
      }

      // Combine sections into rich text content
      const content = guide.sections
        .map(s => `## ${s.heading}\n\n${s.content}`)
        .join('\n\n---\n\n');

      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await apiPost('/guides', {
        Title: title,
        Slug: slug,
        Category: mapCategory(guide.category),
        Difficulty: guide.difficulty,
        Content: content,
        Summary: guide.summary,
        Author: 'Endfield Hub Staff',
        Tags: guide.tags,
        IsVerified: true,
        LastVerifiedAt: new Date().toISOString(),
        Upvotes: 0,
        ViewCount: 0,
      });
      created++;
      console.log(`  Created: ${title}`);
    } catch (err: any) {
      console.log(`  SKIP ${title}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\nGuides: ${created} created, ${skipped} skipped`);

  // Also update existing seeded blueprints and tier lists to Status: approved
  console.log('\n=== Updating existing seeded data to Status: approved ===');

  // Update blueprints
  const bpRes = await apiGet('/blueprints?pagination[pageSize]=100');
  if (bpRes?.data) {
    let bpUpdated = 0;
    for (const bp of bpRes.data) {
      if (bp.Status !== 'approved') {
        const updateRes = await fetch(`${STRAPI_URL}/api/blueprints/${bp.documentId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ data: { Status: 'approved' } }),
        });
        if (updateRes.ok) bpUpdated++;
      }
    }
    console.log(`  Blueprints: ${bpUpdated} updated to approved`);
  }

  // Note: Tier lists don't have Status field on live schema yet — skip status updates
  console.log('  Tier Lists: skipped (no Status field on live schema)');

  console.log('\n=== SEED COMPLETE ===');
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
