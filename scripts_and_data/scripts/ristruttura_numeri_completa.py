# Script: ristruttura_numeri_completa.py
#
# Ristrutturazione completa dei 202 numeri:
# 1. Aggiunge sort_order (INS 1-30, OEL 100-272)
# 2. Usa date_iso per pubDate
# 3. Recupera copertine mancanti via scraping
# 4. Verifica connessione articoli
# 5. Fix INS-1

from __future__ import annotations

import json
import re
import time
from pathlib import Path
from typing import Dict, List, Optional

import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (compatible; OEL-restructure/1.0)"}


def fetch_cover_image(url: str) -> Optional[str]:
    """Fetch page and extract cover image URL."""
    try:
        r = requests.get(url, headers=UA, timeout=30)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")

        # Try og:image first
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            img_url = og_image["content"]
            if "wp-content/uploads" in img_url:
                return img_url

        # Try post-thumbnail
        thumb = soup.find("div", class_="post-thumbnail")
        if thumb:
            img = thumb.find("img")
            if img and img.get("src"):
                return img["src"]

        # Try entry-content
        content = soup.find("div", class_=re.compile(r"entry-content|post-content|et_pb_post_content"))
        if content:
            # Look for first meaningful image
            for img in content.find_all("img"):
                src = img.get("src", "")
                if "wp-content/uploads" in src:
                    # Skip small images, icons, etc.
                    if any(x in src.lower() for x in ["icon", "logo", "avatar", "gravatar"]):
                        continue
                    return src

        # Try any image with cover/copertina in name
        for img in soup.find_all("img"):
            src = img.get("src", "")
            if "wp-content/uploads" in src and any(x in src.lower() for x in ["copertina", "cover", "oel", "insieme"]):
                return src

        return None
    except Exception as e:
        print(f"    Error: {e}")
        return None


def extract_slug_from_url(url: str) -> str:
    """Extract slug from article URL."""
    return url.rstrip("/").split("/")[-1]


def generate_numero_md(numero: Dict, sort_order: int) -> str:
    """Generate complete markdown content for a numero."""
    id_numero = numero["id_numero"]

    # Determine tipo
    if id_numero.startswith("INS"):
        tipo = "insieme"
        num = int(id_numero.split("-")[1])
    else:
        tipo = "ombre-e-luci"
        num = int(id_numero.split("-")[1])

    # Clean values
    titolo = numero.get("titolo_ufficiale", "").replace('"', "'")
    sommario = numero.get("sommario_meta", "").replace('"', "'").replace("\n", " ")
    copertina = numero.get("copertina_url", "") or ""
    date_iso = numero.get("date_iso", "")
    data_pub = numero.get("data_pubblicazione", "")

    # Extract article slugs
    articoli = numero.get("indice_articoli", [])
    articoli_slugs = [extract_slug_from_url(art["url"]) for art in articoli if art.get("url")]

    # Build frontmatter
    content = f'''---
id: "{id_numero}"
title: "{titolo}"
tipo: "{tipo}"
numero: {num}
sort_order: {sort_order}
pubDate: "{date_iso}"
data_pubblicazione: "{data_pub}"
sommario: "{sommario}"
copertina: "{copertina}"
link_sfoglia: "{numero.get('link_sfoglia', '') or ''}"
link_pdf: "{numero.get('link_pdf', '') or ''}"
wp_url: "{numero.get('wp_url', '')}"
articoli:
'''

    # Add article slugs as list
    for slug in articoli_slugs:
        content += f'  - "{slug}"\n'

    content += "---\n\n"

    # Add article index section
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

    return content


def main():
    base_dir = Path(r"C:\Users\berto\Documents\Ombreeluci")
    json_path = base_dir / "scripts_and_data" / "database_numeri_completo.json"
    numeri_dir = base_dir / "src" / "content" / "numeri"

    # Load database
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Loaded {len(data)} numeri")

    # Separate INS and OEL
    ins_numeri = [x for x in data if x["id_numero"].startswith("INS")]
    oel_numeri = [x for x in data if x["id_numero"].startswith("OEL")]

    # Sort by numero
    ins_numeri.sort(key=lambda x: int(x["id_numero"].split("-")[1]))
    oel_numeri.sort(key=lambda x: int(x["id_numero"].split("-")[1]))

    print(f"INS: {len(ins_numeri)}, OEL: {len(oel_numeri)}")

    # ========================================
    # PART 1: Check and fix covers
    # ========================================
    print("\n=== PART 1: Checking covers ===")

    # Known fixes from user
    known_covers = {
        "OEL-1": "https://www.ombreeluci.it/wp-content/uploads/2017/10/1-1.jpg",
        "OEL-3": "https://www.ombreeluci.it/wp-content/uploads/2017/10/3-2.jpg",
        "OEL-6": "https://www.ombreeluci.it/wp-content/uploads/2017/10/6-1.jpg",
    }

    # Apply known fixes
    for numero in data:
        if numero["id_numero"] in known_covers:
            numero["copertina_url"] = known_covers[numero["id_numero"]]
            print(f"  Applied known fix for {numero['id_numero']}")

    # Check for missing covers
    missing_covers = []
    for numero in data:
        cover = numero.get("copertina_url", "")
        if not cover or "placeholder" in cover.lower():
            missing_covers.append(numero)

    print(f"Missing covers: {len(missing_covers)}")

    # Fetch missing covers
    if missing_covers:
        print("\nFetching missing covers...")
        for numero in missing_covers:
            url = numero.get("wp_url", "")
            if url:
                print(f"  {numero['id_numero']}: ", end="")
                cover = fetch_cover_image(url)
                if cover:
                    numero["copertina_url"] = cover
                    print(f"OK - {cover[:50]}...")
                else:
                    print("NOT FOUND")
                time.sleep(0.3)

    # ========================================
    # PART 2: Fix INS-1 specifically
    # ========================================
    print("\n=== PART 2: Fixing INS-1 ===")

    for numero in data:
        if numero["id_numero"] == "INS-1":
            # Ensure correct data
            numero["titolo_ufficiale"] = "Insieme n. 1 – Bollettino Fede e Luce"
            numero["data_pubblicazione"] = "Gennaio 1974"
            numero["date_iso"] = "1974-01-01T00:00:00Z"

            # Fetch fresh sommario if needed
            if not numero.get("sommario_meta") or len(numero.get("sommario_meta", "")) < 50:
                url = numero.get("wp_url", "")
                if url:
                    try:
                        r = requests.get(url, headers=UA, timeout=30)
                        soup = BeautifulSoup(r.text, "html.parser")
                        og_desc = soup.find("meta", property="og:description")
                        if og_desc and og_desc.get("content"):
                            numero["sommario_meta"] = og_desc["content"].strip()
                    except:
                        pass

            print(f"  Title: {numero['titolo_ufficiale']}")
            print(f"  Date: {numero['data_pubblicazione']}")
            print(f"  Sommario: {numero.get('sommario_meta', '')[:60]}...")
            break

    # ========================================
    # PART 3: Generate files with sort_order
    # ========================================
    print("\n=== PART 3: Generating files with sort_order ===")

    numeri_dir.mkdir(parents=True, exist_ok=True)

    # INS: sort_order 1-30
    for i, numero in enumerate(ins_numeri, start=1):
        sort_order = i
        content = generate_numero_md(numero, sort_order)
        filename = f"{numero['id_numero'].lower()}.md"
        filepath = numeri_dir / filename
        filepath.write_text(content, encoding="utf-8")

    print(f"  Created {len(ins_numeri)} INS files (sort_order 1-{len(ins_numeri)})")

    # OEL: sort_order 100-272
    for i, numero in enumerate(oel_numeri, start=100):
        sort_order = i
        content = generate_numero_md(numero, sort_order)
        filename = f"{numero['id_numero'].lower()}.md"
        filepath = numeri_dir / filename
        filepath.write_text(content, encoding="utf-8")

    print(f"  Created {len(oel_numeri)} OEL files (sort_order 100-{99+len(oel_numeri)})")

    # ========================================
    # PART 4: Save updated JSON
    # ========================================
    print("\n=== PART 4: Saving updated JSON ===")

    # Add sort_order to JSON too
    for i, numero in enumerate(ins_numeri, start=1):
        numero["sort_order"] = i

    for i, numero in enumerate(oel_numeri, start=100):
        numero["sort_order"] = i

    # Combine and sort
    all_numeri = ins_numeri + oel_numeri
    all_numeri.sort(key=lambda x: x["sort_order"])

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_numeri, f, ensure_ascii=False, indent=2)

    print(f"  Saved {len(all_numeri)} numeri to JSON")

    # ========================================
    # PART 5: Verify article connections
    # ========================================
    print("\n=== PART 5: Verifying article connections ===")

    blog_dir = base_dir / "src" / "content" / "blog"
    total_articles_in_numeri = 0
    articles_found = 0

    for numero in all_numeri:
        id_numero = numero["id_numero"]
        articoli = numero.get("indice_articoli", [])
        total_articles_in_numeri += len(articoli)

        # Check if folder exists
        folder = blog_dir / id_numero
        if folder.exists():
            articles_found += len(list(folder.glob("*.md")))

    print(f"  Articles in numeri indices: {total_articles_in_numeri}")
    print(f"  Articles in blog folders: {articles_found}")

    # ========================================
    # Summary
    # ========================================
    print("\n" + "=" * 60)
    print("RISTRUTTURAZIONE COMPLETATA")
    print("=" * 60)
    print(f"Numeri totali: {len(all_numeri)}")
    print(f"  - INS (sort 1-30): {len(ins_numeri)}")
    print(f"  - OEL (sort 100-{99+len(oel_numeri)}): {len(oel_numeri)}")
    print(f"File .md creati: {len(ins_numeri) + len(oel_numeri)}")
    print(f"Copertine verificate: {len(all_numeri) - len([x for x in all_numeri if not x.get('copertina_url')])}/{len(all_numeri)}")


if __name__ == "__main__":
    main()
