# scripts/traduzione

Script per la traduzione AI del corpus Ombre e Luci (IT → EN).
Tutti usano `claude-haiku-4-5-20251001`. Log CSV in `logs/`.

---

## translate_articles.py — Pipeline articoli IT→EN (completata aprile 2026)

Traduce il corpo completo degli articoli IT verso EN. Completata aprile 2026: 3339 articoli tradotti, tutti published.

**Variabili d'ambiente:**
```
DIRECTUS_TOKEN=...
ANTHROPIC_API_KEY=...
```

**Uso:**
```bash
python translate_articles.py --dry-run --limit 10       # anteprima
python translate_articles.py --limit 50 --job-id pilot  # pilot
python translate_articles.py --workers 3 --job-id batch # completo
python translate_articles.py --job-id batch --resume    # riprendi
```

---

## translate-bio.mjs — Bio autori IT→EN

Traduce le bio degli autori (campo `bio_html`) e scrive il risultato in `bio_en`.
79 autori con bio IT, 0 bio EN al momento della scrittura.
Idempotente: salta gli autori con `bio_en` già valorizzata.

**Variabili d'ambiente (da `.env` nella root del repo):**
```
DIRECTUS_URL=https://cms.ombreeluci.it
DIRECTUS_TOKEN=...
ANTHROPIC_API_KEY=...
```

**Uso:**
```bash
node scripts/traduzione/translate-bio.mjs --dry-run   # anteprima prime 3 bio
node scripts/traduzione/translate-bio.mjs             # esegui (79 record, ~3 min)
```

**Output:** log CSV in `logs/translate-bio-{timestamp}.csv`

Nessun prerequisito Directus: il campo `bio_en` esiste già nella collection `autori`.

---

## translate-didascalie.mjs — Didascalie copertina IT→EN

Traduce il campo `didascalia_copertina` degli articoli EN e scrive in `didascalia_en`.
~3470 record potenziali. 2 worker paralleli, ~29 minuti totali.
Checkpoint ogni 100 record: `logs/translate-didascalie-checkpoint.json`.
Idempotente: salta i record con `didascalia_en` già valorizzata.

**Prerequisito Directus (prima di eseguire):**
Il campo `didascalia_en` deve esistere nella collection `articoli`.
Se mancante, lo script si ferma e mostra le istruzioni per crearlo.

**Prerequisito frontend (task separato, non fare in questa sessione):**
Aggiornare `en/[slug].astro` per leggere `didascalia_en` con fallback su `didascalia_copertina`.

**Variabili d'ambiente (da `.env` nella root del repo):**
```
DIRECTUS_URL=https://cms.ombreeluci.it
DIRECTUS_TOKEN=...
ANTHROPIC_API_KEY=...
```

**Uso:**
```bash
node scripts/traduzione/translate-didascalie.mjs --dry-run   # anteprima prime 3 didascalie
node scripts/traduzione/translate-didascalie.mjs             # esegui
node scripts/traduzione/translate-didascalie.mjs --resume    # riprendi da checkpoint
```

**Output:** log CSV in `logs/translate-didascalie-{timestamp}.csv`
