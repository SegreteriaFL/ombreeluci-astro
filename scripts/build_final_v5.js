/**
 * Unisce FINAL_V4 con audit_migrazione_completa.csv per generare FINAL_V5.
 * Aggiunge la colonna categoria_formale (valori: Intervista, Recensione, Editoriale, Testimonianza, Articolo).
 * Eseguire: node scripts/build_final_v5.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DIR = path.join(__dirname, '..', '_migration_archive', 'categorie v2');
const AUDIT_PATH = path.join(__dirname, '..', 'audit_migrazione_completa.csv');
const V4_PATH = path.join(DIR, 'articoli_2026_enriched_temi_s8_FINAL_V4.csv');
const V5_PATH = path.join(DIR, 'articoli_2026_enriched_temi_s8_FINAL_V5.csv');

const FORMAL_VALUES = ['Intervista', 'Recensione', 'Editoriale', 'Testimonianza', 'Articolo'];

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

function normalizeFormal(val) {
  if (val == null || val === '') return 'Articolo';
  const s = String(val).trim();
  if (!s) return 'Articolo';
  const cap = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  return FORMAL_VALUES.includes(cap) ? cap : 'Articolo';
}

// Leggi audit: ID Articolo -> Categoria Formale
const auditRaw = fs.readFileSync(AUDIT_PATH, 'utf8');
const auditLines = auditRaw.split(/\n/).filter(Boolean);
const auditHeader = parseCSVLine(auditLines[0]);
const auditIdIdx = auditHeader.findIndex((h) => /id\s*articolo/i.test(h));
const auditFormalIdx = auditHeader.findIndex((h) => /categoria\s*formale/i.test(h));
if (auditIdIdx < 0 || auditFormalIdx < 0) {
  throw new Error('Audit CSV: colonne ID Articolo e/o Categoria Formale non trovate');
}

const auditById = {};
for (let i = 1; i < auditLines.length; i++) {
  const row = parseCSVLine(auditLines[i]);
  const id = String(row[auditIdIdx] || '').trim();
  const formal = normalizeFormal(row[auditFormalIdx]);
  if (id) auditById[id] = formal;
}

// Leggi V4
const v4Raw = fs.readFileSync(V4_PATH, 'utf8');
const v4Lines = v4Raw.split(/\n/).filter(Boolean);
const v4Header = parseCSVLine(v4Lines[0]);
const v4IdIdx = v4Header.indexOf('id_articolo');
if (v4IdIdx < 0) throw new Error('V4: colonna id_articolo non trovata');

const V5_COLUMNS = [
  'id_articolo', 'titolo', 'link', 'cluster_id', 'cluster_prob', 'outlier_score',
  'umap2_x', 'umap2_y', 'umap3_x', 'umap3_y', 'umap3_z', 'id_subcluster',
  'tema_code', 'tema_label', 'confidenza_tema', 'origine_assegnazione',
  'ruolo_editoriale', 'categoria_menu', 'categoria_formale',
];
const v4ColIdx = {};
V5_COLUMNS.slice(0, -1).forEach((col, i) => {
  const idx = v4Header.indexOf(col);
  if (idx >= 0) v4ColIdx[col] = idx;
});

const outHeader = V5_COLUMNS;
const outRows = [];

for (let i = 1; i < v4Lines.length; i++) {
  const row = parseCSVLine(v4Lines[i]);
  const id = String(row[v4IdIdx] || '').trim();
  const categoriaFormale = id && auditById[id] != null ? auditById[id] : 'Articolo';
  const outRow = V5_COLUMNS.slice(0, -1).map((col) => (v4ColIdx[col] >= 0 ? row[v4ColIdx[col]] ?? '' : ''));
  outRow.push(categoriaFormale);
  outRows.push(outRow);
}

// Scrivi CSV (escape campi che contengono virgola)
function escapeCsv(val) {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const outLines = [outHeader.map(escapeCsv).join(',')];
for (const row of outRows) {
  outLines.push(row.map(escapeCsv).join(','));
}
fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(V5_PATH, outLines.join('\n'), 'utf8');

const countFormal = {};
outRows.forEach((r) => {
  const f = r[r.length - 1];
  countFormal[f] = (countFormal[f] || 0) + 1;
});
console.log('Scritto', V5_PATH);
console.log('Righe dati:', outRows.length);
console.log('Conteggi categoria_formale:', countFormal);
