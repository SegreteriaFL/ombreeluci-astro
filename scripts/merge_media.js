/**
 * Merge intelligente media: V5 (tutti gli ID) + export PHP (estrai_tutto.json) + API WP per i mancanti.
 * Non sovrascrive: parte dai dati esistenti, aggiunge il PHP, integra via API solo dove manca l'immagine.
 *
 * Uso: node scripts/merge_media.js
 *
 * Output: src/data/media_articoli.csv
 * Build finale: eseguito solo se ci sono almeno 3000 righe con img_copertina_url valido.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');
const V5_PATH = path.join(ROOT, '_migration_archive', 'categorie v2', 'articoli_2026_enriched_temi_s8_FINAL_V5.csv');
const PHP_JSON_PATH = path.join(DATA, 'estrai_tutto.json');
const MEDIA_CSV_PATH = path.join(DATA, 'media_articoli.csv');
const WP_API_BASE = 'https://www.ombreeluci.it/wp-json/wp/v2';
const API_DELAY_MS = 100;
const API_DELAY_FIRST_N = 500; // nessun delay per i primi N (test)
const MIN_ROWS_WITH_IMAGE = 3000;
const LOG_EVERY = 100;
const USER_AGENT = 'Ombreeluci-MergeMedia/1.0';

function parseCSVLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if ((c === ',' && !inQuotes) || (c === '\r' && !inQuotes)) { out.push(cur.trim()); cur = ''; }
    else if (c !== '\r') cur += c;
  }
  out.push(cur.trim());
  return out;
}

function escapeCsv(val) {
  const s = String(val == null ? '' : val);
  if (/[,"\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchWpMediaForPost(postId) {
  const url = `${WP_API_BASE}/media?parent=${postId}&per_page=1`;
  const data = await fetchJson(url);
  if (!Array.isArray(data) || data.length === 0) return null;
  const first = data[0];
  return (first.source_url || first.guid?.rendered || '').trim() || null;
}

// 1) V5: tutti gli articoli (id, titolo, link)
const v5Raw = fs.readFileSync(V5_PATH, 'utf8');
const v5Lines = v5Raw.split(/\n/).filter(Boolean);
const v5Header = parseCSVLine(v5Lines[0]);
const idxId = v5Header.indexOf('id_articolo');
const idxTitolo = v5Header.indexOf('titolo');
const idxLink = v5Header.indexOf('link');
if (idxId < 0 || idxTitolo < 0 || idxLink < 0) {
  console.error('V5: colonne id_articolo, titolo, link richieste');
  process.exit(1);
}

const v5Rows = [];
for (let i = 1; i < v5Lines.length; i++) {
  const row = parseCSVLine(v5Lines[i]);
  if (row.length <= Math.max(idxId, idxTitolo, idxLink)) continue;
  const id = String(row[idxId]).trim();
  const titolo = (row[idxTitolo] || '').trim();
  const link = (row[idxLink] || '').trim();
  if (!id || !link) continue;
  v5Rows.push({ id_articolo: id, titolo, url_articolo: link });
}
console.log('V5: articoli', v5Rows.length);

// 2) Base: CSV esistente (se c’è)
const mediaById = {};
try {
  const csv = fs.readFileSync(MEDIA_CSV_PATH, 'utf8');
  const lines = csv.split(/\n/).filter(Boolean);
  if (lines.length > 1) {
    const h = parseCSVLine(lines[0]);
    const iId = h.indexOf('id_articolo');
    const iImg = h.indexOf('img_copertina_url');
    const iSott = h.indexOf('sottotitolo');
    const iAut = h.indexOf('id_autore');
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      if (row.length <= Math.max(iId, iImg, iSott, iAut >= 0 ? iAut : 0)) continue;
      const id = String(row[iId]).trim();
      if (!id) continue;
      mediaById[id] = {
        img_copertina_url: (row[iImg] || '').trim(),
        sottotitolo: (row[iSott] || '').trim(),
        id_autore: (iAut >= 0 ? (row[iAut] || '').trim() : '') || '',
      };
    }
    console.log('CSV esistente: righe', Object.keys(mediaById).length);
  }
} catch (e) {
  // file assente
}

// 3) Merge: export PHP (estrai_tutto.json)
if (fs.existsSync(PHP_JSON_PATH)) {
  const php = JSON.parse(fs.readFileSync(PHP_JSON_PATH, 'utf8'));
  const articoli = php.articoli || [];
  if (articoli.length < 500) {
    console.warn('Attenzione: estrai_tutto.json contiene solo', articoli.length, 'articoli (attesi ~3500). Ricarica dal sito estrai_tutto.php con posts_per_page=-1 e suppress_filters=true.');
    if (php.avviso) console.warn('PHP:', php.avviso);
  }
  for (const a of articoli) {
    const id = String(a.id_articolo || '').trim();
    if (!id) continue;
    if (!mediaById[id]) mediaById[id] = { img_copertina_url: '', sottotitolo: '', id_autore: '' };
    if (a.img_copertina_url) mediaById[id].img_copertina_url = a.img_copertina_url;
    if (a.sottotitolo) mediaById[id].sottotitolo = a.sottotitolo;
    if (a.id_autore) mediaById[id].id_autore = a.id_autore;
  }
  const fromPhp = articoli.filter((a) => (a.img_copertina_url || '').trim()).length;
  console.log('Export PHP: articoli merge', articoli.length, '(con immagine:', fromPhp, ')');
}

// 4) Solo ID senza immagine dopo merge: chiamate API solo per quelli
const idsSenzaImg = v5Rows
  .filter((r) => !(mediaById[r.id_articolo] && (mediaById[r.id_articolo].img_copertina_url || '').trim()))
  .map((r) => r.id_articolo);
console.log('Articoli senza immagine (da integrare con API):', idsSenzaImg.length);

let apiOk = 0;
let apiErr = 0;
for (let i = 0; i < idsSenzaImg.length; i++) {
  const id = idsSenzaImg[i];
  if (i > 0) {
    const delay = i < API_DELAY_FIRST_N ? 0 : API_DELAY_MS;
    if (delay) await new Promise((r) => setTimeout(r, delay));
  }
  try {
    const imgUrl = await fetchWpMediaForPost(id);
    if (!mediaById[id]) mediaById[id] = { img_copertina_url: '', sottotitolo: '', id_autore: '' };
    if (imgUrl) {
      mediaById[id].img_copertina_url = imgUrl;
      apiOk++;
    }
  } catch (err) {
    apiErr++;
  }
  const done = i + 1;
  if (done % LOG_EVERY === 0 || done === idsSenzaImg.length) {
    console.log(`API progress: ${done}/${idsSenzaImg.length} (ok: ${apiOk}, err: ${apiErr})`);
  }
}
console.log('API: immagini recuperate', apiOk, ', errori', apiErr);

// 5) Costruisci righe finali: una per ogni V5, dati da mediaById
const header = ['id_articolo', 'titolo', 'url_articolo', 'img_copertina_url', 'sottotitolo', 'id_autore'];
const lines = ['\uFEFF' + header.map(escapeCsv).join(',')];
let withImage = 0;
for (const r of v5Rows) {
  const id = r.id_articolo;
  const m = mediaById[id] || { img_copertina_url: '', sottotitolo: '', id_autore: '' };
  const img = (m.img_copertina_url || '').trim();
  if (img) withImage++;
  lines.push([
    id,
    r.titolo,
    r.url_articolo,
    img,
    (m.sottotitolo || '').trim(),
    (m.id_autore || '').trim(),
  ].map(escapeCsv).join(','));
}

fs.mkdirSync(DATA, { recursive: true });
fs.writeFileSync(MEDIA_CSV_PATH, lines.join('\r\n'), 'utf8');
console.log('Scritto', MEDIA_CSV_PATH, '- righe:', lines.length - 1, ', con immagine:', withImage);

if (withImage < MIN_ROWS_WITH_IMAGE) {
  console.warn('Build NON eseguito: servono almeno', MIN_ROWS_WITH_IMAGE, 'righe con img_copertina_url (ora', withImage, ').');
  console.warn('Ricarica estrai_tutto.php dal sito (tutti i post, suppress_filters) e riesegui merge_media.');
  process.exit(1);
}

console.log('Lanciando build_articoli_megacluster.js...');
const child = spawn('node', [path.join(__dirname, 'build_articoli_megacluster.js')], {
  cwd: ROOT,
  stdio: 'inherit',
});
child.on('close', (code) => process.exit(code || 0));
