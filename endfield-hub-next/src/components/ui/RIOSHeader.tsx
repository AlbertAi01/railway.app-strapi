'use client';

interface RIOSHeaderProps {
  title: string;
  subtitle?: string;
  category?: string;
  classification?: string;
  code?: string;
  icon?: React.ReactNode;
}

export default function RIOSHeader({
  title,
  subtitle,
  category = 'GENERAL',
  classification = 'PUBLIC',
  code,
  icon,
}: RIOSHeaderProps) {
  const dateStr = new Date()
    .toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\//g, '.');

  return (
    <div className="mb-8 relative">
      <div className="border-l-4 border-[var(--color-accent)] bg-[var(--color-surface)] p-5 pr-20 sm:pr-24 clip-corner-tr">
        {/* Classification bar */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <span className="diamond diamond-sm" />
            <span className="terminal-text text-[var(--color-text-tertiary)]">
              {classification}
            </span>
            {code && (
              <>
                <span className="text-[var(--color-border)] hidden sm:inline">|</span>
                <span className="terminal-text text-[var(--color-text-tertiary)] hidden sm:inline">
                  {code}
                </span>
              </>
            )}
          </div>
          <span className="terminal-text text-[var(--color-text-tertiary)] hidden sm:inline">
            {dateStr}
          </span>
        </div>

        {/* Title */}
        <div className="flex items-start gap-4">
          {icon && (
            <div className="text-[var(--color-accent)] mt-1 flex-shrink-0">{icon}</div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-tactical tracking-wide uppercase leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Right vertical category bar */}
      <div className="absolute right-0 top-0 bottom-0 w-14 sm:w-16 bg-[var(--color-surface-2)] border-l border-[var(--color-border)] flex items-center justify-center">
        <span
          className="terminal-text text-[9px] text-[var(--color-accent)] whitespace-nowrap opacity-80"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            letterSpacing: '0.15em',
          }}
        >
          {category}
        </span>
      </div>
    </div>
  );
}
