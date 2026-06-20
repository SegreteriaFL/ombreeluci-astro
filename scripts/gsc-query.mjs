/**
 * gsc-query.mjs
 *
 * Query Search Analytics (Google Search Console API) per diagnosi SEO.
 * Auth: service account JSON in .secrets/ (path via env GSC_KEY_FILE,
 * default .secrets/ombreeluci-seo-1ede0e05d5b6.json).
 *
 * Uso:
 *   node scripts/gsc-query.mjs
 *   node scripts/gsc-query.mjs --dimensions=date --start=2026-05-20 --end=2026-06-14
 *   node scripts/gsc-query.mjs --dimensions=page --start=2026-06-01 --end=2026-06-14 --rowLimit=50
 *   node scripts/gsc-query.mjs --dimensions=date,page --contains=/en/ --start=2026-06-01 --end=2026-06-14
 *
 * Parametri:
 *   --dimensions  date,page,query,country,device (default: date)
 *   --start       data inizio YYYY-MM-DD (default: 30 giorni fa)
 *   --end         data fine YYYY-MM-DD (default: oggi)
 *   --contains    filtra dimensione "page" per sottostringa (es. /en/)
 *   --rowLimit    max righe (default: 25000 per date-only, 100 altrimenti)
 *   --type        web | image | video | news | discover (default: web)
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    return [key, value ?? true];
  })
);

const KEY_FILE = process.env.GSC_KEY_FILE
  || path.join(__dirname, '..', '.secrets', 'ombreeluci-seo-1ede0e05d5b6.json');

const dimensions = (args.dimensions || 'date').split(',');
const isDateOnly = dimensions.length === 1 && dimensions[0] === 'date';

const today = new Date();
const defaultStart = new Date(today);
defaultStart.setDate(defaultStart.getDate() - 30);
const fmt = (d) => d.toISOString().slice(0, 10);

const startDate = args.start || fmt(defaultStart);
const endDate = args.end || fmt(today);
const rowLimit = Number(args.rowLimit) || (isDateOnly ? 25000 : 100);
const searchType = args.type || 'web';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const webmasters = google.webmasters({ version: 'v3', auth });

  const { data: sitesData } = await webmasters.sites.list();
  const site = (sitesData.siteEntry || []).find((s) => s.siteUrl.includes('ombreeluci.it'));
  if (!site) {
    console.error('Nessuna proprietà ombreeluci.it trovata per questo service account. Proprietà disponibili:');
    console.error((sitesData.siteEntry || []).map((s) => s.siteUrl).join('\n') || '(nessuna)');
    process.exit(1);
  }

  const requestBody = {
    startDate,
    endDate,
    dimensions,
    type: searchType,
    rowLimit,
  };

  if (args.contains) {
    requestBody.dimensionFilterGroups = [{
      filters: [{ dimension: 'page', operator: 'contains', expression: args.contains }],
    }];
  }

  console.log(`Sito: ${site.siteUrl}`);
  console.log(`Periodo: ${startDate} -> ${endDate} | dimensioni: ${dimensions.join(',')}${args.contains ? ` | page contains "${args.contains}"` : ''}\n`);

  const { data } = await webmasters.searchanalytics.query({
    siteUrl: site.siteUrl,
    requestBody,
  });

  const rows = (data.rows || []).map((row) => {
    const keys = Object.fromEntries(dimensions.map((d, i) => [d, row.keys[i]]));
    return {
      ...keys,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: `${(row.ctr * 100).toFixed(2)}%`,
      position: row.position != null ? row.position.toFixed(1) : 'n/a',
    };
  });

  if (rows.length === 0) {
    console.log('Nessun dato per questo periodo/filtro.');
    return;
  }

  console.table(rows);
  console.log(`\n${rows.length} righe`);
}

main().catch((err) => {
  console.error('Errore:', err.message);
  if (err.errors) console.error(JSON.stringify(err.errors, null, 2));
  process.exit(1);
});
