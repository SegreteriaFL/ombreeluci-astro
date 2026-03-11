/**
 * Rimuove ricorsivamente le directory vuote dentro src/content/blog (esclusa en/).
 */
import fs from 'fs';
import path from 'path';

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

function getSubdirs(dir, excludeEn = true) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory() && (!excludeEn || e.name !== 'en')) {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

function collectAllDirs(dir, list, excludeEn = true) {
  const subdirs = getSubdirs(dir, excludeEn);
  for (const d of subdirs) {
    list.push(d);
    collectAllDirs(d, list, false);
  }
}

function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error('Directory non trovata:', BLOG_DIR);
    process.exit(1);
  }
  const dirs = [];
  collectAllDirs(BLOG_DIR, dirs, true);
  dirs.sort((a, b) => b.length - a.length);
  let removed = 0;
  for (const dir of dirs) {
    try {
      const names = fs.readdirSync(dir);
      if (names.length === 0) {
        fs.rmdirSync(dir);
        console.log('Rimossa:', path.relative(BLOG_DIR, dir));
        removed++;
      }
    } catch (_) {}
  }
  console.log('Totale directory vuote rimosse:', removed);
}

main();
