#!/usr/bin/env node
/**
 * build-en-to-it-index.mjs
 *
 * Genera public/en-to-it-slugs.json:
 *   { "en-slug": "it-slug", ... }
 *
 * Usato da en/[slug].astro per risolvere slug EN → slug IT
 * e poi cercare i correlati in correlati.json (che è indicizzato per slug IT).
 *
 * Eseguire: node scripts/build-en-to-it-index.mjs
 * Aggiunto al prebuild se si vuole rigenera ad ogni build.
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const require = createRequire(import.meta.url);
const dotenvPath = path.join(ROOT, '.env');
try {
  const raw = require('fs').readFileSync(dotenvPath, 'utf-8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
} catch {}

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://cms.ombreeluci.it';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || '';

if (!DIRECTUS_TOKEN) {
  console.error('ERRORE: DIRECTUS_TOKEN non trovato in .env');
  process.exit(1);
}

async function fetchPage(offset) {
  const params = new URLSearchParams({
    'filter[lang][_eq]': 'en',
    'filter[articolo_traduzione][_nnull]': 'true',
    fields: 'slug,articolo_traduzione.slug',
    limit: '500',
    offset: String(offset),
  });
  const res = await fetch(`${DIRECTUS_URL}/items/articoli?${params}`, {
    headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Directus error ${res.status}`);
  return (await res.json()).data;
}

async function main() {
  console.log('Generazione en-to-it-slugs.json...');
  const index = {};
  let offset = 0;
  let total = 0;

  while (true) {
    const page = await fetchPage(offset);
    if (!page || page.length === 0) break;

    for (const a of page) {
      const enSlug = a.slug;
      const itSlug = a.articolo_traduzione?.slug;
      if (enSlug && itSlug) index[enSlug] = itSlug;
    }

    total += page.length;
    offset += page.length;
    process.stdout.write(`\r  Processati: ${total}`);
    if (page.length < 500) break;
  }

  console.log(`\n  Voci nell'indice: ${Object.keys(index).length}/${total}`);

  const outPath = path.join(ROOT, 'public', 'en-to-it-slugs.json');
  writeFileSync(outPath, JSON.stringify(index));
  console.log(`  Scritto: public/en-to-it-slugs.json (${Math.round(Buffer.byteLength(JSON.stringify(index)) / 1024)}KB)`);
}

main().catch(e => { console.error(e); process.exit(1); });
