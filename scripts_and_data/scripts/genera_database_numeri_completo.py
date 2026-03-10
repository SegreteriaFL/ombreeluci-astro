# Script: genera_database_numeri_completo.py
#
# Genera un database JSON completo di tutti i numeri della rivista Ombre e Luci/Insieme
# partendo dalle pagine web.
#
# Output: scripts_and_data/database_numeri_completo.json
#
# Requisiti:
#   pip install requests beautifulsoup4

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from typing import Dict, List, Optional, Tuple
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (compatible; OEL-scraper/1.0)"}


def fetch_html(url: str, timeout: int = 30) -> str:
    """Fetch HTML content from a URL."""
    r = requests.get(url, headers=UA, timeout=timeout)
    r.raise_for_status()
    return r.text


def normalize_space(s: str) -> str:
    """Normalize whitespace in a string."""
    return re.sub(r"\s+", " ", (s or "")).strip()


def get_meta(soup: BeautifulSoup) -> Dict[str, str]:
    """Extract all meta tags from the page."""
    meta: Dict[str, str] = {}
    for tag in soup.find_all("meta"):
        if tag.get("property") and tag.get("content"):
            meta[tag["property"]] = tag["content"]
        if tag.get("name") and tag.get("content"):
            meta[tag["name"]] = tag["content"]
    canon = soup.find("link", rel="canonical")
    if canon and canon.get("href"):
        meta["canonical"] = canon["href"]
    return meta


def extract_id_numero(url: str) -> str:
    """Extract ID from URL (e.g., INS-10, OEL-150)."""
    slug = urlparse(url).path.lower()

    # Insieme
    m = re.search(r"/insieme-n-(\d{1,4})", slug)
    if m:
        return f"INS-{m.group(1)}"

    # Ombre e Luci
    m = re.search(r"/numero-(\d{1,4})", slug)
    if m:
        return f"OEL-{m.group(1)}"

    # Fallback
    return "UNKNOWN"


def extract_data_pubblicazione(soup: BeautifulSoup, text: str) -> Optional[str]:
    """Extract publication date (month and year)."""
    MESI = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
            "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"]
    MESI_RE = "(" + "|".join(MESI) + ")"

    # Try to find in em tags
    for em in soup.find_all("em"):
        em_text = normalize_space(em.get_text(" "))
        m = re.search(rf"{MESI_RE}\s*[-–]?\s*(?:{MESI_RE})?\s*(19\d{{2}}|20\d{{2}})", em_text, re.IGNORECASE)
        if m:
            return normalize_space(m.group(0))

    # Try from body text
    m = re.search(rf"{MESI_RE}(?:\s*[-–,]\s*{MESI_RE})?\s*(19\d{{2}}|20\d{{2}})", text, re.IGNORECASE)
    if m:
        return normalize_space(m.group(0))

    # Just year
    m = re.search(r"\b(19\d{2}|20\d{2})\b", text)
    if m:
        return m.group(1)

    return None


def find_main_container(soup: BeautifulSoup) -> BeautifulSoup:
    """Find the main content container."""
    candidates = [
        ("div", {"class": re.compile(r"(entry-content|et_pb_post_content|post-content|project-content)", re.I)}),
        ("article", {"class": re.compile(r"(post|project|type-project|type-post)", re.I)}),
        ("div", {"id": re.compile(r"(main-content|content-area|primary)", re.I)}),
    ]
    for name, attrs in candidates:
        node = soup.find(name, attrs=attrs)
        if node:
            return node
    return soup.body or soup


def extract_indice_articoli(container: BeautifulSoup, page_url: str) -> List[Dict[str, str]]:
    """
    Extract the index of articles with title, author, and URL.
    Returns a list of dicts: [{"titolo": "...", "autore": "...", "url": "..."}]
    """
    articles = []
    seen_urls = set()

    # Find all links that look like article links
    for a in container.find_all("a", href=True):
        href = a["href"].strip()
        if not href:
            continue

        # Make absolute URL
        full_url = urljoin(page_url, href)

        # Skip non-article URLs
        if "ombreeluci.it" not in full_url:
            continue
        if any(x in full_url for x in ["/category/", "/tag/", "/author/", "/feed/",
                                         "/wp-content/", "/wp-json/", "/project/",
                                         "/archivio/", "/insieme/", "/chi-siamo/"]):
            continue

        # Match article pattern: /YYYY/slug/
        if not re.search(r"/(19\d{2}|20\d{2})/[^/]+/?$", full_url):
            continue

        # Skip duplicates
        if full_url in seen_urls:
            continue
        seen_urls.add(full_url)

        # Extract title from link text
        titolo = normalize_space(a.get_text(" "))
        if not titolo or len(titolo) < 3:
            # Try to get title from parent or nearby text
            parent = a.parent
            if parent:
                # Sometimes the title is in a surrounding element
                titolo = normalize_space(parent.get_text(" "))
                # Clean up if it includes other stuff
                if len(titolo) > 200:
                    titolo = normalize_space(a.get_text(" ")) or "Senza titolo"

        # Try to extract author
        # Common patterns: "di Nome Cognome", "Nome Cognome", text after em dash
        autore = ""

        # Check if the link text contains author after dash
        if " – " in titolo or " - " in titolo:
            parts = re.split(r"\s*[-–]\s*", titolo, maxsplit=1)
            if len(parts) == 2:
                # Usually format is "Title - Author" or "Title – Author"
                possible_author = parts[1].strip()
                # Check if it looks like an author name (not too long, starts with capital)
                if len(possible_author) < 50 and possible_author[0:1].isupper():
                    autore = possible_author
                    titolo = parts[0].strip()

        # Check parent/sibling elements for author
        if not autore:
            parent = a.parent
            if parent:
                # Look for text like "di Nome Cognome" nearby
                parent_text = normalize_space(parent.get_text(" "))
                m = re.search(r"\bdi\s+([A-Z][a-zàèéìòù]+(?:\s+[A-Z][a-zàèéìòù]+)+)", parent_text)
                if m:
                    autore = m.group(1)

        # Look for author in em or span after the link
        if not autore:
            next_sibling = a.find_next_sibling()
            if next_sibling:
                sib_text = normalize_space(next_sibling.get_text(" "))
                # Check for "di Author" pattern
                m = re.search(r"^di\s+(.+)$", sib_text, re.IGNORECASE)
                if m:
                    autore = m.group(1)

        articles.append({
            "titolo": titolo,
            "autore": autore,
            "url": full_url
        })

    return articles


def extract_archive_links(container: BeautifulSoup, urls: List[str]) -> Tuple[Optional[str], Optional[str]]:
    """Extract Archive.org view and download links."""
    link_sfoglia = None
    link_pdf = None

    for url in urls:
        if "archive.org/details/" in url:
            link_sfoglia = url
        elif "archive.org/download/" in url and url.lower().endswith(".pdf"):
            link_pdf = url

    # Also search in buttons/links with specific text
    for a in container.find_all("a", href=True):
        href = a["href"].strip()
        text = normalize_space(a.get_text(" ")).lower()

        if "sfoglia" in text and "archive.org" in href:
            link_sfoglia = href
        elif "pdf" in text and "archive.org" in href and href.lower().endswith(".pdf"):
            link_pdf = href
        elif "archive.org/details/" in href:
            link_sfoglia = href
        elif "archive.org/download/" in href and href.lower().endswith(".pdf"):
            link_pdf = href

    return link_sfoglia, link_pdf


def parse_numero(url: str) -> Optional[Dict]:
    """Parse a single issue page and extract all data."""
    try:
        html = fetch_html(url)
        soup = BeautifulSoup(html, "html.parser")
        meta = get_meta(soup)

        # Extract ID
        id_numero = extract_id_numero(url)

        # Extract title from h1
        h1 = soup.find("h1")
        titolo_ufficiale = normalize_space(h1.get_text(" ")) if h1 else meta.get("og:title", "")
        # Clean title from site suffix
        titolo_ufficiale = re.sub(r"\s*[-–|]\s*Ombre\s+e\s+Luci\s*$", "", titolo_ufficiale, flags=re.IGNORECASE)
        titolo_ufficiale = re.sub(r"\s*[-–|]\s*ombreeluci\.it\s*$", "", titolo_ufficiale, flags=re.IGNORECASE)
        titolo_ufficiale = normalize_space(titolo_ufficiale)

        # Extract meta description
        sommario_meta = meta.get("description", "") or meta.get("og:description", "")
        sommario_meta = normalize_space(sommario_meta)

        # Extract cover image
        copertina_url = meta.get("og:image", "")

        # Find main container
        container = find_main_container(soup)
        body_text = normalize_space(container.get_text(" "))

        # Extract publication date
        data_pubblicazione = extract_data_pubblicazione(soup, body_text)

        # Extract all URLs from container
        all_urls = []
        for a in container.find_all("a", href=True):
            href = a["href"].strip()
            if href.startswith("http"):
                all_urls.append(href)

        # Extract archive links
        link_sfoglia, link_pdf = extract_archive_links(container, all_urls)

        # Extract article index
        indice_articoli = extract_indice_articoli(container, url)

        return {
            "id_numero": id_numero,
            "titolo_ufficiale": titolo_ufficiale,
            "data_pubblicazione": data_pubblicazione,
            "sommario_meta": sommario_meta,
            "indice_articoli": indice_articoli,
            "link_sfoglia": link_sfoglia,
            "link_pdf": link_pdf,
            "copertina_url": copertina_url,
            "wp_url": url
        }

    except Exception as e:
        print(f"  ERROR parsing {url}: {type(e).__name__}: {e}", file=sys.stderr)
        return None


def main() -> int:
    ap = argparse.ArgumentParser(description="Generate complete database of magazine issues")
    ap.add_argument("--urls-file",
                    default=r"C:\Users\berto\Documents\Ombreeluci\_migration_archive\inputs\urls_numeri_all.txt",
                    help="File with URLs, one per line")
    ap.add_argument("--output",
                    default=r"C:\Users\berto\Documents\Ombreeluci\scripts_and_data\database_numeri_completo.json",
                    help="Output JSON file")
    ap.add_argument("--batch-size", type=int, default=20,
                    help="Process in batches of N to avoid timeouts")
    ap.add_argument("--delay", type=float, default=0.5,
                    help="Delay between requests in seconds")
    ap.add_argument("--start", type=int, default=0,
                    help="Start from URL index N (for resuming)")
    args = ap.parse_args()

    # Load URLs
    urls = []
    with open(args.urls_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                urls.append(line)

    print(f"Loaded {len(urls)} URLs from {args.urls_file}")

    # Load existing data if resuming
    results = []
    if args.start > 0 and os.path.exists(args.output):
        with open(args.output, "r", encoding="utf-8") as f:
            results = json.load(f)
        print(f"Resuming from index {args.start}, loaded {len(results)} existing entries")

    # Process URLs
    total = len(urls)
    for i, url in enumerate(urls[args.start:], start=args.start):
        batch_num = (i // args.batch_size) + 1
        in_batch = (i % args.batch_size) + 1

        print(f"[{i+1}/{total}] (batch {batch_num}, item {in_batch}/{args.batch_size}) Processing: {url}")

        data = parse_numero(url)
        if data:
            # Count articles
            n_articoli = len(data.get("indice_articoli", []))
            print(f"  -> {data['id_numero']}: \"{data['titolo_ufficiale'][:50]}...\" | {n_articoli} articoli")
            results.append(data)
        else:
            print(f"  -> SKIPPED (error)")

        # Save checkpoint every batch
        if (i + 1) % args.batch_size == 0 or i == total - 1:
            with open(args.output, "w", encoding="utf-8") as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            print(f"  [CHECKPOINT] Saved {len(results)} entries to {args.output}")

        # Delay to be polite
        if i < total - 1:
            time.sleep(args.delay)

    # Final save
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\nDone! Saved {len(results)} entries to {args.output}")

    # Summary stats
    total_articoli = sum(len(x.get("indice_articoli", [])) for x in results)
    ins = sum(1 for x in results if x["id_numero"].startswith("INS"))
    oel = sum(1 for x in results if x["id_numero"].startswith("OEL"))

    print(f"\nSummary:")
    print(f"  - Insieme: {ins} numeri")
    print(f"  - Ombre e Luci: {oel} numeri")
    print(f"  - Total articles indexed: {total_articoli}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
