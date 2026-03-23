#!/usr/bin/env python3
"""
Imposta tutti gli autori in Directus con ruolo_autore = contributore (baseline editoriale).

Policy (da applicare poi a mano in Directus):
  - contributore: default per quasi tutti (tipicamente chi ha pochi articoli, es. 1–2)
  - collaboratore: chi scrive spesso (es. più di ~5 articoli) — da impostare manualmente
    su una ventina di profili
  - redazione, redazione_storica: solo manuali

Lo script non usa i conteggi articoli: imposta tutti a contributore; poi in CMS modifichi
a mano collaboratori, redazione e redazione storica.

Richiede DIRECTUS_URL e DIRECTUS_TOKEN.

  python scripts/db_analysis/backfill_ruolo_autore.py
  python scripts/db_analysis/backfill_ruolo_autore.py --dry-run
"""

from __future__ import annotations

import argparse
import os
import sys
import time

import requests

DIRECTUS_URL = os.getenv("DIRECTUS_URL", "").rstrip("/")
DIRECTUS_TOKEN = os.getenv("DIRECTUS_TOKEN", "")

DEFAULT_RUOLO = "contributore"


def main() -> int:
    parser = argparse.ArgumentParser(description="Tutti gli autori -> ruolo_autore contributore")
    parser.add_argument("--dry-run", action="store_true", help="Solo conteggio, nessun PATCH")
    args = parser.parse_args()

    if not DIRECTUS_URL or not DIRECTUS_TOKEN:
        print("Imposta DIRECTUS_URL e DIRECTUS_TOKEN.", file=sys.stderr)
        return 1

    headers = {
        "Authorization": f"Bearer {DIRECTUS_TOKEN}",
        "Content-Type": "application/json",
    }

    res = requests.get(
        f"{DIRECTUS_URL}/items/autori",
        params={"fields": "id,slug", "limit": -1},
        headers={"Authorization": f"Bearer {DIRECTUS_TOKEN}"},
        timeout=120,
    )
    res.raise_for_status()
    rows = res.json()["data"]

    print(f"Autori da aggiornare a {DEFAULT_RUOLO!r}: {len(rows)}")

    if args.dry_run:
        return 0

    for i, r in enumerate(rows):
        requests.patch(
            f"{DIRECTUS_URL}/items/autori/{r['id']}",
            headers=headers,
            json={"ruolo_autore": DEFAULT_RUOLO},
            timeout=60,
        ).raise_for_status()
        if (i + 1) % 50 == 0:
            time.sleep(0.05)

    print(f"Completato: {len(rows)} autori.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
