import axios from 'axios';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || '';

const api = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchCharacters() {
  const { data } = await api.get('/characters?populate=*&pagination[pageSize]=100');
  return data.data;
}

export async function fetchCharacter(slug: string) {
  const { data } = await api.get(`/characters?filters[Slug][$eq]=${slug}&populate=*`);
  return data.data?.[0];
}

export async function fetchWeapons() {
  const { data } = await api.get('/weapons?populate=*&pagination[pageSize]=100');
  return data.data;
}

export async function fetchEquipmentSets() {
  const { data } = await api.get('/equipment-sets?populate=*&pagination[pageSize]=100');
  return data.data;
}

export async function fetchGuides() {
  const { data } = await api.get('/guides?populate=*&pagination[pageSize]=100&sort=createdAt:desc');
  return data.data;
}

export async function fetchGuide(slug: string) {
  const { data } = await api.get(`/guides?filters[Slug][$eq]=${slug}&populate=*`);
  return data.data?.[0];
}

export async function fetchBlueprints() {
  try {
    const res = await fetch('/api/blueprints?status=approved');
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchRecipes() {
  const { data } = await api.get('/recipes?populate=*&pagination[pageSize]=200');
  return data.data;
}

export async function fetchAchievements() {
  const { data } = await api.get('/achievements?populate=*&pagination[pageSize]=200');
  return data.data;
}

export async function fetchMapMarkers(region?: string) {
  const filter = region ? `&filters[MapRegion][$eq]=${region}` : '';
  const { data } = await api.get(`/map-markers?populate=*&pagination[pageSize]=500${filter}`);
  return data.data;
}

export async function fetchBanners() {
  const { data } = await api.get('/banners?populate=*&sort=StartDate:desc');
  return data.data;
}

export async function fetchOperatorGuide(slug: string) {
  if (!STRAPI_URL) return null;
  try {
    const { data } = await api.get(`/operator-guides?filters[slug][$eq]=${slug}&populate=*`);
    return data?.data?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function createBlueprint(blueprintData: Record<string, unknown>, token: string) {
  const res = await fetch('/api/blueprints', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(blueprintData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/** Check status of user's blueprint submissions in Strapi by author name */
export async function fetchUserBlueprintStatuses(author: string): Promise<{ slug: string; status: string; title: string }[]> {
  try {
    const res = await fetch(`/api/blueprints?status=all&pageSize=50`);
    if (!res.ok) return [];
    const json = await res.json();
    const items = json?.data ?? [];
    return items
      .filter((item: Record<string, unknown>) => {
        const attrs = (item as Record<string, unknown>).attributes || item;
        return ((attrs as Record<string, unknown>).Author as string)?.toLowerCase() === author.toLowerCase();
      })
      .map((item: Record<string, unknown>) => {
        const attrs = (item as Record<string, unknown>).attributes || item;
        return {
          slug: (attrs as Record<string, unknown>).Slug as string || '',
          status: (attrs as Record<string, unknown>).Status as string || 'pending',
          title: (attrs as Record<string, unknown>).Title as string || '',
        };
      });
  } catch {
    return [];
  }
}

export async function fetchBlueprintBySlug(slug: string) {
  try {
    const res = await fetch(`/api/blueprints/${encodeURIComponent(slug)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function upvoteBlueprint(id: number, currentVotes: number) {
  const { data } = await api.put(`/blueprints/${id}`, {
    data: { Upvotes: currentVotes + 1 },
  });
  return data.data;
}

export async function createGuide(guideData: Record<string, unknown>, token: string) {
  const res = await fetch('/api/guides', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(guideData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchApprovedGuides() {
  try {
    const res = await fetch('/api/guides?status=approved');
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data ?? [];
  } catch {
    return [];
  }
}

export default api;
