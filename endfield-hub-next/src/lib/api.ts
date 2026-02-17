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
  const { data } = await api.get('/blueprints?populate=*&pagination[pageSize]=100&sort=Upvotes:desc');
  return data.data;
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

export async function createBlueprint(blueprintData: Record<string, unknown>) {
  const { data } = await api.post('/blueprints', { data: blueprintData });
  return data.data;
}

export async function upvoteBlueprint(id: number, currentVotes: number) {
  const { data } = await api.put(`/blueprints/${id}`, {
    data: { Upvotes: currentVotes + 1 },
  });
  return data.data;
}

export default api;
