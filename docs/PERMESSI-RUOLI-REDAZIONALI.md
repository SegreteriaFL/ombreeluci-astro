# Permessi ruoli redazionali — restrizione righe non-IT (PERM-EDITOR-LANG, 2026-08-07)

## Problema

Qualunque utente col ruolo **Editor** poteva leggere, creare, modificare e cancellare righe `articoli` in qualsiasi lingua, incluso EN, nonostante l'unico scrittore legittimo delle righe EN dovrebbe essere il bot di traduzione. Stesso pattern strutturale del bug didascalia "Nanda" (due scrittori sullo stesso concetto, uno dei quali invisibile/non intenzionale) — qui a livello di permessi invece che di dati.

## Scoperta preliminare: il bersaglio non era ovvio

Esistono 4 ruoli in Directus, ma solo 2 hanno utenti reali:

| Ruolo | Policy | Utenti reali |
|---|---|---|
| **Editor** | `d61b5ea6-d001-4812-857f-6498842fb5a4` | Cristina Tersigni, Al Boino, Matteo Cinti |
| Administrator | `bee418ef-7108-41fe-977a-3de04594c777` | Admin User, `bot@ombreeluci.it` |
| Redazione | `0a5492ea-9da0-43ba-b61e-ee7c97b035b4` | nessuno (solo account UAT/test) |
| Redattore | `fccac256-25a1-452d-811c-5b4c573e1851` | nessuno (solo account test) |

Lo staff redazionale reale opera sotto **"Editor"**, non "Redazione" come il nome avrebbe suggerito. Restringere "Redazione" da sola sarebbe stato un intervento a vuoto.

## Verifiche di sicurezza (chiuse prima di applicare qualunque permesso)

**V1 — Il pulsante "Avvia/aggiorna traduzione" si sarebbe rotto?**
No. Verificato nel grafo della Flow (`1e022c88`) via API: una sola operazione `request`, chiama `POST /api/translate` con un Bearer token di servizio statico proprio nell'header — nessuna condition, nessuna query preliminare che usi la sessione dell'utente. `translate.ts` decide create-vs-update leggendo `articolo_traduzione` sulla riga IT con `DIRECTUS_TOKEN` (token admin del bot, non la sessione Editor). Nessuna estensione/pannello custom Directus nel repo (`Glob **/extensions/**` → 0 risultati) che potrebbe fare query aggiuntive lato client. Conclusione: la catena trigger→webhook→translate.ts non tocca mai i permessi dell'Editor — via libera confermata nel codice, non assunta.

**B1 — Il bot di traduzione userebbe mai il ruolo Editor?**
No. `DIRECTUS_TOKEN` (usato da `translate.ts`, `sync-metadata.ts`, `sync-didascalia.ts`) appartiene a `bot@ombreeluci.it`, ruolo **Administrator**, token statico indipendente da qualunque sessione utente — verificato via `/users/me` con lo stesso token.

**V2 — Quanto spesso un Editor cancella un articolo bilingue?**
Risposta: capita, non è raro. Deciso di includere `delete` nella restrizione insieme a create/read/update, stesso giro.

**B2 — Effetto collaterale sull'interfaccia: campo `articolo_traduzione`**
Relazione many-to-one auto-referenziante (`articoli→articoli`) che punta dalla riga IT alla riga EN. Con la lettura ristretta, l'anteprima relazionale (quello che l'interfaccia Directus userebbe per mostrare il titolo dell'articolo EN collegato) non è più risolvibile. Testato via deep-fetch (`articolo_traduzione.titolo`): la risposta resta `200 OK`, il campo annidato degrada a `null` invece di rompere la richiesta — non blocca il salvataggio della riga IT. **Decisione presa:** opzione (a), lasciare il campo `articolo_traduzione` così com'è (visibile, non rimosso dai campi leggibili) — effetto puramente estetico, accettato.

## Modifiche applicate

Policy **Editor** (`d61b5ea6-d001-4812-857f-6498842fb5a4`), collection `articoli`. Snapshot pre-modifica di tutti e 4 i permission item salvato in `scripts/backups/directus-permissions-editor-pre-2026-08-07.json`.

| id | action | prima | dopo |
|---|---|---|---|
| 12 | create | `validation: null` | `validation: {"lang": {"_eq": "it"}}` |
| 14 | update | `permissions: null` | `permissions: {"lang": {"_eq": "it"}}` |
| 13 | read | `permissions: null` | `permissions: {"lang": {"_eq": "it"}}` |
| 15 | delete | `permissions: null` | `permissions: {"lang": {"_eq": "it"}}` |

Applicate in quest'ordine, un `PATCH /permissions/{id}` alla volta, con test immediato prima di procedere al successivo. Campo `share` (id 16) lasciato invariato — non risulta usato.

## Test eseguiti (account Editor di test dedicato, `editor@ombreeluci.it`)

Token statico temporaneo generato via `PATCH /users/{id}` per la durata dei test, rimosso (`token: null`) a fine sessione.

| Test | Atteso | Risultato |
|---|---|---|
| Create riga `lang=en` | respinto | `400` — `Validation failed for field "lang". Value has to be "it"` |
| Create riga `lang=it` (controllo negativo) | consentito | `200` |
| Update riga EN nota (Nanda EN, `c452a500...`) | respinto | `403 FORBIDDEN` |
| Update riga IT disposable (controllo negativo) | consentito | `200` |
| Lista articoli (`groupBy lang`) | solo `it` | `[{"lang":"it","count":3512}]` — zero righe EN visibili |
| Lettura diretta riga EN nota | respinto | `403 FORBIDDEN` |
| Lettura riga IT già tradotta | consentito | `200`, `articolo_traduzione` presente come UUID scalare |
| Deep-fetch anteprima `articolo_traduzione.titolo` | degrada senza rompersi | `200`, campo annidato `null` (atteso, B2) |
| Delete riga EN disposable (creata da admin per il test) | respinto | `403 FORBIDDEN` — non `404`, conferma blocco reale non solo invisibilità |

Tutti gli articoli di test creati durante la verifica sono stati eliminati (token admin) a fine sessione.

## Cosa NON è stato toccato

- `translate.ts`, `sync-metadata.ts`, `sync-didascalia.ts` — nessuna modifica, il bot resta Administrator, indipendente da questi permessi
- Campo `articolo_traduzione` — lasciato visibile (decisione B2, opzione a)

---

## Allineamento Redazione e Redattore (stessa sessione, dopo verifica Editor stabile)

Nessun utente reale assegnato a queste due policy oggi (solo account UAT/test `redazione-uat@ombreeluci.it` e `redattore@ombreeluci.it`) — rischio di produzione nullo, ma stessa pipeline seguita per coerenza e in vista di un uso futuro.

### Scostamenti trovati verificando gli id reali (non erano identici a Editor)

Verificando `GET /permissions?filter[policy]=...` per entrambe le policy, prima di applicare qualunque PATCH, sono emersi due scostamenti dalla sintassi "identica a Editor":

1. **Nessuna riga `delete` esiste su `articoli`** per Redazione né per Redattore (solo `read`/`create`/`update`). In Directus l'assenza di una riga permission per un'azione significa che quell'azione è già negata per default — il delete su qualunque riga (non solo EN) era **già bloccato** per entrambe le policy, prima ancora di questo intervento. Nessun PATCH necessario su questo punto.
2. **Redazione aveva già un vincolo su `create`** (id 91): `validation: {"stato": {"_in": ["draft","review"]}}` (impedisce di creare un articolo già pubblicato). Applicare il filtro lingua per sovrascrizione avrebbe cancellato questo vincolo esistente. Applicato invece un merge con `_and`, testato che entrambi i vincoli restano attivi insieme.

### Modifiche applicate

Snapshot pre-modifica in `scripts/backups/directus-permissions-redazione-pre-2026-08-07.json` e `scripts/backups/directus-permissions-redattore-pre-2026-08-07.json`.

**Redazione** (`0a5492ea-9da0-43ba-b61e-ee7c97b035b4`):

| id | action | prima | dopo |
|---|---|---|---|
| 91 | create | `validation: {"stato":{"_in":["draft","review"]}}` | `validation: {"_and":[{"stato":{"_in":["draft","review"]}},{"lang":{"_eq":"it"}}]}` |
| 92 | update | `permissions: null` | `permissions: {"lang":{"_eq":"it"}}` |
| 90 | read | `permissions: null` | `permissions: {"lang":{"_eq":"it"}}` |
| — | delete | *(nessuna riga)* | *(nessuna riga — già bloccato, nessuna azione)* |

**Redattore** (`fccac256-25a1-452d-811c-5b4c573e1851`):

| id | action | prima | dopo |
|---|---|---|---|
| 5 | create | `validation: null` | `validation: {"lang":{"_eq":"it"}}` |
| 4 | update | `permissions: null` | `permissions: {"lang":{"_eq":"it"}}` |
| 3 | read | `permissions: null` | `permissions: {"lang":{"_eq":"it"}}` |
| — | delete | *(nessuna riga)* | *(nessuna riga — già bloccato, nessuna azione)* |

### Test eseguiti (token temporanei su `redazione-uat@ombreeluci.it` e `redattore@ombreeluci.it`, rimossi a fine sessione)

| Test | Redazione | Redattore |
|---|---|---|
| Create `lang=en` | `400` respinto | `400` respinto |
| Create `lang=it`, `stato=published` (solo Redazione, verifica merge) | `400` respinto — vincolo stato preservato | n/a (nessun vincolo stato su Redattore) |
| Create `lang=it`, `stato=draft` (controllo positivo) | `200` consentito | `200` consentito |
| Update riga EN nota | `403` respinto | `403` respinto |
| Update riga IT disposable (controllo positivo) | `200` consentito | `200` consentito |
| Lista articoli (`groupBy lang`) | solo `it`, 3512 | solo `it`, 3512 |
| Lettura diretta riga EN nota | `403` respinto | `403` respinto |

Tutti gli articoli di test creati sono stati eliminati (token admin) a fine sessione.

## Rollback

Ogni permission id è singolarmente reversibile con un `PATCH /permissions/{id}` che ripristina il valore salvato nello snapshot corrispondente:
- Editor: `scripts/backups/directus-permissions-editor-pre-2026-08-07.json` (tutti e 4 avevano `permissions: null` / `validation: null`)
- Redazione: `scripts/backups/directus-permissions-redazione-pre-2026-08-07.json`
- Redattore: `scripts/backups/directus-permissions-redattore-pre-2026-08-07.json`

Task A (allineamento permessi su tutte e tre le policy) è **completo**. Task B (consolidamento didascalie) segue come intervento separato, non ancora avviato.
