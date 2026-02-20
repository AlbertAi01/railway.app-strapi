import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tier List Builder - Zero Sanity',
  description: 'Create and share operator tier rankings for Arknights: Endfield. Drag-and-drop tier list builder with element and role filters, plus community rankings.',
  alternates: { canonical: '/tier-list' },
  openGraph: {
    title: 'Tier List Builder - Arknights: Endfield | Zero Sanity',
    description: 'Create and share operator tier rankings for Arknights: Endfield. Interactive tier list maker with drag-and-drop, filters, and community rankings.',
    url: 'https://www.zerosanity.app/tier-list',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tier List Builder - Arknights: Endfield | Zero Sanity',
    description: 'Create and share operator tier rankings for Arknights: Endfield. Interactive tier list maker with drag-and-drop, filters, and community rankings.',
  },
};

export default function TierListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
