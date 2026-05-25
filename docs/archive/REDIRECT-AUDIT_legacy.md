# Redirect Audit — ombreeluci.it pre-cutover

**Data audit:** 2026-05-19
**Source URL:** 3.500 URL da sitemap WP (post × 4, page, project, category)
**Simulazione locale:** `scripts/verify-redirects-local.mjs` (no HTTP request)

---

## Layer redirect esistenti

### Layer 1 — CF Worker (`cf-worker/redirect-worker.js`)

| Pattern | Azione |
|---|---|
| `/wp-admin/*`, `/wp-content/*`, `/wp-includes/*`, `/wp-json/*`, `/feed`, `/wp-login.php`, `/wp-cron.php`, `/xmlrpc.php` | Proxy verso Aruba WordPress |
| Lookup table 1001 voci (stesso contenuto di `redirects-legacy.json`) | 301 → `https://ombreeluci.it{target}` |
| `/YYYY/MM/DD/{slug}/` | 301 → `https://ombreeluci.it/it/{slug}` |
| Tutto il resto | `forwardToPages()` → Astro |

**Nota:** il Worker usa `Response.redirect('https://ombreeluci.it' + target)` — gli URL nel JSON sono path relativi come `/it/{slug}/`.

### Layer 2 — Middleware Astro (`src/middleware.ts`)

| Pattern / Regex | Target |
|---|---|
| Exact match `ARCHIVIO_REDIRECTS` (4 voci) | `ins--2 → ins-31`, `ins--3 → ins-32`, `catechesi → spiritualita` |
| `/blog/{slug}-en/` | `/en/{slug}/` |
| `/diario-di-{name}/` | `/it/diari/diario-di-{name}/` |
| `/blog/{slug}/` | `/it/{slug}/` |
| Exact match `redirects-legacy.json` (1001 voci) | `https://ombreeluci.it{target}` |
| `/YYYY/MM/DD/{slug}/` | `https://ombreeluci.it/it/{slug}` |
| `/YYYY/MM/{slug}/` | `https://ombreeluci.it/it/{slug}/` |

**⚠️ GAP CRITICO:** nessuna regex per `/YYYY/{slug}/` — formato usato dal 84% degli URL WP.

### Layer 3 — Redirect statici (`astro.config.mjs`)

| Sorgente | Target |
|---|---|
| `/dona`, `/contribuisci` | `/it/sostienici` |
| `/about` | `/it/chi-siamo` |
| `/archivio`, `/autori`, `/categoria`, `/cerca`, `/chi-siamo`, `/diari`, `/newsletter`, `/rubriche`, `/sostienici`, `/tag` | `/it/{sezione}` |
| `/chi-siamo/la-rivista`, `/chi-siamo/la-redazione`, ecc. | `/it/chi-siamo` |
| `/blog/en` | `/en/` |
| `/studiosi-educatori-e-attivisti-ombre-e-luci` | `/it/studiosi-educatori-attivisti/` |

### Layer 4 — `src/data/redirects-legacy.json`

**1.001 voci** di slug WP → slug Astro (format: `"/slug-wp/": "/it/slug-nuovo/"`).
Gestiscono rename, typo, duplicati e merge articoli avvenuti durante l'import.
Verificati come identici alla lookup table del CF Worker.

---

## Risultati simulazione — confronto prima/dopo

| Categoria | Prima dei fix | Dopo fix 1-7 | Stato |
|---|---|---|---|
| ✅ OK — redirect coperto | 16 (0.5%) | **3.493 (99.8%)** | ✅ |
| ⚠️ GAP_COVERED — fix applicati | 3.134 (89.6%) | 0 | ✅ |
| 🔴 MISSING — nessun redirect | 349 (10.0%) | **0 (0.0%)** | ✅ |
| 🟠 TO_HOMEPAGE (intenzionali) | 0 | 6 (0.2%) | ✅ |

**Commits:** `b209c37e` (Fix 1-6), `fd20fed8` (Fix 7), `5d7dc626` (correzioni destinazioni)
**Voci redirects-legacy.json:** 1.001 → 1.097 (+96)

---

## Gap identificati — dettaglio e priorità

### GAP-1 (CRITICO): `/YYYY/{slug}/` → non coperto — 2.928 URL

Il sito WP usa il formato permalink **solo con anno** (`/1983/dialogo-aperto-n-1/`),
non il formato standard WordPress con data completa (`/YYYY/MM/DD/slug/`).
La middleware ha regex per `/YYYY/MM/DD/` e `/YYYY/MM/` ma NON per `/YYYY/`.

**Fix:** aggiungere in `src/middleware.ts`:
```typescript
const YEAR_SLUG_RE = /^\/(\d{4})\/([^/]+?)\/?$/;
// ...
const yearSlugMatch = path.match(YEAR_SLUG_RE);
if (yearSlugMatch) return redirect('/it/' + yearSlugMatch[2] + '/', 301);
```
Questo fix da solo copre 2.928 URL (84% del totale).

### GAP-2 (ALTO): `/en/YYYY/{slug}/` → non coperto — 54+ URL

WP pubblicava articoli EN con percorso `/en/YYYY/{slug}/`.
Nessun layer copre questo pattern.

**Fix:** aggiungere in `src/middleware.ts`:
```typescript
const EN_YEAR_SLUG_RE = /^\/en\/(\d{4})\/([^/]+?)\/?$/;
// ...
const enYearMatch = path.match(EN_YEAR_SLUG_RE);
if (enYearMatch) return redirect('/en/' + enYearMatch[2] + '/', 301);
```

### GAP-3 (ALTO): `/project/numero-N-{titolo}/` → archivio — 129 URL

WP usava il custom post type "project" per i numeri rivista.
`/project/numero-41-10-anni-di-ombre-e-luci/` → `/it/archivio/oel-41/`

**Fix:** aggiungere regex in `src/middleware.ts`:
```typescript
const PROJECT_NUMERO_RE = /^\/project\/numero-(\d+)-/;
// ...
const projectNumeroMatch = path.match(PROJECT_NUMERO_RE);
if (projectNumeroMatch) return redirect('/it/archivio/oel-' + projectNumeroMatch[1] + '/', 301);
```

### GAP-4 (MEDIO): `/project/` e `/project/{altri}/` → 77 URL

- `/project/` → `/it/archivio/`
- `/project/{slug-senza-numero}/` → `/it/archivio/`

**Fix:** aggiungere in `astro.config.mjs` redirects o middleware:
```
/project → /it/archivio
```

### GAP-5 (MEDIO): `/n-N/` → numeri rivista — ~150 URL

WP usava `/n-173/` come shortlink per numero 173.
Pattern: `/n-(\d+)/` → `/it/archivio/oel-{N}/`

**Fix:** regex in middleware:
```typescript
const NUMERO_SHORT_RE = /^\/n-(\d+)\/?$/;
// ...
const nMatch = path.match(NUMERO_SHORT_RE);
if (nMatch) return redirect('/it/archivio/oel-' + nMatch[1] + '/', 301);
```

### GAP-6 (BASSO): `/insieme/insieme-n-N/` → ~30 URL

Il bollettino "Insieme" (1977-1981) aveva permalink `/insieme/insieme-n-1/` ecc.
Equivalente Astro: `/it/archivio/ins-N/`.

**Fix:** regex in middleware:
```typescript
const INSIEME_RE = /^\/insieme\/insieme-n-(\d+)\/?$/;
// ...
const insiemeMatch = path.match(INSIEME_RE);
if (insiemeMatch) return redirect('/it/archivio/ins-' + insiemeMatch[1] + '/', 301);
```

### GAP-7 (BASSO): pagine WP singole — ~30 URL

URL che non seguono pattern strutturali — da aggiungere come voci esatte.

| URL WP | Target suggerito |
|---|---|
| `/la-rivista/` | `/it/archivio/` |
| `/argomenti/` | `/it/archivio/` |
| `/contatti/` | `/it/chi-siamo#contatti` |
| `/mariangela-bertolini/` | `/it/focus/mariangela-bertolini/` |
| `/i-diari-di-ombre-e-luci/` | `/it/rubriche/diari/` |
| `/jeanvanier/` | `/it/autori/jean-vanier/` (se esiste) |
| `/jean-vanier/` | `/it/autori/jean-vanier/` |
| `/fede-e-luce/` | `/it/categoria/fede-e-luce/` |
| `/famiglia/` | `/it/categoria/famiglia/` |
| `/spiritualita/` | `/it/categoria/spiritualita/` |
| `/esperienze/` | `/it/categoria/progetti/` |
| `/catechesi/` | `/it/categoria/spiritualita/` |
| `/catechesi-e-disabilita/` | `/it/categoria/spiritualita/` |
| `/recensioni/` | `/it/rubriche/recensioni/` |
| `/interviste/` | `/it/rubriche/interviste/` |
| `/editoriali/` | `/it/rubriche/editoriali/` |
| `/testimonianze/` | `/it/rubriche/testimonianze/` |
| `/storia-ombre-e-luci/` | `/it/chi-siamo/` |
| `/podcast/` | `/it/archivio/` |
| `/video/` | `/it/archivio/` |
| `/news/` | `/` |
| `/vacanze/` | `/it/categoria/tempo-libero/` |
| `/tempo-libero/` | `/it/categoria/tempo-libero/` |
| `/scuola/` | `/it/categoria/scuola/` |
| `/lavoro/` | `/it/categoria/lavoro/` |
| `/sport/` | `/it/categoria/sport/` |
| `/medicina/` | `/it/categoria/salute/` |
| `/en/about/` | `/en/about/` |
| `/en/testimonies/` | `/en/sections/testimonies/` |
| `/en/reviews/` | `/en/sections/reviews/` |
| `/en/editorials/` | `/en/sections/editorials/` |
| `/en/interviews/` | `/en/sections/interviews/` |
| `/en/experiences/` | `/en/sections/testimonies/` |
| `/en/read-our-stories-in-english/` | `/en/` |
| `/en/home-english/` | `/en/` |
| `/en/project/` | `/en/archive/` |
| `/en/reflections/` | `/en/sections/testimonies/` |

---

## Copertura per pattern WP specificati nel task — stato finale ✅

| Pattern WP | Coperto? | Layer |
|---|---|---|
| `/2023/{slug}/` | ✅ | `YEAR_SLUG_RE` (Fix-1) |
| `/2023/04/{slug}/` | ✅ | `YEAR_MONTH_SLUG_RE` nel middleware |
| `/2023/04/15/{slug}/` | ✅ | `DATE_PATH_RE` nel middleware |
| `/blog/{slug}/` | ✅ | `BLOG_IT_SLUG_RE` nel middleware |
| `/blog/{slug}-en/` | ✅ | `BLOG_EN_SLUG_RE` nel middleware |
| `/project/numero-{N}-{titolo}/` | ✅ | `PROJECT_NUMERO_RE` (Fix-3) |
| `/esperienze/` | ✅ | `redirects-legacy.json` → `/it/categoria/progetti/` |
| `/{nome-categoria}/` | ✅ | `redirects-legacy.json` (voci esatte) |
| `/i-diari-di-ombre-e-luci/` | ✅ | `redirects-legacy.json` → `/it/rubriche/diari/` |
| `/diario-di-{nome}/` | ✅ | `DIARIO_RE` nel middleware |
| `/la-rivista/` | ✅ | `redirects-legacy.json` → `/it/archivio/` |
| `/chi-siamo/` | ✅ | `astro.config.mjs` |
| `/sostienici/` | ✅ | `astro.config.mjs` |
| `/newsletter/` | ✅ | `astro.config.mjs` |
| `/cerca/` | ✅ | `astro.config.mjs` |
| `/mariangela-bertolini/` | 🔴 MISSING | nessun layer |
| `/{slug-autore}/` | 🔴 MISSING (caso per caso) | non coperto strutturalmente |
| `/tag/{tag}/` | 🔴 MISSING | nessun layer |
| `/feed/` | ✅ | Worker proxy verso WP |
| `/wp-sitemap.xml` | 🔴 MISSING | non redirigge a `/sitemap.xml` |

---

## Impatto atteso dopo i fix

| Scenario | URL coperti |
|---|---|
| Aggiunta regex `/YYYY/{slug}/` | +2.928 |
| Aggiunta regex `/en/YYYY/{slug}/` | +54 |
| Aggiunta regex `/project/numero-N-*/` | +129 |
| Aggiunta regex `/project/*` | +77 |
| Aggiunta regex `/n-N/` | +~150 |
| Aggiunta regex `/insieme/insieme-n-N/` | +~30 |
| Voci esatte pagine WP (GAP-7) | +~30 |
| **Totale stimato coperto dopo fix** | **~3.398 / 3.499 (97.1%)** |
| **MISSING residui stimati** | **~101 (2.9%)** |

---

## Script generati

- `scripts/wp-urls.txt` — 3.500 URL dalla sitemap WP
- `scripts/verify-redirects-local.mjs` — simulazione locale, no HTTP
- `scripts/redirect-report.json` — dati completi
- `scripts/redirect-report.md` — report sintetico

---

*Audit eseguito 2026-05-19. Aggiornare dopo ogni modifica al middleware.*
