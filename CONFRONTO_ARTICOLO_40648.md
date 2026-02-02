# Confronto Articolo 40648 - "La mia esperienza con il taxi sociale a Roma"

## Fonti Confrontate

1. **File Markdown attuale** (`src/content/blog/cluster-0/la-mia-esperienza-con-il-taxi-sociale-a-roma.md`)
2. **CSV** (`articoli_2026_enriched_temi_s8_FINAL_EXTENDED.csv`)
3. **JSONL** (`articoli_semantici_FULL_2026.jsonl` - campo `html_pulito`)

---

## 1. FILE MARKDOWN ATTUALE (SPORCO)

### Problemi Identificati:
- ❌ Tag `<strong>` non chiusi (9 aperti, 8 chiusi)
- ❌ Tag `<a>` non chiusi (1 aperto, 0 chiusi)
- ❌ HTML malformato: `<a href="..."><strong>STID. Nel nostro profilo...` (tag non chiusi)

### Esempio Problema:
```html
<p><strong>tramite mail ci mandano un codice</strong> <strong>e ci viene detto di scaricare l'app che si chiama</strong> <a href="https://play.google.com/store/apps/details?id=it.autoroute.stip&amp;hl=it&amp;gl=US"><strong>STID. Nel nostro profilo...
```
**Problema**: Tag `<a>` e `<strong>` non chiusi correttamente.

### Statistiche:
- Tag `<p>`: 8 aperti, 8 chiusi ✅
- Tag `<strong>`: 9 aperti, 8 chiusi ❌
- Tag `<a>`: 1 aperto, 0 chiusi ❌

---

## 2. CSV (`articoli_2026_enriched_temi_s8_FINAL_EXTENDED.csv`)

### Contenuto:
- ✅ Contiene solo metadati (titolo, cluster_id, coordinate UMAP, temi)
- ❌ **NON contiene il contenuto HTML dell'articolo**
- ❌ Non utile per la pulizia del contenuto

**Conclusione**: Il CSV non contiene il contenuto HTML, solo metadati per clustering e temi.

---

## 3. JSONL (`articoli_semantici_FULL_2026.jsonl` - campo `html_pulito`)

### Processamento:
Secondo `report_pulizia_full_2026.txt`, il file è stato processato con:
- ✅ Rimossi tag Divi Builder (50,251 shortcode rimossi)
- ✅ Rimossi tag `<img>` (3,379 rimossi)
- ✅ Rimossi tag `<iframe>` (30 rimossi)
- ✅ Rimossi script/style (33 rimossi)
- ✅ Evidenziazioni convertite in blockquote (575 convertite)
- ✅ Rimossi menu items (546 rimossi)

### Qualità HTML - ANALISI ARTICOLO 40648:
- ✅ **Tag `<p>` bilanciati**: 8 aperti, 8 chiusi
- ✅ **Tag `<strong>` bilanciati**: 9 aperti, 9 chiusi
- ✅ **Tag `<a>` bilanciati**: 1 aperto, 1 chiuso
- ✅ **Nessun sommario presente**
- ✅ **Nessun footer newsletter**
- ✅ **Paragrafi ben formattati** con spaziatura corretta

### Esempio Contenuto:
```html
<p><span class="capolettera">B</span>uongiorno a tutti. Vi avevo promesso che vi avrei parlato del taxi sociale ed eccomi qua...</p>
<p><strong>La pratica per il taxi inizia andando allo sportello di Roma Mobilità e presentando la domanda</strong>...</p>
```

**Risultato**: HTML perfettamente formattato, senza tag non chiusi, senza residui Divi.

---

## 🏆 VINCITORE: JSONL `html_pulito`

### Perché è il migliore:

1. ✅ **HTML corretto**: Tutti i tag sono chiusi correttamente
2. ✅ **Pulito da Divi**: 50,251 shortcode Divi Builder rimossi
3. ✅ **Paragrafi preservati**: Struttura semantica mantenuta
4. ✅ **Nessun sommario**: Già rimosso durante la pulizia
5. ✅ **Nessun footer**: Newsletter footer già rimosso
6. ✅ **Formattazione leggibile**: Spaziature corrette tra paragrafi

### Confronto Diretto:

| Aspetto | Markdown Attuale | JSONL html_pulito |
|---------|------------------|-------------------|
| Tag chiusi | ❌ No (strong, a non chiusi) | ✅ Sì (tutti bilanciati) |
| Divi Builder | ❌ Residui possibili | ✅ Completamente rimosso |
| Sommari | ❌ Presenti | ✅ Rimossi |
| Footer | ❌ Presenti | ✅ Rimossi |
| Paragrafi | ⚠️ OK ma HTML malformato | ✅ Perfetti |
| Leggibilità | ❌ Bassa (tag non chiusi) | ✅ Alta |

---

## 📋 RACCOMANDAZIONE FINALE

**USA `html_pulito` dal JSONL** come fonte principale per la pulizia!

Lo script `clean_content_v2.py` dovrebbe:
1. ✅ **Usare `html_pulito` dal JSONL** (già pulito da Divi, tag bilanciati)
2. ✅ **Applicare BeautifulSoup** solo per sicurezza (chiude eventuali tag residui)
3. ✅ **Rimuovere sommari residui** (se presenti in altri articoli)
4. ✅ **Rimuovere footer newsletter** (se presenti in altri articoli)
5. ✅ **Rimuovere span inutili** (mantenendo capolettera)

**Il JSONL è già la fonte più pulita e corretta!**
