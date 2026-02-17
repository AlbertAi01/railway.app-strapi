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
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-6 max-w-md px-6">
        <div className="rounded-full bg-[#111] p-4 border border-[#222]">
          <AlertCircle className="w-12 h-12 text-[#FFE500]" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
          <p className="text-gray-400 text-sm">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#FFE500] text-black font-medium rounded-lg hover:bg-[#FFE500]/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
