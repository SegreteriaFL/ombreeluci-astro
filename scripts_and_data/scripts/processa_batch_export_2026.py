#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
COMMIT: fix(pipeline): processa export 2026 in 4 batch, preserva meta/tax reali, pulizia HTML conservativa (menu <p>, divi shortcode), merge + json/jsonl/report/csv

Script: processa_batch_export_2026.py
Scopo: AI-OEL Fase 0/4 — Unione + pulizia conservativa export DB Ombre e Luci 2026 (3488 articoli)

Input (nella stessa cartella o --batch-dir):
  - export_1000_1  (oppure export_1000_1.json)
  - export_1000_2  (oppure export_1000_2.json)
  - export_1000_3  (oppure export_1000_3.json)
  - export_1000_4  (oppure export_1000_4.json)

Formato record atteso (export 2026):
{
  "id": 22576,
  "url": "https://www.ombreeluci.it/?p=22576",
  "meta": {"title":"...", "date":"...", "author":"..."},
  "tax": {
    "categories":[{"term_id":1,"slug":"...","name":"..."}],
    "tags":[{"term_id":2,"slug":"...","name":"..."}]
  },
  "raw_html": "<p>...</p>"
}

Output (in --outdir):
  - articoli_semantici_FULL_2026.json
  - articoli_semantici_FULL_2026.jsonl
  - report_pulizia_full_2026.txt
  - articoli_semantici_FULL_2026_text.csv (solo se --csv)
"""

import argparse
import csv
import json
import os
import re
from datetime import datetime
from html import unescape
from typing import Any, Dict, List, Tuple

# ==============================
# REGOLE DI PULIZIA HTML (conservative)
# ==============================

# Rimuovi immagini (tag completo)
IMG_TAG_RE = re.compile(r"<img\b[^>]*>", re.IGNORECASE)

# Rimuovi iframe (tag completo con contenuto)
IFRAME_TAG_RE = re.compile(r"<iframe\b[^>]*>.*?</iframe>", re.IGNORECASE | re.DOTALL)

# Rimuovi script e style (tag completo con contenuto)
SCRIPT_STYLE_RE = re.compile(r"<(script|style)\b[^>]*>.*?</\1>", re.IGNORECASE | re.DOTALL)

# Shortcode Divi Builder tipo [et_pb_*]
DIVI_SHORTCODE_RE = re.compile(r"\[/?et_pb_[^\]]+\]", re.IGNORECASE)

# Shortcode WP “whitelist” (più sicura di una regex generica)
# Esempi: [caption]...[/caption], [gallery ...], [audio], [video], [embed], [playlist]
WP_SHORTCODES_WHITELIST_RE = re.compile(
    r"(?is)\[(caption|gallery|audio|video|embed|playlist|wpdm_package|pdf-embedder)[^\]]*\](?:.*?\[/\1\])?"
)

# Rimuovi riferimenti attachment_#### (rumore tecnico)
ATTACHMENT_RE = re.compile(r"attachment_\d+", re.IGNORECASE)

# Rimuove paragrafi HTML tipo <p>menu 75</p> (case insensitive)
MENU_P_TAG_RE = re.compile(r"(?is)<p[^>]*>\s*menu\s+\d+\s*</p>")

# Riga standalone tipo "Menu 75" (case insensitive)
MENU_LINE_RE = re.compile(r"^\s*Menu\s+\d+\s*$", re.IGNORECASE)

# Riga standalone "Continua a leggere" / "Read more"
READMORE_LINE_RE = re.compile(r"^\s*(Continua a leggere|Read more)\s*$", re.IGNORECASE)

# Blocco CTA "Aiutaci a raggiungere altre persone..." (conservativo: ancorato alla frase)
AIUTACI_BLOCK_RE = re.compile(
    r"(?is)(?:<[^>]+>\s*)*Aiutaci\s+a\s+raggiungere\s+altre\s+persone.*?(?:</p>|</div>|<hr\s*/?>|\n{2,}|$)"
)

# Righe standalone tipo "Condividi", "Share", "Commenti", "Lascia un commento"
SOFT_SINGLE_LINES = [
    re.compile(r"^\s*Condividi\s*$", re.IGNORECASE),
    re.compile(r"^\s*Share\s*$", re.IGNORECASE),
    re.compile(r"^\s*Commenti\s*$", re.IGNORECASE),
    re.compile(r"^\s*Lascia\s+un\s+commento\s*$", re.IGNORECASE),
]

# Converti <div class="evidenziazione">...</div> in <blockquote class="evidenziazione">...</blockquote>
EVIDENZIAZIONE_DIV_RE = re.compile(
    r'(?is)<div\s+class=["\']evidenziazione["\'][^>]*>(.*?)</div>'
)

def clean_html_conservative(html: str) -> Tuple[str, Dict[str, int]]:
    """
    Pulisce HTML in modo conservativo.
    Mantiene: <p>, <br>, <strong>, <em>, <h1-4>, <ul><ol><li>, <blockquote>
    Rimuove: <img>, <iframe>, <script>, <style>, shortcode (Divi + WP whitelist), rumore WP (Menu N, CTA)
    Evidenziazioni: convertite <div class="evidenziazione"> -> <blockquote class="evidenziazione">
    """
    stats = {
        "removed_img": 0,
        "removed_iframe": 0,
        "removed_script_style": 0,
        "removed_wp_shortcodes": 0,
        "removed_divi_shortcode": 0,
        "removed_attachment_refs": 0,
        "removed_menu_items": 0,        # include <p>menu N</p> + righe pure
        "removed_readmore_lines": 0,
        "removed_soft_lines": 0,
        "removed_aiutaci_blocks": 0,
        "converted_evidenziazione": 0,
    }

    if not html:
        return "", stats

    cleaned = html

    # 1) script/style
    cleaned, n = SCRIPT_STYLE_RE.subn("", cleaned)
    stats["removed_script_style"] += n

    # 2) iframe
    cleaned, n = IFRAME_TAG_RE.subn("", cleaned)
    stats["removed_iframe"] += n

    # 3) img
    cleaned, n = IMG_TAG_RE.subn("", cleaned)
    stats["removed_img"] += n

    # 4) Divi shortcodes [et_pb_*]
    cleaned, n = DIVI_SHORTCODE_RE.subn("", cleaned)
    stats["removed_divi_shortcode"] += n

    # 5) WP shortcodes (whitelist)
    cleaned, n = WP_SHORTCODES_WHITELIST_RE.subn("", cleaned)
    stats["removed_wp_shortcodes"] += n

    # 6) attachment refs
    cleaned, n = ATTACHMENT_RE.subn("", cleaned)
    stats["removed_attachment_refs"] += n

    # 7) CTA "Aiutaci..."
    cleaned, n = AIUTACI_BLOCK_RE.subn("", cleaned)
    stats["removed_aiutaci_blocks"] += n

    # 8) Rimuovi <p>menu N</p> (molto comune)
    cleaned, n = MENU_P_TAG_RE.subn("", cleaned)
    stats["removed_menu_items"] += n

    # 9) Conversione evidenziazioni (prima del line-filter va bene; non distrugge testo)
    cleaned, n = EVIDENZIAZIONE_DIV_RE.subn(r'<blockquote class="evidenziazione">\1</blockquote>', cleaned)
    stats["converted_evidenziazione"] += n

    # 10) Filtraggio righe standalone (Menu N, Read more, Soft lines)
    lines = cleaned.splitlines()
    out_lines = []
    for ln in lines:
        stripped = ln.strip()

        # Menu N (riga pura)
        if MENU_LINE_RE.match(stripped):
            stats["removed_menu_items"] += 1
            continue

        if READMORE_LINE_RE.match(stripped):
            stats["removed_readmore_lines"] += 1
            continue

        removed = False
        for rx in SOFT_SINGLE_LINES:
            if rx.match(stripped):
                stats["removed_soft_lines"] += 1
                removed = True
                break
        if removed:
            continue

        out_lines.append(ln)

    cleaned = "\n".join(out_lines)

    # 11) Normalizza eccessi di righe vuote (max 3)
    cleaned = re.sub(r"\n{4,}", "\n\n\n", cleaned)

    # 12) Normalizza spazi eccessivi
    cleaned = re.sub(r"[ \t]{3,}", "  ", cleaned)

    return cleaned.strip(), stats


# ==============================
# IO / Merge
# ==============================

def resolve_batch_path(batch_dir: str, base_name: str) -> str:
    """
    Supporta file batch sia come 'export_1000_1' sia 'export_1000_1.json'.
    Ritorna il path esistente, altrimenti quello .json (così l'errore è leggibile).
    """
    p1 = os.path.join(batch_dir, base_name)
    p2 = os.path.join(batch_dir, base_name + ".json")
    if os.path.exists(p1):
        return p1
    return p2

def load_one_batch(path: str) -> List[Dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Export 2026: array diretto
    if isinstance(data, list):
        return data

    # Supporto eventuale wrapper (vecchi export): {meta, data}
    if isinstance(data, dict) and "data" in data and isinstance(data["data"], list):
        return data["data"]

    raise ValueError(f"Formato non riconosciuto in {path}: atteso list oppure dict{{data:[...]}}")

def load_batch_files(batch_files: List[str]) -> List[Dict[str, Any]]:
    all_records: List[Dict[str, Any]] = []
    seen_ids = set()

    for bf in batch_files:
        if not os.path.exists(bf):
            print(f"[!] File non trovato: {bf}")
            continue

        print(f"[*] Caricamento {bf} ...")
        records = load_one_batch(bf)
        print(f"    Trovati {len(records)} record")

        for rec in records:
            rec_id = rec.get("id") if isinstance(rec, dict) else None
            if rec_id is None:
                continue
            try:
                rec_id_int = int(rec_id)
            except Exception:
                rec_id_int = rec_id

            if rec_id_int in seen_ids:
                print(f"    [!] ID duplicato saltato: {rec_id_int}")
                continue

            seen_ids.add(rec_id_int)
            all_records.append(rec)

    # Ordina per id
    def _key(x: Dict[str, Any]):
        try:
            return int(x.get("id", 0))
        except Exception:
            return x.get("id", 0)

    all_records.sort(key=_key)
    return all_records


# ==============================
# Trasformazione record (pass-through meta/tax reali)
# ==============================

def transform_record(record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Trasforma record export 2026 nel formato finale.
    Preserva meta e tax come presenti nell'export (term_id/slug/name reali).
    """
    article_id = record.get("id")
    url = record.get("url", "")

    meta = record.get("meta") or {}
    tax = record.get("tax") or {}

    try:
        article_id = int(article_id)
    except Exception:
        pass

    out = {
        "id": article_id,
        "url": url,
        "meta": {
            "title": meta.get("title", ""),
            "date": meta.get("date", ""),
            "author": meta.get("author", ""),
        },
        "tax": {
            "categories": tax.get("categories", []) or [],
            "tags": tax.get("tags", []) or [],
        },
        "html_pulito": ""
    }
    return out


def extract_plain_text(html: str) -> str:
    """Estrae testo piatto da HTML (per CSV debug/test)."""
    text = re.sub(r"<[^>]+>", " ", html)
    text = unescape(text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# ==============================
# MAIN
# ==============================

def main():
    parser = argparse.ArgumentParser(description="Processa batch export 2026 e genera file puliti per AI-OEL")
    parser.add_argument("--batch-dir", default=".", help="Directory contenente i file batch (default: .)")
    parser.add_argument("--outdir", default=".", help="Directory output (default: .)")
    parser.add_argument("--csv", action="store_true", help="Genera anche file CSV opzionale")
    args = parser.parse_args()

    os.makedirs(args.outdir, exist_ok=True)

    batch_files = [
        resolve_batch_path(args.batch_dir, "export_1000_1"),
        resolve_batch_path(args.batch_dir, "export_1000_2"),
        resolve_batch_path(args.batch_dir, "export_1000_3"),
        resolve_batch_path(args.batch_dir, "export_1000_4"),
    ]

    print("=" * 60)
    print("AI-OEL — Processamento batch export 2026 (Fase 0/4)")
    print("=" * 60)
    print()

    # Load
    raw_records = load_batch_files(batch_files)
    total_raw = len(raw_records)
    print(f"\n[OK] Totale record caricati: {total_raw}\n")

    # Transform + Clean
    print("[*] Trasformazione e pulizia in corso...\n")

    transformed: List[Dict[str, Any]] = []

    tot_stats = {
        "removed_img": 0,
        "removed_iframe": 0,
        "removed_script_style": 0,
        "removed_wp_shortcodes": 0,
        "removed_divi_shortcode": 0,
        "removed_attachment_refs": 0,
        "removed_menu_items": 0,
        "removed_readmore_lines": 0,
        "removed_soft_lines": 0,
        "removed_aiutaci_blocks": 0,
        "converted_evidenziazione": 0,
    }

    stats_per_article = {
        "empty_categories": 0,
        "empty_tags": 0,
        "changed_html": 0,
    }

    for raw_rec in raw_records:
        if not isinstance(raw_rec, dict):
            continue

        out_rec = transform_record(raw_rec)

        # stats tax
        if not out_rec["tax"]["categories"]:
            stats_per_article["empty_categories"] += 1
        if not out_rec["tax"]["tags"]:
            stats_per_article["empty_tags"] += 1

        # clean html (usa SOLO raw_html del nuovo export)
        raw_html = raw_rec.get("raw_html", "")
        cleaned_html, st = clean_html_conservative(raw_html)

        if cleaned_html != (raw_html or ""):
            stats_per_article["changed_html"] += 1

        for k in tot_stats:
            tot_stats[k] += st.get(k, 0)

        out_rec["html_pulito"] = cleaned_html
        transformed.append(out_rec)

    print(f"[OK] Trasformazione completata: {len(transformed)} record\n")

    # Output files
    out_json = os.path.join(args.outdir, "articoli_semantici_FULL_2026.json")
    out_jsonl = os.path.join(args.outdir, "articoli_semantici_FULL_2026.jsonl")
    out_report = os.path.join(args.outdir, "report_pulizia_full_2026.txt")
    out_csv = os.path.join(args.outdir, "articoli_semantici_FULL_2026_text.csv")

    # Write JSON
    print(f"[*] Scrittura {out_json} ...")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(transformed, f, ensure_ascii=False, indent=2)
    print(f"    [OK] Scritti {len(transformed)} record\n")

    # Write JSONL
    print(f"[*] Scrittura {out_jsonl} ...")
    with open(out_jsonl, "w", encoding="utf-8") as f:
        for rec in transformed:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    print(f"    [OK] Scritti {len(transformed)} record\n")

    # Write CSV (optional)
    if args.csv:
        print(f"[*] Scrittura {out_csv} ...")
        with open(out_csv, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([
                "id", "title", "date", "author",
                "categories_slugs", "tags_slugs", "text_plain"
            ])
            for rec in transformed:
                categories_slugs = ",".join([c.get("slug", "") for c in rec["tax"]["categories"] if isinstance(c, dict)])
                tags_slugs = ",".join([t.get("slug", "") for t in rec["tax"]["tags"] if isinstance(t, dict)])
                text_plain = extract_plain_text(rec["html_pulito"])
                writer.writerow([
                    rec["id"],
                    rec["meta"]["title"],
                    rec["meta"]["date"],
                    rec["meta"]["author"],
                    categories_slugs,
                    tags_slugs,
                    text_plain
                ])
        print(f"    [OK] Scritti {len(transformed)} record\n")

    # Report
    print(f"[*] Generazione report {out_report} ...")
    report_lines = []
    report_lines.append("=" * 60)
    report_lines.append("REPORT PULIZIA FULL 2026 - AI-OEL Fase 0/4")
    report_lines.append("=" * 60)
    report_lines.append("")
    report_lines.append(f"Data processamento: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report_lines.append("")
    report_lines.append("--- INPUT ---")
    report_lines.append(f"File batch attesi: 4")
    for bf in batch_files:
        report_lines.append(f"  - {bf}")
    report_lines.append(f"Totale record caricati: {total_raw}")
    report_lines.append("")
    report_lines.append("--- OUTPUT ---")
    report_lines.append(f"Totale record output: {len(transformed)}")
    report_lines.append(f"  - {out_json}")
    report_lines.append(f"  - {out_jsonl}")
    if args.csv:
        report_lines.append(f"  - {out_csv}")
    report_lines.append("")
    report_lines.append("--- STATISTICHE ARTICOLI ---")
    report_lines.append(f"Articoli con categories vuote: {stats_per_article['empty_categories']}")
    report_lines.append(f"Articoli con tags vuote: {stats_per_article['empty_tags']}")
    report_lines.append(f"Articoli con HTML modificato: {stats_per_article['changed_html']}")
    report_lines.append("")
    report_lines.append("--- STATISTICHE PULIZIA HTML ---")
    report_lines.append(f"Tag <img> rimossi: {tot_stats['removed_img']}")
    report_lines.append(f"Tag <iframe> rimossi: {tot_stats['removed_iframe']}")
    report_lines.append(f"Tag <script>/<style> rimossi: {tot_stats['removed_script_style']}")
    report_lines.append(f"Shortcode WP (whitelist) rimossi: {tot_stats['removed_wp_shortcodes']}")
    report_lines.append(f"Shortcode Divi Builder rimossi: {tot_stats['removed_divi_shortcode']}")
    report_lines.append(f"Riferimenti attachment_#### rimossi: {tot_stats['removed_attachment_refs']}")
    report_lines.append(f"Menu items rimossi (include <p>menu N</p>): {tot_stats['removed_menu_items']}")
    report_lines.append(f"Righe 'Continua a leggere/Read more' rimosse: {tot_stats['removed_readmore_lines']}")
    report_lines.append(f"Righe 'Condividi/Share/Commenti' rimosse: {tot_stats['removed_soft_lines']}")
    report_lines.append(f"Blocchi CTA 'Aiutaci a raggiungere...' rimossi: {tot_stats['removed_aiutaci_blocks']}")
    report_lines.append(f"Evidenziazioni convertite in blockquote: {tot_stats['converted_evidenziazione']}")
    report_lines.append("")
    report_lines.append("=" * 60)

    with open(out_report, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))

    print("    [OK] Report generato\n")
    print("=" * 60)
    print("[OK] PROCESSAMENTO COMPLETATO")
    print("=" * 60)
    print(f"\nTotale articoli processati: {len(transformed)}")
    print("\nFile generati:")
    print(f"  - {out_json}")
    print(f"  - {out_jsonl}")
    print(f"  - {out_report}")
    if args.csv:
        print(f"  - {out_csv}")
    print()


if __name__ == "__main__":
    main()
