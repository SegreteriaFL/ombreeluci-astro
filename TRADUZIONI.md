# TRADUZIONI OEL — Piano Operativo IT → EN

> **Ultima revisione:** 2026-04-07 · owner: Claude/SegreteriaFL
> Documento autoritativo per la pipeline di traduzione.
> Riferimento in PROGRESS.md → task `DA-06`.

---

## 1. Obiettivo

Tradurre l'intero corpus italiano di Ombre e Luci non ancora disponibile in inglese (~3265 articoli) con Claude Haiku, rispettando filologicamente i testi originali, e collegare ogni versione EN alla IT tramite `articolo_traduzione` (bidirezionale).

---

## 2. Stato attuale

| Voce | Dato |
|------|------|
| Articoli IT pubblicati | 3396 |
| Articoli EN già presenti | 131 (tradotti manualmente, da WP) |
| Articoli IT senza EN | ~3265 (audit esatto: vedi §7.1) |
| Campo collegamento | `articolo_traduzione` (self-relation M2O su `articoli`) |
| Frontend | ✅ pronto — `hreflang`, language switcher, `archival-alert-en` |
| Indice EN | ✅ `/blog/en` — `src/pages/blog/en.astro` |
| UI i18n | ✅ `src/utils/i18n.ts` — label chiave IT/EN presenti |
| Script | ❌ da creare (`scripts/traduzione/`) |

---

## 3. Regole filologiche — OBBLIGATORIE (approvazione editoriale richiesta)

> ⚠️ Le regole §3.1 e §3.2 devono essere approvate formalmente dalla direzione editoriale
> prima del lancio del pilot. Non è una decisione tecnica.

### 3.1 Terminologia disabilità — non modernizzare mai

Ombre e Luci è un archivio di 50 anni di pensiero sulla disabilità (1974–oggi). Il linguaggio è cambiato radicalmente e questi termini devono essere preservati come testimonianza storica.

| Italiano originale | Traduzione EN corretta | ❌ NON usare |
|--------------------|------------------------|--------------|
| spastico/a | spastic | person with spasticity |
| subnormale | subnormal | intellectually disabled |
| handicappato/a | handicapped | person with a disability |
| mongoloide | mongoloid | person with Down syndrome |
| deficiente | deficient / defective | cognitively impaired |
| ritardato/a | retarded | person with intellectual disability |
| minorato/a | impaired / handicapped | person with a disability |

Il frontend mostra già `archival-alert-en` per articoli EN con `data_pubblicazione.year < 2000`:
> *"This archival content from [YEAR] reflects the language and sensitivities of its time."*

### 3.2 Grammatica e sintassi non standard — non iper-correggere

Alcuni articoli sono scritti da bambini o da persone con disabilità cognitiva o comunicativa. Il testo può presentare:
- frasi incomplete o senza verbo
- sintassi semplificata o non convenzionale
- punteggiatura assente o ripetuta
- ripetizioni deliberate
- costrutti infantili ("e poi... e poi... e poi...")

**Regola:** tradurre preservando lo stesso livello di informalità, semplicità o irregolarità grammaticale. Non "riparare" la lingua per renderla più standard.

Come si riconosce: l'autore è spesso indicato come "un ragazzo di X anni", "la redazione del gruppo Y", o il testo stesso denuncia stile non adulto. Lo script non può rilevarlo automaticamente — è una regola che vale nel prompt Haiku e nella review redazionale.

**Nel system prompt Haiku:**
> *"If the Italian text contains grammatically irregular constructions, simplified syntax, incomplete sentences, or childlike language patterns, preserve the same level of linguistic simplicity and irregularity in the English translation. Do not silently correct grammar or 'improve' the style. The imperfection is part of the original author's voice."*

---

## 4. Architettura dati (già pronta in Directus)

```
articoli
├── id, lang ('it'|'en'), slug (UNIQUE nel DB)
├── titolo, sottotitolo, corpo (HTML), seo_description
├── stato ('published'|'draft')
├── data_pubblicazione, autore→, numero_rivista→, immagine_copertina→
└── articolo_traduzione → articoli.id   ← collegamento IT↔EN (bidirezionale)
```

### 4.1 Slug convention per nuove traduzioni EN

**Formula: `{slug-italiano}-en`**

| IT slug | EN slug |
|---------|---------|
| `la-storia-di-maria` | `la-storia-di-maria-en` |
| `disabilita-e-fede-2` | `disabilita-e-fede-2-en` |

I 131 EN legacy (da WordPress) mantengono i loro slug originali — nessun cambio.

### 4.2 Matching IT↔EN per i 131 EN esistenti

Priorità di matching (in ordine):
1. `wp_id` identico su IT e EN → collegamento certo
2. Stesso `titolo` normalizzato (lowercase, accenti rimossi) → probabile
3. Stessa `data_pubblicazione` + stesso `autore` → possibile, richiede review manuale

Il `backfill_traduzione_link.py` usa questa cascata e logga i casi ambigui per review.

### 4.3 Collegamento bidirezionale

Lo script imposta **entrambe** le direzioni:
```
PATCH /items/articoli/{it_id}  →  { articolo_traduzione: en_id }
PATCH /items/articoli/{en_id}  →  { articolo_traduzione: it_id }
```
Senza bidirezionalità il language switcher non funziona da EN → IT.

---

## 5. System prompt Haiku (v2 — production)

```
You are a professional translator for Ombre e Luci, an Italian Catholic magazine about
disability, faith, and human dignity, published since 1974.

=== CRITICAL TRANSLATION RULES ===

1. FAITHFUL VOICE: Translate accurately from Italian to English, preserving the author's
   voice, style, and the cultural context of the era.

2. DISABILITY TERMINOLOGY — NEVER MODERNIZE:
   Preserve period-accurate disability terms exactly as written:
   "spastico/a" → "spastic" | "subnormale" → "subnormal"
   "handicappato/a" → "handicapped" | "mongoloide" → "mongoloid"
   "deficiente" → "deficient" | "ritardato/a" → "retarded"
   These are archival documents. Censoring them would betray the magazine's mission.

3. IRREGULAR GRAMMAR — DO NOT CORRECT:
   If the Italian contains grammatically irregular constructions, simplified syntax,
   incomplete sentences, or childlike language (articles written by children or people
   with cognitive disabilities), preserve the same level of linguistic irregularity in
   English. Do not silently correct or improve the style.

4. HTML TAGS — PRESERVE EXACTLY:
   Only translate text nodes. Never add, remove, or modify any HTML tag or attribute.
   Preserve: <p>, <strong>, <em>, <a href="...">, <img>, <blockquote>, etc. unchanged.

5. PROPER NAMES — DO NOT TRANSLATE:
   "Fede e Luce" (movement), "Ombre e Luci" (magazine), Italian city/person names,
   "don/padre/suor" titles, Italian institutional names.

6. THEOLOGICAL TERMS: translate standard Catholic vocabulary faithfully
   ("misericordia" → "mercy", "carisma" → "charism", "testimonianza" → "testimony").

7. OUTPUT: return ONLY the translated content. No explanations. No preamble. No comments.
```

---

## 6. Definition of Done — metriche oggettive

Il batch è considerato completato quando:

| Metrica | Soglia |
|---------|--------|
| % articoli IT con EN collegato bidirezionale | ≥ 99% |
| % EN con `hreflang` corretto (verifica script) | ≥ 99% |
| Errori batch (eccezioni non recuperate) | ≤ 1% (max ~33 su 3265) |
| QA HTML: tag principali preservati | 100% (zero articoli con HTML rotto) |
| Lunghezza EN ≥ 30% lunghezza IT | 100% (sanity check anti-truncation) |
| Smoke test manuale: 10 articoli campione | 100% superati |

---

## 7. Pipeline operativa in 10 step

### Step 1 — Audit gap
```bash
curl -s "https://cms.ombreeluci.it/items/articoli?\
filter[lang][_eq]=it&filter[stato][_eq]=published&\
filter[articolo_traduzione][_null]=true&aggregate[count]=id" \
-H "Authorization: Bearer $DIRECTUS_TOKEN"
```
Output: numero esatto di articoli da tradurre.

### Step 2 — Stima costi
```bash
cd scripts/traduzione && python estimate_tokens.py
```
Legge corpus da Directus, conta token, stampa costo stimato in € prima di spendere nulla.

### Step 3 — Approvazione editoriale
Condividere §3 (regole filologiche) con direzione editoriale. Verde esplicito prima del pilot.

### Step 4 — Dry-run su 10 articoli
```bash
python translate_articles.py --dry-run --limit 10
```
Mostra titoli e prime righe della traduzione senza scrivere nulla in Directus.

### Step 5 — Pilot su 50 articoli (stato=draft)
```bash
python translate_articles.py --limit 50 --stato draft --job-id pilot-01
```
Crea 50 EN in stato `draft`. Redazione fa spot-check qualità.

### Step 6 — Approvazione qualità
Redazione apre 10-15 articoli EN in Directus → verifica fedeltà, terminologia, HTML.
Verde esplicito prima del lancio completo.

### Step 7 — Lancio completo
```bash
python translate_articles.py --workers 5 --stato draft --job-id batch-2026-04
```
5 thread paralleli, checkpoint/resume automatico, log dettagliato in `logs/`.

### Step 8 — Backfill 131 EN esistenti
```bash
python backfill_traduzione_link.py --dry-run
python backfill_traduzione_link.py
```
Collega i 131 EN legacy alle loro controparti IT. Log dei casi ambigui per review manuale.

### Step 9 — Verifica SEO
```bash
python verify_hreflang.py  # da creare
```
Verifica che ogni EN abbia `articolo_traduzione → IT` e che il frontend generi `hreflang` corretto.
Verifica `sitemap.xml.ts`: articoli EN inclusi (verificare che `lang='en'` non sia filtrato).

### Step 10 — Pubblicazione massiva EN
Dopo review redazionale:
```bash
# Pubblica tutti i draft EN del batch
curl -X PATCH "https://cms.ombreeluci.it/items/articoli" \
  -H "Authorization: Bearer $DIRECTUS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":{"filter":{"lang":{"_eq":"en"},"stato":{"_eq":"draft"},"_and":[{"_meta":{"job_id":{"_eq":"batch-2026-04"}}}]}},"data":{"stato":"published"}}'
```

---

## 8. Stima costi dettagliata

**Modello:** `claude-haiku-4-5-20251001`
**Pricing:** input $0.80/M token · output $4.00/M token

Distribuzione stimata articoli OEL (50 anni di rivista):
- 40% brevi (lettere, testimonianze brevi): corpo ~600 tok
- 40% medi (articoli standard): corpo ~1800 tok
- 20% lunghi (saggi, reportage): corpo ~4000 tok
- Media ponderata corpo: **~1680 token**

Per articolo:
| Campo | Input token | Output token |
|-------|-------------|--------------|
| System prompt | 450 | — |
| titolo + sottotitolo + seo | 150 | 120 |
| corpo HTML | 1680 | 1680 |
| **Totale per articolo** | **2280** | **1800** |

Per 3265 articoli (+ 5% buffer retry):
- Input: 3265 × 2280 × 1.05 = **7.81M token → $6.25**
- Output: 3265 × 1800 × 1.05 = **6.17M token → $24.67**
- **Totale stimato: ~$31 ≈ €29**

Range realistico considerando varianza lunghezza: **€20–55**
(dipende dalla % di articoli lunghi nel corpus reale — `estimate_tokens.py` darà il numero esatto)

**Tempi con `--workers 5`:** ~3265 art × 2s/art ÷ 5 worker = **~22 minuti**

---

## 9. Piano rollback

Ogni batch ha un `job_id` (es. `batch-2026-04`). In caso di batch difettoso:

```bash
# Rollback: elimina EN del batch e rimuove i link dagli IT
python rollback_batch.py --job-id batch-2026-04 --dry-run
python rollback_batch.py --job-id batch-2026-04
```

Lo script:
1. Legge `logs/batch-2026-04.csv` → recupera `(it_id, en_id)` di ogni record creato
2. `PATCH /items/articoli/{it_id}` → `{ articolo_traduzione: null }`
3. `DELETE /items/articoli/{en_id}` → elimina l'EN

Stato `draft` garantisce che nulla sia visibile agli utenti fino alla pubblicazione esplicita.

---

## 10. QA automatica post-traduzione

`scripts/traduzione/qa_check.py` verifica ogni EN creato:

| Check | Come |
|-------|------|
| HTML non rotto | `BeautifulSoup.find_all()` — stessa struttura tag-level |
| Link `<a href>` invariati | confronto href originale vs. tradotto |
| Lunghezza EN ≥ 30% IT | `len(corpo_en) >= len(corpo_it) * 0.3` |
| Nessun testo italiano residuo | heuristic: < 5% parole italiane comuni |
| `articolo_traduzione` bidirezionale | API check su entrambi gli ID |

Output: `logs/qa-{job_id}.csv` con flag per ogni articolo.

---

## 11. Tracciamento batch

Ogni run dello script scrive in `logs/{job_id}.csv`:

```csv
job_id,it_id,it_slug,en_id,en_slug,status,error,input_tokens,output_tokens,cost_usd,timestamp
batch-2026-04,12345,la-storia-di-maria,67890,la-storia-di-maria-en,ok,,2180,1820,0.0083,2026-04-07T14:23:11
```

Permette di: riprendere dopo interruzione, calcolare costo reale effettivo, fare rollback selettivo.

---

## 12. Riferimenti codebase

| File | Cosa fa |
|------|---------|
| `src/pages/blog/[...slug].astro` | IT+EN, hreflang, archival-alert-en, language switcher |
| `src/pages/blog/en.astro` | Indice `/blog/en` — da migrare ad ArticoliRullo (backlog) |
| `src/utils/i18n.ts` | Dizionario UI it/en |
| `src/lib/directus.ts` | `ArticoloFull.articolo_traduzione` |
| `PROGRESS.md` | Task `DA-06` con link a questo file |
| `scripts/traduzione/` | Scripts (da creare — §7) |
