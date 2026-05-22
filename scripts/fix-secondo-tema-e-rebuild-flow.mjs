/**
 * fix-secondo-tema-e-rebuild-flow.mjs
 *
 * Fix 1 — categoria_menu_2: aggiunge allowNone:true al campo select-dropdown
 *   così la redazione può azzerare il secondo tema dopo averlo impostato.
 *
 * Fix 2 — contenuti_statici rebuild: verifica se esiste il Flow Directus
 *   che triggera il rebuild CF Pages su ogni modifica ai contenuti_statici.
 *   Se non esiste, lo crea.
 *
 * Prerequisiti:
 *   DIRECTUS_TOKEN  — token admin (obbligatorio)
 *   DIRECTUS_URL    — default https://cms.ombreeluci.it
 *   CF_DEPLOY_HOOK  — URL hook CF Pages (richiesto solo se il Flow non esiste)
 *
 * Uso:
 *   DIRECTUS_TOKEN=xxx node scripts/fix-secondo-tema-e-rebuild-flow.mjs
 *   DIRECTUS_TOKEN=xxx CF_DEPLOY_HOOK=https://... node scripts/fix-secondo-tema-e-rebuild-flow.mjs
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'https://cms.ombreeluci.it';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;
const CF_DEPLOY_HOOK = process.env.CF_DEPLOY_HOOK;

if (!DIRECTUS_TOKEN) {
  console.error('❌ DIRECTUS_TOKEN mancante. Eseguire con: DIRECTUS_TOKEN=xxx node scripts/fix-secondo-tema-e-rebuild-flow.mjs');
  process.exit(1);
}

async function api(method, path, body) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

// ─── FIX 1: categoria_menu_2 allowNone ───────────────────────────────────────

console.log('\n── Fix 1: categoria_menu_2 allowNone ─────────────────────────────────────');

const fieldRes = await api('GET', '/fields/articoli/categoria_menu_2');
const currentOptions = fieldRes.data?.meta?.options ?? {};
console.log('Opzioni attuali:', JSON.stringify(currentOptions));

if (currentOptions.allowNone === true) {
  console.log('✓ allowNone già impostato — nessuna modifica necessaria');
} else {
  await api('PATCH', '/fields/articoli/categoria_menu_2', {
    meta: {
      options: {
        ...currentOptions,
        allowNone: true,
      },
    },
  });
  console.log('✅ allowNone:true aggiunto — la redazione può ora cancellare il secondo tema');
}

// ─── FIX 2: Flow rebuild contenuti_statici ────────────────────────────────────

console.log('\n── Fix 2: Flow rebuild su modifica contenuti_statici ─────────────────────');

const flowsRes = await api('GET', '/flows?filter[name][_contains]=contenuti_statici&limit=10');
const existingFlows = flowsRes.data ?? [];

if (existingFlows.length > 0) {
  console.log(`✓ Flow già presente: "${existingFlows[0].name}" (id: ${existingFlows[0].id})`);
  console.log('  Verifica in Directus: Settings → Flows → controlla che sia "Active"');
} else {
  console.log('Flow non trovato — verrà creato.');

  if (!CF_DEPLOY_HOOK) {
    console.error('❌ CF_DEPLOY_HOOK mancante. Servira per creare il Flow.');
    console.error('   Trovalo in: Cloudflare Pages → ombreeluci-astro → Settings → Builds & Deployments → Deploy Hooks');
    console.error('   Poi riesegui con: DIRECTUS_TOKEN=xxx CF_DEPLOY_HOOK=https://... node scripts/fix-secondo-tema-e-rebuild-flow.mjs');
    process.exit(1);
  }

  const flow = await api('POST', '/flows', {
    name: 'Rebuild sito su aggiornamento contenuti_statici',
    icon: 'refresh',
    color: '#4F46E5',
    status: 'active',
    trigger: 'event',
    options: {
      type: 'filter',
      scope: ['items.create', 'items.update'],
      collections: ['contenuti_statici'],
    },
  });
  console.log(`✓ Flow creato: ${flow.data.id}`);

  const op = await api('POST', '/operations', {
    name: 'Trigger CF Pages rebuild',
    key: 'trigger_cf_rebuild',
    type: 'request',
    position_x: 19,
    position_y: 1,
    options: {
      url: CF_DEPLOY_HOOK,
      method: 'POST',
      body: '{}',
    },
    flow: flow.data.id,
    resolve: null,
    reject: null,
  });
  console.log(`✓ Operation creata: ${op.data.id}`);

  await api('PATCH', `/flows/${flow.data.id}`, { operation: op.data.id });
  console.log('✅ Flow pronto — ogni modifica a contenuti_statici triggera un rebuild automatico (~3 min)');
}

console.log('\n✅ Fatto.\n');
