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

> Queste attività bloccano o condizionano il cutover DNS. Ordinate per sequenza logica.

| ID | Effort | Descrizione |
|----|--------|-------------|
| V-02 | Redazione | **21 articoli "Da categorizzare"** — assegnazione manuale categoria in Directus. Sblocca US-15. |
| US-15 | M | **Rivalutazione ruoli editoriali** — ridefinire portanti/strutturali per ogni categoria dopo V-02. Sblocca homepage dinamica. |
| UX-01 | XL | **Mobile/tablet overhaul globale** — il 65-70% del traffico è mobile. Vanno ripensati: header/mega-menu touch, hero home <600px, diari (6col → grid/scroll), categorie, autori, articoli (padding, tipografia, capolettera). Breakpoint unificati in variabili CSS (`--bp-mobile: 480px`, `--bp-tablet: 768px`, `--bp-desktop: 1024px`). |
| UX-05 | M | **Mega-menu active state** — leggere `Astro.url.pathname` in `Header.astro` e applicare classe `active` / `aria-current` al link della sezione corrente. |
| US-08 | M | **Info testata numero rivista** — campo `periodo_label` mancante (es. "Anno 41 – N.3 – Lug-Ago-Set 2023"). Dati nel dump Divi: estrarre con script, popolare Directus. |
| DA-00 | ✅ Fatto | **Immagini inline corpo articoli** — 259 immagini su 144 articoli migrate su R2 (`corpo/`), src aggiornati in Directus. WordPress può essere spento senza rompere le immagini inline. |
| — | S | **Ruoli e permessi Directus** — profili redazione con accessi limitati ai soli campi necessari. |
| — | — | **Cutover DNS** `ombreeluci.it` → Cloudflare Pages. Step finale che porta il sito live. |

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

### Crescita / Monetizzazione

| ID | Stato | Descrizione |
|----|-------|-------------|
| GR-01 | Pre-lancio | **Cookie policy e privacy (GDPR)** — attualmente gestito con Iubenda su WordPress. Da capire: come integrare Iubenda (o alternativa) nel sito Astro statico. Iubenda fornisce uno script JS + banner + policy page. Prerequisito per GA e Adsense. |
| GR-02 | Pre-lancio | **Google Analytics** — fondamentale per misurare l'efficacia del nuovo design e delle CTA. Da implementare: script GA4 condizionato al consenso cookie (GR-01). Definire eventi custom da tracciare (click CTA, lettura articolo >50%, download PDF rivista). |
| GR-03 | Post-lancio | **Google AdSense / monetizzazione** — valutare se e come inserire pubblicità non invasiva. Da decidere: posizionamento (dopo corpo articolo? sidebar?), compatibilità con la missione editoriale della rivista, impatto su performance (CWV). Dipende da GR-01 + GR-02. |
| GR-04 | Post-lancio | **CTA dinamiche e misurate** — CTA a fine articolo (e in altri punti chiave) che ruotino tra proposte diverse (abbonamento, donazione, newsletter, condivisione, acquisto numero). Requisiti: non ripetitive, contestuali al tema dell'articolo, monitoraggio click via GA4 eventi custom. Da decidere quali CTA e in quale ordine di priorità editoriale. |

---

## Storico completamenti

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
