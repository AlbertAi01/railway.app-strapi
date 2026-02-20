import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wuling Map - Zero Sanity',
  description: 'Interactive Wuling map for Arknights: Endfield with resource locations, collectibles, and navigation markers.',
  alternates: { canonical: '/map/wuling' },
  openGraph: {
    title: 'Wuling Map - Arknights: Endfield | Zero Sanity',
    description: 'Interactive Wuling map for Arknights: Endfield with resource locations, collectibles, and navigation markers.',
    url: 'https://www.zerosanity.app/map/wuling',
    type: 'website',
  },
};

export default function WulingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
