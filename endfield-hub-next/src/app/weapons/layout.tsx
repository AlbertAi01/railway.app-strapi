import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Weapons Arsenal - Zero Sanity',
  description: 'Complete database of all weapons in Arknights: Endfield. Compare stats, passive skills, and essence slots for Swords, Greatswords, Polearms, and more.',
  alternates: { canonical: '/weapons' },
  openGraph: {
    title: 'Weapons Arsenal - Arknights: Endfield | Zero Sanity',
    description: 'Complete database of all weapons in Arknights: Endfield. Compare stats, passive skills, and essence slots for Swords, Greatswords, Polearms, and more.',
    url: 'https://www.zerosanity.app/weapons',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weapons Arsenal - Arknights: Endfield | Zero Sanity',
    description: 'Complete database of all weapons in Arknights: Endfield. Compare stats, passive skills, and essence slots for Swords, Greatswords, Polearms, and more.',
  },
};

export default function WeaponsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
