/**
 * Sposta gli articoli in inglese in src/content/blog/en/.
 * Criteri: lang: "en" nel frontmatter OPPURE alta densità di stop-word inglesi nel corpo.
 * Aggiunge/imposta lang: "en" nel frontmatter dei file spostati.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const EN_DIR = path.join(BLOG_DIR, 'en');

const ENGLISH_STOP_WORDS = /\b(the|and|with|this|that|for|are|was|have|has|from|they|were)\b/gi;
const MIN_BODY_WORDS = 40;
const MIN_STOP_WORD_COUNT = 6;
const STOP_WORD_DENSITY_THRESHOLD = 0.05;

function listMarkdownFiles(dir, skipEn = true) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (skipEn && entry.name === 'en') continue;
      out.push(...listMarkdownFiles(full, skipEn));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

function splitFrontmatter(content) {
  const parts = content.split(/^---\s*$/m);
  if (parts.length < 3) {
    return { frontmatter: null, body: content };
  }
  const frontmatter = parts[1];
  const body = parts.slice(2).join('\n---\n').replace(/^\s+/, '');
  return { frontmatter, body };
}

function isLangEnInFrontmatter(frontmatter) {
  if (!frontmatter) return false;
  const m = frontmatter.match(/^lang\s*:\s*["']?en["']?\s*$/im);
  return !!m;
}

function bodyHasHighEnglishStopWordDensity(body) {
  if (!body || body.trim().length < 50) return false;
  const words = body.trim().split(/\s+/).filter(Boolean);
  if (words.length < MIN_BODY_WORDS) return false;
  const stopMatches = body.match(ENGLISH_STOP_WORDS);
  const stopCount = stopMatches ? stopMatches.length : 0;
  if (stopCount < MIN_STOP_WORD_COUNT) return false;
  const density = stopCount / words.length;
  return density >= STOP_WORD_DENSITY_THRESHOLD;
}

function ensureLangEnInFrontmatter(frontmatter) {
  const hasLang = /^lang\s*:/m.test(frontmatter);
  if (hasLang) {
    return frontmatter.replace(/^lang\s*:\s*.*$/m, 'lang: "en"');
  }
  return frontmatter.trimEnd() + '\nlang: "en"';
}

function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error('Directory non trovata:', BLOG_DIR);
    process.exit(1);
  }

  if (!fs.existsSync(EN_DIR)) {
    fs.mkdirSync(EN_DIR, { recursive: true });
    console.log('Creata cartella:', EN_DIR);
  }

  const files = listMarkdownFiles(BLOG_DIR, true);
  console.log(`Analizzati ${files.length} file in src/content/blog (esclusa en/)...`);

  const toMove = [];

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { frontmatter, body } = splitFrontmatter(raw);
    if (!frontmatter) continue;

    const byLang = isLangEnInFrontmatter(frontmatter);
    const byDensity = bodyHasHighEnglishStopWordDensity(body);

    if (byLang || byDensity) {
      toMove.push({
        path: filePath,
        raw,
        frontmatter,
        body,
        reason: byLang ? 'lang: en' : 'stop-word density',
      });
    }
  }

  console.log(`Articoli in inglese da spostare: ${toMove.length}`);

  let moved = 0;
  for (const { path: filePath, frontmatter, body } of toMove) {
    const relativePath = path.relative(BLOG_DIR, filePath);
    const newPath = path.join(EN_DIR, relativePath);
    const newDir = path.dirname(newPath);

    const newFrontmatter = ensureLangEnInFrontmatter(frontmatter);
    const newContent = '---\n' + newFrontmatter.trimEnd() + '\n---\n\n' + body.trim() + '\n';

    fs.mkdirSync(newDir, { recursive: true });
    fs.writeFileSync(newPath, newContent, 'utf8');
    fs.unlinkSync(filePath);
    moved++;

    if (moved % 50 === 0) {
      console.log(`Spostati ${moved}/${toMove.length}...`);
    }
  }

  const remaining = listMarkdownFiles(BLOG_DIR, true).length;
  console.log('\n--- Report ---');
  console.log('File spostati in src/content/blog/en/:', moved);
  console.log('File rimasti nella root italiana (blog e sottocartelle, esclusa en/):', remaining);
}

main();
