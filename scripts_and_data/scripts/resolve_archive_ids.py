# COMMIT: AI OEL - Resolver Archive.org numeri rivista: fix wildcard, match esatto + filtro numero da identifier, report stabile
# Script: resolve_archive_ids.py
#
# Input:
#   - numeri_wp.json
#
# Output:
#   - numeri_wp_resolved.json
#   - resolve_report.csv
#   - resolve_debug.txt
#
# Fix principale:
#   - Evita query tipo identifier:OmbreELuciN_1* che matcha 115, 124...
#   - 1) tenta identifier esatti
#   - 2) fallback wildcard ma filtra i candidati verificando che il numero estratto dall'identifier == numero_progressivo

from __future__ import annotations

import argparse
import csv
import json
import re
import time
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

import requests


ADV_SEARCH = "https://archive.org/advancedsearch.php"
META_API = "https://archive.org/metadata/{identifier}"

UA = {"User-Agent": "Mozilla/5.0 (compatible; AI-OEL/1.0)"}


@dataclass
class ResolveResult:
    id_numero: str
    wp_url_numero: str
    tipo_rivista: str
    numero_progressivo: Optional[int]
    display_title: Optional[str]
    status: str  # resolved | ambiguous | not_found | error | skipped
    chosen_identifier: Optional[str]
    chosen_pdf: Optional[str]
    candidates: str
    reason: str


def http_get_json(url: str, params: Dict[str, Any], timeout: int = 20) -> Dict[str, Any]:
    r = requests.get(url, params=params, headers=UA, timeout=timeout)
    r.raise_for_status()
    return r.json()


def adv_search(q: str, fields: List[str], rows: int = 50, timeout: int = 20) -> List[Dict[str, Any]]:
    params = {
        "q": q,
        "fl[]": fields,
        "rows": rows,
        "page": 1,
        "output": "json",
    }
    data = http_get_json(ADV_SEARCH, params=params, timeout=timeout)
    resp = data.get("response", {})
    return resp.get("docs", []) or []


def fetch_metadata(identifier: str, timeout: int = 20) -> Optional[Dict[str, Any]]:
    url = META_API.format(identifier=identifier)
    try:
        r = requests.get(url, headers=UA, timeout=timeout)
        if r.status_code == 404:
            return None
        r.raise_for_status()
        return r.json()
    except Exception:
        return None


def creator_ok(doc: Dict[str, Any]) -> bool:
    c = doc.get("creator")
    if isinstance(c, list):
        c = " ".join(c)
    c = (c or "").lower()
    return ("ombre e luci" in c) or ("ombre" in c and "luci" in c)


def extract_num_from_identifier(ident: str) -> Optional[int]:
    """
    Estrae un numero "probabile" dall'identifier, gestendo varianti note.
    Esempi:
      OmbreELuciN_146 -> 146
      OmbreELuci_32   -> 32
      OmbreELuci130   -> 130
      OmbreELuci_001  -> 1 (zero-padded)
      OmbreELuciN004  -> 4 (N senza underscore)
      OmbreELuci_010_201712 -> 10 (con suffisso data)
      https://archive.org/details/OmbreELuci_009 -> 9 (da URL)
      insieme-27      -> 27
      insieme-n.-7    -> 7
    """
    s = ident.strip()
    
    # Se è una URL di archive.org, estrai l'identifier finale
    if "archive.org/details/" in s:
        s = s.split("archive.org/details/")[-1].split("/")[0].split("?")[0]

    # Pattern per OmbreELuciN con underscore o senza (es. N_146, N146, N004)
    m = re.search(r"OmbreELuciN[_\-]?(\d{1,4})", s, re.IGNORECASE)
    if m:
        return int(m.group(1))

    # Pattern per OmbreELuci con underscore e zero-padding o suffisso data (es. _001, _010_201712)
    m = re.search(r"OmbreELuci[_\-](\d{1,4})(?:_\d+)?(?:\D|$)", s, re.IGNORECASE)
    if m:
        return int(m.group(1))

    # Pattern per OmbreELuci senza underscore (es. OmbreELuci130)
    m = re.search(r"OmbreELuci(\d{1,4})(?:\D|$)", s, re.IGNORECASE)
    if m:
        return int(m.group(1))

    m = re.search(r"\binsieme[-_ ]n\.?[-_ ]?(\d{1,4})\b", s, re.IGNORECASE)
    if m:
        return int(m.group(1))

    m = re.search(r"\binsieme[-_ ](\d{1,4})\b", s, re.IGNORECASE)
    if m:
        return int(m.group(1))

    return None


def pick_pdf_from_metadata(md: Dict[str, Any], tipo: str, nprog: Optional[int]) -> Optional[str]:
    files = md.get("files", []) or []
    pdfs = [f for f in files if str(f.get("name", "")).lower().endswith(".pdf")]
    if not pdfs:
        return None

    def score(f: Dict[str, Any]) -> int:
        name = str(f.get("name", "")).lower()
        s = 0
        if nprog is not None:
            if str(nprog) in name:
                s += 10
            if tipo == "ombre_e_luci" and (f"oel-{nprog}" in name or f"oel_{nprog}" in name):
                s += 15
            if tipo == "insieme" and (f"insieme-{nprog}" in name or f"insieme_{nprog}" in name):
                s += 15
        return s

    pdfs_sorted = sorted(pdfs, key=score, reverse=True)
    return str(pdfs_sorted[0].get("name"))


def build_exact_identifiers(tipo: str, n: int) -> List[str]:
    if tipo == "ombre_e_luci":
        # tentativi esatti più comuni
        ids = [
            f"OmbreELuciN_{n}",
            f"OmbreELuciN{n}",
            f"OmbreELuci_{n}",
            f"OmbreELuci{n}",
            f"OmbreeLuci_{n}",  # varianti viste (case/typo)
            f"OmbreeLuci{n}",
        ]
        # Aggiungi versioni zero-padded a 3 cifre (001, 002...)
        if n < 1000:
            n_padded = f"{n:03d}"
            ids.extend([
                f"OmbreELuciN_{n_padded}",
                f"OmbreELuciN{n_padded}",
                f"OmbreELuci_{n_padded}",
            ])
        return ids
    else:
        return [
            f"insieme-{n}",
            f"insieme-n-{n}",
            f"insieme-n.-{n}",
            f"insieme-n.{n}",
            f"insieme_{n}",
        ]


def build_wildcard_prefixes(tipo: str, n: int) -> List[str]:
    if tipo == "ombre_e_luci":
        # prefissi per fallback; verranno filtrati poi dal numero estratto
        return [
            f"OmbreELuciN_{n}",
            f"OmbreELuci_{n}",
            f"OmbreELuci{n}",
            f"OmbreeLuci_{n}",
            f"OmbreeLuci{n}",
        ]
    else:
        return [
            f"insieme-{n}",
            f"insieme-n-{n}",
            f"insieme-n.-{n}",
            f"insieme_{n}",
        ]


def resolve_one(item: Dict[str, Any], sleep_s: float = 0.25) -> ResolveResult:
    id_numero = item.get("id_numero")
    wp_url = item.get("wp_url_numero")
    tipo = item.get("tipo_rivista")
    nprog = item.get("numero_progressivo")
    display_title = item.get("display_title")

    if item.get("archive_org_item_id"):
        return ResolveResult(id_numero, wp_url, tipo, nprog, display_title, "skipped", item.get("archive_org_item_id"), None, "", "already_has_id")

    if nprog is None:
        return ResolveResult(id_numero, wp_url, tipo, nprog, display_title, "not_found", None, None, "", "no_numero_progressivo")

    fields = ["identifier", "title", "creator", "mediatype"]

    # 1) MATCH ESATTO (niente wildcard)
    exact_ids = build_exact_identifiers(tipo, nprog)
    q_exact = " OR ".join([f'identifier:"{x}"' for x in exact_ids])
    q1 = f"({q_exact})"

    try:
        docs = adv_search(q=q1, fields=fields, rows=50)
        time.sleep(sleep_s)
    except Exception as e:
        return ResolveResult(id_numero, wp_url, tipo, nprog, display_title, "error", None, None, "", f"adv_search_exact_error:{type(e).__name__}")

    # filtro grossolano creator (se presente nei docs)
    if docs:
        docs = [d for d in docs if creator_ok(d) or True]  # non bloccare qui: useremo metadata

    candidates = []
    for d in docs:
        ident = d.get("identifier")
        if ident:
            candidates.append(str(ident))

    # Valuta con metadata
    evaluated: List[Tuple[str, Optional[str], int]] = []
    for ident in candidates:
        md = fetch_metadata(ident)
        time.sleep(sleep_s)
        if not md:
            continue
        pdfname = pick_pdf_from_metadata(md, tipo=tipo, nprog=nprog)
        if not pdfname:
            continue
        # score forte: exact match
        evaluated.append((ident, pdfname, 100))

    if len(evaluated) == 1:
        chosen_id, chosen_pdf, _ = evaluated[0]
        item["archive_org_item_id"] = chosen_id
        item["archive_view_url"] = f"https://archive.org/details/{chosen_id}"
        item["archive_download_pdf_url"] = f"https://archive.org/download/{chosen_id}/{chosen_pdf}"
        return ResolveResult(id_numero, wp_url, tipo, nprog, display_title, "resolved", chosen_id, chosen_pdf, chosen_id, "exact_match")

    if len(evaluated) > 1:
        # raro, ma segnalo
        return ResolveResult(id_numero, wp_url, tipo, nprog, display_title, "ambiguous", None, None, "|".join([e[0] for e in evaluated]), "multiple_exact_matches")

    # 2) FALLBACK WILDCARD + FILTRO NUMERO
    prefixes = build_wildcard_prefixes(tipo, nprog)
    q_w = " OR ".join([f'identifier:{p}*' for p in prefixes])
    q2 = f"({q_w})"

    try:
        docs = adv_search(q=q2, fields=fields, rows=200)
        time.sleep(sleep_s)
    except Exception as e:
        return ResolveResult(id_numero, wp_url, tipo, nprog, display_title, "error", None, None, "", f"adv_search_wildcard_error:{type(e).__name__}")

    # filtra: numero estratto dall'identifier deve essere esattamente nprog
    cand2 = []
    for d in docs:
        ident = d.get("identifier")
        if not ident:
            continue
        ident = str(ident)
        num = extract_num_from_identifier(ident)
        if num == nprog:
            cand2.append(ident)

    if not cand2:
        return ResolveResult(id_numero, wp_url, tipo, nprog, display_title, "not_found", None, None, "", "no_candidates_after_filter")

    evaluated2: List[Tuple[str, Optional[str], int]] = []
    for ident in cand2:
        md = fetch_metadata(ident)
        time.sleep(sleep_s)
        if not md:
            continue
        pdfname = pick_pdf_from_metadata(md, tipo=tipo, nprog=nprog)
        if not pdfname:
            continue
        # score: match numero verificato
        evaluated2.append((ident, pdfname, 80))

    if len(evaluated2) == 1:
        chosen_id, chosen_pdf, _ = evaluated2[0]
        item["archive_org_item_id"] = chosen_id
        item["archive_view_url"] = f"https://archive.org/details/{chosen_id}"
        item["archive_download_pdf_url"] = f"https://archive.org/download/{chosen_id}/{chosen_pdf}"
        return ResolveResult(id_numero, wp_url, tipo, nprog, display_title, "resolved", chosen_id, chosen_pdf, chosen_id, "wildcard_filtered_single")

    # Se più candidati con PDF, resta ambiguous (ma ora è “vero ambiguous”, non falsi positivi)
    if evaluated2:
        return ResolveResult(
            id_numero, wp_url, tipo, nprog, display_title,
            "ambiguous", None, None,
            "|".join([e[0] for e in evaluated2[:20]]),
            "multiple_filtered_candidates"
        )

    return ResolveResult(id_numero, wp_url, tipo, nprog, display_title, "not_found", None, None, "|".join(cand2[:20]), "candidates_no_pdf")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--in-json", default="numeri_wp.json")
    ap.add_argument("--out-json", default="numeri_wp_resolved.json")
    ap.add_argument("--out-report", default="resolve_report.csv")
    ap.add_argument("--out-debug", default="resolve_debug.txt")
    ap.add_argument("--sleep", type=float, default=0.25)
    args = ap.parse_args()

    with open(args.in_json, "r", encoding="utf-8") as f:
        items: List[Dict[str, Any]] = json.load(f)

    todo = [it for it in items if not it.get("archive_org_item_id")]
    total = len(todo)

    debug_lines: List[str] = []
    results: List[ResolveResult] = []

    debug_lines.append(f"Totale items: {len(items)}")
    debug_lines.append(f"Missing archive_org_item_id: {total}")
    debug_lines.append("")

    for idx, it in enumerate(todo, start=1):
        print(f"[{idx}/{total}] resolving {it.get('id_numero')} ...", flush=True)
        res = resolve_one(it, sleep_s=args.sleep)
        results.append(res)
        debug_lines.append(
            f"{res.id_numero} | {res.status} | chosen={res.chosen_identifier or ''} | reason={res.reason} | candidates={res.candidates}"
        )

    with open(args.out_json, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    fields = ["id_numero", "wp_url_numero", "tipo_rivista", "numero_progressivo", "display_title",
              "status", "chosen_identifier", "chosen_pdf", "candidates", "reason"]
    with open(args.out_report, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for r in results:
            w.writerow({
                "id_numero": r.id_numero,
                "wp_url_numero": r.wp_url_numero,
                "tipo_rivista": r.tipo_rivista,
                "numero_progressivo": r.numero_progressivo,
                "display_title": r.display_title,
                "status": r.status,
                "chosen_identifier": r.chosen_identifier,
                "chosen_pdf": r.chosen_pdf,
                "candidates": r.candidates,
                "reason": r.reason,
            })

    with open(args.out_debug, "w", encoding="utf-8") as f:
        f.write("\n".join(debug_lines))

    print(f"OK. Scritti: {args.out_json}, {args.out_report}, {args.out_debug}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
