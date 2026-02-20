import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || '';

// In-memory cache for GET listings (5 min TTL)
let listCache: { data: unknown; ts: number } | null = null;
const LIST_TTL = 5 * 60 * 1000;

interface StrapiTierList {
  id: number;
  documentId: string;
  Title: string;
  Slug: string;
  Category: string;
  Rankings: Record<string, string[]>;
  Author: string;
  Description?: string;
  Upvotes: number;
  IsOfficial: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get('category');
  const sort = searchParams.get('sort') || 'Upvotes:desc';
  const page = searchParams.get('page') || '1';
  const pageSize = searchParams.get('pageSize') || '25';

  const cacheKey = `${category}-${sort}-${page}-${pageSize}`;
  const now = Date.now();

  // Return cached data if fresh and matches params
  if (listCache && now - listCache.ts < LIST_TTL && (listCache.data as { cacheKey?: string }).cacheKey === cacheKey) {
    const { cacheKey: _ck, ...data } = listCache.data as Record<string, unknown>;
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    // Filter by Status (approved by default) — pending/rejected hidden from public
    let filterStr = '&filters[Status][$eq]=approved';
    if (category && category !== 'All') {
      filterStr += `&filters[Category][$eq]=${encodeURIComponent(category)}`;
    }

    const url = `${STRAPI_URL}/api/tier-lists?populate=*&sort=${sort}&pagination[page]=${page}&pagination[pageSize]=${pageSize}${filterStr}`;
    const fetchOpts = {
      headers: {
        'User-Agent': 'ZeroSanity/1.0',
        'Accept': 'application/json',
      },
      next: { revalidate: 300 } as Record<string, unknown>,
    };
    let res = await fetch(url, fetchOpts);

    // If Status field doesn't exist on live schema yet, retry without Status filter
    if (res.status === 400 && filterStr.includes('filters[Status]')) {
      const fallbackFilter = filterStr.replace(/&filters\[Status\]\[\$eq\]=[^&]*/g, '');
      const fallbackUrl = `${STRAPI_URL}/api/tier-lists?populate=*&sort=${sort}&pagination[page]=${page}&pagination[pageSize]=${pageSize}${fallbackFilter}`;
      res = await fetch(fallbackUrl, fetchOpts);
    }

    if (!res.ok) {
      throw new Error(`Strapi responded with ${res.status}`);
    }

    const json = await res.json();
    const items = (json.data || []).map((item: StrapiTierList) => ({
      id: item.id,
      documentId: item.documentId,
      title: item.Title,
      slug: item.Slug,
      category: item.Category,
      rankings: item.Rankings,
      author: item.Author,
      description: item.Description,
      upvotes: item.Upvotes || 0,
      isOfficial: item.IsOfficial || false,
      createdAt: item.createdAt,
    }));

    const pagination = json.meta?.pagination || { page: 1, pageSize: 25, pageCount: 1, total: 0 };

    const responseData = { data: items, pagination };
    listCache = { data: { ...responseData, cacheKey }, ts: now };

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to fetch community tier lists:', error);

    // Return stale cache if available
    if (listCache) {
      const { cacheKey: _ck, ...data } = listCache.data as Record<string, unknown>;
      return NextResponse.json(data, {
        headers: { 'Cache-Control': 'public, s-maxage=60' },
      });
    }

    return NextResponse.json(
      { data: [], pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 } },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Validate auth token
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Verify token with Strapi
    const userRes = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userRes.ok) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const user = await userRes.json();
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.category || !body.rankings) {
      return NextResponse.json({ error: 'Missing required fields: title, category, rankings' }, { status: 400 });
    }

    const validCategories = ['Overall', 'DPS', 'Support', 'Tank', 'PvE', 'Boss', 'Factory'];
    if (!validCategories.includes(body.category)) {
      return NextResponse.json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` }, { status: 400 });
    }

    // Create tier list in Strapi — always pending until admin approves
    const baseData: Record<string, unknown> = {
      Title: body.title.slice(0, 100),
      Category: body.category,
      Rankings: body.rankings,
      Author: user.username || 'Anonymous',
      Description: body.description?.slice(0, 500) || '',
      Upvotes: 0,
      IsOfficial: false,
      publishedAt: new Date().toISOString(),
    };

    const postHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // Try with Status field first; if schema doesn't have it yet, retry without
    let createRes = await fetch(`${STRAPI_URL}/api/tier-lists`, {
      method: 'POST',
      headers: postHeaders,
      body: JSON.stringify({ data: { ...baseData, Status: 'pending' } }),
    });

    if (createRes.status === 400) {
      const errBody = await createRes.text();
      if (errBody.includes('Invalid key Status')) {
        createRes = await fetch(`${STRAPI_URL}/api/tier-lists`, {
          method: 'POST',
          headers: postHeaders,
          body: JSON.stringify({ data: baseData }),
        });
      }
    }

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error('Strapi create failed:', createRes.status, errText);
      return NextResponse.json({ error: 'Failed to save tier list' }, { status: 502 });
    }

    const created = await createRes.json();

    // Invalidate cache
    listCache = null;

    return NextResponse.json({
      success: true,
      data: {
        id: created.data.id,
        documentId: created.data.documentId,
        title: created.data.Title,
        slug: created.data.Slug,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create community tier list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
