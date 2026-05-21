# Sintesi tecnologica — Ombre e Luci

Panoramica del progetto: stack, scelte architetturali, flussi di lavoro e ruoli. Per il dettaglio si rimanda a `README.md`, `WORKING.md`, `INFRASTRUTTURA.md`, `CONTENUTI.md`, `CLAUDE.md`, `STATO.md`, `RUNBOOK.md`.

---

## Obiettivo

Sito **archivio della rivista** Ombre e Luci (migliaia di articoli), **bilingue IT/EN** (con progetto di estensione ES/FR), in migrazione da WordPress su Aruba verso uno stack moderno.

**Produzione attuale** del sito pubblico: ancora **WordPress su Aruba**. **Staging** (`ombreeluci-staging.pages.dev`, Cloudflare Pages) è il **cantiere** fino al cutover DNS documentato in `WORKING.md`.

---

## Stack tecnologico

| Livello | Scelta |
|--------|--------|
| Frontend | **Astro 4.15**, `output: 'hybrid'` (pagine statiche + SSR dove serve) |
| Runtime deploy | **Cloudflare Pages** + **`@astrojs/cloudflare`** (Workers) |
| CMS | **Directus 11** (Docker su VPS Hetzner), esposto come **`cms.ombreeluci.it`** via **Cloudflare Tunnel** |
| DB | **PostgreSQL 16** (anche pgvector) |
| Media | Upload Directus → sync su **Cloudflare R2**, serviti da URL pubblico CDN |
| Ricerca on-site | **Pagefind** (indice in build) |
| Ricerca avanzata | **Algolia** (vedi `CONTENUTI.md`) |
| Repo / CI | **GitHub**; workflow per build notturna, smoke post-deploy, aggiornamento snapshot articoli, sync runbook |

**Build:** lo script `prebuild` in `package.json` scarica dati statici e copia JSON pesanti in `public/` dove necessario, per non gonfiare il bundle SSR oltre i limiti operativi di Cloudflare (~500KB per route critiche).

---

## Scelte architetturali importanti

1. **Un solo layer dati:** tutti i fetch Directus passano da `src/lib/directus.ts` (nel codice si usa l’URL CMS pubblico, non l’IP del VPS).
2. **Resilienza build:** `articoli-build.ts` + `articoli_snapshot.json` come fallback se Directus non è disponibile in fase di build.
3. **i18n scalabile:** slug e label tematici da `src/data/categorie.json` e utility (`getCategoriaSlug`, `getCategoriaSlugIT`, `getCategoriaLabel`, ecc.) — niente mappe hardcoded nel TypeScript. **`categoria_menu` (e `categoria_menu_2`) in Directus restano sempre slug IT** — invariante tassonomia.
4. **UI condivisa tra lingue:** stesso componente con prop `lang` per IT/EN (e lingue future), non markup duplicato tra route (`CLAUDE.md`).
5. **Routing:** IT sotto `/it/` (eccezione: homepage `/`); EN sotto `/en/`; redirect dalle vecchie path root verso `/it/…` in `astro.config.mjs`.
6. **Contenuti statici editabili:** collection Directus `contenuti_statici` per testi di sito (chi siamo, footer, ecc.) con fallback inline nei componenti.
7. **Cloudflare Workers:** documentata la trappola del flag **`nodejs_compat`** che può corrompere le risposte SSR — da verificare prima di deploy su nuovi progetti Pages (`WORKING.md`).

---

## Infrastruttura (flusso dati)

```
Redazione → cms.ombreeluci.it (Tunnel) → Directus → PostgreSQL + upload
Media → R2 → CDN pubblico

Visitatori staging/prod (post cutover) → Cloudflare (Worker redirect / Pages)
  → Astro hybrid: prerender + SSR con fetch Directus e cache header dove definito
```

Dettaglio backup, env, account: `INFRASTRUTTURA.md`. Incident e restore: `RUNBOOK.md`.

---

## Modalità di lavoro (sviluppo)

- **`main` sempre deployabile:** lavoro su **branch dedicati** (`feat/`, `fix/`, `refactor/`), merge solo con gate verdi.
- **Prima di un task:** leggere **`STATO.md`**; aggiornare **`STATO.md`** a fine sessione / task, non durante il lavoro frammentato.
- **Gate tipici prima del merge:** `npm run build`, `npm run typecheck` (`tsc --noEmit`), controllo dimensione bundle worker per route SSR, test locale con `npx wrangler pages dev ./dist`, smoke su **staging**.
- **Modifiche a routing, Worker, DNS, middleware:** un cambio alla volta, catena documentata in `WORKING.md`; in caso di regressione, rollback rapido piuttosto che commit aggiuntivi su uno stato rotto.
- **Agenti (Cursor / Claude):** audit o diagnosi **senza** richiesta esplicita di implementazione → sola lettura, nessun commit/deploy (`.cursor/rules/audit-diagnosi-sola-lettura.mdc`).

---

## Chi fa cosà

| Ruolo | Responsabilità |
|--------|----------------|
| **Redazione** | Contenuti in **Directus**: articoli, autori, numeri, tag, classificazione (temi canonici), media, testi in `contenuti_statici`. Guida: `NORME_EDITORIALI_OEL.md`. |
| **Sviluppo / maintainer** | Codice Astro, componenti, routing, integrazione Directus, script import/export, redirect legacy, CI, i18n. Regole: `WORKING.md`, `CLAUDE.md`, `CONTENUTI.md`. |
| **Infrastruttura / ops** | VPS (Docker Directus + Postgres), tunnel Cloudflare, R2, backup su R2, Worker di redirect in produzione, progetto Pages. Riferimenti: `INFRASTRUTTURA.md`, `RUNBOOK.md`. |

In sintesi: **la redazione governa i dati nel CMS**; **il repository governa presentazione, performance, SEO tecnica e integrazioni**; **Cloudflare e VPS** governano hosting edge, sicurezza d’accesso al CMS e persistenza.

---

## Indice documentazione (navigazione rapida)

| Cosa cerchi | Documento |
|-------------|------------|
| Stato task e blockers | `STATO.md` |
| Come si lavora, gate, routing | `WORKING.md` |
| Architettura componenti e i18n | `CLAUDE.md` |
| Contenuti, lingue, ricerca, Algolia | `CONTENUTI.md` |
| Stack, deploy, backup, env | `INFRASTRUTTURA.md` |
| Incident, restore, monitoring | `RUNBOOK.md` |
| Bug UX/UI backlog | `bug_ux_ui.md` |
| Monitoring (dettaglio) | `docs/MONITORING.md` |

---

*Documento generato come riferimento unico; aggiornarlo se lo stack o i ruoli cambiano in modo strutturale.*
