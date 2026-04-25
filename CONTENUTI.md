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

### Slug convention EN

Directus: `titolo-articolo-en` (suffisso `-en` nel DB).
URL pubblico: `/en/titolo-articolo/` (suffisso rimosso).
La route `en/[slug].astro` ricostruisce lo slug Directus aggiungendo `-en`.
Non cambiare questa convenzione senza script di migrazione sui 131 articoli esistenti.

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

### Decisione architetturale pendente (SEARCH-01)

Prima di qualsiasi lavoro sulla UX della ricerca, decidere l'architettura. Le opzioni:

**Opzione A — Prerender tutti gli articoli (tornare a output:static per le pagine articolo)**
- Pro: indice Pagefind completo, zero dipendenze esterne, funziona offline
- Contro: build ~10-15 minuti, cache invalidation più complessa, pagine sempre stale fino al prossimo build
- Nota: il sito era in questo stato fino a ARCH-04; il ritorno è tecnicamente semplice

**Opzione B — Algolia free tier (motore esterno)**
- Pro: ricerca full-text su tutto il corpus, faceting nativo, aggiornamento in tempo reale
- Contro: dipendenza esterna, sync pipeline da costruire (Directus → Algolia webhook), 10k records su free tier (sufficiente per 3527 articoli)
- Nota: richiede 1-2 giorni di setup

**Opzione C — Accettare la limitazione, migliorare solo UX**
- Pro: zero lavoro tecnico
- Contro: la ricerca non trova gli articoli — il difetto principale resta irrisolto
- Nota: non raccomandato come soluzione permanente

**Raccomandazione:** Opzione A se si vuole semplicità e zero dipendenze. Opzione B se si vuole ricerca di qualità con faceting e real-time. Opzione C non è una soluzione, è un rinvio.

La decisione deve essere presa e documentata qui prima di qualsiasi implementazione.

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

### Stato

Pipeline **completata** — 3470 articoli EN published in Directus (2026-04-25). I 131 EN originali (traduzione manuale da WP) restano invariati. Audit qualità da eseguire post-lancio: campionamento redazionale, verifica quality gates, backfill link IT↔EN sui nuovi articoli.

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

| Slug | Contenuto |
|------|-----------|
| `mariangela-bertolini` | Biografia fondatrice + articoli collegati |
| `ciao-stefano-di-franco` | Memorial Stefano Di Franco + articoli |
| `autismo` | Hub tematico autismo |
| `cinema-e-disabilita` | Hub tematico cinema e disabilità |
| `aktion-t4-sterminio-persone-disabilita` | Hub/dossier Operazione T4 |
| `studiosi-educatori-e-attivisti-ombre-e-luci` | Elenco collaboratori + link articoli |
| `catechesi-e-disabilita` | Hub tematico catechesi e disabilità |
| `noi-papa-un-figlio-disabile` | Raccolta "papà di un figlio con disabilità" |

DoD minimo: route pubblica su staging con slug identico, contenuto equivalente o redirect 301 documentato, meta title/description coerenti, nessun 404 su questi URL dopo cutover.

---

## Numeri rivista in EN (fase II)

Le pagine archivio legate ai numeri della rivista cartacea (landing, sommari) non sono nel perimetro della traduzione AI iniziale. Seguono in fase II, dopo completamento e stabilizzazione del corpus articoli EN. Scope, gate e modello dati da definire quando si apre la fase.
