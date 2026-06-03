"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EvaluationResult } from "@/components/EvaluationResult";

interface Session {
  readonly id: number;
  readonly questionId: number;
  readonly interviewId: number;
  readonly transcription: string | null;
  readonly duration: number | null;
  readonly overallVerdict: string | null;
  readonly feedback: string | null;
  readonly createdAt: string;
  readonly questionText: string;
  readonly category: string;
  readonly companyName: string;
  readonly roleName: string;
}

const VERDICT_STYLES: Record<string, string> = {
  Outstanding: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Solid: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Borderline: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Poor: "bg-red-500/15 text-red-400 border-red-500/30",
};

const CATEGORY_COLORS: Record<string, string> = {
  behavioral: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  technical: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  situational: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "role-specific": "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<readonly Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/sessions");
        const data = await res.json();
        if (data.success) {
          setSessions(data.data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const companies = Array.from(
    new Set(sessions.map((s) => s.companyName))
  );

  const filtered =
    filter === "all"
      ? sessions
      : sessions.filter((s) => s.companyName === filter);

  async function handleDelete(sessionId: number) {
    if (deleting) return;
    setDeleting(sessionId);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (expanded === sessionId) setExpanded(null);
      }
    } finally {
      setDeleting(null);
    }
  }

  const verdictCounts = sessions.reduce<Record<string, number>>((acc, s) => {
    const v = s.overallVerdict ?? "Unrated";
    return { ...acc, [v]: (acc[v] ?? 0) + 1 };
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[11px] text-muted-foreground tracking-[0.2em] uppercase mb-4">
          Practice History
        </p>
        <h1 className="text-2xl font-heading tracking-tight">
          History
        </h1>
        <p className="text-muted-foreground mt-1">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""} across{" "}
          {companies.length} interview{companies.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Verdict summary */}
      {sessions.length > 0 && (
        <div className="flex gap-3">
          {["Outstanding", "Solid", "Borderline", "Poor"].map((v) =>
            verdictCounts[v] ? (
              <Badge
                key={v}
                variant="outline"
                className={VERDICT_STYLES[v]}
              >
                {v}: {verdictCounts[v]}
              </Badge>
            ) : null
          )}
        </div>
      )}

      {/* Company filter */}
      {companies.length > 1 && (
        <div className="flex gap-1">
          <button
            onClick={() => setFilter("all")}
            className={`text-xs px-2 py-0.5 rounded transition-colors ${
              filter === "all"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {companies.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                filter === c
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading...
        </p>
      )}

      {!loading && sessions.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No practice sessions yet. Complete a practice to see your history.
            </p>
            <Link href="/">
              <Button variant="outline">Go to Interviews</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {filtered.map((session) => {
          const isExpanded = expanded === session.id;
          const evaluation = session.feedback
            ? (JSON.parse(session.feedback) as {
                overallVerdict: string;
                strengths: string[];
                improvements: string[];
                overallFeedback: string;
                rewriteSuggestion: string;
              })
            : null;

          return (
            <div key={session.id}>
              <button
                onClick={() =>
                  setExpanded(isExpanded ? null : session.id)
                }
                className="w-full text-left"
              >
                <Card
                  className={`transition-colors ${
                    isExpanded
                      ? "border-foreground/20"
                      : "hover:bg-accent/50 cursor-pointer"
                  }`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-relaxed">
                          {session.questionText}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              CATEGORY_COLORS[
                                session.category.toLowerCase()
                              ] ?? "bg-muted text-muted-foreground"
                            }`}
                          >
                            {session.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {session.companyName} &mdash; {session.roleName}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {session.duration != null && session.duration > 0 && (
                          <span
                            className={`text-xs font-mono tabular-nums ${
                              session.duration > 210
                                ? "text-red-400"
                                : session.duration > 150
                                  ? "text-amber-400"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {formatDuration(session.duration)}
                          </span>
                        )}
                        {session.overallVerdict && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              VERDICT_STYLES[session.overallVerdict] ?? ""
                            }`}
                          >
                            {session.overallVerdict}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(session.createdAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>

              {isExpanded && evaluation && (
                <div className="mt-3 mb-4 pl-4 border-l-2 border-foreground/10">
                  <EvaluationResult
                    evaluation={evaluation}
                    transcription={session.transcription ?? ""}
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={`/interviews/${session.interviewId}/practice?questionId=${session.questionId}`}
                    >
                      <Button variant="outline" size="sm">
                        Practice Again
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                      disabled={deleting === session.id}
                      onClick={() => handleDelete(session.id)}
                    >
                      {deleting === session.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
