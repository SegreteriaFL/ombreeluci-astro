import { defineConfig } from 'astro/config';

export default defineConfig({
  vite: {
    define: {
      'import.meta.env.DIRECTUS_URL': JSON.stringify(process.env.DIRECTUS_URL ?? 'http://159.69.196.64:8055'),
      'import.meta.env.DIRECTUS_TOKEN': JSON.stringify(process.env.DIRECTUS_TOKEN ?? ''),
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
