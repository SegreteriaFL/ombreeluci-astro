import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
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
