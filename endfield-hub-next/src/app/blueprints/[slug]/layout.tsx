import type { Metadata } from 'next';
import { SCRAPED_BLUEPRINTS } from '@/data/blueprints';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zerosanity.app';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blueprint = SCRAPED_BLUEPRINTS.find(b => b.slug === slug);
  const title = blueprint ? `${blueprint.Title} Blueprint - Zero Sanity` : 'Blueprint Details - Zero Sanity';
  const description = 'Factory blueprint for Arknights: Endfield with production layout, import code, and optimization guide.';

  return {
    title,
    description,
    alternates: { canonical: `/blueprints/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/blueprints/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function BlueprintDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blueprint = SCRAPED_BLUEPRINTS.find(b => b.slug === slug);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blueprints', item: `${SITE_URL}/blueprints` },
      ...(blueprint ? [{ '@type': 'ListItem', position: 3, name: blueprint.Title, item: `${SITE_URL}/blueprints/${slug}` }] : []),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
