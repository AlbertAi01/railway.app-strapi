import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Zero Sanity',
  description: 'Log in to Zero Sanity to sync your Arknights: Endfield data across devices. Save your builds, tier lists, and track your progress.',
  alternates: { canonical: '/login' },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
