import { splitByThemes, themeNames } from "@/lib/themes";

export async function HighlightedText({ text }: { text: string }) {
  const [segments, names] = await Promise.all([
    splitByThemes(text),
    themeNames(),
  ]);
  return (
    <>
      {segments.map((seg, i) =>
        seg.themeId ? (
          <mark
            key={i}
            data-theme={seg.themeId}
            title={names.get(seg.themeId) ?? seg.themeId}
            className="bg-amber-100/70 text-stone-900 rounded-sm px-0.5 -mx-0.5 decoration-amber-300 cursor-help"
          >
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}
