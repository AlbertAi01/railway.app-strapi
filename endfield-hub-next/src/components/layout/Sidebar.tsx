'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Users, Sword, Shield, BookOpen, Factory, Map,
  Trophy, Target, Dice6, LayoutGrid, Star, Crosshair,
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
  { label: 'Home', path: '/', icon: <Home size={18} /> },
  {
    label: 'Operators', path: '/characters', icon: <Users size={18} />,
    children: [
      { label: 'All Operators', path: '/characters', icon: <Users size={16} /> },
      { label: 'Weapons', path: '/weapons', icon: <Sword size={16} /> },
      { label: 'Equipment Sets', path: '/equipment', icon: <Shield size={16} /> },
      { label: 'Ascension Planner', path: '/ascension-planner', icon: <Star size={16} /> },
      { label: 'Essence Solver', path: '/essence-solver', icon: <FlaskConical size={16} /> },
      { label: 'Gear Artificing', path: '/gear-artificing', icon: <Wrench size={16} /> },
    ],
  },
  { label: 'Tier List', path: '/tier-list', icon: <LayoutGrid size={18} /> },
  {
    label: 'Operator Card', path: '/character-card', icon: <Sparkles size={18} />,
    isNew: true,
  },
  {
    label: 'Logistics', path: '/factory-planner', icon: <Factory size={18} />,
    children: [
      { label: 'Factory Planner', path: '/factory-planner', icon: <Factory size={16} /> },
      { label: 'Blueprints', path: '/blueprints', icon: <LayoutGrid size={16} /> },
      { label: 'Recipes', path: '/recipes', icon: <BookOpen size={16} /> },
    ],
  },
  { label: 'Interactive Map', path: '/map', icon: <Map size={18} /> },
  {
    label: 'Headhunt Ops', path: '/headhunt-tracker', icon: <Target size={18} />,
    isNew: true,
  },
  { label: 'Achievements', path: '/achievements', icon: <Trophy size={18} /> },
  { label: 'Recruitment Sim', path: '/summon-simulator', icon: <Dice6 size={18} /> },
  {
    label: 'Community Builds', path: '/builds', icon: <Hammer size={18} />,
    isNew: true,
  },
  { label: 'Intel Briefings', path: '/guides', icon: <BookOpen size={18} /> },
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
    <nav className="flex flex-col gap-0.5 px-2">
      {navigation.map((item) => (
        <div key={item.label}>
          {item.children ? (
            <>
              <button
                onClick={() => toggleExpand(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2 clip-corner-tl text-sm font-medium transition-colors hover:bg-[var(--color-surface-2)] border-l-2 ${
                  pathname.startsWith(item.path)
                    ? 'text-[var(--color-accent)] bg-[var(--color-surface-2)] border-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] border-transparent'
                }`}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                {item.isNew && (
                  <span className="text-[10px] bg-[#FFE500] text-black px-1.5 py-0.5 font-bold clip-corner-tl">NEW</span>
                )}
                {expanded[item.label] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {expanded[item.label] && (
                <div className="ml-4 flex flex-col gap-0.5 border-l border-[var(--color-border)]">
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      href={child.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-1.5 text-sm transition-colors hover:bg-[var(--color-surface-2)] ${
                        isActive(child.path)
                          ? 'text-[var(--color-accent)] bg-[var(--color-surface-2)]'
                          : 'text-[var(--color-text-tertiary)]'
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
              className={`flex items-center gap-3 px-3 py-2 clip-corner-tl text-sm font-medium transition-colors hover:bg-[var(--color-surface-2)] border-l-2 ${
                isActive(item.path)
                  ? 'text-[var(--color-accent)] bg-[var(--color-surface-2)] border-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] border-transparent'
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl"
      >
        {mobileOpen ? <X size={20} className="text-[var(--color-accent)]" /> : <Menu size={20} className="text-[var(--color-accent)]" />}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/70 z-30" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[var(--color-surface)] border-r-2 border-[var(--color-border)] z-40 flex flex-col overflow-y-auto transition-transform ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* RIOS Logo Header */}
        <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <Link href="/" className="flex items-center gap-3">
            <div className="diamond diamond-md" />
            <div>
              <span className="text-base font-bold text-white tracking-wider font-tactical uppercase">
                RHODES ISLAND OS
              </span>
              <p className="terminal-text text-[10px] text-[var(--color-text-tertiary)] mt-0.5">
                ENDFIELD.TOOLKIT.v2.0
              </p>
            </div>
          </Link>
        </div>

        {/* User/Auth section */}
        <div className="px-2 py-3 border-b border-[var(--color-border)]">
          {user ? (
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 clip-corner-tl text-sm font-medium transition-colors hover:bg-[var(--color-surface-2)] border-l-2 ${
                isActive('/profile')
                  ? 'text-[var(--color-accent)] bg-[var(--color-surface-2)] border-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] border-transparent'
              }`}
            >
              <User size={18} />
              <span className="flex-1 truncate">{user.username}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 clip-corner-tl text-sm font-medium text-[var(--color-accent)] hover:bg-[var(--color-surface-2)] transition-colors border-l-2 border-transparent"
            >
              <LogIn size={18} />
              <span>Authorize</span>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 py-3 overflow-y-auto">
          {renderNav()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-border)]">
          <p className="terminal-text text-[10px] text-[var(--color-text-tertiary)]">RIOS.v2.0.0 &middot; zerosanity.app</p>
          <p className="terminal-text text-[10px] text-[var(--color-text-tertiary)] mt-1">GAME ASSETS &copy; GRYPHLINE</p>
        </div>
      </aside>
    </>
  );
}
