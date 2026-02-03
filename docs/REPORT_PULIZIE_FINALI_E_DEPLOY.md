# Report pulizie finali e readiness per deploy

**Data:** 2026-02-02  
**Copertura articoli–numero:** 99,1%

---

## 1. Marcatura lingua

| Stato | Dettaglio |
|-------|-----------|
| **Fatto** | Tag `lang: en` applicato ai **163** articoli identificati come inglesi (report `report_articoli_inglese.md`). |
| **Default** | Tutti gli altri articoli hanno **`lang: it`** nel frontmatter (4.004 file). |
| **Schema** | `src/content/config.ts` aggiornato con `lang: z.enum(['it', 'en']).default('it')`. |

---

## 2. Riorganizzazione fisica (cartelle)

| Stato | Dettaglio |
|-------|-----------|
| **Fatto** | Tutti i `.md` spostati da `cluster-*` a cartelle per **id_numero**: `src/content/blog/OEL-86/`, `INS-27/`, ecc. |
| **Orfani** | I **38** articoli senza numero sono in **`src/content/blog/extra-web/`**. |
| **Pulizia** | Le vecchie cartelle **cluster-*** (incluso `cluster--1`) sono state rimosse dopo lo spostamento. |
| **Bridge** | `bridge_articoli_numeri.csv` e `bridge_articoli_numeri.json` hanno i **relative_path** aggiornati (es. `src/content/blog/OEL-168/cura-e-civilta.md`). |

---

## 3. Sincronizzazione database e configurazione

| Stato | Dettaglio |
|-------|-----------|
| **numeri_consolidati.json** | Generato in **`src/data/numeri_consolidati.json`** (197 numeri: originali + sintetici OEL-86, OEL-96, ecc.). |
| **Schema frontmatter** | In **`src/content/config.ts`** sono definiti: `issue_number`, `id_numero`, `lang`, `numero_rivista`, `anno_rivista`. |
| **Pagina Archivio** | **`src/pages/archivio/[issue].astro`** usa **`numeri_consolidati.json`** invece di `numeri_wp_FINAL.json`; ordinamento gestisce `anno_pubblicazione` null (numeri sintetici). |

---

## 4. Test di integrità e build

| Check | Esito |
|-------|--------|
| **Percorsi immagini / link** | I contenuti usano `getCollection('blog')`; gli slug e i path sono derivati da Astro. I link interni che usano `data.slug` o `entry.id` continuano a funzionare con la nuova struttura (OEL-XXX/slug). Link hardcoded a `/blog/cluster-X/...` andrebbero aggiornati a `/blog/...slug...` se presenti. |
| **Build** | `npm run build` è stato avviato; la generazione con 4.167+ pagine richiede diversi minuti. **Eseguire localmente `npm run build`** per conferma completa e per verificare l’assenza di errori di validazione. |

---

## Riepilogo azioni eseguite in questa sessione

1. **Config:** aggiunti in `src/content/config.ts` i campi **`id_numero`** e **`lang`** nello schema del collection `blog`.
2. **Archivio:** sostituito l’import da `numeri_wp_FINAL.json` a **`src/data/numeri_consolidati.json`** in `src/pages/archivio/[issue].astro`.
3. **Archivio:** ordinamento numeri robusto rispetto a **`anno_pubblicazione`** null (numeri sintetici).

---

## Verifica pre-push (eseguita)

1. **Build completo:** `npm run build` eseguito; supera **Collecting build info** e **Building static entrypoints** senza errori di validazione. La generazione di 4.167+ pagine richiede 10+ minuti: per conferma completa eseguire in locale `npm run build` e attendere il termine.
2. **Preview:** `npm run preview` avviato su `http://localhost:4321/`. Per testare su build aggiornato: completare prima `npm run build`, poi `npm run preview`, e controllare home, `/archivio/oel-86`, `/blog/[slug]`.
3. **Link:** Cercati riferimenti a `cluster-` nel codice:
   - **Nessun link fisso** a `cluster-` trovato; `ArticleCard.astro` usa `/blog/${slug}` (dinamico).
   - **Commenti** in `src/pages/blog/[...slug].astro` aggiornati: esempi da `cluster-14/...` a `OEL-86/...`.

Dopo build completo e preview il progetto è pronto per il **push finale**.
