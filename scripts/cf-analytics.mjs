/**
 * cf-analytics.mjs
 *
 * Query Cloudflare Analytics (GraphQL API) per diagnosi traffico.
 * Auth: token con permesso Zone > Analytics > Read (env CF_ANALYTICS_TOKEN).
 *
 * Uso:
 *   node scripts/cf-analytics.mjs
 *   node scripts/cf-analytics.mjs --start=2026-06-01 --end=2026-06-28
 *   node scripts/cf-analytics.mjs --by=country --start=2026-06-14
 *   node scripts/cf-analytics.mjs --by=path --start=2026-06-20 --rowLimit=30
 *
 * Parametri:
 *   --start       data inizio YYYY-MM-DD (default: 14 giorni fa)
 *   --end         data fine YYYY-MM-DD (default: ieri)
 *   --by          date (default), country, path
 *   --rowLimit    max righe per country/path (default: 20)
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    return [key, value ?? true];
  })
);

const envFile = readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
function envVal(key) {
  const m = envFile.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return m ? m[1].trim() : process.env[key];
}

const TOKEN = envVal('CF_ANALYTICS_TOKEN');
if (!TOKEN) {
  console.error('CF_ANALYTICS_TOKEN non trovato in .env');
  process.exit(1);
}

const ZONE_ID = '0cc4507d662828548b5f9f90e4b2d494';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const defaultStart = new Date(today);
defaultStart.setDate(defaultStart.getDate() - 14);
const fmt = (d) => d.toISOString().slice(0, 10);

const startDate = args.start || fmt(defaultStart);
const endDate = args.end || fmt(yesterday);
const by = args.by || 'date';
const rowLimit = Number(args.rowLimit) || 20;

async function query(gql) {
  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: gql }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    console.error('Errore CF GraphQL:', JSON.stringify(json.errors, null, 2));
    process.exit(1);
  }
  return json.data.viewer.zones[0];
}

function fmtNum(n) { return n.toLocaleString('it-IT'); }

async function byDate() {
  const days = Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000) + 1;
  const data = await query(`{
    viewer {
      zones(filter: {zoneTag: "${ZONE_ID}"}) {
        httpRequests1dGroups(limit: ${days}, filter: {date_geq: "${startDate}", date_leq: "${endDate}"}, orderBy: [date_ASC]) {
          dimensions { date }
          sum { requests pageViews cachedRequests bytes cachedBytes threats }
          uniq { uniques }
        }
      }
    }
  }`);

  const rows = data.httpRequests1dGroups;
  console.log(`Cloudflare Analytics — ombreeluci.it`);
  console.log(`Periodo: ${startDate} → ${endDate}\n`);

  console.table(rows.map(r => ({
    data: r.dimensions.date,
    uniques: fmtNum(r.uniq.uniques),
    pageViews: fmtNum(r.sum.pageViews),
    requests: fmtNum(r.sum.requests),
    cached: fmtNum(r.sum.cachedRequests),
    'cache%': (r.sum.requests ? (r.sum.cachedRequests / r.sum.requests * 100).toFixed(1) + '%' : '0%'),
  })));

  const totUniq = rows.reduce((s, r) => s + r.uniq.uniques, 0);
  const totPV = rows.reduce((s, r) => s + r.sum.pageViews, 0);
  const totReq = rows.reduce((s, r) => s + r.sum.requests, 0);
  const totCached = rows.reduce((s, r) => s + r.sum.cachedRequests, 0);
  const totBytes = rows.reduce((s, r) => s + r.sum.bytes, 0);
  const avgUniq = Math.round(totUniq / rows.length);

  console.log(`\nTotali: ${fmtNum(totUniq)} uniques, ${fmtNum(totPV)} pageViews, ${fmtNum(totReq)} requests`);
  console.log(`Media: ${fmtNum(avgUniq)} uniques/giorno, ${fmtNum(Math.round(totPV / rows.length))} pv/giorno`);
  console.log(`Cache: ${fmtNum(totCached)}/${fmtNum(totReq)} (${(totCached / totReq * 100).toFixed(2)}%)`);
  console.log(`Data served: ${(totBytes / 1e9).toFixed(2)} GB`);
}

async function byCountry() {
  const data = await query(`{
    viewer {
      zones(filter: {zoneTag: "${ZONE_ID}"}) {
        httpRequests1dGroups(limit: 1, filter: {date_geq: "${startDate}", date_leq: "${endDate}"}) {
          sum {
            countryMap { clientCountryName requests threats }
          }
        }
      }
    }
  }`);

  const countries = data.httpRequests1dGroups[0].sum.countryMap
    .sort((a, b) => b.requests - a.requests)
    .slice(0, rowLimit);

  console.log(`Cloudflare Analytics — ombreeluci.it — per Paese`);
  console.log(`Periodo: ${startDate} → ${endDate}\n`);
  console.table(countries.map(c => ({
    paese: c.clientCountryName,
    requests: fmtNum(c.requests),
    threats: c.threats,
  })));
}

async function byPath() {
  const data = await query(`{
    viewer {
      zones(filter: {zoneTag: "${ZONE_ID}"}) {
        httpRequestsAdaptiveGroups(limit: ${rowLimit}, filter: {date_geq: "${startDate}", date_leq: "${endDate}", requestSource: "eyeball", clientRequestHTTPMethodName_in: ["GET"]}, orderBy: [count_DESC]) {
          count
          dimensions { clientRequestPath }
        }
      }
    }
  }`);

  console.log(`Cloudflare Analytics — ombreeluci.it — Top pagine`);
  console.log(`Periodo: ${startDate} → ${endDate}\n`);
  console.table(data.httpRequestsAdaptiveGroups.map(r => ({
    path: r.dimensions.clientRequestPath,
    hits: fmtNum(r.count),
  })));
}

try {
  if (by === 'country') await byCountry();
  else if (by === 'path') await byPath();
  else await byDate();
} catch (err) {
  console.error('Errore:', err.message);
  process.exit(1);
}
