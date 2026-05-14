#!/usr/bin/env python3.11
"""Import Wesleyan themes from the wesley-corpus project into kjv-wesley.

Source: ~/wesley-corpus/metadata/themes.csv (22 themes, each with a comma-
separated list of keyword phrases).

Output: web/data/themes.json — an ordered list of themes ready for the
highlighter to consume.
"""
from __future__ import annotations

import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path.home() / "wesley-corpus" / "metadata" / "themes.csv"
OUT = ROOT / "web" / "data" / "themes.json"


def main() -> int:
    if not SRC.exists():
        print(f"missing source: {SRC}", file=sys.stderr)
        return 1

    themes = []
    with SRC.open(encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            keywords = [k.strip() for k in row["keywords"].split(",") if k.strip()]
            themes.append(
                {
                    "id": row["theme_id"].strip(),
                    "name": row["theme_name"].strip(),
                    "description": row["description"].strip(),
                    "weight": float(row["weight"]),
                    "keywords": keywords,
                }
            )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(themes, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    total_kw = sum(len(t["keywords"]) for t in themes)
    print(f"wrote {len(themes)} themes ({total_kw} keyword phrases) → {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
