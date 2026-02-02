# Stato di stabilità – Ombre e Luci

**Data:** 2 febbraio 2026  
**Stato:** Punto di stabilità raggiunto. Documentazione per il futuro.

---

## 1. Architettura Dati

### Database finale

Il **database finale** usato dal sito Astro è:

- **File:** `src/data/articoli_megacluster.json`
- **Contenuto:** **3488 articoli** con temi, categorie, forme, immagini di copertina, sottotitoli e riferimenti agli autori.

### Processo di merge

Il JSON viene costruito in tre passaggi:

1. **V5 (contenuti)**  
   Fonte: `_migration_archive/categorie v2/articoli_2026_enriched_temi_s8_FINAL_V5.csv`.  
   Fornisce: `id_articolo`, temi, `categoria_menu`, `ruolo_editoriale`, `categoria_formale` (forma).

2. **Export PHP (immagini / bio)**  
   - **Articoli:** `estrai_tutto.json` (export dal sito WordPress con tutti i post, `suppress_filters`) → merge in `media_articoli.csv` (immagini copertina, sottotitoli, `id_autore`).  
   - **Autori:** `database_autori.csv` è la fonte per **bio** e **foto** degli autori; viene letto da `build_articoli_megacluster.js` e incluso in `articoli_megacluster.json` come `autoriById`.

3. **API Fallback**  
   Per gli articoli ancora senza immagine dopo il merge con l’export PHP, lo script `merge_media.js` può integrare tramite API WordPress (`/wp-json/wp/v2/media?parent=...`) le immagini mancanti.

Il flusso completo è: **V5** → **merge_media.js** (V5 + estrai_tutto.json + eventuale API) → **media_articoli.csv** → **build_articoli_megacluster.js** (V5 + media_articoli.csv + database_autori.csv) → **articoli_megacluster.json**.

---

## 2. Stato degli Autori

### Fonte dati autori

- **File:** `src/data/database_autori.csv`
- **Colonne:** `id_autore`, `nome_cognome`, `url_autore_wp`, `bio_html`, `foto_url`
- **Ruolo:** È la **fonte** per bio e foto degli autori. Il build `build_articoli_megacluster.js` legge questo CSV e popola `autoriById` nel JSON finale.

### Bio mancanti: patch_bios.js

Se le bio non sono nell’export PHP (colonna `bio_html` vuota), si usano:

- **Script:** `scripts/patch_bios.js`
- **Funzione:** Recupero **selettivo** delle bio tramite scraping delle pagine autore del sito live (`https://www.ombreeluci.it/author/[slug]/`, versione IT).
- **Target:** Primi N autori principali (da `autori_stats.json`). Estrae il blocco Divi `.et_pb_text_2_tb_body .et_pb_text_inner` e aggiorna `database_autori.csv`.
- **Uso:** `node scripts/patch_bios.js` → poi rieseguire `node scripts/build_articoli_megacluster.js` per allineare il JSON.

Le pagine autore del sito Astro (`src/pages/autori/[slug].astro`) leggono **slug** da `Astro.params.slug` e dati da `autoriById[slug]` (foto, bio con supporto HTML: tag `<i>`, `<b>`, `<p>`, `<a>` ecc.).

---

## 3. Fix Mobile & Layout

### Modifiche CSS critiche

- **Griglia articoli su mobile:**  
  Su schermi piccoli (`max-width: 768px`), la griglia degli articoli usa **una sola colonna**:
  - `grid-template-columns: 1fr !important;`
  - Applicato a `.articles-grid` nelle pagine: Home (`index.astro`), archivio, categoria, autori, articolo singolo.

- **Overflow del testo:**  
  Per evitare che il testo esca dai bordi nelle card in griglia:
  - **Regola globale:** In `src/styles/global.css`, dentro la media `(max-width: 768px)`, è stato aggiunto:
    - `.articles-grid > * { min-width: 0; }`
  - **Pagina Home:** In `src/pages/index.astro`, nella stessa media, è presente la stessa regola per coerenza.
  - **ArticleCard:** In `src/components/ArticleCard.astro`, per viewport ≤ 480px la riga autore (`.author-row`) usa `white-space: normal; flex-wrap: wrap;` per andare a capo invece di uscire dal bordo.

### Componenti e pagine

- **ArticleCard:** Usa `img_copertina_url` (da megacluster/`byId`) per l’immagine; fallback su placeholder. Props: titolo, autore, data, issue, slug, image, categoriaMenu, forma, ruoloEditoriale.
- **Pagine autore `[slug].astro`:**  
  - **Slug:** Letto da **`Astro.params.slug`** (non da `Astro.props`).  
  - **Foto:** `autoriById[slug].foto_url` con fallback su `/assets/authors/{slug}.jpg`.  
  - **Bio:** `autoriById[slug].bio_html`; se contiene tag HTML (es. `<i>`, `<b>`, `<p>`) viene renderizzata con `set:html`; altrimenti il testo viene messo in un `<p>` escapato.  
  - Stili in `.author-bio-content` per corsivo, grassetto e link.

---

## 4. Istruzioni per il Futuro

### Rigenerare dati e sito

Ordine consigliato per rigenerare il tutto a partire da V5 e export PHP:

```bash
# 1. Merge media: V5 + estrai_tutto.json (export PHP) + eventuale API per immagini mancanti
node scripts/merge_media.js

# 2. Build del megacluster: V5 + media_articoli.csv + database_autori.csv → articoli_megacluster.json
node scripts/build_articoli_megacluster.js
```

**Prerequisiti:**

- `_migration_archive/categorie v2/articoli_2026_enriched_temi_s8_FINAL_V5.csv` (V5) presente.
- `src/data/estrai_tutto.json` aggiornato (export PHP dal sito con tutti i post, `suppress_filters`).
- Opzionale: `src/data/database_autori.csv` con bio/foto; se le bio mancano, eseguire prima `node scripts/patch_bios.js` e poi il build.

**Nota:** `merge_media.js` scrive solo in `media_articoli.csv`. Il build del sito (card, pagine autore, menu) dipende da `articoli_megacluster.json`, quindi dopo ogni modifica a V5, a `media_articoli.csv` o a `database_autori.csv` va rieseguito `build_articoli_megacluster.js`.

---

## Riferimenti

- **Architettura dati dettagliata:** `docs/ARCHITETTURA_DATI.md`
- **Script principali:** `scripts/merge_media.js`, `scripts/build_articoli_megacluster.js`, `scripts/patch_bios.js`
