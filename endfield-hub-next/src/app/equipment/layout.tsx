import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Equipment Systems - Zero Sanity',
  description: 'Equipment sets and gear pieces for Arknights: Endfield. View set bonuses, stat breakdowns, and recommendations for each operator role and playstyle.',
  alternates: { canonical: '/equipment' },
  openGraph: {
    title: 'Equipment Systems - Arknights: Endfield | Zero Sanity',
    description: 'Equipment sets and gear pieces for Arknights: Endfield. View set bonuses, stat breakdowns, and recommendations for each operator role and playstyle.',
    url: 'https://www.zerosanity.app/equipment',
    type: 'website',
  },
};

export default function EquipmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
