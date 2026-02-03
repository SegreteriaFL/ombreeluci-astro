#!/usr/bin/env python3
"""
Rifinitura: collocare gli orfani in extra-web e popolare i numeri ancora vuoti
usando il TITOLO come chiave di riconciliazione.

Fonti:
- numeri_consolidati.json: 197 numeri, articoli_urls per titoli attesi (slug da URL)
- extra-web: orfani senza wp_id
- database_unificato (opzionale): titoli per numero

Logica:
1. Mappatura titoli attesi: da numeri_consolidati, per i numeri vuoti, estrai slug da articoli_urls.
2. Fuzzy match orfani: per ogni .md in extra-web, normalizza titolo/slug, confronta con attesi (esatto o Levenshtein/similarità alta).
3. Spostamento + update frontmatter (id_numero, issue_number, anno_rivista).
4. Check slug: se destinazione ha già stesso slug, confronta dimensione/frontmatter e tieni il più completo.
5. Report: orfani salvati, numeri popolati.
"""

import json
import re
from pathlib import Path
from urllib.parse import urlparse
from difflib import SequenceMatcher
from collections import defaultdict

BASE = Path(__file__).resolve().parents[2]
BLOG_ROOT = BASE / "src" / "content" / "blog"
EXTRA_WEB = BLOG_ROOT / "extra-web"
NUMERI_JSON = BASE / "src" / "data" / "numeri_consolidati.json"
UNIFICATO_JSON = BASE / "scripts_and_data" / "datasets" / "articoli" / "database_unificato.json"
REPORT_PATH = BASE / "scripts_and_data" / "report_rifinitura_orfani.md"

# Soglia similarità per fuzzy match (0-1). 0.70 consente match come "comunita...est-europeo" -> INS-29
SIMILARITY_THRESHOLD = 0.70


def normalize_for_match(s: str) -> str:
    """Normalizza per confronto: lowercase, solo lettere/cifre, spazi e trattini → trattino, collapse."""
    if not s:
        return ""
    s = s.strip().lower()
    s = re.sub(r"[\s_]+", "-", s)
    s = re.sub(r"[^\w\-]", "", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


def extract_frontmatter(path: Path) -> tuple[dict, str]:
    text = path.read_text(encoding="utf-8", errors="replace")
    fm = {}
    body = ""
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)", text, re.DOTALL)
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                fm[k.strip().lower()] = v.strip().strip('"').strip("'")
        body = m.group(2)
    return fm, body


def slug_from_url(url: str) -> str | None:
    """Estrae slug dall'ultimo segmento del path (es. .../1993/possibilita-e-capacita-nascoste/ -> possibilita-e-capacita-nascoste)."""
    if not url:
        return None
    path = urlparse(url).path.strip("/")
    if not path:
        return None
    return path.split("/")[-1].strip("/")


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, normalize_for_match(a), normalize_for_match(b)).ratio()


def count_articles_per_folder() -> dict[str, int]:
    count = defaultdict(int)
    for folder in BLOG_ROOT.iterdir():
        if not folder.is_dir() or folder.name == "extra-web":
            continue
        if folder.name.startswith("OEL-") or folder.name.startswith("INS-"):
            count[folder.name] = len(list(folder.glob("*.md")))
    return dict(count)


def build_expected_titles_for_numeri(
    numeri_data: list,
    count_by_folder: dict,
    unificato: list | None,
) -> tuple[dict[str, dict], set[str]]:
    """
    Per ogni numero (priorità ai vuoti), costruisci set di titoli/slug attesi da:
    - articoli_urls in numeri_consolidati (slug da URL)
    - database_unificato (title per numero_id)
    Ritorna: id_numero -> { "slugs": set(), "anno": int, "numero": dict }, set(id_numeri vuoti)
    """
    numeri_by_id = {n["id_numero"]: n for n in numeri_data}
    # Da unificato: numero_id -> set(normalize(title))
    from_unificato = defaultdict(set)
    if unificato:
        for art in unificato:
            nid = art.get("numero_id")
            title = art.get("title")
            if nid and title:
                from_unificato[nid].add(normalize_for_match(title))
                from_unificato[nid].add(normalize_for_match(title.replace(" ", "-")))

    out = {}
    empty_ids = set()
    # Numeri INS (Insieme 1974-1981): includi sempre per assegnazione per anno
    ins_numeri_by_year = defaultdict(list)
    for n in numeri_data:
        id_n = n["id_numero"]
        if count_by_folder.get(id_n, 0) == 0:
            empty_ids.add(id_n)
        slugs = set()
        for url in n.get("articoli_urls") or []:
            s = slug_from_url(url)
            if s:
                slugs.add(normalize_for_match(s))
                slugs.add(s)
        slugs |= from_unificato.get(id_n, set())
        anno = n.get("anno_pubblicazione")
        if id_n.startswith("INS-") and anno and 1974 <= anno <= 1981:
            ins_numeri_by_year[anno].append(id_n)
        if slugs or (id_n.startswith("INS-") and anno and 1974 <= anno <= 1981):
            out[id_n] = {
                "slugs": slugs,
                "anno": anno,
                "numero": n,
            }
    return out, empty_ids, ins_numeri_by_year


def main() -> None:
    numeri_data = json.loads(NUMERI_JSON.read_text(encoding="utf-8"))
    count_by_folder = count_articles_per_folder()
    unificato = None
    if UNIFICATO_JSON.exists():
        unificato = json.loads(UNIFICATO_JSON.read_text(encoding="utf-8"))
        print(f"[0] database_unificato: {len(unificato)} articoli")
    expected, empty_ids, ins_numeri_by_year = build_expected_titles_for_numeri(
        numeri_data, count_by_folder, unificato
    )
    print(f"[1] Numeri con titoli/slug attesi: {len(expected)} (di cui vuoti: {len(empty_ids)})")
    print(f"[2] Totale chiavi attese: {sum(len(e['slugs']) for e in expected.values())}")
    print(f"[2b] INS per anno (1974-1981): {dict(ins_numeri_by_year)}")

    if not EXTRA_WEB.exists():
        print("[ERROR] extra-web non trovata")
        return

    orphans = list(EXTRA_WEB.glob("*.md"))
    print(f"[3] Orfani in extra-web: {len(orphans)}")

    report_lines = [
        "# Report rifinitura orfani (match per titolo)",
        "",
        f"Numeri con titoli attesi: {len(expected)} (di cui vuoti: {len(empty_ids)})",
        f"Orfani in extra-web: {len(orphans)}",
        "",
        "## Orfani collocati",
        "",
    ]
    saved = []
    numeri_populated = set()
    not_placed = []  # (slug, best_match_id, best_ratio) per diagnostica
    # Conteggio corrente per distribuzione orfani INS per anno (aggiornato dopo ogni spostamento)
    count_current = dict(count_by_folder)

    for md in orphans:
        fm, body = extract_frontmatter(md)
        if fm.get("wp_id"):
            continue  # skip se ha già wp_id (non orfano puro)
        title = fm.get("title") or md.stem
        slug_file = md.stem
        key_title = normalize_for_match(title)
        key_slug = normalize_for_match(slug_file)
        best_numero = None
        best_ratio = 0.0
        exact_found = False

        for id_n, data in expected.items():
            if exact_found:
                break
            slugs = data["slugs"]
            # Match esatto (slug o titolo normalizzato)
            if key_slug in slugs or key_title in slugs:
                best_numero = id_n
                best_ratio = 1.0
                exact_found = True
                break
            for ref in slugs:
                r1 = similarity(slug_file, ref)
                r2 = similarity(title, ref)
                r3 = similarity(key_title, ref)
                r = max(r1, r2, r3)
                if r >= SIMILARITY_THRESHOLD and r > best_ratio:
                    best_ratio = r
                    best_numero = id_n

        if not best_numero:
            # Seconda passata: orfani con data 1974-1981 -> assegna all'INS di quell'anno con meno articoli
            anno_orphan = None
            for key in ("date", "anno_rivista", "anno"):
                val = fm.get(key)
                if val:
                    try:
                        if isinstance(val, (int, float)):
                            anno_orphan = int(val)
                        else:
                            anno_orphan = int(str(val).strip()[:4])
                        break
                    except (ValueError, TypeError):
                        pass
            if anno_orphan and 1974 <= anno_orphan <= 1981 and anno_orphan in ins_numeri_by_year:
                candidati = ins_numeri_by_year[anno_orphan]
                # Scegli l'INS con meno articoli (conteggio aggiornato dopo ogni spostamento)
                best_numero = min(
                    candidati,
                    key=lambda id_n: count_current.get(id_n, 0),
                )
                best_ratio = 0.50  # assegnazione per anno
            if not best_numero:
                # Memorizza la migliore corrispondenza sotto soglia (per diagnostica)
                best_any = None
                best_r = 0.0
                for id_n, data in expected.items():
                    for ref in data["slugs"]:
                        r = max(similarity(slug_file, ref), similarity(key_title, ref))
                        if r > best_r:
                            best_r = r
                            best_any = id_n
                not_placed.append((slug_file, best_any, best_r))
                continue

        target_dir = BLOG_ROOT / best_numero
        target_dir.mkdir(parents=True, exist_ok=True)
        dest = target_dir / f"{slug_file}.md"

        if dest.exists():
            # Check slug: tieni il più completo (dimensione contenuto + frontmatter)
            existing_content = dest.read_text(encoding="utf-8", errors="replace")
            existing_fm, existing_body = extract_frontmatter(dest)
            new_len = len(body) + len(str(fm))
            existing_len = len(existing_body) + len(str(existing_fm))
            if existing_len >= new_len:
                report_lines.append(f"- **{slug_file}** → {best_numero}: destinazione già presente e più completa, skip.")
                continue
            # Il file in extra-web è più completo: sovrascriviamo (orphan è più ricco)

        try:
            numero_info = expected[best_numero]["numero"]
            anno = numero_info.get("anno_pubblicazione")
            # Inietta nel frontmatter esistente: issue_number, id_numero, anno_rivista
            orig_content = md.read_text(encoding="utf-8", errors="replace")
            m = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)", orig_content, re.DOTALL)
            if not m:
                report_lines.append(f"- **{slug_file}**: frontmatter non valido, skip.")
                continue
            fm_block, rest = m.group(1), m.group(2)
            # Rimuovi righe esistenti per le 3 chiavi
            fm_lines = [
                l for l in fm_block.splitlines()
                if not re.match(r"^(issue_number|id_numero|anno_rivista)\s*:", l, re.I)
            ]
            fm_lines.append(f"issue_number: {best_numero}")
            fm_lines.append(f"id_numero: {best_numero}")
            if anno is not None:
                fm_lines.append(f"anno_rivista: {anno}")
            new_content = "---\n" + "\n".join(fm_lines) + "\n---\n" + rest
            dest.write_text(new_content, encoding="utf-8")
            md.unlink()
            saved.append((slug_file, best_numero, best_ratio))
            numeri_populated.add(best_numero)
            count_current[best_numero] = count_current.get(best_numero, 0) + 1
            report_lines.append(f"- **{slug_file}** → `{best_numero}/` (similarità {best_ratio:.2f})")
        except Exception as e:
            report_lines.append(f"- **{slug_file}** → {best_numero}: ERRORE {e}")

    report_lines.append("")
    report_lines.append("## Orfani non collocati (con migliore match sotto soglia)")
    report_lines.append("")
    for slug_file, best_id, ratio in sorted(not_placed, key=lambda x: (-x[2], x[0])):
        report_lines.append(f"- `{slug_file}` → migliore: {best_id or '-'} (ratio={ratio:.2f})")
    report_lines.append("")
    report_lines.append("## Riepilogo")
    report_lines.append("")
    report_lines.append(f"- Orfani collocati: **{len(saved)}**")
    report_lines.append(f"- Numeri che hanno ricevuto almeno un articolo: **{len(numeri_populated)}**")
    report_lines.append(f"- Orfani non collocati: **{len(not_placed)}** (elenco sopra; ratio < {SIMILARITY_THRESHOLD} o nessun match)")
    report_lines.append("")
    if numeri_populated:
        report_lines.append("Numeri popolati: " + ", ".join(sorted(numeri_populated)))
    report_lines.append("")

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text("\n".join(report_lines), encoding="utf-8")
    print(f"\nReport: {REPORT_PATH}")
    print(f"Orfani collocati: {len(saved)}")
    print(f"Numeri popolati: {len(numeri_populated)}")


if __name__ == "__main__":
    main()
