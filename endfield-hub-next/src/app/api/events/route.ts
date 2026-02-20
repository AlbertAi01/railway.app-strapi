import { NextResponse } from 'next/server';

const UPSTREAM = 'https://endfieldtools.dev/localdb/home-page.json';

// In-memory cache with 15-minute TTL
let cache: { data: unknown; ts: number } | null = null;
const TTL = 15 * 60 * 1000;

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.ts < TTL) {
    return NextResponse.json(cache.data, {
      headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800' },
    });
  }

  try {
    const res = await fetch(UPSTREAM, {
      headers: { 'User-Agent': 'ZeroSanity/1.0' },
      next: { revalidate: 900 },
    });

    if (!res.ok) {
      throw new Error(`Upstream ${res.status}`);
    }

    const data = await res.json();
    cache = { data, ts: now };

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800' },
    });
  } catch {
    // Return stale cache if available
    if (cache) {
      return NextResponse.json(cache.data, {
        headers: { 'Cache-Control': 'public, s-maxage=60' },
      });
    }
    return NextResponse.json(
      { events: [], codes: [], lastUpdated: new Date().toISOString() },
      { status: 502 }
    );
  }
}
