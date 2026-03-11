import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const MEGACLUSTER_PATH = path.join(ROOT, 'src', 'data', 'articoli_megacluster.json');

function listMarkdownFiles(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listMarkdownFiles(full));
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

function escapeYamlString(value) {
  const v = String(value).replace(/"/g, '\\"');
  return `"${v}"`;
}

function main() {
  if (!fs.existsSync(MEGACLUSTER_PATH)) {
    console.error('File non trovato:', MEGACLUSTER_PATH);
    process.exit(1);
  }

  const megaclusterRaw = fs.readFileSync(MEGACLUSTER_PATH, 'utf8');
  const megacluster = JSON.parse(megaclusterRaw);
  const byId = (megacluster && megacluster.byId) || {};

  if (!fs.existsSync(BLOG_DIR)) {
    console.error('Directory non trovata:', BLOG_DIR);
    process.exit(1);
  }

  const files = listMarkdownFiles(BLOG_DIR);
  console.log(`Sincronizzazione sottotitoli e didascalie da articoli_megacluster.json verso ${files.length} file Markdown...`);

  let updatedCount = 0;

  for (const file of files) {
    const rel = path.relative(BLOG_DIR, file);
    const raw = fs.readFileSync(file, 'utf8');
    const { frontmatter, body } = splitFrontmatter(raw);
    if (!frontmatter) continue;

    const wpIdMatch = frontmatter.match(/^wp_id:\s*("?)([^"\r\n]+)\1\s*$/m);
    if (!wpIdMatch) continue;
    const wpId = wpIdMatch[2].trim();
    if (!wpId) continue;

    const entry = byId[wpId];
    if (!entry) continue;

    const subtitleFromJson = (entry.sottotitolo || '').trim();
    const captionFromJson = (entry.didascalia_copertina || entry.caption || '').trim();

    let fmLines = frontmatter.split(/\r?\n/);
    let hasSubtitle = false;
    let hasImageCaption = false;

    for (const line of fmLines) {
      if (/^subtitle\s*:/i.test(line)) hasSubtitle = true;
      if (/^image_caption\s*:/i.test(line)) hasImageCaption = true;
    }

    let changed = false;

    if (subtitleFromJson && !hasSubtitle) {
      // inserisci subtitle in fondo al frontmatter
      fmLines.push(`subtitle: ${escapeYamlString(subtitleFromJson)}`);
      changed = true;
    }

    if (captionFromJson && !hasImageCaption) {
      fmLines.push(`image_caption: ${escapeYamlString(captionFromJson)}`);
      changed = true;
    }

    if (!changed) continue;

    const newFrontmatter = fmLines.join('\n');
    const updated =
      '---\n' + newFrontmatter.trimEnd() + '\n---\n\n' + body.trim() + '\n';
    fs.writeFileSync(file, updated, 'utf8');
    updatedCount++;
    if (updatedCount % 100 === 0) {
      console.log(`Aggiornati ${updatedCount} file...`);
    }
  }

  console.log(`Completato. File aggiornati: ${updatedCount}`);
}

main();

