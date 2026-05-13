/**
 * Esegui prima di fare git push: npm run predeploy
 * Verifica: versione Node, lock file, versioni esatte, TypeScript.
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

let failures = 0;
function pass(msg) { console.log('  ✓', msg); }
function fail(msg) { console.error('  ✗', msg); failures++; }

console.log('\n=== predeploy-check ===\n');

// 1 — Node version
const [major] = process.versions.node.split('.').map(Number);
if (major !== 20) {
  fail(`Node deve essere 20.x — hai ${process.versions.node}. Usa nvm use o cambia PATH.`);
} else {
  pass(`Node ${process.versions.node}`);
}

// 2 — package-lock.json presente
const lockPath = resolve(ROOT, 'package-lock.json');
if (!existsSync(lockPath)) {
  fail('package-lock.json mancante — esegui npm install e committalo');
} else {
  pass('package-lock.json presente');
}

// 3 — Nessuna versione floating (^/~) in package.json
const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
const floating = Object.entries(allDeps).filter(([, v]) => v.startsWith('^') || v.startsWith('~') || v === 'latest');
if (floating.length > 0) {
  fail(`Versioni floating trovate (rimuovi ^ e ~):\n     ${floating.map(([n, v]) => `${n}@${v}`).join('\n     ')}`);
} else {
  pass(`Tutte le ${Object.keys(allDeps).length} dipendenze hanno versione esatta`);
}

// 4 — engines field presente
if (!pkg.engines?.node) {
  fail('Campo "engines.node" mancante in package.json');
} else {
  pass(`engines.node: ${pkg.engines.node}`);
}

// 5 — TypeScript
console.log('\n  TypeScript check...');
try {
  execSync('npx tsc --noEmit', { cwd: ROOT, stdio: 'inherit' });
  pass('TypeScript OK');
} catch {
  fail('TypeScript ha trovato errori — vedi output sopra');
}

// Riepilogo
console.log('');
if (failures > 0) {
  console.error(`predeploy-check FALLITO (${failures} problema${failures > 1 ? 'i' : ''}) — NON fare push.\n`);
  process.exit(1);
} else {
  console.log('predeploy-check OK — sicuro fare push.\n');
}
