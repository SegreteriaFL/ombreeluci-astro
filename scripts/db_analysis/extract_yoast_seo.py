#!/usr/bin/env python3
"""
scripts/db_analysis/extract_yoast_seo.py

TASK 1  — Aggiunge campo `lang` ad articoli_wp_puliti.json (da frontmatter .md)
TASK 2  — Estrae SEO Yoast da wppp_yoast_indexable
TASK 3  — Estrae link interni da wppp_yoast_seo_links → link_interni_yoast.json
TASK 4  — Estrae old slug/date da wppp_postmeta → redirects_necessari.json
TASK 5  — Estrae fallback SEO da wppp_postmeta (metadesc, focuskw, og-image)

Input dumps:
  dump_db_old/Sql980379_3.sql.gz       (tabelle principali: wppp_postmeta)
  dump_db_old/Sql980379_3_yoast.sql.gz (tabelle Yoast)

Output:
  scripts/db_analysis/output/articoli_wp_puliti.json    (aggiornato con lang + SEO)
  scripts/db_analysis/output/link_interni_yoast.json
  scripts/db_analysis/output/redirects_necessari.json
"""

import gzip
import json
import re
import sys
from pathlib import Path

ROOT      = Path(__file__).resolve().parent.parent.parent
DUMP_MAIN = ROOT / "dump_db_old" / "Sql980379_3.sql.gz"
DUMP_YOAST= ROOT / "dump_db_old" / "Sql980379_3_yoast.sql.gz"
OUT_DIR   = ROOT / "scripts" / "db_analysis" / "output"
ARTICOLI  = OUT_DIR / "articoli_wp_puliti.json"
OUT_LINKS = OUT_DIR / "link_interni_yoast.json"
OUT_REDIR = OUT_DIR / "redirects_necessari.json"
CONTENT_DIR = ROOT / "src" / "content" / "blog"

PREFIX = "wppp_"


# ── OUTPUT HELPER (UTF-8 safe on Windows) ─────────────────────────────────────

def w(s):
    sys.stdout.buffer.write((str(s) + "\n").encode("utf-8"))


# ── SQL STREAMING HELPERS ─────────────────────────────────────────────────────

def open_sql(path):
    if str(path).endswith(".gz"):
        return gzip.open(path, "rt", encoding="utf-8", errors="replace")
    return open(path, "r", encoding="utf-8", errors="replace")


def parse_sql_values(s):
    """Parse MySQL VALUES clause into list of rows (list of values)."""
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
                        esc = {
                            "n": "\n", "r": "\r", "t": "\t",
                            "\\": "\\", "'": "'", '"': '"',
                            "0": "\0", "Z": "\x1a", "b": "\b",
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
                row.append("".join(buf))
            elif s[i:i+4] == "NULL" and (i+4 >= n or s[i+4] in ",) \t\n\r"):
                row.append(None)
                i += 4
            else:
                j = i
                while j < n and s[j] not in ",)":
                    j += 1
                raw = s[i:j].strip()
                row.append(
                    None if raw in ("NULL", "") else
                    (int(raw) if raw.lstrip("-").isdigit() else raw)
                )
                i = j
        if row:
            rows.append(row)
    return rows


def get_table_columns(dump_path, table_name):
    pat = re.compile(
        rf"INSERT INTO `{re.escape(table_name)}`\s*\(([^)]+)\)\s+VALUES",
        re.IGNORECASE,
    )
    with open_sql(dump_path) as f:
        for line in f:
            m = pat.search(line)
            if m:
                return [c.strip().strip("`") for c in m.group(1).split(",")]
    return []


def stream_table(dump_path, table_name, progress_every=0):
    """Yield each row as a list from the named table (phpMyAdmin format)."""
    tre = re.compile(rf"INSERT INTO `{re.escape(table_name)}`", re.IGNORECASE)
    ire = re.compile(r"^INSERT INTO `", re.IGNORECASE)
    in_ins = False
    count = 0
    with open_sql(dump_path) as f:
        for raw in f:
            line = raw.rstrip("\n")
            if tre.search(line):
                in_ins = True
                m = re.search(r"VALUES\s+(\(.+)", line, re.IGNORECASE)
                if m:
                    for row in parse_sql_values(m.group(1).rstrip().rstrip(";")):
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
            if not ls.startswith("("):
                continue
            rline = ls.rstrip()
            if rline.endswith(");"):
                row_str, in_ins = rline[:-1], False
            elif rline.endswith("),"):
                row_str = rline[:-1]
            else:
                row_str = rline
            for row in parse_sql_values(row_str):
                yield row
                count += 1
                if progress_every and count % progress_every == 0:
                    w(f"    ... {count}")


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


# ── TASK 1: LANG DA FRONTMATTER .md ──────────────────────────────────────────

def build_lang_map():
    """Scansiona src/content/blog/**/*.md e restituisce {wp_id: lang}."""
    lang_map = {}
    md_files = list(CONTENT_DIR.rglob("*.md"))
    wp_re  = re.compile(r"^wp_id:\s*(\d+)", re.MULTILINE)
    lang_re = re.compile(r'^lang:\s*["\']?([a-z]{2})["\']?', re.MULTILINE)
    for f in md_files:
        try:
            content = f.read_text(encoding="utf-8", errors="replace")[:800]
        except Exception:
            continue
        wp_m   = wp_re.search(content)
        lang_m = lang_re.search(content)
        if wp_m:
            wp_id = int(wp_m.group(1))
            lang  = lang_m.group(1).strip() if lang_m else "it"
            lang_map[wp_id] = lang
    return lang_map


# ── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    SEP = "=" * 60

    # ── Carica articoli ────────────────────────────────────────────────────────
    w(f"\n{SEP}")
    w("CARICAMENTO articoli_wp_puliti.json")
    w(SEP)
    with open(ARTICOLI, encoding="utf-8") as f:
        articoli = json.load(f)
    articoli_by_wpid = {a["wp_id"]: a for a in articoli}
    w(f"Articoli: {len(articoli)}")

    # ── TASK 1: lang ──────────────────────────────────────────────────────────
    w(f"\n{SEP}")
    w("TASK 1 — Lang da frontmatter .md")
    w(SEP)
    lang_map = build_lang_map()
    w(f"wp_id con lang in .md: {len(lang_map)}")
    en_count = sum(1 for v in lang_map.values() if v == "en")
    it_count = sum(1 for v in lang_map.values() if v == "it")
    w(f"  it: {it_count}  en: {en_count}")

    added = 0
    for a in articoli:
        lang = lang_map.get(a["wp_id"], "it")
        a["lang"] = lang
        added += 1
    w(f"Campo lang aggiunto: {added} articoli")
    en_in_json = sum(1 for a in articoli if a.get("lang") == "en")
    w(f"Articoli EN nel JSON: {en_in_json}")

    # ── TASK 2: Yoast indexable ───────────────────────────────────────────────
    w(f"\n{SEP}")
    w("TASK 2 — Yoast indexable")
    w(SEP)
    idx_cols = get_table_columns(DUMP_YOAST, PREFIX + "yoast_indexable")
    w(f"Colonne wppp_yoast_indexable: {len(idx_cols)}")
    idx_get = make_getter(idx_cols, {
        "id": 0, "permalink": 1, "object_id": 3, "object_type": 4,
        "title": 8, "description": 9,
        "canonical": 16,
        "primary_focus_keyword": 17,
        "readability_score": 19,
        "is_cornerstone": 20,
        "open_graph_title": 31,
        "open_graph_description": 32,
        "open_graph_image": 33,
        "schema_page_type": 45,
        "schema_article_type": 46,
        "estimated_reading_time_minutes": 47,
        "language": 43,
    })

    yoast_matched = 0
    yoast_post_total = 0

    for row in stream_table(DUMP_YOAST, PREFIX + "yoast_indexable"):
        obj_type = idx_get(row, "object_type")
        if obj_type != "post":
            continue
        yoast_post_total += 1
        obj_id = idx_get(row, "object_id")
        if obj_id is None:
            continue
        wp_id = int(obj_id)
        if wp_id not in articoli_by_wpid:
            continue
        a = articoli_by_wpid[wp_id]

        def val(field):
            v = idx_get(row, field)
            return str(v).strip() if v is not None else None

        a["yoast_title"]           = val("title")
        a["yoast_description"]     = val("description")
        a["yoast_og_title"]        = val("open_graph_title")
        a["yoast_og_description"]  = val("open_graph_description")
        a["yoast_og_image"]        = val("open_graph_image")
        a["yoast_canonical"]       = val("canonical")
        a["yoast_schema_type"]     = val("schema_article_type") or val("schema_page_type")
        rt = idx_get(row, "estimated_reading_time_minutes")
        a["yoast_reading_time"]    = int(rt) if rt is not None else None
        ic = idx_get(row, "is_cornerstone")
        a["yoast_is_cornerstone"]  = bool(int(ic)) if ic is not None else False
        yoast_matched += 1

    w(f"Record post in yoast_indexable: {yoast_post_total}")
    w(f"Articoli arricchiti con Yoast: {yoast_matched}")

    # ── TASK 3: link interni da yoast_seo_links ───────────────────────────────
    w(f"\n{SEP}")
    w("TASK 3 — Link interni (wppp_yoast_seo_links)")
    w(SEP)
    lnk_cols = get_table_columns(DUMP_YOAST, PREFIX + "yoast_seo_links")
    w(f"Colonne wppp_yoast_seo_links: {len(lnk_cols)}")
    lnk_get = make_getter(lnk_cols, {
        "id": 0, "url": 1, "post_id": 2, "target_post_id": 3,
        "type": 4, "indexable_id": 5, "target_indexable_id": 6,
        "height": 7, "width": 8, "size": 9, "language": 10, "region": 11,
    })

    links = []
    for row in stream_table(DUMP_YOAST, PREFIX + "yoast_seo_links"):
        post_id = lnk_get(row, "post_id")
        if post_id is None:
            continue
        # include only links from or to known articles
        pid = int(post_id)
        tid_raw = lnk_get(row, "target_post_id")
        tid = int(tid_raw) if tid_raw is not None else None
        if pid not in articoli_by_wpid and (tid is None or tid not in articoli_by_wpid):
            continue
        links.append({
            "id":                  lnk_get(row, "id"),
            "url":                 lnk_get(row, "url"),
            "post_id":             pid,
            "target_post_id":      tid,
            "type":                lnk_get(row, "type"),
            "indexable_id":        lnk_get(row, "indexable_id"),
            "target_indexable_id": lnk_get(row, "target_indexable_id"),
            "height":              lnk_get(row, "height"),
            "width":               lnk_get(row, "width"),
            "size":                lnk_get(row, "size"),
            "language":            lnk_get(row, "language"),
            "region":              lnk_get(row, "region"),
        })

    with open(OUT_LINKS, "w", encoding="utf-8") as f:
        json.dump(links, f, ensure_ascii=False, indent=2)
    w(f"Link interni estratti: {len(links)}")
    w(f"Output: {OUT_LINKS}")

    # ── TASK 4 & 5: postmeta (old slugs + SEO fallbacks) ─────────────────────
    w(f"\n{SEP}")
    w("TASK 4+5 — Postmeta: old slugs + SEO fallbacks (wppp_postmeta)")
    w(SEP)
    pmeta_cols = get_table_columns(DUMP_MAIN, PREFIX + "postmeta")
    w(f"Colonne wppp_postmeta: {len(pmeta_cols)}")
    pm_get = make_getter(pmeta_cols, {
        "meta_id": 0, "post_id": 1, "meta_key": 2, "meta_value": 3,
    })

    REDIRECT_KEYS = {"_wp_old_slug", "_wp_old_date"}
    SEO_KEYS = {
        "_yoast_wpseo_metadesc",
        "_yoast_wpseo_focuskw",
        "_yoast_wpseo_opengraph-image",
    }
    TARGET_KEYS = REDIRECT_KEYS | SEO_KEYS

    redirects_map = {}   # wp_id -> {old_slugs: [], old_dates: []}
    seo_meta_map  = {}   # wp_id -> {metadesc, focuskw, og_image}
    pm_count = 0

    for row in stream_table(DUMP_MAIN, PREFIX + "postmeta", progress_every=50000):
        key = pm_get(row, "meta_key") or ""
        if key not in TARGET_KEYS:
            continue
        pid_raw = pm_get(row, "post_id")
        if pid_raw is None:
            continue
        pid = int(pid_raw)
        if pid not in articoli_by_wpid:
            continue
        val = pm_get(row, "meta_value")
        pm_count += 1

        if key == "_wp_old_slug":
            redirects_map.setdefault(pid, {"old_slugs": [], "old_dates": []})
            if val:
                redirects_map[pid]["old_slugs"].append(str(val))
        elif key == "_wp_old_date":
            redirects_map.setdefault(pid, {"old_slugs": [], "old_dates": []})
            if val:
                redirects_map[pid]["old_dates"].append(str(val))
        elif key == "_yoast_wpseo_metadesc":
            seo_meta_map.setdefault(pid, {})
            seo_meta_map[pid]["metadesc"] = str(val) if val else None
        elif key == "_yoast_wpseo_focuskw":
            seo_meta_map.setdefault(pid, {})
            seo_meta_map[pid]["focuskw"] = str(val) if val else None
        elif key == "_yoast_wpseo_opengraph-image":
            seo_meta_map.setdefault(pid, {})
            seo_meta_map[pid]["og_image"] = str(val) if val else None

    w(f"Postmeta righe rilevanti: {pm_count}")

    # Applica fallback SEO ad articoli
    fallback_applied = 0
    for wp_id, seo in seo_meta_map.items():
        if wp_id not in articoli_by_wpid:
            continue
        a = articoli_by_wpid[wp_id]
        # Se yoast_description mancante, usa metadesc da postmeta
        if not a.get("yoast_description") and seo.get("metadesc"):
            a["yoast_description"] = seo["metadesc"]
            fallback_applied += 1
        if not a.get("yoast_og_image") and seo.get("og_image"):
            a["yoast_og_image"] = seo["og_image"]
        if seo.get("focuskw"):
            a["yoast_focuskw"] = seo["focuskw"]
    w(f"Fallback metadesc applicati: {fallback_applied}")

    # Costruisci redirects_necessari.json
    redirects = []
    for wp_id, data in redirects_map.items():
        a = articoli_by_wpid.get(wp_id)
        if not a:
            continue
        for old_slug in data["old_slugs"]:
            redirects.append({
                "type":     "old_slug",
                "wp_id":    wp_id,
                "slug_new": a["slug"],
                "slug_old": old_slug,
            })
        for old_date in data["old_dates"]:
            redirects.append({
                "type":     "old_date_slug",
                "wp_id":    wp_id,
                "slug_new": a["slug"],
                "date_old": old_date,
            })

    with open(OUT_REDIR, "w", encoding="utf-8") as f:
        json.dump(redirects, f, ensure_ascii=False, indent=2)
    w(f"Redirect necessari: {len(redirects)}  (articoli coinvolti: {len(redirects_map)})")
    w(f"Output: {OUT_REDIR}")

    # ── Salva articoli aggiornato ──────────────────────────────────────────────
    w(f"\n{SEP}")
    w("SALVATAGGIO articoli_wp_puliti.json")
    w(SEP)
    with open(ARTICOLI, "w", encoding="utf-8") as f:
        json.dump(articoli, f, ensure_ascii=False, indent=2)
    w(f"Articoli salvati: {len(articoli)}")

    # ── Statistiche finali ────────────────────────────────────────────────────
    w(f"\n{SEP}")
    w("RIEPILOGO FINALE")
    w(SEP)
    has_yoast_title  = sum(1 for a in articoli if a.get("yoast_title"))
    has_yoast_desc   = sum(1 for a in articoli if a.get("yoast_description"))
    has_yoast_img    = sum(1 for a in articoli if a.get("yoast_og_image"))
    has_canonical    = sum(1 for a in articoli if a.get("yoast_canonical"))
    has_cornerstone  = sum(1 for a in articoli if a.get("yoast_is_cornerstone"))
    has_reading_time = sum(1 for a in articoli if a.get("yoast_reading_time"))
    lang_en = sum(1 for a in articoli if a.get("lang") == "en")
    lang_it = sum(1 for a in articoli if a.get("lang") == "it")

    w(f"Articoli IT: {lang_it}  EN: {lang_en}")
    w(f"Con yoast_title:        {has_yoast_title}")
    w(f"Con yoast_description:  {has_yoast_desc}")
    w(f"Con yoast_og_image:     {has_yoast_img}")
    w(f"Con yoast_canonical:    {has_canonical}")
    w(f"Is cornerstone:         {has_cornerstone}")
    w(f"Con reading_time:       {has_reading_time}")
    w(f"Link interni:           {len(links)}")
    w(f"Redirect necessari:     {len(redirects)}")
    w("\nFatto.")


if __name__ == "__main__":
    main()
