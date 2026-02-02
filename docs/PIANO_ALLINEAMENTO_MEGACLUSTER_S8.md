# Piano di allineamento al Megacluster S8

**Data:** 1 febbraio 2026  
**Riferimento:** Iterazione 8 FINAL_V2 / FINAL_V3.

---

## 1. Gestione T20 – Domande aperte (articoli trasversali)

In **FINAL_V2** ci sono **2 227 articoli** (≈64%) nel cluster **T20 – Domande aperte**. Non ha senso mostrarli tutti sotto una sola label.

### Opzioni consigliate

1. **Mantenere build da FINAL_V3** (attuale)  
   In V3 gli articoli ex-T20 sono già ridistribuiti su T01–T15. Nessuna pagina “Domande aperte”; le liste per categoria restano bilanciate.

2. **Se si adotta FINAL_V2** (20 temi incluso T20):
   - **Fallback sui tag originali:** per gli articoli con `tema_code === 'T20'` usare i primi 1–2 tag WordPress come “sotto-tema” (es. “Vita quotidiana”, “Famiglia”) e mostrare in UI come badge secondario.
   - **Raggruppamento “Vita quotidiana”:** creare una pseudo-categoria “Vita quotidiana” che in backend filtri gli articoli T20 con tag specifici (es. vita-quotidiana, esperienze) e li mostri in una sezione dedicata.
   - **Non mostrare T20 nel menu:** lasciare “Domande aperte” fuori dal menu principale; gli articoli restano raggiungibili da ricerca, autore, numero, correlati.

3. **Implementazione suggerita (se si passa a V2):**  
   In `taxonomy.js` aggiungere `isT20(tema_code)` e nelle pagine categoria, per gli articoli T20, mostrare un secondo badge (tag principale) oltre al tema. La rotta `/categoria/domande-aperte` può esistere ma con ordinamento per “tag più frequenti” o “Vita quotidiana” come vista predefinita.

---

## 2. Ruoli editoriali – integrazione

- **Build:** Lo script `build_articoli_megacluster.js` è stato aggiornato per leggere la colonna `ruolo_editoriale` dal CSV FINAL_V3 e scriverla in `articoli_megacluster.json` in ogni entry `byId[id]`.
- **Taxonomy:** `getMegaclusterForArticle(wp_id)` ora restituisce anche `ruolo_editoriale` (`portante` | `strutturale` | `trasversale` | null).
- **UI:** Il componente `ArticleCard` accetta la prop opzionale `ruoloEditoriale`. Se `ruoloEditoriale === 'portante'` viene applicata la classe `article-card--portante` (titolo più grande, aspect-ratio immagine 16/10). Le pagine **categoria** e **autori** passano `ruolo_editoriale` da `getMegaclusterForArticle(article.data.wp_id)`.

**Per applicare i dati:** rieseguire lo script di build dopo aver verificato che il CSV contenga `ruolo_editoriale`:

```bash
node scripts/build_articoli_megacluster.js
```

Eventuali estensioni: ordinare le liste mettendo prima i “portanti”, o usare una griglia a due dimensioni (card grandi per portanti, normali per gli altri).

---

## 3. Pulizia label – Alias in taxonomy.js

È stata aggiunta una mappa **THEME_ALIASES** e la funzione **getThemeDisplayName(temaLabel)** in `src/config/taxonomy.js`:

- **THEME_ALIASES:** associa ogni `tema_label` lungo a una label breve (es. “Fede, Chiesa e spiritualità della fragilità” → “Spiritualità”, “Memoria e storia di Fede e Luce (opzionale)” → “Storia Fede e Luce”).
- **getThemesWithSlugs()** ora restituisce per ogni tema `{ nome, slug, nomeCompleto }` dove `nome` è l’alias (se definito) o il label completo. Il **Header** usa già `cat.nome` nel mega menu, quindi le voci del menu mostrano le label accorciate.

Alias attuali coprono i 15 temi del Megacluster (FINAL_V3). Per nuovi temi aggiungere una riga in `THEME_ALIASES`.

---

## 4. Roadmap – Migrazione commenti Trikkia

Obiettivo: collegare i commenti Trikkia agli **ID articolo** del Megacluster (stesso `id_articolo` / `wp_id` usato nel sito).

### Fasi suggerite

1. **Export Trikkia**  
   Ottenere un export (CSV/JSON) dei commenti con almeno:  
   - identificativo articolo di origine (URL, slug WordPress, o `post_id`);  
   - testo commento, autore, data.

2. **Mappatura articolo**  
   - Se Trikkia usa `post_id` WordPress → usare direttamente `id_articolo` del CSV/JSON Megacluster (`byId[post_id]`).  
   - Se Trikkia usa URL (es. `?p=123`) → estrarre l’ID dalla query e usarlo come chiave in `articoli_megacluster.json` e nel content collection (frontmatter `wp_id`).  
   - Se Trikkia usa solo slug → costruire una mappa slug → wp_id dal content collection (o da un JSON generato in build) e usarla per associare ogni commento a un articolo.

3. **Schema dati commenti nel progetto**  
   - Opzione A: file JSON `src/data/comments_by_article.json` generato in build: `{ [wp_id]: [ { id, author, date, text } ] }`.  
   - Opzione B: collection Astro `src/content/comments/` con frontmatter `article_id` (wp_id) e body del commento; `getCollection('comments', ({ id }) => id === articleId)` per pagina articolo.  
   - Opzione C: API/serverless che legge da DB o da JSON e restituisce commenti per `wp_id` (utile se i commenti sono molti o aggiornati spesso).

4. **Build script**  
   - Script (es. `scripts/import_trikkia_comments.js`) che: legge l’export Trikkia; risolve per ogni commento l’`id_articolo` (wp_id) con la mappa slug/URL → wp_id; scrive `comments_by_article.json` o file per la collection.

5. **UI**  
   - Nella pagina articolo (`/blog/[...slug]`): leggere `wp_id` dall’articolo; caricare i commenti per quel `wp_id`; renderizzare blocco commenti sotto il corpo (con eventuale paginazione).

6. **Validazione**  
   - Contare commenti con/senza `wp_id` risolto; report di articoli con commenti senza match (slug/URL obsoleti o articoli non migrati).

---

## 5. Riepilogo azioni

| Azione | Stato |
|--------|--------|
| Audit tecnico e report Markdown | ✅ `docs/AUDIT_TECNICO_INDICIZZAZIONE.md` |
| Integrazione `ruolo_editoriale` nel build e in taxonomy | ✅ Script + getMegaclusterForArticle |
| Peso visivo articoli portanti (ArticleCard) | ✅ Classe `article-card--portante` e prop `ruoloEditoriale` |
| Alias label in taxonomy.js (menu) | ✅ THEME_ALIASES + getThemeDisplayName + getThemesWithSlugs |
| Logica T20 e roadmap commenti Trikkia | ✅ Descritta in questo documento |
| Rigenerare `articoli_megacluster.json` con ruolo_editoriale | ⏳ Eseguire `node scripts/build_articoli_megacluster.js` |
