ENGINEERING_REVIEW.md

**Ultima revisione: 2026-08-13** — se le raccomandazioni qui sotto (es. sezione 11, Algolia+Pagefind) non sono state riverificate dopo questa data, trattarle come ipotesi da confermare, non come stato attuale accertato. Aggiornare questa data solo quando il documento viene rivisto/confermato di proposito, non ad ogni lettura.

Revisione tecnica e piano di consolidamento
Progetto: Ombre e Luci — Astro / Directus / Cloudflare
Destinatario principale: Claude Code
Stato: documento operativo
Data creazione: 13 agosto 2026

0. SCOPO DEL DOCUMENTO
Questo documento contiene una revisione tecnica del progetto e una serie di raccomandazioni per migliorarne:

affidabilità;
osservabilità;
sicurezza;
manutenibilità;
testabilità;
prevedibilità delle operazioni editoriali;
separazione fra produzione e staging.
NON è una lista di modifiche da eseguire automaticamente.

Le osservazioni contenute qui derivano dall'analisi del repository e dello STATO.md, ma alcune sono necessariamente ipotesi da verificare sul codice e sull'ambiente attuale.

Claude Code deve quindi:

leggere questo documento;
verificare ogni affermazione sul repository corrente;
distinguere fatti verificati da ipotesi;
non modificare il codice durante la prima fase di analisi;
produrre un piano di intervento prima di implementare modifiche significative;
implementare soltanto interventi giustificati dall'analisi;
verificare ogni modifica con test o controlli concreti;
aggiornare STATO.md soltanto con risultati effettivamente verificati.
1. PRINCIPIO FONDAMENTALE
NON RISCRIVERE L'ARCHITETTURA
La revisione non parte dall'ipotesi che l'architettura attuale sia sbagliata.

L'architettura di base:

Directus
    ↓
dati editoriali
    ↓
Astro
    ↓
Cloudflare
    ↓
ombreeluci.it
è considerata appropriata, salvo evidenze contrarie emerse dall'analisi.

Non introdurre:

nuovi framework;
nuovi CMS;
nuove infrastrutture;
nuove librerie;
nuovi sistemi di cache;
nuovi sistemi di ricerca;
se non esiste una necessità concreta dimostrata.

Obiettivo
Ridurre il rischio e la complessità senza alterare inutilmente ciò che funziona.

2. REGOLA DI LAVORO PER CLAUDE CODE
Per ogni problema utilizzare questa sequenza:

OSSERVAZIONE
    ↓
RIPRODUZIONE
    ↓
IPOTESI
    ↓
VERIFICA DELL'IPOTESI
    ↓
ROOT CAUSE
    ↓
PROPOSTA
    ↓
IMPLEMENTAZIONE
    ↓
TEST
    ↓
VERIFICA PRODUZIONE/STAGING
Non saltare direttamente da:

problema → modifica codice
Non considerare una spiegazione come root cause finché non è stata verificata.

3. CLASSIFICAZIONE DELLE CONCLUSIONI
Durante l'analisi utilizzare esplicitamente queste categorie:

VERIFIED
Fatto verificato direttamente sul codice, configurazione, API, build o ambiente.

OBSERVED
Comportamento osservato ma la causa non è ancora dimostrata.

HYPOTHESIS
Possibile spiegazione ancora da verificare.

RECOMMENDATION
Miglioramento proposto senza che esista necessariamente un bug.

RESOLVED
Problema risolto e verificato.

REGRESSION TESTED
Problema risolto e successivamente coperto da un controllo automatico o ripetibile.

Non trasformare una HYPOTHESIS in una VERIFIED senza una verifica.

4. PRIORITÀ GENERALI
P0 — sicurezza / perdita dati / contenuti errati
Problemi che possono:

esporre credenziali;
compromettere account;
causare perdita o corruzione dati;
pubblicare contenuti errati;
rendere indistinguibile produzione da staging;
impedire il corretto aggiornamento del sito.
P1 — affidabilità
Problemi che possono causare:

Flow fallite silenziosamente;
contenuti non aggiornati;
rebuild mancati;
dati non sincronizzati;
errori SEO significativi;
rottura di URL esistenti.
P2 — manutenzione
Problemi relativi a:

documentazione;
duplicazione;
codice legacy;
test insufficienti;
complessità non necessaria.
P3 — miglioramenti
Ottimizzazioni e refactoring non urgenti.

5. P0 — SICUREZZA DEI SECRET
Contesto
STATO.md documenta diversi episodi nei quali credenziali, token o secret sono comparsi durante attività di sviluppo/debugging.

Questo deve essere considerato un problema sistemico, non una serie di incidenti indipendenti.

Obiettivo
Rendere difficile l'esposizione accidentale dei secret anche quando il progetto viene gestito tramite Claude Code.

Prima fase — SOLO ANALISI
Verificare:

secret presenti nel repository corrente;
secret presenti nella Git history;
token presenti in file .json, .md, .js, .mjs, .env*;
token passati direttamente nei comandi;
variabili d'ambiente utilizzate dal frontend;
secret potenzialmente inseriti nei bundle client.
Non modificare ancora nulla.

Verifiche richieste
A. Repository
Cercare pattern relativi a:

TOKEN
SECRET
PASSWORD
API_KEY
JWT
AUTH
CREDENTIAL
senza stampare in output eventuali valori sensibili.

B. Git history
Verificare se secret precedentemente compromessi sono ancora presenti nella history.

C. Build
Verificare che:

DIRECTUS_TOKEN
e qualsiasi altro secret server-side non siano presenti nei bundle client.

D. Configurazione
Verificare la distinzione fra:

PUBLIC
e:

SERVER ONLY
Raccomandazione
Se non già presente, valutare l'introduzione di secret scanning automatico.

Possibili strumenti:

Gitleaks;
equivalente già disponibile nell'infrastruttura;
controllo CI.
Non installare uno strumento prima di aver verificato se ne esiste già uno.

6. P0 — PRODUZIONE VS STAGING
Problema da verificare
Esiste un ambiente:

https://ombreeluci-staging.pages.dev/
Deve essere trattato come ambiente separato dalla produzione.

Il problema dell'indicizzazione Google dello staging e quello dei link staging presenti nei contenuti/configurazioni devono essere considerati parte dello stesso dominio di rischio:

separazione incompleta fra staging e produzione.

Prima fase
Verificare sul repository:

site;
canonical;
hreflang;
sitemap;
robots;
meta robots;
Open Graph;
URL assoluti;
variabili d'ambiente;
configurazione Cloudflare;
eventuali link hardcoded;
eventuali URL pages.dev;
generazione dei feed;
configurazione Search Console, se presente nel codice/documentazione.
Cercare esplicitamente:

ombreeluci-staging.pages.dev
pages.dev
site:
canonical
robots
noindex
hreflang
sitemap
Verificare anche
Se il repository contiene riferimenti a:

https://ombreeluci.it/en/fragile-girls/
e versioni staging equivalenti.

Obiettivo
Produzione:

ombreeluci.it
Staging:

ombreeluci-staging.pages.dev
devono essere inequivocabilmente distinguibili.

Staging
Deve avere almeno una protezione coerente contro l'indicizzazione.

La soluzione concreta deve essere scelta dopo aver verificato come viene generato il sito.

Non applicare semplicemente noindex a caso.

Importante
Verificare anche che:

una pagina staging non possa generare canonical verso se stessa quando dovrebbe puntare alla produzione.

E verificare il comportamento reale con HTTP, non soltanto il codice sorgente.

7. P1 — DIRECTUS FLOW: FAILURE VISIBILI
Osservazione
Diversi incidenti descritti in STATO.md riconducono a Flow Directus che:

non partono;
partono ma falliscono;
hanno condizioni non soddisfatte;
producono un risultato incompleto;
senza rendere immediatamente evidente il problema.

Obiettivo
Nessuna automazione editoriale critica deve poter fallire silenziosamente.

Prima analisi
Inventariare tutte le Flow critiche.

Per ciascuna:

Nome
Trigger
Condizione
Input
Operazioni
Output
Failure handling
Dipendenze
Effetto sul sito
Creare una tabella di analisi, non ancora una modifica.

Particolare attenzione a
Flow che gestiscono:

rebuild;
traduzioni;
sincronizzazione;
Algolia;
immagini;
contenuti derivati;
pubblicazione.
Proposta da valutare
Introdurre stato/errori per le operazioni critiche.

Non assumere automaticamente che un singolo campo:

errore_flow
sia la soluzione migliore.

Valutare se servano:

status
error
updated_at
per singola automazione oppure un piccolo log strutturato.

Vincolo
Non creare un sistema di logging complesso se un meccanismo semplice è sufficiente.

8. P1 — REBUILD: DIRECTUS → CLOUDFLARE
Problema noto
Un Flow di rebuild può dipendere da una condizione sul payload della modifica.

È stato osservato un caso nel quale:

articolo già pubblicato
+
modifica contenuto
=
payload senza stato "published"
e quindi il rebuild non veniva attivato.

Questo deve essere verificato sul codice/configurazione attuale.

Obiettivo
Definire chiaramente:

quali modifiche richiedono rebuild.

Creare una matrice:

Tipo modifica	Rebuild?	Motivo
titolo	?	?
testo	?	?
immagine	?	?
categoria	?	?
autore	?	?
traduzione	?	?
stato pubblicazione	?	?
metadati SEO	?	?
Non compilare ? per supposizione.

Ricavare il comportamento desiderato dall'architettura reale.

9. P1 — STATICO VS SSR
Obiettivo
Per ogni famiglia di route determinare:

STATIC
SSR
HYBRID
e documentare:

fonte dati;
momento di aggiornamento;
necessità di rebuild;
cache;
comportamento in caso di errore.
Esempio:

/articolo/...
STATIC
→ Directus
→ build
→ Cloudflare
oppure:

/ricerca
SSR
→ richiesta runtime
Non cambiare il modello
La classificazione serve prima a capire il sistema attuale.

Un eventuale passaggio STATIC ↔ SSR deve essere deciso separatamente.

10. P1 — CACHE
Problema
STATO.md contiene osservazioni relative a:

cache Cloudflare;
cf-cache-status;
traffico bot;
cache rate molto basso;
richieste che arrivano al Worker SSR.
Questi dati devono essere trasformati da log storico a verifica tecnica ripetibile.

Prima analisi
Misurare:

URL
status HTTP
cf-cache-status
cache-control
age
server
content-type
tempo risposta
su:

produzione;
staging;
pagina statica;
pagina SSR;
pagina con query string;
asset.
Obiettivo
Determinare empiricamente:

cosa viene cachato;
cosa non viene cachato;
perché;
quale comportamento è desiderato.
Vincolo
Non introdurre Cloudflare Worker Cache API o altra infrastruttura di caching prima di aver dimostrato che l'attuale configurazione non è sufficiente.

11. P1 — RICERCA: ALGOLIA + PAGEFIND
Problema da chiarire
Il progetto contiene sia:

Algolia
sia:

Pagefind
La loro coesistenza può essere corretta, ma deve essere esplicitamente giustificata.

Prima analisi
Documentare:

Pagefind
→ cosa fa?

Algolia
→ cosa fa?

Autocomplete
→ quale sistema usa?

Ricerca risultati
→ quale sistema usa?

Filtri
→ quale sistema usa?

Indicizzazione
→ quando avviene?

Obiettivo
Arrivare a una frase semplice:

Pagefind serve a X, Algolia serve a Y.

Se invece svolgono la stessa funzione, proporre la rimozione di uno dei due.

Non rimuovere nulla prima dell'analisi.

12. P1 — URL LEGACY E SEO
La migrazione da WordPress è una parte critica del progetto.

STATO.md documenta un lavoro significativo sui vecchi URL e sui pattern storici. Questo lavoro va preservato.

Obiettivo
Trasformare la conoscenza accumulata sui redirect in una regression suite.

Test desiderato
Partendo da un dataset di vecchi URL:

URL legacy
    ↓
HTTP
    ↓
status
    ↓
redirect
    ↓
URL destinazione
    ↓
canonical
Il test deve produrre un report:

totale
OK
redirect corretti
404
redirect inattesi
canonical errati
Caso specifico
Verificare il supporto agli URL legacy:

/?p=ID
se ancora presenti in email, documenti o link storici.

13. P1 — TEST SEO AUTOMATICI
Per un sito editoriale multilingua non è sufficiente che:

HTTP 200
sia corretto.

Per un campione significativo di pagine verificare:

<title>
description
canonical
hreflang
lang
robots
sitemap
Open Graph
Per IT/EN verificare anche la relazione fra le versioni linguistiche.

Obiettivo
Un errore SEO strutturale deve diventare un test fallito, non una scoperta casuale in Search Console.

14. P2 — STATO.MD
STATO.md è una memoria storica molto utile, ma è diventato troppo grande.

Il problema non è la quantità di conoscenza.

Il problema è che nello stesso documento convivono:

stato corrente;
bug;
log di sessione;
decisioni;
SEO;
monitoring;
procedure;
storia della migrazione.
Obiettivo
Non perdere la storia.

Ridurre invece il ruolo di STATO.md.

STATO.md dovrebbe contenere
Stato produzione
Problemi aperti
Rischi
Prossimi interventi
Ultime decisioni
Ultimo deploy
Link ai documenti tecnici
La storia dovrebbe essere archiviata.
Non eliminare la storia.

Separare:

CURRENT STATE
da:

HISTORY
15. NON CREARE UNA FORESTA DI DOCUMENTI
La soluzione non è creare:

DEBUG-001.md
DEBUG-002.md
DEBUG-003.md
BUG-SEARCH.md
BUG-CACHE.md
BUG-DIRECTUS.md
BUG-STAGING.md
...
Questo riprodurrebbe il problema precedente.

La struttura deve rimanere piccola.

Possibile modello:

STATO.md
ARCHITECTURE.md
RUNBOOK.md
ENGINEERING_REVIEW.md

docs/
├── DEBUG.md
├── DECISIONS.md
├── SEO-MONITORING.md
└── archive/
Adottare questa struttura soltanto se il repository attuale ne trae realmente beneficio.

16. DEBUG.MD — METODO STANDARD
Gli incidenti tecnici significativi dovrebbero seguire questo formato:

# Problema

## Sintomo

## Ambiente

## Riproduzione

## Evidenza

## Ipotesi

## Verifica

## Root cause

## Soluzione

## Test di regressione

## Stato
Regola
Non registrare una diagnosi come:

Root cause: cache
se è soltanto:

Hypothesis: cache
17. TRASFORMARE IL DEBUG IN TEST
Questa è la raccomandazione trasversale più importante.

Ogni volta che viene risolto un problema ricorrente chiedersi:

“Possiamo trasformare questa conoscenza in un test?”

Esempi:

Problema:
canonical errato

→ test canonical
Problema:
redirect legacy mancante

→ regression test URL
Problema:
secret nel repository

→ secret scanning
Problema:
Flow non eseguita

→ stato/log verificabile
Problema:
staging indicizzato

→ test robots/noindex/canonical
Problema:
IT/EN incoerenti

→ test hreflang
Questo è il principale passaggio di maturazione consigliato al progetto.

18. TEST DI BASE DA VALUTARE
Prima di introdurre nuovi test, verificare quelli già esistenti.

Obiettivo finale:

typecheck
lint
unit
build
smoke
SEO
links
i18n
security
legacy URLs
Non aggiungere un framework di test se non è necessario.

Utilizzare gli strumenti già presenti quando possibile.

19. COMPONENTI E DATA LAYER
Analizzare in particolare:

src/lib/directus.ts
src/lib/articoli-build.ts
src/components/CercaContent.astro
src/components/AutocompleteWidget.astro
Obiettivo
Verificare la separazione:

data access
    ↓
normalizzazione
    ↓
business/editorial logic
    ↓
presentation
Evitare componenti che contemporaneamente:

interrogano Directus;
trasformano dati;
decidono routing;
gestiscono SEO;
gestiscono lingua;
renderizzano UI.
Importante
Questa è un'area di analisi, non una richiesta di refactoring automatico.

Se la struttura attuale funziona bene, lasciarla invariata.

20. CONFIGURAZIONE ASTRO
Analizzare la gestione di:

DIRECTUS_URL
DIRECTUS_TOKEN
MEDIA_BASE_URL
Verificare se esistono duplicazioni fra:

process.env
import.meta.env
vite.define
e stabilire quale sia il percorso effettivo usato:

build
SSR
client
Cloudflare
Obiettivo
Ridurre la configurazione duplicata quando possibile.

Vincolo
Non modificare la configurazione soltanto per renderla “più elegante”.

Deve esserci un beneficio concreto:

sicurezza;
affidabilità;
semplicità;
eliminazione di un bug.
21. FALLBACK HARDcoded
Verificare la presenza di fallback del tipo:

DIRECTUS_URL
→ IP server hardcoded
Se presenti, valutarne la rimozione.

Per configurazioni infrastrutturali critiche è generalmente preferibile:

variabile obbligatoria
→ errore esplicito
anziché:

variabile mancante
→ fallback implicito
Ma prima verificare l'effetto sullo sviluppo locale e sul deploy.

22. CLAUDE CODE
Il progetto utilizza Claude Code e contiene istruzioni dedicate.

Questo deve essere considerato parte dell'architettura operativa del progetto.

Regola fondamentale
Claude Code non deve diventare una dipendenza dalla conoscenza implicita del singolo agente.

Le regole devono essere:

brevi;
non contraddittorie;
verificabili;
orientate alla sicurezza;
orientate ai test.
CLAUDE.md
Deve contenere soprattutto:

cose che Claude deve sapere prima di modificare il codice
Non deve diventare:

manuale completo del progetto
Le informazioni storiche devono stare altrove.

23. COME CLAUDE CODE DEVE AFFRONTARE QUESTO DOCUMENTO
Quando viene chiesto di lavorare su questo documento, Claude Code deve iniziare con:

1. leggere ENGINEERING_REVIEW.md
2. leggere CLAUDE.md
3. leggere STATO.md
4. ispezionare package.json
5. ispezionare astro.config.*
6. ispezionare src/lib/
7. ispezionare le componenti relative alla ricerca
8. verificare configurazione Directus/Cloudflare disponibile nel repository
Poi produrre:

## Findings

### VERIFIED
...

### OBSERVED
...

### HYPOTHESIS
...

### RECOMMENDATIONS
...
Non implementare ancora.

Dopo questa fase deve proporre un piano ordinato per priorità.

24. REGOLA ANTI-OVERENGINEERING
Prima di introdurre una nuova tecnologia, libreria o servizio rispondere a queste domande:

1. Quale problema risolve?
2. Il problema è verificato?
3. È possibile risolverlo con il codice esistente?
4. È possibile risolverlo con configurazione?
5. È possibile risolverlo con un test?
6. Qual è il costo di manutenzione?
7. Cosa possiamo eliminare in cambio?
Se non è possibile rispondere chiaramente:

non introdurre la nuova tecnologia.

25. ORDINE DI INTERVENTO CONSIGLIATO
FASE 0 — audit
Nessuna modifica funzionale.

 Verificare secret e gestione credenziali
 Verificare staging/production separation
 Verificare Directus Flow
 Verificare rebuild
 Verificare static/SSR
 Verificare cache
 Verificare Algolia/Pagefind
 Verificare redirect legacy
 Verificare test esistenti
Output:

AUDIT_REPORT.md
solo se realmente utile; in alternativa aggiornare questo documento.

FASE 1 — P0
 sicurezza secret
 separazione staging/production
 verifica token client/server
FASE 2 — P1
 osservabilità Flow
 affidabilità rebuild
 verifica static/SSR
 test SEO
 regression test URL legacy
 analisi cache
 analisi Algolia/Pagefind
FASE 3 — P2
 semplificazione documentazione
 trasformazione conoscenza in test
 eventuale refactoring mirato
 riduzione codice/configurazione inutilizzata
26. CRITERIO DI SUCCESSO
La revisione è riuscita quando il progetto permette di rispondere rapidamente alle seguenti domande:

Editoriale
Ho modificato un articolo. È stato aggiornato correttamente?

Automazioni
Una Flow è fallita?

Build
Il rebuild è partito? È terminato?

Cache
Questa pagina è cached? Perché?

SEO
Questa pagina ha canonical/hreflang corretti?

Staging
Google può indicizzare lo staging?

Migrazione
Questo vecchio URL funziona ancora?

Sicurezza
È possibile che un secret finisca nel repository o nel bundle?

Manutenzione
Se tra sei mesi un'altra persona prende il progetto, può capire cosa succede senza ricostruire tutta la storia?

Se la risposta è sì, il progetto ha raggiunto un livello di affidabilità adeguato.

27. PRINCIPIO FINALE
Il progetto non deve diventare più sofisticato.

Deve diventare:

più prevedibile.

Il passaggio fondamentale è:

conoscenza
   ↓
documentazione
   ↓
procedura
   ↓
automazione
   ↓
test
Ogni volta che un problema viene scoperto, la domanda finale non deve essere soltanto:

“Come lo risolviamo?”

ma:

“Come facciamo in modo che questo problema non possa ripresentarsi senza che il sistema se ne accorga?”

Questa deve essere la direzione principale del consolidamento di Ombre e Luci.