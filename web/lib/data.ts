import { readFile } from "node:fs/promises";
import path from "node:path";

const DATA_ROOT = path.join(process.cwd(), "data");

export type Verse = { verse: number; text: string };
export type KjvChapter = { chapter: number; verses: Verse[] };
export type KjvBook = { slug: string; name: string; chapters: KjvChapter[] };

export type WesleyNote = {
  chapter: number;
  verse_start: number;
  verse_end: number;
  lemma: string;
  comment: string;
};
export type WesleyBook = {
  slug: string;
  name: string;
  testament: "OT" | "NT";
  header: string;
  intro: string;
  notes: WesleyNote[];
};

export type BookManifestEntry = {
  slug: string;
  name: string;
  testament: "OT" | "NT";
  note_count: number;
  chapter_count: number;
  max_chapter: number;
};

async function readJson<T>(rel: string): Promise<T> {
  const buf = await readFile(path.join(DATA_ROOT, rel), "utf8");
  return JSON.parse(buf) as T;
}

let notesManifestCache: BookManifestEntry[] | null = null;
export async function notesManifest(): Promise<BookManifestEntry[]> {
  if (!notesManifestCache) {
    notesManifestCache = await readJson<BookManifestEntry[]>("notes/index.json");
  }
  return notesManifestCache;
}

export type KjvManifestEntry = {
  slug: string;
  name: string;
  chapter_count: number;
  verse_count: number;
};
let kjvManifestCache: KjvManifestEntry[] | null = null;
export async function kjvManifest(): Promise<KjvManifestEntry[]> {
  if (!kjvManifestCache) {
    kjvManifestCache = await readJson<KjvManifestEntry[]>("kjv/index.json");
  }
  return kjvManifestCache;
}

export async function loadKjvBook(slug: string): Promise<KjvBook> {
  return readJson<KjvBook>(`kjv/${slug}.json`);
}

export async function loadWesleyBook(slug: string): Promise<WesleyBook> {
  return readJson<WesleyBook>(`notes/${slug}.json`);
}

/**
 * For a given chapter, build a verse → Wesley note(s) map.
 * Wesley notes may span multiple verses (verse_start..verse_end); attach to each.
 */
export function indexNotesByVerse(
  notes: WesleyNote[],
  chapter: number,
): Map<number, WesleyNote[]> {
  const out = new Map<number, WesleyNote[]>();
  for (const n of notes) {
    if (n.chapter !== chapter) continue;
    for (let v = n.verse_start; v <= n.verse_end; v++) {
      const arr = out.get(v) ?? [];
      arr.push(n);
      out.set(v, arr);
    }
  }
  return out;
}

export const FREE_BOOKS = new Set([
  "matthew", "mark", "luke", "john",
]);

export function isFree(slug: string): boolean {
  return FREE_BOOKS.has(slug);
}
