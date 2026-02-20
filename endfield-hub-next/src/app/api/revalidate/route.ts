import { revalidateTag } from 'next/cache';
import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// Rate limit: max 30 revalidation webhook calls per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 60;
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

/**
 * Strapi webhook endpoint for on-demand ISR revalidation.
 *
 * Configure in Strapi Cloud:
 *   URL: https://zerosanity.app/api/revalidate
 *   Headers: { "x-revalidation-secret": "<REVALIDATION_SECRET>" }
 *   Events: entry.create, entry.update, entry.delete, entry.publish, entry.unpublish
 *
 * The webhook body from Strapi includes the model name, which we map to a cache tag.
 */
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }

  const secret = request.headers.get('x-revalidation-secret');
  const expected = process.env.REVALIDATION_SECRET;
  if (
    !secret ||
    !expected ||
    secret.length !== expected.length ||
    !timingSafeEqual(Buffer.from(secret), Buffer.from(expected))
  ) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Strapi v4/v5 webhook payload: { event, model, entry }
    const model: string = body.model || '';

    // Map Strapi model names to our fetch cache tags
    const tagMap: Record<string, string[]> = {
      blueprint: ['blueprints'],
      character: ['characters'],
      weapon: ['weapons'],
      'equipment-set': ['equipment-sets'],
      guide: ['guides'],
      recipe: ['recipes'],
      achievement: ['achievements'],
      'map-marker': ['map-markers'],
      banner: ['banners'],
      material: ['materials'],
      skill: ['skills'],
      'tier-list': ['tier-lists'],
      'user-datum': ['user-data'],
    };

    const tags = tagMap[model] || [model];

    for (const tag of tags) {
      revalidateTag(tag, { expire: 0 });
    }

    return NextResponse.json({
      revalidated: true,
      tags,
      model,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { message: 'Error revalidating', error: String(err) },
      { status: 500 }
    );
  }
}
