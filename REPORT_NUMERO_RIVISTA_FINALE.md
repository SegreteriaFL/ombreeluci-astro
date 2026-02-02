# Report Finale: Associazione Articoli-Numeri Rivista

**Data:** 30 Gennaio 2026  
**Script eseguito:** `fix_numero_rivista_da_sorgenti.py`

---

## Risultati

### Statistiche Generali

- **Totale articoli:** 4,167
- **Con wp_id:** 3,487 (83.7%)
- **Con numero_rivista:** 57 (1.4%)
- **Con anno_rivista:** 57 (1.4%)
- **Con entrambi (numero + anno):** 57 (1.4%)
- **Con issue_number:** 3,432 (82.4%)

### Articoli Senza Numero

- **Senza numero_rivista:** 4,110 (98.6%)
- **Senza anno_rivista:** 4,110 (98.6%)
- **Senza entrambi:** 4,110 (98.6%)

---

## Analisi

### Problema Identificato

Solo il **5% degli articoli** nei file sorgente (`export_1000_*.json`) ha una categoria con slug `numero-X-YYYY`. Questo significa che:

1. **La maggior parte degli articoli non appartiene a un numero specifico** nei dati originali
2. Gli articoli potrebbero essere stati pubblicati fuori dai numeri della rivista
3. Potrebbero essere articoli speciali, editoriali, o contenuti aggiuntivi

### Cosa Funziona

✅ **82.4% degli articoli ha `issue_number`** - Questo è stato aggiunto dal precedente script `fix_issue_number.py` che usa la data per associare gli articoli ai numeri.

### Cosa Non Funziona

❌ Solo **1.4% degli articoli ha `numero_rivista` e `anno_rivista`** dai sorgenti originali.

---

## Conclusione

**La lista "In questo numero" funziona per l'82.4% degli articoli** grazie al campo `issue_number` che è stato popolato usando la data di pubblicazione.

I dati sorgente originali (`export_1000_*.json`) contengono informazioni sul numero rivista solo per una piccola percentuale di articoli (circa 5%), quindi non è possibile popolare `numero_rivista` e `anno_rivista` per tutti gli articoli direttamente dai sorgenti.

**Raccomandazione:** Continuare a usare `issue_number` come metodo principale di associazione, poiché copre l'82.4% degli articoli.

