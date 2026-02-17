import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Users, Sword, Shield, Star, FlaskConical, Wrench, Factory,
  LayoutGrid, Map, Target, Trophy, Dice6, BookOpen, Sparkles
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Zero Sanity - Arknights: Endfield Toolkit',
  description: 'Free Arknights: Endfield tools, database, and guides. Factory blueprints, character builds, tier lists, headhunt tracker, and more.',
  alternates: { canonical: '/' },
};

const tools = [
  { name: 'Characters', desc: 'Browse all 23 characters with stats, skills, and builds', path: '/characters', icon: 'Users', color: '#FFE500' },
  { name: 'Weapons', desc: 'Complete weapon database with stats and passives', path: '/weapons', icon: 'Sword', color: '#FF6B35' },
  { name: 'Equipment Sets', desc: 'All equipment sets with set bonuses and recommendations', path: '/equipment', icon: 'Shield', color: '#00BFFF' },
  { name: 'Ascension Planner', desc: 'Plan character ascension materials and track progress', path: '/ascension-planner', icon: 'Star', color: '#FFD700' },
  { name: 'Essence Solver', desc: 'Optimize weapon essence usage with minimum waste', path: '/essence-solver', icon: 'FlaskConical', color: '#9B59B6' },
  { name: 'Gear Artificing', desc: 'Calculate optimal equipment substats and probabilities', path: '/gear-artificing', icon: 'Wrench', color: '#27AE60' },
  { name: 'Factory Planner', desc: 'Design production chains for your AIC factory', path: '/factory-planner', icon: 'Factory', color: '#FF6B35' },
  { name: 'Blueprints', desc: 'Browse and share community factory blueprints', path: '/blueprints', icon: 'LayoutGrid', color: '#00BFFF' },
  { name: 'Tier List Builder', desc: 'Create and share character tier rankings', path: '/tier-list', icon: 'LayoutGrid', color: '#FFE500' },
  { name: 'Character Card', desc: 'Create beautiful character showcase cards', path: '/character-card', icon: 'Sparkles', color: '#9B59B6', isNew: true },
  { name: 'Interactive Map', desc: 'Explore Valley IV and Wuling with markers', path: '/map', icon: 'Map', color: '#27AE60' },
  { name: 'Headhunt Tracker', desc: 'Track your gacha pulls and pity count', path: '/headhunt-tracker', icon: 'Target', color: '#FF6B35', isNew: true },
  { name: 'Achievements', desc: 'Track your achievement completion progress', path: '/achievements', icon: 'Trophy', color: '#FFD700' },
  { name: 'Summon Simulator', desc: 'Simulate gacha pulls with real rates', path: '/summon-simulator', icon: 'Dice6', color: '#00BFFF' },
  { name: 'Guides', desc: 'In-depth verified guides for all game content', path: '/guides', icon: 'BookOpen', color: '#27AE60' },
];

const iconMap: Record<string, React.FC<{ size?: number }>> = {
  Users, Sword, Shield, Star, FlaskConical, Wrench, Factory, LayoutGrid, Map, Target, Trophy, Dice6, BookOpen, Sparkles,
};

const faqItems = [
  { q: 'What is Zero Sanity?', a: 'Zero Sanity is a free community toolkit for Arknights: Endfield, offering character databases, factory blueprint sharing, tier list builders, gacha trackers, and 15+ other tools.' },
  { q: 'How do I use Arknights: Endfield blueprints?', a: 'Browse our community blueprint database, find a factory layout you like, copy the EFO import code, and paste it in-game in the AIC factory build menu.' },
  { q: 'Is Zero Sanity free?', a: 'Yes, all tools on Zero Sanity are completely free. You can optionally create an account to sync your data across devices.' },
  { q: 'What characters are in Arknights: Endfield?', a: 'Arknights: Endfield features 23 playable characters across 5 elements (Physical, Heat, Cryo, Electric, Nature) and 6 roles (Guard, Defender, Supporter, Caster, Vanguard, Striker).' },
];

export default function Home() {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Zero Sanity',
    url: 'https://zerosanity.app',
    description: 'Comprehensive Arknights: Endfield community toolkit with 15+ free tools.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://zerosanity.app/characters?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div>
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">ZERO SANITY</h1>
          <p className="text-gray-400 text-lg">Free Arknights: Endfield tools, database, and guides</p>
          <div className="mt-4 flex gap-3">
            <span className="text-xs bg-[#1a1a1a] text-[#FFE500] px-3 py-1 rounded-full border border-[#333]">v2.0.0</span>
            <span className="text-xs bg-[#1a1a1a] text-gray-400 px-3 py-1 rounded-full border border-[#333]">23 Characters</span>
            <span className="text-xs bg-[#1a1a1a] text-gray-400 px-3 py-1 rounded-full border border-[#333]">15+ Tools</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const Icon = iconMap[tool.icon];
            return (
              <Link
                key={tool.name}
                href={tool.path}
                className="group relative bg-[#111] border border-[#222] rounded-xl p-5 hover:border-[#444] transition-all hover:bg-[#151515] no-underline"
              >
                {tool.isNew && (
                  <span className="absolute top-3 right-3 text-[10px] bg-[#FFE500] text-black px-2 py-0.5 rounded font-bold">NEW</span>
                )}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-[#1a1a1a] border border-[#333]" style={{ color: tool.color }}>
                    {Icon && <Icon size={24} />}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm group-hover:text-[#FFE500] transition-colors">{tool.name}</h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">{tool.desc}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* SEO Answer Nuggets - FAQ section */}
        <section className="mt-12 space-y-4">
          <h2 className="text-lg font-bold text-white mb-3">Frequently Asked Questions</h2>
          {faqItems.map((item, i) => (
            <details key={i} className="bg-[#111] border border-[#222] rounded-xl p-5 group">
              <summary className="text-white font-semibold text-sm cursor-pointer list-none flex items-center justify-between">
                {item.q}
                <ChevronIcon />
              </summary>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </section>

        <div className="mt-12 p-6 bg-[#111] border border-[#222] rounded-xl">
          <h2 className="text-lg font-bold text-white mb-3">About Zero Sanity</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Zero Sanity is a comprehensive community toolkit for Arknights: Endfield. We provide accurate, verified data
            and powerful planning tools to help you optimize your gameplay. All content is fact-checked and regularly updated.
            Our tools are built to be faster, more accurate, and more feature-rich than alternatives.
          </p>
          <p className="text-gray-500 text-xs mt-4">Game assets &copy; GRYPHLINE. This is a fan-made tool and is not affiliated with GRYPHLINE.</p>
        </div>
      </div>
    </>
  );
}

function ChevronIcon() {
  return (
    <svg className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
