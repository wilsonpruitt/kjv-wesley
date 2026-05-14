import { readFile } from "node:fs/promises";
import path from "node:path";

export type KjvRow = { b: string; c: number; v: number; t: string };
export type WesleyRow = {
  b: string;
  c: number;
  v: number;
  ve: number;
  l: string;
  t: string;
};

type Index = { kjv: KjvRow[]; wesley: WesleyRow[] };

let indexCache: Index | null = null;
async function loadIndex(): Promise<Index> {
  if (!indexCache) {
    const buf = await readFile(
      path.join(process.cwd(), "data", "search-index.json"),
      "utf8",
    );
    indexCache = JSON.parse(buf) as Index;
  }
  return indexCache;
}

export type SearchHit<T> = { row: T; snippet: string };

const SNIPPET_RADIUS = 90;

function makeSnippet(text: string, q: string): string {
  const lower = text.toLowerCase();
  const i = lower.indexOf(q.toLowerCase());
  if (i < 0) return text.slice(0, SNIPPET_RADIUS * 2);
  const start = Math.max(0, i - SNIPPET_RADIUS);
  const end = Math.min(text.length, i + q.length + SNIPPET_RADIUS);
  const prefix = start > 0 ? "… " : "";
  const suffix = end < text.length ? " …" : "";
  return prefix + text.slice(start, end) + suffix;
}

export type TextResults = {
  kjv: SearchHit<KjvRow>[];
  wesley: SearchHit<WesleyRow>[];
  kjvTotal: number;
  wesleyTotal: number;
};

export async function textSearch(query: string, limit = 50): Promise<TextResults> {
  const q = query.trim();
  if (q.length < 2) {
    return { kjv: [], wesley: [], kjvTotal: 0, wesleyTotal: 0 };
  }
  const { kjv, wesley } = await loadIndex();
  const ql = q.toLowerCase();
  const kjvHits: SearchHit<KjvRow>[] = [];
  const wesleyHits: SearchHit<WesleyRow>[] = [];
  let kjvTotal = 0;
  let wesleyTotal = 0;
  for (const row of kjv) {
    if (row.t.toLowerCase().includes(ql)) {
      kjvTotal++;
      if (kjvHits.length < limit) {
        kjvHits.push({ row, snippet: makeSnippet(row.t, q) });
      }
    }
  }
  for (const row of wesley) {
    const hayT = row.t.toLowerCase();
    const hayL = row.l.toLowerCase();
    if (hayT.includes(ql) || hayL.includes(ql)) {
      wesleyTotal++;
      if (wesleyHits.length < limit) {
        const src = hayT.includes(ql) ? row.t : row.l;
        wesleyHits.push({ row, snippet: makeSnippet(src, q) });
      }
    }
  }
  return { kjv: kjvHits, wesley: wesleyHits, kjvTotal, wesleyTotal };
}

export async function passageVerses(
  slug: string,
  chapter: number,
  start?: number,
  end?: number,
): Promise<KjvRow[]> {
  const { kjv } = await loadIndex();
  return kjv.filter((r) => {
    if (r.b !== slug || r.c !== chapter) return false;
    if (start === undefined) return true;
    return r.v >= start && r.v <= (end ?? start);
  });
}

export async function passageNotes(
  slug: string,
  chapter: number,
  start?: number,
  end?: number,
): Promise<WesleyRow[]> {
  const { wesley } = await loadIndex();
  return wesley.filter((r) => {
    if (r.b !== slug || r.c !== chapter) return false;
    if (start === undefined) return true;
    // Notes whose verse span overlaps the requested range.
    return r.ve >= start && r.v <= (end ?? start);
  });
}
