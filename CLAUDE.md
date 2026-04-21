# Regole architetturali — Ombre e Luci

Queste regole valgono per ogni sessione. Hanno precedenza su qualsiasi comportamento di default.

---

## Struttura IT/EN — regola fondamentale

**Quando una pagina EN ha struttura identica o analoga a una pagina IT esistente, si estrae prima il layout in un componente condiviso. Mai copiare markup tra pagine.**

Flusso corretto:
1. Esiste una pagina IT con un layout → se serve la versione EN, si crea `src/components/NomePageContent.astro`
2. La pagina IT viene riscritta per usare il componente
3. La pagina EN usa lo stesso componente con `lang="en"` e `basePath="/en"`
4. Qualsiasi cambio futuro al layout si fa nel componente — si propaga a entrambe le versioni automaticamente

Esempio già fatto: `CategoriaPageContent.astro` usato da `/categoria/[categoria].astro` e `/en/category/[slug].astro`.

**Fatto:**
- `ArticlePageLayout.astro` — CSS condiviso IT+EN via `is:global`. Entrambe le pagine articolo lo usano invece di `BaseLayout`. Il CSS è l'unica fonte di verità.
- Resto del template (logica dati, script) rimane nei file pagina — sono sufficientemente diversi (SSG vs SSR, script "leggi anche" solo IT).

---

## CSS — regola assoluta

- Usare classi globali esistenti (`.container`, `.site-main`) — mai classi custom orfane
- Mai `style="..."` inline su elementi strutturali — usare classi CSS
- Mai blocchi `<style>` locali per utility già coperte dal CSS globale
- I `<style>` locali sono accettati solo per componenti che non hanno equivalente globale

---

## Branch strategy

- Lavoro sperimentale su branch dedicato, mai direttamente su `main`
- `main` deve essere sempre deployabile
- Push su `main` solo dopo conferma utente che l'obiettivo è raggiunto

---

## Git push

- `git push` solo dopo conferma esplicita dell'utente che il risultato è OK
- Non pushare automaticamente dopo ogni fix

---

## Approccio ai fix

- Prima analisi, poi fix — mai "fix a caso di cane"
- Documentare e testare ogni step prima di procedere al successivo
- Se si scopre un debito tecnico durante un fix, segnalarlo senza toccarlo (a meno che blocchi il fix corrente)
- Per bug di dati (es. campi null): verificare prima se il problema è nel codice o nei dati prima di scrivere codice

---

## Internazionalizzazione (i18n)

- Tutte le label UI visibili all'utente passano per `t(lang, key)` in `src/utils/i18n.ts`
- Le categorie usano `localizeCategory(slug, lang)` — non stringhe hardcoded
- I componenti accettano `lang: Locale` prop e lo passano a tutti i figli
- Le pagine EN passano sempre `lang="en"` a `BaseLayout` — senza di esso Header/Footer restano in italiano
- **Tag**: il campo `nome_en` non esiste ancora in Directus. Le tag sono nascoste nelle pagine EN (display:none con TODO comment). Non aggiungere mapping hardcoded.

---

## CI/CD — note operative

- **Nightly rebuild** (02:00 UTC): triggera rebuild CF Pages via Deploy Hook (`CF_DEPLOY_HOOK` secret). NON usare l'endpoint API `POST /pages/projects/{name}/deployments` — non funziona per progetti Git-connected (restituisce `success=false`).
- **Update snapshot** (lunedì 01:00 UTC): rigenera `src/data/articoli_snapshot.json` via Directus API. Richiede secret `DIRECTUS_TOKEN`.
- Per aggiungere un nuovo trigger CF Pages schedulato: usare sempre Deploy Hook, non l'API REST.

---

## Componenti condivisi esistenti

| Componente | Usato da |
|---|---|
| `CategoriaPageContent.astro` | `/categoria/[categoria].astro`, `/en/category/[slug].astro` |
| `ArticoliRullo.astro` | `/tag/[slug].astro`, `/en/tag/[slug].astro`, altre sezioni |
| `ArticleCard.astro` | ovunque — accetta `lang` e `basePath` |
| `ArticlePageLayout.astro` | `/blog/[...slug].astro`, `/en/[slug].astro` — CSS articolo via `is:global` |
| `BaseLayout.astro` | tutte le pagine — accetta `lang`, `alternateArticleUrl` |
