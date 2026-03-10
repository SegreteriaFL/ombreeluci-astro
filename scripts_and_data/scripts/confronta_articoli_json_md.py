# Script: confronta_articoli_json_md.py
#
# Confronta il database JSON dei numeri con i file Markdown esistenti.
# Genera un report degli articoli mancanti e delle discrepanze autori.

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple
from collections import defaultdict


def extract_slug_from_url(url: str) -> str:
    """Extract slug from URL like https://www.ombreeluci.it/YYYY/slug/"""
    # Remove trailing slash and get last part
    url = url.rstrip("/")
    parts = url.split("/")
    if len(parts) >= 2:
        return parts[-1]
    return ""


def parse_frontmatter(filepath: Path) -> Dict[str, str]:
    """Parse YAML frontmatter from markdown file."""
    result = {"slug": "", "author": "", "title": ""}

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Check for frontmatter
        if not content.startswith("---"):
            return result

        # Find end of frontmatter
        end_idx = content.find("---", 3)
        if end_idx == -1:
            return result

        frontmatter = content[3:end_idx]

        # Parse simple YAML
        for line in frontmatter.split("\n"):
            line = line.strip()
            if line.startswith("slug:"):
                val = line[5:].strip().strip('"').strip("'")
                result["slug"] = val
            elif line.startswith("author:"):
                val = line[7:].strip().strip('"').strip("'")
                result["author"] = val
            elif line.startswith("title:"):
                val = line[6:].strip().strip('"').strip("'")
                result["title"] = val
    except Exception as e:
        pass

    return result


def normalize_author(author: str) -> str:
    """Normalize author name for comparison."""
    if not author:
        return ""
    # Remove extra whitespace, lowercase
    author = re.sub(r"\s+", " ", author).strip().lower()
    # Remove common prefixes
    author = re.sub(r"^(di|da|a cura di)\s+", "", author, flags=re.IGNORECASE)
    return author


def main():
    # Paths
    base_dir = Path(r"C:\Users\berto\Documents\Ombreeluci")
    json_path = base_dir / "scripts_and_data" / "database_numeri_completo.json"
    content_dir = base_dir / "src" / "content"
    output_path = base_dir / "scripts_and_data" / "report_articoli_mancanti.md"

    # Load JSON database
    with open(json_path, "r", encoding="utf-8") as f:
        numeri = json.load(f)

    print(f"Loaded {len(numeri)} numeri from JSON")

    # Collect all slugs from JSON
    json_articles = {}  # slug -> {numero_id, titolo, autore, url}
    for numero in numeri:
        for art in numero.get("indice_articoli", []):
            slug = extract_slug_from_url(art["url"])
            if slug:
                json_articles[slug] = {
                    "numero_id": numero["id_numero"],
                    "numero_titolo": numero["titolo_ufficiale"],
                    "titolo": art["titolo"],
                    "autore": art["autore"],
                    "url": art["url"]
                }

    print(f"Found {len(json_articles)} unique article slugs in JSON")

    # Collect all markdown files
    md_files = {}  # slug -> {path, author, title}
    for md_path in content_dir.rglob("*.md"):
        fm = parse_frontmatter(md_path)
        slug = fm["slug"] or md_path.stem  # Use filename if no slug in frontmatter
        md_files[slug] = {
            "path": str(md_path.relative_to(base_dir)),
            "author": fm["author"],
            "title": fm["title"]
        }

    print(f"Found {len(md_files)} markdown files")

    # Find missing articles (in JSON but not in MD)
    missing_slugs = set(json_articles.keys()) - set(md_files.keys())

    # Find articles with author discrepancies
    author_discrepancies = []
    for slug in set(json_articles.keys()) & set(md_files.keys()):
        json_author = normalize_author(json_articles[slug]["autore"])
        md_author = normalize_author(md_files[slug]["author"])

        # Only flag if both have authors and they differ
        if json_author and md_author and json_author != md_author:
            author_discrepancies.append({
                "slug": slug,
                "numero_id": json_articles[slug]["numero_id"],
                "titolo": json_articles[slug]["titolo"],
                "json_author": json_articles[slug]["autore"],
                "md_author": md_files[slug]["author"],
                "md_path": md_files[slug]["path"]
            })

    # Group missing by numero
    missing_by_numero = defaultdict(list)
    for slug in missing_slugs:
        art = json_articles[slug]
        missing_by_numero[art["numero_id"]].append({
            "titolo": art["titolo"],
            "url": art["url"],
            "slug": slug
        })

    # Sort numeri
    def sort_key(num_id):
        prefix = num_id[:3]
        try:
            num = int(num_id[4:])
        except:
            num = 0
        return (0 if prefix == "INS" else 1, num)

    sorted_numeri = sorted(missing_by_numero.keys(), key=sort_key)

    # Generate report
    report = []
    report.append("# Report Articoli Mancanti")
    report.append("")
    report.append(f"**Data generazione:** {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M')}")
    report.append("")
    report.append("## Riepilogo")
    report.append("")
    report.append(f"- Articoli nel database JSON: **{len(json_articles)}**")
    report.append(f"- File Markdown esistenti: **{len(md_files)}**")
    report.append(f"- Articoli mancanti (in JSON ma non in MD): **{len(missing_slugs)}**")
    report.append(f"- Discrepanze autore: **{len(author_discrepancies)}**")
    report.append("")

    # Missing articles by numero
    report.append("---")
    report.append("")
    report.append("## Articoli Mancanti per Numero")
    report.append("")

    if not missing_slugs:
        report.append("*Nessun articolo mancante.*")
    else:
        for num_id in sorted_numeri:
            arts = missing_by_numero[num_id]
            # Get numero title
            num_title = ""
            for n in numeri:
                if n["id_numero"] == num_id:
                    num_title = n["titolo_ufficiale"]
                    break

            report.append(f"### {num_id} - {num_title}")
            report.append("")
            report.append(f"Articoli mancanti: **{len(arts)}**")
            report.append("")

            for art in sorted(arts, key=lambda x: x["titolo"]):
                titolo = art["titolo"] or "(senza titolo)"
                report.append(f"- [{titolo}]({art['url']})")
                report.append(f"  - Slug: `{art['slug']}`")

            report.append("")

    # Author discrepancies
    report.append("---")
    report.append("")
    report.append("## Discrepanze Autore")
    report.append("")
    report.append("Articoli dove l'autore nel JSON differisce da quello nel frontmatter Markdown.")
    report.append("")

    if not author_discrepancies:
        report.append("*Nessuna discrepanza rilevata.*")
    else:
        # Group by numero
        disc_by_numero = defaultdict(list)
        for d in author_discrepancies:
            disc_by_numero[d["numero_id"]].append(d)

        for num_id in sorted(disc_by_numero.keys(), key=sort_key):
            discs = disc_by_numero[num_id]
            report.append(f"### {num_id}")
            report.append("")
            report.append("| Articolo | Autore JSON | Autore MD | File |")
            report.append("|----------|-------------|-----------|------|")

            for d in discs:
                titolo = d["titolo"][:40] + "..." if len(d["titolo"]) > 40 else d["titolo"]
                report.append(f"| {titolo} | {d['json_author']} | {d['md_author']} | `{d['md_path']}` |")

            report.append("")

    # Write report
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report))

    print(f"\nReport saved to: {output_path}")
    print(f"\nSummary:")
    print(f"  - Missing articles: {len(missing_slugs)}")
    print(f"  - Author discrepancies: {len(author_discrepancies)}")


if __name__ == "__main__":
    main()
