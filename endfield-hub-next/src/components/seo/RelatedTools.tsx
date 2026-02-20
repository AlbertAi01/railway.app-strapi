'use client';
import Link from 'next/link';

interface RelatedTool {
  name: string;
  path: string;
  desc: string;
}

export default function RelatedTools({ tools, title }: { tools: RelatedTool[]; title?: string }) {
  return (
    <div className="mt-10 pt-6 border-t border-[var(--color-border)]">
      <div className="flex items-center gap-2 mb-4">
        <span className="diamond diamond-sm diamond-accent" />
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] font-tactical uppercase tracking-wide">
          {title || 'Related Tools'}
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tools.map(tool => (
          <Link key={tool.path} href={tool.path} className="p-3 border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-colors clip-corner-tl no-underline">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{tool.name}</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">{tool.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
