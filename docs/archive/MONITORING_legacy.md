> **ARCHIVIATO 2026-08-10** — contenuto consolidato in `RUNBOOK.md` (repo root), sezioni 12-17. Conservato solo per riferimento storico, non aggiornare.

# Sistema di monitoring — Ombre e Luci

> Documento tecnico di riferimento per il sistema di osservabilità del sito.
> Ultima revisione: 2026-05-05 (MONITORING-01)

---

## 1. Architettura del sistema

Il monitoring è organizzato su tre livelli che si sovrappongono parzialmente ma coprono scenari distinti.

**Livello 1 — UptimeRobot (esterno):** controlla il sito da fuori, come farebbe un visitatore reale. Rileva failure che persistono nel tempo: CMS down, homepage irraggiungibile, certificato SSL scaduto, Cloudflare Pages in errore. Non sa nulla di deploy o contenuto — sa solo che un URL risponde o non risponde. È il livello che manda un alert alle 3 di notte se il sito smette di funzionare senza che nessuno abbia toccato nulla.

**Livello 2 — Smoke test post-deploy (GitHub Actions):** scatta ad ogni push su `main`, aspetta 3 minuti che Cloudflare Pages finisca il deploy, poi verifica 11 check in sequenza. Copre la casistica che UptimeRobot non può vedere: "il deploy è andato su ma ha rotto qualcosa". In particolare rileva il bug più grave documentato — il caso in cui un articolo SSR risponde con `[object Object]` invece di HTML (causato dall'attivazione accidentale del flag `nodejs_compat` su CF Pages). Il job non blocca nulla: solo notifica e salva il log.

**Livello 3 — Health endpoint interno (`/api/health`):** viene interrogato sia da UptimeRobot (keyword check) sia da chiunque voglia una diagnosi rapida dello stato. Esegue tre check in parallelo verso Directus — ping, conteggio articoli pubblicati, ultimo numero rivista — e restituisce un JSON strutturato. A differenza di UptimeRobot, distingue tra "tutto ok", "qualcosa è degradato ma il sito regge" e "Directus è down".

**Cosa non copre il sistema:** regressioni visive (layout, font, immagini rotte), qualità del contenuto, performance (Core Web Vitals), comportamento JavaScript client-side. Questa è una scelta consapevole: il sito ha deploy trimestrali legati alle uscite della rivista, e la complessità di uno screenshot comparison con Playwright non è giustificata dalla frequenza dei release.

---

## 2. Configurazione UptimeRobot — istruzioni operative

Registrarsi su [uptimerobot.com](https://uptimerobot.com) con l'account della redazione. Il piano gratuito supporta fino a 50 monitor con intervallo minimo 5 minuti — sufficiente.

Per ogni monitor: Dashboard → New Monitor → tipo indicato → compilare URL, intervallo, alert contacts.

Prima del cutover DNS, usare `https://ombreeluci-staging.pages.dev` al posto di `https://ombreeluci.it`. Dopo il cutover, aggiornare gli URL nei monitor.

| Monitor | URL | Intervallo | Tipo check | Alert |
|---|---|---|---|---|
| CMS ping | `https://cms.ombreeluci.it/server/ping` | 5 min | Keyword: `pong` | Email + Slack |
| Homepage IT | `https://ombreeluci.it/` | 5 min | HTTP 200 | Email + Slack |
| Homepage EN | `https://ombreeluci.it/en/` | 10 min | HTTP 200 | Email |
| Articolo SSR | `https://ombreeluci.it/it/ombre-e-luci/` | 10 min | HTTP 200 | Email |
| Archivio | `https://ombreeluci.it/it/archivio/` | 15 min | HTTP 200 | Email |
| Health endpoint | `https://ombreeluci.it/api/health` | 5 min | Keyword: `"status":"ok"` | Email + Slack |

**Configurare alert contacts:**
- Email: aggiungere `segreteria@fedeeluce.it` come alert contact
- Slack: in UptimeRobot → My Settings → Alert Contacts → Add Alert Contact → tipo Slack → incollare `SLACK_WEBHOOK_URL` (stesso webhook usato da GitHub Actions)

**Nota sul Keyword check:** UptimeRobot per il keyword check verifica che il testo sia presente nel body della risposta. Per l'health endpoint, cercare la stringa letterale `"status":"ok"` (con le virgolette). Se lo status è `degraded`, UptimeRobot segnala errore — questo è il comportamento voluto per avere visibilità rapida su degradamenti.

---

## 3. Come interpretare `/api/health`

L'endpoint risponde sempre con JSON strutturato:

```json
{
  "status": "ok",
  "checks": {
    "directus": "ok",
    "articoli": "ok",
    "ultimo_numero": "ok:oel-173"
  },
  "ts": "2026-05-05T10:30:00.000Z"
}
```

**Campo `status`:**
- `"ok"` — tutto funziona normalmente. HTTP 200.
- `"degraded"` — il sito funziona ma qualcosa non va: Directus risponde ma non come atteso, o il conteggio articoli è anomalo, o non si trova l'ultimo numero. HTTP 200 (UptimeRobot deve poter leggere il body per fare keyword check anche in questo caso).
- `"down"` — Directus non risponde entro 5 secondi. Il sito può ancora funzionare con il fallback snapshot, ma nessun articolo SSR sarà aggiornato. HTTP 503.

**Campo `checks.directus`:**
- `"ok"` — `/server/ping` risponde con `pong`
- `"degraded"` — risponde ma il body non contiene `pong`
- `"down"` — timeout (5s) o errore di rete

**Campo `checks.articoli`:**
- `"ok"` — più di 3000 articoli published (baseline: 3527)
- `"degraded:{n}"` — meno di 3000 articoli (es. `"degraded:42"` indica problema permissions o svuotamento accidentale)
- `"error"` — la query non ha risposto entro 8 secondi o ha ritornato HTTP non-200

**Campo `checks.ultimo_numero`:**
- `"ok:{id}"` — trovato almeno un numero rivista con id_numero valorizzato (es. `"ok:oel-173"`)
- `"missing"` — query ok ma nessun record o id_numero null
- `"error"` — timeout o HTTP non-200

**Quando allarmarsi:**
- `directus: "down"` → agire subito. Vedere RUNBOOK.md § "Incident: Directus/CMS down"
- `articoli: "degraded:..."` con numero molto basso → permissions pubbliche Directus probabilmente svuotate. Vedere RUNBOOK.md § "Incident: Articoli 404 sul sito"
- `ultimo_numero: "missing"` → problema meno urgente, il sito funziona ma la homepage potrebbe mostrare dati datati

**Check manuale:**
```bash
curl https://ombreeluci.it/api/health | jq
# o su staging:
curl https://ombreeluci-staging.pages.dev/api/health | jq
```

---

## 4. Come interpretare i fallimenti del workflow smoke-post-deploy

Il workflow scatta ad ogni push su `main` e produce sempre un artifact con il log completo.

**Dove trovare il log:** GitHub → repository `SegreteriaFL/ombreeluci-astro` → Actions → workflow "Smoke post-deploy" → run corrispondente al push → sezione "Artifacts" → `smoke-log-{run_id}`. Il log è conservato per 7 giorni.

**Check critici vs secondari:**

| Check | Gravità | Descrizione |
|---|---|---|
| c4 — Articolo SSR IT | **Critica** | Se il body inizia con `[object Object]` invece di `<!DOCTYPE`: il flag `nodejs_compat` è attivo su CF Pages e rompe tutti gli endpoint SSR. Rimuoverlo immediatamente (CF Dashboard → Pages → ombreeluci-staging → Settings → Functions → Compatibility flags). |
| c1 — Health endpoint | Alta | Se `/api/health` non risponde o non restituisce `status:ok`, Directus è probabilmente down. |
| c11 — CMS ping | Alta | Directus irraggiungibile — agire come da RUNBOOK.md. |
| c8 — Redirect legacy | Media | I redirect `/blog/` non funzionano — problema middleware o refactor routing. |
| c2, c3 — Homepage IT/EN | Alta | Home non raggiungibile — problema grave di build o routing. |
| c9, c10 — Sitemap | Bassa | La sitemap non è critica per il funzionamento del sito, ma va fixata prima del cutover DNS. |

**Il workflow non blocca il deploy.** Un check fallito non annulla il push su main — è un sistema di notifica, non un gate. Se un check critico fallisce, intervenire manualmente.

---

## 5. Cosa non è coperto e perché

**Qualità visiva (layout, CSS, font rendering):** verificare che un articolo abbia il giusto padding o che il titolo usi Raleway 900 richiederebbe screenshot comparison con Playwright — setup significativo, output fragile (le differenze pixel variano tra runner), manutenzione continua ogni volta che si aggiusta lo stile. Per un sito con deploy legati a uscite trimestrali della rivista, il rapporto complessità/beneficio è sfavorevole. Il controllo visivo viene fatto manualmente su staging prima di ogni deploy significativo.

**Performance (Core Web Vitals, TTFB):** strumenti dedicati come WebPageTest o Lighthouse CI sarebbero più appropriati e sono in backlog (vedi STATO.md § Piano architetturale). Non sono inclusi in questo task perché richiedono configurazione separata e non sono bloccanti per il go-live.

**Comportamento JavaScript client-side:** il megamenu, la ricerca Pagefind, il language switcher — nessuno di questi è verificato. Richiederebbe Playwright o Cypress. Fuori scope per ora.

**Email deliverability, form contatto:** nessun check automatico attivo.

---

## 6. Come estendere il sistema

### Aggiungere un check a `/api/health`

In [src/pages/api/health.ts](../src/pages/api/health.ts):

1. Scrivere una funzione `checkNome(): Promise<string>` con il proprio `AbortController` e timeout. La funzione restituisce sempre una stringa: `'ok'`, `'ok:...'`, `'degraded'`, `'error'`, ecc. Mai eccezioni non gestite.
2. Aggiungere la funzione all'array di `Promise.allSettled`.
3. Aggiungere il risultato all'oggetto `checks` nel JSON di risposta.
4. Decidere se un risultato negativo deve portare `status` a `'degraded'` o a `'down'`. Solo `directus: 'down'` giustifica un 503.

### Aggiungere un check al workflow smoke

In [.github/workflows/smoke-post-deploy.yml](../.github/workflows/smoke-post-deploy.yml):

1. Aggiungere un nuovo step con `id: c{N}` e `continue-on-error: true`.
2. Usare `curl` — nessuna dipendenza da tool aggiuntivi.
3. Aggiungere la riga corrispondente nel riepilogo (`Riepilogo risultati`).
4. Aggiungere la condizione `steps.c{N}.outcome == 'failure'` nella notifica Slack.

### Aggiungere una nuova lingua ai check

Nel workflow smoke, aggiungere check separati per gli URL nella nuova lingua (es. `/es/`, `/es/archivio/`). Nel workflow, duplicare i check 2-3 (homepage) e 6 (archivio) con i nuovi URL. Non modificare `health.ts` — l'health endpoint è indipendente dalla lingua.

In UptimeRobot, aggiungere monitor per homepage e un articolo rappresentativo nella nuova lingua. Intervallo 10-15 minuti è sufficiente per lingue non primarie.
