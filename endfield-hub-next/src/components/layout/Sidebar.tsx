'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Home, Users, Sword, Shield, BookOpen, Factory, Map,
  Trophy, Target, Dice6, LayoutGrid, Star,
  FlaskConical, Wrench, Sparkles, ChevronDown, ChevronRight,
  Menu, X, LogIn, User, Hammer, Puzzle, Bookmark, Plus
} from 'lucide-react';
import ZeroSanityLogo from '@/components/ui/ZeroSanityLogo';
import { useState, useEffect, Suspense } from 'react';
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
  // ── Top-level ──
  { label: 'Home', path: '/', icon: <Home size={18} /> },

  // ── CHARACTERS: Everything operator/entity-related, mirroring EndfieldTools ──
  // This groups all character data, equipment, and planning tools that revolve
  // around building a single operator — the core gameplay loop.
  {
    label: 'Characters', path: '/characters', icon: <Users size={18} />,
    children: [
      { label: 'Weapons', path: '/weapons', icon: <Sword size={16} /> },
      { label: 'Equipment Sets', path: '/equipment', icon: <Shield size={16} /> },
      { label: 'Ascension Planner', path: '/ascension-planner', icon: <Star size={16} /> },
      { label: 'Essence Solver', path: '/essence-solver', icon: <FlaskConical size={16} /> },
      { label: 'Gear Artificing', path: '/gear-artificing', icon: <Wrench size={16} /> },
      { label: 'Operator Card', path: '/character-card', icon: <Sparkles size={16} /> },
    ],
  },

  // ── BUILDS: Community builds, tier lists, team planning ──
  // Grouped because they all involve sharing/comparing operator configurations.
  {
    label: 'Builds', path: '/builds', icon: <Hammer size={18} />,
    children: [
      { label: 'Browse Builds', path: '/builds', icon: <Hammer size={16} /> },
      { label: 'My Builds', path: '/builds?view=my-builds', icon: <Bookmark size={16} /> },
      { label: 'Create Build', path: '/builds?view=create', icon: <Plus size={16} /> },
      { label: 'Team Builder', path: '/team-builder', icon: <Puzzle size={16} /> },
      { label: 'Tier List', path: '/tier-list', icon: <LayoutGrid size={16} /> },
    ],
  },

  // ── FACTORY PLANNER: Production & crafting — standalone major tool ──
  {
    label: 'Factory Planner', path: '/factory-planner', icon: <Factory size={18} />,
    children: [
      { label: 'Browse Blueprints', path: '/blueprints', icon: <LayoutGrid size={16} /> },
      { label: 'My Blueprints', path: '/blueprints?view=my', icon: <Bookmark size={16} /> },
      { label: 'Create Factory', path: '/factory-planner/planner', icon: <Factory size={16} /> },
      { label: 'Recipes', path: '/recipes', icon: <BookOpen size={16} /> },
    ],
  },

  // ── INTERACTIVE MAP: Exploration maps ──
  {
    label: 'Interactive Map', path: '/map', icon: <Map size={18} />,
    children: [
      { label: 'Valley IV', path: '/map/valley-iv', icon: <Map size={16} /> },
      { label: 'Wuling', path: '/map/wuling', icon: <Map size={16} /> },
    ],
  },

  // ── Standalone tools (flat, no section headers — game-contextual placement) ──
  { label: 'Headhunt Tracker', path: '/headhunt-tracker', icon: <Target size={18} />, section: 'TRACKER' },
  { label: 'Achievements', path: '/achievements', icon: <Trophy size={18} />, section: 'TRACKER' },
  { label: 'Guides', path: '/guides', icon: <BookOpen size={18} />, section: 'TRACKER' },
  { label: 'Summon Simulator', path: '/summon-simulator', icon: <Dice6 size={18} />, section: 'TRACKER' },
];

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthStore();

  // Build full URL path for matching nav items with query params
  const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

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

  // Match nav paths — supports both plain paths and paths with query params
  const isActive = (path: string) => {
    if (path.includes('?')) return currentUrl === path;
    return pathname === path && !searchParams.toString();
  };

  // Check if any child path matches the current route (for parent highlighting)
  const isParentActive = (item: NavItem) => {
    const itemPath = item.path.split('?')[0];
    if (pathname === itemPath || pathname.startsWith(itemPath + '/')) return true;
    if (item.children) {
      return item.children.some(c => {
        const cPath = c.path.split('?')[0];
        return pathname === cPath || pathname.startsWith(cPath + '/');
      });
    }
    return false;
  };

  // Group items by section — items without a section go into an implicit '' group
  const sections: { label: string; items: NavItem[] }[] = [];
  let currentSection = '';
  navigation.forEach(item => {
    const sec = item.section || '';
    if (sec !== currentSection || sections.length === 0) {
      currentSection = sec;
      sections.push({ label: currentSection, items: [] });
    }
    sections[sections.length - 1].items.push(item);
  });

  const renderNav = () => (
    <nav className="flex flex-col gap-0.5 px-2">
      {sections.map((section, si) => (
        <div key={section.label}>
          {si > 0 && section.label && (
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
                      isParentActive(item)
                        ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/8'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]'
                    }`}
                  >
                    <span className={`flex-shrink-0 ${isParentActive(item) ? 'text-[var(--color-accent)]' : ''}`}>{item.icon}</span>
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

export default function Sidebar() {
  return (
    <Suspense>
      <SidebarContent />
    </Suspense>
  );
}
