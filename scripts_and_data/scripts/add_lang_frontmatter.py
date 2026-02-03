#!/usr/bin/env python3
"""
Aggiunge lang: en nel frontmatter dei 163 articoli identificati in report_articoli_inglese.md.
Aggiunge lang: it in tutti gli altri .md del blog (default esplicito).
Verifica: esattamente 163 file con lang: en.
"""

import re
from pathlib import Path
from typing import Set, Tuple

BASE = Path(__file__).resolve().parents[2]
REPORT_MD = BASE / "scripts_and_data" / "report_articoli_inglese.md"
BLOG_ROOT = BASE / "src" / "content" / "blog"


def extract_english_paths_from_report(report_path: Path) -> Set[str]:
    """Estrae i path dei 163 articoli in inglese dal report (linee con — `src/content/blog/...md`)."""
    text = report_path.read_text(encoding="utf-8")
    # Pattern: — `src/content/blog/.../file.md`
    pattern = r" — `(src/content/blog/[^`]+\.md)`"
    matches = re.findall(pattern, text)
    # Normalizza a path con / per confronto coerente
    return {m.replace("\\", "/") for m in matches}


def normalize_path_for_comparison(p: Path) -> str:
    """Path relativo da BASE, con forward slashes."""
    try:
        rel = p.relative_to(BASE)
    except ValueError:
        return str(p).replace("\\", "/")
    return str(rel).replace("\\", "/")


def parse_frontmatter(content: str) -> Tuple[str, str, str]:
    """
    Ritorna (frontmatter, body, delimitatore_finale_newline).
    Se non c'è frontmatter valido, ritorna ("", content, "").
    """
    if not content.startswith("---"):
        return "", content, ""
    parts = content.split("---", 2)
    if len(parts) < 3:
        return "", content, ""
    fm = parts[1]
    body = parts[2]
    # Mantieni eventuale newline dopo ---
    if body.startswith("\n"):
        body = body[1:]
    trail = ""
    if body.endswith("\n"):
        trail = "\n"
        body = body.rstrip("\n")
    return fm, body, trail


def set_lang_in_frontmatter(fm: str, lang: str) -> str:
    """
    Aggiunge o sostituisce la chiave lang nel frontmatter (una sola occorrenza).
    Inserisce dopo 'slug:' se presente, altrimenti in coda.
    Se esistono più righe 'lang:', le sostituisce con una sola.
    """
    lines = fm.rstrip().split("\n")
    new_lines = []
    inserted = False

    for line in lines:
        stripped = line.strip()
        if stripped.lower().startswith("lang:"):
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

    if not inserted:
        if new_lines:
            indent = "  " if new_lines[-1].startswith(" ") else ""
            new_lines.append(f"{indent}lang: {lang}")
        else:
            new_lines.append(f"lang: {lang}")

    return "\n".join(new_lines) + "\n"


def main() -> None:
    if not REPORT_MD.exists():
        print(f"[ERROR] Report non trovato: {REPORT_MD}")
        return
    if not BLOG_ROOT.exists():
        print(f"[ERROR] Blog root non trovato: {BLOG_ROOT}")
        return

    english_paths = extract_english_paths_from_report(REPORT_MD)
    print(f"Path articoli in inglese estratti dal report: {len(english_paths)}", flush=True)

    all_md = list(BLOG_ROOT.rglob("*.md"))
    print(f"File .md totali nel blog: {len(all_md)}", flush=True)

    modified_count = 0
    errors = []

    for md_path in all_md:
        rel_norm = normalize_path_for_comparison(md_path)
        lang = "en" if rel_norm in english_paths else "it"

        try:
            content = md_path.read_text(encoding="utf-8")
        except Exception as e:
            errors.append((str(md_path), str(e)))
            continue

        fm, body, trail = parse_frontmatter(content)
        if fm == "" and body:
            # Nessun frontmatter: creane uno minimo con lang
            new_content = f"---\nlang: {lang}\n---\n{content}"
        elif fm == "":
            continue
        else:
            new_fm = set_lang_in_frontmatter(fm, lang)
            new_content = f"---{new_fm}---\n{body}{trail}"

        if new_content.strip() != content.strip():
            try:
                md_path.write_text(new_content, encoding="utf-8")
                modified_count += 1
            except Exception as e:
                errors.append((str(md_path), str(e)))

    # Verifica: conta quanti file hanno lang: en (devono essere esattamente 163)
    count_en_actual = 0
    count_it_actual = 0
    for md_path in all_md:
        try:
            c = md_path.read_text(encoding="utf-8")
        except Exception:
            continue
        fm, _, _ = parse_frontmatter(c)
        if re.search(r"^lang:\s*en\s*$", fm, re.MULTILINE | re.IGNORECASE):
            count_en_actual += 1
        elif re.search(r"^lang:\s*it\s*$", fm, re.MULTILINE | re.IGNORECASE):
            count_it_actual += 1

    print(f"File modificati in questo run: {modified_count}", flush=True)

    if errors:
        print(f"\n[WARN] Errori durante scrittura: {len(errors)}")
        for path, err in errors[:10]:
            print(f"  {path}: {err}")

    print(f"\n--- Verifica ---", flush=True)
    print(f"File con lang: en (attesi 163): {count_en_actual}", flush=True)
    print(f"File con lang: it: {count_it_actual}", flush=True)
    if count_en_actual == 163:
        print("OK: esattamente 163 file con lang: en.", flush=True)
    else:
        print(f"ATTENZIONE: attesi 163 file con lang: en, trovati {count_en_actual}.", flush=True)


if __name__ == "__main__":
    main()
