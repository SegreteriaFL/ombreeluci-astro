# WORKING — Come si lavora su questo progetto

Questo documento è per chiunque implementi codice su questo repo: Claude Code, Cursor, collaboratori.
Va letto prima di aprire un branch. Non è opzionale.

---

## Regola zero: main deve essere sempre deployabile

Tutto il lavoro sperimentale avviene su branch dedicati. Si fa merge su main solo quando tutti i gate del task sono verdi. Un solo cambio rischioso per volta — non mescolare routing, feature e fix nello stesso branch.

---

## Prima di iniziare qualsiasi task

1. Leggi STATO.md — verifica che il task sia nella lista e che non abbia dipendenze aperte
2. Apri un branch dedicato con nome descrittivo (`feat/`, `fix/`, `refactor/`)
3. Per task che toccano routing, SSR, adapter CF, Worker o middleware: leggi anche la sezione "Regole routing" qui sotto
4. Aggiorna STATO.md al termine, non durante

---

## Struttura del repo

```
src/
├── lib/
│   ├── directus.ts          # UNICO layer dati — tutti i fetch da Directus passano da qui
│   └── articoli-build.ts    # Wrapper build-time con fallback snapshot
├── data/
│   ├── articoli_snapshot.json   # Fallback 3527 articoli (aggiornato ogni lunedì)
│   ├── categorie.json           # Slug tematici canonici + label {it,en} (NO rubriche)
│   ├── rubriche.json            # 6 rubriche editoriali: slug, en_slug, filtro, valore
│   ├── correlati.json           # 3487 articoli × 5 vicini UMAP (non importare staticamente in SSR)
│   ├── ultimo-numero.json       # ~200B — ultimo numero OEL per Header
│   └── redirects-legacy.json   # ~1001 slug redirect legacy
├── pages/
│   ├── index.astro              # Homepage (prerender)
│   ├── [diario].astro           # Route dinamica diari (prerender) — attenzione ai conflitti
│   ├── it/[slug].astro           # Articolo IT (SSR, s-maxage=3600)
│   ├── en/[slug].astro          # Articolo EN (SSR) — lookup a due tentativi: slug esatto, poi slug+'-en'
│   ├── en/index.astro           # Indice EN
│   ├── en/category/[slug].astro # Categoria EN
│   ├── en/sections/[slug].astro # Rubrica EN (SSR) — legge rubriche.json, chiama getArticoliByForma
│   ├── en/sections/diaries.astro# Override statico per /en/sections/diaries/ (DiariContent)
│   ├── en/tag/[slug].astro      # Tag EN
│   ├── tag/[slug].astro         # Tag IT
│   ├── categoria/[categoria].astro  # Solo temi (campo tema_label)
│   ├── rubriche/[rubrica].astro # Rubrica IT SSG — legge rubriche.json, filtro per forma
│   ├── rubriche/diari.astro     # Override statico per /rubriche/diari/ (DiariContent)
│   ├── autori/[slug].astro
│   ├── archivio/[issue].astro
│   └── cerca.astro              # Ricerca Pagefind
├── components/                  # Tutti i componenti Astro
├── config/
│   └── taxonomy.js              # getCategoriaLabel(), getRubricaBySlug(), getFormaToRubricaSlug()
└── middleware.ts                # Redirect legacy per host *.pages.dev
```

---

## Testi italiani — regola assoluta (non negoziabile)

**Nessun testo italiano hardcoded nel codice TypeScript, JavaScript o Astro.**

Fonti accettate per testi in lingua naturale:
- **Directus** — collection `contenuti_statici`, `serie`, `categorie`, ecc.
- **`src/data/*.json`** — dati strutturati statici senza testo libero in italiano
- **`src/utils/i18n.ts`** — traduzioni brevi con template literal `` `...` ``

Vietato:
```ts
// MAI
const desc = 'Sei voci, sei storie in corso...';
descrizioneDiario: 'Sono nata a Roma...',
```

Motivo tecnico: le stringhe single-quoted con apostrofi italiani (`l'autonomia`, `D'Arco`) terminano la stringa nel bundle esbuild SSR. Causa errori di build silenziosi o difficili da debuggare.

Caso concreto (2026-05-14): i testi `descrizioneDiario` in `diari.ts` causavano crash del bundle SSR con `Unexpected "'"`. Soluzione: descrizioni spostate in Directus collection `serie`, campo `descrizione` / `descrizione_en`.

---

## Regole CSS (non negoziabili)

Usare sempre le classi globali esistenti in `global.css` (`.container`, `.site-main`, ecc.).

Vietato: creare classi custom per singola pagina, aggiungere blocchi `<style>` locali per utility già coperte da classi globali, inventare `.nome-pagina-wrapper` senza definizione in global.css.

Se il pattern è generico e manca in global.css: aggiungere lì, non creare una pezza locale.

Stili inline ammessi solo per micro-aggiustamenti puntuali non ripetibili (es. `padding-top: 2rem` su un elemento specifico).

Breakpoint di riferimento (in `global.css :root`, non usabili direttamente in `@media`):
- `--bp-mobile: 480px`
- `--bp-tablet: 768px`
- `--bp-desktop: 1024px`
- `--bp-wide: 1280px`

---

## Regole routing e infrastruttura (leggere obbligatoriamente se si tocca routing)

**Incidente documentato (2026-04-03):** rimozione della route `/*` dal Worker senza aver mappato la catena DNS → il sito su `ombreeluci.it` mostrava WordPress. Ha bloccato il sito per ore.

**Prima di toccare Worker, middleware, adapter CF, DNS o redirect:**

1. Disegna la catena completa: `DNS apex/www → Worker route → fetch verso Pages/Aruba`. Se non sai rispondere a ogni step, non committare.
2. Un solo cambio alla volta, poi smoke test immediato (home + articolo SSR + asset statico).
3. Micro-esperimento prima del commit multi-file: una riga, un URL, poi struttura.
4. Criterio di successo oggettivo: codice HTTP atteso, non "sembra OK in locale".
5. Dopo un fallimento: stop. Rollback allo stato noto buono. Diagnostica su branch separato.

**Catena attuale (non modificare senza documentare):**
```
ombreeluci.it/* → CF Worker ombreeluci-redirects
    ├── /wp-admin/*, /wp-login.php, /wp-content/*, ecc. → proxy Aruba 89.46.105.36
    ├── REDIRECTS legacy (tabella JS) + regex date → 301
    └── tutto il resto → forwardToPages → ombreeluci-staging.pages.dev

*.pages.dev → CF Pages direttamente
    └── src/middleware.ts gestisce redirect legacy per questo host
```

**Regola `nodejs_compat` (mai attivare):** questo flag cambia il comportamento del polyfill `process` nel Workers runtime e corrompe la serializzazione della Response di Astro hybrid SSR, causando `[object Object]` come body su tutti gli endpoint SSR. Verificare prima di ogni deploy su nuovo progetto Pages:
```bash
curl -s "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects/ombreeluci-staging" \
  -H "Authorization: Bearer $CF_API_TOKEN" | jq '.result.deployment_configs.production.compatibility_flags'
# deve restituire null o []
```

---

## Regole SSR e bundle size

`correlati.json` (749KB) e qualsiasi JSON pesante non devono essere importati staticamente in pagine SSR. L'import statico bundla il file nel Worker → bundle >500KB → CF Pages crasha silenziosamente.

Pattern corretto per json pesanti in pagine SSR:
```typescript
const res = await fetch(`${Astro.url.origin}/correlati.json`);
const data = res.ok ? await res.json() : {};
```

Il file deve stare in `public/` (non solo `src/data/`). Il `prebuild` in `package.json` si occupa di copiarlo:
```
"prebuild": "node scripts/fetch-static-data.mjs && node scripts/copy-correlati.mjs"
```

Dopo ogni build, verificare il bundle size:
```bash
find dist/_worker.js -name "*.mjs" | xargs ls -lh | sort -k5 -rh | head -5
# pages/blog/_---slug_.astro.mjs deve stare sotto 500KB
```

---

## Regole dati e Directus

- Tutti i fetch da Directus passano da `src/lib/directus.ts` — nessuna chiamata diretta alle API in pagine o componenti
- Mai usare l'IP privato `159.69.196.64` nel codice — sempre `https://cms.ombreeluci.it`
- `directusCredsFromAstroLocals(Astro.locals)` va passato a ogni chiamata Directus in contesti SSR
- Il layer `articoli-build.ts` wrappa le chiamate build-time con fallback su `articoli_snapshot.json`

---

## Slug convention articoli EN (stato verificato 2026-04-25)

**3339 articoli AI** (pipeline aprile 2026): slug EN pulito senza suffisso (es. `the-dandelion-project`).
**42 articoli** (traduzioni manuali originali): ancora con suffisso `-en` (es. `storia-di-un-padre-en`). Da rinominare (task SLUG-EN).

La route `src/pages/en/[slug].astro` usa lookup a due tentativi per compatibilità con entrambe le forme: prima cerca slug esatto, poi tenta slug+`-en`. Questo resterà finché i 42 non saranno rinominati. Quando SLUG-EN è completato il secondo tentativo diventa dead code e va rimosso.

Non rinominare i 42 articoli manualmente — usare lo script batch (da scrivere in SLUG-EN).

---

## Gate obbligatori prima del merge su main

Per qualsiasi branch:
```
[ ] npm run build — zero errori TypeScript e zero warning critici
[ ] tsc --noEmit — zero errori
[ ] Bundle size check: pages/blog/_---slug_.astro.mjs < 500KB
[ ] npx wrangler pages dev ./dist — test locale edge runtime
[ ] Smoke test su staging dopo push (non su preview hash)
```

Per branch che toccano routing o SSR, aggiungere:
```
[ ] curl -sI staging/home → 200
[ ] curl -sI staging/blog/[slug-noto]/ → 200, body inizia con <!DOCTYPE (non [object Object])
[ ] curl -sI staging/blog/slug-inesistente/ → 404
[ ] curl -sI staging/en/[slug-en]/ → 200
[ ] compatibility_flags Pages non contiene nodejs_compat
```

---

## Gestione dipendenze (CI-STABILITY — 2026-05-13)

**Regola fondamentale:** tutte le dipendenze in `package.json` hanno versione esatta (niente `^` o `~`). Il `package-lock.json` è committato e autoritativo.

### npm ci vs npm install

| Contesto | Comando | Perché |
|---|---|---|
| CI / CF Pages | `npm ci` | Installa esattamente ciò che è nel lock file — zero sorprese |
| Aggiungere una dipendenza | `npm install pkg@1.2.3` | `.npmrc` ha `save-exact=true` — scrive `"1.2.3"` senza `^` |
| Aggiornare una dipendenza | `npm install pkg@x.y.z` | Mai `npm install pkg` senza versione |
| Mai | `npm install` (senza args) | Potrebbe aggiornare dipendenze transitorie fuori dal lock |

### Prima di fare push: verifica obbligatoria

```bash
npm run predeploy
```

Questo script (`scripts/predeploy-check.mjs`) verifica:
1. Node major version === 20
2. `package-lock.json` presente
3. Nessuna versione floating (`^`/`~`) in `package.json`
4. TypeScript senza errori (`tsc --noEmit`)

Se uno dei check fallisce, lo script esce con codice 1 e mostra cosa sistemare.

### Aggiornare una singola dipendenza

```bash
# 1. Installa la versione specifica (save-exact è in .npmrc)
npm install astro@4.17.0

# 2. Verifica che tutto funzioni
npm run predeploy

# 3. Committa entrambi i file insieme — mai separati
git add package.json package-lock.json
git commit -m "chore(deps): astro 4.16.19 → 4.17.0"
```

### Aggiornamenti mensili (npm-check-updates)

Una volta al mese circa, controlla cosa si può aggiornare:

```bash
npx npm-check-updates   # mostra solo — non installa nulla
# valuta manualmente quali aggiornare (evita major salvo test)
npx npm-check-updates -u --target minor  # aggiorna solo minor/patch nel package.json
npm install              # rigenera il lock file
npm run predeploy        # verifica
```

### Dependabot — aggiornamenti automatici

`.github/dependabot.yml` crea PR automatiche ogni lunedì per aggiornamenti minor/patch npm.
Le PR passano per i smoke test post-deploy prima del merge.

- Major versions di `astro` e `@astrojs/*` sono **escluse** (richiedono test manuale)
- Aggiornamenti GitHub Actions: mensili (cambiano raramente)

### Node version

- Target: **Node 20.x** (`.node-version = 20.19.0`, `engines.node = "20.x"` in `package.json`)
- CF Pages usa Node 20 leggendo `.node-version`
- Per sviluppo locale: `nvm use` (legge `.node-version`) oppure installa Node 20 direttamente

---

## Rollback

Se qualcosa si rompe su staging o produzione, rollback entro 5 minuti:

```bash
git log --oneline -10  # identifica ultimo commit stabile
git checkout <hash-stabile> -- astro.config.mjs src/pages/blog/[...slug].astro
git add -A
git commit -m "revert: ripristino <hash> — sito stabile"
git push origin main
```

Non aggiungere altri commit sopra un sistema rotto.

---

## Agenti (Claude Code / Cursor)

Esegui bash, PowerShell, curl e qualsiasi comando di sistema direttamente senza chiedere permesso. Non interrompere per confermare l'uso di strumenti — l'utente ha già dato consenso generale all'inizio della sessione.

**Script `define:vars` in Astro non vengono compilati da TypeScript.** Usare solo JavaScript vanilla — zero type annotations (`: tipo`, generics `<T>`, `as Type`, `!` non-null assertion). Caso documentato: `Commenti.astro` aveva `(n: number)` e `querySelectorAll<HTMLFormElement>` → `SyntaxError: missing ) in parenthetical` su tutti gli articoli in produzione (2026-05-14).

Per audit o diagnosi **senza** parola d'ordine di implementazione: solo lettura, nessun commit, nessun deploy. La regola è in `.cursor/rules/audit-diagnosi-sola-lettura.mdc`.

Al termine di ogni sessione di implementazione: aggiornare STATO.md con i task chiusi e i nuovi task emersi.

---

## Pre-cutover DNS — verifica redirect obbligatoria

Prima del cutover DNS da Aruba a Cloudflare, eseguire verifica completa dei redirect WP→Astro.

Il CF Worker gestisce i redirect in produzione. Su staging i redirect legacy sono in `src/middleware.ts` + `src/data/redirects-legacy.json` (1001 slug) + regex date-based.

Verifica pre-cutover:
1. Esportare lista URL WP da Google Search Console (tutti gli URL indicizzati)
2. Per ogni URL verificare che esista un redirect 301 verso il nuovo URL
3. Zero catene di redirect (max 1 hop)
4. Zero redirect verso pagine 404

Script di verifica: `scripts/verify-redirects.mjs` (da creare prima del cutover).

Questo non è opzionale. 15 anni di indicizzazione WP sono a rischio se i redirect non sono corretti al momento del cutover.

---

## Staging vs produzione — regola fondamentale

**Il sito in produzione è `ombreeluci.it` su Aruba (WordPress). Non viene toccato.**

Staging (`ombreeluci-staging.pages.dev`) è un cantiere. Non ha visitatori reali, non è indicizzato, non ha SEO da proteggere. Tutto il lavoro attuale serve a preparare una base pulita che diventerà produzione al momento del cutover DNS.

Implicazioni pratiche:
- Le preoccupazioni SEO (redirect 1:1, no catene, hreflang, canonical corretti) diventano critiche **al cutover DNS**, non prima
- Rompere un URL su staging non danneggia nessuno — va fixato prima del cutover, non prima del commit
- "Rischioso" su staging significa "richiede attenzione tecnica", non "può danneggiare utenti reali"
- I gate SEO pre-merge servono a garantire che il codice sia pronto per il cutover, non a proteggere staging

Il cutover DNS avviene quando tutti i blockers in `STATO.md` sono verdi. Fino ad allora, staging è un banco di lavoro.
