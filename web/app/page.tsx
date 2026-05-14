import Link from "next/link";
import { notesManifest, isFree } from "@/lib/data";

export default async function Home() {
  const manifest = await notesManifest();
  // Manifest ships in NT-first order (from the CCEL source). Display Bible-canonical order: OT then NT.
  const ot = manifest.filter((b) => b.testament === "OT");
  const nt = manifest.filter((b) => b.testament === "NT");

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <section className="mb-12 max-w-3xl">
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
      </section>

      <div className="grid md:grid-cols-2 gap-12">
        <BookList title="Old Testament" books={ot} />
        <BookList title="New Testament" books={nt} />
      </div>
    </div>
  );
}

function BookList({
  title,
  books,
}: {
  title: string;
  books: Awaited<ReturnType<typeof notesManifest>>;
}) {
  return (
    <section>
      <h2 className="text-2xl mb-4 border-b border-stone-200 pb-2">{title}</h2>
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
