# Esempi Pulizia Contenuto Articoli

## Problemi Identificati

Dall'analisi di 6 articoli problematici:

### 1. **la-mia-esperienza-con-il-taxi-sociale-a-roma** (ID: 40648)
- **Problemi**: Tag `<strong>` non chiusi (9 aperti, 8 chiusi), Tag `<a>` non chiusi (1 aperto, 0 chiusi)
- **PRIMA**: `<p><strong>La pratica per il taxi inizia...` (tag non chiuso)
- **DOPO**: BeautifulSoup chiude automaticamente i tag

### 2. **pap-dove-sei** (ID: 29117)
- **Problemi**: Tag `<strong>` non chiusi (24 aperti, 3 chiusi), Tag `<a>` non chiusi (21 aperti, 3 chiusi), Sommario presente
- **PRIMA**: Contenuto con molti tag non chiusi e sommario finale
- **DOPO**: Tag chiusi automaticamente, sommario rimosso

### 3. **una-foto-da-hong-kong** (ID: 25743)
- **Problemi**: Tag `<strong>` non chiusi (8 aperti, 7 chiusi), Tag `<a>` non chiusi (3 aperti, 2 chiusi)
- **PRIMA**: HTML con tag malformati
- **DOPO**: HTML corretto con tag chiusi

### 4. **marie-la-strabica-di-georges-simenon-recensione** (ID: 24722)
- **Problemi**: Tag `<strong>` non chiusi (15 aperti, 6 chiusi), Tag `<a>` non chiusi (9 aperti, 1 chiuso), Sommario presente
- **PRIMA**: Contenuto con tag non chiusi e sommario
- **DOPO**: Tag chiusi, sommario rimosso

### 5. **cosa-c-oltre-la-scuola** (ID: 23723)
- **Problemi**: Tag `<strong>` non chiusi (19 aperti, 9 chiusi), Tag `<a>` non chiusi (10 aperti, 0 chiusi), Sommario presente
- **PRIMA**: HTML molto corrotto con molti tag non chiusi
- **DOPO**: HTML pulito e corretto

### 6. **giochi-da-fare-a-casa** (ID: 16792)
- **Problemi**: Span con stili inutili (`<span style="font-size: 25px;">`)
- **PRIMA**: `<span style="font-size: 25px;">"Tutti in piazza" <p>`
- **DOPO**: `"Tutti in piazza" <p>` (span rimosso)

## Soluzione Implementata

Lo script `clean_content_v2.py`:

1. **Usa BeautifulSoup** per chiudere automaticamente tutti i tag non chiusi
2. **Rimuove sommari** usando pattern regex e ricerca intelligente
3. **Rimuove span inutili** mantenendo solo `class="capolettera"`
4. **Rimuove footer newsletter** e "Questo articolo è tratto da"
5. **Normalizza spazi** e formattazione

## Prossimi Passi

Eseguire lo script su tutti i 3.488 file:
```bash
python scripts_and_data/scripts/clean_content_v2.py
```

