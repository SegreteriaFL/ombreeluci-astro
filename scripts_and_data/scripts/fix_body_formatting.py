#!/usr/bin/env python3
"""
Body-focused markdown formatter for blog articles.

Default mode: dry-run (no file write).
Use --apply to write changes.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path


def split_frontmatter(content: str) -> tuple[str | None, str]:
    if not content.startswith("---"):
        return None, content
    parts = content.split("---", 2)
    if len(parts) < 3:
        return None, content
    return parts[1], parts[2].lstrip("\r\n")


def build_content(frontmatter: str | None, body: str) -> str:
    if frontmatter is None:
        return body.rstrip() + "\n"
    return f"---{frontmatter}---\n\n{body.rstrip()}\n"


def normalize_whitespace(text: str) -> str:
    out = text.replace("\r\n", "\n").replace("\r", "\n")
    out = re.sub(r"[ \t]+\n", "\n", out)
    out = re.sub(r"\n{3,}", "\n\n", out)
    out = re.sub(r"[ \t]{2,}", " ", out)
    return out.strip() + "\n"


def split_inline_dash_lists(text: str) -> str:
    """
    Convert inline list pattern:
    - item1; - item2; - item3
    into one bullet per line, adding a blank line before first bullet.
    If the line starts with '- item1; - item2', the first segment is also a bullet.
    """
    out_lines: list[str] = []
    for line in text.split("\n"):
        stripped = line.strip()
        if "- " in stripped and "; -" in stripped:
            parts = re.split(r"\s+-\s+", stripped)
            if len(parts) >= 2:
                first = parts[0].strip()
                rest = [p.strip() for p in parts[1:] if p.strip()]
                bullets: list[str] = []
                if first.startswith("- "):
                    bullets.append(first[2:].strip().rstrip(";").strip())
                else:
                    prefix = first.rstrip(";").strip()
                    if prefix:
                        out_lines.append(prefix)
                        out_lines.append("")
                bullets.extend(b.rstrip(";").strip() for b in rest)
                for b in bullets:
                    if b:
                        out_lines.append(f"- {b}")
                continue
        out_lines.append(line)
    return "\n".join(out_lines)


def strip_trailing_semicolon_from_bullets(text: str) -> str:
    """Remove trailing ';' from markdown list lines (- ...)."""
    out_lines: list[str] = []
    for line in text.split("\n"):
        if re.match(r"^-\s+", line):
            stripped = line.rstrip()
            if stripped.endswith(";"):
                stripped = stripped[:-1].rstrip()
            out_lines.append(stripped)
        else:
            out_lines.append(line)
    return "\n".join(out_lines)


def convert_bold_bullet_to_subtitle(text: str) -> str:
    """
    '- **Titolo** testo del paragrafo' is not a list item — subtitle + paragraph.
    -> **Titolo**\\n\\nTesto del paragrafo
    """
    out_lines: list[str] = []
    for line in text.split("\n"):
        m = re.match(r"^-\s+(\*\*[^*]+\*\*)\s+(.+)$", line.strip())
        if m:
            out_lines.append(m.group(1).strip())
            out_lines.append("")
            out_lines.append(m.group(2).strip())
            continue
        out_lines.append(line)
    return "\n".join(out_lines)


def split_bold_subtitles(text: str) -> str:
    """
    Rule:
    - '**Titolo** testo' at line start -> '**Titolo**' + blank line + 'testo'
    - after punctuation '. **Titolo** testo' -> break into separate paragraph.
    """
    out_lines: list[str] = []
    for line in text.split("\n"):
        s = line.strip()
        m = re.match(r"^(\*\*[^*]+\*\*)\s+(.+)$", s)
        if m:
            out_lines.append(m.group(1).strip())
            out_lines.append("")
            out_lines.append(m.group(2).strip())
            continue

        # After sentence punctuation inside same line.
        line = re.sub(
            r'([.!?])\s+(\*\*[^*]+\*\*)\s+([^ \n].+)',
            r"\1\n\n\2\n\n\3",
            line,
        )
        out_lines.append(line)
    return "\n".join(out_lines)


def split_heading_with_bold_subtitle(text: str) -> str:
    """
    Rule:
    '## Titolo - **Sottotitolo**'
    ->
    '## Titolo'
    ''
    '**Sottotitolo**'
    """
    out_lines: list[str] = []
    for line in text.split("\n"):
        m = re.match(r"^(#{2,6}\s+.+?)\s*-\s*(\*\*[^*]+\*\*)(.*)$", line.strip())
        if m:
            heading = m.group(1).strip()
            subtitle = m.group(2).strip()
            trailing = m.group(3).strip()
            out_lines.append(heading)
            out_lines.append("")
            out_lines.append(subtitle)
            if trailing:
                out_lines.append("")
                out_lines.append(trailing)
            continue
        out_lines.append(line)
    return "\n".join(out_lines)


def split_heading_inline_prose(text: str) -> str:
    """
    Convert:
    '## Titolo ...'
    into heading line + blank line + prose, when heading and prose are merged.
    """
    out_lines: list[str] = []
    for line in text.split("\n"):
        s = line.strip()
        m = re.match(r"^(#{2,6}\s+[^\n]*?\))\s+(.+)$", s)
        if m:
            out_lines.append(m.group(1).strip())
            out_lines.append("")
            out_lines.append(m.group(2).strip())
            continue
        out_lines.append(line)
    return "\n".join(out_lines)


def transform_body(body: str) -> str:
    out = body
    out = split_heading_with_bold_subtitle(out)
    out = split_heading_inline_prose(out)
    out = split_bold_subtitles(out)
    out = split_inline_dash_lists(out)
    out = strip_trailing_semicolon_from_bullets(out)
    out = convert_bold_bullet_to_subtitle(out)
    out = normalize_whitespace(out)
    return out


def body_has_bold_bullet_subtitle(body: str) -> bool:
    """True if any line looks like '- **Titolo** testo' (subtitle masquerading as list)."""
    for line in body.splitlines():
        if re.match(r"^-\s+\*\*[^*]+\*\*\s+.+", line.strip()):
            return True
    return False


def body_has_inline_semicolon_list(body: str) -> bool:
    """True if any line has inline '- a; - b' style list."""
    for line in body.splitlines():
        stripped = line.strip()
        if "- " in stripped and "; -" in stripped:
            return True
    return False


def apply_blog_markdown(blog_root: Path) -> dict[str, int]:
    """Transform and write all *.md under blog_root where body changes."""
    stats = {"files_total": 0, "files_modified": 0, "errors": 0}
    for md_path in sorted(blog_root.rglob("*.md")):
        stats["files_total"] += 1
        try:
            original = md_path.read_text(encoding="utf-8")
        except OSError:
            stats["errors"] += 1
            continue
        frontmatter, body = split_frontmatter(original)
        if frontmatter is None:
            continue
        transformed = transform_body(body)
        updated = build_content(frontmatter, transformed)
        if updated != original:
            md_path.write_text(updated, encoding="utf-8")
            stats["files_modified"] += 1
    return stats


def scan_blog_markdown(blog_root: Path) -> dict[str, int]:
    """Dry-run all *.md under blog_root; return aggregate stats (no writes)."""
    stats = {
        "files_total": 0,
        "files_would_change": 0,
        "with_bold_bullet_subtitle": 0,
        "with_inline_semicolon_list": 0,
    }
    for md_path in sorted(blog_root.rglob("*.md")):
        stats["files_total"] += 1
        try:
            original = md_path.read_text(encoding="utf-8")
        except OSError:
            continue
        frontmatter, body = split_frontmatter(original)
        if body_has_bold_bullet_subtitle(body):
            stats["with_bold_bullet_subtitle"] += 1
        if body_has_inline_semicolon_list(body):
            stats["with_inline_semicolon_list"] += 1
        transformed = transform_body(body)
        updated = build_content(frontmatter, transformed)
        if updated != original:
            stats["files_would_change"] += 1
    return stats


def extract_section_by_heading(body: str, heading_title: str) -> str:
    """From '## Title' until next '## ' or EOF."""
    lines = body.split("\n")
    pattern = re.compile(rf"^##\s+{re.escape(heading_title)}\s*$")
    start: int | None = None
    for i, line in enumerate(lines):
        if pattern.match(line.strip()):
            start = i
            break
    if start is None:
        return ""
    end = len(lines)
    for j in range(start + 1, len(lines)):
        s = lines[j].strip()
        if s.startswith("##") and not s.startswith("###"):
            end = j
            break
    return "\n".join(lines[start:end]).strip()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fix body formatting for markdown files.")
    parser.add_argument("--file", default="", help="Target markdown file path (single-file mode)")
    parser.add_argument(
        "--scan-blog",
        action="store_true",
        help="Dry-run stats for all *.md under --blog-root (no writes unless single --apply --file)",
    )
    parser.add_argument(
        "--blog-root",
        default="src/content/blog",
        help="Root for --scan-blog (default: src/content/blog)",
    )
    parser.add_argument("--apply", action="store_true", help="Write file changes (--file or --apply-blog)")
    parser.add_argument(
        "--apply-blog",
        action="store_true",
        help="Apply formatting to all *.md under --blog-root (use with --apply)",
    )
    parser.add_argument("--print-body", action="store_true", help="Print transformed body")
    parser.add_argument(
        "--section",
        default="",
        help='If set, print only body from "## <section>" until next ## (e.g. "Come lavoriamo")',
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if args.scan_blog:
        root = Path(args.blog_root)
        if not root.is_dir():
            raise SystemExit(f"Blog root not found: {root}")
        stats = scan_blog_markdown(root)
        print("[SCAN-BLOG DRY-RUN]")
        for k, v in stats.items():
            print(f"  {k}: {v}")
        return 0

    if args.apply_blog:
        if not args.apply:
            raise SystemExit("--apply-blog requires --apply")
        root = Path(args.blog_root)
        if not root.is_dir():
            raise SystemExit(f"Blog root not found: {root}")
        stats = apply_blog_markdown(root)
        print("[APPLY-BLOG]")
        for k, v in stats.items():
            print(f"  {k}: {v}")
        return 0

    if not args.file:
        raise SystemExit("Provide --file, --scan-blog, or --apply-blog --apply")

    file_path = Path(args.file)
    if not file_path.exists():
        raise SystemExit(f"File not found: {file_path}")

    original = file_path.read_text(encoding="utf-8")
    frontmatter, body = split_frontmatter(original)
    transformed = transform_body(body)
    updated = build_content(frontmatter, transformed)

    changed = updated != original
    if args.apply and changed:
        file_path.write_text(updated, encoding="utf-8")

    mode = "APPLY" if args.apply else "DRY-RUN"
    print(f"[{mode}] changed={changed}")
    print(f"[{mode}] body_lines_before={len(body.splitlines()) or 1}")
    print(f"[{mode}] body_lines_after={len(transformed.splitlines()) or 1}")

    if args.print_body:
        print("----- BODY AFTER -----")
        to_print = transformed.rstrip("\n")
        if args.section:
            to_print = extract_section_by_heading(transformed, args.section)
            print(f"----- SECTION: ## {args.section} -----")
        print(to_print)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
