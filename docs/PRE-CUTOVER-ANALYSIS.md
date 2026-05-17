# Analisi pre-cutover — Ombre e Luci

Documento di sintesi prodotto il 2026-05-17 integrando:
- Analisi CC del 2026-05-17 (audit completo staging)
- Analisi Claude.ai del 2026-05-15 (criticità DNS e SEO)
- Ricerca aggiornata su best practice cutover Astro/CF/WordPress 2025-2026

---

## Stato staging al 2026-05-17

| Check | Esito |
|-------|-------|
| Homepage IT/EN | ✅ 200 |
| Articolo SSR | ✅ 200 |
| Archivio | ✅ 200 |
| Chi siamo | ✅ 200 |
| Diari | ✅ 200 |
| CMS ping | ✅ pong |
| /api/health | ✅ ok |
| Articoli IT published | ✅ ~3.491 |
| Articoli EN published | ✅ ~3.475 |

---

## Blockers assoluti pre-cutover

### B-WORKER — CF Worker non forwardia a Pages 🔴 CRITICO

**Scoperto nell'audit del 17/05. Non documentato precedentemente.**

Il catch-all in `cf-worker/redirect-worker.js` proxia verso WordPress su Aruba
(`89.46.105.36`) invece di chiamare `forwardToPages()`. La funzione esiste ma
è commentata/disabilitata. Senza questo fix, dopo il cutover DNS tutto il traffico
non-redirect continuerà ad andare a WordPress.

Fix: sostituire il catch-all WP proxy con `return forwardToPages(request, env)`.
Può essere deployato ora — nessun effetto finché DNS è su Aruba.
Effort: 30 minuti. Rischio se non fatto: sito rotto al D-day, 3 minuti di fix.

### B-15 — noindex SWEEP 🔴 CRITICO

35+ pagine hanno `noindex={true}` hardcoded incluse homepage IT, tutti gli articoli IT,
categorie, autori, archivio. `public/robots.txt` ha `Disallow: /`.

**Attenzione asimmetria**: `en/[slug].astro` ha già `noindex={false}` —
gli articoli EN sono già indicizzabili. Questa asimmetria con IT è probabilmente
involontaria e va corretta.

Fix: commit preparato su branch `fix/cutover-noindex`, pushato contestualmente
al cambio nameserver venerdì mattina — mai prima.

Pagine che mantengono noindex dopo il cutover: 404, debug/audit-editoriale,
cerca/search (Pagefind non va indicizzato come standalone).

### B-16 — Sitemap incompleta 🟡 IMPORTANTE

Inclusi: articoli IT (~3491), articoli EN (~3475), categorie IT, rubriche IT,
homepage, pagine statiche index.

Mancanti IT: pagine autore individuali `/it/autori/{slug}/` (~352),
numeri rivista `/it/archivio/oel-XXX/` (~205), diari `/it/diari/{slug}/`,
focus `/it/focus/{slug}/`.

Mancanti EN: categorie EN (14), autori EN, numeri EN, diari EN.

**Impatto SEO**: gli articoli (contenuto principale) sono inclusi.
Le pagine mancanti vengono trovate da Google via link interni ma entreranno
nell'indice più lentamente. Non bloccante per il lancio ma va completato
entro il giorno del cutover.

### B-MX — Record MX email 🔴 CRITICO

Non ancora verificato. Se i record MX non vengono replicati identici su Cloudflare
prima del cambio nameserver, `redazione@ombreeluci.it` smette di ricevere email.
La propagazione DNS MX richiede ore — non è reversibile rapidamente.

**Azione urgente oggi**: `dig MX ombreeluci.it +short` per documentare i record
esatti e identificare il provider email.

### B-TTL — TTL DNS 🟡 URGENTE

Aruba di default imposta TTL a 3600s (1 ora). Va abbassato a 300s
entro il 24 maggio per garantire propagazione rapida al cutover.
Se TTL è ancora alto al momento del cambio nameserver, alcuni utenti
vedranno WordPress per 1 ora dopo il cutover.

### B-CANONICAL — PUBLIC_SITE_URL 🟡 IMPORTANTE

`astro.config.mjs` usa `CF_PAGES_URL` che su staging è
`https://ombreeluci-staging.pages.dev`. I canonical `<link rel="canonical">`
e og:url puntano al dominio staging — Google vedrà una discrepanza.

Fix: aggiungere `PUBLIC_SITE_URL=https://ombreeluci.it` nelle variabili
d'ambiente CF Pages (solo produzione) e dare precedenza a questa variabile
in `astro.config.mjs`.

### B-ARUBA — Scadenza dominio 🔴 CRITICO

Il dominio scade il 27 maggio. Il cambio nameserver va completato
entro il 26 maggio mentre si è ancora proprietari attivi su Aruba.
Verificare oggi se il rinnovo automatico è attivo su Aruba.
Se non attivo: rinnovare o almeno bloccare la scadenza.

---

## Rischi tecnici da verificare

### CF Worker come singolo punto di fallimento

Il Worker gestisce TUTTO: redirect legacy, proxy WP admin, forward a Pages.
Se crasha, `ombreeluci.it` è offline. Non c'è fallback automatico.

Procedura di emergenza da documentare prima del cutover:
In CF Dashboard, bypassare temporaneamente il Worker puntando il DNS record
direttamente al CNAME CF Pages senza passare per il Worker.

### Importazione zona DNS da Aruba a Cloudflare

CF importa automaticamente i record DNS da Aruba ma può omettere
o sbagliare il record del tunnel `cms.ombreeluci.it`.
Azione: esportare record completi da Aruba, confrontare con quanto
CF importa, correggere manualmente prima del cambio nameserver.

### Pagefind — build time con URL staging

L'indice Pagefind viene generato al build con gli URL correnti.
Se la build avviene prima del noindex sweep, l'indice contiene URL staging.
La sequenza corretta è obbligatoria:
**noindex sweep → build → cutover DNS** — mai il contrario.

### Canonicals post-cutover

Anche dopo aver impostato PUBLIC_SITE_URL, la prima build
post-noindex-sweep deve propagare i canonical corretti.
Verificare con `curl -s https://ombreeluci.it/it/ombre-e-luci/ | grep canonical`
entro 5 minuti dal deploy.

### www.ombreeluci.it senza redirect 301

Se la CF Redirect Rule www→apex non è creata prima del cutover,
`www.ombreeluci.it` caricherà il sito senza redirect —
doppio contenuto per Google. Non bloccante operativamente
ma SEO-suboptimal. Da fare in FASE 0.

---

## Lezioni da ricerca best practice 2025-2026

### SEO migration — dati da tenere a mente

- Il 60% delle migrazioni causa perdita misurabile di traffico organico.
  Il tempo medio per recuperare il traffico pre-migrazione è 523 giorni
  per le migrazioni mal eseguite.  La differenza tra recovery rapida e lunga
  dipende quasi interamente dalla qualità del mapping URL e della logica redirect.

- Google mantiene la relazione tra vecchio e nuovo sito per 180 giorni
  dopo il Change of Address. Dopo 180 giorni tratta i due siti come non correlati.
  I redirect vanno mantenuti per almeno 180 giorni, idealmente 1 anno.

- Per considerare una migrazione completa, Googlebot deve visitare
  ogni URL del vecchio e del nuovo sito almeno una volta.
  Non ci sono frequenze di crawl fisse — dipende dalla dimensione del sito.

### Redirect — regole assolute

- Un solo hop: A → B. Mai A → B → C.
- 301 permanenti, non 302 temporanei.
- Mai redirect tutto-verso-homepage — ogni URL va alla sua controparte semantica.
- I 301 redirect devono essere in place prima di informare Google del cambiamento.

### Astro + Cloudflare Pages — trappole note

- CF può silenziosamente spostare un progetto Pages a Workers.
  Verificare che il deployment URL sia `*.pages.dev` non `*.workers.dev`.
- Il flag `nodejs_compat` corrompe le risposte SSR — già documentato in WORKING.md.
- La sequenza corretta build→deploy→DNS va rispettata rigorosamente.

### Change of Address tool — quando e come

Usare il Change of Address tool di Google Search Console **dopo** il cutover,
non prima. Richiede: proprietà GSC verificata per entrambi i domini,
301 redirect già in place, nuovo sito già live.
Il tempo medio per processare il change of address è 1-2 settimane,
ma può richiedere mesi per siti grandi.

---

## Piano di lavoro Mar 19 → Ven 22 maggio

### Martedì 19 maggio

| Priorità | Task | Effort | Chi |
|----------|------|--------|-----|
| 🔴 P0 | B-WORKER: abilita forwardToPages in CF Worker | 30 min | CC |
| 🔴 P0 | B-MX: `dig MX ombreeluci.it` — documenta record email | 15 min | Fede |
| 🔴 P0 | B-ARUBA: verifica rinnovo automatico dominio | 15 min | Fede |
| 🟡 P1 | B-CANONICAL: `PUBLIC_SITE_URL` in CF Pages env vars | 15 min | CC |
| 🟡 P1 | B-16: Sitemap — aggiungi autori IT + numeri rivista IT | 2h | CC |
| 🟡 P1 | CF DNS setup preliminare (no nameserver change) | 1h | Fede |

### Mercoledì 20 maggio

| Priorità | Task | Effort | Chi |
|----------|------|--------|-----|
| 🔴 P0 | B-15: noindex SWEEP — commit su branch, non pushare | 2h | CC |
| 🔴 P0 | robots.txt — attivare testo già pronto nel file | 15 min | CC |
| 🟡 P1 | B-TTL: abbassa TTL a 300s su Aruba | 15 min | Fede |
| 🟡 P1 | CF Redirect Rule www→apex | 15 min | Fede |
| 🟡 P1 | B-16: Sitemap — aggiungi EN categorie + diari | 1h | CC |
| 🟡 P1 | Iubenda: aggiorna domini per includere ombreeluci.it | 15 min | Fede |
| 🟡 P1 | GA4: verifica data stream punta a ombreeluci.it | 15 min | Fede |

### Giovedì 21 maggio

| Priorità | Task | Effort | Chi |
|----------|------|--------|-----|
| 🔴 P0 | Smoke test completo pre-cutover (CUTOVER.md FASE 1) | 1h | CC+Fede |
| 🔴 P0 | Verifica visiva mobile con redazione (M-01→M-07) | 1h | Fede+redazione |
| 🟡 P1 | CF Worker — verifica route su zona CF corretta | 30 min | CC |
| 🟡 P1 | Algolia domain restrictions check | 15 min | CC |
| 🟡 P1 | nodejs_compat flag check su CF Pages | 5 min | CC |
| 🟡 P1 | Comunicazione redazione: venerdì manutenzione ~30 min | 15 min | Fede |
| 🟡 P1 | Bug fix minori se c'è tempo (slug doppio, CSS) | 1h | CC |

### Venerdì 22 maggio — Cutover

Seguire CUTOVER.md in ordine rigoroso.
Orario consigliato: mattina presto (8:00-9:00) per avere tutta la giornata
per gestire eventuali problemi.

---

## Task post-cutover accettabili

| Task | Effort | Quando |
|------|--------|--------|
| UptimeRobot URL → produzione | 5 min | T+30min |
| Mailchimp SPF/DKIM | 30 min | T+30min |
| Google Search Console + Change of Address | 30 min | T+2h |
| PF-02 Cache-Control R2 via media.ombreeluci.it | 1h | T+2h |
| Verify redirects su produzione | 30 min | T+2h |
| Algolia test su produzione | 15 min | T+2h |
| Speed test PageSpeed su ombreeluci.it | 15 min | T+24h |
| UAT-PULIZIA | 30 min | T+24h |
| Sitemap completamento (diari EN, focus) | 1h | T+24h |
| Bug visivi minori | 2h | Post-lancio |
| NORME_EDITORIALI completamento | 1h | Post-lancio |
| Riorganizzazione documentazione | 2h | Post-lancio |

---

## Checklist verifica finale (giovedì sera)

- [ ] CF Worker deployato con forwardToPages abilitato
- [ ] noindex SWEEP commit pronto su branch (non pushato)
- [ ] robots.txt aggiornato nel branch
- [ ] PUBLIC_SITE_URL in CF Pages env vars (produzione)
- [ ] Sitemap IT include autori + numeri
- [ ] Record MX documentati e replicati su CF DNS
- [ ] TTL abbassato a 300s su Aruba
- [ ] CF DNS setup completo (CNAME Pages + cms A record + www redirect)
- [ ] Iubenda aggiornato per ombreeluci.it
- [ ] GA4 data stream verificato
- [ ] Dominio Aruba non scade prima del 26 maggio
- [ ] Comunicazione redazione inviata

---

*Aggiornare questo documento man mano che i task vengono completati.*
*Fonte autorevole per lo stato del cutover fino al 22 maggio.*
