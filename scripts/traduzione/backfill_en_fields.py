#!/usr/bin/env python3
"""
backfill_en_fields.py — Backfill campi tassonomici sugli articoli EN esistenti.

Per ogni articolo EN, legge il corrispondente IT (via articolo_traduzione)
e patcha: categoria_menu, forma, tema_label, didascalia_copertina, temi, tags.

Uso:
    python backfill_en_fields.py --dry-run          # mostra cosa farebbe
    python backfill_en_fields.py --limit 10         # testa su 10 articoli
    python backfill_en_fields.py                    # lancia su tutto
"""

import argparse, csv, io, json, os, ssl, sys, time, urllib.parse, urllib.request
from datetime import datetime
from pathlib import Path
from threading import Lock
from concurrent.futures import ThreadPoolExecutor, as_completed

if hasattr(sys.stdout, 'buffer'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

DIRECTUS_URL = os.environ.get("DIRECTUS_URL", "https://cms.ombreeluci.it")
DIRECTUS_TOKEN = os.environ.get("DIRECTUS_TOKEN", "")
LOGS_DIR = Path(__file__).parent / "logs"
LOGS_DIR.mkdir(exist_ok=True)

_SSL_CTX = ssl.create_default_context()
_SSL_CTX.check_hostname = False
_SSL_CTX.verify_mode = ssl.CERT_NONE

def _headers():
    return {
        "Authorization": f"Bearer {DIRECTUS_TOKEN}",
        "Content-Type": "application/json",
        "User-Agent": "OEL-Backfill/1.0",
    }

def _get(path):
    req = urllib.request.Request(f"{DIRECTUS_URL}{path}", headers=_headers())
    with urllib.request.urlopen(req, context=_SSL_CTX, timeout=30) as r:
        return json.loads(r.read())

def _patch(path, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(f"{DIRECTUS_URL}{path}", data=data,
                                  headers=_headers(), method="PATCH")
    with urllib.request.urlopen(req, context=_SSL_CTX, timeout=30) as r:
        return json.loads(r.read())

def fetch_all_en(page_size=500):
    """Fetcha tutti gli EN con il loro IT counterpart."""
    fields = (
        "id,slug,categoria_menu,forma,tema_label,didascalia_copertina,"
        "tags.tags_id.id,temi.temi_id.id,"
        "articolo_traduzione.id"
    )
    articles, page = [], 1
    while True:
        params = urllib.parse.urlencode({
            "filter[lang][_eq]": "en",
            "filter[stato][_eq]": "published",
            "filter[articolo_traduzione][_nnull]": "true",
            "fields": fields,
            "limit": page_size,
            "page": page,
        })
        batch = _get(f"/items/articoli?{params}").get("data", [])
        if not batch:
            break
        articles.extend(batch)
        print(f"  Caricati {len(articles)} EN...", end="\r")
        if len(batch) < page_size:
            break
        page += 1
    print()
    return articles

def fetch_it_fields(it_id):
    """Fetcha i campi tassonomici dell'IT corrispondente."""
    fields = "id,categoria_menu,forma,tema_label,didascalia_copertina,tags.tags_id.id,temi.temi_id.id"
    params = urllib.parse.urlencode({"fields": fields})
    data = _get(f"/items/articoli/{it_id}?{params}")
    return data.get("data") or data  # Directus single item può restituire direttamente

def build_patch(it):
    """Costruisce il payload PATCH dall'articolo IT. Restituisce None se nulla da aggiornare."""
    patch = {}
    if it.get("categoria_menu"):
        patch["categoria_menu"] = it["categoria_menu"]
    if it.get("forma"):
        patch["forma"] = it["forma"]
    if it.get("tema_label"):
        patch["tema_label"] = it["tema_label"]
    if it.get("didascalia_copertina"):
        patch["didascalia_copertina"] = it["didascalia_copertina"]
    temi = [{"temi_id": t["temi_id"]["id"]} for t in (it.get("temi") or []) if t.get("temi_id")]
    if temi:
        patch["temi"] = temi
    tags = [{"tags_id": t["tags_id"]["id"]} for t in (it.get("tags") or []) if t.get("tags_id")]
    if tags:
        patch["tags"] = tags
    return patch if patch else None

CSV_FIELDS = ["en_id", "en_slug", "it_id", "status", "fields_updated", "error", "timestamp"]
_log_lock = Lock()

def append_log(job_id, rows):
    path = LOGS_DIR / f"{job_id}.csv"
    is_new = not path.exists()
    with _log_lock:
        with open(path, "a", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=CSV_FIELDS)
            if is_new:
                w.writeheader()
            w.writerows(rows)

def process_one(en, dry_run, job_id):
    en_id = en["id"]
    en_slug = en["slug"]
    it_ref = en.get("articolo_traduzione") or {}
    it_id = it_ref.get("id") if isinstance(it_ref, dict) else None

    row = {k: "" for k in CSV_FIELDS}
    row.update({"en_id": en_id, "en_slug": en_slug, "it_id": it_id or "",
                "timestamp": datetime.utcnow().isoformat()})

    if not it_id:
        row.update({"status": "skip", "error": "no IT counterpart"})
        return row

    try:
        it = fetch_it_fields(it_id)
        patch = build_patch(it)

        if not patch:
            row.update({"status": "skip", "error": "nulla da aggiornare"})
            return row

        fields_updated = ",".join(patch.keys())

        if dry_run:
            row.update({"status": "dry-run", "fields_updated": fields_updated})
            print(f"  [DRY] {en_slug} → {fields_updated}")
            return row

        _patch(f"/items/articoli/{en_id}", patch)
        row.update({"status": "ok", "fields_updated": fields_updated})
        return row

    except Exception as e:
        row.update({"status": "error", "error": str(e)[:250]})
        print(f"  ✗ {en_slug}: {e}", file=sys.stderr)
        return row

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--workers", type=int, default=3)
    parser.add_argument("--job-id", default=f"backfill-en-{datetime.utcnow().strftime('%Y%m%d')}")
    args = parser.parse_args()

    if not DIRECTUS_TOKEN:
        print("ERROR: DIRECTUS_TOKEN mancante"); sys.exit(1)

    print(f"Job: {args.job_id} | dry-run={args.dry_run} | workers={args.workers}")
    print("Fetch articoli EN...")
    en_articles = fetch_all_en()

    if args.limit:
        en_articles = en_articles[:args.limit]

    total = len(en_articles)
    print(f"Articoli da processare: {total}\n")

    ok = skipped = errors = 0
    start = time.time()

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(process_one, en, args.dry_run, args.job_id): en
                   for en in en_articles}
        done = 0
        rows_buf = []
        for fut in as_completed(futures):
            done += 1
            row = fut.result()
            rows_buf.append(row)
            if row["status"] == "ok":
                ok += 1
                print(f"  [{done}/{total}] ✓ {row['en_slug']} [{row['fields_updated']}]")
            elif row["status"] == "dry-run":
                ok += 1
            elif row["status"] == "skip":
                skipped += 1
            else:
                errors += 1
            if len(rows_buf) >= 50:
                append_log(args.job_id, rows_buf)
                rows_buf = []
        if rows_buf:
            append_log(args.job_id, rows_buf)

    elapsed = (time.time() - start) / 60
    print(f"\n{'='*55}")
    print(f"COMPLETATO in {elapsed:.1f} min")
    print(f"OK:       {ok}")
    print(f"Saltati:  {skipped}")
    print(f"Errori:   {errors}")
    print(f"Log:      {LOGS_DIR / args.job_id}.csv")

if __name__ == "__main__":
    main()
