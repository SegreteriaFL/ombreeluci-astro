# Stato i18n UI (IT / EN) — rotta e verifiche

**Tranche i18n shell + articolo + SEO breadcrumb:** **chiusa** (2026-04-10).

Obiettivo: pagine EN coerenti (chrome, badge categoria/forma, meta, JSON-LD) senza residui IT nei controlli automatici; build e `tsc` verdi.

---

## Completato (codice)

| Area | Cosa |
|------|------|
| Header / mega / language | `aria-label`, periodo ultimo numero (`localizeIssuePeriodLabel`) |
| Box redazione | `EditorialFeedback` + `lang` articolo |
| Articolo | Meta, ruoli, autore, navigazione fondo, script «Leggi anche», correlati |
| Categoria + forma | `getThemeLabel()` → megacluster + `localizeFormalType()`; `ArticleCard` allineata |
| BaseLayout | `pathname` → Header/Footer |
| **Breadcrumb JSON-LD** | Primo step = `nav_archive` localizzato + URL `/blog/en` o `/archivio` (allineato alla UI) |
| Keystatic | `format.data: 'yaml'` (API Keystatic; prima `frontmatter` invalido → `tsc` rosso) |
| Smoke | `scripts/smoke-i18n.mjs`; CI legge **`vars.SMOKE_BASE_URL`** poi **`secrets.SMOKE_BASE_URL`** |
| Tooling | Fix `generate_audit_migrazione.js`; `tsconfig` exclude `scripts` |

---

## Verifica locale

1. Dev sulla porta indicata da Astro (`Local http://localhost:…`).
2. ```powershell
   $env:SMOKE_BASE_URL = "http://localhost:PORT"
   npm run test:smoke
   # opzionale:
   $env:SMOKE_EN_ARTICLE = "/blog/…-en/"
   npm run test:smoke
   ```
3. `npm run build`
4. `npx tsc --noEmit`

---

## CI GitHub

- Impostare **Repository variable** `SMOKE_BASE_URL` = URL deploy (staging/prod), **oppure** un secret con lo stesso nome.
- Se nessuno dei due è valorizzato, il job termina con **notice** (non fallisce), così le fork/PR senza deploy restano verdi.

---

## Fuori scope

- **Contenuto** degli articoli (titolo/corpo): lingua del pezzo, non della shell.
- **Directus 401** in locale: token / `.dev.vars`.

---

## Riferimenti

- Architettura i18n: `docs/I18N_MASTER_PLAN.md` (se presente), `TRADUZIONI.md`, `PROGRESS.md`.
- Snapshot storico progetto: `STATO_PROGETTO.md` (legacy).
