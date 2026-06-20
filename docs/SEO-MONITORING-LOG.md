# Log monitoraggio SEO/uptime/redirect — Ombre e Luci

> Log settimanale generato dal check automatico. Entry più recente in alto.
> Per l'architettura generale del monitoring vedi [MONITORING.md](MONITORING.md).
> Tool usato: `scripts/gsc-query.mjs` (Search Analytics), UptimeRobot API, `scripts/verify-redirects.mjs`.

---

## 2026-06-20 — check manuale sessione interattiva

**Stato generale:** sano, crescita confermata. Record impressioni.

- **GSC Search Analytics (21/5→18/6):** impressioni in crescita costante 739→3.500+/giorno (picco 4.162 il 16/6, record). Click 7→46/giorno. Posizione media migliorata a 9.9. CTR stabile ~1.3%. Nessun impatto residuo dall'outage DNS 8-10/6.
- **Top pagine:** "22 mini giochi da fare insieme" (106 click, 7.601 impressioni), "14 giochi da fare insieme" (44 click), homepage (31 click, CTR 11.6%), "The Crown cugine autismo" (22 click). Pagine autore e categorie in crescita.
- **EN emergente:** `/en/authors/anna-cece/` con 2.000 impressioni (3 click). Homepage EN 19 impressioni, 2 click. Primi segnali di indicizzazione EN.
- **Trailing slash duplicati:** GSC mostra URL con e senza trailing slash come pagine separate (es. `/it/categoria/cultura` e `/it/categoria/cultura/`). Il Worker Rule R dovrebbe fare 301 — da verificare che il redirect funzioni lato server; potrebbe essere un artefatto GSC storico pre-fix.
- **Uptime (15/6→20/6):** non verificato (UPTIMEROBOT_API_KEY non in .env.local su questa macchina). Da aggiungere per prossimi check.

**Confronto con check precedente (15/6):**
- Impressioni: 3.049 → 3.500+/giorno (+15%)
- Click: 47 → 46/giorno (stabile)
- Posizione: 10.1 → 9.9 (migliorata)

---

## 2026-06-15 — check settimanale

**Stato generale:** sano (uptime e redirect perfetti). GSC non verificato per un problema tecnico del cron, vedi nota.

- **GSC Search Analytics:** ❌ check non eseguito — il file di credenziali `.secrets/ombreeluci-seo-1ede0e05d5b6.json` (locale, gitignored) non è presente nell'ambiente di esecuzione del cron. Da risolvere per i prossimi check automatici.
- **Uptime (8/6→15/6):** tutti i 6 monitor UP, 0 eventi down/up nell'ultima settimana. Settimana pulita (dopo il recovery dall'outage DNS dell'8/6).
- **Redirect legacy (produzione, 1096 voci):** 1096/1096 OK, fail rate 0%. Miglioramento rispetto al baseline 21/5 (1095/1097 — i 2 fail su URL spam non-Latini non risultano più tra le voci attuali).

**Attività proposte:**
1. Decidere come rendere disponibile la credenziale GSC nell'ambiente del cron (es. variabile d'ambiente con contenuto JSON, o eseguire questo step solo nel check di backup a inizio sessione interattiva).

---

## 2026-06-14 — setup iniziale
 q
**Stato generale:** sano.

- **GSC Search Analytics (22/5→12/6):** impressioni in crescita 739→3049/giorno, click 7→47, posizione media stabile 9-11. Trend in salita continuo, nessun impatto visibile dall'outage del 7-8/6.
- **Nota:** la colonna "Impressioni" del CSV export GSC Coverage (che mostrava un calo -48% 22/5→8/6) è un falso allarme — misura qualcosa di diverso da Search Analytics. Per il traffico reale usare sempre Search Analytics.
- **Outage dominio 8-10/6:** dominio ombreeluci.it non rinnovato, ~52h di instabilità (DNS + 5xx), risolto. Auto-renewal DNS ora attivo.
- **Redirect legacy (1096 voci):** baseline `verify-redirects` del 21/5 = 1095/1097 ok. I 2 fail sono su URL spam non-Latini (`/с-рождеством/`, `/メリークリスマス/`), ignorabili.
- **Uptime:** nessun downtime oltre l'outage DNS dell'8/6.

**Attività proposte:** nessuna — tutto in linea.

---
