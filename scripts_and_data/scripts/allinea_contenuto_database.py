# Script: allinea_contenuto_database.py
#
# 1. Genera file .md per tutti i 202 numeri in src/content/numeri/
# 2. Aggiorna frontmatter degli articoli con id_numero e numero_rivista

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Dict, Optional
from collections import defaultdict


def slugify(text: str) -> str:
    """Create URL-friendly slug from text."""
    text = text.lower()
    text = re.sub(r'[àáâãäå]', 'a', text)
    text = re.sub(r'[èéêë]', 'e', text)
    text = re.sub(r'[ìíîï]', 'i', text)
    text = re.sub(r'[òóôõö]', 'o', text)
    text = re.sub(r'[ùúûü]', 'u', text)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')


def extract_slug_from_url(url: str) -> str:
    """Extract slug from article URL."""
    url = url.rstrip("/")
    parts = url.split("/")
    if len(parts) >= 1:
        return parts[-1]
    return ""


def parse_frontmatter(content: str) -> tuple[Dict[str, str], str, str]:
    """Parse YAML frontmatter. Returns (frontmatter_dict, frontmatter_raw, body)."""
    if not content.startswith("---"):
        return {}, "", content

    end_idx = content.find("---", 3)
    if end_idx == -1:
        return {}, "", content

    frontmatter_raw = content[3:end_idx]
    body = content[end_idx + 3:].lstrip("\n")

    # Parse simple YAML
    fm = {}
    for line in frontmatter_raw.split("\n"):
        if ":" in line:
            key, _, value = line.partition(":")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key:
                fm[key] = value

    return fm, frontmatter_raw, body


def rebuild_frontmatter(fm: Dict[str, str], original_raw: str) -> str:
    """Rebuild frontmatter preserving original format where possible."""
    lines = original_raw.strip().split("\n")

    # Find which keys need to be added
    existing_keys = set()
    for line in lines:
        if ":" in line:
            key = line.split(":")[0].strip()
            existing_keys.add(key)

    # Add new keys at the end
    new_lines = lines.copy()
    for key in ["id_numero", "numero_rivista"]:
        if key in fm and key not in existing_keys:
            new_lines.append(f'{key}: "{fm[key]}"')

    # Update existing keys if changed
    result = []
    for line in new_lines:
        if ":" in line:
            key = line.split(":")[0].strip()
            if key in ["id_numero", "numero_rivista"] and key in fm:
                result.append(f'{key}: "{fm[key]}"')
            else:
                result.append(line)
        else:
            result.append(line)

    return "\n".join(result)


def generate_numero_md(numero: Dict, output_dir: Path) -> str:
    """Generate markdown file for a numero."""
    id_numero = numero["id_numero"]

    # Determine tipo
    if id_numero.startswith("INS"):
        tipo = "insieme"
        num = int(id_numero.split("-")[1])
    else:
        tipo = "ombre-e-luci"
        num = int(id_numero.split("-")[1])

    # Clean title
    titolo = numero.get("titolo_ufficiale", "").replace("–", "-").replace("—", "-")

    # Extract year from data_pubblicazione
    data = numero.get("data_pubblicazione", "")
    anno = ""
    m = re.search(r"(19\d{2}|20\d{2})", data)
    if m:
        anno = m.group(1)

    # Create filename
    filename = f"{id_numero.lower()}.md"

    # Build frontmatter
    content = f'''---
id: "{id_numero}"
title: "{titolo}"
tipo: "{tipo}"
numero: {num}
anno: "{anno}"
data_pubblicazione: "{data}"
sommario: "{numero.get('sommario_meta', '').replace('"', "'")}"
copertina: "{numero.get('copertina_url', '')}"
link_sfoglia: "{numero.get('link_sfoglia', '') or ''}"
link_pdf: "{numero.get('link_pdf', '') or ''}"
wp_url: "{numero.get('wp_url', '')}"
---

'''

    # Add article list
    articoli = numero.get("indice_articoli", [])
    if articoli:
        content += "## Indice\n\n"
        for art in articoli:
            titolo_art = art.get("titolo", "").strip() or "(senza titolo)"
            autore = art.get("autore", "").strip()
            url = art.get("url", "")

            if autore:
                content += f"- [{titolo_art}]({url}) - {autore}\n"
            else:
                content += f"- [{titolo_art}]({url})\n"

    return filename, content


def main():
    base_dir = Path(r"C:\Users\berto\Documents\Ombreeluci")
    json_path = base_dir / "scripts_and_data" / "database_numeri_completo.json"
    numeri_dir = base_dir / "src" / "content" / "numeri"
    blog_dir = base_dir / "src" / "content" / "blog"
    temp_archive_dir = base_dir / "src" / "content" / "temp_archive"

    # Load database
    with open(json_path, "r", encoding="utf-8") as f:
        numeri = json.load(f)

    print(f"Loaded {len(numeri)} numeri from database")

    # Build slug -> numero mapping
    slug_to_numero = {}
    for numero in numeri:
        id_num = numero["id_numero"]
        for art in numero.get("indice_articoli", []):
            slug = extract_slug_from_url(art["url"])
            if slug:
                slug_to_numero[slug] = id_num

    print(f"Built mapping: {len(slug_to_numero)} article slugs")

    # ========================================
    # PART 1: Generate numeri files
    # ========================================
    print("\n=== PART 1: Generating numeri files ===")

    numeri_dir.mkdir(parents=True, exist_ok=True)

    for numero in numeri:
        filename, content = generate_numero_md(numero, numeri_dir)
        filepath = numeri_dir / filename
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

    print(f"Created {len(numeri)} files in {numeri_dir}")

    # ========================================
    # PART 2: Update blog articles frontmatter
    # ========================================
    print("\n=== PART 2: Updating blog articles ===")

    updated = 0
    skipped = 0
    errors = []

    if blog_dir.exists():
        for md_path in blog_dir.rglob("*.md"):
            try:
                # Extract numero from folder name (e.g., OEL-48, INS-27)
                parent = md_path.parent.name
                if parent.startswith(("OEL-", "INS-")):
                    id_numero = parent

                    # Determine numero_rivista
                    if id_numero.startswith("INS"):
                        numero_rivista = "Insieme"
                    else:
                        numero_rivista = "Ombre e Luci"

                    # Read file
                    content = md_path.read_text(encoding="utf-8")
                    fm, fm_raw, body = parse_frontmatter(content)

                    # Check if already has these fields
                    if fm.get("id_numero") == id_numero and fm.get("numero_rivista") == numero_rivista:
                        skipped += 1
                        continue

                    # Update frontmatter
                    fm["id_numero"] = id_numero
                    fm["numero_rivista"] = numero_rivista

                    new_fm = rebuild_frontmatter(fm, fm_raw)
                    new_content = f"---\n{new_fm}\n---\n{body}"

                    md_path.write_text(new_content, encoding="utf-8")
                    updated += 1
                else:
                    skipped += 1
            except Exception as e:
                errors.append(f"{md_path}: {e}")

    print(f"Blog: Updated {updated}, Skipped {skipped}, Errors {len(errors)}")

    # ========================================
    # PART 3: Update temp_archive articles
    # ========================================
    print("\n=== PART 3: Updating temp_archive articles ===")

    updated_ta = 0
    skipped_ta = 0
    not_found_ta = 0
    errors_ta = []

    if temp_archive_dir.exists():
        for md_path in temp_archive_dir.rglob("*.md"):
            try:
                content = md_path.read_text(encoding="utf-8")
                fm, fm_raw, body = parse_frontmatter(content)

                # Get slug from frontmatter or filename
                slug = fm.get("slug", "") or md_path.stem

                # Find numero
                id_numero = slug_to_numero.get(slug)

                if not id_numero:
                    not_found_ta += 1
                    continue

                # Determine numero_rivista
                if id_numero.startswith("INS"):
                    numero_rivista = "Insieme"
                else:
                    numero_rivista = "Ombre e Luci"

                # Check if already has these fields
                if fm.get("id_numero") == id_numero and fm.get("numero_rivista") == numero_rivista:
                    skipped_ta += 1
                    continue

                # Update frontmatter
                fm["id_numero"] = id_numero
                fm["numero_rivista"] = numero_rivista

                new_fm = rebuild_frontmatter(fm, fm_raw)
                new_content = f"---\n{new_fm}\n---\n{body}"

                md_path.write_text(new_content, encoding="utf-8")
                updated_ta += 1

            except Exception as e:
                errors_ta.append(f"{md_path}: {e}")

    print(f"Temp_archive: Updated {updated_ta}, Skipped {skipped_ta}, Not found {not_found_ta}, Errors {len(errors_ta)}")

    # ========================================
    # Summary
    # ========================================
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Numeri files created: {len(numeri)}")
    print(f"Blog articles updated: {updated}")
    print(f"Temp_archive articles updated: {updated_ta}")
    print(f"Total errors: {len(errors) + len(errors_ta)}")

    if errors:
        print("\nBlog errors:")
        for e in errors[:10]:
            print(f"  - {e}")

    if errors_ta:
        print("\nTemp_archive errors:")
        for e in errors_ta[:10]:
            print(f"  - {e}")


if __name__ == "__main__":
    main()
