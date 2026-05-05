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
[] transizioni tra una pagina e l'altra morbide e elegnati

## home

[] button hover hero slider tutto verde --> deve essere uguale a  contribuisci
// file: src/components/HomePageContent.astro (classe .hero-cta, sezione hero-controls)
[] home-rivista-section diesgnare meglio, avvicinare elementi, foto troppo a dx vuoto in mezzo; forrse invertire foto a sx e testo a dx?=
// file: src/components/HomePageContent.astro
[] home-archivio-strip frecce non si vedono, ovali, brutto da navigare
// file: src/components/HomePageContent.astro
[] articolo diari non si capisce a che diario appartiene, deve essere chiaro e evidente con link alla home diario
// file: src/layouts/ArticlePageLayout.astro
[] mobile didascalia aggiungere margin sx
// file: src/layouts/ArticlePageLayout.astro
[] mobile footer fix allineamento colonne --> info e privacy accanto a rubriche 
// file: src/components/Footer.astro
[] mobile elimina riga bianca bottom header 
// file: src/components/Header.astro
[] mobile header trasparente icona lente cerca è nera
// file: src/components/Header.astro


## archivio
[] .issue-card[data-astro-cid-afktgyng] disattiva background; 
// file: src/components/IssueCard.astro
[] associare box shadow e border radius all'img issue-card-image
// file: src/components/IssueCard.astro
[] issue-card-content senza sfondo
// file: src/components/IssueCard.astro
[] hover con transition solo su img
// file: src/components/IssueCard.astro

## Chi siamo
[] traduzione menu laterale
// file: src/components/ChiSiamoContent.astro
[] transizioni al click sul menu laterale
// file: src/components/ChiSiamoContent.astro



