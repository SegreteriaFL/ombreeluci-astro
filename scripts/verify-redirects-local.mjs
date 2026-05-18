#!/usr/bin/env node
/**
 * verify-redirects-local.mjs
 *
 * Simula la logica redirect in locale (NO HTTP request).
 * Applica gli stessi layer del CF Worker + middleware Astro + astro.config.mjs
 * a ogni URL dalla sitemap WP.
 *
 * Input:  scripts/wp-urls.txt (3500 URL WP scaricati dalla sitemap)
 * Output: scripts/redirect-report.json + scripts/redirect-report.md
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// ── Layer 1: redirects-legacy.json (1001 voci, chiavi senza host) ──────────
const legacyRaw = JSON.parse(readFileSync(path.join(ROOT, 'src/data/redirects-legacy.json'), 'utf-8'));

// ── Layer 2: astro.config.mjs static redirects ─────────────────────────────
const ASTRO_REDIRECTS = {
  '/dona': '/it/sostienici',
  '/contribuisci': '/it/sostienici',
  '/about': '/it/chi-siamo',
  '/archivio': '/it/archivio',
  '/autori': '/it/autori',
  '/categoria': '/it/categoria',
  '/cerca': '/it/cerca',
  '/chi-siamo': '/it/chi-siamo',
  '/chi-siamo/la-rivista': '/it/chi-siamo',
  '/chi-siamo/la-redazione': '/it/chi-siamo',
  '/chi-siamo/redazione-storica': '/it/chi-siamo',
  '/chi-siamo/collaboratori': '/it/chi-siamo',
  '/chi-siamo/hanno-scritto-per-noi': '/it/chi-siamo',
  '/chi-siamo/contatti': '/it/chi-siamo',
  '/diari': '/it/diari',
  '/newsletter': '/it/newsletter',
  '/rubriche': '/it/rubriche',
  '/sostienici': '/it/sostienici',
  '/tag': '/it/tag',
  '/blog/en': '/en/',
  '/studiosi-educatori-e-attivisti-ombre-e-luci': '/it/studiosi-educatori-attivisti/',
};

// ── Layer 3: middleware ARCHIVIO_REDIRECTS ─────────────────────────────────
const ARCHIVIO_REDIRECTS = {
  '/it/archivio/ins--2/': '/it/archivio/ins-31/',
  '/it/archivio/ins--3/': '/it/archivio/ins-32/',
  '/it/categoria/catechesi': '/it/categoria/spiritualita/',
  '/it/categoria/catechesi/': '/it/categoria/spiritualita/',
};

// ── Layer 4: middleware regex ──────────────────────────────────────────────
const DATE_PATH_RE        = /^\/\d{4}\/\d{2}\/\d{2}\/(.+)$/;   // /YYYY/MM/DD/slug
const YEAR_MONTH_SLUG_RE  = /^\/\d{4}\/\d{2}\/([^/]+?)\/?$/;   // /YYYY/MM/slug
const BLOG_EN_SLUG_RE     = /^\/blog\/([^/]+)-en\/?$/;           // /blog/slug-en
const DIARIO_RE           = /^(\/diario-di-[^/]+)\/?$/;          // /diario-di-nome
const BLOG_IT_SLUG_RE     = /^\/blog\/([^/]+?)\/?$/;             // /blog/slug

// ── Layer 5/6 — fix implementati nel middleware ────────────────────────────
const EN_YEAR_SLUG_RE     = /^\/en\/(\d{4})\/([^/]+?)\/?$/;    // Fix-2: /en/YYYY/slug
const YEAR_SLUG_RE        = /^\/(\d{4})\/([^/]+?)\/?$/;        // Fix-1: /YYYY/slug
const PROJECT_NUMERO_RE   = /^\/project\/numero-(\d+)-/;        // Fix-3
const PROJECT_ROOT_RE     = /^\/project\/?$/;
const NUMERO_SHORT_RE     = /^\/n-(\d+)\/?$/;                  // Fix-5: /n-N/
const INSIEME_RE          = /^\/insieme\/insieme-n-(\d+)\/?$/; // Fix-6

// ── Pagine statiche valide (lista approssimativa per validare target) ───────
const VALID_IT_PATHS = new Set([
  '/it/chi-siamo', '/it/archivio', '/it/autori', '/it/cerca', '/it/newsletter',
  '/it/sostienici', '/it/rubriche', '/it/diari', '/it/focus', '/en/',
  '/it/studiosi-educatori-attivisti',
]);

/**
 * Simula la logica redirect. Restituisce { target, layer, note }.
 * target=null significa nessun redirect trovato → potenziale 404.
 */
function simulateRedirect(rawPath) {
  // normalizza: rimuovi trailing slash per confronti
  const path = rawPath.endsWith('/') && rawPath.length > 1
    ? rawPath.slice(0, -1)
    : rawPath;
  const pathSlash = rawPath.endsWith('/') ? rawPath : rawPath + '/';

  // Layer 1: astro.config.mjs
  if (ASTRO_REDIRECTS[path]) return { target: ASTRO_REDIRECTS[path], layer: 'astro-config', note: '' };
  if (ASTRO_REDIRECTS[pathSlash]) return { target: ASTRO_REDIRECTS[pathSlash], layer: 'astro-config', note: '' };

  // Layer 2: archivio redirects
  if (ARCHIVIO_REDIRECTS[path]) return { target: ARCHIVIO_REDIRECTS[path], layer: 'archivio', note: '' };
  if (ARCHIVIO_REDIRECTS[pathSlash]) return { target: ARCHIVIO_REDIRECTS[pathSlash], layer: 'archivio', note: '' };

  // Layer 3: middleware blog-en
  const enMatch = pathSlash.match(BLOG_EN_SLUG_RE);
  if (enMatch) return { target: '/en/' + enMatch[1] + '/', layer: 'middleware-blog-en', note: '' };

  // Layer 4: diario
  const diarioMatch = pathSlash.match(DIARIO_RE);
  if (diarioMatch) return { target: '/it/diari' + diarioMatch[1] + '/', layer: 'middleware-diario', note: '' };

  // Layer 5: blog-it
  const blogItMatch = pathSlash.match(BLOG_IT_SLUG_RE);
  if (blogItMatch && blogItMatch[1] !== 'en') return { target: '/it/' + blogItMatch[1] + '/', layer: 'middleware-blog-it', note: '' };

  // Layer 6: redirects-legacy.json (exact path match, con e senza slash)
  const legacyTarget = legacyRaw[pathSlash] || legacyRaw[path + '/'] || legacyRaw[path];
  if (legacyTarget) return { target: legacyTarget, layer: 'legacy-json', note: '' };

  // Layer 7: date-based /YYYY/MM/DD/slug
  const dateMatch = pathSlash.match(DATE_PATH_RE);
  if (dateMatch) return { target: '/it/' + dateMatch[1], layer: 'middleware-date-yyyymmdd', note: '' };

  // Layer 8: /YYYY/MM/slug
  const ymMatch = pathSlash.match(YEAR_MONTH_SLUG_RE);
  if (ymMatch) return { target: '/it/' + ymMatch[1] + '/', layer: 'middleware-date-yyyymm', note: '' };

  // Layer 9 (Fix-2): /en/YYYY/slug → /en/slug/
  const enYearSlugMatch = pathSlash.match(EN_YEAR_SLUG_RE);
  if (enYearSlugMatch) return { target: '/en/' + enYearSlugMatch[2] + '/', layer: 'fix2-en-year-slug', note: '' };

  // Layer 10 (Fix-1): /YYYY/slug → /it/slug/
  const yearSlugMatch = pathSlash.match(YEAR_SLUG_RE);
  if (yearSlugMatch) return { target: '/it/' + yearSlugMatch[2] + '/', layer: 'fix1-year-slug', note: '' };

  // Layer 11 (Fix-3): /project/numero-N-* → /it/archivio/oel-N/
  const projectRoot = pathSlash.match(PROJECT_ROOT_RE);
  if (projectRoot) return { target: '/it/archivio/', layer: 'fix3-project-root', note: '' };

  const projectNumero = pathSlash.match(PROJECT_NUMERO_RE);
  if (projectNumero) return { target: `/it/archivio/oel-${projectNumero[1]}/`, layer: 'fix3-project-numero', note: '' };

  if (pathSlash.startsWith('/project/')) return { target: '/it/archivio/', layer: 'fix3-project-other', note: '' };

  // Layer 12 (Fix-5): /n-N/ → /it/archivio/oel-N/
  const nMatch = pathSlash.match(NUMERO_SHORT_RE);
  if (nMatch) return { target: '/it/archivio/oel-' + nMatch[1] + '/', layer: 'fix5-n-short', note: '' };

  // Layer 13 (Fix-6): /insieme/insieme-n-N/ → /it/archivio/ins-N/
  const insiemeMatch = pathSlash.match(INSIEME_RE);
  if (insiemeMatch) return { target: '/it/archivio/ins-' + insiemeMatch[1] + '/', layer: 'fix6-insieme', note: '' };

  return { target: null, layer: 'MISSING', note: 'nessun redirect trovato' };
}

// ── Main ───────────────────────────────────────────────────────────────────

const wpUrlsPath = path.join(__dirname, 'wp-urls.txt');
if (!existsSync(wpUrlsPath)) {
  console.error('ERRORE: scripts/wp-urls.txt non trovato. Scarica prima la sitemap WP.');
  process.exit(1);
}

const rawUrls = readFileSync(wpUrlsPath, 'utf-8').split('\n').map(l => l.trim()).filter(Boolean);

const results = {
  ok: [],
  gap_covered: [],   // coperto da layer GAP (logica mancante → da aggiungere al middleware)
  missing: [],       // nessun redirect
  to_homepage: [],   // redirect verso / o /it/ (SEO loss)
};

const byLayer = {};

for (const rawUrl of rawUrls) {
  let urlPath;
  try {
    urlPath = new URL(rawUrl).pathname;
  } catch {
    continue;
  }

  // Salta homepage e sitemap
  if (urlPath === '/' || urlPath === '/sitemap.xml') continue;

  const { target, layer, note } = simulateRedirect(urlPath);

  byLayer[layer] = (byLayer[layer] || 0) + 1;

  const entry = { url: rawUrl, path: urlPath, target, layer, note };

  if (!target) {
    results.missing.push(entry);
  } else if (target === '/' || target === '/it/' || target === '/en/') {
    results.to_homepage.push(entry);
  } else if (layer.startsWith('GAP-')) {
    results.gap_covered.push(entry);
  } else {
    results.ok.push(entry);
  }
}

const total = results.ok.length + results.gap_covered.length + results.missing.length + results.to_homepage.length;

// ── Report JSON ────────────────────────────────────────────────────────────
const logsDir = path.join(__dirname);
const jsonReport = {
  totale: total,
  ok: results.ok.length,
  gap_covered: results.gap_covered.length,
  missing: results.missing.length,
  to_homepage: results.to_homepage.length,
  by_layer: byLayer,
  missing_urls: results.missing.map(e => e.path),
  gap_urls: results.gap_covered.slice(0, 20).map(e => ({ path: e.path, target: e.target, layer: e.layer })),
  to_homepage_urls: results.to_homepage.map(e => e.path),
};

writeFileSync(path.join(logsDir, 'redirect-report.json'), JSON.stringify(jsonReport, null, 2));

// ── Report Markdown ────────────────────────────────────────────────────────
const okPct = ((results.ok.length / total) * 100).toFixed(1);
const gapPct = ((results.gap_covered.length / total) * 100).toFixed(1);
const missingPct = ((results.missing.length / total) * 100).toFixed(1);
const homePct = ((results.to_homepage.length / total) * 100).toFixed(1);

const layerRows = Object.entries(byLayer)
  .sort((a, b) => b[1] - a[1])
  .map(([l, n]) => `| ${l} | ${n} |`)
  .join('\n');

const missingRows = results.missing.slice(0, 50)
  .map(e => `| \`${e.path}\` | — |`)
  .join('\n');

const gapRows = results.gap_covered.slice(0, 20)
  .map(e => `| \`${e.path}\` | \`${e.target}\` | ${e.layer} |`)
  .join('\n');

const homepageRows = results.to_homepage
  .map(e => `| \`${e.path}\` | \`${e.target}\` |`)
  .join('\n');

const md = `# Redirect Report — ${new Date().toISOString().slice(0, 10)}

## Riepilogo

| Categoria | Numero | % |
|---|---|---|
| **Totale URL analizzati** | **${total}** | 100% |
| ✅ OK — redirect coperto | ${results.ok.length} | ${okPct}% |
| ⚠️ GAP_COVERED — logica mancante nel middleware (fix facile) | ${results.gap_covered.length} | ${gapPct}% |
| 🔴 MISSING — nessun redirect trovato | ${results.missing.length} | ${missingPct}% |
| 🟠 TO_HOMEPAGE — redirect verso homepage (SEO loss) | ${results.to_homepage.length} | ${homePct}% |

## Distribuzione per layer

| Layer | URL |
|---|---|
${layerRows}

## ⚠️ GAP_COVERED — logica mancante (da aggiungere al middleware prima del cutover)

Questi URL hanno un redirect valido **concettualmente** ma il layer che lo gestisce
non esiste ancora nel codice. Aggiungere le regex mancanti in \`src/middleware.ts\`.

(Mostra primi 20 su ${results.gap_covered.length})

| Path WP | Target Astro | Layer mancante |
|---|---|---|
${gapRows}

## 🔴 MISSING — URL senza nessun redirect

${results.missing.length === 0 ? '_Nessuno — ottimo!_' : `Questi URL andrebbero a 404 dopo il cutover. Da analizzare e fixare.
(Mostra primi 50 su ${results.missing.length})

| Path WP | Azione suggerita |
|---|---|
${missingRows}`}

## 🟠 TO_HOMEPAGE — redirect verso homepage (SEO loss)

${results.to_homepage.length === 0 ? '_Nessuno — ottimo!_' : `Questi URL vengono redirectati alla homepage invece che al contenuto specifico.

| Path WP | Target attuale |
|---|---|
${homepageRows}`}

---
_Generato da scripts/verify-redirects-local.mjs — simulazione locale, NO HTTP request_
`;

writeFileSync(path.join(logsDir, 'redirect-report.md'), md);

// ── Console output ─────────────────────────────────────────────────────────
console.log(`\n📊 REDIRECT REPORT — ${total} URL analizzati\n`);
console.log(`  ✅ OK (redirect coperto):           ${results.ok.length} (${okPct}%)`);
console.log(`  ⚠️  GAP_COVERED (fix facile):        ${results.gap_covered.length} (${gapPct}%)`);
console.log(`  🔴 MISSING (potenziale 404):         ${results.missing.length} (${missingPct}%)`);
console.log(`  🟠 TO_HOMEPAGE (SEO loss):           ${results.to_homepage.length} (${homePct}%)\n`);
console.log(`📁 Report: scripts/redirect-report.md`);
console.log(`📁 JSON:   scripts/redirect-report.json\n`);

if (results.missing.length > 0) {
  console.log(`🔴 Primi 10 MISSING:`);
  results.missing.slice(0, 10).forEach(e => console.log(`   ${e.path}`));
}

if (results.gap_covered.length > 0) {
  console.log(`\n⚠️  Layer GAP più frequenti:`);
  Object.entries(byLayer)
    .filter(([l]) => l.startsWith('GAP-'))
    .sort((a, b) => b[1] - a[1])
    .forEach(([l, n]) => console.log(`   ${l}: ${n} URL`));
}
