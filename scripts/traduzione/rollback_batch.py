#!/usr/bin/env python3
"""
rollback_batch.py — Annulla un batch di traduzioni creato da translate_articles.py.

Legge il CSV di log del batch, rimuove il link articolo_traduzione dagli IT
e cancella gli articoli EN creati.

Uso:
    python rollback_batch.py --job-id pilot-01 --dry-run
    python rollback_batch.py --job-id pilot-01
"""

import argparse
import csv
import io
import json
import os
import ssl
import sys
import urllib.request
from pathlib import Path

if hasattr(sys.stdout, 'buffer'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

DIRECTUS_URL = os.environ.get("DIRECTUS_URL", "https://cms.ombreeluci.it")
DIRECTUS_TOKEN = os.environ.get("DIRECTUS_TOKEN", "")
LOGS_DIR = Path(__file__).parent / "logs"

_SSL_CTX = ssl.create_default_context()
_SSL_CTX.check_hostname = False
_SSL_CTX.verify_mode = ssl.CERT_NONE

def _headers():
    return {
        "Authorization": f"Bearer {DIRECTUS_TOKEN}",
        "Content-Type": "application/json",
        "User-Agent": "OEL-Translate/1.0",
    }

def directus_patch(path, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(f"{DIRECTUS_URL}{path}", data=data,
                                  headers=_headers(), method="PATCH")
    with urllib.request.urlopen(req, context=_SSL_CTX, timeout=30) as r:
        return json.loads(r.read())

def directus_delete(path):
    req = urllib.request.Request(f"{DIRECTUS_URL}{path}",
                                  headers=_headers(), method="DELETE")
    with urllib.request.urlopen(req, context=_SSL_CTX, timeout=30):
        pass

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--job-id", required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not DIRECTUS_TOKEN:
        print("ERROR: DIRECTUS_TOKEN mancante"); sys.exit(1)

    log_path = LOGS_DIR / f"{args.job_id}.csv"
    if not log_path.exists():
        print(f"Log non trovato: {log_path}"); sys.exit(1)

    with open(log_path, newline="", encoding="utf-8") as f:
        rows = [r for r in csv.DictReader(f) if r.get("status") == "ok"]

    print(f"Articoli da annullare: {len(rows)}")
    if not rows:
        print("Nessun record 'ok' trovato nel log."); return

    ok = 0
    errors = 0
    for row in rows:
        it_id = row["it_id"]
        en_id = row["en_id"]
        it_slug = row["it_slug"]
        en_slug = row["en_slug"]

        if args.dry_run:
            print(f"  [DRY] rimuovi link IT {it_slug} + elimina EN {en_slug}")
            continue

        try:
            directus_patch(f"/items/articoli/{it_id}", {"articolo_traduzione": None})
            directus_delete(f"/items/articoli/{en_id}")
            print(f"  ✓ rimosso EN {en_slug} (id={en_id})")
            ok += 1
        except Exception as e:
            print(f"  ✗ errore su EN {en_slug}: {e}", file=sys.stderr)
            errors += 1

    print()
    print(f"Rollback: {ok} OK, {errors} errori")

if __name__ == "__main__":
    main()
