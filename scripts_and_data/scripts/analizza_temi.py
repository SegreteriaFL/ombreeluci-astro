import os
import re
import unicodedata
from pathlib import Path
from collections import defaultdict


ROOT = Path(__file__).resolve().parents[2]
BLOG_DIR = ROOT / "src" / "content" / "blog"
NUMERI_DIR = ROOT / "src" / "content" / "numeri"
REPORTS_DIR = ROOT / "REPORTS"
REPORT_PATH = REPORTS_DIR / "mappatura_temi_attuale.md"


THEME_FIELDS = [
    "temi",
    "tags",
    "categories",
    "category",
    "theme",
    "tema_code",
    "tema_label",
    "categoria_menu",
]


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value)
    value = value.strip("-").lower()
    return value or "n-a"


def clean_value(v: str) -> str:
    v = v.strip()
    if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
        v = v[1:-1]
    return v.strip()


def extract_frontmatter(text: str):
    if not text.lstrip().startswith("---"):
        return "", text
    # Split only on the first two '---' separators
    parts = text.split("---", 2)
    if len(parts) >= 3:
        # parts[0] is empty or BOM, parts[1] is FM, parts[2] is body
        return parts[1].strip("\n"), parts[2]
    return "", text


def parse_list_field(field: str, fm: str):
    # Multi-line list:
    m = re.search(rf"^{field}:\s*\n((?:\s*-\s*.+\n)+)", fm, re.MULTILINE)
    if m:
        block = m.group(1)
        vals = []
        for line in block.splitlines():
            line = line.strip()
            if line.startswith("-"):
                vals.append(clean_value(line[1:].strip()))
        return [v for v in vals if v]

    # Inline list: key: [a, b, c]
    m = re.search(rf"^{field}:\s*\[(.+)\]", fm, re.MULTILINE)
    if m:
        inside = m.group(1)
        vals = [clean_value(p.strip()) for p in inside.split(",") if p.strip()]
        return [v for v in vals if v]

    # Single scalar line: key: value
    m = re.search(rf"^{field}:\s*(.+)$", fm, re.MULTILINE)
    if m:
        val = clean_value(m.group(1).strip())
        return [val] if val else []

    return []


def get_scalar(field: str, fm: str):
    m = re.search(rf"^{field}:\s*(.+)$", fm, re.MULTILINE)
    if not m:
        return None
    return clean_value(m.group(1).strip())


def detect_legacy_categories(fm: str, body: str, rel_path: str, kind: str, legacy_hits: list):
    for label in ["Progetti e Associazioni", "Dialogo Aperto"]:
        pattern = re.compile(re.escape(label), re.IGNORECASE)
        where = []
        if pattern.search(fm):
            where.append("frontmatter")
        if pattern.search(body):
            where.append("contenuto")
        if where:
            legacy_hits.append(
                {
                    "label": label,
                    "path": rel_path,
                    "kind": kind,
                    "where": ", ".join(where),
                }
            )


def analyse():
    theme_stats = {}
    no_theme_articles = []
    total_articles = 0

    legacy_hits = []

    focus_numbers = []
    thematic_numbers = []

    def ensure_theme(label: str):
        if label not in theme_stats:
            theme_stats[label] = {
                "slug": slugify(label),
                "count": 0,
                "example_url": None,
            }
        return theme_stats[label]

    def process_file(path: Path, kind: str):
        nonlocal total_articles
        total_articles += 1

        text = path.read_text(encoding="utf-8")
        fm, body = extract_frontmatter(text)

        rel = str(path.relative_to(ROOT))

        # Legacy category search
        detect_legacy_categories(fm, body, rel, kind, legacy_hits)

        # Slug / URL
        slug = get_scalar("slug", fm) or path.stem

        original_url = None
        if kind == "blog":
            original_url = get_scalar("original_url", fm)
            if not original_url:
                # Fallback to a plausible site URL
                original_url = f"/blog/{slug}/"
        else:  # numeri
            original_url = (
                get_scalar("canonical_url", fm)
                or get_scalar("wp_url_numero", fm)
                or get_scalar("wp_url", fm)
                or get_scalar("wp_url_numero", fm)
            )
            if not original_url:
                original_url = f"/numeri/{path.stem}/"

        # Collect theme labels from known fields
        labels = []
        for field in THEME_FIELDS:
            vals = parse_list_field(field, fm)
            labels.extend(vals)

        if not labels:
            no_theme_articles.append(
                {
                    "kind": kind,
                    "slug": slug,
                    "rel": rel,
                }
            )
        else:
            for label in labels:
                stat = ensure_theme(label)
                stat["count"] += 1
                if stat["example_url"] is None:
                    stat["example_url"] = original_url

        # Focus & Dossier only for numeri
        if kind == "numeri":
            title = get_scalar("title", fm) or ""
            display_title = get_scalar("display_title", fm) or ""
            titolo_numero = get_scalar("titolo_numero", fm) or ""

            combined = " ".join([title, display_title, titolo_numero]).lower()
            keywords = ["focus", "dossier", "speciale"]
            if any(kw in combined for kw in keywords):
                focus_numbers.append(
                    {
                        "title": title or display_title or titolo_numero or path.stem,
                        "titolo_numero": titolo_numero,
                        "slug": path.stem,
                        "rel": rel,
                    }
                )

            if titolo_numero:
                thematic_numbers.append(
                    {
                        "title": title or display_title or titolo_numero,
                        "titolo_numero": titolo_numero,
                        "slug": path.stem,
                        "rel": rel,
                    }
                )

    # Walk blog and numeri
    for base, kind in [(BLOG_DIR, "blog"), (NUMERI_DIR, "numeri")]:
        if not base.exists():
            continue
        for dirpath, _, filenames in os.walk(base):
            for name in filenames:
                if not name.lower().endswith(".md"):
                    continue
                p = Path(dirpath) / name
                process_file(p, kind)

    # Prepare markdown report
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    lines = []
    lines.append("# Mappatura Temi Attuale")
    lines.append("")
    lines.append("_Generato automaticamente da scripts_and_data/scripts/analizza_temi.py_")
    lines.append("")

    # Lista Unica Temi
    lines.append("## Lista Unica Temi")
    lines.append("")
    if not theme_stats:
        lines.append("Nessun tema trovato nei frontmatter analizzati.")
    else:
        lines.append("| Tema | Slug tema | # Articoli | Esempio URL di un articolo |")
        lines.append("| --- | --- | --- | --- |")
        for label in sorted(theme_stats.keys(), key=lambda s: s.lower()):
            stat = theme_stats[label]
            lines.append(
                f"| {label} | `{stat['slug']}` | {stat['count']} | {stat['example_url'] or '-'} |"
            )
    lines.append("")

    # Analisi Copertura
    lines.append("## Analisi Copertura")
    lines.append("")
    lines.append(f"- **Articoli totali analizzati (blog + numeri)**: {total_articles}")
    lines.append(f"- **Articoli senza alcun tema/tag/categoria rilevato**: {len(no_theme_articles)}")
    lines.append("")
    if no_theme_articles:
        lines.append("### Primi 10 articoli senza temi")
        lines.append("")
        for info in no_theme_articles[:10]:
            prefix = "blog" if info["kind"] == "blog" else "numero"
            lines.append(
                f"- **{prefix}** – slug `{info['slug']}` (`{info['rel']}`)"
            )
        lines.append("")

    # Temi con meno di 3 articoli
    few_themes = {
        label: stat for label, stat in theme_stats.items() if stat["count"] < 3
    }
    lines.append(
        f"- **Temi con meno di 3 articoli associati**: {len(few_themes)}"
    )
    lines.append("")
    if few_themes:
        lines.append("Elenco dei temi con copertura bassa (meno di 3 articoli):")
        lines.append("")
        for label in sorted(few_themes.keys(), key=lambda s: s.lower()):
            stat = few_themes[label]
            lines.append(
                f"- **{label}** (`{stat['slug']}`) – {stat['count']} articoli, es. {stat['example_url'] or '-'}"
            )
        lines.append("")

    # Verifica Categorie 'Legacy'
    lines.append("## Verifica Categorie 'Legacy'")
    lines.append("")
    if not legacy_hits:
        lines.append(
            "Non sono state trovate occorrenze esplicite delle categorie "
            "'Progetti e Associazioni' o 'Dialogo Aperto' nei frontmatter o nei contenuti analizzati."
        )
    else:
        lines.append(
            "Sono state trovate le seguenti occorrenze delle categorie legacy "
            "'Progetti e Associazioni' / 'Dialogo Aperto' (potenziali metadati o residui del vecchio sito):"
        )
        lines.append("")
        for hit in legacy_hits:
            lines.append(
                f"- **{hit['label']}** in `{hit['path']}` "
                f"({hit['kind']}, posizione: {hit['where']})"
            )
    lines.append("")

    # Focus & Dossier
    lines.append("## Focus & Dossier (Temi Portanti)")
    lines.append("")

    lines.append("### Numeri con parole chiave (Focus/Dossier/Speciale)")
    lines.append("")
    if not focus_numbers:
        lines.append(
            "Nessun numero con le parole chiave *Focus*, *Dossier* o *Speciale* rilevato nei titoli."
        )
    else:
        for n in sorted(focus_numbers, key=lambda x: x["slug"]):
            lines.append(
                f"- **{n['title']}** (`{n['slug']}`) – titolo numero: "
                f"\"{n['titolo_numero']}\" – file: `{n['rel']}`"
            )
    lines.append("")

    lines.append("### Altri numeri con titolo tematico forte (campo `titolo_numero` presente)")
    lines.append("")
    if not thematic_numbers:
        lines.append("Nessun numero con campo `titolo_numero` valorizzato rilevato.")
    else:
        for n in sorted(thematic_numbers, key=lambda x: x["slug"]):
            lines.append(
                f"- **{n['title']}** (`{n['slug']}`) – titolo numero: "
                f"\"{n['titolo_numero']}\" – file: `{n['rel']}`"
            )
    lines.append("")

    REPORT_PATH.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    analyse()
    print(f"Report scritto in: {REPORT_PATH}")

