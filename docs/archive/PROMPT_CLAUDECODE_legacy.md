# Task: riorganizzazione documentazione progetto

## Contesto

Stai lavorando sul repo `SegreteriaFL/ombreeluci-astro`. Questo è un task di pura gestione file e documentazione — nessuna modifica a codice applicativo, nessun commit su `main` senza conferma esplicita.

Leggi prima `CLAUDE.md` per le regole di progetto.

---

## Step 1 — Inventario completo dei file .md nel repo

Prima di toccare nulla, esegui:

```bash
find . -name "*.md" -o -name "*.mdc" | grep -v node_modules | grep -v .git | sort
```

Riporta l'output completo. Questo serve a non perdere nulla.

---

## Step 2 — Crea la struttura di archivio

```bash
mkdir -p docs/archive
```

---

## Step 3 — Archivia i documenti obsoleti

### File certi da archiviare (sostituiti dai nuovi STATO/WORKING/CONTENUTI)

```bash
git mv PROGRESS.md docs/archive/PROGRESS_HISTORY.md
git mv STATO_PROGETTO.md docs/archive/STATO_PROGETTO_legacy.md
git mv ARCH-04-PLAYBOOK.md docs/archive/ARCH-04-PLAYBOOK_legacy.md
```

### File in docs/ da archiviare (se esistono)

```bash
# Controlla prima
ls docs/*.md 2>/dev/null

# Poi archivia quelli trovati tra questi:
git mv docs/I18N_MASTER_PLAN.md docs/archive/I18N_MASTER_PLAN_legacy.md 2>/dev/null
git mv docs/I18N_STATUS.md docs/archive/I18N_STATUS_legacy.md 2>/dev/null
git mv docs/TRADUZIONI.md docs/archive/TRADUZIONI_legacy.md 2>/dev/null
git mv docs/ARCHITETTURA_DATI.md docs/archive/ARCHITETTURA_DATI_legacy.md 2>/dev/null
git mv docs/LOG_MIGRAZIONE.md docs/archive/LOG_MIGRAZIONE_legacy.md 2>/dev/null
git mv docs/AUDIT_TECNICO_INDICIZZAZIONE.md docs/archive/AUDIT_TECNICO_INDICIZZAZIONE_legacy.md 2>/dev/null
git mv docs/HOME_REDESIGN.md docs/archive/HOME_REDESIGN_legacy.md 2>/dev/null
git mv docs/REPORT_FONTI_IMMAGINI.md docs/archive/REPORT_FONTI_IMMAGINI_legacy.md 2>/dev/null
git mv docs/REPORT_PULIZIE_FINALI_E_DEPLOY.md docs/archive/REPORT_PULIZIE_FINALI_E_DEPLOY_legacy.md 2>/dev/null
git mv docs/REPORT_RIMAPPATURA_NUMERI.md docs/archive/REPORT_RIMAPPATURA_NUMERI_legacy.md 2>/dev/null
git mv docs/PIANO_ALLINEAMENTO_MEGACLUSTER_S8.md docs/archive/PIANO_ALLINEAMENTO_MEGACLUSTER_S8_legacy.md 2>/dev/null
git mv docs/CMS_MIGRATION_SPEC.md docs/archive/CMS_MIGRATION_SPEC_legacy.md 2>/dev/null
git mv docs/CATEGORIZZAZIONE_REDAZIONE_3_26.md docs/archive/CATEGORIZZAZIONE_REDAZIONE_3_26_legacy.md 2>/dev/null
```

### Qualsiasi altro .md trovato nell'inventario Step 1 che non sia in questa lista

Valuta caso per caso: se descrive il sistema pre-Directus (prima del 2026-03-22) o una fase già completata → `git mv` in `docs/archive/`. Se non sei sicuro, segnalalo all'utente prima di spostarlo.

### File da NON toccare (restano dove sono)

```
CLAUDE.md                  ← regole agente, viene esteso nello Step 5
INFRASTRUTTURA.md          ← attuale, non sostituito
RUNBOOK.md                 ← attuale, non sostituito
NORME_EDITORIALI_OEL.md   ← attuale, per la redazione
README.md                  ← entry point repo
STATO.md                   ← nuovo, appena aggiunto
WORKING.md                 ← nuovo, appena aggiunto
CONTENUTI.md               ← nuovo, appena aggiunto
.cursor/rules/*.mdc        ← regole Cursor, non toccare
```

---

## Step 4 — Aggiungi i tre nuovi documenti nella root

Copia nella root del repo questi tre file che ti vengono forniti come allegati (o che trovi nella stessa cartella di questo prompt):

- `STATO.md` → root del repo
- `WORKING.md` → root del repo
- `CONTENUTI.md` → root del repo

```bash
git add STATO.md WORKING.md CONTENUTI.md
```

---

## Step 5 — Aggiorna CLAUDE.md

Apri `CLAUDE.md` e aggiungi in fondo le seguenti sezioni. Non modificare nulla di quello che c'è già — solo aggiungere.

```markdown
---
## Documenti di progetto — leggere all'inizio di ogni sessione

| Documento | Cosa contiene |
|-----------|---------------|
| `STATO.md` | Stato verificato, blockers pre-lancio, backlog ordinato, prossima azione |
| `WORKING.md` | Regole operative complete: routing, CSS, SSR, bundle, gate pre-merge |
| `CONTENUTI.md` | Architettura i18n, ricerca, autori, traduzioni AI, tag, pagine verticali |
| `INFRASTRUTTURA.md` | Stack, deploy, backup, env vars, versioni |
| `RUNBOOK.md` | Incident playbook operativo (sul server: `/opt/oel-cms/RUNBOOK.md`) |
| `NORME_EDITORIALI_OEL.md` | Regole editoriali (per la redazione) |

---
## CSS in componenti condivisi — regola critica

`is:global` in un componente riusabile è pericoloso: i suoi stili fuggono in tutte le pagine che includono il componente, causando regressioni visive difficili da tracciare.

**Regola:** qualsiasi stile che deve applicarsi a markup generato dinamicamente (es. HTML da Directus nel corpo articolo) va scritto con selettore padre prefissato.

Corretto:
```css
/* in ArticlePageLayout.astro o in global.css con prefisso */
.article-body h2 { ... }
.article-body p { ... }
.article-body img { ... }
```

Sbagliato:
```css
/* is:global senza prefisso in componente condiviso */
<style is:global>
h2 { ... }        /* fugge ovunque */
p { ... }         /* fugge ovunque */
</style>
```

Eccezione ammessa: `is:global` in componente condiviso **solo se** ogni selettore è prefissato con una classe wrapper univoca del componente stesso (es. `.article-page-layout h2`).

---
## Routing e infrastruttura — regole permanenti da incidente 2026-04

**Incidente:** rimozione route `/*` dal CF Worker senza mappare la catena DNS → `ombreeluci.it` mostrava WordPress per ore.

**Regola:** prima di toccare Worker, middleware, adapter CF, DNS o redirect, disegna la catena completa:
`DNS apex → Worker route attiva → fetch verso Pages/Aruba`
Se non sai rispondere a ogni step: non committare.

**Catena attuale (non modificare senza documentare in WORKING.md):**
- `ombreeluci.it/*` → CF Worker `ombreeluci-redirects` → proxy WP Aruba | redirect legacy | forwardToPages
- `*.pages.dev` → CF Pages direttamente → `src/middleware.ts` gestisce redirect legacy

**`nodejs_compat` vietato:** questo flag corrompe la serializzazione della Response in Astro hybrid SSR (body diventa `[object Object]`). Non attivarlo mai su progetti Pages con output hybrid.

---
## Bundle size SSR — regola permanente da incidente 2026-04

**Incidente:** import statico di `correlati.json` (749KB) in pagina SSR → bundle 908KB → CF Pages crash silenzioso → `[object Object]` come body.

**Regola:** nessun JSON > 50KB va importato staticamente in pagine SSR.

Pattern corretto per JSON pesanti in SSR:
```typescript
const res = await fetch(`${Astro.url.origin}/correlati.json`);
const data = res.ok ? await res.json() : {};
```

Il file deve stare in `public/` — il `prebuild` in `package.json` lo copia da `src/data/`.

Dopo ogni build che tocca pagine SSR, verificare:
```bash
find dist/_worker.js -name "*.mjs" | xargs ls -lh | sort -k5 -rh | head -5
# pages/blog/_---slug_.astro.mjs deve stare sotto 500KB
```

---
## Slug convention articoli EN — non cambiare mai senza script di migrazione

Directus: slug con suffisso `-en` (es. `il-progetto-dandelion-en`).
URL pubblico: `/en/il-progetto-dandelion/` (suffisso rimosso).
La route `src/pages/en/[slug].astro` ricostruisce lo slug Directus aggiungendo `-en`.

Cambiare questa convenzione richiede uno script di migrazione su tutti i 131 articoli EN esistenti e aggiornamento della route. Non farlo mai come side effect di un altro task.

---
## Nightly build — CI/CD

Usare sempre il Deploy Hook (`CF_DEPLOY_HOOK` secret) per triggare rebuild CF Pages da GitHub Actions. Non usare l'endpoint API REST `POST /pages/projects/{name}/deployments` — non funziona per progetti Git-connected.
```

---

## Step 6 — Commit

```bash
git add docs/archive/ STATO.md WORKING.md CONTENUTI.md CLAUDE.md
git commit -m "docs: riorganizzazione documentazione — STATO/WORKING/CONTENUTI + archivio"
```

**Non pushare** — aspetta conferma esplicita prima del push.

---

## Step 7 — Verifica finale prima di segnalare completato

```bash
# Questi file devono esistere nella root
ls STATO.md WORKING.md CONTENUTI.md CLAUDE.md INFRASTRUTTURA.md RUNBOOK.md NORME_EDITORIALI_OEL.md

# Questi devono essere in docs/archive/
ls docs/archive/

# CLAUDE.md deve contenere la nuova sezione
grep -c "Bundle size SSR" CLAUDE.md  # deve restituire 1
grep -c "is:global" CLAUDE.md        # deve restituire 1
```

Riporta l'output di questi check prima di considerare il task completato.
