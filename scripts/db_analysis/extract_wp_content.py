#!/usr/bin/env python3
"""
scripts/db_analysis/extract_wp_content.py

Estrae e pulisce contenuti articoli dal dump SQL WordPress Ombre e Luci.
Formato dump: phpMyAdmin (INSERT header su una riga, ogni riga dati su linea separata).
Riconosce layout Divi (2_3+sidebar, 4_4 fullwidth, HTML puro).

Input:  dump_db_old/Sql980379_3.sql.gz
Output:
  scripts_and_data/datasets/articoli/articoli_wp_puliti.json
  scripts_and_data/datasets/autori/autori_wp.json
  scripts_and_data/datasets/articoli/immagini_copertina_wp.json
  scripts_and_data/reports/db_analysis_20260320.md

Uso:
    python3 scripts/db_analysis/extract_wp_content.py
    python3 scripts/db_analysis/extract_wp_content.py --dump path/to/dump.sql.gz
    python3 scripts/db_analysis/extract_wp_content.py --prefix wppp_
"""

import argparse
import gzip
import json
import re
import sys
from collections import Counter
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent.parent

OUT_ARTICOLI = ROOT / "scripts/db_analysis/output/articoli_wp_puliti.json"
OUT_AUTORI   = ROOT / "scripts/db_analysis/output/autori_wp.json"
OUT_IMMAGINI = ROOT / "scripts/db_analysis/output/immagini_copertina_wp.json"
OUT_REPORT   = ROOT / "scripts_and_data/reports/db_analysis_20260320.md"


def find_dump(hint=None):
    if hint:
        p = Path(hint)
        if p.exists():
            return p
    candidates = [
        ROOT / "dump_db_old" / "Sql980379_3.sql.gz",
        ROOT / "dump_db_old" / "Sql980379_3_sql",
        ROOT / "dump_db_old" / "Sql980379_3.sql",
    ]
    for c in candidates:
        if c.exists():
            return c
    if (ROOT / "dump_db_old").exists():
        extra = list((ROOT / "dump_db_old").glob("*980379_3*"))
        if extra:
            return extra[0]
    raise FileNotFoundError("Dump SQL non trovato in dump_db_old/")


# ── SQL STREAMING PARSER ───────────────────────────────────────────────────────

def open_sql(path):
    if str(path).endswith('.gz'):
        return gzip.open(path, 'rt', encoding='utf-8', errors='replace')
    return open(path, 'r', encoding='utf-8', errors='replace')


def detect_prefix(dump_path):
    """
    Rileva il prefisso tabelle scansionando i primi CREATE TABLE / INSERT INTO.
    Restituisce stringa come 'wppp_'.
    """
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


def get_table_columns(dump_path, table_name):
    """
    Estrae i nomi colonna dall'header INSERT INTO della prima occorrenza.
    Formato phpMyAdmin: INSERT INTO `table` (`col1`, `col2`, ...) VALUES
    """
    pattern = re.compile(
        rf'INSERT INTO `{re.escape(table_name)}`\s*\(([^)]+)\)\s+VALUES',
        re.IGNORECASE,
    )
    with open_sql(dump_path) as f:
        for line in f:
            m = pattern.search(line)
            if m:
                cols = [c.strip().strip('`') for c in m.group(1).split(',')]
                return cols
    return []


def parse_sql_values(s):
    """
    Parsa la parte VALUES di una riga SQL: (val1, 'str', NULL, ...).
    Gestisce: stringhe single-quoted con escape MySQL (\\n, \\', \\", etc.),
              NULL, interi, float.
    Restituisce lista di righe (ciascuna = lista di valori Python).
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
                        if i < n and s[i] == "'":   # '' = escaped single quote
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


def stream_table(dump_path, table_name, progress_every=5000):
    """
    Itera le righe di table_name da un dump phpMyAdmin.

    Formato atteso:
        INSERT INTO `table` (`col1`, `col2`, ...) VALUES    <- header su una riga
        (val1, 'str', NULL, ...),                          <- ogni row su linea propria
        (val1, 'str', NULL, ...);                          <- ultima row termina con ;

    Supporta anche il formato mysqldump (tutti i valori sulla stessa riga dell'INSERT).
    """
    table_re = re.compile(
        rf'INSERT INTO `{re.escape(table_name)}`',
        re.IGNORECASE,
    )
    any_insert_re = re.compile(r'^INSERT INTO `', re.IGNORECASE)

    in_insert = False
    count = 0

    with open_sql(dump_path) as f:
        for raw_line in f:
            line = raw_line.rstrip('\n')

            # ── INSERT header per la nostra tabella ──
            if table_re.search(line):
                in_insert = True
                # mysqldump format: valori sulla stessa riga dopo VALUES
                m = re.search(r'VALUES\s+(\(.+)', line, re.IGNORECASE)
                if m:
                    values_str = m.group(1).rstrip().rstrip(';')
                    for row in parse_sql_values(values_str):
                        yield row
                        count += 1
                        if progress_every and count % progress_every == 0:
                            print(f"    ... {count} rows", end='\r', file=sys.stderr)
                    in_insert = False
                # else: phpMyAdmin format, rows arrivano nelle prossime righe
                continue

            # ── INSERT per un'altra tabella: reset stato ──
            if any_insert_re.match(line):
                in_insert = False
                continue

            if not in_insert:
                continue

            # ── Riga dati: deve iniziare con '(' ──
            ls = line.lstrip()
            if not ls.startswith('('):
                continue

            rline = ls.rstrip()

            # Determina se e' l'ultima riga del batch (termina con ');')
            if rline.endswith(');'):
                row_str = rline[:-1]   # rimuovi ';', mantieni ')'
                in_insert = False
            elif rline.endswith('),'):
                row_str = rline[:-1]   # rimuovi ','
            else:
                row_str = rline        # riga senza terminatore (raro)

            for row in parse_sql_values(row_str):
                yield row
                count += 1
                if progress_every and count % progress_every == 0:
                    print(f"    ... {count} rows", end='\r', file=sys.stderr)

    if progress_every:
        print(f"    Total: {count} rows          ", file=sys.stderr)


def make_col_getter(col_names, std_map):
    """
    Restituisce getter(row, col_name) -> value.
    Usa col_names (estratti dall'INSERT header) se disponibili,
    altrimenti fallback su std_map (indici standard WP).
    """
    def getter(row, name):
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
    return getter


# ── DIVI LAYOUT DETECTION + EXTRACTION ───────────────────────────────────────

def detect_layout(content):
    """
    Identifica il tipo di layout del post_content WordPress/Divi.
    Restituisce: 'empty' | 'html_pure' | '2_3_sidebar' | '4_4_fullwidth' | 'other'
    """
    if not content or not content.strip():
        return 'empty'
    if '[et_pb_' not in content:
        return 'html_pure'
    if re.search(r'\[et_pb_column\b[^\]]*\btype=["\']2_3["\']', content):
        return '2_3_sidebar'
    if re.search(r'\[et_pb_column\b[^\]]*\btype=["\']4_4["\']', content):
        return '4_4_fullwidth'
    return 'other'


def extract_body(content, layout):
    """
    Estrae il corpo HTML grezzo dal layout Divi.

    2_3_sidebar:  solo il primo et_pb_column type="2_3" (il corpo articolo),
                  ignora secondo et_pb_column (sidebar) e et_pb_code.
    4_4_fullwidth: tutti gli et_pb_text concatenati.
    html_pure:     restituisce il content direttamente.
    other:         tenta l'estrazione di qualsiasi et_pb_text.
    """
    if layout == 'empty':
        return ''

    if layout == 'html_pure':
        return content

    if layout == '2_3_sidebar':
        m = re.search(
            r'\[et_pb_column\b[^\]]*\btype=["\']2_3["\'][^\]]*\]'
            r'(.*?)'
            r'\[/et_pb_column\]',
            content, re.DOTALL,
        )
        if not m:
            texts = re.findall(
                r'\[et_pb_text\b[^\]]*\](.*?)\[/et_pb_text\]',
                content, re.DOTALL,
            )
            return '\n\n'.join(t.strip() for t in texts if t.strip())

        col = m.group(1)
        # Salta et_pb_code e global_module (elementi sidebar)
        texts = re.findall(
            r'\[et_pb_text\b(?![^\]]*\bglobal_module\b)[^\]]*\]'
            r'(.*?)'
            r'\[/et_pb_text\]',
            col, re.DOTALL,
        )
        return '\n\n'.join(t.strip() for t in texts if t.strip())

    if layout == '4_4_fullwidth':
        texts = re.findall(
            r'\[et_pb_text\b(?![^\]]*\bglobal_module\b)[^\]]*\]'
            r'(.*?)'
            r'\[/et_pb_text\]',
            content, re.DOTALL,
        )
        return '\n\n'.join(t.strip() for t in texts if t.strip())

    # 'other'
    texts = re.findall(
        r'\[et_pb_text\b[^\]]*\](.*?)\[/et_pb_text\]',
        content, re.DOTALL,
    )
    if texts:
        return '\n\n'.join(t.strip() for t in texts if t.strip())
    return content


# ── HTML CLEANING ──────────────────────────────────────────────────────────────

_RE_SCRIPT_STYLE = re.compile(
    r'<(script|style|noscript|iframe|object|embed)\b[^>]*>.*?</\1>',
    re.DOTALL | re.IGNORECASE,
)

_UNWRAP_OPEN = re.compile(
    r'<(div|section|article|aside|header|footer|main|nav|span|font|'
    r'table|tbody|thead|tfoot|tr|td|th|colgroup|col|'
    r'form|fieldset|select|option|textarea|button|input)\b[^>]*>',
    re.IGNORECASE,
)

_UNWRAP_CLOSE = re.compile(
    r'</(div|section|article|aside|header|footer|main|nav|span|font|'
    r'table|tbody|thead|tfoot|tr|td|th|colgroup|col|'
    r'form|fieldset|select|option|textarea|button|input|'
    r'script|style|noscript|iframe|object|embed|link|meta)\s*>',
    re.IGNORECASE,
)


def _convert_caption(m):
    """Converte shortcode [caption ...] ... [/caption] in <figure>."""
    inner = m.group(1)
    img_m = re.search(r'<img\b[^>]*/?>|<img\b[^>]*>', inner, re.IGNORECASE)
    if not img_m:
        return ''
    img_tag = img_m.group(0)
    caption_text = inner[img_m.end():].strip()
    caption_text = re.sub(r'<[^>]+>', '', caption_text).strip()

    src_m = re.search(r'\bsrc=["\']([^"\']*)["\']', img_tag, re.IGNORECASE)
    alt_m = re.search(r'\balt=["\']([^"\']*)["\']', img_tag, re.IGNORECASE)
    src = src_m.group(1) if src_m else ''
    alt = alt_m.group(1) if alt_m else ''

    if caption_text:
        return (f'<figure><img src="{src}" alt="{alt}">'
                f'<figcaption>{caption_text}</figcaption></figure>')
    return f'<figure><img src="{src}" alt="{alt}"></figure>'


def _strip_attrs(m):
    """
    Rimuove attributi superflui dai tag HTML con attributi.
    - <a>: mantiene href
    - <img>: mantiene src e alt
    - tag da unwrappare: rimuove il tag (contenuto rimane)
    - altri: mantiene class="capolettera" se presente
    """
    tag = m.group(1).lower()
    attrs = m.group(2) or ''

    _remove_open = {
        'script', 'style', 'noscript', 'iframe', 'object', 'embed',
        'link', 'meta', 'input', 'button', 'select', 'option', 'textarea',
        'div', 'section', 'article', 'aside', 'header', 'footer', 'main',
        'nav', 'span', 'font', 'table', 'tbody', 'thead', 'tfoot', 'tr',
        'td', 'th', 'colgroup', 'col', 'form', 'fieldset',
    }
    if tag in _remove_open:
        return ''

    if tag == 'a':
        href_m = re.search(r'\bhref=["\']([^"\']*)["\']', attrs, re.IGNORECASE)
        return f'<a href="{href_m.group(1)}">' if href_m else ''

    if tag == 'img':
        src_m = re.search(r'\bsrc=["\']([^"\']*)["\']', attrs, re.IGNORECASE)
        alt_m = re.search(r'\balt=["\']([^"\']*)["\']', attrs, re.IGNORECASE)
        src = src_m.group(1) if src_m else ''
        alt = alt_m.group(1) if alt_m else ''
        return f'<img src="{src}" alt="{alt}">'

    cls_m = re.search(r'\bclass=["\']([^"\']*)["\']', attrs, re.IGNORECASE)
    if cls_m and 'capolettera' in cls_m.group(1):
        return f'<{tag} class="capolettera">'

    return f'<{tag}>'


def clean_html(html):
    """
    Pulisce HTML estratto da Divi/WordPress.

    Mantiene: p, h2-h4, strong, em, b, i, blockquote, ul, li, ol,
              a[href], figure, figcaption, img (solo dentro figure),
              class="capolettera".
    Rimuove:  tutti gli altri attributi, span, div, table, tr, td,
              shortcode WordPress/Divi rimasti.
    Converte: [caption] -> <figure>.
    """
    if not html:
        return ''

    # 1. Rimuovi script/style con contenuto
    html = _RE_SCRIPT_STYLE.sub('', html)

    # 2. Converti [caption ...] ... [/caption] -> <figure>
    html = re.sub(
        r'\[caption[^\]]*\](.*?)\[/caption\]',
        _convert_caption,
        html,
        flags=re.DOTALL | re.IGNORECASE,
    )

    # 3. Proteggi <figure> gia' presenti
    figures = []

    def _save_fig(m):
        figures.append(m.group(0))
        return f'\x00FIG{len(figures) - 1}\x00'

    html = re.sub(
        r'<figure\b[^>]*>.*?</figure>',
        _save_fig,
        html,
        flags=re.DOTALL | re.IGNORECASE,
    )

    # 4. Rimuovi <img> standalone (fuori dalle figure)
    html = re.sub(r'<img\b[^>]*/?>|<img\b[^>]*>', '', html, flags=re.IGNORECASE)

    # 5. Ripristina <figure>
    html = re.sub(r'\x00FIG(\d+)\x00', lambda m: figures[int(m.group(1))], html)

    # 6. Rimuovi shortcode WordPress/Divi rimasti
    html = re.sub(r'\[/?[a-zA-Z_][^\]]*\]', '', html)

    # 7. Strip attributi da tag con attributi
    html = re.sub(r'<([a-zA-Z][a-zA-Z0-9]*)\s+([^>]*?)>', _strip_attrs, html)

    # 8. Rimuovi opening/closing tag degli elementi da unwrappare (senza attributi)
    html = _UNWRAP_OPEN.sub('', html)
    html = _UNWRAP_CLOSE.sub('', html)

    # 9. Normalizza whitespace
    html = re.sub(r'\r\n|\r', '\n', html)
    html = re.sub(r'[ \t]+', ' ', html)
    html = re.sub(r' *\n *', '\n', html)
    html = re.sub(r'\n{3,}', '\n\n', html)
    html = html.strip()

    return html


def count_words(html):
    text = re.sub(r'<[^>]+>', ' ', html)
    text = re.sub(r'&\w+;|&#\d+;', ' ', text)
    return len(text.split())


def count_figures(html):
    return len(re.findall(r'<figure\b', html, re.IGNORECASE))


def count_imgs(html):
    return len(re.findall(r'<img\b', html, re.IGNORECASE))


# ── MAIN ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Estrai contenuti da dump WordPress')
    parser.add_argument('--dump',   default=None, help='Path dump SQL (.sql o .sql.gz)')
    parser.add_argument('--prefix', default=None, help='Prefisso tabelle (es. wppp_)')
    args = parser.parse_args()

    dump_path = find_dump(args.dump)
    sz_mb = dump_path.stat().st_size / 1024 / 1024
    print(f"Dump: {dump_path}")
    print(f"Dimensione: {sz_mb:.1f} MB (compresso)")

    # ── Rileva prefisso ────────────────────────────────────────────────────────
    print("\nRilevamento prefisso tabelle...")
    detected_prefix = detect_prefix(dump_path)
    prefix = args.prefix or detected_prefix
    print(f"Prefisso: '{prefix}'")

    POSTS_TABLE    = prefix + 'posts'
    USERS_TABLE    = prefix + 'users'
    USERMETA_TABLE = prefix + 'usermeta'
    POSTMETA_TABLE = prefix + 'postmeta'

    # ── Estrai colonne dall'INSERT header ──────────────────────────────────────
    print("Lettura intestazioni colonne...")
    post_cols  = get_table_columns(dump_path, POSTS_TABLE)
    user_cols  = get_table_columns(dump_path, USERS_TABLE)
    umeta_cols = get_table_columns(dump_path, USERMETA_TABLE)
    pmeta_cols = get_table_columns(dump_path, POSTMETA_TABLE)

    if post_cols:
        print(f"  {POSTS_TABLE}: {len(post_cols)} colonne ({', '.join(post_cols[:5])}...)")
    else:
        print(f"  {POSTS_TABLE}: colonne non rilevate, uso schema WP standard")

    post_get = make_col_getter(post_cols, {
        'ID': 0, 'post_author': 1, 'post_date': 2,
        'post_content': 4, 'post_title': 5,
        'post_status': 7, 'post_name': 11,
        'guid': 18, 'post_type': 20,
    })
    user_get = make_col_getter(user_cols, {
        'ID': 0, 'user_login': 1, 'user_email': 4,
        'user_registered': 6, 'display_name': 9,
    })
    umeta_get = make_col_getter(umeta_cols, {
        'umeta_id': 0, 'user_id': 1, 'meta_key': 2, 'meta_value': 3,
    })
    pmeta_get = make_col_getter(pmeta_cols, {
        'meta_id': 0, 'post_id': 1, 'meta_key': 2, 'meta_value': 3,
    })

    # ── PASS 1: wppp_posts ────────────────────────────────────────────────────
    print(f"\n[1/4] Scansione {POSTS_TABLE}...")
    articoli = []
    attachments = {}  # attachment_id -> guid URL

    for row in stream_table(dump_path, POSTS_TABLE, progress_every=2000):
        ptype  = post_get(row, 'post_type')   or ''
        status = post_get(row, 'post_status') or ''
        wp_id  = post_get(row, 'ID')

        if ptype == 'attachment':
            guid = post_get(row, 'guid') or ''
            if wp_id is not None:
                attachments[int(wp_id)] = guid
            continue

        if ptype != 'post' or status != 'publish':
            continue

        content = post_get(row, 'post_content') or ''
        layout  = detect_layout(content)
        body    = extract_body(content, layout)
        html    = clean_html(body)

        author_raw = post_get(row, 'post_author')
        articoli.append({
            'wp_id':         int(wp_id) if wp_id is not None else None,
            'slug':          post_get(row, 'post_name')  or '',
            'title':         post_get(row, 'post_title') or '',
            'date':          str(post_get(row, 'post_date') or '')[:10],
            'author_id':     int(author_raw) if author_raw is not None else None,
            'thumbnail_id':  None,
            'html_body':     html,
            'layout_type':   layout,
            'has_sidebar':   layout == '2_3_sidebar',
            'images_count':  count_imgs(html),
            'figures_count': count_figures(html),
            'word_count':    count_words(html),
        })

    print(f"\n  Articoli pubblicati: {len(articoli)}")
    print(f"  Attachment trovati:  {len(attachments)}")

    # ── PASS 2: wppp_postmeta ─────────────────────────────────────────────────
    print(f"\n[2/4] Scansione {POSTMETA_TABLE}...")
    thumbnails = {}   # post_id -> thumbnail_attachment_id
    img_alts   = {}   # attachment_id -> alt text

    for row in stream_table(dump_path, POSTMETA_TABLE, progress_every=10000):
        key = pmeta_get(row, 'meta_key')   or ''
        val = pmeta_get(row, 'meta_value')
        pid = pmeta_get(row, 'post_id')
        if pid is None:
            continue
        pid = int(pid)

        if key == '_thumbnail_id' and val:
            try:
                thumbnails[pid] = int(val)
            except (ValueError, TypeError):
                pass
        elif key == '_wp_attachment_image_alt' and val:
            img_alts[pid] = str(val)

    print(f"\n  Thumbnail trovate: {len(thumbnails)}")

    for a in articoli:
        if a['wp_id'] in thumbnails:
            a['thumbnail_id'] = thumbnails[a['wp_id']]

    immagini = [
        {
            'post_id':         pid,
            'thumbnail_wp_id': tid,
            'src':             attachments.get(tid, ''),
            'alt':             img_alts.get(tid, ''),
        }
        for pid, tid in thumbnails.items()
        if tid is not None
    ]

    # ── PASS 3: wppp_users ────────────────────────────────────────────────────
    print(f"\n[3/4] Scansione {USERS_TABLE}...")
    users = {}

    for row in stream_table(dump_path, USERS_TABLE, progress_every=0):
        uid = user_get(row, 'ID')
        if uid is None:
            continue
        users[int(uid)] = {
            'wp_id':        int(uid),
            'login':        user_get(row, 'user_login'),
            'display_name': user_get(row, 'display_name'),
            'email':        user_get(row, 'user_email'),
            'registered':   str(user_get(row, 'user_registered') or '')[:10],
            'bio':          None,
        }

    print(f"  Utenti trovati: {len(users)}")

    # ── PASS 4: wppp_usermeta ─────────────────────────────────────────────────
    print(f"\n[4/4] Scansione {USERMETA_TABLE}...")

    for row in stream_table(dump_path, USERMETA_TABLE, progress_every=0):
        uid = umeta_get(row, 'user_id')
        key = umeta_get(row, 'meta_key') or ''
        val = umeta_get(row, 'meta_value')
        if uid and key == 'description' and val:
            uid = int(uid)
            if uid in users:
                users[uid]['bio'] = val

    autori = list(users.values())

    # ── Scrivi output ──────────────────────────────────────────────────────────
    print("\nScrivo file di output...")
    for path in [OUT_ARTICOLI, OUT_AUTORI, OUT_IMMAGINI, OUT_REPORT]:
        path.parent.mkdir(parents=True, exist_ok=True)

    with open(OUT_ARTICOLI, 'w', encoding='utf-8') as f:
        json.dump(articoli, f, ensure_ascii=False, indent=2)
    print(f"  {OUT_ARTICOLI.name}: {len(articoli)} articoli")

    with open(OUT_AUTORI, 'w', encoding='utf-8') as f:
        json.dump(autori, f, ensure_ascii=False, indent=2)
    print(f"  {OUT_AUTORI.name}: {len(autori)} autori")

    with open(OUT_IMMAGINI, 'w', encoding='utf-8') as f:
        json.dump(immagini, f, ensure_ascii=False, indent=2)
    print(f"  {OUT_IMMAGINI.name}: {len(immagini)} immagini")

    # ── Genera report ──────────────────────────────────────────────────────────
    layout_counts = Counter(a['layout_type'] for a in articoli)
    short_list = [a for a in articoli if 0 < a['word_count'] < 100]
    empty_list = [a for a in articoli if a['word_count'] == 0]
    with_fig   = [a for a in articoli if a['figures_count'] > 0]

    longevita = next(
        (a for a in articoli if 'longevita' in a['slug'].lower()),
        None,
    )

    lines = [
        "# Analisi Dump WordPress -- Ombre e Luci",
        f"**Data analisi:** 2026-03-20  ",
        f"**Fonte:** `{dump_path.name}` ({sz_mb:.0f} MB compresso)  ",
        f"**Prefisso tabelle:** `{prefix}`\n",
        "## Statistiche Generali\n",
        "| Metrica | Valore |",
        "|---------|--------|",
        f"| Articoli pubblicati estratti | **{len(articoli)}** |",
        f"| Autori (utenti WP) | **{len(autori)}** |",
        f"| Thumbnail mappate | **{len(immagini)}** |",
        f"| Attachment totali | **{len(attachments)}** |",
        f"| Articoli con figure (da caption) | **{len(with_fig)}** |",
        f"| Articoli word_count < 100 | **{len(short_list)}** |",
        f"| Articoli word_count = 0 | **{len(empty_list)}** |\n",
        "## Distribuzione Layout Divi\n",
        "| Layout | Conteggio | % |",
        "|--------|-----------|---|",
    ]
    for lay, cnt in layout_counts.most_common():
        pct = cnt / len(articoli) * 100 if articoli else 0
        lines.append(f"| `{lay}` | {cnt} | {pct:.1f}% |")

    lines += [
        "\n## Articoli word_count < 100 (potenzialmente troncati)\n",
        f"Totale: **{len(short_list)}**\n",
    ]
    for a in short_list[:40]:
        lines.append(
            f"- `{a['slug']}` -- {a['title'][:60]} "
            f"({a['word_count']} parole, `{a['layout_type']}`)"
        )

    if longevita:
        lines += [
            "\n## Esempio: `longevita-nella-disabilita`\n",
            f"- Layout: `{longevita['layout_type']}`",
            f"- Parole: {longevita['word_count']}",
            f"- Figure: {longevita['figures_count']}\n",
            "```html",
            longevita['html_body'][:3000],
            "```\n",
        ]

    if with_fig:
        lines.append("\n## Esempi con `<figure>` (conversione da `[caption]`)\n")
        for a in with_fig[:3]:
            fig_matches = re.findall(r'<figure>.*?</figure>', a['html_body'], re.DOTALL)
            lines += [
                f"### {a['title']} (`{a['slug']}`)",
                f"Figure count: {a['figures_count']}",
                "```html",
            ]
            for fm in fig_matches[:2]:
                lines.append(fm)
            lines += ["```\n"]

    with open(OUT_REPORT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f"  {OUT_REPORT.name}: report salvato")

    # ── Stampa sommario (ASCII per compatibilita' Windows CP1252) ──────────────
    SEP = '=' * 60
    DIV = '-' * 60

    print(f"\n{SEP}")
    print("SOMMARIO ESTRAZIONE")
    print(SEP)
    print(f"Articoli estratti:      {len(articoli)}")
    print("\nDistribuzione layout:")
    for lay, cnt in layout_counts.most_common():
        pct = cnt / len(articoli) * 100 if articoli else 0
        print(f"  {lay:<22} {cnt:>5}  ({pct:.1f}%)")
    print(f"\nArticoli word_count < 100:  {len(short_list)}")
    print(f"Articoli word_count = 0:    {len(empty_list)}")

    if longevita:
        print(f"\n{DIV}")
        print("ESEMPIO: longevita-nella-disabilita")
        print(f"Layout: {longevita['layout_type']} | Parole: {longevita['word_count']}")
        print(DIV)
        # Encode-safe print
        body_sample = longevita['html_body'][:2000]
        sys.stdout.buffer.write(body_sample.encode('utf-8'))
        sys.stdout.buffer.write(b'\n')

    if with_fig:
        print(f"\n{DIV}")
        print(f"ESEMPI CON <figure> ({len(with_fig)} articoli con figure)")
        for a in with_fig[:3]:
            print(f"\n  [{a['slug']}]")
            figs = re.findall(r'<figure>.*?</figure>', a['html_body'], re.DOTALL)
            for fig in figs[:1]:
                sys.stdout.buffer.write(f"  {fig[:500]}".encode('utf-8'))
                sys.stdout.buffer.write(b'\n')

    print(f"\n{DIV}")
    print("File scritti:")
    print(f"  {OUT_ARTICOLI}")
    print(f"  {OUT_AUTORI}")
    print(f"  {OUT_IMMAGINI}")
    print(f"  {OUT_REPORT}")
    print("\nFatto.")


if __name__ == '__main__':
    main()
