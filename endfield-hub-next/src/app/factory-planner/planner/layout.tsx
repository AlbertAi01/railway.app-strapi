import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Factory Production Planner - Arknights: Endfield | Zero Sanity',
  description: 'Plan factory production chains for Arknights: Endfield. Calculate throughput, optimize resource flow, and design efficient production layouts.',
  alternates: {
    canonical: '/factory-planner/planner',
  },
  openGraph: {
    title: 'Factory Production Planner - Arknights: Endfield | Zero Sanity',
    description: 'Plan factory production chains for Arknights: Endfield. Calculate throughput, optimize resource flow, and design efficient production layouts.',
    url: 'https://www.zerosanity.app/factory-planner/planner',
    type: 'website',
  },
};

export default function FactoryPlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
