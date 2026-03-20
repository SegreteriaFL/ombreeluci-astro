# Audit lunghezza body — articoli blog (`.md`)

**Data generazione:** 2026-03-20  
**Ambito:** tutti i file `src/content/blog/**/*.md`  
**Metodo:** lettura UTF-8, split su `---` (max 2 split), **body** = terzo segmento dopo strip iniziale/finale (stesso script richiesto dall’audit).

---

## Statistiche aggregate

| Metrica | Valore |
|--------|--------|
| **Totale file con frontmatter valido** | 3453 |
| Body vuoto (0 char) | 5 |
| Body &lt; 100 char | 7 |
| Body &lt; 500 char | 40 |
| Body &lt; 1000 char | 151 |
| Body 1000–3000 char | 1145 |
| Body ≥ 3000 char | 2157 |
| **Mediana** | 3812 char |
| **Media** | 4465 char |

---

## 20 file con body più corto (candidati a contenuto mancante o placeholder)

Ordinati per lunghezza crescente (path come restituiti da Python su Windows).

| Char | Percorso |
|-----:|----------|
| 0 | `src/content/blog/OEL-144/qual-e-il-tuo-figlio-preferito.md` |
| 0 | `src/content/blog/OEL-148/questionario-ombre-e-luci.md` |
| 0 | `src/content/blog/OEL-152/la-quaresima-con-don-marco-2020-podcast.md` |
| 0 | `src/content/blog/OEL-164/partiamo-per-il-congo.md` |
| 0 | `src/content/blog/OEL-71/si-chiude.md` |
| 15 | `src/content/blog/OEL-95/ii-barattolo-di-maionese-e-caffe.md` |
| 37 | `src/content/blog/OEL-140/le-comunita-fede-e-luce-nel-mondo.md` |
| 100 | `src/content/blog/OEL-140/quarte-di-copertina.md` |
| 115 | `src/content/blog/TEST-RENDER/test-render.md` |
| 162 | `src/content/blog/OEL-165/la-poesia-del-firmamento.md` |
| 183 | `src/content/blog/OEL-76/stelle-doriente-qualche-immagine-dalle-comunita-fede-e-luce-del-medio-oriente.md` |
| 187 | `src/content/blog/OEL-12/ombre-e-luci-n-10-1983-sfogliabile.md` |
| 187 | `src/content/blog/OEL-12/ombre-e-luci-n-11-1985-sfogliabile.md` |
| 187 | `src/content/blog/OEL-12/ombre-e-luci-n-12-1986-sfogliabile.md` |
| 187 | `src/content/blog/OEL-16/ombre-e-luci-n-14-1986-sfogliabile.md` |
| 187 | `src/content/blog/OEL-16/ombre-e-luci-n-15-1986-sfogliabile.md` |
| 187 | `src/content/blog/OEL-16/ombre-e-luci-n-16-1986-sfogliabile.md` |
| 187 | `src/content/blog/OEL-20/ombre-e-luci-n-17-1987-sfogliabile.md` |
| 187 | `src/content/blog/OEL-4/ombre-e-luci-n-1-1983-sfogliabile.md` |
| 187 | `src/content/blog/OEL-4/ombre-e-luci-n-2-1983-sfogliabile.md` |

**Nota caso segnalato (OEL-172):** il file  
`src/content/blog/OEL-172/intelligenza-artificiale-e-memoria-editoriale-il-mio-lavoro-con-ombre-e-luci.md`  
ha body **2142** caratteri (coerente con ~2145 citati); non compare nei 20 più corti globali ma resta sotto la mediana (~3812) e va verificato contro la fonte WordPress/JSONL se il testo sul sito era più lungo.

---

## Limiti del metodo

- Se il frontmatter contiene righe `---` interne (non standard), lo split può tagliare male il body; per la maggior parte dei file Astro il pattern è valido.
- File senza almeno due `---` non sono contati in questa statistica (il loop li salta).

---

## Riferimento script (riproducibilità)

```python
import glob, statistics

files = glob.glob('src/content/blog/**/*.md', recursive=True)
lengths = []
for f in files:
    try:
        content = open(f, encoding='utf-8').read()
        parts = content.split('---', 2)
        if len(parts) >= 3:
            body = parts[2].strip()
            lengths.append((len(body), f))
    except Exception:
        pass
# ... ordinamento e stampe come in audit
```
