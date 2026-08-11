# OEL — Runbook Operativo e Infrastruttura

> **Ultima sync repo→server**: 2026-04-07 · commit `07a672db` · owner: Claude/SegreteriaFL
> Copia autoritativa: repo (`RUNBOOK.md`). Il file sul server (`/opt/oel-cms/RUNBOOK.md`) viene
> aggiornato automaticamente da GitHub Actions (`sync-runbook.yml`) ad ogni push su `main`.
> **Non rinominare/spostare questo file** — il workflow copia esattamente `RUNBOOK.md` dalla root del repo.

Questo file unifica quello che prima erano tre documenti separati (`RUNBOOK.md`, `INFRASTRUTTURA.md`, `docs/MONITORING.md`), consolidati il 2026-08-10 perché si sovrapponevano parzialmente e tendevano a divergere. Vedi `docs/archive/INFRASTRUTTURA_legacy.md` e `docs/archive/MONITORING_legacy.md` per le versioni originali.

## Indice

1. [Architettura](#1-architettura)
2. [Stack](#2-stack)
3. [File chiave nel repo](#3-file-chiave-nel-repo)
4. [Accesso SSH](#4-accesso-ssh)
5. [Comandi di verifica](#5-comandi-di-verifica)
6. [Backup](#6-backup)
7. [Restore database](#7-restore-database)
8. [Rotazione token (ogni 3 mesi)](#8-rotazione-token-ogni-3-mesi)
9. [Versioni](#9-versioni)
10. [Media (immagini)](#10-media-immagini)
11. [Credenziali e secrets](#11-credenziali-e-secrets)
12. [Monitoring — architettura a 3 livelli](#12-monitoring--architettura-a-3-livelli)
13. [Configurazione UptimeRobot](#13-configurazione-uptimerobot)
14. [Come interpretare `/api/health`](#14-come-interpretare-apihealth)
15. [Come interpretare i fallimenti dello smoke test](#15-come-interpretare-i-fallimenti-dello-smoke-test)
16. [Incident playbook](#16-incident-playbook)
17. [Come estendere il sistema di monitoring](#17-come-estendere-il-sistema-di-monitoring)
18. [Swap (VPS)](#18-swap-vps)
19. [Evidence — ultimo stato verificato](#19-evidence--ultimo-stato-verificato)
20. [GitHub Actions — workflow attivi](#20-github-actions--workflow-attivi)

---

## 1. Architettura

```
Redazione (browser)
    │
    ▼
cms.ombreeluci.it ──────────────────────────────────────────────────────┐
    │ (Cloudflare Tunnel → cloudflared su VPS)                          │
    ▼                                                                   │
Directus v11 (localhost:8055 su VPS Hetzner)                           │
    │                                                                   │
    ├── PostgreSQL 16 (volume Docker: postgres_data)                   │
    └── File uploads (volume Docker: directus_uploads → sync su R2)    │
                                                                        │
ombreeluci.it / ombreeluci-staging.pages.dev                          │
    │ (Cloudflare Pages — frontend statico + SSR su CF Workers)        │
    ▼                                                                   │
Astro 4.15 (output: hybrid)                                            │
    ├── Pagine statiche: build-time fetch da Directus ◄─────────────────┘
    │   Fallback: src/data/articoli_snapshot.json (se Directus down)
    └── Pagine SSR: /blog/[slug] — fetch Directus a runtime
        Cache-Control: s-maxage=3600, stale-while-revalidate=86400

Media (immagini):
    Directus → R2 bucket oel-media → CDN Cloudflare R2 pub URL
    URL: https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev/
```

**Nota (2026-08-10):** questo diagramma descrive l'architettura con il CF Worker `ombreeluci-redirects` ancora davanti a Pages per `ombreeluci.it`. Vedi `DECISIONE-STAGING.md` per il piano di migrazione (Fase 2) che elimina questo layer.

---

## 2. Stack

| Componente | Dettaglio | Dove |
|---|---|---|
| Frontend | Astro 4.15, output hybrid, `@astrojs/cloudflare` v11 | Cloudflare Pages |
| CMS | Directus 11.16.1 | Docker su VPS |
| Database | PostgreSQL 16 (pgvector) | Docker su VPS |
| VPS | Hetzner CX22, Ubuntu 24.04 | IP: 159.69.196.64 |
| Tunnel CMS | cloudflared (systemd) | VPS |
| Media | R2 bucket `oel-media` | Cloudflare R2 |
| Repo | SegreteriaFL/ombreeluci-astro | GitHub |
| Build | Cloudflare Pages (trigger: push main + nightly GH Action) | CF |
| Ricerca | Pagefind (build-time index) | Bundle statico |

---

## 3. File chiave nel repo

```
src/
├── lib/
│   ├── directus.ts          # Layer dati — tutti i fetch da Directus
│   └── articoli-build.ts    # Wrapper build-time con fallback snapshot
├── data/
│   └── articoli_snapshot.json  # Fallback 3527 articoli (aggiornato ogni lunedì)
├── pages/
│   ├── index.astro          # Homepage (prerender)
│   ├── blog/[...slug].astro # Articolo (SSR, s-maxage=3600)
│   ├── categoria/[c].astro  # Categoria (prerender)
│   ├── autori/[slug].astro  # Autore (prerender)
│   ├── archivio/[issue].astro # Numero rivista (prerender)
│   └── sitemap.xml.ts       # Sitemap dinamica (prerender)
└── config/
    └── taxonomy.js          # Struttura temi/categorie/ruoli editoriali
.github/workflows/
├── smoke-post-deploy.yml    # Push main → 11 check staging + Slack alert
├── nightly-build.yml        # Build notturna 02:00 UTC + Slack alert
├── update-snapshot.yml      # Aggiorna snapshot lunedì 01:00 UTC
└── sync-runbook.yml         # Push main → copia questo file su VPS
```

---

## 4. Accesso SSH

```bash
ssh -i ~/.ssh/claude_oel_key root@159.69.196.64
# Chiave: ~/.ssh/claude_oel_key (Ed25519)
# Pubkey: ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFHzbarbqC8BAziJAM+8Xh0lyfYNaBftN0UJ4+JyfEO9
```

Se bloccato fuori (porta 22 chiusa): Hetzner Cloud Console → Server → Enable Rescue → Reboot.

---

## 5. Comandi di verifica

```bash
# Stato container
docker compose -f /opt/oel-cms/docker-compose.yml ps

# Health Directus
curl -s http://localhost:8055/server/ping

# Ultimo backup DB
ls -lht /var/backups/oel-postgres/ | head -3

# Log backup
tail -20 /var/log/oel-backup.log

# Systemd timers attivi
systemctl list-timers oel-backup*
```

---

## 6. Backup

| Cosa | Frequenza | Destinazione | Script |
|---|---|---|---|
| PostgreSQL dump | Giornaliero 03:00 UTC (`oel-backup-db.timer`) | R2 `oel-media/backups/postgres/` | `/usr/local/bin/oel-backup-db.sh` |
| Volumi Docker + config | Domenica 04:00 UTC (`oel-backup-volumes.timer`) | R2 `oel-media/backups/` (uploads sync + config tar) | `/usr/local/bin/oel-backup-volumes.sh` |

Retention: 7 giorni locale (`/var/backups/oel-postgres/`), 30 giorni su R2.

Backup manuale:
```bash
/usr/local/bin/oel-backup-db.sh
/usr/local/bin/oel-backup-volumes.sh
```

---

## 7. Restore database

1. **Scarica dump da R2**:
```bash
rclone copy r2:oel-media/backups/postgres/pgdump_oel_YYYYMMDD_HHMMSS.dump.gz /tmp/
```

2. **Stop Directus** (non DB):
```bash
cd /opt/oel-cms && docker compose stop directus
```

3. **Restore**:
```bash
zcat /tmp/pgdump_oel_*.dump.gz | docker exec -i oel-cms-database-1 \
  pg_restore -U directus -d directus --clean --if-exists --no-owner -Fc
```

4. **Riavvia**:
```bash
cd /opt/oel-cms && docker compose up -d
```

5. **Verifica**: `curl -s http://localhost:8055/server/ping` → `{"data":"pong"}`

---

## 8. Rotazione token (ogni 3 mesi)

### Directus token
```bash
# 1. Genera nuovo token
NEW_TOKEN=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

# 2. Imposta su Directus
TOKEN=$(curl -s -X POST http://localhost:8055/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"info@fedeeluce.it","password":"ADMIN_PASSWORD"}' | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['data']['access_token'])")

curl -s -X PATCH "http://localhost:8055/users/93c154ca-372c-4f94-8a35-e0fe66850780" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$NEW_TOKEN\"}"

# 3. Aggiorna TUTTI E TRE i consumer (in ordine — dimenticarne uno = articoli 404)

# a) .env locale
sed -i "s|DIRECTUS_TOKEN=.*|DIRECTUS_TOKEN=$NEW_TOKEN|" ~/.../ombreeluci-astro/.env

# b) CF Pages env vars (RUNTIME SSR — il più critico per il sito live)
curl -s -X PATCH \
  "https://api.cloudflare.com/client/v4/accounts/6b071de7f55397ada5645e187c932202/pages/projects/ombreeluci-staging" \
  -H "Authorization: Bearer CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"deployment_configs\":{\"production\":{\"env_vars\":{\"DIRECTUS_TOKEN\":{\"value\":\"$NEW_TOKEN\",\"type\":\"secret_text\"}}},\"preview\":{\"env_vars\":{\"DIRECTUS_TOKEN\":{\"value\":\"$NEW_TOKEN\",\"type\":\"secret_text\"}}}}}"

# c) GitHub Actions secret (per nightly build e update-snapshot)
echo -n "$NEW_TOKEN" | gh secret set DIRECTUS_TOKEN -R SegreteriaFL/ombreeluci-astro --body -

# 4. Verifica
curl -s "https://cms.ombreeluci.it/items/articoli?limit=1" \
  -H "Authorization: Bearer $NEW_TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d.get('data') else 'FAIL')"
```

### R2 token (rclone)
```bash
# 1. Genera nuovo token su Cloudflare R2 dashboard
# 2. Aggiorna /root/.config/rclone/rclone.conf
# 3. Aggiorna .env locale (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)
# 4. Verifica: rclone lsd r2:oel-media
```

---

## 9. Versioni

| Componente | Versione pinnata | Dove |
|---|---|---|
| Directus | `11.16.1` | `/opt/oel-cms/docker-compose.yml` |
| PostgreSQL | `pgvector/pgvector:pg16` | `/opt/oel-cms/docker-compose.yml` |

**Quando aggiornare:**
- Directus: al rilascio di minor/patch stabili (2-3 settimane dopo release)
- PostgreSQL: solo major version con migration guide
- Astro/`@astrojs/cloudflare`: con test build locale prima

**Procedura upgrade:** test su staging → aggiorna `docker-compose.yml` → `docker compose pull && docker compose up -d` → verifica health.

---

## 10. Media (immagini)

- Dimensione massima upload in Directus: configurare `MAX_PAYLOAD_SIZE=50mb` in `docker-compose.yml`.
- Ottimizzazione: Cloudflare Image Resizing disponibile su piano Pro. Attualmente non attivo — le immagini vengono servite full-size da R2.
- Cache R2: aggiungere `Cache-Control: public, max-age=31536000, immutable` via CF Transform Rule (PF-02 in backlog).
- Formato consigliato per upload: WebP o JPEG, max 2MB per copertine articoli.
- Immagini inline nel corpo articoli: su R2 in `corpo/{uuid}`, src aggiornati in Directus.

---

## 11. Credenziali e secrets

> I valori **non** sono qui. Sono in:
> - `.env` (locale, non committato)
> - `.env.local` (locale, non committato)
> - GitHub Secrets (repo SegreteriaFL/ombreeluci-astro): `CF_ACCOUNT_ID`, `CF_API_TOKEN`, `DIRECTUS_TOKEN`
> - `/root/.config/rclone/rclone.conf` sul server (R2 access key)

**Rotazione token**: ogni 3 mesi — procedura completa nella sezione 8 qui sopra.

---

## 12. Monitoring — architettura a 3 livelli

> Ultima revisione contenuto: 2026-05-05 (MONITORING-01), consolidato qui 2026-08-10.

Il monitoring è organizzato su tre livelli che si sovrappongono parzialmente ma coprono scenari distinti.

**Livello 1 — UptimeRobot (esterno):** controlla il sito da fuori, come farebbe un visitatore reale. Rileva failure che persistono nel tempo: CMS down, homepage irraggiungibile, certificato SSL scaduto, Cloudflare Pages in errore. Non sa nulla di deploy o contenuto — sa solo che un URL risponde o non risponde. È il livello che manda un alert alle 3 di notte se il sito smette di funzionare senza che nessuno abbia toccato nulla.

**Livello 2 — Smoke test post-deploy (GitHub Actions):** scatta ad ogni push su `main`, aspetta 3 minuti che Cloudflare Pages finisca il deploy, poi verifica 11 check in sequenza. Copre la casistica che UptimeRobot non può vedere: "il deploy è andato su ma ha rotto qualcosa". In particolare rileva il bug più grave documentato — il caso in cui un articolo SSR risponde con `[object Object]` invece di HTML (causato dall'attivazione accidentale del flag `nodejs_compat` su CF Pages, vedi sezione 16). Il job non blocca nulla: solo notifica e salva il log.

**Livello 3 — Health endpoint interno (`/api/health`):** viene interrogato sia da UptimeRobot (keyword check) sia da chiunque voglia una diagnosi rapida dello stato. Esegue tre check in parallelo verso Directus — ping, conteggio articoli pubblicati, ultimo numero rivista — e restituisce un JSON strutturato. A differenza di UptimeRobot, distingue tra "tutto ok", "qualcosa è degradato ma il sito regge" e "Directus è down".

**Cosa non copre il sistema, e perché (scelta consapevole):**
- **Qualità visiva** (layout, CSS, font rendering): screenshot comparison con Playwright avrebbe setup significativo e output fragile (le differenze pixel variano tra runner). Per un sito con deploy legati a uscite trimestrali della rivista, il rapporto complessità/beneficio è sfavorevole. Controllo visivo fatto manualmente su staging prima di ogni deploy significativo.
- **Performance** (Core Web Vitals, TTFB): strumenti dedicati (WebPageTest, Lighthouse CI) sarebbero più appropriati, in backlog — non bloccanti per il funzionamento del sito.
- **Comportamento JavaScript client-side** (megamenu, ricerca Pagefind, language switcher): richiederebbe Playwright/Cypress. Fuori scope per ora.
- **Email deliverability, form contatto**: nessun check automatico attivo.

---

## 13. Configurazione UptimeRobot

Account: uptimerobot.com, redazione. Piano gratuito, fino a 50 monitor, intervallo minimo 5 minuti.

Per ogni monitor: Dashboard → New Monitor → tipo indicato → compilare URL, intervallo, alert contacts.

**Monitor attivi (aggiornati al cutover 2026-05-21, tutti su produzione):**

| Monitor | URL | Strumento/ID | Intervallo | Tipo check | Alert | Stato |
|---|---|---|---|---|---|---|
| CMS ping | `https://cms.ombreeluci.it/server/ping` | UptimeRobot 802995136 | 5 min | Keyword: `pong` | Email + Slack | ✅ attivo |
| Homepage IT | `https://ombreeluci.it/` | UptimeRobot 802995114 | 5 min | HTTP 200 | Email + Slack | ✅ attivo |
| Homepage EN | `https://ombreeluci.it/en/` | UptimeRobot 802995137 | 10 min | HTTP 200 | Email | ✅ attivo |
| Articolo SSR | `https://ombreeluci.it/it/ombre-e-luci/` | UptimeRobot 802995138 | 10 min | HTTP 200 | Email | ✅ attivo |
| Archivio | `https://ombreeluci.it/it/archivio/` | UptimeRobot 802995139 | 15 min | HTTP 200 | Email | ✅ attivo |
| Health endpoint | `https://ombreeluci.it/api/health` | UptimeRobot 802995143 | 5 min | Keyword: `"status":"ok"` | Email + Slack | ✅ attivo |
| Smoke post-deploy (11 check) | produzione | GitHub Actions | ad ogni push main | — | Slack | ✅ attivo |

**Configurare alert contacts:**
- Email: `segreteria@fedeeluce.it` come alert contact.
- Slack: UptimeRobot → My Settings → Alert Contacts → Add Alert Contact → tipo Slack → incollare `SLACK_WEBHOOK_URL` (stesso webhook usato da GitHub Actions).

**Nota sul Keyword check:** per l'health endpoint, cercare la stringa letterale `"status":"ok"` (con le virgolette). Se lo status è `degraded`, UptimeRobot segnala errore — comportamento voluto, per avere visibilità rapida su degradamenti.

**Silenziare temporaneamente gli alert (manutenzione pianificata):**
1. uptimerobot.com → Dashboard → selezionare i monitor (checkbox) → Bulk Actions → Pause monitors.
2. Al termine: stessa procedura → Resume monitors.
3. In alternativa, per silenziare solo gli alert senza stoppare il monitoring: Dashboard → monitor → Edit → Alert Contacts → rimuovere temporaneamente i contatti → Save.

---

## 14. Come interpretare `/api/health`

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

**Campo `checks.directus`:** `"ok"` (`/server/ping` risponde `pong`) · `"degraded"` (risponde ma senza `pong` nel body) · `"down"` (timeout 5s o errore di rete).

**Campo `checks.articoli`:** `"ok"` (più di 3000 articoli published, baseline 3527) · `"degraded:{n}"` (meno di 3000, es. `"degraded:42"` indica problema permissions o svuotamento accidentale) · `"error"` (query non risposta entro 8s o HTTP non-200).

**Campo `checks.ultimo_numero`:** `"ok:{id}"` (trovato un numero con id_numero valorizzato) · `"missing"` (query ok ma nessun record o id_numero null) · `"error"` (timeout o HTTP non-200).

**Quando allarmarsi:**
- `directus: "down"` → agire subito, vedere sezione 16 "Incident: Directus/CMS down".
- `articoli: "degraded:..."` con numero molto basso → permissions pubbliche Directus probabilmente svuotate, vedere sezione 16 "Incident: Articoli 404 sul sito".
- `ultimo_numero: "missing"` → problema meno urgente, il sito funziona ma la homepage potrebbe mostrare dati datati.

**Check manuale:**
```bash
curl https://ombreeluci.it/api/health | jq
# o su staging:
curl https://ombreeluci-staging.pages.dev/api/health | jq
```

---

## 15. Come interpretare i fallimenti dello smoke test

Il workflow `smoke-post-deploy.yml` scatta ad ogni push su `main` e produce sempre un artifact con il log completo. **Dove trovare il log:** GitHub → `SegreteriaFL/ombreeluci-astro` → Actions → "Smoke post-deploy" → run corrispondente → "Artifacts" → `smoke-log-{run_id}` (conservato 7 giorni).

**Check critici vs secondari:**

| Check | Gravità | Descrizione |
|---|---|---|
| c4 — Articolo SSR IT | **Critica** | Se il body inizia con `[object Object]` invece di `<!DOCTYPE`: il flag `nodejs_compat` è attivo su CF Pages e rompe tutti gli endpoint SSR. Rimuoverlo immediatamente (CF Dashboard → Pages → ombreeluci-staging → Settings → Functions → Compatibility flags). |
| c1 — Health endpoint | Alta | Se `/api/health` non risponde o non restituisce `status:ok`, Directus è probabilmente down. |
| c11 — CMS ping | Alta | Directus irraggiungibile — agire come da sezione 16. |
| c8 — Redirect legacy | Media | I redirect `/blog/` non funzionano — problema middleware o refactor routing. |
| c2, c3 — Homepage IT/EN | Alta | Home non raggiungibile — problema grave di build o routing. |
| c9, c10 — Sitemap | Bassa | Non critica per il funzionamento del sito, ma va fixata prima di eventi di indicizzazione importanti. |

**Il workflow non blocca il deploy.** Un check fallito non annulla il push su main — è un sistema di notifica, non un gate. Se un check critico fallisce, intervenire manualmente.

---

## 16. Incident playbook

### Directus/CMS down
```bash
# 1. Controlla stato
docker compose -f /opt/oel-cms/docker-compose.yml ps

# 2. Leggi log
docker compose -f /opt/oel-cms/docker-compose.yml logs --tail=50 directus

# 3. Riavvia
cd /opt/oel-cms && docker compose up -d

# 4. Verifica tunnel
systemctl status cloudflared
```

### CMS inaccessibile (Error 1033, tunnel)
1. SSH al server: `systemctl status cloudflared`.
2. Se crashed: `systemctl restart cloudflared`.
3. Se containers down: `cd /opt/oel-cms && docker compose up -d`.

### Articoli 404 su tutto il sito
Causa più probabile: permissions pubblica Directus svuotata.

1. Verifica Directus: `curl https://cms.ombreeluci.it/server/ping` → deve rispondere `{"data":"pong"}`.
2. Se Directus OK ma 404 → permissions pubbliche perse, esegui il fix:
```bash
TOKEN=$(curl -s -X POST http://localhost:8055/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"info@fedeeluce.it","password":"ADMIN_PASSWORD"}' | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['data']['access_token'])")

PUBLIC_POLICY="abf8a154-5b1c-4a46-ac9c-7300570f4f17"
for COL in articoli autori numeri_rivista categorie categorie_articoli commenti; do
  curl -s -X POST "http://localhost:8055/permissions" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"policy\":\"$PUBLIC_POLICY\",\"collection\":\"$COL\",\"action\":\"read\",\"fields\":[\"*\"]}"
done
```
3. Se Directus down → vedi "Directus/CMS down" sopra.
4. Dopo il fix: trigga rebuild CF Pages (sezione sotto).

### Server irraggiungibile via SSH
1. Hetzner Cloud Console → Server → Enable Rescue Mode → Reboot.
2. SSH con password rescue → monta `/dev/sda1` → aggiusta il problema.
3. Reboot normale.

### Build fallita su CF Pages
1. Controlla log GitHub Actions.
2. Se Directus down durante build: la build usa lo snapshot automaticamente (non fallisce).
3. Se errore TypeScript/build: guarda il log su CF Pages Dashboard.

### Trigger build manuale CF Pages
```bash
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/6b071de7f55397ada5645e187c932202/pages/projects/ombreeluci-staging/deployments" \
  -H "Authorization: Bearer CF_API_TOKEN"
```

---

## 17. Come estendere il sistema di monitoring

### Aggiungere un check a `/api/health`
In [src/pages/api/health.ts](src/pages/api/health.ts):
1. Scrivere una funzione `checkNome(): Promise<string>` con il proprio `AbortController` e timeout. Restituisce sempre una stringa: `'ok'`, `'ok:...'`, `'degraded'`, `'error'`, ecc. — mai eccezioni non gestite.
2. Aggiungere la funzione all'array di `Promise.allSettled`.
3. Aggiungere il risultato all'oggetto `checks` nel JSON di risposta.
4. Decidere se un risultato negativo deve portare `status` a `'degraded'` o a `'down'`. Solo `directus: 'down'` giustifica un 503.

### Aggiungere un check al workflow smoke
In [.github/workflows/smoke-post-deploy.yml](.github/workflows/smoke-post-deploy.yml):
1. Aggiungere un nuovo step con `id: c{N}` e `continue-on-error: true`.
2. Usare `curl` — nessuna dipendenza da tool aggiuntivi.
3. Aggiungere la riga corrispondente nel riepilogo ("Riepilogo risultati").
4. Aggiungere la condizione `steps.c{N}.outcome == 'failure'` nella notifica Slack.

### Aggiungere una nuova lingua ai check
Nel workflow smoke, duplicare i check homepage e archivio con i nuovi URL (es. `/es/`, `/es/archivio/`). Non modificare `health.ts` — l'health endpoint è indipendente dalla lingua. In UptimeRobot, aggiungere monitor per homepage e un articolo rappresentativo nella nuova lingua (10-15 minuti di intervallo è sufficiente per lingue non primarie).

---

## 18. Swap (VPS)

Il VPS CX22 non ha swap configurato (verificato 2026-05-17). Con traffico reale, monitorare la RAM available. Se scende sotto 500MB per più di 10 minuti consecutivi, aggiungere swap:

```bash
ssh -i ~/.ssh/claude_oel_key root@159.69.196.64

fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

Verifica: `free -h` → deve mostrare 2GB swap.

**Quando farlo:** solo se RAM available < 500MB con traffico reale. Non farlo preventivamente — il disco è limitato (38GB totali, 23% usato).

---

## 19. Evidence — ultimo stato verificato

> Aggiornare questa sezione ad ogni check manuale, con data + owner. Commit del repo come traccia immutabile.

### Backup DB PostgreSQL
| Campo | Valore |
|---|---|
| Data | 2026-04-07 06:09 UTC |
| Owner | Claude / SegreteriaFL |
| File | `pgdump_oel_20260407_060841.dump.gz` |
| Size | 79 MB |
| SHA-256 (primi 16 char) | `e1d3ad46eed5b35a` |
| Destinazione R2 | `oel-media/backups/postgres/` |

### Restore test
| Campo | Valore |
|---|---|
| Data | 2026-04-07 |
| Owner | Claude / SegreteriaFL |
| Metodo | Container PostgreSQL temporaneo (`pg_restore_test`) |
| Tabelle ripristinate | 42 |
| Righe `directus_activity` | 62.343 |
| Esito | ✅ OK |

### Fix e interventi sul server

| Data | Owner | Intervento | Esito |
|---|---|---|---|
| 2026-05-17 | Claude / SegreteriaFL | Fix health check Directus: `localhost` → `127.0.0.1` in `/opt/oel-cms/docker-compose.yml`. False negative da 29 giorni (FailingStreak 83.891), nessun impatto operativo. Container ricreato con `docker compose up -d --no-deps directus`. | ✅ Status: healthy, FailingStreak: 0 |

---

## 20. GitHub Actions — workflow attivi

> Prima di aggiungerne di nuovi verificare che non esista già uno con funzione analoga in `.github/workflows/`.

| Workflow | Trigger | Cosa fa |
|---|---|---|
| `smoke-post-deploy.yml` | push main | Attende deploy CF Pages (~3 min), esegue 11 check su staging (health, homepage IT/EN, articolo SSR, archivio, redirect legacy, sitemap, CMS ping), Slack alert su failure, artifact log 7 giorni |
| `nightly-build.yml` | cron 02:00 UTC | Build notturna completa + Slack alert |
| `update-snapshot.yml` | cron lunedì 01:00 UTC | Aggiorna `src/data/articoli_snapshot.json` (fallback build-time) |
| `sync-runbook.yml` | push main | Copia questo file (`RUNBOOK.md`) su VPS via SSH |
