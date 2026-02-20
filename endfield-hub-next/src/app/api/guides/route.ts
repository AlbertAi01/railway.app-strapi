import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || '';

// Rate limit: max 3 guide submissions per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

const VALID_CATEGORIES = ['Beginner', 'Combat', 'Factory', 'Character Build', 'Equipment', 'Exploration', 'Endgame', 'Farming', 'Tips & Tricks'];
const VALID_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

/** GET: Public listing — only approved guides */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get('category');
  const sort = searchParams.get('sort') || 'createdAt:desc';
  const page = searchParams.get('page') || '1';
  const pageSize = searchParams.get('pageSize') || '100';
  const status = searchParams.get('status') || 'approved';

  try {
    let filterStr = `&filters[Status][$eq]=${encodeURIComponent(status)}`;
    if (category) {
      filterStr += `&filters[Category][$eq]=${encodeURIComponent(category)}`;
    }

    const url = `${STRAPI_URL}/api/guides?populate=*&sort=${sort}&pagination[page]=${page}&pagination[pageSize]=${pageSize}${filterStr}`;
    const fetchOpts = {
      headers: { 'User-Agent': 'ZeroSanity/1.0', Accept: 'application/json' },
      next: { revalidate: 300, tags: ['guides'] } as Record<string, unknown>,
    };
    let res = await fetch(url, fetchOpts);

    // If Status field doesn't exist on live schema yet, retry without Status filter
    if (res.status === 400 && filterStr.includes('filters[Status]')) {
      const fallbackFilter = filterStr.replace(/&filters\[Status\]\[\$eq\]=[^&]*/g, '');
      const fallbackUrl = `${STRAPI_URL}/api/guides?populate=*&sort=${sort}&pagination[page]=${page}&pagination[pageSize]=${pageSize}${fallbackFilter}`;
      res = await fetch(fallbackUrl, fetchOpts);
    }

    if (!res.ok) throw new Error(`Strapi responded with ${res.status}`);
    const json = await res.json();

    return NextResponse.json(json, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Failed to fetch guides:', error);
    return NextResponse.json({ data: [], meta: { pagination: { total: 0 } } }, { status: 502 });
  }
}

/** POST: Authenticated guide submission — always sets Status to 'pending' */
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many submissions. Try again later.' }, { status: 429 });
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const userRes = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userRes.ok) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const user = await userRes.json();
    const body = await request.json();

    if (!body.Title?.trim() || !body.Content?.trim() || !body.Category || !body.Summary?.trim()) {
      return NextResponse.json({ error: 'Title, Content, Category, and Summary are required' }, { status: 400 });
    }

    if (!VALID_CATEGORIES.includes(body.Category)) {
      return NextResponse.json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 });
    }

    if (body.Difficulty && !VALID_DIFFICULTIES.includes(body.Difficulty)) {
      return NextResponse.json({ error: `Invalid difficulty. Must be one of: ${VALID_DIFFICULTIES.join(', ')}` }, { status: 400 });
    }

    const baseData: Record<string, unknown> = {
      Title: body.Title.trim().slice(0, 200),
      Content: body.Content.trim().slice(0, 50000),
      Summary: body.Summary.trim().slice(0, 500),
      Category: body.Category,
      Author: user.username || 'Anonymous',
      Tags: Array.isArray(body.Tags) ? body.Tags.slice(0, 15).map((t: string) => String(t).slice(0, 50)) : [],
      Difficulty: body.Difficulty || 'Beginner',
      IsVerified: false,
      Upvotes: 0,
      ViewCount: 0,
      publishedAt: new Date().toISOString(),
    };

    const postHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // Try with Status field; if schema doesn't have it yet, retry without
    let createRes = await fetch(`${STRAPI_URL}/api/guides`, {
      method: 'POST',
      headers: postHeaders,
      body: JSON.stringify({ data: { ...baseData, Status: 'pending' } }),
    });

    if (createRes.status === 400) {
      const errText = await createRes.text();
      if (errText.includes('Invalid key Status')) {
        createRes = await fetch(`${STRAPI_URL}/api/guides`, {
          method: 'POST',
          headers: postHeaders,
          body: JSON.stringify({ data: baseData }),
        });
      }
    }

    if (!createRes.ok) {
      const errBody = await createRes.text();
      console.error('Strapi guide create failed:', createRes.status, errBody);
      return NextResponse.json({ error: 'Failed to save guide' }, { status: 502 });
    }

    const created = await createRes.json();

    return NextResponse.json({
      success: true,
      data: {
        id: created.data.id,
        documentId: created.data.documentId,
        title: created.data.Title,
        slug: created.data.Slug,
        status: 'pending',
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create guide:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
