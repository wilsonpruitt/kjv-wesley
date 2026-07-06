import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const serif = EB_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "The Bible with Wesley's Notes",
  description:
    "The King James Version of the Bible, side-by-side with John Wesley's Explanatory Notes Upon the Old and New Testament. A Wroot Press edition.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} h-full antialiased`}>
      <head>
        <script defer src="/_vercel/insights/script.js"></script>
      </head>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 font-serif">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-baseline justify-between gap-4">
            <Link href="/" className="text-xl tracking-tight">
              <span className="font-semibold">The Bible</span>
              <span className="text-stone-500"> with Wesley&rsquo;s Notes</span>
            </Link>
            <div className="flex items-baseline gap-4 text-sm">
              <a
                href="https://lectern.wrootpress.com"
                className="text-stone-500 hover:text-stone-900"
              >
                Lectern
              </a>
              <a
                href="https://historyofmethodism.com"
                className="text-stone-500 hover:text-stone-900"
              >
                History of Methodism
              </a>
              <a
                href="https://wrootpress.com"
                className="text-stone-500 hover:text-stone-900"
              >
                Wroot Press
              </a>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-stone-500 flex flex-wrap gap-x-6 gap-y-1">
            <span>
              KJV text and Wesley&rsquo;s <em>Explanatory Notes</em>: public domain.
            </span>
            <span>
              Edition &copy; {new Date().getFullYear()} Wroot Press.
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
