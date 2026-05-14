import Link from "next/link";
import { notFound } from "next/navigation";
import {
  notesManifest,
  kjvManifest,
  loadKjvBook,
  loadWesleyBook,
  indexNotesByVerse,
} from "@/lib/data";

export async function generateStaticParams() {
  const manifest = await kjvManifest();
  const out: { book: string; chapter: string }[] = [];
  for (const m of manifest) {
    for (let c = 1; c <= m.chapter_count; c++) {
      out.push({ book: m.slug, chapter: String(c) });
    }
  }
  return out;
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}) {
  const { book, chapter: chapterStr } = await params;
  const chapter = parseInt(chapterStr, 10);
  if (!Number.isFinite(chapter) || chapter < 1) notFound();

  const manifest = await notesManifest();
  const meta = manifest.find((b) => b.slug === book);
  if (!meta) notFound();

  const [kjv, wesley] = await Promise.all([
    loadKjvBook(book),
    loadWesleyBook(book),
  ]);
  const kjvChapter = kjv.chapters.find((c) => c.chapter === chapter);
  if (!kjvChapter) notFound();

  const notesByVerse = indexNotesByVerse(wesley.notes, chapter);
  const noteCount = wesley.notes.filter((n) => n.chapter === chapter).length;

  const prevCh = chapter > 1 ? chapter - 1 : null;
  const nextCh = chapter < kjv.chapters.length ? chapter + 1 : null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <nav className="mb-6 flex items-baseline justify-between text-sm">
        <Link href={`/${book}`} className="text-stone-500 hover:text-stone-900">
          &larr; {meta.name}
        </Link>
        <div className="flex gap-4 text-stone-500">
          {prevCh && (
            <Link href={`/${book}/${prevCh}`} className="hover:text-stone-900">
              Ch. {prevCh}
            </Link>
          )}
          {nextCh && (
            <Link href={`/${book}/${nextCh}`} className="hover:text-stone-900">
              Ch. {nextCh} &rarr;
            </Link>
          )}
        </div>
      </nav>

      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl tracking-tight">
          {meta.name} {chapter}
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          {kjvChapter.verses.length} verses &middot;{" "}
          {noteCount} Wesley note{noteCount === 1 ? "" : "s"}
        </p>
      </header>

      <article className="grid md:grid-cols-2 gap-x-10 gap-y-1">
        {kjvChapter.verses.map((v) => {
          const notes = notesByVerse.get(v.verse) ?? [];
          // For multi-verse notes, only render under the first verse they span.
          const showNotes = notes.filter((n) => n.verse_start === v.verse);
          return (
            <div
              key={v.verse}
              className="contents md:[&>*]:py-2 md:[&>*]:border-b md:[&>*]:border-stone-100"
            >
              <div className="text-lg leading-relaxed">
                <sup className="text-xs text-stone-400 font-sans mr-1 tabular-nums">
                  {v.verse}
                </sup>
                {v.text}
              </div>
              <aside className="text-base text-stone-700 leading-relaxed pl-0 md:pl-4 md:border-l md:border-stone-100">
                {showNotes.length === 0 ? (
                  <span className="text-stone-300 text-sm italic font-sans">
                    &mdash;
                  </span>
                ) : (
                  showNotes.map((n, i) => (
                    <div key={i} className="mb-3 last:mb-0">
                      <span className="text-xs text-stone-400 font-sans tabular-nums">
                        v.{n.verse_start}
                        {n.verse_end !== n.verse_start && `–${n.verse_end}`}
                      </span>{" "}
                      {n.lemma && (
                        <em className="font-medium not-italic">{n.lemma}</em>
                      )}
                      {n.lemma && n.comment && (
                        <span className="text-stone-500"> &mdash; </span>
                      )}
                      <span className="whitespace-pre-line">{n.comment}</span>
                    </div>
                  ))
                )}
              </aside>
            </div>
          );
        })}
      </article>

      <nav className="mt-10 flex items-baseline justify-between text-sm text-stone-500">
        <Link href={`/${book}`} className="hover:text-stone-900">
          &larr; {meta.name}
        </Link>
        <div className="flex gap-4">
          {prevCh && (
            <Link href={`/${book}/${prevCh}`} className="hover:text-stone-900">
              Ch. {prevCh}
            </Link>
          )}
          {nextCh && (
            <Link href={`/${book}/${nextCh}`} className="hover:text-stone-900">
              Ch. {nextCh} &rarr;
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
