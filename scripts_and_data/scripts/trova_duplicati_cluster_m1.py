#!/usr/bin/env python3
"""
Usa bridge_articoli_numeri.csv per identificare duplicati.
- Stesso slug in cluster--1 e in un cluster numerato (cluster-0, cluster-1, ...) → segnala: eliminare quello in cluster--1.
- Opzionale: slug molto simili (possibili typo) tra cluster--1 e cluster numerato.
"""

import csv
from pathlib import Path
from collections import defaultdict

BASE = Path(__file__).resolve().parents[2]
BRIDGE_CSV = BASE / "scripts_and_data" / "datasets" / "articoli" / "bridge_articoli_numeri.csv"
REPORT_MD = BASE / "scripts_and_data" / "report_duplicati_cluster_m1.md"


def is_cluster_minus_one(relative_path: str) -> bool:
    return "cluster--1" in relative_path.replace("\\", "/")


def is_numbered_cluster(relative_path: str) -> bool:
    # cluster-0, cluster-1, ... (no cluster--1)
    p = relative_path.replace("\\", "/")
    if "cluster--1" in p:
        return False
    return "/cluster-" in p


def main() -> None:
    if not BRIDGE_CSV.exists():
        print(f"[ERROR] {BRIDGE_CSV} non trovato")
        return

    rows_by_slug: dict[str, list[dict]] = defaultdict(list)
    with BRIDGE_CSV.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            slug = (row.get("slug") or "").strip()
            if not slug:
                continue
            rel = row.get("relative_path") or ""
            row["_path"] = rel
            row["_in_m1"] = is_cluster_minus_one(rel)
            row["_in_numbered"] = is_numbered_cluster(rel)
            rows_by_slug[slug].append(row)

    # Duplicati esatti: stesso slug sia in cluster--1 sia in un cluster numerato
    duplicati_esatti: list[tuple[str, list[dict], list[dict]]] = []
    solo_m1: list[dict] = []
    for slug, group in rows_by_slug.items():
        in_m1 = [r for r in group if r["_in_m1"]]
        in_num = [r for r in group if r["_in_numbered"]]
        if in_m1 and in_num:
            duplicati_esatti.append((slug, in_m1, in_num))
        elif in_m1:
            solo_m1.extend(in_m1)

    # Possibili duplicati: slug in cluster--1 molto simile a uno in cluster numerato (es. caffe vs caff, gesu vs ges)
    slugs_m1 = {r.get("slug", "").strip() for group in rows_by_slug.values() for r in group if r["_in_m1"]}
    slugs_num = set()
    for group in rows_by_slug.values():
        for r in group:
            if r["_in_numbered"]:
                slugs_num.add(r.get("slug", "").strip())

    possibili: list[tuple[str, str, dict, dict]] = []
    for sm1 in slugs_m1:
        for snum in slugs_num:
            if sm1 == snum:
                continue
            # Una è sottostringa dell'altra o differiscono per 1-2 caratteri
            if len(sm1) < 10 or len(snum) < 10:
                continue
            # Differenza minima (es. gesu vs ges, caffe vs caff)
            if sm1 in snum or snum in sm1:
                possibili.append((sm1, snum, None, None))  # fill path below
            else:
                # distanza di Levenshtein semplificata: stessa lunghezza, pochi char diversi
                if abs(len(sm1) - len(snum)) <= 2:
                    diff = sum(1 for a, b in zip(sm1, snum) if a != b) + abs(len(sm1) - len(snum))
                    if diff <= 3:
                        possibili.append((sm1, snum, None, None))

    # Recupera path per possibili
    possibili_con_path: list[tuple[str, str, str, str]] = []
    for sm1, snum, _, __ in possibili:
        r_m1 = next((r for r in rows_by_slug.get(sm1, []) if r["_in_m1"]), None)
        r_num = next((r for r in rows_by_slug.get(snum, []) if r["_in_numbered"]), None)
        if r_m1 and r_num:
            possibili_con_path.append((sm1, snum, r_m1["_path"], r_num["_path"]))

    # Scrivi report
    lines = [
        "# Report duplicati cluster--1 vs cluster numerati",
        "",
        "Fonte: `bridge_articoli_numeri.csv`",
        "",
        "## 1. Duplicati esatti (stesso slug in cluster--1 e in un cluster numerato)",
        "",
        "**Azione suggerita:** eliminare il file in `cluster--1` (tenere la versione nel cluster numerato).",
        "",
    ]
    if duplicati_esatti:
        for slug, in_m1, in_num in duplicati_esatti:
            lines.append(f"### Slug: `{slug}`")
            lines.append("")
            lines.append("- **In cluster--1 (da eliminare):**")
            for r in in_m1:
                lines.append(f"  - `{r['_path']}`")
            lines.append("- **In cluster numerato (tenere):**")
            for r in in_num:
                lines.append(f"  - `{r['_path']}`")
            lines.append("")
    else:
        lines.append("Nessun duplicato esatto trovato (stesso slug in entrambi).")
        lines.append("")

    lines.append("## 2. Possibili duplicati (slug molto simile)")
    lines.append("")
    lines.append("Slug in cluster--1 simile a uno in un cluster numerato (controllo manuale).")
    lines.append("")
    if possibili_con_path:
        for sm1, snum, path_m1, path_num in possibili_con_path:
            lines.append(f"- **cluster--1:** `{sm1}` → `{path_m1}`")
            lines.append(f"  **cluster numerato:** `{snum}` → `{path_num}`")
            lines.append("")
    else:
        lines.append("Nessuno trovato.")
        lines.append("")

    lines.append("## 3. Solo in cluster--1 (nessun duplicato trovato)")
    lines.append("")
    for r in solo_m1:
        lines.append(f"- `{r['_path']}` (slug: `{r.get('slug','')}`)")
    lines.append("")
    lines.append("---")
    lines.append(f"Totale in cluster--1: {len(solo_m1) + sum(len(m1) for _, m1, _ in duplicati_esatti)}")
    lines.append(f"Duplicati esatti (da eliminare in cluster--1): {sum(len(m1) for _, m1, _ in duplicati_esatti)}")
    lines.append(f"Possibili duplicati (slug simile): {len(possibili_con_path)}")

    REPORT_MD.parent.mkdir(parents=True, exist_ok=True)
    REPORT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(f"Report scritto: {REPORT_MD}")
    print(f"  Duplicati esatti (stesso slug in cluster--1 e numerato): {len(duplicati_esatti)}")
    print(f"  Possibili duplicati (slug simile): {len(possibili_con_path)}")
    print(f"  Solo in cluster--1: {len(solo_m1)}")


if __name__ == "__main__":
    main()
