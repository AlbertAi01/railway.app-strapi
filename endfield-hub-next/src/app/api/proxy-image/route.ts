import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = ['endfield.wiki.gg', 'endfieldtools.dev'];

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const parsed = new URL(url);
    if (!ALLOWED_HOSTS.some(host => parsed.hostname.endsWith(host))) {
      return NextResponse.json({ error: 'Host not allowed' }, { status: 403 });
    }

    const response = await fetch(url, {
      headers: { 'User-Agent': 'ZeroSanity/1.0' },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}
