/**
 * Patch bio_html in database_autori.csv leggendo la bio da
 * https://www.ombreeluci.it/author/[slug] per i primi 20 autori (autori_stats.json).
 * Richiede: node scripts/patch_bios.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const AUTORI_STATS_PATH = path.join(ROOT, 'src', 'data', 'autori_stats.json');
const DATABASE_AUTORI_PATH = path.join(ROOT, 'src', 'data', 'database_autori.csv');
const TOP_N = 20;
const BASE_URL = 'https://www.ombreeluci.it/author';

function parseCSV(content) {
  const lines = content.split(/\n/).filter(Boolean);
  if (lines.length === 0) return { header: '', rows: [] };
  const header = lines[0];
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const row = [];
    let cur = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') {
        if (inQuotes && line[j + 1] === '"') {
          cur += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if ((c === ',' && !inQuotes) || (c === '\r' && !inQuotes)) {
        row.push(cur);
        cur = '';
      } else if (c !== '\r') {
        cur += c;
      }
    }
    row.push(cur);
    rows.push(row);
  }
  return { header, rows };
}

function escapeCSVField(val) {
  if (val == null) return '';
  const s = String(val).trim();
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function extractBio(html) {
  const $ = cheerio.load(html);
  // Sito Ombre e Luci (Divi): bio autore in .et_pb_text_2_tb_body .et_pb_text_inner (pagina IT /author/slug/)
  const selectors = [
    '[class*="et_pb_text_2_tb_body"] .et_pb_text_inner',
    '.et_pb_text_2_tb_body .et_pb_text_inner',
    '.author-bio',
    '.archive-description',
    '.author-description',
    '[class*="author-bio"]',
    '.entry-content p',
    'main p',
  ];
  for (const sel of selectors) {
    const el = $(sel).first();
    if (el.length) {
      const inner = el.html()?.trim();
      if (inner && inner.length > 15) return inner;
      const text = el.text().trim();
      if (text && text.length > 15) return `<p>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
    }
  }
  return null;
}

async function fetchBio(slug) {
  // Pagina IT contiene la bio (Divi: .et_pb_text_2_tb_body); EN spesso vuota
  const url = `${BASE_URL}/${slug}/`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Ombreeluci-PatchBios/1.0)', 'Accept-Language': 'it-IT,it;q=0.9' },
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const html = await res.text();
    return extractBio(html);
  } catch (e) {
    console.error(`  Errore fetch ${slug}:`, e.message);
    return null;
  }
}

async function main() {
  const autoriStats = JSON.parse(fs.readFileSync(AUTORI_STATS_PATH, 'utf8'));
  const topSlugs = autoriStats
    .map((a) => a.slug)
    .filter((s) => s && s !== 'redazione' && s !== 'admin')
    .slice(0, TOP_N);

  const csvRaw = fs.readFileSync(DATABASE_AUTORI_PATH, 'utf8');
  const { header, rows } = parseCSV(csvRaw);
  const colIndex = header.split(',').map((h) => h.trim()).indexOf('bio_html');
  const idIndex = header.split(',').map((h) => h.trim()).indexOf('id_autore');
  if (colIndex < 0 || idIndex < 0) {
    console.error('Colonna bio_html o id_autore non trovata nell\'header CSV:', header);
    process.exit(1);
  }

  const rowById = new Map();
  rows.forEach((row) => {
    const id = row[idIndex]?.trim();
    if (id) rowById.set(id, row);
  });

  let patched = 0;
  for (const slug of topSlugs) {
    if (!rowById.has(slug)) continue;
    process.stdout.write(`  ${slug} ... `);
    const bio = await fetchBio(slug);
    if (bio) {
      rowById.get(slug)[colIndex] = bio;
      patched++;
      console.log('ok');
    } else {
      console.log('(nessuna bio)');
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  const newLines = [header];
  rows.forEach((row) => {
    newLines.push(row.map(escapeCSVField).join(','));
  });
  fs.writeFileSync(DATABASE_AUTORI_PATH, newLines.join('\n') + '\n', 'utf8');
  console.log(`\nScritto ${DATABASE_AUTORI_PATH}: ${patched} bio aggiornate.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
