# PROGRESS — Ombre e Luci

**Ultimo aggiornamento:** 2026-03-31
**Stato generale:** **Stack Astro+Directus attivo su staging.** DNS migrato da Aruba a Cloudflare (nameserver: dana/julio.ns.cloudflare.com) — propagazione in corso. WordPress su Aruba resta online fino al cutover finale.

---

## Stato del Progetto

La rivista Ombre e Luci (cattolica italiana, disabilità e fede, fondata 1983) è in migrazione
da WordPress+Divi a uno stack moderno Astro + Directus.

**Al 2026-03-23** il VPS Hetzner **CX23** (IP **159.69.196.64**, Ubuntu **24.04**) ha **Docker** attivo;
**Directus** è raggiungibile su **http://159.69.196.64:8055** con **PostgreSQL 16** e **pgvector 0.8.2**.
Lo **schema** comprende **10 collection**: `articoli`, `autori`, `numeri_rivista`, `temi`, `tags`, `serie`,
`commenti_storici`, `redirects`, `embeddings`, `directus_files`. **Import completato:** 3527 articoli,
352 autori, 204 numeri_rivista, 285 temi, 816 tag. **M2M:** 9440 relazioni totali (6676 articoli↔temi +
2764 articoli↔tags).

**Immagini su Cloudflare R2 (bucket `oel-media`):**
- Copertine articoli: 2972/2972 migrate (`copertine/{uuid}`) — collegate via M2O `immagine_copertina`
- Foto autori: 88/352 migrate (`autori/{uuid}`) — 88 autori avevano foto in Directus
- Copertine numeri rivista: 204/204 migrate su R2, campo `copertina_url` popolato

**Corpo articoli:** HTML pulito con `<p>` e `<br>` rigenerato da dump SQL e re-importato in Directus (3487/3487 OK).

**Sito Astro staging:** pagine articolo OK, pagine autori OK, archivio OK con copertine, ricerca Pagefind attiva.

**Redirect SEO:** 2000 regole in `public/_redirects`, 16630 in `redirects_overflow.json` → Cloudflare Worker.

---

## Stack Tecnico

| Layer | Tecnologia | Stato |
|-------|-----------|-------|
| Frontend | Astro (output 100% statico) su Cloudflare Pages | **Attivo** |
| CMS temporaneo | Keystatic Worker su Cloudflare Workers | **Attivo** (solo nuovi articoli) |
| CMS | Directus su Hetzner CX23 (`http://159.69.196.64:8055`, Docker) | **Operativo** — 10 collection, import completo |
| Database | PostgreSQL 16 + pgvector 0.8.2 (stesso VPS) | **Attivo** |
| Storage media | Cloudflare R2 (`oel-media`) — `copertine/{uuid}` articoli, `autori/{uuid}` foto, `numeri/{n}` copertine | **Attivo** |
| Redirect SEO | `public/_redirects` (2000) + `redirects_overflow.json` (16630) | **Statici OK**; overflow → Worker |

---

## Infra VPS Hetzner

IP: 159.69.196.64
Piano: CX23
OS: Ubuntu 24.04
Costo: €4.09/mese (inclusi backup)
Docker: Directus + PostgreSQL 16 + pgvector 0.8.2
URL admin: http://159.69.196.64:8055
Credenziali: /opt/oel-cms/.env.local (server)
             vps_credentials.txt (locale, non committare)

---

## Analisi Database WordPress (completata 2026-03-20)

Analisi completa del dump SQL `Sql980379_3.sql.gz` (DB originale WordPress).

### Risultati chiave

| Metrica | Valore |
|---------|--------|
| Articoli pubblicati | **3527** |
| Numeri rivista (`post_type=project`) | **204** |
| Utenti WordPress | **406** |
| Categorie | **285** |
| Tag | **816** |
| Immagini attachment | **5216** |
| Thumbnail copertina mappate | **3251** |

### Dataset Canonico — Stato Finale (2026-03-20)

Tutti in `scripts/db_analysis/output/`:

| File | Records | Contenuto |
|------|---------|-----------|
| `articoli_wp_puliti.json` | 3527 | Articoli con HTML body, lang (IT:3396/EN:131), SEO Yoast completo |
| `autori_wp.json` | 406 | Autori con bio |
| `numeri_rivista_wp.json` | 204 | Numeri rivista con thumbnail |
| `categorie_wp.json` | 285 | Categorie con URL originale |
| `tag_wp.json` | 816 | Tag con URL originale |
| `immagini_copertina_wp.json` | 3251 | Thumbnail mappate (post_id → thumbnail_id) |
| `immagini_wp.json` | 5216 | Immagini con alt/caption/dimensioni/usata_in |
| `link_interni_yoast.json` | 37440 | Mappa link interni da Yoast (post_id → target_post_id) |
| `redirects_necessari.json` | 35890 | Slug vecchi e date vecchie da reindirizzare (2574 articoli) |

---

## Piano Migrazione CMS

Documento di specifica: `docs/CMS_MIGRATION_SPEC.md` (v1.2)

### Fasi

1. **Setup VPS Hetzner + Directus** ✅ COMPLETATO
2. **Schema Directus** ✅ COMPLETATO
3. **Import dati** ✅ COMPLETATO (2026-03-21)
4. **Configurazione UI Directus** ✅ COMPLETATO (2026-03-21)
5. **Immagini copertina** ✅ COMPLETATO (2026-03-21/22)
6. **Aggiornamento Astro** (~3-4 giorni)
7. **Testing e cutover** (~1-2 giorni)

---

## Completato — 2026-03-22

- **Token Directus e fix redirects** — token admin rinnovato, 2000 redirect statici OK
- **Corpo articoli HTML rigenerato** — dump SQL → HTML pulito reimportato in Directus (3487/3487 OK)
- **Foto autori migrate su R2** — 88/88 foto autori migrate su `autori/{uuid}`
- **Copertine numeri rivista su R2** — 204/204 copertine migrate; campo `copertina_url` popolato
- **Rimappatura articoli → numeri rivista** — 2217 articoli rimappati
- **Backfill tassonomia** — `forma`, `tema_label`, `categoria_menu`, `ruolo_editoriale` popolati su 3488/3488 articoli
- **Ricerca Pagefind** — widget attivo con `@pagefind/default-ui`, 4134 pagine indicizzate, 25 risultati per pagina, immagini
- **Fix lingua articoli** — 111 articoli corretti (89 EN→IT, 19 IT→EN, 3 manuali); hreflang implementato
- **LanguageSelector** — active state e navigazione inter-lingua corretti con ViewTransitions
- **IssueCard** — tipo `ins` corretto, contenuto visibile, meta N.{numero}·{anno}
- **Pulsanti Sfoglia/Scarica** — fix campo `tipo` (`ins` non `insieme`) in `[issue].astro`

---

## Completato — 2026-03-30

- **Migrazione DNS Aruba → Cloudflare** — nameserver aggiornati (dana/julio.ns.cloudflare.com), DNSSEC disattivo, record mail DNS-only, record sito Proxied. Propagazione quasi completa. WordPress su Aruba resta online fino al cutover finale.
- **`cms.ombreeluci.it` via Cloudflare Tunnel** — cloudflared installato su VPS, tunnel `cms-oel` (UUID `8af792d2-3a94-4d91-ac38-e3a7efb5a409`) attivo con 4 connessioni edge (fra03/08/15/18, QUIC). CNAME `cms.ombreeluci.it` → tunnel. Systemd service abilitato al boot. `https://cms.ombreeluci.it` → Directus porta 8055 senza esporre porte pubbliche.
- **Nuova tassonomia editoriale (US-14)** — 16 temi Megacluster S8 → 13 categorie redazione. Script rimappatura a 4 livelli (megacluster → WP categorie → tag WP → default). 21 articoli senza tema_label → "Da categorizzare". `taxonomy_structure.json` e `taxonomy.js` aggiornati.
- **Fix filtri Directus (US-12)** — `data_pubblicazione`: interface/display `datetime`. `numero_rivista` M2O: `sort_field: anno_pubblicazione`. Tutti i 32 campi `articoli` refactorizzati: ordine logico, interface corrette, dropdown con valori, campi tecnici nascosti.
- **Serie "Dialogo aperto"** — serie creata in Directus, 156 articoli collegati. Pagina `/sezioni/dialogo-aperto` creata. Link aggiunto al megamenu.
- **CF Worker redirect overflow** ✅ COMPLETATO 2026-03-30 — Worker `ombreeluci-redirects` deployato via API Cloudflare, route attiva su `ombreeluci.it/*`. Regex 15582 redirect date-based + lookup 1001 slug arbitrari.

---

## Da far validare alla Redazione

| # | Cosa validare | Dove guardare | Priorità |
|---|---|---|---|
| V-01 | **13 nuove categorie** — distribuzione articoli sensata? Categorie corrette per ogni articolo? | Staging → menu Temi, pagine `/categoria/*` | Alta |
| V-02 | **21 articoli "Da categorizzare"** — assegnarli manualmente alla categoria giusta | Directus → Articoli → filtra `categoria_menu = Da categorizzare` | Alta |
| V-03 | **Ruoli editoriali (US-15)** — `portante/strutturale/trasversale` vanno rivalutati per le nuove categorie (il ruolo è relativo alla categoria) | Directus → per ogni categoria, quali articoli sono portanti? | Media |
| V-04 | **Fede e Luce (1114 articoli)** — categoria molto grande; verificare se la distribuzione interna è sensata o se serve suddivisione | Staging → `/categoria/fede-e-luce` | Media |
| V-05 | **Personaggi che ispirano (22 articoli)** — tutti pertinenti? Mancano personaggi importanti? | Staging → `/categoria/personaggi-che-ispirano` | Bassa |
| V-06 | **Filtri Directus** — verificare che filtro per numero rivista e data_pubblicazione funzionino | Directus → Articoli → icona filtro | Bassa |
| V-07 | **Megamenu** — 13 nuove categorie corrette + link "Dialogo aperto" funzionante | Staging → apri megamenu | Media |
| V-08 | **Pagina /sezioni/dialogo-aperto** — 156 articoli caricano e sono pertinenti? | Staging → `/sezioni/dialogo-aperto` | Media |
| V-09 | **CF Worker redirect** — i vecchi URL WordPress reindirizzano correttamente? | Prova: `ombreeluci.it/2015/03/20/qualche-slug/` → deve andare su `/blog/qualche-slug/` | Alta |
| V-10 | **Didascalie copertina** — 2004 didascalie visibili sotto la foto di copertina degli articoli: sono corrette e pertinenti? Segnalare quelle errate o fuori contesto | Staging → apri vari articoli, guarda testo sotto foto | Media |
| V-11 | **"Leggi anche" in-content** — il box inserito nel corpo degli articoli propone un articolo pertinente? Verificare su una decina di articoli diversi | Staging → apri articoli, verifica il box a metà testo | Media |
| V-12 | **Articoli correlati in calce** — i 3 articoli in fondo sono tematicamente vicini? Migliori dei precedenti (per categoria)? | Staging → scorri in fondo a vari articoli | Bassa |

---

## Completato — 2026-03-31

- **Fix ArticleCard** — riga autore, prop `hideImage`, sottotitolo visibile
- **Layout pagina categoria** — immagine più grande, autore sotto sottotitolo, colonna destra (in evidenza sticky)
- **Favicon** — aggiornata a `favicon02.png` su tutte le pagine
- **Rimozione tema "Personaggi che ispirano" da Jean Vanier** — 35 articoli aggiornati via Directus PATCH bulk (`tema_label = null`, `categoria_menu = null`); articoli non appariranno più in `/categoria/personaggi-che-ispirano`
- **Cloudflare Tunnel `cms.ombreeluci.it`** — cloudflared installato su VPS, tunnel `cms-oel` attivo (4 connessioni edge fra03/08/15/18, QUIC), systemd service abilitato al boot. `https://cms.ombreeluci.it` → Directus porta 8055
- **Sottotitolo fallback SEO** — articoli senza sottotitolo mostrano `seo_description` come sottotitolo nella pagina articolo
- **Didascalie copertina (Step 1)** — 2004 articoli con `didascalia_copertina` popolata da caption WP originali (strip HTML, gestione encoding). ~968 articoli senza fonte WP disponibile
- **Alt text immagini AI (Step 2)** — job Claude Haiku in esecuzione su 2892 immagini rimanenti (13s/img, ~10h, background). 80 già completati. Salva in `scripts/db_analysis/logs/alttext_generation.json`
- **Correlati semantici UMAP** — generato `src/data/correlati.json` (3487 articoli × 5 vicini) tramite distanza euclidea su coordinate UMAP 3D precomputate. Sostituisce correlati per categoria in fondo all'articolo. Zero query runtime, zero API.
- **Leggi anche build-time** — `LeggiAnche.astro` inserito staticamente dopo il 3° `</p>` del corpo articolo. Articolo scelto da correlatiMap UMAP (primo vicino semantico, stessa lingua, senza loop A→B→A). Rimosso vecchio approccio JS client-side (fragile, non SEO, layout shift). CSS isolato da `.article-content :global()` con blocco reset specifico.
- **Didascalia visibile sotto copertina** — `heroCaption` collegato a `didascalia_copertina`, icona fotocamera, font 0.7rem, allineamento sinistra
- **Rimosso background `#e8e0d5`** dal wrapper hero immagine articolo
- **US-04 Didascalie copertine** — completato Step 1; Step 2 (AI) in corso
- **Backfill `div.evidenziazione`** — script `backfill_evidenziazione.py` estrae pull quote dal dump SQL Divi grezzo e le reinietta nei corpi Directus. Match fuzzy (normalizzazione aggressiva, tollerante a mojibake). Risultato: 570/586 (97%) inserite su 376 articoli; 16 non trovate per ancoraggio ambiguo (11 articoli — da revisione manuale).
- **Embed YouTube build-time** — `processEmbeds()` in `[..slug].astro`: URL grezzi `<p>https://youtu.be/ID</p>` → `<div class="video-embed"><iframe>` responsive 16:9. Zero JS runtime.
- **Embed Instagram build-time** — blockquote `data-instgrm-permalink` preservato nel corpus; `embed.js` Instagram incluso solo nelle pagine che ne hanno bisogno (flag `hasInstagram`). Reset stile blockquote per embed Instagram.
- **CSS `p.evidenziazione`** — in `global.css`: bordi teal, testo centrato italic Georgia 1.4rem.

---

## Completato — 2026-03-23

- **Placeholder copertina Unsplash** — 4 immagini in `public/placeholder/`, selezione pseudo-random via hash slug; applicato a ArticleCard e hero articolo; `getArticoloCopertinaSrc` ritorna `null` (non SVG) così il fallback funziona in tutti i contesti (articoli correlati, archivio, autori, categoria)
- **44 numeri rivista normalizzati** — `tipo=extra` → `oel`, `id_numero` slug → `OEL-N` (OEL 30, 46-68, 77-100); fix ordine casuale e "N.0" in metadata
- **572 articoli backfill numero_rivista** — collegati al numero corretto via mapping `wp_id`; 693 null rimanenti = web-only legittimi
- **IssueNavPill sort** — prev/next ordinato per anno + numero progressivo (non più casuale stesso anno)
- **IssueNavPill tastiera** — ← → navigano tra numeri dell'archivio
- **Social sticky scroll** — si ferma sopra related-footer/footer, non ci va sopra
- **Box revisione editoriale** — GET invece di POST (Apps Script), ViewTransitions, visibile solo in modalità redazione
- **Modalità redazione** — `?redazione=1` attiva via localStorage: mostra box feedback + link "Modifica in Directus" + debug section; `?redazione=0` disattiva
- **Debug section** — nascosta di default, visibile solo in modalità redazione
- **Sezione numero-rivista-section** — rimossa dalla pagina articolo
- **Capolettera CSS** — `span.capolettera` responsive 8rem→3.5rem con breakpoint 1024/768/480px

---

## Completato — 2026-03-31

- **Homepage redesign v2** — Riscrittura completa di `src/pages/index.astro`. 5 sezioni: Hero (tagline + featured pool con rotazione JS random ad ogni page load, 3 recenti), Da vicino (diari 2×2 card + testimonianze + CTA), Esplora (8 categorie con immagini articolo 4:3), La rivista (ultimo numero separato da carousel archivio), Unisciti (3 card colorate SVG + bottoni outlined + newsletter link Mailchimp). Featured pool: ultimi 18 mesi, max 7 articoli portanti/strutturali, JS client-side sceglie index random — SEO-safe perché tutti i candidati sono nel DOM.
- **UX-02 — Badge ruoli editoriali rimossi** — In `ArticleCard.astro` rimossi `roleLabel`/`roleClassName` e il badge `<span class="article-badge-role">`. I ruoli (portante/strutturale/laterale/trasversale) non appaiono più ai lettori.
- **UX-03 — Hover state ArticleCard** — Immagine scala a 1.03 e titolo cambia colore → `var(--accent-color)` al hover, con transizioni CSS smooth.
- **UX-06 — Badge categoria semplificato** — Formato snellito: `"Testimonianza · Fede e Luce"` (forma + categoria, senza numero rivista). Se solo categoria: `"Fede e Luce"`. Se articolo online-only senza categoria: `"Online"`.
- **UX-04 — Ricerca accessibile su mobile** — In `Header.astro`: a ≤480px il form di ricerca è nascosto ma appare un'icona-bottone cerca. Al tap scende un overlay full-width con input e bottone submit teal. Auto-focus, chiude con Escape o all'apertura del mega-menu.

---

## Prossimi Step (ordinati per priorità)

### Da fare — Pre-lancio
1. **V-02 — 21 articoli "Da categorizzare"** — revisione manuale redazione (Directus → filtra `categoria_menu = Da categorizzare`)
2. **US-15 — Rivalutazione ruoli editoriali** — portanti/strutturali per ogni nuova categoria (dopo validazione V-02)
3. **UX-01 — Mobile responsive overhaul** — hero home, diari, card, layout categoria/autore/articolo su 390px e 768px
4. **UX-05 — Mega-menu active state** — evidenziare la sezione corrente nel menu
5. **US-08 — Info testata numero rivista** — campo `periodo_label` (es. "Anno 41 – N.3 – Lug–Ago–Set 2023")
6. **Ruoli e permessi Directus** — profili redazione con accessi limitati
7. **Cutover DNS** `ombreeluci.it` → Cloudflare Pages (step finale, blocca il lancio)

### Da fare — Post-lancio
8. **16 evidenziazioni non reinserite** — 11 articoli con ancora ambigua: `un-panorama-riscoprire`, `mary-mount-settimane-al-sole`, `faccio-io`, `eucaristia-e-cresima-di-giacomo`, `lo-sconforto-emotivo-esige-comprensione`, `il-chicco`, `stai-pensando-me`, `gli-altri-siamo-noi`, `intervista-ad-andrea-romeo-su-cinema-e-disabilita`, `genitori-e-medici-davanti-allannuncio-dellhandicap`, `salvatore-medico-pediatra-acondroplasico` — da inserire a mano in Directus
9. **Categorizzare articoli Jean Vanier** — 35 articoli hanno `tema_label = null` dopo rimozione "Personaggi che ispirano"; assegnare categoria appropriata (es. "Fede e Luce") via Directus o script PATCH
9. **Upgrade VPS CX23 → CX32** (prima di embedding)
9. **US-16 — Ricerca semantica + correlati** (pgvector, dopo upgrade VPS)
10. **US-01 — Homepage dinamica** (after US-15)
11. **US-04 — Didascalie copertine**
12. **US-10 — Archive.org link OEL 1–15, 34, 40, 131–172**

---

## User Stories (backlog)

| # | Fase | Storia | Note tecniche |
|---|------|--------|---------------|
| US-15 | 2 | **Rivalutazione ruoli editoriali post-tassonomia** — `ruolo_editoriale` va rivalutato nel contesto delle nuove 13 categorie. Prerequisito: validazione V-02 | Redazione rivede portanti/strutturali per ogni nuova categoria; PATCH Directus via script. Sblocca US-01 |
| US-03 | 3 | **Mobile responsive overhaul** — header mega menu, card copertine, padding/spacing globale, layout pagine categoria e autori su schermi <768px | Restyle Header (z-index mega menu), IssueCard breakpoint, global.css fluid grid |
| US-08 | 3 | **Info testata numero rivista** — pagina numero rivista manca di "Anno 41 – Numero 3 – Luglio–Agosto–Settembre 2023" | Dati nel dump Divi: `<em>` dentro `IntestazioneNumero`; estrarre con script, popolare `periodo_label` in Directus |
| US-16 | 4 | **Ricerca semantica e correlati via embedding** — pgvector per ricerca per concetto e articoli correlati automatici | Prerequisito: upgrade VPS CX23→CX32 + cutover DNS |
| US-01 | 4 | **Homepage dinamica** — articoli in rotazione ad ogni visita, shuffle JS client-side su pool statico | Selezione ponderata: `ruolo_editoriale=portante/strutturale`, distribuzione categorie, max 1 autore, ultimi 24 mesi. Prerequisito: US-15 |
| US-04 | 4 | **Didascalie copertine** — mostrare il testo caption delle immagini copertina | Campo `custom_caption` nel dump Divi → `didascalia_copertina` in Directus |
| US-10 | 4 | **Archive.org link per OEL 1–15, 34, 40, 131–172** — 37 numeri senza `pdf_archive_url` | Scraping profilo archive.org, matching per numero progressivo, PATCH Directus |

---

## Backlog UX/UI — Audit 2026-03-30

> **Contesto:** sito in staging, produzione attiva su WordPress (ombreeluci.it). Il 65–70% degli utenti arriva da mobile/tablet. L'audit esclude le criticità note e contestuali (noindex intenzionale su staging, CSS inline provvisorio, pagine test). Le voci sono ordinate per priorità di intervento pre-lancio.
>
> **Legenda gravità:** 🔴 Alta — impatta leggibilità/usabilità quotidiana · 🟡 Media — degrada esperienza ma non blocca · 🟢 Bassa — rifinitura post-lancio
> **Effort:** S = < 2h · M = 2–8h · L = 1–3 giorni · XL = > 3 giorni

---

### Priorità 1 — Pre-lancio obbligatorio

| ID | Gravità | Effort | Descrizione | Note tecniche |
|----|---------|--------|-------------|---------------|
| UX-01 | 🔴 | XL | **Mobile/tablet overhaul globale** (espansione US-03) — Il 65–70% del traffico è mobile. Attualmente il layout è progettato desktop-first e poi adattato. Vanno ripensati: (a) header e mega-menu su touch, (b) hero home su <600px, (c) banda diari (6 colonne → scroll orizzontale o 2×3 grid), (d) sezione recensioni (5 col → 2 col), (e) ThemedSection (sidebar+grid → stack), (f) pagine categoria: hero, lista articoli, sidebar, (g) pagine autore, (h) pagine numero rivista, (i) pagine articolo: padding laterali, tipografia fluida, capolettera, (j) footer: da fixed a static già fatto ma verifica padding/overflow | Breakpoint condivisi da unificare in variabili CSS: `--bp-mobile: 480px`, `--bp-tablet: 768px`, `--bp-desktop: 1024px`. Partire da un audit visivo di ogni pagina su 390px (iPhone 14) e 768px (iPad). Layout mobile-first per i componenti nuovi. |
| UX-02 | ✅ | M | **Badge ruoli editoriali interni non mostrarli ai lettori** ~~— I label `Portante`, `Strutturale`, `Laterale`, `Trasversale` appaiono nelle ArticleCard e nelle pagine articolo~~ | **Fatto 2026-03-31** — rimossi da `ArticleCard.astro`. |
| UX-03 | ✅ | S | **Hover state sulle ArticleCard** | **Fatto 2026-03-31** — immagine scale(1.03) + titolo accent color. |
| UX-04 | ✅ | S | **Ricerca accessibile su mobile (<480px)** | **Fatto 2026-03-31** — icona cerca in header mobile + overlay slide-down con input e submit. |
| UX-05 | 🟡 | M | **Mega-menu: nessuna indicazione della pagina corrente** — Il mega-menu non evidenzia la sezione attiva. L'utente non sa dove si trova nel sito guardando il menu. Specialmente su pagine profonde (categoria, autore, articolo) | In `Header.astro` leggere `Astro.url.pathname` e aggiungere classe `active` o `aria-current="page"` ai link del mega-menu che corrispondono alla sezione corrente. Stile: underline o colore accent sul link attivo. |
| UX-06 | ✅ | S | **Label categoria articolo: formato tecnico** | **Fatto 2026-03-31** — badge semplificato: `"Forma · Categoria"` o solo categoria o `"Online"`. |

---

### Priorità 2 — Qualità visiva pre-lancio

| ID | Gravità | Effort | Descrizione | Note tecniche |
|----|---------|--------|-------------|---------------|
| UX-07 | 🟡 | M | **Pagina articolo su mobile: layout e spaziatura** — Su mobile il padding laterale è 0 (override `padding: 0` senza media query chiara), la tipografia non scala fluidamente, il capolettera su schermi piccoli può occupare troppo spazio. L'esperienza di lettura è il cuore del sito | Audit completo di `blog/[...slug].astro` su 390px. Verificare: padding laterali minimi 1.25rem, `article-title` con clamp adeguato, capolettera che non spezza il layout, `article-meta` in colonna su mobile (non flex-row), foto autore e bio in stack verticale. |
| UX-08 | 🟡 | M | **Pagina categoria: layout mobile** — Su tablet/mobile la pagina categoria usa ancora grid e hero pensati per desktop. Il layout a due colonne (in evidenza + lista) collassa ma non è ottimizzato per touch | Rivedere `categoria/[categoria].astro`: su mobile hero full-width, lista articoli a colonna unica con `ArticleListRow` o `ArticleCard` vertical, rimuovere sidebar se presente. |
| UX-09 | 🟡 | S | **Foto autore: richieste 404 silenziose** — Se l'autore non ha foto in Directus, il codice tenta `/assets/authors/{slug}.jpg`. Per la maggior parte degli autori questo file non esiste → richiesta 404 silente nel browser | In `blog/[...slug].astro` usare solo `getAutoreImageUrl(authorFotoId)` quando `authorFotoId` è presente, altrimenti mostrare un avatar placeholder SVG inline (iniziali o icona generica). Rimuovere il fallback al path locale. |
| UX-10 | 🟡 | S | **Selettore lingua visibile senza traduzione disponibile** — `LanguageSelector` appare nell'header anche su pagine che non hanno versione inglese. Click porta a un URL probabilmente inesistente o alla home in inglese | Passare al componente l'informazione se esiste una traduzione (`alternateArticleUrl`). Su pagine senza traduzione: nascondere il selettore o mostrarlo disabilitato con tooltip "Non disponibile in inglese". |
| UX-11 | 🟡 | M | **Sezione Diari home: layout 2×3 su mobile** — Su mobile le 6 card diari passano a 2 colonne con foto 120×120px e tutto il testo sotto. L'elemento è affollato, le foto risultano piccole e la gerarchia visiva è persa | Ridurre le card diari a visualizzazione orizzontale su mobile (foto 64px + testo a destra) o adottare scroll orizzontale con snap. Valutare anche ridurre a 4 diari visibili su mobile con link "Tutti". |
| UX-12 | 🟡 | M | **IssueCard su mobile: griglia archivio** — Le copertine numeri rivista su `/archivio` e nei carousel non hanno breakpoint ottimizzati per schermi sotto 480px. Le card diventano troppo piccole o troppo alte | Aggiungere breakpoint a `IssueCard.astro` e alla griglia archivio: su mobile < 480px usare 2 colonne invece di auto-fill, assicurarsi che il testo meta (numero, anno) resti leggibile. |
| UX-13 | 🟡 | S | **Testimonianze home: layout 1fr-2fr-1fr non funziona su tablet** — Il layout asimmetrico delle testimonianze (tre colonne diverse) non ha breakpoint per 768–1024px. Sul tablet il layout diventa confuso | Aggiungere breakpoint 768–1024px: passare a griglia 2 colonne con la card grande in testa, collapsar la CTA "Racconta la tua storia" in fondo. |

---

### Priorità 3 — Rifinitura e coerenza

| ID | Gravità | Effort | Descrizione | Note tecniche |
|----|---------|--------|-------------|---------------|
| UX-14 | 🟢 | M | **Tipografia: uso consistente serif/sans** — Georgia appare per titoli diari, sottotitoli articoli, `InContentRelated`, ma non c'è una regola esplicita nel design system. Il risultato è mescolanza casuale | Definire in `global.css` due utility class: `.text-serif` (Georgia, per citazioni/sommari/diari) e `.text-sans` (Raleway, per UI/navigazione/badge). Documentare la regola: serif solo per contenuto narrativo, sans per elementi UI. |
| UX-15 | 🟢 | S | **Box "Ultimo numero" home: spaziatura e colore su mobile** — Il box beige (#d9cebd) con griglia 3fr/2fr collassa su mobile. La copertina 300px centrata su schermo piccolo occupa tutto lo spazio disponibile spingendo il testo fuori | Breakpoint mobile: stack verticale (testo sopra, copertina sotto e centrata max 240px). Verificare padding interno e leggibilità del titolo numero su 390px. |
| UX-16 | 🟢 | S | **ArticleCard orizzontale: immagine troppo piccola su mobile** — La variante `horizontal=true` usa un'immagine di 140px (4:3). Su schermi piccoli risulta molto piccola accanto a titoli su 2–3 righe | Sotto 480px passare la variante horizontal a layout verticale (immagine full-width sopra, testo sotto) oppure aumentare la thumbnail a 100px di altezza mantenendo il layout orizzontale. |
| UX-17 | 🟢 | S | **Pagine autore: foto autore su mobile** — La foto autore circolare nelle pagine diario (200px) e nelle pagine autore può essere troppo grande su mobile, specialmente se seguita da una bio lunga | Ridurre a 120–140px su mobile, assicurarsi che la bio usi `line-height: 1.7` anche su schermi piccoli. |
| UX-18 | 🟢 | S | **Breadcrumb nascosti per articoli** — `.breadcrumbs { display: none }` nella pagina articolo. I breadcrumb potrebbero aiutare la navigazione e il SEO (structured data) | Valutare se riattivarli con design sobrio (link piccolo in cima: categoria > titolo troncato). Su mobile utili per "torna alla categoria". Aggiungere `BreadcrumbList` structured data (JSON-LD). |
| UX-19 | 🟢 | M | **Pagine test e debug pubblicamente accessibili** — `test-lista`, `test-minimal`, `test-no-articles`, `test-status`, `debug/audit-editoriale` sono pagine raggiungibili via URL | Prima del cutover DNS: aggiungere `noindex` su queste pagine (già fatto su staging) e valutare rimozione o protezione con parametro `?redazione=1`. |
| UX-20 | 🟢 | S | **Reading time minimo 1 minuto sempre** — La funzione `calculateReadingTimeFromHtml` usa 200 parole/minuto e `Math.max(1, ...)`. Articoli brevi o editoriali storici molto corti mostrano sempre "1 min" | Valutare se mostrare il reading time solo per articoli > 3 minuti, o usare una soglia minima di 300 parole prima di mostrarlo. Oppure nascondere il badge per articoli storici (ante 2000). |

---

## Backlog Data/AI — Attività post-lancio

| ID | Stato | Descrizione | Note tecniche |
|----|-------|-------------|---------------|
| DA-01 | ⏳ In corso | **Backfill alt text immagini copertina su Directus** — Job Claude Haiku (5 req/min) genera alt text per ~2973 immagini copertina e salva in `scripts/db_analysis/logs/alttext_generation.json`. Quando completo (stima fine 2026-03-31 ~16:42), eseguire `python scripts/db_analysis/backfill_alttext_to_directus.py` per patchare il campo `description` su ogni file in Directus. | Script pronto. Supporta `--dry-run` e ripresa da log precedente. Verificare il campo `description` sia esposto nel template articolo come `alt` sull'`<img>`. |

---

