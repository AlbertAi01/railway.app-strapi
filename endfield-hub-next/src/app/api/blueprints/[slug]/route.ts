import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || '';

/** GET: Fetch a single blueprint by Slug (approved only for public) */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }

  try {
    const url = `${STRAPI_URL}/api/blueprints?filters[Slug][$eq]=${encodeURIComponent(slug)}&filters[Status][$eq]=approved&populate=*`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ZeroSanity/1.0', Accept: 'application/json' },
      next: { revalidate: 60, tags: ['blueprints'] } as Record<string, unknown>,
    });

    if (!res.ok) throw new Error(`Strapi responded with ${res.status}`);
    const json = await res.json();

    if (!json.data || json.data.length === 0) {
      return NextResponse.json({ data: null }, { status: 404 });
    }

    return NextResponse.json({ data: json.data[0] }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Failed to fetch blueprint by slug:', error);
    return NextResponse.json({ data: null }, { status: 502 });
  }
}
