import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AIC Factory Planner - Zero Sanity',
  description: 'Design and optimize production chains for Arknights: Endfield AIC factory. Interactive factory planner tool for manufacturing and resource management.',
  alternates: { canonical: '/factory-planner' },
  openGraph: {
    title: 'AIC Factory Planner - Arknights: Endfield | Zero Sanity',
    description: 'Design and optimize production chains for Arknights: Endfield AIC factory. Interactive factory planner tool for manufacturing and resource management.',
    url: 'https://www.zerosanity.app/factory-planner',
    type: 'website',
  },
};

export default function FactoryPlannerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
