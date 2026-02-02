# Log Migrazione – Ombre e Luci

**Data:** 1 febbraio 2026  
**Stato attuale:** Milestone 1 – Struttura Semantica e Navigazione

---

## 1. Tappe raggiunte

### 1.1 Esplosione T20 (Riflessioni)

- **Cluster T20 – "Domande aperte"** conteneva la maggior parte degli articoli (≈64% del totale in FINAL_V2).
- È stata eseguita la **ricatalogazione** degli articoli T20 negli altri 15 temi (T01–T15), in base a subcluster e confidenza.
- Da FINAL_V2 (20 temi) si è passati a **FINAL_V3 / V4 / V5** con **15 temi**; T20 non compare più come tema attivo nel menu.

### 1.2 Sincronizzazione Alias / Menu

- **Alias temi:** le label estese (`tema_label`) sono state mappate su label sintetiche per il mega menu (`categoria_menu`), allineate a `taxonomy.js` e al file di audit.
- **Menu:** il sito usa `categoria_menu` (alias) per le voci di navigazione; `tema_label` resta la descrizione estesa (uso interno / audit).

### 1.3 Normalizzazione delle Categorie Formali

- **Categoria formale** (forma editoriale): valori unificati in **Intervista**, **Recensione**, **Editoriale**, **Testimonianza**, **Articolo**.
- Derivazione da tag e categorie WordPress (es. slug `editoriali` → Editoriale, `interviste` → Intervista) tramite script di audit.
- La colonna `categoria_formale` è stata introdotta in **FINAL_V5** (merge di FINAL_V4 con `audit_migrazione_completa.csv`).

---

## 2. Milestone 1: Struttura Semantica e Navigazione

Lo **stato attuale** del progetto è definito come:

**Milestone 1 – Struttura Semantica e Navigazione**

- **Source of Truth:** `articoli_2026_enriched_temi_s8_FINAL_V5.csv` (vedi `docs/ARCHITETTURA_DATI.md`).
- **Dati in uso:** 15 temi, forme (Intervista, Recensione, Editoriale, Testimonianza, Articolo), ruoli editoriali.
- **Build:** `build_articoli_megacluster.js` genera `src/data/articoli_megacluster.json` da V5; il sito Astro usa questo JSON per menu, filtri e pagine elenco (categoria/forma).
- **Navigazione:** Home, Categoria (tema/forma), Autori, Archivio (numeri e articoli per numero), Blog (slug articolo), About.

Nessuna nuova funzionalità è stata aggiunta in questa fase; l’obiettivo è consolidare e documentare lo stato (Punto Zero) per il versionamento.

---

## 3. Prossimi passi (fuori scope Milestone 1)

- Integrazione immagini (featured / attachment) se recuperabili da sorgenti esterne o da estrazione da `raw_html`.
- Eventuali audit successivi su coerenza V5 ↔ articoli semantici / WordPress.
- Estensioni di contenuto o UI oltre la struttura semantica e navigazione attuale.
