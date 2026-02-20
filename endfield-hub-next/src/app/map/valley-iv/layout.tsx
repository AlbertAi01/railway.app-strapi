import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Valley IV Map - Zero Sanity',
  description: 'Interactive Valley IV map for Arknights: Endfield with resource locations, collectibles, and navigation markers.',
  alternates: { canonical: '/map/valley-iv' },
  openGraph: {
    title: 'Valley IV Map - Arknights: Endfield | Zero Sanity',
    description: 'Interactive Valley IV map for Arknights: Endfield with resource locations, collectibles, and navigation markers.',
    url: 'https://www.zerosanity.app/map/valley-iv',
    type: 'website',
  },
};

export default function ValleyIVLayout({ children }: { children: React.ReactNode }) {
  return children;
}
