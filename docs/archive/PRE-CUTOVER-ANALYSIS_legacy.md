> **Documento storico — cutover completato il 2026-05-21.** Sito live su `https://ombreeluci.it`. Questo documento è conservato come riferimento delle decisioni prese.

# Analisi pre-cutover — Ombre e Luci

Documento di sintesi prodotto il 2026-05-17 integrando:
- Analisi CC del 2026-05-17 (audit completo staging)
- Analisi Claude.ai del 2026-05-15 (criticità DNS e SEO)
- Ricerca aggiornata su best practice cutover Astro/CF/WordPress 2025-2026

---

## Aggiornamento finale 2026-05-18 — tutto il pre-lavoro completato

| Blocker / Task | Stato |
|---------|-------|
| B-WORKER | ✅ **RISOLTO** — `forwardToPages` abilitato, deploy `8608ac3b`. |
| B-MX | ✅ **RISOLTO** — Record documentati: `10 mx.ombreeluci.it.` (8 IP Aruba). SPF verificato. |
| B-TTL | ✅ **N/A** — DNS già su Cloudflare, TTL ~300s. |
| CF DNS setup | ✅ **GIÀ FATTO** — NS `dana/julio.ns.cloudflare.com` attivi. |
| B-15 noindex SWEEP | ✅ **BRANCH PRONTO** — `fix/cutover-noindex` commit `171ff27d`. Merge venerdì 22. |
| B-16 Sitemap | ✅ **COMPLETA** — `f6ddc5aa`. IT 4089 URL, EN 4068 URL. |
| Iubenda banner | ✅ **IN BASEHEAD** — `c19943fd`, `is:inline`, siteId 1433329. |
| GA4 analytics | ✅ **IN BASEHEAD** — `edac44e5`, G-2TJV78DNFQ, `is:inline`. |
| Redirect temporaneo apex→www | ✅ **ATTIVO** — Worker mantiene WP visibile fino a venerdì. |
| B-CANONICAL / PUBLIC_SITE_URL | ✅ **IMPOSTATO** — `https://ombreeluci.it` in CF Pages env produzione. |
| GSC proprietà | ✅ **ESISTENTE** — proprietà `ombreeluci.it` già in Search Console. |

**Tutto il lavoro pre-venerdì è completato.**
Restano solo le 6 operazioni del giorno del cutover (vedi CUTOVER.md FASE 2 aggiornata e STATO.md).

**Scoperta critica 2026-05-18:** il DNS era già su Cloudflare prima dell'audit.
`ombreeluci.it` stava restituendo 403 (CF error 1003) a tutti gli utenti reali
perché il Worker tentava fetch verso l'IP raw di Aruba post-cutover DNS.
Fix B-WORKER implementato e deployato in emergenza.

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

### B-WORKER — CF Worker non forwardia a Pages ✅ RISOLTO 2026-05-18

~~Il catch-all in `cf-worker/redirect-worker.js` proxia verso WordPress su Aruba~~
~~invece di chiamare `forwardToPages()`.~~

**Fix applicato in emergenza 2026-05-18:** il DNS era già su Cloudflare e il sito
restituiva 403 (CF error 1003) a tutti gli utenti. Catch-all sostituito con
`return forwardToPages(request, env)`. Commit `ac1782b7`, deploy Worker `8608ac3b`.
Verificato: `ombreeluci.it` 200 OK su homepage, articolo SSR, archivio.

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

### B-MX — Record MX email ✅ RISOLTO 2026-05-18

Record verificati e documentati:
- `10 mx.ombreeluci.it.` → 8 IP Aruba Mail (62.149.128.74/160/154/72/166/151/163/157)
- SPF: `v=spf1 include:aruba.it ~all`
- TTL: ~300s (già basso — propagazione rapida)
- Provider: **Aruba Mail**

Da replicare su CF DNS (DNS-only, grey cloud): record MX + 8 record A per mx.ombreeluci.it + TXT SPF.
CF importa automaticamente la zona — verificare che questi record siano presenti prima del noindex sweep.

### B-TTL — TTL DNS ✅ N/A 2026-05-18

DNS già su Cloudflare. TTL verificato ~300s. Non applicabile.

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

## Piano aggiornato — solo venerdì 22 maggio rimane

### Pre-venerdì — tutto completato ✅

| Task | Commit / Azione |
|------|-----------------|
| B-WORKER: forwardToPages | `ac1782b7` + deploy `8608ac3b` |
| B-15: noindex sweep | branch `fix/cutover-noindex` commit `171ff27d` |
| B-16: sitemap completa | `f6ddc5aa` — IT 4089, EN 4068 |
| Iubenda banner | `c19943fd` |
| GA4 G-2TJV78DNFQ | `edac44e5` |
| Redirect temporaneo apex→www | CF Worker (mantiene WP visibile fino a venerdì) |
| PUBLIC_SITE_URL in CF Pages env | `https://ombreeluci.it` |
| GSC proprietà esistente | presente |
| Health check Directus | `190930d9` |
| MX record documentati | audit 2026-05-18 |

### Venerdì 22 maggio — sequenza cutover SEO (in ordine)

| # | Operazione | Note |
|---|---|---|
| 1 | Rimuovi redirect temporaneo apex→www dal Worker e rideploya | `npx wrangler deploy` da `cf-worker/` |
| 2 | Merge `fix/cutover-noindex` su main e push | Attendi build CF Pages verde (~3 min) |
| 3 | Attiva custom domain `ombreeluci.it` e `www` in CF Pages | Dashboard CF Pages → Custom domains |
| 4 | Crea CF Redirect Rule www→apex 301 | Zone ombreeluci.it → Rules → `www.ombreeluci.it/*` → `https://ombreeluci.it/{1}` |
| 5 | Verifica propagazione, email, sitemap | Seguire CUTOVER.md FASE 3 |
| 6 | Aggiungi proprietà `https://ombreeluci.it` in GSC e invia sitemap | TXT record su CF DNS, poi invia IT + EN sitemap |

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

## Checklist pre-venerdì — tutto completato ✅

- [x] CF Worker deployato con forwardToPages abilitato
- [x] Redirect temporaneo apex→www nel Worker (mantiene WP visibile)
- [x] noindex SWEEP commit pronto su branch `fix/cutover-noindex`
- [x] robots.txt aggiornato nel branch
- [x] PUBLIC_SITE_URL in CF Pages env vars (produzione)
- [x] Sitemap IT + EN complete (4089 + 4068 URL)
- [x] Iubenda banner in BaseHead.astro
- [x] GA4 G-2TJV78DNFQ in BaseHead.astro
- [x] Record MX documentati (Aruba Mail, 8 IP, SPF verificato)
- [x] TTL ~300s (già su Cloudflare)
- [x] CF DNS zona active (NS già Cloudflare)
- [x] GSC proprietà esistente

## Da fare venerdì 22 mattina (in ordine)

- [ ] 1. Rimuovi redirect temporaneo apex→www dal Worker e rideploya
- [ ] 2. Merge `fix/cutover-noindex` su main — attendi build verde
- [ ] 3. Attiva custom domain `ombreeluci.it` + `www` in CF Pages
- [ ] 4. Crea CF Redirect Rule www→apex 301
- [ ] 5. Verifica propagazione + email + `curl https://ombreeluci.it/` → 200
- [ ] 6. Aggiungi proprietà `https://ombreeluci.it` in GSC + invia sitemap IT e EN

---

*Aggiornare questo documento man mano che i task vengono completati.*
*Fonte autorevole per lo stato del cutover fino al 22 maggio.*
