# TRADUZIONI OEL — Piano Operativo IT → EN

> **Ultima revisione:** 2026-04-07 · owner: Claude/SegreteriaFL
> Documento autoritativo per la pipeline di traduzione. Se aggiornato qui, aggiorna anche il riferimento in PROGRESS.md.

---

## 1. Obiettivo

Tradurre l'intero corpus di articoli italiani di Ombre e Luci non ancora disponibili in inglese (~3265 articoli), rispettando filologicamente i testi originali, e collegare ogni versione EN alla versione IT tramite il campo `articolo_traduzione` in Directus.

---

## 2. Stato attuale

| Voce | Dato |
|------|------|
| Articoli IT totali | 3396 |
| Articoli EN già presenti | 131 (tradotti manualmente, probabilmente da WordPress) |
| Articoli IT senza traduzione EN | ~3265 (da verificare con audit esatto, vedi §6.1) |
| Campo di collegamento | `articolo_traduzione` (self-relation M2O su `articoli`) |
| Frontend pronto | ✅ `blog/[...slug].astro` gestisce IT+EN, `hreflang`, language switcher |
| Indice EN | ✅ `/blog/en` — `src/pages/blog/en.astro` |
| UI i18n | ✅ `src/utils/i18n.ts` — tutte le label chiave già tradotte IT/EN |
| Archival notice IT | ✅ `archival-alert` — comparisce per articoli ante 2000 |
| Archival notice EN | ✅ `archival-alert-en` — stessa logica, testo inglese |

---

## 3. Regola filologica — terminologia disabilità

**Regola assoluta: non censurare, non modernizzare.**

Ombre e Luci è un archivio vivo di 50 anni di pensiero sulla disabilità (1974–oggi). Il linguaggio è cambiato radicalmente: i termini degli anni '70-'80 riflettono la cultura dell'epoca e devono essere preservati in quanto testimonianza storica.

| Italiano originale | Traduzione EN corretta | ❌ NON usare |
|--------------------|------------------------|--------------|
| spastico/a | spastic | person with spasticity |
| subnormale | subnormal | intellectually disabled |
| handicappato/a | handicapped | person with a disability |
| mongoloide | mongoloid | person with Down syndrome |
| deficiente | deficient/defective | person with cognitive impairment |
| ritardato/a | retarded | person with intellectual disability |
| minorato/a | impaired/handicapped | person with a disability |

### Archival Language Notice

Già implementata in `blog/[...slug].astro` — si attiva per articoli EN dove `data_pubblicazione.year < 2000`:

```
"This archival content from [YEAR] reflects the language and sensitivities of its time."
```

**Eventuale affinamento futuro:** soglia anni adattabile (es. < 1990, < 1995, < 2000), oppure campo booleano `has_archival_language` in Directus settabile manualmente dalla redazione per casi ambigui.

---

## 4. Architettura tecnica

### 4.1 Struttura dati (già pronta)

```
articoli (Directus collection)
├── id
├── lang: 'it' | 'en'
├── slug                      — DEVE essere unico nel DB
├── titolo
├── sottotitolo
├── corpo                     — HTML
├── seo_description
├── stato: 'published' | 'draft'
├── data_pubblicazione
├── autore → autori.id        — stessa relazione dell'IT
├── numero_rivista → ...      — stessa relazione dell'IT
├── immagine_copertina → ...  — stessa relazione dell'IT
└── articolo_traduzione → articoli.id   ← COLLEGAMENTO IT↔EN
```

### 4.2 Slug convention per nuove traduzioni

Formula: **`{slug-italiano}-en`**

Esempi:
- IT: `la-storia-di-maria` → EN: `la-storia-di-maria-en`
- IT: `disabilita-e-fede` → EN: `disabilita-e-fede-en`

Rationale: predictable, mai in collisione con slug IT, facile da debuggare.
I 131 articoli EN esistenti (da WordPress) mantengono i loro slug originali — nessun cambio.

### 4.3 Collegamento bidirezionale

```
IT articolo.articolo_traduzione → EN articolo.id
EN articolo.articolo_traduzione → IT articolo.id
```

Entrambe le direzioni devono essere settate dallo script. Senza bidirezionalità, il language switcher non funziona da EN → IT.

---

## 5. System prompt per Claude Haiku

```
You are a professional translator for Ombre e Luci, an Italian Catholic magazine about 
disability, faith, and human dignity, published since 1974.

CRITICAL TRANSLATION RULES:

1. Translate faithfully from Italian to English, preserving the author's voice, style,
   and the cultural context of the era in which the article was written.

2. NEVER modernize, soften, or censor disability terminology. Preserve period-accurate 
   terms exactly as the author wrote them:
   - "spastico/a" → "spastic"
   - "subnormale" → "subnormal"
   - "handicappato/a" → "handicapped"
   - "mongoloide" → "mongoloid"
   - "deficiente" → "deficient"
   - "ritardato/a" → "retarded"
   These are historical documents that bear witness to the evolution of language and 
   thought on disability. Censoring them would betray the archival mission of the magazine.

3. Preserve ALL HTML tags exactly as-is. Only translate the text content between tags.
   Never add, remove, or modify any HTML element or attribute.

4. Preserve untranslated proper names and institutions:
   - "Fede e Luce" (movement name — do not translate)
   - "Ombre e Luci" (magazine name — do not translate)
   - Italian city names, person names
   - "don/padre/suor" titles

5. Theological terms: translate standard Catholic vocabulary faithfully
   (es. "misericordia" → "mercy", "carisma" → "charism").

6. Output ONLY the translated text/HTML. No explanations, no comments, no preamble.
```

---

## 6. Pipeline operativa

### 6.1 Fase 0 — Audit gap (prima di lanciare lo script)

```bash
# Conta articoli IT senza articolo_traduzione
curl -s "https://cms.ombreeluci.it/items/articoli?\
filter[lang][_eq]=it&\
filter[stato][_eq]=published&\
filter[articolo_traduzione][_null]=true&\
aggregate[count]=id" \
-H "Authorization: Bearer $DIRECTUS_TOKEN"
```

Output atteso: ~3265 articoli. Questo numero è il costo reale della pipeline.

### 6.2 Script di traduzione

Posizione: `scripts/traduzione/translate_articles.py`

**Logica:**

```python
for each IT articolo where articolo_traduzione is null:
    1. fetch corpo, titolo, sottotitolo, seo_description
    2. translate each non-empty field via Claude Haiku (separate calls per campo)
    3. POST /items/articoli  → crea EN record (lang='en', slug=it_slug+'-en', stato='draft')
    4. PATCH /items/articoli/{it_id}  → imposta articolo_traduzione = en_id
    5. PATCH /items/articoli/{en_id}  → imposta articolo_traduzione = it_id
    6. log {it_id, it_slug, en_id, status} in CSV checkpoint
    7. sleep 0.2s (rate limit)
```

**Checkpoint/resume:** script legge il CSV di log all'avvio e salta gli articoli già processati.

**Dry-run mode:** `--dry-run` stampa il piano senza scrivere nulla in Directus.

**Parallelismo:** per abbassare i tempi, si può usare `concurrent.futures.ThreadPoolExecutor(max_workers=5)` — Haiku regge bene il parallelismo.

### 6.3 Fase 2 — Review redazionale

Articoli EN creati con `stato='draft'` → redazione approva e pubblica in Directus.
Per velocizzare: approvazione massiva via `PATCH /items/articoli?filter[lang][_eq]=en&filter[stato][_eq]=draft` con `{"stato":"published"}` dopo spot-check.

### 6.4 Fase 3 — Backfill 131 EN esistenti

I 131 articoli EN già in Directus potrebbero mancare del collegamento bidirezionale.
Script separato: `scripts/traduzione/backfill_traduzione_link.py`
Logica: cerca coppie IT↔EN con stesso `wp_id`, imposta `articolo_traduzione` su entrambi.

---

## 7. Stima costi (Claude Haiku)

**Modello:** `claude-haiku-4-5-20251001`
**Pricing:** input $0.80/M token · output $4.00/M token

| Scenario | Corpo medio | Input/art | Output/art | Totale |
|----------|-------------|-----------|------------|--------|
| Articoli brevi (500 parole) | ~800 token | 1200 token | 800 token | **~€13** |
| Articoli medi (1200 parole) | ~1800 token | 2250 token | 1600 token | **~€27** |
| Articoli lunghi (2500 parole) | ~3800 token | 4250 token | 3200 token | **~€56** |

Input include: corpo + titolo + sottotitolo + seo_description + system prompt (~400 token).
Il corpus di OEL è misto: articoli brevi (testimonianze, lettere) e lunghi (saggi, reportage).
**Stima realistica: €25–50** per 3265 articoli.

Per avere il numero esatto: `scripts/traduzione/estimate_tokens.py` — conta i token dell'intero corpus prima di tradurre.

**Tempi:**
- Single-threaded: ~3265 art × 3 call × 1s = ~3h
- 5 thread paralleli: ~35 min
- 10 thread paralleli: ~18 min

---

## 8. SEO — Checklist pre-lancio traduzioni

- [ ] `sitemap.xml.ts` include articoli EN (verificare che `lang='en'` non sia filtrato)
- [ ] `hreflang` generato correttamente in `BaseHead.astro` quando `alternates` è popolato
- [ ] `articolo_traduzione` bidirezionale su tutti gli articoli EN post-traduzione
- [ ] Smoke test: aprire 5 articoli EN → verificare language switcher IT→EN→IT funziona
- [ ] `blog/en.astro` migrato ad `ArticoliRullo` con `pageSize={24}` (131+ articoli)

---

## 9. Ordine di esecuzione raccomandato

```
1. [Dev]        Audit gap: esegui query §6.1 → conferma numero articoli da tradurre
2. [Dev]        estimate_tokens.py → costo preciso in €
3. [Dev]        Prepara script translate_articles.py (dry-run first)
4. [Redazione]  Conferma: stato='draft' o 'published' direttamente?
5. [Dev]        Lancio batch su 50 articoli → spot-check qualità traduzione
6. [Redazione]  Approva qualità → verde per lancio completo
7. [Dev]        Lancio completo (parallelismo ×5/×10)
8. [Dev]        Backfill backfill_traduzione_link.py per i 131 EN esistenti
9. [Dev]        Verifica SEO: sitemap, hreflang, smoke test
10. [Redazione] Review batch EN in Directus e pubblica
```

---

## 10. Riferimenti nel codebase

| File | Cosa fa |
|------|---------|
| `src/pages/blog/[...slug].astro` | Gestisce IT+EN, `hreflang`, `archival-alert-en`, language switcher |
| `src/pages/blog/en.astro` | Indice articoli EN (`/blog/en`) |
| `src/utils/i18n.ts` | Dizionario UI it/en |
| `src/lib/directus.ts` | Interfaccia `ArticoloFull` — campo `articolo_traduzione` |
| `PROGRESS.md` | Task `I18N-01` (UI i18n) e `DA-06` (pipeline traduzione) |
| `scripts/traduzione/` | Scripts da creare (non ancora esistono) |
