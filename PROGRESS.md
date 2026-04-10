# PROGRESS — Ombre e Luci

**Ultimo aggiornamento:** 2026-04-09 (sessione i18n Fase 0 chiusa + Backfill traduzioni)
**Stato:** Stack Astro+Directus attivo su staging — output:hybrid, blog SSR on-demand con edge cache CF. WordPress su Aruba resta online fino al cutover DNS finale.

---

## Document Precedence (i18n)

Per tutte le decisioni i18n/multilingua:

1. `docs/I18N_MASTER_PLAN.md` (architettura ufficiale)
2. `PROGRESS.md` (stato e priorità operative)
3. `TRADUZIONI.md` (pipeline traduzione AI)

`STATO_PROGETTO.md` resta storico/legacy.

---

## Definition of Done — Pagine "Articoli Rullo"

Un task di tipo "rullo articoli" (lista filtrata di articoli) è **completo** quando:

| # | Criterio | Come verificarlo |
|---|----------|-----------------|
| A | La pagina passa ad `ArticoliRullo` una lista **già filtrata e ordinata** (nessuna logica business nel componente) | Leggere il frontmatter della pagina: solo `filter()` + `sort()` |
| B | `ArticoliRullo` renderizza: titolo, conteggio, descrizione opzionale, griglia card, stato vuoto | Aprire la pagina con 0 articoli → deve comparire il messaggio vuoto |
| C | HTML valido: **nessun `<a>` annidato**, nessun `</body>`/`</html>` nei children di `BaseLayout` | `npm run build` senza warning HTML; ispezione manuale del source |
| D | UI mobile-first: nessun overflow orizzontale, focus/hover visibili, righe cliccabili in modo chiaro | DevTools 375px — nessun scrollbar orizzontale |
| E | Nessuna modifica a `directus.ts` o al layer fetch per questo task | `git diff src/lib/directus.ts` deve essere vuoto |
| F | Nessun JS che interferisca con auth Directus (`fetch('/users/me')`) o con flag `has_comments` | Aprire un articolo da redazione loggata → edit button visibile |
| G | Decisione esplicita su "load more" documentata in PROGRESS.md | Voce nella tabella sessione corrente |
| H | SEO/layout coerenti: `BaseLayout` con `title`, `description`, `noindex` quando richiesto | Head sorgente HTML della pagina |
| I | `npm run build` verde + smoke test su almeno 3 pagine rullo | Log build pulito |
| J | Lint pulito sui file toccati + aggiornamento PROGRESS.md con esito e pagine migrate | `npm run lint` (se configurato) |

**Decisione load-more (2026-04-07):** rimosso da `web-only.astro` — la pagina renderizza l'intera lista. L'approccio inline-JSON precedente era fragile e incoerente con le altre pagine rullo. Se in futuro il volume cresce (>200 articoli), aggiungere paginazione server-side come feature dedicata.

---

### Sessione 2026-04-09 — i18n Fase 0 chiusa + Backfill (branch `feat/i18n-shell`)

#### Fase 1 — Shell EN: COMPLETATA ✅

| Task | Cosa | Stato |
|------|------|-------|
| F1-1 | `blog/[...slug].astro` — `locale` da `articolo.lang`; date localizzate; archival alert mutually exclusive; `lang` in `__BLOG_PAGE_DATA__`; `<Commenti lang>` | ✅ |
| F1-2 | `BaseLayout.astro` — passa `lang` a `<Header>` e `<Footer>` | ✅ |
| F1-3 | `Header.astro` — prop `lang` override URL-detection; passa `lang` a `LanguageSelector` | ✅ |
| F1-4 | `Footer.astro` — prop `lang` override URL-detection | ✅ |
| F1-5 | `LanguageSelector.astro` — prop `lang`; client usa `__BLOG_PAGE_DATA__.lang` (fix EN articles a `/blog/slug`) | ✅ |
| F1-6 | `Commenti.astro` — prop `lang`, stringhe IT/EN localizzate incluse JS inline | ✅ |
| F1-7 | Shell EN completata su `Header.astro`/`Footer.astro` — logo locale-aware (`/blog/en`), mega-menu/footer tradotti, label temi da slug (`getCategoriaLabel`) | ✅ |
| GATE-1 | `npm run build` verde dopo fix F1 shell | ✅ |
| GATE-2 | Fix cross-platform prebuild (`package.json`: `cp` -> `node:fs.copyFileSync`) + `npm run build` verde su Windows | ✅ |

#### Fase 0 — Normalizzazione categorie: COMPLETATA ✅

| Task | Cosa | Stato |
|------|------|-------|
| F0-1 | `src/data/categorie.json` — 14 slug canonici Megacluster + {it,en} label | ✅ |
| F0-2 | `scripts/db_analysis/normalize_categoria_menu.py` — script idempotente, dry-run+CSV | ✅ |
| F0-3 | `src/config/taxonomy.js` — `getCategoriaLabel` + `getMegaclusterForArticle` lang-aware | ✅ |
| F0-4 | Directus PATCH — 3483 articoli migrati IT label → slug canonico; 0 errori finali; 0 sconosciuti | ✅ 2026-04-09 |
| F0-5 | V-02: 19 articoli "da-categorizzare" — assegnazione manuale redazione | ⏳ Redazione |
| DOC | `docs/I18N_MASTER_PLAN.md` — gate F0/F2, decisione Pagefind EN | ✅ |

**Artefatti F0-4:**
- CSV live: `scripts/db_analysis/logs/normalize_categoria_menu_20260409_003658.csv`
- Log: `scripts/db_analysis/logs/normalize_categoria_menu_20260409_003648.log`

#### Backfill traduzione link: COMPLETATO ✅

| Esito | Count |
|-------|-------|
| Link IT↔EN creati | 40 |
| Ambigui (review manuale) | 7 |
| No match | 11 |
| CSV | `scripts/traduzione/logs/backfill_traduzione_link_20260408_231827.csv` |

I 7 ambigui e 11 no-match vanno revisionati manualmente dal CSV (slug EN → slug IT da collegare in Directus).

#### Prossimo step: Fase 2 — Routing `/en/`

Come da `docs/I18N_MASTER_PLAN.md` §5 Fase 2:
1. Introdurre route `/en/...` con redirect 301 da `/blog/*-en/` → `/en/*/`
2. Canonical per lingua + hreflang reciproci
3. Sitemap EN (`/sitemap-en.xml`)
4. Smoke test SEO con Screaming Frog su staging (gate F2 misurabili)

**Prerequisito smoke test F1** (prima di avviare F2): aprire su staging 3 articoli EN → verificare shell lingua, switcher IT↔EN funzionante (40 nuovi link attivi), commenti EN, badge categoria slug→label EN.

**Dove aprire gli URL (smoke):** base staging **https://ombreeluci-staging.pages.dev** — elenco EN: **https://ombreeluci-staging.pages.dev/blog/en/** (HTTP 200). Da lì aprire **3 card** a caso (oppure link diretti, stesso host): es. `/blog/il-progetto-dandelion-en`, `/blog/dialogo-aperto-n-165-en`, `/blog/adesso-saremo-tutti-diversi-en`. Controllare: header/footer EN, switcher → versione IT corretta, form commenti in inglese, badge categoria tradotto.

**Perché non vedi deploy “del branch i18n”:** il progetto CF Pages **`ombreeluci-staging`** è configurato per buildare da **`main`** (push → deploy). Il lavoro su **`feat/i18n-shell`** è in repo **solo dopo merge su `main` + `git push origin main`** (o preview branch se attivata in dashboard CF). In locale: `git branch` mostra `* feat/i18n-shell`; su GitHub il branch compare dopo `git push -u origin feat/i18n-shell`.

**Ordine consigliato:** (1) commit + merge `feat/i18n-shell` → `main`, (2) push `main`, (3) attendere deploy verde in Cloudflare → Dashboard **Workers & Pages** → progetto Pages → ultimo deployment, (4) solo allora smoke su URL sopra — altrimenti si testa il **codice vecchio** su staging.

---

### Sessione 2026-04-07 — infrastruttura hardening + ArticoliRullo (branch `feat/articoli-rullo`)

| Task | Cosa | Stato |
|------|------|-------|
| Gate 1 | Rimossi `</body></html>` stray in `diari.astro` e `dialogo-aperto.astro` | ✅ |
| Gate 2 | Rimosso link annidato `<a>` autore dentro `<a>` articolo in `ArticleListRow.astro` | ✅ |
| Gate 3 | Load-more rimosso da `web-only.astro` (decisione esplicita, vedi DoD sopra) | ✅ |
| COMP | Creato `src/components/ArticoliRullo.astro` — componente puro, nessuna logica business | ✅ |
| MIG | `archivio/web-only.astro` migrato a `ArticoliRullo` | ✅ |
| MIG | `sezioni/dialogo-aperto.astro` migrato a `ArticoliRullo` | ✅ |
| INF | `articoli-build.ts` + snapshot fallback per build offline | ✅ |
| INF | Backup DB giornaliero + volumi settimanali su R2, restore testato | ✅ |
| INF | UFW attivo, porta 8055 bind 127.0.0.1, systemd restart | ✅ |
| INF | `RUNBOOK.md` + `INFRASTRUTTURA.md` + `sync-runbook.yml` workflow | ✅ |
| INF | `nightly-build.yml` con Directus health check + Slack alert | ✅ |
| INF | Cache-Control blog: `s-maxage=3600, stale-while-revalidate=86400` | ✅ |

**Pendenti su `feat/articoli-rullo`:**
- Migrare `diari.astro` feed section ad `ArticoliRullo` (la sezione polaroid rimane)
- `npm run build` smoke test + merge su main

---

### Sessione 2026-04-04 — completato

| Commit | Task | Cosa |
|--------|------|------|
| `cd6ff49c` | UX-02 | Mobile round 2: breakpoint 480px su `diari.astro`, `autori/[slug].astro`, `chi-siamo/index.astro`. Pagine già OK senza intervento: `autori/index`, `cerca`, `sostienici`, `archivio`, `404`. |
| `101c05d4` | UX-05 | Mega-menu active state: `isActive(href)` build-time in `Header.astro`, `class:list` su tutti i link (temi/sezioni/archivio + header-link chi-siamo), CSS accent + bold. |
| `5b49c9d0` | US-08 | IssueCard riformattato: titolo "Numero N – Titolo", meta "Ott-Dic 2025 · Anno 42 · IV" calcolata a build-time da `numero_progressivo` + `anno_pubblicazione`. `periodo_label` aggiunto alla fetch Directus. |
| (pending push) | UX/FIX | **Edit button + box editoriale**: rimosso sistema localStorage `?redazione=1`, sostituito con controllo auth Directus (`fetch /users/me credentials:include`). ⚠️ Richiede `CORS_ORIGIN=https://ombreeluci.it` + `CORS_CREDENTIALS=true` in Directus. |
| (pending push) | UX/FIX | **debug-section**: aggiunto `display:none` CSS in `blog/[...slug].astro` — sezione sempre nascosta. |
| (pending push) | UX/FIX | **Footer sezioni**: aggiunto "Dialogo aperto" (`/sezioni/dialogo-aperto`), ordine e href allineati al megamenu. |
| (pending push) | UX | **Homepage tagline**: rimosso `<br>` e punto finale — tutto su una riga. |
| (pending push) | UX | **Homepage recenti**: colonna destra aumentata da 3 a 6 articoli. |

### Da verificare e validare

| Priorità | Cosa | Chi | Note |
|----------|------|-----|------|
| 🔴 Alta | **CORS Directus** — configurare `CORS_ORIGIN=https://ombreeluci.it` e `CORS_CREDENTIALS=true` nel pannello Directus (o `docker-compose.yml`). Senza questa config, il bottone "Modifica in Directus" e il box revisione editoriale restano sempre nascosti anche per gli utenti loggati. | Dev/sysadmin | `cms.ombreeluci.it` → Settings → CORS |
| 🟡 Media | **Test auth flow**: aprire un articolo su `ombreeluci.it` mentre si è loggati su `cms.ombreeluci.it` → verificare che compaia il bottone Modifica; poi aprire in tab privata → deve essere assente. | Redazione | |
| 🟡 Media | **Footer link "Dialogo aperto"**: verificare che `/sezioni/dialogo-aperto` esista e mostri contenuto corretto. | Redazione | |
| 🟢 Bassa | **Homepage recenti**: verificare che 6 articoli nella colonna destra si visualizzino bene su mobile. | Chiunque | |

---

## ⛔ REGOLA OBBLIGATORIA — leggere prima di qualsiasi implementazione

> **Prima di iniziare qualsiasi task di sviluppo non banale (SSR, adapter, routing, bundle, CF Worker, middleware, nuove pagine dinamiche):**
>
> 1. Leggere **`ARCH-04-PLAYBOOK.md`** — metodologia completa con gate obbligatori
> 2. Aprire un **branch dedicato** — mai lavorare su `main` direttamente
> 3. Verificare tutti i gate in sequenza prima del merge
>
> Non esistono eccezioni. Il casino del 2026-04-03 è costato mezza giornata e una riunione con la redazione.

---

## Regole operative — infrastruttura e routing (obbligatorie)

**Errore metodologico da non ripetere (incidente 2026-04):** sono stati fatti **commit e deploy su ipotesi non validate** (adapter, route Worker, service binding, middleware) **senza** aver prima mappato **DNS → Worker → origine effettiva del traffico**. In particolare: con DNS ancora orientato ad Aruba, il **sito Astro su `ombreeluci.it` dipendeva dal Worker con route `/*`** come unico ponte verso Pages; rimuovere quel route “per eliminare un conflitto” **senza** un piano B ha lasciato il pubblico sul flusso DNS grezzo (es. WordPress). **Velocità e volume di commit non sostituiscono una verifica misurabile.**

**Prima di toccare Worker, DNS, adapter Cloudflare o pass-through:**

1. **Disegna la catena** (anche su carta): *record DNS apex/www → cosa risolve → Worker attivo? quale pattern di route? → fetch verso Pages/Aruba/altro*. Se non sai rispondere, **non committare**.
2. **Un solo cambio alla volta**, poi **smoke test** (URL fissi: home, un articolo SSR, un asset statico, eventuale `/api/revalidate`). Se fallisce, **stop**: niente stack di tre approcci diversi nello stesso giorno.
3. **Micro-esperimento prima del commit multi-file:** es. una riga di pass-through verso un URL noto, o `wrangler dev` + richiesta singola — solo dopo, refactor strutturale.
4. **Criterio di successo oggettivo:** codice HTTP atteso, commit/deploy atteso in dashboard CF, non solo “sembra a posto in locale”.
5. **Dopo un fallimento:** rivaluta la diagnosi; **non** aggiungere una nuova architettura sopra la precedente senza rollback mentale dello stato “ultimo noto buono”.

**Formula da ricordare:** *nessun commit che cambia routing o origine senza baseline documentata e prova sul perimetro reale (staging o curl verso produzione controllata).*

**CSS — regola assoluta (non negoziabile):** usare **sempre le classi globali esistenti** (`global.css`: `.container`, `.site-main`, ecc.). **Vietato** creare classi custom per singola pagina, aggiungere blocchi `<style>` locali per utility già coperte, o inventare `.nome-pagina-container` senza definizione nel CSS globale. Se la classe non esiste e il pattern è generico, si aggiunge a `global.css` — non si crea una pezza locale. Stili inline ammessi solo per micro-aggiustamenti puntuali (`padding-top: 2rem`) non ripetibili altrove.

**Agenti (Cursor / Claude):** per **audit o diagnosi** richiesti senza parola d’ordine di implementazione, vale la regola di progetto in `.cursor/rules/audit-diagnosi-sola-lettura.mdc` — **solo lettura**, nessun commit/deploy, per non sovrapporre interventi con altri strumenti sullo stesso incidente.

---

## Riferimenti rapidi

| Cosa | Dove |
|------|------|
| Sito staging | https://ombreeluci-staging.pages.dev |
| CMS Directus | https://cms.ombreeluci.it (admin) |
| VPS Hetzner | 159.69.196.64 — CX23, Ubuntu 24.04, €4.09/mese |
| R2 bucket | `oel-media` (pub: `pub-2251dc2142e3492a961f629f2af543d0.r2.dev`) |
| Credenziali VPS | `vps_credentials.txt` (locale, non committare) |
| Credenziali R2 | `.env` (non committare) |

---

## Infrastruttura deploy

| Componente | Dettaglio |
|-----------|-----------|
| **CF Pages project** | `ombreeluci-staging` (nome storico) — branch `main` → deploy automatico su push |
| **Dominio** | `ombreeluci.it` punta al Pages project via CF DNS |
| **CF Worker** | `ombreeluci-redirects` — route **`ombreeluci.it/*`**: (1) path WordPress → proxy Aruba; (2) redirect legacy tab + regex data (stesso `REDIRECTS` nel JS); (3) tutto il resto → **`forwardToPages`** verso `PAGES_ORIGIN` (`ombreeluci-staging.pages.dev`). Così il DNS può restare su Aruba senza mostrare WP al pubblico. |
| **Secrets Pages** | **`DIRECTUS_TOKEN`**, **`DIRECTUS_URL`** (e opz. `MEDIA_BASE_URL`): vanno duplicate in **Build** e in **Production/Preview** (CF Pages → Settings → Environment variables). Solo in *runtime* → le pagine prerenderizzate (home, hub, sitemap, ecc.) chiamano Directus in **fase di build** e senza token la lista articoli è vuota; c’è fallback `articoli_snapshot.json` via `getAllArticoliBuild()`. Per ARCH-04 anche **`REVALIDATE_SECRET`**, **`CF_ZONE_ID`**, **`CF_PURGE_TOKEN`** (purge non nel bundle). |
| **Secrets Worker** | Opzionali/none se il Worker è solo proxy WP. Se restano vecchi `wrangler secret` per purge, possono essere rimossi per evitare confusione (purge gestito da Astro). |
| **Deploy** | `git push origin main` → Pages build automatica (~3-4 min) |
| **Account CF** | Account ID: `6b071de7f55397ada5645e187c932202` |
| **Zone ID** | `0cc4507d662828548b5f9f90e4b2d494` |

---

## Stack tecnico

| Layer | Tecnologia | Stato |
|-------|-----------|-------|
| Frontend | Astro (hybrid SSR) su Cloudflare Pages | Attivo |
| CMS | Directus su Hetzner CX23 (Docker) | Operativo |
| Database | PostgreSQL 16 + pgvector 0.8.2 | Attivo |
| Storage media | Cloudflare R2 `oel-media` | Attivo |
| CMS temporaneo | Keystatic Worker su CF Workers | Attivo (solo nuovi articoli) |
| Redirect SEO | `public/_redirects` (~2000) + Worker (**apex** `ombreeluci.it`): tabella `REDIRECTS` + regex data. **`src/middleware.ts`** ripete ~1001 slug + regex per host **`*.pages.dev`** (staging diretto) e coerenza SSR. |
| Tunnel HTTPS | cloudflared `cms-oel` → porta 8055 | Attivo (systemd, boot) |

---

## Dati importati (stato al 2026-03-22)

| Risorsa | Quantità | Note |
|---------|----------|------|
| Articoli pubblicati | 3527 (IT: 3396, EN: 131) | Corpo HTML pulito, tassonomia, ruoli editoriali |
| Autori | 352 | 88 con foto su R2 (`autori/{uuid}`) |
| Numeri rivista | 204 | Copertine su R2, `copertina_url` popolato |
| Temi / Tag | 285 / 816 | M2M: 6676 articoli↔temi + 2764 articoli↔tag |
| Copertine articoli | 2972/2972 | Su R2 (`copertine/{uuid}`), campo `immagine_copertina` |
| Redirect SEO | ~18630 percorsi coperti | ~2000 `public/_redirects` + ~1001 JSON legacy + ~15582 via regex data nel middleware (stesso volume WP di prima, diverso layer). |

---

## ⚠️ Da validare dalla Redazione

> Controllare sul sito staging: **https://ombreeluci-staging.pages.dev**
> Per accedere al CMS: **https://cms.ombreeluci.it**

| # | Priorità | Cosa verificare | Come farlo |
|---|----------|-----------------|------------|
| V-01 | 🔴 Alta | **13 categorie tematiche** — la distribuzione degli articoli è sensata? Le categorie sono corrette? | Staging → menu Temi → apri ogni pagina `/categoria/*` |
| V-02 | 🔴 Alta | **21 articoli "Da categorizzare"** — vanno assegnati manualmente alla categoria giusta | Directus → Articoli → filtra `categoria_menu = Da categorizzare` |
| V-03 | 🟡 Media | **Ruoli editoriali** — `portante/strutturale/laterale/trasversale` vanno rivalutati per le nuove categorie (il ruolo è relativo alla categoria, non assoluto) | Directus → per ogni categoria, identificare quali articoli meritano "portante" |
| V-04 | 🟡 Media | **Fede e Luce (1114 articoli)** — categoria molto grande; la distribuzione interna è sensata o serve suddivisione? | Staging → `/categoria/fede-e-luce` |
| V-05 | 🟡 Media | **35 articoli Jean Vanier** — hanno `tema_label = null` dopo rimozione categoria "Personaggi che ispirano". Da riassegnare (es. "Fede e Luce") | Directus → Articoli → filtra `tema_label` vuoto |
| V-06 | 🟡 Media | **Mega-menu** — 13 nuove categorie presenti e corrette? Link "Dialogo aperto" funzionante? | Staging → apri mega-menu |
| V-07 | 🟡 Media | **Pagina /sezioni/dialogo-aperto** — 156 articoli caricano e sono pertinenti alla serie? | Staging → `/sezioni/dialogo-aperto` |
| V-08 | 🟢 Bassa | **Redirect legacy** — i vecchi URL WordPress reindirizzano al nuovo sito? | Prova: `ombreeluci.it/2015/03/20/qualche-slug/` → deve arrivare su `/blog/qualche-slug/` |
| V-09 | 🟢 Bassa | **Filtri Directus** — filtro per numero rivista e data_pubblicazione funzionano? | Directus → Articoli → icona filtro → testa i due campi |
| V-10 | 🟢 Bassa | **Didascalie copertina** — 2004 didascalie visibili sotto la foto copertina: sono corrette? Segnalare quelle errate o fuori contesto | Staging → apri vari articoli → guarda il testo sotto la foto |
| V-11 | 🟢 Bassa | **"Leggi anche" in-content** — il box a metà testo propone un articolo pertinente? | Staging → apri una decina di articoli → verifica il box "Leggi anche" a metà |
| V-12 | 🟢 Bassa | **Correlati in calce** — i 3 articoli in fondo sono tematicamente vicini? | Staging → scorri in fondo a vari articoli |
| V-13 | 🟡 Media | **Homepage v2** — le 5 sezioni sono corrette? Hero (articoli recenti in rotazione), Da vicino (diari + testimonianze), Esplora (8 categorie), La rivista (ultimo numero + archivio), Unisciti (CTA). Gli articoli proposti sono di qualità? | Staging → homepage, ricaricare più volte per vedere la rotazione |
| V-14 | 🟡 Media | **Embed video YouTube** — i video nel corpo degli articoli si vedono e si riproducono correttamente? | Staging → cerca articoli con video, es. `/blog/berlinale-74-orso-doro/` |
| V-15 | 🟡 Media | **Embed Instagram** — i post Instagram incorporati nel testo si visualizzano? | Staging → articoli con post Instagram incorporati |
| V-16 | 🟡 Media | **Pull quote (evidenziazione)** — 570 citazioni in evidenza reinserite nel testo: sono al posto giusto e formattate bene (testo centrato, bordi teal)? 16 non trovate vanno inserite a mano | Staging → apri articoli con citazioni in evidenza, es. saggi e reportage lunghi |
| V-17 | 🟡 Media | **Sommari numeri rivista** — 71 numeri hanno ora un testo introduttivo narrativo sulla pagina del numero. È leggibile e corretto? | Staging → `/archivio` → apri alcuni numeri → verifica la descrizione |
| V-18 | 🟢 Bassa | **Sottotitolo da SEO description** — gli articoli senza sottotitolo mostrano la SEO description come sottotitolo. È sempre un testo adeguato come sottotitolo? | Staging → apri articoli senza sottotitolo originale, verifica che il testo sotto il titolo abbia senso |
| V-19 | 🟢 Bassa | **Pagine categoria: colonna "In evidenza"** — gli articoli nella colonna destra sono quelli giusti? (Selezionati manualmente da Directus o automatici per ruolo editoriale) | Staging → `/categoria/*` → verifica colonna destra |
| V-20 | 🟢 Bassa | **Immagini inline nel corpo articoli** — 144 articoli avevano immagini WP inline ora migrate su R2. Verificare che le immagini si vedano correttamente e che le didascalie (figcaption) siano leggibili. | Staging → apri articoli con foto nel testo, es. `/blog/siamo-venuti-ad-assisi-per/`, `/blog/ti-ricordi-nicole/` |

---

## Backlog — Pre-lancio obbligatorio

> Queste attività bloccano o condizionano il cutover DNS. Il cutover avviene quando lo staging è pronto — nessuna scadenza fissa. Ordinate per sequenza logica.

### ARCH — Refactor architetturale

| ID | Effort | Descrizione |
|----|--------|-------------|
| ARCH-01 | ✅ Fatto | **`BaseHead.astro`** — componente condiviso per tutto il `<head>`. Props: `title`, `description`, `ogImage?`, `ogType?`, `canonical?`, `noindex?`, `lang?`, `alternates?`. Contiene: charset, viewport, favicon (png+svg+ico), title con separatore `–` automatico, meta description, Open Graph completo, Twitter Card, canonical, hreflang, Google Site Verification, preconnect R2, ViewTransitions, slot per tag extra (JSON-LD). |
| ARCH-02 | ✅ Fatto | **`BaseLayout.astro`** — wrapper `<html lang>+<head>+<body>` con slot. Props passate a BaseHead + `bodyClass` + `alternateArticleUrl` (per LanguageSelector). Slot: default (contenuto pagina) e `head` (JSON-LD, meta custom). Usato da tutte le 22 pagine del sito. Pagine custom verticali (serie, dossier) possono iniettare hero full-width e sezioni arbitrarie nello slot default. |
| ARCH-05 | ✅ Fatto | **Ambiente test locale edge CF** — `.dev.vars` + `npx wrangler pages dev ./dist` per simulare CF Pages runtime localmente. Prerequisito soddisfatto: tutti i test ARCH-04 eseguiti in locale prima del push. `.dev.vars` in `.gitignore`. |
| ARCH-03 | ✅ Fatto | **CSS vars breakpoint** — in `global.css` `:root`: `--bp-mobile: 480px`, `--bp-tablet: 768px`, `--bp-desktop: 1024px`, `--bp-wide: 1280px`. Documentati come riferimento (non usabili direttamente in `@media` queries CSS nativo). |

### Pre-lancio

| ID | Effort | Descrizione |
|----|--------|-------------|
| GR-03 | ✅ Fatto | **Google Search Console verifica** — meta tag `CHp0QtH-...` già in `BaseHead.astro`. Attivo su staging. |
| GR-01 | ✅ Fatto | **Cookie consent Iubenda** — script banner in `BaseHead.astro`: siteId `1433329`, cookiePolicyId IT `66379072`. Consenso condiziona GTM via `dataLayer` event `iubenda_consent_given`. ⚠️ **Azione manuale richiesta:** correggere `ownerName: "fedeeluce.it"` → `"ombreeluci.it"` sul pannello Iubenda prima del cutover DNS. |
| GR-02 | ✅ Fatto | **Google Tag Manager** — snippet `GTM-P92QKKXK` in `BaseHead.astro` (head) + noscript in `BaseLayout.astro` (body). Condizionato al consenso Iubenda. |
| V-02 | Redazione | **21 articoli "Da categorizzare"** — assegnazione manuale categoria in Directus. Sblocca US-15. |
| US-15 | M | **Rivalutazione ruoli editoriali** — ridefinire portanti/strutturali per ogni categoria dopo V-02. Sblocca homepage dinamica. |
| UX-01 | ✅ Fatto | **Mobile/tablet overhaul globale** — Completato 2026-04-04. Fix root cause: `body padding-left/right` su mobile causava header inset dal viewport e sfondi colorati con bande laterali. Rimosso. Ogni container gestisce il proprio padding. Aggiunti breakpoint 480px su: index.astro (diari 1col, hero, unisciti), blog/[...slug].astro (padding articolo ridotto a cascata, hero full-bleed, titolo scalato), categoria/[categoria].astro (titolo, immagini, evidenza-list). Footer: rimosso border-right su colonna identità a 1 colonna. |
| UX-05 | ✅ Fatto | **Mega-menu active state** — Completato 2026-04-04. `isActive(href)` helper in `Header.astro` (exact match per `/`, startsWith per tutti gli altri). `class:list` su tutti i link del megamenu (temi, sezioni, archivio) e su `header-link` Chi siamo. CSS `.mega-menu-link--active` e `.header-link--active`: colore accent + font-weight 600. |
| UX-02 | ✅ Fatto | **Mobile: rifinitura round 2** — Completato 2026-04-03. Analisi sistematica di tutte le pagine; modifiche mirate solo dove mancavano breakpoint. Pagine già OK senza intervento: `autori/index.astro` (600px copre mobile), `cerca.astro` (usa `.container` globale), `sostienici.astro` (cards già 1col), `archivio/index.astro` (già completo), `404.astro` (già completo). Interventi effettuati: `diari.astro` — aggiunti 768px e 480px (padding hub, margini sezioni); `autori/[slug].astro` — aggiunto 480px (author-name 1.5rem, header padding ridotto, articles-section margin ridotto); `chi-siamo/index.astro` — aggiunto 480px (sezioni compattate, h2 ridotto). Regola confermata: zero duplicazioni, zero stili custom per utility già coperte da `.container`. |
| US-08 | ✅ Fatto | **Info testata numero rivista** — Completato 2026-04-04. `IssueCard.astro` riformattato: titolo "Numero {N} – {titolo}", meta "Ott-Dic 2025 · Anno 42 · IV". `anno_rivista` calcolato a build-time (OEL: anno-1983; INS: anno-1977). `numero_in_anno` da `(n-1) % 4 + 1` → romano. `abbreviaPeriodo()` abbrevia nomi mese. `periodo_label` aggiunto a interfaccia TS e query `getAllNumeriRivista`. Per popolare `periodo_label` su tutti i numeri storici in Directus: vedi script da scrivere. |
| I18N-01 | L | **Sistema i18n globale** — piano ufficiale: [`docs/I18N_MASTER_PLAN.md`](docs/I18N_MASTER_PLAN.md). Esecuzione per fasi: F0 (categorie) → F1 (shell/switcher) → F2 (routing /en/) → batch traduzioni. |
| DA-06 | L | **Pipeline traduzione AI IT→EN** — ~3265 articoli target. ⛔ **BLOCCATA** fino a gate F0+F1+F2+approvazione §3 TRADUZIONI.md. Dettagli: [`TRADUZIONI.md`](TRADUZIONI.md). |
| DA-00 | ✅ Fatto | **Immagini inline corpo articoli** — 259 immagini su 144 articoli migrate su R2 (`corpo/`), src aggiornati in Directus. WordPress può essere spento senza rompere le immagini inline. |
| — | S | **Ruoli e permessi Directus** — profili redazione con accessi limitati ai soli campi necessari. |
| WP-01 | ✅ Fatto | **Proxy WordPress via CF Worker** — `/wp-admin/*`, `/wp-login.php`, ecc. proxati a Aruba IP `89.46.105.36`. La redazione può continuare a usare WP in produzione durante il periodo di staging. |
| ARCH-04 | ✅ Fatto | **Hybrid SSR + edge cache invalidation** — Completato 2026-04-03. Blog SSR on-demand, bundle 107KB, Cache-Control s-maxage=86400. Tutti i gate verdi. Merge su main `7bf69d0d`. Directus Flow webhook configurata e verificata 2026-04-04: salvataggio UI → purge CF entro secondi. |
| — | — | **Cutover DNS** `ombreeluci.it` → Cloudflare Pages. Step finale. Prerequisiti: tutti i pre-lancio completati + validazione staging ok. |

### ARCH-04 — Hybrid SSR + Directus webhook + CF edge cache

> **STATO ATTUALE (2026-04-03): ✅ COMPLETATO — merge su main, commit `7bf69d0d`.**
>
> **Storia tentativi:**
> - Tentativo 1 (2026-04-01): 404 ovunque — `env.ASSETS` non disponibile nel subrequest esterno
> - Tentativo 2 (2026-04-02, Cursor): 500 persistente — `DIRECTUS_URL` era IP privato irraggiungibile + bug `creds` in `getArticoliBySlugList`
> - Tentativo 3 (2026-04-03): smoke test locali verdi, staging `[object Object]` — `correlati.json` (749KB) bundlato nel worker → 908KB → CF Pages crasha silenziosamente
> - **Tentativo 4 (2026-04-03): ✅ SUCCESSO** — branch `feat/arch-04-ssr`, playbook rispettato, tutti i gate verdi
> - **Post-merge (2026-04-03): `[object Object]` ripresentato dopo merge su main** — bundle corretto (654KB dopo fix Header 423KB→200B), ma CF Pages aveva `nodejs_compat` in `compatibility_flags`. Il flag cambia il comportamento del polyfill `process` nel Workers runtime, corrompendo la serializzazione della Response di Astro. Rimosso via CF API + redeploy. ✅ Risolto.
>
> **Cause root risolte (in ordine):**
> 1. Import statico `correlati.json` (749KB) → bundle 908KB → CF Pages crash silenzioso → `[object Object]`. Fix: fetch runtime.
> 2. Import statico `numeri_wp_FINAL.json` in `Header.astro` (423KB) → bundle 654KB post-fix correlati → ancora sopra soglia sicura. Fix: `src/data/ultimo-numero.json` (~200B).
> 3. `nodejs_compat` in CF Pages `compatibility_flags` → `[object Object]` su tutti gli endpoint SSR indipendentemente dal bundle. Fix: rimosso il flag via PATCH API. **Regola: non attivare mai `nodejs_compat` su un progetto Pages con Astro hybrid SSR.**
>
> **Fix applicati:**
> - `DIRECTUS_URL` default → `https://cms.ombreeluci.it`
> - `getArticoliBySlugList`: parametro `creds?` aggiunto
> - `return new Response('Not found', {status:404})` — mai body `null` con CF adapter v11
> - `api/revalidate.ts`: guard `REVALIDATE_DRY_RUN=true`
> - `prebuild`: `cp src/data/correlati.json public/correlati.json` (sorgente unica)
> - `Header.astro`: sostituito import `numeri_wp_FINAL.json` (423KB) con `src/data/ultimo-numero.json` (~200B)
> - CF Pages `compatibility_flags`: rimosso `nodejs_compat` (via API)
>
> **✅ Directus Flow configurata e verificata (2026-04-04):** salvataggio articolo da UI → purge CF entro ~2-3 secondi.

**Obiettivo:** quando un redattore salva un articolo in Directus, il sito aggiornato è visibile entro ~5 secondi. Nessuna build da 10 minuti.

**Architettura:**

```
Redattore salva articolo in Directus
    │
    ▼
Directus Flow → POST https://ombreeluci.it/api/revalidate  { slug, secret }
    │
    ▼
Worker ombreeluci.it/* inoltra POST a PAGES_ORIGIN (Astro API route)
    │
    ▼
Astro: verifica secret, CF Cache Purge per https://ombreeluci.it/blog/{slug}/
    │
    ▼
Visitatori: blog/[...slug].astro SSR → Directus → Cache-Control edge
```

**Implementazione (riferimento, già in repo):**

- `astro.config.mjs` — `output: 'hybrid'` + adapter Cloudflare  
- `blog/[...slug].astro` — `prerender: false`, `getArticoloBySlug`, header cache  
- `src/lib/directus.ts` — fetch articolo / correlati mirati  
- `src/pages/api/revalidate.ts` — purge + prewarm (**env solo su CF Pages**)  
- `cf-worker` — route `ombreeluci.it/*`, WP→Aruba, redirect legacy, **`forwardToPages`** (no `fetch(request)` verso origin)  
- **Directus Flow** — POST a `https://ombreeluci.it/api/revalidate` con body JSON `{ "slug": "...", "secret": "..." }` allineato a `REVALIDATE_SECRET`

**Trade-off e limitazioni:**
- **Pagefind:** indicizza solo gli HTML **statici** emessi in `dist`. Con `blog/[...slug]` in SSR **non** esiste un file HTML per ogni articolo IT, quindi la ricerca copre centinaia di pagine (home, categorie, archivio, ecc.) ma **non** il corpus completo degli articoli finché resta hybrid così. Fix possibili: tornare a prerender articoli (build lunga, indice completo) o motore esterno (es. Algolia). Gli articoli comunque si aprono se l’SSR Directus è configurato.
- Pagefind si aggiorna al build — articolo nuovo: visibile subito sulla URL articolo dopo purge, in ricerca solo se la pagina è nel grafo indicizzabile o dopo strategia diversa.
- `getAllArticoli()` usato in home/categoria/autori resta statico (build) — le listing si aggiornano al build notturno, solo la pagina articolo singola è live
- Se si vuole anche listing live: aggiungere `prerender: false` + cache invalidation anche per `/categoria/*` e home (più complesso, post-lancio)
- Correlati in calce fallback per categoria rimosso in SSR (troppo costoso senza `allArticoli`): 3 articoli UMAP, nessun fallback categoria

**Architettura finale implementata (2026-04-01):**

```
Redattore salva articolo "published" in Directus
    │
    ▼
Directus Flow (action hook, items.update/create su articoli, condizione stato=published)
    │  POST {slug, secret} a https://ombreeluci.it/api/revalidate
    ▼
Astro API route src/pages/api/revalidate.ts (SSR, prerender:false)
    │  Legge REVALIDATE_SECRET, CF_ZONE_ID, CF_PURGE_TOKEN da CF Pages runtime env
    │  Verifica secret, chiama CF Cache Purge API per https://ombreeluci.it/blog/{slug}/
    │  Prewarm fire-and-forget
    ▼
Cloudflare invalida la cache per quell'URL
    │
    ▼
Prossimo visitatore: blog/[...slug].astro SSR on-demand → dati freschi da Directus
Cache-Control: s-maxage=86400, stale-while-revalidate=3600, stale-if-error=604800
```

**Layer di routing:**
- **Traffico `ombreeluci.it`:** Worker (`/*`) → WP proxy | redirect tab+data | `forwardToPages` → stesso codice che su `*.pages.dev` (middleware Astro incluso).
- **Traffico `ombreeluci-staging.pages.dev`:** diretto a Pages (nessun Worker davanti); middleware copre redirect legacy.

**File chiave:**
- `src/middleware.ts` — redirect per host Pages
- `src/data/redirects-legacy.json` — ~1001 slug (allineato alla logica Worker)
- `src/pages/api/revalidate.ts` — purge (env runtime CF Pages)
- `src/pages/blog/[...slug].astro` — SSR on-demand
- `cf-worker/wrangler.toml` — `ombreeluci.it/*`, `[vars] PAGES_ORIGIN`
- `cf-worker/redirect-worker.js` — WP, `REDIRECTS`, regex date, `forwardToPages`

---

## Checklist staging (operativa)

| Step | Azione | Stato |
|------|--------|--------|
| 1 | `git push origin main` → attendi deploy **CF Pages** (`ombreeluci-staging`) verde | automatico su push |
| 2 | `cd cf-worker && npx wrangler deploy` dopo ogni cambio Worker | manuale |
| 3 | CF Pages → **Environment variables** (production): `DIRECTUS_URL` (es. `https://cms.ombreeluci.it`), `DIRECTUS_TOKEN`, `REVALIDATE_*`, `CF_*`. **Critico:** devono esistere sia per **build** che per **runtime** (l’SSR articolo legge `locals.runtime.env`; default URL in codice punta al CMS pubblico). |
| 4 | Directus Flow attivo su publish articolo → POST `/api/revalidate` | vedi flow ID sotto |
| 5 | Smoke test | `https://ombreeluci-staging.pages.dev` homepage + articolo; se usi apex: `https://ombreeluci.it` dopo step 2 |

---

**Directus Flow configurato (via API 2026-04-01):**
- Flow ID: `a6c7417d-9996-413f-a7db-334c73c9982a`
- Trigger: `action` (non filter — altrimenti blocca il save), scope `items.update`+`items.create`, collection `articoli`
- Operations: condizione `stato=published` → read article slug → POST revalidate

**CF Pages env vars (runtime, impostate via API):**
- `REVALIDATE_SECRET` — secret condiviso (tipo: secret_text)
- `CF_ZONE_ID` — `0cc4507d662828548b5f9f90e4b2d494` (tipo: plain_text)
- `CF_PURGE_TOKEN` — API token CF con permesso Cache Purge (tipo: secret_text)

**Nota su scalabilità redirect (Free plan):**
- 1.001 redirect statici in JSON nel middleware (~50KB) sono corretti alla scala attuale (<0.1ms cold start)
- Se si supera ~50.000 voci o si passa a piano Pro: migrare a CF Bulk Redirects (max 20 liste × 1000 voci su Pro)
- La regex date-based resta sempre nel middleware (1 riga, zero overhead)

**Storia completa — errori, cause e lezioni:**

1. **Primo tentativo (fallito, 2026-04-01):** `output: hybrid` + CF adapter, Worker con route `ombreeluci.it/*` + `fetch(request)` pass-through. Risultato: **404 ovunque**. Causa: `env.ASSETS` non disponibile nel subrequest esterno.

2. **Service binding (tentato, non disponibile):** `[[services]] binding="PAGES" service="ombreeluci-staging"`. CF errore 10143: service binding funzionano solo tra Worker scripts, non verso Pages projects.

3. **Errore metodologico critico:** rimosso il route `ombreeluci.it/*` dal Worker credendo di "eliminare il conflitto". Risultato: **sito mostrava WordPress** perché il DNS punta ancora ad Aruba — il Worker con `/*` era l'unico ponte verso Pages. Lezione: **non toccare routing senza mappare prima la catena DNS → Worker → origine.**

4. **Secondo tentativo (Cursor, 2026-04-02):** Worker ripristinato con `forwardToPages` verso `PAGES_ORIGIN = https://ombreeluci-staging.pages.dev`. Articoli: prima 302 (Directus non raggiunto), poi 500 (errore rendering). Cause identificate: `DIRECTUS_URL` baked con IP VPS privato (`http://159.69.196.64:8055`) irraggiungibile dall'edge; `getArticoloBySlug` non passava `creds` a `directusFetch` (bug di omissione). Entrambi fixati ma il 500 persisteva.

5. **Revert a output:static (2026-04-02):** con 500 persistente e causa non identificata prima di deployare in produzione, ripristino sicuro. Commit `30a75ecd`. Il 500 a runtime su CF Pages va debuggato **localmente** con `wrangler pages dev` prima di qualsiasi push.

**Codice SSR già pronto in repo (da riattivare):**
- `src/lib/directus.ts`: `directusCredsFromAstroLocals()`, `getArticoloBySlug(slug, creds)`, `getArticoliBySlugList(slugs, creds)`
- `src/pages/api/revalidate.ts`: endpoint purge (secrets da runtime CF Pages)
- `src/middleware.ts` + `src/data/redirects-legacy.json`: redirect legacy (~1001 slug + regex date WP)
- `cf-worker/redirect-worker.js`: `forwardToPages()` verso `PAGES_ORIGIN`
- Directus Flow configurato: ID `a6c7417d-9996-413f-a7db-334c73c9982a`
- CF Pages env vars: `DIRECTUS_URL=https://cms.ombreeluci.it`, `DIRECTUS_TOKEN`, `REVALIDATE_SECRET`, `CF_ZONE_ID`, `CF_PURGE_TOKEN`

**Per riattivare — protocollo obbligatorio (vedi ARCH-05 nel backlog):**

```
1. Configura ambiente locale:
   - npm install (già fatto)
   - cp .env .env.local  (DIRECTUS_URL=https://cms.ombreeluci.it, DIRECTUS_TOKEN=...)
   - npx astro dev  →  verifica articolo su http://localhost:4321/blog/amici-di-simone/

2. Riabilita SSR:
   - astro.config.mjs: output: 'hybrid' + adapter cloudflare
   - blog/[...slug].astro: export const prerender = false
   - Verifica build locale: npm run build (deve completare, 0 errori)

3. Test edge locale con wrangler pages dev:
   npx wrangler pages dev ./dist --port 8788
   curl http://localhost:8788/blog/amici-di-simone/  → deve essere 200 con HTML articolo
   (questo simula il runtime CF Pages con env.ASSETS e locals.runtime.env)

4. Solo se step 3 è 200: git push → attendi build Pages → smoke test staging → deploy Worker
```

**Baseline da verificare prima di ogni push (formula Cursor):**
```
Baseline: ombreeluci-staging.pages.dev/blog/amici-di-simone/ = 200
Cambio: output hybrid + SSR
Verifica: curl staging/blog/amici-di-simone/ = 200 con HTML articolo (non 302/404/500)
```

---

## Backlog — Post-lancio

### UX/UI

> Legenda: 🔴 Alta · 🟡 Media · 🟢 Bassa — S < 2h · M 2-8h · L 1-3gg

| ID | Gravità | Effort | Descrizione |
|----|---------|--------|-------------|
| UX-07 | 🟡 | M | **Articolo su mobile** — padding laterale 0, tipografia non fluida, capolettera spezza layout su 390px. Audit completo `blog/[...slug].astro`. |
| UX-08 | 🟡 | M | **Categoria su mobile** — layout a due colonne non ottimizzato per touch. |
| UX-09 | 🟡 | S | **Foto autore: 404 silenziose** — mostrare avatar SVG placeholder se `foto` assente, rimuovere fallback a path locale. |
| UX-10 | 🟡 | S | **Selettore lingua** — nascondere o disabilitare (con tooltip) se non esiste traduzione dell'articolo. |
| UX-11 | 🟡 | M | **Diari home su mobile** — 6 card in 2 colonne affollate. Passare a layout orizzontale (foto 64px + testo) o scroll con snap. |
| UX-12 | 🟡 | M | **IssueCard su mobile** — griglia archivio sotto 480px: passare a 2 colonne fisse. |
| UX-13 | 🟡 | S | **Testimonianze home su tablet** — layout 1fr-2fr-1fr non ha breakpoint 768-1024px. |
| UX-14 | 🟢 | M | **Tipografia serif/sans** — regola esplicita mancante: serif solo per contenuto narrativo, sans per UI/navigazione. |
| UX-15 | 🟢 | S | **Box "Ultimo numero" home su mobile** — stack verticale (testo sopra, copertina sotto max 240px). |
| UX-16 | 🟢 | S | **ArticleCard horizontal su mobile** — immagine 140px troppo piccola; layout verticale sotto 480px. |
| UX-17 | 🟢 | S | **Foto autore su mobile** — ridurre da 200px a 120-140px su mobile. |
| UX-18 | 🟢 | S | **Breadcrumb** — valutare riattivazione con design sobrio + `BreadcrumbList` JSON-LD. |
| UX-19 | 🟢 | M | **Pagine test/debug** — `test-lista`, `test-minimal`, `debug/audit-editoriale` pubblicamente accessibili. Rimuovere o proteggere pre-lancio. |
| UX-20 | 🟢 | S | **Reading time** — nascondere su articoli brevi (<300 parole) o storici (ante 2000). |
| UX-21 | 🟢 | S | **Stile sezione commenti** — `Commenti.astro`: revisione tipografia, spaziatura, form e lista commenti approvati. Coerenza con il design system del sito. |

### Data / AI

| ID | Stato | Descrizione |
|----|-------|-------------|
| DA-00 | ✅ Fatto | **Immagini inline corpo articoli** — 259 immagini su 144 articoli migrate su R2 (`corpo/`), src aggiornati in Directus. figcaption inline stilizzata come didascalia copertina. |
| DA-01 | ✅ Fatto | **Alt text AI copertine** — 2972/2972 immagini processate da Claude Haiku, 76 malformati puliti, backfill su Directus completato (2972 ok, 0 err). Campo `description` popolato su tutti i file. |
| DA-02 | Post-lancio | **16 evidenziazioni non reinserite** — 11 articoli con ancora ambigua da inserire a mano in Directus: `un-panorama-riscoprire`, `mary-mount-settimane-al-sole`, `faccio-io`, `eucaristia-e-cresima-di-giacomo`, `lo-sconforto-emotivo-esige-comprensione`, `il-chicco`, `stai-pensando-me`, `gli-altri-siamo-noi`, `intervista-ad-andrea-romeo`, `genitori-e-medici-davanti-allannuncio-dellhandicap`, `salvatore-medico-pediatra-acondroplasico`. |
| DA-03 | Post-lancio | **Upgrade VPS CX23 → CX32** — prerequisito per embedding pgvector. |
| DA-04 | Post-lancio | **Ricerca semantica + correlati pgvector** — after DA-03 + cutover DNS. |
| DA-05 | Post-lancio | **Archive.org link** — 37 numeri (OEL 1-15, 34, 40, 131-172) senza `pdf_archive_url`. Scraping profilo archive.org + PATCH Directus. |
| DA-06 | Post-lancio | **Traduzione AI articoli** — rollout progressivo EN poi ES/altre lingue, subordinato a stabilizzazione i18n shell/routing/redirect/SEO. Documento guida unico: [`docs/I18N_MASTER_PLAN.md`](docs/I18N_MASTER_PLAN.md). |
| TAG-01 | 🟡 Post-lancio | **Tag non visibili nelle pagine articolo** — i tag associati agli articoli in Directus non sono mostrati nel frontend (`blog/[...slug].astro`). Nessun link né badge tag visibile al lettore. Impedisce il filtraggio editoriale via tag (es. `trans-ai`, `haiku`, `sonnet`). |
| TAG-02 | 🟡 Post-lancio | **Pagina `/tag/[slug]`** — non esiste una route per listare gli articoli per tag. Esempio: `/tag/trans-ai` → tutti gli articoli tradotti da AI. Route statica `src/pages/tag/[slug].astro` + `getArticoliByTag()` in `directus.ts`. Necessaria per filtraggio editoriale, navigazione alternativa e SEO. |

### Performance / Core Web Vitals

> Rilevazioni da PageSpeed Insights su `/blog/suor-veronica-pompei/` (2026-03-31).

| ID | Gravità | Effort | Descrizione |
|----|---------|--------|-------------|
| PF-01 | 🔴 Alta | S | **Placeholder copertina troppo pesante** — `/placeholder/ph-1.jpg` è 4864×3648 px, 4.2 MB. Mostrata a 81×54 px. Risparmio stimato 4.2 MB. Fix: ridimensionare a 400px lato lungo e convertire in WebP/AVIF. |
| PF-02 | 🔴 Alta | S | **Cache-Control assente su R2** — le immagini `r2.dev/copertine/*` e `r2.dev/corpo/*` rispondono con TTL `None`. Risparmio stimato 366 KiB per visita ripetuta. Fix: aggiungere `Cache-Control: public, max-age=31536000, immutable` tramite Cloudflare Transform Rule sul dominio R2, oppure esporre le immagini via custom domain con Cache Rule dedicata. |
| PF-03 | 🟡 Media | M | **Immagini non responsive (srcset mancante)** — copertine servite full-size (es. 1370×771 px) per slot da 268×151 px. Risparmio stimato 208 KiB per copertina. Fix: usare Cloudflare Image Resizing (`?width=`, `?format=webp`) oppure generare `srcset` a build-time con dimensioni 320/640/1024. Impatta `ArticleCard`, hero copertina e `LeggiAnche`. |
| PF-04 | 🟡 Media | S | **CSS render-blocking** — `_slug_.css` (4.5 KiB, 150 ms) e `_diario_.css` (4.4 KiB, 460 ms) bloccano il rendering iniziale per ~610 ms totali. Risparmio stimato 1040 ms LCP. Fix: aggiungere `<link rel="preload" as="style">` per questi file, oppure estrarre il CSS critico e iniettarlo inline nel `<head>`. |
| PF-05 | 🟡 Media | S | **Immagini senza `width`/`height` espliciti** — causa CLS (layout shift) prima del caricamento. Fix: aggiungere `width` e `height` su tutti i tag `<img>` con dimensioni note (copertine, autori, icone). |
| PF-06 | 🟢 Bassa | S | **Icona fotocamera da WordPress** — `icon-camera.png` (124×124 px, 4.5 KB) servita da `ombreeluci.it/wp-content/` e mostrata a 16×16 px. Fix: sostituire con SVG inline (~200 byte, nessuna richiesta HTTP). |
| PF-07 | 🟢 Bassa | S | **Nessun hint preconnect per R2** — il browser scopre l'origine R2 solo al parsing HTML. Fix: aggiungere `<link rel="preconnect" href="https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev">` nel `<head>` di Layout.astro. |
| PF-08 | 🟢 Bassa | S | **Gerarchia heading non sequenziale** — PageSpeed segnala salti di livello (es. h1→h3 senza h2). Fix: audit heading in `blog/[...slug].astro` e componenti correlati. |
| PF-09 | 🟢 Bassa | S | **Contrasto insufficiente** — alcuni testi non superano il rapporto WCAG AA. Fix: audit con DevTools → Accessibility, aggiustare colori `--text-secondary` o varianti. |

### Crescita / Monetizzazione

| ID | Stato | Descrizione |
|----|-------|-------------|
| GR-01 | Pre-lancio | **Cookie consent Iubenda** — script banner da integrare in `Layout.astro`. Prerequisito per GA e AdSense. Credenziali WP: siteId `1433329`, cookiePolicyId IT `66379072`, EN `53976128`. ⚠️ Config WP ha `ownerName: "fedeeluce.it"` — da correggere in `ombreeluci.it` sul pannello Iubenda. Link policy già nel footer. |
| GR-02 | Pre-lancio | **Google Tag Manager + Analytics** — GTM container `GTM-P92QKKXK` (già attivo su WP). Inserire snippet GTM in `Layout.astro` (head + noscript body). GTM gestisce GA4, AdSense e Twitter pixel `o5eld` senza ulteriori script separati. Condizionare al consenso Iubenda (GR-01). |
| GR-03 | Pre-lancio | **Google Search Console — verifica dominio** — meta tag verifica `CHp0QtH-sw0M_ZYVjj6LRqHxV-4Z72IoYR_aiX9c6ZE` da aggiungere in `Layout.astro` prima del cutover DNS, altrimenti si perde l'accesso a GSC. |
| GR-04 | Post-lancio | **Google AdSense** — publisher ID `ca-pub-2238371130141396`. Da gestire via GTM dopo GR-01+GR-02. Valutare posizionamento non invasivo (dopo corpo articolo), compatibilità con missione editoriale. |
| GR-05 | Post-lancio | **Newsletter Mailchimp — form inline** — popup/form da reimplementare senza Dojo (obsoleto). Credenziali: uuid `00c5dad63480d9601563b5692`, lid `efd099264d`. Usare API Mailchimp embedded form o widget moderno. |
| UX-06 | Post-lancio | **Transizioni sezioni sito** — effetti di entrata/uscita tra sezioni (scroll-reveal, fade-in, ecc.) da applicare in modo coerente su tutto il sito. Da progettare come sistema unico (utility class + IntersectionObserver o Astro transitions) non pagina per pagina. |
| GR-07 | Post-lancio | **Pagina `/newsletter`** — pagina dedicata all'iscrizione newsletter, analoga a `ombreeluci.it/newsletter/` sul sito WP attuale. Deve contenere: presentazione breve della newsletter, form iscrizione Mailchimp (vedi GR-05 per credenziali), eventuale archivio delle ultime newsletter o anteprima. Route statica `src/pages/newsletter.astro`. |
| GR-06 | Post-lancio | **CTA dinamiche e misurate** — CTA a fine articolo che ruotino tra proposte (abbonamento, donazione, newsletter, acquisto numero). Non ripetitive, contestuali al tema, monitorate via GA4 eventi custom. |

---

## Storico completamenti

### 2026-04-02

- **Revert ARCH-04 a output:static** — ARCH-04 SSR ha prodotto 500 persistente su CF Pages edge dopo multipli tentativi e fix. Causa finale non identificata prima di poter deployare sicuro. Decisione: ripristino `output:static` + `blog/[...slug].astro` statico (commit `30a75ecd`). Sito stabile. ARCH-04 sospeso fino a test locale con `wrangler pages dev`. Tutti i fix intermedi (credenziali runtime, `getArticoloBySlug` con creds, DIRECTUS_URL corretto) restano in repo in `src/lib/directus.ts` — non vanno persi.
- **Fix `getArticoloBySlug`** — non passava `creds` a `directusFetch` (omissione, commit `f26608a6`). Corretto ma non sufficiente a risolvere il 500.
- **DIRECTUS_URL in CF Pages** — aggiornato da `http://159.69.196.64:8055` (IP VPS, irraggiungibile da edge CF) a `https://cms.ombreeluci.it` (tunnel cloudflared, raggiungibile). Fix necessario e permanente.
- **Errore metodologico documentato** — rimozione route `/*` dal Worker senza mappare la catena DNS prima → sito su `ombreeluci.it` mostrava WordPress. Regole operative aggiunte da Cursor (commit `292d6cf8`): mai toccare routing senza baseline documentata + smoke test immediato.
- **Favicon** — `BaseHead.astro` semplificato a solo `favicon.svg` (png/ico assenti in `public/` generavano 404 silenziose).
- **Fix layout `cerca.astro` e `blog/en.astro`** — tag `</body></html>` spurii residui dalla batch migration a BaseLayout rimossi.

### 2026-04-01

- **ARCH-04 Hybrid SSR + edge cache invalidation** — Redirect legacy in Worker + `src/middleware.ts` (staging diretto), endpoint `/api/revalidate` in Astro (secrets CF Pages). Directus Flow (`a6c7417d`). `blog/[...slug].astro` SSR + Cache-Control. Tentativo intermedio: Worker solo route WP (4 pattern) — **insufficiente se DNS punta ancora ad Aruba**; corretto il 2026-04-02. Fix `cerca.astro` e `blog/en.astro` (tag chiusura duplicati).
- **Refactor architetturale ARCH-01/02/03** — Introdotti `BaseHead.astro` e `BaseLayout.astro`. Tutte le 22 pagine del sito migrate al layout centralizzato. Eliminato boilerplate `<head>` duplicato in ogni pagina. OG tags, Twitter Card, canonical, GSC meta tag, preconnect R2 ora su tutte le pagine in un unico punto. CSS breakpoint vars documentate in `global.css`. Build: 4129 pagine, 0 errori.
- **Proxy WordPress CF Worker** — `cf-worker/redirect-worker.js` aggiornato con proxy trasparente verso Aruba IP `89.46.105.36` per route `/wp-admin/*`, `/wp-login.php`, `/wp-content/*`, `/wp-includes/*`, `/wp-json/*`, `/feed/*`, `/xmlrpc.php`. Deployato. Redazione può continuare a usare WordPress in produzione.
- **Backlog performance (PF-01→PF-09)** — Documentati in PROGRESS.md da analisi PageSpeed Insights.
- **Identificati asset WordPress da portare** — GTM `GTM-P92QKKXK`, AdSense `ca-pub-2238371130141396`, GSC `CHp0QtH-sw0M_ZYVjj6LRqHxV-4Z72IoYR_aiX9c6ZE`, Iubenda siteId `1433329`, Mailchimp uuid `00c5dad63480d9601563b5692`. Documentati in voci GR-01→GR-05.

### 2026-03-31

- **Homepage redesign v2** — 5 sezioni: Hero (pool 18 mesi, rotazione JS random), Da vicino (diari + testimonianze), Esplora (8 categorie), La rivista (ultimo numero + carousel), Unisciti (CTA + newsletter).
- **Correlati semantici UMAP** — `src/data/correlati.json` (3487 articoli × 5 vicini) via distanza euclidea su coordinate UMAP 3D precomputate. Zero query runtime.
- **"Leggi anche" build-time** — `LeggiAnche.astro` inserito staticamente dopo il 3° `</p>`. Primo vicino UMAP stessa lingua, senza loop A→B→A. CSS isolato da `.article-content :global()`.
- **Didascalie copertina Step 1** — 2004 articoli con `didascalia_copertina` da caption WP (strip HTML, encoding). Visibile sotto la foto con icona fotocamera.
- **Alt text AI Step 2** — job Claude Haiku in background su 2973 immagini (5 req/min).
- **Sottotitolo fallback SEO** — articoli senza sottotitolo mostrano `seo_description`.
- **Embed YouTube/Instagram build-time** — URL grezzi → `<iframe>` responsive. Instagram embed.js caricato solo se necessario.
- **Backfill `div.evidenziazione`** — 570/586 pull quote reinserite (97%) su 376 articoli.
- **Sommario numeri rivista** — 71/204 numeri con testo narrativo estratto da WP.
- **Placeholder copertina** — 4 immagini in `public/placeholder/`, selezione pseudo-random via hash slug.
- **UX: badge ruoli rimossi** dai lettori, hover state ArticleCard, badge categoria semplificato, ricerca mobile con overlay.
- **CSS** — rimosso underline da `a:hover` in `global.css`.

### 2026-03-30

- **DNS Aruba → Cloudflare** — nameserver aggiornati, propagazione completata.
- **Cloudflare Tunnel `cms.ombreeluci.it`** — cloudflared su VPS, tunnel `cms-oel`, systemd service. HTTPS senza esporre porte.
- **Tassonomia editoriale** — 16 temi Megacluster → 13 categorie. 21 articoli "Da categorizzare".
- **Fix UI Directus** — 32 campi `articoli` riorganizzati, interfacce corrette, dropdown.
- **Serie "Dialogo aperto"** — 156 articoli collegati, pagina `/sezioni/dialogo-aperto`, link megamenu.
- **CF Worker redirect overflow** — 15582 redirect date-based + 1001 slug arbitrari.

### 2026-03-23

- **44 numeri rivista normalizzati** — `tipo=extra` → `oel`, `id_numero` slug → `OEL-N`.
- **572 articoli backfill numero_rivista** — 2217 totali rimappati.
- **IssueNavPill** — sort per anno+numero, navigazione tastiera ←→.
- **Social sticky scroll** — si ferma sopra footer.
- **Box revisione editoriale** — GET Apps Script, ViewTransitions, solo modalità redazione.
- **Modalità redazione** — `?redazione=1` via localStorage.
- **Capolettera CSS** — responsive 8rem→3.5rem (breakpoint 1024/768/480px).

### 2026-03-22

- Import completo: 3527 articoli, 352 autori, 204 numeri, 285 temi, 816 tag, M2M 9440 relazioni.
- Corpus HTML rigenerato da dump SQL e reimportato (3487/3487).
- Foto autori (88/88) e copertine numeri (204/204) migrate su R2.
- Ricerca Pagefind attiva (4134 pagine, 25 risultati, immagini).
- Fix lingua articoli: 111 corretti, hreflang implementato.
- Redirect SEO: 2000 statici + Worker overflow.
