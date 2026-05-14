#!/usr/bin/env python3.11
"""Flatten KJV + Wesley notes into a single search index for /search.

Output: web/data/search-index.json
        { kjv:    [{ b: slug, c: chapter, v: verse, t: text }, ...],
          wesley: [{ b: slug, c: chapter, v: verse_start, ve: verse_end,
                     l: lemma, t: comment }, ...] }

Per-request server-side substring search is fine at this size (~50k rows).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KJV_DIR = ROOT / "web" / "data" / "kjv"
NOTES_DIR = ROOT / "web" / "data" / "notes"
OUT = ROOT / "web" / "data" / "search-index.json"


def main() -> int:
    kjv_manifest = json.loads((KJV_DIR / "index.json").read_text(encoding="utf-8"))
    notes_manifest = json.loads((NOTES_DIR / "index.json").read_text(encoding="utf-8"))

    kjv_rows = []
    for m in kjv_manifest:
        slug = m["slug"]
        book = json.loads((KJV_DIR / f"{slug}.json").read_text(encoding="utf-8"))
        for ch in book["chapters"]:
            for v in ch["verses"]:
                kjv_rows.append(
                    {"b": slug, "c": ch["chapter"], "v": v["verse"], "t": v["text"]}
                )

    wesley_rows = []
    for m in notes_manifest:
        slug = m["slug"]
        book = json.loads((NOTES_DIR / f"{slug}.json").read_text(encoding="utf-8"))
        for n in book["notes"]:
            wesley_rows.append(
                {
                    "b": slug,
                    "c": n["chapter"],
                    "v": n["verse_start"],
                    "ve": n["verse_end"],
                    "l": n["lemma"],
                    "t": n["comment"],
                }
            )

    OUT.write_text(
        json.dumps({"kjv": kjv_rows, "wesley": wesley_rows}, ensure_ascii=False),
        encoding="utf-8",
    )
    size_mb = OUT.stat().st_size / 1024 / 1024
    print(f"kjv rows: {len(kjv_rows)}, wesley rows: {len(wesley_rows)}")
    print(f"wrote {OUT} ({size_mb:.1f} MB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
