#!/usr/bin/env python3
"""
Fix definitivo: categoria n-XXX da XML usando SOLO wp_id.

1. Scansiona l'XML e crea la mappa ID_POST -> CATEGORIA_N (es. 30198 -> n-86).
2. Per ogni articolo in bridge_articoli_numeri.csv che ha wp_id ma NON ha issue_number,
   pesca la categoria nella mappa e assegna il numero (es. n-86 -> OEL-86).
3. Aggiorna frontmatter dei .md, bridge CSV/JSON e articoli_megacluster.json.
   Ignora gli slug; usa solo wp_id.
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

RE_POST_ID = re.compile(r"<wp:post_id>(\d+)</wp:post_id>")
RE_CATEGORY_N = re.compile(r'<category\s+domain="category"\s+nicename="(n-\d+)"')


def build_post_id_to_n_category(xml_path: Path) -> Dict[str, str]:
    """
    Scansiona l'XML e ritorna mappa ID_POST -> CATEGORIA_N (es. "30198" -> "n-86").
    Un solo valore per post: la prima categoria n-XXX trovata nell'item.
    """
    out: Dict[str, str] = {}
    if not xml_path.exists():
        print(f"[ERROR] XML non trovato: {xml_path}")
        return out

    print(f"[1] Scansione XML: {xml_path} ...")
    content = xml_path.read_text(encoding="utf-8", errors="replace")
    for block in re.finditer(r"<item>\s*(.*?)\s*</item>", content, re.DOTALL):
        chunk = block.group(1)
        mid = RE_POST_ID.search(chunk)
        if not mid:
            continue
        post_id = mid.group(1).strip()
        n_cats = RE_CATEGORY_N.findall(chunk)
        n_cats = [c for c in n_cats if re.match(r"n-\d+$", c)]
        if n_cats:
            out[post_id] = n_cats[0]

    print(f"    Mappa ID_POST -> CATEGORIA_N: {len(out)} post con categoria n-XXX")
    return out


def load_n_slug_to_numero() -> Dict[str, Dict[str, Any]]:
    """n-XXX -> { id_numero, numero_progressivo, anno_pubblicazione, tipo_rivista }."""
    with NUMERI_JSON.open("r", encoding="utf-8") as f:
        numeri = json.load(f)
    return {f"n-{n.get('numero_progressivo')}": n for n in numeri if n.get("numero_progressivo") is not None}


def get_numero_for_n_cat(n_cat: str, n_to_numero: Dict[str, Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Ritorna il dict numero per n_cat (es. n-86).
    Se non presente in numeri_wp_FINAL, costruisce un numero sintetico: OEL-XXX, numero_progressivo=XXX, tipo_rivista=ombre_e_luci, anno=None.
    """
    if n_cat in n_to_numero:
        return n_to_numero[n_cat]
    match = re.match(r"n-(\d+)$", n_cat)
    if not match:
        return None
    num = int(match.group(1))
    return {
        "id_numero": f"OEL-{num}",
        "numero_progressivo": num,
        "anno_pubblicazione": None,
        "tipo_rivista": "ombre_e_luci",
    }


def has_issue_number(row: Dict[str, Any]) -> bool:
    """True se la riga ha un issue_number valorizzato (non vuoto)."""
    v = row.get("issue_number")
    return v is not None and str(v).strip() != ""


def assign_numero_from_n(
    rows: List[Dict[str, Any]],
    post_id_to_n: Dict[str, str],
    n_to_numero: Dict[str, Dict[str, Any]],
) -> Tuple[int, List[Dict[str, Any]]]:
    """
    Per ogni riga con wp_id e senza issue_number, assegna id_numero/numero_rivista/anno da mappa n-XXX.
    Ritorna (numero righe aggiornate, lista righe aggiornate per aggiornare .md).
    """
    count = 0
    updated_rows: List[Dict[str, Any]] = []
    for r in rows:
        wp_id = r.get("wp_id")
        if wp_id is None or str(wp_id).strip() == "":
            continue
        if has_issue_number(r):
            continue
        post_id = str(wp_id).strip()
        n_cat = post_id_to_n.get(post_id)
        if not n_cat:
            continue
        numero = get_numero_for_n_cat(n_cat, n_to_numero)
        if not numero:
            continue
        r["issue_number"] = numero.get("id_numero")
        r["id_numero"] = numero.get("id_numero")
        r["numero_rivista"] = numero.get("numero_progressivo")
        r["anno_rivista"] = numero.get("anno_pubblicazione")
        r["tipo_rivista"] = numero.get("tipo_rivista")
        count += 1
        updated_rows.append(r)
    return count, updated_rows


def set_frontmatter_field(fm: str, key: str, value: Any) -> str:
    """Aggiunge o sostituisce una chiave nel frontmatter (una sola occorrenza)."""
    key_lower = key.lower()
    lines = fm.rstrip().split("\n")
    new_lines = []
    inserted = False
    for line in lines:
        stripped = line.strip()
        if stripped.lower().startswith(key_lower + ":"):
            if not inserted:
                indent = line[: len(line) - len(line.lstrip())]
                new_lines.append(f"{indent}{key}: {value}")
                inserted = True
            continue
        new_lines.append(line)
        if not inserted and "slug:" in line and ":" in line:
            indent = line[: len(line) - len(line.lstrip())]
            new_lines.append(f"{indent}{key}: {value}")
            inserted = True
    if not inserted and new_lines:
        indent = "  " if new_lines[-1].startswith(" ") else ""
        new_lines.append(f"{indent}{key}: {value}")
    return "\n".join(new_lines) + "\n"


def update_md_frontmatter(rows: List[Dict[str, Any]], base: Path) -> int:
    """Per ogni riga aggiornata (con issue_number/id_numero) che ha relative_path, scrive issue_number (e id_numero, numero_rivista, anno_rivista) nel .md. Ritorna file modificati."""
    modified = 0
    for r in rows:
        path = r.get("relative_path")
        if not path:
            continue
        issue_number = r.get("issue_number")
        id_numero = r.get("id_numero")
        numero_rivista = r.get("numero_rivista")
        anno_rivista = r.get("anno_rivista")
        if not issue_number and not id_numero:
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
        body = parts[2]
        new_fm = fm
        if issue_number:
            new_fm = set_frontmatter_field(new_fm, "issue_number", issue_number)
        if id_numero is not None:
            new_fm = set_frontmatter_field(new_fm, "id_numero", id_numero)
        if numero_rivista is not None:
            new_fm = set_frontmatter_field(new_fm, "numero_rivista", numero_rivista)
        if anno_rivista is not None:
            new_fm = set_frontmatter_field(new_fm, "anno_rivista", anno_rivista)
        new_content = "---" + new_fm + "---" + body
        if new_content != content:
            md_path.write_text(new_content, encoding="utf-8")
            modified += 1
    return modified


def write_bridge_csv_and_json(rows: List[Dict[str, Any]]) -> None:
    """Riscrive bridge CSV e bridge JSON."""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    csv_columns = ["wp_id", "slug", "issue_number", "id_numero", "numero_rivista", "anno_rivista", "tipo_rivista", "cluster_id", "relative_path"]
    with BRIDGE_CSV.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=csv_columns, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)

    con_numero = sum(1 for r in rows if r.get("id_numero") and r.get("numero_rivista") is not None)
    pct = 100.0 * con_numero / len(rows) if rows else 0
    by_wp_id = {}
    for r in rows:
        wid = r.get("wp_id")
        if wid is None:
            continue
        key = str(wid).strip()
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


def update_megacluster(rows: List[Dict[str, Any]]) -> Tuple[int, int]:
    """Aggiorna articoli_megacluster.json byId con numero_rivista/anno_rivista/id_numero da bridge. Ritorna (totale_byId, aggiornati)."""
    with MEGACLUSTER_JSON.open("r", encoding="utf-8") as f:
        data = json.load(f)
    by_id = data.get("byId") or {}
    by_wp_id = {}
    for r in rows:
        wid = r.get("wp_id")
        if wid is None or str(wid).strip() == "":
            continue
        if r.get("id_numero") is None or r.get("numero_rivista") is None:
            continue
        key = str(wid).strip()
        by_wp_id[key] = {
            "id_numero": r.get("id_numero"),
            "numero_rivista": r.get("numero_rivista"),
            "anno_rivista": r.get("anno_rivista"),
        }
    aggiornati = 0
    for wp_id, entry in by_id.items():
        if not isinstance(entry, dict) or wp_id not in by_wp_id:
            continue
        info = by_wp_id[wp_id]
        entry["numero_rivista"] = info["numero_rivista"]
        entry["anno_rivista"] = info["anno_rivista"]
        entry["id_numero"] = info["id_numero"]
        aggiornati += 1
    with MEGACLUSTER_JSON.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return len(by_id), aggiornati


def main() -> None:
    print("=== Fix n-XXX da XML (solo wp_id) ===\n")

    post_id_to_n = build_post_id_to_n_category(XML_PATH)
    n_to_numero = load_n_slug_to_numero()
    print(f"[2] Mappa n-XXX -> numero: {len(n_to_numero)} entrate")

    if not BRIDGE_CSV.exists():
        print(f"[ERROR] Bridge CSV non trovato: {BRIDGE_CSV}")
        return

    rows: List[Dict[str, Any]] = []
    with BRIDGE_CSV.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if (row.get("wp_id") or "").strip() == "":
                row["wp_id"] = None
            rows.append(row)
    print(f"[3] Bridge CSV letto: {len(rows)} righe")

    orfani_wp_id = sum(1 for r in rows if r.get("wp_id") and not has_issue_number(r))
    print(f"    Articoli con wp_id ma senza issue_number (orfani): {orfani_wp_id}")

    updated, updated_rows = assign_numero_from_n(rows, post_id_to_n, n_to_numero)
    print(f"[4] Assegnati numero da categoria n-XXX (solo wp_id): {updated} righe")

    md_modified = update_md_frontmatter(updated_rows, BASE)
    print(f"[5] Frontmatter .md aggiornati: {md_modified} file")

    write_bridge_csv_and_json(rows)
    print(f"[6] Bridge CSV e JSON scritti")

    total_mc, aggiornati_mc = update_megacluster(rows)
    copertura = 100.0 * aggiornati_mc / total_mc if total_mc else 0
    print(f"[7] Megacluster aggiornato: byId {total_mc}, con numero_rivista: {aggiornati_mc} ({copertura:.1f}%)")

    con_numero = sum(1 for r in rows if r.get("id_numero") and r.get("numero_rivista") is not None)
    pct = 100.0 * con_numero / len(rows) if rows else 0
    print("\n--- Riepilogo ---")
    print(f"Righe bridge con numero assegnato da n-XXX (solo wp_id): {updated}")
    print(f"File .md con frontmatter aggiornato: {md_modified}")
    print(f"Bridge: {con_numero}/{len(rows)} con numero rivista ({pct:.1f}%)")
    print(f"Megacluster: {aggiornati_mc}/{total_mc} con numero rivista ({copertura:.1f}%)")
    print("\n=== Fine ===")


if __name__ == "__main__":
    main()
