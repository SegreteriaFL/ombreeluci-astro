# STATO — Ombre e Luci

**Ultimo aggiornamento:** 2026-05-04 (main — hero slider; ART-TYPO; numeri rivista live+SSR; homepage deduplicazione; Algolia fix post-test)
**Staging:** https://ombreeluci-staging.pages.dev
**CMS:** https://cms.ombreeluci.it
**Repo:** SegreteriaFL/ombreeluci-astro

---

## Stato attuale verificato (aggiornato 2026-05-04)

| Verifica | Esito |
|----------|-------|
| Home IT `/` | ✅ 200, SSG |
| Home EN `/en/` | ✅ 200, `HomePageContent.astro` |
| Articolo IT `/it/{slug}/` | ✅ 200 |
| Articolo EN `/en/{slug}/` | ✅ 200, SSR, lookup a due tentativi |
| Categoria IT `/it/categoria/famiglia/` | ✅ 200 (B-14: era `/categoria/`) |
| Categoria EN `/en/category/family/` | ✅ 200, redirect a /en/ se 0 articoli published |
| Autore IT `/it/autori/{slug}/` | ✅ 200 (B-14: era `/autori/`) |
| Autore EN `/en/authors/{slug}/` | ✅ 200 |
| Lista autori IT `/it/autori/` | ✅ 200 (B-14) |
| Archivio IT `/it/archivio/` | ✅ 200, `ArchivioContent.astro` (B-14) |
| Archivio EN `/en/archive/` | ✅ 200, `ArchivioContent.astro` lang=en |
| Numero IT `/it/archivio/oel-173/` | ✅ 200, SSR live, articoli aggiornati senza rebuild |
| Numero EN `/en/archive/oel-173/` | ✅ 200, SSR live, articoli EN |
| Chi siamo IT `/it/chi-siamo/` | ✅ 200, `ChiSiamoContent.astro` (B-14) |
| About EN `/en/about/` | ✅ 200, `ChiSiamoContent.astro` lang=en |
| Sostienici IT `/it/sostienici/` | ✅ 200, `SostienicContent.astro` (B-14) |
| Support EN `/en/support-us/` | ✅ 200, `SostienicContent.astro` lang=en |
| Newsletter IT `/it/newsletter/` | ✅ 200, `NewsletterContent.astro` (B-14) |
| Newsletter EN `/en/newsletter/` | ✅ 200, `NewsletterContent.astro` lang=en |
| Cerca IT `/it/cerca/` | ✅ 200, `CercaContent.astro` (B-14) |
| Search EN `/en/search/` | ✅ 200, `CercaContent.astro` lang=en |
| Diari IT `/it/rubriche/diari/` | ✅ 200, `DiariContent.astro` (B-14) |
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
| Megamenu iOS Safari scroll-lock | 🟡 fix deployato (MOBILE-01, 2026-05-01) — da verificare su iOS Safari ≤15 |
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

## Fix recenti (2026-05-05)

| Commit | Area | Fix |
|--------|------|-----|
| — | **MONITORING-01** | Sistema di osservabilità a tre livelli: `src/pages/api/health.ts` (endpoint /api/health con 3 check paralleli Directus), `.github/workflows/smoke-post-deploy.yml` (11 check post-deploy via curl, artifact log 7gg, Slack alert), `docs/MONITORING.md` (architettura, istruzioni UptimeRobot, 6 monitor da configurare). Aggiornati: `INFRASTRUTTURA.md` (tabella Monitor attivi), `RUNBOOK.md` (sezione Monitoring e alert). |

---

## Fix recenti (2026-05-04)

| Commit | Area | Fix |
|--------|------|-----|
| `f193558e`→`cf0eb4e6` | **HERO-01** | Hero slider fullscreen homepage IT+EN: 4 slide, autorotate WAAPI, tab strip Nectar-style, header trasparente CSS-first, text reveal animazione, Raleway 900 reale |
| `57a35da2` | **ART-TYPO** | Pagina articolo: titolo Raleway 900, sottotitolo Raleway no-italic 1.5rem, badge categoria all-caps |
| `0ff6ae21` | **NUMERI-01** | `fetch-static-data.mjs` prebuild: fetcha ultimo numero da Directus con fallback; `numeri_consolidati.json` rimosso da homepage, sostituito con `getAllNumeriRivista()` |
| `63494dd2` | **NUMERI-02** | Campo M2O `copertina` su `numeri_rivista` reso visibile; `getNumeroImageUrl()` priorità M2O→URL; Flow Directus `d3b1f2a1` creato per rebuild automatico CF Pages |
| `ebb69112` | **NUMERI-03** | Pagine `[issue].astro` IT+EN convertite da SSG a **SSR**: articoli pubblicati visibili immediatamente senza rebuild |
| `1a8408e2` | **NUMERI-04** | `getArticoliByNumeroId(uuid)`: filter diretto per UUID (no deep relazionale → no FORBIDDEN) |
| `ffe8055d` | **HOME-DEDUP** | Deduplicazione globale homepage: `usedSlugs` Set con priorità hero→recenti→diari→testimonianze→esplora |
| `f7a74710` | **SEARCH-FIX** | EN search language switcher mobile fix; categorie mancanti CATEGORIA_LABELS; `id_numero` in searchableAttributes `oel_numeri`; issueUrl corretto `/it/archivio/`; re-indicizzazione 7508 record |

---

## Fix recenti (2026-04-28)

| Commit | Fix |
|--------|-----|
| `ae17cc4f` | feat(magazine): label "Archivio" → "Magazine" in i18n IT+EN, header nav (Newsletter→Magazine, Archivio completo→Newsletter nel megamenu), ArchivioContent con tab CSS-only (Ultimo numero / Tutti i numeri), IssueContent breadcrumb |
| `b4259dac` | refactor(magazine): rimuove tab intermedio — "Ultima edizione" è link diretto al numero più recente; header centrato con pill switcher stile vita.it (dark pill su active); filtri inline senza accordion; `?tab=numeri` rimosso (non più necessario) |
| `7dd5b9ba` | fix(magazine): .issue-mag-header centrato (align-items:center); IssueNavPill "Archivio"→"Magazine" con prop archiveBasePath lang-aware; .header-link font-weight 500→700; search form width 360→480px; filtri senza label, contesto nelle option |

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

**Scroll orizzontale mobile**: doppia protezione deployata — `overflow-x:hidden` su `html` (legacy) + `overflow-x:clip` su `body` (MOBILE-01 `d9883183`; `clip` non crea nuovo scroll context, non rompe `position:fixed`). Da verificare su device fisici.

---

## § Architettura numeri rivista (2026-05-04)

### Come funziona il ciclo pubblicazione → sito

```
Redattore pubblica/modifica numeri_rivista in Directus
  → Directus Flow (d3b1f2a1) → POST CF_DEPLOY_HOOK
  → CF Pages rebuild (~3 min)
  → prebuild: node scripts/fetch-static-data.mjs
      → aggiorna src/data/ultimo-numero.json (con fallback se Directus down)
  → Astro build: homepage e archivio listing usano Directus live
  → Sito aggiornato
```

**Pubblicare articoli** in un numero non richiede rebuild: la pagina del numero è **SSR**.

### Pagine e loro modalità

| Pagina | Modalità | Fonte dati articoli |
|--------|----------|---------------------|
| `/it/archivio/` | SSG (rebuild auto) | `getAllNumeriRivista()` live al build |
| `/it/archivio/[issue]` | **SSR** | `getArticoliByNumeroId(numero.id)` live |
| `/en/archive/[issue]` | **SSR** | `getArticoliByNumeroId(numero.id)` live |
| Homepage carousel | SSG (rebuild auto) | `getAllNumeriRivista()` live al build |
| Header megamenu | SSG (rebuild auto) | `src/data/ultimo-numero.json` (prebuild) |

### Copertina numeri — campo M2O vs URL legacy

- **Nuovi numeri (OEL-173+):** campo `copertina` (M2O → `directus_files`). Il redattore carica l'immagine dal file picker nel form Directus. `getNumeroImageUrl()` restituisce `https://cms.ombreeluci.it/assets/{uuid}`.
- **Vecchi numeri (OEL-1…172):** campo `copertina_url` (stringa URL). Fallback automatico in `getNumeroImageUrl()`.
- **Ordine di priorità in `getNumeroImageUrl()`:** `copertina` M2O → `copertina_url` stringa → `null`.

### Deploy Hook CF Pages

- Hook ID: `94f27b2c-a75b-4d3c-b0bc-6268e1eade41`
- URL: `https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/94f27b2c-...`
- Salvato in `.env` come `CF_DEPLOY_HOOK`
- Flow Directus: ID `d3b1f2a1-b140-4d04-a516-13f48924ba30`, operazione `7231841d-6f77-42e3-a7e8-0660b7cc114c`

### Se si rompe qualcosa

**Articoli non appaiono in `/it/archivio/oel-NNN/`:**
1. Verifica che siano `published` in Directus
2. Verifica che `numero_rivista` sia impostato (UUID, non stringa `OEL-NNN`)
3. La pagina è SSR: ricarica, non serve rebuild

**Ultimo numero sbagliato in header:**
1. Verifica `src/data/ultimo-numero.json` — campo `id_numero`
2. Lancia manualmente `node scripts/fetch-static-data.mjs` e ricostruisci
3. Oppure modifica/salva il record in Directus → Flow → rebuild automatico

**Flow non scatta:**
1. Directus → Settings → Flows → `CF Pages rebuild on numeri_rivista publish` → verifica status Active
2. Testa manualmente: `curl -X POST $CF_DEPLOY_HOOK`
3. Se risponde 400 "invalid hook ID": il hook è scaduto → ricrearlo con `scripts/fetch-static-data.mjs` come riferimento

**`getArticoliByNumeroId` restituisce 0 risultati:**
- Usa filter `[numero_rivista][_eq]={uuid}` — NON `numero_rivista.id_numero` (richiede permessi relazionali)
- L'UUID del record si trova con: `GET /items/numeri_rivista?filter[id_numero][_eq]=OEL-173&fields=id`

### Deduplicazione articoli homepage

`index.astro` e `en/index.astro` usano un `usedSlugs: Set<string>` globale.
Ogni articolo è aggiunto al set quando viene assegnato a una sezione; le sezioni successive escludono i già usati.

Ordine di priorità:
1. Hero slider (`featuredPool`) — portanti/strutturali con cover
2. Recenti (sotto hero)
3. Diari (per diarista specifico)
4. Testimonianze
5. Esplora (un articolo per categoria)

---

## Fix recenti (2026-05-04, branch feat/hero-slider)

| Commit | Fix |
|--------|-----|
| `f193558e` | **HERO-01** feat: hero slider fullscreen + header trasparente homepage |
| `54f6965e` | fix: 6 fix post-review (logo filter, is:global CSS, tab Nectar-style, 4 articoli, cover reali) |
| `b509e923` | fix: 4 articoli, animazione fade-up, titolo Raleway 900 |
| `0792a3f3` | fix: struttura Nectar esatta — li diretto, ::before/::after su li |
| `bee3cb7c` | feat: ripristina sezione tagline+featured+recenti sotto hero slider |
| `9ef18bd7` | fix: timer globale + astro:page-load — no double setInterval |
| `e924436f` | feat: text reveal dall'orizzonte (translateY 110%→0) |
| `486ad937` | fix: ls-code--active scuro su hero trasparente |
| `7f408a46` | fix: content box max-width 600px, titolo 35px/lh 1.5 |
| cleanup | refactor: rinomina .hr/.hri → .hero-reveal/.hero-reveal-inner; Raleway 900 scaricato |

### § Hero Slider — architettura (2026-05-04)

| Componente | Dettaglio |
|---|---|
| Route | `/` e `/en/` (prop `heroHeader={true}` su BaseLayout) |
| Componente | `HomePageContent.astro` — sezione `home-hero-slider` |
| Slide | 4 articoli con cover reale da `featuredPool`, autorotate 5s |
| Tab strip | Struttura Nectar: `<li>` diretti, `::before` track + `::after` fill 4.95s linear |
| Animazione testo | Text reveal: `.hero-reveal` (overflow:hidden) + `.hero-reveal-inner` (translateY 110%→0) |
| Header trasparente | CSS-first su `[data-hero="true"]`, JS aggiunge `.header--scrolled` a scroll |
| Logo | `filter: brightness(0) invert(1)` su logo nero — no asset aggiuntivi |
| LanguageSelector | Bianco in stato trasparente, active code con pill bianco+testo scuro |
| Timer bug fix | `_heroTimer` module-level + `astro:page-load` — no double setInterval con View Transitions |
| Font | Raleway 900 vero (`raleway-900-latin.woff2`, 22KB) aggiunto a `global.css` |

---

## Prossima azione immediata

**ALGOLIA-05** — webhook Directus→Algolia automatico. Senza questo ogni pubblicazione richiede `node scripts/algolia/index-all.mjs` a mano.

**VERT-01 — 2 pagine Focus mancanti** (editoriale). Mancano `studiosi-educatori-e-attivisti-ombre-e-luci` e `catechesi-e-disabilita`. Fornire testo intro e lista articoli. Script `scripts/create-verticali.py` pronto.

**NL-FORM** — form newsletter reale con Mailchimp (uuid `00c5dad63480d9601563b5692`, lid `efd099264d`).

**PF-02** — Cache-Control su R2 via CF Transform Rule (istruzioni nel backlog).

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
| B-06 | ✅ | Dev | Audit e fix permessi Directus ruolo Redazione completato (2026-05-01). Vedi § Directus Audit. |
| B-07 | ✅ | Dev | Keystatic dismesso — Worker `keystatic-oel` eliminato |
| B-08 | ✅ | Dev | Copertine staging: tutte su `cms.ombreeluci.it/assets/{uuid}`, 200 OK |
| B-09 | → post-lancio | Sysadmin | UptimeRobot monitoring |
| B-10 | → post-lancio | Sysadmin | Slack alert build |
| B-11 | N/A | — | Iubenda ownerName `fedeeluce.it` è corretto (editore legale) |
| B-13 | ✅ | Dev | **Ricerca Algolia** — testata sistematicamente (2026-05-04). Autocomplete IT/EN ✅, pagina cerca IT/EN ✅, filtri tradotti ✅, numeri ricercabili ✅. Manca solo ALGOLIA-05 (webhook auto-sync, non blocca il lancio). |
| B-14 | ✅ | Dev | **URL-IT-02** — prefisso `/it/` su tutte le route IT (commit `01456a13`). Redirect root→/it/ in astro.config.mjs. |
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
| SEARCH-01 | ✅ | L | **Ricerca Algolia** — testata sistematicamente (2026-05-04). 7508 record, fix post-test applicati (URL numeri, traduzioni filtri EN, id_numero ricercabile). Chiuso. |
| ALGOLIA-05 | 🔴 | M | **Webhook sync Directus→Algolia** — pubblicare/modificare articolo in Directus non aggiorna l'indice automaticamente. Workaround: `node scripts/algolia/index-all.mjs`. Non blocca lancio ma deve essere fatto presto dopo. |
| VERT-01 | 🟡 | L | **Focus pages** — schema Directus, componenti e route `/it/focus/[slug]` + `/en/focus/[slug]` live. 6/8 pagine populate (Mariangela, Autismo, Noi papà, Aktion T4, Cinema, Ciao Stefano). Restano: `studiosi-educatori-e-attivisti-ombre-e-luci` e `catechesi-e-disabilita`. Verifica visiva staging + megamenu link ancora aperti. Vedi § VERT-01. |
| VERT-LISTING | ✅ | S | **Listing `/it/focus/` e `/en/focus/`** — live su main (commit `2d8cba4e`). `FocusListingContent.astro` componente condiviso IT/EN. |
| VERT-SEARCH | 🟡 | M | **Focus nella ricerca Algolia** — le pagine focus non sono indicizzate. Aggiungere allo script come tipo `focus` con titolo, intro (HTML stripped), slug IT/EN. Prerequisito: VERT-01 con ≥4 pagine stabili — **ora soddisfatto (6 pagine)**. Fare dopo VERT-01 completo (8/8). |
| B-12 | 🟡 | M | Rivalutazione ruoli editoriali per categoria (dopo B-04) |
| LINK-01 | 🟡 | S | 7 link IT↔EN ambigui + 11 no-match: `scripts/traduzione/logs/backfill_traduzione_link_20260408_231827.csv` |
| V-05 | 🟡 | S | 35 articoli Jean Vanier con `tema_label = null`: riassegnare categoria in Directus |
| UX-19 | ✅ | S | Pagine test eliminate (test-lista/minimal/no-articles/status), debug ha già noindex. Dead code `ArticleListRow.astro` eliminato. |
| PF-01 | ✅ | S | Placeholder copertina: 386 byte SVG, già ottimale — info 4.2MB era obsoleta. |
| PF-02 | 🔴 | S | Cache-Control assente su R2 (`pub-2251...r2.dev`). Fix: CF Dashboard → Rules → Transform Rules → Modify Response Header → URL `pub-*.r2.dev/*` → add `Cache-Control: public, max-age=31536000, immutable`. Non eseguibile via codice. |
| DA-02 | 🟢 | S | 16 pull quote non reinserite: 11 articoli con posizione ambigua, inserire a mano in Directus |
| UAT-CLEANUP | 🔴 | S | Eliminare utente Redazione UAT `redazione-uat@ombreeluci.it` prima del go-live |
| SEC-01 | ✅ | S | Security headers aggiunti via `public/_headers`: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. |
| NL-FORM | 🔴 | M | **Form newsletter reale** — `/it/newsletter/` ha `action` placeholder (TODO nel codice). Mailchimp uuid `00c5dad63480d9601563b5692`, lid `efd099264d`. |
| BUG-REGEX | 🟡 | S | Encoding fixato in Directus: 5+1 sequenze `Ã\xa0` (double-encoding UTF-8→Latin-1 di `à/è`) patchate via API (2026-05-01). Se l'errore JS console persiste, causa diversa — indagare. |
| PERM-DIR | ✅ | M | Permessi ruolo Redazione configurati e documentati (commit `f326b0ea`). UAT verifica ancora da eseguire (B-06). |

---

## Validazioni in attesa dalla Redazione

| # | Cosa | Come verificare |
|---|------|-----------------|
| V-01 | 13 categorie: distribuzione articoli sensata? | Staging → menu Temi → ogni `/it/categoria/*` |
| V-02 | 19 articoli "da-categorizzare" da assegnare | Directus → filtra `categoria_menu = da-categorizzare` |
| V-04 | "Fede e Luce" (1114 articoli): serve suddivisione? | Staging → `/it/categoria/fede-e-luce` |
| V-05 | 35 articoli Jean Vanier senza categoria | Directus → filtra `tema_label` vuoto |
| V-13 | Homepage v2: qualità editoriale articoli in rotazione | Staging → ricarica più volte |
| V-14 | Embed video YouTube funzionanti | Un articolo con video YouTube incorporato |
| V-16 | Pull quote (570): posizione e formattazione corretta | Articoli lunghi con citazioni evidenziate |
| V-17 | Sommari numeri rivista (71): testo leggibile e corretto | `/it/archivio` → apri alcuni numeri |
| **M-01** | **Header mobile: logo + hamburger visibili, nessun overflow** | iPhone/Android — apri staging, verifica header a 320px/375px |
| **M-02** | **Megamenu: apertura, scroll interno, chiusura** | iPhone → tap hamburger → scroll voci menu → tap voce → naviga correttamente |
| **M-03** | **Megamenu: background NON scrolla mentre menu è aperto** | iPhone Safari → apri menu → prova a scrollare dietro → deve restare bloccato |
| **M-04** | **Ricerca mobile: form appare, submit porta a `/it/cerca/`** | iPhone ≤480px → tap icona lente → digita → invio → pagina risultati |
| **M-05** | **Language switcher mobile: dropdown IT/EN funzionante** | iPhone → tap icona globo → appare dropdown → tap EN → naviga |
| **M-06** | **Articolo: testo leggibile su 375px, nessun overflow orizzontale** | iPhone → apri un articolo lungo → verifica font, spaziatura, link lunghi |
| **M-07** | **Focus page + listing: layout card su mobile** | iPhone → `/it/focus/` → apri una verticale → card articoli corrette |

---

## Algolia — stato implementazione (aggiornato 2026-05-04)

### Architettura

| Componente | File | Stato |
|---|---|---|
| Script indicizzazione | `scripts/algolia/index-all.mjs` | ✅ funzionante — ri-indicizzare con `node scripts/algolia/index-all.mjs` |
| Indice articoli | `oel_articoli` | ✅ 6949 record (IT+EN, filter per `lang`) |
| Indice autori | `oel_autori` | ✅ 354 record |
| Indice numeri | `oel_numeri` | ✅ 205 record — `id_numero` ora ricercabile, URL corretti `/it/archivio/` |
| Autocomplete header | `src/components/AutocompleteWidget.astro` | ✅ testato e funzionante |
| InstantSearch `/cerca` + `/en/search` | `src/components/CercaContent.astro` | ✅ testato — filtri tradotti IT+EN, URL routing, paginazione |
| Webhook sync automatico | — | 🔴 **ALGOLIA-05 non implementato** — re-indicizzare manualmente dopo ogni pubblicazione |

### Test sistematico (2026-05-04) — risultati

| Test | Esito |
|------|-------|
| Autocomplete header desktop IT/EN | ✅ |
| View Transitions (reinit dopo navigazione) | ✅ |
| Autocomplete mobile | ✅ |
| Pagina `/it/cerca/` — filtri, paginazione, URL routing | ✅ |
| Pagina `/en/search/` — filtri tradotti | ✅ (fix applicato) |
| Language switcher da `/en/search/` → IT | ✅ (fix applicato: `/it/cerca/` diretto) |
| Ricerca per titolo esatto | 🟡 Non sempre primo — ranking post-lancio |
| Ricerca numero per ID (es. "OEL-172") | ✅ (fix: `id_numero` in searchableAttributes) |
| Ricerca autore (es. "Mariangela") | ✅ |
| Link risultati numeri | ✅ (fix: URL `/it/archivio/` corretti) |

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

## § Bug Header — ✅ RISOLTO (MOBILE-01, commit `aeb42553`)

**Sintomo originale:** header sticky + overflow-x:hidden su html rompeva sticky su iOS Safari.

**Fix applicato:** header era già `position:fixed` da una versione precedente. MOBILE-01 ha risolto il problema residuo: iOS Safari scroll-lock inaffidabile (body.style.overflow='hidden' non sufficiente) — sostituito con `position:fixed + savedScrollY` sul body durante l'apertura del megamenu. In più: LanguageSelector breakpoint allineato a 768px, fallback `var(--header-height, 72px)`, `overflow-wrap` su `.article-content`.

---

## § Magazine — architettura (2026-04-28)

### Route e componenti

| Pagina | Route IT | Route EN | Componente |
|--------|----------|----------|------------|
| Griglia numeri | `/archivio/` | `/en/archive/` | `ArchivioContent.astro` |
| Singolo numero | `/archivio/[issue]/` | `/en/archive/[issue]/` | `IssueContent.astro` |

### Pill switcher — logica

**Su `/archivio/`:**
- "Ultima edizione" (inattivo) → link a `/archivio/{ultimoSlug}` (da `numeriOrdinati.find(n => n.tipo !== 'ins')`)
- "Tutte le edizioni" (attivo, dark pill) → pagina corrente

**Su `/archivio/[issue]/`:**
- "Ultima edizione" (attivo se `numero.id_numero === ultimoNumeroData.id_numero`, altrimenti link) → `/archivio/{ultimoSlug}` (da `src/data/ultimo-numero.json`)
- "Tutte le edizioni" (inattivo) → link ad `archiveBasePath` (lang-aware)

### Aggiornare l'ultimo numero

`src/data/ultimo-numero.json` va aggiornato manualmente (o via webhook ALGOLIA-05) quando esce un nuovo numero. Campi: `id_numero`, `copertina_url`, `titolo_numero`, `numero_progressivo`, `anno_pubblicazione`, `periodo_label`.

### IssueNavPill (telecomandino)

Il pill flottante prev/next in basso è **separato** dal pill switcher in testa. Non è ridondante: serve per navigare sequenzialmente tra numeri senza tornare alla griglia. Centro ora mostra "Magazine" (era "Archivio") con link lang-aware ad `archiveBasePath`.

---

## § Directus — Audit permessi ruolo Redazione (2026-05-01)

### Configurazione finale policy Redazione (`0a5492ea`)

| Collection | CREATE | READ | UPDATE | DELETE | Note |
|---|---|---|---|---|---|
| `articoli` | `*` | 27 campi | `*` | — | READ esclude: slug, lang, wp_id, original_url, articolo_traduzione, cluster_id, umap_*, data_creazione, data_aggiornamento |
| `articoli_tags` | `*` | `*` | `*` | `*` | M2M tag |
| `articoli_temi` | `*` | `*` | `*` | `*` | M2M temi |
| `autori` | `*` | `*` | `*` | — | |
| `categorie_articoli` | `*` | `*` | `*` | `*` | M2M categorie |
| `directus_files` | `*` | `*` | `*` | — | Necessario per upload immagini copertina |
| `numeri_rivista` | `*` | `*` | `*` | — | Per creazione OEL-173 e successive |
| `tags` | `*` | `*` | `*` | — | READ necessario per M2M display in articoli |
| `temi` | `*` | `*` | `*` | — | READ necessario per M2M display in articoli |
| `verticali` | — | `*` | — | — | Solo lettura focus page |
| `verticale_blocchi` | — | `*` | — | — | Solo lettura |
| `verticale_blocchi_articoli` | — | `*` | — | — | Solo lettura |

**Categorie e serie:** nascoste globalmente dalla nav (`hidden: true` su `directus_collections`) — API e M2M continuano a funzionare.

### Bug critici trovati e risolti

**1. Nessun accesso a `directus_files`**
Mancava il permesso CREATE/READ/UPDATE su `directus_files`. La Redazione non poteva fare upload di nessuna immagine. Aggiunto.

**2. Permissions filter bloccava articoli published**
Il permesso UPDATE aveva un filtro record `{"stato": {"_in": ["draft", "review"]}}` — la Redazione non poteva modificare articoli già published. Su ogni campo compariva il simbolo "divieto". Trovato anche un `validation` identico che impediva di impostare `stato: published`. Entrambi rimossi.

**3. Campi tecnici visibili**
READ con `fields: *` mostrava slug, lang, wp_id, original_url, articolo_traduzione, cluster_id, umap_x/y/z. Ora READ è ristretto a 27 campi editoriali.

**4. Categorie e Serie nel menu**
Visibili nella nav laterale ma non utili per uso editoriale. Nascoste globalmente.

### Account di test
- `redazione-uat@ombreeluci.it` — da eliminare prima del go-live (UAT-CLEANUP)
- Credenziali in `STATO.md § Riferimenti rapidi`

---

## Fix recenti (2026-05-01)

| Commit | Fix |
|--------|-----|
| `01456a13` | **B-14** refactor(routing): prefisso `/it/` su tutte le route IT — 20 file spostati in `src/pages/it/`, import path corretti, redirect root→/it/ in astro.config.mjs, sitemap aggiornata, CLAUDE.md aggiornata |
| `aeb42553` | **MOBILE-01** fix(mobile): iOS Safari scroll-lock megamenu (position:fixed+savedScrollY), LanguageSelector breakpoint 767→768px, var(--header-height,72px) fallback, overflow-wrap su .article-content |
| `f326b0ea` | **B-06/PERM-DIR** docs(directus): audit e fix permessi ruolo Redazione — directus_files aggiunto, filter stato su UPDATE rimosso, READ limitato a 27 campi, categorie/serie nascoste |
| `546aeeca` | **SEC-01/UX-19** fix: public/_headers security headers, pagine test eliminate, dead code ArticleListRow rimosso, BUG-REGEX encoding fixato in Directus, PF-01 chiuso |
| `d9883183` | fix(mobile): `body { overflow-x: clip }` aggiunto come secondo livello anti-scroll-orizzontale; `white-space:nowrap` rimosso da `.author-row` in ArticleCard+ArticoliRullo (causava overflow su card strette) |
| `2d8cba4e` | feat(focus): `FocusListingContent.astro` + route `/it/focus/index.astro` + `/en/focus/index.astro` — listing delle verticali live per entrambe le lingue. CLAUDE.md aggiornato con nuova riga nella tabella componenti condivisi. |
| `4a6f0b6c` | feat(focus): 4 hero cover image specifiche per le pagine Focus caricate in Directus e nel repo (`public/images/focus-cover-*.jpg`). Script `scripts/create-verticali.py` committato. |
| Directus | Populate 5 nuove verticali via API: Autismo (ID=3), Noi papà (ID=4), Aktion T4 (ID=5), Cinema e disabilità (ID=6), Ciao Stefano (ID=7). 43 articoli collegati complessivamente. Hero immagini assegnate. |

---

## Fix recenti (2026-04-30)

| Commit | Fix |
|--------|-----|
| `038f1b21` | fix(verticali): `<main class="site-main">` aggiunto in `VerticaleContent.astro` — il footer appariva sopra al contenuto delle focus page perché il layout usa `site-main` come elemento che copre il footer fixed. Regola: ogni componente che usa `BaseLayout` deve wrappare il contenuto in `<main class="site-main">`. |
| `4f516c76` | fix(css): CSS di `ArticleCard.astro` spostata in `global.css` — le focus page caricavano HTML corretto (14 card) ma senza stili, perché Vite metteva le scoped styles di ArticleCard in un chunk condiviso non linkato alle nuove route. Soluzione definitiva: `ArticleCard` è una primitiva UI globale, la sua CSS appartiene a `global.css`. Il blocco `<style>` è stato rimosso da `ArticleCard.astro`. |

---

## Fix recenti (2026-04-29)

| Commit | Fix |
|--------|-----|
| — | `ArticleCard.astro`: link autore hardcoded `/autori/` → ora usa `getAuthorBasePath(lang)` da `i18n.ts`. Per EN genera `/en/authors/`, per lingue future basta estendere `Locale` — zero modifiche ai componenti. |

---

## Note tecniche (casi documentati)

### Vite CSS chunk splitting — primitiva UI globale (2026-04-30)

Quando una nuova route Astro importa un componente a ≥3 livelli di profondità (route → A → B → C), Vite può mettere la CSS scoped di C in un chunk condiviso e **non aggiungere il `<link>` a quel chunk nell'HTML della nuova route**. Risultato: HTML corretto, CSS mancante.

**Fix architetturale**: le CSS di componenti usati ovunque (primitiva UI globale) non devono stare in `<style>` scoped del componente — devono stare in `global.css`. `ArticleCard.astro` è il caso canonico: usato su home, categoria, autori, focus. Il suo `<style>` è stato rimosso e la CSS è in `global.css` (`/* ── ArticleCard ──`).

**Regola pratica**: se un componente `.astro` viene importato e renderizzato in almeno 4-5 pagine diverse del sito, valutare di spostare la sua CSS in `global.css`. I nomi di classe sono abbastanza univoci da non richiedere scoping.

**NON fare**: aggiungere `import ComponenteX from './ComponenteX.astro'` senza renderizzare il componente solo per "forzare" la CSS — Astro include la CSS scoped solo per componenti che vengono effettivamente renderizzati, non solo importati.

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

### GET /users/me → 401 in console (non è un bug)
`EditorialFeedback.astro` chiama `https://cms.ombreeluci.it/users/me` con `credentials:include` per verificare se l'utente è loggato su Directus e mostrare il pulsante Edit. Il 401 in console è normale per utenti non autenticati — il codice lo gestisce (`r.ok === false`). CORS configurato correttamente (`access-control-allow-credentials: true`, origin staging/prod whitelist). Nessuna azione richiesta.

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
| GR-CTA | Crescita | ✅ **CHIUSO 2026-04-27** — CTA Sostienici implementate. 3 varianti (sage/peach/amber) su articoli IT+EN, banner con immagine su archivio e numeri. Dati in `src/data/cta.json`. Tracking: UTM + `data-cta-id`. Vedi § GR-CTA per architettura. |
| UX-07 | UX | Articolo su mobile: padding, tipografia fluida, capolettera |
| UX-10 | UX | Selettore lingua: nascondere se non esiste traduzione |
| UX-BIO | UX | ✅ **CHIUSO 2026-04-27** — Bio autore troncata a 200 caratteri con link "Leggi di più →" alla pagina autore. Implementato in `it/[slug].astro` e `en/[slug].astro`. |
| UX-CMT | UX | ✅ **CHIUSO 2026-04-27** — Form commenti in accordion `<details>/<summary>`: "Mostra commenti (N)" solo se presenti; "Lascia un commento" sempre. Entrambi chiusi di default. File: `src/components/Commenti.astro`. |
| ARCH-02 | UX | ✅ **CHIUSO 2026-04-28** — Magazine redesign completo. Label "Archivio"→"Magazine" ovunque; pill switcher centrato (vita.it style) su `/archivio/` e pagine numero; "Ultima edizione" = link diretto al numero, "Tutte le edizioni" = griglia filtri. IssueNavPill aggiornato a "Magazine". Header link più pesanti, form ricerca più larga. |
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
| `src/components/ArticleListRow.astro` | **Dead code** (2026-04-29): il componente esiste ma non è importato da nessun file. Non ha prop `lang`, hardcoda `/it/` e `it-IT`. Valutare: eliminare o adattare se si vuole usarlo in futuro (in quel caso aggiungere `lang`, `basePath`, `t()` come in `ArticleCard`). |

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

Pagine da cui rimuovere `noindex={true}` (path aggiornati dopo B-14):

- [ ] `src/pages/index.astro` (homepage IT)
- [ ] `src/pages/it/[slug].astro` (articoli IT — BLOCCANTE SEO)
- [ ] `src/pages/it/categoria/[categoria].astro`
- [ ] `src/pages/it/archivio/index.astro`
- [ ] `src/pages/it/archivio/[issue].astro`
- [ ] `src/pages/it/archivio/web-only.astro`
- [ ] `src/pages/it/autori/index.astro`
- [ ] `src/pages/it/autori/[slug].astro`
- [ ] `src/pages/it/rubriche/[rubrica].astro`
- [ ] `src/pages/it/rubriche/diari.astro`
- [ ] `src/pages/it/tag/[slug].astro`
- [ ] `src/pages/it/diari/[diario].astro`
- [ ] `src/pages/it/chi-siamo/index.astro`
- [ ] `src/pages/it/sostienici/index.astro`
- [ ] `src/pages/it/newsletter/index.astro`
- [ ] `src/pages/it/focus/index.astro`
- [ ] `src/pages/it/focus/[vertical].astro`
- [ ] `src/pages/en/index.astro`
- [ ] `src/pages/en/[slug].astro` (articoli EN)
- [ ] `src/pages/en/category/[slug].astro`
- [ ] `src/pages/en/sections/[slug].astro`
- [ ] `src/pages/en/sections/diaries.astro`
- [ ] `src/pages/en/archive/index.astro`
- [ ] `src/pages/en/archive/[issue].astro`
- [ ] `src/pages/en/archive/web-only.astro`
- [ ] `src/pages/en/authors/index.astro`
- [ ] `src/pages/en/authors/[slug].astro`
- [ ] `src/pages/en/diaries/[diario].astro`
- [ ] `src/pages/en/about/index.astro`
- [ ] `src/pages/en/newsletter/index.astro`
- [ ] `src/pages/en/focus/index.astro`
- [ ] `src/pages/en/focus/[vertical].astro`

Pagine che devono restare `noindex=true`:
- `src/pages/404.astro`
- `src/pages/it/cerca/index.astro` e `src/pages/en/search/index.astro`
- `src/pages/en/tag/[slug].astro` (decide redazione — contenuto duplicato potenziale)
- Tutto sotto `src/pages/debug/` e `src/pages/test-*.astro`
- Sottopagine chi-siamo (la-redazione, redazione-storica, collaboratori, ecc.) — già reindirizzate in astro.config.mjs

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

---

## § VERT-01 — Focus pages (architettura 2026-04-29, aggiornato 2026-04-30)

### Cos'è una Focus page

Pagina tematica curata che raccoglie articoli, testi di raccordo narrativo e citazioni attorno a un tema, una persona o un dossier storico. Non è una categoria automatica (queried da tag/categoria) ma una selezione editoriale manuale con narrazione propria.

**Nome pubblico**: "Focus" — funziona in italiano e inglese, editorialmente preciso, breve.

### URL e routing

```
IT:  /it/focus/{slug}/          ← src/pages/it/focus/[vertical].astro
EN:  /en/focus/{slug}/          ← src/pages/en/focus/[vertical].astro
```

**Perché `/it/focus/` e non `/focus/`**:
- Coerente con il prefisso `/it/` di tutto il contenuto italiano
- Permette listing page `/it/focus/` (tutti i focus pubblicati)
- Simmetria perfetta con `/en/focus/`
- Aggiungere ES/FR: zero modifiche al frontend, solo `src/pages/es/focus/[vertical].astro`

**Slug**: sempre in lingua (es. `autismo` IT, `autism` EN). Eccezione: nomi propri invariati (`mariangela-bertolini`, `ciao-stefano-di-franco`).

### Decisioni architetturali chiave

| Decisione | Scelta | Alternativa scartata | Motivo |
|-----------|--------|----------------------|--------|
| Struttura blocchi | Sequenza ordinata `tipo: testo\|articoli` | Page builder libero | Semplicità Directus, niente complessità UI |
| Diversità visiva | `tema_visivo` CSS class (4 skin) | Markup custom per pagina | Zero duplicazione, editabile da CMS |
| Multilingua | `VerticaleContent.astro` + prop `lang` | Route separate con markup diverso | Regola CLAUDE.md: componente condiviso |
| Citazioni/raccordi | Blocco `tipo=testo` tra gruppi articoli | Campo dedicato citazione | Non serve un tipo in più, il rich text copre tutto |
| Immagine hero | UUID diretto in `hero_immagine` | M2O espanso | Directus restituisce UUID plain per campi `file-image` senza relazione esplicita |

### Le 8 pagine focus

| # | Slug IT | Slug EN | Tipo | Skin | Stato |
|---|---------|---------|------|------|-------|
| 1 | `mariangela-bertolini` | `mariangela-bertolini` | Biografica fondatrice | `caldo` | ✅ Popolata |
| 2 | `autismo` | `autism` | Hub tematico | `chiaro` | 🔴 Da fare |
| 3 | `cinema-e-disabilita` | `cinema-and-disability` | Hub tematico | `scuro` | 🔴 Da fare |
| 4 | `aktion-t4-sterminio-persone-disabilita` | `aktion-t4-extermination-of-disabled-people` | Dossier storico | `scuro` | 🔴 Da fare |
| 5 | `catechesi-e-disabilita` | `catechesis-and-disability` | Hub tematico | `chiaro` | 🔴 Da fare |
| 6 | `noi-papa-un-figlio-disabile` | `we-fathers-a-disabled-child` | Raccolta voci | `caldo` | 🔴 Da fare |
| 7 | `ciao-stefano-di-franco` | `ciao-stefano-di-franco` | Memorial | `magazine` | 🔴 Da fare |
| 8 | `studiosi-educatori-e-attivisti-ombre-e-luci` | `scholars-educators-and-activists` | Directory persone | `chiaro` | 🔴 Da fare |

### Schema Directus (live su cms.ombreeluci.it)

**Collection `verticali`**

| Campo | Tipo Directus | Note |
|-------|--------------|------|
| `id` | integer PK | auto |
| `slug` | string unique | URL slug IT |
| `slug_en` | string unique | URL slug EN |
| `titolo` / `titolo_en` | string | `titolo_en` nullable |
| `seo_description` / `seo_description_en` | text | max 160 char |
| `hero_immagine` | uuid (file-image) | UUID diretto — NON espanso da Directus; usare `getDirectusAssetUrl(verticale.hero_immagine)` |
| `hero_video_url` | string nullable | URL YouTube/Vimeo — sovrascrive immagine se presente |
| `tema_visivo` | select | `chiaro` \| `scuro` \| `caldo` \| `magazine` |
| `intro` / `intro_en` | rich text | `intro_en` nullable |
| `testo_coda` / `testo_coda_en` | rich text nullable | Testo conclusivo opzionale |
| `pubblicato` | boolean | Filter read pubblico: `pubblicato=true` |
| `sezioni` | alias O2M → `verticale_blocchi` | Campo alias creato manualmente (Directus 11 non lo crea automatico dalla relazione) |

**Collection `verticale_blocchi`**

| Campo | Tipo | Note |
|-------|------|------|
| `verticale_id` | M2O → `verticali` | FK con CASCADE delete |
| `ordine` | integer sort | Drag&drop in Directus |
| `tipo` | select `testo\|articoli` | Discriminatore blocco |
| `titolo_sezione` / `titolo_sezione_en` | string nullable | Heading sopra gruppo articoli |
| `testo` / `testo_en` | rich text nullable | Solo `tipo=testo` |
| `immagine` | uuid (file) nullable | Solo `tipo=testo` |
| `layout_immagine` | select | `nessuna` \| `sfondo` \| `laterale-dx` \| `laterale-sx` |
| `articoli` | alias M2M → `articoli` | Tramite junction `verticale_blocchi_articoli` |

**Junction `verticale_blocchi_articoli`**: `blocco_id` (integer FK), `articolo_id` (uuid FK), `ordine` (sort)

**Permessi Directus**: tutte e 5 le policy hanno read su `verticali`, `verticale_blocchi`, `verticale_blocchi_articoli` con `fields: ['*']`.

**⚠️ Gotcha Directus 11 — da sapere per manutenzione schema:**
1. Il campo alias `sezioni` su `verticali` va creato esplicitamente via `/fields/verticali` con `type:alias, special:['o2m']` — non viene auto-creato dalla relazione
2. La relazione M2M lato `blocco_id` richiede `one_field:'articoli'` e `sort_field:'ordine'` settati esplicitamente via PATCH su `/relations/verticale_blocchi_articoli/blocco_id`
3. `hero_immagine` ritorna UUID plain string, non `{ id }` — query con `fields=hero_immagine` (senza `.id`)
4. POST su `verticale_blocchi` va fatto con `?fields=id,ordine,...` esplicitando i campi fisici — se includi l'alias `articoli` nel SELECT la query SQL va in errore

### Architettura frontend (live)

```
src/
├── components/
│   ├── VerticaleContent.astro        — layout principale; legge tema_visivo → CSS class,
│   │                                   canonical /it/focus/{slug}/ + hreflang IT/EN
│   ├── VerticaleBloccoTesto.astro    — blocco testo + immagine (4 layout)
│   └── VerticaleGruppoArticoli.astro — heading sezione + ArticleCard grid (3-2-1 col)
├── pages/
│   ├── it/focus/[vertical].astro     — prerender, getStaticPaths → slug IT
│   └── en/focus/[vertical].astro     — prerender, getStaticPaths → slug_en EN
└── lib/
    └── directus.ts                   — getVerticali(), getVerticaleBySlug(),
                                        getVerticaleBySlugEN(), VERTICALE_FIELDS, normalizeVerticale()
```

**⚠️ REGOLA OBBLIGATORIA — `<main class="site-main">` attorno al contenuto**

Ogni componente che usa `BaseLayout` DEVE wrappare il suo contenuto in `<main class="site-main">`. Senza di esso il footer si posiziona immediatamente dopo l'header perché il CSS del layout usa `site-main` come flex item che spinge il footer in fondo. `VerticaleContent.astro` e qualsiasi futura pagina focus devono rispettare questa regola. Il pattern corretto è sempre:

```astro
<BaseLayout ...>
  <main class="site-main">
    <!-- contenuto pagina -->
  </main>
</BaseLayout>
```

**`VERTICALE_FIELDS`** (query Directus): tutti i campi flat + nested `sezioni.*`, `sezioni.immagine.id`, `sezioni.articoli.articolo_id.*` incluso `autore.nome_completo`, `autore.slug`, `immagine_copertina.id`.

**`normalizeVerticale()`**: ordina `sezioni` per campo `ordine` ascending (Directus non garantisce l'ordine senza `sort` param esplicito sui blocchi).

### CSS skin (`tema_visivo`)

Ogni skin è una classe CSS `verticale--{nome}` che sovrascrive le variabili `--v-accent` e `--v-hero-overlay`:

| Skin | `--v-accent` | `--v-hero-overlay` | Override aggiuntivi |
|------|-------------|-------------------|---------------------|
| `chiaro` | `#008b8b` (teal) | `rgba(20,47,47,.45)` | — |
| `scuro` | `#c0392b` (rosso) | `rgba(10,10,20,.72)` | `.verticale-intro` sfondo nero, testo bianco |
| `caldo` | `#b5651d` (terracotta) | `rgba(90,40,10,.50)` | `.verticale-intro` sfondo crema |
| `magazine` | `#1a1a1a` (nero) | `rgba(0,0,0,.65)` | Titolo più grande, letter-spacing |

### Lavoro fatto (2026-04-29/30)

| Data | Cosa | Commit |
|------|------|--------|
| 2026-04-29 | Schema Directus creato via script API (script idempotente) | `07b10f8d` |
| 2026-04-29 | Tipi TS + fetch functions in `directus.ts` | `07b10f8d` |
| 2026-04-29 | Componenti `VerticaleContent`, `VerticaleBloccoTesto`, `VerticaleGruppoArticoli` | `07b10f8d` |
| 2026-04-29 | Route IT/EN prerender + fix bug autore link (`getAuthorBasePath`) | `07b10f8d` |
| 2026-04-29 | Debug permessi Directus (alias field, M2M one_field) | — |
| 2026-04-29 | Popolata pagina Mariangela Bertolini (14 articoli, 5 blocchi, citazioni) | — |
| 2026-04-30 | Fix `hero_immagine` UUID plain string | `7034b3bb` |
| 2026-04-30 | Refactor route `/it/focus/` + `/en/focus/` | `91a8ccdb` |
| 2026-04-30 | Fix footer: `<main class="site-main">` aggiunto a `VerticaleContent` | `038f1b21` |
| 2026-04-30 | Fix CSS: `ArticleCard` styles → `global.css` (risolve Vite chunk splitting su nuove route) | `4f516c76` |

### Roadmap per chiudere VERT-01

| Step | Task | Stato | Note |
|------|------|-------|------|
| ✅ | Schema Directus completo + permessi | Fatto | Script `scripts/setup-verticali-schema.mjs` |
| ✅ | Componenti Astro + route prerender | Fatto | `VerticaleContent.astro` e sub-componenti |
| ✅ | Prima pagina: Mariangela Bertolini | Fatto | Live staging `/it/focus/mariangela-bertolini/` |
| ✅ | Fix footer (site-main wrapper) | Fatto | `038f1b21` |
| ✅ | Fix CSS ArticleCard (global.css) | Fatto | `4f516c76` |
| 🟡 | Verifica visiva staging post-rebuild | Pendente | Controllare hero, card stili, footer su `/it/focus/mariangela-bertolini/` |
| 🔴 | Popolare 7 pagine restanti (IT) | Da fare | Vedi tabella "Le 8 pagine focus" |
| 🔴 | Revisione editoriale intro e testi (IT) | Da fare | Redazione |
| 🔴 | Popolare versioni EN di tutte le pagine | Da fare | `intro_en`, `titolo_sezione_en`, testi blocchi |
| 🔴 | Listing page `/it/focus/` e `/en/focus/` | Da fare | `src/pages/it/focus/index.astro` — griglia di tutti i focus pubblicati |
| 🔴 | Link "Focus" nel megamenu e navbar | Da fare | Voce in `Header.astro` → `/it/focus/` |
| 🔴 | Indicizzazione Algolia (VERT-SEARCH) | Da fare | Tipo `focus`, dopo ≥4 pagine stabili |
| 🔴 | Smoke test hreflang + canonical | Da fare | Verificare su staging con tool SEO |
| 🔴 | Sitemap IT/EN con `/it/focus/*` | Da fare | Controllare `sitemap.xml.ts` e `sitemap-en.xml.ts` |

### Note editoriali per ogni pagina

- **mariangela-bertolini** (✅): intro biografica, 3 gruppi articoli raccordati da citazioni (Mariangela + Jean Vanier). Da aggiungere: intro EN, hero visibile.
- **ciao-stefano-di-franco**: pagina memorial — skin `magazine`, intro commemorativa, raccolta articoli scritti o dedicati a Stefano di Franco.
- **aktion-t4**: dossier storico pesante — skin `scuro`, intro densa con contesto storico, blocchi testo che raccordano le fasi storiche + articoli documentaristici.
- **autismo / catechesi-e-disabilita / cinema-e-disabilita**: hub tematici puri — articoli protagonisti, testo di raccordo leggero, più sezioni con titolo per sotto-tema.
- **noi-papa-un-figlio-disabile**: raccolta voci per tipo narratore — gruppare articoli per "voci" (padri, madri, fratelli, nonni) con heading sezione distinto per gruppo.
- **studiosi-educatori-e-attivisti**: elenco persone — valutare se serve layout da "directory" (card persona con bio breve) oltre agli articoli. Da discutere.

---

## § Iter — Creare una nuova pagina/template (checklist completa)

Queste regole valgono per qualsiasi nuova sezione del sito: una nuova tipologia di pagina (es. "Dossier", "Serie", "Evento"), una nuova route statistica (es. `/manifesto/`), o una nuova listing page.

---

### Fase 0 — Architettura (prima di toccare il codice)

Rispondere a queste domande prima di aprire un file:

1. **Dati**: da dove vengono? Directus (dinamico) o `src/data/*.json` (statico)?
2. **Prerender o SSR?** Se i dati vengono da Directus al build time → `export const prerender = true` + `getStaticPaths`. Se i dati cambiano spesso senza rebuild → SSR (ma attenzione: ogni SSR ha un costo su CF Workers).
3. **Quante lingue?** IT solo? IT+EN? Progettare multilingua fin dall'inizio (regola CLAUDE.md).
4. **Componente condiviso?** Se la pagina esiste in IT e EN (o altre lingue future), il markup va in un componente con prop `lang` — mai duplicare markup tra route.
5. **URL**: coerente con il prefisso `/it/` per contenuto italiano? Permette listing page futura?
6. **CSS**: il componente usa altri componenti? Quanti livelli di profondità? Se usa componenti già diffusi nel sito (come `ArticleCard`), la loro CSS è già in `global.css`.

---

### Fase 1 — Schema Directus (se serve una nuova collection)

Se la pagina ha dati propri in Directus:

- [ ] Creare script idempotente `scripts/setup-{nome}-schema.mjs`
- [ ] Creare la collection con campi base: `id`, `slug` (unique), `slug_en` (unique), `pubblicato` (boolean)
- [ ] Aggiungere campi multilingua: `titolo` + `titolo_en`, `intro` + `intro_en`, ecc.
- [ ] Se ci sono relazioni O2M: creare la relazione **E** il campo alias sulla collection parent esplicitamente (Directus 11 non crea il campo alias automaticamente dalla relazione)
- [ ] Se ci sono relazioni M2M con ordinamento: verificare che `one_field` e `sort_field` siano settati sulla relazione junction via PATCH `/relations/{junction}/{fk_field}`
- [ ] Aggiungere permessi read su tutte e 5 le policy Directus per le nuove collection: `verticali`, `verticale_blocchi`, `verticale_blocchi_articoli` (o qualunque sia il nome)
- [ ] Testare la query con il token build: `curl -H "Authorization: Bearer $BUILD_TOKEN" "https://cms.ombreeluci.it/items/{collection}?fields=*"` — deve restituire 200 con dati (non 403)
- [ ] Eseguire lo script: `node scripts/setup-{nome}-schema.mjs`

**Gotcha Directus 11** (già documentati sopra in § VERT-01 ma ripetuti qui per comodità):
- Campo `file-image` con `type: uuid` → restituisce UUID plain string, non `{ id: string }`. Query: `?fields=hero_immagine` (non `hero_immagine.id`)
- POST su collection con alias nel SELECT → SQL error. Usare `?fields=id,campo1,campo2,...` escludendo alias
- M2M: `one_field` su junction relation deve essere settato manualmente

---

### Fase 2 — TypeScript (src/lib/directus.ts)

- [ ] Aggiungere interfaccia `type NuovaCollection = { id: number; slug: string; slug_en: string; ... }`
- [ ] Definire `NUOVA_COLLECTION_FIELDS` con tutti i campi da fetchare (includere nested con dot notation)
- [ ] Scrivere funzione `getNuoveCollection()` che chiama Directus con filter `pubblicato=true`
- [ ] Se serve fetch per singolo slug IT: `getNuovaCollectionBySlug(slug: string)`
- [ ] Se serve fetch per singolo slug EN: `getNuovaCollectionBySlugEN(slug: string)`
- [ ] Aggiungere `normalizeNuovaCollection(raw)` se i dati necessitano ordinamento o trasformazione

---

### Fase 3 — Componenti Astro

**Regola CLAUDE.md**: SEMPRE componente condiviso con prop `lang`, MAI markup duplicato tra route.

- [ ] Creare `src/components/NuovaPaginaContent.astro` con:
  - Props: `{ data: NuovaCollection; lang: Locale }`
  - Wrapper obbligatorio: `<main class="site-main">` **immediatamente dopo** `<BaseLayout>`
  - `<BaseLayout title={...} description={...} lang={lang} canonical={...} alternates={[...]} noindex={false}>`
  - Logica multilingua: `const titolo = lang === 'en' ? (data.titolo_en || data.titolo) : data.titolo`
  - URL canonico e alternate correttamente valorizzati
- [ ] Se il componente renderizza altri componenti già esistenti (es. `ArticleCard`): **non fare niente di speciale** — la CSS di ArticleCard è già in `global.css`
- [ ] Se il componente introduce CSS custom in `<style>`: usare classi con prefisso univoco (es. `.nuova-hero`, `.nuova-grid`) per evitare collisioni

**Struttura HTML obbligatoria:**

```astro
<BaseLayout title={titolo} description={desc} lang={lang} canonical={canonicalUrl}
  alternates={[{ lang: 'it', url: itUrl }, { lang: 'en', url: enUrl }]}
  noindex={false}
>
  <main class="site-main">
    <!-- contenuto -->
  </main>
</BaseLayout>
```

⚠️ **MAI omettere `<main class="site-main">`**: il footer usa `position:fixed; z-index:1`. Il `site-main` ha `position:relative; z-index:10; background-color:var(--bg-light)` — senza di esso il footer è visibile sopra il contenuto della pagina.

---

### Fase 4 — Route Astro

Creare le route per ogni lingua:

**`src/pages/it/nuova-sezione/[slug].astro`:**

```astro
---
export const prerender = true;
import NuovaPaginaContent from '../../../components/NuovaPaginaContent.astro';
import { getNuoveCollection } from '../../../lib/directus';

export async function getStaticPaths() {
  const items = await getNuoveCollection();
  return items.map(item => ({
    params: { slug: item.slug },
    props: { data: item },
  }));
}

const { data } = Astro.props;
---
<NuovaPaginaContent data={data} lang="it" />
```

**`src/pages/en/nuova-sezione/[slug].astro`:** identico ma `slug: item.slug_en` e `lang="en"`.

**Se serve listing page:**
- `src/pages/it/nuova-sezione/index.astro` — `export const prerender = true`, fetch tutti i record pubblicati, componente `NuovaSezioneListingContent.astro`
- `src/pages/en/nuova-sezione/index.astro` — stesso componente con `lang="en"`

---

### Fase 5 — Navigazione (Header + Footer)

- [ ] Aggiungere voce nel megamenu in `src/components/Header.astro` con link `/it/nuova-sezione/` (IT) e `/en/nuova-sezione/` (EN)
- [ ] Valutare se aggiungere voce nel footer `src/components/Footer.astro` (colonna "Sezioni" o colonna dedicata)
- [ ] Se la sezione è importante per la navigazione: verificare che sia visibile su mobile (hamburger menu)

---

### Fase 6 — SEO e sitemap

- [ ] Verificare che `canonical` e `alternates` (hreflang) siano passati correttamente a `BaseLayout`
- [ ] Aggiungere le URL della nuova sezione a `src/pages/sitemap.xml.ts` (IT)
- [ ] Aggiungere le URL a `src/pages/sitemap-en.xml.ts` (EN)
- [ ] La nuova pagina deve avere `noindex={false}` (o omettere, il default è `false`)

---

### Fase 7 — Ricerca Algolia (se il contenuto è ricercabile)

- [ ] Aprire `scripts/algolia/index-all.mjs`
- [ ] Aggiungere un blocco di indicizzazione per la nuova collection (tipo `focus`, `dossier`, ecc.)
- [ ] Campi minimi: `objectID`, `type`, `title`, `intro` (HTML stripped), `slug`, `slug_en`, `url`
- [ ] Eseguire: `node scripts/algolia/index-all.mjs` (richiede `.env` con `ALGOLIA_APPLICATION_ID` + `ALGOLIA_WRITE_API`)
- [ ] Verificare che i nuovi record compaiano nella ricerca su staging

---

### Fase 8 — Build e verifica staging

- [ ] Commit e push su `main` → CF Pages rebuilda automaticamente
- [ ] Attendere il completamento del build (2-4 minuti di solito)
- [ ] Verificare la pagina su staging: `https://ombreeluci-staging.pages.dev/it/nuova-sezione/slug/`
- [ ] Checklist visiva rapida:
  - [ ] Hero image visibile (se prevista)
  - [ ] Testo e card stilate correttamente
  - [ ] Footer SOTTO il contenuto (non sopra)
  - [ ] Language switcher porta alla versione EN
  - [ ] `curl https://ombreeluci-staging.pages.dev/it/nuova-sezione/slug/ | grep -E 'canonical|hreflang'` → URL corretti
  - [ ] Nessun errore in console DevTools

---

### Errori comuni da evitare (storia)

| Errore | Causa | Fix |
|--------|-------|-----|
| Footer visibile sopra il contenuto | Manca `<main class="site-main">` nel componente | Aggiungere wrapper obbligatorio |
| CSS mancante su nuove route | Componente profondamente nested → Vite chunk non linkato | CSS della primitiva UI in `global.css` |
| 403 su query Directus al build | Permessi non aggiunti alle policy | PATCH `/permissions` per ogni policy |
| 403 su campo alias (O2M) | Campo alias non creato manualmente in Directus 11 | POST `/fields/{collection}` con `type:alias, special:['o2m']` |
| Articoli M2M non ritornano | `one_field` null sulla relazione junction | PATCH `/relations/{junction}/{fk_field}` con `one_field` e `sort_field` |
| `hero_immagine` undefined | Query con `.id` su campo UUID plain | Cambiare query a `hero_immagine` (senza `.id`), tipo TS `string | null` |
| POST con alias nel SELECT → SQL error | Directus include l'alias nella query SQL | POST con `?fields=id,campo1,...` (solo campi fisici) |
| Markup duplicato tra IT e EN | Fretta di fare la route EN | Fermarsi, estrarre componente condiviso, poi fare entrambe le route |
