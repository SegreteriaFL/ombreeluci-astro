# TRADUZIONI OEL — Piano Operativo IT → EN

> **Ultima revisione:** 2026-04-07 · owner: Claude/SegreteriaFL
> Documento autoritativo per la pipeline di traduzione.
> Riferimento in PROGRESS.md → task `DA-06`.

---

## 1. Obiettivo

Tradurre l'intero corpus italiano di Ombre e Luci non ancora disponibile in inglese
(~3265 articoli) con Claude Haiku, rispettando filologicamente i testi originali,
e collegare ogni versione EN alla IT tramite `articolo_traduzione` (bidirezionale).

---

## 2. Stato attuale

| Voce | Dato |
|------|------|
| Articoli IT pubblicati | 3396 |
| Articoli EN già presenti | 131 (tradotti manualmente da WP) |
| Articoli IT senza EN | ~3265 (audit esatto: §8 Step 1) |
| Campo collegamento | `articolo_traduzione` (self-relation M2O su `articoli`) |
| Frontend | ✅ pronto — `hreflang`, language switcher, `archival-alert-en` |
| Indice EN | ✅ `/blog/en` — `src/pages/blog/en.astro` |
| UI i18n | ✅ `src/utils/i18n.ts` — label chiave IT/EN presenti |
| Script traduzione | ✅ `scripts/traduzione/translate_articles.py` |
| Script stima costi | ✅ `scripts/traduzione/estimate_tokens.py` |
| Script backfill link | ✅ `scripts/traduzione/backfill_traduzione_link.py` |
| Script rollback | ✅ `scripts/traduzione/rollback_batch.py` |
| Script QA | ✅ `scripts/traduzione/qa_check.py` |

---

## 3. Regole filologiche — OBBLIGATORIE

> ⚠️ Le regole §3.1 e §3.2 devono essere approvate formalmente dalla direzione
> editoriale prima del lancio del pilot. Non è una decisione tecnica.

### 3.1 Terminologia disabilità — non modernizzare mai

| Italiano originale | Traduzione EN corretta | ❌ NON usare |
|--------------------|------------------------|--------------|
| spastico/a | spastic | person with spasticity |
| subnormale | subnormal | intellectually disabled |
| handicappato/a | handicapped | person with a disability |
| mongoloide | mongoloid | person with Down syndrome |
| deficiente | deficient / defective | cognitively impaired |
| ritardato/a | retarded | person with intellectual disability |
| minorato/a | impaired / handicapped | person with a disability |

Il frontend mostra già `archival-alert-en` per articoli EN con anno < 2000:
> *"This archival content from [YEAR] reflects the language and sensitivities of its time."*

### 3.2 Grammatica e sintassi non standard — non iper-correggere

Alcuni articoli sono scritti da bambini o da persone con disabilità cognitiva o
comunicativa. Il testo può presentare frasi incomplete, sintassi semplificata,
punteggiatura assente, ripetizioni deliberate, costrutti infantili.

**Regola:** tradurre preservando lo stesso livello di irregolarità grammaticale.
Non "riparare" la lingua per renderla più standard. L'imperfezione è parte
della voce originale dell'autore.

**Criterio documentato "quando preservare vs annotare":**
- Preservare integralmente: qualsiasi irregolarità chiaramente stilistica/intenzionale
- Annotare per review: solo se l'irregolarità causa ambiguità semantica grave
  (impossibile capire il senso anche in italiano)

Il system prompt Haiku include questa istruzione esplicitamente.

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

I 131 EN legacy (da WordPress) mantengono i loro slug originali.

### 4.2 Matching IT↔EN per i 131 EN esistenti (backfill)

Priorità a cascata con **soglia confidence**:

| Livello | Metodo | Azione |
|---------|--------|--------|
| Certo | stesso `wp_id` | auto-link |
| Probabile | titolo normalizzato identico, UN solo match | auto-link |
| Ambiguo | titolo normalizzato con più candidate | log `AMBIGUOUS` → review manuale |
| Ambiguo | stessa data+autore, più candidate | log `AMBIGUOUS` → review manuale |
| Nessuno | nessun match | log `NO_MATCH` → review manuale |

**Mai auto-linkare quando il match non è inequivoco.**

---

## 5. Architettura dello script — decisioni chiave

### 5.1 Una sola chiamata API per articolo

Lo script invia tutti i campi (titolo, sottotitolo, seo, corpo) in un'unica
richiesta strutturata con delimiter testuali (`===TITOLO===` ecc.), non JSON.

**Perché non JSON:** l'HTML nel corpo può contenere virgolette, backslash e
caratteri speciali che invalidano silenziosamente il JSON.
I delimiter testuali sono deterministici e non ambigui.

### 5.2 Validazione dura post-risposta

Prima di scrivere qualsiasi cosa in Directus, lo script verifica:
- Tutti e 4 i delimiter presenti nella risposta
- Tag HTML count entro ±15% dell'originale
- Link `<a href>` preservati al 100%
- Lunghezza testo EN ≥ 30% del testo IT
- Titolo EN non vuoto

Se anche uno solo fallisce → retry, poi `status=error` nel log.

### 5.3 Idempotenza con source hash

Ogni articolo ha un `source_hash` (SHA256 dei campi sorgente, 16 char).
Con `--resume`, lo script salta gli articoli già OK **con lo stesso hash**.
Se il testo IT viene modificato dopo la traduzione, il hash cambia
e l'articolo viene ritradotto automaticamente.

### 5.4 Rate limit adattivo

Lo script traccia token/minuto in una finestra rolling. Se si avvicina
ai limiti Tier 1 (50K ITPM, 50K OTPM) aspetta automaticamente la fine
del minuto. Su risposta 429 applica backoff esponenziale (8s, 16s, 32s, 64s).

---

## 6. Stima costi

**Modello:** `claude-haiku-4-5-20251001`
**Pricing:** $0.80/M token input · $4.00/M token output

| Scenario | Corpo medio | Costo stimato |
|----------|-------------|---------------|
| Articoli brevi (500 parole) | ~700 tok | ~€13 |
| Articoli medi (1200 parole) | ~1700 tok | ~€30 |
| Articoli lunghi (2500 parole) | ~3500 tok | ~€57 |
| **Realistico OEL (mix)** | ~1500 tok | **~€25–45** |

**Caricare €100–120 su console.anthropic.com** — buffer per retry, articoli
lunghi e output verboso. Il costo reale viene loggato articolo per articolo.

> ⚠️ Il billing della pipeline è su **console.anthropic.com** (API),
> non su platform.claude.com (abbonamento Claude Pro — separato).

Per il numero esatto prima di spendere: `python estimate_tokens.py`

---

## 7. Stima tempi — realistica

**Tier 1** (account nuovo, 50 RPM):

| Config | Stima |
|--------|-------|
| 1 worker, 1 call/art, 3265 articoli | **2–4 ore** |
| 3 worker (max utile su Tier 1) | **~90–120 min** |
| Caso peggiore (retry, articoli lunghi) | **fino a 6 ore** |

**Tier 2** (dopo ~$100 spesi, 1000 RPM):

| Config | Stima |
|--------|-------|
| 5 worker | **~25–40 min** |

Il conto "1 call × 50 RPM = 65 min" ignora latenza reale (~2-4s/call),
retry, colli di bottiglia TPM e latenza Directus. La stima onesta è 2–4 ore.

**Pratica:** lancia la sera, controlla la mattina. Il checkpoint/resume
garantisce che un'interruzione non ricominci da zero.

---

## 8. Pipeline operativa — 10 step

### Step 1 — Audit gap
```bash
curl -s "https://cms.ombreeluci.it/items/articoli?\
filter[lang][_eq]=it&filter[stato][_eq]=published&\
filter[articolo_traduzione][_null]=true&aggregate[count]=id" \
-H "Authorization: Bearer $DIRECTUS_TOKEN"
```

### Step 2 — Stima costi esatta
```bash
cd scripts/traduzione
export DIRECTUS_TOKEN=xxx
python estimate_tokens.py
```

### Step 3 — Approvazione editoriale formale
Condividere §3 (regole filologiche) con direzione editoriale e, se necessario,
consulenza legale. Verde scritto prima di procedere.

### Step 4 — Dry-run su 10 articoli
```bash
python translate_articles.py --dry-run --limit 10
```
Mostra anteprima traduzioni, zero scritture in Directus.

### Step 5 — Pilot su 50 articoli (stato=draft)
```bash
python translate_articles.py --limit 50 --stato draft --job-id pilot-01
```

### Step 6 — QA pilot
```bash
python qa_check.py --job-id pilot-01
```
Verifica HTML, link, lunghezze, bidirezionalità. Soglie: HTML ≥99.5%, link 100%.

### Step 7 — Review redazionale campione
Redazione apre 15–20 articoli EN in Directus → verifica fedeltà, terminologia,
coerenza stilistica. **Verde esplicito dalla redazione prima del lancio completo.**

### Step 8 — Lancio completo
```bash
python translate_articles.py --workers 3 --stato draft --job-id batch-2026-04
# se interrotto:
python translate_articles.py --workers 3 --stato draft --job-id batch-2026-04 --resume
```

### Step 9 — QA completa + backfill link 131 EN legacy
```bash
python qa_check.py --job-id batch-2026-04
python backfill_traduzione_link.py --dry-run
python backfill_traduzione_link.py
```

### Step 10 — Pubblicazione massiva EN
**Solo dopo QA ≥ soglie e review redazione.**
Aggiornamento stato da `draft` a `published` tramite Directus admin o PATCH bulk.

---

## 9. Quality gates — metriche oggettive

Il batch è promosso a pubblicabile quando:

| Metrica | Soglia minima |
|---------|---------------|
| HTML valido (tag count ±15%) | ≥ 99.5% articoli |
| Link `<a href>` preservati | 100% |
| Collegamento bidirezionale IT↔EN | ≥ 99.9% |
| Lunghezza EN ≥ 30% IT | 100% |
| Tasso errori batch | ≤ 1% (max ~33 su 3265) |
| Campione manuale (significato) | < 2% "critical meaning drift" |

---

## 10. Piano rollback

Ogni batch ha un `job_id`. In caso di batch difettoso:

```bash
python rollback_batch.py --job-id batch-2026-04 --dry-run
python rollback_batch.py --job-id batch-2026-04
```

Lo script legge il log CSV, rimuove `articolo_traduzione` dagli IT
e cancella gli articoli EN. Sicuro perché gli EN sono in `draft`.

---

## 11. Seconda lingua (spagnolo — dopo EN)

**Scelta:** spagnolo — 570M parlanti, enorme comunità cattolica latinoamericana,
massima rilevanza missionaria per OEL. (Alternativa culturalmente vicina: francese,
lingua d'origine di Fede e Luce e Jean Vanier.)

**Esecuzione:** sequenziale, non parallela.
1. Chiudi EN con processo stabile e QA verificata
2. Aggiungi `--target-lang es` allo script (slug suffix `-es`, system prompt ES)
3. Ripeti la stessa pipeline — costo analogo, ~€25–45 in più

**Budget totale EN + ES: €60–120** su console.anthropic.com.

---

## 12. Tracciamento batch

Ogni run scrive in `logs/{job_id}.csv`:

```
job_id, it_id, it_slug, en_id, en_slug, source_hash,
status, error, input_tokens, output_tokens, cost_usd, timestamp
```

Permette: resume dopo interruzione, costo reale effettivo,
rollback selettivo, audit storico delle traduzioni.

---

## 13. Riferimenti codebase

| File | Cosa fa |
|------|---------|
| `src/pages/blog/[...slug].astro` | IT+EN, hreflang, archival-alert-en, language switcher |
| `src/pages/blog/en.astro` | Indice `/blog/en` |
| `src/utils/i18n.ts` | Dizionario UI it/en |
| `src/lib/directus.ts` | `ArticoloFull.articolo_traduzione` |
| `PROGRESS.md` | Task `DA-06` con link a questo file |
| `scripts/traduzione/translate_articles.py` | Pipeline principale |
| `scripts/traduzione/estimate_tokens.py` | Stima costi pre-lancio |
| `scripts/traduzione/backfill_traduzione_link.py` | Collega 131 EN legacy |
| `scripts/traduzione/qa_check.py` | QA automatica post-batch |
| `scripts/traduzione/rollback_batch.py` | Annulla batch da log |
