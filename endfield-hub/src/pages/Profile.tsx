import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  User, LogOut, Star, LayoutGrid, BookOpen, Clock,
  Trophy, Target, Crosshair, Cloud
} from 'lucide-react';

interface DataCounts {
  builds: number;
  achievements: { completed: number; total: number };
  pulls: number;
  tierPlaced: number;
}

function getLocalDataCounts(): DataCounts {
  const counts: DataCounts = { builds: 0, achievements: { completed: 0, total: 0 }, pulls: 0, tierPlaced: 0 };

  try {
    const builds = localStorage.getItem('characterBuilds');
    if (builds) counts.builds = JSON.parse(builds).length;
  } catch { /* ignore */ }

  try {
    const achs = localStorage.getItem('achievements');
    if (achs) {
      const list = JSON.parse(achs);
      counts.achievements = { completed: list.filter((a: { completed: boolean }) => a.completed).length, total: list.length };
    }
  } catch { /* ignore */ }

  try {
    const headhunt = localStorage.getItem('headhuntTracker');
    if (headhunt) counts.pulls = JSON.parse(headhunt).pulls?.length || 0;
  } catch { /* ignore */ }

  try {
    const tier = localStorage.getItem('tierList');
    if (tier) {
      const data = JSON.parse(tier);
      counts.tierPlaced = data.tiers?.reduce((acc: number, t: { characters: unknown[] }) => acc + t.characters.length, 0) || 0;
    }
  } catch { /* ignore */ }

  return counts;
}

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [counts, setCounts] = useState<DataCounts>(getLocalDataCounts());

  useEffect(() => {
    setCounts(getLocalDataCounts());
  }, []);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown';

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">PROFILE</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#FFE500]/10 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <User size={32} className="text-[#FFE500]" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.username}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock size={14} />
              <span>Member since {memberSince}</span>
            </div>
            {user.provider && user.provider !== 'local' && (
              <div className="flex items-center gap-2 text-gray-400">
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: user.provider === 'discord' ? '#5865F2' : '#4285F4' }} />
                <span>Signed in with {user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-sm"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {/* My Content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">My Content</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/blueprints')}
                className="flex items-center gap-3 p-4 rounded-lg bg-[#1a1a1a] border border-[#333] hover:border-[#FFE500]/30 transition-colors text-left"
              >
                <LayoutGrid size={20} className="text-[#00BFFF]" />
                <div>
                  <p className="text-white font-medium text-sm">My Blueprints</p>
                  <p className="text-gray-600 text-xs">Submitted factory designs</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/character-card')}
                className="flex items-center gap-3 p-4 rounded-lg bg-[#1a1a1a] border border-[#333] hover:border-[#FFE500]/30 transition-colors text-left"
              >
                <Star size={20} className="text-[#FFD700]" />
                <div>
                  <p className="text-white font-medium text-sm">My Builds</p>
                  <p className="text-gray-600 text-xs">{counts.builds} saved build{counts.builds !== 1 ? 's' : ''}</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/guides')}
                className="flex items-center gap-3 p-4 rounded-lg bg-[#1a1a1a] border border-[#333] hover:border-[#FFE500]/30 transition-colors text-left"
              >
                <BookOpen size={20} className="text-[#27AE60]" />
                <div>
                  <p className="text-white font-medium text-sm">My Guides</p>
                  <p className="text-gray-600 text-xs">Written guides</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Cloud size={18} className="text-[#FFE500]" />
              <h3 className="text-lg font-bold text-white">Synced Data</h3>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Your tool data syncs to the cloud so you can access it on any device.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/achievements')}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-[#333] hover:border-[#FFE500]/30 transition-colors text-left"
              >
                <Trophy size={18} className="text-[#FFE500]" />
                <div>
                  <p className="text-white text-xs font-medium">Achievement Tracker</p>
                  <p className="text-gray-600 text-[10px]">
                    {counts.achievements.completed}/{counts.achievements.total} completed
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigate('/headhunt-tracker')}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-[#333] hover:border-[#FFE500]/30 transition-colors text-left"
              >
                <Target size={18} className="text-[#FF6B35]" />
                <div>
                  <p className="text-white text-xs font-medium">Headhunt Tracker</p>
                  <p className="text-gray-600 text-[10px]">
                    {counts.pulls} pull{counts.pulls !== 1 ? 's' : ''} logged
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigate('/tier-list')}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-[#333] hover:border-[#FFE500]/30 transition-colors text-left"
              >
                <Crosshair size={18} className="text-[#9B59B6]" />
                <div>
                  <p className="text-white text-xs font-medium">Tier List</p>
                  <p className="text-gray-600 text-[10px]">
                    {counts.tierPlaced} character{counts.tierPlaced !== 1 ? 's' : ''} placed
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigate('/character-card')}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-[#333] hover:border-[#FFE500]/30 transition-colors text-left"
              >
                <Star size={18} className="text-[#00BFFF]" />
                <div>
                  <p className="text-white text-xs font-medium">Character Builds</p>
                  <p className="text-gray-600 text-[10px]">
                    {counts.builds} build{counts.builds !== 1 ? 's' : ''} saved
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
