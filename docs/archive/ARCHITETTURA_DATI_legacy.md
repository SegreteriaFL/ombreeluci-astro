# Architettura Dati – Ombre e Luci

**Data:** 2 febbraio 2026  
**Stato:** Punto di stabilità. Database finale: `src/data/articoli_megacluster.json` (3488 articoli).

---

## 1. Database finale e processo di merge

Il **database finale** usato dal sito Astro è:

- **File:** `src/data/articoli_megacluster.json`
- **Contenuto:** 3488 articoli con temi, categorie, forme, immagini di copertina, sottotitoli e riferimenti agli autori (`byId` + `autoriById`).

**Processo di merge:**

1. **V5 (contenuti)** — `articoli_2026_enriched_temi_s8_FINAL_V5.csv`: temi, categoria_menu, ruolo_editoriale, categoria_formale.
2. **Export PHP (immagini/bio)** — `estrai_tutto.json` (export WordPress, tutti i post, suppress_filters) → merge in `media_articoli.csv`; autori in `database_autori.csv` (bio, foto).
3. **API Fallback** — Per articoli ancora senza immagine, `merge_media.js` integra tramite API WP (`/wp-json/wp/v2/media?parent=...`).

Ordine di rigenerazione: `node scripts/merge_media.js` → `node scripts/build_articoli_megacluster.js`. Vedi anche **PROGRESS.md** in root.

---

## 2. Source of Truth (Fonte Unica di Verità)

Per la migrazione e per la build del sito Astro, la **fonte unica di verità** è:

- **File:** `articoli_2026_enriched_temi_s8_FINAL_V5.csv`
- **Percorso:** `_migration_archive/categorie v2/articoli_2026_enriched_temi_s8_FINAL_V5.csv`

Tutti i dati di classificazione semantica (temi, forme, ruoli) e gli ID articolo di riferimento devono allinearsi a questo CSV. Gli script di build leggono da qui; gli audit e i report devono essere generati a partire da V5 per coerenza.

---

## 2. Colonne del CSV V5 e significato editoriale

### 2.1 Elenco colonne

| Colonna | Tipo | Descrizione |
|--------|------|-------------|
| `id_articolo` | ID | Identificativo numerico articolo (WordPress post ID) |
| `titolo` | Testo | Titolo dell’articolo |
| `link` | URL | URL canonico articolo su ombreeluci.it |
| `cluster_id` | Numero | ID cluster UMAP (0 = cluster principale) |
| `cluster_prob` | Numero | Probabilità di appartenenza al cluster |
| `outlier_score` | Numero | Score di outlier (clustering) |
| `umap2_x`, `umap2_y` | Numero | Coordinate UMAP 2D (embedding) |
| `umap3_x`, `umap3_y`, `umap3_z` | Numero | Coordinate UMAP 3D |
| `id_subcluster` | Numero | ID subcluster (es. cluster 0 esploso) |
| `tema_code` | Codice | Codice tema (T01–T15; T20 ricatalogato) |
| `tema_label` | Testo | Label estesa del tema (es. "Famiglie, genitori, fratelli") |
| `confidenza_tema` | Numero | Confidenza assegnazione tema |
| `origine_assegnazione` | Testo | Es. `subcluster_diretto` |
| `ruolo_editoriale` | Testo | **Ruolo** (vedi sotto) |
| `categoria_menu` | Testo | **Label sintetica per menu** (alias tema) |
| `categoria_formale` | Testo | **Forma** (vedi sotto) |

### 2.2 Significato editoriale: Ruoli, Forme, Temi

- **Ruoli (ruolo_editoriale)**  
  Ruolo dell’articolo nella rivista: `strutturale`, `trasversale`, `portante`, ecc. Usato per analisi e filtri; in V5 non sempre valorizzato ovunque.

- **Forme (categoria_formale)**  
  Forma editoriale dell’articolo. Valori ammessi: **Intervista**, **Recensione**, **Editoriale**, **Testimonianza**, **Articolo**.  
  Derivata da tag/categorie WordPress (audit) e allineata al menu “forme” del sito (Editoriali, Interviste, Recensioni, Testimonianze).

- **Temi (tema_code, tema_label, categoria_menu)**  
  - `tema_code`: codice cluster (T01–T15).  
  - `tema_label`: label estesa (es. "Fede, Chiesa e spiritualità della fragilità").  
  - `categoria_menu`: label sintetica usata nel mega menu (es. "Fede", "Storia", "Disabilità").  
  I 15 temi sono il risultato della ricatalogazione post–T20 (esplosione cluster “Domande aperte” negli altri temi).

---

## 3. Script `build_articoli_megacluster.js` e JSON per Astro

### 3.1 Scopo

Lo script legge il CSV **FINAL_V5** e genera `src/data/articoli_megacluster.json`, usato dal sito Astro per:

- risolvere tema/categoria/forma per ogni articolo (by ID);
- popolare menu (temi, slug);
- filtri per categoria/forma nelle pagine elenco.

### 3.2 Input / Output

- **Input:** `_migration_archive/categorie v2/articoli_2026_enriched_temi_s8_FINAL_V5.csv`
- **Output:** `src/data/articoli_megacluster.json`

### 3.3 Logica

1. **Parsing CSV**  
   Parsing riga per riga con gestione virgolette (campi con virgola). Colonne usate: `id_articolo`, `tema_label`, `categoria_menu`, `ruolo_editoriale`, `categoria_formale`.

2. **Costruzione `byId`**  
   Per ogni riga con `id_articolo` valido viene creato un oggetto:
   - `tema_label` → tema esteso
   - `categoria_menu` → categoria per menu (se assente, usa `tema_label`)
   - `ruolo_editoriale` → ruolo
   - `forma` → valore di `categoria_formale` (Intervista, Recensione, Editoriale, Testimonianza, Articolo)

3. **Indici globali**  
   - `temiUnici`: elenco ordinato di tutti i `tema_label` presenti.
   - `categorieUniche`: elenco ordinato di tutte le `categoria_menu`.
   - `slugToTema`: mappa slug (tema normalizzato) → `tema_label`.
   - `temaToCategoria`: mappa `tema_label` → `categoria_menu` (per menu e display).

4. **Payload JSON**  
   L’oggetto scritto in `articoli_megacluster.json` contiene:
   - `byId`: mappa `id_articolo` → `{ tema_label, categoria_menu, ruolo_editoriale, forma }`
   - `temiUnici`, `categorieUniche`, `slugToTema`, `temaToCategoria`
   - `generatedAt`: timestamp di generazione

### 3.4 Esecuzione

**Rigenerare il tutto (merge media + build):**

```bash
node scripts/merge_media.js
node scripts/build_articoli_megacluster.js
```

**Solo build** (V5 e CSV già aggiornati):

```bash
node scripts/build_articoli_megacluster.js
```

**Prerequisito:** il file FINAL_V5 deve esistere. Se si rigenera V5 a partire da V4 + audit:

```bash
node scripts/build_final_v5.js
node scripts/merge_media.js
node scripts/build_articoli_megacluster.js
```

---

## 4. Dipendenze tra file

- **V5** ← generato da `build_final_v5.js` (FINAL_V4 + `audit_migrazione_completa.csv`).
- **audit_migrazione_completa.csv** ← generato da `generate_audit_migrazione.js` (legge V5 e, se utile, `articoli_semantici_FULL_2026.json` per tag/categorie originali).
- **articoli_megacluster.json** ← generato da `build_articoli_megacluster.js` (legge V5; opzionalmente unisce `media_articoli.csv` e `database_autori.csv`).
- **media_articoli.csv** ← generato da `merge_media.js` (V5 + estrai_tutto.json + eventuale API WP).
- **database_autori.csv** ← fonte per bio e foto autori; bio mancanti: `patch_bios.js` (scraping selettivo).

Per un ciclo coerente: aggiornare l’audit da V5 → eventualmente rigenerare V5 se si cambia l’audit → rilanciare `build_articoli_megacluster.js`. Per arricchire: `merge_media.js` poi `build_articoli_megacluster.js`; per bio autori: `patch_bios.js` poi build.

---

## 5. Media Harvester e CSV di supporto

Lo script **`scripts/media_harvester.js`** effettua uno scraping mirato sugli URL articolo del V5 e sulle pagine autore individuate dai link nelle pagine articolo.

### 5.1 Cosa fa

- **Per ogni articolo (URL da V5):** scarica la pagina, estrae `og:image` (meta) e il contenuto HTML/testo di `h2.tit2` (sottotitolo); individua il link alla pagina autore (`a[href*="/author/"]` o `a[rel="author"]`).
- **Per ogni autore (URL non ancora in cache):** scarica la pagina autore, estrae l’HTML di `.bio-autore .et_pb_text_inner` (bio con link preservati) e l’URL dell’immagine in `.img-autore img`.

Concorrenza limitata a **5 richieste** in parallelo; cache autori per non rivisitare la stessa pagina autore.

### 5.2 Output

- **`src/data/media_articoli.csv`** — colonne: `id_articolo`, `titolo`, `url_articolo`, `img_copertina_url`, `sottotitolo`.
- **`src/data/database_autori.csv`** — colonne: `id_autore` (slug del nome), `nome_cognome`, `url_autore_wp`, `bio_html`, `foto_url`.

### 5.3 Integrazione nel build

`build_articoli_megacluster.js` legge questi due CSV (se presenti) e:

- unisce in **`byId`** per ogni articolo i campi `img_copertina_url` e `sottotitolo` da `media_articoli.csv`;
- aggiunge al JSON finale **`autoriById`** (chiave = `id_autore`) con `nome_cognome`, `url_autore_wp`, `bio_html`, `foto_url` da `database_autori.csv`.

Astro può quindi usare immagini di copertina, sottotitoli e dati autore dal JSON senza ulteriori chiamate.

### 5.4 Esecuzione

```bash
npm install cheerio   # se non già installato
node scripts/media_harvester.js
node scripts/build_articoli_megacluster.js
```
