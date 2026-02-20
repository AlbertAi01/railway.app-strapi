import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interactive Map - Zero Sanity',
  description: 'Explore Valley IV and Wuling maps for Arknights: Endfield. Interactive maps with resource markers, collectible locations, and navigation guides.',
  alternates: { canonical: '/map' },
  openGraph: {
    title: 'Interactive Map - Arknights: Endfield | Zero Sanity',
    description: 'Explore Valley IV and Wuling maps for Arknights: Endfield. Interactive maps with resource markers, collectible locations, and navigation guides.',
    url: 'https://www.zerosanity.app/map',
    type: 'website',
  },
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
