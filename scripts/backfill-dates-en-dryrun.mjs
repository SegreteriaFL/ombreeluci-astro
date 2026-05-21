import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
require('dotenv').config();

const TOKEN = process.env.DIRECTUS_TOKEN || process.env.DIRECTUS_ADMIN_TOKEN;
const BASE = 'https://cms.ombreeluci.it';

async function fetchAll(urlParams) {
  const r = await fetch(`${BASE}/items/articoli?${urlParams}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const d = await r.json();
  if (d.errors) throw new Error(JSON.stringify(d.errors));
  return d.data || [];
}

// Step 1: tutti EN con traduzione
const enParams = new URLSearchParams({
  'filter[lang][_eq]': 'en',
  'filter[articolo_traduzione][_nnull]': 'true',
  fields: 'id,slug,data_pubblicazione,articolo_traduzione',
  limit: '-1',
});
const enArts = await fetchAll(enParams);
console.log(`EN con traduzione: ${enArts.length}`);

// Raccogli UUID IT unici
const itUUIDs = [...new Set(enArts.map(a => a.articolo_traduzione))];
console.log(`UUID IT unici: ${itUUIDs.length}`);

// Batch fetch IT in chunk da 200
const itMap = {};
const CHUNK = 200;
for (let i = 0; i < itUUIDs.length; i += CHUNK) {
  const chunk = itUUIDs.slice(i, i + CHUNK);
  const p = new URLSearchParams({
    'filter[id][_in]': chunk.join(','),
    fields: 'id,slug,data_pubblicazione',
    limit: String(CHUNK),
  });
  const res = await fetchAll(p);
  res.forEach(a => { itMap[a.id] = a; });
  process.stdout.write(`\r  Fetch IT: ${Math.min(i + CHUNK, itUUIDs.length)}/${itUUIDs.length}`);
}
console.log(`\nIT recuperati: ${Object.keys(itMap).length}`);

// Step 2: dry-run
let toUpdate = 0, skip = 0, noIt = 0;
const TS = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const logPath = `scripts/logs/backfill-dates-en-${TS}-dryrun.csv`;
const lines = ['id_en,slug_en,data_en_attuale,id_it,slug_it,data_it_nuova,azione'];

for (const en of enArts) {
  const it = itMap[en.articolo_traduzione];
  if (!it) {
    noIt++;
    lines.push([en.id, en.slug, en.data_pubblicazione, '', '', '', 'SKIP_NO_IT'].join(','));
    continue;
  }
  if (en.data_pubblicazione === it.data_pubblicazione) {
    skip++;
    lines.push([en.id, en.slug, en.data_pubblicazione, it.id, it.slug, it.data_pubblicazione, 'SKIP'].join(','));
  } else {
    toUpdate++;
    lines.push([en.id, en.slug, en.data_pubblicazione, it.id, it.slug, it.data_pubblicazione, 'UPDATE'].join(','));
  }
}

fs.writeFileSync(logPath, lines.join('\n') + '\n');

console.log('\n=== DRY-RUN BACKFILL-DATES-EN ===');
console.log(`Da aggiornare (EN date != IT date): ${toUpdate}`);
console.log(`Già uguali (SKIP):                  ${skip}`);
console.log(`IT non trovato (SKIP_NO_IT):        ${noIt}`);
console.log(`Log: ${logPath}`);

// Prime 20 UPDATE
const updateRows = lines.filter(l => l.endsWith('UPDATE')).slice(0, 20);
console.log('\n--- Prime 20 da aggiornare ---');
updateRows.forEach(r => {
  const p = r.split(',');
  console.log(`  ${p[1]} | ${p[2]} → ${p[5]} (IT: ${p[4]})`);
});

// 3 SKIP per sanity check
const skipRows = lines.filter(l => l.endsWith('SKIP')).slice(0, 3);
console.log('\n--- 3 esempi già uguali ---');
skipRows.forEach(r => { const p = r.split(','); console.log(`  ${p[1]} | ${p[2]}`); });
