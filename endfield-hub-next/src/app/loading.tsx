export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="diamond-spinner" />
        <p className="terminal-text text-[var(--color-text-secondary)]">
          LOADING DATA...
        </p>
      </div>
    </div>
  );
}
