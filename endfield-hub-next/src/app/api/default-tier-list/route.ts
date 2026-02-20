import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || '';

// In-memory cache with 15-minute TTL
let cache: { data: unknown; ts: number } | null = null;
const TTL = 15 * 60 * 1000;

interface TierEntry {
  slug: string;
  name: string;
  tier: string;
  element: string;
  role: string;
}

interface StrapiDefaultTierList {
  id: number;
  tierSS: TierEntry[];
  tierS: TierEntry[];
  tierA: TierEntry[];
  tierB: TierEntry[];
  tierC: TierEntry[];
  tierD: TierEntry[];
  lastUpdated?: string;
  description?: string;
}

interface DefaultTierListResponse {
  SS: TierEntry[];
  S: TierEntry[];
  A: TierEntry[];
  B: TierEntry[];
  C: TierEntry[];
  D: TierEntry[];
  lastUpdated?: string;
  description?: string;
}

export async function GET() {
  const now = Date.now();

  // Return cached data if available and fresh
  if (cache && now - cache.ts < TTL) {
    return NextResponse.json(cache.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const url = `${STRAPI_URL}/api/default-tier-list?populate=*`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ZeroSanity/1.0',
        'Accept': 'application/json',
      },
      next: { revalidate: 900 },
    });

    if (!res.ok) {
      throw new Error(`Strapi responded with ${res.status}`);
    }

    const json = await res.json();
    const strapiData: StrapiDefaultTierList = json.data;

    // Transform Strapi response to frontend format
    const formattedData: DefaultTierListResponse = {
      SS: strapiData.tierSS || [],
      S: strapiData.tierS || [],
      A: strapiData.tierA || [],
      B: strapiData.tierB || [],
      C: strapiData.tierC || [],
      D: strapiData.tierD || [],
      lastUpdated: strapiData.lastUpdated,
      description: strapiData.description,
    };

    cache = { data: formattedData, ts: now };

    return NextResponse.json(formattedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to fetch default tier list from Strapi:', error);

    // Return stale cache if available
    if (cache) {
      return NextResponse.json(cache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=60',
          'Content-Type': 'application/json',
        },
      });
    }

    // Fallback to empty tier list
    const fallback: DefaultTierListResponse = {
      SS: [],
      S: [],
      A: [],
      B: [],
      C: [],
      D: [],
    };

    return NextResponse.json(fallback, {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
