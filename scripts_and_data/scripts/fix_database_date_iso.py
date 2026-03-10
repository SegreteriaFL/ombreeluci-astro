# Script: fix_database_date_iso.py
#
# 1. Aggiunge date_iso a ogni numero
# 2. Aggiunge date_iso incrementale a ogni articolo
# 3. Fix INS-1 e OEL 77-100 (copertine e metadati)

from __future__ import annotations

import json
import re
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional, Tuple

import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (compatible; OEL-fixer/1.0)"}

# Mesi italiani
MESI_IT = {
    "gennaio": 1, "febbraio": 2, "marzo": 3, "aprile": 4,
    "maggio": 5, "giugno": 6, "luglio": 7, "agosto": 8,
    "settembre": 9, "ottobre": 10, "novembre": 11, "dicembre": 12
}


def parse_italian_date(date_str: str) -> Optional[Tuple[int, int]]:
    """Parse Italian date string, return (year, month) or (year, None)."""
    if not date_str:
        return None

    date_str = date_str.lower().strip()

    # Extract year
    year_match = re.search(r'(19\d{2}|20\d{2})', date_str)
    if not year_match:
        return None
    year = int(year_match.group(1))

    # Extract month - take the first one mentioned
    for mese, num in MESI_IT.items():
        if mese in date_str:
            return (year, num)

    # No month found, just year
    return (year, None)


def date_to_iso(year: int, month: Optional[int] = None, day: int = 1) -> str:
    """Convert to ISO format."""
    m = month if month else 1
    return f"{year:04d}-{m:02d}-{day:02d}T00:00:00Z"


def fetch_page_data(url: str) -> Dict:
    """Fetch page and extract metadata."""
    try:
        r = requests.get(url, headers=UA, timeout=30)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")

        result = {}

        # og:image for copertina
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            result["copertina_url"] = og_image["content"]

        # og:description for sommario
        og_desc = soup.find("meta", property="og:description")
        if og_desc and og_desc.get("content"):
            result["sommario_meta"] = og_desc["content"].strip()

        # Also try meta description
        if not result.get("sommario_meta"):
            meta_desc = soup.find("meta", attrs={"name": "description"})
            if meta_desc and meta_desc.get("content"):
                result["sommario_meta"] = meta_desc["content"].strip()

        # Try to find cover image in content if og:image missing
        if not result.get("copertina_url"):
            # Look for main content image
            for img in soup.find_all("img"):
                src = img.get("src", "")
                if "wp-content/uploads" in src and any(x in src.lower() for x in ["copertina", "cover", "oel-", "insieme"]):
                    result["copertina_url"] = src
                    break

        return result
    except Exception as e:
        print(f"  Error fetching {url}: {e}")
        return {}


def main():
    base_dir = Path(r"C:\Users\berto\Documents\Ombreeluci")
    json_path = base_dir / "scripts_and_data" / "database_numeri_completo.json"

    # Load database
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Loaded {len(data)} numeri")

    # ========================================
    # PART 1: Add date_iso to all numeri
    # ========================================
    print("\n=== PART 1: Adding date_iso to numeri ===")

    date_added = 0
    date_failed = []

    for numero in data:
        date_str = numero.get("data_pubblicazione", "")
        parsed = parse_italian_date(date_str)

        if parsed:
            year, month = parsed
            numero["date_iso"] = date_to_iso(year, month)
            date_added += 1
        else:
            # Try to extract from title or URL
            title = numero.get("titolo_ufficiale", "")
            url = numero.get("wp_url", "")

            # Try title
            parsed = parse_italian_date(title)
            if parsed:
                year, month = parsed
                numero["date_iso"] = date_to_iso(year, month)
                date_added += 1
            else:
                # Try URL for year
                year_match = re.search(r'(19\d{2}|20\d{2})', url)
                if year_match:
                    year = int(year_match.group(1))
                    numero["date_iso"] = date_to_iso(year)
                    date_added += 1
                else:
                    date_failed.append(numero["id_numero"])

    print(f"Date ISO added: {date_added}")
    if date_failed:
        print(f"Failed to parse date for: {date_failed}")

    # ========================================
    # PART 2: Add date_iso to articles
    # ========================================
    print("\n=== PART 2: Adding date_iso to articles ===")

    articles_updated = 0

    for numero in data:
        base_date = numero.get("date_iso", "")
        if not base_date:
            continue

        # Parse base date
        try:
            base_dt = datetime.fromisoformat(base_date.replace("Z", "+00:00"))
        except:
            continue

        articoli = numero.get("indice_articoli", [])
        for i, art in enumerate(articoli):
            # Add minutes to maintain order
            art_dt = base_dt.replace(minute=i+1 if i < 59 else 59, second=i//59 if i >= 59 else 0)
            art["date_iso"] = art_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
            articles_updated += 1

    print(f"Articles with date_iso: {articles_updated}")

    # ========================================
    # PART 3: Fix INS-1
    # ========================================
    print("\n=== PART 3: Fixing INS-1 ===")

    for numero in data:
        if numero["id_numero"] == "INS-1":
            print(f"  Current data_pubblicazione: {numero.get('data_pubblicazione')}")
            print(f"  Current sommario: {numero.get('sommario_meta', '')[:50]}...")

            # Fetch fresh data
            url = numero.get("wp_url", "")
            if url:
                fresh = fetch_page_data(url)
                if fresh.get("sommario_meta"):
                    numero["sommario_meta"] = fresh["sommario_meta"]
                    print(f"  Updated sommario: {fresh['sommario_meta'][:50]}...")
                if fresh.get("copertina_url"):
                    numero["copertina_url"] = fresh["copertina_url"]
                    print(f"  Updated copertina: {fresh['copertina_url']}")

            # Ensure correct date
            numero["data_pubblicazione"] = "Gennaio 1974"
            numero["date_iso"] = "1974-01-01T00:00:00Z"
            print(f"  Set date_iso: {numero['date_iso']}")
            break

    # ========================================
    # PART 4: Fix OEL 77-100 copertine
    # ========================================
    print("\n=== PART 4: Fixing OEL 77-100 copertine ===")

    fixed_covers = 0

    for numero in data:
        if numero["id_numero"].startswith("OEL-"):
            try:
                num = int(numero["id_numero"].split("-")[1])
            except:
                continue

            if 77 <= num <= 100:
                current_cover = numero.get("copertina_url", "")

                # Check if cover is missing or placeholder
                if not current_cover or "placeholder" in current_cover.lower():
                    url = numero.get("wp_url", "")
                    if url:
                        print(f"  Fetching {numero['id_numero']}...", end=" ")
                        fresh = fetch_page_data(url)

                        if fresh.get("copertina_url"):
                            numero["copertina_url"] = fresh["copertina_url"]
                            fixed_covers += 1
                            print(f"OK: {fresh['copertina_url'][:50]}...")
                        else:
                            print("No cover found")

                        time.sleep(0.3)
                else:
                    print(f"  {numero['id_numero']}: Already has cover")

    print(f"Covers fixed: {fixed_covers}")

    # ========================================
    # PART 5: Sort by date_iso
    # ========================================
    print("\n=== PART 5: Sorting by date_iso ===")

    # Sort: first by tipo (INS before OEL), then by numero
    def sort_key(item):
        id_num = item.get("id_numero", "")
        tipo = 0 if id_num.startswith("INS") else 1
        try:
            num = int(id_num.split("-")[1])
        except:
            num = 0
        return (tipo, num)

    data.sort(key=sort_key)
    print("Sorted by tipo and numero")

    # ========================================
    # Save
    # ========================================
    print("\n=== Saving ===")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Saved to {json_path}")

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total numeri: {len(data)}")
    print(f"Numeri with date_iso: {sum(1 for x in data if x.get('date_iso'))}")
    print(f"Total articles: {sum(len(x.get('indice_articoli', [])) for x in data)}")
    print(f"Articles with date_iso: {articles_updated}")


if __name__ == "__main__":
    main()
