/**
 * Genera src/data/autori_stats.json analizzando gli articoli (content blog).
 * Per ogni autore: nome, slug, count_articoli, bio_breve (placeholder), foto (placeholder).
 * Eseguire: node scripts/build_autori_stats.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONTENT_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');
const OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'autori_stats.json');

function slugify(name) {
  return String(name ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'autore';
}

function extractFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const block = match[1];
  const out = {};
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return out;
}

function walkDir(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkDir(full, fileList);
    else if (e.name.endsWith('.md')) fileList.push(full);
  }
  return fileList;
}

const files = walkDir(CONTENT_DIR);
const byAuthor = {};

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const fm = extractFrontmatter(raw);
  const author = (fm.author || '').trim();
  if (!author || author === 'Autore sconosciuto') continue;
  byAuthor[author] = (byAuthor[author] || 0) + 1;
}

const autori = Object.entries(byAuthor)
  .map(([nome, count_articoli]) => ({
    nome,
    slug: slugify(nome),
    count_articoli,
    bio_breve: 'Autore di Ombre e Luci',
    foto: '/images/authors/default.png',
  }))
  .sort((a, b) => b.count_articoli - a.count_articoli);

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(autori, null, 2), 'utf8');
console.log('Scritto', OUT_PATH, '- autori:', autori.length);
