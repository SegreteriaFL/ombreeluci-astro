#!/usr/bin/env python3
"""
Controllo incrociato tra:
1. numeri_consolidati.json (197 numeri)
2. database_unificato.json o bridge_articoli_numeri (articolo -> numero)
3. Cartella extra-web + tutti i .md in blog

Trova dove sono finiti gli articoli dei numeri mancanti (es. OEL-42).
Se sono in extra-web o in cartella con ID diverso, li sposta nella cartella OEL-XXX corretta
e aggiorna frontmatter (issue_number, id_numero).
Obiettivo: 197 numeri popolati.
"""

import json
import re
import shutil
from pathlib import Path
from collections import defaultdict

BASE = Path(__file__).resolve().parents[2]
BLOG_ROOT = BASE / "src" / "content" / "blog"
NUMERI_JSON = BASE / "src" / "data" / "numeri_consolidati.json"
UNIFICATO_JSON = BASE / "scripts_and_data" / "datasets" / "articoli" / "database_unificato.json"
BRIDGE_JSON = BASE / "scripts_and_data" / "datasets" / "articoli" / "bridge_articoli_numeri.json"
REPORT_PATH = BASE / "scripts_and_data" / "report_crosscheck_articoli_numeri.md"


def extract_frontmatter(path: Path) -> dict:
    text = path.read_text(encoding="utf-8", errors="replace")
    fm = {}
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)", text, re.DOTALL)
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                fm[k.strip().lower()] = v.strip().strip('"').strip("'")
    return fm


def scan_all_md() -> dict:
    """Scansiona tutti i .md in blog (OEL-*, INS-*, extra-web). Ritorna wp_id -> (path, folder, slug)."""
    wp_to_location = {}
    for folder in BLOG_ROOT.iterdir():
        if not folder.is_dir():
            continue
        name = folder.name
        for md in folder.glob("*.md"):
            fm = extract_frontmatter(md)
            wp_id = fm.get("wp_id")
            if wp_id:
                try:
                    wp_to_location[str(wp_id).strip()] = {
                        "path": md,
                        "folder": name,
                        "slug": md.stem,
                    }
                except Exception:
                    pass
    return wp_to_location


def main() -> None:
    # 1. Numeri attesi (197)
    numeri_data = json.loads(NUMERI_JSON.read_text(encoding="utf-8"))
    id_numeri = {n["id_numero"] for n in numeri_data}
    print(f"[1] numeri_consolidati.json: {len(numeri_data)} numeri")

    # 2. Database unificato: numero_id -> [wp_id]
    if not UNIFICATO_JSON.exists():
        print(f"[ERROR] {UNIFICATO_JSON} non trovato")
        return
    unificato = json.loads(UNIFICATO_JSON.read_text(encoding="utf-8"))
    numero_to_wpids = defaultdict(list)
    for art in unificato:
        nid = art.get("numero_id")
        wp_id = art.get("id")
        if nid and wp_id is not None:
            numero_to_wpids[nid].append(str(wp_id))
    print(f"[2] database_unificato: {len(unificato)} articoli, {len(numero_to_wpids)} numeri con articoli")

    # 3. Dove sono ora i file .md (wp_id -> path, folder)
    wp_to_location = scan_all_md()
    print(f"[3] File .md con wp_id in frontmatter: {len(wp_to_location)}")

    # Conteggio articoli per cartella (folder)
    count_by_folder = defaultdict(int)
    for loc in wp_to_location.values():
        count_by_folder[loc["folder"]] += 1

    # Numeri vuoti (nessun articolo nella loro cartella)
    numeri_vuoti = [n["id_numero"] for n in numeri_data if count_by_folder.get(n["id_numero"], 0) == 0]
    print(f"[4] Numeri attualmente vuoti (0 articoli in cartella): {len(numeri_vuoti)}")

    # Per OGNI numero (197): sposta gli articoli che il unificato assegna a questo numero
    # ma che si trovano in extra-web o in un'altra cartella
    report_lines = [
        "# Cross-check articoli / numeri – report",
        "",
        "## Numeri vuoti prima degli spostamenti",
        "",
    ]
    report_lines.append(f"{len(numeri_vuoti)} numeri senza articoli: " + ", ".join(sorted(numeri_vuoti)))
    report_lines.append("")
    report_lines.append("## Spostamenti eseguiti (file in extra-web o cartella sbagliata → cartella corretta)")
    report_lines.append("")

    moved = 0
    created_folders = set()

    for numero in sorted(id_numeri):
        wp_ids = numero_to_wpids.get(numero, [])
        if not wp_ids:
            continue
        target_dir = BLOG_ROOT / numero
        if not target_dir.exists():
            target_dir.mkdir(parents=True)
            created_folders.add(numero)

        for wp_id in wp_ids:
            loc = wp_to_location.get(wp_id)
            if not loc:
                continue
            path = loc["path"]
            folder = loc["folder"]
            slug = loc["slug"]
            if folder == numero:
                continue  # già al posto giusto
            # Sposta: da path -> target_dir / {slug}.md
            dest = target_dir / f"{slug}.md"
            if dest.exists():
                report_lines.append(f"- **{numero}** wp_id={wp_id} slug={slug}: destinazione già esiste, skip")
                continue
            try:
                content = path.read_text(encoding="utf-8", errors="replace")
                # Aggiungi/aggiorna issue_number e id_numero nel frontmatter
                m = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)", content, re.DOTALL)
                if m:
                    fm_block, rest = m.group(1), m.group(2)
                    lines = [l for l in fm_block.splitlines() if not re.match(r"^(issue_number|id_numero)\s*:", l, re.I)]
                    lines.append(f"issue_number: {numero}")
                    lines.append(f"id_numero: {numero}")
                    content = "---\n" + "\n".join(lines) + "\n---\n" + rest
                shutil.copy2(path, dest)
                dest.write_text(content, encoding="utf-8")
                path.unlink()  # rimuovi originale
                report_lines.append(f"- **{numero}** wp_id={wp_id} `{slug}`: spostato da `{folder}/` → `{numero}/`")
                moved += 1
            except Exception as e:
                report_lines.append(f"- **{numero}** wp_id={wp_id} `{slug}`: ERRORE {e}")

    report_lines.append("")
    report_lines.append(f"**Totale spostamenti eseguiti:** {moved}")
    report_lines.append(f"**Cartelle create (se mancavano):** {len(created_folders)}")
    report_lines.append("")

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text("\n".join(report_lines), encoding="utf-8")
    print(f"\nReport: {REPORT_PATH}")
    print(f"Spostati: {moved} file")
    print(f"Cartelle create: {created_folders}")


if __name__ == "__main__":
    main()
