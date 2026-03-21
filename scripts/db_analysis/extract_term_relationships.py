#!/usr/bin/env python3
"""
scripts/db_analysis/extract_term_relationships.py

Estrae wp_term_relationships dal dump SQL WordPress e produce un file JSON
con le relazioni articolo↔categoria e articolo↔tag.

Input:
  dump_db_old/Sql980379_3.sql.gz
  scripts/db_analysis/output/articoli_wp_puliti.json  (per filtrare wp_id validi)

Output:
  scripts/db_analysis/output/term_relationships_wp.json

Uso:
  python3 scripts/db_analysis/extract_term_relationships.py
  python3 scripts/db_analysis/extract_term_relationships.py \
      --dump dump_db_old/Sql980379_3.sql.gz \
      --articoli scripts/db_analysis/output/articoli_wp_puliti.json \
      --output scripts/db_analysis/output/term_relationships_wp.json
"""

import argparse
import gzip
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent.parent

DEFAULT_DUMP     = ROOT / "dump_db_old" / "Sql980379_3.sql.gz"
DEFAULT_ARTICOLI = ROOT / "scripts" / "db_analysis" / "output" / "articoli_wp_puliti.json"
DEFAULT_OUTPUT   = ROOT / "scripts" / "db_analysis" / "output" / "term_relationships_wp.json"

VALID_TAXONOMIES = {"category", "post_tag"}


# ── SQL helpers (stesso approccio di extract_wp_content.py) ──────────────────

def open_sql(path):
    if str(path).endswith('.gz'):
        return gzip.open(path, 'rt', encoding='utf-8', errors='replace')
    return open(path, 'r', encoding='utf-8', errors='replace')


def detect_prefix(dump_path):
    with open_sql(dump_path) as f:
        for i, line in enumerate(f):
            if i > 500:
                break
            m = re.match(r'CREATE TABLE `(\w+)`', line)
            if m:
                pm = re.match(r'^(\w+?)posts$', m.group(1))
                if pm:
                    return pm.group(1)
            m = re.match(r"INSERT INTO `(\w+)`", line)
            if m:
                pm = re.match(r'^(\w+?)(?:posts|comments|users|options)$', m.group(1))
                if pm:
                    return pm.group(1)
    return 'wppp_'


def parse_sql_values(s):
    """
    Parsa la parte VALUES di una riga SQL.
    Gestisce: stringhe single-quoted con escape MySQL, NULL, int, float.
    """
    rows = []
    i = 0
    n = len(s)

    while i < n:
        while i < n and s[i] in ' \t\n\r,':
            i += 1
        if i >= n:
            break
        if s[i] != '(':
            while i < n and s[i] != '(':
                i += 1
            continue
        i += 1  # consuma '('

        row = []
        while i < n:
            while i < n and s[i] in ' \t':
                i += 1
            if i >= n:
                break

            c = s[i]

            if c == ')':
                i += 1
                break
            elif c == ',':
                i += 1
                continue
            elif c == "'":
                i += 1
                buf = []
                while i < n:
                    ch = s[i]
                    if ch == '\\' and i + 1 < n:
                        nc = s[i + 1]
                        esc = {
                            'n': '\n', 'r': '\r', 't': '\t', '\\': '\\',
                            "'": "'", '"': '"', '0': '\0', 'Z': '\x1a', 'b': '\b',
                        }
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
                row.append(''.join(buf))

            elif s[i:i+4] == 'NULL' and (i + 4 >= n or s[i + 4] in ',) \t\n\r'):
                row.append(None)
                i += 4

            else:
                j = i
                while j < n and s[j] not in ',)':
                    j += 1
                raw = s[i:j].strip()
                if raw in ('NULL', ''):
                    row.append(None)
                else:
                    try:
                        row.append(int(raw))
                    except ValueError:
                        try:
                            row.append(float(raw))
                        except ValueError:
                            row.append(raw)
                i = j

        if row:
            rows.append(row)

    return rows


def stream_table(dump_path, table_name, progress_every=10000):
    """
    Itera le righe di table_name da un dump phpMyAdmin.
    Supporta formato phpMyAdmin (row per riga) e mysqldump (tutti in un INSERT).
    """
    table_re     = re.compile(rf'INSERT INTO `{re.escape(table_name)}`', re.IGNORECASE)
    any_insert_re = re.compile(r'^INSERT INTO `', re.IGNORECASE)

    in_insert = False
    count = 0

    with open_sql(dump_path) as f:
        for raw_line in f:
            line = raw_line.rstrip('\n')

            if table_re.search(line):
                in_insert = True
                m = re.search(r'VALUES\s+(\(.+)', line, re.IGNORECASE)
                if m:
                    values_str = m.group(1).rstrip().rstrip(';')
                    for row in parse_sql_values(values_str):
                        yield row
                        count += 1
                        if progress_every and count % progress_every == 0:
                            print(f"    ... {count} rows", end='\r', file=sys.stderr)
                    in_insert = False
                continue

            if any_insert_re.match(line):
                in_insert = False
                continue

            if not in_insert:
                continue

            ls = line.lstrip()
            if not ls.startswith('('):
                continue

            rline = ls.rstrip()
            if rline.endswith(');'):
                row_str = rline[:-1]
                in_insert = False
            elif rline.endswith('),'):
                row_str = rline[:-1]
            else:
                row_str = rline

            for row in parse_sql_values(row_str):
                yield row
                count += 1
                if progress_every and count % progress_every == 0:
                    print(f"    ... {count} rows", end='\r', file=sys.stderr)

    if progress_every:
        print(f"    Total: {count} rows          ", file=sys.stderr)


def get_table_columns(dump_path, table_name):
    pattern = re.compile(
        rf'INSERT INTO `{re.escape(table_name)}`\s*\(([^)]+)\)\s+VALUES',
        re.IGNORECASE,
    )
    with open_sql(dump_path) as f:
        for line in f:
            m = pattern.search(line)
            if m:
                return [c.strip().strip('`') for c in m.group(1).split(',')]
    return []


def make_getter(cols, std_map):
    def getter(row, name):
        if cols:
            try:
                idx = cols.index(name)
                if idx < len(row):
                    return row[idx]
            except ValueError:
                pass
        idx = std_map.get(name)
        if idx is not None and idx < len(row):
            return row[idx]
        return None
    return getter


# ── Estrazione tabelle ────────────────────────────────────────────────────────

def load_valid_wp_ids(articoli_path):
    print(f"Carico wp_id validi da {articoli_path} ...")
    with open(articoli_path, 'r', encoding='utf-8') as f:
        articoli = json.load(f)
    ids = {int(a['wp_id']) for a in articoli if a.get('wp_id')}
    print(f"  -> {len(ids)} wp_id validi")
    return ids


def extract_terms(dump_path, prefix):
    """
    Legge wp_terms: term_id -> {slug, name}
    """
    table = f"{prefix}terms"
    cols = get_table_columns(dump_path, table)
    std = {'term_id': 0, 'name': 1, 'slug': 2}
    get = make_getter(cols, std)

    print(f"Estrazione {table} ...")
    terms = {}
    for row in stream_table(dump_path, table):
        term_id = get(row, 'term_id')
        if term_id is None:
            continue
        terms[int(term_id)] = {
            'slug': get(row, 'slug') or '',
            'name': get(row, 'name') or '',
        }
    print(f"  -> {len(terms)} termini")
    return terms


def extract_term_taxonomy(dump_path, prefix):
    """
    Legge wp_term_taxonomy: term_taxonomy_id -> {term_id, taxonomy}
    Filtra subito: solo category e post_tag.
    """
    table = f"{prefix}term_taxonomy"
    cols = get_table_columns(dump_path, table)
    std = {'term_taxonomy_id': 0, 'term_id': 1, 'taxonomy': 2}
    get = make_getter(cols, std)

    print(f"Estrazione {table} ...")
    taxonomies = {}
    for row in stream_table(dump_path, table):
        tt_id    = get(row, 'term_taxonomy_id')
        term_id  = get(row, 'term_id')
        taxonomy = get(row, 'taxonomy')
        if tt_id is None or taxonomy not in VALID_TAXONOMIES:
            continue
        taxonomies[int(tt_id)] = {
            'term_id':  int(term_id) if term_id is not None else None,
            'taxonomy': taxonomy,
        }
    print(f"  -> {len(taxonomies)} term_taxonomy (solo category+post_tag)")
    return taxonomies


def extract_term_relationships(dump_path, prefix, valid_wp_ids, valid_tt_ids):
    """
    Legge wp_term_relationships: restituisce lista (object_id, term_taxonomy_id).
    Filtra subito: object_id in valid_wp_ids, term_taxonomy_id in valid_tt_ids.
    """
    table = f"{prefix}term_relationships"
    cols = get_table_columns(dump_path, table)
    std = {'object_id': 0, 'term_taxonomy_id': 1}
    get = make_getter(cols, std)

    print(f"Estrazione {table} ...")
    rels = []
    total = 0
    for row in stream_table(dump_path, table):
        obj_id = get(row, 'object_id')
        tt_id  = get(row, 'term_taxonomy_id')
        total += 1
        if obj_id is None or tt_id is None:
            continue
        obj_id = int(obj_id)
        tt_id  = int(tt_id)
        if obj_id in valid_wp_ids and tt_id in valid_tt_ids:
            rels.append((obj_id, tt_id))
    print(f"  -> {len(rels)} relazioni (di {total} totali nel dump)")
    return rels


# ── Join finale ───────────────────────────────────────────────────────────────

def build_output(rels, term_taxonomy, terms):
    out = []
    for obj_id, tt_id in rels:
        tt  = term_taxonomy[tt_id]
        t   = terms.get(tt['term_id'], {})
        out.append({
            'object_id':       obj_id,
            'term_taxonomy_id': tt_id,
            'taxonomy':        tt['taxonomy'],
            'term_id':         tt['term_id'],
            'slug':            t.get('slug', ''),
            'name':            t.get('name', ''),
        })
    return out


def print_summary(records):
    cats    = [r for r in records if r['taxonomy'] == 'category']
    tags    = [r for r in records if r['taxonomy'] == 'post_tag']
    art_ids = {r['object_id'] for r in records}

    print(f"\n{'='*60}")
    print(f"RIEPILOGO ESTRAZIONE")
    print(f"{'='*60}")
    print(f"  Totale relazioni estratte : {len(records)}")
    print(f"  Relazioni category        : {len(cats)}")
    print(f"  Relazioni post_tag        : {len(tags)}")
    print(f"  Articoli unici coinvolti  : {len(art_ids)}")

    print(f"\n  Top 10 categorie per numero articoli:")
    cat_counter = Counter(r['name'] for r in cats)
    for i, (name, cnt) in enumerate(cat_counter.most_common(10), 1):
        print(f"    {i:2d}. {name:<35s} {cnt:>5d}")
    print(f"{'='*60}\n")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Estrai wp_term_relationships dal dump SQL")
    parser.add_argument('--dump',     default=str(DEFAULT_DUMP))
    parser.add_argument('--articoli', default=str(DEFAULT_ARTICOLI))
    parser.add_argument('--output',   default=str(DEFAULT_OUTPUT))
    parser.add_argument('--prefix',   default=None, help='Prefisso tabelle WP (auto-detect se omesso)')
    args = parser.parse_args()

    dump_path    = Path(args.dump)
    articoli_path = Path(args.articoli)
    output_path  = Path(args.output)

    if not dump_path.exists():
        sys.exit(f"ERRORE: dump non trovato: {dump_path}")
    if not articoli_path.exists():
        sys.exit(f"ERRORE: articoli non trovati: {articoli_path}")

    output_path.parent.mkdir(parents=True, exist_ok=True)

    # 1. Prefisso tabelle
    prefix = args.prefix or detect_prefix(dump_path)
    print(f"Prefisso tabelle rilevato: '{prefix}'")

    # 2. wp_id validi
    valid_wp_ids = load_valid_wp_ids(articoli_path)

    # 3. Estrai wp_terms (passata 1)
    terms = extract_terms(dump_path, prefix)

    # 4. Estrai wp_term_taxonomy (passata 2) — filtra category+post_tag
    term_taxonomy = extract_term_taxonomy(dump_path, prefix)
    valid_tt_ids  = set(term_taxonomy.keys())

    # 5. Estrai wp_term_relationships (passata 3)
    rels = extract_term_relationships(dump_path, prefix, valid_wp_ids, valid_tt_ids)

    # 6. Join
    print("Join in memoria ...")
    records = build_output(rels, term_taxonomy, terms)

    # 7. Scrivi output
    print(f"Scrivo {len(records)} record in {output_path} ...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print(f"  -> {output_path} ({output_path.stat().st_size / 1024:.1f} KB)")

    # 8. Riepilogo
    print_summary(records)


if __name__ == '__main__':
    main()
