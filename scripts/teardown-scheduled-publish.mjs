/**
 * teardown-scheduled-publish.mjs — REVERT completo di setup-scheduled-publish.mjs.
 *
 * Riporta Directus esattamente allo stato precedente:
 *   1. Elimina il flow "Pubblicazione programmata" e tutte le sue operation.
 *   2. Elimina il campo `data_pubblicazione_programmata` da `articoli`.
 *
 * NB: gli articoli eventualmente già pubblicati dal flow restano pubblicati
 * (comportamento corretto: sono contenuti andati online). Il teardown rimuove
 * solo il MECCANISMO, senza toccare il resto del sito/dati.
 *
 * Uso: node scripts/teardown-scheduled-publish.mjs
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

function req(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(`${DIRECTUS_URL}${urlPath}`);
    const lib = parsed.protocol === 'https:' ? https : http;
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: parsed.hostname, port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search, method,
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`, 'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
      rejectUnauthorized: false,
    };
    const r = lib.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        if ([200, 201, 204].includes(res.statusCode)) resolve(data ? JSON.parse(data) : null);
        else reject(new Error(`HTTP ${res.statusCode} ${method} ${urlPath}\n${data.slice(0, 400)}`));
      });
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

async function main() {
  // 1. Flow + operation
  const flows = (await req('GET', `/flows?filter[name][_eq]=${encodeURIComponent(FLOW_NAME)}&fields=id`))?.data || [];
  for (const f of flows) {
    const ops = (await req('GET', `/operations?filter[flow][_eq]=${f.id}&limit=50`))?.data || [];
    await req('PATCH', `/flows/${f.id}`, { operation: null });
    for (const op of ops) await req('PATCH', `/operations/${op.id}`, { resolve: null, reject: null });
    for (const op of ops) await req('DELETE', `/operations/${op.id}`);
    await req('DELETE', `/flows/${f.id}`);
    console.log(`Eliminato flow ${f.id} (+${ops.length} operation)`);
  }
  if (!flows.length) console.log('Nessun flow "Pubblicazione programmata" da eliminare.');

  // 2. Campo
  try {
    await req('GET', `/fields/articoli/${FIELD}`);
    await req('DELETE', `/fields/articoli/${FIELD}`);
    console.log(`Eliminato campo articoli.${FIELD}`);
  } catch {
    console.log(`Campo ${FIELD} già assente.`);
  }

  console.log('\n✅ Revert completato — Directus è tornato allo stato precedente.');
}

main().catch((e) => { console.error('ERRORE:', e.message); process.exit(1); });
