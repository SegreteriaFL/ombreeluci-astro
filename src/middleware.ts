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
  // Rule Q0 (porting da cf-worker/redirect-worker.js, FASE1-01 2026-08-10): variante bare
  // senza /it/, controllata prima della Rule Q generica altrimenti '/categoria/catechesi'
  // finirebbe su '/it/categoria/catechesi/' invece che sul redirect a spiritualità.
  '/categoria/catechesi': '/it/categoria/spiritualita/',
  '/categoria/catechesi/': '/it/categoria/spiritualita/',
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
// Rule I (porting FASE1-01): anche /project_category/* nel Worker, non solo /project/*.
const PROJECT_ANY_RE    = /^\/project[/_]/;                // /project/* o /project_category/* → /it/archivio/

// Fix-5: shortlink numeri rivista /n-N/ → /it/archivio/oel-N/
const NUMERO_SHORT_RE = /^\/n-(\d+)\/?$/;

// Fix-6: bollettino Insieme /insieme/insieme-n-N/ → /it/archivio/ins-N/
const INSIEME_RE = /^\/insieme\/insieme-n-(\d+)\/?$/;

// Fix-7: sfogliabili rivista con anno /it/ombre(-e)?-luci-n-N-YYYY-sfogliabile/ → /it/archivio/oel-N/
const SFOGLIABILE_RE = /^\/it\/ombre(?:-e)?-luci-n-(\d+)-\d{4}-sfogliabile\/?$/;

// --- Porting da cf-worker/redirect-worker.js (FASE1-01, 2026-08-10) ---
// Audit Fase 0 (DECISIONE-STAGING.md Appendice A8) ha trovato queste regole del Worker
// senza equivalente in Astro — necessarie prima di poter ritirare il Worker (Fase 2).

// Rule E: /page/N/ (vecchia paginazione WP) → /it/archivio/
const PAGE_RE = /^\/page\/\d+\/?$/;

// Rule J+N unificate: /author/slug/ e /autori/slug/ (bare, senza /it/) → /it/autori/slug/.
// Nel Worker sono due regole distinte ma producono lo stesso target via semplice
// concatenazione di stringa (nessun lookup dati) — unificabili senza rischio.
const AUTORI_BARE_RE = /^\/(?:author|autori)\/([^/]+)\/?$/;

// Rule M: /archivio/oel-N/ o /archivio/ins-N/ (bare, senza /it/) → /it/archivio/oel-N|ins-N/
const ARCHIVIO_BARE_RE = /^\/archivio\/((?:oel|ins)-\d+)\/?$/;

// Rule Q: /categoria/slug/ (bare, senza /it/) → /it/categoria/slug/.
// La variante /categoria/catechesi è già gestita sopra in ARCHIVIO_REDIRECTS (Rule Q0),
// controllata prima di questa regola generica.
const CATEGORIA_BARE_RE = /^\/categoria\/([^/]+)\/?$/;

// Rule R: /it/* e /en/* senza trailing slash → 301 con slash (canonical SEO).
// Stessa logica esatta del Worker, non l'opzione nativa astro.config.mjs trailingSlash
// (comportamento non verificato per route dinamiche/nested — replicare 1:1 è più sicuro).
const TRAILING_SLASH_RE = /^\/(it|en)\//;

export const onRequest = defineMiddleware(async ({ url, redirect, request }, next) => {
  // Il noindex deve dipendere dall'host REALE della richiesta, non da una variabile
  // di build: pages.dev e ombreeluci.it servono lo stesso identico deployment/build,
  // quindi un controllo su PUBLIC_SITE_URL (env var, fissa per tutto il build) risulta
  // "produzione" per entrambi gli host — bug confermato 2026-08-09, pages.dev raggiunto
  // direttamente non riceveva alcun X-Robots-Tag. Va confrontato l'host effettivo.
  const isRealProdHost = url.hostname === 'ombreeluci.it' || url.hostname === 'www.ombreeluci.it';
  if (!isRealProdHost) {
    const response = await next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

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

  // Fallback su path decodificato (porting FASE1-01): url.pathname arriva percent-encoded
  // per caratteri non-ASCII (es. /メリークリスマス/ → /%E3%83%A1.../), le chiavi del JSON
  // sono invece UTF-8 raw — senza questo fallback quelle 2 voci non matchano mai.
  const decodedPath = (() => { try { return decodeURIComponent(path); } catch { return path; } })();
  const target = REDIRECTS[path] || REDIRECTS[decodedPath];
  if (target) return redirect('https://ombreeluci.it' + target, 301);

  const pageMatch = path.match(PAGE_RE);
  if (pageMatch) return redirect('/it/archivio/', 301);

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

  // Fix-7: /it/ombre(-e)?-luci-n-N-YYYY-sfogliabile/ → /it/archivio/oel-N/
  const sfogliabileMatch = path.match(SFOGLIABILE_RE);
  if (sfogliabileMatch) return redirect('/it/archivio/oel-' + sfogliabileMatch[1] + '/', 301);

  // Rule J+N: /author/slug/ o /autori/slug/ (bare) → /it/autori/slug/
  const autoriBareMatch = path.match(AUTORI_BARE_RE);
  if (autoriBareMatch) return redirect('/it/autori/' + autoriBareMatch[1] + '/', 301);

  // Rule M: /archivio/oel-N|ins-N/ (bare) → /it/archivio/oel-N|ins-N/
  const archivioBareMatch = path.match(ARCHIVIO_BARE_RE);
  if (archivioBareMatch) return redirect('/it/archivio/' + archivioBareMatch[1] + '/', 301);

  // Rule Q: /categoria/slug/ (bare) → /it/categoria/slug/ — Rule Q0 (catechesi) già gestita sopra.
  const categoriaBareMatch = path.match(CATEGORIA_BARE_RE);
  if (categoriaBareMatch) return redirect('/it/categoria/' + categoriaBareMatch[1] + '/', 301);

  // Rule R: /it/* e /en/* senza trailing slash → +'/' (esclude file con estensione e /api/).
  if (
    TRAILING_SLASH_RE.test(path) &&
    !path.endsWith('/') &&
    !path.includes('.') &&
    !path.startsWith('/api/')
  ) {
    return redirect(path + '/', 301);
  }

  return next();
});
