> **Contesto:** vedere `docs/PRE-CUTOVER-ANALYSIS.md` per l'analisi completa dei rischi e lo stato aggiornato.
> **Aggiornamento 2026-05-21:** cutover completato. Sito live su `https://ombreeluci.it`. Restano UptimeRobot, Mailchimp DKIM/SPF, e revoca token CF temporaneo.

---

# Checklist cutover SEO — ombreeluci.it — venerdì 22 maggio

---

## FASE 0 — Preparazione ✅ COMPLETATA

### Codice e contenuti

- [x] B-15 noindex SWEEP — branch `fix/cutover-noindex` pronto, commit `171ff27d`
- [x] B-16 Sitemap completa — `f6ddc5aa` (IT 4089 URL, EN 4068 URL)
- [x] Iubenda banner in `BaseHead.astro` — `c19943fd`
- [x] GA4 G-2TJV78DNFQ in `BaseHead.astro` — `edac44e5`
- [x] PUBLIC_SITE_URL in CF Pages env vars (produzione)

### Email

- [x] Provider email: Aruba Mail
- [x] Record MX: `10 mx.ombreeluci.it.` → 8 IP Aruba (62.149.128.x). SPF: `include:aruba.it`
- [x] TTL: ~300s (già su Cloudflare)

### Analytics / Iubenda

- [x] GA4 snippet in BaseHead (G-2TJV78DNFQ)
- [x] Iubenda banner in BaseHead (siteId 1433329, cookiePolicyId 66379072)

### Cloudflare

- [x] Dominio `ombreeluci.it` su Cloudflare — zone `active`
- [x] NS Cloudflare attivi: `dana.ns.cloudflare.com`, `julio.ns.cloudflare.com`
- [x] Record MX presenti in CF DNS zone
- [x] Worker `ombreeluci-redirects` attivo su `ombreeluci.it/*`
- [x] Redirect temporaneo apex→www nel Worker (mantiene WP visibile fino a venerdì)

---

## FASE 1 — Verifica pre-lancio (T-1h)

```bash
curl -sI https://ombreeluci.it/ | head -1          # → 301 (redirect temporaneo apex→www)
curl -sI https://ombreeluci-staging.pages.dev/it/ombre-e-luci/ | head -1  # → 200
curl -s https://cms.ombreeluci.it/server/ping      # → pong
```

---

## FASE 2 — Il cutover SEO (T=0) — sequenza obbligatoria

> **Cutover in corso — 2026-05-21.** `ombreeluci.it` serve già Astro (200 OK).
> `www.ombreeluci.it` ancora su WordPress Aruba — redirect 301 da creare in CF Dashboard (Step 4).

**I nameserver sono già su Cloudflare. Questa fase abilita l'indicizzazione.**

- [x] Step 1 — Redirect temporaneo apex→www rimosso dal Worker ✅ 2026-05-21
- [x] Step 3 — Custom domain `ombreeluci.it` attivato in CF Pages ✅ 2026-05-21
- [x] Step 2 — Merge `fix/cutover-noindex` + fix canonical `astro.config.mjs` ✅ 2026-05-21
- [x] Step 4 — CF Redirect Rule www→apex 301 ✅ 2026-05-21
- [x] Step 5 — Verifica propagazione ✅ sito live, 200 OK su home + articoli + archivio
- [x] Step 6 — GSC: proprietà `https://ombreeluci.it/` aggiunta, sitemap IT e EN inviate ✅ 2026-05-21

### Step 1 — Rimuovi redirect temporaneo apex→www dal Worker

```bash
# In cf-worker/redirect-worker.js: rimuovere la regola temporanea apex→www
# poi:
cd cf-worker && npx wrangler deploy
```

Verifica immediata: `curl -sI https://ombreeluci.it/` deve rispondere **200** (non più 301).

### Step 2 — Merge fix/cutover-noindex su main

```bash
git checkout main
git merge fix/cutover-noindex
git push origin main
```

Attendi build CF Pages verde (~3 minuti). Verifica:
```bash
curl -s https://ombreeluci.it/ | grep -i "noindex"  # deve essere vuoto
curl -s https://ombreeluci.it/robots.txt             # deve mostrare Disallow: (vuoto)
```

### Step 3 — Attiva custom domain in CF Pages

Cloudflare Dashboard → Pages → `ombreeluci-staging` → Custom domains → attiva `ombreeluci.it` e `www.ombreeluci.it`.

### Step 4 — Crea CF Redirect Rule www→apex

Cloudflare Dashboard → Zone `ombreeluci.it` → Rules → Redirect Rules:
- Match: `www.ombreeluci.it/*`
- Redirect: `https://ombreeluci.it/{1}` — 301 permanente

Verifica: `curl -sI https://www.ombreeluci.it/` → deve rispondere `301` → `https://ombreeluci.it/`

### Step 5 — Verifica sito live

```bash
curl -sI https://ombreeluci.it/                    # → 200
curl -sI https://ombreeluci.it/it/ombre-e-luci/    # → 200, <!DOCTYPE
curl -sI https://ombreeluci.it/it/archivio/         # → 200
curl -sI https://www.ombreeluci.it/                # → 301 → ombreeluci.it
```

---

## FASE 3 — Subito dopo propagazione (T+30min)

### Verifica email (critico)

- [ ] Invia email di test a `redazione@ombreeluci.it` — arriva?
- [ ] Se non arriva: verifica record MX su Cloudflare DNS → devono essere identici a quelli Aruba originali

### Verifica sito

- [x] Homepage `https://ombreeluci.it/` — visiva OK ✅
- [x] Articolo SSR `https://ombreeluci.it/it/ombre-e-luci/` — OK ✅
- [x] Archivio `https://ombreeluci.it/it/archivio/` — OK ✅
- [x] CMS `https://cms.ombreeluci.it` — accessibile ✅
- [x] Redirect legacy: check 3500 URL WP → 99.97% OK (3499/3500) ✅ 2026-05-21
- [x] noindex rimosso ✅ — Iubenda banner con categorie attivo ✅

### UptimeRobot — aggiorna URL monitor

```bash
# Aggiorna i 6 monitor da staging a produzione via API UptimeRobot
# IDs: 802995114, 802995136, 802995137, 802995138, 802995139, 802995143
# Sostituisci ombreeluci-staging.pages.dev con ombreeluci.it
# Istruzioni complete in docs/MONITORING.md
```

> **Nota:** gli URL target in MONITORING.md §2 puntano già a `ombreeluci.it`.
> Aggiornare direttamente dal dashboard UptimeRobot → ogni monitor → Edit → URL.
> Oppure via API con la chiave in My Settings → API Settings.

### Mailchimp SPF/DKIM

- [ ] Mailchimp Dashboard → Account → Domains → verifica `ombreeluci.it`
- [ ] Aggiungi i record DKIM e SPF forniti da Mailchimp su Cloudflare DNS
- [ ] Attendi verifica (~10 minuti)
- [ ] Test: iscrizione newsletter → email arriva in inbox, non in spam

---

## FASE 4 — Nelle ore successive (T+2h)

### Google Search Console (Step 6 del cutover)

- [ ] Aggiungi proprietà `https://ombreeluci.it` in Search Console
  (la proprietà esiste già — verificare se basta aggiungere la versione https)
- [ ] Verifica proprietà via record TXT su Cloudflare DNS
- [ ] Invia sitemap IT: `https://ombreeluci.it/sitemap.xml`
- [ ] Invia sitemap EN: `https://ombreeluci.it/sitemap-en.xml`
- [ ] Se esiste proprietà SC del vecchio WP: imposta Change of Address tool

### PF-02 — Cache-Control R2

- [ ] Cloudflare R2 → bucket `oel-media` → Settings → Custom domain → aggiungi `media.ombreeluci.it`
- [ ] Crea Cache Rule: `media.ombreeluci.it/*` → `Cache-Control: public, max-age=31536000, immutable`
- [ ] Aggiorna URL immagini da `pub-2251dc2142e3492a961f629f2af543d0.r2.dev` a `media.ombreeluci.it` (script batch da scrivere)

### Verify redirects

```bash
BASE_URL=https://ombreeluci.it node scripts/verify-redirects.mjs
```

Report atteso: fail < 5%. Se no: lista URL rotti → fix urgenti.

### Algolia test produzione

- [ ] Modifica un articolo in Directus → cerca su `https://ombreeluci.it` → appare aggiornato entro 10 secondi

---

## FASE 5 — Giorno dopo (T+24h)

- [ ] Search Console → Coverage → Google sta indicizzando?
- [ ] Speed test PageSpeed su `https://ombreeluci.it` — benchmark reale
- [ ] Verifica anti-spam: iscrizione newsletter → email arriva in inbox
- [ ] UAT-PULIZIA — elimina utente `redazione-uat@ombreeluci.it` (reassegna file all'admin UUID `93c154ca`)
- [ ] Avvisa la redazione: sito live, istruzioni operative
- [ ] Aggiorna STATO.md: cutover completato, data, note

---

## Rollback d'emergenza

I due rollback sono indipendenti — puoi fare uno senza l'altro.

### Rollback DNS (entro 1 ora dal cutover)

Ripristina i nameserver Aruba originali sul pannello Aruba → il vecchio WP torna online entro 30 minuti.

### Rollback codice

```bash
git revert HEAD  # reverte il commit noindex SWEEP
git push origin main
# CF Pages rebuilda — noindex torna attivo su staging
```

---

## Riferimenti

| Cosa | Dove |
|------|------|
| Analisi rischi e piano di lavoro pre-cutover | `docs/PRE-CUTOVER-ANALYSIS.md` |
| Stato task e blockers pre-cutover | `STATO.md` |
| Infrastruttura, IP, secrets | `INFRASTRUTTURA.md` |
| Monitoring e UptimeRobot | `docs/MONITORING.md` |
| Incident playbook post-cutover | `RUNBOOK.md` |
| Worker redirect catena DNS | `WORKING.md` § Regole routing |

---

*Documento creato 2026-05-14. Aggiornare se cambiano IP, worker, o provider email.*
