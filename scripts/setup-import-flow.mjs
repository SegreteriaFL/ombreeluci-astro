/**
 * setup-import-flow.mjs — Aggiorna il Run Script del Flow "Import traduzione da JSON"
 *
 * Migliora la robustezza del parsing JSON:
 * - Rimuove markdown code fences se presenti
 * - Tenta fix di escape comuni prima del parse
 * - Fornisce diagnostica dettagliata in caso di errore
 *
 * Uso: node scripts/setup-import-flow.mjs
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

// ── Run Script migliorato con pre-processing ────────────────────────────────

const PARSE_SCRIPT = `module.exports = async function(data) {
  var raw = data['$trigger'].payload.json_traduzione;
  var sourceId = data['$trigger'].keys[0];

  if (!raw || typeof raw !== 'string') {
    throw new Error('json_traduzione vuoto o non stringa');
  }

  // Pre-processing: rimuovi markdown code fences
  var cleaned = raw.trim();
  if (cleaned.startsWith('\`\`\`json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('\`\`\`')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('\`\`\`')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // Primo tentativo: parse diretto
  var parsed;
  var parseError;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    parseError = e;
  }

  // Se fallisce, tenta fix comuni
  if (!parsed && parseError) {
    var fixed = cleaned;

    // Fix 1: newline reali dentro le stringhe JSON
    // Cerca pattern "key": "value con
    // newline" e sostituisce i newline con \\n
    // Questo è un fix euristico, non perfetto
    try {
      // Approccio: trova tutte le stringhe e escapa i newline interni
      fixed = fixed.replace(/"([^"]*?)\\n([^"]*?)"/g, function(match, p1, p2) {
        // Se c'è già un backslash prima di n, non toccare
        return match;
      });

      // Fix più aggressivo: sostituisci newline non preceduti da backslash dentro stringhe
      // Strategia: lavora riga per riga verificando se siamo dentro una stringa
      var lines = fixed.split('\\n');
      var result = [];
      var inString = false;
      var currentLine = '';

      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];

        // Conta le virgolette non escapate per capire se la riga finisce dentro una stringa
        var quoteCount = 0;
        for (var j = 0; j < line.length; j++) {
          if (line[j] === '"' && (j === 0 || line[j-1] !== '\\\\')) {
            quoteCount++;
          }
        }

        if (inString) {
          // Siamo dentro una stringa dalla riga precedente
          // Questa riga va concatenata con \\n escapato
          currentLine += '\\\\n' + line;
        } else {
          if (currentLine) result.push(currentLine);
          currentLine = line;
        }

        // Se quoteCount è dispari, siamo dentro una stringa non chiusa
        inString = (quoteCount % 2 === 1) ? !inString : inString;
      }
      if (currentLine) result.push(currentLine);

      fixed = result.join('\\n');

      parsed = JSON.parse(fixed);
    } catch (e2) {
      // Se anche il fix fallisce, riporta l'errore originale con contesto
      var pos = parseError.message.match(/position (\\d+)/);
      var posNum = pos ? parseInt(pos[1]) : 0;
      var context = cleaned.slice(Math.max(0, posNum - 50), posNum + 50);
      throw new Error('JSON non valido. Errore: ' + parseError.message + '. Contesto intorno alla posizione: ...' + context + '...');
    }
  }

  // Validazione struttura
  if (!parsed._meta || !parsed._copy_invariant || !parsed._translate) {
    throw new Error('JSON mancante dei blocchi _meta, _copy_invariant o _translate');
  }
  if (!parsed._translate.titolo) {
    throw new Error('_translate.titolo vuoto — traduzione incompleta');
  }

  // Genera slug EN dalla traduzione del titolo
  var title = parsed._translate.titolo;
  var slug = title
    .normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\\s\\-]/g, '')
    .replace(/[\\s\\-]+/g, '-')
    .replace(/^-|-$/g, '');
  if (!slug) slug = sourceId.slice(0, 8);

  return {
    source_id: sourceId,
    target_lang: parsed._meta.target_lang || 'en',
    en_slug_base: slug,
    en_slug: slug,
    copy_invariant: parsed._copy_invariant,
    translate: parsed._translate,
    meta: parsed._meta
  };
};`;

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Trova il flow "Import traduzione da JSON"
  console.log('Cerco flow "Import traduzione da JSON"...');
  const flowsRes = await req('GET', '/flows?filter[name][_contains]=Import%20traduzione');
  const flows = flowsRes?.data || [];

  if (flows.length === 0) {
    console.error('Flow non trovato. Verificare il nome in Directus.');
    process.exit(1);
  }

  const flowId = flows[0].id;
  console.log(`  Trovato: ${flows[0].name} (${flowId})`);

  // 2. Trova l'operation Run Script (chiave "parse" o tipo "exec")
  console.log('Cerco operation Run Script...');
  const opsRes = await req('GET', `/operations?filter[flow][_eq]=${flowId}&limit=50`);
  const ops = opsRes?.data || [];

  const parseOp = ops.find(o => o.key === 'parse' || (o.type === 'exec' && o.name.toLowerCase().includes('parse')));

  if (!parseOp) {
    console.error('Operation "parse" non trovata. Operations esistenti:');
    ops.forEach(o => console.log(`  - ${o.key} (${o.type}): ${o.name}`));
    process.exit(1);
  }

  console.log(`  Trovata: ${parseOp.name} (${parseOp.id})`);

  // 3. Aggiorna lo script
  console.log('Aggiorno Run Script con pre-processing robusto...');
  await req('PATCH', `/operations/${parseOp.id}`, {
    options: { code: PARSE_SCRIPT }
  });

  console.log('\n✅ Run Script aggiornato con:');
  console.log('   - Rimozione automatica markdown code fences');
  console.log('   - Fix euristico per newline non escapate');
  console.log('   - Diagnostica dettagliata con contesto errore');
}

main().catch(err => { console.error('ERRORE:', err.message); process.exit(1); });
