/**
 * Rinomina i 42 articoli EN con suffisso -en usando lo slug generato dal titolo inglese.
 * Es: storia-di-un-padre-en → the-story-of-a-father
 *
 * Dry-run (default): mostra le rinomina + redirect block per astro.config.mjs.
 * --apply: esegue il PATCH su Directus.
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

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json();
}

// 1. Fetch EN articles with -en suffix
const params = new URLSearchParams({
  'filter[lang][_eq]': 'en',
  'filter[slug][_ends_with]': '-en',
  'fields': 'id,slug,titolo',
  'limit': '200',
});
const { data: articles } = await fetchJson(`${BASE}/items/articoli?${params}`);
console.log(`\nArticoli EN con suffisso -en: ${articles.length}`);

if (articles.length === 0) {
  console.log('✅ Nessun articolo da rinominare.');
  process.exit(0);
}

// 2. Genera nuovi slug dai titoli EN
const renames = articles.map(a => ({
  id: a.id,
  oldSlug: a.slug,
  newSlug: slugify(a.titolo),
  titolo: a.titolo,
}));

// 3. Verifica conflitti con slug EN già esistenti
const newSlugs = renames.map(r => r.newSlug);
const conflictParams = new URLSearchParams({
  'filter[slug][_in]': newSlugs.join(','),
  'fields': 'id,slug,lang,titolo',
  'limit': '200',
});
const { data: conflicts } = await fetchJson(`${BASE}/items/articoli?${conflictParams}`);
// Escludi i record stessi (che hanno ancora il vecchio slug)
const existingIds = new Set(articles.map(a => a.id));
const conflictMap = new Map(
  conflicts.filter(a => !existingIds.has(a.id)).map(a => [a.slug, a])
);

// 4. Report
console.log('\nRinomina proposta:');
const safeRenames = [];
const skipped = [];

for (const r of renames) {
  const conflict = conflictMap.get(r.newSlug);
  if (conflict) {
    console.log(`  ⚠️  CONFLITTO  ${r.oldSlug}`);
    console.log(`         → "${r.newSlug}" già usato da: ${conflict.slug} (${conflict.lang})`);
    skipped.push(r);
  } else {
    console.log(`  ✅  ${r.oldSlug}`);
    console.log(`         → ${r.newSlug}  («${r.titolo}»)`);
    safeRenames.push(r);
  }
}

// 5. Redirect block
console.log(`\n// ─── aggiungere a astro.config.mjs > redirects ───`);
safeRenames.forEach(r => {
  console.log(`    '/en/${r.oldSlug}': '/en/${r.newSlug}',`);
});
console.log(`// ─────────────────────────────────────────────────`);
console.log(`\nSafe: ${safeRenames.length} | Conflitti: ${skipped.length}`);

if (DRY_RUN) {
  console.log('\nNessuna modifica. Ripassa con --apply per applicare.');
  process.exit(0);
}

// 6. PATCH
console.log('\nPATCH in corso...');
let patched = 0;
const errors = [];

for (const r of safeRenames) {
  const res = await fetch(`${BASE}/items/articoli/${r.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ slug: r.newSlug }),
  });
  if (!res.ok) {
    const json = await res.json();
    console.error(`  ❌ ${r.oldSlug}: ${json.errors?.[0]?.message}`);
    errors.push(r.oldSlug);
    continue;
  }
  console.log(`  ✅ ${r.oldSlug} → ${r.newSlug}`);
  patched++;
}

console.log(`\nRiepilogo: ${patched} rinominati, ${skipped.length} saltati per conflitto, ${errors.length} errori.`);
