## Indice documentale

Questo file riassume il contenuto corrente delle cartelle `REPORTS` e `_migration_archive` nella root del progetto.

---

## Cartella `REPORTS`

Contiene i report redazionali e tecnici utilizzati per analisi e confronti sui contenuti:

- **ANALISI_ARTICOLO_313_COMPLETA.md**: analisi approfondita del singolo articolo 313 (struttura, metadati, contenuto).
- **CONFRONTO_ARTICOLO_40648.md**: confronto tra versione WordPress e versione Astro dell’articolo 40648.
- **ESEMPI_PULIZIA_CONTENUTO.md**: esempi e linee guida di pulizia/normalizzazione dei contenuti migrati.
- **REPORT_CONSOLIDAMENTO.md**: report di consolidamento dei dati (articoli, numeri, metadati) dopo la migrazione.
- **REPORT_NUMERO_RIVISTA_FINALE.md**: sintesi finale sulla mappatura dei numeri di rivista.
- **riepilogo_temi_alias.md**: mappa dei temi principali e relativi alias utilizzati nel sito.
- **mappatura_temi_attuale.md**: report generato da script con la fotografia attuale dei temi/tag/categorie di `blog` e `numeri`.
- **indice_documentale.md** (questo file): descrizione sintetica dei contenuti di `REPORTS` e `_migration_archive`.

In sintesi, `REPORTS` raccoglie i documenti di analisi che servono per governare la migrazione, la tassonomia dei temi e la qualità redazionale.

---

## Cartella `_migration_archive`

È l’archivio storico della migrazione dal vecchio sito a quello attuale. Contiene:

- **Report e dati di migrazione**
  - `migration_report.json`, `migration_report_finale.json`: report JSON di riepilogo della migrazione.
  - `audit_migrazione_completa.csv`: audit dettagliato della migrazione (allineamento articoli, esiti, eventuali errori).
  - Vari file `.md` (es. `ANALISI_FILE_MIGRAZIONE_ASTRO.md`, `ASSET_DEFINITIVI_MIGRAZIONE.md`, `REPORT_CLUSTER0_E_IMMAGINI.md`, ecc.) con note operative, clustering, parametri e validazioni.

- **Export e sorgenti originali**
  - `ombreeluci.WordPress-export-post-.2026-01-31.xml`: export completo dei post da WordPress usato come fonte primaria.
  - PDF dei numeri della rivista (`oel-161.pdf`, `oel-163.pdf`, …) e altri asset originari.

- **Materiale di lavoro e strumenti**
  - Sotto-cartelle come `docs`, `inputs`, `outputs`, `reports`, `export numeri oel`, ecc. con script, input di modelli AI, configurazioni e risultati intermedi.
  - File di supporto (es. `tassonomia oel 2025.xlsx`, `PROMPT_*`, `README_MIGRAZIONE_ASTRO.md`, ecc.) usati per progettare e controllare la migrazione.

In sintesi, `_migration_archive` è il “vault” storico: tutto ciò che riguarda input, output e documentazione della migrazione rimane qui, separato dal codice applicativo e dai report redazionali correnti.

