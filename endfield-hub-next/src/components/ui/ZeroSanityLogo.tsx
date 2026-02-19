'use client';

/**
 * Zero Sanity brand logo — SVG-based, Arknights-inspired
 *
 * Design language:
 * - Diamond/Originium crystal as the core motif
 * - Angular, tactical military aesthetic
 * - "Z" monogram inside diamond form
 * - Warm amber (#FFD429) on dark surfaces, matching site palette
 * - Orange Originium corner-cut accents (#FF6B35)
 */

interface LogoProps {
  size?: number;
  variant?: 'icon' | 'full' | 'wordmark';
  className?: string;
}

/** Icon-only: Diamond "Z" monogram */
function LogoIcon({ size = 32 }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Zero Sanity"
    >
      {/* Outer diamond border (gold) */}
      <path d="M32 2 L62 32 L32 62 L2 32 Z" fill="#FFD429" />
      {/* Inner diamond face (dark) */}
      <path d="M32 6 L58 32 L32 58 L6 32 Z" fill="#0E0C09" />
      {/* Inner accent border line */}
      <path d="M32 10 L54 32 L32 54 L10 32 Z" fill="none" stroke="#FFD42930" strokeWidth="0.8" />
      {/* Top-left Originium corner cut */}
      <polygon points="11,28 11,24 15,28" fill="#FF6B35" opacity="0.9" />
      {/* Bottom-right Originium corner cut */}
      <polygon points="53,36 53,40 49,36" fill="#FF6B35" opacity="0.9" />
      {/* "Z" letterform — angular, bold */}
      <path d="M22 22h18v4.5L26 40h14v4H21v-4.5L35 26H22z" fill="#FFD429" />
    </svg>
  );
}

/** Full logo: Icon + "ZERO SANITY" wordmark */
function LogoFull({ size = 32 }: { size: number }) {
  const textSize = size * 0.55;
  const subSize = size * 0.3;
  return (
    <div className="flex items-center gap-2.5" style={{ height: size }}>
      <LogoIcon size={size} />
      <div className="flex flex-col justify-center leading-none">
        <span
          className="font-tactical tracking-[0.15em] text-white font-bold uppercase"
          style={{ fontSize: textSize, lineHeight: 1.1 }}
        >
          ZERO SANITY
        </span>
        <span
          className="terminal-text-sm text-[var(--color-text-muted)] tracking-[0.2em] mt-0.5"
          style={{ fontSize: subSize, lineHeight: 1 }}
        >
          ENDFIELD TOOLKIT
        </span>
      </div>
    </div>
  );
}

/** Wordmark only: "ZERO SANITY" styled text */
function LogoWordmark({ size = 32 }: { size: number }) {
  return (
    <div className="flex flex-col justify-center leading-none">
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block bg-[var(--color-accent)] rotate-45"
          style={{ width: size * 0.2, height: size * 0.2 }}
        />
        <span
          className="font-tactical tracking-[0.15em] text-white font-bold uppercase"
          style={{ fontSize: size * 0.6, lineHeight: 1 }}
        >
          ZERO SANITY
        </span>
      </div>
      <span
        className="terminal-text-sm text-[var(--color-text-muted)] tracking-[0.2em]"
        style={{ fontSize: size * 0.28, lineHeight: 1, marginLeft: size * 0.2 + 6, marginTop: 2 }}
      >
        ENDFIELD TOOLKIT
      </span>
    </div>
  );
}

export default function ZeroSanityLogo({ size = 32, variant = 'icon', className }: LogoProps) {
  return (
    <div className={className}>
      {variant === 'icon' && <LogoIcon size={size} />}
      {variant === 'full' && <LogoFull size={size} />}
      {variant === 'wordmark' && <LogoWordmark size={size} />}
    </div>
  );
}

export { LogoIcon, LogoFull, LogoWordmark };
