# Log monitoraggio SEO/uptime/redirect — Ombre e Luci

> Log settimanale generato dal check automatico. Entry più recente in alto.
> Per l'architettura generale del monitoring vedi [MONITORING.md](MONITORING.md).
> Tool usato: `scripts/gsc-query.mjs` (Search Analytics), UptimeRobot API, `scripts/verify-redirects.mjs`.

---

## 2026-06-14 — setup iniziale

**Stato generale:** sano.

- **GSC Search Analytics (22/5→12/6):** impressioni in crescita 739→3049/giorno, click 7→47, posizione media stabile 9-11. Trend in salita continuo, nessun impatto visibile dall'outage del 7-8/6.
- **Nota:** la colonna "Impressioni" del CSV export GSC Coverage (che mostrava un calo -48% 22/5→8/6) è un falso allarme — misura qualcosa di diverso da Search Analytics. Per il traffico reale usare sempre Search Analytics.
- **Outage dominio 8-10/6:** dominio ombreeluci.it non rinnovato, ~52h di instabilità (DNS + 5xx), risolto. Auto-renewal DNS ora attivo.
- **Redirect legacy (1096 voci):** baseline `verify-redirects` del 21/5 = 1095/1097 ok. I 2 fail sono su URL spam non-Latini (`/с-рождеством/`, `/メリークリスマス/`), ignorabili.
- **Uptime:** nessun downtime oltre l'outage DNS dell'8/6.

**Attività proposte:** nessuna — tutto in linea.

---
