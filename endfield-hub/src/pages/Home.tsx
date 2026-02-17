import { Link } from 'react-router-dom';
import {
  Users, Sword, Shield, Star, FlaskConical, Wrench, Factory,
  LayoutGrid, Map, Target, Trophy, Dice6, BookOpen, Sparkles
} from 'lucide-react';

const tools = [
  { name: 'Characters', desc: 'Browse all 23 characters with stats, skills, and builds', path: '/characters', icon: <Users size={24} />, color: '#FFE500' },
  { name: 'Weapons', desc: 'Complete weapon database with stats and passives', path: '/weapons', icon: <Sword size={24} />, color: '#FF6B35' },
  { name: 'Equipment Sets', desc: 'All equipment sets with set bonuses and recommendations', path: '/equipment', icon: <Shield size={24} />, color: '#00BFFF' },
  { name: 'Ascension Planner', desc: 'Plan character ascension materials and track progress', path: '/ascension-planner', icon: <Star size={24} />, color: '#FFD700' },
  { name: 'Essence Solver', desc: 'Optimize weapon essence usage with minimum waste', path: '/essence-solver', icon: <FlaskConical size={24} />, color: '#9B59B6' },
  { name: 'Gear Artificing', desc: 'Calculate optimal equipment substats and probabilities', path: '/gear-artificing', icon: <Wrench size={24} />, color: '#27AE60' },
  { name: 'Factory Planner', desc: 'Design production chains for your AIC factory', path: '/factory-planner', icon: <Factory size={24} />, color: '#FF6B35' },
  { name: 'Blueprints', desc: 'Browse and share community factory blueprints', path: '/blueprints', icon: <LayoutGrid size={24} />, color: '#00BFFF' },
  { name: 'Tier List Builder', desc: 'Create and share character tier rankings', path: '/tier-list', icon: <LayoutGrid size={24} />, color: '#FFE500' },
  { name: 'Character Card', desc: 'Create beautiful character showcase cards', path: '/character-card', icon: <Sparkles size={24} />, color: '#9B59B6', isNew: true },
  { name: 'Interactive Map', desc: 'Explore Valley IV and Wuling with markers', path: '/map', icon: <Map size={24} />, color: '#27AE60' },
  { name: 'Headhunt Tracker', desc: 'Track your gacha pulls and pity count', path: '/headhunt-tracker', icon: <Target size={24} />, color: '#FF6B35', isNew: true },
  { name: 'Achievements', desc: 'Track your achievement completion progress', path: '/achievements', icon: <Trophy size={24} />, color: '#FFD700' },
  { name: 'Summon Simulator', desc: 'Simulate gacha pulls with real rates', path: '/summon-simulator', icon: <Dice6 size={24} />, color: '#00BFFF' },
  { name: 'Guides', desc: 'In-depth verified guides for all game content', path: '/guides', icon: <BookOpen size={24} />, color: '#27AE60' },
];

export default function Home() {
  return (
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
        {tools.map((tool) => (
          <Link
            key={tool.name}
            to={tool.path}
            className="group relative bg-[#111] border border-[#222] rounded-xl p-5 hover:border-[#444] transition-all hover:bg-[#151515] no-underline"
          >
            {tool.isNew && (
              <span className="absolute top-3 right-3 text-[10px] bg-[#FFE500] text-black px-2 py-0.5 rounded font-bold">NEW</span>
            )}
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-[#1a1a1a] border border-[#333]" style={{ color: tool.color }}>
                {tool.icon}
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm group-hover:text-[#FFE500] transition-colors">{tool.name}</h3>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">{tool.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

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
  );
}
