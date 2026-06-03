"use client";

import { usePathname } from "next/navigation";

const CRUMBS: Record<string, string> = {
  "/": "Practice room",
  "/interviews/new": "New interview",
  "/history": "History",
};

function getCrumb(pathname: string): string {
  if (CRUMBS[pathname]) return CRUMBS[pathname];
  if (pathname.startsWith("/interviews/") && pathname.includes("/practice")) {
    return "Practice";
  }
  if (pathname.startsWith("/interviews/")) {
    return "Interview";
  }
  return "Practice room";
}

export function Topbar() {
  const pathname = usePathname();
  const crumb = getCrumb(pathname);

  return (
    <header
      className="flex items-center shrink-0"
      style={{
        height: 52,
        background: "var(--chrome)",
        padding: "0 16px",
        gap: 12,
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Logo mark + wordmark */}
      <div className="flex items-center" style={{ gap: 9 }}>
        {/* Mark: rounded square with 4 ascending bars */}
        <div
          className="flex items-end justify-center"
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: "var(--chrome-text)",
            gap: 2.4,
            padding: "6px 5.5px",
          }}
        >
          <i
            style={{
              display: "block",
              width: 2.5,
              height: 6,
              borderRadius: 2,
              background: "var(--chrome)",
            }}
          />
          <i
            style={{
              display: "block",
              width: 2.5,
              height: 12,
              borderRadius: 2,
              background: "var(--chrome)",
            }}
          />
          <i
            style={{
              display: "block",
              width: 2.5,
              height: 8,
              borderRadius: 2,
              background: "var(--chrome)",
            }}
          />
          <i
            style={{
              display: "block",
              width: 2.5,
              height: 5,
              borderRadius: 2,
              background: "var(--chrome)",
            }}
          />
        </div>
        <span
          style={{
            fontSize: 14.5,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "var(--chrome-text)",
          }}
        >
          HappyPrep
        </span>
      </div>

      {/* Separator */}
      <span style={{ color: "var(--chrome-text-2)", opacity: 0.5 }}>/</span>

      {/* Breadcrumb pill */}
      <span
        className="flex items-center"
        style={{
          gap: 7,
          padding: "4px 10px",
          borderRadius: 7,
          fontSize: 13,
          color: "var(--chrome-text)",
          background: "oklch(1 0 0 / 0.06)",
        }}
      >
        {crumb}
        <span
          style={{ color: "var(--chrome-text-2)", fontSize: 11 }}
        >
          &#8964;
        </span>
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Version pill */}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.06em",
          padding: "3px 8px",
          borderRadius: 100,
          background: "oklch(0.55 0.16 256 / 0.22)",
          color: "oklch(0.82 0.10 256)",
        }}
      >
        PREP &middot; v0.4
      </span>

      {/* Help button */}
      <button
        style={{
          width: 30,
          height: 30,
          borderRadius: 7,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          background: "transparent",
          color: "var(--chrome-text-2)",
          cursor: "pointer",
          fontSize: 14,
        }}
        title="Help"
      >
        ?
      </button>

      {/* Avatar */}
      <div
        className="flex items-center justify-center"
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, oklch(0.6 0.13 40), oklch(0.55 0.14 20))",
          fontSize: 11,
          fontWeight: 600,
          color: "white",
        }}
      >
        HP
      </div>
    </header>
  );
}
