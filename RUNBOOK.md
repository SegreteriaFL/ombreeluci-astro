# OEL CMS — Runbook Operativo

> **Ultima sync repo→server**: 2026-04-07 · commit `07a672db` · owner: Claude/SegreteriaFL
> Copia autoritativa: repo (`RUNBOOK.md`). Il file sul server (`/opt/oel-cms/RUNBOOK.md`) viene
> aggiornato automaticamente da GitHub Actions ad ogni push su `main`.

---

## Stack
- **VPS**: Hetzner CX22, Ubuntu 24.04, IP 159.69.196.64
- **CMS**: Directus 11.16.1 in Docker, porta 8055 (bind: 127.0.0.1 only)
- **DB**: PostgreSQL 16 (pgvector), volume Docker `oel-cms_postgres_data`
- **Tunnel**: cloudflared → cms.ombreeluci.it
- **Frontend**: Astro + Cloudflare Pages (repo: SegreteriaFL/ombreeluci-astro)

---

## Accesso SSH
```bash
ssh -i ~/.ssh/claude_oel_key root@159.69.196.64
# Chiave: ~/.ssh/claude_oel_key (Ed25519)
# Pubkey: ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFHzbarbqC8BAziJAM+8Xh0lyfYNaBftN0UJ4+JyfEO9
```

Se bloccato fuori (porta 22 chiusa): Hetzner Cloud Console → Server → Enable Rescue → Reboot

---

## Comandi di verifica
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

## Backup

### Database PostgreSQL
- **Script**: `/usr/local/bin/oel-backup-db.sh`
- **Frequenza**: giornaliero 03:00 UTC (systemd timer `oel-backup-db.timer`)
- **Destinazione**: R2 `oel-media/backups/postgres/`
- **Retention locale**: 7 giorni in `/var/backups/oel-postgres/`
- **Retention R2**: 30 giorni

### Volumi Docker + Config
- **Script**: `/usr/local/bin/oel-backup-volumes.sh`
- **Frequenza**: domenica 04:00 UTC (`oel-backup-volumes.timer`)
- **Destinazione**: R2 `oel-media/backups/` (uploads sync + config tar)

### Backup manuale
```bash
/usr/local/bin/oel-backup-db.sh
/usr/local/bin/oel-backup-volumes.sh
```

---

## Restore database

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

## Incident: Directus/CMS down

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

---

## Incident: Articoli 404 sul sito

Causa più probabile: permissions pubblica Directus svuotata.

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

Poi trigga rebuild CF Pages (vedi sotto).

---

## Trigger build manuale CF Pages
```bash
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/6b071de7f55397ada5645e187c932202/pages/projects/ombreeluci-staging/deployments" \
  -H "Authorization: Bearer CF_API_TOKEN"
```

---

## Rotazione token (ogni 3 mesi)

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

## Versioni pinnate
- Directus: `11.16.1` — in `/opt/oel-cms/docker-compose.yml`
- PostgreSQL: `pgvector/pgvector:pg16`
- Upgrade: test su staging → aggiorna compose → `docker compose pull && docker compose up -d`

---

## Monitoring e alert

Documentazione completa in `docs/MONITORING.md`.

### Canali di alert attivi

| Canale | Trigger | Configurazione |
|---|---|---|
| Slack (webhook) | Build nightly fallita (`nightly-build.yml`) | Secret `SLACK_WEBHOOK_URL` su GitHub Actions |
| Slack (webhook) | Smoke post-deploy: check falliti (`smoke-post-deploy.yml`) | Stesso secret `SLACK_WEBHOOK_URL` |
| Email + Slack | UptimeRobot: CMS ping, Homepage IT, Health endpoint | ⚠️ da configurare su uptimerobot.com |
| Email | UptimeRobot: Homepage EN, Articolo SSR, Archivio | ⚠️ da configurare su uptimerobot.com |

### Verifica manuale stato del sistema

```bash
# Staging
curl https://ombreeluci-staging.pages.dev/api/health | jq

# Produzione (dopo cutover DNS)
curl https://ombreeluci.it/api/health | jq
```

Il campo `status` restituisce `"ok"`, `"degraded"` o `"down"`. Vedere `docs/MONITORING.md` § "Come interpretare /api/health" per il dettaglio di ogni campo.

### Silenziare temporaneamente gli alert UptimeRobot (manutenzione pianificata)

1. Accedere a [uptimerobot.com](https://uptimerobot.com)
2. Dashboard → selezionare i monitor da silenziare (checkbox)
3. Bulk Actions → Pause monitors
4. Al termine della manutenzione: stessa procedura → Resume monitors

In alternativa, per silenziare solo gli alert senza stoppare il monitoring:
Dashboard → monitor → Edit → Alert Contacts → rimuovere temporaneamente i contatti → Save.

### Log smoke post-deploy

Ogni run del workflow `smoke-post-deploy.yml` produce un artifact con il log completo (retention 7 giorni).
GitHub → SegreteriaFL/ombreeluci-astro → Actions → "Smoke post-deploy" → run → Artifacts → `smoke-log-{run_id}`.
