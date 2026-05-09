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


## Redazione — segnalazioni (2026-05-08)

### Directus UX

[] TEMI-LEGACY: campo `temi` (M2M legacy 285 temi) visibile nel form articolo — 
   nasconderlo completamente. Non serve per nuovi articoli.
   // via: PATCH /fields/articoli/temi meta.hidden:true

[~] TAG-UX: inserimento tag infelice — interfaccia M2M non ha autocomplete inline 
   come WordPress. Valutare se Directus 11 supporta autocomplete su M2M, 
   altrimenti documentare come limite strutturale.
   // via: Directus API meta.options

[] FORMA-POSITION: campo Forma da spostare accanto a Tema in cima alla sezione 
   Classificazione. Attualmente in fondo.
   // via: PATCH meta.sort sui campi classificazione

[x] PREVIEW-DIR: preview_url aggiornato a `https://ombreeluci-staging.pages.dev/it/{{slug}}/`. 2026-05-09.

[~] SAVE-DEFAULT: non configurabile via API in Directus 11. Ogni redattore imposta la preferenza nel proprio profilo (icona utente → Preferences). Limite strutturale.

[x] AUTORE-FILTER: nessun filtro attivo su campo autore — tutti gli autori visibili. Nessuna modifica necessaria. 2026-05-09.

[x] FILTRI-LISTA: searchable:false su umap_x/y/z, cluster_id, wp_id, original_url, json_export, json_traduzione, articolo_traduzione, slug, id. 2026-05-09.

[x] SLUG-AUTORE: autori.slug reso nullable (era NOT NULL). Interfaccia slug auto-genera da nome_completo. Nota campo aggiornata. 2026-05-09.

[x] FOLDERS-FORBIDDEN: permesso READ directus_folders aggiunto (id=145, policy Redazione 0a5492ea). 2026-05-09.

[] PREVIEW-DIR-2: anteprima articolo in Directus ancora non funziona
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

[] UAT-PULIZIA: utente redazione-uat@ombreeluci.it sospeso ma non eliminato 
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

[] DIARI-GRAFICA: modificare graficamente i post dei diari.
   // file: src/components/DiarioContent.astro o DiarioLayout.astro

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

[x] IMG-BLURUP: fade-in globale per immagini lazy. CSS opacity 0→1 con transition 0.4s.
   Script in BaseLayout aggiunge classe .loaded al completamento. Background placeholder
   #f5f5f5 su ArticleCard (IssueCard l'aveva già). 2026-05-09.
   // file: src/styles/global.css, src/layouts/BaseLayout.astro, src/components/ArticleCard.astro


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
[x] traduzioni didascalie
// DID-EN: script translate-didascalie.mjs pronto. Bloccato da: 1) creare campo didascalia_en in Directus UI, 2) aggiornare en/[slug].astro per leggerlo. Vedi CONTENUTI.md § "Didascalie foto — traduzione EN"
[x] fix didascalie unsplash come da documentazione (non so dove avevamo apputanto credits con link)
[x] traduzioni bio (3133111c + 7756e067 — 79/79 bio tradotte IT→EN con Haiku, campo bio_en popolato, live su SSR articoli e SSG pagine autore dopo rebuild). Verificato 2026-05-08: staging mostra bio EN correttamente. 275/354 autori senza bio in nessuna lingua — dato mancante, non bug.
[x] automazione creazione versione inglese di articoli e numeri: capire come facilitare il compito della redazione. proposte: 1 opzione base: tasto in cms dentro articolo o pagina numero "crea versione inglese" (o spa o altra lingua pensare in modo che sia interfaccia scalabile) si apre pagina con struttura copiata 2 opzione pro: automazione completa con chiamata api per traduzione immediata di tutti i contenuti dell'oggetto. Valutare, documentare e fare piano di lavoro
[] numero 52 mancavano gli articoli. fixato in italiano --> va sistemato numero inglese  mettendo gli articoli corrispondendi. Vale anche per numeri, ancora da fixare it, 47 46, https://ombreeluci-staging.pages.dev/it/archivio/ins--3 https://ombreeluci-staging.pages.dev/it/archivio/ins--2
[] quando facciamo un branch da sempre errore object object e non si riesce a navigare il sito. PErché? fixare!
[ ] Aggiungere check smoke test post-deploy: verifica che pagina autore EN contenga bio in inglese (non fallback IT). Controlla che fields array in directus.ts includa tutti i campi usati nel frontend — i campi mancanti sono silenziosi e non emergono dal build.


[x] tag negli articoli potrebbero non avere it e en? e rimandare a pagine tipo https://ombreeluci-staging.pages.dev/tag/lucio-corsi --> 404? (fix: /it/tag/ mancava in it/[slug].astro — solo EN aveva il prefisso corretto)
[x] social share icons pagina articolo: posizione, sticky, fade-in (branch feat/social-sticky-v2 — position:sticky CSS-nativo, IntersectionObserver fade-in al primo <p>, hover fill per piattaforma, 6 icone)

[x] ingrandire testi mobile — global.css @media 768px: h1 2rem, h2 1.5rem, h3 1.25rem,
   h4 1.1rem, p/li 1.125rem + line-height 1.7. ArticlePageLayout.astro 768px:
   .article-subtitle 1.125rem, .article-content p 1.125rem + line-height 1.75.
   Commit 92c3904a + e98a5e54 + e665c964.
[] lancira veririfica prima del golive speed test site e correzioni errori
[] lanciare verifica prima del golive errori in consolle f12

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
[] articolo diari non si capisce a che diario appartiene, deve essere chiaro e evidente con link alla home diario
// file: src/layouts/ArticlePageLayout.astro
// POSTICIPATO — screenshot in arrivo
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
      




























