import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || '';

// ──── Helpers ────

async function verifyAuth(request: NextRequest): Promise<{ ok: true; user: { id: number; username: string } } | { ok: false; response: NextResponse }> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return { ok: false, response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
  }

  try {
    const userRes = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userRes.ok) {
      return { ok: false, response: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) };
    }

    const user = await userRes.json();
    return { ok: true, user: { id: user.id, username: user.username } };
  } catch {
    return { ok: false, response: NextResponse.json({ error: 'Auth verification failed' }, { status: 500 }) };
  }
}

interface StrapiComment {
  id: number;
  documentId: string;
  poiId: string;
  mapId: string;
  text: string;
  author: string;
  authorId: number;
  screenshots: string[];
  upvotes: number;
  downvotes: number;
  isPinned: boolean;
  parentCommentId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ──── GET: Fetch comments for a POI ────

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const poiId = searchParams.get('poiId');
  const mapId = searchParams.get('mapId');

  if (!poiId || !mapId) {
    return NextResponse.json({ error: 'Missing required params: poiId, mapId' }, { status: 400 });
  }

  try {
    const url = `${STRAPI_URL}/api/poi-comments?filters[poiId][$eq]=${encodeURIComponent(poiId)}&filters[mapId][$eq]=${encodeURIComponent(mapId)}&sort=createdAt:desc&pagination[pageSize]=100`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ZeroSanity/1.0', 'Accept': 'application/json' },
      next: { revalidate: 30 } as Record<string, unknown>,
    });

    if (!res.ok) {
      throw new Error(`Strapi responded with ${res.status}`);
    }

    const json = await res.json();
    const comments = (json.data || []).map((item: StrapiComment) => ({
      id: item.documentId || String(item.id),
      strapiId: item.id,
      author: item.author,
      authorId: item.authorId,
      text: item.text,
      createdAt: new Date(item.createdAt).getTime(),
      upvotes: item.upvotes || 0,
      downvotes: item.downvotes || 0,
      screenshots: item.screenshots || [],
      isPinned: item.isPinned || false,
      parentCommentId: item.parentCommentId || null,
    }));

    return NextResponse.json({ data: comments }, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch (error) {
    console.error('Failed to fetch POI comments:', error);
    return NextResponse.json({ data: [] }, { status: 502 });
  }
}

// ──── POST: Create a comment ────

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { poiId, mapId, text, screenshots, parentCommentId } = body;

    if (!poiId || !mapId || !text?.trim()) {
      return NextResponse.json({ error: 'Missing required fields: poiId, mapId, text' }, { status: 400 });
    }

    const validMaps = ['Valley IV', 'Wuling'];
    if (!validMaps.includes(mapId)) {
      return NextResponse.json({ error: `Invalid mapId. Must be one of: ${validMaps.join(', ')}` }, { status: 400 });
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    const createRes = await fetch(`${STRAPI_URL}/api/poi-comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          poiId,
          mapId,
          text: text.trim().slice(0, 2000),
          author: auth.user.username,
          authorId: auth.user.id,
          screenshots: (screenshots || []).slice(0, 5),
          upvotes: 0,
          downvotes: 0,
          isPinned: false,
          parentCommentId: parentCommentId || null,
          publishedAt: new Date().toISOString(),
        },
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error('Strapi create comment failed:', createRes.status, errText);
      return NextResponse.json({ error: 'Failed to save comment' }, { status: 502 });
    }

    const created = await createRes.json();
    const item = created.data;

    return NextResponse.json({
      success: true,
      data: {
        id: item.documentId || String(item.id),
        strapiId: item.id,
        author: item.author,
        authorId: item.authorId,
        text: item.text,
        createdAt: new Date(item.createdAt).getTime(),
        upvotes: 0,
        downvotes: 0,
        screenshots: item.screenshots || [],
        isPinned: false,
        parentCommentId: item.parentCommentId || null,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create POI comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ──── PUT: Vote on a comment ────

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { commentId, voteType } = body;

    if (!commentId || !['up', 'down'].includes(voteType)) {
      return NextResponse.json({ error: 'Missing commentId or invalid voteType (up/down)' }, { status: 400 });
    }

    // Fetch current comment to get vote counts
    const getRes = await fetch(`${STRAPI_URL}/api/poi-comments/${commentId}`, {
      headers: { 'User-Agent': 'ZeroSanity/1.0' },
    });

    if (!getRes.ok) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const current = await getRes.json();
    const item = current.data;

    const updates = voteType === 'up'
      ? { upvotes: (item.upvotes || 0) + 1 }
      : { downvotes: (item.downvotes || 0) + 1 };

    const updateRes = await fetch(`${STRAPI_URL}/api/poi-comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'ZeroSanity/1.0' },
      body: JSON.stringify({ data: updates }),
    });

    if (!updateRes.ok) {
      return NextResponse.json({ error: 'Failed to update vote' }, { status: 502 });
    }

    return NextResponse.json({ success: true, ...updates });
  } catch (error) {
    console.error('Failed to vote on POI comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ──── DELETE: Delete own comment ────

export async function DELETE(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = request.nextUrl;
  const commentId = searchParams.get('commentId');

  if (!commentId) {
    return NextResponse.json({ error: 'Missing commentId' }, { status: 400 });
  }

  try {
    // Fetch comment to verify ownership
    const getRes = await fetch(`${STRAPI_URL}/api/poi-comments/${commentId}`, {
      headers: { 'User-Agent': 'ZeroSanity/1.0' },
    });

    if (!getRes.ok) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const current = await getRes.json();
    if (current.data.authorId !== auth.user.id) {
      return NextResponse.json({ error: 'You can only delete your own comments' }, { status: 403 });
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const deleteRes = await fetch(`${STRAPI_URL}/api/poi-comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!deleteRes.ok) {
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete POI comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
