/**
 * Legge il JSON prodotto da estrai_tutto.php e scrive i due CSV
 * che build_articoli_megacluster.js si aspetta in src/data/.
 *
 * Uso:
 *   node scripts/json_to_csv.js estrai_tutto.json
 *   node scripts/json_to_csv.js   (cerca estrai_tutto.json nella root del progetto)
 *
 * Il JSON deve avere la forma: { "articoli": [...], "autori": [...] }
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');

function escapeCsv(val) {
  const s = String(val == null ? '' : val);
  if (/[,"\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

const jsonPath = process.argv[2] || path.join(ROOT, 'estrai_tutto.json');
if (!fs.existsSync(jsonPath)) {
  console.error('File non trovato:', jsonPath);
  console.error('Uso: node scripts/json_to_csv.js [estrai_tutto.json]');
  process.exit(1);
}

const raw = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(raw);
const articoli = data.articoli || [];
const autori = data.autori || [];

if (articoli.length < 500) {
  console.warn('Attenzione: il JSON contiene solo', articoli.length, 'articoli. Per non perdere dati usa merge_media.js (V5 + questo JSON + API). Scrivendo comunque i CSV.');
}

// media_articoli.csv
const mediaHeader = ['id_articolo', 'titolo', 'url_articolo', 'img_copertina_url', 'sottotitolo', 'id_autore'];
const mediaLines = ['\uFEFF' + mediaHeader.join(',')];
for (const r of articoli) {
  mediaLines.push(
    [r.id_articolo, r.titolo, r.url_articolo, r.img_copertina_url || '', r.sottotitolo || '', r.id_autore || ''].map(escapeCsv).join(',')
  );
}
const mediaPath = path.join(DATA, 'media_articoli.csv');
fs.mkdirSync(DATA, { recursive: true });
fs.writeFileSync(mediaPath, mediaLines.join('\r\n'), 'utf8');
console.log('Scritto', mediaPath, '- righe:', articoli.length);

// database_autori.csv
const autoriHeader = ['id_autore', 'nome_cognome', 'url_autore_wp', 'bio_html', 'foto_url'];
const autoriLines = ['\uFEFF' + autoriHeader.join(',')];
for (const a of autori) {
  autoriLines.push(
    [a.id_autore, a.nome_cognome, a.url_autore_wp, a.bio_html || '', a.foto_url || ''].map(escapeCsv).join(',')
  );
}
const autoriPath = path.join(DATA, 'database_autori.csv');
fs.writeFileSync(autoriPath, autoriLines.join('\r\n'), 'utf8');
console.log('Scritto', autoriPath, '- righe:', autori.length);
console.log('Ora puoi lanciare: node scripts/build_articoli_megacluster.js');
