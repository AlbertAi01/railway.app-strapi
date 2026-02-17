import { Link, useLocation } from 'react-router-dom';
import {
  Home, Users, Sword, Shield, BookOpen, Factory, Map,
  Trophy, Target, Dice6, LayoutGrid, Star, Crosshair,
  FlaskConical, Wrench, Sparkles, ChevronDown, ChevronRight,
  Menu, X, LogIn, User
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
    label: 'Characters', path: '/characters', icon: <Users size={18} />,
    children: [
      { label: 'All Characters', path: '/characters', icon: <Users size={16} /> },
      { label: 'Weapons', path: '/weapons', icon: <Sword size={16} /> },
      { label: 'Equipment Sets', path: '/equipment', icon: <Shield size={16} /> },
      { label: 'Ascension Planner', path: '/ascension-planner', icon: <Star size={16} /> },
      { label: 'Essence Solver', path: '/essence-solver', icon: <FlaskConical size={16} /> },
      { label: 'Gear Artificing', path: '/gear-artificing', icon: <Wrench size={16} /> },
    ],
  },
  {
    label: 'Character Card', path: '/character-card', icon: <Sparkles size={18} />,
    isNew: true,
  },
  {
    label: 'Character Builds', path: '/tier-list', icon: <LayoutGrid size={18} />,
    children: [
      { label: 'Tier List Builder', path: '/tier-list', icon: <LayoutGrid size={16} /> },
    ],
  },
  {
    label: 'Factory Planner', path: '/factory-planner', icon: <Factory size={18} />,
    children: [
      { label: 'Planner', path: '/factory-planner', icon: <Factory size={16} /> },
      { label: 'Blueprints', path: '/blueprints', icon: <LayoutGrid size={16} /> },
      { label: 'Recipes', path: '/recipes', icon: <BookOpen size={16} /> },
    ],
  },
  { label: 'Interactive Map', path: '/map', icon: <Map size={18} /> },
  {
    label: 'Headhunt Tracker', path: '/headhunt-tracker', icon: <Target size={18} />,
    isNew: true,
  },
  { label: 'Achievement Tracker', path: '/achievements', icon: <Trophy size={18} /> },
  { label: 'Summon Simulator', path: '/summon-simulator', icon: <Dice6 size={18} /> },
  { label: 'Guides', path: '/guides', icon: <BookOpen size={18} /> },
];

export default function Sidebar() {
  const location = useLocation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthStore();

  const toggleExpand = (label: string) => {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path: string) => location.pathname === path;

  const renderNav = () => (
    <nav className="flex flex-col gap-0.5 px-2">
      {navigation.map((item) => (
        <div key={item.label}>
          {item.children ? (
            <>
              <button
                onClick={() => toggleExpand(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#1a1a1a] ${
                  location.pathname.startsWith(item.path) ? 'text-[#FFE500]' : 'text-gray-300'
                }`}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                {item.isNew && (
                  <span className="text-[10px] bg-[#FFE500] text-black px-1.5 py-0.5 rounded font-bold">NEW</span>
                )}
                {expanded[item.label] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {expanded[item.label] && (
                <div className="ml-4 flex flex-col gap-0.5">
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-[#1a1a1a] ${
                        isActive(child.path) ? 'text-[#FFE500] bg-[#1a1a1a]' : 'text-gray-400'
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
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#1a1a1a] ${
                isActive(item.path) ? 'text-[#FFE500] bg-[#1a1a1a]' : 'text-gray-300'
              }`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.isNew && (
                <span className="text-[10px] bg-[#FFE500] text-black px-1.5 py-0.5 rounded font-bold">NEW</span>
              )}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#111] rounded-lg border border-[#333]"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0d0d0d] border-r border-[#222] z-40 flex flex-col overflow-y-auto transition-transform ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 border-b border-[#222]">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <Crosshair size={24} className="text-[#FFE500]" />
            <span className="text-lg font-bold text-white tracking-wide">ZERO SANITY</span>
          </Link>
          <p className="text-[11px] text-gray-500 mt-1">Arknights: Endfield Toolkit</p>
        </div>
        {/* Auth section */}
        <div className="px-2 py-3 border-b border-[#222]">
          {user ? (
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#1a1a1a] no-underline ${
                isActive('/profile') ? 'text-[#FFE500] bg-[#1a1a1a]' : 'text-gray-300'
              }`}
            >
              <User size={18} />
              <span className="flex-1 truncate">{user.username}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#FFE500] hover:bg-[#1a1a1a] transition-colors no-underline"
            >
              <LogIn size={18} />
              <span>Login / Register</span>
            </Link>
          )}
        </div>
        <div className="flex-1 py-3 overflow-y-auto">
          {renderNav()}
        </div>
        <div className="p-4 border-t border-[#222] text-[11px] text-gray-600">
          <p>v2.0.0 &middot; zerosanity.app</p>
          <p className="mt-1">Game assets &copy; GRYPHLINE</p>
        </div>
      </aside>
    </>
  );
}
