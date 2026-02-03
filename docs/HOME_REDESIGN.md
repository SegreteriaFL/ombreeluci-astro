# Redesign Home – Layout editoriale (ispirato a Vita.it)

Documentazione delle modifiche alla pagina iniziale del sito Ombre e Luci: da lista cronologica a layout editoriale a sezioni.

---

## Panoramica

La Home (`src/pages/index.astro`) è stata trasformata in un **layout editoriale dinamico** con sezioni semantiche, titoli di sezione in stile testata e contenuti raggruppati per tipo (primo piano, diari, temi, ultimo numero, testimonianze, recensioni).

- **Wrapper**: larghezza max 1440px, senza padding laterale.
- **Font**: Raleway per titoli, interlinea generosa; Georgia/serif per i Diari.
- **Titoli di sezione**: classe `.section-title` (linea superiore, maiuscolo, letter-spacing) in `global.css`.

---

## Sezioni

### 1. Hero – In primo piano

- **Griglia asimmetrica** (circa 1.85fr : 1fr):
  - **Colonna sinistra**: articolo in evidenza (featured) – ultimo editoriale o primo con `featured: true` in frontmatter. Immagine grande (16:9), overlay con categoria, titolo, autore e data.
  - **Colonna destra**: primo articolo con immagine a tutta colonna, sotto categoria, titolo, autore e data; sotto altri due articoli con miniatura, categoria, titolo, autore e data (senza sommario).
- Categoria mostrata sopra il titolo per tutti gli articoli (formato: `issue · forma · categoria_menu`).

### 2. I Diari

- Fascia con **background** `var(--bg-cream)` (poi sovrascritto in pagina dove serve).
- **6 colonne** (ultimo articolo per diario, escluso Davide Passeri): foto 120×120px, sotto titolo del diario (serif), autore, data in forma relativa (“un mese fa”, “3 mesi fa”).
- Link “Tutti i Diari” a `/sezioni/diari`.

### 3. Blocchi tematici (Fede, Cultura, Scuola)

- Componente **`ThemedSection.astro`**: riceve tema (slug), titolo di sezione, descrizione e fino a 3 articoli. Layout: sidebar con descrizione + link “Tutti gli articoli” e griglia 3 colonne con `ArticleCard`.
- Temi usati in home: FEDE, CULTURA, SCUOLA (slug da megacluster). In futuro si può usare `theme_highlight: true` nel frontmatter per marcare articoli in evidenza.

### 4. Box Ultimo numero (dopo Cultura)

- Box a tutta larghezza nel wrapper, **background #d9cebd**, griglia 3fr 2fr.
- **Colonna sinistra**: titolo “Ultimo numero” (font-weight 400), riga decorativa, riga con periodo e n. progressivo, titolo numero (es. “Paradigma Pompei”, font più grande), **sommario** (da `sommario_lancio` nel numero, altrimenti `seo_description`/`descrizione_ai`), link “Scopri contenuti”.
- **Colonna destra**: copertina 300px centrata, cliccabile, link a `/archivio/[slug]`.
- Dati: ultimo numero Ombre e Luci da `numeri_consolidati.json` (`tipo_rivista === 'ombre_e_luci'`, ordinato per anno e numero decrescenti). Per OEL-172 è stato aggiunto il campo `sommario_lancio` con il testo di lancio.

### 5. Testimonianze

- Griglia **1fr 2fr 1fr**: colonna 1 con due card (prima con foto, seconda senza), colonna 2 con una card a foto grande, colonna 3 con box CTA “Racconta la tua storia” (testo + mailto: ombreeluci@fedeeluce.it).
- Ultime 3 testimonianze (forma = Testimonianza).

### 6. Recensioni

- **5 colonne**: una card per recensione. Ogni card: foto a tutta colonna (16:10), sotto categoria, titolo, autore, data (uno sotto l’altro). Ultime 5 recensioni.
- Responsive: 3 colonne sotto 1024px, 1 sotto 600px.

### 7. Footer home

- Link “Archivio completo” a `/archivio`.

---

## File coinvolti

| File | Ruolo |
|------|--------|
| `src/pages/index.astro` | Pagina home: dati, layout e stili inline per tutte le sezioni. |
| `src/styles/global.css` | `--bg-cream`, `.section-title`. |
| `src/components/ThemedSection.astro` | Blocco tematico (sidebar + 3 ArticleCard). |
| `src/components/ArticleListRow.astro` | Riga articolo (thumb, titolo, autore; opz. categoria e data). Usato in altre pagine. |
| `src/data/diari.ts` | Elenco diaristi, slug, titoli diario; usato per sezione I Diari. |
| `src/data/numeri_consolidati.json` | Aggiunto `sommario_lancio` per OEL-172; lettura ultimo numero per box. |

---

## Dati e preparazione futuro

- **Featured**: si usa il primo articolo con `featured: true` in frontmatter (se presente), altrimenti l’ultimo editoriale.
- **Tematici**: si possono preferire articoli con `theme_highlight: true` nel frontmatter quando ci saranno.
- In `src/content/config.ts` sono commentati i campi opzionali `featured` e `theme_highlight` per quando si vorranno aggiungere allo schema.
- **Sommario articoli**: da `sottotitolo` in megacluster (per `wp_id`) o da campi `sommario`/`description` in frontmatter; usato in hero (poi rimosso dai laterali su richiesta).

---

## Note tecniche

- Immagine hero/placeholder: `src/assets/placeholder1.webp` quando manca l’immagine.
- Date relative (Diari): funzione `formatDateRelative()` (oggi, ieri, X giorni/settimane/mesi/anni fa).
- Label categoria: `getCategoryLabel(meta)` da `config/taxonomy.js` (issue · forma · categoria_menu).
