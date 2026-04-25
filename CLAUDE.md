
---
## i18n scalabilità — regola permanente

Il sito supporterà IT, EN, ES, FR e lingue future. Ogni decisione i18n deve essere presa con questa prospettiva.

**Regola assoluta:** nessuna mappa slug/label hardcoded nel codice TypeScript o JavaScript. Tutto vive in `src/data/categorie.json` con una chiave per lingua. Aggiungere ES significa aggiungere `"es": "Familia"` nel JSON — zero modifiche al codice.

**Vietato:**
```ts
// MAI fare così
const CAT_IT_TO_EN = { 'famiglia': 'family', 'cultura': 'culture' }
const CAT_IT_TO_ES = { 'famiglia': 'familia', 'cultura': 'cultura' }
```

**Corretto:**
```ts
// Leggere sempre da categorie.json
getCategoriaSlug(slugIT, lang)   // IT slug → slug nella lingua target
getCategoriaSlugIT(slug, lang)   // slug qualsiasi lingua → slug IT
getCategoriaLabel(slugIT, lang)  // IT slug → label localizzata
```

**Route per lingua:** ogni lingua ha `src/pages/{lang}/` con struttura identica. Le route leggono `categorie.json`, non mappe hardcoded.

**Language switcher:** ogni pagina passa `alternateUrls` con i link per tutte le lingue disponibili. Se una traduzione non esiste → link alla homepage della lingua.

**Nuove pagine:** ogni nuova pagina (verticali, dossier, sezioni) va progettata multilingua fin dall'inizio, non retrofittata.

Riferimento completo: `CONTENUTI.md` sezione "Principio di scalabilità multilingua".
