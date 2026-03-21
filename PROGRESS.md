# PROGRESS — Ombre e Luci

**Ultimo aggiornamento:** 2026-03-21
**Stato generale:** **Import Directus completato.** Tutte le 5 collection importate: temi (285), tags (816), autori (352), numeri_rivista (204), articoli (3527/3527). Schema Directus operativo con relazioni M2M corrette.

---

## Stato del Progetto

La rivista Ombre e Luci (cattolica italiana, disabilità e fede, fondata 1983) è in migrazione
da WordPress+Divi a uno stack moderno Astro + Directus.

---

## Stack Tecnico

| Layer | Tecnologia | Stato |
|-------|-----------|-------|
| Frontend | Astro (output 100% statico) su Cloudflare Pages | **Attivo** |
| CMS temporaneo | Keystatic Worker su Cloudflare Workers | **Attivo** (solo nuovi articoli) |
| CMS | Directus su Hetzner CX23 | **Import completato** (3527 articoli) |
| Database | PostgreSQL 16 + pgvector 0.8.2 (Hetzner) | **Attivo** |
| Storage media | Cloudflare R2 | **Da fare** |

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

4. **Aggiornamento Astro** (~3-4 giorni)
   - Sostituire file `.md` statici con fetch da Directus API
   - SSR/ISR su Cloudflare Pages

5. **Testing e cutover** (~1-2 giorni)

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

## Prossimi Step Immediati

1. (Opzionale) Import M2M articoli↔temi e articoli↔tags (richiede dati categorie dal megacluster)
2. Import immagini copertina su Cloudflare R2 + aggiornare `immagine_copertina` su Directus
3. Aggiornamento stack Astro: fetch dati da Directus API invece di file `.md` statici
4. Setup reverse proxy TLS (HTTPS) per Directus se necessario prima del cutover
