'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function AuthCallbackPage({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleProviderCallback } = useAuthStore();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get('access_token');

        if (!accessToken) {
          throw new Error('No access token received from provider');
        }

        await handleProviderCallback(resolvedParams.provider, accessToken);

        setStatus('success');

        // Redirect to the page the user was on before login, or profile as fallback
        const returnTo = sessionStorage.getItem('endfield-return-to') || '/profile';
        sessionStorage.removeItem('endfield-return-to');
        // Security: only allow relative paths
        const safeReturnTo = returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/profile';
        setTimeout(() => {
          router.push(safeReturnTo);
        }, 2000);
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Authentication failed');

        // Redirect to login after error display
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [resolvedParams.provider, searchParams, handleProviderCallback, router]);

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-8 text-center shadow-[var(--shadow-card)]">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-[var(--color-accent)] animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3 font-tactical uppercase tracking-wide">Completing Sign In</h2>
              <p className="text-[var(--color-text-secondary)] text-[15px]">
                Authenticating with {resolvedParams.provider}...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3 font-tactical uppercase tracking-wide">Success!</h2>
              <p className="text-[var(--color-text-secondary)] text-[15px] mb-4">
                You have been successfully authenticated.
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Redirecting...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3 font-tactical uppercase tracking-wide">Authentication Failed</h2>
              <p className="text-red-400 text-[15px] mb-4">{error}</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Redirecting to login page...
              </p>
            </>
          )}
        </div>

        <div className="mt-6 text-center text-sm">
          <p className="text-[var(--color-text-muted)]">
            If you are not redirected automatically,{' '}
            <button
              onClick={() => {
                if (status === 'success') {
                  const returnTo = sessionStorage.getItem('endfield-return-to') || '/profile';
                  sessionStorage.removeItem('endfield-return-to');
                  const safeReturnTo = returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/profile';
                  router.push(safeReturnTo);
                } else {
                  router.push('/login');
                }
              }}
              className="text-[var(--color-accent)] hover:underline"
            >
              click here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
