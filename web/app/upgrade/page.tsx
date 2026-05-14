import Link from "next/link";
import { cookies } from "next/headers";
import { COOKIE_NAME, decodeSession } from "@/lib/session";
import { MIN_PLEDGE_CENTS } from "@/lib/patreon";

export default async function UpgradePage() {
  const c = await cookies();
  const session = await decodeSession(c.get(COOKIE_NAME)?.value);
  const minDollars = (MIN_PLEDGE_CENTS / 100).toFixed(2);
  const currentDollars = ((session?.pledge_cents ?? 0) / 100).toFixed(2);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl tracking-tight mb-4">Upgrade to read</h1>
      <p className="text-stone-700 leading-relaxed mb-3">
        Hello {session?.name ?? "Patron"} &mdash; thanks for being a supporter.
      </p>
      <p className="text-stone-700 leading-relaxed mb-6">
        Access to the Old Testament and the rest of the New Testament with
        Wesley&rsquo;s notes requires a pledge of ${minDollars}/month or
        more. Your current pledge is ${currentDollars}/month.
      </p>
      <a
        href="https://www.patreon.com/historyofmethodism"
        className="inline-block px-5 py-3 bg-stone-900 text-white rounded hover:bg-stone-700 transition font-sans"
      >
        Adjust your pledge on Patreon
      </a>
      <p className="mt-8 text-sm text-stone-500">
        <Link href="/" className="underline">&larr; Back to the Gospels (free)</Link>{" "}
        &middot;{" "}
        <a href="/api/auth/logout" className="underline">Sign out</a>
      </p>
    </div>
  );
}
