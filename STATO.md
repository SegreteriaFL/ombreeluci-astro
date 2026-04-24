# STATO — Ombre e Luci

**Ultimo aggiornamento:** 2026-04-24 (fix routing, basePath, categoryLink EN)
**Staging:** https://ombreeluci-staging.pages.dev
**CMS:** https://cms.ombreeluci.it
**Repo:** SegreteriaFL/ombreeluci-astro

---

## Stato attuale verificato (2026-04-24)

| Verifica | Esito |
|----------|-------|
| Home staging | ✅ 200 |
| Articolo IT `/{slug}/` | ✅ 200 (verificato `/la-nostra-buona-novella/`) |
| Articolo EN `/en/il-progetto-dandelion/` | ✅ 200, SSR, Cache-Control corretto |
| Redirect `/blog/*-en/` → `/en/*/` | ✅ 301 |
| Pagina categoria `/categoria/testimonianze/` | ✅ 200 (fix `3e528a6c`) |
| Archivio numero `/archivio/oel-171/` | ✅ 200 (fix `3e528a6c`) |
| Pagina autore IT | ✅ 200 |
| Pagina cerca | ✅ 200 |
| i18n F0+F1+F2 su main | ✅ merge `a4b032f9` |
| Link articoli da categoria (no `//slug`) | ✅ fix `57100eff` |
| Badge categoria articolo EN → `/en/category/` | ✅ fix `d44594c8` |
| Redirect `/blog/*-en/` → `/en/*/` | ✅ 301 |
| Pagina autore IT | ✅ 200 |
| Pagina cerca | ✅ 200 |
| i18n F0+F1+F2 su main | ✅ merge `a4b032f9` |

Branch `feat/i18n-shell` è già mergeato. Lo smoke test SEO formale (Screaming Frog) non è ancora stato eseguito — è il prossimo step obbligatorio prima di procedere con qualsiasi altra cosa SEO-critica.

---

## Prossima azione immediata

**Smoke test SEO post-merge i18n** — eseguire il crawl Screaming Frog su staging per validare gate F2. Finché questo non è verde, nessun lavoro che tocca routing, canonical o hreflang.

Gate F2 da verificare:

| Criterio | Tool | Pass |
|----------|------|------|
| Zero redirect loop | Screaming Frog crawl staging | 0 loop |
| Catene redirect ≤ 1 hop | Screaming Frog | 0 catene > 1 hop |
| hreflang reciproco IT↔EN | Screaming Frog → tab Hreflang | 0 "missing return tag" |
| Canonical per lingua coerente | Screaming Frog → tab Canonical | 0 canonical lingua sbagliata |
| Sitemap EN presente | `curl .../sitemap-en.xml` | 200, URL `/en/` nel file |
| Nessun `/blog/*-en/` indicizzabile | Screaming Frog | 0 risultati (tutti 301) |

Curl di controllo rapido pre-Screaming Frog:
```bash
curl -sI https://ombreeluci-staging.pages.dev/blog/il-progetto-dandelion-en/
# atteso: 301 → /en/il-progetto-dandelion/

curl -sI https://ombreeluci-staging.pages.dev/en/il-progetto-dandelion/
# atteso: 200

curl -s https://ombreeluci-staging.pages.dev/sitemap-en.xml | head -5
# atteso: 200, URL /en/ nel file
```

---

## Blockers pre-lancio (cutover DNS)

Il cutover avviene quando tutti i blockers sono verdi. Ordinati per dipendenza logica.

| ID | Stato | Owner | Descrizione |
|----|-------|-------|-------------|
| B-01 | ✅ | — | Merge `feat/i18n-shell` su main |
| B-02 | ✅ | Dev | Smoke test SEO F2 — curl checks verdi; fix hreflang EN assoluto (`fix/hreflang-absolute-url`, merge `6aab9c44`) |
| B-03 | ✅ | — | CORS Directus già configurato in docker-compose.yml — verificato `Access-Control-Allow-Origin` + `Credentials: true` su staging |
| B-04 | ⏳ | Redazione | V-02: assegnare categoria ai 19 articoli "da-categorizzare" in Directus |
| B-05 | ✅ | Dev | URL-01: rimozione prefisso `/blog/` dagli URL articoli IT — merge su main, verificato su staging 2026-04-24. Curl: `/{slug}/`→200, `/blog/{slug}/`→301, `/YYYY/MM/DD/{slug}/`→301. |
| B-06 | ⏳ | Dev/Redazione | T1/T2/T3: validare workflow creazione numero OEL-173 + associazione articolo da account Redazione UAT |
| B-07 | ✅ | Dev | Keystatic dismesso 2026-04-24 — Worker `keystatic-oel` eliminato via `wrangler delete`. Verifica: `https://keystatic-oel.bold-firefly-5209.workers.dev/keystatic` → 404. |
| B-08 | ✅ | Dev | Copertine staging: tutte le immagini articolo usano `cms.ombreeluci.it/assets/{uuid}`, 200 verificato 2026-04-24. Nota: copertina rivista OEL-172 ancora su `wp-content/uploads` — dato Directus da verificare (non bloccante). |
| B-09 | ⏳ | Sysadmin | UptimeRobot: configurare monitor per `cms.ombreeluci.it/server/ping` (5 min) e `ombreeluci.it/` (10 min) |
| B-10 | ⏳ | Sysadmin | Slack alert build: aggiungere secret `SLACK_WEBHOOK_URL` su GitHub Actions |
| B-11 | ⏳ | Sysadmin | Iubenda: correggere `ownerName` da `"fedeeluce.it"` a `"ombreeluci.it"` sul pannello Iubenda prima del cutover |
| FIX-ROUTING | ✅ | Dev | Routes.json: exclude espliciti per pagine prerender dinamiche — commit `3e528a6c` |
| FIX-BASEPATH | ✅ | Dev | `basePath` default `''` in ArticleCard, ArticoliRullo, CategoriaPageContent — evita `//slug` — commit `57100eff` |
| FIX-BADGE-EN | ✅ | Dev | `categoryLink` lingua-aware in `[slug].astro`: EN → `/en/category/`, IT → `/categoria/` — commit `d44594c8` |

Dipendenze: B-04 sblocca B-12 (ruoli editoriali). B-03 dipende da CORS configurato sul server.

### Nota CSS — leak `is:global` ArticlePageLayout (caso documentato)

Durante B-05 si è manifestato un CSS leak dalla regola `is:global` in `src/layouts/ArticlePageLayout.astro`:
i selettori `.article-meta` (con `display:flex`, `justify-content:center`, `border-bottom`, `text-align:center`) e `.article-title` (con `letter-spacing:-0.02em`, `text-align:center`) fuoriuscivano dal layout articolo e applicavano stili errati ai componenti `ArticleCard` presenti nelle sezioni "Articoli correlati" all'interno della stessa pagina articolo.

Fix applicato: override scoped in `ArticleCard.astro` con `display:block`, `padding-bottom:0`, `border-bottom:none`, `text-align:left` e `letter-spacing:normal`.

Questo caso conferma la regola in CLAUDE.md: `is:global` in componenti condivisi richiede prefisso wrapper univoco su ogni selettore. Se si refactora `ArticlePageLayout`, tutti i selettori `.article-meta` e `.article-title` vanno prefissati con `.article-page-layout` o simile.

### Nota routing — _routes.json e catch-all SSR (caso documentato 2026-04-24)

Con `[...path].astro` catch-all SSR a root level, l'adapter Cloudflare genera `_routes.json` con `include: ["/*"]` ma inserisce nell'exclude automatico solo le pagine che conosce esplicitamente. Le route prerender dinamiche (`/categoria/*`, `/autori/*`, `/tag/*`, `/diari/*`, `/sezioni/*`, `/archivio/oel-*`, `/archivio/ins-*`) vanno aggiunte manualmente via `routes.extend.exclude` in `astro.config.mjs`.

Regola: ogni volta che si aggiunge una nuova route prerender dinamica, verificare che il suo pattern sia presente nell'exclude di `astro.config.mjs`. Senza questo, CF Pages manda le richieste al Worker SSR che risponde 404.

Fix applicato: commit `3e528a6c` — `astro.config.mjs` con extend.exclude completo.

### Nota auth — EditorialFeedback box e bottone (fix 2026-04-24)

`EditorialFeedback.astro`: box `#editorial-feedback-box` e bottone `#directus-edit-btn` erano visibili agli utenti anonimi. Fix in due parti:
1. Aggiunto `hidden` come attributo di default nel markup su entrambi gli elementi
2. JS mostra gli elementi solo se `fetch('/users/me')` risponde `r.ok` (200)

Causa del bug residuo sul bottone: `.directus-edit-btn { display: inline-flex }` nel CSS scoped batteva il `[hidden]` del browser (user-agent stylesheet ha specificità zero). Fix: aggiunto `[hidden] { display: none !important; }` in `global.css`.

### Nota infrastruttura — middleware Astro/CF Pages (caso documentato)

Il middleware Astro (`src/middleware.ts`) viene eseguito **solo per route presenti nel manifest**. Path come `/blog/slug/` o `/2018/02/19/slug/` che non corrispondono a nessuna pagina Astro bypassano il middleware e ottengono 404 direttamente.

Fix permanente: `src/pages/[...path].astro` catch-all SSR (solo `return new Response(null, {status:404})`). Garantisce che tutti i path abbiano una route nel manifest → middleware gira → redirect in `middleware.ts` funzionano.

**Regola:** ogni volta che si aggiunge una nuova categoria di redirect nel middleware (es. un nuovo prefisso di path non coperto da route esistenti), verificare che quel path abbia una route nel manifest. In caso contrario, il middleware non gira.

---

## Commit pendenti non pushati (da recuperare)

Questi fix sono stati scritti in sessione 2026-04-04 ma non committati. Vanno recuperati, committati su branch e mergeati:

| Fix | Impatto | Priorità |
|-----|---------|----------|
| Edit button: auth check `/users/me` invece di localStorage `?redazione=1` | Bottone modifica non funziona senza CORS (B-03) | 🔴 dopo B-03 |
| `display:none` su `.debug-section` in `blog/[...slug].astro` | Sezione debug visibile in produzione | 🟡 |
| Footer: aggiunto "Dialogo aperto" (`/sezioni/dialogo-aperto`) | Coerenza con megamenu | 🟡 |
| Homepage tagline: rimosso `<br>` e punto finale | Cosmetic | 🟢 |
| Homepage recenti: colonna destra da 3 a 6 articoli | UX | 🟢 |

---

## Backlog pre-lancio (non bloccanti ma da chiudere prima del go-live)

| ID | Priorità | Effort | Descrizione |
|----|----------|--------|-------------|
| B-12 | 🟡 | M | US-15: rivalutazione ruoli editoriali per categoria (dopo B-04) |
| VERT-01 | 🟡 | L | 8 pagine verticali WP da replicare con stesso slug: `mariangela-bertolini`, `autismo`, `cinema-e-disabilita`, `aktion-t4-sterminio-persone-disabilita`, `catechesi-e-disabilita`, `noi-papa-un-figlio-disabile`, `ciao-stefano-di-franco`, `studiosi-educatori-e-attivisti-ombre-e-luci` |
| AUT-01 | 🟡 | M | Pagine autore: filtro per lingua, componente condiviso `AuthorPageContent.astro`, route `/en/authors/[slug]` (vedi CONTENUTI.md) |
| LINK-01 | 🟡 | S | 7 link IT↔EN ambigui + 11 no-match da revisionare: `scripts/traduzione/logs/backfill_traduzione_link_20260408_231827.csv` |
| V-05 | 🟡 | S | 35 articoli Jean Vanier con `tema_label = null`: riassegnare categoria in Directus |
| DA-02 | 🟢 | S | 16 pull quote non reinserite: 11 articoli con posizione ambigua, da inserire a mano in Directus |
| UX-19 | 🟢 | S | Pagine test/debug pubbliche da rimuovere o proteggere: `test-lista.astro`, `test-minimal.astro`, `test-no-articles.astro`, `test-status.astro`, `debug/audit-editoriale.astro` |
| PF-01 | 🔴 | S | Placeholder copertina 4.2MB: ridimensionare a 400px + WebP/AVIF |
| PF-02 | 🔴 | S | Cache-Control assente su R2 (`r2.dev/copertine/*`, `r2.dev/corpo/*`): aggiungere `max-age=31536000, immutable` via CF Transform Rule |
| TAG-03 | 🟡 | S | Pagine `/tag/[slug]` e `/en/tag/[slug]` mostrano articoli IT e EN mescolati — aggiungere filtro `lang` alla query in `directus.ts`. Stessa soluzione di AUT-01. |

---

## Validazioni in attesa dalla Redazione

Richiedono occhio umano su staging. Non sono tecniche.

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

## Backlog post-lancio

| ID | Area | Descrizione |
|----|------|-------------|
| DA-03 | Infra | Upgrade VPS CX23 → CX32 (prerequisito per pgvector embeddings attivi) |
| DA-04 | AI | Ricerca semantica + correlati pgvector (dopo DA-03 e cutover) |
| DA-05 | Dati | 37 numeri rivista senza `pdf_archive_url`: scraping profilo Archive.org + PATCH Directus |
| DA-06 | Traduzioni | Pipeline traduzione AI IT→EN (~3265 articoli): bloccata fino a SEARCH-01 + AUT-01 stabili (vedi CONTENUTI.md) |
| TAG-01 | Frontend | Tag articoli non visibili nella pagina articolo (le route `/tag/[slug]` e `/en/tag/[slug]` esistono già) |
| GR-04 | Crescita | Google AdSense `ca-pub-2238371130141396` (dopo lancio, via GTM) |
| GR-05 | Crescita | Newsletter Mailchimp: form moderno senza Dojo (uuid `00c5dad63480d9601563b5692`) |
| GR-06 | Crescita | CTA dinamiche a fine articolo (rotazione abbonamento/donazione/newsletter) |
| GR-07 | Crescita | Pagina `/newsletter` dedicata |
| UX-07 | UX | Articolo su mobile: padding laterale, tipografia fluida, capolettera |
| UX-10 | UX | Selettore lingua: nascondere o disabilitare se non esiste traduzione dell'articolo |
| UX-11 | UX | Diari home su mobile: layout affollato a 2 colonne |
| PF-03 | Perf | Immagini non responsive: srcset mancante su ArticleCard, hero, LeggiAnche |
| PF-04 | Perf | CSS render-blocking: `_slug_.css` e `_diario_.css` bloccano rendering ~610ms |
| SEARCH-01 | Post-lancio | Ricerca Algolia — opzione A (Pagefind prerender) abbandonata: snapshot senza corpo (0/3527 articoli indicizzabili), 956 articoli mancanti da getStaticPaths, build 10-15min. Procedere con opzione B (Algolia free tier). Vedi CONTENUTI.md sezione Ricerca. |
| DA-06-ES | Traduzioni | Pipeline spagnolo: dopo chiusura e stabilizzazione EN |
| fedeeluce | Infra | Directus multi-tenant per fedeeluce.it sullo stesso VPS (costo: solo rinnovo dominio) |

---

## Pulizia tecnica da fare (non urgente ma non dimenticare)

| Cosa | Dove | Azione |
|------|------|--------|
| Branch locali morti | repo locale | Eliminare: `feat/arch-04-ssr`, `feat/articoli-rullo`, `feat/directus-migration`, `feat/i18n-master-plan`, `feat/seo-ux-improvements`, `hardening/resilience`, `master`, `safe/feat-i18n-align` |
| File legacy in `src/data/` | repo | Rimuovere o spostare in `_archive/`: `estrai_tutto.json`, `database_autori.csv`, `_legacy_articoli_megacluster.json`, `numeri_consolidati.json`, `media_articoli.csv` (tutti residui della fase pre-Directus) |
| `blog/en.astro` | `src/pages/blog/en.astro` | Verificare se è ancora referenziata o se può essere rimossa (indice EN ora su `/en/index.astro`) |

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
| R2 bucket | `oel-media` — pub URL: `pub-2251dc2142e3492a961f629f2af543d0.r2.dev` |
| Credenziali VPS | `vps_credentials.txt` (locale — non committare mai) |
| Utente Redazione UAT | `redazione-uat@ombreeluci.it` / `OmbreLuci2026!` — **eliminare prima del go-live** |
