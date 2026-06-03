"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarStats {
  readonly interviewCount: number;
  readonly questionCount: number;
}

export function Sidebar() {
  const pathname = usePathname();
  const [stats, setStats] = useState<SidebarStats>({
    interviewCount: 0,
    questionCount: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/interviews");
        const data = await res.json();
        if (data.success) {
          const interviews = data.data as readonly {
            questionCount: number;
          }[];
          setStats({
            interviewCount: interviews.length,
            questionCount: interviews.reduce(
              (sum: number, i: { questionCount: number }) =>
                sum + i.questionCount,
              0
            ),
          });
        }
      } catch {
        // Stats are non-critical
      }
    }
    loadStats();
  }, [pathname]);

  const isInterviews =
    pathname === "/" || pathname.startsWith("/interviews");
  const isHistory = pathname.startsWith("/history");

  return (
    <aside
      className="shrink-0 flex flex-col border-r"
      style={{
        width: 222,
        background: "var(--sidebar)",
        borderColor: "var(--border)",
        padding: "16px 12px",
        position: "sticky",
        top: 52,
        height: "calc(100vh - 52px)",
      }}
    >
      {/* New interview button */}
      <Link
        href="/interviews/new"
        className="btn-design btn-design-primary"
        style={{
          width: "100%",
          height: 38,
          marginBottom: 18,
          fontSize: 13.5,
          fontWeight: 600,
          borderRadius: 8,
        }}
      >
        + New interview
      </Link>

      {/* Workspace nav group */}
      <nav className="flex flex-col gap-0.5">
        <div
          className="eyebrow"
          style={{ padding: "0 8px 6px" }}
        >
          Workspace
        </div>

        <Link
          href="/"
          className="flex items-center gap-2.5"
          style={{
            padding: "8px 9px",
            borderRadius: 8,
            fontSize: 13.5,
            fontWeight: isInterviews ? 600 : 500,
            color: isInterviews
              ? "var(--foreground)"
              : "var(--text-2)",
            background: isInterviews ? "var(--accent)" : "transparent",
            textDecoration: "none",
            transition: "background 0.12s, color 0.12s",
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              flexShrink: 0,
              border: "1.6px solid currentColor",
              borderRadius: 3,
              opacity: 0.65,
            }}
          />
          Interviews
        </Link>

        <Link
          href="/history"
          className="flex items-center gap-2.5"
          style={{
            padding: "8px 9px",
            borderRadius: 8,
            fontSize: 13.5,
            fontWeight: isHistory ? 600 : 500,
            color: isHistory
              ? "var(--foreground)"
              : "var(--text-2)",
            background: isHistory ? "var(--accent)" : "transparent",
            textDecoration: "none",
            transition: "background 0.12s, color 0.12s",
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              flexShrink: 0,
              border: "1.6px solid currentColor",
              borderRadius: "50%",
              opacity: 0.65,
            }}
          />
          History
        </Link>
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer stats */}
      <div
        style={{
          padding: "0 9px",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.08em",
          color: "var(--text-3)",
        }}
      >
        {stats.interviewCount} interview{stats.interviewCount !== 1 ? "s" : ""}{" "}
        &middot; {stats.questionCount} question
        {stats.questionCount !== 1 ? "s" : ""}
      </div>
    </aside>
  );
}
