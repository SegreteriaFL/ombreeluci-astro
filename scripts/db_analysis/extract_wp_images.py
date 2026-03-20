#!/usr/bin/env python3
"""
scripts/db_analysis/extract_wp_images.py

Estrae tutti gli attachment immagine dal dump WordPress con metadati completi.

Input:  dump_db_old/Sql980379_3.sql.gz
        scripts/db_analysis/output/immagini_copertina_wp.json

Output: scripts/db_analysis/output/immagini_wp.json

Struttura ogni record:
  wp_id, url, filename, title, caption, description,
  alt, mime_type, date, width, height, filesize, usata_in
"""

import gzip
import json
import re
import sys
from pathlib import Path

ROOT   = Path(__file__).resolve().parent.parent.parent
DUMP   = ROOT / "dump_db_old" / "Sql980379_3.sql.gz"
OUT    = ROOT / "scripts/db_analysis/output/immagini_wp.json"
COVER  = ROOT / "scripts/db_analysis/output/immagini_copertina_wp.json"

PREFIX = 'wppp_'


# ── SQL HELPERS ───────────────────────────────────────────────────────────────

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
                row.append(None if raw in ('NULL', '') else
                           (int(raw) if raw.lstrip('-').isdigit() else raw))
                i = j
        if row:
            rows.append(row)
    return rows


def get_table_columns(dump_path, table_name):
    pat = re.compile(
        rf'INSERT INTO `{re.escape(table_name)}`\s*\(([^)]+)\)\s+VALUES',
        re.IGNORECASE,
    )
    with open_sql(dump_path) as f:
        for line in f:
            m = pat.search(line)
            if m:
                return [c.strip().strip('`') for c in m.group(1).split(',')]
    return []


def stream_table(dump_path, table_name, progress_every=0):
    tre = re.compile(rf'INSERT INTO `{re.escape(table_name)}`', re.IGNORECASE)
    ire = re.compile(r'^INSERT INTO `', re.IGNORECASE)
    in_ins = False
    count = 0
    with open_sql(dump_path) as f:
        for raw in f:
            line = raw.rstrip('\n')
            if tre.search(line):
                in_ins = True
                m = re.search(r'VALUES\s+(\(.+)', line, re.IGNORECASE)
                if m:
                    for row in parse_sql_values(m.group(1).rstrip().rstrip(';')):
                        yield row
                        count += 1
                    in_ins = False
                continue
            if ire.match(line):
                in_ins = False
                continue
            if not in_ins:
                continue
            ls = line.lstrip()
            if not ls.startswith('('):
                continue
            rline = ls.rstrip()
            if rline.endswith(');'):
                row_str, in_ins = rline[:-1], False
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


def make_getter(cols, std):
    def get(row, name):
        if cols:
            try:
                idx = cols.index(name)
                if idx < len(row):
                    return row[idx]
            except ValueError:
                pass
        idx = std.get(name)
        if idx is not None and idx < len(row):
            return row[idx]
        return None
    return get


# ── PHP SERIALIZED METADATA PARSER ───────────────────────────────────────────

def parse_attachment_metadata(serialized):
    """
    Estrae width, height, filesize da stringa PHP serializzata.
    Formato: a:N:{s:5:"width";i:800;s:6:"height";i:600;...s:8:"filesize";i:125000;...}
    """
    if not serialized:
        return None, None, None

    w = re.search(r's:5:"width";i:(\d+)', serialized)
    h = re.search(r's:6:"height";i:(\d+)', serialized)
    fs = re.search(r's:8:"filesize";i:(\d+)', serialized)

    width    = int(w.group(1))  if w  else None
    height   = int(h.group(1))  if h  else None
    filesize = int(fs.group(1)) if fs else None

    return width, height, filesize


# ── MAIN ─────────────────────────────────────────────────────────────────────

def w(s):
    sys.stdout.buffer.write((s + '\n').encode('utf-8'))


def main():
    if not DUMP.exists():
        alts = list((ROOT / "dump_db_old").glob("*980379_3*"))
        if not alts:
            w("ERRORE: dump non trovato")
            sys.exit(1)
        dump = alts[0]
    else:
        dump = DUMP

    w(f"Dump: {dump}  ({dump.stat().st_size/1024/1024:.0f} MB)")

    # ── Carica usata_in map da immagini_copertina_wp.json ─────────────────────
    usata_in_map = {}   # thumbnail_wp_id -> [post_id, ...]
    if COVER.exists():
        with open(COVER, encoding='utf-8') as f:
            covers = json.load(f)
        for c in covers:
            tid = c.get('thumbnail_wp_id')
            pid = c.get('post_id')
            if tid and pid:
                usata_in_map.setdefault(tid, []).append(pid)
        w(f"Copertine caricate: {len(covers)} (thumbnail map: {len(usata_in_map)} id unici)")
    else:
        w("immagini_copertina_wp.json non trovato, usata_in vuoto")

    # ── Rileva colonne ─────────────────────────────────────────────────────────
    post_cols  = get_table_columns(dump, PREFIX + 'posts')
    pmeta_cols = get_table_columns(dump, PREFIX + 'postmeta')

    post_get = make_getter(post_cols, {
        'ID': 0, 'post_date': 2, 'post_content': 4, 'post_title': 5,
        'post_excerpt': 6, 'post_name': 11, 'guid': 18,
        'post_type': 20, 'post_mime_type': 21,
    })
    pmeta_get = make_getter(pmeta_cols, {
        'meta_id': 0, 'post_id': 1, 'meta_key': 2, 'meta_value': 3,
    })

    # ── PASS 1: raccoglie tutti gli attachment immagine ────────────────────────
    w(f"\n[1/2] Scansione {PREFIX}posts (attachment immagini)...")
    images = {}   # wp_id -> record

    for row in stream_table(dump, PREFIX + 'posts', progress_every=2000):
        ptype = post_get(row, 'post_type') or ''
        mime  = post_get(row, 'post_mime_type') or ''
        if ptype != 'attachment':
            continue
        if not mime.startswith('image/'):
            continue

        wp_id = post_get(row, 'ID')
        if wp_id is None:
            continue
        wp_id = int(wp_id)

        url = post_get(row, 'guid') or ''
        filename = url.rsplit('/', 1)[-1] if url else ''

        images[wp_id] = {
            'wp_id':       wp_id,
            'url':         url,
            'filename':    filename,
            'title':       post_get(row, 'post_title')   or '',
            'caption':     post_get(row, 'post_excerpt') or '',
            'description': post_get(row, 'post_content') or '',
            'alt':         '',      # riempito dopo
            'mime_type':   mime,
            'date':        str(post_get(row, 'post_date') or '')[:10],
            'width':       None,
            'height':      None,
            'filesize':    None,
            'usata_in':    usata_in_map.get(wp_id, []),
        }

    w(f"\n  Immagini trovate: {len(images)}")

    # ── PASS 2: postmeta per alt e metadata ───────────────────────────────────
    w(f"\n[2/2] Scansione {PREFIX}postmeta (alt + metadata)...")
    processed = 0

    for row in stream_table(dump, PREFIX + 'postmeta', progress_every=20000):
        pid = pmeta_get(row, 'post_id')
        key = pmeta_get(row, 'meta_key') or ''
        val = pmeta_get(row, 'meta_value')

        if pid is None:
            continue
        pid = int(pid)

        if pid not in images:
            continue

        if key == '_wp_attachment_image_alt' and val:
            images[pid]['alt'] = str(val)
            processed += 1

        elif key == '_wp_attachment_metadata' and val:
            width, height, filesize = parse_attachment_metadata(str(val))
            images[pid]['width']    = width
            images[pid]['height']   = height
            images[pid]['filesize'] = filesize

    w(f"\n  Alt text compilati: {processed}")

    # ── Costruisci output ─────────────────────────────────────────────────────
    result = list(images.values())
    result.sort(key=lambda x: x['wp_id'])

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    # ── Statistiche ───────────────────────────────────────────────────────────
    has_alt     = sum(1 for r in result if r['alt'])
    has_caption = sum(1 for r in result if r['caption'])
    has_desc    = sum(1 for r in result if r['description'])
    has_dim     = sum(1 for r in result if r['width'])
    has_usata   = sum(1 for r in result if r['usata_in'])

    # Top 5 più usate come copertina
    top5 = sorted(result, key=lambda x: -len(x['usata_in']))[:5]

    SEP = '=' * 60
    w(f"\n{SEP}")
    w("STATISTICHE IMMAGINI")
    w(SEP)
    w(f"Totale immagini:           {len(result)}")
    w(f"Con alt text:              {has_alt}  ({has_alt/len(result)*100:.1f}%)")
    w(f"Con caption:               {has_caption}  ({has_caption/len(result)*100:.1f}%)")
    w(f"Con description:           {has_desc}  ({has_desc/len(result)*100:.1f}%)")
    w(f"Con width/height:          {has_dim}  ({has_dim/len(result)*100:.1f}%)")
    w(f"Usate come copertina:      {has_usata}")
    w(f"\nTop 5 immagini piu' usate come copertina:")
    for r in top5:
        if r['usata_in']:
            w(f"  wp_id:{r['wp_id']}  usata_in:{len(r['usata_in'])}  {r['filename'][:50]}")
    w(f"\nOutput: {OUT}")
    w("Fatto.")


if __name__ == '__main__':
    main()
