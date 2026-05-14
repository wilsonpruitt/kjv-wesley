import Link from "next/link";
import { splitByThemes, themeNames } from "@/lib/themes";

export async function HighlightedText({
  text,
  linkify = true,
}: {
  text: string;
  linkify?: boolean;
}) {
  const [segments, names] = await Promise.all([
    splitByThemes(text),
    themeNames(),
  ]);
  return (
    <>
      {segments.map((seg, i) => {
        if (!seg.themeId) return <span key={i}>{seg.text}</span>;
        const title = `Wesleyan theme: ${names.get(seg.themeId) ?? seg.themeId}`;
        if (linkify) {
          return (
            <Link
              key={i}
              href={`/themes#${seg.themeId}`}
              title={title}
              data-theme={seg.themeId}
              className="bg-amber-100/70 hover:bg-amber-200/80 text-stone-900 rounded-sm px-0.5 -mx-0.5 no-underline"
            >
              {seg.text}
            </Link>
          );
        }
        return (
          <mark
            key={i}
            title={title}
            data-theme={seg.themeId}
            className="bg-amber-100/70 text-stone-900 rounded-sm px-0.5 -mx-0.5"
          >
            {seg.text}
          </mark>
        );
      })}
    </>
  );
}
