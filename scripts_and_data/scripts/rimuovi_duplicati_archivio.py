#!/usr/bin/env python3
"""
Rimuove duplicati in src/content/blog (OEL-*/INS-*).
Per ogni gruppo di duplicati (stesso numero + stesso titolo normalizzato, o stesso numero + stesso hash contenuto),
tiene la versione con slug "corretto" (più lungo = parola completa, senza accenti rotti) e cancella le altre.
"""

import re
from pathlib import Path
from collections import defaultdict

BASE = Path(__file__).resolve().parents[2]
BLOG_ROOT = BASE / "src" / "content" / "blog"


def normalize_title(s: str) -> str:
    if not s:
        return ""
    s = s.strip().lower()
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"[^\w\s]", "", s)
    return s


def extract_frontmatter(path: Path) -> tuple[dict, str]:
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
    t = re.sub(r"\s+", " ", body.strip())[:max_chars]
    return str(len(t)) + "_" + t[:80].replace(" ", "_")


def scan_articles() -> list[dict]:
    articles = []
    for folder in sorted(BLOG_ROOT.iterdir()):
        if not folder.is_dir() or folder.name == "extra-web":
            continue
        name = folder.name
        if not (name.startswith("OEL-") or name.startswith("INS-")):
            continue
        for md in folder.glob("*.md"):
            fm, body = extract_frontmatter(md)
            title = fm.get("title", "").strip() or md.stem
            slug = md.stem
            articles.append({
                "numero": name,
                "path": md,
                "slug": slug,
                "title_norm": normalize_title(title),
                "content_hash": hash_body(body),
            })
    return articles


def choose_keep(group: list[dict]) -> Path:
    """Tra i duplicati, tiene il file con slug 'corretto' (più lungo = parola completa)."""
    if len(group) <= 1:
        return group[0]["path"] if group else None
    # Ordina per: prima lunghezza slug decrescente, poi slug lessicograficamente
    sorted_group = sorted(group, key=lambda a: (-len(a["slug"]), a["slug"]))
    return sorted_group[0]["path"]


def main() -> None:
    articles = scan_articles()

    # Gruppi: stesso numero + stesso title_norm
    by_numero_title: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for a in articles:
        if a["title_norm"]:
            by_numero_title[(a["numero"], a["title_norm"])].append(a)

    # Gruppi: stesso numero + stesso content_hash
    by_numero_hash: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for a in articles:
        by_numero_hash[(a["numero"], a["content_hash"])].append(a)

    to_keep = set()
    to_delete = set()

    for key, group in by_numero_title.items():
        if len(group) <= 1:
            continue
        keep_path = choose_keep(group)
        to_keep.add(keep_path)
        for a in group:
            if a["path"] != keep_path:
                to_delete.add(a["path"])

    for key, group in by_numero_hash.items():
        if len(group) <= 1:
            continue
        keep_path = choose_keep(group)
        to_keep.add(keep_path)
        for a in group:
            if a["path"] != keep_path:
                to_delete.add(a["path"])

    # Non cancellare un file che in qualche gruppo è stato scelto da tenere
    to_delete = {p for p in to_delete if p not in to_keep}

    deleted = 0
    for p in sorted(to_delete):
        try:
            p.unlink()
            print(f"Eliminato: {p.relative_to(BASE)}")
            deleted += 1
        except Exception as e:
            print(f"ERRORE {p}: {e}")
    print(f"\nTotale eliminati: {deleted}")


if __name__ == "__main__":
    main()
