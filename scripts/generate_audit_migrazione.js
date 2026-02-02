/**
 * Genera audit_migrazione_completa.csv e riepilogo_temi_alias.md
 * da FINAL_V5 (Source of Truth) e articoli_semantici_FULL_2026.json.
 * Usa categoria_formale da V5 quando presente; altrimenti deriva da tax.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CSV_V5_PATH = path.join(__dirname, '..', '_migration_archive', 'categorie v2', 'articoli_2026_enriched_temi_s8_FINAL_V5.csv');
const ARTICOLI_JSON_PATH = path.join(__dirname, '..', 'scripts_and_data', 'datasets', 'articoli', 'articoli_semantici_FULL_2026.json');
const OUT_CSV = path.join(__dirname, '..', 'audit_migrazione_completa.csv');
const OUT_MD = path.join(__dirname, '..', 'riepilogo_temi_alias.md');

// Alias temi (allineato a taxonomy.js + T20 da FINAL_V2)
const THEME_ALIASES = {
  'Fede, Chiesa e spiritualità della fragilità': 'Spiritualità',
  'Memoria e storia di Fede e Luce (opzionale)': 'Storia Fede e Luce',
  'Dignità, valore della persona e sguardo sulla fragilità': 'Dignità e fragilità',
  'Pellegrinaggi, cammini e vita comunitaria in movimento': 'Pellegrinaggi e cammini',
  'Progetto di vita, autonomia e dopo di noi': 'Progetto di vita',
  'Linguaggio, cultura e rappresentazioni': 'Cultura e linguaggio',
  'Educare e crescere insieme': 'Educazione',
  'Giovani, futuro, speranza e cambiamento': 'Giovani e futuro',
  'Comunità, accoglienza e inclusione': 'Comunità',
  'Corpo, salute, cura e assistenza': 'Salute e cura',
  'Diritti, cittadinanza e società': 'Diritti e società',
  'Amicizia e relazioni autentiche': 'Relazioni',
  'Famiglie, genitori, fratelli': 'Famiglie',
  'Cinema e disabilità': 'Cinema',
  'Vivere la disabilità': 'Disabilità',
  'Domande aperte': 'Domande aperte',
};

function getThemeDisplayName(temaLabel) {
  if (!temaLabel || typeof temaLabel !== 'string') return '';
  return THEME_ALIASES[temaLabel] ?? temaLabel;
}

function normalize(s) {
  if (typeof s !== 'string') return '';
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

const TAG_TO_FORMAL = {
  intervista: 'Intervista', interview: 'Intervista',
  recensione: 'Recensione', review: 'Recensione',
  testimonianza: 'Testimonianza', testimony: 'Testimonianza',
  editoriale: 'Editoriale', editorial: 'Editoriale', editoriali: 'Editoriale',
  articolo: 'Articolo', article: 'Articolo',
};

const CATEGORY_SLUG_TO_FORMAL = {
  editoriali: 'Editoriale', interviste: 'Intervista', recensioni: 'Recensione', testimonianze: 'Testimonianza',
};

function getCategoriaFormale(tax) {
  if (!tax) return 'Articolo';
  const tags = (tax.tags || []).map((t) => (t && t.name ? normalize(t.name) : ''));
  for (const n of tags) {
    if (n && TAG_TO_FORMAL[n]) return TAG_TO_FORMAL[n];
  }
  const cats = (tax.categories || []).map((c) => (c && c.slug ? c.slug.toLowerCase() : ''));
  for (const slug of cats) {
    if (slug && CATEGORY_SLUG_TO_FORMAL[slug]) return CATEGORY_SLUG_TO_FORMAL[slug];
  }
  return 'Articolo';
}

function formatTagCategorie(tax) {
  if (!tax) return '';
  const tagNames = (tax.tags || []).map((t) => (t && t.name ? t.name : '')).filter(Boolean);
  const catNames = (tax.categories || []).map((c) => (c && c.name ? c.name : '')).filter(Boolean);
  const parts = [];
  if (tagNames.length) parts.push('Tag: ' + tagNames.join('; '));
  if (catNames.length) parts.push('Categorie: ' + catNames.join('; '));
  return parts.join(' | ');
}

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

function escapeCsvField(val) {
  const s = String(val == null ? '' : val);
  if (/[,"\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

// Carica articoli semantici (id -> tax + meta per titolo/url se diversi da CSV)
let articoliById = {};
try {
  const raw = fs.readFileSync(ARTICOLI_JSON_PATH, 'utf8');
  const arr = JSON.parse(raw);
  for (const a of arr) {
    if (a && a.id != null) {
      articoliById[String(a.id)] = {
        tax: a.tax,
        title: a.meta?.title,
        url: a.url,
      };
    }
  }
  console.log('Articoli semantici caricati:', Object.keys(articoliById).length);
} catch (e) {
  console.warn('articoli_semantici non trovato o errore:', e.message);
}

const rawCsv = fs.readFileSync(CSV_V5_PATH, 'utf8');
const lines = rawCsv.split(/\n').filter(Boolean);
const header = parseCSVLine(lines[0]);
const idx = {
  id_articolo: header.indexOf('id_articolo'),
  titolo: header.indexOf('titolo'),
  link: header.indexOf('link'),
  tema_code: header.indexOf('tema_code'),
  tema_label: header.indexOf('tema_label'),
  ruolo_editoriale: header.indexOf('ruolo_editoriale'),
  categoria_formale: header.indexOf('categoria_formale'),
};

const csvHeader = [
  'ID Articolo',
  'Titolo',
  'URL',
  'Cluster Originale',
  'Label Tema',
  'Label Sintetica (Alias)',
  'Categoria Formale',
  'Tag e categorie Originali',
  'Ruolo Editoriale',
];

const rows = [];
const temiMap = new Map(); // tema_code -> { tema_label, alias }

for (let i = 1; i < lines.length; i++) {
  const row = parseCSVLine(lines[i]);
  if (row.length <= Math.max(idx.id_articolo, idx.tema_label, idx.tema_code)) continue;
  const id = String(row[idx.id_articolo]).trim();
  const titolo = (row[idx.titolo] || '').trim();
  const link = (row[idx.link] || '').trim();
  const tema_code = (row[idx.tema_code] || '').trim();
  const tema_label = (row[idx.tema_label] || '').trim();
  const ruolo_editoriale = (row[idx.ruolo_editoriale] || '').trim();

  const sem = articoliById[id];
  const titoloFinale = (sem && sem.title) || titolo;
  const urlFinale = (sem && sem.url) || link;
  const categoriaFormaleV5 = idx.categoria_formale >= 0 ? (row[idx.categoria_formale] || '').trim() : '';
  const categoriaFormale = categoriaFormaleV5 && /^(Intervista|Recensione|Editoriale|Testimonianza|Articolo)$/i.test(categoriaFormaleV5)
    ? (categoriaFormaleV5.charAt(0).toUpperCase() + categoriaFormaleV5.slice(1).toLowerCase())
    : getCategoriaFormale(sem?.tax);
  const tagCategorie = formatTagCategorie(sem?.tax);

  const alias = getThemeDisplayName(tema_label) || tema_label;
  if (!temiMap.has(tema_code)) {
    temiMap.set(tema_code, { tema_label, alias });
  }

  rows.push([
    id,
    titoloFinale,
    urlFinale,
    tema_code,
    tema_label,
    alias,
    categoriaFormale,
    tagCategorie,
    ruolo_editoriale || '',
  ]);
}

// Scrivi CSV
const csvLines = [csvHeader.map(escapeCsvField).join(',')];
for (const r of rows) {
  csvLines.push(r.map(escapeCsvField).join(','));
}
fs.writeFileSync(OUT_CSV, '\uFEFF' + csvLines.join('\r\n'), 'utf8');
console.log('Scritto', OUT_CSV, '- righe:', rows.length + 1);

// Ordina temi per tema_code (T01, T02, ... T20)
const temiSorted = [...temiMap.entries()].sort((a, b) => {
  const na = a[0].replace(/^T/, '');
  const nb = b[0].replace(/^T/, '');
  const ia = parseInt(na, 10);
  const ib = parseInt(nb, 10);
  if (!Number.isNaN(ia) && !Number.isNaN(ib)) return ia - ib;
  return String(a[0]).localeCompare(b[0]);
});

let md = `# Riepilogo temi Megacluster S8 – Cluster e label sintetiche (Mega Menu)

**Fonte:** \`articoli_2026_enriched_temi_s8_FINAL_V5.csv\` (Source of Truth)  
**Alias:** stessi usati in \`taxonomy.js\` (getThemeDisplayName) per il Mega Menu.

| Cluster | Label Tema (estesa) | Label sintetica (alias menu) |
|---------|---------------------|------------------------------|
`;

for (const [code, { tema_label, alias }] of temiSorted) {
  md += `| ${code} | ${tema_label} | ${alias} |\n`;
}

md += `
## Note

- I **15 temi** (T01–T15) corrispondono al file FINAL_V5; T20 è stato ricatalogato negli altri temi.
- La **label sintetica** è quella mostrata nel menu di navigazione; per i temi senza alias dedicato si usa la label estesa.
`;

fs.writeFileSync(OUT_MD, md, 'utf8');
console.log('Scritto', OUT_MD);
