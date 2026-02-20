import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recruitment Simulator - Zero Sanity',
  description: 'Simulate headhunt operations for Arknights: Endfield with verified gacha rates. Practice pulls, test your luck, and understand the pity system before spending currency.',
  alternates: { canonical: '/summon-simulator' },
  openGraph: {
    title: 'Recruitment Simulator - Arknights: Endfield | Zero Sanity',
    description: 'Simulate headhunt operations for Arknights: Endfield with verified gacha rates. Practice pulls, test your luck, and understand the pity system before spending currency.',
    url: 'https://www.zerosanity.app/summon-simulator',
    type: 'website',
  },
};

export default function SummonSimulatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
