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

### Bio autori multilingua — ✅ completato (BIO-EN, 2026-05-07)

**Stato:** 79 bio autori tradotte IT→EN con Claude Haiku. Campo `bio_en` popolato su tutti gli autori che hanno una bio IT.

**Come funziona:**
- Campo `bio_en` (text, nullable) nella collection `autori` di Directus.
- `en/[slug].astro` riga 165: `const authorBioHtml = autore?.bio_en?.trim() || autore?.bio_html?.trim()` — bio EN se presente, fallback a bio IT.
- `AuthorPageContent.astro` riga 22: stessa logica per le pagine autore EN.
- Le pagine autore sono SSG: il rebuild propagato al push popola le bio EN su staging.

**Script:** `scripts/traduzione/translate-bio.mjs` — idempotente, rilancabile, log CSV in `scripts/traduzione/logs/`.
**Log run:** `scripts/traduzione/logs/translate-bio-2026-05-07T17-03-32.csv` — 79/79 ok, 0 errori.

**Autori con bio IT ma senza foto** (bio mostrata, avatar con iniziale): Adriana Duci, Antonello Damiani, Cristina Marchese, Gianluigi Visentini, Mariano S. Pergola, Maurizio Pilone.

**3 autori senza bio** (nessun testo, solo link articoli): Marta Tersigni, P. Noel Simard, Vittorio Paoli.

**F3 — Modello dati Directus multilingua** (post-lancio, invariato): schema translations per bio, label UI, descrizioni categorie. Per ora la soluzione con campi separati (`bio_en`) è sufficiente.

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

## Traduzione manuale assistita — TRANS-FLOW-01 (2026-05-07)

Per nuovi articoli che richiedono qualità editoriale superiore alla pipeline Haiku, o per articoli pubblicati post-lancio senza versione EN.

### Flusso

```
scripts/export-per-traduzione.mjs --slug {slug}
  → exports/article-{slug}-en.json
      (_meta / _copy_invariant / _translate / _prompt)
  → incollare in Claude web
  → JSON tradotto
  → incollare in campo json_traduzione dell'articolo IT in Directus
  → Flow Directus crea EN draft + link bidirezionale IT↔EN
  → redazione verifica e pubblica
```

### Campi tradotti dal flusso

`titolo`, `sottotitolo`, `seo_title`, `seo_description`, `didascalia_copertina`, `corpo`.

### Campi copiati invariati

`categoria_menu` (invariante assoluta), `forma`, `tema_label`, `ruolo_editoriale`, `immagine_copertina`, `autore`, `numero_rivista`, `data_pubblicazione`, `temi`, `tags`.

### Stato implementazione

| Componente | Stato |
|---|---|
| Script CLI `scripts/export-per-traduzione.mjs` | ✅ pronto |
| Campo `json_traduzione` in Directus | 🔴 da creare manualmente (istruzioni in `docs/TRANS-FLOW-01-setup.md`) |
| Flow Directus import | 🔴 da configurare manualmente (istruzioni in `docs/TRANS-FLOW-01-setup.md`) |

### Regole filologiche

Valgono le stesse regole della pipeline AI (sezione "Regole filologiche obbligatorie" sopra). Il campo `_prompt` nel JSON le include già — la redazione non deve ricordarle separatamente.

---

## Didascalie foto articolo — campo `didascalia_copertina`

Campo Directus: `didascalia_copertina` (tipo `text`, plain text o HTML, lunghezza illimitata). Originariamente `varchar(255)` — ampliato a `text` il 2026-05-06 per supportare URL lunghi (es. link Unsplash con parametri UTM).

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

---

## Placeholder immagini copertina — `src/utils/placeholder.ts`

Quando un articolo non ha `immagine_copertina`, viene mostrata un'immagine placeholder da `public/placeholder/`. La logica è in `src/utils/placeholder.ts`.

### Pool disponibili

**COLOR** (8 foto) — articoli dal 1998 in poi senza immagine:
- `ph-1/2/3.webp` — Steve Johnson su Unsplash
- `ph-4.webp` — vackground.com su Unsplash
- `dennis-van-lith-rD1_nrA5_1U-unsplash.webp` — Dennis van Lith
- `jr-korpa-WKK4yIc3JBM-unsplash.webp` — Jr Korpa
- `martin-martz-W0EaIFjAck4-unsplash.webp` — Martin Martz
- `niko-n-_FJNAM5B0p0-unsplash.webp` — Niko N.

**BW** (14 foto B&N) — articoli anteriori al 1998 senza immagine:
- `ph-bw-fia-yang-*.webp` — Fia Yang (×2)
- `ph-bw-everett-beaupit-*.webp` — Everett Beaupit
- `ph-bw-hilda-rytteke-*.webp` — Hilda Rytteke
- `ph-bw-jan-huber-*.webp` — Jan Huber
- `ph-bw-kseniya-lapteva-*.webp` — Kseniya Lapteva
- `ph-bw-mahdi-bafande-*.webp` — Mahdi Bafande
- `ph-bw-xander-ashwell-*.webp` — Xander Ashwell
- `caio-brigagao-lunardi-*.webp`, `james-trenda-*.webp`, `jr-korpa-GQeSfSWmXvI-*.webp`, `jr-korpa-PY6OnoitYfY-*.webp`, `kate-trysh-*.webp`, `thomas-lindner-*.webp`

### Selezione
La foto è deterministica: `hash(slug) % pool.length` — ogni articolo ha sempre la stessa placeholder.

### Attribution
Ogni placeholder ha attribution HTML con link al fotografo e alla foto su Unsplash (UTM `utm_source=ombreeluci&utm_medium=referral`). La caption appare automaticamente se `didascalia_copertina` è vuoto; se la redazione riempie il campo in Directus, quello ha la precedenza.

### Aggiungere nuove foto
1. Metti il file JPG/PNG in `public/placeholder/` con nome Unsplash standard (`{username}-{photoId}-unsplash.jpg`)
2. Per B&N aggiungi prefisso `ph-bw-` al nome
3. Esegui `node scripts/optimize-placeholders.mjs` — genera il `.webp` ottimizzato (<150KB)
4. Aggiungi l'entry manualmente in `src/utils/placeholder.ts` nel pool giusto (COLOR o BW)

---

## Didascalie foto — traduzione EN (DID-EN)

**Stato:** campo `didascalia_en` non ancora creato in Directus. Script pronto ma bloccato dal prerequisito.

### Prerequisiti (in ordine)

1. **Creare campo `didascalia_en` in Directus** (manuale — non automatizzabile):
   Impostazioni → Modello dati → articoli → Aggiungi campo → Tipo: Textarea, Nome: `didascalia_en`

2. **Aggiornare `en/[slug].astro`** per leggere `didascalia_en` con fallback su `didascalia_copertina`:
   ```ts
   const caption = article.didascalia_en?.trim() || article.didascalia_copertina || null;
   ```
   Aggiungere `didascalia_en` ai `fields` nella query Directus della route EN.

3. **Eseguire lo script di traduzione**:
   ```bash
   node scripts/traduzione/translate-didascalie.mjs --dry-run   # verifica
   node scripts/traduzione/translate-didascalie.mjs             # ~29 minuti, ~3470 record
   node scripts/traduzione/translate-didascalie.mjs --resume    # riprendi se interrotto
   ```

### Architettura campo

| Campo | Collection | Tipo | Note |
|---|---|---|---|
| `didascalia_copertina` | `articoli` | text, HTML | Campo IT, già esistente. Reso con `set:html`. |
| `didascalia_en` | `articoli` | text, HTML | Campo EN, da creare. Stessa logica di rendering. |

### Script `translate-didascalie.mjs`

- Legge articoli EN con `didascalia_copertina` non nulla e `didascalia_en` vuota
- Traduce con Claude Haiku (`claude-haiku-4-5-20251001`)
- Converte automaticamente "Foto di X su Unsplash" → "Photo by X on Unsplash"
- 2 worker paralleli, 1 req/sec ciascuno
- Checkpoint ogni 100 record: `scripts/traduzione/logs/translate-didascalie-checkpoint.json`
- Idempotente: rilancio sicuro, salta i record già tradotti

---

## Pagina Studiosi, Educatori e Attivisti — ✅ completato (2026-05-07)

Pagina editoriale con lista curata di 47 autori storici della rivista che hanno contribuito in qualità di studiosi, educatori o attivisti per i diritti delle persone con disabilità.

### Route

| Lingua | URL | File |
|---|---|---|
| IT | `/it/studiosi-educatori-attivisti/` | `src/pages/it/studiosi-educatori-attivisti/index.astro` |
| EN | `/en/scholars-educators-activists/` | `src/pages/en/scholars-educators-activists/index.astro` |
| Redirect WP | `/studiosi-educatori-e-attivisti-ombre-e-luci` | `astro.config.mjs` redirects |

### Componente condiviso

`src/components/StudosiContent.astro` — props: `lang: Locale`, `autori: Autore[]`.

Mostra per ogni autore: foto circolare (con fallback iniziale nome), nome linkato alla pagina autore, bio nella lingua corretta (`bio_en` su EN, `bio_html` su IT), link "Visualizza tutti gli articoli" con conteggio se disponibile.

### Lista curata

`src/data/studiosi.json` — array di 47 slug in ordine alfabetico. Fonte editoriale unica. Per aggiungere/rimuovere un autore: modificare il JSON, nessun altro file da toccare.

**3 autori senza bio** (mancano in Directus): `marta-tersigni`, `p-noel-simard`, `vittorio-paoli` — mostrano solo il link articoli, come sull'originale WP.

### Fetch dati

Le pagine sono SSG. Entrambe chiamano `getAllAutori()` da `src/lib/directus.ts` e filtrano/ordinano in base a `studiosi.json`. `getAllAutori()` include già `bio_en`, quindi le bio EN sono live senza modifiche.

### Aggiungere un autore alla lista

1. Trovare lo slug in Directus: `GET /items/autori?filter[nome_completo][_contains]=Nome&fields=slug`
2. Aggiungere lo slug in `src/data/studiosi.json` nella posizione alfabetica corretta
3. Rebuild (push su main) — la pagina si aggiorna automaticamente
