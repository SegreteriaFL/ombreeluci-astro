# Decisione — deindicizzazione ombreeluci-staging.pages.dev

**Stato:** documento di pianificazione, nessuna implementazione. Sessione 2026-07-08/09.
**Stato codice al momento della stesura:** `src/middleware.ts` revertato a stato pre-sessione (commit `d632c920`, che ripristina `e219515e`). Nessuna logica di redirect condizionato attiva. Bug SEO originale presente, nessun rischio funzionale.

---

## 1. Problema originale

Google indicizza `ombreeluci-staging.pages.dev` (il backend reale dietro il Worker proxy di `ombreeluci.it`) al posto del dominio pubblico, per le pagine servite in SSR (principalmente articoli). Impatto: **SEO, non funzionale** — nessun rischio per gli utenti, nessun downtime, nessuna perdita di dati. Il sito pubblico su `ombreeluci.it` ha sempre funzionato correttamente durante tutti i tentativi di questa sessione.

---

## 2. Tentativi fatti stasera (riassunto onesto)

| # | Commit | Cosa | Esito |
|---|---|---|---|
| 1 | `816f852c` | Redirect condizionato via header secret (`X-Internal-Proxy-Auth`) in `middleware.ts`, confronto contro `env.INTERNAL_PROXY_AUTH` | **526 in produzione** — `forwardToPages()` usava `fetch()` senza `redirect: 'manual'`, quindi seguiva automaticamente il 301 generando un loop instradato fuori dal Worker verso un origin senza certificato |
| 2 | `afeb1ddf` | Fix: `redirect: 'manual'` sulla subrequest del Worker | **Loop di redirect infinito lato client** — nessun guard-rail: quando il confronto del secret falliva anche su richieste già legittime (arrivate dal Worker), il redirect puntava all'URL che il client aveva già richiesto |
| 3 | `274b4320` / `d2639c65` | Guard-rail `X-Forwarded-Host` (header incondizionato dal Worker, indipendente dal secret) + diagnosi secret (causa mismatch: 65 vs 64 caratteri, whitespace da copia-incolla dashboard, corretto) | **Stub di redirect anomalo** su `/it/archivio/` e `/it/rubriche/recensioni/` (pagine SSG, mai dovrebbero passare dal middleware). Riprodotto **due volte**, con trigger diversi (`deploy_hook` e `github:push` via `git push` normale) — causa **mai confermata con certezza**. Ipotesi build cache Cloudflare non verificabile (audit log non copre questo toggle; stato Enabled/Disabled durante gli incidenti non accertabile a posteriori) |

**Pattern osservato:** ogni fix ha risolto il sintomo del tentativo precedente e ne ha esposto uno nuovo, mai lo stesso due volte. Tre superfici di fallimento indipendenti toccate in tre round (fetch redirect-follow, guard-rail mancante, build/output inconsistente tra ambiente locale e Cloudflare) — non un singolo bug isolabile con un altro giro di iterazione mirata.

**Costo reale:** tre incidenti di produzione (526, loop di redirect, stub anomalo), tre rollback d'emergenza, zero tentativi su tre risolti in modo stabile e confermato.

---

## 3. Opzione A — Cloudflare Access davanti al progetto Pages

**Meccanismo:** blocca l'accesso pubblico diretto a `*.pages.dev` a livello di edge Cloudflare, **prima** che una richiesta arrivi ad Astro/Pages Functions. Elimina il problema alla radice per qualunque tipo di pagina — SSR e SSG — perché il blocco avviene a un livello che precede completamente l'applicazione.

**Eccezioni necessarie (bypass):**
- **Worker** (`ombreeluci-redirects`): via **Service Token** con **Service Auth policy** (non "Bypass" — Service Auth mantiene il logging delle richieste, Bypass lo esclude interamente). Il Worker allega `CF-Access-Client-Id` / `CF-Access-Client-Secret` come header nella subrequest `forwardToPages()`.
- **Webhook Directus** (`/api/algolia-sync`, chiamato oggi direttamente su `pages.dev`, vedi `scripts/setup-algolia-flow.mjs:10`): via allowlist IP statico sul VPS Hetzner (`159.69.196.64`, confermato stabile in questa sessione) oppure un secondo Service Token dedicato, se Directus supporta header custom sulle Flow "request" operation (verificato che li supporta a livello di schema, non ancora testato in pratica per questo caso).

**Copertura:** risolve anche il gap mai chiuso da nessun tentativo di stasera — le pagine SSG (homepage, categorie, `/it/archivio/`, `/it/rubriche/*`, ecc.) non passano mai dal middleware per costruzione (`dist/_routes.json` le esclude dalla Pages Function), quindi nessuna logica applicativa può proteggerle. Cloudflare Access, agendo a monte, le copre allo stesso modo delle pagine SSR.

**Rischio:** una policy mal configurata blocca **tutto** il traffico del Worker verso Pages — cioè l'intero sito, non solo l'indicizzazione. Il Worker dipende da un accesso libero a `pages.dev` per servire ogni singola richiesta di `ombreeluci.it`. Va implementata con lo stesso rigore step-by-step già usato stasera (diff mostrato, conferma esplicita, verifica immediata, rollback pronto), in una **sessione dedicata**, mai di fretta o in coda a un'altra sessione stanca da incidenti.

---

## 4. Opzione B — Custom domain diretto su Cloudflare Pages, eliminazione del Worker come proxy

**Meccanismo:** `ombreeluci.it` collegato direttamente al progetto Pages come custom domain (il binding esiste già, oggi "deactivated" — vedi verifica fatta in questa sessione), senza il Worker come intermediario.

**Beneficio strutturale:** elimina l'intera categoria di bug vista stasera, non solo i sintomi — niente più sync di secret tra due sistemi (Worker + Pages), niente più `forwardToPages()`, niente più due domini che si parlano tramite header custom. La superficie di fallimento si riduce drasticamente perché sparisce l'intermediario.

**Cosa resterebbe da fare:** la deindicizzazione dell'URL `pages.dev` residuo andrebbe comunque gestita — probabilmente con l'Opzione A (Cloudflare Access), ma applicata a un'architettura molto più semplice (nessun Worker da far passare, solo il blocco diretto su Pages).

**Rischio e cose da verificare prima, non assumere:**
- È una **migrazione di architettura**, non un fix puntuale — tocca il DNS e l'intera catena di redirect legacy accumulata nel Worker (Rule C→D→...→R, redirect da vecchi URL WordPress).
- **Non verificato**: se `pages.dev` resta comunque raggiungibile in parallelo anche con un custom domain attivo — va confermato sulla documentazione ufficiale Cloudflare Pages, non assunto per analogia con altri sistemi.
- **Non verificato**: se il cambio comporta downtime durante il cutover — va pianificato con una finestra di manutenzione, come il cutover di maggio 2026 già documentato nel progetto.
- Il Worker gestisce oggi anche redirect da WordPress legacy (`/YYYY/MM/DD/slug/`, `/project/*`, ecc.) che non hanno equivalente nativo in un binding diretto Pages↔dominio — andrebbero migrati o mantenuti in qualche forma (es. redirects statici in `astro.config.mjs`, se il volume lo consente).

---

## 5. Raccomandazione

**Non implementare nulla stanotte.** Il codice resta nello stato stabile pre-sessione (`d632c920`): bug SEO originale presente, nessun rischio funzionale, sito verificato stabile su tutte le route critiche.

Riprendere con l'Opzione A o B in una **sessione dedicata**, con tempo per pianificare senza la pressione di un incidente in corso — la stessa disciplina già raccomandata per il Worker/middleware, applicata questa volta a monte invece che rincorrendo sintomi in produzione.

---

## 6. Piano di lavoro B → A (aggiornato 2026-07-27, dopo audit del Worker)

**Decisione presa:** fare **B prima, poi A**. B semplifica l'architettura (elimina la classe di bug Worker/secret); A blocca l'indicizzazione di `pages.dev`, il problema originale. Fatto in quest'ordine, A si implementa su un sistema singolo, senza l'eccezione "bypass per il Worker" che l'ha resa rischiosa finora.

**Trovato durante l'audit (rilevante, cambia la valutazione di rischio rispetto alla sezione 4):**

| Elemento del Worker | Stato | Nota |
|---|---|---|
| Rule C+D (lookup table 1096 redirect) | ✅ Già duplicato | `src/data/redirects-legacy.json`, importato in `middleware.ts` |
| Rule B, F, F2, G, H, I, J, K, O, P (regex WP legacy) | ✅ Già duplicati | Stessi pattern presenti in `middleware.ts` (`DATE_PATH_RE`, `YEAR_SLUG_RE`, ecc.) — **da verificare parità byte-per-byte, non solo per nome**, prima del cutover |
| Rule Q, Q0 (categoria redirect) | ✅ Già duplicati | `astro.config.mjs` + `ARCHIVIO_REDIRECTS` in middleware |
| **Rule R (trailing slash `/it/*`, `/en/*` → +`/`)** | ❌ **Solo nel Worker** | Unico gap reale. Portabile con `trailingSlash: 'always'` nativo di Astro (`astro.config.mjs`) — probabilmente più pulito di riscriverla a mano nel middleware |
| **Proxy WordPress legacy** (`/wp-content`, `/wp-admin`, `/wp-json`, `/wp-login.php`, `/xmlrpc.php`, `/wp-cron.php`) → Aruba IP `89.46.105.36` | ⚠️ **Nessun equivalente Astro** | Il Worker instrada ancora richieste a un **WordPress live su Aruba** per questi path. Non sappiamo quanto traffico reale ricevano oggi (da misurare, vedi Fase 0). Nota STATO.md: 28 immagini gallery Assisi 1986 già falliscono con questo proxy — è già un sistema parzialmente rotto, non un pilastro solido da preservare a tutti i costi |
| Header `X-Internal-Proxy-Auth` / `X-Forwarded-Host` / secret sync | 🗑️ Da eliminare con B | Causa dei 3 incidenti di luglio — con B non serve più: niente Worker, niente secret da sincronizzare tra due sistemi |

### Fase 0 — Audit (0 rischio, nessuna modifica in produzione)

1. **Misurare traffico reale sui path WordPress legacy** via CF Analytics per path (`scripts/cf-analytics.mjs --by=path`, filtrato su `/wp-`) su una finestra di 30 giorni. Se è rumore/bot, si può ritirare il proxy Aruba senza sostituirlo. Se c'è traffico reale (es. hotlink a vecchie immagini `wp-content/uploads`), va deciso se migrare quei file su R2 o mantenere un proxy minimo dedicato.
2. **Diff riga-per-riga** di ogni regola del Worker (B, F, F2, G, H, I, J, K, L, M, N, O, P, Q, Q0) contro l'equivalente in `middleware.ts`/`astro.config.mjs` — non fidarsi del nome uguale, verificare stesso input→stesso output su un campione di URL reali per regola.
3. **Verificare sulla documentazione ufficiale Cloudflare** (non assumere) se un progetto Pages con custom domain attivo rende `*.pages.dev` **non più raggiungibile pubblicamente** o se resta comunque accessibile in parallelo — questo determina se, dopo B, l'Opzione A resta comunque necessaria per il problema SEO originale (probabile: sì, va verificato per certezza).
4. **Elenco completo redirect da altri sistemi** che potrebbero dipendere dal Worker e non essere documentati qui (es. link social storici, backlink esterni) — grep su documentazione e su `redirects-legacy.json` per pattern non coperti.

### Fase 1 — Porting (su branch, build locale + `wrangler pages dev`, zero deploy)

1. Aggiungere `trailingSlash: 'always'` (o equivalente) in `astro.config.mjs` per Rule R — verificare che non rompa route con query string o file statici (`.xml`, asset).
2. Decidere e implementare l'esito dell'audit Fase 0 punto 1 (drop proxy WP, migrazione file mancanti su R2, o proxy minimo dedicato).
3. Colmare eventuali gap trovati nel diff di Fase 0 punto 2.
4. Smoke test completo su preview deployment (branch) contro un campione ampio di URL storici (usare `scripts/verify-redirects.mjs` esteso a coprire anche i pattern regex, non solo la lookup table).

### Fase 2 — Cutover DNS (finestra di manutenzione dedicata, rollback pronto)

1. Procedura ricalcata su quella del cutover 21/5 (`STATO.md`): custom domain Pages riattivato, DNS puntato direttamente, Worker disattivato **non eliminato** (tenerlo pronto per rollback immediato in caso di sorpresa).
2. Finestra a basso traffico, monitoraggio attivo CF Analytics + UptimeRobot durante e dopo.
3. Criterio di rollback esplicito e scritto **prima** di iniziare (es. "se error rate >1% per >5 minuti, riattiva Worker").

### Fase 3 — Opzione A (Cloudflare Access davanti a Pages)

Solo dopo che Fase 2 è stabile da almeno una settimana. Ora molto più semplice: un solo sistema (Pages), nessuna eccezione da ritagliare per un Worker che non esiste più. Bypass necessari da rivedere: solo il webhook Directus (`/api/algolia-sync`, `/api/sync-metadata`) — via Service Token o allowlist IP statico VPS Hetzner.

**Criterio di non-ingenuità generale per tutte le fasi:** ogni fase termina con una verifica esplicita e un log scritto (come questo documento), mai "sembra funzionare" come criterio di successo — lo stesso pattern dei 3 incidenti di luglio è stato "sembrava a posto, poi si è scoperto il contrario due giorni dopo".

---

## 7. Bulk Redirects nativo per `pages.dev` — obiezione e chiarimento (2026-08-09)

**Contesto:** riscontro del gap noindex nella sessione dell'8-9/8 (vedi STATO.md/bug_ux_ui.md — `X-Robots-Tag` mancante su `pages.dev` raggiunto direttamente, fixato in `middleware.ts` commit `d73617a7` confrontando l'host reale invece di `PUBLIC_SITE_URL`). Confermato con `site:ombreeluci-staging.pages.dev` che Google aveva **realmente indicizzato** pagine sotto quel dominio (non solo rischio teorico). Un'analisi esterna ha proposto un'alternativa/aggiunta al piano B→A: usare **Bulk Redirects** di Cloudflare per reindirizzare `ombreeluci-staging.pages.dev` → `ombreeluci.it` a livello di edge, invece di (o oltre a) Cloudflare Access.

**Obiezione sollevata (Claude Code):** Bulk Redirects è un prodotto **account/zone-level** che normalmente richiede che l'hostname di destinazione sia proxato dentro una zona DNS controllata dall'utente. `pages.dev` non è una zona di `ombreeluci.it` — è un dominio di sistema di Cloudflare condiviso tra tutti i clienti Pages. Applicare un prodotto di zona a un hostname non proprio sembrava una lettura impropria della documentazione.

**Chiarimento ricevuto:** non è un'applicazione impropria — è un caso particolare esplicitamente supportato. La configurazione parte dalla **dashboard del progetto Pages** (Workers & Pages → progetto → Custom domains → Bulk Redirects), non dalla configurazione di zona generica. Il sottodominio `<progetto>.pages.dev` è servito dall'infrastruttura Cloudflare per conto dell'account, quindi soddisfa il requisito "proxato da Cloudflare" richiesto dal prodotto anche senza comparire nel pannello DNS della zona `ombreeluci.it` — è una funzionalità account-level esposta specificamente per i sottodomini `pages.dev` dei propri progetti Pages. Confermato anche da un report pratico (non solo documentale) di un utente che ha reindirizzato tutti i sottodomini `*.pages.dev` di un intero account con un singolo Bulk Redirect.

**Valutazione:** obiezione ragionevolmente chiusa sulla carta (spiegazione specifica e coerente, non una ripetizione della stessa citazione). **Non equivale a verificato per questo account/setup specifico** — da qui il passo successivo.

**Cosa resta fermo, rafforzato non scavalcato dal chiarimento:** se Bulk Redirect opera sull'hostname `ombreeluci-staging.pages.dev` a livello di edge indipendentemente da chi genera la richiesta, la subrequest interna `forwardToPages()` del Worker verso quello stesso hostname resta esposta allo stesso rischio già visto nel tentativo #1 di luglio (526 da redirect non gestito in una subrequest) — stessa categoria di guasto, questa volta innescata da un prodotto Cloudflare nativo invece che dal middleware applicativo. **La sequenza B→A resta obbligata**: il Worker come proxy deve sparire (Fase B) prima che qualunque redirect/blocco a livello di hostname (Bulk Redirect o Access) possa essere attivato senza rompere il traffico legittimo del Worker verso Pages.

### Prossime mosse (in ordine)

1. **[Ora, sola lettura, zero rischio]** Verifica concreta invece di un'altra lettura di documentazione: controllare via API Cloudflare (a) se il prodotto Bulk Redirects/Redirect Lists è disponibile sul piano Free di questo account, (b) se esiste una configurazione dedicata a livello di progetto Pages per il redirect `pages.dev` → custom domain, prima di scriverlo nel piano come fatto acquisito. Se emerge un modo per simulare/tracciare il comportamento su una regola di test, verificare lì se la subrequest del Worker (`forwardToPages()`) verrebbe intercettata.
2. **Aggiornare Fase 0** del piano (sezione 6) con l'esito di questa verifica come punto esplicito dell'audit, prima di procedere a qualunque implementazione.
3. **Rivalutare Fase 3**: se Bulk Redirect risulta realmente disponibile e sicuro dopo B, considerarlo come prima misura (301 esplicito, segnale di canonicalizzazione più forte per Google, zero manutenzione applicativa) con Cloudflare Access relegato a hardening successivo opzionale (utile se emergono altri motivi come scraping/hotlinking diretto su `pages.dev`, non necessario per il solo problema SEO).
4. Nessuna implementazione in produzione da questa sezione — resta valida la raccomandazione della sezione 5: sessione dedicata, mai di fretta.

**AGGIORNAMENTO 2026-08-09 — punto 1 chiuso, disponibilità confermata:** verificato **direttamente in dashboard** (non solo via API, bloccata da permessi token insufficienti fino a questo momento — poi risolti aggiungendo `Account Rulesets` + `Account Filter Lists` al token `CF_ZONE_TOKEN`/"OEL Audit & Cache"): **Bulk Redirects è disponibile sul piano Free** di questo account — "0 of 5 Bulk Redirect Lists, 0 of 10.000 list items", nessun paywall/upgrade richiesto, funzionalità piena. Nessuna lista esistente (conferma anche via API: `GET /accounts/.../rules/lists` → `[]`). Trovata anche un'alternativa più semplice per un solo hostname: **"single redirect rule" a livello di zona** (link nella stessa pagina dashboard, non ancora esplorato).

**AGGIORNAMENTO 2026-08-09 (continua) — test empirico completo, entrambe le domande chiuse:**

**Test 1 — Bulk Redirect intercetta a livello edge indipendentemente dal chiamante?** SÌ, confermato con un test reale e isolato (lista con **un solo URL fittizio mai esistito**, per zero rischio sulla produzione): creata lista `oel_test_probe_20260809` via API (`POST /accounts/{id}/rules/lists` + `POST .../items`), attivata una Bulk Redirect Rule via dashboard (l'attivazione della regola richiede un permesso token diverso dalle liste, vedi sotto), poi verificato via richieste esterne dirette:
- Path in lista → **301 raw confermato** (`Location: https://ombreeluci.it/it/`, header `server: cloudflare` reale, non un artefatto dell'app)
- Path reali (`/`, `/it/dialogo-aperto-n-109/`, `/it/archivio/`) → **200 intatti**, nessuna interferenza

Conferma: il meccanismo funziona a livello edge come temuto/sperato, ma **è puntuale (match esatto contro le voci della lista), non un blocco cieco sull'hostname** — non tocca nulla che non sia esplicitamente elencato. Cleanup completo eseguito (rule + list cancellate, verificato `GET /rules/lists` → `[]`).

**Test 2 — un'unica regola con destinazione dinamica (`concat("https://ombreeluci.it", path)`) può sostituire una lista di migliaia di URL?** NO. Tentativo via API (`PUT /accounts/{id}/rulesets/{ruleset_id}` con `action_parameters.from_value` invece di `from_list`) → errore esplicito del prodotto: **"from_value field is not available for this phase"** (codice 20079) — le destinazioni dinamiche/wildcard **non sono disponibili a livello account**, solo a livello di singola zona (dove però non si può referenziare un hostname esterno come `pages.dev`). **Conseguenza pratica:** per coprire l'intero sito via Bulk Redirects servirebbe una lista con una voce per ogni URL reale (fino a 10.000/lista × 5 liste = 50.000 possibili, tecnicamente sufficiente per ~3.400 articoli + resto, ma da mantenere manualmente ad ogni nuovo articolo pubblicato) — non la soluzione "una riga e via" che sembrava inizialmente. Riduce l'attrattiva di Bulk Redirects rispetto a Cloudflare Access per la copertura totale del problema originale.

**Nota tecnica per prossime sessioni — endpoint API corretti (dopo un giro a vuoto sull'endpoint sbagliato):**
- Liste: `GET/POST/DELETE /accounts/{account_id}/rules/lists`, item: `.../rules/lists/{list_id}/items` (async, creazione item ritorna `operation_id`, va ripollato)
- Regole redirect account-level: **`POST /accounts/{account_id}/rulesets`** (creazione, `kind:"root"`, `phase:"http_request_redirect"`) o **`PUT /accounts/{account_id}/rulesets/{ruleset_id}`** (aggiornamento) — **non** `PUT .../rulesets/phases/http_request_redirect/entrypoint` (endpoint che non funziona per questo caso, ha fatto perdere tempo)
- Permesso token dashboard corretto per le regole: **"Bulk URL Redirects"** (cercare "redi" nel dropdown Account) — le liste da sole bastano con **"Account Filter Lists"** (cercare "list")

**Resta da testare (punto 1, seconda parte):** se un Bulk Redirect su `ombreeluci-staging.pages.dev` intercetta anche la subrequest interna del Worker (`forwardToPages()`), non solo le richieste esterne dirette. Test pianificato: lista con un solo URL di prova mai esistito (non collide con contenuto reale) → regola attivata solo su quel path → verifica esterna (curl) se scatta il redirect, **e** verifica in parallelo che un path reale (homepage) non ne risenta → cleanup immediato (rule + list cancellate) a test concluso. Zero rischio per la produzione per costruzione (il path di test non esiste da nessuna parte nel sito reale).
