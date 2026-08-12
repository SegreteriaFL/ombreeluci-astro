# Bozza — valutazione/migrazione a Sanity

**Stato:** bozza iniziale, nessuna decisione presa. Sessione 2026-07-27.
**Perché questo documento esiste:** feedback diretto della redazione ("mi sembra di camminare sulle uova") dopo mesi di bug ricorrenti su Directus (traduzioni che non si pubblicano, foto sbagliate, ricerca stale — vedi `STATO.md` § [BUG] Segnalazioni 2026-07-27). Con Sorain (preventivo ~20k) e Tartufo in arrivo, la scelta del CMS per i *nuovi* progetti non ha vincoli di sunk cost — va fatta su cosa è più solido oggi, non su cosa già conosciamo.

---

## 1. Il problema concreto che ha innescato questa valutazione

Il 2026-07-27, durante due ticket apparentemente banali della redazione, sono emersi due bug dello stesso tipo:

1. **Import traduzione fallito silenziosamente** — JSON malformato incollato dalla redazione ha bloccato una Directus Flow su `JSON.parse()`, senza mostrare nessun errore. L'articolo tradotto non è mai apparso online; la redazione ha visto solo "salvato con successo".
2. **Sync Algolia rotto da tempo indeterminato** — un secret disallineato tra Directus e Cloudflare Pages fa fallire ogni chiamata di risincronizzazione della ricerca (401), di nuovo senza errore visibile. Impatto: la ricerca del sito può mostrare foto/dati vecchi per un tempo non quantificabile, su un numero di articoli non quantificabile.

**Il problema non è "Directus ha un bug".** È che **il motore Flow di Directus non ha un meccanismo nativo per notificare un fallimento a chi ha innescato l'azione** — chi lavora nel pannello non ha modo di sapere che qualcosa si è rotto finché non se ne accorge da fuori (un URL che non carica, una foto che non cambia). Questo è strutturale, non una svista configurabile con una patch.

---

## 2. Cosa valutare — non solo "quale editor è più bello"

| Dimensione | Perché conta qui |
|---|---|
| **Visibilità degli errori nelle automazioni** | Il problema #1 di questa sessione. Sanity ha un modello di automazione diverso (webhook + GROQ + funzioni esterne, tipicamente su piattaforme come Vercel/Netlify con logging visibile) — da verificare se offre per design un feedback più immediato di un fallimento, o se lo stesso rischio si ripresenta in altra forma. |
| **Hosting/manutenzione** | Directus qui è self-hosted su VPS Hetzner (Docker, Postgres, aggiornamenti, backup manuali — vedi `project_infrastruttura_hardening`). Sanity è fully-managed (Sanity Cloud) — elimina un'intera categoria di responsabilità operativa (patch di sicurezza, uptime del DB, backup). Per un nuovo progetto con budget dedicato, questo pesa. |
| **Modello editoriale / real-time collab** | Sanity Studio è pensato per editing collaborativo in tempo reale multi-utente; Directus è più CRUD-form classico. Se Sorain prevede più persone che editano insieme, è un punto a favore di Sanity — da verificare con requisiti reali del progetto. |
| **Costo** | Directus self-hosted: costo = VPS (già pagato per OeL, marginale per altri progetti se condiviso; ma un progetto serio come Sorain probabilmente vuole isolamento, quindi nuovo VPS). Sanity: pricing a "documenti"/utenti/bandwidth, free tier generoso ma i costi crescono con progetti grandi — da preventivare per il volume atteso di Sorain. |
| **Portabilità / lock-in** | Sanity usa un formato proprietario (GROQ, dataset), meno standard di un Postgres dietro Directus. Se in futuro si volesse migrare via da Sanity, quanto è doloroso? Da verificare. |
| **Automazioni già costruite (solo per OeL)** | Su Ombre e Luci esistono: pipeline traduzione IT→EN, pubblicazione programmata, sync Algolia, sync metadati IT→EN, contenuti statici. Tutte da ricostruire se si migra OeL. **Questo costo non esiste per Sorain/Tartufo** — motivo per cui la decisione lì è indipendente. |

---

## 3. Percorso consigliato (non ancora eseguito)

**Non decidere a tavolino.** Proposta di valutazione pratica, dimensionata (1-2 giorni di lavoro, non settimane):

1. **Prototipo minimo su Sanity** (mezza giornata): schema semplice equivalente ad "articolo" (titolo, corpo, immagine, autore, categoria, lingua), 2-3 automazioni di prova (es. un webhook che finge la pipeline di traduzione) — per sentire con mano il modello di errore/debug reale, non solo leggerlo dalla documentazione.
2. **Stress-test deliberato del fallimento** (poche ore): rompere di proposito un webhook/una funzione come è successo su Directus, e vedere concretamente cosa vede l'utente e cosa vede chi fa manutenzione. Questo risponde direttamente al problema che ha innescato la valutazione.
3. **Preventivo hosting/costi per il volume atteso di Sorain** (poche ore): quante entità, quanti editor, quanto traffico — mettere un numero reale a fianco del confronto, non un "sembra più caro/economico".
4. **Decisione per Sorain/Tartufo**, indipendente da Ombre e Luci.
5. **Decisione separata per Ombre e Luci**: solo dopo il punto 4, e solo se il quadro emerso è netto — perché qui il costo di migrazione (7000+ articoli, relazioni, 5+ automazioni) è reale e va pesato esplicitamente, non ignorato per entusiasmo verso il nuovo strumento.

---

## 4. Se si decidesse di migrare Ombre e Luci (solo per stima approssimativa, non un piano esecutivo)

Elenco delle categorie di lavoro, in ordine di complessità crescente — **non stimato in giorni/ore, serve prima il punto 3 sopra per avere numeri reali**:

1. **Schema design** — tradurre le collection Directus (`articoli`, `autori`, `numeri_rivista`, `serie`, `tags`, `contenuti_statici`, `didascalie_img`) in schema Sanity (GROQ documents + reference fields).
2. **Migrazione dati** — export completo da Postgres (via API Directus, già fatto in passato per altri export) → trasformazione → import Sanity (Sanity ha tool di import ufficiali, `sanity dataset import`). ~7000 articoli + relazioni M2M (tags, temi) + immagini (che vanno ri-caricate su Sanity Asset Pipeline, non restano su R2/VPS).
3. **Ricostruzione automazioni** — ognuna di queste va riscritta da zero con l'equivalente Sanity (webhook + funzione esterna, tipicamente su Vercel Edge Function o simile):
   - Pipeline traduzione IT→EN (export JSON → traduzione AI → import)
   - Sync metadati IT→EN
   - Pubblicazione programmata
   - Sync Algolia
   - Contenuti statici (probabilmente nativo in Sanity con i suoi "Portable Text"/document types, da valutare se serve ancora una collection dedicata)
4. **Frontend Astro** — sostituire `src/lib/directus.ts` con un client Sanity equivalente; tutte le query GROQ al posto delle REST call Directus. Il resto del frontend (componenti, routing, i18n) non cambia.
5. **Permessi redazione** — ricostruire ruoli/permessi equivalenti a Editor/Redazione di Directus in Sanity (RBAC diverso, da studiare).
6. **Formazione redazione** — nuova interfaccia, nuovo modo di lavorare. Costo non tecnico ma reale, specialmente dopo che si sono appena abituati a Directus.
7. **Periodo di doppio binario** — verosimilmente serve far girare Directus e Sanity in parallelo durante il cutover, con un piano di rollback se qualcosa non torna (stesso principio di disciplina già applicato al cutover di maggio 2026).

**Non stimato qui:** tempo/costo in giorni-persona — richiede prima il prototipo (sezione 3) per capire la reale complessità delle automazioni #3, che è la parte più incerta.
