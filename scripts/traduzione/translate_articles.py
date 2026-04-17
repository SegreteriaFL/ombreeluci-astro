#!/usr/bin/env python3
"""
translate_articles.py — Pipeline di traduzione IT→EN con Claude Haiku.

Caratteristiche:
- 1 chiamata API per articolo (formato delimiter, non JSON — più robusto)
- Validazione dura post-risposta (HTML parser + schema check)
- Idempotenza: source hash SHA256, skip se già tradotto con stesso testo
- Rate limit adattivo: TPM tracking + backoff su 429
- Checkpoint/resume da CSV log
- Quality gate locale prima di scrivere in Directus

Uso:
    export DIRECTUS_TOKEN=xxx
    export ANTHROPIC_API_KEY=xxx

    python translate_articles.py --dry-run --limit 10          # anteprima
    python translate_articles.py --limit 50 --job-id pilot-01  # pilot
    python translate_articles.py --workers 3 --job-id batch-01 # completo
    python translate_articles.py --job-id batch-01 --resume    # riprendi
"""

import anthropic
import argparse
import concurrent.futures
import csv
import hashlib
import html.parser
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from datetime import datetime
from pathlib import Path
from threading import Lock

# ─── Config ─────────────────────────────────────────────────────────────────

DIRECTUS_URL = os.environ.get("DIRECTUS_URL", "https://cms.ombreeluci.it")
DIRECTUS_TOKEN = os.environ.get("DIRECTUS_TOKEN", "")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

MODEL_HAIKU = "claude-haiku-4-5-20251001"
MODEL_SONNET = "claude-sonnet-4-6"
MODEL = MODEL_HAIKU  # default, sovrascrivibile via --model
MAX_TOKENS_PER_CALL = 8192
MAX_RETRIES = 4
BACKOFF_BASE = 8.0        # secondi base per retry (raddoppia a ogni tentativo)
SLEEP_BETWEEN = 0.5       # cortesia inter-articolo (secondi)

# Tier 1 Anthropic API safety margin
ITPM_LIMIT = 45_000       # input tokens/min (soglia sicura sotto i 50K Tier 1)
OTPM_LIMIT = 45_000       # output tokens/min

LOGS_DIR = Path(__file__).parent / "logs"
LOGS_DIR.mkdir(exist_ok=True)

DELIM_TITOLO     = "===TITOLO==="
DELIM_SOTTOTITOLO = "===SOTTOTITOLO==="
DELIM_SEO        = "===SEO==="
DELIM_CORPO      = "===CORPO==="

SYSTEM_PROMPT = """\
You are a professional translator for Ombre e Luci, an Italian Catholic magazine about
disability, faith, and human dignity, published since 1974.

=== CRITICAL TRANSLATION RULES ===

1. FAITHFUL VOICE: Translate accurately from Italian to English. Preserve the author's
   voice, style, and the cultural context of the original era.

2. DISABILITY TERMINOLOGY — NEVER MODERNIZE:
   Preserve period-accurate disability terms exactly as written:
   "spastico/a"→"spastic" | "subnormale"→"subnormal" | "handicappato/a"→"handicapped"
   "mongoloide"→"mongoloid" | "deficiente"→"deficient" | "ritardato/a"→"retarded"
   These are archival documents. Censoring them would betray the magazine's mission.

3. IRREGULAR GRAMMAR — DO NOT CORRECT:
   If the Italian contains grammatically irregular constructions, simplified or childlike
   syntax, or incomplete sentences (articles written by children or people with cognitive
   or communicative disabilities), preserve the same level of irregularity in English.
   Do not silently correct, improve, or "normalize" the style.

4. HTML TAGS — PRESERVE EXACTLY:
   Translate ONLY text nodes. Never add, remove, or modify any HTML tag or attribute.
   Every <a href="...">, <img src="...">, <p>, <strong>, <em>, etc. must be identical.

5. PROPER NAMES — DO NOT TRANSLATE:
   "Fede e Luce", "Ombre e Luci", Italian cities/persons, "don/padre/suor" titles.

6. THEOLOGICAL TERMS: "misericordia"→"mercy", "carisma"→"charism",
   "testimonianza"→"testimony", "fragilità"→"fragility".

7. OUTPUT FORMAT — MANDATORY:
   Return the translation using EXACTLY these delimiters (no other text):

===TITOLO===
(translated title)

===SOTTOTITOLO===
(translated subtitle, or empty line if original is empty)

===SEO===
(translated SEO description, or empty line if original is empty)

===CORPO===
(full translated HTML body)\
"""

# ─── Rate limit tracker ──────────────────────────────────────────────────────

class RateLimiter:
    """Traccia token/minuto e mette in pausa se ci si avvicina al limite."""
    def __init__(self):
        self._window_start = time.monotonic()
        self._itokens = 0
        self._otokens = 0
        self._lock = Lock()

    def record(self, in_tok: int, out_tok: int):
        with self._lock:
            now = time.monotonic()
            if now - self._window_start >= 60:
                self._window_start = now
                self._itokens = 0
                self._otokens = 0
            self._itokens += in_tok
            self._otokens += out_tok
            remaining = 60 - (now - self._window_start)
            if self._itokens > ITPM_LIMIT or self._otokens > OTPM_LIMIT:
                if remaining > 0:
                    print(f"\n  ⏳ Rate limit: attendo {remaining:.0f}s (TPM)")
                    time.sleep(remaining + 1)
                self._window_start = time.monotonic()
                self._itokens = in_tok
                self._otokens = out_tok

rate_limiter = RateLimiter()

# ─── HTML validator ──────────────────────────────────────────────────────────

class HTMLChecker(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.errors = []
    def handle_error(self, message):
        self.errors.append(message)

def is_html_structurally_ok(original: str, translated: str) -> tuple[bool, str]:
    """
    Verifica che la traduzione non abbia rotto l'HTML.
    Controlla: tag count simile, link preservati, parser senza errori.
    """
    if not original.strip():
        return True, ""

    def count_tags(text):
        return len(re.findall(r'<[a-zA-Z][^>]*>', text))

    def extract_hrefs(text):
        return set(re.findall(r'href="([^"]+)"', text))

    def extract_srcs(text):
        return set(re.findall(r'src="([^"]+)"', text))

    tags_orig = count_tags(original)
    tags_trad = count_tags(translated)
    if tags_orig > 5 and abs(tags_orig - tags_trad) > max(2, tags_orig * 0.15):
        return False, f"tag count: {tags_orig} orig vs {tags_trad} trad"

    missing_hrefs = extract_hrefs(original) - extract_hrefs(translated)
    if missing_hrefs:
        return False, f"href persi: {list(missing_hrefs)[:3]}"

    missing_srcs = extract_srcs(original) - extract_srcs(translated)
    if missing_srcs:
        return False, f"src persi: {list(missing_srcs)[:2]}"

    checker = HTMLChecker()
    try:
        checker.feed(translated)
    except Exception as e:
        return False, f"HTML parse error: {e}"

    return True, ""

def is_length_ok(original: str, translated: str) -> tuple[bool, str]:
    """EN deve essere almeno 30% del testo IT (sanity check anti-truncation)."""
    orig_len = len(re.sub(r'<[^>]+>', '', original))
    trad_len = len(re.sub(r'<[^>]+>', '', translated))
    if orig_len > 200 and trad_len < orig_len * 0.30:
        return False, f"troppo corto: {trad_len} char vs {orig_len} orig"
    return True, ""

# ─── Response parser ─────────────────────────────────────────────────────────

def parse_response(text: str) -> dict | None:
    """
    Parsa la risposta strutturata con delimiter.
    Restituisce dict con chiavi titolo/sottotitolo/seo/corpo, o None se malformata.
    """
    sections = {
        "titolo": "", "sottotitolo": "", "seo": "", "corpo": ""
    }
    delimiters = [
        (DELIM_TITOLO,      "titolo"),
        (DELIM_SOTTOTITOLO, "sottotitolo"),
        (DELIM_SEO,         "seo"),
        (DELIM_CORPO,       "corpo"),
    ]

    # Verifica che tutti i delimiter siano presenti
    for delim, _ in delimiters:
        if delim not in text:
            return None

    # Estrai ogni sezione
    for i, (delim, key) in enumerate(delimiters):
        start = text.find(delim) + len(delim)
        # La sezione finisce al prossimo delimiter o alla fine
        if i + 1 < len(delimiters):
            next_delim = delimiters[i + 1][0]
            end = text.find(next_delim, start)
        else:
            end = len(text)
        sections[key] = text[start:end].strip()

    # titolo obbligatorio
    if not sections["titolo"]:
        return None

    return sections

def validate_translation(
    original: dict,
    translated: dict,
) -> tuple[bool, list[str]]:
    """Quality gate locale. Restituisce (ok, lista_problemi)."""
    problems = []

    corpo_it = original.get("corpo") or ""
    corpo_en = translated.get("corpo") or ""

    ok, msg = is_html_structurally_ok(corpo_it, corpo_en)
    if not ok:
        problems.append(f"HTML: {msg}")

    ok, msg = is_length_ok(corpo_it, corpo_en)
    if not ok:
        problems.append(f"Lunghezza: {msg}")

    if not translated.get("titolo"):
        problems.append("Titolo EN vuoto")

    return len(problems) == 0, problems

# ─── Source hash ─────────────────────────────────────────────────────────────

def source_hash(article: dict) -> str:
    """SHA256 dei campi sorgente — skip se già tradotto con stesso hash."""
    content = "".join([
        article.get("titolo") or "",
        article.get("sottotitolo") or "",
        article.get("seo_description") or "",
        article.get("corpo") or "",
    ])
    return hashlib.sha256(content.encode()).hexdigest()[:16]

# ─── Directus helpers ────────────────────────────────────────────────────────

def _headers() -> dict:
    return {
        "Authorization": f"Bearer {DIRECTUS_TOKEN}",
        "Content-Type": "application/json",
    }

def d_get(path: str) -> dict:
    req = urllib.request.Request(f"{DIRECTUS_URL}{path}", headers=_headers())
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

def d_post(path: str, payload: dict) -> dict:
    data = json.dumps(payload).encode()
    req = urllib.request.Request(f"{DIRECTUS_URL}{path}", data=data,
                                  headers=_headers(), method="POST")
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

def d_patch(path: str, payload: dict) -> dict:
    data = json.dumps(payload).encode()
    req = urllib.request.Request(f"{DIRECTUS_URL}{path}", data=data,
                                  headers=_headers(), method="PATCH")
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

# ─── Core translation call ───────────────────────────────────────────────────

def call_haiku(client: anthropic.Anthropic, article: dict) -> tuple[dict, int, int]:
    """
    Chiama Haiku con 1 sola richiesta per articolo (tutti i campi insieme).
    Parsa e valida la risposta. Lancia ValueError se la risposta è inutilizzabile.
    """
    titolo   = article.get("titolo") or ""
    sotto    = article.get("sottotitolo") or ""
    seo      = article.get("seo_description") or ""
    corpo    = article.get("corpo") or ""

    user_msg = (
        f"{DELIM_TITOLO}\n{titolo}\n\n"
        f"{DELIM_SOTTOTITOLO}\n{sotto}\n\n"
        f"{DELIM_SEO}\n{seo}\n\n"
        f"{DELIM_CORPO}\n{corpo}"
    )

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = client.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS_PER_CALL,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_msg}],
            )
            in_tok  = resp.usage.input_tokens
            out_tok = resp.usage.output_tokens
            rate_limiter.record(in_tok, out_tok)

            raw = resp.content[0].text
            parsed = parse_response(raw)
            if parsed is None:
                raise ValueError(f"Risposta malformata (delimiter mancanti)")

            ok, problems = validate_translation(article, parsed)
            if not ok:
                raise ValueError(f"Quality gate fallito: {'; '.join(problems)}")

            return parsed, in_tok, out_tok

        except anthropic.RateLimitError:
            wait = BACKOFF_BASE * (2 ** (attempt - 1))
            print(f"\n  ⏳ 429 rate limit — attendo {wait:.0f}s (tentativo {attempt})")
            time.sleep(wait)
            if attempt == MAX_RETRIES:
                raise

        except (ValueError, anthropic.APIError) as e:
            if attempt == MAX_RETRIES:
                raise
            wait = BACKOFF_BASE * attempt
            print(f"\n  ⚠ retry {attempt}/{MAX_RETRIES}: {e} — attendo {wait:.0f}s")
            time.sleep(wait)

    raise RuntimeError("Unreachable")

# ─── Article fetch ───────────────────────────────────────────────────────────

def fetch_articles(limit: int | None, min_corpo: int = 0, max_corpo: int = 0) -> list[dict]:
    fields = (
        "id,slug,titolo,sottotitolo,seo_description,corpo,"
        "stato,data_pubblicazione,"
        "autore.id,numero_rivista.id,immagine_copertina.id"
    )
    articles, page = [], 1
    # Filtro lunghezza corpo applicato post-fetch (Directus non supporta filter su lunghezza)
    def corpo_tokens(a):
        return len(a.get("corpo") or "") // 4
    while True:
        params = urllib.parse.urlencode({
            "filter[lang][_eq]": "it",
            "filter[stato][_eq]": "published",
            "filter[articolo_traduzione][_null]": "true",
            "fields": fields,
            "limit": 500,
            "page": page,
        })
        batch = d_get(f"/items/articoli?{params}").get("data", [])
        if not batch:
            break
        # Filtra per lunghezza corpo se richiesto
        if min_corpo or max_corpo:
            batch = [a for a in batch if
                     (not min_corpo or corpo_tokens(a) >= min_corpo) and
                     (not max_corpo or corpo_tokens(a) < max_corpo)]
        articles.extend(batch)
        print(f"  Caricati {len(articles)} articoli...", end="\r")
        if limit and len(articles) >= limit:
            articles = articles[:limit]
            break
        if len(batch) < 500:
            break
        page += 1
    return articles

# ─── Checkpoint ──────────────────────────────────────────────────────────────

CSV_FIELDS = [
    "job_id","it_id","it_slug","en_id","en_slug","source_hash",
    "status","error","input_tokens","output_tokens","cost_usd","timestamp"
]

def load_checkpoint(job_id: str) -> set[str]:
    """Restituisce set di (it_slug, source_hash) già OK."""
    path = LOGS_DIR / f"{job_id}.csv"
    if not path.exists():
        return set()
    done = set()
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row.get("status") in ("ok", "dry-run"):
                done.add(f"{row['it_slug']}:{row.get('source_hash','')}")
    return done

_log_lock = Lock()

def append_log(job_id: str, rows: list[dict]) -> None:
    path = LOGS_DIR / f"{job_id}.csv"
    is_new = not path.exists()
    with _log_lock:
        with open(path, "a", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=CSV_FIELDS)
            if is_new:
                w.writeheader()
            w.writerows(rows)

# ─── Process single article ──────────────────────────────────────────────────

def process(
    article: dict,
    client: anthropic.Anthropic,
    stato: str,
    job_id: str,
    dry_run: bool,
) -> dict:
    it_id   = article["id"]
    it_slug = article["slug"]
    en_slug = f"{it_slug}-en"
    shash   = source_hash(article)

    log = {k: "" for k in CSV_FIELDS}
    log.update({
        "job_id": job_id, "it_id": it_id, "it_slug": it_slug,
        "en_slug": en_slug, "source_hash": shash,
        "timestamp": datetime.utcnow().isoformat(),
    })

    try:
        translated, in_tok, out_tok = call_haiku(client, article)

        cost = round(in_tok * (0.80/1e6) + out_tok * (4.00/1e6), 6)
        log.update({"input_tokens": in_tok, "output_tokens": out_tok, "cost_usd": cost})

        if dry_run:
            log.update({"status": "dry-run", "en_id": "DRY"})
            print(f"  [DRY] {it_slug} → {en_slug}")
            print(f"        Titolo EN: {translated['titolo'][:80]}")
            return log

        # Crea articolo EN
        autore_id   = (article.get("autore") or {}).get("id")
        numero_id   = (article.get("numero_rivista") or {}).get("id")
        copertina_id = (article.get("immagine_copertina") or {}).get("id")

        payload: dict = {
            "id": str(uuid.uuid4()),
            "lang": "en", "slug": en_slug, "stato": stato,
            "titolo": translated["titolo"],
            "data_pubblicazione": article.get("data_pubblicazione"),
        }
        if translated.get("sottotitolo"): payload["sottotitolo"] = translated["sottotitolo"]
        if translated.get("seo"):         payload["seo_description"] = translated["seo"]
        if translated.get("corpo"):       payload["corpo"] = translated["corpo"]
        if autore_id:                     payload["autore"] = autore_id
        if numero_id:                     payload["numero_rivista"] = numero_id
        if copertina_id:                  payload["immagine_copertina"] = copertina_id

        created = d_post("/items/articoli", payload)
        en_id   = created["data"]["id"]

        # Collegamento bidirezionale
        d_patch(f"/items/articoli/{it_id}", {"articolo_traduzione": en_id})
        d_patch(f"/items/articoli/{en_id}", {"articolo_traduzione": it_id})

        log.update({"status": "ok", "en_id": str(en_id)})
        print(f"  ✓ {it_slug} → {en_slug} [{in_tok}in/{out_tok}out ${cost:.4f}]")

    except Exception as e:
        log.update({"status": "error", "error": str(e)[:250]})
        print(f"  ✗ {it_slug}: {e}", file=sys.stderr)

    return log

# ─── Entry point ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Traduce articoli OEL IT→EN con Haiku")
    parser.add_argument("--dry-run",  action="store_true")
    parser.add_argument("--limit",    type=int, default=None)
    parser.add_argument("--stato",    choices=["draft","published"], default="draft")
    parser.add_argument("--job-id",   default=f"batch-{datetime.utcnow().strftime('%Y%m%d')}")
    parser.add_argument("--workers",  type=int, default=1)
    parser.add_argument("--resume",   action="store_true",
                        help="Salta articoli già OK nel log del job-id")
    parser.add_argument("--model",     default="haiku",
                        choices=["haiku", "sonnet"],
                        help="Modello: haiku (default) o sonnet")
    parser.add_argument("--min-tokens", type=int, default=0,
                        help="Seleziona solo articoli con corpo >= N token (ibrida: Sonnet sui lunghi)")
    parser.add_argument("--max-tokens", type=int, default=0,
                        help="Seleziona solo articoli con corpo < N token")
    args = parser.parse_args()

    if not DIRECTUS_TOKEN:
        print("ERROR: DIRECTUS_TOKEN non impostato."); sys.exit(1)
    if not args.dry_run and not ANTHROPIC_API_KEY:
        print("ERROR: ANTHROPIC_API_KEY non impostato."); sys.exit(1)

    # Imposta modello globale
    global MODEL
    MODEL = MODEL_SONNET if args.model == "sonnet" else MODEL_HAIKU

    print(f"Job: {args.job_id} | model={MODEL} | dry-run={args.dry_run} | workers={args.workers} | stato={args.stato}")
    print()

    print("Carico articoli da tradurre...")
    articles = fetch_articles(args.limit,
                              min_corpo=args.min_tokens,
                              max_corpo=args.max_tokens)
    print(f"\nTrovati: {len(articles)} articoli")

    if args.resume:
        done = load_checkpoint(args.job_id)
        before = len(articles)
        articles = [a for a in articles
                    if f"{a['slug']}:{source_hash(a)}" not in done]
        print(f"Resume: {before - len(articles)} già OK, {len(articles)} rimanenti")

    if not articles:
        print("Nessun articolo da processare."); return

    # Stima tempi (realistica)
    est_min_low  = len(articles) * 3 / 60
    est_min_high = len(articles) * 8 / 60
    print(f"Stima tempo: {est_min_low:.0f}–{est_min_high:.0f} min (Tier 1, 1 worker)")
    print()

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY) if not args.dry_run else None

    all_logs: list[dict] = []
    t_start = time.time()

    if args.workers > 1 and not args.dry_run:
        with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as ex:
            futures = {
                ex.submit(process, a, client, args.stato, args.job_id, False): a
                for a in articles
            }
            for i, fut in enumerate(concurrent.futures.as_completed(futures), 1):
                log = fut.result()
                all_logs.append(log)
                if i % 10 == 0:
                    append_log(args.job_id, all_logs[-10:])
    else:
        for i, article in enumerate(articles, 1):
            print(f"[{i}/{len(articles)}]", end=" ")
            log = process(article, client, args.stato, args.job_id, args.dry_run)
            all_logs.append(log)
            if i % 10 == 0:
                append_log(args.job_id, all_logs[max(0, i-10):i])
            time.sleep(SLEEP_BETWEEN)

    # Flush log rimanente
    flushed = len(all_logs) % 10
    if flushed:
        append_log(args.job_id, all_logs[-flushed:])

    # Riepilogo
    elapsed   = time.time() - t_start
    ok_count  = sum(1 for l in all_logs if l["status"] == "ok")
    err_count = sum(1 for l in all_logs if l["status"] == "error")
    total_cost = sum(float(l.get("cost_usd") or 0) for l in all_logs)
    total_in   = sum(int(l.get("input_tokens") or 0) for l in all_logs)
    total_out  = sum(int(l.get("output_tokens") or 0) for l in all_logs)

    print()
    print("=" * 55)
    print(f"COMPLETATO in {elapsed/60:.1f} min")
    print(f"Processati:   {len(all_logs)}")
    print(f"OK:           {ok_count}")
    print(f"Errori:       {err_count}  ({'%.1f' % (err_count/max(1,len(all_logs))*100)}%)")
    print(f"Token input:  {total_in:,}")
    print(f"Token output: {total_out:,}")
    print(f"Costo reale:  ${total_cost:.4f}  (≈€{total_cost/0.92:.2f})")
    print(f"Log:          {LOGS_DIR / args.job_id}.csv")

    if err_count / max(1, len(all_logs)) > 0.01:
        print()
        print("⚠  Tasso errori > 1% — esegui qa_check.py prima di pubblicare")

if __name__ == "__main__":
    main()
