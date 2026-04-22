# ARCH-04 Playbook — SSR Hybrid + Edge Cache Invalidation

> Documento operativo permanente. Va letto **prima** di aprire il branch.
> Contesto e storia completa: vedi `PROGRESS.md` → sezione ARCH-04.

---

## Perché esiste questo documento

ARCH-04 è stato tentato tre volte e ha rotto il sito in produzione ogni volta.
Le cause sono sempre state le stesse:

1. Commit su `main` senza verifiche locali complete
2. Accumulo di fix sopra un sistema già rotto invece di fermarsi
3. Mancanza di un gate sul bundle size prima del deploy
4. Più agenti/strumenti che operano senza un "definition of done" condiviso

Questo documento definisce il metodo corretto. Non si deroga.

---

## Regola zero

> **`main` deve essere sempre deployabile.**
> Tutto il lavoro sperimentale avviene su `feat/arch-04-ssr`.
> Si fa merge su `main` solo quando tutti i gate qui sotto sono verdi.
> **Una sola modifica rischiosa per volta** — hybrid, cache, redirect worker, env, refactor correlati
> non nello stesso merge. Se esplode, il rollback è possibile.

---

## Sicurezza — secrets fuori dal repo

**Mai committare valori reali** di token, zone ID o secret in nessun file del repo,
inclusi markdown "di esempio". Usare solo placeholder.

`.dev.vars` (non committato, in `.gitignore`):
```
DIRECTUS_URL=https://cms.ombreeluci.it
DIRECTUS_TOKEN=your_directus_token
REVALIDATE_SECRET=your_revalidate_secret
CF_ZONE_ID=your_cf_zone_id
CF_PURGE_TOKEN=your_cf_purge_token
REVALIDATE_DRY_RUN=true
```

Valori reali: `PROGRESS.md` → sezione "CF Pages env vars" (mai in questo file).

---

## Fase 1 — Setup branch e ambiente locale

```bash
git checkout main
git pull origin main
git checkout -b feat/arch-04-ssr
```

Verificare:
- `.dev.vars` presente nella root con i valori reali
- `.gitignore` contiene `.dev.vars`

**Gate 1 ✓/✗:** branch creato, `.dev.vars` presente, non committato.

---

## Fase 2 — Modifiche codice (una alla volta, nell'ordine)

### 2.1 — astro.config.mjs

Aggiungere `output: 'hybrid'` + `adapter: cloudflare()`. Nient'altro in questo commit.

### 2.2 — blog/[...slug].astro

Sostituire `getStaticPaths` con SSR on-demand. Unico file, unico commit.

### 2.3 — correlati.json: fetch runtime, non import statico

`correlati.json` pesa 749KB. Se importato staticamente viene bundlato nel worker SSR
→ bundle ~908KB → CF Pages crasha silenziosamente restituendo `[object Object]`.

❌ Non fare:
```typescript
import correlatiMap from '../../data/correlati.json';
```

✓ Fare:
```typescript
const correlatiRes = await fetch(`${Astro.url.origin}/correlati.json`);
const correlatiMap: Record<string, string[]> = correlatiRes.ok
  ? await correlatiRes.json()
  : {};
```

**Sorgente unica:** `src/data/correlati.json` è la sorgente. Aggiungere a `package.json`:
```json
"prebuild": "cp src/data/correlati.json public/correlati.json"
```
Così `public/correlati.json` è sempre aggiornato senza drift.

### 2.4 — Altre regole codice

- `return new Response('Not found', { status: 404 })` — mai body `null` (CF adapter v11 crasha)
- Tutti i fetch Directus in try-catch con fallback esplicito
- `directusCredsFromAstroLocals(Astro.locals)` passato a ogni chiamata Directus
- Nessun IP privato (`159.69.196.64`) nel codice — sempre `https://cms.ombreeluci.it`

**Gate 2 ✓/✗:** ogni modifica è un commit separato, build locale verde dopo ognuno.

---

## Fase 3 — Gate build e bundle size (obbligatorio prima di ogni push)

### 3a. Build

```bash
npm run build
```

Deve completare senza errori TypeScript e senza warning critici.

### 3b. Bundle size check ← GATE PIÙ IMPORTANTE

Il path può cambiare tra versioni di Astro/adapter — verificare dopo ogni build:

```bash
find dist/_worker.js -name "*.mjs" | xargs ls -lh | sort -k5 -rh | head -10
```

Il file `pages/blog/_---slug_.astro.mjs` deve stare **sotto 500KB**.

| Scenario | Dimensione | Esito |
|----------|-----------|-------|
| `correlati.json` bundlato | ~908KB | ❌ non pushare |
| Fetch runtime (corretto) | ~109KB | ✓ ok |

Se supera 500KB: **stop**, trovare il file JSON pesante incluso staticamente, non pushare.

**Gate 3 ✓/✗:** bundle <500KB confermato.

---

## Fase 4 — Test con edge runtime locale

```bash
npx wrangler pages dev ./dist --compatibility-date=2024-01-01
```

In un secondo terminale eseguire **tutti e quattro** i test. Non procedere se uno fallisce.

---

**Test A — Articolo noto: 200 + HTML valido + Cache-Control**

Usare 2-3 slug diversi, non sempre lo stesso (cattura edge case Directus/encoding):
```bash
curl -i http://localhost:8788/blog/ombre-e-luci/
curl -i http://localhost:8788/blog/lesperienza-della-solitudine/
curl -i http://localhost:8788/blog/storie-ai-margini-dal-festival-di-rotterdam/
```
Atteso:
- `HTTP/1.1 200`
- Header `Cache-Control: s-maxage=86400,...`
- Body inizia con `<!DOCTYPE html` — **non** con `[object Object]` o `{` JSON

```bash
# Check anti-[object Object]:
curl -s http://localhost:8788/blog/ombre-e-luci/ | head -c 20
# Deve stampare: <!DOCTYPE html...
```

---

**Test B — Slug inesistente: 404 pulito**
```bash
curl -o /dev/null -w "%{http_code}\n" http://localhost:8788/blog/slug-che-non-esiste-xyz/
```
Atteso: `404`. Body deve essere la pagina 404 dell'app, non stack trace.

---

**Test C — Revalidate endpoint (dry-run, nessuna purge reale)**

Su **bash/macOS/Linux**:
```bash
curl -i -X POST http://localhost:8788/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"slug":"ombre-e-luci","secret":"IL_SECRET_DA_DEV_VARS"}'
```

Su **Windows/PowerShell** (il quoting inline è inaffidabile — usare file):
```powershell
'{"slug":"ombre-e-luci","secret":"IL_SECRET"}' | Out-File -Encoding utf8 $env:TEMP\oel.json
curl.exe -i -X POST http://localhost:8788/api/revalidate `
  -H "Content-Type: application/json" `
  --data-binary "@$env:TEMP\oel.json"
```

Atteso: `HTTP/1.1 200`, body `{"ok":true,"dryRun":true,"purged":"..."}`.

---

**Test D — Homepage + pagine statiche chiave**
```bash
curl -o /dev/null -w "%{http_code}\n" http://localhost:8788/
curl -o /dev/null -w "%{http_code}\n" http://localhost:8788/archivio/
curl -o /dev/null -w "%{http_code}\n" http://localhost:8788/categoria/fede-e-luce/
```
Attesi: `200`, `200`, `200`.

---

**Gate 4 ✓/✗:** tutti i test A/B/C/D verdi, nessun `[object Object]` nel body.

---

## Fase 5 — Push su branch

Solo dopo Gate 1 + Gate 3 (bundle <500KB) + Gate 4 (tutti i test verdi):

```bash
git push origin feat/arch-04-ssr
```

---

## Fase 6 — Smoke test su staging (obbligatorio prima del merge)

Testare su `ombreeluci-staging.pages.dev`. Per ogni URL verificare:
- Status HTTP atteso
- Body inizia con `<!DOCTYPE html` (non `[object Object]`)
- Layout visivamente corretto (niente CSS saltato)

| Test | URL | Atteso |
|------|-----|--------|
| Homepage | `/` | 200, layout completo |
| Articolo SSR noto | `/blog/ombre-e-luci/` | 200, titolo articolo, Cache-Control |
| Articolo con caratteri speciali | `/blog/lesperienza-della-solitudine/` | 200, HTML valido |
| Articolo lungo | `/blog/storie-ai-margini-dal-festival-di-rotterdam/` | 200, HTML valido |
| Slug inesistente | `/blog/slug-inventato-xyz/` | 404, pagina app (non `[object Object]`) |
| Archivio | `/archivio/` | 200, griglia copertine visibile |
| Categoria | `/categoria/fede-e-luce/` | 200 |
| Autore | `/autori/jean-vanier/` | 200 |

**Gate 5 ✓/✗:** tutti gli 8 URL rispondono come atteso.

> ⚠️ **Checklist aggiuntiva prima del merge:** verificare via CF API che `compatibility_flags` del progetto Pages **non contenga `nodejs_compat`**. Presenza di `nodejs_compat` causa `[object Object]` su tutti gli endpoint SSR nonostante i gate locali siano verdi. Incidente documentato: 2026-04-03, risolto rimuovendo il flag via PATCH API + redeploy.

---

## Fase 7 — Merge su main

Solo dopo Gate 5 verde.

```bash
git checkout main
git merge --no-ff feat/arch-04-ssr -m "feat(ARCH-04): hybrid SSR — tutti i gate verdi"
git push origin main
```

Smoke test finale su staging dopo il deploy di main per conferma.

---

## Rollback — sapere come tornare indietro prima che serva

Se qualcosa si rompe su staging o produzione:

```bash
# 1. Identifica l'ultimo commit stabile
git log --oneline -10

# 2. Ripristina i file chiave a quello stato
git checkout <hash-stabile> -- astro.config.mjs src/pages/blog/[...slug].astro

# 3. Commit e push immediato
git add astro.config.mjs "src/pages/blog/[...slug].astro"
git commit -m "revert: ripristino <hash-stabile> — sito stabile"
git push origin main
```

**Regola:** il rollback si fa entro 5 minuti dalla scoperta del problema.
Non si aggiungono altri commit sopra un sistema rotto.

---

## Regole operative permanenti

### Su main
- Nessun commit diretto su `main` per lavoro sperimentale
- Ogni push su `main`: build locale ok + bundle size ok verificati

### Su CF Pages / Cloudflare
- Non toccare Worker, DNS, route senza aver disegnato la catena completa:
  `DNS apex → Worker route → fetch verso Pages/Aruba`
- Un solo cambio alla volta, smoke test dopo ogni cambio
- Dopo ogni major upgrade di `@astrojs/cloudflare`: ri-misurare bundle size
- **`nodejs_compat` compatibility flag vietato** — causa `[object Object]` come body su Astro hybrid SSR (il polyfill `process` cambia il tipo di valore restituito dalla Response). Il flag corretto è nessun flag, o al massimo `disable_nodejs_process_v2` se richiesto da una dipendenza specifica. Verificare con CF API prima di ogni deploy su un nuovo progetto Pages: `curl https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME | jq '.result.deployment_configs.production.compatibility_flags'`

### Sul codice
- Nessun URL privato (`159.69.196.64`) nel markup o nel codice
- Secrets solo in `.dev.vars` (locale) o CF Pages env (produzione) — mai nei markdown
- `correlati.json` non va mai importato staticamente in pagine SSR
- Sorgente unica: `src/data/correlati.json` → `public/correlati.json` via `prebuild`

### Quando qualcosa va storto
1. **Stop** — non aggiungere altri commit
2. Identificare l'ultimo commit stabile (`git log --oneline`)
3. Rollback immediato (vedi sezione sopra)
4. Push del ripristino
5. Solo dopo, diagnosticare con calma su branch separato

---

## Riferimenti

- Contesto e storia: `PROGRESS.md` → sezione ARCH-04
- Valori reali env: `PROGRESS.md` → sezione "CF Pages env vars"
- Architettura Worker: `cf-worker/wrangler.toml` + `cf-worker/redirect-worker.js`
- Directus credentials helper: `src/lib/directus.ts` → `directusCredsFromAstroLocals`
