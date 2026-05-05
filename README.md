# Ombre e Luci

Sito archivio della rivista cattolica Ombre e Luci (1983–oggi). 3527 articoli, multilingua IT/EN.

**Stack:** Astro hybrid SSR · Cloudflare Pages · Directus 11 · PostgreSQL 16 · Cloudflare R2

## Documentazione — dove trovare cosa

| Cosa cerchi | Documento |
|---|---|
| Stato attuale, task aperti, blockers | `STATO.md` |
| Come si lavora, regole operative, gate | `WORKING.md` |
| Regole architetturali, componenti, i18n | `CLAUDE.md` |
| Contenuti, lingue, traduzioni, Algolia | `CONTENUTI.md` |
| Stack, deploy, backup, env vars | `INFRASTRUTTURA.md` |
| Incident playbook, restore DB, monitoring | `RUNBOOK.md` |
| Bug visivi e UX da risolvere | `bug_ux_ui.md` |
| Sistema di monitoring (dettaglio) | `docs/MONITORING.md` |
| Regole editoriali (per la redazione) | `NORME_EDITORIALI_OEL.md` |

## File archiviati

`docs/archive/` contiene documentazione storica (sessioni precedenti, playbook obsoleti,
pipeline completate). Non leggere per lavoro corrente — solo per riferimento storico se necessario.

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
| Staging | https://ombreeluci-staging.pages.dev |
| CMS | https://cms.ombreeluci.it |
| Produzione (WP, da sostituire) | https://ombreeluci.it |
