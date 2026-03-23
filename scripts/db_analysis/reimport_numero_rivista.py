#!/usr/bin/env python3
"""
scripts/db_analysis/reimport_numero_rivista.py

Aggiorna il campo numero_rivista su tutti gli articoli Directus usando
il mapping wp_id → id_numero estratto da articolo_numero_mapping.json.

Logica:
  - Articoli presenti nel mapping → PATCH numero_rivista = UUID del numero
  - Articoli NON nel mapping (online-only, 693 ca.) → PATCH numero_rivista = null
  - Risoluzione UUID: GET /items/numeri_rivista?filter[id_numero][_eq]=X
  - Risoluzione articolo: GET /items/articoli?filter[wp_id][_eq]=X&fields=id
  - I UUID numeri_rivista vengono cachati in memoria (204 lookup, fatto una volta)
  - Batch PATCH da 50 articoli, delay 200ms tra batch

Uso:
  python3 scripts/db_analysis/reimport_numero_rivista.py [--dry-run]

  --dry-run    Simula senza scrivere. Stampa i primi 20 aggiornamenti previsti.

Variabili d'ambiente (o file .env nella root):
  DIRECTUS_URL    URL base Directus (default: http://159.69.196.64:8055)
  DIRECTUS_TOKEN  Token API admin

Input:
  scripts/db_analysis/output/articolo_numero_mapping.json
  scripts/db_analysis/output/articoli_wp_puliti.json  (per lista completa wp_id)

Output:
  scripts/db_analysis/logs/reimport_numero_rivista_{timestamp}.csv
  scripts/db_analysis/logs/reimport_numero_rivista_{timestamp}.log
"""

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

ROOT           = Path(__file__).resolve().parent.parent.parent
DATA_DIR       = ROOT / "scripts/db_analysis/output"
MAPPING_PATH   = DATA_DIR / "articolo_numero_mapping.json"
ARTICOLI_PATH  = DATA_DIR / "articoli_wp_puliti.json"
LOG_DIR        = ROOT / "scripts/db_analysis/logs"

DIRECTUS_URL   = os.getenv("DIRECTUS_URL",   "http://159.69.196.64:8055")
DIRECTUS_TOKEN = os.getenv("DIRECTUS_TOKEN", "nBZ6kdd0YgVnhLm2TZEDoT9A-NJujwVU")

BATCH_SIZE     = 50
BATCH_DELAY    = 0.20   # secondi tra batch
REQUEST_DELAY  = 0.05   # secondi tra singole GET
RETRY_MAX      = 3
RETRY_BACKOFF  = [1, 2, 4]

# ── Logging ───────────────────────────────────────────────────────────────────

def setup_logging(dry_run: bool) -> tuple[logging.Logger, Path]:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    suffix = "_dryrun" if dry_run else ""
    log_path = LOG_DIR / f"reimport_numero_rivista_{ts}{suffix}.log"

    fmt = "%(asctime)s | %(levelname)s | %(message)s"
    logging.basicConfig(
        level=logging.INFO,
        format=fmt,
        handlers=[
            logging.FileHandler(log_path, encoding="utf-8"),
            logging.StreamHandler(sys.stdout),
        ],
    )
    return logging.getLogger("reimport_nr"), log_path

# ── HTTP helpers ──────────────────────────────────────────────────────────────

def _headers() -> dict:
    return {"Authorization": f"Bearer {DIRECTUS_TOKEN}", "Content-Type": "application/json"}


def _request(method: str, path: str, log: logging.Logger, **kwargs) -> requests.Response:
    url = f"{DIRECTUS_URL}{path}"
    for attempt in range(RETRY_MAX):
        try:
            r = requests.request(method, url, headers=_headers(), timeout=30, **kwargs)
            time.sleep(REQUEST_DELAY)
            return r
        except requests.RequestException as e:
            if attempt < RETRY_MAX - 1:
                wait = RETRY_BACKOFF[attempt]
                log.warning(f"Retry {attempt+1}/{RETRY_MAX} {method} {path}: {e} — {wait}s")
                time.sleep(wait)
            else:
                raise
    raise RuntimeError(f"Max retry raggiunto: {method} {path}")


def get_one(collection: str, field: str, value: str, fields: str,
            log: logging.Logger) -> dict | None:
    """GET /items/{collection}?filter[field][_eq]=value&fields=fields&limit=1"""
    val_enc = str(value).replace("/", "%2F")
    path = f"/items/{collection}?filter[{field}][_eq]={val_enc}&fields={fields}&limit=1"
    r = _request("GET", path, log)
    if r.ok:
        data = r.json().get("data", [])
        return data[0] if data else None
    log.error(f"GET {collection} [{field}={value}]: {r.status_code} {r.text[:200]}")
    return None


def patch_item(collection: str, item_id: str, payload: dict,
               log: logging.Logger) -> bool:
    """PATCH /items/{collection}/{id}"""
    r = _request("PATCH", f"/items/{collection}/{item_id}", log, json=payload)
    if r.ok:
        return True
    log.error(f"PATCH {collection}/{item_id}: {r.status_code} {r.text[:200]}")
    return False

# ── Cache UUID numeri_rivista ─────────────────────────────────────────────────

def build_numero_uuid_cache(log: logging.Logger) -> dict[str, str]:
    """
    Carica tutti i numeri_rivista dal server una volta sola.
    Ritorna {id_numero: uuid}.
    """
    log.info("Caricamento cache numeri_rivista dal server...")
    path = "/items/numeri_rivista?fields=id,id_numero&limit=-1"
    r = _request("GET", path, log)
    if not r.ok:
        log.error(f"Impossibile caricare numeri_rivista: {r.status_code}")
        sys.exit(1)
    cache: dict[str, str] = {}
    for rec in r.json().get("data", []):
        if rec.get("id_numero") and rec.get("id"):
            cache[rec["id_numero"]] = rec["id"]
    log.info(f"Cache numeri_rivista: {len(cache)} voci")
    return cache

# ── CSV output ────────────────────────────────────────────────────────────────

CSV_FIELDS = [
    "wp_id", "articolo_uuid", "id_numero", "numero_uuid",
    "action", "status", "note",
]

# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> int:
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true",
                    help="Simula senza scrivere su Directus")
    args = ap.parse_args()

    log, log_path = setup_logging(args.dry_run)
    log.info(f"=== reimport_numero_rivista {'[DRY-RUN]' if args.dry_run else ''} ===")
    log.info(f"Log: {log_path}")

    # ── Carica input ──────────────────────────────────────────────────────────
    if not MAPPING_PATH.exists():
        log.error(f"Mapping non trovato: {MAPPING_PATH}")
        return 1
    if not ARTICOLI_PATH.exists():
        log.error(f"articoli_wp_puliti non trovato: {ARTICOLI_PATH}")
        return 1

    with open(MAPPING_PATH, encoding="utf-8") as f:
        mapping_list: list[dict] = json.load(f)
    with open(ARTICOLI_PATH, encoding="utf-8") as f:
        articoli_raw: list[dict] = json.load(f)

    # wp_id → id_numero per articoli con mapping
    wp_to_id_numero: dict[int, str] = {
        r["wp_id"]: r["id_numero"] for r in mapping_list
    }
    # tutti i wp_id pubblicati
    all_wp_ids: list[int] = [a["wp_id"] for a in articoli_raw]

    log.info(f"Articoli totali:       {len(all_wp_ids)}")
    log.info(f"Articoli con mapping:  {len(wp_to_id_numero)}")
    log.info(f"Articoli senza mapping (null):   {len(all_wp_ids) - len(wp_to_id_numero)}")

    # ── Cache numeri rivista ──────────────────────────────────────────────────
    if not args.dry_run:
        numero_uuid_cache = build_numero_uuid_cache(log)
    else:
        numero_uuid_cache = {"OEL-1": "dry-uuid-oel-1"}  # fake per dry-run

    # ── Setup CSV ─────────────────────────────────────────────────────────────
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    suffix = "_dryrun" if args.dry_run else ""
    csv_path = LOG_DIR / f"reimport_numero_rivista_{ts}{suffix}.csv"
    csv_file = open(csv_path, "w", encoding="utf-8", newline="")
    writer = csv.DictWriter(csv_file, fieldnames=CSV_FIELDS)
    writer.writeheader()

    # ── Statistiche ───────────────────────────────────────────────────────────
    stats = {
        "ok_set":        0,   # PATCH numero_rivista = uuid OK
        "ok_null":       0,   # PATCH numero_rivista = null OK
        "skip_no_art":   0,   # articolo non trovato in Directus
        "skip_no_num":   0,   # id_numero non trovato in cache
        "err":           0,   # PATCH fallito
        "dry":           0,   # simulato in dry-run
    }

    def write_csv(row: dict) -> None:
        writer.writerow({f: row.get(f, "") for f in CSV_FIELDS})

    # ── Elaborazione a batch ──────────────────────────────────────────────────
    log.info("Inizio aggiornamenti...")

    dry_preview_count = 0
    batch_updates: list[tuple[int, str | None, str, str]] = []
    # (wp_id, numero_uuid_or_none, id_numero_or_"null", action)

    for wp_id in all_wp_ids:
        id_numero = wp_to_id_numero.get(wp_id)

        if id_numero:
            numero_uuid = numero_uuid_cache.get(id_numero)
            if not numero_uuid and not args.dry_run:
                # In run reale: salta se il numero non esiste in Directus
                log.warning(f"wp_id={wp_id}: id_numero={id_numero} non in cache numeri_rivista")
                write_csv({"wp_id": wp_id, "id_numero": id_numero,
                           "action": "set", "status": "skip_no_num",
                           "note": f"{id_numero} non trovato in Directus"})
                stats["skip_no_num"] += 1
                continue
            batch_updates.append((wp_id, numero_uuid, id_numero, "set"))
        else:
            batch_updates.append((wp_id, None, "null", "null"))

    log.info(f"Aggiornamenti da processare: {len(batch_updates)}")

    for i in range(0, len(batch_updates), BATCH_SIZE):
        batch = batch_updates[i : i + BATCH_SIZE]

        for wp_id, numero_uuid, id_numero_label, action in batch:
            if args.dry_run:
                if dry_preview_count < 20:
                    log.info(f"[DRY] wp_id={wp_id} -> numero_rivista={numero_uuid} ({id_numero_label})")
                    dry_preview_count += 1
                write_csv({"wp_id": wp_id, "id_numero": id_numero_label,
                           "numero_uuid": numero_uuid or "",
                           "action": action, "status": "dry", "note": ""})
                stats["dry"] += 1
                continue

            # Risolvi UUID articolo
            art_rec = get_one("articoli", "wp_id", wp_id, "id", log)
            if not art_rec:
                log.warning(f"wp_id={wp_id}: articolo non trovato in Directus")
                write_csv({"wp_id": wp_id, "id_numero": id_numero_label,
                           "action": action, "status": "skip_no_art",
                           "note": "articolo non trovato"})
                stats["skip_no_art"] += 1
                continue

            art_uuid = art_rec["id"]
            payload = {"numero_rivista": numero_uuid}  # None → null in JSON

            ok = patch_item("articoli", art_uuid, payload, log)
            if ok:
                key = "ok_set" if action == "set" else "ok_null"
                stats[key] += 1
                write_csv({"wp_id": wp_id, "articolo_uuid": art_uuid,
                           "id_numero": id_numero_label, "numero_uuid": numero_uuid or "",
                           "action": action, "status": "ok", "note": ""})
            else:
                stats["err"] += 1
                write_csv({"wp_id": wp_id, "articolo_uuid": art_uuid,
                           "id_numero": id_numero_label, "numero_uuid": numero_uuid or "",
                           "action": action, "status": "error", "note": "PATCH fallito"})

        # Delay tra batch (solo in run reale)
        if not args.dry_run:
            time.sleep(BATCH_DELAY)

        processed = min(i + BATCH_SIZE, len(batch_updates))
        if processed % 500 == 0 or processed == len(batch_updates):
            log.info(f"  Processati {processed}/{len(batch_updates)} — "
                     f"ok_set={stats['ok_set']} ok_null={stats['ok_null']} "
                     f"err={stats['err']}")

    csv_file.close()

    log.info("=== FINE ===")
    log.info(f"ok_set (numero assegnato):   {stats['ok_set']}")
    log.info(f"ok_null (numero rimosso):    {stats['ok_null']}")
    log.info(f"skip_no_art (art mancante):  {stats['skip_no_art']}")
    log.info(f"skip_no_num (num mancante):  {stats['skip_no_num']}")
    log.info(f"errori PATCH:                {stats['err']}")
    if args.dry_run:
        log.info(f"simulati (dry-run):          {stats['dry']}")
    log.info(f"CSV: {csv_path}")

    return 0 if stats["err"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
