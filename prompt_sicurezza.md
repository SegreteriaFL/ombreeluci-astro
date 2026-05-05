Ho quello che mi serve. Rispondo alla tua domanda sui doc e poi scrivo il prompt.

**Sulla proliferazione di documenti:** hai ragione a sollevarlo. Il progetto ha accumulato troppi file di documentazione (`PROGRESS.md`, `STATO.md`, `STATO_PROGETTO.md`, `INFRASTRUTTURA.md`, `WORKING.md`, `CLAUDE.md`, `CONTENUTI.md`, `RUNBOOK.md`, `TRADUZIONI.md`, `ARCH-04-PLAYBOOK.md`). La versione aggiornata che hai allegato oggi ha già consolidato parte di questo — `STATO.md` è molto più pulito e strutturato di `PROGRESS.md`. Il problema è che Claude Code all'inizio di ogni sessione deve leggere tutti i file rilevanti, e più sono dispersi più aumenta il rischio che ne salti uno.

Non è il momento di fare una pulizia dei doc (sarebbe un task separato), ma nel prompt specifico di aggiungerlo come nota a piè di pagina piuttosto che come sezione principale, e di usare `STATO.md` come unica fonte di verità per lo stato del task.

---

Ecco il prompt completo:

---

```
Leggi nell'ordine: WORKING.md, CLAUDE.md, INFRASTRUTTURA.md, RUNBOOK.md, STATO.md.
Non iniziare nessuna implementazione prima di averli letti tutti.

---

## Task: MONITORING-01 — Sistema di osservabilità e health check

### Contesto

Il sito non ha monitoring attivo. La tabella "Monitor attivi" in INFRASTRUTTURA.md
mostra tutto come "da configurare". Questo task implementa tre livelli di guardrail.

### File da creare
- src/pages/api/health.ts
- .github/workflows/smoke-post-deploy.yml
- docs/MONITORING.md

### File da aggiornare
- INFRASTRUTTURA.md (sezione "Monitor attivi" e "Monitoring da configurare")
- RUNBOOK.md (nuova sezione "Monitoring e alert")
- STATO.md (aggiungi MONITORING-01 nella sezione task completati al termine)

### File da NON toccare
Qualsiasi altro file. In particolare: src/lib/directus.ts, src/middleware.ts,
astro.config.mjs, qualsiasi componente o pagina esistente.

---

## Livello 1 — Endpoint /api/health

Crea `src/pages/api/health.ts` con `export const prerender = false`.

Esegui i tre check in parallelo con Promise.allSettled — mai in serie.
Ogni check ha il proprio timeout via AbortController (non Promise.race globale).

### Check 1 — Directus ping
GET https://cms.ombreeluci.it/server/ping
Timeout: 5000ms
Atteso: HTTP 200 + body contiene "pong"
Risultato: "ok" | "degraded" | "down"

### Check 2 — Conteggio articoli pubblicati (anonimo)
GET https://cms.ombreeluci.it/items/articoli?aggregate[count]=id&filter[stato][_eq]=published
Nessun Authorization header — verifica che le permissions pubbliche Directus siano attive.
Timeout: 8000ms
Atteso: count > 3000
Risultato: "ok" | "degraded:{count}" | "error"

### Check 3 — Ultimo numero rivista (anonimo)
GET https://cms.ombreeluci.it/items/numeri_rivista?sort=-anno_pubblicazione&limit=1&fields=id_numero,tipo
Nessun Authorization header.
Timeout: 8000ms
Atteso: almeno un record con id_numero non null
Risultato: "ok:{id_numero}" | "missing" | "error"

### Response

HTTP 200 se tutti i check sono "ok" o "degraded".
HTTP 503 se almeno un check è "down".
Body JSON: { status: "ok"|"degraded"|"down", checks: { directus, articoli, ultimo_numero }, ts: ISO8601 }
Headers: Cache-Control: no-store, Content-Type: application/json

Nota importante: non usare 503 per "degraded" — UptimeRobot deve leggere il body
per fare keyword check anche quando un check è degraded. Solo "down" giustifica 503.

Non importare nulla da src/lib/directus.ts. Questo endpoint è completamente autonomo.

---

## Livello 2 — Smoke test post-deploy

Crea `.github/workflows/smoke-post-deploy.yml`.

Trigger: on push to main.
Prima dei check aggiungi `sleep 200` per attendere il deploy CF Pages (~3 min).

BASE_URL: https://ombreeluci-staging.pages.dev

Tutti i check usano curl — nessuna dipendenza da Playwright o altri tool.

### Check da implementare in sequenza

1. Health endpoint
   curl -sf $BASE_URL/api/health
   Assert: HTTP 200, body contiene "status":"ok"

2. Homepage IT
   curl -sI $BASE_URL/
   Assert: HTTP 200

3. Homepage EN
   curl -sI $BASE_URL/en/
   Assert: HTTP 200

4. Articolo SSR IT — slug "ombre-e-luci" (stabile, esiste dall'import originale)
   curl -sf $BASE_URL/it/ombre-e-luci/
   Assert: HTTP 200
   Assert: body inizia con "<!DOCTYPE" (non con "[object Object]" — rileva il bug CF Pages
   descritto in WORKING.md sezione "Regole SSR e bundle size")
   Assert: body contiene lang="it"

5. Articolo SSR EN — leggi src/data/redirects-legacy.json, prendi il primo
   slug che ha una versione EN in Directus, oppure usa l'indice /en/ come fallback
   curl -sI $BASE_URL/en/
   Assert: HTTP 200

6. Archivio IT
   curl -sI $BASE_URL/it/archivio/
   Assert: HTTP 200

7. Numero rivista SSR — pagina SSR, usa OEL-173 (verificato in STATO.md come 200)
   curl -sI $BASE_URL/it/archivio/oel-173/
   Assert: HTTP 200

8. Redirect /blog/* → /it/*
   Prendi un qualsiasi slug da src/data/redirects-legacy.json.
   curl -sI "$BASE_URL/blog/{slug}/"
   Assert: HTTP 301, Location header contiene "/it/"

9. Sitemap IT
   curl -sf $BASE_URL/sitemap.xml
   Assert: HTTP 200, body contiene "<loc>"

10. Sitemap EN
    curl -sf $BASE_URL/sitemap-en.xml
    Assert: HTTP 200, body contiene "/en/"

11. CMS ping diretto (indipendente dal sito)
    curl -sf https://cms.ombreeluci.it/server/ping
    Assert: body contiene "pong"

### In caso di fallimento
Notifica Slack via $SLACK_WEBHOOK_URL (stesso secret già usato in nightly-build.yml —
guarda quel file per il formato del payload Slack).
Il job NON deve bloccare il deploy — notifica soltanto.
Upload del log come artifact GitHub con retention 7 giorni (sempre, anche in caso di successo).

---

## Livello 3 — Documentazione

### docs/MONITORING.md

Crea questo file con le seguenti sezioni. Scrivi in italiano, tono tecnico ma leggibile
da chi non ha mai visto il sistema. Niente elenchi puntati inutili — prose dove possibile.

**Sezione 1 — Architettura del sistema**
Descrivi i tre livelli (UptimeRobot esterno, smoke test post-deploy, health endpoint interno)
e il loro ruolo. Spiega cosa copre ognuno e cosa non copre (la distinzione
"failure produzione continua" vs "regressione da deploy" discussa in fase di progettazione).

**Sezione 2 — Configurazione UptimeRobot (istruzioni operative)**
Istruzioni passo-passo per configurare 6 monitor. Per ognuno: URL, tipo di check,
intervallo, tipo di alert, canale.

| Monitor | URL | Intervallo | Tipo check | Alert |
|---|---|---|---|---|
| CMS ping | https://cms.ombreeluci.it/server/ping | 5 min | Keyword: "pong" | Email + Slack |
| Homepage IT | https://ombreeluci.it/ | 5 min | HTTP 200 | Email + Slack |
| Homepage EN | https://ombreeluci.it/en/ | 10 min | HTTP 200 | Email |
| Articolo SSR | https://ombreeluci.it/it/ombre-e-luci/ | 10 min | HTTP 200 | Email |
| Archivio | https://ombreeluci.it/it/archivio/ | 15 min | HTTP 200 | Email |
| Health endpoint | https://ombreeluci.it/api/health | 5 min | Keyword: "status":"ok" | Email + Slack |

Nota: dopo il cutover DNS da Aruba a Cloudflare gli URL sopra diventeranno
gli URL di produzione. Durante il periodo di staging usare
https://ombreeluci-staging.pages.dev in sostituzione di https://ombreeluci.it.

**Sezione 3 — Come interpretare /api/health**
Spiega ogni campo del JSON di risposta. Spiega quando allarmarsi
(check "down" vs "degraded") e cosa fare in ogni caso con link al playbook in RUNBOOK.md.

**Sezione 4 — Come interpretare i fallimenti del workflow smoke-post-deploy**
Dove trovare il log (GitHub Actions → workflow run → artifact).
Quali check indicano problemi critici (check 4 — [object Object] — è il più grave)
vs problemi secondari.

**Sezione 5 — Cosa NON è coperto e perché**
Qualità visiva, layout CSS, font rendering: decisione consapevole, non dimenticanza.
Spiega brevemente il tradeoff (complessità Playwright screenshot comparison vs frequenza
deploy su un sito con contenuto trimestrale).

**Sezione 6 — Come estendere il sistema**
Come aggiungere un check all'endpoint /api/health.
Come aggiungere un check al workflow smoke.
Come aggiungere una nuova lingua ai check.

### Aggiornamenti a INFRASTRUTTURA.md

Nella sezione "Monitor attivi": sostituisci la tabella attuale (tutto "da configurare")
con la tabella dei 6 monitor di MONITORING.md, con una nota che rimanda a docs/MONITORING.md
per le istruzioni di configurazione. Lascia lo stato "da configurare" per UptimeRobot
(perché richiede azione manuale da parte del sysadmin) ma marca il workflow GH Actions
come "deployato con MONITORING-01".

Nella sezione "Monitoring da configurare": aggiungi un riferimento a docs/MONITORING.md.

### Aggiornamenti a RUNBOOK.md

Aggiungi una nuova sezione "## Monitoring e alert" con:
- Elenco dei canali di alert attivi e cosa triggerano
- Come verificare manualmente lo stato del sistema: `curl https://ombreeluci.it/api/health | jq`
- Link a docs/MONITORING.md per il dettaglio
- Come silenziare temporaneamente gli alert UptimeRobot durante manutenzione pianificata

---

## Gate obbligatori prima di committare

Quelli standard di WORKING.md, più:
- [ ] curl http://localhost:8788/api/health (wrangler pages dev) → HTTP 200, JSON valido
- [ ] curl http://localhost:8788/api/health con Directus irraggiungibile (spegni
      temporaneamente il tunnel o usa URL sbagliato) → HTTP 503, JSON con check.directus="down"
- [ ] tsc --noEmit → zero errori
- [ ] Il workflow smoke-post-deploy.yml è YAML valido (yamllint o simile)

---

## Note finali

Non serve aggiungere un nuovo task MONITORING in STATO.md prima di iniziare — crealo
direttamente nella sezione "Fix recenti" o "Task completati" al termine, con la data
di oggi e i file modificati.

Se durante l'implementazione trovi che uno slug usato nei check non esiste su staging
(perché il DB è diverso), sostituiscilo con uno che esiste verificandolo con:
curl -s "https://cms.ombreeluci.it/items/articoli?filter[stato][_eq]=published&filter[lang][_eq]=it&limit=1&fields=slug"
e usa quello slug nel check 4.
```