import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const body = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "HappyPrep",
  description: "AI-powered interview practice with personalized questions and evaluation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Dark top nav bar */}
        <nav
          className="flex items-center justify-between px-4 py-2.5"
          style={{ backgroundColor: "#1b2230" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <span className="text-white font-sans font-bold text-sm">
                HappyPrep
              </span>
            </div>
            <span className="text-white/30">/</span>
            <span className="text-white/70 text-sm bg-white/10 px-3 py-1 rounded-full">
              Practice room
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-[11px] tracking-wide px-3 py-1 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
            >
              PREP &middot; v0.4
            </span>
            <button
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white/80 transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              aria-label="Help"
            >
              ?
            </button>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)" }}
            >
              HP
            </div>
          </div>
        </nav>

        {/* Sidebar + Main content */}
        <div className="flex flex-1 min-h-0">
          {/* Left sidebar */}
          <aside className="w-[200px] shrink-0 bg-background border-r border-border flex flex-col px-3 py-4">
            <Link
              href="/interviews/new"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white mb-5"
              style={{ backgroundColor: "#1b2230" }}
            >
              + New interview
            </Link>

            <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase px-2 mb-2">
              Workspace
            </p>

            <nav className="flex flex-col gap-0.5">
              <Link
                href="/"
                className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-foreground hover:bg-accent transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                Interviews
              </Link>
              <Link
                href="/history"
                className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                History
              </Link>
            </nav>

            <div className="mt-auto">
              <p className="font-mono text-[10px] text-muted-foreground px-2">
                3 interviews &middot; 26 questions
              </p>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto px-8 py-8">
            <div className="max-w-3xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
