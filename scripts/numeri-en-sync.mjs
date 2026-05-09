#!/usr/bin/env node
/**
 * numeri-en-sync.mjs — Sincronizza articoli EN ai numeri rivista
 *
 * Per ogni articolo IT con numero_rivista, verifica che l'EN collegato
 * abbia lo stesso numero_rivista. Se no, lo aggiorna.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIRECTUS_URL = 'https://cms.ombreeluci.it';
const DIRECTUS_TOKEN = 'ebgg-l6cPyahbgUOloDgmUteOvOOw7NH';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const logPath = path.join(__dirname, 'logs', `numeri-en-sync-${timestamp}.csv`);

// Ensure logs directory exists
if (!fs.existsSync(path.join(__dirname, 'logs'))) {
  fs.mkdirSync(path.join(__dirname, 'logs'), { recursive: true });
}

const logLines = ['id_en,slug_en,numero_vecchio,numero_nuovo'];

async function fetchJSON(endpoint) {
  const res = await fetch(`${DIRECTUS_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` }
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

async function patchArticle(id, payload) {
  const res = await fetch(`${DIRECTUS_URL}/items/articoli/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`PATCH failed: ${res.status}`);
  return res.json();
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🔍 Recupero tutti gli articoli IT con numero_rivista...');

  // Get all IT articles with numero_rivista and articolo_traduzione
  const itArticles = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const data = await fetchJSON(
      `/items/articoli?filter[lang][_eq]=it&filter[numero_rivista][_nnull]=true&filter[articolo_traduzione][_nnull]=true&fields=id,slug,numero_rivista,articolo_traduzione&limit=${limit}&offset=${offset}`
    );
    if (!data.data || data.data.length === 0) break;
    itArticles.push(...data.data);
    offset += limit;
    if (data.data.length < limit) break;
  }

  console.log(`   Trovati ${itArticles.length} articoli IT con link EN e numero rivista`);

  // Get all EN articles to check their numero_rivista
  console.log('🔍 Recupero articoli EN collegati...');

  const enIds = itArticles.map(a => a.articolo_traduzione);
  const enArticlesMap = new Map();

  // Fetch EN articles in batches
  for (let i = 0; i < enIds.length; i += 100) {
    const batch = enIds.slice(i, i + 100);
    const data = await fetchJSON(
      `/items/articoli?filter[id][_in]=${batch.join(',')}&fields=id,slug,numero_rivista&limit=-1`
    );
    for (const en of data.data || []) {
      enArticlesMap.set(en.id, en);
    }
  }

  console.log(`   Recuperati ${enArticlesMap.size} articoli EN`);

  // Find misaligned
  const toFix = [];
  for (const it of itArticles) {
    const en = enArticlesMap.get(it.articolo_traduzione);
    if (!en) continue;

    if (en.numero_rivista !== it.numero_rivista) {
      toFix.push({
        id_en: en.id,
        slug_en: en.slug,
        numero_vecchio: en.numero_rivista,
        numero_nuovo: it.numero_rivista
      });
    }
  }

  console.log(`\n📊 Risultato audit:`);
  console.log(`   EN allineati: ${itArticles.length - toFix.length}`);
  console.log(`   EN da correggere: ${toFix.length}`);

  if (toFix.length === 0) {
    console.log('\n✅ Nessun articolo EN da correggere!');
    return;
  }

  console.log(`\n🔧 Correzione ${toFix.length} articoli EN...`);

  let fixed = 0;
  let errors = 0;

  for (let i = 0; i < toFix.length; i += 20) {
    const batch = toFix.slice(i, i + 20);

    for (const item of batch) {
      try {
        await patchArticle(item.id_en, { numero_rivista: item.numero_nuovo });
        logLines.push(`${item.id_en},${item.slug_en},${item.numero_vecchio || 'NULL'},${item.numero_nuovo}`);
        fixed++;
      } catch (err) {
        console.error(`   ❌ Errore ${item.slug_en}: ${err.message}`);
        errors++;
      }
    }

    process.stdout.write(`   Corretti: ${fixed}/${toFix.length}\r`);

    if (i + 20 < toFix.length) {
      await sleep(1000);
    }
  }

  console.log(`\n\n✅ Completato: ${fixed} corretti, ${errors} errori`);

  // Write log
  fs.writeFileSync(logPath, logLines.join('\n'), 'utf-8');
  console.log(`📁 Log salvato: ${logPath}`);
}

main().catch(err => {
  console.error('❌ Errore:', err);
  process.exit(1);
});
