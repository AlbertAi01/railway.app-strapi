/**
 * Server-side Strapi fetching with ISR caching.
 * Used in Server Components for SSR/SSG with revalidation.
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || '';

interface StrapiResponse<T> {
  data: T;
  meta?: { pagination?: { page: number; pageSize: number; total: number } };
}

async function strapiGet<T>(path: string, revalidate = 3600): Promise<T> {
  const url = `${STRAPI_URL}/api${path}`;
  try {
    const res = await fetch(url, { next: { revalidate, tags: [pathToTag(path)] } });
    if (!res.ok) throw new Error(`Strapi ${res.status}: ${url}`);
    const json: StrapiResponse<T> = await res.json();
    return json.data;
  } catch {
    return [] as unknown as T;
  }
}

function pathToTag(path: string): string {
  const match = path.match(/^\/([a-z-]+)/);
  return match ? match[1] : 'strapi';
}

export async function getCharacters() {
  return strapiGet<Record<string, unknown>[]>('/characters?populate=*&pagination[pageSize]=100');
}

export async function getCharacter(slug: string) {
  const data = await strapiGet<Record<string, unknown>[]>(`/characters?filters[Slug][$eq]=${slug}&populate=*`);
  return data?.[0] ?? null;
}

export async function getWeapons() {
  return strapiGet<Record<string, unknown>[]>('/weapons?populate=*&pagination[pageSize]=100');
}

export async function getEquipmentSets() {
  return strapiGet<Record<string, unknown>[]>('/equipment-sets?populate=*&pagination[pageSize]=100');
}

export async function getGuides() {
  return strapiGet<Record<string, unknown>[]>('/guides?populate=*&pagination[pageSize]=100&sort=createdAt:desc');
}

export async function getBlueprints() {
  return strapiGet<Record<string, unknown>[]>('/blueprints?populate=*&pagination[pageSize]=100&sort=Upvotes:desc');
}

export async function getRecipes() {
  return strapiGet<Record<string, unknown>[]>('/recipes?populate=*&pagination[pageSize]=200');
}

export async function getAchievements() {
  return strapiGet<Record<string, unknown>[]>('/achievements?populate=*&pagination[pageSize]=200');
}

export async function getMapMarkers(region?: string) {
  const filter = region ? `&filters[MapRegion][$eq]=${region}` : '';
  return strapiGet<Record<string, unknown>[]>(`/map-markers?populate=*&pagination[pageSize]=500${filter}`);
}

export async function getBanners() {
  return strapiGet<Record<string, unknown>[]>('/banners?populate=*&sort=StartDate:desc');
}
