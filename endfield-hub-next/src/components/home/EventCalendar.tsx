'use client';

import { useEffect, useState, useCallback } from 'react';
import { Calendar, Clock, Copy, Check, Gift } from 'lucide-react';

/* ──────────────────────────────── Types ──────────────────────────────── */

interface GameEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string | null;
  coverImage?: string;
  url?: string;
  active: boolean;
  tintColor?: string | null;
}

interface RedeemCode {
  code: string;
  description: string;
  startDate: string;
  active: boolean;
}

interface HomePageData {
  events: GameEvent[];
  codes: RedeemCode[];
  lastUpdated: string;
}

/* ──────────────────────────────── Helpers ──────────────────────────────── */

function getTimeLeft(dateStr: string | null, mode: 'until' | 'since' = 'until'): string {
  if (!dateStr) return '';
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return '';
  const now = new Date();
  const diff = mode === 'until' ? target.getTime() - now.getTime() : now.getTime() - target.getTime();
  if (diff <= 0 && mode === 'until') return 'Ended';
  const absDiff = Math.abs(diff);
  const days = Math.floor(absDiff / 86400000);
  const hours = Math.floor((absDiff % 86400000) / 3600000);
  if (mode === 'since') {
    if (days > 0) return `Started ${days}d ago`;
    return `Started ${hours}h ago`;
  }
  // "until" — future
  if (days > 0) return `${days}d ${hours}h left`;
  const mins = Math.floor((absDiff % 3600000) / 60000);
  return `${hours}h ${mins}m left`;
}

function isUpcoming(event: GameEvent): boolean {
  return new Date(event.startDate) > new Date();
}

function isOngoing(event: GameEvent): boolean {
  const now = new Date();
  const start = new Date(event.startDate);
  if (start > now) return false;
  if (!event.endDate) return true;
  return new Date(event.endDate) > now;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ──────────────────────────────── Timeline ──────────────────────────────── */

const DEFAULT_TINT = '#FFD429';

function EventTimeline({ events }: { events: GameEvent[] }) {
  // Calculate timeline range: 3 days ago to max(end dates, 14 days from now)
  const now = new Date();
  const rangeStart = new Date(now.getTime() - 3 * 86400000);
  const futureDefault = new Date(now.getTime() + 28 * 86400000);

  let rangeEnd = futureDefault;
  for (const ev of events) {
    if (ev.endDate) {
      const end = new Date(ev.endDate);
      if (end > rangeEnd) rangeEnd = new Date(end.getTime() + 2 * 86400000);
    }
  }

  const totalMs = rangeEnd.getTime() - rangeStart.getTime();
  const totalDays = Math.ceil(totalMs / 86400000);

  // Generate date labels — roughly every 3 days
  const step = totalDays <= 21 ? 3 : totalDays <= 42 ? 5 : 7;
  const dateLabels: { date: Date; pct: number }[] = [];
  for (let i = 0; i <= totalDays; i += step) {
    const d = new Date(rangeStart.getTime() + i * 86400000);
    dateLabels.push({ date: d, pct: (i / totalDays) * 100 });
  }

  // "Now" marker
  const nowPct = ((now.getTime() - rangeStart.getTime()) / totalMs) * 100;

  // Sort events: ongoing first (by start), then upcoming
  const sorted = [...events].sort((a, b) => {
    const aOn = isOngoing(a);
    const bOn = isOngoing(b);
    if (aOn !== bOn) return aOn ? -1 : 1;
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  return (
    <div className="relative overflow-x-auto">
      {/* Date axis */}
      <div className="relative h-8 border-b border-[var(--color-border)] mb-1 min-w-[600px]">
        {dateLabels.map((dl, i) => (
          <div
            key={i}
            className="absolute top-0 text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider"
            style={{ left: `${dl.pct}%`, transform: 'translateX(-50%)' }}
          >
            {dl.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        ))}
        {/* Now indicator */}
        <div
          className="absolute top-0 bottom-0 w-px bg-[var(--color-accent)]"
          style={{ left: `${nowPct}%` }}
        >
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--color-accent)] rotate-45" />
        </div>
      </div>

      {/* Event bars */}
      <div className="flex flex-col gap-1 min-w-[600px]">
        {sorted.map((event) => {
          const start = new Date(event.startDate);
          const end = event.endDate ? new Date(event.endDate) : rangeEnd;
          const leftPct = Math.max(0, ((start.getTime() - rangeStart.getTime()) / totalMs) * 100);
          const rightPct = Math.min(100, ((end.getTime() - rangeStart.getTime()) / totalMs) * 100);
          const widthPct = Math.max(1, rightPct - leftPct);
          const tint = event.tintColor || DEFAULT_TINT;
          const ongoing = isOngoing(event);
          const upcoming = isUpcoming(event);

          return (
            <div key={event.id} className="relative h-9 group">
              {/* Now line continues through bars */}
              <div
                className="absolute top-0 bottom-0 w-px bg-[var(--color-accent)]/30 z-10 pointer-events-none"
                style={{ left: `${nowPct}%` }}
              />
              {/* Bar */}
              <div
                className="absolute top-0.5 bottom-0.5 flex items-center overflow-hidden"
                style={{
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  backgroundColor: `${tint}22`,
                  borderLeft: `3px solid ${tint}`,
                  opacity: upcoming ? 0.65 : 1,
                }}
              >
                {/* Cover image (background) */}
                {event.coverImage && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url(/api/proxy-image?url=${encodeURIComponent(event.coverImage)})` }}
                  />
                )}
                {/* Content */}
                <div className="relative z-10 flex items-center gap-2 px-2.5 w-full min-w-0">
                  <span
                    className="text-[11px] font-semibold truncate"
                    style={{ color: tint }}
                  >
                    {event.name}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)] whitespace-nowrap ml-auto flex-shrink-0">
                    {upcoming
                      ? `Starts ${formatDate(event.startDate)}`
                      : ongoing
                        ? (event.endDate ? getTimeLeft(event.endDate) : 'Permanent')
                        : 'Ended'}
                  </span>
                </div>
              </div>
              {/* Tooltip on hover */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-14 hidden group-hover:flex z-30 pointer-events-none">
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-1.5 shadow-lg whitespace-nowrap">
                  <span className="text-[11px] font-semibold text-[var(--color-text-primary)]">{event.name}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] ml-2">
                    {formatDate(event.startDate)}
                    {event.endDate && ` — ${formatDate(event.endDate)}`}
                    {!event.endDate && ' — No end date'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────── Redeem Codes ──────────────────────────────── */

function RedeemCodes({ codes }: { codes: RedeemCode[] }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  }, []);

  if (codes.length === 0) return null;

  return (
    <div className="space-y-3">
      {codes.filter(c => c.active).map((code) => (
        <button
          key={code.code}
          onClick={() => copyCode(code.code)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all group cursor-pointer text-left"
        >
          <Gift size={16} className="text-[var(--color-accent)] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="font-mono text-sm font-bold text-[var(--color-accent)] tracking-wider">{code.code}</span>
            {code.description && code.description !== '?' && (
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 truncate">{code.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--color-text-muted)] flex-shrink-0">
            {copiedCode === code.code ? (
              <>
                <Check size={14} className="text-green-400" />
                <span className="text-green-400">COPIED</span>
              </>
            ) : (
              <>
                <Copy size={14} className="group-hover:text-[var(--color-accent)] transition-colors" />
                <span className="group-hover:text-[var(--color-accent)] transition-colors">COPY</span>
              </>
            )}
          </div>
        </button>
      ))}
      <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase tracking-wider">
        Redeem in-game: Settings &gt; Platform &amp; Account &gt; Exchange Code
      </p>
    </div>
  );
}

/* ──────────────────────────────── Main Component ──────────────────────────────── */

export default function EventCalendar() {
  const [data, setData] = useState<HomePageData | null>(null);
  const [error, setError] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    fetch('/api/events')
      .then(r => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then(d => setData(d))
      .catch(() => setError(true));
  }, []);

  // Tick every minute to update countdown timers
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  if (error) return null; // Graceful: hide if upstream is down

  if (!data) {
    return (
      <div className="space-y-8">
        {/* Events skeleton */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="diamond diamond-sm diamond-accent" />
            <h2 className="text-xl font-bold text-white font-tactical uppercase tracking-wide">Event Timeline</h2>
          </div>
          <div className="rios-card clip-corner-tl p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-8 bg-[var(--color-surface-2)] rounded" />
              <div className="h-9 bg-[var(--color-surface-2)] rounded w-3/4" />
              <div className="h-9 bg-[var(--color-surface-2)] rounded w-1/2" />
              <div className="h-9 bg-[var(--color-surface-2)] rounded w-5/6" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  const activeEvents = data.events.filter(e => e.active);
  const activeCodes = data.codes.filter(c => c.active);

  return (
    <div className="space-y-8">
      {/* Event Timeline */}
      {activeEvents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="diamond diamond-sm diamond-accent" />
              <h2 className="text-xl font-bold text-white font-tactical uppercase tracking-wide">
                <Calendar size={18} className="inline mr-2 -mt-0.5" />
                Event Timeline
              </h2>
              <span className="text-[10px] font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-2)] px-2 py-0.5 border border-[var(--color-border)]">
                {activeEvents.length} ACTIVE
              </span>
            </div>
            {data.lastUpdated && (
              <span className="text-[10px] font-mono text-[var(--color-text-muted)] hidden sm:inline-flex items-center gap-1">
                <Clock size={10} />
                Updated {new Date(data.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <div className="rios-card clip-corner-tl p-4 sm:p-6 overflow-hidden">
            <EventTimeline events={activeEvents} />
          </div>
        </section>
      )}

      {/* Redeem Codes */}
      {activeCodes.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="diamond diamond-sm diamond-accent" />
            <h2 className="text-xl font-bold text-white font-tactical uppercase tracking-wide">
              <Gift size={18} className="inline mr-2 -mt-0.5" />
              Redeem Codes
            </h2>
            <span className="text-[10px] font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-2)] px-2 py-0.5 border border-[var(--color-border)]">
              TAP TO COPY
            </span>
          </div>
          <div className="rios-card clip-corner-tl p-4 sm:p-6">
            <RedeemCodes codes={activeCodes} />
          </div>
        </section>
      )}
    </div>
  );
}
