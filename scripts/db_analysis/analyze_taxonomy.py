#!/usr/bin/env python3
"""
scripts/db_analysis/analyze_taxonomy.py

Step 1-6: analisi tassonomia, numeri rivista, URL originali, relazioni.

Input:  dump_db_old/Sql980379_3.sql.gz
        scripts_and_data/datasets/articoli/articoli_wp_puliti.json

Output:
  scripts_and_data/datasets/numeri_rivista/numeri_rivista_wp.json
  scripts_and_data/datasets/articoli/categorie_wp.json
  scripts_and_data/datasets/articoli/tag_wp.json
  scripts_and_data/datasets/articoli/articoli_wp_puliti.json  (aggiornato con url_originale)
  scripts_and_data/reports/db_analysis_20260320.md            (aggiornato)
"""

import gzip
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
DUMP = ROOT / "dump_db_old" / "Sql980379_3.sql.gz"

OUT_NUMERI    = ROOT / "scripts/db_analysis/output/numeri_rivista_wp.json"
OUT_CATEGORIE = ROOT / "scripts/db_analysis/output/categorie_wp.json"
OUT_TAG       = ROOT / "scripts/db_analysis/output/tag_wp.json"
OUT_ARTICOLI  = ROOT / "scripts/db_analysis/output/articoli_wp_puliti.json"
OUT_REPORT    = ROOT / "scripts_and_data/reports/db_analysis_20260320.md"

PREFIX = 'wppp_'

KNOWN_POST_TYPES = {
    'post', 'page', 'attachment', 'revision', 'nav_menu_item',
    'custom_css', 'customize_changeset', 'oembed_cache',
    'user_request', 'wp_block', 'wp_template', 'wp_global_styles',
    'wp_navigation', 'wp_font_family', 'wp_font_face',
}

BASE_URL = 'https://www.ombreeluci.it'


# ── SQL HELPERS (identici a extract_wp_content.py) ────────────────────────────

def open_sql(path):
    if str(path).endswith('.gz'):
        return gzip.open(path, 'rt', encoding='utf-8', errors='replace')
    return open(path, 'r', encoding='utf-8', errors='replace')


def parse_sql_values(s):
    rows = []
    i, n = 0, len(s)
    while i < n:
        while i < n and s[i] in ' \t\n\r,':
            i += 1
        if i >= n:
            break
        if s[i] != '(':
            while i < n and s[i] != '(':
                i += 1
            continue
        i += 1
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
                        esc = {'n': '\n', 'r': '\r', 't': '\t', '\\': '\\',
                               "'": "'", '"': '"', '0': '\0', 'Z': '\x1a', 'b': '\b'}
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
            elif s[i:i+4] == 'NULL' and (i+4 >= n or s[i+4] in ',) \t\n\r'):
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


def stream_table(dump_path, table_name, progress_every=0):
    table_re = re.compile(rf'INSERT INTO `{re.escape(table_name)}`', re.IGNORECASE)
    any_ins   = re.compile(r'^INSERT INTO `', re.IGNORECASE)
    in_insert = False
    count = 0
    with open_sql(dump_path) as f:
        for raw in f:
            line = raw.rstrip('\n')
            if table_re.search(line):
                in_insert = True
                m = re.search(r'VALUES\s+(\(.+)', line, re.IGNORECASE)
                if m:
                    for row in parse_sql_values(m.group(1).rstrip().rstrip(';')):
                        yield row
                        count += 1
                    in_insert = False
                continue
            if any_ins.match(line):
                in_insert = False
                continue
            if not in_insert:
                continue
            ls = line.lstrip()
            if not ls.startswith('('):
                continue
            rline = ls.rstrip()
            if rline.endswith(');'):
                row_str, in_insert = rline[:-1], False
            elif rline.endswith('),'):
                row_str = rline[:-1]
            else:
                row_str = rline
            for row in parse_sql_values(row_str):
                yield row
                count += 1
                if progress_every and count % progress_every == 0:
                    print(f"    ... {count}", end='\r', file=sys.stderr)
    if progress_every:
        print(f"    Total: {count}          ", file=sys.stderr)


def make_getter(col_names, std_map):
    def get(row, name):
        if col_names:
            try:
                idx = col_names.index(name)
                if idx < len(row):
                    return row[idx]
            except ValueError:
                pass
        idx = std_map.get(name)
        if idx is not None and idx < len(row):
            return row[idx]
        return None
    return get


# ── STEP 1+2: POST TYPES + NUMERI RIVISTA ────────────────────────────────────

def scan_posts(dump_path, post_cols):
    """
    Un unico pass su wppp_posts che raccoglie:
    - conteggio per post_type (tutti)
    - esempi titoli per post_type non standard
    - tutti i post con post_type='project' (numeri rivista)
    - guid di tutti i post pubblicati (per url_originale)
    - post_content originale dei 2 'other' e degli word_count=0
      (per STEP 6 - identificati post load da articoli_wp_puliti.json)
    """
    get = make_getter(post_cols, {
        'ID': 0, 'post_author': 1, 'post_date': 2,
        'post_content': 4, 'post_title': 5, 'post_status': 7,
        'post_name': 11, 'guid': 18, 'post_type': 20,
    })

    type_counts  = Counter()
    type_titles  = defaultdict(list)   # post_type -> [titles]
    projects     = []
    guids        = {}   # wp_id -> guid (per tutti i post/page/project)

    print(f"  Scansione wppp_posts...", file=sys.stderr)
    for row in stream_table(dump_path, PREFIX + 'posts', progress_every=2000):
        ptype  = get(row, 'post_type')  or ''
        status = get(row, 'post_status') or ''
        wp_id  = get(row, 'ID')
        title  = get(row, 'post_title') or ''
        slug   = get(row, 'post_name')  or ''
        date   = str(get(row, 'post_date') or '')[:10]
        guid   = get(row, 'guid')       or ''
        content = get(row, 'post_content') or ''

        type_counts[ptype] += 1

        if ptype not in KNOWN_POST_TYPES and len(type_titles[ptype]) < 3:
            type_titles[ptype].append(title)

        if ptype in ('post', 'page', 'project') and status == 'publish':
            guids[int(wp_id) if wp_id is not None else 0] = guid

        if ptype == 'project' and status == 'publish':
            projects.append({
                'wp_id':       int(wp_id) if wp_id is not None else None,
                'slug':        slug,
                'title':       title,
                'date':        date,
                'url_originale': guid,
                'post_content': content,
                'thumbnail_id': None,
                'thumbnail_url': '',
            })

    print(f"\n  post_type trovati: {len(type_counts)}", file=sys.stderr)
    return type_counts, type_titles, projects, guids


# ── STEP 3: THUMBNAIL PER NUMERI + URL ORIGINALI PER ARTICOLI ────────────────

def scan_postmeta_for_numeri(dump_path, pmeta_cols, project_ids, attachment_guids):
    """
    Scansiona postmeta per:
    - _thumbnail_id dei numeri rivista
    - meta_key con 'numero'/'rivista'/'issue' per capire le relazioni
    """
    get = make_getter(pmeta_cols, {
        'meta_id': 0, 'post_id': 1, 'meta_key': 2, 'meta_value': 3,
    })

    thumbnails_num = {}    # project_id -> thumb_id
    relation_keys  = Counter()   # meta_key pattern -> count
    relation_sample = defaultdict(list)  # meta_key -> [(post_id, value)]

    RELATION_PATTERNS = re.compile(r'numero|rivista|issue|_numero|_rivista', re.IGNORECASE)

    print("  Scansione wppp_postmeta...", file=sys.stderr)
    for row in stream_table(dump_path, PREFIX + 'postmeta', progress_every=20000):
        pid = get(row, 'post_id')
        key = get(row, 'meta_key') or ''
        val = get(row, 'meta_value')
        if pid is None:
            continue
        pid = int(pid)

        if key == '_thumbnail_id' and pid in project_ids and val:
            try:
                thumbnails_num[pid] = int(val)
            except (ValueError, TypeError):
                pass

        if RELATION_PATTERNS.search(key):
            relation_keys[key] += 1
            if len(relation_sample[key]) < 3:
                relation_sample[key].append((pid, val))

    print(f"\n  Thumbnail numeri: {len(thumbnails_num)}", file=sys.stderr)
    return thumbnails_num, relation_keys, relation_sample


# ── STEP 4: TERMS (CATEGORIE + TAG) ──────────────────────────────────────────

def scan_terms(dump_path, term_cols, tt_cols):
    get_term = make_getter(term_cols, {
        'term_id': 0, 'name': 1, 'slug': 2,
    })
    get_tt = make_getter(tt_cols, {
        'term_taxonomy_id': 0, 'term_id': 1, 'taxonomy': 2,
        'description': 3, 'parent': 4, 'count': 5,
    })

    terms = {}   # term_id -> {name, slug}
    tt    = {}   # term_taxonomy_id -> {term_id, taxonomy, description, count}

    print("  Scansione wppp_terms...", file=sys.stderr)
    for row in stream_table(dump_path, PREFIX + 'terms'):
        tid = get_term(row, 'term_id')
        if tid is None:
            continue
        terms[int(tid)] = {
            'name': get_term(row, 'name') or '',
            'slug': get_term(row, 'slug') or '',
        }

    print(f"  Terms: {len(terms)}", file=sys.stderr)
    print("  Scansione wppp_term_taxonomy...", file=sys.stderr)
    for row in stream_table(dump_path, PREFIX + 'term_taxonomy'):
        ttid = get_tt(row, 'term_taxonomy_id')
        tid  = get_tt(row, 'term_id')
        tax  = get_tt(row, 'taxonomy') or ''
        desc = get_tt(row, 'description') or ''
        cnt  = get_tt(row, 'count')
        if ttid is None or tid is None:
            continue
        tt[int(ttid)] = {
            'term_id':    int(tid),
            'taxonomy':   tax,
            'description': desc,
            'count':      int(cnt) if cnt is not None else 0,
        }

    print(f"  Term_taxonomy: {len(tt)}", file=sys.stderr)
    return terms, tt


# ── STEP 5: TERM RELATIONSHIPS ────────────────────────────────────────────────

def scan_term_relationships(dump_path, tr_cols):
    """
    Mappa: post_id -> [term_taxonomy_id, ...]
    """
    get = make_getter(tr_cols, {'object_id': 0, 'term_taxonomy_id': 1})

    rel = defaultdict(list)   # post_id -> [ttid]
    print("  Scansione wppp_term_relationships...", file=sys.stderr)
    for row in stream_table(dump_path, PREFIX + 'term_relationships', progress_every=10000):
        oid  = get(row, 'object_id')
        ttid = get(row, 'term_taxonomy_id')
        if oid is None or ttid is None:
            continue
        rel[int(oid)].append(int(ttid))

    print(f"\n  Relazioni: {sum(len(v) for v in rel.values())}", file=sys.stderr)
    return rel


# ── STEP 6: ANALISI 'other' E word_count=0 ───────────────────────────────────

def scan_specific_posts(dump_path, post_cols, target_ids):
    """
    Recupera post_content originale per un set di wp_id specifici.
    """
    get = make_getter(post_cols, {
        'ID': 0, 'post_content': 4, 'post_title': 5,
        'post_name': 11, 'post_type': 20,
    })
    result = {}
    remaining = set(target_ids)
    for row in stream_table(dump_path, PREFIX + 'posts'):
        wp_id = get(row, 'ID')
        if wp_id is None:
            continue
        if int(wp_id) in remaining:
            result[int(wp_id)] = {
                'post_content': get(row, 'post_content') or '',
                'post_title':   get(row, 'post_title')   or '',
                'post_name':    get(row, 'post_name')    or '',
                'post_type':    get(row, 'post_type')    or '',
            }
            remaining.discard(int(wp_id))
            if not remaining:
                break
    return result


# ── MAIN ───────────────────────────────────────────────────────────────────────

def w(s):
    """Write UTF-8 safe to stdout."""
    sys.stdout.buffer.write(s.encode('utf-8') if isinstance(s, str) else s)
    sys.stdout.buffer.write(b'\n')


def main():
    SEP = '=' * 60
    DIV = '-' * 60

    if not DUMP.exists():
        alts = list((ROOT / "dump_db_old").glob("*980379_3*"))
        if not alts:
            w("ERRORE: dump non trovato")
            sys.exit(1)
        dump = alts[0]
    else:
        dump = DUMP

    w(f"Dump: {dump}  ({dump.stat().st_size/1024/1024:.0f} MB)")

    # ── Carica articoli_wp_puliti.json ────────────────────────────────────────
    w("\nCarico articoli_wp_puliti.json...")
    with open(OUT_ARTICOLI, encoding='utf-8') as f:
        articoli = json.load(f)
    w(f"  {len(articoli)} articoli")

    articoli_by_id   = {a['wp_id']: i for i, a in enumerate(articoli)}
    other_ids  = [a['wp_id'] for a in articoli if a['layout_type'] == 'other']
    zero_ids   = [a['wp_id'] for a in articoli if a['word_count'] == 0]
    short_ids  = [a['wp_id'] for a in articoli if 0 < a['word_count'] < 100]

    # ── Rileva colonne ────────────────────────────────────────────────────────
    w("\nLettura colonne dall'INSERT header...")
    post_cols  = get_table_columns(dump, PREFIX + 'posts')
    pmeta_cols = get_table_columns(dump, PREFIX + 'postmeta')
    term_cols  = get_table_columns(dump, PREFIX + 'terms')
    tt_cols    = get_table_columns(dump, PREFIX + 'term_taxonomy')
    tr_cols    = get_table_columns(dump, PREFIX + 'term_relationships')

    w(f"  posts: {len(post_cols)} col | postmeta: {len(pmeta_cols)} col | "
      f"terms: {len(term_cols)} col | term_taxonomy: {len(tt_cols)} col | "
      f"term_relationships: {len(tr_cols)} col")

    # ── PASS 1: wppp_posts ────────────────────────────────────────────────────
    w(f"\n[PASS 1] wppp_posts - post_types + numeri rivista + guids")
    type_counts, type_titles, projects, guids = scan_posts(dump, post_cols)

    custom_types = {k: v for k, v in type_counts.items() if k not in KNOWN_POST_TYPES}
    w(f"\n  Custom post types non standard:")
    for pt, cnt in sorted(custom_types.items(), key=lambda x: -x[1]):
        examples = type_titles.get(pt, [])
        w(f"    {pt:<25} {cnt:>5}  esempi: {examples[:2]}")

    w(f"\n  Numeri rivista (post_type=project): {len(projects)}")

    # ── PASS 2: postmeta per numeri + relazioni ───────────────────────────────
    project_ids = {p['wp_id'] for p in projects if p['wp_id']}
    # Carica attachment guids da articoli_wp_puliti (non li abbiamo qui)
    # Usiamo lo scan di postmeta per thumbnail_id dei numeri
    w(f"\n[PASS 2] wppp_postmeta - thumbnail numeri + meta_key relazioni")
    thumbnails_num, relation_keys, relation_sample = scan_postmeta_for_numeri(
        dump, pmeta_cols, project_ids, {}
    )

    # ── PASS 3: terms + term_taxonomy ────────────────────────────────────────
    w(f"\n[PASS 3] wppp_terms + wppp_term_taxonomy")
    terms, tt = scan_terms(dump, term_cols, tt_cols)

    # ── PASS 4: term_relationships ────────────────────────────────────────────
    w(f"\n[PASS 4] wppp_term_relationships")
    rel = scan_term_relationships(dump, tr_cols)

    # ── PASS 5 (opzionale): post_content originale per Step 6 ────────────────
    step6_ids = set(other_ids + zero_ids[:5] + short_ids[:5])
    w(f"\n[PASS 5] Recupero post_content originale per {len(step6_ids)} post (Step 6)")
    orig_content = scan_specific_posts(dump, post_cols, step6_ids)

    # ════════════════════════════════════════════════════════════
    # ELABORAZIONE DATI
    # ════════════════════════════════════════════════════════════

    # ── STEP 3: Aggiorna articoli con url_originale ───────────────────────────
    w(f"\nAggiorno url_originale in articoli_wp_puliti.json...")
    updated = 0
    for a in articoli:
        wid = a['wp_id']
        if wid in guids:
            a['url_originale'] = guids[wid]
            updated += 1
        elif 'url_originale' not in a:
            a['url_originale'] = ''
    w(f"  {updated} articoli aggiornati con url_originale")

    # ── STEP 2: Completa numeri con thumbnail URL ─────────────────────────────
    # Raccogli guids degli attachment dai posts scansionati
    # (i projects non hanno gli attachment guids qui, usiamo thumbnail_id -> nessuna url diretta)
    # Li segniamo come thumbnail_id e lasciamo che step futuro li risolva
    for p in projects:
        wid = p['wp_id']
        if wid in thumbnails_num:
            p['thumbnail_id'] = thumbnails_num[wid]
        # thumbnail_url: costruiamo da guid se abbiamo l'attachment
        # (gli attachment guids sono stati raccolti in guids dict solo per post/page/project)
        # In questo script non li abbiamo tutti - ok lasciare vuoto

    # ── STEP 4: Costruisci categorie e tag ───────────────────────────────────
    # Mappa term_taxonomy_id -> {term_id, taxonomy, description, count}
    # Poi unisci con terms per nome/slug

    # Conta quante volte ogni ttid appare nelle relazioni
    ttid_counts = Counter()
    for ttids in rel.values():
        for ttid in ttids:
            ttid_counts[ttid] += 1

    categorie = []
    tag_list  = []
    other_tax = []

    for ttid, info in tt.items():
        term = terms.get(info['term_id'], {})
        taxonomy = info['taxonomy']
        slug = term.get('slug', '')
        name = term.get('name', '')

        record = {
            'term_id':       info['term_id'],
            'term_taxonomy_id': ttid,
            'slug':          slug,
            'name':          name,
            'description':   info['description'],
            'count':         info['count'],
        }

        if taxonomy == 'category':
            record['url_originale'] = f"{BASE_URL}/category/{slug}/"
            categorie.append(record)
        elif taxonomy == 'post_tag':
            record['url_originale'] = f"{BASE_URL}/tag/{slug}/"
            tag_list.append(record)
        else:
            record['taxonomy'] = taxonomy
            other_tax.append(record)

    categorie.sort(key=lambda x: -x['count'])
    tag_list.sort(key=lambda x: -x['count'])

    # ── STEP 5: Relazioni articolo -> numero rivista ──────────────────────────
    # Cerca se i 'project' sono collegati via term_relationships o via postmeta
    # Costruiamo: quale taxonomy contiene i project?

    # Trova ttid dei 'project' nella term_relationships
    project_ttids = set()
    for pid in project_ids:
        for ttid in rel.get(pid, []):
            project_ttids.add(ttid)

    # Queste sono le tassonomie dei project
    project_taxonomies = Counter()
    for ttid in project_ttids:
        tax = tt.get(ttid, {}).get('taxonomy', 'unknown')
        project_taxonomies[tax] += 1

    # Cerca articoli che condividono ttid con project (collegamento via taxonomy)
    # Mappa: project_wp_id -> set di ttid che usa
    project_ttid_map = defaultdict(set)
    for pid in project_ids:
        for ttid in rel.get(pid, []):
            project_ttid_map[pid].add(ttid)

    # Inverso: ttid -> project_wp_id
    ttid_to_project = {}
    for pid, ttids in project_ttid_map.items():
        for ttid in ttids:
            if tt.get(ttid, {}).get('taxonomy') not in ('category', 'post_tag'):
                ttid_to_project[ttid] = pid

    # Articoli collegati via shared ttid con un project
    art_to_project_via_tax = defaultdict(set)
    for aid in articoli_by_id:
        for ttid in rel.get(aid, []):
            if ttid in ttid_to_project:
                art_to_project_via_tax[aid].add(ttid_to_project[ttid])

    n_linked = len(art_to_project_via_tax)

    # ── STEP 6: Analisi 'other' e word_count=0 ───────────────────────────────
    step6_report = []

    step6_report.append("\n## Step 6: Analisi articoli anomali\n")

    # 'other' layout
    step6_report.append("### Layout type 'other' (2 articoli)\n")
    for a in articoli:
        if a['layout_type'] != 'other':
            continue
        wid = a['wp_id']
        orig = orig_content.get(wid, {})
        pc = orig.get('post_content', '')
        step6_report.append(f"**wp_id:** {wid} | **slug:** {a['slug']} | **data:** {a['date']}")
        step6_report.append(f"**html_body estratto ({a['word_count']} parole):**")
        step6_report.append(f"```\n{a['html_body'][:400]}\n```")
        step6_report.append(f"**post_content originale (primi 500 char):**")
        step6_report.append(f"```\n{pc[:500]}\n```\n")

    # word_count = 0
    step6_report.append("### Articoli word_count = 0\n")
    for a in articoli:
        if a['word_count'] != 0:
            continue
        wid = a['wp_id']
        orig = orig_content.get(wid, {})
        pc = orig.get('post_content', '')
        step6_report.append(
            f"- **{a['slug']}** (wp_id:{wid}, {a['date']}, layout:`{a['layout_type']}`) "
            f"| post_content originale: `{pc[:200]}`"
        )

    # word_count < 100 (campione)
    step6_report.append("\n### Campione word_count < 100 (non zero)\n")
    for a in articoli:
        if a['word_count'] == 0 or a['word_count'] >= 100:
            continue
        wid = a['wp_id']
        orig = orig_content.get(wid, {})
        pc = orig.get('post_content', '')
        step6_report.append(f"**{a['slug']}** (wp_id:{wid}, {a['word_count']} parole)")
        step6_report.append(f"```html\n{a['html_body'][:300]}\n```")
        step6_report.append(f"post_content originale: `{pc[:150]}`\n")
        # limit to 5
        if step6_report.count("parole)") >= 5:
            break

    # ════════════════════════════════════════════════════════════
    # SCRITTURA OUTPUT
    # ════════════════════════════════════════════════════════════

    w(f"\nScrivo output...")

    for path in [OUT_NUMERI, OUT_CATEGORIE, OUT_TAG, OUT_ARTICOLI, OUT_REPORT]:
        path.parent.mkdir(parents=True, exist_ok=True)

    with open(OUT_NUMERI, 'w', encoding='utf-8') as f:
        json.dump(projects, f, ensure_ascii=False, indent=2)
    w(f"  {OUT_NUMERI.name}: {len(projects)} numeri rivista")

    with open(OUT_CATEGORIE, 'w', encoding='utf-8') as f:
        json.dump(categorie, f, ensure_ascii=False, indent=2)
    w(f"  {OUT_CATEGORIE.name}: {len(categorie)} categorie")

    with open(OUT_TAG, 'w', encoding='utf-8') as f:
        json.dump(tag_list, f, ensure_ascii=False, indent=2)
    w(f"  {OUT_TAG.name}: {len(tag_list)} tag")

    with open(OUT_ARTICOLI, 'w', encoding='utf-8') as f:
        json.dump(articoli, f, ensure_ascii=False, indent=2)
    w(f"  {OUT_ARTICOLI.name}: {len(articoli)} articoli (con url_originale)")

    # ── Report aggiornato ──────────────────────────────────────────────────────
    lines = []

    # Sezione nuova da appendere al report esistente
    lines += [
        "\n---\n",
        "# Analisi Tassonomia + Numeri Rivista -- 2026-03-20\n",

        "## Step 1: Custom Post Type\n",
        "### Tutti i post_type nel dump\n",
        "| post_type | count |",
        "|-----------|-------|",
    ]
    for pt, cnt in type_counts.most_common():
        marker = " **(custom)**" if pt not in KNOWN_POST_TYPES else ""
        lines.append(f"| `{pt}` | {cnt}{marker} |")

    lines += [
        "\n### Custom post type non standard\n",
        "| post_type | count | esempi titoli |",
        "|-----------|-------|---------------|",
    ]
    for pt, cnt in sorted(custom_types.items(), key=lambda x: -x[1]):
        examples = ' / '.join(type_titles.get(pt, [])[:2])
        lines.append(f"| `{pt}` | {cnt} | {examples[:80]} |")

    lines += [
        "\n## Step 2: Numeri Rivista (post_type=project)\n",
        f"Trovati **{len(projects)}** numeri pubblicati.\n",
        "| wp_id | slug | title | date |",
        "|-------|------|-------|------|",
    ]
    for p in projects[:10]:
        lines.append(f"| {p['wp_id']} | `{p['slug']}` | {p['title'][:50]} | {p['date']} |")
    if len(projects) > 10:
        lines.append(f"| ... | *({len(projects)-10} altri)* | | |")

    lines += [
        "\n## Step 4: Tassonomia\n",
        f"- **Categorie:** {len(categorie)}",
        f"- **Tag:** {len(tag_list)}",
        f"- **Altre taxonomie:** {len(other_tax)}\n",
        "### Categorie (top 15 per count)\n",
        "| name | slug | count |",
        "|------|------|-------|",
    ]
    for c in categorie[:15]:
        lines.append(f"| {c['name']} | `{c['slug']}` | {c['count']} |")

    lines += [
        "\n### Altre taxonomie presenti\n",
        "| taxonomy | count_terms |",
        "|----------|-------------|",
    ]
    other_tax_counts = Counter(r['taxonomy'] for r in other_tax)
    for tax, cnt in other_tax_counts.most_common():
        lines.append(f"| `{tax}` | {cnt} |")

    lines += [
        "\n## Step 5: Relazioni Articolo -> Numero Rivista\n",
        "### Metakey con 'numero'/'rivista'/'issue' in wppp_postmeta\n",
    ]
    if relation_keys:
        lines += [
            "| meta_key | occorrenze | esempio (post_id, value) |",
            "|----------|------------|--------------------------|",
        ]
        for key, cnt in relation_keys.most_common(20):
            sample = relation_sample[key][:1]
            ex = f"post_id={sample[0][0]}, val=`{str(sample[0][1])[:40]}`" if sample else ""
            lines.append(f"| `{key}` | {cnt} | {ex} |")
    else:
        lines.append("_Nessun meta_key con pattern numero/rivista/issue trovato._\n")

    lines += [
        f"\n### Collegamento via taxonomy condivisa (project <-> articolo)\n",
        f"Tassonomie usate dai project: `{dict(project_taxonomies)}`\n",
        f"Articoli collegati a un project via taxonomy condivisa: **{n_linked}**\n",
    ]

    if n_linked > 0:
        lines.append("**Conclusione:** gli articoli sono collegati ai numeri rivista "
                     "tramite una taxonomy condivisa (non via postmeta).\n")
    else:
        lines.append("**Conclusione:** il collegamento NON avviene via taxonomy. "
                     "Verificare altra logica (postmeta, slug pattern, data).\n")

    lines += step6_report

    # Leggi report esistente e appendi
    existing = ''
    if OUT_REPORT.exists():
        existing = OUT_REPORT.read_text(encoding='utf-8')

    with open(OUT_REPORT, 'w', encoding='utf-8') as f:
        f.write(existing)
        f.write('\n'.join(lines))
    w(f"  {OUT_REPORT.name}: aggiornato")

    # ── Stampa sommario ────────────────────────────────────────────────────────
    w(f"\n{SEP}")
    w("SOMMARIO")
    w(SEP)
    w(f"Custom post type trovati: {len(custom_types)}")
    for pt, cnt in sorted(custom_types.items(), key=lambda x: -x[1]):
        w(f"  {pt:<25} {cnt}")
    w(f"\nNumeri rivista (project): {len(projects)}")
    w(f"Categorie: {len(categorie)} | Tag: {len(tag_list)} | Altre tax: {len(other_tax_counts)}")
    w(f"Articoli aggiornati con url_originale: {updated}")
    w(f"Articoli collegati a numero via taxonomy: {n_linked}")
    w(f"\nMeta_key con pattern numero/rivista/issue:")
    for key, cnt in relation_keys.most_common(10):
        w(f"  {key:<40} {cnt}")
    w(f"\nStep 6 - Articoli 'other': {len(other_ids)}")
    w(f"Step 6 - Articoli word_count=0: {len(zero_ids)}")
    w(f"Step 6 - Articoli word_count<100: {len(short_ids)}")
    w(f"\n{DIV}")
    w("Tassonomie dei project:")
    for tax, cnt in project_taxonomies.most_common():
        w(f"  {tax}: {cnt}")
    w(f"\nFatto.")


if __name__ == '__main__':
    main()
