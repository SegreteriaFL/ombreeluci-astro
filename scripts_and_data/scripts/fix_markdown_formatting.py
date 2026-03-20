#!/usr/bin/env python3
"""
Fix Markdown formatting issues in blog articles.

Default mode is dry-run: scans and simulates fixes, then writes reports.
Use --apply to write changes back to markdown files.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple


DIVI_RE = re.compile(r"\[/?et_pb[^\]]*\]", re.IGNORECASE)
AUTHOR_BIO_RE = re.compile(r"Tutti gli articoli di", re.IGNORECASE)
HTML_RESIDUE_RE = re.compile(r"<div\b|<span\b|<p\s+class", re.IGNORECASE)
HEADING_ATTACHED_RE = re.compile(r"\S\n##", re.MULTILINE)
HTML_ANY_RE = re.compile(r"<[^>]+>")


@dataclass
class FileReport:
    path: str
    changed: bool
    issues: List[str]
    max_line_before: int
    max_line_after: int
    chars_before: int
    chars_after: int


def split_frontmatter(content: str) -> Tuple[str | None, str]:
    if not content.startswith("---"):
        return None, content
    parts = content.split("---", 2)
    if len(parts) < 3:
        return None, content
    return parts[1], parts[2].lstrip("\r\n")


def normalize_whitespace(body: str) -> str:
    text = body.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip() + "\n"


def remove_legacy_footers(text: str) -> str:
    patterns = [
        r"\n?\s*Tutti gli articoli di[^\n]*\n?",
        r"\n?\s*Questo articolo e tratto da[^\n]*\n?",
        r"\n?\s*Questo articolo è tratto da[^\n]*\n?",
        r"\n?\s*Ogni mese inviamo una newsletter[^\n]*\n?",
    ]
    out = text
    for pat in patterns:
        out = re.sub(pat, "\n", out, flags=re.IGNORECASE)
    return out


def strip_divi_shortcodes(text: str) -> str:
    return DIVI_RE.sub("", text)


def convert_html_to_markdown(text: str) -> str:
    out = text
    out = re.sub(r"<br\s*/?>", "\n", out, flags=re.IGNORECASE)
    out = re.sub(r"</p\s*>", "\n\n", out, flags=re.IGNORECASE)
    out = re.sub(r"<p[^>]*>", "", out, flags=re.IGNORECASE)

    out = re.sub(r"<(strong|b)>(.*?)</\1>", r"**\2**", out, flags=re.IGNORECASE | re.DOTALL)
    out = re.sub(r"<(em|i)>(.*?)</\1>", r"*\2*", out, flags=re.IGNORECASE | re.DOTALL)

    out = re.sub(
        r"<a[^>]*href=['\"]([^'\"]+)['\"][^>]*>(.*?)</a>",
        r"[\2](\1)",
        out,
        flags=re.IGNORECASE | re.DOTALL,
    )

    # Remove container tags but keep text.
    out = re.sub(r"</?(div|span|section|article|figure|figcaption)[^>]*>", "", out, flags=re.IGNORECASE)
    # Drop any other residual tag conservatively.
    out = re.sub(r"<[^>]+>", "", out)
    return out


def normalize_structure(text: str) -> str:
    out = text
    # Ensure headings start on new paragraph.
    out = re.sub(r"(?<=\S)\s+(#{1,6}\s+)", r"\n\n\1", out)
    # Ensure blockquotes start on new paragraph.
    out = re.sub(r"(?<=\S)\s+(>\s+)", r"\n\n\1", out)
    # Ensure list items are separated.
    out = re.sub(r"(?<=[\.\:\)])\s+-\s+", r"\n- ", out)
    out = re.sub(r"(?<=[;\.])\s+(\d+\.\s+)", r"\n\1", out)
    out = re.sub(r"(?<=\S)\s+(-\s+\[[ xX]\]\s+)", r"\n\n\1", out)
    # Normalize bullets spacing.
    out = re.sub(r"\n\s*-\s+", "\n- ", out)
    return out


def split_heading_inline_text(text: str) -> str:
    """
    If a heading line (## or ###) contains trailing prose on the same line,
    move that prose below the heading with one blank line separation.
    """
    lines = text.split("\n")
    out: List[str] = []
    for line in lines:
        # Case 1: heading title ends with punctuation then trailing prose
        m = re.match(r"^(#{2,3}\s+[^.!?\n]{3,}?)([.!?])\s+(.+)$", line.strip())
        if m:
            heading = (m.group(1) + m.group(2)).strip()
            trailing = m.group(3).strip()
            # Guardrail: if heading candidate is too long, it's likely heading+prose merged.
            if len(heading) <= 120:
                out.append(heading)
                out.append("")
                out.append(trailing)
                continue
        # Case 2: heading contains inline prose without punctuation split.
        # Example: "## Cosa stiamo facendo (insieme) Il progetto ..."
        m2 = re.match(
            r"^(#{2,3}\s+.+?)\s+((?:Il|La|Lo|I|Gli|Le|Un|Una|Questo|Questa|In|Da|Per|Con|Se|Come|Dopo|Prima)\b.+)$",
            line.strip(),
        )
        if m2:
            heading = m2.group(1).strip()
            trailing = m2.group(2).strip()
            out.append(heading)
            out.append("")
            out.append(trailing)
            continue
        # Case 3: heading title closes with ")" and prose starts after it.
        m3 = re.match(
            r"^(#{2,3}\s+[^\n]*?\))\s+(.+)$",
            line.strip(),
        )
        if m3:
            heading = m3.group(1).strip()
            trailing = m3.group(2).strip()
            out.append(heading)
            out.append("")
            out.append(trailing)
            continue
        out.append(line)
    return "\n".join(out)


def split_monoblock_lines(text: str, threshold: int = 450) -> str:
    """
    Split very long single lines into paragraphs at sentence boundaries.
    Conservative heuristic to avoid over-fragmentation.
    """
    out_lines: List[str] = []
    for line in text.split("\n"):
        if len(line) < threshold:
            out_lines.append(line)
            continue
        split_line = re.sub(
            r'([.!?]["”’)\]]?)\s+(?=[A-ZÀ-ÖØ-Ý“«])',
            r"\1\n\n",
            line,
        )
        out_lines.append(split_line)
    return "\n".join(out_lines)


def apply_transformations(body: str) -> str:
    out = body
    out = strip_divi_shortcodes(out)
    out = remove_legacy_footers(out)
    out = convert_html_to_markdown(out)
    out = normalize_structure(out)
    out = split_heading_inline_text(out)
    out = split_monoblock_lines(out)
    out = normalize_whitespace(out)
    return out


def detect_issues(body: str) -> List[str]:
    issues: List[str] = []
    if DIVI_RE.search(body):
        issues.append("divi_shortcode")
    if AUTHOR_BIO_RE.search(body):
        issues.append("author_bio_footer")
    if HTML_RESIDUE_RE.search(body):
        issues.append("html_residue")
    if HEADING_ATTACHED_RE.search(body):
        issues.append("heading_attached")
    if HTML_ANY_RE.search(body):
        issues.append("html_generic")
    max_line = max((len(line) for line in body.splitlines()), default=0)
    if max_line > 500:
        issues.append("monoblock_long_line")
    return issues


def build_content(frontmatter: str | None, body: str) -> str:
    if frontmatter is None:
        return body.rstrip() + "\n"
    return f"---{frontmatter}---\n\n{body.rstrip()}\n"


def scan_files(target_dir: Path, apply: bool) -> Tuple[List[FileReport], Dict[str, int]]:
    reports: List[FileReport] = []
    counters = {
        "files_total": 0,
        "files_changed": 0,
        "issues_divi_shortcode": 0,
        "issues_author_bio_footer": 0,
        "issues_html_residue": 0,
        "issues_heading_attached": 0,
        "issues_html_generic": 0,
        "issues_monoblock_long_line": 0,
    }

    for md_file in sorted(target_dir.rglob("*.md")):
        counters["files_total"] += 1
        original = md_file.read_text(encoding="utf-8")
        frontmatter, body = split_frontmatter(original)

        issues = detect_issues(body)
        for issue in issues:
            key = f"issues_{issue}"
            if key in counters:
                counters[key] += 1

        fixed_body = apply_transformations(body)
        new_content = build_content(frontmatter, fixed_body)
        changed = new_content != original

        if changed:
            counters["files_changed"] += 1
            if apply:
                md_file.write_text(new_content, encoding="utf-8")

        reports.append(
            FileReport(
                path=str(md_file.as_posix()),
                changed=changed,
                issues=issues,
                max_line_before=max((len(line) for line in body.splitlines()), default=0),
                max_line_after=max((len(line) for line in fixed_body.splitlines()), default=0),
                chars_before=len(body),
                chars_after=len(fixed_body),
            )
        )

    return reports, counters


def write_reports(report_dir: Path, run_id: str, reports: List[FileReport], counters: Dict[str, int], apply: bool) -> Tuple[Path, Path, Path]:
    report_dir.mkdir(parents=True, exist_ok=True)
    csv_path = report_dir / f"markdown_formatting_{run_id}.csv"
    json_path = report_dir / f"markdown_formatting_{run_id}.json"
    md_path = report_dir / f"markdown_formatting_{run_id}.md"

    with csv_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "path",
                "changed",
                "issues",
                "max_line_before",
                "max_line_after",
                "chars_before",
                "chars_after",
            ]
        )
        for r in reports:
            writer.writerow(
                [
                    r.path,
                    "yes" if r.changed else "no",
                    ",".join(r.issues),
                    r.max_line_before,
                    r.max_line_after,
                    r.chars_before,
                    r.chars_after,
                ]
            )

    payload = {
        "mode": "apply" if apply else "dry-run",
        "summary": counters,
        "changed_files": [r.path for r in reports if r.changed],
    }
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    top_changed = sorted((r for r in reports if r.changed), key=lambda x: x.max_line_before, reverse=True)[:20]
    lines = [
        f"# Markdown formatting report ({'apply' if apply else 'dry-run'})",
        "",
        "## Summary",
        "",
        f"- files_total: {counters['files_total']}",
        f"- files_changed: {counters['files_changed']}",
        f"- issues_divi_shortcode: {counters['issues_divi_shortcode']}",
        f"- issues_author_bio_footer: {counters['issues_author_bio_footer']}",
        f"- issues_html_residue: {counters['issues_html_residue']}",
        f"- issues_heading_attached: {counters['issues_heading_attached']}",
        f"- issues_html_generic: {counters['issues_html_generic']}",
        f"- issues_monoblock_long_line: {counters['issues_monoblock_long_line']}",
        "",
        "## Top files by longest line (changed)",
        "",
    ]
    for r in top_changed:
        lines.append(f"- `{r.path}` | max_line_before={r.max_line_before} -> max_line_after={r.max_line_after} | issues={','.join(r.issues)}")
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    return csv_path, json_path, md_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fix markdown formatting issues in blog content.")
    parser.add_argument(
        "--target-dir",
        default="src/content/blog",
        help="Directory containing markdown files (default: src/content/blog)",
    )
    parser.add_argument(
        "--report-dir",
        default="scripts_and_data/reports",
        help="Directory to write dry-run/apply reports",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Apply changes to markdown files (default is dry-run)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    target_dir = Path(args.target_dir)
    report_dir = Path(args.report_dir)
    apply = bool(args.apply)

    if not target_dir.exists():
        raise SystemExit(f"Target directory not found: {target_dir}")

    reports, counters = scan_files(target_dir, apply=apply)
    run_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_path, json_path, md_path = write_reports(report_dir, run_id, reports, counters, apply=apply)

    mode = "APPLY" if apply else "DRY-RUN"
    print(f"[{mode}] files_total={counters['files_total']}, files_changed={counters['files_changed']}")
    print(f"[{mode}] issues_divi_shortcode={counters['issues_divi_shortcode']}")
    print(f"[{mode}] issues_author_bio_footer={counters['issues_author_bio_footer']}")
    print(f"[{mode}] issues_html_residue={counters['issues_html_residue']}")
    print(f"[{mode}] issues_heading_attached={counters['issues_heading_attached']}")
    print(f"[{mode}] issues_html_generic={counters['issues_html_generic']}")
    print(f"[{mode}] issues_monoblock_long_line={counters['issues_monoblock_long_line']}")
    print(f"[{mode}] reports:\n- {csv_path}\n- {json_path}\n- {md_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
