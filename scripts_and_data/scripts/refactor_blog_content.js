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

function parseFrontmatterSubtitle(frontmatter) {
  const m = frontmatter.match(/^subtitle:\s*(.+)$/m);
  if (!m) return null;
  let raw = m[1].trim();
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    raw = raw.slice(1, -1);
  }
  return raw.trim();
}

function parseFrontmatterImage(frontmatter) {
  const m = frontmatter.match(/^image:\s*(.+)$/m);
  if (!m) return null;
  let raw = m[1].trim();
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    raw = raw.slice(1, -1);
  }
  return raw.trim();
}

function normalizeText(s) {
  return s
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function stripMarkdownDecorations(line) {
  let txt = line.trim();
  txt = txt.replace(/^##+\s+/, '');
  txt = txt.replace(/^#\s+/, '');
  txt = txt.replace(/^\*\*(.+)\*\*$/, '$1');
  txt = txt.replace(/^>(\s*)/, '');
  return txt.trim();
}

function removeDuplicateSubtitle(body, subtitle) {
  if (!subtitle) return body;
  const normSub = normalizeText(subtitle);
  let lines = body.split(/\r?\n/);

  // find first 3 non-empty lines
  const nonEmptyIdx = [];
  for (let i = 0; i < lines.length && nonEmptyIdx.length < 3; i++) {
    if (lines[i].trim() !== '') nonEmptyIdx.push(i);
  }

  const toRemove = new Set();
  for (const idx of nonEmptyIdx) {
    const candidate = stripMarkdownDecorations(lines[idx]);
    if (!candidate) continue;
    if (normalizeText(candidate) === normSub) {
      toRemove.add(idx);
    }
  }

  if (toRemove.size === 0) return body;

  lines = lines.filter((_, idx) => !toRemove.has(idx));

  // trim leading empty lines
  while (lines.length && lines[0].trim() === '') lines.shift();

  return lines.join('\n');
}

function attachCaptionsToImages(body) {
  const lines = body.split(/\r?\n/);
  const newLines = [];
  let lastWasImage = false;

  for (const line of lines) {
    const trimmed = line.trim();

    const isImage = /!\[[^\]]*]\([^)]+\)/.test(trimmed);
    if (isImage) {
      newLines.push(line);
      lastWasImage = true;
      continue;
    }

    if (/custom_caption/i.test(line)) {
      // strip HTML tags to get plain caption text
      const text = line
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (text) {
        const italic = `*${text}*`;
        newLines.push(italic);
      }
      lastWasImage = false;
      continue;
    }

    // drop raw article-image-caption classes or similar HTML noise
    if (/article-image-caption/.test(line)) {
      continue;
    }

    newLines.push(line);
    lastWasImage = false;
  }

  return newLines.join('\n');
}

function maybeRemoveHeroImageDuplicate(body, heroUrl) {
  if (!heroUrl) return body;
  const lines = body.split(/\r?\n/);

  let firstIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== '') {
      firstIdx = i;
      break;
    }
  }
  if (firstIdx === -1) return body;

  const firstLine = lines[firstIdx].trim();
  const m = firstLine.match(/!\[[^\]]*]\(([^)]+)\)/);
  if (m) {
    const url = m[1].trim();
    if (url === heroUrl) {
      // remove this line (and any immediate following empty line)
      lines.splice(firstIdx, 1);
      if (firstIdx < lines.length && lines[firstIdx].trim() === '') {
        lines.splice(firstIdx, 1);
      }
    }
  }

  return lines.join('\n');
}

async function main() {
  if (!fs.existsSync(blogDir)) {
    console.error(`Directory not found: ${blogDir}`);
    process.exit(1);
  }

  const files = listMarkdownFiles(blogDir);
  console.log(`Refactoring ${files.length} Markdown files in src/content/blog...`);

  let subtitleCleaned = 0;
  let captionsReattached = 0;
  let heroRemoved = 0;

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const { frontmatter, body } = splitFrontmatter(raw);
    if (!frontmatter) continue;

    const subtitle = parseFrontmatterSubtitle(frontmatter);
    const heroImage = parseFrontmatterImage(frontmatter);

    let newBody = body;

    const beforeSub = newBody;
    newBody = removeDuplicateSubtitle(newBody, subtitle);
    if (newBody !== beforeSub) subtitleCleaned++;

    const beforeCap = newBody;
    newBody = attachCaptionsToImages(newBody);
    if (newBody !== beforeCap) captionsReattached++;

    const beforeHero = newBody;
    newBody = maybeRemoveHeroImageDuplicate(newBody, heroImage);
    if (newBody !== beforeHero) heroRemoved++;

    if (newBody !== body) {
      const updated = `---\n${frontmatter.trimEnd()}\n---\n\n${newBody.trim()}\n`;
      fs.writeFileSync(file, updated, 'utf8');
    }
  }

  console.log('Refactor complete.');
  console.log('Files with subtitle/body cleanup:', subtitleCleaned);
  console.log('Files where captions were normalized:', captionsReattached);
  console.log('Files where hero image duplicate was removed:', heroRemoved);
}

main().catch((err) => {
  console.error('Fatal error in refactor_blog_content.js:', err);
  process.exit(1);
});

