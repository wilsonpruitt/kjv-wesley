# KJV + Wesley's Notes

Side-by-side web edition of the King James Bible with John Wesley's
*Explanatory Notes Upon the Old and New Testament*. Wroot Press digital
edition; eventual print companion to live in `print/`.

## Layout

```
kjv-wesley/
├── raw/                          source texts (CCEL plain text)
├── scripts/
│   ├── index_wesley_notes.py     CCEL → data/notes/<slug>.json (verse-keyed)
│   └── import_kjv.py             en_kjv.json → data/kjv/<slug>.json
├── data/
│   ├── kjv/                      66 books, 31,100 verses
│   └── notes/                    66 books, 17,920 Wesley notes
├── web/                          Next.js 16 reader
└── print/                        (future) Wroot Press companion volume
```

## Rebuilding data

```sh
# Wesley's Notes (from CCEL plain text)
python3.11 scripts/index_wesley_notes.py

# KJV (one-time fetch + import)
curl -sL -o /tmp/en_kjv.json \
  https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json
python3.11 scripts/import_kjv.py
```

## Dev server

```sh
cd web && pnpm dev --turbopack
```

Routes:

- `/` — book index (OT + NT)
- `/[book]` — book page with chapter grid + Wesley's preface
- `/[book]/[chapter]` — side-by-side reader

## Paywall

Matthew, Mark, Luke, John are free. Every other book is gated behind a
Patreon pledge of $5/month or more to
[History of Methodism](https://www.patreon.com/historyofmethodism).

Implementation: edge-runtime middleware (`web/middleware.ts`) plus a
Web Crypto HMAC-signed session cookie (`web/lib/session.ts`). Free-book
allowlist lives in both `web/middleware.ts:FREE_BOOKS` and
`web/lib/data.ts:FREE_BOOKS` — keep them in sync.

Required env vars (see `web/.env.example`):

- `PATREON_CLIENT_ID`, `PATREON_CLIENT_SECRET` — reuse the History of Methodism
  OAuth client; remember to register the deploy's callback URI
  (`/api/auth/callback`) in the Patreon developer portal.
- `SESSION_SECRET` — `openssl rand -hex 32`.
- `MIN_PLEDGE_CENTS` — default 500.
- `ADMIN_TOKEN` — owner bypass via `/api/admin/unlock?token=…`.

## Known parser limitations

- Wesley wrote no per-verse notes on some chapters (e.g., Isaiah 36, 37, 39;
  Psalms 70, 100, 117) — only synopses. The synopses are currently dropped;
  worth a v2 pass to surface per-chapter synopses.
- Sub-list disambiguation uses a heuristic (`looks_like_real_verse_leader` in
  `scripts/index_wesley_notes.py`). A small number of unusually long real
  lemmas may be wrongly merged into the previous note. Worth a future
  `tools/audit_notes.py` to flag suspicious cases.

## Data provenance

- **Wesley's Notes**: CCEL public-domain transcription (`wesley-notes-nt-ccel.txt`),
  covers the whole Bible despite the filename. Originally from
  `corpus.historyofmethodism.com` source materials.
- **KJV text**: `thiagobodruk/bible` en_kjv.json (public domain).
