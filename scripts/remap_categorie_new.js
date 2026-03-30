/**
 * scripts/remap_categorie_new.js
 *
 * Rimappa tema_label e categoria_menu di tutti gli articoli Directus
 * alle 13 nuove categorie editoriali.
 *
 * Logica a tre livelli:
 *   1. Megacluster S8 tema_label → nuova categoria (fonte primaria)
 *   2. Vecchie categorie WP (term_relationships_wp.json) → fallback per temi orfani
 *   3. 'Da categorizzare' → fallback finale
 *
 * Uso:
 *   node scripts/remap_categorie_new.js          # dry run (nessuna modifica)
 *   node scripts/remap_categorie_new.js --write  # applica su Directus
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DIRECTUS_URL = 'http://159.69.196.64:8055';
const DIRECTUS_TOKEN = 'nBZ6kdd0YgVnhLm2TZEDoT9A-NJujwVU';
const DRY_RUN = !process.argv.includes('--write');

// ── 1. Mapping Megacluster S8 → nuova categoria ───────────────────────────────

const MEGACLUSTER_MAP = {
  'Famiglie, genitori, fratelli':                            'Famiglia',
  'Progetto di vita, autonomia e dopo di noi':               'Famiglia',
  'Amicizia e relazioni autentiche':                         null, // tag fallback → default Famiglia
  'Fede, Chiesa e spiritualità della fragilità':             'Spiritualità',
  'Dignità, valore della persona e sguardo sulla fragilità': null, // tag fallback → default Spiritualità
  'Corpo, salute, cura e assistenza':                        'Salute',
  'Cinema e disabilità':                                     'Cultura',
  'Linguaggio, cultura e rappresentazioni':                  'Cultura',
  'Memoria e storia di Fede e Luce (opzionale)':            'Fede e Luce',
  'Pellegrinaggi, cammini e vita comunitaria in movimento':  'Fede e Luce',
  'Educare e crescere insieme':                              'Educazione e Formazione',
  'Giovani, futuro, speranza e cambiamento':                 null, // tag fallback → default Educazione e Formazione
  'Comunità, accoglienza e inclusione':                      'Progetti',
  'Diritti, cittadinanza e società':                         'Progetti',
  'Riflessioni':                                             null, // tag fallback → default Spiritualità
  'Vivere la disabilità':                                    null, // tag fallback → default Famiglia
};

// Default per temi orfani che non trovano match né in WP né in tag
const MEGACLUSTER_DEFAULTS = {
  'Amicizia e relazioni autentiche':                         'Famiglia',
  'Dignità, valore della persona e sguardo sulla fragilità': 'Spiritualità',
  'Giovani, futuro, speranza e cambiamento':                 'Educazione e Formazione',
  'Riflessioni':                                             'Spiritualità',
  'Vivere la disabilità':                                    'Famiglia',
};

// ── 2. Mapping categorie WP → nuova categoria ─────────────────────────────────

const WP_CAT_MAP = {
  // Famiglia
  'famiglia':                     'Famiglia',
  'vita-in-autonomia':            'Famiglia',
  'dopo-di-noi':                  'Famiglia',
  'noi-papa':                     'Famiglia',
  // Spiritualità
  'spiritualita':                 'Spiritualità',
  // Catechesi
  'catechesi':                    'Catechesi',
  // Fede e Luce
  'vita-fede-e-luce':             'Fede e Luce',
  'vita-comunitaria':             'Fede e Luce',
  'insieme-speciale-fede-e-luce': 'Fede e Luce',
  // Personaggi che ispirano
  'jean-vanier':                  'Personaggi che ispirano',
  // Cultura
  'cinema-e-disabilita':          'Cultura',
  'libri-recensioni':             'Cultura',
  'recensioni':                   'Cultura',
  'spettacoli':                   'Cultura',
  // Scuola
  'scuola':                       'Scuola',
  // Lavoro
  'lavoro':                       'Lavoro',
  // Tempo libero
  'tempo-libero':                 'Tempo libero',
  // Sport
  'sport':                        'Sport',
  // Progetti
  'progetti':                     'Progetti',
  'istituzioni-e-disabilita':     'Progetti',
  'esperienze':                   'Progetti',
  // Salute
  'scienza-e-vita':               'Salute',
  'medicina':                     'Salute',
  // Null: forme o serie, non categorie
  'testimonianze':                null,
  'insieme':                      null,
  'editoriali':                   null,
  'dialogo-aperto':               null,
  'archivi':                      null,
  'archivio-newsletter':          null,
  'news':                         null,
  'attualita':                    null,
  'autismo-cat':                  null,
  'diario-di-benedetta':          null,
  'diario-di-giovanni':           null,
  'diario-di-antonietta':         null,
  'diario-di-davide':             null,
  'diario-di-luciana':            null,
  'interviste':                   null,
  'ombre-e-luci-sfogliabile':     null,
};

// ── 3. Carica relazioni WP (fallback categorie + tag) ────────────────────────

const termRels = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../scripts/db_analysis/output/term_relationships_wp.json'),
    'utf8'
  )
);

// wp_id → [category slugs]
const wpCatsByWpId = {};
// wp_id → [tag slugs]
const wpTagsByWpId = {};
for (const rel of termRels) {
  if (rel.taxonomy === 'category') {
    if (!wpCatsByWpId[rel.object_id]) wpCatsByWpId[rel.object_id] = [];
    wpCatsByWpId[rel.object_id].push(rel.slug);
  } else if (rel.taxonomy === 'post_tag') {
    if (!wpTagsByWpId[rel.object_id]) wpTagsByWpId[rel.object_id] = [];
    wpTagsByWpId[rel.object_id].push(rel.slug);
  }
}

// Tag → categoria (mappa per fallback)
const TAG_CAT_MAP = {
  'sport': 'Sport', 'atletica': 'Sport', 'calcio': 'Sport', 'nuoto': 'Sport',
  'paralimpiadi': 'Sport', 'olimpiadi': 'Sport',
  'lavoro': 'Lavoro', 'inserimento-lavorativo': 'Lavoro', 'occupazione': 'Lavoro',
  'scuola': 'Scuola', 'scuola-e-disabilita': 'Scuola', 'integrazione-scolastica': 'Scuola',
  'insegnante': 'Scuola', 'scuola-potenziata': 'Scuola',
  'catechesi': 'Catechesi', 'catechesi-inclusiva': 'Catechesi',
  'fede-e-luce': 'Fede e Luce', 'jean-vanier': 'Personaggi che ispirano',
  'alzheimer': 'Salute', 'autismo': 'Salute', 'sindrome-di-down': 'Salute',
  'riabilitazione': 'Salute', 'medicina': 'Salute',
  'famiglia': 'Famiglia', 'genitori': 'Famiglia', 'dopo-di-noi': 'Famiglia',
  'vita-in-autonomia': 'Famiglia', 'autonomia': 'Famiglia',
  'educazione': 'Educazione e Formazione', 'pedagogia': 'Educazione e Formazione',
  'affettivita': 'Educazione e Formazione', 'sessualita': 'Educazione e Formazione',
  'cinema': 'Cultura', 'film': 'Cultura', 'teatro': 'Cultura',
  'teatro-e-disabilita': 'Cultura', 'libri': 'Cultura',
  'arte': 'Cultura', 'musica': 'Cultura', 'podcast': 'Cultura',
  'spiritualita': 'Spiritualità', 'preghiera': 'Spiritualità',
  'vacanze': 'Tempo libero', 'tempo-libero': 'Tempo libero',
  'associazioni': 'Progetti', 'casa-famiglia': 'Progetti',
  'vita-comunitaria': 'Progetti', 'cooperative-sociali': 'Progetti',
};

// ── 4. Funzione di mapping ────────────────────────────────────────────────────

const NUOVE_CATEGORIE = new Set([
  'Famiglia', 'Spiritualità', 'Catechesi', 'Cultura', 'Fede e Luce',
  'Progetti', 'Salute', 'Lavoro', 'Scuola', 'Educazione e Formazione',
  'Sport', 'Tempo libero', 'Personaggi che ispirano',
]);

function getNewCategoria(temaLabel, wpId) {
  // Livello 0: già mappato a una delle 13 nuove categorie → passa direttamente
  if (temaLabel && NUOVE_CATEGORIE.has(temaLabel)) {
    return { categoria: temaLabel, fonte: 'already-mapped' };
  }

  // Livello 1: megacluster con mapping diretto
  if (temaLabel && Object.prototype.hasOwnProperty.call(MEGACLUSTER_MAP, temaLabel)) {
    const mapped = MEGACLUSTER_MAP[temaLabel];
    if (mapped !== null) return { categoria: mapped, fonte: 'megacluster' };
  }

  // Livello 2: categorie WP
  const wpCats = wpCatsByWpId[wpId] || [];
  for (const slug of wpCats) {
    if (Object.prototype.hasOwnProperty.call(WP_CAT_MAP, slug)) {
      const mapped = WP_CAT_MAP[slug];
      if (mapped) return { categoria: mapped, fonte: `wp-cat:${slug}` };
    }
  }

  // Livello 3: tag WP
  const wpTags = wpTagsByWpId[wpId] || [];
  for (const slug of wpTags) {
    if (Object.prototype.hasOwnProperty.call(TAG_CAT_MAP, slug)) {
      return { categoria: TAG_CAT_MAP[slug], fonte: `wp-tag:${slug}` };
    }
  }

  // Livello 4: default per tema orfano (confermati dalla redazione)
  if (temaLabel && Object.prototype.hasOwnProperty.call(MEGACLUSTER_DEFAULTS, temaLabel)) {
    return { categoria: MEGACLUSTER_DEFAULTS[temaLabel], fonte: `default:${temaLabel}` };
  }

  // Livello 5: fallback finale
  return { categoria: 'Da categorizzare', fonte: 'fallback' };
}

// ── 5. Fetch articoli da Directus ─────────────────────────────────────────────

async function fetchArticoli() {
  const params = new URLSearchParams({
    fields: 'id,wp_id,tema_label,categoria_menu',
    limit: '-1',
    'filter[stato][_eq]': 'published',
  });
  const res = await fetch(`${DIRECTUS_URL}/items/articoli?${params}`, {
    headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Directus error: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return json.data;
}

// ── 6. PATCH singolo articolo ─────────────────────────────────────────────────

async function patchArticolo(id, tema_label, categoria_menu) {
  const res = await fetch(`${DIRECTUS_URL}/items/articoli/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tema_label, categoria_menu }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PATCH ${id} failed: ${res.status} — ${txt}`);
  }
}

// ── 7. Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN — nessuna modifica\n' : '✏️  WRITE MODE — applico su Directus\n');

  const articoli = await fetchArticoli();
  console.log(`Articoli totali: ${articoli.length}\n`);

  const stats = {};
  const byFonte = { megacluster: 0, wp: 0, fallback: 0 };
  const fallbackList = [];

  for (const a of articoli) {
    const { categoria, fonte } = getNewCategoria(a.tema_label, a.wp_id);

    stats[categoria] = (stats[categoria] || 0) + 1;
    if (fonte === 'megacluster') byFonte.megacluster++;
    else if (fonte.startsWith('wp:')) byFonte.wp++;
    else byFonte.fallback++;

    if (categoria === 'Da categorizzare') {
      fallbackList.push({ id: a.id, wp_id: a.wp_id, tema_old: a.tema_label });
    }

    if (!DRY_RUN) {
      await patchArticolo(a.id, categoria, categoria);
      process.stdout.write('.');
    }
  }

  if (!DRY_RUN) console.log('\n');

  console.log('── Distribuzione nuove categorie ──────────────────');
  Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, n]) => console.log(`  ${String(n).padStart(4)}  ${cat}`));

  console.log('\n── Fonti ───────────────────────────────────────────');
  console.log(`  Megacluster:    ${byFonte.megacluster}`);
  console.log(`  WP categories:  ${byFonte.wp}`);
  console.log(`  Fallback:       ${byFonte.fallback}`);

  if (fallbackList.length > 0) {
    console.log(`\n── Da categorizzare (${fallbackList.length}) ──────────────────`);
    fallbackList.slice(0, 20).forEach(a =>
      console.log(`  wp_id=${a.wp_id}  tema_old="${a.tema_old}"`)
    );
    if (fallbackList.length > 20) console.log(`  ... e altri ${fallbackList.length - 20}`);

    const outPath = path.join(__dirname, '../scripts/db_analysis/logs/da_categorizzare.json');
    fs.writeFileSync(outPath, JSON.stringify(fallbackList, null, 2));
    console.log(`\n  Lista completa → scripts/db_analysis/logs/da_categorizzare.json`);
  }

  if (DRY_RUN) {
    console.log('\n⚠️  Dry run. Per applicare: node scripts/remap_categorie_new.js --write');
  } else {
    console.log('\n✅ Rimappatura completata.');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
