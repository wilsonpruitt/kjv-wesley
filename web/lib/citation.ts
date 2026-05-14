// Parse free-form bible citations like "John 1:1-5", "1 Cor 13", "Mt 5:1-13".

export type Citation = {
  slug: string;
  name: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
};

const NAME_TO_SLUG: Record<string, string> = {};

function addName(slug: string, names: string[]) {
  for (const n of names) {
    NAME_TO_SLUG[n.toLowerCase()] = slug;
    NAME_TO_SLUG[n.toLowerCase().replace(/\./g, "")] = slug;
  }
}

addName("genesis", ["Genesis", "Gen", "Gn"]);
addName("exodus", ["Exodus", "Ex", "Exod"]);
addName("leviticus", ["Leviticus", "Lev", "Lv"]);
addName("numbers", ["Numbers", "Num", "Nm", "Nu"]);
addName("deuteronomy", ["Deuteronomy", "Deut", "Dt"]);
addName("joshua", ["Joshua", "Josh", "Jos"]);
addName("judges", ["Judges", "Judg", "Jdg"]);
addName("ruth", ["Ruth", "Ru"]);
addName("1samuel", ["1 Samuel", "1Samuel", "1 Sam", "1Sam", "1 Sm", "1Sm"]);
addName("2samuel", ["2 Samuel", "2Samuel", "2 Sam", "2Sam", "2 Sm", "2Sm"]);
addName("1kings", ["1 Kings", "1Kings", "1 Kgs", "1Kgs", "1 Ki", "1Ki"]);
addName("2kings", ["2 Kings", "2Kings", "2 Kgs", "2Kgs", "2 Ki", "2Ki"]);
addName("1chronicles", ["1 Chronicles", "1Chronicles", "1 Chr", "1Chr", "1 Ch", "1Ch"]);
addName("2chronicles", ["2 Chronicles", "2Chronicles", "2 Chr", "2Chr", "2 Ch", "2Ch"]);
addName("ezra", ["Ezra", "Ezr"]);
addName("nehemiah", ["Nehemiah", "Neh", "Ne"]);
addName("esther", ["Esther", "Est", "Esth"]);
addName("job", ["Job", "Jb"]);
addName("psalms", ["Psalms", "Psalm", "Ps", "Psa", "Pss"]);
addName("proverbs", ["Proverbs", "Prov", "Pr", "Prv"]);
addName("ecclesiastes", ["Ecclesiastes", "Eccl", "Ecc", "Qoh"]);
addName("songofsolomon", ["Song of Solomon", "Song of Songs", "Song", "Sg", "SS", "Cant", "Canticles"]);
addName("isaiah", ["Isaiah", "Isa", "Is"]);
addName("jeremiah", ["Jeremiah", "Jer", "Je"]);
addName("lamentations", ["Lamentations", "Lam", "La"]);
addName("ezekiel", ["Ezekiel", "Ezek", "Eze", "Ezk"]);
addName("daniel", ["Daniel", "Dan", "Dn"]);
addName("hosea", ["Hosea", "Hos", "Ho"]);
addName("joel", ["Joel", "Joe", "Jl"]);
addName("amos", ["Amos", "Am"]);
addName("obadiah", ["Obadiah", "Obad", "Ob"]);
addName("jonah", ["Jonah", "Jon", "Jnh"]);
addName("micah", ["Micah", "Mic", "Mi"]);
addName("nahum", ["Nahum", "Nah", "Na"]);
addName("habakkuk", ["Habakkuk", "Hab", "Hb"]);
addName("zephaniah", ["Zephaniah", "Zeph", "Zep"]);
addName("haggai", ["Haggai", "Hag", "Hg"]);
addName("zechariah", ["Zechariah", "Zech", "Zec", "Zc"]);
addName("malachi", ["Malachi", "Mal", "Ml"]);
addName("matthew", ["Matthew", "Matt", "Mt"]);
addName("mark", ["Mark", "Mk", "Mr"]);
addName("luke", ["Luke", "Lk", "Lu"]);
addName("john", ["John", "Jn", "Joh"]);
addName("acts", ["Acts", "Ac", "Act"]);
addName("romans", ["Romans", "Rom", "Ro"]);
addName("1corinthians", ["1 Corinthians", "1Corinthians", "1 Cor", "1Cor", "1 Co", "1Co"]);
addName("2corinthians", ["2 Corinthians", "2Corinthians", "2 Cor", "2Cor", "2 Co", "2Co"]);
addName("galatians", ["Galatians", "Gal", "Ga"]);
addName("ephesians", ["Ephesians", "Eph"]);
addName("philippians", ["Philippians", "Phil", "Php"]);
addName("colossians", ["Colossians", "Col"]);
addName("1thessalonians", ["1 Thessalonians", "1Thessalonians", "1 Thess", "1Thess", "1 Th", "1Th"]);
addName("2thessalonians", ["2 Thessalonians", "2Thessalonians", "2 Thess", "2Thess", "2 Th", "2Th"]);
addName("1timothy", ["1 Timothy", "1Timothy", "1 Tim", "1Tim", "1 Ti", "1Ti"]);
addName("2timothy", ["2 Timothy", "2Timothy", "2 Tim", "2Tim", "2 Ti", "2Ti"]);
addName("titus", ["Titus", "Tit"]);
addName("philemon", ["Philemon", "Phlm", "Phm"]);
addName("hebrews", ["Hebrews", "Heb"]);
addName("james", ["James", "Jas", "Jm"]);
addName("1peter", ["1 Peter", "1Peter", "1 Pet", "1Pet", "1 Pe", "1Pe"]);
addName("2peter", ["2 Peter", "2Peter", "2 Pet", "2Pet", "2 Pe", "2Pe"]);
addName("1john", ["1 John", "1John", "1 Jn", "1Jn", "1 Jo", "1Jo"]);
addName("2john", ["2 John", "2John", "2 Jn", "2Jn", "2 Jo", "2Jo"]);
addName("3john", ["3 John", "3John", "3 Jn", "3Jn", "3 Jo", "3Jo"]);
addName("jude", ["Jude", "Jud"]);
addName("revelation", ["Revelation", "Rev", "Re", "Apocalypse", "Apoc"]);

const DISPLAY_NAME: Record<string, string> = {
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
  matthew: "Matthew", mark: "Mark", luke: "Luke", john: "John", acts: "Acts",
  romans: "Romans", "1corinthians": "1 Corinthians", "2corinthians": "2 Corinthians",
  galatians: "Galatians", ephesians: "Ephesians", philippians: "Philippians",
  colossians: "Colossians", "1thessalonians": "1 Thessalonians",
  "2thessalonians": "2 Thessalonians", "1timothy": "1 Timothy", "2timothy": "2 Timothy",
  titus: "Titus", philemon: "Philemon", hebrews: "Hebrews", james: "James",
  "1peter": "1 Peter", "2peter": "2 Peter", "1john": "1 John", "2john": "2 John",
  "3john": "3 John", jude: "Jude", revelation: "Revelation",
};

const CITATION_RE =
  /^\s*((?:[123]\s*)?[a-z][a-z. ]*?)\s*(\d+)(?:\s*[:.]\s*(\d+)(?:\s*[-–—]\s*(\d+))?)?\s*$/i;

export function parseCitation(query: string): Citation | null {
  if (!query) return null;
  const m = CITATION_RE.exec(query.trim());
  if (!m) return null;
  const rawName = m[1].trim().toLowerCase().replace(/\s+/g, " ");
  const slug =
    NAME_TO_SLUG[rawName] ??
    NAME_TO_SLUG[rawName.replace(/^([123])\s+/, "$1")] ??
    NAME_TO_SLUG[rawName.replace(/\./g, "")];
  if (!slug) return null;
  const chapter = parseInt(m[2], 10);
  if (!chapter || chapter < 1) return null;
  const verseStart = m[3] ? parseInt(m[3], 10) : undefined;
  const verseEnd = m[4] ? parseInt(m[4], 10) : verseStart;
  return {
    slug,
    name: DISPLAY_NAME[slug] ?? slug,
    chapter,
    verseStart,
    verseEnd,
  };
}

export function formatCitation(c: Citation): string {
  if (c.verseStart === undefined) return `${c.name} ${c.chapter}`;
  if (c.verseEnd === undefined || c.verseEnd === c.verseStart) {
    return `${c.name} ${c.chapter}:${c.verseStart}`;
  }
  return `${c.name} ${c.chapter}:${c.verseStart}–${c.verseEnd}`;
}
