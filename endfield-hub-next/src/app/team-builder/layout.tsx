import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team Builder - Zero Sanity',
  description: 'Plan and optimize squad compositions for Arknights: Endfield. Interactive team builder with synergy analysis, elemental coverage, and role balance recommendations.',
  alternates: { canonical: '/team-builder' },
  openGraph: {
    title: 'Team Builder - Arknights: Endfield | Zero Sanity',
    description: 'Plan and optimize squad compositions for Arknights: Endfield. Interactive team builder with synergy analysis, elemental coverage, and role balance recommendations.',
    url: 'https://www.zerosanity.app/team-builder',
    type: 'website',
  },
};

export default function TeamBuilderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
