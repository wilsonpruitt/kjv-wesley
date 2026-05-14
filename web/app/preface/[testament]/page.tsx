import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPrefaces } from "@/lib/data";

const TITLES: Record<string, { full: string; short: string }> = {
  nt: { full: "Wesley's Preface to the New Testament", short: "New Testament" },
  ot: { full: "Wesley's Preface to the Old Testament", short: "Old Testament" },
};

export function generateStaticParams() {
  return [{ testament: "nt" }, { testament: "ot" }];
}

export default async function PrefacePage({
  params,
}: {
  params: Promise<{ testament: string }>;
}) {
  const { testament } = await params;
  const meta = TITLES[testament];
  if (!meta) notFound();

  const prefaces = await loadPrefaces();
  const body = testament === "nt" ? prefaces.nt : prefaces.ot;
  if (!body) notFound();

  const paragraphs = body.split(/\n{2,}/);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-stone-500 hover:text-stone-800 underline">
          &larr; Home
        </Link>
      </nav>
      <header className="mb-10">
        <p className="text-sm uppercase tracking-wide text-stone-500 font-sans mb-2">
          Preface to the {meta.short}
        </p>
        <h1 className="text-3xl md:text-4xl tracking-tight">{meta.full}</h1>
        <p className="mt-3 text-sm text-stone-500">
          From John Wesley&rsquo;s <em>Explanatory Notes Upon the {meta.short}</em>.
        </p>
      </header>
      <article className="prose-wesley space-y-4 text-stone-800 leading-relaxed">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>
    </div>
  );
}
