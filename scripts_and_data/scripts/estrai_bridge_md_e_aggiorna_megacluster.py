#!/usr/bin/env python3
"""
Estrazione: tutti i .md in src/content/blog/cluster-*
Lettura frontmatter: wp_id (o slug), issue_number
Consolidamento: CSV (Excelone) + JSON ponte definitivo
Aggiornamento megacluster: porta articoli_megacluster.json alla copertura 82,4%
"""

import json
import re
import csv
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

BASE = Path(__file__).resolve().parents[2]
BLOG_DIR = BASE / "src" / "content" / "blog"
NUMERI_JSON = BASE / "scripts_and_data" / "datasets" / "numeri_rivista" / "numeri_wp_FINAL.json"
MEGACLUSTER_JSON = BASE / "src" / "data" / "articoli_megacluster.json"
OUT_DIR = BASE / "scripts_and_data" / "datasets" / "articoli"
BRIDGE_CSV = OUT_DIR / "bridge_articoli_numeri.csv"
BRIDGE_JSON = OUT_DIR / "bridge_articoli_numeri.json"


def extract_frontmatter(content: str) -> Tuple[Optional[str], str]:
    if not content.startswith("---"):
        return None, content
    parts = content.split("---", 2)
    if len(parts) < 3:
        return None, content
    return parts[1], parts[2]


def parse_frontmatter(fm: str) -> Dict[str, Any]:
    data = {}
    for line in fm.split("\n"):
        line = line.strip()
        if ":" in line and not line.startswith("#"):
            key, value = line.split(":", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if value.isdigit():
                value = int(value)
            data[key] = value
    return data


def load_numeri() -> Dict[str, Dict[str, Any]]:
    """id_numero (OEL-1, INS-10) -> { numero_progressivo, anno_pubblicazione, ... }"""
    with NUMERI_JSON.open("r", encoding="utf-8") as f:
        numeri = json.load(f)
    return {n["id_numero"]: n for n in numeri}


def main() -> None:
    print("=== Estrazione bridge da Markdown e aggiornamento megacluster ===\n")

    # 1) Estrazione: cicla .md in cluster-*
    rows: List[Dict[str, Any]] = []
    blog_path = BLOG_DIR
    if not blog_path.exists():
        print(f"[ERROR] {blog_path} non trovato")
        return

    for cluster_dir in sorted(blog_path.iterdir()):
        if not cluster_dir.is_dir() or not cluster_dir.name.startswith("cluster-"):
            continue
        for md_file in cluster_dir.glob("*.md"):
            try:
                content = md_file.read_text(encoding="utf-8")
            except Exception as e:
                print(f"[WARN] {md_file}: {e}")
                continue
            fm_str, _ = extract_frontmatter(content)
            if not fm_str:
                continue
            data = parse_frontmatter(fm_str)
            wp_id = data.get("wp_id")
            slug = data.get("slug", "")
            issue_number = data.get("issue_number")
            cluster_id = data.get("cluster_id")
            relative_path = str(md_file.relative_to(BASE))
            rows.append({
                "wp_id": wp_id,
                "slug": slug,
                "issue_number": issue_number,
                "cluster_id": cluster_id,
                "relative_path": relative_path,
            })

    print(f"[1] Estratti {len(rows)} record da .md (cluster-*)")

    # Carica numeri per arricchire con numero_rivista / anno_rivista
    numeri_by_id = load_numeri()
    con_issue = 0
    for r in rows:
        inum = r.get("issue_number")
        if inum and inum in numeri_by_id:
            n = numeri_by_id[inum]
            r["id_numero"] = inum
            r["numero_rivista"] = n.get("numero_progressivo")
            r["anno_rivista"] = n.get("anno_pubblicazione")
            r["tipo_rivista"] = n.get("tipo_rivista")
            con_issue += 1
        else:
            r["id_numero"] = None
            r["numero_rivista"] = None
            r["anno_rivista"] = None
            r["tipo_rivista"] = None

    print(f"[2] Con issue_number valido (in numeri_wp_FINAL): {con_issue} ({100*con_issue/len(rows):.1f}%)")

    # 2) Consolidamento: CSV (Excelone)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    csv_columns = ["wp_id", "slug", "issue_number", "id_numero", "numero_rivista", "anno_rivista", "tipo_rivista", "cluster_id", "relative_path"]
    with BRIDGE_CSV.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=csv_columns, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    print(f"[3] CSV scritto: {BRIDGE_CSV}")

    # 3) JSON ponte: by_wp_id per lookup megacluster
    by_wp_id: Dict[str, Dict[str, Any]] = {}
    for r in rows:
        wid = r.get("wp_id")
        if wid is None:
            continue
        key = str(wid)
        if r.get("issue_number") and r.get("numero_rivista") is not None:
            by_wp_id[key] = {
                "slug": r.get("slug"),
                "issue_number": r.get("issue_number"),
                "id_numero": r.get("id_numero"),
                "numero_rivista": r.get("numero_rivista"),
                "anno_rivista": r.get("anno_rivista"),
                "tipo_rivista": r.get("tipo_rivista"),
            }

    bridge = {
        "by_wp_id": by_wp_id,
        "stats": {
            "totale_articoli_md": len(rows),
            "con_issue_number": con_issue,
            "percentuale_copertura": round(100.0 * con_issue / len(rows), 1) if rows else 0,
        },
    }
    with BRIDGE_JSON.open("w", encoding="utf-8") as f:
        json.dump(bridge, f, ensure_ascii=False, indent=2)
    print(f"[4] JSON ponte scritto: {BRIDGE_JSON}")

    # 4) Aggiornamento megacluster
    with MEGACLUSTER_JSON.open("r", encoding="utf-8") as f:
        megacluster = json.load(f)
    by_id = megacluster.get("byId") or {}
    total_mc = len(by_id)
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

    with MEGACLUSTER_JSON.open("w", encoding="utf-8") as f:
        json.dump(megacluster, f, ensure_ascii=False, indent=2)

    copertura = 100.0 * aggiornati / total_mc if total_mc else 0
    print(f"[5] Megacluster aggiornato: {MEGACLUSTER_JSON}")
    print(f"    byId totale: {total_mc}, aggiornati con numero_rivista/anno_rivista: {aggiornati} ({copertura:.1f}%)")
    print("\n=== Fine ===")


if __name__ == "__main__":
    main()
