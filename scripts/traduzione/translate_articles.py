#!/usr/bin/env python3
"""
translate_articles.py — Pipeline di traduzione IT→EN con Claude Haiku.

Traduce articoli italiani senza versione EN, crea record EN in Directus
e imposta il collegamento bidirezionale articolo_traduzione.

Uso:
    export DIRECTUS_TOKEN=xxx
    export ANTHROPIC_API_KEY=xxx

    # Dry-run (nessuna scrittura)
    python translate_articles.py --dry-run --limit 10

    # Pilot su 50 articoli (draft)
    python translate_articles.py --limit 50 --stato draft --job-id pilot-01

    # Lancio completo (5 worker paralleli)
    python translate_articles.py --workers 5 --stato draft --job-id batch-2026-04

    # Riprendi dopo interruzione (salta già processati)
    python translate_articles.py --workers 5 --stato draft --job-id batch-2026-04 --resume
"""

import anthropic
import argparse
import concurrent.futures
import csv
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

# ─── Config ────────────────────────────────────────────────────────────────────

DIRECTUS_URL = os.environ.get("DIRECTUS_URL", "https://cms.ombreeluci.it")
DIRECTUS_TOKEN = os.environ.get("DIRECTUS_TOKEN", "")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

MODEL = "claude-haiku-4-5-20251001"
MAX_TOKENS_PER_CALL = 8192
MAX_RETRIES = 3
RETRY_BACKOFF_BASE = 2.0   # secondi base per exponential backoff

LOGS_DIR = Path(__file__).parent / "logs"
LOGS_DIR.mkdir(exist_ok=True)

SYSTEM_PROMPT = """\
You are a professional translator for Ombre e Luci, an Italian Catholic magazine about
disability, faith, and human dignity, published since 1974.

=== CRITICAL TRANSLATION RULES ===

1. FAITHFUL VOICE: Translate accurately from Italian to English, preserving the author's
   voice, style, and the cultural context of the era.

2. DISABILITY TERMINOLOGY — NEVER MODERNIZE:
   Preserve period-accurate disability terms exactly as written:
   "spastico/a" → "spastic" | "subnormale" → "subnormal"
   "handicappato/a" → "handicapped" | "mongoloide" → "mongoloid"
   "deficiente" → "deficient" | "ritardato/a" → "retarded"
   These are archival documents. Censoring them would betray the magazine's mission.

3. IRREGULAR GRAMMAR — DO NOT CORRECT:
   If the Italian contains grammatically irregular constructions, simplified syntax,
   incomplete sentences, or childlike language (articles written by children or people
   with cognitive disabilities), preserve the same level of linguistic irregularity in
   English. Do not silently correct or improve the style.

4. HTML TAGS — PRESERVE EXACTLY:
   Only translate text nodes. Never add, remove, or modify any HTML tag or attribute.
   Preserve <p>, <strong>, <em>, <a href="...">, <img>, <blockquote>, etc. unchanged.

5. PROPER NAMES — DO NOT TRANSLATE:
   "Fede e Luce", "Ombre e Luci", Italian city/person names, "don/padre/suor" titles,
   Italian institutional names.

6. THEOLOGICAL TERMS: translate standard Catholic vocabulary faithfully
   ("misericordia" → "mercy", "carisma" → "charism", "testimonianza" → "testimony").

7. OUTPUT: return ONLY the translated content. No explanations. No preamble. No comments.\
"""

# ─── Directus helpers ──────────────────────────────────────────────────────────

def _headers() -> dict:
    return {
        "Authorization": f"Bearer {DIRECTUS_TOKEN}",
        "Content-Type": "application/json",
    }

def directus_get(path: str) -> dict:
    req = urllib.request.Request(f"{DIRECTUS_URL}{path}", headers=_headers())
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())

def directus_post(path: str, payload: dict) -> dict:
    data = json.dumps(payload).encode()
    req = urllib.request.Request(f"{DIRECTUS_URL}{path}", data=data,
                                  headers=_headers(), method="POST")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())

def directus_patch(path: str, payload: dict) -> dict:
    data = json.dumps(payload).encode()
    req = urllib.request.Request(f"{DIRECTUS_URL}{path}", data=data,
                                  headers=_headers(), method="PATCH")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())

# ─── Translation helpers ───────────────────────────────────────────────────────

def translate_text(client: anthropic.Anthropic, text: str, field: str) -> tuple[str, int, int]:
    """
    Traduce un campo testuale. Restituisce (testo_tradotto, input_tokens, output_tokens).
    Lancia eccezione dopo MAX_RETRIES tentativi.
    """
    if not text or not text.strip():
        return text, 0, 0

    prompt = f"Translate this {field} from Italian to English:\n\n{text}"

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = client.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS_PER_CALL,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}],
            )
            translated = resp.content[0].text.strip()
            return translated, resp.usage.input_tokens, resp.usage.output_tokens
        except Exception as e:
            if attempt == MAX_RETRIES:
                raise
            wait = RETRY_BACKOFF_BASE ** attempt
            print(f"    ⚠ retry {attempt}/{MAX_RETRIES} ({e}) — attendo {wait:.0f}s")
            time.sleep(wait)

    raise RuntimeError("Unreachable")

def slug_to_en(it_slug: str) -> str:
    return f"{it_slug}-en"

# ─── Article fetch ─────────────────────────────────────────────────────────────

def fetch_articles_to_translate(limit: int | None) -> list[dict]:
    fields = (
        "id,slug,lang,titolo,sottotitolo,seo_description,corpo,"
        "stato,data_pubblicazione,"
        "autore.id,numero_rivista.id,immagine_copertina.id"
    )
    params: dict = {
        "filter[lang][_eq]": "it",
        "filter[stato][_eq]": "published",
        "filter[articolo_traduzione][_null]": "true",
        "fields": fields,
        "limit": min(limit, 500) if limit else 500,
        "page": 1,
    }

    articles = []
    while True:
        qs = urllib.parse.urlencode(params)
        data = directus_get(f"/items/articoli?{qs}")
        batch = data.get("data", [])
        if not batch:
            break
        articles.extend(batch)
        if limit and len(articles) >= limit:
            articles = articles[:limit]
            break
        if len(batch) < params["limit"]:
            break
        params["page"] += 1

    return articles

# ─── Main translation job ──────────────────────────────────────────────────────

def process_article(
    article: dict,
    client: anthropic.Anthropic,
    stato: str,
    job_id: str,
    dry_run: bool,
) -> dict:
    """
    Processa un singolo articolo IT → EN.
    Restituisce un dict di log con status, costi, IDs.
    """
    it_id = article["id"]
    it_slug = article["slug"]
    en_slug = slug_to_en(it_slug)
    ts = datetime.utcnow().isoformat()

    log = {
        "job_id": job_id,
        "it_id": it_id,
        "it_slug": it_slug,
        "en_id": "",
        "en_slug": en_slug,
        "status": "",
        "error": "",
        "input_tokens": 0,
        "output_tokens": 0,
        "cost_usd": 0.0,
        "timestamp": ts,
    }

    try:
        # Traduci i campi
        titolo_it = article.get("titolo") or ""
        sottotitolo_it = article.get("sottotitolo") or ""
        seo_it = article.get("seo_description") or ""
        corpo_it = article.get("corpo") or ""

        total_in = total_out = 0

        titolo_en, i, o = translate_text(client, titolo_it, "article title")
        total_in += i; total_out += o

        sottotitolo_en, i, o = translate_text(client, sottotitolo_it, "article subtitle")
        total_in += i; total_out += o

        seo_en, i, o = translate_text(client, seo_it, "SEO description")
        total_in += i; total_out += o

        corpo_en, i, o = translate_text(client, corpo_it, "HTML article body")
        total_in += i; total_out += o

        log["input_tokens"] = total_in
        log["output_tokens"] = total_out
        log["cost_usd"] = round(
            total_in * (0.80 / 1_000_000) + total_out * (4.00 / 1_000_000), 6
        )

        if dry_run:
            log["status"] = "dry-run"
            log["en_id"] = "DRY"
            print(f"  [DRY] {it_slug} → {en_slug}")
            print(f"        Titolo EN: {titolo_en[:80]}")
            return log

        # Crea articolo EN in Directus
        autore_id = (article.get("autore") or {}).get("id")
        numero_id = (article.get("numero_rivista") or {}).get("id")
        copertina_id = (article.get("immagine_copertina") or {}).get("id")

        payload: dict = {
            "lang": "en",
            "slug": en_slug,
            "stato": stato,
            "titolo": titolo_en,
            "data_pubblicazione": article.get("data_pubblicazione"),
        }
        if sottotitolo_en:
            payload["sottotitolo"] = sottotitolo_en
        if seo_en:
            payload["seo_description"] = seo_en
        if corpo_en:
            payload["corpo"] = corpo_en
        if autore_id:
            payload["autore"] = autore_id
        if numero_id:
            payload["numero_rivista"] = numero_id
        if copertina_id:
            payload["immagine_copertina"] = copertina_id

        created = directus_post("/items/articoli", payload)
        en_id = created["data"]["id"]
        log["en_id"] = str(en_id)

        # Collegamento bidirezionale
        directus_patch(f"/items/articoli/{it_id}", {"articolo_traduzione": en_id})
        directus_patch(f"/items/articoli/{en_id}", {"articolo_traduzione": it_id})

        log["status"] = "ok"
        print(f"  ✓ {it_slug} → {en_slug} (EN id={en_id}) "
              f"[{total_in}in/{total_out}out tok, ${log['cost_usd']:.4f}]")

    except Exception as e:
        log["status"] = "error"
        log["error"] = str(e)[:200]
        print(f"  ✗ {it_slug}: {e}", file=sys.stderr)

    return log

# ─── Checkpoint ────────────────────────────────────────────────────────────────

def load_checkpoint(job_id: str) -> set[str]:
    """Restituisce set di it_slug già processati con successo."""
    path = LOGS_DIR / f"{job_id}.csv"
    if not path.exists():
        return set()
    done = set()
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row.get("status") in ("ok", "dry-run"):
                done.add(row["it_slug"])
    return done

def append_log(job_id: str, rows: list[dict]) -> None:
    path = LOGS_DIR / f"{job_id}.csv"
    is_new = not path.exists()
    fieldnames = ["job_id","it_id","it_slug","en_id","en_slug","status","error",
                  "input_tokens","output_tokens","cost_usd","timestamp"]
    with open(path, "a", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        if is_new:
            w.writeheader()
        w.writerows(rows)

# ─── Entry point ───────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Traduce articoli IT→EN con Haiku")
    parser.add_argument("--dry-run", action="store_true",
                        help="Non scrive nulla in Directus")
    parser.add_argument("--limit", type=int, default=None,
                        help="Limita a N articoli")
    parser.add_argument("--stato", choices=["draft", "published"], default="draft",
                        help="Stato articoli EN creati (default: draft)")
    parser.add_argument("--job-id", default=f"batch-{datetime.utcnow().strftime('%Y%m%d')}",
                        help="ID batch per checkpoint e rollback")
    parser.add_argument("--workers", type=int, default=1,
                        help="Thread paralleli (default: 1)")
    parser.add_argument("--resume", action="store_true",
                        help="Salta articoli già processati nel job-id dato")
    args = parser.parse_args()

    if not DIRECTUS_TOKEN:
        print("ERROR: DIRECTUS_TOKEN non impostato.", file=sys.stderr); sys.exit(1)
    if not args.dry_run and not ANTHROPIC_API_KEY:
        print("ERROR: ANTHROPIC_API_KEY non impostato.", file=sys.stderr); sys.exit(1)

    print(f"Job ID: {args.job_id}")
    print(f"Dry-run: {args.dry_run} | Workers: {args.workers} | Stato EN: {args.stato}")

    # Carica articoli
    print("Carico articoli da tradurre...")
    articles = fetch_articles_to_translate(args.limit)
    print(f"Trovati: {len(articles)} articoli")

    # Resume: filtra già processati
    if args.resume:
        done = load_checkpoint(args.job_id)
        before = len(articles)
        articles = [a for a in articles if a["slug"] not in done]
        print(f"Checkpoint: {before - len(articles)} già processati, {len(articles)} rimanenti")

    if not articles:
        print("Nessun articolo da processare.")
        return

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY) if not args.dry_run else None

    all_logs: list[dict] = []
    errors = 0
    t_start = time.time()

    if args.workers > 1 and not args.dry_run:
        with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as ex:
            futures = {
                ex.submit(process_article, a, client, args.stato,
                          args.job_id, args.dry_run): a
                for a in articles
            }
            for fut in concurrent.futures.as_completed(futures):
                log = fut.result()
                all_logs.append(log)
                if log["status"] == "error":
                    errors += 1
                if len(all_logs) % 20 == 0:
                    append_log(args.job_id, all_logs[-20:])
    else:
        for i, article in enumerate(articles, 1):
            print(f"[{i}/{len(articles)}]", end=" ")
            log = process_article(article, client, args.stato, args.job_id, args.dry_run)
            all_logs.append(log)
            if log["status"] == "error":
                errors += 1
            if i % 10 == 0:
                append_log(args.job_id, all_logs[-10:])
            time.sleep(0.15)  # cortesia verso API

    append_log(args.job_id, all_logs[-(len(all_logs) % 10 or 10):])

    elapsed = time.time() - t_start
    total_cost = sum(l["cost_usd"] for l in all_logs)
    total_in = sum(l["input_tokens"] for l in all_logs)
    total_out = sum(l["output_tokens"] for l in all_logs)

    print()
    print("=" * 50)
    print(f"COMPLETATO in {elapsed:.0f}s")
    print(f"Processati:  {len(all_logs)}")
    print(f"OK:          {len(all_logs) - errors}")
    print(f"Errori:      {errors}")
    print(f"Token input: {total_in:,}")
    print(f"Token output:{total_out:,}")
    print(f"Costo reale: ${total_cost:.4f} (≈€{total_cost/0.92:.2f})")
    print(f"Log:         {LOGS_DIR / args.job_id}.csv")

if __name__ == "__main__":
    main()
