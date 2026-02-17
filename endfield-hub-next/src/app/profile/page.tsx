'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { User, Mail, Calendar, LogOut, Settings, Shield } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
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
      <div className="max-w-4xl mx-auto">
        <RIOSHeader
          title="Operator Profile"
          category="ACCOUNT"
          code="RIOS-PROF-001"
          icon={<User size={28} />}
        />

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-2 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-8">
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
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-500/50 rounded-full text-green-400 text-sm">
                    <Shield className="w-4 h-4" />
                    Verified Account
                  </div>
                )}
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-4">
              <h3 className="font-bold text-white text-xl mb-4">Account Details</h3>

              <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-[var(--color-accent)]" />
                    <div>
                      <div className="text-sm text-[var(--color-text-tertiary)]">Username</div>
                      <div className="text-white font-medium">
                        {user.username || 'Not set'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[var(--color-accent)]" />
                    <div>
                      <div className="text-sm text-[var(--color-text-tertiary)]">Email</div>
                      <div className="text-white font-medium">{user.email}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[var(--color-accent)]" />
                    <div>
                      <div className="text-sm text-[var(--color-text-tertiary)]">Member Since</div>
                      <div className="text-white font-medium">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {user.provider && (
                <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-[var(--color-accent)]" />
                      <div>
                        <div className="text-sm text-[var(--color-text-tertiary)]">Authentication Provider</div>
                        <div className="text-white font-medium capitalize">{user.provider}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h3 className="font-bold text-white mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <button className="w-full py-3 px-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent)] transition-colors flex items-center gap-3 text-left">
                  <Settings className="w-5 h-5 text-[var(--color-accent)]" />
                  <span>Edit Profile</span>
                </button>

                <button className="w-full py-3 px-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent)] transition-colors flex items-center gap-3 text-left">
                  <Shield className="w-5 h-5 text-[var(--color-accent)]" />
                  <span>Security Settings</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full py-3 px-4 bg-red-900/20 border border-red-500/50 rounded-lg hover:bg-red-900/30 transition-colors flex items-center gap-3 text-left text-red-400"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h3 className="font-bold text-white mb-4">Statistics</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Guides Read</span>
                  <span className="text-[var(--color-accent)] font-bold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tools Used</span>
                  <span className="text-[var(--color-accent)] font-bold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tier Lists Created</span>
                  <span className="text-[var(--color-accent)] font-bold">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
          <h3 className="font-bold text-white mb-4">About Your Account</h3>
          <p className="text-sm">
            Your account data is stored securely and is never shared with third parties.
            You can delete your account at any time from the security settings.
          </p>
        </div>
      </div>
    </div>
  );
}
