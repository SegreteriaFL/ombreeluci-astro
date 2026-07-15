/**
 * setup-scheduled-publish.mjs — Pubblicazione programmata degli articoli.
 *
 * Crea, in modo COMPLETAMENTE ADDITIVO e REVERSIBILE (vedi teardown-scheduled-publish.mjs):
 *   1. Campo `data_pubblicazione_programmata` (dateTime nullable) su `articoli`.
 *   2. Flow "Pubblicazione programmata" — trigger schedule (cron ogni 15 min), creato DISATTIVATO.
 *      Architettura: item-read → exec (estrai id) → condition (count>0) → item-update.
 *      Selezione SICURA: solo articoli con stato=draft E data_pubblicazione_programmata
 *      valorizzata (_nnull) E scaduta (_lte $NOW). I draft "normali" (campo nullo) non
 *      vengono mai toccati. Il rebuild del sito parte automaticamente dal flow event
 *      esistente "Rebuild CF Pages on Publish" quando stato passa a published.
 *
 * accountability: 'activity' → gira con permessi di sistema (necessario per cambiare stato).
 * Idempotente: se campo/flow esistono già, li salta / ricrea le operation.
 *
 * Uso: node scripts/setup-scheduled-publish.mjs
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

const FIELD = 'data_pubblicazione_programmata';
const FLOW_NAME = 'Pubblicazione programmata';
const CRON = '*/15 * * * *';

function req(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(`${DIRECTUS_URL}${urlPath}`);
    const lib = parsed.protocol === 'https:' ? https : http;
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
      rejectUnauthorized: false,
    };
    const r = lib.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        if ([200, 201, 204].includes(res.statusCode)) {
          try { resolve(data ? JSON.parse(data) : null); } catch { resolve(null); }
        } else {
          reject(new Error(`HTTP ${res.statusCode} ${method} ${urlPath}\n${data.slice(0, 500)}`));
        }
      });
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

// Script per l'operation exec: estrae gli id degli articoli da pubblicare.
const EXEC_CODE = `module.exports = async function(data) {
  var items = data['leggi_programmati'] || [];
  return {
    ids: items.map(function(a){ return a.id; }),
    count: items.length,
    now: new Date().toISOString()
  };
};`;

async function main() {
  // ── 1. Campo data_pubblicazione_programmata (additivo) ──────────────────────
  let fieldExists = false;
  try { await req('GET', `/fields/articoli/${FIELD}`); fieldExists = true; } catch { /* non esiste */ }
  if (fieldExists) {
    console.log(`Campo ${FIELD} già presente — salto.`);
  } else {
    console.log(`Creo campo ${FIELD}...`);
    await req('POST', '/fields/articoli', {
      field: FIELD,
      type: 'dateTime',
      meta: {
        interface: 'datetime',
        special: null,
        width: 'half',
        group: 'group_autore_numero',
        note: 'Se valorizzata su un articolo in Bozza, il flow "Pubblicazione programmata" lo pubblica automaticamente a quella data/ora (controllo ogni 15 min). Lasciare vuoto per pubblicazione manuale.',
      },
      schema: { is_nullable: true },
    });
    console.log('  → creato');
  }

  // ── 2. Flow "Pubblicazione programmata" (schedule, DISATTIVATO) ─────────────
  const flowsRes = await req('GET', `/flows?filter[name][_eq]=${encodeURIComponent(FLOW_NAME)}&fields=id`);
  let flowId = flowsRes?.data?.[0]?.id;
  if (flowId) {
    console.log(`Flow "${FLOW_NAME}" già presente (${flowId}) — azzero e ricreo le operation.`);
    const ops = (await req('GET', `/operations?filter[flow][_eq]=${flowId}&limit=50`))?.data || [];
    await req('PATCH', `/flows/${flowId}`, { operation: null });
    for (const op of ops) await req('PATCH', `/operations/${op.id}`, { resolve: null, reject: null });
    for (const op of ops) await req('DELETE', `/operations/${op.id}`);
  } else {
    console.log(`Creo flow "${FLOW_NAME}" (DISATTIVATO)...`);
    const created = await req('POST', '/flows', {
      name: FLOW_NAME,
      icon: 'schedule',
      description: 'Pubblica automaticamente gli articoli in Bozza con data_pubblicazione_programmata scaduta. Vedi scripts/setup-scheduled-publish.mjs.',
      status: 'inactive',            // ← creato spento
      trigger: 'schedule',
      accountability: 'activity',
      options: { cron: CRON },
    });
    flowId = created.data.id;
  }
  console.log(`  flow id: ${flowId}`);

  // ── 3. Operations: read → exec → condition → update ─────────────────────────
  const read = await req('POST', '/operations', {
    flow: flowId, name: 'Leggi programmati', key: 'leggi_programmati', type: 'item-read',
    position_x: 19, position_y: 1,
    options: {
      collection: 'articoli',
      query: {
        filter: {
          stato: { _eq: 'draft' },
          data_pubblicazione_programmata: { _nnull: true, _lte: '$NOW' },
        },
        fields: ['id', 'data_pubblicazione_programmata'],
        limit: -1,
      },
    },
  });
  const readId = read.data.id;

  const exec = await req('POST', '/operations', {
    flow: flowId, name: 'Estrai id', key: 'estrai', type: 'exec',
    position_x: 37, position_y: 1, options: { code: EXEC_CODE },
  });
  const execId = exec.data.id;

  const cond = await req('POST', '/operations', {
    flow: flowId, name: 'Almeno uno?', key: 'check_any', type: 'condition',
    position_x: 55, position_y: 1,
    options: { filter: { estrai: { count: { _gt: 0 } } } },
  });
  const condId = cond.data.id;

  const upd = await req('POST', '/operations', {
    flow: flowId, name: 'Pubblica', key: 'pubblica', type: 'item-update',
    position_x: 73, position_y: 1,
    options: {
      collection: 'articoli',
      key: '{{estrai.ids}}',
      payload: {
        stato: 'published',
        data_pubblicazione: '{{estrai.now}}',
        data_pubblicazione_programmata: null,
      },
    },
  });
  const updId = upd.data.id;

  // ── 4. Collegamenti: read → exec → condition --(resolve)--> update ──────────
  await req('PATCH', `/operations/${readId}`, { resolve: execId });
  await req('PATCH', `/operations/${execId}`, { resolve: condId });
  await req('PATCH', `/operations/${condId}`, { resolve: updId });
  await req('PATCH', `/flows/${flowId}`, { operation: readId });

  console.log('\n✅ Setup completato (flow DISATTIVATO).');
  console.log(`   flow: ${flowId}  |  cron: ${CRON}  |  status: inactive`);
  console.log(`   catena: ${readId} → ${execId} → ${condId} → ${updId}`);
  console.log('\n   Per ATTIVARE: PATCH /flows/' + flowId + ' {"status":"active"}');
  console.log('   Per REVERT:  node scripts/teardown-scheduled-publish.mjs');
}

main().catch((e) => { console.error('ERRORE:', e.message); process.exit(1); });
