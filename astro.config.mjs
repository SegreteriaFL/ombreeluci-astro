import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import pagefind from 'astro-pagefind';
import cloudflare from '@astrojs/cloudflare';

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
const DIRECTUS_TOKEN = env.DIRECTUS_TOKEN ?? process.env.DIRECTUS_TOKEN ?? '';
const DIRECTUS_URL = env.DIRECTUS_URL ?? process.env.DIRECTUS_URL ?? 'http://159.69.196.64:8055';
const MEDIA_BASE_URL = env.MEDIA_BASE_URL ?? process.env.MEDIA_BASE_URL ?? 'https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev';

// Necessario: Vite SSR legge import.meta.env da process.env a runtime, non da vite.define
process.env.DIRECTUS_TOKEN = DIRECTUS_TOKEN;
process.env.DIRECTUS_URL = DIRECTUS_URL;
process.env.MEDIA_BASE_URL = MEDIA_BASE_URL;

console.log('[config] DIRECTUS_URL:', DIRECTUS_URL);
console.log('[config] DIRECTUS_TOKEN set:', DIRECTUS_TOKEN.length > 0);

// URL pubblico per canonical, og:url e View Transitions durante il build.
// Cloudflare Pages espone CF_PAGES_URL per ogni deploy (anche preview hash.*.pages.dev).
// Fallback produzione se il build è locale senza env.
const site =
  (process.env.CF_PAGES_URL || process.env.PUBLIC_SITE_URL || 'https://ombreeluci.it').replace(
    /\/$/,
    '',
  );
console.log('[config] site:', site);

export default defineConfig({
  site,
  output: 'hybrid',
  adapter: cloudflare(),
  integrations: [pagefind()],
  vite: {
    define: {
      'import.meta.env.DIRECTUS_URL': JSON.stringify(DIRECTUS_URL),
      'import.meta.env.DIRECTUS_TOKEN': JSON.stringify(DIRECTUS_TOKEN),
      'import.meta.env.MEDIA_BASE_URL': JSON.stringify(MEDIA_BASE_URL),
    },
  },
  redirects: {
    '/dona': '/it/sostienici',
    '/contribuisci': '/it/sostienici',
    '/about': '/it/chi-siamo',
    // root IT → /it/ (staging: evita link rotti durante sviluppo)
    '/archivio': '/it/archivio',
    '/autori': '/it/autori',
    '/categoria': '/it/categoria',
    '/cerca': '/it/cerca',
    '/chi-siamo': '/it/chi-siamo',
    '/chi-siamo/la-rivista': '/it/chi-siamo#la-rivista',
    '/chi-siamo/la-redazione': '/it/chi-siamo#la-redazione',
    '/chi-siamo/redazione-storica': '/it/chi-siamo#redazione-storica',
    '/chi-siamo/collaboratori': '/it/chi-siamo#collaboratori',
    '/chi-siamo/hanno-scritto-per-noi': '/it/chi-siamo#hanno-scritto-per-noi',
    '/chi-siamo/contatti': '/it/chi-siamo#contatti',
    '/diari': '/it/diari',
    '/newsletter': '/it/newsletter',
    '/rubriche': '/it/rubriche',
    '/sostienici': '/it/sostienici',
    '/tag': '/it/tag',
    // Fase 2 i18n: /blog/en → /en/
    '/blog/en': '/en/',
  },
});
