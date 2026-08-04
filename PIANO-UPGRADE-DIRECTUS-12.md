# Piano — upgrade Directus 11.16.1 → 12.x

**Stato:** pianificazione, nessuna azione ancora eseguita. Sessione 2026-08-04.
**Perché:** bug confermato [directus/directus#27042](https://github.com/directus/directus/issues/27042) nell'editor WYSIWYG (TinyMCE) della nostra versione esatta (11.16.1), specifico per utenti non-admin (Editor/Redazione) — corrompe silenziosamente il contenuto quando si riapre un articolo già salvato. Directus ha sostituito TinyMCE con Tiptap nella 12.2 proprio per chiudere questa classe di bug.

---

## ⚠️ Non è un semplice bump di versione — cosa cambia davvero in Directus 12

Ricerca fatta prima di consigliare l'upgrade "a cuor leggero":

### 1. Nuovo modello di licenza (il punto più importante)
Directus 12 introduce enforcement attivo di licenza. Self-hosted parte di default sul **tier Core**; dopo **30 giorni di grazia** dall'upgrade, senza una licenza valida configurata, vengono bloccate operazioni API comuni (`/items`, GraphQL, WebSocket, login non-admin). **Il sito si affida interamente alle API Directus per ogni pagina — se questo scattasse per errore, il sito si ferma.**

**Buona notizia:** sotto **BSL 1.1**, organizzazioni con ricavi/finanziamenti totali annui **sotto i 5 milioni di $** possono auto-ospitare gratis, incluso uso commerciale/produzione. Ombre e Luci rientra ampiamente in questa soglia. **Ma probabilmente va comunque richiesta/configurata una licenza gratuita** prima che scatti l'enforcement — non è automatico solo perché si qualifica. Da verificare con certezza sul sito Directus prima del cutover, e da fare **prima** di superare i 30 giorni di grazia, non dopo.

### 2. "Custom rules on access policies will be ignored" senza licenza
Rischio diretto per noi: abbiamo permessi per-campo curati a mano su più ruoli (Redazione, Editor, Redattore — es. il campo `json_export` visibile solo a policy specifiche, `didascalia_copertina` con note custom, ecc., frutto di più sessioni di fix). Se questo enforcement si applica anche ai permessi base per-campo (non solo a regole avanzate/condizionali), potremmo perdere il controllo fine che ci ha già dato problemi da sistemare in passato. **Da verificare con precisione cosa intende Directus per "custom rules" prima del cutover** — non assumere che sia innocuo.

### 3. Altri breaking change rilevanti per la nostra configurazione
- `IP_TRUST_PROXY` default cambiato da `true` a `false` — **va impostato esplicitamente `true`**, altrimenti dietro il nostro reverse proxy (Cloudflare) l'IP reale potrebbe risultare sbagliato (impatterebbe rate limiting, log, WAF lato Directus se mai attivato).
- Docker image "hardened": `npm`/`npx` rimossi dal runtime, **estensioni non installabili a runtime** — se mai abbiamo installato estensioni custom "al volo" invece che nell'immagine Docker, va verificato.
- Import limitato a 50MB di default (`IMPORT_MAX_FILE_SIZE` configurabile) — verosimilmente non un problema per noi.
- Redesign dell'interfaccia Studio — estensioni tema/interfaccia potrebbero richiedere aggiornamento (verificare se ne abbiamo di custom, oltre alle configurazioni standard).

---

## Piano in fasi

### Fase 0 — Verifica preliminare (nessun rischio, solo ricerca/lettura)
1. Confermare sul sito ufficiale Directus l'esatta procedura per ottenere la licenza gratuita self-hosted sotto BSL 1.1 per un progetto no-profit/piccolo editore.
2. Chiarire con precisione cosa copre "custom rules on access policies ignored" — se necessario aprire un ticket/domanda alla community Directus.
3. Elenco completo di estensioni custom eventualmente installate sul nostro Directus (se ce ne sono) — verificare compatibilità con il redesign Studio.
4. Leggere la migration guide ufficiale completa: [directus.com/docs/releases/breaking-changes/version-12](https://directus.com/docs/releases/breaking-changes/version-12).

### Fase 1 — Test isolato (zero rischio per produzione)
1. Clonare il container/volume Docker di produzione su un ambiente separato (non staging condiviso — un VPS/container isolato, usando gli stessi backup giornalieri già esistenti su R2 per popolarlo con dati reali).
2. Eseguire l'upgrade **su questa copia isolata**.
3. Verificare: login con ruolo Editor (non admin) → il bug TinyMCE è davvero sparito; permessi per-campo di Redazione/Editor si comportano come prima; tutte le 14 Flow continuano a funzionare (in particolare quelle appena sistemate: sync metadati, sync didascalia, algolia sync, import traduzione); nessuna rottura sulle API che il sito Astro consuma.
4. Ottenere/configurare la licenza gratuita **su questa copia di test** per verificare l'intero flusso, non solo in teoria.

### Fase 2 — Cutover produzione (finestra di manutenzione)
1. Solo dopo Fase 1 verde. Backup pre-upgrade esplicito (oltre al backup giornaliero automatico già esistente).
2. `docker compose pull && docker compose up -d` sulla versione 12.x scelta, seguendo la procedura già documentata in `INFRASTRUTTURA.md`.
3. Configurare/attivare la licenza gratuita **immediatamente**, non aspettare i 30 giorni.
4. Smoke test completo (login Editor reale, non solo admin; verifica un articolo con WYSIWYG; verifica le Flow critiche).
5. Monitorare per 48h.

**Criterio di rollback:** backup Postgres + volumi Docker già in essere (retention 30gg su R2). Se qualcosa si rompe, `docker compose down` + restore da backup pre-upgrade.

---

## Non ancora fatto
Questo documento è il piano. Nessuna delle fasi sopra è stata eseguita. Prossimo passo naturale: Fase 0.
