/**
 * fix-utf8-contenuti-statici.mjs
 *
 * Individua e corregge caratteri UTF-8 corrotti nei record `contenuti_statici` di Directus.
 * Tipicamente causati da encoding doppio (latin1 interpretato come UTF-8).
 * Esempi: "fragilit?" invece di "fragilità", "Ã " invece di "à".
 *
 * Prerequisiti:
 *   DIRECTUS_URL   — URL del CMS (es. https://cms.ombreeluci.it)
 *   DIRECTUS_TOKEN — token admin Directus
 *
 * Uso:
 *   DIRECTUS_TOKEN=xxx node scripts/fix-utf8-contenuti-statici.mjs
 *   DIRECTUS_TOKEN=xxx node scripts/fix-utf8-contenuti-statici.mjs --dry-run
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'https://cms.ombreeluci.it';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;
const DRY_RUN = process.argv.includes('--dry-run');

if (!DIRECTUS_TOKEN) {
  console.error('❌ DIRECTUS_TOKEN mancante');
  process.exit(1);
}

// Sequenze Mojibake più comuni (UTF-8 doppio-codificato o latin1→UTF-8)
const MOJIBAKE = [
  ["Ã ", "à"], ["Ã ", "À"], ["Ã¨", "è"], ["Ã©", "é"],
  ["Ã¬", "ì"], ["Ã­", "í"], ["Ã²", "ò"], ["Ã³", "ó"],
  ["Ã¹", "ù"], ["Ãº", "ú"], ["Ã¼", "ü"], ["Ã¶", "ö"],
  ["Ã¤", "ä"], ["Ã§", "ç"], ["Ã±", "ñ"], ["Ã ", "â"],
  ["Ã®", "î"], ["Ã´", "ô"], ["Ã»", "û"], ["Ã¢", "â"],
  // ? finale per carattere accentato troncato
];

// Pattern più semplice: cerca '?' dove ci si aspetta una lettera accentata
const BROKEN_PATTERN = /[a-z]tà|[a-z]tè|[a-z]tì|[a-z]tò|[a-z]tù|fragilit\?|qualit\?|possibilit\?|identit\?|dignit\?|capacit\?|realt\?|libert\?|umilt\?|sanit\?|autorit\?|facolt\?|necessit\?|volont\?|attivit\?|societ\?|unit\?|opportunit\?|validit\?|creativit\?|continuit\?|comunità|spiritualit\?/i;

function fixMojibake(str) {
  if (!str || typeof str !== 'string') return str;
  let out = str;
  for (const [from, to] of MOJIBAKE) {
    out = out.replaceAll(from, to);
  }
  // Fix ? al posto di à/è/ì/ò/ù in parole comuni italiane
  out = out
    .replace(/(\w+)tà\?/g, '$1tà')  // heuristic: "fragilità?" → nope, wrong pattern
    .replace(/fragilit\?/g, 'fragilità')
    .replace(/qualit\?/g, 'qualità')
    .replace(/possibilit\?/g, 'possibilità')
    .replace(/identit\?/g, 'identità')
    .replace(/dignit\?/g, 'dignità')
    .replace(/capacit\?/g, 'capacità')
    .replace(/realt\?/g, 'realtà')
    .replace(/libert\?/g, 'libertà')
    .replace(/umilt\?/g, 'umiltà')
    .replace(/sanit\?/g, 'sanità')
    .replace(/autorit\?/g, 'autorità')
    .replace(/facolt\?/g, 'facoltà')
    .replace(/necessit\?/g, 'necessità')
    .replace(/volont\?/g, 'volontà')
    .replace(/attivit\?/g, 'attività')
    .replace(/societ\?/g, 'società')
    .replace(/unit\?/g, 'unità')
    .replace(/opportunit\?/g, 'opportunità')
    .replace(/validit\?/g, 'validità')
    .replace(/creativit\?/g, 'creatività')
    .replace(/continuit\?/g, 'continuità')
    .replace(/spiritualit\?/g, 'spiritualità')
    .replace(/fraternit\?/g, 'fraternità')
    .replace(/prossimit\?/g, 'prossimità')
    .replace(/solidariet\?/g, 'solidarietà')
    .replace(/umanit\?/g, 'umanità')
    .replace(/disabilit\?/g, 'disabilità')
    .replace(/diversit\?/g, 'diversità')
    .replace(/fidelit\?/g, 'fedeltà')
    .replace(/fedelt\?/g, 'fedeltà')
    .replace(/serenitàt\?/g, 'serenità')
    .replace(/serenitàit\?/g, 'serenità');
  return out;
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json',
      ...(opts.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${opts.method ?? 'GET'} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

console.log('Lettura contenuti_statici...');
const data = await apiFetch('/items/contenuti_statici?limit=-1&fields=id,chiave,valore_it,valore_en');
const records = data.data ?? [];

let fixes = 0;
const toFix = [];

for (const rec of records) {
  const newIt = fixMojibake(rec.valore_it);
  const newEn = fixMojibake(rec.valore_en);
  if (newIt !== rec.valore_it || newEn !== rec.valore_en) {
    toFix.push({
      id: rec.id,
      chiave: rec.chiave,
      old_it: rec.valore_it,
      new_it: newIt,
      old_en: rec.valore_en,
      new_en: newEn,
    });
  }
}

console.log(`\nRecord con testo corrotto: ${toFix.length}`);
if (toFix.length > 0) {
  for (const f of toFix) {
    console.log(`  [${f.chiave}]`);
    if (f.old_it !== f.new_it) console.log(`    IT: "${f.old_it}" → "${f.new_it}"`);
    if (f.old_en !== f.new_en) console.log(`    EN: "${f.old_en}" → "${f.new_en}"`);
  }
}

if (DRY_RUN || toFix.length === 0) {
  if (toFix.length === 0) console.log('✅ Nessuna correzione necessaria.');
  else console.log('\n--- DRY RUN: nessuna modifica applicata ---');
  process.exit(0);
}

for (const f of toFix) {
  const patch = {};
  if (f.old_it !== f.new_it) patch.valore_it = f.new_it;
  if (f.old_en !== f.new_en) patch.valore_en = f.new_en;
  await apiFetch(`/items/contenuti_statici/${f.id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  fixes++;
  console.log(`✓ Corretto: ${f.chiave}`);
}

console.log(`\n✅ ${fixes} record corretti. Lancia un rebuild per aggiornare il sito.`);
