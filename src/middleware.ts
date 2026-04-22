import { defineMiddleware } from 'astro:middleware';
import redirectsLegacy from './data/redirects-legacy.json';

const REDIRECTS: Record<string, string> = redirectsLegacy;

// Regex per redirect WordPress date-based: /YYYY/MM/DD/slug/ → /slug/
// Copre 15.582 URL WordPress, gestita qui invece che nel CF Worker esterno.
const DATE_PATH_RE = /^\/\d{4}\/\d{2}\/\d{2}\/(.+)$/;

// Variante senza giorno: /YYYY/MM/slug/ → /slug/ (era in public/_redirects, ora in middleware)
const YEAR_MONTH_SLUG_RE = /^\/\d{4}\/\d{2}\/([^/]+?)\/?$/;

// Fase 2 i18n: redirect articoli EN dalla vecchia URL al nuovo prefisso /en/.
// Pattern: /blog/[qualsiasi-slug]-en  (con o senza trailing slash)
// Target:  /en/[qualsiasi-slug]       (suffisso -en rimosso, URL canonico EN)
const BLOG_EN_SLUG_RE = /^\/blog\/([^/]+)-en\/?$/;

// URL-01: diari spostati da root a /diari/ — redirect 301 per backward compat.
const DIARIO_RE = /^(\/diario-di-[^/]+)\/?$/;

// URL-01: vecchi URL articoli IT /blog/slug → /slug/ (1 hop, con e senza trailing slash).
// Esclude /blog/en (EN index) e /blog/*-en (gestiti dalla EN rule sopra).
const BLOG_IT_SLUG_RE = /^\/blog\/([^/]+?)\/?$/;

export const onRequest = defineMiddleware(({ url, redirect }, next) => {
  const path = url.pathname;
  const search = url.search ?? '';

  // URL-01 pre-step: /diario-di-* → /diari/diario-di-* (301 permanente)
  const diarioMatch = path.match(DIARIO_RE);
  if (diarioMatch) {
    return redirect('/diari' + diarioMatch[1] + '/', 301);
  }

  // Rule EN: /blog/slug-en/ → /en/slug/  (301 permanente, Fase 2 i18n)
  // Va prima della IT rule per evitare che slug-en venga catchato da BLOG_IT_SLUG_RE.
  const enMatch = path.match(BLOG_EN_SLUG_RE);
  if (enMatch) {
    return redirect('/en/' + enMatch[1] + '/', 301);
  }

  // URL-01: /blog/slug → /slug/ (301, 1 hop — sia con che senza trailing slash)
  const blogItMatch = path.match(BLOG_IT_SLUG_RE);
  if (blogItMatch && blogItMatch[1] !== 'en') {
    return redirect('/' + blogItMatch[1] + '/', 301);
  }

  // Rule C+D: mappature arbitrarie slug legacy (1.001 voci)
  const target = REDIRECTS[path];
  if (target) {
    return redirect('https://ombreeluci.it' + target, 301);
  }

  // Rule B: /YYYY/MM/DD/slug/ → /slug/ (URL-01: non più via /blog/)
  const dateMatch = path.match(DATE_PATH_RE);
  if (dateMatch) {
    return redirect('https://ombreeluci.it/' + dateMatch[1], 301);
  }

  // Rule B2: /YYYY/MM/slug/ → /slug/ (variante senza giorno, ex public/_redirects)
  const ymMatch = path.match(YEAR_MONTH_SLUG_RE);
  if (ymMatch) {
    return redirect('https://ombreeluci.it/' + ymMatch[1], 301);
  }

  return next();
});
