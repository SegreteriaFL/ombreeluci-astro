# STATO — Ombre e Luci

**Ultimo aggiornamento:** 2026-04-27 (main — `a2da57c6` commenti accordion + bio troncata + bio_en EN + audit doc completo)
**Staging:** https://ombreeluci-staging.pages.dev
**CMS:** https://cms.ombreeluci.it
**Repo:** SegreteriaFL/ombreeluci-astro

---

## Stato attuale verificato (aggiornato 2026-04-27)

| Verifica | Esito |
|----------|-------|
| Home IT `/` | ✅ 200, SSG |
| Home EN `/en/` | ✅ 200, `HomePageContent.astro` |
| Articolo IT `/it/{slug}/` | ✅ 200 |
| Articolo EN `/en/{slug}/` | ✅ 200, SSR, lookup a due tentativi |
| Categoria IT `/categoria/famiglia/` | ✅ 200 |
| Categoria EN `/en/category/family/` | ✅ 200, redirect a /en/ se 0 articoli published |
| Autore IT `/autori/{slug}/` | ✅ 200 |
| Autore EN `/en/authors/{slug}/` | ✅ 200 |
| Lista autori IT/EN | ✅ 200 |
| Archivio IT `/archivio/` | ✅ 200, `ArchivioContent.astro` |
| Archivio EN `/en/archive/` | ✅ 200, `ArchivioContent.astro` lang=en |
| Numero IT `/archivio/oel-171/` | ✅ 200, `IssueContent.astro` |
| Numero EN `/en/archive/oel-171/` | ✅ 200, `IssueContent.astro` lang=en |
| Chi siamo IT `/chi-siamo/` | ✅ 200, `ChiSiamoContent.astro` |
| About EN `/en/about/` | ✅ 200, `ChiSiamoContent.astro` lang=en |
| Sostienici IT `/sostienici` | ✅ 200, `SostienicContent.astro` |
| Support EN `/en/support-us/` | ✅ 200, `SostienicContent.astro` lang=en |
| Newsletter IT `/newsletter` | ✅ 200, `NewsletterContent.astro` |
| Newsletter EN `/en/newsletter/` | ✅ 200, `NewsletterContent.astro` lang=en |
| Cerca IT `/cerca` | ✅ 200, `CercaContent.astro` |
| Search EN `/en/search/` | ✅ 200, `CercaContent.astro` lang=en |
| Diari IT `/sezioni/diari` | ✅ 200, `DiariContent.astro` |
| Diaries EN `/en/diaries/` | ✅ 200, `DiariContent.astro` lang=en |
| Web-only IT/EN | ✅ `ArticoliRullo.astro` condiviso |
| Dialogo aperto IT/EN | ✅ `RubricaPageContent.astro` — `/rubriche/dialogo-aperto/`, `/en/sections/open-dialogue/` |
| Diari IT/EN (hub) | ✅ `/rubriche/diari/`, `/en/sections/diaries/` — `DiariContent.astro` |
| Editoriali IT/EN | ✅ `/rubriche/editoriali/`, `/en/sections/editorials/` — `RubricaPageContent.astro` |
| Interviste IT/EN | ✅ `/rubriche/interviste/`, `/en/sections/interviews/` |
| Testimonianze IT/EN | ✅ `/rubriche/testimonianze/`, `/en/sections/testimonies/` |
| Recensioni IT/EN | ✅ `/rubriche/recensioni/`, `/en/sections/reviews/` |
| Tag IT `/tag/[slug]/` | ✅ solo articoli `lang=it` (fix 2026-04-27) |
| Tag EN `/en/tag/[slug]/` | ✅ solo articoli `lang=en` |
| Redirect `/blog/*` | ✅ 301 |
| CORS Directus | ✅ |
| LanguageSelector fallback null → homepage lingua | ✅ già presente |
| IssueNavPill prev/next link | ✅ fix 2026-04-27 (era `/archivio//archivio/`) |
| Scroll orizzontale mobile | 🟡 fix deployato (2026-04-27) — da verificare su più device |
| `.leggi-anche` img margin nell'articolo | ✅ fix 2026-04-27 |

---

## Audit Directus EN — stato reale (verificato 2026-04-25 con curl)

| Campo | Valore | Note |
|---|---|---|
| Articoli EN totali | 3470 | |
| EN published | **3470** | Tutti published — zero draft (aggiornato 2026-04-25) |
| EN draft | **0** | ✅ |
| Slug con suffisso `-en` | **42** | Traduzioni manuali originali. Il suffisso è **necessario** (evita collisione slug IT). Non va rimosso. |
| `articolo_traduzione` valorizzato | **3452 / 3470** (99,4%) | 18 orfani. Link IT↔EN quasi completo. |
| `categoria_menu` valorizzato | **3436 / 3470** (99%) | Valori corretti: slug IT (`famiglia`, `progetti`, ecc.) — NON tradotti in inglese. |
| `categoria_menu` NULL | **34** | Backfill residuo. |
| Slug EN sbagliati (`family`, `projects`…) | **0** | Pipeline AI ha copiato correttamente lo slug IT. |

**`/en/category/projects/`**: 235 EN con `categoria_menu = 'progetti'`, tutti published. Le pagine categoria EN sono ora popolate.

---

## Fix recenti (2026-04-27)

| Commit | Fix |
|--------|-----|
| `a2da57c6` | UX: commenti accordion `<details>` chiusi di default; bio autore troncata 200 char + link "Leggi di più"; bio_en su articoli EN; audit doc completo (§SEO, §Analytics, §Redirect, §Directus, §Commenti, §Piano EN/ES) |
| `5ee8326` | IssueNavPill: href doppio `/archivio//archivio/` — passato path completo, non prefissato di nuovo |
| `3dac352` | Mobile scroll orizzontale: `min-width:0` su `.mega-menu-block`, `overflow-x:hidden` su mega menu aperto, `overflow-x:clip` su `html` |
| `cd2f988` | Mobile scroll orizzontale: `overflow-x:clip` → `overflow-x:hidden` su `html` (clip non supportato iOS Safari <16) |
| `3930532` | ArticlePageLayout: reset `margin:0; border-radius:0` su `.article-content .leggi-anche img` |
| `04bfcf0a` | TAG-03: `/tag/[slug]` IT ora filtra `lang=it` — prima mostrava IT+EN insieme |

**Scroll orizzontale mobile**: `overflow-x:hidden` su `html` è deployato. Da verificare su altri device prima di confermare chiuso.

---

## Prossima azione immediata

**SEARCH-01 / B-13 — Algolia** (blocker pre-lancio). Da testare seriamente su staging (vedi checklist § Algolia). Manca ALGOLIA-05 (webhook sync automatico).

---

## Blockers pre-lancio (cutover DNS)

Il cutover avviene quando tutti i blockers sono verdi.

| ID | Stato | Owner | Descrizione |
|----|-------|-------|-------------|
| B-01 | ✅ | — | Merge `feat/i18n-shell` su main |
| B-02 | ✅ | Dev | Smoke test SEO F2 — curl verdi, fix hreflang assoluto `6aab9c44` |
| B-03 | ✅ | Dev | CORS Directus configurato e verificato |
| B-04 | ⏳ | Redazione | V-02: assegnare categoria ai 19 articoli "da-categorizzare" in Directus |
| B-05 | ✅ | Dev | URL-01: rimozione `/blog/` — verificato su staging 2026-04-24 |
| B-06 | ⏳ | Dev/Redazione | T1/T2/T3: validare workflow creazione OEL-173 da account Redazione UAT |
| B-07 | ✅ | Dev | Keystatic dismesso — Worker `keystatic-oel` eliminato |
| B-08 | ✅ | Dev | Copertine staging: tutte su `cms.ombreeluci.it/assets/{uuid}`, 200 OK |
| B-09 | → post-lancio | Sysadmin | UptimeRobot monitoring |
| B-10 | → post-lancio | Sysadmin | Slack alert build |
| B-11 | N/A | — | Iubenda ownerName `fedeeluce.it` è corretto (editore legale) |
| B-13 | 🟡 | Dev | **Ricerca Algolia** — implementato (ALGOLIA-01/02/03/04, 2026-04-26). Dropdown header + pagina risultati funzionanti su staging. **Da testare seriamente prima del go-live** (vedi § Algolia sotto). Manca ALGOLIA-05 (webhook sync automatico). |
| B-14 | 🔴 | Dev | **URL-IT-02** — prefisso `/it/` sulle pagine sezione IT per simmetria con `/en/`. Se lasciato asimmetrico, aggiungere ES/FR genera URL incoerenti (`/es/archive/` ma IT è `/archivio/`). Richiede redirect 301 da URL vecchi. Da fare prima del lancio. |
| B-15 | 🔴 | Dev | **noindex SWEEP — ULTIMA AZIONE PRE-CUTOVER** ⚠️ **NON toccare finché il sito è su staging.** Il `noindex={true}` su tutte le pagine è intenzionale e protegge lo staging dall'indicizzazione. Rimuoverlo prima del cutover significherebbe indicizzare lo staging su Google. Questo è l'ULTIMO commit da fare, immediatamente prima di cambiare il DNS — contestualmente all'apertura di `robots.txt`. Vedere § SEO per lista completa dei file da modificare. |
| B-16 | 🔴 | Dev | **Sitemap completa pre-lancio** — `/sitemap.xml` attuale copre solo IT static + categorie + articoli IT. Mancano: articoli EN, numeri archivio, pagine autore, pagine EN. Aggiornare `sitemap.xml.ts` e registrare in Search Console al cutover. |
| B-17 | 🔴 | Dev | **Analytics GA4/GTM** — zero analytics implementato. Minimo pre-lancio: attivare Cloudflare Web Analytics (gratis, già disponibile su CF Pages, 1 riga di codice) O aggiungere GA4 via script. Senza questo non si sa nulla del traffico dal giorno 1. Vedere § Analytics. |

---

## Backlog pre-lancio

Tutto questo deve essere verde prima del cutover DNS.

| ID | Priorità | Effort | Descrizione |
|----|----------|--------|-------------|
| TAG-404 | ✅ | S | Risolto automaticamente — `/tag/*` è nel `_routes.json` include, staging 200 OK (verificato 2026-04-25). |
| SLUG-CAT-EN | ✅ | M | `categorie.json` è già fonte unica di verità con `en_slug`. Mappe hardcoded `CAT_IT_TO_EN_SLUG` non esistono più in `i18n.ts`. `getCategoriaUrlSlug/getCategoriaSlugIT` leggono da JSON. Chiuso. |
| AUT-01 | ✅ | M | Pagine autore: route EN `/en/authors/[slug]`, componente condiviso `AuthorPageContent.astro`, filtro lang per lingua, bio_en in Directus. Build OK. Commit feat/aut-01-author-pages. |
| HOME-EN | ✅ | M | Homepage EN `/en/` — `HomePageContent.astro` estratto, `index.astro` refactored, `en/index.astro` creato. Merge `1c4bbe90`. |
| ARCH-EN | ✅ | M | `/en/archive/` e `/en/archive/[issue]` — `ArchivioContent.astro` + `IssueContent.astro`. Merge `feat/static-pages-en`. |
| DIARI-EN | ✅ | M | `/en/diaries/` e `/en/diaries/[diario]` — `DiariContent.astro` + `DiarioContent.astro`. Merge `feat/static-pages-en`. |
| TAG-03 | ✅ | S | `/tag/[slug]` ora filtra `lang=it`; `/en/tag/[slug]` filtra `lang=en`. Fix 2026-04-27. |
| TAG-REC | 🟡 | M | Filtro per tipo dentro `/rubriche/recensioni/`: libri, cinema, teatro, tv. Architettura: tag Directus + filtro client-side dentro RubricaPageContent (NON sub-URL). Pre-requisito: verificare che le recensioni abbiano già tag `cinema`/`libri`/`teatro`/`tv` in Directus — se no, lavoro editoriale. Post-lancio. |
| SEARCH-01 | 🟡 | L | **Ricerca Algolia** — ALGOLIA-01/02/03/04 completati (2026-04-26). Indice popolato (7502 record). Autocomplete header + InstantSearch `/cerca` e `/en/search` deployati su main. **Richiede test sistematico pre-lancio** — vedi § Algolia. Manca ALGOLIA-05 (webhook). |
| ALGOLIA-05 | 🔴 | M | **Webhook sync Directus→Algolia** — pubblicare/modificare un articolo in Directus deve aggiornare automaticamente l'indice Algolia. Senza questo, ogni re-indicizzazione è manuale (`node scripts/algolia/index-all.mjs`). Da fare prima del go-live. |
| VERT-01 | 🟡 | L | 8 pagine verticali WP da replicare con struttura multilingua fin dall'inizio: `mariangela-bertolini`, `autismo`, `cinema-e-disabilita`, `aktion-t4-sterminio-persone-disabilita`, `catechesi-e-disabilita`, `noi-papa-un-figlio-disabile`, `ciao-stefano-di-franco`, `studiosi-educatori-e-attivisti-ombre-e-luci` |
| B-12 | 🟡 | M | Rivalutazione ruoli editoriali per categoria (dopo B-04) |
| LINK-01 | 🟡 | S | 7 link IT↔EN ambigui + 11 no-match: `scripts/traduzione/logs/backfill_traduzione_link_20260408_231827.csv` |
| V-05 | 🟡 | S | 35 articoli Jean Vanier con `tema_label = null`: riassegnare categoria in Directus |
| UX-19 | 🟢 | S | Rimuovere o proteggere pagine test/debug: `test-lista.astro`, `test-minimal.astro`, `test-no-articles.astro`, `test-status.astro`, `debug/audit-editoriale.astro` |
| PF-01 | 🔴 | S | Placeholder copertina 4.2MB: ridimensionare a 400px + WebP/AVIF |
| PF-02 | 🔴 | S | Cache-Control assente su R2: aggiungere `max-age=31536000, immutable` via CF Transform Rule |
| DA-02 | 🟢 | S | 16 pull quote non reinserite: 11 articoli con posizione ambigua, inserire a mano in Directus |
| UAT-CLEANUP | 🔴 | S | Eliminare utente Redazione UAT `redazione-uat@ombreeluci.it` prima del go-live |

---

## Validazioni in attesa dalla Redazione

| # | Cosa | Come verificare |
|---|------|-----------------|
| V-01 | 13 categorie: distribuzione articoli sensata? | Staging → menu Temi → ogni `/categoria/*` |
| V-02 | 19 articoli "da-categorizzare" da assegnare | Directus → filtra `categoria_menu = da-categorizzare` |
| V-04 | "Fede e Luce" (1114 articoli): serve suddivisione? | Staging → `/categoria/fede-e-luce` |
| V-05 | 35 articoli Jean Vanier senza categoria | Directus → filtra `tema_label` vuoto |
| V-13 | Homepage v2: qualità editoriale articoli in rotazione | Staging → ricarica più volte |
| V-14 | Embed video YouTube funzionanti | `/blog/berlinale-74-orso-doro/` |
| V-16 | Pull quote (570): posizione e formattazione corretta | Articoli lunghi con citazioni evidenziate |
| V-17 | Sommari numeri rivista (71): testo leggibile e corretto | `/archivio` → apri alcuni numeri |

---

## Algolia — stato implementazione (2026-04-26)

### Architettura

| Componente | File | Stato |
|---|---|---|
| Script indicizzazione | `scripts/algolia/index-all.mjs` | ✅ funzionante |
| Indice articoli | `oel_articoli` | ✅ 6945 record (IT+EN, filter per `lang`) |
| Indice autori | `oel_autori` | ✅ 353 record |
| Indice numeri | `oel_numeri` | ✅ 204 record |
| Autocomplete header | `src/components/AutocompleteWidget.astro` | ✅ deployato, da testare |
| InstantSearch `/cerca` | `src/components/CercaContent.astro` | ✅ deployato, da testare |
| Webhook sync automatico | — | 🔴 **non implementato** |

### Re-indicizzazione manuale

Finché ALGOLIA-05 non è implementato, ogni volta che si pubblica/modifica un articolo in Directus l'indice Algolia rimane desincronizzato. Per aggiornare:

```bash
node scripts/algolia/index-all.mjs
```

Richiede `.env` con `ALGOLIA_APPLICATION_ID` e `ALGOLIA_WRITE_API`.

### Limiti piano gratuito (Build)

| Limite | Valore | Stato attuale |
|---|---|---|
| Record | 10.000 | 7.502 (75%) — attenzione crescita |
| Ricerche/mese | 10.000 | Da monitorare post-lancio |

**Alert**: configurare notifica email in [Algolia Dashboard → Settings → Billing](https://dashboard.algolia.com) quando si avvicina a 10k ricerche/mese. A regime può essere necessario il piano Grow ($0,50/1k ricerche oltre soglia). Valutare dopo 30 giorni di produzione.

### ⚠️ Test sistematici richiesti prima del go-live

L'implementazione è funzionante su staging ma non è stata testata in modo sistematico. Prima del cutover DNS verificare:

- [ ] Autocomplete header: dropdown appare correttamente digitando ≥2 caratteri
- [ ] Autocomplete header: navigazione tastiera (↑↓ Enter) funziona
- [ ] Autocomplete header: click su risultato porta alla pagina corretta
- [ ] Autocomplete header: invio senza selezionare item porta a `/cerca/?q=...`
- [ ] Autocomplete header: "Vedi tutti i risultati" funziona
- [ ] Autocomplete header: risultati in IT mostrano solo articoli `lang:it`
- [ ] Autocomplete header EN `/en/`: risultati in EN
- [ ] Autocomplete header: View Transitions — dropdown si reinizializza dopo navigazione
- [ ] Autocomplete header: mobile ≤480px — dropdown nascosto, mobile-search-overlay funziona
- [ ] Autocomplete header: mobile 481-767px — form fallback visibile, submit porta a `/cerca/`
- [ ] Pagina `/cerca/`: searchbox, filtri forma/categoria/anno, paginazione
- [ ] Pagina `/cerca/`: pre-popolamento da `?q=` (passaggio da autocomplete)
- [ ] Pagina `/cerca/`: URL routing (back/forward browser mantiene query e filtri)
- [ ] Pagina `/en/search/`: stessa verifica in EN
- [ ] Performance: latenza percepita del dropdown accettabile
- [ ] Indice sincronizzato: pubblicare articolo test → rilanciare script → appare in ricerca

### Note tecniche Algolia

**Compat wrapper algoliasearch v5 + autocomplete-js v1**: `autocomplete-js` v1 chiama `searchClient.search([{indexName, query, params:{...}}])` (API v4 con params annidati). `liteClient` v5 vuole params piatti e `search({ requests: [...] })`. Il wrapper in `AutocompleteWidget.astro` fa il bridge: flatten dei `params` + wrapping in `{ requests }`. Senza questo: HTTP 400 "Expecting a string" da Algolia.

**`algoliasearch` in devDependencies**: il pacchetto è in `devDependencies` perché usato principalmente dallo script di indicizzazione. Vite lo bundla ugualmente nel JS client. Se CF Pages in futuro cambia comportamento su `npm install`, spostarlo in `dependencies`.

**Classi CSS generate da JS**: le classi `.cerca-hit*` dei template `hits()` in `CercaContent.astro` sono generate da InstantSearch.js a runtime → vanno in `<style is:global>`. Le classi `.ais-*` idem.

---

## Note tecniche (casi documentati)

### CSS leak is:global — ArticlePageLayout (2026-04-24)
`.article-meta` e `.article-title` con `is:global` fuoriuscivano in `ArticleCard`. Fix: override scoped in `ArticleCard.astro`. Regola: `is:global` in componenti condivisi richiede prefisso wrapper univoco.

### Routing _routes.json e catch-all SSR (aggiornato 2026-04-25)

Regola corretta (2026-04-25): NON aggiungere wildcard manuali in `extend.exclude`
per route prerender dinamiche. Astro/CF Pages genera automaticamente le entry
specifiche per ogni pagina SSG. I wildcard manuali (es. `/categoria/*`) causano
overlap con quelle entry → build failure Error 8000057.

Usare `extend.exclude` SOLO per pattern che Astro non genera automaticamente:
```js
{ pattern: '/debug/*' },  // pagine non-SSG
{ pattern: '/test-*' },   // pagine non-SSG
```

Commit `34fbd576`.

### EN articoli traduzione AI — 3470 published (2026-04-25)

Pipeline traduzione AI completata. 3470 articoli EN published in Directus. I 131 EN originali (traduzione manuale da WP) restano invariati. Qualità da auditare post-lancio — non blocca il cutover. Route `en/[slug].astro` li serve via lookup a due tentativi: prima slug esatto, poi slug + `-en`. DA-06 aggiornato in backlog post-lancio.

### Bug strutturali EN — stato aggiornato (2026-04-25)

**S1 — Slug URL EN non normalizzati** — ⏳ bassa priorità fino a pubblicazione articoli AI
42 articoli con suffisso `-en` nel DB: la route li trova via lookup a due tentativi (entrambi i formati URL funzionano). I 3339 AI sono draft → impatto reale quasi zero. Fix da fare prima di pubblicare gli AI: `toArticleUrlSlug(slug, lang)` in `src/utils/i18n.ts`, applicato ovunque si costruisce `href` per articoli non-IT.

**S2 — CHIUSO, ERA FALSO** (verificato 2026-04-25)
La pipeline AI HA copiato `categoria_menu` correttamente per il 99% degli articoli (valori slug IT, non tradotti). Il 4 vs 237 su `/en/category/projects/` è perché 231 articoli sono draft. Zero codice da toccare — si risolve da solo quando gli AI vengono pubblicati dopo QA.

**S3 — FIXATO** (feat/static-pages-en, 2026-04-25)
`LanguageSelector.astro`: già aveva fallback `alternateArticleUrl ?? '/en'`. `en/category/[slug].astro`: ora fa `redirect('/en/', 302)` invece di 404 quando 0 articoli published.

### BUG-REGEX — SyntaxError "missing ) in parenthetical" su articoli specifici (2026-04-27)

`Uncaught SyntaxError: missing ) in parenthetical` in console su `/it/la-costituzione-dei-poveri-recensione` e `/en/the-constitution-of-the-poor-book-review`. Errore client-side in `hoisted.*.js` alla riga 7 e 19 dell'articolo compilato. Causa probabile: il `corpo` dell'articolo contiene un carattere (es. `(` senza `)` corrispondente, o un pattern che JS interpreta come regex malformata) che viene usato in un contesto RegExp da qualche componente client. Limitato a questi due articoli (IT+EN stesso pezzo). **Da investigare in sessione separata**: aprire l'articolo in Directus, cercare parentesi non bilanciate o caratteri speciali nel campo `corpo` o `titolo`.

### basePath default '' non '/' (2026-04-24)
`ArticleCard.astro` e `ArticoliRullo.astro` avevano `basePath='/'` → href `//slug`. Fix: `basePath=''`. Commit `57100eff`.

### Auth EditorialFeedback (2026-04-24)
`display:inline-flex` CSS batteva `[hidden]`. Fix: `[hidden]{display:none!important}` in `global.css`.

### Middleware Astro/CF Pages — catch-all obbligatorio
Il middleware gira solo per route nel manifest. Fix: `[...path].astro` catch-all SSR garantisce che tutti i path abbiano una route.

---

## Backlog post-lancio

| ID | Area | Descrizione |
|----|------|-------------|
| DA-03 | Infra | Upgrade VPS CX23 → CX32 (prerequisito pgvector) |
| DA-04 | AI | Ricerca semantica + correlati pgvector (dopo DA-03) |
| DA-05 | Dati | 37 numeri rivista senza `pdf_archive_url`: scraping Archive.org |
| DA-06 | Traduzioni | ✅ Pipeline traduzione AI IT→EN completata — 3470 articoli EN published (2026-04-25). Audit qualità post-lancio. |
| DA-06-ES | Traduzioni | Pipeline spagnolo — dopo chiusura EN |
| TAG-01 | Frontend | ✅ **CHIUSO 2026-04-27** — Tag visibili nella pagina articolo IT (righe 643-649 di `it/[slug].astro`). Su EN nascosti con `.article-tags-list--hidden` finché Directus non ha `nome_en`/`slug_en`. |
| DIR-01 | Directus | Pannello "Articoli correlati" in Directus durante scrittura |
| DIR-02 | Directus | Suggerimenti AI durante scrittura (Claude API) — dopo DA-03+DA-04 |
| SEARCH-02 | Ricerca | Algolia avanzato: faceting, ranking, as-you-type (dopo SEARCH-01 stabile) |
| GR-04 | Crescita | Google AdSense (dopo lancio, via GTM) |
| GR-05 | Crescita | Newsletter Mailchimp form moderno |
| GR-06 | Crescita | CTA dinamiche a fine articolo |
| GR-07 | Crescita | Pagina `/newsletter` dedicata |
| GR-CTA | Crescita | **CTA "Sostienici" in fondo agli articoli** — vedi § GR-CTA per specifiche complete. Effort: M. |
| UX-07 | UX | Articolo su mobile: padding, tipografia fluida, capolettera |
| UX-10 | UX | Selettore lingua: nascondere se non esiste traduzione |
| UX-BIO | UX | ✅ **CHIUSO 2026-04-27** — Bio autore troncata a 200 caratteri con link "Leggi di più →" alla pagina autore. Implementato in `it/[slug].astro` e `en/[slug].astro`. |
| UX-CMT | UX | ✅ **CHIUSO 2026-04-27** — Form commenti in accordion `<details>/<summary>`: "Mostra commenti (N)" solo se presenti; "Lascia un commento" sempre. Entrambi chiusi di default. File: `src/components/Commenti.astro`. |
| ARCH-02 | UX | **Archivio: split "Ultimo numero" / "Tutti i numeri"** — vedi § ARCH-02 per specifiche. Effort: M. |
| DIR-TAG-EN | Directus | Aggiungere `nome_en` e `slug_en` alla collection `tags` in Directus. Prerequisito per mostrare tag sugli articoli EN. Attualmente i tag EN sono nascosti con `.article-tags-list--hidden` (nota in `ArticlePageLayout.astro`). |
| DID-EN | Traduzione | Aggiungere campo `didascalia_en` alla collection `articoli` in Directus. Attualmente `didascalia_copertina` non ha equivalente EN — le didascalie sugli articoli EN sono sempre in italiano. |
| BIO-EN-ART | Traduzione | ✅ **CHIUSO 2026-04-27** — `en/[slug].astro`: `authorBioHtml` ora usa `bio_en` se disponibile, con fallback a `bio_html` IT. |
| PF-03 | Perf | Immagini non responsive: srcset mancante |
| PF-04 | Perf | CSS render-blocking |
| B-09 | Infra | UptimeRobot monitoring |
| B-10 | Infra | Slack alert build GH Actions |
| fedeeluce | Infra | Directus multi-tenant per fedeeluce.it |

---

## Pulizia tecnica

| Cosa | Azione |
|------|--------|
| Branch locali morti | Eliminare: `feat/arch-04-ssr`, `feat/articoli-rullo`, `feat/directus-migration`, `feat/i18n-master-plan`, `feat/seo-ux-improvements`, `hardening/resilience`, `master`, `safe/feat-i18n-align` |
| File legacy in `src/data/` | Spostare in `_archive/`: `estrai_tutto.json`, `database_autori.csv`, `_legacy_articoli_megacluster.json`, `numeri_consolidati.json`, `media_articoli.csv` |
| `blog/en.astro` | Verificare se sostituibile da `/en/index.astro` |
| Mappe hardcoded `CAT_IT_TO_EN_SLUG` in `i18n.ts` | ✅ già rimosse — `categorie.json` è fonte unica |

---

## Riferimenti rapidi

| Cosa | Valore |
|------|--------|
| Staging | https://ombreeluci-staging.pages.dev |
| CMS | https://cms.ombreeluci.it |
| Repo | SegreteriaFL/ombreeluci-astro |
| VPS | 159.69.196.64 — Hetzner CX23, Ubuntu 24.04, €4.09/mese |
| CF Account ID | `6b071de7f55397ada5645e187c932202` |
| CF Zone ID | `0cc4507d662828548b5f9f90e4b2d494` |
| R2 bucket | `oel-media` — pub: `pub-2251dc2142e3492a961f629f2af543d0.r2.dev` |
| Credenziali VPS | `vps_credentials.txt` (locale — non committare mai) |
| Utente Redazione UAT | `redazione-uat@ombreeluci.it` / `OmbreLuci2026!` — **eliminare prima del go-live** |
| Algolia App ID | in `.env` come `ALGOLIA_APP_ID` |
| Algolia Index | `ombreeluci_articoli` |

---

## § Test UX/UI pre-lancio

Checklist da eseguire **manualmente** su staging prima del cutover DNS. Testare su device fisici quando possibile, non solo emulatori.

### Viewport da testare
- 375px (iPhone SE, scenario critico)
- 390px (iPhone 14)
- 768px (iPad portrait)
- 1024px (iPad landscape / laptop entry)
- 1440px (desktop standard)

### Header e navigazione
- [ ] Logo cliccabile → homepage IT
- [ ] Mega menu: apertura hover/click su ogni voce di primo livello
- [ ] Mega menu: chiusura cliccando fuori o premendo Esc
- [ ] Mega menu: tutti i link secondari portano alla pagina corretta
- [ ] Mega menu: su mobile (<768px) si trasforma in menu hamburger
- [ ] Menu hamburger: apertura, chiusura, tutti i link funzionanti
- [ ] Language selector IT: visibile in ogni pagina IT, porta alla versione EN corrispondente
- [ ] Language selector EN: visibile in ogni pagina EN, porta alla versione IT corrispondente
- [ ] Language selector: se nessuna traduzione disponibile → homepage della lingua target (non link rotto)
- [ ] Barra di ricerca header: visible su desktop ≥481px, icon only su mobile
- [ ] Mobile search overlay: tap sull'icona apre overlay, focus nel campo, invio porta a `/cerca/`
- [ ] View Transitions: navigare tra pagine → header non flickera, stato non si perde

### Homepage IT `/`
- [ ] Grid articoli principale: layout corretto su ogni viewport
- [ ] Articoli in evidenza: immagini caricate, titoli, autori, date visibili
- [ ] Sezioni categorie: link funzionanti
- [ ] Ricarica: rotazione articoli in evidenza funziona
- [ ] Nessun overflow orizzontale a 375px
- [ ] CTA newsletter (se presente): link funzionante

### Homepage EN `/en/`
- [ ] Stessa verifica della IT

### Pagina articolo IT `/it/{slug}/`
- [ ] Titolo, sottotitolo, data, autore, tempo di lettura visibili
- [ ] Badge categoria + numero rivista cliccabili
- [ ] Immagine copertina: caricata, nessun layout shift
- [ ] Didascalia immagine: visibile, icona camera
- [ ] Corpo dell'articolo: testo leggibile, paragrafi spaziati
- [ ] Video YouTube embedded: riproduzione funzionante
- [ ] Embed Instagram (dove presenti): caricamento embed
- [ ] Alert articoli archivio (<2000): banner giallo visibile
- [ ] "Leggi anche" in-content: card visibile dopo 3° paragrafo
- [ ] Tag in fondo: visibili, link a `/tag/{slug}` funzionante
- [ ] Bio autore in calce: immagine o placeholder, nome linkato alla pagina autore
- [ ] Articoli correlati in calce: griglia 3 (desktop) / 2 (tablet) / 1 (mobile <480px)
- [ ] Social sticky bar: visibile su desktop, inline su mobile
- [ ] Condivisione Facebook/X/WhatsApp/LinkedIn: link corretti
- [ ] Copia link: funzione clipboard attiva
- [ ] Reading progress bar: avanza durante lo scroll
- [ ] Widget floating (dopo 50% scroll): appare, si chiude con X
- [ ] Form commenti: nome, email, testo, invio, messaggio di conferma
- [ ] Language switch: porta alla versione EN dell'articolo (o homepage EN se non tradotto)

### Pagina articolo EN `/en/{slug}/`
- [ ] Stessa verifica IT + verificare che tag siano nascosti (`.article-tags-list--hidden`) finché non c'è `nome_en`
- [ ] Bio autore: mostra `bio_en` se disponibile, altrimenti `bio_html` IT

### Categoria IT `/categoria/{slug}/`
- [ ] Lista articoli: card corrette, paginazione funzionante
- [ ] Categoria EN `/en/category/{slug}/`: stessa verifica
- [ ] Categoria senza articoli pubblicati: redirect a `/en/` (non 404)

### Rubriche IT `/rubriche/{slug}/`
- [ ] Lista articoli della rubrica
- [ ] Filtro per tipo recensione in `/rubriche/recensioni/` (se implementato)
- [ ] Versione EN `/en/sections/{slug}/`: stessa struttura

### Tag IT `/tag/{slug}/`
- [ ] Solo articoli `lang=it` mostrati (fix 2026-04-27)
- [ ] EN `/en/tag/{slug}/`: solo articoli `lang=en`

### Archivio `/archivio/`
- [ ] Lista numeri rivista: copertine, titoli, anno
- [ ] Singolo numero `/archivio/oel-171/`: sommario, articoli, nav prev/next
- [ ] Nav prev/next: link corretti senza doppio `/archivio//archivio/` (fix 2026-04-27)
- [ ] EN `/en/archive/` e `/en/archive/oel-171/`: stessa verifica

### Diari `/diari/{slug}/` e `/en/diaries/{slug}/`
- [ ] Singolo diario: layout, articoli del diario
- [ ] Hub diari: lista diari

### Autori `/autori/`
- [ ] Lista autori: griglia, foto o placeholder, link funzionanti
- [ ] Singolo autore `/autori/{slug}/`: bio, lista articoli, foto
- [ ] EN `/en/authors/` e `/en/authors/{slug}/`: stessa verifica

### Cerca `/cerca/` e `/en/search/`
- [ ] Searchbox: inserire query → risultati appaiono
- [ ] Filtri forma/categoria/anno: funzionanti, URL aggiornato
- [ ] URL routing: back/forward browser mantiene query e filtri
- [ ] Pre-popolamento da `?q=` (passaggio da autocomplete header)
- [ ] Paginazione risultati
- [ ] Nessun risultato: messaggio appropriato

### Pagine statiche
- [ ] `/chi-siamo/`: redazione, contatti, tutte le sezioni visibili
- [ ] `/sostienici`: CTA, info donazione
- [ ] `/newsletter`: form iscrizione funzionante
- [ ] EN `/en/about/`, `/en/support-us/`, `/en/newsletter/`: verificare

### Accessibility (campione)
- [ ] Focus visibile su tutti gli elementi interattivi (link, bottoni, input)
- [ ] Navigazione tastiera: Tab attraversa header, nav, form, footer in ordine logico
- [ ] Aria-labels su elementi senza testo visibile (icon links social, menu hamburger)
- [ ] Contrasto testo: leggibile su tutti i background (bianco, crema, card)
- [ ] `lang` attribute corretto su `<html>` (it/en in base alla pagina)
- [ ] Immagini: `alt` significativo o `alt=""` se decorative

---

## § Validazione backend pre-lancio

Checklist sistematica da eseguire prima del cutover DNS. Per ogni item: metodo di verifica indicato.

### HTTP Status & redirect

- [ ] **Homepage** `curl -I https://ombreeluci-staging.pages.dev/` → 200
- [ ] **Articolo IT** `curl -I https://ombreeluci-staging.pages.dev/it/storia-di-un-padre/` → 200
- [ ] **Articolo EN** `curl -I https://ombreeluci-staging.pages.dev/en/the-dandelion-project/` → 200
- [ ] **Redirect /blog/** `curl -I https://ombreeluci-staging.pages.dev/blog/storia-di-un-padre/` → 301 verso `/it/storia-di-un-padre/`
- [ ] **Redirect date-based** `curl -I https://ombreeluci-staging.pages.dev/2015/03/12/some-slug/` → 301
- [ ] **Redirect /dona** `curl -I https://ombreeluci-staging.pages.dev/dona` → 301 verso `/sostienici`
- [ ] **Articolo inesistente** `curl -I https://ombreeluci-staging.pages.dev/it/slug-che-non-esiste/` → 404
- [ ] **Tag EN** `curl -I https://ombreeluci-staging.pages.dev/en/tag/disability/` → 200 o 404 se non esiste
- [ ] **Categoria EN senza articoli** → 302 verso `/en/` (non 404)

### Canonical e hreflang

- [ ] **Articolo IT**: `<link rel="canonical">` punta a `https://ombreeluci.it/it/{slug}/` (non localhost, non staging)
- [ ] **Articolo IT**: `<link rel="alternate" hreflang="en">` punta all'URL EN corrispondente
- [ ] **Articolo IT**: `<link rel="alternate" hreflang="x-default">` punta all'IT
- [ ] **Articolo EN**: canonical punta a `https://ombreeluci.it/en/{slug}/`
- [ ] **Homepage**: canonical `https://ombreeluci.it/`, hreflang it + en + x-default
- `curl -s https://ombreeluci-staging.pages.dev/it/storia-di-un-padre/ | grep -E 'canonical|hreflang'`

### robots.txt — AZIONE PRE-LANCIO CRITICA

- [ ] **PRIMA del cutover**: sostituire `Disallow: /` con regole permissive (vedi testo in `public/robots.txt`)
- [ ] **Formato finale**:
  ```
  User-agent: *
  Disallow: /api/
  Disallow: /debug/
  Disallow: /test-*
  Sitemap: https://ombreeluci.it/sitemap.xml
  ```
- [ ] Verificare dopo deploy: `curl https://ombreeluci.it/robots.txt`

### noindex sweep — ⚠️ ULTIMA AZIONE PRIMA DEL CUTOVER DNS — NON PRIMA

**REGOLA ASSOLUTA: non toccare `noindex` finché il sito è su staging.**
Rimuovere il `noindex` con il sito ancora su staging = Google indicizza staging.ombreeluci.pages.dev invece di ombreeluci.it.
Questo sweep si fa in un commit dedicato, immediatamente prima del cambio DNS, contestualmente all'apertura di `robots.txt`.

Sequenza corretta al cutover:
1. TTL DNS abbassato (24h prima)
2. Build finale pulita
3. **Commit noindex sweep** (questo)
4. **Commit robots.txt aperto**
5. Deploy su CF Pages
6. Cambio record DNS → ombreeluci.it
7. Verifica in GSC entro 24h

Pagine da cui rimuovere `noindex={true}`:

- [ ] `src/pages/index.astro` (homepage IT)
- [ ] `src/pages/it/[slug].astro` (articoli IT — BLOCCANTE SEO)
- [ ] `src/pages/categoria/[categoria].astro`
- [ ] `src/pages/archivio/index.astro`
- [ ] `src/pages/archivio/[issue].astro`
- [ ] `src/pages/archivio/web-only.astro`
- [ ] `src/pages/autori/index.astro`
- [ ] `src/pages/autori/[slug].astro`
- [ ] `src/pages/rubriche/[rubrica].astro`
- [ ] `src/pages/rubriche/diari.astro`
- [ ] `src/pages/tag/[slug].astro`
- [ ] `src/pages/diari/[diario].astro`
- [ ] `src/pages/chi-siamo/index.astro`
- [ ] `src/pages/sostienici.astro` (se esiste)
- [ ] `src/pages/newsletter.astro`
- [ ] `src/pages/en/index.astro`
- [ ] `src/pages/en/category/[slug].astro`
- [ ] `src/pages/en/sections/[slug].astro`
- [ ] `src/pages/en/sections/diaries.astro`
- [ ] `src/pages/en/archive/index.astro`
- [ ] `src/pages/en/archive/[issue].astro`
- [ ] `src/pages/en/archive/web-only.astro`
- [ ] `src/pages/en/authors/index.astro`
- [ ] `src/pages/en/diaries/[diario].astro`
- [ ] `src/pages/en/about/index.astro`
- [ ] `src/pages/en/newsletter/index.astro`

Pagine che devono restare `noindex=true`:
- `src/pages/404.astro`
- `src/pages/cerca.astro` e `src/pages/en/search/index.astro`
- `src/pages/en/tag/[slug].astro` (decide redazione — contenuto duplicato potenziale)
- Tutto sotto `src/pages/debug/` e `src/pages/test-*.astro`
- Pagine chi-siamo sottopagine: `la-redazione.astro`, `redazione-storica.astro`, ecc. (già reindirizzate da astro.config.mjs)

### Sitemap

- [ ] `curl https://ombreeluci-staging.pages.dev/sitemap.xml` → XML valido
- [ ] Sitemap contiene articoli IT (verificare campione slug)
- [ ] Sitemap NON contiene URL staging (tutte le URL puntano a `ombreeluci.it`)
- [ ] Registrare sitemap in Google Search Console dopo il cutover: `https://ombreeluci.it/sitemap.xml`
- [ ] **Gap**: sitemap attuale non include articoli EN, numeri archivio, pagine autore → aggiornare `sitemap.xml.ts` (B-16)

### Performance (campione)

- [ ] **Placeholder copertina** (4.2MB) — `curl -I https://pub-...r2.dev/images/placeholder-copertina.svg` → verificare dimensione. PF-01 da chiudere.
- [ ] **Cache-Control R2** — `curl -I https://pub-...r2.dev/copertine/{uuid}.jpg` → header `Cache-Control` presente con `max-age`. PF-02 da chiudere.
- [ ] **LCP articolo** — Chrome DevTools Lighthouse su articolo IT → LCP <2.5s su connection fast 4G
- [ ] **CLS** — Cumulative Layout Shift <0.1 su homepage e articolo

### Security headers

- [ ] `curl -I https://ombreeluci-staging.pages.dev/` → verificare presenza di:
  - `X-Frame-Options: DENY` (o CSP `frame-ancestors 'none'`)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy`
  - Se assenti: aggiungere via Cloudflare Transform Rules o `_headers` file in `public/`

### API e form

- [ ] **Form commento**: inviare commento di test su articolo staging → risposta JSON `{ ok: true }` o errore leggibile
- [ ] **Honeypot commento**: compilare campo `hp` nascosto → commento NON inviato (stato: implementato, da testare)
- [ ] **API /api/revalidate**: endpoint presente (`src/pages/api/revalidate.ts`) — verificare che richieda auth token
- [ ] **Webhook Algolia** (ALGOLIA-05, non ancora implementato): quando implementato, test: pubblica articolo → appare in ricerca entro 60s

### Broken links (campione)

- [ ] Navigare le 10 pagine più trafficate (homepage, 5 articoli top, 2 categorie, archivio, chi-siamo) → nessun link 404
- [ ] Strumento: usare [Broken Link Checker](https://www.brokenlinkcheck.com/) o `wget --spider -r --no-verbose -l 2`

### Directus CMS

- [ ] Login con account Redazione UAT → può creare articolo, modificare, pubblicare
- [ ] Login con account Redazione UAT → NON può vedere menu admin (utenti, permessi, ecc.)
- [ ] **Eliminare account UAT prima del go-live**: `redazione-uat@ombreeluci.it` (UAT-CLEANUP)
- [ ] Immagini R2: upload copertina → appare nel sito entro build o SSR

### DNS cutover checklist finale

- [ ] robots.txt aperto (Disallow: /)
- [ ] noindex rimosso da pagine indicizzabili
- [ ] Analytics attivi (almeno CF Web Analytics)
- [ ] Sitemap registrata in Search Console
- [ ] UptimeRobot configurato (B-09)
- [ ] DNS propagato (TTL basso impostato in anticipo)
- [ ] Test su URL produzione: home, articolo, categoria, cerca

---

## § Redirect pre-lancio

### Stato implementazione redirect (verificato 2026-04-27)

**Layer 1 — `astro.config.mjs` (redirect statici Astro)**

6 redirect hardcoded:
- `/dona` → `/sostienici`
- `/contribuisci` → `/sostienici`
- `/about` → `/chi-siamo`
- `/chi-siamo/la-rivista` → `/chi-siamo#la-rivista`
- `/chi-siamo/la-redazione` → `/chi-siamo#la-redazione`
- `/chi-siamo/redazione-storica` → `/chi-siamo#redazione-storica`
- `/chi-siamo/collaboratori` → `/chi-siamo#collaboratori`
- `/chi-siamo/hanno-scritto-per-noi` → `/chi-siamo#hanno-scritto-per-noi`
- `/chi-siamo/contatti` → `/chi-siamo#contatti`
- `/blog/en` → `/en/`

**Layer 2 — `src/middleware.ts` (redirect pattern)**

| Pattern | Target | Note |
|---------|--------|-------|
| `/blog/{slug}-en/` | `/en/{slug}/` 301 | Articoli EN vecchi URL |
| `/diario-di-{*}/` | `/diari/diario-di-{*}/` 301 | Backward compat diari |
| `/blog/{slug}/` | `/it/{slug}/` 301 | Articoli IT WP |
| chiavi in `redirects-legacy.json` | `https://ombreeluci.it{target}` 301 | Slug WP anomali |
| `/YYYY/MM/DD/{slug}/` | `https://ombreeluci.it/it/{slug}` 301 | Date-based WP URLs |
| `/YYYY/MM/{slug}/` | `https://ombreeluci.it/it/{slug}` 301 | Year-month WP URLs |

⚠️ **Bug noto**: i redirect `REDIRECTS[path]` e date-based usano `https://ombreeluci.it` come prefisso hardcoded. Su staging questo genera redirect a produzione (non a staging). In produzione funziona correttamente. Non blocca il lancio ma da tenere presente per debug su staging.

**Layer 3 — `src/data/redirects-legacy.json`**

1001 voci di redirect specifici per slug WP problematici (slug troncati, caratteri speciali, alias, etc.). Copertura verificata: ✅ presente e attivo.

### Pattern WP mancanti — da valutare

| Pattern URL WP | Stato | Priorità |
|----------------|-------|----------|
| `/?p={ID}` (link per ID WordPress) | ❌ Non gestito | Alta — link in email/newsletter puntano qui |
| `/author/{slug}/` (tassonomia WP author) | ❌ Non gestito | Media — link SEO WP |
| `/category/{slug}/` (tassonomia WP category) | ❌ Non gestito | Media |
| `/tag/{wp-slug}/` (tassonomia WP tag) | ❌ Non gestito | Bassa |
| `/?s={query}` (ricerca WP) | ❌ Non gestito | Bassa — redirigere a `/cerca/` |
| `/feed/` e `/feed/rss/` | ❌ Non gestito | Bassa — 410 o feed Astro |
| `/wp-content/uploads/` | ❌ Non gestito | Media — immagini WP ancora linkate nei corpo articoli |
| `/wp-json/` | ❌ Non gestito | Bassa — 404 ok |
| `/?attachment_id={ID}` | ❌ Non gestito | Bassa |

**Azione raccomandata pre-lancio**: aggiungere al middleware almeno il pattern `/?p={ID}` (redirect a homepage o /cerca/?q={ID}) per non rompere link in email archiviate. Gli altri possono essere post-lancio.

### Stato `/blog/*` generale

✅ Confermato in STATO.md: redirect 301 da `/blog/{slug}` → `/it/{slug}/` funzionante su staging.

---

## § SEO — stato e checklist

### Implementato ✅

| Elemento | File | Dettaglio |
|----------|------|-----------|
| `<title>` dinamico | `BaseHead.astro` | `{titolo} – Ombre e Luci`, homepage usa titolo completo |
| `<meta description>` | `BaseHead.astro` | Dinamica per pagina |
| `<link rel="canonical">` | `BaseHead.astro` | URL assoluto, usa `Astro.site` per evitare localhost |
| Open Graph (og:title, og:description, og:image, og:type, og:url, og:locale) | `BaseHead.astro` | Completo |
| Twitter Card (summary_large_image) | `BaseHead.astro` | Completo |
| hreflang IT/EN + x-default | `BaseHead.astro` | URL assoluti (fix `6aab9c44`) |
| Google Site Verification | `BaseHead.astro` | Token presente |
| JSON-LD Article schema | `it/[slug].astro` | headline, description, image, datePublished, author, publisher, isPartOf |
| JSON-LD BreadcrumbList | `it/[slug].astro` | 2-3 livelli |
| `<meta robots>` (noindex) | `BaseHead.astro` | Solo quando `noindex=true` |
| Sitemap XML | `src/pages/sitemap.xml.ts` | Prerender, include IT articles + static + categorie + rubriche |
| robots.txt | `public/robots.txt` | Blocca tutto pre-lancio (da aprire al cutover) |
| `pagefind` integration | `astro.config.mjs` | Indicizzazione full-text client-side (usato da Algolia — verify se ancora necessario) |

### Mancante / da fare prima del lancio 🔴

| Elemento | Priorità | Note |
|----------|----------|-------|
| **noindex SWEEP** | 🔴 Bloccante | Quasi tutte le pagine hanno `noindex={true}` — rimuovere prima del lancio. Vedi B-15 e § Validazione backend. |
| **robots.txt aperto** | 🔴 Bloccante | `Disallow: /` → cambiare prima del cutover |
| **Sitemap completa** | 🔴 Alta | Mancano: articoli EN, numeri archivio `/archivio/oel-*/`, pagine autori `/autori/*/`. Aggiornare `sitemap.xml.ts`. |
| **Search Console** | 🔴 Alta | Registrare la sitemap in GSC entro 24h dal cutover |
| **JSON-LD mancante su EN** | 🟡 Media | `en/[slug].astro` non è stato verificato — controllare se ha JSON-LD Article |
| **JSON-LD su pagine lista** | 🟢 Bassa | Homepage, categoria, autore: aggiungere CollectionPage/WebSite schema |
| **Web Vitals tracking** | 🟡 Media | Nessun reporting LCP/CLS/FID attivo — cieco sulle performance reali |
| **`<meta robots>` per pagine EN indicizzabili** | 🟡 Media | `en/[slug].astro` ha `noindex={false}` ✅ ma verificare categoria/archivio EN |
| **Preconnect R2 / Google Fonts** | 🟢 Bassa | `BaseHead.astro` ha preconnect R2 — aggiungere fonts Google se usati |
| **Open Graph article:author, article:published_time** | 🟢 Bassa | Meta FB extra non bloccanti |
| **Favicon SVG/PNG** | ✅ | `public/favicon.svg`, `favicon.png`, `favicon.ico` presenti |

### Performance SEO

| Metrica | Stato attuale | Target |
|---------|--------------|--------|
| LCP | Non misurato (nessun analytics) | <2.5s |
| CLS | Non misurato | <0.1 |
| FCP | Non misurato | <1.8s |
| Placeholder copertina | 4.2MB (PF-01 aperto) | <100KB WebP |
| Cache-Control R2 | Assente (PF-02 aperto) | `max-age=31536000, immutable` |
| Font Raleway | Woff2 precaricato in `public/fonts/` | ✅ |

---

## § Analytics e monitoring

### Stato attuale (2026-04-27)

**Analytics: ZERO.** Nessuno script di analytics implementato nel codice sorgente. Il sito andrà online senza nessun dato di traffico se non si interviene prima del lancio.

Ricerca nel codebase: nessuna occorrenza di GTM, GA4, `gtag`, `_ga`, `plausible`, `fathom`, `matomo`, Cloudflare Web Analytics snippet, o qualsiasi altro tool di analytics.

### Opzioni e raccomandazione

| Opzione | Effort | Costo | Privacy | Raccomandazione |
|---------|--------|-------|---------|----------------|
| **Cloudflare Web Analytics** | XS (1 riga script) | Gratis | GDPR-friendly (no cookie, no PII) | ✅ **Minimo pre-lancio** |
| Google Analytics 4 via GTM | S (GTM container + GA4 property) | Gratis | Richiede cookie banner (Iubenda già presente) | Raccomandato per dati avanzati |
| Plausible / Fathom | S | ~9€/mese | GDPR-friendly, no cookie | Alternativa privacy-first a GA4 |

**Raccomandazione minima pre-lancio**: attivare Cloudflare Web Analytics — è già disponibile nell'account CF Pages, non richiede cookie banner perché non traccia PII. Aggiungere lo script in `BaseHead.astro`.

**Post-lancio**: aggiungere GA4 via GTM per funnel avanzati (eventi click, scroll depth, conversion CTA), test A/B copy CTA sostienici, audience per remarketing.

### Metriche da monitorare post-lancio

**Traffico e acquisizione**
- Sessioni/giorno per lingua (IT vs EN)
- Canali: organico (SEO), social, diretto, referral
- Query di ricerca Google (Search Console) — top 20 query entro 30gg
- CTR e position media su Search Console

**Engagement**
- Bounce rate per tipo pagina (homepage, articolo, categoria)
- Scroll depth sugli articoli (% che legge oltre il 50%)
- Tempo medio su pagina articolo
- Click su "Leggi anche" in-content

**Conversioni**
- Click su CTA Sostienici (se implementato GTM event)
- Iscrizioni newsletter
- Condivisioni social (FB, X, WhatsApp)
- Click su link archivio PDF rivista

**Performance tecnica**
- Core Web Vitals (LCP, CLS, FID) via Search Console → Esperienza pagina
- Errori 404 (Search Console → Copertura)
- Tempo risposta SSR articoli (CF Analytics → Worker metrics)

**Algolia**
- Ricerche/mese (piano Build: 10k limite)
- Query più cercate → gap contenuto
- Click-through rate risultati ricerca

### Azioni pre-lancio B-17

1. Aprire Cloudflare Dashboard → Pages → ombreeluci → Web Analytics → attivare
2. Copiare lo snippet JS in `BaseHead.astro` prima del `</head>`
3. Creare property GA4 su Google Analytics → ottenere Measurement ID `G-XXXXXXX`
4. Creare container GTM → pubblicare → aggiungere script GTM in `BaseHead.astro`
5. Collegare GA4 come tag in GTM
6. Creare account Google Search Console → verificare tramite meta tag già presente (`CHp0QtH-...`)
7. Inviare sitemap: `https://ombreeluci.it/sitemap.xml`

---

## § Piano validazione IT/EN prima di ES

Dichiarare "EN è production-ready" prima di aprire il cantiere spagnolo. Checklist sistematica.

### 1. Copertura contenuti

- [ ] **Query Directus**: `GET /items/articoli?filter[lang][_eq]=en&aggregate[count]=id&filter[stato][_eq]=published`
  - Attuale: 3470 EN published (2026-04-25)
  - IT published: verificare con stessa query (`lang=it`)
  - Calcolare: `% copertura = EN_published / IT_published * 100`
  - Soglia accettabile: ≥ 95%
- [ ] **Articoli IT senza traduzione EN**: `GET /items/articoli?filter[lang][_eq]=it&filter[articolo_traduzione][_null]=true`
  - Da cui si ottiene la lista degli IT orfani — decidere se blocca il lancio EN

### 2. Qualità campione (controllo manuale)

Protocollo: estrarre 30 articoli EN random (min 3 per categoria, min 5 recenti post-2020, min 5 archivio pre-2000).

Per ogni articolo campione verificare:
- [ ] Traduzione comprensibile e scorrevole (non machine-literal)
- [ ] Titolo EN significativo (non calco italiano)
- [ ] Nomi propri non tradotti (es. "Jean Vanier" non "Giovanni Vanier")
- [ ] Citazioni: mantenute in lingua originale o tradotte correttamente
- [ ] Nessun testo italiano residuo nel corpo
- [ ] Lunghezza appropriata rispetto all'IT (non troncata)

### 3. Route coverage IT → EN

| Route IT | Route EN | Stato |
|----------|----------|-------|
| `/` | `/en/` | ✅ |
| `/it/{slug}/` | `/en/{slug}/` | ✅ (lookup a due tentativi) |
| `/categoria/{slug}/` | `/en/category/{slug}/` | ✅ |
| `/rubriche/{slug}/` | `/en/sections/{slug}/` | ✅ |
| `/archivio/` | `/en/archive/` | ✅ |
| `/archivio/{issue}/` | `/en/archive/{issue}/` | ✅ |
| `/autori/` | `/en/authors/` | ✅ |
| `/autori/{slug}/` | `/en/authors/{slug}/` | ✅ |
| `/tag/{slug}/` | `/en/tag/{slug}/` | ✅ |
| `/cerca/` | `/en/search/` | ✅ |
| `/diari/{slug}/` | `/en/diaries/{slug}/` | ✅ |
| `/chi-siamo/` | `/en/about/` | ✅ |
| `/sostienici` | `/en/support-us/` | ✅ |
| `/newsletter` | `/en/newsletter/` | ✅ |

- [ ] Test automatico: script che curla ogni route EN del campione → 0 risposte 404

### 4. Language switch

- [ ] Ogni articolo IT ha link funzionante verso l'EN (o homepage EN se non tradotto)
- [ ] Ogni articolo EN ha link funzionante verso l'IT
- [ ] Verificare su almeno 10 articoli campione su staging
- [ ] I 18 orfani EN (senza `articolo_traduzione` valorizzato) → language switch porta a homepage IT

### 5. SEO EN

- [ ] hreflang su articoli EN: `<link rel="alternate" hreflang="it">` punta all'IT corretto
- [ ] hreflang su articoli EN: `<link rel="alternate" hreflang="en">` punta a sé stesso
- [ ] Canonical articolo EN: punta a `https://ombreeluci.it/en/{slug}/`
- [ ] I 42 articoli con suffisso `-en` nel slug DB: la route li serve a URL pulito `/en/{slug-senza-en}/` — verificare canonical corretto
- [ ] Sitemap include articoli EN (da aggiungere — B-16)

### 6. Categorie e tag EN

- [ ] Ogni categoria IT ha la controparte EN funzionante
- [ ] `curl https://ombreeluci-staging.pages.dev/en/category/family/` → 200 con articoli
- [ ] Tag EN: verificare che `/en/tag/{slug}/` mostri solo articoli EN
- [ ] `categoria_menu` NULL (34 articoli): non mostrano categoria in pagina — accettabile

### 7. Edge cases

- [ ] Articolo IT senza traduzione EN: language switch → homepage EN (non 404) ✅ già implementato
- [ ] Articolo EN slug con `-en`: URL `/en/storia-di-un-padre/` funziona (senza `-en`) ✅ lookup
- [ ] Articolo EN con `categoria_menu=NULL`: mostra "Pubblicato online" invece di categoria
- [ ] Bio autore su articolo EN: mostra `bio_en` se disponibile; `bio_html` IT come fallback ⚠️ (BIO-EN-ART non ancora implementato)

### 8. Criteri di "done EN"

| Criterio | Soglia | Come verificare |
|----------|--------|----------------|
| Copertura articoli | ≥ 95% IT tradotti | Query Directus count |
| Route 404 | 0 route EN con 404 | Script curl campione |
| Qualità campione | ≥ 27/30 articoli giudicati "accettabili" | Revisione manuale redazione |
| Language switch | 100% funzionante (o fallback corretto) | Test manuale 10 pagine |
| hreflang corretto | 0 errori in GSC → Esperienza URL | Google Search Console |
| Algolia EN | Risultati EN mostrati correttamente su `/en/search/` | Test manuale |

---

## § Directus — stato e piano ottimizzazione

### a) Flusso editoriale target (stato da raggiungere)

**Principio**: la redazione lavora SOLO in italiano. Le traduzioni sono generate automaticamente.

```
Redazione → crea/pubblica articolo IT in Directus
       ↓
Webhook Directus → trigger pipeline AI
       ↓
Claude API → traduce: corpo, titolo, sottotitolo, didascalie, bio autore
       ↓
Directus API → crea/aggiorna articolo EN linked (articolo_traduzione)
       ↓
Build Astro (SSR) → serve /en/{slug}/ automaticamente
       ↓
Algolia webhook → aggiorna indice (da implementare: ALGOLIA-05)
```

**Gap rispetto allo stato attuale**:

| Componente | Stato attuale | Gap |
|-----------|--------------|-----|
| Pipeline AI IT→EN corpus | ✅ Completata (3470 articoli) | Solo batch manuale, non automatica |
| Webhook Directus→Pipeline | ❌ Non implementato | Da creare (flow Directus o CF Worker) |
| Traduzione automatica nuovi articoli | ❌ Non attivo | Prerequisito: webhook |
| Webhook Directus→Algolia | ❌ Non implementato (ALGOLIA-05) | Da creare |
| Traduzione didascalie foto (`didascalia_en`) | ❌ Campo non esiste in Directus | Da aggiungere schema |
| Traduzione bio autori (`bio_en`) | 🟡 Campo esiste, non sempre popolato | Pipeline AI deve coprire anche bio |
| Traduzione nomi tag (`nome_en`, `slug_en`) | ❌ Campi non esistono in Directus | Da aggiungere schema |
| Traduzione ES/FR | ❌ Non avviato | Dopo chiusura EN |

### b) Audit interfaccia Directus — da fare

**Collection `articoli`** — verificare con account Redazione:
- [ ] Campi visibili al ruolo Redazione: titolo, sottotitolo, corpo, autore, categoria_menu, numero_rivista, tags, immagine_copertina, didascalia_copertina, stato, data_pubblicazione
- [ ] Campi nascosti al ruolo Redazione: id, slug, lang, wp_id, articolo_traduzione, seo_description (o visibile ma non modificabile)
- [ ] Campo `corpo` WYSIWYG: funziona correttamente? Upload immagini inline? Paste da Word?
- [ ] Campo `immagine_copertina`: upload su R2 funzionante?
- [ ] Campo `tags`: interfaccia M2M funzionante? Può creare nuovi tag?
- [ ] Campo `numero_rivista`: dropdown con numeri rivista funzionante?

**Form creazione nuovo numero OEL**:
- [ ] Creare OEL-173 da account Redazione: tutti i campi presenti (id_numero, data, copertina, sommario, pdf_archive_url)?
- [ ] Dopo creazione: `/archivio/oel-173/` funzionante su staging?

**Flows / Presets Directus**:
- [ ] Verificare se esistono Flow configurati: Directus → Settings → Flows
- [ ] Verificare se esistono Presets (viste salvate): Directus → Settings → Presets
- [ ] Verificare Panels (dashboard) eventualmente configurati

**Permessi ruolo Redazione**:
- [ ] Può pubblicare articolo (`stato: published`)
- [ ] NON può modificare articoli EN (o può? Decidere policy)
- [ ] NON può vedere lista utenti / altri account
- [ ] NON può modificare settings sistema

### c) Gap da colmare prima del lancio

| Gap | Priorità | Note |
|-----|----------|-------|
| Eliminare account UAT `redazione-uat@ombreeluci.it` | 🔴 Bloccante | UAT-CLEANUP in backlog |
| Verificare permessi ruolo Redazione (T1/T2/T3 — B-06) | 🔴 Bloccante | UAT da eseguire prima del lancio |
| Schema `didascalia_en` in Directus | 🟡 Post-lancio | Non blocca ma gap qualità EN |
| Schema `nome_en`, `slug_en` su collection `tags` | 🟡 Post-lancio | Blocca display tag su articoli EN |
| Webhook pipeline AI automatica | 🟡 Post-lancio | Necessario per nuovi articoli EN |
| ALGOLIA-05 webhook sync | 🔴 Pre-lancio | In backlog, da fare prima del go-live |

### d) Flusso redazione post-lancio (stato target operativo)

1. Redazione crea articolo IT in Directus, compila tutti i campi, pubblica
2. Webhook → pipeline Claude API → genera EN entro 5-10 minuti
3. Articolo EN appare su `/en/{slug}/` senza intervento tecnico
4. Webhook → Algolia update → appare nella ricerca EN
5. La redazione può aprire l'articolo EN in Directus e correggere manualmente se necessario
6. Per ES/FR in futuro: aggiungere lingua al webhook payload — zero modifiche al frontend

---

## § Commenti — stato implementazione

### Stato: IMPLEMENTATO ✅

Il sistema commenti è completamente implementato. Componente: `src/components/Commenti.astro`. API endpoint: `src/pages/api/commento.ts`.

### Funzionalità presenti

| Feature | Stato |
|---------|-------|
| Visualizzazione commenti approvati | ✅ Lista ordinata con autore, data, testo |
| Form invio commento (nome, email, testo) | ✅ |
| Honeypot anti-spam (campo `hp` nascosto) | ✅ |
| Moderazione (commento → approvazione redazione prima della pubblicazione) | ✅ (stato `approvato` in Directus) |
| Multilingua: heading e UI in IT/EN | ✅ |
| Contatore caratteri textarea (avviso <500 caratteri) | ✅ |
| Feedback visivo successo/errore | ✅ |
| Accessibilità: `aria-live`, `role="alert"` | ✅ |

### Gap e considerazioni

| Item | Stato |
|------|-------|
| Notifica email alla redazione quando arriva un commento | ❌ Non implementato — aggiungere Flow Directus (email) o webhook |
| Sistema anti-spam avanzato (reCAPTCHA, rate limiting) | 🟡 Solo honeypot — sufficiente per ora |
| Reply/thread commenti | ❌ Non implementato (flat list) — post-lancio se richiesto |
| Commenti per lingua: un commento su articolo IT è visibile su EN? | ❓ Da decidere — attualmente `articolo_id` è comune. I commenti IT compaiono anche su EN se stessa pagina. Probabile non è un problema nella pratica (IT e EN hanno slug diversi = pagine diverse = componente separato). |
| Rate limiting sull'API `/api/commento` | ❌ Non implementato — vulnerabile a spam automatico se honeypot bypassato |
| Verifica email autore | ❌ Commento accettato con email qualsiasi — moderazione compensa |

### Architettura collection Directus (da verificare)

Verificare che esista in Directus la collection `commenti` con campi:
- `id`, `articolo_id` (relation a `articoli`), `autore_nome`, `autore_email`, `testo`, `data_creazione`, `stato` (draft/approvato)
- Permesso pubblico: solo GET su commenti `stato=approvato`; POST per creazione (senza auth)

---

## § ARCH-02 — Archivio: split Ultimo numero / Tutti i numeri

**Backlog post-lancio. Effort: M.**

### Problema

La pagina `/archivio/` (e `/en/archive/`) mostra tutti i numeri in lista flat. L'UX ideale (ispirazione: vita.it/riviste/) prevede:
- **Tab/sezione "Ultimo numero"**: hero con copertina grande, sommario, link agli articoli del numero
- **Tab/sezione "Tutti i numeri"**: griglia dei numeri precedenti con miniatura copertina, anno, numero

### Architettura proposta

**Nessuna nuova route necessaria.** Estendere `src/components/ArchivioContent.astro`.

1. Il componente riceve tutti i numeri da Directus (già disponibili)
2. Separa l'array: `[0]` = ultimo numero, `[1..]` = archivio storico
3. Aggiunge state client-side (`activeTab: 'latest' | 'all'`) gestito con `<script is:inline>`
4. Rendering condizionale via CSS: `.tab-panel[data-tab="latest"]` e `.tab-panel[data-tab="all"]`
5. URL: il tab attivo non modifica l'URL (non serve route separata) — opzionale: `?tab=all` per deep link

**Campi necessari in Directus** (già presenti):
- `id_numero`, `data`, `copertina` (image ID), `sommario` (HTML), `pdf_archive_url`

**Step di implementazione**:
1. Aggiornare `ArchivioContent.astro`: split array, aggiungere tab UI
2. CSS: tab bar con indicatore attivo, hero per ultimo numero, griglia compatta per storico
3. Script: toggle tab, persistenza in `sessionStorage` (opzionale)
4. Test: mobile + desktop + accessibilità tab (focus, aria-selected)

---

## § GR-CTA — CTA "Sostienici" in fondo agli articoli

**Backlog post-lancio. Effort: M.**

### Specifiche

**Posizione**: in fondo a ogni articolo, dopo la bio autore e prima dei correlati. Anche su pagine chiave: chi-siamo, archivio.

**Copy**: almeno 5-6 varianti da ruotare. Tono editoriale di riferimento: ilpost.it (diretto, senza retorica), vita.it (missione sociale). Non usare frasi generiche tipo "supporta il nostro lavoro".

Varianti di partenza (da affinare con la redazione):
1. "Dal 1983 scriviamo di fragilità e dignità. Continuiamo solo grazie a chi ci sostiene."
2. "Ombre e Luci è una rivista indipendente. Non abbiamo azionisti, solo lettori."
3. "Questo articolo è gratuito. Se ti ha dato qualcosa, aiutaci a scriverne altri."
4. "La rivista che tieni in mano esiste da 40 anni. Aiutaci ad arrivare a 80."
5. "Nessuno sponsor, nessuna pubblicità. Solo lettori che credono in quello che facciamo."
6. "Un abbonamento è il modo più diretto per dirci che vale la pena continuare."

**Gestione contenuti**: collection separata in Directus `cta_sostieni` con campi `testo` (string) + `attivo` (boolean). La redazione può modificare i copy senza deploy. Il componente in Astro fa fetch a build-time (prerender) o SSR e seleziona una variante.

**Tracking**:
- Ogni variante ha un `id` o slug (es. `cta-1`, `cta-2`)
- Click sul bottone → GTM custom event `cta_click` con label = id variante
- Parametro UTM sull'URL sostienici: `/sostienici?utm_source=articolo&utm_medium=cta&utm_campaign={id_variante}`
- Dashboard GA4: conversionrate per variante → ottimizzazione copy

**A/B test**: con GTM si può fare A/B senza deploy — esperimento server-side o client-side.

**Step di implementazione**:
1. Creare collection `cta_sostieni` in Directus (testo, attivo, slug)
2. Creare componente `src/components/CTASostienici.astro` con fetch Directus
3. Inserire il componente in `it/[slug].astro` e `en/[slug].astro` dopo la bio autore
4. Aggiungere GTM event click
5. Test su mobile (CTA non deve intralciare lettura)
