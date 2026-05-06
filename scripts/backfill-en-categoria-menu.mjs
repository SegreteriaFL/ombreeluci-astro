/**
 * Backfill categoria_menu su articoli EN con campo NULL.
 * Per ogni articolo EN senza categoria_menu, segue articolo_traduzione
 * (l'articolo IT sorgente) e copia il suo categoria_menu.
 *
 * Dry-run di default: passa --apply per scrivere su Directus.
 */
import { loadEnv } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = loadEnv('development', path.resolve(__dirname, '..'), '');
const BASE = env.DIRECTUS_URL;
const TOKEN = env.DIRECTUS_TOKEN;
const DRY_RUN = !process.argv.includes('--apply');

if (!BASE || !TOKEN) {
  console.error('❌ DIRECTUS_URL o DIRECTUS_TOKEN mancanti nel .env');
  process.exit(1);
}

console.log(DRY_RUN ? '🔍 DRY-RUN (passa --apply per scrivere)' : '✍️  APPLY MODE');

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json();
}

// Fetch EN articles with NULL categoria_menu, including linked IT source
const params = new URLSearchParams({
  'filter[lang][_eq]': 'en',
  'filter[categoria_menu][_null]': 'true',
  'fields[]': 'id,slug,categoria_menu,articolo_traduzione.id,articolo_traduzione.slug,articolo_traduzione.lang,articolo_traduzione.categoria_menu',
  limit: '200',
});

const { data: articles } = await fetchJson(`${BASE}/items/articoli?${params}`);
console.log(`\nArticoli EN con categoria_menu NULL: ${articles.length}`);

let patched = 0;
let skipped = 0;
const errors = [];

for (const art of articles) {
  const source = art.articolo_traduzione;
  if (!source?.categoria_menu) {
    console.log(`  ⚠️  ${art.slug} — nessuna traduzione collegata o campo vuoto`);
    skipped++;
    continue;
  }

  console.log(`  → ${art.slug} : NULL → "${source.categoria_menu}" (da ${source.slug})`);

  if (!DRY_RUN) {
    const res = await fetch(`${BASE}/items/articoli/${art.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ categoria_menu: source.categoria_menu }),
    });
    if (!res.ok) {
      const json = await res.json();
      console.error(`  ❌ Errore su ${art.slug}:`, json.errors?.[0]?.message);
      errors.push(art.slug);
      continue;
    }
  }
  patched++;
}

console.log(`\nRiepilogo:`);
console.log(`  Patchati (o da patchare): ${patched}`);
console.log(`  Saltati (no traduzione o campo vuoto): ${skipped}`);
if (errors.length) console.log(`  Errori: ${errors.join(', ')}`);
if (DRY_RUN) console.log('\nNessuna modifica effettuata. Ripassa con --apply per applicare.');
