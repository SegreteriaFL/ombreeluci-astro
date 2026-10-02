# Piano affidabilità — dopo il crollo GSC di agosto-settembre 2026

**Aperto:** 2026-10-01 · **Aggiornato:** 2026-10-03 · **Prossimo controllo:** venerdì 2026-10-09 · **Avanzamento:** issue GitHub con etichetta `affidabilita`, milestone "Piano affidabilità 2026-10" (#12–#24)

> ### ▶ Prossima sessione: riprendi da qui
>
> 1. `git pull` su `main` (lavorare su `main` aggiornato: il branch `refactor/consolidamento-didascalie-fase2` è stato unito il 3/10).
> 2. **Venerdì 9/10 — monitoraggio** (issue #12): compilare le tabelle del §3 e spuntare la riga del 9/10.
> 3. **Lavoro successivo: L8 — inventario link rotti** (issue #20): link esterni, elenco 404 di Search Console, immagini; portare gli script in `scripts/`.
> 4. **Decisioni in sospeso dell'utente:** L2 (#14) chi riceve gli avvisi e su quale canale; L10 (#22) controllo dei link scritti male solo settimanale o anche al salvataggio in Directus.
> 5. **Worker Cloudflare:** prima di qualsiasi modifica leggere L12 (#24). Il file su `main` è quello in produzione (versione `86f3f5dd`). Mai `wrangler deploy` diretto: prova su URL di anteprima, poi deploy della versione provata.
>
> A fine sessione: aggiornare questo blocco, il registro (§6) e spuntare le issue.

Questo file serve a due cose: seguire il **recupero su Google** settimana per settimana e seguire l'avanzamento dei **lavori** che devono impedire che succeda di nuovo. Ogni lavoro ha tre campi: cosa vogliamo, com'era prima, com'è dopo (verificato, non presunto).

---

## 1. Cosa è successo (sintesi)

Dal 15 agosto al 30 settembre le impressioni su Google sono scese da circa **3.000 a circa 300 al giorno** (−90%), con posizione media stabile intorno a 9. Non abbiamo perso posizioni: Google ha tolto le pagine dall'indice. Le cause erano tre, indipendenti e sovrapposte:

| # | Causa | Da quando | Effetto | Correzione (2026-10-01) |
|---|---|---|---|---|
| 1 | Il middleware mette `X-Robots-Tag: noindex` se l'host non è `ombreeluci.it`, ma il Worker inoltra ogni richiesta a `ombreeluci-staging.pages.dev`, quindi il middleware vede sempre l'host di staging | 2026-08-09 (`d73617a7`) | `noindex` su tutte le pagine SSR (articoli IT/EN, autori, numeri d'archivio). Home e categorie, statiche, erano pulite e hanno nascosto il problema | Il Worker rimuove l'header (`d2b90b64`) |
| 2 | Bot Fight Mode di Cloudflare blocca con 403 le chiamate del sito al CMS dai data center USA | almeno dal 2026-09-17 (log più vecchi non disponibili) | Googlebot passa dagli USA e riceveva **404** su articoli esistenti | Bot Fight Mode spento dal pannello; gli articoli rispondono **503** invece di 404 se il CMS non risponde (`909a2daf`) |
| 3 | `robots.txt` del CMS con `Disallow: /` | da sempre | Immagini escluse da Google Immagini, anteprime social senza foto | `ROBOTS_TXT` con `Allow: /assets/` sul VPS, cache Cloudflare svuotata |

Dopo le correzioni l'utente ha reinviato le sitemap, ha chiesto l'indicizzazione delle 5 pagine principali e ha avviato in Search Console la convalida di: noindex (6.268 pagine), 404 (1.232), 5xx (127), 403 (35), robots.txt (99).

## 2. Perché i controlli esistenti non l'hanno fermato

Il problema non è che mancassero i controlli: lo smoke test aveva già "CRITICO — Produzione NO noindex" su un articolo SSR. Non ha funzionato per tre ragioni:

1. **Il controllo è passato quando doveva fallire.** Il Bot Fight Mode rispondeva 403 a GitHub con una pagina di blocco senza l'header `noindex`, e "l'header non c'è" risultava vero. Un controllo che verifica un'assenza deve prima verificare di aver ricevuto la pagina vera (200).
2. **Lo smoke test era rosso da agosto** (sempre "Homepage 403"): un errore nuovo non si distingueva da quelli soliti.
3. **Le notifiche non arrivavano a nessuno:** il workflow avvisa solo se esiste il secret `SLACK_WEBHOOK_URL`, che nel repo non c'è.

In più: il `noindex` del 21/6 era già documentato come lezione e si è ripetuto il 9/8. **Una lezione scritta e senza un controllo automatico non protegge.**

## 3. Recupero su Google — misure settimanali

Fonte: `node scripts/gsc-query.mjs --dimensions=date` (proprietà `https://ombreeluci.it/`). Media giornaliera sul periodo.

| Periodo | Impressioni/giorno | Click/giorno | Posizione | Nota |
|---|---|---|---|---|
| 1–14 ago 2026 | ~3.000 | ~50 | ~9 | riferimento prima del crollo |
| 20–28 set 2026 | ~300 | ~8 | ~9 | punto più basso |
| 2–8 ott 2026 | | | | primo controllo (ven 9/10) |
| 9–15 ott 2026 | | | | |
| 16–22 ott 2026 | | | | |

**Pagine di riferimento** (verificare con `node scripts/gsc-inspect.mjs <url>`):

| URL | 1/10 | 9/10 | 16/10 |
|---|---|---|---|
| `/it/22-mini-giochi-da-fare-insieme/` | 404 (Bot Fight Mode) | | |
| `/it/14-giochi-da-fare-insieme/` | 404 (Bot Fight Mode) | | |
| `/it/the-crown-cugine-autismo/` | noindex (header) | | |
| `/it/il-chicco-una-casa-per-fabio-e-maria/` | non controllata | | |
| `/it/la-quadriglia-istruzioni-per-luso/` | non controllata | | |

**Convalide Search Console** (avviate 1/10):

| Riga GSC | Pagine al 1/10 | 9/10 | 16/10 |
|---|---|---|---|
| Esclusa in base al tag "noindex" | 6.268 | | |
| Non trovata (404) | 1.232 | | |
| Errore del server (5xx) | 127 | | |
| Bloccata da robots.txt | 99 | | |
| Bloccata per accesso non autorizzato (403) | 35 | | |

Atteso: impressioni in risalita già al 9/10, recupero completo in alcune settimane. La 404 potrebbe chiudersi come "non riuscita" per gli articoli WordPress mai importati (404 reali, noti): non è un problema, le altre pagine vengono comunque ripassate.

## 4. Lavori — stato

Legenda: ⬜ da fare · 🟨 in corso · ✅ fatto e verificato

| # | Lavoro | Stato | Chi |
|---|---|---|---|
| L1 | Smoke test affidabile (#13) | ⬜ | Claude |
| L2 | Notifiche che arrivano davvero (#14) | ⬜ | decisione utente + Claude |
| L3 | Controllo SEO settimanale automatico (#15) | ⬜ | Claude |
| L4 | Togliere il `noindex` per hostname dal middleware (#16) | ⬜ | Claude |
| L5 | `docs/LEZIONI.md`: ogni lezione ha il suo controllo (#17) | ⬜ | Claude |
| L6 | 503 invece di 404 anche su autori e archivio (#18) | ⬜ | Claude |
| L7 | Pagina 404 del sito al posto della schermata "Cloudflare Access" (#19) | ✅ 3/10 | Claude |
| L8 | Inventario link rotti (interni, esterni, 404 di GSC) (#20) | 🟨 interni fatti | Claude |
| L9 | Correzione link rotti per famiglia (#21) | ⬜ | Claude, con approvazione utente sulle modifiche ai contenuti |
| L10 | Sistema che impedisce che i link rotti tornino (#22) | ⬜ | Claude |
| L11 | Interventi su Search Console dopo L7–L9 (#23) | ⬜ | utente (Claude prepara gli elenchi) |
| L12 | Il Worker in produzione coincide sempre con quello su `main` (#24) | 🟨 allineato a mano 3/10, manca l'automatismo | Claude |

**Ordine concordato (2026-10-02):** ~~L7~~ (fatto 3/10) → L8 → L9 (AiOel → redirect → articoli/PDF mancanti → testo) → L10 → L11. Prima si documenta, poi si interviene, una famiglia alla volta con verifica.

### L1 — Smoke test affidabile

- **Cosa vogliamo:** uno smoke test verde quando il sito è sano e rosso solo quando c'è un problema reale; eseguito anche a orario fisso, non solo dopo un push.
- **Prima (1/10):** girava solo a ogni push su `main`, ed era rosso da agosto (Bot Fight Mode). Il controllo `noindex` guardava un solo articolo e passava anche ricevendo un 403. Il controllo "staging ha noindex" ora fallisce perché pages.dev risponde 403 (Cloudflare Access): è obsoleto. Dopo lo spegnimento del Bot Fight Mode l'esecuzione rilanciata è verde (`36875252147`).
- **Da fare:**
  - ogni controllo "negativo" (header assente, nessun redirect) verifica prima che la risposta sia 200;
  - controllo `noindex` su articolo IT, articolo EN, pagina autore e numero d'archivio (tutte le pagine SSR);
  - sostituire "staging ha noindex" con "staging risponde 403 senza credenziali Access";
  - nuovi controlli: `cms.ombreeluci.it/robots.txt` contiene `Allow: /assets/`; l'og:image di un articolo risponde 200 con user-agent `facebookexternalhit`; nessun 403 da `cms.ombreeluci.it/items/...`;
  - `schedule` ogni 6 ore oltre al push.
- **Dopo:** _(da compilare con il link alle esecuzioni verdi e a una prova di rosso provocato)_

### L2 — Notifiche che arrivano davvero

- **Cosa vogliamo:** quando un controllo critico fallisce, una persona lo sa entro poche ore.
- **Prima:** notifica solo via `SLACK_WEBHOOK_URL`, secret inesistente → nessuno avvisato. UptimeRobot avvisa, ma controlla codice e testo della pagina, non gli header (non vede il `noindex`). Gli ID dei monitor UptimeRobot in memoria non sono aggiornati.
- **Decisione da prendere (utente):** chi riceve gli avvisi e su quale canale: email di GitHub sui workflow programmati, Slack oppure email via UptimeRobot.
- **Dopo:** _(da compilare)_

### L3 — Controllo SEO settimanale automatico

- **Cosa vogliamo:** accorgerci di un calo entro una settimana, guardando direttamente l'esito (Google) oltre alle cause.
- **Prima:** controllo GSC solo a mano e sporadico; il calo iniziato il 15/8 è stato notato il 1/10.
- **Da fare:** workflow settimanale che (a) confronta le impressioni degli ultimi 7 giorni con le 4 settimane precedenti e va in allarme sotto −30%; (b) ispeziona le 10 pagine principali con l'API di ispezione URL e va in allarme su `BLOCKED_BY_HTTP_HEADER`, `BLOCKED_BY_META_TAG`, `NOT_FOUND` o `SERVER_ERROR`. Serve il service account GSC come secret GitHub.
- **Dopo:** _(da compilare)_
- **Nota:** con questo controllo il crollo sarebbe stato visto intorno al 20–22 agosto.

### L4 — Togliere il `noindex` per hostname dal middleware

- **Cosa vogliamo:** eliminare la causa, non solo il sintomo.
- **Prima:** `src/middleware.ts` decide il `noindex` confrontando `url.hostname`. Dietro il Worker l'host è sempre pages.dev, quindi la regola è sbagliata per costruzione: due incidenti (21/6 e 9/8). Oggi il Worker toglie l'header a valle.
- **Da fare:** rimuovere quel blocco. pages.dev di produzione è già protetto da Cloudflare Access (403), quindi la regola non serve più. Da verificare prima: se le anteprime dei branch (`<hash>.pages.dev`, pubbliche) ricevono già un `noindex` automatico da Cloudflare Pages; se no, decidere se proteggerle con Access.
- **Dopo:** _(da compilare)_

### L5 — `docs/LEZIONI.md`

- **Cosa vogliamo:** ogni incidente produce un controllo automatico, non solo un paragrafo in STATO.md.
- **Prima:** le lezioni sono sparse tra STATO.md, DECISIONE-STAGING.md e le memorie di Claude, come testo.
- **Da fare:** tabella `data | problema | controllo automatico | dove gira`. Una lezione è chiusa solo quando ha un controllo associato o una motivazione scritta del perché non si può automatizzare. Prime righe: le cinque lezioni elencate qui sotto.
- **Dopo:** _(da compilare)_

### L6 — 503 invece di 404 anche su autori e archivio

- **Cosa vogliamo:** nessuna pagina esistente risponde 404 per un problema temporaneo del CMS.
- **Prima:** corretto solo per gli articoli IT/EN (`909a2daf`). Pagine autore e numeri d'archivio usano ancora `directusFetch`, che trasforma ogni errore in `null`, quindi in 404.
- **Dopo:** _(da compilare)_

### L7 — Pagina 404 del sito al posto della schermata "Cloudflare Access"

- **Cosa vogliamo:** chi segue un link rotto vede la pagina 404 di Ombre e Luci (menu, ricerca, link alla home), non una schermata di errore tecnica.
- **Prima (verificato 2/10):** **ogni** indirizzo inesistente, inventato compreso (es. `/it/questa-pagina-non-esiste-xyz/`), risponde con status 404 (corretto per Google) ma con il corpo "Forbidden — Cloudflare Access" e gli header `Cf-Access-Domain: ombreeluci-staging.pages.dev`. Segnalato dall'utente su `/AiOel/mappa_umap_3d_cluster_sprint8_v2.html`.
- **Causa (verificata 2-3/10):** l'Access Application non ha pagine di errore personalizzate; la stessa build servita da un URL di deployment senza Access (`<hash>.ombreeluci-staging.pages.dev`) mostra la 404 corretta. È Cloudflare Access a sostituire il corpo dei 404 di Pages con la sua schermata. Le risposte generate da Access hanno l'header `cf-access-domain`, le pagine del sito no.
- **Correzione:** il Worker, se pages.dev risponde 404 con `cf-access-domain`, serve `/404.html` del sito mantenendo lo status 404 (versione Worker `86f3f5dd`, provata prima su URL di anteprima, poi messa in produzione).
- **Dopo (verificato 3/10 in produzione):** `/it/questa-pagina-non-esiste-xyz/`, `/AiOel/mappa_umap_3d_cluster_sprint8_v2.html` (con e senza `www`) → **404 con "Pagina non trovata — Ombre e Luci"** e meta `noindex`; home, articoli IT/EN, categorie, autori → 200 senza `X-Robots-Tag`; `/it/cerca/` mantiene il suo meta `noindex`; redirect legacy 1096/1096 OK.
- **Incidente durante il lavoro (2/10, 23:45:29–23:46:18 ora italiana, ~50 s):** il primo deploy della correzione ha mandato **tutto il sito in 403**. Causa accertata il 3/10: il Worker su `main` **non conteneva le credenziali di Access**, aggiunte il 25/8 (`4c3a459a`) solo sul branch `refactor/consolidamento-didascalie-fase2` e mai unite. L'1/10 il deploy era partito dalla cartella di quel branch (giusta), ma la correzione `noindex` era stata riportata su `main` applicandola al file vecchio, e il commit dichiarava erroneamente "main coincide con la produzione". Il 2/10 il deploy è partito da `main`. Rollback immediato a `2baa9ef2`. Diagnosi fatta poi interamente su URL di anteprima (`wrangler versions upload`), senza toccare i visitatori. Dopo la correzione `main` contiene il file **identico byte per byte** alla versione in produzione `86f3f5dd`. Vedi L12.

### L8 — Inventario link rotti

- **Cosa vogliamo:** l'elenco completo dei link rotti, raggruppati per causa, con gli articoli coinvolti. Si corregge solo dopo.
- **Prima (2/10, link interni, solo letture):** 7.008 articoli pubblicati, 5.851 link, 1.033 indirizzi interni diversi. **84 rotti (404) in 170 articoli.** Altri 949 funzionano ma passano per 2–3 redirect (puntano ai vecchi URL WordPress `www.ombreeluci.it/AAAA/slug/`).

  | Famiglia | Link | Esempio | Correzione prevista |
  |---|---|---|---|
  | Vecchi URL EN `/en/AAAA/MM/GG/slug/` | 23 | `/en/2023/08/24/alberta-and-the-barbie-revolution/` | regola di redirect |
  | Vecchi `/tag/…` e `/author/…` | 18 | `/tag/il-carro/`, `/author/marie-odilerethore/` | regole di redirect |
  | Articoli WordPress mai importati `/AAAA/slug/` | ~15 | `/1984/la-riabilitazione/` | importazione (vedi "articoli mancanti") |
  | Pagine AiOel `/AiOel/*.html` | 4 | `mappa_umap_3d_cluster_sprint8_v2.html` | **ripristino**: 3 file su 4 in `_migration_archive/` (fuori dal repo), il quarto (`…_nomi.html`) da cercare |
  | PDF `/wp-content/uploads/` | 6 | `Vite-straordinarie-….pdf` | recupero dal backup WordPress |
  | Link scritti male nel testo | ~8 | `ombreeluci.it/www.saperidoc.it` (manca `https://`) | correzione del contenuto |
  | Vecchie pagine `/english`, `/chisiamo`, `/questionario` | 4 | `/english/` (uno già corretto a mano dall'utente) | redirect o correzione |

- **Ancora da fare:** link esterni (~3.000 verso altri siti); elenco "Non trovata (404)" di Search Console (1.232 URL), che include anche i link **da altri siti** verso vecchi indirizzi, non solo quelli interni; immagini (`<img>`) negli articoli.
- **Strumenti:** gli script di estrazione e verifica usati il 2/10 vanno portati in `scripts/` quando si inizia il lavoro (oggi sono solo locali).
- **Dopo:** _(da compilare)_

### L9 — Correzione link rotti per famiglia

- **Cosa vogliamo:** zero link interni rotti; i link interni puntano direttamente all'indirizzo finale, senza catene di redirect.
- **Metodo:**
  - una famiglia alla volta, con verifica dopo ciascuna;
  - per gli URL con uno schema comune: regole di redirect (sistemano anche i link da altri siti e da Google, non solo quelli negli articoli);
  - pagine e file persi (AiOel, PDF): ripristino allo **stesso indirizzo** di prima;
  - correzioni al testo degli articoli con uno script su Directus: prima una prova a vuoto con l'elenco delle modifiche da far approvare all'utente, poi l'applicazione con backup. Mai a mano, link per link. Le traduzioni seguono la regola "IT sorgente unica";
  - per una pagina che non esiste più e non ha un equivalente: 404 (o 410), mai un redirect alla home.
- **Dopo:** _(da compilare, per famiglia)_

### L10 — Sistema che impedisce che i link rotti tornino

- **Cosa vogliamo:** un link rotto viene segnalato entro una settimana da quando si rompe, da qualunque causa (articolo nuovo, pagina rimossa, migrazione, sito esterno sparito).
- **Prima:** nessun controllo. I link rotti li scopre l'utente leggendo gli articoli.
- **Da fare:**
  1. **Controllo settimanale dei link** (GitHub Actions, programmato): legge tutti gli articoli pubblicati da Directus, verifica i link interni ed esterni e va in allarme se ne compare uno rotto **nuovo** rispetto all'elenco già noto. Gli esterni con tolleranza: un sito esterno può essere giù per un giorno, quindi si segnala solo se fallisce due settimane di fila.
  2. **Controllo della pagina 404 nello smoke test (L1):** un indirizzo inventato deve rispondere 404 **con la pagina del sito** (titolo di Ombre e Luci), non con "Cloudflare Access".
  3. **Controllo dei link scritti male al momento della pubblicazione:** href senza `https://`, `ombreeluci.it/www.…`, `=`. Da valutare dove: nel controllo settimanale (sicuro) oppure in Directus al salvataggio (più immediato, ma le Flow Directus falliscono senza avvisare: va deciso).
  4. **Regola per ogni migrazione, dismissione o cambio di hosting** (es. il ritiro di Aruba): prima si lancia l'inventario dei link e si confronta con i file che spariscono. Le pagine AiOel si sono perse così: non erano nell'elenco di ciò che andava spostato.
  5. **404 di Search Console nel controllo SEO settimanale (L3):** nuovi URL "Non trovata (404)" segnalati insieme al calo di impressioni.
- **Dopo:** _(da compilare)_

### L11 — Interventi su Search Console dopo le correzioni

- **Cosa vogliamo:** Google registra le correzioni il prima possibile e le righe di errore in GSC si svuotano.
- **Da fare (utente, con elenchi preparati da Claude):**
  - dopo L7: nessuna azione GSC necessaria (lo status era già 404 corretto), salvo ricontrollare che i test live non mostrino la pagina di Access;
  - dopo il ripristino AiOel e PDF: "Richiedi indicizzazione" su ogni pagina ripristinata;
  - dopo le regole di redirect: "Convalida correzione" sulla riga "Non trovata (404)" (già avviata il 1/10: se nel frattempo risulta "non riuscita", va riavviata);
  - URL rimasti 404 di proposito (contenuti che non esistono più): nessuna azione, Google li toglie da solo; non usare lo strumento Rimozioni, che è temporaneo e serve ad altro;
  - controllare che la sitemap non contenga URL che rispondono 404 o redirect (si può automatizzare dentro L10);
  - un mese dopo: confronto della riga "Non trovata (404)" con il valore del 1/10 (1.232).
- **Dopo:** _(da compilare)_

### L12 — Il Worker in produzione coincide sempre con quello su `main`

- **Cosa vogliamo:** un solo posto da cui parte il Worker (`main`) e un controllo che segnala se la produzione è diversa.
- **Prima:** il Worker si pubblicava a mano con `wrangler deploy` dalla cartella in cui ci si trovava. Dal 25/8 al 3/10 la produzione girava con codice che **non era su `main`** (solo su un branch di lavoro): chiunque avesse pubblicato da `main` avrebbe tolto le credenziali di Access e mandato il sito in 403, come è successo il 2/10.
- **Fatto (3/10):** `main` allineato al file in produzione (`86f3f5dd`), verificato byte per byte.
- **Da fare:**
  1. pubblicazione del Worker **solo da GitHub Actions su `main`** (quando cambia `cf-worker/`), con un passaggio di prova su URL di anteprima prima della messa in produzione e rollback automatico se home/articolo/404 non rispondono come atteso;
  2. nello smoke test (L1): confronto tra il codice del Worker in produzione e quello su `main`, con allarme se differiscono;
  3. nel frattempo, a mano: mai `wrangler deploy` da un branch o da una cartella diversa da `main` aggiornato.
- **Dopo:** _(da compilare)_

## 5. Lezioni del 2026-10-01 (da portare in `docs/LEZIONI.md`)

| Problema | Controllo automatico che lo avrebbe intercettato |
|---|---|
| `noindex` su produzione, deciso da `url.hostname` dietro il Worker | Smoke test: `noindex` assente su tutte le pagine SSR, dopo aver verificato il 200 (L1) |
| Controllo "header assente" superato con una risposta 403 | Regola: ogni controllo negativo verifica prima il 200 (L1) |
| Smoke test rosso per due mesi, ignorato | Notifica a una persona (L2); un controllo non può restare rosso: si corregge o si toglie, con motivo scritto |
| Bot Fight Mode: 404 a Googlebot solo dai data center USA, invisibile dall'Italia | Smoke test da GitHub (server USA) a orario fisso (L1) + ispezione URL GSC settimanale (L3) |
| Ogni errore del CMS trasformato in 404 | 503 su errore del CMS (fatto per gli articoli, L6 per il resto) |
| `robots.txt` del CMS blocca le immagini | Smoke test: `Allow: /assets/` presente e og:image 200 con user-agent Facebook (L1) |

## 6. Registro avanzamento

| Data | Cosa | Chi |
|---|---|---|
| 2026-10-01 | Diagnosi e correzione delle 3 cause; convalide GSC avviate; piano scritto | utente + Claude |
| 2026-10-02 | Utente segnala link rotti negli articoli (AiOel). Inventario link interni (84 rotti in 170 articoli). Scoperto che ogni 404 mostra la schermata Cloudflare Access. Aggiunti L7–L11. `/english` corretto a mano dall'utente in `/it/ombre-e-luci-in-inglese/` | utente + Claude |
| 2026-10-02 | Primo deploy della correzione 404: **sito in 403 per ~50 s** (23:45–23:46), rollback a `2baa9ef2`. Il Worker su `main` non aveva le credenziali di Access | Claude |
| 2026-10-03 | Causa del 403 accertata su URL di anteprima. **L7 chiuso**: Worker `86f3f5dd` in produzione, 404 del sito al posto della schermata Access. `main` allineato alla produzione. Aggiunto L12 | utente + Claude |
| 2026-10-03 | Branch `refactor/consolidamento-didascalie-fase2` unito in `main` (solo documentazione + `scripts/cf-analytics.mjs`; codice del sito e Worker invariati, verificato). Create le issue #12–#24 (etichetta `affidabilita`), #19 chiusa | utente + Claude |
