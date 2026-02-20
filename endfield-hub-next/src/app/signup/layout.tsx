import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Zero Sanity',
  description: 'Create a free Zero Sanity account to sync your Arknights: Endfield data across devices. Save your builds, tier lists, and track your progression.',
  alternates: { canonical: '/signup' },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
