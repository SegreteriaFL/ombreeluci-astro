"""
scripts/db_analysis/normalize_categoria_menu.py

Fase 0 — i18n: normalizza il campo `categoria_menu` su `articoli` in Directus.
Converte le etichette italiane (es. "Spiritualità") negli slug canonici
definiti in `src/data/categorie.json` (es. "spiritualita").

Comportamento per valore corrente di categoria_menu:
  - Già uno slug riconosciuto          → skip  (idempotente)
  - Stringa IT mappabile               → PATCH con slug
  - "Da categorizzare"                 → log `needs_manual_assignment` (no PATCH)
  - null / vuoto                       → skip
  - Valore non riconosciuto            → log `unknown` (no PATCH, richiede review)

Modalità:
  --dry-run   Analisi e CSV, zero scritture in Directus
  (live)      PATCH effettivi su Directus

Output CSV:
  scripts/db_analysis/logs/normalize_categoria_menu_{timestamp}[_dryrun].csv

Colonne CSV:
  id, slug, lang, categoria_old, categoria_new, action, note

Uso:
  python normalize_categoria_menu.py --dry-run
  python normalize_categoria_menu.py

Variabili d'ambiente (o .env):
  DIRECTUS_URL    (default: http://159.69.196.64:8055)
  DIRECTUS_TOKEN
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

ROOT         = Path(__file__).resolve().parent.parent.parent
CATEGORIE_PATH = ROOT / "src/data/categorie.json"
LOG_DIR      = ROOT / "scripts/db_analysis/logs"

DIRECTUS_URL   = os.getenv("DIRECTUS_URL", "http://159.69.196.64:8055").rstrip("/")
DIRECTUS_TOKEN = os.getenv("DIRECTUS_TOKEN", "")

COLLECTION   = "articoli"
BATCH_SIZE   = 50
BATCH_DELAY  = 0.20
REQUEST_DELAY = 0.05
RETRY_MAX    = 3
RETRY_BACKOFF = [1, 2, 4]

CSV_FIELDS = ["id", "slug", "lang", "categoria_old", "categoria_new", "action", "note"]

# ── Carica mapping da categorie.json ─────────────────────────────────────────

def load_mappings() -> tuple[dict[str, str], set[str]]:
    """
    Ritorna:
      label_to_slug  — {it_label: slug}  (es. "Spiritualità" → "spiritualita")
      known_slugs    — set di slug validi (incluso "da-categorizzare")
    """
    with open(CATEGORIE_PATH, encoding="utf-8") as f:
        data = json.load(f)

    label_to_slug: dict[str, str] = {}
    known_slugs: set[str] = set()

    for cat in data["categorie"]:
        slug = cat["slug"]
        it_label = cat["it"]
        known_slugs.add(slug)
        label_to_slug[it_label] = slug

    # Placeholder interno: non è in categorie.json come categoria reale,
    # ma è un valore legittimo in Directus che segnala assenza di categorizzazione.
    # Lo riconosciamo come slug già "migrato" se lo vediamo, ma non lo patchiamo
    # (gli articoli con "Da categorizzare" richiedono assegnazione manuale).
    label_to_slug["Da categorizzare"] = "da-categorizzare"
    known_slugs.add("da-categorizzare")

    return label_to_slug, known_slugs


# ── HTTP helpers ──────────────────────────────────────────────────────────────

def _headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {DIRECTUS_TOKEN}", "Content-Type": "application/json"}


def _get(path: str, log: logging.Logger, **kwargs) -> requests.Response:
    url = f"{DIRECTUS_URL}{path}"
    for attempt in range(RETRY_MAX):
        try:
            r = requests.get(url, headers=_headers(), timeout=60, **kwargs)
            time.sleep(REQUEST_DELAY)
            return r
        except requests.RequestException as e:
            if attempt < RETRY_MAX - 1:
                w = RETRY_BACKOFF[attempt]
                log.warning("Retry %s/%s GET %s — attesa %ss (%s)", attempt + 1, RETRY_MAX, path, w, e)
                time.sleep(w)
            else:
                raise
    raise RuntimeError(f"Max retry: GET {path}")


def _patch(path: str, payload: dict, log: logging.Logger) -> requests.Response:
    url = f"{DIRECTUS_URL}{path}"
    for attempt in range(RETRY_MAX):
        try:
            r = requests.patch(url, headers=_headers(), json=payload, timeout=30)
            time.sleep(REQUEST_DELAY)
            return r
        except requests.RequestException as e:
            if attempt < RETRY_MAX - 1:
                w = RETRY_BACKOFF[attempt]
                log.warning("Retry %s/%s PATCH %s — attesa %ss (%s)", attempt + 1, RETRY_MAX, path, w, e)
                time.sleep(w)
            else:
                raise
    raise RuntimeError(f"Max retry: PATCH {path}")


# ── Fetch articoli ────────────────────────────────────────────────────────────

def get_all_articles(log: logging.Logger) -> list[dict]:
    """Recupera id, slug, lang, categoria_menu per tutti gli articoli."""
    all_items: list[dict] = []
    limit = 200
    offset = 0
    while True:
        r = _get(
            f"/items/{COLLECTION}",
            log,
            params={
                "fields": "id,slug,lang,categoria_menu",
                "limit": limit,
                "offset": offset,
                "sort": "data_pubblicazione",
            },
        )
        if not r.ok:
            log.error("GET /items/%s: %s %s", COLLECTION, r.status_code, r.text[:300])
            sys.exit(1)
        batch = r.json().get("data", [])
        if not batch:
            break
        all_items.extend(batch)
        offset += limit
        if len(batch) < limit:
            break
        log.info("Recuperati %s articoli...", len(all_items))
    return all_items


# ── Logging ───────────────────────────────────────────────────────────────────

def setup_logging(dry_run: bool) -> tuple[logging.Logger, Path]:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    suffix = "_dryrun" if dry_run else ""
    log_path = LOG_DIR / f"normalize_categoria_menu_{ts}{suffix}.log"
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
        handlers=[
            logging.FileHandler(log_path, encoding="utf-8"),
            logging.StreamHandler(open(sys.stdout.fileno(), mode='w', encoding='utf-8', closefd=False)),
        ],
    )
    return logging.getLogger("normalize_categoria"), log_path


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> int:
    ap = argparse.ArgumentParser(
        description="Normalizza categoria_menu: stringa IT → slug canonico"
    )
    ap.add_argument("--dry-run", action="store_true", help="Analisi + CSV, nessuna scrittura")
    args = ap.parse_args()
    dry = args.dry_run

    log, log_path = setup_logging(dry)
    log.info("=== normalize_categoria_menu %s ===", "[DRY-RUN]" if dry else "[LIVE]")

    if not DIRECTUS_TOKEN:
        log.error("Imposta DIRECTUS_TOKEN.")
        return 1

    if not CATEGORIE_PATH.exists():
        log.error("File non trovato: %s", CATEGORIE_PATH)
        return 1

    label_to_slug, known_slugs = load_mappings()
    log.info("Mapping caricato: %s etichette IT->slug; %s slug noti", len(label_to_slug), len(known_slugs))

    articles = get_all_articles(log)
    log.info("Totale articoli: %s", len(articles))

    # ── Apri CSV ────────────────────────────────────────────────────────────
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    suffix = "_dryrun" if dry else ""
    csv_path = LOG_DIR / f"normalize_categoria_menu_{ts}{suffix}.csv"
    csv_f = open(csv_path, "w", encoding="utf-8", newline="")
    writer = csv.DictWriter(csv_f, fieldnames=CSV_FIELDS)
    writer.writeheader()

    stats = {
        "skip_null": 0,
        "skip_already_slug": 0,
        "patch_ok": 0,
        "dry": 0,
        "needs_manual": 0,
        "unknown": 0,
        "err": 0,
    }

    to_patch: list[tuple[str, str, str]] = []  # (id, old_value, new_slug)
    rows: list[dict] = []

    for a in articles:
        uid  = a["id"]
        slug = a.get("slug") or ""
        lang = a.get("lang") or "it"
        cat  = a.get("categoria_menu")

        # ── null / vuoto → skip ────────────────────────────────────────────
        if not cat or not str(cat).strip():
            stats["skip_null"] += 1
            rows.append({"id": uid, "slug": slug[:60], "lang": lang,
                         "categoria_old": "", "categoria_new": "",
                         "action": "skip_null", "note": ""})
            continue

        cat = str(cat).strip()

        # ── già uno slug riconosciuto → skip (idempotente) ─────────────────
        if cat in known_slugs:
            if cat == "da-categorizzare":
                stats["needs_manual"] += 1
                rows.append({"id": uid, "slug": slug[:60], "lang": lang,
                             "categoria_old": cat, "categoria_new": cat,
                             "action": "needs_manual_assignment",
                             "note": "Assegnare categoria manualmente in Directus"})
            else:
                stats["skip_already_slug"] += 1
                rows.append({"id": uid, "slug": slug[:60], "lang": lang,
                             "categoria_old": cat, "categoria_new": cat,
                             "action": "skip_already_slug", "note": ""})
            continue

        # ── mappabile (stringa IT → slug) ──────────────────────────────────
        new_slug = label_to_slug.get(cat)
        if new_slug:
            if new_slug == "da-categorizzare":
                stats["needs_manual"] += 1
                rows.append({"id": uid, "slug": slug[:60], "lang": lang,
                             "categoria_old": cat, "categoria_new": new_slug,
                             "action": "needs_manual_assignment",
                             "note": "Assegnare categoria manualmente in Directus"})
                continue

            to_patch.append((uid, cat, new_slug))
            rows.append({"id": uid, "slug": slug[:60], "lang": lang,
                         "categoria_old": cat, "categoria_new": new_slug,
                         "action": "dry" if dry else "patch_ok",
                         "note": ""})
            continue

        # ── valore non riconosciuto → log unknown ──────────────────────────
        stats["unknown"] += 1
        rows.append({"id": uid, "slug": slug[:60], "lang": lang,
                     "categoria_old": cat, "categoria_new": "",
                     "action": "unknown",
                     "note": f"Valore non mappato: '{cat}' — aggiungere a categorie.json o assegnare manualmente"})

    # ── Stampa riepilogo pre-patch ─────────────────────────────────────────
    log.info("")
    log.info("=== RIEPILOGO ===")
    log.info("  Skip (null/vuoto):         %s", stats["skip_null"])
    log.info("  Skip (già slug):           %s", stats["skip_already_slug"])
    log.info("  Da patchare (IT->slug):     %s", len(to_patch))
    log.info("  Needs manual assignment:   %s", stats["needs_manual"])
    log.info("  Sconosciuti (unknown):     %s", stats["unknown"])

    if stats["unknown"] > 0:
        unknown_vals = [r["categoria_old"] for r in rows if r["action"] == "unknown"]
        unique_unknowns = sorted(set(unknown_vals))
        log.warning("  Valori sconosciuti: %s", unique_unknowns)
        log.warning("  -> Aggiungere a src/data/categorie.json o mappare nello script prima di procedere.")

    # ── Scrivi CSV (include tutti i record) ───────────────────────────────
    writer.writerows(rows)
    csv_f.close()
    log.info("  CSV: %s", csv_path)

    if dry:
        log.info("")
        log.info("[DRY-RUN] Nessuna modifica applicata. Rivedere il CSV e rilanciare senza --dry-run.")
        return 0 if stats["unknown"] == 0 else 1

    # ── PATCH live ─────────────────────────────────────────────────────────
    if not to_patch:
        log.info("Nessun articolo da patchare.")
        return 0

    log.info("")
    log.info("Avvio PATCH su %s articoli...", len(to_patch))
    errors = 0

    for i in range(0, len(to_patch), BATCH_SIZE):
        batch = to_patch[i : i + BATCH_SIZE]
        for uid, old_val, new_slug in batch:
            r = _patch(f"/items/{COLLECTION}/{uid}", {"categoria_menu": new_slug}, log)
            if r.ok:
                stats["patch_ok"] += 1
            else:
                log.error("PATCH id=%s: %s %s", uid, r.status_code, r.text[:200])
                errors += 1
                stats["err"] += 1
                # Aggiorna azione nel CSV in-memory (il CSV è già scritto, ma loggiamo)
        if i + BATCH_SIZE < len(to_patch):
            time.sleep(BATCH_DELAY)
        log.info("Progresso: %s/%s", min(i + BATCH_SIZE, len(to_patch)), len(to_patch))

    log.info("")
    log.info("=== FINE ===")
    log.info("  PATCH ok:                  %s", stats["patch_ok"])
    log.info("  Errori PATCH:              %s", stats["err"])
    log.info("  Needs manual assignment:   %s", stats["needs_manual"])
    log.info("  Sconosciuti (no PATCH):    %s", stats["unknown"])
    log.info("  Log: %s", log_path)
    log.info("  CSV: %s", csv_path)

    if stats["unknown"] > 0 or errors > 0:
        log.warning("Attenzione: %s valori sconosciuti e %s errori richiedono review manuale.", stats["unknown"], errors)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
