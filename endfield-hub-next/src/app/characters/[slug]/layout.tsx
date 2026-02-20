import type { Metadata } from 'next';
import { CHARACTERS } from '@/lib/data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zerosanity.app';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const character = CHARACTERS.find(c => c.Slug === slug);

  if (!character) {
    return {
      title: 'Character Not Found - Zero Sanity',
      description: 'Character not found in the Arknights: Endfield database.',
    };
  }

  const title = `${character.Name} Guide - Builds, Stats & Teams | Zero Sanity`;
  const description = `Complete ${character.Name} guide for Arknights: Endfield. ${character.Rarity}-star ${character.Element} ${character.Role} operator with ${character.WeaponType}. Best builds, weapons, equipment sets, skill priorities, and team compositions.`;

  return {
    title,
    description,
    alternates: { canonical: `/characters/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/characters/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CharacterDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const character = CHARACTERS.find(c => c.Slug === slug);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Characters', item: `${SITE_URL}/characters` },
      ...(character ? [{ '@type': 'ListItem', position: 3, name: character.Name, item: `${SITE_URL}/characters/${slug}` }] : []),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
