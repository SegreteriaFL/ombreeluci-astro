#!/usr/bin/env python3
"""
backfill_traduzione_link.py — Collega i 131 articoli EN esistenti alle loro controparti IT.

Strategia di matching (cascata):
  1. Stesso wp_id → certo
  2. Stesso titolo normalizzato (lowercase, no accenti, no punteggiatura) → probabile
  3. Stessa data_pubblicazione + stesso autore → possibile (log per review manuale)

Uso:
    export DIRECTUS_TOKEN=xxx
    python backfill_traduzione_link.py --dry-run
    python backfill_traduzione_link.py
"""

import argparse
import csv
import json
import os
import re
import sys
import unicodedata
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

DIRECTUS_URL = os.environ.get("DIRECTUS_URL", "https://cms.ombreeluci.it")
DIRECTUS_TOKEN = os.environ.get("DIRECTUS_TOKEN", "")
LOGS_DIR = Path(__file__).parent / "logs"
LOGS_DIR.mkdir(exist_ok=True)

def _headers():
    return {"Authorization": f"Bearer {DIRECTUS_TOKEN}", "Content-Type": "application/json"}

def directus_get(path):
    req = urllib.request.Request(f"{DIRECTUS_URL}{path}", headers=_headers())
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

def directus_patch(path, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(f"{DIRECTUS_URL}{path}", data=data,
                                  headers=_headers(), method="PATCH")
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

def normalize(text):
    """Normalizza testo per confronto: lowercase, no accenti, no punteggiatura."""
    if not text:
        return ""
    nfkd = unicodedata.normalize("NFKD", text.lower())
    ascii_str = "".join(c for c in nfkd if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9\s]", "", ascii_str).strip()

def fetch_all(lang, fields):
    articles = []
    page = 1
    while True:
        params = urllib.parse.urlencode({
            "filter[lang][_eq]": lang,
            "filter[stato][_eq]": "published",
            "fields": fields,
            "limit": 500,
            "page": page,
        })
        batch = directus_get(f"/items/articoli?{params}").get("data", [])
        if not batch:
            break
        articles.extend(batch)
        if len(batch) < 500:
            break
        page += 1
    return articles

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not DIRECTUS_TOKEN:
        print("ERROR: DIRECTUS_TOKEN mancante"); sys.exit(1)

    fields = "id,slug,lang,titolo,wp_id,data_pubblicazione,autore.id,articolo_traduzione.id"

    print("Carico articoli IT...")
    it_articles = fetch_all("it", fields)
    print(f"  {len(it_articles)} articoli IT")

    print("Carico articoli EN esistenti...")
    en_articles = [a for a in fetch_all("en", fields)
                   if not (a.get("articolo_traduzione"))]
    print(f"  {len(en_articles)} articoli EN senza link IT")

    # Indici per matching
    it_by_wpid = {str(a.get("wp_id", "")): a for a in it_articles if a.get("wp_id")}
    it_by_title = {}
    for a in it_articles:
        key = normalize(a.get("titolo", ""))
        if key:
            it_by_title.setdefault(key, []).append(a)
    it_by_date_author = {}
    for a in it_articles:
        dp = (a.get("data_pubblicazione") or "")[:10]
        au = str((a.get("autore") or {}).get("id", ""))
        key = f"{dp}_{au}"
        if dp and au:
            it_by_date_author.setdefault(key, []).append(a)

    log_rows = []
    matched = 0
    ambiguous = 0

    for en in en_articles:
        en_id = en["id"]
        en_slug = en["slug"]
        en_wpid = str(en.get("wp_id", ""))
        it_match = None
        method = ""

        # 1. wp_id
        if en_wpid and en_wpid in it_by_wpid:
            it_match = it_by_wpid[en_wpid]
            method = "wp_id"

        # 2. titolo normalizzato
        if not it_match:
            key = normalize(en.get("titolo", ""))
            candidates = it_by_title.get(key, [])
            if len(candidates) == 1:
                it_match = candidates[0]
                method = "title_norm"
            elif len(candidates) > 1:
                ambiguous += 1
                log_rows.append({
                    "en_id": en_id, "en_slug": en_slug,
                    "it_id": "", "it_slug": "",
                    "method": "AMBIGUOUS_title",
                    "note": f"{len(candidates)} IT con stesso titolo",
                })
                continue

        # 3. data + autore
        if not it_match:
            dp = (en.get("data_pubblicazione") or "")[:10]
            au = str((en.get("autore") or {}).get("id", ""))
            key = f"{dp}_{au}"
            candidates = it_by_date_author.get(key, [])
            if len(candidates) == 1:
                it_match = candidates[0]
                method = "date_author"
            elif len(candidates) > 1:
                ambiguous += 1
                log_rows.append({
                    "en_id": en_id, "en_slug": en_slug,
                    "it_id": "", "it_slug": "",
                    "method": "AMBIGUOUS_date_author",
                    "note": f"{len(candidates)} IT con stessa data+autore",
                })
                continue

        if not it_match:
            log_rows.append({
                "en_id": en_id, "en_slug": en_slug,
                "it_id": "", "it_slug": "",
                "method": "NO_MATCH",
                "note": "nessuna corrispondenza trovata",
            })
            continue

        it_id = it_match["id"]
        it_slug = it_match["slug"]

        log_rows.append({
            "en_id": en_id, "en_slug": en_slug,
            "it_id": it_id, "it_slug": it_slug,
            "method": method, "note": "",
        })

        if args.dry_run:
            print(f"  [DRY] EN {en_slug} ↔ IT {it_slug} ({method})")
        else:
            directus_patch(f"/items/articoli/{it_id}", {"articolo_traduzione": en_id})
            directus_patch(f"/items/articoli/{en_id}", {"articolo_traduzione": it_id})
            print(f"  ✓ EN {en_slug} ↔ IT {it_slug} ({method})")
            matched += 1

    # Salva log
    ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    log_path = LOGS_DIR / f"backfill_traduzione_link_{ts}{'_dryrun' if args.dry_run else ''}.csv"
    with open(log_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["en_id","en_slug","it_id","it_slug","method","note"])
        w.writeheader()
        w.writerows(log_rows)

    print()
    print(f"Articoli EN processati: {len(en_articles)}")
    print(f"Link creati:            {matched}")
    print(f"Ambigui (review):       {ambiguous}")
    print(f"No match:               {sum(1 for r in log_rows if r['method']=='NO_MATCH')}")
    print(f"Log: {log_path}")

if __name__ == "__main__":
    main()
