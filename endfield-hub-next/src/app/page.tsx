import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Users, Sword, Shield, Star, FlaskConical, Wrench, Factory,
  LayoutGrid, Map, Target, Trophy, Dice6, BookOpen, Sparkles, Crosshair, Puzzle, Hammer
} from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import EventCalendar from '@/components/home/EventCalendar';

export const metadata: Metadata = {
  title: 'Zero Sanity - Arknights: Endfield Toolkit',
  description: 'Free Arknights: Endfield tools, database, and guides. Factory blueprints, community builds, team builder, tier lists, headhunt tracker, and more.',
  alternates: { canonical: '/' },
};

const tools: { name: string; desc: string; path: string; icon: string; color: string; isNew?: boolean }[] = [
  { name: 'Operator Database', desc: 'Browse all 23 operators with stats, skills, and combat data', path: '/characters', icon: 'Users', color: '#E8A624' },
  { name: 'Weapons Arsenal', desc: 'Complete weapon database with stats and passive effects', path: '/weapons', icon: 'Sword', color: '#FF6B35' },
  { name: 'Equipment Systems', desc: 'Equipment sets with bonuses and tactical recommendations', path: '/equipment', icon: 'Shield', color: '#00BFFF' },
  { name: 'Operator Development', desc: 'Plan ascension materials and track progress', path: '/ascension-planner', icon: 'Star', color: '#FFD700' },
  { name: 'Essence Optimization', desc: 'Optimize weapon essence usage with zero waste', path: '/essence-solver', icon: 'FlaskConical', color: '#B388FF' },
  { name: 'Gear Analysis', desc: 'Calculate optimal equipment substats and probabilities', path: '/gear-artificing', icon: 'Wrench', color: '#69F0AE' },
  { name: 'AIC Factory Planner', desc: 'Design production chains for manufacturing', path: '/factory-planner', icon: 'Factory', color: '#FF6B35' },
  { name: 'Blueprint Registry', desc: 'Browse and share community factory blueprints', path: '/blueprints', icon: 'LayoutGrid', color: '#00BFFF' },
  { name: 'Community Builds', desc: 'Browse, create, and share operator build guides', path: '/builds', icon: 'Hammer', color: '#FF8A65' },
  { name: 'Team Builder', desc: 'Plan and optimize squad compositions', path: '/team-builder', icon: 'Puzzle', color: '#CE93D8' },
  { name: 'Combat Assessment', desc: 'Create and share operator tier rankings', path: '/tier-list', icon: 'LayoutGrid', color: '#E8A624' },
  { name: 'Operator Card (BETA)', desc: 'Generate tactical operator showcase cards', path: '/character-card', icon: 'Sparkles', color: '#F5A623' },
  { name: 'Tactical Map', desc: 'Explore Valley IV and Wuling with markers', path: '/map', icon: 'Map', color: '#69F0AE' },
  { name: 'Headhunt Operations', desc: 'Track recruitment attempts and pity counter', path: '/headhunt-tracker', icon: 'Target', color: '#FF6B35' },
  { name: 'Achievement Registry', desc: 'Track mission completion and rewards', path: '/achievements', icon: 'Trophy', color: '#FFD700' },
  { name: 'Recruitment Simulator', desc: 'Simulate headhunt operations with verified rates', path: '/summon-simulator', icon: 'Dice6', color: '#00BFFF' },
  { name: 'Intel Briefings', desc: 'In-depth verified guides for all operations', path: '/guides', icon: 'BookOpen', color: '#69F0AE' },
];

const iconMap: Record<string, React.FC<{ size?: number }>> = {
  Users, Sword, Shield, Star, FlaskConical, Wrench, Factory, LayoutGrid, Map, Target, Trophy, Dice6, BookOpen, Sparkles, Puzzle, Hammer,
};

const faqItems = [
  { q: 'What is Zero Sanity?', a: 'Zero Sanity is a free community toolkit for Arknights: Endfield, offering character databases, factory blueprint sharing, community builds, tier list builders, gacha trackers, and 17+ other tools.' },
  { q: 'How do I use Arknights: Endfield blueprints?', a: 'Browse our community blueprint database, find a factory layout you like, copy the EFO import code, and paste it in-game in the AIC factory build menu.' },
  { q: 'Is Zero Sanity free?', a: 'Yes, all tools on Zero Sanity are completely free. You can optionally create an account to sync your data across devices.' },
  { q: 'What characters are in Arknights: Endfield?', a: 'Arknights: Endfield features 23 playable characters across 5 elements (Physical, Heat, Cryo, Electric, Nature) and 6 roles (Guard, Defender, Supporter, Caster, Vanguard, Assault).' },
];

export default function Home() {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Zero Sanity',
    url: 'https://www.zerosanity.app',
    description: 'Comprehensive Arknights: Endfield community toolkit with 17+ free tools.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.zerosanity.app/characters?q={search_term_string}',
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
        <RIOSHeader
          title="Rhodes Island OS"
          subtitle="Comprehensive Arknights: Endfield tactical toolkit"
          category="MAIN_TERMINAL"
          classification="PUBLIC"
          code="RIOS-HOME"
          icon={<Crosshair size={32} />}
        />

        <div className="flex flex-wrap gap-3 mb-10">
          <span className="terminal-text text-[var(--color-originium)] px-4 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] clip-corner-tl">v0.1</span>
          <span className="terminal-text text-[var(--color-text-secondary)] px-4 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)]">23 OPERATORS</span>
          <span className="terminal-text text-[var(--color-text-secondary)] px-4 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)]">17 MODULES</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => {
            const Icon = iconMap[tool.icon];
            return (
              <Link
                key={tool.name}
                href={tool.path}
                className="group relative rios-card clip-corner-tl p-6 border-l-3 hover:border-l-[var(--color-accent)]"
                style={{ borderLeftColor: tool.color, borderLeftWidth: '3px' }}
              >
                {tool.isNew && (
                  <span className="absolute top-3 right-3 text-[11px] bg-[#FFE500] text-black px-2 py-0.5 font-bold clip-corner-tl">NEW</span>
                )}
                <div className="flex items-start gap-4">
                  <div className="p-3 clip-corner-tl bg-[var(--color-surface-2)] border border-[var(--color-border)]" style={{ color: tool.color }}>
                    {Icon && <Icon size={28} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[var(--color-text-primary)] font-semibold text-base group-hover:text-[var(--color-accent)] transition-colors font-tactical uppercase tracking-wide">{tool.name}</h3>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-1.5 leading-relaxed">{tool.desc}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Event Calendar & Redeem Codes */}
        <div className="mt-10">
          <EventCalendar />
        </div>

        {/* FAQ */}
        <section className="mt-14 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="diamond diamond-sm" />
            <h2 className="text-xl font-bold text-white font-tactical uppercase tracking-wide">Intelligence Briefing</h2>
          </div>
          {faqItems.map((item, i) => (
            <details key={i} className="rios-card clip-corner-tl p-6 group border-l-3 border-l-[var(--color-border)]">
              <summary className="text-white font-semibold text-base cursor-pointer list-none flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <span className="diamond diamond-sm diamond-accent" />
                  {item.q}
                </span>
                <ChevronIcon />
              </summary>
              <p className="text-[var(--color-text-secondary)] text-[15px] mt-4 leading-relaxed ml-8">{item.a}</p>
            </details>
          ))}
        </section>

        <div className="mt-14 rios-card rios-card-accent clip-corner-tl p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="diamond diamond-sm" />
            <h2 className="text-xl font-bold text-white font-tactical uppercase tracking-wide">System Information</h2>
          </div>
          <p className="text-[var(--color-text-secondary)] text-[15px] leading-relaxed">
            Zero Sanity is a comprehensive community toolkit for Arknights: Endfield. We provide accurate, verified data
            and powerful planning tools to help you optimize your operations. All content is fact-checked and regularly updated.
          </p>
          <p className="terminal-text text-[var(--color-text-muted)] mt-5">GAME ASSETS &copy; GRYPHLINE // NOT AFFILIATED WITH GRYPHLINE</p>
        </div>
      </div>
    </>
  );
}

function ChevronIcon() {
  return (
    <svg className="w-5 h-5 text-[var(--color-text-muted)] group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
