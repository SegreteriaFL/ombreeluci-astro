<!--
BUG / UX / UI — Ombre e Luci

Come usare questo file:
Questo file è la lista di lavoro per bug visivi e miglioramenti UX/UI.
Quando non ci sono task urgenti, o quando esplicitamente richiesto,
Claude Code attacca i bug in ordine dall'alto verso il basso.
Ogni bug completato: sostituire [ ] con [x] e aggiungere il commit hash.
Priorità implicita: i bug senza sezione sono bloccanti o cross-cutting.
I bug per sezione (home, archivio, ecc.) sono localizzati e indipendenti tra loro.
-->

### BUG


## Generale
[x] transizioni tra una pagina e l'altra morbide e eleganti (732d8280)

## home

[x] button hover hero slider tutto verde --> deve essere uguale a  contribuisci (732d8280)
// file: src/components/HomePageContent.astro (classe .hero-cta, sezione hero-controls)
[x] home-rivista-section diesgnare meglio, avvicinare elementi, foto troppo a dx vuoto in mezzo; forrse invertire foto a sx e testo a dx?= (732d8280)
// file: src/components/HomePageContent.astro
[x] home-archivio-strip frecce non si vedono, ovali, brutto da navigare (732d8280)
// file: src/components/HomePageContent.astro
[] articolo diari non si capisce a che diario appartiene, deve essere chiaro e evidente con link alla home diario
// file: src/layouts/ArticlePageLayout.astro
// POSTICIPATO — screenshot in arrivo
[x] mobile didascalia aggiungere margin sx (732d8280)
// file: src/layouts/ArticlePageLayout.astro
[x] mobile footer fix allineamento colonne --> info e privacy accanto a rubriche (732d8280)
// file: src/components/Footer.astro
[x] mobile elimina riga bianca bottom header (732d8280)
// file: src/components/Header.astro
[x] mobile header trasparente icona lente cerca è nera (732d8280)
// file: src/components/Header.astro


## archivio
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



