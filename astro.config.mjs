import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
const DIRECTUS_TOKEN = env.DIRECTUS_TOKEN ?? process.env.DIRECTUS_TOKEN ?? '';
const DIRECTUS_URL = env.DIRECTUS_URL ?? process.env.DIRECTUS_URL ?? 'http://159.69.196.64:8055';

// Necessario: Vite SSR legge import.meta.env da process.env a runtime, non da vite.define
process.env.DIRECTUS_TOKEN = DIRECTUS_TOKEN;
process.env.DIRECTUS_URL = DIRECTUS_URL;

console.log('[config] DIRECTUS_URL:', DIRECTUS_URL);
console.log('[config] DIRECTUS_TOKEN set:', DIRECTUS_TOKEN.length > 0);

export default defineConfig({
  vite: {
    define: {
      'import.meta.env.DIRECTUS_URL': JSON.stringify(DIRECTUS_URL),
      'import.meta.env.DIRECTUS_TOKEN': JSON.stringify(DIRECTUS_TOKEN),
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
