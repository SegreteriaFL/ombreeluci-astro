/**
 * Genera scripts_and_data/mappatura_post_pulizia_2026.csv
 * Colonne: slug, titolo, numero_id, anno, lingua, path_fisico
 * Fonte di verità per correzioni manuali post-pulizia.
 */
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { createWriteStream } from 'fs';

const BLOG_ROOT = join(process.cwd(), 'src', 'content', 'blog');
const OUT_CSV = join(process.cwd(), 'scripts_and_data', 'mappatura_post_pulizia_2026.csv');

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { data: {}, body: content };
  const raw = match[1];
  const data = {};
  for (const line of raw.split(/\r?\n/)) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1).replace(/""/g, '"');
    data[key] = value;
  }
  return { data, body: content.slice(match[0].length) };
}

function escapeCsv(s) {
  if (s == null) return '';
  const t = String(s);
  if (/[",\r\n]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
  return t;
}

async function collectInDir(dirPath, relPath, rows) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const numeroId = relPath ? relPath.replace(/\\/g, '/') : '';
  for (const e of entries) {
    const full = join(dirPath, e.name);
    const rel = relPath ? `${relPath}/${e.name}` : e.name;
    if (e.isDirectory()) {
      await collectInDir(full, rel, rows);
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
      const pathFisico = join('src', 'content', 'blog', rel).replace(/\\/g, '/');
      const slugPath = rel.replace(/\\/g, '/');
      const slug = slugPath.replace(/\.md$/i, '');
      let titolo = '';
      let anno = '';
      let lingua = 'it';
      try {
        const raw = await readFile(full, 'utf-8');
        const { data } = parseFrontmatter(raw);
        titolo = data.title || data.titolo || e.name.replace(/\.md$/i, '');
        const dateStr = data.date || data.anno_rivista || '';
        if (dateStr) {
          const y = dateStr.match(/\d{4}/);
          anno = y ? y[0] : '';
        }
        lingua = (data.lang || 'it').toLowerCase().slice(0, 2);
      } catch (err) {
        console.warn('Skip', full, err.message);
      }
      const numeroIdFolder = slugPath.includes('/') ? slugPath.split('/')[0] : numeroId || slug.split('/')[0] || '';
      rows.push({
        slug,
        titolo,
        numero_id: numeroIdFolder,
        anno,
        lingua,
        path_fisico: pathFisico,
      });
    }
  }
}

async function main() {
  const rows = [];
  await collectInDir(BLOG_ROOT, '', rows);
  rows.sort((a, b) => (a.slug || '').localeCompare(b.slug || ''));

  const header = 'slug,titolo,numero_id,anno,lingua,path_fisico\n';
  const stream = createWriteStream(OUT_CSV, { encoding: 'utf-8' });
  stream.write(header);
  for (const r of rows) {
    stream.write([
      escapeCsv(r.slug),
      escapeCsv(r.titolo),
      escapeCsv(r.numero_id),
      escapeCsv(r.anno),
      escapeCsv(r.lingua),
      escapeCsv(r.path_fisico),
    ].join(',') + '\n');
  }
  stream.end();
  console.log('Scritti', rows.length, 'record in', OUT_CSV);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
