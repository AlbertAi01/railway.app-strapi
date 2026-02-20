import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Headhunt Tracker - Zero Sanity',
  description: 'Track your recruitment pulls and pity counter for Arknights: Endfield. Gacha tracker with pull history, rate statistics, and guaranteed operator counter.',
  alternates: { canonical: '/headhunt-tracker' },
  openGraph: {
    title: 'Headhunt Tracker - Arknights: Endfield | Zero Sanity',
    description: 'Track your recruitment pulls and pity counter for Arknights: Endfield. Gacha tracker with pull history, rate statistics, and guaranteed operator counter.',
    url: 'https://www.zerosanity.app/headhunt-tracker',
    type: 'website',
  },
};

export default function HeadhuntTrackerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
