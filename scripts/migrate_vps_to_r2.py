#!/usr/bin/env python3
"""
scripts/migrate_vps_to_r2.py

Migra le immagini copertina dallo storage locale Directus (VPS) a Cloudflare R2.

Input:
  Directus API — cartella "copertine" (folder e1bd6b06-3057-4c28-8468-29b47de976a3)
  GET /files?filter[folder][_eq]=<UUID>&fields=id,filename_download&limit=-1

Output:
  File caricati su R2 bucket oel-media con chiave copertine/{directus_uuid}
  Log CSV: scripts/db_analysis/logs/migrate_vps_to_r2_<timestamp>.csv

Flusso:
  1. Recupera lista file dalla cartella "copertine" su Directus
  2. Per ogni file: scarica da http://VPS:8055/assets/{id} con Bearer token
  3. Carica su R2 via S3 API (boto3) come copertine/{id}
  4. Salta i file già presenti su R2 (HEAD check)
  5. Scrive log CSV con esito per ogni file

Variabili d'ambiente (.env):
  DIRECTUS_URL          default: http://159.69.196.64:8055
  DIRECTUS_TOKEN        richiesto
  R2_ACCESS_KEY_ID      richiesto
  R2_SECRET_ACCESS_KEY  richiesto
  R2_BUCKET             default: oel-media

Uso:
  pip install boto3 requests python-dotenv tqdm
  python3 scripts/migrate_vps_to_r2.py
  python3 scripts/migrate_vps_to_r2.py --dry-run
  python3 scripts/migrate_vps_to_r2.py --limit 20
  python3 scripts/migrate_vps_to_r2.py --force   # ricarica anche file già presenti
"""

import argparse
import csv
import logging
import os
import sys
import time
from datetime import datetime
from pathlib import Path

import requests

try:
    import boto3
    from botocore.exceptions import ClientError
except ImportError:
    sys.exit("Installa boto3: pip install boto3")

try:
    from tqdm import tqdm
except ImportError:
    sys.exit("Installa tqdm: pip install tqdm")

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ── Costanti ───────────────────────────────────────────────────────────────────

ROOT     = Path(__file__).resolve().parent.parent
LOGS_DIR = ROOT / "scripts" / "db_analysis" / "logs"

FOLDER_UUID   = "e1bd6b06-3057-4c28-8468-29b47de976a3"
R2_ENDPOINT   = "https://6b071de7f55397ada5645e187c932202.r2.cloudflarestorage.com"
R2_KEY_PREFIX = "copertine"
CONTENT_TYPE  = "image/jpeg"
RETRY_DELAYS  = [2, 5, 10]

DIRECTUS_URL         = os.getenv("DIRECTUS_URL", "http://159.69.196.64:8055")
DIRECTUS_TOKEN       = os.getenv("DIRECTUS_TOKEN", "")
R2_ACCESS_KEY_ID     = os.getenv("R2_ACCESS_KEY_ID", "")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "")
R2_BUCKET            = os.getenv("R2_BUCKET", "oel-media")


# ── Logging ───────────────────────────────────────────────────────────────────

def setup_logging(dry_run=False):
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    ts     = datetime.now().strftime("%Y%m%d_%H%M%S")
    suffix = "_dryrun" if dry_run else ""
    logfile = LOGS_DIR / f"migrate_vps_to_r2_{ts}{suffix}.log"
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)-8s %(message)s",
        handlers=[
            logging.FileHandler(logfile, encoding="utf-8"),
            logging.StreamHandler(sys.stdout),
        ],
    )
    logging.info(f"Log: {logfile}")
    return logfile


def open_csv(dry_run=False):
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    ts     = datetime.now().strftime("%Y%m%d_%H%M%S")
    suffix = "_dryrun" if dry_run else ""
    path   = LOGS_DIR / f"migrate_vps_to_r2_{ts}{suffix}.csv"
    fh     = open(path, "w", newline="", encoding="utf-8")
    writer = csv.writer(fh)
    writer.writerow(["directus_id", "filename_download", "r2_key", "esito", "dettaglio"])
    return fh, writer, path


# ── Directus helpers ──────────────────────────────────────────────────────────

def directus_headers():
    return {"Authorization": f"Bearer {DIRECTUS_TOKEN}"}


def get_copertine_files():
    """Restituisce lista di {id, filename_download} dalla cartella copertine."""
    params = {
        "filter[folder][_eq]": FOLDER_UUID,
        "fields": "id,filename_download",
        "limit": -1,
    }
    url = f"{DIRECTUS_URL}/files"
    for attempt in range(3):
        try:
            r = requests.get(url, headers=directus_headers(), params=params, timeout=30)
            r.raise_for_status()
            return r.json().get("data", [])
        except Exception as e:
            if attempt < 2:
                time.sleep(RETRY_DELAYS[attempt])
            else:
                raise RuntimeError(f"Impossibile recuperare file da Directus: {e}")


def download_asset(file_id):
    """Scarica il file da Directus assets. Restituisce (bytes, content_type) o (None, errore)."""
    url = f"{DIRECTUS_URL}/assets/{file_id}"
    for attempt in range(3):
        try:
            r = requests.get(url, headers=directus_headers(), timeout=30)
            if r.status_code == 404:
                return None, "404"
            r.raise_for_status()
            ct = r.headers.get("content-type", CONTENT_TYPE).split(";")[0].strip()
            return r.content, ct
        except requests.exceptions.Timeout:
            if attempt < 2:
                time.sleep(RETRY_DELAYS[attempt])
            else:
                return None, "timeout"
        except Exception as e:
            if attempt < 2:
                time.sleep(RETRY_DELAYS[attempt])
            else:
                return None, str(e)


# ── R2 helpers ────────────────────────────────────────────────────────────────

def make_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        region_name="auto",
    )


def r2_key(file_id):
    return f"{R2_KEY_PREFIX}/{file_id}"


def r2_exists(s3, file_id):
    try:
        s3.head_object(Bucket=R2_BUCKET, Key=r2_key(file_id))
        return True
    except ClientError as e:
        if e.response["Error"]["Code"] in ("404", "NoSuchKey", "400"):
            return False
        raise


def r2_upload(s3, file_id, content, content_type):
    s3.put_object(
        Bucket=R2_BUCKET,
        Key=r2_key(file_id),
        Body=content,
        ContentType=content_type,
    )


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Migra copertine Directus -> R2")
    parser.add_argument("--dry-run", action="store_true", help="Simula senza scaricare/caricare")
    parser.add_argument("--limit",   type=int, default=0,    help="Limita a N file")
    parser.add_argument("--force",   action="store_true",    help="Ricarica anche file già presenti su R2")
    parser.add_argument("--delay",   type=int, default=100,  help="Delay tra upload in ms (default 100)")
    args = parser.parse_args()

    setup_logging(args.dry_run)

    # Validazione variabili
    missing = [v for v in ("DIRECTUS_TOKEN", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY")
               if not os.getenv(v)]
    if missing:
        sys.exit(f"Variabili mancanti: {', '.join(missing)}")

    logging.info(f"{'[DRY-RUN] ' if args.dry_run else ''}DIRECTUS: {DIRECTUS_URL} | R2: {R2_BUCKET}")

    # 1. Lista file da Directus
    logging.info("Recupero lista file dalla cartella 'copertine' su Directus ...")
    files = get_copertine_files()
    logging.info(f"  -> {len(files)} file trovati")

    if args.limit > 0:
        files = files[:args.limit]
        logging.info(f"  Limitato a {len(files)} (--limit)")

    # 2. Client R2
    s3 = None if args.dry_run else make_s3_client()

    # 3. CSV log
    csv_fh, csv_writer, csv_path = open_csv(args.dry_run)

    # Contatori
    caricati = saltati = errori_dl = errori_up = 0
    delay_s  = args.delay / 1000.0

    for item in tqdm(files, desc="copertine", unit="img"):
        fid      = item["id"]
        fname    = item.get("filename_download", "")
        key      = r2_key(fid)

        # Dry-run
        if args.dry_run:
            logging.debug(f"  [dry-run] {fid} -> {key}")
            csv_writer.writerow([fid, fname, key, "dry-run", ""])
            caricati += 1
            continue

        # Skip se già presente (a meno di --force)
        if not args.force and r2_exists(s3, fid):
            logging.debug(f"  skip (già presente) {fid}")
            csv_writer.writerow([fid, fname, key, "skip", "già presente su R2"])
            saltati += 1
            continue

        # Download da Directus
        content, ct = download_asset(fid)
        if content is None:
            logging.warning(f"  ERRORE download {fid}: {ct}")
            csv_writer.writerow([fid, fname, key, "errore_download", ct])
            errori_dl += 1
            continue

        # Upload su R2
        try:
            r2_upload(s3, fid, content, ct)
            logging.debug(f"  OK {fid} ({len(content)} bytes) -> {key}")
            csv_writer.writerow([fid, fname, key, "ok", f"{len(content)} bytes"])
            caricati += 1
        except Exception as e:
            logging.warning(f"  ERRORE upload {fid}: {e}")
            csv_writer.writerow([fid, fname, key, "errore_upload", str(e)])
            errori_up += 1

        if delay_s > 0:
            time.sleep(delay_s)

    csv_fh.close()

    logging.info(f"\n{'='*60}")
    logging.info(f"{'[DRY-RUN] ' if args.dry_run else ''}RIEPILOGO")
    logging.info(f"{'='*60}")
    logging.info(f"  Totale file       : {len(files)}")
    logging.info(f"  Caricati su R2    : {caricati}")
    logging.info(f"  Saltati (già ok)  : {saltati}")
    logging.info(f"  Errori download   : {errori_dl}")
    logging.info(f"  Errori upload     : {errori_up}")
    logging.info(f"  CSV log           : {csv_path}")
    logging.info(f"{'='*60}")


if __name__ == "__main__":
    main()
