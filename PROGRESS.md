# PROGRESS — Ombre e Luci

**Ultimo aggiornamento:** 2026-03-22 (sera)
**Stato generale:** **Stack Astro+Directus attivo su staging.** Immagini su R2, corpo articoli HTML rigenerato, tassonomia completa (forma/tema_label/categoria_menu/ruolo_editoriale popolata su tutti gli articoli), pagine categoria funzionanti.

---

## Stato del Progetto

La rivista Ombre e Luci (cattolica italiana, disabilità e fede, fondata 1983) è in migrazione
da WordPress+Divi a uno stack moderno Astro + Directus.

**Al 2026-03-22** il VPS Hetzner **CX23** (IP **159.69.196.64**, Ubuntu **24.04**) ha **Docker** attivo;
**Directus** è raggiungibile su **http://159.69.196.64:8055** con **PostgreSQL 16** e **pgvector 0.8.2**.
Lo **schema** comprende **10 collection**: `articoli`, `autori`, `numeri_rivista`, `temi`, `tags`, `serie`,
`commenti_storici`, `redirects`, `embeddings`, `directus_files`. **Import completato:** 3527 articoli,
352 autori, 204 numeri_rivista, 285 temi, 816 tag. **M2M:** 9440 relazioni totali (6676 articoli↔temi +
2764 articoli↔tags).

**Immagini su Cloudflare R2 (bucket `oel-media`):**
- Copertine articoli: 2972/2972 migrate (`copertine/{uuid}`) — collegate via M2O `immagine_copertina`
- Foto autori: 88/352 migrate (`autori/{uuid}`) — 88 autori avevano foto in Directus
- Copertine numeri rivista: 204/204 migrate (`numeri/{wp_id}.jpg`) — **chiave da rifare** con `numeri/{numero_progressivo}.jpg`; campo `wp_id` non esiste in Directus `numeri_rivista`

**Corpo articoli:** HTML pulito con `<p>` e `<br>` rigenerato da dump SQL e re-importato in Directus (3487/3487 OK).

**Sito Astro staging:** pagine articolo OK, pagine autori OK. Archivio `/archivio/` attivo ma senza copertine numeri (dipendono da `wp_id` non disponibile). Filtro articoli per numero funzionante, ma mapping articoli→numeri è errato nell'import (vedere Prossimi Step).

**Redirect SEO:** 2000 regole in `public/_redirects`, 16630 in `redirects_overflow.json` → Cloudflare Worker.

---

## Stack Tecnico

| Layer | Tecnologia | Stato |
|-------|-----------|-------|
| Frontend | Astro (output 100% statico) su Cloudflare Pages | **Attivo** |
| CMS temporaneo | Keystatic Worker su Cloudflare Workers | **Attivo** (solo nuovi articoli) |
| CMS | Directus su Hetzner CX23 (`http://159.69.196.64:8055`, Docker) | **Operativo** — 10 collection, import completo |
| Database | PostgreSQL 16 + pgvector 0.8.2 (stesso VPS) | **Attivo** |
| Storage media | Cloudflare R2 (`oel-media`) — `copertine/{uuid}` articoli, `autori/{uuid}` foto, `numeri/{n}` da rifare | **Attivo** (parziale) |
| Redirect SEO | `public/_redirects` (2000) + `redirects_overflow.json` (16630) | **Statici OK**; overflow → Worker |

---

## Infra VPS Hetzner (2026-03-20)
IP: 159.69.196.64
Piano: CX23
OS: Ubuntu 24.04
Costo: €4.09/mese (inclusi backup)
Docker: Directus + PostgreSQL 16 + pgvector 0.8.2
URL admin: http://159.69.196.64:8055
Credenziali: /opt/oel-cms/.env.local (server)
             vps_credentials.txt (locale, non committare)

---

## Sito Astro (stato attuale)

- **Deploy:** verde su `ombreeluci-staging.pages.dev`
- **Articoli:** 3488 file `.md` pre-renderizzati in `src/content/blog/`
- **Dati runtime:** `src/data/articoli_megacluster.json` (metadati arricchiti AI)
- **CMS temporaneo:** Keystatic Worker
  - URL: `keystatic-oel.bold-firefly-5209.workers.dev/keystatic`
  - Cartella separata: `keystatic-oel/` (repo gemello)
  - Solo per nuovi articoli — NON per editing archivio storico

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

### Strutture Divi trovate

| Layout | Articoli | % |
|--------|----------|---|
| `2_3_sidebar` (corpo + sidebar numero) | 3311 | 93.9% |
| `4_4_fullwidth` | 167 | 4.7% |
| `html_pure` (no Divi) | 47 | 1.3% |
| `other` | 2 | 0.1% |

### Relazione articolo → numero rivista

Meccanismo: taxonomy condivisa `project_category`.
- Ogni numero rivista ha un termine `project_category`
- Gli articoli sono assegnati allo stesso termine
- **3473/3527 articoli (98.5%)** correttamente collegati

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

#### Campi SEO in `articoli_wp_puliti.json`

Estratti da `Sql980379_3_yoast.sql.gz` (`wppp_yoast_indexable` + `wppp_postmeta`):

| Campo | Copertura |
|-------|-----------|
| `lang` | 3527 (IT:3396, EN:131) |
| `yoast_description` | 2787 (79%) |
| `yoast_og_image` | 3320 (94%) |
| `yoast_reading_time` | 1729 (49%) |
| `yoast_title` | 34 (custom override) |
| `yoast_is_cornerstone` | 1 |
| `yoast_schema_type` | variabile |

Dettagli tecnici completi: `scripts_and_data/reports/db_analysis_20260320.md`

---

## Infra VPS Hetzner (2026-03-20)

| Voce | Valore |
|------|--------|
| Piano | **CX23** |
| IP pubblico | **159.69.196.64** |
| OS | Ubuntu **24.04** |
| Regione | **Nuremberg** (nbg1) |
| Costo | **€4,09/mese** (inclusi backup) |

**Prossimo step immediato:** installazione **Docker** + **Directus** + **PostgreSQL** (e pgvector come da spec).

---

## Piano Migrazione CMS

Documento di specifica: `docs/CMS_MIGRATION_SPEC.md` (v1.2)

### Fasi

1. **Setup VPS Hetzner + Directus** ✅ COMPLETATO
   - VPS CX23, Docker, PostgreSQL 16 + pgvector 0.8.2, Directus

2. **Schema Directus** ✅ COMPLETATO
   - 8 collections: `articoli`, `autori`, `numeri_rivista`, `temi`, `tags`, `serie`, `commenti_storici`, `redirects`
   - Relazioni M2M articolo↔temi, articolo↔tags (junction tables `articoli_temi`, `articoli_tags`)
   - Relazioni M2O: articolo→autore, articolo→numero_rivista, articolo→serie

3. **Import dati** ✅ COMPLETATO (2026-03-21)
   - Script: `scripts/db_analysis/import_to_directus.py`
   - temi: 285 | tags: 816 | autori: 352 | numeri_rivista: 204 | articoli: **3527/3527**
   - 39 articoli senza corrispondenza nel megacluster (flipbook storici e media)

4. **Configurazione UI Directus** ✅ COMPLETATO (2026-03-21)
   - Fix relazioni M2M `articoli↔temi` e `articoli↔tags`:
     junction fields mancavano di meta (`interface`, `special`) → PATCH applicati
     campi alias in `articoli` aggiornati con `options.junctionCollection`
   - Campo `corpo` → `input-rich-text-html` con toolbar personalizzata (bold/italic/h2-h4/link/image/code)
   - Display template M2O in `articoli`: autore→`{{nome_completo}}`, numero_rivista→`{{display_title}}`, serie→`{{nome}}`
   - `display_template` impostato su tutte le collection: autori/temi/tags/serie/numeri_rivista
   - Template M2M aggiornati con path traversal: `{{tags_id.nome}}`, `{{temi_id.nome}}`

5. **Immagini copertina** ✅ COMPLETATO (2026-03-21)
   - Script: `scripts/db_analysis/migrate_images.py`
   - 2972/2972 immagini scaricate dal vecchio WordPress e caricate su Directus (storage locale VPS)
   - Cartella "copertine" (UUID `e1bd6b06-3057-4c28-8468-29b47de976a3`)
   - 2972 articoli aggiornati con `immagine_copertina`, 0 errori, 0 immagini 404
   - Nota: R2 (Cloudflare) non usato — token `cfat_...` (53 char) incompatibile con endpoint S3 R2 (attende 32 char)
     → migrazione a R2 rinviata; nel frattempo storage locale VPS (40 GB SSD, ~650 MB occupati)

6. **Aggiornamento Astro** (~3-4 giorni)
   - Sostituire file `.md` statici con fetch da Directus API
   - SSR/ISR su Cloudflare Pages

7. **Testing e cutover** (~1-2 giorni)

---

## Architettura Dati Legacy (Astro attuale)

Il sito Astro attuale è costruito da:

1. **V5 CSV** (`_migration_archive/categorie v2/articoli_*_FINAL_V5.csv`)
   → temi, `categoria_menu`, `ruolo_editoriale`, `categoria_formale`

2. **Export PHP** (`estrai_tutto.json` — ignorato da git, pesante)
   → immagini copertina, sottotitoli, `id_autore`

3. **AI enrichment** → clustering UMAP, embedding semantici

Flusso build: `build_articoli_megacluster.js` → `src/data/articoli_megacluster.json`

---

## Bug Noti (archivio)

- Bio autore duplicata in calce ad alcuni articoli (fix parziale)
- Related box posizionamento (fix parziale applicato)
- Residui HTML in alcuni body (risolto con rigenerazione da dump SQL)
- 41 articoli con `word_count=0`: 18 flipbook storici 1983–85 (legittimi),
  23 embed/media senza testo (accettabili)

---

## Struttura File Chiave

```
scripts/db_analysis/         Analisi e import DB WordPress
  extract_wp_content.py      Estrae articoli dal dump SQL
  analyze_taxonomy.py        Estrae tassonomia + numeri
  extract_wp_images.py       Estrae immagini con metadati
  output/                    Dataset puliti pronti per import
    articoli_wp_puliti.json
    autori_wp.json
    numeri_rivista_wp.json
    categorie_wp.json
    tag_wp.json
    immagini_wp.json

docs/
  CMS_MIGRATION_SPEC.md      Specifica migrazione completa (v1.2)
  ARCHITETTURA_DATI.md       Architettura dati corrente

src/data/
  articoli_megacluster.json  Metadati AI usati dal sito Astro

scripts_and_data/
  datasets/                  Dataset legacy pipeline AI
  reports/                   Report analisi e audit
```

---

## Completato oggi — 2026-03-22

- **Token Directus e fix redirects** — token admin rinnovato, 2000 redirect statici OK
- **Corpo articoli HTML rigenerato** — dump SQL → HTML pulito reimportato in Directus (3487/3487 OK)
- **Foto autori migrate su R2** — 88/88 foto autori migrate su `autori/{uuid}` (R2 `oel-media`)
- **Copertine numeri rivista su R2** — 204/204 copertine migrate su `numeri/{wp_id}.jpg`; campo `copertina_url` popolato su tutti i record `numeri_rivista`
- **Rimappatura articoli → numeri rivista** — 2217 articoli rimappati (693 rimasti null per mancanza dato in WP); re-import via `reimport_numero_rivista.py`
- **Backfill tassonomia** — `forma`, `tema_label`, `categoria_menu`, `ruolo_editoriale` popolati su 3488/3488 articoli da `_legacy_articoli_megacluster.json`; 0 errori; pagine categoria tutte a 200 OK

---

## Prossimi Step Immediati

1. **Archivio** — verificare che le copertine dei numeri appaiano in `/archivio/` (`copertina_url` ora popolato)

2. **Fix pagina autore** — `src/pages/autori/[slug].astro:18`: filtro per `nome_completo` va sostituito con UUID per evitare mismatch su nomi con apostrofo/accento

3. **Fix filtro articoli `[issue].astro`** — aggiungere `stato=published` alla query Directus per non mostrare bozze

3b. **Ricerca interna** — farla funzionare sfruttando embedding + clustering pgvector (ricerca semantica impeccabile)

4. **617 articoli con `numero_rivista=null`** — investigare i numeri mancanti in Directus e importarli (attualmente 693 null, di cui ~617 IT)

5. **Cloudflare Worker** per i **16630** redirect in overflow (`redirects_overflow.json`)

6. **Ruoli e permessi Directus** per la redazione

7. **Upgrade VPS CX23 → CX32** prima di attivare embedding pgvector

8. **Cutover DNS** `ombreeluci.it` + custom domain R2 `media.ombreeluci.it` — solo quando il sito è pronto per produzione

---

## User Stories (backlog idee — da decidere quando e come)

| # | Storia | Note tecniche |
|---|--------|---------------|
| US-01 | **Homepage dinamica** — articoli in prima sezione vanno in rotazione ad ogni visita o ogni N secondi, per dare senso di rivista viva | Pool di 12-20 card pre-renderizzate al build (statiche, SEO-safe), shuffle JS client-side con cross-fade CSS. Selezione ponderata: `ruolo_editoriale=portante/strutturale`, distribuzione tra categorie, max 1 autore, ultimi 24 mesi |
| US-02 | **Ricerca semantica** — ricerca interna per concetto, non solo parola esatta | Embedding pgvector su Directus, CF Worker endpoint, richiede upgrade VPS CX23→CX32. Da fare dopo cutover DNS |
| US-03 | **Mobile responsive overhaul** — header mega menu, card copertine, padding/spacing globale, layout pagine categoria e autori su schermi <768px | Sessione dedicata: restyle Header (z-index mega menu), IssueCard breakpoint, global.css fluid grid |
| US-04 | **Didascalie copertine** — mostrare il testo caption delle immagini copertina degli articoli | Dati in campo `custom_caption` nel dump Divi; importarli in Directus campo `didascalia_copertina` su `articoli`, poi mostrare sotto immagine in `[...slug].astro` |
| US-05 | **Placeholder copertina bello** — articoli senza copertina mostrano un placeholder grigio/viola orrendo; sostituire con immagine di default bella e piacevole, idealmente variata (non sempre la stessa) | Scaricare 8-12 immagini dalla collezione Unsplash `NbeG1_Dn7DI` (placeholder-oel), caricarle su R2, selezionarle pseudo-random via hash dello slug. Da applicare in ArticleCard, nella pagina articolo, e nella lista risultati Pagefind |
| US-06 | **Box revisione editoriale in calce** — il box che mostra la gerarchia editoriale dell'articolo non carica i contenuti | Investigare perché il componente non popola i dati (probabilmente fetch Directus mancante o campo vuoto); verificare su 3-4 articoli campione |
| US-07 | **Homepage diari: layout 2×2 desktop** — i diari nella homepage vanno in un box a 2 colonne × 2 righe su desktop, non in lista lineare | CSS grid `repeat(2, 1fr)` con max 4 card; `flex-wrap` su mobile |
| US-08 | **Info testata numero rivista** — pagina numero rivista manca di "Anno 41 – Numero 3 – Luglio–Agosto–Settembre 2023" | Dati nel dump Divi: `<em>` dentro `IntestazioneNumero`; estrarre con script, popolare campo `periodo_label` (già esiste) o `sottotitolo` in Directus su `numeri_rivista` |
| US-12 | **Bug filtri Directus CMS su articoli** — i filtri per numero rivista e per data non funzionano nella lista articoli di Directus, rendendo difficile spostare articoli da un numero all'altro | Investigare: campo `numero_rivista` è relazione M2O, il filtro relazionale in Directus potrebbe richiedere configurazione nel data model (display template, sort field); verificare anche filtro per `data_pubblicazione` |
| US-11 | **Tasto "Modifica in Directus" da articolo** — da loggato nel CMS, navigando un articolo sul sito compare un pulsante fisso (es. bottom-right) che apre direttamente la scheda di modifica in Directus (`/admin/content/articoli/{id}`) | Verificare se Directus espone cookie di sessione leggibili dal sito; in alternativa usare un flag `?edit=1` con credenziali memorizzate in `localStorage`; il pulsante deve essere invisibile ai visitatori non autenticati |
| US-10 | **Archive.org link per 37 OEL mancanti** — numeri OEL 1-15, 34, 40, 131-172 non hanno `wp_url`/`pdf_archive_url` | Scraping profilo `https://archive.org/details/@ombre_e_luci` per trovare tutti gli identifier disponibili; matching per numero progressivo; PATCH Directus |
