import Link from "next/link";
import { parseCitation, formatCitation, Citation } from "@/lib/citation";
import { textSearch, passageVerses, passageNotes } from "@/lib/search";
import { HighlightedText } from "@/components/highlighted-text";

export const dynamic = "force-dynamic";

const NAME_LOOKUP: Record<string, string> = {
  matthew: "Matthew", mark: "Mark", luke: "Luke", john: "John", acts: "Acts",
  romans: "Romans", "1corinthians": "1 Corinthians", "2corinthians": "2 Corinthians",
  galatians: "Galatians", ephesians: "Ephesians", philippians: "Philippians",
  colossians: "Colossians", "1thessalonians": "1 Thessalonians",
  "2thessalonians": "2 Thessalonians", "1timothy": "1 Timothy", "2timothy": "2 Timothy",
  titus: "Titus", philemon: "Philemon", hebrews: "Hebrews", james: "James",
  "1peter": "1 Peter", "2peter": "2 Peter", "1john": "1 John", "2john": "2 John",
  "3john": "3 John", jude: "Jude", revelation: "Revelation",
  genesis: "Genesis", exodus: "Exodus", leviticus: "Leviticus", numbers: "Numbers",
  deuteronomy: "Deuteronomy", joshua: "Joshua", judges: "Judges", ruth: "Ruth",
  "1samuel": "1 Samuel", "2samuel": "2 Samuel", "1kings": "1 Kings", "2kings": "2 Kings",
  "1chronicles": "1 Chronicles", "2chronicles": "2 Chronicles", ezra: "Ezra",
  nehemiah: "Nehemiah", esther: "Esther", job: "Job", psalms: "Psalms",
  proverbs: "Proverbs", ecclesiastes: "Ecclesiastes", songofsolomon: "Song of Solomon",
  isaiah: "Isaiah", jeremiah: "Jeremiah", lamentations: "Lamentations", ezekiel: "Ezekiel",
  daniel: "Daniel", hosea: "Hosea", joel: "Joel", amos: "Amos", obadiah: "Obadiah",
  jonah: "Jonah", micah: "Micah", nahum: "Nahum", habakkuk: "Habakkuk",
  zephaniah: "Zephaniah", haggai: "Haggai", zechariah: "Zechariah", malachi: "Malachi",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const citation = parseCitation(query);
  const results = query.length >= 2 ? await textSearch(query, 40) : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-stone-500 hover:text-stone-800 underline">
          &larr; Home
        </Link>
      </nav>
      <header className="mb-8">
        <h1 className="text-3xl tracking-tight mb-3">Search</h1>
        <SearchForm initial={query} />
        <p className="mt-3 text-sm text-stone-500">
          Type a passage like <em>John 1:1-5</em> or <em>Matt 5</em>, or search
          for words across the KJV and Wesley&rsquo;s notes.
        </p>
      </header>

      {!query && (
        <p className="text-stone-500 italic">Type a query above to begin.</p>
      )}

      {citation && <PassageCard citation={citation} />}

      {results && (results.kjvTotal > 0 || results.wesleyTotal > 0) && (
        <section className="mt-10">
          <h2 className="text-lg uppercase tracking-wide text-stone-500 font-sans mb-4">
            Word matches
          </h2>
          {results.kjvTotal > 0 && (
            <div className="mb-8">
              <h3 className="text-base font-medium mb-3">
                KJV &middot;{" "}
                <span className="text-stone-500 font-normal">
                  {results.kjvTotal} match{results.kjvTotal === 1 ? "" : "es"}
                  {results.kjv.length < results.kjvTotal &&
                    ` (showing first ${results.kjv.length})`}
                </span>
              </h3>
              <ul className="space-y-2">
                {results.kjv.map((h, i) => (
                  <li key={i}>
                    <Link
                      href={`/${h.row.b}/${h.row.c}#v${h.row.v}`}
                      className="block py-1.5 px-3 -mx-3 rounded hover:bg-stone-100"
                    >
                      <span className="text-sm text-stone-500 font-sans">
                        {NAME_LOOKUP[h.row.b] ?? h.row.b} {h.row.c}:{h.row.v}
                      </span>
                      <span className="block text-stone-800">{h.snippet}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {results.wesleyTotal > 0 && (
            <div>
              <h3 className="text-base font-medium mb-3">
                Wesley&rsquo;s notes &middot;{" "}
                <span className="text-stone-500 font-normal">
                  {results.wesleyTotal} match
                  {results.wesleyTotal === 1 ? "" : "es"}
                  {results.wesley.length < results.wesleyTotal &&
                    ` (showing first ${results.wesley.length})`}
                </span>
              </h3>
              <ul className="space-y-2">
                {results.wesley.map((h, i) => (
                  <li key={i}>
                    <Link
                      href={`/${h.row.b}/${h.row.c}#v${h.row.v}`}
                      className="block py-1.5 px-3 -mx-3 rounded hover:bg-stone-100"
                    >
                      <span className="text-sm text-stone-500 font-sans">
                        {NAME_LOOKUP[h.row.b] ?? h.row.b} {h.row.c}:
                        {h.row.v}
                        {h.row.ve !== h.row.v && `–${h.row.ve}`}
                      </span>
                      <span className="block text-stone-800">
                        {h.row.l && (
                          <em className="not-italic font-medium">
                            {h.row.l}
                          </em>
                        )}
                        {h.row.l && " — "}
                        <HighlightedText text={h.snippet} linkify={false} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {results && results.kjvTotal === 0 && results.wesleyTotal === 0 && !citation && (
        <p className="mt-8 text-stone-500 italic">
          No matches for &ldquo;{query}&rdquo;.
        </p>
      )}
    </div>
  );
}

function SearchForm({ initial }: { initial: string }) {
  return (
    <form action="/search" method="get" className="flex gap-2 max-w-2xl">
      <input
        type="text"
        name="q"
        defaultValue={initial}
        placeholder="John 1:1-5, perfect love, repent…"
        autoFocus
        className="flex-1 rounded border border-stone-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-amber-200"
      />
      <button
        type="submit"
        className="rounded bg-stone-800 text-white px-4 py-2 text-sm hover:bg-stone-900"
      >
        Search
      </button>
    </form>
  );
}

async function PassageCard({ citation }: { citation: Citation }) {
  const verses = await passageVerses(
    citation.slug,
    citation.chapter,
    citation.verseStart,
    citation.verseEnd,
  );
  if (verses.length === 0) {
    return (
      <p className="mt-2 text-stone-500 italic">
        No such passage: {formatCitation(citation)}.
      </p>
    );
  }
  const notes = await passageNotes(
    citation.slug,
    citation.chapter,
    citation.verseStart,
    citation.verseEnd,
  );
  const chapterHref = `/${citation.slug}/${citation.chapter}${
    citation.verseStart ? `#v${citation.verseStart}` : ""
  }`;
  return (
    <section className="mb-10 border border-stone-200 rounded-lg overflow-hidden">
      <header className="bg-stone-50 px-5 py-3 border-b border-stone-200 flex items-baseline justify-between">
        <h2 className="text-xl tracking-tight">{formatCitation(citation)}</h2>
        <Link href={chapterHref} className="text-sm underline text-stone-600">
          Open chapter &rarr;
        </Link>
      </header>
      <div className="px-5 py-4">
        <ol className="space-y-1.5">
          {verses.map((v) => (
            <li key={v.v} className="text-lg leading-relaxed">
              <sup className="text-xs text-stone-400 font-sans mr-1 tabular-nums">
                {v.v}
              </sup>
              {v.t}
            </li>
          ))}
        </ol>
        <div className="mt-5 pt-4 border-t border-stone-100">
          <h3 className="text-sm uppercase tracking-wide text-stone-500 font-sans mb-3">
            Wesley&rsquo;s notes on this passage{" "}
            <span className="text-stone-400 normal-case tracking-normal">
              ({notes.length})
            </span>
          </h3>
          {notes.length === 0 ? (
            <p className="text-sm text-stone-500 italic">
              Wesley does not comment on these verses.
            </p>
          ) : (
            <ul className="space-y-3">
              {notes.map((n, i) => (
                <li key={i} className="text-stone-800 leading-relaxed">
                  <span className="text-xs text-stone-400 font-sans tabular-nums mr-2">
                    v.{n.v}
                    {n.ve !== n.v && `–${n.ve}`}
                  </span>
                  {n.l && (
                    <em className="font-medium not-italic">{n.l}</em>
                  )}
                  {n.l && " — "}
                  <HighlightedText text={n.t} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
