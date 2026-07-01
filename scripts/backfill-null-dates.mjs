/**
 * BACKFILL-NULL-DATES — assegna data_pubblicazione agli articoli con NULL
 *
 * Copre i 29 articoli IT importati da WP che hanno perso la data
 * durante l'import (upsert con data_pubblicazione fuori da compare_fields).
 *
 * Fonte date: articoli_semantici_FULL_2026.json (campo meta.date, con ore:minuti:secondi)
 * Fallback: articoli_wp_puliti.json (campo date, solo giorno → T12:00:00)
 * Matching: wp_id in Directus → id in JSON
 *
 * Aggiorna anche le traduzioni EN collegate (stessa data dell'IT).
 *
 * Usage:
 *   node scripts/backfill-null-dates.mjs          # dry run
 *   node scripts/backfill-null-dates.mjs --apply  # applica
 */

import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('dotenv').config({ path: '.env.local' });

const TOKEN = process.env.DIRECTUS_TOKEN || process.env.DIRECTUS_ADMIN_TOKEN;
const BASE = process.env.DIRECTUS_URL || 'https://cms.ombreeluci.it';
const DRY_RUN = !process.argv.includes('--apply');

if (!TOKEN) { console.error('DIRECTUS_TOKEN mancante'); process.exit(1); }

console.log(`Modo: ${DRY_RUN ? 'DRY RUN' : 'APPLICA'}`);
console.log();

// ── Step 1: dizionario wp_id → data con timestamp completo ───────────────────
const fullJson = JSON.parse(fs.readFileSync('scripts_and_data/datasets/articoli/articoli_semantici_FULL_2026.json', 'utf8'));
const fullDict = {};
for (const r of fullJson) {
  const d = r.meta?.date;
  if (d) fullDict[String(r.id)] = d.replace(' ', 'T');
}

// Fallback: wp_puliti (solo giorno)
const pulitiJson = JSON.parse(fs.readFileSync('scripts_and_data/datasets/articoli/articoli_wp_puliti.json', 'utf8'));
const pulitiDict = {};
for (const r of pulitiJson) {
  if (r.date && r.wp_id) pulitiDict[String(r.wp_id)] = r.date + 'T12:00:00';
}

console.log(`Date complete (FULL_2026): ${Object.keys(fullDict).length}`);
console.log(`Date fallback (wp_puliti): ${Object.keys(pulitiDict).length}`);
console.log();

// ── Step 2: fetch articoli IT con data_pubblicazione NULL e wp_id ────────────
async function fetchNullDateArticles(lang) {
  const params = new URLSearchParams({
    'filter[data_pubblicazione][_null]': 'true',
    'filter[stato][_eq]': 'published',
    'filter[lang][_eq]': lang,
    'filter[wp_id][_nnull]': 'true',
    fields: 'id,wp_id,slug,data_pubblicazione,articolo_traduzione',
    limit: '-1',
  });
  const resp = await fetch(`${BASE}/items/articoli?${params}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const json = await resp.json();
  if (json.errors) { console.error('Errore Directus:', JSON.stringify(json.errors)); process.exit(1); }
  return json.data || [];
}

const itArticles = await fetchNullDateArticles('it');
console.log(`Articoli IT con data NULL e wp_id: ${itArticles.length}`);

// ── Step 3: match e aggiorna ─────────────────────────────────────────────────
let okIT = 0, okEN = 0, noMatch = 0, errCount = 0;

for (const art of itArticles) {
  const wpId = String(art.wp_id);
  const newDate = fullDict[wpId] || pulitiDict[wpId];

  if (!newDate) {
    console.log(`  SKIP ${art.slug} (wp_id=${wpId}) — nessuna data trovata nei dataset`);
    noMatch++;
    continue;
  }

  console.log(`  ${DRY_RUN ? 'WOULD' : 'PATCH'} ${art.slug}  wp_id=${wpId}  → ${newDate}`);

  if (!DRY_RUN) {
    try {
      // Aggiorna IT
      const r = await fetch(`${BASE}/items/articoli/${art.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data_pubblicazione: newDate }),
      });
      const d = await r.json();
      if (d.errors) {
        console.error(`    ERR IT: ${d.errors[0].message}`);
        errCount++;
        continue;
      }
      okIT++;

      // Aggiorna EN collegato (stessa data)
      if (art.articolo_traduzione) {
        const rEn = await fetch(`${BASE}/items/articoli/${art.articolo_traduzione}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ data_pubblicazione: newDate }),
        });
        const dEn = await rEn.json();
        if (dEn.errors) {
          console.error(`    ERR EN: ${dEn.errors[0].message}`);
        } else {
          okEN++;
          console.log(`    + EN traduzione aggiornata`);
        }
      }
    } catch (e) {
      console.error(`    ERR: ${e.message}`);
      errCount++;
    }
  }
}

console.log();
console.log('=== Riepilogo ===');
console.log(`IT aggiornati: ${DRY_RUN ? itArticles.length - noMatch + ' (previsti)' : okIT}`);
console.log(`EN aggiornati: ${DRY_RUN ? '?' : okEN}`);
console.log(`Senza match: ${noMatch}`);
console.log(`Errori: ${errCount}`);

if (DRY_RUN) {
  console.log('\nRiesegui con --apply per applicare.');
}
