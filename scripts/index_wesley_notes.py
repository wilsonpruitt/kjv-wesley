#!/usr/bin/env python3.11
"""Parse Wesley's Explanatory Notes (CCEL plain text) into verse-keyed JSON.

Input:  raw/wesley-notes-nt-ccel.txt  (despite the filename, contains the whole Bible)
Output: data/notes/<book-slug>.json   (one file per book)
        data/notes/index.json         (manifest: book order, slugs, note counts)
"""
from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass, field, asdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "raw" / "wesley-notes-nt-ccel.txt"
OUT_DIR = ROOT / "data" / "notes"

# ---------------------------------------------------------------------------
# Book name → (slug, canonical display name, testament, ordinal)
# Header text after "NOTES ON " (uppercased, trailing period stripped).
BOOK_TABLE: list[tuple[str, str, str, str]] = [
    # NT
    ("THE GOSPEL ACCORDING TO ST. MATTHEW", "matthew", "Matthew", "NT"),
    ("THE GOSPEL ACCORDING TO ST. MARK", "mark", "Mark", "NT"),
    ("THE GOSPEL ACCORDING TO ST. LUKE", "luke", "Luke", "NT"),
    ("THE GOSPEL ACCORDING TO ST. JOHN", "john", "John", "NT"),
    ("THE ACTS OF THE APOSTLES", "acts", "Acts", "NT"),
    ("ST PAUL'S EPISTLE TO THE ROMANS", "romans", "Romans", "NT"),
    ("ST. PAUL'S FIRST EPISTLE TO THE CORINTHIANS", "1corinthians", "1 Corinthians", "NT"),
    ("ST. PAUL'S SECOND EPISTLE TO THE CORINTHIANS", "2corinthians", "2 Corinthians", "NT"),
    ("ST. PAUL'S EPISTLE TO THE GALATIANS", "galatians", "Galatians", "NT"),
    ("ST. PAUL'S EPISTLE TO THE EPHESIANS", "ephesians", "Ephesians", "NT"),
    ("ST. PAUL'S EPISTLE TO THE PHILIPPIANS", "philippians", "Philippians", "NT"),
    ("ST. PAUL'S EPISTLE TO THE COLOSSIANS", "colossians", "Colossians", "NT"),
    ("ST. PAUL'S FIRST EPISTLE TO THE THESSALONIANS", "1thessalonians", "1 Thessalonians", "NT"),
    ("ST. PAUL'S SECOND EPISTLE TO THE THESSALONIANS", "2thessalonians", "2 Thessalonians", "NT"),
    ("ST. PAUL'S FIRST EPISTLE TO TIMOTHY", "1timothy", "1 Timothy", "NT"),
    ("ST. PAUL'S SECOND EPISTLE TO TIMOTHY", "2timothy", "2 Timothy", "NT"),
    ("ST. PAUL'S EPISTLE TO TITUS", "titus", "Titus", "NT"),
    ("ST. PAUL'S EPISTLE TO PHILEMON", "philemon", "Philemon", "NT"),
    ("THE EPISTLE TO THE HEBREWS", "hebrews", "Hebrews", "NT"),
    ("THE GENERAL EPISTLE OF ST. JAMES", "james", "James", "NT"),
    ("THE FIRST EPISTLE GENERAL OF ST. PETER", "1peter", "1 Peter", "NT"),
    ("THE SECOND EPISTLE GENERAL OF ST. PETER", "2peter", "2 Peter", "NT"),
    ("THE FIRST EPISTLE OF ST. JOHN", "1john", "1 John", "NT"),
    ("THE SECOND EPISTLE OF ST. JOHN", "2john", "2 John", "NT"),
    ("THE THIRD EPISTLE OF ST. JOHN", "3john", "3 John", "NT"),
    ("THE GENERAL EPISTLE OF ST. JUDE", "jude", "Jude", "NT"),
    ("THE REVELATION OF JOHN", "revelation", "Revelation", "NT"),
    # OT
    ("THE FIRST BOOK OF MOSES CALLED GENESIS", "genesis", "Genesis", "OT"),
    ("THE SECOND BOOK OF MOSES CALLED EXODUS", "exodus", "Exodus", "OT"),
    ("THE THIRD BOOK OF MOSES CALLED LEVITICUS", "leviticus", "Leviticus", "OT"),
    ("THE FOURTH BOOK OF MOSES CALLED NUMBERS", "numbers", "Numbers", "OT"),
    ("THE FIFTH BOOK OF MOSES CALLED DEUTERONOMY", "deuteronomy", "Deuteronomy", "OT"),
    ("THE BOOK OF JOSHUA", "joshua", "Joshua", "OT"),
    ("THE BOOK OF JUDGES", "judges", "Judges", "OT"),
    ("THE BOOK OF RUTH", "ruth", "Ruth", "OT"),
    ("THE FIRST BOOK OF SAMUEL", "1samuel", "1 Samuel", "OT"),
    ("THE SECOND BOOK OF SAMUEL", "2samuel", "2 Samuel", "OT"),
    ("THE FIRST BOOK OF KINGS", "1kings", "1 Kings", "OT"),
    ("THE SECOND BOOK OF KINGS", "2kings", "2 Kings", "OT"),
    ("THE FIRST BOOK OF CHRONICLES", "1chronicles", "1 Chronicles", "OT"),
    ("THE SECOND BOOK OF CHRONICLES", "2chronicles", "2 Chronicles", "OT"),
    ("THE BOOK OF EZRA", "ezra", "Ezra", "OT"),
    ("THE BOOK OF NEHEMIAH", "nehemiah", "Nehemiah", "OT"),
    ("THE BOOK OF ESTHER", "esther", "Esther", "OT"),
    ("THE BOOK OF JOB", "job", "Job", "OT"),
    ("THE BOOK OF PSALMS", "psalms", "Psalms", "OT"),
    ("THE BOOK OF PROVERBS", "proverbs", "Proverbs", "OT"),
    ("THE BOOK OF ECCLESIASTES", "ecclesiastes", "Ecclesiastes", "OT"),
    ("THE SONG OF SOLOMON", "songofsolomon", "Song of Solomon", "OT"),
    ("THE BOOK OF ISAIAH", "isaiah", "Isaiah", "OT"),
    ("THE BOOK OF JEREMIAH", "jeremiah", "Jeremiah", "OT"),
    ("THE LAMENTATIONS OF JEREMIAH", "lamentations", "Lamentations", "OT"),
    ("THE BOOK OF EZEKIEL", "ezekiel", "Ezekiel", "OT"),
    ("THE BOOK OF DANIEL", "daniel", "Daniel", "OT"),
    ("THE BOOK OF HOSEA", "hosea", "Hosea", "OT"),
    ("THE BOOK OF JOEL", "joel", "Joel", "OT"),
    ("THE BOOK OF AMOS", "amos", "Amos", "OT"),
    ("THE BOOK OF OBADIAH", "obadiah", "Obadiah", "OT"),
    ("THE BOOK OF JONAH", "jonah", "Jonah", "OT"),
    ("THE BOOK OF MICAH", "micah", "Micah", "OT"),
    ("THE BOOK OF NAHUM", "nahum", "Nahum", "OT"),
    ("THE BOOK OF HABAKKUK", "habakkuk", "Habakkuk", "OT"),
    ("THE BOOK OF ZEPHANIAH", "zephaniah", "Zephaniah", "OT"),
    ("THE BOOK OF HAGGAI", "haggai", "Haggai", "OT"),
    ("THE BOOK OF ZECHARIAH", "zechariah", "Zechariah", "OT"),
    ("THE BOOK OF MALACHI", "malachi", "Malachi", "OT"),
]
HEADER_TO_BOOK = {h: (slug, name, test) for h, slug, name, test in BOOK_TABLE}

# ---------------------------------------------------------------------------
ROMAN_VALUE = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}


def roman_to_int(s: str) -> int:
    s = s.upper()
    total, prev = 0, 0
    for ch in reversed(s):
        v = ROMAN_VALUE[ch]
        total += -v if v < prev else v
        prev = v
    return total


# Indented roman numeral on its own line, e.g. "  III" — chapter heading.
RE_CHAPTER_ROMAN = re.compile(r"^[ ]{1,4}([IVXLCDM]+)\s*$")
# Indented arabic number on its own line, e.g. "  1" — chapter heading (Psalms).
# Accepted only when immediately preceded by a ruler, to avoid swallowing stray
# orphan verse numbers that happen to land on a blank-flanked line.
RE_CHAPTER_ARABIC = re.compile(r"^[ ]{1,4}(\d{1,3})\s*$")
# Book header: starts at col 0 with "NOTES ON".
RE_BOOK = re.compile(r"^NOTES ON (.+?)\.?\s*$")
# Verse paragraph leader: "   6. Lemma - comment..." or "   6, 7. Lemma..." or "   6-8. Lemma..."
RE_VERSE = re.compile(r"^(\d+)(?:\s*[-,]\s*(\d+))?\.\s+(.+)$", re.DOTALL)
# Ruler line (underscores) — paragraph hard-break in source.
RE_RULER = re.compile(r"^\s*_{20,}\s*$")


@dataclass
class Note:
    chapter: int
    verse_start: int
    verse_end: int
    lemma: str
    comment: str


@dataclass
class Book:
    slug: str
    name: str
    testament: str
    header: str
    intro: str = ""
    notes: list[Note] = field(default_factory=list)


def iter_paragraphs(lines: list[str]):
    """Yield (start_lineno, kind, payload) for each parsed unit.

    kinds: "book", "chapter", "ruler", "para" (joined text)
    """
    buf: list[str] = []
    buf_start = 0
    last_kind: str | None = None  # last non-blank token kind emitted

    def flushed():
        nonlocal buf, buf_start
        if buf:
            text = " ".join(buf).strip()
            buf = []
            if text:
                return (buf_start, "para", text)
        return None

    for i, raw in enumerate(lines, 1):
        line = raw.rstrip("\n")
        stripped = line.strip()

        m_book = RE_BOOK.match(line) if line[:1] != " " else None
        m_chap_roman = RE_CHAPTER_ROMAN.match(line) if stripped else None
        m_chap_arabic = RE_CHAPTER_ARABIC.match(line) if stripped else None
        is_ruler = bool(RE_RULER.match(line))
        # Arabic chapter header only if immediately preceded by a ruler (post-
        # any-intervening-blank-lines). Otherwise it's a stray orphan verse
        # number, not a heading.
        m_chap = m_chap_roman if m_chap_roman else (
            m_chap_arabic if (m_chap_arabic and last_kind == "ruler") else None
        )
        is_blank = not stripped

        if m_book or m_chap or is_ruler or is_blank:
            f = flushed()
            if f is not None:
                yield f
                last_kind = "para"
            if m_book:
                yield (i, "book", m_book.group(1).strip())
                last_kind = "book"
            elif m_chap:
                yield (i, "chapter", m_chap.group(1))
                last_kind = "chapter"
            elif is_ruler:
                yield (i, "ruler", "")
                last_kind = "ruler"
            # blank lines do not update last_kind (preserve ruler state across them)
            continue

        if not buf:
            buf_start = i
        buf.append(stripped)

    f = flushed()
    if f is not None:
        yield f


def parse_verse_para(text: str) -> Note | None:
    m = RE_VERSE.match(text)
    if not m:
        return None
    vs = int(m.group(1))
    ve = int(m.group(2)) if m.group(2) else vs
    body = m.group(3).strip()

    # Lemma split: first " - " (em-dash with spaces).
    if " - " in body:
        lemma, _, comment = body.partition(" - ")
    else:
        # Some short notes omit the dash, e.g. cross-refs only.
        lemma, comment = "", body
    return Note(
        chapter=0,  # filled by caller
        verse_start=vs,
        verse_end=ve,
        lemma=lemma.strip(),
        comment=comment.strip(),
    )


def looks_like_real_verse_leader(payload: str, n: Note) -> bool:
    """Distinguish a true Wesley verse note from an internal numbered sub-bullet.

    Wesley's real notes are short-lemma + " - " + body, e.g.
        4. They that mourn - Either for their own sins...
    Internal sub-bullets typically lack " - " or have it only deep in the body:
        4. The conclusion: giving a sure mark of the true way, warning against...
    """
    # Strip the leading "N." or "N, M." from the payload to inspect the body.
    body = RE_VERSE.match(payload).group(3).strip()
    dash_pos = body.find(" - ")
    if dash_pos < 0:
        return False  # no em-dash at all → sub-bullet
    if dash_pos > 60:
        return False  # em-dash buried deep → sub-bullet
    return True


def parse_file(path: Path) -> list[Book]:
    raw = path.read_text(encoding="utf-8", errors="replace").splitlines(keepends=False)
    books: list[Book] = []
    current: Book | None = None
    current_chapter: int | None = None
    in_intro = False
    intro_buf: list[str] = []
    max_verse_in_chapter = 0  # highest verse_start seen in current chapter
    in_sublist = False  # currently absorbing a sub-bullet list into prev note

    for lineno, kind, payload in iter_paragraphs(raw):
        if kind == "book":
            if current is not None:
                if intro_buf:
                    current.intro = "\n\n".join(intro_buf).strip()
                books.append(current)
            header = payload
            info = HEADER_TO_BOOK.get(header)
            if info is None:
                print(f"WARN line {lineno}: unknown book header: {header!r}", file=sys.stderr)
                current = None
                continue
            slug, name, test = info
            current = Book(slug=slug, name=name, testament=test, header=header)
            current_chapter = None
            in_intro = True
            intro_buf = []
            max_verse_in_chapter = 0
            in_sublist = False
            continue

        if current is None:
            continue

        if kind == "chapter":
            current_chapter = int(payload) if payload.isdigit() else roman_to_int(payload)
            in_intro = False
            max_verse_in_chapter = 0
            in_sublist = False
            continue

        if kind == "ruler":
            continue

        # kind == "para"
        note = parse_verse_para(payload)
        if note is not None:
            if current_chapter is None:
                current_chapter = 1
                in_intro = False

            # Decide: real verse leader, or a continuation of a sub-bullet list?
            is_renumber = note.verse_start <= max_verse_in_chapter
            looks_real = looks_like_real_verse_leader(payload, note)

            if is_renumber:
                # Numbering reset (sub-bullet "1." after we've already seen verse 2+).
                in_sublist = True
            elif in_sublist and not looks_real:
                # Continuing an active sublist with monotonic numbering but
                # the paragraph doesn't look like a real verse note.
                pass  # stay in sublist
            else:
                in_sublist = False

            if in_sublist and current.notes:
                current.notes[-1].comment += "\n\n" + payload
                continue

            note.chapter = current_chapter
            current.notes.append(note)
            max_verse_in_chapter = max(max_verse_in_chapter, note.verse_end)
        else:
            if in_intro:
                intro_buf.append(payload)
            elif current.notes:
                current.notes[-1].comment += " " + payload

    if current is not None:
        if intro_buf:
            current.intro = "\n\n".join(intro_buf).strip()
        books.append(current)

    return books


def write_output(books: list[Book]) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = []
    for b in books:
        out = {
            "slug": b.slug,
            "name": b.name,
            "testament": b.testament,
            "header": b.header,
            "intro": b.intro,
            "notes": [asdict(n) for n in b.notes],
        }
        (OUT_DIR / f"{b.slug}.json").write_text(
            json.dumps(out, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        chapters = sorted({n.chapter for n in b.notes})
        manifest.append(
            {
                "slug": b.slug,
                "name": b.name,
                "testament": b.testament,
                "note_count": len(b.notes),
                "chapter_count": len(chapters),
                "max_chapter": max(chapters) if chapters else 0,
            }
        )
    (OUT_DIR / "index.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return manifest


def main() -> int:
    if not SRC.exists():
        print(f"missing source: {SRC}", file=sys.stderr)
        return 1
    books = parse_file(SRC)
    manifest = write_output(books)
    print(f"parsed {len(books)} books")
    for m in manifest:
        print(f"  {m['slug']:20s}  {m['note_count']:5d} notes  {m['chapter_count']:3d} ch (max ch {m['max_chapter']})")
    total = sum(m["note_count"] for m in manifest)
    print(f"total notes: {total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
