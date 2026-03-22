#!/usr/bin/env python3
"""
scripts/db_analysis/backfill_taxonomy_fields.py

Popola i quattro campi tassonomici su `articoli` in Directus leggendo i valori
da `src/data/_legacy_articoli_megacluster.json`:

  - forma
  - tema_label
  - categoria_menu
  - ruolo_editoriale

Strategia (ottimizzata):
  1. Carica TUTTI gli articoli Directus in una cache {wp_id: directus_uuid}
     con una singola GET /items/articoli?fields=id,wp_id&limit=-1.
  2. Per ogni record nel megacluster (3 488 voci) cerca il corrispondente
     Directus uuid nella cache.  Se non trovato, lo logga e skippa.
  3. PATCH i quattro campi in batch da 50, con delay 200 ms tra i batch.

Uso:
  python3 scripts/db_analysis/backfill_taxonomy_fields.py [--dry-run]

  --dry-run    Nessun PATCH; log e CSV di anteprima.

Variabili d'ambiente (o .env in root):
  DIRECTUS_URL    (default: http://159.69.196.64:8055)
  DIRECTUS_TOKEN

Input:
  src/data/_legacy_articoli_megacluster.json

Output:
  scripts/db_analysis/logs/backfill_taxonomy_fields_{timestamp}[_dryrun].csv
  scripts/db_analysis/logs/backfill_taxonomy_fields_{timestamp}[_dryrun].log
"""

from __future__ import annotations

import argparse
import csv
import json
import logging
import os
import sys
import time
from datetime import datetime
from pathlib import Path

import requests

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

# ── Config ────────────────────────────────────────────────────────────────────

ROOT = Path(__file__).resolve().parent.parent.parent
MEGACLUSTER_PATH = ROOT / "src/data/_legacy_articoli_megacluster.json"
LOG_DIR = ROOT / "scripts/db_analysis/logs"

DIRECTUS_URL = os.getenv("DIRECTUS_URL", "http://159.69.196.64:8055").rstrip("/")
DIRECTUS_TOKEN = os.getenv("DIRECTUS_TOKEN", "")

COLLECTION = "articoli"
TAXONOMY_FIELDS = ["forma", "tema_label", "categoria_menu", "ruolo_editoriale"]

BATCH_SIZE = 50
BATCH_DELAY = 0.20   # secondi tra batch
REQUEST_DELAY = 0.05  # secondi tra richieste singole
RETRY_MAX = 3
RETRY_BACKOFF = [1, 2, 4]

CSV_FIELDS = [
    "wp_id",
    "directus_id",
    "forma",
    "tema_label",
    "categoria_menu",
    "ruolo_editoriale",
    "status",
    "note",
]

# ── HTTP ──────────────────────────────────────────────────────────────────────


def _headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {DIRECTUS_TOKEN}", "Content-Type": "application/json"}


def _request(method: str, path: str, log: logging.Logger, **kwargs) -> requests.Response:
    url = f"{DIRECTUS_URL}{path}"
    for attempt in range(RETRY_MAX):
        try:
            r = requests.request(method, url, headers=_headers(), timeout=60, **kwargs)
            time.sleep(REQUEST_DELAY)
            return r
        except requests.RequestException as e:
            if attempt < RETRY_MAX - 1:
                w = RETRY_BACKOFF[attempt]
                log.warning("Retry %s/%s %s %s - attesa %ss (%s)", attempt + 1, RETRY_MAX, method, path, w, e)
                time.sleep(w)
            else:
                raise
    raise RuntimeError(f"Max retry raggiunto: {method} {path}")


# ── Cache Directus ─────────────────────────────────────────────────────────────


def build_wp_cache(log: logging.Logger) -> dict[str, str]:
    """Ritorna {str(wp_id): directus_uuid} con una singola GET."""
    log.info("Carico cache articoli Directus (wp_id -> id)...")
    r = _request("GET", f"/items/{COLLECTION}?fields=id,wp_id&limit=-1", log)
    if not r.ok:
        log.error("GET /items/%s: %s %s", COLLECTION, r.status_code, r.text[:300])
        sys.exit(1)
    data = r.json().get("data", [])
    cache: dict[str, str] = {}
    for row in data:
        wp_id = row.get("wp_id")
        if wp_id is not None:
            cache[str(wp_id)] = row["id"]
    log.info("Cache: %s articoli con wp_id su %s totali in Directus", len(cache), len(data))
    return cache


# ── Logging ───────────────────────────────────────────────────────────────────


def setup_logging(dry_run: bool) -> tuple[logging.Logger, Path]:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    suffix = "_dryrun" if dry_run else ""
    log_path = LOG_DIR / f"backfill_taxonomy_fields_{ts}{suffix}.log"
    fmt = "%(asctime)s | %(levelname)s | %(message)s"
    logging.basicConfig(
        level=logging.INFO,
        format=fmt,
        handlers=[
            logging.FileHandler(log_path, encoding="utf-8"),
            logging.StreamHandler(sys.stdout),
        ],
    )
    return logging.getLogger("backfill_taxonomy"), log_path


# ── Main ──────────────────────────────────────────────────────────────────────


def main() -> int:
    ap = argparse.ArgumentParser(
        description="PATCH forma/tema_label/categoria_menu/ruolo_editoriale su articoli (da megacluster)"
    )
    ap.add_argument("--dry-run", action="store_true", help="Nessuna scrittura su Directus")
    args = ap.parse_args()

    log, log_path = setup_logging(args.dry_run)
    log.info("=== backfill_taxonomy_fields %s ===", "[DRY-RUN]" if args.dry_run else "")
    log.info("Log: %s", log_path)

    if not DIRECTUS_TOKEN:
        log.error("Imposta DIRECTUS_TOKEN.")
        return 1

    if not MEGACLUSTER_PATH.exists():
        log.error("File non trovato: %s", MEGACLUSTER_PATH)
        return 1

    # ── Carica megacluster ──────────────────────────────────────────────────
    with open(MEGACLUSTER_PATH, encoding="utf-8") as f:
        mega: dict[str, dict] = json.load(f)["byId"]
    log.info("Megacluster: %s record", len(mega))

    # ── Cache Directus ──────────────────────────────────────────────────────
    wp_cache = build_wp_cache(log)

    # ── Apri CSV ────────────────────────────────────────────────────────────
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_suffix = "_dryrun" if args.dry_run else ""
    csv_path = LOG_DIR / f"backfill_taxonomy_fields_{ts}{csv_suffix}.csv"
    csv_f = open(csv_path, "w", encoding="utf-8", newline="")
    writer = csv.DictWriter(csv_f, fieldnames=CSV_FIELDS)
    writer.writeheader()

    stats = {"patch_ok": 0, "dry": 0, "skip_not_found": 0, "err": 0}

    items = list(mega.items())
    total = len(items)

    for batch_start in range(0, total, BATCH_SIZE):
        batch = items[batch_start : batch_start + BATCH_SIZE]

        for wp_id_str, fields in batch:
            directus_id = wp_cache.get(wp_id_str)

            if directus_id is None:
                log.warning("wp_id=%s non trovato in Directus — skip", wp_id_str)
                writer.writerow(
                    {
                        "wp_id": wp_id_str,
                        "directus_id": "",
                        "forma": fields.get("forma") or "",
                        "tema_label": fields.get("tema_label") or "",
                        "categoria_menu": fields.get("categoria_menu") or "",
                        "ruolo_editoriale": fields.get("ruolo_editoriale") or "",
                        "status": "skip_not_found",
                        "note": "wp_id assente in Directus",
                    }
                )
                stats["skip_not_found"] += 1
                continue

            payload = {f: fields.get(f) for f in TAXONOMY_FIELDS}

            if args.dry_run:
                log.info("[DRY] wp_id=%s id=%s %s", wp_id_str, directus_id, payload)
                writer.writerow(
                    {
                        "wp_id": wp_id_str,
                        "directus_id": directus_id,
                        **{f: fields.get(f) or "" for f in TAXONOMY_FIELDS},
                        "status": "dry",
                        "note": "",
                    }
                )
                stats["dry"] += 1
                continue

            r = _request("PATCH", f"/items/{COLLECTION}/{directus_id}", log, json=payload)
            if r.ok:
                stats["patch_ok"] += 1
                writer.writerow(
                    {
                        "wp_id": wp_id_str,
                        "directus_id": directus_id,
                        **{f: fields.get(f) or "" for f in TAXONOMY_FIELDS},
                        "status": "ok",
                        "note": "",
                    }
                )
            else:
                log.error(
                    "PATCH wp_id=%s id=%s: %s %s",
                    wp_id_str,
                    directus_id,
                    r.status_code,
                    r.text[:300],
                )
                stats["err"] += 1
                writer.writerow(
                    {
                        "wp_id": wp_id_str,
                        "directus_id": directus_id,
                        **{f: fields.get(f) or "" for f in TAXONOMY_FIELDS},
                        "status": "error",
                        "note": f"HTTP {r.status_code}",
                    }
                )

        # delay tra batch (solo in modalità live)
        if not args.dry_run and batch_start + BATCH_SIZE < total:
            time.sleep(BATCH_DELAY)

        done = min(batch_start + BATCH_SIZE, total)
        log.info("Progresso: %s/%s", done, total)

    csv_f.close()

    log.info("=== FINE ===")
    log.info("PATCH ok:         %s", stats["patch_ok"])
    log.info("Skip not found:   %s", stats["skip_not_found"])
    if args.dry_run:
        log.info("Dry-run:          %s", stats["dry"])
    log.info("Errori:           %s", stats["err"])
    log.info("CSV:              %s", csv_path)

    return 0 if stats["err"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
