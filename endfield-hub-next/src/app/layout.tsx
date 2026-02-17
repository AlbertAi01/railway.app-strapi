import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://zerosanity.app'),
  title: {
    default: 'Zero Sanity - Arknights: Endfield Toolkit',
    template: '%s | Zero Sanity',
  },
  description:
    'Comprehensive Arknights: Endfield community toolkit. Factory blueprints, character builds, tier lists, headhunt tracker, achievement tracker, and more.',
  keywords: [
    'Arknights Endfield',
    'factory blueprints',
    'character builds',
    'tier list',
    'headhunt tracker',
    'gacha',
    'toolkit',
    'wiki',
  ],
  openGraph: {
    title: 'Zero Sanity - Arknights: Endfield Toolkit',
    description:
      'Comprehensive Arknights: Endfield community toolkit. Factory blueprints, character builds, tier lists, headhunt tracker, and more.',
    url: 'https://zerosanity.app',
    siteName: 'Zero Sanity',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zero Sanity - Arknights: Endfield Toolkit',
    description: 'Comprehensive Arknights: Endfield community toolkit.',
  },
  alternates: {
    canonical: 'https://zerosanity.app',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[#0a0a0a]">
          <Sidebar />
          <main className="lg:ml-64 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
