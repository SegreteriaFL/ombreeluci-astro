# Inventario Secret — Ombre e Luci

**Creato:** 2026-08-13, subito dopo l'incidente `DIRECTUS_TOKEN` (rotazione parziale ha rotto le pagine articolo in produzione per ~9 minuti perché il token vive in più posti non sincronizzati — vedi `STATO.md`, sessione 2026-08-13).

**Scopo**: mappa di ogni secret del progetto e di TUTTI i posti dove è configurato — non solo il più comodo da editare. Obiettivo: che una futura rotazione non rompa più nulla per dimenticanza.

**Metodo**: ricognizione via grep sistematico del repo, `gh secret list`, API Cloudflare Pages (env vars Production **e** Preview, controllate separatamente), lettura diretta di `docker-compose.yml` sul VPS, confronto fingerprint chiavi SSH. Ogni cella "dove è configurato" è verificata attivamente in questa sessione — dove non è stato possibile verificare, è scritto esplicitamente "non verificato", mai lasciato vuoto o assunto.

**Questo file NON contiene nessun valore di secret** — solo nomi, permessi dichiarati, e posizioni.

---

## Tabella inventario

| Nome | A cosa serve | Dove è configurato (TUTTI i posti verificati) | Ultima rotazione nota | Chi/cosa lo consuma |
|---|---|---|---|---|
| `DIRECTUS_TOKEN` | Autenticazione richieste server-side a Directus API | (1) VPS: è un token utente Directus, autorità = Directus stesso; (2) `.env` locale Windows; (3) Cloudflare Pages → **Production** env vars; (4) Cloudflare Pages → **Preview** env vars; (5) GitHub Actions secret (`update-snapshot.yml`) | **2026-08-13 — tutti e 5 i posti allineati.** (3) verificato end-to-end (deploy production + curl reale, vedi sopra). (4) aggiornato via API e verificato con un deployment preview di retry (articolo + home 200 su `*.pages.dev`). (5) aggiornato via `gh secret set`, ma **non verificabile end-to-end**: `update-snapshot.yml` fallisce prima di usare il token per un problema indipendente (Bot Fight Mode blocca `cms.ombreeluci.it/server/ping` dai runner GitHub Actions, HTTP 403 — stesso bug già noto sullo smoke-post-deploy). Il valore è comunque corretto (copiato identico dallo stesso `.env` usato per gli altri 4 punti già verificati) | Astro SSR (pagine articolo, ogni render), workflow `update-snapshot.yml` |
| `CF_API_TOKEN_OEL` | Trigger rebuild CF Pages dal Flow Directus "Rebuild CF Pages on Publish" | (1) VPS `docker-compose.yml` (env var Directus, esposta al Flow via `FLOWS_ENV_ALLOW_LIST`) | 2026-08-13 (creato oggi, migrazione da valore inline) | Flow Directus "Rebuild CF Pages on Publish" (nota: il trigger di questo Flow risulta non attivarsi mai — vedi STATO.md, diagnosi separata in coda) |
| `CLOUDFLARE_API_TOKEN` | Gestione Worker Route + Pages deployments da script/Claude Code | (1) `.env` locale. Dashboard CF mostra un token chiamato `CLOUDFLARE_API_TOKEN` (Account.Cloudflare Pages + Zone.Workers Routes, creato oggi) — **corrispondenza nome↔dashboard non confermata al 100%, solo plausibile per timing e scope** | Non nota con certezza — il token dashboard risulta creato oggi (probabile creazione durante l'emergenza Fase 2 di stamattina), ma non è verificato se sia una rotazione o la prima creazione | Script locali/Claude Code per rollback Worker Route, trigger deployment, PATCH env vars Pages |
| `CF_API_TOKEN` (GitHub Actions) | Non determinato | GitHub Actions secret, **nessun riferimento trovato nei workflow attuali** (`.github/workflows/*.yml`) | Non nota | **Nessun consumer trovato — possibile secret orfano da un workflow rimosso. Da investigare, non urgente.** |
| `CF_ZONE_TOKEN` | Audit, cache, WAF a livello di zona | (1) `.env` locale. Probabile corrispondenza dashboard: `OEL Audit & Cache` (Bulk URL Redirects, Account Filter Lists +10, incluso Zone WAF mai usato — permission creep già noto da sessioni precedenti) — **corrispondenza nome non confermata al 100%** | Non nota | Script di audit/cache locali |
| `CF_ANALYTICS_TOKEN` | Query CF Analytics GraphQL | (1) `.env` locale | **Segnalato invalido/probabilmente revocato accidentalmente in una sessione precedente, mai risolto** — workaround: si usa `CF_ZONE_TOKEN` al suo posto | Script di analisi traffico locali (attualmente non funzionante) |
| `CF_DEPLOY_HOOK` | Deploy hook URL per rebuild (meccanismo diverso da token: l'URL stesso è il segreto) | (1) `.env` locale; (2) GitHub Actions secret (`nightly-build.yml`); (3) verosimilmente anche l'URL embedded nel secondo Flow Directus "Rebuild sito su aggiornamento contenuti_statici" (**non confrontato oggi se lo stesso valore — solo struttura dell'operation letta, non il valore**) | Non nota | `nightly-build.yml`, Flow Directus (probabile) |
| `CF_PAGES_TRIGGER_TOKEN` | Non determinato con certezza in questa ricognizione | (1) `.env` locale | Non nota | **Non verificato — scopo esatto e altri eventuali consumer non identificati in questa sessione** |
| `CF_PURGE_TOKEN` | Purge cache CF in `/api/revalidate` | (1) Cloudflare Pages → **Production** env vars. **Assente da Preview** (divergenza) | Non nota | `src/pages/api/revalidate.ts` |
| `CF_ZONE_ID` | ID zona CF (non segreto in senso stretto, ma configurazione) | (1) Cloudflare Pages → Production. **Assente da Preview** | N/A (non è un secret rotabile) | `src/pages/api/revalidate.ts` |
| `POSTGRES_PASSWORD` | Password DB Postgres di Directus | (1) VPS `docker-compose.yml` | 2026-08-13 (ruotata per esposizione via `cat` accidentale) | Container `database` + `directus` sul VPS |
| `SECRET` (Directus) | Firma JWT sessioni/token Directus | (1) VPS `docker-compose.yml` | 2026-08-13 (ruotata per esposizione via `cat` accidentale) | Directus (tutte le sessioni admin/UI) |
| `ADMIN_PASSWORD` (Directus, env) | Bootstrap iniziale password admin — **solo letta al primo avvio su DB vuoto, non più letta dopo** | (1) VPS `docker-compose.yml` — **valore ora vestigiale/fuorviante**: la password admin REALE è stata ruotata oggi via API `PATCH /users/{id}`, ma il valore scritto in `docker-compose.yml` non è stato aggiornato e non corrisponde più alla password reale | 2026-08-13 (password reale ruotata via API; valore in `docker-compose.yml` NON allineato — disallineamento noto e voluto, ma da annotare per non confondere una sessione futura) | Directus, solo al primissimo bootstrap (non più rilevante ora) |
| `ALGOLIA_APPLICATION_ID` / `PUBLIC_ALGOLIA_APP_ID` | ID applicazione Algolia (pubblico per design, non segreto) | `.env` locale + CF Pages Production + CF Pages Preview (tutti allineati) | N/A | Frontend (ricerca client-side), script sync |
| `ALGOLIA_WRITE_API` | Scrittura indice Algolia | `.env` locale + CF Pages **Production**. **Assente da Preview** | Non nota | `src/pages/api/algolia-sync.ts` |
| `ALGOLIA_SYNC_SECRET` | Autenticazione endpoint `/api/algolia-sync` | Solo CF Pages **Production**. **Assente da `.env` locale e da Preview** | Non nota | `src/pages/api/algolia-sync.ts` (chiamante esterno, es. Directus Flow o cron) |
| `ALGOLIA_SEARCH_API` / `ALGOLIA_MONITORING_API_KEY` / `ALGOLIA_USAGE_API_KEY` | Chiavi Algolia per script di monitoraggio locali | Solo `.env` locale | Non nota | Script locali di monitoring (non deployati) |
| `PUBLIC_ALGOLIA_SEARCH_KEY` | Search-only key Algolia (pubblica per design) | `.env` locale + CF Pages Production + Preview (allineati) | N/A | Frontend ricerca client-side |
| `MAILCHIMP_API_KEY` | Iscrizione newsletter | `.env` locale + CF Pages Production + Preview (allineati) | Non nota | `src/pages/api/newsletter.ts` |
| `ANTHROPIC_API_KEY` | Traduzioni/generazione AI (`translate.ts`, `sync-didascalia.ts`) | `.env` locale + CF Pages **Production**. **Assente da Preview** | Non nota | `src/pages/api/translate.ts`, `sync-didascalia.ts` |
| `REVALIDATE_SECRET` | Autenticazione endpoint `/api/revalidate` | Solo CF Pages **Production**. **Assente da `.env` locale e da Preview** | Non nota | `src/pages/api/revalidate.ts` (chiamante esterno, es. Directus Flow) |
| `SYNC_METADATA_SECRET` | Autenticazione endpoint `/api/sync-metadata`, `/api/sync-didascalia`, `/api/translate` | Solo CF Pages **Production**. **Assente da `.env` locale e da Preview** | Non nota | I tre endpoint sopra |
| `INTERNAL_PROXY_AUTH` | Non determinato con precisione in questa ricognizione (nome suggerisce proxy interno) | `.env` locale + CF Pages Production + CF Pages Preview | Non nota | **Non verificato quale endpoint/script lo consuma esattamente** |
| `INTERNAL_PROXY_AUTH_ONLINE` | Variante di sopra, probabilmente per ambiente "online"/produzione distinta | Solo `.env` locale. **Assente da CF Pages Production e Preview** | Non nota | **Non verificato** |
| `KEYSTATIC_GITHUB_CLIENT_ID` / `KEYSTATIC_GITHUB_CLIENT_SECRET` / `KEYSTATIC_SECRET` | Autenticazione OAuth GitHub per il CMS Keystatic | Solo CF Pages **Production** | N/A | **MORTI — `keystatic.config.ts` rimosso in questa stessa sessione (2026-08-13). Da ripulire da CF Pages Production, nessun consumer più esiste.** |
| `PUBLIC_SITE_URL` | URL pubblico del sito (non segreto) | Solo CF Pages Production | N/A | Middleware, canonical URL, sitemap |
| `MEDIA_BASE_URL` (nome con carattere sospetto, possibile tab finale) | Non determinato | Solo CF Pages **Preview**. **Assente da Production e da `.env` locale** | Non nota | **Anomalia da verificare: nome variabile potenzialmente malformato (carattere di whitespace finale visibile nell'export), esiste solo in Preview — verificare se è un refuso o intenzionale prima di toccarla** |
| `DIRECTUS_URL` | URL base API Directus (non segreto, ma configurazione da tenere sincronizzata) | `.env` locale + CF Pages Production + Preview | N/A | Tutti i fetch verso Directus |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | Accesso bucket R2 (`oel-media`) | `.env` locale + `/root/.config/rclone/rclone.conf` sul VPS (per `rclone`) | Non nota — **non verificato se i due valori sono allineati** (RUNBOOK.md nota esplicitamente che vanno aggiornati in entrambi i posti dopo una rotazione) | Script di migrazione/sync foto (`migrate_*_to_r2.py`), `rclone` sul VPS |
| `SSH_DEPLOY_KEY` / `SSH_KNOWN_HOSTS` | Chiave SSH per sync automatico verso il VPS | Solo GitHub Actions secret (`sync-runbook.yml`, `setup-embedding-column.yml`) | Non nota | Workflow che copiano `RUNBOOK.md` sul VPS e il setup one-shot embedding. **Chiave diversa da `claude_oel_key` — non verificato se corrisponde a una delle chiavi in `authorized_keys` sul VPS o se è un'altra ancora** |
| Chiave SSH `claude-oel` (attiva) | Accesso root VPS per Claude Code | Locale: `~/.ssh/claude_oel_key`. VPS: `authorized_keys`, fingerprint `SHA256:FrNuDLZeRPJbwB4xhswYyleHQt1vcOJr/1iQpfrZuLg` | Non nota | Claude Code, sessioni di questo tipo |
| ~~Chiave SSH `claude-oel` (orfana)~~ | — | **RIMOSSA il 2026-08-13** da `authorized_keys` sul VPS (fingerprint `SHA256:fvZmyS8nwZNe3RxNYCEatm45W+jZivfz5f4Ngdk3kZM`) — nessuno ha riconosciuto la chiave, accesso non spiegato. Backup del file pre-rimozione lasciato sul VPS (`~/.ssh/authorized_keys.bak-*`). Accesso con la chiave attiva verificato funzionante dopo la rimozione. | 2026-08-13 (rimossa, non ruotata) | Nessuno — se qualcuno perde l'accesso dopo questa rimozione, è questa la causa: cercare `authorized_keys.bak-*` sul VPS per il ripristino |
| Chiave SSH `claude-oel-2` | Presumibilmente seconda postazione (Mac redazione, vedi `project_setup_secondapostazione`) | Solo VPS `authorized_keys`, fingerprint `SHA256:CVSSbXQ0VG9pLsVVgLvsBD+hgu8eDxkCbOfrZo6+1Vk` — **non verificabile da questa macchina, nessuna chiave privata corrispondente locale (atteso, se è davvero il Mac)** | Sconosciuta | Presumibilmente Mac redazione — **non confermato con certezza in questa sessione** |
| `UPTIMEROBOT_API_KEY` | Query API UptimeRobot | Solo GitHub Actions secret. **Assente da `.env` locale** | Non nota | Workflow non identificato con certezza in questa ricognizione (grep mirato non eseguito) — **non verificato quale workflow lo usa** |
| `SLACK_WEBHOOK_URL` | Notifiche Slack da CI e da UptimeRobot | Referenziato in `nightly-build.yml` e `smoke-post-deploy.yml` (`secrets.SLACK_WEBHOOK_URL`) ma **assente dalla lista reale dei GitHub Actions secrets** (`gh secret list` non lo mostra, nessun environment GitHub configurato che potrebbe nasconderlo) | Sconosciuta | **Probabile: le notifiche Slack da questi due workflow sono silenziosamente no-op da sempre o da quando è stato rimosso.** RUNBOOK.md indica che andrebbe incollato anche come Alert Contact su UptimeRobot — **non verificato se presente lì** |
| Service account GSC (`ombreeluci-seo-1ede0e05d5b6.json`) | Query Search Console API | Solo locale: `.secrets/` (correttamente in `.gitignore`) | Non nota | `scripts/gsc-query.mjs` |
| `OPENAI_API_KEY` | Embedding/clustering offline (`scripts_and_data/scripts/`) | **Non trovato in nessun `.env` del repo** — letto via `os.getenv()`, quindi deve arrivare da variabile d'ambiente di sistema sulla macchina di chi esegue lo script, non tracciata da nessuna parte | Non nota | `interroga_cluster_gpt4_v1.py`, `re_clustering_testo_arricchito.py` (script offline, non deployati) |
| `GITHUB_TOKEN` | Autenticazione automatica GitHub Actions | Auto-generato da GitHub a ogni run, non richiede gestione manuale | N/A (rotazione automatica per design) | `update-snapshot.yml` |
| `CF_ACCOUNT_ID` (GitHub Actions) | Non determinato | GitHub Actions secret, **nessun riferimento trovato nei workflow attuali** | Non nota | **Nessun consumer trovato — possibile secret orfano, stesso caso di `CF_API_TOKEN` sopra** |

---

## Segnalazioni esplicite (Passo 4)

### Secret in più di un posto (rischio rotazione dimenticata — priorità alta)

- **`DIRECTUS_TOKEN`** — 5 posti (VPS/Directus, `.env` locale, CF Pages Production, CF Pages Preview, GitHub Actions). È quello che ha causato l'incidente di oggi. **Preview e GitHub Actions vanno verificati/aggiornati** — non toccati durante il fix di emergenza di oggi (fix limitato a Production per chiudere l'incidente più in fretta).
- **`CF_DEPLOY_HOOK`** — `.env` locale + GitHub Actions + probabilmente il secondo Flow Directus.
- **`R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`** — `.env` locale + VPS (`rclone.conf`), allineamento non verificato.
- **`ALGOLIA_APPLICATION_ID`, `ALGOLIA_WRITE_API`, `PUBLIC_ALGOLIA_APP_ID`, `PUBLIC_ALGOLIA_SEARCH_KEY`, `MAILCHIMP_API_KEY`, `ANTHROPIC_API_KEY`, `INTERNAL_PROXY_AUTH`, `DIRECTUS_URL`** — presenti sia in `.env` locale sia in CF Pages (Production e/o Preview) — stesso pattern strutturale dell'incidente, solo non ancora esploso.

### Permessi più ampi del necessario

- **`CF_ZONE_TOKEN`** (probabile `OEL Audit & Cache`) — include `Zone WAF` mai usato, già annotato come permission creep in sessioni precedenti, non ancora rimosso.
- **Chiavi SSH `authorized_keys`** — due voci entrambe etichettate `claude-oel` con fingerprint diversi (una attiva, una orfana) — l'etichetta duplicata rende facile confondere quale sia quale in un controllo veloce futuro.

### Divergenza Production vs Preview su Cloudflare Pages (silenziosa, può rompere solo gli ambienti di test)

Preview **manca** rispetto a Production: `ALGOLIA_SYNC_SECRET`, `ALGOLIA_WRITE_API`, `ANTHROPIC_API_KEY`, `CF_PURGE_TOKEN`, `CF_ZONE_ID`, `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `PUBLIC_SITE_URL`, `REVALIDATE_SECRET`, `SYNC_METADATA_SECRET`.

Preview **ha in più** rispetto a Production: `MEDIA_BASE_URL` (nome con carattere sospetto — verificare prima di toccare).

Conseguenza pratica: qualunque deploy preview che tocchi traduzioni AI, sync Algolia, revalidate/purge cache, o il vecchio Keystatic fallirà silenziosamente o userà fallback — non necessariamente un problema oggi (Keystatic è morto comunque), ma da tenere a mente se si testano quelle funzionalità su un branch preview.

### Secret senza data di ultima rotazione nota

La maggioranza dei secret elencati non ha una data di rotazione tracciata da nessuna parte (non un problema da risolvere ora — solo un fatto da registrare). Fanno eccezione solo quelli toccati in questa sessione (13/08/2026): `DIRECTUS_TOKEN`, `POSTGRES_PASSWORD`, `SECRET`, `ADMIN_PASSWORD`, `CF_API_TOKEN_OEL`.

### Domanda aperta — secret senza copia di recupero

`ALGOLIA_SYNC_SECRET`, `REVALIDATE_SECRET`, `SYNC_METADATA_SECRET` esistono **solo** su Cloudflare Pages Production — in nessun altro posto, nemmeno `.env` locale. A differenza di `DIRECTUS_TOKEN` (che almeno esisteva altrove, anche se disallineato), se uno di questi viene rigenerato per errore o perso, non c'è nessuna copia da cui recuperarlo. **Non è chiaro se sia una scelta intenzionale** (secret solo-produzione per principio, mai dovrebbero servire in locale) **o un'altra dimenticanza** dello stesso tipo che ha causato l'incidente di oggi. Da chiarire quando c'è tempo — non urgente, ma da tenere a mente prima di rigenerare uno di questi tre senza prima salvarne il valore corrente da qualche parte.

### Secret orfani o non identificati (bassa urgenza, da chiarire quando c'è tempo)

- `CF_API_TOKEN` e `CF_ACCOUNT_ID` su GitHub Actions — nessun workflow attuale li referenzia.
- Chiave SSH `claude-oel` orfana in `authorized_keys` (fingerprint `fvZm...`) — nessuna privata locale corrispondente trovata.
- `SLACK_WEBHOOK_URL` — referenziato nei workflow ma non configurato: le notifiche Slack da CI sono probabilmente no-op silenziosi da tempo indeterminato.
- `CF_PAGES_TRIGGER_TOKEN`, `INTERNAL_PROXY_AUTH` / `INTERNAL_PROXY_AUTH_ONLINE` — scopo esatto e consumer non identificati con certezza in questa ricognizione.

---

## Checklist — prima di considerare chiusa QUALUNQUE rotazione di secret

Da seguire sempre, indipendentemente da quale secret si sta ruotando — scritta per essere seguita anche da una sessione futura senza il contesto di oggi:

1. **Cercare il nome del secret in questo file** (`docs/INVENTARIO-SECRET.md`) prima di ruotare — la riga corrispondente elenca (o dovrebbe elencare) tutti i posti noti.
2. Se il secret non è in questa tabella, **prima di ruotarlo cercarlo con un grep mirato** nel repo (`grep -rn "NOME_SECRET"` escludendo `node_modules`) e controllare `gh secret list` + Cloudflare Pages Production **e** Preview — non assumere che un solo posto basti.
3. Dopo aver ruotato, **aggiornare ESPLICITAMENTE ogni posto elencato**, non solo quello che si stava già editando quando è nata l'esigenza di ruotare.
4. Se il secret è usato dal sito in produzione (Cloudflare Pages), ricordare che **aggiornare la env var non basta**: serve un nuovo deployment perché il valore aggiornato venga effettivamente usato (le env var si "cristallizzano" nel deployment al momento della build, non sono lette live). Innescare un deployment e verificarlo prima di considerare la rotazione conclusa.
5. **Verificare l'esito con una richiesta reale** (non solo "il comando è andato a buon fine") — per un secret usato da pagine SSR, aprire una pagina reale che lo usa; per un secret usato da un Flow/webhook, testarlo con un trigger reale.
6. **Aggiornare questa tabella** con la nuova data di rotazione e correggere qualunque posizione che nel frattempo si è scoperta mancante.
7. Se durante la rotazione si scopre un posto dove il secret vive e che NON era in questa tabella, **aggiungerlo qui subito**, non rimandare — è esattamente il tipo di gap che ha causato l'incidente del 13/08/2026.
