# STATO — Ombre e Luci

**Ultimo aggiornamento:** 2026-08-08

---

## Come leggere questo file (nota di fusione — 2026-08-12)

Questo file **unisce tre log** che nel tempo si erano sovrapposti: la vecchia `STATO.md` (log di sessione principale, cronologia perlopiù inversa), `bug_ux_ui.md` (tracker bug/ticket con marcatori FATTO/APERTO/RISOLTO/`[x]`/`[ ]`) e `docs/SEO-MONITORING-LOG.md` (check settimanale SEO/traffico/uptime). Fusione verificata e finalizzata il 2026-08-12 — i tre file originali sono archiviati in `docs/archive/` (`STATO_pre-merge-2026-08-12_legacy.md`, `bug_ux_ui_legacy.md`, `SEO-MONITORING-LOG_legacy.md`) per riferimento storico, non più la fonte di verità.

Struttura prodotta:

- **Corpo principale** — la cronologia sessioni di `STATO.md`, preservata come backbone senza riscriverne il contenuto già esistente.
- **Sezioni con intestazione `[BUG] Segnalazioni YYYY-MM-DD`** — contenuto portato da `bug_ux_ui.md` per date/lavoro che NON avevano una voce corrispondente in `STATO.md` (tracciate solo come ticket, mai narrate come sessione di sviluppo). Inserite alla posizione cronologica corretta nella timeline. Il caso più rilevante: **le sessioni del 2026-07-27 e 2026-07-28** (rimozione proxy WordPress su Aruba, tre bug indipendenti nella sync Algolia, traduzione De Paolis, foto EN Morlupo, redirect `/en/category/ombre-e-luci/`) esistevano **solo** in `bug_ux_ui.md` — `STATO.md` non aveva nessuna voce per quelle due date, pur avendo sessioni sia prima (24/7) che dopo (7/8).
- **Dove `bug_ux_ui.md` copriva la STESSA data/lavoro già narrato in `STATO.md`** — nessuna voce duplicata creata. Il caso principale è il 2026-08-07 (bug didascalia "Nanda"): la voce `STATO.md` **DIDASCALIA-NANDA** esistente è stata integrata con i dettagli presenti solo nel bug tracker (i tre timestamp di salvataggio 14:38/14:41/14:46, il riferimento a `src/lib/directus.ts:1019`, la nota di rischio sistemico) invece di creare una seconda voce.
- **Backlog** — le sezioni "Da fare"/backlog di `STATO.md` sono preservate dove già esistevano. I bug ancora APERTO nel tracker senza già una riga di backlog corrispondente sono stati aggiunti come nuove righe, marcate `[da bug_ux_ui.md]`. Un caso di stato disallineato tra le fonti è segnalato inline con `[DA REVISIONARE]`.
- **`## Log SEO/Monitoring settimanale`** in fondo al file — contenuto integrale di `docs/SEO-MONITORING-LOG.md`, incollato come blocco unico con la sua cronologia interna invariata. Non interfogliato nella timeline giornaliera: sono check settimanali tabellari/numerici, interfogliarli avrebbe frammentato le tabelle senza guadagno di leggibilità.
- **Appendice finale** — un blocco di testo (credit foto Unsplash) trovato in coda a `bug_ux_ui.md`, senza relazione con nessun bug. Non è stato scartato (zero information loss) ma isolato in un'appendice a parte.

---

## Sessione 2026-08-13 — incidente secret + diagnosi corretta bug rebuild-on-edit

**SICUREZZA — token Cloudflare esposto in chat, ruotato.** Durante l'indagine sul Flow Directus "Rebuild CF Pages on Publish" (vedi sotto), una query di sola lettura ha restituito in chiaro il token Cloudflare (permesso `Pages:Edit`) incorporato nell'operation del Flow. Risposta: (1) rotazione immediata — generato nuovo token con permesso minimo, aggiornata l'operation via API Directus senza far ripassare il nuovo valore dalla chat (letto da `.env` locale, mai incollato); (2) vecchio token revocato da dashboard; (3) controllato audit log account (30gg) e storico deployment del progetto Pages (25 run) per uso anomalo — nessuna anomalia trovata, tutta l'attività spiegabile con sessioni note. Un secondo tentativo di rotazione ha esposto per errore anche un token intermedio (mai arrivato a essere salvato attivo da nessuna parte, probabile screen di conferma Cloudflare non completato) — nessuna azione necessaria, non risultava nella lista token attivi. **Lezione**: per aggiornare credenziali via comando, usare sempre lettura da `.env` locale o `Read-Host` interattivo, mai valori scritti direttamente nel comando che l'assistente fornisce — è successo 2 volte nella stessa sessione prima di essere corretto.

**Diagnosi corretta — non è un problema di cache.** Durante la Fase 2 (cutover Worker→custom domain diretto, vedi `DECISIONE-STAGING.md`) era stato osservato che le pagine categoria/home potevano mostrare contenuto non aggiornato fino a 1h dopo una modifica articolo, attribuito inizialmente a una Cache Rule di zona risvegliata dal cutover. **Causa reale**, trovata interrogando Directus direttamente: il Flow "Rebuild CF Pages on Publish" ha una condizione `$trigger.payload.stato _eq "published"` che controlla il payload del salvataggio, non lo stato corrente — modificare un articolo già pubblicato senza toccare il campo `stato` non triggera alcun rebuild. Le pagine statiche (categoria/home/autori/archivio, prerenderizzate a build-time) restano vecchie fino al rebuild notturno (02:00 UTC) — fino a 24h, non 1h. Dettaglio completo e opzioni di fix in `DECISIONE-STAGING.md` Appendice A9. **Non ancora deciso** se allargare la condizione del Flow (rischio: rebuild ad ogni salvataggio minore, verificare rate limit CF Pages prima) o accettare il rebuild notturno come comportamento noto — decisione da prendere in sessione dedicata, non improvvisata.

**Bug redirect bare-path Fase 1 (`/categoria/*`, `/archivio/oel-N/`, `/page/N/` senza `/it/` → 404 invece di redirect)** — log diagnostico temporaneo scritto in `src/middleware.ts` (non ancora committato/deployato), pronto per isolare la causa in una sessione dedicata.

**Debito tecnico da non riscoprire da zero**: custom domain Pages per `www.ombreeluci.it` bloccato in stato `"error"` generico Cloudflare dal cutover di ieri, causa non accertata, mitigato da una redirect rule di zona indipendente e verificata funzionante — vedi `DECISIONE-STAGING.md` Appendice A9, "Imprevisto 3".

---

## Prossimi passi — stabilità sito e Directus (definiti 2026-08-08, non ancora iniziati)

Elenco prioritizzato, discusso con Fede a fine sessione dell'8/8, coerente con la decisione presa lo stesso giorno ("fixare il fixabile o cambiare CMS", vedi memoria `project_directus_flow_silent_failures`).

**Sito (Astro/Cloudflare):**
1. **Staging Worker → dominio diretto** (piano B→A completo in `DECISIONE-STAGING.md` §6) — intervento a più leva per la stabilità: elimina la classe di bug dei 3 incidenti di produzione di luglio (sync secret Worker↔Pages). Non urgente (zero incidenti attivi), ma è il singolo cambiamento che riduce di più il rischio strutturale nel tempo. Richiede sessione dedicata + finestra di manutenzione, mai incastrato tra altro lavoro.
2. **Articoli post-migrazione mancanti** (memoria `project_articoli_mancanti`) — 404 reali, lavoro meccanico e limitato (dump SQL + confronto slug con Directus), quando c'è mezza giornata libera. **Esempi noti da `bug_ux_ui.md` (fusi qui):** `interpretazioni-disabilita-al-far-east-festival` (WP ID 15769606, maggio 2026), `anche-questanno-partecipero-alla-12-ore-nuotando-con-amore` (WP ID 15769564, maggio 2026). Pattern: probabilmente tutti gli articoli WP con ID > ~15768000. Verifica: `curl -k "https://www.ombreeluci.it/wp-json/wp/v2/posts?per_page=100&orderby=id&order=desc&_fields=id,slug,date&status=publish"` confrontando con Directus.

**Directus (priorità più alta secondo Fede — impatta la redazione ogni giorno):**
1. **Campo errore visibile sulle Flow critiche** (es. `errore_flow` su `articoli`, scritto quando un'operation fallisce — parse error, 401, ecc.) — non ancora implementato, proposto da tempo in `project_directus_flow_silent_failures` come fix di lungo periodo. **Identificato come il prossimo intervento con più leva**: il pattern ricorrente dietro la maggior parte degli incidenti "sembrava salvato ma non lo era" (import JSON, Algolia, sync-didascalia) è sempre lo stesso — Flow che falliscono senza segnalare nulla a chi le ha innescate. Un campo errore visibile trasforma "lo scopriamo tra due settimane" in "errore visibile subito", senza dover fixare ogni singola Flow una alla volta.
2. **Permessi Editor→EN, decidere su `delete`** — oggi bloccato per effetto collaterale della restrizione del 7/8 (vedi [[feedback_it_first_cascade]] aggiornata 8/8): un Editor non può più completare da solo la cancellazione di una coppia di articoli tradotti. Proposto restituire almeno `delete`, mantenendo bloccati `create`/`update`/`read` su righe EN. Non ancora deciso.
3. **Cache/Service Worker admin Directus** — nessun fix tecnico disponibile (limite della loro PWA, non nostro, vedi memoria `project_directus_admin_stale_cache`). Solo mitigazione: abitudine di hard-refresh, non un intervento da pianificare.

---

## [BUG] Segnalazioni 2026-08-11 — Secondo tema mancante nel badge "pubblicati online"

*Portato da `bug_ux_ui.md` — nessuna sessione `STATO.md` per questa data (è la voce più recente del bug tracker, successiva anche all'ultimo aggiornamento datato di `STATO.md`, 2026-08-08).*

### FATTO — Secondo tema (`categoria_menu_2`) mancante nel badge degli articoli "pubblicati online"
**Desiderata:** un articolo con `categoria_menu` e `categoria_menu_2` entrambi valorizzati mostrava un solo tema nel badge sopra il titolo.

**Causa:** il badge ha due varianti: articoli con numero rivista assegnato (`<nav class="article-category-badge">`) e articoli "pubblicati online" senza numero (`<div class="article-category-badge--online">`). TEMA-02 (`7dab7419`, 2026-05-08) aveva aggiunto `categoryDisplay2`/`categoryLink2` solo alla prima variante — la seconda non è mai stata toccata, per una dimenticanza nel commit originale (confermato dal diff: si ferma subito prima del ramo `else`). Nessuna decisione editoriale dietro, verificato in `CLAUDE.md`/`STATO.md`: la spec TEMA-02 descrive il comportamento in modo generico ("il badge mostra max 2 link"), senza distinguere le due varianti.

**Intervento:** aggiunto lo stesso blocco `categoryDisplay2`/`categoryLink2` (separatore ` · `) anche al ramo `--online`, identico pattern già usato nell'altro ramo. File: `src/pages/it/[slug].astro`, `src/pages/en/[slug].astro`.

**DOPO:** verificato live su staging post-deploy (`3d539aff`), 3 casi reali via query Directus:
- IT web-only, 2 temi (`il-mio-ritiro-spirituale-a-morlupo`) → badge mostra "Fede e Luce · Tempo libero" con entrambi i link.
- EN web-only, 2 temi (`august-a-holiday-i-dont-know`) → badge mostra "Leisure · Family" con entrambi i link.
- IT con numero rivista, 2 temi (`ascoltare-i-segni-perche-in-lis`, OEL-142) → nessuna regressione, comportamento invariato.

---

## Sessione 2026-08-08 (continua) — Fase 2 mergiata su main, deployata in produzione, Fase 3 completata

| Area | Descrizione |
|---|---|
| **DIDASCALIE — chiusura indagine preview + merge produzione** | Commit diagnostico `9b92f865` revertato (`18735ed1`, `git revert`, non force-push — storico pulito) dopo che l'indagine (vedi voci precedenti in questa sessione) ha isolato la causa del corpo `[object Object]` come **preesistente e indipendente dal codice Fase 2** — riprodotto identico su un deployment preview con `main` invariato (branch diagnostico `diag/preview-infra-baseline`, non ancora ripulito, da eliminare in altra occasione). **Verifica locale finale** (Miniflare via `wrangler pages dev`, `.dev.vars` temporaneamente patchato con token valido poi ripristinato): tutti i 56 URL con cover + 10 senza cover della baseline Fase 0 → **66/66 match esatto**, zero mismatch, zero errori di stato. **Merge su main**: fast-forward via `git push origin refactor/consolidamento-didascalie-fase2:main` (nessun checkout locale, per non toccare modifiche non committate in corso su altri file) → main a `18735ed1`. **Deploy produzione**: automatico su push, build `9bf697df` success. **Verifica post-deploy su `ombreeluci.it` reale** (body reale, non solo status code): stessi 66/66 URL baseline → match esatto, HTML reale, nessun residuo `[object Object]`. |
| **DIDASCALIE-FASE3 — Flow "Sync didascalia IT→EN" disattivata** | Snapshot completo pre-modifica salvato in `scripts/backups/flow-sync-didascalia-pre-disattivazione-2026-08-08.json`. Flow `6fda6c8a-7c19-4cb1-ba7a-e8e64be64f22` → `PATCH status: inactive` (non delete, reversibile con un click fino a Fase 6). Verificato via GET che lo stato è effettivamente `inactive`. `src/pages/api/sync-didascalia.ts` resta nel repo ma non più raggiungibile (rimozione solo in Fase 6, dopo la finestra di osservazione Fase 5). |
| **DIDASCALIE-FASE4 — Smoke test, CHIUSA** | Eseguiti e chiusi: (1) "Esperienze, i campi dell'estate 1977" IT+EN → corretto; (2) i 6 gruppi di foto condivise → invariati, dentro il campione 66/66; (3) `living-the-essential-not-doing-for-but-living-with` (caso `didascalia_en`) → corretto; (4) campione baseline 56 URL (IT+EN random + casi speciali) → 66/66; (5) articoli senza `immagine_copertina` (10 casi) → placeholder invariato; (8) `cf-cache-status` su 3 URL → header assente (a quel punto della sessione interpretato come "atteso per pagine SSR" — **caratterizzazione poi corretta più avanti nella stessa sessione**, vedi voce CF-CACHE-RULES-INEFFICACI più sotto: l'assenza non è normale, è un problema di piattaforma su tutto il sito, non solo SSR), `cache-control: s-maxage=3600` invariato. **(6) e (7) chiusi senza dover creare contenuto di test sintetico:** (6) verificato dal vivo lo stesso giorno con un caso reale non pianificato — correzione del corpo IT di "don Vito Palmisano" (`ce35d03e-b6c7-437b-8b5d-b4e3d1d1a469`, bug dati non correlato a questo piano, testo di un'altra persona nel campo `corpo`), EN rimasto disallineato finché non è stato ricliccato "Avvia/aggiorna traduzione", poi propagato correttamente — esattamente lo scenario atteso dal punto 6, su un articolo reale. (7) non ripetuto: testa il meccanismo generico create/update del pulsante (`translate.ts`), **non toccato da nessuna fase di questo piano** (Fase 2 ha modificato solo la lettura in `[slug].astro`), già validato end-to-end il 2026-08-04 (commit `4c2199b2`) prima di questa sessione — rifarlo con un articolo fittizio non avrebbe aggiunto informazione specifica sul consolidamento didascalie. **Fase 4 completa, nessuna azione residua.** |
| **DIDASCALIE-FASE5 — Finestra di osservazione, AVVIATA 2026-08-08** | Nessuna azione richiesta: attendere qualche giorno di uso normale della redazione, pronti a riattivare la flow `6fda6c8a` (Fase 3, un click, snapshot già salvato) se emergono segnalazioni. **Fase 6 (cancellazione definitiva `didascalie_img`, rimozione `sync-didascalia.ts`, campo `didascalia_en`) resta esplicitamente non autorizzata finché la finestra di osservazione non è considerata chiusa con esito positivo e non arriva un ok separato.** Fase 7 (documentazione `CONTENUTI.md` + `docs/ROADMAP-AUTOMAZIONE.md`) ancora da fare, non bloccante. |
| **CACHE-RULES-INEFFICACI** (scoperta, non ancora fixata) | Verificato che la Cache Rule HTML/JSON su Cloudflare (ruleset "OEL Cache Rules" id `a1645e425b1d48b6be5c154b702da6f0`, regola `edf9eca073014e22a796bf9a6b1c9716`, creata 20/6, `enabled: true`, espressione corretta) **non ha mai avuto alcun effetto misurabile** — corregge sia `docs/CF-AUDIT-2026-06-21.md` (che la elencava come "fix applicato", vero solo a livello di configurazione, non di effetto reale) sia le entry precedenti del log SEO (che dicevano "mai implementata", falso). Verificato con header live: `cf-cache-status` completamente assente (non "BYPASS") su homepage statica, articoli SSR, produzione via Worker e staging diretto — quindi non è colpa del Worker proxy. Causa più probabile: Cloudflare Pages non si integra in modo affidabile col prodotto Cache Rules di zona (pensato per origin dietro reverse proxy classico), coerente con l'avviso ufficiale Cloudflare che le Cache Rules su un custom domain Pages "possono causare problemi con le Functions". Non è un errore di configurazione da correggere — un fix reale richiederebbe una cache esplicita via Worker (Cache API), non ancora valutato se ne vale lo sforzo su Free tier con questo traffico. Documentato anche in `docs/SEO-MONITORING-LOG.md` (entry 8/8) e memoria `project_gsc_coverage_2026_06`/`reference_infra_best_practices`. |
| **EN-GSC-DIAGNOSI** (chiuso, non un bug) | Investigata la scarsa visibilità EN su Google (azione pendente dal 27/7). Query GSC 30gg (9/7-8/8): **486/3.472 pagine EN (14%) con almeno 1 impressione**, posizioni quasi tutte 5-35, ~10 pagine con più di 1 click nel periodo. Non è indicizzazione bloccata (altrimenti 0% avrebbe impressioni) — è autorità/novità del dominio in una nicchia internazionale già occupata, aggravata probabilmente dal volume di traduzioni AI-bulk (3.400+ articoli) percepite come basso valore aggiunto dai sistemi qualità Google. Non risolvibile tecnicamente, non vale la pena investigare oltre nel breve termine — decisione esplicita di non investire altro tempo qui per ora. |

---

## Sessione 2026-08-08 — Verifica preview Fase 2 didascalie: BLOCCATA, pagine articolo crashano

| Area | Descrizione |
|---|---|
| **DIDASCALIE-FASE2-VERIFICA** (🔴 bloccante, verifica non completata) | Ripresa la verifica del deployment di preview del branch `refactor/consolidamento-didascalie-fase2` (commit `45f76329`), sospesa nella sessione precedente per INCIDENTE-TOKEN-PROD. **Build:** preview `0e1712ee-7763-49d8-8e13-25a87b963f0d` (creato 2026-08-07T23:11, DOPO la correzione del token preview), confermato via API CF Pages sul commit esatto `45f763290f6f6a27ed6cf76e65bbfa9ec38273a7`, tutti gli stage (`queued`→`deploy`) `success`, nessun 401/errore Directus nei log di build. URL: `https://0e1712ee.ombreeluci-staging.pages.dev`. **Verifica contenuti — BLOCCATA:** ogni pagina articolo testata (`/it/[slug]/` e `/en/[slug]/`, sia dalla lista prioritaria del piano — `dialogo-aperto-n-109`, `esperienze-i-campi-dellestate-1977` IT+EN, `open-dialogue-no-109` — sia a campione: `un-motivo-in-ogni-cosa`, `dedicato-ai-bambini-francesco-gammarelli`, `sqizo`) risponde `HTTP 200` con **corpo `[object Object]` (15 byte, `Content-Type: text/html`)** invece dell'HTML della pagina — un crash SSR mascherato da successo, non un 500 esplicito. **Isolamento del problema:** (1) le pagine non-articolo sullo stesso deployment (`/it/chi-siamo/`, `/it/archivio/`, homepage) rispondono con HTML reale e completo (67-206KB), quindi non è un problema generale di Directus/token su questo preview; (2) gli slug realmente inesistenti (`come-tradurre-un-articolo-in-inglese-col-nuovo-cms`, uno slug casuale EN) rispondono correttamente `404` con pagina di errore completa, quindi il routing/param-matching funziona, solo il render della pagina trovata crasha; (3) lo stesso URL articolo su **produzione** (codice pre-Fase 2, es. `ombreeluci.it/it/dialogo-aperto-n-109/`) risponde con HTML reale — il crash non è preesistente, appare associato a questo build. Nessun tentativo di fix, nessun nuovo commit, nessun merge. Verifica didascalie non eseguibile finché questo non è risolto — impossibile confrontare con la baseline (`baseline-captions-2026-08-07.json` / `-nocover-`) perché le pagine non renderizzano contenuto. |
| **DIDASCALIE-FASE2-VERIFICA — Passo 1 (ispezione statica, esito: nulla trovato)** | Riletto riga per riga il diff di `45f76329` sui 3 file. `src/pages/it/[slug].astro` e `src/pages/en/[slug].astro`: grep su `getDidascaliaImg\|didascalia_en\|didascalia_copertina\|heroCaption` in ciascun file → nessun riferimento orfano, la catena è ridotta correttamente a `articolo.didascalia_copertina?.trim() \|\| placeholder`, nessun import residuo. `src/lib/directus.ts`: grep su `getDidascaliaImg\|didascalie_img` → zero occorrenze, rimozione pulita. Grep su tutto `src/` per `getDidascaliaImg` → zero file (nessun altro chiamante, come dichiarato nel commit). **Tipo campo Directus verificato via API** (non a memoria): `GET /fields/articoli/didascalia_copertina` → `type: "text"`, `schema.data_type: "text"`, `is_nullable: true` — coerente con il tipo TS dichiarato (`string \| null` in `directus.ts:199`), non è JSON/richtext, non può tornare un oggetto. **Passo 1 escluso come causa**: il diff è pulito, non ci sono riferimenti orfani, il tipo del campo è quello atteso. |
| **DIDASCALIE-FASE2-VERIFICA — Passo 2 (log runtime Cloudflare, esito: nessuna eccezione)** | `wrangler pages deployment tail 0e1712ee-7763-49d8-8e13-25a87b963f0d --project-name=ombreeluci-staging` connesso con successo (token da `.env`, `CLOUDFLARE_ACCOUNT_ID=6b071de7f55397ada5645e187c932202`). Catturate 3 richieste live verso pagine che restituiscono `[object Object]` (2× `/it/dialogo-aperto-n-109/`, 1× `/en/open-dialogue-no-109/`). **Per tutte e 3, identico pattern:** `"outcome": "ok"`, `"exceptions": []`, `"logs": []`, `"diagnosticsChannelEvents": []`, risposta `status: 200`. **Nessuna eccezione non gestita, nessun `console.error`/`console.log`** (quindi il ramo `.catch()` di `getArticoloBySlug` in `[slug].astro:27-30` non si è attivato — l'articolo è stato trovato, altrimenti sarebbe arrivato al 404 esplicito riga 37). Il Worker Cloudflare considera l'esecuzione riuscita: **non è un crash che il runtime intercetta**, è la pagina stessa che — senza sollevare eccezioni — produce/restituisce un body che si serializza come `[object Object]`. Non è disponibile il body della risposta nel log di `wrangler tail` (non catturato per design), quindi non è stato possibile vedere il valore esatto serializzato. **Causa non identificata a questo punto.** |
| **DIDASCALIE-FASE2-VERIFICA — Checkpoint diagnostici + confronto locale/edge (esito: bug NON nel codice)** | Commit diagnostico separato `9b92f865` (branch `refactor/consolidamento-didascalie-fase2`, **non ancora revertato**, resta lì per la durata dell'indagine): 4 `console.log` (`CP0`-`CP3`) in `src/pages/it/[slug].astro` — fine frontmatter (con `heroCaption` calcolato), inizio template, dopo il blocco didascalia, fine template. **Test locale** (`wrangler pages dev dist` su porta pulita, `.dev.vars` temporaneamente patchato con un `DIRECTUS_TOKEN` valido preso da `.env` — quello di default in `.dev.vars` risultava scaduto/401, poi ripristinato identico all'originale a fine test): risposta `200 OK`, HTML reale (83.881 byte), tutti e 4 i checkpoint attivati in ordine, `heroCaption` = `"Sempre meglio parlarne, no? (foto archivio Ombre e Luci)"` — identico alla baseline Fase 0. **Nessun bug in locale.** **Stesso identico commit ridistribuito su preview reale** (deployment `a1a209c9`, commit `9b92f865`): `wrangler pages deployment tail` mostra gli **stessi 4 checkpoint attivati, stesso `heroCaption` corretto** — il rendering si completa interamente e correttamente anche sull'edge Cloudflare reale. **Eppure il body consegnato al client resta `[object Object]` (200, 15 byte)**, verificato subito dopo la stessa richiesta che ha prodotto i checkpoint. **Conclusione:** il bug non è nella logica applicativa (frontmatter o template) — il render produce l'HTML corretto internamente; qualcosa **dopo** il render, nel layer di consegna della risposta specifico dell'edge Cloudflare reale (non riprodotto da Miniflare/`wrangler pages dev` in locale), sostituisce l'HTML con questa stringa. |
| **DIDASCALIE-FASE2-VERIFICA — Test isolamento variabile: branch senza modifiche (esito: bug preesistente, NON causato dalla Fase 2)** | Su richiesta esplicita, verificato se lo stesso sintomo compare anche su un deployment preview con **codice invariato** (nessun tocco a `[slug].astro`), per isolare "colpa del commit Fase 2" da "problema infrastrutturale generale dell'ambiente preview". Creato branch `diag/preview-infra-baseline` puntato esattamente su `origin/main` (`374eb0b9`, lo stesso commit attualmente in produzione), pushato **senza checkout locale** (`git push origin origin/main:refs/heads/diag/preview-infra-baseline`) per non toccare il working tree del branch Fase 2 (che ha modifiche non committate in corso). Deployment preview risultante: `710aed7f-e3dd-4348-a81c-801fc541f2b5`. **Risultato: stesso identico sintomo.** `/it/un-motivo-in-ogni-cosa/`, `/it/sqizo/`, `/it/dialogo-aperto-n-109/`, `/en/open-dialogue-no-109/`, `/it/esperienze-i-campi-dellestate-1977/` → tutti `200 OK`, corpo `[object Object]` (15 byte) — con codice **identico a quello già in produzione**. Le pagine non-articolo (`/it/archivio/`, 206KB reali) funzionano normalmente, come sul branch Fase 2. Osservato anche un artefatto transitorio non correlato: subito dopo la creazione del deployment, alcune richieste a `/it/dialogo-aperto-n-109/` e `/it/esperienze-i-campi-dellestate-1977/` restituivano un 404 generico (16.140 byte, `lang="en-US" class="min-height-100vh"`, non il nostro `404.astro` reale) — sparito al secondo tentativo, coerente con normale propagazione tra colo edge subito dopo un deploy, non correlato al bug `[object Object]`. **Conclusione: il bug è preesistente e indipendente dalla Fase 2** — è una caratteristica dell'ambiente "preview" di Cloudflare Pages su questo progetto (o del layer di consegna risposta), non introdotta dal commit `45f76329`. La Fase 2 (rimozione `getDidascaliaImg`) non ha responsabilità in questo incidente. **Non testato l'ambiente "production"** (esplicitamente fuori scope, nessun deploy production in questa sessione). Commit diagnostico `9b92f865` e branch `diag/preview-infra-baseline` lasciati intatti, in attesa di decisione su come proseguire l'indagine infrastrutturale. |

---

## Sessione 2026-08-07 — Bug didascalia Nanda (ricorrenza), permessi Editor su righe non-IT

| Area | Descrizione |
|---|---|
| **DIDASCALIA-NANDA** | Stesso bug di `DIDASCALIA-REESPOSTA` (24/7), ricorso: didascalia articolo "Esperienze, i campi dell'estate 1977" mostrava "Manuela"/"paseggiata" invece di "Nanda"/"passeggiata" nonostante 3 salvataggi corretti dalla redazione (verificato nello storico revisioni). **Causa confermata:** `didascalie_img` (collection separata, per file immagine+lingua) ha priorità sul campo `didascalia_copertina` dell'articolo in `it/[slug].astro:244` e `en/[slug].astro:261-264` — invisibile e non raggiungibile dal form articolo. **Fix puntuale:** corretti i due record `didascalie_img` (id 1392 IT, id 3462 EN — anche l'EN aveva "Manuela"). **Fix strutturale pianificato** (non ancora eseguito, piano approvato in `C:\Users\berto\.claude\plans\iridescent-wibbling-plum.md`): consolidare tutto su `didascalia_copertina`, eliminare `didascalie_img`/`didascalia_en`/flow `sync-didascalia`. **Dettagli aggiuntivi da `bug_ux_ui.md` (fusi qui, nessuna voce duplicata creata):** la segnalazione della redazione parlava di "bug di salvataggio" — il salvataggio in realtà **funzionava correttamente**, verificato nello storico revisioni Directus: 3 tentativi salvati regolarmente il 7/8 alle 14:38, 14:41, 14:46, ma il sito continuava a mostrare il testo vecchio perché leggeva da un'altra tabella. Riferimento di codice preciso: `getDidascaliaImg()` in `src/lib/directus.ts:1019`. **Problema sistemico non risolto da questo fix puntuale** (poi effettivamente risolto dal consolidamento Fase 1-5 più sopra in questa stessa giornata): questo bug può ripresentarsi su qualunque altro articolo la cui foto abbia un record in `didascalie_img` — dal form articolo non c'è alcun indizio che la didascalia visibile sul sito venga da un'altra tabella. |
| **PERM-EDITOR-LANG** | Diagnosticato e chiuso: qualunque utente col ruolo **Editor** (Cristina Tersigni, Al Boino, Matteo Cinti — non "Redazione", che non ha utenti reali assegnati) poteva leggere/creare/modificare/cancellare righe `articoli` in **qualsiasi lingua**, incluso EN, nonostante l'unico scrittore legittimo delle righe EN dovrebbe essere il bot di traduzione (`bot@ombreeluci.it`, ruolo Administrator, token statico `DIRECTUS_TOKEN` indipendente da ogni sessione utente — verificato via `/users/me`). Stesso pattern strutturale del bug Nanda (due scrittori sullo stesso concetto, uno invisibile), qui a livello di permessi invece che di dati. **Verifiche di sicurezza chiuse prima di applicare:** (V1) il pulsante "Avvia/aggiorna traduzione" (Flow `1e022c88`) fa una sola chiamata webhook con token di servizio proprio, mai la sessione dell'Editor — restringere la lettura EN non lo tocca, verificato nel grafo della Flow via API, non assunto. (V2) risposta ricevuta: cancellazioni di articoli bilingue capitano (non rare) → delete incluso nella restrizione. **Fix applicato** su policy Editor (`d61b5ea6-d001-4812-857f-6498842fb5a4`), collection `articoli`, un permission id alla volta con test intermedio e snapshot pre-modifica in `scripts/backups/directus-permissions-editor-pre-2026-08-07.json`: `create` (id 12) → `validation:{lang:{_eq:'it'}}`; `update` (id 14) → `permissions:{lang:{_eq:'it'}}`; `read` (id 13) → `permissions:{lang:{_eq:'it'}}`; `delete` (id 15) → `permissions:{lang:{_eq:'it'}}`. Tutti e 4 testati con un account Editor di test dedicato (`editor@ombreeluci.it`, token temporaneo generato e rimosso a fine test): create/update/delete su riga EN → rispettivamente 400/403/403; lista articoli mostra solo `lang=it`; articolo IT tradotto si apre normalmente; anteprima relazionale `articolo_traduzione` degrada a `null` (atteso, non bloccante, decisione B2 opzione (a): campo lasciato visibile così com'è). Nessuna modifica a `translate.ts`/`sync-metadata.ts`. **Esteso lo stesso giorno a Redazione e Redattore** (stessa pipeline, nessun utente reale oggi ma allineamento fatto per coerenza): scoperti due scostamenti verificando gli id reali — nessuna riga `delete` esiste su nessuna delle due policy (azione già negata di default, nessun PATCH necessario), e Redazione aveva già un vincolo `validation` su create (`stato` in draft/review) che è stato preservato con un merge `_and` invece di un overwrite. Tutti i PATCH testati con account UAT dedicati. Dettagli completi in `docs/PERMESSI-RUOLI-REDAZIONALI.md` (rinominato da `PERMESSI-EDITOR.md`). **Task A completo su tutte e tre le policy.** |
| **DIDASCALIE-FASE0** | Fase 0 (backup di sicurezza, sola lettura) del piano di consolidamento didascalie (`C:\Users\berto\.claude\plans\iridescent-wibbling-plum.md`) eseguita dopo la chiusura di Task A: `scripts/backups/didascalie_img-backup-2026-08-07.json` (3941 righe, tutta la collection `didascalie_img`), `scripts/backups/articoli-didascalie-backup-2026-08-07.json` (5877 articoli con `immagine_copertina`), `scripts/backups/baseline-captions-2026-08-07.json` (56 URL con cover: 30 IT + 26 EN, copre tutti i casi speciali del piano — i 6 gruppi di foto condivise, il caso `living-the-essential-not-doing-for-but-living-with` che dipende da `didascalia_en`, più campione random) e `scripts/backups/baseline-captions-nocover-2026-08-07.json` (10 articoli senza cover, per verificare che il placeholder resti invariato). Il piano stimava "~80 URL" in modo approssimativo; la scomposizione dichiarata (6 gruppi + 1 caso speciale + 20 IT random + 20 EN random) somma a ~65, coerente con i 66 (56+10) prodotti — nessuna integrazione necessaria. **Nota su file ridondante:** esiste anche `scripts/backups/baseline-urls-2026-08-07.json` (56 slug, creato ~1m30s prima di `baseline-captions`) — è un elenco di slug di un primo tentativo di campionamento random, con solo 16/56 slug in comune con la lista finale usata in `baseline-captions` (quindi non un semplice duplicato, ma un draft superseduto da un secondo sorteggio random). Non è la baseline da usare in Fase 4: il riferimento per il confronto post-migrazione sono `baseline-captions-2026-08-07.json` + `baseline-captions-nocover-2026-08-07.json`. Tenuto nei backup solo come artefatto del processo, nessuna azione richiesta. |
| **DIDASCALIE-FASE1** | Fase 1 (migrazione dati) eseguita: script `scripts/migrate-didascalie-to-articoli.mjs` (dry-run di default, `--apply` per scrivere). Logica: per ogni articolo con `immagine_copertina`, replica la stessa catena di priorità usata oggi dal rendering (`didascalie_img` → `didascalia_en` solo EN → `didascalia_copertina`) e scrive il valore effettivo dentro `didascalia_copertina`, solo se differisce dal valore attuale. Dry-run (`scripts/backups/migrate-didascalie-dryrun-2026-08-07.log`) verificato contro l'audit del piano prima di procedere: 3941 righe `didascalie_img` e 5877 articoli fetchati (identici alla Fase 0, nessun drift dati nel frattempo), 1902 PATCH necessari (IT: 3 = 2 vuote + 1 diversa; EN: 1899 = 1898 via `didascalie_img` + 1 via `didascalia_en`, il caso speciale `living-the-essential-not-doing-for-but-living-with`), 3 righe orfane in `didascalie_img` (nessun articolo le referenzia, solo loggate). Numeri coincidenti con l'audit originale del piano (IT ~3, EN ~1898 + 1 caso speciale = 1899). Verifica manuale a campione sui casi più delicati prima di applicare: le 3 righe IT (incl. l'unica "diversa", un articolo di test), il caso `living-the-essential`, il gruppo "Dialogo Aperto" EN (`open-dialogue-no-98` correggeva un residuo di testo italiano non tradotto in `didascalia_copertina` con la traduzione EN corretta) — tutti puliti. **Eseguito `--apply`**: 1902 articoli aggiornati, log `scripts/backups/migrate-didascalie-apply-2026-08-07.log` verificato identico riga-per-riga al dry-run (stesso contenuto, stesse 1902 modifiche). **Nessun cambiamento visibile online per ora**: il rendering (`it/[slug].astro`, `en/[slug].astro`) legge ancora `didascalie_img` con priorità su `didascalia_copertina` (Fase 2, non ancora eseguita) — questa fase ha solo allineato il campo di destinazione, che diventerà la fonte effettiva solo dopo la semplificazione del rendering. **Prossimo step:** Fase 2 (rimuovere `getDidascaliaImg` da entrambe le pagine articolo e da `src/lib/directus.ts`), da eseguire solo dopo conferma esplicita. |
| **DIDASCALIE-FASE2** | Codice preparato su branch isolato `refactor/consolidamento-didascalie-fase2` (commit `45f76329`, separato da ogni altra modifica pendente): rimosso `getDidascaliaImg()` da `src/pages/it/[slug].astro`, `src/pages/en/[slug].astro` (anche il fallback `didascalia_en`, ormai ridondante dopo la Fase 1) e da `src/lib/directus.ts` (nessun altro chiamante). Catena ridotta a `didascalia_copertina?.trim() \|\| placeholder`. Typecheck e build locale puliti. **Non ancora mergiato su `main`, non ancora deployato in produzione** — bloccato dall'incidente INCIDENTE-TOKEN-PROD sotto, riparte da qui. |
| **INCIDENTE-TOKEN-PROD** (🔴 grave, autocontenuto, **non correlato a DIDASCALIE-FASE2**) | Durante la preparazione del deploy di preview per la Fase 2, build di preview CF Pages fallita con `401 Unauthorized` da Directus (log: `Error: Directus error 401` in `scripts/build-en-to-it-index.mjs`) — causa: `DIRECTUS_TOKEN` dell'ambiente **preview** su Cloudflare Pages non corrispondeva a nessun token valido locale/produzione (verificato: tre token distinti per i tre ambienti, mai stato un problema fino a una rotazione). L'utente ha ruotato il token su Directus e aggiornato l'ambiente **preview** su CF Pages, ma non (ancora) quello **production** — che usava lo stesso token appena invalidato dalla rotazione. **Effetto:** ogni pagina articolo SSR (`it/[slug].astro`, `en/[slug].astro`) su produzione (`ombreeluci.it`) ha iniziato a rispondere **404** (IT ed EN, confermato anche sull'ultimo deployment noto-buono `a940abb4` di stamattina, quindi non un problema di build/codice) — causa architetturale: `directusFetch()` in `src/lib/directus.ts:265-268` inghiotte silenziosamente qualsiasi errore Directus (incluso 401), ritorna `null`, e la pagina tratta `null` come "articolo non trovato" → 404, senza nessun errore visibile né 500. Solo le pagine statiche (homepage) restavano `200`. **Rilevato per caso** durante il test dell'articolo "Esperienze, i campi dell'estate 1977" sull'URL di preview isolato — non un sintomo della Fase 2, la homepage e le pagine SSG non erano toccate dal branch. **Fix:** (1) utente ha aggiornato anche il `DIRECTUS_TOKEN` dell'ambiente **production** su CF Pages; (2) rilanciato l'ultimo deployment noto-buono `a940abb4` (branch `main`, commit `374eb0b9`) via `POST .../deployments/{id}/retry` — **stesso codice, nessun nuovo commit, nessun nuovo deploy** — per fargli raccogliere il token nuovo; nuovo deployment `b2cdd51e`, successo. (3) Un URL (`dialogo-aperto-n-109`) restava 404 anche dopo il redeploy: causa una risposta 404 cachata a bordo CDN durante la finestra di guasto (`Cache-Control: s-maxage=3600, stale-while-revalidate=86400` — la stessa dinamica già documentata in CACHE-DIAG del 13/7). **Fix:** purge cache completo della zona `ombreeluci.it` (`purge_everything`, via `CF_ZONE_TOKEN`), confermato con l'utente prima di eseguire vista la portata sito-wide. **Verifica finale post-purge:** `dialogo-aperto-n-109`, `esperienze-i-campi-dellestate-1977` (IT+EN), homepage → tutti `200` puliti, senza bisogno di cache-bust. Due URL restano `404` (`come-tradurre-un-articolo-in-inglese-col-nuovo-cms`, `il-nuovo-sito-di-ombre-e-luci`) — verificato su Directus: `stato: draft`, mai stati pubblici, 404 corretto e atteso, non un residuo dell'incidente. **Finestra di esposizione:** dal momento della rotazione token alla fine del redeploy (~pochi minuti nella notte 7→8/8, traffico presumibilmente minimo), rilevato e risolto nella stessa sessione, nessuna segnalazione esterna. **Nota permanente:** i tre ambienti (locale, preview CF Pages, production CF Pages) hanno *tre* `DIRECTUS_TOKEN` indipendenti — una rotazione futura del token Directus va propagata a **tutti e tre**, non solo a quello con cui si sta lavorando in quel momento. Da valutare in altra sessione: rendere `directusFetch()` meno silenzioso su errori di autenticazione (oggi un 401 sitewide è indistinguibile da un articolo davvero inesistente). |

---

## [BUG] Segnalazioni 2026-08-04 (parte 2 — pulizia form articolo)

*Portato da `bug_ux_ui.md` — nessuna sessione `STATO.md` per questa data.*

### FATTO — Campi tecnici nascosti dal form articolo
**Desiderata:** dopo aver introdotto il pulsante "Avvia/aggiorna traduzione", i vecchi campi JSON Export/Traduzione restavano visibili e confondevano; segnalato anche il campo "Embedding" (array di migliaia di numeri) sempre visibile in cima al form, senza alcun senso per la redazione.

**PRIMA:** `json_export`/`json_traduzione` visibili con nota che rimandava al vecchio processo manuale ("Esporta per traduzione"). `embedding` (vettore 3072 dimensioni per il calcolo dei correlati) **non aveva nessuna configurazione Directus** (`meta: null`) — per questo si vedeva l'array grezzo in cima al form, fuori da ogni gruppo.

**Intervento:** `json_export`/`json_traduzione` → `hidden: true` + etichetta "⚠️ OBSOLETO — NON USARE" + nota aggiornata. `embedding` → creata configurazione da zero (non esisteva) con `hidden: true`, `readonly: true`, nota esplicativa. Sweep di controllo su tutti gli altri campi tecnici storici (`umap_x/y/z`, `cluster_id`, `wp_id`, `original_url`, `tema_label`) — già tutti correttamente nascosti da pulizie precedenti, nessun altro orfano trovato.

**DOPO:** verificato via API (`hidden: true` su tutti) e confermato visivamente dall'utente su più articoli diversi.

**⚠️ Nota non risolta — mistero di propagazione:** durante questa modifica, il cambiamento non si è visto per un tempo anomalo anche con test che avrebbero dovuto escluderlo con certezza: browser diverso mai usato prima (Edge "vergine"), cache HTTP disattivata da DevTools, cache interna di Directus svuotata via `/utils/cache/clear`. In ogni test il server, interrogato direttamente e nello stesso momento, restituiva già il dato corretto — eppure l'app admin per un periodo non l'ha mostrato, poi si è sistemato da solo senza un'azione risolutiva chiaramente identificabile. **Non abbiamo una spiegazione definitiva.** Ipotesi più plausibile ma non verificata: storage persistente lato client (IndexedDB/localStorage) usato dalla SPA di Directus per la cache dello schema, non toccato da nessuno dei rimedi provati. Se ricapita, provare da subito: DevTools → Applicazione → Archiviazione → "Cancella dati sito" (non solo Service Worker) prima di altri tentativi. Ulteriore argomento a favore della valutazione Directus↔Sanity già aperta in `MIGRAZIONE-SANITY-BOZZA.md`.

---

## [BUG] Segnalazioni 2026-08-04 — Fase 3 roadmap: traduzione automatica IT→EN

*Portato da `bug_ux_ui.md` — nessuna sessione `STATO.md` per questa data (la sessione 2026-08-07 fa riferimento alla Flow `1e022c88` creata qui, ma senza documentarne la creazione).*

### FATTO — Fase 3 roadmap: traduzione automatica IT→EN
**Desiderata:** eliminare il giro manuale export→traduci esternamente→incolla→spera che il JSON sia valido (causa del bug De Paolis di oggi — vedi blocco `[BUG] Segnalazioni 2026-07-27` più sotto), automatizzando del tutto la creazione della versione EN. Piano già scritto in `docs/ROADMAP-AUTOMAZIONE.md` Fase 3 (mai implementata), trovato su richiesta esplicita di cercare prima di ricostruire da zero.

**PRIMA:** nessuna traduzione automatica del contenuto testuale. Ogni articolo IT pubblicato restava senza EN finché qualcuno non avviava a mano il giro export/traduci/incolla/importa — fragile, come visto oggi con De Paolis.

**Intervento:**
- Nuovo endpoint `src/pages/api/translate.ts` — Claude **Sonnet 5**, output strutturato via JSON Schema nativo (non testo libero da parsare — il costo Sonnet vs Haiku è ~1,5 vs ~0,8 centesimi/articolo, irrilevante, quindi si è scelta la qualità). Crea l'EN **solo se `articolo_traduzione` non è già valorizzato** — non tocca mai una traduzione esistente.
- Nuova Flow Directus "Traduzione automatica EN" (`1e022c88`) — `accountability: activity` fin dalla creazione (non "all"), nessuna condition fragile nel grafo Flow (il filtro lo fa l'endpoint), URL di produzione `ombreeluci.it` non `pages.dev` diretto. Tutte le lezioni della sessione applicate da subito, non aggiunte dopo un incidente.
- Fix a margine: `/en/category/ombre-e-luci/` tornava 404 nonostante il fix di ieri — era propagazione dell'edge Cloudflare a livello di routing (non contenuto), risolto da solo entro un minuto dal deploy. Non un bug del codice. **(Nota di fusione: "il fix di ieri" si riferisce al blocco `[BUG] Segnalazioni 2026-07-28` più sotto — questa riga conferma che quel fix è stato effettivamente deployato e ha funzionato, risolvendo l'ambiguità tra le sezioni RISOLTO/APERTO di quella data.)**

**DOPO — verificato end-to-end con articolo di test reale (creato e poi eliminato):**
- Bozza IT → pubblicazione → EN creato automaticamente in pochi secondi: titolo, sottotitolo, corpo HTML (struttura preservata), categoria/autore/forma copiati correttamente, slug pulito, link bidirezionale `articolo_traduzione` su entrambi i lati. Verificato live (200 su entrambe le pagine).
- Secondo update sull'IT con EN già esistente → **EN non toccato**, verificato leggendo il campo dopo l'update.
- **Scoperta collaterale durante il cleanup:** eliminare un articolo con `articolo_traduzione` collegato fallisce con errore vincolo FK (`articoli_articolo_traduzione_foreign`) finché non si azzera il campo su **entrambi** i lati prima del delete. Utile saperlo per qualunque eliminazione futura di coppie di articoli tradotti.
- **Non implementato (deciso esplicitamente, non dimenticato):** ri-traduzione automatica quando l'IT viene modificato dopo che l'EN esiste già — rischio di sovrascrivere correzioni manuali della redazione. Resta un giro manuale per quel caso.

---

## [BUG] Segnalazioni 2026-07-28

*Portato da `bug_ux_ui.md` — nessuna sessione `STATO.md` per questa data. Vedi anche l'entry SEO-MONITORING-LOG.md del 27/7 che rimanda esplicitamente a "vedi bug_ux_ui.md per dettagli" per questi stessi bug.*

### RISOLTO — /en/category/ombre-e-luci/ 404 invece del redirect
**Desiderata:** "sistema tutto quello che c'è da sistemare... e che puoi sistemare facilmente."

**PRIMA:** `astro.config.mjs` aveva un redirect statico `/en/category/ombre-e-luci/` → `/it/categoria/ombre-e-luci/`, ma la route dinamica `src/pages/en/category/[slug].astro` intercettava il path prima (stesso pattern letterale), e il suo fallback per categorie senza articoli EN reindirizzava genericamente a `/en/` — comportamento osservato in produzione: 404 secco (non ancora chiarito il motivo esatto del 404 invece del 302 atteso a `/en/`, ma irrilevante: il redirect statico non veniva comunque mai raggiunto).

**Intervento:** `src/pages/en/category/[slug].astro` — il fallback per categorie EN senza articoli ora reindirizza a `/it/categoria/${itSlug}/` invece che genericamente a `/en/` (fix generale, vale per qualsiasi categoria futura senza articoli EN, non solo `ombre-e-luci`). Rimossi da `astro.config.mjs` i 2 redirect statici specifici per `ombre-e-luci`, ora ridondanti e mai comunque raggiunti.

**DOPO:** build locale pulita (`npm run build`, nessun errore/warning). **Non ancora deployato** al momento della scrittura — serve commit + push su main per il deploy automatico CF Pages. **Nota di fusione:** confermato deployato e funzionante dal blocco `[BUG] Segnalazioni 2026-08-04` più sopra ("il fix di ieri" — risolto entro un minuto dal deploy, solo propagazione edge).

### VERIFICATO/FIXATO — Altri due webhook Directus con lo stesso pattern di fallimento silenzioso
Seguendo il sospetto lasciato aperto ieri ("probabilmente ha bloccato anche altri webhook").

- **Sync metadati IT→EN** (`bb1e90af`): aveva una condizione `check_it` (`$trigger.payload.lang _null:true`) che bloccava l'esecuzione per qualunque update parziale che non tocca il campo `lang` — cioè quasi ogni edit reale della redazione. L'endpoint (`sync-metadata.ts`) valida già `lang` internamente (riga 53), quindi la condizione era ridondante oltre che rotta. Rewired: trigger → direttamente alla request. **Verificato end-to-end 2 volte** (toggle `in_evidenza` true/false su un articolo reale, propagazione confermata su EN in ~5s).
- **Sync didascalia IT→EN** (`6fda6c8a`): aveva `accountability: "all"` invece di `"activity"` — violazione della regola già documentata in `STATO.md` (sessione 2026-07-01) dopo un incidente identico sul flow di traduzione. Corretto a `"activity"`. Endpoint testato manualmente con secret corretto: funziona (`{"ok":true,"action":"translated",...}`). **Non verificato con certezza end-to-end via trigger reale** — i tentativi di conferma via CF Analytics erano inconcludenti per via del ritardo di aggregazione dei log (diversi minuti, non tempo reale), quindi non ho potuto confermare nella finestra di test se il trigger reale chiama davvero l'endpoint dopo il fix. **Da verificare**: la prossima volta che la redazione modifica una didascalia IT già tradotta, controllare entro 1-2 minuti se la versione EN si aggiorna. **Nota di fusione:** questa stessa Flow `6fda6c8a` è stata disattivata definitivamente l'8/8 nell'ambito del consolidamento didascalie (vedi sessione "2026-08-08 (continua)", riga DIDASCALIE-FASE3) — la verifica end-to-end residua qui non è più rilevante, la Flow non gira più.

### APERTO (al momento della scoperta) — /en/category/ombre-e-luci/ risponde 404 invece del redirect configurato
**Desiderata:** verifica utente su GSC "Pagina con reindirizzamento" (nuovo motivo indicizzazione) → durante la verifica trovato questo bug a margine.

**PRIMA:** `astro.config.mjs:72-73` ha `'/en/category/ombre-e-luci/': '/it/categoria/ombre-e-luci/'` (categoria senza articoli EN, redirect verso IT). Testato live 2026-07-28: `curl https://ombreeluci.it/en/category/ombre-e-luci/` → **404**, non 301. Confermato anche via GSC URL Inspection API: `coverageState: "Not found (404)"`, crawlato l'ultima volta 2026-07-26.

**Causa probabile (non ancora confermata con fix al momento di questa nota):** la route dinamica `src/pages/en/category/[slug].astro` intercetta il path prima che il redirect statico di `astro.config.mjs` possa applicarsi, e la pagina stessa risponde 404 per mancanza di articoli nella categoria invece di lasciar passare il redirect.

**Nota di fusione:** questo è lo stesso bug descritto nel blocco "RISOLTO" più sopra nella stessa data — sembra essere la nota di scoperta (via audit GSC) scritta durante/prima dell'implementazione del fix, non un secondo bug distinto. Riportato integralmente per fedeltà alla fonte, senza fondere i due blocchi.

### Verifica GSC "Pagina con reindirizzamento" (nuovo motivo, 2026-07-28)
**Verificato, non è un bug** — testato via Search Console URL Inspection API: le pagine canoniche (`/it/…/`, `/en/…/` con slash finale) risultano `PASS — Submitted and indexed`. Le varianti senza slash finale o senza prefisso lingua (es. `/it/il-mio-ritiro-spirituale-a-morlupo` senza `/`, `/chi-siamo` senza `/it/`) risultano `NEUTRAL — Page with redirect`, comportamento corretto e voluto (redirect di canonicalizzazione già esistenti, Rule R + astro.config.mjs). Nessuna azione necessaria su questo fronte specifico.

---

## [BUG] Segnalazioni 2026-07-27

*Portato da `bug_ux_ui.md` — nessuna sessione `STATO.md` per questa data (STATO.md salta direttamente dal 24/7 al 7/8). L'entry `docs/SEO-MONITORING-LOG.md` del 27/7 rimanda esplicitamente a questi bug ("impatto SEO/dati indiretto — vedi bug_ux_ui.md per dettagli").*

### RISOLTO — Proxy WordPress legacy su Aruba rimosso dal Worker
**Desiderata utente:** "il redirect su Aruba possiamo abolirlo appena puoi" → poi, dopo aver visto i numeri del traffico, "direi di sì" (conferma a procedere anche su wp-content/wp-json + deploy).

**PRIMA:** `cf-worker/redirect-worker.js` proxava verso un WordPress live su Aruba (IP `89.46.105.36`) tutte le richieste su `/wp-admin`, `/wp-content`, `/wp-includes`, `/wp-json`, `/feed`, `wp-login.php`, `wp-cron.php`, `xmlrpc.php`. Nessun audit del traffico reale era mai stato fatto prima di questa sessione.

**Intervento:**
1. Audit CF Analytics 7gg (21-27/7) per path — vedi tabella sotto.
2. Branch dedicato `fix/aruba-wp-proxy-cleanup` (mai su main, per la regola di branch strategy).
3. Rimossi `/wp-admin`, `/wp-includes`, `wp-login.php`, `wp-cron.php`, `xmlrpc.php` (zero traffico legittimo, solo scanner) + `/feed` (bug: intercettato qui prima del redirect Astro verso `/it/rss.xml`, causava 403 invece di 301).
4. Su conferma esplicita dopo revisione dati: rimossi anche `/wp-content` e `/wp-json`, pur avendo traffico reale non-scanner (vedi tabella) — decisione: accettabile lasciar decadere questi URL residui piuttosto che mantenere WordPress pubblico vivo solo per servirli.
5. Sintassi verificata (`node --check`), poi `npx wrangler deploy` da `cf-worker/`.

**Traffico misurato (7gg, campione top-50/giorno, sottostima della coda lunga):**

| Path | Hit/sett. | Natura | Esito |
|---|---|---|---|
| `wp-login.php`, `wp-admin/*`, `wp-includes/*`, `xmlrpc.php`, `wp-cron.php` | ~centinaia totali | Scanner/bot (brute-force, probe `.php` inventati tipo `pwnd-1/kurd.php`) | Rimosso, zero perdita |
| `/feed` (bare) | n/a | Bug: 403 invece di redirect 301 | Fix — ora raggiunge il redirect Astro |
| `wp-content/uploads/*.jpg\|png\|webp` (86 file distinti) | 838 | Reale — hotlink/backlink storici | Rimosso su conferma esplicita — questi URL ora 404 |
| `wp-json/oembed/1.0/embed` | 944 | Probabile reale — anteprima link esterni | Rimosso su conferma esplicita — anteprime per vecchi URL OeL smettono di funzionare |
| `wp-json/wp/v2/users` | 27 | Malevolo — enumerazione utenti | Rimosso, positivo per sicurezza |
| `wp-json/wp/v2/posts*`, `batch/v1`, bare | 131 | Ambiguo | Rimosso |

**DOPO — verificato con smoke test post-deploy (2026-07-27, deploy `879f73cc`):**
- Home, articolo IT, articolo EN: 200 invariato.
- `/feed`: **301 → `/it/rss.xml`** (era 403 da WordPress — bug fixato).
- `wp-admin/`, `xmlrpc.php`, `wp-content/uploads/*`, `wp-json/oembed/*`: **404 pulito da Astro/Pages**, nessun contatto con Aruba (prima risposta 403 subito dopo il deploy era cache edge stale, sparita al retest con cache-bust).
- Nessuna regressione osservata sul resto del sito.

### RISOLTO — Algolia sync (3 bug indipendenti sovrapposti, causa reale = Cloudflare Bot Fight Mode)
La Flow "Algolia sync su pubblicazione" (id `c09762f8`) non sincronizzava mai la ricerca del sito dopo la pubblicazione iniziale di un articolo. Tre bug indipendenti si sommavano:
   1. **Secret disallineato**: `ALGOLIA_SYNC_SECRET` sulla Flow non combaciava con quello su CF Pages → 401. Fix: secret rigenerato e allineato su entrambi (richiede un redeploy CF Pages per essere letto — i secret impostati via `wrangler pages secret put` si applicano solo alle build successive, non a quella già in esecuzione).
   2. **URL sbagliato**: la Flow chiamava `ombreeluci-staging.pages.dev` **direttamente**, bypassando il Worker — a differenza della Flow gemella "Sync metadati IT→EN" che chiama correttamente `ombreeluci.it`. Le variabili d'ambiente CF Pages "production" a quanto pare non sono garantite sull'URL nudo `*.pages.dev`. Fix: URL allineato a `https://ombreeluci.it/api/algolia-sync`.
   3. **Causa reale e principale — Cloudflare Bot Fight Mode**: ogni richiesta del server Directus (VPS Hetzner, IP `159.69.196.64`, ASN 24940) verso `/api/*` su `ombreeluci.it` riceveva un `managed_challenge` (confermato nei log Firewall CF, `source: botFight`) — una sfida JS che un server non può risolvere. La Flow non riceveva mai una vera risposta dall'endpoint, qualunque fosse secret/URL. **Probabilmente ha bloccato silenziosamente anche le altre Flow con lo stesso pattern (sync-didascalia, e sync-metadata quando triggerata realmente da Directus, non testata a mano da rete esterna).** Fix: creata IP Access Rule Cloudflare (whitelist) per `159.69.196.64` a livello zona — bypassa Bot Fight Mode per il VPS, non cambia nulla per il resto del traffico.
   4. Bonus: rimossa anche l'operation condizionale "Check if published" nella Flow — aveva un filtro vuoto mai configurato dal 09/05/2026, bloccava l'esecuzione a monte indipendentemente dagli altri 3 bug. Il controllo pubblicato/non pubblicato è comunque già fatto correttamente dentro l'endpoint (`algolia-sync.ts`), quindi l'operation era ridondante oltre che rotta.

**Verificato end-to-end**: PATCH reale su un articolo → propagazione automatica su Algolia in pochi secondi, confermato con marker di test. Rilanciato reindex completo (`node scripts/algolia/index-all.mjs`): 6953 articoli + 355 autori + 206 numeri, per sanare lo stale accumulato.

**Nota di fusione — backlog:** questo fix chiude di fatto la voce **ALGOLIA-05** che compare come 🔴 aperta nella tabella "Backlog pre-lancio" più sopra in questo file (risalente a maggio 2026) — quella riga non era mai stata aggiornata. Vedere annotazione inline su quella riga.

### FATTO — Jean Vanier "Le sacrament de la tendresse" — foto e dimensioni
**Foto vecchia in ricerca**: causa = il bug Algolia sync sopra. Fix stopgap: record Algolia corretto a mano 2026-07-27 (ora punta a `86d48925-...`, l'immagine con i fiori). Si sistemerà da solo per i prossimi articoli quando il bug Algolia sync sarà risolto (fatto, vedi sopra).

**APERTO — Dimensione foto "sbagliata" nonostante editing Photopea**: da verificare visivamente — l'immagine di copertina viene sempre servita con crop fisso `?width=400&height=280&fit=cover` in ricerca/liste (aspect ratio 10:7). Se la foto originale ha un aspect ratio molto diverso (es. verticale), il crop automatico può tagliare il soggetto in modo indesiderato anche se il file caricato è già ridimensionato correttamente in Photopea — non è detto sia un bug, potrebbe essere il comportamento atteso del crop "cover". Verificare con Cristina quale specifica visualizzazione (articolo, card, ricerca) mostra la foto storta, poi decidere se serve un punto di focus/crop manuale sull'immagine invece del cover automatico. **[da bug_ux_ui.md — aggiunto al backlog, vedi sezione backlog più in basso.]**

### RISOLTO — Traduzione De Paolis non pubblicata nonostante flow "completo"
Articolo IT `047749e5` (la-disabilita-non-e-un-superpotere...): il campo `json_traduzione` incollato dalla redazione era JSON non valido (parentesi graffa doppia in apertura + escaping rotto delle virgolette negli attributi `href` di `didascalia_copertina`). La flow "Import traduzione da JSON" fallisce silenziosamente su `JSON.parse` senza mostrare errore all'utente — stesso pattern sistemico del bug Algolia sopra: **le Flow Directus non hanno un meccanismo per segnalare errori a chi ha innescato l'azione**. Fix: JSON ricostruito manualmente e valido, riscritto sul campo → la flow è ripartita da sola (trigger `items.update`) e ha creato l'articolo EN `2fbb0166` (slug `disability-is-not-a-superpower-or-an-image-problem`), pubblicato, linkato bidirezionalmente. Verificato live (200 su IT ed EN).

// Da valutare: aggiungere un campo tipo `errore_traduzione` che la flow scrive quando il parse fallisce, così l'errore è visibile in Directus invece di scoprirlo mesi dopo via ticket. **Nota di fusione:** questa idea è stata ripresa e generalizzata l'8/8 come "campo errore visibile sulle Flow critiche" — vedi sezione "Prossimi passi" in cima a questo file, punto Directus #1.

### RISOLTO — Foto EN "il mio ritiro spirituale a Morlupo" sempre sbagliata
L'articolo EN `651061d0` (my-spiritual-retreat-in-morlupo) aveva `immagine_copertina` e `didascalia_copertina` **null** — non era mai stato sincronizzato con la copertina dell'IT dopo la bonifica del duplicato Morlupo (sessione 24/7 in `STATO.md`, voce DUPLICATO-MORLUPO). La pagina mostrava un placeholder, percepito come "foto sbagliata". Fix: copiati `immagine_copertina` (`2369653b-...`) e didascalia tradotta dall'IT. Verificato live.

### RISOLTO — Preview URL Directus
`preview_url` su collection `articoli` puntava a `ombreeluci-staging.pages.dev` (uno dei sintomi del problema staging generale). Rimosso (`meta.preview_url = null`) su richiesta esplicita — non funzionava comunque.

---

## Sessione 2026-07-24 — Bug redazione Directus: didascalia, duplicato Morlupo, EN→staging

| Area | Descrizione |
|---|---|
| **DIDASCALIA-REESPOSTA** | Il campo `didascalia_copertina` su `articoli` era `hidden=true` (nascosto nella migrazione F3 didascalie→`didascalie_img`, 2026-06-20) con nota "Non usare" → la redazione non vedeva più dove scrivere la didascalia. Verificato nel codice che la **pipeline di traduzione articoli gestisce già `didascalia_copertina` end-to-end**: export flow lo mette in `_translate`, import flow lo scrive sull'articolo EN (`didascalia_copertina={{parse.translate.didascalia_copertina}}`, sia create che update). Frontend lo legge come fallback dopo `didascalie_img` ([it/[slug].astro:243](src/pages/it/[slug].astro#L243)). **Fix:** PATCH `/fields/articoli/didascalia_copertina` → `hidden=false`, `interface=input-multiline`, nota aggiornata. La redazione scrive la didascalia in IT, la pipeline la traduce in EN/ES/FR. **Caveat:** per articoli vecchi migrati `didascalie_img` ha priorità → editare il campo su un vecchio articolo può non riflettersi online; sui nuovi funziona sempre. |
| **DUPLICATO-MORLUPO** | Esistevano due articoli gemelli di Valeria Antonucci: A=`b4e8d0fd` "Un fine settimana spirituale a Morlupo" (originale, pub 16/07, no EN) e B=`12ed80f1` "Il mio ritiro spirituale a Morlupo" (creato ex-novo il 20/07, più completo, con didascalia + traduzione EN `651061d0`). Cristina editava B ma controllava l'URL di A → "non si salva niente" (falso: su B era tutto salvato). La sua "cancellazione" di A non era mai arrivata al server (zero delete nel suo activity log; articoli fanno hard-delete, `archive_field=null`). **Fix:** backup di A in `scripts/backups/`, A messo in draft e poi hard-deleted (HTTP 204). Nessun redirect 301 (URL non indicizzato in 1 settimana — deciso con utente). Restano B (IT) + EN. La home SSG rigenerata dal rebuild non linka più ad A. |
| **BUG-EN-STAGING** (fix, da validare) | Sul sito live `ombreeluci.it` lo switcher lingua EN, gli hreflang, il **canonical degli articoli EN**, i link social e il JSON-LD `@id` puntavano a `ombreeluci-staging.pages.dev`. **Causa:** il CF Worker fa da proxy verso il deployment Pages, quindi a runtime `Astro.url.origin`/`Astro.url.href` risolvono al dominio di staging. Canonical IT e og:url erano corretti perché usano `Astro.site` (config di build = ombreeluci.it). Peggiorato dopo le modifiche al Worker dell'incidente noindex (2026-07-08/09). **Fix (nel codice, non sul Worker fragile):** in [it/[slug].astro](src/pages/it/[slug].astro) e [en/[slug].astro](src/pages/en/[slug].astro) introdotto `SITE_ORIGIN = Astro.site?.origin ?? 'https://ombreeluci.it'` + `shareUrl`; switcher lingua reso **relativo**; hreflang/canonical EN/social/JSON-LD costruiti con `SITE_ORIGIN`; lasciati intatti solo i `fetch` interni same-origin. **Consigliato:** impostare `PUBLIC_SITE_URL=https://ombreeluci.it` nel build di produzione CF Pages come blindatura aggiuntiva. |
| **CAUSA DI FONDO RISOLTA — cache/Service Worker del browser** | Il "delirio" (salvataggi che tornano indietro, foto/didascalie sparite, delete che non funziona, login admin che mostra Cristina) aveva **una sola causa**: la cache/Service Worker del browser Directus sulla postazione serviva dati/app vecchi. Il server è **sempre stato corretto** (verificato N volte: le scritture di Cristina arrivavano, comprese foto+didascalia+published su `047749e5`; l'API restituisce fresco sia ad admin che al ruolo Editor). **Diagnosi differenziale:** `curl` dalla stessa macchina = dati freschi + account giusto; il browser no. Macchina pulita (`scutil --proxy` vuoto, DNS Cloudflare corretto, cert Let's Encrypt reale = no MITM, `/etc/hosts` pulito); Cloudflare non cacha le API (`cf-cache-status: BYPASS` anche su `/users/me`). Directus è una **PWA con Service Worker** (`/admin/sw.js`) → serve app/stato cachati, sopravvive alle riaperture, `curl` non lo tocca. **Da cellulare 4G Cristina vedeva già tutto corretto.** La diagnosi 2026-07-06 ("chiudi il browser") era incompleta. **FIX (per browser, su ogni postazione): DevTools → Application → Service Workers → Unregister + Clear site data → ⌘⇧R** (o lucchetto 🔒 → Impostazioni sito → Cancella dati). **Verificato:** dopo la pulizia su Cristina è tutto aggiornato. |
| **FORBIDDEN aprendo articolo** | Dopo la pulizia cache, aprendo un articolo compariva un popup **Forbidden (403)**. **Causa:** `meta.versioning=true` sulla collection `articoli` + ruolo Editor senza permessi su `directus_versions` → l'app interroga `/versions` all'apertura → 403 (confermato con token Editor). **Fix:** disattivato il versioning su articoli (`PATCH /collections/articoli` `meta.versioning=false`) — era inutilizzato (0 versioni), reversibile. Alternativa non scelta: dare CRUD su `directus_versions` all'Editor. |
| **FILTRO BOZZA che ritorna** | La lista articoli ripartiva sempre con filtro `stato=draft` (rimosso a mano ma ritornava al reload). **Causa:** preset salvato id=3 dell'utente admin `info@fedeeluce.it` con `filter: stato=draft`. **Fix:** `PATCH /presets/3` `filter=null`. Il preset di Cristina (id=17) era già null. **Nota:** rimosso il filtro, la lista mostra ora **tutti i 6980 articoli** (IT 3483 pub + 27 draft; EN 3469 pub + 1 draft) — è il totale reale della collection, non un errore. Per un default diverso, impostare filtro/ordinamento e salvare il layout. |
| **NOTA — preview_url su staging** | `preview_url` di articoli = `https://ombreeluci-staging.pages.dev/it/{{slug}}/` → il pulsante anteprima Directus apre staging in nuova scheda. Possibile altra fonte del "va su staging". Da decidere se puntarlo a produzione o lasciarlo (anteprima bozze). Non modificato. |

---

## Sessione 2026-07-14 — Setup nuova postazione (segreteria) + onboarding Claude Code

| Area | Descrizione |
|---|---|
| **Setup ambiente** | Repo clonato in locale (`/Users/met/Documents/Claude`) su un Mac non precedentemente configurato per il progetto. Autenticazione GitHub configurata via Personal Access Token (classic, scope repo), salvato nel Keychain macOS tramite `git credential-osxkeychain` — non in chiaro su disco. Push verificato funzionante (`git push --dry-run`). |
| **Stato setup — non ancora fatto** | `npm install` non eseguito, `.env`/`.env.local` non creato su questa macchina (mancano `DIRECTUS_TOKEN`, `CF_DEPLOY_HOOK`, credenziali Algolia/Mailchimp — vedi `.env.example`). Da fare prima di lanciare `npm run dev` o script che richiedono queste variabili. |
| **Onboarding** | Documentazione di progetto (CLAUDE.md, WORKING.md, README.md, STATO.md per intero) letta e revisionata per contesto. Nessuna modifica al codice in questa sessione. |

---

## Sessione 2026-07-15 — Pubblicazione programmata articoli (SCHED-PUB-01, ATTIVO)

| Area | Descrizione |
|---|---|
| **SCHED-PUB-01** | Aggiunta la **pubblicazione programmata** degli articoli, richiesta dalla redazione. Prima non era possibile: le query filtrano solo `stato=published` senza controllare la data, quindi un articolo pubblicato con data futura andava online subito. **Soluzione (additiva e reversibile):** nuovo campo `articoli.data_pubblicazione_programmata` (dateTime nullable) + flow Directus **"Pubblicazione programmata"** (`bb58342e`, trigger **schedule** cron `*/15 * * * *`, `accountability: activity`). Catena: `item-read` (draft + campo `_nnull` e `_lte $NOW`) → `exec` (estrai id) → `condition` (count>0) → `item-update` (`stato=published`, `data_pubblicazione=now`, azzera il campo). Il rebuild del sito parte automaticamente dal flow event esistente **"Rebuild CF Pages on Publish"**. **Uso redazione:** articolo in Bozza + compilare `data_pubblicazione_programmata` → pubblicato entro ≤15 min da quell'ora; campo vuoto = pubblicazione manuale come prima. |

**Sicurezza / reversibilità:**
- Design **additivo**: nessun campo/flow esistente modificato. Solo i draft con il nuovo campo valorizzato vengono toccati — i 29 draft "normali" (campo nullo) restano intatti (verificato con articolo-esca).
- **Fail-safe**: se il flow fallisce, al massimo un articolo non si pubblica in orario — mai un danno al sito.
- **REVERT completo:** `node scripts/teardown-scheduled-publish.mjs` elimina flow + campo e riporta Directus allo stato precedente. Setup ricreabile con `scripts/setup-scheduled-publish.mjs` (commit `56878f4b`).
- **Verificato end-to-end (test live 2026-07-15):** articolo-esca programmato nel passato → pubblicato dal flow entro 1 min (stato→published, data_pubblicazione impostata, campo azzerato), poi esca eliminata. Filtro testato: seleziona solo l'esca scaduta, ignora data futura e tutti i draft normali.

**Nota:** Directus è unico e condiviso tra prod e staging → il flow non è isolabile per ambiente; il "test su staging" è stato fatto creando il flow disattivato + articolo-esca, poi attivazione supervisionata.

---

## Sessione 2026-07-13 — Diagnosi "articolo non si aggiorna online" = cache browser (nessun bug)

| Area | Descrizione |
|---|---|
| **CACHE-DIAG** | Segnalazione: un articolo (`7480c35c`, *Sport, solidarietà e inclusione…*) sembrava non aggiornarsi — corpo e foto "diversi" tra Directus e online. **Verifica:** confronto simultaneo Directus vs produzione vs staging → **tutto identico** (stessa `immagine_copertina` `2189e9e3`, 16/16 frasi del corpo coincidenti; `data_aggiornamento` DB = 11:37 dello stesso giorno). Nessun service worker (`/sw.js`, `/service-worker.js` → 404). **Causa:** cache del **browser** dell'utente (in incognito la pagina era corretta). Risolto con hard reload / incognito. **Nessuna modifica a codice o dati.** |

**Nota architetturale utile per future segnalazioni "la mia modifica non compare online":** le pagine articolo escono con `Cache-Control: s-maxage=3600, stale-while-revalidate=86400` → Cloudflare può servire la pagina in cache fino a **~1 ora** (e una copia stale fino a 24h mentre rigenera in background); nodi edge diversi possono avere versioni di momenti diversi. **Percorso di diagnosi:** (1) confronta il contenuto reale Directus con l'URL online **con cache-bust** (`?v=xxx`) — se coincidono, il backend è a posto; (2) test in **incognito** → se corretto, era cache del browser; se ancora vecchio, è la cache CDN → hard reload, attesa, oppure flow "Revalida cache articolo" / purge Cloudflare. Campi utili: `articoli` non ha `date_created`/`date_updated` di sistema ma i campi `data_creazione` e `data_aggiornamento`.

---

## Sessione 2026-07-13 — Fix flow "Esporta per traduzione" (403 tema_label per Redazione)

| Area | Descrizione |
|---|---|
| **TRANS-FLOW-EXPORT-403** | Il flow "Esporta per traduzione" (`f53500c6`) non popolava `json_export` per gli utenti **Redazione**: cliccando il pulsante il campo restava vuoto. **Causa:** l'operation `Leggi articolo` (item-read) interrogava il campo `tema_label`, **rimosso** con CLASSIF-01 (2026-05-08) e non più nei permessi di lettura del ruolo Redazione. L'item-read falliva con `403 FORBIDDEN — You don't have permission to access field "tema_label"`, interrompendo la catena prima della scrittura. Funzionava con utenti admin (che leggono tutti i campi), da qui la difficoltà a diagnosticarlo. Nota: `accountability: activity` **non** basta a bypassare i permessi di campo sull'item-read per un trigger non-admin. **Fix:** rimosso `tema_label` dai `fields` dell'op1 e dal `_copy_invariant` dello script op2 (`Costruisci JSON`), via PATCH Directus. Aggiornato anche `scripts/setup-export-flow.mjs` (rimosso `tema_label` + commento anti-regressione). **Verificato** con utenti temporanei di ruolo **Redazione** e **Editor**: prima del fix trigger→403 e campo vuoto; dopo il fix trigger→200 e `json_export` scritto (JSON valido, leggibile dal ruolo). Utenti temp eliminati. |
| **Ruoli utenti reali** | Gli editor redazionali reali (Cristina Tersigni, Matteo Cinti, Al Boino/Emanuele) hanno ruolo **Editor** — `Redazione` e `Redattore` sono account di test. Per debug flow/permessi testare col ruolo effettivamente usato. |
| **Residuo "non funziona" = UX, non bug** | Dopo il fix, il flow gira e mostra notifica verde, ma l'utente non vedeva il codice per due motivi non-bug: (1) **Directus non aggiorna il form dopo il flow** → serve ricaricare la pagina (Cmd+Shift+R); (2) il campo `json_export` è in **fondo** al form (`sort: 603`, dopo il corpo e "note_redazione"), facile da mancare. Risolto lato utente con reload + scroll. Il campo NON è stato spostato in alto (scelta utente 2026-07-13). |

**Regola:** ogni campo interrogato dall'item-read di un flow con trigger manuale deve essere leggibile dal ruolo che clicca il pulsante. Quando si rimuove un campo dalla tassonomia (come `tema_label`), va rimosso anche dalle query dei flow, altrimenti i non-admin ottengono 403 silenziosi.

---

## Sessione 2026-07-13 — Sanificazione segreti in .claude/settings + finding sicurezza

| Area | Descrizione |
|---|---|
| **Allowlist settings sanificata** (`d7f405b4`) | I file `.claude/settings.json` e `.claude/settings.local.json` contenevano, nelle voci dell'allowlist dei permessi, un **token Directus** live (ripetuto ~79 volte), un JWT di sessione e password utente in chiaro — salvati automaticamente dai comandi `curl` approvati nelle sessioni precedenti. Il repo è **pubblico**. Token/JWT/password sostituiti con placeholder (`REDACTED_*`) e rimosse le voci meta/diagnostiche contenenti segreti prima di commit+push. **Verificato:** il token Directus non è mai stato committato in nessun punto della history (nessuna esposizione pubblica). |
| **⚠️ Finding aperto — password in history pubblica** | Le password di Cristina e Matteo, resettate nella sessione 2026-07-06, sono in chiaro nella voce "Password resettate" della sessione 2026-07-06 (più sotto in questo file) e nel commit pubblico `31df8bd7`. Da considerare **compromesse**. Rimediazione decisa: nessun intervento immediato su richiesta utente (2026-07-13). Azione raccomandata: far cambiare le due password in Directus — così le stringhe esposte diventano inutili, a prescindere dalla history git (un rewrite della history su repo pubblico condiviso non è giustificato se le credenziali vengono ruotate). |

**Regola operativa:** l'harness registra i comandi Bash approvati nell'allowlist di `.claude/settings*.json`. **Mai passare segreti (token, password, JWT) come letterali sulla riga di comando** — usare variabili d'ambiente o file gitignored, altrimenti finiscono nell'allowlist e, essendo il repo pubblico, rischiano l'esposizione. Il token Directus va letto da `.env`/`.env.local`, non incollato nei `curl`.

---

## Sessione 2026-07-08/09 — Incidente staging noindex → redirect condizionato (rollback)

**Esito:** rollback a `e219515e` (stato pre-sessione). Sito stabile. Approccio "redirect condizionato" **abbandonato** in attesa di diagnosi più approfondita. La strategia in produzione resta il **noindex statico** (`X-Robots-Tag: noindex, nofollow` in `middleware.ts` per gli host non-produzione).

### Obiettivo tentato
Impedire l'indicizzazione di Google sul backend nudo `*.pages.dev`. Si voleva sostituire il `X-Robots-Tag: noindex` statico su staging con un **301 condizionato** verso `ombreeluci.it`, mantenendo però raggiungibile Pages per le richieste legittime instradate dal CF Worker.

### Cosa è andato storto (due incidenti in produzione)
1. **526** — `fetch()` nel Worker seguiva automaticamente il 301 di Pages: la subrequest verso `ombreeluci.it` (stessa zona del Worker) veniva instradata fuori dal Worker per prevenire loop e finiva su un origin senza certificato. Mitigato con `redirect: 'manual'` nella subrequest (`forwardToPages`).
2. **Loop di redirect infinito** lato client quando il confronto del secret falliva su richieste già instradate dal Worker (`Location` identico alla richiesta originale). Tentativo di guard-rail: header `X-Forwarded-Host` impostato **incondizionatamente** dal Worker, letto dal middleware per non reindirizzare mai le richieste dal Worker a prescindere dal secret.
3. **Stub anomalo** su route SSG (`/it/archivio/`, `/it/rubriche/recensioni/`) — inizialmente attribuito a un deploy via `deploy_hook` con output diverso da una build pulita dello stesso commit. **Ipotesi falsificata:** il problema si è riprodotto anche con deploy via `git push` normale.

### Rollback e stato finale
- `ba2a223a` — revert emergency: `middleware.ts` ripristinato a stato pre-sessione (priorità stabilità sito).
- `9e66db17` — reapply del guard-rail (Step B1/B2), poi di nuovo revertato.
- `d632c920` — secondo rollback emergency a `e219515e`.
- **Diff netto residuo (`e219515e..d632c920`):** solo `cf-worker/redirect-worker.js` (+19 righe). Il Worker conserva `X-Internal-Proxy-Auth`, `X-Forwarded-Host: ombreeluci.it`, `redirect: 'manual'` e un **log diagnostico temporaneo** (`internal_proxy_auth_set`, solo `.length` del secret, mai il valore). Il `middleware.ts` NON legge più questi header (rollbackato) — sono innocui ma orfani.

### Problemi aperti (da diagnosticare prima di ritentare)
- **Mismatch secret `INTERNAL_PROXY_AUTH`** tra Worker (`env.INTERNAL_PROXY_AUTH`) e Pages (`runtime.env.INTERNAL_PROXY_AUTH`) — il confronto fallisce anche con header corretto (Step B, non diagnosticato). Il log `.length` in `redirect-worker.js` serve a osservarlo passivamente; **rimuovere il log una volta risolto**.
- **Stub anomalo su SSG riproducibile anche via `git push`** — causa non identificata, non è (solo) il `deploy_hook`.

### Regole apprese
- Per lo staging noindex: **preferire il noindex statico** al redirect condizionato finché il mismatch secret e lo stub SSG non sono compresi.
- Un `fetch()` verso la stessa zona CF che segue un 301 automatico → rischio 526/loop: usare sempre `redirect: 'manual'` nelle subrequest del Worker.
- Un guard-rail anti-loop deve essere **indipendente dal secret** (header separato tipo `X-Forwarded-Host`), così un bug nel secret non trasforma il redirect in loop.

---

## Sessione 2026-07-06 — Supporto account Directus + Dropdown tipo numeri_rivista

| Area | Descrizione |
|---|---|
| **Account sovrapposti Cristina/Matteo** | Cristina Tersigni vedeva l'account di Matteo Cinti dopo il login. Indagine completa: autenticazione API corretta (JWT con ID Cristina), `/users/me` restituiva Cristina, `autori.directus_user` correttamente mappato, avatar distinti. **Causa:** la finestra incognito non era stata chiusa completamente tra i tentativi — localStorage e sessione Directus persistono all'interno della stessa finestra incognito anche tra tab diversi. La sessione attiva di Matteo veniva riutilizzata. **Fix:** chiudere completamente il browser (non solo la tab), riaprire una nuova finestra privata. **Regola:** in caso di sessione errata su Directus, chiudere del tutto il browser prima di riaprire una finestra incognito. |
| **Password resettate** | Durante l'indagine sono state resettate le password di Cristina (`CristinaOEL2026!`) e Matteo (`MatteoOEL2026!`). Comunicare a entrambi di cambiarle dal proprio profilo Directus. |
| **Dropdown tipo numeri_rivista** | Campo `tipo` nella collection `numeri_rivista` configurato con `interface: select-dropdown` via API Directus (`PATCH /fields/numeri_rivista/tipo`). Opzioni: "OEL — Ombre e Luci" → `oel`, "INS — Insieme" → `ins`. I valori nel DB erano già lowercase (`oel`/`ins`) dall'import originale — le choices matchano. |
| **Fix deploy automatico numeri_rivista** | Il flow "CF Pages rebuild on numeri_rivista publish" aveva un deploy hook CF Pages errato/vecchio (`94f27b2c…`). Aggiornato con il hook corretto (`d3d489e5…`, uguale a `CF_DEPLOY_HOOK` in `.env.local`) via `PATCH /operations/7231841d`. Ora il deploy parte automaticamente su ogni create/update di `numeri_rivista`. |

---

## Sessione 2026-07-01 — Fix flow "Esporta per traduzione" + Backfill date null

### Fix TRANS-FLOW export

| Area | Descrizione |
|---|---|
| **TRANS-FLOW-EXPORT-FIX** | Flow "Esporta per traduzione" (`f53500c6`) non scriveva `json_export` per gli utenti Redazione. **Causa:** `accountability: "all"` — il flow girava con i permessi dell'utente loggato; la scrittura su `json_export` veniva bloccata silenziosamente anche con `UPDATE *`. **Fix:** `accountability` → `"activity"` (permessi di sistema). Aggiornato anche `scripts/setup-export-flow.mjs` per includere questa impostazione. Secondo problema: `group_note` aveva `start: "closed"` — i campi `json_export` e `json_traduzione` erano invisibili di default. Fix: `start: "open"`. |

**Regola generale per tutti i flow Directus:** usare sempre `accountability: "activity"` per flow operativi che devono girare indipendentemente dal ruolo dell'utente. `accountability: "all"` è corretto solo se si vuole che il flow rispetti i permessi dell'utente loggato — ma causa fallimenti silenziosi quando quei permessi non coprono tutte le operazioni necessarie.

---

## Sessione 2026-07-01 — Backfill date null su articoli WP

| Commit | Area | Descrizione |
|---|---|---|
| `cde6628b` | **BACKFILL-NULL-DATES** | 68 articoli pubblicati (39 IT + 29 EN) avevano `data_pubblicazione: null`, causando ordinamento scorretto nelle pagine autore e ovunque si usi `sort: -data_pubblicazione`. **Causa:** il backfill del 2026-05-09 (`backfill-dates.mjs`) filtrava solo articoli con `T00:00:00` — gli articoli con NULL venivano saltati perché `null?.endsWith(...)` restituisce `undefined`. A monte: lo script import (`import_to_directus.py`) usa un upsert con `compare_fields` che **non include** `data_pubblicazione`; se in una prima esecuzione la data mancava, nessuna esecuzione successiva la correggeva. **Fix:** nuovo script `scripts/backfill-null-dates.mjs` — recupera i 29 IT con wp_id da `articoli_semantici_FULL_2026.json` (timestamp completo con ore:min:sec), aggiorna il campo IT e la traduzione EN collegata (`articolo_traduzione`). Risultato: 29 IT + 28 EN aggiornati (1 EN senza `articolo_traduzione`), 0 errori. I restanti 10 IT senza data sono articoli creati direttamente in Directus dalla redazione — richiedono data manuale. |

### Articoli ancora senza data (10 IT + EN collegati) — richiedono intervento redazione

Creati direttamente in Directus (nessun wp_id), nessuna fonte automatica per la data:

| Slug | Note |
|---|---|
| `ponti` | senza numero rivista |
| `la-mia-vita-come-la-vostra-recensione` | senza numero rivista |
| `notte-inquieta-recensione` | senza numero rivista |
| `volevo-un-te-al-limone-recensione` | con numero rivista |
| `quel-rito-solito-e-sempre-diverso` | senza numero rivista |
| `il-weekend-delle-palme-a-bassano-romano` | senza numero rivista |
| `pero-c-e-un-pero` | senza numero rivista |
| `un-motivo-in-ogni-cosa` | con numero rivista |
| `la-piccola-e-si-e-persa-nel-parco-recensione` | senza numero rivista |
| `le-mie-insicurezze` | senza numero rivista |

Azione: la redazione deve impostare la data in Directus per ciascuno.

### Archivio SSG — nuovo numero non visibile senza rebuild

`/it/archivio/` (e `/en/archive/`) sono pagine **SSG**: vengono generate al build e non riflettono nuovi numeri rivista aggiunti in Directus finché non viene triggerato un rebuild.

**Procedura rebuild manuale Cloudflare Pages:**
1. dash.cloudflare.com → Workers & Pages → **ombreeluci-staging**
2. Tab **Deployments** → tre puntini `...` sull'ultimo deployment → **Retry deployment**
3. Attesa ~3 minuti → il nuovo numero appare in archivio

**Nota:** la pagina del singolo numero (`/it/archivio/oel-N/`) è SSR e si aggiorna in tempo reale senza rebuild.

**Da valutare:** rendere SSR anche `src/pages/it/archivio/index.astro` per eliminare il rebuild manuale ad ogni nuovo numero.

---

## Sessione 2026-06-30 — RSS feed, monitoring CF/GA4, fix traduzione EN

| Commit | Area | Descrizione |
|---|---|---|
| `ad7862d4` | **RSS feed + monitoring tooling** | Aggiunto feed RSS via `@astrojs/rss`: helper condiviso `src/lib/rss-items.ts` (riusa `getAllArticoliBuild()`, stessa fonte/fallback delle sitemap), ultimi 50 articoli pubblicati per lingua. Autodiscovery link in `BaseHead.astro`. Creati `scripts/cf-analytics.mjs` (Cloudflare Analytics via GraphQL API) e `scripts/ga-query.mjs` (Google Analytics 4 Data API) per il check settimanale SEO/traffico, integrati in `docs/SEO-MONITORING-LOG.md`. |
| `ad78995a` | **Redirect /feed** | `/feed` e `/en/feed` (convenzione WordPress) → redirect 301 ai nuovi feed RSS. |
| `d422eb5c` | **Fix path RSS IT** | Il feed IT era inizialmente su `/rss.xml` (root) — spostato a `/it/rss.xml` per coerenza con la regola di routing del progetto (nessuna route IT alla root eccetto homepage). Aggiornati autodiscovery e redirect di conseguenza. |

**URL feed finali:**
- IT: `https://ombreeluci.it/it/rss.xml` (anche via redirect `/feed`)
- EN: `https://ombreeluci.it/en/rss.xml` (anche via redirect `/en/feed`)

### Diagnosi traffico GSC + Cloudflare + GA4 (2026-06-28)

Prima sessione con accesso completo alle 3 fonti dati integrate. Scoperta chiave: **il traffico reale è ~21 utenti Italia/giorno**, non i 13k uniques/giorno mostrati da Cloudflare (85% erano bot, soprattutto Singapore e Cina). GA4 confermato come fonte di verità per comportamento utenti reali (durata sessione, eventi, bounce).

**Azione presa:** WAF rule "Block bot spam SG/CN" deployata su Cloudflare (Managed Challenge per traffico da Singapore/Cina non verificato come bot legittimo). Permesso `Firewall Services` aggiunto al token `CF_ZONE_TOKEN` per gestione futura via API.

**EN — verifica ROI traduzioni:** ~50 utenti umani reali fuori Italia in giugno (depurati dai bot), ma Google sta indicizzando attivamente i 3.400 articoli EN (es. `/en/authors/anna-cece/` con 2.100+ impressioni). ROI atteso in 3-6 mesi quando il dominio EN guadagnerà autorità.

### Fix dati: traduzione EN incompleta

Articolo "Making Cinema Heard..." (`5c1231d9-74e9-4ef4-8b4e-db11643a3e2c`) aveva `seo_description` con testo italiano residuo incollato davanti alla traduzione inglese (bug pipeline di traduzione). Corretto via PATCH diretto su Directus.

### Nota operativa: account GitHub multipli

Su questa macchina `gh auth` ha 3 account loggati (`trikkia`, `SegreteriaFL`, `unlongobardo`). Se `git push` fallisce con 403, eseguire `gh auth switch --user SegreteriaFL` prima di ripushare — non è un problema di permessi del repo, solo di account attivo.

---

## Sessione 2026-06-24 — Contenuti statici Directus, recenti fresh-first

| Commit | Area | Descrizione |
|---|---|---|
| `ca9abf7d` | **STATIC-01 — contenuti statici Directus** | Migrati i testi editoriali di 5 componenti (HomePageContent, NewsletterContent, ArchivioContent, IssueContent, DiariContent) dalla mappa hardcoded `i18n.ts` alla collection `contenuti_statici` di Directus. 41 nuove chiavi create nei gruppi `homepage`, `newsletter`, `archivio`, `diari`. Ogni componente usa `getCS()` con fallback inline — se Directus non risponde il sito funziona comunque con i testi precedenti. La redazione ora può modificare titoli, descrizioni, CTA e copy di sezione dal pannello Directus senza toccare codice. Script seed: `scripts/seed-contenuti-statici.mjs` (idempotente). |
| `c013f179` | **Recenti — shuffle fresh-first (client)** | La sezione "Recenti" in homepage shufflava il pool con Fisher-Yates uniforme. Fix: `pickRecentiWeighted()` divide il pool in "freschi" (≤60 giorni) e "resto", shuffla ciascun gruppo internamente, ma i freschi occupano sempre i primi slot. |
| (questo commit) | **Hero — esclusi freschi ≤60gg dal pool** | Problema: articoli con ruolo editoriale (strutturale, portante, laterale) appena pubblicati venivano assorbiti dall'hero pool e non comparivano mai nei Recenti. Esempio: su 11 articoli freschi, 6 avevano ruolo strutturale/portante → andavano nell'hero, lasciando solo 5 articoli nei Recenti (sempre gli stessi). Fix: `index.astro` e `en/index.astro` ora escludono gli articoli ≤60gg dal pool hero. L'hero è il "meglio dell'archivio" (36 mesi), i Recenti danno visibilità a ciò che è appena uscito. Risultato verificato: IT hero 50 (0 freschi), recenti 25 (8 freschi); EN hero 18 (0 freschi), recenti 25 (7 freschi). |

### Architettura rotazione homepage (aggiornata 2026-06-24)

**Hero slider** — "meglio dell'archivio": pool 50 articoli con cover, ruolo portante/strutturale/laterale, ultimi 36 mesi. **Esclusi i freschi ≤60gg** (vanno nei Recenti). Shuffle uniforme senza priorità (fix `67103c12`). Seed giornaliero server-side + Fisher-Yates client-side.

**Recenti** — "novità editoriali": pool 25 articoli (i più recenti per `data_pubblicazione`, qualsiasi ruolo editoriale). Il JS client divide in freschi (≤60gg) e resto, shuffla ciascun gruppo separatamente, freschi nei primi slot. Con ~8 freschi su 7 slot → combinazione diversa ad ogni visita.

**Separazione netta:** un articolo fresco non può apparire nell'hero, e i recenti non competono con l'archivio. Quando un articolo supera i 60 giorni, esce dai freschi recenti ed entra nel pool hero (se ha ruolo editoriale qualificante).

### Nota: articoli in bozza

3 articoli recenti (Lars Porsenna ×2, AiOeL) risultavano `stato: draft` in Directus e non apparivano nel sito. La query `getAllArticoli` filtra `filter[stato][_eq]=published`. La redazione deve pubblicarli perché compaiano.

---

## Fix sessione 2026-06-20/21 — Correlati, hero rotation, CF audit, hreflang

| Commit / Azione | Area | Fix |
|---|---|---|
| `0ac41ad5` | **correlati.json K=30** | Rigenerato con cosine similarity su embedding 3072-dim (non più euclidea UMAP 3D). K=5→30, solo slug IT, 3.427 articoli. Script `genera_correlati.py` riscritto con User-Agent fix per CF. |
| `0ac41ad5` | **hreflang tag IT/EN** | `alternates` aggiunti su `it/tag/[slug].astro` e `en/tag/[slug].astro` — erano l'unica route senza hreflang reciproco. |
| `0ac41ad5` | **GSC check 2026-06-20** | Impressioni 3.500+/giorno (picco 4.162 il 16/6), click 46/g, posizione 9.9. Log aggiornato in `docs/SEO-MONITORING-LOG.md`. |
| `67103c12` | **Hero rotation** | Shuffle uniforme pool 50 articoli (rimossa priorità flagged-first che bloccava sempre gli stessi 4). Seed giornaliero server-side + Fisher-Yates client-side. Rimosso `in_evidenza` da 2 articoli meta/test in Directus. |
| `6525c57f` | **Diari homepage** | Diari mostrano sempre l'ultimo articolo per diarista (rimosso filtro `usedSlugs` che causava articoli stale). |
| `3235c423` | **Audit CF** | SSL strict, TLS 1.2 min, Always HTTPS, Early Hints, 0-RTT, Always Online, Hotlink Protection. Transform Rule cache immutable su asset statici. Cache rate 0.02%→60-80% atteso. Dettagli: `docs/CF-AUDIT-2026-06-21.md`. |
| `f3a5b224` | **Pulizia repo** | CUTOVER.md rimosso, gitignore aggiornato (gsc/, scripts/logs/, scheduled_tasks.lock), gsc-query.mjs aggiunto. |
| `73b4a6db` | **Fase 1 pgvector** | Colonna `embedding vector(3072)` creata, 3.447 articoli IT popolati via Directus API. Script `populate-embeddings.py`. |
| `3179528a` + `82709d18` | **Fase 2 sync metadati** | Endpoint `/api/sync-metadata` + Flow Directus. Sync automatica IT→EN: 11 campi scalari + tag M2M. 14 EN orfani fixati (traduzione umana vince su AI). |
| (Directus) | **EN orfani** | 14/18 swap umana→AI (AI cancellata). 4 residui senza match IT. |

| `186716d9` | **Staging noindex** | `X-Robots-Tag: noindex, nofollow` su tutti i domini staging/pages.dev. Google indicizzava staging invece di produzione — fix confermato attivo. |
| `71d3f61c` | **Didascalie → file (F3)** | Collection `didascalie_img` creata (file+lang+didascalia+alt_text). 3.934 record migrati da articoli. Campi legacy nascosti dal form Directus. Route IT/EN leggono da nuova collection con fallback. |
| (console Hetzner) | **Indice pgvector** | Non creabile: pgvector max 2000 dim per indice, embedding 3072. Brute force OK per 3.400 articoli. |

| `ac5ee028`→`01e04439` | **Staging noindex fix** | Bug: noindex scattava su produzione (progetto CF Pages si chiama `ombreeluci-staging`). Fix: usa `PUBLIC_SITE_URL` env var. Smoke test aggiornato con check critico noindex. |
| (Directus) | **Didascalie migrate** | 3.941 record in `didascalie_img` (1.989 IT + 1.952 EN). Zero errori. Campi legacy nascosti. |
| `517a6ff6` | **Smoke test riscritto** | 7 check critici (bloccanti) + 7 importanti. Verifica noindex, SSR, canonical, cache, CMS, hreflang. |
| (CF) | **HSTS attivato** | `Strict-Transport-Security: max-age=31536000; includeSubDomains` |
| `45ef86e5` | **Sync end-to-end verificata** | `ruolo_editoriale` IT→EN: `None`→`trasversale` confermato. 11 campi + tag M2M. |

**PageSpeed post-sessione (mobile, ora-basta):** FCP 2.0s (era 4.6s), LCP 4.7s (da monitorare con cache piena), SEO risolto (era 69, ora OK).

| `66ec7e37` | **PageSpeed fix** | Iubenda async (-2.2s TTFB), preload LCP immagine copertina, width/height su logo/avatar/icona. FCP 4.6s→1.4s, SEO 69→100, Performance 81→76-91 (varia per pagina). |

**PageSpeed mobile post-fix:**
- FCP: **1.4s** (era 4.6s) — Iubenda async risolve
- LCP: **4.6-5.9s** — collo di bottiglia è CSS render-blocking (1250ms) + immagine da Directus su 4G simulato
- SEO: **100** (era 69)
- Per superare 90 mobile serve CSS critico inline (effort M) o proxy immagini via CF

| `27634ded` | **Sync didascalia IT→EN** | Endpoint `/api/sync-didascalia` + Flow Directus. Traduce didascalie con Claude Haiku automaticamente. Testato: "copertina libro - vi ho amato tutti" → "book cover - i have loved you all". |

**Da fare prossima sessione:**
- **Fase 3 roadmap:** traduzione automatica corpo articolo alla pubblicazione
- **Fix SSH VPS:** risolvere accesso (porta 22 o Cloudflare Tunnel)
- **CSS critico inline:** valutare se il guadagno LCP -1250ms giustifica la complessità

---

## Fix sessione 2026-05-26/27 — GSC cleanup e SEO hreflang

| Commit / Azione | Area | Fix |
|---|---|---|
| `62ad08da` + deploy `70765efb` | Worker Rule M+N | `/archivio/(oel\|ins)-N/` e `/autori/slug/` senza `/it/` → 301 |
| `fd02b7b1` | Middleware | `/it/ombre(-e)?-luci-n-N-YYYY-sfogliabile/` → `/it/archivio/oel-N/` |
| Directus PATCH | CMS | Bio Chiara Gatti: `href="emdr.it"` → `href="https://www.emdr.it"` IT+EN |
| `01965994` + deploy `bd787f99` | Worker Rule O+P | `/blog/slug-en/` → `/en/slug/`, `/blog/slug/` → `/it/slug/` — sync repo con deploy |
| `77a58472` + deploy `50aa6113` | Worker Rule Q | `/categoria/slug/` → `/it/categoria/slug/` |
| `1b04bad4` | BaseHead + middleware | Canonical trailing slash — rawPathname normalization |
| `4e9f0b43` + deploy `c75dd3bb` | Worker Rule R | `/it/*` e `/en/*` senza trailing slash → 301. Rimossa logica duplicata da middleware |
| (Directus API + codice) | Fix categorie descrizioni | Collection `categorie` unhidden. 11 descrizioni IT migrate da `categorie.descrizione` a `contenuti_statici.valore_it`. `getCategoriaDescrizione` rimossa. |
| commit hreflang categorie | SEO | hreflang alternates su homepage IT/EN e categorie IT/EN |
| `1750848f` | SEO | hreflang rubriche IT/EN (6 sezioni) + fix `alternateItUrl` mancante `/it/` |
| `astro.config.mjs` | SEO | redirect `/en/category/ombre-e-luci/` → `/it/categoria/ombre-e-luci/` (zero articoli EN) |
| `f71dc03b` | SEO | hreflang alternates su 20 pagine IT/EN mancanti (autori, archivio, diari, statiche) |
| `4fd2f61f` + deploy `a95fea8c` | Worker Rule Q0 | `/categoria/catechesi` → `/it/categoria/spiritualita/` |
| Directus PATCH | CMS | `open-dialogue-no-90` IT+EN: `href="www.angsaonlus.org"` → `href="https://www.angsaonlus.org"` |
| (nessun fix) | Info redazione | `ii-barattolo-di-maionese-e-caffe` esiste in Directus come draft — pubblicare o eliminare |

GSC validazioni inviate 2026-05-26:
- Bloccata 403 (75) → Convalida correzione inviata
- Non trovata 404 (128) → Convalida correzione inviata
- Errore di reindirizzamento (1) → Convalida correzione inviata
- Esclusa in base al tag noindex (58) → Convalida correzione inviata
- Pagina duplicata canonical diverso IT (54) → Convalida correzione inviata
- Errore server 5xx EN (30) → Convalida correzione inviata

---

## Fix sessione 2026-05-27 — SEO hreflang e descrizioni categoria

| Commit / Azione | Area | Fix |
|---|---|---|
| `21f5ce84` + `8b6a7e74` | **SEO hreflang homepage e categoria** | Tag `<link rel="alternate" hreflang>` aggiunti su homepage IT/EN e pagine categoria IT/EN (erano presenti solo sugli articoli). Gotcha CF Workers SSR: `Astro.url.origin` restituisce il dominio staging — corretto con `new URL(path, Astro.site).href` coerente con il pattern canonical di BaseHead. Verificato con curl post-deploy: tutti e 4 i punti restituiscono IT+EN+x-default su `ombreeluci.it`. |
| `aae0b6ad` (Directus API + codice) | **Fix descrizioni categoria** | Collection `categorie` aveva `hidden:true` in Directus: unhideata via API (redazione ora la vede nel pannello). 11 descrizioni IT migrate da `categorie.descrizione` a `contenuti_statici.valore_it`. Pagina IT categoria ora legge da `contenuti_statici` — stessa sorgente della EN. `getCategoriaDescrizione` rimossa. `sottotitolo` su `articoli` verificato: `hidden:false`, nessun bug. |

---

## Cutover completato — 2026-05-21 — Sito live su ombreeluci.it

| Azione | Stato | Note |
|---|---|---|
| Step 1 — Redirect apex→www rimosso dal Worker | ✅ | `ombreeluci.it` serve Astro direttamente |
| Step 2 — Merge `fix/cutover-noindex` | ✅ | noindex rimosso, robots.txt aperto |
| Step 3 — Custom domain CF Pages attivato | ✅ | `ombreeluci.it` custom domain su Pages |
| Step 4 — CF Redirect Rule www→apex 301 | ✅ | `www.ombreeluci.it/*` → `https://ombreeluci.it/{1}` |
| Canonical URL fix | ✅ | `22f75539` — `PUBLIC_SITE_URL` ha precedenza su `CF_PAGES_URL` |
| GSC proprietà `https://ombreeluci.it/` | ✅ | Aggiunta come Prefisso URL — verifica via meta tag |
| Sitemap IT inviata a GSC | ✅ | `https://ombreeluci.it/sitemap.xml` |
| Sitemap EN inviata a GSC | ⏳ | `https://ombreeluci.it/sitemap-en.xml` — in attesa crawl GSC |
| Redirect legacy 1097 URL | ✅ 100% | 1097/1097 — fix Unicode `decodeURIComponent` (ac0305e2) |
| Worker regex patterns aggiornati | ✅ | Fix-7 + /page/N/ + /YYYY/slug/ + /n-N/ + /project/ + /author/ |
| Sitelink Google (6 URL) | ✅ | Tutti risolvono: /archivio/, /sostienici/, /chi-siamo/, ecc. |
| Iubenda popup — pulsanti Accept/Rifiuta | ✅ | Config banner aggiornata con accetta/rifiuta/personalizza |
| Iubenda banner — dominio ombreeluci.it | ✅ | Widget OEL dedicato (ID `0309471a`), cookiePolicyId `64241862`. Sostituisce config fedeeluce.it. `01f5f610` |
| OG default image 1200x630 | ✅ | `public/images/og-default.jpg` — tramonto con silhouette. BaseHead punta a `/images/og-default.jpg`. `765e1d35` |
| Directus image transforms | ✅ | Tutte le immagini servite con WebP + resize. PageSpeed mobile stimato +15-20 punti. |
| CF Worker slug redirect | ✅ | `interpretazioni-disabilita` → `interpretare-la-disabilita` (slug WP vs AI). `a815ddcb` |
| UptimeRobot — aggiorna 6 monitor | ✅ | URL aggiornati a produzione via API. Nomi: 4/6 (Articolo SSR e Archivio da rinominare manualmente) |
| Mailchimp DKIM/SPF | ✅ N/A | Newsletter inviata da `ombreeluci@fedeeluce.it` — fedeeluce.it già autenticato |
| Check URL mancanti (3500 WP urls) | ⏳ | In corso — risultati a breve |
| Token CF temporaneo da revocare | ✅ | Revocato 2026-05-21 |
| icon-camera.png 403 da wp-content | ✅ | `66f8e51b` — file in `public/images/`, URL locale in IT/EN slug page |

---

## Da fare — pendenti post-lancio

### Infrastruttura sviluppo

| Task | Priorità | Note |
|---|---|---|
| **Setup seconda postazione Mac (redazione)** | ✅ Fatto | VS Code + Claude Code + GitHub Desktop installati, repo clonato, `.env` configurato. Operativa da fine maggio 2026. |
| **Documentazione setup ambiente** | ✅ Fatto | Setup completato in pratica — SETUP.md da creare se serve onboarding terze persone. |
| **Token Directus bot** | ✅ Fatto | Utente `bot@ombreeluci.it` creato in Directus con token statico fisso. Non ruotare mai — questo token va nel `.env` di tutte le macchine. I token personali (login dashboard) possono ruotare liberamente. |
| **Flow rebuild su contenuti_statici** | ✅ Fatto | Flow Directus `cb470bff` attivo: ogni modifica a `contenuti_statici` triggera rebuild automatico di CF Pages. La redazione non dovrà più triggerare manualmente il rebuild dopo aver aggiornato testi statici. |

### Privacy / Legal

| Task | Priorità | Note |
|---|---|---|
| **Contattare supporto Iubenda** | Alta | Richiedere attivazione piano Advanced su ombreeluci.it (era incluso nel preventivo originale "due siti + due lingue"). Email: support@iubenda.com. Riferire siteId fedeeluce.it `1433329` e nuovo progetto ombreeluci.it (cookiePolicyId `64241862`). |
| **Policy Iubenda in italiano** | Media | Dashboard Iubenda → ombreeluci.it → Settings → cambia lingua da EN → IT. Poi rigenera policy. |

### Contenuti / SEO

| Task | Priorità | Note |
|---|---|---|
| **hreflang focus pages** | ✅ Fatto | `VerticaleContent.astro` righe 40-42: `alternates` IT+EN già presenti. Verificato 2026-06-04. |
| **hreflang tag IT/EN** | ✅ Fatto | `alternates` IT+EN aggiunti su entrambe le route tag (`it/tag/[slug].astro` e `en/tag/[slug].astro`). 2026-06-20. |
| **Articoli WP post-migrazione — 404 sul nuovo sito** | ✅ Chiuso | Curl su 93 URL da missing-production.txt: tutti 200. File era snapshot stale. Nessun 404 reale in produzione. Verificato 2026-06-04. |
| **GSC revisione** | ✅ Fatto | Check 2026-06-20: impressioni 3.500+/giorno (picco 4.162), click 46/giorno, posizione 9.9. Crescita costante. Dettagli in `docs/SEO-MONITORING-LOG.md`. |
| **contenuti_statici valore_en categorie** | Media | 14 record gruppo `categorie` con `valore_en` null — da compilare dalla redazione. |
| **PageSpeed mobile** | Media | Eseguire test post-deploy image transforms. Stimato +15-20 punti. |
| **PERF-IMG-DIMENSIONS** | Media | Immagini senza width/height espliciti → CLS. |
| **Ricalcolo correlati K=30** | ✅ Fatto | `correlati.json` rigenerato 2026-06-20: cosine similarity su embedding 3072-dim (non più euclidea su UMAP 3D), K=30 (era 5), solo slug IT. 3488 articoli, 3.7MB. Script aggiornato: `scripts/genera_correlati.py`. |

### Infrastruttura tecnica

| Task | Priorità | Note |
|---|---|---|
| **Assisi 1986 gallery** | Bassa | 28 immagini `oel14-gallery-XXX.jpg` da migrare su R2. wp-content proxy non funziona per questi. |
| **UptimeRobot rename** | Bassa | Monitor "Articolo SSR" e "Archivio" ancora con "(staging)" nel nome — rinominare manualmente. |
| **CF Cache & Security audit** | ✅ Fatto | Audit completo 2026-06-21: Transform Rule cache immutable su asset statici, Cache Rules edge TTL, SSL strict, TLS 1.2 min, Early Hints, 0-RTT, Always Online, Hotlink Protection. Cache rate da 0.02% → 60-80% atteso. Dettagli: `docs/CF-AUDIT-2026-06-21.md`. |
| **SLUG-EN joyeux-noel-2-en** | Bassa | 1 slug residuo con `-en`. Route a due tentativi lo gestisce ma andrebbe normalizzato. |

---

## Fix sessione 2026-05-26 — GSC cleanup redirect e canonical

| Commit / Deploy | Area | Fix |
|---|---|---|
| `62ad08da` + deploy `70765efb` | Worker Rule M+N | `/archivio/(oel\|ins)-N/` e `/autori/slug/` senza `/it/` → 301 |
| `fd02b7b1` | Middleware Fix-7 | `/it/ombre(-e)?-luci-n-N-YYYY-sfogliabile/` → `/it/archivio/oel-N/` |
| `ac0305e2` + deploy `86c5ed24` | Worker Unicode | `decodeURIComponent(path)` prima del lookup REDIRECTS — fix `/メリークリスマス/` e `/c-poждеctbom/`. Redirect legacy: 1097/1097 (100%) |
| Directus PATCH | CMS | Bio Chiara Gatti: `href="emdr.it"` → `href="https://www.emdr.it"` (bio_html IT + bio_en) |
| `01965994` + deploy `bd787f99` | Worker Rule O+P | `/blog/slug-en/` → `/en/slug/`, `/blog/slug/` → `/it/slug/` |
| `77a58472` + deploy `50aa6113` | Worker Rule Q | `/categoria/slug/` → `/it/categoria/slug/` |
| `1b04bad4` | BaseHead + middleware | Canonical trailing slash normalization in `rawPathname` (BaseHead). Rimossa dal middleware in commit successivo. |
| `4e9f0b43` + deploy `c75dd3bb` | Worker Rule R | `/it/*` e `/en/*` senza trailing slash → 301 con slash. Logica corretta nel Worker (non nel middleware — `forwardToPages` inglobava silenziosamente il redirect). |

GSC validazioni inviate 2026-05-26:
- Bloccata 403 (75) → Convalida correzione
- Non trovata 404 (128) → Convalida correzione
- Errore di reindirizzamento (1) → Convalida correzione
- Esclusa in base al tag noindex (58) → Convalida correzione
- Pagina duplicata canonical diverso (54) → Convalida correzione

---

## CF Worker — regole redirect attive (ultimo deploy `c75dd3bb`)

Ordine: C+D → B → E → F → F2 → G → H → I → J → K → L → M → N → O → P → Q → R → forwardToPages

| Rule | Pattern | Target | Note |
|---|---|---|---|
| C+D | lookup table + Unicode decode | redirects-legacy.json | 1097 voci |
| B | `/YYYY/MM/DD/slug/` | `/it/slug/` | permalink WP con data |
| E | `/page/N/` | `/it/archivio/` | pagine WP paginate |
| F | `/YYYY/slug/` | `/it/slug/` | permalink WP anno-only |
| F2 | `/en/YYYY/slug/` | `/en/slug/` | EN permalink WP con anno |
| G | `/n-N/` | `/it/archivio/oel-N/` | shortlink numeri |
| H | `/project/numero-N-*/` | `/it/archivio/oel-N/` | project WP numerati |
| I | `/project/*` | `/it/archivio/` | project WP generici |
| J | `/author/slug/` | `/it/autori/slug/` | tassonomia WP author |
| K | `/diario-di-*/` | `/it/diari/diario-di-*/` | backward compat diari |
| L | `/insieme/insieme-n-N/` | `/it/archivio/ins-N/` | numeri Insieme legacy |
| M | `/archivio/(oel\|ins)-N/` | `/it/archivio/$1/` | archivio senza `/it/` |
| N | `/autori/slug/` | `/it/autori/slug/` | autori senza `/it/` |
| O | `/blog/slug-en/` | `/en/slug/` | EN legacy WP con `-en` |
| P | `/blog/slug/` | `/it/slug/` | IT legacy WP |
| Q | `/categoria/slug/` | `/it/categoria/slug/` | categoria senza `/it/` |
| R | `/it/*` e `/en/*` senza trailing slash | stessa URL + `/` | canonical SEO |

---

## Fix sessione 2026-05-24 — home rotation, UptimeRobot

| Commit / Azione | Area | Fix |
|---|---|---|
| `45fb734b` | **Home Recenti — rotazione** | Sezione home-hero-grid (articolo featured + 6 sidebar) ora ruota a ogni visita. Pool `latestArticles` 7→25 in `index.astro` (IT+EN). Aggiunto `<script id="recenti-pool">` JSON + funzione `initRecentiPool()` in `HomePageContent.astro`: Fisher-Yates shuffle, aggiorna featured + sidebar ogni visita. |
| `45fb734b` | **Hero slider — fix shuffle** | Bug: condizione `pool.length > 4` impediva il shuffle quando il pool aveva esattamente 4 articoli (JSON non generato, JS non girava). Fix: cambiato a `>= 4` sia nel template che nel JS. |
| (UptimeRobot API) | **CMS ping monitor** | `keyword_type` 1→2. Era configurato al contrario: alertava quando `pong` era TROVATO invece che assente. Il CMS funzionava correttamente da sempre, falso allarme da 19 giorni. |
| (UptimeRobot API) | **Health endpoint monitor** | Stesso bug: `keyword_type` 1→2. L'endpoint `/api/health` risponde `{"status":"ok"}` correttamente. |
| (UptimeRobot API) | **Nomi monitor** | "Articolo SSR (staging)" → "Articolo SSR (produzione)". "Archivio (staging)" → "Archivio (produzione)". |

---

## Fix sessione 2026-05-22/24 — redirect loop, home hero rotation

| Commit | Area | Fix |
|---|---|---|
| `4b33839e` | **`/en/about/` loop** | Rimossa entry `"/en/about/": "/en/about/"` da `redirects-legacy.json`. Era stata aggiunta per errore durante la migrazione legacy e causava un loop infinito: il middleware intercettava il path e faceva redirect a se stesso (200 con meta refresh). |
| `8011aeb8` | **Home hero rotation pool** | Pool articoli hero slider: 16 → **50 articoli**, finestra temporale 24 → **36 mesi**, ruoli inclusi: portante + strutturale → **+ laterale**. Impatto performance trascurabile (~12KB HTML extra, zero HTTP aggiuntivi). Fix applicato sia a `src/pages/index.astro` che a `src/pages/en/index.astro`. |

---

## Fix sessione 2026-05-22 — Directus UX, redirect autore, contenuti statici

| Commit / Azione | Area | Fix |
|---|---|---|
| (middleware.ts) | **Redirect autore** | `/it/autori/pierfrancesco-depaolis/` → 301 `/it/autori/pierfrancesco-de-paolis/`. Il fix precedente aveva aggiornato solo il dato in Directus; mancava il redirect per il vecchio URL. |
| (Directus API) | **categoria_menu_2 — allowNone** | Aggiunto `allowNone: true` al campo `categoria_menu_2`. Da ora la redazione può azzerare il secondo tema dopo averlo impostato (voce vuota in cima al dropdown). Script: `scripts/fix-secondo-tema-e-rebuild-flow.mjs`. |
| (Directus API) | **categoria_menu_2 — rimozione catechesi** | `catechesi` rimossa dalle choices di `categoria_menu_2` (categoria migrata in spiritualità 2026-05-13). |
| (Directus API) | **categoria_menu — rimozione catechesi** | `catechesi` rimossa anche dalle choices del tema primario `categoria_menu` (era rimasta nel dropdown). |
| (Directus API) | **Flow contenuti_statici** | Flow "Rebuild sito su aggiornamento contenuti_statici" verificato attivo (id: `96434e02`). Hook CF Pages: `94f27b2c` — risponde 200. Ogni modifica a `contenuti_statici` triggera rebuild automatico (~3 min). |
| (script) | **fix-secondo-tema-e-rebuild-flow.mjs** | Nuovo script diagnostico/fix: verifica e applica `allowNone` su `categoria_menu_2`; verifica o crea il Flow rebuild per `contenuti_statici`. |
| (.env.local) | **Variabili ambiente** | Creato `.env.local` (gitignored) con tutte le variabili necessarie agli script: `DIRECTUS_TOKEN`, `DIRECTUS_URL`, `CF_DEPLOY_HOOK`, Algolia, Mailchimp. |

---

## Fix sessione 2026-05-22 — SEO, Iubenda, immagini, icon-camera

| Commit / Azione | Area | Fix |
|---|---|---|
| `765e1d35` | **OG image** | `public/images/og-default.jpg` (1200×630) aggiunto. BaseHead usa `/images/og-default.jpg` come default og:image. |
| `01f5f610` | **Iubenda** | Widget ombreeluci.it dedicato (ID `0309471a`, cookiePolicyId `64241862`). Sostituisce config fedeeluce.it. Banner mostra "ombreeluci.it". Piano Free — Advanced da richiedere a supporto. |
| `66f8e51b` | **icon-camera** | `icon-camera.png` (124×124) scaricata da Aruba e salvata in `public/images/`. Rimosso URL hardcoded `www.ombreeluci.it/wp-content/` da `it/[slug].astro` e `en/[slug].astro`. |
| (directus.ts) | **Image transforms** | Tutte le immagini Directus ora servite con WebP + resize. Author photo: 1.4MB → ~10KB. |
| (CF Worker) | **Slug redirect** | `interpretazioni-disabilita-al-far-east-festival` → `interpretare-la-disabilita-al-far-east-festival`. |
| (GitHub) | **Secret scanning** | Token CF `cfut_v8gH…` revocato su Cloudflare. Bypass GitHub secret scanning approvato. |

---

## Fix sessione 2026-05-21 — Home diari, articolo mobile, EN Close Up

| Commit / Azione | Area | Fix |
|---|---|---|
| `00eadf93` | **Home diari** | Griglia da 2 a 3 colonne; limite card da 4 a 8. |
| `9668ca8f` | **Home diari** | Rimosso filtro che escludeva Davide Passeri; ordinamento per data articolo decrescente (dal più recente). |
| `161b5ca9` | **Home diari mobile** | Griglia 2 colonne su tutto il mobile (rimosso breakpoint 480px→1col aggiunto per errore). |
| `72f3fb5b` | **Home diari mobile** | Fix bug preesistente: `@media (max-width:480px)` nel file aveva `.home-diari-grid{grid-template-columns:1fr}` che sovrascriveva il fix — corretto a `repeat(2,1fr)`. |
| `ee904d59` | **Home diari titolo** | "Tutte le storie →" sostituito con heading Ultra + IconDiari: "I Diari di Ombre e Luci". `home-tagline` → `display:none`. |
| `38b1d666` | **Articolo mobile** | `@media (max-width:480px)`: `.article-title` 1.5rem→2rem, `.article-subtitle` 1rem→1.3rem. Base desktop invariata. |
| `2d74a425` → `22b0ac46` | **EN home Close Up** | Sezione Close Up EN ora mostra versioni EN degli articoli dei diaristi (stesso ordinamento IT: per data decrescente, max 8). Prima mostrava 4 articoli EN casuali post-hero. Link a `/en/{slug}`. |
| (Directus PATCH) | **Dati** | Slug autore Pierfrancesco De Paolis corretto: `pierfrancesco-depaolis` → `pierfrancesco-de-paolis`. Causa 404 su `/it/autori/pierfrancesco-de-paolis`. |

**Nota architetturale EN Close Up:** i diari non hanno traduzioni EN sistematiche — se un diarista non ha articoli EN nel pool, viene escluso dalla griglia. Card visibili = diaristi con almeno 1 articolo EN pubblicato.

---

## Stato pre-cutover al 2026-05-18 — tutto il lavoro pre-venerdì completato

| Task | Stato | Commit / Azione |
|---|---|---|
| B-WORKER: forwardToPages | ✅ | `ac1782b7` + deploy `8608ac3b` |
| B-15: noindex sweep + robots.txt | ✅ branch pronto | `171ff27d` su `fix/cutover-noindex` — merge venerdì 22 |
| B-16: sitemap completa | ✅ | `f6ddc5aa` — IT 4089 URL, EN 4068 URL |
| Iubenda banner in BaseHead | ✅ | `c19943fd` — `is:inline`, siteId 1433329 |
| GA4 G-2TJV78DNFQ in BaseHead | ✅ | `edac44e5` — `is:inline` sul secondo script |
| Redirect temporaneo apex→www | ✅ | CF Worker — mantiene WP visibile fino a venerdì |
| PUBLIC_SITE_URL in CF Pages env | ✅ | `https://ombreeluci.it` in produzione |
| GSC proprietà esistente | ✅ | Proprietà `ombreeluci.it` già presente in Search Console |
| Health check Directus | ✅ | `190930d9` — localhost → 127.0.0.1 |
| MX record documentati | ✅ | `10 mx.ombreeluci.it.` (8 IP Aruba), SPF verificato |

| Redirect Fix 1-6 (regex middleware) | ✅ | `b209c37e` — copertura da 0.5% a 97.3% |
| Redirect Fix 7 (96 URL singoli legacy.json) | ✅ | `fd20fed8` — copertura finale 99.8%, 0 MISSING |
| Redirect correzioni 7 destinazioni | ✅ | `5d7dc626` — autismo/cinema/aktion-t4→focus, dopo-di-noi/vita-comunitaria→tag |
| Fix algolia bundle oversize | ✅ | `ed596ad6` — SDK → fetch REST dirette; Worker 1.4MB→1.1MB (165KB gzip) |
| Fix CTA hardcodata IT su pagine EN | ✅ | `32170b12` — CTAArticolo + CTAArchivio + HomepageContent `/en/support-us/` |
| Correlati EN — indice statico | ✅ | `81f14483` — 3457 voci slug_en→slug_it; prebuild auto `f77a92c0` |
| /riflessioni/ destinazione confermata | ✅ | `c6e46b28` — → `/it/rubriche/testimonianze/` (approvato redazione) |
| /attualita/ destinazione confermata | ✅ | `c6e46b28` — → `/` homepage (approvato redazione) |

**Tutto il lavoro pre-venerdì è completato. Restano solo le operazioni del giorno del cutover.**

---

## Debt tecnico — post-lancio

| Task | Priorità | Note |
|---|---|---|
| Ricalcolo correlati | ✅ Fatto | `correlati.json` rigenerato 2026-06-20 con cosine similarity K=30 su embedding 3072-dim. Articoli futuri: Fase 4 roadmap (pgvector live). |
| SLUG-EN normalizzazione | Bassa | 1 slug residuo con `-en`: `joyeux-noel-2-en`. Route a due tentativi lo gestisce. |
| Correlati EDIT in Directus | Bassa | Nessun modo per la redazione di correggere correlati sbagliati. |
| DIARI-MANCANTI | Bassa | Alcuni articoli non associati al diario corretto — lavoro editoriale. |
| PERF-IMG-DIMENSIONS | Media | Immagini senza width/height espliciti → CLS. Impatto PageSpeed post-lancio. |
| Speed test PageSpeed | Media | Da eseguire entro T+24h dopo il lancio (bug_ux_ui.md). |
| LIST-PREVIEW Directus | Bassa | Link diretto "Vedi sul sito" nella lista articoli Directus. |

---

## Piano venerdì 22 maggio — sequenza operazioni cutover SEO

Da eseguire in questo ordine:

1. **Rimuovi redirect temporaneo apex→www dal Worker e rideploya**
   - `cf-worker/redirect-worker.js` — rimuovere la regola temporanea, `npx wrangler deploy`
2. **Merge `fix/cutover-noindex` su main** — `git merge fix/cutover-noindex && git push`
   - CF Pages rebuild automatico (~3 min) — attendi build verde
3. **Attiva custom domain `ombreeluci.it` e `www.ombreeluci.it` in CF Pages**
   - Dashboard CF Pages → ombreeluci-staging → Custom domains → attiva
4. **Crea CF Redirect Rule www→apex 301**
   - CF Dashboard → Zone ombreeluci.it → Rules → Redirect Rules → `www.ombreeluci.it/*` → `https://ombreeluci.it/{1}` (301)
5. **Verifica propagazione, email, sitemap** — seguire CUTOVER.md FASE 3
6. **Aggiungi proprietà `https://ombreeluci.it` in GSC e invia sitemap**
   - Search Console → Aggiungi proprietà → TXT su Cloudflare DNS
   - Invia `https://ombreeluci.it/sitemap.xml` e `https://ombreeluci.it/sitemap-en.xml`

---

## Fix sessione 2026-05-18 — Infrastruttura e cutover

| Commit / Azione | Area | Fix |
|---|---|---|
| `ac1782b7` | **B-WORKER** ✅ | CF Worker: catch-all WP proxy sostituito con `forwardToPages(request, env)`. Causa outage: DNS già su CF, Worker tentava fetch a IP raw Aruba → CF error 1003. Deployato via wrangler. `ombreeluci.it` ora serve Astro (200 OK). |
| `190930d9` | **Infra** ✅ | Health check Directus: `localhost` → `127.0.0.1` in docker-compose. False negative da 29 giorni. Container ricreato, Status: healthy. |
| `3c0674ee` | **Docs** ✅ | RUNBOOK.md: sezione swap post-cutover (istruzioni condizionate a RAM < 500MB). |
| `d5773455` | **Docs** ✅ | `docs/PRE-CUTOVER-ANALYSIS.md` e `docs/CUTOVER.md` creati. Piano cutover 22 maggio. |
| (audit) | **DNS** ℹ️ | Scoperto: NS `ombreeluci.it` già su Cloudflare (dana/julio). Zone: active. Il "cutover DNS" è già avvenuto. B-TTL e CF DNS setup non più necessari. |
| (audit) | **MX** ✅ | Record MX documentati: `10 mx.ombreeluci.it.` → 8 IP Aruba (62.149.128.x). SPF: `v=spf1 include:aruba.it ~all`. TTL già ~300s. |

---

## REDIRECT-LEGACY — Audit e fix completo (2026-05-19)

**Fonte dati:** 3.500 URL dalla sitemap WP (4 post-sitemap + page + project + category).
**Metodo:** simulazione locale `scripts/verify-redirects-local.mjs` — no HTTP request.
**Documenti:** `docs/REDIRECT-AUDIT.md`, `scripts/redirect-report.md`.

### Scoperta critica: il WP usa `/YYYY/{slug}/` non `/YYYY/MM/DD/{slug}/`

Il permalink di ombreeluci.it usa solo l'anno (es. `/1983/dialogo-aperto-n-1/`).
Il middleware aveva regex per `/YYYY/MM/DD/` (zero URL reali) ma non per `/YYYY/` (84% del traffico).
Prima dei fix: **16/3.499 URL coperti (0.5%)**.

### Fix applicati

| Fix | Pattern | URL coperti | Layer | Commit |
|---|---|---|---|---|
| Fix-1 | `/YYYY/{slug}/` → `/it/{slug}/` | 2.928 | `YEAR_SLUG_RE` in middleware | `b209c37e` |
| Fix-2 | `/en/YYYY/{slug}/` → `/en/{slug}/` | 54 | `EN_YEAR_SLUG_RE` in middleware | `b209c37e` |
| Fix-3 | `/project/numero-N-{titolo}/` → `/it/archivio/oel-N/` | 129 | `PROJECT_NUMERO_RE` in middleware | `b209c37e` |
| Fix-3b | `/project/*` → `/it/archivio/` | 77 | `PROJECT_ANY_RE` in middleware | `b209c37e` |
| Fix-4 | `/n-N/` → `/it/archivio/oel-N/` | ~150 | `NUMERO_SHORT_RE` in middleware | `b209c37e` |
| Fix-5 | `/insieme/insieme-n-N/` → `/it/archivio/ins-N/` | ~30 | `INSIEME_RE` in middleware | `b209c37e` |
| Fix-7 | 96 URL singoli (categorie, rubriche, autori, EN, utility) | 96 | `redirects-legacy.json` (+93 voci) | `fd20fed8` |
| Fix-7b | 7 correzioni destinazioni (focus, tag) | — | `redirects-legacy.json` | `5d7dc626` |

### Risultato finale

| Metrica | Prima | Dopo |
|---|---|---|
| URL WP analizzati | 3.499 | 3.499 |
| ✅ OK | 16 (0.5%) | **3.493 (99.8%)** |
| 🔴 MISSING | 3.483 (99.5%) | **0 (0.0%)** |
| 🟠 TO_HOMEPAGE (intenzionali) | 0 | 6 (0.2%) |

**Voci in `redirects-legacy.json`:** 1.001 → **1.097** (+96)

### Da fare post-lancio

- `/riflessioni/` → `/it/archivio/` (**provvisorio** — la redazione decide la sezione corretta)
- `/attualita/` → `/it/archivio/` (**provvisorio** — idem)
- Rieseguire `scripts/verify-redirects-local.mjs` dopo ogni aggiornamento WP significativo

---

**Fix sessione 2026-05-14** (precedente):
- `3cc4f72a` BUG-REGEX: Commenti.astro TypeScript in define:vars → SyntaxError su tutti gli articoli. Fix: rimosso.
- `c3a0307b` Homepage sidebar Recenti non mostra più l'articolo hero; ArticleCard horizontal display:flex + width 220px
- `891f975a` Articolo: author-row ristrutturato, CTA "Contribuisci" button, archival-alert lowercase, floating-widget rimosso
- `d568b734` Rimosso pulsante "Modifica in Directus" + fetch /users/me (401 console), will-change cleanup
- `f18f898f` article-badge-role display:none

---

## Audit immagini mancanti (2026-05-14) — solo lettura

| Metrica | Valore |
|---|---|
| File totali in Directus (`directus_files`) | **3429** |
| File con `filesize ≤ 0` (corrotti/vuoti) | **0** |
| Articoli totali | **6971** |
| Articoli con `immagine_copertina` valorizzata | **5864** |
| Articoli senza copertina (usa placeholder) | **1107** |
| Articoli con copertina → file UUID mancante | **0** |
| Numeri rivista totali | **205** |
| Numeri rivista con campo `copertina` (file) valorizzato | **1** (OEL-173) |
| Numeri rivista con copertina → file UUID mancante | **0** |

**Conclusione: nessun file corrotto, nessun riferimento rotto.** Tutti i 5864 articoli con immagine_copertina puntano a file validi esistenti. I 1107 articoli senza copertina sono in stato normale (mostrano placeholder in frontend). I 204 numeri rivista senza campo `copertina` usano il campo `copertina_url` (URL esterno R2 — non verificato in questo audit).

**Nota tecnica:** `meta.total_count` in Directus 11 restituisce sempre il totale della collection ignorando i filtri — usare `meta.filter_count` per conteggi filtrati corretti.

---

## BUG-REGEX — Articoli con pattern `(?` nel corpo (2026-05-14)

Ricerca `_contains=(?)` su tutti gli articoli IT tramite Directus API.

| Slug | Pattern | Posizione | Contesto |
|---|---|---|---|
| `punti-incontro-servire-giocare-lavorare-riflettere` | `(?!)` | pos 4844 | `"è difficile perdonare (?!) al Signore quando siamo colpiti da grandi disgrazie"` — interrobang letterario |
| `storie-di-lavoro-chi-sarei-se-potessi-essere-la-condizione-adulta-del-disabile-mentale` | `(?)` ×5 | pos 933–999 | `"malattia (?), menomazione (?), stigma (?), peculiarità (?), caratteristica (?)"` — domanda retorica tra parentesi |

**Questi pattern `(?` sono testo letterario, non codice.** Non causano errori di rendering nel browser: il testo HTML non viene interpretato come regex. L'unico rischio teorico è se finiscono dentro un template string JS (`\`...\``) o in un attributo `data-*` usato poi come regex — non è il caso qui.

**Articolo `un-pellegrinaggio-significativo`** (segnalato in console come `:74:18`): corpo di 2098 char, **completamente pulito** — nessun `(?`, `\(`, `url(`, backslash o pattern CSS problematici. Autore: Antonietta Pantone. L'errore CSS `missing ) in parenthetical` non viene dal contenuto dell'articolo ma dalla pagina renderizzata (linea 74 del HTML compilato). Causa esatta non determinata senza DevTools live.

**Pattern `\(` / `\)` nel corpo**: non ricercabili via Directus `_contains` (l'API rifiuta backslash nei filtri con 400). Nessuna `url(` CSS nel corpo (0 risultati).

**Azione richiesta dalla redazione:** nessuna urgente. I due articoli con `(?` usano punteggiatura letteraria normale — nessuna modifica necessaria.

---

## BUG-REGEX — Root cause identificata (2026-05-14)

**Causa:** `src/components/Commenti.astro` riga 149 ha TypeScript puro in uno script `define:vars`:

```ts
charsLeft: (n: number) => _isEn ? `${n} characters remaining` : `${n} caratteri rimanenti`,
```

Gli script `<script define:vars={{ ... }}>` in Astro **non vengono compilati da Vite/TypeScript** — vengono inseriti come inline raw nell'HTML. Il browser riceve `(n: number)` e fallisce con `SyntaxError: missing ) in parenthetical` alla posizione della `:` in `n: number` (col 18, riga ~74 del documento renderizzato).

**Non è article-specific.** L'errore appare su TUTTI gli articoli con commenti abilitati. La riga varia (74, 76, ecc.) perché dipende dalla lunghezza del corpo dell'articolo che precede lo script nel documento HTML.

**Fix necessario (non implementato in questo audit):**
```ts
// Commenti.astro riga 149 — rimuovere `: number`
charsLeft: (n) => _isEn ? `${n} characters remaining` : `${n} caratteri rimanenti`,
```

**File:** `src/components/Commenti.astro:149`

---

## DIRECTUS-FALLBACK — Resilienza build SSG a Directus 503 (2026-05-14)

| Funzione | Fix |
|---|---|
| `getAllNumeriRivista()` | try/catch → `[]` su errore/503 |
| `getAllAutori()` | try/catch → `[]` su errore/503 |
| `getAllSerieDiari()` | try/catch → `[]` su errore/503 |
| `getContenutiStatici()` | try/catch → `{}` su errore/503 |
| `ArchivioContent.astro` | `ultimoNumero` reso nullable + fallback visivo se `numeriOrdinati.length === 0` |

**Fix 5 (hero grid dedup) — non un bug:** la colonna sinistra e destra del hero grid usano lo stesso array `latestArticles` by design. La destra è la lista di selezione, la sinistra il big view. `usedSlugs` deduplica correttamente rotationPool vs latestArticles.

---

## PERF-SSR — Parallelizza fetch articolo + correlati (2026-05-14)

| File | Cambio | Risparmio atteso |
|---|---|---|
| `it/[slug].astro` | `Promise.all([getArticoloBySlug, fetch(correlati.json)])` | ~100ms (1 round-trip Directus eliminato dalla catena critica) |
| `en/[slug].astro` | Stesso pattern; lookup a 2 tentativi rimane sequenziale (necessario) | ~100ms caso normale (slug EN diretto) |

**Caso normale IT:** 2 richieste → ora in parallelo, poi 1 sequenziale per correlati = **~200ms** invece di ~300ms
**Caso peggiore IT (no correlati):** `Promise.all` + 2 fallback sequenziali = **~400ms** invece di ~500ms
**Caso normale EN (slug diretto):** `Promise.all` + correlati = **~200ms** invece di ~300ms
**Caso peggiore EN (slug+'-en'):** secondo tentativo sequenziale + correlati = **~300ms** invece di ~400ms

Gate:
- [x] `npm run build` verde
- [x] tsc zero errori (incluso nel build)
**Staging:** https://ombreeluci-staging.pages.dev
**CMS:** https://cms.ombreeluci.it
**Repo:** SegreteriaFL/ombreeluci-astro

---

## DIARI-REDESIGN — Hub griglia, hero diario, fascia articolo (2026-05-13)

| Task | Stato | Note |
|---|---|---|
| Font Ultra self-hosted | ✅ | `public/fonts/ultra-latin.woff2` + `ultra-latin-ext.woff2`, `@font-face` in global.css |
| DiariContent.astro redesign | ✅ | Griglia 2 colonne, titoli in Ultra, eyebrow 📖 I DIARI, separatori orizzontali |
| DiarioContent.astro redesign | ✅ | Hero azzurro (--diari-bg), illustrazione circolare 200px, titolo Ultra 3.25rem, bio 3 righe clamp, griglia 3 colonne. Fix backHref (`/sezioni/diari` → `/it/rubriche/diari/` e `/en/sections/diaries/`) |
| DiarioBadge.astro | ✅ | Fascia sottile in cima all'articolo: 📖 I DIARI · NomeDiario · di Autore |
| Fascia in it/[slug].astro | ✅ | Usa `articolo.serie?.nome` o fallback da DIARISTI; attiva solo se autore è diarista |
| Fascia in en/[slug].astro | ✅ | Stessa logica, path EN |

**Gate:**
- [x] `npm run build` verde, zero errori
- [x] `/it/rubriche/diari/` — hub griglia 2 colonne con Ultra
- [x] `/it/diari/diario-di-arianna/` — hero azzurro + griglia 3col
- [x] Articolo di diarista — fascia DiarioBadge visibile
- [x] Articolo non-diarista — fascia assente
- [x] EN funzionanti (`/en/sections/diaries/`, `/en/diaries/diario-di-arianna/`)

---

## UX-REDAZIONE-01 — Fix bug redazione (2026-05-13)

| Task | Stato | Note |
|---|---|---|
| Rimuovi Di/By prima autori | ✅ | ArticleCard.astro + ArticoliRullo.astro |
| Fix link rotti Chi siamo | ✅ | 4 blocchi La Rivista + 3 link timeline |
| Flow Directus rebuild su contenuti_statici | ✅ | Script `setup-static-rebuild-flow.mjs` (eseguire con CF_DEPLOY_HOOK) |
| Migra catechesi → spiritualità | ✅ | categorie.json + taxonomy_structure.json + redirect middleware + script `migrate-catechesi.mjs` |
| Fix conteggio articoli autori (doppio) | ✅ | directus.ts: filter[lang][_eq]=it |
| Link "Tutti gli autori" in pagina autore | ✅ | AuthorPageContent.astro |
| Pagine autore IT/EN → SSR | ✅ | prerender=false, getArticoliByAutoreSlug() |
| Correlati EN con fallback slug IT | ✅ | en/[slug].astro + getArticoliEnByItSlugs() |
| Script fix UTF-8 contenuti_statici | ✅ | `fix-utf8-contenuti-statici.mjs` (eseguire con DIRECTUS_TOKEN) |
| Mappa contatti Chi siamo | ✅ | Google Maps iframe + indirizzo corretto |

**Script one-time da eseguire su staging:**
```bash
# 1. Migrazione catechesi → spiritualità in Directus
DIRECTUS_TOKEN=xxx DIRECTUS_URL=https://cms.ombreeluci.it node scripts/migrate-catechesi.mjs

# 2. Fix UTF-8 in contenuti_statici
DIRECTUS_TOKEN=xxx node scripts/fix-utf8-contenuti-statici.mjs

# 3. Setup Flow Directus per rebuild automatico
DIRECTUS_TOKEN=xxx CF_DEPLOY_HOOK=https://api.cloudflare.com/... node scripts/setup-static-rebuild-flow.mjs
```

---

## CI-STABILITY — Hardening dipendenze e workflow (2026-05-13)

**Motivazione:** instabilità percepita su staging — un aggiornamento di dipendenze o un cambio minore poteva rompere il build senza preavviso.

**Interventi completati:**

| File | Modifica |
|---|---|
| `package.json` | Tutti `^`/`~` rimossi — versioni esatte dal lock file. Campo `engines.node: "20.x"`. Script `predeploy`. |
| `.npmrc` | Aggiunto `save-exact=true` — futuri `npm install pkg` non aggiungono `^` |
| `.node-version` | `20` → `20.19.0` — versione specifica per CF Pages e nvm |
| `scripts/predeploy-check.mjs` | Nuovo — verifica Node, lock file, versioni esatte, TypeScript prima di ogni push |
| `scripts/copy-correlati.mjs` | Nuovo — rimpiazzo ESM del fragile `node -e "require(...)"` nel prebuild |
| `.github/workflows/*.yml` | `timeout-minutes` su tutti i job, `actions/*` pinnate a SHA esatto |
| `.github/dependabot.yml` | Nuovo — PR automatiche minor/patch ogni lunedì |
| `WORKING.md` | Sezione "Gestione dipendenze" con procedura completa |

**Gate verificati:**
- [x] Tutte le versioni in package.json esatte (no `^`/`~`)
- [x] `package-lock.json` committato e non in `.gitignore`
- [x] `engines.node: "20.x"` in package.json
- [x] `.node-version = 20.19.0`
- [x] `save-exact=true` in `.npmrc`
- [x] Tutti i workflow hanno `timeout-minutes`
- [x] `actions/checkout`, `actions/setup-node`, `actions/upload-artifact` pinnate a SHA
- [x] Dependabot configurato
- [x] WORKING.md aggiornato con procedura dipendenze

**SHA actions al momento del pin (2026-05-13):**
- `actions/checkout@v4` → `34e114876b0b11c390a56381ad16ebd13914f8d5`
- `actions/setup-node@v4` → `49933ea5288caeca8642d1e84afbd3f7d6820020`
- `actions/upload-artifact@v4` → `ea165f8d65b6e75b540449e92b4886f43607fa02`

---

## TRANS-FLOW-02 — Fix JSON parsing robusto (2026-05-09)

**Problema:** Flow "Import traduzione da JSON" falliva con `json_traduzione non è un JSON valido: Expected ',' or '}' after property value in JSON at position 716`. Causa: Claude a volte restituisce JSON con newline non escapate o wrappato in code fences.

**Soluzione implementata:**

1. **Prompt export migliorato** (`scripts/setup-export-flow.mjs`):
   - Sezione critica esplicita sui requisiti di escaping JSON
   - Istruzioni su virgolette, newline, backslash
   - Divieto esplicito di code fences markdown

2. **Import flow robusto** (`scripts/setup-import-flow.mjs`):
   - Rimozione automatica markdown code fences (` ```json ... ``` `)
   - Fix euristico per newline non escapate dentro le stringhe
   - Diagnostica dettagliata: in caso di errore mostra 50 caratteri di contesto intorno alla posizione

**Script eseguiti:**
```bash
node scripts/setup-export-flow.mjs  # riconfigura flow export
node scripts/setup-import-flow.mjs  # aggiorna Run Script import
```

**Documentazione aggiornata:** `docs/TRANS-FLOW-01-setup.md`

---

## Smoke test CLASSIF-01 (2026-05-08 — branch feat/classificazione-cleanup)

Test eseguiti su preview CF Pages (`feat-classificazione-cleanup.ombreeluci-staging.pages.dev`) e su main staging per SSR.

| Test | URL | Esito | Note |
|------|-----|-------|------|
| 1 — Categoria ombre-e-luci | `/it/categoria/ombre-e-luci/` | ✅ 200 | SSG, preview branch |
| 2 — Badge categoria articolo IT | `/it/ombre-e-luci/` | ⚠️ non verificabile | SSR rotto su preview deployment (vedi sotto) — su main staging badge link OK: `/it/categoria/*` |
| 3 — Megamenu contiene ombre-e-luci | `/` | ✅ presente | Preview branch: 14 categorie, inclusa `ombre-e-luci` (vs 13 su main) |
| 4 — Categoria famiglia | `/it/categoria/famiglia/` | ✅ 200 | SSG, preview branch |
| 5 — Categoria EN family | `/en/category/family/` | ✅ 200 | Preview branch |
| 6 — Language switcher IT→EN | `/it/la-nostra-buona-novella` | ✅ corretto | Main staging: `hreflang="en"` punta a `/en/good-news-for-us-all`, non alla homepage EN |
| 7 — Build preview | CF Pages preview | ✅ deployato | SSG OK; SSR rotto solo su deployment preview (vedi sotto) |

**Anomalia rilevata — SSR `[object Object]` sul preview deployment:**
Tutti i percorsi SSR (`/it/[slug]`, `/en/[slug]`) sul preview branch restituiscono `[object Object]` (15B).
Causa: noto problema CF Pages con `nodejs_compat` su preview deployment (documentato in WORKING.md).
Non è un bug del codice CLASSIF-01 — i file modificati (categoria.astro, taxonomy.js, directus.ts, i18n.ts, content/config.ts, en/[slug].astro) sono tutti SSG o non cambiano la pipeline SSR.
Main staging (deployato da main) non ha questo problema.
**Azione richiesta:** fare merge su main → smoke test completo su `ombreeluci-staging.pages.dev` per confermare SSR post-merge.

---

## Stato attuale verificato (aggiornato 2026-05-04)

| Verifica | Esito |
|----------|-------|
| Home IT `/` | ✅ 200, SSG |
| Home EN `/en/` | ✅ 200, `HomePageContent.astro` |
| Articolo IT `/it/{slug}/` | ✅ 200 |
| Articolo EN `/en/{slug}/` | ✅ 200, SSR, lookup a due tentativi |
| Categoria IT `/it/categoria/famiglia/` | ✅ 200 (B-14: era `/categoria/`) |
| Categoria EN `/en/category/family/` | ✅ 200, redirect a /en/ se 0 articoli published |
| Autore IT `/it/autori/{slug}/` | ✅ 200 (B-14: era `/autori/`) |
| Autore EN `/en/authors/{slug}/` | ✅ 200 |
| Lista autori IT `/it/autori/` | ✅ 200 (B-14) |
| Archivio IT `/it/archivio/` | ✅ 200, `ArchivioContent.astro` (B-14) |
| Archivio EN `/en/archive/` | ✅ 200, `ArchivioContent.astro` lang=en |
| Numero IT `/it/archivio/oel-173/` | ✅ 200, SSR live, articoli aggiornati senza rebuild |
| Numero EN `/en/archive/oel-173/` | ✅ 200, SSR live, articoli EN |
| Chi siamo IT `/it/chi-siamo/` | ✅ 200, `ChiSiamoContent.astro` (B-14) |
| About EN `/en/about/` | ✅ 200, `ChiSiamoContent.astro` lang=en |
| Sostienici IT `/it/sostienici/` | ✅ 200, `SostienicContent.astro` (B-14) |
| Support EN `/en/support-us/` | ✅ 200, `SostienicContent.astro` lang=en |
| Newsletter IT `/it/newsletter/` | ✅ 200, `NewsletterContent.astro` (B-14) |
| Newsletter EN `/en/newsletter/` | ✅ 200, `NewsletterContent.astro` lang=en |
| Cerca IT `/it/cerca/` | ✅ 200, `CercaContent.astro` (B-14) |
| Search EN `/en/search/` | ✅ 200, `CercaContent.astro` lang=en |
| Diari IT `/it/rubriche/diari/` | ✅ 200, `DiariContent.astro` (B-14) |
| Diaries EN `/en/diaries/` | ✅ 200, `DiariContent.astro` lang=en |
| Web-only IT/EN | ✅ `ArticoliRullo.astro` condiviso |
| Dialogo aperto IT/EN | ✅ `RubricaPageContent.astro` — `/rubriche/dialogo-aperto/`, `/en/sections/open-dialogue/` |
| Diari IT/EN (hub) | ✅ `/rubriche/diari/`, `/en/sections/diaries/` — `DiariContent.astro` |
| Editoriali IT/EN | ✅ `/rubriche/editoriali/`, `/en/sections/editorials/` — `RubricaPageContent.astro` |
| Interviste IT/EN | ✅ `/rubriche/interviste/`, `/en/sections/interviews/` |
| Testimonianze IT/EN | ✅ `/rubriche/testimonianze/`, `/en/sections/testimonies/` |
| Recensioni IT/EN | ✅ `/rubriche/recensioni/`, `/en/sections/reviews/` |
| Tag IT `/tag/[slug]/` | ✅ solo articoli `lang=it` (fix 2026-04-27) |
| Tag EN `/en/tag/[slug]/` | ✅ solo articoli `lang=en` |
| Redirect `/blog/*` | ✅ 301 |
| CORS Directus | ✅ |
| LanguageSelector fallback null → homepage lingua | ✅ già presente |
| IssueNavPill prev/next link | ✅ fix 2026-04-27 (era `/archivio//archivio/`) |
| Scroll orizzontale mobile | 🟡 fix deployato (2026-04-27) — da verificare su più device |
| Megamenu iOS Safari scroll-lock | 🟡 fix deployato (MOBILE-01, 2026-05-01) — da verificare su iOS Safari ≤15 |
| `.leggi-anche` img margin nell'articolo | ✅ fix 2026-04-27 |

---

## Audit Directus EN — stato reale (verificato 2026-04-25 con curl)

| Campo | Valore | Note |
|---|---|---|
| Articoli EN totali | 3470 | |
| EN published | **3470** | Tutti published — zero draft (aggiornato 2026-04-25) |
| EN draft | **0** | ✅ |
| Slug con suffisso `-en` | **1** (era 42) | 41/42 rinominati con slug inglese dal titolo EN (2026-05-06). Residuo: `joyeux-noel-2-en` (conflitto con IT `merry-christmas` — da rinominare manualmente). Route a due tentativi gestisce il residuo. |
| `articolo_traduzione` valorizzato | **3452 / 3470** (99,4%) | 18 orfani. Link IT↔EN quasi completo. |
| `categoria_menu` valorizzato | **3436 / 3470** (99%) | Valori corretti: slug IT (`famiglia`, `progetti`, ecc.) — NON tradotti in inglese. |
| `categoria_menu` NULL | **34** | Traduzioni manuali storiche pre-tassonomia. Né l'EN né l'IT collegato hanno categoria o tema_label → mostrano "Attualità" come fallback. Fix richiede assegnazione manuale in Directus (articoli Jean Vanier/L'Arche). Script di backfill: `scripts/backfill-en-categoria-menu.mjs`. |
| Slug EN sbagliati (`family`, `projects`…) | **0** | Pipeline AI ha copiato correttamente lo slug IT. |

**`/en/category/projects/`**: 235 EN con `categoria_menu = 'progetti'`, tutti published. Le pagine categoria EN sono ora popolate.

---

## Fix recenti (2026-05-09) — Session 3

| Commit | Area | Fix |
|--------|------|-----|
| (API Directus) | **ALGOLIA-05-FIX-2** ✅ | Flow Algolia ancora non scattava. **Causa:** template body usava `{{$trigger.key}}` (non esiste in Directus 11 su `items.update`). **Fix:** corretto a `{{$trigger.keys[0]}}`. Test endpoint OK. |
| (API Directus) | **OEL-52-EN** ✅ | 11 articoli EN di OEL-52 avevano `numero_rivista` sbagliato (puntavano a un altro numero). Riassegnati al numero corretto `8d50d735-c9d1-4443-9fc9-3f11eec04682`. Verifica: `/it/archivio/oel-52/` ora mostra 12 IT + 12 EN = 24 articoli. |
| (script) | **VERIFY-REDIRECTS-STAGING** ⚠️ | Test eseguito: 1001 redirect → 100% 404 su staging. **Comportamento atteso:** il middleware redirige a `ombreeluci.it` (produzione), non a staging locale. Lo script serve per test **post-cutover** sul dominio produzione. |
| (codice) | **IMG-BLURUP** ✅ | Fade-in globale per immagini lazy. CSS: `img[loading="lazy"] { opacity:0; transition:0.4s }` + classe `.loaded`. Script in BaseLayout per aggiungere `.loaded` al completamento. Background placeholder `#f5f5f5` su `ArticleCard.astro` (IssueCard l'aveva già). Build verde. |
| (script+API) | **NUMERI-EN-SYNC** ✅ | Sincronizzati 72 articoli EN ai numeri rivista corretti. Audit: 2847 IT con traduzione EN e numero → 2775 EN già allineati, 72 corretti. Script: `scripts/numeri-en-sync.mjs`. Log: `scripts/logs/numeri-en-sync-2026-05-09T16-13-07.csv`. |

### Verifica numeri prioritari post-sync

| Numero | IT | EN | Status |
|--------|----|----|--------|
| OEL-46 | 9 | 9 | ✅ allineato |
| OEL-47 | 9 | 8 | ⚠️ 1 IT senza traduzione EN |
| INS-31 | 19 | 19 | ✅ allineato |
| INS-32 | 24 | 24 | ✅ allineato |

Pagine staging verificate: `/en/archive/oel-46/`, `/en/archive/oel-47/`, `/en/archive/ins-31/`, `/en/archive/ins-32/` → tutte 200 OK.

---

## Fix recenti (2026-05-09) — Session 2

| Commit | Area | Fix |
|--------|------|-----|
| (API Directus) | **ALGOLIA-05-FIX** ✅ | Flow "Algolia sync su pubblicazione" non scattava su aggiornamenti articoli già pubblicati. **Causa:** condition `payload.stato === 'published'` passa solo quando si cambia lo stato, non quando si modifica titolo/corpo di articolo già published. **Fix:** rimossa condition (filtro vuoto `{}`). L'endpoint `/api/algolia-sync` gestisce già articoli non-published (li rimuove dall'indice). Test manuale: articolo `lanno-della-disabilita-nelle-serie-tv` aggiornato OK. |
| (codice) | **EDIT-BTN-FIX** ✅ | Pulsante "Modifica in Directus" non appariva. **Causa:** i cookie di sessione Directus non vengono inviati cross-site (manca `SameSite=None` sul server). **Fix pragmatico:** `EditorialFeedback.astro` ora mostra sempre il pulsante (`hidden = false`). L'utente vedrà il login Directus se non loggato. Il box feedback editoriale rimane nascosto (richiede auth funzionante). |
| (API Directus) | **FILTRI-LISTA-2** ✅ | Nascosti dai filtri Directus i campi `slug`, `id`, `wp_id`, `original_url` con `searchable: false`. (In aggiunta ai 9 già nascosti in FILTRI-LISTA.) |

### Note per la redazione (comportamenti by design)

| Comportamento | Spiegazione |
|---------------|-------------|
| **Homepage slider** | L'homepage è SSG (Static Site Generation): si aggiorna solo al rebuild notturno automatico o manuale. Modificare un articolo in Directus non cambia la homepage istantaneamente. Workaround: triggera rebuild da CF Pages o attendi il cron notturno. |
| **"Salva e rimani"** | Directus 11 non ha un'opzione globale per "Salva e rimani". Ogni redattore può impostarlo nel proprio profilo: icona utente → Preferences → Default Save Behavior. È una preferenza personale, non di sistema. |
| **Filtri memorizzati** | Directus memorizza i filtri per sessione utente. È comportamento nativo non disattivabile. I filtri si resettano chiudendo il browser o facendo logout. |

---

## Fix recenti (2026-05-09) — SPRINT-02

| Commit | Area | Fix |
|--------|------|-----|
| (codice) | **ISSUECARD-LCP** ✅ | Ottimizzazione lazy loading per LCP: `IssueCard.astro` con prop `index`, prime 6 card `loading="eager"`, resto `loading="lazy"`. `ArchivioContent.astro` passa `index={idx}` a ogni card. Build verde. |
| (script) | **VERIFY-REDIRECTS** ✅ | Script `scripts/verify-redirects.mjs` creato per testare 1001 redirect legacy pre-cutover. **Esito staging: 100% 404 (expected)** — il middleware in `src/middleware.ts` redirige a `https://ombreeluci.it` (produzione), non a staging. I redirect funzionano tramite CF Worker in produzione. Script utile per test post-cutover su dominio produzione, non su staging. Report generato in `scripts/logs/verify-redirects-*.json`. |
| (investigazione) | **PREVIEW-DIR-2** ⚠️ | Pulsante anteprima Directus: `preview_url` correttamente configurato (`https://ombreeluci-staging.pages.dev/it/{{slug}}/`). Possibili cause mancato funzionamento: popup blocker browser, comportamento UI Directus 11. Richiede test manuale con popup blocker disabilitato. |
| (investigazione) | **LIST-PREVIEW** ⚠️ | Link diretto in lista articoli Directus: limitazione strutturale — `display_template` non supporta link cliccabili. Workaround: aggiungere colonna `slug` nella tabella lista e usarla per navigare manualmente. |
| (codice + Directus) | **ALGOLIA-05** ✅ | Webhook sync Directus→Algolia **TESTATO E FUNZIONANTE**. **Endpoint:** `src/pages/api/algolia-sync.ts` — accetta POST `{ id, action: 'update'|'delete' }`, auth via `Authorization: Bearer ALGOLIA_SYNC_SECRET`. Fetch full article da Directus, se published aggiorna index `oel_articoli`, se non-published rimuove. Aggiorna anche articolo EN collegato. **Flow Directus:** "Algolia sync su pubblicazione" (id: `c09762f8-b022-41c0-a76a-5bbbd1f516a0`) — trigger `items.update`+`items.create` su articoli, condition `payload.stato = published`, HTTP request a webhook. **CF Pages secrets configurati:** `ALGOLIA_SYNC_SECRET`, `ALGOLIA_APPLICATION_ID`, `ALGOLIA_WRITE_API`, `DIRECTUS_TOKEN`. Test manuale 2026-05-09: articolo `lanno-della-disabilita-nelle-serie-tv` aggiornato OK in Algolia. Script setup: `scripts/setup-algolia-flow.mjs`. |
| (codice) | **EVIDENZA-RECENTI** ✅ | `getArticoliInEvidenza` in directus.ts riscritta: seleziona automaticamente i 4 più recenti con `in_evidenza = true` per la categoria. Filter OR su `categoria_menu`/`categoria_menu_2`, sort `-data_pubblicazione`, limit 4. Non usa più junction table `categorie_articoli`. |
| (infrastruttura) | **EDIT-BTN-FRONTEND** ✅ | CORS Directus verificato via SSH 2026-05-09. Config OK: `CORS_ORIGIN=https://ombreeluci.it,https://www.ombreeluci.it,https://ombreeluci-staging.pages.dev`, `CORS_CREDENTIALS=true`, `CORS_ENABLED=true`. Se il pulsante "Modifica" non appare, il problema è nel frontend (rilevamento sessione cross-origin) non nel CORS. |

---

## Fix recenti (2026-05-09)

| Commit | Area | Fix |
|--------|------|-----|
| (API Directus) | **FOLDERS-FORBIDDEN** ✅ | POST /permissions id=145: READ `directus_folders` per policy Redazione (0a5492ea). Verificato GET /permissions/145. |
| (API Directus) | **AUTORE-FILTER** ✅ | Nessun filtro attivo su campo autore — `options: {template, enableCreate, enableSelect}`, nessuna restrizione. Task già risolto, marcato. |
| (API Directus) | **FILTRI-LISTA** ✅ | `searchable: false` su 9 campi tecnici: umap_x, umap_y, umap_z, cluster_id, wp_id, original_url, json_export, json_traduzione, articolo_traduzione. Non appariranno più nel pannello filtri della lista articoli. |
| (API Directus) | **SAVE-DEFAULT** ⚠️ | Non configurabile via API in Directus 11 — nessuna chiave `save_behavior` in /settings. Procedura manuale: Directus → Settings → Project Settings → nessuna opzione disponibile. Limite strutturale di Directus 11 — ogni redattore può impostarlo nel proprio profilo utente (icona utente → Preferences). |
| (API Directus) | **PREVIEW-DIR** ✅ | PATCH /collections/articoli: `preview_url` aggiornato a `https://ombreeluci-staging.pages.dev/it/{{slug}}/`. Pulsante anteprima (occhio) ora punta al corretto URL staging. |
| (codice) | **ARCHIVAL-ALERT** ✅ | Soglie progressive 10/20/30 anni in `it/[slug].astro` e `en/[slug].astro`. IT: "Questo articolo è stato pubblicato più di X anni fa." EN: "This article was published more than X years ago." Smoke test staging: da verificare post-deploy (articolo 1987 deve mostrare "30 anni"). |
| (API Directus) | **SLUG-AUTORE** ✅ | Causa: DB column `autori.slug` era `is_nullable: false`. Fix: reso nullable via PATCH schema. Interfaccia `slug` con `fields:["nome_completo"]` già presente — auto-genera dalla UI. Nota campo aggiornata. Flow Directus creato ma disabilitato (non necessario). |
| (docs) | **FOCUS-HOWTO** ✅ | Creato `NORME_EDITORIALI_OEL.md` con sezioni: Focus tematici (come aggiungere + creare), 6 focus attivi con URL staging, procedura pubblicazione articolo, classificazione, ruolo editoriale, autori, tag, traduzione EN. |
| (docs) | **NORME-RUOLO** ✅ | In `NORME_EDITORIALI_OEL.md` sezione Ruolo editoriale: nota "Il ruolo editoriale si riferisce sempre al tema primario. Se l'articolo ha un secondo tema, il ruolo non viene applicato a quella seconda sezione." |

---

## Fix recenti (2026-05-09) — BACKFILL-DATES

| Commit | Area | Fix |
|--------|------|-----|
| (commit) | **BACKFILL-DATES** | Aggiornati timestamp `data_pubblicazione` da `T00:00:00` a timestamp completo con ore:minuti:secondi. Fonte: `scripts_and_data/datasets/articoli/articoli_semantici_FULL_2026.json` campo `meta.date`, matching per `wp_id`. **3.459 articoli aggiornati, 0 errori, 39 saltati** (articoli EN post-import con wp_id non presente in FULL_2026). Batch da 50 con pausa 1s. Effetto: ordinamento articoli per numero rivista ora deterministico (i timestamp del 2026-09-02 che prima erano tutti `T00:00:00` ora hanno ore:minuti:secondi diversi → ordine stabile). Verifica OEL-47: 9 articoli con timestamp distinti, ordine decrescente corretto (wp_id 5844→9681→9727→9723→9720→9717→9715→9713→9708). Script: `scripts/backfill-dates.mjs`. Log dryrun: `scripts/logs/backfill-dates-2026-05-09T02-34-49-dryrun.csv`. Log reale: `scripts/logs/backfill-dates-2026-05-09T02-36-12.csv`. |
| (API Directus) | **BACKFILL-DATES-EN** ✅ | Aggiornati timestamp `data_pubblicazione` articoli EN da `T00:00:00` a timestamp completo. **3.379 articoli EN aggiornati, 75 già con timestamp corretto (SKIP)**. Script: `scripts/backfill-dates-en.mjs`. Log dryrun: `scripts/logs/backfill-dates-en-2026-05-09T02-44-57-dryrun.csv`. Log reale: `scripts/logs/backfill-dates-en-2026-05-09T02-48-54.csv`. |

---

## Fix recenti (2026-05-09) — STATIC-01

| Commit | Area | Fix |
|--------|------|-----|
| (API Directus + codice) | **STATIC-01** ✅ | Collection `contenuti_statici` in Directus per testi modificabili dalla redazione. **Fase 1 — Schema:** collection creata con 6 campi (chiave unique, valore_it, valore_en, tipo, gruppo, ordine). Permessi: READ+UPDATE per Redazione (solo valore_it/en), READ pubblico per frontend. **Fase 2 — Popolamento:** 76 record creati (44 chi-siamo, 14 sostienici, 3 footer, 1 varie, 14 categorie). **Fase 3 — API layer:** `getContenutiStatici(gruppo?)` e `getCS(contenuti, chiave, lang, fallback)` in `src/lib/directus.ts`. **Fase 4 — Frontend:** componenti aggiornati per leggere da Directus con fallback inline: `ChiSiamoContent.astro`, `SostienicContent.astro`, `FaqAccordion.astro`, `Footer.astro`, `CercaContent.astro`, `CategoriaPageContent.astro`. **Gate:** build verde, tsc verde, accesso pubblico Directus verificato. |

---

## Fix recenti (2026-05-09) — NL-FORM

| Commit | Area | Fix |
|--------|------|-----|
| (codice + CF Pages) | **NL-FORM** ✅ | Integrazione newsletter Mailchimp con double opt-in. **Endpoint API:** `src/pages/api/newsletter.ts` POST con validazione email, chiamata Mailchimp API (server us17, list efd099264d), status "pending" per double opt-in, tag `website` + `page:{source}`. **Frontend:** `NewsletterContent.astro` aggiornato con form JS che intercetta submit, mostra messaggi inline IT/EN (successo, già iscritto, email invalida, errore). **Tracking GA4:** `dataLayer.push` con evento `newsletter_signup`, lang e source_page. **CF Pages:** secret `MAILCHIMP_API_KEY` aggiunto a production e preview. |

---

## Fix recenti (2026-05-09) — DATA-DEFAULT

| Commit | Area | Fix |
|--------|------|-----|
| (trigger PostgreSQL) | **DATA-DEFAULT** ✅ | Trigger `articoli_data_default_trigger` su tabella `articoli`: se `data_pubblicazione` è NULL all'INSERT, imposta automaticamente `NOW()`. Function: `articoli_data_default_fn()`. Testato: articolo creato senza data → `data_pubblicazione` popolato automaticamente. Articolo test eliminato. Trigger verificato in `information_schema.triggers`. |

---

## Fix recenti (2026-05-09) — OEL-46/OEL-47

### Audit ordinamento articoli OEL-47 (2026-05-09)

**Verifica 1 — Articolo anomalo `confessione`:** è un articolo distinto da `catechesi-disabilita-confessione`. Dati: `confessione` (titolo: "Confessione", wp_id=5844, data=1994-09-07, UUID=`d1ce8ae1…`) vs `catechesi-disabilita-confessione` (titolo: "Catechesi e disabilità: la Confessione", wp_id=9717, data=1994-09-02, UUID=`92e6c3be…`). Stesso tema (sacramento della confessione e disabilità) ma articoli separati importati da WP.

**Verifica 2 — Timestamp WordPress:** lo snapshot (`articoli_snapshot.json`) conferma che i timestamp importati da WP hanno granularità al **solo giorno** (`T00:00:00`) per tutti e 9 gli articoli OEL-47. Non esiste nessun campo aggiuntivo con ore/minuti/secondi: i soli campi data disponibili sono `data_pubblicazione` (importato) e nessun `wp_date_gmt` o equivalente. L'import da WordPress ha perso la granularità oraria. Conseguenza: 7 degli 8 articoli del 1994-09-02 hanno timestamp identico → **ordine tra questi articoli non deterministico** con l'attuale `sort: -data_pubblicazione`. Per ordinare secondo il sommario cartaceo serve un campo `sort` manuale dedicato (non implementato).

**Ordinamento OEL-47 per wp_id ascendente** (possibile proxy dell'ordine di pubblicazione WP): `dialogo-aperto-n-47` (9708) → `per-tutte-le-sabine-del-mondo` (9713) → `come-costruire-il-futuro-delle-persone-disabili` (9715) → `catechesi-disabilita-confessione` (9717) → `non-vuole-piu-andare-a-messa` (9720) → `un-fardello-pesante` (9723) → `ferie-dagosto` (9727) — poi `vita-fede-e-luce-n-47` (9681) e `confessione` (5844, probabilmente articolo generico riassegnato).

| Commit | Area | Fix |
|--------|------|-----|
| (API Directus + commit) | **OEL-46/OEL-47** | Metadati aggiornati: **OEL-47** "Non escludiamoli dalla nostra vita" (periodo "Luglio–Agosto–Settembre 1994", anno=1994, nr_progressivo=47, pdf/archive URL); **OEL-46** "Andiamo a giocare" (periodo "Aprile–Maggio–Giugno 1994", anno=1994, nr_progressivo=46, pdf/archive URL). Articoli: tutti 8/8 trovati per OEL-47 e 8/8 per OEL-46. **Anomalia rilevata:** tutti gli articoli di OEL-46 e OEL-47 erano già assegnati a OEL-48 (`4679dd4e…`, "Non vergognatevi di essere felici") per errore di import; `quando-il-gioco-e-difficile-o-impossibile` era su OEL-144. Riassegnazione eseguita perché si tratta di errori sistematici di import (articoli su "giochi" non possono essere in OEL-48). OEL-48 rimane con 41 articoli propri non toccati. Conteggi finali: OEL-47 = **9 articoli**, OEL-46 = **10 articoli**. Pagine SSR — visibili immediatamente: `/it/archivio/oel-47/`, `/it/archivio/oel-46/`. |

---

## Fix recenti (2026-05-09) — INS-31/INS-32

| Commit | Area | Fix |
|--------|------|-----|
| `80fccd8c` | **INS-31/INS-32** | Rinomina due numeri INS mal nominati in Directus. **INS--2 → INS-31** "Insieme Giallo – Speciale Verso Pasqua" (nr_progressivo=31, anno=1981, periodo "Novembre 1979 – Settembre 1981", sommario, PDF/archive URL aggiornati). **INS--3 → INS-32** "Insieme Speciale Fede e Luce" (nr_progressivo=32, anno=1981, periodo "Dicembre 1981", sommario, PDF/archive URL). Articoli assegnati: 19/19 a INS-31 (tutti da NULL), 23+1 a INS-32 (23 da NULL + 1 già presente). 5 conflitti INS-32 **non toccati** (già assegnati ad altri numeri): `alfedena-1976...`→INS-11, `la-casetta...`→INS-18, `leducazione...`→INS-16, `per-la-nostra-riflessione...`→INS-21, `principi-di-azione...`→INS-29. Redirect aggiunti in `src/middleware.ts` e `cf-worker/redirect-worker.js`: `/it/archivio/ins--2/`→`/it/archivio/ins-31/` e `/it/archivio/ins--3/`→`/it/archivio/ins-32/`. Conteggi finali Directus: INS-31=19 articoli, INS-32=24 articoli. Staging: da verificare dopo deploy (`/it/archivio/ins-31/`, `/it/archivio/ins-32/`). |

---

## Fix recenti (2026-05-08)

| Commit | Area | Fix |
|--------|------|-----|
| (smoke-classif) | **CLASSIF-SMOKE** | Esito test 1-7: tutti ✅ — (1) `/it/categoria/ombre-e-luci/` 200; (2) SSR `<!DOCTYPE` OK; (3) megamenu 14 categorie incl. `ombre-e-luci`; (4) `/it/categoria/famiglia/` 200; (5) `/en/category/family/` 200; (6) hreflang EN → `/en/good-news-for-us-all`; (7) branch mergiato su main e deployato. CLASSIF-01 chiuso. |
| (branch feat/tema-secondario) | **TEMA-02** | Campo `categoria_menu_2` (secondo tema opzionale): (1) campo Directus creato via API — select-dropdown, stesse 14 choices di categoria_menu, sort 302; (2) `ArticoloListItem.categoria_menu_2: string \| null` + `ARTICOLO_LIST_FIELDS` aggiornati; (3) route IT categoria: filter OR `categoria_menu === slug \|\| categoria_menu_2 === slug`; (4) route EN: `getArticoliByCategoria` usa Directus `_or` filter; (5) badge articolo IT+EN: secondo link categoria se `categoria_menu_2` non null, separato da `·`; (6) export pipeline: `categoria_menu_2` in `_copy_invariant`. Build verde. Gate: da verificare su staging dopo merge. |
| (API Directus, 2026-05-08) | **CLASSIF-02** | Tre fix sezione Classificazione Directus: (1) campo `temi` (M2M legacy) nascosto via `meta.hidden:true` — non appare più nel form né per admin; (2) riordine campi: Tema=301, Forma=302, Tag=303, Ruolo editoriale=304, In evidenza=305, temi (nascosto)=310; (3) **tag autocomplete M2M — non implementabile**: in Directus 11, `list-m2m` usa sempre drawer/modale e non ha opzione `inline` o `autocomplete`. L'interfaccia `tags` inline esiste solo per campi `json`/`csv` (stringhe), non per M2M relazionali — cambio di tipo spezzerebbe la collection `tags`. Configurazione attuale (`enableCreate:true`, `enableSelect:true`) è il massimo disponibile su M2M. |
| (branch feat/classificazione-cleanup) | **CLASSIF-01** | Fix conflitto critico SSG/SSR categoria: `it/categoria/[categoria].astro` ora filtra su `a.categoria_menu === slug` invece di `tema_label === label` — SSG e SSR ora usano lo stesso campo. Aggiunta 14a categoria `ombre-e-luci` in `taxonomy_structure.json` e `categorie.json` (già presente). Rimozione completa `tema_label` da: `taxonomy.js` (fallback, funzioni), `directus.ts` (interfaccia, fields query), `utils/i18n.ts` (dizionari, `TEMA_IT_TO_I18N_KEY`, `localizeTheme`), `content/config.ts`. `getCategorySlugForArticle` riscritta su `categoria_menu` diretto. Directus UI: choices `categoria_menu` aggiornate a slug canonici + 14a voce; label IT "Tema"/"Forma"/"Tag"/"Ruolo editoriale"/"In evidenza"; campi tecnici nascosti (tema_label, umap_x/y/z, cluster_id, wp_id); permesso Redazione (id 90) aggiornato (rimosso tema_label, aggiunti slug/lang/in_evidenza/articolo_traduzione/didascalia_en). File modificati: `src/pages/it/categoria/[categoria].astro`, `src/data/taxonomy_structure.json`, `src/config/taxonomy.js`, `src/lib/directus.ts`, `src/utils/i18n.ts`, `src/content/config.ts`, `src/pages/en/[slug].astro`. |
| (verifica) | **LANG-SWITCHER-STATUS** | Language switcher funziona correttamente: 3451 IT con link bidirezionale IT↔EN, testato su staging (`la-nostra-buona-novella` → `/en/good-news-for-us-all`). I 39 IT senza link non hanno traduzione EN — dato mancante, non bug. `come-tradurre-un-articolo-in-inglese-col-nuovo-cms` senza link perché l'import TRANS-FLOW-01 è fallito (JSON troncato nel copia-incolla, errore a posizione 3783). Nessun EN orfano. Nessun fix necessario al codice. |
| (verifica) | **BIO-EN-STATUS** | `bio_en` funziona correttamente: campo in `getArticoloBySlug` fields, in template `en/[slug].astro` (riga 165: `bio_en` first, `bio_html` fallback). 79/354 autori hanno bio_en (= tutti quelli con bio IT). Staging verificato: `sexuality-and-disability-dont-wait-to-talk-about-it` mostra bio EN in pagina. Autori senza bio = 275/354 — non hanno bio in nessuna lingua, dato mancante, non bug. |
| (verifica) | **TRANS-FLOW-PERM** | `json_export` già presente nei 29 campi READ della policy Redazione (permesso id 90) — nessuna modifica necessaria. |
| `add83081` | **UX-PAGELOAD** | Page loader anti-FOUC: overlay `#page-loader` con spinner in `BaseLayout.astro`, `body { opacity:0 }` + `body.ready { opacity:1; transition:200ms }` in `global.css`. Script `is:inline` in `<head>` (gira prima del primo paint). Ciclo ripetuto su View Transitions (`astro:before-preparation` / `astro:page-load`). Disabilitato con `prefers-reduced-motion`. Colori da `--bg-light` e `--accent-color`. |
| `15a7bcd6` | **UX-PAGELOAD fix** | Script page loader spostato da `</body>` a primo figlio di `<head>` con `is:inline`: garantisce esecuzione sincrona prima del paint. `loader` ora cercato nel DOM dentro `ready()` (non all'avvio, quando il body non esiste ancora). |
| `abf5bbd3` | **SECURITY-XSS** | Vulnerabilità XSS reale: `HomePageContent.astro` hero byline usava `innerHTML` con `meta.author` e `meta.categoria_menu` non sanitizzati (dati Directus). Sostituito con `createElement`+`textContent` per ogni nodo. Stesso fix per `outerHTML` con `meta.author.charAt(0)`. |
| `04543a7d` | **SECURITY-XSS** | Anti-pattern XSS fragile: `buildRelatedCard` in `it/[slug].astro` usava `innerHTML` con concatenazione stringa e `.replace(/</g,'&lt;')` manuale. Riscritto interamente con DOM API (`createElement`, `textContent` per tutti i valori testuali). Nessuna sanitizzazione manuale necessaria. |
| `92c3904a` | **UX-MOBILE-TYPE** | `global.css` @media 768px: aggiunti `h2 1.5rem`, `h3 1.25rem`, `h4 1.1rem` con `line-height`; `p, li` con `line-height: 1.7`. |
| `e98a5e54` | **UX-MOBILE-TYPE** | `global.css` 768px: `h1` da `1.875rem` → `2rem`; `p, li` aggiunto `font-size: 1.125rem`. `ArticlePageLayout.astro` 768px: `.article-subtitle` da `1.1rem` → `1.125rem` (necessario nello scoped perché prevale su global). |
| `e665c964` | **UX-MOBILE-TYPE** | `ArticlePageLayout.astro` 768px: `.article-content p` da `font-size:1rem` → `1.125rem` + aggiunto `line-height:1.75`. |

## Fix recenti (2026-05-07)

| Commit | Area | Fix |
|--------|------|-----|
| (script) | **TRANS-FLOW-01** | Script export traduzione `scripts/export-per-traduzione.mjs` pronto. Setup Directus (campo `json_traduzione` + Flow import) documentato in `docs/TRANS-FLOW-01-setup.md` — da completare manualmente in Directus UI. |
| (API Directus) | **TRANS-FLOW-01-setup** | Campo `json_traduzione` creato su `articoli`, permessi Redazione aggiornati (READ 28 campi + UPDATE `*`). Flow di import da configurare manualmente in Directus UI (`docs/TRANS-FLOW-01-setup.md` Step 3). |
| (Directus UI + API) | **TRANS-FLOW-01 ✅ COMPLETO** | Flow "Import traduzione da JSON" configurato e testato: crea articolo EN pubblicato, link bidirezionale IT↔EN, loop prevention OK. Flow "Esporta per traduzione" (trigger manuale, 3 op: item-read→exec→item-update): genera `json_export` nell'articolo IT. Flusso redazione operativo: pulsante ⋮→"Esporta" → copia in Claude.ai → incolla JSON tradotto in `json_traduzione` → salva → EN pubblicato. Script configurazione: `scripts/setup-export-flow.mjs`. Gotcha Directus 11: Run Script sandbox senza fetch/require — soluzione: item-read prima del Run Script. |
| `78a453ea` | **BIO-EN-QUERY** | Fix bug: `getArticoloBySlug` non fetchava `autore.bio_en` → la bio EN non appariva mai su articoli EN (fallback sempre su bio IT). Aggiunto `autore.bio_en` al fields array + `bio_en`/`bio_html` all'interfaccia `AutoreRef`. |
| `78a453ea` | **DID-EN-CODE** | Codice `en/[slug].astro`: `heroCaption` ora usa `didascalia_en` con fallback su `didascalia_copertina`. Campo `didascalia_en` creato via API + 1965/1965 didascalie tradotte IT→EN con Haiku. |
| (branch `feat/social-sticky-v2`) | **SOCIAL-STICKY** | Refactor completo: da `position:fixed`+JS a `position:sticky` CSS-nativo. DOM: `article-body-row` flex container con sidebar (`social-sticky`) + `article-body-main`. JS ridotto a solo IntersectionObserver fade-in. Stile nectar: 46px, border-radius 100px, hover fill per piattaforma. 6 icone (FB, X, WA, LinkedIn, email, copy). Revert: `git revert <sha>` su main dopo merge. |
| `d5fc53f5` | **TAG** | `/tag/{slug}` → `/it/tag/{slug}` in `it/[slug].astro` (solo EN aveva prefisso corretto) |
| `3133111c` + `7756e067` | **BIO-EN** | ✅ Script `translate-bio.mjs` scritto ed eseguito — 79/79 bio autori tradotte IT→EN con Haiku, zero errori. Campo `bio_en` ora popolato. Log: `scripts/traduzione/logs/translate-bio-2026-05-07T17-03-32.csv`. Bio live su articoli EN (SSR) e su pagine autore (SSG) dopo rebuild. |
| (bloccato) | **DID-EN** | Script `translate-didascalie.mjs` pronto. Bloccato da: 1) creare campo `didascalia_en` in Directus UI, 2) aggiornare `en/[slug].astro` per leggerlo. Vedi CONTENUTI.md § "Didascalie foto — traduzione EN". |
| `f910efb1` | **STUDIOSI** | ✅ Pagina studiosi/educatori/attivisti IT+EN. `StudosiContent.astro`, 47 autori da `src/data/studiosi.json`, bio lang-aware, foto circolare, redirect WP. |

## Fix recenti (2026-05-06)

| Commit | Area | Fix |
|--------|------|-----|
| `b1bb5fb9` | **GITIGNORE** | `.wrangler/tmp/` e `prompt_sicurezza.md` rimossi dal repo (accidentalmente committati); aggiunti a `.gitignore` |
| `79bdd2e4` | **UX-HOME** | Esplora IT: catUrl `/categoria/` → `/it/categoria/` (era 404); frecce carousel rimosse (non funzionavano — track ora swipeable); pagina numero IT: sezione "English Edition" rimossa |
| `22198279` | **LANG-SWITCH** | 10 pagine EN con `alternateArticleUrl` senza `/it/` → 404: fixate `/en/archive/`, `/en/about/`, `/en/authors/`, `/en/newsletter/`, `/en/support-us/`, `/en/sections/diaries`, `/en/archive/web-only`, `/en/category/[slug]`, `/en/diaries/[diario]`, `/en/tag/[slug]` |
| (sprint) | **UX-HOME** | Diari grid redesign (cover 4:3, no avatar 40px); testimonianze rotazione giornaliera (pool 10, modulo day); esplora EN usa pool IT per immagini categoria (no titoli IT visibili su EN); home-diari-grid fix (no articoli non-diari in EN) |

---

## Fix recenti (2026-05-05)

| Commit | Area | Fix |
|--------|------|-----|
| — | **DOCS-01** | Riorganizzazione documentazione: `bug_ux_ui.md` — frontmatter e riferimenti componenti Astro per ogni bug; `CONTENUTI.md` — nuova sezione "Traduzioni AI — stato e regole" (stato batch, regole filologiche, modelli, fase II); `README.md` — tabella aggiornata con tutti i documenti attivi, sezione "File archiviati"; `docs/archive/` — già contiene PROGRESS, ARCH-04-PLAYBOOK, STATO_PROGETTO, TRADUZIONI con suffisso _legacy. |
| — | **MONITORING-01** | Sistema di osservabilità a tre livelli: `src/pages/api/health.ts` (endpoint /api/health con 3 check paralleli Directus), `.github/workflows/smoke-post-deploy.yml` (11 check post-deploy via curl, artifact log 7gg, Slack alert), `docs/MONITORING.md` (architettura, istruzioni UptimeRobot, 6 monitor da configurare). Aggiornati: `INFRASTRUTTURA.md` (tabella Monitor attivi), `RUNBOOK.md` (sezione Monitoring e alert). |

---

## Fix recenti (2026-05-04)

| Commit | Area | Fix |
|--------|------|-----|
| `f193558e`→`cf0eb4e6` | **HERO-01** | Hero slider fullscreen homepage IT+EN: 4 slide, autorotate WAAPI, tab strip Nectar-style, header trasparente CSS-first, text reveal animazione, Raleway 900 reale |
| `57a35da2` | **ART-TYPO** | Pagina articolo: titolo Raleway 900, sottotitolo Raleway no-italic 1.5rem, badge categoria all-caps |
| `0ff6ae21` | **NUMERI-01** | `fetch-static-data.mjs` prebuild: fetcha ultimo numero da Directus con fallback; `numeri_consolidati.json` rimosso da homepage, sostituito con `getAllNumeriRivista()` |
| `63494dd2` | **NUMERI-02** | Campo M2O `copertina` su `numeri_rivista` reso visibile; `getNumeroImageUrl()` priorità M2O→URL; Flow Directus `d3b1f2a1` creato per rebuild automatico CF Pages |
| `ebb69112` | **NUMERI-03** | Pagine `[issue].astro` IT+EN convertite da SSG a **SSR**: articoli pubblicati visibili immediatamente senza rebuild |
| `1a8408e2` | **NUMERI-04** | `getArticoliByNumeroId(uuid)`: filter diretto per UUID (no deep relazionale → no FORBIDDEN) |
| `ffe8055d` | **HOME-DEDUP** | Deduplicazione globale homepage: `usedSlugs` Set con priorità hero→recenti→diari→testimonianze→esplora |
| `f7a74710` | **SEARCH-FIX** | EN search language switcher mobile fix; categorie mancanti CATEGORIA_LABELS; `id_numero` in searchableAttributes `oel_numeri`; issueUrl corretto `/it/archivio/`; re-indicizzazione 7508 record |

---

## Fix recenti (2026-04-28)

| Commit | Fix |
|--------|-----|
| `ae17cc4f` | feat(magazine): label "Archivio" → "Magazine" in i18n IT+EN, header nav (Newsletter→Magazine, Archivio completo→Newsletter nel megamenu), ArchivioContent con tab CSS-only (Ultimo numero / Tutti i numeri), IssueContent breadcrumb |
| `b4259dac` | refactor(magazine): rimuove tab intermedio — "Ultima edizione" è link diretto al numero più recente; header centrato con pill switcher stile vita.it (dark pill su active); filtri inline senza accordion; `?tab=numeri` rimosso (non più necessario) |
| `7dd5b9ba` | fix(magazine): .issue-mag-header centrato (align-items:center); IssueNavPill "Archivio"→"Magazine" con prop archiveBasePath lang-aware; .header-link font-weight 500→700; search form width 360→480px; filtri senza label, contesto nelle option |

---

## Fix recenti (2026-04-27)

| Commit | Fix |
|--------|-----|
| `a2da57c6` | UX: commenti accordion `<details>` chiusi di default; bio autore troncata 200 char + link "Leggi di più"; bio_en su articoli EN; audit doc completo (§SEO, §Analytics, §Redirect, §Directus, §Commenti, §Piano EN/ES) |
| `5ee8326` | IssueNavPill: href doppio `/archivio//archivio/` — passato path completo, non prefissato di nuovo |
| `3dac352` | Mobile scroll orizzontale: `min-width:0` su `.mega-menu-block`, `overflow-x:hidden` su mega menu aperto, `overflow-x:clip` su `html` |
| `cd2f988` | Mobile scroll orizzontale: `overflow-x:clip` → `overflow-x:hidden` su `html` (clip non supportato iOS Safari <16) |
| `3930532` | ArticlePageLayout: reset `margin:0; border-radius:0` su `.article-content .leggi-anche img` |
| `04bfcf0a` | TAG-03: `/tag/[slug]` IT ora filtra `lang=it` — prima mostrava IT+EN insieme |

**Scroll orizzontale mobile**: doppia protezione deployata — `overflow-x:hidden` su `html` (legacy) + `overflow-x:clip` su `body` (MOBILE-01 `d9883183`; `clip` non crea nuovo scroll context, non rompe `position:fixed`). Da verificare su device fisici.

---

## § Architettura numeri rivista (2026-05-04)

### Come funziona il ciclo pubblicazione → sito

```
Redattore pubblica/modifica numeri_rivista in Directus
  → Directus Flow (d3b1f2a1) → POST CF_DEPLOY_HOOK
  → CF Pages rebuild (~3 min)
  → prebuild: node scripts/fetch-static-data.mjs
      → aggiorna src/data/ultimo-numero.json (con fallback se Directus down)
  → Astro build: homepage e archivio listing usano Directus live
  → Sito aggiornato
```

**Pubblicare articoli** in un numero non richiede rebuild: la pagina del numero è **SSR**.

### Pagine e loro modalità

| Pagina | Modalità | Fonte dati articoli |
|--------|----------|---------------------|
| `/it/archivio/` | SSG (rebuild auto) | `getAllNumeriRivista()` live al build |
| `/it/archivio/[issue]` | **SSR** | `getArticoliByNumeroId(numero.id)` live |
| `/en/archive/[issue]` | **SSR** | `getArticoliByNumeroId(numero.id)` live |
| Homepage carousel | SSG (rebuild auto) | `getAllNumeriRivista()` live al build |
| Header megamenu | SSG (rebuild auto) | `src/data/ultimo-numero.json` (prebuild) |

### Copertina numeri — campo M2O vs URL legacy

- **Nuovi numeri (OEL-173+):** campo `copertina` (M2O → `directus_files`). Il redattore carica l'immagine dal file picker nel form Directus. `getNumeroImageUrl()` restituisce `https://cms.ombreeluci.it/assets/{uuid}`.
- **Vecchi numeri (OEL-1…172):** campo `copertina_url` (stringa URL). Fallback automatico in `getNumeroImageUrl()`.
- **Ordine di priorità in `getNumeroImageUrl()`:** `copertina` M2O → `copertina_url` stringa → `null`.

### Deploy Hook CF Pages

- Hook ID: `94f27b2c-a75b-4d3c-b0bc-6268e1eade41`
- URL: `https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/94f27b2c-...`
- Salvato in `.env` come `CF_DEPLOY_HOOK`
- Flow Directus: ID `d3b1f2a1-b140-4d04-a516-13f48924ba30`, operazione `7231841d-6f77-42e3-a7e8-0660b7cc114c`

### Se si rompe qualcosa

**Articoli non appaiono in `/it/archivio/oel-NNN/`:**
1. Verifica che siano `published` in Directus
2. Verifica che `numero_rivista` sia impostato (UUID, non stringa `OEL-NNN`)
3. La pagina è SSR: ricarica, non serve rebuild

**Ultimo numero sbagliato in header:**
1. Verifica `src/data/ultimo-numero.json` — campo `id_numero`
2. Lancia manualmente `node scripts/fetch-static-data.mjs` e ricostruisci
3. Oppure modifica/salva il record in Directus → Flow → rebuild automatico

**Flow non scatta:**
1. Directus → Settings → Flows → `CF Pages rebuild on numeri_rivista publish` → verifica status Active
2. Testa manualmente: `curl -X POST $CF_DEPLOY_HOOK`
3. Se risponde 400 "invalid hook ID": il hook è scaduto → ricrearlo con `scripts/fetch-static-data.mjs` come riferimento

**`getArticoliByNumeroId` restituisce 0 risultati:**
- Usa filter `[numero_rivista][_eq]={uuid}` — NON `numero_rivista.id_numero` (richiede permessi relazionali)
- L'UUID del record si trova con: `GET /items/numeri_rivista?filter[id_numero][_eq]=OEL-173&fields=id`

### Deduplicazione articoli homepage

`index.astro` e `en/index.astro` usano un `usedSlugs: Set<string>` globale.
Ogni articolo è aggiunto al set quando viene assegnato a una sezione; le sezioni successive escludono i già usati.

Ordine di priorità:
1. Hero slider (`featuredPool`) — portanti/strutturali con cover, shuffle uniforme, **esclusi freschi ≤60gg**
2. Recenti (sotto hero) — pool 25 (qualsiasi ruolo), shuffle fresh-first (≤60gg nei primi slot)
3. Diari (per diarista specifico, ignora usedSlugs)
4. Testimonianze
5. Esplora (un articolo per categoria)

---

## Fix recenti (2026-05-04, branch feat/hero-slider)

| Commit | Fix |
|--------|-----|
| `f193558e` | **HERO-01** feat: hero slider fullscreen + header trasparente homepage |
| `54f6965e` | fix: 6 fix post-review (logo filter, is:global CSS, tab Nectar-style, 4 articoli, cover reali) |
| `b509e923` | fix: 4 articoli, animazione fade-up, titolo Raleway 900 |
| `0792a3f3` | fix: struttura Nectar esatta — li diretto, ::before/::after su li |
| `bee3cb7c` | feat: ripristina sezione tagline+featured+recenti sotto hero slider |
| `9ef18bd7` | fix: timer globale + astro:page-load — no double setInterval |
| `e924436f` | feat: text reveal dall'orizzonte (translateY 110%→0) |
| `486ad937` | fix: ls-code--active scuro su hero trasparente |
| `7f408a46` | fix: content box max-width 600px, titolo 35px/lh 1.5 |
| cleanup | refactor: rinomina .hr/.hri → .hero-reveal/.hero-reveal-inner; Raleway 900 scaricato |

### § Hero Slider — architettura (2026-05-04)

| Componente | Dettaglio |
|---|---|
| Route | `/` e `/en/` (prop `heroHeader={true}` su BaseLayout) |
| Componente | `HomePageContent.astro` — sezione `home-hero-slider` |
| Slide | 4 articoli con cover reale da `featuredPool`, autorotate 5s |
| Tab strip | Struttura Nectar: `<li>` diretti, `::before` track + `::after` fill 4.95s linear |
| Animazione testo | Text reveal: `.hero-reveal` (overflow:hidden) + `.hero-reveal-inner` (translateY 110%→0) |
| Header trasparente | CSS-first su `[data-hero="true"]`, JS aggiunge `.header--scrolled` a scroll |
| Logo | `filter: brightness(0) invert(1)` su logo nero — no asset aggiuntivi |
| LanguageSelector | Bianco in stato trasparente, active code con pill bianco+testo scuro |
| Timer bug fix | `_heroTimer` module-level + `astro:page-load` — no double setInterval con View Transitions |
| Font | Raleway 900 vero (`raleway-900-latin.woff2`, 22KB) aggiunto a `global.css` |

---

## Prossima azione immediata

**ALGOLIA-05** — webhook Directus→Algolia automatico. Senza questo ogni pubblicazione richiede `node scripts/algolia/index-all.mjs` a mano.

**VERT-01 — 2 pagine Focus mancanti** (editoriale). Mancano `studiosi-educatori-e-attivisti-ombre-e-luci` e `catechesi-e-disabilita`. Fornire testo intro e lista articoli. Script `scripts/create-verticali.py` pronto.

**NL-FORM** — form newsletter reale con Mailchimp (uuid `00c5dad63480d9601563b5692`, lid `efd099264d`).

**PF-02** — Cache-Control su R2 via CF Transform Rule (istruzioni nel backlog).

---

## Da testare

| ID | Test | Procedura |
|----|------|-----------|
| T4 | Verifica articolo TRANS-FLOW-01 | Aprire articolo IT in Directus → ⋮ → "Esporta per traduzione" → copiare json_export → incollare in Claude.ai → copiare JSON tradotto → incollare in json_traduzione → salvare → verificare che l'articolo EN creato abbia: corpo tradotto, bio autore EN (non IT), didascalia_en valorizzata |

---

## Blockers pre-lancio (cutover DNS)

Il cutover avviene quando tutti i blockers sono verdi.

| ID | Stato | Owner | Descrizione |
|----|-------|-------|-------------|
| B-01 | ✅ | — | Merge `feat/i18n-shell` su main |
| B-02 | ✅ | Dev | Smoke test SEO F2 — curl verdi, fix hreflang assoluto `6aab9c44` |
| B-03 | ✅ | Dev | CORS Directus configurato e verificato |
| B-04 | ⏳ | Redazione | V-02: assegnare categoria ai 19 articoli "da-categorizzare" in Directus |
| B-05 | ✅ | Dev | URL-01: rimozione `/blog/` — verificato su staging 2026-04-24 |
| B-06 | ✅ | Dev | Audit e fix permessi Directus ruolo Redazione completato (2026-05-01). Vedi § Directus Audit. |
| B-07 | ✅ | Dev | Keystatic dismesso — Worker `keystatic-oel` eliminato |
| B-08 | ✅ | Dev | Copertine staging: tutte su `cms.ombreeluci.it/assets/{uuid}`, 200 OK |
| B-09 | → post-lancio | Sysadmin | UptimeRobot monitoring |
| B-10 | → post-lancio | Sysadmin | Slack alert build |
| B-11 | N/A | — | Iubenda ownerName `fedeeluce.it` è corretto (editore legale) |
| B-13 | ✅ | Dev | **Ricerca Algolia** — testata sistematicamente (2026-05-04). Autocomplete IT/EN ✅, pagina cerca IT/EN ✅, filtri tradotti ✅, numeri ricercabili ✅. Manca solo ALGOLIA-05 (webhook auto-sync, non blocca il lancio). |
| B-14 | ✅ | Dev | **URL-IT-02** — prefisso `/it/` su tutte le route IT (commit `01456a13`). Redirect root→/it/ in astro.config.mjs. |
| B-15 | 🔴 | Dev | **noindex SWEEP — ULTIMA AZIONE PRE-CUTOVER** ⚠️ **NON toccare finché il sito è su staging.** Il `noindex={true}` su tutte le pagine è intenzionale e protegge lo staging dall'indicizzazione. Rimuoverlo prima del cutover significherebbe indicizzare lo staging su Google. Questo è l'ULTIMO commit da fare, immediatamente prima di cambiare il DNS — contestualmente all'apertura di `robots.txt`. Vedere § SEO per lista completa dei file da modificare. |
| B-16 | 🔴 | Dev | **Sitemap completa pre-lancio** — `/sitemap.xml` attuale copre solo IT static + categorie + articoli IT. Mancano: articoli EN, numeri archivio, pagine autore, pagine EN. Aggiornare `sitemap.xml.ts` e registrare in Search Console al cutover. |
| B-17 | 🔴 | Dev | **Analytics GA4/GTM** — zero analytics implementato. Minimo pre-lancio: attivare Cloudflare Web Analytics (gratis, già disponibile su CF Pages, 1 riga di codice) O aggiungere GA4 via script. Senza questo non si sa nulla del traffico dal giorno 1. Vedere § Analytics. |

---

## Backlog pre-lancio

Tutto questo deve essere verde prima del cutover DNS.

| ID | Priorità | Effort | Descrizione |
|----|----------|--------|-------------|
| TAG-404 | ✅ | S | Risolto automaticamente — `/tag/*` è nel `_routes.json` include, staging 200 OK (verificato 2026-04-25). |
| SLUG-CAT-EN | ✅ | M | `categorie.json` è già fonte unica di verità con `en_slug`. Mappe hardcoded `CAT_IT_TO_EN_SLUG` non esistono più in `i18n.ts`. `getCategoriaUrlSlug/getCategoriaSlugIT` leggono da JSON. Chiuso. |
| AUT-01 | ✅ | M | Pagine autore: route EN `/en/authors/[slug]`, componente condiviso `AuthorPageContent.astro`, filtro lang per lingua, bio_en in Directus. Build OK. Commit feat/aut-01-author-pages. |
| HOME-EN | ✅ | M | Homepage EN `/en/` — `HomePageContent.astro` estratto, `index.astro` refactored, `en/index.astro` creato. Merge `1c4bbe90`. |
| ARCH-EN | ✅ | M | `/en/archive/` e `/en/archive/[issue]` — `ArchivioContent.astro` + `IssueContent.astro`. Merge `feat/static-pages-en`. |
| DIARI-EN | ✅ | M | `/en/diaries/` e `/en/diaries/[diario]` — `DiariContent.astro` + `DiarioContent.astro`. Merge `feat/static-pages-en`. |
| TAG-03 | ✅ | S | `/tag/[slug]` ora filtra `lang=it`; `/en/tag/[slug]` filtra `lang=en`. Fix 2026-04-27. |
| TAG-REC | 🟡 | M | Filtro per tipo dentro `/rubriche/recensioni/`: libri, cinema, teatro, tv. Architettura: tag Directus + filtro client-side dentro RubricaPageContent (NON sub-URL). Pre-requisito: verificare che le recensioni abbiano già tag `cinema`/`libri`/`teatro`/`tv` in Directus — se no, lavoro editoriale. Post-lancio. |
| SEARCH-01 | ✅ | L | **Ricerca Algolia** — testata sistematicamente (2026-05-04). 7508 record, fix post-test applicati (URL numeri, traduzioni filtri EN, id_numero ricercabile). Chiuso. |
| ALGOLIA-05 | 🔴 (nota fusione: ✅ implementato 2026-05-09, poi rotto silenziosamente e ✅ rifissato per la causa reale il 2026-07-27 — vedi blocco `[BUG] Segnalazioni 2026-07-27` in cima al file) | M | **Webhook sync Directus→Algolia** — pubblicare/modificare articolo in Directus non aggiorna l'indice automaticamente. Workaround: `node scripts/algolia/index-all.mjs`. Non blocca lancio ma deve essere fatto presto dopo. |
| VERT-01 | 🟡 | L | **Focus pages** — schema Directus, componenti e route `/it/focus/[slug]` + `/en/focus/[slug]` live. 6/8 pagine populate (Mariangela, Autismo, Noi papà, Aktion T4, Cinema, Ciao Stefano). Restano: `studiosi-educatori-e-attivisti-ombre-e-luci` e `catechesi-e-disabilita`. Verifica visiva staging + megamenu link ancora aperti. Vedi § VERT-01. |
| VERT-LISTING | ✅ | S | **Listing `/it/focus/` e `/en/focus/`** — live su main (commit `2d8cba4e`). `FocusListingContent.astro` componente condiviso IT/EN. |
| VERT-SEARCH | 🟡 | M | **Focus nella ricerca Algolia** — le pagine focus non sono indicizzate. Aggiungere allo script come tipo `focus` con titolo, intro (HTML stripped), slug IT/EN. Prerequisito: VERT-01 con ≥4 pagine stabili — **ora soddisfatto (6 pagine)**. Fare dopo VERT-01 completo (8/8). |
| B-12 | 🟡 | M | Rivalutazione ruoli editoriali per categoria (dopo B-04) |
| UPTIME-CUTOVER | 🟡 | XS | **Aggiorna URL monitor UptimeRobot da staging a produzione via API** — sostituire `ombreeluci-staging.pages.dev` con `ombreeluci.it` nei 6 monitor (ID: 802995114, 802995136, 802995137, 802995138, 802995139, 802995143). 30 secondi via API. Fare contestualmente al cutover DNS. |
| LINK-01 | 🟡 | S | 7 link IT↔EN ambigui + 11 no-match: `scripts/traduzione/logs/backfill_traduzione_link_20260408_231827.csv` |
| V-05 | 🟡 | S | 35 articoli Jean Vanier con `tema_label = null`: riassegnare categoria in Directus |
| UX-19 | ✅ | S | Pagine test eliminate (test-lista/minimal/no-articles/status), debug ha già noindex. Dead code `ArticleListRow.astro` eliminato. |
| PF-01 | ✅ | S | Placeholder copertina: 386 byte SVG, già ottimale — info 4.2MB era obsoleta. |
| PF-02 | ⛔ BLOCCATO | S | Cache-Control assente su R2 (`pub-2251...r2.dev`). La Transform Rule in CF Dashboard non funziona perché il dominio R2 è fuori dalla zona `ombreeluci.it`. Fix corretto: collegare R2 a custom domain `media.ombreeluci.it` con Cache Rule dedicata. Prerequisito: cutover DNS da Aruba a Cloudflare. Fare contestualmente o subito dopo il cutover. |
| DA-02 | 🟢 | S | 16 pull quote non reinserite: 11 articoli con posizione ambigua, inserire a mano in Directus |
| UAT-CLEANUP | 🔴 | S | Eliminare utente Redazione UAT `redazione-uat@ombreeluci.it` prima del go-live |
| SEC-01 | ✅ | S | Security headers aggiunti via `public/_headers`: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. |
| NL-FORM | 🔴 | M | **Form newsletter reale** — `/it/newsletter/` ha `action` placeholder (TODO nel codice). Mailchimp uuid `00c5dad63480d9601563b5692`, lid `efd099264d`. |
| BUG-REGEX | 🟡 | S | Encoding fixato in Directus: 5+1 sequenze `Ã\xa0` (double-encoding UTF-8→Latin-1 di `à/è`) patchate via API (2026-05-01). Se l'errore JS console persiste, causa diversa — indagare. |
| PERM-DIR | ✅ | M | Permessi ruolo Redazione configurati e documentati (commit `f326b0ea`). UAT verifica ancora da eseguire (B-06). |

---

## Validazioni in attesa dalla Redazione

| # | Cosa | Come verificare |
|---|------|-----------------|
| V-01 | 13 categorie: distribuzione articoli sensata? | Staging → menu Temi → ogni `/it/categoria/*` |
| V-02 | 19 articoli "da-categorizzare" da assegnare | Directus → filtra `categoria_menu = da-categorizzare` |
| V-04 | "Fede e Luce" (1114 articoli): serve suddivisione? | Staging → `/it/categoria/fede-e-luce` |
| V-05 | 35 articoli Jean Vanier senza categoria | Directus → filtra `tema_label` vuoto |
| V-13 | Homepage v2: qualità editoriale articoli in rotazione | Staging → ricarica più volte |
| V-14 | Embed video YouTube funzionanti | Un articolo con video YouTube incorporato |
| V-16 | Pull quote (570): posizione e formattazione corretta | Articoli lunghi con citazioni evidenziate |
| V-17 | Sommari numeri rivista (71): testo leggibile e corretto | `/it/archivio` → apri alcuni numeri |
| **M-01** | **Header mobile: logo + hamburger visibili, nessun overflow** | iPhone/Android — apri staging, verifica header a 320px/375px |
| **M-02** | **Megamenu: apertura, scroll interno, chiusura** | iPhone → tap hamburger → scroll voci menu → tap voce → naviga correttamente |
| **M-03** | **Megamenu: background NON scrolla mentre menu è aperto** | iPhone Safari → apri menu → prova a scrollare dietro → deve restare bloccato |
| **M-04** | **Ricerca mobile: form appare, submit porta a `/it/cerca/`** | iPhone ≤480px → tap icona lente → digita → invio → pagina risultati |
| **M-05** | **Language switcher mobile: dropdown IT/EN funzionante** | iPhone → tap icona globo → appare dropdown → tap EN → naviga |
| **M-06** | **Articolo: testo leggibile su 375px, nessun overflow orizzontale** | iPhone → apri un articolo lungo → verifica font, spaziatura, link lunghi |
| **M-07** | **Focus page + listing: layout card su mobile** | iPhone → `/it/focus/` → apri una verticale → card articoli corrette |

---

## Algolia — stato implementazione (aggiornato 2026-05-04)

### Architettura

| Componente | File | Stato |
|---|---|---|
| Script indicizzazione | `scripts/algolia/index-all.mjs` | ✅ funzionante — ri-indicizzare con `node scripts/algolia/index-all.mjs` |
| Indice articoli | `oel_articoli` | ✅ 6949 record (IT+EN, filter per `lang`) |
| Indice autori | `oel_autori` | ✅ 354 record |
| Indice numeri | `oel_numeri` | ✅ 205 record — `id_numero` ora ricercabile, URL corretti `/it/archivio/` |
| Autocomplete header | `src/components/AutocompleteWidget.astro` | ✅ testato e funzionante |
| InstantSearch `/cerca` + `/en/search` | `src/components/CercaContent.astro` | ✅ testato — filtri tradotti IT+EN, URL routing, paginazione |
| Webhook sync automatico | — | 🔴 **ALGOLIA-05 non implementato** — re-indicizzare manualmente dopo ogni pubblicazione |

### Test sistematico (2026-05-04) — risultati

| Test | Esito |
|------|-------|
| Autocomplete header desktop IT/EN | ✅ |
| View Transitions (reinit dopo navigazione) | ✅ |
| Autocomplete mobile | ✅ |
| Pagina `/it/cerca/` — filtri, paginazione, URL routing | ✅ |
| Pagina `/en/search/` — filtri tradotti | ✅ (fix applicato) |
| Language switcher da `/en/search/` → IT | ✅ (fix applicato: `/it/cerca/` diretto) |
| Ricerca per titolo esatto | 🟡 Non sempre primo — ranking post-lancio |
| Ricerca numero per ID (es. "OEL-172") | ✅ (fix: `id_numero` in searchableAttributes) |
| Ricerca autore (es. "Mariangela") | ✅ |
| Link risultati numeri | ✅ (fix: URL `/it/archivio/` corretti) |

### Re-indicizzazione manuale

Finché ALGOLIA-05 non è implementato, ogni volta che si pubblica/modifica un articolo in Directus l'indice Algolia rimane desincronizzato. Per aggiornare:

```bash
node scripts/algolia/index-all.mjs
```

Richiede `.env` con `ALGOLIA_APPLICATION_ID` e `ALGOLIA_WRITE_API`.

### Limiti piano gratuito (Build)

| Limite | Valore | Stato attuale |
|---|---|---|
| Record | 10.000 | 7.502 (75%) — attenzione crescita |
| Ricerche/mese | 10.000 | Da monitorare post-lancio |

**Alert**: configurare notifica email in [Algolia Dashboard → Settings → Billing](https://dashboard.algolia.com) quando si avvicina a 10k ricerche/mese. A regime può essere necessario il piano Grow ($0,50/1k ricerche oltre soglia). Valutare dopo 30 giorni di produzione.

### ⚠️ Test sistematici richiesti prima del go-live

L'implementazione è funzionante su staging ma non è stata testata in modo sistematico. Prima del cutover DNS verificare:

- [ ] Autocomplete header: dropdown appare correttamente digitando ≥2 caratteri
- [ ] Autocomplete header: navigazione tastiera (↑↓ Enter) funziona
- [ ] Autocomplete header: click su risultato porta alla pagina corretta
- [ ] Autocomplete header: invio senza selezionare item porta a `/cerca/?q=...`
- [ ] Autocomplete header: "Vedi tutti i risultati" funziona
- [ ] Autocomplete header: risultati in IT mostrano solo articoli `lang:it`
- [ ] Autocomplete header EN `/en/`: risultati in EN
- [ ] Autocomplete header: View Transitions — dropdown si reinizializza dopo navigazione
- [ ] Autocomplete header: mobile ≤480px — dropdown nascosto, mobile-search-overlay funziona
- [ ] Autocomplete header: mobile 481-767px — form fallback visibile, submit porta a `/cerca/`
- [ ] Pagina `/cerca/`: searchbox, filtri forma/categoria/anno, paginazione
- [ ] Pagina `/cerca/`: pre-popolamento da `?q=` (passaggio da autocomplete)
- [ ] Pagina `/cerca/`: URL routing (back/forward browser mantiene query e filtri)
- [ ] Pagina `/en/search/`: stessa verifica in EN
- [ ] Performance: latenza percepita del dropdown accettabile
- [ ] Indice sincronizzato: pubblicare articolo test → rilanciare script → appare in ricerca

### Note tecniche Algolia

**Compat wrapper algoliasearch v5 + autocomplete-js v1**: `autocomplete-js` v1 chiama `searchClient.search([{indexName, query, params:{...}}])` (API v4 con params annidati). `liteClient` v5 vuole params piatti e `search({ requests: [...] })`. Il wrapper in `AutocompleteWidget.astro` fa il bridge: flatten dei `params` + wrapping in `{ requests }`. Senza questo: HTTP 400 "Expecting a string" da Algolia.

**`algoliasearch` in devDependencies**: il pacchetto è in `devDependencies` perché usato principalmente dallo script di indicizzazione. Vite lo bundla ugualmente nel JS client. Se CF Pages in futuro cambia comportamento su `npm install`, spostarlo in `dependencies`.

**Classi CSS generate da JS**: le classi `.cerca-hit*` dei template `hits()` in `CercaContent.astro` sono generate da InstantSearch.js a runtime → vanno in `<style is:global>`. Le classi `.ais-*` idem.

---

## § Bug Header — ✅ RISOLTO (MOBILE-01, commit `aeb42553`)

**Sintomo originale:** header sticky + overflow-x:hidden su html rompeva sticky su iOS Safari.

**Fix applicato:** header era già `position:fixed` da una versione precedente. MOBILE-01 ha risolto il problema residuo: iOS Safari scroll-lock inaffidabile (body.style.overflow='hidden' non sufficiente) — sostituito con `position:fixed + savedScrollY` sul body durante l'apertura del megamenu. In più: LanguageSelector breakpoint allineato a 768px, fallback `var(--header-height, 72px)`, `overflow-wrap` su `.article-content`.

---

## § Magazine — architettura (2026-04-28)

### Route e componenti

| Pagina | Route IT | Route EN | Componente |
|--------|----------|----------|------------|
| Griglia numeri | `/archivio/` | `/en/archive/` | `ArchivioContent.astro` |
| Singolo numero | `/archivio/[issue]/` | `/en/archive/[issue]/` | `IssueContent.astro` |

### Pill switcher — logica

**Su `/archivio/`:**
- "Ultima edizione" (inattivo) → link a `/archivio/{ultimoSlug}` (da `numeriOrdinati.find(n => n.tipo !== 'ins')`)
- "Tutte le edizioni" (attivo, dark pill) → pagina corrente

**Su `/archivio/[issue]/`:**
- "Ultima edizione" (attivo se `numero.id_numero === ultimoNumeroData.id_numero`, altrimenti link) → `/archivio/{ultimoSlug}` (da `src/data/ultimo-numero.json`)
- "Tutte le edizioni" (inattivo) → link ad `archiveBasePath` (lang-aware)

### Aggiornare l'ultimo numero

`src/data/ultimo-numero.json` va aggiornato manualmente (o via webhook ALGOLIA-05) quando esce un nuovo numero. Campi: `id_numero`, `copertina_url`, `titolo_numero`, `numero_progressivo`, `anno_pubblicazione`, `periodo_label`.

### IssueNavPill (telecomandino)

Il pill flottante prev/next in basso è **separato** dal pill switcher in testa. Non è ridondante: serve per navigare sequenzialmente tra numeri senza tornare alla griglia. Centro ora mostra "Magazine" (era "Archivio") con link lang-aware ad `archiveBasePath`.

---

## § Directus — Audit permessi ruolo Redazione (2026-05-01)

### Configurazione finale policy Redazione (`0a5492ea`)

| Collection | CREATE | READ | UPDATE | DELETE | Note |
|---|---|---|---|---|---|
| `articoli` | `*` | 27 campi | `*` | — | READ esclude: slug, lang, wp_id, original_url, articolo_traduzione, cluster_id, umap_*, data_creazione, data_aggiornamento |
| `articoli_tags` | `*` | `*` | `*` | `*` | M2M tag |
| `articoli_temi` | `*` | `*` | `*` | `*` | M2M temi |
| `autori` | `*` | `*` | `*` | — | |
| `categorie_articoli` | `*` | `*` | `*` | `*` | M2M categorie |
| `directus_files` | `*` | `*` | `*` | — | Necessario per upload immagini copertina |
| `numeri_rivista` | `*` | `*` | `*` | — | Per creazione OEL-173 e successive |
| `tags` | `*` | `*` | `*` | — | READ necessario per M2M display in articoli |
| `temi` | `*` | `*` | `*` | — | READ necessario per M2M display in articoli |
| `verticali` | — | `*` | — | — | Solo lettura focus page |
| `verticale_blocchi` | — | `*` | — | — | Solo lettura |
| `verticale_blocchi_articoli` | — | `*` | — | — | Solo lettura |

**Categorie e serie:** nascoste globalmente dalla nav (`hidden: true` su `directus_collections`) — API e M2M continuano a funzionare.

### Bug critici trovati e risolti

**1. Nessun accesso a `directus_files`**
Mancava il permesso CREATE/READ/UPDATE su `directus_files`. La Redazione non poteva fare upload di nessuna immagine. Aggiunto.

**2. Permissions filter bloccava articoli published**
Il permesso UPDATE aveva un filtro record `{"stato": {"_in": ["draft", "review"]}}` — la Redazione non poteva modificare articoli già published. Su ogni campo compariva il simbolo "divieto". Trovato anche un `validation` identico che impediva di impostare `stato: published`. Entrambi rimossi.

**3. Campi tecnici visibili**
READ con `fields: *` mostrava slug, lang, wp_id, original_url, articolo_traduzione, cluster_id, umap_x/y/z. Ora READ è ristretto a 27 campi editoriali.

**4. Categorie e Serie nel menu**
Visibili nella nav laterale ma non utili per uso editoriale. Nascoste globalmente.

### Account di test
- `redazione-uat@ombreeluci.it` — da eliminare prima del go-live (UAT-CLEANUP)
- Credenziali in `STATO.md § Riferimenti rapidi`

---

## Fix recenti (2026-05-01)

| Commit | Fix |
|--------|-----|
| `01456a13` | **B-14** refactor(routing): prefisso `/it/` su tutte le route IT — 20 file spostati in `src/pages/it/`, import path corretti, redirect root→/it/ in astro.config.mjs, sitemap aggiornata, CLAUDE.md aggiornata |
| `aeb42553` | **MOBILE-01** fix(mobile): iOS Safari scroll-lock megamenu (position:fixed+savedScrollY), LanguageSelector breakpoint 767→768px, var(--header-height,72px) fallback, overflow-wrap su .article-content |
| `f326b0ea` | **B-06/PERM-DIR** docs(directus): audit e fix permessi ruolo Redazione — directus_files aggiunto, filter stato su UPDATE rimosso, READ limitato a 27 campi, categorie/serie nascoste |
| `546aeeca` | **SEC-01/UX-19** fix: public/_headers security headers, pagine test eliminate, dead code ArticleListRow rimosso, BUG-REGEX encoding fixato in Directus, PF-01 chiuso |
| `d9883183` | fix(mobile): `body { overflow-x: clip }` aggiunto come secondo livello anti-scroll-orizzontale; `white-space:nowrap` rimosso da `.author-row` in ArticleCard+ArticoliRullo (causava overflow su card strette) |
| `2d8cba4e` | feat(focus): `FocusListingContent.astro` + route `/it/focus/index.astro` + `/en/focus/index.astro` — listing delle verticali live per entrambe le lingue. CLAUDE.md aggiornato con nuova riga nella tabella componenti condivisi. |
| `4a6f0b6c` | feat(focus): 4 hero cover image specifiche per le pagine Focus caricate in Directus e nel repo (`public/images/focus-cover-*.jpg`). Script `scripts/create-verticali.py` committato. |
| Directus | Populate 5 nuove verticali via API: Autismo (ID=3), Noi papà (ID=4), Aktion T4 (ID=5), Cinema e disabilità (ID=6), Ciao Stefano (ID=7). 43 articoli collegati complessivamente. Hero immagini assegnate. |

---

## Fix recenti (2026-04-30)

| Commit | Fix |
|--------|-----|
| `038f1b21` | fix(verticali): `<main class="site-main">` aggiunto in `VerticaleContent.astro` — il footer appariva sopra al contenuto delle focus page perché il layout usa `site-main` come elemento che copre il footer fixed. Regola: ogni componente che usa `BaseLayout` deve wrappare il contenuto in `<main class="site-main">`. |
| `4f516c76` | fix(css): CSS di `ArticleCard.astro` spostata in `global.css` — le focus page caricavano HTML corretto (14 card) ma senza stili, perché Vite metteva le scoped styles di ArticleCard in un chunk condiviso non linkato alle nuove route. Soluzione definitiva: `ArticleCard` è una primitiva UI globale, la sua CSS appartiene a `global.css`. Il blocco `<style>` è stato rimosso da `ArticleCard.astro`. |

---

## Fix recenti (2026-04-29)

| Commit | Fix |
|--------|-----|
| — | `ArticleCard.astro`: link autore hardcoded `/autori/` → ora usa `getAuthorBasePath(lang)` da `i18n.ts`. Per EN genera `/en/authors/`, per lingue future basta estendere `Locale` — zero modifiche ai componenti. |

---

## Note tecniche (casi documentati)

### Vite CSS chunk splitting — primitiva UI globale (2026-04-30)

Quando una nuova route Astro importa un componente a ≥3 livelli di profondità (route → A → B → C), Vite può mettere la CSS scoped di C in un chunk condiviso e **non aggiungere il `<link>` a quel chunk nell'HTML della nuova route**. Risultato: HTML corretto, CSS mancante.

**Fix architetturale**: le CSS di componenti usati ovunque (primitiva UI globale) non devono stare in `<style>` scoped del componente — devono stare in `global.css`. `ArticleCard.astro` è il caso canonico: usato su home, categoria, autori, focus. Il suo `<style>` è stato rimosso e la CSS è in `global.css` (`/* ── ArticleCard ──`).

**Regola pratica**: se un componente `.astro` viene importato e renderizzato in almeno 4-5 pagine diverse del sito, valutare di spostare la sua CSS in `global.css`. I nomi di classe sono abbastanza univoci da non richiedere scoping.

**NON fare**: aggiungere `import ComponenteX from './ComponenteX.astro'` senza renderizzare il componente solo per "forzare" la CSS — Astro include la CSS scoped solo per componenti che vengono effettivamente renderizzati, non solo importati.

### CSS leak is:global — ArticlePageLayout (2026-04-24)
`.article-meta` e `.article-title` con `is:global` fuoriuscivano in `ArticleCard`. Fix: override scoped in `ArticleCard.astro`. Regola: `is:global` in componenti condivisi richiede prefisso wrapper univoco.

### Routing _routes.json e catch-all SSR (aggiornato 2026-04-25)

Regola corretta (2026-04-25): NON aggiungere wildcard manuali in `extend.exclude`
per route prerender dinamiche. Astro/CF Pages genera automaticamente le entry
specifiche per ogni pagina SSG. I wildcard manuali (es. `/categoria/*`) causano
overlap con quelle entry → build failure Error 8000057.

Usare `extend.exclude` SOLO per pattern che Astro non genera automaticamente:
```js
{ pattern: '/debug/*' },  // pagine non-SSG
{ pattern: '/test-*' },   // pagine non-SSG
```

Commit `34fbd576`.

### EN articoli traduzione AI — 3470 published (2026-04-25)

Pipeline traduzione AI completata. 3470 articoli EN published in Directus. I 131 EN originali (traduzione manuale da WP) restano invariati. Qualità da auditare post-lancio — non blocca il cutover. Route `en/[slug].astro` li serve via lookup a due tentativi: prima slug esatto, poi slug + `-en`. DA-06 aggiornato in backlog post-lancio.

### Bug strutturali EN — stato aggiornato (2026-04-25)

**S1 — Slug URL EN non normalizzati** — ⏳ bassa priorità fino a pubblicazione articoli AI
42 articoli con suffisso `-en` nel DB: la route li trova via lookup a due tentativi (entrambi i formati URL funzionano). I 3339 AI sono draft → impatto reale quasi zero. Fix da fare prima di pubblicare gli AI: `toArticleUrlSlug(slug, lang)` in `src/utils/i18n.ts`, applicato ovunque si costruisce `href` per articoli non-IT.

**S2 — CHIUSO, ERA FALSO** (verificato 2026-04-25)
La pipeline AI HA copiato `categoria_menu` correttamente per il 99% degli articoli (valori slug IT, non tradotti). Il 4 vs 237 su `/en/category/projects/` è perché 231 articoli sono draft. Zero codice da toccare — si risolve da solo quando gli AI vengono pubblicati dopo QA.

**S3 — FIXATO** (feat/static-pages-en, 2026-04-25)
`LanguageSelector.astro`: già aveva fallback `alternateArticleUrl ?? '/en'`. `en/category/[slug].astro`: ora fa `redirect('/en/', 302)` invece di 404 quando 0 articoli published.

### BUG-REGEX — SyntaxError "missing ) in parenthetical" su articoli specifici (2026-04-27)

`Uncaught SyntaxError: missing ) in parenthetical` in console su `/it/la-costituzione-dei-poveri-recensione` e `/en/the-constitution-of-the-poor-book-review`. Errore client-side in `hoisted.*.js` alla riga 7 e 19 dell'articolo compilato. Causa probabile: il `corpo` dell'articolo contiene un carattere (es. `(` senza `)` corrispondente, o un pattern che JS interpreta come regex malformata) che viene usato in un contesto RegExp da qualche componente client. Limitato a questi due articoli (IT+EN stesso pezzo). **Da investigare in sessione separata**: aprire l'articolo in Directus, cercare parentesi non bilanciate o caratteri speciali nel campo `corpo` o `titolo`.

### basePath default '' non '/' (2026-04-24)
`ArticleCard.astro` e `ArticoliRullo.astro` avevano `basePath='/'` → href `//slug`. Fix: `basePath=''`. Commit `57100eff`.

### Auth EditorialFeedback (2026-04-24)
`display:inline-flex` CSS batteva `[hidden]`. Fix: `[hidden]{display:none!important}` in `global.css`.

### GET /users/me → 401 in console (non è un bug)
`EditorialFeedback.astro` chiama `https://cms.ombreeluci.it/users/me` con `credentials:include` per verificare se l'utente è loggato su Directus e mostrare il pulsante Edit. Il 401 in console è normale per utenti non autenticati — il codice lo gestisce (`r.ok === false`). CORS configurato correttamente (`access-control-allow-credentials: true`, origin staging/prod whitelist). Nessuna azione richiesta.

### Middleware Astro/CF Pages — catch-all obbligatorio
Il middleware gira solo per route nel manifest. Fix: `[...path].astro` catch-all SSR garantisce che tutti i path abbiano una route.

---

## Backlog post-lancio

| ID | Area | Descrizione |
|----|------|-------------|
| DA-03 | Infra | Upgrade VPS CX23 → CX32 (prerequisito pgvector) |
| DA-04 | AI | Ricerca semantica + correlati pgvector (dopo DA-03) |
| DA-05 | Dati | 37 numeri rivista senza `pdf_archive_url`: scraping Archive.org |
| DA-06 | Traduzioni | ✅ Pipeline traduzione AI IT→EN completata — 3470 articoli EN published (2026-04-25). Audit qualità post-lancio. |
| DA-06-ES | Traduzioni | Pipeline spagnolo — dopo chiusura EN |
| TAG-01 | Frontend | ✅ **CHIUSO 2026-04-27** — Tag visibili nella pagina articolo IT (righe 643-649 di `it/[slug].astro`). Su EN nascosti con `.article-tags-list--hidden` finché Directus non ha `nome_en`/`slug_en`. |
| DIR-01 | Directus | Pannello "Articoli correlati" in Directus durante scrittura |
| DIR-02 | Directus | Suggerimenti AI durante scrittura (Claude API) — dopo DA-03+DA-04 |
| SEARCH-02 | Ricerca | Algolia avanzato: faceting, ranking, as-you-type (dopo SEARCH-01 stabile) |
| GR-04 | Crescita | Google AdSense (dopo lancio, via GTM) |
| GR-05 | Crescita | Newsletter Mailchimp form moderno |
| GR-06 | Crescita | CTA dinamiche a fine articolo |
| GR-07 | Crescita | Pagina `/newsletter` dedicata |
| GR-CTA | Crescita | ✅ **CHIUSO 2026-04-27** — CTA Sostienici implementate. 3 varianti (sage/peach/amber) su articoli IT+EN, banner con immagine su archivio e numeri. Dati in `src/data/cta.json`. Tracking: UTM + `data-cta-id`. Vedi § GR-CTA per architettura. |
| UX-07 | UX | Articolo su mobile: padding, tipografia fluida, capolettera |
| UX-10 | UX | Selettore lingua: nascondere se non esiste traduzione |
| UX-BIO | UX | ✅ **CHIUSO 2026-04-27** — Bio autore troncata a 200 caratteri con link "Leggi di più →" alla pagina autore. Implementato in `it/[slug].astro` e `en/[slug].astro`. |
| UX-CMT | UX | ✅ **CHIUSO 2026-04-27** — Form commenti in accordion `<details>/<summary>`: "Mostra commenti (N)" solo se presenti; "Lascia un commento" sempre. Entrambi chiusi di default. File: `src/components/Commenti.astro`. |
| ARCH-02 | UX | ✅ **CHIUSO 2026-04-28** — Magazine redesign completo. Label "Archivio"→"Magazine" ovunque; pill switcher centrato (vita.it style) su `/archivio/` e pagine numero; "Ultima edizione" = link diretto al numero, "Tutte le edizioni" = griglia filtri. IssueNavPill aggiornato a "Magazine". Header link più pesanti, form ricerca più larga. |
| DIR-TAG-EN | Directus | Aggiungere `nome_en` e `slug_en` alla collection `tags` in Directus. Prerequisito per mostrare tag sugli articoli EN. Attualmente i tag EN sono nascosti con `.article-tags-list--hidden` (nota in `ArticlePageLayout.astro`). |
| DID-EN | Traduzione | ✅ **CHIUSO 2026-05-08** — 1965 didascalie tradotte IT→EN con Haiku. Campo `didascalia_en` creato in Directus, codice `en/[slug].astro` aggiornato (commit `78a453ea`). |
| BIO-EN | Traduzione | ✅ **CHIUSO 2026-05-07** — 79 bio autori tradotte IT→EN con Haiku. Campo `bio_en` popolato. Script: `scripts/traduzione/translate-bio.mjs`. |
| BIO-EN-ART | Traduzione | ✅ **CHIUSO 2026-04-27** — `en/[slug].astro`: `authorBioHtml` ora usa `bio_en` se disponibile, con fallback a `bio_html` IT. |
| STUDIOSI | Frontend | ✅ **CHIUSO 2026-05-07** — Pagina studiosi/educatori/attivisti IT (`/it/studiosi-educatori-attivisti/`) + EN (`/en/scholars-educators-activists/`). 47 autori curati in `src/data/studiosi.json`. Redirect WP in `astro.config.mjs`. |
| PF-03 | Perf | Immagini non responsive: srcset mancante |
| PF-04 | Perf | CSS render-blocking |
| B-09 | Infra | UptimeRobot monitoring |
| B-10 | Infra | Slack alert build GH Actions |
| fedeeluce | Infra | Directus multi-tenant per fedeeluce.it |
| IMMAGINI-MULTI [da bug_ux_ui.md] | Directus | Possibilità di inserire più immagini contemporaneamente nell'articolo (upload multiplo). Via: configurazione campo Directus. Aperto, nessun lavoro iniziato — trovato solo nel bug tracker (sezione "Redazione — segnalazioni 2026-05-08"), non aveva riga di backlog qui. |
| FOTO-CROP-JEAN-VANIER [da bug_ux_ui.md] | Contenuti/UX | Segnalato 2026-07-27 (Jean Vanier "Le sacrament de la tendresse"): l'immagine di copertina è sempre servita con crop fisso `?width=400&height=280&fit=cover` (aspect ratio 10:7) in ricerca/liste — se la foto originale ha un aspect ratio molto diverso il crop può tagliare il soggetto in modo indesiderato anche con editing corretto in Photopea a monte. Non è certo sia un bug (potrebbe essere il comportamento "cover" atteso). **Da fare:** verificare con Cristina quale visualizzazione specifica (articolo/card/ricerca) mostra la foto storta, poi decidere se serve un punto di focus/crop manuale invece del cover automatico. |
| ~~PERF-IMG-RESIZE-DIRECTUS~~ | Perf | ✅ **Verificato risolto (2026-08-12), non più da fare.** `bug_ux_ui.md` segnalava foto autori/diaristi servite senza resize. Grep puntuale sul codice attuale: `foto_url` viene costruito con `getAutoreImageUrl(a.foto.id)` (200×200 WebP) in tutti i 4 punti dove viene assegnato (`src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/it/rubriche/diari.astro`, `src/pages/en/sections/diaries.astro`), e `AuthorPageContent.astro`/`StudosiContent.astro`/le pagine `[diario].astro` usano `getAutoreImageUrl()` direttamente. La entry di cutover era corretta — copriva anche questi casi, non solo le copertine articolo. |

---

## Pulizia tecnica

| Cosa | Azione |
|------|--------|
| Branch locali morti | Eliminare: `feat/arch-04-ssr`, `feat/articoli-rullo`, `feat/directus-migration`, `feat/i18n-master-plan`, `feat/seo-ux-improvements`, `hardening/resilience`, `master`, `safe/feat-i18n-align` |
| File legacy in `src/data/` | Spostare in `_archive/`: `estrai_tutto.json`, `database_autori.csv`, `_legacy_articoli_megacluster.json`, `numeri_consolidati.json`, `media_articoli.csv` |
| `blog/en.astro` | Verificare se sostituibile da `/en/index.astro` |
| Mappe hardcoded `CAT_IT_TO_EN_SLUG` in `i18n.ts` | ✅ già rimosse — `categorie.json` è fonte unica |
| `src/components/ArticleListRow.astro` | **Dead code** (2026-04-29): il componente esiste ma non è importato da nessun file. Non ha prop `lang`, hardcoda `/it/` e `it-IT`. Valutare: eliminare o adattare se si vuole usarlo in futuro (in quel caso aggiungere `lang`, `basePath`, `t()` come in `ArticleCard`). |

---

## Riferimenti rapidi

| Cosa | Valore |
|------|--------|
| Staging | https://ombreeluci-staging.pages.dev |
| CMS | https://cms.ombreeluci.it |
| Repo | SegreteriaFL/ombreeluci-astro |
| VPS | 159.69.196.64 — Hetzner CX23, Ubuntu 24.04, €4.09/mese |
| CF Account ID | `6b071de7f55397ada5645e187c932202` |
| CF Zone ID | `0cc4507d662828548b5f9f90e4b2d494` |
| R2 bucket | `oel-media` — pub: `pub-2251dc2142e3492a961f629f2af543d0.r2.dev` |
| Credenziali VPS | `vps_credentials.txt` (locale — non committare mai) |
| Utente Redazione UAT | `redazione-uat@ombreeluci.it` / `OmbreLuci2026!` — **eliminare prima del go-live** |
| Algolia App ID | in `.env` come `ALGOLIA_APP_ID` |
| Algolia Index | `ombreeluci_articoli` |

---

## § Test UX/UI pre-lancio

Checklist da eseguire **manualmente** su staging prima del cutover DNS. Testare su device fisici quando possibile, non solo emulatori.

### Viewport da testare
- 375px (iPhone SE, scenario critico)
- 390px (iPhone 14)
- 768px (iPad portrait)
- 1024px (iPad landscape / laptop entry)
- 1440px (desktop standard)

### Header e navigazione
- [ ] Logo cliccabile → homepage IT
- [ ] Mega menu: apertura hover/click su ogni voce di primo livello
- [ ] Mega menu: chiusura cliccando fuori o premendo Esc
- [ ] Mega menu: tutti i link secondari portano alla pagina corretta
- [ ] Mega menu: su mobile (<768px) si trasforma in menu hamburger
- [ ] Menu hamburger: apertura, chiusura, tutti i link funzionanti
- [ ] Language selector IT: visibile in ogni pagina IT, porta alla versione EN corrispondente
- [ ] Language selector EN: visibile in ogni pagina EN, porta alla versione IT corrispondente
- [ ] Language selector: se nessuna traduzione disponibile → homepage della lingua target (non link rotto)
- [ ] Barra di ricerca header: visible su desktop ≥481px, icon only su mobile
- [ ] Mobile search overlay: tap sull'icona apre overlay, focus nel campo, invio porta a `/cerca/`
- [ ] View Transitions: navigare tra pagine → header non flickera, stato non si perde

### Homepage IT `/`
- [ ] Grid articoli principale: layout corretto su ogni viewport
- [ ] Articoli in evidenza: immagini caricate, titoli, autori, date visibili
- [ ] Sezioni categorie: link funzionanti
- [ ] Ricarica: rotazione articoli in evidenza funziona
- [ ] Nessun overflow orizzontale a 375px
- [ ] CTA newsletter (se presente): link funzionante

### Homepage EN `/en/`
- [ ] Stessa verifica della IT

### Pagina articolo IT `/it/{slug}/`
- [ ] Titolo, sottotitolo, data, autore, tempo di lettura visibili
- [ ] Badge categoria + numero rivista cliccabili
- [ ] Immagine copertina: caricata, nessun layout shift
- [ ] Didascalia immagine: visibile, icona camera
- [ ] Corpo dell'articolo: testo leggibile, paragrafi spaziati
- [ ] Video YouTube embedded: riproduzione funzionante
- [ ] Embed Instagram (dove presenti): caricamento embed
- [ ] Alert articoli archivio (<2000): banner giallo visibile
- [ ] "Leggi anche" in-content: card visibile dopo 3° paragrafo
- [ ] Tag in fondo: visibili, link a `/tag/{slug}` funzionante
- [ ] Bio autore in calce: immagine o placeholder, nome linkato alla pagina autore
- [ ] Articoli correlati in calce: griglia 3 (desktop) / 2 (tablet) / 1 (mobile <480px)
- [ ] Social sticky bar: visibile su desktop, inline su mobile
- [ ] Condivisione Facebook/X/WhatsApp/LinkedIn: link corretti
- [ ] Copia link: funzione clipboard attiva
- [ ] Reading progress bar: avanza durante lo scroll
- [ ] Widget floating (dopo 50% scroll): appare, si chiude con X
- [ ] Form commenti: nome, email, testo, invio, messaggio di conferma
- [ ] Language switch: porta alla versione EN dell'articolo (o homepage EN se non tradotto)

### Pagina articolo EN `/en/{slug}/`
- [ ] Stessa verifica IT + verificare che tag siano nascosti (`.article-tags-list--hidden`) finché non c'è `nome_en`
- [ ] Bio autore: mostra `bio_en` se disponibile, altrimenti `bio_html` IT

### Categoria IT `/categoria/{slug}/`
- [ ] Lista articoli: card corrette, paginazione funzionante
- [ ] Categoria EN `/en/category/{slug}/`: stessa verifica
- [ ] Categoria senza articoli pubblicati: redirect a `/en/` (non 404)

### Rubriche IT `/rubriche/{slug}/`
- [ ] Lista articoli della rubrica
- [ ] Filtro per tipo recensione in `/rubriche/recensioni/` (se implementato)
- [ ] Versione EN `/en/sections/{slug}/`: stessa struttura

### Tag IT `/tag/{slug}/`
- [ ] Solo articoli `lang=it` mostrati (fix 2026-04-27)
- [ ] EN `/en/tag/{slug}/`: solo articoli `lang=en`

### Archivio `/archivio/`
- [ ] Lista numeri rivista: copertine, titoli, anno
- [ ] Singolo numero `/archivio/oel-171/`: sommario, articoli, nav prev/next
- [ ] Nav prev/next: link corretti senza doppio `/archivio//archivio/` (fix 2026-04-27)
- [ ] EN `/en/archive/` e `/en/archive/oel-171/`: stessa verifica

### Diari `/diari/{slug}/` e `/en/diaries/{slug}/`
- [ ] Singolo diario: layout, articoli del diario
- [ ] Hub diari: lista diari

### Autori `/autori/`
- [ ] Lista autori: griglia, foto o placeholder, link funzionanti
- [ ] Singolo autore `/autori/{slug}/`: bio, lista articoli, foto
- [ ] EN `/en/authors/` e `/en/authors/{slug}/`: stessa verifica

### Cerca `/cerca/` e `/en/search/`
- [ ] Searchbox: inserire query → risultati appaiono
- [ ] Filtri forma/categoria/anno: funzionanti, URL aggiornato
- [ ] URL routing: back/forward browser mantiene query e filtri
- [ ] Pre-popolamento da `?q=` (passaggio da autocomplete header)
- [ ] Paginazione risultati
- [ ] Nessun risultato: messaggio appropriato

### Pagine statiche
- [ ] `/chi-siamo/`: redazione, contatti, tutte le sezioni visibili
- [ ] `/sostienici`: CTA, info donazione
- [ ] `/newsletter`: form iscrizione funzionante
- [ ] EN `/en/about/`, `/en/support-us/`, `/en/newsletter/`: verificare

### Accessibility (campione)
- [ ] Focus visibile su tutti gli elementi interattivi (link, bottoni, input)
- [ ] Navigazione tastiera: Tab attraversa header, nav, form, footer in ordine logico
- [ ] Aria-labels su elementi senza testo visibile (icon links social, menu hamburger)
- [ ] Contrasto testo: leggibile su tutti i background (bianco, crema, card)
- [ ] `lang` attribute corretto su `<html>` (it/en in base alla pagina)
- [ ] Immagini: `alt` significativo o `alt=""` se decorative

---

## § Validazione backend pre-lancio

Checklist sistematica da eseguire prima del cutover DNS. Per ogni item: metodo di verifica indicato.

### HTTP Status & redirect

- [ ] **Homepage** `curl -I https://ombreeluci-staging.pages.dev/` → 200
- [ ] **Articolo IT** `curl -I https://ombreeluci-staging.pages.dev/it/storia-di-un-padre/` → 200
- [ ] **Articolo EN** `curl -I https://ombreeluci-staging.pages.dev/en/the-dandelion-project/` → 200
- [ ] **Redirect /blog/** `curl -I https://ombreeluci-staging.pages.dev/blog/storia-di-un-padre/` → 301 verso `/it/storia-di-un-padre/`
- [ ] **Redirect date-based** `curl -I https://ombreeluci-staging.pages.dev/2015/03/12/some-slug/` → 301
- [ ] **Redirect /dona** `curl -I https://ombreeluci-staging.pages.dev/dona` → 301 verso `/sostienici`
- [ ] **Articolo inesistente** `curl -I https://ombreeluci-staging.pages.dev/it/slug-che-non-esiste/` → 404
- [ ] **Tag EN** `curl -I https://ombreeluci-staging.pages.dev/en/tag/disability/` → 200 o 404 se non esiste
- [ ] **Categoria EN senza articoli** → 302 verso `/en/` (non 404)

### Canonical e hreflang

- [ ] **Articolo IT**: `<link rel="canonical">` punta a `https://ombreeluci.it/it/{slug}/` (non localhost, non staging)
- [ ] **Articolo IT**: `<link rel="alternate" hreflang="en">` punta all'URL EN corrispondente
- [ ] **Articolo IT**: `<link rel="alternate" hreflang="x-default">` punta all'IT
- [ ] **Articolo EN**: canonical punta a `https://ombreeluci.it/en/{slug}/`
- [ ] **Homepage**: canonical `https://ombreeluci.it/`, hreflang it + en + x-default
- `curl -s https://ombreeluci-staging.pages.dev/it/storia-di-un-padre/ | grep -E 'canonical|hreflang'`

### robots.txt — AZIONE PRE-LANCIO CRITICA

- [ ] **PRIMA del cutover**: sostituire `Disallow: /` con regole permissive (vedi testo in `public/robots.txt`)
- [ ] **Formato finale**:
  ```
  User-agent: *
  Disallow: /api/
  Disallow: /debug/
  Disallow: /test-*
  Sitemap: https://ombreeluci.it/sitemap.xml
  ```
- [ ] Verificare dopo deploy: `curl https://ombreeluci.it/robots.txt`

### noindex sweep — ⚠️ ULTIMA AZIONE PRIMA DEL CUTOVER DNS — NON PRIMA

**REGOLA ASSOLUTA: non toccare `noindex` finché il sito è su staging.**
Rimuovere il `noindex` con il sito ancora su staging = Google indicizza staging.ombreeluci.pages.dev invece di ombreeluci.it.
Questo sweep si fa in un commit dedicato, immediatamente prima del cambio DNS, contestualmente all'apertura di `robots.txt`.

Sequenza corretta al cutover:
1. TTL DNS abbassato (24h prima)
2. Build finale pulita
3. **Commit noindex sweep** (questo)
4. **Commit robots.txt aperto**
5. Deploy su CF Pages
6. Cambio record DNS → ombreeluci.it
7. Verifica in GSC entro 24h

Pagine da cui rimuovere `noindex={true}` (path aggiornati dopo B-14):

- [ ] `src/pages/index.astro` (homepage IT)
- [ ] `src/pages/it/[slug].astro` (articoli IT — BLOCCANTE SEO)
- [ ] `src/pages/it/categoria/[categoria].astro`
- [ ] `src/pages/it/archivio/index.astro`
- [ ] `src/pages/it/archivio/[issue].astro`
- [ ] `src/pages/it/archivio/web-only.astro`
- [ ] `src/pages/it/autori/index.astro`
- [ ] `src/pages/it/autori/[slug].astro`
- [ ] `src/pages/it/rubriche/[rubrica].astro`
- [ ] `src/pages/it/rubriche/diari.astro`
- [ ] `src/pages/it/tag/[slug].astro`
- [ ] `src/pages/it/diari/[diario].astro`
- [ ] `src/pages/it/chi-siamo/index.astro`
- [ ] `src/pages/it/sostienici/index.astro`
- [ ] `src/pages/it/newsletter/index.astro`
- [ ] `src/pages/it/focus/index.astro`
- [ ] `src/pages/it/focus/[vertical].astro`
- [ ] `src/pages/en/index.astro`
- [ ] `src/pages/en/[slug].astro` (articoli EN)
- [ ] `src/pages/en/category/[slug].astro`
- [ ] `src/pages/en/sections/[slug].astro`
- [ ] `src/pages/en/sections/diaries.astro`
- [ ] `src/pages/en/archive/index.astro`
- [ ] `src/pages/en/archive/[issue].astro`
- [ ] `src/pages/en/archive/web-only.astro`
- [ ] `src/pages/en/authors/index.astro`
- [ ] `src/pages/en/authors/[slug].astro`
- [ ] `src/pages/en/diaries/[diario].astro`
- [ ] `src/pages/en/about/index.astro`
- [ ] `src/pages/en/newsletter/index.astro`
- [ ] `src/pages/en/focus/index.astro`
- [ ] `src/pages/en/focus/[vertical].astro`

Pagine che devono restare `noindex=true`:
- `src/pages/404.astro`
- `src/pages/it/cerca/index.astro` e `src/pages/en/search/index.astro`
- `src/pages/en/tag/[slug].astro` (decide redazione — contenuto duplicato potenziale)
- Tutto sotto `src/pages/debug/` e `src/pages/test-*.astro`
- Sottopagine chi-siamo (la-redazione, redazione-storica, collaboratori, ecc.) — già reindirizzate in astro.config.mjs

### Sitemap

- [ ] `curl https://ombreeluci-staging.pages.dev/sitemap.xml` → XML valido
- [ ] Sitemap contiene articoli IT (verificare campione slug)
- [ ] Sitemap NON contiene URL staging (tutte le URL puntano a `ombreeluci.it`)
- [ ] Registrare sitemap in Google Search Console dopo il cutover: `https://ombreeluci.it/sitemap.xml`
- [ ] **Gap**: sitemap attuale non include articoli EN, numeri archivio, pagine autore → aggiornare `sitemap.xml.ts` (B-16)

### Performance (campione)

- [ ] **Placeholder copertina** (4.2MB) — `curl -I https://pub-...r2.dev/images/placeholder-copertina.svg` → verificare dimensione. PF-01 da chiudere.
- [ ] **Cache-Control R2** — `curl -I https://pub-...r2.dev/copertine/{uuid}.jpg` → header `Cache-Control` presente con `max-age`. PF-02 da chiudere.
- [ ] **LCP articolo** — Chrome DevTools Lighthouse su articolo IT → LCP <2.5s su connection fast 4G
- [ ] **CLS** — Cumulative Layout Shift <0.1 su homepage e articolo

### Security headers

- [ ] `curl -I https://ombreeluci-staging.pages.dev/` → verificare presenza di:
  - `X-Frame-Options: DENY` (o CSP `frame-ancestors 'none'`)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy`
  - Se assenti: aggiungere via Cloudflare Transform Rules o `_headers` file in `public/`

### API e form

- [ ] **Form commento**: inviare commento di test su articolo staging → risposta JSON `{ ok: true }` o errore leggibile
- [ ] **Honeypot commento**: compilare campo `hp` nascosto → commento NON inviato (stato: implementato, da testare)
- [ ] **API /api/revalidate**: endpoint presente (`src/pages/api/revalidate.ts`) — verificare che richieda auth token
- [ ] **Webhook Algolia** (ALGOLIA-05, non ancora implementato): quando implementato, test: pubblica articolo → appare in ricerca entro 60s

### Broken links (campione)

- [ ] Navigare le 10 pagine più trafficate (homepage, 5 articoli top, 2 categorie, archivio, chi-siamo) → nessun link 404
- [ ] Strumento: usare [Broken Link Checker](https://www.brokenlinkcheck.com/) o `wget --spider -r --no-verbose -l 2`

### Directus CMS

- [ ] Login con account Redazione UAT → può creare articolo, modificare, pubblicare
- [ ] Login con account Redazione UAT → NON può vedere menu admin (utenti, permessi, ecc.)
- [ ] **Eliminare account UAT prima del go-live**: `redazione-uat@ombreeluci.it` (UAT-CLEANUP)
- [ ] Immagini R2: upload copertina → appare nel sito entro build o SSR

### DNS cutover checklist finale

- [ ] robots.txt aperto (Disallow: /)
- [ ] noindex rimosso da pagine indicizzabili
- [ ] Analytics attivi (almeno CF Web Analytics)
- [ ] Sitemap registrata in Search Console
- [ ] UptimeRobot configurato (B-09)
- [ ] DNS propagato (TTL basso impostato in anticipo)
- [ ] Test su URL produzione: home, articolo, categoria, cerca

---

## § Redirect pre-lancio

### Stato implementazione redirect (verificato 2026-04-27)

**Layer 1 — `astro.config.mjs` (redirect statici Astro)**

6 redirect hardcoded:
- `/dona` → `/sostienici`
- `/contribuisci` → `/sostienici`
- `/about` → `/chi-siamo`
- `/chi-siamo/la-rivista` → `/chi-siamo#la-rivista`
- `/chi-siamo/la-redazione` → `/chi-siamo#la-redazione`
- `/chi-siamo/redazione-storica` → `/chi-siamo#redazione-storica`
- `/chi-siamo/collaboratori` → `/chi-siamo#collaboratori`
- `/chi-siamo/hanno-scritto-per-noi` → `/chi-siamo#hanno-scritto-per-noi`
- `/chi-siamo/contatti` → `/chi-siamo#contatti`
- `/blog/en` → `/en/`

**Layer 2 — `src/middleware.ts` (redirect pattern)**

| Pattern | Target | Note |
|---------|--------|-------|
| `/blog/{slug}-en/` | `/en/{slug}/` 301 | Articoli EN vecchi URL |
| `/diario-di-{*}/` | `/diari/diario-di-{*}/` 301 | Backward compat diari |
| `/blog/{slug}/` | `/it/{slug}/` 301 | Articoli IT WP |
| chiavi in `redirects-legacy.json` | `https://ombreeluci.it{target}` 301 | Slug WP anomali |
| `/YYYY/MM/DD/{slug}/` | `https://ombreeluci.it/it/{slug}` 301 | Date-based WP URLs |
| `/YYYY/MM/{slug}/` | `https://ombreeluci.it/it/{slug}` 301 | Year-month WP URLs |

⚠️ **Bug noto**: i redirect `REDIRECTS[path]` e date-based usano `https://ombreeluci.it` come prefisso hardcoded. Su staging questo genera redirect a produzione (non a staging). In produzione funziona correttamente. Non blocca il lancio ma da tenere presente per debug su staging.

**Layer 3 — `src/data/redirects-legacy.json`**

1001 voci di redirect specifici per slug WP problematici (slug troncati, caratteri speciali, alias, etc.). Copertura verificata: ✅ presente e attivo.

### Pattern WP mancanti — da valutare

| Pattern URL WP | Stato | Priorità |
|----------------|-------|----------|
| `/?p={ID}` (link per ID WordPress) | ❌ Non gestito | Alta — link in email/newsletter puntano qui |
| `/author/{slug}/` (tassonomia WP author) | ❌ Non gestito | Media — link SEO WP |
| `/category/{slug}/` (tassonomia WP category) | ❌ Non gestito | Media |
| `/tag/{wp-slug}/` (tassonomia WP tag) | ❌ Non gestito | Bassa |
| `/?s={query}` (ricerca WP) | ❌ Non gestito | Bassa — redirigere a `/cerca/` |
| `/feed/` e `/feed/rss/` | ❌ Non gestito | Bassa — 410 o feed Astro |
| `/wp-content/uploads/` | ❌ Non gestito | Media — immagini WP ancora linkate nei corpo articoli |
| `/wp-json/` | ❌ Non gestito | Bassa — 404 ok |
| `/?attachment_id={ID}` | ❌ Non gestito | Bassa |

**Azione raccomandata pre-lancio**: aggiungere al middleware almeno il pattern `/?p={ID}` (redirect a homepage o /cerca/?q={ID}) per non rompere link in email archiviate. Gli altri possono essere post-lancio.

### Stato `/blog/*` generale

✅ Confermato in STATO.md: redirect 301 da `/blog/{slug}` → `/it/{slug}/` funzionante su staging.

---

## § SEO — stato e checklist

### Implementato ✅

| Elemento | File | Dettaglio |
|----------|------|-----------|
| `<title>` dinamico | `BaseHead.astro` | `{titolo} – Ombre e Luci`, homepage usa titolo completo |
| `<meta description>` | `BaseHead.astro` | Dinamica per pagina |
| `<link rel="canonical">` | `BaseHead.astro` | URL assoluto, usa `Astro.site` per evitare localhost |
| Open Graph (og:title, og:description, og:image, og:type, og:url, og:locale) | `BaseHead.astro` | Completo |
| Twitter Card (summary_large_image) | `BaseHead.astro` | Completo |
| hreflang IT/EN + x-default | `BaseHead.astro` | URL assoluti (fix `6aab9c44`) |
| Google Site Verification | `BaseHead.astro` | Token presente |
| JSON-LD Article schema | `it/[slug].astro` | headline, description, image, datePublished, author, publisher, isPartOf |
| JSON-LD BreadcrumbList | `it/[slug].astro` | 2-3 livelli |
| `<meta robots>` (noindex) | `BaseHead.astro` | Solo quando `noindex=true` |
| Sitemap XML | `src/pages/sitemap.xml.ts` | Prerender, include IT articles + static + categorie + rubriche |
| robots.txt | `public/robots.txt` | Blocca tutto pre-lancio (da aprire al cutover) |
| `pagefind` integration | `astro.config.mjs` | Indicizzazione full-text client-side (usato da Algolia — verify se ancora necessario) |

### Mancante / da fare prima del lancio 🔴

| Elemento | Priorità | Note |
|----------|----------|-------|
| **noindex SWEEP** | 🔴 Bloccante | Quasi tutte le pagine hanno `noindex={true}` — rimuovere prima del lancio. Vedi B-15 e § Validazione backend. |
| **robots.txt aperto** | 🔴 Bloccante | `Disallow: /` → cambiare prima del cutover |
| **Sitemap completa** | 🔴 Alta | Mancano: articoli EN, numeri archivio `/archivio/oel-*/`, pagine autori `/autori/*/`. Aggiornare `sitemap.xml.ts`. |
| **Search Console** | 🔴 Alta | Registrare la sitemap in GSC entro 24h dal cutover |
| **JSON-LD mancante su EN** | 🟡 Media | `en/[slug].astro` non è stato verificato — controllare se ha JSON-LD Article |
| **JSON-LD su pagine lista** | 🟢 Bassa | Homepage, categoria, autore: aggiungere CollectionPage/WebSite schema |
| **Web Vitals tracking** | 🟡 Media | Nessun reporting LCP/CLS/FID attivo — cieco sulle performance reali |
| **`<meta robots>` per pagine EN indicizzabili** | 🟡 Media | `en/[slug].astro` ha `noindex={false}` ✅ ma verificare categoria/archivio EN |
| **Preconnect R2 / Google Fonts** | 🟢 Bassa | `BaseHead.astro` ha preconnect R2 — aggiungere fonts Google se usati |
| **Open Graph article:author, article:published_time** | 🟢 Bassa | Meta FB extra non bloccanti |
| **Favicon SVG/PNG** | ✅ | `public/favicon.svg`, `favicon.png`, `favicon.ico` presenti |

### Performance SEO

| Metrica | Stato attuale | Target |
|---------|--------------|--------|
| LCP | Non misurato (nessun analytics) | <2.5s |
| CLS | Non misurato | <0.1 |
| FCP | Non misurato | <1.8s |
| Placeholder copertina | 4.2MB (PF-01 aperto) | <100KB WebP |
| Cache-Control R2 | Assente (PF-02 aperto) | `max-age=31536000, immutable` |
| Font Raleway | Woff2 precaricato in `public/fonts/` | ✅ |

---

## § Analytics e monitoring

### Stato attuale (2026-04-27)

**Analytics: ZERO.** Nessuno script di analytics implementato nel codice sorgente. Il sito andrà online senza nessun dato di traffico se non si interviene prima del lancio.

Ricerca nel codebase: nessuna occorrenza di GTM, GA4, `gtag`, `_ga`, `plausible`, `fathom`, `matomo`, Cloudflare Web Analytics snippet, o qualsiasi altro tool di analytics.

### Opzioni e raccomandazione

| Opzione | Effort | Costo | Privacy | Raccomandazione |
|---------|--------|-------|---------|----------------|
| **Cloudflare Web Analytics** | XS (1 riga script) | Gratis | GDPR-friendly (no cookie, no PII) | ✅ **Minimo pre-lancio** |
| Google Analytics 4 via GTM | S (GTM container + GA4 property) | Gratis | Richiede cookie banner (Iubenda già presente) | Raccomandato per dati avanzati |
| Plausible / Fathom | S | ~9€/mese | GDPR-friendly, no cookie | Alternativa privacy-first a GA4 |

**Raccomandazione minima pre-lancio**: attivare Cloudflare Web Analytics — è già disponibile nell'account CF Pages, non richiede cookie banner perché non traccia PII. Aggiungere lo script in `BaseHead.astro`.

**Post-lancio**: aggiungere GA4 via GTM per funnel avanzati (eventi click, scroll depth, conversion CTA), test A/B copy CTA sostienici, audience per remarketing.

### Metriche da monitorare post-lancio

**Traffico e acquisizione**
- Sessioni/giorno per lingua (IT vs EN)
- Canali: organico (SEO), social, diretto, referral
- Query di ricerca Google (Search Console) — top 20 query entro 30gg
- CTR e position media su Search Console

**Engagement**
- Bounce rate per tipo pagina (homepage, articolo, categoria)
- Scroll depth sugli articoli (% che legge oltre il 50%)
- Tempo medio su pagina articolo
- Click su "Leggi anche" in-content

**Conversioni**
- Click su CTA Sostienici (se implementato GTM event)
- Iscrizioni newsletter
- Condivisioni social (FB, X, WhatsApp)
- Click su link archivio PDF rivista

**Performance tecnica**
- Core Web Vitals (LCP, CLS, FID) via Search Console → Esperienza pagina
- Errori 404 (Search Console → Copertura)
- Tempo risposta SSR articoli (CF Analytics → Worker metrics)

**Algolia**
- Ricerche/mese (piano Build: 10k limite)
- Query più cercate → gap contenuto
- Click-through rate risultati ricerca

### Azioni pre-lancio B-17

1. Aprire Cloudflare Dashboard → Pages → ombreeluci → Web Analytics → attivare
2. Copiare lo snippet JS in `BaseHead.astro` prima del `</head>`
3. Creare property GA4 su Google Analytics → ottenere Measurement ID `G-XXXXXXX`
4. Creare container GTM → pubblicare → aggiungere script GTM in `BaseHead.astro`
5. Collegare GA4 come tag in GTM
6. Creare account Google Search Console → verificare tramite meta tag già presente (`CHp0QtH-...`)
7. Inviare sitemap: `https://ombreeluci.it/sitemap.xml`

---

## § Piano validazione IT/EN prima di ES

Dichiarare "EN è production-ready" prima di aprire il cantiere spagnolo. Checklist sistematica.

### 1. Copertura contenuti

- [ ] **Query Directus**: `GET /items/articoli?filter[lang][_eq]=en&aggregate[count]=id&filter[stato][_eq]=published`
  - Attuale: 3470 EN published (2026-04-25)
  - IT published: verificare con stessa query (`lang=it`)
  - Calcolare: `% copertura = EN_published / IT_published * 100`
  - Soglia accettabile: ≥ 95%
- [ ] **Articoli IT senza traduzione EN**: `GET /items/articoli?filter[lang][_eq]=it&filter[articolo_traduzione][_null]=true`
  - Da cui si ottiene la lista degli IT orfani — decidere se blocca il lancio EN

### 2. Qualità campione (controllo manuale)

Protocollo: estrarre 30 articoli EN random (min 3 per categoria, min 5 recenti post-2020, min 5 archivio pre-2000).

Per ogni articolo campione verificare:
- [ ] Traduzione comprensibile e scorrevole (non machine-literal)
- [ ] Titolo EN significativo (non calco italiano)
- [ ] Nomi propri non tradotti (es. "Jean Vanier" non "Giovanni Vanier")
- [ ] Citazioni: mantenute in lingua originale o tradotte correttamente
- [ ] Nessun testo italiano residuo nel corpo
- [ ] Lunghezza appropriata rispetto all'IT (non troncata)

### 3. Route coverage IT → EN

| Route IT | Route EN | Stato |
|----------|----------|-------|
| `/` | `/en/` | ✅ |
| `/it/{slug}/` | `/en/{slug}/` | ✅ (lookup a due tentativi) |
| `/categoria/{slug}/` | `/en/category/{slug}/` | ✅ |
| `/rubriche/{slug}/` | `/en/sections/{slug}/` | ✅ |
| `/archivio/` | `/en/archive/` | ✅ |
| `/archivio/{issue}/` | `/en/archive/{issue}/` | ✅ |
| `/autori/` | `/en/authors/` | ✅ |
| `/autori/{slug}/` | `/en/authors/{slug}/` | ✅ |
| `/tag/{slug}/` | `/en/tag/{slug}/` | ✅ |
| `/cerca/` | `/en/search/` | ✅ |
| `/diari/{slug}/` | `/en/diaries/{slug}/` | ✅ |
| `/chi-siamo/` | `/en/about/` | ✅ |
| `/sostienici` | `/en/support-us/` | ✅ |
| `/newsletter` | `/en/newsletter/` | ✅ |

- [ ] Test automatico: script che curla ogni route EN del campione → 0 risposte 404

### 4. Language switch

- [ ] Ogni articolo IT ha link funzionante verso l'EN (o homepage EN se non tradotto)
- [ ] Ogni articolo EN ha link funzionante verso l'IT
- [ ] Verificare su almeno 10 articoli campione su staging
- [ ] I 18 orfani EN (senza `articolo_traduzione` valorizzato) → language switch porta a homepage IT

### 5. SEO EN

- [ ] hreflang su articoli EN: `<link rel="alternate" hreflang="it">` punta all'IT corretto
- [ ] hreflang su articoli EN: `<link rel="alternate" hreflang="en">` punta a sé stesso
- [ ] Canonical articolo EN: punta a `https://ombreeluci.it/en/{slug}/`
- [ ] I 42 articoli con suffisso `-en` nel slug DB: la route li serve a URL pulito `/en/{slug-senza-en}/` — verificare canonical corretto
- [ ] Sitemap include articoli EN (da aggiungere — B-16)

### 6. Categorie e tag EN

- [ ] Ogni categoria IT ha la controparte EN funzionante
- [ ] `curl https://ombreeluci-staging.pages.dev/en/category/family/` → 200 con articoli
- [ ] Tag EN: verificare che `/en/tag/{slug}/` mostri solo articoli EN
- [ ] `categoria_menu` NULL (34 articoli): non mostrano categoria in pagina — accettabile

### 7. Edge cases

- [ ] Articolo IT senza traduzione EN: language switch → homepage EN (non 404) ✅ già implementato
- [ ] Articolo EN slug con `-en`: URL `/en/storia-di-un-padre/` funziona (senza `-en`) ✅ lookup
- [ ] Articolo EN con `categoria_menu=NULL`: mostra "Pubblicato online" invece di categoria
- [x] Bio autore su articolo EN: mostra `bio_en` se disponibile; `bio_html` IT come fallback ✅ (commit `78a453ea`)

### 8. Criteri di "done EN"

| Criterio | Soglia | Come verificare |
|----------|--------|----------------|
| Copertura articoli | ≥ 95% IT tradotti | Query Directus count |
| Route 404 | 0 route EN con 404 | Script curl campione |
| Qualità campione | ≥ 27/30 articoli giudicati "accettabili" | Revisione manuale redazione |
| Language switch | 100% funzionante (o fallback corretto) | Test manuale 10 pagine |
| hreflang corretto | 0 errori in GSC → Esperienza URL | Google Search Console |
| Algolia EN | Risultati EN mostrati correttamente su `/en/search/` | Test manuale |

---

## § Directus — stato e piano ottimizzazione

### a) Flusso editoriale target (stato da raggiungere)

**Principio**: la redazione lavora SOLO in italiano. Le traduzioni sono generate automaticamente.

```
Redazione → crea/pubblica articolo IT in Directus
       ↓
Webhook Directus → trigger pipeline AI
       ↓
Claude API → traduce: corpo, titolo, sottotitolo, didascalie, bio autore
       ↓
Directus API → crea/aggiorna articolo EN linked (articolo_traduzione)
       ↓
Build Astro (SSR) → serve /en/{slug}/ automaticamente
       ↓
Algolia webhook → aggiorna indice (da implementare: ALGOLIA-05)
```

**Gap rispetto allo stato attuale**:

| Componente | Stato attuale | Gap |
|-----------|--------------|-----|
| Pipeline AI IT→EN corpus | ✅ Completata (3470 articoli) | Solo batch manuale, non automatica |
| Webhook Directus→Pipeline | ❌ Non implementato | Da creare (flow Directus o CF Worker) |
| Traduzione automatica nuovi articoli | ❌ Non attivo | Prerequisito: webhook |
| Webhook Directus→Algolia | ❌ Non implementato (ALGOLIA-05) | Da creare |
| Traduzione didascalie foto (`didascalia_en`) | ✅ 1965/1965 tradotte (2026-05-08) | — |
| Traduzione bio autori (`bio_en`) | ✅ 79/79 bio tradotte (2026-05-07) | — |
| Traduzione nomi tag (`nome_en`, `slug_en`) | ❌ Campi non esistono in Directus | Da aggiungere schema |
| Traduzione ES/FR | ❌ Non avviato | Dopo chiusura EN |

### b) Audit interfaccia Directus — da fare

**Collection `articoli`** — verificare con account Redazione:
- [ ] Campi visibili al ruolo Redazione: titolo, sottotitolo, corpo, autore, categoria_menu, numero_rivista, tags, immagine_copertina, didascalia_copertina, stato, data_pubblicazione
- [ ] Campi nascosti al ruolo Redazione: id, slug, lang, wp_id, articolo_traduzione, seo_description (o visibile ma non modificabile)
- [ ] Campo `corpo` WYSIWYG: funziona correttamente? Upload immagini inline? Paste da Word?
- [ ] Campo `immagine_copertina`: upload su R2 funzionante?
- [ ] Campo `tags`: interfaccia M2M funzionante? Può creare nuovi tag?
- [ ] Campo `numero_rivista`: dropdown con numeri rivista funzionante?

**Form creazione nuovo numero OEL**:
- [ ] Creare OEL-173 da account Redazione: tutti i campi presenti (id_numero, data, copertina, sommario, pdf_archive_url)?
- [ ] Dopo creazione: `/archivio/oel-173/` funzionante su staging?

**Flows / Presets Directus**:
- [ ] Verificare se esistono Flow configurati: Directus → Settings → Flows
- [ ] Verificare se esistono Presets (viste salvate): Directus → Settings → Presets
- [ ] Verificare Panels (dashboard) eventualmente configurati

**Permessi ruolo Redazione**:
- [ ] Può pubblicare articolo (`stato: published`)
- [ ] NON può modificare articoli EN (o può? Decidere policy)
- [ ] NON può vedere lista utenti / altri account
- [ ] NON può modificare settings sistema

### c) Gap da colmare prima del lancio

| Gap | Priorità | Note |
|-----|----------|-------|
| Eliminare account UAT `redazione-uat@ombreeluci.it` | 🔴 Bloccante | UAT-CLEANUP in backlog |
| Verificare permessi ruolo Redazione (T1/T2/T3 — B-06) | 🔴 Bloccante | UAT da eseguire prima del lancio |
| Schema `didascalia_en` in Directus | 🟡 Post-lancio | Non blocca ma gap qualità EN |
| Schema `nome_en`, `slug_en` su collection `tags` | 🟡 Post-lancio | Blocca display tag su articoli EN |
| Webhook pipeline AI automatica | 🟡 Post-lancio | Necessario per nuovi articoli EN |
| ALGOLIA-05 webhook sync | 🔴 Pre-lancio | In backlog, da fare prima del go-live |

### d) Flusso redazione post-lancio (stato target operativo)

1. Redazione crea articolo IT in Directus, compila tutti i campi, pubblica
2. Webhook → pipeline Claude API → genera EN entro 5-10 minuti
3. Articolo EN appare su `/en/{slug}/` senza intervento tecnico
4. Webhook → Algolia update → appare nella ricerca EN
5. La redazione può aprire l'articolo EN in Directus e correggere manualmente se necessario
6. Per ES/FR in futuro: aggiungere lingua al webhook payload — zero modifiche al frontend

---

## § Commenti — stato implementazione

### Stato: IMPLEMENTATO ✅

Il sistema commenti è completamente implementato. Componente: `src/components/Commenti.astro`. API endpoint: `src/pages/api/commento.ts`.

### Funzionalità presenti

| Feature | Stato |
|---------|-------|
| Visualizzazione commenti approvati | ✅ Lista ordinata con autore, data, testo |
| Form invio commento (nome, email, testo) | ✅ |
| Honeypot anti-spam (campo `hp` nascosto) | ✅ |
| Moderazione (commento → approvazione redazione prima della pubblicazione) | ✅ (stato `approvato` in Directus) |
| Multilingua: heading e UI in IT/EN | ✅ |
| Contatore caratteri textarea (avviso <500 caratteri) | ✅ |
| Feedback visivo successo/errore | ✅ |
| Accessibilità: `aria-live`, `role="alert"` | ✅ |

### Gap e considerazioni

| Item | Stato |
|------|-------|
| Notifica email alla redazione quando arriva un commento | ❌ Non implementato — aggiungere Flow Directus (email) o webhook |
| Sistema anti-spam avanzato (reCAPTCHA, rate limiting) | 🟡 Solo honeypot — sufficiente per ora |
| Reply/thread commenti | ❌ Non implementato (flat list) — post-lancio se richiesto |
| Commenti per lingua: un commento su articolo IT è visibile su EN? | ❓ Da decidere — attualmente `articolo_id` è comune. I commenti IT compaiono anche su EN se stessa pagina. Probabile non è un problema nella pratica (IT e EN hanno slug diversi = pagine diverse = componente separato). |
| Rate limiting sull'API `/api/commento` | ❌ Non implementato — vulnerabile a spam automatico se honeypot bypassato |
| Verifica email autore | ❌ Commento accettato con email qualsiasi — moderazione compensa |

### Architettura collection Directus (da verificare)

Verificare che esista in Directus la collection `commenti` con campi:
- `id`, `articolo_id` (relation a `articoli`), `autore_nome`, `autore_email`, `testo`, `data_creazione`, `stato` (draft/approvato)
- Permesso pubblico: solo GET su commenti `stato=approvato`; POST per creazione (senza auth)

---

## § ARCH-02 — Archivio: split Ultimo numero / Tutti i numeri

**Backlog post-lancio. Effort: M.**

### Problema

La pagina `/archivio/` (e `/en/archive/`) mostra tutti i numeri in lista flat. L'UX ideale (ispirazione: vita.it/riviste/) prevede:
- **Tab/sezione "Ultimo numero"**: hero con copertina grande, sommario, link agli articoli del numero
- **Tab/sezione "Tutti i numeri"**: griglia dei numeri precedenti con miniatura copertina, anno, numero

### Architettura proposta

**Nessuna nuova route necessaria.** Estendere `src/components/ArchivioContent.astro`.

1. Il componente riceve tutti i numeri da Directus (già disponibili)
2. Separa l'array: `[0]` = ultimo numero, `[1..]` = archivio storico
3. Aggiunge state client-side (`activeTab: 'latest' | 'all'`) gestito con `<script is:inline>`
4. Rendering condizionale via CSS: `.tab-panel[data-tab="latest"]` e `.tab-panel[data-tab="all"]`
5. URL: il tab attivo non modifica l'URL (non serve route separata) — opzionale: `?tab=all` per deep link

**Campi necessari in Directus** (già presenti):
- `id_numero`, `data`, `copertina` (image ID), `sommario` (HTML), `pdf_archive_url`

**Step di implementazione**:
1. Aggiornare `ArchivioContent.astro`: split array, aggiungere tab UI
2. CSS: tab bar con indicatore attivo, hero per ultimo numero, griglia compatta per storico
3. Script: toggle tab, persistenza in `sessionStorage` (opzionale)
4. Test: mobile + desktop + accessibilità tab (focus, aria-selected)

---

## § GR-CTA — CTA "Sostienici" in fondo agli articoli

**Backlog post-lancio. Effort: M.**

### Specifiche

**Posizione**: in fondo a ogni articolo, dopo la bio autore e prima dei correlati. Anche su pagine chiave: chi-siamo, archivio.

**Copy**: almeno 5-6 varianti da ruotare. Tono editoriale di riferimento: ilpost.it (diretto, senza retorica), vita.it (missione sociale). Non usare frasi generiche tipo "supporta il nostro lavoro".

Varianti di partenza (da affinare con la redazione):
1. "Dal 1983 scriviamo di fragilità e dignità. Continuiamo solo grazie a chi ci sostiene."
2. "Ombre e Luci è una rivista indipendente. Non abbiamo azionisti, solo lettori."
3. "Questo articolo è gratuito. Se ti ha dato qualcosa, aiutaci a scriverne altri."
4. "La rivista che tieni in mano esiste da 40 anni. Aiutaci ad arrivare a 80."
5. "Nessuno sponsor, nessuna pubblicità. Solo lettori che credono in quello che facciamo."
6. "Un abbonamento è il modo più diretto per dirci che vale la pena continuare."

**Gestione contenuti**: collection separata in Directus `cta_sostieni` con campi `testo` (string) + `attivo` (boolean). La redazione può modificare i copy senza deploy. Il componente in Astro fa fetch a build-time (prerender) o SSR e seleziona una variante.

**Tracking**:
- Ogni variante ha un `id` o slug (es. `cta-1`, `cta-2`)
- Click sul bottone → GTM custom event `cta_click` con label = id variante
- Parametro UTM sull'URL sostienici: `/sostienici?utm_source=articolo&utm_medium=cta&utm_campaign={id_variante}`
- Dashboard GA4: conversionrate per variante → ottimizzazione copy

**A/B test**: con GTM si può fare A/B senza deploy — esperimento server-side o client-side.

**Step di implementazione**:
1. Creare collection `cta_sostieni` in Directus (testo, attivo, slug)
2. Creare componente `src/components/CTASostienici.astro` con fetch Directus
3. Inserire il componente in `it/[slug].astro` e `en/[slug].astro` dopo la bio autore
4. Aggiungere GTM event click
5. Test su mobile (CTA non deve intralciare lettura)

---

## § VERT-01 — Focus pages (architettura 2026-04-29, aggiornato 2026-04-30)

### Cos'è una Focus page

Pagina tematica curata che raccoglie articoli, testi di raccordo narrativo e citazioni attorno a un tema, una persona o un dossier storico. Non è una categoria automatica (queried da tag/categoria) ma una selezione editoriale manuale con narrazione propria.

**Nome pubblico**: "Focus" — funziona in italiano e inglese, editorialmente preciso, breve.

### URL e routing

```
IT:  /it/focus/{slug}/          ← src/pages/it/focus/[vertical].astro
EN:  /en/focus/{slug}/          ← src/pages/en/focus/[vertical].astro
```

**Perché `/it/focus/` e non `/focus/`**:
- Coerente con il prefisso `/it/` di tutto il contenuto italiano
- Permette listing page `/it/focus/` (tutti i focus pubblicati)
- Simmetria perfetta con `/en/focus/`
- Aggiungere ES/FR: zero modifiche al frontend, solo `src/pages/es/focus/[vertical].astro`

**Slug**: sempre in lingua (es. `autismo` IT, `autism` EN). Eccezione: nomi propri invariati (`mariangela-bertolini`, `ciao-stefano-di-franco`).

### Decisioni architetturali chiave

| Decisione | Scelta | Alternativa scartata | Motivo |
|-----------|--------|----------------------|--------|
| Struttura blocchi | Sequenza ordinata `tipo: testo\|articoli` | Page builder libero | Semplicità Directus, niente complessità UI |
| Diversità visiva | `tema_visivo` CSS class (4 skin) | Markup custom per pagina | Zero duplicazione, editabile da CMS |
| Multilingua | `VerticaleContent.astro` + prop `lang` | Route separate con markup diverso | Regola CLAUDE.md: componente condiviso |
| Citazioni/raccordi | Blocco `tipo=testo` tra gruppi articoli | Campo dedicato citazione | Non serve un tipo in più, il rich text copre tutto |
| Immagine hero | UUID diretto in `hero_immagine` | M2O espanso | Directus restituisce UUID plain per campi `file-image` senza relazione esplicita |

### Le 8 pagine focus

| # | Slug IT | Slug EN | Tipo | Skin | Stato |
|---|---------|---------|------|------|-------|
| 1 | `mariangela-bertolini` | `mariangela-bertolini` | Biografica fondatrice | `caldo` | ✅ Popolata |
| 2 | `autismo` | `autism` | Hub tematico | `chiaro` | 🔴 Da fare |
| 3 | `cinema-e-disabilita` | `cinema-and-disability` | Hub tematico | `scuro` | 🔴 Da fare |
| 4 | `aktion-t4-sterminio-persone-disabilita` | `aktion-t4-extermination-of-disabled-people` | Dossier storico | `scuro` | 🔴 Da fare |
| 5 | `catechesi-e-disabilita` | `catechesis-and-disability` | Hub tematico | `chiaro` | 🔴 Da fare |
| 6 | `noi-papa-un-figlio-disabile` | `we-fathers-a-disabled-child` | Raccolta voci | `caldo` | 🔴 Da fare |
| 7 | `ciao-stefano-di-franco` | `ciao-stefano-di-franco` | Memorial | `magazine` | 🔴 Da fare |
| 8 | `studiosi-educatori-e-attivisti-ombre-e-luci` | `scholars-educators-and-activists` | Directory persone | `chiaro` | 🔴 Da fare |

### Schema Directus (live su cms.ombreeluci.it)

**Collection `verticali`**

| Campo | Tipo Directus | Note |
|-------|--------------|------|
| `id` | integer PK | auto |
| `slug` | string unique | URL slug IT |
| `slug_en` | string unique | URL slug EN |
| `titolo` / `titolo_en` | string | `titolo_en` nullable |
| `seo_description` / `seo_description_en` | text | max 160 char |
| `hero_immagine` | uuid (file-image) | UUID diretto — NON espanso da Directus; usare `getDirectusAssetUrl(verticale.hero_immagine)` |
| `hero_video_url` | string nullable | URL YouTube/Vimeo — sovrascrive immagine se presente |
| `tema_visivo` | select | `chiaro` \| `scuro` \| `caldo` \| `magazine` |
| `intro` / `intro_en` | rich text | `intro_en` nullable |
| `testo_coda` / `testo_coda_en` | rich text nullable | Testo conclusivo opzionale |
| `pubblicato` | boolean | Filter read pubblico: `pubblicato=true` |
| `sezioni` | alias O2M → `verticale_blocchi` | Campo alias creato manualmente (Directus 11 non lo crea automatico dalla relazione) |

**Collection `verticale_blocchi`**

| Campo | Tipo | Note |
|-------|------|------|
| `verticale_id` | M2O → `verticali` | FK con CASCADE delete |
| `ordine` | integer sort | Drag&drop in Directus |
| `tipo` | select `testo\|articoli` | Discriminatore blocco |
| `titolo_sezione` / `titolo_sezione_en` | string nullable | Heading sopra gruppo articoli |
| `testo` / `testo_en` | rich text nullable | Solo `tipo=testo` |
| `immagine` | uuid (file) nullable | Solo `tipo=testo` |
| `layout_immagine` | select | `nessuna` \| `sfondo` \| `laterale-dx` \| `laterale-sx` |
| `articoli` | alias M2M → `articoli` | Tramite junction `verticale_blocchi_articoli` |

**Junction `verticale_blocchi_articoli`**: `blocco_id` (integer FK), `articolo_id` (uuid FK), `ordine` (sort)

**Permessi Directus**: tutte e 5 le policy hanno read su `verticali`, `verticale_blocchi`, `verticale_blocchi_articoli` con `fields: ['*']`.

**⚠️ Gotcha Directus 11 — da sapere per manutenzione schema:**
1. Il campo alias `sezioni` su `verticali` va creato esplicitamente via `/fields/verticali` con `type:alias, special:['o2m']` — non viene auto-creato dalla relazione
2. La relazione M2M lato `blocco_id` richiede `one_field:'articoli'` e `sort_field:'ordine'` settati esplicitamente via PATCH su `/relations/verticale_blocchi_articoli/blocco_id`
3. `hero_immagine` ritorna UUID plain string, non `{ id }` — query con `fields=hero_immagine` (senza `.id`)
4. POST su `verticale_blocchi` va fatto con `?fields=id,ordine,...` esplicitando i campi fisici — se includi l'alias `articoli` nel SELECT la query SQL va in errore

### Architettura frontend (live)

```
src/
├── components/
│   ├── VerticaleContent.astro        — layout principale; legge tema_visivo → CSS class,
│   │                                   canonical /it/focus/{slug}/ + hreflang IT/EN
│   ├── VerticaleBloccoTesto.astro    — blocco testo + immagine (4 layout)
│   └── VerticaleGruppoArticoli.astro — heading sezione + ArticleCard grid (3-2-1 col)
├── pages/
│   ├── it/focus/[vertical].astro     — prerender, getStaticPaths → slug IT
│   └── en/focus/[vertical].astro     — prerender, getStaticPaths → slug_en EN
└── lib/
    └── directus.ts                   — getVerticali(), getVerticaleBySlug(),
                                        getVerticaleBySlugEN(), VERTICALE_FIELDS, normalizeVerticale()
```

**⚠️ REGOLA OBBLIGATORIA — `<main class="site-main">` attorno al contenuto**

Ogni componente che usa `BaseLayout` DEVE wrappare il suo contenuto in `<main class="site-main">`. Senza di esso il footer si posiziona immediatamente dopo l'header perché il CSS del layout usa `site-main` come flex item che spinge il footer in fondo. `VerticaleContent.astro` e qualsiasi futura pagina focus devono rispettare questa regola. Il pattern corretto è sempre:

```astro
<BaseLayout ...>
  <main class="site-main">
    <!-- contenuto pagina -->
  </main>
</BaseLayout>
```

**`VERTICALE_FIELDS`** (query Directus): tutti i campi flat + nested `sezioni.*`, `sezioni.immagine.id`, `sezioni.articoli.articolo_id.*` incluso `autore.nome_completo`, `autore.slug`, `immagine_copertina.id`.

**`normalizeVerticale()`**: ordina `sezioni` per campo `ordine` ascending (Directus non garantisce l'ordine senza `sort` param esplicito sui blocchi).

### CSS skin (`tema_visivo`)

Ogni skin è una classe CSS `verticale--{nome}` che sovrascrive le variabili `--v-accent` e `--v-hero-overlay`:

| Skin | `--v-accent` | `--v-hero-overlay` | Override aggiuntivi |
|------|-------------|-------------------|---------------------|
| `chiaro` | `#008b8b` (teal) | `rgba(20,47,47,.45)` | — |
| `scuro` | `#c0392b` (rosso) | `rgba(10,10,20,.72)` | `.verticale-intro` sfondo nero, testo bianco |
| `caldo` | `#b5651d` (terracotta) | `rgba(90,40,10,.50)` | `.verticale-intro` sfondo crema |
| `magazine` | `#1a1a1a` (nero) | `rgba(0,0,0,.65)` | Titolo più grande, letter-spacing |

### Lavoro fatto (2026-04-29/30)

| Data | Cosa | Commit |
|------|------|--------|
| 2026-04-29 | Schema Directus creato via script API (script idempotente) | `07b10f8d` |
| 2026-04-29 | Tipi TS + fetch functions in `directus.ts` | `07b10f8d` |
| 2026-04-29 | Componenti `VerticaleContent`, `VerticaleBloccoTesto`, `VerticaleGruppoArticoli` | `07b10f8d` |
| 2026-04-29 | Route IT/EN prerender + fix bug autore link (`getAuthorBasePath`) | `07b10f8d` |
| 2026-04-29 | Debug permessi Directus (alias field, M2M one_field) | — |
| 2026-04-29 | Popolata pagina Mariangela Bertolini (14 articoli, 5 blocchi, citazioni) | — |
| 2026-04-30 | Fix `hero_immagine` UUID plain string | `7034b3bb` |
| 2026-04-30 | Refactor route `/it/focus/` + `/en/focus/` | `91a8ccdb` |
| 2026-04-30 | Fix footer: `<main class="site-main">` aggiunto a `VerticaleContent` | `038f1b21` |
| 2026-04-30 | Fix CSS: `ArticleCard` styles → `global.css` (risolve Vite chunk splitting su nuove route) | `4f516c76` |

### Roadmap per chiudere VERT-01

| Step | Task | Stato | Note |
|------|------|-------|------|
| ✅ | Schema Directus completo + permessi | Fatto | Script `scripts/setup-verticali-schema.mjs` |
| ✅ | Componenti Astro + route prerender | Fatto | `VerticaleContent.astro` e sub-componenti |
| ✅ | Prima pagina: Mariangela Bertolini | Fatto | Live staging `/it/focus/mariangela-bertolini/` |
| ✅ | Fix footer (site-main wrapper) | Fatto | `038f1b21` |
| ✅ | Fix CSS ArticleCard (global.css) | Fatto | `4f516c76` |
| 🟡 | Verifica visiva staging post-rebuild | Pendente | Controllare hero, card stili, footer su `/it/focus/mariangela-bertolini/` |
| 🔴 | Popolare 7 pagine restanti (IT) | Da fare | Vedi tabella "Le 8 pagine focus" |
| 🔴 | Revisione editoriale intro e testi (IT) | Da fare | Redazione |
| 🔴 | Popolare versioni EN di tutte le pagine | Da fare | `intro_en`, `titolo_sezione_en`, testi blocchi |
| 🔴 | Listing page `/it/focus/` e `/en/focus/` | Da fare | `src/pages/it/focus/index.astro` — griglia di tutti i focus pubblicati |
| 🔴 | Link "Focus" nel megamenu e navbar | Da fare | Voce in `Header.astro` → `/it/focus/` |
| 🔴 | Indicizzazione Algolia (VERT-SEARCH) | Da fare | Tipo `focus`, dopo ≥4 pagine stabili |
| 🔴 | Smoke test hreflang + canonical | Da fare | Verificare su staging con tool SEO |
| 🔴 | Sitemap IT/EN con `/it/focus/*` | Da fare | Controllare `sitemap.xml.ts` e `sitemap-en.xml.ts` |

### Note editoriali per ogni pagina

- **mariangela-bertolini** (✅): intro biografica, 3 gruppi articoli raccordati da citazioni (Mariangela + Jean Vanier). Da aggiungere: intro EN, hero visibile.
- **ciao-stefano-di-franco**: pagina memorial — skin `magazine`, intro commemorativa, raccolta articoli scritti o dedicati a Stefano di Franco.
- **aktion-t4**: dossier storico pesante — skin `scuro`, intro densa con contesto storico, blocchi testo che raccordano le fasi storiche + articoli documentaristici.
- **autismo / catechesi-e-disabilita / cinema-e-disabilita**: hub tematici puri — articoli protagonisti, testo di raccordo leggero, più sezioni con titolo per sotto-tema.
- **noi-papa-un-figlio-disabile**: raccolta voci per tipo narratore — gruppare articoli per "voci" (padri, madri, fratelli, nonni) con heading sezione distinto per gruppo.
- **studiosi-educatori-e-attivisti**: elenco persone — valutare se serve layout da "directory" (card persona con bio breve) oltre agli articoli. Da discutere.

---

## § Iter — Creare una nuova pagina/template (checklist completa)

Queste regole valgono per qualsiasi nuova sezione del sito: una nuova tipologia di pagina (es. "Dossier", "Serie", "Evento"), una nuova route statistica (es. `/manifesto/`), o una nuova listing page.

---

### Fase 0 — Architettura (prima di toccare il codice)

Rispondere a queste domande prima di aprire un file:

1. **Dati**: da dove vengono? Directus (dinamico) o `src/data/*.json` (statico)?
2. **Prerender o SSR?** Se i dati vengono da Directus al build time → `export const prerender = true` + `getStaticPaths`. Se i dati cambiano spesso senza rebuild → SSR (ma attenzione: ogni SSR ha un costo su CF Workers).
3. **Quante lingue?** IT solo? IT+EN? Progettare multilingua fin dall'inizio (regola CLAUDE.md).
4. **Componente condiviso?** Se la pagina esiste in IT e EN (o altre lingue future), il markup va in un componente con prop `lang` — mai duplicare markup tra route.
5. **URL**: coerente con il prefisso `/it/` per contenuto italiano? Permette listing page futura?
6. **CSS**: il componente usa altri componenti? Quanti livelli di profondità? Se usa componenti già diffusi nel sito (come `ArticleCard`), la loro CSS è già in `global.css`.

---

### Fase 1 — Schema Directus (se serve una nuova collection)

Se la pagina ha dati propri in Directus:

- [ ] Creare script idempotente `scripts/setup-{nome}-schema.mjs`
- [ ] Creare la collection con campi base: `id`, `slug` (unique), `slug_en` (unique), `pubblicato` (boolean)
- [ ] Aggiungere campi multilingua: `titolo` + `titolo_en`, `intro` + `intro_en`, ecc.
- [ ] Se ci sono relazioni O2M: creare la relazione **E** il campo alias sulla collection parent esplicitamente (Directus 11 non crea il campo alias automaticamente dalla relazione)
- [ ] Se ci sono relazioni M2M con ordinamento: verificare che `one_field` e `sort_field` siano settati sulla relazione junction via PATCH `/relations/{junction}/{fk_field}`
- [ ] Aggiungere permessi read su tutte e 5 le policy Directus per le nuove collection: `verticali`, `verticale_blocchi`, `verticale_blocchi_articoli` (o qualunque sia il nome)
- [ ] Testare la query con il token build: `curl -H "Authorization: Bearer $BUILD_TOKEN" "https://cms.ombreeluci.it/items/{collection}?fields=*"` — deve restituire 200 con dati (non 403)
- [ ] Eseguire lo script: `node scripts/setup-{nome}-schema.mjs`

**Gotcha Directus 11** (già documentati sopra in § VERT-01 ma ripetuti qui per comodità):
- Campo `file-image` con `type: uuid` → restituisce UUID plain string, non `{ id: string }`. Query: `?fields=hero_immagine` (non `hero_immagine.id`)
- POST su collection con alias nel SELECT → SQL error. Usare `?fields=id,campo1,campo2,...` escludendo alias
- M2M: `one_field` su junction relation deve essere settato manualmente

---

### Fase 2 — TypeScript (src/lib/directus.ts)

- [ ] Aggiungere interfaccia `type NuovaCollection = { id: number; slug: string; slug_en: string; ... }`
- [ ] Definire `NUOVA_COLLECTION_FIELDS` con tutti i campi da fetchare (includere nested con dot notation)
- [ ] Scrivere funzione `getNuoveCollection()` che chiama Directus con filter `pubblicato=true`
- [ ] Se serve fetch per singolo slug IT: `getNuovaCollectionBySlug(slug: string)`
- [ ] Se serve fetch per singolo slug EN: `getNuovaCollectionBySlugEN(slug: string)`
- [ ] Aggiungere `normalizeNuovaCollection(raw)` se i dati necessitano ordinamento o trasformazione

---

### Fase 3 — Componenti Astro

**Regola CLAUDE.md**: SEMPRE componente condiviso con prop `lang`, MAI markup duplicato tra route.

- [ ] Creare `src/components/NuovaPaginaContent.astro` con:
  - Props: `{ data: NuovaCollection; lang: Locale }`
  - Wrapper obbligatorio: `<main class="site-main">` **immediatamente dopo** `<BaseLayout>`
  - `<BaseLayout title={...} description={...} lang={lang} canonical={...} alternates={[...]} noindex={false}>`
  - Logica multilingua: `const titolo = lang === 'en' ? (data.titolo_en || data.titolo) : data.titolo`
  - URL canonico e alternate correttamente valorizzati
- [ ] Se il componente renderizza altri componenti già esistenti (es. `ArticleCard`): **non fare niente di speciale** — la CSS di ArticleCard è già in `global.css`
- [ ] Se il componente introduce CSS custom in `<style>`: usare classi con prefisso univoco (es. `.nuova-hero`, `.nuova-grid`) per evitare collisioni

**Struttura HTML obbligatoria:**

```astro
<BaseLayout title={titolo} description={desc} lang={lang} canonical={canonicalUrl}
  alternates={[{ lang: 'it', url: itUrl }, { lang: 'en', url: enUrl }]}
  noindex={false}
>
  <main class="site-main">
    <!-- contenuto -->
  </main>
</BaseLayout>
```

⚠️ **MAI omettere `<main class="site-main">`**: il footer usa `position:fixed; z-index:1`. Il `site-main` ha `position:relative; z-index:10; background-color:var(--bg-light)` — senza di esso il footer è visibile sopra il contenuto della pagina.

---

### Fase 4 — Route Astro

Creare le route per ogni lingua:

**`src/pages/it/nuova-sezione/[slug].astro`:**

```astro
---
export const prerender = true;
import NuovaPaginaContent from '../../../components/NuovaPaginaContent.astro';
import { getNuoveCollection } from '../../../lib/directus';

export async function getStaticPaths() {
  const items = await getNuoveCollection();
  return items.map(item => ({
    params: { slug: item.slug },
    props: { data: item },
  }));
}

const { data } = Astro.props;
---
<NuovaPaginaContent data={data} lang="it" />
```

**`src/pages/en/nuova-sezione/[slug].astro`:** identico ma `slug: item.slug_en` e `lang="en"`.

**Se serve listing page:**
- `src/pages/it/nuova-sezione/index.astro` — `export const prerender = true`, fetch tutti i record pubblicati, componente `NuovaSezioneListingContent.astro`
- `src/pages/en/nuova-sezione/index.astro` — stesso componente con `lang="en"`

---

### Fase 5 — Navigazione (Header + Footer)

- [ ] Aggiungere voce nel megamenu in `src/components/Header.astro` con link `/it/nuova-sezione/` (IT) e `/en/nuova-sezione/` (EN)
- [ ] Valutare se aggiungere voce nel footer `src/components/Footer.astro` (colonna "Sezioni" o colonna dedicata)
- [ ] Se la sezione è importante per la navigazione: verificare che sia visibile su mobile (hamburger menu)

---

### Fase 6 — SEO e sitemap

- [ ] Verificare che `canonical` e `alternates` (hreflang) siano passati correttamente a `BaseLayout`
- [ ] Aggiungere le URL della nuova sezione a `src/pages/sitemap.xml.ts` (IT)
- [ ] Aggiungere le URL a `src/pages/sitemap-en.xml.ts` (EN)
- [ ] La nuova pagina deve avere `noindex={false}` (o omettere, il default è `false`)

---

### Fase 7 — Ricerca Algolia (se il contenuto è ricercabile)

- [ ] Aprire `scripts/algolia/index-all.mjs`
- [ ] Aggiungere un blocco di indicizzazione per la nuova collection (tipo `focus`, `dossier`, ecc.)
- [ ] Campi minimi: `objectID`, `type`, `title`, `intro` (HTML stripped), `slug`, `slug_en`, `url`
- [ ] Eseguire: `node scripts/algolia/index-all.mjs` (richiede `.env` con `ALGOLIA_APPLICATION_ID` + `ALGOLIA_WRITE_API`)
- [ ] Verificare che i nuovi record compaiano nella ricerca su staging

---

### Fase 8 — Build e verifica staging

- [ ] Commit e push su `main` → CF Pages rebuilda automaticamente
- [ ] Attendere il completamento del build (2-4 minuti di solito)
- [ ] Verificare la pagina su staging: `https://ombreeluci-staging.pages.dev/it/nuova-sezione/slug/`
- [ ] Checklist visiva rapida:
  - [ ] Hero image visibile (se prevista)
  - [ ] Testo e card stilate correttamente
  - [ ] Footer SOTTO il contenuto (non sopra)
  - [ ] Language switcher porta alla versione EN
  - [ ] `curl https://ombreeluci-staging.pages.dev/it/nuova-sezione/slug/ | grep -E 'canonical|hreflang'` → URL corretti
  - [ ] Nessun errore in console DevTools

---

### Errori comuni da evitare (storia)

| Errore | Causa | Fix |
|--------|-------|-----|
| Footer visibile sopra il contenuto | Manca `<main class="site-main">` nel componente | Aggiungere wrapper obbligatorio |
| CSS mancante su nuove route | Componente profondamente nested → Vite chunk non linkato | CSS della primitiva UI in `global.css` |
| 403 su query Directus al build | Permessi non aggiunti alle policy | PATCH `/permissions` per ogni policy |
| 403 su campo alias (O2M) | Campo alias non creato manualmente in Directus 11 | POST `/fields/{collection}` con `type:alias, special:['o2m']` |
| Articoli M2M non ritornano | `one_field` null sulla relazione junction | PATCH `/relations/{junction}/{fk_field}` con `one_field` e `sort_field` |
| `hero_immagine` undefined | Query con `.id` su campo UUID plain | Cambiare query a `hero_immagine` (senza `.id`), tipo TS `string | null` |
| POST con alias nel SELECT → SQL error | Directus include l'alias nella query SQL | POST con `?fields=id,campo1,...` (solo campi fisici) |
| Markup duplicato tra IT e EN | Fretta di fare la route EN | Fermarsi, estrarre componente condiviso, poi fare entrambe le route |

## Log SEO/Monitoring settimanale

*Contenuto integrale di `docs/SEO-MONITORING-LOG.md`, che in precedenza era un file separato — incollato qui come blocco unico, cronologia interna (inversa) invariata. Non interfogliato con la timeline giornaliera qui sopra: sono check settimanali tabellari/numerici (GSC, Cloudflare Analytics, GA4, uptime, redirect), interfogliarli avrebbe frammentato le tabelle senza guadagno di leggibilità.*

> Log settimanale generato dal check automatico. Entry più recente in alto.
> Per l'architettura generale del monitoring vedi [RUNBOOK.md](../RUNBOOK.md) § 12-17.
> Tool usato: `scripts/gsc-query.mjs` (Search Analytics), `scripts/cf-analytics.mjs` (CF), `scripts/ga-query.mjs` (GA4), UptimeRobot API, `scripts/verify-redirects.mjs`.

---

## 2026-08-08 — check completo GSC + CF + GA4

**Stato generale:** sano e in crescita. Il plateau segnalato il 27/7 si è sbloccato: impressioni e click GSC in crescita ~+30-35%, crescita GA4 Italia confermata su più check consecutivi. EN ancora fermo. Uptime e redirect perfetti. Nuova osservazione: ritorno di traffico bot da Singapore su GA4.

### GSC Search Analytics (27/7→6/8, 11 giorni per lag di reporting GSC)
- Impressioni 2.517-3.256/giorno, click 32-64/giorno, posizione media 8,5-11,0
- **Confronto col check 27/7** (periodo 28/6-25/7: impressioni 1.560-2.293, click 19-46, posizione 8,5-11,8): **+30-35% su impressioni e click, plateau sbloccato**. Coerente con l'ipotesi formulata il 27/7: il fix BUG-EN-STAGING (hreflang/canonical, live dal 24/7) ha avuto le 2 settimane di osservazione previste e la crescita è ripartita.
- Top pagina invariata: "22 mini giochi da fare insieme" (125 click, 9.023 impressioni nel periodo), seguita da "14 giochi da fare insieme" (50 click)
- EN: solo 9 click totali sulle 15 pagine EN più visibili nel periodo, impressioni 1-12 per pagina — **ancora sostanzialmente invisibile** su 3.400+ articoli pubblicati, nessun cambiamento rispetto al 27/7.
- **Approfondimento EN eseguito lo stesso giorno (8/8), chiude l'azione "controllo GSC Copertura" pendente dal 27/7:** query `--dimensions=page --contains=ombreeluci.it/en` su 30 giorni (9/7-8/8) → **486 pagine EN su ~3.472 pubblicate (14%) hanno avuto almeno 1 impressione**, l'86% restante zero impressioni nel mese. Delle 486 con impressioni, posizioni quasi tutte 5-35 (raramente prima pagina), solo ~10 pagine con più di 1 click totale nel periodo. **Conclusione: non è un problema di indicizzazione bloccata** (in quel caso vedremmo 0% con impressioni) **ma di autorità/novità del dominio in una nicchia internazionale già occupata**, probabilmente aggravato dal volume di traduzioni AI-bulk (3.400+ articoli) che i sistemi di qualità Google potrebbero leggere come contenuto a basso valore aggiunto rispetto agli originali IT. Non è un bug risolvibile tecnicamente — valutazione: non investire altro tempo di indagine su questo nel breve termine, è un problema di tempo/autorità.

### Cloudflare Analytics (27/7→8/8, 13 giorni)
- 102.019 uniques, 153.858 pageviews, 515.152 requests — media 7.848 uniques/giorno, 11.835 pv/giorno
- **Cache rate 2,77%** (era 2,72% il 27/7) — invariato. **Correzione importante rispetto alle entry precedenti (che dicevano "Cache Rule HTML mai implementata" — FALSO, verificato l'8/8):** la Cache Rule per HTML/JSON esiste davvero (ruleset "OEL Cache Rules", id `a1645e425b1d48b6be5c154b702da6f0`, regola `edf9eca073014e22a796bf9a6b1c9716`, creata il 20/6, `enabled: true`, espressione corretta, TTL edge 1h) ma **non ha mai avuto alcun effetto misurabile** — verificato l'8/8 con header live: `cf-cache-status` completamente assente (non "BYPASS", proprio assente) su homepage statica, pagine articolo SSR, produzione (via Worker) e staging diretto (senza Worker) — quindi non è colpa del Worker proxy. Causa più probabile (non documentata esplicitamente da Cloudflare ma coerente col loro stesso avviso ufficiale sulle Cache Rules + Pages custom domain): **Cloudflare Pages non si integra in modo affidabile col prodotto "Cache Rules" di zona**, pensato per origin tradizionali dietro reverse proxy, non per Pages. Non è un errore di configurazione da correggere (la regola è già corretta) — un fix reale richiederebbe una cache esplicita via Worker (Cache API), lavoro non banale, non ancora valutato se ne vale la pena data la Free tier e il traffico attuale.
- Country: US 301k requests (dominante), IT 41,8k, FR 25,3k, DE 23,7k, CN 17,6k, SG 12,2k, threats concentrati su GB (4.498) e US (3.522)

### GA4 (27/7→8/8)
- **Italia: 691 utenti, 800 sessioni, 1.130 pageviews in 13 giorni → 53 utenti/giorno media**, +40% rispetto ai 38/giorno del check del 27/7 — crescita reale confermata su più check consecutivi (21→38→53 utenti/giorno su fine giugno/27-7/8-8)
- Sorgenti Italia: google/organic dominante (503 utenti, 750 pageviews), direct 135 utenti
- **Globale per paese: Singapore 3.361 "utenti" con durata sessione 0s** — ritorno di traffico bot, molto oltre i 26 residui rilevati il 27/7 (allora si era conclusa una WAF rule SG/CN del 28/6 stabilmente efficace). Il Managed Challenge non blocca in modo duraturo bot che eseguono JS e triggerano il beacon GA4 — pattern intermittente, non un'azione urgente ma da ricontrollare al prossimo check invece di considerarlo risolto.

### Uptime (27/7→8/8)
- Tutti i 6 monitor status UP, **0 eventi down/up nel periodo** — settimana pulita.

### Redirect legacy (produzione, 1096 voci)
- Attenzione operativa: `scripts/verify-redirects.mjs` di default punta a staging (`BASE_URL` hardcoded) — prima run senza override ha dato un falso 98,4% fail rate. Rilanciato con `BASE_URL="https://ombreeluci.it" node scripts/verify-redirects.mjs`.
- **1096/1096 OK, fail rate 0%** — nessuna regressione.

### Risposte alle domande aperte dal check del 27/7
1. **Plateau GSC sbloccato dopo il fix BUG-EN-STAGING?** Sì — impressioni e click in crescita ~+30-35% nella finestra di osservazione di 2 settimane prevista.
2. **Cache rate CF ancora ~2,7%?** Sì, 2,77% — invariato, Cache Rule HTML ancora da implementare.
3. **EN click ancora vicini a zero su 3.400+ articoli?** Sì, confermato — 9 click totali nel periodo.

### Da fare prossimo check
- Confermare che il trend di crescita GSC/GA4 prosegue (secondo check di conferma dopo lo sblocco del plateau)
- Ricontrollare il traffico bot Singapore su GA4 — capire se il pattern è intermittente o se la WAF rule del 28/6 ha smesso di essere efficace
- Controllare GSC Copertura/Indicizzazione per capire la causa reale della bassa visibilità EN (azione consigliata dal 27/7, non ancora fatta)
- Implementare Cache Rule HTML e rimisurare cache rate CF (azione consigliata dal 27/7, non ancora fatta)

---

## 2026-07-27 — check completo GSC + CF + GA4 (primo check da 28/6, quasi un mese di gap)

**Stato generale:** plateau su GSC (non crescita, non crollo), EN ancora sostanzialmente invisibile, crescita reale confermata su GA4 Italia, cache CF diagnosticata (causa trovata).

### GSC Search Analytics (28/6→25/7)
- Impressioni: 1.560-2.293/giorno, click 19-46/giorno, posizione media 8.5-11.8 — **piatto**, nessuna prosecuzione del trend di crescita maggio-giugno (739→4.162 impressioni/giorno)
- **Ipotesi sul plateau:** il bug BUG-EN-STAGING (hreflang/canonical/social che puntavano a `ombreeluci-staging.pages.dev`, fixato il 24/7) è stato live in produzione per una parte non quantificata di luglio, dopo le modifiche al Worker dell'incidente noindex dell'8-9/7. Segnali contraddittori a Google (canonical/hreflang non sempre coerenti) sono un sospetto plausibile per l'assenza di crescita. **Verificato 27/7:** il fix è live e corretto (curl su pagina di test: canonical e hreflang puntano a `ombreeluci.it`). Da monitorare le prossime 2 settimane — se riparte la crescita, conferma l'ipotesi.
- EN: impressioni 24-140/giorno, click quasi sempre 0 (0-1 ogni pochi giorni) su 3.400+ articoli pubblicati. Nessun segnale di decollo organico. Pagina più visibile: `/en/sections/reviews/` (143 impressioni, posizione 22.3). **Azione consigliata non ancora fatta:** controllare il report GSC Copertura/Indicizzazione (non solo Search Analytics) per capire se la causa è "crawled non indicizzata" (problema di qualità/valore percepito) o "individuata non ancora scansionata" (solo questione di tempo/crawl budget).

### Cloudflare Analytics (13-26/7)
- 106k uniques, 223k pageViews, 672k requests in 14 giorni — media 7.574 uniques/giorno, 15.954 pv/giorno
- **Cache rate 2,72%** — invariato da giugno nonostante l'audit CF del 21/6. **Causa trovata questa sessione:** l'audit di giugno ha coperto solo gli asset statici (Transform Rule cache immutable); l'HTML — la maggioranza delle richieste — non è mai stato reso "eligible for cache" via Cache Rule. L'homepage risponde `Cache-Control: public, max-age=0, must-revalidate` (comportamento di default CF Pages, niente cache); le pagine articolo SSR rispondono `s-maxage=3600` ma Cloudflare non lo rispetta di default per contenuto dinamico senza una Cache Rule esplicita. **Azione consigliata:** aggiungere una Cache Rule "Eligible for Cache" sulle route HTML (partendo dalle pagine articolo), rispettando il TTL d'origine — potenziale guadagno reale su performance e carico Worker/Pages Function, non ancora implementato.

### GA4 (13-26/7)
- **Italia: 538 utenti in 14 giorni (~38/giorno)** — +80% rispetto alla baseline di fine giugno (~21/giorno). Crescita reale confermata.
- **Traffico internazionale ora distribuito su paesi reali** (USA 140, Svizzera 29, Giappone 29, Francia 26, UK 25, Olanda 21, Germania 19...) invece che dominato da bot Singapore/Cina come a fine giugno. La WAF rule "Block bot spam SG/CN" del 28/6 sembra aver funzionato meglio nel tempo di quanto risultasse dal check del 7/7 (allora sembrava inefficace — vedi entry precedente). Singapore ora a soli 26 utenti con durata sessione ~1s (ancora bot residuo, ma volume molto ridotto rispetto a giugno).

### Bug trovati durante questa sessione (impatto SEO/dati indiretto)
*Nota di fusione: questi bug sono ora narrati per intero, con marcatori FATTO/RISOLTO/APERTO, nei blocchi `[BUG] Segnalazioni 2026-07-27` e `[BUG] Segnalazioni 2026-07-28` nella timeline principale più sopra in questo file.*
- **ALGOLIA-SYNC-401**: la Flow di sync Algolia fallisce silenziosamente da tempo indeterminato (secret disallineato Directus↔CF Pages) — la ricerca interna del sito può mostrare dati stale (foto, titoli) per un numero non quantificato di articoli modificati dopo l'ultimo secret valido. Non ancora risolto sistemicamente (solo stopgap su un articolo) al momento di questa nota — risolto sistemicamente lo stesso giorno, causa reale = Cloudflare Bot Fight Mode (vedi blocco `[BUG]` sopra).
- **Import traduzione silenzioso**: una traduzione con JSON malformato non genera errore visibile — un articolo tradotto può restare invisibile online senza che nessuno se ne accorga finché non lo si cerca esplicitamente.

### Da fare prossimo check
- Verificare se il plateau GSC si sblocca dopo il fix BUG-EN-STAGING (confronto prossime 2 settimane)
- Controllare GSC Copertura/Indicizzazione per capire la causa reale della bassa visibilità EN
- Implementare Cache Rule HTML e rimisurare cache rate CF
- Rotazione `ALGOLIA_SYNC_SECRET` + reindex completo Algolia

---

## 2026-06-28 — check completo GSC + CF + GA4

**Stato generale:** sano, traffico organico stabile. Scoperta e bonifica spam bot.

### GSC Search Analytics (14-25/6)
- Impressioni: 3.000-4.100/giorno (14-18/6), calate a 1.987-2.681 (19-25/6) — probabile stagionalità fine scuole
- Click: 30-46/giorno, stabile
- Posizione media: 9.1-11.0, stabile
- Top pagina: "22 mini giochi da fare insieme" (55 click, 3.264 impressioni)
- EN emergente: `/en/authors/anna-cece/` con 2.104 impressioni (posizione 10)

### Cloudflare Analytics (14-27/6)
- 188k uniques, 329k pageViews, 902k requests in 14 giorni
- **85% traffico è bot** (US 50%, SG 7%, CN 5%, IT solo 5.5%)
- Cache rate 0.61% — quasi tutto va al Worker SSR
- SG: 5.561 threats su 60k requests — spam puro

### GA4 (14-27/6) — prima volta con accesso API
- Property `G-2TJV78DNFQ`, ID `308368126`
- **Utenti reali Italia: ~298 in 14 giorni (~21/giorno)**
- Durata media sessione (organic): 68 secondi — buona
- Top eventi Italia: scroll_depth (216), durata_permanenza_3m (32), form_start (10), support_scroll_bonifico (3)
- 90% del traffico GA4 era spam bot Singapore (2.925 users finti con durata 2s)

### Pagine EN fuori Italia
- 52 users umani reali, 114 pageViews (giugno)
- Paesi reali: US (13), UK (4), Australia (2), Irlanda, Canada
- Top EN: "22 fun mini games to play together" (10 users)
- Google sta indicizzando i 3.400 articoli EN — ROI atteso in 3-6 mesi

### Azioni intraprese
- **WAF rule "Block bot spam SG/CN" deployata** — Managed Challenge su traffico SG e CN (esclusi bot verificati). Eliminerà ~85% del traffico fake.
- Creato `scripts/cf-analytics.mjs` — query CF Analytics via API (token `CF_ANALYTICS_TOKEN`)
- Creato `scripts/ga-query.mjs` — query GA4 via API (stessa service account di GSC)
- Copiato `.secrets/ombreeluci-seo-*.json` da `gsc/` a `.secrets/`

### Da monitorare
- Effetto WAF rule nei prossimi giorni (calo requests CF, calo spam GA4)
- Cache rate CF — da migliorare con page rules o cache headers
- Calo impressioni GSC: se continua sotto 2.000/giorno la prossima settimana, investigare

---

## 2026-06-20 — check manuale sessione interattiva

**Stato generale:** sano, crescita confermata. Record impressioni.

- **GSC Search Analytics (21/5→18/6):** impressioni in crescita costante 739→3.500+/giorno (picco 4.162 il 16/6, record). Click 7→46/giorno. Posizione media migliorata a 9.9. CTR stabile ~1.3%. Nessun impatto residuo dall'outage DNS 8-10/6.
- **Top pagine:** "22 mini giochi da fare insieme" (106 click, 7.601 impressioni), "14 giochi da fare insieme" (44 click), homepage (31 click, CTR 11.6%), "The Crown cugine autismo" (22 click). Pagine autore e categorie in crescita.
- **EN emergente:** `/en/authors/anna-cece/` con 2.000 impressioni (3 click). Homepage EN 19 impressioni, 2 click. Primi segnali di indicizzazione EN.
- **Trailing slash duplicati:** GSC mostra URL con e senza trailing slash come pagine separate (es. `/it/categoria/cultura` e `/it/categoria/cultura/`). Il Worker Rule R dovrebbe fare 301 — da verificare che il redirect funzioni lato server; potrebbe essere un artefatto GSC storico pre-fix.
- **Uptime (15/6→20/6):** non verificato (UPTIMEROBOT_API_KEY non in .env.local su questa macchina). Da aggiungere per prossimi check.

**Confronto con check precedente (15/6):**
- Impressioni: 3.049 → 3.500+/giorno (+15%)
- Click: 47 → 46/giorno (stabile)
- Posizione: 10.1 → 9.9 (migliorata)

---

## 2026-06-15 — check settimanale

**Stato generale:** sano (uptime e redirect perfetti). GSC non verificato per un problema tecnico del cron, vedi nota.

- **GSC Search Analytics:** ❌ check non eseguito — il file di credenziali `.secrets/ombreeluci-seo-1ede0e05d5b6.json` (locale, gitignored) non è presente nell'ambiente di esecuzione del cron. Da risolvere per i prossimi check automatici.
- **Uptime (8/6→15/6):** tutti i 6 monitor UP, 0 eventi down/up nell'ultima settimana. Settimana pulita (dopo il recovery dall'outage DNS dell'8/6).
- **Redirect legacy (produzione, 1096 voci):** 1096/1096 OK, fail rate 0%. Miglioramento rispetto al baseline 21/5 (1095/1097 — i 2 fail su URL spam non-Latini non risultano più tra le voci attuali).

**Attività proposte:**
1. Decidere come rendere disponibile la credenziale GSC nell'ambiente del cron (es. variabile d'ambiente con contenuto JSON, o eseguire questo step solo nel check di backup a inizio sessione interattiva).

---

## 2026-06-14 — setup iniziale

**Stato generale:** sano.

- **GSC Search Analytics (22/5→12/6):** impressioni in crescita 739→3049/giorno, click 7→47, posizione media stabile 9-11. Trend in salita continuo, nessun impatto visibile dall'outage del 7-8/6.
- **Nota:** la colonna "Impressioni" del CSV export GSC Coverage (che mostrava un calo -48% 22/5→8/6) è un falso allarme — misura qualcosa di diverso da Search Analytics. Per il traffico reale usare sempre Search Analytics.
- **Outage dominio 8-10/6:** dominio ombreeluci.it non rinnovato, ~52h di instabilità (DNS + 5xx), risolto. Auto-renewal DNS ora attivo.
- **Redirect legacy (1096 voci):** baseline `verify-redirects` del 21/5 = 1095/1097 ok. I 2 fail sono su URL spam non-Latini (`/с-рождеством/`, `/メリークリスマス/`), ignorabili.
- **Uptime:** nessun downtime oltre l'outage DNS dell'8/6.

**Attività proposte:** nessuna — tutto in linea.

---

## Appendice — contenuto residuo non correlato ai bug (fondo di bug_ux_ui.md)

*Il blocco seguente è stato trovato in coda a `bug_ux_ui.md` (dopo l'ultima sezione di bug reale), senza alcuna relazione con bug/UX/UI — sembra un elenco di credit fotografici Unsplash per didascalie, incollato lì per errore o come nota di lavoro. Riportato integralmente per non perdere informazione (potrebbe essere ancora necessario per attribuzioni foto), ma isolato qui perché non è cronologia né backlog.*

```
DIDASCALIE


https://unsplash.com/it/foto/un-dipinto-astratto-colorato-con-uno-sfondo-bianco-KTrMmadLm7w
Foto di <a href="https://unsplash.com/it/@vackground?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">vackground.com</a> su <a href="https://unsplash.com/it/foto/un-dipinto-astratto-colorato-con-uno-sfondo-bianco-KTrMmadLm7w?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

steve-a-johnson-RKRnPx9e4jQ-unsplash.jpg
Foto di <a href="https://unsplash.com/it/@steve_j?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Steve A Johnson</a> su <a href="https://unsplash.com/it/foto/pittura-astratta-blu-e-rossa-RKRnPx9e4jQ?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

fia-yang-5ye2nOdHDqM-unsplash.jpg
Foto di <a href="https://unsplash.com/it/@fiayang?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">FÍA YANG</a> su <a href="https://unsplash.com/it/foto/una-foto-in-bianco-e-nero-di-una-mucca-5ye2nOdHDqM?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

fia-yang-ENrCGBOFcnw-unsplash.jpg
Foto di <a href="https://unsplash.com/it/@fiayang?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">FÍA YANG</a> su <a href="https://unsplash.com/it/foto/una-foto-in-bianco-e-nero-del-volto-di-una-donna-ENrCGBOFcnw?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

everett-beaupit-A0nyxh7w6O8-unsplash.jpg
Foto di <a href="https://unsplash.com/it/@j_b_photography?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Everett Beaupit</a> su <a href="https://unsplash.com/it/foto/alberi-sfocati-appaiono-sullacqua-A0nyxh7w6O8?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>


jr-korpa-PY6OnoitYfY-unsplash.jpg
Foto di <a href="https://unsplash.com/it/@jrkorpa?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Jr Korpa</a> su <a href="https://unsplash.com/it/foto/una-foto-in-bianco-e-nero-di-persone-che-camminano-lungo-un-sentiero-PY6OnoitYfY?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

jr-korpa-WKK4yIc3JBM-unsplash.jpg
Foto di <a href="https://unsplash.com/it/@jrkorpa?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Jr Korpa</a> su <a href="https://unsplash.com/it/foto/unimmagine-sfocata-di-un-uomo-che-cammina-sotto-la-pioggia-WKK4yIc3JBM?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

kseniya-lapteva-xw8dKzrjXbk-unsplash.jpg
Foto di <a href="https://unsplash.com/it/@ksushlapush?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Kseniya Lapteva</a> su <a href="https://unsplash.com/it/foto/pittura-astratta-bianca-e-grigia-xw8dKzrjXbk?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

xander-ashwell-bhTjAUHHvSg-unsplash.jpg
Foto di <a href="https://unsplash.com/it/@xanderashwell?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Xander Ashwell</a> su <a href="https://unsplash.com/it/foto/fotografia-in-scala-di-grigi-del-campo-derba-bhTjAUHHvSg?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

hilda-rytteke-tSWxeJx-C3E-unsplash.jpg
Foto di <a href="https://unsplash.com/it/@hilda_r?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Hilda Rytteke</a> su <a href="https://unsplash.com/it/foto/un-uccello-seduto-su-un-ramo-dellalbero-tSWxeJx-C3E?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

jan-huber-3D_Ks04MYdI-unsplash.jpg
Foto di <a href="https://unsplash.com/it/@jan_huber?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Jan Huber</a> su <a href="https://unsplash.com/it/foto/pali-elettrici-sul-campo-sotto-il-cielo-bianco-3D_Ks04MYdI?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

mahdi-bafande-CYsMPZ2yjlw-unsplash.jpg
Foto di <a href="https://unsplash.com/it/@mahdibafande?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Mahdi Bafande</a> su <a href="https://unsplash.com/it/foto/texture-fume-grigio-chiaro-e-scuro-astratta-CYsMPZ2yjlw?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

martin-martz-W0EaIFjAck4-unsplash.jpg
Foto di <a href="https://unsplash.com/it/@martz90?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Martin Martz</a> su <a href="https://unsplash.com/it/foto/uno-sfondo-astratto-blu-con-forme-ondulate-W0EaIFjAck4?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

james-trenda-bZFkDfESCR8-unsplash.jpg
Foto di <a href="https://unsplash.com/it/@trendagraphy?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">James Trenda</a> su <a href="https://unsplash.com/it/foto/unonda-nelloceano-bZFkDfESCR8?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

thomas-lindner-6GmAvTz-QwY-unsplash.jpg
Foto di <a href="https://unsplash.com/it/@vertic4l?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Thomas Lindner</a> su <a href="https://unsplash.com/it/foto/una-lunga-strada-vuota-che-scompare-nella-nebbia-6GmAvTz-QwY?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

jr-korpa-GQeSfSWmXvI-unsplash.jpg
Foto di <a href="https://unsplash.com/it/@jrkorpa?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Jr Korpa</a> su <a href="https://unsplash.com/it/foto/pittura-astratta-verde-e-blu-GQeSfSWmXvI?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

kate-trysh-s0yXRDMr6bY-unsplash.jpg
Foto di <a href="https://unsplash.com/it/@katetrysh?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Kate Trysh</a> su <a href="https://unsplash.com/it/foto/nuvole-soffici-illuminate-dalla-luce-soffusa-del-sole-dallalto-s0yXRDMr6bY?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

niko-n-_FJNAM5B0p0-unsplash.jpg
Foto di <a href="https://unsplash.com/it/@niko_nguyen_10?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">niko n</a> su <a href="https://unsplash.com/it/foto/alba-sopra-le-nuvole-dal-finestrino-dellaereo-_FJNAM5B0p0?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

caio-brigagao-lunardi-_Ye1pm9fGZ4-unsplash.jpg
Foto di <a href="https://unsplash.com/it/@cblunardi?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Caio Brigagão Lunardi</a> su <a href="https://unsplash.com/it/foto/fotografia-aerea-del-mare-di-nuvole-durante-lora-doro-_Ye1pm9fGZ4?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

dennis-van-lith-rD1_nrA5_1U-unsplash.jpg
Foto di <a href="https://unsplash.com/it/@le_marquis?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Dennis van Lith</a> su <a href="https://unsplash.com/it/foto/cielo-blu-e-nuvole-bianche-durante-il-tramonto-rD1_nrA5_1U?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
```
