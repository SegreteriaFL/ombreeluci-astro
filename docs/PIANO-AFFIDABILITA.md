# Piano affidabilità — dopo il crollo GSC di agosto-settembre 2026

**Aperto:** 2026-10-01 · **Prossimo controllo:** venerdì 2026-10-09 · **Stato:** documentato, lavori non iniziati

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
| L1 | Smoke test affidabile | ⬜ | Claude |
| L2 | Notifiche che arrivano davvero | ⬜ | decisione utente + Claude |
| L3 | Controllo SEO settimanale automatico | ⬜ | Claude |
| L4 | Togliere il `noindex` per hostname dal middleware | ⬜ | Claude |
| L5 | `docs/LEZIONI.md`: ogni lezione ha il suo controllo | ⬜ | Claude |
| L6 | 503 invece di 404 anche su autori e archivio | ⬜ | Claude |

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
