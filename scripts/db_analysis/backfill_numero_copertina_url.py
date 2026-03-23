#!/usr/bin/env python3
"""
scripts/db_analysis/backfill_numero_copertina_url.py

Imposta `copertina_url` su ogni record `numeri_rivista` in Directus con l’URL pubblico R2:
  https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev/numeri/{wp_id}.jpg

Mapping id_numero → wp_id:
  - Legge `numeri_rivista_wp.json` (slug, wp_id)
  - Deriva id_numero dallo slug con le stesse regole di `import_to_directus.derive_id_numero_and_tipo`
    (ordine di iterazione identico all’import)

Prima dell’aggiornamento verifica che il campo `copertina_url` esista nella collection.

Uso:
  python3 scripts/db_analysis/backfill_numero_copertina_url.py [--dry-run]

  --dry-run    Nessun PATCH; log e CSV di anteprima.

Variabili d’ambiente (o .env in root):
  DIRECTUS_URL    (default: http://159.69.196.64:8055)
  DIRECTUS_TOKEN

Input:
  scripts/db_analysis/output/numeri_rivista_wp.json

Output:
  scripts/db_analysis/logs/backfill_numero_copertina_url_{timestamp}[_dryrun].csv
  scripts/db_analysis/logs/backfill_numero_copertina_url_{timestamp}[_dryrun].log
"""

from __future__ import annotations

import argparse
import csv
import json
import logging
import os
import re
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
DATA_DIR = ROOT / "scripts/db_analysis/output"
NUMERI_WP_PATH = DATA_DIR / "numeri_rivista_wp.json"
LOG_DIR = ROOT / "scripts/db_analysis/logs"

DIRECTUS_URL = os.getenv("DIRECTUS_URL", "http://159.69.196.64:8055").rstrip("/")
DIRECTUS_TOKEN = os.getenv("DIRECTUS_TOKEN", "")

R2_NUMERI_BASE = "https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev/numeri"

COLLECTION = "numeri_rivista"
FIELD = "copertina_url"

BATCH_DELAY = 0.05
REQUEST_DELAY = 0.05
RETRY_MAX = 3
RETRY_BACKOFF = [1, 2, 4]

# ── Derivazione id_numero (allineata a import_to_directus) ────────────────────


def derive_id_numero_and_tipo(slug: str, fallback_counter: dict) -> tuple[str, str]:
    m = re.match(r"^numero-(\d+)-", slug)
    if m:
        return f"OEL-{m.group(1)}", "oel"

    m = re.match(r"^insieme-n-(\d+)-", slug)
    if m:
        return f"INS-{m.group(1)}", "ins"

    m = re.match(r"^insieme-n-(\d+)$", slug)
    if m:
        return f"INS-{m.group(1)}", "ins"

    if slug.startswith("insieme-"):
        fallback_counter["ins"] = fallback_counter.get("ins", 0) - 1
        return f"INS-{fallback_counter['ins']}", "ins"

    return slug, "extra"


def build_id_numero_to_wp_id(rows: list[dict], log: logging.Logger) -> dict[str, int]:
    """slug → wp_id nel JSON; stessa scansione dell’import → {id_numero: wp_id}."""
    fallback_counter: dict = {}
    out: dict[str, int] = {}
    for row in rows:
        slug = row.get("slug") or ""
        wp_id = row.get("wp_id")
        if wp_id is None:
            log.warning("Riga senza wp_id, skip: %s", slug[:60])
            continue
        id_numero, _ = derive_id_numero_and_tipo(slug, fallback_counter)
        if id_numero in out and out[id_numero] != wp_id:
            log.warning(
                "id_numero duplicato %s: wp_id precedente=%s, nuovo=%s (ultimo vince)",
                id_numero,
                out[id_numero],
                wp_id,
            )
        out[id_numero] = int(wp_id)
    log.info("Mapping id_numero -> wp_id: %s voci", len(out))
    return out


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
                log.warning("Retry %s/%s %s %s - %ss", attempt + 1, RETRY_MAX, method, path, w)
                time.sleep(w)
            else:
                raise
    raise RuntimeError(f"Max retry: {method} {path}")


def field_exists(log: logging.Logger) -> bool:
    r = _request("GET", f"/fields/{COLLECTION}", log)
    if not r.ok:
        log.error("GET /fields/%s: %s %s", COLLECTION, r.status_code, r.text[:300])
        return False
    for f in r.json().get("data", []):
        if f.get("field") == FIELD:
            return True
    return False


def fetch_all_numeri(log: logging.Logger) -> list[dict]:
    r = _request("GET", f"/items/{COLLECTION}?fields=id,id_numero,copertina_url&limit=-1", log)
    if not r.ok:
        log.error("GET numeri_rivista: %s %s", r.status_code, r.text[:300])
        sys.exit(1)
    return r.json().get("data", [])


def patch_numero(uuid: str, url: str, log: logging.Logger) -> bool:
    r = _request("PATCH", f"/items/{COLLECTION}/{uuid}", log, json={FIELD: url})
    if r.ok:
        return True
    log.error("PATCH %s/%s: %s %s", COLLECTION, uuid, r.status_code, r.text[:300])
    return False


# ── Logging ───────────────────────────────────────────────────────────────────


def setup_logging(dry_run: bool) -> tuple[logging.Logger, Path]:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    suffix = "_dryrun" if dry_run else ""
    log_path = LOG_DIR / f"backfill_numero_copertina_url_{ts}{suffix}.log"
    fmt = "%(asctime)s | %(levelname)s | %(message)s"
    logging.basicConfig(
        level=logging.INFO,
        format=fmt,
        handlers=[
            logging.FileHandler(log_path, encoding="utf-8"),
            logging.StreamHandler(sys.stdout),
        ],
    )
    return logging.getLogger("backfill_copertina"), log_path


CSV_FIELDS = [
    "id_numero",
    "uuid",
    "wp_id",
    "copertina_url_new",
    "previous_copertina_url",
    "status",
    "note",
]


def main() -> int:
    ap = argparse.ArgumentParser(description="PATCH copertina_url su numeri_rivista (R2)")
    ap.add_argument("--dry-run", action="store_true", help="Nessuna scrittura su Directus")
    args = ap.parse_args()

    log, log_path = setup_logging(args.dry_run)
    log.info("=== backfill_numero_copertina_url %s ===", "[DRY-RUN]" if args.dry_run else "")
    log.info("Log: %s", log_path)

    if not DIRECTUS_TOKEN:
        log.error("Imposta DIRECTUS_TOKEN.")
        return 1

    if not NUMERI_WP_PATH.exists():
        log.error("File non trovato: %s", NUMERI_WP_PATH)
        return 1

    with open(NUMERI_WP_PATH, encoding="utf-8") as f:
        wp_rows: list[dict] = json.load(f)

    id_to_wp = build_id_numero_to_wp_id(wp_rows, log)

    if not field_exists(log):
        log.error(
            "Il campo %r non è presente nella collection %r in Directus. "
            "Aggiungilo nello schema prima di eseguire lo script.",
            FIELD,
            COLLECTION,
        )
        return 1
    log.info("Campo %r presente su %s.", FIELD, COLLECTION)

    numeri = fetch_all_numeri(log)
    log.info("Record %s in Directus: %s", COLLECTION, len(numeri))

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_suffix = "_dryrun" if args.dry_run else ""
    csv_path = LOG_DIR / f"backfill_numero_copertina_url_{ts}{csv_suffix}.csv"
    csv_f = open(csv_path, "w", encoding="utf-8", newline="")
    writer = csv.DictWriter(csv_f, fieldnames=CSV_FIELDS)
    writer.writeheader()

    stats = {
        "patch_ok": 0,
        "dry": 0,
        "skip_no_wp": 0,
        "skip_same": 0,
        "err": 0,
    }

    for rec in numeri:
        uid = rec["id"]
        id_numero = rec.get("id_numero") or ""
        prev = rec.get(FIELD)
        wp_id = id_to_wp.get(id_numero)
        if wp_id is None:
            log.warning("Nessun wp_id in JSON per id_numero=%s (uuid=%s)", id_numero, uid)
            writer.writerow(
                {
                    "id_numero": id_numero,
                    "uuid": uid,
                    "wp_id": "",
                    "copertina_url_new": "",
                    "previous_copertina_url": prev or "",
                    "status": "skip_no_wp",
                    "note": "id_numero assente nel mapping da numeri_rivista_wp.json",
                }
            )
            stats["skip_no_wp"] += 1
            continue

        new_url = f"{R2_NUMERI_BASE}/{wp_id}.jpg"
        if prev == new_url:
            writer.writerow(
                {
                    "id_numero": id_numero,
                    "uuid": uid,
                    "wp_id": wp_id,
                    "copertina_url_new": new_url,
                    "previous_copertina_url": prev or "",
                    "status": "unchanged",
                    "note": "",
                }
            )
            stats["skip_same"] += 1
            continue

        if args.dry_run:
            log.info("[DRY] %s -> %s", id_numero, new_url)
            writer.writerow(
                {
                    "id_numero": id_numero,
                    "uuid": uid,
                    "wp_id": wp_id,
                    "copertina_url_new": new_url,
                    "previous_copertina_url": prev or "",
                    "status": "dry",
                    "note": "",
                }
            )
            stats["dry"] += 1
            continue

        if patch_numero(uid, new_url, log):
            stats["patch_ok"] += 1
            writer.writerow(
                {
                    "id_numero": id_numero,
                    "uuid": uid,
                    "wp_id": wp_id,
                    "copertina_url_new": new_url,
                    "previous_copertina_url": prev or "",
                    "status": "ok",
                    "note": "",
                }
            )
            time.sleep(BATCH_DELAY)
        else:
            stats["err"] += 1
            writer.writerow(
                {
                    "id_numero": id_numero,
                    "uuid": uid,
                    "wp_id": wp_id,
                    "copertina_url_new": new_url,
                    "previous_copertina_url": prev or "",
                    "status": "error",
                    "note": "PATCH fallito",
                }
            )

    csv_f.close()

    log.info("=== FINE ===")
    log.info("PATCH ok: %s", stats["patch_ok"])
    log.info("Invariati (URL gia uguale): %s", stats["skip_same"])
    log.info("Senza mapping wp_id: %s", stats["skip_no_wp"])
    if args.dry_run:
        log.info("Righe dry-run: %s", stats["dry"])
    log.info("Errori: %s", stats["err"])
    log.info("CSV: %s", csv_path)

    return 0 if stats["err"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
