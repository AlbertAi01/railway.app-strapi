import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import JsonLd from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zerosanity.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
  category: 'gaming',
  creator: 'Zero Sanity',
  verification: {
    google: '',
  },
  openGraph: {
    title: 'Zero Sanity - Arknights: Endfield Toolkit',
    description:
      'Comprehensive Arknights: Endfield community toolkit. Factory blueprints, character builds, tier lists, headhunt tracker, and more.',
    url: SITE_URL,
    siteName: 'Zero Sanity',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Zero Sanity - Arknights: Endfield Toolkit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zero Sanity - Arknights: Endfield Toolkit',
    description: 'Comprehensive Arknights: Endfield community toolkit.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

function AutoDeployOverlay() {
  const topText =
    'PRTS SYSTEM ACTIVE // NEURAL LINK ESTABLISHED // OPERATOR STATUS: NORMAL // DATA SYNC: COMPLETE // ORIGINIUM MONITORING: ACTIVE // RHODES ISLAND OS INITIALIZED // ENDFIELD TACTICAL SUITE ONLINE // ';
  const bottomText =
    'RIOS.v0.1 // ZEROSANITY.APP // DATA SOURCE: VERIFIED // ENDFIELD TOOLKIT OPERATIONAL // GRYPHLINE ASSET DATABASE // COMBAT READINESS: OPTIMAL // SYSTEM INTEGRITY: 100% // ';

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-7 bg-gradient-to-b from-[#0E0C09] via-[#0E0C09ee] to-transparent z-[100] pointer-events-none overflow-hidden flex items-center">
        <div className="terminal-text-sm opacity-40 whitespace-nowrap animate-scroll-left">
          {topText}
          {topText}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 h-7 bg-gradient-to-t from-[#0E0C09] via-[#0E0C09ee] to-transparent z-[100] pointer-events-none overflow-hidden flex items-end">
        <div className="terminal-text-sm opacity-40 whitespace-nowrap animate-scroll-right pb-1">
          {bottomText}
          {bottomText}
        </div>
      </div>
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Zero Sanity',
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    description: 'Free community toolkit for Arknights: Endfield',
    sameAs: [],
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://endfieldtools.dev" />
        <link rel="dns-prefetch" href="https://endfield.wiki.gg" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body>
        <JsonLd data={organizationSchema} />
        <AutoDeployOverlay />
        <div className="min-h-screen bg-[#0E0C09]">
          <Sidebar />
          <main className="lg:ml-60 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">
              {children}
            </div>
          </main>
        </div>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QQ31VXDFX8"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QQ31VXDFX8');
          `}
        </Script>
      </body>
    </html>
  );
}
