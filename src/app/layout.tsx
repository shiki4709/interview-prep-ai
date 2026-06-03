import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Instrument_Serif } from "next/font/google";
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
        <header className="border-b border-border/50">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="font-heading text-xl tracking-tight text-foreground italic">
              HappyPrep
            </a>
            <span className="font-mono text-xs text-muted-foreground tracking-wide">
              PREP &middot; v0.4
            </span>
          </div>
        </header>
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
