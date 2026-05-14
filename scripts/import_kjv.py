#!/usr/bin/env python3.11
"""Convert thiagobodruk/bible en_kjv.json to per-book JSON keyed by our slugs.

Source: a list of 66 {name, abbrev, chapters: [[verse_text, ...], ...]}.
Output: data/kjv/<slug>.json with {slug, name, chapters: [{chapter, verses: [{verse, text}, ...]}, ...]}
"""
from __future__ import annotations

import io
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path("/tmp/en_kjv.json")
OUT_DIR = ROOT / "data" / "kjv"

# Canonical-name → slug (must match index_wesley_notes.py BOOK_TABLE)
NAME_TO_SLUG = {
    "Genesis": "genesis", "Exodus": "exodus", "Leviticus": "leviticus",
    "Numbers": "numbers", "Deuteronomy": "deuteronomy", "Joshua": "joshua",
    "Judges": "judges", "Ruth": "ruth", "1 Samuel": "1samuel",
    "2 Samuel": "2samuel", "1 Kings": "1kings", "2 Kings": "2kings",
    "1 Chronicles": "1chronicles", "2 Chronicles": "2chronicles", "Ezra": "ezra",
    "Nehemiah": "nehemiah", "Esther": "esther", "Job": "job",
    "Psalms": "psalms", "Proverbs": "proverbs", "Ecclesiastes": "ecclesiastes",
    "Song of Solomon": "songofsolomon", "Isaiah": "isaiah", "Jeremiah": "jeremiah",
    "Lamentations": "lamentations", "Ezekiel": "ezekiel", "Daniel": "daniel",
    "Hosea": "hosea", "Joel": "joel", "Amos": "amos", "Obadiah": "obadiah",
    "Jonah": "jonah", "Micah": "micah", "Nahum": "nahum", "Habakkuk": "habakkuk",
    "Zephaniah": "zephaniah", "Haggai": "haggai", "Zechariah": "zechariah",
    "Malachi": "malachi",
    "Matthew": "matthew", "Mark": "mark", "Luke": "luke", "John": "john",
    "Acts": "acts", "Romans": "romans", "1 Corinthians": "1corinthians",
    "2 Corinthians": "2corinthians", "Galatians": "galatians",
    "Ephesians": "ephesians", "Philippians": "philippians",
    "Colossians": "colossians", "1 Thessalonians": "1thessalonians",
    "2 Thessalonians": "2thessalonians", "1 Timothy": "1timothy",
    "2 Timothy": "2timothy", "Titus": "titus", "Philemon": "philemon",
    "Hebrews": "hebrews", "James": "james", "1 Peter": "1peter",
    "2 Peter": "2peter", "1 John": "1john", "2 John": "2john",
    "3 John": "3john", "Jude": "jude", "Revelation": "revelation",
}


def main() -> int:
    data = json.load(io.open(SRC, encoding="utf-8-sig"))
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = []
    for book in data:
        name = book["name"]
        slug = NAME_TO_SLUG.get(name)
        if slug is None:
            print(f"WARN: unknown book name {name!r}", file=sys.stderr)
            continue
        chapters_out = []
        for ch_idx, verses in enumerate(book["chapters"], start=1):
            chapters_out.append({
                "chapter": ch_idx,
                "verses": [
                    {"verse": v_idx, "text": text}
                    for v_idx, text in enumerate(verses, start=1)
                ],
            })
        out = {"slug": slug, "name": name, "chapters": chapters_out}
        (OUT_DIR / f"{slug}.json").write_text(
            json.dumps(out, ensure_ascii=False), encoding="utf-8"
        )
        manifest.append({
            "slug": slug, "name": name,
            "chapter_count": len(chapters_out),
            "verse_count": sum(len(c["verses"]) for c in chapters_out),
        })
    (OUT_DIR / "index.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"wrote {len(manifest)} books")
    total = sum(m["verse_count"] for m in manifest)
    print(f"total verses: {total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
