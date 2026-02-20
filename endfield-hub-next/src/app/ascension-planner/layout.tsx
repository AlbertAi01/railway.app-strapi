import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ascension Planner - Zero Sanity',
  description: 'Plan operator ascension materials and track upgrade progress for Arknights: Endfield. Calculate required materials for leveling, skills, and potential upgrades.',
  alternates: { canonical: '/ascension-planner' },
  openGraph: {
    title: 'Ascension Planner - Arknights: Endfield | Zero Sanity',
    description: 'Plan operator ascension materials and track upgrade progress for Arknights: Endfield. Calculate required materials for leveling, skills, and potential upgrades.',
    url: 'https://www.zerosanity.app/ascension-planner',
    type: 'website',
  },
};

export default function AscensionPlannerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
