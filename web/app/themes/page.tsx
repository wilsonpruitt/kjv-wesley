import Link from "next/link";
import { loadThemes } from "@/lib/themes";

export default async function ThemesPage() {
  const themes = await loadThemes();
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-stone-500 hover:text-stone-800 underline">
          &larr; Home
        </Link>
      </nav>
      <header className="mb-10 max-w-2xl">
        <h1 className="text-3xl md:text-4xl tracking-tight mb-3">Themes</h1>
        <p className="text-stone-700 leading-relaxed">
          Phrases throughout Wesley&rsquo;s notes are{" "}
          <mark className="bg-amber-100/70 rounded-sm px-0.5">highlighted</mark>{" "}
          when they touch one of the recurring concerns of his theology. The
          21 themes below are the same set used to index the larger{" "}
          <a className="underline" href="https://corpus.historyofmethodism.com">
            Wesley Corpus
          </a>
          .
        </p>
      </header>
      <ul className="space-y-5">
        {themes.map((t) => (
          <li
            key={t.id}
            id={t.id}
            className="border-l-2 border-amber-200 pl-4 scroll-mt-6 target:border-amber-500"
          >
            <h2 className="text-lg font-medium">{t.name}</h2>
            <p className="text-sm text-stone-600 mt-1">{t.description}</p>
            <p className="mt-2 text-xs text-stone-500 font-sans">
              {t.keywords.map((k, i) => (
                <span key={k}>
                  <span className="inline-block px-1.5 py-0.5 rounded bg-stone-100 mr-1 mb-1">
                    {k}
                  </span>
                  {i < t.keywords.length - 1 ? "" : ""}
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
