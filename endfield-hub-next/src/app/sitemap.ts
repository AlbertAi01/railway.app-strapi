import type { MetadataRoute } from 'next';
import { CHARACTERS } from '@/lib/data';
import { SCRAPED_BLUEPRINTS } from '@/data/blueprints';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zerosanity.app';
  const currentDate = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/characters`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/weapons`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/equipment`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/builds`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blueprints`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tier-list`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/team-builder`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/character-card`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/gear-artificing`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ascension-planner`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/essence-solver`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/factory-planner`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/factory-planner/planner`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/recipes`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/headhunt-tracker`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/achievements`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/summon-simulator`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/map`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/map/valley-iv`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/map/wuling`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  // Dynamic character pages
  const characterPages: MetadataRoute.Sitemap = CHARACTERS.map((character) => ({
    url: `${baseUrl}/characters/${character.Slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Dynamic blueprint pages
  const blueprintPages: MetadataRoute.Sitemap = SCRAPED_BLUEPRINTS.map((blueprint) => ({
    url: `${baseUrl}/blueprints/${blueprint.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...characterPages, ...blueprintPages];
}
