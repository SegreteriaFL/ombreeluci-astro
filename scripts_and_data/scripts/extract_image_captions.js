import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const blogDir = path.join(rootDir, 'src', 'content', 'blog');

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

function stripHtmlTags(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeYamlString(value) {
  // usa stringhe quotate per sicurezza
  const v = String(value).replace(/"/g, '\\"');
  return `"${v}"`;
}

function ensureImageCaptionInFrontmatter(frontmatter, captionText) {
  if (!captionText) return frontmatter;

  // se esiste già image_caption, non sovrascrivere (prudenza)
  if (/^image_caption:/m.test(frontmatter)) {
    return frontmatter;
  }

  const lines = frontmatter.split(/\r?\n/);
  let inserted = false;
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    out.push(line);
    // se troviamo una riga image: ..., inseriamo subito dopo
    if (!inserted && /^image\s*:/m.test(line)) {
      out.push(`image_caption: ${escapeYamlString(captionText)}`);
      inserted = true;
    }
  }

  if (!inserted) {
    // se non c'è image:, aggiungi in fondo al frontmatter
    out.push(`image_caption: ${escapeYamlString(captionText)}`);
  }

  return out.join('\n');
}

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { frontmatter, body } = splitFrontmatter(raw);
  if (!frontmatter) {
    return false;
  }

  // cerca il primo <p class="custom_caption">...</p>
  const captionRegex = /<p\s+class=["']custom_caption["'][^>]*>([\s\S]*?)<\/p>/i;
  const match = body.match(captionRegex);
  if (!match) {
    return false;
  }

  const innerHtml = match[1] || '';
  const captionText = stripHtmlTags(innerHtml);
  if (!captionText) {
    return false;
  }

  const newFrontmatter = ensureImageCaptionInFrontmatter(frontmatter, captionText);
  const newBody = body.replace(captionRegex, '').replace(/^\s+$/gm, '').trim();

  const updated =
    '---\n' + newFrontmatter.trimEnd() + '\n---\n\n' + newBody + '\n';

  fs.writeFileSync(filePath, updated, 'utf8');
  console.log(`Estratta didascalia da ${path.relative(blogDir, filePath)}`);
  return true;
}

function main() {
  if (!fs.existsSync(blogDir)) {
    console.error(`Directory not found: ${blogDir}`);
    process.exit(1);
  }

  const files = listMarkdownFiles(blogDir);
  console.log(`Analizzando ${files.length} file Markdown in src/content/blog...`);
  let processed = 0;
  for (const file of files) {
    const ok = processFile(file);
    if (ok) processed++;
  }
  console.log(`Completato. File con didascalia estratta: ${processed}`);
}

main();

