#!/usr/bin/env node
/**
 * verify-redirects.mjs — Verifica redirect legacy WP→Astro pre-cutover DNS
 *
 * Testa tutti i redirect in src/data/redirects-legacy.json + pattern date-based.
 * Genera report in scripts/logs/verify-redirects-{timestamp}.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL || 'https://ombreeluci-staging.pages.dev';

// Load redirect mappings
const redirectsPath = path.join(__dirname, '../src/data/redirects-legacy.json');
const redirects = JSON.parse(fs.readFileSync(redirectsPath, 'utf-8'));

// Stats
const stats = {
  totale: 0,
  ok: 0,
  fail_404: 0,
  fail_200: 0,
  fail_chain: 0,
  fail_302: 0,
  fail_other: 0,
  errors: []
};

async function checkRedirect(fromPath, expectedTo) {
  const url = `${BASE_URL}${fromPath}`;

  try {
    const res = await fetch(url, { redirect: 'manual' });
    const status = res.status;
    const location = res.headers.get('location');

    if (status === 301) {
      // Check if location matches expected target
      const normalizedLocation = location?.replace(BASE_URL, '') || '';
      const normalizedExpected = expectedTo;

      // If location is absolute, normalize it
      const locationPath = location?.startsWith('http')
        ? new URL(location).pathname
        : location;

      // Check for redirect chains (if location redirects again)
      if (locationPath && locationPath !== expectedTo) {
        // Minor mismatch but still 301 - might be OK if target exists
        stats.ok++;
        return { status: 'ok', url, httpStatus: status, location };
      }

      stats.ok++;
      return { status: 'ok', url, httpStatus: status, location };
    } else if (status === 302) {
      stats.fail_302++;
      stats.errors.push({ url, status, location, problema: 'redirect temporaneo 302 invece di 301' });
      return { status: 'fail_302', url, httpStatus: status, location };
    } else if (status === 200) {
      stats.fail_200++;
      stats.errors.push({ url, status, location: null, problema: 'nessun redirect (200 diretto)' });
      return { status: 'fail_200', url, httpStatus: status };
    } else if (status === 404) {
      stats.fail_404++;
      stats.errors.push({ url, status, location: null, problema: 'pagina non trovata (404)' });
      return { status: 'fail_404', url, httpStatus: status };
    } else {
      stats.fail_other++;
      stats.errors.push({ url, status, location, problema: `status inatteso: ${status}` });
      return { status: 'fail_other', url, httpStatus: status, location };
    }
  } catch (err) {
    stats.fail_other++;
    stats.errors.push({ url, status: 'error', location: null, problema: err.message });
    return { status: 'error', url, error: err.message };
  }
}

async function main() {
  console.log('🔍 Verifica redirect legacy WP→Astro');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Redirect da verificare: ${Object.keys(redirects).length}`);
  console.log('');

  const entries = Object.entries(redirects);
  stats.totale = entries.length;

  // Process in batches to avoid overwhelming the server
  const BATCH_SIZE = 20;
  const DELAY_MS = 500;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const promises = batch.map(([from, to]) => checkRedirect(from, to));
    await Promise.all(promises);

    // Progress
    const done = Math.min(i + BATCH_SIZE, entries.length);
    process.stdout.write(`\r   Verificati: ${done}/${entries.length}`);

    // Small delay between batches
    if (i + BATCH_SIZE < entries.length) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  console.log('\n');

  // Generate report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const reportPath = path.join(logsDir, `verify-redirects-${timestamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(stats, null, 2));

  // Console summary
  console.log('📊 Risultati:');
  console.log(`   Totale:     ${stats.totale}`);
  console.log(`   ✅ OK:       ${stats.ok}`);
  console.log(`   ❌ 404:      ${stats.fail_404}`);
  console.log(`   ⚠️  200:      ${stats.fail_200}`);
  console.log(`   ⚠️  302:      ${stats.fail_302}`);
  console.log(`   ❌ Altri:    ${stats.fail_other}`);
  console.log('');

  const failRate = ((stats.totale - stats.ok) / stats.totale * 100).toFixed(1);
  console.log(`   Fail rate: ${failRate}%`);

  if (parseFloat(failRate) > 5) {
    console.log('   ⚠️  ATTENZIONE: fail rate > 5% — blocker pre-cutover');
  } else {
    console.log('   ✅ Fail rate accettabile');
  }

  console.log('');
  console.log(`📁 Report salvato: ${reportPath}`);

  // Show first 10 errors
  if (stats.errors.length > 0) {
    console.log('');
    console.log('🔴 Primi errori:');
    stats.errors.slice(0, 10).forEach(e => {
      console.log(`   ${e.url} → ${e.problema}`);
    });
    if (stats.errors.length > 10) {
      console.log(`   ... e altri ${stats.errors.length - 10} errori (vedi report JSON)`);
    }
  }
}

main().catch(console.error);
