import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gear Artificing Calculator - Zero Sanity',
  description: 'Calculate optimal equipment substats and probabilities for Arknights: Endfield gear artificing. Optimize equipment rerolls and upgrade paths for maximum stat gains.',
  alternates: { canonical: '/gear-artificing' },
  openGraph: {
    title: 'Gear Artificing Calculator - Arknights: Endfield | Zero Sanity',
    description: 'Calculate optimal equipment substats and probabilities for Arknights: Endfield gear artificing. Optimize equipment rerolls and upgrade paths for maximum stat gains.',
    url: 'https://www.zerosanity.app/gear-artificing',
    type: 'website',
  },
};

export default function GearArtificingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
