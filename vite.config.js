import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: [
      'railwayapp-strapi-production-cd02.up.railway.app',
      'railwayapp-strapi-production-4897.up.railway.app',
      'localhost'
    ],
  },
});
