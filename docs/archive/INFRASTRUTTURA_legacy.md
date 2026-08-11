> **ARCHIVIATO 2026-08-10** — contenuto consolidato in `RUNBOOK.md` (repo root). Conservato solo per riferimento storico, non aggiornare.

# Ombre e Luci — Infrastruttura e Operatività

## Come gira tutto

```
Redazione (browser)
    │
    ▼
cms.ombreeluci.it  ──────────────────────────────────────────────────────┐
    │ (Cloudflare Tunnel → cloudflared su VPS)                           │
    ▼                                                                    │
Directus v11 (localhost:8055 su VPS Hetzner)                            │
    │                                                                    │
    ├── PostgreSQL 16 (volume Docker: postgres_data)                    │
    └── File uploads (volume Docker: directus_uploads → sync su R2)     │
                                                                        │
                                                                        │
ombreeluci.it / ombreeluci-staging.pages.dev                           │
    │ (Cloudflare Pages — frontend statico + SSR su CF Workers)         │
    ▼                                                                    │
Astro 4.15 (output: hybrid)                                             │
    ├── Pagine statiche: build-time fetch da Directus ◄──────────────────┘
    │   Fallback: src/data/articoli_snapshot.json (se Directus down)
    └── Pagine SSR: /blog/[slug] — fetch Directus a runtime
        Cache-Control: s-maxage=3600, stale-while-revalidate=86400

Media (immagini):
    Directus → R2 bucket oel-media → CDN Cloudflare R2 pub URL
    URL: https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev/
```

---

## Stack dettagliato

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

## File chiave nel repo

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
└── sync-runbook.yml         # Push main → copia RUNBOOK.md su VPS
```

---

## Media (immagini)

### Limiti e policy immagini

- Dimensione massima upload in Directus: configurare `MAX_PAYLOAD_SIZE=50mb` in docker-compose.yml
- Ottimizzazione: Cloudflare Image Resizing disponibile su piano Pro. Attualmente non attivo — le immagini vengono servite full-size da R2.
- Cache R2: aggiungere `Cache-Control: public, max-age=31536000, immutable` via CF Transform Rule (PF-02 in backlog).
- Formato consigliato per upload: WebP o JPEG, max 2MB per copertine articoli.
- Immagini inline nel corpo articoli: su R2 in `corpo/{uuid}`, src aggiornati in Directus.

---

## Backup

| Cosa | Frequenza | Dove | Script |
|---|---|---|---|
| PostgreSQL dump | Giornaliero 03:00 UTC | R2 `backups/postgres/` | `/usr/local/bin/oel-backup-db.sh` |
| Volumi Docker + config | Domenica 04:00 UTC | R2 `backups/uploads/` + `backups/volumes/` | `/usr/local/bin/oel-backup-volumes.sh` |

Retention: 30 giorni su R2, 7 giorni locali.
Restore testato: 2026-04-07 (42 tabelle, 62k righe activity).
Runbook completo: `/opt/oel-cms/RUNBOOK.md` sul server.

---

## Credenziali e secrets

> I valori **non** sono qui. Sono in:
> - `.env` (locale, non committato)
> - `.env.local` (locale, non committato)
> - GitHub Secrets (repo SegreteriaFL/ombreeluci-astro): `CF_ACCOUNT_ID`, `CF_API_TOKEN`, `DIRECTUS_TOKEN`
> - `/root/.config/rclone/rclone.conf` sul server (R2 access key)

**Rotazione token**: ogni 3 mesi. Procedura in `/opt/oel-cms/RUNBOOK.md`.

---

## Monitoring da configurare

- **UptimeRobot** (gratuito): istruzioni complete di configurazione in `docs/MONITORING.md` § "Configurazione UptimeRobot"
- **Slack alert build**: aggiungere secret `SLACK_WEBHOOK_URL` su GitHub → Actions (usato anche dal workflow `smoke-post-deploy.yml`)

---

## Incident playbook

### Articoli 404 su tutto il sito
1. Verifica Directus: `curl https://cms.ombreeluci.it/server/ping` → deve rispondere `{"data":"pong"}`
2. Se Directus OK ma 404: permissions pubblica perse → esegui fix in RUNBOOK.md
3. Se Directus down: SSH → `cd /opt/oel-cms && docker compose up -d`
4. Dopo fix: trigga rebuild CF Pages

### CMS inaccessibile (Error 1033 tunnel)
1. SSH al server: `systemctl status cloudflared`
2. Se crashed: `systemctl restart cloudflared`
3. Se containers down: `cd /opt/oel-cms && docker compose up -d`

### Server irraggiungibile via SSH
1. Hetzner Cloud Console → Server → Enable Rescue Mode → Reboot
2. SSH con password rescue → monta `/dev/sda1` → aggiusta il problema
3. Reboot normale

### Build fallita su CF Pages
1. Controlla GH Actions log
2. Se Directus down durante build: la build usa snapshot automaticamente (non fallisce)
3. Se errore TypeScript/build: guarda log CF Pages Dashboard

---

## Evidence — ultimo stato verificato

> Aggiornare questa sezione ad ogni check manuale, con data + owner (chi ha verificato).
> Commit del repo come traccia immutabile.

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

### Monitor attivi

Istruzioni di configurazione complete in `docs/MONITORING.md`.
**Aggiornato al cutover 2026-05-21:** tutti i monitor puntano a produzione.

| Monitor | URL produzione | Strumento | Intervallo | Alert | Stato |
|---|---|---|---|---|---|
| CMS ping | `cms.ombreeluci.it/server/ping` | UptimeRobot (ID 802995136) | 5 min | Email | ✅ attivo |
| Homepage IT | `https://ombreeluci.it/` | UptimeRobot (ID 802995114) | 5 min | Email | ✅ attivo |
| Homepage EN | `https://ombreeluci.it/en/` | UptimeRobot (ID 802995137) | 10 min | Email | ✅ attivo |
| Articolo SSR | `https://ombreeluci.it/it/ombre-e-luci/` | UptimeRobot (ID 802995138) | 10 min | Email | ✅ attivo |
| Archivio | `https://ombreeluci.it/it/archivio/` | UptimeRobot (ID 802995139) | 15 min | Email | ✅ attivo |
| Health endpoint | `https://ombreeluci.it/api/health` | UptimeRobot (ID 802995143) | 5 min | Email | ✅ attivo |
| Smoke post-deploy (11 check) | produzione | GitHub Actions | ad ogni push main | Slack | ✅ attivo |

---

## GitHub Actions — workflow attivi

> Prima di aggiungerne di nuovi verificare che non esista già uno con funzione analoga in `.github/workflows/`.

| Workflow | Trigger | Cosa fa |
|---|---|---|
| `smoke-post-deploy.yml` | push main | Attende deploy CF Pages (~3 min), esegue 11 check su staging (health, homepage IT/EN, articolo SSR, archivio, redirect legacy, sitemap, CMS ping), Slack alert su failure, artifact log 7 giorni |
| `nightly-build.yml` | cron 02:00 UTC | Build notturna completa + Slack alert |
| `update-snapshot.yml` | cron lunedì 01:00 UTC | Aggiorna `src/data/articoli_snapshot.json` (fallback build-time) |
| `sync-runbook.yml` | push main | Copia `RUNBOOK.md` su VPS via SSH |

---

## Versioni da aggiornare (con cautela)

Processo upgrade: test su staging → update `docker-compose.yml` → `docker compose pull && docker compose up -d` → verifica health.

Quando aggiornare:
- Directus: al rilascio di minor/patch stabili (2-3 settimane dopo release)
- PostgreSQL: solo major version con migration guide
- Astro/`@astrojs/cloudflare`: con test build locale prima
