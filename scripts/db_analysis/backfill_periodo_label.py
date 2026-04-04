#!/usr/bin/env python3
"""
scripts/db_analysis/backfill_periodo_label.py

Popola il campo `periodo_label` su tutti i numeri rivista in Directus.

Strategia (in ordine di priorità):
  1. Pattern completo nel post_content Divi:
     "Anno 43 - Numero 4 - Ottobre - Novembre - Dicembre 2025"
     → estrae i soli mesi: "Ottobre – Dicembre"
  2. Pattern semplice nel post_content:
     "Ottobre - Dicembre 2025" oppure "Marzo 2006"
     → estrae il periodo senza anno
  3. Fallback dalla data WP (data pubblicazione → trimestre):
     Gen→Mar  = "Gennaio – Marzo"
     Apr→Giu  = "Aprile – Giugno"
     Lug→Set  = "Luglio – Settembre"
     Ott→Dic  = "Ottobre – Dicembre"

Uso:
  python3 scripts/db_analysis/backfill_periodo_label.py [--dry-run]

Output:
  scripts/db_analysis/logs/backfill_periodo_label_{ts}.csv
"""

from __future__ import annotations

import argparse, csv, json, logging, os, re, sys, time
from datetime import datetime
from pathlib import Path

import requests

try:
    from dotenv import load_dotenv; load_dotenv()
except ImportError:
    pass

# ── Config ─────────────────────────────────────────────────────────────────────
ROOT          = Path(__file__).resolve().parent.parent.parent
DATA_DIR      = ROOT / "scripts/db_analysis/output"
WP_JSON       = DATA_DIR / "numeri_rivista_wp.json"
LOG_DIR       = ROOT / "scripts/db_analysis/logs"

DIRECTUS_URL  = os.getenv("DIRECTUS_URL",  "https://cms.ombreeluci.it").rstrip("/")
DIRECTUS_TOKEN = os.getenv("DIRECTUS_TOKEN", "")

BATCH_DELAY   = 0.15   # sec tra richieste

# ── Logging ────────────────────────────────────────────────────────────────────
def setup_logging(dry_run: bool):
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    ts  = datetime.now().strftime("%Y%m%d_%H%M%S")
    sfx = "_dryrun" if dry_run else ""
    log_path = LOG_DIR / f"backfill_periodo_label_{ts}{sfx}.log"
    csv_path = LOG_DIR / f"backfill_periodo_label_{ts}{sfx}.csv"
    fmt = "%(asctime)s | %(levelname)s | %(message)s"
    logging.basicConfig(level=logging.INFO, format=fmt,
        handlers=[logging.FileHandler(log_path, encoding="utf-8"),
                  logging.StreamHandler(sys.stdout)])
    return logging.getLogger(__name__), csv_path

# ── Mesi ───────────────────────────────────────────────────────────────────────
MESI = ["gennaio","febbraio","marzo","aprile","maggio","giugno",
        "luglio","agosto","settembre","ottobre","novembre","dicembre"]
MESI_TITOLO = [m.capitalize() for m in MESI]

# Pattern 1 – Anno XX - Numero N - Mese... ANNO (dentro tag <em>)
PAT_FULL = re.compile(
    r'Anno\s+\d+\s*[-–]\s*Numero\s+\d+\s*[-–]\s*'
    r'((?:' + '|'.join(MESI) + r')(?:\s*[-–]\s*(?:' + '|'.join(MESI) + r'))*)'
    r'(?:\s+\d{4})?',
    re.IGNORECASE
)

# Pattern 2 – Mese (- Mese)* ANNO in testo libero
PAT_SIMPLE = re.compile(
    r'((?:' + '|'.join(MESI) + r')(?:\s*[-–]\s*(?:' + '|'.join(MESI) + r'))*)'
    r'\s+(\d{4})',
    re.IGNORECASE
)

# Trimestri fallback (month → label)
TRIMESTRI = {
    1: "Gennaio – Marzo", 2: "Gennaio – Marzo", 3: "Gennaio – Marzo",
    4: "Aprile – Giugno", 5: "Aprile – Giugno", 6: "Aprile – Giugno",
    7: "Luglio – Settembre", 8: "Luglio – Settembre", 9: "Luglio – Settembre",
    10: "Ottobre – Dicembre", 11: "Ottobre – Dicembre", 12: "Ottobre – Dicembre",
}

def normalizza(s: str) -> str:
    """Mesi con maiuscola iniziale, separatore '–'."""
    parts = re.split(r'\s*[-–]\s*', s.strip())
    clean = []
    for p in parts:
        p = p.strip()
        if p:
            clean.append(p.capitalize())
    return " – ".join(clean)

def estrai_periodo(content: str) -> tuple[str | None, str]:
    """Ritorna (periodo_label, metodo)."""
    m = PAT_FULL.search(content)
    if m:
        return normalizza(m.group(1)), "pat_full"
    m = PAT_SIMPLE.search(content)
    if m:
        return normalizza(m.group(1)), "pat_simple"
    return None, "none"

# ── Directus helpers ───────────────────────────────────────────────────────────
HEADERS = {"Authorization": f"Bearer {DIRECTUS_TOKEN}", "Content-Type": "application/json"}

def get_all_numeri() -> list[dict]:
    url = f"{DIRECTUS_URL}/items/numeri_rivista?fields=id,id_numero,periodo_label&limit=-1"
    r = requests.get(url, headers=HEADERS, timeout=30)
    r.raise_for_status()
    return r.json()["data"]

def patch_numero(uuid: str, periodo: str, dry_run: bool) -> bool:
    if dry_run:
        return True
    url = f"{DIRECTUS_URL}/items/numeri_rivista/{uuid}"
    r = requests.patch(url, headers=HEADERS,
                       json={"periodo_label": periodo}, timeout=30)
    return r.ok

# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--force", action="store_true",
                    help="Aggiorna anche i numeri che hanno già periodo_label")
    args = ap.parse_args()

    log, csv_path = setup_logging(args.dry_run)
    log.info(f"dry_run={args.dry_run} force={args.force}")

    # Carica dump WP
    wp_data = json.load(open(WP_JSON, encoding="utf-8"))
    # Mappa slug → record WP (slug derivato da id_numero: OEL-172 → oel-172)
    # ma il dump ha slug diversi; usiamo wp_id se disponibile, altrimenti cercheremo per id_numero
    # Costruiamo mappa id_numero → wp record
    # id_numero in Directus: "OEL-172", slug WP: "numero-172-paradigma-pompei"
    # Estraiamo numero progressivo dal slug WP
    def num_from_slug(slug: str) -> int | None:
        # "numero-172-..." → 172
        m = re.search(r'(?:^|-)numero-(\d+)', slug)
        if m: return int(m.group(1))
        # "ombre-e-luci-n-46-..." / "ombre-e-luci-n46-..." / "ombre-e-luci-56-..." → 46/56
        m = re.search(r'ombre-e-luci-n?-?(\d+)', slug)
        if m: return int(m.group(1))
        # "insieme-n-XX" o "insieme-bollettino-fede-e-luce-n-XX"
        m = re.search(r'insieme[^0-9a-z]*n?-?(\d+)', slug)
        if m: return int(m.group(1))
        return None

    wp_by_num: dict[int, dict] = {}
    for rec in wp_data:
        n = num_from_slug(rec["slug"])
        if n:
            wp_by_num[n] = rec

    # Carica numeri da Directus
    log.info("Carico numeri da Directus...")
    numeri = get_all_numeri()
    log.info(f"Trovati {len(numeri)} numeri in Directus")

    # Funzione per estrarre numero progressivo da id_numero (es. OEL-172 → 172)
    def num_from_id(id_num: str) -> int | None:
        m = re.search(r'(\d+)$', id_num)
        return int(m.group(1)) if m else None

    rows = []
    updated = skipped = fallback = errors = 0

    for n in numeri:
        uuid     = n["id"]
        id_num   = n["id_numero"]
        existing = n.get("periodo_label")

        if existing and not args.force:
            log.debug(f"SKIP {id_num} — già presente: {existing}")
            skipped += 1
            rows.append({"id_numero": id_num, "status": "skip", "periodo": existing, "metodo": "existing"})
            continue

        num = num_from_id(id_num)
        wp  = wp_by_num.get(num) if num else None

        periodo = None
        metodo  = "none"

        if wp:
            periodo, metodo = estrai_periodo(wp["post_content"])

        # Fallback dalla data
        if not periodo and wp:
            try:
                mese = int(wp["date"][5:7])
                periodo = TRIMESTRI[mese]
                metodo  = "fallback_date"
            except Exception:
                pass

        if not periodo:
            log.warning(f"NESSUN PERIODO per {id_num} (num={num})")
            errors += 1
            rows.append({"id_numero": id_num, "status": "error", "periodo": "", "metodo": "none"})
            continue

        ok = patch_numero(uuid, periodo, args.dry_run)
        status = "ok" if ok else "err"
        if ok:
            updated += 1
            if metodo == "fallback_date":
                fallback += 1
        else:
            errors += 1

        log.info(f"{'[DRY] ' if args.dry_run else ''}{status.upper()} {id_num} → '{periodo}' [{metodo}]")
        rows.append({"id_numero": id_num, "status": status, "periodo": periodo, "metodo": metodo})
        time.sleep(BATCH_DELAY)

    # Scrivi CSV
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["id_numero","status","periodo","metodo"])
        w.writeheader(); w.writerows(rows)

    log.info("-" * 60)
    log.info(f"Aggiornati: {updated}  |  Saltati: {skipped}  |  Fallback data: {fallback}  |  Errori: {errors}")
    log.info(f"CSV: {csv_path}")

if __name__ == "__main__":
    main()
