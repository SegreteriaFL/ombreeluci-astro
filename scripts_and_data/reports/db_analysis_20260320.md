# Analisi Dump WordPress -- Ombre e Luci
**Data analisi:** 2026-03-20  
**Fonte:** `Sql980379_3.sql.gz` (19 MB compresso)  
**Prefisso tabelle:** `wppp_`

## Statistiche Generali

| Metrica | Valore |
|---------|--------|
| Articoli pubblicati estratti | **3527** |
| Autori (utenti WP) | **406** |
| Thumbnail mappate | **3251** |
| Attachment totali | **5256** |
| Articoli con figure (da caption) | **144** |
| Articoli word_count < 100 | **32** |
| Articoli word_count = 0 | **41** |

## Distribuzione Layout Divi

| Layout | Conteggio | % |
|--------|-----------|---|
| `2_3_sidebar` | 3311 | 93.9% |
| `4_4_fullwidth` | 167 | 4.7% |
| `html_pure` | 47 | 1.3% |
| `other` | 2 | 0.1% |

## Articoli word_count < 100 (potenzialmente troncati)

Totale: **32**

- `fermatevi-per-ascoltarci` -- Fermatevi per ascoltarci (98 parole, `2_3_sidebar`)
- `dialogo-aperto-n-1` -- Dialogo aperto n.1 (95 parole, `2_3_sidebar`)
- `quarte-di-copertina` -- Quarte di copertina (16 parole, `4_4_fullwidth`)
- `le-comunita-fede-e-luce-nel-mondo` -- Le comunità Fede e Luce nel mondo (7 parole, `html_pure`)
- `per-liberarci-dai-tabu-dellepilessia-plus-de-gym-pour-danny` -- Per liberarci dai tabù dell’epilessia – Plus de Gym pour Dan (99 parole, `2_3_sidebar`)
- `senza-alveare-a-natale` -- Senza Alveare a Natale... (11 parole, `2_3_sidebar`)
- `educare-alla-paternita-tra-ruoli-di-vita-e-trasformazioni-familiari` -- Educare alla paternità - Tra ruoli di vita e trasformazioni  (94 parole, `2_3_sidebar`)
- `faccio-il-viaggio-da-sola` -- Faccio il viaggio da sola (73 parole, `2_3_sidebar`)
- `gioco-come-questa-casa` -- Gioco - Com’è questa casa? (42 parole, `2_3_sidebar`)
- `buon-anno-da-ombre-e-luci` -- Buon anno da Ombre e Luci! (60 parole, `2_3_sidebar`)
- `in-preparazione-del-pellegrinaggio-internazionale-a-lourdes-pasqua-12-16-aprile-2001` -- In preparazione del Pellegrinaggio Internazionale a Lourdes  (72 parole, `2_3_sidebar`)
- `il-momento-piu-bello` -- "Il momento più bello" (69 parole, `2_3_sidebar`)
- `stelle-doriente-qualche-immagine-dalle-comunita-fede-e-luce-del-medio-oriente` -- Stelle d'oriente - Qualche immagine dalle comunità Fede e Lu (24 parole, `2_3_sidebar`)
- `quando-sono-diventata-dottore-di-ricerca` -- Quando sono diventata Dottore di Ricerca (60 parole, `2_3_sidebar`)
- `ce-un-problema-e-lo-affrontiamo` -- «C'è un problema». E lo affrontiamo. (11 parole, `2_3_sidebar`)
- `e-il-diritto-allo-studio` -- E il diritto allo studio? (11 parole, `2_3_sidebar`)
- `quel-pezzo-di-storia-che-non-puo-mancare` -- Quel pezzo di storia che non può mancare (11 parole, `2_3_sidebar`)
- `ogni-tanto-salvo-senno-finisce-male` -- Ogni tanto salvo, sennò finisce male (11 parole, `2_3_sidebar`)
- `le-parole-del-corpo-tecniche-e-giochi-per-lanimazione-attraverso-il-linguaggio-corporeo-recensione` -- Le parole del corpo: Tecniche e giochi per l’animazione attr (94 parole, `2_3_sidebar`)
- `sboccia-la-primavera` -- Sboccia la primavera! (43 parole, `2_3_sidebar`)
- `mi-preparo-alla-messa-recensione` -- Mi preparo alla messa - Recensione (90 parole, `2_3_sidebar`)
- `1500-grammi-di-cenere-cremazione-e-fede-cristiana-recensione` -- 1500 grammi di cenere Cremazione e fede cristiana - Recensio (71 parole, `2_3_sidebar`)
- `il-libro-di-cristopher-a-wonder-story-recensione` -- Il libro di Cristopher - A Wonder Story - Recensione (79 parole, `2_3_sidebar`)
- `campi-di-giochi` -- Campi di giochi (79 parole, `2_3_sidebar`)
- `a-te-bambino-mio` -- A te bambino mio (97 parole, `2_3_sidebar`)
- `bilancio-fede-e-luce-1976` -- Bilancio Fede e Luce 1976 (91 parole, `2_3_sidebar`)
- `samusa-di-virginia-raffaele` -- Samusà di Virginia Raffaele (28 parole, `4_4_fullwidth`)
- `la-poesia-del-firmamento` -- La poesia del firmamento (26 parole, `2_3_sidebar`)
- `consigli-per-i-film-delle-feste` -- Consigli per i film delle feste (36 parole, `2_3_sidebar`)
- `alessandro-bertolini` -- Ciao Alessandro (59 parole, `2_3_sidebar`)
- `in-viaggio-verso-lourdes` -- In viaggio verso Lourdes (81 parole, `2_3_sidebar`)
- `semplicemente-maria-recensioni` -- Semplicemente Maria | Recensioni (99 parole, `2_3_sidebar`)

## Esempio: `longevita-nella-disabilita`

- Layout: `2_3_sidebar`
- Parole: 280
- Figure: 0

```html
<p>L'Anffas onlus di Cagliari ha organizzato il <b>Seminario "La nuova longevità nella disabilità intellettiva: problematiche e prospettive"</b> che si terrà il <b>21 Marzo 2018</b>, dalle<b> </b>9 alle 13, presso il<b> T Hotel</b>, in <b>Via Dei Giudicati, 66 a Cagliari</b>.</p>
<p>Dalla brochure:</p>
<p><em>L'aspettativa di vita delle persone, negli ultimi anni, è aumentata in modo notevole e questo fenomeno coinvolge anche le persone con disabilita intellettiva che, sempre più frequentemente, affrontano, con le loro famiglie, il processo di invecchiamento.</em><br><em> Alcuni studi condotti a livello Nazionale ed Internazionale ci inducono a sostenere che il tema dell'invecchiamento nelle persone con disabilità intellettiva necessita di essere affrontato in modo specialistico, attraverso interventi specifici e multidimensionali.</em><br><em> L'attuale sistema di Welfare e di servizi dedicati, nella nostra Regione, non sembra però essere pronto e specializzato a fornire risposte adeguate ai bisogni di queste persone e delle loro famiglie.</em><br><em> A tal proposito l'obiettivo di tale evento è iniziare ad affrontare, secondo un approccio a forte integrazione, le sfide legate a questo nuovo fenomeno accogliendo, in primis, gli elementi scientifici e esperienziali dei relatori del seminario, per aprire successivamente il dibattito con i tecnici e i decisori istituzionali del nostro territorio.</em><br><em> Alla fine dell'evento si auspica l'apertura di un tavolo di lavoro appositamente dedicato al fenomeno, approfondendo, in maniera preventiva, soluzioni e strategie di intervento.</em><br><h3>L'Appuntamento:</h3><br><blockquote><br><h4>La nuova longevità della disabilità intellettiva: problematiche e prospettive<br>Seminario</h4><br><h5>21 marzo 2018 dalle ore 9 alle 13<br>T Hotel<br>via dei Giudicati, 66 - Cagliari</h5><br></blockquote><br>Il convegno è aperto a tutti i cittadini interessati alla tematica, agli operatori del settore, ai familiari delle persone con disabilità intellettiva, ai referenti istituzionali dei Comuni, delle ASSL, della Regione.</p>
<p>Fonte: <a href="http://www.anffasonlussardegna.it/">Anffas Sardegna</a></p>
```


## Esempi con `<figure>` (conversione da `[caption]`)

### Niccolò tra coloro che hanno fatto la storia (`ol-incontra-jorit`)
Figure count: 1
```html
<figure><img src="https://www.ombreeluci.it/wp-content/uploads/2020/11/Jorit-Niccolo-Maradona-1.jpg" alt="Il murale di Niccolò accanto a Maradona"><figcaption>Il murale di Niccolò accanto a Maradona</figcaption></figure>
```

### Vicenza: il Centro di Formazione Professionale dell’Opera Francescana “Charitas” (`vicenza-centro-di-formazione-professionale-dell-opera-francescana-charitas`)
Figure count: 1
```html
<figure><img src="http://www.ombreeluci.it/wp-content/uploads/2017/10/oel_n2_bruno_CentroFormazioneProfessionaleOperaFrancescana-1024x1024.jpg" alt="Attività motorie nel Centro Formazione Professionale dell"><figcaption>Bruno del Centro Formazione Professionale dell'Opera Francescana Charitas</figcaption></figure>
```

### E sono rimasta (`egle-bottega-e-sono-rimasta-la-mia-vita-per-il-centro`)
Figure count: 1
```html
<figure><img src="http://www.ombreeluci.it/wp-content/uploads/2017/10/oel_n2_EgleBottega2-1024x1024.jpg" alt="La fattoria di Monte di Mezzo del Centro di Formazione Professionale dell’Opera Francescana “Charitas” di Vicenza - oel_n2"><figcaption>La fattoria del Centro di Formazione Professionale dell’Opera Francescana “Charitas” di Vicenza</figcaption></figure>
```
