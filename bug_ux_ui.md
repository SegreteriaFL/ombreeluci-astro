<!--
BUG / UX / UI — Ombre e Luci

Come usare questo file:
Questo file è la lista di lavoro per bug visivi e miglioramenti UX/UI.
Quando non ci sono task urgenti, o quando esplicitamente richiesto,
Claude Code attacca i bug in ordine dall'alto verso il basso.
Ogni bug completato: sostituire [ ] con [x] e aggiungere il commit hash.
Priorità implicita: i bug senza sezione sono bloccanti o cross-cutting.
I bug per sezione (home, archivio, ecc.) sono localizzati e indipendenti tra loro.
La redazione può togliere la x se il fix non risolve possibilmente commentando e motivando il rifiuto il bug e Claude deve ritornarci sopra
-->
------

## Segnalazioni 2026-08-11

### FATTO — Secondo tema (`categoria_menu_2`) mancante nel badge degli articoli "pubblicati online"
**Desiderata:** un articolo con `categoria_menu` e `categoria_menu_2` entrambi valorizzati mostrava un solo tema nel badge sopra il titolo.

**Causa:** il badge ha due varianti: articoli con numero rivista assegnato (`<nav class="article-category-badge">`) e articoli "pubblicati online" senza numero (`<div class="article-category-badge--online">`). TEMA-02 (`7dab7419`, 2026-05-08) aveva aggiunto `categoryDisplay2`/`categoryLink2` solo alla prima variante — la seconda non è mai stata toccata, per una dimenticanza nel commit originale (confermato dal diff: si ferma subito prima del ramo `else`). Nessuna decisione editoriale dietro, verificato in `CLAUDE.md`/`STATO.md`: la spec TEMA-02 descrive il comportamento in modo generico ("il badge mostra max 2 link"), senza distinguere le due varianti.

**Intervento:** aggiunto lo stesso blocco `categoryDisplay2`/`categoryLink2` (separatore ` · `) anche al ramo `--online`, identico pattern già usato nell'altro ramo. File: `src/pages/it/[slug].astro`, `src/pages/en/[slug].astro`.

**DOPO:** verificato live su staging post-deploy (`3d539aff`), 3 casi reali via query Directus:
- IT web-only, 2 temi (`il-mio-ritiro-spirituale-a-morlupo`) → badge mostra "Fede e Luce · Tempo libero" con entrambi i link.
- EN web-only, 2 temi (`august-a-holiday-i-dont-know`) → badge mostra "Leisure · Family" con entrambi i link.
- IT con numero rivista, 2 temi (`ascoltare-i-segni-perche-in-lis`, OEL-142) → nessuna regressione, comportamento invariato.

## Segnalazioni 2026-08-07

### FATTO — Didascalia foto non si aggiornava mai (articolo "Esperienze, i campi dell'estate 1977")
**Desiderata:** correggere la didascalia della foto copertina — nome sbagliato "Manuela" invece di "Nanda", refuso "paseggiata" invece di "passeggiata". Segnalato dalla redazione come bug di salvataggio: modificavano il campo, chiudevano e riaprivano il CMS, il valore non restava e online non cambiava mai — comportamento diverso dal solito, dove le modifiche si vedono subito.

**PRIMA:** la redazione modificava `didascalia_copertina` sull'articolo dal form. Il salvataggio **funzionava correttamente** (verificato nello storico revisioni Directus: 3 tentativi salvati regolarmente il 7/8 alle 14:38, 14:41, 14:46), ma il sito continuava a mostrare il testo vecchio sia in IT che in EN.

**Causa reale (non era un bug di salvataggio):** la didascalia mostrata in pagina non legge `articolo.didascalia_copertina` — legge prima da una collection separata `didascalie_img`, indicizzata per **file immagine + lingua**, e usa quel valore se presente (fallback su `didascalia_copertina` solo se vuoto — vedi `getDidascaliaImg()` in `src/lib/directus.ts:1019`). Questa foto ha un record in `didascalie_img` (usata per didascalie condivise su foto d'archivio riutilizzate su più articoli) ancora con il testo sbagliato — invisibile e non modificabile dal form articolo. Qualunque modifica a `didascalia_copertina` sull'articolo era quindi ininfluente per questa foto specifica, a prescindere da quante volte veniva risalvata.

**Intervento:** corretti direttamente i due record in `didascalie_img` (id 1392 IT, id 3462 EN — anche l'EN aveva "Manuela"): "Robert, Nanda e Guenda durante una passeggiata ad Alfedena, 1977 (archivio Ombre e Luci)" / equivalente EN.

**DOPO:** verificato live su entrambe le pagine (`/it/esperienze-i-campi-dellestate-1977/` e `/en/summer-1977-experiences-and-camps/`) — testo corretto in entrambe le lingue, nessun rebuild necessario (pagina SSR, dato letto in tempo reale da Directus).

**⚠️ Problema sistemico non risolto:** questo può ripresentarsi su qualunque altro articolo la cui foto abbia un record in `didascalie_img` — dal form articolo non c'è alcun indizio che la didascalia visibile sul sito venga da un'altra tabella. Da valutare: esporre/collegare `didascalie_img` nel form articolo, o eliminare la doppia fonte se non è più necessaria (capire prima quanti articoli condividono davvero la stessa foto/didascalia — se sono pochi, l'architettura "condivisa" potrebbe non giustificarsi più).

## Segnalazioni 2026-08-04 (parte 2 — pulizia form articolo)

### FATTO — Campi tecnici nascosti dal form articolo
**Desiderata:** dopo aver introdotto il pulsante "Avvia/aggiorna traduzione", i vecchi campi JSON Export/Traduzione restavano visibili e confondevano; segnalato anche il campo "Embedding" (array di migliaia di numeri) sempre visibile in cima al form, senza alcun senso per la redazione.

**PRIMA:** `json_export`/`json_traduzione` visibili con nota che rimandava al vecchio processo manuale ("Esporta per traduzione"). `embedding` (vettore 3072 dimensioni per il calcolo dei correlati) **non aveva nessuna configurazione Directus** (`meta: null`) — per questo si vedeva l'array grezzo in cima al form, fuori da ogni gruppo.

**Intervento:** `json_export`/`json_traduzione` → `hidden: true` + etichetta "⚠️ OBSOLETO — NON USARE" + nota aggiornata. `embedding` → creata configurazione da zero (non esisteva) con `hidden: true`, `readonly: true`, nota esplicativa. Sweep di controllo su tutti gli altri campi tecnici storici (`umap_x/y/z`, `cluster_id`, `wp_id`, `original_url`, `tema_label`) — già tutti correttamente nascosti da pulizie precedenti, nessun altro orfano trovato.

**DOPO:** verificato via API (`hidden: true` su tutti) e confermato visivamente dall'utente su più articoli diversi.

**⚠️ Nota non risolta — mistero di propagazione:** durante questa modifica, il cambiamento non si è visto per un tempo anomalo anche con test che avrebbero dovuto escluderlo con certezza: browser diverso mai usato prima (Edge "vergine"), cache HTTP disattivata da DevTools, cache interna di Directus svuotata via `/utils/cache/clear`. In ogni test il server, interrogato direttamente e nello stesso momento, restituiva già il dato corretto — eppure l'app admin per un periodo non l'ha mostrato, poi si è sistemato da solo senza un'azione risolutiva chiaramente identificabile. **Non abbiamo una spiegazione definitiva.** Ipotesi più plausibile ma non verificata: storage persistente lato client (IndexedDB/localStorage) usato dalla SPA di Directus per la cache dello schema, non toccato da nessuno dei rimedi provati. Se ricapita, provare da subito: DevTools → Applicazione → Archiviazione → "Cancella dati sito" (non solo Service Worker) prima di altri tentativi. Ulteriore argomento a favore della valutazione Directus↔Sanity già aperta in `MIGRAZIONE-SANITY-BOZZA.md`.

## Segnalazioni 2026-08-04

### FATTO — Fase 3 roadmap: traduzione automatica IT→EN
**Desiderata:** eliminare il giro manuale export→traduci esternamente→incolla→spera che il JSON sia valido (causa del bug De Paolis di oggi), automatizzando del tutto la creazione della versione EN. Piano già scritto in `docs/ROADMAP-AUTOMAZIONE.md` Fase 3 (mai implementata), trovato su richiesta esplicita di cercare prima di ricostruire da zero.

**PRIMA:** nessuna traduzione automatica del contenuto testuale. Ogni articolo IT pubblicato restava senza EN finché qualcuno non avviava a mano il giro export/traduci/incolla/importa — fragile, come visto oggi con De Paolis.

**Intervento:**
- Nuovo endpoint `src/pages/api/translate.ts` — Claude **Sonnet 5**, output strutturato via JSON Schema nativo (non testo libero da parsare — il costo Sonnet vs Haiku è ~1,5 vs ~0,8 centesimi/articolo, irrilevante, quindi si è scelta la qualità). Crea l'EN **solo se `articolo_traduzione` non è già valorizzato** — non tocca mai una traduzione esistente.
- Nuova Flow Directus "Traduzione automatica EN" (`1e022c88`) — `accountability: activity` fin dalla creazione (non "all"), nessuna condition fragile nel grafo Flow (il filtro lo fa l'endpoint), URL di produzione `ombreeluci.it` non `pages.dev` diretto. Tutte le lezioni della sessione applicate da subito, non aggiunte dopo un incidente.
- Fix a margine: `/en/category/ombre-e-luci/` tornava 404 nonostante il fix di ieri — era propagazione dell'edge Cloudflare a livello di routing (non contenuto), risolto da solo entro un minuto dal deploy. Non un bug del codice.

**DOPO — verificato end-to-end con articolo di test reale (creato e poi eliminato):**
- Bozza IT → pubblicazione → EN creato automaticamente in pochi secondi: titolo, sottotitolo, corpo HTML (struttura preservata), categoria/autore/forma copiati correttamente, slug pulito, link bidirezionale `articolo_traduzione` su entrambi i lati. Verificato live (200 su entrambe le pagine).
- Secondo update sull'IT con EN già esistente → **EN non toccato**, verificato leggendo il campo dopo l'update.
- **Scoperta collaterale durante il cleanup:** eliminare un articolo con `articolo_traduzione` collegato fallisce con errore vincolo FK (`articoli_articolo_traduzione_foreign`) finché non si azzera il campo su **entrambi** i lati prima del delete. Utile saperlo per qualunque eliminazione futura di coppie di articoli tradotti.
- **Non implementato (deciso esplicitamente, non dimenticato):** ri-traduzione automatica quando l'IT viene modificato dopo che l'EN esiste già — rischio di sovrascrivere correzioni manuali della redazione. Resta un giro manuale per quel caso.

## Segnalazioni 2026-07-28

### RISOLTO — /en/category/ombre-e-luci/ 404 invece del redirect
**Desiderata:** "sistema tutto quello che c'è da sistemare... e che puoi sistemare facilmente."

**PRIMA:** `astro.config.mjs` aveva un redirect statico `/en/category/ombre-e-luci/` → `/it/categoria/ombre-e-luci/`, ma la route dinamica `src/pages/en/category/[slug].astro` intercettava il path prima (stesso pattern letterale), e il suo fallback per categorie senza articoli EN reindirizzava genericamente a `/en/` — comportamento osservato in produzione: 404 secco (non ancora chiarito il motivo esatto del 404 invece del 302 atteso a `/en/`, ma irrilevante: il redirect statico non veniva comunque mai raggiunto).

**Intervento:** `src/pages/en/category/[slug].astro` — il fallback per categorie EN senza articoli ora reindirizza a `/it/categoria/${itSlug}/` invece che genericamente a `/en/` (fix generale, vale per qualsiasi categoria futura senza articoli EN, non solo `ombre-e-luci`). Rimossi da `astro.config.mjs` i 2 redirect statici specifici per `ombre-e-luci`, ora ridondanti e mai comunque raggiunti.

**DOPO:** build locale pulita (`npm run build`, nessun errore/warning). **Non ancora deployato** — serve commit + push su main per il deploy automatico CF Pages. In attesa di conferma.

### VERIFICATO/FIXATO — Altri due webhook Directus con lo stesso pattern di fallimento silenzioso
Seguendo il sospetto lasciato aperto ieri ("probabilmente ha bloccato anche altri webhook").

- **Sync metadati IT→EN** (`bb1e90af`): aveva una condizione `check_it` (`$trigger.payload.lang _null:true`) che bloccava l'esecuzione per qualunque update parziale che non tocca il campo `lang` — cioè quasi ogni edit reale della redazione. L'endpoint (`sync-metadata.ts`) valida già `lang` internamente (riga 53), quindi la condizione era ridondante oltre che rotta. Rewired: trigger → direttamente alla request. **Verificato end-to-end 2 volte** (toggle `in_evidenza` true/false su un articolo reale, propagazione confermata su EN in ~5s).
- **Sync didascalia IT→EN** (`6fda6c8a`): aveva `accountability: "all"` invece di `"activity"` — violazione della regola già documentata in `STATO.md` (sessione 2026-07-01) dopo un incidente identico sul flow di traduzione. Corretto a `"activity"`. Endpoint testato manualmente con secret corretto: funziona (`{"ok":true,"action":"translated",...}`). **Non verificato con certezza end-to-end via trigger reale** — i tentativi di conferma via CF Analytics erano inconcludenti per via del ritardo di aggregazione dei log (diversi minuti, non tempo reale), quindi non ho potuto confermare nella finestra di test se il trigger reale chiama davvero l'endpoint dopo il fix. **Da verificare**: la prossima volta che la redazione modifica una didascalia IT già tradotta, controllare entro 1-2 minuti se la versione EN si aggiorna.

### APERTO — /en/category/ombre-e-luci/ risponde 404 invece del redirect configurato
**Desiderata:** verifica utente su GSC "Pagina con reindirizzamento" (nuovo motivo indicizzazione) → durante la verifica trovato questo bug a margine.

**PRIMA:** `astro.config.mjs:72-73` ha `'/en/category/ombre-e-luci/': '/it/categoria/ombre-e-luci/'` (categoria senza articoli EN, redirect verso IT). Testato live 2026-07-28: `curl https://ombreeluci.it/en/category/ombre-e-luci/` → **404**, non 301. Confermato anche via GSC URL Inspection API: `coverageState: "Not found (404)"`, crawlato l'ultima volta 2026-07-26.

**Causa probabile (non ancora confermata con fix):** la route dinamica `src/pages/en/category/[slug].astro` intercetta il path prima che il redirect statico di `astro.config.mjs` possa applicarsi, e la pagina stessa risponde 404 per mancanza di articoli nella categoria invece di lasciar passare il redirect.

**Non ancora fixato** — in attesa di conferma per procedere.

### Verifica GSC "Pagina con reindirizzamento" (nuovo motivo, 2026-07-28)
[x] **Verificato, non è un bug** — testato via Search Console URL Inspection API: le pagine canoniche (`/it/…/`, `/en/…/` con slash finale) risultano `PASS — Submitted and indexed`. Le varianti senza slash finale o senza prefisso lingua (es. `/it/il-mio-ritiro-spirituale-a-morlupo` senza `/`, `/chi-siamo` senza `/it/`) risultano `NEUTRAL — Page with redirect`, comportamento corretto e voluto (redirect di canonicalizzazione già esistenti, Rule R + astro.config.mjs). Nessuna azione necessaria su questo fronte specifico.

## Segnalazioni 2026-07-27

### RISOLTO — Proxy WordPress legacy su Aruba rimosso dal Worker
**Desiderata utente:** "il redirect su Aruba possiamo abolirlo appena puoi" → poi, dopo aver visto i numeri del traffico, "direi di sì" (conferma a procedere anche su wp-content/wp-json + deploy).

**PRIMA:** `cf-worker/redirect-worker.js` proxava verso un WordPress live su Aruba (IP `89.46.105.36`) tutte le richieste su `/wp-admin`, `/wp-content`, `/wp-includes`, `/wp-json`, `/feed`, `wp-login.php`, `wp-cron.php`, `xmlrpc.php`. Nessun audit del traffico reale era mai stato fatto prima di questa sessione.

**Intervento:**
1. Audit CF Analytics 7gg (21-27/7) per path — vedi tabella sotto.
2. Branch dedicato `fix/aruba-wp-proxy-cleanup` (mai su main, per [[feedback_branch_strategy]]).
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
[x] **RISOLTO 2026-07-27** — la Flow "Algolia sync su pubblicazione" (id `c09762f8`) non sincronizzava mai la ricerca del sito dopo la pubblicazione iniziale di un articolo. Tre bug indipendenti si sommavano:
   1. **Secret disallineato**: `ALGOLIA_SYNC_SECRET` sulla Flow non combaciava con quello su CF Pages → 401. Fix: secret rigenerato e allineato su entrambi (richiede un redeploy CF Pages per essere letto — i secret impostati via `wrangler pages secret put` si applicano solo alle build successive, non a quella già in esecuzione).
   2. **URL sbagliato**: la Flow chiamava `ombreeluci-staging.pages.dev` **direttamente**, bypassando il Worker — a differenza della Flow gemella "Sync metadati IT→EN" che chiama correttamente `ombreeluci.it`. Le variabili d'ambiente CF Pages "production" a quanto pare non sono garantite sull'URL nudo `*.pages.dev`. Fix: URL allineato a `https://ombreeluci.it/api/algolia-sync`.
   3. **Causa reale e principale — Cloudflare Bot Fight Mode**: ogni richiesta del server Directus (VPS Hetzner, IP `159.69.196.64`, ASN 24940) verso `/api/*` su `ombreeluci.it` riceveva un `managed_challenge` (confermato nei log Firewall CF, `source: botFight`) — una sfida JS che un server non può risolvere. La Flow non riceveva mai una vera risposta dall'endpoint, qualunque fosse secret/URL. **Probabilmente ha bloccato silenziosamente anche le altre Flow con lo stesso pattern (sync-didascalia, e sync-metadata quando triggerata realmente da Directus, non testata a mano da rete esterna).** Fix: creata IP Access Rule Cloudflare (whitelist) per `159.69.196.64` a livello zona — bypassa Bot Fight Mode per il VPS, non cambia nulla per il resto del traffico.
   4. Bonus: rimossa anche l'operation condizionale "Check if published" nella Flow — aveva un filtro vuoto mai configurato dal 09/05/2026, bloccava l'esecuzione a monte indipendentemente dagli altri 3 bug. Il controllo pubblicato/non pubblicato è comunque già fatto correttamente dentro l'endpoint (`algolia-sync.ts`), quindi l'operation era ridondante oltre che rotta.
   **Verificato end-to-end**: PATCH reale su un articolo → propagazione automatica su Algolia in pochi secondi, confermato con marker di test. Rilanciato reindex completo (`node scripts/algolia/index-all.mjs`): 6953 articoli + 355 autori + 206 numeri, per sanare lo stale accumulato.

### Jean Vanier "Le sacrament de la tendresse" — foto e dimensioni
[x] **Foto vecchia in ricerca**: causa = ALGOLIA-SYNC-401 sopra. Fix stopgap: record Algolia corretto a mano 2026-07-27 (ora punta a `86d48925-...`, l'immagine con i fiori). Si sistemerà da solo per i prossimi articoli quando ALGOLIA-SYNC-401 sarà risolto.
[ ] **Dimensione foto "sbagliata" nonostante editing Photopea**: da verificare visivamente — l'immagine di copertina viene sempre servita con crop fisso `?width=400&height=280&fit=cover` in ricerca/liste (aspect ratio 10:7). Se la foto originale ha un aspect ratio molto diverso (es. verticale), il crop automatico può tagliare il soggetto in modo indesiderato anche se il file caricato è già ridimensionato correttamente in Photopea — non è detto sia un bug, potrebbe essere il comportamento atteso del crop "cover". Verificare con Cristina quale specifica visualizzazione (articolo, card, ricerca) mostra la foto storta, poi decidere se serve un punto di focus/crop manuale sull'immagine invece del cover automatico.

### Traduzione De Paolis non pubblicata nonostante flow "completo"
[x] **RISOLTO 2026-07-27** — articolo IT `047749e5` (la-disabilita-non-e-un-superpotere...): il campo `json_traduzione` incollato dalla redazione era JSON non valido (parentesi graffa doppia in apertura + escaping rotto delle virgolette negli attributi `href` di `didascalia_copertina`). La flow "Import traduzione da JSON" fallisce silenziosamente su `JSON.parse` senza mostrare errore all'utente — stesso pattern sistemico di ALGOLIA-SYNC-401 sopra: **le Flow Directus non hanno un meccanismo per segnalare errori a chi ha innescato l'azione**. Fix: JSON ricostruito manualmente e valido, riscritto sul campo → la flow è ripartita da sola (trigger `items.update`) e ha creato l'articolo EN `2fbb0166` (slug `disability-is-not-a-superpower-or-an-image-problem`), pubblicato, linkato bidirezionalmente. Verificato live (200 su IT ed EN).
   // Da valutare: aggiungere un campo tipo `errore_traduzione` che la flow scrive quando il parse fallisce, così l'errore è visibile in Directus invece di scoprirlo mesi dopo via ticket.

### Foto EN "il mio ritiro spirituale a Morlupo" sempre sbagliata
[x] **RISOLTO 2026-07-27** — l'articolo EN `651061d0` (my-spiritual-retreat-in-morlupo) aveva `immagine_copertina` e `didascalia_copertina` **null** — non era mai stato sincronizzato con la copertina dell'IT dopo la bonifica del duplicato Morlupo (sessione 24/7, vedi STATO.md DUPLICATO-MORLUPO). La pagina mostrava un placeholder, percepito come "foto sbagliata". Fix: copiati `immagine_copertina` (`2369653b-...`) e didascalia tradotta dall'IT. Verificato live.

### Preview URL Directus
[x] **RISOLTO 2026-07-27** — `preview_url` su collection `articoli` puntava a `ombreeluci-staging.pages.dev` (uno dei sintomi del problema staging generale). Rimosso (`meta.preview_url = null`) su richiesta esplicita — non funzionava comunque.

------

## TODO — post-lancio (quanto prima)

### GA4 — eventi e conversioni
- [x] **CTAArticolo**: `gtag('event', 'btn_sostienici')` — click delegation in `CTAArticolo.astro` ✅ 2026-05-25
- [x] **NewsletterContent**: `gtag('event', 'conferma_iscrizione_newsletter')` — su iscrizione OK ✅ 2026-05-25
- [x] **Scroll depth**: `gtag('event', 'scroll_depth', {percent, lang})` — soglie 25/50/75/90% in `it/[slug].astro` e `en/[slug].astro` ✅ 2026-05-25
- [x] **Social share**: `gtag('event', network)` per facebook/twitter/whatsapp/linkedin — click listener su `#social-sticky` in IT e EN ✅ 2026-05-25
- [ ] **GA4 Dashboard**: `btn_sostienici` e `conferma_iscrizione_newsletter` già Key Events — verificare se attivi dopo deploy

### Articoli "cinema e disabilità" — contenuto vuoto
- [x] **RISOLTO 2026-05-21** — 17 articoli IT ripopolati da WP (IP `89.46.105.36`); tag "cinema e disabilità" aggiunto a tutti 16; 18 sfogliabili messi in bozza; podcast e galleria Assisi ripopolati; barattolo/questionario → bozza

### Articoli WP post-migrazione — non importati in Directus (PRIORITÀ ALTA)
Articoli pubblicati su WP dopo il cutover della migrazione (~apr 2026) non sono presenti in Directus → 404 sul nuovo sito.
Segnalati da social share / link esterni:
- [ ] `interpretazioni-disabilita-al-far-east-festival` (WP ID 15769606, maggio 2026)
- [ ] `anche-questanno-partecipero-alla-12-ore-nuotando-con-amore` (WP ID 15769564, maggio 2026)
- Pattern: tutti gli articoli WP con ID > ~15768000 potrebbero mancare. Verificare via:
  `curl -k "https://www.ombreeluci.it/wp-json/wp/v2/posts?per_page=100&orderby=id&order=desc&_fields=id,slug,date&status=publish"` confrontando con Directus
- Strategia: importare manualmente da WP REST API via IP `89.46.105.36` + pipeline Directus

### OG image default — ✅ RISOLTO 2026-05-21
- [x] `public/images/og-default.jpg` — tramonto con silhouette, 1200x630. Commit `765e1d35`.
- [x] `BaseHead.astro` punta a `/images/og-default.jpg` (file locale, non R2).

### Performance immagini — ottimizzazione urgente (PRIORITÀ ALTA)
PageSpeed Mobile: 71/100. Causa principale: immagini Directus servite senza resize.
- [ ] **Foto autori/diaristi in `DiariContent.astro`**: l'immagine `diario-fascia-foto` viene da `cms.ombreeluci.it/assets/{uuid}` senza parametri → 1.3MB per foto 962x320 visualizzata a 144x48px
  - Fix: aggiungere `?width=288&height=288&fit=cover&format=webp&quality=80` all'URL dell'asset Directus
  - Componente: `src/components/DiariContent.astro` (classe `diario-fascia-foto`)
- [ ] **Foto autori in `AuthorPageContent.astro` e `ArticlePageLayout.astro`**: stesso problema
- [ ] **Copertine articoli**: usare Directus transforms `?width=800&fit=cover&format=webp` invece di immagini full-res
- Direttus transforms docs: `https://cms.ombreeluci.it/assets/{uuid}?width=X&height=Y&fit=cover&format=webp&quality=80`

------

## Fix sessione 2026-05-22 (seconda sessione)

| Hash | Area | Fix |
|---|---|---|
| (middleware.ts) | Redirect autore | `/it/autori/pierfrancesco-depaolis/` → 301 → `/it/autori/pierfrancesco-de-paolis/`. Il fix Directus del 2026-05-21 aveva cambiato lo slug nel DB ma non aggiunto il redirect per il vecchio URL. |
| (Directus API) | categoria_menu_2 allowNone | `allowNone:true` sul campo secondo tema — la redazione può ora azzerare il secondo tema dopo averlo impostato. |
| (Directus API) | Catechesi rimossa dai dropdown | `catechesi` rimossa dalle choices di `categoria_menu` e `categoria_menu_2` (era rimasta dopo la migrazione → spiritualità del 2026-05-13). |
| (Directus API) | Flow contenuti_statici | Verificato attivo (id `96434e02`), hook CF Pages valido. Ogni modifica a `contenuti_statici` triggera rebuild automatico. |

---

## Fix sessione 2026-05-21

| Hash | Area | Fix |
|---|---|---|
| `00eadf93` | Home diari | Griglia 3 colonne (era 2); 8 card (era 4) |
| `9668ca8f` | Home diari | Davide Passeri incluso; ordinamento data decrescente |
| `72f3fb5b` | Home diari mobile | 2 colonne su tutti i breakpoint — fix bug `@media 480px` preesistente che reimpostava 1 colonna |
| `ee904d59` | Home diari titolo | Heading Ultra + IconDiari "I Diari di Ombre e Luci" al posto di "Tutte le storie →"; `home-tagline` nascosta |
| `38b1d666` | Articolo mobile | `article-title` 2rem, `article-subtitle` 1.3rem su `@media (max-width:480px)` |
| `22b0ac46` | EN home | Close Up mostra articoli EN dei diaristi (non più articoli casuali) |
| Directus PATCH | Dati | Slug `pierfrancesco-depaolis` → `pierfrancesco-de-paolis` (era 404) |

---

## Fix sessione 2026-05-14

| Hash | Area | Fix |
|---|---|---|
| `d70392d6` | Diari | Redesign hub griglia 2col + hero diario + fascia articolo; aggiunta Valeria Antonucci (Scorribande) |
| `effb44ca` | Diari | Descrizioni diari spostate da codice TypeScript a Directus (collection `serie`) — regola testi IT |
| `6d92691f` | Diari | Icona libro SVG inline (`IconDiari.astro`); CSS hero foto: rimossi border-radius/border/shadow; hub item |
| `1ba93d3a` | Diari | Icona libro aggiornata con SVG dell'utente, `fill=currentColor` |
| `807ec7b0` | Diari | Fascia articolo: foto prima del titolo, allineata al bordo basso, titolo in accent-color |
| `62ec465a` | Diari | Fascia: rimossi separatori `·`, foto 144×48px, padding-top 0 |
| `808d46dc` | Diari | Fascia: rimosso nome autore (solo icona + "I DIARI" + foto + titolo diario) |
| `7761ce72` | Loader | Spinner sempre visibile: aggiunto safety timeout 8s + null guard su `document.body` + `readyState` check |
| `4df87dbd` | Perf SSR | `Promise.all([getArticoloBySlug, fetch(correlati.json)])` su IT e EN — ~100ms risparmiati per request |
| `0b45e5d3` | Articolo | Commenti spostati sopra i correlati in calce (IT + EN) |
| `ec835d39` | Card | `ArticleCard` horizontal: CSS grid → author-row dentro colonna testo, sotto excerpt |
| `d568b734` | Articolo | Rimosso pulsante "Modifica in Directus" + fetch `/users/me` (eliminato 401 in console) + `will-change` |
| `891f975a` | Articolo | 4 fix UX: author-row HTML ristrutturato, CTA → button "Contribuisci", archival-alert lowercase, floating-widget rimosso |
| `f7d90900` | Infra | Fallback `try/catch → []` su 4 funzioni Directus SSG; `ArchivioContent` resiliente a 503 |
| `c3a0307b` | Homepage | Dedup sidebar Recenti (non mostra più l'articolo hero); `ArticleCard` horizontal: `display:flex` + width 220px |
| `fb331ea9` | Audit | Immagini Directus: 3429 file, 0 corrotti, 5864 articoli con copertina, 0 riferimenti rotti |
| `8250a12a` | Audit | BUG-REGEX: 2 articoli con `(?` letterario (non problematici); `un-pellegrinaggio` corpo pulito |
| `3391b060` | Docs | Root cause BUG-REGEX documentata: `define:vars` bypassa TypeScript; regola permessi agenti in WORKING.md |
| `3cc4f72a` | BUG-REGEX | `Commenti.astro`: rimosso TypeScript da script `define:vars` — fix `SyntaxError: missing ) in parenthetical` su tutti gli articoli |

------

[] PERF-IMG-DIMENSIONS: tutte le immagini del sito devono avere 
   attributi width e height espliciti per evitare layout shift (CLS).
   Audit con: grep -rn "<img" src/components/ src/pages/ src/layouts/ 
   | grep -v "width=" 
   Per ogni img senza width/height: aggiungere dimensioni esplicite 
   o aspect-ratio CSS sul container.
   Riferimento PSI: "Gli elementi immagine non hanno width e height esplicite"
   // file: src/components/*.astro, src/layouts/*.astro



[x] commenti spostato sopra correlati
[x] La fascia azzurra dari mostra solo: [icona] I DIARI [foto] NasoMano
[x] togli "Di" e "By" prima degli autori dapperttutto
    // fix: ArticleCard.astro:102 + ArticoliRullo.astro — rimosso prefisso author_by. Commit UX-REDAZIONE-01.
[x] tutti i  link della pagina chi siamo puntatno a 404, rivedi e correggi aggiornando in base a documentazione
    // fix: ChiSiamoContent.astro — blocchi La Rivista verso rubriche/categoria valide; link timeline con /it/ prefix.
[x] testi statici non si aggiornano in atuomatico. quale e' il problema ad aggiornarli subito?
    // causa: SSG build-time fetch. Fix: setup-static-rebuild-flow.mjs crea Directus Flow per rebuild CF Pages su modifica.
[x] la categoria catechesi deve confluire in spiritualità quindi tutti i contentuti categorizzati come catechesi vanno spostati in spiritualità e catechesi va tolta dal megamenu e dal footer
    // fix: categorie.json + taxonomy_structure.json aggiornati. Redirect in middleware.ts. Script migrate-catechesi.mjs da eseguire una tantum.
[x] pagina autori correggi numero articoli --> sono il doppio di quelli reali o conta anche gli ingelsi
    // fix: getArticoliCountByAutoreId() — aggiunto filter[lang][_eq]=it.
[x] nella pagina dettaglio autore aggiungere link a tutti gli autori / bio autore si aggiorna negli articoli ma non nella pagina autore / articoli en senza correlati anche se in it ci sono
    // fix: AuthorPageContent.astro — link "<- Tutti gli autori". Pagine autore IT+EN in SSR (prerender=false). en/[slug].astro: fallback IT slug + getArticoliEnByItSlugs().
[x] nella pagina chi-siamo escono parole come fragilit� ---> verifica utf o quello che e'
    // causa: encoding corrotto in contenuti_statici. Script fix-utf8-contenuti-statici.mjs da eseguire con DIRECTUS_TOKEN.
[x] info e contatti redazione semplificare e mettere mappa
    // fix: ChiSiamoContent.astro — indirizzo corretto (Via dei Cessati Spiriti 3), mappa Google Maps iframe.


## Redazione — segnalazioni (2026-05-08)

### Directus UX

[x] TEMI-LEGACY: campo `temi` (M2M legacy 285 temi) visibile nel form articolo — 
   nasconderlo completamente. Non serve per nuovi articoli.
   // via: PATCH /fields/articoli/temi meta.hidden:true

[~] TAG-UX: inserimento tag infelice — interfaccia M2M non ha autocomplete inline 
   come WordPress. Valutare se Directus 11 supporta autocomplete su M2M, 
   altrimenti documentare come limite strutturale.
   // via: Directus API meta.options

[x] FORMA-POSITION: campo Forma da spostare accanto a Tema in cima alla sezione
   Classificazione. Attualmente in fondo. FATTO 2026-05-09.
   // via: PATCH meta.sort sui campi classificazione

[x] PREVIEW-DIR: preview_url aggiornato a `https://ombreeluci-staging.pages.dev/it/{{slug}}/`. 2026-05-09.

[~] SAVE-DEFAULT: non configurabile via API in Directus 11. Ogni redattore imposta la preferenza nel proprio profilo (icona utente → Preferences). Limite strutturale.

[x] AUTORE-FILTER: nessun filtro attivo su campo autore — tutti gli autori visibili. Nessuna modifica necessaria. 2026-05-09.

[x] FILTRI-LISTA: searchable:false su umap_x/y/z, cluster_id, wp_id, original_url, json_export, json_traduzione, articolo_traduzione, slug, id. 2026-05-09.

[x] SLUG-AUTORE: autori.slug reso nullable (era NOT NULL). Interfaccia slug auto-genera da nome_completo. Nota campo aggiornata. 2026-05-09.

[x] FOLDERS-FORBIDDEN: permesso READ directus_folders aggiunto (id=145, policy Redazione 0a5492ea). 2026-05-09.

[x] PREVIEW-DIR-2: anteprima articolo in Directus ancora non funziona
   nonostante preview_url configurato. Investigare perché il pulsante
   occhio non apre la pagina corretta. Verificare configurazione
   preview_url su /collections/articoli e se Directus 11 richiede
   configurazione aggiuntiva (es. allowedDomains, token preview).
   // via: Directus Settings → Data Model → articoli → Preview URL

[] LIST-PREVIEW: nella lista articoli Directus manca link diretto
   "Vedi sul sito" per aprire l'articolo sul frontend senza dover
   aprire il record e usare l'anteprima. Aggiungere colonna o azione
   rapida con link https://ombreeluci-staging.pages.dev/it/{{slug}}/
   // via: Directus display template o custom action su collection

[x] EDIT-BTN-FRONTEND: Pulsante ora sempre visibile. 2026-05-09.
   CORS server-side OK. Cookie sessione non inviati cross-site (manca SameSite=None).
   Fix pragmatico: EditorialFeedback.astro mostra sempre il pulsante (hidden=false).
   L'utente vede login Directus se non loggato. Box feedback richiede auth funzionante.
   // file: src/components/EditorialFeedback.astro
[x] EDIT-BTN-REMOVE: Pulsante "Modifica in Directus" e fetch /users/me rimossi. 2026-05-14.
   Eliminati: <a directus-edit-btn>, checkDirectusAuth(), .directus-edit-btn CSS,
   editorial_directus_edit da i18n.ts. Box feedback rimane nel DOM ma hidden permanente
   (nessun meccanismo auth attivo). Zero errori 401 in console.
   // file: src/components/EditorialFeedback.astro, src/utils/i18n.ts

[x] UAT-PULIZIA: utente redazione-uat@ombreeluci.it sospeso ma non eliminato 
   per FK constraint su directus_files. Reassegnare file all'admin 
   (UUID 93c154ca) poi eliminare utente.
   // via: PATCH /files + DELETE /users

### Frontend

[x] ARCHIVAL-ALERT: soglie progressive 10/20/30 anni in it/[slug].astro + en/[slug].astro. 2026-05-09.

[x] AUTOCOMPLETE-POSITION: dropdown autocomplete appariva in fondo alla pagina invece che sotto la searchbox.
   Fix: aggiunto `position: relative` a `#aa-container` in AutocompleteWidget.astro. 2026-05-09.

[] CORRELATI-EDIT: nessun modo per correggere correlati sbagliati o vecchi 
   dalla redazione. Valutare campo override manuale in Directus.
   // architettura da definire

[] DIARI-MANCANTI: alcuni articoli mancano dall'associazione al diario corretto. 
   Come inserire nuovi articoli in un diario esistente?
   // via: Directus campo serie/diario su articolo

[x] DIARI-GRAFICA: modificare graficamente i post dei diari. 2026-05-14.
   // Commit d70392d6–6d92691f: redesign hub griglia 2col, hero diario azzurro, fascia articolo DiarioBadge.

### Feature da implementare

[x] TEMA-02: campo `categoria_menu_2` (secondo tema opzionale) — branch feat/tema-secondario.
   Campo Directus select-dropdown (sort 302, stesse choices di categoria_menu). 
   Route IT categoria: OR filter `categoria_menu === slug || categoria_menu_2 === slug`.
   Route EN: Directus `_or` filter. Badge articolo IT+EN: secondo link se non null.
   Export pipeline: `categoria_menu_2` in `_copy_invariant`. Build verde.
   Gate staging: da verificare dopo merge.

[x] FOCUS-HOWTO: sezione "Focus tematici" in NORME_EDITORIALI_OEL.md. 6 focus attivi con URL. 2026-05-09.

[] IMMAGINI-MULTI: possibilità di inserire più immagini contemporaneamente 
   nell'articolo (upload multiplo).
   // via: Directus field configuration

[x] TESTI-STATICI: collection `contenuti_statici` in Directus (STATIC-01).
   76 record per chi-siamo, sostienici, footer, cerca, categorie.
   API: `getContenutiStatici()` + `getCS()` in directus.ts. 2026-05-09.

[x] NL-MAILCHIMP: form newsletter collegato a Mailchimp (NL-FORM).
   Endpoint API /api/newsletter, double opt-in, tag pagina sorgente, GA4 tracking.
   2026-05-09.

[x] EVIDENZA-RECENTI: getArticoliInEvidenza ora seleziona automaticamente
   i 4 più recenti con in_evidenza=true per la categoria. Filter OR su
   categoria_menu/categoria_menu_2, sort -data_pubblicazione, limit 4. 2026-05-09.
   // file: src/lib/directus.ts

[x] IMG-BLURUP: RIMOSSO — causava immagini invisibili in megamenu, homepage, archivio, ricerca.
   Le immagini lazy nascoste o below-the-fold non ricevevano .loaded perché il browser
   non le carica finché non sono visibili. Regola globale rimossa da global.css e JS da BaseLayout.
   Fade-in può essere ri-aggiunto in modo opt-in su singoli componenti se necessario. 2026-05-09.
   // file: src/styles/global.css, src/layouts/BaseLayout.astro

[x] ALGOLIA-REINDEX: reindicizzazione completa 3 indici (7522 record totali).
   oel_articoli: 6963, oel_autori: 354, oel_numeri: 205. Numeri rivista ora
   appaiono in autocomplete (es. "47" trova OEL 47). 2026-05-09.
   // script: node scripts/algolia/index-all.mjs


-------------

### BUG


## Generale
[x] UAT-CLEANUP parziale: utente redazione-uat@ombreeluci.it sospeso ma non eliminato 
— FK constraint su directus_files (uploaded_by). Per pulizia completa: reassegnare i file dell'utente UAT all'admin (UUID 93c154ca-372c-4f94-8a35-e0fe66850780) via PATCH /files, poi eliminare l'utente. Non urgente — utente già sospeso, non può fare login.
// via: Directus API
[x] Page loader anti-FOUC: script spostato a primo figlio di `<head>` con `is:inline`,
`body { opacity:0 }` + `body.ready { opacity:1 }`, overlay #page-loader con spinner.
Gestisce View Transitions (astro:before-preparation/page-load). Commit add83081 + 15a7bcd6.
// file: src/layouts/BaseLayout.astro
[x] transizioni tra una pagina e l'altra morbide e eleganti (732d8280)
[x] transizioni entrata in pagina articolo: titolo .2s, sottotitolo+meta .3s, hero .4s, body .5s — @keyframes article-entry in ArticlePageLayout.astro, solo >=691px, zero JS
[x] in article-badge-link mancano /it/ e in alcuni casi anche /en/ — fix incluso in B-14; verificato su staging IT+EN, tutti i badge link hanno prefisso lingua corretto
[x] debug-section con dati JSON articolo presente nel DOM con hidden — rimossa completamente da it/[slug].astro e en/[slug].astro (it/[slug] aveva 2 <pre>, en/[slug] ne aveva 1)
// file: src/pages/it/[slug].astro, src/pages/en/[slug].astro
[x] TRANS-FLOW-01 UX: campo `json_export` non visibile nel form Directus per la Redazione — già presente nei 29 campi READ policy Redazione (permesso id 90). Verificato via API 2026-05-08.
[x] TRANS-FLOW-02: JSON parsing robusto nel flow import. Errore "json_traduzione non è un JSON valido" causato da newline non escapate o code fences markdown. Fix: prompt export con istruzioni esplicite escaping JSON + Run Script import con pre-processing (rimozione code fences, fix euristico newline, diagnostica con contesto). Scripts: setup-export-flow.mjs, setup-import-flow.mjs. 2026-05-09.
[x] traduzioni didascalie
// DID-EN: script translate-didascalie.mjs pronto. Bloccato da: 1) creare campo didascalia_en in Directus UI, 2) aggiornare en/[slug].astro per leggerlo. Vedi CONTENUTI.md § "Didascalie foto — traduzione EN"
[x] fix didascalie unsplash come da documentazione (non so dove avevamo apputanto credits con link)
[x] traduzioni bio (3133111c + 7756e067 — 79/79 bio tradotte IT→EN con Haiku, campo bio_en popolato, live su SSR articoli e SSG pagine autore dopo rebuild). Verificato 2026-05-08: staging mostra bio EN correttamente. 275/354 autori senza bio in nessuna lingua — dato mancante, non bug.
[x] automazione creazione versione inglese di articoli e numeri: capire come facilitare il compito della redazione. proposte: 1 opzione base: tasto in cms dentro articolo o pagina numero "crea versione inglese" (o spa o altra lingua pensare in modo che sia interfaccia scalabile) si apre pagina con struttura copiata 2 opzione pro: automazione completa con chiamata api per traduzione immediata di tutti i contenuti dell'oggetto. Valutare, documentare e fare piano di lavoro
[x] numero 52 mancavano gli articoli. fixato in italiano --> va sistemato numero inglese  mettendo gli articoli corrispondendi. Vale anche per numeri, ancora da fixare it, 47 46, https://ombreeluci-staging.pages.dev/it/archivio/ins--3 https://ombreeluci-staging.pages.dev/it/archivio/ins--2
   // FATTO: OEL-52 EN (38cf8678), OEL-47+OEL-46 (4b07b086), INS--2→INS-31 + INS--3→INS-32 (80fccd8c). 2026-05-09.
[~] quando facciamo un branch da sempre errore object object e non si riesce a navigare il sito. PErché? fixare!
   // LIMITE CF PAGES: nodejs_compat non funziona su preview deployment (solo su main). Documentato in STATO.md. Non è bug del codice.
[ ] Aggiungere check smoke test post-deploy: verifica che pagina autore EN contenga bio in inglese (non fallback IT). Controlla che fields array in directus.ts includa tutti i campi usati nel frontend — i campi mancanti sono silenziosi e non emergono dal build.


[x] tag negli articoli potrebbero non avere it e en? e rimandare a pagine tipo https://ombreeluci-staging.pages.dev/tag/lucio-corsi --> 404? (fix: /it/tag/ mancava in it/[slug].astro — solo EN aveva il prefisso corretto)
[x] social share icons pagina articolo: posizione, sticky, fade-in (branch feat/social-sticky-v2 — position:sticky CSS-nativo, IntersectionObserver fade-in al primo <p>, hover fill per piattaforma, 6 icone)

[x] ingrandire testi mobile — global.css @media 768px: h1 2rem, h2 1.5rem, h3 1.25rem,
   h4 1.1rem, p/li 1.125rem + line-height 1.7. ArticlePageLayout.astro 768px:
   .article-subtitle 1.125rem, .article-content p 1.125rem + line-height 1.75.
   Commit 92c3904a + e98a5e54 + e665c964.
[] lancira veririfica prima del golive speed test site e correzioni errori
[x] lanciare verifica prima del golive errori in consolle f12 — SyntaxError BUG-REGEX fixato. 2026-05-14.
   // Commit 3cc4f72a: Commenti.astro define:vars aveva TypeScript → SyntaxError su tutti gli articoli. Rimosso.
[x] will-change eccessivo: rimosso da ArticlePageLayout.astro (5 elementi animati una tantum).
   Le animazioni CSS @keyframes article-entry funzionano senza hint will-change. 2026-05-14.
   // file: src/layouts/ArticlePageLayout.astro
[x] BUG-REGEX: SyntaxError "missing ) in parenthetical" su tutti gli articoli. Root cause: Commenti.astro:149 aveva `(n: number)` in script `define:vars` non compilato da TypeScript → browser riceveva type annotation raw. Fix: commit 3cc4f72a. 2026-05-14.

## home

[x] home-davicino-section link home-link-more punta a href="/sezioni/diari" senza /it/ = 404
[x] home-davicino-section Colonna destra: testimonianze + CTA non si aggiorna, sempre gli stessi du earticoli 
[x] home-davicino-section  home-diari-grid nella versione inglese ci finiscono anche non diari, confermi? e non capisco perché
[x] home-davicino-section  home-diari-grid va ridisegnata, c'è un vuoto sotto i 4 box che non si capisce, le foto sono piccole i titoli e i nomi anche,,, non invoglia alla scoperta degli articoli. 
[x] home-esplora-section in inglese presenta titoli articoli  non tradotti e sono tutti già visti nella parte alta della pagina, fare in modo che se ne vedano altri
[x] button hover hero slider tutto verde --> deve essere uguale a  contribuisci (732d8280)
// file: src/components/HomePageContent.astro (classe .hero-cta, sezione hero-controls)
[x] home-rivista-section diesgnare meglio, avvicinare elementi, foto troppo a dx vuoto in mezzo; forrse invertire foto a sx e testo a dx?= (732d8280)
// file: src/components/HomePageContent.astro
[x] home-archivio-strip frecce non si vedono, ovali — rimosse, track swipeable (79bdd2e4)
// file: src/components/HomePageContent.astro
[x] articolo diari non si capisce a che diario appartiene, deve essere chiaro e evidente con link alla home diario. 2026-05-14.
   // Commit 807ec7b0: DiarioBadge fascia azzurra in cima all'articolo con icona, foto autore, link hub e link diario.
[x] mobile didascalia aggiungere margin sx (732d8280)
// file: src/layouts/ArticlePageLayout.astro
[x] mobile footer fix allineamento colonne --> info e privacy accanto a rubriche (732d8280)
// file: src/components/Footer.astro
[x] mobile elimina riga bianca bottom header (7b98f7d2)
// file: src/components/Header.astro
[x] mobile header trasparente icona lente cerca è nera (732d8280)
// file: src/components/Header.astro
[x] .issues-grid[data-astro-cid-fkap4qy4] aumenta gap a 3.5rem


## archivio
[x] IssueCard: immagini copertina con loading ottimizzato per LCP — prime 6 card
   (2 righe desktop) loading="eager", resto loading="lazy". Prop `index` passa
   da ArchivioContent.astro. 2026-05-09.
// file: src/components/IssueCard.astro, src/components/ArchivioContent.astro
[x] .issue-card[data-astro-cid-afktgyng] disattiva background (732d8280)
// file: src/components/IssueCard.astro
[x] associare box shadow e border radius all'img issue-card-image (732d8280)
// file: src/components/IssueCard.astro
[x] issue-card-content senza sfondo (732d8280)
// file: src/components/IssueCard.astro
[x] hover con transition solo su img (732d8280)
// file: src/components/IssueCard.astro

## Chi siamo
[x] traduzione menu laterale (732d8280)
// file: src/components/AboutSidebar.astro (etichette EN; lang passato da ChiSiamoContent)
[x] transizioni al click sul menu laterale (732d8280)
// file: src/components/AboutSidebar.astro (smooth scroll con scrollTo behavior:smooth)


## Archivio
[x] da /en/archive/ e altre 9 pagine EN switch lang senza /it/ = 404 — fixate 10 pagine (22198279)
// pages: en/archive, en/about, en/authors, en/newsletter, en/support-us, en/sections/diaries, en/archive/web-only, en/category/[slug], en/diaries/[diario], en/tag/[slug]
[x] home esplora section link /categoria/ senza /it/ = 404 (79bdd2e4)
// file: src/pages/index.astro
[x] pagina numero IT mostra articoli EN sotto "English Edition" — rimossi (79bdd2e4)
// file: src/components/IssueContent.astro



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
      




























