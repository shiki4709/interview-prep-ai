"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

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
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-heading tracking-tight">
              Interviews, <em>ready when you are.</em>
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg">
              Paste a JD, get tailored questions, and rehearse out loud until the answers feel like yours.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/history">
              <Button variant="outline" size="default" className="h-11 px-5">Past Sessions</Button>
            </Link>
            <Link href="/interviews/new">
              <Button size="default" className="h-11 px-5">New Interview</Button>
            </Link>
          </div>
        </div>
        {!loading && interviews.length > 0 && (
          <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
            {interviews.length} interview{interviews.length !== 1 ? "s" : ""} &middot; {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading...
        </p>
      )}

      {!loading && interviews.length === 0 && (
        <div className="border border-dashed border-border rounded-md px-6 py-10">
          <p className="text-sm text-muted-foreground mb-1">
            Nothing here yet.
          </p>
          <p className="text-sm text-muted-foreground mb-5">
            Create your first interview to start practicing.
          </p>
          <Link href="/interviews/new">
            <Button variant="outline" className="h-11 px-5">Create Interview</Button>
          </Link>
        </div>
      )}

      <div className="grid gap-3">
        {interviews.map((interview, index) => (
          <Link key={interview.id} href={`/interviews/${interview.id}`}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="py-4 flex items-center gap-5">
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
                    {interview.questionCount} Q{interview.questionCount !== 1 ? "s" : ""}
                  </span>
                )}
                <span className="font-mono text-xs text-muted-foreground">
                  {new Date(interview.createdAt).toLocaleDateString()}
                </span>
                <span className="text-muted-foreground">&rarr;</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
