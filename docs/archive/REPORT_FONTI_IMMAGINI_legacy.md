# Report: Fonti immagini – Export originali vs V5

**Data:** 1 febbraio 2026  
**Scope:** confronto tra i 4 file originali da 1.000 record (primo fetch) e il CSV FINAL_V5 per la presenza di colonne/campi relativi alle immagini.

---

## 1. File analizzati

### Export originali (4 file × ~1.000 record)

- **Percorso:** `_migration_archive/export pulito db 2026/export_1000_1.json`, `export_1000_2.json`, `export_1000_3.json`, `export_1000_4.json`
- **Struttura di ogni record:** oggetto JSON con chiavi:
  - `id` (numero, post ID WordPress)
  - `url` (stringa, URL articolo)
  - `meta` (oggetto: `title`, `date`, `author`)
  - `tax` (oggetto: `categories`, `tags` – term_id, slug, name)
  - `raw_html` (stringa, contenuto HTML/Divi dell’articolo)

### CSV V5 (Source of Truth)

- **Percorso:** `_migration_archive/categorie v2/articoli_2026_enriched_temi_s8_FINAL_V5.csv`
- **Colonne:** id_articolo, titolo, link, cluster_id, cluster_prob, outlier_score, umap2_x, umap2_y, umap3_x, umap3_y, umap3_z, id_subcluster, tema_code, tema_label, confidenza_tema, origine_assegnazione, ruolo_editoriale, categoria_menu, categoria_formale

---

## 2. Presenza di colonne/campi immagine

### 2.1 Export originali (export_1000_1–4.json)

- **Colonna/campo dedicato per immagine in evidenza:** **assente**.
- Non è presente alcun campo di primo livello come `featured_image`, `attachment_url`, `thumbnail`, `image_url` o simile.
- Le uniche occorrenze legate alle immagini sono **dentro** `raw_html`:
  - attributi `portrait_url` nei moduli Divi (es. `et_pb_testimonial portrait_url="..."`)
  - tag `<img ... src="...">` e URL di media WordPress (es. `wp-content/uploads/...`) inclusi nel contenuto HTML.

Quindi: **non esiste una colonna “immagine” esplicita** negli export originali; le immagini sono solo **embedded nel contenuto** (raw_html).

### 2.2 CSV V5

- **Colonna dedicata per immagine:** **assente**.
- Il V5 contiene solo dati di classificazione (temi, forme, ruoli) e metadati di base (id, titolo, link); non include contenuto né riferimenti a media.

---

## 3. Conclusione

| Sorgente              | Colonna/campo `featured_image` o `attachment_url` |
|-----------------------|--------------------------------------------------|
| Export originali 1–4  | **No** – solo immagini dentro `raw_html`         |
| CSV FINAL_V5          | **No** – nessun campo immagine                   |

In **nessuna** delle due fonti è presente una colonna dedicata per l’immagine in evidenza. La differenza è che negli export originali le immagini compaiono **solo** all’interno di `raw_html` (tag `<img>`, `portrait_url`, URL wp-content); nel V5 non c’è né una colonna immagine né il contenuto HTML.

Per avere in futuro un campo “immagine in evidenza” (es. per card o anteprime) si dovrà:
- estrarre la prima immagine significativa da `raw_html` (negli export originali o in un derivato che conservi il contenuto), oppure
- recuperare `featured_image`/`attachment_url` da un’altra sorgente (es. API o export WordPress che esponga quel campo).
