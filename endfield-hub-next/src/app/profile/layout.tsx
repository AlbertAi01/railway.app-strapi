import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile - Zero Sanity',
  description: 'Manage your Zero Sanity account and Arknights: Endfield data. View your saved builds, tier lists, and account settings.',
  alternates: { canonical: '/profile' },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
