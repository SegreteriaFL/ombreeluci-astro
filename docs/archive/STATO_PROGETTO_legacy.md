# Stato Progetto Ombre e Luci — Astro

> ⚠️ **Documento storico (legacy snapshot).**
> Per lo stato corrente e le decisioni attive usare:
> - `PROGRESS.md` (stato operativo)
> - `docs/I18N_MASTER_PLAN.md` (architettura i18n ufficiale)
> - `TRADUZIONI.md` (pipeline traduzioni AI)

**Ultimo aggiornamento:** 13 aprile 2026 (allineamento con stato reale deploy)

---

## Stato attuale: storico (fare riferimento a PROGRESS)

### Allineamento rapido 2026-04-13

- Deploy operativo per redazione promosso su `main` con fix UI articolo:
  - `63452786` (box ruolo editoriale visibile + primo fix share bar)
  - `e3330693` (layout share rail)
  - `0a803168` (share rail a bordo sinistro viewport)
- Lavoro i18n piu' ampio e in corso resta su branch `feat/i18n-shell` (fonte ufficiale: `PROGRESS.md`).
- Per verifiche funzionali usare `https://ombreeluci-staging.pages.dev` e non i preview hash branch.

---

## Stato attuale: operativo

### Sito principale

- **Deploy:** Cloudflare Pages — output statico, build verde
- **URL:** https://www.ombreeluci.it (o dominio Cloudflare Pages)
- **Articoli pubblicati:** 3.488 articoli pre-renderizzati
- **Body articoli:** rigenerati da sorgente JSON (`html_pulito`) — 2.585 file aggiornati
- **Adapter:** nessuno (rimosso — output static puro, nessun SSR Worker)

### CMS redazione

- **Deploy:** Cloudflare Worker standalone `keystatic-oel`
- **URL:** https://keystatic-oel.bold-firefly-5209.workers.dev/keystatic
- **Stato:** operativo — login GitHub → editing → commit automatico su main
- **Articoli nuovi:** salvati in `src/content/blog/NUOVI/{slug}.md`

---

## Da fare

### Priorità alta

- [ ] **Verifica visiva articoli dopo rigenerazione body** — spot check su un campione di articoli per verificare che la formattazione Markdown sia corretta (nessun residuo HTML grezzo, paragrafi corretti, grassetti/corsivi intatti)

### Bug content noti (da catalogare e correggere)

- [ ] **Bio autore duplicata** — in alcune pagine autore la bio appare due volte
- [ ] **Related box fuori posto** — il box "Leggi anche" appare in posizioni errate su alcuni articoli
- [ ] **Residui HTML** — alcuni articoli mostrano tag HTML grezzi nel testo (`&lt;br&gt;`, `<p>` ecc.)

### SEO

- [ ] **Redirect SEO da implementare** — gli URL WordPress (`/ANNO/MESE/GIORNO/slug/`) non reindirizzano agli URL Astro (`/blog/slug/`); da implementare in `_redirects` o via `astro.config.mjs`

### Redazione

- [ ] **Accesso redazione da configurare** — i redattori devono avere un account GitHub con accesso write al repo `SegreteriaFL/ombreeluci-astro` per usare Keystatic; da inviare gli inviti

---

## Architettura deployment

| Componente | Piattaforma | Note |
|---|---|---|
| Sito principale | Cloudflare Pages (static) | Build su push a `main` |
| CMS redazione | Cloudflare Worker (`keystatic-oel`) | Deploy manuale da `keystatic-oel/` |
| Repo contenuti | GitHub `SegreteriaFL/ombreeluci-astro` | Branch `main` |
| Database articoli | `src/data/articoli_megacluster.json` | 3.488 articoli, built localmente |

---

## Note architettura

Il sito usa output **statico puro** dopo un tentativo fallito con `output: 'hybrid'` + adapter Cloudflare. Il bundle SSR con 3.488 articoli pre-renderizzati superava i limiti di dimensione dei Cloudflare Pages Functions ("Unknown internal error" al deploy). Il ritorno a static ha risolto il problema.

Il CMS è tenuto separato intenzionalmente per evitare di rimettere SSR nel progetto principale.
