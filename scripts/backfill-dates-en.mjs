import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
require('dotenv').config();

const TOKEN = process.env.DIRECTUS_TOKEN || process.env.DIRECTUS_ADMIN_TOKEN;
const BASE = 'https://cms.ombreeluci.it';
const BATCH = 50;
const PAUSE_MS = 1000;

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

// Batch fetch IT
const itUUIDs = [...new Set(enArts.map(a => a.articolo_traduzione))];
const itMap = {};
const CHUNK = 200;
for (let i = 0; i < itUUIDs.length; i += CHUNK) {
  const chunk = itUUIDs.slice(i, i + CHUNK);
  const p = new URLSearchParams({ 'filter[id][_in]': chunk.join(','), fields: 'id,slug,data_pubblicazione', limit: String(CHUNK) });
  const res = await fetchAll(p);
  res.forEach(a => { itMap[a.id] = a; });
  process.stdout.write(`\r  Fetch IT: ${Math.min(i + CHUNK, itUUIDs.length)}/${itUUIDs.length}`);
}
console.log(`\nIT recuperati: ${Object.keys(itMap).length}`);

// Filtra da aggiornare
const toUpdate = enArts.filter(en => {
  const it = itMap[en.articolo_traduzione];
  return it && en.data_pubblicazione !== it.data_pubblicazione;
});
console.log(`Da aggiornare: ${toUpdate.length}`);

// Backfill in batch
const TS = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const logPath = `scripts/logs/backfill-dates-en-${TS}.csv`;
const lines = ['id_en,slug_en,data_en_vecchia,id_it,slug_it,data_it_nuova,esito'];

let ok = 0, err = 0;
for (let i = 0; i < toUpdate.length; i += BATCH) {
  const batch = toUpdate.slice(i, i + BATCH);
  await Promise.all(batch.map(async en => {
    const it = itMap[en.articolo_traduzione];
    try {
      const r = await fetch(`${BASE}/items/articoli/${en.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data_pubblicazione: it.data_pubblicazione }),
      });
      const d = await r.json();
      if (d.errors) {
        err++;
        lines.push([en.id, en.slug, en.data_pubblicazione, it.id, it.slug, it.data_pubblicazione, `ERR: ${d.errors[0].message}`].join(','));
      } else {
        ok++;
        lines.push([en.id, en.slug, en.data_pubblicazione, it.id, it.slug, it.data_pubblicazione, 'OK'].join(','));
      }
    } catch (e) {
      err++;
      lines.push([en.id, en.slug, en.data_pubblicazione, it.id, it.slug, it.data_pubblicazione, `ERR: ${e.message}`].join(','));
    }
  }));
  process.stdout.write(`\r  Aggiornati: ${Math.min(i + BATCH, toUpdate.length)}/${toUpdate.length} (${err} errori)    `);
  if (i + BATCH < toUpdate.length) await new Promise(r => setTimeout(r, PAUSE_MS));
}
console.log(`\nCompletato: ${ok} OK, ${err} errori`);

fs.writeFileSync(logPath, lines.join('\n') + '\n');
console.log(`Log: ${logPath}`);
