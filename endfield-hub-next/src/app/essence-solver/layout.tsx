import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Essence Solver - Zero Sanity',
  description: 'Optimize weapon essence usage with zero waste for Arknights: Endfield. Calculate optimal essence combinations to maximize weapon stats without wasting materials.',
  alternates: { canonical: '/essence-solver' },
  openGraph: {
    title: 'Essence Solver - Arknights: Endfield | Zero Sanity',
    description: 'Optimize weapon essence usage with zero waste for Arknights: Endfield. Calculate optimal essence combinations to maximize weapon stats without wasting materials.',
    url: 'https://www.zerosanity.app/essence-solver',
    type: 'website',
  },
};

export default function EssenceSolverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
