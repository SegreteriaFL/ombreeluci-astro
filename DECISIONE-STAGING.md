# Decisione — deindicizzazione ombreeluci-staging.pages.dev

## DECISIONE ATTUALE — 2026-08-09

1. **Non intervenire ulteriormente sul `middleware.ts`** per il problema di indicizzazione `pages.dev`. Il fix noindex già spedito (`d73617a7`, confronto sull'host reale invece della env var `PUBLIC_SITE_URL`) resta in produzione come mitigazione a rischio zero (solo header, nessun redirect) mentre il resto del piano procede con calma.
2. **Eseguire la Fase 0** del piano sotto (audit, zero rischio, nessuna modifica in produzione).
3. Se l'audit conferma parità funzionale con il Worker attuale → **Fase 1** (porting su branch, zero deploy) → **Fase 2** (cutover: custom domain diretto su Cloudflare Pages, eliminazione del Worker come proxy).
4. **Stabilizzare almeno una settimana** dopo il cutover prima di procedere oltre.
5. Solo a quel punto, attivare la misura definitiva di deindicizzazione per `pages.dev`: **Fase 3 — Cloudflare Access**, non Bulk Redirects. Bulk Redirects è stato verificato tecnicamente funzionante (redirect reale a livello edge) ma **non supporta destinazioni dinamiche a livello account** — coprire l'intero sito richiederebbe una lista di migliaia di URL mantenuta manualmente ad ogni pubblicazione, reintroducendo esattamente il tipo di automazione fragile (secret/chiamata API che può fallire in silenzio) che altrove in questo progetto si è già speso tempo a eliminare. Dettagli del test in Appendice A6.
6. **Prima di attivare Fase 3 per davvero** (non prima dell'audit): verificare se il meccanismo scelto intercetta la subrequest interna del Worker (`forwardToPages()`) nello scenario di rollback — il Worker resta disattivato-non-eliminato apposta come rete di sicurezza (Fase 2, punto 1), quindi se mai venisse riattivato *dopo* che Access è già live su `pages.dev`, il rischio di intercettazione si ripresenterebbe. Non bloccante per procedere con l'audit.

**Perché B prima di A:** il Worker (`ombreeluci-redirects`) è oggi l'intermediario tra ogni richiesta pubblica e Cloudflare Pages. Qualunque protezione/redirect applicato a livello di hostname su `pages.dev` (Access o Bulk Redirect) deve necessariamente prevedere un'eccezione per la subrequest interna del Worker — è proprio quell'eccezione ad aver causato i 3 incidenti di produzione di luglio (Appendice A2). Eliminare il Worker come proxy (Fase B) rimuove la classe di bug alla radice, non solo il sintomo; a quel punto la protezione di `pages.dev` si implementa su un sistema singolo, senza eccezioni da ritagliare. L'audit del Worker (Appendice A4/Piano operativo) ha inoltre mostrato che quasi tutte le sue regole di redirect sono già duplicate nel codice Astro — B non è più "buttiamo via il Worker e vediamo cosa succede", è una migrazione verificabile con un gap reale isolato (Rule R, trailing slash) e un'incognita gestibile (proxy WordPress legacy su Aruba, da misurare in Fase 0).

---

## Piano operativo B → A (aggiornato 2026-08-09)

**Trovato durante l'audit del Worker (2026-07-27), cambia la valutazione di rischio della migrazione:**

| Elemento del Worker | Stato | Nota |
|---|---|---|
| Rule C+D (lookup table 1096 redirect) | ✅ Già duplicato | `src/data/redirects-legacy.json`, importato in `middleware.ts` |
| Rule B, F, F2, G, H, I, J, K, O, P (regex WP legacy) | ✅ Già duplicati | Stessi pattern presenti in `middleware.ts` (`DATE_PATH_RE`, `YEAR_SLUG_RE`, ecc.) — **da verificare parità byte-per-byte, non solo per nome**, prima del cutover |
| Rule Q, Q0 (categoria redirect) | ✅ Già duplicati | `astro.config.mjs` + `ARCHIVIO_REDIRECTS` in middleware |
| **Rule R (trailing slash `/it/*`, `/en/*` → +`/`)** | ❌ **Solo nel Worker** | Unico gap reale. Portabile con `trailingSlash: 'always'` nativo di Astro (`astro.config.mjs`) — probabilmente più pulito di riscriverla a mano nel middleware |
| **Proxy WordPress legacy** (`/wp-content`, `/wp-admin`, `/wp-json`, `/wp-login.php`, `/xmlrpc.php`, `/wp-cron.php`) → Aruba IP `89.46.105.36` | ⚠️ **Nessun equivalente Astro** | Il Worker instrada ancora richieste a un **WordPress live su Aruba** per questi path. Non sappiamo quanto traffico reale ricevano oggi (da misurare, vedi Fase 0). Nota STATO.md: 28 immagini gallery Assisi 1986 già falliscono con questo proxy — è già un sistema parzialmente rotto, non un pilastro solido da preservare a tutti i costi |
| Header `X-Internal-Proxy-Auth` / `X-Forwarded-Host` / secret sync | 🗑️ Da eliminare con B | Causa dei 3 incidenti di luglio (Appendice A2) — con B non serve più: niente Worker, niente secret da sincronizzare tra due sistemi |

### Fase 0 — Audit (0 rischio, nessuna modifica in produzione)

1. **Misurare traffico reale sui path WordPress legacy** via CF Analytics per path (`scripts/cf-analytics.mjs --by=path`, filtrato su `/wp-`) su una finestra di 30 giorni. Se è rumore/bot, si può ritirare il proxy Aruba senza sostituirlo. Se c'è traffico reale (es. hotlink a vecchie immagini `wp-content/uploads`), va deciso se migrare quei file su R2 o mantenere un proxy minimo dedicato.
2. **Diff riga-per-riga** di ogni regola del Worker (B, F, F2, G, H, I, J, K, L, M, N, O, P, Q, Q0) contro l'equivalente in `middleware.ts`/`astro.config.mjs` — non fidarsi del nome uguale, verificare stesso input→stesso output su un campione di URL reali per regola.
3. **Verificare sulla documentazione ufficiale Cloudflare** (non assumere) se un progetto Pages con custom domain attivo rende `*.pages.dev` **non più raggiungibile pubblicamente** o se resta comunque accessibile in parallelo — questo determina se, dopo B, la Fase 3 resta comunque necessaria per il problema SEO originale (probabile: sì, va verificato per certezza).
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

### Fase 3 — Cloudflare Access davanti a Pages

Solo dopo che Fase 2 è stabile da almeno una settimana, **e** dopo aver verificato l'interazione con lo scenario di rollback del Worker (vedi punto 6 della Decisione attuale). Con il Worker fuori dal path, un solo sistema (Pages), nessuna eccezione da ritagliare per un proxy che non esiste più. Bypass necessari da rivedere: solo il webhook Directus (`/api/algolia-sync`, `/api/sync-metadata`) — via Service Token o allowlist IP statico VPS Hetzner. Meccanismo (dettaglio storico in Appendice A3): blocca l'accesso pubblico diretto a `*.pages.dev` a livello di edge, prima che la richiesta arrivi ad Astro — copre SSR e SSG allo stesso modo, a differenza di un fix a livello di `middleware.ts` (che le pagine SSG non attraversano mai per costruzione).

**Criterio di non-ingenuità generale per tutte le fasi:** ogni fase termina con una verifica esplicita e un log scritto (come questo documento), mai "sembra funzionare" come criterio di successo — lo stesso pattern dei 3 incidenti di luglio è stato "sembrava a posto, poi si è scoperto il contrario due giorni dopo".

---

# Appendice — Diario tecnico e tentativi precedenti

## A1. Problema originale (sessione 2026-07-08/09)

Google indicizza `ombreeluci-staging.pages.dev` (il backend reale dietro il Worker proxy di `ombreeluci.it`) al posto del dominio pubblico, per le pagine servite in SSR (principalmente articoli). Impatto: **SEO, non funzionale** — nessun rischio per gli utenti, nessun downtime, nessuna perdita di dati. Confermato realmente sfruttato (non solo rischio teorico) l'8-9/8/2026 via `site:ombreeluci-staging.pages.dev` — pagine reali indicizzate sotto quel dominio.

## A2. Tentativi falliti 2026-07-08/09 (riassunto onesto)

| # | Commit | Cosa | Esito |
|---|---|---|---|
| 1 | `816f852c` | Redirect condizionato via header secret (`X-Internal-Proxy-Auth`) in `middleware.ts`, confronto contro `env.INTERNAL_PROXY_AUTH` | **526 in produzione** — `forwardToPages()` usava `fetch()` senza `redirect: 'manual'`, quindi seguiva automaticamente il 301 generando un loop instradato fuori dal Worker verso un origin senza certificato |
| 2 | `afeb1ddf` | Fix: `redirect: 'manual'` sulla subrequest del Worker | **Loop di redirect infinito lato client** — nessun guard-rail: quando il confronto del secret falliva anche su richieste già legittime (arrivate dal Worker), il redirect puntava all'URL che il client aveva già richiesto |
| 3 | `274b4320` / `d2639c65` | Guard-rail `X-Forwarded-Host` (header incondizionato dal Worker, indipendente dal secret) + diagnosi secret (causa mismatch: 65 vs 64 caratteri, whitespace da copia-incolla dashboard, corretto) | **Stub di redirect anomalo** su `/it/archivio/` e `/it/rubriche/recensioni/` (pagine SSG, mai dovrebbero passare dal middleware). Riprodotto **due volte**, con trigger diversi (`deploy_hook` e `github:push` via `git push` normale) — causa **mai confermata con certezza**. Ipotesi build cache Cloudflare non verificabile (audit log non copre questo toggle; stato Enabled/Disabled durante gli incidenti non accertabile a posteriori) |

**Pattern osservato:** ogni fix ha risolto il sintomo del tentativo precedente e ne ha esposto uno nuovo, mai lo stesso due volte. Tre superfici di fallimento indipendenti toccate in tre round (fetch redirect-follow, guard-rail mancante, build/output inconsistente tra ambiente locale e Cloudflare) — non un singolo bug isolabile con un altro giro di iterazione mirata.

**Costo reale:** tre incidenti di produzione (526, loop di redirect, stub anomalo), tre rollback d'emergenza, zero tentativi su tre risolti in modo stabile e confermato.

## A3. Opzione A — Cloudflare Access davanti al progetto Pages (dettaglio storico, ora Fase 3 del piano operativo)

**Eccezioni necessarie (bypass):**
- **Worker** (`ombreeluci-redirects`): via **Service Token** con **Service Auth policy** (non "Bypass" — Service Auth mantiene il logging delle richieste, Bypass lo esclude interamente). Il Worker allega `CF-Access-Client-Id` / `CF-Access-Client-Secret` come header nella subrequest `forwardToPages()`. *(Diventa irrilevante dopo B: niente più Worker da far passare.)*
- **Webhook Directus** (`/api/algolia-sync`, chiamato oggi direttamente su `pages.dev`, vedi `scripts/setup-algolia-flow.mjs:10`): via allowlist IP statico sul VPS Hetzner (`159.69.196.64`, confermato stabile) oppure un secondo Service Token dedicato, se Directus supporta header custom sulle Flow "request" operation (verificato che li supporta a livello di schema, non ancora testato in pratica).

**Rischio:** una policy mal configurata blocca **tutto** il traffico verso Pages — cioè l'intero sito, non solo l'indicizzazione. Va implementata con lo stesso rigore step-by-step già usato negli incidenti di luglio (diff mostrato, conferma esplicita, verifica immediata, rollback pronto), in una **sessione dedicata**.

## A4. Opzione B — Custom domain diretto su Cloudflare Pages (dettaglio storico, ora Fase 1-2 del piano operativo)

**Beneficio strutturale:** elimina l'intera categoria di bug vista negli incidenti di luglio, non solo i sintomi — niente più sync di secret tra due sistemi (Worker + Pages), niente più `forwardToPages()`, niente più due domini che si parlano tramite header custom.

**Rischio e cose da verificare prima, non assumere:**
- È una **migrazione di architettura**, non un fix puntuale — tocca il DNS e l'intera catena di redirect legacy accumulata nel Worker.
- **Non verificato**: se `pages.dev` resta comunque raggiungibile in parallelo anche con un custom domain attivo — va confermato sulla documentazione ufficiale Cloudflare Pages, non assunto per analogia con altri sistemi.
- **Non verificato**: se il cambio comporta downtime durante il cutover — va pianificato con una finestra di manutenzione, come il cutover di maggio 2026 già documentato nel progetto.
- Il Worker gestisce oggi anche redirect da WordPress legacy che non hanno equivalente nativo in un binding diretto Pages↔dominio — andrebbero migrati o mantenuti in qualche forma.

## A5. Raccomandazione originale 2026-07-08/09 (superata dalla Decisione attuale in cima)

Non implementare nulla quella notte. Riprendere con l'Opzione A o B in una sessione dedicata, con tempo per pianificare senza la pressione di un incidente in corso.

## A6. Bulk Redirects nativo per `pages.dev` — obiezione, chiarimento, test empirico (2026-08-09)

**Contesto:** dopo la conferma che Google aveva realmente indicizzato pagine sotto `pages.dev` (A1), un'analisi esterna ha proposto un'alternativa/aggiunta al piano B→A: usare **Bulk Redirects** di Cloudflare per reindirizzare `ombreeluci-staging.pages.dev` → `ombreeluci.it` a livello di edge, invece di (o oltre a) Cloudflare Access.

**Obiezione sollevata (Claude Code):** Bulk Redirects è un prodotto account/zone-level che normalmente richiede che l'hostname sia proxato dentro una zona DNS controllata dall'utente. `pages.dev` non è una zona di `ombreeluci.it`.

**Chiarimento ricevuto:** non è un'applicazione impropria — è un caso particolare esplicitamente supportato. La configurazione parte dalla dashboard del progetto Pages (Workers & Pages → progetto → Custom domains → Bulk Redirects). Il sottodominio `<progetto>.pages.dev` è servito dall'infrastruttura Cloudflare per conto dell'account, quindi soddisfa il requisito "proxato da Cloudflare" anche senza comparire nel pannello DNS della zona `ombreeluci.it`. Confermato anche da un report pratico di un utente che ha reindirizzato tutti i sottodomini `*.pages.dev` di un account con un singolo Bulk Redirect.

**Disponibilità confermata in dashboard (8/8):** Bulk Redirects disponibile sul piano **Free** di questo account — "0 of 5 Bulk Redirect Lists, 0 of 10.000 list items", nessun paywall.

**Test empirico 1 — un Bulk Redirect intercetta a livello edge indipendentemente dal chiamante?** SÌ. Test reale isolato (lista con **un solo URL fittizio mai esistito**, zero rischio produzione): lista creata via API (`POST /accounts/{id}/rules/lists` + `.../items`), regola attivata via dashboard, poi verificato via richieste esterne dirette:
- Path in lista → **301 raw confermato** (`Location: https://ombreeluci.it/it/`, header `server: cloudflare` reale)
- Path reali (`/`, `/it/dialogo-aperto-n-109/`, `/it/archivio/`) → **200 intatti**, nessuna interferenza

Conferma: il meccanismo funziona a livello edge, ma **è puntuale** (match esatto contro le voci della lista), non un blocco cieco sull'hostname. Cleanup completo eseguito (rule + list cancellate, verificato `GET /rules/lists` → `[]`).

**Test empirico 2 — una regola sola con destinazione dinamica (`concat("https://ombreeluci.it", path)`) può sostituire una lista di migliaia di URL?** NO. Tentativo via API (`from_value` invece di `from_list`) → errore esplicito del prodotto: **"from_value field is not available for this phase"** (codice 20079) — le destinazioni dinamiche/wildcard non sono disponibili a livello account, solo a livello di singola zona (dove non si può referenziare un hostname esterno come `pages.dev`).

**Conclusione (motiva la Decisione attuale in cima):** per coprire l'intero sito via Bulk Redirects servirebbe una lista con una voce per ogni URL reale, mantenuta manualmente ad ogni pubblicazione — o automatizzata con un'integrazione aggiuntiva (es. Directus Flow → Cloudflare API ad ogni publish) che reintrodurrebbe esattamente la classe di rischio (secret/chiamata API che può fallire in silenzio) che questo progetto ha speso sessioni a eliminare altrove. Non è la soluzione "una riga e via" che sembrava dalla documentazione. **Cloudflare Access resta la scelta primaria per la Fase 3** — Bulk Redirects resta utile solo per redirect puntuali (pochi URL fissi), non come sostituto di Access per la copertura totale.

**Non ancora testato:** se il meccanismo intercetta anche la subrequest interna del Worker (`forwardToPages()`), non solo le richieste esterne dirette — vedi punto 6 della Decisione attuale (da chiudere prima di attivare Fase 3, non bloccante per l'audit).

## A7. Note tecniche — API Cloudflare per prossime sessioni

- Liste: `GET/POST/DELETE /accounts/{account_id}/rules/lists`, item: `.../rules/lists/{list_id}/items` (async, creazione item ritorna `operation_id`, va ripollato)
- Regole redirect account-level: **`POST /accounts/{account_id}/rulesets`** (creazione, `kind:"root"`, `phase:"http_request_redirect"`) o **`PUT /accounts/{account_id}/rulesets/{ruleset_id}`** (aggiornamento) — **non** `PUT .../rulesets/phases/http_request_redirect/entrypoint` (endpoint che non funziona per questo caso, ha fatto perdere tempo in questa sessione)
- Permesso token dashboard per gestire le regole: **"Bulk URL Redirects"** (cercare "redi" nel dropdown Account) — le liste da sole bastano con **"Account Filter Lists"** (cercare "list"); "Account Rulesets" non è sufficiente per l'endpoint account-level `http_request_redirect`
- Token usato: `CF_ZONE_TOKEN` / "OEL Audit & Cache" in Cloudflare dashboard, esteso in questa sessione con questi permessi account-level
