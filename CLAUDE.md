
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

**Stato attuale componenti condivisi:**

| Componente | Pagine che lo usano |
|---|---|
| `ArticlePageLayout.astro` | `/it/[slug]`, `/en/[slug]` |
| `CategoriaPageContent.astro` | `/categoria/[cat]`, `/en/category/[slug]` |
| `AuthorPageContent.astro` | `/autori/[slug]`, `/en/authors/[slug]` |
| `ArticoliRullo.astro` | `/tag/[slug]`, `/en/tag/[slug]`, sezioni |
| `ArticleCard.astro` | ovunque |
| `BaseLayout.astro` | tutte le pagine |

**Pagine ancora da estrarre in componente condiviso (da fare prima di creare versioni EN):**

| Pagina | Componente da creare | Route IT | Route EN target |
|---|---|---|---|
| Homepage | `HomePageContent.astro` | `/` | `/en/` |
| Archivio rivista | `ArchivioContent.astro` | `/archivio/` | `/en/archive/` |
| Numero rivista | `IssueContent.astro` | `/archivio/[issue]` | `/en/archive/[issue]` |
| Archivio web-only | `WebOnlyContent.astro` | `/archivio/web-only` | `/en/archive/web-only` |
| Sezione diari | `DiariContent.astro` | `/sezioni/diari` | `/en/diaries/` |
| Diario singolo | `DiarioContent.astro` | `/diari/[diario]` | `/en/diaries/[diario]` |
| Dialogo Aperto | `DialogoApertoContent.astro` | `/sezioni/dialogo-aperto` | `/en/dialogue/` |
| Chi siamo | `ChiSiamoContent.astro` | `/chi-siamo/` | `/en/about/` |
| La redazione | `RedazioneContent.astro` | `/chi-siamo/la-redazione` | `/en/about/team/` |
| Collaboratori | `CollaboratoriContent.astro` | `/chi-siamo/collaboratori` | `/en/about/contributors/` |
| La rivista | `LaRivistaContent.astro` | `/chi-siamo/la-rivista` | `/en/about/magazine/` |
| Contatti | `ContattiContent.astro` | `/chi-siamo/contatti` | `/en/about/contact/` |
| Sostienici | `SostienicContent.astro` | `/sostienici` | `/en/support-us/` |
| Newsletter | `NewsletterContent.astro` | `/newsletter` | `/en/newsletter/` |
| Autori index | `AutoriIndexContent.astro` | `/autori/` | `/en/authors/` ✅ già fatto |
| Cerca | `CercaContent.astro` | `/cerca` | `/en/search/` |

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

**Language switcher:** ogni pagina passa `alternateUrls` con i link per tutte le lingue disponibili. Se una traduzione non esiste → link alla homepage della lingua.

**Nuove pagine:** ogni nuova pagina (verticali, dossier, sezioni) va progettata multilingua fin dall'inizio, non retrofittata.

Riferimento completo: `CONTENUTI.md` sezione "Principio di scalabilità multilingua".

---

## Routing canonical per lingua (stato 2026-04-25)

- IT: `/it/{slug}/` — route `src/pages/it/[slug].astro` (URL-IT-01)
- EN: `/en/{slug}/` — route `src/pages/en/[slug].astro`, lookup a due tentativi (slug esatto → slug+`-en`)
