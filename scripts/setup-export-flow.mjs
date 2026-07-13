/**
 * setup-export-flow.mjs — Riconfigura il Flow "Esporta per traduzione" in Directus.
 *
 * Architettura a 3 operation:
 *   1. item-read  "Leggi articolo"   — key: {{$trigger.body.keys[0]}}
 *   2. exec       "Costruisci JSON"  — JS puro, zero I/O, legge da {{leggi_articolo}}
 *   3. item-update "Scrivi json_export" — key: {{$trigger.body.keys[0]}}
 *
 * Uso: node scripts/setup-export-flow.mjs
 */
import { loadEnv } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';
import https from 'https';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = loadEnv('development', path.resolve(__dirname, '..'), '');

const DIRECTUS_URL = (env.DIRECTUS_URL || 'https://cms.ombreeluci.it').replace(/\/$/, '');
const DIRECTUS_TOKEN = env.DIRECTUS_TOKEN || '';

if (!DIRECTUS_TOKEN) { console.error('DIRECTUS_TOKEN mancante'); process.exit(1); }

const FLOW_ID = 'f53500c6-bdfa-4e98-b1d6-5405e9f53a25';

// ── HTTP helper ───────────────────────────────────────────────────────────────

function req(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const fullUrl = `${DIRECTUS_URL}${urlPath}`;
    const parsed = new URL(fullUrl);
    const lib = parsed.protocol === 'https:' ? https : http;
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
      rejectUnauthorized: false,
    };
    const r = lib.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if ([200, 201, 204].includes(res.statusCode)) {
          try { resolve(data ? JSON.parse(data) : null); } catch { resolve(null); }
        } else {
          reject(new Error(`HTTP ${res.statusCode} ${method} ${urlPath}\n${data.slice(0, 400)}`));
        }
      });
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

// ── Run Script (JS puro — zero I/O, zero require, zero fetch) ────────────────

const BUILD_SCRIPT = `module.exports = async function(data) {
  // leggi_articolo è il risultato dell'operation item-read precedente
  const raw = data['leggi_articolo'];
  const a = Array.isArray(raw) ? raw[0] : raw;
  if (!a) throw new Error('leggi_articolo vuoto — item-read non ha restituito dati');

  const itemId = data['$trigger'].body.keys[0];

  const temi = (a.temi || [])
    .filter(function(t) { return t && t.temi_id; })
    .map(function(t) { return { temi_id: (t.temi_id && t.temi_id.id) ? t.temi_id.id : t.temi_id }; });

  const tags = (a.tags || [])
    .filter(function(t) { return t && t.tags_id; })
    .map(function(t) { return { tags_id: (t.tags_id && t.tags_id.id) ? t.tags_id.id : t.tags_id }; });

  const result = {
    _prompt: "Translate the fields in _translate from Italian into English.\\n\\nCRITICAL — JSON FORMAT REQUIREMENTS:\\n- Return ONLY valid JSON that can be parsed by JSON.parse()\\n- All string values must use proper JSON escaping:\\n  - Double quotes inside strings: use backslash-quote (the two characters \\\\ and \\" together)\\n  - Newlines inside strings: use backslash-n (the two characters \\\\ and n together)\\n  - Backslashes: use double backslash\\n- The corpo field contains HTML with quotes in attributes — these MUST be escaped\\n- Do NOT use actual line breaks inside string values — use the escaped form\\n- Do NOT wrap in markdown code fences\\n\\nTRANSLATION RULES:\\n1. Return JSON with same structure: _meta and _copy_invariant unchanged, only _translate fields translated\\n2. Write natural, idiomatic English — as a native editor would publish it, not word-for-word\\n3. Titles must read as original English headlines\\n4. Break long Italian sentences into shorter English sentences — English prose favors clarity\\n5. Preserve ALL HTML tags exactly as they appear in corpo. Do not add, remove, or modify any tag or attribute\\n6. Photo credits \\"Foto di X su Unsplash\\" → \\"Photo by X on Unsplash\\"\\n7. Do not translate: \\"Fede e Luce\\", \\"Ombre e Luci\\", Italian city names, honorifics \\"don/padre/suor/fr.\\"\\n8. Use inclusive English disability terminology: \\"person with Down syndrome\\", \\"intellectual disability\\", \\"autism\\"\\n\\nReturn ONLY the JSON. No explanations before or after.",
    _meta: {
      export_version: "1.0",
      source_id: a.id,
      source_slug: a.slug,
      source_lang: a.lang || "it",
      target_lang: "en",
      numero_rivista_id: (a.numero_rivista && a.numero_rivista.id) || null,
      numero_rivista_label: (a.numero_rivista && (a.numero_rivista.id_numero || a.numero_rivista.display_title)) || null,
      export_timestamp: new Date().toISOString()
    },
    _copy_invariant: {
      categoria_menu: a.categoria_menu || null,
      forma: a.forma || null,
      ruolo_editoriale: a.ruolo_editoriale || null,
      immagine_copertina: (a.immagine_copertina && a.immagine_copertina.id) || null,
      autore: (a.autore && a.autore.id) || null,
      numero_rivista: (a.numero_rivista && a.numero_rivista.id) || null,
      data_pubblicazione: a.data_pubblicazione || null,
      temi: temi,
      tags: tags
    },
    _translate: {
      titolo: a.titolo || "",
      sottotitolo: a.sottotitolo || null,
      seo_title: a.seo_title || null,
      seo_description: a.seo_description || null,
      didascalia_copertina: a.didascalia_copertina || null,
      corpo: a.corpo || ""
    }
  };

  return { json: JSON.stringify(result, null, 2), item_id: itemId };
};`;

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Leggi operazioni esistenti
  console.log('Leggo operazioni esistenti...');
  const opsRes = await req('GET', `/operations?filter[flow][_eq]=${FLOW_ID}&limit=50`);
  const existingOps = opsRes?.data || [];
  console.log(`  Trovate ${existingOps.length}: ${existingOps.map(o => `${o.key}(${o.id})`).join(', ')}`);

  // 2. Azzera entry point + forza accountability:activity (il flow deve girare con permessi
  //    di sistema, non dell'utente loggato — con "all" la scrittura su json_export veniva
  //    bloccata silenziosamente per gli utenti Redazione)
  await req('PATCH', `/flows/${FLOW_ID}`, { operation: null, accountability: 'activity' });

  // 3. Azzera resolve/reject (foreign key constraint)
  for (const op of existingOps) {
    await req('PATCH', `/operations/${op.id}`, { resolve: null, reject: null });
  }

  // 4. Cancella tutto
  for (const op of existingOps) {
    console.log(`  Cancello ${op.key} (${op.id})...`);
    await req('DELETE', `/operations/${op.id}`);
  }

  // 5. Op 1 — item-read
  console.log('Creo op1: item-read "Leggi articolo"...');
  const op1 = await req('POST', '/operations', {
    name: 'Leggi articolo',
    key: 'leggi_articolo',
    type: 'item-read',
    position_x: 19,
    position_y: 1,
    options: {
      collection: 'articoli',
      key: '{{$trigger.body.keys[0]}}',
      query: {
        // NB: non interrogare 'tema_label' — rimosso (CLASSIF-01, 2026-05-08) e non
        // leggibile dal ruolo Redazione. La sua presenza qui fa fallire l'item-read con
        // 403 per gli utenti non-admin, lasciando json_export vuoto (incidente 2026-07-13).
        fields: [
          'id', 'slug', 'lang', 'titolo', 'sottotitolo',
          'seo_title', 'seo_description', 'corpo', 'didascalia_copertina',
          'categoria_menu', 'forma', 'ruolo_editoriale',
          'data_pubblicazione',
          'immagine_copertina.id',
          'autore.id',
          'numero_rivista.id', 'numero_rivista.id_numero', 'numero_rivista.display_title',
          'temi.temi_id.id', 'tags.tags_id.id',
        ],
      },
    },
    flow: FLOW_ID,
    resolve: null,
    reject: null,
  });
  const op1Id = op1?.data?.id;
  console.log(`  → ${op1Id}`);

  // 6. Op 2 — exec Run Script
  console.log('Creo op2: exec "Costruisci JSON"...');
  const op2 = await req('POST', '/operations', {
    name: 'Costruisci JSON',
    key: 'costruisci_json',
    type: 'exec',
    position_x: 37,
    position_y: 1,
    options: { code: BUILD_SCRIPT },
    flow: FLOW_ID,
    resolve: null,
    reject: null,
  });
  const op2Id = op2?.data?.id;
  console.log(`  → ${op2Id}`);

  // 7. Op 3 — item-update
  console.log('Creo op3: item-update "Scrivi json_export"...');
  const op3 = await req('POST', '/operations', {
    name: 'Scrivi json_export',
    key: 'scrivi_json',
    type: 'item-update',
    position_x: 55,
    position_y: 1,
    options: {
      collection: 'articoli',
      key: '{{$trigger.body.keys[0]}}',
      payload: { json_export: '{{costruisci_json.json}}' },
    },
    flow: FLOW_ID,
    resolve: null,
    reject: null,
  });
  const op3Id = op3?.data?.id;
  console.log(`  → ${op3Id}`);

  // 8. Collega: op1 → op2 → op3
  console.log('Collego op1→op2→op3...');
  await req('PATCH', `/operations/${op1Id}`, { resolve: op2Id });
  await req('PATCH', `/operations/${op2Id}`, { resolve: op3Id });

  // 9. Entry point = op1
  await req('PATCH', `/flows/${FLOW_ID}`, { operation: op1Id });

  console.log('\n✅ Flow riconfigurato: item-read → exec → item-update');
  console.log(`   ${op1Id} → ${op2Id} → ${op3Id}`);
}

main().catch(err => { console.error('ERRORE:', err.message); process.exit(1); });
