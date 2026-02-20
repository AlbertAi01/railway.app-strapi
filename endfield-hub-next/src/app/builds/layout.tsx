import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Builds - Zero Sanity',
  description: 'Browse and create operator build guides for Arknights: Endfield. Share team compositions, weapon loadouts, equipment sets, and skill priorities.',
  alternates: { canonical: '/builds' },
  openGraph: {
    title: 'Community Builds - Arknights: Endfield | Zero Sanity',
    description: 'Browse and create operator build guides for Arknights: Endfield. Share team compositions, weapon loadouts, equipment sets, and skill priorities.',
    url: 'https://www.zerosanity.app/builds',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Community Builds - Arknights: Endfield | Zero Sanity',
    description: 'Browse and create operator build guides for Arknights: Endfield. Share team compositions, weapon loadouts, equipment sets, and skill priorities.',
  },
};

export default function BuildsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
