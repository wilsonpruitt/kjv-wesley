import Link from "next/link";
import { notFound } from "next/navigation";
import { notesManifest, loadKjvBook, loadWesleyBook } from "@/lib/data";
import { HighlightedText } from "@/components/highlighted-text";

export async function generateStaticParams() {
  const manifest = await notesManifest();
  return manifest.map((b) => ({ book: b.slug }));
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ book: string }>;
}) {
  const { book } = await params;
  const manifest = await notesManifest();
  const meta = manifest.find((b) => b.slug === book);
  if (!meta) notFound();

  const [kjv, wesley] = await Promise.all([
    loadKjvBook(book),
    loadWesleyBook(book),
  ]);

  // Note counts per chapter
  const notesPerChapter = new Map<number, number>();
  for (const n of wesley.notes) {
    notesPerChapter.set(n.chapter, (notesPerChapter.get(n.chapter) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <nav className="mb-6 text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-900">&larr; All books</Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-4xl tracking-tight">{meta.name}</h1>
        <p className="text-stone-500 mt-1">
          {kjv.chapters.length} chapter{kjv.chapters.length === 1 ? "" : "s"} &middot;{" "}
          {meta.note_count} Wesley note{meta.note_count === 1 ? "" : "s"}
        </p>
      </header>

      {wesley.intro && (
        <section className="mb-10">
          <h2 className="text-lg uppercase tracking-wide text-stone-500 font-sans mb-3">
            Wesley&rsquo;s preface
          </h2>
          <div className="text-stone-700 italic space-y-1.5 leading-snug max-w-3xl">
            {wesley.intro.split(/\n{2,}/).map((para, i) => (
              <p key={i}>
                <HighlightedText text={para} />
              </p>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg uppercase tracking-wide text-stone-500 font-sans mb-3">
          Chapters
        </h2>
        <ul className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {kjv.chapters.map((ch) => {
            const noteCount = notesPerChapter.get(ch.chapter) ?? 0;
            return (
              <li key={ch.chapter}>
                <Link
                  href={`/${book}/${ch.chapter}`}
                  className="block text-center py-3 border border-stone-200 rounded hover:border-stone-900 hover:bg-white transition tabular-nums"
                  title={`${noteCount} note${noteCount === 1 ? "" : "s"}`}
                >
                  <span className="text-lg">{ch.chapter}</span>
                  {noteCount > 0 && (
                    <span className="block text-[10px] text-stone-400 font-sans">
                      {noteCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
