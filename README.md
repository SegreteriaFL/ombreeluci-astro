# Ombre e Luci

Sito archivio della rivista cattolica Ombre e Luci (1983–oggi). 3527 articoli, multilingua IT/EN.

**Stato:** 🟢 Live su `https://ombreeluci.it` dal 2026-05-21

**Stack:** Astro hybrid SSR · Cloudflare Pages · Directus 11 · PostgreSQL 16 · Cloudflare R2

## Documentazione — dove trovare cosa

| Cosa cerchi | Documento |
|---|---|
| Stato attuale, log di sessione, bug tracker, backlog, log SEO/monitoring | `STATO.md` |
| Come si lavora, regole operative, gate | `WORKING.md` |
| Regole architetturali, componenti, i18n | `CLAUDE.md` |
| Contenuti, lingue, traduzioni, Algolia | `CONTENUTI.md` |
| Architettura, stack, backup, restore, monitoring, incident playbook | `RUNBOOK.md` |
| Regole editoriali (per la redazione) | `NORME_EDITORIALI_OEL.md` |

**Regola anti-frammentazione (2026-08-10):** prima di creare un nuovo file `.md`, controllare se l'argomento rientra già in uno di questi. Un nuovo argomento *ricorrente* (log, riferimento operativo, checklist che si ripete) va aggiunto come sezione in `STATO.md` o `RUNBOOK.md`, non in un file nuovo — è già successo due volte che la documentazione si frammentasse in file paralleli mai più riunificati (vedi `docs/archive/PROMPT_CLAUDECODE_legacy.md` per la consolidazione precedente). Un file nuovo si giustifica solo per una decisione/analisi one-off e autocontenuta (es. `DECISIONE-STAGING.md`) — e va archiviato in `docs/archive/` non appena la decisione è chiusa e implementata.

## File archiviati

`docs/archive/` contiene documentazione storica (sessioni precedenti, checklist cutover completate,
playbook obsoleti, pipeline completate, decisioni chiuse). Non leggere per lavoro corrente — solo per riferimento storico.

## Comandi principali

| Comando | Azione |
|---|---|
| `npm run dev` | Dev server locale (non SSR — usa wrangler per SSR) |
| `npm run build` | Build produzione |
| `npx wrangler pages dev ./dist` | Simula CF Pages edge runtime in locale |
| `npm run test:smoke` | Smoke test i18n (richiede `SMOKE_BASE_URL`) |

## URL

| Ambiente | URL |
|---|---|
| Produzione | https://ombreeluci.it |
| Staging | https://ombreeluci-staging.pages.dev |
| CMS | https://cms.ombreeluci.it |
