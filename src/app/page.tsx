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

  const totalQuestions = interviews.reduce((sum, i) => sum + i.questionCount, 0);

  return (
    <div className="space-y-8">
      {/* Section label */}
      <p className="font-mono text-[11px] text-muted-foreground tracking-[0.2em] uppercase">
        Practice Room
      </p>

      {/* Hero heading */}
      <div className="space-y-4">
        <h1 className="text-[3rem] leading-[1.1] tracking-tight">
          <span className="font-heading">Interviews,</span>{" "}
          <em className="font-heading text-muted-foreground">ready when you are.</em>
        </h1>

        <div className="flex items-start justify-between gap-6">
          <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
            Paste a job description, get tailored questions, and rehearse out loud
            until the answers feel like yours.
          </p>
          <Link
            href="/interviews/new"
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: "#1b2230" }}
          >
            + New interview
          </Link>
        </div>
      </div>

      {/* Stats */}
      {!loading && interviews.length > 0 && (
        <p className="font-mono text-[11px] text-muted-foreground tracking-[0.2em] uppercase">
          {interviews.length} interview{interviews.length !== 1 ? "s" : ""} &middot; {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading...
        </p>
      )}

      {/* Empty state */}
      {!loading && interviews.length === 0 && (
        <div className="border border-dashed border-border rounded-lg px-6 py-10">
          <p className="text-sm text-muted-foreground mb-1">
            Nothing here yet.
          </p>
          <p className="text-sm text-muted-foreground mb-5">
            Create your first interview to start practicing.
          </p>
          <Link
            href="/interviews/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-accent transition-colors"
          >
            Create Interview
          </Link>
        </div>
      )}

      {/* Interview cards */}
      <div className="grid gap-3">
        {interviews.map((interview, index) => (
          <Link key={interview.id} href={`/interviews/${interview.id}`}>
            <div className="flex items-center gap-5 px-5 py-4 bg-card border border-border rounded-lg hover:border-foreground/20 transition-colors cursor-pointer">
              <span className="font-mono text-sm text-muted-foreground w-6 shrink-0">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-base tracking-tight">
                  {interview.companyName}
                </p>
                <p className="text-sm text-muted-foreground">{interview.roleName}</p>
              </div>
              {interview.questionCount > 0 && (
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {interview.questionCount} question{interview.questionCount !== 1 ? "s" : ""}
                </span>
              )}
              <span className="font-mono text-xs text-muted-foreground">
                {new Date(interview.createdAt).toLocaleDateString()}
              </span>
              <span className="text-muted-foreground">&rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
