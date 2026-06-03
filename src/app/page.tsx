"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface InterviewSummary {
  readonly id: number;
  readonly companyName: string;
  readonly roleName: string;
  readonly generatedAt: string | null;
  readonly createdAt: string;
  readonly questionCount: number;
}

const TAG_COLORS = ["tag-blue", "tag-green", "tag-purple", "tag-amber"] as const;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HomePage() {
  const [interviews, setInterviews] = useState<readonly InterviewSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/interviews");
        const data = await res.json();
        if (data.success) {
          setInterviews(data.data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalQuestions = interviews.reduce(
    (sum, i) => sum + i.questionCount,
    0
  );

  return (
    <div>
      {/* Page head */}
      <div className="page-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Practice room
          </div>
          <h1 className="display" style={{ fontSize: 42 }}>
            Interviews<span className="dim">, ready when you are.</span>
          </h1>
          <p
            style={{
              color: "var(--text-2)",
              fontSize: 14,
              marginTop: 10,
              maxWidth: "48ch",
            }}
          >
            Paste a job description, get tailored questions, and rehearse out
            loud until the answers feel like yours.
          </p>
        </div>
        <Link href="/interviews/new" className="btn-design btn-design-primary">
          + New interview
        </Link>
      </div>

      {/* Stat line */}
      {!loading && interviews.length > 0 && (
        <div className="stat-line">
          {interviews.length} INTERVIEW{interviews.length !== 1 ? "S" : ""}{" "}
          &middot; {totalQuestions} QUESTION
          {totalQuestions !== 1 ? "S" : ""}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <p
          style={{
            fontSize: 14,
            color: "var(--text-3)",
            marginTop: 32,
          }}
          className="animate-pulse"
        >
          Loading...
        </p>
      )}

      {/* Empty state */}
      {!loading && interviews.length === 0 && (
        <div
          style={{
            border: "1px dashed var(--border)",
            borderRadius: 12,
            padding: "40px 24px",
            marginTop: 32,
          }}
        >
          <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 4 }}>
            Nothing here yet.
          </p>
          <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 20 }}>
            Create your first interview to start practicing.
          </p>
          <Link
            href="/interviews/new"
            className="btn-design btn-design-ghost"
          >
            Create Interview
          </Link>
        </div>
      )}

      {/* Interview list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {interviews.map((interview, index) => (
          <Link
            key={interview.id}
            href={`/interviews/${interview.id}`}
            className="irow"
          >
            {/* Index */}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--text-3)",
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            {/* Company + Role */}
            <div>
              <div
                className="display"
                style={{ fontSize: 22, lineHeight: 1.05 }}
              >
                {interview.companyName}
              </div>
              <div
                style={{
                  color: "var(--text-2)",
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                {interview.roleName}
              </div>
            </div>

            {/* Meta cluster: pill + date + arrow */}
            <div className="flex items-center" style={{ gap: 14 }}>
              {interview.questionCount > 0 && (
                <span
                  className={`tag ${TAG_COLORS[index % TAG_COLORS.length]}`}
                >
                  {interview.questionCount} question
                  {interview.questionCount !== 1 ? "s" : ""}
                </span>
              )}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11.5,
                  color: "var(--text-3)",
                }}
              >
                {formatDate(interview.createdAt)}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 15,
                  color: "var(--text-3)",
                }}
              >
                &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
