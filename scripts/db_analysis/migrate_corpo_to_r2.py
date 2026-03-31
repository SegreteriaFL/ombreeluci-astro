#!/usr/bin/env python3
"""
scripts/db_analysis/migrate_corpo_to_r2.py

I file inline del corpo articoli sono stati caricati su Directus local storage
anziche' su R2. Questo script:
  1. Fetcha tutti i file nella cartella Directus "corpo" (storage=local)
  2. Scarica ciascun file dal VPS via cms.ombreeluci.it/assets/{uuid}
  3. Uploada su R2 con chiave  corpo/{uuid}  (senza estensione, come le copertine)
  4. Aggiorna il campo storage su Directus (opzionale — gli src negli articoli
     puntano gia' a r2.dev/corpo/{uuid} quindi il sito torna a funzionare
     anche solo con il passo 3)

Uso:
    python scripts/db_analysis/migrate_corpo_to_r2.py --dry-run
    python scripts/db_analysis/migrate_corpo_to_r2.py
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.parse
from datetime import datetime
from pathlib import Path

import boto3
from botocore.exceptions import ClientError

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ── Config ─────────────────────────────────────────────────────────────────────

ROOT           = Path(__file__).resolve().parent.parent.parent
LOGS_DIR       = ROOT / "scripts" / "db_analysis" / "logs"

DIRECTUS_URL   = os.environ.get("DIRECTUS_URL",   "http://159.69.196.64:8055")
DIRECTUS_TOKEN = os.environ.get("DIRECTUS_TOKEN", "nBZ6kdd0YgVnhLm2TZEDoT9A-NJujwVU")

# VPS: scarica tramite tunnel Cloudflare
CMS_PUBLIC_URL = "https://cms.ombreeluci.it"

# R2
R2_ACCESS_KEY_ID  = os.environ.get("R2_ACCESS_KEY_ID",     "b02eea04a30039d07ecf02fa0bd755fb")
R2_SECRET_KEY     = os.environ.get("R2_SECRET_ACCESS_KEY", "8a080903cd5c949883c43df8a362db98d9ebc1dcd220e3704cf1f812b8e867fb")
R2_BUCKET         = "oel-media"
R2_ENDPOINT       = "https://6b071de7f55397ada5645e187c932202.r2.cloudflarestorage.com"
R2_FOLDER         = "corpo"   # chiave: corpo/{uuid}  (senza estensione)

DIRECTUS_FOLDER_ID = "3b10a9ae-8757-4edb-932a-fac5d16f58d0"

DELAY_S = 0.2


# ── Helpers ────────────────────────────────────────────────────────────────────

def directus_get_all_corpo_files() -> list[dict]:
    results = []
    offset  = 0
    while True:
        params = urllib.parse.urlencode({
            "filter": json.dumps({"folder": {"_eq": DIRECTUS_FOLDER_ID}, "storage": {"_eq": "local"}}),
            "fields": "id,filename_disk,type",
            "limit":  200,
            "offset": offset,
        })
        req = urllib.request.Request(
            f"{DIRECTUS_URL}/files?{params}",
            headers={"Authorization": f"Bearer {DIRECTUS_TOKEN}"},
        )
        with urllib.request.urlopen(req, timeout=30) as r:
            batch = json.loads(r.read())["data"]
        results.extend(batch)
        if len(batch) < 200:
            break
        offset += 200
    return results


def download_from_vps(uuid: str) -> tuple[bytes | None, str]:
    """Scarica file dal VPS via API diretta con token. Ritorna (bytes, content_type)."""
    url = f"{DIRECTUS_URL}/assets/{uuid}"
    for attempt in range(3):
        try:
            req = urllib.request.Request(
                url,
                headers={"Authorization": f"Bearer {DIRECTUS_TOKEN}"},
            )
            with urllib.request.urlopen(req, timeout=30) as r:
                ct = r.headers.get("Content-Type", "image/jpeg").split(";")[0].strip()
                return r.read(), ct
        except Exception as e:
            if attempt == 2:
                return None, str(e)
            time.sleep(2 ** attempt)
    return None, "timeout"


def upload_to_r2(s3, content: bytes, uuid: str, content_type: str, dry_run: bool) -> bool:
    key = f"{R2_FOLDER}/{uuid}"
    if dry_run:
        print(f"    [dry-run] would upload {key} ({len(content)} bytes, {content_type})")
        return True
    try:
        s3.put_object(
            Bucket=R2_BUCKET,
            Key=key,
            Body=content,
            ContentType=content_type,
        )
        return True
    except ClientError as e:
        print(f"    R2 error: {e}")
        return False


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    sys.stdout.reconfigure(encoding="utf-8")

    ts     = datetime.now().strftime("%Y%m%d_%H%M%S")
    suffix = "_dryrun" if args.dry_run else ""
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    log_path = LOGS_DIR / f"migrate_corpo_to_r2_{ts}{suffix}.csv"

    print(f"{'[DRY-RUN] ' if args.dry_run else ''}migrate_corpo_to_r2")

    # ── S3 client ──────────────────────────────────────────────────────────────
    s3 = boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_KEY,
        region_name="auto",
    )

    # ── Fetch lista file ───────────────────────────────────────────────────────
    print("Fetch file dalla cartella Directus 'corpo'...")
    files = directus_get_all_corpo_files()
    print(f"File da migrare: {len(files)}")

    ok = err = skip = 0

    with open(log_path, "w", encoding="utf-8", newline="") as log_fh:
        log_fh.write("uuid,status\n")

        for i, f in enumerate(files, 1):
            uuid = f["id"]
            ct   = f.get("type") or "image/jpeg"

            # Verifica se gia' su R2
            if not args.dry_run:
                try:
                    s3.head_object(Bucket=R2_BUCKET, Key=f"{R2_FOLDER}/{uuid}")
                    log_fh.write(f"{uuid},already_on_r2\n")
                    skip += 1
                    if i % 50 == 0:
                        print(f"[{i}/{len(files)}] ok={ok} err={err} skip={skip}")
                    continue
                except ClientError:
                    pass  # non esiste, procedi

            # Download dal VPS
            content, dl_ct = download_from_vps(uuid)
            if content is None:
                print(f"  download fail {uuid}: {dl_ct}")
                log_fh.write(f"{uuid},download_error:{dl_ct}\n")
                err += 1
                continue

            # Usa content-type dal download se disponibile
            if dl_ct and dl_ct.startswith("image/"):
                ct = dl_ct

            # Upload su R2
            if upload_to_r2(s3, content, uuid, ct, args.dry_run):
                log_fh.write(f"{uuid},ok\n")
                ok += 1
            else:
                log_fh.write(f"{uuid},r2_error\n")
                err += 1

            if i % 20 == 0 or i == len(files):
                print(f"[{i}/{len(files)}] ok={ok} err={err} skip={skip}")
                log_fh.flush()

            if not args.dry_run:
                time.sleep(DELAY_S)

    print(f"\nCompletato — ok={ok}, err={err}, skip={skip}")
    print(f"Log: {log_path}")


if __name__ == "__main__":
    main()
