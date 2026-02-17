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

function AutoDeployOverlay() {
  const topText =
    'PRTS SYSTEM ACTIVE // NEURAL LINK ESTABLISHED // OPERATOR STATUS: NORMAL // DATA SYNC: COMPLETE // ORIGINIUM MONITORING: ACTIVE // RHODES ISLAND OS INITIALIZED // ENDFIELD TACTICAL SUITE ONLINE // ';
  const bottomText =
    'RIOS.v2.0 // ZEROSANITY.APP // DATA SOURCE: VERIFIED // ENDFIELD TOOLKIT OPERATIONAL // GRYPHLINE ASSET DATABASE // COMBAT READINESS: OPTIMAL // SYSTEM INTEGRITY: 100% // ';

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-7 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0Aee] to-transparent z-[100] pointer-events-none overflow-hidden flex items-center">
        <div className="terminal-text opacity-40 whitespace-nowrap animate-scroll-left text-[10px]">
          {topText}
          {topText}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 h-7 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0Aee] to-transparent z-[100] pointer-events-none overflow-hidden flex items-end">
        <div className="terminal-text opacity-40 whitespace-nowrap animate-scroll-right text-[10px] pb-1">
          {bottomText}
          {bottomText}
        </div>
      </div>
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AutoDeployOverlay />
        <div className="min-h-screen bg-[#0A0A0A]">
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
