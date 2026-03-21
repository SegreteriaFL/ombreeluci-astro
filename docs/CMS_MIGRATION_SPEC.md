# Specifica Migrazione CMS — Ombre e Luci

**Versione:** 1.2
**Data:** 2026-03-20
**Autore:** Claude Code (revisione umana richiesta)
**Stato:** Bozza per revisione

---

## Indice

- [Contesto di Partenza](#contesto-di-partenza)
- [Problema URL e Redirect SEO](#problema-url-e-redirect-seo)

1. [Requisiti Funzionali](#1-requisiti-funzionali)
2. [Schema Dati Directus](#2-schema-dati-directus)
3. [Architettura Tecnica](#3-architettura-tecnica)
4. [Piano di Migrazione](#4-piano-di-migrazione)
5. [Rischi e Criticita](#5-rischi-e-criticita)
6. [Alternative Considerate e Scartate](#6-alternative-considerate-e-scartate)
7. [Decisioni Aperte](#7-decisioni-aperte)
8. [Decisioni Chiuse](#8-decisioni-chiuse)

---

## Contesto di Partenza

**Sito:** ombreeluci.it — rivista cattolica italiana dedicata a disabilita, fede e relazioni umana. Fondata nel 1983.

**Stack attuale:**
- Frontend: Astro (output 100% statico) su Cloudflare Pages
- Contenuti: ~3488 file `.md` in `src/content/blog/`, organizzati per numero rivista (es. `OEL-172/`)
- Metadati arricchiti: `articoli_megacluster.json` (immagini copertina, bio autori, embedding UMAP, cluster semantici)
- Dati di supporto: `articoli_semantici_FULL_2026.json` (testo completo, tassonomia WP originale, HTML pulito)
- Dati autori: `database_autori.json`
- Numeri rivista: `numeri_wp_FINAL.json` (con link Archive.org per PDF storici)
- Commenti storici: `commenti_storici.json` (archivio da WordPress, read-only)

**Frontmatter attuale articolo (campi rilevati):**

```
title, date, author, slug, lang, wp_id, original_url, cluster_id,
has_comments, umap_x, umap_y, umap_z, issue_number, id_numero,
numero_rivista, subtitle
```

**Redazione:** 3 persone non tecniche, pubblicazione settimanale, accesso da browser su dispositivi diversi.

**Developer:** 1 persona + Claude Code.

**Budget CMS:** 0-15 EUR/mese.

---

## Problema URL e Redirect SEO

Questo e uno dei rischi piu alti della migrazione ed e trattato come sezione autonoma perche coinvolge decisioni di architettura, lavoro di script, e una collection dedicata in Directus.

### Le forme degli URL WordPress

Gli articoli di OEL esistono — e sono indicizzati — in almeno tre forme di URL distinte:

| Forma | Esempio | Origine |
|-------|---------|---------|
| Query string con ID | `ombreeluci.it/?p=43` | URL canonico interno WordPress |
| Anno/mese/slug | `ombreeluci.it/1983/03/ombre-e-luci/` | Permalink WordPress con data |
| Solo slug | `ombreeluci.it/ombre-e-luci/` | Permalink WordPress senza data (usato per articoli recenti) |

Tutti e tre i formati hanno link inbound da siti esterni, citazioni in articoli, e sono indicizzati da Google. Un 404 su uno qualsiasi di questi URL dopo il cutover e un danno SEO immediato.

### Collection Directus: `redirects`

Va creata come collection separata — non come campo su `articoli` — perche:
- Alcuni redirect puntano a pagine non-articolo (archivi, categorie, pagine statiche)
- La collection puo essere gestita manualmente per redirect aggiuntivi nel tempo
- Permette audit e reporting sui redirect piu usati

| Campo | Tipo | Obbligatorio | Note |
|-------|------|-------------|------|
| `id` | uuid (PK) | si | |
| `source_url` | string (unique) | si | URL di origine, path relativo o assoluto |
| `destination_url` | string | si | URL di destinazione, path relativo o assoluto |
| `status_code` | integer | si | Default: 301 |
| `note` | string | no | Es. "generato automaticamente da wp_id" |

### Come si popola

Lo script di migrazione (Step 4) genera automaticamente i redirect leggendo `articoli_semantici_FULL_2026.json`:

```
Per ogni articolo nel JSON:
  source: articolo.url          (es. https://www.ombreeluci.it/?p=43)
  source: /?p={articolo.id}     (forma query string)
  destination: /it/{slug}/      (nuovo URL Astro)
  status_code: 301
```

Il file `public/_redirects` di Cloudflare Pages viene generato dalla collection `redirects` come parte del processo di build, oppure mantenuto staticamente nel repository.

### Priorita

Questo lavoro va completato e validato **prima del cutover**. Il danno da redirect mancanti e:
- Immediato: link esterni rotti dal giorno 1
- Lento da recuperare: Google impiega settimane o mesi per riacquisire il ranking degli URL redirectati
- Irrecuperabile per URL non monitorati: se non si sa quali URL esistevano, non si puo sapere cosa manca

---

## 1. Requisiti Funzionali

### Must Have — blocca il lancio se mancante

| ID | Requisito | Note |
|----|-----------|------|
| M1 | Gestione articoli (CRUD) con editor rich-text | Il redattore non deve toccare Markdown |
| M2 | Workflow bozza / pubblicato | Impedisce la pubblicazione accidentale |
| M3 | Upload immagini con storage su R2 | Smette di dipendere da URL WordPress esterni |
| M4 | Campi SEO per articolo: title tag, meta description, slug | Necessario per non perdere ranking |
| M5 | Gestione autori con relazione articolo-autore | Attualmente risolto via stringa nel frontmatter |
| M6 | Gestione numeri rivista con relazione articolo-numero | Struttura portante del sito: `OEL-172`, `INS-10` |
| M7 | Permessi per ruolo: redattore (crea/edita propri articoli) vs editor (pubblica qualsiasi) | Evita pubblicazioni non supervisionate |
| M8 | API REST o GraphQL stabile per Astro a build time | Tutto il frontend dipende da questo |
| M9 | Webhook alla pubblicazione per triggerare rebuild Cloudflare Pages | Altrimenti il sito non si aggiorna |
| M10 | Importazione bulk dei 3488 articoli esistenti con tutti i metadati | Prerequisito per andare live |
| M11 | Redirect SEO: preservare URL WordPress originali (`/?p=ID` e slug) | Il sito ha 40 anni di link inbound da tutto il web |
| M12 | Campo `lang` per distinguere articoli IT da articoli EN | Prerequisito per il multilingua |
| M13 | Link interni nel corpo degli articoli funzionanti dopo la migrazione | Gli articoli contengono link a URL WordPress assoluti — vanno aggiornati o coperti da redirect (vedere D8) |

### Should Have — importante ma non bloccante al lancio

| ID | Requisito | Note |
|----|-----------|------|
| S1 | Link bidirezionale articolo IT <-> articolo EN correlato | La versione EN del sito e in crescita |
| S2 | Hreflang automatico nell'HTML generato da Astro | SEO internazionale |
| S3 | Upload PDF (numeri rivista sfogliabili) | Attualmente su Archive.org — puo restare li |
| S4 | Campo `subtitle` / occhiello per articolo | Presente in alcuni articoli esistenti |
| S5 | Gestione temi/categorie semantici (cluster) con relazione articolo-tema | I 13 cluster semantici di AiOeL |
| S6 | Campi embedding UMAP (x, y, z) e `cluster_id` per la mappa 3D | Letti da AiOeL |
| S7 | Integrazione pgvector per embedding full-text su PostgreSQL | Necessario per AiOeL v2 (similarity search) |
| S8 | Endpoint API per AiOeL: lettura articoli senza embedding, scrittura embedding e tag suggeriti | Interfaccia AiOeL → Directus |
| S9 | Storico commenti WordPress (read-only) visibile sul frontend | 3000+ commenti storici gia in JSON |
| S10 | Gestione autori con foto, bio HTML e slug | `database_autori.json` ha gia questa struttura |

### Nice to Have — futuro

| ID | Requisito | Note |
|----|-----------|------|
| N1 | Interfaccia commenti nuovi (moderazione in Directus) | Oggi il sito non ha commenti attivi |
| N2 | Suggerimento link interni automatico da AiOeL nell'editor | Richiede plugin Directus custom |
| N3 | Suggerimento alt-text immagini da AiOeL | Richiede integrazione vision model |
| N4 | Tagging automatico da AiOeL con approvazione umana | Workflow AiOeL → bozza tag → redattore approva |
| N5 | Preview live dell'articolo prima della pubblicazione | Richiede SSR parziale o deploy preview su CF |
| N6 | Newsletter integration | Fuori scope attuale |

---

## 2. Schema Dati Directus

### 2.1 Collection: `articoli`

| Campo | Tipo Directus | Obbligatorio | Note |
|-------|--------------|-------------|------|
| `id` | uuid (PK) | si | Generato da Directus |
| `wp_id` | integer | no | ID WordPress originale — per redirect e dedup |
| `slug` | string (unique) | si | URL-safe, unico nel database |
| `lang` | string (enum: it, en) | si | Default: it |
| `titolo` | string | si | |
| `sottotitolo` | string | no | Occhiello / subtitle |
| `corpo` | text (rich text) | no | HTML prodotto dall'editor |
| `stato` | string (enum: draft, published) | si | Default: draft |
| `data_pubblicazione` | datetime | no | Null finche non pubblicato |
| `data_creazione` | datetime | si | Automatica |
| `data_aggiornamento` | datetime | si | Automatica |
| `autore` | M2O → `autori` | no | Relazione molti-a-uno |
| `numero_rivista` | M2O → `numeri_rivista` | no | Puo essere null per articoli web-only |
| `seo_title` | string | no | Se vuoto, si usa `titolo` |
| `seo_description` | string | no | Max 160 caratteri |
| `immagine_copertina` | M2O → `directus_files` | no | Stored su R2 |
| `didascalia_copertina` | string | no | |
| `original_url` | string | no | URL WordPress originale — per redirect |
| `cluster_id` | integer | no | Cluster semantico AiOeL (0-12) |
| `umap_x` | float | no | Coordinata UMAP per mappa 3D |
| `umap_y` | float | no | |
| `umap_z` | float | no | |
| `has_comments` | boolean | no | Default: false |
| `articolo_traduzione` | M2O → `articoli` | no | Punta alla versione in altra lingua |
| `tags` | M2M → `tags` | no | |
| `temi` | M2M → `temi` | no | Cluster semantici come tassonomia navigabile |
| `note_redazione` | text | no | Campo interno, non esposto sul frontend |

**Nota su immagini nel corpo:** le immagini inline nel corpo dell'articolo — incluse le loro didascalie — sono gestite interamente dall'editor rich-text di Directus come HTML. Non esistono campi separati per le didascalie inline. L'editor scelto deve supportare la caption nativa nelle immagini inserite nel testo (es. blocco `<figure>/<figcaption>`). Le immagini di copertina sono invece gestite dal campo `immagine_copertina` + `didascalia_copertina` sopra indicati.

### 2.2 Collection: `autori`

| Campo | Tipo | Obbligatorio | Note |
|-------|------|-------------|------|
| `id` | uuid (PK) | si | |
| `slug` | string (unique) | si | |
| `nome_completo` | string | si | |
| `nome_normalizzato` | string | no | Per dedup (accenti, varianti) |
| `bio_html` | text | no | |
| `foto` | M2O → `directus_files` | no | |
| `email` | string | no | Campo interno |
| `url_wp` | string | no | URL pagina autore WordPress originale — per redirect e per recuperare bio mancanti via scraping |
| `articoli_count` | integer | no | Calcolato, aggiornato da script/hook — totale articoli in tutte le lingue |
| `articoli_it_count` | integer | no | Calcolato — articoli in italiano |
| `articoli_en_count` | integer | no | Calcolato — articoli in inglese |

**Avatar predefinito in Directus:** l'interfaccia `file-image` non puo puntare a un file statico del sito Astro. Per mostrare lo stesso avatar neutro anche in admin, caricare `public/images/avatar-default.svg` in `directus_files` e valorizzare `foto` sugli autori che non hanno immagine. Script idempotente: `scripts/db_analysis/directus_default_author_avatar.py` (richiede `DIRECTUS_URL`, `DIRECTUS_TOKEN`). Opzionale: flag `--set-field-default` per tentare il `default_value` sul campo `foto` (se l'istanza lo consente).

### 2.3 Collection: `numeri_rivista`

| Campo | Tipo | Obbligatorio | Note |
|-------|------|-------------|------|
| `id` | uuid (PK) | si | |
| `id_numero` | string (unique) | si | Es. `OEL-172`, `INS-10` |
| `tipo` | string (enum: oel, ins, extra) | si | |
| `numero_progressivo` | integer | no | |
| `display_title` | string | si | Es. "Ombre e Luci n. 172" |
| `titolo_tema` | string | no | Tema del numero |
| `descrizione` | text | no | |
| `anno_pubblicazione` | integer | no | |
| `periodo_label` | string | no | Es. "Autunno 2024" |
| `copertina` | M2O → `directus_files` | no | |
| `pdf_archive_url` | string | no | Link Archive.org — non migriamo i PDF |
| `wp_url` | string | no | URL WordPress originale |

### 2.4 Collection: `temi`

| Campo | Tipo | Obbligatorio | Note |
|-------|------|-------------|------|
| `id` | uuid (PK) | si | |
| `slug` | string (unique) | si | |
| `nome` | string | si | Es. "Spiritualita e disabilita" |
| `descrizione` | text | no | |
| `cluster_id` | integer | no | Corrispondenza con cluster AiOeL |
| `colore_hex` | string | no | Per visualizzazione UI |

### 2.5 Collection: `tags`

| Campo | Tipo | Obbligatorio | Note |
|-------|------|-------------|------|
| `id` | uuid (PK) | si | |
| `slug` | string (unique) | si | |
| `nome` | string | si | |
| `fonte` | string (enum: manuale, aioel) | no | Traccia l'origine del tag |

### 2.6 Collection: `embeddings` (pgvector)

Questa collection e gestita direttamente su PostgreSQL — non tramite Directus — perche Directus non ha supporto nativo per il tipo `vector`. Vedere sezione 3.4.

### 2.7 Collection: `commenti_storici`

| Campo | Tipo | Obbligatorio | Note |
|-------|------|-------------|------|
| `id` | uuid (PK) | si | |
| `articolo` | M2O → `articoli` | si | |
| `wp_comment_id` | integer | no | ID originale WordPress |
| `autore_nome` | string | no | |
| `autore_email` | string | no | Campo privato |
| `testo` | text | si | |
| `data` | datetime | si | |
| `approvato` | boolean | si | Default: true (erano gia approvati) |

---

## 3. Architettura Tecnica

### 3.1 Come Astro legge i dati da Directus a build time

Astro rimane 100% statico. Non cambia nulla nel modo in cui genera HTML — cambia solo la sorgente dei dati.

Oggi Astro legge da file `.md` via `getCollection('blog')`. Dopo la migrazione, Astro chiamera le API Directus durante la build.

Struttura delle chiamate a build time:

```
Cloudflare Pages build
  └── npm run build (astro build)
       ├── GET /items/articoli?filter[stato][_eq]=published&limit=-1&fields=... (expand M2M tag/temi se previsto)
       ├── GET /items/autori?limit=-1
       ├── GET /items/numeri_rivista?limit=-1
       ├── GET /items/temi?limit=-1
       └── GET /items/tags?limit=-1
```

Le chiamate usano un token API Directus con permessi read-only, memorizzato come variabile d'ambiente in Cloudflare Pages (`DIRECTUS_TOKEN`, `DIRECTUS_URL`).

I `getStaticPaths()` nelle pagine Astro vengono riscritti da:

```typescript
// Prima (file system)
const allArticles = await getCollection('blog');
```

a:

```typescript
// Dopo (API Directus)
const res = await fetch(`${DIRECTUS_URL}/items/articoli?filter[stato][_eq]=published&limit=-1`, {
  headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` }
});
const { data: allArticles } = await res.json();
```

Il JSON restituito da Directus rimpiazza il frontmatter YAML. I nomi dei campi devono essere mappati o allineati durante la migrazione.

#### Permessi: Read su `articoli_tags` e `articoli_temi`

Le junction **M2M** (`articoli_tags`, `articoli_temi`) non sono visibili in lettura se la **policy** collegata al chiamante non include permesso **read** su quelle collection. Sintomo tipico: expand dei tag/temi sugli articoli o `GET /items/articoli_*` che rispondono **403**.

**Da fare per entrambi:** (1) ruolo **Public**, se consenti accesso anonimo alle API necessarie; (2) **ruolo dell’utente a cui è legato il token statico** usato da Astro (`DIRECTUS_TOKEN`).

**Opzione UI — consigliata**

1. **Settings** → **Access Control**
2. Apri la **policy** usata dal ruolo **Public** e aggiungi **Read** sulle collection **`articoli_tags`** e **`articoli_temi`** (tutti i campi o almeno le FK verso `articoli` / `tags` / `temi`).
3. Ripeti sulla **policy** del ruolo associato al **token Astro** (stesso permesso Read sulle due junction).

**Opzione API (Directus 11+)**

- Legare policy al ruolo, ad es. richiesta del tipo **`PATCH /roles/{public_role_id}/policies`** (o equivalente visibile nel network del browser quando salvi da Access Control) oppure **`PATCH /roles/{role_id}`** con il payload M2M ruolo–policy previsto dalla tua versione.
- Aggiungere le regole **`read`** sulle collection `articoli_tags` e `articoli_temi` **sulla policy** interessata tramite **`POST /permissions`** (o modifica da app), non solo sul ruolo: in v11 i permessi appartengono alle policy.

Documentazione ufficiale: [Roles](https://directus.io/docs/api/roles), [Policies](https://directus.io/docs/api/policies), [Permissions](https://directus.io/docs/api/permissions).

**Performance build con 3488 articoli via API:**

Con 3488 articoli, la build Astro oggi e lenta anche su file system. Via API il collo di bottiglia e la latenza di rete verso il VPS Hetzner. Mitigazioni:

- Usare `limit=-1` in un'unica chiamata per collection (Directus supporta fino a ~50.000 item in una singola risposta)
- Abilitare HTTP keep-alive tra Astro e Directus
- Valutare se la build di Cloudflare Pages ha routing preferenziale verso EU — Hetzner CX22 e in Germania
- Stimare: 1 chiamata API che ritorna 3488 oggetti JSON a ~2KB l'uno = ~7MB di payload, accettabile

### 3.2 Come funziona il rebuild alla pubblicazione

```
Redattore pubblica articolo in Directus
  └── Directus webhook (evento: items.update dove stato = published)
       └── POST https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/{HOOK_ID}
            └── Cloudflare Pages avvia build
                 └── astro build legge da Directus
                      └── Nuovo HTML statico deployato
```

Configurazione:

1. In Cloudflare Pages: creare un Deploy Hook (URL univoco)
2. In Directus: Flussi (Flows) → trigger "Event Hook" su `items.update` con filtro `stato = published` → azione HTTP request al Deploy Hook

Limite: il rebuild richiede 2-4 minuti. Non c'e preview istantanea. Per un settimanale e accettabile.

### 3.3 Come AiOeL legge e scrive su Directus

AiOeL e un sistema esterno (script Python o servizio) che interagisce con Directus tramite API REST con un token dedicato a permessi elevati (lettura + scrittura su `articoli`, `tags`, `embeddings`).

**Flusso lettura (es. articoli senza embedding):**

```
AiOeL
  └── GET /items/articoli?filter[umap_x][_null]=true&fields=id,titolo,corpo,slug
       └── riceve lista articoli da elaborare
```

**Flusso scrittura (es. aggiorna embedding e tag suggeriti):**

```
AiOeL
  └── PATCH /items/articoli/{id}
       body: { umap_x: 5.2, umap_y: 6.8, umap_z: 9.3, cluster_id: 4 }
  └── POST /items/tags (se tag non esiste)
       body: { slug: "...", nome: "...", fonte: "aioel" }
  └── POST /items/articoli_tags_1 (junction table M2M)
       body: { articoli_id: "{id}", tags_id: "{tag_id}" }
```

Per gli embedding vettoriali (similarity search) vedere sezione 3.4.

### 3.4 Integrazione pgvector per similarity search

Directus non espone il tipo PostgreSQL `vector` nativamente. La soluzione e gestire la tabella embeddings direttamente su PostgreSQL, parallelamente a Directus.

**Setup pgvector:**

```sql
-- Eseguire una volta sul database PostgreSQL di Directus
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE embeddings (
    id          SERIAL PRIMARY KEY,
    articolo_id UUID NOT NULL REFERENCES articoli(id) ON DELETE CASCADE,
    modello     TEXT NOT NULL DEFAULT 'text-embedding-3-small',
    dimensioni  INTEGER NOT NULL DEFAULT 1536,
    embedding   vector(1536),
    creato_il   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(articolo_id, modello)
);

-- Indice HNSW per similarity search efficiente
CREATE INDEX ON embeddings USING hnsw (embedding vector_cosine_ops);
```

La tabella `articoli` in Directus non conosce questa tabella — il join avviene lato AiOeL.

**Come AiOeL scrive embedding:**

```python
# AiOeL scrive direttamente via psycopg2/asyncpg
import psycopg2
from pgvector.psycopg2 import register_vector

conn = psycopg2.connect(DATABASE_URL)
register_vector(conn)

# Aggiunge o aggiorna embedding
with conn.cursor() as cur:
    cur.execute("""
        INSERT INTO embeddings (articolo_id, embedding)
        VALUES (%s, %s)
        ON CONFLICT (articolo_id, modello)
        DO UPDATE SET embedding = EXCLUDED.embedding
    """, (articolo_uuid, np.array(embedding_vector)))
conn.commit()
```

**Come AiOeL legge articoli simili:**

```python
# Trova i 5 articoli piu simili semanticamente
cur.execute("""
    SELECT a.id, a.slug, a.titolo,
           1 - (e.embedding <=> %s) AS similarity
    FROM embeddings e
    JOIN articoli a ON a.id = e.articolo_id
    WHERE a.stato = 'published'
    ORDER BY e.embedding <=> %s
    LIMIT 5
""", (np.array(query_embedding), np.array(query_embedding)))
```

**Sicurezza:** AiOeL ha accesso diretto al database solo dall'interno del VPS (connessione locale 127.0.0.1 o rete privata Hetzner). Non esporre PostgreSQL su IP pubblico.

### 3.5 Come si gestisce il multilingua in Astro

Approccio attuale: campo `lang` nel frontmatter, articoli EN in `src/content/blog/en/`. Due articoli con stesso `wp_id` ma `lang` diverso sono la coppia IT/EN.

Dopo la migrazione su Directus, l'approccio rimane identico ma la relazione e esplicita nel campo `articolo_traduzione` (M2O che punta alla versione nell'altra lingua).

**URL struttura:**

```
ombreeluci.it/it/nome-articolo/   → articolo in italiano
ombreeluci.it/en/article-name/    → articolo in inglese
```

**Hreflang in Astro:**

```astro
<!-- Nel <head> del layout articolo -->
{articolo.traduzione && (
  <>
    <link rel="alternate" hreflang="it" href={`https://ombreeluci.it/it/${articolo.slug}/`} />
    <link rel="alternate" hreflang="en" href={`https://ombreeluci.it/en/${traduzione.slug}/`} />
  </>
)}
```

Il `LanguageSelector` gia presente nel codice usa `wp_id` per trovare la coppia — dopo la migrazione usera il campo `articolo_traduzione`.

---

## 4. Piano di Migrazione

### Step 0 — Pulizia preventiva del corpus

**Obiettivo:** arrivare allo Step 4 (migrazione articoli) con dati sorgente il piu puliti possibile, riducendo il debito tecnico che altrimenti si accumulerebbe in Directus.

Questo step e **obbligatorio**: dati sporchi o troncati in Directus compromettono direttamente la qualita dei suggerimenti AiOeL (embeddings calcolati su testo incompleto producono cluster semantici errati). La pulizia su file locali con Python e almeno 10 volte piu veloce che la stessa operazione su un CMS in produzione. Non esiste un momento migliore per farlo che prima della migrazione.

**Azioni:**

1. **Verifica corpora incompleti:** per ogni articolo in `articoli_semantici_FULL_2026.json`, confrontare `html_pulito` con la pagina WordPress live. Identificare articoli con body significativamente piu corto del sito live (possibile troncatura durante l'export).

2. **Estrazione didascalie immagini:** l'HTML di molti articoli contiene tag `<img>` con attributi `alt` o blocchi `<figure>/<figcaption>` con didascalie. Estrarre e normalizzare questi elementi prima della migrazione per assicurare che l'editor Directus li preservi correttamente.

3. **Normalizzazione link interni:** gli articoli contengono link interni assoluti del tipo `https://www.ombreeluci.it/1983/nome-articolo/`. Un regex pass sul corpus li sostituisce con il nuovo URL relativo `/it/nome-articolo/` (struttura URL scelta: Opzione A, D1 chiusa). Questo risolve M13 a monte, senza dover gestire il problema articolo per articolo in Directus.

4. **Completamento dati autori:** per gli autori con `bio_html` vuota in `database_autori.json`, verificare se la pagina autore WordPress e ancora disponibile e, se si, estrarre la bio via scraping. Il campo `url_wp` aggiunto in 2.2 serve a questo.

**Strumenti:** script Python su `articoli_semantici_FULL_2026.json` e `database_autori.json`. Non tocca Directus, non tocca il sito live.

**Stima:** 2-3 giorni di lavoro (scrittura script + revisione risultati + correzioni manuali).

---

### Step 1 — Setup VPS Hetzner

**Obiettivo:** server funzionante, raggiungibile, sicuro.

**Azioni:**
1. Creare VPS CX32 su Hetzner Cloud (4 vCPU, 8GB RAM, Ubuntu 24.04 LTS, Germania)
2. Configurare firewall Hetzner: porte 22 (SSH limitato a IP fisso), 80, 443
3. Installare Docker + Docker Compose
4. Configurare Nginx come reverse proxy con SSL (Let's Encrypt via Certbot)
5. Creare sottodominio dedicato: `cms.ombreeluci.it`

**Stima:** 2-4 ore.

### Step 2 — Installazione Directus + PostgreSQL

**Obiettivo:** Directus raggiungibile su `cms.ombreeluci.it`, database PostgreSQL operativo.

**docker-compose.yml minimo:**

```yaml
services:
  database:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: directus
      POSTGRES_USER: directus
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}

  directus:
    image: directus/directus:latest
    depends_on: [database]
    environment:
      DB_CLIENT: pg
      DB_HOST: database
      DB_PORT: 5432
      DB_DATABASE: directus
      DB_USER: directus
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      SECRET: ${DIRECTUS_SECRET}
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      STORAGE_LOCATIONS: r2
      STORAGE_R2_DRIVER: s3
      STORAGE_R2_KEY: ${R2_ACCESS_KEY}
      STORAGE_R2_SECRET: ${R2_SECRET_KEY}
      STORAGE_R2_ENDPOINT: ${R2_ENDPOINT}
      STORAGE_R2_BUCKET: oel-media
    volumes:
      - uploads:/directus/uploads
    ports:
      - "8055:8055"

volumes:
  pgdata:
  uploads:
```

**Azioni dopo l'avvio:**
1. Accedere all'interfaccia admin di Directus
2. Creare manualmente le collection secondo lo schema sezione 2
3. Installare pgvector: `docker exec -it <db_container> psql -U directus -c "CREATE EXTENSION vector;"`
4. Creare la tabella `embeddings` (SQL sezione 3.4)
5. Creare token API per Astro (read-only) e per AiOeL (read-write)

**Stima:** 4-8 ore.

### Step 3 — Configurazione Cloudflare R2

**Obiettivo:** bucket R2 configurato, Directus capace di uploadare file.

**Azioni:**
1. Creare bucket R2 `oel-media` nella dashboard Cloudflare
2. Creare API token R2 con permessi `Object:Write` sul bucket
3. Configurare dominio pubblico per R2 (es. `media.ombreeluci.it`) — gratuito con Cloudflare
4. Testare upload da Directus: caricare un'immagine di prova, verificare che l'URL sia raggiungibile
5. Configurare CORS sul bucket R2 se necessario per l'editor Directus

**Stima:** 2-3 ore.

### Step 4 — Script migrazione articoli .md → Directus

**Obiettivo:** tutti i 3488 articoli importati in Directus con campi corretti.

**Sorgenti dati:**
- File `.md` in `src/content/blog/` → corpo articolo + frontmatter base
- `articoli_semantici_FULL_2026.json` → `html_pulito` (il testo completo, HTML gia pulito)
- `articoli_megacluster.json` → `img_copertina_url`, `sottotitolo`, embedding UMAP
- `database_autori.json` → mapping autore stringa → UUID autore in Directus

**Strategia:** usare `html_pulito` dal JSON come `corpo`, non il Markdown (il Markdown di molti articoli e troncato o vuoto — i file `.md` contengono placeholder come `<!-- Contenuto da aggiungere -->`).

**Script Python (pseudocodice logico):**

```python
# 1. Crea autori in Directus (idempotente via slug)
for autore in database_autori:
    upsert_via_api("/items/autori", { slug: autore.slug, nome_completo: autore.nome_completo, ... })

# 2. Crea numeri rivista in Directus
for numero in numeri_wp_FINAL:
    upsert_via_api("/items/numeri_rivista", { id_numero: numero.id_numero, ... })

# 3. Per ogni articolo nel JSON semantico
for articolo in articoli_semantici_FULL_2026:
    autore_id = lookup_autore_by_nome(articolo.meta.author)
    numero_id = lookup_numero_by_id(articolo.meta.issue_number)
    megacluster_data = megacluster.byId.get(str(articolo.id), {})

    payload = {
        "wp_id": articolo.id,
        "slug": slug_from_md_file or generate_slug(articolo.meta.title),
        "lang": "it",
        "titolo": articolo.meta.title,
        "corpo": articolo.html_pulito,
        "stato": "published",
        "data_pubblicazione": articolo.meta.date,
        "autore": autore_id,
        "numero_rivista": numero_id,
        "cluster_id": megacluster_data.cluster_id,
        "umap_x": megacluster_data.umap_x,
        "original_url": articolo.url,
        "immagine_copertina": megacluster_data.img_copertina_url,  # da migrare in Step 6
        ...
    }
    upsert_via_api("/items/articoli", payload, unique_key="wp_id")
```

**Nota:** gli articoli EN gia presenti in `src/content/blog/en/` vanno importati con `lang: "en"` e il campo `articolo_traduzione` collegato alla versione IT corrispondente via `wp_id`.

**Stima:** 8-16 ore (scrittura script + test + esecuzione + correzioni).

### Step 5 — Script migrazione tassonomia e tag

**Obiettivo:** categorie, tag WordPress e cluster semantici importati come `temi` e `tags` in Directus.

**Azioni:**
1. Estrarre tutte le categorie uniche da `articoli_semantici_FULL_2026.json` → `tax.categories`
2. Estrarre tutti i tag unici → `tax.tags`
3. Importare i 13 cluster semantici come `temi` (gia nominati in `PROPOSTA_NAMING_CLUSTER.md`)
4. Creare le relazioni M2M articolo-tema basate su `cluster_id`
5. Importare i tag WP originali come `tags` con `fonte: "manuale"`

**Stima:** 4-6 ore.

### Step 6 — Migrazione immagini (URL esterni → R2)

**Obiettivo:** le immagini di copertina, oggi puntate come URL `wp-content/uploads/...` su `ombreeluci.it`, vengono spostate su R2.

**Strategia:**
1. Raccogliere tutti gli URL immagine unici da `mappa_immagini_v1.json` e da `megacluster`
2. Scaricare ogni immagine (rispettando rate limit, controllare che il vecchio WP risponda)
3. Uploadare su R2 tramite API Cloudflare o via Directus
4. Aggiornare il campo `immagine_copertina` in Directus con il nuovo file ID

**Rischio:** il vecchio sito WordPress potrebbe non essere piu attivo. Se le immagini non sono piu raggiungibili, il campo resta vuoto e si usa il placeholder.

**Stima:** 4-8 ore (dipende dal numero di immagini disponibili e dalla velocita di download).

### Step 7 — Migrazione commenti storici

**Obiettivo:** `commenti_storici.json` importato in Directus come collection read-only.

**Azioni:**
1. Creare la collection `commenti_storici` in Directus
2. Script Python che legge il JSON e chiama POST `/items/commenti_storici` per ogni commento
3. Collegare ogni commento all'articolo corrispondente via `wp_id`

**Stima:** 2-4 ore.

### Step 8 — Aggiornamento Astro per leggere da API

**Obiettivo:** il sito Astro legge da Directus invece che da file `.md`.

**Azioni:**
1. Creare `src/lib/directus.ts` — wrapper per le chiamate API con gestione errori e caching
2. Riscrivere `getStaticPaths()` in ogni pagina Astro dinamica:
   - `src/pages/blog/[...slug].astro`
   - `src/pages/archivio/[issue].astro`
   - `src/pages/autori/[slug].astro`
   - `src/pages/categoria/[categoria].astro`
3. Rimuovere la dipendenza da `getCollection('blog')` — smettere di usare Astro Content Collections
4. Aggiornare `src/data/articoli_megacluster.json` → i dati arricchiti ora vengono da Directus direttamente
5. Aggiornare i redirect: aggiungere in `public/_redirects` le regole per `/?p={wp_id}` → slug

**Stima:** 16-30 ore (e il passo piu complesso — tocca ogni pagina del sito).

### Step 9 — Configurazione redirect SEO

**Obiettivo:** nessun URL vecchio finisce in 404.

**Redirect necessari — tre categorie:**

1. **URL WordPress con query string** (tutti gli articoli):
   ```
   /?p=43   /it/ombre-e-luci/    301
   /?p=65   /it/editoriale-n1/   301
   ```

2. **URL WordPress con data** (articoli pre-2020 circa):
   ```
   /1983/03/ombre-e-luci/   /it/ombre-e-luci/   301
   ```

3. **Prefisso lingua IT (implicazione D1 chiusa):** poiche la struttura URL scelta e `/it/slug/`, tutti i 3488 URL italiani esistenti nella forma `/slug/` devono essere redirectati:
   ```
   /ombre-e-luci/   /it/ombre-e-luci/   301
   ```
   Questo aggiunge ~3488 righe al file `_redirects`. Cloudflare Pages supporta fino a 2000 redirect statici nel file `_redirects`; per volumi superiori e necessario usare un Cloudflare Worker o le regole di redirect nella dashboard (fino a 1000 regole nel piano free, illimitate nel piano Pro).

Lo script di migrazione genera la collection `redirects` in Directus partendo dal campo `original_url` e `slug` di ogni articolo. Il file `public/_redirects` viene generato da quella collection.

**Azione aggiuntiva:** verificare il limite Cloudflare Pages redirect prima del cutover e scegliere la strategia (file statico vs Worker vs dashboard rules).

**Stima:** 4-6 ore (aumentata rispetto alla stima precedente per includere la gestione dei redirect `/slug/ → /it/slug/`).

### Step 10 — Testing e validazione

**Checklist:**
- [ ] Tutti i 3488 articoli accessibili sul frontend
- [ ] Nessun link interno rotto (usare `linkchecker` o equivalente)
- [ ] Immagini caricate correttamente
- [ ] Hreflang corretto sugli articoli con traduzione EN
- [ ] Redirect 301 funzionanti per URL WordPress
- [ ] Webhook rebuild funzionante: pubblicare un articolo di test, verificare che il sito si aggiorni
- [ ] Permessi ruoli: verificare che un redattore non possa pubblicare direttamente
- [ ] AiOeL: test lettura articoli senza embedding, test scrittura embedding
- [ ] Performance build: misurare il tempo di build con dati reali

**Stima:** 8-16 ore.

### Step 11 — Cutover

**Obiettivo:** passare dalla sorgente file `.md` alla sorgente Directus senza downtime.

**Procedura:**
1. Assicurarsi che Directus sia in produzione e raggiungibile da Cloudflare Pages
2. Aggiornare le variabili d'ambiente in Cloudflare Pages (`DIRECTUS_URL`, `DIRECTUS_TOKEN`)
3. Avviare manualmente un build di Cloudflare Pages
4. Verificare che il build completi correttamente
5. Verificare il sito live su 10-20 URL campione
6. Tenere i file `.md` nel repository per 30 giorni come fallback (non cancellarli subito)

**Stima:** 2-4 ore.

### Riepilogo tempi

| Step | Attivita | Stima |
|------|----------|-------|
| 0 | Pulizia preventiva corpus (opzionale) | 16-24 ore |
| 1 | Setup VPS Hetzner | 2-4 ore |
| 2 | Installazione Directus + PostgreSQL | 4-8 ore |
| 3 | Configurazione R2 | 2-3 ore |
| 4 | Script migrazione articoli | 8-16 ore |
| 5 | Script migrazione tassonomia | 4-6 ore |
| 6 | Migrazione immagini | 4-8 ore |
| 7 | Migrazione commenti | 2-4 ore |
| 8 | Aggiornamento Astro | 16-30 ore |
| 9 | Redirect SEO | 2-4 ore |
| 10 | Testing | 8-16 ore |
| 11 | Cutover | 2-4 ore |
| **Totale (senza Step 0)** | | **54-103 ore** |
| **Totale (con Step 0)** | | **70-127 ore** |

Con 1 developer part-time: realistica in 6-12 settimane.

---

## 5. Rischi e Criticita

### R1 — Perdita contenuti durante la migrazione

**Probabilita:** media. **Impatto:** alto.

Il problema reale: molti file `.md` hanno il body vuoto o troncato (`<!-- Contenuto da aggiungere -->`). Il testo completo e nel JSON (`html_pulito`). Se lo script di migrazione legge dal file `.md` invece che dal JSON, importa contenuto vuoto.

**Mitigazione:**
- Lo script deve usare `html_pulito` da `articoli_semantici_FULL_2026.json` come sorgente primaria del corpo
- Validare dopo la migrazione: contare articoli con `corpo` vuoto, confrontare con il numero atteso
- Non cancellare i file `.md` finche la validazione non e completa

### R2 — URL SEO non preservati

**Probabilita:** alta se non gestita. **Impatto:** molto alto.

OEL ha 40 anni di contenuti indicizzati. URL WordPress del tipo `ombreeluci.it/?p=43` o `ombreeluci.it/1983/nome-articolo/` sono presenti su siti esterni, social, newsletter.

**Mitigazione:**
- Generare automaticamente il file `_redirects` a partire dal campo `original_url` di ogni articolo
- Testare i redirect con una lista campione prima del cutover
- Monitorare Google Search Console per 404 nelle settimane successive al cutover

**Nota irreversibile:** se i redirect non vengono configurati correttamente prima del cutover, il danno SEO e immediato e richiede settimane per essere recuperato.

### R3 — Tempo di build Astro via API troppo lento

**Probabilita:** media. **Impatto:** medio.

Con 3488 articoli letti via HTTP anziche da filesystem locale, la build potrebbe essere significativamente piu lenta. Cloudflare Pages ha un timeout di 20 minuti per i build. Il payload piu critico e il campo `corpo` (HTML completo di ogni articolo): se richiesto in bulk per tutti gli articoli, il payload totale supera i 50MB.

**Mitigazione — strategia fetch a due livelli:**

**Chiamata 1 — metadati globali (una volta a build time):**
```
GET /items/articoli
  ?filter[stato][_eq]=published
  &fields=slug,titolo,data_pubblicazione,lang,
          immagine_copertina,autore.nome_completo,
          numero_rivista.id_numero
  &limit=-1
```
Usata per generare `getStaticPaths()` e tutte le pagine lista (archivio, autori, categorie). Restituisce solo metadati, senza il corpo degli articoli. Payload stimato: ~2MB per 3488 articoli.

**Chiamata 2 — contenuto completo (una per ogni pagina articolo):**
```
GET /items/articoli
  ?filter[slug][_eq]=SLUG
  &fields=*,autore.*,temi.*,tags.*,articolo_traduzione.slug
```
Usata solo quando Astro renderizza la singola pagina articolo. Con 3488 articoli in parallel build, Cloudflare Pages parallelizza queste chiamate — il collo di bottiglia diventa la concorrenza verso Directus, non la dimensione del payload.

**Test obbligatorio:** misurare il build time con 100 articoli campione prima di procedere con tutti i 3488. Se il build supera i 15 minuti, valutare la configurazione di un pool di connessioni lato Directus o la riduzione dei `fields` richiesti nella chiamata 2.

### R4 — Mancanza di backup Directus

**Probabilita:** alta se non configurata. **Impatto:** catastrofico.

Un VPS senza backup automatici perde tutto in caso di guasto hardware o errore umano.

**Mitigazione:**
- Abilitare i backup automatici di Hetzner (costo: ~20% del VPS, ~0.80 EUR/mese)
- Configurare `pg_dump` periodico con upload su R2 o altro storage
- Documentare la procedura di restore prima di andare in produzione

**Decisione irreversibile:** tutti i contenuti nuovi creati in Directus dopo il cutover esistono solo in PostgreSQL. Se non c'e backup e il VPS si corrompe, quei contenuti sono persi.

### R5 — Uptime del VPS durante la pubblicazione

**Probabilita:** bassa. **Impatto:** medio.

Il VPS CX32 non ha SLA enterprise. Se il VPS e down mentre la redazione vuole pubblicare, il rebuild non parte.

**Mitigazione:**
- Usare Hetzner con uptime storico del 99.9%
- Il sito rimane comunque servito da Cloudflare Pages (statico) — l'unico impatto e che il nuovo articolo non viene pubblicato finche il VPS non torna su
- Configurare monitoring (UptimeRobot free) con alert email se il VPS non risponde

### R6 — Complessita per la redazione non tecnica

**Probabilita:** alta. **Impatto:** medio.

L'interfaccia Directus e piu complessa di un editor WordPress. I redattori potrebbero fare errori (pubblicare bozze, confondere campi, usare il campo sbagliato per l'immagine).

**Mitigazione:**

**Configurazione permessi ruolo "redattore" (obbligatoria, da fare prima del primo accesso):**

Campi da nascondere all'interfaccia del redattore (tecnici/interni, non devono essere modificabili):
- `wp_id`, `original_url`
- `cluster_id`, `umap_x`, `umap_y`, `umap_z`
- `has_comments`
- `note_redazione` (campo tecnico interno)

Campi visibili e modificabili dal redattore:
- `titolo`, `sottotitolo`, `corpo`
- `immagine_copertina`, `didascalia_copertina`
- `autore`, `numero_rivista`
- `lang`, `stato`
- `seo_title`, `seo_description`
- `tags`, `articolo_traduzione`

Questa restrizione si configura in Directus tramite "Roles & Permissions" → ruolo "Redattore" → collection `articoli` → disabilitare la visibilita dei singoli campi. Non richiede plugin o codice custom.

La pubblicazione finale (passaggio `stato` da `draft` a `published`) deve richiedere il ruolo "Editor" — i redattori possono solo creare e modificare bozze.

**Ulteriori mitigazioni:**
- Creare una guida redazionale con screenshot prima del go-live (fuori scope di questo documento)
- Testare il flusso completo con un redattore reale in staging prima del cutover

### R7 — Immagini storiche non piu disponibili

**Probabilita:** alta. **Impatto:** basso-medio.

Molte immagini sono ospitate sul vecchio WordPress. Se il vecchio WordPress viene spento prima della migrazione immagini, quelle URL non sono piu raggiungibili.

**Mitigazione:**
- Eseguire lo step 6 (migrazione immagini) prima dello spegnimento del vecchio WordPress
- Documentare quali immagini erano gia assenti al momento della migrazione (per non cercarle all'infinito)

---

## 6. Alternative Considerate e Scartate

### Ghost

**Perche considerato:** ottima UI per redazione non tecnica, hosting semplice, buona API.

**Perche scartato:**
- Il multilingua in Ghost non e nativo. La gestione di articoli IT/EN correlati con hreflang richiede workaround non documentati o plugin commerciali.
- Lo schema dati di Ghost e pensato per blog semplici. La struttura OEL (articoli → numeri rivista → temi → autori → embedding) richiederebbe adattamenti significativi.
- Ghost non supporta pgvector o estensioni PostgreSQL custom.
- Il piano Ghost Pro sarebbe troppo costoso; Ghost self-hosted aggiunge complessita operativa simile a Directus ma con meno flessibilita API.

### Payload CMS

**Perche considerato:** TypeScript-nativo, ottima API, schema flessibile, supporto relazioni complesse.

**Perche scartato:**
- Setup e manutenzione piu complessi rispetto a Directus: richiede di scrivere lo schema in TypeScript e mantenere le migrazioni database a mano.
- Nessuna UI admin pronta per utenti non tecnici senza personalizzazione.
- La community e piu piccola di Directus: meno documentazione, meno plugin.
- Con 1 developer part-time, il costo di setup e manutenzione e troppo alto rispetto al beneficio.

### Keystatic (gia in uso parzialmente)

**Perche considerato:** gia presente nel progetto (`keystatic-oel` directory), basato su file Git, zero infrastruttura.

**Perche scartato come CMS primario:**
- Keystatic lavora su file Git. Con 3488 file `.md` e una redazione non tecnica, il workflow Git e un ostacolo reale.
- Non supporta query semantiche, embedding, o relazioni complesse tra contenuti.
- Non ha un'interfaccia adatta per la gestione di numeri rivista, autori, temi come entita separate.
- Rimane utile come CMS per pagine statiche (chi siamo, contatti) ma non per l'archivio articoli.

---

## 7. Decisioni Aperte

Le seguenti decisioni richiedono input della redazione o del developer prima di procedere con la migrazione. Le decisioni gia chiuse sono in sezione 8.

### D2 — Gestione articoli con corpo vuoto

Circa X articoli (da quantificare) hanno il corpo vuoto nel JSON (`html_pulito` e null o una stringa vuota). Questi sono articoli storici mai digitalizzati.

**Opzione A:** importarli comunque in Directus come bozze, lasciando il corpo vuoto
**Opzione B:** importarli come pubblicati ma con un disclaimer "contenuto non ancora disponibile in formato digitale"
**Opzione C:** non importarli — tenerli solo come riferimento nel numero rivista

**Impatto:** medio — determina quanti articoli saranno visibili sul frontend.

### D3 — Commenti nuovi: si o no

La sezione commenti e stata disattivata. I commenti storici sono in archivio JSON.

**Opzione A:** mostrare solo i commenti storici (read-only), nessun nuovo commento
**Opzione B:** riattivare i commenti con moderazione in Directus
**Opzione C:** usare un servizio esterno (Disqus, Isso) per i nuovi commenti

**Impatto:** basso in fase 1 — puo essere deciso dopo il cutover.

### D4 — Articoli troncati: piano di completamento

Il JSON `articoli_semantici_FULL_2026.json` contiene il testo completo (`html_pulito`) di alcuni articoli, ma non di tutti. Esiste un piano di lavoro per completare l'archivio (scansione, trascrizione, ecc.)?

Senza questa informazione e difficile stimare quanti articoli saranno effettivamente leggibili dopo la migrazione.

### D5 — pgvector: quando attivare

L'integrazione pgvector (sezione 3.4) richiede che AiOeL abbia accesso diretto al database PostgreSQL. Questo significa che:
- AiOeL deve girare sullo stesso VPS (o su un VPS nella stessa rete privata Hetzner)
- Oppure la porta PostgreSQL deve essere esposta con autenticazione forte (sconsigliato)

**Decisione richiesta:** dove gira AiOeL? Script locale sul laptop del developer, su un server dedicato, o come processo sul VPS Hetzner?

### D7 — Migrazione contenuti EN gia esistenti

Nel repository ci sono articoli EN in `src/content/blog/en/` e nella directory `keystatic-oel`. La lista precisa e il loro stato (tradotti, parziali, bozze) non e chiara da questa analisi.

**Richiesta:** un inventario degli articoli EN esistenti e del loro stato di completamento prima di pianificare la migrazione.

---

## 8. Decisioni Chiuse

Decisioni risolte e non piu aperte. Registrate qui per tracciabilita.

### D1 — Struttura URL multilingua

**Chiusa il:** 2026-03-20
**Decisione:** Opzione A — prefisso lingua su tutti gli articoli.

URL finale: `ombreeluci.it/it/slug-articolo/` e `ombreeluci.it/en/article-slug/`.

**Implicazione diretta:** redirect 301 per tutti i 3488 articoli italiani esistenti dalla forma `/slug/` alla forma `/it/slug/`. Questo si aggiunge ai redirect per gli URL WordPress (`/?p=ID`, `/anno/mese/slug/`). Vedere Step 9 per la gestione del limite redirect di Cloudflare Pages.

**Motivazione:** struttura simmetrica tra le due lingue, piu facile da gestire in Astro, coerente con le best practice hreflang. Il costo in termini di redirect e un costo una tantum accettabile.

### D6 — Dimensionamento VPS

**Chiusa il:** 2026-03-20
**Decisione:** Hetzner CX32 (4 vCPU, 8GB RAM, 80GB SSD, ~8 EUR/mese).

CX22 (4GB RAM) e insufficiente: PostgreSQL + pgvector con dataset embedding completo occupa 2-3GB di working set, lasciando meno di 1GB per Directus e sistema operativo. Il rischio OOM in produzione non e accettabile. La differenza di 4 EUR/mese e trascurabile.

### D8 — Link interni nel corpo degli articoli

**Chiusa il:** 2026-03-20
**Decisione:** Opzione A — regex pass sul corpus durante Step 0.

Tutti gli URL interni assoluti WordPress nel corpo degli articoli vengono sostituiti con URL relativi nella forma `/it/slug/` durante lo Step 0 (pulizia preventiva corpus). Gli URL non mappati vengono lasciati invariati e coperti dalla collection `redirects` come fallback.

**Dipendenza risolta:** questa decisione dipendeva da D1 (struttura URL), ora anch'essa chiusa.

---

*Fine documento. Versione 1.2 — 2026-03-20.*
