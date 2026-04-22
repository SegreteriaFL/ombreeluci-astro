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
│   ├── categorie.json           # 14 slug canonici + label {it,en}
│   ├── correlati.json           # 3487 articoli × 5 vicini UMAP (non importare staticamente in SSR)
│   ├── ultimo-numero.json       # ~200B — ultimo numero OEL per Header
│   └── redirects-legacy.json   # ~1001 slug redirect legacy
├── pages/
│   ├── index.astro              # Homepage (prerender)
│   ├── [diario].astro           # Route dinamica diari (prerender) — attenzione ai conflitti
│   ├── blog/[...slug].astro     # Articolo IT (SSR, s-maxage=3600)
│   ├── en/[slug].astro          # Articolo EN (SSR)
│   ├── en/index.astro           # Indice EN
│   ├── en/category/[slug].astro # Categoria EN
│   ├── en/tag/[slug].astro      # Tag EN
│   ├── tag/[slug].astro         # Tag IT
│   ├── categoria/[categoria].astro
│   ├── autori/[slug].astro
│   ├── archivio/[issue].astro
│   └── cerca.astro              # Ricerca Pagefind
├── components/                  # Tutti i componenti Astro
├── config/
│   └── taxonomy.js              # getCategoriaLabel(), getMegaclusterForArticle()
└── middleware.ts                # Redirect legacy per host *.pages.dev
```

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
"prebuild": "node -e \"require('fs').copyFileSync('src/data/correlati.json','public/correlati.json')\""
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

## Slug convention articoli EN

Gli articoli EN in Directus hanno slug con suffisso `-en` (es. `il-progetto-dandelion-en`). L'URL pubblico rimuove il suffisso: `/en/il-progetto-dandelion/`. La route `src/pages/en/[slug].astro` ricostruisce lo slug Directus aggiungendo `-en`.

Non cambiare questa convenzione senza aggiornare tutti i 131 articoli EN esistenti e la route.

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

Per audit o diagnosi **senza** parola d'ordine di implementazione: solo lettura, nessun commit, nessun deploy. La regola è in `.cursor/rules/audit-diagnosi-sola-lettura.mdc`.

Al termine di ogni sessione di implementazione: aggiornare STATO.md con i task chiusi e i nuovi task emersi.
