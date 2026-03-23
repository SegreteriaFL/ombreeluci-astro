#!/usr/bin/env python3
"""
scripts/db_analysis/extract_articolo_numero_mapping.py

Estrae dal dump SQL il mapping wp_id_articolo → id_numero usando la
taxonomy category WordPress, che contiene termini con slug:
  - "n-{N}"         → OEL-N   (formato principale, es. n-168 → OEL-168)
  - "numero-{N}-*"  → OEL-N   (formato vecchio, es. numero-3-1983 → OEL-3)
  - "insieme-n-{N}" → INS-N   (rivista Insieme)

Gli articoli (post_type=post, status=publish) sono assegnati a queste
categorie tramite wppp_term_relationships. La taxonomy project_category
dei project (numeri rivista) NON è condivisa con gli articoli.

Input:  dump_db_old/Sql980379_3.sql.gz

Output: scripts/db_analysis/output/articolo_numero_mapping.json
        Lista di oggetti {wp_id: int, id_numero: str}
        Solo articoli con mapping trovato, ordinati per wp_id.

Uso:
  python3 scripts/db_analysis/extract_articolo_numero_mapping.py
"""

import gzip
import json
import re
import sys
from collections import defaultdict, Counter
from pathlib import Path

ROOT   = Path(__file__).resolve().parent.parent.parent
DUMP   = ROOT / "dump_db_old" / "Sql980379_3.sql.gz"
OUT    = ROOT / "scripts/db_analysis/output/articolo_numero_mapping.json"
PREFIX = "wppp_"


# ── SQL helpers ───────────────────────────────────────────────────────────────

def open_sql(path):
    if str(path).endswith(".gz"):
        return gzip.open(path, "rt", encoding="utf-8", errors="replace")
    return open(path, "r", encoding="utf-8", errors="replace")


def parse_sql_values(s):
    rows = []
    i, n = 0, len(s)
    while i < n:
        while i < n and s[i] in " \t\n\r,":
            i += 1
        if i >= n:
            break
        if s[i] != "(":
            while i < n and s[i] != "(":
                i += 1
            continue
        i += 1
        row = []
        while i < n:
            while i < n and s[i] in " \t":
                i += 1
            if i >= n:
                break
            c = s[i]
            if c == ")":
                i += 1
                break
            elif c == ",":
                i += 1
                continue
            elif c == "'":
                i += 1
                buf = []
                while i < n:
                    ch = s[i]
                    if ch == "\\" and i + 1 < n:
                        nc = s[i + 1]
                        esc = {"n": "\n", "r": "\r", "t": "\t", "\\": "\\",
                               "'": "'", '"': '"', "0": "\0", "Z": "\x1a", "b": "\b"}
                        buf.append(esc.get(nc, nc))
                        i += 2
                    elif ch == "'":
                        i += 1
                        if i < n and s[i] == "'":
                            buf.append("'")
                            i += 1
                        else:
                            break
                    else:
                        buf.append(ch)
                        i += 1
                row.append("".join(buf))
            elif c == "N" and s[i:i+4] == "NULL":
                row.append(None)
                i += 4
            else:
                j = i
                while i < n and s[i] not in (",", ")", " ", "\t"):
                    i += 1
                token = s[j:i]
                try:
                    row.append(int(token))
                except ValueError:
                    try:
                        row.append(float(token))
                    except ValueError:
                        row.append(token)
        rows.append(row)
    return rows


def get_table_columns(dump_path, table_name):
    pattern = re.compile(
        rf"INSERT INTO `{re.escape(table_name)}`\s*\(([^)]+)\)\s+VALUES",
        re.IGNORECASE,
    )
    with open_sql(dump_path) as f:
        for line in f:
            m = pattern.search(line)
            if m:
                return [c.strip().strip("`") for c in m.group(1).split(",")]
    return []


def stream_table(dump_path, table_name, progress_every=0):
    """
    Supporta due formati di dump MySQL:
      - inline:     INSERT INTO `t` (cols) VALUES (r1),(r2),...;
      - multi-line: INSERT INTO `t` (cols) VALUES\\n(r1),\\n(r2),...\\n;
    """
    table_re = re.compile(rf"INSERT INTO `{re.escape(table_name)}`", re.IGNORECASE)
    any_ins  = re.compile(r"^INSERT INTO `", re.IGNORECASE)
    in_insert = False
    count = 0
    with open_sql(dump_path) as f:
        for raw in f:
            line = raw.rstrip("\n")
            if table_re.search(line):
                in_insert = True
            elif any_ins.match(line):
                in_insert = False
            if not in_insert:
                continue
            m = re.search(r"VALUES\s*(\(.*)", line, re.IGNORECASE)
            if m:
                data_str = m.group(1)
            elif line.lstrip().startswith("("):
                data_str = line.lstrip()
            else:
                continue
            for row in parse_sql_values(data_str):
                yield row
                count += 1
                if progress_every and count % progress_every == 0:
                    print(f"    ... {count} righe", file=sys.stderr)


def make_getter(col_names, std_map):
    def get(row, name):
        if col_names:
            try:
                return row[col_names.index(name)]
            except (ValueError, IndexError):
                return None
        idx = std_map.get(name)
        return row[idx] if idx is not None and idx < len(row) else None
    return get


# ── Slug → id_numero ──────────────────────────────────────────────────────────

def slug_to_id_numero(slug: str) -> str | None:
    """
    Converte uno slug di categoria WordPress in un id_numero OEL/INS.

    Pattern supportati:
      n-{N}              → OEL-N   (formato principale moderno)
      n-{N}-en           → OEL-N   (versione inglese dello stesso numero)
      n-{N}-2            → OEL-N   (variante duplicata numerica)
      numero-{N}-*       → OEL-N   (formato vecchio con anno o titolo)
      numero-{N}         → OEL-N
      insieme-n-{N}*     → INS-N
    """
    m = re.match(r"^n-(\d+)$", slug)
    if m:
        return f"OEL-{m.group(1)}"
    m = re.match(r"^n-(\d+)-(?:en|\d+)$", slug)
    if m:
        return f"OEL-{m.group(1)}"
    m = re.match(r"^numero-(\d+)(?:-|$)", slug)
    if m:
        return f"OEL-{m.group(1)}"
    m = re.match(r"^insieme-n-(\d+)", slug)
    if m:
        return f"INS-{m.group(1)}"
    return None


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    if not DUMP.exists():
        print(f"ERRORE: dump non trovato: {DUMP}", file=sys.stderr)
        sys.exit(1)

    print("Lettura colonne tabelle...", file=sys.stderr)
    post_cols = get_table_columns(DUMP, PREFIX + "posts")
    tt_cols   = get_table_columns(DUMP, PREFIX + "term_taxonomy")
    tr_cols   = get_table_columns(DUMP, PREFIX + "term_relationships")
    term_cols = get_table_columns(DUMP, PREFIX + "terms")

    get_post = make_getter(post_cols, {})
    get_tt   = make_getter(tt_cols,   {})
    get_tr   = make_getter(tr_cols,   {})
    get_term = make_getter(term_cols, {})

    # PASS 1: slug di ogni term
    print("[PASS 1] wppp_terms...", file=sys.stderr)
    term_slug: dict[int, str] = {}   # term_id -> slug
    for row in stream_table(DUMP, PREFIX + "terms"):
        tid = get_term(row, "term_id")
        if tid is None:
            continue
        term_slug[int(tid)] = get_term(row, "slug") or ""

    print(f"  terms: {len(term_slug)}", file=sys.stderr)

    # PASS 2: term_taxonomy — costruisci mappa ttid → id_numero
    # (solo taxonomy='category' con slug riconoscibili come numero rivista)
    print("[PASS 2] wppp_term_taxonomy...", file=sys.stderr)
    issue_ttid_to_id_numero: dict[int, str] = {}   # ttid -> id_numero

    for row in stream_table(DUMP, PREFIX + "term_taxonomy"):
        ttid = get_tt(row, "term_taxonomy_id")
        tid  = get_tt(row, "term_id")
        tax  = get_tt(row, "taxonomy") or ""
        if ttid is None or tax != "category":
            continue
        slug = term_slug.get(int(tid) if tid is not None else 0, "")
        id_numero = slug_to_id_numero(slug)
        if id_numero:
            issue_ttid_to_id_numero[int(ttid)] = id_numero

    print(f"  category ttid → id_numero: {len(issue_ttid_to_id_numero)}", file=sys.stderr)

    # PASS 3: raccogli wp_id degli articoli pubblicati
    print("[PASS 3] wppp_posts — articoli pubblicati...", file=sys.stderr)
    article_ids: set[int] = set()

    for row in stream_table(DUMP, PREFIX + "posts", progress_every=5000):
        ptype  = get_post(row, "post_type")  or ""
        status = get_post(row, "post_status") or ""
        wp_id  = get_post(row, "ID")
        if wp_id is None:
            continue
        if ptype == "post" and status == "publish":
            article_ids.add(int(wp_id))

    print(f"  articoli pubblicati: {len(article_ids)}", file=sys.stderr)

    # PASS 4: term_relationships — mappa articolo → [id_numero]
    print("[PASS 4] wppp_term_relationships...", file=sys.stderr)
    art_to_numeri: dict[int, set[str]] = defaultdict(set)

    for row in stream_table(DUMP, PREFIX + "term_relationships", progress_every=20000):
        oid  = get_tr(row, "object_id")
        ttid = get_tr(row, "term_taxonomy_id")
        if oid is None or ttid is None:
            continue
        oid  = int(oid)
        ttid = int(ttid)
        if oid in article_ids and ttid in issue_ttid_to_id_numero:
            art_to_numeri[oid].add(issue_ttid_to_id_numero[ttid])

    print(f"  articoli con almeno un numero: {len(art_to_numeri)}", file=sys.stderr)

    # Risolvi ambiguità: se un articolo ha più id_numero, prendi il numericamente più piccolo
    # (in genere accade per categorie sovrapposte — raro, 7 casi)
    ambiguous = 0
    mapping = []
    for art_id, numeri in art_to_numeri.items():
        if len(numeri) > 1:
            ambiguous += 1
        # Ordina: OEL-N prima per N numerico, poi INS, poi extra
        def sort_key(s):
            m = re.match(r"^(OEL|INS)-(\d+)$", s)
            return (0 if s.startswith("OEL") else 1, int(m.group(2)) if m else 9999)
        id_numero = sorted(numeri, key=sort_key)[0]
        mapping.append({"wp_id": art_id, "id_numero": id_numero})

    mapping.sort(key=lambda x: x["wp_id"])

    if ambiguous:
        print(f"  articoli con mapping ambiguo (>1 numero): {ambiguous}", file=sys.stderr)

    # Scrivi output
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)

    print(f"\nOutput scritto: {OUT}", file=sys.stderr)

    # Statistiche finali
    counts = Counter(r["id_numero"] for r in mapping)
    no_mapping = len(article_ids) - len(mapping)

    print(f"\n--- Statistiche ---")
    print(f"Articoli totali pubblicati:    {len(article_ids)}")
    print(f"Articoli con mapping trovato:  {len(mapping)}")
    print(f"Articoli senza mapping:        {no_mapping}")
    print(f"\nPrimi 5 record:")
    for r in mapping[:5]:
        print(f"  {r}")
    print(f"\nTop 10 numeri per conteggio articoli:")
    for id_num, cnt in counts.most_common(10):
        print(f"  {id_num}: {cnt}")
    oel_168 = counts.get("OEL-168", 0)
    print(f"\nArticoli per OEL-168: {oel_168}")


if __name__ == "__main__":
    main()
