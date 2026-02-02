/**
 * Legge FINAL_V5 (V4 + audit categoria_formale) e genera src/data/articoli_megacluster.json.
 * Unisce eventuali dati media (media_articoli.csv) e autori (database_autori.csv) prodotti da media_harvester.js.
 * Genera prima FINAL_V5 con: node scripts/build_final_v5.js
 * Opzionale: node scripts/media_harvester.js per popolare media_articoli.csv e database_autori.csv
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CSV_PATH = path.join(__dirname, '..', '_migration_archive', 'categorie v2', 'articoli_2026_enriched_temi_s8_FINAL_V5.csv');
const MEDIA_CSV_PATH = path.join(__dirname, '..', 'src', 'data', 'media_articoli.csv');
const AUTORI_CSV_PATH = path.join(__dirname, '..', 'src', 'data', 'database_autori.csv');
const OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'articoli_megacluster.json');

function parseCSVLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === ',' && !inQuotes) || (c === '\r' && !inQuotes)) {
      out.push(cur.trim());
      cur = '';
    } else if (c !== '\r') {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

function slugify(label) {
  return String(label)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const raw = fs.readFileSync(CSV_PATH, 'utf8');
const lines = raw.split(/\n/).filter(Boolean);
const header = parseCSVLine(lines[0]);
const idx = {
  id_articolo: header.indexOf('id_articolo'),
  tema_label: header.indexOf('tema_label'),
  categoria_menu: header.indexOf('categoria_menu'),
  ruolo_editoriale: header.indexOf('ruolo_editoriale') >= 0 ? header.indexOf('ruolo_editoriale') : -1,
  categoria_formale: header.indexOf('categoria_formale') >= 0 ? header.indexOf('categoria_formale') : -1,
};

const byId = {};
const temiSet = new Set();
const categorieSet = new Set();

for (let i = 1; i < lines.length; i++) {
  const row = parseCSVLine(lines[i]);
  const maxCol = Math.max(
    idx.id_articolo,
    idx.tema_label,
    idx.categoria_menu,
    idx.ruolo_editoriale >= 0 ? idx.ruolo_editoriale : 0,
    idx.categoria_formale >= 0 ? idx.categoria_formale : 0
  );
  if (row.length <= maxCol) continue;
  const id = String(row[idx.id_articolo]).trim();
  const tema_label = (row[idx.tema_label] || '').trim();
  const categoria_menu = (row[idx.categoria_menu] || '').trim();
  const ruolo_editoriale = idx.ruolo_editoriale >= 0 ? (row[idx.ruolo_editoriale] || '').trim() : '';
  const categoria_formale = idx.categoria_formale >= 0 ? (row[idx.categoria_formale] || '').trim() : null;
  if (!id) continue;
  const catMenu = categoria_menu || tema_label || null;
  const forma = categoria_formale || null;
  byId[id] = {
    tema_label: tema_label || null,
    categoria_menu: catMenu,
    ruolo_editoriale: ruolo_editoriale || null,
    forma: forma || null,
  };
  if (tema_label) temiSet.add(tema_label);
  if (catMenu) categorieSet.add(catMenu);
}

const temiUnici = Array.from(temiSet).sort();
const categorieUniche = Array.from(categorieSet).sort();
const slugToTema = {};
temiUnici.forEach((t) => { slugToTema[slugify(t)] = t; });

// Mappa tema_label -> categoria_menu (per menu e display: label = categoria_menu)
const temaToCategoria = {};
for (const id of Object.keys(byId)) {
  const r = byId[id];
  if (r.tema_label && temaToCategoria[r.tema_label] == null) {
    temaToCategoria[r.tema_label] = r.categoria_menu || r.tema_label;
  }
}

// Merge media (img_copertina_url, sottotitolo) da media_articoli.csv se presente
let mediaByArticle = {};
try {
  const mediaRaw = fs.readFileSync(MEDIA_CSV_PATH, 'utf8');
  const mediaLines = mediaRaw.split(/\n/).filter(Boolean);
  if (mediaLines.length > 1) {
    const mediaHeader = parseCSVLine(mediaLines[0]);
    const idxId = mediaHeader.indexOf('id_articolo');
    const idxImg = mediaHeader.indexOf('img_copertina_url');
    const idxSottotitolo = mediaHeader.indexOf('sottotitolo');
    const idxAutore = mediaHeader.indexOf('id_autore');
    if (idxId >= 0 && idxImg >= 0 && idxSottotitolo >= 0) {
      for (let i = 1; i < mediaLines.length; i++) {
        const row = parseCSVLine(mediaLines[i]);
        const maxCol = Math.max(idxId, idxImg, idxSottotitolo, idxAutore >= 0 ? idxAutore : 0);
        if (row.length <= maxCol) continue;
        const id = String(row[idxId]).trim();
        const img = (row[idxImg] || '').trim();
        const sottotitolo = (row[idxSottotitolo] || '').trim();
        const id_autore = idxAutore >= 0 ? (row[idxAutore] || '').trim() : '';
        if (id) mediaByArticle[id] = { img_copertina_url: img || null, sottotitolo: sottotitolo || null, id_autore: id_autore || null };
      }
      for (const id of Object.keys(byId)) {
        if (mediaByArticle[id]) {
          byId[id].img_copertina_url = mediaByArticle[id].img_copertina_url;
          byId[id].sottotitolo = mediaByArticle[id].sottotitolo;
          if (mediaByArticle[id].id_autore) byId[id].id_autore = mediaByArticle[id].id_autore;
        }
      }
      // Articoli solo in media (es. recenti dall'harvester): aggiungi a byId (ID sempre stringa, nessun conflitto)
      for (const id of Object.keys(mediaByArticle)) {
        const sid = String(id).trim();
        if (!byId[sid]) {
          const m = mediaByArticle[id];
          byId[sid] = {
            tema_label: null,
            categoria_menu: null,
            ruolo_editoriale: null,
            forma: null,
            img_copertina_url: m && m.img_copertina_url || null,
            sottotitolo: m && m.sottotitolo || null,
            id_autore: m && m.id_autore || null,
          };
        }
      }
      console.log('Merge media: articoli con media', Object.keys(mediaByArticle).length);
    }
  }
} catch (e) {
  // media_articoli.csv assente o errore: nessun merge
}

// Carica autori da database_autori.csv se presente (per Astro: autoriById)
let autoriById = {};
try {
  const autoriRaw = fs.readFileSync(AUTORI_CSV_PATH, 'utf8');
  const autoriLines = autoriRaw.split(/\n/).filter(Boolean);
  if (autoriLines.length > 1) {
    const autoriHeader = parseCSVLine(autoriLines[0]);
    const idxId = autoriHeader.indexOf('id_autore');
    const idxNome = autoriHeader.indexOf('nome_cognome');
    const idxUrl = autoriHeader.indexOf('url_autore_wp');
    const idxBio = autoriHeader.indexOf('bio_html');
    const idxFoto = autoriHeader.indexOf('foto_url');
    if (idxId >= 0 && idxNome >= 0) {
      for (let i = 1; i < autoriLines.length; i++) {
        const row = parseCSVLine(autoriLines[i]);
        if (row.length <= idxId) continue;
        const id = String(row[idxId]).trim();
        if (!id) continue;
        autoriById[id] = {
          nome_cognome: (row[idxNome] || '').trim() || id,
          url_autore_wp: idxUrl >= 0 ? (row[idxUrl] || '').trim() : null,
          bio_html: idxBio >= 0 ? (row[idxBio] || '').trim() : null,
          foto_url: idxFoto >= 0 ? (row[idxFoto] || '').trim() : null,
        };
      }
      console.log('Autori caricati:', Object.keys(autoriById).length);
    }
  }
} catch (e) {
  // database_autori.csv assente o errore
}

const payload = {
  byId,
  temiUnici,
  categorieUniche,
  slugToTema,
  temaToCategoria,
  autoriById,
  generatedAt: new Date().toISOString(),
};

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2), 'utf8');
const countForma = {};
Object.values(byId).forEach((r) => {
  const f = r.forma || 'Articolo';
  countForma[f] = (countForma[f] || 0) + 1;
});
console.log('Scritto', OUT_PATH, '- articoli:', Object.keys(byId).length, ', temi:', temiUnici.length);
console.log('Conteggi forma: Intervista', countForma.Intervista ?? 0, ', Editoriale', countForma.Editoriale ?? 0);