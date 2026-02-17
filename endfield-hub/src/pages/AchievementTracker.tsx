import React, { useState, useEffect, useRef } from 'react';
import { Search, Trophy, CheckCircle, Circle, RotateCcw, Cloud, CloudOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { saveUserData, loadUserData } from '@/lib/userSync';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  hidden?: boolean;
}

const CATEGORIES = ['Exploration', 'Combat', 'Factory', 'Story', 'Collection', 'Hidden'];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  // Exploration
  { id: 'exp1', title: 'First Steps', description: 'Complete the tutorial', category: 'Exploration', completed: false },
  { id: 'exp2', title: 'Zone Explorer', description: 'Unlock all areas in Zone 1', category: 'Exploration', completed: false },
  { id: 'exp3', title: 'Treasure Hunter', description: 'Find 50 treasure chests', category: 'Exploration', completed: false },
  { id: 'exp4', title: 'Pathfinder', description: 'Discover all teleport points', category: 'Exploration', completed: false },
  { id: 'exp5', title: 'Cartographer', description: 'Reveal 100% of the map', category: 'Exploration', completed: false },
  { id: 'exp6', title: 'High Ground', description: 'Reach the highest point in the game', category: 'Exploration', completed: false },
  { id: 'exp7', title: 'Deep Diver', description: 'Explore the deepest dungeon', category: 'Exploration', completed: false },
  { id: 'exp8', title: 'Nomad', description: 'Travel 100km total distance', category: 'Exploration', completed: false },

  // Combat
  { id: 'cbt1', title: 'First Blood', description: 'Defeat your first enemy', category: 'Combat', completed: false },
  { id: 'cbt2', title: 'Sharpshooter', description: 'Deal 10,000 damage in a single hit', category: 'Combat', completed: false },
  { id: 'cbt3', title: 'Untouchable', description: 'Complete a stage without taking damage', category: 'Combat', completed: false },
  { id: 'cbt4', title: 'Combo Master', description: 'Achieve a 100-hit combo', category: 'Combat', completed: false },
  { id: 'cbt5', title: 'Boss Slayer', description: 'Defeat all world bosses', category: 'Combat', completed: false },
  { id: 'cbt6', title: 'Swift Victory', description: 'Clear a stage in under 60 seconds', category: 'Combat', completed: false },
  { id: 'cbt7', title: 'Overkill', description: 'Deal 100,000 total damage', category: 'Combat', completed: false },
  { id: 'cbt8', title: 'Survivor', description: 'Win with 1 HP remaining', category: 'Combat', completed: false },
  { id: 'cbt9', title: 'Elemental Master', description: 'Trigger all elemental reactions', category: 'Combat', completed: false },
  { id: 'cbt10', title: 'Perfect Defense', description: 'Block 1,000 damage total', category: 'Combat', completed: false },

  // Factory
  { id: 'fac1', title: 'Builder', description: 'Construct your first building', category: 'Factory', completed: false },
  { id: 'fac2', title: 'Industrialist', description: 'Build all factory types', category: 'Factory', completed: false },
  { id: 'fac3', title: 'Production Line', description: 'Craft 100 items', category: 'Factory', completed: false },
  { id: 'fac4', title: 'Resource Tycoon', description: 'Collect 100,000 resources', category: 'Factory', completed: false },
  { id: 'fac5', title: 'Efficiency Expert', description: 'Upgrade a facility to max level', category: 'Factory', completed: false },
  { id: 'fac6', title: 'Supply Chain', description: 'Establish 10 trade routes', category: 'Factory', completed: false },
  { id: 'fac7', title: 'Quality Control', description: 'Craft a legendary item', category: 'Factory', completed: false },
  { id: 'fac8', title: 'Automated', description: 'Set up full automation for one resource', category: 'Factory', completed: false },

  // Story
  { id: 'str1', title: 'Prologue', description: 'Complete Chapter 1', category: 'Story', completed: false },
  { id: 'str2', title: 'Unfolding Mystery', description: 'Complete Chapter 2', category: 'Story', completed: false },
  { id: 'str3', title: 'Rising Action', description: 'Complete Chapter 3', category: 'Story', completed: false },
  { id: 'str4', title: 'Turning Point', description: 'Complete Chapter 4', category: 'Story', completed: false },
  { id: 'str5', title: 'Revelation', description: 'Complete Chapter 5', category: 'Story', completed: false },
  { id: 'str6', title: 'Story Complete', description: 'Finish the main storyline', category: 'Story', completed: false },
  { id: 'str7', title: 'Side Quest Master', description: 'Complete all side quests', category: 'Story', completed: false },
  { id: 'str8', title: 'Dialogue Enthusiast', description: 'Read all optional dialogues', category: 'Story', completed: false },
  { id: 'str9', title: 'Character Bonds', description: 'Max out trust with 5 characters', category: 'Story', completed: false },

  // Collection
  { id: 'col1', title: 'Collector', description: 'Unlock your first character', category: 'Collection', completed: false },
  { id: 'col2', title: 'Squad Leader', description: 'Unlock 10 characters', category: 'Collection', completed: false },
  { id: 'col3', title: 'Commander', description: 'Unlock all characters', category: 'Collection', completed: false },
  { id: 'col4', title: 'Arsenal', description: 'Collect 50 different weapons', category: 'Collection', completed: false },
  { id: 'col5', title: 'Armory Master', description: 'Own all weapon types', category: 'Collection', completed: false },
  { id: 'col6', title: 'Fashion Icon', description: 'Collect 20 character skins', category: 'Collection', completed: false },
  { id: 'col7', title: 'Material Hoarder', description: 'Collect one of every material', category: 'Collection', completed: false },
  { id: 'col8', title: 'Completionist', description: 'Achieve 100% collection', category: 'Collection', completed: false },
  { id: 'col9', title: 'Rarity Seeker', description: 'Own 5 six-star characters', category: 'Collection', completed: false },

  // Hidden
  { id: 'hid1', title: '???', description: 'Find the secret room', category: 'Hidden', completed: false, hidden: true },
  { id: 'hid2', title: '???', description: 'Discover the easter egg', category: 'Hidden', completed: false, hidden: true },
  { id: 'hid3', title: '???', description: 'Unlock the secret ending', category: 'Hidden', completed: false, hidden: true },
  { id: 'hid4', title: '???', description: 'Find the developer message', category: 'Hidden', completed: false, hidden: true },
  { id: 'hid5', title: '???', description: 'Complete the secret challenge', category: 'Hidden', completed: false, hidden: true },
  { id: 'hid6', title: 'Time Traveler', description: 'Play at midnight', category: 'Hidden', completed: false, hidden: true },
  { id: 'hid7', title: 'Persistent', description: 'Fail the same stage 10 times', category: 'Hidden', completed: false, hidden: true },
  { id: 'hid8', title: 'Lucky', description: 'Get three 6-stars in a row', category: 'Hidden', completed: false, hidden: true },
];

export default function AchievementTracker() {
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const { user } = useAuthStore();
  const isAuthenticated = !!user;
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    (async () => {
      const saved = await loadUserData<Achievement[]>('achievements', isAuthenticated);
      if (saved && Array.isArray(saved)) {
        setAchievements(saved);
      }
    })();
  }, [isAuthenticated]);

  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      if (isAuthenticated) setSyncStatus('syncing');
      try {
        await saveUserData('achievements', achievements, isAuthenticated);
        setSyncStatus(isAuthenticated ? 'synced' : 'idle');
      } catch {
        setSyncStatus('error');
      }
    }, 500);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [achievements, isAuthenticated]);

  const toggleAchievement = (id: string) => {
    setAchievements((prev) =>
      prev.map((ach) =>
        ach.id === id ? { ...ach, completed: !ach.completed } : ach
      )
    );
  };

  const resetAchievements = () => {
    if (confirm('Reset all achievements? This cannot be undone.')) {
      setAchievements(DEFAULT_ACHIEVEMENTS);
    }
  };

  const getCategoryStats = (category: string) => {
    const categoryAchievements = achievements.filter((a) => a.category === category);
    const completed = categoryAchievements.filter((a) => a.completed).length;
    const total = categoryAchievements.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { completed, total, percentage };
  };

  const getOverallStats = () => {
    const completed = achievements.filter((a) => a.completed).length;
    const total = achievements.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { completed, total, percentage };
  };

  const filteredAchievements = achievements.filter((ach) => {
    const matchesSearch =
      searchQuery === '' ||
      ach.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ach.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === null || ach.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const overallStats = getOverallStats();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-yellow-400 mb-2 flex items-center gap-3">
              <Trophy size={40} />
              Achievement Tracker
            </h1>
            {isAuthenticated && (
              <div className="flex items-center gap-2 text-sm">
                {syncStatus === 'syncing' && <><Cloud size={16} className="text-blue-400 animate-pulse" /> <span className="text-blue-400">Syncing...</span></>}
                {syncStatus === 'synced' && <><Cloud size={16} className="text-green-400" /> <span className="text-green-400">Cloud synced</span></>}
                {syncStatus === 'error' && <><CloudOff size={16} className="text-red-400" /> <span className="text-red-400">Sync failed</span></>}
              </div>
            )}
          </div>
          <p className="text-gray-400">Track your progress across all achievements{isAuthenticated ? ' (synced to cloud)' : ''}</p>
        </div>

        {/* Overall Progress */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold text-gray-900">Overall Progress</h2>
            <span className="text-3xl font-bold text-gray-900">
              {overallStats.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-900/30 rounded-full h-4 mb-2">
            <div
              className="bg-gray-900 h-4 rounded-full transition-all duration-500"
              style={{ width: `${overallStats.percentage}%` }}
            />
          </div>
          <div className="text-sm text-gray-900 font-semibold">
            {overallStats.completed} / {overallStats.total} Achievements Unlocked
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none"
            />
          </div>

          {/* Reset */}
          <button
            onClick={resetAchievements}
            className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-500 transition-colors"
          >
            <RotateCcw size={18} />
            Reset All
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              selectedCategory === null
                ? 'bg-yellow-500 text-gray-900'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((category) => {
            const stats = getCategoryStats(category);
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedCategory === category
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {category} ({stats.completed}/{stats.total})
              </button>
            );
          })}
        </div>

        {/* Category Progress Bars */}
        {selectedCategory === null && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {CATEGORIES.map((category) => {
              const stats = getCategoryStats(category);
              return (
                <div key={category} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white">{category}</h3>
                    <span className="text-yellow-400 font-bold">{stats.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400">
                    {stats.completed} / {stats.total} completed
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Achievements List */}
        <div className="space-y-2">
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No achievements found matching your search
            </div>
          ) : (
            filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                onClick={() => toggleAchievement(achievement.id)}
                className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-700 ${
                  achievement.completed ? 'border-l-4 border-yellow-400' : 'border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {achievement.completed ? (
                      <CheckCircle className="text-yellow-400" size={24} />
                    ) : (
                      <Circle className="text-gray-600" size={24} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3
                          className={`font-bold text-lg ${
                            achievement.completed ? 'text-yellow-400' : 'text-white'
                          }`}
                        >
                          {achievement.hidden && !achievement.completed ? '???' : achievement.title}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                          {achievement.hidden && !achievement.completed
                            ? 'Hidden achievement - complete to reveal'
                            : achievement.description}
                        </p>
                      </div>

                      {/* Category Badge */}
                      <span className="px-3 py-1 bg-gray-700 rounded-full text-xs font-semibold text-gray-300 whitespace-nowrap">
                        {achievement.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h3 className="font-bold text-yellow-400 mb-2">How to Use</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Click any achievement to toggle its completion status</li>
            <li>• Use the search bar to find specific achievements</li>
            <li>• Filter by category to focus on specific areas</li>
            <li>• Hidden achievements reveal their details once completed</li>
            <li>• Progress is automatically saved to localStorage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
