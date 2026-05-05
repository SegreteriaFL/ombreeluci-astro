#!/usr/bin/env node
/**
 * Smoke test i18n shell EN: asserisce assenza di residui IT noti nel chrome
 * e presenza di stringhe EN critiche (header/mega).
 *
 * Base URL
 *   Default: http://localhost:4321 — solo se il dev è davvero su quella porta.
 *   Astro, se 4321 è occupata, usa 4322, 4323, 4324, …: usa la stessa porta
 *   della riga «Local http://localhost:…» stampata da `npm run dev`.
 *   In genere `http://localhost:PORT` è la scelta più sicura (allineata al browser).
 *
 * PowerShell (stessa sessione del terminale dove gira il dev):
 *   $env:SMOKE_BASE_URL = "http://localhost:4324"
 *   npm run test:smoke
 *
 * Con articolo EN (SSR):
 *   $env:SMOKE_BASE_URL = "http://localhost:4324"
 *   $env:SMOKE_EN_ARTICLE = "/blog/adesso-saremo-tutti-diversi-en/"
 *   npm run test:smoke
 *
 * Per forzare dev su 127.0.0.1:4321 quando la porta è libera:
 *   npm run dev:local
 *
 * Produzione / staging:
 *   SMOKE_BASE_URL=https://… node scripts/smoke-i18n.mjs
 */

const DEFAULT_BASE = 'http://localhost:4321';
const BASE = (process.env.SMOKE_BASE_URL || DEFAULT_BASE).replace(/\/$/, '');

const FETCH_TROUBLESHOOT = `
Se vedi ECONNREFUSED o «fetch failed»:
  1. Avvia il dev server (npm run dev) e leggi la porta nella riga «Local http://localhost:XXXX/».
  2. Imposta SMOKE_BASE_URL con quella porta (es. http://localhost:4324), non un numero a caso.
  3. Non usare 127.0.0.1:4321 se Astro è in ascolto solo su localhost:4324 (stessa porta, host coerente).

Esempio:
  $env:SMOKE_BASE_URL = "http://localhost:4324"
  npm run test:smoke
`;

/** Residui italiani del chrome pre-fix (audit NO-GO). */
const IT_CHROME_BAD = [
  'Selezione lingua',
  'Servizi e utilità',
  'Menu di navigazione',
];

/** Devono comparire nel markup della listing EN. */
const EN_CHROME_REQUIRED = ['Language selection', 'Services and utilities', 'Navigation menu'];

async function fetchText(path) {
  const url = `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const text = await res.text();
    return { res, text, url };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    fail(
      `Connessione a ${url} fallita: ${msg}\n${FETCH_TROUBLESHOOT}`
    );
  }
}

function fail(msg) {
  console.error(`\x1b[31mFAIL\x1b[0m ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`\x1b[32mOK\x1b[0m ${msg}`);
}

async function assertNoItalianChrome(html, label) {
  for (const s of IT_CHROME_BAD) {
    if (html.includes(s)) {
      fail(`${label}: residue IT chrome: "${s}"`);
    }
  }
}

async function assertEnChrome(html, label) {
  for (const s of EN_CHROME_REQUIRED) {
    if (!html.includes(s)) {
      fail(`${label}: manca stringa EN attesa: "${s}"`);
    }
  }
}

async function main() {
  console.log(`SMOKE_BASE_URL=${BASE}${process.env.SMOKE_BASE_URL ? '' : ` (default ${DEFAULT_BASE}; se il dev usa un'altra porta, esporta SMOKE_BASE_URL)`}\n`);

  const listing = await fetchText('/en/');
  if (listing.res.status !== 200) {
    fail(`/en/ → HTTP ${listing.res.status} (${listing.url})`);
  }
  await assertNoItalianChrome(listing.text, '/en/');
  await assertEnChrome(listing.text, '/en/');
  ok('/en/ — chrome EN senza residui IT noti');

  const articlePath = process.env.SMOKE_EN_ARTICLE?.trim();
  if (articlePath) {
    const art = await fetchText(articlePath);
    if (art.res.status !== 200) {
      console.warn(`\x1b[33mSKIP\x1b[0m articolo SSR (${articlePath}): HTTP ${art.res.status}`);
    } else {
      await assertNoItalianChrome(art.text, articlePath);
      await assertEnChrome(art.text, articlePath);
      ok(`${articlePath} — chrome EN`);
    }
  } else {
    console.log('\x1b[90m(skip articolo SSR: imposta SMOKE_EN_ARTICLE=/blog/…-en/)\x1b[0m');
  }

  console.log('\n\x1b[32mTutti i controlli smoke i18n sono passati.\x1b[0m');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
