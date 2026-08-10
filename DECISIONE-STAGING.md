# Decisione — deindicizzazione ombreeluci-staging.pages.dev

## DECISIONE ATTUALE — 2026-08-09

1. **Non intervenire ulteriormente sul `middleware.ts`** per il problema di indicizzazione `pages.dev`. Il fix noindex già spedito (`d73617a7`, confronto sull'host reale invece della env var `PUBLIC_SITE_URL`) resta in produzione come mitigazione a rischio zero (solo header, nessun redirect) mentre il resto del piano procede con calma.
2. **Fase 0 (audit) eseguita il 2026-08-10** — esito: **non ancora sicuro ritirare il Worker**. Confronto regola-per-regola completo in Appendice A8: trovati gap reali oltre a Rule R (trailing slash), già noto — vedi tabella in "Piano operativo" sotto. Il proxy WordPress legacy verso Aruba, che la Fase 0 dell'audit del 27/7 doveva ancora misurare, **è già stato ritirato quello stesso giorno** (commit `a69b441f`, dati e decisione in Appendice A2-bis / `bug_ux_ui.md`) — non è più un punto aperto.
3. Prossimo passo: **Fase 1** — portare in Astro le regole mancanti trovate dall'audit (elenco sotto), poi verificare parità completa su branch prima di considerare **Fase 2** (cutover: custom domain diretto su Cloudflare Pages, eliminazione del Worker come proxy).
4. **Stabilizzare almeno una settimana** dopo il cutover prima di procedere oltre.
5. Solo a quel punto, attivare la misura definitiva di deindicizzazione per `pages.dev`: **Fase 3 — Cloudflare Access**, non Bulk Redirects. Bulk Redirects è stato verificato tecnicamente funzionante (redirect reale a livello edge) ma **non supporta destinazioni dinamiche a livello account** — coprire l'intero sito richiederebbe una lista di migliaia di URL mantenuta manualmente ad ogni pubblicazione, reintroducendo esattamente il tipo di automazione fragile (secret/chiamata API che può fallire in silenzio) che altrove in questo progetto si è già speso tempo a eliminare. Dettagli del test in Appendice A6.
6. **Prima di attivare Fase 3 per davvero** (non prima dell'audit): verificare se il meccanismo scelto intercetta la subrequest interna del Worker (`forwardToPages()`) nello scenario di rollback — il Worker resta disattivato-non-eliminato apposta come rete di sicurezza (Fase 2, punto 1), quindi se mai venisse riattivato *dopo* che Access è già live su `pages.dev`, il rischio di intercettazione si ripresenterebbe. Non bloccante per procedere con l'audit.

**Perché B prima di A:** il Worker (`ombreeluci-redirects`) è oggi l'intermediario tra ogni richiesta pubblica e Cloudflare Pages. Qualunque protezione/redirect applicato a livello di hostname su `pages.dev` (Access o Bulk Redirect) deve necessariamente prevedere un'eccezione per la subrequest interna del Worker — è proprio quell'eccezione ad aver causato i 3 incidenti di produzione di luglio (Appendice A2). Eliminare il Worker come proxy (Fase B) rimuove la classe di bug alla radice, non solo il sintomo; a quel punto la protezione di `pages.dev` si implementa su un sistema singolo, senza eccezioni da ritagliare. L'audit del Worker (Appendice A4/Piano operativo) ha inoltre mostrato che quasi tutte le sue regole di redirect sono già duplicate nel codice Astro — B non è più "buttiamo via il Worker e vediamo cosa succede", è una migrazione verificabile con un gap reale isolato (Rule R, trailing slash) e un'incognita gestibile (proxy WordPress legacy su Aruba, da misurare in Fase 0).

---

## Piano operativo B → A (aggiornato 2026-08-10, esito audit Fase 0)

**Confronto regola-per-regola completo del Worker contro `middleware.ts`/`astro.config.mjs`/`redirects-legacy.json`, eseguito il 2026-08-10 (dettaglio completo in Appendice A8). Sostituisce la tabella "quasi tutto già duplicato" ipotizzata il 27/7 — quell'audit non aveva ancora fatto il confronto pattern-per-pattern, solo un controllo per nome.**

| Elemento del Worker | Stato | Nota |
|---|---|---|
| Rule C+D (lookup table 1096 redirect) | ⚠️ **Duplicato con 1 gap** | `src/data/redirects-legacy.json` via `middleware.ts` — manca il fallback su path decodificato: 2 chiavi Unicode (`/メリークリスマス/`, `/поздравляем/` ecc.) non matchano perché `url.pathname` arriva percent-encoded |
| Rule B, F, F2, G, H, K, L, O (date, anno-slug, numero, project-numero, diario, insieme, blog EN) | ✅ Duplicati e verificati equivalenti | `DATE_PATH_RE`, `YEAR_SLUG_RE`, `EN_YEAR_SLUG_RE`, `NUMERO_SHORT_RE`, `PROJECT_NUMERO_RE`, `DIARIO_RE`, `INSIEME_RE`, `BLOG_EN_SLUG_RE` |
| Rule P (blog IT) | ✅ Duplicato, **Astro è più corretto** | Il Worker ha un bug proprio (`/blog/en` → `/it/en/` invece di `/en/`); `middleware.ts` lo gestisce già correttamente. Nessun rischio per B, anzi un micro-miglioramento |
| **Rule E** (`/page/N/` → archivio) | ❌ **Gap** | Nessun equivalente in Astro |
| **Rule I** (`/project_category/*` → archivio) | ❌ **Gap parziale** | `PROJECT_ANY_RE` copre solo `/project/`, non `/project_category/` |
| **Rule J** (`/author/slug/` → `/it/autori/slug/`) | ❌ **Gap** | Solo un caso hardcoded (`/author/nanni/`) nel JSON legacy, non una regola generale |
| **Rule M** (`/archivio/oel-N|ins-N/` senza `/it/`) | ❌ **Gap** | Nessuna copertura |
| **Rule N** (`/autori/slug/` senza `/it/`) | ❌ **Gap** | `astro.config.mjs` copre solo la radice bare `/autori` → `/it/autori`, non i singoli slug |
| **Rule Q** (`/categoria/slug/` senza `/it/`) | ❌ **Gap** | Stesso problema di Rule N, solo la radice è coperta |
| **Rule Q0** (`/categoria/catechesi` bare) | ❌ **Gap** | `ARCHIVIO_REDIRECTS` copre solo la variante `/it/categoria/catechesi` |
| **Rule R (trailing slash `/it/*`, `/en/*` → +`/`)** | ❌ **Gap**, già noto | Portabile con `trailingSlash: 'always'` nativo di Astro (`astro.config.mjs`) — probabilmente più pulito di riscriverla a mano nel middleware |
| **Proxy WordPress legacy** → Aruba `89.46.105.36` | ✅ **Già ritirato** (non più nel Worker) | Rimosso interamente il 2026-07-27 (commit `a69b441f`), su dati reali e decisione esplicita — vedi `bug_ux_ui.md` "Segnalazioni 2026-07-27". Non è più un punto della migrazione B |
| Header `X-Internal-Proxy-Auth` / `X-Forwarded-Host` / secret sync | 🗑️ Da eliminare con B | Causa dei 3 incidenti di luglio (Appendice A2) — con B non serve più: niente Worker, niente secret da sincronizzare tra due sistemi |

**Conclusione Fase 0:** il Worker **non è ancora ritirabile** senza portare in Astro le 7 regole mancanti (E, I, J, M, N, Q, Q0) + il fallback Unicode sulla lookup table + Rule R. Nessuna di queste è complessa singolarmente (redirect statici/regex semplici), ma vanno tutte scritte e verificate prima di considerare chiusa la Fase 1.

### Fase 0 — Audit (0 rischio, nessuna modifica in produzione) — ✅ COMPLETATA 2026-08-10

1. ~~Misurare traffico reale sui path WordPress legacy~~ — **già fatto il 2026-07-27**, prima ancora che questo audit iniziasse: proxy Aruba misurato e ritirato su decisione esplicita (vedi tabella sopra e `bug_ux_ui.md`). Nessuna azione residua.
2. ~~Diff riga-per-riga di ogni regola del Worker~~ — **fatto**, esito nella tabella "Piano operativo" sopra e in Appendice A8: 7 gap reali + 1 fallback Unicode mancante, oltre a Rule R già nota.
3. ~~Verificare se `*.pages.dev` resta raggiungibile con custom domain attivo~~ — **confermato sulla doc ufficiale Cloudflare**: sì, resta raggiungibile in parallelo. La doc stessa indica Access o Bulk Redirect come gli strumenti per disattivarlo — conferma che la Fase 3 resta necessaria dopo B.
4. ~~Redirect da altri sistemi non documentati che dipendono dal Worker~~ — nessuna dipendenza nascosta trovata. Nota a margine: `WORKING.md` righe 118-127 ("catena attuale") è stale, mostra ancora il ramo proxy-Aruba come attivo — da correggere in una sessione di manutenzione documentazione, non blocca nulla.

### Fase 1 — Porting (su branch, build locale + `wrangler pages dev`, zero deploy) — non ancora iniziata

Task concreti emersi dall'audit Fase 0, tutti redirect statici o regex semplici:
1. Aggiungere `trailingSlash: 'always'` (o equivalente) in `astro.config.mjs` per Rule R — verificare che non rompa route con query string o file statici (`.xml`, asset).
2. Portare Rule E (`/page/N/` → `/it/archivio/`), Rule M (`/archivio/oel-N|ins-N/` → `+/it`), Rule N (`/autori/slug/` → `+/it`), Rule Q (`/categoria/slug/` → `+/it`), Rule Q0 (`/categoria/catechesi` bare → spiritualità) in `middleware.ts` o `astro.config.mjs` a seconda del pattern (statico vs regex).
3. Estendere Rule J (`/author/slug/` → `/it/autori/slug/`) da caso singolo hardcoded a regola generale.
4. Estendere `PROJECT_ANY_RE` (Rule I) per coprire anche `/project_category/*`, non solo `/project/`.
5. Aggiungere fallback su path decodificato nel lookup `REDIRECTS[path]` di `middleware.ts` (come già fa il Worker: `REDIRECTS[path] || REDIRECTS[decodedPath]`), per le 2 chiavi Unicode nella lookup table.
6. Smoke test completo su preview deployment (branch) contro un campione ampio di URL storici, incluse tutte le regole appena portate (usare `scripts/verify-redirects.mjs` esteso a coprire anche i pattern regex, non solo la lookup table).

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

## A7-bis. Proxy WordPress legacy — ritiro (2026-07-27, per completezza cronologica)

Contestualmente all'audit del Worker del 27/7 (Appendice A4/tabella "Piano operativo"), è stato anche misurato e ritirato il proxy verso il WordPress live su Aruba (`89.46.105.36`) che il Worker usava per `/wp-admin`, `/wp-content`, `/wp-includes`, `/wp-json`, `/feed`, `wp-login.php`, `wp-cron.php`, `xmlrpc.php`. Traffico reale 7gg campionato: centinaia di hit scanner/bot (rimossi senza perdita), 838 hit/settimana su 86 immagini storiche `wp-content/uploads/*` e 944 hit/settimana su `wp-json/oembed` (probabile anteprima link esterni) — su questi due, decisione esplicita dell'utente di accettare la rottura (404) piuttosto che mantenere un WordPress pubblico vivo solo per servirli. Deploy `879f73cc`, smoke test post-deploy pulito. Dettaglio completo in `bug_ux_ui.md`, sezione "Segnalazioni 2026-07-27". Non più un punto aperto della migrazione B→A.

## A8. Confronto regola-per-regola Worker vs Astro (audit Fase 0, 2026-08-10)

Eseguito per verificare l'assunzione (mai testata rigorosamente prima) che le regole del Worker fossero "quasi tutte già duplicate" in Astro. Confronto pattern-per-pattern (stesso input → stesso output), non solo per nome/commento.

**Duplicate e verificate equivalenti:** Rule B (data), F/F2 (anno-slug IT/EN), G (numero corto), H (project-numero), K (diario), L (insieme), O (blog EN).

**Duplicata con comportamento migliore in Astro:** Rule P (blog IT) — il Worker ha un bug proprio (`/blog/en` → `/it/en/` invece di `/en/`); Astro lo gestisce già correttamente.

**Gap reali (nessun equivalente in Astro):**
- Rule E: `/page/N/` → archivio
- Rule I: `/project_category/*` → archivio (coperto solo `/project/`, non la variante `_category`)
- Rule J: `/author/slug/` → `/it/autori/slug/` (solo un caso hardcoded esiste, non una regola generale)
- Rule M: `/archivio/oel-N|ins-N/` senza prefisso `/it/`
- Rule N: `/autori/slug/` senza prefisso `/it/` (solo la radice bare è coperta)
- Rule Q: `/categoria/slug/` senza prefisso `/it/` (solo la radice bare è coperta)
- Rule Q0: `/categoria/catechesi` bare (coperta solo la variante `/it/categoria/catechesi`)
- Rule R: trailing slash (già nota da prima di questo audit)

**Gap parziale sulla lookup table:** `middleware.ts` fa `REDIRECTS[path]` senza fallback su path decodificato; il Worker fa `REDIRECTS[path] || REDIRECTS[decodedPath]`. Impatto: le 2 chiavi Unicode nel JSON legacy (es. `/メリークリスマス/`) non matchano in Astro perché `url.pathname` arriva percent-encoded — 404 invece di 301 per quei 2 URL specifici.

Verificato che il file del Worker non contiene altri redirect hardcoded dopo Rule R: l'ultima istruzione è `return forwardToPages(request, env)`.

**Lezione:** l'audit del 27/7 (Appendice A4) aveva concluso "quasi tutto già duplicato" basandosi su un controllo per nome/commento, non su un confronto pattern-per-pattern degli input reali — esattamente il tipo di verifica ottimistica-non-testata che ha causato i 3 incidenti di luglio (Appendice A2). Il piano operativo in cima a questo documento è stato corretto di conseguenza.

## A7. Note tecniche — API Cloudflare per prossime sessioni

- Liste: `GET/POST/DELETE /accounts/{account_id}/rules/lists`, item: `.../rules/lists/{list_id}/items` (async, creazione item ritorna `operation_id`, va ripollato)
- Regole redirect account-level: **`POST /accounts/{account_id}/rulesets`** (creazione, `kind:"root"`, `phase:"http_request_redirect"`) o **`PUT /accounts/{account_id}/rulesets/{ruleset_id}`** (aggiornamento) — **non** `PUT .../rulesets/phases/http_request_redirect/entrypoint` (endpoint che non funziona per questo caso, ha fatto perdere tempo in questa sessione)
- Permesso token dashboard per gestire le regole: **"Bulk URL Redirects"** (cercare "redi" nel dropdown Account) — le liste da sole bastano con **"Account Filter Lists"** (cercare "list"); "Account Rulesets" non è sufficiente per l'endpoint account-level `http_request_redirect`
- Token usato: `CF_ZONE_TOKEN` / "OEL Audit & Cache" in Cloudflare dashboard, esteso in questa sessione con questi permessi account-level
