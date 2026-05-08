# TRANS-FLOW-01 — Setup Directus: flusso traduzione manuale assistita

## Stato

| Campo | Valore |
|---|---|
| **Stato** | ✅ Completato |
| **Data completamento** | 2026-05-08 |
| **Testato** | Sì — flow import e export verificati con articolo di test |

### Cosa è stato implementato

- **Step 1–2** (campo `json_traduzione` + permessi Redazione): completati via API script in sessione 2026-05-07
- **Step 3** (Flow "Import traduzione da JSON"): configurato in Directus UI in sessione 2026-05-08, testato e funzionante
- **TRANS-FLOW-01b** (Flow "Esporta per traduzione"): trigger manuale su `articoli` — pulsante ⋮ nell'UI dell'articolo IT che genera il JSON nel campo `json_export`. Campo `json_export` creato via API. Flow configurato via script `scripts/setup-export-flow.mjs` in sessione 2026-05-08.

### Architettura finale flow "Esporta per traduzione"

Tre operation in sequenza (configurate via `scripts/setup-export-flow.mjs`):

| # | Tipo | Chiave | Cosa fa |
|---|---|---|---|
| 1 | item-read | `leggi_articolo` | Legge l'articolo con tutti i campi necessari. Key: `{{$trigger.body.keys[0]}}` |
| 2 | exec (Run Script) | `costruisci_json` | JS puro — costruisce il JSON export da `data['leggi_articolo']`. Zero I/O. |
| 3 | item-update | `scrivi_json` | Scrive `{{costruisci_json.json}}` nel campo `json_export` dell'articolo IT |

### Gotcha emersi durante la configurazione reale

- **Run Script firma funzione**: Directus 11 riceve i dati come `function(data)` non `function({ data })` — `data['$trigger']` è undefined con la firma destructurata
- **Chiave operation**: la chiave del Run Script deve essere `parse` (non l'auto-generata) — tutte le operation successive la referenziano come `{{ parse.xxx }}`
- **Create Data restituisce array**: `new_en` è `["uuid"]` non `{ id: "uuid" }` — usare `{{ new_en[0] }}` non `{{ new_en.id }}`
- **Condition regola**: non va wrappata in `{ "filter": { ... } }` — la regola va scritta direttamente senza wrapper
- **Read Data campi relazionali**: i temi ritornano come `{ temi_id: { id: "..." } }` (annidato) — il Run Script del flow export deve normalizzarli a `{ temi_id: "..." }` per l'import
- **Run Script sandbox — no fetch, no require**: Directus 11.16.1 esegue gli script in un VM context dove né `fetch` (Node < 18) né `require` sono disponibili. La soluzione è fare il fetch **prima** con un item-read, poi passare i dati al Run Script che usa solo JS puro.
- **item-read con key dinamica nei trigger manuali**: funziona correttamente con `{{$trigger.body.keys[0]}}` nella configurazione `options.key`. Il bug osservato in precedenza era dovuto a una configurazione errata (key passata come template nel campo sbagliato dell'UI).
- **Foreign key constraint al delete operation**: prima di cancellare una operation, azzerare `resolve` e `reject` su tutte — altrimenti Postgres blocca il delete per FK violation.
- **Errore "json_traduzione non è un JSON valido"**: se il JSON incollato è troncato (copy-paste parziale da Claude), il flow lo segnala esplicitamente con posizione dell'errore. Non è un bug — serve copiare l'intera risposta di Claude.

---

Questo documento guida il setup manuale in Directus UI e descrive il flusso operativo per la redazione.
Lo script CLI (`scripts/export-per-traduzione.mjs`) è già funzionante — questo documento copre solo la parte Directus.

---

## Step 1 — Creare il campo `json_traduzione` su `articoli`

Directus UI → **Impostazioni → Modello dati → articoli → Aggiungi campo**

| Opzione | Valore |
|---|---|
| Tipo | Textarea (longtext) |
| Nome campo | `json_traduzione` |
| Label | JSON traduzione da importare |
| Note campo | Incolla qui il JSON tradotto ottenuto da Claude. Il sistema creerà automaticamente la versione tradotta dell'articolo in bozza. Se esiste già una traduzione, verrà aggiornata. |
| Nullable | Sì |
| Visibilità in dettaglio | Visible |
| Visibilità in lista | Hidden |

---

## Step 2 — Permessi campo `json_traduzione` per il ruolo Redazione

La policy Redazione (`0a5492ea`) deve includere UPDATE su `json_traduzione`.

Directus UI → **Impostazioni → Ruoli e permessi → Redazione → articoli → UPDATE**

Aggiungere `json_traduzione` alla lista dei campi consentiti in UPDATE.
Seguire la stessa procedura usata per gli altri campi editoriali (vedi STATO.md § Directus Audit permessi).

Il campo non deve essere leggibile dalla Redazione (READ) — serve solo la scrittura.

---

## Step 3 — Creare il Flow: "Import traduzione da JSON"

Directus UI → **Impostazioni → Flows → Crea Flow**

### Trigger

| Opzione | Valore |
|---|---|
| Tipo | Event Hook |
| Scope | items.update |
| Collection | articoli |
| Return data | Sì |

### Operations in sequenza

---

#### Operation 1 — Condition "JSON presente?"

Tipo: **Condition**

Regola:
```json
{
  "json_traduzione": {
    "_nnull": true,
    "_neq": ""
  }
}
```

Resolve (continua): se `json_traduzione` è valorizzato.
Reject (stop): altrimenti — previene loop quando il Flow stesso azzera il campo.

---

#### Operation 2 — Run Script "Parse JSON e prepara payload"

Tipo: **Run Script**

```js
module.exports = async function({ data }) {
  const raw = data['$trigger'].payload.json_traduzione;
  const sourceId = data['$trigger'].keys[0]; // UUID articolo IT

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error('json_traduzione non è un JSON valido: ' + e.message);
  }

  if (!parsed._meta || !parsed._copy_invariant || !parsed._translate) {
    throw new Error('JSON mancante dei blocchi _meta, _copy_invariant o _translate');
  }
  if (!parsed._translate.titolo) {
    throw new Error('_translate.titolo vuoto — traduzione incompleta');
  }

  // Genera slug EN dalla traduzione del titolo
  const title = parsed._translate.titolo;
  let slug = title
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, '')
    .replace(/[\s\-]+/g, '-')
    .replace(/^-|-$/g, '');
  if (!slug) slug = sourceId.slice(0, 8);

  return {
    source_id: sourceId,
    target_lang: parsed._meta.target_lang || 'en',
    en_slug_base: slug,
    en_slug: slug,
    copy_invariant: parsed._copy_invariant,
    translate: parsed._translate,
    meta: parsed._meta,
  };
};
```

---

#### Operation 3 — Read Item "Verifica traduzione esistente"

Tipo: **Read Data**
Collection: `articoli`
IDs: `{{ $last.source_id }}`
Fields: `id, articolo_traduzione, articolo_traduzione.id, articolo_traduzione.slug, articolo_traduzione.lang`

Output in: `existing_it`

---

#### Operation 4 — Condition "Traduzione già esiste?"

Tipo: **Condition**

Regola JS:
```json
{
  "existing_it.articolo_traduzione": {
    "_nnull": true
  }
}
```

Resolve (branch UPDATE): la traduzione esiste già — aggiornare.
Reject (branch CREATE): nessuna traduzione — crearne una nuova.

---

### Branch CREATE

#### Operation 5a — Create Item "Crea articolo EN"

Tipo: **Create Data**
Collection: `articoli`

Payload (da configurare come "raw" JSON con riferimenti alle variabili del Flow):
```json
{
  "lang": "{{ $last_parse.target_lang }}",
  "slug": "{{ $last_parse.en_slug }}",
  "stato": "draft",
  "titolo": "{{ $last_parse.translate.titolo }}",
  "sottotitolo": "{{ $last_parse.translate.sottotitolo }}",
  "seo_title": "{{ $last_parse.translate.seo_title }}",
  "seo_description": "{{ $last_parse.translate.seo_description }}",
  "didascalia_copertina": "{{ $last_parse.translate.didascalia_copertina }}",
  "corpo": "{{ $last_parse.translate.corpo }}",
  "categoria_menu": "{{ $last_parse.copy_invariant.categoria_menu }}",
  "forma": "{{ $last_parse.copy_invariant.forma }}",
  "tema_label": "{{ $last_parse.copy_invariant.tema_label }}",
  "ruolo_editoriale": "{{ $last_parse.copy_invariant.ruolo_editoriale }}",
  "immagine_copertina": "{{ $last_parse.copy_invariant.immagine_copertina }}",
  "autore": "{{ $last_parse.copy_invariant.autore }}",
  "numero_rivista": "{{ $last_parse.copy_invariant.numero_rivista }}",
  "data_pubblicazione": "{{ $last_parse.copy_invariant.data_pubblicazione }}",
  "temi": "{{ $last_parse.copy_invariant.temi }}",
  "tags": "{{ $last_parse.copy_invariant.tags }}",
  "json_traduzione": null
}
```

Output in: `new_en`

#### Operation 5b — Update Item "Link IT → EN"

Tipo: **Update Data**
Collection: `articoli`
IDs: `{{ $last_parse.source_id }}`

Payload:
```json
{
  "articolo_traduzione": "{{ new_en.id }}",
  "json_traduzione": null
}
```

#### Operation 5c — Update Item "Link EN → IT"

Tipo: **Update Data**
Collection: `articoli`
IDs: `{{ new_en.id }}`

Payload:
```json
{
  "articolo_traduzione": "{{ $last_parse.source_id }}"
}
```

---

### Branch UPDATE

#### Operation 6a — Update Item "Aggiorna articolo EN esistente"

Tipo: **Update Data**
Collection: `articoli`
IDs: `{{ existing_it.articolo_traduzione.id }}`

Payload (solo i campi traducibili — non toccare _copy_invariant):
```json
{
  "titolo": "{{ $last_parse.translate.titolo }}",
  "sottotitolo": "{{ $last_parse.translate.sottotitolo }}",
  "seo_title": "{{ $last_parse.translate.seo_title }}",
  "seo_description": "{{ $last_parse.translate.seo_description }}",
  "didascalia_copertina": "{{ $last_parse.translate.didascalia_copertina }}",
  "corpo": "{{ $last_parse.translate.corpo }}",
  "json_traduzione": null
}
```

#### Operation 6b — Update Item "Azzera campo IT"

Tipo: **Update Data**
Collection: `articoli`
IDs: `{{ $last_parse.source_id }}`

Payload:
```json
{
  "json_traduzione": null
}
```

---

## Loop prevention — IMPORTANTE

Il Flow azzerà `json_traduzione` a `null` sia sull'articolo IT che sull'EN (operations 5b, 6a, 6b).
Questo PATCH re-triggererà l'event hook `items.update` su `articoli`.
La **Condition "JSON presente?"** (Operation 1) blocca l'esecuzione perché `json_traduzione` sarà `null`.

**Verificare questo comportamento** con un articolo di test prima dell'uso in produzione:
1. Incollare un JSON valido nel campo `json_traduzione` di un articolo di test
2. Salvare — il Flow deve scattare una volta sola
3. Verificare nei log di Directus (Settings → Flows → Log) che ci sia una sola esecuzione, non un loop

---

## Gotcha Directus 11 documentati

1. **Conflict slug**: se `slugify(titolo_en)` genera uno slug già esistente, il Create Item (5a) restituisce HTTP 400. Il Run Script deve gestire questo caso aggiungendo un suffisso (es. i primi 4 caratteri di `source_id`). Nella versione attuale del Flow documentato questo non è gestito — aggiungere un retry con suffisso se necessario.

2. **Token del Flow**: il Flow gira con token admin, non con il token della Redazione. I permessi non sono un problema per la creazione del record EN. Verificare che il token admin configurato nei Flow Settings abbia CREATE su `articoli`.

3. **Run Script — variabili di contesto**: in Directus 11, il Run Script accede ai dati precedenti via `data['$trigger']`, `data['$last']` ecc. La sintassi esatta può variare tra versioni di Directus 11.x — testare su un Flow di prova prima di connettere al campo produzione.

4. **articolo_traduzione escluso da READ Redazione**: la Redazione non vede il campo `articolo_traduzione` nell'UI. Non impatta il Flow (gira con admin), ma significa che la Redazione non può verificare visivamente se la traduzione esiste. Il warning stampato dallo script CLI (`⚠ Traduzione già presente`) supplisce a questo.

---

## Flusso operativo per la redazione

### Come usare il flusso

1. Aprire l'articolo IT in Directus
2. Cliccare **⋮ → "Esporta per traduzione"** — il flow genera il JSON nel campo `json_export` (attesa ~5 sec, poi ricaricare la pagina)
3. Copiare il contenuto del campo `json_export`
4. Andare su [claude.ai](https://claude.ai), aprire una nuova conversazione
5. Incollare l'intero contenuto — il campo `_prompt` contiene già tutte le istruzioni per Claude, non serve aggiungere altro
6. Claude restituisce il JSON tradotto
7. **Copiare l'intera risposta di Claude** — usare il pulsante copia di Claude.ai, non selezionare manualmente (rischio testo troncato)
8. Tornare all'articolo IT in Directus
9. Incollare il JSON nel campo **"JSON traduzione da importare"**
10. Salvare — il sistema crea automaticamente la versione tradotta pubblicata
11. L'articolo EN compare in `/en/{slug}/` — verificare titolo, corpo, immagini

### Cosa fa il sistema automaticamente

- Genera lo slug EN dal titolo tradotto
- Crea il record EN con `stato: draft`
- Collega bidirezionalmente IT ↔ EN via `articolo_traduzione`
- Azzera il campo `json_traduzione` sull'IT (il campo sparisce dopo l'elaborazione)
- Se la traduzione EN esiste già: aggiorna i campi tradotti senza ricreare il record

### Prompt di traduzione (aggiornato 2026-05-08)

Il campo `_prompt` nel JSON esportato contiene le istruzioni per Claude. Versione attuale, ottimizzata per articoli nuovi:

1. Restituire JSON con struttura invariata — solo i campi in `_translate` tradotti
2. Inglese naturale e idiomatico — come scriverebbe un editor madrelingua, non una traduzione letterale
3. Titoli come headline originali EN, non traduzioni
4. Frasi italiane lunghe/complesse → spezzare in frasi brevi (la prosa EN privilegia chiarezza e ritmo breve)
5. Tag HTML preservati esattamente nel campo `corpo`
6. Crediti foto "Foto di X su Unsplash" → "Photo by X on Unsplash"
7. Nomi propri non tradotti: "Fede e Luce", "Ombre e Luci", città italiane, titoli "don/padre/suor/fr."
8. Terminologia disabilità: usare terminologia inclusiva moderna EN ("person with Down syndrome", "intellectual disability", "autism")
9. Solo il JSON tradotto — nessuna spiegazione, nessun markdown fence

**Nota archivio storico**: per articoli storici (anni '70–'90) con terminologia d'epoca, il prompt attuale userà la terminologia inclusiva moderna. Se si vuole preservare il registro originale per un articolo specifico, modificare manualmente la regola 8 nel JSON prima di inviarlo a Claude.

### Cosa deve fare la redazione manualmente dopo

- Verificare titolo e sottotitolo: devono suonare come EN originale
- Controllare le frasi lunghe: Claude dovrebbe averle già spezzate, ma rivedere
- Verificare immagini e link nel corpo
- L'articolo EN è pubblicato automaticamente — nessun ulteriore step
