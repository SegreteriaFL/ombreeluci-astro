# PROGRESS — Ombre e Luci

**Ultimo aggiornamento:** 2026-03-30
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
- **`cms.ombreeluci.it`** — record A aggiunto su Cloudflare (DNS only, 159.69.196.64).
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

## Prossimi Step (ordinati per priorità)

### Fase 1 — Sblocca l'andata online
1. **US-13 — Migrazione DNS Aruba → Cloudflare** ✅ COMPLETATO 2026-03-30
2. **US-12 — Fix filtri Directus** ✅ COMPLETATO 2026-03-30
3. **`cms.ombreeluci.it`** ✅ COMPLETATO 2026-03-30 — record A aggiunto (DNS only)
4. **CF Worker redirect overflow** ✅ COMPLETATO 2026-03-30

### Fase 2 — Tassonomia
5. **US-14 — Nuova tassonomia editoriale** ✅ COMPLETATO 2026-03-30 (13 categorie, script pronto)
6. **Rimappatura categorie su Directus** ✅ COMPLETATO 2026-03-30 — 3506 articoli con categoria valida, 21 "Da categorizzare" per revisione manuale
7. **Serie "Dialogo aperto"** ✅ COMPLETATO 2026-03-30 — 156 articoli collegati, pagina creata, megamenu aggiornato
8. **V-02 — 21 articoli "Da categorizzare"** — revisione manuale redazione
9. **US-15 — Rivalutazione ruoli editoriali** (dopo validazione US-14)

### Fase 3 — Qualità visiva pre-lancio
6. **US-03 — Mobile responsive overhaul**
7. **US-08 — Info testata numero rivista**
8. **US-07 — Homepage diari 2×2 desktop**

### Fase 4 — Post-lancio
9. **Upgrade VPS CX23 → CX32** (prima di embedding)
10. **US-16 — Ricerca semantica + correlati via embedding** (pgvector)
11. **US-01 — Homepage dinamica** (richiede US-15 completato)
12. **US-04 — Didascalie copertine**
13. **US-10 — Archive.org link OEL mancanti**
14. **Ruoli e permessi Directus** per la redazione
15. **Cutover DNS** `ombreeluci.it` → Cloudflare Pages (step finale)

---

## User Stories (backlog)

| # | Fase | Storia | Note tecniche |
|---|------|--------|---------------|
| US-13 | 1 | **Migrazione DNS da Aruba a Cloudflare** — spostare la gestione DNS di `ombreeluci.it` su Cloudflare per abilitare sottodomini (es. `cms.ombreeluci.it`), HTTPS automatico su Directus via proxy CF, e Workers. Il sito WordPress su Aruba resta intatto durante la migrazione. Passi: (1) crea account CF, aggiungi dominio, importa record; (2) cambia nameserver in Aruba; (3) aggiungi A record `cms.ombreeluci.it` → 159.69.196.64 con proxy arancione | 1 ora lavoro + 24-48h propagazione |
| US-12 | 1 | **Bug filtri Directus CMS su articoli** — i filtri per numero rivista e per data non funzionano nella lista articoli di Directus, rendendo difficile spostare articoli da un numero all'altro | Investigare: campo `numero_rivista` è relazione M2O, il filtro relazionale in Directus potrebbe richiedere configurazione nel data model (display template, sort field); verificare anche filtro per `data_pubblicazione` |
| US-14 | 2 | **Nuova tassonomia editoriale** — implementare le 11 categorie della redazione (Famiglia, Spiritualità, Cultura, Fede e Luce, Progetti, Salute, Lavoro, Scuola e educazione, Sport, Tempo libero, Personaggi che ispirano) sostituendo i 16 temi del Megacluster S8. Spec in `docs/CATEGORIZZAZIONE_REDAZIONE_3_26.md` | (a) script mapping megacluster→nuove cat. per le 1:1 chiare; (b) Lavoro/Sport/Tempo libero dagli 816 tag WP in Directus; (c) PATCH `categoria_menu` su 3488 articoli; (d) aggiorna `taxonomy_structure.json` e `taxonomy.js`; (e) decidere destinazione temi S8 orfani. Sblocca US-15. Effort: 1-2 giorni |
| US-15 | 2 | **Rivalutazione ruoli editoriali post-tassonomia** — `ruolo_editoriale` va rivalutato nel contesto delle nuove 11 categorie (il ruolo è relativo alla categoria). Prerequisito: US-14 | Redazione rivede portanti/strutturali per ogni nuova categoria; PATCH Directus via script. Sblocca US-01 |
| US-03 | 3 | **Mobile responsive overhaul** — header mega menu, card copertine, padding/spacing globale, layout pagine categoria e autori su schermi <768px | Restyle Header (z-index mega menu), IssueCard breakpoint, global.css fluid grid |
| US-08 | 3 | **Info testata numero rivista** — pagina numero rivista manca di "Anno 41 – Numero 3 – Luglio–Agosto–Settembre 2023" | Dati nel dump Divi: `<em>` dentro `IntestazioneNumero`; estrarre con script, popolare `periodo_label` in Directus |
| US-07 | 3 | **Homepage diari: layout 2×2 desktop** — i diari nella homepage vanno in un box a 2 colonne × 2 righe su desktop, non in lista lineare | CSS grid `repeat(2, 1fr)` con max 4 card; `flex-wrap` su mobile |
| US-16 | 4 | **Ricerca semantica e correlati via embedding** — attivare embedding pgvector per ricerca per concetto e articoli correlati automatici. Layer separato dalla tassonomia: ogni articolo mantiene il suo vettore 1536-dim indipendentemente dalle categorie | Prerequisito: upgrade VPS CX23→CX32 + cutover DNS. Risponde a "articoli simili", non a "categoria di navigazione" |
| US-01 | 4 | **Homepage dinamica** — articoli in prima sezione in rotazione ad ogni visita, senso di rivista viva | Pool 12-20 card pre-renderizzate (statiche, SEO-safe), shuffle JS client-side. Selezione ponderata: `ruolo_editoriale=portante/strutturale`, distribuzione tra categorie, max 1 autore, ultimi 24 mesi. Prerequisito: US-15 |
| US-02 | 4 | **Ricerca semantica** — ricerca interna per concetto, non solo parola esatta | Embedding pgvector su Directus, CF Worker endpoint, richiede upgrade VPS CX23→CX32. Da fare dopo cutover DNS |
| US-04 | 4 | **Didascalie copertine** — mostrare il testo caption delle immagini copertina degli articoli | Dati in campo `custom_caption` nel dump Divi; importarli in Directus campo `didascalia_copertina` su `articoli` |
| US-10 | 4 | **Archive.org link per 37 OEL mancanti** — numeri OEL 1-15, 34, 40, 131-172 non hanno `wp_url`/`pdf_archive_url` | Scraping profilo archive.org per trovare gli identifier; matching per numero progressivo; PATCH Directus |
