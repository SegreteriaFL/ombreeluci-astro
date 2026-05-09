/**
 * BACKFILL-DATES — aggiorna data_pubblicazione con timestamp completi
 * Fonte: scripts_and_data/datasets/articoli/articoli_semantici_FULL_2026.json (meta.date)
 * Matching: wp_id
 * Filtra: solo articoli con data_pubblicazione che termina T00:00:00
 */

import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('dotenv').config();

const TOKEN = process.env.DIRECTUS_TOKEN || process.env.DIRECTUS_ADMIN_TOKEN;
const BASE = 'https://cms.ombreeluci.it';
const BATCH = 50;
const PAUSE_MS = 1000;

const TS = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const LOG_PATH = `scripts/logs/backfill-dates-${TS}.csv`;

// ── Step 1: costruisci dizionario wp_id → ISO timestamp ──────────────────────
const raw = JSON.parse(fs.readFileSync('scripts_and_data/datasets/articoli/articoli_semantici_FULL_2026.json', 'utf8'));
const dict = {};
for (const r of raw) {
  const d = r.meta?.date;
  if (!d || d.endsWith('00:00:00')) continue;
  dict[String(r.id)] = d.replace(' ', 'T');
}
console.log(`Dizionario: ${Object.keys(dict).length} timestamp completi`);

// ── Step 2: recupera articoli Directus con T00:00:00 ─────────────────────────
const params = new URLSearchParams({
  'filter[wp_id][_nnull]': 'true',
  fields: 'id,wp_id,slug,data_pubblicazione',
  limit: '-1',
});
const resp = await fetch(`${BASE}/items/articoli?${params}`, {
  headers: { Authorization: `Bearer ${TOKEN}` },
});
const allData = await resp.json();
if (allData.errors) { console.error('Errore Directus:', JSON.stringify(allData.errors)); process.exit(1); }

const allArts = allData.data || [];
const toUpdate = allArts.filter(a => a.data_pubblicazione?.endsWith('T00:00:00'));
console.log(`Articoli Directus totali con wp_id: ${allArts.length}`);
console.log(`Con T00:00:00: ${toUpdate.length}`);

// Match con dizionario
const matched = toUpdate.filter(a => dict[String(a.wp_id)]);
const skipped = toUpdate.filter(a => !dict[String(a.wp_id)]);
console.log(`Match con timestamp completo: ${matched.length}`);
console.log(`Senza match in FULL_2026 (wp_id non trovato): ${skipped.length}`);

// ── Log CSV ──────────────────────────────────────────────────────────────────
const logLines = ['id,wp_id,slug,data_vecchia,data_nuova,esito'];

// ── Step 3: backfill in batch ─────────────────────────────────────────────────
let ok = 0, err = 0;
for (let i = 0; i < matched.length; i += BATCH) {
  const batch = matched.slice(i, i + BATCH);
  await Promise.all(batch.map(async (a) => {
    const nuova = dict[String(a.wp_id)];
    try {
      const r = await fetch(`${BASE}/items/articoli/${a.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data_pubblicazione: nuova }),
      });
      const d = await r.json();
      if (d.errors) {
        err++;
        logLines.push(`${a.id},${a.wp_id},${a.slug},${a.data_pubblicazione},${nuova},ERR: ${d.errors[0].message}`);
      } else {
        ok++;
        logLines.push(`${a.id},${a.wp_id},${a.slug},${a.data_pubblicazione},${nuova},OK`);
      }
    } catch (e) {
      err++;
      logLines.push(`${a.id},${a.wp_id},${a.slug},${a.data_pubblicazione},${nuova},ERR: ${e.message}`);
    }
  }));
  const progress = Math.min(i + BATCH, matched.length);
  process.stdout.write(`\r  Aggiornati: ${progress}/${matched.length} (${err} errori)    `);
  if (i + BATCH < matched.length) await new Promise(r => setTimeout(r, PAUSE_MS));
}
console.log(`\nCompletato: ${ok} OK, ${err} errori`);

// Aggiungi righe saltate al log
for (const a of skipped) {
  logLines.push(`${a.id},${a.wp_id},${a.slug},${a.data_pubblicazione},,SKIP_NO_MATCH`);
}

fs.writeFileSync(LOG_PATH, logLines.join('\n') + '\n');
console.log(`Log: ${LOG_PATH}`);
console.log(`Aggiornati: ${ok} | Saltati (no match): ${skipped.length} | Errori: ${err}`);
