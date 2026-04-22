# I18N Master Plan — Ombre e Luci (IT/EN/ES+)

> **Stato:** Documento ufficiale (authoritative) per internazionalizzazione prodotto+contenuti  
> **Ultima revisione:** 2026-04-09  
> **Ambito:** architettura applicativa, CMS, UX/UI, SEO, operations, QA, rollout  
> **Documenti correlati:** `PROGRESS.md`, `TRADUZIONI.md`, `ARCH-04-PLAYBOOK.md`, `INFRASTRUTTURA.md`, `RUNBOOK.md`

---

## Document Precedence

Quando esistono discrepanze, vale questa gerarchia:

1. `docs/I18N_MASTER_PLAN.md` -> decisioni architetturali i18n cross-progetto.
2. `PROGRESS.md` -> stato operativo, priorità e avanzamento task.
3. `TRADUZIONI.md` -> pipeline linguistica/editoriale AI e quality gates traduzione.
4. `ARCH-04-PLAYBOOK.md` / `RUNBOOK.md` / `INFRASTRUTTURA.md` -> runbook specialistici per ambiti specifici.

`STATO_PROGETTO.md` è documento storico e non è fonte autoritativa per decisioni correnti.

---

## 1) Obiettivo

Costruire una piattaforma multilingua scalabile e professionale:

- IT come lingua base
- EN come prima lingua target
- ES e altre lingue come estensione naturale

senza regressioni su:

- publishing chain (Directus -> Cloudflare)
- UX shell (header/footer/menu/CTA/commenti)
- SEO (canonical, hreflang, redirect, sitemap)
- qualità editoriale delle traduzioni AI.

---

## 2) Stato attuale (sintesi verificata)

### Punti solidi

- Pipeline contenuti operativa con Directus + revalidate cache.
- Frontend già predisposto a livello base (`lang`, `articolo_traduzione`, hreflang).
- Script traduzione/QA presenti in `scripts/traduzione/`.

### Problemi attuali bloccanti

1. Shell EN incoerente (parti UI restano in IT su pagine EN).
2. Language switcher non deterministico su una parte degli articoli EN.
3. Correlati EN spesso assenti.
4. Routing lingua non ancora strutturato su prefisso locale (`/en/...`).
5. Documentazione di stato ancora parzialmente incoerente tra file storici.

---

## 3) Principi architetturali (non negoziabili)

1. **Single source of truth per locale**  
   Il locale deve essere determinato una volta per request e propagato ovunque.

2. **Routing lingua esplicito**  
   Target: `/en/...`, `/es/...` (IT default o `/it/...` se richiesto in futuro).

3. **Compatibilità progressiva, no big-bang**  
   Migrazione in fasi con fallback e rollback.

4. **Redirect-first SEO**  
   Nessun URL indicizzato viene rotto: sempre 301 verso canonical nuovo.

5. **Traduzione massiva solo su base stabile**  
   Prima si stabilizza i18n tecnico/SEO, poi batch AI completo.

---

## 4) Target state (10/10)

### 4.1 Applicazione

- Locale consistente in tutte le viste.
- Header/footer/menu/search/commenti/CTA localizzati per lingua.
- Switcher lingua corretto:
  - se counterpart esiste: deep-link equivalente
  - se counterpart manca: fallback dichiarato e UX esplicita.

### 4.2 CMS / dati

- Modello Directus multilingua scalabile (translations model) adottato in modo graduale.
- Compatibilità temporanea con schema corrente (`lang` + `articolo_traduzione`) finché necessario.
- Categorie/sezioni/tag/pagine verticali gestite con strategia locale-aware, non solo articoli.
- **Pagine archivio numeri (uscite rivista):** intenzione di tradurre/localizzare anche queste
  viste **in una fase successiva** al completamento del corpus articoli + gate pipeline; non sono
  nel perimetro del batch articoli iniziale. Dettaglio: `TRADUZIONI.md` §17.

### 4.3 SEO

- Canonical e hreflang reciproci coerenti.
- Sitemap per lingua.
- Redirect matrix formalizzata e testata (legacy IT, slug EN transitori, nuove route locali).

### 4.4 Operations

- Publishing chain documentata in modo univoco.
- Monitoring e alert minimi attivi.
- Ownership chiara per deploy, purge, rollback, secret rotation.

---

## 5) Roadmap progressiva

## Fase 0 — Normalizzazione categorie + allineamento operativo (bloccante)

> **Stato: 🟡 IN CORSO — 2026-04-08**
> Branch: `feat/i18n-master-plan`

### Obiettivo

Rendere `categoria_menu` lingua-agnostica prima di qualsiasi backfill EN.
Il valore in Directus diventa slug canonico (es. `"spiritualita"`); la label
localizzata viene risolta a build-time da `src/data/categorie.json`.

### Task F0

| ID | File | Stato | Note |
|----|------|-------|------|
| F0-1 | `src/data/categorie.json` | ✅ Done | 14 categorie + "Ombre e Luci"; slug→{it,en} |
| F0-2 | `scripts/db_analysis/normalize_categoria_menu.py` | ✅ Done | Script idempotente, dry-run+CSV, flag "Da categorizzare" |
| F0-3 | `src/config/taxonomy.js` | ✅ Done | `getCategoriaLabel(slug,lang)` + `getMegaclusterForArticle` lang-aware |
| F0-4 | Eseguire script su Directus | ⏳ Pending | Eseguire quando Directus è raggiungibile: `python normalize_categoria_menu.py --dry-run` → review CSV → live |
| F0-5 | Assegnazione manuale V-02 | ⏳ Pending | 21 articoli "Da categorizzare" — redazione assegna slug in Directus dopo F0-4 |

### Come eseguire F0-4 (quando Directus è su)

```bash
cd scripts/db_analysis
export DIRECTUS_TOKEN=<token>

# 1. Dry-run: verifica mapping e ottieni CSV anteprima
python normalize_categoria_menu.py --dry-run

# 2. Revisiona CSV in logs/normalize_categoria_menu_*_dryrun.csv
#    Verifica: zero righe "unknown"; righe "needs_manual_assignment" = i 21 Da categorizzare

# 3. Se tutto OK → live
python normalize_categoria_menu.py

# 4. Verifica: build frontend verde
npm run build
```

### Gate F0 — pass/fail misurabili

| Criterio | Come verificare | Pass |
|----------|----------------|------|
| Directus: zero stringhe IT in `categoria_menu` | CSV `action` = solo `skip_null`, `skip_already_slug`, `needs_manual_assignment`, `patch_ok` | Nessuna riga `unknown` |
| Directus: soli slug riconosciuti da `categorie.json` | Audit query Directus: `filter[categoria_menu][_nin]=<slugs>` | Zero risultati anomali |
| Frontend IT: badge mostra label italiana | Build + aprire 3 articoli IT con categoria | Label corretta visibile |
| Frontend EN: badge mostra label inglese | Aprire 3 articoli EN con categoria | Label EN visibile (es. "Spirituality") |
| `npm run build` verde | Build locale | Zero errori TS/build |
| 21 "Da categorizzare" documentati | CSV `action=needs_manual_assignment` | Count = atteso |

### V-02 — articoli "Da categorizzare"

Articoli con `categoria_menu = "Da categorizzare"` (o slug `"da-categorizzare"` dopo migrazione):
lo script li logga nel CSV come `needs_manual_assignment` senza PATCH.
La redazione li assegna manualmente in Directus dopo F0-4.
Riferimento PROGRESS.md → task V-02.

---

## Fase 1 — Stabilizzazione i18n shell (senza migrare schema)

- Unificare rilevazione locale.
- Propagare locale a BaseLayout + componenti shell.
- Correggere switcher e archival alert duplicati.
- Correlati EN: fallback robusto transitorio.

**Gate F1:**

- Test E2E su pagine EN: shell 100% coerente.
- Switcher pass/fail su casi con e senza counterpart.
- Nessuna regressione IT.

## Fase 2 — Routing lingua professionale

> **Stato: ⏸ Bloccata — prerequisito: F1 completata**

- Introdurre route `/en/...` (e base per `/es/...`).
- Redirect 301 da URL EN transitori (`/blog/*-en/` → `/en/*/`).
- Canonical per lingua + hreflang reciproci.
- Sitemap per lingua (`/sitemap-en.xml`).
- Worker: gestione prefisso `/en/` se necessario.

**Gate F2 — criteri misurabili:**

| Criterio | Tool | Soglia pass |
|----------|------|-------------|
| Zero redirect loop | Screaming Frog (crawl staging) | 0 loop |
| Catena redirect ≤ 1 hop | Screaming Frog | 0 catene > 1 hop |
| hreflang reciproco IT↔EN | Screaming Frog → tab Hreflang | 0 errori "missing return tag" |
| Canonical per lingua coerente | Screaming Frog → tab Canonical | 0 canonical che puntano a lingua sbagliata |
| Sitemap EN presente e valida | `curl https://staging-url/sitemap-en.xml` | HTTP 200, URL EN nel file |
| Nessun URL EN senza prefisso `/en/` indicizzabile | Screaming Frog → filtra URL */blog/*-en/ | 0 risultati (tutti 301) |
| `npm run build` verde | Build locale | Zero errori |

**Owner crawl SEO:** SegreteriaFL (tool: Screaming Frog SEO Spider, free tier sufficiente per staging)
**Quando:** dopo merge F1 su main, prima del batch traduzioni EN.

## Fase 3 — Migrazione modello dati Directus multilingua

- Introdurre schema translations con compat layer.
- Migrare query frontend progressivamente.
- Estendere localizzazione a categorie/sezioni/tag/pagine verticali.

**Gate F3:**

- Integrità dati locale per entità core.
- Mapping counterpart affidabile.
- Nessuna regressione publishing/revalidate.

## Fase 4 — Traduzione AI produzione (EN -> ES)

- Pilot EN (50) + QA + review redazionale.
- Batch completo EN in draft + publish progressivo.
- ES solo dopo chiusura KPI EN.

**Gate F4:**

- KPI tecnici e editoriali superati.
- SEO post-publish verificata.

### Contenuti: numeri di rivista (dopo il corpus articoli)

Ordine esplicito: il rollout traduzione **AI e editoriale** prioritizza gli **articoli**
(`articoli`). Le **pagine dei numeri** (archivio uscite cartacea) seguono in **fase II**, con
scope, gate e eventuale modello dati definiti quando si apre il lavoro; vedi `TRADUZIONI.md` §17.

---

## 6) Strategia traduzioni AI

- Base corpus: Haiku (costo/velocità).
- Upgrade selettivo: Sonnet su articoli complessi/critici.
- No prompt eccessivamente rigidi: fedeltà semantica + inglese idiomatico.
- Review redazionale campionaria obbligatoria prima di publish massivo.

Nota: dettagli pipeline e quality gates restano in `TRADUZIONI.md`; questo file governa il quadro architetturale globale.

---

## 7) Test strategy (scientifica)

### Tecnico

- Unit: locale resolution, switcher mapping.
- Integration: layout shell locale-aware.
- E2E matrix: articolo/categoria/sezione/home EN, navigazione logo/menu, commenti, fallback.

### SEO

- hreflang reciproco.
- canonical per lingua.
- redirect audit legacy + nuove route.
- sitemap completezza locale.

### Editoriale

- Campione manuale con rubriche:
  - fedeltà
  - idiomaticità
  - terminologia
  - chiarezza
  - drift semantico critico

---

## 8) Rischi e mitigazioni

- **Worker chokepoint** -> smoke test obbligatori per ogni change routing.
- **Token drift multi-consumer** -> runbook di rotazione con checklist unica.
- **Document drift** -> questo file come fonte primaria i18n cross-team.
- **SEO regressions** -> rollout a step con crawl e rollback immediato.

---

## 9) Decisione: ricerca EN (Pagefind)

> **Decisione esplicita — 2026-04-08**

Pagefind indicizza solo le pagine HTML statiche emesse a build-time.
Con `/blog/[...slug]` in SSR (hybrid), gli articoli non producono file HTML
statici → Pagefind non li indicizza → ricerca sul sito EN sarà vuota dopo il batch.

**Scelta accettata per la fase di lancio EN:**
La ricerca EN resterà parziale (solo pagine statiche: home, categorie, archivio)
fino a una decisione architetturale dedicata.

**Opzioni per il futuro (post-lancio EN stabile):**
- Prerender notturno subset EN (build più lunga, indice completo)
- Algolia free tier (external search, richiede sync pipeline)
- Pagefind su snapshot statico generato separatamente

**Milestone:** decidere e implementare entro 60 giorni dal lancio EN.
**Owner:** SegreteriaFL.

---

## 10) Definition of Done (programma i18n)

Il programma si considera chiuso quando:

1. UX multilingua coerente su tutte le pagine core.
2. Routing lingua stabile e indicizzabile.
3. Modello dati scalabile per n lingue.
4. Redirect legacy e nuovi URL completamente governati.
5. Pipeline traduzione AI operativa con QA misurabile.
6. Documentazione allineata e operativa (no istruzioni contraddittorie).
7. Ricerca EN operativa (Pagefind o alternativa — milestone post-lancio).

