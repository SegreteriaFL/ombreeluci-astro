/**
 * export-per-traduzione.mjs — Esporta un articolo IT come JSON strutturato per traduzione manuale assistita.
 *
 * Uso:
 *   node scripts/export-per-traduzione.mjs --slug il-mio-articolo
 *   node scripts/export-per-traduzione.mjs --id uuid-articolo
 *   node scripts/export-per-traduzione.mjs --slug il-mio-articolo --lang-target en
 *
 * Output: exports/article-{slug}-{lang_target}.json
 *
 * Parte di TRANS-FLOW-01. Per il Flow Directus di import, vedere docs/TRANS-FLOW-01-setup.md.
 */
import { loadEnv } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = loadEnv('development', path.resolve(__dirname, '..'), '');

const DIRECTUS_URL = (env.DIRECTUS_URL || 'https://cms.ombreeluci.it').replace(/\/$/, '');
const DIRECTUS_TOKEN = env.DIRECTUS_TOKEN || '';

if (!DIRECTUS_TOKEN) {
  console.error('DIRECTUS_TOKEN mancante nel .env');
  process.exit(1);
}

// ── CLI args ──────────────────────────────────────────────────────────────────

function getArg(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : null;
}

const slugArg = getArg('--slug');
const idArg = getArg('--id');
const langTarget = getArg('--lang-target') || 'en';

if (!slugArg && !idArg) {
  console.error('Uso: node scripts/export-per-traduzione.mjs --slug {slug} [--lang-target en]');
  console.error('     node scripts/export-per-traduzione.mjs --id {uuid}  [--lang-target en]');
  process.exit(1);
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

function directusFetch(path) {
  return new Promise((resolve, reject) => {
    const fullUrl = `${DIRECTUS_URL}${path}`;
    const parsed = new URL(fullUrl);
    const lib = parsed.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      // VPS usa certificato self-signed
      rejectUnauthorized: false,
    };
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode} — ${fullUrl}\n${data.slice(0, 200)}`));
          return;
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error: ${e.message}`)); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// ── Fetch articolo ────────────────────────────────────────────────────────────

const FIELDS = [
  'id', 'slug', 'lang', 'titolo', 'sottotitolo',
  'seo_title', 'seo_description', 'corpo', 'didascalia_copertina',
  'categoria_menu', 'forma', 'tema_label', 'ruolo_editoriale',
  'data_pubblicazione', 'stato',
  'immagine_copertina.id',
  'autore.id', 'autore.nome_completo',
  'numero_rivista.id', 'numero_rivista.id_numero', 'numero_rivista.display_title',
  'articolo_traduzione.id', 'articolo_traduzione.slug', 'articolo_traduzione.lang',
  'temi.temi_id.id', 'temi.temi_id.slug', 'temi.temi_id.nome',
  'tags.tags_id.id', 'tags.tags_id.slug', 'tags.tags_id.nome',
].join(',');

async function fetchArticolo() {
  let filterParam;
  if (idArg) {
    filterParam = `filter[id][_eq]=${encodeURIComponent(idArg)}`;
  } else {
    filterParam = `filter[slug][_eq]=${encodeURIComponent(slugArg)}`;
  }
  const url = `/items/articoli?${filterParam}&fields=${encodeURIComponent(FIELDS)}&limit=1`;
  const res = await directusFetch(url);
  const items = res?.data;
  if (!items?.length) {
    const criteria = idArg ? `id=${idArg}` : `slug=${slugArg}`;
    throw new Error(`Articolo non trovato (${criteria})`);
  }
  return items[0];
}

// ── Prompt sistema ────────────────────────────────────────────────────────────

function buildPrompt(targetLang) {
  const langLabel = targetLang === 'en' ? 'English' : targetLang === 'es' ? 'Spanish' : targetLang === 'fr' ? 'French' : targetLang;
  return `Translate the fields in _translate from Italian into ${langLabel}. Rules:

1. Return JSON with the same structure as this file: _meta and _copy_invariant unchanged, only the fields in _translate translated.
2. Write natural, idiomatic ${langLabel} — as a native English editor would publish it. Not a word-for-word translation.
3. Titles must read as original ${langLabel} headlines, not translations.
4. Where the Italian uses long or complex sentences, break them into shorter ${langLabel} sentences — native English prose favors clarity and shorter rhythm.
5. Preserve all HTML tags exactly as they appear in the corpo field. Do not add, remove, or modify any tag or attribute.
6. For photo credits in the format "Foto di X su Unsplash", translate to "Photo by X on Unsplash".
7. Do not translate proper names: "Fede e Luce", "Ombre e Luci", Italian city names, honorifics "don/padre/suor/fr.".
8. Use current inclusive ${langLabel} terminology for disability (e.g. "person with Down syndrome", "intellectual disability", "autism").
9. Return only the translated JSON. No explanations, no markdown fences, no additional text.`;
}

// ── Build JSON export ─────────────────────────────────────────────────────────

function buildExportJson(articolo, targetLang) {
  const temiIds = (articolo.temi || [])
    .filter(t => t?.temi_id?.id)
    .map(t => ({ temi_id: t.temi_id.id }));

  const tagsIds = (articolo.tags || [])
    .filter(t => t?.tags_id?.id)
    .map(t => ({ tags_id: t.tags_id.id }));

  return {
    _prompt: buildPrompt(targetLang),
    _meta: {
      export_version: '1.0',
      source_id: articolo.id,
      source_slug: articolo.slug,
      source_lang: articolo.lang || 'it',
      target_lang: targetLang,
      numero_rivista_id: articolo.numero_rivista?.id || null,
      numero_rivista_label: articolo.numero_rivista?.id_numero || articolo.numero_rivista?.display_title || null,
      export_timestamp: new Date().toISOString(),
    },
    _copy_invariant: {
      categoria_menu: articolo.categoria_menu || null,
      forma: articolo.forma || null,
      tema_label: articolo.tema_label || null,
      ruolo_editoriale: articolo.ruolo_editoriale || null,
      immagine_copertina: articolo.immagine_copertina?.id || null,
      autore: articolo.autore?.id || null,
      numero_rivista: articolo.numero_rivista?.id || null,
      data_pubblicazione: articolo.data_pubblicazione || null,
      temi: temiIds,
      tags: tagsIds,
    },
    _translate: {
      titolo: articolo.titolo || '',
      sottotitolo: articolo.sottotitolo || null,
      seo_title: articolo.seo_title || null,
      seo_description: articolo.seo_description || null,
      didascalia_copertina: articolo.didascalia_copertina || null,
      corpo: articolo.corpo || '',
    },
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Fetching articolo da ${DIRECTUS_URL}...`);

  const articolo = await fetchArticolo();

  if (articolo.lang && articolo.lang !== 'it') {
    console.error(`ATTENZIONE: l'articolo ha lang="${articolo.lang}" — questo script esporta articoli IT.`);
    process.exit(1);
  }

  if (articolo.articolo_traduzione?.id) {
    const existingSlug = articolo.articolo_traduzione.slug || articolo.articolo_traduzione.id;
    console.warn(`⚠  Traduzione ${langTarget} già presente: slug="${existingSlug}" (id=${articolo.articolo_traduzione.id})`);
    console.warn(`   Il Flow import aggiornerà quella esistente invece di crearne una nuova.`);
  }

  const exportJson = buildExportJson(articolo, langTarget);

  const exportsDir = path.resolve(__dirname, '..', 'exports');
  fs.mkdirSync(exportsDir, { recursive: true });

  const filename = `article-${articolo.slug}-${langTarget}.json`;
  const outPath = path.join(exportsDir, filename);
  fs.writeFileSync(outPath, JSON.stringify(exportJson, null, 2), 'utf8');

  const corpoChars = (articolo.corpo || '').length;
  console.log(`Esportato: ${articolo.titolo}`);
  console.log(`  Corpo: ${corpoChars.toLocaleString('it-IT')} chars | temi: ${exportJson._copy_invariant.temi.length} | tags: ${exportJson._copy_invariant.tags.length}`);
  console.log(`  File: ${outPath}`);
  if (articolo.articolo_traduzione?.id) {
    console.log(`  ⚠  Traduzione esistente — il Flow aggiornerà l'articolo EN esistente.`);
  }
}

main().catch((err) => {
  console.error('Errore:', err.message);
  process.exit(1);
});
