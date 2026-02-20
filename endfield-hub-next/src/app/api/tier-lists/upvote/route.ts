import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || '';

// Simple in-process rate limiter: max 5 upvotes per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

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

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { documentId, currentUpvotes } = body;

    if (!documentId) {
      return NextResponse.json({ error: 'documentId is required' }, { status: 400 });
    }

    const res = await fetch(`${STRAPI_URL}/api/tier-lists/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: { Upvotes: (currentUpvotes || 0) + 1 },
      }),
    });

    if (!res.ok) {
      throw new Error(`Strapi responded with ${res.status}`);
    }

    const updated = await res.json();

    return NextResponse.json({
      success: true,
      upvotes: updated.data?.Upvotes ?? (currentUpvotes || 0) + 1,
    });
  } catch (error) {
    console.error('Failed to upvote tier list:', error);
    return NextResponse.json({ error: 'Failed to upvote' }, { status: 500 });
  }
}
