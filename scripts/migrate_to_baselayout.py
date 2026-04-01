#!/usr/bin/env python3
"""
Migra le pagine Astro dall'head inline a BaseLayout.
"""
import re
from pathlib import Path

src = Path("src")

PAGES = {
    "pages/404.astro": {
        "title": '"404 - Pagina non trovata"',
        "description": None,
        "noindex": True,
        "lang": "it",
        "bodyClass": None,
    },
    "pages/cerca.astro": {
        "title": '"Cerca"',
        "description": '"Cerca articoli, autori e temi nella rivista Ombre e Luci"',
        "noindex": True,
        "lang": "it",
        "bodyClass": None,
    },
    "pages/blog/en.astro": {
        "title": "`${t('en', 'english_articles')}`",
        "description": '"Articles in English from Ombre e Luci."',
        "noindex": False,
        "lang": "en",
        "bodyClass": None,
    },
    "pages/archivio/web-only.astro": {
        "title": '"Articoli solo online"',
        "description": '"Articoli pubblicati solo online su Ombre e Luci."',
        "noindex": True,
        "lang": "it",
        "bodyClass": None,
    },
    "pages/sezioni/diari.astro": {
        "title": '"I Diari"',
        "description": '"I Diari: storie in prima persona, racconti di vita e di fragilita sulle pagine di Ombre e Luci."',
        "noindex": True,
        "lang": "it",
        "bodyClass": None,
    },
    "pages/sezioni/dialogo-aperto.astro": {
        "title": '"Dialogo aperto"',
        "description": '"La rubrica Dialogo aperto di Ombre e Luci: lettori, famiglie e persone con disabilita a confronto aperto."',
        "noindex": True,
        "lang": "it",
        "bodyClass": None,
    },
    "pages/autori/index.astro": {
        "title": '"Autori"',
        "description": '"Elenco degli autori della rivista Ombre e Luci"',
        "noindex": True,
        "lang": "it",
        "bodyClass": None,
    },
    "pages/chi-siamo/index.astro": {
        "title": '"Chi siamo"',
        "description": '"Ombre e Luci: chi siamo, la nostra storia, la redazione e la missione editoriale."',
        "noindex": True,
        "lang": "it",
        "bodyClass": None,
    },
    "pages/chi-siamo/la-rivista.astro": {
        "title": '"La Rivista"',
        "description": None,
        "noindex": True,
        "lang": "it",
        "bodyClass": None,
    },
    "pages/chi-siamo/la-redazione.astro": {
        "title": '"La Redazione"',
        "description": None,
        "noindex": True,
        "lang": "it",
        "bodyClass": None,
    },
    "pages/chi-siamo/redazione-storica.astro": {
        "title": '"Redazione storica"',
        "description": None,
        "noindex": True,
        "lang": "it",
        "bodyClass": None,
    },
    "pages/chi-siamo/collaboratori.astro": {
        "title": '"Collaboratori"',
        "description": None,
        "noindex": True,
        "lang": "it",
        "bodyClass": None,
    },
    "pages/chi-siamo/contatti.astro": {
        "title": '"Contatti"',
        "description": None,
        "noindex": True,
        "lang": "it",
        "bodyClass": None,
    },
    "pages/chi-siamo/hanno-scritto-per-noi.astro": {
        "title": '"Hanno scritto per noi"',
        "description": None,
        "noindex": True,
        "lang": "it",
        "bodyClass": None,
    },
    "pages/archivio/index.astro": {
        "title": '"Archivio"',
        "description": '"Sfoglia i numeri della rivista Ombre e Luci dal 1977 ad oggi."',
        "noindex": True,
        "lang": "it",
        "bodyClass": None,
    },
    "pages/sostienici.astro": {
        "title": '"Sostieni Ombre e Luci"',
        "description": '"Sostieni Ombre e Luci con una donazione. Senza sponsor: la rivista vive grazie a chi la legge."',
        "noindex": False,
        "lang": "it",
        "bodyClass": "support-page",
    },
}


def depth_for(path_key):
    return path_key.count("/") - 1


def layout_import_path(path_key):
    d = depth_for(path_key)
    return "../" * d + "layouts/BaseLayout.astro"


def build_layout_open(meta):
    attrs = [f"title={{{meta['title']}}}"]
    if meta.get("description"):
        attrs.append(f"description={{{meta['description']}}}")
    if meta.get("noindex"):
        attrs.append("noindex={true}")
    if meta.get("lang") and meta["lang"] != "it":
        attrs.append(f'lang="{meta["lang"]}"')
    if meta.get("bodyClass"):
        attrs.append(f'bodyClass="{meta["bodyClass"]}"')
    return "<BaseLayout\n  " + "\n  ".join(attrs) + "\n>"


for path_key, meta in PAGES.items():
    fpath = src / path_key
    if not fpath.exists():
        print(f"SKIP (not found): {fpath}")
        continue

    content = fpath.read_text(encoding="utf-8")
    original = content

    layout_path = layout_import_path(path_key)

    # 1. Remove old imports
    content = re.sub(r"import \{ ViewTransitions \} from 'astro:transitions';\n", "", content)
    content = re.sub(r"import Header from '[^']+Header\.astro';\n", "", content)
    content = re.sub(r"import Footer from '[^']+Footer\.astro';\n", "", content)
    content = re.sub(r"import '[^']+styles/global\.css';\n", "", content)

    # 2. Add BaseLayout import — insert as first import in frontmatter
    # Replace first --- with ---\nimport BaseLayout ...
    content = content.replace(
        "---\n",
        "---\nimport BaseLayout from '" + layout_path + "';\n",
        1,
    )

    # 3. Remove <html ...><head>...</head><body ...><Header /> block
    #    and closing <Footer /></body></html>

    # Remove <html lang="..."> line
    content = re.sub(r"\n<html[^>]*>", "", content)

    # Remove <head>...</head> block (greedy multi-line)
    content = re.sub(r"\s*<head>.*?</head>", "", content, flags=re.DOTALL)

    # Remove <body ...> line (with optional class)
    content = re.sub(r"\n\s*<body[^>]*>", "", content)

    # Remove <Header /> line
    content = re.sub(r"\n\s*<Header />", "", content)

    # Remove <Footer /> + </body> + </html> (at end)
    content = re.sub(r"\s*<Footer />\s*</body>\s*</html>\s*$", "", content, flags=re.DOTALL)

    # 4. Wrap HTML content in BaseLayout
    # Split frontmatter (between first --- and second ---)
    fm_end = content.index("---\n", 3) + 4  # skip opening ---
    frontmatter = content[:fm_end]
    html_part = content[fm_end:].lstrip("\n")

    layout_open = build_layout_open(meta)
    content = frontmatter + "\n" + layout_open + "\n" + html_part.rstrip() + "\n</BaseLayout>\n"

    if content != original:
        fpath.write_text(content, encoding="utf-8")
        print(f"OK: {path_key}")
    else:
        print(f"UNCHANGED: {path_key}")

print("\nDone.")
