/**
 * migrate-didascalie-to-articoli.mjs
 *
 * Fase 1 del piano di consolidamento didascalie (C:\Users\berto\.claude\plans\iridescent-wibbling-plum.md).
 * Per ogni riga `didascalie_img` (file+lang), scrive il valore su `articoli.didascalia_copertina`
 * per ogni articolo che referenzia quel file come `immagine_copertina` nella stessa lingua —
 * solo se il valore differisce (nessun PATCH inutile, storico revisioni pulito).
 *
 * Caso speciale: living-the-essential-not-doing-for-but-living-with non ha riga in didascalie_img,
 * migra da didascalia_en. Regola generale applicata: replica la catena di fallback usata oggi dal
 * rendering (didascalie_img → didascalia_en [solo EN] → didascalia_copertina), scrivendo il valore
 * effettivo mostrato oggi online dentro didascalia_copertina.
 *
 * Uso:
 *   node scripts/migrate-didascalie-to-articoli.mjs             # dry-run (default), scrive solo il log
 *   node scripts/migrate-didascalie-to-articoli.mjs --apply     # esegue davvero i PATCH
 *
 * Prerequisiti: DIRECTUS_TOKEN (o DIRECTUS_ADMIN_TOKEN) in .env
 */

import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('dotenv').config();

const TOKEN = process.env.DIRECTUS_TOKEN || process.env.DIRECTUS_ADMIN_TOKEN;
const BASE = process.env.DIRECTUS_URL || 'https://cms.ombreeluci.it';
const APPLY = process.argv.includes('--apply');

if (!TOKEN) {
  console.error('❌ DIRECTUS_TOKEN mancante (.env)');
  process.exit(1);
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(opts.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${opts.method ?? 'GET'} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

async function fetchAllPaginated(path, fields, extraParams = '') {
  const out = [];
  let page = 1;
  const PAGE_SIZE = 500;
  while (true) {
    const data = await apiFetch(
      `${path}?fields=${fields}&limit=${PAGE_SIZE}&page=${page}${extraParams}`
    );
    const items = data.data ?? [];
    out.push(...items);
    if (items.length < PAGE_SIZE) break;
    page++;
  }
  return out;
}

console.log(`Modalità: ${APPLY ? 'APPLY (scrittura reale)' : 'DRY-RUN (sola lettura)'}\n`);

console.log('Fetch didascalie_img...');
const didascalieImg = await fetchAllPaginated('/items/didascalie_img', 'id,file,lang,didascalia');
console.log(`  ${didascalieImg.length} righe`);

const imgMap = new Map();
for (const d of didascalieImg) imgMap.set(`${d.file}|${d.lang}`, d.didascalia);

console.log('Fetch articoli con immagine_copertina...');
const articoli = await fetchAllPaginated(
  '/items/articoli',
  'id,slug,lang,immagine_copertina,didascalia_copertina,didascalia_en',
  '&filter[immagine_copertina][_nnull]=true'
);
console.log(`  ${articoli.length} articoli\n`);

const patches = [];
const orfane = new Set(imgMap.keys());

for (const a of articoli) {
  const key = `${a.immagine_copertina}|${a.lang}`;
  let newValue;
  let fonte;

  if (imgMap.has(key)) {
    newValue = imgMap.get(key);
    fonte = 'didascalie_img';
    orfane.delete(key);
  } else if (a.lang === 'en' && a.didascalia_en && a.didascalia_en.trim()) {
    newValue = a.didascalia_en;
    fonte = 'didascalia_en';
  } else {
    continue; // nessuna fonte alternativa, il valore attuale è già quello effettivo
  }

  const before = a.didascalia_copertina ?? null;
  if ((newValue ?? '').trim() === (before ?? '').trim()) continue; // identico, nessun PATCH

  patches.push({
    id: a.id,
    slug: a.slug,
    lang: a.lang,
    fonte,
    prima: before,
    dopo: newValue,
  });
}

const patchesIT = patches.filter(p => p.lang === 'it');
const patchesEN = patches.filter(p => p.lang === 'en');

console.log(`PATCH necessari: ${patches.length} (IT: ${patchesIT.length}, EN: ${patchesEN.length})`);
console.log(`Righe didascalie_img orfane (nessun articolo le referenzia): ${orfane.size}\n`);

const timestamp = new Date().toISOString().slice(0, 10);
const logPath = `scripts/backups/migrate-didascalie-${APPLY ? 'apply' : 'dryrun'}-${timestamp}.log`;
const logLines = [
  `# migrate-didascalie-to-articoli.mjs — ${APPLY ? 'APPLY' : 'DRY-RUN'} — ${new Date().toISOString()}`,
  `# Totale PATCH: ${patches.length} (IT: ${patchesIT.length}, EN: ${patchesEN.length})`,
  `# Righe didascalie_img orfane: ${orfane.size} — ${[...orfane].join(', ')}`,
  '',
  ...patches.map(
    p =>
      `[${p.lang}] ${p.slug} (${p.id}) via ${p.fonte}\n  PRIMA: ${JSON.stringify(p.prima)}\n  DOPO:  ${JSON.stringify(p.dopo)}`
  ),
];
fs.writeFileSync(logPath, logLines.join('\n'), 'utf-8');
console.log(`Log scritto in ${logPath}`);

if (!APPLY) {
  console.log('\n--- DRY-RUN: nessuna modifica scritta su Directus ---');
  process.exit(0);
}

console.log('\nApplico i PATCH (uno alla volta)...');
let ok = 0;
for (const p of patches) {
  await apiFetch(`/items/articoli/${p.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ didascalia_copertina: p.dopo }),
  });
  ok++;
  if (ok % 100 === 0) console.log(`  ${ok}/${patches.length}`);
}
console.log(`\n✅ ${ok} articoli aggiornati.`);
