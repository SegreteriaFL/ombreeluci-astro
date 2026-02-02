/**
 * [ARCHIVIATO] Spacchettamento T20: articoli ex-T20 con confidenza bassa → "Riflessioni" (T20).
 * Gli altri restano su tema_primario da articoli_ricatalogati_v2 (15 temi).
 * Genera FINAL_V4.csv e poi si può rigenerare articoli_megacluster.json.
 *
 * Nota: script obsoleto; la Source of Truth è ora FINAL_V5.
 * Se eseguito da scripts/archive, i path vanno adattati (__dirname è .../scripts/archive).
 *
 * Input:
 *   - FINAL_V2 (per sapere quali erano T20 e per colonne base)
 *   - articoli_ricatalogati_v2 (tema_primario, score_primario, ruolo_editoriale, categoria_menu)
 *   - temi_categorie_mapping_v1 + T20 Riflessioni
 * Output: FINAL_V4.csv (stesso schema di V3, 20 temi possibili)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DIR = path.join(__dirname, '..', '..', '_migration_archive', 'categorie v2');
const FINAL_V2_PATH = path.join(DIR, 'articoli_2026_enriched_temi_s8_FINAL_V2.csv');
const RICATALOG_PATH = path.join(DIR, 'articoli_ricatalogati_v2.csv');
const MAPPING_PATH = path.join(DIR, 'temi_categorie_mapping_v1.csv');
const OUT_V4_PATH = path.join(DIR, 'articoli_2026_enriched_temi_s8_FINAL_V4.csv');

/** Soglia: sotto questa confidenza, ex-T20 va in Riflessioni (T20) */
const CONFIDENCE_THRESHOLD = 0.45;

/** T20 label e categoria per "Domande aperte" / Riflessioni */
const T20_LABEL = 'Riflessioni';
const T20_CATEGORIA = 'Riflessioni';

function parseCSVLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if ((c === ',' && !inQuotes) || (c === '\r' && !inQuotes)) {
      out.push(cur.trim());
      cur = '';
    } else if (c !== '\r') cur += c;
  }
  out.push(cur.trim());
  return out;
}

function readCSV(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\n/).filter(Boolean);
  const header = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    rows.push(parseCSVLine(lines[i]));
  }
  return { header, rows };
}

// Mapping tema_label -> tema_code, categoria_menu (T01-T15 da file + T20)
const labelToCode = {};
const labelToMenu = {};
try {
  const mappingRaw = fs.readFileSync(MAPPING_PATH, 'utf8');
  const mappingLines = mappingRaw.split(/\n/).filter(Boolean);
  const mapHeader = parseCSVLine(mappingLines[0]);
  const idxId = mapHeader.indexOf('id_tema');
  const idxLabel = mapHeader.indexOf('tema_label');
  const idxMenu = mapHeader.indexOf('categoria_menu');
  for (let i = 1; i < mappingLines.length; i++) {
    const r = parseCSVLine(mappingLines[i]);
    const label = (r[idxLabel] || '').trim();
    if (label) {
      labelToCode[label] = (r[idxId] || '').trim();
      labelToMenu[label] = (r[idxMenu] || '').trim();
    }
  }
} catch (e) {
  console.warn('Mapping non trovato, uso solo T20:', e.message);
}
labelToCode[T20_LABEL] = 'T20';
labelToMenu[T20_LABEL] = T20_CATEGORIA;

const v2 = readCSV(FINAL_V2_PATH);
const catalog = readCSV(RICATALOG_PATH);

const v2Header = v2.header;
const v2Idx = {
  id: v2Header.indexOf('id_articolo'),
  tema_code: v2Header.indexOf('tema_code'),
  tema_label: v2Header.indexOf('tema_label'),
  categoria_menu: v2Header.indexOf('categoria_menu'),
  ruolo: v2Header.indexOf('ruolo_editoriale'),
  confidenza: v2Header.indexOf('confidenza_tema'),
};
const catHeader = catalog.header;
const catIdx = {
  id: catHeader.indexOf('id_articolo'),
  tema_primario: catHeader.indexOf('tema_primario'),
  score_primario: catHeader.indexOf('score_primario'),
  categoria_menu: catHeader.indexOf('categoria_menu'),
  ruolo: catHeader.indexOf('ruolo_editoriale'),
};

const catalogById = new Map();
for (const row of catalog.rows) {
  const id = String(row[catIdx.id] || '').trim();
  if (!id) continue;
  const score = parseFloat((row[catIdx.score_primario] || '0').replace(',', '.')) || 0;
  catalogById.set(id, {
    tema_primario: (row[catIdx.tema_primario] || '').trim(),
    score_primario: score,
    categoria_menu: (row[catIdx.categoria_menu] || '').trim(),
    ruolo: (row[catIdx.ruolo] || '').trim(),
  });
}

// V2 non ha categoria_menu; V3 sì. Usiamo lo stesso header di V3 (con categoria_menu e ruolo)
const outHeader = [
  'id_articolo', 'titolo', 'link', 'cluster_id', 'cluster_prob', 'outlier_score',
  'umap2_x', 'umap2_y', 'umap3_x', 'umap3_y', 'umap3_z', 'id_subcluster',
  'tema_code', 'tema_label', 'confidenza_tema', 'origine_assegnazione', 'ruolo_editoriale', 'categoria_menu',
];
const v2ColCount = v2Header.length;

const outRows = [];
let countRiflessioni = 0;
let countAlto = 0;

for (const row of v2.rows) {
  if (row.length < v2ColCount) continue;
  const id = String(row[v2Idx.id] || '').trim();
  if (!id) continue;

  const wasT20 = (row[v2Idx.tema_code] || '').trim() === 'T20';
  const cat = catalogById.get(id);

  let tema_label, tema_code, categoria_menu, ruolo_editoriale, confidenza_tema;
  if (cat) {
    const score = cat.score_primario;
    if (wasT20 && score < CONFIDENCE_THRESHOLD) {
      tema_label = T20_LABEL;
      tema_code = 'T20';
      categoria_menu = T20_CATEGORIA;
      ruolo_editoriale = (cat.ruolo || row[v2Idx.ruolo] || 'trasversale').trim();
      confidenza_tema = String(score);
      countRiflessioni++;
    } else {
      tema_label = cat.tema_primario || row[v2Idx.tema_label] || '';
      tema_code = labelToCode[tema_label] || '';
      categoria_menu = cat.categoria_menu || labelToMenu[tema_label] || '';
      ruolo_editoriale = (cat.ruolo || row[v2Idx.ruolo] || '').trim();
      confidenza_tema = String(score);
      if (wasT20) countAlto++;
    }
  } else {
    tema_label = (row[v2Idx.tema_label] || '').trim() || T20_LABEL;
    tema_code = labelToCode[tema_label] || (wasT20 ? 'T20' : '');
    categoria_menu = (row[v2Idx.categoria_menu] || '').trim() || labelToMenu[tema_label] || T20_CATEGORIA;
    ruolo_editoriale = (row[v2Idx.ruolo] || 'trasversale').trim();
    confidenza_tema = (row[v2Idx.confidenza] || '').trim();
    if (wasT20) countRiflessioni++;
  }

  const outRow = [
    row[v2Header.indexOf('id_articolo')] ?? '',
    row[v2Header.indexOf('titolo')] ?? '',
    row[v2Header.indexOf('link')] ?? '',
    row[v2Header.indexOf('cluster_id')] ?? '',
    row[v2Header.indexOf('cluster_prob')] ?? '',
    row[v2Header.indexOf('outlier_score')] ?? '',
    row[v2Header.indexOf('umap2_x')] ?? '',
    row[v2Header.indexOf('umap2_y')] ?? '',
    row[v2Header.indexOf('umap3_x')] ?? '',
    row[v2Header.indexOf('umap3_y')] ?? '',
    row[v2Header.indexOf('umap3_z')] ?? '',
    row[v2Header.indexOf('id_subcluster')] ?? '',
    tema_code,
    tema_label,
    confidenza_tema,
    (row[v2Header.indexOf('origine_assegnazione')] ?? 'explode_t20_v4').trim(),
    ruolo_editoriale,
    categoria_menu,
  ];
  outRows.push(outRow);
}

const csvLines = [outHeader.join(',')];
for (const r of outRows) {
  const escaped = r.map((cell) => {
    const s = String(cell ?? '');
    if (/[,"\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  });
  csvLines.push(escaped.join(','));
}
fs.writeFileSync(OUT_V4_PATH, '\uFEFF' + csvLines.join('\r\n'), 'utf8');

console.log('Scritto', OUT_V4_PATH);
console.log('Righe:', outRows.length);
console.log('Ex-T20 con confidenza <', CONFIDENCE_THRESHOLD, '→ Riflessioni (T20):', countRiflessioni);
console.log('Ex-T20 con confidenza >= soglia → tema_primario:', countAlto);
console.log('Esegui: node scripts/build_articoli_megacluster.js (dopo aver puntato il build a FINAL_V4)');
