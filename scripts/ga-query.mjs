/**
 * ga-query.mjs
 *
 * Query Google Analytics 4 (Data API) per diagnosi traffico e comportamento.
 * Auth: service account JSON in .secrets/ (stessa di gsc-query.mjs).
 *
 * Uso:
 *   node scripts/ga-query.mjs
 *   node scripts/ga-query.mjs --start=2026-06-01 --end=2026-06-28
 *   node scripts/ga-query.mjs --by=pages --country=Italy
 *   node scripts/ga-query.mjs --by=sources
 *   node scripts/ga-query.mjs --by=events --country=Italy
 *   node scripts/ga-query.mjs --by=countries
 *
 * Parametri:
 *   --start     data inizio YYYY-MM-DD (default: 14 giorni fa)
 *   --end       data fine YYYY-MM-DD (default: ieri)
 *   --by        date (default), pages, sources, events, countries
 *   --country   filtra per paese (es. Italy, United States)
 *   --rowLimit  max righe (default: 25)
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KEY_FILE = process.env.GSC_KEY_FILE
  || path.join(__dirname, '..', '.secrets', 'ombreeluci-seo-1ede0e05d5b6.json');
const PROPERTY = 'properties/308368126';

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    return [key, value ?? true];
  })
);

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const defaultStart = new Date(today);
defaultStart.setDate(defaultStart.getDate() - 14);
const fmt = (d) => d.toISOString().slice(0, 10);

const startDate = args.start || fmt(defaultStart);
const endDate = args.end || fmt(yesterday);
const by = args.by || 'date';
const rowLimit = Number(args.rowLimit) || 25;
const country = args.country || null;

const client = new BetaAnalyticsDataClient({ keyFile: KEY_FILE });

function countryFilter() {
  if (!country) return undefined;
  return { filter: { fieldName: 'country', stringFilter: { value: country } } };
}

function header(label) {
  console.log(`\nGA4 — ombreeluci.it — ${label}`);
  console.log(`Periodo: ${startDate} → ${endDate}${country ? ` | Paese: ${country}` : ''}\n`);
}

async function byDate() {
  const [r] = await client.runReport({
    property: PROPERTY,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
      { name: 'screenPageViewsPerSession' },
    ],
    dimensionFilter: countryFilter(),
    orderBys: [{ dimension: { dimensionName: 'date' } }],
  });
  header('Giornaliero');
  console.table(r.rows.map(row => {
    const d = row.dimensionValues[0].value;
    const m = row.metricValues;
    return {
      data: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`,
      users: Number(m[0].value),
      sessioni: Number(m[1].value),
      pageViews: Number(m[2].value),
      'dur(s)': Number(m[3].value).toFixed(0),
      'bounce%': (Number(m[4].value) * 100).toFixed(1),
      'pv/sess': Number(m[5].value).toFixed(1),
    };
  }));

  const tot = (i) => r.rows.reduce((s, row) => s + Number(row.metricValues[i].value), 0);
  const n = r.rows.length;
  console.log(`\nTotali: ${tot(0)} users, ${tot(1)} sessioni, ${tot(2)} pageViews`);
  console.log(`Media/giorno: ${Math.round(tot(0) / n)} users, ${Math.round(tot(2) / n)} pv`);
}

async function byPages() {
  const [r] = await client.runReport({
    property: PROPERTY,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
    ],
    dimensionFilter: countryFilter(),
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: rowLimit,
  });
  header('Top pagine');
  console.table(r.rows.map(row => ({
    pagina: row.dimensionValues[0].value.substring(0, 65),
    users: Number(row.metricValues[0].value),
    pv: Number(row.metricValues[1].value),
    'dur(s)': Number(row.metricValues[2].value).toFixed(0),
  })));
}

async function bySources() {
  const [r] = await client.runReport({
    property: PROPERTY,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
    ],
    dimensionFilter: countryFilter(),
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: rowLimit,
  });
  header('Sorgenti traffico');
  console.table(r.rows.map(row => ({
    sorgente: `${row.dimensionValues[0].value} / ${row.dimensionValues[1].value}`,
    users: Number(row.metricValues[0].value),
    sessioni: Number(row.metricValues[1].value),
    pv: Number(row.metricValues[2].value),
    'dur(s)': Number(row.metricValues[3].value).toFixed(0),
  })));
}

async function byEvents() {
  const [r] = await client.runReport({
    property: PROPERTY,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
    dimensionFilter: countryFilter(),
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: rowLimit,
  });
  header('Eventi');
  console.table(r.rows.map(row => ({
    evento: row.dimensionValues[0].value,
    count: Number(row.metricValues[0].value),
    users: Number(row.metricValues[1].value),
  })));
}

async function byCountries() {
  const [r] = await client.runReport({
    property: PROPERTY,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'country' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: rowLimit,
  });
  header('Per paese');
  console.table(r.rows.map(row => ({
    paese: row.dimensionValues[0].value,
    users: Number(row.metricValues[0].value),
    sessioni: Number(row.metricValues[1].value),
    pv: Number(row.metricValues[2].value),
    'dur(s)': Number(row.metricValues[3].value).toFixed(0),
  })));
}

try {
  if (by === 'pages') await byPages();
  else if (by === 'sources') await bySources();
  else if (by === 'events') await byEvents();
  else if (by === 'countries') await byCountries();
  else await byDate();
} catch (err) {
  console.error('Errore:', err.message);
  process.exit(1);
}
