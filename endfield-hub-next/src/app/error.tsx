'use client';

import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
      <div className="flex flex-col items-center gap-6 max-w-md px-6">
        <div className="relative">
          <div className="bg-[var(--color-surface)] p-4 border border-[var(--color-border)] clip-corner-tl">
            <AlertCircle className="w-12 h-12 text-[var(--color-accent)]" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--color-accent)] rotate-45"></div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
          <p className="text-[var(--color-text-secondary)] text-sm">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[var(--color-accent)] text-black font-medium clip-corner-tl hover:bg-[var(--color-accent)]/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
