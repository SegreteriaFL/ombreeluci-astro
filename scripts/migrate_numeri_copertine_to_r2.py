#!/usr/bin/env python3
"""
scripts/migrate_numeri_copertine_to_r2.py

Migra le copertine dei numeri rivista da WordPress a Cloudflare R2
e aggiorna il campo copertina_url in Directus.

Input:
  scripts/db_analysis/output/numeri_rivista_wp.json
    lista {wp_id, slug, title, date, ...} — 204 record
  scripts/db_analysis/output/immagini_copertina_wp.json
    mappa {post_id, thumbnail_wp_id, src, alt} — 3251 record

Output:
  File caricati su R2 bucket oel-media con chiave numeri/{wp_id}.jpg
  Campo Directus numeri_rivista.copertina_url aggiornato con URL R2
  Log CSV: scripts/db_analysis/logs/migrate_numeri_copertine_to_r2_<timestamp>.csv

Flusso:
  1. Carica numeri_rivista_wp.json e immagini_copertina_wp.json
  2. Incrocia per post_id → url WordPress (204/204 match garantito)
  3. Pre-query Directus: costruisce mappa id_numero → directus_uuid
  4. Per ogni numero: scarica immagine dall'URL WordPress
  5. Carica su R2 come numeri/{wp_id}.jpg
  6. Salta se già presente su R2 (HEAD check)
  7. PATCH Directus: /items/numeri_rivista/{uuid} con copertina_url
  8. Scrive log CSV

Variabili d'ambiente (.env):
  DIRECTUS_URL          default: http://159.69.196.64:8055
  DIRECTUS_TOKEN        richiesto (tranne --dry-run)
  R2_ACCESS_KEY_ID      richiesto (tranne --dry-run)
  R2_SECRET_ACCESS_KEY  richiesto (tranne --dry-run)
  R2_BUCKET             default: oel-media
  R2_PUBLIC_BASE        default: https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev

Uso:
  pip install boto3 requests python-dotenv tqdm
  python3 scripts/migrate_numeri_copertine_to_r2.py --dry-run
  python3 scripts/migrate_numeri_copertine_to_r2.py
  python3 scripts/migrate_numeri_copertine_to_r2.py --limit 10
  python3 scripts/migrate_numeri_copertine_to_r2.py --force        # ricarica e ripatcha tutto
  python3 scripts/migrate_numeri_copertine_to_r2.py --skip-patch   # solo R2, senza PATCH Directus
"""

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
DATA_DIR = ROOT / "scripts" / "db_analysis" / "output"
LOGS_DIR = ROOT / "scripts" / "db_analysis" / "logs"

R2_ENDPOINT   = "https://6b071de7f55397ada5645e187c932202.r2.cloudflarestorage.com"
R2_KEY_PREFIX = "numeri"
RETRY_DELAYS  = [2, 5, 10]

DIRECTUS_URL         = os.getenv("DIRECTUS_URL", "http://159.69.196.64:8055")
DIRECTUS_TOKEN       = os.getenv("DIRECTUS_TOKEN", "")
R2_ACCESS_KEY_ID     = os.getenv("R2_ACCESS_KEY_ID", "")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "")
R2_BUCKET            = os.getenv("R2_BUCKET", "oel-media")
R2_PUBLIC_BASE       = os.getenv("R2_PUBLIC_BASE", "https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev")


# ── Logging / CSV ─────────────────────────────────────────────────────────────

def setup_logging(dry_run=False):
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    ts     = datetime.now().strftime("%Y%m%d_%H%M%S")
    suffix = "_dryrun" if dry_run else ""
    logfile = LOGS_DIR / f"migrate_numeri_copertine_to_r2_{ts}{suffix}.log"
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
    path   = LOGS_DIR / f"migrate_numeri_copertine_to_r2_{ts}{suffix}.csv"
    fh     = open(path, "w", newline="", encoding="utf-8")
    writer = csv.writer(fh)
    writer.writerow(["wp_id", "id_numero", "r2_key", "wp_src", "esito", "dettaglio"])
    return fh, writer, path


# ── Dati locali ───────────────────────────────────────────────────────────────

def load_json_file(path: Path, label: str):
    if not path.exists():
        sys.exit(f"File non trovato: {path}")
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    logging.info(f"Caricato {label}: {len(data)} record")
    return data


def derive_id_numero(slug: str, fallback_counter: dict) -> str:
    """
    Deriva id_numero da slug — stessa logica di import_to_directus.py.
    Necessario per costruire il filtro PATCH verso Directus.
    """
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


def build_numeri_index(numeri_wp: list, imgs_by_post: dict) -> list:
    """
    Restituisce lista di dict:
      {wp_id, slug, id_numero, wp_src}
    Skippa record senza immagine (non dovrebbe accadere: 204/204 match).
    """
    fallback_counter: dict = {}
    result = []
    for row in numeri_wp:
        wp_id = row["wp_id"]
        slug  = row["slug"]
        img   = imgs_by_post.get(wp_id)
        if not img or not img.get("src"):
            logging.warning(f"  Nessuna immagine per wp_id={wp_id} slug={slug} — skip")
            continue
        id_numero = derive_id_numero(slug, fallback_counter)
        result.append({
            "wp_id":     wp_id,
            "slug":      slug,
            "id_numero": id_numero,
            "wp_src":    img["src"],
        })
    return result


# ── Directus helpers ──────────────────────────────────────────────────────────

def directus_headers():
    return {"Authorization": f"Bearer {DIRECTUS_TOKEN}", "Content-Type": "application/json"}


def fetch_directus_numeri_map() -> dict:
    """
    Restituisce mappa {id_numero: directus_uuid} leggendo tutti i numeri_rivista.
    Usata per costruire l'URL del PATCH senza dipendere dal filtro query.
    """
    url = f"{DIRECTUS_URL}/items/numeri_rivista?fields=id,id_numero&limit=-1"
    for attempt in range(3):
        try:
            r = requests.get(url, headers={"Authorization": f"Bearer {DIRECTUS_TOKEN}"}, timeout=30)
            r.raise_for_status()
            data = r.json().get("data", [])
            mapping = {row["id_numero"]: row["id"] for row in data}
            logging.info(f"Directus: {len(mapping)} numeri_rivista caricati")
            return mapping
        except Exception as e:
            if attempt < 2:
                time.sleep(RETRY_DELAYS[attempt])
            else:
                raise RuntimeError(f"Impossibile leggere numeri_rivista da Directus: {e}")


def patch_copertina_url(directus_uuid: str, copertina_url: str) -> tuple[bool, str]:
    """
    PATCH /items/numeri_rivista/{uuid} con {copertina_url: ...}.
    Restituisce (successo, dettaglio).
    """
    url = f"{DIRECTUS_URL}/items/numeri_rivista/{directus_uuid}"
    for attempt in range(3):
        try:
            r = requests.patch(url, headers=directus_headers(),
                               json={"copertina_url": copertina_url}, timeout=15)
            if r.status_code == 200:
                return True, "patch ok"
            return False, f"HTTP {r.status_code}: {r.text[:120]}"
        except Exception as e:
            if attempt < 2:
                time.sleep(RETRY_DELAYS[attempt])
            else:
                return False, str(e)


# ── Download helpers ───────────────────────────────────────────────────────────

def download_wp_image(url: str) -> tuple:
    """
    Scarica immagine dall'URL WordPress.
    Restituisce (bytes, content_type) o (None, errore).
    """
    for attempt in range(3):
        try:
            r = requests.get(url, timeout=30, allow_redirects=True)
            if r.status_code == 404:
                return None, "404"
            r.raise_for_status()
            ct = r.headers.get("content-type", "image/jpeg").split(";")[0].strip()
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


def r2_key(wp_id: int) -> str:
    return f"{R2_KEY_PREFIX}/{wp_id}.jpg"


def r2_public_url(wp_id: int) -> str:
    return f"{R2_PUBLIC_BASE}/{R2_KEY_PREFIX}/{wp_id}.jpg"


def r2_exists(s3, wp_id: int) -> bool:
    try:
        s3.head_object(Bucket=R2_BUCKET, Key=r2_key(wp_id))
        return True
    except ClientError as e:
        if e.response["Error"]["Code"] in ("404", "NoSuchKey", "400"):
            return False
        raise


def r2_upload(s3, wp_id: int, content: bytes, content_type: str):
    s3.put_object(
        Bucket=R2_BUCKET,
        Key=r2_key(wp_id),
        Body=content,
        ContentType=content_type,
    )


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Migra copertine numeri WP -> R2 + Directus")
    parser.add_argument("--dry-run",    action="store_true", help="Simula senza scaricare/caricare/patchare")
    parser.add_argument("--limit",      type=int, default=0,   help="Limita a N numeri")
    parser.add_argument("--force",      action="store_true",   help="Ricarica e ripatcha anche file già presenti su R2")
    parser.add_argument("--skip-patch", action="store_true",   help="Solo R2, senza PATCH Directus")
    parser.add_argument("--delay",      type=int, default=200, help="Delay tra operazioni in ms (default 200)")
    args = parser.parse_args()

    setup_logging(args.dry_run)

    if args.dry_run:
        missing = []
    else:
        missing = [v for v in ("DIRECTUS_TOKEN", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY")
                   if not os.getenv(v)]
    if missing:
        sys.exit(f"Variabili mancanti: {', '.join(missing)}")

    logging.info(f"{'[DRY-RUN] ' if args.dry_run else ''}DIRECTUS: {DIRECTUS_URL} | R2: {R2_BUCKET}")

    # 1. Carica dati locali
    numeri_wp = load_json_file(DATA_DIR / "numeri_rivista_wp.json",    "numeri_rivista_wp")
    imgs_raw  = load_json_file(DATA_DIR / "immagini_copertina_wp.json", "immagini_copertina_wp")

    imgs_by_post = {row["post_id"]: row for row in imgs_raw}
    numeri = build_numeri_index(numeri_wp, imgs_by_post)
    logging.info(f"Numeri con immagine pronta: {len(numeri)}")

    if args.limit > 0:
        numeri = numeri[:args.limit]
        logging.info(f"Limitato a {len(numeri)} (--limit)")

    # 2. Pre-query Directus per mappa id_numero → uuid
    directus_map: dict = {}
    if not args.dry_run and not args.skip_patch:
        directus_map = fetch_directus_numeri_map()

    # 3. Client R2
    s3 = None if args.dry_run else make_s3_client()

    # 4. CSV log
    csv_fh, csv_writer, csv_path = open_csv(args.dry_run)

    caricati = saltati = errori_dl = errori_up = errori_patch = patch_ok = 0
    delay_s  = args.delay / 1000.0

    for item in tqdm(numeri, desc="copertine numeri", unit="num"):
        wp_id     = item["wp_id"]
        id_numero = item["id_numero"]
        wp_src    = item["wp_src"]
        key       = r2_key(wp_id)
        pub_url   = r2_public_url(wp_id)

        # Dry-run
        if args.dry_run:
            logging.debug(f"  [dry-run] {id_numero} wp_id={wp_id} -> {key}")
            csv_writer.writerow([wp_id, id_numero, key, wp_src, "dry-run", ""])
            caricati += 1
            continue

        already_on_r2 = not args.force and r2_exists(s3, wp_id)

        if already_on_r2:
            logging.debug(f"  skip R2 (già presente) {id_numero}")
            # Patcha Directus anche se R2 è già ok (utile su primo run del campo)
            if not args.skip_patch:
                d_uuid = directus_map.get(id_numero)
                if d_uuid:
                    ok, det = patch_copertina_url(d_uuid, pub_url)
                    if ok:
                        patch_ok += 1
                    else:
                        logging.warning(f"  ERRORE patch {id_numero}: {det}")
                        errori_patch += 1
                    csv_writer.writerow([wp_id, id_numero, key, wp_src, "skip_r2+patch", det])
                else:
                    logging.warning(f"  id_numero non trovato in Directus: {id_numero}")
                    csv_writer.writerow([wp_id, id_numero, key, wp_src, "skip_r2+no_directus", ""])
            else:
                csv_writer.writerow([wp_id, id_numero, key, wp_src, "skip", "già presente su R2"])
            saltati += 1
            continue

        # Download dall'URL WordPress
        content, ct = download_wp_image(wp_src)
        if content is None:
            logging.warning(f"  ERRORE download {id_numero} wp_id={wp_id}: {ct}")
            csv_writer.writerow([wp_id, id_numero, key, wp_src, "errore_download", ct])
            errori_dl += 1
            continue

        # Upload su R2
        try:
            r2_upload(s3, wp_id, content, ct)
            logging.debug(f"  OK R2 {id_numero} ({len(content)} bytes) -> {key}")
            caricati += 1
        except Exception as e:
            logging.warning(f"  ERRORE upload {id_numero}: {e}")
            csv_writer.writerow([wp_id, id_numero, key, wp_src, "errore_upload", str(e)])
            errori_up += 1
            continue

        # PATCH Directus
        patch_detail = "skip_patch"
        if not args.skip_patch:
            d_uuid = directus_map.get(id_numero)
            if d_uuid:
                ok, patch_detail = patch_copertina_url(d_uuid, pub_url)
                if ok:
                    patch_ok += 1
                else:
                    logging.warning(f"  ERRORE patch {id_numero}: {patch_detail}")
                    errori_patch += 1
            else:
                patch_detail = f"id_numero '{id_numero}' non trovato in Directus"
                logging.warning(f"  {patch_detail}")
                errori_patch += 1

        csv_writer.writerow([wp_id, id_numero, key, wp_src, "ok", patch_detail])

        if delay_s > 0:
            time.sleep(delay_s)

    csv_fh.close()

    logging.info(f"\n{'='*60}")
    logging.info(f"{'[DRY-RUN] ' if args.dry_run else ''}RIEPILOGO")
    logging.info(f"{'='*60}")
    logging.info(f"  Totale numeri       : {len(numeri)}")
    logging.info(f"  Caricati su R2      : {caricati}")
    logging.info(f"  Saltati (già ok)    : {saltati}")
    logging.info(f"  Errori download WP  : {errori_dl}")
    logging.info(f"  Errori upload R2    : {errori_up}")
    logging.info(f"  Patch Directus OK   : {patch_ok}")
    logging.info(f"  Errori patch        : {errori_patch}")
    logging.info(f"  CSV log             : {csv_path}")
    logging.info(f"{'='*60}")


if __name__ == "__main__":
    main()
