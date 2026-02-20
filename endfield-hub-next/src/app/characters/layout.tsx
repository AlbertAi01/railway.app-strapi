import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Operator Database - Zero Sanity',
  description: 'Browse all 23 playable operators in Arknights: Endfield. Complete character database with stats, skills, elements, roles, and detailed build guides.',
  alternates: { canonical: '/characters' },
  openGraph: {
    title: 'Operator Database - Arknights: Endfield | Zero Sanity',
    description: 'Browse all 23 playable operators in Arknights: Endfield. Complete character database with stats, skills, elements, roles, and detailed build guides.',
    url: 'https://www.zerosanity.app/characters',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Operator Database - Arknights: Endfield | Zero Sanity',
    description: 'Browse all 23 playable operators in Arknights: Endfield. Complete character database with stats, skills, elements, roles, and detailed build guides.',
  },
};

export default function CharactersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
