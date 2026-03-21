#!/usr/bin/env python3
"""
scripts/db_analysis/migrate_images.py

Migra le immagini copertina dal vecchio WordPress a Directus.
Gira in locale, parla con Directus via HTTP.

Struttura input:
  immagini_copertina_wp.json  lista di {post_id, thumbnail_wp_id, src, alt}
  immagini_wp.json            lista di {wp_id, url, filename, title, alt, ...}

Uso:
  python3 scripts/db_analysis/migrate_images.py --dry-run
  python3 scripts/db_analysis/migrate_images.py --limit 10
  python3 scripts/db_analysis/migrate_images.py
  python3 scripts/db_analysis/migrate_images.py --delay 300

Variabili d'ambiente:
  DIRECTUS_URL    (default: http://159.69.196.64:8055)
  DIRECTUS_TOKEN
"""

import argparse
import json
import logging
import os
import sys
import time
from datetime import datetime
from pathlib import Path

import requests
try:
    from tqdm import tqdm
except ImportError:
    sys.exit("Installa tqdm: pip install tqdm")

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ── Paths ──────────────────────────────────────────────────────────────────────
ROOT          = Path(__file__).resolve().parent.parent.parent
INPUT_COVER   = ROOT / "scripts" / "db_analysis" / "output" / "immagini_copertina_wp.json"
INPUT_IMGS    = ROOT / "scripts" / "db_analysis" / "output" / "immagini_wp.json"
LOGS_DIR      = ROOT / "scripts" / "db_analysis" / "logs"

DIRECTUS_URL   = os.getenv("DIRECTUS_URL",   "http://159.69.196.64:8055")
DIRECTUS_TOKEN = os.getenv("DIRECTUS_TOKEN", "b9e3c6d1e2748f890ccd4d84453bbdc094909fd9bda4e81b3c81821116a1757e")

RETRY_DELAYS = [2, 4, 8]


# ── Logging ───────────────────────────────────────────────────────────────────

def setup_logging(dry_run=False):
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    ts      = datetime.now().strftime("%Y%m%d_%H%M%S")
    suffix  = "_dryrun" if dry_run else ""
    logfile = LOGS_DIR / f"migrate_images_{ts}{suffix}.log"
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)-8s %(message)s',
        handlers=[
            logging.FileHandler(logfile, encoding='utf-8'),
            logging.StreamHandler(sys.stdout),
        ]
    )
    logging.info(f"Log: {logfile}")
    return logfile


# ── HTTP helpers ──────────────────────────────────────────────────────────────

def api_headers():
    return {"Authorization": f"Bearer {DIRECTUS_TOKEN}"}


def api_get(path, params=None):
    url = f"{DIRECTUS_URL}{path}"
    for attempt in range(3):
        try:
            r = requests.get(url, headers=api_headers(), params=params, timeout=30)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            if attempt < 2:
                time.sleep(RETRY_DELAYS[attempt])
            else:
                raise


def api_post_json(path, payload):
    url = f"{DIRECTUS_URL}{path}"
    for attempt in range(3):
        try:
            r = requests.post(url, headers={**api_headers(), "Content-Type": "application/json"},
                              json=payload, timeout=30)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            if attempt < 2:
                time.sleep(RETRY_DELAYS[attempt])
            else:
                raise


def api_patch(path, payload):
    url = f"{DIRECTUS_URL}{path}"
    for attempt in range(3):
        try:
            r = requests.patch(url, headers={**api_headers(), "Content-Type": "application/json"},
                               json=payload, timeout=30)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            if attempt < 2:
                time.sleep(RETRY_DELAYS[attempt])
            else:
                raise


def download_image(url, timeout=15):
    for attempt in range(3):
        try:
            r = requests.get(url, timeout=timeout, allow_redirects=True)
            if r.status_code == 404:
                return None, 404
            r.raise_for_status()
            return r.content, r.headers.get('content-type', 'image/jpeg')
        except requests.exceptions.Timeout:
            if attempt < 2:
                time.sleep(RETRY_DELAYS[attempt])
            else:
                return None, 'timeout'
        except Exception as e:
            if attempt < 2:
                time.sleep(RETRY_DELAYS[attempt])
            else:
                return None, str(e)


def upload_file(content, filename, content_type, title, folder_id):
    url = f"{DIRECTUS_URL}/files"
    for attempt in range(3):
        try:
            files = {"file": (filename, content, content_type)}
            data  = {"title": title or filename}
            if folder_id:
                data["folder"] = folder_id
            r = requests.post(url, headers=api_headers(), files=files, data=data, timeout=60)
            r.raise_for_status()
            return r.json()['data']['id']
        except Exception as e:
            if attempt < 2:
                time.sleep(RETRY_DELAYS[attempt])
            else:
                raise


# ── Setup ─────────────────────────────────────────────────────────────────────

def ensure_folder(name="copertine"):
    d = api_get("/folders", {"filter[name][_eq]": name})
    items = d.get('data', [])
    if items:
        fid = items[0]['id']
        logging.info(f"Cartella '{name}' esistente: {fid}")
        return fid
    resp = api_post_json("/folders", {"name": name})
    fid = resp['data']['id']
    logging.info(f"Cartella '{name}' creata: {fid}")
    return fid


def build_articoli_map():
    logging.info("Carico mappa articoli (wp_id -> uuid, immagine_copertina) ...")
    d = api_get("/items/articoli", {"fields": "id,wp_id,immagine_copertina", "limit": -1})
    m = {}
    for item in d.get('data', []):
        wp_id = item.get('wp_id')
        if wp_id is not None:
            m[int(wp_id)] = {
                "uuid": item['id'],
                "ha_immagine": item.get('immagine_copertina') is not None,
            }
    logging.info(f"  -> {len(m)} articoli (di cui {sum(1 for v in m.values() if v['ha_immagine'])} gia' con immagine)")
    return m


def load_cover_map(path):
    """post_id (int) -> thumbnail_wp_id (int)"""
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    # struttura: lista di {post_id, thumbnail_wp_id, src, alt}
    return {int(r['post_id']): int(r['thumbnail_wp_id']) for r in data if r.get('thumbnail_wp_id')}


def load_images_map(path):
    """wp_id (int) -> {url, filename, alt, title, mime_type}"""
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return {
        int(r['wp_id']): {
            'url':       r.get('url', ''),
            'filename':  r.get('filename', ''),
            'alt':       r.get('alt', ''),
            'title':     r.get('title', ''),
            'mime_type': r.get('mime_type', 'image/jpeg'),
        }
        for r in data if r.get('wp_id')
    }


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Migra immagini copertina WordPress -> Directus")
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--limit',   type=int, default=0)
    parser.add_argument('--delay',   type=int, default=200, help='Delay tra upload in ms')
    args = parser.parse_args()

    logfile = setup_logging(args.dry_run)
    logging.info(f"{'[DRY-RUN] ' if args.dry_run else ''}Migrazione immagini -> {DIRECTUS_URL}")

    # 1. Carica dati locali
    cover_map  = load_cover_map(INPUT_COVER)
    images_map = load_images_map(INPUT_IMGS)
    logging.info(f"Cover map: {len(cover_map)} record | Images map: {len(images_map)} record")

    # 2. Prerequisito: Directus raggiungibile
    try:
        api_get("/items/articoli?limit=1")
        logging.info("Directus raggiungibile")
    except Exception as e:
        sys.exit(f"ERRORE: Directus non raggiungibile: {e}")

    # 3. Setup cartella
    folder_id = None if args.dry_run else ensure_folder("copertine")

    # 4. Mappa articoli Directus
    articoli_map = build_articoli_map()

    # 5. Costruisci lista lavoro
    work = []
    for wp_id, info in articoli_map.items():
        thumb_id = cover_map.get(wp_id)
        if not thumb_id:
            continue
        img = images_map.get(thumb_id)
        if not img or not img['url']:
            continue
        work.append({
            'wp_id':       wp_id,
            'uuid':        info['uuid'],
            'ha_immagine': info['ha_immagine'],
            'thumb_id':    thumb_id,
            'url':         img['url'],
            'filename':    img['filename'] or f"{thumb_id}.jpg",
            'alt':         img['alt'] or img['title'] or '',
            'mime_type':   img['mime_type'],
        })

    logging.info(f"Articoli con copertina mappabile: {len(work)}")
    already   = sum(1 for w in work if w['ha_immagine'])
    to_upload = [w for w in work if not w['ha_immagine']]
    logging.info(f"  Gia' con immagine (skip): {already}")
    logging.info(f"  Da caricare:              {len(to_upload)}")

    if args.limit > 0:
        to_upload = to_upload[:args.limit]
        logging.info(f"  Limitato a {len(to_upload)} (--limit)")

    # Contatori
    caricati = aggiornati = non_trovate = errori = 0
    delay_s  = args.delay / 1000.0

    for item in tqdm(to_upload, desc="copertine", unit="img"):
        # In dry-run non scarichiamo nulla
        if args.dry_run:
            caricati += 1
            aggiornati += 1
            continue

        # Download
        content, ct = download_image(item['url'])
        if content is None:
            if ct == 404:
                logging.warning(f"  404 wp_id={item['wp_id']} url={item['url']}")
                non_trovate += 1
            else:
                logging.warning(f"  ERRORE download wp_id={item['wp_id']}: {ct}")
                errori += 1
            continue

        # Upload
        try:
            file_uuid = upload_file(
                content    = content,
                filename   = item['filename'],
                content_type = ct if isinstance(ct, str) else item['mime_type'],
                title      = item['alt'] or item['filename'],
                folder_id  = folder_id,
            )
            caricati += 1
        except Exception as e:
            logging.warning(f"  ERRORE upload wp_id={item['wp_id']}: {e}")
            errori += 1
            continue

        # PATCH articolo
        try:
            api_patch(f"/items/articoli/{item['uuid']}", {"immagine_copertina": file_uuid})
            aggiornati += 1
            logging.debug(f"  OK wp_id={item['wp_id']} -> file={file_uuid}")
        except Exception as e:
            logging.warning(f"  ERRORE patch wp_id={item['wp_id']}: {e}")
            errori += 1

        if delay_s > 0:
            time.sleep(delay_s)

    # Riepilogo
    logging.info(f"\n{'='*60}")
    logging.info(f"{'[DRY-RUN] ' if args.dry_run else ''}RIEPILOGO MIGRAZIONE")
    logging.info(f"{'='*60}")
    logging.info(f"  Processati        : {len(to_upload)}")
    logging.info(f"  Immagini caricate : {caricati}")
    logging.info(f"  Articoli aggiornati: {aggiornati}")
    logging.info(f"  Non trovate (404) : {non_trovate}")
    logging.info(f"  Gia' presenti (skip): {already}")
    logging.info(f"  Errori            : {errori}")
    logging.info(f"{'='*60}")
    logging.info(f"Log: {logfile}")


if __name__ == '__main__':
    main()
