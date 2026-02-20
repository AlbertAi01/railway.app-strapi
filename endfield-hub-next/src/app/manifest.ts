import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Zero Sanity - Arknights: Endfield Toolkit',
    short_name: 'Zero Sanity',
    description: 'Free community toolkit for Arknights: Endfield with 17+ tools',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0E14',
    theme_color: '#E8A624',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
