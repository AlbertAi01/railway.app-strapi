import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LogIn, Mail, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register' | 'magic'>('login');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [magicEmail, setMagicEmail] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const { login, register, loginWithProvider, sendMagicLink, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(identifier, password);
      navigate('/');
    } catch {}
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      navigate('/');
    } catch {}
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMagicLink(magicEmail);
      setMagicSent(true);
    } catch {}
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="text-center p-8 pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-[#FFE500]/10 rounded-full flex items-center justify-center">
              <LogIn size={32} className="text-[#FFE500]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {mode === 'login' ? 'Sign in to your account' : mode === 'register' ? 'Create a new account' : 'Sign in with email'}
            </h2>
            <p className="text-gray-500 text-sm">
              {mode === 'magic' ? 'We\'ll send a code to your email' : 'Choose your preferred sign-in method'}
            </p>
          </div>

          <div className="p-8 pt-4 space-y-4">
            {mode !== 'magic' && (
              <>
                {/* OAuth Providers */}
                <button
                  onClick={() => loginWithProvider('google')}
                  className="w-full flex items-center gap-3 justify-center px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#333] text-white font-medium hover:bg-[#222] transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Login or Register with Google
                </button>

                <button
                  onClick={() => loginWithProvider('discord')}
                  className="w-full flex items-center gap-3 justify-center px-4 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#5865F2' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Login or Register with Discord
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#333]" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#111] px-4 text-gray-500">OR</span>
                  </div>
                </div>
              </>
            )}

            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="text"
                  placeholder="Email or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#333] text-white placeholder-gray-600 focus:border-[#FFE500] focus:outline-none"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#333] text-white placeholder-gray-600 focus:border-[#FFE500] focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg bg-[#FFE500] text-black font-bold hover:bg-[#FFD700] transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#333] text-white placeholder-gray-600 focus:border-[#FFE500] focus:outline-none"
                  required
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#333] text-white placeholder-gray-600 focus:border-[#FFE500] focus:outline-none"
                  required
                />
                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#333] text-white placeholder-gray-600 focus:border-[#FFE500] focus:outline-none"
                  required
                  minLength={6}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg bg-[#FFE500] text-black font-bold hover:bg-[#FFD700] transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            )}

            {mode === 'magic' && !magicSent && (
              <form onSubmit={handleMagicLink} className="space-y-3">
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#333]">
                  <Mail size={18} className="text-gray-500" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={magicEmail}
                    onChange={(e) => setMagicEmail(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder-gray-600 focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg bg-[#FFE500] text-black font-bold hover:bg-[#FFD700] transition-colors disabled:opacity-50 flex items-center gap-2 justify-center"
                >
                  <Mail size={18} />
                  {isLoading ? 'Sending...' : 'Send code'}
                </button>
              </form>
            )}

            {mode === 'magic' && magicSent && (
              <div className="text-center py-4">
                <div className="mx-auto mb-3 w-12 h-12 bg-[#27AE60]/10 rounded-full flex items-center justify-center">
                  <Mail size={24} className="text-[#27AE60]" />
                </div>
                <p className="text-white font-medium mb-1">Check your inbox</p>
                <p className="text-gray-500 text-sm">We sent a login link to {magicEmail}</p>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Mode switcher */}
            <div className="text-center space-y-2 pt-2">
              {mode === 'login' && (
                <>
                  <button onClick={() => setMode('magic')} className="text-gray-500 text-sm hover:text-[#FFE500] transition-colors flex items-center gap-1 mx-auto">
                    <Mail size={14} /> Sign in with email link instead
                  </button>
                  <p className="text-gray-600 text-sm">
                    Don't have an account?{' '}
                    <button onClick={() => setMode('register')} className="text-[#FFE500] hover:underline">Register</button>
                  </p>
                </>
              )}
              {mode === 'register' && (
                <p className="text-gray-600 text-sm">
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="text-[#FFE500] hover:underline">Sign in</button>
                </p>
              )}
              {mode === 'magic' && (
                <button onClick={() => { setMode('login'); setMagicSent(false); }} className="text-gray-500 text-sm hover:text-[#FFE500] transition-colors flex items-center gap-1 mx-auto">
                  <ArrowLeft size={14} /> Back to sign in
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          By signing in, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}
