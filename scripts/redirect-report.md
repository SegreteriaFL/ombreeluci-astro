# Redirect Report — 2026-05-18

## Riepilogo

| Categoria | Numero | % |
|---|---|---|
| **Totale URL analizzati** | **3499** | 100% |
| ✅ OK — redirect coperto | 3493 | 99.8% |
| ⚠️ GAP_COVERED — logica mancante nel middleware (fix facile) | 0 | 0.0% |
| 🔴 MISSING — nessun redirect trovato | 0 | 0.0% |
| 🟠 TO_HOMEPAGE — redirect verso homepage (SEO loss) | 6 | 0.2% |

## Distribuzione per layer

| Layer | URL |
|---|---|
| fix1-year-slug | 2928 |
| fix5-n-short | 169 |
| fix3-project-numero | 129 |
| legacy-json | 99 |
| fix3-project-other | 76 |
| fix2-en-year-slug | 54 |
| fix6-insieme | 30 |
| middleware-diario | 8 |
| astro-config | 5 |
| fix3-project-root | 1 |

## ⚠️ GAP_COVERED — logica mancante (da aggiungere al middleware prima del cutover)

Questi URL hanno un redirect valido **concettualmente** ma il layer che lo gestisce
non esiste ancora nel codice. Aggiungere le regex mancanti in `src/middleware.ts`.

(Mostra primi 20 su 0)

| Path WP | Target Astro | Layer mancante |
|---|---|---|


## 🔴 MISSING — URL senza nessun redirect

_Nessuno — ottimo!_

## 🟠 TO_HOMEPAGE — redirect verso homepage (SEO loss)

Questi URL vengono redirectati alla homepage invece che al contenuto specifico.

| Path WP | Target attuale |
|---|---|
| `/in-tutto-il-mondo-e-natale/` | `/` |
| `/home2022/` | `/` |
| `/en/read-our-stories-in-english/` | `/en/` |
| `/en/home-english/` | `/en/` |
| `/news/` | `/` |
| `/en/senza-categoria-en/` | `/en/` |

---
_Generato da scripts/verify-redirects-local.mjs — simulazione locale, NO HTTP request_
