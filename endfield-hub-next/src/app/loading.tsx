export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Arknights-coded Originium loading spinner */}
        <div className="relative">
          <div className="diamond-spinner" />
          {/* Outer ring markers */}
          <div className="absolute -inset-4 border border-[var(--color-border)] rotate-45 opacity-30" />
          <div className="absolute -inset-6 border border-[var(--color-border)] rotate-45 opacity-15" />
          {/* Corner ticks */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-px h-3 bg-[var(--color-originium)] opacity-40" />
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-px h-3 bg-[var(--color-originium)] opacity-40" />
          <div className="absolute top-1/2 -left-8 -translate-y-1/2 w-3 h-px bg-[var(--color-originium)] opacity-40" />
          <div className="absolute top-1/2 -right-8 -translate-y-1/2 w-3 h-px bg-[var(--color-originium)] opacity-40" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="terminal-text-lg text-[var(--color-originium)]">
            LOADING DATA
          </p>
          <p className="terminal-text-sm text-[var(--color-text-muted)]">
            PRTS SYNC IN PROGRESS
          </p>
        </div>
      </div>
    </div>
  );
}
