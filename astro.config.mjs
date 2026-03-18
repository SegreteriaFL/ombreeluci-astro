import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare({
    routes: {
      extend: {
        include: [{ pattern: '/keystatic' }],
      },
    },
  }),
  integrations: [react(), keystatic()],
  vite: {
    ssr: {
      external: ['fs', 'fs/promises', 'path', 'node:fs', 'node:path'],
    },
  },
  redirects: {
    '/dona': '/sostienici',
    '/contribuisci': '/sostienici',
    '/about': '/chi-siamo',
    '/chi-siamo/la-rivista': '/chi-siamo#la-rivista',
    '/chi-siamo/la-redazione': '/chi-siamo#la-redazione',
    '/chi-siamo/redazione-storica': '/chi-siamo#redazione-storica',
    '/chi-siamo/collaboratori': '/chi-siamo#collaboratori',
    '/chi-siamo/hanno-scritto-per-noi': '/chi-siamo#hanno-scritto-per-noi',
    '/chi-siamo/contatti': '/chi-siamo#contatti',
  },
});
