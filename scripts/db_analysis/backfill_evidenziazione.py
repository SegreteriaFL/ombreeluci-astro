#!/usr/bin/env python3
"""
backfill_evidenziazione.py

Ricostruisce le <div class="evidenziazione"> nei corpi degli articoli Directus
estraendole dal dump SQL WordPress grezzo (Sql980379_3.sql.gz).

Strategia di posizionamento:
  - Trova nel corpo Divi grezzo il paragrafo immediatamente precedente all'evidenziazione
  - Cerca quel testo-ancora nel corpus Directus (match fuzzy su 60+ chars)
  - Inserisce <p class="evidenziazione">TESTO</p> dopo il </p> dell'ancora
  - Se l'ancora non si trova, cerca il paragrafo successivo all'evidenziazione

Uso:
    python3 scripts/db_analysis/backfill_evidenziazione.py --dry-run
    python3 scripts/db_analysis/backfill_evidenziazione.py
    python3 scripts/db_analysis/backfill_evidenziazione.py --limit 20
"""

import argparse
import gzip
import json
import re
import sys
import time
import unicodedata
from pathlib import Path

import urllib.request
import urllib.parse

ROOT = Path(__file__).resolve().parent.parent.parent
DUMP_PATH = ROOT / "dump_db_old" / "Sql980379_3.sql.gz"
LOG_PATH = ROOT / "scripts/db_analysis/logs" / "backfill_evidenziazione.json"

DIRECTUS_URL = "http://159.69.196.64:8055"
DIRECTUS_TOKEN = "nBZ6kdd0YgVnhLm2TZEDoT9A-NJujwVU"


# ── HTTP helpers ────────────────────────────────────────────────────────────────

def directus_get(path, params=None):
    url = f"{DIRECTUS_URL}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {DIRECTUS_TOKEN}"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def directus_patch(item_id, data):
    url = f"{DIRECTUS_URL}/items/articoli/{item_id}"
    body = json.dumps(data).encode()
    req = urllib.request.Request(
        url,
        data=body,
        method="PATCH",
        headers={
            "Authorization": f"Bearer {DIRECTUS_TOKEN}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


# ── SQL dump parser (solo campo post_content) ───────────────────────────────────

def parse_sql_values_posts(s):
    """
    Parsa la parte VALUES di una riga INSERT INTO wppp_posts.
    Restituisce lista di dict con almeno ID, post_name, post_content, post_status, post_type.
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
                row.append(None if raw in ('NULL', '') else raw)
                i = j

        if row:
            rows.append(row)

    return rows


def stream_posts_with_evidenziazione(dump_path):
    """
    Legge il dump SQL e restituisce dict {wp_id: post_content} solo per articoli
    con evidenziazione nel corpo.
    """
    results = {}
    col_names = []
    col_idx = {}
    in_posts = False

    with gzip.open(dump_path, 'rt', encoding='utf-8', errors='replace') as f:
        for line_no, raw_line in enumerate(f):
            line = raw_line.rstrip('\n')

            if not in_posts:
                m = re.match(r"INSERT INTO `(\w+posts)`\s*\(([^)]+)\)\s+VALUES", line, re.IGNORECASE)
                if m:
                    col_names = [c.strip().strip('`') for c in m.group(2).split(',')]
                    col_idx = {c: i for i, c in enumerate(col_names)}
                    in_posts = True
                continue

            # Fine tabella posts
            if line.startswith('INSERT INTO') and 'posts' not in line.lower():
                in_posts = False
                continue

            if not line.startswith('(') and 'evidenziazione' not in line:
                continue

            m = re.match(r"INSERT INTO `\w+`[^(]*(\(.*)", line, re.DOTALL)
            if m:
                vals_str = m.group(1)
            else:
                vals_str = line

            rows = parse_sql_values_posts(vals_str)
            for row in rows:
                if len(row) <= max(col_idx.get('post_content', 0),
                                   col_idx.get('post_status', 0),
                                   col_idx.get('post_type', 0)):
                    continue
                status = row[col_idx.get('post_status', -1)] if 'post_status' in col_idx else None
                ptype = row[col_idx.get('post_type', -1)] if 'post_type' in col_idx else None
                if status != 'publish' or ptype != 'post':
                    continue
                content = row[col_idx.get('post_content', -1)] if 'post_content' in col_idx else None
                if not content or 'evidenziazione' not in content:
                    continue
                wp_id = row[col_idx.get('ID', 0)]
                try:
                    wp_id = int(wp_id)
                except (TypeError, ValueError):
                    continue
                results[wp_id] = content

    return results


# ── Evidenziazione extractor ────────────────────────────────────────────────────

DIV_EVID_RE = re.compile(
    r'<div\s+class=["\']evidenziazione["\']>(.*?)</div>',
    re.DOTALL | re.IGNORECASE,
)
# Anche con class prima e dopo altri attributi
DIV_EVID_RE2 = re.compile(
    r'<div[^>]+class=["\'][^"\']*evidenziazione[^"\']*["\'][^>]*>(.*?)</div>',
    re.DOTALL | re.IGNORECASE,
)


def extract_text(html):
    """Rimuove tag HTML e normalizza whitespace."""
    t = re.sub(r'<[^>]+>', ' ', html or '')
    t = re.sub(r'&nbsp;', ' ', t)
    t = re.sub(r'&amp;', '&', t)
    t = re.sub(r'&lt;', '<', t)
    t = re.sub(r'&gt;', '>', t)
    t = re.sub(r'&[a-z]+;|&#\d+;', '', t)
    t = re.sub(r'\s+', ' ', t)
    return t.strip()


def normalize(s):
    """
    Normalizzazione aggressiva per confronto tra testo dump (mojibake) e testo Directus:
    - tenta correzione encoding
    - rimuove accenti e segni diacritici
    - tiene solo a-z e spazi (no cifre, no punteggiatura, no caratteri speciali)
    - così 'Sí' == 'Si', '«ciao»' == 'ciao', mojibake drops silently
    """
    # tentativo fix mojibake
    try:
        s2 = s.encode('latin-1').decode('utf-8')
        s = s2
    except (UnicodeDecodeError, UnicodeEncodeError):
        pass
    # rimuovi tag HTML residui
    s = re.sub(r'<[^>]+>', ' ', s)
    # normalizza unicode → decomponi
    s = unicodedata.normalize('NFD', s)
    # tieni solo lettere base (categoria 'L' ma non 'Mn' = combining marks)
    s = ''.join(c for c in s if unicodedata.category(c) not in ('Mn', 'Po', 'Ps', 'Pe', 'Pi', 'Pf', 'Pd'))
    s = s.lower()
    # tieni solo a-z e spazi
    s = re.sub(r'[^a-z ]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def find_evidenziazioni_with_anchors(raw_html):
    """
    Trova tutte le evidenziazioni nel corpo Divi grezzo con le ancore di posizionamento.
    Restituisce lista di dict:
      {
        'text': testo evidenziazione (HTML pulito),
        'prev_anchor': testo del paragrafo precedente (>60 chars, per ricerca in Directus),
        'next_anchor': testo del paragrafo successivo (fallback),
      }
    """
    # Usa entrambi i pattern
    matches_pos = []
    for m in DIV_EVID_RE.finditer(raw_html):
        matches_pos.append((m.start(), m.end(), m.group(1)))
    for m in DIV_EVID_RE2.finditer(raw_html):
        # evita duplicati
        already = any(abs(m.start() - p[0]) < 5 for p in matches_pos)
        if not already:
            matches_pos.append((m.start(), m.end(), m.group(1)))

    matches_pos.sort(key=lambda x: x[0])

    results = []
    for start, end, inner in matches_pos:
        evid_text = extract_text(inner).strip()
        if not evid_text:
            continue

        # Cerca paragrafo precedente (cerca </p> prima di start)
        prev_anchor = None
        before = raw_html[:start]
        # Rimuovi escape SQL se presenti
        before_clean = before.replace('\\"', '"').replace("\\'", "'")
        before_clean = before_clean.replace('\\r\\n', '\n').replace('\\r', '\n').replace('\\n', '\n')

        # Prova 1: </p>
        p_ends = [m.end() for m in re.finditer(r'</p>', before_clean, re.IGNORECASE)]
        if p_ends:
            last_p_end = p_ends[-1]
            p_starts = [m.start() for m in re.finditer(r'<p[ >]', before_clean[:last_p_end], re.IGNORECASE)]
            if p_starts:
                p_start = p_starts[-1]
                prev_html = before_clean[p_start:last_p_end]
                prev_text = extract_text(prev_html)
                if len(prev_text) > 40:
                    prev_anchor = prev_text[-80:].strip()

        # Prova 2: plain text separato da \n (articoli senza <p> tags)
        if not prev_anchor:
            lines = [l.strip() for l in re.split(r'\n+', before_clean) if l.strip()]
            lines = [extract_text(l) for l in lines]
            lines = [l for l in lines if len(l) > 40]
            if lines:
                prev_anchor = lines[-1][-80:].strip()

        # Cerca paragrafo successivo (fallback)
        next_anchor = None
        after = raw_html[end:]
        p_m = re.search(r'<p[ >]', after, re.IGNORECASE)
        if p_m:
            p_end_m = re.search(r'</p>', after[p_m.start():], re.IGNORECASE)
            if p_end_m:
                next_html = after[p_m.start():p_m.start() + p_end_m.end()]
                next_text = extract_text(next_html)
                if len(next_text) > 40:
                    next_anchor = next_text[:80].strip()

        results.append({
            'text': evid_text,
            'prev_anchor': prev_anchor,
            'next_anchor': next_anchor,
        })

    return results


# ── Inserimento nel corpo Directus ─────────────────────────────────────────────

def find_insertion_point(corpo, anchor_text, after=True):
    """
    Trova la posizione di inserimento nel corpo Directus usando anchor_text.
    after=True: inserisce dopo il </p> che contiene l'ancora
    after=False: inserisce prima del <p> che contiene l'ancora
    Restituisce indice di inserimento o None.
    """
    if not anchor_text or not corpo:
        return None

    # Prova match progressivamente più corto
    for length in [80, 60, 40, 25]:
        snippet = normalize(anchor_text[-length:] if after else anchor_text[:length])
        if len(snippet) < 20:
            continue

        corpo_norm = normalize(corpo)

        # Cerca snippet nel testo normalizzato
        idx_norm = corpo_norm.find(snippet)
        if idx_norm == -1:
            # Prova con le prime 5 parole
            words = snippet.split()
            if len(words) >= 4:
                short = ' '.join(words[:5])
                idx_norm = corpo_norm.find(short)

        if idx_norm == -1:
            continue

        # Mappa indice normalizzato → indice nel corpo originale (approx)
        ratio = len(corpo) / max(len(corpo_norm), 1)
        approx_idx = int(idx_norm * ratio)

        # Cerca </p> o <br> dopo (o <p> prima) nel corpus originale
        # Finestra generosa: il mapping ratio è approssimativo
        search_from = max(0, approx_idx - 100)
        search_to = min(len(corpo), approx_idx + len(anchor_text) * 3 + 300)

        if after:
            # Prima cerca </p>, poi <br> come fallback
            close_m = re.search(r'</p>|<br\s*/?>|</div>', corpo[search_from:search_to], re.IGNORECASE)
            if close_m:
                return search_from + close_m.end()
        else:
            open_m = re.search(r'<p[ >]', corpo[search_from:search_to], re.IGNORECASE)
            if open_m:
                return search_from + open_m.start()

    return None


def insert_evidenziazione(corpo, evid_items):
    """
    Inserisce una o più evidenziazioni nel corpus.
    Ogni item: {text, prev_anchor, next_anchor}
    Restituisce nuovo corpo e lista di risultati per item.
    """
    modified = corpo
    results = []
    offset = 0  # compensa spostamenti dovuti a inserimenti precedenti

    for item in evid_items:
        evid_html = f'<p class="evidenziazione">{item["text"]}</p>\n'
        inserted = False

        # 1. Prova ancora precedente (inserisci dopo)
        pos = find_insertion_point(modified, item['prev_anchor'], after=True)
        if pos is not None:
            modified = modified[:pos] + '\n' + evid_html + modified[pos:]
            results.append({'status': 'ok_prev', 'text': item['text'][:60]})
            inserted = True

        if not inserted:
            # 2. Prova ancora successiva (inserisci prima)
            pos = find_insertion_point(modified, item['next_anchor'], after=False)
            if pos is not None:
                modified = modified[:pos] + evid_html + '\n' + modified[pos:]
                results.append({'status': 'ok_next', 'text': item['text'][:60]})
                inserted = True

        if not inserted:
            results.append({'status': 'not_found', 'text': item['text'][:60]})

    return modified, results


# ── Main ────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Backfill evidenziazione nei corpi Directus')
    parser.add_argument('--dry-run', action='store_true', help='Non scrive su Directus')
    parser.add_argument('--limit', type=int, default=0, help='Limita a N articoli (0=tutti)')
    parser.add_argument('--wp-id', type=int, default=0, help='Processa solo questo wp_id')
    args = parser.parse_args()

    print("=== Backfill evidenziazione ===")
    print(f"Dry-run: {args.dry_run}")

    # 1. Estrai articoli con evidenziazione dal dump SQL
    print(f"\n[1/4] Lettura dump SQL: {DUMP_PATH.name} ...")
    wp_bodies = stream_posts_with_evidenziazione(DUMP_PATH)
    print(f"  Trovati {len(wp_bodies)} articoli con evidenziazione nel dump")

    if args.wp_id:
        wp_bodies = {k: v for k, v in wp_bodies.items() if k == args.wp_id}
        print(f"  Filtro --wp-id {args.wp_id}: {len(wp_bodies)} articoli")

    # 2. Carica articoli da Directus (paginato)
    print("\n[2/4] Caricamento articoli da Directus ...")
    all_directus = []
    page = 1
    limit = 500
    while True:
        resp = directus_get("/items/articoli", {
            "fields": "id,wp_id,slug,corpo",
            "limit": limit,
            "offset": (page - 1) * limit,
            "filter[wp_id][_nnull]": "true",
        })
        batch = resp.get("data", [])
        all_directus.extend(batch)
        print(f"  Pagina {page}: {len(batch)} articoli (totale: {len(all_directus)})")
        if len(batch) < limit:
            break
        page += 1

    # Mappa wp_id → articolo Directus
    wp_to_directus = {}
    for a in all_directus:
        try:
            wid = int(a.get("wp_id") or 0)
            if wid:
                wp_to_directus[wid] = a
        except (TypeError, ValueError):
            pass

    print(f"  Articoli Directus con wp_id: {len(wp_to_directus)}")

    # 3. Processa
    print("\n[3/4] Elaborazione ...")
    log = []
    processed = 0
    ok = 0
    skipped = 0
    not_in_directus = 0

    wp_ids = sorted(wp_bodies.keys())
    if args.limit:
        wp_ids = wp_ids[:args.limit]

    for wp_id in wp_ids:
        raw_html = wp_bodies[wp_id]
        directus_art = wp_to_directus.get(wp_id)

        if not directus_art:
            not_in_directus += 1
            log.append({'wp_id': wp_id, 'status': 'not_in_directus'})
            continue

        directus_id = directus_art['id']
        slug = directus_art.get('slug', '')
        corpo = directus_art.get('corpo') or ''

        # Già presente?
        if 'evidenziazione' in corpo:
            skipped += 1
            log.append({'wp_id': wp_id, 'slug': slug, 'status': 'already_present'})
            continue

        # Estrai evidenziazioni con ancore
        evid_items = find_evidenziazioni_with_anchors(raw_html)
        if not evid_items:
            log.append({'wp_id': wp_id, 'slug': slug, 'status': 'parse_failed'})
            continue

        # Inserisci nel corpo
        new_corpo, item_results = insert_evidenziazione(corpo, evid_items)

        inserted_count = sum(1 for r in item_results if r['status'].startswith('ok'))
        failed_count = sum(1 for r in item_results if r['status'] == 'not_found')

        entry = {
            'wp_id': wp_id,
            'directus_id': directus_id,
            'slug': slug,
            'total_evidenziazioni': len(evid_items),
            'inserted': inserted_count,
            'not_found': failed_count,
            'items': item_results,
        }

        if new_corpo == corpo:
            entry['status'] = 'no_change'
            log.append(entry)
            continue

        entry['status'] = 'patched' if not args.dry_run else 'dry_run'
        log.append(entry)

        print(f"  [{processed+1}] {slug} — {inserted_count}/{len(evid_items)} inserite"
              + (' [DRY]' if args.dry_run else ''))

        if not args.dry_run:
            try:
                directus_patch(directus_id, {"corpo": new_corpo})
                ok += 1
                time.sleep(0.1)
            except Exception as e:
                entry['status'] = 'error'
                entry['error'] = str(e)
                print(f"    ERROR: {e}")
        else:
            ok += 1

        processed += 1

    # 4. Salva log
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_PATH, 'w', encoding='utf-8') as f:
        json.dump(log, f, ensure_ascii=False, indent=2)

    print(f"\n[4/4] Completato")
    print(f"  Elaborati:       {processed}")
    print(f"  OK/patchati:     {ok}")
    print(f"  Già presenti:    {skipped}")
    print(f"  Non in Directus: {not_in_directus}")
    print(f"  Log: {LOG_PATH}")


if __name__ == "__main__":
    main()
