import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080c12]">
      <div className="flex flex-col items-center gap-6 max-w-md px-6">
        <div className="text-center space-y-2">
          <div className="relative inline-block">
            <h1 className="text-8xl font-bold text-[var(--color-accent)]">404</h1>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-[var(--color-accent)] rotate-45"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-[var(--color-accent)] rotate-45"></div>
          </div>
          <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
          <p className="text-[var(--color-text-secondary)] text-sm">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-[var(--color-surface)] text-[var(--color-accent)] font-medium clip-corner-tl border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
