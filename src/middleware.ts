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

  return next();
});
