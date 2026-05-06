/**
 * Backfill categoria_menu su articoli EN con campo NULL.
 * Strategia a due passaggi:
 *   1. Reverse lookup: trova articoli IT il cui articolo_traduzione punta a questo EN
 *   2. Slug fallback: per slug con suffisso -en, cerca IT con slug senza suffisso
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

// 1. Fetch EN articles with NULL categoria_menu
const paramsEN = new URLSearchParams({
  'filter[lang][_eq]': 'en',
  'filter[categoria_menu][_null]': 'true',
  'fields': 'id,slug,categoria_menu',
  'limit': '200',
});
const { data: articles } = await fetchJson(`${BASE}/items/articoli?${paramsEN}`);
console.log(`\nArticoli EN con categoria_menu NULL: ${articles.length}`);

if (articles.length === 0) {
  console.log('✅ Nessun articolo da backfillare.');
  process.exit(0);
}

const enIds = articles.map(a => a.id);

// 2. Reverse lookup: trova IT articles che puntano a questi EN IDs
const paramsIT = new URLSearchParams({
  'filter[lang][_neq]': 'en',
  'filter[articolo_traduzione][_in]': enIds.join(','),
  'fields': 'id,slug,categoria_menu,articolo_traduzione',
  'limit': '200',
});
const { data: itArticles } = await fetchJson(`${BASE}/items/articoli?${paramsIT}`);

// Mappa: EN id → categoria_menu IT (da reverse lookup)
const enIdToCategoria = new Map();
const enIdToItSlug = new Map();
for (const it of itArticles) {
  const enId = typeof it.articolo_traduzione === 'object'
    ? it.articolo_traduzione?.id ?? it.articolo_traduzione
    : it.articolo_traduzione;
  if (enId && it.categoria_menu) {
    enIdToCategoria.set(String(enId), it.categoria_menu);
    enIdToItSlug.set(String(enId), it.slug);
  }
}
console.log(`Reverse lookup IT→EN: ${itArticles.length} trovati, ${enIdToCategoria.size} con categoria_menu\n`);

// 3. Slug fallback: per -en suffix, prova a cercare IT con slug senza -en
const missingAfterReverse = articles.filter(a => !enIdToCategoria.has(String(a.id)));
const enSlugs = missingAfterReverse.map(a => a.slug).filter(s => s.endsWith('-en'));
if (enSlugs.length > 0) {
  const itSlugs = enSlugs.map(s => s.replace(/-en$/, ''));
  const paramsSlug = new URLSearchParams({
    'filter[lang][_neq]': 'en',
    'filter[slug][_in]': itSlugs.join(','),
    'fields': 'id,slug,categoria_menu',
    'limit': '200',
  });
  const { data: itBySlug } = await fetchJson(`${BASE}/items/articoli?${paramsSlug}`);
  const itSlugMap = new Map(itBySlug.map(a => [a.slug, a.categoria_menu]));

  for (const enArt of missingAfterReverse) {
    const baseSlug = enArt.slug.replace(/-en$/, '');
    const cat = itSlugMap.get(baseSlug);
    if (cat) {
      enIdToCategoria.set(String(enArt.id), cat);
      enIdToItSlug.set(String(enArt.id), baseSlug);
    }
  }
  console.log(`Slug fallback (-en): trovati ${itBySlug.length} match aggiuntivi\n`);
}

// 4. Report e apply
let patched = 0;
let skipped = 0;
const errors = [];

for (const art of articles) {
  const cat = enIdToCategoria.get(String(art.id));
  const itSlug = enIdToItSlug.get(String(art.id));
  if (!cat) {
    console.log(`  ⚠️  ${art.slug} — nessun collegamento IT trovato`);
    skipped++;
    continue;
  }

  console.log(`  → ${art.slug} : NULL → "${cat}" (da IT: ${itSlug})`);

  if (!DRY_RUN) {
    const res = await fetch(`${BASE}/items/articoli/${art.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ categoria_menu: cat }),
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
console.log(`  ${DRY_RUN ? 'Da patchare' : 'Patchati'}: ${patched}`);
console.log(`  Saltati (no collegamento IT): ${skipped}`);
if (errors.length) console.log(`  Errori: ${errors.join(', ')}`);
if (DRY_RUN && patched > 0) console.log('\nNessuna modifica effettuata. Ripassa con --apply per applicare.');
