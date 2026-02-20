import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Factory Blueprints - Zero Sanity',
  description: 'Browse and share community factory blueprints for Arknights: Endfield. Optimized production layouts with EFO import codes for easy in-game importing.',
  alternates: { canonical: '/blueprints' },
  openGraph: {
    title: 'Factory Blueprints - Arknights: Endfield | Zero Sanity',
    description: 'Browse and share community factory blueprints for Arknights: Endfield. Optimized production layouts with EFO import codes for easy in-game importing.',
    url: 'https://www.zerosanity.app/blueprints',
    type: 'website',
  },
};

export default function BlueprintsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
