#!/usr/bin/env python3
"""
scripts/db_analysis/migrate_inline_images.py

Migra le immagini inline nel corpo degli articoli da WordPress a R2/Directus.

Per ogni articolo in Directus che ha nel campo `corpo` URL del tipo
  https://www.ombreeluci.it/wp-content/uploads/...
lo script:
  1. scarica l'immagine da WP
  2. la carica su Directus (che la salva in R2 nella cartella "corpo")
  3. sostituisce l'URL nel HTML con il nuovo URL R2
  4. PATCH l'articolo in Directus

Uso:
    python scripts/db_analysis/migrate_inline_images.py --dry-run
    python scripts/db_analysis/migrate_inline_images.py

Variabili d'ambiente (lette da .env):
    DIRECTUS_URL    (default: http://159.69.196.64:8055)
    DIRECTUS_TOKEN
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime
from pathlib import Path

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
R2_PUBLIC_BASE = "https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev"

WP_IMG_RE = re.compile(
    r'src=["\']?(https?://(?:www\.)?ombreeluci\.it/wp-content/uploads/[^"\'> ]+)',
    re.IGNORECASE,
)

DELAY_S          = 0.3    # tra un upload e l'altro
WP_PULITI_JSON   = ROOT / "scripts" / "db_analysis" / "output" / "articoli_wp_puliti.json"


# ── Helpers HTTP ───────────────────────────────────────────────────────────────

def directus_get(path, params=None):
    url = f"{DIRECTUS_URL}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {DIRECTUS_TOKEN}"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def directus_upload(content: bytes, filename: str, content_type: str, folder_id: str) -> str:
    """Carica file su Directus, ritorna UUID del file."""
    import email.mime.multipart
    import email.mime.base
    import email.encoders

    boundary = "----FormBoundary" + datetime.now().strftime("%Y%m%d%H%M%S%f")

    def encode_multipart(fields, files):
        lines = []
        for name, value in fields.items():
            lines += [
                f"--{boundary}",
                f'Content-Disposition: form-data; name="{name}"',
                "",
                value,
            ]
        for name, (fname, fdata, ftype) in files.items():
            lines += [
                f"--{boundary}",
                f'Content-Disposition: form-data; name="{name}"; filename="{fname}"',
                f"Content-Type: {ftype}",
                "",
            ]
        body = "\r\n".join(lines).encode() + b"\r\n" + fdata + f"\r\n--{boundary}--\r\n".encode()
        return body

    body = encode_multipart(
        {"folder": folder_id},
        {"file": (filename, content, content_type)},
    )

    url = f"{DIRECTUS_URL}/files"
    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {DIRECTUS_TOKEN}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.loads(r.read().decode())
    return data["data"]["id"]


def directus_patch_corpo(article_id: str, corpo: str):
    url = f"{DIRECTUS_URL}/items/articoli/{article_id}"
    body = json.dumps({"corpo": corpo}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        method="PATCH",
        headers={
            "Authorization": f"Bearer {DIRECTUS_TOKEN}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        r.read()


def _encode_url(url: str) -> str:
    """Percent-encode solo la parte path dell'URL, lasciando schema e host intatti."""
    parsed = urllib.parse.urlparse(url)
    encoded_path = urllib.parse.quote(parsed.path, safe="/:@!$&'()*+,;=")
    return urllib.parse.urlunparse(parsed._replace(path=encoded_path))


def download_image(url: str):
    """Scarica immagine. Ritorna (bytes, content_type) o (None, errore)."""
    for attempt in range(3):
        try:
            req = urllib.request.Request(_encode_url(url), headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=20) as r:
                ct = r.headers.get("Content-Type", "image/jpeg").split(";")[0].strip()
                return r.read(), ct
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None, f"404"
            if attempt == 2:
                return None, f"HTTP {e.code}"
        except Exception as e:
            if attempt == 2:
                return None, str(e)
        time.sleep(2 ** attempt)
    return None, "timeout"


def ensure_folder(name: str) -> str:
    data = directus_get("/folders", {"filter[name][_eq]": name})
    items = data.get("data", [])
    if items:
        return items[0]["id"]
    url = f"{DIRECTUS_URL}/folders"
    body = json.dumps({"name": name}).encode()
    req = urllib.request.Request(
        url, data=body, method="POST",
        headers={
            "Authorization": f"Bearer {DIRECTUS_TOKEN}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read().decode())["data"]["id"]


# ── Fetch articoli da Directus ─────────────────────────────────────────────────

def slugs_with_inline_images() -> list[str]:
    """Ricava da articoli_wp_puliti.json gli slug con img WP inline nel corpo."""
    with open(WP_PULITI_JSON, encoding="utf-8") as f:
        data = json.load(f)
    slugs = []
    for a in data:
        corpo = a.get("html_body") or ""
        if WP_IMG_RE.search(corpo):
            slugs.append(a["slug"])
    return slugs


def fetch_articles_with_inline_images() -> list[dict]:
    """Fetcha da Directus id+slug+corpo per gli articoli con img WP inline."""
    slugs = slugs_with_inline_images()
    print(f"Slug con img inline (da WP dump): {len(slugs)}")
    results = []
    # Fetch a blocchi di 50 per non superare limiti URL
    chunk_size = 50
    for i in range(0, len(slugs), chunk_size):
        chunk = slugs[i:i + chunk_size]
        filt = json.dumps({"slug": {"_in": chunk}})
        data = directus_get("/items/articoli", {
            "fields": "id,slug,corpo",
            "filter": filt,
            "limit": chunk_size,
        })
        results.extend(data.get("data", []))
    return results


# ── Filename da URL ────────────────────────────────────────────────────────────

def filename_from_url(url: str) -> str:
    path = urllib.parse.urlparse(url).path
    return path.rsplit("/", 1)[-1] or "image.jpg"


def content_type_to_ext(ct: str) -> str:
    return {
        "image/jpeg": ".jpg",
        "image/png":  ".png",
        "image/gif":  ".gif",
        "image/webp": ".webp",
        "image/svg+xml": ".svg",
    }.get(ct, ".jpg")


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Non scrive su Directus")
    parser.add_argument("--limit", type=int, default=0, help="Processa solo N articoli")
    args = parser.parse_args()

    sys.stdout.reconfigure(encoding="utf-8")

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    suffix = "_dryrun" if args.dry_run else ""
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    log_path = LOGS_DIR / f"migrate_inline_images_{ts}{suffix}.csv"

    print(f"{'[DRY-RUN] ' if args.dry_run else ''}Avvio migrate_inline_images")
    print(f"Log: {log_path}")

    # ── Cartella Directus ──────────────────────────────────────────────────────
    if not args.dry_run:
        folder_id = ensure_folder("corpo")
        print(f"Cartella Directus 'corpo': {folder_id}")
    else:
        folder_id = "dry-run-folder-id"

    # ── Fetch articoli ─────────────────────────────────────────────────────────
    print("\nFetch articoli da Directus...")
    articles = fetch_articles_with_inline_images()
    if args.limit:
        articles = articles[:args.limit]
    print(f"Articoli con img inline: {len(articles)}")

    # ── Analisi preventiva ────────────────────────────────────────────────────
    all_urls = set()
    for a in articles:
        all_urls.update(WP_IMG_RE.findall(a.get("corpo") or ""))
    print(f"URL immagini uniche: {len(all_urls)}")

    # ── Cache URL → nuovo R2 URL (evita upload duplicati) ─────────────────────
    url_cache: dict[str, str] = {}  # wp_url -> nuovo_url

    # ── CSV log ────────────────────────────────────────────────────────────────
    with open(log_path, "w", encoding="utf-8", newline="") as log_fh:
        log_fh.write("article_id,slug,wp_url,new_url,status\n")

        ok_art = err_art = skip_art = 0

        for i, article in enumerate(articles, 1):
            art_id   = article["id"]
            slug     = article.get("slug", "")
            corpo    = article.get("corpo") or ""
            wp_urls  = WP_IMG_RE.findall(corpo)

            if not wp_urls:
                continue

            new_corpo = corpo
            article_ok = True

            for wp_url in wp_urls:
                # Usa cache se URL già processato
                if wp_url in url_cache:
                    new_url = url_cache[wp_url]
                    new_corpo = new_corpo.replace(wp_url, new_url)
                    log_fh.write(f"{art_id},{slug},{wp_url},{new_url},cached\n")
                    continue

                if args.dry_run:
                    fake_uuid = f"dry-run-{abs(hash(wp_url)) % 10**8:08d}"
                    new_url = f"{R2_PUBLIC_BASE}/corpo/{fake_uuid}"
                    url_cache[wp_url] = new_url
                    new_corpo = new_corpo.replace(wp_url, new_url)
                    log_fh.write(f"{art_id},{slug},{wp_url},{new_url},dry-run\n")
                    continue

                # Download
                content, ct = download_image(wp_url)
                if content is None:
                    print(f"  ✗ Download failed ({ct}): {wp_url}")
                    log_fh.write(f"{art_id},{slug},{wp_url},,download_error:{ct}\n")
                    article_ok = False
                    continue

                # Upload a Directus
                try:
                    fname = filename_from_url(wp_url)
                    file_uuid = directus_upload(content, fname, ct, folder_id)
                    new_url = f"{R2_PUBLIC_BASE}/corpo/{file_uuid}"
                    url_cache[wp_url] = new_url
                    new_corpo = new_corpo.replace(wp_url, new_url)
                    log_fh.write(f"{art_id},{slug},{wp_url},{new_url},uploaded\n")
                except Exception as e:
                    print(f"  ✗ Upload failed: {wp_url} — {e}")
                    log_fh.write(f"{art_id},{slug},{wp_url},,upload_error:{e}\n")
                    article_ok = False
                    continue

                time.sleep(DELAY_S)

            # PATCH corpo se almeno una img è stata sostituita
            if new_corpo != corpo:
                if not args.dry_run:
                    try:
                        directus_patch_corpo(art_id, new_corpo)
                    except Exception as e:
                        print(f"  ✗ PATCH articolo {slug}: {e}")
                        log_fh.write(f"{art_id},{slug},,,patch_error:{e}\n")
                        article_ok = False

            if article_ok:
                ok_art += 1
            else:
                err_art += 1

            if i % 10 == 0 or i == len(articles):
                print(f"[{i}/{len(articles)}] ok={ok_art} err={err_art} cache_hits={len(url_cache)}")
            log_fh.flush()

    print(f"\nCompletato — articoli ok={ok_art}, err={err_art}")
    print(f"URL unici processati: {len(url_cache)}")
    print(f"Log: {log_path}")


if __name__ == "__main__":
    main()
