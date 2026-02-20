import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'endfieldtools.dev',
        pathname: '/assets/images/**',
      },
      {
        protocol: 'https',
        hostname: 'endfield.wiki.gg',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
    ],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), payment=()',
        },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https://endfield.wiki.gg https://endfieldtools.dev https://res.cloudinary.com https://img.youtube.com https://www.google-analytics.com",
            "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-insights.com https://www.googletagmanager.com",
            "frame-src 'self' https://www.youtube.com",
            "frame-ancestors 'self'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; '),
        },
      ],
    },
  ],
};

export default nextConfig;
