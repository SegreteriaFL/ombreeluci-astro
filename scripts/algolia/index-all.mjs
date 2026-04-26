/**
 * ALGOLIA-01 — Indicizzazione completa OEL
 *
 * Crea/aggiorna tre index Algolia:
 *   oel_articoli  — tutti gli articoli IT+EN (filtro lang a query time)
 *   oel_autori    — 352 autori unici
 *   oel_numeri    — 201 numeri rivista
 *
 * Eseguire: node scripts/algolia/index-all.mjs
 * Variabili richieste in .env: ALGOLIA_APPLICATION_ID, ALGOLIA_WRITE_API, DIRECTUS_URL, DIRECTUS_TOKEN
 */

import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { algoliasearch } from 'algoliasearch';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../../');

// ── Config ────────────────────────────────────────────────────────────────────

const ALGOLIA_APP_ID   = process.env.ALGOLIA_APPLICATION_ID;
const ALGOLIA_API_KEY  = process.env.ALGOLIA_WRITE_API;
const DIRECTUS_URL     = process.env.DIRECTUS_URL ?? 'https://cms.ombreeluci.it';
const DIRECTUS_TOKEN   = process.env.DIRECTUS_TOKEN;

if (!ALGOLIA_APP_ID || !ALGOLIA_API_KEY) {
  console.error('❌ ALGOLIA_APPLICATION_ID e ALGOLIA_WRITE_API richiesti nel .env');
  process.exit(1);
}
if (!DIRECTUS_TOKEN) {
  console.error('❌ DIRECTUS_TOKEN richiesto nel .env');
  process.exit(1);
}

const INDEX_ARTICOLI = 'oel_articoli';
const INDEX_AUTORI   = 'oel_autori';
const INDEX_NUMERI   = 'oel_numeri';

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);

// ── Utilities ─────────────────────────────────────────────────────────────────

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function assetUrl(fileObj, params = 'width=400&height=280&fit=cover') {
  if (!fileObj?.id) return null;
  return `${DIRECTUS_URL}/assets/${fileObj.id}?${params}`;
}

function articleUrl(slug, lang) {
  const urlSlug = lang === 'en' && slug.endsWith('-en') ? slug.slice(0, -3) : slug;
  return lang === 'en' ? `/en/${urlSlug}/` : `/it/${urlSlug}/`;
}

function issueUrl(idNumero) {
  return `/archivio/${String(idNumero).toLowerCase().replace(/[^a-z0-9-]/g, '-')}/`;
}

// ── Fetch da Directus ─────────────────────────────────────────────────────────

async function directusFetch(path) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Directus ${res.status}: ${path}`);
  return (await res.json()).data;
}

async function fetchArticoli() {
  console.log('  Scarico articoli da Directus…');
  const fields = [
    'id', 'slug', 'lang', 'titolo', 'sottotitolo', 'stato',
    'data_pubblicazione', 'categoria_menu', 'forma', 'tema_label',
    'corpo',
    'immagine_copertina.id', 'immagine_copertina.filename_download',
    'autore.id', 'autore.slug', 'autore.nome_completo',
    'autore.foto.id', 'autore.foto.filename_download',
    'numero_rivista.id', 'numero_rivista.id_numero',
    'numero_rivista.display_title', 'numero_rivista.anno_pubblicazione',
    'numero_rivista.copertina_url',
  ].join(',');

  const params = new URLSearchParams({
    'filter[stato][_eq]': 'published',
    fields,
    limit: '-1',
    sort: '-data_pubblicazione',
  });

  return directusFetch(`/items/articoli?${params}`);
}

async function fetchAutori() {
  console.log('  Scarico autori da Directus…');
  return directusFetch(
    '/items/autori?fields=id,slug,nome_completo,bio_html,bio_en,foto.id,foto.filename_download&limit=-1&sort=nome_completo'
  );
}

async function fetchNumeri() {
  console.log('  Scarico numeri rivista da Directus…');
  return directusFetch(
    '/items/numeri_rivista?fields=id,id_numero,display_title,titolo_tema,anno_pubblicazione,tipo,copertina_url,periodo_label&limit=-1&sort=-anno_pubblicazione'
  );
}

// ── Build record Algolia ──────────────────────────────────────────────────────

function buildArticoloRecord(a) {
  const corpoText = stripHtml(a.corpo).slice(0, 5000);
  const anno = a.data_pubblicazione
    ? new Date(a.data_pubblicazione).getFullYear()
    : null;

  return {
    objectID: `articolo-${a.id}`,
    tipo: 'articolo',
    slug: a.slug,
    lang: a.lang ?? 'it',
    url: articleUrl(a.slug, a.lang ?? 'it'),
    titolo: a.titolo ?? '',
    sottotitolo: a.sottotitolo ?? '',
    corpo: corpoText,
    autore_nome: a.autore?.nome_completo ?? '',
    autore_slug: a.autore?.slug ?? '',
    autore_foto_url: assetUrl(a.autore?.foto, 'width=80&height=80&fit=cover'),
    categoria_menu: a.categoria_menu ?? '',
    forma: a.forma ?? '',
    tema_label: a.tema_label ?? '',
    data_pubblicazione: a.data_pubblicazione ?? '',
    anno,
    immagine_url: assetUrl(a.immagine_copertina, 'width=400&height=280&fit=cover'),
    numero_id: a.numero_rivista?.id_numero ?? null,
    numero_title: a.numero_rivista?.display_title ?? null,
  };
}

function buildAutoreRecord(autore) {
  const bioText = stripHtml(autore.bio_html);
  return {
    objectID: `autore-${autore.id}`,
    tipo: 'autore',
    slug: autore.slug,
    url: `/autori/${autore.slug}/`,
    nome_completo: autore.nome_completo ?? '',
    bio: bioText.slice(0, 500),
    foto_url: assetUrl(autore.foto, 'width=120&height=120&fit=cover'),
  };
}

function buildNumeroRecord(n) {
  return {
    objectID: `numero-${n.id}`,
    tipo: 'numero',
    id_numero: n.id_numero,
    url: issueUrl(n.id_numero),
    display_title: n.display_title ?? '',
    titolo_tema: n.titolo_tema ?? '',
    anno_pubblicazione: n.anno_pubblicazione,
    tipo_rivista: n.tipo ?? '',
    periodo_label: n.periodo_label ?? '',
    copertina_url: n.copertina_url ?? null,
  };
}

// ── Configurazione index ──────────────────────────────────────────────────────

async function configureIndex(indexName, settings) {
  console.log(`  Configuro ${indexName}…`);
  await client.setSettings({ indexName, indexSettings: settings });
}

async function configureAllIndices() {
  await configureIndex(INDEX_ARTICOLI, {
    searchableAttributes: [
      'titolo',
      'autore_nome',
      'sottotitolo',
      'corpo',
      'categoria_menu',
      'forma',
    ],
    attributesForFaceting: [
      'filterOnly(lang)',
      'forma',
      'categoria_menu',
      'anno',
    ],
    attributesToRetrieve: [
      'objectID', 'tipo', 'slug', 'lang', 'url',
      'titolo', 'sottotitolo',
      'autore_nome', 'autore_slug', 'autore_foto_url',
      'categoria_menu', 'forma', 'anno', 'data_pubblicazione',
      'immagine_url', 'numero_id', 'numero_title',
      // corpo NON incluso: usato solo per matching, snippet gestito da Algolia
    ],
    attributesToSnippet: ['corpo:25', 'sottotitolo:15'],
    snippetEllipsisText: '…',
    customRanking: ['desc(data_pubblicazione)'],
    typoTolerance: true,
    ignorePlurals: ['it', 'en'],
    removeStopWords: ['it', 'en'],
  });

  await configureIndex(INDEX_AUTORI, {
    searchableAttributes: ['nome_completo', 'bio'],
    attributesToRetrieve: ['objectID', 'tipo', 'slug', 'url', 'nome_completo', 'foto_url'],
    attributesToSnippet: ['bio:15'],
    snippetEllipsisText: '…',
    typoTolerance: true,
    ignorePlurals: ['it'],
  });

  await configureIndex(INDEX_NUMERI, {
    searchableAttributes: ['display_title', 'titolo_tema', 'periodo_label'],
    attributesToRetrieve: [
      'objectID', 'tipo', 'id_numero', 'url',
      'display_title', 'titolo_tema', 'anno_pubblicazione',
      'periodo_label', 'copertina_url',
    ],
    customRanking: ['desc(anno_pubblicazione)'],
    typoTolerance: false,
  });
}

// ── Push a Algolia ─────────────────────────────────────────────────────────────

async function pushRecords(indexName, records, label) {
  console.log(`  Push ${records.length} ${label} → ${indexName}…`);
  const BATCH = 1000;
  for (let i = 0; i < records.length; i += BATCH) {
    const chunk = records.slice(i, i + BATCH);
    await client.saveObjects({ indexName, objects: chunk });
    console.log(`    ${Math.min(i + BATCH, records.length)} / ${records.length}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔍 ALGOLIA-01 — Indicizzazione OEL\n');
  console.log(`App: ${ALGOLIA_APP_ID} | Indici: ${INDEX_ARTICOLI}, ${INDEX_AUTORI}, ${INDEX_NUMERI}\n`);

  // 1. Fetch dati
  console.log('1/4  Fetch da Directus');
  const [articoli, autori, numeri] = await Promise.all([
    fetchArticoli(),
    fetchAutori(),
    fetchNumeri(),
  ]);
  console.log(`     Articoli: ${articoli.length} | Autori: ${autori.length} | Numeri: ${numeri.length}\n`);

  // 2. Configura index settings
  console.log('2/4  Configurazione index');
  await configureAllIndices();
  console.log('');

  // 3. Build records
  console.log('3/4  Build record');
  const recArticoli = articoli.map(buildArticoloRecord);
  const recAutori   = autori.map(buildAutoreRecord);
  const recNumeri   = numeri.map(buildNumeroRecord);

  const conCorpo = recArticoli.filter(r => r.corpo.length > 0).length;
  console.log(`     Articoli con corpo: ${conCorpo} / ${recArticoli.length}`);
  console.log('');

  // 4. Push
  console.log('4/4  Push ad Algolia');
  await pushRecords(INDEX_ARTICOLI, recArticoli, 'articoli');
  await pushRecords(INDEX_AUTORI,   recAutori,   'autori');
  await pushRecords(INDEX_NUMERI,   recNumeri,   'numeri');

  console.log('\n✅ Indicizzazione completata');
  console.log(`   oel_articoli : ${recArticoli.length} record`);
  console.log(`   oel_autori   : ${recAutori.length} record`);
  console.log(`   oel_numeri   : ${recNumeri.length} record`);
  console.log(`   Totale       : ${recArticoli.length + recAutori.length + recNumeri.length} record\n`);
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
