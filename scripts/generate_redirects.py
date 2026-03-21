#!/usr/bin/env python3
"""
Genera public/_redirects (Cloudflare Pages) da redirects_necessari.json.

Priorita statiche: REGOLA A (/?p=ID) -> REGOLA B (date) -> REGOLA C/D (slug testuale).
Max 2000 righe in _redirects; il resto va in redirects_overflow.json.
"""

from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent.parent
PATH_REDIR_JSON = ROOT / "scripts/db_analysis/output/redirects_necessari.json"
PATH_ARTICOLI = ROOT / "scripts/db_analysis/output/articoli_wp_puliti.json"
PATH_OUT_REDIRECTS = ROOT / "public/_redirects"
PATH_OVERFLOW = ROOT / "scripts/db_analysis/output/redirects_overflow.json"
PATH_QUERYSTRING = ROOT / "scripts/db_analysis/output/redirects_querystring.json"
PATH_LOG_INVALID = ROOT / "scripts/db_analysis/logs/redirects_invalid.log"
PATH_LOG_DUPES = ROOT / "scripts/db_analysis/logs/redirects_duplicates.log"

MAX_STATIC = 2000


def norm_dest(lang: str, slug: str) -> str:
    s = slug.strip().strip("/")
    return f"/blog/{s}/"


def norm_src_simple(slug_old: str) -> str | None:
    s = unquote(slug_old).strip().strip("/")
    if not s:
        return None
    return f"/{s}/"


def analyze_records(records: list[dict]) -> None:
    """Riepilogo struttura sorgente (STEP 1)."""
    print("=== Analisi sorgente (redirects_necessari.json) ===\n")
    if not records:
        print("(vuoto)")
        return
    ex = records[0]
    print("Struttura record (esempio):")
    print(json.dumps(ex, ensure_ascii=False, indent=2))
    print()
    print(f"Totale record: {len(records)}")
    types = Counter(r.get("type") for r in records)
    print(f"Per type: {dict(types)}")
    print()
    print(
        "Nota: il file non contiene source_url; le sorgenti si derivano cosi:\n"
        "  - old_slug + slug_old solo cifre -> REGOLA A: /?p=<id>\n"
        "  - old_date_slug + date_old -> REGOLA B: /YYYY/MM/DD/slug/ e /YYYY/MM/slug/\n"
        "  - old_slug + slug_old testuale -> REGOLA C (IT) o D (EN) -> /it|en/slug_new/\n"
    )
    p_id = sum(
        1 for r in records if r.get("type") == "old_slug" and str(r.get("slug_old", "")).isdigit()
    )
    date_n = sum(1 for r in records if r.get("type") == "old_date_slug")
    simple = sum(
        1
        for r in records
        if r.get("type") == "old_slug" and not str(r.get("slug_old", "")).isdigit()
    )
    weird = sum(
        1
        for r in records
        if r.get("type") == "old_slug"
        and (not r.get("slug_old") or "/" in str(r.get("slug_old", "")))
    )
    enc = sum(
        1 for r in records if r.get("type") == "old_slug" and "%" in str(r.get("slug_old", ""))
    )
    print("Conteggio record per derivazione URL:")
    print(f"  REGOLA A (slug_old numerico -> /?p=ID):     {p_id}")
    print(f"  REGOLA B (old_date_slug -> path con data):  {date_n}")
    print(f"  REGOLA C/D (slug_old testuale -> /slug/):   {simple}")
    if weird:
        print(f"  Anomali (slug_old vuoto o con slash):     {weird}")
    if enc:
        print(f"  slug_old con percent-encoding (decodificati): {enc}")
    print()


def dest_prefix_ok(dest: str) -> bool:
    return dest.startswith("/blog/")


def build_candidates(
    records: list[dict], articoli_by_id: dict[int, dict]
) -> tuple[list[tuple[int, int, int, str, str, str]], list[tuple[str, str]]]:
    """
    Returns (candidates, query_candidates).
    candidates: (priority, record_index, sub_index, source, dest, rule_label) per regole B/C/D.
    query_candidates: (source, dest) per REGOLA A (/?p=ID) — non supportata in CF Pages _redirects.
    """
    out: list[tuple[int, int, int, str, str, str]] = []
    query_out: list[tuple[str, str]] = []
    for idx, rec in enumerate(records):
        wp_id = rec.get("wp_id")
        if wp_id is None:
            continue
        art = articoli_by_id.get(wp_id)
        if not art:
            continue
        lang = (art.get("lang") or "it").lower()
        slug = rec.get("slug_new") or ""
        dest = norm_dest(lang, slug)
        t = rec.get("type")

        if t == "old_slug":
            so = str(rec.get("slug_old", ""))
            if so.isdigit():
                query_out.append((f"/?p={so}", dest))
            else:
                src = norm_src_simple(so)
                if src is None:
                    continue
                rule = "D" if lang == "en" else "C"
                out.append((2, idx, 0, src, dest, rule))
        elif t == "old_date_slug":
            raw = rec.get("date_old") or ""
            parts = str(raw).split("-")
            if len(parts) != 3:
                continue
            y, m, d = parts
            if not (y.isdigit() and m.isdigit() and d.isdigit()):
                continue
            out.append((1, idx, 0, f"/{y}/{m}/{d}/{slug}/", dest, "B"))
            out.append((1, idx, 1, f"/{y}/{m}/{slug}/", dest, "B"))
    return out, query_out


def main() -> int:
    if not PATH_REDIR_JSON.is_file():
        print(f"Manca {PATH_REDIR_JSON}", file=sys.stderr)
        return 1
    if not PATH_ARTICOLI.is_file():
        print(f"Manca {PATH_ARTICOLI}", file=sys.stderr)
        return 1

    records = json.loads(PATH_REDIR_JSON.read_text(encoding="utf-8"))
    analyze_records(records)

    articoli = json.loads(PATH_ARTICOLI.read_text(encoding="utf-8"))
    articoli_by_id = {int(a["wp_id"]): a for a in articoli}

    candidates, query_candidates = build_candidates(records, articoli_by_id)
    candidates.sort(key=lambda x: (x[0], x[1], x[2]))

    PATH_LOG_INVALID.parent.mkdir(parents=True, exist_ok=True)
    PATH_LOG_DUPES.write_text("", encoding="utf-8")
    invalid_lines: list[str] = []
    dupe_lines: list[str] = []

    seen_source: dict[str, tuple[str, str]] = {}
    ordered: list[tuple[str, str, str]] = []
    skipped_identity = 0
    dupes = 0

    for pri, ridx, sidx, src, dest, rule in candidates:
        if not src or not str(src).strip():
            invalid_lines.append(f"empty_source\trecord#{ridx}\t{json.dumps(records[ridx], ensure_ascii=False)}")
            continue
        if src == dest:
            skipped_identity += 1
            continue
        if not dest_prefix_ok(dest):
            invalid_lines.append(f"bad_dest_prefix\t{src}\t{dest}\trecord#{ridx}")
            continue
        if src in seen_source:
            dupes += 1
            kept_dest, kept_rule = seen_source[src]
            dupe_lines.append(
                f"{src}\tkept_dest={kept_dest}\tkept_rule={kept_rule}\t"
                f"skipped_dest={dest}\tskipped_rule={rule}\trecord#{ridx}"
            )
            continue
        seen_source[src] = (dest, rule)
        ordered.append((src, dest, rule))

    PATH_LOG_INVALID.write_text(
        "\n".join(invalid_lines) + ("\n" if invalid_lines else ""),
        encoding="utf-8",
    )
    PATH_LOG_DUPES.write_text("\n".join(dupe_lines) + ("\n" if dupe_lines else ""), encoding="utf-8")

    static_rules = ordered[:MAX_STATIC]
    overflow_rules = ordered[MAX_STATIC:]

    PATH_OUT_REDIRECTS.parent.mkdir(parents=True, exist_ok=True)
    lines_out = [f"{s}  {d}  301" for s, d, _ in static_rules]
    PATH_OUT_REDIRECTS.write_text("\n".join(lines_out) + "\n", encoding="utf-8")

    overflow_payload = [
        {"source": s, "destination": d, "status": 301, "rule": rule}
        for s, d, rule in overflow_rules
    ]
    PATH_OVERFLOW.write_text(
        json.dumps(overflow_payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    query_payload = [
        {"source": s, "destination": d, "status": 301, "rule": "A"}
        for s, d in query_candidates
    ]
    PATH_QUERYSTRING.write_text(
        json.dumps(query_payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    n_overflow = len(overflow_rules)
    if n_overflow:
        print(
            "ATTENZIONE: "
            f"{n_overflow} regole superano il limite di {MAX_STATIC} redirect statici "
            "per Cloudflare Pages.\n"
            f"Overflow salvato in: {PATH_OVERFLOW}\n"
            "Le regole overflow vanno gestite con un Cloudflare Worker "
            "o redirect rules nella dashboard.\n"
        )

    print("=== Riepilogo generazione ===")
    print(f"Totale regole generate (uniche per source): {len(ordered)}")
    print(f"Regole scritte in _redirects: {len(static_rules)}")
    print(f"Regole overflow (Worker / dashboard): {n_overflow}")
    print(f"Regole /?p=ID (querystring, CF Worker): {len(query_candidates)}  -> {PATH_QUERYSTRING}")
    print(f"Duplicati rimossi (stessa source_url): {dupes}")
    print(f"Righe skippate (source = destination): {skipped_identity}")
    print(f"Righe non valide (log): {len(invalid_lines)}  -> {PATH_LOG_INVALID}")
    print(f"Log duplicati: {PATH_LOG_DUPES}")
    print()

    # Campioni (STEP 3) su lista completa
    print("=== Campioni per formato (lista completa post-dedup) ===\n")
    for label in ("A", "B", "C", "D"):
        samples = [x for x in ordered if x[2] == label][:5]
        print(f"REGOLA {label} (max 5):")
        if not samples:
            print("  (nessuna - solo in overflow se oltre 2000)")
        for s, d, _ in samples:
            print(f"  {s}  {d}  301")
        print()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
