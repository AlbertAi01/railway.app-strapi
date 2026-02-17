'use client';

import { useState, useEffect } from 'react';
import { Trophy, Check, Search, Download, Share2 } from 'lucide-react';
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
  { id: '5', name: 'Elite Operator', description: 'Promote your first operator to E4', category: 'Progression', points: 30 },
  { id: '6', name: 'Master Tactician', description: 'Max out any skill level', category: 'Progression', points: 50 },
  { id: '7', name: 'Full Roster', description: 'Collect 20 operators', category: 'Collection', points: 50 },
  { id: '8', name: 'Rare Collector', description: 'Collect all 6-star operators', category: 'Collection', points: 100 },
  { id: '9', name: 'Lucky Draw', description: 'Get a 6-star in your first 10 pulls', category: 'Headhunt', points: 30 },
  { id: '10', name: 'Veteran Recruiter', description: 'Perform 500 headhunt operations', category: 'Headhunt', points: 50 },
  { id: '11', name: 'Resource Hoarder', description: 'Save 100,000 Credits', category: 'Economy', points: 40 },
  { id: '12', name: 'Factory Manager', description: 'Fully optimize your AIC Factory', category: 'Economy', points: 60 },
  { id: '13', name: 'Challenge Accepted', description: 'Complete high-difficulty operations', category: 'Challenge', points: 80 },
  { id: '14', name: 'True Challenger', description: 'Clear extreme difficulty operations', category: 'Challenge', points: 150 },
  { id: '15', name: 'Combat Expert', description: 'Clear all combat trials with perfect scores', category: 'Challenge', points: 70 },
  { id: '16', name: 'Social Butterfly', description: 'Use 50 friend support operators', category: 'Social', points: 20 },
  { id: '17', name: 'Team Player', description: 'Join a squad', category: 'Social', points: 10 },
  { id: '18', name: 'Squad Champion', description: 'Contribute 10,000 squad points', category: 'Social', points: 50 },
  { id: '19', name: 'Daily Devotion', description: 'Complete daily missions for 30 days', category: 'Daily', points: 40 },
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

  const exportProgressJSON = () => {
    const progressData = {
      completed: Array.from(completed),
      completionPercentage,
      earnedPoints,
      totalPoints,
      timestamp: new Date().toISOString()
    };
    const data = JSON.stringify(progressData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zerosanity-achievements-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareCompletionLink = async () => {
    try {
      const text = `I've completed ${completionPercentage}% of Endfield achievements! (${completed.size}/${ACHIEVEMENTS.length}) with ${earnedPoints}/${totalPoints} points - Track yours at ${window.location.origin}/achievements`;
      await navigator.clipboard.writeText(text);
      alert('Achievement progress copied to clipboard!');
    } catch (error) {
      alert('Failed to copy. Please try again.');
    }
  };

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader
          title="Achievement Registry"
          category="RECORDS"
          code="RIOS-ACH-001"
          icon={<Trophy size={28} />}
        />

        {/* Export/Share Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={exportProgressJSON}
            disabled={completed.size === 0}
            className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export Progress (JSON)
          </button>
          <button
            onClick={shareCompletionLink}
            disabled={completed.size === 0}
            className="px-4 py-2 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-[var(--color-accent)]/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            Share Completion %
          </button>
        </div>

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
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 border transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[var(--color-accent)] text-black font-bold border-[var(--color-accent)]'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
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
                      <Trophy className="w-6 h-6 text-[var(--color-text-tertiary)]" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-bold text-lg ${isCompleted ? 'text-[var(--color-accent)]' : 'text-white'}`}>
                        {achievement.name}
                      </h3>
                      <span className="text-sm px-3 py-1 bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-accent)] font-bold">
                        {achievement.points}
                      </span>
                    </div>

                    <p className="text-sm mb-2">{achievement.description}</p>

                    <span className="text-xs px-3 py-1 bg-[var(--color-border)] border border-[var(--color-border)]">
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
