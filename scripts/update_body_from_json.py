#!/usr/bin/env python3
"""
Aggiorna solo il body dei .md in src/content/blog/ da articoli_semantici_FULL_2026.json.
Il frontmatter (primo blocco --- ... ---) non viene mai modificato.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

try:
    import html2text
except ImportError:
    print("[ERROR] Installa html2text: pip install html2text", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "src" / "content" / "blog"
DEFAULT_JSON_CANDIDATES = [
    ROOT / "src" / "data" / "articoli_semantici_FULL_2026.json",
    ROOT / "scripts_and_data" / "datasets" / "articoli" / "articoli_semantici_FULL_2026.json",
    ROOT
    / "_migration_archive"
    / "export pulito db 2026"
    / "articoli_semantici_FULL_2026.json",
]

MIN_HTML_LEN = 100

# Esempi richiesti per il report dry-run (suffisso path sotto blog/)
EXAMPLE_SUFFIXES = [
    "OEL-172/intelligenza-artificiale-e-memoria-editoriale-il-mio-lavoro-con-ombre-e-luci.md",
    "OEL-152/khrshd-quattro-ragazzini-a-teheran.md",
    "OEL-105/si-puo-fare-da-vicino-nessuno-e-normale.md",
]


def resolve_json_path(arg: str | None) -> Path:
    if arg:
        p = Path(arg)
        if not p.is_absolute():
            p = ROOT / p
        if p.is_file():
            return p
        print(f"[ERROR] File JSON non trovato: {p}", file=sys.stderr)
        _print_json_hints()
        sys.exit(1)

    for c in DEFAULT_JSON_CANDIDATES:
        if c.is_file():
            return c
    print("[ERROR] Nessun articoli_semantici_FULL_2026.json trovato nei percorsi predefiniti.", file=sys.stderr)
    _print_json_hints()
    sys.exit(1)


def _print_json_hints() -> None:
    print("\nCopia o collega il file, oppure passa --json con path assoluto, ad esempio:", file=sys.stderr)
    print(
        f'  --json "{ROOT / "_migration_archive" / "export pulito db 2026" / "articoli_semantici_FULL_2026.json"}"',
        file=sys.stderr,
    )


def make_html2text() -> html2text.HTML2Text:
    h = html2text.HTML2Text()
    h.ignore_links = False
    h.ignore_images = True
    h.body_width = 0
    h.ignore_emphasis = False
    return h


def split_frontmatter(content: str) -> tuple[str | None, str]:
    parts = re.split(r"^---\s*$", content, maxsplit=2, flags=re.MULTILINE)
    if len(parts) < 3:
        return None, content
    fm = parts[1].strip("\n")
    body = parts[2]
    if body.startswith("\n"):
        body = body[1:]
    elif body.startswith("\r\n"):
        body = body[2:]
    return fm, body


def extract_wp_id(frontmatter: str) -> str | None:
    m = re.search(r"^wp_id:\s*(.+?)\s*$", frontmatter, re.MULTILINE)
    if not m:
        return None
    val = m.group(1).strip()
    if len(val) >= 2 and val[0] == val[-1] and val[0] in "\"'":
        val = val[1:-1]
    val = val.strip()
    return val if val else None


def list_markdown_files() -> list[Path]:
    out: list[Path] = []
    for p in BLOG_DIR.rglob("*.md"):
        rel = p.relative_to(BLOG_DIR)
        if "NUOVI" in rel.parts:
            continue
        out.append(p)
    return sorted(out)


def load_articles_by_wp_id(path: Path) -> dict[str, dict]:
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        print("[ERROR] Il JSON deve essere una lista di articoli.", file=sys.stderr)
        sys.exit(1)
    by_id: dict[str, dict] = {}
    for art in data:
        if not isinstance(art, dict) or "id" not in art:
            continue
        by_id[str(art["id"])] = art
    return by_id


def main() -> None:
    ap = argparse.ArgumentParser(description="Aggiorna solo il body dei .md da html_pulito nel JSON.")
    ap.add_argument(
        "--json",
        dest="json_path",
        default=None,
        help="Path ad articoli_semantici_FULL_2026.json (default: cerca in src/data, datasets, _migration_archive)",
    )
    ap.add_argument("--dry-run", action="store_true", help="Non scrivere file; statistiche ed esempi.")
    ap.add_argument("--apply", action="store_true", help="Scrive i file aggiornati.")
    ap.add_argument(
        "--only-shorter",
        action="store_true",
        help="Aggiorna solo se il body convertito è più lungo del body attuale.",
    )
    args = ap.parse_args()
    if args.dry_run and args.apply:
        print("[ERROR] Usa solo uno tra --dry-run e --apply.", file=sys.stderr)
        sys.exit(1)
    if not args.dry_run and not args.apply:
        print("[ERROR] Specifica --dry-run oppure --apply.", file=sys.stderr)
        sys.exit(1)

    json_path = resolve_json_path(args.json_path)
    print(f"[INFO] JSON: {json_path}")
    by_wp = load_articles_by_wp_id(json_path)
    print(f"[INFO] Articoli nel JSON (con id): {len(by_wp)}")

    h2t = make_html2text()

    md_files = list_markdown_files()
    wp_id_to_md_paths: dict[str, list[Path]] = {}

    stats = {
        "md_total": len(md_files),
        "no_frontmatter": 0,
        "no_wp_id": 0,
        "skipped_nuovi": 0,  # già esclusi dalla lista
        "no_json_article": 0,
        "html_too_short": 0,
        "body_unchanged": 0,
        "only_shorter_skip": 0,
        "would_update": 0,
        "would_update_only_shorter": 0,
        "updated": 0,
    }

    planned: list[tuple[Path, int, int, str, str]] = []  # path, len_before, len_after, before, after

    for md_path in md_files:
        raw = md_path.read_text(encoding="utf-8")
        fm, body = split_frontmatter(raw)
        if fm is None:
            stats["no_frontmatter"] += 1
            continue

        wp_id = extract_wp_id(fm)
        if not wp_id:
            stats["no_wp_id"] += 1
            continue

        wp_id_to_md_paths.setdefault(wp_id, []).append(md_path)

        art = by_wp.get(wp_id)
        if not art:
            stats["no_json_article"] += 1
            continue

        html = (art.get("html_pulito") or "").strip()
        if len(html) < MIN_HTML_LEN:
            stats["html_too_short"] += 1
            continue

        new_body = h2t.handle(html).strip()
        old_body = body.rstrip()
        if old_body == new_body:
            stats["body_unchanged"] += 1
            continue

        longer = len(new_body) > len(old_body)
        if not args.only_shorter and args.dry_run:
            stats["would_update_only_shorter"] += 1 if longer else 0

        if args.only_shorter and not longer:
            stats["only_shorter_skip"] += 1
            continue

        if args.dry_run:
            stats["would_update"] += 1
            planned.append((md_path, len(old_body), len(new_body), old_body, new_body))
        else:
            new_content = "---\n" + fm + "\n---\n\n" + new_body + "\n"
            md_path.write_text(new_content, encoding="utf-8")
            stats["updated"] += 1
            print(f"UPDATED: {md_path.relative_to(ROOT)} (prima: {len(old_body)}char → dopo: {len(new_body)}char)")

    json_ids = set(by_wp.keys())
    referenced_wp_ids = set(wp_id_to_md_paths.keys())
    json_no_md = len(json_ids - referenced_wp_ids)

    print()
    print("=" * 60)
    print("REPORT FINALE")
    print("=" * 60)
    print(f"File .md esaminati (escluso NUOVI/): {stats['md_total']}")
    print(f"Senza frontmatter valido (secondo --- mancante): {stats['no_frontmatter']}")
    print(f"Senza wp_id nel frontmatter (non matchabili): {stats['no_wp_id']}")
    print(f".md con wp_id assente nel JSON: {stats['no_json_article']}")
    print(f"Saltati: html_pulito vuoto o < {MIN_HTML_LEN} char: {stats['html_too_short']}")
    print(f"Body già uguale al convertito: {stats['body_unchanged']}")
    if args.only_shorter:
        print(f"Saltati (--only-shorter, nuovo non più lungo): {stats['only_shorter_skip']}")
    if args.dry_run:
        if args.only_shorter:
            print(f"Verrebbero aggiornati (--apply --only-shorter): {stats['would_update']}")
        else:
            print(f"Verrebbero aggiornati (--apply su tutti i body diversi): {stats['would_update']}")
            print(
                f"  subset con body convertito più lungo (--only-shorter): "
                f"{stats['would_update_only_shorter']}"
            )
    else:
        print(f"File aggiornati: {stats['updated']}")
    print(f"Articoli nel JSON senza alcun .md con stesso wp_id: {json_no_md}")
    print(f"Totale articoli nel JSON: {len(by_wp)}")
    print("=" * 60)

    if args.dry_run and planned:
        print("\n=== Esempi PRIMA / DOPO (estratti; 3 casi richiesti) ===\n")
        example_map: dict[str, tuple[Path, int, int, str, str]] = {}
        for p, lb, la, btxt, atxt in planned:
            example_map[p.relative_to(ROOT).as_posix()] = (p, lb, la, btxt, atxt)

        for suf in EXAMPLE_SUFFIXES:
            norm_suf = suf.replace("\\", "/")
            key = f"src/content/blog/{norm_suf}"
            tup = example_map.get(key)
            if not tup:
                for k, v in example_map.items():
                    if k.endswith(norm_suf):
                        tup = v
                        break
            print(f"--- File: {suf} ---")
            if not tup:
                print(
                    "(Non tra gli aggiornamenti previsti: body già uguale, filtro --only-shorter, "
                    "html_pulito corto, wp_id assente nel JSON, ecc.)"
                )
                print()
                continue
            _path, lb, la, btxt, atxt = tup
            clip = 1200
            print(f"PRIMA ({lb} char):\n{btxt[:clip]}{'…' if len(btxt) > clip else ''}\n")
            print(f"DOPO ({la} char):\n{atxt[:clip]}{'…' if len(atxt) > clip else ''}\n")

        if len(planned) > 3:
            print(f"(Totale file che verrebbero aggiornati: {len(planned)}.)")


if __name__ == "__main__":
    main()
