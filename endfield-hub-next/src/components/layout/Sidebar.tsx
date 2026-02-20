'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Users, Sword, Shield, BookOpen, Factory, Map,
  Trophy, Target, Dice6, LayoutGrid, Star,
  FlaskConical, Wrench, Sparkles, ChevronDown, ChevronRight,
  Menu, X, LogIn, User, Hammer, Puzzle
} from 'lucide-react';
import ZeroSanityLogo from '@/components/ui/ZeroSanityLogo';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  children?: { label: string; path: string; icon: React.ReactNode }[];
  isNew?: boolean;
  section?: string;
}

const navigation: NavItem[] = [
  { label: 'Home', path: '/', icon: <Home size={18} />, section: 'MAIN' },
  { label: 'Operator Card', path: '/character-card', icon: <Sparkles size={18} />, isNew: true, section: 'MAIN' },
  { label: 'Tier List', path: '/tier-list', icon: <LayoutGrid size={18} />, section: 'MAIN' },
  {
    label: 'Operators', path: '/characters', icon: <Users size={18} />, section: 'DATABASE',
    children: [
      { label: 'All Operators', path: '/characters', icon: <Users size={16} /> },
      { label: 'Weapons', path: '/weapons', icon: <Sword size={16} /> },
      { label: 'Equipment Sets', path: '/equipment', icon: <Shield size={16} /> },
    ],
  },
  {
    label: 'Build Tools', path: '/ascension-planner', icon: <Star size={18} />, section: 'DATABASE',
    children: [
      { label: 'Ascension Planner', path: '/ascension-planner', icon: <Star size={16} /> },
      { label: 'Essence Solver', path: '/essence-solver', icon: <FlaskConical size={16} /> },
      { label: 'Gear Artificing', path: '/gear-artificing', icon: <Wrench size={16} /> },
    ],
  },
  {
    label: 'Factory Planner', path: '/factory-planner', icon: <Factory size={18} />, section: 'LOGISTICS',
    children: [
      { label: 'Browse Blueprints', path: '/blueprints', icon: <LayoutGrid size={16} /> },
      { label: 'Create Factory', path: '/factory-planner/planner', icon: <Factory size={16} /> },
      { label: 'Recipes', path: '/recipes', icon: <BookOpen size={16} /> },
    ],
  },
  { label: 'Interactive Map', path: '/map', icon: <Map size={18} />, section: 'LOGISTICS' },
  { label: 'Headhunt Ops', path: '/headhunt-tracker', icon: <Target size={18} />, isNew: true, section: 'TOOLS' },
  { label: 'Recruitment Sim', path: '/summon-simulator', icon: <Dice6 size={18} />, section: 'TOOLS' },
  { label: 'Achievements', path: '/achievements', icon: <Trophy size={18} />, section: 'TOOLS' },
  {
    label: 'Team Builder', path: '/team-builder', icon: <Puzzle size={18} />, isNew: true, section: 'COMMUNITY',
  },
  {
    label: 'Community Builds', path: '/builds', icon: <Hammer size={18} />, isNew: true, section: 'COMMUNITY',
  },
  { label: 'Intel Briefings', path: '/guides', icon: <BookOpen size={18} />, section: 'COMMUNITY' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthStore();

  // Default all expandable sections to open; respect sessionStorage overrides
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {};
    navigation.forEach(item => {
      if (item.children) defaults[item.label] = true;
    });
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('zs-nav-expanded');
        if (stored) return { ...defaults, ...JSON.parse(stored) };
      } catch { /* ignore */ }
    }
    return defaults;
  });

  const toggleExpand = (label: string) => {
    setExpanded(prev => {
      const next = { ...prev, [label]: !prev[label] };
      try { sessionStorage.setItem('zs-nav-expanded', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const isActive = (path: string) => pathname === path;

  // Group items by section
  const sections: { label: string; items: NavItem[] }[] = [];
  let currentSection = '';
  navigation.forEach(item => {
    if (item.section && item.section !== currentSection) {
      currentSection = item.section;
      sections.push({ label: currentSection, items: [] });
    }
    sections[sections.length - 1]?.items.push(item);
  });

  const renderNav = () => (
    <nav className="flex flex-col gap-0.5 px-2">
      {sections.map((section, si) => (
        <div key={section.label}>
          {si > 0 && (
            <div className="flex items-center gap-2 px-3 pt-4 pb-1.5">
              <div className="h-px flex-1 bg-[var(--color-border)]" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--color-text-muted)] uppercase">{section.label}</span>
              <div className="h-px flex-1 bg-[var(--color-border)]" />
            </div>
          )}
          {section.items.map((item) => (
            <div key={item.label}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold transition-all rounded-sm ${
                      pathname.startsWith(item.path)
                        ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/8'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]'
                    }`}
                  >
                    <span className={`flex-shrink-0 ${pathname.startsWith(item.path) ? 'text-[var(--color-accent)]' : ''}`}>{item.icon}</span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.isNew && (
                      <span className="text-[9px] bg-[var(--color-accent)] text-black px-1.5 py-0.5 font-bold leading-none">NEW</span>
                    )}
                    <span className="text-[var(--color-text-muted)]">
                      {expanded[item.label] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  </button>
                  {expanded[item.label] && (
                    <div className="ml-4 flex flex-col gap-0.5 border-l border-[var(--color-border)] pl-2 mt-0.5 mb-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          href={child.path}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2.5 px-2.5 py-1.5 text-[12px] font-medium transition-all rounded-sm ${
                            isActive(child.path)
                              ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/8'
                              : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]'
                          }`}
                        >
                          <span className={`flex-shrink-0 ${isActive(child.path) ? 'text-[var(--color-accent)]' : ''}`}>{child.icon}</span>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold transition-all rounded-sm ${
                    isActive(item.path)
                      ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/8'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]'
                  }`}
                >
                  <span className={`flex-shrink-0 ${isActive(item.path) ? 'text-[var(--color-accent)]' : ''}`}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.isNew && (
                    <span className="text-[9px] bg-[var(--color-accent)] text-black px-1.5 py-0.5 font-bold leading-none">NEW</span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg"
      >
        {mobileOpen ? <X size={20} className="text-[var(--color-accent)]" /> : <Menu size={20} className="text-[var(--color-text-primary)]" />}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/70 z-30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-[var(--color-surface)] border-r border-[var(--color-border)] z-40 flex flex-col overflow-y-auto transition-transform ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo Header */}
        <div className="px-4 py-3.5 border-b border-[var(--color-border)]">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <ZeroSanityLogo size={30} variant="icon" />
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-[var(--color-text-primary)] tracking-wider font-tactical uppercase leading-none">
                ZERO SANITY
              </span>
              <span className="text-[9px] text-[var(--color-text-muted)] tracking-[0.15em] mt-1 font-mono uppercase leading-none">
                ENDFIELD TOOLKIT
              </span>
            </div>
          </Link>
        </div>

        {/* User/Auth section */}
        <div className="px-2 py-2 border-b border-[var(--color-border)]">
          {user ? (
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold transition-all rounded-sm ${
                isActive('/profile')
                  ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/8'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]'
              }`}
            >
              <User size={18} />
              <span className="flex-1 truncate">{user.username}</span>
            </Link>
          ) : (
            <Link
              href={`/login?returnTo=${encodeURIComponent(pathname)}`}
              onClick={() => {
                setMobileOpen(false);
                sessionStorage.setItem('endfield-return-to', pathname);
              }}
              className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-[var(--color-accent)] hover:bg-[var(--color-surface-2)] transition-all rounded-sm"
            >
              <LogIn size={18} />
              <span>Authorize</span>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 py-2 overflow-y-auto scrollbar-thin">
          {renderNav()}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--color-border)]">
          <p className="text-[9px] text-[var(--color-text-muted)] tracking-[0.1em] font-mono uppercase">ZS.v0.1 &middot; zerosanity.app</p>
          <p className="text-[9px] text-[var(--color-text-muted)] tracking-[0.1em] font-mono uppercase mt-0.5">GAME ASSETS &copy; GRYPHLINE</p>
        </div>
      </aside>
    </>
  );
}
