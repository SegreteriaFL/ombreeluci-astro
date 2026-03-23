#!/usr/bin/env python3
"""
import_to_directus.py — Import bulk dataset canonici OEL → Directus API

Uso:
  python3 import_to_directus.py [--collection NOME] [--dry-run]

  --collection  Importa solo una collection specifica:
                temi | tags | autori | numeri_rivista | articoli
                (default: tutte nell'ordine corretto)
  --dry-run     Simula senza scrivere su Directus. Stampa conteggi e mapping.

Variabili d'ambiente (o file .env nella root del progetto):
  DIRECTUS_URL    URL base Directus (es. http://159.69.196.64:8055)
  DIRECTUS_TOKEN  Token API admin Directus
  DATA_DIR        Path a scripts/db_analysis/output/ (default: ./scripts/db_analysis/output)

Ordine di import raccomandato (dipendenze FK):
  1. temi          (nessuna FK)
  2. tags          (nessuna FK)
  3. autori        (nessuna FK)
  4. numeri_rivista (nessuna FK)
  5. articoli      (FK: autori, numeri_rivista)

Files sorgente richiesti in DATA_DIR:
  categorie_wp.json        → temi
  tag_wp.json              → tags
  autori_wp.json           → autori
  numeri_rivista_wp.json   → numeri_rivista
  articoli_wp_puliti.json  → articoli

Enrichment (letto da src/data/articoli_megacluster.json):
  id_numero, sottotitolo per gli articoli

Nota: il campo corpus articoli usa 'html_body' (nome reale nel JSON),
      la spec originale lo chiama 'html_pulito' — non esiste.
"""

import os
import re
import sys
import json
import time
import uuid
import logging
import argparse
from datetime import datetime
from pathlib import Path

import requests
from dotenv import load_dotenv

try:
    from tqdm import tqdm
except ImportError:
    # Fallback se tqdm non disponibile
    def tqdm(iterable, **kwargs):
        desc = kwargs.get("desc", "")
        total = kwargs.get("total", "?")
        print(f"  {desc} ({total} record)...")
        return iterable

# ─────────────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────────────

load_dotenv()

DIRECTUS_URL   = os.getenv("DIRECTUS_URL",   "http://159.69.196.64:8055")
# Token statico permanente (non scade come i token di sessione)
DIRECTUS_TOKEN = os.getenv("DIRECTUS_TOKEN", "nBZ6kdd0YgVnhLm2TZEDoT9A-NJujwVU")
DATA_DIR       = Path(os.getenv("DATA_DIR",  "./scripts/db_analysis/output"))

MEGACLUSTER_PATH = Path("./src/data/articoli_megacluster.json")

RETRY_MAX     = 3
RETRY_BACKOFF = [1, 2, 4]   # secondi
REQUEST_DELAY = 0.05        # 50ms tra le chiamate

COLLECTION_ORDER = ["temi", "tags", "autori", "numeri_rivista", "articoli"]

# ─────────────────────────────────────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────────────────────────────────────

def setup_logging() -> logging.Logger:
    """Configura logger su file e console."""
    log_dir = Path("./scripts/db_analysis/logs")
    log_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_path = log_dir / f"import_{ts}.log"

    fmt = "%(asctime)s | %(levelname)s | %(message)s"
    logging.basicConfig(
        level=logging.INFO,
        format=fmt,
        handlers=[
            logging.FileHandler(log_path, encoding="utf-8"),
            logging.StreamHandler(sys.stdout),
        ],
    )
    log = logging.getLogger("import_oel")
    log.info(f"Log file: {log_path}")
    return log

log = setup_logging()

# ─────────────────────────────────────────────────────────────────────────────
# HTTP helpers
# ─────────────────────────────────────────────────────────────────────────────

def _headers() -> dict:
    return {"Authorization": f"Bearer {DIRECTUS_TOKEN}", "Content-Type": "application/json"}


def _request(method: str, path: str, **kwargs) -> requests.Response:
    """Esegui chiamata HTTP con retry esponenziale."""
    url = f"{DIRECTUS_URL}{path}"
    for attempt in range(RETRY_MAX):
        try:
            r = requests.request(method, url, headers=_headers(), timeout=30, **kwargs)
            time.sleep(REQUEST_DELAY)
            return r
        except requests.RequestException as e:
            if attempt < RETRY_MAX - 1:
                wait = RETRY_BACKOFF[attempt]
                log.warning(f"Retry {attempt+1}/{RETRY_MAX} per {method} {path}: {e} — attendo {wait}s")
                time.sleep(wait)
            else:
                raise
    raise RuntimeError(f"Max retry raggiunto per {method} {path}")


def get_token(email: str, password: str) -> str:
    """Autenticazione e ritorno token."""
    r = requests.post(f"{DIRECTUS_URL}/auth/login",
                      json={"email": email, "password": password}, timeout=15)
    r.raise_for_status()
    return r.json()["data"]["access_token"]


def count_items(collection: str) -> int:
    """Conta record in una collection via meta=total_count."""
    r = _request("GET", f"/items/{collection}?meta=total_count&limit=1")
    if r.ok:
        return r.json().get("meta", {}).get("total_count", 0)
    return 0


def find_by_field(collection: str, field: str, value) -> dict | None:
    """Cerca un record per campo unico. Ritorna il record o None."""
    val_enc = str(value).replace("/", "%2F")
    r = _request("GET", f"/items/{collection}?filter[{field}][_eq]={val_enc}&limit=1")
    if r.ok:
        data = r.json().get("data", [])
        return data[0] if data else None
    return None


def create_item(collection: str, payload: dict) -> dict | None:
    """POST nuovo record. Ritorna il record creato o None."""
    r = _request("POST", f"/items/{collection}", json=payload)
    if r.ok:
        return r.json().get("data", {})
    log.error(f"CREATE {collection}: {r.status_code} {r.text[:300]}")
    return None


def update_item(collection: str, item_id: str, payload: dict) -> dict | None:
    """PATCH record esistente. Ritorna il record aggiornato o None."""
    r = _request("PATCH", f"/items/{collection}/{item_id}", json=payload)
    if r.ok:
        return r.json().get("data", {})
    log.error(f"UPDATE {collection}/{item_id}: {r.status_code} {r.text[:300]}")
    return None


# ─────────────────────────────────────────────────────────────────────────────
# Upsert idempotente
# ─────────────────────────────────────────────────────────────────────────────

class Stats:
    """Contatori per collection."""
    def __init__(self):
        self.created = self.updated = self.skipped = self.errors = 0

    def summary(self) -> str:
        total = self.created + self.updated + self.skipped + self.errors
        return (f"Totale: {total} | Creati: {self.created} | "
                f"Aggiornati: {self.updated} | Saltati: {self.skipped} | "
                f"Errori: {self.errors}")


def upsert(collection: str, key_field: str, key_value, payload: dict,
           compare_fields: list[str], stats: Stats, dry_run: bool,
           label: str = "") -> str | None:
    """
    Upsert idempotente: verifica esistenza, confronta campi rilevanti,
    crea/aggiorna/salta di conseguenza.
    Ritorna UUID del record (o None in caso di errore).
    """
    if dry_run:
        stats.created += 1
        return "dry-run-uuid"

    existing = find_by_field(collection, key_field, key_value)

    if existing is None:
        payload = {"id": str(uuid.uuid4()), **payload}
        result = create_item(collection, payload)
        if result:
            stats.created += 1
            log.info(f"CREATE | {collection} | {label or key_value} | OK | id={result.get('id','?')}")
            return result.get("id")
        else:
            stats.errors += 1
            log.error(f"CREATE | {collection} | {label or key_value} | FAILED")
            return None
    else:
        # Confronta campi rilevanti per decidere se aggiornare
        diff = {f: payload[f] for f in compare_fields
                if f in payload and existing.get(f) != payload.get(f)
                and payload[f] is not None}
        if not diff:
            stats.skipped += 1
            return existing.get("id")
        else:
            result = update_item(collection, existing["id"], diff)
            if result:
                stats.updated += 1
                log.info(f"UPDATE | {collection} | {label or key_value} | campi={list(diff.keys())}")
                return result.get("id")
            else:
                stats.errors += 1
                log.error(f"UPDATE | {collection} | {label or key_value} | FAILED")
                return existing.get("id")  # ritorna id anche se update fallisce


# ─────────────────────────────────────────────────────────────────────────────
# Derivazione id_numero da slug numeri_rivista
# ─────────────────────────────────────────────────────────────────────────────

def derive_id_numero_and_tipo(slug: str, fallback_counter: dict) -> tuple[str, str]:
    """
    Derive id_numero e tipo da slug numeri_rivista.

    Regole:
      "numero-{N}-*"          → oel, OEL-{N}
      "insieme-n-{N}-*"       → ins, INS-{N}
      "insieme-bollettino-*"  → ins, INS-{negativo}
      "insieme-giallo-*"      → extra, slug intero
      altri                   → extra, slug intero
    """
    # OEL: numero-{N}-*
    m = re.match(r"^numero-(\d+)-", slug)
    if m:
        return f"OEL-{m.group(1)}", "oel"

    # INS con numero esplicito: insieme-n-{N}-*
    m = re.match(r"^insieme-n-(\d+)-", slug)
    if m:
        return f"INS-{m.group(1)}", "ins"

    # INS senza numero: insieme-n-{N} (senza trattino finale)
    m = re.match(r"^insieme-n-(\d+)$", slug)
    if m:
        return f"INS-{m.group(1)}", "ins"

    # INS edge case: bollettino, giallo, ecc.
    if slug.startswith("insieme-"):
        fallback_counter["ins"] = fallback_counter.get("ins", 0) - 1
        return f"INS-{fallback_counter['ins']}", "ins"

    # Extra
    return slug, "extra"


# ─────────────────────────────────────────────────────────────────────────────
# Caricamento dati sorgente
# ─────────────────────────────────────────────────────────────────────────────

def load_json(path: Path, label: str) -> list | dict:
    """Carica JSON con encoding UTF-8."""
    if not path.exists():
        log.error(f"File non trovato: {path}")
        sys.exit(1)
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    log.info(f"Caricato {label}: {len(data)} record")
    return data


def load_megacluster() -> dict:
    """
    Carica articoli_megacluster.json e ritorna dizionario {wp_id_str: record}.
    """
    if not MEGACLUSTER_PATH.exists():
        log.warning(f"megacluster non trovato: {MEGACLUSTER_PATH} — campi arricchiti non disponibili")
        return {}
    with open(MEGACLUSTER_PATH, encoding="utf-8") as f:
        mc = json.load(f)
    by_id = mc.get("byId", mc)
    log.info(f"Caricato megacluster: {len(by_id)} record")
    return by_id


# ─────────────────────────────────────────────────────────────────────────────
# Import: temi (categorie_wp.json)
# ─────────────────────────────────────────────────────────────────────────────

def import_temi(dry_run: bool) -> dict[int, str]:
    """
    Importa categorie_wp.json → collection temi.
    Ritorna dizionario {term_id: uuid_directus}.
    """
    log.info("=== IMPORT: temi ===")
    data = load_json(DATA_DIR / "categorie_wp.json", "categorie_wp")
    stats = Stats()
    term_to_uuid: dict[int, str] = {}

    for row in tqdm(data, desc="temi", total=len(data)):
        slug = row["slug"]
        payload = {
            "slug":        slug,
            "nome":        row["name"],
            "descrizione": row.get("description") or None,
            "cluster_id":  None,
            "colore_hex":  None,
        }
        uid = upsert("temi", "slug", slug, payload,
                     compare_fields=["nome", "descrizione"],
                     stats=stats, dry_run=dry_run, label=slug)
        if uid:
            term_to_uuid[row["term_id"]] = uid

    log.info(f"temi — {stats.summary()}")
    return term_to_uuid


# ─────────────────────────────────────────────────────────────────────────────
# Import: tags (tag_wp.json)
# ─────────────────────────────────────────────────────────────────────────────

def import_tags(dry_run: bool) -> dict[int, str]:
    """
    Importa tag_wp.json → collection tags.
    Ritorna dizionario {term_id: uuid_directus}.
    """
    log.info("=== IMPORT: tags ===")
    data = load_json(DATA_DIR / "tag_wp.json", "tag_wp")
    stats = Stats()
    term_to_uuid: dict[int, str] = {}

    for row in tqdm(data, desc="tags", total=len(data)):
        slug = row["slug"]
        payload = {
            "slug":  slug,
            "nome":  row["name"],
            "fonte": "manuale",
        }
        uid = upsert("tags", "slug", slug, payload,
                     compare_fields=["nome"],
                     stats=stats, dry_run=dry_run, label=slug)
        if uid:
            term_to_uuid[row["term_id"]] = uid

    log.info(f"tags — {stats.summary()}")
    return term_to_uuid


# ─────────────────────────────────────────────────────────────────────────────
# Import: autori (autori_wp.json)
# ─────────────────────────────────────────────────────────────────────────────

def import_autori(dry_run: bool, articoli: list) -> dict[int, str]:
    """
    Importa autori_wp.json → collection autori.
    Filtra solo autori che compaiono in almeno un articolo.
    Ritorna dizionario {wp_id: uuid_directus}.
    """
    log.info("=== IMPORT: autori ===")
    data = load_json(DATA_DIR / "autori_wp.json", "autori_wp")

    # Filtra solo autori con almeno 1 articolo
    autori_attivi = {a["author_id"] for a in articoli}
    data_filtrati = [a for a in data if a["wp_id"] in autori_attivi]
    log.info(f"Autori con articoli: {len(data_filtrati)}/{len(data)} (filtrati {len(data)-len(data_filtrati)} senza articoli)")

    stats = Stats()
    wpid_to_uuid: dict[int, str] = {}

    for row in tqdm(data_filtrati, desc="autori", total=len(data_filtrati)):
        slug = row["login"]  # login è il campo slug-safe
        payload = {
            "slug":         slug,
            "nome_completo": row["display_name"],
            "bio_html":     row.get("bio") or None,
            "email":        row.get("email") or None,
        }
        uid = upsert("autori", "slug", slug, payload,
                     compare_fields=["nome_completo", "bio_html"],
                     stats=stats, dry_run=dry_run, label=slug)
        if uid:
            wpid_to_uuid[row["wp_id"]] = uid

    log.info(f"autori — {stats.summary()}")
    return wpid_to_uuid


# ─────────────────────────────────────────────────────────────────────────────
# Import: numeri_rivista (numeri_rivista_wp.json)
# ─────────────────────────────────────────────────────────────────────────────

def import_numeri_rivista(dry_run: bool) -> dict[str, str]:
    """
    Importa numeri_rivista_wp.json → collection numeri_rivista.
    Deriva id_numero e tipo dal campo slug.
    Ritorna dizionario {id_numero: uuid_directus}.
    """
    log.info("=== IMPORT: numeri_rivista ===")
    data = load_json(DATA_DIR / "numeri_rivista_wp.json", "numeri_rivista_wp")
    stats = Stats()
    id_numero_to_uuid: dict[str, str] = {}
    fallback_counter: dict = {}

    for row in tqdm(data, desc="numeri_rivista", total=len(data)):
        slug = row["slug"]
        id_numero, tipo = derive_id_numero_and_tipo(slug, fallback_counter)

        # Estrai numero progressivo dalla parte numerica di id_numero
        m = re.search(r"(\d+)$", id_numero)
        numero_progressivo = int(m.group(1)) if m else None

        # Anno da date
        anno = int(row["date"][:4]) if row.get("date") else None

        payload = {
            "id_numero":          id_numero,
            "tipo":               tipo,
            "display_title":      row["title"],
            "anno_pubblicazione": anno,
            "numero_progressivo": numero_progressivo,
            "wp_url":             row.get("url_originale") or None,
        }
        uid = upsert("numeri_rivista", "id_numero", id_numero, payload,
                     compare_fields=["display_title", "tipo", "anno_pubblicazione"],
                     stats=stats, dry_run=dry_run, label=id_numero)
        if uid:
            id_numero_to_uuid[id_numero] = uid

    log.info(f"numeri_rivista — {stats.summary()}")
    return id_numero_to_uuid


# ─────────────────────────────────────────────────────────────────────────────
# Import: articoli (articoli_wp_puliti.json + megacluster)
# ─────────────────────────────────────────────────────────────────────────────

def import_articoli(
    dry_run: bool,
    wpid_to_autore_uuid: dict[int, str],
    id_numero_to_uuid: dict[str, str],
) -> None:
    """
    Importa articoli_wp_puliti.json → collection articoli.
    Arricchisce con dati megacluster (id_numero, sottotitolo).
    Nota: campo `categories` non presente nel JSON sorgente —
          logica serie saltata, warning nel log.
    """
    log.info("=== IMPORT: articoli ===")

    articoli = load_json(DATA_DIR / "articoli_wp_puliti.json", "articoli_wp_puliti")
    megacluster = load_megacluster()

    # Controlla campo categories
    has_categories = any("categories" in a or "categorie" in a for a in articoli[:5])
    if not has_categories:
        log.warning("Campo 'categories' non trovato in articoli_wp_puliti.json — "
                    "logica serie saltata per tutti gli articoli")

    # Validazione FK
    n_autori = count_items("autori")
    n_numeri = count_items("numeri_rivista")
    if not dry_run:
        if n_autori == 0:
            log.error("BLOCCO: collection 'autori' vuota. Importa autori prima degli articoli.")
            sys.exit(1)
        if n_numeri == 0:
            log.error("BLOCCO: collection 'numeri_rivista' vuota. Importa numeri_rivista prima degli articoli.")
            sys.exit(1)
        log.info(f"FK check OK: autori={n_autori}, numeri_rivista={n_numeri}")

    stats = Stats()
    no_megacluster: list[int] = []

    for art in tqdm(articoli, desc="articoli", total=len(articoli)):
        wp_id = art["wp_id"]
        mc = megacluster.get(str(wp_id))
        if mc is None:
            no_megacluster.append(wp_id)

        # Risolvi FK autore
        autore_uuid = wpid_to_autore_uuid.get(art.get("author_id"))

        # Risolvi FK numero_rivista via megacluster
        numero_uuid = None
        id_numero = mc.get("id_numero") if mc else None
        if id_numero:
            numero_uuid = id_numero_to_uuid.get(id_numero)

        payload = {
            "wp_id":              wp_id,
            "slug":               art["slug"],
            "titolo":             art["title"],
            "corpo":              art.get("html_body") or None,
            "lang":               art.get("lang", "it"),
            "stato":              "published",
            "data_pubblicazione": art.get("date") or None,
            "original_url":       art.get("url_originale") or None,
            "seo_description":    art.get("yoast_description") or None,
            "seo_title":          art.get("yoast_title") or None,
            "sottotitolo":        (mc.get("sottotitolo") if mc else None),
            "autore":             autore_uuid,
            "numero_rivista":     numero_uuid,
            "has_comments":       False,
            "serie":              None,  # skip: campo categories assente
            # umap/cluster: null (non ancora calcolati)
            "umap_x": None, "umap_y": None, "umap_z": None,
            "cluster_id": None,
        }

        upsert("articoli", "wp_id", wp_id, payload,
               compare_fields=["titolo", "corpo", "seo_description", "sottotitolo",
                                "autore", "numero_rivista", "lang"],
               stats=stats, dry_run=dry_run, label=f"wp_id={wp_id} {art['slug'][:40]}")

    # Salva articoli senza megacluster
    if no_megacluster:
        out_path = Path("./scripts/db_analysis/logs/articoli_senza_megacluster.txt")
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write("\n".join(str(i) for i in no_megacluster))
        log.warning(f"{len(no_megacluster)} articoli senza corrispondenza in megacluster → {out_path}")

    log.info(f"articoli — {stats.summary()}")


# ─────────────────────────────────────────────────────────────────────────────
# Dry-run summary
# ─────────────────────────────────────────────────────────────────────────────

def dry_run_summary(collection: str | None) -> None:
    """Stampa conteggi stimati senza toccare il server."""
    print("\n=== DRY-RUN SUMMARY ===")
    files = {
        "temi":           DATA_DIR / "categorie_wp.json",
        "tags":           DATA_DIR / "tag_wp.json",
        "autori":         DATA_DIR / "autori_wp.json",
        "numeri_rivista": DATA_DIR / "numeri_rivista_wp.json",
        "articoli":       DATA_DIR / "articoli_wp_puliti.json",
    }
    targets = [collection] if collection else COLLECTION_ORDER
    for coll in targets:
        path = files[coll]
        if path.exists():
            with open(path, encoding="utf-8") as f:
                n = len(json.load(f))
            if coll == "autori":
                arts = json.load(open(DATA_DIR / "articoli_wp_puliti.json", encoding="utf-8"))
                attivi = len({a["author_id"] for a in arts})
                print(f"  {coll:20s}: {n} record totali, ~{attivi} con articoli (da importare)")
            else:
                print(f"  {coll:20s}: {n} record da importare")
        else:
            print(f"  {coll:20s}: FILE NON TROVATO ({path})")
    print()


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Import bulk OEL datasets → Directus")
    parser.add_argument("--collection", choices=COLLECTION_ORDER,
                        help="Importa solo questa collection")
    parser.add_argument("--dry-run", action="store_true",
                        help="Simula senza scrivere su Directus")
    args = parser.parse_args()

    if args.dry_run:
        log.info("Modalita DRY-RUN attiva — nessuna scrittura su Directus")
        dry_run_summary(args.collection)

    if not DIRECTUS_TOKEN and not args.dry_run:
        log.error("DIRECTUS_TOKEN non impostato. Esporta la variabile o crea un file .env")
        sys.exit(1)

    targets = [args.collection] if args.collection else COLLECTION_ORDER

    # Stato condiviso tra collection per risolvere le FK
    wpid_to_autore_uuid:   dict[int, str] = {}
    id_numero_to_uuid:     dict[str, str] = {}

    # Carica articoli una volta sola (serve per filtrare autori)
    articoli_data = None
    if "autori" in targets or "articoli" in targets:
        articoli_data = load_json(DATA_DIR / "articoli_wp_puliti.json", "articoli_wp_puliti (preload)")

    start_global = time.time()

    for coll in targets:
        start = time.time()

        if coll == "temi":
            import_temi(args.dry_run)

        elif coll == "tags":
            import_tags(args.dry_run)

        elif coll == "autori":
            wpid_to_autore_uuid = import_autori(args.dry_run, articoli_data)

        elif coll == "numeri_rivista":
            id_numero_to_uuid = import_numeri_rivista(args.dry_run)

        elif coll == "articoli":
            # Se lo script viene lanciato con --collection articoli in sessione separata,
            # ricostruisce i dizionari FK dal server
            if not wpid_to_autore_uuid and not args.dry_run:
                log.info("Ricostruzione dizionario autori dal server...")
                wpid_to_autore_uuid = _rebuild_autori_dict(articoli_data)
            if not id_numero_to_uuid and not args.dry_run:
                log.info("Ricostruzione dizionario numeri_rivista dal server...")
                id_numero_to_uuid = _rebuild_numeri_dict()
            import_articoli(args.dry_run, wpid_to_autore_uuid, id_numero_to_uuid)

        elapsed = time.time() - start
        log.info(f"  Collection '{coll}' completata in {elapsed:.1f}s")

    total = time.time() - start_global
    log.info(f"=== IMPORT COMPLETATO in {total:.1f}s ===")


# ─────────────────────────────────────────────────────────────────────────────
# Ricostruzione dizionari FK da server (per --collection articoli standalone)
# ─────────────────────────────────────────────────────────────────────────────

def _rebuild_autori_dict(articoli: list) -> dict[int, str]:
    """
    Ricostruisce {wp_id: uuid} leggendo gli autori dal server Directus.
    Usato quando --collection articoli viene eseguito in sessione separata.
    """
    autori_wp = load_json(DATA_DIR / "autori_wp.json", "autori_wp (rebuild)")
    login_to_wpid = {a["login"]: a["wp_id"] for a in autori_wp}

    result: dict[int, str] = {}
    log.info("Scarico autori dal server per ricostruzione FK...")
    r = _request("GET", "/items/autori?fields=id,slug&limit=-1")
    if r.ok:
        for rec in r.json().get("data", []):
            wp_id = login_to_wpid.get(rec["slug"])
            if wp_id is not None:
                result[wp_id] = rec["id"]
    log.info(f"FK autori ricostruiti: {len(result)}")
    return result


def _rebuild_numeri_dict() -> dict[str, str]:
    """
    Ricostruisce {id_numero: uuid} leggendo numeri_rivista dal server.
    """
    result: dict[str, str] = {}
    r = _request("GET", "/items/numeri_rivista?fields=id,id_numero&limit=-1")
    if r.ok:
        for rec in r.json().get("data", []):
            result[rec["id_numero"]] = rec["id"]
    log.info(f"FK numeri_rivista ricostruiti: {len(result)}")
    return result


if __name__ == "__main__":
    main()
