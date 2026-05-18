# Redirect Report — 2026-05-18

## Riepilogo

| Categoria | Numero | % |
|---|---|---|
| **Totale URL analizzati** | **3499** | 100% |
| ✅ OK — redirect coperto | 16 | 0.5% |
| ⚠️ GAP_COVERED — logica mancante nel middleware (fix facile) | 3134 | 89.6% |
| 🔴 MISSING — nessun redirect trovato | 349 | 10.0% |
| 🟠 TO_HOMEPAGE — redirect verso homepage (SEO loss) | 0 | 0.0% |

## Distribuzione per layer

| Layer | URL |
|---|---|
| GAP-year-slug | 2928 |
| MISSING | 349 |
| GAP-project-numero | 129 |
| GAP-project-other | 76 |
| middleware-diario | 8 |
| astro-config | 5 |
| legacy-json | 3 |
| GAP-project-root | 1 |

## ⚠️ GAP_COVERED — logica mancante (da aggiungere al middleware prima del cutover)

Questi URL hanno un redirect valido **concettualmente** ma il layer che lo gestisce
non esiste ancora nel codice. Aggiungere le regex mancanti in `src/middleware.ts`.

(Mostra primi 20 su 3134)

| Path WP | Target Astro | Layer mancante |
|---|---|---|
| `/2017/il-manuale-della-buona-educazione/` | `/it/il-manuale-della-buona-educazione/` | GAP-year-slug |
| `/1983/intelligenze-prigioniere-intelligences-captives-jacqueline-baillod/` | `/it/intelligenze-prigioniere-intelligences-captives-jacqueline-baillod/` | GAP-year-slug |
| `/1983/terapia-con-il-cavallo/` | `/it/terapia-con-il-cavallo/` | GAP-year-slug |
| `/2017/le-comunita-fede-e-luce-nel-mondo/` | `/it/le-comunita-fede-e-luce-nel-mondo/` | GAP-year-slug |
| `/1983/dialogo-aperto-n-1/` | `/it/dialogo-aperto-n-1/` | GAP-year-slug |
| `/1983/fermatevi-per-ascoltarci/` | `/it/fermatevi-per-ascoltarci/` | GAP-year-slug |
| `/1983/non-temere/` | `/it/non-temere/` | GAP-year-slug |
| `/1983/vita-fede-e-luce-n-2/` | `/it/vita-fede-e-luce-n-2/` | GAP-year-slug |
| `/1983/dialogo-aperto-numero-2/` | `/it/dialogo-aperto-numero-2/` | GAP-year-slug |
| `/1983/quando-il-dolore-bussa-forte/` | `/it/quando-il-dolore-bussa-forte/` | GAP-year-slug |
| `/1983/darti-la-vita/` | `/it/darti-la-vita/` | GAP-year-slug |
| `/1983/la-paralisi-cerebrale-infantile/` | `/it/la-paralisi-cerebrale-infantile/` | GAP-year-slug |
| `/1983/leducazione-religiosa-degli-handicappati-nelle-opere-di-henri-bossonier/` | `/it/leducazione-religiosa-degli-handicappati-nelle-opere-di-henri-bossonier/` | GAP-year-slug |
| `/1983/lassistenza-educativa-al-bambino-con-paralisi-cerebrale-nella-prima-infanzia/` | `/it/lassistenza-educativa-al-bambino-con-paralisi-cerebrale-nella-prima-infanzia/` | GAP-year-slug |
| `/1983/ombre-e-luci-n-4-1983-sfogliabile/` | `/it/ombre-e-luci-n-4-1983-sfogliabile/` | GAP-year-slug |
| `/1983/ombre-e-luci-n-1-1983-sfogliabile/` | `/it/ombre-e-luci-n-1-1983-sfogliabile/` | GAP-year-slug |
| `/2015/scampoli-di-paradiso/` | `/it/scampoli-di-paradiso/` | GAP-year-slug |
| `/1983/il-dolore-innocente-un-handicappato-nella-mia-famiglia/` | `/it/il-dolore-innocente-un-handicappato-nella-mia-famiglia/` | GAP-year-slug |
| `/1983/il-bambino-down-una-guida-per-genitori/` | `/it/il-bambino-down-una-guida-per-genitori/` | GAP-year-slug |
| `/1983/vacanze-con-la-differenza-nel-cuore/` | `/it/vacanze-con-la-differenza-nel-cuore/` | GAP-year-slug |

## 🔴 MISSING — URL senza nessun redirect

Questi URL andrebbero a 404 dopo il cutover. Da analizzare e fixare.
(Mostra primi 50 su 349)

| Path WP | Azione suggerita |
|---|---|
| `/en/2025/the-stories-we-tell/` | — |
| `/en/2017/humanitarian-corridors-a-lifeline-for-refugees-including-those-with-disabilities/` | — |
| `/en/2021/from-that-closet/` | — |
| `/en/1981/three-lives-with-sabina-a-fathers-journey-through-darkness-hope-and-love/` | — |
| `/en/1998/mother-teresa-of-calcutta-dedicated-to-children-and-to-all-of-us/` | — |
| `/en/2023/i-met-the-scooppiati-diversamente-band-and-interviewed-them/` | — |
| `/en/2025/22-fun-mini-games-to-play-together/` | — |
| `/en/1994/interactive-games-unforgettable-group-fun/` | — |
| `/en/2014/lourdes-a-miracle-of-encounter/` | — |
| `/en/2025/i-almost-gave-up/` | — |
| `/en/2022/fanny-who-sees-a-future-for-herself/` | — |
| `/en/2021/beyond-labels-what-lies-beneath-adjectives/` | — |
| `/en/2023/bologna-to-rome-pedaling-possibilities-in-the-rainbow-communitys-tandem-journey/` | — |
| `/en/2020/museum-for-all/` | — |
| `/en/2005/we-are-dads-of-disabled-children-a-different-way-of-love/` | — |
| `/en/1990/faith-and-light-a-journey-of-hope-beyond-disabilities/` | — |
| `/en/2001/and-a-star-lights-up-from-fear-to-hope-navigating-a-changed-world-since-september-11/` | — |
| `/en/2022/transforming-lives-a-journey-of-hope-and-healing-in-the-heart-of-the-congo/` | — |
| `/en/2007/journey-of-unchanged-affection-celebrating-24-years-of-faith-and-light/` | — |
| `/en/2023/to-leave-or-to-stay-migration-in-the-films-of-venice-80/` | — |
| `/en/2025/my-son-has-friends/` | — |
| `/en/2025/padel-for-autism-a-game-where-everyone-wins/` | — |
| `/en/2025/two-ways-of-pilgrimage-one-heart-of-faith/` | — |
| `/en/2025/diving-into-stories-but-never-alone/` | — |
| `/en/2025/inclusive-catechesis-when-faith-becomes-tactile/` | — |
| `/en/2025/faith-and-light-at-fifty-a-journey-still-burning-bright/` | — |
| `/en/2025/a-fathers-camino-walking-side-by-side-with-my-autistic-son/` | — |
| `/en/2025/pilgrims-on-film-sacred-journeys-from-lourdes-to-mecca/` | — |
| `/en/2025/working-at-the-restaurant-is-always-fun/` | — |
| `/en/2025/i-made-this-movie-for-him-not-for-myself/` | — |
| `/en/2025/a-holiday-at-europing-an-accessible-paradise-in-tarquinia/` | — |
| `/en/2025/breaking-barriers-my-journey-as-an-autistic-actor/` | — |
| `/en/2025/freedom-has-no-age/` | — |
| `/en/2025/between-voices-and-signs-when-language-shapes-connection/` | — |
| `/en/2025/disney-my-way-a-summer-camp-full-of-joy-and-friendship/` | — |
| `/en/2025/a-light-in-pompei-a-journey-of-faith-and-friendship/` | — |
| `/en/2025/edith-stein-and-the-courage-of-knowledge/` | — |
| `/en/2026/stars-in-the-spotlight-stories-in-the-shadows-three-films-at-the-torino-film-festival/` | — |
| `/en/2026/stopping-choosing-making-a-difference/` | — |
| `/en/2026/dialogo-aperto-letters-n-172/` | — |
| `/en/2026/a-thousand-colors-on-stage-communities-in-motion-at-pompei/` | — |
| `/en/2026/no-longer-alone-a-mothers-journey-with-fede-e-luce/` | — |
| `/en/2026/in-the-storm-yet-not-alone/` | — |
| `/en/2026/the-magnificat-and-our-fragility/` | — |
| `/en/2026/when-waiting-becomes-encounter/` | — |
| `/en/2026/when-an-encounter-changes-everything/` | — |
| `/en/2026/growing-up-with-my-brother/` | — |
| `/en/2026/a-place-for-everyone-work-dignity-and-autism-at-autelier/` | — |
| `/en/2026/making-cinema-heard-accessibility-and-hearing-loss-at-the-rome-film-festival/` | — |
| `/en/2026/me-in-pompei/` | — |

## 🟠 TO_HOMEPAGE — redirect verso homepage (SEO loss)

_Nessuno — ottimo!_

---
_Generato da scripts/verify-redirects-local.mjs — simulazione locale, NO HTTP request_
