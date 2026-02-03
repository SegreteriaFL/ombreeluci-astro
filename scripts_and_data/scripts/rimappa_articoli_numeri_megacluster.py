#!/usr/bin/env python3
"""
Rimappatura articoli OEL/INS nei rispettivi numeri e aggiornamento del megacluster.

Fonte A: numeri_wp_FINAL.json -> articoli_urls per ogni numero; match articoli megacluster per URL/slug.
Fonte B: Per articoli senza match URL, usa categories_slugs (es. n-100, numero-1-1983) per identificare il numero.

Aggiorna articoli_megacluster.json con numero_rivista e anno_rivista per tutti gli articoli con WP_ID.
Genera report sugli articoli orfani dopo il doppio incrocio.
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

BASE = Path(__file__).resolve().parents[2]
NUMERI_JSON = BASE / "scripts_and_data" / "datasets" / "numeri_rivista" / "numeri_wp_FINAL.json"
SLUGS_JSON = BASE / "scripts_and_data" / "datasets" / "articoli" / "articoli_slugs_definitivi.json"
UNIFIED_JSON = BASE / "scripts_and_data" / "datasets" / "articoli" / "unified_data.json"
ARRICCHITO_JSONL = BASE / "scripts_and_data" / "datasets" / "articoli" / "articoli_testo_arricchito.jsonl"
MEGACLUSTER_JSON = BASE / "src" / "data" / "articoli_megacluster.json"
REPORT_JSON = BASE / "scripts_and_data" / "report_rimappatura_numeri.json"


def normalize_url(url: str) -> str:
    """Normalizza URL per confronto: lowercase, https, senza trailing slash."""
    if not url:
        return ""
    u = url.strip().lower()
    if u.startswith("http://"):
        u = "https://" + u[7:]
    return u.rstrip("/")


def slug_from_url(url: str) -> Optional[str]:
    """Estrae lo slug dal path (ultimo segmento): .../anno/slug o .../anno/slug/"""
    u = normalize_url(url)
    if not u or "/" not in u:
        return None
    path = u.split("?", 1)[0]
    parts = path.rstrip("/").split("/")
    return parts[-1] if parts else None


def load_numeri() -> Tuple[Dict[str, Tuple[str, int, int]], Dict[str, Tuple[str, int, int]], Dict[str, Tuple[int, int]], Dict[str, str]]:
    """
    Carica numeri_wp_FINAL e costruisce:
    - url_to_numero: url_normalized -> (id_numero, numero_progressivo, anno_pubblicazione)
    - slug_to_numero: slug_articolo -> (id_numero, numero_progressivo, anno) per match solo slug
    - id_numero_to_info: id_numero -> (numero_progressivo, anno_pubblicazione)
    - category_slug_to_id_numero: "numero-K-YYYY" o "n-K" -> id_numero
    """
    with NUMERI_JSON.open("r", encoding="utf-8") as f:
        numeri = json.load(f)

    url_to_numero: Dict[str, Tuple[str, int, int]] = {}
    slug_to_numero: Dict[str, Tuple[str, int, int]] = {}
    id_numero_to_info: Dict[str, Tuple[int, int]] = {}
    category_slug_to_id_numero: Dict[str, str] = {}

    for num in numeri:
        id_numero = num["id_numero"]
        np = num["numero_progressivo"]
        anno = num["anno_pubblicazione"]
        id_numero_to_info[id_numero] = (np, anno)

        # Categoria tipo "numero-K-YYYY" (es. numero-1-1983)
        cat_slug = f"numero-{np}-{anno}"
        category_slug_to_id_numero[cat_slug] = id_numero
        # Categoria tipo "n-K" (es. n-100 per OEL)
        n_slug = f"n-{np}"
        category_slug_to_id_numero[n_slug] = id_numero

        for url in num.get("articoli_urls") or []:
            key = normalize_url(url)
            if key:
                url_to_numero[key] = (id_numero, np, anno)
            art_slug = slug_from_url(url)
            if art_slug:
                slug_to_numero[art_slug] = (id_numero, np, anno)

    return url_to_numero, slug_to_numero, id_numero_to_info, category_slug_to_id_numero


def load_articoli_slugs() -> Dict[str, str]:
    """wp_id (string) -> slug."""
    with SLUGS_JSON.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return {str(k): v for k, v in data.items()}


def load_unified_years() -> Dict[str, int]:
    """wp_id (string) -> anno da date."""
    with UNIFIED_JSON.open("r", encoding="utf-8") as f:
        data = json.load(f)
    out = {}
    for k, v in data.items():
        date_str = v.get("date") or v.get("meta", {}).get("date") or ""
        if date_str:
            match = re.match(r"(\d{4})", date_str)
            if match:
                out[str(k)] = int(match.group(1))
    return out


def load_categories_slugs() -> Dict[str, str]:
    """wp_id (string) -> categories_slugs (string comma-separated)."""
    out = {}
    with ARRICCHITO_JSONL.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            wid = obj.get("id")
            if wid is not None:
                out[str(wid)] = (obj.get("categories_slugs") or "").strip()
    return out


def find_numero_from_categories(
    categories_slugs: str,
    category_slug_to_id_numero: Dict[str, str],
    id_numero_to_info: Dict[str, Tuple[int, int]],
) -> Optional[Tuple[str, int, int]]:
    """
    Cerca in categories_slugs uno slug che identifichi il numero.
    Ritorna (id_numero, numero_progressivo, anno) o None.
    """
    if not categories_slugs:
        return None
    parts = [p.strip() for p in categories_slugs.split(",") if p.strip()]
    for slug in parts:
        id_numero = category_slug_to_id_numero.get(slug)
        if id_numero:
            info = id_numero_to_info.get(id_numero)
            if info:
                np, anno = info
                return (id_numero, np, anno)
    return None


def main() -> None:
    print("Caricamento dati...")
    url_to_numero, slug_to_numero, id_numero_to_info, category_slug_to_id_numero = load_numeri()
    slugs_by_id = load_articoli_slugs()
    years_by_id = load_unified_years()
    categories_by_id = load_categories_slugs()

    print(f"  URL->numero: {len(url_to_numero)} voci, slug->numero: {len(slug_to_numero)} voci")
    print(f"  Slugs articoli: {len(slugs_by_id)}")
    print(f"  Anni (unified): {len(years_by_id)}")
    print(f"  Categories: {len(categories_by_id)}")

    with MEGACLUSTER_JSON.open("r", encoding="utf-8") as f:
        megacluster = json.load(f)

    by_id = megacluster.get("byId") or {}
    total_wp = len(by_id)
    print(f"\nArticoli nel megacluster (byId): {total_wp}")

    matched_url: List[str] = []
    matched_slug_only: List[str] = []
    matched_categories: List[str] = []
    orfani: List[str] = []

    for wp_id, entry in by_id.items():
        if not isinstance(entry, dict):
            continue
        slug = slugs_by_id.get(wp_id)
        year = years_by_id.get(wp_id)
        categories_slugs = categories_by_id.get(wp_id, "")

        id_numero: Optional[str] = None
        numero_progressivo: Optional[int] = None
        anno_rivista: Optional[int] = None

        # Fonte A: match per URL (costruito da anno + slug)
        if slug:
            candidates = []
            if year:
                candidates.append(f"https://www.ombreeluci.it/{year}/{slug}/")
                candidates.append(f"https://www.ombreeluci.it/{year}/{slug}")
            for y in range(1976, 2027):
                if y != year:
                    candidates.append(f"https://www.ombreeluci.it/{y}/{slug}/")
                    candidates.append(f"https://www.ombreeluci.it/{y}/{slug}")
            for url in candidates:
                key = normalize_url(url)
                if key in url_to_numero:
                    id_numero, numero_progressivo, anno_rivista = url_to_numero[key]
                    matched_url.append(wp_id)
                    break

        # Fonte A.2: match solo per slug (se URL non ha match)
        if numero_progressivo is None and slug and slug in slug_to_numero:
            id_numero, numero_progressivo, anno_rivista = slug_to_numero[slug]
            matched_slug_only.append(wp_id)

        # Fonte B: match per categories_slugs
        if numero_progressivo is None and categories_slugs:
            found = find_numero_from_categories(
                categories_slugs, category_slug_to_id_numero, id_numero_to_info
            )
            if found:
                id_numero, numero_progressivo, anno_rivista = found
                matched_categories.append(wp_id)

        if numero_progressivo is not None and anno_rivista is not None:
            entry["numero_rivista"] = numero_progressivo
            entry["anno_rivista"] = anno_rivista
            if id_numero:
                entry["id_numero"] = id_numero
        else:
            orfani.append(wp_id)

    # Rimuovi id_numero/numero_rivista/anno_rivista da eventuali entry che non abbiamo assegnato
    # (non necessario se aggiungiamo solo quando c'è match)

    # Salva megacluster aggiornato
    with MEGACLUSTER_JSON.open("w", encoding="utf-8") as f:
        json.dump(megacluster, f, ensure_ascii=False, indent=2)

    # Report
    only_url = set(matched_url) - set(matched_slug_only) - set(matched_categories)
    only_slug = set(matched_slug_only) - set(matched_url) - set(matched_categories)
    only_cat = set(matched_categories) - set(matched_url) - set(matched_slug_only)

    report = {
        "generato_il": megacluster.get("generatedAt", ""),
        "rimappatura": {
            "totale_articoli_megacluster_con_wp_id": total_wp,
            "assegnati_via_url_fonte_a": len(matched_url),
            "assegnati_via_slug_only_fonte_a2": len(matched_slug_only),
            "assegnati_via_categories_slugs_fonte_b": len(matched_categories),
            "solo_url": len(only_url),
            "solo_slug": len(only_slug),
            "solo_categories": len(only_cat),
            "totale_assegnati": total_wp - len(orfani),
            "orfani_senza_numero_rivista": len(orfani),
            "percentuale_copertura": round(100.0 * (total_wp - len(orfani)) / total_wp, 2) if total_wp else 0,
        },
        "orfani_wp_ids": orfani,
    }

    with REPORT_JSON.open("w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print("\n--- REPORT RIMAPPATURA ---")
    print(f"Totale articoli con WP_ID (megacluster): {total_wp}")
    print(f"Assegnati via URL (Fonte A):            {len(matched_url)}")
    print(f"Assegnati via slug only (Fonte A.2):    {len(matched_slug_only)}")
    print(f"Assegnati via categories_slugs (Fonte B): {len(matched_categories)}")
    print(f"  - solo URL:     {len(only_url)}")
    print(f"  - solo slug:    {len(only_slug)}")
    print(f"  - solo categories: {len(only_cat)}")
    print(f"Totale con numero_rivista/anno_rivista: {total_wp - len(orfani)}")
    print(f"ORFANI (senza numero):                  {len(orfani)}")
    print(f"Copertura:                              {report['rimappatura']['percentuale_copertura']}%")
    print(f"\nReport salvato in: {REPORT_JSON}")
    print(f"Megacluster aggiornato: {MEGACLUSTER_JSON}")


if __name__ == "__main__":
    main()
