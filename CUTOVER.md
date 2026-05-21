Leggi WORKING.md, STATO.md, INFRASTRUTTURA.md.

Crea il file docs/CUTOVER.md con esattamente questo contenuto:

---

# Checklist cutover DNS — ombreeluci.it

---

## FASE 0 — Preparazione (giorni prima)

### Codice e contenuti

- [ ] B-15 noindex SWEEP — rimuovere `noindex={true}` da tutte le pagine e aprire `robots.txt`. Commit su main ma NON pushare ancora — va pushato contestualmente al cambio DNS
- [ ] B-16 Sitemap completa — aggiornare `sitemap.xml.ts` con articoli EN, numeri archivio, pagine autore, pagine EN
- [ ] Verificare che la pagina 404 personalizzata esista e funzioni su staging
- [ ] Test M-01→M-07 — verifica visiva mobile con la redazione completata

### Email (critico — rischio principale)

- [ ] Identificare il provider email attuale di `redazione@ombreeluci.it`
- [ ] Annotare i record MX attuali esatti: `dig MX ombreeluci.it`
- [ ] Confermare che i record MX possono essere ricreati su Cloudflare identici

### Analytics

- [ ] Verificare che il data stream GA4 sia configurato per `ombreeluci.it` e non per staging
- [ ] Verificare che GTM non stia già tracciando staging con la proprietà produzione

### Iubenda

- [ ] Verificare che il banner cookie appaia correttamente su staging
- [ ] Aggiornare i domini in Iubenda dashboard per includere `ombreeluci.it`
- [ ] Verificare che Privacy Policy e Cookie Policy puntino a URL `ombreeluci.it`
- [ ] Verificare che il form newsletter abbia link Privacy Policy funzionante

### Cloudflare — setup preliminare

- [ ] Aggiungere dominio `ombreeluci.it` su Cloudflare (se non già fatto)
- [ ] Importare tutti i record DNS attuali da Aruba (Cloudflare lo fa automaticamente)
- [ ] Verificare che i record MX siano importati correttamente
- [ ] Aggiungere record CNAME per Pages: `ombreeluci.it` → `ombreeluci-staging.pages.dev`
- [ ] Aggiungere record A per CMS: `cms.ombreeluci.it` → `159.69.196.64` (DNS-only, grey cloud)
- [ ] Aggiungere redirect www: `www.ombreeluci.it` → `ombreeluci.it` via Redirect Rule

---

## FASE 1 — Giorno del cutover (T-2h)

### Verifica staging finale

- [ ] `curl -sI https://ombreeluci-staging.pages.dev/` → 200
- [ ] `curl -sI https://ombreeluci-staging.pages.dev/it/ombre-e-luci/` → 200, body inizia con `<!DOCTYPE`
- [ ] `curl -sI https://ombreeluci-staging.pages.dev/it/archivio/` → 200
- [ ] `curl -s https://cms.ombreeluci.it/server/ping` → `{"data":"pong"}`
- [ ] Homepage visiva su staging — tutto ok

### Avvisa

- [ ] Avvisa la redazione: "sito in manutenzione per ~30 minuti"
- [ ] Banner manutenzione su WP (opzionale)

---

## FASE 2 — Il cutover (T=0)

Eseguire in questo ordine esatto.

### Step 1 — Push noindex SWEEP su main

```bash
git push origin main
```

Attendi deploy CF Pages (~3 minuti). Verifica build verde su CF Pages Dashboard.

### Step 2 — Cambia nameserver su Aruba

Aruba → gestione dominio `ombreeluci.it` → nameserver → sostituisci con nameserver Cloudflare (visibili in Cloudflare Dashboard → DNS → nameservers del dominio).

Propagazione: 5 minuti → 48 ore. Di solito 15-30 minuti.

### Step 3 — Aggiungi dominio custom su CF Pages

Cloudflare Dashboard → Pages → ombreeluci-staging → Custom domains → aggiungi `ombreeluci.it` e `www.ombreeluci.it`.

### Step 4 — Verifica CF Worker

Nel worker `ombreeluci-redirects` verifica che la route sia corretta per `ombreeluci.it`. La catena deve essere: `DNS → Worker → Pages`.

### Step 5 — Verifica propagazione

```bash
dig NS ombreeluci.it
# deve mostrare nameserver Cloudflare

curl -sI https://ombreeluci.it/
# deve rispondere 200 (non il vecchio WP Aruba)

curl -sI https://ombreeluci.it/it/ombre-e-luci/
# deve rispondere 200, body inizia con <!DOCTYPE

curl -sI https://www.ombreeluci.it/
# deve rispondere 301 → https://ombreeluci.it/
```

---

## FASE 3 — Subito dopo propagazione (T+30min)

### Verifica email (critico)

- [ ] Invia email di test a `redazione@ombreeluci.it` — arriva?
- [ ] Se non arriva: verifica record MX su Cloudflare DNS → devono essere identici a quelli Aruba originali

### Verifica sito

- [ ] Homepage `https://ombreeluci.it/` — visiva OK
- [ ] Articolo SSR `https://ombreeluci.it/it/ombre-e-luci/` — OK
- [ ] Archivio `https://ombreeluci.it/it/archivio/` — OK
- [ ] CMS `https://cms.ombreeluci.it` — accessibile
- [ ] Redirect legacy: `curl -sI https://ombreeluci.it/blog/uno-slug-vecchio/` → 301 verso `/it/`
- [ ] noindex rimosso: `curl -s https://ombreeluci.it/ | grep -i "noindex"` → zero risultati

### UptimeRobot — aggiorna URL monitor

```bash
# Aggiorna i 6 monitor da staging a produzione via API UptimeRobot
# IDs: 802995114, 802995136, 802995137, 802995138, 802995139, 802995143
# Sostituisci ombreeluci-staging.pages.dev con ombreeluci.it
# Istruzioni complete in docs/MONITORING.md
```

### Mailchimp SPF/DKIM

- [ ] Mailchimp Dashboard → Account → Domains → verifica `ombreeluci.it`
- [ ] Aggiungi i record DKIM e SPF forniti da Mailchimp su Cloudflare DNS
- [ ] Attendi verifica (~10 minuti)
- [ ] Test: iscrizione newsletter → email arriva in inbox, non in spam

---

## FASE 4 — Nelle ore successive (T+2h)

### Google Search Console

- [ ] Aggiungi proprietà `ombreeluci.it` in Search Console
- [ ] Verifica proprietà via record TXT su Cloudflare DNS (metodo più semplice)
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
| Stato task e blockers pre-cutover | `STATO.md` |
| Infrastruttura, IP, secrets | `INFRASTRUTTURA.md` |
| Monitoring e UptimeRobot | `docs/MONITORING.md` |
| Incident playbook post-cutover | `RUNBOOK.md` |
| Worker redirect catena DNS | `WORKING.md` § Regole routing |

---

*Documento creato 2026-05-14. Aggiornare se cambiano IP, worker, o provider email.*

---

Dopo aver creato il file:
- Aggiorna README.md aggiungendo nella tabella documentazione:
  `| Checklist cutover DNS | docs/CUTOVER.md |`
- Aggiorna STATO.md aggiungendo B-15 e B-16 come blockers pre-cutover
- Commit su main: "docs: CUTOVER.md checklist cutover DNS completa"