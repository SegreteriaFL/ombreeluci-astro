# Log monitoraggio SEO/uptime/redirect — Ombre e Luci

> Log settimanale generato dal check automatico. Entry più recente in alto.
> Per l'architettura generale del monitoring vedi [MONITORING.md](MONITORING.md).
> Tool usato: `scripts/gsc-query.mjs` (Search Analytics), `scripts/cf-analytics.mjs` (CF), `scripts/ga-query.mjs` (GA4), UptimeRobot API, `scripts/verify-redirects.mjs`.

---

## 2026-08-08 — check completo GSC + CF + GA4

**Stato generale:** sano e in crescita. Il plateau segnalato il 27/7 si è sbloccato: impressioni e click GSC in crescita ~+30-35%, crescita GA4 Italia confermata su più check consecutivi. EN ancora fermo. Uptime e redirect perfetti. Nuova osservazione: ritorno di traffico bot da Singapore su GA4.

### GSC Search Analytics (27/7→6/8, 11 giorni per lag di reporting GSC)
- Impressioni 2.517-3.256/giorno, click 32-64/giorno, posizione media 8,5-11,0
- **Confronto col check 27/7** (periodo 28/6-25/7: impressioni 1.560-2.293, click 19-46, posizione 8,5-11,8): **+30-35% su impressioni e click, plateau sbloccato**. Coerente con l'ipotesi formulata il 27/7: il fix BUG-EN-STAGING (hreflang/canonical, live dal 24/7) ha avuto le 2 settimane di osservazione previste e la crescita è ripartita.
- Top pagina invariata: "22 mini giochi da fare insieme" (125 click, 9.023 impressioni nel periodo), seguita da "14 giochi da fare insieme" (50 click)
- EN: solo 9 click totali sulle 15 pagine EN più visibili nel periodo, impressioni 1-12 per pagina — **ancora sostanzialmente invisibile** su 3.400+ articoli pubblicati, nessun cambiamento rispetto al 27/7. Resta da fare: controllo GSC Copertura/Indicizzazione (non ancora eseguito, azione consigliata dal 27/7 non ancora presa).

### Cloudflare Analytics (27/7→8/8, 13 giorni)
- 102.019 uniques, 153.858 pageviews, 515.152 requests — media 7.848 uniques/giorno, 11.835 pv/giorno
- **Cache rate 2,77%** (era 2,72% il 27/7) — invariato, Cache Rule HTML sulle route articolo ancora non implementata (nota ricorrente, non un'azione urgente per questo check)
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

### Bug trovati durante questa sessione (impatto SEO/dati indiretto — vedi `bug_ux_ui.md` per dettagli)
- **ALGOLIA-SYNC-401**: la Flow di sync Algolia fallisce silenziosamente da tempo indeterminato (secret disallineato Directus↔CF Pages) — la ricerca interna del sito può mostrare dati stale (foto, titoli) per un numero non quantificato di articoli modificati dopo l'ultimo secret valido. Non ancora risolto sistemicamente (solo stopgap su un articolo).
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
 q
**Stato generale:** sano.

- **GSC Search Analytics (22/5→12/6):** impressioni in crescita 739→3049/giorno, click 7→47, posizione media stabile 9-11. Trend in salita continuo, nessun impatto visibile dall'outage del 7-8/6.
- **Nota:** la colonna "Impressioni" del CSV export GSC Coverage (che mostrava un calo -48% 22/5→8/6) è un falso allarme — misura qualcosa di diverso da Search Analytics. Per il traffico reale usare sempre Search Analytics.
- **Outage dominio 8-10/6:** dominio ombreeluci.it non rinnovato, ~52h di instabilità (DNS + 5xx), risolto. Auto-renewal DNS ora attivo.
- **Redirect legacy (1096 voci):** baseline `verify-redirects` del 21/5 = 1095/1097 ok. I 2 fail sono su URL spam non-Latini (`/с-рождеством/`, `/メリークリスマス/`), ignorabili.
- **Uptime:** nessun downtime oltre l'outage DNS dell'8/6.

**Attività proposte:** nessuna — tutto in linea.

---
