import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl tracking-tight mb-4">Sign in to read</h1>
      <p className="text-stone-700 leading-relaxed mb-6">
        The four Gospels are free. The rest of the Bible (with Wesley&rsquo;s
        notes on every book) is open to supporters of{" "}
        <a
          className="underline"
          href="https://www.patreon.com/historyofmethodism"
        >
          History of Methodism on Patreon
        </a>{" "}
        at any tier of $5/month or more.
      </p>
      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}
      <a
        href="/api/auth/login"
        className="inline-block px-5 py-3 bg-stone-900 text-white rounded hover:bg-stone-700 transition font-sans"
      >
        Sign in with Patreon
      </a>
      <p className="mt-8 text-sm text-stone-500">
        <Link href="/" className="underline">
          &larr; Back to the Gospels (free)
        </Link>
      </p>
    </div>
  );
}
