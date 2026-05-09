# Norme Editoriali — Ombre e Luci

Guida operativa per la redazione. Descrive come usare il CMS Directus per pubblicare e gestire i contenuti del sito.

---

## Pubblicare un articolo

1. Accedi a [cms.ombreeluci.it](https://cms.ombreeluci.it) con le credenziali redazione
2. Vai su **Articoli** → **Crea nuovo**
3. Compila i campi obbligatori: Titolo, Corpo, Autore, Numero rivista
4. Nella sezione **Classificazione** scegli Tema, Forma, Tag, Ruolo editoriale
5. Aggiungi la copertina nella sezione **Media**
6. Imposta **Stato** su `published` e salva

**Salvataggio**: usa il pulsante **Salva** (icona floppy). Per restare sulla pagina dopo il salvataggio scegli l'opzione dal menu a tendina accanto al pulsante.

---

## Classificazione articolo

### Tema (campo obbligatorio)

Il tema è la sezione tematica principale dell'articolo. Scegli uno dei 14 temi canonici:

| Slug | Etichetta |
|------|-----------|
| `catechesi` | Catechesi |
| `cultura` | Cultura |
| `educazione-e-formazione` | Educazione e Formazione |
| `famiglia` | Famiglia |
| `fede-e-luce` | Fede e Luce |
| `lavoro` | Lavoro |
| `ombre-e-luci` | Ombre e Luci |
| `personaggi-che-ispirano` | Personaggi che ispirano |
| `progetti` | Progetti |
| `salute` | Salute |
| `scuola` | Scuola |
| `spiritualita` | Spiritualità |
| `sport` | Sport |
| `tempo-libero` | Tempo libero |

### Tema 2 (campo opzionale)

Solo se l'articolo appartiene **chiaramente** a due sezioni del sito. Lascia vuoto nella maggior parte dei casi. Max un secondo tema.

### Ruolo editoriale

Peso gerarchico rispetto al primo tema:

| Valore | Significato |
|--------|-------------|
| `portante` | Articolo centrale del numero/categoria |
| `strutturale` | Articolo importante, non centrale |
| `laterale` | Articolo di supporto |
| `trasversale` | Tocca più temi, non appartiene a uno specifico |

**Nota importante:** il ruolo editoriale si riferisce sempre al tema primario (primo campo Tema). Se l'articolo ha un secondo tema (Tema 2), il ruolo non viene applicato a quella seconda sezione — serve solo per determinare la posizione nella pagina del tema principale.

### Forma

Tipo di contenuto. Esempi: Articolo, Testimonianza, Intervista, Editoriale, Recensione, Dialogo Aperto.

---

## Creare un nuovo autore

1. Vai su **Autori** → **Crea nuovo**
2. Compila **Nome completo** — lo slug viene generato automaticamente
3. Se lo slug non si genera, clicca sul campo Slug: comparirà un pulsante per generarlo dal nome
4. Aggiungi foto, bio e salva

**Nota:** lo slug deve essere unico. Se Directus segnala un conflitto, modifica lo slug manualmente aggiungendo un numero (es. `mario-rossi-2`).

---

## Focus tematici

I focus sono pagine tematiche approfondite su un argomento specifico (es. autismo, cinema e disabilità).

### Come aggiungere un articolo a un focus esistente

1. Apri l'articolo in Directus
2. Scorri fino alla sezione **Focus / Verticali** (in fondo al form)
3. Clicca **Aggiungi esistente** e cerca il focus per nome
4. Salva — l'articolo appare immediatamente nella pagina focus

### Focus attivi

| Focus | URL staging |
|-------|-------------|
| Mariangela Bertolini | [/it/focus/mariangela-bertolini/](https://ombreeluci-staging.pages.dev/it/focus/mariangela-bertolini/) |
| Autismo | [/it/focus/autismo/](https://ombreeluci-staging.pages.dev/it/focus/autismo/) |
| Noi papà — un figlio disabile | [/it/focus/noi-papa-un-figlio-disabile/](https://ombreeluci-staging.pages.dev/it/focus/noi-papa-un-figlio-disabile/) |
| Aktion T4 — sterminio persone disabilità | [/it/focus/aktion-t4-sterminio-persone-disabilita/](https://ombreeluci-staging.pages.dev/it/focus/aktion-t4-sterminio-persone-disabilita/) |
| Speciale cinema e disabilità | [/it/focus/speciale-cinema-e-disabilita/](https://ombreeluci-staging.pages.dev/it/focus/speciale-cinema-e-disabilita/) |
| Ciao Stefano Di Franco | [/it/focus/ciao-stefano-di-franco/](https://ombreeluci-staging.pages.dev/it/focus/ciao-stefano-di-franco/) |

### Come creare un nuovo focus

La creazione di un nuovo focus è un'**operazione tecnica** che richiede il supporto del dev. La redazione non può crearla autonomamente.

Il dev deve:
1. Creare un record nella collection `verticali` in Directus con slug, titolo, hero image e descrizione
2. Collegare gli articoli tramite la sezione Sezioni/Blocchi del record verticale
3. Aggiungere il focus al megamenu se necessario (modifica `taxonomy_structure.json`)
4. Fare deploy

Per richiedere un nuovo focus: inviare titolo, descrizione e lista degli articoli da includere a [segreteria@fedeeluce.it](mailto:segreteria@fedeeluce.it).

---

## Descrizioni categorie

Le descrizioni delle categorie (testo introduttivo nella pagina categoria) si modificano direttamente in Directus sotto **Categorie**. Cerca la categoria per nome e modifica il campo `descrizione`.

---

## Anteprima articolo

Ogni articolo ha un pulsante **Anteprima** (icona occhio in alto a destra nel form). Apre l'articolo su staging:
```
https://ombreeluci-staging.pages.dev/it/{slug}/
```

L'anteprima mostra la versione **pubblicata** — le modifiche non salvate non appaiono.

---

## Tag

I tag sono parole chiave libere. Per aggiungere un tag:
1. Nel campo Tag clicca **Aggiungi esistente** per cercare un tag esistente
2. Oppure clicca **Crea nuovo** per crearne uno nuovo

Usa tag già esistenti quando possibile per evitare duplicati (es. non creare sia "disabilità" che "disabilita").

---

## Traduzione articoli in inglese

Per tradurre un articolo:
1. Apri l'articolo IT in Directus
2. Dal menu ⋮ scegli **Esporta per traduzione** — genera il campo `json_export`
3. Copia il contenuto di `json_export` e incollalo in Claude.ai con prompt di traduzione
4. Copia il JSON tradotto nel campo `json_traduzione` e salva
5. Il Flow Directus crea automaticamente l'articolo EN pubblicato e collega IT↔EN

Vedi dettagli in `docs/TRANS-FLOW-01-setup.md`.
