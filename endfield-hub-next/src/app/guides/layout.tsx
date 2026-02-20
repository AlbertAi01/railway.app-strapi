import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Game Guides - Zero Sanity',
  description: 'In-depth verified guides for Arknights: Endfield. Comprehensive tutorials, tips, and strategies for all game mechanics, operations, and progression systems.',
  alternates: { canonical: '/guides' },
  openGraph: {
    title: 'Game Guides - Arknights: Endfield | Zero Sanity',
    description: 'In-depth verified guides for Arknights: Endfield. Comprehensive tutorials, tips, and strategies for all game mechanics, operations, and progression systems.',
    url: 'https://www.zerosanity.app/guides',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Game Guides - Arknights: Endfield | Zero Sanity',
    description: 'In-depth verified guides for Arknights: Endfield. Comprehensive tutorials, tips, and strategies for all game mechanics, operations, and progression systems.',
  },
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
