# Redirect Report — 2026-05-18

## Riepilogo

| Categoria | Numero | % |
|---|---|---|
| **Totale URL analizzati** | **3499** | 100% |
| ✅ OK — redirect coperto | 3403 | 97.3% |
| ⚠️ GAP_COVERED — logica mancante nel middleware (fix facile) | 0 | 0.0% |
| 🔴 MISSING — nessun redirect trovato | 96 | 2.7% |
| 🟠 TO_HOMEPAGE — redirect verso homepage (SEO loss) | 0 | 0.0% |

## Distribuzione per layer

| Layer | URL |
|---|---|
| fix1-year-slug | 2928 |
| fix5-n-short | 169 |
| fix3-project-numero | 129 |
| MISSING | 96 |
| fix3-project-other | 76 |
| fix2-en-year-slug | 54 |
| fix6-insieme | 30 |
| middleware-diario | 8 |
| astro-config | 5 |
| legacy-json | 3 |
| fix3-project-root | 1 |

## ⚠️ GAP_COVERED — logica mancante (da aggiungere al middleware prima del cutover)

Questi URL hanno un redirect valido **concettualmente** ma il layer che lo gestisce
non esiste ancora nel codice. Aggiungere le regex mancanti in `src/middleware.ts`.

(Mostra primi 20 su 0)

| Path WP | Target Astro | Layer mancante |
|---|---|---|


## 🔴 MISSING — URL senza nessun redirect

Questi URL andrebbero a 404 dopo il cutover. Da analizzare e fixare.
(Mostra primi 50 su 96)

| Path WP | Azione suggerita |
|---|---|
| `/promo-natale-2017/` | — |
| `/formazione-giovani/` | — |
| `/argomenti/` | — |
| `/fede-e-luce/` | — |
| `/in-tutto-il-mondo-e-natale/` | — |
| `/iscrizione-newsletter-confermata/` | — |
| `/ciao-stefano-di-franco/` | — |
| `/mariangela-bertolini/` | — |
| `/la-rivista/` | — |
| `/catechesi-e-disabilita/` | — |
| `/noi-papa-un-figlio-disabile/` | — |
| `/sostienici-2019/` | — |
| `/creative-commons/` | — |
| `/contatti/` | — |
| `/order-confirmation/` | — |
| `/order-failed/` | — |
| `/home2022/` | — |
| `/regala-ol/` | — |
| `/il-blog-di-benedetta/` | — |
| `/jeanvanier/` | — |
| `/promocei/` | — |
| `/autismo/` | — |
| `/aktion-t4-sterminio-persone-disabilita/` | — |
| `/articoli/` | — |
| `/en/read-our-stories-in-english/` | — |
| `/en/about/` | — |
| `/en/home-english/` | — |
| `/i-diari-di-ombre-e-luci/` | — |
| `/en/project/` | — |
| `/1974/` | — |
| `/1975/` | — |
| `/affettivita/` | — |
| `/aktiont4/` | — |
| `/archivi/` | — |
| `/archivio-newsletter/` | — |
| `/attualita/` | — |
| `/autismo-cat/` | — |
| `/catechesi/` | — |
| `/cinema-e-disabilita/` | — |
| `/dedicato-ai-bambini/` | — |
| `/disabilita-e-massmedia/` | — |
| `/dopo-di-noi/` | — |
| `/editoriali/` | — |
| `/en/editorials/` | — |
| `/esperienze/` | — |
| `/en/experiences/` | — |
| `/en/faith-and-disability/` | — |
| `/famiglia/` | — |
| `/hisse-et-oh/` | — |
| `/insieme/insieme-giallo/` | — |

## 🟠 TO_HOMEPAGE — redirect verso homepage (SEO loss)

_Nessuno — ottimo!_

---
_Generato da scripts/verify-redirects-local.mjs — simulazione locale, NO HTTP request_
