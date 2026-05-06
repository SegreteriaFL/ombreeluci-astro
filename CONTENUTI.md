# CONTENUTI — Architettura contenuti, lingue, ricerca

Questo documento governa tutto ciò che riguarda struttura, lingua e discovery dei contenuti:
architettura multilingua, routing lingue, ricerca, pagine autore, traduzione AI, tag, pagine verticali.

---

## Dati importati (stato al 2026-03-22, immutabile)

| Risorsa | Quantità | Note |
|---------|----------|------|
| Articoli pubblicati | 3527 | IT: 3396, EN: 3470 published (traduzione AI completata 2026-04-25; base originale EN: 131 al 2026-03-22) |
| Autori | 352 | 88 con foto su R2 (`autori/{uuid}`) |
| Numeri rivista | 204 | Copertine su R2, `copertina_url` popolato |
| Temi | 285 | M2M: 6676 relazioni articoli↔temi |
| Tag | 816 | M2M: 2764 relazioni articoli↔tag |
| Copertine articoli | 2972/2972 | Su R2 (`copertine/{uuid}`) |

---

## Architettura multilingua

### Principi (non negoziabili)

- Il locale è determinato una volta per request e propagato ovunque (BaseLayout → Header → Footer → Commenti)
- Routing lingua esplicito: IT su `/it/{slug}`, EN su `/en/{slug}`, ES su `/es/{slug}`, FR su `/fr/{slug}`
- Nessun URL indicizzato viene rotto: sempre 301 verso canonical nuovo
- Traduzione massiva AI solo su base i18n tecnica stabile

### Principio di scalabilità multilingua (non negoziabile)

**Obiettivo:** il sito deve supportare IT, EN, ES, FR e qualsiasi lingua futura senza modifiche strutturali al codice. Aggiungere una lingua deve richiedere solo: aggiungere una chiave nel file dati, creare le route nella nuova cartella lingua, tradurre i contenuti.

**Regola fondamentale — fonte unica di verità per slug e label:**

Tutte le mappature slug→label per lingua vivono in `src/data/categorie.json`. Nessuna mappa hardcoded nel codice (`CAT_IT_TO_EN_SLUG`, `CAT_EN_TO_IT_SLUG` ecc. in `i18n.ts` sono deprecate e vanno rimosse).

Struttura `categorie.json`:
```json
[
  {
    "slug": "famiglia",
    "it": "Famiglia",
    "en": "Family",
    "es": "Familia",
    "fr": "Famille"
  }
]
```

Per aggiungere una nuova lingua: aggiungere la chiave nel JSON. Nient'altro.

**Funzioni di utilità (in `src/config/taxonomy.js` o `src/utils/i18n.ts`):**

```js
// Slug IT → slug per lingua target
getCategoriaSlug(slugIT, lang)
// es. getCategoriaSlug('famiglia', 'en') → 'family'
// es. getCategoriaSlug('famiglia', 'es') → 'familia'

// Slug qualsiasi lingua → slug IT (per query Directus)
getCategoriaSlugIT(slugLang, lang)
// es. getCategoriaSlugIT('family', 'en') → 'famiglia'

// Slug IT → label localizzata
getCategoriaLabel(slugIT, lang)
// es. getCategoriaLabel('famiglia', 'it') → 'Famiglia'
```

**URL categoria per lingua:**
```
IT:  /categoria/{slug-it}/
EN:  /en/category/{slug-en}/
ES:  /es/categoria/{slug-es}/
FR:  /fr/categorie/{slug-fr}/
```

**Route per lingua:**
Ogni lingua ha la sua cartella in `src/pages/{lang}/`. La struttura è identica per tutte le lingue. Le route leggono `categorie.json` per risolvere slug e label — non usano mappe hardcoded.

**Language switcher:**
Ogni pagina passa `alternateUrls` (mappa lang→url) a `BaseLayout`. Il switcher mostra tutte le lingue disponibili con il link corretto. Se una traduzione non esiste, il link porta alla homepage della lingua.

**Pagine verticali e nuove pagine:**
Ogni nuova pagina creata (verticali, dossier, sezioni) deve essere progettata con la struttura multilingua fin dall'inizio — non retrofittata. Il componente condiviso riceve `lang` come prop e gestisce internamente label e link.

### Stato attuale (post-merge `a4b032f9`)

| Fase | Stato | Cosa copre |
|------|-------|------------|
| F0 — Normalizzazione categorie | ✅ | `categoria_menu` è slug canonico in Directus (3483 articoli), label localizzata risolta da `src/data/categorie.json` |
| F1 — Shell EN | ✅ | Header/Footer/Commenti/LanguageSelector tutti lang-aware, prop `lang` propagata da BaseLayout |
| F2 — Routing `/en/` | ✅ | Route `en/[slug].astro`, `en/index.astro`, `en/category/[slug].astro`, `en/tag/[slug].astro`, sitemap EN, redirect 301 `/blog/*-en/` → `/en/*/` |
| Smoke test SEO F2 | ⏳ | Screaming Frog su staging — gate formali da eseguire (vedi STATO.md B-02) |

### Parità lingue — stato pagine

| Pagina | Route IT | Route EN | Componente condiviso |
|--------|----------|----------|----------------------|
| Articolo | `/it/[slug]` | `/en/[slug]` | ✅ `ArticlePageLayout.astro` |
| Categoria | `/categoria/[cat]` | `/en/category/[slug]` | ✅ `CategoriaPageContent.astro` |
| Autore | `/autori/[slug]` | `/en/authors/[slug]` | ✅ `AuthorPageContent.astro` |
| Lista autori | `/autori/` | `/en/authors/` | ✅ `AutoriIndexContent.astro` |
| Tag | `/tag/[slug]` | `/en/tag/[slug]` | ✅ `ArticoliRullo.astro` |
| Homepage | `/` | `/en/` | ✅ `HomePageContent.astro` |
| Archivio rivista | `/archivio/` | `/en/archive/` | ✅ `ArchivioContent.astro` |
| Numero rivista | `/archivio/[issue]` | `/en/archive/[issue]` | ✅ `IssueContent.astro` |
| Archivio web-only | `/archivio/web-only` | `/en/archive/web-only` | ✅ `ArticoliRullo.astro` (già condiviso) |
| Rubriche (editoriali, interviste, testimonianze, recensioni, dialogo-aperto) | `/rubriche/[slug]` | `/en/sections/[slug]` | ✅ `RubricaPageContent.astro` |
| Diari (hub) | `/rubriche/diari` | `/en/sections/diaries/` | ✅ `DiariContent.astro` |
| Diario singolo | `/diari/[diario]` | `/en/diaries/[diario]` | ✅ `DiarioContent.astro` |
| Chi siamo | `/chi-siamo/` | `/en/about/` | ✅ `ChiSiamoContent.astro` |
| La redazione | `/chi-siamo/la-redazione` | → `/chi-siamo#la-redazione` (redirect) | ✅ sezione in ChiSiamoContent |
| Collaboratori | `/chi-siamo/collaboratori` | → `/chi-siamo#collaboratori` (redirect) | ✅ sezione in ChiSiamoContent |
| La rivista | `/chi-siamo/la-rivista` | → `/chi-siamo#la-rivista` (redirect) | ✅ sezione in ChiSiamoContent |
| Contatti | `/chi-siamo/contatti` | → `/chi-siamo#contatti` (redirect) | ✅ sezione in ChiSiamoContent |
| Sostienici | `/sostienici` | `/en/support-us/` | ✅ `SostienicContent.astro` |
| Newsletter | `/newsletter` | `/en/newsletter/` | ✅ `NewsletterContent.astro` |
| Cerca | `/cerca` | `/en/search/` | ✅ `CercaContent.astro` |

Regola: la colonna "Route EN" diventa ✅ solo dopo che il componente condiviso è estratto e la route EN creata. Vedi CLAUDE.md "REGOLA FONDAMENTALE".

### Slug convention EN (verificato 2026-04-25)

**3339 articoli AI**: slug EN pulito, niente suffisso (es. `the-dandelion-project`). URL = slug diretto.
**42 articoli** (traduzioni manuali originali): ancora con suffisso `-en`. URL rimuove il suffisso.
La route `en/[slug].astro` usa lookup a due tentativi per gestire entrambi i casi.
Obiettivo: rinominare i 42 con script batch (SLUG-EN) e rimuovere il secondo tentativo.

### Redirect matrix EN (immutabile)

| URL sorgente | Destinazione | Via |
|---|---|---|
| `/blog/foo-en/` | `/en/foo/` | 301 middleware + Worker |
| `/blog/en` | `/en/` | 301 astro.config.mjs |
| articolo EN che arriva a `blog/[...slug]` | `/en/[slug]/` | guard 301 interno |

### Collegamento IT↔EN

Campo `articolo_traduzione` (self-relation M2O su `articoli`), bidirezionale.
Stato backfill: 40 link creati automaticamente, 7 ambigui + 11 no-match da revisionare manualmente (CSV: `scripts/traduzione/logs/backfill_traduzione_link_20260408_231827.csv`).

### Prossime fasi i18n

**F3 — Modello dati Directus multilingua** (post-lancio)
Introdurre schema translations per gestire bio autori, label UI, descrizioni categorie in più lingue. Attualmente gestito con campi separati (`bio_en` ecc.) — non ancora implementato.

**F4 — Traduzione AI produzione** (post-lancio, vedi sezione Traduzioni)

---

## Ricerca

### Situazione attuale

Il sito usa **Pagefind** (build-time index). Pagefind indicizza solo le pagine HTML statiche generate a build-time. Gli articoli IT sono SSR (`blog/[...slug].astro` ha `prerender: false`) quindi **non producono file HTML statici** → **il corpo degli articoli IT non è indicizzato da Pagefind**.

La ricerca attuale copre: home, categorie, archivio, pagine autore, pagine sezione, EN index — ma non il corpus dei 3527 articoli IT.

Questo è il problema principale della ricerca, non la UX dei risultati.

Problema secondario: i risultati non hanno faceting per tipo (articolo/autore/numero) né per lingua — tutto misto.

### Decisione architetturale — PRESA (2026-04-25)

**Opzione B — Algolia.** Blocker pre-lancio (B-13). Non si va in produzione senza ricerca funzionante.

Motivazione: il corpus è 6866+ articoli (IT + EN), SSR per gli articoli IT rende impossibile l'indicizzazione Pagefind, e la ricerca è una funzionalità centrale per un archivio di 40 anni. Algolia free tier (10k records) è sufficiente per ora; se si supera il limite si passa a paid tier.

**Da fare (SEARCH-01):**
1. Script sync Directus → Algolia: `scripts/algolia-sync.js` — indicizza `id, slug, titolo, sottotitolo, autore, categoria_menu, lang, data_pubblicazione, url` per tutti gli articoli published
2. Webhook Directus che ri-sincronizza all'aggiornamento di un articolo
3. Frontend: pagina `/cerca` (IT) e `/en/search` (EN) con `algoliasearch` client, faceting per `lang` e `categoria_menu`
4. Smoke test: ricerca "famiglia" restituisce risultati IT, ricerca "family" restituisce risultati EN

### UX ricerca (da fare dopo decisione architetturale)

Indipendentemente dall'opzione scelta, la UX va migliorata:
- Faceting per tipo: articoli / autori / numeri rivista
- Faceting per lingua: IT / EN
- Ordinamento: rilevanza + data, con articoli prioritizzati rispetto ad autori e numeri
- Schema indice minimo: `type`, `lang`, `title`, `excerpt`, `url`, `date`, `author`, `category`

---

## Pagine autore

### Problema attuale

`src/pages/autori/[slug].astro` mostra tutti gli articoli dell'autore **senza filtro per lingua**: articoli IT e EN mescolati nella stessa lista. Non esiste una route EN per le pagine autore.

### Architettura target

**Componente condiviso `AuthorPageContent.astro`** con props:
- `lang` (it | en)
- `author` (oggetto autore da Directus)
- `articles` (lista già filtrata per lingua)
- `basePath` (es. `/autori`, `/en/authors`)
- label i18n

**Route IT** `src/pages/autori/[slug].astro`: query `autore = X AND stato = published AND lang = it`, passa a componente con `lang="it"`.

**Route EN** `src/pages/en/authors/[slug].astro`: query `autore = X AND stato = published AND lang = en`, passa a componente con `lang="en"`.

**hreflang** tra le due versioni quando entrambe esistono.

### Bio autori multilingua

Attualmente nessun autore ha bio in EN. Il campo non è stato aggiunto in Directus. Opzioni:
- Rapida: aggiungere campo `bio_en` in Directus (implementabile in un'ora)
- Scalabile: schema translations Directus (parte di F3)

Per il lancio EN è sufficiente la soluzione rapida con `bio_en` nullable (fallback alla bio IT se vuota).

### DoD pagine autore i18n — ✅ completato (AUT-01, merge 60fcb27c, 2026-04-25)

- ✅ Route IT mostra solo articoli IT dell'autore
- ✅ Route EN mostra solo articoli EN dell'autore
- ✅ Componente condiviso `AuthorPageContent.astro`: una modifica UI si propaga a entrambe le lingue
- ✅ hreflang reciproco IT↔EN quando entrambe le versioni esistono
- ✅ Bio in EN (campo `bio_en` nullable, fallback a bio IT)
- ✅ Pagina `/autori/redazione/` localizzata

---

## Traduzione AI (pipeline IT→EN)

### Stato e politica editoriale (definitiva — non negoziabile)

**Il sito va in produzione con tutti gli articoli tradotti pubblicati.** La traduzione Haiku è approssimativa e funzionale — è il punto di partenza, non il risultato finale. Non si aspetta la perfezione per andare online.

| Fase | Cosa | Quando |
|---|---|---|
| Lancio | 3470 articoli EN **tutti published** | ✅ fatto 2026-04-25 |
| Post-lancio IT | Campionamento redazionale, miglioramento iterativo su articoli prioritari | Dopo lancio |
| Spagnolo ES | Pipeline Haiku IT→ES, pubblica tutto, migliora in iterazioni | Prima o contestuale al lancio |
| FR e lingue future | Stesso modello | Dopo ES |

3470 articoli EN published (di cui 42 con slug `-en` legacy, 3428 con slug EN pulito). Tutti published, zero draft.

### Corpus target

~3265 articoli IT senza versione EN. I 131 EN esistenti (tradotti manualmente da WP) restano invariati.

### Modello e costi

Modello base: `claude-haiku-4-5-20251001`
Costo stimato (mix realistico OEL, ~1500 token/articolo): €25-45 per IT→EN
Budget consigliato da caricare: €100-120 su console.anthropic.com (buffer per retry)
Nota: billing su console.anthropic.com (API), separato dall'abbonamento Claude Pro

### Regole filologiche (approvazione editoriale obbligatoria prima del lancio)

**Terminologia disabilità — non modernizzare mai:**

| Italiano originale | EN corretto | Non usare |
|---|---|---|
| spastico/a | spastic | person with spasticity |
| subnormale | subnormal | intellectually disabled |
| handicappato/a | handicapped | person with a disability |
| mongoloide | mongoloid | person with Down syndrome |
| ritardato/a | retarded | person with intellectual disability |

Il frontend mostra già `archival-alert-en` per articoli EN con anno < 2000.

**Grammatica non standard — non correggere:**
Alcuni articoli sono scritti da bambini o persone con disabilità cognitiva. Preservare il livello di irregolarità grammaticale dell'originale. Non "riparare" la lingua.

### Pipeline operativa (10 step)

```
Step 1  — Audit gap: articoli IT senza EN
Step 2  — Stima costi: python scripts/traduzione/estimate_tokens.py
Step 3  — Approvazione editoriale formale (regole filologiche §sopra)
Step 4  — Dry-run 10 articoli: python translate_articles.py --dry-run --limit 10
Step 5  — Pilot 50 articoli in draft: python translate_articles.py --limit 50 --stato draft --job-id pilot-01
Step 6  — QA pilot: python qa_check.py --job-id pilot-01
Step 7  — Review redazionale campione (15-20 articoli in Directus)
Step 8  — Lancio completo: python translate_articles.py --workers 3 --stato draft --job-id batch-2026
Step 9  — QA completa + backfill link 131 EN legacy
Step 10 — Pubblicazione massiva EN (solo dopo QA ≥ soglie)
```

### Quality gates batch

| Metrica | Soglia |
|---------|--------|
| HTML valido (tag count ±15%) | ≥ 99.5% articoli |
| Link `<a href>` preservati | 100% |
| Collegamento bidirezionale IT↔EN | ≥ 99.9% |
| Lunghezza EN ≥ 30% IT | 100% |
| Tasso errori batch | ≤ 1% |

### Script disponibili in `scripts/traduzione/`

| Script | Funzione |
|--------|----------|
| `translate_articles.py` | Pipeline principale |
| `estimate_tokens.py` | Stima costi pre-lancio |
| `backfill_traduzione_link.py` | Collega EN legacy agli IT corrispondenti |
| `qa_check.py` | QA automatica post-batch |
| `rollback_batch.py` | Annulla batch da log CSV |

### Lingue future

Spagnolo come seconda lingua dopo EN (570M parlanti, comunità cattolica latinoamericana). Esecuzione sequenziale: chiudere EN con QA verificata, poi `--target-lang es`. Costo aggiuntivo: €25-45.

---

## Tag

### Stato attuale

816 tag in Directus. Le route `src/pages/tag/[slug].astro` (IT) e `src/pages/en/tag/[slug].astro` (EN) esistono già nel repo. I tag non sono visualizzati nella pagina articolo (TAG-01 in backlog).

### Problema aperto: tag in EN

I tag non hanno versione EN. Nessun campo `label_en` esiste in Directus per la collection `tags`. Quando la ricerca EN e le pagine autore EN saranno operative, i tag EN diventeranno rilevanti. Da affrontare in F3 (schema translations Directus).

---

## Pagine verticali (VERT-01)

8 URL WordPress con contenuto editoriale specifico da replicare sul nuovo sito con lo stesso slug (per redirect 1:1 al cutover e link esterni già indicizzati).

### Stato pagine (aggiornato 2026-05-01)

| Slug IT | Slug EN | Directus ID | Stato | Note |
|---------|---------|-------------|-------|------|
| `mariangela-bertolini` | `mariangela-bertolini` | 2 | ✅ live | Prima pagina, con articoli e hero |
| `autismo` | `autism` | 3 | ✅ live | 8 articoli, hero `focus-cover-autismo.jpg` |
| `noi-papa-un-figlio-disabile` | `we-fathers-of-a-disabled-child` | 4 | ✅ live | 7 articoli, hero `focus-cover-noi-papa.jpg` |
| `aktion-t4-sterminio-persone-disabilita` | `aktion-t4-extermination-disabled-people` | 5 | ✅ live | 9 articoli, hero `focus-cover-aktiont4.jpg` |
| `speciale-cinema-e-disabilita` | `cinema-and-disability` | 6 | ✅ live | 6 articoli, hero `focus-cover-cinema-e-disabilita.jpg`. ⚠️ Slug diverso da WP (`/2019/speciale-cinema-e-disabilita/`) — verificare redirect 301 al cutover. |
| `ciao-stefano-di-franco` | `ciao-stefano-di-franco` | 7 | ✅ live | 8 articoli, hero video YouTube |
| `studiosi-educatori-e-attivisti-ombre-e-luci` | `scholars-educators-activists` | — | 🔴 da fare | Contenuto da WP — fornire testo e articoli |
| `catechesi-e-disabilita` | `catechesis-and-disability` | — | 🔴 da fare | Contenuto da WP — fornire testo e articoli |

**Listing:**
- `/it/focus/` → ✅ live (`FocusListingContent.astro`, commit `2d8cba4e`)
- `/en/focus/` → ✅ live (stesso componente, lang="en")

**Script di popolamento:** `scripts/create-verticali.py` — usato per creare le 5 nuove verticali via Directus REST API (2026-05-01). Riutilizzabile per le ultime 2 pagine.

DoD minimo: route pubblica su staging con slug identico, contenuto equivalente o redirect 301 documentato, meta title/description coerenti, nessun 404 su questi URL dopo cutover.

---

## Numeri rivista in EN (fase II)

Le pagine archivio legate ai numeri della rivista cartacea (landing, sommari) non sono nel perimetro della traduzione AI iniziale. Seguono in fase II, dopo completamento e stabilizzazione del corpus articoli EN. Scope, gate e modello dati da definire quando si apre la fase.

---

## Traduzioni AI — stato e regole

### Stato batch (aprile 2026)

Pipeline IT→EN completata aprile 2026. **3339 articoli** tradotti con Haiku, tutti pubblicati.
Quality gates superati (HTML valido ≥99.5%, link preservati 100%, collegamento IT↔EN 99.4%).
**42 articoli** (traduzioni manuali originali) hanno ancora slug con suffisso `-en`. Il suffisso è strutturalmente necessario: Directus ha un unico campo `slug` per tutta la tabella, tutti e 42 confliggono con l'omonimo articolo IT. Task SLUG-EN chiuso. La route EN usa lookup a due tentativi.

### Regole filologiche obbligatorie

Valgono per qualsiasi futura traduzione o editing degli articoli EN.

**Terminologia disabilità — non modernizzare mai:**

| Italiano originale | EN corretto | Non usare |
|---|---|---|
| spastico/a | spastic | person with spasticity |
| subnormale | subnormal | intellectually disabled |
| handicappato/a | handicapped | person with a disability |
| mongoloide | mongoloid | person with Down syndrome |
| ritardato/a | retarded | person with intellectual disability |

**Grammatica non standard — non correggere:**
Alcuni articoli sono scritti da bambini o persone con disabilità cognitiva. Preservare il livello di irregolarità grammaticale dell'originale. Non "riparare" la lingua.

### Modelli e workflow

- **Corpus base:** `claude-haiku-4-5-20251001` — costo ~€25-45 per IT→EN su corpus completo
- **Upgrade selettivo:** `claude-sonnet-4-6` per articoli prioritari post-lancio (qualità "rivista internazionale")
- **Secondo pass editoriale:** campionamento redazionale su articoli prioritari dopo lancio

### Fase II — pagine numeri rivista

Le landing dei numeri della rivista cartacea non rientrano nella traduzione AI iniziale. Da pianificare in fase II, dopo stabilizzazione corpus articoli EN. Scope e gate da definire quando si apre la fase.

---

## Didascalie foto articolo — campo `didascalia_copertina`

Campo Directus: `didascalia_copertina` (stringa, plain text o HTML).

**Supporto HTML attivo** (dal 2026-05-06): il campo è reso con `set:html` — la redazione può inserire HTML nella didascalia. Sia route IT (`/it/[slug].astro`) che EN (`/en/[slug].astro`) lo supportano.

### Esempi di utilizzo nel campo CMS

```html
Foto di <a href="https://example.com/fotografo">Mario Rossi</a> — CC BY 2.0
```

```html
© Archivio <em>Ombre e Luci</em> — tutti i diritti riservati
```

```html
Da sinistra: Giovanni, Maria e Luca durante il campo estivo di <a href="https://www.fedeeluce.it">Fede e Luce</a>
```

### Note
- Il campo accetta qualsiasi HTML, ma la redazione deve usare solo tag semplici: `<a>`, `<em>`, `<strong>`, `<br>`.
- Non inserire `<script>`, `<img>` o tag strutturali — il campo è accessibile solo a utenti CMS autenticati quindi non è un rischio XSS, ma per chiarezza visiva è meglio restare su markup minimale.
- I link nelle didascalie sono già stilizzati in `ArticlePageLayout.astro` (`.article-image-caption a`) con colore accent e underline.
