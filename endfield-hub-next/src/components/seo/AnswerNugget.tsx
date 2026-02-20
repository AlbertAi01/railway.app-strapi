'use client';

export default function AnswerNugget({ text, lastUpdated }: { text: string; lastUpdated?: string }) {
  return (
    <div className="mb-6 p-4 border border-[var(--color-border)] bg-[var(--color-surface)] clip-corner-tl">
      <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{text}</p>
      {lastUpdated && (
        <p className="text-[var(--color-text-muted)] text-xs mt-2 font-mono">
          Last updated: {new Date(lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      )}
    </div>
  );
}
