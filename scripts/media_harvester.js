/**
 * Media Harvester: dati da WordPress REST API (preferito) o fallback scraping HTML.
 *
 * 1) API (leggero, evita 429):
 *    - Autori: GET /wp-json/wp/v2/users?per_page=100&page=N → description (bio), avatar_urls (foto).
 *    - Media:  GET /wp-json/wp/v2/media?parent=id_articolo → source_url (immagine articolo).
 *
 * 2) Se l'API restituisce 429 (o 401 per users, es. listing disabilitato): fallback "Ninja"
 *    con 5s di delay, usando come base gli URL estratti dalla pagina /chi-siamo/.
 *
 * Output: media_articoli.csv (con id_autore), database_autori.csv (~350–400 autori).
 * Eseguire: node scripts/media_harvester.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const V5_PATH = path.join(__dirname, '..', '_migration_archive', 'categorie v2', 'articoli_2026_enriched_temi_s8_FINAL_V5.csv');
const ARTICOLI_SEMANTICI_PATH = path.join(__dirname, '..', '_migration_archive', 'export pulito db 2026', 'articoli_semantici_FULL_2026.json');
const OUT_MEDIA = path.join(__dirname, '..', 'src', 'data', 'media_articoli.csv');
const OUT_AUTORI = path.join(__dirname, '..', 'src', 'data', 'database_autori.csv');

const WP_API_BASE = 'https://www.ombreeluci.it/wp-json/wp/v2';
const CONCURRENCY = 5;
const AUTHOR_CONCURRENCY = 1;
const DELAY_MS_AFTER_AUTHOR_FETCH = 2500;
const NINJA_DELAY_MS = 5000; // fallback se API dà 429
const API_MEDIA_DELAY_MS = 400; // pausa tra richieste media API per non stressare il server
const USER_AGENT = 'Ombreeluci-MediaHarvester/1.0 (migration)';
const AUTHOR_BASE_URL = 'https://www.ombreeluci.it/author/';
const CHI_SIAMO_URL = 'https://www.ombreeluci.it/chi-siamo/';

function parseCSVLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === ',' && !inQuotes) || (c === '\r' && !inQuotes)) {
      out.push(cur.trim());
      cur = '';
    } else if (c !== '\r') {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

function slugify(name) {
  return String(name ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'autore';
}

function escapeCsv(val) {
  const s = String(val == null ? '' : val);
  if (/[,"\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

/** Limita concorrenza */
async function runWithLimit(tasks, limit = CONCURRENCY) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      try {
        results[i] = await tasks[i]();
      } catch (err) {
        results[i] = { error: err.message };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, () => worker()));
  return results;
}

/** Fetch HTML; 404 e altri errori vengono propagati (res.ok = false per 404). */
async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow',
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

/** Fetch JSON (WP REST API). Lancia se !res.ok (es. 429). */
async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      redirect: 'follow',
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

/** Scarica tutti gli utenti da WP API (pagina 100 per volta). Ritorna Map slug -> { description, avatar_url }. */
async function fetchWpUsers() {
  const bySlug = new Map();
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const url = `${WP_API_BASE}/users?per_page=100&page=${page}`;
    const data = await fetchJson(url);
    if (!Array.isArray(data) || data.length === 0) break;
    for (const u of data) {
      const slug = (u.slug || '').trim();
      if (!slug) continue;
      const description = (u.description || '').trim();
      let avatar = '';
      if (u.avatar_urls && typeof u.avatar_urls === 'object') {
        avatar = u.avatar_urls['96'] || u.avatar_urls['48'] || u.avatar_urls.full || Object.values(u.avatar_urls)[0] || '';
      }
      bySlug.set(slug, { description, avatar_url: avatar || '', name: (u.name || '').trim(), link: (u.link || '').trim() });
    }
    if (data.length < 100) hasMore = false;
    else page++;
  }
  return bySlug;
}

/** Ritorna l'URL dell'immagine (source_url) del primo media allegato al post, o null. */
async function fetchWpMediaForPost(postId) {
  const url = `${WP_API_BASE}/media?parent=${postId}&per_page=1`;
  const data = await fetchJson(url);
  if (!Array.isArray(data) || data.length === 0) return null;
  const first = data[0];
  return (first.source_url || first.guid?.rendered || '').trim() || null;
}

/** Estrae da /chi-siamo/ tutti i link che puntano a /author/* (o comunque a ombreeluci.it). */
async function extractUrlsFromChiSiamo() {
  const html = await fetchHtml(CHI_SIAMO_URL);
  const $ = cheerio.load(html);
  const urls = [];
  const seen = new Set();
  $('a[href]').each((i, el) => {
    let href = ($(el).attr('href') || '').trim();
    try {
      const u = new URL(href, 'https://www.ombreeluci.it/');
      if (u.hostname !== 'www.ombreeluci.it' && u.hostname !== 'ombreeluci.it') return;
      const norm = u.href.replace(/\/$/, '');
      if (seen.has(norm)) return;
      seen.add(norm);
      if (u.pathname.includes('/author/') || u.pathname.includes('/chi-siamo')) urls.push(u.href);
    } catch (_) {}
  });
  return urls;
}

/** Estrae da HTML articolo: og:image (prioritario), h2.tit2. Se trova un'immagine DEVE finire nel CSV. */
function parseArticlePage(html) {
  const $ = cheerio.load(html);
  let imgCopertina = '';
  // Priorità 1: og:image (obbligatorio se presente)
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage) imgCopertina = ogImage.trim();
  // Fallback: prima img in article o .post
  if (!imgCopertina) {
    const img = $('article img, .post img, .entry-content img').first();
    if (img.length) {
      let src = img.attr('src') || img.attr('data-src');
      if (src) {
        if (src.startsWith('//')) src = 'https:' + src;
        else if (src.startsWith('/')) src = 'https://www.ombreeluci.it' + src;
        imgCopertina = src.trim();
      }
    }
  }

  let sottotitolo = '';
  const tit2 = $('h2.tit2').first();
  if (tit2.length) {
    const htmlContent = tit2.html();
    sottotitolo = (htmlContent || tit2.text() || '').trim();
  }

  return { imgCopertina, sottotitolo };
}

/** Estrae post id dalla pagina articolo (body class postid-XXX o meta). */
function parseArticleId(html, url) {
  const $ = cheerio.load(html);
  const bodyClass = $('body').attr('class') || '';
  const m = bodyClass.match(/postid-(\d+)/);
  if (m) return m[1];
  const ogUrl = $('meta[property="og:url"]').attr('content') || '';
  const pMatch = ogUrl.match(/[?&]p=(\d+)/);
  if (pMatch) return pMatch[1];
  const linkCanonical = $('link[rel="canonical"]').attr('href') || '';
  const pMatch2 = linkCanonical.match(/[?&]p=(\d+)/);
  if (pMatch2) return pMatch2[1];
  return null;
}

/** Estrae da HTML pagina autore: bio (.bio-autore .et_pb_text_inner, fallback .author-description o div con testo), foto (.img-autore img o img.avatar). */
function parseAuthorPage(html) {
  const $ = cheerio.load(html);
  let bioHtml = '';
  const bioEl = $('.bio-autore .et_pb_text_inner').first();
  if (bioEl.length) bioHtml = (bioEl.html() || bioEl.text() || '').trim();
  if (!bioHtml) {
    const authorDesc = $('.author-description').first();
    if (authorDesc.length) bioHtml = (authorDesc.html() || authorDesc.text() || '').trim();
  }
  if (!bioHtml) {
    const descBlock = $('.author-bio, .author-description, .bio, [class*="author"] [class*="text"], .et_pb_text').filter((i, el) => $(el).text().trim().length > 50).first();
    if (descBlock.length) bioHtml = (descBlock.html() || descBlock.text() || '').trim();
  }

  let fotoUrl = '';
  let imgEl = $('.img-autore img').first();
  if (imgEl.length) {
    let src = imgEl.attr('src') || imgEl.attr('data-src') || '';
    if (src.startsWith('//')) src = 'https:' + src;
    if (src) fotoUrl = src.trim();
  }
  if (!fotoUrl) {
    imgEl = $('img.avatar').first();
    if (imgEl.length) {
      let src = imgEl.attr('src') || imgEl.attr('data-src') || '';
      if (src.startsWith('//')) src = 'https:' + src;
      if (src) fotoUrl = src.trim();
    }
  }
  if (!fotoUrl) {
    imgEl = $('.author-photo img, [class*="author"] img').first();
    if (imgEl.length) {
      let src = imgEl.attr('src') || imgEl.attr('data-src') || '';
      if (src.startsWith('//')) src = 'https:' + src;
      if (src) fotoUrl = src.trim();
    }
  }

  let nomeCognome = '';
  const title = $('h1.entry-title').first();
  if (title.length) nomeCognome = (title.text() || '').trim();
  if (!nomeCognome) {
    const meta = $('meta[property="og:title"]').attr('content');
    if (meta) nomeCognome = meta.trim();
  }

  return { bioHtml, fotoUrl, nomeCognome };
}

// --- Lista maestra autori e mappa articolo -> autore da articoli_semantici ---
let articleIdToAuthor = {};
const uniqueAuthorNames = new Set();
try {
  const raw = fs.readFileSync(ARTICOLI_SEMANTICI_PATH, 'utf8');
  const arr = JSON.parse(raw);
  for (const a of arr) {
    if (a && a.id != null) {
      const author = (a.meta && a.meta.author) ? String(a.meta.author).trim() : '';
      if (author) {
        articleIdToAuthor[String(a.id)] = author;
        uniqueAuthorNames.add(author);
      }
    }
  }
  console.log('Articoli con autore (articoli_semantici):', Object.keys(articleIdToAuthor).length);
  console.log('Autori unici (lista maestra):', uniqueAuthorNames.size);
} catch (e) {
  console.warn('articoli_semantici non trovato o errore:', e.message);
  console.warn('Usando solo V5: autori da scoprire dalle pagine articolo.');
}

// Deduplica per slug: un solo record per id_autore (nome = primo nome che mappa a quello slug)
const authorBySlug = {};
for (const name of uniqueAuthorNames) {
  const s = slugify(name);
  if (!authorBySlug[s]) authorBySlug[s] = name;
}
const authorSlugsToProcess = Object.keys(authorBySlug);
console.log('Autori univoci per slug da visitare:', authorSlugsToProcess.length);

// Cache autori da database_autori.csv esistente: se già presente con bio o foto, skip fetch
const existingAutoriById = new Map();
try {
  const existing = fs.readFileSync(OUT_AUTORI, 'utf8');
  const existingLines = existing.split(/\n/).filter(Boolean);
  if (existingLines.length > 1) {
    const h = parseCSVLine(existingLines[0]);
    const idxId = h.indexOf('id_autore');
    const idxBio = h.indexOf('bio_html');
    const idxFoto = h.indexOf('foto_url');
    if (idxId >= 0) {
      for (let i = 1; i < existingLines.length; i++) {
        const row = parseCSVLine(existingLines[i]);
        if (row.length <= idxId) continue;
        const id = String(row[idxId]).trim();
        const bio = idxBio >= 0 ? (row[idxBio] || '').trim() : '';
        const foto = idxFoto >= 0 ? (row[idxFoto] || '').trim() : '';
        if (id) existingAutoriById.set(id, { bio, foto });
      }
      console.log('Cache autori da CSV esistente:', existingAutoriById.size);
    }
  }
} catch (e) {
  // file assente
}

// --- V5: righe articoli ---
const rawV5 = fs.readFileSync(V5_PATH, 'utf8');
const linesV5 = rawV5.split(/\n/).filter(Boolean);
const headerV5 = parseCSVLine(linesV5[0]);
const idxId = headerV5.indexOf('id_articolo');
const idxTitolo = headerV5.indexOf('titolo');
const idxLink = headerV5.indexOf('link');
if (idxId < 0 || idxTitolo < 0 || idxLink < 0) {
  console.error('V5: colonne id_articolo, titolo, link richieste');
  process.exit(1);
}

const v5Rows = [];
const linkToRow = new Map(); // link normalizzato -> row (evita duplicati)
for (let i = 1; i < linesV5.length; i++) {
  const row = parseCSVLine(linesV5[i]);
  if (row.length <= Math.max(idxId, idxTitolo, idxLink)) continue;
  const id = String(row[idxId]).trim();
  const titolo = (row[idxTitolo] || '').trim();
  const link = (row[idxLink] || '').trim();
  if (!id || !link) continue;
  const norm = link.replace(/\/$/, '');
  v5Rows.push({ id_articolo: id, titolo, link });
  linkToRow.set(norm, { id_articolo: id, titolo, link });
}

/** Scopre URL articoli recenti dalla homepage (es. /2025/suor-veronica-pompei/). */
const SITE_ORIGIN = 'https://www.ombreeluci.it';
async function discoverRecentArticleUrls(baseUrl = SITE_ORIGIN + '/', maxPages = 3) {
  const found = [];
  const seen = new Set([...linkToRow.keys()].map(k => k.replace(/\/$/, '')));
  const articlePathRe = /^\/(20\d{2})\/[a-z0-9-]+\/?$/;
  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = page === 1 ? baseUrl : `${SITE_ORIGIN}/page/${page}/`;
      const html = await fetchHtml(url);
      const $ = cheerio.load(html);
      $('a[href]').each((i, el) => {
        let href = ($(el).attr('href') || '').trim();
        if (!href) return;
        try {
          const u = new URL(href, SITE_ORIGIN + '/');
          if (u.hostname !== 'www.ombreeluci.it' && u.hostname !== 'ombreeluci.it') return;
          const path = u.pathname.replace(/\/$/, '') || '/';
          const full = u.origin + path;
          if (seen.has(full)) return;
          const match = path.match(articlePathRe);
          if (match) {
            seen.add(full);
            found.push({ link: full + '/', titolo: $(el).text().trim() || 'Articolo' });
          }
        } catch (_) {}
      });
    }
  } catch (e) {
    console.warn('Discovery URL recenti:', e.message);
  }
  return found;
}

// Seed URL articoli recenti noti (es. Suor Veronica 2025) se non scoperti dalla homepage
const RECENT_URLS_SEED = [
  'https://www.ombreeluci.it/2025/suor-veronica-pompei/',
];
console.log('Scoperta URL articoli recenti dalla homepage...');
let recentUrls = await discoverRecentArticleUrls(SITE_ORIGIN + '/', 3);
const seedNorm = new Set(recentUrls.map(r => r.link.replace(/\/$/, '')));
for (const url of RECENT_URLS_SEED) {
  const norm = url.replace(/\/$/, '');
  if (!linkToRow.has(norm) && !seedNorm.has(norm)) {
    recentUrls.push({ link: url.endsWith('/') ? url : url + '/', titolo: 'Articolo' });
    seedNorm.add(norm);
  }
}
let rowsToScrape = [...v5Rows];
if (recentUrls.length > 0) {
  const resolved = [];
  for (const r of recentUrls) {
    try {
      const html = await fetchHtml(r.link);
      const id = parseArticleId(html, r.link);
      if (id && !linkToRow.has(r.link.replace(/\/$/, ''))) {
        resolved.push({ id_articolo: id, titolo: r.titolo || 'Articolo', link: r.link });
        linkToRow.set(r.link.replace(/\/$/, ''), { id_articolo: id, titolo: r.titolo, link: r.link });
      }
    } catch (e) {
      console.warn('Resolve ID per', r.link, e.message);
    }
  }
  rowsToScrape = [...v5Rows, ...resolved];
  console.log('Articoli recenti scoperti e risolti:', resolved.length, '(totale da scrapare:', rowsToScrape.length, ')');
}

// --- 1) Media articoli: prima WP API (media?parent=id), se 429 fallback Ninja (HTML + 5s delay) ---
const mediaRows = [];
let apiMediaFailed = false;

async function fillMediaViaApi() {
  console.log('Media articoli: tentativo WP API (media?parent=id)...');
  for (let i = 0; i < rowsToScrape.length; i++) {
    const r = rowsToScrape[i];
    const id_autore = articleIdToAuthor[r.id_articolo] ? slugify(articleIdToAuthor[r.id_articolo]) : '';
    try {
      if (i > 0) await new Promise((res) => setTimeout(res, API_MEDIA_DELAY_MS));
      const imgUrl = await fetchWpMediaForPost(r.id_articolo);
      mediaRows.push({
        id_articolo: r.id_articolo,
        titolo: r.titolo,
        url_articolo: r.link,
        img_copertina_url: imgUrl || '',
        sottotitolo: '',
        id_autore,
      });
      if (imgUrl) console.log('[API media]', r.id_articolo, 'img=1');
    } catch (err) {
      if (String(err.message).includes('429')) {
        apiMediaFailed = true;
        console.warn('API media: ricevuto 429, fallback Ninja per media.');
        return;
      }
      mediaRows.push({ id_articolo: r.id_articolo, titolo: r.titolo, url_articolo: r.link, img_copertina_url: '', sottotitolo: '', id_autore });
    }
  }
}

await fillMediaViaApi();

if (apiMediaFailed) {
  mediaRows.length = 0;
  console.log('Ninja media: scraping HTML con delay', NINJA_DELAY_MS / 1000, 's tra richieste...');
  for (let i = 0; i < rowsToScrape.length; i++) {
    const r = rowsToScrape[i];
    const id_autore = articleIdToAuthor[r.id_articolo] ? slugify(articleIdToAuthor[r.id_articolo]) : '';
    if (i > 0) await new Promise((res) => setTimeout(res, NINJA_DELAY_MS));
    try {
      const html = await fetchHtml(r.link);
      const { imgCopertina, sottotitolo } = parseArticlePage(html);
      mediaRows.push({
        id_articolo: r.id_articolo,
        titolo: r.titolo,
        url_articolo: r.link,
        img_copertina_url: imgCopertina || '',
        sottotitolo: sottotitolo || '',
        id_autore,
      });
      if (imgCopertina) console.log('[Ninja articolo]', r.id_articolo, 'img=1');
    } catch (err) {
      console.warn('[FAIL articolo]', r.id_articolo, err.message);
      mediaRows.push({ id_articolo: r.id_articolo, titolo: r.titolo, url_articolo: r.link, img_copertina_url: '', sottotitolo: '', id_autore });
    }
  }
}

console.log('Media articoli pronti:', mediaRows.length);

// --- 2) Autori: prima WP API (users?per_page=100), se 429 fallback Ninja (URL da /chi-siamo/ + 5s delay) ---
const authorResults = new Map(); // id_autore -> { nome_cognome, url_autore_wp, bio_html, foto_url }

for (const id_autore of authorSlugsToProcess) {
  const cached = existingAutoriById.get(id_autore);
  if (cached && (cached.bio || cached.foto)) {
    authorResults.set(id_autore, {
      nome_cognome: authorBySlug[id_autore],
      url_autore_wp: AUTHOR_BASE_URL + id_autore + '/',
      bio_html: cached.bio || '',
      foto_url: cached.foto || '',
    });
  }
}

let apiUsersFailed = false;
try {
  console.log('Autori: tentativo WP API (users?per_page=100)...');
  const wpUsers = await fetchWpUsers();
  for (const [slug, data] of wpUsers) {
    const bio = (data.description || '').trim();
    const foto = (data.avatar_url || '').trim();
    authorResults.set(slug, {
      nome_cognome: data.name || authorBySlug[slug] || slug,
      url_autore_wp: data.link || AUTHOR_BASE_URL + slug + '/',
      bio_html: bio,
      foto_url: foto,
    });
    if (bio || foto) console.log('[API autore]', slug, 'bio=' + (bio ? '1' : '0'), 'foto=' + (foto ? '1' : '0'));
  }
  console.log('API utenti caricati:', wpUsers.size);
} catch (err) {
  const msg = String(err.message || '');
  if (msg.includes('429') || msg.includes('401')) {
    apiUsersFailed = true;
    console.warn('API users: ricevuto', msg.includes('429') ? '429' : '401 (listing disabilitato)', '- fallback Ninja (URL da /chi-siamo/ + delay', NINJA_DELAY_MS / 1000, 's).');
  } else throw err;
}

if (apiUsersFailed) {
  let chiSiamoUrls = [];
  try {
    chiSiamoUrls = await extractUrlsFromChiSiamo();
    console.log('Ninja: estratti', chiSiamoUrls.length, 'URL da', CHI_SIAMO_URL);
  } catch (e) {
    console.warn('Ninja: impossibile leggere chi-siamo:', e.message);
  }
  const authorSlugsToFetch = authorSlugsToProcess.filter((id) => {
    const has = authorResults.get(id);
    return !has || (!(has.bio_html || '').trim() && !(has.foto_url || '').trim());
  });
  for (let i = 0; i < authorSlugsToFetch.length; i++) {
    const id_autore = authorSlugsToFetch[i];
    if (i > 0) await new Promise((r) => setTimeout(r, NINJA_DELAY_MS));
    const url = chiSiamoUrls.find((u) => u.replace(/\/$/, '').endsWith('/' + id_autore)) || AUTHOR_BASE_URL + id_autore + '/';
    const nome_cognome = authorBySlug[id_autore];
    try {
      const html = await fetchHtml(url);
      const { bioHtml, fotoUrl, nomeCognome } = parseAuthorPage(html);
      const hasBio = !!(bioHtml && bioHtml.trim().length > 0);
      const hasFoto = !!(fotoUrl && fotoUrl.trim().length > 0);
      authorResults.set(id_autore, {
        nome_cognome: nomeCognome || nome_cognome,
        url_autore_wp: AUTHOR_BASE_URL + id_autore + '/',
        bio_html: bioHtml || '',
        foto_url: fotoUrl || '',
      });
      if (hasBio || hasFoto) console.log('[Ninja autore]', id_autore, 'bio=' + (hasBio ? '1' : '0'), 'foto=' + (hasFoto ? '1' : '0'));
    } catch (err) {
      authorResults.set(id_autore, { nome_cognome, url_autore_wp: AUTHOR_BASE_URL + id_autore + '/', bio_html: '', foto_url: '' });
      console.log('[FAIL autore]', id_autore, err.message);
    }
  }
}

// Assicura che ogni autore della lista maestra sia in authorResults (fallback vuoti)
for (const id_autore of authorSlugsToProcess) {
  if (authorResults.has(id_autore)) continue;
  authorResults.set(id_autore, {
    nome_cognome: authorBySlug[id_autore],
    url_autore_wp: AUTHOR_BASE_URL + id_autore + '/',
    bio_html: '',
    foto_url: '',
  });
}

// --- Scrivi media_articoli.csv (con id_autore) ---
const mediaHeader = ['id_articolo', 'titolo', 'url_articolo', 'img_copertina_url', 'sottotitolo', 'id_autore'];
const mediaLines = [mediaHeader.map(escapeCsv).join(',')];
for (const r of mediaRows) {
  mediaLines.push(
    [r.id_articolo, r.titolo, r.url_articolo, r.img_copertina_url, r.sottotitolo, r.id_autore || ''].map(escapeCsv).join(',')
  );
}
fs.mkdirSync(path.dirname(OUT_MEDIA), { recursive: true });
fs.writeFileSync(OUT_MEDIA, '\uFEFF' + mediaLines.join('\r\n'), 'utf8');
console.log('Scritto', OUT_MEDIA, '- righe:', mediaRows.length);

// --- Scrivi database_autori.csv (tutti gli autori, anche 404/vuoti) ---
const autoriHeader = ['id_autore', 'nome_cognome', 'url_autore_wp', 'bio_html', 'foto_url'];
const autoriLines = [autoriHeader.map(escapeCsv).join(',')];
for (const id_autore of authorSlugsToProcess) {
  const a = authorResults.get(id_autore);
  if (!a) continue;
  autoriLines.push([id_autore, a.nome_cognome, a.url_autore_wp, a.bio_html, a.foto_url].map(escapeCsv).join(','));
}
fs.writeFileSync(OUT_AUTORI, '\uFEFF' + autoriLines.join('\r\n'), 'utf8');
console.log('Scritto', OUT_AUTORI, '- autori:', authorResults.size);
