# Roadmap Automazione Editoriale — Ombre e Luci

**Ultimo aggiornamento:** 2026-05-29
**Owner:** SegreteriaFL

## Principio guida

Il redattore scrive solo in italiano. Il sistema fa il resto.

---

## Nota strategica — Agente editoriale AI (da valutare)

Durante la sessione 2026-05-29 è emersa una visione alternativa
all'automazione via CMS: un agente editoriale conversazionale
dove il redattore interagisce direttamente con Claude (via Claude Code,
Cursor o interfaccia dedicata) invece che con la UI di Directus.
Redattore → Claude (chat)
│
├── Incolla testo articolo
├── Fornisce foto, didascalia, autore, categoria
├── Dice "pubblica"
│
└── Claude:
├── Crea articolo in Directus via API
├── Assegna tutti i metadati
├── Carica immagine su R2
├── Traduce in EN/ES/FR via Claude API
├── Calcola embedding e aggiorna correlati
├── Pubblica tutto
└── Restituisce URL produzione

**Implicazioni:**
- Directus diventa database con API, non interfaccia primaria
- La scelta del CMS diventa secondaria (Directus o Payload equivalenti)
- Le Fasi 2 e 3 della roadmap perdono urgenza (gestite dall'agente)
- La Fase 4 (embeddings/correlati) rimane prioritaria — è infrastruttura
  dati indipendente dall'interfaccia
- L'agente deve essere proattivo: chiedere foto, didascalia, autore,
  numero rivista se il redattore non li fornisce spontaneamente

**Prerequisiti per questo modello:**
- Verificare che Matteo e Cristina (redattori) siano a proprio agio
  con Claude Code / Cursor — da chiedere esplicitamente
- Definire l'interfaccia: Claude.ai con progetto configurato
  vs webapp minimale dedicata
- Script/tool definitions per le operazioni Directus+R2+OpenAI: effort M
- Gestione errori e rollback: effort M

**Modello ibrido consigliato:**
Agente per pubblicazione nuovi articoli (flusso veloce) +
Directus UI per correzioni puntuali e audit (flusso preciso).
Non è o/o.

**Trigger per rivalutazione:** quando il volume supera 10 articoli/mese
e il flusso semi-manuale attuale diventa collo di bottiglia operativo.

---

## Nota strategica — Pivot CMS Directus → Payload (da valutare)

**Contesto:** Directus è stato scelto pochi mesi fa. Il sito è live
da maggio 2026. La scelta era sensata per il use case editoriale statico,
ma le automazioni richieste (traduzione, semantizzazione, sync metadati)
richiedono workaround costosi a causa dei limiti della sandbox Directus
(Flow senza fetch nativo, hook limitati, i18n non nativo).

**Payload CMS — vantaggi rispetto a Directus:**

| Aspetto | Payload | Directus |
|---|---|---|
| Automazioni | Hook nativi beforeChange/afterChange — 15 righe invece di Flow+endpoint+workaround | Sandbox limitata, fetch non disponibile |
| i18n | Localizzazione nativa per campo (titolo.it, titolo.en) | Record separati per lingua, sync manuale |
| Type safety | Schema TypeScript — zero disallineamenti | Tipi scritti a mano, spesso sfasati |
| Migrazioni | Versionate nel codice | Manuali via API/UI |
| Admin UI | Più tecnica | Più curata — redattori già formati |

**Effort pivot stimato:**
- Script migrazione dati (7.000 articoli + relazioni): L
- Riscrittura schema Payload: M
- Riscrittura layer directus.ts: M
- Test e QA: M
- Totale: ~3-4 settimane dev a tempo pieno

**Stack target se si pivota:**
- Payload CMS v3 + PostgreSQL (stesso DB, stessa istanza VPS)
- Astro rimane invariato — solo src/lib/directus.ts cambia
- Stesso VPS Hetzner, stesso Cloudflare

**Trigger per rivalutazione:**
1. Automazioni manuali richiedono >2h/settimana di intervento tecnico
2. Avvio fedeeluce.it — quel momento è il punto di minor costo per
   il pivot: fedeeluce.it parte su Payload e condivide infrastruttura
   con OEL senza il debito tecnico attuale
3. Volume nuovi articoli > 20-30/mese con pipeline semi-manuale
   insostenibile

**Decisione attuale:** mantenere Directus e completare la roadmap.
Rivalutare al trigger 2 (avvio fedeeluce.it).

---

## Fase 1 — Fondamenta
**Effort: S — 1-2 giorni**
**Prerequisito per tutto il resto**

| Task | Cosa | Note |
|---|---|---|
| 1.1 | Swap 2GB sul VPS | Procedura già in RUNBOOK.md — eseguire prima di operazioni batch |
| 1.2 | Colonna `embedding vector(3072)` in PostgreSQL | `ALTER TABLE articoli ADD COLUMN embedding vector(3072)` |
| 1.3 | Popolamento colonna dai `.npy` esistenti | Script Python: legge embeddings_arricchiti.npy, INSERT via psycopg2. 3488 articoli |
| 1.4 | Fix 18 EN orfani senza `articolo_traduzione` | Prerequisito per sync metadati Fase 2 |

---

## Fase 2 — Sincronizzazione metadati IT→lingue tradotte
**Effort: S+M — 2-3 giorni**

**Obiettivo:** il redattore aggiunge/modifica un campo sull'IT
e tutte le traduzioni si aggiornano entro 30 secondi senza
intervento manuale.

| Task | Cosa | Note |
|---|---|---|
| 2.1 | Flow Directus + endpoint: sync campi scalari IT→EN | Campi: autore, numero_rivista, categoria_menu, data_pubblicazione, forma, ruolo_editoriale. Pattern già noto: ALGOLIA-05 |
| 2.2 | Endpoint Astro + Flow: sync tag M2M IT→EN | Junction table articoli_tags. Richiede endpoint esterno (sandbox Directus senza fetch) |
| 2.3 | Sync temi M2M IT→EN | Stesso pattern di 2.2 — junction articoli_temi |
| 2.4 | Architettura N lingue | Stessa logica si estende a ES/FR: lookup su tutti i record collegati via articolo_traduzione, non solo il primo |

**Dipendenze:** Fase 1.4 completata (18 orfani fixati).

---

## Fase 3 — Traduzione automatica triggered
**Effort: M — 3-5 giorni**

**Obiettivo:** il redattore pubblica l'IT e EN appare entro
2-3 minuti senza intervento umano.

| Task | Cosa | Note |
|---|---|---|
| 3.1 | Endpoint CF Pages `/api/translate` | Riceve articolo IT, chiama Claude API (Haiku per costo), crea/aggiorna EN via Directus API |
| 3.2 | Flow Directus: trigger su `stato → published` | Chiama endpoint 3.1 automaticamente alla pubblicazione |
| 3.3 | Logica smart | Crea EN se non esiste. Se esiste: aggiorna solo titolo/corpo/sottotitolo/didascalie — non sovrascrive correzioni manuali sui campi tradotti |
| 3.4 | Estensione ES/FR | Aggiungere target_lang al payload — zero modifiche architetturali |

**Dipendenze:** Anthropic API key in CF Pages secrets.

---

## Fase 4 — Semantizzazione automatica e correlati
**Effort: M — 3-4 giorni**

**Obiettivo:** ogni articolo pubblicato viene embeddato e
ottiene 20 correlati reali entro 5 minuti. Zero loop di
navigazione per il lettore.

### Logica correlati aggiornata

**Problema attuale:** K=5 crea loop — dopo 2-3 click si
rientra negli stessi articoli già letti.

**Soluzione:**
- Rosa interna: K=20 vicini per ogni articolo (pgvector KNN)
- Frontend articolo: mostra 6 articoli scelti dalla rosa 20,
  con esclusione dell'articolo corrente e degli articoli già
  visitati nella sessione (sessionStorage)
- Homepage e altri contesti: stessa rosa 20, criteri diversi
  (varietà categoria, recency, ruolo editoriale)

| Task | Cosa | Note |
|---|---|---|
| 4.1 | Endpoint CF Pages `/api/embed` | Riceve slug, chiama OpenAI text-embedding-3-small, salva in pgvector |
| 4.2 | Flow Directus: trigger su pubblicazione | Chiama 4.1 dopo Fase 3 (traduzione completata) |
| 4.3 | KNN diretto su pgvector K=20 | Sostituisce JSON statico per articoli nuovi. Query: `ORDER BY embedding <=> $new_embedding LIMIT 20` |
| 4.4 | Frontend articolo: rosa 20 con sessionStorage | 6 articoli visibili, esclusione già visitati, no loop |
| 4.5 | Homepage: correlati variati da rosa 20 | Priorità a varietà categoria e recency |
| 4.6 | Ricalcolo UMAP completo | Batch offline mensile — script Python locale o VPS con swap |

**Dipendenze:** OpenAI API key, Fase 1 completata.

---

## Fase 5 — Suggerimenti real-time durante la scrittura
**Effort: XL — progetto separato, lungo termine**

| Task | Cosa | Note |
|---|---|---|
| 5.1 | Pagina redazione `/redazione/suggerimenti` | Soluzione intermedia: dato testo, restituisce correlati via pgvector. Nessuna extension Directus |
| 5.2 | Extension Directus custom Vue.js | Soluzione completa: sidebar in Directus con suggerimenti link interni e articoli correlati durante la scrittura |

**Non blocca nessuna fase precedente.**
**Da valutare dopo Fase 4 stabile.**

---

## Sequenza e dipendenze
Fase 1 (fondamenta) — prerequisito per tutto
│
├──→ Fase 2 (sync metadati) — valore immediato, effort basso
│
├──→ Fase 3 (traduzione auto) — elimina lavoro manuale pesante
│         dipende da: Anthropic API key
│
└──→ Fase 4 (semantizzazione) — dipende da Fase 1
dipende da: OpenAI API key
Fase 5 — progetto separato, dopo Fase 4 stabile

---

## Dipendenze esterne da attivare

| Cosa | Dove | Quando | Costo stimato |
|---|---|---|---|
| Swap 2GB VPS | SSH RUNBOOK.md | Fase 1 | Gratis |
| Anthropic API key | console.anthropic.com | Fase 3 | ~€0.50/articolo EN |
| OpenAI API key | platform.openai.com | Fase 4 | ~€0.02/articolo embedding |

---

## Stato attuale (aggiornato 2026-06-21)

| Componente | Stato |
|---|---|
| pgvector installato (v0.8.2) | ✅ |
| Colonna embedding in PostgreSQL | ✅ `vector(3072)`, creata 2026-06-21 |
| Embeddings popolati via Directus API | ✅ 3.447/3.488 articoli IT (41 senza wp_id match) |
| correlati.json K=30 cosine similarity | ✅ rigenerato 2026-06-20, 3.427 articoli |
| Indice ivfflat per KNN | ❌ da creare via console Hetzner (serve tabella popolata) |
| TRANS-FLOW-01 (traduzione manuale) | ✅ funzionante |
| Traduzione triggered automatica | ❌ non implementata (Fase 3) |
| Sync metadati IT→EN automatica | ✅ endpoint `/api/sync-metadata` + Flow Directus `bb1e90af` |
| Campi sync: scalari | ✅ autore, numero_rivista, categoria_menu, categoria_menu_2, data_pubblicazione, forma, ruolo_editoriale, immagine_copertina, in_evidenza, serie, has_comments |
| Campi sync: M2M tags | ✅ junction `articoli_tags` copiata IT→EN |
| EN orfani fix | ✅ 14/18 linkati (umana vince su AI), 4 residui senza match IT |
| Algolia webhook sync | ✅ funzionante |
| **Didascalia → file (F3 anticipata)** | ❌ prossima sessione — spostare `didascalia_copertina`/`didascalia_en` da articolo a `directus_files` con traduzioni. Prerequisito ES/FR. |
