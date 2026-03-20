import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

const rootDir = process.cwd();
const blogDir = path.join(rootDir, 'src', 'content', 'blog');

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

// Rimuovi elementi non utili
turndownService.remove([
  'script',
  'style',
  'noscript',
  'iframe',
  'svg',
  'form',
]);

// Mantieni le didascalie come testo semplice sotto le immagini
turndownService.addRule('customCaption', {
  filter: (node) =>
    node.nodeName === 'P' &&
    node.attribs &&
    typeof node.attribs.class === 'string' &&
    node.attribs.class.split(/\s+/).includes('custom_caption'),
  replacement: (content) => `\n\n${content}\n\n`,
});

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
  // parts[0] is empty or preamble, parts[1] is frontmatter, rest is body
  const frontmatter = parts[1];
  const body = parts.slice(2).join('\n---\n').replace(/^\s+/, '');
  return { frontmatter, body };
}

function updateFrontmatterText(frontmatter, updates) {
  const lines = frontmatter.split(/\r?\n/);
  const keys = Object.keys(updates).filter(
    (k) => updates[k] !== undefined && updates[k] !== null && updates[k] !== ''
  );

  const existingIndex = {};
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)([a-zA-Z0-9_]+):\s*(.*)$/);
    if (m) {
      const key = m[2];
      if (keys.includes(key)) {
        existingIndex[key] = i;
      }
    }
  }

  for (const key of keys) {
    const rawValue = String(updates[key]).trim();
    const safeValue = rawValue.replace(/"/g, '\\"');
    const lineText = `${key}: "${safeValue}"`;
    if (existingIndex[key] !== undefined) {
      lines[existingIndex[key]] = lineText;
    } else {
      lines.push(lineText);
    }
  }

  return lines.join('\n');
}

async function fetchHtml(url) {
  const res = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    },
    timeout: 15000,
  });
  return res.data;
}

function extractFromHtml(html) {
  const $ = cheerio.load(html);

  // Pulisci elementi rumorosi dentro al contenuto
  $(
    '.sharedaddy, .jp-relatedposts, .social-share, .post-navigation, .entry-meta, .post-meta, .wp-block-group.has-background'
  ).remove();

  // Sottotitolo: h2.tit2
  const subtitle =
    $('h2.tit2')
      .first()
      .text()
      .replace(/\s+/g, ' ')
      .trim() || null;

  // Immagine in evidenza
  let image = null;
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage) {
    image = ogImage.trim();
  } else {
    const imgSelectors = [
      'figure.wp-block-post-featured-image img',
      '.wp-block-post-featured-image img',
      'img.wp-post-image',
      '.featured-image img',
      'article img',
    ];
    for (const sel of imgSelectors) {
      const el = $(sel).first();
      if (el && el.attr('src')) {
        image = el.attr('src').trim();
        break;
      }
    }
  }

  // Corpo principale
  let contentHtml = '';
  const bodySelectors = [
    'div.elementor-widget-theme-post-content',
    'div[data-widget_type="theme-post-content.default"]',
    'div.entry-content',
    'article .entry-content',
    'article .post-content',
    'main article .content',
    'div.post-content',
    'article',
  ];

  for (const selector of bodySelectors) {
    const el = $(selector).first();
    if (el && el.length) {
      contentHtml = el.html();
      if (contentHtml) break;
    }
  }

  // Fallback: paragrafi dentro article
  if (!contentHtml) {
    const paragraphs = $('article p');
    if (paragraphs.length > 0) {
      contentHtml = paragraphs.parent().html();
    }
  }

  if (!contentHtml || contentHtml.trim().length < 50) {
    return { subtitle, image, markdownBody: null };
  }

  const markdownBody = turndownService.turndown(contentHtml);
  return { subtitle, image, markdownBody };
}

async function processFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { frontmatter, body } = splitFrontmatter(raw);

  if (!frontmatter) {
    console.warn(`[SKIP] No frontmatter in ${filePath}`);
    return false;
  }

  // Solo file che hanno ancora il placeholder (nessun contenuto reale)
  if (!body.includes('Nessun contenuto testuale trovato')) {
    return false;
  }

  const urlMatch = frontmatter.match(/original_url:\s*"([^"]+)"/);
  if (!urlMatch || !urlMatch[1]) {
    console.warn(`[SKIP] No original_url in frontmatter for ${filePath}`);
    return false;
  }

  const url = urlMatch[1].trim();
  console.log(`Scraping ${url} -> ${path.relative(blogDir, filePath)}`);

  try {
    const html = await fetchHtml(url);
    const { subtitle, image, markdownBody } = extractFromHtml(html);

    if (!markdownBody) {
      console.warn(
        `[WARN] Content empty or too short for ${url}, leaving placeholder.`
      );
      return false;
    }

    const newFrontmatter = updateFrontmatterText(frontmatter, {
      subtitle,
      image,
    });

    const newContent =
      '---\n' + newFrontmatter.trimEnd() + '\n---\n\n' + markdownBody.trim() + '\n';

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Updated ${path.relative(blogDir, filePath)}`);
    return true;
  } catch (err) {
    console.error(`[ERROR] Failed to process ${url}:`, err.message || err);
    return false;
  }
}

async function main() {
  if (!fs.existsSync(blogDir)) {
    console.error(`Directory not found: ${blogDir}`);
    return;
  }

  const files = listMarkdownFiles(blogDir);
  const targets = files.filter((file) => {
    const txt = fs.readFileSync(file, 'utf8');
    return txt.includes('Nessun contenuto testuale trovato');
  });

  console.log(
    `Found ${targets.length} Markdown files in blog needing content scraping.`
  );
  if (targets.length === 0) {
    console.log('Nothing to do, exiting.');
    return;
  }

  let success = 0;
  for (const file of targets) {
    const ok = await processFile(file);
    if (ok) success++;
    // Delay per non sovraccaricare il server
    await delay(500);
  }

  console.log(
    `Done. Successfully updated ${success} out of ${targets.length} files.`
  );
}

main().catch((err) => {
  console.error('Fatal error in scraper_all.js:', err);
  process.exit(1);
});

