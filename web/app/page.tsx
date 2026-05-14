import Link from "next/link";
import { notesManifest, isFree } from "@/lib/data";

export default async function Home() {
  const manifest = await notesManifest();
  // Manifest ships in NT-first order (from the CCEL source). Display Bible-canonical order: OT then NT.
  const ot = manifest.filter((b) => b.testament === "OT");
  const nt = manifest.filter((b) => b.testament === "NT");

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <section className="mb-10 max-w-3xl">
        <h1 className="text-4xl md:text-5xl tracking-tight mb-4">
          The Bible with Wesley&rsquo;s Notes
        </h1>
        <p className="text-lg text-stone-700 leading-relaxed">
          The King James Bible alongside John Wesley&rsquo;s{" "}
          <em>Explanatory Notes Upon the Old and New Testament</em> &mdash; the
          founder of Methodism&rsquo;s lifelong commentary on every book of the
          Bible, brought together for the first time as a side-by-side reader.
        </p>
        <p className="mt-3 text-sm text-stone-500">
          The four Gospels are free to read. The rest of the Bible is available
          to <a className="underline" href="https://patreon.com/historyofmethodism">Patreon supporters</a>.
        </p>
        <form action="/search" method="get" className="mt-6 flex gap-2 max-w-xl">
          <input
            type="text"
            name="q"
            placeholder="John 1:1-5, perfect love, repent…"
            className="flex-1 rounded border border-stone-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
          <button
            type="submit"
            className="rounded bg-stone-800 text-white px-4 py-2 text-sm hover:bg-stone-900"
          >
            Search
          </button>
        </form>
      </section>

      <section className="mb-14 max-w-3xl border-l-2 border-stone-200 pl-6">
        <h2 className="text-sm uppercase tracking-wide text-stone-500 font-sans mb-3">
          About this edition
        </h2>
        <div className="space-y-4 text-stone-700 leading-relaxed">
          <p>
            The English Bibles printed across the seventeenth century were never
            quite uniform &mdash; corrections and errors crept in from edition
            to edition. One of the first major revisions came from John Wesley
            himself, in his <em>Explanatory Notes upon the New Testament</em>{" "}
            (1755). Wesley set the text in paragraph form rather than the
            verse-per-paragraph layout of the original King James, and where
            the German scholar Johann Albrecht Bengel&rsquo;s new Greek edition
            improved on the Textus Receptus that lay behind the KJV, Wesley
            updated the English &mdash; revising the translation in almost
            twelve thousand places.
          </p>
          <p>
            Ten years later, in 1765, Wesley published the companion{" "}
            <em>Notes upon the Old Testament</em>, an explicit abridgment of
            Matthew Henry&rsquo;s six-volume commentary alongside his own
            observations. Together the two volumes became one of the four
            doctrinal standards of early Methodism, and they remain the most
            sustained piece of biblical commentary Wesley ever wrote.
          </p>
          <p className="text-sm text-stone-500">
            For the longer story behind the text, see{" "}
            <a
              className="underline"
              href="https://historyofmethodism.com/episode-11.html"
            >
              History of Methodism, Episode 11
            </a>
            . Recurring Wesleyan concerns are{" "}
            <mark className="bg-amber-100/70 rounded-sm px-0.5">
              highlighted
            </mark>{" "}
            in the notes &mdash; see the{" "}
            <Link className="underline" href="/themes">
              themes index
            </Link>
            .
          </p>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-12">
        <BookList title="Old Testament" books={ot} prefaceHref="/preface/ot" />
        <BookList title="New Testament" books={nt} prefaceHref="/preface/nt" />
      </div>
    </div>
  );
}

function BookList({
  title,
  books,
  prefaceHref,
}: {
  title: string;
  books: Awaited<ReturnType<typeof notesManifest>>;
  prefaceHref: string;
}) {
  return (
    <section>
      <h2 className="text-2xl mb-4 border-b border-stone-200 pb-2">{title}</h2>
      <Link
        href={prefaceHref}
        className="block mb-3 px-2 -mx-2 py-2 rounded hover:bg-stone-100 text-stone-700"
      >
        <span className="text-sm uppercase tracking-wide text-stone-500 font-sans">
          Wesley&rsquo;s preface
        </span>
        <span className="ml-2 text-xs uppercase tracking-wide text-emerald-700 font-sans">
          free
        </span>
      </Link>
      <ul className="divide-y divide-stone-100">
        {books.map((b) => {
          const free = isFree(b.slug);
          return (
            <li key={b.slug}>
              <Link
                href={`/${b.slug}`}
                className="flex items-baseline justify-between py-2 hover:bg-stone-100 px-2 -mx-2 rounded"
              >
                <span className="text-lg">
                  {b.name}
                  {free && (
                    <span className="ml-2 text-xs uppercase tracking-wide text-emerald-700 font-sans">
                      free
                    </span>
                  )}
                </span>
                <span className="text-sm text-stone-400 tabular-nums">
                  {b.note_count} notes
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
