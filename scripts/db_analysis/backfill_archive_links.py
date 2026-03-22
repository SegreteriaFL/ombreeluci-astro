#!/usr/bin/env python3
"""
scripts/db_analysis/backfill_archive_links.py

Popola `wp_url` (sfoglia online) e `pdf_archive_url` (scarica PDF) su
`numeri_rivista` in Directus leggendo i link archive.org estratti dal dump WP.

Flusso:
  1. Carica archive_links.json {wp_id: {details_url, download_url}}
  2. Carica numeri_rivista_wp.json per mappare wp_id -> id_numero
  3. Carica tutti i numeri Directus (singola GET) per mappare id_numero -> uuid
  4. PATCH wp_url e pdf_archive_url su ogni numero trovato

Uso:
  python3 scripts/db_analysis/backfill_archive_links.py [--dry-run]

Variabili d'ambiente (o .env in root):
  DIRECTUS_URL    (default: http://159.69.196.64:8055)
  DIRECTUS_TOKEN

Output:
  scripts/db_analysis/logs/backfill_archive_links_{timestamp}[_dryrun].csv
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
ARCHIVE_LINKS_PATH = ROOT / "scripts/db_analysis/output/archive_links.json"
NUMERI_WP_PATH = ROOT / "scripts/db_analysis/output/numeri_rivista_wp.json"
LOG_DIR = ROOT / "scripts/db_analysis/logs"

DIRECTUS_URL = os.getenv("DIRECTUS_URL", "http://159.69.196.64:8055").rstrip("/")
DIRECTUS_TOKEN = os.getenv("DIRECTUS_TOKEN", "")

COLLECTION = "numeri_rivista"
BATCH_DELAY = 0.20
REQUEST_DELAY = 0.05
RETRY_MAX = 3
RETRY_BACKOFF = [1, 2, 4]

CSV_FIELDS = ["wp_id", "id_numero", "directus_id", "details_url", "download_url", "status", "note"]

# ── Derivazione id_numero (allineata a import_to_directus) ────────────────────

def derive_id_numero(slug: str, fallback_counter: dict) -> str:
    m = re.match(r"^numero-(\d+)-", slug)
    if m:
        return f"OEL-{m.group(1)}"
    m = re.match(r"^insieme-n-(\d+)-", slug)
    if m:
        return f"INS-{m.group(1)}"
    m = re.match(r"^insieme-n-(\d+)$", slug)
    if m:
        return f"INS-{m.group(1)}"
    if slug.startswith("insieme-"):
        fallback_counter["ins"] = fallback_counter.get("ins", 0) - 1
        return f"INS-{fallback_counter['ins']}"
    return slug

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
                log.warning("Retry %s/%s %s - %ss (%s)", attempt + 1, RETRY_MAX, path, w, e)
                time.sleep(w)
            else:
                raise
    raise RuntimeError(f"Max retry: {method} {path}")

# ── Logging ───────────────────────────────────────────────────────────────────

def setup_logging(dry_run: bool) -> tuple[logging.Logger, Path]:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    suffix = "_dryrun" if dry_run else ""
    log_path = LOG_DIR / f"backfill_archive_links_{ts}{suffix}.log"
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
        handlers=[
            logging.FileHandler(log_path, encoding="utf-8"),
            logging.StreamHandler(sys.stdout),
        ],
    )
    return logging.getLogger("backfill_archive"), log_path

# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> int:
    ap = argparse.ArgumentParser(description="PATCH wp_url e pdf_archive_url su numeri_rivista (archive.org)")
    ap.add_argument("--dry-run", action="store_true", help="Nessuna scrittura su Directus")
    args = ap.parse_args()

    log, log_path = setup_logging(args.dry_run)
    log.info("=== backfill_archive_links %s ===", "[DRY-RUN]" if args.dry_run else "")

    if not DIRECTUS_TOKEN:
        log.error("Imposta DIRECTUS_TOKEN.")
        return 1

    # ── Carica archive_links.json ───────────────────────────────────────────
    with open(ARCHIVE_LINKS_PATH, encoding="utf-8") as f:
        archive_links: dict[str, dict] = json.load(f)
    log.info("archive_links.json: %s voci", len(archive_links))

    # ── Carica numeri_rivista_wp.json per wp_id -> id_numero ────────────────
    with open(NUMERI_WP_PATH, encoding="utf-8") as f:
        numeri_wp: list[dict] = json.load(f)

    fallback: dict = {}
    wp_id_to_id_numero: dict[str, str] = {}
    for row in numeri_wp:
        wp_id = row.get("wp_id")
        slug = row.get("slug", "")
        if wp_id is None:
            continue
        id_numero = derive_id_numero(slug, fallback)
        wp_id_to_id_numero[str(wp_id)] = id_numero
    log.info("Mapping wp_id -> id_numero: %s voci", len(wp_id_to_id_numero))

    # ── Cache Directus: id_numero -> uuid ───────────────────────────────────
    log.info("Carico numeri Directus...")
    r = _request("GET", f"/items/{COLLECTION}?fields=id,id_numero,wp_url,pdf_archive_url&limit=-1", log)
    if not r.ok:
        log.error("GET numeri_rivista: %s %s", r.status_code, r.text[:300])
        return 1
    directus_numeri = r.json().get("data", [])
    id_numero_to_directus: dict[str, dict] = {
        n["id_numero"]: n for n in directus_numeri if n.get("id_numero")
    }
    log.info("Numeri Directus: %s", len(id_numero_to_directus))

    # ── CSV ──────────────────────────────────────────────────────────────────
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_path = LOG_DIR / f"backfill_archive_links_{ts}{'_dryrun' if args.dry_run else ''}.csv"
    csv_f = open(csv_path, "w", encoding="utf-8", newline="")
    writer = csv.DictWriter(csv_f, fieldnames=CSV_FIELDS)
    writer.writeheader()

    stats = {"ok": 0, "dry": 0, "skip_no_id_numero": 0, "skip_no_directus": 0, "err": 0}

    items = list(archive_links.items())
    for i, (wp_id_str, links) in enumerate(items):
        id_numero = wp_id_to_id_numero.get(wp_id_str)
        if not id_numero:
            log.warning("wp_id=%s: nessun id_numero nel mapping", wp_id_str)
            writer.writerow({"wp_id": wp_id_str, "id_numero": "", "directus_id": "",
                             "details_url": links.get("details_url") or "",
                             "download_url": links.get("download_url") or "",
                             "status": "skip_no_id_numero", "note": ""})
            stats["skip_no_id_numero"] += 1
            continue

        directus_rec = id_numero_to_directus.get(id_numero)
        if not directus_rec:
            log.warning("id_numero=%s non trovato in Directus", id_numero)
            writer.writerow({"wp_id": wp_id_str, "id_numero": id_numero, "directus_id": "",
                             "details_url": links.get("details_url") or "",
                             "download_url": links.get("download_url") or "",
                             "status": "skip_no_directus", "note": ""})
            stats["skip_no_directus"] += 1
            continue

        uuid = directus_rec["id"]
        payload = {
            "wp_url": links.get("details_url"),        # sfoglia online
            "pdf_archive_url": links.get("download_url"),  # scarica PDF
        }

        if args.dry_run:
            log.info("[DRY] %s (%s) wp_url=%s | pdf=%s", id_numero, uuid[:8],
                     payload["wp_url"], payload["pdf_archive_url"])
            writer.writerow({"wp_id": wp_id_str, "id_numero": id_numero, "directus_id": uuid,
                             "details_url": payload["wp_url"] or "",
                             "download_url": payload["pdf_archive_url"] or "",
                             "status": "dry", "note": ""})
            stats["dry"] += 1
            continue

        resp = _request("PATCH", f"/items/{COLLECTION}/{uuid}", log, json=payload)
        if resp.ok:
            stats["ok"] += 1
            writer.writerow({"wp_id": wp_id_str, "id_numero": id_numero, "directus_id": uuid,
                             "details_url": payload["wp_url"] or "",
                             "download_url": payload["pdf_archive_url"] or "",
                             "status": "ok", "note": ""})
        else:
            log.error("PATCH %s: %s %s", id_numero, resp.status_code, resp.text[:200])
            stats["err"] += 1
            writer.writerow({"wp_id": wp_id_str, "id_numero": id_numero, "directus_id": uuid,
                             "details_url": payload["wp_url"] or "",
                             "download_url": payload["pdf_archive_url"] or "",
                             "status": "error", "note": f"HTTP {resp.status_code}"})

        if (i + 1) % 50 == 0:
            time.sleep(BATCH_DELAY)
            log.info("Progresso: %s/%s", i + 1, len(items))

    csv_f.close()

    log.info("=== FINE ===")
    log.info("PATCH ok:           %s", stats["ok"])
    log.info("Skip no id_numero:  %s", stats["skip_no_id_numero"])
    log.info("Skip no Directus:   %s", stats["skip_no_directus"])
    if args.dry_run:
        log.info("Dry-run:            %s", stats["dry"])
    log.info("Errori:             %s", stats["err"])
    log.info("CSV: %s", csv_path)

    return 0 if stats["err"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
