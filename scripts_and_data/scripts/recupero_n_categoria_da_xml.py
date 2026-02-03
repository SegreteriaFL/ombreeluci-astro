#!/usr/bin/env python3
"""
Recupero forzato categoria numero (n-XXX) da export WordPress XML.

1. Scansione XML: per ogni post estrae wp:post_id, wp:post_name (slug) e categorie
   domain="category" nicename che iniziano con "n-" (es. n-88).
2. Riparazione frontmatter: per articoli nel CSV senza wp_id, cerca nel XML per slug
   e reinserisce wp_id nel file .md.
3. Aggiornamento: applica n-XXX recuperati a bridge CSV, bridge JSON e megacluster
   per portare la copertura oltre l'82%.
"""

import csv
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

BASE = Path(__file__).resolve().parents[2]
XML_PATH = BASE / "ombreeluci.WordPress-export-post-.2026-01-31.xml"
NUMERI_JSON = BASE / "scripts_and_data" / "datasets" / "numeri_rivista" / "numeri_wp_FINAL.json"
MEGACLUSTER_JSON = BASE / "src" / "data" / "articoli_megacluster.json"
OUT_DIR = BASE / "scripts_and_data" / "datasets" / "articoli"
BRIDGE_CSV = OUT_DIR / "bridge_articoli_numeri.csv"
BRIDGE_JSON = OUT_DIR / "bridge_articoli_numeri.json"

# Regex per estrazione senza caricare XML intero (evita errori di well-formed)
RE_POST_ID = re.compile(r"<wp:post_id>(\d+)</wp:post_id>")
RE_POST_NAME = re.compile(r"<wp:post_name><!\[CDATA\[([^\]]*)\]\]></wp:post_name>")
RE_CATEGORY_N = re.compile(r'<category\s+domain="category"\s+nicename="(n-\d+)"')


def parse_xml_posts(xml_path: Path) -> Tuple[Dict[str, List[str]], Dict[str, str], Dict[str, str]]:
    """
    Estrae da WordPress XML (stream/regex) per ogni blocco <item>...</item>:
    - post_id -> [nicename categorie n-XXX]
    - post_id -> post_name (slug)
    - slug -> post_id (per repair; ultimo wins se duplicati)
    """
    post_id_to_n_slugs: Dict[str, List[str]] = {}
    post_id_to_slug: Dict[str, str] = {}
    slug_to_post_id: Dict[str, str] = {}

    if not xml_path.exists():
        print(f"[ERROR] XML non trovato: {xml_path}")
        return post_id_to_n_slugs, post_id_to_slug, slug_to_post_id

    print(f"[1] Parsing XML: {xml_path} (stream/regex)...")
    content = xml_path.read_text(encoding="utf-8", errors="replace")
    n_items = 0
    for block in re.finditer(r"<item>\s*(.*?)\s*</item>", content, re.DOTALL):
        chunk = block.group(1)
        mid = RE_POST_ID.search(chunk)
        post_id = mid.group(1).strip() if mid else None
        mname = RE_POST_NAME.search(chunk)
        post_name = (mname.group(1).strip() if mname else "") or ""
        n_cats = RE_CATEGORY_N.findall(chunk)
        n_cats = [c for c in n_cats if re.match(r"n-\d+$", c)]

        if post_id:
            n_items += 1
            if n_cats:
                post_id_to_n_slugs[post_id] = n_cats
            post_id_to_slug[post_id] = post_name
            if post_name:
                slug_to_post_id[post_name] = post_id

    print(f"    Post elaborati: {n_items}, con categoria n-*: {len(post_id_to_n_slugs)}, slug->post_id: {len(slug_to_post_id)}")
    return post_id_to_n_slugs, post_id_to_slug, slug_to_post_id


def load_n_slug_to_numero() -> Dict[str, Dict[str, Any]]:
    """Come crea_database_unificato: n-XXX -> numero (id_numero, numero_progressivo, anno_pubblicazione, tipo_rivista)."""
    with NUMERI_JSON.open("r", encoding="utf-8") as f:
        numeri = json.load(f)
    n_slug_to_numero = {}
    for n in numeri:
        np = n.get("numero_progressivo")
        if np is not None:
            n_slug_to_numero[f"n-{np}"] = n
    return n_slug_to_numero


def get_numero_from_n_slug(n_slug: str, n_slug_to_numero: Dict[str, Dict]) -> Optional[Dict[str, Any]]:
    """Ritorna il numero (dict) per la prima n-XXX assegnata al post (es. n-81 -> OEL-81)."""
    return n_slug_to_numero.get(n_slug)


def repair_bridge_and_md(
    rows: List[Dict[str, Any]],
    slug_to_post_id: Dict[str, str],
    post_id_to_n_slugs: Dict[str, List[str]],
    n_slug_to_numero: Dict[str, Dict],
) -> Tuple[List[Dict[str, Any]], int, int]:
    """
    Aggiorna le righe del bridge: (1) wp_id da slug se mancante, (2) id_numero/numero_rivista/anno da n-XXX se mancante.
    Ritorna (rows_aggiornate, count_wp_id_ripristinati, count_numero_da_xml).
    """
    count_wp_id = 0
    count_numero = 0
    for r in rows:
        slug = (r.get("slug") or "").strip()
        wp_id = r.get("wp_id")
        if wp_id is None or wp_id == "":
            wid = slug_to_post_id.get(slug)
            if wid:
                r["wp_id"] = wid
                count_wp_id += 1

        wp_id = r.get("wp_id")
        if wp_id is not None and wp_id != "":
            wp_id_str = str(wp_id).strip()
        else:
            wp_id_str = None

        if wp_id_str and (not r.get("id_numero") or r.get("numero_rivista") in (None, "")):
            n_slugs = post_id_to_n_slugs.get(wp_id_str)
            if n_slugs:
                n_slug = n_slugs[0]
                numero = get_numero_from_n_slug(n_slug, n_slug_to_numero)
                if numero:
                    r["id_numero"] = numero.get("id_numero")
                    r["numero_rivista"] = numero.get("numero_progressivo")
                    r["anno_rivista"] = numero.get("anno_pubblicazione")
                    r["tipo_rivista"] = numero.get("tipo_rivista")
                    count_numero += 1

    return rows, count_wp_id, count_numero


def repair_md_frontmatter(rows: List[Dict], base: Path) -> int:
    """Per ogni riga con relative_path e wp_id valorizzato, se il .md non ha wp_id nel frontmatter, lo aggiunge. Ritorna numero file modificati."""
    modified = 0
    for r in rows:
        path = r.get("relative_path")
        wp_id = r.get("wp_id")
        if not path or wp_id is None or wp_id == "":
            continue
        md_path = base / path.replace("\\", "/")
        if not md_path.exists():
            continue
        try:
            content = md_path.read_text(encoding="utf-8")
        except Exception:
            continue
        if not content.startswith("---"):
            continue
        parts = content.split("---", 2)
        if len(parts) < 3:
            continue
        fm = parts[1]
        if re.search(r"^\s*wp_id\s*:", fm, re.MULTILINE | re.IGNORECASE):
            continue
        new_fm = set_wp_id_in_frontmatter(fm, str(wp_id))
        new_content = "---" + new_fm + "---" + parts[2]
        if new_content != content:
            md_path.write_text(new_content, encoding="utf-8")
            modified += 1
    return modified


def set_wp_id_in_frontmatter(fm: str, wp_id: str) -> str:
    """Inserisce wp_id dopo slug: se presente, altrimenti dopo la prima riga."""
    lines = fm.rstrip().split("\n")
    new_lines = []
    inserted = False
    for line in lines:
        stripped = line.strip()
        if stripped.lower().startswith("wp_id:"):
            indent = line[: len(line) - len(line.lstrip())]
            new_lines.append(f"{indent}wp_id: {wp_id}")
            inserted = True
            continue
        new_lines.append(line)
        if not inserted and "slug:" in line and ":" in line:
            indent = line[: len(line) - len(line.lstrip())]
            new_lines.append(f"{indent}wp_id: {wp_id}")
            inserted = True
    if not inserted and new_lines:
        indent = "  " if new_lines[-1].startswith(" ") else ""
        new_lines.append(f"{indent}wp_id: {wp_id}")
    return "\n".join(new_lines) + "\n"


def update_megacluster_from_bridge(megacluster_path: Path, rows: List[Dict]) -> Tuple[int, int]:
    """Aggiorna megacluster byId con id_numero/numero_rivista/anno_rivista da bridge rows (per wp_id presenti). Ritorna (totale_byId, aggiornati)."""
    with megacluster_path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    by_id = data.get("byId") or {}
    by_wp_id = {}
    for r in rows:
        wid = r.get("wp_id")
        if wid is None or wid == "":
            continue
        key = str(wid).strip()
        if r.get("id_numero") and r.get("numero_rivista") is not None:
            by_wp_id[key] = {
                "id_numero": r.get("id_numero"),
                "numero_rivista": r.get("numero_rivista"),
                "anno_rivista": r.get("anno_rivista"),
            }
    aggiornati = 0
    for wp_id, entry in by_id.items():
        if not isinstance(entry, dict):
            continue
        if wp_id not in by_wp_id:
            continue
        info = by_wp_id[wp_id]
        entry["numero_rivista"] = info["numero_rivista"]
        entry["anno_rivista"] = info["anno_rivista"]
        entry["id_numero"] = info["id_numero"]
        aggiornati += 1
    with megacluster_path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return len(by_id), aggiornati


def main() -> None:
    print("=== Recupero categoria n-XXX da XML e aggiornamento bridge + megacluster ===\n")

    post_id_to_n_slugs, post_id_to_slug, slug_to_post_id = parse_xml_posts(XML_PATH)
    n_slug_to_numero = load_n_slug_to_numero()
    print(f"[2] Mappa n-XXX -> numero: {len(n_slug_to_numero)} entrate")

    if not BRIDGE_CSV.exists():
        print(f"[ERROR] Bridge CSV non trovato: {BRIDGE_CSV}")
        return

    rows: List[Dict[str, Any]] = []
    with BRIDGE_CSV.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or []
        for row in reader:
            wp_id = row.get("wp_id")
            if wp_id == "":
                row["wp_id"] = None
            rows.append(row)

    print(f"[3] Bridge CSV letto: {len(rows)} righe")

    rows, count_wp_id_repair, count_numero_xml = repair_bridge_and_md(
        rows, slug_to_post_id, post_id_to_n_slugs, n_slug_to_numero
    )
    print(f"[4] Riparazione bridge: wp_id ripristinati da slug (XML): {count_wp_id_repair}, id_numero da n-XXX (XML): {count_numero_xml}")

    md_modified = repair_md_frontmatter(rows, BASE)
    print(f"[5] Frontmatter .md: aggiunto wp_id in {md_modified} file")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    csv_columns = ["wp_id", "slug", "issue_number", "id_numero", "numero_rivista", "anno_rivista", "tipo_rivista", "cluster_id", "relative_path"]
    with BRIDGE_CSV.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=csv_columns, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    print(f"[6] Bridge CSV scritto: {BRIDGE_CSV}")

    con_numero = sum(1 for r in rows if r.get("id_numero") and r.get("numero_rivista") is not None)
    pct = 100.0 * con_numero / len(rows) if rows else 0
    by_wp_id = {}
    for r in rows:
        wid = r.get("wp_id")
        if wid is None:
            continue
        key = str(wid).strip()
        if r.get("issue_number") or (r.get("id_numero") and r.get("numero_rivista") is not None):
            by_wp_id[key] = {
                "slug": r.get("slug"),
                "issue_number": r.get("issue_number"),
                "id_numero": r.get("id_numero"),
                "numero_rivista": r.get("numero_rivista"),
                "anno_rivista": r.get("anno_rivista"),
                "tipo_rivista": r.get("tipo_rivista"),
            }
    bridge_data = {
        "by_wp_id": by_wp_id,
        "stats": {
            "totale_articoli_md": len(rows),
            "con_numero_rivista": con_numero,
            "percentuale_copertura": round(pct, 1),
        },
    }
    with BRIDGE_JSON.open("w", encoding="utf-8") as f:
        json.dump(bridge_data, f, ensure_ascii=False, indent=2)
    print(f"[7] Bridge JSON scritto: {BRIDGE_JSON}")

    total_mc, aggiornati_mc = update_megacluster_from_bridge(MEGACLUSTER_JSON, rows)
    copertura = 100.0 * aggiornati_mc / total_mc if total_mc else 0
    print(f"[8] Megacluster aggiornato: byId {total_mc}, con numero_rivista: {aggiornati_mc} ({copertura:.1f}%)")

    print("\n--- Riepilogo ---")
    print(f"Articoli bridge totale: {len(rows)}")
    print(f"Con numero rivista (id_numero/numero_rivista): {con_numero} ({pct:.1f}%)")
    print(f"wp_id ripristinati da XML (slug): {count_wp_id_repair}")
    print(f"id_numero recuperati da categoria n-XXX (XML): {count_numero_xml}")
    print(f"File .md con wp_id aggiunto al frontmatter: {md_modified}")
    if pct >= 82:
        print("Obiettivo copertura >82% raggiunto.")
    else:
        print(f"Obiettivo >82%: attuale {pct:.1f}%.")
    print("\n=== Fine ===")


if __name__ == "__main__":
    main()
