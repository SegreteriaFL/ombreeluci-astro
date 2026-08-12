# Decisione — deindicizzazione ombreeluci-staging.pages.dev

## DECISIONE ATTUALE — 2026-08-12

1. **Fase 2 (cutover) completata il 2026-08-12.** Il Worker `ombreeluci-redirects` è disattivato (Route cancellata, script non eliminato — ricreabile in pochi secondi come rollback). `ombreeluci.it` e `www.ombreeluci.it` sono ora custom domain **attivi** su Cloudflare Pages, diretti, senza intermediario. Dettaglio completo in Appendice A9.
2. **Il problema originale (indicizzazione `pages.dev`) NON è ancora risolto** — la Fase 2 era il prerequisito architetturale, non la soluzione. `ombreeluci-staging.pages.dev` resta pubblicamente raggiugibile e indicizzabile esattamente come prima. La soluzione resta la Fase 3 (Cloudflare Access), non ancora iniziata.
3. **Stabilizzare almeno una settimana** (fino al 2026-08-19) prima di iniziare la Fase 3 — osservazione passiva, non blocca altro lavoro nel frattempo.
4. **Tre debiti tecnici aperti dal cutover, non bloccanti, da riprendere con calma** (dettaglio Appendice A9): (a) 3 delle 7 regole di redirect bare-path portate in Fase 1 (`/categoria/*`, `/archivio/oel-N/` senza `/it/`, `/page/N/`) danno 404 sull'edge reale nonostante la simulazione locale le avesse validate al 100% — causa non ancora identificata, log diagnostico già preparato (non deployato); (b) **non è un problema di cache** come inizialmente diagnosticato — è un bug di logica nel Flow Directus "Rebuild CF Pages on Publish": la condizione `$trigger.payload.stato _eq "published"` scatta solo se il campo `stato` è incluso in quello specifico salvataggio, quindi una modifica a un articolo già pubblicato (titolo, foto, categoria) **non triggera alcun rebuild** — le pagine statiche (categoria, home, autori, archivio) restano con lo snapshot vecchio fino al rebuild notturno delle 02:00 UTC, potenzialmente fino a 24h, non 1h. Nessuna soluzione di cache/purge risolve questo, serve intervenire sulla condizione del Flow (decisione di design con trade-off reale, vedi Appendice A9); (c) il custom domain Pages per `www.ombreeluci.it` non è mai arrivato allo stato `active` pulito (bloccato in `"error"` generico Cloudflare) — mitigato da una redirect rule di zona indipendente e verificata funzionante, ma la causa dell'errore non è stata accertata. Non riscoprire da zero in una sessione futura pensando sia un problema nuovo.
5. Non intervenire sul `middleware.ts` per l'indicizzazione `pages.dev` finché non si arriva alla Fase 3 — nessuna mitigazione intermedia necessaria, il fix noindex (`d73617a7`) resta comunque attivo.
6. Quando si arriva alla Fase 3: **Cloudflare Access**, non Bulk Redirects (non supporta destinazioni dinamiche a livello account, richiederebbe una lista manuale di migliaia di URL — dettagli Appendice A6). Verificare prima l'interazione con lo scenario di rollback del Worker (se mai riattivato dopo che Access è live, vedi nota storica in Appendice A3).

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
| **Proxy WordPress legacy** → Aruba `89.46.105.36` | ✅ **Già ritirato** (non più nel Worker) | Rimosso interamente il 2026-07-27 (commit `a69b441f`), su dati reali e decisione esplicita — vedi `STATO.md` § [BUG] Segnalazioni 2026-07-27. Non è più un punto della migrazione B |
| Header `X-Internal-Proxy-Auth` / `X-Forwarded-Host` / secret sync | 🗑️ Da eliminare con B | Causa dei 3 incidenti di luglio (Appendice A2) — con B non serve più: niente Worker, niente secret da sincronizzare tra due sistemi |

**Conclusione Fase 0:** il Worker **non è ancora ritirabile** senza portare in Astro le 7 regole mancanti (E, I, J, M, N, Q, Q0) + il fallback Unicode sulla lookup table + Rule R. Nessuna di queste è complessa singolarmente (redirect statici/regex semplici), ma vanno tutte scritte e verificate prima di considerare chiusa la Fase 1.

### Fase 0 — Audit (0 rischio, nessuna modifica in produzione) — ✅ COMPLETATA 2026-08-10

1. ~~Misurare traffico reale sui path WordPress legacy~~ — **già fatto il 2026-07-27**, prima ancora che questo audit iniziasse: proxy Aruba misurato e ritirato su decisione esplicita (vedi tabella sopra e `STATO.md` § [BUG] Segnalazioni 2026-07-27). Nessuna azione residua.
2. ~~Diff riga-per-riga di ogni regola del Worker~~ — **fatto**, esito nella tabella "Piano operativo" sopra e in Appendice A8: 7 gap reali + 1 fallback Unicode mancante, oltre a Rule R già nota.
3. ~~Verificare se `*.pages.dev` resta raggiungibile con custom domain attivo~~ — **confermato sulla doc ufficiale Cloudflare**: sì, resta raggiungibile in parallelo. La doc stessa indica Access o Bulk Redirect come gli strumenti per disattivarlo — conferma che la Fase 3 resta necessaria dopo B.
4. ~~Redirect da altri sistemi non documentati che dipendono dal Worker~~ — nessuna dipendenza nascosta trovata. Nota a margine: `WORKING.md` righe 118-127 ("catena attuale") è stale, mostra ancora il ramo proxy-Aruba come attivo — da correggere in una sessione di manutenzione documentazione, non blocca nulla.

### Fase 1 — Porting — ✅ COMPLETATA 2026-08-10 (branch, non ancora in produzione attiva)

Tutte le 7 regole mancanti + fallback Unicode portate in `src/middleware.ts` in un unico commit (revertibile con un solo `git revert`). Rule R implementata come check esplicito nel middleware (stessa logica esatta del Worker), non con l'opzione nativa `trailingSlash` di Astro — comportamento non verificato per route dinamiche/nested, replicare 1:1 è più sicuro che fidarsi di una funzione diversa.

**Verifica in 3 livelli, dato che il testing HTTP end-to-end via preview `pages.dev` si è rivelato inaffidabile per un motivo strutturale (vedi sotto):**
1. **Simulazione pura in Node** con la stessa identica logica regex/lookup, contro 19 casi reali (non sintetici): i 2 URL Unicode byte-per-byte dal JSON, l'autore `pierfrancesco-de-paolis` (reale), il numero `oel-38` (reale), la categoria `famiglia` (slug reale da `categorie.json`), la precedenza Q0→Q. **19/19 passati.**
2. **Build locale** (`npm run build`) pulita, nessun errore TypeScript.
3. **Test HTTP reale** tentato prima in locale (`wrangler pages dev`), poi su una preview Cloudflare isolata (`wrangler pages deploy dist --branch=test-fase1-redirect-audit`, deployment temporaneo scollegato da git, non toccato main): entrambi hanno dato 404 per i path bare appena portati. **Causa identificata, non un bug nel codice**: il middleware ha un gate preesistente (non toccato da questa Fase 1) che confronta `url.hostname` con `ombreeluci.it`/`www.ombreeluci.it` — su un URL `*.pages.dev` questo è sempre falso, quindi la richiesta esce subito con solo l'header noindex, senza mai raggiungere la logica di redirect sottostante. Confermato spoofando l'header `Host: ombreeluci.it`: in locale Miniflare lo accetta (falso positivo, non rappresentativo), sull'edge reale Cloudflare lo rifiuta con 403 (mismatch host/SNI, comportamento di sicurezza corretto). Prova decisiva: su `/categoria/famiglia/` richiesto con l'hostname reale `pages.dev` (nessuno spoofing), l'header `X-Robots-Tag: noindex` **è presente** — cioè il middleware **viene invocato** anche per i path bare sull'edge reale (a differenza del simulatore locale, che si è rivelato inaffidabile su questo aspetto specifico). Il gate host, non un difetto di routing, è l'unica ragione per cui il redirect finale non è verificabile via preview.
4. **Perché è sicuro comunque**: oggi in produzione il Worker (`ombreeluci-redirects`) intercetta questi stessi path bare (`/categoria/*`, `/autori/*`, `/page/*`, ecc.) **prima** che la richiesta arrivi ad Astro/Pages — le nuove regole in `middleware.ts` sono quindi dormienti finché il Worker resta davanti al traffico. Diventano attive solo dopo la Fase 2 (cutover). Il merge in `main` di questo porting non cambia alcun comportamento visibile oggi.

**Nota per Fase 2:** una verifica HTTP end-to-end sui target di redirect reali sarà possibile solo con hostname `ombreeluci.it` vero — o subito dopo il cutover (con rollback pronto), o disattivando temporaneamente il gate host in una sessione di test dedicata, mai tramite preview `pages.dev`.

### Fase 2 — Cutover DNS — ✅ COMPLETATA 2026-08-12 (dettaglio esecuzione in Appendice A9)

**Verificato il 2026-08-10 (API Cloudflare + dashboard), cambia la sequenza rispetto a una generica "attiva il custom domain":**
- Il record DNS apex `ombreeluci.it` (A, proxied) punta ancora letteralmente a `89.46.105.36` — l'IP Aruba del vecchio WordPress, la stessa costante `ARUBA_IP` scritta nel codice del Worker. Il sito funziona solo perché la Route del Worker intercetta il 100% del traffico prima che possa raggiungere quell'IP (incidente reale già accaduto il 3/4/2026 per questo esatto motivo — rimossa la route senza aver mappato la catena DNS, sito ha mostrato WordPress per ore, vedi `WORKING.md`).
- Il custom domain Pages **esiste già** per entrambi `ombreeluci.it` e `www.ombreeluci.it` (creati 2026-04-01, verificati via `GET /accounts/{id}/pages/projects/ombreeluci-staging/domains`) ma **status `"deactivated"`** per entrambi. Non è "attivare da zero", è **riattivare** un'associazione dormiente.

**Sequenza corretta (l'ordine conta, mai al contrario):**
1. **Riattivare i due custom domain deactivated** su Pages (dashboard progetto → Custom domains, o API) e verificare che lo stato torni `"active"` per entrambi. Il metodo di validazione salvato è `http` — se Cloudflare richiede una nuova validazione dopo mesi di inattività, va risolta qui, prima di toccare il Worker.
2. **Verificare che Pages serva correttamente `ombreeluci.it`** con il Worker ancora attivo in parallelo (i due meccanismi possono coesistere; la Route del Worker vince comunque su tutto, quindi riattivare i custom domain a questo punto è a rischio zero — non cambia nulla di visibile finché la Route resta attiva).
3. **Solo a questo punto**, disattivare (non eliminare) la Route del Worker su `ombreeluci.it/*` — tenerla pronta per una riattivazione immediata come rollback.
4. Procedura per il resto ricalcata sul cutover del 21/5 (`STATO.md`): finestra a basso traffico, monitoraggio attivo CF Analytics + UptimeRobot durante e dopo.
5. Criterio di rollback esplicito e scritto **prima** di iniziare (es. "se error rate >1% per >5 minuti, riattiva la Route del Worker").

**Perché l'ordine 1→3 e non il contrario:** se si disattiva la Route del Worker prima di aver confermato che il custom domain Pages è di nuovo `active`, si riapre esattamente la finestra dell'incidente del 3/4/2026 — nessun meccanismo servirebbe più `ombreeluci.it`, e il traffico cadrebbe sul record DNS letterale, cioè sul WordPress morto su Aruba.

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

Contestualmente all'audit del Worker del 27/7 (Appendice A4/tabella "Piano operativo"), è stato anche misurato e ritirato il proxy verso il WordPress live su Aruba (`89.46.105.36`) che il Worker usava per `/wp-admin`, `/wp-content`, `/wp-includes`, `/wp-json`, `/feed`, `wp-login.php`, `wp-cron.php`, `xmlrpc.php`. Traffico reale 7gg campionato: centinaia di hit scanner/bot (rimossi senza perdita), 838 hit/settimana su 86 immagini storiche `wp-content/uploads/*` e 944 hit/settimana su `wp-json/oembed` (probabile anteprima link esterni) — su questi due, decisione esplicita dell'utente di accettare la rottura (404) piuttosto che mantenere un WordPress pubblico vivo solo per servirli. Deploy `879f73cc`, smoke test post-deploy pulito. Dettaglio completo in `STATO.md` § [BUG] Segnalazioni 2026-07-27. Non più un punto aperto della migrazione B→A.

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

## A9. Esecuzione Fase 2 — cutover del 2026-08-12, racconto completo

Non è stato un semplice "clic per riattivare" come previsto — sono emersi 3 imprevisti reali, tutti risolti, nessuno ha richiesto il rollback.

**Imprevisto 1 — i custom domain non si riattivavano.** Il retry di validazione (`PATCH .../domains/{domain}`) continuava a dare `"error_message": "CNAME record not set"`. Causa reale: il record DNS apex `ombreeluci.it` era un record **A** (`89.46.105.36`, IP Aruba) e non un CNAME verso `ombreeluci-staging.pages.dev` — nonostante il custom domain fosse "associato" al progetto Pages dal 2026-04-01, il DNS sottostante non era mai stato allineato. Fix: cambiato il tipo di record da A a CNAME (supportato su apex via CNAME flattening, nativo Cloudflare). Primo tentativo bloccato da un secondo problema (sotto); risolto quello, la modifica ha funzionato e — dopo un retry aggiuntivo (il check di validazione non è istantaneo, richiede un paio di minuti) — l'apex è passato ad `active`.

**Imprevisto 2 — conflitto con un record AAAA residuo.** Sia `ombreeluci.it` sia `www.ombreeluci.it` avevano anche un record AAAA (`2a00:6d40:4:3::c217:36`, non l'IP Aruba — origine non indagata, irrilevante) sullo stesso nome. DNS non permette CNAME e A/AAAA coesistenti sullo stesso nome (RFC, non un capriccio Cloudflare) — Cloudflare ha rifiutato il salvataggio con errore esplicito ("An A, AAAA, or CNAME record with that host already exists"). Fix: cancellato l'AAAA prima di convertire il record A in CNAME, per entrambi apex e www. Verificato via export zona BIND completo (richiesto all'utente) che il resto della zona (mail, mx, pop3, smtp, tunnel CMS, SPF/DMARC) non è stato toccato.

**Imprevisto 3 — `www.ombreeluci.it` non è mai arrivato ad `active`.** Dopo la stessa correzione (AAAA cancellato, A→CNAME), il custom domain per www è rimasto bloccato in stato `"error"` con messaggio generico `"Verification is in undefined status"` (validation: active, verification: error — stato incoerente tra i due sub-check). Due retry non hanno risolto. **Non bloccante**: verificato con una richiesta HTTP reale che `www.ombreeluci.it` **reindirizza correttamente** (301) verso l'apex tramite una Redirect Rule di zona già esistente dal cutover di maggio, indipendente sia dal Worker sia dallo stato del custom domain Pages — nessun utente reale arriva mai a dover essere servito da Pages su www. Lasciato così, non più investigato (rientra nel principio "non impilare correzioni non necessarie durante un cutover attivo").

**Sequenza di esecuzione effettiva** (confermato ogni passo prima del successivo): riattivazione custom domain (con i 2 imprevisti sopra) → conferma apex `active` → conferma redirect www funzionante → **conferma esplicita dell'utente** → disattivata la Route del Worker (cancellata, non "disabilitata" — Cloudflare non ha un flag disable per le Route, il rollback è ricrearla, comando tenuto pronto) → smoke test immediato.

**Smoke test immediato — esito:** tutti i check critici passati con contenuto verificato fresco (non cache): home, home EN, articolo IT, archivio, `/api/health`, redirect legacy da tabella, redirect www→apex. **Due anomalie non critiche trovate e classificate, non richiedono rollback:**

1. **3 delle 7 regole bare-path di Fase 1 danno 404 sull'edge reale** (`/categoria/famiglia/`, `/archivio/oel-38/`, `/page/3/` testati, tutti 404) nonostante la simulazione pura Node avesse dato 19/19 e il deploy in produzione fosse confermato essere l'ultimo commit (`a00b21f3`, verificato via API). Confermato con cache-bust che non è un problema di cache (`cf-cache-status: MISS`, 404 comunque). Causa non identificata — sospetto lo stesso tipo di discrepanza locale-vs-edge già vista nei test di Fase 1 (Appendice A8 nota su `_routes.json`), ma stavolta sul dominio custom di produzione, non sulla preview `pages.dev` dove il test equivalente aveva invece funzionato. **Da investigare in sessione dedicata**, probabilmente con un log diagnostico temporaneo come già fatto per il bug `[object Object]` di agosto. Impatto reale: basso — sono redirect di URL WordPress legacy senza `/it/`, nessun link interno del sito li usa.
2. **Cache Rule di zona "HTML e JSON su ombreeluci.it — cache edge 1h" si è attivata per la prima volta** (era inerte, bypassata dal Worker prima di oggi). **Diagnosi iniziale sbagliata, corretta il 2026-08-13**: il primo sospetto — "la cache non viene purgata abbastanza" — non è la causa reale. Le pagine categoria/home/autori/archivio sono **statiche, prerenderizzate a build-time** (nessun `export const prerender`/header dinamico, a differenza di `/it/[slug].astro` che è SSR) — purgarne la cache CDN non le rende "più fresche", l'edge andrebbe solo a riprendere lo stesso file statico non cambiato dall'ultimo build. La vera causa, confermata interrogando Directus direttamente (`GET /flows`, `GET /operations`): il Flow **"Rebuild CF Pages on Publish"** (id `4adc7d3b-61f2-442d-b8e3-4ed9ce0c4368`) ha un'operation "Check published" con condizione `$trigger.payload.stato _eq "published"` — controlla se il campo `stato` è incluso in quello specifico salvataggio, non lo stato corrente dell'articolo. **Conseguenza**: modificare un articolo già pubblicato senza toccare il campo `stato` (titolo, foto, categoria) non include `stato` nel payload → condizione falsa → **nessun rebuild**. Le pagine statiche che elencano quell'articolo restano vecchie fino al rebuild notturno (`nightly-build.yml`, cron 02:00 UTC) — potenzialmente **24h, non 1h** come stimato inizialmente. `/api/revalidate` (purge+prewarm della sola pagina articolo, storicamente collegato a un Flow Directus separato) resta valido solo per la pagina SSR del singolo articolo, non tocca questo problema. **Da decidere con attenzione in sessione dedicata** (non un fix ovvio): allargare la condizione del Flow per triggerare anche su modifiche a articoli già pubblicati rischia rebuild ad ogni salvataggio minore (es. correzione di un refuso) — va verificato il rischio di rate limit sui build Cloudflare Pages prima di implementare, oppure si accetta esplicitamente il rebuild notturno come comportamento noto e lo si documenta come tale (non un bug, un trade-off). Nessuna delle due scelte va presa senza discuterla prima.

**Osservazione post-cutover**: nessun alert UptimeRobot ricevuto, nessuna anomalia su CF Analytics nella finestra di monitoraggio immediatamente successiva alla disattivazione della Route.

## A7. Note tecniche — API Cloudflare per prossime sessioni

- Liste: `GET/POST/DELETE /accounts/{account_id}/rules/lists`, item: `.../rules/lists/{list_id}/items` (async, creazione item ritorna `operation_id`, va ripollato)
- Regole redirect account-level: **`POST /accounts/{account_id}/rulesets`** (creazione, `kind:"root"`, `phase:"http_request_redirect"`) o **`PUT /accounts/{account_id}/rulesets/{ruleset_id}`** (aggiornamento) — **non** `PUT .../rulesets/phases/http_request_redirect/entrypoint` (endpoint che non funziona per questo caso, ha fatto perdere tempo in questa sessione)
- Permesso token dashboard per gestire le regole: **"Bulk URL Redirects"** (cercare "redi" nel dropdown Account) — le liste da sole bastano con **"Account Filter Lists"** (cercare "list"); "Account Rulesets" non è sufficiente per l'endpoint account-level `http_request_redirect`
- Token usato: `CF_ZONE_TOKEN` / "OEL Audit & Cache" in Cloudflare dashboard, esteso in questa sessione con questi permessi account-level
