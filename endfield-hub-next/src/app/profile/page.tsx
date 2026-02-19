'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { User, Mail, Calendar, LogOut, Settings, Shield, List, Target, CheckSquare, Factory, Download, Upload, Trash2, Clock, Pencil, Check, X, Loader2, Hammer, Bookmark, Eye, Heart, Plus, Play, Globe, Lock } from 'lucide-react';
import Image from 'next/image';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { getMyBuilds, getFavoriteBuildIds, SAMPLE_BUILDS } from '@/data/builds';
import type { Build } from '@/data/builds';
import { CHARACTER_ICONS } from '@/lib/assets';
import { CHARACTERS } from '@/lib/data';
import { RARITY_COLORS, ELEMENT_COLORS } from '@/types/game';

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
  const { user, logout, isLoading, setUser, token } = useAuthStore();
  const [toolsData, setToolsData] = useState<{ [key: string]: { hasData: boolean; lastUsed?: number } }>({});
  const [editingName, setEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

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

  const startEditingName = () => {
    setNewUsername(user?.username || '');
    setNameError('');
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const cancelEditingName = () => {
    setEditingName(false);
    setNameError('');
  };

  const saveDisplayName = async () => {
    const trimmed = newUsername.trim();
    if (!trimmed) { setNameError('Display name cannot be empty'); return; }
    if (trimmed.length < 3) { setNameError('Must be at least 3 characters'); return; }
    if (trimmed.length > 30) { setNameError('Must be 30 characters or less'); return; }
    if (trimmed === user?.username) { setEditingName(false); return; }

    setSavingName(true);
    setNameError('');
    try {
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      const { data } = await api.put(`/users/${user?.id}`, { username: trimmed });
      setUser({ ...user!, username: data.username || trimmed });
      setEditingName(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to update display name';
      setNameError(msg);
    } finally {
      setSavingName(false);
    }
  };

  const exportAllData = () => {
    const allData: { [key: string]: any } = {};

    // Collect all localStorage data
    const keys = ['tierListData', 'endfield-pulls', 'endfield-pity', 'ascensionPlan', 'achievements', 'factoryPlans', 'endfield-my-builds', 'endfield-build-favorites'];
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

    // Security: reject files over 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum allowed size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
          alert('Invalid backup file format. Expected a JSON object.');
          return;
        }

        // Security: only allow known localStorage keys to be imported
        // This prevents overwriting auth tokens, session data, or other sensitive keys
        const ALLOWED_KEYS = ['tierListData', 'endfield-pulls', 'endfield-pity', 'ascensionPlan', 'achievements', 'factoryPlans', 'endfield-my-builds', 'endfield-build-favorites'];
        let importedCount = 0;

        Object.keys(data).forEach(key => {
          if (ALLOWED_KEYS.includes(key)) {
            const value = data[key];
            // Sanitize: ensure the value can be safely serialized (strips any prototype pollution attempts)
            const sanitized = JSON.parse(JSON.stringify(value));
            localStorage.setItem(key, JSON.stringify(sanitized));
            importedCount++;
          }
        });

        if (importedCount === 0) {
          alert('No valid data found in the backup file. Recognized keys: ' + ALLOWED_KEYS.join(', '));
          return;
        }

        alert(`Imported ${importedCount} data entries successfully! The page will reload.`);
        window.location.reload();
      } catch (err) {
        alert('Failed to import data. The file may be corrupted or not valid JSON.');
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear ALL saved data? This cannot be undone!')) {
      if (confirm('Final confirmation: This will delete all your tier lists, pulls, plans, achievements, and builds. Continue?')) {
        const keys = ['tierListData', 'endfield-pulls', 'endfield-pity', 'ascensionPlan', 'achievements', 'factoryPlans', 'endfield-my-builds', 'endfield-build-favorites'];
        keys.forEach(key => localStorage.removeItem(key));
        alert('All data has been cleared.');
        window.location.reload();
      }
    }
  };

  const [myBuilds, setMyBuilds] = useState<Build[]>([]);
  const [favoritedBuilds, setFavoritedBuilds] = useState<Build[]>([]);
  const [stats, setStats] = useState({ totalPulls: 0, achievementPercent: 0, tierListEntries: 0, buildsCount: 0, favoritesCount: 0 });

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

    // Load builds data
    const builds = getMyBuilds();
    setMyBuilds(builds);
    const favIds = getFavoriteBuildIds();
    const allBuilds = [...SAMPLE_BUILDS, ...builds.filter(b => b.isPublic)];
    const favBuilds = allBuilds.filter(b => favIds.includes(b.id));
    setFavoritedBuilds(favBuilds);

    setStats({ totalPulls, achievementPercent, tierListEntries, buildsCount: builds.length, favoritesCount: favIds.length });
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
      <div className="min-h-screen bg-[#0A0A0A] text-[var(--color-text-secondary)] flex items-center justify-center">
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
    <div className="min-h-screen bg-[#0A0A0A] text-[var(--color-text-secondary)] p-6">
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
                  {editingName ? (
                    <div className="mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          ref={nameInputRef}
                          type="text"
                          value={newUsername}
                          onChange={e => setNewUsername(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveDisplayName(); if (e.key === 'Escape') cancelEditingName(); }}
                          maxLength={30}
                          className="bg-[var(--color-surface-2)] border border-[var(--color-accent)] text-white text-2xl font-bold px-3 py-1.5 focus:outline-none w-full max-w-xs"
                          placeholder="Display name..."
                          disabled={savingName}
                        />
                        <button onClick={saveDisplayName} disabled={savingName}
                          className="p-2 text-green-400 hover:bg-green-500/10 disabled:opacity-50">
                          {savingName ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        </button>
                        <button onClick={cancelEditingName} disabled={savingName}
                          className="p-2 text-[var(--color-text-tertiary)] hover:text-white disabled:opacity-50">
                          <X size={18} />
                        </button>
                      </div>
                      {nameError && <p className="text-red-400 text-xs mt-1">{nameError}</p>}
                      <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">{newUsername.length}/30 characters</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-bold text-white">
                        {user.username || user.email?.split('@')[0] || 'User'}
                      </h2>
                      <button onClick={startEditingName}
                        className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors" title="Edit display name">
                        <Pencil size={16} />
                      </button>
                    </div>
                  )}
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
                  <button onClick={startEditingName} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl p-4 hover:border-[var(--color-accent)] transition-colors text-left w-full">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-[var(--color-accent)]" />
                      <div className="flex-1">
                        <div className="text-xs text-[var(--color-text-tertiary)]">Display Name</div>
                        <div className="text-white font-medium">
                          {user.username || 'Not set'}
                        </div>
                      </div>
                      <Pencil size={14} className="text-[var(--color-text-tertiary)]" />
                    </div>
                  </button>

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

            {/* Your Builds Section */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-xl flex items-center gap-2">
                  <Hammer size={20} className="text-[var(--color-accent)]" />
                  Your Builds
                </h3>
                <Link href="/builds" className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1">
                  View All <Eye size={12} />
                </Link>
              </div>

              {myBuilds.length === 0 && favoritedBuilds.length === 0 ? (
                <div className="text-center py-8">
                  <Hammer size={32} className="mx-auto mb-3 text-[var(--color-text-tertiary)] opacity-30" />
                  <p className="text-sm text-[var(--color-text-tertiary)] mb-3">No builds created or bookmarked yet.</p>
                  <Link href="/builds" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold clip-corner-tl transition-colors">
                    <Plus size={14} /> Create Your First Build
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Created builds */}
                  {myBuilds.length > 0 && (
                    <div>
                      <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wide mb-2">Created ({myBuilds.length})</p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {myBuilds.slice(0, 4).map(build => (
                          <Link key={build.id} href={`/builds/${build.id}`}
                            className="flex items-center gap-3 p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors no-underline">
                            <div className="flex -space-x-2">
                              {build.characters.slice(0, 3).map((bc, i) => {
                                const icon = CHARACTER_ICONS[bc.name];
                                const rarity = CHARACTERS.find(c => c.Name === bc.name)?.Rarity || 4;
                                return (
                                  <div key={i} className="w-8 h-8 relative bg-black/30 border border-[var(--color-surface)]" style={{ borderBottom: `2px solid ${RARITY_COLORS[rarity]}`, zIndex: 3 - i }}>
                                    {icon ? <Image src={icon} alt={bc.name} fill className="object-cover" unoptimized sizes="32px" /> : null}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white font-bold truncate">{build.name}</p>
                              <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-tertiary)]">
                                <span className={build.type === 'team' ? 'text-blue-400' : 'text-green-400'}>{build.type === 'team' ? 'TEAM' : 'SINGLE'}</span>
                                {build.isPublic ? <Globe size={8} /> : <Lock size={8} />}
                                {build.youtubeUrl && <Play size={8} className="text-red-400" />}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      {myBuilds.length > 4 && (
                        <Link href="/builds" className="block text-center text-xs text-[var(--color-accent)] hover:underline mt-2">
                          +{myBuilds.length - 4} more builds
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Favorited builds */}
                  {favoritedBuilds.length > 0 && (
                    <div>
                      <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Bookmark size={10} /> Bookmarked ({favoritedBuilds.length})
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {favoritedBuilds.slice(0, 4).map(build => (
                          <Link key={build.id} href={`/builds/${build.id}`}
                            className="flex items-center gap-3 p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors no-underline">
                            <div className="flex -space-x-2">
                              {build.characters.slice(0, 3).map((bc, i) => {
                                const icon = CHARACTER_ICONS[bc.name];
                                const rarity = CHARACTERS.find(c => c.Name === bc.name)?.Rarity || 4;
                                return (
                                  <div key={i} className="w-8 h-8 relative bg-black/30 border border-[var(--color-surface)]" style={{ borderBottom: `2px solid ${RARITY_COLORS[rarity]}`, zIndex: 3 - i }}>
                                    {icon ? <Image src={icon} alt={bc.name} fill className="object-cover" unoptimized sizes="32px" /> : null}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white font-bold truncate">{build.name}</p>
                              <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-tertiary)]">
                                <span>by {build.author || 'Community'}</span>
                                <span className="flex items-center gap-0.5"><Heart size={8} className="text-red-400" /> {build.likes}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Saved Data Summary */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h3 className="font-bold text-white text-xl mb-4">Saved Data Summary</h3>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl p-4 text-center">
                  <div className="text-3xl font-bold text-[var(--color-accent)] mb-1">
                    {stats.totalPulls}
                  </div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">Pulls Tracked</div>
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
                  <div className="text-xs text-[var(--color-text-tertiary)]">Tier Entries</div>
                </div>

                <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl p-4 text-center">
                  <div className="text-3xl font-bold text-[var(--color-accent)] mb-1">
                    {stats.buildsCount}
                  </div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">Builds</div>
                </div>

                <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl p-4 text-center">
                  <div className="text-3xl font-bold text-[var(--color-accent)] mb-1">
                    {stats.favoritesCount}
                  </div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">Bookmarks</div>
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
                <button onClick={startEditingName} className="w-full py-3 px-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-3 text-left">
                  <Settings className="w-5 h-5 text-[var(--color-accent)]" />
                  <span>Edit Display Name</span>
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
