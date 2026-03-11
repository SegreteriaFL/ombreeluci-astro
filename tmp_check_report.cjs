const fs = require('fs');
const path = require('path');

const root = process.cwd();

const report = fs.readFileSync(path.join(root, 'report_mancanti.md'), 'utf8');
const lines = report
  .split(/\r?\n/)
  .filter((l) => l.startsWith('|') && l.includes('http'));

const urls = new Set();
for (const line of lines) {
  const m = line.match(/\|\s*(https?:[^|]+)\s*\|/);
  if (m) {
    urls.add(m[1].trim());
  }
}

console.log('URLs in report rows:', urls.size);

const blogRoot = path.join(root, 'src', 'content', 'blog');
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      walk(path.join(dir, entry.name));
    } else if (entry.name.endsWith('.md')) {
      files.push(path.join(dir, entry.name));
    }
  }
}

walk(blogRoot);

let createdCount = 0;
let createdWithPlaceholder = 0;

for (const file of files) {
  const txt = fs.readFileSync(file, 'utf8');
  const m = txt.match(/original_url:\s*"([^"]+)"/);
  if (!m) continue;
  const url = m[1].trim();
  if (urls.has(url)) {
    createdCount++;
    if (txt.includes('Nessun contenuto testuale trovato')) {
      createdWithPlaceholder++;
    }
  }
}

console.log('Report URLs with a corresponding .md file:', createdCount);
console.log(
  'Of those, files still containing placeholder phrase:',
  createdWithPlaceholder
);

