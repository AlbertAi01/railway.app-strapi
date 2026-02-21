import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || '';

export async function PUT(request: NextRequest) {
  try {
    // 1. Extract and validate auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);

    // 2. Parse request body
    const body = await request.json();
    const username = typeof body.username === 'string' ? body.username.trim() : '';

    // 3. Validate username
    if (!username) {
      return NextResponse.json({ error: 'Display name cannot be empty' }, { status: 400 });
    }
    if (username.length < 3) {
      return NextResponse.json({ error: 'Display name must be at least 3 characters' }, { status: 400 });
    }
    if (username.length > 30) {
      return NextResponse.json({ error: 'Display name must be 30 characters or less' }, { status: 400 });
    }
    // Only allow alphanumeric, spaces, dashes, underscores
    if (!/^[a-zA-Z0-9 _-]+$/.test(username)) {
      return NextResponse.json({ error: 'Display name can only contain letters, numbers, spaces, dashes, and underscores' }, { status: 400 });
    }

    // 4. Verify the token and get current user from Strapi
    const meRes = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!meRes.ok) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    const currentUser = await meRes.json();

    // If username unchanged, return success
    if (currentUser.username === username) {
      return NextResponse.json({ username: currentUser.username });
    }

    // 5. Check uniqueness — search for any user with this username (case-insensitive)
    const searchRes = await fetch(
      `${STRAPI_URL}/api/users?filters[username][$eqi]=${encodeURIComponent(username)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (searchRes.ok) {
      const users = await searchRes.json();
      const taken = Array.isArray(users)
        ? users.some((u: { id: number }) => u.id !== currentUser.id)
        : false;
      if (taken) {
        return NextResponse.json({ error: 'This display name is already taken' }, { status: 409 });
      }
    }

    // 6. Update the user via Strapi
    const updateRes = await fetch(`${STRAPI_URL}/api/users/${currentUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username }),
    });

    if (!updateRes.ok) {
      const errData = await updateRes.json().catch(() => ({}));
      const errMsg = errData?.error?.message || 'Failed to update display name';
      return NextResponse.json({ error: errMsg }, { status: updateRes.status });
    }

    const updatedUser = await updateRes.json();
    return NextResponse.json({ username: updatedUser.username || username });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
