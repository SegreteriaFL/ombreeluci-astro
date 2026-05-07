/**
 * translate-bio.mjs — Traduzione bio autori IT → EN con Claude Haiku.
 *
 * Uso:
 *   node scripts/traduzione/translate-bio.mjs --dry-run   # anteprima prime 3 bio
 *   node scripts/traduzione/translate-bio.mjs             # esegui
 *
 * Idempotente: salta gli autori che hanno già bio_en valorizzata.
 * Log CSV: scripts/traduzione/logs/translate-bio-{timestamp}.csv
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

if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
  console.error('❌ DIRECTUS_URL o DIRECTUS_TOKEN mancanti nel .env');
  process.exit(1);
}
if (!ANTHROPIC_API_KEY && !DRY_RUN) {
  console.error('❌ ANTHROPIC_API_KEY mancante nel .env');
  process.exit(1);
}

console.log(DRY_RUN ? '🔍 DRY-RUN — nessuna scrittura' : '✍️  APPLY MODE');

// ── CSV log ──────────────────────────────────────────────────────────────────

const logsDir = path.resolve(__dirname, 'logs');
fs.mkdirSync(logsDir, { recursive: true });
const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const logFile = path.join(logsDir, `translate-bio-${ts}.csv`);
fs.writeFileSync(logFile, 'autore_id,nome,status,chars_it,chars_en,error_msg,timestamp\n');

function appendLog(row) {
  const line = [
    row.autore_id,
    `"${String(row.nome ?? '').replace(/"/g, '""')}"`,
    row.status,
    row.chars_it ?? '',
    row.chars_en ?? '',
    `"${String(row.error_msg ?? '').replace(/"/g, '""')}"`,
    row.timestamp,
  ].join(',') + '\n';
  fs.appendFileSync(logFile, line);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms));

function countHtmlTags(html) {
  return (html.match(/<[^>]+>/g) ?? []).length;
}

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

async function translateWithHaiku(bioHtml) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `You are a translator for an Italian Catholic magazine called Ombre e Luci (Shadows and Lights).
Translate the author biography from Italian to English.
Preserve HTML tags exactly as they appear — do not add, remove, or modify any HTML tags.
Translate accurately and naturally into English.
Return only the translated HTML, nothing else — no preamble, no explanation.`,
      messages: [
        { role: 'user', content: `Translate this author biography to English:\n\n${bioHtml}` },
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

// ── Main ──────────────────────────────────────────────────────────────────────

const params = new URLSearchParams({
  'filter[bio_html][_nnull]': 'true',
  'fields': 'id,nome_completo,bio_html,bio_en',
  'limit': '200',
});
const { data: autori } = await directusFetch(`/items/autori?${params}`);
console.log(`\nAutori con bio_html: ${autori.length}`);

const toTranslate = autori.filter(a => !a.bio_en || a.bio_en.trim() === '');
const skippedCount = autori.length - toTranslate.length;
console.log(`Da tradurre: ${toTranslate.length} | Già tradotti (saltati): ${skippedCount}\n`);

// Log skipped records immediately
for (const a of autori.filter(a => a.bio_en && a.bio_en.trim() !== '')) {
  appendLog({
    autore_id: a.id,
    nome: a.nome_completo,
    status: 'skipped',
    chars_it: a.bio_html?.length ?? 0,
    chars_en: a.bio_en.length,
    error_msg: '',
    timestamp: new Date().toISOString(),
  });
}

if (DRY_RUN) {
  console.log('--- Anteprima prime 3 bio da tradurre ---');
  for (const a of toTranslate.slice(0, 3)) {
    console.log(`\n[${a.id}] ${a.nome_completo}`);
    console.log(`  IT (${a.bio_html.length} chars): ${a.bio_html.slice(0, 120).replace(/\n/g, ' ')}...`);
  }
  console.log('\nDry-run completato. Nessuna modifica effettuata.');
  console.log(`Log (solo skipped): ${logFile}`);
  process.exit(0);
}

let ok = 0;
let errors = 0;

for (const autore of toTranslate) {
  const rowTs = new Date().toISOString();
  try {
    const translated = await translateWithHaiku(autore.bio_html);

    if (!translated || translated.length < 10) {
      throw new Error('Risposta vuota o troppo corta');
    }
    const tagsIT = countHtmlTags(autore.bio_html);
    const tagsEN = countHtmlTags(translated);
    if (tagsIT > 0 && Math.abs(tagsEN - tagsIT) / tagsIT > 0.15) {
      throw new Error(`Tag HTML divergenti: IT=${tagsIT}, EN=${tagsEN}`);
    }

    await directusFetch(`/items/autori/${autore.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ bio_en: translated }),
    });

    console.log(`✓ ${autore.nome_completo} (${autore.bio_html.length} → ${translated.length} chars)`);
    appendLog({ autore_id: autore.id, nome: autore.nome_completo, status: 'ok', chars_it: autore.bio_html.length, chars_en: translated.length, error_msg: '', timestamp: rowTs });
    ok++;
  } catch (err) {
    console.error(`✗ ${autore.nome_completo}: ${err.message}`);
    appendLog({ autore_id: autore.id, nome: autore.nome_completo, status: 'error', chars_it: autore.bio_html?.length ?? 0, chars_en: 0, error_msg: err.message, timestamp: rowTs });
    errors++;
  }

  await sleep(2000);
}

console.log(`\nRiepilogo: Tradotte: ${ok} | Saltate (già EN): ${skippedCount} | Errori: ${errors}`);
console.log(`Log: ${logFile}`);
