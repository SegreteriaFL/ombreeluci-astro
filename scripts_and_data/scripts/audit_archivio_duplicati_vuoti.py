#!/usr/bin/env python3
"""
Audit chirurgico Archivio:
1. Duplicati: scan cartelle src/content/blog/OEL-XXX e INS-XXX, duplicati per title (frontmatter) o contenuto.
2. Vuoti: numeri in numeri_consolidati.json con zero articoli nella cartella.
3. Orfani: extra-web, riferimenti per ricollocare in numeri vuoti.
4. Incrocio: totale articoli (4167) vs distribuzione effettiva.
"""

import json
import re
from pathlib import Path
from collections import defaultdict

BASE = Path(__file__).resolve().parents[2]
BLOG_ROOT = BASE / "src" / "content" / "blog"
NUMERI_JSON = BASE / "src" / "data" / "numeri_consolidati.json"
REPORT_PATH = BASE / "scripts_and_data" / "report_audit_archivio.md"


def normalize_title(s: str) -> str:
    if not s:
        return ""
    s = s.strip().lower()
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"[^\w\s]", "", s)
    return s


def extract_frontmatter(path: Path) -> tuple[dict, str]:
    """Legge file .md, restituisce (dict dei campi YAML, body senza frontmatter)."""
    text = path.read_text(encoding="utf-8", errors="replace")
    body = ""
    fm = {}
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)", text, re.DOTALL)
    if m:
        fm_text, body = m.group(1), m.group(2)
        for line in fm_text.splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                fm[k.strip().lower()] = v.strip().strip('"').strip("'")
    return fm, body


def hash_body(body: str, max_chars: int = 500) -> str:
    """Hash semplificato del corpo (primi max_chars, normalizzato)."""
    t = re.sub(r"\s+", " ", body.strip())[:max_chars]
    return str(len(t)) + "_" + t[:80].replace(" ", "_")


def scan_blog_folders() -> tuple[list[dict], set[str], int]:
    """
    Scansiona BLOG_ROOT: sottocartelle OEL-* e INS-* (non extra-web).
    Per ogni .md: numero, slug_file, title, content_hash.
    Ritorna: lista articoli, set id_numero con cartella presente, totale .md.
    """
    articles = []
    numeri_with_folder = set()
    total = 0

    for folder in sorted(BLOG_ROOT.iterdir()):
        if not folder.is_dir():
            continue
        name = folder.name
        if name == "extra-web":
            continue
        if not (name.startswith("OEL-") or name.startswith("INS-")):
            continue
        numeri_with_folder.add(name)
        for md in folder.glob("*.md"):
            total += 1
            fm, body = extract_frontmatter(md)
            title = fm.get("title", "").strip() or md.stem
            slug_file = md.stem
            content_hash = hash_body(body)
            articles.append({
                "numero": name,
                "path": str(md.relative_to(BASE)),
                "slug": slug_file,
                "title": title,
                "title_norm": normalize_title(title),
                "content_hash": content_hash,
                "wp_id": fm.get("wp_id"),
            })
    return articles, numeri_with_folder, total


def main() -> None:
    # --- Carica numeri ---
    if not NUMERI_JSON.exists():
        print(f"[ERROR] {NUMERI_JSON} non trovato")
        return
    numeri_data = json.loads(NUMERI_JSON.read_text(encoding="utf-8"))
    id_numeri_in_json = {n["id_numero"] for n in numeri_data}

    # --- Scan articoli ---
    articles, numeri_with_folder, total_md = scan_blog_folders()

    # --- 1. DUPLICATI ---
    # (a) Stesso numero + stesso title normalizzato
    by_numero_title: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for a in articles:
        key = (a["numero"], a["title_norm"])
        if a["title_norm"]:
            by_numero_title[key].append(a)

    duplicati_stesso_numero = [
        (key, group) for key, group in by_numero_title.items() if len(group) > 1
    ]

    # (b) Stesso title normalizzato in numeri diversi (cross-folder)
    by_title_only: dict[str, list[dict]] = defaultdict(list)
    for a in articles:
        if a["title_norm"]:
            by_title_only[a["title_norm"]].append(a)

    duplicati_cross = [
        (title_norm, group)
        for title_norm, group in by_title_only.items()
        if len(group) > 1 and len({g["numero"] for g in group}) > 1
    ]

    # (c) Stesso content_hash (stesso corpo) in stesso numero
    by_numero_hash: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for a in articles:
        by_numero_hash[(a["numero"], a["content_hash"])].append(a)

    duplicati_stesso_contenuto = [
        (key, group)
        for key, group in by_numero_hash.items()
        if len(group) > 1
    ]

    # --- 2. VUOTI ---
    # Numeri in JSON che non hanno cartella o cartella vuota
    count_by_numero = defaultdict(int)
    for a in articles:
        count_by_numero[a["numero"]] += 1

    vuoti = []
    for n in numeri_data:
        id_n = n["id_numero"]
        count = count_by_numero.get(id_n, 0)
        has_folder = id_n in numeri_with_folder
        if count == 0:
            vuoti.append({
                "id_numero": id_n,
                "display_title": n.get("display_title", ""),
                "anno": n.get("anno_pubblicazione"),
                "has_folder": has_folder,
            })

    # --- 3. EXTRA-WEB / ORFANI ---
    extra_path = BLOG_ROOT / "extra-web"
    orfani_info = []
    if extra_path.exists():
        for md in sorted(extra_path.glob("*.md")):
            fm, body = extract_frontmatter(md)
            issue = fm.get("issue_number") or fm.get("id_numero") or ""
            refs_in_body = re.findall(r"(OEL-\d+|INS-\d+)", body)
            refs_unique = list(dict.fromkeys(refs_in_body))
            # Suggerimenti da titolo/slug: "dialogo aperto n. 68", "n-68", "numero 86"
            title_raw = fm.get("title", "") or ""
            slug_raw = md.stem
            hint_n = re.findall(r"(?:n\.?\s*|numero\s*)(\d{2,3})", title_raw, re.I)
            hint_slug = re.findall(r"n-?(\d{2,3})\b", slug_raw)
            suggested = list(dict.fromkeys(hint_n + hint_slug))
            orfani_info.append({
                "slug": md.stem,
                "title": fm.get("title", md.stem),
                "issue_in_fm": issue,
                "refs_in_body": refs_unique,
                "suggested_numero": suggested,
            })

    # --- 4. INCROCIO TOTALE ---
    total_in_folders = total_md
    extra_count = len(list((BLOG_ROOT / "extra-web").glob("*.md"))) if (BLOG_ROOT / "extra-web").exists() else 0
    total_globale = total_in_folders + extra_count
    atteso = 4167
    discrepanza = total_globale - atteso

    # --- REPORT MD ---
    lines = [
        "# Audit Archivio – Duplicati, Vuoti, Orfani, Incrocio",
        "",
        "## 1. Duplicati",
        "",
        "### 1.1 Stesso numero, stesso titolo (frontmatter)",
        "",
    ]
    if duplicati_stesso_numero:
        for (numero, title_norm), group in sorted(duplicati_stesso_numero, key=lambda x: (x[0][0], -len(x[1]))):
            lines.append(f"- **{numero}** – titolo norm: `{title_norm[:60]}...` – {len(group)} file:")
            for a in group:
                lines.append(f"  - `{a['path']}` (slug: {a['slug']})")
            lines.append("")
    else:
        lines.append("Nessun duplicato stesso numero/stesso titolo.")
        lines.append("")

    lines.extend([
        "### 1.2 Stesso titolo in numeri diversi (cross-folder)",
        "",
    ])
    if duplicati_cross:
        for title_norm, group in sorted(duplicati_cross, key=lambda x: -len(x[1]))[:50]:
            numeri = {g["numero"] for g in group}
            lines.append(f"- Titolo norm: `{title_norm[:55]}...` – {len(group)} articoli in: {', '.join(sorted(numeri))}")
            for a in group[:5]:
                lines.append(f"  - `{a['path']}`")
            if len(group) > 5:
                lines.append(f"  - ... e altri {len(group) - 5}")
            lines.append("")
        if len(duplicati_cross) > 50:
            lines.append(f"*(… altri {len(duplicati_cross) - 50} gruppi di duplicati cross-folder)*")
            lines.append("")
    else:
        lines.append("Nessun duplicato cross-folder per titolo.")
        lines.append("")

    lines.extend([
        "### 1.3 Stesso numero, stesso contenuto (hash corpo)",
        "",
    ])
    if duplicati_stesso_contenuto:
        for (numero, _), group in duplicati_stesso_contenuto[:30]:
            lines.append(f"- **{numero}** – {len(group)} file stesso corpo:")
            for a in group:
                lines.append(f"  - `{a['path']}`")
            lines.append("")
        if len(duplicati_stesso_contenuto) > 30:
            lines.append(f"*(… altri {len(duplicati_stesso_contenuto) - 30} gruppi)*")
            lines.append("")
    else:
        lines.append("Nessun duplicato per hash contenuto.")
        lines.append("")

    lines.extend([
        "---",
        "## 2. Numeri vuoti (zero articoli in cartella)",
        "",
        f"Numeri in `numeri_consolidati.json`: {len(id_numeri_in_json)}",
        f"Cartelle presenti in `blog/`: {len(numeri_with_folder)}",
        "",
    ])
    for v in sorted(vuoti, key=lambda x: (x["anno"] or 0, x["id_numero"])):
        folder_status = "cartella presente ma vuota" if v["has_folder"] else "nessuna cartella"
        lines.append(f"- **{v['id_numero']}** – {v.get('anno', '?')} – {v.get('display_title', '')[:50]} – ({folder_status})")
    lines.append("")
    lines.append(f"**Totale numeri vuoti:** {len(vuoti)}")
    lines.append("")

    lines.extend([
        "---",
        "## 3. Orfani (extra-web) – riferimenti per ricollocazione",
        "",
    ])
    for o in orfani_info:
        refs = o["refs_in_body"]
        fm_ref = o["issue_in_fm"]
        suggested = o.get("suggested_numero", [])
        if fm_ref or refs or suggested:
            line = f"- **{o['slug']}** – title: {o['title'][:45]}"
            if fm_ref:
                line += f" – frontmatter: `issue_number/id_numero`: {fm_ref}"
            if refs:
                line += f" – nel testo: {refs}"
            if suggested:
                line += f" – da titolo/slug (n. XX): possibili numeri {suggested}"
            lines.append(line)
    with_refs = sum(1 for o in orfani_info if o["issue_in_fm"] or o["refs_in_body"] or o.get("suggested_numero"))
    lines.append("")
    lines.append(f"Articoli in extra-web: {len(orfani_info)} (di cui con riferimenti utili: {with_refs})")
    lines.append("")

    lines.extend([
        "---",
        "## 4. Incrocio database – totale articoli",
        "",
        f"- **Totale .md in cartelle numero (OEL-*/INS-*):** {total_in_folders}",
        f"- **Totale .md in extra-web:** {extra_count}",
        f"- **Totale globale:** {total_globale}",
        f"- **Atteso (riferimento):** {atteso}",
        f"- **Discrepanza:** {discrepanza}",
        "",
    ])
    if discrepanza != 0:
        lines.append("Possibili cause: articoli in più/meno nelle cartelle, numeri non mappati, doppi conteggi nel riferimento.")
    lines.append("")

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"Report scritto: {REPORT_PATH}")

    # Riepilogo a console
    print("\n--- Riepilogo ---")
    print(f"Duplicati stesso numero/stesso titolo: {len(duplicati_stesso_numero)} gruppi")
    print(f"Duplicati cross-folder (stesso titolo): {len(duplicati_cross)} gruppi")
    print(f"Duplicati stesso contenuto (hash): {len(duplicati_stesso_contenuto)} gruppi")
    print(f"Numeri vuoti: {len(vuoti)}")
    print(f"Orfani extra-web: {len(orfani_info)}")
    print(f"Totale .md (numeri): {total_in_folders} | extra-web: {extra_count} | Totale: {total_globale} | Atteso: {atteso}")


if __name__ == "__main__":
    main()
