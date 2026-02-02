# Audit Tecnico e Mappatura – Indicizzazione Ombre e Luci

**Data:** 1 febbraio 2026  
**Scope:** infrastruttura rotte, ArticleCard, sorgente dati FINAL_V2/V3, tassonomia, stato Git.

---

## 1. Stato dell'infrastruttura

### Rotte attive (pagine che elencano articoli)

| Rotta | File | Usa ArticleCard? | Note |
|-------|------|------------------|------|
| `/` | `src/pages/index.astro` | ✅ Sì | Home, griglia articoli |
| `/categoria/[categoria]` | `src/pages/categoria/[categoria].astro` | ✅ Sì | Lista per tema/forma |
| `/autori/[slug]` | `src/pages/autori/[slug].astro` | ✅ Sì | Lista articoli autore |
| `/archivio` | `src/pages/archivio/index.astro` | ❌ No | Lista **numeri** (IssueCard), non articoli |
| `/archivio/[issue]` | `src/pages/archivio/[issue].astro` | ✅ Sì | Articoli del numero |
| `/archivio/web-only` | `src/pages/archivio/web-only.astro` | ✅ Sì | Solo articoli web |
| `/blog/[...slug]` | `src/pages/blog/[...slug].astro` | ✅ Sì | Lista correlati / interni |

**Conclusione:** Tutte le pagine che **elencano articoli** usano il componente **ArticleCard** (senza link annidati: link solo su immagine + badge + titolo; autore in riga separata con link dedicato).

---

## 2. Sorgente dati

- **File analizzato:** `_migration_archive/categorie v2/articoli_2026_enriched_temi_s8_FINAL_V2.csv`
- **Righe totali (con header):** 3 489 → **3 488 articoli** mappati nel CSV.
- **Riferimento:** 3 488 totali dichiarati → **100%** degli articoli risulta mappato nel CSV FINAL_V2.

**Build attuale:** Lo script `scripts/build_articoli_megacluster.js` legge **FINAL_V3** (non V2) e genera `src/data/articoli_megacluster.json`. Il JSON contiene **3 488** chiavi in `byId` → corrispondenza 1:1 con il CSV di build (V3). Il CSV V3 ha lo stesso numero di righe dati di V2 (ricatalogazione da T20 verso altri temi).

---

## 3. Incongruenze tassonomia

- **FINAL_V2:** 20 temi; cluster **T20 – Domande aperte** presente.
- **FINAL_V3 / sito:** 15 temi (T20 è stato ricatalogato negli altri temi).
- **`articoli_megacluster.json`:** 15 temi in `temiUnici` (allineato a V3).

**Conteggio T20 in FINAL_V2:** 2 227 articoli in **T20 – Domande aperte** (≈64% del totale).  
Nel CSV FINAL_V3 non compare più “Domande aperte” né T20: quei 2 227 articoli sono stati ridistribuiti su T01–T15 (e quindi sulle 15 label attuali).

---

## 4. Stato Git

- **Repository:** nella cartella del progetto **non è presente un repository Git** (`fatal: not a git repository`).
- **Impossibile** verificare se i file critici sono nell’ultimo commit.

**File critici da tenere sotto controllo quando Git sarà attivo:**

- `src/config/taxonomy.js`
- `src/components/ArticleCard.astro`
- `scripts/build_articoli_megacluster.js`
- `src/data/articoli_megacluster.json` (generato)

---

## 5. Riassunto sintetico

| Voce | Esito |
|------|--------|
| Rotte articoli | Tutte usano ArticleCard (senza link annidati). |
| Articoli mappati | 3 488/3 488 nel CSV FINAL_V2; JSON da V3: 3 488 byId. |
| T20 in FINAL_V2 | 2 227 articoli in “Domande aperte”; in V3 assorbiti nei 15 temi. |
| Temi sito vs FINAL_V2 | Sito: 15 temi (da V3); FINAL_V2: 20 temi (con T20). |
| Git | Repo non inizializzato; commit non verificabili. |

**Prossimi passi suggeriti:** allineare build e UI a FINAL_V2 (o mantenere V3) con decisione esplicita su T20; introdurre `ruolo_editoriale` nel JSON e negli UI; alias per label lunghe in `taxonomy.js`; roadmap migrazione commenti Trikkia → ID articolo Megacluster.

---

## Aggiornamento: esplosione T20 (FINAL_V4)

- **Problema:** l’audit su FINAL_V2 mostrava 2 227 articoli in T20 (Domande aperte); l’esplosione non era applicata ai dati usati per l’audit.
- **Soluzione:** script `scripts/explode_t20_build_v4.js` applica lo spacchettamento T20:
  - Ex-T20 con **confidenza &lt; 0,45** → tema **Riflessioni** (T20), categoria **Riflessioni**.
  - Ex-T20 con confidenza ≥ 0,45 → **tema_primario** da `articoli_ricatalogati_v2.csv` (uno dei 15 temi).
- **Output:** `articoli_2026_enriched_temi_s8_FINAL_V4.csv`; il build legge FINAL_V4 e genera `articoli_megacluster.json` con **16 temi** (T01–T15 + Riflessioni).
- **Risultato:** 3 488 articoli distribuiti: **538 in Riflessioni (T20)**, il resto sui 15 temi Sprint 8. Nessun blocco unico T20.
