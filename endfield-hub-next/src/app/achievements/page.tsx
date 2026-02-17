'use client';

import { useState, useEffect } from 'react';
import { Trophy, Check, Search } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: '1', name: 'First Steps', description: 'Complete the tutorial', category: 'Story', points: 10 },
  { id: '2', name: 'Chapter 1 Complete', description: 'Complete Chapter 1', category: 'Story', points: 20 },
  { id: '3', name: 'Chapter 2 Complete', description: 'Complete Chapter 2', category: 'Story', points: 20 },
  { id: '4', name: 'Chapter 3 Complete', description: 'Complete Chapter 3', category: 'Story', points: 20 },
  { id: '5', name: 'First E2', description: 'E2 your first operator', category: 'Progression', points: 30 },
  { id: '6', name: 'Master Tactician', description: 'M3 any skill', category: 'Progression', points: 50 },
  { id: '7', name: 'Full Roster', description: 'Collect 50 operators', category: 'Collection', points: 50 },
  { id: '8', name: 'Rare Collector', description: 'Collect all 6-star operators', category: 'Collection', points: 100 },
  { id: '9', name: 'Lucky Draw', description: 'Get a 6-star in your first 10 pulls', category: 'Gacha', points: 30 },
  { id: '10', name: 'Whale Watch', description: 'Perform 500 pulls', category: 'Gacha', points: 50 },
  { id: '11', name: 'Resource Hoarder', description: 'Save 100,000 Originium', category: 'Economy', points: 40 },
  { id: '12', name: 'Factory Manager', description: 'Fully upgrade your base', category: 'Economy', points: 60 },
  { id: '13', name: 'Risk Taker', description: 'Clear CC Risk 18', category: 'Challenge', points: 80 },
  { id: '14', name: 'True Challenger', description: 'Clear CC Risk 26', category: 'Challenge', points: 150 },
  { id: '15', name: 'Annihilation Expert', description: 'Clear all Annihilation stages', category: 'Challenge', points: 70 },
  { id: '16', name: 'Social Butterfly', description: 'Visit 50 friend supports', category: 'Social', points: 20 },
  { id: '17', name: 'Team Player', description: 'Join a guild', category: 'Social', points: 10 },
  { id: '18', name: 'Guild Champion', description: 'Contribute 10,000 guild points', category: 'Social', points: 50 },
  { id: '19', name: 'Daily Devotion', description: 'Complete dailies for 30 days', category: 'Daily', points: 40 },
  { id: '20', name: 'Veteran Player', description: 'Log in for 365 days', category: 'Daily', points: 100 }
];

export default function AchievementsPage() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(ACHIEVEMENTS.map(a => a.category)))];

  useEffect(() => {
    const saved = localStorage.getItem('endfield-achievements');
    if (saved) {
      setCompleted(new Set(JSON.parse(saved)));
    }
  }, []);

  const toggleAchievement = (id: string) => {
    const newCompleted = new Set(completed);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompleted(newCompleted);
    localStorage.setItem('endfield-achievements', JSON.stringify(Array.from(newCompleted)));
  };

  const filteredAchievements = ACHIEVEMENTS.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || achievement.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPoints = ACHIEVEMENTS.reduce((sum, a) => sum + a.points, 0);
  const earnedPoints = ACHIEVEMENTS.filter(a => completed.has(a.id)).reduce((sum, a) => sum + a.points, 0);
  const completionPercentage = ((completed.size / ACHIEVEMENTS.length) * 100).toFixed(1);

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader
          title="Achievement Registry"
          category="RECORDS"
          code="RIOS-ACH-001"
          icon={<Trophy size={28} />}
        />

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4">
            <div className="text-sm text-[var(--color-text-tertiary)]">Completed</div>
            <div className="text-2xl font-bold text-white">
              {completed.size}/{ACHIEVEMENTS.length}
            </div>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4">
            <div className="text-sm text-[var(--color-text-tertiary)]">Completion</div>
            <div className="text-2xl font-bold text-[var(--color-accent)]">{completionPercentage}%</div>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4">
            <div className="text-sm text-[var(--color-text-tertiary)]">Points Earned</div>
            <div className="text-2xl font-bold text-white">{earnedPoints}</div>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4">
            <div className="text-sm text-[var(--color-text-tertiary)]">Total Points</div>
            <div className="text-2xl font-bold text-[var(--color-text-tertiary)]">{totalPoints}</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-tertiary)] w-5 h-5" />
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent)] text-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[var(--color-accent)] text-black font-bold'
                    : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Achievement List */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredAchievements.map(achievement => {
            const isCompleted = completed.has(achievement.id);

            return (
              <div
                key={achievement.id}
                onClick={() => toggleAchievement(achievement.id)}
                className={`cursor-pointer transition-all ${
                  isCompleted
                    ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                } border clip-corner-tl p-6`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6 text-black" />
                    ) : (
                      <Trophy className="w-6 h-6 text-gray-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-bold text-lg ${isCompleted ? 'text-[var(--color-accent)]' : 'text-white'}`}>
                        {achievement.name}
                      </h3>
                      <span className="text-sm px-3 py-1 bg-[var(--color-border)] rounded-full text-[var(--color-accent)] font-bold">
                        {achievement.points}
                      </span>
                    </div>

                    <p className="text-sm mb-2">{achievement.description}</p>

                    <span className="text-xs px-3 py-1 bg-[var(--color-border)] rounded-full">
                      {achievement.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-tertiary)]">
            No achievements found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
