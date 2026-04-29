/**
 * Setup schema Directus per le pagine verticali (VERT-01).
 * Crea: collection verticali, verticale_blocchi, junction verticale_blocchi_articoli,
 * relazioni O2M/M2M, permessi ruolo Public.
 *
 * Eseguire una volta sola: node scripts/setup-verticali-schema.mjs
 */

import { loadEnv } from 'vite';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = loadEnv('development', path.resolve(__dirname, '..'), '');

const BASE = env.DIRECTUS_URL || process.env.DIRECTUS_URL;
const TOKEN = env.DIRECTUS_TOKEN || process.env.DIRECTUS_TOKEN;

if (!BASE || !TOKEN) {
  console.error('❌ DIRECTUS_URL o DIRECTUS_TOKEN mancanti in .env');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
};

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.errors?.[0]?.message || JSON.stringify(json);
    throw new Error(`${method} ${path} → ${res.status}: ${msg}`);
  }
  return json;
}

// Ignora errore "già esiste" (idempotente)
async function safe(fn, label) {
  try {
    await fn();
    console.log(`  ✅ ${label}`);
  } catch (e) {
    const msg = e.message;
    const isExisting =
      msg.includes('already exists') ||
      msg.includes('UNIQUE') ||
      msg.includes('duplicate') ||
      msg.includes('already has an associated relationship') ||
      msg.includes('already been registered');
    if (isExisting) {
      console.log(`  ⏭️  ${label} (già esiste)`);
    } else {
      console.error(`  ❌ ${label}: ${msg}`);
      throw e;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 1. COLLECTION: verticali
// ─────────────────────────────────────────────────────────────
async function createVerticali() {
  console.log('\n📦 Collection: verticali');

  await safe(() => api('POST', '/collections', {
    collection: 'verticali',
    meta: { icon: 'layers', note: 'Pagine verticali tematiche (hub articoli)' },
    schema: {},
    fields: [],
  }), 'collection verticali');

  const fields = [
    { field: 'slug', type: 'string', meta: { interface: 'input', required: true, note: 'URL IT (es. autismo)' }, schema: { is_unique: true, is_nullable: false } },
    { field: 'slug_en', type: 'string', meta: { interface: 'input', required: true, note: 'URL EN (es. autism)' }, schema: { is_unique: true, is_nullable: false } },
    { field: 'titolo', type: 'string', meta: { interface: 'input', required: true }, schema: { is_nullable: false } },
    { field: 'titolo_en', type: 'string', meta: { interface: 'input' }, schema: { is_nullable: true } },
    { field: 'seo_description', type: 'text', meta: { interface: 'input-multiline', note: 'Max 160 caratteri' }, schema: { is_nullable: true } },
    { field: 'seo_description_en', type: 'text', meta: { interface: 'input-multiline' }, schema: { is_nullable: true } },
    {
      field: 'tema_visivo', type: 'string',
      meta: {
        interface: 'select-dropdown',
        required: true,
        default_value: 'chiaro',
        options: { choices: [
          { text: 'Chiaro (editoriale, leggero)', value: 'chiaro' },
          { text: 'Scuro (dossier, forte)', value: 'scuro' },
          { text: 'Caldo (biografico, umano)', value: 'caldo' },
          { text: 'Magazine (tipografico, memorial)', value: 'magazine' },
        ]},
      },
      schema: { is_nullable: false, default_value: 'chiaro' },
    },
    { field: 'hero_immagine', type: 'uuid', meta: { interface: 'file-image', required: true, note: 'Immagine hero principale' }, schema: { is_nullable: true } },
    { field: 'hero_video_url', type: 'string', meta: { interface: 'input', note: 'URL YouTube/Vimeo — se presente sovrascrive immagine' }, schema: { is_nullable: true } },
    { field: 'intro', type: 'text', meta: { interface: 'input-rich-text-html', required: true, note: 'Testo introduttivo IT' }, schema: { is_nullable: true } },
    { field: 'intro_en', type: 'text', meta: { interface: 'input-rich-text-html', note: 'Testo introduttivo EN' }, schema: { is_nullable: true } },
    { field: 'testo_coda', type: 'text', meta: { interface: 'input-rich-text-html', note: 'Testo conclusivo IT (opzionale)' }, schema: { is_nullable: true } },
    { field: 'testo_coda_en', type: 'text', meta: { interface: 'input-rich-text-html', note: 'Testo conclusivo EN (opzionale)' }, schema: { is_nullable: true } },
    { field: 'pubblicato', type: 'boolean', meta: { interface: 'boolean', default_value: false }, schema: { default_value: false, is_nullable: false } },
  ];

  for (const f of fields) {
    await safe(() => api('POST', '/fields/verticali', f), `campo ${f.field}`);
  }
}

// ─────────────────────────────────────────────────────────────
// 2. COLLECTION: verticale_blocchi
// ─────────────────────────────────────────────────────────────
async function createVerticaleBlocchi() {
  console.log('\n📦 Collection: verticale_blocchi');

  await safe(() => api('POST', '/collections', {
    collection: 'verticale_blocchi',
    meta: {
      icon: 'view_stream',
      note: 'Blocchi ordinati di una verticale (testo o gruppo articoli)',
      sort_field: 'ordine',
    },
    schema: {},
    fields: [],
  }), 'collection verticale_blocchi');

  const fields = [
    { field: 'ordine', type: 'integer', meta: { interface: 'input', hidden: true, special: ['sort'] }, schema: { is_nullable: true } },
    {
      field: 'tipo', type: 'string',
      meta: {
        interface: 'select-dropdown',
        required: true,
        options: { choices: [
          { text: 'Blocco testo (con eventuale foto)', value: 'testo' },
          { text: 'Gruppo articoli', value: 'articoli' },
        ]},
      },
      schema: { is_nullable: false },
    },
    { field: 'titolo_sezione', type: 'string', meta: { interface: 'input', note: 'Heading opzionale per gruppi articoli' }, schema: { is_nullable: true } },
    { field: 'titolo_sezione_en', type: 'string', meta: { interface: 'input' }, schema: { is_nullable: true } },
    { field: 'testo', type: 'text', meta: { interface: 'input-rich-text-html', note: 'Solo per tipo=testo' }, schema: { is_nullable: true } },
    { field: 'testo_en', type: 'text', meta: { interface: 'input-rich-text-html' }, schema: { is_nullable: true } },
    { field: 'immagine', type: 'uuid', meta: { interface: 'file-image', note: 'Solo per tipo=testo' }, schema: { is_nullable: true } },
    {
      field: 'layout_immagine', type: 'string',
      meta: {
        interface: 'select-dropdown',
        default_value: 'nessuna',
        options: { choices: [
          { text: 'Nessuna immagine', value: 'nessuna' },
          { text: 'Sfondo (full-width)', value: 'sfondo' },
          { text: 'Laterale destra', value: 'laterale-dx' },
          { text: 'Laterale sinistra', value: 'laterale-sx' },
        ]},
      },
      schema: { is_nullable: true, default_value: 'nessuna' },
    },
  ];

  for (const f of fields) {
    await safe(() => api('POST', '/fields/verticale_blocchi', f), `campo ${f.field}`);
  }
}

// ─────────────────────────────────────────────────────────────
// 3. RELAZIONI
// ─────────────────────────────────────────────────────────────
async function createRelations() {
  console.log('\n🔗 Relazioni');

  // M2O: verticale_blocchi.verticale_id → verticali
  await safe(() => api('POST', '/fields/verticale_blocchi', {
    field: 'verticale_id',
    type: 'integer',
    meta: { interface: 'select-dropdown-m2o', required: true, hidden: true },
    schema: { is_nullable: false },
  }), 'campo verticale_id su verticale_blocchi');

  await safe(() => api('POST', '/relations', {
    collection: 'verticale_blocchi',
    field: 'verticale_id',
    related_collection: 'verticali',
    meta: { many_field: 'verticale_id', one_field: 'sezioni', sort_field: 'ordine' },
    schema: { on_delete: 'CASCADE' },
  }), 'relazione M2O verticale_blocchi→verticali');

  // Alias O2M "sezioni" su verticali — Directus 11 richiede il field esplicito oltre alla relazione
  await safe(() => api('POST', '/fields/verticali', {
    field: 'sezioni',
    type: 'alias',
    meta: {
      interface: 'list-o2m',
      display: 'related-values',
      special: ['o2m'],
      options: { template: '{{titolo_sezione}}' },
      hidden: false,
      readonly: false,
      sort: 15,
      width: 'full',
    },
  }), 'campo alias sezioni su verticali');

  // M2M: verticale_blocchi ↔ articoli tramite junction verticale_blocchi_articoli
  await safe(() => api('POST', '/collections', {
    collection: 'verticale_blocchi_articoli',
    meta: { hidden: true, icon: 'import_export' },
    schema: {},
    fields: [],
  }), 'junction verticale_blocchi_articoli');

  await safe(() => api('POST', '/fields/verticale_blocchi_articoli', {
    field: 'blocco_id',
    type: 'integer',
    meta: { hidden: true },
    schema: { is_nullable: false },
  }), 'campo blocco_id su junction');

  await safe(() => api('POST', '/fields/verticale_blocchi_articoli', {
    field: 'articolo_id',
    type: 'uuid',
    meta: { hidden: true },
    schema: { is_nullable: false },
  }), 'campo articolo_id su junction');

  await safe(() => api('POST', '/fields/verticale_blocchi_articoli', {
    field: 'ordine',
    type: 'integer',
    meta: { hidden: true, special: ['sort'] },
    schema: { is_nullable: true },
  }), 'campo ordine su junction');

  await safe(() => api('POST', '/fields/verticale_blocchi', {
    field: 'articoli',
    type: 'alias',
    meta: {
      interface: 'list-m2m',
      special: ['m2m'],
      note: 'Articoli del gruppo (ordinabili)',
      options: { template: '{{titolo}} — {{data_pubblicazione}}' },
    },
    schema: null,
  }), 'campo M2M articoli su verticale_blocchi');

  await safe(() => api('POST', '/relations', {
    collection: 'verticale_blocchi_articoli',
    field: 'blocco_id',
    related_collection: 'verticale_blocchi',
    meta: { junction_field: 'articolo_id', one_field: 'articoli', sort_field: 'ordine' },
    schema: { on_delete: 'CASCADE' },
  }), 'relazione M2M lato blocco');

  // Solo meta: Directus crea già lo schema FK nel passo precedente
  await safe(() => api('POST', '/relations', {
    collection: 'verticale_blocchi_articoli',
    field: 'articolo_id',
    related_collection: 'articoli',
    meta: {
      junction_field: 'blocco_id',
      many_field: 'articolo_id',
      sort_field: 'ordine',
      one_field: null,
    },
  }), 'relazione M2M lato articolo');
}

// ─────────────────────────────────────────────────────────────
// 4. PERMESSI ruolo Public
// ─────────────────────────────────────────────────────────────
async function setPermissions() {
  console.log('\n🔐 Permessi ruolo Public');

  // Trova ID policy pubblica
  const policies = await api('GET', '/policies?filter[name][_eq]=Public&limit=1');
  const publicPolicyId = policies?.data?.[0]?.id;
  if (!publicPolicyId) {
    console.warn('  ⚠️  Policy "Public" non trovata — aggiungere permessi manualmente in Directus');
    return;
  }

  const collections = ['verticali', 'verticale_blocchi', 'verticale_blocchi_articoli'];
  for (const collection of collections) {
    await safe(() => api('POST', '/permissions', {
      policy: publicPolicyId,
      collection,
      action: 'read',
      fields: ['*'],
      permissions: collection === 'verticali' ? { pubblicato: { _eq: true } } : {},
    }), `permesso read su ${collection}`);
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 Setup schema VERT-01 su ${BASE}\n`);
  try {
    await createVerticali();
    await createVerticaleBlocchi();
    await createRelations();
    await setPermissions();
    console.log('\n✅ Schema VERT-01 completato. Vai su Directus → Content → Verticali per inserire i dati.\n');
  } catch (e) {
    console.error('\n💥 Errore fatale:', e.message);
    process.exit(1);
  }
}

main();
