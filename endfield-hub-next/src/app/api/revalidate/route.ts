import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

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
  const secret = request.headers.get('x-revalidation-secret');
  if (secret !== process.env.REVALIDATION_SECRET) {
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
