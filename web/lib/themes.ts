import { readFile } from "node:fs/promises";
import path from "node:path";

export type Theme = {
  id: string;
  name: string;
  description: string;
  weight: number;
  keywords: string[];
};

const DATA_ROOT = path.join(process.cwd(), "data");

let themesCache: Theme[] | null = null;
export async function loadThemes(): Promise<Theme[]> {
  if (!themesCache) {
    const buf = await readFile(path.join(DATA_ROOT, "themes.json"), "utf8");
    themesCache = JSON.parse(buf) as Theme[];
  }
  return themesCache;
}

type Matcher = {
  regex: RegExp;
  themeByGroup: string[];
};

let matcherCache: Matcher | null = null;
async function getMatcher(): Promise<Matcher> {
  if (matcherCache) return matcherCache;
  const themes = await loadThemes();
  const seen = new Map<string, string>();
  for (const t of themes) {
    for (const kw of t.keywords) {
      const key = kw.toLowerCase();
      if (!seen.has(key)) seen.set(key, t.id);
    }
  }
  const phrases = [...seen.entries()].sort((a, b) => b[0].length - a[0].length);
  const parts: string[] = [];
  const themeByGroup: string[] = [];
  for (const [phrase, themeId] of phrases) {
    parts.push(`(${escapeRegex(phrase)})`);
    themeByGroup.push(themeId);
  }
  const regex = new RegExp(`\\b(?:${parts.join("|")})`, "gi");
  matcherCache = { regex, themeByGroup };
  return matcherCache;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type Segment = { text: string; themeId?: string };

export async function splitByThemes(text: string): Promise<Segment[]> {
  if (!text) return [];
  const { regex, themeByGroup } = await getMatcher();
  regex.lastIndex = 0;
  const out: Segment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) {
      out.push({ text: text.slice(last, m.index) });
    }
    let themeId: string | undefined;
    for (let i = 1; i < m.length; i++) {
      if (m[i] !== undefined) {
        themeId = themeByGroup[i - 1];
        break;
      }
    }
    out.push({ text: m[0], themeId });
    last = m.index + m[0].length;
    if (m[0].length === 0) regex.lastIndex++;
  }
  if (last < text.length) {
    out.push({ text: text.slice(last) });
  }
  return out;
}

export async function themeNames(): Promise<Map<string, string>> {
  const themes = await loadThemes();
  return new Map(themes.map((t) => [t.id, t.name]));
}
