import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Operator Card Generator - Zero Sanity',
  description: 'Generate and customize operator showcase cards for Arknights: Endfield. Create tactical operator cards with stats, skills, and equipment to share on social media.',
  alternates: { canonical: '/character-card' },
  openGraph: {
    title: 'Operator Card Generator - Arknights: Endfield | Zero Sanity',
    description: 'Generate and customize operator showcase cards for Arknights: Endfield. Create tactical operator cards with stats, skills, and equipment to share on social media.',
    url: 'https://www.zerosanity.app/character-card',
    type: 'website',
  },
};

export default function CharacterCardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
