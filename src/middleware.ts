import { defineMiddleware } from 'astro:middleware';
import redirectsLegacy from './data/redirects-legacy.json';

const REDIRECTS: Record<string, string> = redirectsLegacy;

// Redirect numeri rivista rinominati (ID Directus corretto dopo import)
const ARCHIVIO_REDIRECTS: Record<string, string> = {
  '/it/archivio/ins--2/': '/it/archivio/ins-31/',
  '/it/archivio/ins--3/': '/it/archivio/ins-32/',
  // catechesi → spiritualità (merge categorie, 2026-05-13)
  '/it/categoria/catechesi': '/it/categoria/spiritualita/',
  '/it/categoria/catechesi/': '/it/categoria/spiritualita/',
  '/en/category/catechesis': '/en/category/spirituality/',
  '/en/category/catechesis/': '/en/category/spirituality/',
  // slug autore corretto in Directus (2026-05-21): depaolis → de-paolis
  '/it/autori/pierfrancesco-depaolis': '/it/autori/pierfrancesco-de-paolis/',
  '/it/autori/pierfrancesco-depaolis/': '/it/autori/pierfrancesco-de-paolis/',
};

// Regex per redirect WordPress date-based: /YYYY/MM/DD/slug/ → /it/slug/
// Nota: senza [...path].astro questi path non raggiungono il middleware su staging.
// In produzione li gestisce il CF Worker (cf-worker/redirect-worker.js).
const DATE_PATH_RE = /^\/\d{4}\/\d{2}\/\d{2}\/(.+)$/;
const YEAR_MONTH_SLUG_RE = /^\/\d{4}\/\d{2}\/([^/]+?)\/?$/;

// /blog/slug-en/ → /en/slug/ (Fase 2 i18n)
const BLOG_EN_SLUG_RE = /^\/blog\/([^/]+)-en\/?$/;

// /diario-di-* → /diari/diario-di-* (backward compat)
const DIARIO_RE = /^(\/diario-di-[^/]+)\/?$/;

// /blog/slug → /it/slug/ (legacy WordPress IT)
const BLOG_IT_SLUG_RE = /^\/blog\/([^/]+?)\/?$/;

// Fix-1/2: permalink WP senza mese/giorno — formato usato da ombreeluci.it
// Ordine: EN prima di IT per evitare falsi match; entrambi dopo /YYYY/MM/ più specifico.
const EN_YEAR_SLUG_RE = /^\/en\/(\d{4})\/([^/]+?)\/?$/;  // /en/YYYY/slug → /en/slug/
const YEAR_SLUG_RE    = /^\/(\d{4})\/([^/]+?)\/?$/;       // /YYYY/slug    → /it/slug/

// Fix-3/4: WP custom post type "project" = numeri rivista
const PROJECT_NUMERO_RE = /^\/project\/numero-(\d+)-/;    // /project/numero-N-* → /it/archivio/oel-N/
const PROJECT_ANY_RE    = /^\/project\//;                  // /project/*          → /it/archivio/

// Fix-5: shortlink numeri rivista /n-N/ → /it/archivio/oel-N/
const NUMERO_SHORT_RE = /^\/n-(\d+)\/?$/;

// Fix-6: bollettino Insieme /insieme/insieme-n-N/ → /it/archivio/ins-N/
const INSIEME_RE = /^\/insieme\/insieme-n-(\d+)\/?$/;

export const onRequest = defineMiddleware(({ url, redirect }, next) => {
  const path = url.pathname;

  const archivioRedirect = ARCHIVIO_REDIRECTS[path];
  if (archivioRedirect) return redirect(archivioRedirect, 301);

  const enMatch = path.match(BLOG_EN_SLUG_RE);
  if (enMatch) return redirect('/en/' + enMatch[1] + '/', 301);

  const diarioMatch = path.match(DIARIO_RE);
  if (diarioMatch) return redirect('/it/diari' + diarioMatch[1] + '/', 301);

  const blogItMatch = path.match(BLOG_IT_SLUG_RE);
  if (blogItMatch && blogItMatch[1] !== 'en') {
    return redirect('/it/' + blogItMatch[1] + '/', 301);
  }

  const target = REDIRECTS[path];
  if (target) return redirect('https://ombreeluci.it' + target, 301);

  const dateMatch = path.match(DATE_PATH_RE);
  if (dateMatch) return redirect('https://ombreeluci.it/it/' + dateMatch[1], 301);

  const ymMatch = path.match(YEAR_MONTH_SLUG_RE);
  if (ymMatch) return redirect('https://ombreeluci.it/it/' + ymMatch[1], 301);

  // Fix-2: /en/YYYY/slug → /en/slug/ (EN articles su WP con anno nel permalink)
  const enYearMatch = path.match(EN_YEAR_SLUG_RE);
  if (enYearMatch) return redirect('/en/' + enYearMatch[2] + '/', 301);

  // Fix-1: /YYYY/slug → /it/slug/ (IT articles — permalink WP con solo anno)
  const yearSlugMatch = path.match(YEAR_SLUG_RE);
  if (yearSlugMatch) return redirect('/it/' + yearSlugMatch[2] + '/', 301);

  // Fix-3a: /project/numero-N-{titolo} → /it/archivio/oel-N/
  const projectNumeroMatch = path.match(PROJECT_NUMERO_RE);
  if (projectNumeroMatch) return redirect('/it/archivio/oel-' + projectNumeroMatch[1] + '/', 301);

  // Fix-3b: /project/* → /it/archivio/
  if (PROJECT_ANY_RE.test(path)) return redirect('/it/archivio/', 301);

  // Fix-5: /n-N → /it/archivio/oel-N/
  const nMatch = path.match(NUMERO_SHORT_RE);
  if (nMatch) return redirect('/it/archivio/oel-' + nMatch[1] + '/', 301);

  // Fix-6: /insieme/insieme-n-N → /it/archivio/ins-N/
  const insiemeMatch = path.match(INSIEME_RE);
  if (insiemeMatch) return redirect('/it/archivio/ins-' + insiemeMatch[1] + '/', 301);

  return next();
});
