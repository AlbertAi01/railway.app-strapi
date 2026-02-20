import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Achievement Tracker - Zero Sanity',
  description: 'Track mission completion and rewards for Arknights: Endfield achievements. Complete achievement registry with progress tracking and reward information.',
  alternates: { canonical: '/achievements' },
  openGraph: {
    title: 'Achievement Tracker - Arknights: Endfield | Zero Sanity',
    description: 'Track mission completion and rewards for Arknights: Endfield achievements. Complete achievement registry with progress tracking and reward information.',
    url: 'https://www.zerosanity.app/achievements',
    type: 'website',
  },
};

export default function AchievementsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
