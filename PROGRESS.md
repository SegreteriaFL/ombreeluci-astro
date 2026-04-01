# PROGRESS — Ombre e Luci

**Ultimo aggiornamento:** 2026-03-31
**Stato:** Stack Astro+Directus attivo su staging. WordPress su Aruba resta online fino al cutover DNS finale.

---

## Riferimenti rapidi

| Cosa | Dove |
|------|------|
| Sito staging | https://ombreeluci-staging.pages.dev |
| CMS Directus | https://cms.ombreeluci.it (admin) |
| VPS Hetzner | 159.69.196.64 — CX23, Ubuntu 24.04, €4.09/mese |
| R2 bucket | `oel-media` (pub: `pub-2251dc2142e3492a961f629f2af543d0.r2.dev`) |
| Credenziali VPS | `vps_credentials.txt` (locale, non committare) |
| Credenziali R2 | `.env` (non committare) |

---

## Stack tecnico

| Layer | Tecnologia | Stato |
|-------|-----------|-------|
| Frontend | Astro (100% statico) su Cloudflare Pages | Attivo |
| CMS | Directus su Hetzner CX23 (Docker) | Operativo |
| Database | PostgreSQL 16 + pgvector 0.8.2 | Attivo |
| Storage media | Cloudflare R2 `oel-media` | Attivo |
| CMS temporaneo | Keystatic Worker su CF Workers | Attivo (solo nuovi articoli) |
| Redirect SEO | `public/_redirects` (2000) + CF Worker overflow (16630) | Attivo |
| Tunnel HTTPS | cloudflared `cms-oel` → porta 8055 | Attivo (systemd, boot) |

---

## Dati importati (stato al 2026-03-22)

| Risorsa | Quantità | Note |
|---------|----------|------|
| Articoli pubblicati | 3527 (IT: 3396, EN: 131) | Corpo HTML pulito, tassonomia, ruoli editoriali |
| Autori | 352 | 88 con foto su R2 (`autori/{uuid}`) |
| Numeri rivista | 204 | Copertine su R2, `copertina_url` popolato |
| Temi / Tag | 285 / 816 | M2M: 6676 articoli↔temi + 2764 articoli↔tag |
| Copertine articoli | 2972/2972 | Su R2 (`copertine/{uuid}`), campo `immagine_copertina` |
| Redirect SEO | 18630 totali | 2000 statici + 16630 via Worker |

---

## ⚠️ Da validare dalla Redazione

> Controllare sul sito staging: **https://ombreeluci-staging.pages.dev**
> Per accedere al CMS: **https://cms.ombreeluci.it**

| # | Priorità | Cosa verificare | Come farlo |
|---|----------|-----------------|------------|
| V-01 | 🔴 Alta | **13 categorie tematiche** — la distribuzione degli articoli è sensata? Le categorie sono corrette? | Staging → menu Temi → apri ogni pagina `/categoria/*` |
| V-02 | 🔴 Alta | **21 articoli "Da categorizzare"** — vanno assegnati manualmente alla categoria giusta | Directus → Articoli → filtra `categoria_menu = Da categorizzare` |
| V-03 | 🟡 Media | **Ruoli editoriali** — `portante/strutturale/laterale/trasversale` vanno rivalutati per le nuove categorie (il ruolo è relativo alla categoria, non assoluto) | Directus → per ogni categoria, identificare quali articoli meritano "portante" |
| V-04 | 🟡 Media | **Fede e Luce (1114 articoli)** — categoria molto grande; la distribuzione interna è sensata o serve suddivisione? | Staging → `/categoria/fede-e-luce` |
| V-05 | 🟡 Media | **35 articoli Jean Vanier** — hanno `tema_label = null` dopo rimozione categoria "Personaggi che ispirano". Da riassegnare (es. "Fede e Luce") | Directus → Articoli → filtra `tema_label` vuoto |
| V-06 | 🟡 Media | **Mega-menu** — 13 nuove categorie presenti e corrette? Link "Dialogo aperto" funzionante? | Staging → apri mega-menu |
| V-07 | 🟡 Media | **Pagina /sezioni/dialogo-aperto** — 156 articoli caricano e sono pertinenti alla serie? | Staging → `/sezioni/dialogo-aperto` |
| V-08 | 🟢 Bassa | **Redirect legacy** — i vecchi URL WordPress reindirizzano al nuovo sito? | Prova: `ombreeluci.it/2015/03/20/qualche-slug/` → deve arrivare su `/blog/qualche-slug/` |
| V-09 | 🟢 Bassa | **Filtri Directus** — filtro per numero rivista e data_pubblicazione funzionano? | Directus → Articoli → icona filtro → testa i due campi |
| V-10 | 🟢 Bassa | **Didascalie copertina** — 2004 didascalie visibili sotto la foto copertina: sono corrette? Segnalare quelle errate o fuori contesto | Staging → apri vari articoli → guarda il testo sotto la foto |
| V-11 | 🟢 Bassa | **"Leggi anche" in-content** — il box a metà testo propone un articolo pertinente? | Staging → apri una decina di articoli → verifica il box "Leggi anche" a metà |
| V-12 | 🟢 Bassa | **Correlati in calce** — i 3 articoli in fondo sono tematicamente vicini? | Staging → scorri in fondo a vari articoli |
| V-13 | 🟡 Media | **Homepage v2** — le 5 sezioni sono corrette? Hero (articoli recenti in rotazione), Da vicino (diari + testimonianze), Esplora (8 categorie), La rivista (ultimo numero + archivio), Unisciti (CTA). Gli articoli proposti sono di qualità? | Staging → homepage, ricaricare più volte per vedere la rotazione |
| V-14 | 🟡 Media | **Embed video YouTube** — i video nel corpo degli articoli si vedono e si riproducono correttamente? | Staging → cerca articoli con video, es. `/blog/berlinale-74-orso-doro/` |
| V-15 | 🟡 Media | **Embed Instagram** — i post Instagram incorporati nel testo si visualizzano? | Staging → articoli con post Instagram incorporati |
| V-16 | 🟡 Media | **Pull quote (evidenziazione)** — 570 citazioni in evidenza reinserite nel testo: sono al posto giusto e formattate bene (testo centrato, bordi teal)? 16 non trovate vanno inserite a mano | Staging → apri articoli con citazioni in evidenza, es. saggi e reportage lunghi |
| V-17 | 🟡 Media | **Sommari numeri rivista** — 71 numeri hanno ora un testo introduttivo narrativo sulla pagina del numero. È leggibile e corretto? | Staging → `/archivio` → apri alcuni numeri → verifica la descrizione |
| V-18 | 🟢 Bassa | **Sottotitolo da SEO description** — gli articoli senza sottotitolo mostrano la SEO description come sottotitolo. È sempre un testo adeguato come sottotitolo? | Staging → apri articoli senza sottotitolo originale, verifica che il testo sotto il titolo abbia senso |
| V-19 | 🟢 Bassa | **Pagine categoria: colonna "In evidenza"** — gli articoli nella colonna destra sono quelli giusti? (Selezionati manualmente da Directus o automatici per ruolo editoriale) | Staging → `/categoria/*` → verifica colonna destra |
| V-20 | 🟢 Bassa | **Immagini inline nel corpo articoli** — 144 articoli avevano immagini WP inline ora migrate su R2. Verificare che le immagini si vedano correttamente e che le didascalie (figcaption) siano leggibili. | Staging → apri articoli con foto nel testo, es. `/blog/siamo-venuti-ad-assisi-per/`, `/blog/ti-ricordi-nicole/` |

---

## Backlog — Pre-lancio obbligatorio

> Queste attività bloccano o condizionano il cutover DNS. Il cutover avviene quando lo staging è pronto — nessuna scadenza fissa. Ordinate per sequenza logica.

### ARCH — Refactor architetturale

| ID | Effort | Descrizione |
|----|--------|-------------|
| ARCH-01 | ✅ Fatto | **`BaseHead.astro`** — componente condiviso per tutto il `<head>`. Props: `title`, `description`, `ogImage?`, `ogType?`, `canonical?`, `noindex?`, `lang?`, `alternates?`. Contiene: charset, viewport, favicon (png+svg+ico), title con separatore `–` automatico, meta description, Open Graph completo, Twitter Card, canonical, hreflang, Google Site Verification, preconnect R2, ViewTransitions, slot per tag extra (JSON-LD). |
| ARCH-02 | ✅ Fatto | **`BaseLayout.astro`** — wrapper `<html lang>+<head>+<body>` con slot. Props passate a BaseHead + `bodyClass` + `alternateArticleUrl` (per LanguageSelector). Slot: default (contenuto pagina) e `head` (JSON-LD, meta custom). Usato da tutte le 22 pagine del sito. Pagine custom verticali (serie, dossier) possono iniettare hero full-width e sezioni arbitrarie nello slot default. |
| ARCH-03 | ✅ Fatto | **CSS vars breakpoint** — in `global.css` `:root`: `--bp-mobile: 480px`, `--bp-tablet: 768px`, `--bp-desktop: 1024px`, `--bp-wide: 1280px`. Documentati come riferimento (non usabili direttamente in `@media` queries CSS nativo). |

### Pre-lancio

| ID | Effort | Descrizione |
|----|--------|-------------|
| GR-03 | S | **Google Search Console verifica** — meta tag `CHp0QtH-sw0M_ZYVjj6LRqHxV-4Z72IoYR_aiX9c6ZE` in `BaseHead.astro` (dopo ARCH-01). Critico: perdersi l'accesso a GSC al cutover DNS. |
| GR-01 | M | **Cookie consent Iubenda** — script banner in `BaseHead.astro`. siteId `1433329`, IT `66379072`, EN `53976128`. ⚠️ Correggere `ownerName: "fedeeluce.it"` → `"ombreeluci.it"` sul pannello Iubenda prima di attivare. Prerequisito per GR-02. |
| GR-02 | S | **Google Tag Manager** — snippet GTM `GTM-P92QKKXK` in `BaseHead.astro` (head + noscript body). Gestisce GA4, AdSense (`ca-pub-2238371130141396`) e Twitter pixel (`o5eld`) senza script separati. Condizionato al consenso Iubenda. |
| V-02 | Redazione | **21 articoli "Da categorizzare"** — assegnazione manuale categoria in Directus. Sblocca US-15. |
| US-15 | M | **Rivalutazione ruoli editoriali** — ridefinire portanti/strutturali per ogni categoria dopo V-02. Sblocca homepage dinamica. |
| UX-01 | XL | **Mobile/tablet overhaul globale** — 65-70% del traffico è mobile. Ripensare: header/mega-menu touch, hero home <600px, diari (6col → grid/scroll), categorie, autori, articoli (padding, tipografia, capolettera). Usare breakpoint da ARCH-03. |
| UX-05 | M | **Mega-menu active state** — `Astro.url.pathname` in `Header.astro`, classe `active`/`aria-current` sul link sezione corrente. |
| US-08 | M | **Info testata numero rivista** — campo `periodo_label` mancante (es. "Anno 41 – N.3 – Lug-Ago-Set 2023"). Dati nel dump Divi: estrarre con script, popolare Directus. |
| DA-00 | ✅ Fatto | **Immagini inline corpo articoli** — 259 immagini su 144 articoli migrate su R2 (`corpo/`), src aggiornati in Directus. WordPress può essere spento senza rompere le immagini inline. |
| — | S | **Ruoli e permessi Directus** — profili redazione con accessi limitati ai soli campi necessari. |
| WP-01 | ✅ Fatto | **Proxy WordPress via CF Worker** — `/wp-admin/*`, `/wp-login.php`, ecc. proxati a Aruba IP `89.46.105.36`. La redazione può continuare a usare WP in produzione durante il periodo di staging. |
| ARCH-04 | ✅ Fatto | **Hybrid SSR + edge cache invalidation** — aggiornamento editoriale quasi real-time senza full rebuild. Manca: configurare secrets Worker + Directus Flow (vedi istruzioni sotto). |
| — | — | **Cutover DNS** `ombreeluci.it` → Cloudflare Pages. Step finale. Prerequisiti: tutti i pre-lancio completati + validazione staging ok. |

### ARCH-04 — Hybrid SSR + Directus webhook + CF edge cache

**Obiettivo:** quando un redattore salva un articolo in Directus, il sito aggiornato è visibile entro ~5 secondi. Nessuna build da 10 minuti.

**Architettura:**

```
Redattore salva articolo in Directus
    │
    ▼
Directus Flow (trigger: items.update su "articoli")
    │  POST {slug, secret} a CF Worker webhook endpoint
    ▼
CF Worker: verifica secret, chiama CF Cache Purge API
    │  DELETE https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache
    │  body: { "files": ["https://ombreeluci.it/blog/{slug}/"] }
    ▼
Cloudflare invalida la cache per quell'URL
    │
    ▼
Prossimo visitatore: CF edge richiede la pagina a Cloudflare Pages
    │  blog/[...slug].astro → prerender:false → SSR on-demand
    │  Legge dati freschi da Directus, renderizza, mette in cache (Cache-Control: s-maxage=86400)
    ▼
Risposta in <200ms (edge rendering), poi in cache per i successivi visitatori
```

**Componenti da implementare:**

1. **`astro.config.mjs`** — aggiungere `@astrojs/cloudflare` adapter + `output: 'hybrid'`
   - Pagine strutturali: mantengono `export const prerender = true` (o nessun export, default hybrid)
   - `blog/[...slug].astro`: aggiungere `export const prerender = false`
   - Attenzione: `getStaticPaths()` va rimosso da `[...slug].astro`, la route diventa dinamica

2. **`src/pages/blog/[...slug].astro`** — refactor da getStaticPaths a params dinamici:
   ```ts
   export const prerender = false;
   const { slug } = Astro.params;
   const articolo = await getArticoloBySlug(slug); // nuova funzione in directus.ts
   if (!articolo) return Astro.redirect('/404', 404);
   // Imposta cache lunga, invalidata solo da webhook
   Astro.response.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600');
   ```

3. **`src/lib/directus.ts`** — aggiungere `getArticoloBySlug(slug)` che fetcha singolo articolo

4. **`cf-worker/redirect-worker.js`** — aggiungere endpoint webhook:
   ```js
   // POST /api/revalidate  {slug, secret}
   // verifica secret, chiama CF Cache Purge API, ritorna {ok: true}
   ```
   Secret condiviso salvato come CF Worker secret (non in codice).

5. **Directus Flow** — configurare nel pannello Directus:
   - Trigger: `items.update` e `items.create` sulla collezione `articoli`
   - Condition: `stato === 'published'`
   - Action: Webhook POST a `https://ombreeluci.it/api/revalidate` con body `{slug: "{{slug}}", secret: "{{$env.REVALIDATE_SECRET}}"}`

**Trade-off e limitazioni:**
- Pagefind (ricerca full-text) si aggiorna solo al build notturno schedulato — accettabile: un articolo nuovo appare nei risultati di ricerca entro 24h
- `getAllArticoli()` usato in home/categoria/autori resta statico (build) — le listing si aggiornano al build notturno, solo la pagina articolo singola è live
- Se si vuole anche listing live: aggiungere `prerender: false` + cache invalidation anche per `/categoria/*` e home (più complesso, post-lancio)
- Correlati in calce fallback per categoria rimosso in SSR (troppo costoso senza `allArticoli`): 3 articoli UMAP, nessun fallback categoria

**Cosa è stato implementato (2026-04-01):**
- `astro.config.mjs`: `output: 'hybrid'` + adapter `@astrojs/cloudflare`
- `blog/[...slug].astro`: `export const prerender = false`, SSR on-demand, cache headers `s-maxage=86400, stale-while-revalidate=3600, stale-if-error=604800`
- `src/lib/directus.ts`: aggiunta `getArticoliBySlugList()` per fetch correlati mirato
- `cf-worker/redirect-worker.js`: aggiunto endpoint `POST /api/revalidate` con verifica secret, CF Cache Purge API, prewarm silenzioso

**Setup richiesto (da fare manualmente — 15 min):**

1. Genera il secret:
   ```bash
   openssl rand -hex 32
   ```

2. Configura i secrets del Worker:
   ```bash
   cd cf-worker
   wrangler secret put REVALIDATE_SECRET   # incolla il valore generato sopra
   wrangler secret put CF_ZONE_ID          # da CF Dashboard → ombreeluci.it → Overview (destra)
   wrangler secret put CF_PURGE_TOKEN      # CF Dashboard → My Profile → API Tokens → Create Token
                                            # Template: "Cache Purge" → Zone: ombreeluci.it
   ```

3. Deploy Worker aggiornato:
   ```bash
   cd cf-worker && wrangler deploy
   ```

4. Configura Directus Flow (pannello Directus → Flows → Nuovo Flow):
   - **Nome:** `Pubblica articolo → Purge cache`
   - **Trigger:** Event Hook → `items.update` e `items.create` → collezione `articoli`
   - **Condition:** `{{ $trigger.payload.stato }} === 'published'`
   - **Action:** Webhook / Request
     - Method: POST
     - URL: `https://ombreeluci.it/api/revalidate`
     - Body: `{"slug": "{{ $trigger.payload.slug }}", "secret": "IL_SECRET_GENERATO_AL_PASSO_1"}`
     - Headers: `Content-Type: application/json`

**Variabili d'ambiente necessarie (Worker secrets):**
- `REVALIDATE_SECRET` — secret condiviso Directus↔Worker
- `CF_ZONE_ID` — Zone ID del dominio ombreeluci.it
- `CF_PURGE_TOKEN` — CF API Token con permesso `Cache Purge` su ombreeluci.it

---

## Backlog — Post-lancio

### UX/UI

> Legenda: 🔴 Alta · 🟡 Media · 🟢 Bassa — S < 2h · M 2-8h · L 1-3gg

| ID | Gravità | Effort | Descrizione |
|----|---------|--------|-------------|
| UX-07 | 🟡 | M | **Articolo su mobile** — padding laterale 0, tipografia non fluida, capolettera spezza layout su 390px. Audit completo `blog/[...slug].astro`. |
| UX-08 | 🟡 | M | **Categoria su mobile** — layout a due colonne non ottimizzato per touch. |
| UX-09 | 🟡 | S | **Foto autore: 404 silenziose** — mostrare avatar SVG placeholder se `foto` assente, rimuovere fallback a path locale. |
| UX-10 | 🟡 | S | **Selettore lingua** — nascondere o disabilitare (con tooltip) se non esiste traduzione dell'articolo. |
| UX-11 | 🟡 | M | **Diari home su mobile** — 6 card in 2 colonne affollate. Passare a layout orizzontale (foto 64px + testo) o scroll con snap. |
| UX-12 | 🟡 | M | **IssueCard su mobile** — griglia archivio sotto 480px: passare a 2 colonne fisse. |
| UX-13 | 🟡 | S | **Testimonianze home su tablet** — layout 1fr-2fr-1fr non ha breakpoint 768-1024px. |
| UX-14 | 🟢 | M | **Tipografia serif/sans** — regola esplicita mancante: serif solo per contenuto narrativo, sans per UI/navigazione. |
| UX-15 | 🟢 | S | **Box "Ultimo numero" home su mobile** — stack verticale (testo sopra, copertina sotto max 240px). |
| UX-16 | 🟢 | S | **ArticleCard horizontal su mobile** — immagine 140px troppo piccola; layout verticale sotto 480px. |
| UX-17 | 🟢 | S | **Foto autore su mobile** — ridurre da 200px a 120-140px su mobile. |
| UX-18 | 🟢 | S | **Breadcrumb** — valutare riattivazione con design sobrio + `BreadcrumbList` JSON-LD. |
| UX-19 | 🟢 | M | **Pagine test/debug** — `test-lista`, `test-minimal`, `debug/audit-editoriale` pubblicamente accessibili. Rimuovere o proteggere pre-lancio. |
| UX-20 | 🟢 | S | **Reading time** — nascondere su articoli brevi (<300 parole) o storici (ante 2000). |

### Data / AI

| ID | Stato | Descrizione |
|----|-------|-------------|
| DA-00 | ✅ Fatto | **Immagini inline corpo articoli** — 259 immagini su 144 articoli migrate su R2 (`corpo/`), src aggiornati in Directus. figcaption inline stilizzata come didascalia copertina. |
| DA-01 | ✅ Fatto | **Alt text AI copertine** — 2972/2972 immagini processate da Claude Haiku, 76 malformati puliti, backfill su Directus completato (2972 ok, 0 err). Campo `description` popolato su tutti i file. |
| DA-02 | Post-lancio | **16 evidenziazioni non reinserite** — 11 articoli con ancora ambigua da inserire a mano in Directus: `un-panorama-riscoprire`, `mary-mount-settimane-al-sole`, `faccio-io`, `eucaristia-e-cresima-di-giacomo`, `lo-sconforto-emotivo-esige-comprensione`, `il-chicco`, `stai-pensando-me`, `gli-altri-siamo-noi`, `intervista-ad-andrea-romeo`, `genitori-e-medici-davanti-allannuncio-dellhandicap`, `salvatore-medico-pediatra-acondroplasico`. |
| DA-03 | Post-lancio | **Upgrade VPS CX23 → CX32** — prerequisito per embedding pgvector. |
| DA-04 | Post-lancio | **Ricerca semantica + correlati pgvector** — after DA-03 + cutover DNS. |
| DA-05 | Post-lancio | **Archive.org link** — 37 numeri (OEL 1-15, 34, 40, 131-172) senza `pdf_archive_url`. Scraping profilo archive.org + PATCH Directus. |
| DA-06 | Post-lancio | **Traduzione AI articoli** — traduzione automatica (Claude/DeepL) di tutti gli articoli IT in EN, poi ES e altre lingue. Da valutare: costo per articolo, qualità, flusso di revisione redazionale, struttura URL (`/en/blog/slug`), hreflang. Priorità EN (già presenti 131 articoli EN originali come baseline). |

### Performance / Core Web Vitals

> Rilevazioni da PageSpeed Insights su `/blog/suor-veronica-pompei/` (2026-03-31).

| ID | Gravità | Effort | Descrizione |
|----|---------|--------|-------------|
| PF-01 | 🔴 Alta | S | **Placeholder copertina troppo pesante** — `/placeholder/ph-1.jpg` è 4864×3648 px, 4.2 MB. Mostrata a 81×54 px. Risparmio stimato 4.2 MB. Fix: ridimensionare a 400px lato lungo e convertire in WebP/AVIF. |
| PF-02 | 🔴 Alta | S | **Cache-Control assente su R2** — le immagini `r2.dev/copertine/*` e `r2.dev/corpo/*` rispondono con TTL `None`. Risparmio stimato 366 KiB per visita ripetuta. Fix: aggiungere `Cache-Control: public, max-age=31536000, immutable` tramite Cloudflare Transform Rule sul dominio R2, oppure esporre le immagini via custom domain con Cache Rule dedicata. |
| PF-03 | 🟡 Media | M | **Immagini non responsive (srcset mancante)** — copertine servite full-size (es. 1370×771 px) per slot da 268×151 px. Risparmio stimato 208 KiB per copertina. Fix: usare Cloudflare Image Resizing (`?width=`, `?format=webp`) oppure generare `srcset` a build-time con dimensioni 320/640/1024. Impatta `ArticleCard`, hero copertina e `LeggiAnche`. |
| PF-04 | 🟡 Media | S | **CSS render-blocking** — `_slug_.css` (4.5 KiB, 150 ms) e `_diario_.css` (4.4 KiB, 460 ms) bloccano il rendering iniziale per ~610 ms totali. Risparmio stimato 1040 ms LCP. Fix: aggiungere `<link rel="preload" as="style">` per questi file, oppure estrarre il CSS critico e iniettarlo inline nel `<head>`. |
| PF-05 | 🟡 Media | S | **Immagini senza `width`/`height` espliciti** — causa CLS (layout shift) prima del caricamento. Fix: aggiungere `width` e `height` su tutti i tag `<img>` con dimensioni note (copertine, autori, icone). |
| PF-06 | 🟢 Bassa | S | **Icona fotocamera da WordPress** — `icon-camera.png` (124×124 px, 4.5 KB) servita da `ombreeluci.it/wp-content/` e mostrata a 16×16 px. Fix: sostituire con SVG inline (~200 byte, nessuna richiesta HTTP). |
| PF-07 | 🟢 Bassa | S | **Nessun hint preconnect per R2** — il browser scopre l'origine R2 solo al parsing HTML. Fix: aggiungere `<link rel="preconnect" href="https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev">` nel `<head>` di Layout.astro. |
| PF-08 | 🟢 Bassa | S | **Gerarchia heading non sequenziale** — PageSpeed segnala salti di livello (es. h1→h3 senza h2). Fix: audit heading in `blog/[...slug].astro` e componenti correlati. |
| PF-09 | 🟢 Bassa | S | **Contrasto insufficiente** — alcuni testi non superano il rapporto WCAG AA. Fix: audit con DevTools → Accessibility, aggiustare colori `--text-secondary` o varianti. |

### Crescita / Monetizzazione

| ID | Stato | Descrizione |
|----|-------|-------------|
| GR-01 | Pre-lancio | **Cookie consent Iubenda** — script banner da integrare in `Layout.astro`. Prerequisito per GA e AdSense. Credenziali WP: siteId `1433329`, cookiePolicyId IT `66379072`, EN `53976128`. ⚠️ Config WP ha `ownerName: "fedeeluce.it"` — da correggere in `ombreeluci.it` sul pannello Iubenda. Link policy già nel footer. |
| GR-02 | Pre-lancio | **Google Tag Manager + Analytics** — GTM container `GTM-P92QKKXK` (già attivo su WP). Inserire snippet GTM in `Layout.astro` (head + noscript body). GTM gestisce GA4, AdSense e Twitter pixel `o5eld` senza ulteriori script separati. Condizionare al consenso Iubenda (GR-01). |
| GR-03 | Pre-lancio | **Google Search Console — verifica dominio** — meta tag verifica `CHp0QtH-sw0M_ZYVjj6LRqHxV-4Z72IoYR_aiX9c6ZE` da aggiungere in `Layout.astro` prima del cutover DNS, altrimenti si perde l'accesso a GSC. |
| GR-04 | Post-lancio | **Google AdSense** — publisher ID `ca-pub-2238371130141396`. Da gestire via GTM dopo GR-01+GR-02. Valutare posizionamento non invasivo (dopo corpo articolo), compatibilità con missione editoriale. |
| GR-05 | Post-lancio | **Newsletter Mailchimp** — popup/form da reimplementare senza Dojo (obsoleto). Credenziali: uuid `00c5dad63480d9601563b5692`, lid `efd099264d`. Usare API Mailchimp embedded form o widget moderno. |
| GR-06 | Post-lancio | **CTA dinamiche e misurate** — CTA a fine articolo che ruotino tra proposte (abbonamento, donazione, newsletter, acquisto numero). Non ripetitive, contestuali al tema, monitorate via GA4 eventi custom. |

---

## Storico completamenti

### 2026-04-01

- **Refactor architetturale ARCH-01/02/03** — Introdotti `BaseHead.astro` e `BaseLayout.astro`. Tutte le 22 pagine del sito migrate al layout centralizzato. Eliminato boilerplate `<head>` duplicato in ogni pagina. OG tags, Twitter Card, canonical, GSC meta tag, preconnect R2 ora su tutte le pagine in un unico punto. CSS breakpoint vars documentate in `global.css`. Build: 4129 pagine, 0 errori.
- **Proxy WordPress CF Worker** — `cf-worker/redirect-worker.js` aggiornato con proxy trasparente verso Aruba IP `89.46.105.36` per route `/wp-admin/*`, `/wp-login.php`, `/wp-content/*`, `/wp-includes/*`, `/wp-json/*`, `/feed/*`, `/xmlrpc.php`. Deployato. Redazione può continuare a usare WordPress in produzione.
- **Backlog performance (PF-01→PF-09)** — Documentati in PROGRESS.md da analisi PageSpeed Insights.
- **Identificati asset WordPress da portare** — GTM `GTM-P92QKKXK`, AdSense `ca-pub-2238371130141396`, GSC `CHp0QtH-sw0M_ZYVjj6LRqHxV-4Z72IoYR_aiX9c6ZE`, Iubenda siteId `1433329`, Mailchimp uuid `00c5dad63480d9601563b5692`. Documentati in voci GR-01→GR-05.

### 2026-03-31

- **Homepage redesign v2** — 5 sezioni: Hero (pool 18 mesi, rotazione JS random), Da vicino (diari + testimonianze), Esplora (8 categorie), La rivista (ultimo numero + carousel), Unisciti (CTA + newsletter).
- **Correlati semantici UMAP** — `src/data/correlati.json` (3487 articoli × 5 vicini) via distanza euclidea su coordinate UMAP 3D precomputate. Zero query runtime.
- **"Leggi anche" build-time** — `LeggiAnche.astro` inserito staticamente dopo il 3° `</p>`. Primo vicino UMAP stessa lingua, senza loop A→B→A. CSS isolato da `.article-content :global()`.
- **Didascalie copertina Step 1** — 2004 articoli con `didascalia_copertina` da caption WP (strip HTML, encoding). Visibile sotto la foto con icona fotocamera.
- **Alt text AI Step 2** — job Claude Haiku in background su 2973 immagini (5 req/min).
- **Sottotitolo fallback SEO** — articoli senza sottotitolo mostrano `seo_description`.
- **Embed YouTube/Instagram build-time** — URL grezzi → `<iframe>` responsive. Instagram embed.js caricato solo se necessario.
- **Backfill `div.evidenziazione`** — 570/586 pull quote reinserite (97%) su 376 articoli.
- **Sommario numeri rivista** — 71/204 numeri con testo narrativo estratto da WP.
- **Placeholder copertina** — 4 immagini in `public/placeholder/`, selezione pseudo-random via hash slug.
- **UX: badge ruoli rimossi** dai lettori, hover state ArticleCard, badge categoria semplificato, ricerca mobile con overlay.
- **CSS** — rimosso underline da `a:hover` in `global.css`.

### 2026-03-30

- **DNS Aruba → Cloudflare** — nameserver aggiornati, propagazione completata.
- **Cloudflare Tunnel `cms.ombreeluci.it`** — cloudflared su VPS, tunnel `cms-oel`, systemd service. HTTPS senza esporre porte.
- **Tassonomia editoriale** — 16 temi Megacluster → 13 categorie. 21 articoli "Da categorizzare".
- **Fix UI Directus** — 32 campi `articoli` riorganizzati, interfacce corrette, dropdown.
- **Serie "Dialogo aperto"** — 156 articoli collegati, pagina `/sezioni/dialogo-aperto`, link megamenu.
- **CF Worker redirect overflow** — 15582 redirect date-based + 1001 slug arbitrari.

### 2026-03-23

- **44 numeri rivista normalizzati** — `tipo=extra` → `oel`, `id_numero` slug → `OEL-N`.
- **572 articoli backfill numero_rivista** — 2217 totali rimappati.
- **IssueNavPill** — sort per anno+numero, navigazione tastiera ←→.
- **Social sticky scroll** — si ferma sopra footer.
- **Box revisione editoriale** — GET Apps Script, ViewTransitions, solo modalità redazione.
- **Modalità redazione** — `?redazione=1` via localStorage.
- **Capolettera CSS** — responsive 8rem→3.5rem (breakpoint 1024/768/480px).

### 2026-03-22

- Import completo: 3527 articoli, 352 autori, 204 numeri, 285 temi, 816 tag, M2M 9440 relazioni.
- Corpus HTML rigenerato da dump SQL e reimportato (3487/3487).
- Foto autori (88/88) e copertine numeri (204/204) migrate su R2.
- Ricerca Pagefind attiva (4134 pagine, 25 risultati, immagini).
- Fix lingua articoli: 111 corretti, hreflang implementato.
- Redirect SEO: 2000 statici + Worker overflow.
