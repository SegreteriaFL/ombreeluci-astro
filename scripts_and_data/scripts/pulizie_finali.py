#!/usr/bin/env python3
"""
Pulizie finali:
1. Lang: lang: en nei 163 file del report, lang: it negli altri.
2. Riorganizza: sposta .md in cartelle id_numero (es. OEL-103/) o extra-web/ se senza numero.
3. Crea numeri_consolidati.json con numeri sintetici (OEL-86, ecc.).
4. Elimina cartelle cluster-* vuote.
"""

import csv
import json
import re
import shutil
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple

BASE = Path(__file__).resolve().parents[2]
BLOG_ROOT = BASE / "src" / "content" / "blog"
REPORT_INGLESE = BASE / "scripts_and_data" / "report_articoli_inglese.md"
BRIDGE_CSV = BASE / "scripts_and_data" / "datasets" / "articoli" / "bridge_articoli_numeri.csv"
BRIDGE_JSON = BASE / "scripts_and_data" / "datasets" / "articoli" / "bridge_articoli_numeri.json"
NUMERI_WP = BASE / "scripts_and_data" / "datasets" / "numeri_rivista" / "numeri_wp_FINAL.json"
NUMERI_CONSOLIDATI = BASE / "src" / "data" / "numeri_consolidati.json"


def norm(p: str) -> str:
    return p.replace("\\", "/").strip()


def extract_english_paths(report_path: Path) -> Set[str]:
    text = report_path.read_text(encoding="utf-8")
    pattern = r" — `(src/content/blog/[^`]+\.md)`"
    return {norm(m) for m in re.findall(pattern, text)}


def set_lang_in_frontmatter(fm: str, lang: str) -> str:
    lines = fm.rstrip().split("\n")
    new_lines = []
    inserted = False
    for line in lines:
        s = line.strip()
        if s.lower().startswith("lang:"):
            if not inserted:
                indent = line[: len(line) - len(line.lstrip())]
                new_lines.append(f"{indent}lang: {lang}")
                inserted = True
            continue
        new_lines.append(line)
        if not inserted and "slug:" in line and ":" in line:
            indent = line[: len(line) - len(line.lstrip())]
            new_lines.append(f"{indent}lang: {lang}")
            inserted = True
    if not inserted and new_lines:
        indent = "  " if new_lines[-1].startswith(" ") else ""
        new_lines.append(f"{indent}lang: {lang}")
    return "\n".join(new_lines) + "\n"


def step1_lang(blog_root: Path, english_paths: Set[str]) -> Tuple[int, int]:
    """Imposta lang: en / lang: it. Ritorna (count_en, count_it)."""
    count_en = count_it = 0
    for md_path in blog_root.rglob("*.md"):
        rel = norm(str(md_path.relative_to(BASE)))
        is_en = rel in english_paths
        lang = "en" if is_en else "it"
        if is_en:
            count_en += 1
        else:
            count_it += 1
        try:
            content = md_path.read_text(encoding="utf-8")
        except Exception:
            continue
        if not content.startswith("---"):
            continue
        parts = content.split("---", 2)
        if len(parts) < 3:
            continue
        fm, body = parts[1], parts[2]
        new_fm = set_lang_in_frontmatter(fm, lang)
        new_content = "---" + new_fm + "---" + body
        if new_content != content:
            md_path.write_text(new_content, encoding="utf-8")
    return count_en, count_it


def step2_reorganize(blog_root: Path, bridge_csv: Path) -> List[Dict[str, Any]]:
    """
    Sposta ogni .md in blog_root/ID_NUMERO/slug.md o blog_root/extra-web/slug.md.
    Aggiorna relative_path nelle righe. Ritorna righe aggiornate (per riscrivere CSV).
    """
    rows: List[Dict[str, Any]] = []
    with bridge_csv.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)

    # Unicità: (folder, slug) -> contatore per evitare sovrascritture
    used: Dict[Tuple[str, str], int] = {}

    def target_path(row: Dict[str, Any]) -> Tuple[Path, str]:
        folder = (row.get("id_numero") or "").strip()
        if not folder:
            folder = "extra-web"
        slug = (row.get("slug") or "").strip() or "article"
        key = (folder, slug)
        n = used.get(key, 0)
        used[key] = n + 1
        if n == 0:
            fname = f"{slug}.md"
        else:
            fname = f"{slug}-{n + 1}.md"
        return blog_root / folder / fname, fname

    moved = 0
    for r in rows:
        old_rel = (r.get("relative_path") or "").replace("\\", "/")
        if not old_rel:
            continue
        src = BASE / old_rel
        if not src.exists():
            continue
        dest_path, fname = target_path(r)
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        if src.resolve() != dest_path.resolve():
            shutil.move(str(src), str(dest_path))
            moved += 1
        new_rel = norm(str(dest_path.relative_to(BASE)))
        r["relative_path"] = new_rel

    print(f"    File spostati: {moved}")
    return rows


def step3_numeri_consolidati(
    numeri_wp_path: Path,
    bridge_rows: List[Dict[str, Any]],
    out_path: Path,
) -> None:
    """Crea numeri_consolidati.json = numeri_wp_FINAL + numeri sintetici (id_numero presenti nel bridge ma non in numeri_wp)."""
    with numeri_wp_path.open("r", encoding="utf-8") as f:
        numeri = json.load(f)
    by_id = {n["id_numero"]: n for n in numeri}

    added_synthetic: Set[str] = set()
    for r in bridge_rows:
        i = (r.get("id_numero") or "").strip()
        if not i or i in by_id or i in added_synthetic:
            continue
        added_synthetic.add(i)
        match = re.match(r"(OEL|INS)-(\d+)$", i)
        if match:
            pref, num = match.group(1), int(match.group(2))
            tipo = "ombre_e_luci" if pref == "OEL" else "insieme"
            numeri.append({
                "id_numero": i,
                "tipo_rivista": tipo,
                "numero_progressivo": num,
                "display_title": f"Ombre e Luci n. {num}" if pref == "OEL" else f"Insieme n. {num}",
                "titolo_numero": f"n. {num}",
                "anno_pubblicazione": None,
                "articoli_urls": [],
                "articoli_ids": [],
            })

    numeri.sort(key=lambda n: (n.get("tipo_rivista", ""), n.get("numero_progressivo", 0)))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(numeri, f, ensure_ascii=False, indent=2)
    print(f"    Scritto: {out_path} ({len(numeri)} numeri)")


def step4_remove_empty_clusters(blog_root: Path) -> int:
    """Rimuove cartelle cluster-* e cluster--1 vuote. Ritorna quante rimosse."""
    removed = 0
    for d in sorted(blog_root.iterdir()):
        if not d.is_dir():
            continue
        if d.name.startswith("cluster-") and not any(d.iterdir()):
            d.rmdir()
            removed += 1
    return removed


def main() -> None:
    print("=== Pulizie finali ===\n")

    # 1. Lang
    print("[1] Aggiornamento lingua (lang: en / lang: it)...")
    if not REPORT_INGLESE.exists():
        print(f"    [WARN] Report inglese non trovato: {REPORT_INGLESE}")
        english_paths = set()
    else:
        english_paths = extract_english_paths(REPORT_INGLESE)
        print(f"    Articoli in inglese (report): {len(english_paths)}")
    count_en, count_it = step1_lang(BLOG_ROOT, english_paths)
    print(f"    lang: en -> {count_en}, lang: it -> {count_it}")

    # 2. Riorganizza cartelle
    print("\n[2] Riorganizzazione cartelle (id_numero/ o extra-web/)...")
    rows = step2_reorganize(BLOG_ROOT, BRIDGE_CSV)
    BRIDGE_CSV.parent.mkdir(parents=True, exist_ok=True)
    cols = ["wp_id", "slug", "issue_number", "id_numero", "numero_rivista", "anno_rivista", "tipo_rivista", "cluster_id", "relative_path"]
    with BRIDGE_CSV.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    con_numero = sum(1 for r in rows if (r.get("id_numero") or "").strip())
    by_wp_id = {}
    for r in rows:
        wid = r.get("wp_id")
        if wid is not None and str(wid).strip():
            by_wp_id[str(wid).strip()] = {k: r.get(k) for k in ["slug", "issue_number", "id_numero", "numero_rivista", "anno_rivista", "tipo_rivista"]}
    with BRIDGE_JSON.open("w", encoding="utf-8") as f:
        json.dump({"by_wp_id": by_wp_id, "stats": {"totale": len(rows), "con_numero": con_numero}}, f, ensure_ascii=False, indent=2)
    print(f"    Bridge CSV/JSON aggiornati con i nuovi path")

    # 3. Numeri consolidati
    print("\n[3] Creazione numeri_consolidati.json...")
    step3_numeri_consolidati(NUMERI_WP, rows, NUMERI_CONSOLIDATI)

    # 4. Pulizia cartelle vuote
    print("\n[4] Rimozione cartelle cluster-* vuote...")
    removed = step4_remove_empty_clusters(BLOG_ROOT)
    print(f"    Cartelle rimosse: {removed}")

    print("\n=== Fine pulizie ===")


if __name__ == "__main__":
    main()
