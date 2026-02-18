'use client';

import { useState, useEffect, useMemo } from 'react';
import { Trophy, Check, Search, ChevronDown, RotateCcw } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  steps: number;
}

const CATEGORIES = ['Chapter', 'Technical', 'Regional', 'Progression', 'Construction', 'Social', 'Event', 'Wondrous'] as const;

const ACHIEVEMENTS: Achievement[] = [
  // Chapter (13)
  { id: 'ch-1', name: '"Awaken"', description: 'You have returned to Talos-II.', category: 'Chapter', points: 10, steps: 1 },
  { id: 'ch-2', name: 'True Altruist', description: 'You helped plenty of people with their problems.', category: 'Chapter', points: 15, steps: 3 },
  { id: 'ch-3', name: '"Core ex Machina"', description: 'The future of frontier development has descended upon Valley IV.', category: 'Chapter', points: 20, steps: 1 },
  { id: 'ch-4', name: 'Road to the Sky', description: 'Reach the top of Mount Origrande.', category: 'Chapter', points: 20, steps: 1 },
  { id: 'ch-5', name: 'First Contact', description: 'Meet all of the operators stationed at Valley IV.', category: 'Chapter', points: 15, steps: 1 },
  { id: 'ch-6', name: 'The Frozen Path', description: 'Clear the path through the Glacial Ravine.', category: 'Chapter', points: 20, steps: 1 },
  { id: 'ch-7', name: 'Factory Online', description: 'Activate the first AIC Factory in Valley IV.', category: 'Chapter', points: 25, steps: 1 },
  { id: 'ch-8', name: 'Power Restored', description: 'Repair all power conduits in the Wuling region.', category: 'Chapter', points: 30, steps: 3 },
  { id: 'ch-9', name: 'Heart of the Mountain', description: 'Discover the secrets hidden within the mountain core.', category: 'Chapter', points: 30, steps: 1 },
  { id: 'ch-10', name: 'Signal Lost', description: 'Investigate the missing relay station signal.', category: 'Chapter', points: 20, steps: 1 },
  { id: 'ch-11', name: 'The Weight of Words', description: 'Complete all dialogue branches with Laevatain.', category: 'Chapter', points: 25, steps: 3 },
  { id: 'ch-12', name: 'Operation Complete', description: 'Successfully complete the Valley IV defense operation.', category: 'Chapter', points: 35, steps: 1 },
  { id: 'ch-13', name: 'New Horizons', description: 'Witness the dawn over a rebuilt Valley IV.', category: 'Chapter', points: 40, steps: 1 },
  // Technical (16)
  { id: 'tc-1', name: 'Perfect Dodge', description: 'Successfully dodge an attack with perfect timing.', category: 'Technical', points: 10, steps: 1 },
  { id: 'tc-2', name: 'Dodge Master', description: 'Perform 100 perfect dodges.', category: 'Technical', points: 30, steps: 3 },
  { id: 'tc-3', name: 'Combo Fiend', description: 'Achieve a 30-hit combo chain.', category: 'Technical', points: 20, steps: 1 },
  { id: 'tc-4', name: 'Chain Lightning', description: 'Hit 5 enemies with a single chain attack.', category: 'Technical', points: 25, steps: 1 },
  { id: 'tc-5', name: 'S-Rank Hunter', description: 'Achieve S-rank on combat missions.', category: 'Technical', points: 25, steps: 3 },
  { id: 'tc-6', name: 'Elemental Mastery', description: 'Trigger all elemental reactions in a single battle.', category: 'Technical', points: 30, steps: 1 },
  { id: 'tc-7', name: 'Zero Damage', description: 'Complete a boss fight without taking damage.', category: 'Technical', points: 40, steps: 1 },
  { id: 'tc-8', name: 'Speedrunner', description: 'Complete a mission in under 60 seconds.', category: 'Technical', points: 25, steps: 1 },
  { id: 'tc-9', name: 'Boss Slayer', description: 'Defeat different boss enemies.', category: 'Technical', points: 30, steps: 3 },
  { id: 'tc-10', name: 'Arts Specialist', description: 'Deal 100,000 cumulative Arts damage.', category: 'Technical', points: 25, steps: 3 },
  { id: 'tc-11', name: 'Counter Expert', description: 'Successfully counter 50 attacks.', category: 'Technical', points: 20, steps: 2 },
  { id: 'tc-12', name: 'Team Synergy', description: 'Activate 10 different team combo skills.', category: 'Technical', points: 25, steps: 3 },
  { id: 'tc-13', name: 'Overkill', description: 'Deal 50,000 damage in a single hit.', category: 'Technical', points: 30, steps: 1 },
  { id: 'tc-14', name: 'Survivalist', description: 'Win a battle with less than 10% HP remaining.', category: 'Technical', points: 20, steps: 1 },
  { id: 'tc-15', name: 'Ultimate Chain', description: 'Use 3 ultimates in succession within 10 seconds.', category: 'Technical', points: 35, steps: 1 },
  { id: 'tc-16', name: 'Parry King', description: 'Perfectly parry 200 attacks.', category: 'Technical', points: 35, steps: 3 },
  // Regional (12)
  { id: 'rg-1', name: 'Valley Explorer', description: 'Discover all locations in Valley IV.', category: 'Regional', points: 25, steps: 3 },
  { id: 'rg-2', name: 'Wuling Wanderer', description: 'Explore all areas of the Wuling Mountains.', category: 'Regional', points: 30, steps: 3 },
  { id: 'rg-3', name: 'Treasure Hunter', description: 'Find hidden chests across Talos-II.', category: 'Regional', points: 25, steps: 3 },
  { id: 'rg-4', name: 'Cartographer', description: 'Unlock all map waypoints.', category: 'Regional', points: 30, steps: 3 },
  { id: 'rg-5', name: 'High Ground', description: 'Reach the highest point in each region.', category: 'Regional', points: 20, steps: 3 },
  { id: 'rg-6', name: 'Deep Dive', description: 'Explore every underwater cave.', category: 'Regional', points: 25, steps: 2 },
  { id: 'rg-7', name: 'Secret Passages', description: 'Find all hidden passages in the mountain network.', category: 'Regional', points: 30, steps: 3 },
  { id: 'rg-8', name: 'Scenic Viewpoints', description: 'Visit all scenic viewpoints and take photos.', category: 'Regional', points: 15, steps: 3 },
  { id: 'rg-9', name: 'Ruins Researcher', description: 'Investigate all ancient ruins.', category: 'Regional', points: 35, steps: 3 },
  { id: 'rg-10', name: 'Bridge Builder', description: 'Restore all destroyed bridges.', category: 'Regional', points: 20, steps: 2 },
  { id: 'rg-11', name: 'Flora Collector', description: 'Catalog all plant species on Talos-II.', category: 'Regional', points: 25, steps: 3 },
  { id: 'rg-12', name: 'Fauna Observer', description: 'Document all wildlife on Talos-II.', category: 'Regional', points: 25, steps: 3 },
  // Progression (8)
  { id: 'pg-1', name: 'First Promotion', description: 'Promote a character for the first time.', category: 'Progression', points: 15, steps: 1 },
  { id: 'pg-2', name: 'Max Level', description: 'Reach max level with any character.', category: 'Progression', points: 40, steps: 1 },
  { id: 'pg-3', name: 'Skill Master', description: 'Upgrade any skill to max level.', category: 'Progression', points: 35, steps: 1 },
  { id: 'pg-4', name: 'Full Team', description: 'Have a team of 4 fully promoted characters.', category: 'Progression', points: 50, steps: 1 },
  { id: 'pg-5', name: 'Collector', description: 'Collect different characters.', category: 'Progression', points: 30, steps: 3 },
  { id: 'pg-6', name: 'Weapon Arsenal', description: 'Collect all weapon types.', category: 'Progression', points: 25, steps: 1 },
  { id: 'pg-7', name: 'Gear Perfectionist', description: 'Equip a full set of max-tier gear.', category: 'Progression', points: 40, steps: 1 },
  { id: 'pg-8', name: 'Essence Expert', description: 'Obtain a perfect 3/3 essence match.', category: 'Progression', points: 35, steps: 1 },
  // Construction (12)
  { id: 'cn-1', name: 'Factory Founder', description: 'Build your first AIC Factory.', category: 'Construction', points: 15, steps: 1 },
  { id: 'cn-2', name: 'Production Line', description: 'Set up a production chain with 3+ machines.', category: 'Construction', points: 20, steps: 1 },
  { id: 'cn-3', name: 'Mass Producer', description: 'Produce items in your factory.', category: 'Construction', points: 25, steps: 3 },
  { id: 'cn-4', name: 'Blueprint Collector', description: 'Collect different factory blueprints.', category: 'Construction', points: 25, steps: 3 },
  { id: 'cn-5', name: 'Conveyor Master', description: 'Place 100 conveyor belts in a single factory.', category: 'Construction', points: 20, steps: 1 },
  { id: 'cn-6', name: 'Power Grid', description: 'Generate 1000 power in a single factory layout.', category: 'Construction', points: 30, steps: 1 },
  { id: 'cn-7', name: 'Efficient Design', description: 'Create a factory with 95%+ efficiency rating.', category: 'Construction', points: 35, steps: 1 },
  { id: 'cn-8', name: 'Recipe Scholar', description: 'Unlock all crafting recipes.', category: 'Construction', points: 30, steps: 3 },
  { id: 'cn-9', name: 'Supply Chain', description: 'Create a fully automated supply chain.', category: 'Construction', points: 25, steps: 1 },
  { id: 'cn-10', name: 'Industrial Complex', description: 'Expand your factory to maximum size.', category: 'Construction', points: 40, steps: 1 },
  { id: 'cn-11', name: 'Quality Control', description: 'Produce 50 high-quality items.', category: 'Construction', points: 25, steps: 2 },
  { id: 'cn-12', name: 'Automation Expert', description: 'Create 5 fully automated production lines.', category: 'Construction', points: 35, steps: 1 },
  // Social (4)
  { id: 'sc-1', name: 'Friendly Operator', description: 'Complete a co-op mission with another player.', category: 'Social', points: 15, steps: 1 },
  { id: 'sc-2', name: 'Team Player', description: 'Complete 20 co-op missions.', category: 'Social', points: 30, steps: 3 },
  { id: 'sc-3', name: 'Blueprint Sharer', description: 'Share a factory blueprint with another player.', category: 'Social', points: 20, steps: 1 },
  { id: 'sc-4', name: 'Community Builder', description: 'Join a player guild.', category: 'Social', points: 15, steps: 1 },
  // Event (1)
  { id: 'ev-1', name: 'Heated Rivalry', description: 'Participate in the Heated Rivalry event.', category: 'Event', points: 50, steps: 3 },
  // Wondrous (5)
  { id: 'wo-1', name: 'Stargazer', description: 'Find the hidden observatory and watch the stars.', category: 'Wondrous', points: 25, steps: 1 },
  { id: 'wo-2', name: 'Echo of the Past', description: 'Discover all ancient recordings.', category: 'Wondrous', points: 30, steps: 3 },
  { id: 'wo-3', name: 'Originium Bloom', description: 'Witness the rare Originium crystal bloom event.', category: 'Wondrous', points: 40, steps: 1 },
  { id: 'wo-4', name: 'Hidden Message', description: 'Decode the mysterious inscription in the ruins.', category: 'Wondrous', points: 35, steps: 1 },
  { id: 'wo-5', name: 'Sunset Watcher', description: 'Watch 10 sunsets from different scenic viewpoints.', category: 'Wondrous', points: 20, steps: 3 },
];

const TOTAL_POINTS = ACHIEVEMENTS.reduce((sum, a) => sum + a.points, 0);

export default function AchievementsPage() {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [expandAll, setExpandAll] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('endfield-achievements-v2');
    if (saved) {
      setProgress(JSON.parse(saved));
    } else {
      const v1 = localStorage.getItem('endfield-achievements');
      if (v1) {
        const oldCompleted: string[] = JSON.parse(v1);
        const migrated: Record<string, number> = {};
        oldCompleted.forEach(id => { migrated[id] = 999; });
        setProgress(migrated);
        localStorage.setItem('endfield-achievements-v2', JSON.stringify(migrated));
      }
    }
  }, []);

  const saveProgress = (newProgress: Record<string, number>) => {
    setProgress(newProgress);
    localStorage.setItem('endfield-achievements-v2', JSON.stringify(newProgress));
  };

  const toggleStep = (achievement: Achievement) => {
    const current = progress[achievement.id] || 0;
    const next = current >= achievement.steps ? 0 : current + 1;
    const newProgress = { ...progress };
    if (next === 0) {
      delete newProgress[achievement.id];
    } else {
      newProgress[achievement.id] = next;
    }
    saveProgress(newProgress);
  };

  const isCompleted = (a: Achievement) => (progress[a.id] || 0) >= a.steps;
  const completedCount = ACHIEVEMENTS.filter(a => isCompleted(a)).length;
  const earnedPoints = ACHIEVEMENTS.filter(a => isCompleted(a)).reduce((sum, a) => sum + a.points, 0);
  const completionPct = ACHIEVEMENTS.length > 0 ? Math.round((completedCount / ACHIEVEMENTS.length) * 100) : 0;

  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number }> = {};
    CATEGORIES.forEach(cat => {
      const catAchs = ACHIEVEMENTS.filter(a => a.category === cat);
      stats[cat] = { total: catAchs.length, completed: catAchs.filter(a => isCompleted(a)).length };
    });
    return stats;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const filteredAchievements = ACHIEVEMENTS.filter(a => {
    if (selectedCategory !== 'All' && a.category !== selectedCategory) return false;
    if (statusFilter === 'completed' && !isCompleted(a)) return false;
    if (statusFilter === 'incomplete' && isCompleted(a)) return false;
    if (searchTerm && !a.name.toLowerCase().includes(searchTerm.toLowerCase()) && !a.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const resetProgress = () => {
    if (confirm('Reset all achievement progress? This cannot be undone.')) {
      saveProgress({});
    }
  };

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <RIOSHeader title="Achievement Tracker" category="RECORDS" code="RIOS-ACH-001" icon={<Trophy size={28} />} />
          <button onClick={resetProgress} className="text-[var(--color-text-tertiary)] hover:text-white p-2" title="Reset progress">
            <RotateCcw size={18} />
          </button>
        </div>

        <p className="text-sm text-[var(--color-text-tertiary)] mb-4">Track your achievement progress and optimize your completion strategy.</p>

        <div className="flex items-center justify-between p-3 mb-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
          <span>Your progress is saved locally. Log in to sync across devices.</span>
        </div>

        {/* Stats Header */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5 mb-4">
          <div className="flex items-center gap-8 flex-wrap">
            <div className="flex items-center gap-3">
              <Trophy size={28} className="text-[var(--color-accent)]" />
              <div>
                <p className="text-3xl font-bold text-white">{earnedPoints} <span className="text-lg text-[var(--color-text-tertiary)]">/ {TOTAL_POINTS}</span></p>
                <p className="text-xs text-[var(--color-text-tertiary)]">Total Points</p>
              </div>
            </div>
            <div className="h-10 w-px bg-[var(--color-border)]" />
            <div>
              <p className="text-2xl font-bold text-white">{completedCount} <span className="text-lg text-[var(--color-text-tertiary)]">/ {ACHIEVEMENTS.length}</span></p>
              <p className="text-xs text-[var(--color-text-tertiary)]">Completed</p>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-border)" strokeWidth="2.5" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeDasharray={`${completionPct}, 100`} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{completionPct}%</span>
              </div>
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full" />
                  <span className="text-[var(--color-text-tertiary)]">Earned: {earnedPoints}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[var(--color-border)] rounded-full" />
                  <span className="text-[var(--color-text-tertiary)]">Remaining: {TOTAL_POINTS - earnedPoints}</span>
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => setExpandAll(!expandAll)} className="mt-3 flex items-center gap-2 text-xs text-[var(--color-text-tertiary)] hover:text-white border-l-3 border-l-[var(--color-accent)] pl-2">
            <ChevronDown size={14} className={`transition-transform ${expandAll ? 'rotate-180' : ''}`} />
            {expandAll ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        {/* Category Tabs */}
        <div className="mb-1">
          <div className="flex flex-wrap gap-1 overflow-x-auto pb-2">
            <button onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${selectedCategory === 'All' ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-surface)]' : 'border-transparent text-[var(--color-text-tertiary)] hover:text-white'}`}>
              All Categories <span className="text-[10px] ml-1 opacity-70">{completedCount}/{ACHIEVEMENTS.length}</span>
            </button>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 text-sm whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${selectedCategory === cat ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-surface)]' : 'border-transparent text-[var(--color-text-tertiary)] hover:text-white'}`}>
                {cat} <span className="text-[10px] opacity-70">{categoryStats[cat]?.completed}/{categoryStats[cat]?.total}</span>
              </button>
            ))}
          </div>
          <div className="w-full h-1.5 bg-[var(--color-border)]">
            <div className="h-full bg-[var(--color-accent)] transition-all" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        {/* Search + Status Filters */}
        <div className="flex flex-col sm:flex-row gap-3 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] w-4 h-4" />
            <input type="text" placeholder="Search achievements..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white text-sm" />
          </div>
          <div className="flex gap-1">
            {(['all', 'completed', 'incomplete'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 text-sm capitalize border transition-colors ${statusFilter === s ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-white'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Achievement List */}
        <div className="space-y-2">
          {filteredAchievements.map(achievement => {
            const steps = progress[achievement.id] || 0;
            const done = steps >= achievement.steps;
            return (
              <div key={achievement.id} onClick={() => toggleStep(achievement)}
                className={`cursor-pointer transition-all border clip-corner-tl p-4 ${done ? 'bg-[var(--color-accent)]/5 border-[var(--color-accent)]/30' : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]/50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 shrink-0 flex items-center justify-center border-2 rounded-full transition-colors ${done ? 'bg-[var(--color-accent)] border-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}>
                    {done ? (
                      <Check size={18} className="text-black" />
                    ) : achievement.steps > 1 ? (
                      <span className="text-xs font-bold text-[var(--color-text-tertiary)]">{steps}/{achievement.steps}</span>
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm ${done ? 'text-[var(--color-accent)]' : 'text-white'}`}>{achievement.name}</h3>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{achievement.description}</p>
                    {achievement.steps > 1 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">Steps:</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: achievement.steps }).map((_, i) => (
                            <div key={i} className={`w-6 h-2 ${i < steps ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">{steps}/{achievement.steps}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-[var(--color-accent)] shrink-0">{achievement.points} pts</span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-tertiary)]">No achievements found matching your search.</div>
        )}
      </div>
    </div>
  );
}
