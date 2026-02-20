import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || '';

// Rate limit: max 5 blueprint submissions per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
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

const VALID_CATEGORIES = ['Production', 'Processing', 'Assembly', 'Power', 'Storage', 'Complete Chain', 'Compact', 'Megafactory'];
const VALID_COMPLEXITIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const VALID_REGIONS = ['Asia', 'NA / EU', 'CN'];

/** GET: Public listing — approved by default, supports status=pending|all for admin views */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get('category');
  const page = searchParams.get('page') || '1';
  const pageSize = searchParams.get('pageSize') || '100';
  const status = searchParams.get('status') || 'approved';

  // When showing all statuses, sort pending first then by newest
  const defaultSort = status === 'all' ? 'Status:asc,createdAt:desc' : 'Upvotes:desc';
  const sort = searchParams.get('sort') || defaultSort;

  try {
    let filterStr = '';
    if (status !== 'all') {
      filterStr = `&filters[Status][$eq]=${encodeURIComponent(status)}`;
    }
    if (category) {
      filterStr += `&filters[Category][$eq]=${encodeURIComponent(category)}`;
    }

    const url = `${STRAPI_URL}/api/blueprints?populate=*&sort=${sort}&pagination[page]=${page}&pagination[pageSize]=${pageSize}${filterStr}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ZeroSanity/1.0', Accept: 'application/json' },
      next: { revalidate: 300, tags: ['blueprints'] },
    });

    if (!res.ok) throw new Error(`Strapi responded with ${res.status}`);
    const json = await res.json();

    return NextResponse.json(json, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Failed to fetch blueprints:', error);
    return NextResponse.json({ data: [], meta: { pagination: { total: 0 } } }, { status: 502 });
  }
}

/** POST: Authenticated blueprint submission — always sets Status to 'pending' */
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
    // Verify token with Strapi
    const userRes = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userRes.ok) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const user = await userRes.json();
    const body = await request.json();

    if (!body.Title?.trim() || !body.ImportString?.trim()) {
      return NextResponse.json({ error: 'Title and ImportString are required' }, { status: 400 });
    }

    if (body.Category && !VALID_CATEGORIES.includes(body.Category)) {
      return NextResponse.json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 });
    }

    if (body.Complexity && !VALID_COMPLEXITIES.includes(body.Complexity)) {
      return NextResponse.json({ error: `Invalid complexity. Must be one of: ${VALID_COMPLEXITIES.join(', ')}` }, { status: 400 });
    }

    if (body.Region && !VALID_REGIONS.includes(body.Region)) {
      return NextResponse.json({ error: `Invalid region. Must be one of: ${VALID_REGIONS.join(', ')}` }, { status: 400 });
    }

    const strapiPayload = {
      data: {
        Title: body.Title.trim().slice(0, 100),
        Description: (body.Description || '').trim().slice(0, 2000),
        DetailDescription: (body.DetailDescription || '').trim().slice(0, 5000),
        ImportString: body.ImportString.trim().slice(0, 50000),
        ImportCodes: body.ImportCodes || [],
        Region: body.Region || 'NA / EU',
        Author: user.username || 'Anonymous',
        Tags: Array.isArray(body.Tags) ? body.Tags.slice(0, 10).map((t: string) => String(t).slice(0, 50)) : [],
        Operators: Array.isArray(body.Operators) ? body.Operators.slice(0, 10).map((o: string) => String(o).slice(0, 50)) : [],
        PreviewImage: (body.PreviewImage || '').trim().slice(0, 500),
        ProductName: (body.ProductName || '').trim().slice(0, 100),
        Category: body.Category || 'Production',
        Complexity: body.Complexity || 'Beginner',
        OutputsData: body.OutputsData || [],
        // Always enforce pending status and zero upvotes on submission
        Status: 'pending',
        Upvotes: 0,
        SubmittedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      },
    };

    const createRes = await fetch(`${STRAPI_URL}/api/blueprints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(strapiPayload),
    });

    if (!createRes.ok) {
      const errBody = await createRes.text();
      console.error('Strapi blueprint create failed:', createRes.status, errBody);
      return NextResponse.json({ error: 'Failed to save blueprint' }, { status: 502 });
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
    console.error('Failed to create blueprint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
