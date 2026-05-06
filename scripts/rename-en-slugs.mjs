/**
 * Rinomina i 42 articoli EN con suffisso -en: rimuove il suffisso dallo slug.
 * Motivo: con routing /it/ e /en/ separati, non c'è più collisione slug.
 *
 * Dry-run (default): mostra le rinomina e stampa il blocco redirect per astro.config.mjs.
 * --apply: esegue il PATCH su Directus.
 * --check-conflicts: verifica se i nuovi slug sono già presi da articoli IT.
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

// 1. Fetch EN articles with -en suffix slug
const params = new URLSearchParams({
  'filter[lang][_eq]': 'en',
  'filter[slug][_ends_with]': '-en',
  'fields': 'id,slug,titolo,stato',
  'limit': '200',
});
const { data: articles } = await fetchJson(`${BASE}/items/articoli?${params}`);
console.log(`\nArticoli EN con suffisso -en: ${articles.length}`);

if (articles.length === 0) {
  console.log('✅ Nessun articolo da rinominare. Task completato.');
  process.exit(0);
}

// 2. Calcola nuovi slug
const renames = articles.map(a => ({
  id: a.id,
  oldSlug: a.slug,
  newSlug: a.slug.replace(/-en$/, ''),
  titolo: a.titolo,
  stato: a.stato,
}));

// 3. Verifica conflitti con slug IT esistenti
const newSlugs = renames.map(r => r.newSlug);
const conflictParams = new URLSearchParams({
  'filter[lang][_neq]': 'en',
  'filter[slug][_in]': newSlugs.join(','),
  'fields': 'id,slug,lang',
  'limit': '200',
});
const { data: conflicts } = await fetchJson(`${BASE}/items/articoli?${conflictParams}`);
const conflictSlugs = new Set(conflicts.map(a => a.slug));

if (conflictSlugs.size > 0) {
  console.warn(`\n⚠️  Conflitti slug con articoli IT (${conflictSlugs.size}):`);
  conflicts.forEach(a => console.warn(`  ${a.slug} (${a.lang})`));
}

// 4. Report rename
console.log('\nRinomina:');
const safeRenames = renames.filter(r => !conflictSlugs.has(r.newSlug));
const skippedRenames = renames.filter(r => conflictSlugs.has(r.newSlug));

safeRenames.forEach(r => console.log(`  ${r.oldSlug}  →  ${r.newSlug}`));
if (skippedRenames.length > 0) {
  console.warn(`\n⛔ Saltati per conflitto:`);
  skippedRenames.forEach(r => console.warn(`  ${r.oldSlug} (conflitto con IT)`));
}

// 5. Redirect block per astro.config.mjs
console.log(`\n// ─── aggiungere a astro.config.mjs > redirects ───`);
safeRenames.forEach(r => {
  console.log(`    '/en/${r.oldSlug}': '/en/${r.newSlug}',`);
});
console.log(`// ─────────────────────────────────────────────────`);

if (DRY_RUN) {
  console.log(`\nNessuna modifica effettuata. Ripassa con --apply per applicare.`);
  process.exit(0);
}

// 6. PATCH Directus
console.log('\nPATCH in corso...');
let patched = 0;
const errors = [];

for (const r of safeRenames) {
  const res = await fetch(`${BASE}/items/articoli/${r.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
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

console.log(`\nRiepilogo: ${patched} rinominati, ${skippedRenames.length} saltati per conflitto, ${errors.length} errori.`);
if (errors.length) console.error(`Errori su: ${errors.join(', ')}`);
