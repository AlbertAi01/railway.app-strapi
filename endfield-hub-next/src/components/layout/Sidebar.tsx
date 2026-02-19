'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Users, Sword, Shield, BookOpen, Factory, Map,
  Trophy, Target, Dice6, LayoutGrid, Star,
  FlaskConical, Wrench, Sparkles, ChevronDown, ChevronRight,
  Menu, X, LogIn, User, Hammer
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  children?: { label: string; path: string; icon: React.ReactNode }[];
  isNew?: boolean;
}

const navigation: NavItem[] = [
  { label: 'Home', path: '/', icon: <Home size={20} /> },
  {
    label: 'Operators', path: '/characters', icon: <Users size={20} />,
    children: [
      { label: 'All Operators', path: '/characters', icon: <Users size={18} /> },
      { label: 'Weapons', path: '/weapons', icon: <Sword size={18} /> },
      { label: 'Equipment Sets', path: '/equipment', icon: <Shield size={18} /> },
      { label: 'Ascension Planner', path: '/ascension-planner', icon: <Star size={18} /> },
      { label: 'Essence Solver', path: '/essence-solver', icon: <FlaskConical size={18} /> },
      { label: 'Gear Artificing', path: '/gear-artificing', icon: <Wrench size={18} /> },
    ],
  },
  { label: 'Tier List', path: '/tier-list', icon: <LayoutGrid size={20} /> },
  {
    label: 'Operator Card', path: '/character-card', icon: <Sparkles size={20} />,
    isNew: true,
  },
  {
    label: 'Factory Planner', path: '/factory-planner', icon: <Factory size={20} />,
    children: [
      { label: 'Browse Blueprints', path: '/blueprints', icon: <LayoutGrid size={18} /> },
      { label: 'Create Factory', path: '/factory-planner/planner', icon: <Factory size={18} /> },
      { label: 'Recipes', path: '/recipes', icon: <BookOpen size={18} /> },
    ],
  },
  { label: 'Interactive Map', path: '/map', icon: <Map size={20} /> },
  {
    label: 'Headhunt Ops', path: '/headhunt-tracker', icon: <Target size={20} />,
    isNew: true,
  },
  { label: 'Achievements', path: '/achievements', icon: <Trophy size={20} /> },
  { label: 'Recruitment Sim', path: '/summon-simulator', icon: <Dice6 size={20} /> },
  {
    label: 'Community Builds', path: '/builds', icon: <Hammer size={20} />,
    isNew: true,
  },
  { label: 'Intel Briefings', path: '/guides', icon: <BookOpen size={20} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthStore();

  const toggleExpand = (label: string) => {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path: string) => pathname === path;

  const renderNav = () => (
    <nav className="flex flex-col gap-1 px-3">
      {navigation.map((item) => (
        <div key={item.label}>
          {item.children ? (
            <>
              <button
                onClick={() => toggleExpand(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 clip-corner-tl text-[14px] font-semibold transition-colors hover:bg-[var(--color-surface-2)] border-l-2 ${
                  pathname.startsWith(item.path)
                    ? 'text-[var(--color-accent)] bg-[var(--color-surface-2)] border-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]'
                }`}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                {item.isNew && (
                  <span className="text-[10px] bg-[#FFE500] text-black px-1.5 py-0.5 font-bold clip-corner-tl">NEW</span>
                )}
                {expanded[item.label] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {expanded[item.label] && (
                <div className="ml-5 flex flex-col gap-0.5 border-l border-[var(--color-border)] pl-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      href={child.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 text-[13px] font-medium transition-colors hover:bg-[var(--color-surface-2)] ${
                        isActive(child.path)
                          ? 'text-[var(--color-accent)] bg-[var(--color-surface-2)]'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      {child.icon}
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
              className={`flex items-center gap-3 px-3 py-2.5 clip-corner-tl text-[14px] font-semibold transition-colors hover:bg-[var(--color-surface-2)] border-l-2 ${
                isActive(item.path)
                  ? 'text-[var(--color-accent)] bg-[var(--color-surface-2)] border-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]'
              }`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.isNew && (
                <span className="text-[10px] bg-[#FFE500] text-black px-1.5 py-0.5 font-bold clip-corner-tl">NEW</span>
              )}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl shadow-[var(--shadow-card)]"
      >
        {mobileOpen ? <X size={22} className="text-[var(--color-accent)]" /> : <Menu size={22} className="text-[var(--color-accent)]" />}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/70 z-30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[var(--color-surface)] border-r-2 border-[var(--color-border)] z-40 flex flex-col overflow-y-auto transition-transform ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* RIOS Logo Header */}
        <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <Link href="/" className="flex items-center gap-3">
            <div className="diamond diamond-md" />
            <div>
              <span className="text-lg font-bold text-white tracking-wider font-tactical uppercase">
                RHODES ISLAND OS
              </span>
              <p className="terminal-text-sm text-[var(--color-text-muted)] mt-0.5">
                ENDFIELD.TOOLKIT.v2.0
              </p>
            </div>
          </Link>
        </div>

        {/* User/Auth section */}
        <div className="px-3 py-3 border-b border-[var(--color-border)]">
          {user ? (
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 clip-corner-tl text-[14px] font-semibold transition-colors hover:bg-[var(--color-surface-2)] border-l-2 ${
                isActive('/profile')
                  ? 'text-[var(--color-accent)] bg-[var(--color-surface-2)] border-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]'
              }`}
            >
              <User size={20} />
              <span className="flex-1 truncate">{user.username}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 clip-corner-tl text-[14px] font-semibold text-[var(--color-accent)] hover:bg-[var(--color-surface-2)] transition-colors border-l-2 border-transparent"
            >
              <LogIn size={20} />
              <span>Authorize</span>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 overflow-y-auto">
          {renderNav()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-border)]">
          <p className="terminal-text-sm text-[var(--color-text-muted)]">RIOS.v2.0.0 &middot; zerosanity.app</p>
          <p className="terminal-text-sm text-[var(--color-text-muted)] mt-1">GAME ASSETS &copy; GRYPHLINE</p>
        </div>
      </aside>
    </>
  );
}
