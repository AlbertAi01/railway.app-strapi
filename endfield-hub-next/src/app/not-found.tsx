import Link from 'next/link';
import { Home, Users, Wrench, BookOpen, Map } from 'lucide-react';

export default function NotFound() {
  const popularPages = [
    { href: '/characters', label: 'Characters', icon: Users },
    { href: '/builds', label: 'Builds', icon: Wrench },
    { href: '/factory-planner', label: 'Factory Planner', icon: Map },
    { href: '/headhunt-tracker', label: 'Headhunt Tracker', icon: BookOpen },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
      <div className="flex flex-col items-center gap-6 max-w-2xl px-6">
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

        <div className="w-full space-y-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-surface)] text-[var(--color-accent)] font-medium clip-corner-tl border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors w-full"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>

          <div className="rios-card p-6">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Popular Pages
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {popularPages.map((page) => {
                const Icon = page.icon;
                return (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-surface)] text-[var(--color-text-secondary)] text-sm clip-corner-tl border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {page.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
