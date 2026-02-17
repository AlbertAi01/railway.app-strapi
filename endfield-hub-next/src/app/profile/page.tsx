'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { User, Mail, Calendar, LogOut, Settings, Shield, List, Target, CheckSquare, Factory, Download, Upload, Trash2, Clock } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';

interface ToolData {
  name: string;
  key: string;
  icon: React.ReactNode;
  description: string;
  link: string;
  checkLocalStorage: () => { hasData: boolean; lastUsed?: number };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();
  const [toolsData, setToolsData] = useState<{ [key: string]: { hasData: boolean; lastUsed?: number } }>({});

  const tools: ToolData[] = [
    {
      name: 'Tier List',
      key: 'tierList',
      icon: <List size={24} />,
      description: 'Your custom operator rankings',
      link: '/tier-list',
      checkLocalStorage: () => {
        const data = localStorage.getItem('tierListData');
        if (data) {
          try {
            const parsed = JSON.parse(data);
            return { hasData: true, lastUsed: parsed.lastModified || Date.now() };
          } catch {
            return { hasData: false };
          }
        }
        return { hasData: false };
      }
    },
    {
      name: 'Headhunt Tracker',
      key: 'headhunt',
      icon: <Target size={24} />,
      description: 'Track your gacha pulls',
      link: '/headhunt-tracker',
      checkLocalStorage: () => {
        const data = localStorage.getItem('endfield-pulls');
        if (data) {
          try {
            const pulls = JSON.parse(data);
            if (Array.isArray(pulls) && pulls.length > 0) {
              const lastPull = pulls[0];
              return { hasData: true, lastUsed: lastPull.timestamp || Date.now() };
            }
          } catch {
            return { hasData: false };
          }
        }
        return { hasData: false };
      }
    },
    {
      name: 'Ascension Planner',
      key: 'ascension',
      icon: <User size={24} />,
      description: 'Plan operator upgrades',
      link: '/ascension-planner',
      checkLocalStorage: () => {
        const data = localStorage.getItem('ascensionPlan');
        if (data) {
          try {
            const parsed = JSON.parse(data);
            return { hasData: true, lastUsed: parsed.lastModified || Date.now() };
          } catch {
            return { hasData: false };
          }
        }
        return { hasData: false };
      }
    },
    {
      name: 'Achievement Tracker',
      key: 'achievements',
      icon: <CheckSquare size={24} />,
      description: 'Track your progress',
      link: '/achievements',
      checkLocalStorage: () => {
        const data = localStorage.getItem('achievements');
        if (data) {
          try {
            const parsed = JSON.parse(data);
            return { hasData: true, lastUsed: parsed.lastModified || Date.now() };
          } catch {
            return { hasData: false };
          }
        }
        return { hasData: false };
      }
    },
    {
      name: 'Factory Planner',
      key: 'factory',
      icon: <Factory size={24} />,
      description: 'Optimize production',
      link: '/factory-planner',
      checkLocalStorage: () => {
        const data = localStorage.getItem('factoryPlans');
        if (data) {
          try {
            const parsed = JSON.parse(data);
            return { hasData: true, lastUsed: parsed.lastModified || Date.now() };
          } catch {
            return { hasData: false };
          }
        }
        return { hasData: false };
      }
    }
  ];

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Check localStorage for all tools
    const data: { [key: string]: { hasData: boolean; lastUsed?: number } } = {};
    tools.forEach(tool => {
      data[tool.key] = tool.checkLocalStorage();
    });
    setToolsData(data);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const exportAllData = () => {
    const allData: { [key: string]: any } = {};

    // Collect all localStorage data
    const keys = ['tierListData', 'endfield-pulls', 'endfield-pity', 'ascensionPlan', 'achievements', 'factoryPlans'];
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          allData[key] = JSON.parse(data);
        } catch {
          allData[key] = data;
        }
      }
    });

    // Create downloadable file
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `endfield-hub-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        // Restore all data to localStorage
        Object.keys(data).forEach(key => {
          localStorage.setItem(key, JSON.stringify(data[key]));
        });

        alert('Data imported successfully! Refresh the page to see changes.');
        window.location.reload();
      } catch (err) {
        alert('Failed to import data. Please check the file format.');
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear ALL saved data? This cannot be undone!')) {
      if (confirm('Final confirmation: This will delete all your tier lists, pulls, plans, and achievements. Continue?')) {
        const keys = ['tierListData', 'endfield-pulls', 'endfield-pity', 'ascensionPlan', 'achievements', 'factoryPlans'];
        keys.forEach(key => localStorage.removeItem(key));
        alert('All data has been cleared.');
        window.location.reload();
      }
    }
  };

  const [stats, setStats] = useState({ totalPulls: 0, achievementPercent: 0, tierListEntries: 0 });

  useEffect(() => {
    const pulls = localStorage.getItem('endfield-pulls');
    const achievements = localStorage.getItem('achievements');
    const tierList = localStorage.getItem('tierListData');

    let totalPulls = 0;
    let achievementPercent = 0;
    let tierListEntries = 0;

    if (pulls) {
      try {
        const pullsData = JSON.parse(pulls);
        totalPulls = Array.isArray(pullsData) ? pullsData.length : 0;
      } catch {
        totalPulls = 0;
      }
    }

    if (achievements) {
      try {
        const achData = JSON.parse(achievements);
        const completed = Object.values(achData).filter(v => v === true).length;
        const total = Object.keys(achData).length;
        achievementPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
      } catch {
        achievementPercent = 0;
      }
    }

    if (tierList) {
      try {
        const tierData = JSON.parse(tierList);
        tierListEntries = tierData.operators ? tierData.operators.length : 0;
      } catch {
        tierListEntries = 0;
      }
    }

    setStats({ totalPulls, achievementPercent, tierListEntries });
  }, []);

  const formatLastUsed = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080c12] text-gray-400 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#080c12] text-gray-400 p-6">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader
          title="Operator Profile"
          category="ACCOUNT"
          code="RIOS-PROF-001"
          icon={<User size={28} />}
        />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-8">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-24 h-24 bg-[var(--color-accent)] rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-12 h-12 text-black" />
                </div>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {user.username || user.email?.split('@')[0] || 'User'}
                  </h2>
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                    <span>{user.email}</span>
                  </div>

                  {user.email && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-500/50 text-green-400 text-sm">
                      <Shield className="w-4 h-4" />
                      Verified Account
                    </div>
                  )}
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-3">
                <h3 className="font-bold text-white text-xl mb-4">Account Details</h3>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl p-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-[var(--color-accent)]" />
                      <div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">Username</div>
                        <div className="text-white font-medium">
                          {user.username || 'Not set'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-[var(--color-accent)]" />
                      <div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">Member Since</div>
                        <div className="text-white font-medium">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Tools Section */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h3 className="font-bold text-white text-xl mb-4">Your Tools</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                {tools.map(tool => (
                  <Link
                    key={tool.key}
                    href={tool.link}
                    className={`group p-4 clip-corner-tl border transition-all no-underline ${
                      toolsData[tool.key]?.hasData
                        ? 'bg-[var(--color-accent)]/5 border-[var(--color-accent)]/50 hover:border-[var(--color-accent)]'
                        : 'bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 ${
                        toolsData[tool.key]?.hasData ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)]'
                      }`}>
                        {tool.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold mb-1 group-hover:text-[var(--color-accent)] transition-colors">
                          {tool.name}
                        </h4>
                        <p className="text-xs text-[var(--color-text-tertiary)] mb-2">
                          {tool.description}
                        </p>
                        {toolsData[tool.key]?.hasData ? (
                          <div className="flex items-center gap-1 text-xs text-[var(--color-accent)]">
                            <Clock size={12} />
                            <span>{formatLastUsed(toolsData[tool.key]?.lastUsed)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--color-text-tertiary)]">No saved data</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Saved Data Summary */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h3 className="font-bold text-white text-xl mb-4">Saved Data Summary</h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl p-4 text-center">
                  <div className="text-3xl font-bold text-[var(--color-accent)] mb-1">
                    {stats.totalPulls}
                  </div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">Total Pulls Tracked</div>
                </div>

                <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl p-4 text-center">
                  <div className="text-3xl font-bold text-[var(--color-accent)] mb-1">
                    {stats.achievementPercent}%
                  </div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">Achievements</div>
                </div>

                <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl p-4 text-center">
                  <div className="text-3xl font-bold text-[var(--color-accent)] mb-1">
                    {stats.tierListEntries}
                  </div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">Tier List Entries</div>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h3 className="font-bold text-white text-xl mb-4">Data Management</h3>

              <div className="space-y-3">
                <button
                  onClick={exportAllData}
                  className="w-full py-3 px-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-3 text-left"
                >
                  <Download className="w-5 h-5 text-[var(--color-accent)]" />
                  <div>
                    <div className="text-white font-medium">Export All Data</div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">Download your data as JSON</div>
                  </div>
                </button>

                <label className="w-full py-3 px-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-3 text-left cursor-pointer">
                  <Upload className="w-5 h-5 text-[var(--color-accent)]" />
                  <div>
                    <div className="text-white font-medium">Import Data</div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">Restore from backup file</div>
                  </div>
                  <input
                    type="file"
                    accept="application/json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={clearAllData}
                  className="w-full py-3 px-4 bg-red-900/20 border border-red-500/50 clip-corner-tl hover:bg-red-900/30 transition-colors flex items-center gap-3 text-left text-red-400"
                >
                  <Trash2 className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Clear All Data</div>
                    <div className="text-xs text-red-400/70">Permanently delete all saved data</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-4">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h3 className="font-bold text-white mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <button className="w-full py-3 px-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-3 text-left">
                  <Settings className="w-5 h-5 text-[var(--color-accent)]" />
                  <span>Edit Profile</span>
                </button>

                <button className="w-full py-3 px-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-3 text-left">
                  <Shield className="w-5 h-5 text-[var(--color-accent)]" />
                  <span>Security Settings</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full py-3 px-4 bg-red-900/20 border border-red-500/50 clip-corner-tl hover:bg-red-900/30 transition-colors flex items-center gap-3 text-left text-red-400"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h3 className="font-bold text-white mb-4">About Your Account</h3>
              <p className="text-sm leading-relaxed">
                Your account data is stored securely and is never shared with third parties.
                You can delete your account at any time from the security settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
