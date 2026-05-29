# Performance Audit — 2026-05-29

Ricognizione pura: nessuna modifica al codice. Obiettivo: documentare la situazione
esatta prima di decidere la strategia di ottimizzazione.

---

## Problema 1 — Immagini (risparmio stimato Lighthouse: 4303 KiB)

### Situazione attuale

#### `getDirectusAssetUrl` — infrastruttura disponibile ma non sempre usata

`src/lib/directus.ts:55-71` — la funzione supporta tutti i transform Directus:
```ts
export function getDirectusAssetUrl(
  fileId: string,
  transforms?: { width?: number; height?: number; fit?: string; format?: string; quality?: number }
): string
```

Helper che la usano **correttamente**:
- `getAutoreImageUrl` (directus.ts:79): 200×200, WebP, quality 80 ✓
- `getAutoreFotoFasciaUrl` (directus.ts:84): 96×96, WebP, quality 80 ✓
- `getArticoloCopertinaSrc` (directus.ts:106): width 800 default, WebP, quality 82 ✓

#### Problema 1a — `getNumeroImageUrl` senza transform (directus.ts:93-97)

```ts
export function getNumeroImageUrl(numero: { copertina?: string | null; copertina_url?: string | null }): string | null {
  if (numero.copertina) return `${DIRECTUS_URL}/assets/${numero.copertina}`;  // ← raw, nessun WebP/resize
  const u = numero.copertina_url?.trim();
  return u || null;  // ← URL legacy R2, raw
}
```

Usata in 5 punti:
- `src/pages/index.astro:47` — copertina homepage
- `src/pages/en/index.astro:47` — copertina homepage EN
- `src/pages/it/archivio/[issue].astro:42`
- `src/pages/en/archive/[issue].astro:41`
- `src/components/ArchivioContent.astro:105`
- `src/components/IssueContent.astro:38`

#### Problema 1b — Hero copertina articolo: 800px per display fino a 1100px

`src/pages/it/[slug].astro:232`:
```ts
const articleImageRaw = getArticoloCopertinaSrc(articolo);  // ← width default 800
```

`src/pages/it/[slug].astro:558-565`:
```html
<img
  src={articleImage}
  alt={articleTitle}
  class="article-image"
  loading="eager"
  decoding="async"
  fetchpriority="high"
  data-copertina-fallback
  onerror={COPERTINA_IMG_ONERROR}
/>
```

Il CSS visualizza l'immagine fino a ~1100px di larghezza. La sorgente a 800px è
undersized su desktop (immagine upscalata dal browser). Dovrebbe usare
`getArticoloCopertinaSrc(articolo, 1200)`. Nessun `srcset` per viewport diversi.

#### Problema 1c — Immagini nel corpo articolo (rich text): **causa principale del 4303 KiB**

`src/pages/it/[slug].astro:625`:
```html
<div set:html={corpoPart1} />
```

Le `<img>` embedded nel corpo HTML arrivano da Directus così come salvate nel rich text
editor (importate da WordPress). Sono URL raw del tipo:
`https://cms.ombreeluci.it/assets/{uuid}` — nessun `?width=`, nessun `?format=webp`.
Il browser scarica l'originale anche su mobile (spesso 2-4 MB per immagine di articolo).
Questo è verosimilmente la fonte principale del risparmio da 4303 KiB segnalato da Lighthouse.

#### Problema 1d — `ArticleCard.astro`: nessun `width`/`height` sull'`<img>`

`src/components/ArticleCard.astro:79-86` (variante vertical):
```html
<img
  src={imageSrc}
  alt={title}
  loading="lazy"
  data-copertina-fallback
  onerror={COPERTINA_IMG_ONERROR}
/>
```

`src/components/ArticleCard.astro:117-121` (variante horizontal):
```html
<img
  src={imageSrc}
  alt={title}
  loading="lazy"
  data-copertina-fallback
  onerror={COPERTINA_IMG_ONERROR}
/>
```

Nessun attributo `width` o `height` → il browser non può riservare spazio prima del caricamento
→ CLS (Cumulative Layout Shift). Il layout usa `aspect-ratio: 16/9` via CSS (line 216),
che mitiga parzialmente il CLS ma non lo elimina completamente.

#### Problema 1e — Fallback foto autore: JPG non ottimizzato

`src/pages/it/[slug].astro:143`:
```ts
const authorImagePath = authorFotoId
  ? getAutoreImageUrl(authorFotoId)   // 200×200 WebP ✓
  : `/assets/authors/${authorSlug}.jpg`;  // ← JPG statico, nessuna ottimizzazione
```

#### Problema 1f — Nessun componente immagine condiviso

Ogni componente costruisce il proprio `src` in modo indipendente. Non esiste
`src/components/Image.astro` o simile. La logica di ottimizzazione (WebP, width,
quality) è sparsa in tutti i file che consumano immagini.

#### Problema 1g — Font: nessun `<link rel="preload">`

`src/styles/global.css:10-51`: font self-hosted con `font-display: swap` ✓ (non blocca
render). Ma in `src/components/BaseHead.astro` manca:
```html
<link rel="preload" as="font" type="font/woff2"
      href="/fonts/raleway-latin.woff2" crossorigin />
```
Il browser scopre il font solo analizzando il CSS → FOUT (Flash of Unstyled Text)
visibile su connessioni lente.

### Cosa manca

| Punto | Priorità | Impatto |
|---|---|---|
| WebP + resize per immagini corpo articolo | Alta | Principale fonte 4303 KiB |
| `getNumeroImageUrl` con WebP + resize | Media | Archivio/homepage |
| Hero a 1200px + `srcset` per responsività | Media | Desktop LCP |
| `width`/`height` espliciti su `ArticleCard` | Bassa | CLS |
| `<link rel="preload">` font Raleway critico | Bassa | FOUT |

---

## Problema 2 — Script bloccanti il rendering (risparmio stimato: 1520ms)

### Situazione attuale

`src/components/BaseHead.astro` — tutti i tag rilevanti:

#### Iubenda (riga 112) — **bloccante**
```html
<script is:inline type="text/javascript"
  src="https://embeds.iubenda.com/widgets/0309471a-dce9-48f0-a637-eb76d37440b2.js">
</script>
```
- **Nessun `async` né `defer`** — blocca il parsing HTML completamente finché non
  viene scaricato ed eseguito lo script esterno
- `is:inline` in Astro non aggiunge automaticamente `defer`/`async` agli script esterni

#### GA4 loader (riga 115) + init inline (righe 116-121)
```html
<!-- loader: async ✓ -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-2TJV78DNFQ"></script>

<!-- init: sincrono ✗ -->
<script is:inline>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-2TJV78DNFQ');
</script>
```
- Il loader esterno ha `async` ✓ (non blocca)
- L'inline di inizializzazione è sincrono → blocca il parsing HTML

#### GA4 ViewTransitions (righe 123-131) — non bloccante ✓
```html
<script>
  document.addEventListener('astro:page-load', () => {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', 'G-2TJV78DNFQ', { page_path: window.location.pathname });
    }
  });
</script>
```
`<script>` senza `is:inline` → Astro compila come ES module, caricato con `type="module"`
(async per design del browser) ✓

#### ViewTransitions (riga 136) — non bloccante ✓
```html
<ViewTransitions />
```
Import Astro → bundle JS asincrono ✓

#### Algolia — non in BaseHead
Caricato tramite bundle Astro in `AutocompleteWidget.astro`. Non bloccante se il componente
non è nella pagina, ma contribuisce al bundle client (vedi Problema 3).

#### Preconnect (riga 109) — incompleto
```html
<link rel="preconnect" href="https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev" />
```
Presente solo verso R2. Mancano preconnect per:
- `https://embeds.iubenda.com` (script bloccante — il preconnect ridurrebbe il tempo di download)
- `https://www.googletagmanager.com` (GA4)

### Cosa manca

| Script | Problema | Fix |
|---|---|---|
| Iubenda (riga 112) | Nessun `async`/`defer` — blocca il rendering | Aggiungere `defer` (o caricare dopo `DOMContentLoaded`) |
| GA4 init inline (righe 116-121) | Sincrono — blocca il parsing | Aggiungere `defer` o spostare dopo `<body>` |
| Preconnect Iubenda + GTM | Mancante — rallenta il download | Aggiungere 2 tag `<link rel="preconnect">` |

---

## Problema 3 — Bundle JavaScript (stima: 56 KiB inutilizzato)

### Situazione attuale

Build presente: `dist/` aggiornato al 2026-05-29 17:15.

#### Chunk client-side (`dist/_astro/*.js`) — scaricati dal browser

```
219K  hoisted.D8-teTfa.js      ← il più grande; probabilmente ViewTransitions + Algolia
124K  hoisted.DS1k1ekx.js      ← secondo chunk; origine da identificare
 15K  hoisted.C2mRZvIL.js
5.3K  hoisted.CXLy6Ryf.js
3.8K  hoisted.CsR8W0_D.js
2.1K  hoisted.frEv8EFz.js
2.0K  hoisted.DKXCxB3n.js
1.8K  hoisted.CvJjlSiU.js
1.6K  hoisted.C2mbzVK9.js
1.4K  CTAArticolo.astro_astro_type_script_index_0_lang.D51ZTK_z.js
1.1K  hoisted.DlqNsk-0.js
1.1K  hoisted.DEavk38N.js
1.1K  hoisted.B6VNE0ve.js
 350  hoisted.DxucU2Am.js
```

I due chunk principali sommano **343K non compressi** (stimati ~130-150K gzipped).
I nomi `hoisted` indicano script estratti da componenti Astro — senza source map è
difficile attribuire esattamente quali componenti contribuiscono a ciascun chunk.

#### Chunk SSR server-side (`dist/_worker.js/*.mjs`) — eseguiti sull'edge Cloudflare

```
124K  manifest_CtETh4bR.mjs
 91K  chunks/astro/server_Bv3G9OE2.mjs        ← runtime Astro SSR
 89K  _astro-internal_middleware.mjs
 75K  chunks/DiarioBadge_BSFGwQJD.mjs          ← sospetto: molto grande per un badge
 58K  chunks/index_BUTdiOPW.mjs
 56K  chunks/Footer_GfVbQqXk.mjs              ← sospetto: molto grande per un footer
 52K  pages/it/_slug_.astro.mjs               ← pagina articolo IT (include inline JS)
 34K  _@astrojs-ssr-adapter.mjs
 30K  chunks/astro-designed-error-pages_w4ZxgLmy.mjs
 29K  pages/en/_slug_.astro.mjs
 20K  chunks/directus_Bb90Kfvn.mjs
 12K  chunks/taxonomy_B7-IEq_S.mjs
 11K  chunks/IssueContent_C9No2vBM.mjs
9.9K  chunks/ArticleCard_BovBp4JH.mjs
8.6K  chunks/BaseLayout_D8zJL1Bz.mjs
7.3K  pages/api/algolia-sync.astro.mjs
```

`DiarioBadge` (75K) e `Footer` (56K) sono sproporzionati rispetto alla loro funzione:
è probabile che importino dati statici di grandi dimensioni (es. lista completa articoli,
mappe slug) o dipendenze di grandi dimensioni non tree-shaken.

`it/_slug_.astro.mjs` (52K) include lo script inline `is:inline` della pagina articolo
direttamente nel bundle SSR — il lungo script JS di enrichment link/leggi-anche
(~7K di codice) viene serializzato nel mjs.

### Cosa manca

| Bundle | Problema | Azione da valutare |
|---|---|---|
| `hoisted.D8-teTfa.js` (219K) | Dimensione da attribuire | Analisi con `astro build --verbose` o `vite-bundle-visualizer` |
| `DiarioBadge` SSR (75K) | Troppo grande per un badge | Verificare import e dati inclusi |
| `Footer` SSR (56K) | Troppo grande per un footer | Verificare import e dati inclusi |
| Algolia | Caricato su ogni pagina? | Verificare se `AutocompleteWidget` è lazy-loaded |
| Script inline `it/[slug].astro` | ~180 righe `is:inline` nel bundle | Valutare split in file esterno con `defer` |

---

## Strategia raccomandata

_(da compilare insieme)_
