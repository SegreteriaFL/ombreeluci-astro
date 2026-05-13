/**
 * migrate-catechesi.mjs
 *
 * Sposta tutti gli articoli con categoria_menu='catechesi' → 'spiritualita'.
 * Da eseguire UNA SOLA VOLTA prima del prossimo deploy.
 *
 * Prerequisiti:
 *   DIRECTUS_URL   — URL del CMS (es. https://cms.ombreeluci.it)
 *   DIRECTUS_TOKEN — token admin Directus
 *
 * Uso:
 *   DIRECTUS_URL=https://cms.ombreeluci.it DIRECTUS_TOKEN=xxx node scripts/migrate-catechesi.mjs
 *   node scripts/migrate-catechesi.mjs --dry-run   # solo lettura, nessuna modifica
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'https://cms.ombreeluci.it';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;
const DRY_RUN = process.argv.includes('--dry-run');

if (!DIRECTUS_TOKEN) {
  console.error('❌ DIRECTUS_TOKEN mancante');
  process.exit(1);
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
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

// Fetch tutti gli articoli con catechesi (pagina per pagina)
let page = 1;
const PAGE_SIZE = 100;
const allIds = [];

console.log('Ricerca articoli con categoria_menu=catechesi...');
while (true) {
  const data = await apiFetch(
    `/items/articoli?filter[categoria_menu][_eq]=catechesi&fields=id,titolo,slug,lang&limit=${PAGE_SIZE}&page=${page}`
  );
  const items = data.data ?? [];
  allIds.push(...items.map(a => ({ id: a.id, titolo: a.titolo, slug: a.slug, lang: a.lang })));
  if (items.length < PAGE_SIZE) break;
  page++;
}

// Anche categoria_menu_2
let page2 = 1;
const allIds2 = [];
console.log('Ricerca articoli con categoria_menu_2=catechesi...');
while (true) {
  const data = await apiFetch(
    `/items/articoli?filter[categoria_menu_2][_eq]=catechesi&fields=id,titolo,slug,lang&limit=${PAGE_SIZE}&page=${page2}`
  );
  const items = data.data ?? [];
  allIds2.push(...items.map(a => ({ id: a.id, titolo: a.titolo, slug: a.slug, lang: a.lang })));
  if (items.length < PAGE_SIZE) break;
  page2++;
}

console.log(`\nTrovati: ${allIds.length} articoli (categoria_menu), ${allIds2.length} (categoria_menu_2)\n`);

if (DRY_RUN) {
  console.log('--- DRY RUN: nessuna modifica ---');
  console.log('categoria_menu:', allIds.map(a => `[${a.lang}] ${a.slug}`).join('\n  '));
  console.log('categoria_menu_2:', allIds2.map(a => `[${a.lang}] ${a.slug}`).join('\n  '));
  process.exit(0);
}

if (allIds.length === 0 && allIds2.length === 0) {
  console.log('✅ Nessun articolo da migrare.');
  process.exit(0);
}

// PATCH batch per categoria_menu
if (allIds.length > 0) {
  console.log(`Aggiornamento ${allIds.length} articoli (categoria_menu)...`);
  const res = await apiFetch('/items/articoli', {
    method: 'PATCH',
    body: JSON.stringify({
      keys: allIds.map(a => a.id),
      data: { categoria_menu: 'spiritualita' },
    }),
  });
  console.log(`✓ ${res.data?.length ?? '?'} record aggiornati (categoria_menu)`);
}

// PATCH batch per categoria_menu_2
if (allIds2.length > 0) {
  console.log(`Aggiornamento ${allIds2.length} articoli (categoria_menu_2)...`);
  const res = await apiFetch('/items/articoli', {
    method: 'PATCH',
    body: JSON.stringify({
      keys: allIds2.map(a => a.id),
      data: { categoria_menu_2: 'spiritualita' },
    }),
  });
  console.log(`✓ ${res.data?.length ?? '?'} record aggiornati (categoria_menu_2)`);
}

console.log('\n✅ Migrazione completata. Lancia ora un rebuild per aggiornare le pagine categoria.');
