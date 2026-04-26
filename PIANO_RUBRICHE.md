# PIANO — Refactor tassonomia: /rubriche/ + /en/sections/

**Stato:** approvato, da eseguire  
**Branch:** main diretto (staging non è produzione)  
**Stima:** ~4 ore  
**Decisione architetturale:** separare temi (`/categoria/`) da rubriche (`/rubriche/`) — due assi ortogonali della tassonomia di una rivista.

---

## Contesto e decisione

Le categorie `editoriali`, `testimonianze`, `interviste`, `recensioni` NON sono temi — sono **rubriche** (sezioni editoriali ricorrenti della rivista). Attualmente sono mischiate sotto `/categoria/` causando confusione strutturale. `dialogo-aperto` e `diari` sono già sotto `/sezioni/` ma vanno spostati sotto `/rubriche/` per uniformità.

**Struttura finale:**
- `/categoria/{slug}` → temi (di cosa parlano gli articoli) → campo `categoria_menu`
- `/rubriche/{slug}` → rubriche (come è organizzata la rivista) → campo `forma` + autori
- `/diari/[diario]` → diario individuale (invariato)

**Megamenu proposto:**
```
[ TEMI ]          [ RUBRICHE ]        [ NAVIGA ]         [ ULTIMO NUMERO ]
Fede e Luce       Editoriali          Tutti gli art.     [copertina]
Famiglia          Interviste          Archivio           N.172 · 2025
Spiritualità      Testimonianze       Autori             Paradigma Pompei
Cultura           Recensioni          Cerca
Scuola            ──────────                             Sostieni →
Salute            Diari
Lavoro            Dialogo Aperto
Progetti
```

---

## Dati verificati (curl Directus 2026-04-26)

| Campo `forma` | IT published | EN published |
|---|---|---|
| Editoriale | 170 | 168 |
| Intervista | ~170 | 34 |
| Testimonianza | 418 | 418 |
| Recensione | ~430 | 433 |
| Dialogo Aperto | ~160 | 159 |

Il campo `forma` è già copiato correttamente sugli articoli EN dalla pipeline AI. Le rubriche EN funzioneranno subito.

---

## Baseline pre-lavoro

```bash
npm run build
curl -sI https://ombreeluci-staging.pages.dev/categoria/editoriali/    # 200 → da eliminare
curl -sI https://ombreeluci-staging.pages.dev/categoria/testimonianze/ # 200 → da eliminare
curl -sI https://ombreeluci-staging.pages.dev/sezioni/dialogo-aperto/  # 200 → da spostare
curl -sI https://ombreeluci-staging.pages.dev/sezioni/diari/           # 200 → da spostare
curl -sI https://ombreeluci-staging.pages.dev/en/dialogue/             # 200 → da spostare
curl -sI https://ombreeluci-staging.pages.dev/en/diaries/              # 200 → da spostare (hub)
npm run test:seo
```

---

## File da creare

### 1. `src/data/rubriche.json`

```json
[
  { "slug": "editoriali",    "en_slug": "editorials",    "it": "Editoriali",     "en": "Editorials",     "filtro": "forma", "valore": "Editoriale"     },
  { "slug": "interviste",    "en_slug": "interviews",    "it": "Interviste",     "en": "Interviews",     "filtro": "forma", "valore": "Intervista"     },
  { "slug": "testimonianze", "en_slug": "testimonies",   "it": "Testimonianze",  "en": "Testimonies",    "filtro": "forma", "valore": "Testimonianza"  },
  { "slug": "recensioni",    "en_slug": "reviews",       "it": "Recensioni",     "en": "Reviews",        "filtro": "forma", "valore": "Recensione"     },
  { "slug": "dialogo-aperto","en_slug": "open-dialogue", "it": "Dialogo Aperto", "en": "Open Dialogue",  "filtro": "forma", "valore": "Dialogo Aperto" },
  { "slug": "diari",         "en_slug": "diaries",       "it": "I Diari",        "en": "The Diaries",    "filtro": "autori","valore": "diaristi"       }
]
```

Regole:
- `filtro: "forma"` → query Directus su campo `forma`
- `filtro: "autori"` → filtra per `DIARISTI` da `src/data/diari.ts` (NON inline)
- Dialogo Aperto usa `forma` (non `serie.slug`) per coerenza — produce stesso risultato (159 EN)
- Aggiungere ES/FR = aggiungere chiave `es_slug`/`fr_slug` nel JSON — zero codice

### 2. `src/components/RubricaPageContent.astro`

Componente condiviso IT+EN. Props:
```ts
interface Props {
  lang: Locale;
  rubrica: { slug: string; en_slug: string; it: string; en: string };
  articoli: ArticoloFull[];
}
```
- Layout identico a `CategoriaPageContent` (lista + colonna evidenza)
- hreflang calcolato internamente:
  - IT: `alternateArticleUrl = /en/sections/{en_slug}/`
  - EN: `alternateArticleUrl = /rubriche/{slug}/`
- Link articoli: IT → `/it/{slug}`, EN → `/en/{slug}` (basePath dal lang)
- `basePath` e `locale` passati ad ArticoliRullo

### 3. `src/pages/rubriche/[rubrica].astro` — IT, SSG

```ts
export async function getStaticPaths() {
  // Per ogni rubrica in rubriche.json (eccetto diari — ha file dedicato)
  // filtro === 'forma': filtra getAllArticoliBuild() per a.lang !== 'en' && getLabels([],a).formal === valore
  // filtro === 'autori': NON usato qui (diari ha file dedicato)
}
// Usa RubricaPageContent lang="it"
```

### 4. `src/pages/rubriche/diari.astro` — IT, file statico (override dinamico)

- Astro: file statico batte route dinamica → gestisce `/rubriche/diari/`
- Usa `DiariContent lang="it"` (componente già esistente)
- Layout speciale: card per diarista + feed articoli
- `alternateArticleUrl="/en/sections/diaries/"`

### 5. `src/pages/en/sections/[slug].astro` — EN, SSR

```ts
// Legge rubriche.json, trova rubrica per en_slug
// filtro === 'forma': chiama getArticoliByForma(valore, 'en', creds)
// filtro === 'autori': render DiariContent lang="en" direttamente
// Se 0 articoli → redirect /en/ (S3 pattern già esistente)
// Usa RubricaPageContent lang="en"
```

### 6. `src/pages/en/sections/diaries.astro` — EN, file statico

- Override il `[slug]` dinamico per `/en/sections/diaries/`
- Usa `DiariContent lang="en"`
- `alternateArticleUrl="/rubriche/diari/"`

---

## File da modificare

### `src/lib/directus.ts`
Aggiungere funzione:
```ts
export async function getArticoliByForma(
  forma: string,
  lang: 'it' | 'en',
  creds?: DirectusRuntimeCreds
): Promise<ArticoloFull[]>
// filter[stato]=published + filter[forma][_eq]={forma} + filter[lang][_eq]={lang}
// ATTENZIONE: 'Dialogo Aperto' ha spazio → URL-encode correttamente
```

### `src/data/categorie.json`
Rimuovere le 4 righe non-tematiche:
- `editoriali`, `testimonianze`, `interviste`, `recensioni`

Rimangono le 13 categorie tematiche + ombre-e-luci, da-categorizzare, sport, ecc.

### `src/config/taxonomy.js`
- Rimuovere logica `type: 'formal'` (non più in categorie.json)
- Aggiungere helper che leggono `rubriche.json`:
  ```js
  getRubricaBySlug(slug)        // slug IT → oggetto rubrica
  getRubricaByEnSlug(enSlug)    // slug EN → oggetto rubrica
  getFormaToRubricaSlug(forma)  // 'Editoriale' → 'editoriali' (per badge articolo)
  getRubricaUrlSlug(slug, lang) // slug IT → slug nella lingua target
  ```

### `src/pages/categoria/[categoria].astro`
Rimuovere branch `cat?.type === 'formal'` da `getStaticPaths`. Ora filtra solo per `tema_label`. Le categorie formali non esistono più in `categorie.json` → `getStaticPaths` non le genera.

### `src/components/Header.astro`
- Colonna "Sezioni" → **"Rubriche"**
- `sezioniForme` array → letto da `rubriche.json`
- IT links: `/rubriche/{slug}`
- EN links: `/en/sections/{en_slug}`
- Separatore visivo tra forme (editoriali/interviste/testimonianze/recensioni) e rubriche ricorrenti (dialogo-aperto/diari)
- "Naviga" al posto di "Archivio" nella colonna utilities

### `src/components/Footer.astro`
Stessa logica Header: `sezioniFormali` → letta da `rubriche.json`, link aggiornati a `/rubriche/` e `/en/sections/`.

### `src/pages/it/[slug].astro`
Badge articolo — aggiungere `formaLink`:
```ts
import rubricheData from '../../data/rubriche.json';
const rubrica = rubricheData.find(r => r.valore === currentLabels.formal);
const formaLink = rubrica ? `/rubriche/${rubrica.slug}/` : null;
// Render: se formaLink → <a href={formaLink}>{formaDisplay}</a>
//         altrimenti → <span>{formaDisplay}</span>
```

### `src/pages/en/[slug].astro`
Identico ma EN:
```ts
const rubrica = rubricheData.find(r => r.valore === currentLabels.formal);
const formaLink = rubrica ? `/en/sections/${rubrica.en_slug}/` : null;
```

### `src/pages/sitemap.xml.ts`
Aggiungere le 6 rubriche IT:
```ts
import rubricheData from '../data/rubriche.json';
// map rubricheData → { url: `/rubriche/${r.slug}/` }
```

### `src/pages/sitemap-en.xml.ts`
Aggiungere le 6 sections EN:
```ts
// map rubricheData → { url: `/en/sections/${r.en_slug}/` }
```

### `scripts/test-seo.mjs`
Aggiungere almeno:
```js
{ url: '/rubriche/editoriali/',      lang: 'it', expectHreflang: true },
{ url: '/rubriche/diari/',           lang: 'it', expectHreflang: true },
{ url: '/en/sections/editorials/',   lang: 'en', expectHreflang: true },
{ url: '/en/sections/diaries/',      lang: 'en', expectHreflang: true },
```

---

## File da eliminare

| File eliminato | Sostituito da |
|---|---|
| `src/pages/sezioni/diari.astro` | `src/pages/rubriche/diari.astro` |
| `src/pages/sezioni/dialogo-aperto.astro` | `src/pages/rubriche/[rubrica].astro` (dinamico) |
| `src/pages/en/diaries/index.astro` | `src/pages/en/sections/diaries.astro` |
| `src/pages/en/dialogue/index.astro` | `src/pages/en/sections/[slug].astro` (dinamico) |

**NON eliminare:**
- `src/pages/diari/[diario].astro` — invariato (diario individuale)
- `src/pages/en/diaries/[diario].astro` — invariato
- `src/components/DiariContent.astro` — riusato da diari.astro e diaries.astro
- `src/components/DiarioContent.astro` — riusato dalle route individuali

---

## Cosa NON cambia

- `/categoria/famiglia/` e tutti i temi IT — invariati
- `/en/category/family/` ecc. — invariati
- `/diari/[diario]` e `/en/diaries/[diario]` — invariati
- Campo `categoria_menu` in Directus — invariato
- Campo `forma` in Directus — invariato (già copiato correttamente in EN)
- `CategoriaPageContent.astro` — invariato
- `ArticlePageLayout.astro` — invariato (solo badge aggiornato in it/[slug] e en/[slug])

---

## Gate durante sviluppo

```bash
npm run build      # dopo ogni blocco di file, zero errori
tsc --noEmit       # zero errori TypeScript
```

---

## Smoke test post-deploy

```bash
S="https://ombreeluci-staging.pages.dev"

echo "=== Nuove route — tutte 200 ==="
for slug in editoriali interviste testimonianze recensioni dialogo-aperto diari; do
  echo -n "/rubriche/$slug/ → "
  curl -sI "$S/rubriche/$slug/" | grep HTTP
done
for slug in editorials interviews testimonies reviews open-dialogue diaries; do
  echo -n "/en/sections/$slug/ → "
  curl -sI "$S/en/sections/$slug/" | grep HTTP
done

echo ""
echo "=== Vecchie route — 404 (non esistono più) ==="
curl -sI "$S/categoria/editoriali/"    | grep HTTP
curl -sI "$S/categoria/testimonianze/" | grep HTTP
curl -sI "$S/sezioni/dialogo-aperto/"  | grep HTTP
curl -sI "$S/sezioni/diari/"           | grep HTTP
curl -sI "$S/en/dialogue/"             | grep HTTP

echo ""
echo "=== Temi invariati — 200 ==="
curl -sI "$S/categoria/famiglia/"    | grep HTTP
curl -sI "$S/en/category/family/"    | grep HTTP

echo ""
echo "=== hreflang IT↔EN ==="
curl -s "$S/rubriche/editoriali/"    | grep hreflang
curl -s "$S/en/sections/editorials/" | grep hreflang

echo ""
echo "=== Badge formaLink ==="
# Trovare un articolo IT con forma Editoriale e verificare link
curl -s "$S/it/[slug-editoriale]/" | grep "rubriche"
curl -s "$S/en/[slug-editoriale]/" | grep "sections"

echo ""
echo "=== Megamenu ==="
curl -s "$S/" | grep -c "rubriche"    # almeno 4

echo ""
echo "=== Sitemap ==="
curl -s "$S/sitemap.xml"    | grep "rubriche"
curl -s "$S/sitemap-en.xml" | grep "sections"

npm run test:seo
```

---

## Punto critico da verificare

`forma = 'Dialogo Aperto'` ha uno spazio. La query Directus:
```
filter[forma][_eq]=Dialogo Aperto
```
Deve essere URL-encoded come `Dialogo%20Aperto`. Verificare che `getArticoliByForma` gestisca correttamente usando `URLSearchParams` (che encode automaticamente).

---

## Documentazione al termine

- **STATO.md**: aggiornare tabella parità lingue con `/rubriche/*` e `/en/sections/*`; aggiungere a "Stato attuale verificato"
- **CLAUDE.md**: aggiornare tabella componenti condivisi con `RubricaPageContent.astro`; aggiornare struttura URL
- **CONTENUTI.md**: aggiornare sezione parità lingue
- **WORKING.md**: aggiornare struttura `src/pages/` con cartelle `rubriche/` e `en/sections/`
- **Eliminare questo file** `PIANO_RUBRICHE.md` quando il task è completato
