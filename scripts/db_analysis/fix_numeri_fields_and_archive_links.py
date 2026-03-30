#!/usr/bin/env python3
"""
scripts/db_analysis/fix_numeri_fields_and_archive_links.py

Due operazioni in un unico script:

  PARTE 1 – Directus field metadata
    - Rinomina labels: wp_url → "Sfoglia online", pdf_archive_url → "Scarica PDF",
      copertina_url → "Immagine copertina (URL)"
    - Nasconde il campo `copertina` (M2O inutilizzato)
    - Aggiunge note descrittive ai campi

  PARTE 2 – Backfill archive.org links
    - Legge tutti gli item su archive.org di creator "Ombre e Luci"
    - Estrae OEL/INS numero dal titolo (più affidabile degli identifier)
    - Trova i numeri Directus con wp_url e/o pdf_archive_url mancanti
    - PATCH wp_url e pdf_archive_url

Uso:
  python3 scripts/db_analysis/fix_numeri_fields_and_archive_links.py [--dry-run]

Variabili d'ambiente (o .env in root):
  DIRECTUS_URL    (default: http://159.69.196.64:8055)
  DIRECTUS_TOKEN
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
LOG_DIR = ROOT / "scripts/db_analysis/logs"

DIRECTUS_URL = os.getenv("DIRECTUS_URL", "http://159.69.196.64:8055").rstrip("/")
DIRECTUS_TOKEN = os.getenv("DIRECTUS_TOKEN", "")
COLLECTION = "numeri_rivista"

ARCHIVE_SEARCH_URL = (
    "https://archive.org/advancedsearch.php"
    "?q=creator%3A%22Ombre+e+Luci%22"
    "&fl[]=identifier&fl[]=title"
    "&rows=300&page=1&output=json"
)

# ── Field rename config ───────────────────────────────────────────────────────

FIELD_UPDATES = {
    "wp_url": {
        "translations": [{"language": "it-IT", "translation": "Sfoglia online"}],
        "note": "URL archive.org per la lettura online (es. https://archive.org/details/OmbreELuciN_170)",
        "hidden": False,
    },
    "pdf_archive_url": {
        "translations": [{"language": "it-IT", "translation": "Scarica PDF"}],
        "note": "URL diretto al PDF su archive.org (es. https://archive.org/download/OmbreELuciN_170)",
        "hidden": False,
    },
    "copertina_url": {
        "translations": [{"language": "it-IT", "translation": "Immagine copertina (URL)"}],
        "note": "URL R2 dell'immagine di copertina — campo usato dal frontend",
        "hidden": False,
    },
    "copertina": {
        "hidden": True,
        "note": "Campo M2O non utilizzato dal frontend. Vedi 'Immagine copertina (URL)'.",
    },
}

# ── HTTP helpers ──────────────────────────────────────────────────────────────

def _headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {DIRECTUS_TOKEN}",
        "Content-Type": "application/json",
    }


def _directus(method: str, path: str, log: logging.Logger, **kwargs) -> requests.Response:
    url = f"{DIRECTUS_URL}{path}"
    for attempt in range(3):
        try:
            r = requests.request(method, url, headers=_headers(), timeout=60, **kwargs)
            time.sleep(0.05)
            return r
        except requests.RequestException as e:
            if attempt < 2:
                time.sleep(2 ** attempt)
            else:
                raise RuntimeError(f"Max retry: {method} {path}") from e
    raise RuntimeError("unreachable")

# ── PARTE 1: Rinomina campi Directus ─────────────────────────────────────────

def update_field_metadata(log: logging.Logger, dry_run: bool) -> None:
    log.info("=== PARTE 1: aggiornamento metadata campi ===")
    for field_name, meta_patch in FIELD_UPDATES.items():
        log.info("PATCH /fields/%s/%s  hidden=%s  translations=%s",
                 COLLECTION, field_name,
                 meta_patch.get("hidden", "—"),
                 meta_patch.get("translations", "—"))
        if dry_run:
            continue
        payload = {"meta": meta_patch}
        r = _directus("PATCH", f"/fields/{COLLECTION}/{field_name}", log, json=payload)
        if r.ok:
            log.info("  ✓ campo '%s' aggiornato", field_name)
        else:
            log.error("  ✗ campo '%s': %s %s", field_name, r.status_code, r.text[:200])

# ── PARTE 2: Backfill archive.org links ──────────────────────────────────────

def fetch_archive_items(log: logging.Logger) -> list[dict]:
    """Restituisce lista {identifier, title} da archive.org."""
    log.info("Scarico lista da archive.org...")
    r = requests.get(ARCHIVE_SEARCH_URL, timeout=30)
    r.raise_for_status()
    data = r.json()
    items = data.get("response", {}).get("docs", [])
    log.info("  archive.org: %s item trovati", len(items))
    return items


def parse_numero_from_title(title: str) -> tuple[str, int] | None:
    """
    Estrae (tipo, numero) dal titolo archive.org.
    Restituisce ("OEL", 170) oppure ("INS", 26) oppure None.
    Usa il titolo (più affidabile degli identifier).
    """
    # "Ombre e Luci N. 170" / "Ombre e Luci n.170" / "Ombre E Luci N. 20"
    m = re.search(r"[Oo]mbre\s+[Ee]\s+[Ll]uci\s+[Nn][\.\s]+(\d+)", title)
    if m:
        return ("OEL", int(m.group(1)))
    # "Insieme n.26" / "Insieme n. 26"
    m = re.search(r"[Ii]nsieme\s+[Nn][\.\s]+(\d+)", title)
    if m:
        return ("INS", int(m.group(1)))
    return None


def build_archive_mapping(items: list[dict], log: logging.Logger) -> dict[str, dict]:
    """
    Costruisce mapping id_numero -> {identifier, details_url, download_url}.
    In caso di duplicati, mantiene il più recente (primo nella lista sort=-date).
    """
    mapping: dict[str, dict] = {}
    skipped = []

    for item in items:
        identifier = item.get("identifier", "")
        title = item.get("title", "")
        parsed = parse_numero_from_title(title)
        if parsed is None:
            skipped.append(f"{identifier} ({title!r})")
            continue
        tipo, numero = parsed
        id_numero = f"{tipo}-{numero}"
        if id_numero in mapping:
            # Duplicato — tieni il primo (sort=-date = più recente)
            log.debug("  duplicato %s: %s (tengo il precedente)", id_numero, identifier)
            continue
        mapping[id_numero] = {
            "identifier": identifier,
            "details_url": f"https://archive.org/details/{identifier}",
            "download_url": f"https://archive.org/download/{identifier}",
        }

    log.info("  Mapping costruito: %s numeri", len(mapping))
    if skipped:
        log.info("  Saltati (titolo non parsabile): %s", skipped)
    return mapping


def backfill_links(
    archive_map: dict[str, dict],
    log: logging.Logger,
    dry_run: bool,
) -> list[dict]:
    """
    Trova i numeri Directus con wp_url o pdf_archive_url mancanti e li aggiorna.
    Restituisce lista di righe per il CSV di log.
    """
    log.info("=== PARTE 2: backfill archive links ===")

    # Carica tutti i numeri Directus
    r = _directus(
        "GET",
        f"/items/{COLLECTION}?fields=id,id_numero,wp_url,pdf_archive_url&limit=-1",
        log,
    )
    if not r.ok:
        log.error("GET numeri_rivista: %s %s", r.status_code, r.text[:300])
        return []

    numeri = r.json().get("data", [])
    log.info("  Numeri Directus: %s", len(numeri))

    rows = []
    stats = {"patched": 0, "dry": 0, "no_archive": 0, "already_ok": 0, "err": 0}

    for num in numeri:
        id_numero = num.get("id_numero", "")
        uuid = num["id"]
        current_wp = num.get("wp_url") or ""
        current_pdf = num.get("pdf_archive_url") or ""

        archive = archive_map.get(id_numero)

        if not archive:
            if not current_wp and not current_pdf:
                # Non trovato su archive.org e non ha URL
                log.warning("  %s: non trovato su archive.org e senza link", id_numero)
                rows.append({
                    "id_numero": id_numero, "directus_id": uuid,
                    "identifier": "", "details_url": "", "download_url": "",
                    "status": "no_archive", "note": "",
                })
                stats["no_archive"] += 1
            else:
                # Ha già qualcosa
                stats["already_ok"] += 1
            continue

        new_wp = archive["details_url"]
        new_pdf = archive["download_url"]

        # Aggiorna solo se mancante (non sovrascrivere valori già presenti)
        needs_wp = not current_wp
        needs_pdf = not current_pdf

        if not needs_wp and not needs_pdf:
            stats["already_ok"] += 1
            continue

        payload: dict = {}
        if needs_wp:
            payload["wp_url"] = new_wp
        if needs_pdf:
            payload["pdf_archive_url"] = new_pdf

        log.info("  %s (%s...) wp_url=%s pdf=%s",
                 id_numero, uuid[:8],
                 new_wp if needs_wp else "(già presente)",
                 new_pdf if needs_pdf else "(già presente)")

        if dry_run:
            rows.append({
                "id_numero": id_numero, "directus_id": uuid,
                "identifier": archive["identifier"],
                "details_url": new_wp if needs_wp else current_wp,
                "download_url": new_pdf if needs_pdf else current_pdf,
                "status": "dry", "note": "",
            })
            stats["dry"] += 1
            continue

        resp = _directus("PATCH", f"/items/{COLLECTION}/{uuid}", log, json=payload)
        if resp.ok:
            rows.append({
                "id_numero": id_numero, "directus_id": uuid,
                "identifier": archive["identifier"],
                "details_url": new_wp if needs_wp else current_wp,
                "download_url": new_pdf if needs_pdf else current_pdf,
                "status": "ok", "note": "",
            })
            stats["patched"] += 1
        else:
            log.error("  PATCH %s: %s %s", id_numero, resp.status_code, resp.text[:200])
            rows.append({
                "id_numero": id_numero, "directus_id": uuid,
                "identifier": archive["identifier"],
                "details_url": new_wp, "download_url": new_pdf,
                "status": "error", "note": f"HTTP {resp.status_code}",
            })
            stats["err"] += 1

        time.sleep(0.1)

    log.info("  Patchati: %s | Già ok: %s | No archive: %s | Errori: %s",
             stats["patched"] or stats["dry"], stats["already_ok"],
             stats["no_archive"], stats["err"])
    return rows

# ── Logging + CSV ─────────────────────────────────────────────────────────────

def setup_logging(dry_run: bool) -> tuple[logging.Logger, Path]:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    suffix = "_dryrun" if dry_run else ""
    log_path = LOG_DIR / f"fix_numeri_fields_archive_{ts}{suffix}.log"
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
        handlers=[
            logging.FileHandler(log_path, encoding="utf-8"),
            logging.StreamHandler(sys.stdout),
        ],
    )
    return logging.getLogger("fix_numeri"), log_path

# ── Entry point ───────────────────────────────────────────────────────────────

def main() -> int:
    ap = argparse.ArgumentParser(description="Rinomina campi Directus + backfill link archive.org")
    ap.add_argument("--dry-run", action="store_true", help="Nessuna scrittura su Directus")
    args = ap.parse_args()

    log, log_path = setup_logging(args.dry_run)
    log.info("=== fix_numeri_fields_and_archive_links %s ===",
             "[DRY-RUN]" if args.dry_run else "")

    if not DIRECTUS_TOKEN:
        log.error("Imposta DIRECTUS_TOKEN.")
        return 1

    # Parte 1: field metadata
    update_field_metadata(log, args.dry_run)

    # Parte 2: archive.org links
    archive_items = fetch_archive_items(log)
    archive_map = build_archive_mapping(archive_items, log)
    rows = backfill_links(archive_map, log, args.dry_run)

    # Scrivi CSV
    if rows:
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        suffix = "_dryrun" if args.dry_run else ""
        csv_path = LOG_DIR / f"fix_archive_links_{ts}{suffix}.csv"
        csv_fields = ["id_numero", "directus_id", "identifier", "details_url", "download_url", "status", "note"]
        with open(csv_path, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=csv_fields)
            writer.writeheader()
            writer.writerows(rows)
        log.info("CSV: %s", csv_path)

    log.info("Log: %s", log_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
