/**
 * translate-didascalie.mjs — Traduzione didascalie copertina EN con Claude Haiku.
 *
 * Prerequisito: campo `didascalia_en` deve esistere in Directus.
 * Lo script verifica l'esistenza del campo prima di procedere e stampa
 * istruzioni per crearlo se mancante.
 *
 * Uso:
 *   node scripts/traduzione/translate-didascalie.mjs --dry-run   # anteprima senza scrivere
 *   node scripts/traduzione/translate-didascalie.mjs             # esegui
 *   node scripts/traduzione/translate-didascalie.mjs --resume    # riprendi da checkpoint
 *
 * Idempotente: salta gli articoli con didascalia_en già valorizzata.
 * Checkpoint ogni 100 record: scripts/traduzione/logs/translate-didascalie-checkpoint.json
 * Log CSV: scripts/traduzione/logs/translate-didascalie-{timestamp}.csv
 */
import { loadEnv } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = loadEnv('development', path.resolve(__dirname, '../..'), '');

const DIRECTUS_URL = env.DIRECTUS_URL;
const DIRECTUS_TOKEN = env.DIRECTUS_TOKEN;
const ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
const DRY_RUN = process.argv.includes('--dry-run');
const RESUME = process.argv.includes('--resume');

if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
  console.error('❌ DIRECTUS_URL o DIRECTUS_TOKEN mancanti nel .env');
  process.exit(1);
}
if (!ANTHROPIC_API_KEY && !DRY_RUN) {
  console.error('❌ ANTHROPIC_API_KEY mancante nel .env');
  process.exit(1);
}

console.log(DRY_RUN ? '🔍 DRY-RUN — nessuna scrittura' : '✍️  APPLY MODE');
if (RESUME) console.log('↩️  RESUME — leggo checkpoint');

// ── Verifica campo didascalia_en ──────────────────────────────────────────────
// Il token non ha accesso a /fields/ — verifica tramite fetch di test su /items/articoli.

{
  const testRes = await fetch(
    `${DIRECTUS_URL}/items/articoli?limit=1&fields=id,didascalia_en&filter[lang][_eq]=en`,
    { headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` } }
  );

  if (testRes.ok) {
    console.log('✅ Campo didascalia_en presente in Directus');
  } else {
    const body = await testRes.text();
    const fieldMissing = body.includes('does not exist') || body.includes('non esiste');
    if (fieldMissing || testRes.status === 403) {
      console.error(`
❌ Il campo didascalia_en non esiste in Directus (o non è accessibile al token).

Crealo manualmente in Directus UI:
  Impostazioni → Modello dati → articoli → Aggiungi campo
  Tipo: Textarea, Nome: didascalia_en

Oppure con curl (richiede token admin):
  curl -X POST "${DIRECTUS_URL}/fields/articoli" \\
    -H "Authorization: Bearer $DIRECTUS_TOKEN" \\
    -H "Content-Type: application/json" \\
    -d '{"field":"didascalia_en","type":"text","meta":{"interface":"input-multiline","display":"formatted-value","note":"Didascalia copertina in inglese (traduzione di didascalia_copertina)"}}'

Poi rilancia questo script.
`);
      process.exit(1);
    } else {
      console.warn(`⚠️  Risposta inattesa dal check campo (${testRes.status}). Procedo assumendo che il campo esista.`);
    }
  }
}

// ── CSV log ───────────────────────────────────────────────────────────────────

const logsDir = path.resolve(__dirname, 'logs');
fs.mkdirSync(logsDir, { recursive: true });
const runTs = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const logFile = path.join(logsDir, `translate-didascalie-${runTs}.csv`);
const checkpointFile = path.join(logsDir, 'translate-didascalie-checkpoint.json');
fs.writeFileSync(logFile, 'articolo_id,slug,status,chars_it,chars_en,error_msg,timestamp\n');

function appendLog(row) {
  const line = [
    row.articolo_id,
    `"${String(row.slug ?? '').replace(/"/g, '""')}"`,
    row.status,
    row.chars_it ?? '',
    row.chars_en ?? '',
    `"${String(row.error_msg ?? '').replace(/"/g, '""')}"`,
    row.timestamp,
  ].join(',') + '\n';
  fs.appendFileSync(logFile, line);
}

// ── Checkpoint ────────────────────────────────────────────────────────────────

let checkpoint = { processedIds: [] };
if (RESUME && fs.existsSync(checkpointFile)) {
  try {
    checkpoint = JSON.parse(fs.readFileSync(checkpointFile, 'utf-8'));
    console.log(`↩️  Checkpoint: ${checkpoint.processedIds.length} ID già processati`);
  } catch {
    console.warn('⚠️  Checkpoint non leggibile, ignoro');
    checkpoint = { processedIds: [] };
  }
}
const checkpointSet = new Set(checkpoint.processedIds.map(String));

function saveCheckpoint(processedIds) {
  fs.writeFileSync(checkpointFile, JSON.stringify({ processedIds, updatedAt: new Date().toISOString() }, null, 2));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function directusFetch(urlPath, options = {}) {
  const res = await fetch(`${DIRECTUS_URL}${urlPath}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Directus ${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function translateCaption(caption) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: `You are a translator for an Italian Catholic magazine called Ombre e Luci (Shadows and Lights).
Translate the image caption from Italian to English.
Captions are often short (photo credits, descriptions of people or places).
Preserve HTML tags if present.
For Unsplash photo credits in the format 'Foto di X su Unsplash' translate to 'Photo by X on Unsplash'.
Translate accurately and naturally into English.
Return only the translated caption, nothing else.`,
      messages: [
        { role: 'user', content: `Translate this image caption to English:\n\n${caption}` },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

// ── Fetch articoli ────────────────────────────────────────────────────────────

console.log('\nFetch articoli EN con didascalia_copertina...');

// Fetch in pagine da 500 per gestire i ~3470 record
const allArticoli = [];
let page = 1;
const pageSize = 500;

while (true) {
  const params = new URLSearchParams({
    'filter[lang][_eq]': 'en',
    'filter[didascalia_copertina][_nnull]': 'true',
    'fields': 'id,slug,didascalia_copertina,didascalia_en',
    'limit': String(pageSize),
    'offset': String((page - 1) * pageSize),
  });
  const { data } = await directusFetch(`/items/articoli?${params}`);
  if (!data || data.length === 0) break;
  allArticoli.push(...data);
  if (data.length < pageSize) break;
  page++;
}

console.log(`Articoli EN con didascalia_copertina: ${allArticoli.length}`);

// Filtra: già tradotti (idempotenza) + checkpoint --resume
const toTranslate = allArticoli.filter(a => {
  if (a.didascalia_en && a.didascalia_en.trim() !== '') return false; // già tradotto
  if (checkpointSet.has(String(a.id))) return false; // già processato in run precedente
  return true;
});
const skippedAlready = allArticoli.filter(a => a.didascalia_en && a.didascalia_en.trim() !== '');
const skippedCheckpoint = allArticoli.filter(a =>
  (!a.didascalia_en || a.didascalia_en.trim() === '') && checkpointSet.has(String(a.id))
);

console.log(`Da tradurre: ${toTranslate.length} | Già tradotti: ${skippedAlready.length} | Skip checkpoint: ${skippedCheckpoint.length}\n`);

// Log skipped
for (const a of skippedAlready) {
  appendLog({ articolo_id: a.id, slug: a.slug, status: 'skipped', chars_it: a.didascalia_copertina?.length ?? 0, chars_en: a.didascalia_en?.length ?? 0, error_msg: '', timestamp: new Date().toISOString() });
}

if (DRY_RUN) {
  console.log('--- Anteprima prime 3 didascalie da tradurre ---');
  for (const a of toTranslate.slice(0, 3)) {
    console.log(`\n[${a.id}] ${a.slug}`);
    console.log(`  IT (${a.didascalia_copertina.length} chars): ${a.didascalia_copertina.slice(0, 150).replace(/\n/g, ' ')}`);
  }
  console.log('\nDry-run completato. Nessuna modifica effettuata.');
  console.log(`Log (solo skipped): ${logFile}`);
  process.exit(0);
}

// ── Processamento con 2 worker paralleli ─────────────────────────────────────

let ok = 0;
let errors = 0;
let processed = 0;
const processedIds = [...checkpoint.processedIds];

function printProgress() {
  const total = toTranslate.length;
  const pct = total > 0 ? ((processed / total) * 100).toFixed(1) : '0.0';
  const barLen = 20;
  const filled = Math.round((processed / total) * barLen);
  const bar = '='.repeat(filled) + '>'.padEnd(barLen - filled, ' ');
  process.stdout.write(`\r[${bar}] ${processed}/${total} (${pct}%) — ${errors} errori`);
}

async function workerFn(articolo) {
  const rowTs = new Date().toISOString();
  try {
    const translated = await translateCaption(articolo.didascalia_copertina);

    if (!translated || translated.trim() === '') {
      throw new Error('Risposta vuota');
    }
    if (translated.length > articolo.didascalia_copertina.length * 3) {
      throw new Error(`Risposta troppo lunga: ${translated.length} vs ${articolo.didascalia_copertina.length} chars originali`);
    }

    await directusFetch(`/items/articoli/${articolo.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ didascalia_en: translated }),
    });

    appendLog({ articolo_id: articolo.id, slug: articolo.slug, status: 'ok', chars_it: articolo.didascalia_copertina.length, chars_en: translated.length, error_msg: '', timestamp: rowTs });
    ok++;
  } catch (err) {
    appendLog({ articolo_id: articolo.id, slug: articolo.slug, status: 'error', chars_it: articolo.didascalia_copertina?.length ?? 0, chars_en: 0, error_msg: err.message, timestamp: rowTs });
    errors++;
  }

  processedIds.push(articolo.id);
  processed++;

  if (processed % 50 === 0) printProgress();
  if (processed % 100 === 0) saveCheckpoint(processedIds);
}

// 2 worker in parallelo, 1 req/sec ciascuno
let queueIndex = 0;

async function runWorker() {
  while (queueIndex < toTranslate.length) {
    const articolo = toTranslate[queueIndex++];
    await workerFn(articolo);
    await sleep(1000);
  }
}

console.log('Avvio 2 worker paralleli (1 req/sec ciascuno)...\n');
await Promise.all([runWorker(), runWorker()]);

// Final progress
printProgress();
process.stdout.write('\n');

// Checkpoint finale
saveCheckpoint(processedIds);

console.log(`\nRiepilogo:`);
console.log(`  Tradotte: ${ok}`);
console.log(`  Saltate (già EN): ${skippedAlready.length}`);
console.log(`  Skip checkpoint: ${skippedCheckpoint.length}`);
console.log(`  Errori: ${errors}`);
console.log(`  Log: ${logFile}`);
console.log(`  Checkpoint: ${checkpointFile}`);
