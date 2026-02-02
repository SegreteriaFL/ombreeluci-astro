# COMMIT: AI OEL - Estrazione numeri rivista definitiva: meta-first, seo_description, split descrizione/indice, CSV+QA separati, writer robusto
# Script: estrai_numeri_rivista.py
#
# Input:
#   - --urls-file: file txt con una URL per riga (pagine /project/numero-... e /project/insieme-n-...)
#   - oppure --urls: lista URL in linea
#
# Output:
#   - numeri_rivista.json           (dataset completo)
#   - numeri_rivista.csv            (flat CSV del dataset)
#   - numeri_rivista_debug.txt      (debug leggibile per controllo)
#   - quality_report.csv            (report diagnostico per resolver Archive e incongruenze)
#
# Note di progetto:
#   - Meta-first: usa og:title, og:description, og:image, og:url (Yoast) quando disponibili.
#   - seo_description: salvata (anche se sarà rivista).
#   - descrizione_originale: estratta dal body solo se breve e sensata (altrimenti None).
#   - articoli_ids: NON dedotti dagli URL (evita falsi positivi come anni). Join URL->id_articolo in step successivo.
#   - extrasaction="ignore": impedisce crash se un dict contiene campi extra non previsti dai fieldnames (iterazioni future).
#
# Requisiti:
#   pip install requests beautifulsoup4
#   (su Windows: python -m pip install ...)

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
from dataclasses import asdict, dataclass, field
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup


MESI = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
]
MESI_RE = "(" + "|".join(MESI) + ")"


@dataclass
class NumeroRivista:
    id_numero: str
    tipo_rivista: str  # "ombre_e_luci" | "insieme"
    numero_progressivo: Optional[int]

    display_title: Optional[str]         # es: "Numero 146 – Jean Vanier"
    titolo_numero: Optional[str]         # es: "Jean Vanier" (senza prefisso)
    seo_description: Optional[str]       # da og:description (ripulita)
    descrizione_originale: Optional[str] # da body (se esiste un intro breve)
    descrizione_ai: Optional[str]        # futuro

    anno_pubblicazione: Optional[int]
    anno_collezione: Optional[int]       # futuro / regola da definire
    periodicita: Optional[str]
    periodo_label: Optional[str]

    copertina_url: Optional[str]
    wp_url_numero: str
    canonical_url: Optional[str]

    archive_org_item_id: Optional[str]
    archive_view_url: Optional[str]
    archive_download_pdf_url: Optional[str]

    articoli_ids: List[str] = field(default_factory=list)  # per ora vuoto
    articoli_urls: List[str] = field(default_factory=list)

    issues: List[str] = field(default_factory=list)


# -------------------------
# Utility
# -------------------------

def normalize_space(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "")).strip()


def strip_site_suffix(title: str) -> str:
    t = normalize_space(title)
    t = re.sub(r"\s*[-–|]\s*Ombre\s+e\s+Luci\s*$", "", t, flags=re.IGNORECASE)
    t = re.sub(r"\s*[-–|]\s*ombreeluci\.it\s*$", "", t, flags=re.IGNORECASE)
    return normalize_space(t)


def fetch_html(url: str, timeout: int = 30) -> str:
    headers = {"User-Agent": "Mozilla/5.0 (compatible; AI-OEL/1.0)"}
    r = requests.get(url, headers=headers, timeout=timeout)
    r.raise_for_status()
    return r.text


def get_meta(soup: BeautifulSoup) -> Dict[str, str]:
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


# -------------------------
# Parsing regole (stabili)
# -------------------------

def infer_tipo_rivista(url: str) -> str:
    slug = urlparse(url).path.lower()
    if "insieme-n-" in slug:
        return "insieme"
    return "ombre_e_luci"


def extract_numero_progressivo(url: str) -> Optional[int]:
    slug = urlparse(url).path.lower()
    m = re.search(r"/numero-(\d{1,4})-", slug)
    if m:
        return int(m.group(1))
    m = re.search(r"/insieme-n-(\d{1,4})-", slug)
    if m:
        return int(m.group(1))
    m = re.search(r"(?:numero|insieme-n)-(\d{1,4})", slug)
    if m:
        return int(m.group(1))
    return None


def extract_display_title(soup: BeautifulSoup, meta: Dict[str, str]) -> Optional[str]:
    # meta-first
    if meta.get("og:title"):
        t = strip_site_suffix(meta["og:title"])
        return t or None
    if soup.title and soup.title.string:
        t = strip_site_suffix(soup.title.string)
        return t or None
    # last resort
    h1 = soup.find("h1")
    if h1:
        t = normalize_space(h1.get_text(" "))
        return t or None
    return None


def clean_yoast_description(s: str) -> str:
    s = normalize_space(s)
    # rimuove coda tecnica Yoast ("ultima modifica...", "da ...")
    s = re.sub(r"\s+ultima\s+modifica:.*$", "", s, flags=re.IGNORECASE)
    s = re.sub(r"\s+da\s+.*$", "", s, flags=re.IGNORECASE)
    return normalize_space(s)


def extract_seo_description(meta: Dict[str, str]) -> Optional[str]:
    if meta.get("og:description"):
        d = clean_yoast_description(meta["og:description"])
        return d or None
    if meta.get("description"):
        d = normalize_space(meta["description"])
        return d or None
    return None


def extract_cover(meta: Dict[str, str], soup: BeautifulSoup) -> Optional[str]:
    if meta.get("og:image"):
        return meta["og:image"]
    img = soup.find("img")
    if img and img.get("src"):
        return img["src"]
    return None


def split_titolo_numero(display_title: Optional[str]) -> Optional[str]:
    if not display_title:
        return None
    t = display_title
    t = re.sub(r"^\s*Numero\s+\d+\s*[-–]\s*", "", t, flags=re.IGNORECASE)
    t = re.sub(r"^\s*Insieme\s*(?:n\.?|n)\s*\d+\s*[-–]\s*", "", t, flags=re.IGNORECASE)
    return normalize_space(t) or None


def find_main_container(soup: BeautifulSoup) -> BeautifulSoup:
    candidates = [
        ("div", {"class": re.compile(r"(entry-content|et_pb_post_content|post-content|project-content)", re.I)}),
        ("article", {"class": re.compile(r"(post|project|type-project|type-post|et_pb_post)", re.I)}),
        ("div", {"id": re.compile(r"(main-content|content-area|primary)", re.I)}),
    ]
    for name, attrs in candidates:
        node = soup.find(name, attrs=attrs)
        if node:
            return node
    return soup.body or soup


def extract_text_and_links(container: BeautifulSoup) -> Tuple[str, List[str]]:
    text = normalize_space(container.get_text(" "))
    urls: List[str] = []
    for a in container.find_all("a", href=True):
        href = a["href"].strip()
        if href.startswith("http"):
            urls.append(href)

    seen = set()
    out: List[str] = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            out.append(u)
    return text, out


def guess_periodicita_periodo(text: str) -> Tuple[Optional[str], Optional[str], Optional[int]]:
    periodicita = None
    periodo = None
    anno = None

    m = re.search(r"\b(Trimestrale|Bimestrale|Mensile|Semestrale|Annuale)\b", text, flags=re.IGNORECASE)
    if m:
        periodicita = m.group(1).lower()

    m = re.search(r"\b(19\d{2}|20\d{2})\b", text)
    if m:
        anno = int(m.group(1))

    # Pattern stretti e affidabili
    m = re.search(rf"\b{MESI_RE}\b\s*[–-]\s*\b{MESI_RE}\b", text)
    if m:
        periodo = normalize_space(m.group(0))
        return periodicita, periodo, anno

    m = re.search(rf"\b{MESI_RE}\b\s*,\s*\b{MESI_RE}\b(?:\s*,\s*\b{MESI_RE}\b)?", text)
    if m:
        periodo = normalize_space(m.group(0))
        return periodicita, periodo, anno

    m = re.search(rf"\b{MESI_RE}\b\s+\b(19\d{{2}}|20\d{{2}})\b", text)
    if m:
        periodo = normalize_space(m.group(0))
        if anno is None:
            anno = int(m.group(2))
        return periodicita, periodo, anno

    return periodicita, None, anno


def extract_archive_org(urls: List[str]) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    item_id = None
    view_url = None
    dl_url = None

    for u in urls:
        if "archive.org/details/" in u:
            view_url = u
            m = re.search(r"archive\.org/details/([^/?#]+)", u)
            if m:
                item_id = m.group(1)

        if "archive.org/download/" in u and u.lower().endswith(".pdf"):
            dl_url = u
            m = re.search(r"archive\.org/download/([^/]+)/", u)
            if m and not item_id:
                item_id = m.group(1)

    if item_id and not view_url:
        view_url = f"https://archive.org/details/{item_id}"
    return item_id, view_url, dl_url


def is_probable_article_url(u: str) -> bool:
    if "ombreeluci.it" not in u:
        return False
    if any(x in u for x in ["/category/", "/tag/", "/author/", "/feed/", "/wp-content/", "/wp-json/"]):
        return False
    if "/project/" in u:
        return False
    # pattern tipico articolo: /YYYY/slug/
    return bool(re.search(r"/(19\d{2}|20\d{2})/[^/]+/?$", u))


def split_descrizione_vs_indice(text: str, urls: List[str]) -> Tuple[Optional[str], List[str]]:
    articoli_urls = [u for u in urls if is_probable_article_url(u)]

    descr = text
    cut = None
    for token in ["In questo numero", "Indice", "Sfoglia il numero", "Scarica pdf"]:
        m = re.search(rf"\b{re.escape(token)}\b", descr, flags=re.IGNORECASE)
        if m:
            cut = m.start() if cut is None else min(cut, m.start())
    if cut is not None:
        descr = descr[:cut]
    descr = normalize_space(descr)

    if not descr or len(descr) < 40:
        descr_out = None
    else:
        # limite per evitare blob
        descr_out = descr[:1200].rstrip() + ("…" if len(descr) > 1200 else "")

    seen = set()
    articoli_unique: List[str] = []
    for u in articoli_urls:
        if u not in seen:
            seen.add(u)
            articoli_unique.append(u)

    return descr_out, articoli_unique


def build_id_numero(tipo: str, nprog: Optional[int], wp_url: str) -> str:
    if nprog is not None:
        prefix = "OEL" if tipo == "ombre_e_luci" else "INS"
        return f"{prefix}-{nprog}"
    slug = urlparse(wp_url).path.rstrip("/").split("/")[-1]
    prefix = "OEL" if tipo == "ombre_e_luci" else "INS"
    return f"{prefix}-{slug}"


def validate_inconsistencies(
    nprog: Optional[int],
    display_title: Optional[str],
    canonical_url: Optional[str],
    archive_item_id: Optional[str],
    articoli_urls: List[str],
    periodo_label: Optional[str],
) -> List[str]:
    issues: List[str] = []

    if nprog is None:
        issues.append("numero_progressivo_non_deducibile_da_slug")
    if not display_title:
        issues.append("display_title_mancante_meta_title")

    if not archive_item_id:
        issues.append("archive_org_item_id_mancante")
    elif len(archive_item_id) < 5:
        issues.append("archive_org_item_id_troppo_corto")

    if len(articoli_urls) == 0:
        issues.append("indice_articoli_vuoto")

    if periodo_label and len(periodo_label) > 60:
        issues.append("periodo_label_sospetto_troppo_lungo")

    if canonical_url and not canonical_url.startswith("http"):
        issues.append("canonical_url_strana")

    return issues


# -------------------------
# Core parsing
# -------------------------

def parse_numero(url: str, debug: List[str]) -> NumeroRivista:
    html = fetch_html(url)
    soup = BeautifulSoup(html, "html.parser")
    meta = get_meta(soup)

    tipo = infer_tipo_rivista(url)
    nprog = extract_numero_progressivo(url)

    display_title = extract_display_title(soup, meta)
    seo_desc = extract_seo_description(meta)
    canonical_url = meta.get("og:url") or meta.get("canonical") or None
    copertina = extract_cover(meta, soup)

    container = find_main_container(soup)
    text, urls = extract_text_and_links(container)

    periodicita, periodo_label, anno_pub = guess_periodicita_periodo(text)
    descrizione_originale, articoli_urls = split_descrizione_vs_indice(text, urls)

    archive_item, archive_view, archive_dl = extract_archive_org(urls)

    titolo_numero = split_titolo_numero(display_title)
    id_numero = build_id_numero(tipo, nprog, url)

    issues = validate_inconsistencies(
        nprog=nprog,
        display_title=display_title,
        canonical_url=canonical_url,
        archive_item_id=archive_item,
        articoli_urls=articoli_urls,
        periodo_label=periodo_label,
    )

    debug.append(f"URL: {url}")
    debug.append(f"  display_title(meta): {display_title}")
    debug.append(f"  titolo_numero: {titolo_numero}")
    debug.append(f"  tipo_rivista: {tipo}")
    debug.append(f"  numero_progressivo: {nprog}")
    debug.append(f"  seo_description: {seo_desc}")
    debug.append(f"  descrizione_originale_len: {len(descrizione_originale) if descrizione_originale else 0}")
    debug.append(f"  anno_pubblicazione_guess: {anno_pub}")
    debug.append(f"  periodicita_guess: {periodicita}")
    debug.append(f"  periodo_label_guess: {periodo_label}")
    debug.append(f"  canonical_url: {canonical_url}")
    debug.append(f"  copertina_url: {copertina}")
    debug.append(f"  archive_item_id: {archive_item}")
    debug.append(f"  articoli_urls_count: {len(articoli_urls)}")
    debug.append(f"  issues: {', '.join(issues) if issues else 'none'}")
    debug.append("")

    return NumeroRivista(
        id_numero=id_numero,
        tipo_rivista=tipo,
        numero_progressivo=nprog,
        display_title=display_title,
        titolo_numero=titolo_numero,
        seo_description=seo_desc,
        descrizione_originale=descrizione_originale,
        descrizione_ai=None,
        anno_pubblicazione=anno_pub,
        anno_collezione=None,
        periodicita=periodicita,
        periodo_label=periodo_label,
        copertina_url=copertina,
        wp_url_numero=url,
        canonical_url=canonical_url,
        archive_org_item_id=archive_item,
        archive_view_url=archive_view,
        archive_download_pdf_url=archive_dl,
        articoli_ids=[],
        articoli_urls=articoli_urls,
        issues=issues,
    )


# -------------------------
# Writers
# -------------------------

def write_json(path: str, items: List[NumeroRivista]) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump([asdict(x) for x in items], f, ensure_ascii=False, indent=2)


def write_csv(path: str, items: List[NumeroRivista]) -> None:
    # CSV principale: solo campi dataset
    fields = [
        "id_numero",
        "tipo_rivista",
        "numero_progressivo",
        "display_title",
        "titolo_numero",
        "seo_description",
        "descrizione_originale",
        "anno_pubblicazione",
        "anno_collezione",
        "periodicita",
        "periodo_label",
        "copertina_url",
        "wp_url_numero",
        "canonical_url",
        "archive_org_item_id",
        "archive_view_url",
        "archive_download_pdf_url",
        "articoli_ids",
        "articoli_urls",
        "issues",
    ]
    with open(path, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        for it in items:
            d = asdict(it)
            d["articoli_ids"] = "|".join(d["articoli_ids"] or [])
            d["articoli_urls"] = "|".join(d["articoli_urls"] or [])
            d["issues"] = "|".join(d["issues"] or [])
            w.writerow(d)


def write_quality_report(path: str, items: List[NumeroRivista]) -> None:
    # CSV diagnostico: per resolver Archive e QA
    fields = [
        "id_numero",
        "wp_url_numero",
        "tipo_rivista",
        "numero_progressivo",
        "display_title",
        "anno_pubblicazione_guess",
        "archive_org_item_id",
        "articoli_urls_count",
        "has_seo_description",
        "has_descrizione_originale",
        "issues",
    ]
    with open(path, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        for it in items:
            w.writerow({
                "id_numero": it.id_numero,
                "wp_url_numero": it.wp_url_numero,
                "tipo_rivista": it.tipo_rivista,
                "numero_progressivo": it.numero_progressivo,
                "display_title": it.display_title,
                "anno_pubblicazione_guess": it.anno_pubblicazione,
                "archive_org_item_id": it.archive_org_item_id,
                "articoli_urls_count": len(it.articoli_urls),
                "has_seo_description": bool(it.seo_description),
                "has_descrizione_originale": bool(it.descrizione_originale),
                "issues": "|".join(it.issues or []),
            })


# -------------------------
# Main
# -------------------------

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--urls", nargs="*", help="Lista URL pagine numero")
    ap.add_argument("--urls-file", help="File txt con una URL per riga")
    ap.add_argument("--out-json", default="numeri_rivista.json")
    ap.add_argument("--out-csv", default="numeri_rivista.csv")
    ap.add_argument("--out-debug", default="numeri_rivista_debug.txt")
    ap.add_argument("--out-quality", default="quality_report.csv")
    ap.add_argument("--print-path", action="store_true", help="Stampa il path del file eseguito")
    args = ap.parse_args()

    if args.print_path:
        print("RUNNING:", os.path.abspath(__file__))

    urls: List[str] = []
    if args.urls_file:
        with open(args.urls_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    urls.append(line)
    if args.urls:
        urls.extend(args.urls)

    urls = [u.strip() for u in urls if u.strip()]
    if not urls:
        print("Nessuna URL fornita. Usa --urls o --urls-file.", file=sys.stderr)
        return 2

    debug: List[str] = []
    items: List[NumeroRivista] = []

    for u in urls:
        try:
            items.append(parse_numero(u, debug))
        except Exception as e:
            debug.append(f"URL: {u}")
            debug.append(f"  ERROR: {type(e).__name__}: {e}")
            debug.append("")

    write_json(args.out_json, items)
    write_csv(args.out_csv, items)
    write_quality_report(args.out_quality, items)

    with open(args.out_debug, "w", encoding="utf-8") as f:
        f.write("\n".join(debug))

    print(f"OK. Scritti: {args.out_json}, {args.out_csv}, {args.out_debug}, {args.out_quality}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
