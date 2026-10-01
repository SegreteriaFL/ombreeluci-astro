#!/usr/bin/env node
/**
 * Ispezione URL via GSC URL Inspection API (stato indicizzazione, ultima scansione, canonical).
 * Uso: node scripts/gsc-inspect.mjs <url> [<url> ...]
 * Auth: stesso service account di gsc-query.mjs.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KEY_FILE = process.env.GSC_KEY_FILE
  || path.join(__dirname, '..', '.secrets', 'ombreeluci-seo-1ede0e05d5b6.json');
const SITE = 'https://ombreeluci.it/';

const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE,
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});
const sc = google.searchconsole({ version: 'v1', auth });

for (const url of process.argv.slice(2)) {
  const { data } = await sc.urlInspection.index.inspect({
    requestBody: { inspectionUrl: url, siteUrl: SITE, languageCode: 'it' },
  });
  const r = data.inspectionResult?.indexStatusResult ?? {};
  console.log(`\n== ${url}`);
  for (const k of ['verdict', 'coverageState', 'robotsTxtState', 'indexingState', 'pageFetchState',
    'lastCrawlTime', 'crawledAs', 'googleCanonical', 'userCanonical', 'referringUrls']) {
    if (r[k] !== undefined) console.log(`  ${k}: ${JSON.stringify(r[k])}`);
  }
}
