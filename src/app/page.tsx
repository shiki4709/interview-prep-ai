"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold tracking-tight">Interviews</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Paste a JD, practice with AI, get better.
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

      <div className="grid gap-4">
        {interviews.map((interview) => (
          <Link key={interview.id} href={`/interviews/${interview.id}`}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {interview.companyName}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {new Date(interview.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <CardDescription>{interview.roleName}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-xs text-muted-foreground">
                  {interview.questionCount > 0
                    ? `${interview.questionCount} question${interview.questionCount !== 1 ? "s" : ""}`
                    : "No questions generated yet"}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
