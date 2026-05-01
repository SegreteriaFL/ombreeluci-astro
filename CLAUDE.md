
## REGOLA FONDAMENTALE — Componente condiviso per ogni pagina template

**Questa regola vale per ogni pagina del sito, senza eccezioni.**

Quando esiste una pagina IT con un layout, la versione EN (e ES, FR, qualsiasi lingua futura) NON è un file separato con markup copiato. È lo stesso componente con `lang` diverso.

Flusso obbligatorio per qualsiasi pagina template:
1. Esiste `src/pages/it/pagina.astro` (o `src/pages/pagina.astro`)
2. Si crea `src/components/PaginaContent.astro` con prop `lang`
3. La pagina IT usa il componente con `lang="it"`
4. La pagina EN usa lo stesso componente con `lang="en"`
5. Modifiche future: si toccano SOLO nel componente — si propagano a tutte le lingue automaticamente

**Conseguenza pratica:** se stai creando una pagina EN copiando markup da una pagina IT, stai sbagliando. Fermati, estrai prima il componente, poi crea la route EN.

**Stato attuale componenti condivisi (tutti estratti — 2026-05-01, routing /it/ completato B-14):**

| Componente | Route IT | Route EN |
|---|---|---|
| `ArticlePageLayout.astro` | `/it/[slug]` | `/en/[slug]` |
| `CategoriaPageContent.astro` | `/it/categoria/[cat]` | `/en/category/[slug]` |
| `RubricaPageContent.astro` | `/it/rubriche/[rubrica]` | `/en/sections/[slug]` |
| `AuthorPageContent.astro` | `/it/autori/[slug]` | `/en/authors/[slug]` |
| `HomePageContent.astro` | `/` | `/en/` |
| `ChiSiamoContent.astro` | `/it/chi-siamo/` | `/en/about/` |
| `SostienicContent.astro` | `/it/sostienici/` | `/en/support-us/` |
| `NewsletterContent.astro` | `/it/newsletter/` | `/en/newsletter/` |
| `CercaContent.astro` | `/it/cerca/` | `/en/search/` |
| `ArchivioContent.astro` | `/it/archivio/` | `/en/archive/` |
| `IssueContent.astro` | `/it/archivio/[issue]` | `/en/archive/[issue]` |
| `DiariContent.astro` | `/it/rubriche/diari` | `/en/sections/diaries/` |
| `DiarioContent.astro` | `/it/diari/[diario]` | `/en/diaries/[diario]` |
| `ArticoliRullo.astro` | `/it/tag/[slug]`, `/it/archivio/web-only` | `/en/tag/[slug]`, `/en/archive/web-only` |
| `ArticleCard.astro` | ovunque | ovunque |
| `BaseLayout.astro` | tutte le pagine | tutte le pagine |
| `VerticaleContent.astro` | `/it/focus/[vertical]` | `/en/focus/[vertical]` |
| `FocusListingContent.astro` | `/it/focus/` | `/en/focus/` |

**Aggiungere una nuova lingua (ES, FR):** creare `src/pages/es/` con gli stessi file route, passare `lang="es"` ai componenti. Zero markup da duplicare.

---

## i18n scalabilità — regola permanente

Il sito supporterà IT, EN, ES, FR e lingue future. Ogni decisione i18n deve essere presa con questa prospettiva.

**Regola assoluta:** nessuna mappa slug/label hardcoded nel codice TypeScript o JavaScript. Tutto vive in `src/data/categorie.json` con una chiave per lingua. Aggiungere ES significa aggiungere `"es": "Familia"` nel JSON — zero modifiche al codice.

**Vietato:**
```ts
// MAI fare così
const CAT_IT_TO_EN = { 'famiglia': 'family', 'cultura': 'culture' }
const CAT_IT_TO_ES = { 'famiglia': 'familia', 'cultura': 'cultura' }
```

**Corretto:**
```ts
// Leggere sempre da categorie.json
getCategoriaSlug(slugIT, lang)   // IT slug → slug nella lingua target
getCategoriaSlugIT(slug, lang)   // slug qualsiasi lingua → slug IT
getCategoriaLabel(slugIT, lang)  // IT slug → label localizzata
```

**Route per lingua:** ogni lingua ha `src/pages/{lang}/` con struttura identica. Le route leggono `categorie.json`, non mappe hardcoded.

**Language switcher:** ogni pagina passa `alternateUrls` con i link per tutte le lingue disponibili. Se una traduzione non esiste → link alla **homepage della lingua target** (`/${lang}/`), mai un URL specifico che potrebbe non esistere.

**Nuove pagine:** ogni nuova pagina (verticali, dossier, sezioni) va progettata multilingua fin dall'inizio, non retrofittata.

Riferimento completo: `CONTENUTI.md` sezione "Principio di scalabilità multilingua".

---

## INVARIANTE — categoria_menu è sempre slug IT

**`categoria_menu` non è un campo localizzato. È la chiave della tassonomia interna.**

Un articolo in qualsiasi lingua (EN, ES, FR) deve avere `categoria_menu = 'famiglia'`, non `'family'` né `'familia'`. La label localizzata viene derivata da `categorie.json` al render — non va memorizzata sull'articolo.

```
articolo EN corretto:  { lang: 'en', categoria_menu: 'famiglia' }
articolo EN sbagliato: { lang: 'en', categoria_menu: 'family' }   ← rompe le route categoria
```

**Conseguenza pratica:** ogni pipeline di traduzione/importazione deve copiare `categoria_menu` dall'articolo IT sorgente, non tradurlo. La route `en/category/[slug].astro` e le future `es/category/[slug].astro` si basano su `categorie.json` per mappare `'famiglia'` → `'family'` → `'familia'` — il DB non deve sapere nulla di queste label.

**Verifica post-pipeline:** dopo ogni importazione batch di articoli non-IT, controllare che `categoria_menu` sia uguale all'IT sorgente:
```
GET /items/articoli?filter[lang][_eq]=en&filter[categoria_menu][_null]=true&limit=1
```
Se ritorna risultati, la pipeline ha saltato il campo.

---

## Routing canonical per lingua (stato 2026-05-01, B-14 completato)

Tutte le route IT sono ora sotto `/it/`. Nessuna route IT vive più alla root (eccetto `/` homepage).

- IT articoli: `/it/{slug}/` — route `src/pages/it/[slug].astro`
- IT sezioni: `/it/archivio/`, `/it/autori/`, `/it/categoria/`, `/it/cerca/`, `/it/chi-siamo/`, `/it/diari/`, `/it/focus/`, `/it/newsletter/`, `/it/rubriche/`, `/it/sostienici/`, `/it/tag/`
- EN articoli: `/en/{slug}/` — route `src/pages/en/[slug].astro`, lookup a due tentativi (slug esatto → slug+`-en`)
- EN sezioni: `/en/archive/`, `/en/authors/`, `/en/category/`, `/en/search/`, `/en/about/`, `/en/diaries/`, `/en/focus/`, `/en/newsletter/`, `/en/sections/`, `/en/support-us/`, `/en/tag/`

**Redirect root→/it/ in astro.config.mjs** (staging, evita link rotti): `/archivio`, `/autori`, `/categoria`, `/cerca`, `/chi-siamo`, `/diari`, `/newsletter`, `/rubriche`, `/sostienici`, `/tag` → rispettivi `/it/…`.

**`getAuthorBasePath(lang)`** in `src/utils/i18n.ts` restituisce `/it/autori` per IT e `/${lang}/authors` per le altre lingue.

**Aggiungere una nuova lingua (ES, FR):** creare `src/pages/es/` con struttura identica a `src/pages/en/`. Zero markup da duplicare.

### Stato slug EN reale (verificato 2026-04-25 via curl Directus)

### Stato slug EN reale (verificato 2026-04-25 via curl Directus)

| Gruppo | Quantità | Slug convention |
|---|---|---|
| Articoli AI (pipeline 2026-04-25) | ~3339 | Slug EN pulito, niente suffisso (es. `the-dandelion-project`) |
| Traduzioni manuali originali | ~131 totali, **42 ancora con `-en`** | Slug con suffisso (es. `storia-di-un-padre-en`) |

Il suffisso `-en` è quasi eliminato (97%). 42 articoli hanno ancora il suffisso — sono le traduzioni manuali originali non ancora rinominate. La route usa lookup a due tentativi per compatibilità con entrambe le forme. **Obiettivo:** portare a 0 i `-en` con script di rinomina su quei 42 (task SLUG-EN).

Quando si arriverà a ES/FR: lo slug URL sarà sempre lo slug pulito senza suffisso. `toArticleUrlSlug(dbSlug, lang)` (da aggiungere in `src/utils/i18n.ts`) gestirà il caso generale.

---

## REGOLA CSS — mai toccare global.css senza grep preventivo

**Prima di aggiungere qualsiasi classe a `global.css`, fare grep su tutta la codebase per verificare che quella classe non esista già in altri componenti con stili diversi.**

```bash
grep -r "\.nome-classe" src/
```

Se la classe esiste altrove (es. `.article-title` in `ArticlePageLayout.astro`), aggiungerla a `global.css` sovrascrive quegli stili silenziosamente — il bug si vede solo visivamente, non come errore di build.

**Regola pratica:**
- CSS di un componente → `<style>` scoped nel componente, sempre
- `global.css` → solo classi utility di layout già concordate (`.container`, `.site-main`, `.rich-text`, ecc.)
- Se una nuova classe utility serve globalmente, prima verificare conflitti, poi discutere

**Caso documentato (2026-04-30):** spostare le scoped styles di `ArticleCard.astro` in `global.css` ha reso `.article-title`, `.article-badge`, `.author-row` globali, sovrascrivendo gli stili della pagina articolo (`ArticlePageLayout.astro`) che usa le stesse classi. Risultato: titoli articolo con font/dimensione sbagliati su tutto il sito. Revertato con `e912e5e4`.

---

## REGOLA LAYOUT — `<main class="site-main">` è obbligatorio

Ogni componente che usa `BaseLayout` **deve** wrappare il suo contenuto in `<main class="site-main">`.

Il footer usa `position: fixed; z-index: 1`. Il `site-main` ha `position: relative; z-index: 10; background-color: var(--bg-light)` — senza questo wrapper il footer è visibile sopra il contenuto della pagina.

```astro
<BaseLayout ...>
  <main class="site-main">
    <!-- contenuto -->
  </main>
</BaseLayout>
```

Questa regola è già rispettata da tutti i componenti esistenti. Ogni nuovo componente deve seguirla.
