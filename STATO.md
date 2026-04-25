# STATO — Ombre e Luci

**Ultimo aggiornamento:** 2026-04-25 (AUT-01 merged main — 60fcb27c; URL-IT-01 ✅; EN 3470 articoli published)
**Staging:** https://ombreeluci-staging.pages.dev
**CMS:** https://cms.ombreeluci.it
**Repo:** SegreteriaFL/ombreeluci-astro

---

## Stato attuale verificato (2026-04-25 — main, post-merge AUT-01 + URL-IT-01)

| Verifica | Esito |
|----------|-------|
| Home staging | ✅ 200 |
| Articolo IT `/it/{slug}/` | ✅ 200 |
| Articolo EN `/en/il-progetto-dandelion/` | ✅ 200, SSR, Cache-Control corretto |
| Redirect `/blog/*-en/` → `/en/*/` | ✅ 301 |
| Redirect `/blog/{slug}/` → `/{slug}/` | ✅ 301 |
| Pagina categoria IT | ✅ 200 |
| Pagina categoria EN `/en/category/family/` | ✅ 200 |
| Pagina autore IT `/autori/{slug}/` (filtro lang=it) | ✅ 200 |
| Pagina autore EN `/en/authors/{slug}/` | ✅ 200 (352 autori, curl verde) |
| Lista autori IT `/autori/` | ✅ 200 |
| Lista autori EN `/en/authors/` | ✅ 200 |
| Archivio numero `/archivio/oel-171/` | ✅ 200 |
| Pagina autore IT | ✅ 200 |
| Badge categoria articolo lingua-aware | ✅ |
| Link articoli da categoria (no `//slug`) | ✅ |
| Editorial box/bottone nascosti ad anonimi | ✅ |
| CORS Directus | ✅ |
| i18n F0+F1+F2 su main | ✅ merge `a4b032f9` |

---

## Prossima azione immediata

**HOME-EN** (`src/pages/en/index.astro`) — Homepage inglese `/en/`: stessa struttura della homepage IT, articoli EN in rotazione. AUT-01 completato e merged su main (60fcb27c). Bug aperti in parallelo: TAG-404, SLUG-CAT-EN, SWITCHER-CAT (vedi Backlog pre-lancio).

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

---

## Backlog pre-lancio

Tutto questo deve essere verde prima del cutover DNS.

| ID | Priorità | Effort | Descrizione |
|----|----------|--------|-------------|
| TAG-404 | 🔴 | S | Pagine `/tag/*` danno 404 — aggiungere `{ pattern: '/tag/*' }` a `astro.config.mjs` extend.exclude |
| SLUG-CAT-EN | 🔴 | M | Centralizzare mappatura slug categorie in `categorie.json`, rimuovere mappe hardcoded da `i18n.ts`. Aggiungere chiave `en_slug` per ogni categoria. Fix badge e switcher. Vedi CONTENUTI.md. |
| AUT-01 | ✅ | M | Pagine autore: route EN `/en/authors/[slug]`, componente condiviso `AuthorPageContent.astro`, filtro lang per lingua, bio_en in Directus. Build OK. Commit feat/aut-01-author-pages. |
| HOME-EN | 🔴 | M | Homepage EN `/en/`: stessa struttura della homepage IT. **Richiede estrazione `HomePageContent.astro` prima di creare la route EN.** |
| ARCH-EN | 🟡 | M | Archivio numeri: versione per lingua — `/archivio/oel-N/` IT, `/en/archive/oel-N/` EN. **Richiede estrazione `ArchivioContent.astro` + `IssueContent.astro` prima.** |
| DIARI-EN | 🟡 | M | Pagine diari: versione EN `/en/diaries/[diario]/` con articoli EN del diarista. **Richiede estrazione `DiariContent.astro` + `DiarioContent.astro` prima.** |
| TAG-03 | 🟡 | S | Pagine tag filtro lingua: `/tag/[slug]` solo IT, `/en/tag/[slug]` solo EN. |
| SEARCH-01 | 🟡 | L | Ricerca Algolia — indice `ombreeluci_articoli` creato, credenziali in `.env`. Script sync Directus→Algolia da scrivere. Vedi CONTENUTI.md sezione Ricerca. |
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
| TAG-01 | Frontend | Tag articoli non visibili nella pagina articolo |
| DIR-01 | Directus | Pannello "Articoli correlati" in Directus durante scrittura |
| DIR-02 | Directus | Suggerimenti AI durante scrittura (Claude API) — dopo DA-03+DA-04 |
| SEARCH-02 | Ricerca | Algolia avanzato: faceting, ranking, as-you-type (dopo SEARCH-01 stabile) |
| GR-04 | Crescita | Google AdSense (dopo lancio, via GTM) |
| GR-05 | Crescita | Newsletter Mailchimp form moderno |
| GR-06 | Crescita | CTA dinamiche a fine articolo |
| GR-07 | Crescita | Pagina `/newsletter` dedicata |
| UX-07 | UX | Articolo su mobile: padding, tipografia fluida, capolettera |
| UX-10 | UX | Selettore lingua: nascondere se non esiste traduzione |
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
| Mappe hardcoded `CAT_IT_TO_EN_SLUG` in `i18n.ts` | Rimuovere dopo SLUG-CAT-EN completato |

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
