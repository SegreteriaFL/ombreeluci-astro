# COMMIT: AI OEL - Raccolta URL numeri (OeL + Insieme) da pagine indice /archivio e /insieme con dedup e filtri
# Script: raccogli_urls_numeri.py
#
# Input:
#   - --index: una o più pagine indice (es. https://www.ombreeluci.it/archivio/ https://www.ombreeluci.it/insieme/)
# Output:
#   - urls_numeri_all.txt (una URL per riga, deduplicata e ordinata)
#   - opzionale: report console con conteggi
#
# Note:
#   - Estrae solo link /project/numero-... e /project/insieme-n-...
#   - Supporta paginazione se presente (rel=next, "successivo", "»", o link con page/paged)
#   - Limite max pagine per indice (safety) con --max-pages

from __future__ import annotations

import argparse
import re
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


UA = {"User-Agent": "Mozilla/5.0 (compatible; AI-OEL/1.0)"}

RE_ABS_NUMERO = re.compile(r"^https?://www\.ombreeluci\.it/project/numero-\d{1,4}-", re.IGNORECASE)
RE_ABS_INSIEME = re.compile(r"^https?://www\.ombreeluci\.it/project/insieme-n-\d{1,4}-", re.IGNORECASE)

RE_REL_NUMERO = re.compile(r"^/project/numero-\d{1,4}-", re.IGNORECASE)
RE_REL_INSIEME = re.compile(r"^/project/insieme-n-\d{1,4}-", re.IGNORECASE)

RE_PAGINATION_HINT = re.compile(r"(page|paged|pagina|pg)=", re.IGNORECASE)


def fetch(url: str, timeout: int = 30) -> str:
    r = requests.get(url, headers=UA, timeout=timeout)
    r.raise_for_status()
    return r.text


def is_numero_link(href: str) -> bool:
    if RE_ABS_NUMERO.match(href) or RE_ABS_INSIEME.match(href):
        return True
    if RE_REL_NUMERO.match(href) or RE_REL_INSIEME.match(href):
        return True
    return False


def is_pagination_link(a_tag, full_url: str) -> bool:
    # rel next
    rel = a_tag.get("rel") or []
    if isinstance(rel, str):
        rel = [rel]
    rel = [x.lower() for x in rel]
    if "next" in rel:
        return True

    # testo anchor
    text = (a_tag.get_text(" ") or "").strip().lower()
    if text in {"next", "successivo", ">", "»", "avanti"}:
        return True

    # hint nell'url
    if RE_PAGINATION_HINT.search(full_url):
        return True

    return False


def extract_from_page(page_url: str, html: str) -> tuple[list[str], list[str]]:
    soup = BeautifulSoup(html, "html.parser")

    found_nums: list[str] = []
    next_pages: list[str] = []

    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if not href:
            continue

        full = urljoin(page_url, href)

        if is_numero_link(href) or is_numero_link(full):
            found_nums.append(full)

        if "ombreeluci.it" in full and is_pagination_link(a, full):
            next_pages.append(full)

    # dedupe preservando ordine
    def dedupe(lst: list[str]) -> list[str]:
        seen = set()
        out = []
        for x in lst:
            if x not in seen:
                seen.add(x)
                out.append(x)
        return out

    return dedupe(found_nums), dedupe(next_pages)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--index",
        nargs="+",
        required=True,
        help="URL pagine indice, es: https://www.ombreeluci.it/archivio/ https://www.ombreeluci.it/insieme/",
    )
    ap.add_argument("--out", default="urls_numeri_all.txt", help="File output (txt)")
    ap.add_argument("--max-pages", type=int, default=50, help="Max pagine da seguire per ciascun indice (safety)")
    args = ap.parse_args()

    all_urls: list[str] = []
    visited: set[str] = set()

    for start in args.index:
        queue = [start]
        pages = 0

        while queue and pages < args.max_pages:
            page = queue.pop(0)
            if page in visited:
                continue
            visited.add(page)
            pages += 1

            html = fetch(page)
            found, nexts = extract_from_page(page, html)
            all_urls.extend(found)

            for n in nexts:
                if n not in visited:
                    queue.append(n)

    deduped_sorted = sorted(set(all_urls))

    with open(args.out, "w", encoding="utf-8") as f:
        for u in deduped_sorted:
            f.write(u + "\n")

    oel = sum(1 for u in deduped_sorted if "/project/numero-" in u)
    ins = sum(1 for u in deduped_sorted if "/project/insieme-n-" in u)

    print(f"OK. Trovate {len(deduped_sorted)} URL numeri totali.")
    print(f" - Ombre e Luci: {oel}")
    print(f" - Insieme:      {ins}")
    print(f"Salvate in: {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
