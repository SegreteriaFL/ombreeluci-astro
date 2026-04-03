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

---

## Fase 1 — Setup branch e ambiente locale

```bash
git checkout main
git pull origin main
git checkout -b feat/arch-04-ssr
```

Verificare che `.dev.vars` esista nella root (non committato):

```
DIRECTUS_URL=https://cms.ombreeluci.it
DIRECTUS_TOKEN=...
REVALIDATE_SECRET=...
CF_ZONE_ID=0cc4507d662828548b5f9f90e4b2d494
CF_PURGE_TOKEN=...
REVALIDATE_DRY_RUN=true
```

**Gate 1:** `.dev.vars` presente e `.gitignore` contiene `.dev.vars`. ✓/✗

---

## Fase 2 — Modifiche codice (una alla volta)

### Ordine obbligatorio

1. `astro.config.mjs` — aggiungere `output: 'hybrid'` + `adapter: cloudflare()`
2. `blog/[...slug].astro` — sostituire `getStaticPaths` con SSR on-demand
3. Verificare che `correlati.json` **non** sia importato staticamente (causa bundle >900KB)

### Regola su correlati.json

`correlati.json` pesa 749KB. Se importato con `import correlatiMap from '../../data/correlati.json'`
viene bundlato nel worker SSR → bundle >900KB → CF Pages crasha silenziosamente con `[object Object]`.

**Soluzione approvata:** fetch a runtime da endpoint pubblico.

```typescript
// In blog/[...slug].astro — NON fare questo:
// import correlatiMap from '../../data/correlati.json'; // ❌ 749KB nel bundle

// Fare questo:
const correlatiRes = await fetch(`${Astro.url.origin}/correlati.json`);
const correlatiMap: Record<string, string[]> = correlatiRes.ok
  ? await correlatiRes.json()
  : {};
```

Assicurarsi che `public/correlati.json` esista (copia di `src/data/correlati.json`).

### Altre regole codice

- Nessun `return new Response(null, ...)` — CF adapter v11 non gestisce body null → `return new Response('Not found', { status: 404 })`
- Tutti i fetch Directus avvolti in try-catch con fallback esplicito
- `directusCredsFromAstroLocals(Astro.locals)` passato a ogni chiamata Directus
- Nessun IP privato (`159.69.196.64`) nel codice — sempre `https://cms.ombreeluci.it`

---

## Fase 3 — Gate build locale (obbligatorio prima di ogni push)

### 3a. Build

```bash
npm run build
```

Deve completare senza errori TypeScript e senza warning critici.

### 3b. Bundle size check ← IL PIÙ IMPORTANTE

```bash
ls -lh dist/_worker.js/pages/blog/_---slug_.astro.mjs
```

**Limite massimo: 500KB.** Se supera → non si pusha, si risolve prima.

Riferimento:
- Con `correlati.json` bundlato: ~908KB ❌
- Corretto (fetch runtime): ~109KB ✓

### 3c. Test con edge runtime locale

```bash
npx wrangler pages dev ./dist --compatibility-date=2024-01-01
```

In un secondo terminale, eseguire tutti e quattro i test:

**Test A — Articolo esistente (HTTP 200 + Cache-Control)**
```bash
curl -i http://localhost:8788/blog/ombre-e-luci/
```
Atteso: `HTTP/1.1 200`, header `Cache-Control: s-maxage=86400,...`, HTML con titolo articolo.

**Test B — Slug inesistente (HTTP 404 pulito)**
```bash
curl -o /dev/null -w "%{http_code}\n" http://localhost:8788/blog/slug-che-non-esiste-xyz/
```
Atteso: `404`

**Test C — Revalidate endpoint (dry-run)**
```bash
curl -i -X POST http://localhost:8788/api/revalidate \
  -H "Content-Type: application/json" \
  -d "{\"slug\":\"ombre-e-luci\",\"secret\":\"IL_SECRET\"}"
```
Atteso: `{"ok":true,"dryRun":true,...}` — con `REVALIDATE_DRY_RUN=true` non chiama CF purge reale.

**Test D — Homepage + redirect legacy**
```bash
curl -o /dev/null -w "%{http_code}\n" http://localhost:8788/
curl -o /dev/null -w "%{http_code}\n" "http://localhost:8788/archivio/"
```
Attesi: `200`, `200`

**Gate 3:** tutti e quattro i test verdi. ✓/✗
Se un test fallisce: **stop**, diagnosticare prima di pushare qualsiasi cosa.

---

## Fase 4 — Push su branch (non su main)

Solo dopo Gate 1 + Gate 2 (bundle <500KB) + Gate 3 (tutti i test verdi).

```bash
git push origin feat/arch-04-ssr
```

CF Pages può essere configurato per fare preview deploy del branch.
In alternativa: smoke test manuale su `ombreeluci-staging.pages.dev` dopo aver
cambiato temporaneamente il branch di deploy (poi ripristinare `main`).

---

## Fase 5 — Smoke test su staging (obbligatorio prima del merge)

URL da testare su `ombreeluci-staging.pages.dev`:

| Test | URL | Atteso |
|------|-----|--------|
| Homepage | `/` | 200, layout completo |
| Articolo SSR | `/blog/ombre-e-luci/` | 200, titolo articolo, Cache-Control header |
| Slug inesistente | `/blog/slug-inventato-xyz/` | 404 con pagina applicazione (non stack trace, non `[object Object]`) |
| Archivio | `/archivio/` | 200, griglia copertine visibile |
| Categoria | `/categoria/fede-e-luce/` | 200 |
| Autore | `/autori/jean-vanier/` | 200 |

**Gate 4:** tutti i 6 URL rispondono come atteso. ✓/✗

---

## Fase 6 — Merge su main

Solo dopo Gate 4 verde.

```bash
git checkout main
git merge --no-ff feat/arch-04-ssr
git push origin main
```

Poi smoke test finale su staging dopo il deploy di main.

---

## Regole operative permanenti (non derogabili)

### Su main
- Nessun commit diretto su `main` per lavoro sperimentale
- Ogni push su `main` deve avere: build locale ok + bundle size ok

### Su CF Pages / Cloudflare
- Non toccare Worker, DNS, route senza prima disegnare la catena completa:
  `DNS apex → Worker route → fetch verso Pages/Aruba`
- Un solo cambio alla volta, smoke test dopo ogni cambio
- Se qualcosa si rompe: **rollback immediato**, non aggiungere un altro layer sopra

### Sul codice
- Nessun URL privato (`159.69.196.64`) nel markup o nel codice
- Variabili sensibili solo in `.dev.vars` (locale) o CF Pages env (produzione)
- `correlati.json` non va mai importato staticamente in pagine SSR

### Quando qualcosa va storto
1. Stop — non aggiungere altri commit
2. Identificare l'ultimo commit stabile (`git log --oneline`)
3. Ripristinare quello stato (`git checkout <hash> -- <file>`)
4. Push del ripristino
5. Solo dopo, diagnosticare con calma

---

## Riferimenti

- Contesto completo: `PROGRESS.md` → sezione ARCH-04
- Variabili d'ambiente: `PROGRESS.md` → sezione "CF Pages env vars"
- Architettura Worker: `cf-worker/wrangler.toml` + `cf-worker/redirect-worker.js`
- Directus credentials helper: `src/lib/directus.ts` → `directusCredsFromAstroLocals`
