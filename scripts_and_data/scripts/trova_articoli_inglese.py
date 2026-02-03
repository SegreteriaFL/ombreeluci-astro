#!/usr/bin/env python3
"""
Scansione rapida dei testi/slug da bridge_articoli_numeri.csv per articoli in inglese.
Cerca parole chiave: the, and, with, research, disability (in contesti inglesi).
Report: Articoli in Inglese trovati: X
Proposta: cartella src/content/blog/en/ vs tag lang: en nel frontmatter.
"""

import csv
import re
from pathlib import Path
from typing import List, Tuple

BASE = Path(__file__).resolve().parents[2]
BRIDGE_CSV = BASE / "scripts_and_data" / "datasets" / "articoli" / "bridge_articoli_numeri.csv"
REPORT_MD = BASE / "scripts_and_data" / "report_articoli_inglese.md"

# Parole chiave inglesi (whole-word in body/title; in slug come segmenti tra -)
EN_KEYWORDS = ["the", "and", "with", "research", "disability"]
# Estesi per slug: segmenti tipici inglesi
EN_SLUG_SEGMENTS = ["the", "and", "with", "for", "from", "research", "disability", "my", "your", "how", "what", "when", "where", "film", "story", "stories", "journey", "breaking", "hope", "care", "life", "world", "people", "children", "family", "autistic", "actor", "between", "voices", "signs", "language", "connection", "holiday", "accessible", "paradise", "light", "fear", "leave", "stay", "migration", "interactive", "games", "together", "unforgettable", "group", "fun", "mini", "play"]


def extract_frontmatter_and_preview(content: str, preview_len: int = 800) -> Tuple[str, str]:
    """Ritorna (frontmatter_raw, body_preview)."""
    if not content.startswith("---"):
        return "", content[:preview_len]
    parts = content.split("---", 2)
    if len(parts) < 3:
        return "", content[:preview_len]
    return parts[1], parts[2].strip()[:preview_len]


def get_title_from_frontmatter(fm: str) -> str:
    """Estrae title dal frontmatter (valore dopo title:)."""
    for line in fm.split("\n"):
        line = line.strip()
        if line.lower().startswith("title:") and ":" in line:
            val = line.split(":", 1)[1].strip().strip('"').strip("'")
            return val
    return ""


def slug_segments(slug: str) -> set:
    """Insieme di segmenti (parole) nello slug separati da -."""
    if not slug:
        return set()
    return set(s.strip().lower() for s in slug.split("-") if s.strip())


def text_contains_english_keywords(text: str, keywords: List[str]) -> bool:
    """True se il testo contiene una keyword come parola intera (case insensitive)."""
    text_lower = text.lower()
    for kw in keywords:
        # Word boundary: non letter/digit prima e dopo
        if re.search(r"(?<![a-zA-Z0-9])" + re.escape(kw) + r"(?![a-zA-Z0-9])", text_lower):
            return True
    return False


def slug_suggests_english(slug: str) -> bool:
    """True se lo slug contiene segmenti tipici inglesi."""
    segs = slug_segments(slug)
    for s in EN_SLUG_SEGMENTS:
        if s in segs:
            return True
    return False


def main() -> None:
    if not BRIDGE_CSV.exists():
        print(f"[ERROR] {BRIDGE_CSV} non trovato")
        return

    rows: List[dict] = []
    with BRIDGE_CSV.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            path = (row.get("relative_path") or "").strip().replace("\\", "/")
            slug = (row.get("slug") or "").strip()
            if not path or not path.endswith(".md"):
                continue
            rows.append({"relative_path": path, "slug": slug})

    found: List[dict] = []
    for r in rows:
        rel = r["relative_path"]
        slug = r["slug"]
        md_path = BASE / rel
        if not md_path.exists():
            continue
        try:
            content = md_path.read_text(encoding="utf-8")
        except Exception:
            continue
        fm, body_preview = extract_frontmatter_and_preview(content)
        title = get_title_from_frontmatter(fm)
        combined = f"{slug} {title} {body_preview}".lower()

        # 1) Keyword nel testo (titolo o body)
        if text_contains_english_keywords(combined, EN_KEYWORDS):
            found.append({
                "relative_path": rel,
                "slug": slug,
                "title": title,
                "reason": "keyword in title/body",
            })
            continue
        # 2) Slug con segmenti inglesi
        if slug_suggests_english(slug):
            found.append({
                "relative_path": rel,
                "slug": slug,
                "title": title,
                "reason": "slug segments",
            })

    # Deduplica per relative_path (stesso file non due volte)
    seen = set()
    unique = []
    for x in found:
        if x["relative_path"] not in seen:
            seen.add(x["relative_path"])
            unique.append(x)

    # Report
    lines = [
        "# Report articoli in inglese",
        "",
        "Fonte: `bridge_articoli_numeri.csv` → lettura slug, titolo e anteprima corpo dei .md.",
        "Parole chiave: `the`, `and`, `with`, `research`, `disability` (+ segmenti slug tipici inglesi).",
        "",
        "---",
        "",
        f"## Articoli in Inglese trovati: {len(unique)}",
        "",
    ]
    for i, x in enumerate(unique[:200], 1):  # primi 200 in report
        lines.append(f"{i}. **{x['title'][:60] or x['slug']}** — `{x['relative_path']}`")
        lines.append(f"   - slug: `{x['slug']}` | motivo: {x['reason']}")
        lines.append("")
    if len(unique) > 200:
        lines.append(f"... e altri {len(unique) - 200} articoli.")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## Proposta gestione lingua")
    lines.append("")
    lines.append("**Opzione A – Cartella `src/content/blog/en/`**")
    lines.append("- Spostare i file .md in inglese in una sottocartella `en/` (es. `src/content/blog/en/breaking-barriers-my-journey-as-an-autistic-actor.md`).")
    lines.append("- Pro: URL e routing chiari (es. `/blog/en/...`), facile filtrare in build.")
    lines.append("- Contro: richiede aggiornare link, redirect e generazione pagine (Astro) per due alberi (it/en).")
    lines.append("")
    lines.append("**Opzione B – Tag `lang: en` nel frontmatter**")
    lines.append("- Aggiungere nei file rilevati: `lang: en` (e eventualmente `lang: it` negli altri).")
    lines.append("- Pro: nessuno spostamento file; filtri e layout possono usare `lang` (es. `if (lang === 'en')`), i18n in un solo albero.")
    lines.append("- Contro: URL resta uguale; per path tipo `/en/...` serve routing via query o segmento derivato da `lang`.")
    lines.append("")
    lines.append("**Raccomandazione:** **Opzione B** (tag `lang: en`) per ora: nessuna ristrutturazione cartelle, gestione via codice e filtri. Se in futuro servisse sito bilingue con path separati, si può migrare a Opzione A.")
    lines.append("")

    REPORT_MD.parent.mkdir(parents=True, exist_ok=True)
    REPORT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(f"Report scritto: {REPORT_MD}")
    print(f"Articoli in Inglese trovati: {len(unique)}")


if __name__ == "__main__":
    main()
