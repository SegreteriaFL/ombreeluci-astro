# Report rimappatura articoli → numeri rivista

**Data:** 2026-02-02  
**Script:** `scripts_and_data/scripts/rimappa_articoli_numeri_megacluster.py`

## Obiettivo

Unificare le informazioni di rimappatura degli articoli OEL/INS nei rispettivi numeri usando:

- **Fonte A:** `numeri_wp_FINAL.json` → per ogni numero, lista `articoli_urls`; match con il megacluster per URL (o slug).
- **Fonte B:** per gli articoli senza match via URL, uso del campo `categories_slugs` (es. `n-100`, `numero-1-1983`) per identificare il numero.

Aggiornamento di `src/data/articoli_megacluster.json` con `numero_rivista` e `anno_rivista` (e `id_numero`) per tutti gli articoli con WP_ID.

---

## Check finale – Risultati dopo il doppio incrocio

| Metrica | Valore |
|--------|--------|
| **Totale articoli nel megacluster (con WP_ID)** | 3 488 |
| Assegnati via **URL** (Fonte A) | 1 515 |
| Assegnati via **categories_slugs** (Fonte B) | 615 |
| **Totale con numero_rivista e anno_rivista** | **2 130** |
| **Articoli orfani** (senza numero dopo entrambe le fonti) | **1 358** |
| **Copertura** | **61,07%** |

### Dettaglio fonti

- **Solo URL:** 1 515 articoli hanno trovato numero solo tramite match con `articoli_urls` dei numeri.
- **Solo categories:** 615 articoli hanno trovato numero solo tramite una categoria numero (es. `numero-1-1983`, `n-100`) in `categories_slugs`.
- Nessun articolo è stato assegnato da entrambe le fonti sullo stesso run (l’ordine è: prima URL, poi categories).

---

## Orfani

**1 358 articoli** restano senza `numero_rivista`/`anno_rivista` dopo il doppio incrocio perché:

1. Il loro URL (costruito da anno + slug) **non** compare in nessuna lista `articoli_urls` di `numeri_wp_FINAL.json`.
2. Le loro `categories_slugs` **non** contengono uno slug di numero riconosciuto (`numero-N-YYYY` o `n-N`).

L’elenco completo degli orfani (WP_ID) è in:

- **JSON:** `scripts_and_data/report_rimappatura_numeri.json` → chiave `orfani_wp_ids`.

Possibili cause: articoli non associati a un numero in WP, numeri non ancora presenti in `numeri_wp_FINAL`, categorie numero assenti o con slug diversi, URL storici non allineati.

---

## File aggiornati

- **`src/data/articoli_megacluster.json`**  
  Per ogni articolo con match sono stati impostati: `numero_rivista`, `anno_rivista`, `id_numero` (dove disponibile).
- **`scripts_and_data/report_rimappatura_numeri.json`**  
  Report machine-readable con conteggi e lista `orfani_wp_ids`.

Per rigenerare report e megacluster:

```bash
python scripts_and_data/scripts/rimappa_articoli_numeri_megacluster.py
```
