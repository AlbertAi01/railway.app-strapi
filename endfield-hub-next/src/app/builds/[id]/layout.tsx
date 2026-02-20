import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  return {
    title: 'Build Guide - Zero Sanity',
    description: 'Detailed build guide for Arknights: Endfield with team composition, weapon loadouts, equipment sets, skill priorities, and combat strategies.',
    alternates: { canonical: `/builds/${id}` },
    openGraph: {
      title: 'Build Guide - Arknights: Endfield | Zero Sanity',
      description: 'Detailed build guide for Arknights: Endfield with team composition, weapon loadouts, equipment sets, skill priorities, and combat strategies.',
      url: `https://www.zerosanity.app/builds/${id}`,
      type: 'article',
    },
  };
}

export default function BuildDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
