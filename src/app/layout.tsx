import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { Topbar } from "@/components/Topbar";
import { Sidebar } from "@/components/Sidebar";
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
  description:
    "AI-powered interview practice with personalized questions and evaluation",
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
        <Topbar />

        <div className="flex flex-1 min-h-0">
          <Sidebar />

          {/* Content area with dotted grid */}
          <main className="flex-1 min-w-0 dotted-grid">
            <div style={{ maxWidth: 880, padding: "40px 48px 130px" }}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
